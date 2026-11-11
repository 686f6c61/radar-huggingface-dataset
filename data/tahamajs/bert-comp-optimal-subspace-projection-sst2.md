# tahamajs/bert-comp-optimal-subspace-projection-sst2

## Resumen

`bert-comp-optimal-subspace-projection-sst2` es un checkpoint de BERT-Base (`google-bert/bert-base-uncased`) afinado para clasificación de sentimiento en GLUE SST-2 y posteriormente comprimido mediante la tecnica `optimal_subspace_projection` de la libreria NeuralOps. El autor, tahamajs (Taha Majlesi), lo publica como parte de su "Compressed & LoRA-Healed Model Zoo", un catalogo de experimentos de compresion de modelos sobre arquitecturas conocidas.

El modelo parte de un profesor de 109.483.778 parametros (12 capas, dimension oculta 768) y aplica una proyeccion de subespacio optimo basada en SVD aleatorizado con conciencia de activaciones, reduciendo el checkpoint a 67.016.450 parametros (un 38,8 % menos, ratio fisico de 1,63x) en el rango de compresion k=256. Tras la compresion se aplica un "healing" con LoRA de rango 8 durante 50 pasos para recuperar parte de la precision perdida.

Es relevante como referencia practica de tecnicas de compresion post-entrenamiento: el checkpoint incluye telemetria completa (`compression_summary.json`) de cuatro rangos evaluados (k=256, 128, 64 y 32) sobre la particion de validacion de SST-2, lo que permite estudiar el compromiso entre ratio de compresion y precision. No obstante, la precision final (72,59 %) queda muy por debajo del profesor (91,63 %), por lo que su interes es principalmente metodologico y de investigacion, no de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-Base), comprimido con proyeccion de subespacio optimo (SVD aleatorizado con conciencia de activaciones) |
| Parametros totales | 67.016.450 (checkpoint comprimido en k=256; profesor original: 109.483.778) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base `bert-base-uncased` soporta 512 tokens; no se especifica en la model card) |
| Tipos de cuantizacion | no disponible (el checkpoint se distribuye en `pytorch_model.bin` sin cuantizacion declarada) |
| Idiomas soportados | ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`pytorch_model.bin`), requiere reconstruccion de la topologia comprimida con NeuralOps |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer encoder BERT-Base de 12 capas y dimension oculta 768, afinado previamente sobre GLUE SST-2 (clasificacion binaria de sentimiento). Sobre ese modelo se aplica el compresor `OptimalSubspaceProjectionCompressor`, que realiza una descomposicion SVD aleatorizada guiada por activaciones para proyectar los pesos en un subespacio de rango reducido k=256. El resultado es una topologia fisicamente comprimida con factores de bajo rango integrados en el state dict.

Cuando la compresion zero-shot degrada la precision mas de 2,0 puntos porcentuales con una reduccion superior a 1,10x, el pipeline aplica un "healing" con LoRA de rango r=8 durante 50 pasos con tasa de aprendizaje 2e-4 y un presupuesto de 45 segundos. En el rango k=256, la precision zero-shot cae al 50,92 % y el healing LoRA la recupera hasta el 72,59 %. La evaluacion se realizo fisicamente en una NVIDIA GeForce RTX 3090 (24 GB) sobre las 872 muestras de validacion de SST-2. No se detalla en la informacion disponible la composicion del dataset de entrenamiento mas alla de GLUE SST-2 ni si hubo RLHF/DPO (no aplicable en un clasificador).

## Capacidades

- Clasificacion binaria de sentimiento (positivo/negativo) en ingles, entrenada sobre GLUE SST-2.
- Inferencia sobre texto corto en ingles con el tokenizador estandar `bert-base-uncased`.
- No soporta generacion de texto, razonamiento, codigo ni matematicas: es un modelo discriminativo de clasificacion.
- No dispone de tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidad multilingue limitada al ingles (vocabulario uncased de BERT).
- No incluye modo "thinking", vision ni audio.
- El checkpoint requiere reconstruir la topologia comprimida con NeuralOps antes de cargar los pesos; no es un `BertForSequenceClassification` estandar cargable directamente con `from_pretrained`.

## Casos de uso

- Investigacion en compresion de modelos: sirve como referencia reproducible para comparar la tecnica `optimal_subspace_projection` frente a otras (poda, cuantizacion, destilacion) sobre un mismo profesor BERT-Base afinado en SST-2, gracias a la telemetria multi-rango incluida.
- Analisis del compromiso precision/compresion: los cuatro rangos evaluados (k=256, 128, 64, 32) permiten trazar curvas de Pareto entre ratio fisico y precision con datos reales medidos en RTX 3090.
- Prototipado de clasificadores de sentimiento de bajo coste: en entornos de investigacion donde el 72,59 % de precision sea aceptable, el checkpoint reducido ocupa 127,9 MB frente a los ~440 MB del profesor, lo que facilita su despliegue en dispositivos con almacenamiento limitado.
- Estudio de "healing" con LoRA: el pipeline documenta como un ajuste LoRA de rango 8 y 50 pasos recupera mas de 20 puntos de precision tras la compresion, un caso de estudio util para disenar estrategias de recuperacion post-compresion.
- Benchmark de infraestructura: al estar evaluado en una RTX 3090, sirve para medir latencia y throughput de un BERT comprimido en GPU de consumo dentro de pipelines de investigacion.
- Docencia y formacion: ejemplo didactico de un flujo completo de compresion post-entrenamiento con artefactos de configuracion (`config.json`, `compression_summary.json`) y codigo de reconstruccion.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados, `verified: false`):

| Modelo / rango | Ratio fisico | Parametros (reduccion) | Precision zero-shot | Precision con LoRA | Diferencia vs profesor |
|---|---:|---:|---:|---:|---:|
| Profesor (`bert-base-uncased` SST-2) | 1,00x | 109.483.778 | 91,63 % | no aplica | referencia |
| **k=256 (checkpoint publicado)** | 1,63x | 67.016.450 (-38,8 %) | 50,92 % | **72,59 %** | -19,04 pp |
| k=128 | 2,39x | 45.782.786 (-58,2 %) | 50,23 % | 72,25 % | -19,38 pp |
| k=64 | 3,11x | 35.165.954 (-67,9 %) | 49,20 % | 71,22 % | -20,41 pp |
| k=32 | 3,67x | 29.857.538 (-72,7 %) | 49,08 % | 67,66 % | -23,97 pp |

La metrica oficial del model-index es la precision en la particion de validacion de GLUE SST-2 (872 muestras): 72,59 % para el checkpoint publicado. No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para el checkpoint comprimido de 67 millones de parametros; cabe holgadamente en cualquier GPU de consumo.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor evaluo en NVIDIA GeForce RTX 3090 (24 GB), aunque el modelo no requiere esa capacidad.
- Cabe en GPU de consumo: si, incluidas GTX 1650, RTX 3060, RTX 4060 y superiores.
- Opciones de despliegue: no hay soporte directo en vLLM, llama.cpp, Ollama o TGI, ya que el checkpoint requiere reconstruir la topologia comprimida con la libreria NeuralOps y cargar el state dict con `strict=False` sobre un `BertForSequenceClassification`. El despliegue estandar con `transformers` no funciona sin ese paso previo.
- Latencia y throughput: no disponibles en la informacion proporcionada; el unico dato de tiempo es el presupuesto de 45 segundos para el healing LoRA en RTX 3090, no la inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision SST-2 | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| `tahamajs/bert-comp-optimal-subspace-projection-sst2` (k=256) | 67.016.450 | no disponible | 72,59 % (validacion) | MIT | Hugging Face, requiere NeuralOps |
| `google-bert/bert-base-uncased` afinado en SST-2 (profesor) | 109.483.778 | 512 tokens | 91,63 % (validacion, segun el autor) | Apache 2.0 | Hugging Face, carga directa con `transformers` |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66.955.266 | 512 tokens | no disponible en la informacion proporcionada | Apache 2.0 | Hugging Face, carga directa con `transformers` |

La comparacion con DistilBERT es la mas directa por tamano (ambos rondan los 67 millones de parametros), pero no se dispone de su precision SST-2 en la informacion proporcionada para establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Perdida de precision severa: el checkpoint publicado rinde 19,04 puntos porcentuales por debajo del profesor (72,59 % frente a 91,63 %), lo que lo hace inadecuado para produccion sin validacion adicional.
- Precision zero-shot muy baja (50,92 %, practicamente azar en una tarea binaria): el modelo depende criticamente del healing LoRA aplicado; sin el, es inutil.
- Requiere la libreria NeuralOps y un proceso de reconstruccion manual de la topologia; no es compatible con el flujo estandar de `transformers`.
- Solo ingles y solo clasificacion binaria de sentimiento; no generaliza a otras tareas sin reentrenamiento.
- Riesgo de alucinacion no aplicable (modelo discriminativo), pero si riesgo de clasificaciones erroneas en dominios distintos de resenas de cine (SST-2).
- Sesgos heredados de `bert-base-uncased` y de los datos de GLUE SST-2, no evaluados ni documentados por el autor.
- Licencia MIT permite uso comercial, pero el modelo base subyacente es Apache 2.0; conviene revisar ambas.
- Resultados de benchmarks no verificados (`verified: false`) y con cero descargas y cero likes en el momento de la consulta: sin validacion independiente por la comunidad.
- El enlace de busqueda web proporcionado no guarda relacion con el modelo y se descarta como fuente.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/bert-comp-optimal-subspace-projection-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementacion del compresor: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/svd/optimal_subspace_projection.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset GLUE: https://huggingface.co/datasets/nyu-mll/glue
