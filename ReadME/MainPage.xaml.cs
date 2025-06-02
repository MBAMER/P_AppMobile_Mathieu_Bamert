using ReadME.Models;
using ReadME.Services;
using System.Collections.ObjectModel;
using System.Windows.Input;

namespace ReadME
{
    public partial class MainPage : ContentPage
    {
        // Déclaration du service pour gérer les livres
        private readonly BookService _bookService;
        // Collection observable pour stocker les livres en vedette
        public ObservableCollection<Book> FeaturedBooks { get; set; }
        private bool _isLoading;
        private bool _hasError;
        private string _errorMessage;

        // Commande pour gérer le tap sur un livre
        public ICommand BookTappedCommand { get; }

        // Constructeur de la page principale
        public MainPage()
        {
            InitializeComponent();
            _bookService = new BookService();
            FeaturedBooks = new ObservableCollection<Book>();
            _errorMessage = string.Empty;
            BookTappedCommand = new Command<Book>(OnBookTapped);
            BindingContext = this;
            LoadFeaturedBooks();
        }

        // Gestion du tap sur un livre
        private async void OnBookTapped(Book book)
        {
            if (book != null)
            {
                // Navigation vers la page de détails du livre
                await Navigation.PushAsync(new BookDetailsPage(book.LivreId));
            }
        }

        // Chargement des livres en vedette
        private async void LoadFeaturedBooks()
        {
            if (_isLoading) return;

            try
            {
                _isLoading = true;
                _hasError = false;
                _errorMessage = string.Empty;

                // Affichage de l'indicateur de chargement
                IsBusy = true;

                // Récupération des livres via le service
                var books = await _bookService.GetBooksAsync();

                if (books == null || !books.Any())
                {
                    _hasError = true;
                    _errorMessage = "Aucun livre n'a été trouvé.";
                    await DisplayAlert("Information", _errorMessage, "OK");
                    return;
                }

                FeaturedBooks.Clear();
                foreach (var book in books)
                {
                    FeaturedBooks.Add(book);
                }
            }
            catch (Exception ex)
            {
                _hasError = true;
                _errorMessage = $"Impossible de charger les livres: {ex.Message}";
                await DisplayAlert("Erreur", _errorMessage, "OK");
            }
            finally
            {
                _isLoading = false;
                IsBusy = false;
            }
        }

        // Méthode pour actualiser la liste des livres
        public async void RefreshBooks()
        {
            await Task.Run(() => LoadFeaturedBooks());
        }
    }
}