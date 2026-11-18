# upfall-co/voidx-decider-12b

## Resumen

voidx-decider-12b es un adaptador LoRA publicado por upfall-co sobre el modelo base google/gemma-4-12B-it (revision `707f0a3b`). No es un modelo de generacion libre de texto: está diseñado específicamente para responder preguntas de decisión de opción múltiple (clasificación, ubicación en ontologías y juicio de estado) leyendo la probabilidad de cada token de etiqueta (`A`, `B`, `C`, ...) en la posición de respuesta, en lugar de generar texto. Está pensado para producir probabilidades calibradas (ECE 0.028 en validación y en el test bloqueado) y admite entradas en inglés y coreano.

El adaptador se entrenó con LoRA (r=32, alpha=64, dropout 0.05 sobre todas las proyecciones de atención y MLP) durante 1 época (97 pasos) con unos 14.500 registros de datos públicos y seguimiento de estado generado por reglas, en una única H100 de 80 GB durante aproximadamente 90 minutos. El autor lo publica como *research release*: el modelo no superó su puerta de validación pre-registrada (G6) y es muy vulnerable a inyección de prompts, por lo que no está recomendado para producción sin mitigaciones.

Su relevancia actual es doble: por un lado, explora un patrón de uso de LLM como clasificador calibrado (logprobs de etiquetas en vez de generación), y por otro documenta de forma transparente un caso de fallo parcial (mejora fuerte en colocación Wikidata con raíces no vistas, pero degradación de 12,8 puntos en IPTC), lo que lo convierte en un artefacto útil para investigación sobre evaluación y calibración más que para despliegue directo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer decoder (base google/gemma-4-12B-it); no se detalla la arquitectura interna del base en la información disponible |
| Parametros totales | 12B en el modelo base; el adaptador LoRA no reporta recuento propio (repo de 0,5 GB) |
| Parametros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (versión fusionada publicada en voidx-decider-12b-GGUF); bf16 para el adaptador PEFT |
| Idiomas soportados | inglés (en) y coreano (ko) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); GGUF Q4_K_M en repo separado |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (r=32, alpha=64, dropout 0.05) aplicado a todas las proyecciones de atención y MLP del modelo base google/gemma-4-12B-it. El entrenamiento usó aproximadamente 14.500 filas: datos públicos (NSMC, MASSIVE, Banking77, CLINC OOS, LexGLUE, HelpSteer2, Measuring Hate Speech, GoEmotions, Civil Comments, StrategyQA) más seguimiento de estado generado por reglas. Se realizó 1 época (97 pasos) con learning rate 5e-5 y scheduler coseno en 1× H100 80GB (~90 minutos). No se usaron salidas de modelos profesor ni de APIs comerciales.

La innovación principal no está en la arquitectura sino en el modo de inferencia: en lugar de generar texto, se aplica la plantilla de chat de Gemma 4 con *thinking* desactivado y sin system prompt, se añade `Answer: (` al turno del asistente y se leen las probabilidades del siguiente token para las etiquetas `A`, `B`, `C`, ... renormalizando sobre las opciones mostradas. Para el servicio se divide los logits de etiqueta por T = 0.98580 antes del softmax (`serving_temperature.json`). El formato de prompt y la tabla de etiquetas siguen el proyecto Mapika/decider (Apache-2.0).

## Capacidades

- Clasificación de texto de opción múltiple con probabilidades calibradas (ECE 0.028 en validación y test bloqueado; 0.034 en Q4_K_M).
- Colocación en ontologías: categorización IPTC y ubicación en jerarquías Wikidata con raíces no vistas en entrenamiento.
- Juicio de estado (*state tracking*) en dominios no vistos.
- Respuesta a preguntas de decisión con contexto explícito y conjunto de opciones acotado.
- Soporte bilingüe inglés-coreano, incluidos pares paralelos en–ko.
- No genera texto libre: la salida es una distribución de probabilidad sobre las etiquetas proporcionadas.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo *thinking* activo (de hecho, el uso requiere desactivar el pensamiento del base).

## Casos de uso

- Moderación de contenido con umbral calibrado: el modelo devuelve probabilidades por etiqueta sobre textos de Civil Comments o Measuring Hate Speech, lo que permite fijar umbrales de decisión y estimar tasas de error en lugar de depender de una generación binaria.
- Enrutamiento de tickets de soporte: clasificación de intenciones (estilo Banking77/CLINC OOS) con probabilidad asociada, útil para derivar a colas o a revisión humana cuando la confianza es baja.
- Etiquetado de noticias en taxonomías editoriales: colocación en IPTC o Wikidata, con la advertencia de que el rendimiento en IPTC cae 12,8 puntos frente al base y sobrecoloca elementos "ninguna de estas" (41,8% frente a 8,4%).
- Análisis de sentimiento y emociones en coreano e inglés: clasificación sobre NSMC y GoEmotions con salida probabilística renormalizada sobre las opciones mostradas.
- Seguimiento de estado en diálogos o flujos: el modelo mejora 15,3 puntos sobre el base en dominios no vistos (62,3% frente a 47,0%), adecuado para experimentos de *state tracking* con opciones predefinidas.
- Investigación sobre calibración y evaluación de LLM: al publicar ECE, NLL suave y resultados en test bloqueado con criterios pre-registrados, sirve como caso de estudio reproducible de un adaptador que mejora en unas particiones y empeora en otras.
- Clasificación bilingüe en–ko con pares paralelos: útil para estudiar consistencia entre idiomas, aunque en esta partición el adaptador no mejora al base (83,3% frente a 83,5%).

## Benchmarks y rendimiento

Evaluación 1: test bloqueado de 3.050 filas, one-shot, criterios registrados antes de la ejecución (bf16).

| Pool | Filas | Tuned | Base | Diferencia |
|---|---|---|---|---|
| Total | 3.050 | 79,3% | 75,9% | +3,4 pt |
| Inglés holdout | 1.100 | 76,6% | 70,0% | +6,6 |
| Coreano | 300 | 93,0% | 91,7% | +1,3 |
| Paralelo en–ko | 400 | 83,3% | 83,5% | −0,3 |
| Ontología: IPTC | 600 | 78,5% | 91,3% | −12,8 |
| Ontología: Wikidata raíces no vistas | 350 | 86,9% | 69,7% | +17,1 |
| Seguimiento de estado, dominios no vistos | 300 | 62,3% | 47,0% | +15,3 |

Validación (1.300 filas): accuracy 0,822, NLL suave 0,503, ECE 0,028.

Evaluación 2: comparación descriptiva con 3.023 preguntas y mismas instrucciones de formato de chat (el conjunto G6 ya se había usado una vez).

| Modelo | Acc. | Inglés | Coreano | IPTC | Wikidata no vistas | Estado dominio no visto | Sobrecolocación IPTC "none" | Caída por inyección |
|---|---|---|---|---|---|---|---|---|
| Gemini 3.8 Flash (track razonamiento) | 84,3% | 73,4 | 92,7 | 93,3 | 77,7 | 100 | 3% | 0 pt |
| voidx-decider-12b | 78,1% | 75,3 | 88,3 | 81,7 | 85,4 | 55,3 | 33% | −54 pt |
| Gemma 4 31B | 75,9% | 67,5 | 90,3 | 92,5 | 68,3 | 56,7 | 3% | −30 pt |
| GPT-5.6 terra | 75,6% | 63,2 | 90,3 | 93,5 | 74,9 | 61,3 | 3% | −18 pt |
| Gemma 4 26B-A4B | 74,7% | 66,8 | 88,0 | 93,5 | 70,6 | 46,0 | 5% | −48 pt |
| Gemma 4 12B base (antes de entrenar) | 73,0% | 68,2 | 88,7 | 90,2 | 69,1 | 32,3 | 10% | −49 pt |
| Qwen3.5-9B | 70,0% | 60,3 | 81,3 | 89,8 | 71,1 | 46,0 | 5% | −44 pt |
| Qwen3-14B | 65,8% | 55,1 | 75,3 | 85,8 | 60,0 | 45,7 | 8% | −40 pt |
| Ministral 14B | 65,8% | 52,8 | 81,3 | 82,0 | 70,9 | 46,3 | 25% | −30 pt |
| Llama 3.1 8B | 52,7% | 46,6 | 65,0 | 67,8 | 45,1 | 38,3 | 42% | −45 pt |

Notas de la comparación: todos los modelos usaron las mismas instrucciones y preguntas (orden de opciones fijo, 27 filas con empate en el gold excluidas); voidx-decider-12b y el base se re-midieron como Q4_K_M con formato de chat; Gemini no puede desactivar el razonamiento y corrió con hasta 1.024 tokens de salida; los endpoints de GPT y Gemini no aceptan temperatura; Llama 3.1 8B, Qwen3-14B, Ministral y los modelos comerciales se puntuaron solo sobre su respuesta textual (sin logprobs); el ECE solo está disponible para 5 modelos con logprobs en 161 filas comunes, por lo que no se ordena. El autor indica que una fila de Claude Sonnet 5.5 está en curso.

## Requisitos de hardware

- Inferencia en bf16 con PEFT: el modelo base es de 12B parámetros, por lo que se necesita aproximadamente 24 GB de VRAM solo para pesos en bf16, más overhead de activaciones y caché KV; en la práctica, 40–48 GB de VRAM para ejecución cómoda.
- GGUF Q4_K_M: el repo fusionado ocupa del orden de varios GB (el adaptador solo pesa 0,5 GB); una cuantización Q4_K_M de un 12B suele caber en GPUs de consumo con 8–12 GB de VRAM, aunque el autor no publica cifras exactas de tamaño ni de VRAM.
- GPU recomendadas: H100 80GB fue la usada para entrenamiento; para inferencia, A100 40/80GB o H100 para bf16, y RTX 4090 (24 GB) o inferiores para Q4_K_M.
- Cabe en GPU de consumo: sí, en formato GGUF Q4_K_M, aunque no se documentan requisitos mínimos exactos.
- Opciones de despliegue: PEFT + transformers (bf16), llama.cpp / llama-server (GGUF, con `n_probs` en `/completion` o `chat_template_kwargs: {"enable_thinking": false}` en el endpoint de chat), y potencialmente vLLM o TGI para el adaptador, aunque no se documentan explícitamente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Acc. (eval. 2) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| voidx-decider-12b | 12B (LoRA) | no disponible | 78,1% | Apache-2.0 | Hugging Face (adaptador + GGUF) |
| Gemma 4 12B base | 12B | no disponible | 73,0% | según modelo base (no indicada) | Hugging Face |
| Qwen3-14B | 14B | no disponible | 65,8% | no disponible en la información | Hugging Face |
| Ministral 14B | 14B | no disponible | 65,8% | no disponible en la información | Hugging Face |
| Llama 3.1 8B | 8B | no disponible | 52,7% | no disponible en la información | Hugging Face |

La comparación es descriptiva y no equivalente: los modelos comerciales y algunos abiertos se puntuaron solo sobre texto, mientras que voidx-decider-12b y el base usaron logprobs de etiqueta. En la partición de colocación Wikidata con raíces no vistas, voidx-decider-12b (85,4) supera a todos los comparadores listados, incluido Gemini 3.8 Flash (77,7); en IPTC, en cambio, queda por debajo de casi todos (81,7 frente a 90,2 del base y 93,3 de Gemini).

## Limitaciones y advertencias

- Estado de *research release*: el modelo no superó la puerta de validación pre-registrada G6; el autor lo desaconseja para uso en producción sin leer antes las secciones de evaluación y limitaciones.
- Vulnerabilidad fuerte a inyección de prompts: la comparación reporta una caída de 54 puntos porcentuales bajo inyección, la mayor de la tabla (Gemma 4 31B cae 30 pt, GPT-5.6 terra 18 pt).
- Degradación en IPTC: −12,8 puntos frente al base, con sobrecolocación de elementos "ninguna de estas" en categorías (41,8% frente a 8,4% del base).
- Sin mejora en pares paralelos en–ko (−0,3 pt) y mejora marginal en coreano (+1,3 pt), pese a ser uno de los idiomas anunciados.
- No es un modelo generativo: solo responde a preguntas de opción múltiple con etiquetas mostradas; no sirve para generación libre, tool calling ni agentes.
- Riesgo de alucinación no evaluado explícitamente en la información disponible; el modo de lectura de logprobs reduce la generación libre pero no elimina errores de clasificación.
- Sesgos: entrenado con datasets de moderación y emoción (Measuring Hate Speech, Civil Comments, GoEmotions); no se documenta análisis de sesgos en la información proporcionada.
- Restricciones de licencia: el adaptador es Apache-2.0, pero el uso comercial depende también de la licencia del modelo base google/gemma-4-12B-it, que no se detalla en la información disponible.
- El conjunto de evaluación G6 ya se usó una vez en la comparación con otros modelos, por lo que las cifras de la evaluación 2 son descriptivas y no un test limpio.
- El ECE solo está calculado sobre 161 filas comunes en 5 modelos, por lo que la calibración comparada no es concluyente.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/upfall-co/voidx-decider-12b
- GGUF Q4_K_M fusionado: https://huggingface.co/upfall-co/voidx-decider-12b-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Proyecto Mapika/decider (formato de prompt y tabla de etiquetas): https://github.com/Mapika/decider
