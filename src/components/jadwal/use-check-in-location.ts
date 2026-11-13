"use client";

import { useEffect, useState } from "react";

import { cekLokasiCheckIn } from "@/services/schedule.service";

// Sama dengan batas backend; di atas APPROXIMATE biasanya izin "lokasi perkiraan".
export const MAX_GPS_ACCURACY = 300;
const APPROXIMATE_GPS_ACCURACY = 500;
const CHECK_INTERVAL_MS = 4000;

export type LocationPhase =
  | "idle"
  | "searching"
  | "approximate"
  | "weak"
  | "checking"
  | "outside"
  | "ready"
  | "denied"
  | "unavailable"
  | "blocked";

export interface Reading {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export interface CheckInLocation {
  phase: LocationPhase;
  accuracy: number | null;
  message: string | null;
  // Pembacaan terakhir yang dinyatakan siap oleh server.
  position: Reading | null;
}

const IDLE: CheckInLocation = {
  phase: "idle",
  accuracy: null,
  message: null,
  position: null,
};

/**
 * Memantau GPS peserta selama tombol absensi bisa dipakai dan menanyakan
 * ke server (tanpa menyimpan absensi) apakah lokasi sudah memenuhi.
 */
export function useCheckInLocation(
  idJadwal: number | undefined,
  token: string | null,
  enabled: boolean
): CheckInLocation {
  const [state, setState] = useState<CheckInLocation>(IDLE);

  useEffect(() => {
    if (!enabled || !idJadwal || !token) {
      setState(IDLE);
      return;
    }

    if (!navigator.geolocation) {
      setState({ ...IDLE, phase: "unavailable" });
      return;
    }

    let cancelled = false;
    let latest: Reading | null = null;
    let lastChecked: Reading | null = null;
    let inFlight = false;

    setState({ ...IDLE, phase: "searching" });

    const check = async () => {
      const reading = latest;

      if (!reading || reading === lastChecked || inFlight) return;
      if (reading.accuracy > MAX_GPS_ACCURACY) return;

      inFlight = true;
      lastChecked = reading;

      setState((current) =>
        current.phase === "ready" || current.phase === "outside"
          ? current
          : { ...current, phase: "checking", accuracy: reading.accuracy }
      );

      try {
        const { data } = await cekLokasiCheckIn(
          {
            id_jadwal: idJadwal,
            latitude: reading.latitude,
            longitude: reading.longitude,
            location_accuracy: reading.accuracy,
          },
          token
        );

        if (cancelled) return;

        setState({
          phase: data.siap
            ? "ready"
            : data.kode === "OUTSIDE_RADIUS"
              ? "outside"
              : "weak",
          accuracy: reading.accuracy,
          message: data.pesan,
          position: data.siap ? reading : null,
        });
      } catch (error) {
        if (cancelled) return;

        setState({
          phase: "blocked",
          accuracy: reading.accuracy,
          message:
            error instanceof Error
              ? error.message
              : "Lokasi belum dapat diperiksa.",
          position: null,
        });
      } finally {
        inFlight = false;
      }
    };

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const reading = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };
        const wasUnusable = !latest || latest.accuracy > MAX_GPS_ACCURACY;

        latest = reading;

        if (reading.accuracy > MAX_GPS_ACCURACY) {
          setState({
            phase:
              reading.accuracy > APPROXIMATE_GPS_ACCURACY
                ? "approximate"
                : "weak",
            accuracy: reading.accuracy,
            message: null,
            position: null,
          });
          return;
        }

        // Pembacaan pertama yang layak langsung diperiksa; berikutnya lewat interval.
        if (wasUnusable) void check();
        else setState((current) => ({ ...current, accuracy: reading.accuracy }));
      },
      (error) => {
        if (cancelled) return;

        if (error.code === error.PERMISSION_DENIED) {
          setState({ ...IDLE, phase: "denied" });
          return;
        }

        // Timeout / sinyal hilang: watch tetap berjalan, cukup tunggu pembacaan berikutnya.
        if (!latest) {
          setState({
            ...IDLE,
            phase: error.code === error.POSITION_UNAVAILABLE ? "unavailable" : "searching",
          });
        }
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
    );

    const interval = setInterval(() => void check(), CHECK_INTERVAL_MS);

    return () => {
      cancelled = true;
      navigator.geolocation.clearWatch(watchId);
      clearInterval(interval);
    };
  }, [enabled, idJadwal, token]);

  return state;
}
