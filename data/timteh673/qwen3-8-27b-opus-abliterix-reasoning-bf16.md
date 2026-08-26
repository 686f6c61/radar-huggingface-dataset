# timteh673/Qwen3.8-27B-Opus-Abliterix-Reasoning-BF16

## Resumen

Este modelo es una variante personalizada del modelo vision-language `Qwen/Qwen3.8-27B`, publicada por el usuario `timteh673`. El objetivo declarado es producir un modelo de razonamiento personal y practico que mantenga la negativa a responder (refusal) mucho menos frecuente que el modelo base, sin sacrificar en exceso las capacidades medidas. Para ello se entrena un adaptador QLoRA sobre 12.349 filas de datos de razonamiento, se fusiona en un checkpoint BF16 (llamado `control-bf16`) y despues se aplica Abliterix 1.12.2 pass 1, una tecnica de "desabliteracion" que elimina direcciones residuales en los componentes de escritura del modelo, reduciendo la inhibicion de respuestas.

El resultado es un checkpoint BF16 completo de 27.356 millones de parametros, con arquitectura `Qwen3_5ForConditionalGeneration` (64 capas de texto con hidden size 5120 y un encoder de vision de 27 capas con hidden size 1152), y una ventana de contexto maxima configurada de 262.144 tokens. El modelo hereda del base la capacidad de procesar imagen y texto, y se publica con licencia Apache-2.0. Es relevante porque demuestra un flujo reproducible de "abliteracion" sobre un modelo abierto de ultima generacion, documentando las desviaciones medidas respecto al control en lugar de declarar una superioridad universal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer denso, 64 capas de texto, 27 capas de vision) |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (maximo configurado) |
| Tipos de cuantizacion | BF16 (repo original); el autor menciona conversion adicional a MLX affine 8-bit (group size 64) para macOS |
| Idiomas soportados | no disponible en la model card; el modelo base Qwen3.8 es multilingue |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16), incluye `mtp.safetensors` con 15 tensores MTP nativos |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.8-27B`, un modelo denso vision-language de la serie Qwen3.8, que segun los materiales publicados de Alibaba mejora las capacidades de codificacion y productividad de oficina tanto en texto como en vision. La arquitectura registrada en el config es `Qwen3_5ForConditionalGeneration`, con un stack de texto de 64 capas y hidden size 5120, un schedule de atencion 3:1 (lineal/completa) y un encoder de vision de 27 capas con hidden size 1152.

El proceso de entrenamiento del autor consta de cuatro fases: preparacion de 12.842 filas de razonamiento (reducidas a 12.614 tras deduplicacion y limpieza), entrenamiento de un adaptador QLoRA sobre 12.349 filas de train durante 1.544 pasos de optimizador con 108.789.760 parametros entrenables, fusion del adaptador al checkpoint BF16 inmutable (`control-bf16`) y aplicacion de Abliterals 1.1.2 pass 1 (seed 42). El metodo Abliterals usa residual steering ortogonal/proyectado, con winsorizacion, sobre los componentes de escritura output/down-projection, excluyendo Q/K/V. Se aplicaron 74 ediciones residuales reales sobre los tensores del modelo.

## Capacidades

- Procesamiento de imagen y texto: es un modelo image-text-to-text, capaz de recibir imagenes y generar texto condicionado a ellas.
- Razonamiento paso a paso: el entrenamiento con datos de razonamiento y el pipeline de Abliterals buscan mantener la capacidad de razonar de forma explicita.
- Baja tasa de rechazo de respuestas: segun las mediciones locales del autor, el modelo pasa de un 43.2% de hard refusal a un 0.0%, y de un 14.6% de soft deflection a un 0.2%, con un 99.4% de respuestas sustantivas ante prompts dañinos.
- MTP (multi-token prediction) nativo: conserva el sidecar MTP de 15 tensores, lo que permite generacion asistida con un drafter de una capa.
- Capacidad de vision: 333 tensores de vision en el checkpoint, lo que confirma la preservacion completa del encoder visual.
- Compatible con pipelines de transformers y con MLX para macOS (el autor valido generacion con `mlx-vlm`).

## Casos de uso

- Asistente personal de razonamiento: dado su bajo nivel de rechazo ante prompts sensibles, puede usarse como motor de un asistente personal que deba responder a preguntas incomodas o controvertidas sin esquivar la respuesta, por ejemplo en entornos de investigacion cualitativa o simulacion de escenarios eticos.
- Analisis de documentos con imagenes: al ser vision-language, puede extraer informacion de capturas, graficos o documentos escaneados, con la ventaja de mantener el contexto largo de 262K tokens para documentos extensos.
- Generacion de codigo en entornos no regulados: aunque su rendimiento en HumanEval es inferior al control (4.27% vs 7.93%), el modelo puede usarse en prototipado rapido o asistentes de codigo donde la prioridad es la fluidez de respuesta y no la precision extrema.
- Evaluacion de la robustez de sistemas de seguridad: el checkpoint sirve como caso de estudio para medir como la abliteracion afecta a la coherencia, la fuga de prompts y la calidad de generacion de codigo, util para investigadores en alineacion.
- Despliegue en macOS con MLX: gracias a la conversion a MLX affine 8-bit, el modelo puede ejecutarse en hardware Apple Silicon, lo que facilita su uso en entornos de desarrollo locales sin GPU NVIDIA.
- Archivado y conversion: el autor publica este checkpoint BF16 como "archival fidelity" para flujos de trabajo de transformers y para conversiones posteriores a otros formatos (GGUF, MLX, etc.).

## Benchmarks y rendimiento

La model card publica los resultados de un benchmark local congelado, comparando el checkpoint `control-bf16` (sin abliteracion) con el `abliterix-pass1-bf16` (este modelo). Son mediciones propias del autor, no benchmarks oficiales de Qwen.

| Metrica local congelada | Control | Abliterix winner |
|---|---:|---:|
| Harmful hard refusal | 43.2% | **0.0%** |
| Harmful soft deflection | 14.6% | **0.2%** |
| Harmful substantive response | 47.0% | **99.4%** |
| Capability macro | 17.6859% | **21.0086%** |
| Full code | **16/421** | 10/421 |
| HumanEval | **7.9268%** | 4.2683% |
| Long-form pass | 54.1667% | **62.5000%** |
| MMMU30 | 9/30 | **11/30** |
| Held-out loss ratio | 1.000000 | 1.024478 |
| Benign KL | 0.000000 | 0.093614 |

El autor reporta desviaciones estrictas: la KL benigna (0.093614) supera el limite de 0.05, la incoherencia (4.3077%) supera el punto de comparacion estricto (2.7692%), y el modelo falla el hard gate de fuga de prompts (3 echoes exactos vs 2 del control). Ademas, 376 de 421 generaciones de codigo alcanzaron el cap de 512 tokens, lo que apunta a una patologia de terminacion/extraccion severa en codigo. No se han publicado resultados de benchmarks oficiales del modelo base Qwen3.8-27B en esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint BF16 pesa 55.583.144.390 bytes (aproximadamente 51.8 GiB), por lo que se necesita al menos 56 GB de VRAM para cargarlo en precision BF16.
- GPU recomendadas: para BF16 completo se necesita una NVIDIA A100 80GB, H100 80GB o una configuracion de multiples RTX 4090 (24GB cada una) con reparto de memoria. Con cuantizacion de 8 bits (como la conversion MLX affine 8-bit que menciona el autor) se puede reducir a unos 28-30 GB, lo que permite ejecutarse en una RTX 4090 o en Apple Silicon con 64GB unificados.
- En consumer GPU: no cabe en BF16, pero con cuantizacion Q4/Q5 (no publicada en este repo) se estima que cabria en 16-20 GB de VRAM.
- Opciones de despliegue: el autor valido el uso de `mlx-vlm` en macOS (arm64/Metal) con MLX 0.32.0, `mlx-lm` 0.31.3 y `mlx-vlm` 0.6.13. Tambien es compatible con transformers para inferencia clasica y con herramientas de conversion como `llama.cpp` o `Ollama` si se convierte a GGUF.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (HumanEval) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 262K | no disponible (oficial) | Apache-2.0 | Hugging Face |
| Qwen3.8-27B-Opus-Abliterix-Reasoning-BF16 (este modelo) | 27B | 262K | 4.27% (local, con cap de 512 tokens) | Apache-2.0 | Hugging Face |
| Qwen3.8-27B control-bf16 (sin abliteracion) | 27B | 262K | 7.93% (local) | Apache-2.0 | no publicado separadamente |

La comparacion con el base es indirecta: el base no tiene benchmarks publicados en esta ficha, pero el autor reporta que el control (que es el base fusionado con el adaptador QLoRA) supera al modelo abliterizado en codigo (HumanEval 7.93% vs 4.27%). El modelo abliterizado gana en capacidades macro generales y en tareas de largo recorrido. No hay datos de otros modelos similares de otros fabricantes en la informacion disponible.

## Limitaciones y advertencias

- Sesgo y alucinacion: el autor no publica evaluaciones de sesgo; la abliteracion puede aumentar la tendencia a generar contenido falso o incoherente en dominios sensibles.
- Riesgo de alucinacion: la incoherencia medida es del 4.3077%, superior al punto estricto de comparacion (2.7692%), lo que indica un aumento de la probabilidad de respuestas incoherentes.
- Limitaciones de codigo: el rendimiento en HumanEval (4.27%) y full code (10/421) es inferior al control, y 376/408 generaciones de codigo alcanzaron el cap de 512 tokens, lo que sugiere una patologia de terminacion severa en tareas de codigo.
- Fuga de prompts: el modelo presenta 3 echoes exactos de prompts en sus generaciones, superando el limite estricto de fuga de prompts.
- Desviaciones estrictas: la Benign KL (0.093614) supera el limite de 0.05, y el long-form maximum repeated-4gram fraction (5.8632%) supera el 5% limite.
- No es un modelo universal: el autor lo etiqueta como "practical personal-model selection with measured deviations", no como un ganador universal; no se recomienda para aplicaciones criticas sin evaluacion adicional.
- Restricciones de licencia: aunque la licencia es Apache-2.0, el autor no publica los datos de entrenamiento privados ni los conjuntos de prompts dañinos/benignos, lo que limita la reproducibilidad completa del proceso.
- Para produccion: es un modelo experimental, no oficial de Qwen, con datos de entrenamiento no publicados y benchmarks locales auto-reportados; se recomienda una evaluacion independiente antes de cualquier uso productivo.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/timteh673/Qwen3.8-27B-Opus-Abliterix-Reasoning-BF16)
- [Modelo base: Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Repositorio GitHub de la serie Qwen3.8](https://github.com/QwenLM/Qwen3.8)
- [Articulo de explainx.ai sobre Qwen3.8-27B](https://www.explainx.ai/blog/qwen-3-8-27b-open-weight-model-claude-opus-comparison-august-2026)
- [QwenCloud - Qwen3.8-27B](https://www.qwencloud.com/models/qwen3.8-27b)
- [Unsloth GGUF del modelo base](https://huggingface.co/unsloth/Qwen3.8-27B-GGUF)
