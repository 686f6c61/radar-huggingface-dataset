# svensziglevics/Inkling-2-Mini-LV-GGUF

## Resumen

Inkling-2-Mini-LV-GGUF es una adaptación local al letón del modelo base thinkingmachines/Inkling-2-Mini, un transformer con mezcla de expertos (MoE) de 26.070.385.152 parámetros totales. La ficha la publica el usuario svensziglevics en Hugging Face y distribuye los pesos en formato GGUF cuantizado Q4_K_M, lo que permite ejecutar el modelo en hardware de consumo mediante llama.cpp u Ollama. El objetivo declarado es dotar al modelo base de capacidad nativa de razonamiento en letón, incluyendo una cadena de pensamiento (`<|content_thinking|>`) en ese idioma, algo que el modelo original no ofrecía de forma fiable.

La adaptación se construyó con QLoRA de 4 bits sobre los 128 expertos enrutados y las proyecciones de atención (405 millones de parámetros entrenables con r=16 y rsLoRA), seguida de una segunda etapa de GRPO en política con anclaje KL SDFT. El resultado exportado es el checkpoint de la etapa 2, que según la model card mejora de forma sustancial las métricas en letón respecto al modelo base (por ejemplo, belebele lvs_Latn pasa del 0,0 % al 86,7 % en una sonda de 15 ítems). Es relevante ahora porque cubre un hueco poco atendido: modelos abiertos con razonamiento y conversación de calidad en una lengua de bajos recursos como el letón, y lo hace con licencia Apache 2.0 y pesos GGUF listos para desplegar en local.

El repositorio ocupa 18,1 GB y contiene los pesos cuantizados junto con un Modelfile para Ollama. La información pública disponible es escasa: no hay datos de pipeline, no se detalla la longitud de contexto nativa del modelo base y las cifras de benchmarks proceden de sondas pequeñas (6 a 15 ítems), por lo que deben interpretarse como indicios y no como evaluaciones robustas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) "looped-transformer" según la model card; detalles internos no disponibles |
| Parametros totales | 26.070.385.152 |
| Parametros activos | Aproximadamente 3,4–5,4 mil millones según la model card (no confirmado de forma independiente) |
| Longitud de contexto | No disponible de forma nativa; el ejemplo de llama.cpp usa `-c 32768` |
| Tipos de cuantizacion | GGUF Q4_K_M (única cuantización publicada en este repositorio) |
| Idiomas soportados | Letón (lv) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base se distribuye en safetensors) |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos descrito en la model card como "looped-transformer MoE" de 26,4 mil millones de parámetros totales y entre 3,4 y 5,4 mil millones activos. La adaptación no modifica la arquitectura: se aplica QLoRA de 4 bits con Unsloth sobre las proyecciones de atención y los 128 expertos enrutados, con rango 16, rsLoRA y 405 millones de parámetros entrenables, preservando las compuertas de mensaje en 16 bits. Los datos de adaptación provienen del dataset `svensziglevics/inkling-lv-dataset`, que mezcla el corpus de traducción `TildeAI/TildeOpen-MT-Euro-mix`, destilación de instrucciones de TildeOpen-30B, QA sobre Wikipedia en letón, razonamiento en letón y chat coloquial, con una porción de replay en inglés y código (FineTome).

El entrenamiento se realizó en dos etapas: una SFT con `train_on_responses_only` para enseñar el formato nativo de pensamiento en letón (`<|content_thinking|>`), y una segunda etapa de GRPO en política con anclaje KL SDFT para estabilizar y afinar el razonamiento. La model card advierte que la cadena de pensamiento en letón es más verbosa que en inglés (aproximadamente 300–600 tokens), por lo que recomienda `max_new_tokens >= 768` cuando se activa el modo razonamiento, o bien `reasoning_effort="none"` para respuestas directas.

## Capacidades

- Generación de texto conversacional en letón e inglés, con registro coloquial y formal.
- Razonamiento con cadena de pensamiento nativa en letón mediante el canal `<|content_thinking|>` y salida final en `<|content_text|>`.
- Respuesta directa sin razonamiento cuando se desactiva el modo thinking (`reasoning_effort="none"`).
- Comprensión lectora y QA en letón, incluyendo conocimiento sobre cultura y geografía letonas.
- Razonamiento de sentido común en letón (evaluado con copa-lv).
- Capacidad de código y respuesta en inglés preservada mediante replay de datos en inglés.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible` en el repositorio).
- Soporte de ejecución local mediante llama.cpp y Ollama.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión ni audio.

## Casos de uso

- Asistente conversacional en letón para atención al cliente: el modelo mantiene diálogos multi-turno en lengua letona con registro coloquial, adecuado para entornos locales donde los modelos multilingües grandes rinden peor en esta lengua.
- Razonamiento y explicación educativa en letón: gracias a la cadena de pensamiento nativa, puede desglosar problemas paso a paso para estudiantes letonohablantes, con la precaución de reservar al menos 768 tokens de generación.
- QA sobre contenido enciclopédico letón: el ajuste incluye datos de Wikipedia en letón, por lo que es útil para responder preguntas sobre historia, geografía y cultura de Letonia (por ejemplo, los cuatro distritos culturales históricos).
- Despliegue local en estaciones de trabajo sin GPU de datacenter: al estar en GGUF Q4_K_M, puede ejecutarse con llama.cpp u Ollama en equipos de gama alta de consumo, útil para prototipos y demos offline.
- Traducción y adaptación de contenido entre letón e inglés: la mezcla de datos de traducción Tilde sugiere utilidad para tareas de traducción asistida, aunque no se han publicado métricas específicas de traducción.
- Generación de texto y código en inglés como uso secundario: el replay en inglés y código mantiene una sanity check del 100 % en una sonda de 10 ítems, lo que permite usarlo en tareas bilingües básicas.
- Investigación sobre adaptación de lenguas de bajos recursos: el repositorio documenta el pipeline completo (LoRA sin regret, QLoRA de 4 bits sobre MoE, GRPO con anclaje KL), lo que lo convierte en referencia reproducible para otros idiomas.

## Benchmarks y rendimiento

Los únicos datos publicados proceden de la model card y se basan en sondas muy pequeñas (6 a 15 ítems), por lo que tienen valor indicativo, no concluyente.

| Metrica | Base Inkling-2-Mini | Stage 1 SFT (LoRA) | Stage 2 GRPO+SDFT (exportado) |
|---|---|---|---|
| facebook/belebele (lvs_Latn, 15 items) | 0,0 % | 80,0 % | 86,7 % |
| AiLab-IMCS-UL/copa-lv (15 items) | 33,3 % | 73,3 % | 80,0 % |
| Pureza de pensamiento en letón (`<\|content_thinking\|>`) | 7,9 % | 100,0 % | 100,0 % (sonda de 6 ítems) |
| Sanity check inglés/código (10 items) | 100,0 % | 90,0 % | 100,0 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 18,1 GB en Q4_K_M, por lo que se necesita aproximadamente esa cantidad de memoria (o memoria unificada) más overhead de contexto; con contexto de 32 768 tokens el consumo adicional de KV cache puede ser considerable.
- GPU recomendadas: no hay datos oficiales; por tamaño, una RTX 4090 (24 GB) o una RTX 3090 (24 GB) deberían poder cargar el modelo en Q4_K_M, y para mayor margen de contexto se recomienda A100 40/80 GB o H100.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas de 24 GB con Q4_K_M y contexto moderado; en tarjetas de 16 GB requeriría cuantizaciones más agresivas no publicadas en este repositorio.
- Opciones de despliegue: llama.cpp (`llama-cli`), Ollama (incluye Modelfile), y en principio cualquier runtime compatible con GGUF; la etiqueta `endpoints_compatible` sugiere compatibilidad con endpoints alojados.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de alternativas en la información proporcionada, por lo que la comparación se limita a características estructurales.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Inkling-2-Mini-LV (este) | 26,07 B totales, ~3,4–5,4 B activos | No disponible (ejemplo con 32 768) | lv, en | Apache 2.0 | GGUF Q4_K_M |
| thinkingmachines/Inkling-2-Mini (base) | 26,4 B totales, ~3,4–5,4 B activos | No disponible | No detallado | Apache 2.0 (según este repo) | Safetensors |
| Alternativas de tamaño similar | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Los benchmarks publicados se basan en sondas de 6 a 15 ítems, insuficientes para estimar el rendimiento real; no deben citarse como evidencia sólida.
- Riesgo de alucinación inherente a los modelos generativos, agravado por el ajuste fino sobre un corpus limitado y por la cadena de pensamiento larga, que puede derivar en razonamientos plausibles pero incorrectos.
- El alcance idiomático está restringido a letón e inglés; el rendimiento en castellano u otras lenguas no está documentado y probablemente sea deficiente.
- La cadena de pensamiento en letón consume 300–600 tokens de media; con presupuestos de generación bajos el modelo puede no cerrar el bloque de pensamiento y producir salidas truncadas.
- Solo se publica una cuantización (Q4_K_M); no hay versiones de mayor precisión ni alternativas para hardware con menos memoria.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y los datasets de origen (Tilde, Wikipedia, etc.) pueden imponer condiciones adicionales que conviene verificar antes de un despliegue en producción.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, sin validación comunitaria ni auditoría externa.
- No se documentan sesgos específicos, pero la mezcla de datos (traducción automática, destilación y Wikipedia) puede introducir sesgos de dominio y de estilo.
- No hay soporte documentado de tool calling ni de flujos agénticos, lo que limita su uso en pipelines automatizados complejos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/svensziglevics/Inkling-2-Mini-LV-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Adaptador LoRA (etapa 2): https://huggingface.co/svensziglevics/Inkling-2-Mini-LV-LoRA/tree/main/stage2-grpo-lv-think
- Dataset de adaptación: https://huggingface.co/datasets/svensziglevics/inkling-lv-dataset
- Corpus de traducción Tilde: https://huggingface.co/datasets/TildeAI/TildeOpen-MT-Euro-mix
- Modelo de destilación TildeOpen-30B: https://huggingface.co/martinsu/tildeopen-30b-mu-instruct
- QA de Wikipedia en letón: https://huggingface.co/datasets/martinsu/latvian-wikipedia-qa-gemma3
- Dataset de razonamiento en letón: https://huggingface.co/datasets/TitleOS/latvian_glaiveai_reasoning-v1_5k_subset
- Benchmark belebele: https://huggingface.co/datasets/facebook/belebele
- Benchmark copa-lv: https://huggingface.co/datasets/AiLab-IMCS-UL/copa-lv
