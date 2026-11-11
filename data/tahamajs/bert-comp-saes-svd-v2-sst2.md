# tahamajs/bert-comp-saes-svd-v2-sst2

## Resumen

`tahamajs/bert-comp-saes-svd-v2-sst2` es un checkpoint comprimido y posteriormente recuperado mediante LoRA de `google-bert/bert-base-uncased`, afinado para clasificacion de sentimiento en GLUE SST-2. Lo desarrolla Taha Majlesi dentro del proyecto NeuralOps, una libreria de compresion de modelos. El modelo aplica el operador `SAESSVDCompressorV2` (Spectrum-Aware Error-Suppressed Singular Value Decomposition) con rango `k=128`, reduciendo el numero de parametros de 109.483.778 a 45.792.002, lo que supone un 58,17% de reduccion y una ratio de compresion fisica de 2,391x.

El interes del modelo es fundamentalmente metodologico: demuestra un flujo de compresion por SVD de bajo rango seguido de un "healing" con LoRA de rango 8 para recuperar precision tras la perdida inicial. El checkpoint serializado corresponde al rango `k=128` y alcanza un 73,51% de accuracy en la validacion de SST-2, frente al 91,63% del modelo profesor sin comprimir, es decir, una perdida de paridad de 18,12 puntos.

Es un modelo pequeno (87,5 MB de pesos), orientado a clasificacion binaria de sentimiento en ingles, con licencia MIT y pensado como pieza de un zoo de modelos comprimidos para experimentacion con tecnicas de compresion, no como modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT-base (transformer encoder, 12 capas, dimension oculta D=768) comprimido con SAES-SVD v2 |
| Parametros totales | 45.792.002 (comprimido); base original 109.483.778 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de bert-base-uncased; no declarada en la model card) |
| Tipos de cuantizacion | no disponible (el checkpoint se distribuye en `pytorch_model.bin`, sin variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`pytorch_model.bin`), con `config.json`, `compression_summary.json` y assets del tokenizer `bert-base-uncased` |

## Arquitectura y entrenamiento

La arquitectura de partida es BERT-base uncased: 12 capas de transformer encoder con 768 dimensiones ocultas, preentrenado por Google y afinado en GLUE SST-2. Sobre ese modelo, NeuralOps aplica `SAESSVDCompressorV2`, que descompone las matrices de pesos en factores de bajo rango seleccionando un rango `k` dentro de una evaluacion Pareto multi-rango (`k=256, 128, 64, 32`). El checkpoint publicado corresponde a `k=128`.

Cuando la compresion zero-shot degrada la accuracy en mas de 2,0 puntos con una reduccion superior a 1,10x, el pipeline aplica un healing con LoRA de rango `r=8` durante 50 pasos con learning rate 2e-4 y un presupuesto de 45 segundos. Los adaptadores LoRA quedan integrados en el state dict serializado. La evaluacion se realizo fisicamente en una NVIDIA GeForce RTX 3090 de 24 GB sobre las 872 muestras de validacion de GLUE SST-2. No se dispone de informacion sobre volumen de datos de preentrenamiento adicional ni sobre el uso de RLHF/DPO, que no aplican a este tipo de tarea.

## Capacidades

- Clasificacion binaria de sentimiento (negativo/positivo) en ingles, salida de 2 etiquetas.
- Inferencia sobre entradas de texto tokenizadas con el vocabulario estandar `bert-base-uncased`.
- Compresion fisica del modelo con ratio 2,391x y reduccion de parametros del 58,17%, util para despliegues con restricciones de memoria.
- Recuperacion de precision mediante adaptadores LoRA integrados en los pesos.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues: solo ingles.
- No dispone de modo thinking, vision ni audio.
- Telemetria de compresion legible por maquina en `compression_summary.json` para los rangos 256, 128, 64 y 32.

## Casos de uso

- Clasificacion de sentimiento a escala en pipelines de analisis de resenas: el modelo procesa texto en ingles y devuelve una etiqueta binaria con un coste de memoria muy inferior al BERT-base original, adecuado para lotes grandes en CPU o GPU modestas.
- Filtrado previo de contenido en herramientas de moderacion: clasificar polaridad de comentarios antes de pasarlos a modelos mayores reduce el coste computacional del pipeline.
- Experimentacion con tecnicas de compresion: sirve como referencia reproducible para comparar SAES-SVD v2 con otras tecnicas (destilacion, pruning, quantizacion) sobre una tarea estandar como SST-2.
- Ensenanza e investigacion en eficiencia de modelos: el par profesor/alumno (91,63% frente a 73,51%) y la tabla Pareto multi-rango permiten estudiar el compromiso entre ratio de compresion y precision.
- Despliegue en entornos con VRAM limitada: con 87,5 MB de pesos, el checkpoint cabe en GPUs consumer de gama baja y en dispositivos edge, aunque la perdida de accuracy debe evaluarse por caso.
- Analisis de opinion en redes sociales o encuestas: clasificacion rapida de respuestas abiertas en ingles dentro de dashboards o informes automatizados.
- Baseline para benchmarking interno: punto de partida comprimido frente al que medir mejoras de futuras versiones del compresor o de estrategias de healing.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Rank (k) | Ratio fisico | Parametros comprimidos (reduccion) | Accuracy zero-shot | Accuracy con LoRA | Paridad vs profesor (91,63%) |
|:---:|:---:|---:|---:|---:|---:|
| 256 | 1,63x | 67.034.882 (-38,8%) | 59,52% | 72,94% | -18,69% |
| 128 (checkpoint publicado) | 2,39x | 45.792.002 (-58,2%) | 52,41% | 73,51% | -18,12% |
| 64 | 3,11x | 35.170.562 (-67,9%) | 51,38% | 68,81% | -22,82% |
| 32 | no disponible | no disponible | FAIL_CRASH | no disponible | no disponible |

Resultado oficial en el model-index: GLUE SST-2, split de validacion, accuracy 73,51% (no verificado). Profesor de referencia: 91,63%.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 87,5 MB en disco; en FP32 la inferencia requiere del orden de 200-300 MB de VRAM, aunque no se declara una cifra oficial en la model card.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; la evaluacion del autor se realizo en una RTX 3090 de 24 GB, pero es un modelo sobredimensionado para ese hardware.
- Cabe en GPU consumer: si, incluidas GTX 1650, RTX 3050, RTX 4060 y similares; tambien en CPU.
- Opciones de despliegue: la model card solo documenta el flujo con `transformers` (`BertForSequenceClassification`) mas `neuralops.core.compression_pipeline.compress_model` para reconstruir la topologia comprimida y cargar el state dict con `strict=False`. No se declaran integraciones con vLLM, llama.cpp, Ollama o TGI, ni variantes GGUF.
- Latencia y throughput: no disponibles. La unica cifra temporal publicada es el presupuesto de 45 segundos para el healing LoRA durante la compresion, no para inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 val accuracy | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tahamajs/bert-comp-saes-svd-v2-sst2 (k=128) | 45,79 M (comprimido) | no disponible | 73,51% | MIT | Hugging Face |
| google-bert/bert-base-uncased (profesor) | 109,48 M | 512 tokens (arquitectura BERT-base) | 91,63% (segun el autor) | Apache 2.0 | Hugging Face |
| tahamajs/bert-comp-saes-svd-v2-sst2 (k=64) | 35,17 M | no disponible | 68,81% | MIT | solo telemetria, no empaquetado |

La comparativa directa mas relevante es con el modelo profesor: el checkpoint comprimido pierde 18,12 puntos de accuracy a cambio de un 58,17% menos de parametros. Las variantes de rango 256 y 64 del mismo zoo no estan serializadas como checkpoints independientes, solo aparecen en `compression_summary.json`. No se dispone de datos sobre modelos comparables de terceros en la informacion proporcionada.

## Limitaciones y advertencias

- Perdida de accuracy significativa: 18,12 puntos por debajo del profesor (73,51% frente a 91,63%), lo que limita su uso en produccion donde se exija alta precision.
- El rango `k=32` fallo con `FAIL_CRASH` durante la evaluacion, lo que indica fragilidad del pipeline en ratios de compresion agresivos.
- Solo ingles: no soporta otros idiomas.
- Tarea restringida a clasificacion binaria de sentimiento; no es un modelo generativo ni de proposito general.
- Riesgo de sesgos heredados de `bert-base-uncased` y del dataset GLUE SST-2, no documentados ni mitigados en la model card.
- Riesgo de alucinacion no aplicable en sentido generativo, pero la clasificacion puede ser erronea en entradas ambiguas, sarcasticas o fuera de dominio.
- La carga requiere `load_state_dict(..., strict=False)` y la reconstruccion previa de la topologia con NeuralOps; no es un checkpoint plug-and-play con `transformers` sin la libreria.
- No se distribuyen variantes cuantizadas ni formatos GGUF, lo que limita el despliegue en ecosistemas como llama.cpp u Ollama.
- Los resultados del model-index estan marcados como no verificados; las cifras provienen del autor.
- Licencia MIT permite uso comercial, pero conviene verificar las condiciones del modelo base `bert-base-uncased` (Apache 2.0) y del dataset GLUE.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-comp-saes-svd-v2-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementacion del compresor: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/svd/saes_svd_v2.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset GLUE: https://huggingface.co/datasets/nyu-mll/glue
