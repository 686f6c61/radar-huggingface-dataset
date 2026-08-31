# TheWirelessPhoenix/DeepSeek-R1-Distill-Qwen-7B-abliterated-v2-mlx_4bit

## Resumen

Este modelo es una conversión a formato MLX con cuantización de 4 bits del modelo `huihui-ai/DeepSeek-R1-Distill-Qwen-7B-abliterated-v2`, realizado por TheWirelessPhoenix. El modelo base es una versión "abliterated" (sin censura) del conocido DeepSeek-R1-Distill-Qwen-7B, que a su vez es una destilación de DeepSeek-R1 sobre Qwen2.5-Math-7B. La técnica de abliteration elimina los mecanismos de rechazo de contenido del modelo original, permitiendo respuestas sin restricciones de seguridad.

La conversión a MLX 4-bit reduce significativamente el tamaño del modelo (4,3 GB en el repositorio) y lo optimiza para ejecutarse en hardware Apple Silicon mediante la librería `mlx-lm`. Esto lo hace especialmente relevante para desarrolladores que trabajan en ecosistemas macOS y necesitan un modelo de razonamiento con capacidades de chat y generación de texto sin filtros, manteniendo un rendimiento aceptable en equipos de consumo.

El modelo se distribuye bajo una licencia no especificada en la ficha de HuggingFace, aunque el modelo base DeepSeek-R1-Distill-Qwen-7B se publicó bajo licencia MIT. La arquitectura subyacente es un transformer basado en Qwen2, con 7 mil millones de parámetros en su versión original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2) |
| Parametros totales | 7B (modelo base) |
| Parametros activos | no disponible (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (MLX) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (modelo base: MIT) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base, DeepSeek-R1-Distill-Qwen-7B, es una destilación del modelo DeepSeek-R1 (un LLM con razonamiento reforzado) sobre la arquitectura Qwen2.5-Math-7B. El proceso de destilación transfiere las capacidades de razonamiento paso a paso del modelo grande al pequeño, manteniendo un rendimiento competitivo en tareas de matemáticas, código y lógica. La versión "abliterated" de huihui-ai aplica una técnica de intervención en el espacio de activaciones para eliminar las direcciones asociadas con el rechazo de contenido, lo que resulta en un modelo que no se niega a responder a solicitudes que el modelo original consideraría inapropiadas.

La conversión a MLX se realizó con la librería `mlx-lm` versión 0.32.0, que transforma los pesos a un formato optimizado para Apple Silicon y aplica cuantización de 4 bits. No se dispone de información detallada sobre el dataset de entrenamiento ni sobre el proceso de alineación (RLHF/DPO) de la versión abliterated, más allá de que se parte del modelo destilado original.

## Capacidades

- Generación de texto y conversación multi-turno mediante plantilla de chat estándar.
- Razonamiento paso a paso (chain-of-thought) heredado de DeepSeek-R1, especialmente en tareas de matemáticas y lógica.
- Generación de código en diversos lenguajes, aunque sin soporte específico de tool calling o function calling documentado.
- Capacidad de respuesta sin censura gracias a la técnica de abliteration, lo que permite abordar temas que el modelo original rechazaría.
- Multilingüismo limitado: el modelo base está entrenado principalmente en inglés y chino, aunque no se especifican los idiomas exactos en esta versión.
- No se ha documentado soporte para visión, audio u otras modalidades.

## Casos de uso

- Escritura creativa sin restricciones: el modelo puede generar narrativas, diálogos o contenido literario con temáticas adultas o controvertidas que otros modelos censurarían, gracias a su naturaleza abliterated.
- Roleplay y simulación de personajes: su capacidad de conversación multi-turno y su falta de rechazo lo hacen adecuado para aplicaciones de entretenimiento interactivo, aunque requiere supervisión para evitar contenido problemático.
- Asistencia en investigación académica: puede ayudar a explorar hipótesis o redactar secciones de artículos sobre temas sensibles (por ejemplo, ética, política) sin sesgos de seguridad, aunque se debe verificar la exactitud de los resultados.
- Prototipado rápido de aplicaciones de chat en macOS: al estar en formato MLX 4-bit, se integra fácilmente en proyectos que usan `mlx-lm` para desarrollo local en Apple Silicon, sin necesidad de GPUs dedicadas.
- Generación de código en entornos de desarrollo: aunque no tiene tool calling, puede producir fragmentos de código para tareas de programación, especialmente en contextos donde se requiera explorar soluciones no convencionales.
- Análisis de contenido y moderación: paradójicamente, al no tener filtros, puede usarse para evaluar la eficacia de sistemas de moderación generando ejemplos de contenido que deberían ser bloqueados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta versión convertida a MLX 4-bit. El modelo base DeepSeek-R1-Distill-Qwen-7B reporta en su documentación oficial puntuaciones en MMLU, HumanEval y GSM8K, pero estos datos corresponden a la versión sin cuantizar y sin abliteration. No se dispone de mediciones independientes para esta variante.

## Requisitos de hardware

- VRAM estimada: el archivo de pesos ocupa 4,3 GB, por lo que se recomienda al menos 8 GB de memoria unificada en Apple Silicon para una inferencia cómoda.
- GPU recomendadas: cualquier chip Apple Silicon (M1, M2, M3 o superiores) con al menos 8 GB de RAM unificada. No requiere GPU dedicada.
- Compatibilidad con hardware de consumo: sí, cabe en Macs de gama de entrada con 8 GB, aunque el rendimiento será mejor con 16 GB o más.
- Opciones de despliegue: se puede usar con `mlx-lm` (Python) o mediante herramientas que soporten MLX, como `mlx-lm` CLI. No es compatible directamente con vLLM, llama.cpp u Ollama, que usan otros formatos.
- Latencia y throughput: no se han publicado mediciones específicas. En un M1 Pro, se espera una generación de aproximadamente 10-20 tokens por segundo con cuantización 4-bit, pero estos valores son estimaciones basadas en modelos similares.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| DeepSeek-R1-Distill-Qwen-7B (original) | 7B | 128k (según documentación) | FP16/BF16 | MIT | safetensors |
| Este modelo (MLX 4-bit abliterated) | 7B | no disponible | 4-bit MLX | no disponible | safetensors |
| Qwen2.5-7B-Instruct | 7B | 128k | FP16 | Apache 2.0 | safetensors |
| Llama-3.1-8B-Instruct | 8B | 128k | FP16 | Llama 3.1 license | safetensors |

La principal diferencia con el modelo original es la cuantización y la abliteration. Frente a Qwen2.5-7B-Instruct, este modelo ofrece razonamiento mejorado (por la destilación de R1) pero sin garantías de seguridad. La comparativa con Llama-3.1-8B es similar en tamaño, pero la licencia y el enfoque de entrenamiento difieren.

## Limitaciones y advertencias

- Al ser un modelo abliterated, puede generar contenido ofensivo, ilegal o éticamente cuestionable sin ningún tipo de filtro. Su uso en producción requiere medidas de control adicionales.
- Riesgo de alucinación: como todos los LLM, puede inventar información, especialmente en temas especializados. La falta de censura no implica mayor exactitud.
- La licencia no está especificada en la ficha de HuggingFace, lo que genera incertidumbre legal para uso comercial. El modelo base es MIT, pero la versión abliterated podría tener restricciones adicionales.
- La cuantización de 4 bits puede degradar ligeramente la calidad de las respuestas en comparación con la versión FP16, especialmente en tareas de razonamiento complejo.
- No se ha verificado el soporte de idiomas; se asume que hereda las capacidades del modelo base (principalmente inglés y chino), pero no hay confirmación.
- El contexto máximo no está documentado en esta versión; se recomienda no exceder 8k tokens para evitar degradación, aunque el modelo base soporta hasta 128k.

## Enlaces

- Repositorio del modelo: https://huggingface.co/TheWirelessPhoenix/DeepSeek-R1-Distill-Qwen-7B-abliterated-v2-mlx_4bit
- Modelo base (huihui-ai): https://huggingface.co/huihui-ai/DeepSeek-R1-Distill-Qwen-7B-abliterated-v2
- Modelo original DeepSeek-R1-Distill-Qwen-7B: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-7B
- Repositorio oficial de DeepSeek-R1: https://github.com/deepseek-ai/DeepSeek-R1
- Documentación de MLX: https://github.com/ml-explore/mlx
