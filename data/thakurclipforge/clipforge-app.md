# thakurclipforge/clipforge-app

## Resumen

ClipForge no es un modelo de IA en sentido estricto, sino una aplicacion web autoalojable de codigo abierto (publicada en Hugging Face Spaces bajo el identificador `thakurclipforge/clipforge-app`) que automatiza la generacion de clips verticales a partir de videos largos, al estilo de OpusClip. El sistema encadena varias herramientas: descarga de video con `yt-dlp`, transcripcion con Whisper a nivel de palabra, seleccion de momentos mediante un LLM externo (OpenAI, Groq o Gemini) o un motor de puntuacion interno, reencuadre 9:16 con seguimiento facial, generacion de subtitulos animados en formato ASS y calculo de una puntuacion de viralidad desglosada en Hook, Flow, Value y Trend.

El repositorio tiene un tamano declarado de 0.0 GB, cero descargas y cero likes en el momento de la consulta, y no especifica licencia, idiomas ni pipeline. La model card esta redactada mayoritariamente en hindi/hinglish y describe el producto, no un checkpoint de pesos: no hay parametros, arquitectura de red ni contexto que documentar.

Su relevancia practica reside en que empaqueta en una sola aplicacion un flujo de trabajo que normalmente requiere varias herramientas (transcripcion, LLM, vision para face tracking, renderizado FFmpeg) y ofrece un arranque de un solo clic en Windows, macOS y Linux, ademas de despliegue con Docker. Es, por tanto, una pieza de infraestructura de contenido, no un modelo evaluable con benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Aplicacion web (FastAPI + Uvicorn) orquestando Whisper, LLM externo, face tracking y FFmpeg; no es un modelo de red neuronal propio |
| Parametros totales | no disponible (no aplica: no publica pesos) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (depende del LLM externo configurado via `LLM_API_KEY`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Transcripcion en 90+ idiomas segun Whisper (hindi, hinglish, ingles mencionados explicitamente); subtitulos en devanagari requieren fuente Noto Sans Devanagari |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio contiene codigo de aplicacion, no safetensors ni GGUF) |

## Arquitectura y entrenamiento

La aplicacion se organiza en modulos Python claramente separados segun la model card: `app/main.py` (servidor web, cola de trabajos y API), `app/pipeline.py` (orquesta descarga, transcripcion, seleccion y renderizado), `app/selector.py` (seleccion de momentos con LLM y calculo de viralidad), `app/reframe.py` (recorte inteligente con seguimiento facial), `app/captions.py` (generacion de subtitulos animados en ASS) y `static/index.html` (interfaz completa). El frontend es una unica pagina estatica servida por el propio backend.

No hay entrenamiento propio documentado. La transcripcion se delega en Whisper (por defecto el modelo `small`, aproximadamente 250 MB, descargado en el primer arranque), la seleccion de momentos en un LLM externo opcional (OpenAI, Groq o Gemini) o en un motor de puntuacion interno cuando no se configura clave, y el renderizado en FFmpeg. La innovacion tecnica destacable es la integracion: limpieza de muletillas y silencios largos, ducking automatico de la musica de fondo cuando entra la voz, zoom automatico cada cuatro segundos y reencuadre con seguimiento facial para formatos 9:16, 1:1, 4:5 y 16:9.

## Capacidades

- Importacion de video desde enlaces de YouTube o cualquier URL compatible con `yt-dlp`, o mediante carga de archivo por arrastrar y soltar.
- Transcripcion a nivel de palabra con Whisper en mas de 90 idiomas, con soporte explicito para hindi, hinglish e ingles.
- Seleccion de momentos mediante LLM externo o motor de puntuacion interno sin clave de API.
- Instruccion en lenguaje natural para filtrar momentos ("donde se hable de dinero"), longitudes de clip predefinidas (auto, menos de 30 s, 30-60 s, 60-90 s, 90 s-3 min), numero de clips y rango temporal.
- Reencuadre inteligente con seguimiento facial en relaciones de aspecto 9:16, 1:1, 4:5 y 16:9, con dos modos de maquetacion: relleno con seguimiento o ajuste con fondo desenfocado.
- Cuatro estilos de subtitulos animados (Karaoke, Bold, Boxed, Minimal) con resaltado palabra a palabra.
- Generacion de titular gancho para los tres primeros segundos.
- Puntuacion de viralidad con subpuntuaciones (Hook, Flow, Value, Trend), titulo generado por IA y transcripcion por clip.
- Limpieza de voz: eliminacion automatica de muletillas ("umm", "uhh") y silencios largos.
- Kit de marca: logotipo en cuatro posiciones y color de marca para subtitulos.
- Musica de fondo con atenuacion automatica al detectar voz.
- Barra de progreso inferior y zoom automatico cada cuatro segundos.
- Generacion de pie de publicacion social y cinco hashtags por clip, con boton de copia.
- Editor de clip: recorte de inicio y fin, cambio de titulo y de estilo o color de subtitulos, con re-renderizado solo de ese clip.
- Descarga de subtitulos en SRT y exportacion de todos los clips en ZIP junto con los SRT y un archivo `captions_hashtags.txt`.

## Casos de uso

- Repurposing de contenido para creadores: un podcast de una hora se procesa en una sola pasada para obtener entre cinco y diez clips verticales con subtitulos animados, listos para TikTok, Reels o Shorts, gracias a la seleccion automatica de momentos y al reencuadre 9:16.
- Agencias de marketing de contenidos: el kit de marca (logotipo y color) y la exportacion ZIP con clips, SRT y pies de publicacion permiten entregar paquetes completos a clientes sin postproduccion manual.
- Clipping multilingue para audiencias de la India: la transcripcion en hindi, hinglish e ingles con Whisper, junto con el soporte de fuente devanagari, cubre un nicho mal atendido por herramientas comerciales orientadas solo al ingles.
- Produccion de clips sin coste de API: el motor de puntuacion interno permite usar la aplicacion sin clave de LLM, util para prototipos, demos o entornos con restricciones de presupuesto.
- Despliegue autoalojado en servidor propio: con Docker y un servidor de 4 GB de RAM o mas (Hetzner, DigitalOcean, AWS Lightsail) o una instancia GPU en RunPod, equipos con requisitos de privacidad pueden procesar material sin subirlo a servicios de terceros.
- Generacion de subtitulos y transcripciones: el flujo produce SRT por clip y transcripcion completa, reutilizables para accesibilidad, SEO o republicacion en blogs.
- Edicion rapida de ultima milla: el editor integrado permite ajustar recortes y titulos de clips concretos y re-renderizar solo esos, lo que reduce el tiempo de iteracion frente a reexportar todo el lote.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; la aplicacion delega la transcripcion en Whisper `small` (aproximadamente 250 MB de pesos) y el resto del procesamiento es CPU/FFmpeg. El face tracking puede ejecutarse en CPU, aunque la model card no detalla el backend.
- Servidor minimo indicado por el autor: 4 GB de RAM o mas para despliegue en Hetzner, DigitalOcean o AWS Lightsail.
- GPU recomendadas: no disponibles; el autor menciona RunPod como opcion cuando se quiere GPU, sin especificar modelo.
- Compatibilidad con GPU de consumo: no confirmada en la informacion proporcionada; presumiblemente viable con Whisper en GPU, pero sin datos oficiales.
- Opciones de despliegue: ejecucion local con `uvicorn app.main:app --port 8000`, scripts de un clic (`START-ClipForge.bat` en Windows, `./start-clipforge.sh` en Mac/Linux) y Docker (`docker build -t clipforge .` seguido de `docker run -p 8000:8000 --env-file .env clipforge`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Exposicion publica: Cloudflare mas proxy inverso Nginx para asociar un dominio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Herramienta | Tipo | Parametros | Contexto | Licencia | Autoalojable | Notas |
|---|---|---|---|---|---|---|
| ClipForge | Aplicacion de clipping con IA | no aplica | no disponible | no disponible | Si (local o Docker) | Whisper + LLM externo + FFmpeg; sin datos de rendimiento |
| OpusClip | Servicio SaaS comercial | no disponible | no disponible | Propietaria | No | Referencia funcional citada por el autor |
| Whisper (OpenAI) | Modelo ASR | 39 M - 1.55 B segun variante | 30 s por ventana | MIT (variantes abiertas) | Si | Componente de transcripcion usado por ClipForge |
| FFmpeg | Suite multimedia | no aplica | no aplica | LGPL/GPL segun build | Si | Motor de renderizado y recorte |

No se dispone de datos de rendimiento comparativos entre ClipForge y alternativas; la comparacion anterior es funcional, no cuantitativa.

## Limitaciones y advertencias

- No es un modelo de IA: no publica pesos, parametros ni benchmarks, por lo que no puede evaluarse como checkpoint ni compararse en tareas de lenguaje.
- Licencia no especificada: la ausencia de licencia explicita impide determinar si el uso comercial esta permitido; debe consultarse al autor antes de desplegarlo en produccion.
- Dependencia de servicios externos: la calidad de la seleccion de momentos depende del LLM configurado (OpenAI, Groq o Gemini); sin clave se usa el motor interno, de calidad presumiblemente inferior.
- Riesgo de bloqueo de YouTube: la propia model card advierte que YouTube bloquea algunas IP de servidores en la nube; se sugiere usar cookies con `yt-dlp` o pedir al usuario que suba el archivo.
- Idiomas y fuentes: los subtitulos en devanagari requieren instalar manualmente la fuente Noto Sans Devanagari y editar `app/captions.py`; no funciona de fabrica.
- Madurez del proyecto: cero descargas y cero likes en el momento de la consulta, creado y actualizado el mismo dia (5 de noviembre de 2026), con un roadmap que aun incluye funciones basicas como login, creditos y edicion avanzada.
- Riesgo de alucinacion en titulos y pies de publicacion: al generarse con LLM externo, pueden contener afirmaciones no presentes en el video.
- Sesgos: no documentados; el seguimiento facial puede comportarse de forma desigual con rostros no frontales, multiples personas o iluminacion deficiente, aunque no hay evaluacion publicada al respecto.
- Sin garantias de escalabilidad: la cola de trabajos es interna y no se documentan limites de concurrencia ni rendimiento bajo carga.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/thakurclipforge/clipforge-app
- Whisper (OpenAI), componente de transcripcion: https://github.com/openai/whisper
- yt-dlp, componente de descarga: https://github.com/yt-dlp/yt-dlp
- FFmpeg, componente de renderizado: https://ffmpeg.org/
- Groq Console, proveedor de LLM gratuito sugerido: https://console.groq.com
- OpusClip, referencia funcional citada por el autor: https://www.opusclip.com
- No se han encontrado en la informacion proporcionada papers, blogs, demos ni repositorios adicionales del autor.
