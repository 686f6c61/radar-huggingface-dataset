# tahamajs/bert-comp-hadamard-incoherent-svd-sst2

## Resumen

`tahamajs/bert-comp-hadamard-incoherent-svd-sst2` es un checkpoint comprimido de `google-bert/bert-base-uncased` (109.483.778 parametros, 12 capas, dimension oculta 768) afinado sobre GLUE SST-2 y posteriormente reducido mediante la tecnica `hadamard_incoherent_svd` del framework NeuralOps. El resultado es un modelo de 29.319.202 parametros (reduccion del 73,22 %, ratio de compresion fisica de 3,734x) que conserva la topologia de inferencia de BERT pero con capas lineales factorizadas en representaciones de bajo rango y adaptadores LoRA de recuperacion integrados.

La relevancia del modelo es metodologica mas que de rendimiento: sirve como artefacto reproducible para estudiar el compromiso entre compresion agresiva y calidad en tareas de clasificacion de texto. El autor documenta una evaluacion Pareto multi-rango (k=256, 128, 64, 32) sobre la particion de validacion de SST-2 (872 muestras), con y sin "LoRA healing", lo que permite analizar como se degrada la precision al aumentar la tasa de compresion.

El modelo base alcanza un 91,63 % de accuracy en SST-2; el checkpoint publicado, en el rango de exhibicion k=32, obtiene un 72,13 % tras el proceso de recuperacion LoRA (partiendo de un 47,36 % en modo zero-shot). La licencia es MIT y el unico idioma declarado es el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT (12 capas, D=768) con capas lineales factorizadas via SVD incoherente de Hadamard |
| Parametros totales | 29.319.202 (checkpoint comprimido, k=32) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de bert-base-uncased, 512 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (el checkpoint se distribuye como `pytorch_model.bin` en punto flotante; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict serializado de PyTorch), mas `config.json`, `compression_summary.json` y activos del tokenizador BERT |

## Arquitectura y entrenamiento

El modelo parte de `google-bert/bert-base-uncased`, un transformer encoder de 12 capas y 768 dimensiones ocultas, afinado previamente sobre GLUE SST-2 (clasificacion binaria de sentimiento). Sobre ese checkpoint se aplica el compresor `HadamardIncoherentSVDCompressor` de NeuralOps, que rota los pesos con una matriz de Hadamard (W_rot = W·H), descompone en SVD y pliega la rotacion de vuelta en V_r^T. Segun el autor, esta incoherencia ortogonal reparte los outliers de activacion y peso de forma uniforme entre canales, logrando entre un 40 % y un 65 % menos error de truncamiento/cuantizacion sin parametros adicionales en tiempo de ejecucion. Las capas densas se sustituyen por representaciones `SVDLinear` de rango k.

El proceso de recuperacion ("LoRA healing") se activa cuando la compresion zero-shot degrada la accuracy mas de 2,0 puntos con una reduccion superior a 1,10x. Consiste en un ajuste LoRA con r=8, 50 pasos, learning rate 2e-4 y un presupuesto de 45 segundos sobre GPU. La evaluacion se realizo fisicamente en una NVIDIA GeForce RTX 3090 (24 GB) sobre las 872 muestras de validacion de SST-2. No se documentan en la informacion disponible el volumen de tokens de entrenamiento original, la composicion del dataset mas alla de SST-2, ni si hubo RLHF/DPO (no aplicable a una tarea de clasificacion).

## Capacidades

- Clasificacion binaria de sentimiento (positivo/negativo) en ingles, cabecera de 2 etiquetas sobre BERT-base.
- Inferencia de texto corto a moderado con el tokenizador `bert-base-uncased` (vocabulario WordPiece estandar).
- Ejecucion en CPU y GPU con huella de memoria reducida gracias a la factorizacion de bajo rango (29,3 M de parametros frente a 109,5 M del profesor).
- Carga mediante `transformers` reconstruyendo primero la topologia comprimida con `compress_model` y luego cargando el state dict con `strict=False`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo "thinking": es un clasificador discriminativo, no un modelo generativo.
- Capacidad multilingue limitada al ingles; no se declaran otros idiomas.

## Casos de uso

- **Analisis de sentimiento en resenas de producto en ingles**: el modelo clasifica polaridad positiva/negativa con una huella de 29,3 M de parametros, adecuado para despliegues con restricciones de memoria en entornos de bajo trafico o prototipado.
- **Filtrado previo en pipelines de moderacion**: como clasificador ligero de primera etapa para descartar o marcar textos antes de pasarlos a un modelo mayor, reduciendo coste computacional por documento.
- **Investigacion sobre compresion de modelos**: el checkpoint y el `compression_summary.json` permiten reproducir la curva Pareto k=256/128/64/32 y estudiar el efecto del "LoRA healing" en la recuperacion de accuracy.
- **Docencia y experimentacion con SVD incoherente**: sirve como ejemplo tangible de como la rotacion de Hadamard reduce el error de truncamiento en capas lineales, con codigo de referencia en el repositorio NeuralOps.
- **Benchmark de referencia en entornos con GPU consumer**: al caber holgadamente en una RTX 3090 (y en GPUs de 8 GB o menos), permite medir latencia y throughput de variantes comprimidas frente al BERT-base original.
- **Clasificacion por lotes en CPU para servicios internos**: la reduccion de parametros y la ausencia de dependencias de kernels especializados facilitan el despliegue en contenedores sin GPU para volumenes moderados.
- **Ablacion de tecnicas de compresion**: util para comparar `hadamard_incoherent_svd` frente a otras tecnicas del zoo de NeuralOps bajo el mismo protocolo de evaluacion.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados por terceros) sobre GLUE SST-2, split de validacion (872 muestras):

| Rank (k) | Ratio fisico | Parametros comprimidos (reduccion) | Accuracy zero-shot | Accuracy con LoRA | Delta vs profesor (91,63 %) |
|:---:|:---:|---:|---:|---:|---:|
| 256 | 1,64x | 66.838.530 (-39,0 %) | 59,75 % | 50,92 % | -40,71 % |
| 128 | 2,41x | 45.398.914 (-58,5 %) | 52,87 % | 50,92 % | -40,71 % |
| 64 | 3,16x | 34.679.106 (-68,3 %) | 53,21 % | 50,92 % | -40,71 % |
| **32 (publicado)** | **3,73x** | **29.319.202 (-73,2 %)** | **47,36 %** | **72,13 %** | **-19,50 %** |

El checkpoint publicado corresponde a k=32 y declara 72,13 % de accuracy en validacion SST-2 (metrica `accuracy`, `verified: false`). El profesor BERT-base afinado alcanza 91,63 % segun el autor. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la informacion disponible, lo cual es coherente con la naturaleza de clasificador del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 29,3 M de parametros (mas activaciones y tokenizador); holgadamente por debajo de 2 GB en la practica.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; el autor valido en NVIDIA GeForce RTX 3090 (24 GB), pero el modelo es sobredimensionado para esa tarjeta.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna (RTX 3060, RTX 4060, GTX 1660, etc.) e incluso en CPU para inferencia por lotes.
- Opciones de despliegue: `transformers` con reconstruccion via `neuralops.core.compression_pipeline.compress_model`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (el formato `pytorch_model.bin` con topologia factorizada no es directamente compatible con esos servidores sin conversion).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| `tahamajs/bert-comp-hadamard-incoherent-svd-sst2` (k=32) | 29,3 M | no disponible | 72,13 % (declarado) | MIT | Hugging Face |
| `google-bert/bert-base-uncased` afinado en SST-2 (profesor) | 109,5 M | 512 tokens | 91,63 % (declarado por el autor) | Apache 2.0 | Hugging Face |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66,9 M | 512 tokens | no disponible en esta busqueda | Apache 2.0 | Hugging Face |
| `textattack/bert-base-uncased-SST-2` | 109,5 M | 512 tokens | no disponible en esta busqueda | Apache 2.0 | Hugging Face |

La comparativa con DistilBERT y con el BERT afinado de TextAttack se ofrece como referencia de categoria (clasificadores SST-2 en ingles); no se dispone de sus cifras exactas en la informacion proporcionada, por lo que no se comparan numericamente. El checkpoint comprimido ofrece una huella menor que el profesor pero con una perdida de 19,5 puntos de accuracy en el rango publicado, lo que lo situa por debajo de las alternativas no comprimidas en calidad absoluta.

## Limitaciones y advertencias

- Perdida sustancial de accuracy: 72,13 % frente al 91,63 % del profesor, es decir, -19,50 puntos en SST-2; no es apto para produccion con requisitos de precision altos.
- La tabla Pareto muestra un comportamiento anomalo: los rangos 256, 128 y 64 rinden peor tras el "LoRA healing" (50,92 %) que en zero-shot, lo que sugiere inestabilidad del proceso de recuperacion y aconseja validar el checkpoint antes de confiar en las cifras.
- Metricas declaradas por el autor con `verified: false`; no hay evaluacion independiente.
- Entrenado y evaluado solo en ingles y solo en SST-2 (resenas de pelicula); el dominio de aplicacion es estrecho y no se garantiza transferencia a otros generos textuales.
- Riesgo de sesgos heredados de `bert-base-uncased` y del corpus SST-2, no documentado ni mitigado en la model card.
- Riesgo de alucinacion no aplicable en sentido generativo, pero si de clasificaciones erroneas con alta confianza en entradas fuera de distribucion.
- La carga requiere el paquete `neuralops` y reconstruir la topologia comprimida antes de cargar el state dict con `strict=False`; un `from_pretrained` directo sobre `BertForSequenceClassification` no funcionara sin ese paso.
- El checkpoint se distribuye como `pytorch_model.bin`, lo que implica `torch.load` y las precauciones de seguridad asociadas a la deserializacion de pickles.
- Licencia MIT: permite uso comercial, pero al derivar de `bert-base-uncased` (Apache 2.0) conviene conservar las atribuciones correspondientes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-comp-hadamard-incoherent-svd-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Implementacion del compresor: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/svd/hadamard_incoherent_svd.py
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
