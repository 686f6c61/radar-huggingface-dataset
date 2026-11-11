# tahamajs/bert-comp-direct-svd-sst2

## Resumen

`tahamajs/bert-comp-direct-svd-sst2` es un checkpoint de BERT-Base (`google-bert/bert-base-uncased`) comprimido mediante factorización SVD truncada de bajo rango y posteriormente "curado" con LoRA, publicado por Taha Majlesi dentro del proyecto NeuralOps Compressor Zoo. El objetivo del modelo no es ofrecer un clasificador de sentimiento listo para producción, sino servir como artefacto de referencia reproducible para estudiar el compromiso entre ratio de compresión y degradación de precisión en el ajuste fino de GLUE SST-2. Se distribuye a rango `k=32`, con un ratio de compresión físico de 3,67x y una reducción de parámetros del 72,7 % (de 109,48 M a 29,86 M).

La arquitectura subyacente es un transformer encoder BERT-Base de 12 capas y dimensión oculta 768, con una cabeza de clasificación binaria para sentimiento. La compresión se aplica sustituyendo capas lineales por factores de bajo rango mediante el operador `DirectSVDCompressor` de la librería NeuralOps, y tras la compresión se aplica un proceso de *healing* con LoRA (`r=8`, 50 pasos, `lr=2e-4`, presupuesto de 45 s) cuando la caída de precisión supera el 2,0 % con una reducción mayor de 1,10x.

Es relevante ahora porque ejemplifica una tendencia práctica: publicar no solo modelos finales, sino también *checkpoints intermedios de compresión* con telemetría completa (`compression_summary.json`) para que otros investigadores puedan reproducir y comparar técnicas de compresión. Su precisión final en SST-2 (50,92 %) está muy por debajo del profesor (91,63 %), por lo que debe interpretarse como material de investigación, no como modelo desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-Base (12 capas, D=768), comprimido con SVD truncada de bajo rango |
| Parametros totales | 29.859.842 (comprimido, rango k=32) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (BERT-Base original: 512 tokens) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict serializado de PyTorch) |

## Arquitectura y entrenamiento

El modelo parte de `google-bert/bert-base-uncased` (109.483.778 parametros, 12 capas, dimension oculta 768), ajustado previamente en GLUE SST-2 con una precision de referencia del 91,63 % (profesor). Sobre esa base se aplica el operador `DirectSVDCompressor`, registrado como `direct_svd` en la libreria NeuralOps, que reemplaza capas lineales por factorizaciones SVD truncadas de rango `k`. El checkpoint publicado corresponde a `k=32`, con 29.859.842 parametros tras la compresion (-72,73 %, ratio fisico 3,667x).

El pipeline de compresion evalua cuatro rangos (`k=256, 128, 64, 32`) sobre la particion de validacion de GLUE SST-2 (872 muestras) en una NVIDIA RTX 3090 (24 GB). Cuando la caida *zero-shot* supera el 2,0 % de precision y la reduccion es mayor de 1,10x, se activa un *healing* LoRA con `r=8`, 50 pasos, `lr=2e-4` y un presupuesto de 45 s. En el rango publicado (`k=32`), la precision *zero-shot* fue 52,06 % y tras el *healing* LoRA quedo en 50,92 %. No se especifican en la informacion disponible los detalles del dataset de preentrenamiento original, la composicion del corpus ni si hubo RLHF/DPO (no aplica a un encoder de clasificacion).

## Capacidades

- Clasificacion binaria de sentimiento (negativo/positivo) sobre texto en ingles, con dos etiquetas de salida.
- Razonamiento linguistico basico heredado de BERT-Base: representaciones contextuales de 768 dimensiones y 12 capas.
- Ajuste fino sobre GLUE SST-2 (particion de validacion, 872 muestras).
- No soporta *tool calling* ni *function calling* (es un encoder de clasificacion, no un modelo generativo).
- No soporta agentes ni razonamiento multi-paso.
- Capacidad multilingue limitada al ingles (`en`), segun la model card.
- No dispone de modo *thinking*, vision ni audio.
- Sirve como artefacto reproducible para estudiar tecnicas de compresion SVD + LoRA en encoders.

## Casos de uso

- **Investigacion en compresion de modelos**: usar el checkpoint como referencia reproducible para comparar `direct_svd` frente a otras tecnicas (podado, cuantizacion, destilacion) sobre el mismo *baseline* BERT-Base y el mismo *split* de SST-2.
- **Validacion de pipelines NeuralOps**: el modelo permite verificar la reconstruccion del grafo comprimido (`compress_model` + `load_state_dict`) en entornos de integracion continua antes de aplicar la tecnica a modelos mayores.
- **Docencia y divulgacion**: ilustra de forma tangible el compromiso entre ratio de compresion (3,67x) y precision (50,92 % frente a 91,63 % del profesor) con numeros medibles y telemetria completa.
- **Benchmark de infraestructura de inferencia**: al tener solo 29,86 M de parametros y un checkpoint de 57,1 MB, es util para medir latencia y *throughput* de *runtimes* (PyTorch, ONNX Runtime, etc.) en hardware modesto sin cargar modelos grandes.
- **Pruebas de integracion de clasificadores**: sirve para validar *endpoints* de `text-classification` en Hugging Face Inference o en servidores propios con un modelo pequeno y licencia permisiva (MIT).
- **Estudio de LoRA healing**: el `compression_summary.json` incluye telemetria de los cuatro rangos evaluados, lo que permite analizar cuando el *healing* LoRA recupera o degrada precision (en `k=256` paso de 57,00 % a 50,92 %; en `k=32` de 52,06 % a 50,92 %).
- **Reproducibilidad de artefactos**: util para auditar la cadena de custodia de un checkpoint comprimido (config, tokenizer, state dict y resumen de compresion).

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`):

| Metrica | Dataset | Split | Valor |
|---|---|---|---|
| Accuracy | GLUE SST-2 | validation | 50,92 % |

Evaluacion multi-rango declarada por el autor (RTX 3090, 24 GB, 872 muestras):

| Rango (`k`) | Ratio fisico | Parametros comprimidos (reduccion) | Accuracy zero-shot | Accuracy tras LoRA | Paridad vs profesor (91,63 %) |
|:---:|:---:|---:|---:|---:|---:|
| 256 | 1,63x | 67.034.882 (-38,8 %) | 57,00 % | 50,92 % (LoRA) | -40,71 % |
| 128 | 2,39x | 45.792.002 (-58,2 %) | 53,67 % | 50,69 % (LoRA) | -40,94 % |
| 64 | 3,11x | 35.170.562 (-67,9 %) | 50,92 % | 50,92 % (LoRA) | -40,71 % |
| 32 (publicado) | 3,67x | 29.859.842 (-72,7 %) | 52,06 % | 50,92 % (LoRA) | -40,71 % |

No se han publicado en la informacion disponible resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros).

## Requisitos de hardware

- **VRAM estimada para inferencia**: el checkpoint pesa 57,1 MB en `pytorch_model.bin`; en FP32 ocupa aproximadamente 120 MB de pesos (29,86 M de parametros x 4 bytes). La VRAM total depende del *batch size* y de la longitud de secuencia, pero con `batch_size=1` y secuencias cortas cabe holgadamente en cualquier GPU consumer.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM; el autor evaluo en una NVIDIA RTX 3090 (24 GB), pero el modelo es sobredimensionado para ese hardware.
- **Cabe en GPU consumer**: si, en practicamente cualquier GPU consumer moderna (GTX 1650, RTX 3060, RTX 4090) e incluso en CPU.
- **Opciones de despliegue**: el autor documenta reconstruccion via `neuralops.core.compression_pipeline.compress_model` + `transformers.BertForSequenceClassification`. No se especifican en la informacion disponible integraciones con vLLM, llama.cpp, Ollama o TGI; al ser un encoder de clasificacion, vLLM y llama.cpp no son opciones naturales.
- **Latencia y throughput**: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| `tahamajs/bert-comp-direct-svd-sst2` (k=32) | 29,86 M | No disponible | 50,92 % | MIT | Hugging Face (0 descargas) |
| `google-bert/bert-base-uncased` (profesor) | 109,48 M | 512 tokens | 91,63 % (declarado) | Apache 2.0 | Hugging Face |
| DistilBERT-base (referencia de compresion) | ~66 M | 512 tokens | No disponible en la informacion | Apache 2.0 | Hugging Face |

El checkpoint comprimido reduce el numero de parametros en 3,67x respecto al profesor, pero pierde 40,71 puntos de accuracy en SST-2. Para comparar con alternativas de compresion (destilacion, podado) seria necesario disponer de sus resultados en el mismo *split* y con el mismo protocolo, datos que no se incluyen en la informacion proporcionada.

## Limitaciones y advertencias

- **Precision muy degradada**: 50,92 % en SST-2 frente al 91,63 % del profesor; en la practica equivale a un clasificador binario casi aleatorio (el 50 % seria el azar en un problema balanceado).
- **Riesgo de alucinacion**: no aplica en sentido estricto (es un clasificador, no un generador), pero la calibracion de probabilidades es dudosa dada la baja precision.
- **Idioma**: solo ingles (`en`); no se ha validado en castellano ni en otros idiomas.
- **Contexto**: la model card no especifica la longitud maxima de contexto del checkpoint comprimido; el BERT-Base original soporta 512 tokens, pero no se confirma que la compresion lo preserve.
- **Uso comercial**: la licencia MIT permite uso comercial, pero la degradacion de precision hace desaconsejable su uso en produccion.
- **Reproducibilidad**: la carga requiere reconstruir primero la topologia comprimida con `neuralops` y luego cargar el `state_dict` con `strict=False`; un `from_pretrained` directo sobre el checkpoint no funcionaria sin ese paso previo.
- **Verificacion**: el resultado de accuracy esta marcado como `verified: false` en la model card; no hay validacion independiente.
- **Madurez**: 0 descargas y 0 *likes* en el momento de la consulta; el modelo es un artefacto de investigacion reciente (creado en noviembre de 2026) sin adopcion comunitaria.
- **Sesgos**: no se documentan analisis de sesgo; al derivar de BERT-Base, hereda los sesgos del corpus original (BooksCorpus + Wikipedia en ingles).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-comp-direct-svd-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Libreria NeuralOps (GitHub): https://github.com/tahamajs/NeuralOps
- Implementacion `DirectSVDCompressor`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/svd/direct_svd.py
- Licencia MIT del proyecto: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
