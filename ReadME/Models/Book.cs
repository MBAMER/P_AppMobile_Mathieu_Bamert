using System;
using System.Text.Json.Serialization;

namespace ReadME.Models
{
    public class Book
    {
        [JsonPropertyName("livre_id")]
        public int LivreId { get; set; }

        [JsonPropertyName("titre")]
        public string Titre { get; set; }

        [JsonPropertyName("annee_edition")]
        public int AnneeEdition { get; set; }

        [JsonPropertyName("lien_image")]
        public string LienImage { get; set; }

        [JsonPropertyName("lien_pdf")]
        public string LienPdf { get; set; }

        [JsonPropertyName("resume")]
        public string Resume { get; set; }

        [JsonPropertyName("editeur")]
        public string Editeur { get; set; }

        [JsonPropertyName("nombre_de_page")]
        public int NombreDePage { get; set; }

        [JsonPropertyName("category_id")]
        public int CategoryId { get; set; }

        [JsonPropertyName("writer_id")]
        public int WriterId { get; set; }

        [JsonPropertyName("epub")]
        public byte[] Epub { get; set; }

        [JsonPropertyName("created")]
        public DateTime Created { get; set; }

        [JsonPropertyName("updated")]
        public DateTime Updated { get; set; }
    }
} 