using Microsoft.AspNetCore.Mvc;
using Peluqueria.Application.Common;

namespace Peluqueria.Api.Common;

public static class ApiResponseFactory
{
    public static ActionResult<ApiResponse<T>> FromResult<T>(ControllerBase controller, Result<T> result, int successStatusCode = StatusCodes.Status200OK)
    {
        if (result.Success)
        {
            return controller.StatusCode(successStatusCode, new ApiResponse<T>(true, result.Value, null, result.Warning));
        }

        var statusCode = result.Error?.Contains("no encontrada", StringComparison.OrdinalIgnoreCase) == true
            ? StatusCodes.Status404NotFound
            : result.Error?.Contains("credenciales", StringComparison.OrdinalIgnoreCase) == true
                ? StatusCodes.Status401Unauthorized
                : result.Error?.Contains("ya existe", StringComparison.OrdinalIgnoreCase) == true ||
                  result.Error?.Contains("fuera del horario", StringComparison.OrdinalIgnoreCase) == true ||
                  result.Error?.Contains("reserva", StringComparison.OrdinalIgnoreCase) == true ||
                  result.Error?.Contains("requiere", StringComparison.OrdinalIgnoreCase) == true ||
                  result.Error?.Contains("debe reservar", StringComparison.OrdinalIgnoreCase) == true
                    ? StatusCodes.Status409Conflict
                    : StatusCodes.Status400BadRequest;

        return controller.StatusCode(statusCode, new ApiResponse<T>(false, default, result.Error, null));
    }
}