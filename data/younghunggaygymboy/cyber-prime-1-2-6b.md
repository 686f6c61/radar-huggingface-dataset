# YoungHungGayGymBoy/Cyber-Prime-1-2.6B

## Resumen

Cyber-Prime 1 (2.6B) es un modelo de lenguaje pequeño (SLM) especializado en ciberseguridad, desarrollado por YoungHungGayGymBoy (Nathan Baker) y publicado en Hugging Face. Se trata de un fine-tune del modelo base LiquidAI/LFM2-2.6B, con un total de 2.697.198.592 parámetros. La model card original atribuye la autoría a Akahsizrr, pero el repositorio actual está alojado bajo YoungHungGayGymBoy.

El modelo aborda tareas de seguridad informática como extracción de entidades de amenazas, detección de phishing, análisis de ataques HTTP, resumen de inteligencia de amenazas y evaluación de conocimiento de seguridad. Su relevancia radica en que, pese a tener solo 2.6B parámetros, supera a Llama-2-7B en todas las tareas del benchmark CyberBench y a GPT-3.5-Turbo en tres de ellas, según los resultados declarados por el autor.

La arquitectura interna del modelo base no se especifica en la información disponible, y la longitud de contexto tampoco se indica. El modelo está diseñado para funcionar en dos modos: un modo directo para clasificaciones simples y un modo de razonamiento (think mode) con cadena de pensamiento para tareas que requieren análisis más profundo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basado en LiquidAI/LFM2-2.6B) |
| Parametros totales | 2.697.198.592 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

Cyber-Prime 1 es un fine-tune del modelo LiquidAI/LFM2-2.6B. La model card menciona internamente LFM2.5-2.6B, pero el base_model declarado es LFM2-2.6B. No se proporcionan detalles sobre la arquitectura interna del modelo base (si es un transformer puro, híbrido, SSM, etc.).

El entrenamiento se realizó sobre una mezcla curada de datos de ciberseguridad, con los siguientes volúmenes declarados por el autor:

- 6.000+ filas de datos de reparación de NER, enfocadas a corregir la extracción de entidades en formato JSON.
- 5.000 filas de trazas de razonamiento HTTP, con cadenas de pensamiento para detección de ataques (XSS, SQLi, path traversal, command injection).
- 5.000 filas de clasificación directa de correos electrónicos (phishing vs. seguro).
- 2.000 filas de resumen de CyNews para generación de titulares de inteligencia de amenazas.
- 2.000 filas de datos fuente de GHSA, KEV y ATT&CK.
- Filas de opción múltiple con conocimiento de seguridad y preguntas tipo quiz.

No se menciona el uso de RLHF, DPO ni otras técnicas de alineación por preferencias. La innovación principal es el uso de dos modos de inferencia: modo directo para clasificación y resumen, y modo think (cadena de pensamiento) para tareas que se benefician de razonamiento explícito, como el análisis HTTP y la extracción de entidades.

## Capacidades

- Generación de texto en inglés, especializada en el dominio de ciberseguridad.
- Extracción de entidades nombradas (NER) en contextos de ciberamenazas, con soporte para entidades como CVE, APT, malware y actores de amenazas.
- Resumen de noticias y alertas de inteligencia de amenazas, con capacidad de generar titulares concisos.
- Clasificación de correos electrónicos como phishing o seguros en modo directo.
- Detección de ataques HTTP mediante razonamiento en cadena de pensamiento, incluyendo XSS, SQLi, path traversal y command injection.
- Respuesta a preguntas de opción múltiple sobre conocimiento de seguridad (SecMMLU, CyQuiz).
- Dos modos de uso: directo y think (cadena de pensamiento), seleccionables según la tarea.
- No se indica soporte de tool calling, function calling, agentes ni capacidades multimodales.

## Casos de uso

- Extracción de indicadores de compromiso (IOC) en informes de amenazas: el modelo puede identificar automáticamente entidades como CVE, nombres de malware y actores APT en textos técnicos, facilitando la alimentación de plataformas de inteligencia de amenazas.
- Triaje de correos de phishing en un SOC: en modo directo, clasifica correos como phishing o seguros, permitiendo priorizar la revisión manual de los mensajes marcados como maliciosos.
- Análisis de logs HTTP para detectar ataques de inyección: mediante el modo think, el modelo razona sobre patrones de peticiones HTTP y detecta posibles inyecciones SQL, XSS o path traversal, útil para la revisión de tráfico anómalo.
- Generación de resúmenes de boletines de seguridad: puede condensar avisos de fuentes como GHSA, KEV y ATT&CK en titulares breves, ahorrando tiempo a analistas que deben revisar grandes volúmenes de información.
- Asistente de conocimiento para analistas junior: responde preguntas de opción múltiple sobre conceptos de seguridad, sirviendo como herramienta de formación o consulta rápida.
- Enriquecimiento de alertas en SIEM: combina NER y clasificación para añadir contexto a alertas de seguridad, como identificar el tipo de ataque o el actor asociado, mejorando la correlación de eventos.
- Investigación de vulnerabilidades: clasifica y resume información de CVEs, facilitando la evaluación rápida de la criticidad y el impacto de una vulnerabilidad.

## Benchmarks y rendimiento

Los siguientes resultados provienen de la model card del autor, evaluados sobre el benchmark CyberBench (Liu et al., AAAI-24 AICS Workshop). No se han verificado de forma independiente.

| Dataset | Métrica | GPT-4 | GPT-3.5 Turbo | Mistral-7B Instruct | Llama-2-7B | Cyber-Prime 1 (2.6B) |
|---|---|---|---|---|---|---|
| CyNER | F1 | 0.554 | 0.334 | 0.323 | 0.263 | 0.382 |
| APTNER | F1 | 0.500 | 0.409 | 0.262 | 0.280 | 0.413 |
| CyNews | ROUGE-1 | 0.275 | 0.271 | 0.217 | 0.003 | 0.354 |
| SecMMLU | Accuracy | 0.830 | 0.780 | 0.720 | 0.630 | 0.580 |
| CyQuiz | Accuracy | 0.810 | 0.830 | 0.690 | 0.620 | 0.570 |
| Email | F1 | 0.939 | 0.789 | 0.889 | 0.942 | 0.728 |
| HTTP | F1 | 0.841 | 0.831 | 0.472 | 0.428 | 0.483 |
| Promedio | — | 0.721 | 0.609 | 0.511 | 0.451 | 0.501 |

Según el autor, el modelo supera a Llama-2-7B en las 7 tareas, a Mistral-7B-Instruct en 4 de 7, a GPT-3.5-Turbo en 3 de 7, y a GPT-4 en la tarea CyNews (ROUGE-1 0.354 vs 0.275).

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: ~5.4 GB para los pesos, más el overhead de activaciones y KV cache; se recomienda al menos 8 GB de VRAM para uso con transformers.
- VRAM estimada con cuantización 8-bit: ~3 GB; con cuantización 4-bit: ~1.5-2 GB (estimaciones orientativas, no datos oficiales).
- GPU recomendadas: RTX 3060 12 GB, RTX 4090, A100 40 GB, H100.
- Cabe en GPUs de consumo: sí, con 12 GB de VRAM en FP16, o con cuantización en GPUs de 8 GB o menos.
- Opciones de despliegue: transformers, vLLM, llama.cpp (convirtiendo los pesos a GGUF), Ollama (con cuantización) y TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La información disponible no incluye especificaciones técnicas de modelos comparables del mismo tamaño especializados en ciberseguridad. Sin embargo, la model card proporciona una comparación de rendimiento en CyberBench con Llama-2-7B, Mistral-7B-Instruct, GPT-3.5-Turbo y GPT-4, que se recoge en la tabla de la sección anterior. Cyber-Prime 1 destaca por ser un modelo de 2.6B que iguala o supera a modelos de 7B en varias tareas de seguridad, con una licencia Apache 2.0 que permite uso comercial.

## Limitaciones y advertencias

- Conocimiento limitado: en tareas de conocimiento como SecMMLU (0.580) y CyQuiz (0.570), el rendimiento es inferior al de modelos grandes, debido al reducido número de parámetros.
- Detección de phishing: el F1 de 0.728 está por debajo de GPT-3.5-Turbo (0.789) y Llama-2-7B (0.942). El autor señala una posible interferencia del modo de razonamiento con los datos de entrenamiento de HTTP.
- Detección de ataques HTTP: el F1 de 0.483 indica que el modelo puede detectar ataques evidentes, pero puede fallar ante patrones de inyección sutiles.
- No es una herramienta de seguridad de producción: el propio autor lo define como un artefacto de investigación para evaluación de benchmarks, no como un sistema de seguridad operativo.
- Solo soporta inglés.
- Riesgo de alucinación no evaluado.
- Sesgos no evaluados.
- Longitud de contexto no especificada, lo que puede limitar el procesamiento de documentos largos.
- La licencia Apache 2.0 permite uso comercial, pero se debe revisar la licencia del modelo base LiquidAI/LFM2-2.6B y la procedencia de los datos de entrenamiento.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/YoungHungGayGymBoy/Cyber-Prime-1-2.6B
- Modelo base: https://huggingface.co/LiquidAI/LFM2-2.6B
- Repositorio alternativo citado en la model card: https://huggingface.co/Akahsizrr/Cyber-Prime-1-2.6B
- Benchmark CyberBench: https://github.com/jpmorganchase/CyberBench
