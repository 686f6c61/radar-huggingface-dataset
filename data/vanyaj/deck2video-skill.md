# VanyaJ/deck2video-skill

## Resumen

Deck2Video Agent Skill (identificador `VanyaJ/deck2video-skill`) es un paquete de habilidad para agentes de codigo con IA que convierte documentos de presentacion en videos MP4 de 1920x1080. Acepta como entrada ficheros de PowerPoint (`.pptx`), Word (`.docx`), Markdown (`.md`/`.txt`), HTML y JSON, y a partir de ellos extrae la estructura de la presentacion para generar un video con interfaz de estilo "dark neon glass", fondo animado de particulas 3D, barra de progreso de capitulos, cinco tipos de escenas animadas, narracion, seis efectos de sonido de interfaz y musica de fondo con atenuacion automatica.

No se trata de un modelo de lenguaje con pesos neuronales, sino de un conjunto de scripts en Python y activos (fuentes, librerias JS, audio) empaquetados como "skill" para agentes como Claude Code, Google Antigravity, Cursor, Codex o Windsurf. El repositorio ocupa 0,2 GB e incluye un instalador y un modo de funcionamiento completamente offline pensado para entornos de red cerrada, sin dependencia de Node.js ni de conexion a internet.

Su relevancia actual radica en la creciente adopcion de habilidades reutilizables por parte de agentes de codigo, y en el requisito de operar en entornos aislados (empresas con red cerrada) donde no se pueden instalar paquetes desde la red. El proyecto esta publicado con licencia MIT y declara soporte para coreano e ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (skill de agente basada en scripts Python + HTML/JS + FFmpeg) |
| Parametros totales | No disponible (no es un modelo neuronal) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Coreano (ko), ingles (en) |
| Licencia | MIT |
| Formato de pesos | No disponible (el repositorio contiene scripts `.py`, `.sh`, `.ps1`, activos `.woff2`, `.js`, `.wav`, `.mp3` y paquetes `.whl`) |

## Arquitectura y entrenamiento

El proyecto no entrena ningun modelo. Se compone de una serie de modulos Python que forman un pipeline de conversion: `ingest_parser.py` parsea documentos de multiples formatos (`.pptx`, `.docx`, `.md`, `.txt`, `.html`, `.json`); `html_builder.py` compila el HTML de salida con un canvas de ondas de puntos 3D, un HUD de capitulos y cinco plantillas de escena (`arc_cards`, `mockup_steps`, `book_quote`, `terminal_flow`, `metric_summary`), ademas de subtitulos bilingues coreano-ingles; `sfx_engine.py` y `bgm_engine.py` sintetizan seis efectos de sonido de interfaz a 48 kHz estereo y musica de fondo hibrida; y `offline_renderer.py` renderiza el MP4 final usando el navegador local (Chrome o Edge) mediante el protocolo CDP y FFmpeg, sin requerir Node.js ni npm.

El repositorio incluye el fichero `SKILL.md`, que actua como especificacion de la habilidad para que el agente de IA la reconozca e instale de forma automatica, y proporciona scripts de instalacion diferenciados para macOS/Linux y Windows, tanto en modo online como offline. Para el modo offline se incluyen paquetes `.whl` precompilados para `win_amd64`, macOS `arm64` y Linux `manylinux_x86_64`, junto con la fuente variable `PretendardVariable.woff2`, `gsap.min.js` y los audios pregenerados. No se documenta ningun proceso de entrenamiento, ajuste fino ni datos de entrenamiento.

## Capacidades

- Conversion de documentos `.pptx`, `.docx`, `.md`, `.txt`, `.html` y `.json` a video MP4 de 1920x1080.
- Extraccion automatica de la estructura de la presentacion (capitulos, secciones, contenido).
- Generacion de cinco tipos de escenas animadas con plantillas especificas.
- Sintesis de narracion mediante TTS del sistema operativo en modo offline (voz coreana nativa) o voces neuronales en modo online (por ejemplo, `ko-KR-SunHiNeural`).
- Generacion de subtitulos bilingues coreano-ingles.
- Sintesis propia de seis efectos de sonido de interfaz y musica de fondo con atenuacion automatica (ducking), sin depender de bancos de audio de pago.
- Renderizado 100% offline mediante navegador local (CDP) y FFmpeg, sin Node.js ni conexion a internet.
- Integracion como habilidad de agente de codigo con instalacion guiada por prompt (Claude Code, Antigravity, Cursor, Codex, Windsurf).
- Soporte de instalacion en red cerrada mediante paquetes `.whl` incluidos.

## Casos de uso

- Generacion automatica de videos de clase o ponencias a partir de presentaciones `.pptx`: el pipeline extrae los capitulos y el contenido de las diapositivas y produce un MP4 con narracion y subtitulos, adecuado para docentes que quieren publicar material en video sin editar manualmente.
- Conversion de propuestas o informes en `.docx` a video resumen: util en entornos corporativos para presentar documentos extensos en formato audiovisual con estructura de capitulos y barra de progreso.
- Transformacion de notas o documentacion en Markdown a videos divulgativos: permite generar contenido para redes o formacion interna a partir de ficheros de texto ya existentes, con voz neuronal configurable.
- Produccion de videos a partir de slides HTML: equipos que ya generan presentaciones web pueden reutilizar su HTML como entrada y obtener un MP4 con animaciones y audio.
- Despliegue en entornos de red cerrada: gracias al modo `--offline` y a los paquetes `.whl` incluidos, se puede instalar y ejecutar sin acceso a internet, algo relevante en administraciones publicas o empresas con restricciones de red.
- Automatizacion dentro de un agente de codigo: un agente como Claude Code puede instalar la skill y generar videos de forma autonoma como parte de un flujo de trabajo mayor (por ejemplo, documentar un proyecto a partir de su README en Markdown).
- Generacion de material formativo con subtitulos bilingues coreano-ingles: util para audiencias internacionales o para aprendizaje de idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el proyecto no ejecuta modelos neuronales locales.
- GPU recomendadas: no aplica; el renderizado se realiza por CPU mediante navegador y FFmpeg.
- Requisitos de software declarados: Python 3.12, FFmpeg y navegador Chrome o Edge (para el modo offline). En modo online, los scripts de instalacion gestionan las dependencias Python.
- Cabe en cualquier equipo de consumo que cumpla los requisitos de software anteriores; no se especifican requisitos minimos de CPU, RAM ni disco mas alla del tamano del repositorio (0,2 GB).
- Opciones de despliegue: instalacion local mediante `install_mac_linux.sh`, `install_windows.ps1`, `install_offline_mac_linux.sh` o `install_offline_windows.ps1`, y ejecucion mediante la CLI `deck2video` o `produce_deck_video.py`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Proyecto | Tipo | Entradas | Salida | Licencia | Modo offline |
|---|---|---|---|---|---|
| Deck2Video Agent Skill | Skill de agente (Python + HTML/JS + FFmpeg) | `.pptx`, `.docx`, `.md`, `.txt`, `.html`, `.json` | MP4 1080p con narracion y efectos | MIT | Si, documentado |
| Alternativas de conversion presentacion a video | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible | No disponible |

No se dispone de informacion sobre proyectos comparables en la documentacion proporcionada; la comparativa con alternativas concretas queda como no disponible.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni razona; su funcion es transformar documentos en video mediante plantillas y reglas.
- Idiomas declarados limitados a coreano e ingles; no se documenta soporte de castellano ni de otras lenguas, lo que puede limitar su uso en entornos hispanohablantes.
- La calidad del video depende de la estructura del documento de entrada y de las cinco plantillas de escena disponibles; no se documenta personalizacion mas alla de las plantillas incluidas.
- El modo offline usa el TTS nativo del sistema operativo, por lo que la calidad y disponibilidad de voces depende de la plataforma.
- El modo offline requiere Chrome o Edge instalados y Python 3.12; no funciona en sistemas sin navegador compatible.
- Riesgo de errores de extraccion en documentos con estructuras complejas (tablas, graficos, formatos no estandar); no se documenta el comportamiento en esos casos.
- Al no ejecutar modelos neuronales, no hay riesgo de alucinacion en el sentido habitual, pero si posible perdida o distorsion de contenido al parsear documentos.
- La licencia MIT permite uso comercial, pero el repositorio incluye activos de terceros (fuente Pretendard, GSAP) cuyas condiciones de licencia no se detallan en la informacion proporcionada; conviene verificarlas antes de un uso comercial.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo dia (2026-11-17), lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/VanyaJ/deck2video-skill
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion proporcionada.
