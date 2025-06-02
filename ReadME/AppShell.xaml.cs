namespace ReadME
{
    public partial class AppShell : Shell
    {
        public AppShell()
        {
            InitializeComponent();
            Routing.RegisterRoute("bookdetails", typeof(BookDetailsPage));
            Routing.RegisterRoute("epubreader", typeof(EpubReaderPage));
        }
    }
}
