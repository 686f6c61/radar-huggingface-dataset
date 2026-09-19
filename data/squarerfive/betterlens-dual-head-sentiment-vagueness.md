# squarerfive/betterlens-dual-head-sentiment-vagueness

## Resumen

BetterLens Dual-Head Sentiment + Vagueness es un modelo de DistilBERT con dos cabezas de salida desarrollado por el usuario squarerfive. Resuelve dos tareas simultaneamente sobre el mismo texto: clasificacion de sentimiento en tres clases (positivo, neutral, negativo) y regresion de vaguedad, una puntuacion continua en el rango [0, 1] donde 0 indica un texto especifico y 1 un texto difuso o impreciso. El modelo se publica junto a una exportacion ONNX para inferencia en navegador o en dispositivo.

La relevancia del modelo esta en su objetivo de diseno: alimentar la regla de filtrado de la extension BetterLens, que oculta una publicacion solo cuando es simultaneamente negativa y vaga. Asi se preservan las quejas concretas y accionables y se elimina la negatividad difusa. El backbone es distilbert-base-uncased, con 66.365.956 parametros totales y una longitud maxima de secuencia de 128 tokens. El repositorio ocupa 0,5 GB y la licencia es MIT para pesos y codigo (el modelo base es Apache-2.0).

Es un modelo pequeno y especializado, no un modelo de proposito general: solo soporta ingles, su contexto es muy corto y requiere `trust_remote_code=True` porque la arquitectura de dos cabezas es personalizada y no es compatible con el pipeline estandar de transformers sin ese codigo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT) con dos cabezas de salida sobre el token [CLS] |
| Parametros totales | 66.365.956 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens (maximo de secuencia) |
| Tipos de cuantizacion | FP32 (safetensors y ONNX opset 14); exportacion INT8 de la extension BetterLens; GGUF, GPTQ y AWQ no disponibles |
| Idiomas soportados | ingles (en) |
| Licencia | MIT (pesos y codigo); modelo base distilbert-base-uncased bajo Apache-2.0 |
| Formato de pesos | safetensors (FP32) y ONNX (~253 MB, FP32, opset 14) |
| Tarea | Clasificacion de texto (text-classification) con cabeza de regresion adicional |
| Cabezas | `sentiment_head`: Linear(768 → 3); `vagueness_head`: Linear(768 → 1) con sigmoide en inferencia |
| Orden de etiquetas | [positive, neutral, negative] para los indices 0, 1, 2 |
| Tamano del repositorio | 0,5 GB |

## Arquitectura y entrenamiento

El modelo parte de `distilbert-base-uncased`, un encoder transformer destilado de 6 capas, 768 dimensiones ocultas y 12 cabezas de atencion. Sobre el embedding del token [CLS] se aplica un dropout compartido de 0,1 y despues dos cabezas lineales independientes: una de clasificacion con salida de 3 logits y otra de regresion con salida de 1 logit que se pasa por una sigmoide en inferencia para acotar el resultado a [0, 1]. El entrenamiento usa una perdida combinada ponderada: `0.6 · CrossEntropy(sentiment) + 0.4 · MSE(vagueness)`, de modo que ambas tareas comparten el mismo backbone y se optimizan de forma conjunta.

Los datos de entrenamiento provienen de corpus publicos de sentimiento en HuggingFace (estilo SST-2, resenas de Amazon y derivados de AG News) junto con publicaciones sinteticas de "negatividad vaga" generadas con objetivos de vaguedad conocidos (`vague_score`). El autor remite a `DATASET_NOTES.md` del repositorio principal para el detalle de composicion. No se documenta en la informacion disponible el numero exacto de tokens de entrenamiento ni si hubo fases de RLHF o DPO; el modelo es un fine-tuning supervisado con dos objetivos.

La innovacion tecnica principal es precisamente la cabeza dual con objetivo compuesto, orientada a una regla de filtrado booleana (negativo AND vago) en lugar de a una metrica de clasificacion aislada. El modelo no incorpora decodificacion especulativa ni atencion lineal, ya que es un encoder de clasificacion, no un modelo generativo.

## Capacidades

- Clasificacion de sentimiento en tres clases: positivo, neutral y negativo.
- Regresion de vaguedad con puntuacion continua en [0, 1] (0 = especifico, 1 = difuso).
- Salida conjunta de ambas tareas en una sola pasada, con backbone compartido.
- Inferencia en dispositivo: exportacion ONNX compatible con onnxruntime y con entornos de navegador.
- Procesamiento de textos cortos en ingles (hasta 128 tokens), tipico de publicaciones en redes sociales, resenas y comentarios.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo de razonamiento explicito (thinking mode).
- No tiene capacidades de vision, audio ni generacion de texto.
- Multilingue: no; unicamente ingles.

## Casos de uso

- Filtrado de negatividad difusa en redes sociales: la extension BetterLens usa la regla "ocultar solo si es negativo y vago" para reducir ruido sin censurar quejas concretas. El modelo devuelve ambas senales en 19 ms por publicacion en CPU con ONNX FP32.
- Moderacion de comentarios en comunidades: se puede ocultar o plegar automaticamente el contenido negativo e impreciso, manteniendo visibles las criticas especificas que aportan informacion util al hilo.
- Triaje de feedback de clientes: priorizar quejas concretas y accionables frente a quejas difusas, enviando las primeras a equipos de producto y agrupando las segundas para analisis agregado.
- Analisis de resenas de producto: separar resenas negativas con detalle tecnico (fallos concretos, condiciones de uso) de resenas de frustracion generica, mejorando la senal que se extrae del corpus.
- Preprocesado para pipelines con LLM: descartar o marcar entrada de baja calidad y alta vaguedad antes de enviarla a un modelo mayor, reduciendo coste de tokens y ruido en las respuestas.
- Investigacion en ciencias sociales y analisis de discurso: medir de forma continua el grado de vaguedad y la polaridad en corpus de textos cortos, con MAE de 0,061 en el split de test.
- Inferencia en navegador o en dispositivo: el ONNX de 253 MB FP32 (y la variante INT8 de la extension) permite ejecutar el modelo sin enviar el texto del usuario a un servidor, lo que ayuda con requisitos de privacidad.
- Deteccion de frustracion difusa en soporte tecnico: identificar tickets con tono negativo pero sin informacion accionable y solicitar automaticamente los datos que faltan.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el split de test reservado (13.000 muestras, reverificado el 19 de septiembre de 2026):

| Metrica | Valor |
|---|---|
| Accuracy (sentimiento) | 82,7% |
| F1 macro (sentimiento) | 82,6% |
| MAE (vaguedad) | 0,061 |
| R² (vaguedad) | 0,676 |

Matriz de confusion (filas = real, columnas = predicho; orden positivo/neutral/negativo):

```
              positive  neutral  negative
positive        3847      73      110
neutral          284    4037      602
negative         236     947     2864
```

Comportamiento como filtro dual, sobre un benchmark curado de 25 publicaciones:

| Metrica | Valor |
|---|---|
| Precision del filtro | 87,5% |
| Recall del filtro | 46,7% |
| Tasa de paso de contenido limpio | 90% |
| MAE de vaguedad (benchmark) | 0,239 |
| Pearson de vaguedad en negativos | +0,65 |

Latencia en CPU para una publicacion individual: aproximadamente 19 ms en ONNX FP32 (`benchmark_results.json`). No se han publicado resultados comparativos con MMLU, HumanEval, GSM8K ni otros benchmarks estandar, ya que el modelo no es generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en FP32 (los pesos ocupan aproximadamente 265 MB, calculados a partir de 66,4 M de parametros a 4 bytes). El ONNX FP32 ocupa 253 MB; la variante INT8 reduce el tamano aun mas, aunque el autor no publica su tamano exacto.
- GPU recomendadas: cualquier GPU con 1 GB o mas de memoria es suficiente; el modelo no requiere A100, H100 ni RTX 4090. Funciona en GPUs integradas y en CPU.
- Cabe en GPU de consumo: si, en cualquier modelo, incluidas generaciones antiguas de gama baja.
- Opciones de despliegue: `transformers` con `trust_remote_code=True`, `onnxruntime` (Python), `onnxruntime-web` para navegador. No hay soporte documentado para vLLM, TGI, llama.cpp ni Ollama, ya que no se publican pesos GGUF y la arquitectura personalizada de dos cabezas no es compatible con los pipelines estandar de servidores de inferencia.
- Latencia y throughput: aproximadamente 19 ms por publicacion en CPU con ONNX FP32. No se dispone de datos de throughput en lote ni de latencia en GPU.
- Nota de despliegue: al tratarse de un modelo de clasificacion de 128 tokens, el cuello de botella en produccion sera el tokenizador y la gestion de lotes, no la memoria.

## Comparativa con modelos similares

No se han publicado en la informacion disponible resultados de benchmarks comparativos frente a otros modelos. La comparacion se limita a caracteristicas de arquitectura y licencia:

| Modelo | Parametros | Contexto | Salida | Licencia |
|---|---|---|---|---|
| betterlens-dual-head-sentiment-vagueness | 66,4 M | 128 tokens | Sentimiento 3 clases + vaguedad continua | MIT (base Apache-2.0) |
| distilbert-base-uncased-finetuned-sst-2-english | aproximadamente 67 M (no confirmado en la informacion disponible) | 512 tokens | Sentimiento binario | Apache-2.0 |
| Modelos de sentimiento basados en RoBERTa (por ejemplo, cardiffnlp/twitter-roberta-base-sentiment) | no disponible | no disponible | Sentimiento multiclase | no disponible |
| squarerfive/betterlens-adversarial-framing | no disponible | no disponible | Clasificacion de una sola cabeza compatible con pipeline | no disponible |

El diferenciador frente a los clasificadores de sentimiento habituales es la segunda salida de vaguedad y la posibilidad de combinarla con el sentimiento para una regla de filtrado booleana. A cambio, el contexto es de solo 128 tokens frente a los 512 de los modelos basados en BERT y RoBERTa, y la precision global de sentimiento (82,7%) es inferior a la de clasificadores binarios especializados, aunque no se dispone de cifras comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Requiere `trust_remote_code=True`: la arquitectura de dos cabezas se carga con codigo personalizado incluido en el repositorio. En produccion conviene auditar `modeling_betterlens_dual_head.py` y `loading_utils.py` antes de ejecutarlo.
- Precision de sentimiento del 82,7%: la frontera entre neutral y negativo es la mas dificil. En la matriz de confusion, 947 negativos se predicen como neutrales y 602 neutrales como negativos.
- El propio autor senala que la cabeza de vaguedad es mas fiable que la de sentimiento.
- Recall bajo como filtro: 46,7% en el benchmark curado de 25 publicaciones, lo que implica que mas de la mitad del contenido objetivo no se filtra. La precision es alta (87,5%), por lo que el sesgo es conservador.
- Contexto limitado a 128 tokens: los textos mas largos se truncan, lo que puede degradar la clasificacion de publicaciones extensas.
- Solo ingles: no se ha entrenado ni evaluado para otros idiomas.
- Riesgo de sesgo: los datos de entrenamiento combinan corpus publicos de resenas y AG News con publicaciones sinteticas de vaguedad. La composicion exacta y el equilibrio entre dominios no se detallan en la informacion disponible, y los datos sinteticos pueden introducir sesgos en la frontera entre "vago" y "concreto".
- Los datos sinteticos de vaguedad pueden no reflejar la distribucion real de discurso en una plataforma concreta.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de clasificaciones erroneas con confianza alta (logits mal calibrados) en textos fuera de dominio.
- Licencia MIT para pesos y codigo: permite uso comercial, pero el modelo base distilbert-base-uncased esta bajo Apache-2.0, cuyos terminos deben respetarse.
- Advertencia de moderacion: usar el modelo para ocultar contenido de forma automatica puede tener implicaciones de censura. El diseno mitiga este riesgo al exigir negatividad y vaguedad simultaneas y al mantener un umbral conservador, pero requiere revision humana en contextos sensibles.
- No se dispone de datos sobre el numero de descargas ni de adopcion (0 descargas y 0 likes en el momento de la consulta), por lo que no hay evidencia de uso en produccion por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/squarerfive/betterlens-dual-head-sentiment-vagueness
- Exportacion ONNX incluida: https://huggingface.co/squarerfive/betterlens-dual-head-sentiment-vagueness/blob/main/onnx/model.onnx
- Modelo relacionado de una sola cabeza: https://huggingface.co/squarerfive/betterlens-adversarial-framing
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Resultados de busqueda web: no se ha encontrado informacion adicional relevante sobre el modelo en la busqueda realizada.
