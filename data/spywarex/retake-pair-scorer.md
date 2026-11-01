# spywarex/retake-pair-scorer

## Resumen

`retake-pair-scorer` es un modelo de clasificación de pares de frases (cross-encoder) desarrollado por el usuario `spywarex`. Su función es determinar si, en una transcripción de vídeo, una segunda frase es una repetición (retake) de una frase anterior: es decir, si el hablante volvió a decir lo mismo tras un tropiezo, una autocorrección o un reinicio. Forma parte del pipeline ReTake, cuyo objetivo es automatizar la edición de vídeo eliminando tomas repetidas.

El modelo no genera texto ni edita vídeo: puntúa pares de frases. Se construye sobre `cross-encoder/ms-marco-MiniLM-L-6-v2` (un cross-encoder de unos 22 millones de parámetros), afinado con tres semillas cuyas probabilidades se promedian, y combinado con una etapa previa de puntuación léxica y semántica más un apilador de regresión logística que produce la decisión final.

Es relevante ahora porque aborda un problema muy concreto de los flujos de posproducción y de los pipelines de transcripción automática: la detección de tomas repetidas en material hablado. Su tamaño reducido (unos 270 MB de descarga) y su licencia Apache-2.0 lo hacen desplegable incluso en CPU.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cross-encoder (transformer encoder) sobre `cross-encoder/ms-marco-MiniLM-L-6-v2`, con tres semillas promediadas y apilador de regresión logística |
| Parámetros totales | Aproximadamente 22 M por cada cross-encoder afinado (tres semillas) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 128 tokens por par de frases (entrada del cross-encoder) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

El sistema combina tres componentes. Primero, una puntuación de "etapa 2" que es una media ponderada: 0,50 de similitud semántica (coseno de `all-MiniLM-L6-v2` mapeado a [0,1]), 0,30 de similitud léxica (ratio de secuencia ponderado, Jaccard, contención y solapamiento de bigramas sobre tokens normalizados) y 0,20 de contención. Segundo, un cross-encoder `ms-marco-MiniLM-L-6-v2` afinado sobre pares de frases etiquetados, con tres semillas (`ce_seed0`, `ce_seed1`, `ce_seed2`) cuyas probabilidades se promedian; la entrada son las dos frases en bruto con un máximo de 128 tokens. Tercero, un apilador de regresión logística sobre (puntuación de etapa 2, logit de la probabilidad del cross-encoder), cuyos coeficientes y umbrales viven en `thresholds.json`.

El entrenamiento se realizó con 3.562 pares de frases etiquetados (340 retakes) procedentes de vídeos en inglés, más pares sintéticos. Las grabaciones naturales y sus etiquetas son privadas y no se publican; solo la parte sintética está en el repositorio de ReTake, por lo que el modelo exacto no es reproducible únicamente desde el repositorio público. La evaluación usó cuatro particiones de validación cruzada con umbrales elegidos fuera de partición (out-of-fold, agrupados).

## Capacidades

- Clasificación de pares de frases en tres categorías: `retake`, `not_retake` y `ambiguous`.
- Detección de repeticiones por tropiezo, autocorrección o reinicio en transcripciones habladas en inglés.
- Puntuación por lotes mediante `score(pairs)`, que devuelve un diccionario por par con `decision`, `resolved_by`, `p`, `ce_prob` y `stage2`.
- Integración con un segundo modelo del pipeline (`retake-keeper-qwen3-4b`) que decide qué toma conservar.
- Ejecución en CPU o GPU; la GPU solo aporta velocidad.
- No genera texto, no realiza tool calling, no soporta agentes ni razonamiento multi-paso, y no procesa audio ni vídeo.

## Casos de uso

- Edición automática de vídeo hablado: el modelo agrupa frases que son repeticiones entre sí para que el editor descarte tomas fallidas antes de montar el corte final.
- Posproducción de pódcast y entrevistas: sobre la transcripción generada por ASR, detecta reinicios y autocorrecciones del hablante y los marca para revisión.
- Limpieza de subtítulos: elimina o marca líneas duplicadas que provienen de una toma repetida, mejorando la legibilidad del subtitulado.
- Preprocesado de datasets de audio: al construir corpus de voz, permite filtrar tomas repetidas antes de la anotación o el entrenamiento.
- Herramientas de asistencia a creadores de contenido: un editor puede señalar automáticamente las tomas a descartar y pedir confirmación solo en los pares marcados como `ambiguous`.
- Integración en pipelines de transcripción: como paso posterior al ASR, agrupa segmentos repetidos y reduce el trabajo manual de corrección.
- Investigación en procesamiento de lenguaje hablado: sirve como componente de referencia para tareas de detección de repeticiones en texto transcrito.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Precisión (nivel de retake, out-of-fold) | 0,90 |
| Recall (nivel de retake, out-of-fold) | 0,84 |
| Pares marcados como ambiguos | 10,5 % |
| Peor partición (precisión en nivel de retake) | 0,75 |

Estos resultados son indicativos: la cobertura de hablantes y temáticas es reducida.

## Requisitos de hardware

- Descarga de aproximadamente 270 MB (repositorio de 0,3 GB); el primer uso también descarga `sentence-transformers/all-MiniLM-L6-v2`.
- Inferencia viable en CPU; la GPU solo mejora la velocidad.
- Cabe holgadamente en cualquier GPU de consumo (por ejemplo, RTX 3060 o superior), aunque no es necesaria.
- Despliegue mediante la clase `RetakePairScorer` incluida en `retake_pair_scorer.py`, que requiere `torch`, `transformers`, `sentence-transformers`, `huggingface_hub` y `numpy`.
- No se han publicado datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `spywarex/retake-pair-scorer` | Cross-encoder especializado en detección de retakes | ~22 M por semilla | 128 tokens | Apache-2.0 | HuggingFace |
| `cross-encoder/ms-marco-MiniLM-L-6-v2` | Cross-encoder de reordenación | ~22 M | 512 tokens | Apache-2.0 | HuggingFace |
| `sentence-transformers/all-MiniLM-L6-v2` | Bi-encoder de embeddings | ~22 M | 256 tokens | Apache-2.0 | HuggingFace |

No se dispone de comparativas de rendimiento publicadas frente a alternativas específicas de detección de retakes.

## Limitaciones y advertencias

- Solo inglés; el rendimiento baja en estilos de habla distintos a los del entrenamiento (pocos hablantes y temáticas).
- Compara únicamente dos frases: no conoce el audio, las pausas ni el vídeo circundante, y no elige qué toma conservar.
- Dos frases idénticas que debían decirse dos veces (por ejemplo, un estribillo) se clasificarán erróneamente como retake.
- Las puntuaciones no son probabilidades calibradas; no deben mostrarse como porcentajes.
- Los pares `ambiguous` deben tratarse como `not_retake` si no se puede preguntar al usuario, para no cortar material por error.
- El umbral inferior de la banda de duda (0,32) se elevó manualmente desde el valor ajustado (0,0035), lo que reduce las preguntas al usuario pero altera el comportamiento calibrado.
- Los datos naturales de entrenamiento son privados; el modelo exacto no es reproducible solo con el repositorio público.
- Licencia Apache-2.0, que permite uso comercial; los modelos base también son Apache-2.0.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/spywarex/retake-pair-scorer
- Repositorio del pipeline ReTake: https://github.com/spywareXd/re-take
- Modelo "keeper": https://huggingface.co/spywarex/retake-keeper-qwen3-4b
- Modelo base cross-encoder: https://huggingface.co/cross-encoder/ms-marco-MiniLM-L-6-v2
- Modelo de embeddings: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
