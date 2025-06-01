using VersOne.Epub;

namespace YourApp.Helpers
{
    public class EpubReader
    {
        public static async Task<EpubBook> ReadEpubAsync(string filePath)
        {
            try
            {
                return await EpubReader.ReadBookAsync(filePath);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erreur lors de la lecture du fichier EPUB: {ex.Message}");
                throw;
            }
        }

        public static async Task<string> GetEpubContentAsync(string filePath)
        {
            var book = await ReadEpubAsync(filePath);
            var content = new System.Text.StringBuilder();

            foreach (var chapter in book.ReadingOrder)
            {
                content.AppendLine(await chapter.GetContentAsync());
            }

            return content.ToString();
        }
    }
} 