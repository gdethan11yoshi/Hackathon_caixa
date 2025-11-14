# Reto Caixabank Tech Madrid Engineering Week 2025 


## Desarrollo

### Front end 

Para desarrollar la aplicación hay que instalar `bun` y `cloudflared`.

Para instalar los requisitos:

```bash
bun install
```

Luego para compilar la página en la carpeta `dist`:

```bash
bun run build
```

Para poder abrir la página con todas las funcionalidades, hay que usar los permisos
de cámara y ubicación. Debido a limitaciones de los navegadores, la conexión tiene que
estar cifrada. Para esto, hay que proveer los archivos compilados usando, por ejemplo,
python:

```bash
python -m http.server
```

Y luego crear un tunel usando `cloudflared` para tener una conexión cifrada de punto a punto:

```bash
cloudflared tunnel --url http://0.0.0.0:8000
```

> [!NOTE]
> La IP o el puerto pueden llegar a ser diferentes dependiendo de la máquina. Comprobar la
> dirección que devuelve python.