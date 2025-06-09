using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using MongoDB.Driver;
using MongoDB.Bson;
using server.Services;
using DotNetEnv;



Env.Load();
var builder = WebApplication.CreateBuilder(args);

var mongoUri = Environment.GetEnvironmentVariable("MONGO_CONNECTION_STRING");
var jwtSecret = Environment.GetEnvironmentVariable("JWT_SECRET");

var mongoClient = new MongoClient(mongoUri);
var database = mongoClient.GetDatabase("todoDb");

// Register services before building app
builder.Services.AddSingleton(database);
builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<TodoService>();
builder.Services.AddSingleton(new TokenService(jwtSecret));

// Add Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = false,
        ValidateAudience = false,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddControllers();

// Add CORS policy
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllOrigins",
        builder => builder.AllowAnyOrigin()
                          .AllowAnyMethod()
                          .AllowAnyHeader());
});

var app = builder.Build();

try
{
    var command = new BsonDocument("ping", 1);
    database.RunCommand<BsonDocument>(command);
    Console.WriteLine("MongoDB connection successful!");
}
catch (Exception ex)
{
    Console.WriteLine($"MongoDB connection failed: {ex.Message}");
}

// Middleware order:
app.UseHttpsRedirection();

app.UseRouting();

app.UseCors("AllowAllOrigins");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
