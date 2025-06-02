using Microsoft.Extensions.Logging;
using ReadME.Services;
using ReadME.ViewModels;

namespace ReadME;

public static class MauiProgram
{
    public static MauiApp CreateMauiApp()
    {
        var builder = MauiApp.CreateBuilder();
        builder
            .UseMauiApp<App>()
            .ConfigureFonts(fonts =>
            {
                fonts.AddFont("OpenSans-Regular.ttf", "OpenSansRegular");
                fonts.AddFont("OpenSans-Semibold.ttf", "OpenSansSemibold");
            });

        // Register Services
        builder.Services.AddSingleton<BookService>();

 



#if DEBUG
        builder.Logging.AddDebug();
#endif

        return builder.Build();
    }
}
