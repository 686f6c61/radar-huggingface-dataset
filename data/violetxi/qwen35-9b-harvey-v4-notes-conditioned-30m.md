# violetxi/qwen35-9b-harvey-v4-notes-conditioned-30m

## Resumen

`violetxi/qwen35-9b-harvey-v4-notes-conditioned-30m` es un ajuste fino completo (full fine-tune) del modelo multimodal Qwen/Qwen3.5-9B, publicado por el usuario violetxi dentro de la línea experimental "Harvey" o "Calderwood & Harkness". El checkpoint servible corresponde a la revision `checkpoint-1836`, resultado de 2 epocas y 1.836 actualizaciones del optimizador sobre una mezcla supervisada de 29.998.913 tokens (70 % etiquetas de "notas" y 30 % etiquetas de asistente procedentes de trayectorias condicionadas por notas), sin regularizacion KL.

El modelo no persigue un uso generalista, sino un objetivo de internalizacion de conocimiento: que los pesos del modelo absorban un corpus sintetico de dominio (un bufete de abogados ficticio) en lugar de depender de recuperacion externa en tiempo de inferencia. La evaluacion publicada se centra en tareas de agente con protocolo `glob`/`grep`/`read`, por lo que su perfil de uso es claramente el de investigacion sobre internalizacion de mundo y agentes multi-paso, no el de un asistente comercial listo para produccion.

Con 9.653.104.368 parametros reales en safetensors y un repositorio de 38,6 GB, es un modelo denso de ~9,6B en el rango que cabe en GPU de consumo con cuantizacion. La relevancia actual es doble: sirve como referencia reproducible de una familia de experimentos comparables (variantes `kl-0p01`, `kl-0p1`, adaptadores LoRA de la misma onda) y documenta un caso poco habitual de evaluacion con rubrica por criterio y trazabilidad completa de artefactos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal de la familia Qwen3.5, layout compuesto `Qwen3_5ForConditionalGeneration` (el modelo base se distribuye como modelo de imagen-texto a texto) |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no aplica (no se documenta una arquitectura MoE; el autor lo describe como "full-model") |
| Longitud de contexto | no disponible en la informacion proporcionada; el entrenamiento uso secuencias empaquetadas de 16.384 tokens |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors (no hay GGUF ni cuantizaciones precalculadas) |
| Idiomas soportados | en (segun la model card y los tags); el modelo base Qwen3.5-9B es multilingue, pero no se documenta el alcance multilingue tras el ajuste |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (4 shards compuestos, 775 tensores) |
| Modelo base | Qwen/Qwen3.5-9B, revision `c202236235762e1c871ad0ccb60c8ee5ba337b9a` |
| Tamano del repositorio | 38,6 GB |
| Libreria | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un transformer multimodal con capacidad de razonamiento visual, OCR y generacion de contexto largo, y se reexporta en el layout compuesto de la familia (`Qwen3_5ForConditionalGeneration`) para conservar la capacidad de carga mediante `AutoModelForImageTextToText`. La verificacion de exportacion del autor confirma que los 4 shards safetensors contienen 775 tensores: 427 tensores de texto entrenados, comprobados contra el checkpoint guardado convertido al dtype de servicio fijado, y 348 tensores auxiliares del modelo base preservados intactos. Todos los valores tensoriales son finitos y el export final reproduce los pesos de servicio usados en las generaciones historicas de evaluacion.

El entrenamiento es un ajuste fino supervisado con dos flujos de perdida diferenciados: las "notas" se entrenan con prediccion causal de siguiente token y la perdida de trayectoria se aplica a las etiquetas de asistente. El dataset supervisado contiene 29.998.913 tokens antes del desplazamiento causal (20.999.726 etiquetas de nota y 8.999.187 etiquetas de asistente) y 29.997.214 por epoca tras el desplazamiento, con una mezcla 70/30 entre ambos tipos. La configuracion es: longitud de secuencia empaquetada 16.384, batch global de 4 filas empaquetadas, acumulacion de gradiente 2, tasa de aprendizaje 5e-06 y un total de 2 epocas / 1.836 actualizaciones. La exposicion acumulada de tokens en este checkpoint es de 59.994.428. No se aplico regularizacion KL en esta variante (existen revisiones hermanas con KL 0,01 y 0,1), lo que la convierte en el punto de maxima deriva respecto al modelo base dentro de la serie.

## Capacidades

- Generacion de texto conversacional en ingles, con soporte explicito del pipeline `text-generation` y de la clase conversacional.
- Modo "thinking": las generaciones de agente evaluadas se describen como habilitadas para razonamiento extendido.
- Uso de herramientas de exploracion de ficheros en bucle agente: el protocolo evaluado emplea `glob`, `grep` y `read` a lo largo de presupuestos de 5 y 20 turnos.
- Razonamiento multi-paso orientado a tareas con rubrica de multiples criterios, donde se exige cumplir todos los criterios simultaneamente.
- Internalizacion de conocimiento de dominio: el objetivo del ajuste es que el corpus sintetico quede absorbido en los pesos, evaluado con 7.933 sondas de recuerdo a libro cerrado.
- Capacidades multimodales heredadas del modelo base (imagen-texto a texto) segun el layout de pesos y la clase de carga; no se documenta ninguna evaluacion multimodal de este ajuste concreto.
- No se documenta soporte de function calling con esquema estructurado ni capacidades de audio en la informacion disponible.

## Casos de uso

- Investigacion sobre internalizacion de conocimiento: comparar esta revision (sin KL) con las variantes `kl-0p01` y `kl-0p1` de la misma familia para medir cuanto conocimiento de dominio se absorbe en pesos y cuanto se degrada el comportamiento base.
- Banco de pruebas de agentes con herramientas: reproducir el protocolo `glob`/`grep`/`read` a 5 y 20 turnos para estudiar como escala la tasa de exito con el presupuesto de turnos (5,50 % frente a 7,00 % en la rubrica Harvey).
- Evaluacion de metodos de jueces automaticos: el pipeline de regraduacion con `gpt-5.6-sol` y rubrica por criterio sirve como caso de estudio para medir la sensibilidad de los jueces LLM frente a generaciones historicas.
- Auditoria de artefactos de publicacion: la verificacion de 775 tensores, hashes remotos y manifiestos SHA-256 es un ejemplo reutilizable para equipos que necesitan garantizar que un checkpoint publicado coincide con el que se evaluo.
- Sondas de recuerdo a libro cerrado: las 7.933 sondas sin juez GPT, con puntuacion determinista, son utiles como test de memorizacion frente a generalizacion en modelos ajustados sobre corpus sinteticos pequenos.
- Estudio de ajuste fino completo en 9B con presupuesto minimo: 30M de tokens supervisados y 1.836 actualizaciones constituyen una referencia de bajo coste para comparar contra LoRA y otras tecnicas de adaptacion eficiente (la propia familia incluye adaptadores PEFT).
- Servicio de inferencia experimental en ingles: con licencia apache-2.0 y pesos safetensors puede desplegarse en infraestructura propia para pruebas internas de generacion de texto, siempre que se asuma el bajo rendimiento medido en tareas de agente.

## Benchmarks y rendimiento

Los unicos datos publicados son de la evaluacion Harvey, regraduada con `gpt-5.6-sol` sobre la rubrica original por criterio. La metrica es la fraccion de intentos que superan **todos** los criterios, sobre 250 tareas con 4 muestras cada una (thinking habilitado).

| Evaluacion | Presupuesto de turnos | Tasa de exito (todos los criterios) |
|---|---|---|
| Harvey, rubrica por criterio, 250 tareas x 4 muestras | 5 | 5,50 % |
| Harvey, rubrica por criterio, 250 tareas x 4 muestras | 20 | 7,00 % |
| Sondas de recuerdo a libro cerrado (7.933 sondas, puntuacion determinista) | no aplica | metrica agregada no disponible en la informacion proporcionada |

No se ejecuto inferencia de benchmarks nueva para esta publicacion: las generaciones son historicas y se regraduaron a posteriori. No hay resultados de MMLU, HumanEval, GSM8K ni de ninguna otra suite estandar en la informacion disponible. La procedencia completa y las incertidumbres se remiten al fichero `evaluation_summary.json` del repositorio.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: en torno a 19-20 GB solo para pesos (9,653 mil millones de parametros), mas activaciones y cache KV, lo que en la practica exige 24 GB o mas para secuencias largas. El repositorio ocupa 38,6 GB, un indicio de que los ficheros publicados no estan en un unico formato de 16 bits.
- VRAM estimada cuantizado: alrededor de 10-11 GB en 8 bits y 6-7 GB en 4 bits, aunque el autor no publica cuantizaciones, por lo que habria que generarlas con herramientas de terceros.
- GPU recomendadas: A100 40/80 GB, H100 o L40S para servicio concurrente; RTX 4090 (24 GB) y RTX 3090 (24 GB) para inferencia en bf16 con secuencias moderadas.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB (RTX 3090, 4090) en bf16 con batch pequeno, y en tarjetas de 12-16 GB si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: `transformers` con `AutoModelForImageTextToText` y `device_map="auto"` es la via documentada por el autor. El modelo hermano de la misma familia se describe como servible directamente con vLLM, lo que sugiere compatibilidad con ese motor, pero no se confirma para esta revision. No se documentan integraciones con Ollama, llama.cpp o TGI, ni ficheros GGUF.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Resultado Harvey | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen35-9b-harvey-v4-notes-conditioned-30m | 9,65 B | no disponible (entrenado a 16.384) | 5,50 % a 5 turnos / 7,00 % a 20 turnos | apache-2.0 | safetensors en HuggingFace, 8 descargas |
| qwen35-9b-harvey-v4-notes-conditioned-30m-kl-0p01 | no disponible (mismo base) | no disponible | no disponible | no disponible | HuggingFace |
| qwen35-9b-harvey-v4-notes-conditioned-30m-kl-0p1 | no disponible (mismo base) | no disponible | no disponible | no disponible | HuggingFace y endpoint en FriendliAI |
| qwen35-9b-wmrl-v4-n-1m-hi | 9 B (student) | no disponible | no disponible | no disponible | HuggingFace, descrito como servible con vLLM |
| qwen35-9b-wmrl-v4-b5-30m | adaptador LoRA sobre Qwen3.5-9B (alpha/r = 1.0 sobre base bf16 congelado) | no disponible | no disponible | no disponible | HuggingFace y endpoint en FriendliAI |
| Qwen/Qwen3.5-9B (base) | ~9 B | no disponible (descrito como contexto largo) | no aplica | apache-2.0 | HuggingFace, Microsoft Foundry |

No se dispone de resultados de benchmarks comparativos entre estas variantes en la informacion proporcionada, por lo que la comparacion se limita a linaje, licencia y formato de publicacion.

## Limitaciones y advertencias

- Rendimiento medido muy bajo en la tarea objetivo: entre el 5,50 % y el 7,00 % de intentos que superan todos los criterios de la rubrica Harvey. No es adecuado como modelo de produccion para tareas de agente sin un ajuste adicional.
- Idioma: la model card declara unicamente ingles (`en`). No hay evidencia de comportamiento fiable en castellano ni en otros idiomas tras el ajuste.
- Sesgos de dominio: el corpus de entrenamiento es un bufete de abogados sintetico ("Calderwood & Harkness"). Es esperable un sesgo hacia ese registro, su terminologia y sus convenciones, con posible degradacion en dominios ajenos.
- Riesgo de alucinacion: el objetivo experimental de internalizar conocimiento en pesos, sin recuperacion externa, favorece la generacion de contenido plausible pero no verificado, especialmente en preguntas de dominio.
- Riesgo de olvido catastrofico: al ser un ajuste fino completo sin regularizacion KL en esta variante, la deriva respecto a Qwen3.5-9B puede ser mayor que en las variantes con KL; conviene comparar contra `kl-0p01` y `kl-0p1` antes de reutilizarlo.
- Evaluacion limitada: un unico conjunto de tareas (Harvey), regraduado a posteriori con `gpt-5.6-sol` y sin inferencia nueva. No hay MMLU, HumanEval, GSM8K ni evaluaciones multimodales, pese a que el modelo base es multimodal.
- Adopcion practica minima: 8 descargas y 0 "likes" en el momento de la consulta; no hay senales de validacion por parte de la comunidad.
- Licencia: apache-2.0 permite uso comercial, pero conviene verificar tambien los terminos aplicables al modelo base Qwen3.5-9B y a los datos sinteticos empleados.
- No se publican cuantizaciones ni ficheros GGUF; cualquier despliegue ligero requiere generar los pesos cuantizados por cuenta propia y validar que no se degrada el comportamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/violetxi/qwen35-9b-harvey-v4-notes-conditioned-30m
- Artefactos de evaluacion (README con revisiones y manifiestos SHA-256): https://huggingface.co/violetxi/qwen35-9b-harvey-v4-notes-conditioned-30m/blob/main/evals/harvey-20260923/README.md
- Dataset de evaluacion Harvey, 5 turnos (historical-5t-think): https://huggingface.co/datasets/violetxi/harvey-eval-gpt56sol-qwen35-9b-notes70-notecondtraj30-30m-historical-5t-think
- Dataset de evaluacion Harvey, 20 turnos (historical-20t-think): https://huggingface.co/datasets/violetxi/harvey-eval-gpt56sol-qwen35-9b-notes70-notecondtraj30-30m-historical-20t-think
- Dataset de sondas de recuerdo a libro cerrado (7.933 sondas): https://huggingface.co/datasets/violetxi/harvey-eval-recall-qwen35-9b-notes70-notecondtraj30-30m-think
- Variante con regularizacion KL 0,01: https://huggingface.co/violetxi/qwen35-9b-harvey-v4-notes-conditioned-30m-kl-0p01
- Variante con regularizacion KL 0,1 (tambien en FriendliAI): https://huggingface.co/violetxi/qwen35-9b-harvey-v4-notes-conditioned-30m-kl-0p1
- Pagina de la variante KL 0,1 en FriendliAI: https://friendli.ai/models/violetxi/qwen35-9b-harvey-v4-notes-conditioned-30m-kl-0p1
- Modelo hermano de la onda world-internalization v4 (n-1m-hi): https://huggingface.co/violetxi/qwen35-9b-wmrl-v4-n-1m-hi
- Adaptador LoRA b5-30m de la misma onda (FriendliAI): https://friendli.ai/models/violetxi/qwen35-9b-wmrl-v4-b5-30m
- Modelo base Qwen3.5-9B en el catalogo de Microsoft Foundry: https://ai.azure.com/catalog/models/qwen--qwen3.5-9b?publisher=hugging+face
