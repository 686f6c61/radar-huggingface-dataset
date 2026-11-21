# vllm-sr/Decision-2.0-Kai-0.6B

## Resumen

Decision-2.0-Kai-0.6B es un modelo de decisión estructurada desarrollado por el equipo de vLLM Semantic Router (vllm-sr). No es un modelo generativo al uso: recibe un estado de entrada (texto o JSON) junto con un conjunto de preguntas tipificadas (elección entre opciones, sí/no o puntuación en una escala) y devuelve, en una sola pasada forward, una distribución de probabilidad sobre cada respuesta posible, sin generar texto libre. Está construido como un fine-tuning del modelo base Qwen/Qwen3-0.6B-Base, con 0,60 mil millones de parámetros y una longitud de contexto de 8.192 tokens.

El modelo se enmarca en la familia Decision 2.0, orientada a enrutamiento semántico y clasificación zero-shot dentro de pipelines de sistemas tipo "system one": decisiones rápidas, deterministas y de baja latencia que se toman antes de invocar un LLM generativo más costoso. Su relevancia actual radica en que ofrece una alternativa ligera y barata a la generación de texto para tareas de clasificación y enrutamiento, con una latencia mediana declarada de 4,9 ms por petición de una sola pregunta en una única GPU.

La propuesta encaja en arquitecturas de agentes y routers donde se necesita decidir a qué equipo, herramienta o rama del flujo enviar una petición, si se cumple una condición o cuánta urgencia tiene un caso, todo ello con salidas probabilísticas calibradas en lugar de texto parseable. La licencia Apache-2.0 facilita su integración en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (fine-tuning de Qwen/Qwen3-0.6B-Base) con cabecera de decisión personalizada (custom_code) |
| Parametros totales | 0,60B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible (repo solo con safetensors; no se documentan GGUF ni cuantizaciones alternativas) |
| Idiomas soportados | no disponible (la model card no declara idiomas; el modelo base Qwen3 es multilingüe, pero no se especifica para este fine-tuning) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-0.6B-Base, un transformer decoder-only de 0,60B parámetros, y se ha afinado como modelo de decisión con una interfaz propia (`system_one`) que acepta un estado y un diccionario de preguntas tipificadas. Cada pregunta puede ser de tres tipos: `choice` (selección entre criterios con descripción), `noul` (sí/no) y `score` (puntuación sobre una lista ordenada de criterios). El modelo devuelve una probabilidad por cada opción, lo que permite umbralizar y encadenar decisiones de forma determinista.

La innovación principal es el procesamiento conjunto de múltiples preguntas en una sola pasada forward, en lugar de generar texto y parsearlo. La model card menciona una auditoría de los datos de entrenamiento a nivel de fila contra los ítems de test del Jev Decision Index, lo que sugiere un cuidado explícito por evitar contaminación en la evaluación. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

## Capacidades

- Clasificación zero-shot mediante preguntas de elección entre opciones con criterios descritos en lenguaje natural.
- Respuestas booleanas sí/no sobre un estado de entrada.
- Puntuación ordinal sobre una escala de criterios definida por el usuario.
- Procesamiento de múltiples preguntas sobre el mismo estado en una única pasada forward, con salida probabilística por opción.
- Entrada en texto plano o JSON, adecuada para estados estructurados de sistemas.
- Salida sin generación de texto: probabilidades directamente utilizables para umbrales y enrutamiento.
- Integración como pipeline de transformers (`pipeline("decision", ...)`).
- No se documentan capacidades de tool calling, agentes multi-paso, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Enrutamiento de tickets de soporte: dado el texto de una incidencia, decidir en una sola llamada si corresponde a devoluciones, facturación o soporte técnico, usando la pregunta de tipo `choice` con criterios por equipo. La latencia de milisegundos permite aplicarlo en la puerta de entrada de cada ticket.
- Triaje de urgencia: puntuar en una escala (rutina, pronto, hoy) el estado de una solicitud para priorizar colas de atención. La salida probabilística permite fijar umbrales de escalado.
- Verificación de requisitos previos: comprobar con preguntas sí/no si un caso cumple condiciones (por ejemplo, si el cliente aporta recibo) antes de habilitar un flujo automatizado de reemplazo o reembolso.
- Router semántico en arquitecturas multi-LLM: decidir qué modelo o herramienta debe atender una consulta antes de invocar un LLM generativo, reduciendo coste y latencia en pipelines de agentes.
- Clasificación de documentos y formularios en JSON: etiquetar campos o estados estructurados con preguntas de elección y sí/no, aprovechando la entrada JSON del modelo.
- Moderación y políticas: evaluar si un contenido cumple una política concreta mediante preguntas booleanas y de puntuación, con probabilidades auditables en lugar de texto generado.
- Enrutamiento en sistemas de recomendación o atención al cliente multi-turno: combinar varias preguntas sobre el mismo estado en una sola pasada para decidir ruta, prioridad y condiciones simultáneamente.

## Benchmarks y rendimiento

Los datos publicados en la model card son los siguientes:

| Modelo | JevArena ↑ | Human-labelled transfer ↑ | Jev Decision Index ↑ |
|---|---:|---:|---:|
| Decision-2.0-Kai-0.6B | 48.6 | 45.9 | 16.3 |
| GLiNER2.5-Decide | 42.5 | 44.1 | no disponible |
| Bosun v3.1 0.6B | 38.5 | 34.2 | no disponible |
| Decision 1.0 Kai | 35.9 | 35.7 | 6.5 |
| Decision 1.0 Lex | 31.0 | 26.6 | 4.5 |

Según la model card, el modelo obtiene la mejor puntuación JevArena de su tamaño (48,6), supera a Decision 1.0 Kai en +12,7 puntos en JevArena y +9,8 en Jev Decision Index, y registra una latencia mediana de 4,9 ms por petición de una sola pregunta en una única GPU. El "Human-labelled transfer" es la mediana del macro-F1 sobre 15 tareas etiquetadas por humanos (×100). No se publican resultados de benchmarks estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 1,2 GB en precisión nativa (0,60B parámetros en fp16/bf16), más overhead de activaciones; el repo ocupa 1,5 GB en safetensors.
- Cabe en cualquier GPU consumer con 4 GB o más de VRAM (por ejemplo, RTX 3050, RTX 4060, RTX 4090) y en GPUs de datacenter (A100, H100) con holgura.
- Despliegue principal mediante `transformers>=5.17` con `trust_remote_code=True`; también como pipeline `decision`.
- No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este modelo, ni formatos GGUF.
- Latencia declarada: mediana de 4,9 ms por petición de una sola pregunta en una única GPU; no se publica throughput agregado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | JevArena | Human-labelled transfer | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Decision-2.0-Kai-0.6B | 0,60B | 8.192 | 48.6 | 45.9 | Apache-2.0 | Hugging Face |
| GLiNER2.5-Decide | no disponible | no disponible | 42.5 | 44.1 | no disponible | no disponible |
| Bosun v3.1 0.6B | 0,6B (por nombre) | no disponible | 38.5 | 34.2 | no disponible | no disponible |
| Decision 1.0 Kai | no disponible | no disponible | 35.9 | 35.7 | no disponible | Hugging Face (colección vllm-sr) |

No se dispone de datos de parámetros, contexto ni licencia de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado en decisiones estructuradas: no está pensado para generación de texto libre, razonamiento abierto ni conversación.
- La ventana de contexto está limitada a 8.192 tokens; estados muy largos requerirán truncado o resumen previo.
- No se declaran idiomas soportados; el rendimiento fuera del inglés no está garantizado ni documentado, pese a que el modelo base Qwen3 es multilingüe.
- Las salidas son probabilidades que dependen de la formulación de las preguntas y criterios; una redacción ambigua puede degradar la calibración.
- Riesgo de sesgo heredado del corpus de entrenamiento de Qwen3 y del dataset de fine-tuning, no cuantificado en la información disponible.
- Los benchmarks JevArena y Jev Decision Index son métricas propias del equipo; no son comparables directamente con benchmarks estándar de la industria.
- La carga requiere `trust_remote_code=True` por el código personalizado (`custom_code`), lo que implica ejecutar código del autor del modelo; conviene revisarlo antes de desplegar en producción.
- No se documentan cuantizaciones GGUF ni soporte en motores de inferencia alternativos a transformers.
- Licencia Apache-2.0: permite uso comercial, pero se recomienda conservar el aviso de licencia y la atribución.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vllm-sr/Decision-2.0-Kai-0.6B
- Colección Decision 2.0: https://huggingface.co/collections/vllm-sr/decision-20-6ab7cf7bdfb506bf8269cb00
- Repositorio vLLM Semantic Router: https://github.com/vllm-project/semantic-router
- Modelo base Qwen/Qwen3-0.6B-Base: https://huggingface.co/Qwen/Qwen3-0.6B-Base
