using Peluqueria.Api.Extensions;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>() ?? [];

        policy.AllowAnyMethod()
              .AllowAnyHeader();

        if (allowedOrigins.Length > 0)
        {
            policy.WithOrigins(allowedOrigins);
        }
        else if (builder.Environment.IsDevelopment())
        {
            policy.AllowAnyOrigin();
        }
    });
});

builder.Services.AddApiServices(builder.Configuration);

var app = builder.Build();

app.UseCors();

await app.ConfigurePipelineAsync();
app.Run();
