# Voicelab/WERdict-pl

## Resumen

WERdict-pl es un modelo de clasificación de tokens desarrollado por Voicelab que estima la tasa de error de palabras (WER) de una transcripción ASR en polaco utilizando únicamente el texto de la transcripción, sin necesidad de una referencia. El modelo parte del encoder OPI-PIB/pl-ModernBERT-base, un transformer de tipo encoder con aproximadamente 148,9 millones de parámetros, y añade dos cabezas de predicción: una que etiqueta cada palabra como correcta, sustituida, insertada o seguida de omisiones, y otra que estima mediante una tasa de Poisson cuántas palabras faltan tras cada token.

La relevancia práctica del modelo reside en que permite evaluar la calidad de transcripciones ASR en escenarios donde no existe una referencia humana, algo habitual en producción. Con un ROC-AUC de 0,904 para la clase "poor" y una correlación de Spearman de 0,775 en el conjunto de evaluación retenido, el modelo supera con claridad a una línea base constante y ofrece una señal útil para enrutar transcripciones hacia revisión humana o para comparar motores ASR sobre nuevas grabaciones.

El modelo está entrenado exclusivamente en polaco y sobre salidas de dos familias de motores ASR, con una licencia Apache 2.0 que permite uso comercial. Su formato de pesos es safetensors y requiere `trust_remote_code=True` para cargar el código personalizado de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT) con dos cabezas: clasificación de tokens (4 etiquetas) y regresión de huecos (Poisson) |
| Parametros totales | 148.888.709 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 palabras por ventana; textos más largos se dividen en ventanas consecutivas de 256 sin solapamiento |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | polaco (pl) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | OPI-PIB/pl-ModernBERT-base |
| Pipeline | token-classification |
| Libreria | transformers (probado con 5.17.0) |
| Tamano del repo | 0.6 GB |

## Arquitectura y entrenamiento

El modelo se construye sobre OPI-PIB/pl-ModernBERT-base, un encoder ModernBERT adaptado al polaco. Sobre la representación del encoder se añaden dos cabezas: una cabeza de clasificación de tokens que asigna a cada palabra una de cuatro etiquetas (`OK`, `SUB`, `INS`, `DEL_AFTER`) y una segunda cabeza que predice, como tasa de Poisson, cuántas palabras de referencia faltan después de cada palabra. La estimación final de WER se ensambla a partir de ambas salidas: `missing = suma de huecos predichos`, `reference = OK + SUB + DEL_AFTER + missing`, y `WER = 100 * (SUB + INS + missing) / reference`.

El entrenamiento se realizó sobre transcripciones polacas generadas por dos familias de motores ASR: un motor Moonlight (ASR interno de Voicelab) y un motor de la familia Whisper. Cada transcripción constituye una valoración. El conjunto de evaluación retenido comprende 13 conjuntos de test, 37 corpus, 3.493 grabaciones y 6.982 valoraciones. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO; al tratarse de un modelo de clasificación de tokens, el ajuste es supervisado sobre etiquetas derivadas de la alineación con referencias.

Como innovación destacable, el modelo aborda el problema de las palabras eliminadas, que no dejan token que etiquetar, mediante la cabeza de predicción de huecos con distribución de Poisson. La normalización aplicada por `estimate_wer` consiste en NFKC, minúsculas y eliminación de puntuación, de modo que la misma frase con o sin puntuación produce el mismo resultado.

## Capacidades

- Estimación de WER a partir de una transcripción ASR en polaco, sin referencia, mediante `model.estimate_wer(texto, tokenizer)`.
- Etiquetado por palabra con `model.tag(words, tokenizer)`, que devuelve las etiquetas `OK`, `SUB`, `INS`, `DEL_AFTER` y los tamaños de hueco predichos.
- Clasificación de calidad en tres clases: `good` (WER ≤ 10), `acceptable` (WER 10–20) y `poor` (WER > 20).
- Comparación relativa entre dos transcripciones de la misma grabación producidas por motores distintos, identificando la peor el 83,5 % de las veces.
- Procesamiento de archivos de texto plano (`.txt`, `.asr`, `.vtt` sin marcas de tiempo) porque solo se lee la secuencia de palabras.
- Manejo de transcripciones largas mediante ventanas consecutivas de 256 palabras.
- Ejecución en GPU mediante `model.cuda()`.
- No soporta tool calling, agentes, visión, audio ni capacidades multilingües; su ámbito es exclusivamente el polaco y la estimación de calidad ASR.

## Casos de uso

- Selección de motor ASR para nuevas grabaciones: antes de transcribir manualmente, el modelo permite estimar el WER de las salidas de dos motores sobre el mismo audio y elegir el mejor, con una tasa de acierto del 83,5 % al identificar el peor.
- Enrutado de transcripciones a revisión humana: la clasificación en tres clases permite enviar a revisión las transcripciones con WER estimado superior a 10 y corregir manualmente las que superan 20, priorizando el esfuerzo humano.
- Monitorización de calidad en producción sin referencia: para material que nunca tendrá una transcripción de referencia, el modelo ofrece una estimación continua del WER que permite detectar degradaciones del sistema ASR.
- Evaluación comparativa de corpus: el modelo estima el WER agregado de un corpus completo (por ejemplo, 15,51 real frente a 16,74 estimado en el conjunto de evaluación), útil para comparar configuraciones de ASR a escala de conjunto.
- Filtrado previo en pipelines de datos: descartar o marcar transcripciones de baja calidad antes de usarlas para entrenar otros modelos o para indexación de contenido.
- Análisis por tipo de material: el modelo mantiene un error medio absoluto bajo en discurso espontáneo (5,99), medios de difusión (3,72) y parlamento (3,99), lo que permite monitorizar dominios concretos con precisión razonable.
- Verificación de subtítulos y transcripciones de vídeo: procesar archivos `.vtt` sin marcas de tiempo para estimar la calidad de los subtítulos generados automáticamente en plataformas de vídeo.

## Benchmarks y rendimiento

Conjunto de evaluación retenido: 13 conjuntos de test, 37 corpus, 3.493 grabaciones, 6.982 valoraciones. Cada grabación se transcribe con dos motores (uno Moonlight, uno de la familia Whisper). La columna "mejor constante" es el mejor resultado de una predicción constante sobre las mismas filas.

| Medida | Modelo | Mejor constante |
|---|---:|---:|
| Precisión de clase (tres clases) | 69,4 % | 47,6 % |
| Error absoluto medio | 6,35 puntos | 10,41 |
| Sesgo | +1,98 puntos | – |
| F1 clase poor | 73,7 | 0 |
| Recall clase poor | 80,3 % | 0 |
| Precisión clase poor | 68,1 % | – |
| ROC-AUC poor frente al resto | 0,904 | 0,500 |
| Correlación de Spearman | 0,775 | 0 |
| WER de corpus, real vs estimado | 15,51 vs 16,74 | – |

Rendimiento por tipo de material:

| Material | Valoraciones | WER real | Estimado | Precisión de clase | Mejor constante | MAE |
|---|---:|---:|---:|---:|---:|---:|
| Discurso espontáneo | 2.830 | 15,74 | 17,07 | 72,5 % | 36,9 % | 5,99 |
| YouTube | 2.252 | 21,19 | 22,21 | 73,4 % | 45,0 % | 6,87 |
| Salas de justicia | 242 | 17,43 | 17,57 | 71,1 % | 39,3 % | 5,14 |
| Medios de difusión | 2.572 | 10,25 | 9,81 | 70,8 % | 62,0 % | 3,72 |
| Habla leída | 2.544 | 7,86 | 11,35 | 70,0 % | 72,4 % | 6,62 |
| Teléfono, 8 kHz | 1.162 | 16,90 | 17,50 | 61,3 % | 41,5 % | 7,05 |
| Parlamento, gobierno local | 1.514 | 7,30 | 8,69 | 66,7 % | 78,1 % | 3,99 |

Ejemplo con Common Voice 20.0 (753 clips del split de test polaco, cada uno transcrito por dos sistemas):

| Sistema | WER real | Estimado |
|---|---:|---:|
| A | 6,21 | 6,37 |
| B | 11,02 | 9,91 |

El modelo identifica el peor de los dos sistemas en el 86,4 % de los 273 clips donde difieren.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 148,9 millones de parámetros en safetensors, lo que supone aproximadamente 0,6 GB en precisión completa (fp32) y alrededor de 0,3 GB en fp16/bf16. La VRAM real necesaria es inferior a 2 GB incluyendo activaciones y tokenizador.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; RTX 4090, A100 o H100 no son necesarias para este modelo, pero funcionarán sin problema.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090, etc.) e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: transformers con `trust_remote_code=True` (probado con la versión 5.17.0). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada. El procesamiento por ventanas de 256 palabras implica que transcripciones largas requieren múltiples pasadas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de estimación de WER sin referencia en la documentación proporcionada. La comparación más directa disponible es contra una línea base constante sobre el mismo conjunto de evaluación:

| Modelo | Tipo | Precisión de clase | MAE | ROC-AUC poor | Licencia |
|---|---|---:|---:|---:|---|
| WERdict-pl | Estimador WER sin referencia (polaco) | 69,4 % | 6,35 | 0,904 | Apache 2.0 |
| Mejor constante | Predicción constante | 47,6 % | 10,41 | 0,500 | – |

No se conocen alternativas públicas equivalentes para polaco en la información disponible.

## Limitaciones y advertencias

- Solo funciona en polaco; no soporta otros idiomas.
- Entrenado únicamente sobre salidas de dos familias de motores ASR (Moonlight y Whisper), por lo que su comportamiento con otros motores no está garantizado.
- Comprime el rango de estimación: en transcripciones realmente buenas añade +3,8 puntos y en las realmente malas resta 1,7 puntos, con un error absoluto medio de 11,7 en ese extremo.
- Subestima el error cuando faltan palabras en lugar de estar mal escritas; una transcripción que se lee bien pero omite material es el caso más difícil de detectar.
- Las transcripciones cortas son más difíciles: MAE de 7,2 por debajo de 20 palabras de referencia y 9,8 entre 50 y 150, frente a 5,3 por encima de 150.
- Devuelve un único número sin intervalo de confianza.
- El habla leída es el punto débil por tipo de material: sobreestima el WER en 3,5 puntos (7,86 real frente a 11,35 estimado).
- Las ventanas de 256 palabras no se solapan ni comparten contexto en los límites, lo que puede afectar a transcripciones largas.
- No sustituye a una medición de WER cuando se dispone de referencia; las etiquetas por palabra son un paso intermedio, no un informe de errores.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del autor del modelo.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar los términos del modelo base OPI-PIB/pl-ModernBERT-base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Voicelab/WERdict-pl
- Modelo base: https://huggingface.co/OPI-PIB/pl-ModernBERT-base
- Common Voice 20.0 (datos de ejemplo, CC0): https://commonvoice.mozilla.org/datasets
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la búsqueda web realizada.
