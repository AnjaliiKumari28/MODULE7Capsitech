using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace server.Models
{
    public class Todo
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = null!;

        [BsonElement("userId")]
        public string UserId { get; set; } = null!; // links todo to the user

        [BsonElement("title")]
        public string Title { get; set; } = null!;

        [BsonElement("dueDate")]
        public DateTime DueDate { get; set; }

        [BsonElement("isCompleted")]
        public bool IsCompleted { get; set; } = false;
    }
}
