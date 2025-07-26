import { Injectable } from "@nestjs/common";
import { createCanvas } from "canvas";
import { AvatarInitialsOptions } from "./avatar.interface";

@Injectable()
export class AvatarService {
  constructor() {}

  private generateHsl() {
    function randomInt(min: number, max: number) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    const hRange = [0, 360];
    const sRange = [50, 75];
    const lRange = [25, 60];

    const h = randomInt(hRange[0], hRange[1]);
    const s = randomInt(sRange[0], sRange[1]);
    const l = randomInt(lRange[0], lRange[1]);

    return `hsl(${h}, ${s}%, ${l}%)`;
  }

  private createCanvas(width: number, height: number) {
    const canvas = createCanvas(width, height);
    return canvas;
  }

  private getInitials(name: string) {
    return name[0].toUpperCase();
  }

  async generateAvatar(
    name: string,
    options?: Partial<AvatarInitialsOptions>,
  ): Promise<Buffer> {
    const initials = this.getInitials(name);

    const canvas = this.createCanvas(
      options?.width ?? 200,
      options?.height ?? 200,
    );
    const ctx = canvas.getContext("2d");

    // Draw background
    ctx.fillStyle = options?.background ?? `${this.generateHsl()}`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw text
    ctx.fillStyle = options?.fontColor ?? "white";
    ctx.font = options?.font ?? "bold 80px Arial";

    const textWidth = ctx.measureText(initials).width;
    const textHeight = ctx.measureText(initials).actualBoundingBoxAscent;

    const x = (canvas.width - textWidth) / 2;
    const y = (canvas.height + textHeight) / 2;

    ctx.fillText(initials, x, y);

    const buffer = canvas.toBuffer("image/png");
    return buffer;
  }
}
