# Tileward-Inc/Tileward-NemotronLabs-VoiceChat-11B

## Resumen

Tileward-NemotronLabs-VoiceChat-11B es una compresión del modelo de voz NVIDIA NemotronLabs-VoiceChat-11B, desarrollada por Tileward Inc. El modelo base de NVIDIA es un sistema de voz conversacional que combina escucha, habla y llamada a herramientas (tool calling) de forma simultánea, con aproximadamente 11.000 millones de parámetros. Tileward aplica técnicas de compresión de pesos para reducir el tamaño del fichero de 44,4 GB a 11,5 GB, un 74 % menos, manteniendo un rendimiento comparable en la selección de herramientas.

La relevancia de esta ficha radica en que el modelo comprimido conserva capacidades de agente de voz con una huella de almacenamiento mucho menor, lo que facilita su despliegue en infraestructura más modesta. Según la model card del autor, el modelo comprimido selecciona la herramienta correcta en 55 de 80 peticiones habladas, frente a 52 del original, y coincide con el siguiente token del original en el 95 % de los casos.

No obstante, los pesos no están publicados en Hugging Face: el acceso es únicamente bajo petición mediante una reunión con un ingeniero de Tileward. La información pública disponible en la model card es limitada y no incluye detalles sobre la arquitectura interna, los datos de entrenamiento ni benchmarks estándar de razonamiento o código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de voz conversacional NVIDIA; arquitectura interna no detallada) |
| Parametros totales | aproximadamente 11 000 millones (según nombre del modelo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | compresión propietaria de Tileward (no se especifica el esquema exacto); fichero de 11,5 GB frente a 44,4 GB del original |
| Idiomas soportados | no disponible |
| Licencia | openmdw-1.1 (OpenMDW License Agreement, version 1.1) |
| Formato de pesos | no disponible (pesos no publicados; acceso bajo petición) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo base ni del comprimido. Se sabe que el modelo original de NVIDIA es un sistema de voz que integra escucha, síntesis de habla y llamada a herramientas en un único modelo de aproximadamente 11 000 millones de parámetros. Tileward ha aplicado una compresión de pesos que reduce el fichero de 44,4 GB a 11,5 GB, lo que sugiere una representación de menor precisión que los 16 bits (el mismo modelo almacenado en 16 bits ocuparía 24,2 GB según la tabla del autor).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas como decodificación especulativa o atención lineal. La model card únicamente reporta dos métricas de fidelidad: la selección de herramienta correcta en 80 peticiones habladas (55 frente a 52 del original) y la coincidencia del siguiente token con el original (95 %).

## Capacidades

- Voz conversacional: el modelo escucha y habla, según la descripción del modelo base de NVIDIA.
- Llamada a herramientas (tool calling) simultánea a la conversación de voz: la model card reporta 55 aciertos en la selección de herramienta correcta sobre 80 peticiones habladas.
- Generación de texto y siguiente token: se reporta un 95 % de coincidencia con el siguiente token del modelo original.
- Capacidades de agente: el modelo base se describe como capaz de escuchar, hablar y llamar a herramientas al mismo tiempo.
- Capacidades multilingües: no disponible.
- Razonamiento, código, matemáticas, visión, audio: no disponible en la información proporcionada.
- Modo de pensamiento (thinking mode): no disponible.

## Casos de uso

- Agentes de voz para atención al cliente: el modelo puede gestionar conversaciones habladas y, simultáneamente, invocar herramientas como consultas a bases de datos o sistemas de ticketing. La compresión a 11,5 GB reduce los requisitos de almacenamiento en el despliegue.
- Asistentes de voz con integración de API: gracias al tool calling, se puede conectar a servicios externos (calendario, correo, CRM) mientras mantiene la conversación hablada.
- Despliegue en infraestructura con almacenamiento limitado: el fichero de 11,5 GB frente a los 44,4 GB del original facilita el empaquetado en contenedores y la distribución en entornos edge o servidores con disco reducido.
- Pruebas de concepto de agentes de voz: al mantener el 95 % de coincidencia con el siguiente token del original, sirve como sustituto ligero en entornos de desarrollo y validación.
- Sistemas de IVR (respuesta interactiva de voz) con lógica de negocio: el modelo puede seleccionar la herramienta adecuada en función de la petición hablada, integrándose en flujos de telefonía automatizada.
- Investigación en compresión de modelos de voz: el modelo comprimido permite estudiar el impacto de la cuantización en tareas de tool calling y generación de habla sin necesidad de desplegar el modelo original de 44,4 GB.

## Benchmarks y rendimiento

| Metrica | VoiceChat 11B (original NVIDIA) | Mismos pesos en 16 bits | Tileward VoiceChat 11B |
|---|---|---|---|
| Tamano de fichero | 44,4 GB | 24,2 GB | 11,5 GB |
| Herramienta correcta (80 peticiones habladas) | 52 | no disponible | 55 |
| Coincidencia con el siguiente token del original | – | – | 95 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El fichero de pesos ocupa 11,5 GB, por lo que la inferencia requerirá al menos esa cantidad de memoria más el overhead del runtime, pero no se especifica.
- GPU recomendadas: no disponible.
- ¿Cabe en GPU de consumo? No disponible; con 11,5 GB de pesos, en teoría cabría en GPUs con 16 GB o más de VRAM, pero no se confirma en la documentación.
- Opciones de despliegue: no disponible (no se mencionan vLLM, llama.cpp, Ollama ni TGI).
- Latencia y throughput: la model card menciona que el modelo comprimido "funciona en tiempo real en una sola tarjeta" en el artículo de investigación enlazado, pero no se aportan cifras concretas de latencia o throughput en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Tileward-NemotronLabs-VoiceChat-11B | ~11 000 M | no disponible | openmdw-1.1 | Solo bajo petición | Compresión del modelo de NVIDIA; 11,5 GB |
| NVIDIA NemotronLabs-VoiceChat-11B | ~11 000 M | no disponible | openmdw-1.1 | Pesos en Hugging Face | Modelo base original; 44,4 GB |
| Mismos pesos en 16 bits | ~11 000 M | no disponible | openmdw-1.1 | No disponible como artefacto | Referencia de tamano: 24,2 GB |

No se dispone de información sobre otros modelos de voz comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Los pesos no están publicados en Hugging Face; el acceso requiere solicitar una reunión con un ingeniero de Tileward, lo que limita la reproducibilidad y la evaluación independiente.
- La licencia openmdw-1.1 debe revisarse para uso comercial; la model card indica que el modelo es una versión modificada del original bajo el mismo acuerdo, pero no se detallan las restricciones concretas.
- La compresión puede introducir degradaciones no reportadas en tareas distintas al tool calling y la predicción del siguiente token; solo se documentan dos métricas de fidelidad.
- No se dispone de información sobre sesgos, riesgo de alucinación, idiomas soportados ni limitaciones de contexto.
- El rendimiento reportado (55/80 en selección de herramienta) procede del propio autor y no ha sido verificado de forma independiente.
- No se especifican los requisitos de hardware ni las opciones de despliegue, lo que dificulta la planificación de producción.
- El modelo está orientado a voz conversacional con tool calling; no hay evidencia de capacidades de razonamiento, código o matemáticas.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Tileward-Inc/Tileward-NemotronLabs-VoiceChat-11B)
- [Modelo base NVIDIA NemotronLabs-VoiceChat-11B](https://huggingface.co/nvidia/NVIDIA-NemotronLabs-VoiceChat-11B)
- [Licencia OpenMDW-1.1](https://huggingface.co/nvidia/NVIDIA-NemotronLabs-VoiceChat-11B/blob/main/LICENSE)
- [Articulo de investigacion: We compressed VoiceChat by 74% and made it run in real time on one card](https://tileward.com/research/a-smaller-voice-agent/)
- [Investigacion de Tileward](https://tileward.com/research/)
- [Sitio web de Tileward](https://tileward.com)
- [Reserva de reunion con un ingeniero](https://calendar.app.google/hg2DzFTxKJgwFWm19)
