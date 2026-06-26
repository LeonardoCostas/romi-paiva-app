namespace Peluqueria.Application.Common;

public sealed class Result<T>
{
    private Result(bool success, T? value, string? error, string? warning)
    {
        Success = success;
        Value = value;
        Error = error;
        Warning = warning;
    }

    public bool Success { get; }
    public T? Value { get; }
    public string? Error { get; }
    public string? Warning { get; }

    public static Result<T> Ok(T value, string? warning = null) => new(true, value, null, warning);
    public static Result<T> Fail(string error) => new(false, default, error, null);
}