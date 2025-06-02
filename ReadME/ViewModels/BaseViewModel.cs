using System.ComponentModel;
using System.Runtime.CompilerServices;

namespace ReadME.ViewModels
{
    public class BaseViewModel : INotifyPropertyChanged
    {
        // Variable priv�e pour indiquer si le mod�le est occup�
        private bool _isBusy;
        // Propri�t� publique pour g�rer l'�tat occup�
        public bool IsBusy
        {
            get => _isBusy;
            set => SetProperty(ref _isBusy, value);
        }

        // Variable priv�e pour le titre
        private string _title = string.Empty;
        // Propri�t� publique pour le titre
        public string Title
        {
            get => _title;
            set => SetProperty(ref _title, value);
        }

        // �v�nement pour notifier les changements de propri�t�s
        public event PropertyChangedEventHandler PropertyChanged;

        // M�thode pour d�clencher l'�v�nement de changement de propri�t�
        protected virtual void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }

        // M�thode pour d�finir une propri�t� et notifier son changement
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