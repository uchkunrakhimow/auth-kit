import { Request } from "express";

export interface DeviceInfo {
  deviceName?: string;
  deviceType?: string;
  userAgent?: string;
  ipAddress?: string;
}

export const extractDeviceInfo = (req: Request): DeviceInfo => {
  const userAgent = req.get("user-agent") || undefined;
  const ipAddress =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.socket.remoteAddress ||
    undefined;

  let deviceType: string | undefined;
  let deviceName: string | undefined;

  if (userAgent) {
    if (/mobile|android|iphone|ipad/i.test(userAgent)) {
      deviceType = "mobile";
    } else if (/tablet|ipad/i.test(userAgent)) {
      deviceType = "tablet";
    } else {
      deviceType = "desktop";
    }

    const browserMatch = userAgent.match(
      /(chrome|firefox|safari|edge|opera)[\/\s](\d+)/
    );
    const osMatch = userAgent.match(/(windows|mac|linux|android|ios)/i);

    if (browserMatch && osMatch) {
      deviceName = `${osMatch[0]} - ${browserMatch[0]}`;
    } else if (osMatch) {
      deviceName = osMatch[0];
    } else {
      deviceName = "Unknown Device";
    }
  }

  return {
    deviceName,
    deviceType,
    userAgent,
    ipAddress,
  };
};

