# sunnyyy/Qwen3.8-27B-nvfp4-NInfer

## Resumen

Qwen3.8-27B-nvfp4-NInfer es un perfil de pesos cuantizados del modelo multimodal Qwen3.8-27B de Qwen, preparado específicamente para el runtime de inferencia NInfer. El artifact, publicado por sunnyyy (y vinculado al repositorio de neroued, autor de NInfer), combina el checkpoint oficial en BF16 con los pesos NVFP4 empaquetados por Unsloth, y los empaqueta en el formato nativo `.ninfer` de NInfer. No es un checkpoint de Transformers ni un archivo GGUF: solo puede ejecutarse con NInfer, un runtime especializado en inferencia de una sola GPU.

El modelo base Qwen3.8-27B es un transformer denso de 27 000 millones de parámetros con capacidades de texto e imagen, ventana de contexto de 256 000 tokens y modo de razonamiento explícito (thinking). La cuantización NVFP4 reduce el peso del artifact a 20,02 GiB, lo que permite ejecutar el modelo completo en una GPU consumer de gama alta como la RTX 5090 (32 GB de VRAM). El perfil mezcla formatos: las capas de texto 0 a 55 usan NVFP4 en los MLP, mientras que el embedding, las proyecciones de atención, la cabeza de salida y las capas 56 a 63 usan FP8 con escala por filas; los pesos de control se mantienen en BF16.

La relevancia de este artifact radica en que NInfer es un runtime de altas prestaciones diseñado para un único modelo residente en una única GPU, con soporte para decodificación especulativa MTP (multi-token prediction) y procesamiento multimodal (imagen, vídeo y mensajes mixtos). Está pensado para desarrolladores que quieren ejecutar un modelo de 27B con calidad cercana al original en hardware consumer, sin depender de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto + vision), denso |
| Parametros totales | 27 000 millones (27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 256 000 tokens (contexto del modelo base) |
| Tipos de cuantizacion | NVFP4 (MLP de capas 0-55), FP8 row-scaled (embedding, atencion, cabeza de salida, capas 56-63), BF16 (pesos de control) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `.ninfer` (formato nativo de NInfer, contenedor version 2) |

## Arquitectura y entrenamiento

El artifact no es un modelo reentrenado, sino una cuantizacion del checkpoint oficial Qwen/Qwen3.8-27B. La arquitectura subyacente es un transformer multimodal con un encoder de vision, capaz de procesar imagenes, video y texto. El modelo base fue entrenado por Qwen con un pipeline que incluye datos textuales y multimodales, y soporta modos de razonamiento explicito (thinking) y no-thinking, ademas de decodificacion especulativa MTP.

La cuantizacion sigue el perfil NVFP4 de Unsloth, que empaqueta los pesos de las capas MLP de texto en formato NVFP4 (4 bits con escala por bloque) y el resto de proyecciones en FP8 con escala por filas. El artifact de NInfer conserva los pesos BF16 de control, el encoder de vision, el modulo MTP y la cabeza de propuesta optimizada. No se aplica ninguna re-cuantizacion ni decodificacion de los pesos fuente: los valores NVFP4 y FP8 se copian directamente del checkpoint de Unsloth, y solo el embedding de tokens se codifica localmente en FP8 row-scaled a partir del checkpoint BF16 oficial.

El runtime NInfer esta disenado para una sola GPU y un solo modelo residente, con capacidad fija de 1 a 8 peticiones activas. El artifact incluye todos los objetos necesarios: tokenizer, plantilla de chat, configuracion de generacion, procesador de medios y el grafo de ejecucion para las hojas NVFP4 y FP8.

## Capacidades

- Generacion de texto en modos thinking y non-thinking, con control sobre la profundidad del razonamiento.
- Procesamiento multimodal: imagenes individuales, multi-imagen, video y mensajes mixtos de texto e imagen.
- Decodificacion especulativa MTP con hasta 3 tokens de draft, lo que acelera la generacion en hardware Blackwell.
- Hereda las capacidades del modelo base Qwen3.8-27B: razonamiento, codigo, matematicas, vision y chat agéntico.
- Soporte de tool calling y function calling (capacidad del modelo base, no confirmada explicitamente en la model card del artifact).
- Integracion con el runtime NInfer para servir peticiones HTTP y gestionar historiales de chat estructurados.

## Casos de uso

- Inferencia local en una RTX 5090: el artifact esta disenado para ejecutarse en una unica GPU Blackwell de 32 GB, permitiendo a desarrolladores individuales o equipos pequenos desplegar un modelo de 27B sin infraestructura cloud.
- Asistente multimodal de escritorio: al soportar imagen y video, puede usarse para describir capturas de pantalla, analizar diagramas o responder preguntas sobre contenido visual en tiempo real.
- Razonamiento avanzado en entornos sin conexion: el modo thinking permite resolver problemas de matematicas, logica o ciencia con cadenas de razonamiento extensas, util en aplicaciones educativas o de investigacion.
- Desarrollo de agentes autonomos: con tool calling y soporte de chat multi-turno, puede integrarse en pipelines agénticos que necesitan planificacion y ejecucion de acciones, aprovechando la decodificacion MTP para reducir la latencia.
- Servicio HTTP local: NInfer incluye documentacion para servir el modelo mediante HTTP, lo que permite construir APIs internas de generacion de texto o vision para aplicaciones corporativas sin depender de terceros.
- Prototipado rapido de aplicaciones multimodales: al ser un unico archivo de 20 GiB, se puede descargar y ejecutar en minutos, ideal para validar ideas antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Los siguientes resultados estan declarados por el autor del modelo en el model-index de HuggingFace. No han sido verificados de forma independiente (campo `verified: false`).

| Tarea | Dataset | Metrica | Resultado |
|---|---|---|---|
| Text generation | IFBench | Prompt-level strict (0-shot, rule) | 77,00 |
| Text generation | AIME 2025 | Accuracy (0-shot, rule) | 96,67 |
| Text generation | AIME 2026 | Accuracy (0-shot, rule) | 96,67 |
| Text generation | GPQA-Diamond | Accuracy (0-shot, rule) | 90,40 |
| Image text to text | ERQA | Accuracy (0-shot, rule) | 66,25 |
| Image text to text | RealWorldQA | Accuracy (0-shot, rule) | 83,53 |

No se dispone de datos de latencia ni throughput en la informacion proporcionada.

## Requisitos de hardware

- GPU obligatoria: NVIDIA GeForce RTX 5090 (arquitectura Blackwell, `sm_120a`). No se soportan otras GPUs.
- VRAM: el artifact pesa 20,02 GiB; la RTX 5090 dispone de 32 GB, por lo que el modelo cabe con margen para el contexto y las activaciones. No se indica un minimo de VRAM exacto.
- CUDA Toolkit 13.1 o superior.
- Sistema operativo: Linux de 64 bits.
- Runtime: NInfer, compilado desde fuente en la revision `5d2c1f5` o posterior. No hay binarios precompilados ni instalador.
- Despliegue: exclusivamente mediante NInfer. No es compatible con vLLM, llama.cpp, Ollama, TGI ni Transformers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Runtime | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-27B-nvfp4-NInfer (este) | 27B | 256K | `.ninfer` (NVFP4/FP8) | NInfer | Apache-2.0 |
| Qwen/Qwen3.8-27B (base) | 27B | 256K | Safetensors (BF16) | Transformers, vLLM, etc. | Apache-2.0 |
| unsloth/Qwen3.8-27B-NVFP4 | 27B | 256K | NVFP4 (formato Unsloth) | Unsloth, Transformers | Apache-2.0 |

La diferencia principal frente al checkpoint base es el tamano: el artifact NInfer ocupa 20,02 GiB frente a los aproximadamente 54 GiB del BF16 original, lo que permite ejecutarlo en una GPU consumer. Frente a la version NVFP4 de Unsloth, este artifact esta empaquetado especificamente para NInfer e incluye el modulo MTP y el encoder de vision en el mismo contenedor, mientras que la version de Unsloth se distribuye como checkpoint de Transformers y requiere un runtime compatible con ese formato.

## Limitaciones y advertencias

- El artifact solo funciona con NInfer; no es un checkpoint de Transformers, Safetensors ni GGUF. Intentar cargarlo con otros runtimes fallara.
- Requiere hardware especifico: una RTX 5090 con arquitectura Blackwell. No es compatible con GPUs Ampere, Ada Lovelace ni anteriores.
- No hay binarios precompilados de NInfer; el usuario debe compilar el runtime desde el codigo fuente, lo que anade una barrera de entrada.
- Los benchmarks declarados no estan verificados de forma independiente (`verified: false`), por lo que los resultados deben tomarse con cautela.
- No se especifican los idiomas soportados; se asume que hereda los del modelo base, pero no esta documentado en la model card.
- Al ser una cuantizacion agresiva (NVFP4 en capas MLP), puede haber una degradacion de calidad frente al modelo BF16, especialmente en tareas que requieren precision numerica alta.
- El runtime esta limitado a 1-8 peticiones activas simultaneas, lo que lo hace inadecuado para servicios con alta concurrencia.
- No se proporcionan datos de latencia, throughput ni consumo energetico, lo que dificulta la planificacion de capacidad.

## Enlaces

- Repositorio HuggingFace del artifact: https://huggingface.co/sunnyyy/Qwen3.8-27B-nvfp4-NInfer
- Repositorio HuggingFace de la version canónica (neroued): https://huggingface.co/neroued/Qwen3.8-27B-nvfp4-NInfer
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Pesos NVFP4 de Unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-NVFP4
- Repositorio de NInfer: https://github.com/Neroued/ninfer
- Documentacion de NInfer: https://github.com/Neroued/ninfer/tree/master/docs
- Guia de ejecucion local de Qwen3.8 (dev.to): https://dev.to/jamilxt/qwen-38-27b-topped-hacker-news-in-a-day-heres-how-to-run-it-locally-from-spring-boot-cee
- Documentacion de Unsloth para Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
