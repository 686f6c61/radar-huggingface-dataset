# vllm-sr/Decision-2.0-Eos-0.8B

## Resumen

Decision-2.0-Eos-0.8B es un modelo de decisión estructurada de 0,75 mil millones de parámetros desarrollado por el equipo de vLLM Semantic Router. No es un modelo generativo al uso: recibe un estado de entrada (texto o JSON) y un conjunto de preguntas tipificadas (elección entre opciones, sí/no o puntuación en una escala) y devuelve, en una sola pasada forward, una probabilidad para cada respuesta posible, sin generar texto. Resuelve el problema del enrutamiento y la clasificación de baja latencia en pipelines de agentes y sistemas de enrutamiento semántico, donde generar una respuesta con un LLM resulta demasiado lento y caro.

El modelo es un fine-tuning de Decision-1.0-Eos-0.8B, con soporte de contexto de 16.384 tokens y licencia Apache-2.0. Su propuesta diferencial es la agregación de múltiples preguntas heterogéneas sobre el mismo input en un único paso de inferencia, con una latencia mediana declarada de 6,0 ms por petición de una sola pregunta en una única GPU.

Es relevante ahora porque cubre un nicho concreto —la capa de decisión de los sistemas de enrutamiento de modelos y de agentes— con un coste computacional muy inferior al de un LLM generativo, y porque su evaluación pública (JevArena, Jev Decision Index) lo sitúa por delante de los modelos de su tamaño comparados en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer con código personalizado, `trust_remote_code=True`; no se detalla en la model card) |
| Parametros totales | 0,75B |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 16.384 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers, `AutoModel` con código remoto) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna más allá de indicar que es un modelo de la familia transformer cargable con `transformers>=5.17` mediante `AutoModel` y `trust_remote_code=True`, y que expone una interfaz propietaria `system_one(state, questions)` junto con un pipeline `decision`. El modelo se presenta como un «system-one»: un módulo de decisión rápida e intuitiva, en contraposición a la deliberación generativa de los LLM. El tamaño del repositorio es de 2,0 GB.

El entrenamiento consiste en un fine-tuning sobre Decision-1.0-Eos-0.8B. La model card menciona que los datos de entrenamiento fueron auditados a nivel de fila contra todos los ítems de test del Jev Decision Index, lo que indica una preocupación explícita por evitar contaminación en la evaluación. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. La innovación técnica destacable es la respuesta conjunta de preguntas de distinto tipo (choice, noul —sí/no— y score) en un único forward pass, devolviendo distribuciones de probabilidad por opción en lugar de texto libre.

## Capacidades

- Clasificación zero-shot con etiquetas definidas en tiempo de inferencia mediante criterios descriptivos.
- Preguntas de tipo elección (`choice`): selecciona una opción entre varias con probabilidad asociada.
- Preguntas de tipo sí/no (`noul`): respuesta binaria con probabilidad.
- Preguntas de tipo puntuación (`score`): valoración en una escala ordinal definida por el usuario (por ejemplo, Routine / Soon / Today).
- Respuesta conjunta de múltiples preguntas sobre el mismo estado en una sola pasada forward.
- Entrada multimodal en el sentido de aceptar texto plano o JSON estructurado como estado.
- Interfaz de pipeline de transformers (`pipeline("decision", ...)`).
- No genera texto: la salida es un conjunto de probabilidades por respuesta.
- No se documentan capacidades de tool calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Enrutamiento de peticiones en atención al cliente: dado el texto de un ticket, clasificar en una sola llamada el equipo destinatario (devoluciones, facturación, técnico), si el cliente aporta recibo y la urgencia, con latencias de milisegundos compatibles con un API gateway.
- Enrutamiento semántico de modelos en producción: decidir a qué modelo o proveedor derivar cada consulta según su dominio y complejidad, integrándose en el proyecto vLLM Semantic Router para el que se diseñó el modelo.
- Moderación y triaje de contenido: aplicar varias preguntas binarias simultáneas (¿es spam?, ¿contiene datos personales?, ¿requiere revisión humana?) sobre el mismo texto en un único forward pass.
- Extracción de decisiones estructuradas desde JSON: procesar payloads de formularios o eventos y devolver clasificaciones tipadas listas para consumir por un orquestador, sin post-procesar texto generado.
- Filtrado previo en pipelines RAG: decidir si una consulta requiere recuperación documental, si es de dominio interno y su prioridad, antes de invocar un LLM generativo, reduciendo coste y latencia.
- Clasificación por lotes de baja latencia: al no generar tokens, el coste por decisión es muy inferior al de un LLM; adecuado para etiquetar grandes volúmenes de registros con múltiples criterios por registro.
- Puerta de decisión en agentes: como «system one» que decide si el agente debe actuar, escalar o pedir aclaración, antes de la deliberación de un modelo mayor.

## Benchmarks y rendimiento

| Modelo | JevArena ↑ | Human-labelled transfer ↑ | Jev Decision Index ↑ |
|---|---:|---:|---:|
| **Decision-2.0-Eos-0.8B** | **53,9** | **50,3** | **20,1** |
| Intern-Decision-0.8B | 43,5 | 38,2 | — |
| Kev-0.8B | 43,2 | 39,0 | — |
| Decision 1.0 Eos | 42,5 | 46,1 | 18,4 |

Según la model card, todos los modelos responden a los mismos prompts congelados y se puntúan con el mismo criterio, contando como error las respuestas ausentes o inválidas. «Human-labelled transfer» es la macro-F1 mediana sobre 15 tareas etiquetadas por humanos (×100). El Jev Decision Index de Decision 2.0 es una reproducción independiente con el kit oficial 0.2.1 sobre los pesos publicados; el resto de valores proviene de una instantánea pública del tablero del 2026-09-28. No se publican resultados de benchmarks estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 0,75B parámetros en safetensors y repositorio de 2,0 GB, la inferencia en fp16/bf16 requiere del orden de 1,5-2 GB de VRAM más overhead de activaciones y código remoto.
- GPU recomendadas: no especificadas. La model card solo indica «una única GPU» para la medición de latencia de 6,0 ms por petición de una pregunta.
- Compatibilidad con GPU de consumo: por tamaño, cabe holgadamente en cualquier GPU de consumo moderna con al menos 4 GB de VRAM; no se confirma oficialmente.
- Opciones de despliegue: transformers (>=5.17) con `AutoModel` y `trust_remote_code=True`, o el pipeline `decision` de transformers. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: mediana de 6,0 ms por petición de una sola pregunta en una única GPU. El throughput no se publica.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | JevArena ↑ | Human-labelled transfer ↑ | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| **Decision-2.0-Eos-0.8B** | 0,75B | 16.384 | 53,9 | 50,3 | Apache-2.0 | Hugging Face |
| Intern-Decision-0.8B | ~0,8B | no disponible | 43,5 | 38,2 | no disponible | no disponible |
| Kev-0.8B | ~0,8B | no disponible | 43,2 | 39,0 | no disponible | no disponible |
| Decision 1.0 Eos | ~0,8B | no disponible | 42,5 | 46,1 | Apache-2.0 (modelo base) | Hugging Face |

Los tres modelos comparables son de tamaño similar y orientados a decisión/clasificación. No se dispone de datos de contexto, licencia ni disponibilidad de Intern-Decision-0.8B y Kev-0.8B más allá de los resultados de la tabla de evaluación de la model card.

## Limitaciones y advertencias

- Modelo especializado en decisión estructurada: no genera texto libre ni mantiene conversaciones; no debe emplearse como LLM generalista.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del autor del modelo; conviene auditar el código antes de desplegarlo en producción.
- No se documentan sesgos conocidos, pero al ser un clasificador de decisiones hereda los sesgos de sus datos de entrenamiento, cuya composición no se detalla.
- Riesgo de calibración deficiente en las probabilidades devueltas: no se publican métricas de calibración (ECE, Brier) en la información disponible.
- Idiomas soportados no documentados; el ejemplo de la model card está en inglés y no hay evidencia de rendimiento en castellano.
- Los benchmarks JevArena y Jev Decision Index son propios del ecosistema del autor, lo que limita la comparabilidad con evaluaciones estándar de la industria.
- La latencia de 6,0 ms corresponde a una petición de una sola pregunta en una GPU no especificada; el rendimiento con muchas preguntas o estados largos puede diferir.
- Licencia Apache-2.0 permite uso comercial, pero no se ofrece garantía ni soporte por parte del autor.
- Fecha de creación y actualización del repositorio (2026) posterior a la del conocimiento de referencia; verificar la vigencia de los artefactos antes de integrarlos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vllm-sr/Decision-2.0-Eos-0.8B
- Modelo base: https://huggingface.co/vllm-sr/Decision-1.0-Eos-0.8B
- Colección Decision 2.0: https://huggingface.co/collections/vllm-sr/decision-20-6ab7cf7bdfb506bf8269cb00
- Repositorio vLLM Semantic Router: https://github.com/vllm-project/semantic-router
- Licencia Apache-2.0: https://huggingface.co/vllm-sr/Decision-2.0-Eos-0.8B/blob/main/LICENSE
