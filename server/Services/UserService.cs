using MongoDB.Driver;
using server.Models;
using BCrypt.Net;

namespace server.Services
{
    public class UserService
    {
        private readonly IMongoCollection<User> _users;

        public UserService(IMongoDatabase database)
        {
            
            _users = database.GetCollection<User>("users");
        }

        // Register user (hash password before saving)
        public void RegisterUser(User user, string password)
        {
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(password);
            _users.InsertOne(user);
        }

        // Verify password
        public bool VerifyPassword(string password, string storedHash)
        {
            return BCrypt.Net.BCrypt.Verify(password, storedHash);
        }

        // Get user by email
        public User? GetByEmail(string email)
        {
            return _users.Find(u => u.Email == email).FirstOrDefault();
        }

        // Get user by id
        public User? GetById(string id)
        {
            return _users.Find(u => u.Id == id).FirstOrDefault();
        }
    }
}
