using MongoDB.Driver;
using server.Models;

namespace server.Services
{
    public class TodoService
    {
        private readonly IMongoCollection<Todo> _todos;

        public TodoService(IMongoDatabase database)
        {
            _todos = database.GetCollection<Todo>("todos");
        }

        public async Task<List<Todo>> GetTodosByUserIdAsync(string userId)
        {
            return await _todos.Find(todo => todo.UserId == userId).ToListAsync();
        }

        public async Task<Todo> GetTodoByIdAsync(string id)
        {
            return await _todos.Find(todo => todo.Id == id).FirstOrDefaultAsync();
        }

        public async Task CreateTodoAsync(Todo todo)
        {
            await _todos.InsertOneAsync(todo);
        }

        public async Task UpdateTodoAsync(string id, Todo updatedTodo)
        {
            await _todos.ReplaceOneAsync(todo => todo.Id == id, updatedTodo);
        }

        public async Task DeleteTodoAsync(string id)
        {
            await _todos.DeleteOneAsync(todo => todo.Id == id);
        }
    }
}
