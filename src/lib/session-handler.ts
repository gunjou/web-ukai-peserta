import Swal from "sweetalert2";
import { clearAuth } from "./auth";

let isHandling = false;

export function handleSessionInvalid() {
  if (isHandling) return;
  isHandling = true;

  clearAuth();

  Swal.fire({
    icon: "warning",
    title: "Session Berakhir",
    text: "Akun Anda login di perangkat lain",
    confirmButtonText: "OK",
    confirmButtonColor: "#d38c0e",
  }).then(() => {
    window.location.href = "/login";
  });
}
