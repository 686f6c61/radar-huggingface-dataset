# wesjos/Qwen3.5-4B-HTML-v2

## Resumen

Qwen3.5-4B-HTML-v2 es un ajuste fino (fine-tuning) supervisado del modelo multimodal Qwen/Qwen3.5-4B, publicado por el usuario wesjos en Hugging Face. El modelo está especializado en la generación de HTML estructurado y visualmente presentable a partir de instrucciones de texto y, opcionalmente, de una imagen de entrada. Su propósito es sustituir la salida conversacional típica en Markdown por fragmentos HTML autocontenidos que se renderizan directamente en una interfaz web con un contrato de clases CSS predefinido.

El modelo conserva la arquitectura del base: `Qwen3_5ForConditionalGeneration`, con aproximadamente 4.660 millones de parámetros en bf16 (8,68 GiB), 32 capas (24 de atención lineal y 8 de atención completa), dimensión oculta de 2560 y una ventana de contexto nativa de 262.144 tokens. Se distribuye bajo licencia Apache 2.0 y soporta inglés y chino. El repositorio ocupa 9,4 GB e incluye pesos en safetensors, además de una build GGUF separada (Q8_0, Q4_K_M, F16-mmproj) para llama.cpp.

Su relevancia actual radica en que aborda un nicho concreto: la generación de UI web directamente consumible por un frontend, con un modo de razonamiento (chain-of-thought) que el autor denomina "puro", es decir, sin etiquetas HTML dentro del bloque `<think>`. Esto lo hace útil para pipelines donde el razonamiento debe separarse limpiamente de la salida renderizable. Es un modelo pequeño (4,66 B), por lo que cabe en GPU de consumo y en entornos con recursos limitados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForConditionalGeneration` (transformer híbrido: 24 capas de atención lineal + 8 de atención completa) |
| Parámetros totales | 4.659.865.088 (≈4,66 B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens nativo |
| Tipos de cuantización | bf16 (pesos originales); GGUF en Q8_0, Q4_K_M y F16-mmproj (repositorio separado) |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); GGUF en el repositorio `wesjos/Qwen3.5-4B-HTML-v2-GGUF` |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer multimodal de tipo image-text-to-text con 32 capas, de las cuales 24 emplean atención lineal y 8 atención completa, con una dimensión oculta de 2560. Esta combinación híbrida reduce el coste computacional en contextos largos manteniendo capacidad de atención global en un subconjunto de capas. El ajuste fino se realizó mediante SFT (supervised fine-tuning) sobre el dataset `wesjos/mario-html-sft`, orientado a la generación de HTML con un vocabulario de clases CSS concreto.

La innovación principal declarada por el autor es el "zero-system-prompt" y la "cot purity": el modelo puede generar trazas de razonamiento (`<think>`) sin etiquetas HTML dentro de ellas, planificando en texto plano la estructura de la página antes de emitir el marcado. La versión v2 reduce la presencia de etiquetas HTML en el CoT respecto a v1. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO; estos datos figuran como no disponibles en la model card.

## Capacidades

- Generación de HTML estructurado a partir de instrucciones en lenguaje natural, con un contrato de componentes definido (`ai-view`, `summary`, `card`, `grid`, `metric-group`, `stepper`, `callout`, `badge`, `table-container`, `feature-list`, `code-box`).
- Entrada multimodal: acepta texto e imagen (image-text-to-text) para generar HTML, útil para tareas de visual-question-answering orientadas a UI.
- Modo de razonamiento (thinking mode) con trazas `<think>` en texto plano, activable o desactivable; por defecto el WebUI incluido lo desactiva (`enable_thinking: false`).
- Conversación multi-turno con contexto largo gracias a los 262.144 tokens de ventana.
- Soporte de inglés y chino en la generación de contenido y en las trazas de razonamiento.
- Capacidad aritmética básica (el autor advierte que es fiable pero no para cadenas largas de decimales).
- No se menciona soporte explícito de tool calling ni function calling en la información disponible.

## Casos de uso

- Generación de interfaces web en producción: el modelo produce fragmentos HTML con clases CSS predefinidas que se renderizan directamente en un frontend con `theme.css`, eliminando la necesidad de un renderizador Markdown intermedio.
- Asistentes conversacionales con salida visual: cada respuesta se presenta como una página estructurada (resumen, tarjetas, métricas), adecuada para chatbots donde la presentación importa tanto como el contenido.
- Generación de dashboards y fichas de datos: el contrato incluye `metric-group`, `metric-card` y `table-container`, lo que permite generar paneles con métricas y tablas a partir de una descripción textual.
- Documentación técnica automatizada: con `code-box` y `feature-list`, el modelo puede producir documentación con bloques de código y listas de características estructuradas.
- Análisis de imágenes de UI (visual-question-answering): al aceptar image-text-to-text, puede describir o reconstruir en HTML la estructura de una captura de pantalla.
- Prototipado rápido de páginas: el WebUI incluido con nueve presets de tema (`editorial`, `apple`, `notion`, `cyber`, etc.) permite iterar sobre el diseño sin escribir CSS manualmente.
- Aplicaciones multilingües en inglés y chino: útil para equipos que necesitan generar contenido web en ambos idiomas con el mismo modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9,3 GB solo para pesos (8,68 GiB), más overhead de activaciones y KV cache; en la práctica se recomienda 16 GB o más para contexto moderado.
- Cuantización Q8_0 GGUF: alrededor de 5 GB de pesos, apta para GPU de 8 GB con contexto reducido.
- Cuantización Q4_K_M GGUF: alrededor de 3 GB de pesos, permite ejecución en GPU de consumo de 6-8 GB o incluso en CPU.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A100 (40/80 GB) y H100 para contextos largos; en GPU de 8 GB (RTX 3060 Ti, RTX 4060) solo con cuantización Q4_K_M y contexto limitado.
- Opciones de despliegue: transformers (pesos safetensors), llama.cpp con los GGUF del repositorio `wesjos/Qwen3.5-4B-HTML-v2-GGUF`, vLLM (el autor indica que `--reasoning-parser qwen3` requiere una versión reciente de vLLM) y el WebUI propio incluido en `webui/`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Especialización |
|---|---|---|---|---|---|
| wesjos/Qwen3.5-4B-HTML-v2 | ≈4,66 B | 262.144 | image-text-to-text | Apache 2.0 | Generación de HTML/UI |
| Qwen/Qwen3.5-4B (base) | ≈5 B (según búsqueda) | no disponible | image-text-to-text | no disponible | Modelo general multimodal |
| Qwen/Qwen3-4B | 4 B | no disponible | text generation | no disponible | Generación de texto general |

El modelo se diferencia de sus bases por el ajuste específico a HTML y por el contrato de clases CSS, no por tamaño ni por contexto. Para tareas generales de texto, el base Qwen3.5-4B o Qwen3-4B son alternativas más versátiles; para generación de UI web, este ajuste es la opción directa dentro de la familia.

## Limitaciones y advertencias

- La salida es HTML, no Markdown; alimentar un renderizador Markdown produce etiquetas en crudo.
- El vocabulario de clases CSS es un contrato cerrado: clases nuevas arbitrarias no están garantizadas y deben gestionarse mediante un `theme.css` personalizado.
- El WebUI incluido trae un `system_prompt` no vacío por defecto; para la ruta zero-system-prompt hay que vaciarlo manualmente.
- El WebUI también trae `enable_thinking: false` por defecto, por lo que las trazas CoT no se muestran salvo que se activen.
- La aritmética es fiable pero no de grado bancario; las cadenas largas de decimales deben verificarse.
- `webui/run_webui.sh` está orientado a Linux, con rutas de intérprete y `TMPDIR` codificadas; `config.json` es portable pero el script requiere adaptación.
- `webui/start.sh` espera un `start_backend.sh` hermano que no forma parte del repositorio.
- Solo se declaran inglés y chino; el rendimiento en castellano no está documentado.
- Riesgo de alucinación inherente a modelos de 4,66 B, especialmente en contenido factual y en cadenas aritméticas largas.
- No se dispone de información sobre sesgos específicos del ajuste; aplican los del modelo base.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-4B debe verificarse por si impone condiciones adicionales no reflejadas aquí.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wesjos/Qwen3.5-4B-HTML-v2
- GGUF / llama.cpp: https://huggingface.co/wesjos/Qwen3.5-4B-HTML-v2-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de SFT: https://huggingface.co/datasets/wesjos/mario-html-sft
- Qwen3-4B (referencia de la familia): https://huggingface.co/Qwen/Qwen3-4B
