# virtuanista/LFM2.5-8B-A1B-Uncensored-GGUF

## Resumen

LFM2.5-8B-A1B-Uncensored-GGUF es una redistribución comunitaria del modelo LFM2.5-8B-A1B de Liquid AI, publicada por el usuario virtuanista en formato GGUF y sometida a un proceso de *abliteration* para eliminar el reflejo de rechazo entrenado. El modelo base, lanzado el 28 de mayo de 2026, emplea una arquitectura híbrida poco convencional que combina bloques de convolución corta (shortconv/LIV), atención con GQA y capas MoE, con 8.467.856.832 parámetros totales y una ventana de contexto de 128K tokens.

La modificación se centra en los tensores que portan la señal de rechazo (`conv.out_proj`, `self_attn.out_proj` y `feed_forward.w2`), con especial incidencia en las capas 11-23 y un pico en la capa 16. Según el autor, las capacidades de razonamiento, seguimiento de instrucciones y calidad general se conservan tras la intervención. El modelo mantiene el modo de razonamiento con bloques `<think>...</think>` del original.

El paquete incluye cinco cuantizaciones GGUF (desde IQ4_XS de 4,6 GB hasta Q8_0 de 9,0 GB), lo que permite desplegarlo en hardware de consumo mediante llama.cpp u Ollama. Es relevante para quienes necesitan un asistente local, privado y sin filtros moralistas por defecto, siempre asumiendo la responsabilidad sobre el contenido generado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: convolución corta (shortconv/LIV) + atención GQA + capas MoE |
| Parametros totales | 8.467.856.832 |
| Parametros activos | no disponible (el nombre A1B sugiere ~1B activos, sin confirmar en la información) |
| Longitud de contexto | 128K tokens |
| Tipos de cuantizacion | IQ4_XS, Q4_K_M, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (uso comercial permitido por debajo de 10 M USD de ingresos anuales) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base LFM2.5-8B-A1B no es un Transformer puro: combina bloques de convolución corta (shortconv/LIV) con atención de grupo de consultas (GQA) y capas de mezcla de expertos (MoE). Esta hibridación busca un equilibrio entre velocidad de inferencia y calidad de razonamiento, y explica por qué las herramientas genéricas de abliteration fallan en esta arquitectura, ya que apuntan a matrices que aquí no existen. El modelo conserva el modo de razonamiento estructurado mediante bloques `<think>...</think>`.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF/DPO del modelo original en la información proporcionada. La intervención de esta versión comunitaria se limita a la modificación quirúrgica de los tensores de rechazo en las capas 11-23, seguida de cuantización a GGUF; no se ha reentrenado ni ajustado el modelo con datos adicionales.

## Capacidades

- Generación de texto conversacional y seguimiento de instrucciones multi-turno.
- Razonamiento estructurado mediante bloques `<think>...</think>`.
- Capacidad de razonamiento multi-paso y descomposición de tareas.
- Respuestas sin filtros de rechazo por defecto (comportamiento *uncensored*).
- Ejecución local con llama.cpp, llama-server (API compatible con OpenAI) y Ollama.
- Soporte de contexto largo de hasta 128K tokens.
- No se dispone de información sobre tool calling, function calling, capacidades de agente, visión, audio ni cobertura multilingüe en la información proporcionada.

## Casos de uso

- Asistente local privado: el modelo puede ejecutarse íntegramente en el equipo del usuario mediante Ollama o llama.cpp, sin enviar datos a servicios externos, gracias a sus cuantizaciones de 4,6-9,0 GB.
- Análisis de documentos extensos: con 128K tokens de contexto, puede procesar contratos, informes o bases de código completas en una sola pasada para extraer información o resumir.
- Escritura creativa sin restricciones: adecuado para ficción, guiones o narrativa que requiera tratar temas sensibles sin rechazos automáticos, con la responsabilidad editorial del usuario.
- Investigación sobre alineación y seguridad: permite estudiar el comportamiento de un modelo *abliterated* frente al original, comparando respuestas y analizando qué tensores portan la señal de rechazo.
- Generación de código en entornos controlados: puede integrarse en pipelines locales de asistencia a la programación mediante llama-server con API compatible con OpenAI, sin dependencia de la nube.
- Chatbot de atención al cliente con contexto largo: la ventana de 128K permite mantener historiales de conversación extensos y recuperar información de manuales o FAQs incluidos en el prompt.
- Prototipado rápido en hardware de consumo: la cuantización IQ4_XS (4,6 GB) permite probar el modelo en portátiles o GPUs modestas antes de escalar a despliegues mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,6 GB (IQ4_XS), 5,2 GB (Q4_K_M), 6,0 GB (Q5_K_M), 7,0 GB (Q6_K) y 9,0 GB (Q8_0), más el espacio para la caché KV según la longitud de contexto.
- GPU recomendadas: no disponibles de forma específica en la información; por tamaño, el modelo cabe en GPUs de consumo con 8-12 GB de VRAM en cuantizaciones bajas y requiere 16 GB o más para Q8_0 con contexto amplio.
- Cabe en GPU de consumo: sí, en modelos como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090 24 GB, dependiendo de la cuantización y la longitud de contexto.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server` con API compatible con OpenAI) y Ollama (`ollama run virtuanista/lfm2.5-8b-a1b-uncensored`).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM2.5-8B-A1B-Uncensored (este) | 8,47B | 128K | Híbrida shortconv + GQA + MoE | LFM Open v1.0 | GGUF en HF y Ollama |
| LiquidAI/LFM2.5-8B-A1B (base) | 8,47B | 128K | Híbrida shortconv + GQA + MoE | LFM Open v1.0 | Pesos originales en HF |
| Alternativas de ~8B con contexto largo | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparado ni de otros modelos de referencia en la información proporcionada.

## Limitaciones y advertencias

- Ausencia de barreras de seguridad: el modelo responde con menos filtros, lo que incrementa el riesgo de generar contenido dañino, ilegal o engañoso si se usa sin supervisión.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual en la información disponible; como todo modelo generativo, puede inventar datos.
- Idiomas soportados no documentados: se desconoce la cobertura multilingüe real y la calidad en idiomas distintos del inglés.
- Licencia restrictiva en parte: la LFM Open License v1.0 permite uso comercial solo por debajo de 10 millones de USD de ingresos anuales y exige conservar los avisos de copyright y atribución de Liquid AI en cualquier redistribución.
- Modificación no auditada: el proceso de abliteration es obra de un tercero y no cuenta con validación independiente publicada; puede degradar sutilmente el seguimiento de instrucciones o la coherencia en tareas complejas.
- Contexto largo con coste de memoria: la caché KV para 128K tokens puede superar la VRAM disponible en GPUs de consumo, obligando a reducir el contexto o usar offloading a CPU.
- Sesgos heredados: no se han documentado evaluaciones de sesgo del modelo base ni de esta versión.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/virtuanista/LFM2.5-8B-A1B-Uncensored-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-8B-A1B
- Licencia: https://huggingface.co/virtuanista/LFM2.5-8B-A1B-Uncensored-GGUF/blob/main/LICENSE
- Ollama: https://ollama.com/virtuanista/lfm2.5-8b-a1b-uncensored
- Perfil del autor: https://huggingface.co/virtuanista
- Organización Liquid AI: https://huggingface.co/LiquidAI
