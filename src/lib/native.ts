// Bits that only apply inside the Android app (Capacitor). On the website they do nothing.
import { Capacitor } from "@capacitor/core";

export const isApp = () => Capacitor.isNativePlatform();

/** A short tap of vibration, for moments like flipping a card. */
export function haptic(kind: "light" | "success" = "light") {
  if (!isApp()) return;
  import("@capacitor/haptics").then(({ Haptics, ImpactStyle, NotificationType }) =>
    kind === "success"
      ? Haptics.notification({ type: NotificationType.Success })
      : Haptics.impact({ style: ImpactStyle.Light }),
  ).catch(() => {});
}
