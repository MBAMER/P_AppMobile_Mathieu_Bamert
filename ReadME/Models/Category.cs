using System.Text.Json.Serialization;

namespace ReadME.Models
{
    public class Category
    {
        [JsonPropertyName("categorie_id")]
        public int CategorieId { get; set; }

        [JsonPropertyName("nom")]
        public string Nom { get; set; }

        [JsonPropertyName("created")]
        public DateTime Created { get; set; }

        [JsonPropertyName("updated")]
        public DateTime Updated { get; set; }
    }
} 