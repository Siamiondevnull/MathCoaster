# Stage 1: Build the React frontend
FROM node:22-alpine AS frontend-build
WORKDIR /app/frontend
COPY front-end/package.json ./
RUN npm install
COPY front-end/ .
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

# Stage 2: Build the .NET API
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS backend-build
WORKDIR /src
COPY back-end/MathCoasterApi/MathCoasterApi/MathCoasterApi.csproj MathCoasterApi/
RUN dotnet restore "MathCoasterApi/MathCoasterApi.csproj"
COPY back-end/MathCoasterApi/MathCoasterApi/ MathCoasterApi/
WORKDIR /src/MathCoasterApi
RUN dotnet publish "MathCoasterApi.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 3: Final image — .NET serves both the API and the React SPA
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
RUN mkdir -p /app/data
COPY --from=backend-build /app/publish .
COPY --from=frontend-build /app/frontend/dist ./wwwroot
EXPOSE 8080
ENTRYPOINT ["dotnet", "MathCoasterApi.dll"]
