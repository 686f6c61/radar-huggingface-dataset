# swordenamine/claude-local-proxy

## Resumen

`swordenamine/claude-local-proxy` no es un modelo de lenguaje: es un repositorio de código publicado en HuggingFace que contiene una aplicación autocontenida (proxy + interfaz web) para conversar con los modelos Claude de Anthropic. La aplicación es un servidor FastAPI en Python 3.9+ que expone una interfaz de navegador en `http://127.0.0.1:8080` y un endpoint REST compatible con la Anthropic Messages API en `/v1/chat`, ademas de gestionar historial de conversaciones en SQLite. Su proposito es permitir usar Claude desde dispositivos sin aplicacion nativa —Android via Termux, Raspberry Pi, portatiles o VPS— manteniendo la clave de API en el propio dispositivo y sin intermediarios.

El interes practico del proyecto es de infraestructura, no de investigacion: no publica pesos, no entrena nada y no aporta innovaciones de arquitectura. Funciona como capa de cliente: reenvia las peticiones a la API de Anthropic (o a un endpoint remoto alternativo configurable via `REMOTE_INFERENCE_URL`) y devuelve las respuestas en streaming mediante Server-Sent Events. Por tanto, cualquier evaluacion de calidad, contexto o capacidades del modelo subyacente depende enteramente del modelo de Claude que se configure en la variable `MODEL`.

El repositorio presenta senales de calidad dispares: incluye suite de tests (18 casos declarados), documentacion en `docs/`, instalador systemd y script de swap para equipos con poca RAM, pero los metadatos de HuggingFace muestran 0 descargas y 0 likes, la licencia no consta en los metadatos de la plataforma (aunque el README declara MIT) y las fechas de creacion (2026-10-17) y actualizacion (2026-03-13) son incoherentes entre si. Ademas, las URL de GitHub del README (`swordenkisk`) no coinciden con el autor del repositorio en HuggingFace (`swordenamine`), lo que conviene verificar antes de ejecutar el script de instalacion de una linea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica: no es un modelo de pesos. Servidor FastAPI (Python 3.9+) con frontend Jinja2 + JavaScript, streaming SSE y persistencia SQLite |
| Parametros totales | No aplica (el repositorio contiene codigo fuente, no pesos) |
| Parametros activos | No aplica |
| Longitud de contexto | No disponible: depende del modelo de Anthropic configurado. `MAX_TOKENS` (salida) por defecto 1024, configurable por `.env` |
| Tipos de cuantizacion | No aplica: no se distribuyen pesos ni se ejecuta inferencia local |
| Idiomas soportados | Interfaz bilingue arabe (RTL) e ingles, segun el README. Idiomas del modelo: no disponibles en la informacion proporcionada |
| Licencia | MIT segun el README; los metadatos de HuggingFace no declaran licencia (discrepancia) |
| Formato de pesos | No aplica: solo codigo Python, HTML, CSS y JS. Sin safetensors ni GGUF |

Otros datos verificables del repositorio:

| Parametro | Valor |
|---|---|
| ID en HuggingFace | `swordenamine/claude-local-proxy` |
| Autor | `swordenamine` |
| Descargas / likes | 0 / 0 |
| Pipeline declarado | No disponible |
| Etiquetas | `region:us` |
| Fecha de creacion | 2026-10-17T22:43:59Z |
| Fecha de actualizacion | 2026-03-13T00:27:48Z (anterior a la creacion) |
| Dependencias principales | FastAPI >= 0.110, Uvicorn, Jinja2, SQLite |
| Plataformas declaradas | Android (Termux), Linux, macOS, Windows |
| Endpoints | `POST /v1/chat`, `GET/POST /v1/conversations`, `GET /v1/conversations/{id}/messages`, `DELETE /v1/conversations/{id}`, `GET /v1/models`, `GET /health`, Swagger en `/docs` |

## Arquitectura y entrenamiento

No hay entrenamiento ni arquitectura de red neuronal que describir. La arquitectura del proyecto es una aplicacion web en tres capas: `src/server.py` (aplicacion FastAPI y punto de entrada), `src/providers.py` (clientes para Anthropic y para endpoints remotos), `src/database.py` (almacenamiento de conversaciones en SQLite) y `src/auth.py` (autenticacion opcional por token). El frontend es una pagina unica servida con Jinja2 (`templates/index.html`) con CSS mobile-first, soporte RTL y temas claro/oscuro, y logica de chat en JavaScript plano (`static/js/app.js`) encargada del renderizado de Markdown y del consumo del stream SSE.

El flujo de inferencia es una pasarela: la UI o un cliente externo envia mensajes a `/v1/chat`, el servidor los reenvia a la API de Anthropic con la clave leida de `.env`, y devuelve la respuesta con el mismo esquema de la Messages API. El README declara soporte de `API_PROVIDER=anthropic` o `remote`, lo que permite apuntar a un endpoint alternativo mediante `REMOTE_INFERENCE_URL` (por ejemplo, un servidor de inferencia propio o un endpoint de HuggingFace). No se documentan tecnicas de decodificacion especulativa, atencion lineal ni nada equivalente, porque la decodificacion ocurre en los servidores de Anthropic. Las funciones auxiliares declaradas incluyen limitacion de tasa (`RATE_LIMIT_PER_MINUTE=20` por IP), historial multi-turno con memoria, multiples conversaciones, selector de modelo, prompt de sistema personalizable y exportacion de conversaciones a JSON/Markdown.

## Capacidades

- Interfaz web de chat completa con renderizado de Markdown, servida localmente en el puerto 8080.
- Streaming de respuestas en tiempo real mediante Server-Sent Events.
- Historial de conversacion persistente en SQLite, con multiples conversaciones y recuperacion de mensajes por identificador.
- Proxy compatible con la Anthropic Messages API en `/v1/chat`, lo que permite conectar clientes que ya hablan ese esquema sin adaptadores.
- Conmutacion de proveedor: `anthropic` (API oficial) o `remote` (endpoint arbitrario configurable).
- Selector de modelo y personalizacion del prompt de sistema desde la configuracion.
- Autenticacion opcional por token (`UI_AUTH_TOKEN`) para exponer la interfaz en red local.
- Limitacion de tasa por IP y comprobacion de estado en `/health`.
- Interfaz bilingue con soporte RTL para arabe y diseno mobile-first.
- Exportacion de conversaciones a JSON y Markdown.
- Despliegue en Android/Termux, con script de swap para dispositivos con poca memoria RAM.
- Instalador de servicio systemd para ejecucion persistente en Linux.

No se declaran capacidades propias de vision, audio, tool calling nativo del servidor ni modo de razonamiento extendido; esas funciones, si existen, las aporta el modelo de Claude remoto y no estan documentadas en la informacion proporcionada.

## Casos de uso

- Acceso a Claude desde Android sin aplicacion nativa: instalacion via Termux (`pkg install python git`), arranque del servidor con `python -m src.server` y uso desde el navegador del telefono en `http://127.0.0.1:8080`. Encaja porque toda la pila es Python + SQLite y el README incluye un script de swap para equipos con RAM limitada.
- Integracion en aplicaciones internas que ya implementan la Messages API: si una herramienta habla el esquema de Anthropic, se le puede apuntar a `POST /v1/chat` del proxy para centralizar el historial en SQLite y aplicar limite de tasa, sin tocar el codigo del cliente.
- Custodia local de la clave de API en entornos regulados: la clave reside unicamente en el fichero `.env` del dispositivo y las peticiones van directas a Anthropic sin intermediario, lo que simplifica el analisis de flujo de datos frente a un servicio SaaS de terceros.
- Asistente de soporte multi-turno en arabe e ingles: la UI soporta RTL y cambio de idioma, y el historial persistente permite retomar conversaciones; util para equipos de atencion al cliente en la region MENA.
- Evaluacion comparativa de coste y calidad entre modelos: el selector de modelo y las variables `MODEL` y `MAX_TOKENS` permiten alternar entre distintos modelos de Claude y acotar la longitud de salida, guardando cada prueba en su propia conversacion para su posterior exportacion.
- Documentacion y auditoria de sesiones: la exportacion a JSON y Markdown junto con las tablas SQLite permite archivar transcripciones completas como registro de decisiones tecnicas o material de formacion.
- Demostraciones y docencia en hardware minimo: un Raspberry Pi o un portatil modesto puede servir la interfaz web para una clase o taller, delegando todo el computo de inferencia a la API remota.
- Prototipado de pasarelas propias: `src/providers.py` y `docs/providers.md` sirven como base para construir un proxy que combine varios backends (API comercial y endpoint autoalojado) bajo una unica interfaz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al no tratarse de un modelo de pesos, no existen resultados de MMLU, HumanEval, GSM8K ni equivalentes atribuibles a este repositorio; el rendimiento de las respuestas depende del modelo de Claude configurado en `MODEL`. El unico dato de validacion declarado por el autor es una suite de tests con 18 casos (`tests/test_server.py`), sin resultados publicados.

| Metrica declarada | Valor |
|---|---|
| Casos de test | 18 (sin resultados de ejecucion publicados) |
| Latencia | No disponible (depende de la API de Anthropic y de la red del dispositivo) |
| Throughput | No disponible |
| Consumo de VRAM | 0 (no hay inferencia local) |

## Requisitos de hardware

- VRAM: no se requiere GPU ni VRAM para la inferencia; el computo ocurre en los servidores de Anthropic. El servidor local solo necesita CPU para servir HTTP y SQLite.
- RAM: no se especifica minimo en la informacion disponible. El repositorio incluye `scripts/setup_swap.sh` para dispositivos con poca memoria, lo que sugiere soporte en equipos de gama baja, sin cifras concretas.
- CPU y plataformas: cualquier dispositivo capaz de ejecutar Python 3.9+; el README declara Android/Termux, Raspberry Pi, portatiles, macOS, Windows y VPS.
- GPU recomendadas: no aplica. No se mencionan A100, H100 ni RTX 4090 porque no hay cargas de inferencia local.
- Despliegue: Uvicorn/FastAPI como servidor ASGI; instalacion manual con `venv` y `pip install -r requirements.txt`, script `scripts/setup.sh` de una linea, servicio systemd mediante `scripts/install_service.sh` y ejecucion en Termux. No se documentan imagenes Docker, vLLM, llama.cpp, Ollama ni TGI, que no aplican a este caso.
- Latencia y throughput: no disponibles; vienen determinados por la latencia de la API de Anthropic, el modelo elegido y el valor de `MAX_TOKENS`, no por el proxy.
- Almacenamiento: base de datos SQLite en `DB_PATH` (por defecto `./data/conversations.db`); el crecimiento depende del volumen de mensajes retenidos.

## Comparativa con modelos similares

La comparacion relevante es con otras interfaces o pasarelas autoalojadas para APIs de LLM, no con modelos. Los datos concretos de las alternativas no estan en la informacion proporcionada; se indican solo rasgos generales conocidos.

| Proyecto | Tipo | Pesos / parametros | Contexto | Licencia | Ajuste al caso de uso |
|---|---|---|---|---|---|
| claude-local-proxy | Proxy FastAPI + UI web para Anthropic | No aplica | Depende del modelo remoto | MIT segun README (no declarada en HF) | Minimo y ligero, viable en Termux y Raspberry Pi; pensado para un solo proveedor |
| Open WebUI | Interfaz web autoalojada multi-proveedor | No aplica | Depende del backend | Datos no disponibles en la informacion proporcionada | Mucho mas amplio en funciones y proveedores, mayor huella de recursos |
| LibreChat | Interfaz de chat autoalojada multi-proveedor | No aplica | Depende del backend | Datos no disponibles en la informacion proporcionada | Mayor complejidad de despliegue, habitualmente con contenedores y base de datos externa |
| Servidor de inferencia local (llama.cpp, vLLM, Ollama) | Ejecucion de pesos en local | Si (depende del modelo) | Depende del modelo | Segun el motor y el modelo | Permitiria inferencia sin API externa, a cambio de GPU/VRAM y de perder acceso a los modelos Claude |

## Limitaciones y advertencias

- No es un modelo: no publica pesos, no se puede ejecutar en local ni evaluar con benchmarks de LLM. Cualquier expectativa de inferencia offline es incorrecta.
- Dependencia total de un servicio externo de pago: sin `ANTHROPIC_API_KEY` valida y sin conectividad, el proxy no produce respuestas. Hay coste por token segun la API de Anthropic.
- Riesgo de seguridad en el despliegue: el propio README advierte de no usar `BIND_ADDR=0.0.0.0` sin `UI_AUTH_TOKEN`. La autenticacion descrita es un token simple, sin mencion de TLS, rotacion de claves ni proteccion contra fuerza bruta mas alla del limite de 20 peticiones por minuto y por IP.
- La clave de API se guarda en claro en el fichero `.env` del dispositivo; no se documenta integracion con gestores de secretos.
- Incoherencias que exigen verificacion previa: las URL del README apuntan a `github.com/swordenkisk/...` mientras el autor en HuggingFace es `swordenamine`; la licencia figura como MIT en el texto pero no en los metadatos de la plataforma; la fecha de actualizacion (2026-03-13) es anterior a la de creacion (2026-10-17). Ejecutar el instalador remoto (`curl ... | bash`) sin auditar antes el script es un riesgo de cadena de suministro.
- Nombres de modelo citados en el README (`claude-opus-4-5`, `claude-sonnet-4-6`) no verificados en la informacion disponible; si no son validos, las peticiones fallaran hasta corregir `MODEL`.
- Proyecto sin traccion observable: 0 descargas y 0 likes, sin historial de mantenimiento verificable. No se documentan politicas de versionado, changelog ni issues.
- Idiomas: la interfaz esta declarada en arabe e ingles; no se menciona localizacion al castellano. El soporte multilingue de las respuestas depende del modelo remoto.
- Sin mecanismos declarados de moderacion, filtrado de contenido, redaccion de datos personales ni cumplimiento normativo (RGPD incluido), lo que limita su uso directo en produccion con datos sensibles.
- Limitaciones funcionales del alcance: no hay integracion documentada de tool calling, agentes, vision, audio ni RAG; el historial se guarda en SQLite local sin cifrado declarado.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/swordenamine/claude-local-proxy
- Repositorio GitHub citado en el README: https://github.com/swordenkisk/claude-local-proxy
- Script de instalacion de una linea citado en el README: https://raw.githubusercontent.com/swordenkisk/claude-local-proxy/main/scripts/setup.sh
- Documentacion de la API en local (Swagger UI): http://127.0.0.1:8080/docs
- Documentacion incluida en el repositorio (rutas relativas, sin URL publica): `docs/api.md`, `docs/termux.md`, `docs/security.md`, `docs/providers.md`
