namespace Peluqueria.Api.Common;

public sealed record ApiResponse<T>(bool Success, T? Data, string? Error, string? Warning);