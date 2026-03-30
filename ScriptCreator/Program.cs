using System.Diagnostics;

var scriptForgeDir = Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "..", "scriptforge");
scriptForgeDir = Path.GetFullPath(scriptForgeDir);

if (!Directory.Exists(scriptForgeDir))
{
    Console.Error.WriteLine($"ScriptForge directory not found: {scriptForgeDir}");
    return;
}

Console.WriteLine("===========================================");
Console.WriteLine("  ⚡ ScriptForge — Script Editor & Macro Builder");
Console.WriteLine("===========================================");
Console.WriteLine();
Console.WriteLine($"Project directory: {scriptForgeDir}");
Console.WriteLine();

var nodeModules = Path.Combine(scriptForgeDir, "node_modules");
if (!Directory.Exists(nodeModules))
{
    Console.WriteLine("Installing dependencies (npm install)...");
    Console.WriteLine();
    var install = Process.Start(new ProcessStartInfo
    {
        FileName = "npm",
        Arguments = "install",
        WorkingDirectory = scriptForgeDir,
        UseShellExecute = false,
    });
    install?.WaitForExit();

    if (install?.ExitCode != 0)
    {
        Console.Error.WriteLine("npm install failed. Make sure Node.js is installed.");
        return;
    }

    Console.WriteLine();
}

Console.WriteLine("Starting dev server (npm run dev)...");
Console.WriteLine("Press Ctrl+C to stop.");
Console.WriteLine();

var dev = Process.Start(new ProcessStartInfo
{
    FileName = "npm",
    Arguments = "run dev",
    WorkingDirectory = scriptForgeDir,
    UseShellExecute = false,
});

dev?.WaitForExit();
