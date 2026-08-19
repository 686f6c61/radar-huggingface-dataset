# vrfai/Qwen3.8-27B-FP8

## Resumen

El modelo `vrfai/Qwen3.8-27B-FP8` es una cuantización en precisión FP8 (W8A8) del modelo vision-language Qwen3.8-27B, desarrollado por Qwen. El objetivo de esta conversión, realizada por el usuario vrfai, es reducir el tamaño de los pesos de 52 GB (bf16) a 28,3 GB, manteniendo la mayor parte de la precisión y permitiendo su despliegue en hardware con menos memoria. El modelo base es un sistema multimodal nativo que comprende imágenes y vídeos, con control flexible del modo de razonamiento (thinking mode) y capacidades de agente, diseñado para tareas complejas de varios pasos.

La cuantización se ha aplicado únicamente al modelo de lenguaje, dejando la torre de visión y ciertos componentes críticos en bf16. Se utilizó la herramienta `llmcompressor` con SmoothQuant y calibración sobre el dataset CNN/DailyMail. El resultado es un checkpoint compatible con vLLM (versión >= 0.27.1) que no requiere flags adicionales para su uso. Esta ficha resume las especificaciones, capacidades y consideraciones prácticas para desarrolladores e investigadores que deseen evaluar o desplegar este modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.8-27B (vision-language, transformer híbrido con capas de atención y Gated DeltaNet, según información del modelo base) |
| Parametros totales | 27.356.728.560 (27,36 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP8 (W8A8), pesos y activaciones en E4M3, escala por tensor, con SmoothQuant (alpha=0.8) |
| Idiomas soportados | No disponible (no especificado en la información proporcionada) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (serializado como compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un modelo multimodal denso que combina un codificador visual (torre de visión) con un modelo de lenguaje de 27 mil millones de parámetros. La arquitectura del LM incluye capas de atención estándar y capas con Gated DeltaNet, un mecanismo de recurrencia que gestiona decaimiento y reglas delta por cabeza. Esta hibridación permite manejar secuencias largas de manera eficiente, aunque no se proporcionan detalles sobre la longitud de contexto máxima.

La cuantización realizada por vrfai convierte el 93,28% de las capas lineales del modelo de lenguaje a FP8 (W8A8), incluyendo las proyecciones de atención y las de los bloques MLP y DeltaNet. Se mantienen en bf16 tres grupos: la proyección final `lm_head` (crítica para la precisión del softmax), la torre de visión completa (456M de parámetros) y las proyecciones `in_proj_a`/`in_proj_b` que generan los coeficientes de decaimiento y regla delta de la recurrencia. Esta decisión evita que errores de cuantización se amplifiquen a lo largo de la secuencia.

El proceso de cuantización se realizó con `llmcompressor` 0.13.0, usando 512 muestras de CNN/DailyMail con 2048 tokens cada una para calibración. Se aplicó SmoothQuant con alpha=0.8 para equilibrar la distribución de activaciones. No se menciona entrenamiento adicional (RLHF, DPO) en la cuantización; el modelo base ya fue post-entrenado por Qwen con técnicas de razonamiento y refuerzo, aunque no se detallan aquí.

## Capacidades

- Comprensión multimodal: procesa imágenes y vídeos (hasta escala de horas, según la descripción del modelo base), incluyendo diagramas STEM, documentos y contenido visual complejo.
- Razonamiento flexible: modo de pensamiento (thinking) activado por defecto, con control de esfuerzo (`reasoning_effort`) y conservación del contexto de razonamiento histórico (`preserve_thinking`).
- Ejecución de agentes: planificación autónoma y manejo de retroalimentación del entorno para completar tareas de múltiples pasos de forma fiable.
- Generación de texto y código: capacidades de codificación y trabajo profesional mejoradas respecto a generaciones anteriores de Qwen.
- Tool calling y function calling: soporte integrado para invocar herramientas externas, facilitando la construcción de pipelines de agentes.
- Compatibilidad con ecosistemas: funciona con Hugging Face Transformers, vLLM, SGLang y TokenSpeed, según la documentación del modelo base.
- Multilingüismo: aunque no se especifica la lista de idiomas, los modelos Qwen suelen ser multilingües; sin embargo, este dato no está disponible en la información proporcionada.

## Casos de uso

- Análisis de documentos técnicos con imágenes: el modelo puede extraer información de diagramas, gráficos y tablas en PDFs o capturas, útil para automatizar revisiones de informes de ingeniería o investigación.
- Asistentes de atención al cliente con contexto visual: un usuario envía una foto de un producto o error, y el modelo responde con instrucciones de solución, manteniendo conversaciones multi-turno gracias a su capacidad de razonamiento.
- Generación y revisión de código con razonamiento: en un IDE o pipeline CI/CD, el modelo puede analizar snippets, explicar bugs y sugerir correcciones, aprovechando el modo thinking para problemas complejos.
- Agentes autónomos de automatización de tareas: por ejemplo, un agente que navega por una interfaz web, interpreta capturas de pantalla y ejecuta acciones (rellenar formularios, extraer datos) usando tool calling.
- Análisis de vídeo para vigilancia o control de calidad: procesa vídeos de horas para detectar anomalías o eventos, generando resúmenes textuales con marcas temporales.
- Asistente de investigación científica: combina lectura de artículos (con figuras y ecuaciones) y razonamiento matemático para ayudar a formular hipótesis o resumir resultados.
- Chatbot conversacional con memoria de contexto largo: dado que el modelo base soporta contexto extendido (no confirmado aquí), podría mantener diálogos extensos con historial completo, aunque la longitud exacta no está disponible.

## Benchmarks y rendimiento

Los únicos resultados publicados en la model card del checkpoint cuantizado son los siguientes, medidos con decodificación greedy y thinking mode activado en una NVIDIA H100 80GB con vLLM 0.27.1:

| Tarea | Puntuación |
|---|---|
| ERQA | 0,5650 |
| RealWorldQA | 0,8144 |

Estos valores se obtuvieron sobre los pesos FP8. No se proporcionan comparaciones con el modelo bf16 original en las mismas tareas, ni otros benchmarks (MMLU, HumanEval, GSM8K). Por tanto, no es posible evaluar la degradación exacta inducida por la cuantización en otras métricas. La model card del modelo base incluye tablas adicionales, pero se advierte explícitamente que fueron medidas sobre los pesos bf16 y no son aplicables a este checkpoint.

## Requisitos de hardware

- Tamaño de pesos cuantizados: 28,3 GB (el repo ocupa 30,4 GB incluyendo otros archivos).
- VRAM estimada para inferencia: se recomienda al menos 32 GB para cargar los pesos y dejar margen para activaciones y estados de la recurrencia DeltaNet. Una GPU con 40 GB o más es adecuada (por ejemplo, A100 40GB, H100 80GB).
- GPU recomendadas: NVIDIA H100 (usada en las pruebas), A100 40/80GB, o GPUs consumer de 24GB (como RTX 4090) podrían no ser suficientes debido al tamaño de los pesos; se requeriría cuantización adicional (por ejemplo, GGUF de 4 bits) que no está disponible en este repositorio.
- Opciones de despliegue: vLLM (versión >= 0.27.1) es el runtime soportado; también es compatible con Hugging Face Transformers, SGLang y TokenSpeed según el modelo base. No se proporcionan archivos GGUF para llama.cpp u Ollama.
- Latencia y throughput: no se han publicado mediciones específicas. El uso de FP8 en H100 puede ofrecer mayor throughput que bf16, pero no hay datos concretos.

## Comparativa con modelos similares

La comparación más directa es con el modelo base sin cuantizar, `Qwen/Qwen3.8-27B`:

| Modelo | Tamaño de pesos | Precisión | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen/Qwen3.8-27B (bf16) | 52 GB | bf16 | No disponible | Apache 2.0 | Hugging Face |
| vrfai/Qwen3.8-27B-FP8 | 28,3 GB | FP8 (W8A8) | No disponible | Apache 2.0 | Hugging Face |

No se dispone de información sobre otros modelos vision-language de tamaño similar (por ejemplo, Qwen2.5-VL-27B, Llama 3.2 11B) para una comparativa cuantitativa. La ventaja principal de esta cuantización es la reducción de memoria (~45% menos) con una pérdida de precisión aparentemente pequeña en las dos tareas evaluadas, aunque no se puede generalizar sin más benchmarks.

## Limitaciones y advertencias

- La cuantización FP8 puede introducir degradación en tareas sensibles a la precisión numérica, especialmente en razonamiento matemático o código, aunque no se han medido en este checkpoint.
- Los únicos benchmarks disponibles (ERQA y RealWorldQA) se obtuvieron con greedy decoding y thinking activado; los resultados pueden variar con otros parámetros de muestreo.
- La longitud de contexto máxima no está especificada; se recomienda verificar la documentación del modelo base antes de usarlo con secuencias largas.
- El modelo base puede presentar sesgos y alucinaciones típicos de los LLM; la cuantización no corrige estos problemas.
- La licencia Apache 2.0 permite uso comercial y modificación, pero es necesario atribuir correctamente al autor original (Qwen) y al autor de la cuantización (vrfai).
- Para producción, se debe validar el rendimiento en el dominio específico, ya que la calibración se hizo solo con CNN/DailyMail y podría no representar otros tipos de datos.

## Enlaces

- [Modelo cuantizado en Hugging Face](https://huggingface.co/vrfai/Qwen3.8-27B-FP8)
- [Modelo base Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Documentación de Qwen Cloud (referencia del modelo base)](https://www.qwencloud.com/models/qwen3.8-27b)
