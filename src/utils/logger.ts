export class Logger {
  private static formatTimestamp(): string {
    return new Date().toISOString();
  }

  static info(message: string, ...args: any[]): void {
    console.log(`[${this.formatTimestamp()}] ℹ️  INFO: ${message}`, ...args);
  }

  static error(message: string, ...args: any[]): void {
    console.error(`[${this.formatTimestamp()}] ❌ ERROR: ${message}`, ...args);
  }

  static warn(message: string, ...args: any[]): void {
    console.warn(`[${this.formatTimestamp()}] ⚠️  WARN: ${message}`, ...args);
  }

  static success(message: string, ...args: any[]): void {
    console.log(`[${this.formatTimestamp()}] ✅ SUCCESS: ${message}`, ...args);
  }

  static debug(message: string, ...args: any[]): void {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${this.formatTimestamp()}] 🔍 DEBUG: ${message}`, ...args);
    }
  }
}
