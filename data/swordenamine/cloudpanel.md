# swordenamine/cloudpanel

## Resumen

`swordenamine/cloudpanel` no es un modelo de inteligencia artificial. El repositorio contiene «CloudPanel — Auto Operations Dashboard», una aplicación web desarrollada en Flask que permite desplegar, arrancar, parar y controlar AppImages en una máquina virtual en la nube desde cualquier navegador, incluido NetHunter. El flujo que automatiza es «Deploy → Start → VNC Tunnel → Connect» sobre una única página, con salida de operaciones en streaming en tiempo real.

El artefacto agrupa un backend Flask con Server-Sent Events (SSE) y una API de túnel VNC, un gestor SSH/SCP, un módulo de operaciones remotas, plantillas Jinja con interfaz tipo terminal oscura y scripts de arranque (`bootstrap.sh`, `run.sh`). No incluye pesos, tokenizador, configuración de transformer ni artefacto de inferencia de ningún tipo; la etiqueta `region:us` es la única metainformación declarada en HuggingFace.

Su relevancia es, por tanto, operativa y no de evaluación de modelos: sirve como panel de control para publicar entornos gráficos Linux (por ejemplo, `aipy-pro`) en una VM remota y acceder a ellos por VNC a través de un túnel SSH. El repositorio acumula 0 descargas y 0 likes, no declara pipeline, licencia ni idiomas, y su código no ha pasado por ninguna validación comunitaria.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No aplica: no es un modelo de IA. Aplicación web Flask con plantillas Jinja, SSE y túneles SSH |
| Parámetros totales | No aplica |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica |
| Tipos de cuantización | No aplica |
| Idiomas soportados | No disponible (la interfaz y el README están en inglés; no se declara localización) |
| Licencia | No disponible (no se declara licencia en la información proporcionada) |
| Formato de pesos | No aplica (el repositorio contiene código Python, HTML y scripts de shell) |
| Tipo de artefacto | Repositorio de software: dashboard de operaciones cloud |
| Lenguaje de implementación | Python (Flask) + HTML/Jinja + Bash |
| Autenticación | Login por contraseña en el dashboard y autenticación SSH por clave |
| Puerto por defecto | 5000 (configurable con `DASHBOARD_PORT`) |
| Puerto de túnel VNC | 15901 por defecto (`LOCAL_VNC_PORT`), contra el puerto 5901 remoto |

## Arquitectura y entrenamiento

No existe arquitectura neuronal ni proceso de entrenamiento. La arquitectura del artefacto es una aplicación web en tres capas: un frontend de plantillas Jinja (`base.html`, `login.html`, `index.html`, `settings.html`) con estética de terminal oscura; un backend Flask (`app.py`) que expone operaciones de despliegue, un endpoint de streaming por Server-Sent Events que emite la salida línea a línea hacia el panel de terminal del navegador, y una API que gestiona el túnel VNC; y una capa de ejecución remota compuesta por `core/ssh_manager.py` (SSH/SCP, salida en streaming y estadísticas del servidor) y `core/operations.py` (despliegue, arranque, parada, servicio systemd y limpieza).

El aprovisionamiento se realiza con `bootstrap.sh`, que crea un entorno virtual de Python, genera el fichero `.env` y una clave SSH; `run.sh` activa el entorno y arranca el dashboard. Las operaciones remotas se ejecutan sobre el host indicado en `SERVER_IP`: subida del AppImage por SCP, instalación de dependencias del sistema mediante `apt install`, configuración de VNC, arranque de `vncserver :1` y lanzamiento del AppImage dentro de la sesión. La opción `APPIMAGE_EXTRACT=true` evita la dependencia de FUSE extrayendo el contenido del AppImage.

## Capacidades

- Despliegue automatizado de AppImages en una VM remota: subida por SCP, instalación de dependencias del servidor y configuración de VNC en una sola acción.
- Ciclo de vida completo del proceso remoto: arrancar, parar, reiniciar y limpiar el AppImage, incluido `pkill` sobre el proceso y `vncserver -kill :1`.
- Persistencia mediante unidad systemd (`/etc/systemd/system/aipy-pro.service`): escritura, habilitación y arranque del servicio desde el panel.
- Streaming en tiempo real de la salida de cada operación hacia el navegador mediante Server-Sent Events, sin polling.
- Túnel VNC sobre SSH gestionado como subproceso del propio servidor Flask, sin necesidad de una terminal adicional en el cliente.
- Comprobación de conectividad SSH con reporte de latencia.
- Visualización de la clave pública SSH para pegarla en la consola de la VM.
- Edición del fichero `.env` desde el navegador en la ruta `/settings`, con aplicación inmediata en la siguiente operación.
- Panel de estadísticas del servidor y de logs remotos (`~/aipy.log`).
- Control de acceso por contraseña en el dashboard y autenticación SSH exclusivamente por clave.

## Casos de uso

- Publicación de un entorno gráfico en cloud para uso remoto: el panel sube el AppImage a la VM, instala las dependencias y prepara VNC, de modo que el usuario solo tiene que abrir su cliente VNC contra `localhost:15901`.
- Acceso desde dispositivos móviles o NetHunter: al ser una interfaz web con túnel SSH integrado, permite operar el escritorio remoto desde un navegador móvil sin instalar utilidades adicionales de gestión.
- Aprovisionamiento rápido de entornos de demostración: con tres comandos (`bootstrap.sh`, edición de `.env`, `run.sh`) se levanta un panel que despliega una aplicación en una VM recién creada, útil para demos internas o pruebas de integración.
- Operación de aplicaciones GUI sin escritorio local: el AppImage se ejecuta dentro de una sesión VNC en el servidor, por lo que herramientas gráficas pueden correr en una máquina sin entorno de escritorio.
- Automatización de tareas de administración repetitivas: los botones de deploy, stop, restart, service y clean encapsulan secuencias SSH que de otro modo requerirían comandos manuales y comprobaciones de estado.
- Servicio persistente de una aplicación en producción interna: la creación de la unidad systemd desde el panel permite que el AppImage se reinicie tras caídas o reinicios de la VM.
- Laboratorio de infraestructura y formación: al centralizar logs, estadísticas y operaciones en una sola página, resulta adecuado para prácticas de administración de sistemas en remoto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye evaluaciones de ningún tipo, y al no tratarse de un modelo de IA no existen métricas como MMLU, HumanEval o GSM8K que puedan reportarse. Tampoco se publican cifras de latencia o throughput del dashboard, más allá de la funcionalidad de «Test SSH», que reporta la latencia de conexión sin valores predefinidos.

## Requisitos de hardware

- VRAM: no aplica. El artefacto no ejecuta inferencia ni requiere GPU; no se dispone de estimaciones de VRAM porque no hay modelo.
- Servidor: VM Linux accesible por SSH con usuario tipo `ubuntu`, `opc` o `root`, Python con soporte de entorno virtual, permisos para `apt install` y para escribir en `/etc/systemd/system/`.
- Dependencia opcional de FUSE para ejecutar AppImages; si no está disponible, debe activarse `APPIMAGE_EXTRACT=true`.
- Cliente: cualquier navegador moderno con soporte de Server-Sent Events y un cliente VNC para conectarse a `localhost:15901`.
- Red: puerto 5000 expuesto solo en local o detrás de un proxy inverso con HTTPS; el puerto 5901 debe permanecer cerrado y accesible únicamente a través del túnel SSH.
- GPU recomendadas: no disponible (no procede).
- Opciones de despliegue: ejecución directa con `run.sh` sobre el entorno virtual generado por `bootstrap.sh`; el README no documenta contenedores, orquestadores ni integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Herramienta | Categoría | Función principal | Interfaz web | Túnel SSH integrado | Licencia | Métricas publicadas |
|---|---|---|---|---|---|---|
| cloudpanel (este repositorio) | Panel de operaciones para AppImages | Deploy, arranque, parada y VNC de AppImages en VM | Sí (Flask) | Sí | No disponible | No disponible |
| Apache Guacamole | Gateway de escritorio remoto sin cliente | Acceso a escritorio remoto vía navegador | Sí | No disponible en esta ficha | No disponible en esta ficha | No disponible |
| Cockpit | Panel de administración de servidores | Gestión de servicios, logs y sistema | Sí | No disponible en esta ficha | No disponible en esta ficha | No disponible |
| code-server | IDE en el navegador | Edición de código remota | Sí | No disponible en esta ficha | No disponible en esta ficha | No disponible |

No se dispone de datos de rendimiento, licencia ni benchmarks de las alternativas en la información proporcionada; la comparación es únicamente funcional y cualitativa. No existen modelos de IA comparables porque el artefacto no es un modelo.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no razona, no procesa lenguaje natural ni admite tool calling. Cualquier evaluación como modelo carece de sentido.
- Ausencia total de licencia declarada: no se especifican condiciones de uso, modificación ni distribución comercial, lo que supone un riesgo legal para cualquier adopción en producción.
- Contraseña por defecto `admin123` en `DASHBOARD_PASSWORD`: debe cambiarse antes de cualquier exposición, tal como advierte el propio README.
- El README recomienda no exponer el puerto 5000 públicamente sin HTTPS y proxy inverso; la aplicación se sirve por HTTP en claro por defecto.
- Almacenamiento de credenciales en `.env` en texto plano (aunque con `chmod 600`), incluidos `VNC_PASSWORD`, `DASHBOARD_PASSWORD` y la ruta de la clave SSH privada.
- Ejecución de `apt install` y escritura de unidades systemd durante el despliegue: requiere privilegios elevados en la VM de destino y otorga al panel capacidad de modificar el sistema.
- Superficie de ataque relevante: el dashboard lanza comandos SSH y mantiene un subproceso de túnel; no se documentan pruebas de seguridad, análisis estático ni auditoría del código.
- Falta de validación comunitaria: 0 descargas y 0 likes, sin tests, CI ni historial de mantenimiento documentado en la información disponible.
- Inconsistencia en los metadatos de HuggingFace: la fecha de creación (2026-10-17) es posterior a la de última actualización (2026-03-14), lo que impide fiarse de la cronología del repositorio.
- Dependencia de la calidad del AppImage de terceros que se despliega; el panel no verifica firmas ni integridad del binario más allá de la transferencia SCP.
- Documentación limitada al README: no hay guía de API, referencia de configuración completa ni política de manejo de errores más allá de la tabla de troubleshooting.

## Enlaces

- HuggingFace: https://huggingface.co/swordenamine/cloudpanel
- Paper, blog, repositorio de código independiente o demo: no disponible en la información proporcionada.
