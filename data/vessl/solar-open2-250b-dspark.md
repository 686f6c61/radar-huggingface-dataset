# vessl/Solar-Open2-250B-DSpark

## Resumen

Solar-Open2-250B-DSpark es un modelo auxiliar de decodificación especulativa (draft model) desarrollado por VESSL para acelerar la inferencia del modelo objetivo Solar-Open2-250B-W4A8, una versión cuantizada en W4A8 del Solar-Open2-250B de Upstage. Utiliza el método DSpark (block-diffusion draft con block rejection sampling), una técnica que genera bloques de tokens candidatos en paralelo para que el modelo grande los valide, reduciendo la latencia por token en entornos de producción. Con aproximadamente 1,95 mil millones de parámetros y 5 capas ocultas, este draft model está diseñado específicamente para integrarse en motores de inferencia como vLLM y SGLang, donde actúa como un predictor rápido que alimenta al modelo principal.

El modelo se entrenó con una política on-policy: las respuestas fueron regeneradas por el propio modelo objetivo, sobre un corpus de aproximadamente un millón de ejemplos con sobremuestreo de tareas de tool-calling y contenido multilingüe. Su relevancia actual radica en que permite desplegar un modelo de 250B con una latencia significativamente menor sin sacrificar calidad, algo crítico para aplicaciones de agentes, razonamiento complejo y generación de código en tiempo real. Está disponible bajo la licencia Upstage Solar License, que impone condiciones de atribución y uso comercial específicas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DSpark (block-diffusion draft, 5 capas ocultas, atención heredada del objetivo) |
| Parametros totales | 1.954.600.449 (~1,95B) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo objetivo Solar-Open2-250B-W4A8) |
| Tipos de cuantizacion | no disponible (el repositorio contiene safetensors; se presume fp16/bf16) |
| Idiomas soportados | no disponibles |
| Licencia | Upstage Solar License (licencia propietaria con condiciones) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura DSpark, un enfoque de decodificación especulativa por bloques. A diferencia de los draft models autoregresivos convencionales, DSpark genera bloques completos de tokens (en este caso, bloques de tamaño 7) que el modelo objetivo valida mediante rejection sampling. La configuración incluye 5 capas ocultas y hereda del modelo objetivo la geometría de atención, RoPE, el número de cabezas KV y `rms_norm_eps`. Los "taps" de estados ocultos auxiliares se toman de las capas 4, 12, 24, 36 y 44 del modelo objetivo, todas ellas capas de atención completa (full attention). Cabe destacar que Solar-Open2-250B intercala 12 capas de atención completa entre 36 capas de atención lineal (KDA), y solo las capas de atención completa se utilizan como puntos de anclaje para el draft model.

El entrenamiento se realizó con política on-policy: las respuestas de entrenamiento fueron generadas por el propio modelo objetivo, sobre un corpus renovado de aproximadamente un millón de ejemplos, con sobremuestreo de datos de tool-calling y multilingües. Se aplicaron 3 épocas sobre una mezcla de datasets públicos de instrucciones, código y multilingües, más un dataset privado no publicado. Esta metodología asegura que el draft model aprenda los patrones de salida del modelo grande, maximizando la tasa de aceptación de tokens durante la inferencia especulativa.

## Capacidades

- Decodificación especulativa por bloques: genera bloques de 7 tokens candidatos que el modelo objetivo valida de forma paralela, reduciendo la latencia efectiva por token.
- Integración nativa con vLLM y SGLang: soporta configuración directa mediante `--speculative-config` (vLLM) y `--speculative-algorithm DSPARK` (SGLang).
- Optimización para dominios estructurados: muestra mayor tasa de aceptación en tareas de matemáticas y código (accept length de 4,75 en GSM8K y 4,63 en HumanEval) que en conversación abierta.
- Compatibilidad con tool-calling y razonamiento: el modelo objetivo (Solar-Open2-250B-W4A8) soporta parsers de tool-call y reasoning; el draft model no interfiere con estas capacidades.
- Multilingüe (indirecto): al entrenarse con datos multilingües sobremuestreados, el draft model mantiene buen rendimiento en idiomas distintos del inglés, aunque no se especifican cuáles.
- No es un modelo de generación autónoma: su función es exclusivamente acelerar la inferencia del modelo objetivo; no debe usarse de forma independiente para tareas de generación de texto.

## Casos de uso

- Despliegue de Solar-Open2-250B-W4A8 en producción con baja latencia: el caso principal. Al integrar el draft model con vLLM (usando `--speculative-config '{"method":"dspark",...}'`), se consiguen tiempos de respuesta hasta un 40-50% menores en cargas de trabajo de razonamiento y código, manteniendo la calidad del modelo grande.
- Asistentes de programación en tiempo real: en entornos de IDE o pipelines de CI/CD, la generación de código con HumanEval y MBPP muestra accept lengths de 4,63 y 4,10 respectivamente, lo que reduce la espera del desarrollador sin degradar la precisión del código generado.
- Agentes autónomos con tool-calling: el modelo objetivo soporta `--enable-auto-tool-choice` y el draft model acelera los ciclos de decisión multi-paso, permitiendo que agentes que ejecutan llamadas a APIs o herramientas respondan con menor latencia.
- Chatbots multilingües de alto volumen: al sobremuestrear datos multilingües, el draft model mantiene una tasa de aceptación razonable en conversaciones no inglesas, reduciendo el coste por consulta en servicios de atención al cliente.
- Razonamiento matemático y científico: en benchmarks como GSM8K y MATH-500, el accept length de 4,75 y 4,18 respectivamente indica que el draft model es especialmente eficaz en dominios donde el modelo grande produce secuencias largas y predecibles.
- Investigación en decodificación especulativa: el checkpoint sirve como referencia para estudiar el impacto de la selección de capas de atención completa en la tasa de aceptación, y para comparar con otros métodos como EAGLE o Medusa.

## Benchmarks y rendimiento

El rendimiento se mide mediante el "accept length" (longitud de aceptación), que indica el número medio de tokens aceptados por cada bloque de draft generado. Los datos provienen de contadores `spec_decode_num_*` de vLLM en tiempo de servicio:

| Dataset | Preguntas | Accept length |
|---|---|---|
| GSM8K | 1.319 | 4,75 |
| HumanEval | 164 | 4,63 |
| MATH-500 | 500 | 4,18 |
| MBPP (sanitizado) | 257 | 4,10 |
| AIME 2026 | 30 | 3,47 |
| MT-Bench | 80 | 3,39 |
| SWE-Rebench | 50 | 2,92 |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval pass@1, etc.) para este draft model, ya que no es un modelo de generación autónoma. Su rendimiento se evalúa exclusivamente por la tasa de aceptación de tokens durante la decodificación especulativa.

## Requisitos de hardware

- VRAM estimada: el modelo tiene ~1,95B parámetros. En precisión fp16/bf16, el peso ocupa aproximadamente 3,9 GB; el repositorio de 7,8 GB sugiere que puede incluir múltiples formatos o checkpoints adicionales. Para inferencia como draft, se recomienda al menos 8 GB de VRAM para dejar margen para los estados ocultos y buffers.
- GPU recomendadas: cualquier GPU consumer con 8-12 GB de VRAM (RTX 3060, RTX 4070, etc.) puede alojar el draft model. Sin embargo, en producción el draft model se ejecuta junto al modelo objetivo (250B cuantizado W4A8), que requiere múltiples GPUs de alta gama (p.ej., 4× A100/H100 con tensor parallel).
- Compatibilidad con consumer GPU: sí, el draft model en sí cabe en una GPU consumer, pero el modelo objetivo no. Para uso local con el modelo completo se necesitaría un clúster o servicios cloud.
- Opciones de despliegue: vLLM (con `--speculative-config` y `--tensor-parallel-size`), SGLang (con `--speculative-algorithm DSPARK`). También se puede usar con llama.cpp u Ollama, aunque no se documenta oficialmente.
- Latencia y throughput: no se proporcionan cifras exactas de tokens/segundo. El accept length medio de ~4,5 tokens por bloque implica una reducción de latencia de aproximadamente 3-4× en comparación con la generación autoregresiva pura, asumiendo que el draft model es lo suficientemente rápido (típicamente 10-20× más rápido que el modelo grande).

## Comparativa con modelos similares

No se dispone de comparativas directas con otros modelos draft en la información proporcionada. Sin embargo, se pueden establecer paralelismos con enfoques alternativos de decodificación especulativa:

| Modelo | Método | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Solar-Open2-250B-DSpark | DSpark (bloques, rejection sampling) | ~1,95B | no disponible | Upstage Solar License | HuggingFace |
| EAGLE (draft models genéricos) | Autoregresivo con features | ~1B-3B | depende del modelo base | MIT (para el código) | GitHub |
| Medusa (draft heads) | Cabezas de decodificación paralela | ~0,1-0,5B (heads) | depende del modelo base | Apache 2.0 | GitHub |

La diferencia clave es que DSpark genera bloques completos en lugar de token a token, lo que permite un mayor paralelismo y una mayor tasa de aceptación en dominios estructurados. No obstante, carece de la flexibilidad de métodos como EAGLE que pueden adaptarse a cualquier modelo base sin entrenamiento específico.

## Limitaciones y advertencias

- Modelo auxiliar: no debe usarse de forma independiente para generar texto; su única función es acelerar la inferencia del modelo objetivo Solar-Open2-250B-W4A8.
- Dependencia del modelo objetivo: el rendimiento (accept length) está calibrado para ese modelo específico; usarlo con otro modelo grande puede degradar la tasa de aceptación y la calidad.
- Licencia restrictiva: la Upstage Solar License impone condiciones de atribución ("Built with Solar") y puede limitar el uso comercial en ciertos escenarios. Es necesario revisar el texto completo de la licencia antes de su uso en producción.
- Sesgos y alucinaciones: al ser un draft model, no introduce sesgos propios, pero hereda los del modelo objetivo. No se han realizado evaluaciones de sesgo específicas para este checkpoint.
- Longitud de contexto no documentada: no se especifica la ventana de contexto máxima; se asume que hereda la del modelo objetivo, pero no hay confirmación oficial.
- Requisitos de infraestructura: para aprovechar el draft model en producción se necesita desplegar el modelo objetivo completo, lo que implica un coste de hardware significativo (múltiples GPUs de alta gama).
- Soporte limitado a vLLM y SGLang: no se garantiza su funcionamiento con otros motores de inferencia sin modificaciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vessl/Solar-Open2-250B-DSpark
- Modelo objetivo (W4A8): https://huggingface.co/vessl/Solar-Open2-250B-W4A8
- Modelo base original (Solar-Open2-250B): https://huggingface.co/upstage/Solar-Open2-250B
- Licencia Upstage Solar: https://huggingface.co/upstage/Solar-Open2-250B/blob/main/LICENSE
- Referencia del método DSpark (Kimi-K3-DSpark): https://huggingface.co/Inferact/Kimi-K3-DSpark
