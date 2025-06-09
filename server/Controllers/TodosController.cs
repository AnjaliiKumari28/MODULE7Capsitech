using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using server.Models;
using server.Services;
using System.Security.Claims;

namespace server.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class TodoController : ControllerBase
    {
        private readonly TodoService _todoService;

        public TodoController(TodoService todoService)
        {
            _todoService = todoService;
        }

        private string GetUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        [HttpGet]
        public async Task<ActionResult<List<Todo>>> GetUserTodos()
        {
            var userId = GetUserId();
            var todos = await _todoService.GetTodosByUserIdAsync(userId);
            return Ok(todos);
        }

        [HttpPost]
        public async Task<IActionResult> CreateTodo([FromBody] TodoCreateDto todoDto)
        {
            var todo = new Todo
            {
                Title = todoDto.Title,
                DueDate = todoDto.DueDate,
                IsCompleted = false,
                UserId = GetUserId()
            };

            await _todoService.CreateTodoAsync(todo);
            return CreatedAtAction(nameof(GetUserTodos), new { id = todo.Id }, todo);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTodo(string id, [FromBody] TodoUpdateDto updateDto)
        {
            var existing = await _todoService.GetTodoByIdAsync(id);
            if (existing == null || existing.UserId != GetUserId())
                return NotFound("Todo not found or access denied.");

            // Update only the allowed fields
            existing.Title = updateDto.Title;
            existing.DueDate = updateDto.DueDate;
            existing.IsCompleted = updateDto.IsCompleted;

            await _todoService.UpdateTodoAsync(id, existing);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTodo(string id)
        {
            var existing = await _todoService.GetTodoByIdAsync(id);
            if (existing == null || existing.UserId != GetUserId())
                return NotFound("Todo not found or access denied.");

            await _todoService.DeleteTodoAsync(id);
            return NoContent();
        }
    }
}
