using ReadME.Models;
using ReadME.Services;

namespace ReadME
{
    public partial class BookDetailsPage : ContentPage
    {
        // Variables privées pour le service, l'ID, l'état de chargement et le livre
        private readonly BookService _bookService;
        private readonly int _bookId;
        private bool _isLoading;
        private Book _book;

        // Propriété pour accéder et modifier le livre
        public Book Book
        {
            get => _book;
            set
            {
                _book = value;
                OnPropertyChanged();
            }
        }

        // Constructeur prenant l'ID du livre
        public BookDetailsPage(int bookId)
        {
            // Initialisation de l'interface
            InitializeComponent();
            // Création du service de gestion des livres
            _bookService = new BookService();
            // Stockage de l'ID du livre
            _bookId = bookId;
            // Définition du contexte de liaison
            BindingContext = this;
            // Chargement des détails
            LoadBookDetails();
        }

        // Chargement asynchrone des détails du livre
        private async void LoadBookDetails()
        {
            if (_isLoading) return;

            _isLoading = true;
            try
            {
                // Récupération du livre par son ID
                var book = await _bookService.GetBookByIdAsync(_bookId);
                if (book != null)
                {
                    Book = book;
                }
                else
                {
                    // Alerte en cas d'échec
                    await DisplayAlert("Erreur", "Impossible de charger les détails du livre.", "OK");
                    await Navigation.PopAsync();
                }
            }
            catch (Exception ex)
            {
                // Gestion des erreurs
                await DisplayAlert("Erreur", $"Une erreur est survenue: {ex.Message}", "OK");
                await Navigation.PopAsync();
            }
            finally
            {
                _isLoading = false;
            }
        }

        // Gestion du bouton de retour
        private async void OnBackButtonClicked(object sender, EventArgs e)
        {
            await Navigation.PopAsync();
        }

        // Gestion du clic pour lire l'EPUB
        private async void OnReadEpubClicked(object sender, EventArgs e)
        {
            try
            {
                // Affichage de l'indicateur de chargement
                LoadingIndicator.IsVisible = true;
                ReadEpubButton.IsEnabled = false;
                ReadEpubButton.Text = "Téléchargement...";

                // Journalisation du téléchargement
                Console.WriteLine($"Tentative de téléchargement de l'EPUB pour le livre ID: {_bookId}");
                Console.WriteLine($"Titre du livre: {Book?.Titre}");

                // Téléchargement du fichier EPUB
                var response = await _bookService.DownloadBookEpubResponseAsync(_bookId);
                Console.WriteLine($"Statut de la réponse HTTP: {response.StatusCode}");
                var responseContent = await response.Content.ReadAsStringAsync();
                Console.WriteLine($"Contenu de la réponse: {responseContent}");

                // Vérification du statut
                if (!response.IsSuccessStatusCode)
                {
                    var errorMessage = $"EPUB non disponible.\nCode: {response.StatusCode}\nRéponse: {responseContent}";
                    await DisplayAlert("Erreur", errorMessage, "OK");
                    return;
                }

                // Vérification de la taille
                var contentLength = response.Content.Headers.ContentLength;
                Console.WriteLine($"Taille du contenu: {contentLength}");
                if (contentLength == 0)
                {
                    await DisplayAlert("Erreur", "Le fichier EPUB est vide.", "OK");
                    return;
                }

                // Préparation du nom de fichier
                var safeTitle = string.Concat(Book.Titre.Split(Path.GetInvalidFileNameChars()));
                var tempPath = Path.Combine(FileSystem.CacheDirectory, $"{safeTitle}.epub");
                Console.WriteLine($"Sauvegarde de l'EPUB à: {tempPath}");

                // Sauvegarde du fichier
                using (var fs = new FileStream(tempPath, FileMode.Create, FileAccess.Write))
                {
                    await response.Content.CopyToAsync(fs);
                }

                // Vérification du fichier sauvegardé
                var fileInfo = new FileInfo(tempPath);
                Console.WriteLine($"EPUB sauvegardé - Taille: {fileInfo.Length} bytes");
                if (fileInfo.Length == 0)
                {
                    await DisplayAlert("Erreur", "Le fichier EPUB téléchargé est vide.", "OK");
                    return;
                }

                // Navigation vers le lecteur EPUB
                var encodedPath = Uri.EscapeDataString(tempPath);
                await Shell.Current.GoToAsync($"epubreader?file={encodedPath}");
            }
            catch (Exception ex)
            {
                // Journalisation et affichage de l'erreur
                Console.WriteLine($"Exception dans OnReadEpubClicked: {ex.Message}");
                Console.WriteLine($"Trace de la pile: {ex.StackTrace}");
                await DisplayAlert("Erreur", $"Impossible d'ouvrir l'EPUB: {ex.Message}", "OK");
            }
            finally
            {
                // Réinitialisation de l'interface
                LoadingIndicator.IsVisible = false;
                ReadEpubButton.IsEnabled = true;
                ReadEpubButton.Text = "📖 Lire l'EPUB";
            }
        }
    }
}