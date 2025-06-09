namespace server.Models
{
    public class TodoUpdateDto
    {
        public string Title { get; set; } = null!;
        public DateTime DueDate { get; set; }
        public bool IsCompleted { get; set; }
    }
}
