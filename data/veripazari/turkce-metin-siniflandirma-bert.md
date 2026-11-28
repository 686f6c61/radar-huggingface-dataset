# veripazari/turkce-metin-siniflandirma-bert

## Resumen

`veripazari/turkce-metin-siniflandirma-bert` es un modelo de clasificacion de texto en turco obtenido mediante fine-tuning de `dbmdz/bert-base-turkish-uncased` (o `bert-base-turkish-uncased`, segun la model card) sobre una tarea de deteccion de lenguaje toxico con cuatro clases: racismo, provocacion, neutro y sexismo. El modelo lo desarrollo originalmente el usuario `ba2hannn` y lo ha archivado y redistribuido VeriPazari, una plataforma turca, con documentacion traducida al turco y licencia MIT.

Se trata de un encoder BERT base de 12 capas transformer con una cabeza lineal de clasificacion de 4 clases sobre el token `[CLS]`. La model card no especifica el numero exacto de parametros, pero al derivar de `bert-base-turkish-uncased` es razonable asumir la configuracion estandar de BERT base (aproximadamente 110 millones de parametros), aunque este dato no se confirma en la informacion disponible.

Su relevancia es acotada: es un modelo de nicho para moderacion de contenido en turco, con cero descargas y cero likes en el momento de la consulta, sin pipeline declarado en Hugging Face y sin resultados numericos de benchmarks publicados. Resulta util como punto de partida para pipelines de moderacion en turco, pero su madurez y validacion son limitadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT base (12 capas) |
| Parametros totales | no disponible (deriva de `bert-base-turkish-uncased`, tamano base no confirmado en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible de forma explicita; el ejemplo de uso aplica `max_length=256` |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | turco (tr) |
| Licencia | MIT |
| Formato de pesos | no disponible (se infiere compatibilidad con PyTorch/Hugging Face Transformers por el codigo de ejemplo, pero no se explicita) |

## Arquitectura y entrenamiento

El modelo es un BERT base fine-tuneado para clasificacion de secuencias. Segun la model card, el flujo es: tokenizacion WordPiece, generacion de `input_ids`, `attention_mask` y `token_type_ids`, paso por 12 capas transformer y clasificacion mediante una cabeza lineal sobre el token `[CLS]` que produce 4 logits (racismo, provocacion, neutro, sexismo). El entrenamiento se realizo con PyTorch y Hugging Face Transformers sobre GPU con CUDA.

La informacion disponible no detalla el volumen de tokens de entrenamiento, la composicion del dataset, si hubo aumento de datos, ni si se aplicaron tecnicas de desbalanceo de clases. Tampoco se documenta el uso de RLHF, DPO ni ninguna innovacion arquitectonica adicional. La model card menciona visualizaciones (curvas ROC, matriz de confusion, metricas por clase) pero no aporta los valores numericos.

## Capacidades

- Clasificacion de texto en turco en 4 categorias: racismo, provocacion, neutro y sexismo.
- Salida de probabilidades por clase mediante softmax sobre los logits.
- Deteccion de lenguaje toxico en comentarios de redes sociales, articulos de noticias y otros contenidos textuales, segun la model card.
- Procesamiento de entradas de hasta 256 tokens en el ejemplo de uso (truncado configurable).
- No soporta generacion de texto, tool calling, function calling, agentes, vision, audio ni modos de razonamiento extendido.
- Capacidad multilingue limitada al turco; no se documenta soporte para otros idiomas.

## Casos de uso

- Moderacion de comentarios en redes sociales en turco: el modelo clasifica cada comentario en una de las cuatro categorias y devuelve la confianza, lo que permite enrutar automaticamente los casos de racismo o sexismo a revision humana y dejar pasar los neutros.
- Filtrado previo en foros y secciones de comentarios de medios: se puede integrar como paso de pre-moderacion para reducir la carga de los moderadores humanos, marcando solo los textos con alta probabilidad de toxicidad.
- Analisis de sentimiento toxico en estudios de opinion: investigadores pueden procesar corpus de comentarios turcos y medir la prevalencia de provocacion, racismo o sexismo por tematica o por periodo.
- Deteccion de discurso de odio en plataformas de comercio o marketplaces: el modelo puede revisar resenas y mensajes entre usuarios para detectar lenguaje discriminatorio antes de su publicacion.
- Enriquecimiento de datasets para entrenamiento: las predicciones del modelo pueden usarse para etiquetar grandes volumenes de texto turco de forma automatica y semi-automatica, con revision posterior.
- Sistemas de alerta temprana en comunidades online: integrado en un pipeline de streaming, el modelo puede disparar alertas cuando la proporcion de comentarios toxicos supera un umbral en una ventana temporal.
- Clasificacion por lotes en pipelines de NLP: al ser un encoder BERT base, se puede ejecutar en CPU o GPU con `transformers` y procesar lotes de cientos de textos por segundo en hardware moderno, aunque no se publican cifras de throughput.

## Benchmarks y rendimiento

La model card indica que el modelo se evaluo sobre un conjunto de test separado y que las metricas por clase (precision, recall, F1) fueron "altas" en las cuatro categorias, pero no proporciona los valores numericos. Tampoco se publican resultados de MMLU, HumanEval, GSM8K ni de benchmarks estandar de clasificacion de toxicidad.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un BERT base en FP32 se situaria en torno a 0,5-1 GB, y en FP16 alrededor de 0,3-0,5 GB, aunque estas cifras son estimaciones y no estan confirmadas en la model card.
- GPU recomendadas: cualquier GPU con CUDA, incluida una GTX 1060 o superior; el modelo es lo suficientemente pequeno para ejecutarse en GPU de gama baja.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: Hugging Face Transformers con PyTorch (unica via documentada en la model card); no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, aunque al ser un modelo BERT podria exportarse a ONNX o TorchScript con trabajo adicional.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `veripazari/turkce-metin-siniflandirma-bert` | no disponible (base BERT) | no disponible (ejemplo con 256 tokens) | Clasificacion de toxicidad en turco (4 clases) | MIT | Hugging Face, 0 descargas |
| `dbmdz/bert-base-turkish-uncased` | ~110 M (BERT base) | 512 tokens (estandar BERT) | Modelo base de lenguaje en turco | no disponible en esta ficha | Hugging Face, ampliamente usado |
| `ba2hann/bert_base_turkish_sentiment_analysis` | no disponible | no disponible | Analisis de sentimiento en turco | no disponible en esta ficha | Hugging Face (referenciado en la model card) |

La comparativa con modelos de moderacion multilingue como `unitary/multilingual-toxic-xlm-roberta` no se puede completar con datos de la informacion proporcionada. No se dispone de resultados de rendimiento comparables entre estos modelos.

## Limitaciones y advertencias

- La model card no publica metricas numericas por clase, lo que impide evaluar la calidad real del modelo y su robustez ante clases desbalanceadas.
- El modelo tiene cero descargas y cero likes en Hugging Face, y no declara pipeline en la plataforma; su validacion por la comunidad es nula.
- El campo `creator` de la model card es `ba2hannn`, mientras que el repositorio de Hugging Face pertenece a `veripazari`; se trata de un archivado, no de un desarrollo original de la plataforma que lo aloja.
- La model card referencia un modelo en Hugging Face (`ba2hann/bert_base_turkish_sentiment_analysis`) cuyo nombre sugiere analisis de sentimiento, no clasificacion de toxicidad, lo que genera ambiguedad sobre el checkpoint exacto publicado.
- No se documenta el dataset de entrenamiento, su procedencia, su tamano ni los criterios de etiquetado, lo que impide auditar sesgos.
- Riesgo de alucinacion no aplica en sentido estricto (es un clasificador, no un generador), pero si existe riesgo de falsos positivos y falsos negativos en la deteccion de toxicidad.
- El modelo solo soporta turco; no debe usarse con textos en otros idiomas.
- La licencia MIT permite uso comercial, pero al derivar de `dbmdz/bert-base-turkish-uncased` conviene verificar la licencia del modelo base antes de un despliegue en produccion.
- La longitud maxima de entrada no se documenta de forma explicita; el ejemplo usa 256 tokens y BERT base soporta hasta 512, pero no se confirma el limite real del fine-tuning.
- No se documenta si el modelo se entreno con tecnicas de mitigacion de sesgo ni como se comporta ante sarcasmo, ironia o lenguaje figurado.

## Enlaces

- Hugging Face: https://huggingface.co/veripazari/turkce-metin-siniflandirma-bert
- Repositorio original en GitHub: https://github.com/ba2hannn/turkce-metin-siniflandirma-bert
- Modelo referenciado en la model card: https://huggingface.co/ba2hann/bert_base_turkish_sentiment_analysis
- Plataforma que archiva el modelo: https://veripazari.com.tr
- Modelo base: https://huggingface.co/dbmdz/bert-base-turkish-uncased
- Licencia MIT: https://github.com/ba2hannn/turkce-metin-siniflandirma-bert/blob/main/LICENSE
