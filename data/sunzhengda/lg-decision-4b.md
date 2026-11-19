# SunZhengda/lg-decision-4B

## Resumen

lg-decision-4B es un modelo de lenguaje de aproximadamente 5.170 millones de parámetros (4B nominales) afinado a partir de Qwen/Qwen3.5-4B por el autor SunZhengda. No es un modelo generativo al uso: está especializado en tareas de decisión estructurada, es decir, recibe un estado (texto o JSON) junto con una o varias preguntas tipadas y devuelve distribuciones de probabilidad sobre opciones, respuestas sí/no o escalas ordenadas. Su propósito es sustituir la generación de texto libre por decisiones deterministas y puntuadas, lo que facilita su integración en pipelines de clasificación, enrutamiento y selección de herramientas.

El modelo se sirve mediante el servidor incluido `simple-jev`, que expone el endpoint `/v1/systemone` consumido por el kit Decision Index. La arquitectura subyacente es un transformer con 32 capas (8 de atención completa y 24 de atención lineal), heredada del modelo base Qwen3.5-4B. Su relevancia actual radica en que ofrece una interfaz tipada y probabilística para tareas de decisión, con capacidad de contexto de hasta 65.536 tokens por rama y licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

La ficha se basa exclusivamente en la model card publicada y en los metadatos de Hugging Face; los datos no presentes en esa información se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForConditionalGeneration`; transformer de texto con 32 capas (8 de atención completa, 24 de atención lineal) |
| Parametros totales | 5.174.964.736 (según safetensors) |
| Parametros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | 65.536 tokens por rama; las peticiones más largas se rechazan con HTTP 422, no se truncan |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | un único `model.safetensors` de 10.350.023.784 bytes en bf16 |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B y conserva su arquitectura `Qwen3_5ForConditionalGeneration`, un transformer de 32 capas en el que 8 capas usan atención completa y 24 usan atención lineal. Esta combinación reduce el coste computacional en contextos largos, lo que permite procesar ramas de hasta 65.536 tokens. Los pesos se distribuyen en un único fichero safetensors en precisión bf16, con un total de 5.174.964.736 parámetros.

El ajuste fino está orientado a tareas de decisión: cada pregunta se puntúa como una rama que comparte la totalidad de la petición como prefijo. El servidor incluido aplica una política de prompt fija (`PROMPT_POLICY=baseline`). No se detalla en la información disponible el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones adicionales como decodificación especulativa; el rasgo técnico distintivo es el esquema de puntuación por ramas con salida probabilística tipada (choice, noul, score).

## Capacidades

- Clasificación con opciones nombradas: devuelve una probabilidad por cada opción, la opción más probable (`choice`) y su confianza.
- Preguntas de sí/no (`noul`): devuelve la probabilidad de que la respuesta sea afirmativa.
- Puntuación en escalas ordenadas (`score`): devuelve una probabilidad por nivel, el nivel esperado y la probabilidad del nivel más probable, con un `legend` que mapea niveles a etiquetas.
- Selección de herramientas (tool selection) y enrutamiento dentro de flujos de automatización.
- Reranking de recuperación (retrieval reranking) y tareas de clasificación en general.
- Procesamiento de estado en texto o JSON como entrada de la petición.
- Soporte de múltiples preguntas tipadas en una misma petición, compartiendo prefijo.
- Capacidad de contexto largo: hasta 65.536 tokens por rama.
- No se documentan capacidades de generación de texto libre, visión, audio ni modo de razonamiento extendido (thinking mode); las modalidades declaradas son texto y JSON únicamente.

## Casos de uso

- Enrutamiento de tickets de soporte: con un estado en texto o JSON y una pregunta `choice` con opciones como "reemplazo", "reembolso" o "reparación", el modelo devuelve la acción más probable con su confianza, lo que permite automatizar la primera línea de triaje con umbrales de confianza configurables.
- Clasificación de documentos y correos: usar preguntas `choice` para asignar categorías nombradas y `score` para medir urgencia o criticidad en escalas ordenadas, aprovechando la salida probabilística para priorizar colas.
- Reranking en pipelines de recuperación: dado un estado con consulta y candidatos, el modelo puntúa la relevancia de cada opción, integrándose en sistemas RAG para reordenar resultados antes de la generación.
- Selección de herramientas en agentes: con una pregunta `choice` cuyas opciones son las herramientas disponibles, el modelo decide qué función invocar, lo que encaja en arquitecturas de agentes con tool calling estructurado.
- Moderación y verificación de contenido: preguntas `noul` (por ejemplo, "¿el texto contiene una amenaza?") permiten obtener probabilidades calibradas para decidir con umbrales auditables en lugar de texto generado.
- Evaluación automática de calidad: usar escalas `score` para puntuar respuestas, resúmenes o traducciones en niveles ordenados, con nivel esperado y confianza para agregar métricas.
- Decisión con contexto largo: al admitir ramas de hasta 65.536 tokens, puede clasificar contratos, expedientes o hilos de conversación extensos sin truncar, rechazando explícitamente las peticiones que excedan el límite.

## Benchmarks y rendimiento

Resultados de la ejecución propia del autor sobre la suite pública Decision Index 0.3 (no es un resultado de leaderboard):

| Metrica | Valor |
|---|---:|
| Indice publico | 78,56 |
| Balanced raw | 83,14 |
| Breadth | 78,07 |
| Peticiones | 140.620 (140.332 ok, 288 error) |
| Filas puntuadas | 140.178 (`complete: true`) |

| Area | Skill | Raw | Cobertura | Benchmarks |
|---|---:|---:|---:|---:|
| Knowledge & Reasoning | 0,6475 | 0,7130 | 1,0000 | 11 |
| Language Understanding | 0,8543 | 0,8947 | 1,0000 | 9 |
| Retrieval & Classification | 0,7966 | 0,8328 | 1,0000 | 6 |
| Tools & Automation | 0,8934 | 0,9046 | 0,9997 | 5 |
| Arts & Human Taste | 0,7455 | 0,8371 | 1,0000 | 6 |

Los 288 errores corresponden a rechazos HTTP 422 por ramas que superan los 65.536 tokens (284 en ToolRet, 4 en BRIGHT) y no se reintentaron.

Latencia medida en 1× NVIDIA H200 (muestra estratificada de 100 filas, servidor en caliente, un proceso):

| Ponderacion | Mediana | Media | p80 |
|---|---:|---:|---:|
| Ponderada por suite | 109 ms | 274 ms | 238 ms |
| Peso igual por dataset | 115 ms | – | 732 ms |

Estas cifras no se midieron en el hardware de referencia del Decision Index (RTX PRO 6000). No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el autor reporta un pico de 92.361 MiB en 1× NVIDIA H200 con `MAX_BATCH_SIZE=16`, medido sobre las 47 peticiones más largas de la suite pública. Con pesos bf16 (unos 10,35 GB) y lotes pequeños, el consumo es considerablemente menor, pero no se publican cifras exactas para otros lotes.
- GPU recomendadas: NVIDIA H200 (entorno probado, 143.771 MiB). No se documentan pruebas en A100, H100 ni RTX 4090.
- GPU de consumo: no disponible. El peso en bf16 (~10,35 GB) sugiere que podría caber en GPUs con 16-24 GB de VRAM, pero no hay confirmación del autor ni soporte documentado de cuantización.
- Despliegue: servidor propio `simple-jev` (`simple-jev/hf-server/hf_server.py`) basado en transformers; se arranca con `ENV_SERVER_PORT=30000 bash simple-jev/start_server.sh`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Dependencias exactas probadas: Python 3.12.13, PyTorch 2.10.0+cu129, transformers 5.20.2, accelerate 1.15.0, pydantic 2.12.3, fastapi 0.135.1, uvicorn 0.41.0, numpy 1.26.4.
- Latencia y throughput: mediana de 109 ms (ponderada por suite) y 274 ms de media en H200; no se publica throughput en tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lg-decision-4B | 5.174.964.736 | 65.536 tokens por rama | Decisiones tipadas (choice, noul, score) sobre Qwen3.5-4B | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-4B | no disponible en la información | no disponible | Modelo base generativo de texto | no disponible en la información | Hugging Face |
| Alternativas de clasificación de 4B | no disponible | no disponible | Clasificación estándar | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otros modelos de decisión o clasificación en la información proporcionada; la comparativa se limita al modelo base y a la categoría funcional.

## Limitaciones y advertencias

- Modalidades limitadas a texto y JSON; no admite imágenes, audio ni otras entradas.
- Las peticiones con ramas de más de 65.536 tokens se rechazan con HTTP 422 y no se truncan, lo que exige gestionar ese error en el cliente.
- El modelo está diseñado para decisiones estructuradas, no para generación de texto libre; usarlo fuera de ese esquema no está documentado.
- Los resultados de Decision Index 0.3 son una ejecución propia del autor con el scorer del kit, no un resultado de leaderboard; deben interpretarse con cautela.
- Las latencias se midieron en H200 y no en el hardware de referencia del Decision Index (RTX PRO 6000).
- No se documentan sesgos conocidos, tasas de alucinación ni comportamiento multilingüe; los idiomas soportados figuran como no disponibles.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base Qwen3.5-4B.
- El despliegue requiere versiones muy concretas de transformers (5.20.2) y accelerate (1.15.0); otras versiones pueden no ser compatibles.
- No hay evidencia publicada de cuantización ni de despliegue en GPUs de consumo, lo que limita la planificación de producción en entornos sin GPUs de centro de datos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SunZhengda/lg-decision-4B
- Dataset de resultados del Decision Index: https://huggingface.co/datasets/SunZhengda/lg-decision-4B-decision-index
- Kit Decision Index: https://github.com/apolinario/decision-index
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
