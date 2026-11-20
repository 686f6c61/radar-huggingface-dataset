# TheDrummer/Artemis-31B-v1.2

## Resumen

Artemis 31B v1.2 es un ajuste fino (fine-tune) del modelo google/gemma-4-31B-it, publicado por TheDrummer en Hugging Face. El modelo está orientado principalmente a juegos de rol (roleplay, RP) y escritura creativa de alta calidad, manteniendo intactas las capacidades de propósito general del modelo base, incluyendo el uso de herramientas (tool calling). Con 31.273.088.876 parámetros (aproximadamente 31,3 mil millones), se posiciona como un modelo de tamaño medio-grande que puede ejecutarse en hardware de consumo con cuantización agresiva.

La relevancia de este modelo radica en la comunidad que lo ha adoptado: según los testimonios recogidos en la model card, varios evaluadores lo consideran el mejor ajuste de Gemma 4 disponible, con una calidad de prosa que "no se siente como Gemma 4" y un bloque de razonamiento (thinking) que recupera detalles relevantes de contextos de hasta 100k tokens. El autor distribuye también una versión GGUF a través de bartowski, lo que facilita su despliegue local.

La información técnica publicada por el autor es escasa: no se detallan la licencia, los idiomas soportados ni los datos de entrenamiento. Los datos disponibles proceden del repositorio de safetensors y de la model card, que se centra en testimonios de usuarios y recomendaciones de muestreo (samplers) más que en especificaciones formales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de google/gemma-4-31B-it; detalles internos no disponibles) |
| Parametros totales | 31.273.088.876 (aprox. 31,3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible oficialmente; los testimonios mencionan coherencia hasta ~100k tokens (un "handoff limpio" a 100k) y buen comportamiento a 20k–32k |
| Tipos de cuantizacion | no disponible en el repo original; existe versión GGUF de bartowski (tipos concretos no especificados, aunque un tester menciona "q3ks") |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo original); GGUF (repo de bartowski) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del modelo instructivo google/gemma-4-31B-it, según los metadatos del repositorio (`base_model: google/gemma-4-31B-it`, `base_model:finetune:google/gemma-4-31B-it`). No se publican detalles sobre la arquitectura interna más allá de que hereda la del modelo base Gemma 4, ni sobre el número de tokens de entrenamiento, la composición del dataset o si se emplearon técnicas de RLHF o DPO.

La model card indica que el modelo conserva la plantilla de chat de Gemma 4, con modos de pensamiento (thinking) y sin pensamiento (non-thinking), y que el bloque de razonamiento resulta especialmente eficaz para roleplay. El autor recomienda ajustar los samplers con prudencia ("sampler wrangling may be required or be conservative") y enlaza una hoja de cálculo colaborativa con configuraciones de muestreo probadas por la comunidad. No se documenta ninguna innovación técnica específica más allá del ajuste fino en sí.

## Capacidades

- Generación de texto creativo y prosa inmersiva, con diálogos que varios evaluadores describen como más humanos que los del modelo base.
- Roleplay multi-personaje con seguimiento de trama y detalles a contextos largos (testimonios de coherencia a 20k, 32k y un caso a 100k).
- Modo de razonamiento (thinking) activable mediante la plantilla de Gemma 4; el bloque de pensamiento recupera detalles relevantes y la respuesta final se mantiene fiel a él.
- Uso de herramientas (tool calling): un evaluador confirma que el ajuste "sigue haciendo tool calls correctamente".
- Uso de propósito general, no limitado a roleplay, según testimonios.
- Capacidades multilingües: no disponibles (no documentadas).
- Vision, audio u otras modalidades: no disponibles (no documentadas).

## Casos de uso

- Roleplay conversacional de larga duración: el modelo mantiene consistencia de personajes y referencias a detalles de turnos muy anteriores (testimonios de adherencia al escenario a 20k y coherencia a 32k), lo que lo hace adecuado para sesiones extensas de ficción interactiva.
- Escritura creativa asistida: generación de prosa y diálogos para narrativa, guiones o ficción serializada, aprovechando el estilo que los evaluadores describen como alejado del tono genérico del modelo base.
- Simulación de personajes para entrenamiento o evaluación: creación de agentes conversacionales con personalidad estable para pruebas de sistemas de diálogo.
- Asistente general con tool calling: al conservar las capacidades del modelo base, puede integrarse en flujos que requieran llamadas a funciones, aunque el autor no documenta garantías específicas.
- Despliegue local en hardware de consumo: gracias a la versión GGUF de bartowski, puede ejecutarse en equipos domésticos con cuantización agresiva (un tester reporta ~5 tokens/s en una configuración no especificada).
- Prototipado rápido de experiencias conversacionales: mediante la API serverless de pago por uso de Kitani anunciada en la model card, sin necesidad de infraestructura propia.
- Generación de contenido de ficción para comunidades de fans: el perfil de los testimonios (usuarios de roleplay) sugiere un uso natural en plataformas de RP y narrativa colaborativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card recoge únicamente testimonios cualitativos de usuarios, sin métricas estandarizadas (MMLU, HumanEval, GSM8K u otras).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. Como referencia orientativa basada en el tamaño (31,3B parámetros), en FP16 se necesitarían del orden de 62 GB solo para pesos; en cuantizaciones de 4 bits, aproximadamente 16–20 GB; en cuantizaciones de 3 bits, alrededor de 13–15 GB. Estas cifras son estimaciones generales, no datos publicados por el autor.
- GPU recomendadas: no disponibles en la documentación. Por tamaño, cabría esperar ejecución en A100 40/80 GB, H100 o múltiples RTX 4090; no se confirma.
- ¿Cabe en GPU de consumo? Un evaluador menciona ejecutar "Artemis V1q 31B" a unos 5 tokens/s, lo que sugiere que sí es posible en hardware de consumo con cuantización agresiva, aunque no se especifica la GPU empleada.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio) mediante la versión GGUF de bartowski; vLLM o TGI con los safetensors originales (no confirmado por el autor); API serverless de Kitani.
- Latencia y throughput: no disponibles; el único dato es el testimonio de ~5 tokens/s en una configuración no especificada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Artemis 31B v1.2 (TheDrummer) | 31,3B | no disponible (coherencia reportada hasta ~100k) | no disponible | Hugging Face (safetensors + GGUF) | Fine-tune de Gemma 4 31B orientado a RP |
| google/gemma-4-31B-it (base) | ~31B (según el nombre) | no disponible en la información | no disponible | Hugging Face | Modelo instructivo original; un tester considera el thinking de Artemis superior al del base |
| GLM 5.1 | no disponible | no disponible | no disponible | no disponible | Citado por evaluadores como competidor de "varias clases de peso superior"; sin datos verificables |
| Skyfall 4.2 | no disponible | no disponible | no disponible | no disponible | Citado por un evaluador como referencia de calidad de escritura; sin datos verificables |

La comparación cuantitativa no es posible con la información disponible: los modelos alternativos mencionados en los testimonios (GLM 5.1, Skyfall 4.2) carecen de especificaciones verificables en esta ficha.

## Limitaciones y advertencias

- Licencia no disponible: no se especifica la licencia del ajuste fino ni las condiciones de uso comercial; debe verificarse antes de cualquier despliegue en producción.
- Idiomas no documentados: no hay información sobre cobertura multilingüe; el uso en castellano no está garantizado por el autor.
- Riesgo de alucinación: inherente a los modelos generativos; no se documentan mitigaciones específicas.
- Orientación a roleplay: aunque conserva capacidades de propósito general y tool calling, el ajuste está optimizado para RP y escritura creativa, lo que puede afectar el rendimiento en tareas analíticas o técnicas frente al modelo base.
- Dependencia de samplers: el autor advierte que puede requerirse ajuste manual de los parámetros de muestreo; las configuraciones probadas por la comunidad están en una hoja de cálculo externa.
- Datos de entrenamiento desconocidos: no se detalla el dataset, los tokens vistos ni posibles sesgos introducidos durante el ajuste.
- Rendimiento en contextos muy largos: la coherencia a 100k se basa en un testimonio aislado, no en una evaluación sistemática.
- Disponibilidad vía API de terceros: el modelo se ofrece en la API de pago por uso de Kitani, un servicio externo cuyas condiciones no se detallan.

## Enlaces

- Modelo original en Hugging Face: https://huggingface.co/TheDrummer/Artemis-31B-v1.2
- Versión GGUF (bartowski): https://huggingface.co/bartowski/TheDrummer_Artemis-31B-v1.2-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Discord de BeaverAI: https://discord.gg/BeaverAI
- Patreon del autor: https://www.patreon.com/TheDrummer
- Enlaces del autor: https://linktr.ee/thelocaldrummer
- API serverless de Kitani: https://kitani.ai/
- Hoja de cálculo de samplers de la comunidad: https://docs.google.com/spreadsheets/d/1wil6YEHTnQP3DO9EF35ImQMY3lbmRt5_ns-LJavUqwQ
- Formulario para compartir samplers: https://docs.google.com/forms/d/e/1FAIpQLSfeiOeLbNt-xc8tr0BopJ4KawMm3YrLGD5mYLjZqg8ehl35BQ/viewform
