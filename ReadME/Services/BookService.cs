using System.Net.Http.Json;
using System.Net.Http;
using ReadME.Models;
using System.Text.Json;
using System.Net.NetworkInformation;
using VersOne.Epub;
using Microsoft.Maui.Storage;

namespace ReadME.Services
{
    public class BookService
    {
        private readonly HttpClient _httpClient;
        private const string BaseUrl = "http://10.0.2.2:3000/api";
        private const int TimeoutSeconds = 10;
        private readonly string _booksDirectory;

        public BookService()
        {
            _httpClient = new HttpClient
            {
                Timeout = TimeSpan.FromSeconds(TimeoutSeconds)
            };
            _booksDirectory = Path.Combine(FileSystem.AppDataDirectory, "books");
            Directory.CreateDirectory(_booksDirectory);
        }

        private bool IsNetworkAvailable()
        {
            try
            {
                return NetworkInterface.GetIsNetworkAvailable();
            }
            catch
            {
                return false;
            }
        }

        private async Task<string> GetCoverImagePath(string epubPath)
        {
            try
            {
                if (!File.Exists(epubPath))
                {
                    Console.WriteLine($"EPUB file not found: {epubPath}");
                    return "library.jpg";
                }

                var epubBook = await EpubReader.ReadBookAsync(epubPath);
                if (epubBook.ReadingOrder.Count > 0)
                {
                    var firstItem = epubBook.ReadingOrder[0];
                    if (firstItem.ContentType == EpubContentType.IMAGE_JPEG || firstItem.ContentType == EpubContentType.IMAGE_PNG)
                    {
                        var coverPath = Path.Combine(_booksDirectory, Path.GetFileNameWithoutExtension(epubPath) + "_cover.jpg");
                        if (!File.Exists(coverPath))
                        {
                            Console.WriteLine($"Cover image not found at: {coverPath}");
                            return "library.jpg";
                        }
                        return coverPath;
                    }
                }
                Console.WriteLine("No cover image found in EPUB");
                return "library.jpg";
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error extracting cover from EPUB: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return "library.jpg";
            }
        }

        public async Task<List<Book>> GetBooksAsync()
        {
            try
            {
                if (!IsNetworkAvailable())
                {
                    throw new Exception("No network connection available");
                }

                Console.WriteLine($"Attempting to fetch books from {BaseUrl}/books");
                var response = await _httpClient.GetAsync($"{BaseUrl}/books");
                var content = await response.Content.ReadAsStringAsync();
                Console.WriteLine($"Response status: {response.StatusCode}");
                Console.WriteLine($"Response content: {content}");

                if (!response.IsSuccessStatusCode)
                {
                    throw new Exception($"API returned {response.StatusCode}: {content}");
                }

                var apiResponse = JsonSerializer.Deserialize<ApiResponse<List<Book>>>(content, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                if (apiResponse?.Data == null)
                {
                    Console.WriteLine("API response data is null");
                    return new List<Book>();
                }

                // Process each book to get its cover image
                foreach (var book in apiResponse.Data)
                {
                    var epubPath = Path.Combine(_booksDirectory, book.Titre + ".epub");
                    if (File.Exists(epubPath))
                    {
                        book.LienImage = await GetCoverImagePath(epubPath);
                    }
                    else
                    {
                        book.LienImage = "library.jpg";
                    }
                }

                Console.WriteLine($"Successfully retrieved {apiResponse.Data.Count} books");
                return apiResponse.Data;
            }
            catch (HttpRequestException ex)
            {
                Console.WriteLine($"Network error fetching books: {ex.Message}");
                throw new Exception("Unable to connect to the server. Please check your network connection.");
            }
            catch (TaskCanceledException)
            {
                Console.WriteLine("Request timed out");
                throw new Exception($"Request timed out after {TimeoutSeconds} seconds");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching books: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                throw;
            }
        }

        public async Task<List<Category>> GetCategoriesAsync()
        {
            try
            {
                if (!IsNetworkAvailable())
                {
                    throw new Exception("No network connection available");
                }

                Console.WriteLine($"Attempting to fetch categories from {BaseUrl}/categories");
                var response = await _httpClient.GetAsync($"{BaseUrl}/categories");
                var content = await response.Content.ReadAsStringAsync();
                Console.WriteLine($"Response status: {response.StatusCode}");
                Console.WriteLine($"Response content: {content}");

                if (!response.IsSuccessStatusCode)
                {
                    throw new Exception($"API returned {response.StatusCode}: {content}");
                }

                var categories = JsonSerializer.Deserialize<List<Category>>(content, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                if (categories == null)
                {
                    Console.WriteLine("API response data is null");
                    return new List<Category>();
                }

                Console.WriteLine($"Successfully retrieved {categories.Count} categories");
                return categories;
            }
            catch (HttpRequestException ex)
            {
                Console.WriteLine($"Network error fetching categories: {ex.Message}");
                throw new Exception("Unable to connect to the server. Please check your network connection.");
            }
            catch (TaskCanceledException)
            {
                Console.WriteLine("Request timed out");
                throw new Exception($"Request timed out after {TimeoutSeconds} seconds");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching categories: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                throw;
            }
        }

        public async Task<Book> GetBookByIdAsync(int id)
        {
            try
            {
                if (!IsNetworkAvailable())
                {
                    throw new Exception("No network connection available");
                }

                Console.WriteLine($"Attempting to fetch book with ID: {id} from {BaseUrl}/books/{id}");
                var response = await _httpClient.GetAsync($"{BaseUrl}/books/{id}");
                var content = await response.Content.ReadAsStringAsync();
                Console.WriteLine($"Response status: {response.StatusCode}");
                Console.WriteLine($"Response content: {content}");

                if (!response.IsSuccessStatusCode)
                {
                    throw new Exception($"API returned {response.StatusCode}: {content}");
                }

                var apiResponse = JsonSerializer.Deserialize<ApiResponse<Book>>(content, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                if (apiResponse?.Data == null)
                {
                    Console.WriteLine("API response data is null");
                    return null;
                }

                var epubPath = Path.Combine(_booksDirectory, apiResponse.Data.Titre + ".epub");
                if (File.Exists(epubPath))
                {
                    apiResponse.Data.LienImage = await GetCoverImagePath(epubPath);
                }
                else
                {
                    apiResponse.Data.LienImage = "library.jpg";
                }

                Console.WriteLine($"Successfully retrieved book: {apiResponse.Data.Titre}");
                return apiResponse.Data;
            }
            catch (HttpRequestException ex)
            {
                Console.WriteLine($"Network error fetching book: {ex.Message}");
                throw new Exception("Unable to connect to the server. Please check your network connection.");
            }
            catch (TaskCanceledException)
            {
                Console.WriteLine("Request timed out");
                throw new Exception($"Request timed out after {TimeoutSeconds} seconds");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching book: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                throw;
            }
        }
        public async Task<byte[]> GetBookEpubAsync(int bookId)
        {
            try
            {
                if (!IsNetworkAvailable())
                {
                    throw new Exception("No network connection available");
                }

                var url = $"{BaseUrl}/books/{bookId}/epub";
                var response = await _httpClient.GetAsync(url);

                if (response.IsSuccessStatusCode)
                {
                    return await response.Content.ReadAsByteArrayAsync();
                }
                else
                {
                    return null;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching EPUB: {ex.Message}");
                return null;
            }
        }

        public async Task<HttpResponseMessage> DownloadBookEpubResponseAsync(int bookId)
        {
            if (!IsNetworkAvailable())
                throw new Exception("No network connection available");

            var url = $"{BaseUrl}/books/{bookId}/epub";
            var response = await _httpClient.GetAsync(url);
            return response;
        }
    }

    public class ApiResponse<T>
    {
        public string Message { get; set; }
        public T Data { get; set; }
    }
} 