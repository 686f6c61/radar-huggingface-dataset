# windowsxp811203/Qwen3.8-27B-Abliterated-MLX-bf16-mtp

## Resumen

Qwen3.8-27B-Abliterated-MLX-bf16-mtp es una conversión a formato MLX en precisión bf16 del modelo Qwen3.8-27B-Abliterated, una variante "abliterated" (es decir, con las direcciones de rechazo eliminadas mediante edición de pesos) de un modelo de la familia Qwen 3.5. Lo publica el usuario windowsxp811203 en HuggingFace, no el equipo oficial de Qwen, y está pensado específicamente para ejecutarse en Apple Silicon mediante la librería MLX. El modelo conserva la pipeline image-text-to-text, por lo que mantiene capacidades de visión además de generación de texto.

El interés principal de esta ficha es doble: por un lado, ofrece un modelo de aproximadamente 27.800 millones de parámetros en bf16 con decodificación especulativa nativa (MTP, multi-token prediction), lo que puede mejorar el throughput en hardware Apple; por otro, al ser una versión abliterated, elimina parte de los filtros de rechazo del modelo original, lo que tiene implicaciones legales y de seguridad importantes en producción. La licencia declarada es Apache 2.0, pero el acceso está restringido (gated) y requiere aceptar condiciones en HuggingFace.

No se dispone de información oficial sobre la composición del dataset de entrenamiento, los resultados de benchmarks ni la longitud exacta de contexto del modelo original, por lo que esos datos se marcan como no disponibles. La ficha se basa exclusivamente en los metadatos del repositorio y en las características inferibles de la arquitectura Qwen 3.5 y del formato MLX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen 3.5), con módulo MTP (multi-token prediction) para decodificación especulativa nativa; pipeline image-text-to-text (visión) |
| Parametros totales | 27.781.427.952 (~27,8 mil millones) |
| Parametros activos | no disponible (no es MoE según los metadatos; modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (esta conversión); el repo base podría admitir otras cuantizaciones MLX, pero no se detallan |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (bf16) |
| Tamano del repo | 55,6 GB |
| Libreria | mlx |
| Acceso | restringido (gated), requiere aceptar condiciones |
| Modelo base | windowsxp811203/Qwen3.8-27B-Abliterated |
| Descargas / likes | 470 / 2 |

## Arquitectura y entrenamiento

El modelo es un transformer denso de la familia Qwen 3.5 con aproximadamente 27,8 mil millones de parámetros, convertido a MLX y almacenado en bf16. Incorpora un módulo MTP (multi-token prediction) nativo, etiquetado en el repositorio como `mtp` y `native-mtp`, que permite decodificación especulativa integrada: el modelo predice varios tokens por paso y un verificador los valida, lo que puede aumentar el throughput sin cambiar la distribución de salida. La pipeline es `image-text-to-text`, de modo que el modelo incluye un codificador visual y acepta entradas de imagen junto con texto.

La variante "Abliterated" indica que se han aplicado técnicas de edición de pesos para eliminar las direcciones de activación asociadas al rechazo de peticiones, un procedimiento habitual en la comunidad para obtener modelos "uncensored". No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO en el modelo original; tampoco se documenta el proceso exacto de abliteración. La conversión a MLX la realiza el autor del repositorio, no el equipo de Qwen, por lo que la fidelidad respecto al modelo original no está verificada de forma independiente.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y chino.
- Razonamiento y respuesta a preguntas de conocimiento general.
- Generación y explicación de código, aunque sin datos de benchmark que lo confirmen.
- Capacidades de visión: entrada de imagen y texto (image-text-to-text), incluyendo descripción de imágenes y preguntas visuales.
- Decodificación especulativa nativa mediante MTP, orientada a reducir latencia en Apple Silicon.
- Comportamiento "abliterated": menor tendencia a rechazar peticiones, incluidas las sensibles.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo "thinking" explícito: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional local en Mac: el modelo puede ejecutarse con MLX en equipos Apple Silicon con memoria unificada suficiente (el repo pesa 55,6 GB en bf16), lo que permite un asistente privado sin enviar datos a la nube.
- Análisis de imágenes en local: gracias a la pipeline image-text-to-text, se puede usar para describir capturas, extraer texto de imágenes o responder preguntas sobre diagramas en un flujo de trabajo de escritorio.
- Prototipado de investigación sobre alineación: al ser una variante abliterated, sirve para estudiar cómo cambia el comportamiento del modelo al eliminar las direcciones de rechazo, comparándolo con el modelo base.
- Generación de contenido en inglés y chino: útil para redacción, traducción asistida y resumen de documentos en esos dos idiomas, con la ventaja de ejecución local.
- Evaluación de decodificación especulativa: el módulo MTP permite medir en Apple Silicon la ganancia de throughput frente a decodificación autoregresiva estándar, un caso de uso típico en investigación de inferencia.
- Desarrollo de aplicaciones MLX: sirve como referencia para integraciones con la librería MLX y para probar pipelines multimodales en macOS sin depender de CUDA.
- Filtrado y moderación de contenido: no recomendado como moderador, pero puede usarse para generar casos adversarios que prueben sistemas de moderación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: en bf16, los pesos ocupan aproximadamente 55,6 GB, por lo que se necesita un Mac con al menos 64 GB de memoria unificada para cargar el modelo con margen para el contexto y el codificador visual.
- GPU recomendadas: Apple Silicon de gama alta (M2 Ultra, M3 Max con 64 GB o más, M4 Max). No está pensado para GPU NVIDIA, ya que el formato es MLX.
- ¿Cabe en GPU consumer? Solo en equipos Apple con memoria unificada suficiente; no cabe en GPUs de consumo con 24 GB o menos en bf16.
- Opciones de despliegue: MLX (librería `mlx`), con posibles integraciones en `mlx-lm` para texto; para la parte visual se requiere el stack MLX-VLM o equivalente. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, al ser un formato MLX.
- Latencia y throughput: no disponibles. El módulo MTP está diseñado para mejorar el throughput, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Abliterated-MLX-bf16-mtp (este) | ~27,8 B | no disponible | Apache 2.0 | MLX safetensors bf16 | Variante abliterated, visión, MTP, solo Apple Silicon |
| Qwen3.8-27B-Abliterated (base) | ~27,8 B | no disponible | Apache 2.0 | safetensors | Modelo original sin conversión MLX; comportamiento alineado distinto |
| Modelos Qwen 3.5 oficiales de ~27 B | ~27 B | no disponible | Apache 2.0 (según familia) | safetensors, GGUF | Alineados y con filtros de rechazo; sin abliteración |
| Gemma 3 27B | ~27 B | no disponible | Gemma license | safetensors, GGUF | Alternativa multimodal de tamaño similar, licencia no Apache |

La comparación cuantitativa de rendimiento no está disponible porque no se han publicado benchmarks de esta conversión ni del modelo base en la información proporcionada.

## Limitaciones y advertencias

- La abliteración elimina los mecanismos de rechazo, por lo que el modelo puede generar contenido dañino, ilegal o sexualmente explícito; no es apto para aplicaciones orientadas al público sin capas de seguridad adicionales.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad; como cualquier modelo de ~27 B, puede inventar datos, citas y referencias.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está garantizado ni documentado.
- Licencia Apache 2.0 declarada, pero el acceso es restringido (gated) y el modelo deriva de pesos de terceros; conviene verificar la licencia del modelo base original de Qwen antes de uso comercial.
- La conversión MLX la realiza un tercero no oficial; no hay garantía de que los pesos reproducan fielmente el comportamiento del modelo base.
- Solo funciona en Apple Silicon; no hay pesos GGUF ni safetensors estándar para CUDA en este repositorio.
- El tamaño en bf16 (55,6 GB) exige hardware con memoria unificada alta; no cabe en portátiles con 32 GB.
- No se documenta longitud de contexto, soporte de tool calling ni modo de razonamiento, lo que limita su uso en pipelines de agentes sin validación previa.
- El repositorio tiene muy poca tracción (2 likes, 470 descargas) y no está mantenido por el equipo oficial de Qwen; el soporte es limitado.

## Enlaces

- HuggingFace: https://huggingface.co/windowsxp811203/Qwen3.8-27B-Abliterated-MLX-bf16-mtp
- Modelo base: https://huggingface.co/windowsxp811203/Qwen3.8-27B-Abliterated
- Librería MLX: https://github.com/ml-explore/mlx
- MLX-LM: https://github.com/ml-explore/mlx-lm
- Documentación de Qwen: https://qwen.readthedocs.io/
- Repositorio oficial de Qwen: https://github.com/QwenLM/Qwen
