namespace server.Models
{
    public class TodoCreateDto
    {
        public string Title { get; set; } = null!;
        public DateTime DueDate { get; set; }
    }
}
