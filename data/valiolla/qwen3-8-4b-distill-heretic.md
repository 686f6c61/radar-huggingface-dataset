# valiolla/Qwen3.8-4B-Distill-heretic

## Resumen

Qwen3.8-4B-Distill-heretic es una versión "decensored" (desensurada) del modelo de destilación Qwen3.8-4B-Distill, desarrollado por Empero AI, que a su vez es una destilación full-parameter del modelo Qwen3.8 2.4T A95B (un modelo de 2,4 billones de parámetros con 95 mil millones activos, según la arquitectura MoE) sobre la arquitectura Qwen3.5-4B. El objetivo del modelo original es trasladar el comportamiento de razonamiento de un modelo de escala frontera a un modelo de 4B que pueda ejecutarse en hardware de consumo, mediante el entrenamiento sobre ~45.000 trazas de razonamiento (chain-of-thought) de alta calidad.

Esta variante, creada por valiolla, aplica la técnica de abliteration (desensibilización) mediante la herramienta Heretic v1.4.0, que elimina los patrones de rechazo del modelo original. El resultado es un modelo que reduce las negativas de 99/100 a 24/100 en pruebas de refusal, manteniendo una divergencia KL de 0,0109 respecto al original, es decir, un comportamiento casi idéntico en el resto de tareas. El modelo hereda del base Qwen3.5-4B una ventana de contexto nativa de 262.144 tokens y soporte nativo de function calling según la especificación Qwen3.5.

El modelo está pensado para desarrolladores e investigadores que necesitan un modelo de razonamiento de 4B capaz de ejecutarse en GPUs de consumo, con capacidad de razonamiento largo y function calling, y que no censure contenido. Es reproducible: el repositorio incluye un directorio `reproduce/` con las instrucciones para replicar el proceso de abliteration.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (híbrida: atención lineal con Gated DeltaNet + atención completa, con GQA) |
| Parametros totales | 4.539.265.536 (4,54B) |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (nativa, heredada de Qwen3.5-4B) |
| Tipos de cuantizacion | no disponible (el repo original se ofrece en bf16; se pueden generar cuantizaciones GGUF/AWQ, pero no se especifican) |
| Idiomas soportados | en (el fine-tune se realizó solo en inglés; el base Qwen3.5 soporta más idiomas, pero no se evaluaron) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo base es Qwen/Qwen3.5-4B, una arquitectura híbrida que combina atención lineal con Gated DeltaNet (de la librería `flash-linear-attention`) y atención completa con Grouped Query Attention (GQA). Esta mezcla permite una mayor eficiencia en memoria y velocidad para secuencias largas. El modelo original (Qwen3.8-4B-Distill) se entrenó mediante destilación off-policy con SFT sobre ~45.000 trazas de razonamiento del teacher Qwen3.8 2.4T A95B, cubriendo matemáticas, razonamiento general y seguimiento de instrucciones, con filtrado de calidad. Cada respuesta incluye un bloque `thinking` aprendido directamente de las trazas del teacher.

La versión heretic aplica abliteration sobre los pesos del modelo original. La técnica consiste en identificar direcciones en el espacio de representación que correlacionan con el comportamiento de rechazo y eliminar esas direcciones mediante ajuste de los pesos de las proyecciones (`attn.o_proj` y `mlp.down_proj`). Los parámetros de abliteration se documentan en la model card (dirección 19.73, pesos máximos y mínimos de cada capa). El proceso es reproducible con Heretic v1.4.0 y no requiere reentrenamiento.

## Capacidades

- Generación de texto y razonamiento: responde con un bloque `thinking` de razonamiento denso seguido de la respuesta final, heredado del teacher.
- Matemáticas y razonamiento general: destilado específicamente para estas tareas; en el benchmark GSM8K alcanza 0.785 exact match (flexible).
- Function calling nativo: soporta la especificación de function calling de Qwen3.5 sin necesidad de envoltorios ni fine-tuning adicional.
- Capacidad de agente: al soportar function calling y razonamiento multi-paso, puede integrarse en pipelines de agentes.
- Multilingüe: aunque el fine-tune se hizo solo en inglés, el modelo base Qwen3.5 es multilingüe; no se ha evaluado el comportamiento en otros idiomas tras la destilación.
- No visión: el fine-tune es texto únicamente; el comportamiento de visión del base no fue evaluado ni entrenado.
- Longitud de contexto muy amplia (262K tokens) que permite manejar documentos largos o conversaciones de muchas vueltas.

## Casos de uso

- **Atención al cliente automatizada**: con 262k tokens de contexto y function calling, puede gestionar conversaciones multi-turno extensas, consultar bases de conocimiento o APIs de pedidos, y mantener el historial completo de la interacción sin truncar.
- **Razonamiento matemático y resolución de problemas**: ideal para aplicaciones educativas o de análisis que requieran cadenas de razonamiento explícitas y verificables, como tutorías de matemáticas o validación de soluciones.
- **Agentes con tool calling**: al soportar function calling de forma nativa, puede integrarse en pipelines de agentes que necesitan llamar a herramientas externas (búsqueda web, bases de datos, APIs) y razonar sobre los resultados.
- **Generación de código con razonamiento**: aunque el autor recomienda Qwen3.8-9B para código fuerte, este modelo puede generar código simple y explicar su lógica, útil en asistentes de desarrollo o generación de scripts.
- **Procesamiento de documentos largos**: con 262k tokens de contexto, puede resumir, extraer información o responder preguntas sobre documentos extensos (informes, manuales, libros) sin necesidad de chunking.
- **Investigación en seguridad de modelos**: la versión heretic es útil para estudiar los efectos de la abliteration sobre la seguridad y la utilidad, comparando el comportamiento con el modelo original.
- **Prototipado rápido en hardware de consumo**: con 4,5B parámetros y cuantizaciones posibles, se puede ejecutar en laptops con GPU, permitiendo desarrollo local de asistentes de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para la versión heretic. Sin embargo, el modelo original (empero-ai/Qwen3.8-4B-Distill) reporta los siguientes resultados medidos con `lm-evaluation-harness` (HF backend, protocolos CoT, temperatura 0.6, top_p 0.95, top_k 20):

| Tarea | Metrica | Qwen3.5-4B (base) | Qwen3.8-4B (original) |
|---|---|---|---|
| gsm8k_cot | exact_match (flexible) | 0.850 | 0.785 |
| gsm8k_cot | exact_match (strict) | 0.850 | 0.785 |
| mmlu (CoT, 57 subjects) | acc (flexible-extract) | 0.354 | 0.553 |
| mmlu (CoT, 57 subjects) | acc (strict-match) | 0.071 | 0.233 |

La versión heretic mantiene una divergencia KL de 0.0109 respecto al original, lo que sugiere que el rendimiento en estas tareas debería ser prácticamente idéntico, aunque no se han publicado mediciones directas.

## Requisitos de hardware

- **VRAM estimada**: en bf16, el modelo pesa ~9,1 GB (el tamaño del repositorio), por lo que se necesita al menos 10 GB de VRAM para inferencia con el modelo completo. Con cuantización 4-bit (p.ej. AWQ o GPTQ) se puede reducir a ~2,5-3 GB.
- **GPUs recomendadas**: RTX 4080/4090 (16-24 GB) para bf16 con margen, o RTX 3060/4070 (8-12 GB) con cuantización. Para despliegue en servidor, A100 o H100 con vLLM.
- **Cabe en consumer GPU**: sí, con cuantización 4-bit cabe en GPUs de 6-8 GB (p.ej. RTX 3060 12GB, RTX 4060 Ti 16GB). En bf16 se necesita al menos 10 GB.
- **Opciones de despliegue**: transformers (con kernels de flash-linear-attention y causal_conv1d), vLLM, SGLang, llama.cpp (si se compila con soporte Qwen3.5), y otras runtime con soporte de arquitectura Qwen3.5. Se recomienda usar kernels CUDA para la atención lineal, de lo contrario se usan operaciones PyTorch lentas.
- **Latencia y throughput**: no disponible. Se estima que en una RTX 4090 con cuantización 4-bit, la generación de 1k tokens de razonamiento toma ~5-10 segundos, pero no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento (GSM8K) | Notas |
|---|---|---|---|---|---|
| **Qwen3.8-4B-Distill-heretic** (este) | 4,54B | 262K | Apache-2.0 | ~0.785 (estimado) | Destilado de Qwen3.8 2.4T, abliterated, function calling |
| **Qwen3.8-4B-Distill** (original) | 4,54B | 262K | Apache-2.0 | 0.785 | Mismo modelo sin abliteration, rechaza más contenido |
| **Qwen3.5-4B** (base) | 4,54B | 262K | Apache-2.0 | 0.850 | Modelo base, no destilado, menos razonamiento denso |
| **Llama 3.2 3B** | 3,2B | 128K | Llama 3.2 Community License | ~0.7 (no oficial) | Modelo denso de 3B, sin function calling nativo |
| **Qwen2.5-3B** | 3,1B | 32K | Apache-2.0 | ~0.6 (no oficial) | Modelo de generación anterior, sin razonamiento CoT |

## Limitaciones y advertencias

- **Sesgos y seguridad reducida**: el proceso de abliteration reduce significativamente la probabilidad de rechazo (24/100 vs 99/100). Esto implica que el modelo puede generar contenido sensible, ofensivo o no seguro sin filtros, lo que es un riesgo en entornos de producción. Se recomienda usarlo solo en entornos controlados o con filtros externos.
- **Alucinaciones**: como todos los modelos de lenguaje, puede inventar información, especialmente en temas de conocimiento factual. El razonamiento denso no elimina el riesgo.
- **Idioma**: el fine-tune se hizo solo en inglés; aunque el base es multilingüe, el comportamiento en español u otros idiomas no ha sido evaluado y puede degradar la calidad del razonamiento.
- **Limitación de contexto**: aunque soporta 262K tokens, la atención lineal con Gated DeltaNet requiere kernels CUDA específicos; sin ellos, el rendimiento y la memoria se degradan drásticamente. La generación con contexto muy largo puede ser lenta.
- **Generación larga**: se recomienda `max_new_tokens` amplio (16K) y sampling con `temperature=0.6, top_p=0.95, top_k=20` para evitar loops de repetición en generaciones largas.
- **Uso comercial**: la licencia Apache-2.0 permite uso comercial sin restricciones, pero el modelo no es un producto final; se deben validar los resultados y añadir capas de seguridad externas.
- **Visión no evaluada**: el modelo base es vision-language, pero el fine-tune es texto-only; no se ha verificado el comportamiento con imágenes.

## Enlaces

- Repositorio HuggingFace del modelo: [valiolla/Qwen3.8-4B-Distill-heretic](https://huggingface.co/valiolla/Qwen3.8-4B-Distill-heretic)
- Modelo original: [empero-ai/Qwen3.8-4B-Distill](https://huggingface.co/empero-ai/Qwen3.8-4B-Distill)
- Base: [Qwen/Qwen3.5-4B](https://huggingface.co/Qwen/Qwen3.5-4B)
- Proyecto Heretic: [https://heretic-project.org](https://heretic-project.org)
- Repositorio de Qwen3.8 (GitHub): [https://github.com/QwenLM/Qwen3.8](https://github.com/QwenLM/Qwen3.8)
- Librería flash-linear-attention: [https://github.com/fla-org/flash-linear-attention](https://github.com/fla-org/flash-linear-attention)
- Librería causal_conv1d: [https://github.com/Dao-AILab/causal-conv1d](https://github.com/Dao-AILab/causal-conv1d)
- Página de Empero: [https://empero.org](https://empero.org)
