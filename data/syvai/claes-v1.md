# syvai/claes-v1

## Resumen

Claes v1 es un modelo de decisión multilingüe desarrollado por syvai, obtenido mediante fine-tuning de OmniJev/OneJev1.6-0.8B. A diferencia de un modelo generativo convencional, Claes v1 no produce texto libre: recibe un estado (state) y un conjunto de preguntas tipadas, y devuelve probabilidades sobre opciones, una probabilidad de sí/no o una puntuación ordinal esperada. Está pensado, por tanto, como un componente de inferencia estructurada dentro de pipelines de decisión, no como un asistente conversacional.

El modelo se distribuye con licencia Apache 2.0, en formato safetensors y con la librería transformers, con un total de 1.107.265.600 parámetros (aproximadamente 1,1 mil millones) y un tamaño de repositorio de 2,9 GB. Cubre 31 códigos de idioma, en su mayoría europeos, y se sirve mediante la herramienta Flide del ecosistema OmniJev a través de una API System One.

Su relevancia actual radica en la evaluación publicada sobre EuroEval: en 11 conjuntos de datos daneses de test, Claes v1 alcanza un MCC medio no ponderado del 18,68 % (IC 95 %: 17,96-19,39 %), frente al 15,39 % del OneJev original y el 9,39 % de Claes preview. No obstante, en la suite pública local Decision Index 0.3 su puntuación queda 11,22 puntos por debajo del modelo base sin modificar, lo que delimita con claridad su ámbito de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.5 según tag `qwen3_5`; arquitectura interna no detallada) |
| Parametros totales | 1.107.265.600 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 GGUF (usado en las evaluaciones); otros tipos no disponibles |
| Idiomas soportados | 31 códigos: sq, be, bs, bg, ca, hr, cs, da, nl, en, et, fo, fi, fr, de, el, hu, is, it, lv, lt, lb, no, pl, pt, ro, sr, sk, sl, es, sv, uk |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 2,9 GB) |

## Arquitectura y entrenamiento

Claes v1 es un fine-tuning del checkpoint OmniJev/OneJev1.6-0.8B (revisión `c89933c277629b707895bff752c61d2b0664c85e`), un modelo de aproximadamente 1,1 mil millones de parámetros etiquetado con `qwen3_5` en Hugging Face. La model card no detalla la arquitectura interna del transformer ni la composición del dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas de RLHF o DPO; esa información no está disponible en la documentación publicada.

La innovación principal no reside en el preentrenamiento sino en la interfaz de salida: el modelo está entrenado para emitir decisiones tipadas (preguntas de tipo `noul` para probabilidad de sí, `choice` para distribuciones sobre opciones suministradas y `score` para niveles ordinales esperados). El despliegue se realiza con Flide, que expone un endpoint `/v1/systemone` compatible con este esquema. El repositorio contiene únicamente los archivos de inferencia y la model card, no los registros de entrenamiento ni las preguntas de ejemplo. Los pesos publicados tienen SHA-256 `884b4e979c2585fad9a8149d92d710b8656117f7ce8547be6c249bdfea092f99`.

## Capacidades

- Clasificación y decisión estructurada: devuelve probabilidades sobre opciones, probabilidad de sí/no y puntuación ordinal esperada a partir de un estado y preguntas tipadas.
- Soporte multilingüe declarado en 31 códigos de idioma, con evaluación publicada en 35 códigos de idioma mediante 139 conjuntos de datos de EuroEval.
- Evaluación zero-shot sobre conjuntos de clasificación compatibles con modelos de decisión tipada.
- Integración mediante API HTTP local a través de Flide (`/v1/systemone`).
- No genera texto libre.
- El modelo está etiquetado como `image-text-to-text`, pero la model card indica explícitamente que el checkpoint se entrenó y evaluó con texto y que el rendimiento con imagen y vídeo no se evaluó.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Enrutamiento de consultas en atención al cliente: dado el texto de un ticket como estado, formular preguntas tipadas (por ejemplo, "¿es una reclamación de facturación?") y usar la probabilidad devuelta para decidir la cola o el equipo de destino, sin necesidad de generar texto.
- Moderación y filtrado de contenido: evaluar un texto con preguntas de sí/no sobre categorías de riesgo y aplicar umbrales sobre la probabilidad resultante para bloquear o escalar.
- Triaje documental multilingüe: procesar documentos en cualquiera de los 31 idiomas cubiertos y clasificarlos con preguntas de tipo `choice` sobre categorías predefinidas, aprovechando la cobertura europea del modelo.
- Puntuación ordinal en encuestas: usar preguntas de tipo `score` para estimar el nivel esperado de satisfacción o urgencia a partir de respuestas abiertas, obteniendo una magnitud comparable en lugar de una etiqueta discreta.
- Componente de decisión en pipelines de agentes: sustituir llamadas a un LLM generativo por Claes v1 en los pasos donde solo se necesita una decisión binaria o una distribución sobre opciones, reduciendo coste y latencia al no generar texto.
- Evaluación de modelos sobre EuroEval: servir el checkpoint con Flide y replicar la metodología de la model card (10 iteraciones con `--evaluate-test-split`) para comparar el rendimiento en clasificación multilingüe frente al modelo base.
- Señal auxiliar en sistemas de recomendación o ranking: obtener una probabilidad de sí/no sobre criterios concretos ("¿es relevante para el usuario?") y combinarla con otras señales en un ranking.

## Benchmarks y rendimiento

Resultados publicados en la model card. El MCC de test de EuroEval se mide sobre la partición de test; el Decision Index 0.3 es una puntuación de la suite pública local, no de la suite privada completa.

| Evaluación | Claes v1 | OneJev original | Claes preview |
|---|---|---|---|
| EuroEval danés, 11 conjuntos (MCC medio no ponderado) | 18,68 % (IC 95 %: 17,96-19,39 %) | 15,39 % | 9,39 % |
| EuroEval inglés, 8 conjuntos (MCC medio) | 28,37 % | 32,93 % | 6,74 % |
| Decision Index 0.3 público local | 11,22 puntos por debajo del OneJev base | referencia | no disponible |

En la comparación danesa, Claes v1 obtiene el MCC de test más alto en 6 de los 11 conjuntos. La evaluación multilingüe cubre 139 conjuntos en 35 códigos de idioma, con 10 iteraciones por modelo y conjunto. El modelo completó las 140.620 peticiones del Decision Index (`ok`), con 442 exclusiones de suite y 140.178 peticiones puntuables. No se han publicado resultados de MMLU, HumanEval ni GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión nativa (safetensors, ~1,1 mil millones de parámetros): aproximadamente 2,2 GB para los pesos en fp16, más memoria para activaciones y overhead del runtime.
- En cuantización Q8_0 GGUF, el checkpoint ocupa del orden de 1,1-1,2 GB, por lo que cabe holgadamente en GPUs de consumo con 4 GB o más de VRAM.
- GPU recomendadas: cualquier GPU de consumo reciente (RTX 3060, RTX 4060, RTX 4090) es suficiente; para despliegues de alto throughput, A100 o H100 aportan margen pero no son necesarias por el tamaño del modelo.
- Las evaluaciones publicadas se ejecutaron con checkpoints Q8_0 GGUF servidos mediante endpoints locales System One en un Mac, y Claes preview se ejecutó en el dispositivo MPS del Mac.
- Opciones de despliegue: Flide (`flide serve --model syvai/claes-v1`), que expone la API System One. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | EuroEval danés (MCC medio) | Licencia | Formato |
|---|---|---|---|---|---|
| Claes v1 | 1,1 mil millones | no disponible | 18,68 % | Apache 2.0 | safetensors |
| OneJev original (OmniJev/OneJev1.6-0.8B) | ~0,8 mil millones (según nombre) | no disponible | 15,39 % | no disponible | no disponible |
| Claes preview | no disponible | no disponible | 9,39 % | no disponible | checkpoint nativo Laya |

La comparación se limita a los tres modelos evaluados en la model card. No se dispone de datos para comparar con alternativas de la misma categoría (modelos de decisión tipada) fuera de este conjunto.

## Limitaciones y advertencias

- No genera texto libre: no es adecuado para tareas de generación, resumen, traducción o diálogo abierto.
- El rendimiento con imagen y vídeo no se evaluó, pese a la etiqueta `image-text-to-text` del repositorio.
- Las etiquetas de idioma no implican rendimiento uniforme: la model card advierte explícitamente que el rendimiento varía entre idiomas y conjuntos de datos.
- En la suite pública Decision Index 0.3, la puntuación es 11,22 puntos inferior a la del OneJev base sin modificar, especialmente en Knowledge & Reasoning; el modelo prioriza la clasificación tipada sobre el conocimiento general.
- Riesgo de alucinación: no aplica en el sentido generativo, pero las probabilidades emitidas pueden estar mal calibradas en dominios o idiomas no representados en el entrenamiento; no se publican métricas de calibración.
- Las puntuaciones de EuroEval por idioma son medias descriptivas, no agregados oficiales del leaderboard, y las mezclas de tareas difieren entre idiomas.
- El modelo no se envió a ningún leaderboard y la puntuación del Decision Index es local y pública, no la puntuación privada completa.
- El repositorio no incluye registros de entrenamiento ni preguntas de ejemplo, lo que dificulta auditar el dataset y reproducir el fine-tuning.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base OmniJev/OneJev1.6-0.8B, cuya licencia no se detalla en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/syvai/claes-v1
- Modelo base: https://huggingface.co/OmniJev/OneJev1.6-0.8B
- Herramienta de despliegue Flide: https://github.com/OmniJev/Flide
- Puntuaciones y IC 95 % por idioma (CSV): ./assets/euroeval-language-scores.csv
- Gráficas de evaluación: ./assets/euroeval-danish-average.png, ./assets/euroeval-danish.png, ./assets/euroeval-other-languages-1.png, ./assets/euroeval-other-languages-2.png, ./assets/euroeval-english.png, ./assets/decision-index.png, ./assets/decision-index-areas.png
