# sthanika-ai/Sieve-9B

## Resumen

Sieve-9B es un adaptador LoRA de decisión desarrollado por Sthānika AI sobre el backbone de Qwen/Qwen3.5-9B. A diferencia de los modelos generativos convencionales, no produce texto: recibe un estado (texto libre o JSON) y una o varias preguntas tipadas, y devuelve una probabilidad calibrada para cada opción de cada pregunta. Está pensado como un componente de decisión determinista dentro de pipelines de clasificación, enrutamiento y evaluación de riesgo.

El modelo conserva únicamente la parte textual del backbone Qwen3.5-9B (32 capas y embeddings, 7,94B parámetros) y descarta la cabeza de generación, la capa de predicción multi-token y el codificador de visión (1,72B parámetros en total). Sobre esa base se añade un adaptador LoRA de rango 32 (promedio exacto de dos ejecuciones de rango 16 desde una misma inicialización) y una cabeza pointer de 2,1M parámetros que puntúa el final de cada opción contra el punto de decisión.

Su relevancia actual radica en el enfoque de calibración: el modelo se distribuye con una temperatura ajustada (T = 1,631, fijada por NLL) y declara métricas de calibración como ECE y Brier, algo poco habitual en adaptadores de clasificación. Soporta tres tipos de pregunta (`choice`, `noul` y `score`) con límites de 8.192 tokens para el estado y 8.192 tokens por pregunta con sus opciones, y requiere aproximadamente 20 GB de VRAM en bf16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-9B truncado) con cabeza pointer y adaptador LoRA |
| Parametros totales | 7,94B en el backbone textual + 2,1M en la cabeza pointer; adaptador LoRA de rango 32 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens para el estado y 8.192 tokens por pregunta con sus opciones |
| Tipos de cuantizacion | No disponible (solo se documenta bf16) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) + `head.pt` para la cabeza pointer |

## Arquitectura y entrenamiento

La arquitectura parte del Qwen3.5-9B post-entrenado (no el modelo base), del que se conservan 32 capas y los embeddings. Se eliminan la cabeza de lenguaje, la capa de predicción multi-token y el codificador de visión, sumando 1,72B parámetros descartados. Sobre el backbone se monta un adaptador LoRA de rango 32, resultado del promedio exacto de dos ejecuciones de rango 16 desde una misma inicialización, más una cabeza pointer de 2,1M parámetros que puntúa el final de cada opción contra el punto de decisión.

El entrenamiento incorpora 1.920 registros procedentes de 240 estructuras de reglas no presentes en el split decision-v7, además de estados rellenados con texto no relacionado para robustecer la lectura del estado. La temperatura de la cabeza (T = 1,631) se ajusta por verosimilitud negativa (NLL) y se almacena en `head.pt`. Cada pregunta se ejecuta como una fila independiente a partir de la caché del estado, de modo que las preguntas nunca se ven entre sí, lo que garantiza aislamiento entre decisiones del mismo lote.

## Capacidades

- Decisión tipada con tres modalidades: `choice` (entre 2 y 255 claves, con descripciones opcionales), `noul` (sí/no, devuelve P(yes)) y `score` (lista ordenada de 2 a 10 niveles, devuelve nivel esperado y probabilidad por nivel).
- Salida calibrada: probabilidad por opción, confianza agregada y clave o nivel más probable.
- Lectura de estado en texto libre o JSON, con una sola pasada sobre el estado y caché reutilizable entre preguntas.
- Aislamiento entre preguntas: cada pregunta se evalúa como fila independiente, sin contaminación cruzada.
- No genera texto en ningún caso; es un modelo de clasificación/decisión, no de generación.
- Sin soporte documentado de tool calling, function calling ni razonamiento multi-paso.
- Multilingüe: no disponible; solo se declara inglés.
- Sin capacidades de visión ni audio (el codificador de visión del backbone se elimina).

## Casos de uso

- Enrutamiento de tickets de soporte: dado un estado con asunto y cuerpo del ticket, se lanza una pregunta `choice` con las claves de departamento (facturación, técnico, etc.) y el modelo devuelve la clave más probable con su probabilidad, aprovechando los 8.192 tokens de estado para tickets largos con historial.
- Evaluación de riesgo de churn: con una pregunta `noul` sobre si el cliente amenaza con cancelar, se obtiene P(yes) calibrada que puede umbralizarse directamente en un CRM sin post-procesado adicional.
- Clasificación de sentimiento graduada: mediante una pregunta `score` con niveles ordenados (de muy negativo a muy positivo), el modelo devuelve el nivel esperado y la distribución completa, útil para paneles de reputación con reseñas de Yelp, Amazon o IMDb.
- Moderación y triaje de contenido: preguntas `noul` encadenadas sobre categorías de riesgo permiten filtrar grandes volúmenes de texto con latencia baja, ya que 2 opciones se resuelven en 18,6 ms con CUDA graphs.
- Etiquetado de datasets de clasificación: el modelo se ha evaluado sobre Banking77, BoolQ, AG News, MultiNLI, SST-5, Yelp Review Full, TREC, DBpedia-14, Amazon Reviews Multi e IMDb, por lo que encaja como anotador automático con confianza calibrada en esos dominios.
- Extracción de campos estructurados desde JSON: al aceptar estados en JSON y preguntas `choice` con claves descritas, puede usarse para decidir categorías de negocio a partir de payloads de API sin generar texto libre.
- Preguntas con muchas opciones: soporta hasta 255 opciones en una sola fila (330,5 ms para 255 opciones), adecuado para clasificación taxonómica amplia como DBpedia-14 ampliado o catálogos de productos.

## Benchmarks y rendimiento

Datos declarados por el autor (no verificados de forma independiente):

| Benchmark | Metrica | Valor |
|---|---|---|
| Decision Index 0.4.1 (leaderboard, tests privados) | Full score | 41,73 |
| Decision Index 0.4.1 (leaderboard) | Public score | 41,88 |
| Decision Index 0.2.1 (150.317 peticiones, 44 benchmarks; media del índice 38) | Decision Index corregido por azar | 41,71 |
| decision-v7 development (1.264 preguntas originales, in-domain) | Accuracy | 0,872 |
| decision-v7 development (in-domain) | ECE a la temperatura distribuida | 0,028 |
| transfer-v4 development (656 preguntas originales, out-of-domain) | Accuracy | 0,829 |
| transfer-v4 development (out-of-domain) | Brier a la temperatura distribuida | 0,242 |
| transfer-v9 development, strict (936 preguntas, out-of-domain más difícil) | Accuracy | 0,753 |

Rendimiento de servicio declarado: 18,6 ms para 2 opciones con CUDA graphs y 330,5 ms para 255 opciones en una sola fila. Memoria: unos 20 GB en bf16; 17,6 GiB medidos con un estado de 4.000 tokens.

## Requisitos de hardware

- VRAM estimada: aproximadamente 20 GB en bf16; 17,6 GiB medidos con un estado de 4.000 tokens.
- GPU recomendadas: A100 40/80 GB, H100, L40S o cualquier GPU con al menos 24 GB para bf16 con margen. Una RTX 4090 (24 GB) es el límite práctico para bf16.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 (24 GB) en bf16; en GPUs de 16 GB requeriría cuantización, no documentada por el autor.
- Despliegue: paquete `sieve` (`load_sieve`, `decide`) y servidor `sieve-serve --model sthanika-ai/Sieve-9B --graphs` con CUDA graphs. Requiere torch 2.8.0 según las versiones probadas.
- Latencia: 18,6 ms para 2 opciones con CUDA graphs; 330,5 ms para 255 opciones. Throughput agregado no disponible.
- Nota: el adaptador por sí solo no es un modelo de generación de texto; debe cargarse con la librería `sieve`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sieve-9B | 7,94B backbone + 2,1M cabeza | 8.192 estado / 8.192 pregunta | Decisión tipada calibrada, sin generación | Apache 2.0 | Hugging Face + GitHub |
| Qwen/Qwen3.5-9B | 9B (completo) | No disponible | Generación de texto multimodal | No disponible en la información | Hugging Face |
| Clasificadores tipo SetFit / encoders pequeños | 0,1B–0,5B típicamente | 512 tokens típicamente | Clasificación supervisada por tarea | Variable | Hugging Face |

La comparación con alternativas de la misma categoría (modelos de decisión calibrada con cabeza pointer) no está disponible en la información proporcionada. Frente a encoders pequeños de clasificación, Sieve-9B ofrece mayor ventana de contexto y calibración explícita, a costa de un requisito de VRAM mucho mayor.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al derivar de Qwen3.5-9B, puede heredar sesgos del corpus de entrenamiento del backbone.
- Riesgo de alucinación: bajo en el sentido generativo (no produce texto), pero las probabilidades pueden ser incorrectas en dominios alejados del entrenamiento; el accuracy out-of-domain estricto cae a 0,753.
- Idioma: solo se declara inglés; el rendimiento en castellano u otros idiomas no está evaluado.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-9B.
- El adaptador no es utilizable como modelo de generación; requiere la librería `sieve` y la cabeza pointer (`head.pt`).
- La temperatura calibrada (T = 1,631) está fijada en los pesos; modificarla invalida las métricas de calibración declaradas (ECE 0,028, Brier 0,242).
- Los resultados del Decision Index son declarados por el autor y no están verificados de forma independiente.
- No hay soporte documentado de tool calling, agentes ni razonamiento multi-paso.
- El requisito de ~20 GB de VRAM limita el despliegue en GPUs de consumo de gama media.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sthanika-ai/Sieve-9B
- Colección Sieve: https://huggingface.co/collections/sthanika-ai/sieve-6abb93a61dd495f69811c586
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio de código: https://github.com/sthanika-ai/Sieve
- Sitio de Sthānika AI: https://sthanika.ai/
- Sitio de Sieve: https://sieve.one/
