import { readdir } from "node:fs/promises";
import { extname, join } from "node:path";
import { FileOption } from "./types.js";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

export async function getFilePathByOS() {
  if (process.platform === "darwin") {
    const { stdout } = await execFileAsync("osascript", [
      "-e",
      'POSIX path of (choose file of type {"com.adobe.pdf", "org.openxmlformats.wordprocessingml.document"})',
    ]);

    return stdout.trim() || null;
  }

  if (process.platform === "win32") {
    const command = `
      Add-Type -AssemblyName System.Windows.Forms
      $f = New-Object System.Windows.Forms.OpenFileDialog
      $f.Filter = "Documents (*.pdf;*.docx)|*.pdf;*.docx"
      if ($f.ShowDialog() -eq 'OK') {
        $f.FileName
      }
    `;

    const { stdout } = await execFileAsync("powershell", ["-Command", command]);

    return stdout.trim() || null;
  }

  throw new Error(`Unsupported operating system: ${process.platform}`);
}

function isPdfOrDocxFile(file: string) {
  const ext = extname(file).toLowerCase();
  return ext === ".pdf" || ext === ".docx";
}

export async function getDeviceFiles(...dirs: string[]) {
  const fileOptions: FileOption[] = [];
  for (const dir of dirs) {
    const dirFiles = await readdir(dir);
    const pdfAndDocxFiles = dirFiles.filter((file) => isPdfOrDocxFile(file));
    const dirFileOptions: FileOption[] = pdfAndDocxFiles.map((file) => ({
      value: join(dir, file),
      label: file,
    }));
    fileOptions.push(...dirFileOptions);
  }
  return fileOptions;
}
