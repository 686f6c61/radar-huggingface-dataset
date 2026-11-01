# todoculebra/coqui-1.5b-v9-q4f16_1-MLC

## Resumen

Coquí 1.5B v9 es un ajuste fino (fine-tune) de Qwen2.5-1.5B-Instruct desarrollado por Isla Tech LLC (Todo Culebra, Culebra, Puerto Rico) y convertido al formato MLC / web-llm para ejecutarse íntegramente en el navegador mediante WebGPU, sin conexión a internet. El modelo está especializado en responder preguntas de viaje sobre Culebra, Vieques, San Juan y las Islas Vírgenes estadounidenses en inglés y español, a partir de las notas públicas de la aplicación Todo Culebra.

Se trata de un modelo de 1.500 millones de parámetros con arquitectura transformer densa heredada de Qwen2.5, cuantizado a `q4f16_1` (4 bits con pesos de escala y activaciones en float16) y empaquetado en el formato de MLC LLM, lo que permite su despliegue en navegadores de escritorio y móviles con soporte de shaders float16. Su relevancia radica en el nicho: demuestra un caso real de inferencia local en el cliente para una aplicación de viajes, con un tamaño de repositorio de 0,9 GB y licencia Apache 2.0.

No es un modelo de propósito general ni compite en benchmarks abiertos: es un artefacto vertical, entrenado con pares pregunta/respuesta derivados de notas de viaje y validado dentro de la propia aplicación. Su utilidad fuera de ese contexto es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen2.5-1.5B-Instruct) |
| Parametros totales | 1.500 millones (1.5B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Qwen2.5-1.5B-Instruct soporta hasta 32.768 tokens, pero la model card no lo confirma para este fine-tune) |
| Tipos de cuantizacion | `q4f16_1` (4 bits, float16) y `q4f32_1` (4 bits, float32) |
| Idiomas soportados | Ingles (en) y espanol (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLC / web-llm (libreria precompilada de Qwen2.5-1.5B-Instruct) |
| Tamano del repositorio | 0.9 GB |
| Fecha de creacion | 2026-10-28 |
| Descargas | 15 |
| Likes | 0 |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B-Instruct, un transformer denso con atención por causalidad estándar y 1.500 millones de parámetros, y se ha ajustado mediante fine-tuning supervisado sobre pares pregunta/respuesta redactados a partir de las notas públicas de viaje de Todo Culebra. Según la model card, esos pares fueron generados por un modelo maestro abierto y cada uno fue verificado contra su nota fuente antes del entrenamiento; no se utilizaron conversaciones reales de usuarios. No se especifica el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO posteriores al ajuste supervisado.

La innovación técnica no reside en la arquitectura sino en el empaquetado: la conversión a MLC LLM con cuantización de grupo de 4 bits (`q4f16_1`) y el uso de la librería precompilada de web-llm permiten ejecutar el modelo en el navegador con WebGPU, sin servidor y sin conexión. Se ofrece además una variante `q4f32_1` para dispositivos sin soporte de shaders float16. No se documentan técnicas como decodificación especulativa, atención lineal ni modos de razonamiento extendido.

## Capacidades

- Generación de texto conversacional en inglés y español, orientada a preguntas y respuestas sobre viajes.
- Respuesta a preguntas sobre Culebra, Vieques, San Juan y las Islas Vírgenes estadounidenses a partir de las notas de la aplicación.
- Comprensión y generación bilingüe (en/es), con la salvedad de que el dominio temático es muy acotado.
- Ejecución local en navegador mediante WebGPU, sin llamadas a red.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad de visión, audio ni modo de pensamiento (thinking mode).
- No se documenta capacidad de generación de código ni de matemáticas más allá de lo heredado del modelo base.

## Casos de uso

- Asistente de viajes embebido en una aplicación web: el modelo responde en el navegador del usuario a preguntas sobre playas, transporte y rutas en Culebra y Vieques, sin coste de servidor y funcionando con conectividad intermitente, que es habitual en islas pequeñas.
- Modo offline en dispositivos móviles: al ejecutarse con WebGPU y pesos de 0,9 GB, permite consultas turísticas en zonas sin cobertura, como calas y senderos de Vieques.
- Atención al cliente de bajo coste para operadores turísticos locales: responde preguntas frecuentes en inglés y español con un modelo de 1,5B que cabe en el cliente y evita exponer datos de conversaciones a un servidor externo.
- Demostración técnica de inferencia en navegador: sirve como referencia para equipos que quieran validar el pipeline MLC / web-llm con un modelo cuantizado a 4 bits y una librería precompilada de Qwen2.5.
- Prototipado de asistentes verticales bilingües: el par pregunta/respuesta verificado contra notas fuente es un patrón replicable para otros dominios con documentación estructurada.
- Base para experimentos de destilación de conocimiento de dominio: permite estudiar cómo un modelo de 1,5B retiene información factual acotada tras un fine-tune supervisado, comparando el rendimiento dentro y fuera del conjunto de entrenamiento.

## Benchmarks y rendimiento

La model card reporta dos métricas internas de la aplicación, no benchmarks estándar:

| Evaluacion | Resultado |
|---|---|
| Test de la isla (dentro de la app, con sus notas y codigo) | 207 de 211 |
| Preguntas nuevas de invitados (no vistas en el ajuste) | 36 de 50 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks abiertos en la informacion disponible. Las cifras anteriores corresponden a evaluaciones propietarias del autor y no son comparables con las de otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido tradicional, ya que el modelo se ejecuta en el navegador mediante WebGPU; el repositorio pesa 0,9 GB y la variante `q4f16_1` requiere memoria compartida de GPU del orden de 1 GB.
- GPU recomendadas: cualquier GPU integrada o dedicada con soporte de WebGPU y shaders float16 (por ejemplo, Apple Silicon, Intel Iris Xe, AMD Radeon y NVIDIA GeForce recientes). Para la variante `q4f32_1`, se relaja el requisito de shaders float16.
- Cabe en GPU de consumo: sí, siempre que el navegador exponga WebGPU; el límite práctico es la memoria de GPU disponible para el contexto del navegador.
- Opciones de despliegue: MLC LLM y web-llm (formato nativo del repositorio). No se proporcionan pesos GGUF ni safetensors en este repositorio, por lo que llama.cpp, Ollama, vLLM o TGI no son aplicables directamente sin reconvertir desde el modelo base.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Coquí 1.5B v9 (este modelo) | 1.5B | No disponible | Apache 2.0 | MLC / web-llm | Fine-tune vertical para viajes en Puerto Rico y USVI, ejecutable en navegador |
| Qwen2.5-1.5B-Instruct | 1.5B | 32.768 tokens (según documentacion del modelo base) | Apache 2.0 | Safetensors, GGUF, MLC | Modelo base generalista, sin especializacion tematica |
| Qwen2.5-0.5B-Instruct | 0.5B | 32.768 tokens (según documentacion del modelo base) | Apache 2.0 | Safetensors, GGUF, MLC | Alternativa mas ligera para navegador, menor calidad general |
| Llama 3.2 1B Instruct | 1.2B | 128.000 tokens (según documentacion del modelo base) | Llama 3.2 Community License | Safetensors, GGUF | Alternativa generalista con licencia no Apache |

La comparación con Qwen2.5-1.5B-Instruct es la más directa, ya que Coquí es un fine-tune del mismo. No se dispone de datos de rendimiento comparables entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Dominio muy restringido: el modelo está entrenado para preguntas de viaje sobre Culebra, Vieques, San Juan y las Islas Vírgenes estadounidenses; fuera de ese ámbito su utilidad es marginal.
- Riesgo de alucinación factual: la model card advierte explícitamente que no debe usarse para precios, horarios, números de teléfono ni emergencias; la aplicación responde esas consultas mediante código, no con el modelo.
- Rendimiento fuera de distribución limitado: 36 de 50 en preguntas nuevas de invitados, frente a 207 de 211 en el test interno, lo que indica una brecha considerable de generalización.
- Idiomas: solo inglés y español; no se documenta soporte de otros idiomas.
- Sesgos: no se documentan evaluaciones de sesgo; al derivar de Qwen2.5-1.5B-Instruct, hereda los sesgos del modelo base y de los datos de entrenamiento generados por el modelo maestro.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre la exactitud del contenido turístico.
- Formato: al distribuirse solo en MLC / web-llm, requiere reconversión para otros runtimes, lo que añade fricción a la integración en pilas de servidor convencionales.
- Madurez: 15 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción fuera de la aplicación del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/todoculebra/coqui-1.5b-v9-q4f16_1-MLC
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Aplicación del autor: https://todoculebra.com/app
- MLC LLM: https://github.com/mlc-ai/mlc-llm
- web-llm: https://github.com/mlc-ai/web-llm
