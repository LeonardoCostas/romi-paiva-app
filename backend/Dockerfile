FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY PeluqueriaApi.slnx ./
COPY src ./src
COPY tests ./tests

RUN dotnet restore
RUN dotnet publish src/Peluqueria.Api/Peluqueria.Api.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "Peluqueria.Api.dll"]
