# woooflet/Muse-Glimmer-30B-AutoRound-INT4

## Resumen

Muse Glimmer 30B es un modelo agéntico multimodal de razonamiento desarrollado por Meta Superintelligence Labs, presentado en agosto de 2026 como una alternativa abierta y eficiente para workflows locales en hardware de consumo. Con 30 mil millones de parámetros, arquitectura densa y ventana de contexto de 131 072 tokens, acepta entradas de texto e imagen, genera razonamiento encadenado (chain-of-thought) de forma nativa y dispone de tool calling integrado. Está destilado de Muse Spark, un modelo mayor, y optimizado para tareas de agente autónomo.

Este repositorio concreto, `woooflet/Muse-Glimmer-30B-AutoRound-INT4`, es una cuantización INT4 W4A16 del modelo base producida con AutoRound (versión 0.14.2). Cuantiza únicamente el decoder de texto (52 capas) a 4 bits con group size 128, mientras mantiene la torre de visión, embeddings, norm layers, adapter y la cabeza de salida en BF16, preservando así toda la capacidad multimodal del original. El resultado es un checkpoint de unos 21 GB que puede servirse con SGLang o vLLM en GPUs de consumo como dos RTX 3090, con una calidad de texto prácticamente idéntica a la versión BF16 (perplejidad incluso ligeramente mejor y divergencia KL media de ~0,001 nats/token).

La relevancia de esta cuantización radica en que permite ejecutar un modelo de 30B con capacidades agénticas y multimodales en hardware asequible, sin sacrificar la fidelidad del texto. Es una opción práctica para desarrolladores que necesitan desplegar asistentes locales, agentes autónomos o sistemas de razonamiento multimodal con requisitos de VRAM moderados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (decoder de texto de 52 capas + torre de visión ViT-G de 50 capas) |
| Parametros totales | 30B (modelo base); el repo cuantizado reporta 7 979 531 264 en safetensors (probablemente solo los pesos cuantizados) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 131 072 tokens (según OpenRouter) |
| Tipos de cuantizacion | INT4 W4A16 (group size 128, simétrico) |
| Idiomas soportados | No disponible (el modelo base es multilingüe, pero no se especifican idiomas concretos) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (8 shards, packing auto_gptq: qweight/qzeros/scales transpuestos) |

## Arquitectura y entrenamiento

El modelo base, Muse Glimmer 30B, es un transformer denso multimodal desarrollado por Meta Superintelligence Labs. Combina un decoder de texto de 52 capas con una torre de visión ViT-G de 50 capas, un adapter y una proyección de visión. Está destilado de Muse Spark, un modelo de mayor tamaño, y optimizado específicamente para tareas de agente autónomo: razonamiento encadenado, tool calling y seguimiento de instrucciones complejas. Su ventana de contexto alcanza los 131 072 tokens, con una salida máxima de la misma longitud.

La cuantización de este repositorio se realizó con AutoRound (auto_round 0.14.2) sobre el decoder de texto únicamente, dejando la torre de visión y el resto de componentes en BF16. El esquema es INT4 W4A16 con group size 128 y cuantización simétrica. La calibración usó una mezcla de 25 categorías de datasets de NVIDIA (razonamiento, código, function calling, RAG, matemáticas, seguridad, etc.), con 72 muestras extraídas de las cuales 28 superaron el filtro de longitud de secuencia ≤ 1024. El proceso empleó 300 iteraciones, lr de 5e-3 y batch size 1. El checkpoint se exportó en formato auto_gptq, con la configuración `block_name_to_quantize` ajustada a `model.layers` para compatibilidad con SGLang y vLLM.

## Capacidades

- Razonamiento multimodal: acepta texto e imágenes, y genera cadenas de razonamiento (chain-of-thought) en un campo separado antes de la respuesta final.
- Tool calling nativo: soporta invocación de funciones y herramientas, esencial para agentes autónomos.
- Capacidades agénticas: optimizado para tareas de agente con múltiples pasos, como planificación, búsqueda web, gestión de calendario o ejecución de código.
- Generación de texto y código: maneja instrucciones complejas, preguntas de conocimiento, matemáticas y programación.
- Multilingüe: el modelo base soporta varios idiomas (aunque no se detallan en la información disponible), incluyendo código y STEM en lenguajes como hindi, japonés y portugués según los datos de calibración.
- Larga ventana de contexto: 131 072 tokens, adecuado para documentos extensos, conversaciones multi-turno y tareas RAG.

## Casos de uso

- Asistente local en hardware de consumo: gracias a la cuantización INT4, el modelo puede ejecutarse en una GPU de 24 GB (por ejemplo, RTX 3090 o 4090) o en configuraciones de doble GPU, ofreciendo un asistente multimodal con razonamiento y tool calling sin depender de la nube.
- Agente autónomo de automatización de tareas: con su soporte nativo de tool calling y razonamiento multi-paso, puede gestionar calendarios, enviar correos, buscar información en la web o interactuar con APIs, todo desde un entorno local.
- Análisis de documentos con imágenes: al aceptar entradas de imagen y texto, puede extraer información de capturas, diagramas o gráficos y razonar sobre ellos, útil en entornos de investigación o soporte técnico.
- Generación de código en producción: su capacidad de razonamiento y tool calling permite integrarlo en pipelines de CI/CD para generar, revisar o corregir código, con la ventaja de ejecutarse en infraestructura propia.
- Chatbot de atención al cliente con contexto largo: la ventana de 131K tokens permite mantener conversaciones extensas con historial completo, y el modo de razonamiento mejora la coherencia de las respuestas.
- Investigación y educación: como modelo abierto (Apache 2.0), es adecuado para experimentar con técnicas de cuantización, fine-tuning o evaluación de modelos agénticos multimodales en entornos académicos.

## Benchmarks y rendimiento

El autor de la cuantización proporciona métricas de fidelidad relativas al modelo base BF16, medidas sobre un conjunto de validación reducido (4 párrafos de prosa general, 431 tokens en total). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

| Metrica | BF16 base | AutoRound INT4 (este repo) |
|---|---|---|
| Perplejidad (PPL, menor es mejor) | 1,00218 | 1,00163 |
| NLL media por token (nats) | 0,00218 | 0,00163 |
| Divergencia KL media vs BF16 (nats/token) | 0,0 | 0,001114 |

La divergencia KL por ejemplo fue de 0,00127, 0,00032, 0,00068 y 0,00217. El autor indica que la salida INT4 es tres órdenes de magnitud más cercana al BF16 que intentos previos con AWQ (que medían ~0,46 nats/token), y que reproduce razonamiento coherente, tool calling y comprensión de visión al servirse.

## Requisitos de hardware

- VRAM estimada: el checkpoint pesa ~21 GB en disco, por lo que se necesita al menos 24 GB de VRAM para cargarlo completo en FP16/BF16 de activaciones. Con la cuantización INT4, cabe en una RTX 3090 o RTX 4090 (24 GB) si se usa offloading de activaciones o en dos GPUs de 12 GB.
- GPU recomendadas: validado en 2× RTX 3090 (48 GB combinados) con SGLang. También debería funcionar en una sola RTX 4090 o A100 de 40 GB.
- Opciones de despliegue: SGLang y vLLM con la ruta nativa de AutoRound (`auto-round`). No se menciona compatibilidad con llama.cpp u Ollama en la información disponible.
- Latencia y throughput: no se proporcionan datos concretos. Dado el tamaño y la cuantización, se espera una generación de varios tokens por segundo en GPUs de consumo, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Muse Glimmer 30B (BF16 base) | 30B | 131 072 | BF16 | Apache 2.0 | Hugging Face, NVIDIA NIM, OpenRouter |
| woooflet/Muse-Glimmer-30B-AutoRound-INT4 (este repo) | 30B (base) | 131 072 | INT4 W4A16 | Apache 2.0 | Hugging Face |
| dbirks/Muse-Glimmer-30B-int4-AutoRound | 30B (base) | 131 072 | INT4 (AutoRound) | Apache 2.0 | Hugging Face |

Ambas cuantizaciones INT4 del mismo modelo base son funcionalmente equivalentes en arquitectura y licencia. La diferencia principal está en el proceso de calibración y los detalles de exportación; la de woooflet documenta explícitamente métricas de fidelidad y compatibilidad con SGLang/vLLM. No se dispone de comparativas con otros modelos agénticos de tamaño similar (por ejemplo, Qwen o Llama) en la información proporcionada.

## Limitaciones y advertencias

- La cuantización INT4 puede introducir ligeras degradaciones en tareas muy sensibles a la precisión numérica, aunque las métricas reportadas indican una pérdida mínima frente al BF16.
- No se han publicado benchmarks estándar (MMLU, HumanEval, etc.) para esta cuantización; las métricas de PPL y KL son relativas y sobre un conjunto de validación muy pequeño.
- El modelo base es de razonamiento: requiere configurar el parser de razonamiento (campo `reasoning` separado) y dar suficiente `max_tokens` para que la cadena de pensamiento se complete antes de la respuesta final.
- La información sobre idiomas soportados no está disponible; aunque el modelo base es multilingüe, no se garantiza un rendimiento uniforme en todos los idiomas.
- No se documentan sesgos específicos, pero al ser un modelo entrenado con datos de internet y datasets de NVIDIA, puede heredar sesgos sociales, culturales o de género presentes en esos datos.
- Riesgo de alucinación: como todo modelo generativo, puede producir información falsa o inventada, especialmente en tareas de conocimiento abierto o razonamiento complejo.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base y de los datasets de calibración (NVIDIA) para asegurar el cumplimiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/woooflet/Muse-Glimmer-30B-AutoRound-INT4
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Cuantización alternativa (dbirks): https://huggingface.co/dbirks/Muse-Glimmer-30B-int4-AutoRound
- Blog de Meta (anuncio de Muse Glimmer): https://research.meta.ai/blog/introducing-muse-glimmer-open-agentic-model
- Model card en NVIDIA NIM: https://build.nvidia.com/meta/muse-glimmer-30b/modelcard
- Página en OpenRouter (precios y proveedores): https://openrouter.ai/meta/muse-glimmer-30b
