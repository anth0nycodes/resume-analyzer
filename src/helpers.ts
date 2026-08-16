import { readdir } from "node:fs/promises";
import { extname, join } from "node:path";
import { FileOption } from "./types.js";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

export function getEditorInfo() {
  const fallback = process.platform === "win32" ? "notepad" : "vi";
  const command = process.env.VISUAL || process.env.EDITOR || fallback;
  const name = command.split(/[\\/]/).pop()?.toLowerCase() ?? command;

  const saveHints: Record<string, string> = {
    vi: "press Esc, then type :wq and Enter",
    vim: "press Esc, then type :wq and Enter",
    nvim: "press Esc, then type :wq and Enter",
    nano: "press Ctrl+O, Enter to save, then Ctrl+X to exit",
    pico: "press Ctrl+O, Enter to save, then Ctrl+X to exit",
    emacs: "press Ctrl+X then Ctrl+S to save, then Ctrl+X then Ctrl+C to exit",
    notepad: "save with Ctrl+S, then close the window",
    "notepad.exe": "save with Ctrl+S, then close the window",
    code: "save with Ctrl+S, then close the tab (or window)",
  };

  const saveHint = saveHints[name] ?? "save and close the editor to continue";
  return { name, saveHint };
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
