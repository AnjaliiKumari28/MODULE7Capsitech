using Microsoft.AspNetCore.Mvc;
using server.Dtos;
using server.Models;
using server.Services;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;

namespace server.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly UserService _userService;
        private readonly TokenService _tokenService;

        public AuthController(UserService userService, TokenService tokenService)
        {
            _userService = userService;
            _tokenService = tokenService;
        }

        [HttpPost("register")]
        public IActionResult Register([FromBody] RegisterDto dto)
        {
            if (_userService.GetByEmail(dto.Email) != null)
            {
                return BadRequest(new { message = "Email already in use" });
            }

            var user = new User
            {
                Name = dto.Name,
                Email = dto.Email
            };

            _userService.RegisterUser(user, dto.Password);

            var token = _tokenService.GenerateToken(user);

            return Ok(new
            {
                token
            });
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginDto dto)
        {
            var user = _userService.GetByEmail(dto.Email);
            if (user == null || !_userService.VerifyPassword(dto.Password, user.PasswordHash))
            {
                return Unauthorized(new { message = "Invalid email or password" });
            }

            var token = _tokenService.GenerateToken(user);

            return Ok(new
            {
                token
            });
        }

        [Authorize]
        [HttpGet("profile")]
        public IActionResult GetProfile()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { message = "User not authenticated" });
            }

            var user = _userService.GetById(userId);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            // Return only necessary user information
            return Ok(new
            {
                id = user.Id,
                name = user.Name,
                email = user.Email,
            });
        }
    }
}
