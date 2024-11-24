# Constant Commits

Sistema de monitorización automática de cambios en archivos con commits automáticos. Diseñado especialmente para respaldar cambios durante el desarrollo con herramientas AI.

## Prerrequisitos

- Node.js instalado
- Git instalado y configurado
- Repositorio Git inicializado y configurado con remote

## Instalación

1. **Opción A: Instalación global (recomendada)**
```bash
# Clonar o copiar los archivos del proyecto
git clone [URL_REPO] constant-commits
cd constant-commits

# Instalar globalmente
npm install -g .
```

2. **Opción B: Instalación local**
```bash
# Clonar o copiar los archivos
git clone [URL_REPO] constant-commits
cd constant-commits

# Instalar dependencias
npm install
```

## Preparación del proyecto a monitorizar

```bash
# 1. Ir a la carpeta del proyecto
cd mi-proyecto

# 2. Inicializar git (si no está inicializado)
git init

# 3. Configurar repositorio remoto
git remote add origin TU_URL_GIT

# 4. Commit inicial
git add .
git commit -m "Initial commit"
git push -u origin master
```

## Uso

### Iniciar monitorización

Si está instalado globalmente:
```bash
# Monitorizar carpeta actual
constant-commits start

# Monitorizar carpeta específica
constant-commits start "ruta/a/tu/carpeta"
```

Si está instalado localmente:
```bash
node monitor.js start
```

### Detener monitorización
Presionar `Ctrl+C` en la terminal donde está corriendo el monitor.

## Características

- Monitorización en tiempo real de cambios en archivos
- Commits automáticos cada minuto (solo cuando hay cambios)
- Captura completa de cambios mediante `git add .` antes de cada commit
- Push automático después de cada commit
- Ignora automáticamente:
  - Carpetas node_modules
  - Carpetas .git
  - Archivos ocultos
- Interfaz visual en consola que muestra:
  - Archivos detectados por el monitor
  - Timestamp de commits
  - Estado de push

## Comportamiento

- Realiza `git add .` antes de cada commit para garantizar que se capturen todos los cambios
- Solo hace commits cuando detecta cambios
- Agrupa cambios ocurridos en el mismo minuto
- No interfiere con commits manuales
- Compatible con cualquier servidor Git (GitHub, GitLab, Gitea, etc.)
- Respeta la configuración Git existente

## Recomendaciones de uso

1. Activar solo durante sesiones de desarrollo activo
2. Verificar configuración Git antes de iniciar
3. Mantener la terminal visible para monitorear la actividad
4. Usar Ctrl+C para detener limpiamente

## Solución de problemas

Si encuentras errores:
1. Verifica que Git está instalado y configurado
2. Confirma que tienes acceso al repositorio remoto
3. Revisa que las credenciales Git están configuradas
4. Asegúrate de que el repositorio está inicializado correctamente

## Contacto

Javi Guembe - [@javiG](https://twitter.com/javiG)

Link del Proyecto: 

## Atribución

Lo que quieras :-) .