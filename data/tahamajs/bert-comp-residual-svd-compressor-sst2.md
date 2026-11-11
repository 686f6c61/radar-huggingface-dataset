# tahamajs/bert-comp-residual-svd-compressor-sst2

## Resumen

`tahamajs/bert-comp-residual-svd-compressor-sst2` es un checkpoint comprimido y "sanado" mediante LoRA de `google-bert/bert-base-uncased`, ajustado previamente sobre la tarea de clasificacion de sentimiento GLUE SST-2. Lo publica el autor Taha Majlesi dentro del proyecto NeuralOps, una libreria orientada a compresion de modelos neuronales. El modelo no es un BERT entrenado desde cero: es un BERT base de 12 capas y dimension oculta 768 (109.483.778 parametros) al que se le ha aplicado el compresor `ResidualSVDCompressor` (Spectral Residual Low-Rank Adaptation, Res-SVD) con rango Pareto `k=256`, reduciendo el numero de parametros a 68.343.554 (-37,58%) para una ratio de compresion fisica de 1,602x.

El problema que aborda es el de la reduccion de huella de modelos de clasificacion ya ajustados sin reentrenar desde cero, combinando descomposicion SVD residual con un proceso de recuperacion mediante LoRA de rango 8 (50 pasos, `lr=2e-4`, presupuesto de 45 segundos) cuando la compresion en frio degrada la exactitud en mas de 2 puntos y la reduccion supera 1,10x. La relevancia actual esta en el interes por tecnicas de compresion post-hoc (pruning estructurado, SVD, cuantizacion, adaptadores de bajo rango) para desplegar modelos en hardware limitado sin perder demasiada calidad.

Se trata de un modelo exclusivamente en ingles, para clasificacion binaria de sentimiento (0 = negativo, 1 = positivo), con licencia MIT, publicado en formato PyTorch (`pytorch_model.bin`) y dependiente de la libreria NeuralOps para reconstruir la topologia comprimida antes de cargar los pesos. No es un modelo generativo ni conversacional: su unico pipeline declarado es `text-classification`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT base), comprimido con ResidualSVDCompressor (Res-SVD / Spectral Residual LoRA) |
| Parametros totales | 68.343.554 (checkpoint comprimido, rango k=256); modelo base original: 109.483.778 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base BERT-base-uncased soporta 512 tokens, pero la model card no lo declara explicitamente) |
| Tipos de cuantizacion | No disponible (se mencionan "quantization buffers" en los artefactos, sin especificar formatos) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`pytorch_model.bin`), con `config.json`, `compression_summary.json` y assets del tokenizer `bert-base-uncased` |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer encoder tipo BERT base: 12 capas, dimension oculta D=768, 109.483.778 parametros, preentrenado por Google como `bert-base-uncased` y posteriormente ajustado sobre GLUE SST-2 (clasificacion binaria de sentimiento). Sobre ese checkpoint ajustado, NeuralOps aplica el operador `ResidualSVDCompressor`, que descompone las matrices de pesos en factores de bajo rango mas un residuo espectral. El checkpoint publicado corresponde al rango `k=256`, con ratio de compresion fisica 1,602x y reduccion de parametros del 37,58%.

El proceso de "healing" consiste en un ajuste LoRA de rango `r=8` durante 50 pasos con `lr=2e-4` y un presupuesto de 45 segundos, aplicado cuando la compresion zero-shot degrada la exactitud en mas de 2 puntos porcentuales y la reduccion supera 1,10x. Los adaptadores LoRA quedan integrados en el state dict serializado. La evaluacion se realizo fisicamente en una NVIDIA GeForce RTX 3090 (24 GB) sobre el split de validacion de GLUE SST-2 (872 muestras). El autor no detalla el numero de tokens de entrenamiento adicionales ni la composicion exacta del dataset mas alla de GLUE SST-2.

## Capacidades

- Clasificacion binaria de sentimiento en ingles (etiquetas 0 = negativo, 1 = positivo) sobre textos cortos y medios.
- Inferencia sobre entradas tokenizadas con el vocabulario `bert-base-uncased` estandar.
- Ejecucion en CPU y GPU tras reconstruir la topologia comprimida con `neuralops.core.compression_pipeline.compress_model`.
- Carga de pesos con `strict=False`, lo que permite reutilizar el esqueleto `BertForSequenceClassification` de Hugging Face.
- No soporta generacion de texto, tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo "thinking".
- No se declaran capacidades multilingues: solo ingles.

## Casos de uso

- Analisis de sentimiento en resenas de producto: el modelo clasifica polaridad positiva o negativa en resenas cortas en ingles, con un checkpoint de 130,5 MB que reduce coste de almacenamiento y memoria frente al BERT base original.
- Moderacion de comentarios en foros angloparlantes: filtrado previo de toxicidad o tono negativo como clasificador binario de bajo coste en pipelines de preprocesado.
- Monitorizacion de marca en redes sociales: clasificacion por lotes de menciones en ingles para alimentar dashboards de sentimiento, aprovechando la reduccion del 37,6% de parametros para desplegar en instancias mas pequenas.
- Etiquetado automatico de tickets de soporte: separar feedback negativo de positivo en colas de atencion al cliente antes de un enrutado mas fino.
- Investigacion en compresion de modelos: servir como punto de comparacion reproducible (rango k=256, ratio 1,602x, exactitud 80,39%) frente a otras tecnicas de pruning, SVD o cuantizacion sobre BERT SST-2.
- Prototipado en hardware de gama media: al caber en GPUs consumer y en CPU, permite validar pipelines de clasificacion en estaciones de trabajo sin GPU de datacenter.
- Educacion y demos: ejemplo practico de flujo compress-then-heal con LoRA, util para cursos o tutoriales sobre eficiencia de modelos.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index` de la model card (no verificados de forma independiente; `verified: false`):

| Modelo / configuracion | Dataset | Split | Metrica | Valor |
|---|---|---|---|---|
| bert-comp-residual-svd-compressor-sst2 (k=256) | GLUE SST-2 | validation | Accuracy | 80,39% |

Evaluacion multi-rango publicada por el autor sobre GLUE SST-2 validation (872 muestras), con baseline teacher en 91,63%:

| Rank (k) | Ratio fisico | Parametros comprimidos (reduccion) | Accuracy zero-shot | Accuracy con LoRA | Delta vs teacher (91,63%) |
|:---:|:---:|---:|---:|---:|---:|
| 256 | 1,60x | 68.343.554 (-37,6%) | 60,32% | 80,39% | -11,24% |
| 128 | 2,32x | 47.109.890 (-57,0%) | 52,75% | 77,52% | -14,11% |
| 64 | 3,00x | 36.493.058 (-66,7%) | 51,03% | 75,23% | -16,40% |
| 32 | 3,51x | 31.184.642 (-71,5%) | 51,15% | 71,33% | -20,30% |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks adicionales.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint comprimido ocupa 130,5 MB en disco; en FP32 en memoria ronda los 270 MB de pesos, mas activaciones y overhead del runtime. Cabe holgadamente en cualquier GPU consumer con 4 GB o mas.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM (RTX 3050, RTX 3060, RTX 4090, A100, H100); la evaluacion original se hizo en una RTX 3090 de 24 GB, pero el modelo no la requiere.
- Cabe en GPU consumer: si, sin problema, incluidas GPUs de gama de entrada y tambien en CPU.
- Opciones de despliegue: la model card solo documenta el flujo con la libreria `neuralops` mas `transformers` (`BertForSequenceClassification`). No se declara soporte oficial para vLLM, llama.cpp, Ollama ni TGI; al no ser un modelo generativo, esos runtimes no son el objetivo natural.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bert-comp-residual-svd-compressor-sst2 (k=256) | 68.343.554 | No disponible | 80,39% | MIT | Hugging Face (requiere NeuralOps) |
| google-bert/bert-base-uncased (teacher SST-2) | 109.483.778 | 512 tokens | 91,63% (baseline declarado por el autor) | Apache-2.0 | Hugging Face |
| DistilBERT-base-uncased-finetuned-sst-2 | ~66.000.000 | 512 tokens | No disponible en esta busqueda | Apache-2.0 | Hugging Face |

La comparativa con DistilBERT se incluye por proximidad de tamano, pero no se dispone de su exactitud SST-2 en la informacion proporcionada, por lo que la comparacion de rendimiento queda incompleta.

## Limitaciones y advertencias

- La exactitud declarada (80,39%) esta 11,24 puntos por debajo del baseline teacher (91,63%): la compresion tiene un coste claro en calidad.
- El resultado esta marcado como `verified: false` en el model-index; no ha sido reproducido de forma independiente.
- Solo soporta ingles; no hay evidencia de rendimiento en otros idiomas.
- Es un clasificador binario de sentimiento, no un modelo generativo: no sirve para chat, resumen, traduccion ni codigo.
- La carga requiere reconstruir la topologia con `compress_model` de NeuralOps antes de aplicar `load_state_dict`; no es un checkpoint plug-and-play con `transformers` a secas.
- Los pesos se distribuyen como `pytorch_model.bin` (pickle de PyTorch); conviene cargarlos con `torch.load` en entornos de confianza o revisar el fichero antes.
- Riesgo de sesgos heredados de `bert-base-uncased` y del dataset SST-2 (resenas de pelicula en ingles), que pueden no generalizar a otros dominios.
- Riesgo de alucinacion no aplica como tal al ser clasificacion, pero si existe riesgo de clasificaciones erroneas en textos fuera de dominio o con sarcasmo, negaciones complejas o jerga.
- Licencia MIT permite uso comercial, pero se recomienda validar el rendimiento en el dominio objetivo antes de produccion dado el delta de exactitud frente al teacher.
- La fecha de creacion del repositorio aparece como 2026-11-10, lo que puede indicar un error de metadatos o una fecha futura; conviene verificarlo antes de citarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-comp-residual-svd-compressor-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementacion del compresor: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/svd/residual_svd_compressor.py
- Licencia MIT del proyecto: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
