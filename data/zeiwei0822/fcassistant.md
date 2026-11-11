# zeiwei0822/FCAssistant

## Resumen

FCAssistant es una aplicación de escritorio completa, no un modelo de lenguaje en sentido estricto. El repositorio de Hugging Face `zeiwei0822/FCAssistant` distribuye un paquete offline y portátil de pregunta-respuesta sobre manuales corporativos, ejecutable en Windows y Linux sin instalación ni conexión de red. La inferencia se delega en `llama.cpp` mediante tres procesos `llama-server` locales que atienden, respectivamente, la generación de respuestas, la vectorización de fragmentos y el reordenamiento de resultados.

El sistema implementa un pipeline RAG cerrado: importa PDF, PDF escaneado con OCR, Word, Excel y PowerPoint, segmenta el texto, lo vectoriza y lo almacena en una base de datos SQLite con índice vectorial y FTS5 para búsqueda léxica. En consulta combina recuperación vectorial y por palabras clave con fusión RRF, reordena los fragmentos y compone el prompt para el modelo conversacional, que responde en chino tradicional con citas de la fuente.

La relevancia del proyecto es práctica: empaqueta en unos 5,1 GB por plataforma un asistente documental que funciona con 16 GB de RAM y sin GPU, orientado a entornos con requisitos de confidencialidad o conectividad limitada. El modelo conversacional por defecto es Google Gemma 4 E4B en cuantización Q4_K_M, acompañado de IBM Granite Embedding 311M Multilingual R2 y un reranker multilingüe pequeño; el código propio se publica bajo licencia MIT.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Aplicación RAG en C# / Avalonia sobre llama.cpp; modelo conversacional transformer denso (Gemma 4 E4B) |
| Parámetros totales | No disponible para el modelo conversacional (el paquete incluye además un embedding de 311M y un reranker small) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q4_K_M para el modelo conversacional; Q8_0 para el embedding y el reranker |
| Idiomas soportados | Chino (tradicional de Taiwán en la salida; entrada y documentos en chino) |
| Licencia | MIT para el código del proyecto; los modelos y componentes de terceros conservan sus licencias (Gemma 4 E4B y Granite Embedding bajo Apache 2.0 según la model card) |
| Formato de pesos | GGUF (ejecutado por llama.cpp) |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo propio: es un orquestador. La arquitectura se compone de una interfaz Avalonia y una CLI (`fca`) que gestionan tres servidores `llama-server` locales enlazados solo a `127.0.0.1`. El primero sirve el modelo conversacional Gemma 4 E4B Q4_K_M (5,0 GB); el segundo, el modelo de embeddings IBM Granite Embedding 311M Multilingual R2 Q8_0 (350 MB); el tercero, el reranker Horizon-Labs multilingual-reranker-small Q8_0 (160 MB), de arquitectura mmBERT. La ingesta convierte documentos a texto, aplica OCR con PaddleOCR PP-OCRv5 cuando la página extrae menos de 25 caracteres o supera un 10 % de caracteres corruptos, segmenta en fragmentos de unos 450 caracteres y persiste vectores e índice FTS5 en un único archivo SQLite.

Entre las innovaciones de ingeniería destacan la normalización de radicales Kangxi (U+2Fxx) a caracteres Han estándar para no romper la recuperación, la conversión de simplificado a tradicional taiwanés mediante una tabla generada desde OpenCC que solo transforma caracteres exclusivamente simplificados, el filtrado de fragmentos con puntuación de reranking baja (conservando al menos dos), la reescritura de consultas de seguimiento solo cuando son cortas y contienen referencias anafóricas, y el uso de temperatura 0,3 sin penalización de presencia para que el modelo pueda citar literalmente cifras del manual. No se documentan datos de entrenamiento, número de tokens ni etapas de RLHF o DPO, ya que el proyecto no entrena modelos.

## Capacidades

- Respuesta a preguntas sobre documentación corporativa con atribución de la fuente en cada respuesta.
- Ingesta de PDF con texto, PDF escaneado mediante OCR, Word, Excel, PowerPoint y otros formatos soportados por el pipeline.
- Recuperación híbrida: búsqueda vectorial más búsqueda léxica FTS5 con tokenización bigram propia, fusionadas por RRF, con refuerzo para consultas exactas de números de modelo, referencias y códigos.
- Reordenamiento de fragmentos recuperados mediante un reranker multilingüe (coste aproximado de 0,5 s por consulta).
- Conversación multi-turno con reescritura de preguntas de seguimiento.
- Salida exclusivamente en chino tradicional de Taiwán, con conversión automática del texto extraído y de las respuestas.
- Ejecución totalmente offline: sin telemetría ni llamadas de red tras la descarga inicial de dependencias.
- Interfaz gráfica de escritorio y servidor web local opcional (`./tools/fca serve`, puerto 8765).
- CLI para ingesta por lotes, consultas y extracción de texto de un archivo concreto.
- No se documentan capacidades de tool calling, agentes autónomos, visión general, audio ni modo de razonamiento explícito; el modo de pensamiento del modelo conversacional se desactiva en la configuración de generación.

## Casos de uso

- Consulta de manuales de maquinaria o equipos en planta: el operario arrastra el manual al programa y pregunta por intervalos de mantenimiento o sustitución de consumibles; el sistema responde citando el fragmento exacto, lo que permite verificar la respuesta contra el documento original sin conexión.
- Atención interna de recursos humanos: importación de políticas de personal, convenios y procedimientos y consulta en lenguaje natural por parte de empleados, con la ventaja de que los documentos no salen del equipo y se cumple con requisitos de confidencialidad.
- Soporte técnico de primer nivel en entornos aislados: instalación en un portátil sin acceso a internet para resolver dudas sobre procedimientos a partir de la documentación interna, con latencia de primera palabra de 5 a 13 segundos en CPU limitada a cuatro hilos.
- Digitalización de archivos escaneados: el pipeline OCR (aproximadamente 3 segundos por página) permite incorporar documentación en papel al índice y consultarla después con el mismo flujo de pregunta-respuesta.
- Despliegue en servidor sin escritorio: mediante `./tools/fca serve` se expone una interfaz web local en `127.0.0.1:8765`, útil para equipos de desarrollo o para centralizar la base de conocimiento en una máquina de la oficina.
- Validación de cumplimiento normativo: consulta de procedimientos y normativa interna con trazabilidad de la fuente, adecuada para auditorías en las que se requiere justificar cada respuesta con el documento de origen.
- Prototipado de asistentes documentales: al ser código MIT con una CLI clara, sirve como base para adaptar el pipeline RAG a otros dominios o para evaluar la combinación Gemma 4 más Granite Embedding antes de invertir en infraestructura mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card sí incluye mediciones de rendimiento del sistema con la CPU limitada a cuatro hilos para simular un portátil:

| Operación | Tiempo medido |
|---|---|
| Arranque (carga de los tres modelos) | Aproximadamente 4 s |
| Consulta: recuperación más reordenamiento | Aproximadamente 0,5 s |
| Primera palabra de la respuesta (E4B) | 5 a 13 s |
| Primera palabra de la respuesta (E2B) | 1 a 3 s |
| Respuesta completa (E4B) | 6 a 25 s |
| Respuesta completa (E2B) | 2 a 11 s |
| Reescritura de pregunta de seguimiento | Aproximadamente 3 s adicionales |
| Vectorización por fragmento de unos 450 caracteres | Aproximadamente 0,16 s |
| Ingesta de PDF de 1000 páginas con texto | 5 a 10 minutos |
| OCR por página escaneada | Aproximadamente 3 s |

## Requisitos de hardware

- RAM: 16 GB mínimos según el autor; disco de aproximadamente 7 GB libres (el paquete por plataforma ocupa unos 5,1 GB).
- GPU: no necesaria. El sistema está diseñado para ejecución en CPU.
- VRAM estimada para inferencia en GPU: no disponible; el proyecto no documenta despliegue con aceleración por GPU, aunque llama.cpp podría aprovechar una GPU si se recompila y configura, algo no descrito en la model card.
- GPU de consumo compatibles: no aplica en la configuración documentada.
- Despliegue: binarios portátiles para Windows 10/11 x64 y Linux x86-64, con llama.cpp embebido; servidor web local opcional en el puerto 8765; CLI `fca` para ingesta y consultas.
- Latencia y throughput: véase la tabla de rendimiento; el autor indica que reducir el número de fragmentos de referencia, desactivar el reranking o aumentar los hilos de CPU acelera las respuestas.
- Desarrollo: requiere .NET 10 SDK y la ejecución de `scripts/download-deps.sh` (aproximadamente 5,6 GB de descarga) para obtener modelos y binarios de llama.cpp.

## Comparativa con modelos similares

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con otros sistemas. A continuación se comparan alternativas funcionales de la misma categoría (asistentes RAG locales sobre documentación), con los datos disponibles:

| Sistema | Modelo conversacional | Contexto | Licencia | Despliegue | Notas |
|---|---|---|---|---|---|
| FCAssistant | Gemma 4 E4B Q4_K_M (alternativas E2B y Breeze 2 3B) | No disponible | MIT (código); modelos con sus licencias | Paquete portátil Windows/Linux, sin GPU | RAG híbrido con OCR y reranking, salida solo en chino tradicional |
| Alternativa con Ollama más interfaz RAG | Depende del modelo elegido | Depende del modelo | Depende del modelo | Requiere instalar Ollama y una interfaz aparte | Mayor flexibilidad de modelos, pero sin pipeline OCR ni normalización de texto chino integrados |
| Alternativa con llama.cpp y script propio | Depende del modelo | Depende del modelo | Depende del modelo | Requiere montar ingesta, índice y servidor | Control total, pero sin componentes de recuperación léxica ni reranker listos para usar |

No se dispone de datos de rendimiento comparables entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- El modelo está orientado exclusivamente al chino; la interfaz y la documentación del proyecto están en chino tradicional. No hay soporte documentado para consultas o documentos en castellano.
- La salida se fuerza a chino tradicional de Taiwán mediante conversión de caracteres; esto puede alterar terminología técnica o nombres propios que dependan de grafías simplificadas.
- Riesgo de alucinación inherente al modelo generativo: aunque el sistema cita fragmentos, no se documenta ningún mecanismo de verificación automática de que la respuesta se limite al contexto recuperado.
- La política del proyecto excluye modelos de empresas de China continental; el reranker empleado fue entrenado con anotaciones generadas por Qwen3-Reranker y puede desactivarse en la configuración si se aplican criterios más estrictos.
- El rendimiento en CPU es limitado: hasta 25 segundos por respuesta completa con E4B en cuatro hilos, lo que puede resultar insuficiente para interacción en tiempo real.
- La licencia MIT cubre el código del proyecto, no los modelos empaquetados ni llama.cpp, que se distribuyen bajo sus propias licencias; el uso comercial requiere revisar `docs/THIRD-PARTY-NOTICES.txt`.
- El repositorio presenta cero descargas y cero likes en el momento de la consulta, y su fecha de creación es de noviembre de 2026, por lo que no hay evidencia de adopción ni de mantenimiento a largo plazo.
- No se documentan evaluaciones de sesgo, robustez frente a documentos mal formados ni pruebas de seguridad del servidor local más allá del enlace a `127.0.0.1`.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/zeiwei0822/FCAssistant
- Paquete Windows: https://huggingface.co/zeiwei0822/FCAssistant/resolve/main/FCAssistant-win-x64.zip
- Paquete Linux: https://huggingface.co/zeiwei0822/FCAssistant/resolve/main/FCAssistant-linux-x64.zip
- Guía de usuario: https://huggingface.co/zeiwei0822/FCAssistant/blob/main/docs/使用說明.txt
- Avisos de terceros: https://huggingface.co/zeiwei0822/FCAssistant/blob/main/docs/THIRD-PARTY-NOTICES.txt
- llama.cpp: https://github.com/ggml-org/llama.cpp
