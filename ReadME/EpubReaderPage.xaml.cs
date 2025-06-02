using Microsoft.Maui.Controls;
using System;
using System.IO;
using System.Threading.Tasks;
using VersOne.Epub;
using System.Collections.Generic;
using System.Linq;

namespace ReadME
{
    public partial class EpubReaderPage : ContentPage, IQueryAttributable
    {
        private EpubBook? _epubBook;
        private List<EpubTextContentFile>? _chapters;
        private int _currentChapterIndex = 0;
        private double _fontSize = 14;

        // Constructeur de la page
        public EpubReaderPage()
        {
            InitializeComponent();
        }

        // Gestion des attributs de requête pour le chemin du fichier
        public async void ApplyQueryAttributes(IDictionary<string, object> query)
        {
            if (query.TryGetValue("file", out var epubPathObj) && epubPathObj is string epubPath)
            {
                var decodedPath = Uri.UnescapeDataString(epubPath);
                await LoadEpubFile(decodedPath);
            }
        }

        // Chargement et traitement du fichier EPUB
        private async Task LoadEpubFile(string filePath)
        {
            try
            {
                LoadingFrame.IsVisible = true;

                if (!File.Exists(filePath))
                {
                    await DisplayAlert("Erreur", "Fichier EPUB introuvable.", "OK");
                    await Shell.Current.GoToAsync("..");
                    return;
                }

                _epubBook = await EpubReader.ReadBookAsync(filePath);
                _chapters = _epubBook.Content.Html.Values.ToList();

                if (_chapters.Count == 0)
                {
                    await DisplayAlert("Erreur", "Aucun contenu HTML trouvé dans l'EPUB.", "OK");
                    await Shell.Current.GoToAsync("..");
                    return;
                }

                BookTitleLabel.Text = _epubBook.Title ?? "Livre sans titre";
                _currentChapterIndex = 0;
                await LoadCurrentChapterAsync();
                UpdateChapterInfo();
                BuildTableOfContents();
                LoadingFrame.IsVisible = false;
            }
            catch (Exception ex)
            {
                LoadingFrame.IsVisible = false;
                await DisplayAlert("Erreur", $"Impossible de lire l'EPUB: {ex.Message}", "OK");
                await Shell.Current.GoToAsync("..");
            }
        }

        // Chargement du chapitre actuel avec style
        private async Task LoadCurrentChapterAsync()
        {
            if (_chapters == null || _currentChapterIndex < 0 || _currentChapterIndex >= _chapters.Count) return;

            var chapter = _chapters[_currentChapterIndex];
            var htmlContent = chapter.Content;
            var styledHtml = $@"
                <html>
                <head>
                    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
                    <style>
                        body {{
                            font-family: 'Segoe UI', Arial, sans-serif;
                            font-size: {_fontSize}px;
                            line-height: 1.6;
                            margin: 20px;
                            background-color: #f9f9f9;
                            color: #333;
                            text-align: justify;
                        }}
                        h1, h2, h3, h4, h5, h6 {{
                            color: #2c3e50;
                            margin-top: 1.5em;
                            margin-bottom: 0.5em;
                        }}
                        p {{
                            margin-bottom: 1em;
                            text-indent: 1.5em;
                        }}
                        img {{
                            max-width: 100%;
                            height: auto;
                            display: block;
                            margin: 1em auto;
                        }}
                        .center {{
                            text-align: center;
                        }}
                    </style>
                </head>
                <body>
                    {htmlContent}
                </body>
                </html>";

            EpubWebView.Source = new HtmlWebViewSource { Html = styledHtml };
        }

        // Mise à jour des informations de navigation des chapitres
        private void UpdateChapterInfo()
        {
            if (_chapters == null) return;

            ChapterInfoLabel.Text = $"Chapitre {_currentChapterIndex + 1} / {_chapters.Count}";
            PreviousChapterButton.IsEnabled = _currentChapterIndex > 0;
            NextChapterButton.IsEnabled = _currentChapterIndex < _chapters.Count - 1;
        }

        // Construction de la table des matières
        private void BuildTableOfContents()
        {
            TocContainer.Children.Clear();

            if (_epubBook?.Navigation?.Count > 0)
            {
                foreach (var navItem in _epubBook.Navigation)
                {
                    var tocButton = new Button
                    {
                        Text = navItem.Title,
                        BackgroundColor = Colors.Transparent,
                        TextColor = Colors.Blue,
                        HorizontalOptions = LayoutOptions.FillAndExpand,
                        FontSize = 14,
                        Margin = new Thickness(0, 2)
                    };

                    var navItemCopy = navItem;
                    tocButton.Clicked += async (s, e) =>
                    {
                        await NavigateToNavItem(navItemCopy);
                        TocFrame.IsVisible = false;
                    };

                    TocContainer.Children.Add(tocButton);
                }
            }
            else if (_chapters != null)
            {
                for (int i = 0; i < _chapters.Count; i++)
                {
                    var chapterIndex = i;
                    var tocButton = new Button
                    {
                        Text = $"Chapitre {i + 1}",
                        BackgroundColor = Colors.Transparent,
                        TextColor = Colors.Blue,
                        HorizontalOptions = LayoutOptions.FillAndExpand,
                        FontSize = 14,
                        Margin = new Thickness(0, 2)
                    };

                    tocButton.Clicked += async (s, e) =>
                    {
                        _currentChapterIndex = chapterIndex;
                        await LoadCurrentChapterAsync();
                        UpdateChapterInfo();
                        TocFrame.IsVisible = false;
                    };

                    TocContainer.Children.Add(tocButton);
                }
            }
        }

        // Navigation vers un élément de la table des matières
        private async Task NavigateToNavItem(EpubNavigationItem navItem)
        {
            var targetFile = navItem.Link?.ContentFileName;
            if (_chapters == null || string.IsNullOrEmpty(targetFile)) return;

            for (int i = 0; i < _chapters.Count; i++)
            {
                if (_chapters[i].FileName.Equals(targetFile, StringComparison.OrdinalIgnoreCase))
                {
                    _currentChapterIndex = i;
                    await LoadCurrentChapterAsync();
                    UpdateChapterInfo();
                    break;
                }
            }
        }

        // Gestion du bouton de retour
        private async void OnBackClicked(object sender, EventArgs e)
        {
            await Shell.Current.GoToAsync("..");
        }

        private void OnTocClicked(object sender, EventArgs e)
        {
            TocFrame.IsVisible = !TocFrame.IsVisible;
            FontSizeFrame.IsVisible = false;
        }

        private void OnFontSizeClicked(object sender, EventArgs e)
        {
            FontSizeFrame.IsVisible = !FontSizeFrame.IsVisible;
            TocFrame.IsVisible = false;
        }

        // Navigation vers le chapitre précédent
        private async void OnPreviousChapter(object sender, EventArgs e)
        {
            if (_currentChapterIndex > 0)
            {
                _currentChapterIndex--;
                await LoadCurrentChapterAsync();
                UpdateChapterInfo();
            }
        }

        // Navigation vers le chapitre suivant
        private async void OnNextChapter(object sender, EventArgs e)
        {
            if (_chapters != null && _currentChapterIndex < _chapters.Count - 1)
            {
                _currentChapterIndex++;
                await LoadCurrentChapterAsync();
                UpdateChapterInfo();
            }
        }

        private async void OnFontSizeChanged(object sender, ValueChangedEventArgs e)
        {
            _fontSize = e.NewValue;
            if (_chapters != null && _currentChapterIndex >= 0 && _currentChapterIndex < _chapters.Count)
            {
                await LoadCurrentChapterAsync();
            }
        }

        private void OnCloseFontSize(object sender, EventArgs e)
        {
            FontSizeFrame.IsVisible = false;
        }
    }
}