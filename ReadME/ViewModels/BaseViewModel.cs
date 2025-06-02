using System.ComponentModel;
using System.Runtime.CompilerServices;

namespace ReadME.ViewModels
{
    public class BaseViewModel : INotifyPropertyChanged
    {
        // Variable privée pour indiquer si le modèle est occupé
        private bool _isBusy;
        // Propriété publique pour gérer l'état occupé
        public bool IsBusy
        {
            get => _isBusy;
            set => SetProperty(ref _isBusy, value);
        }

        // Variable privée pour le titre
        private string _title = string.Empty;
        // Propriété publique pour le titre
        public string Title
        {
            get => _title;
            set => SetProperty(ref _title, value);
        }

        // Événement pour notifier les changements de propriétés
        public event PropertyChangedEventHandler PropertyChanged;

        // Méthode pour déclencher l'événement de changement de propriété
        protected virtual void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }

        // Méthode pour définir une propriété et notifier son changement
        protected bool SetProperty<T>(ref T storage, T value, [CallerMemberName] string propertyName = null)
        {
            if (EqualityComparer<T>.Default.Equals(storage, value))
                return false;

            storage = value;
            OnPropertyChanged(propertyName);
            return true;
        }
    }
}