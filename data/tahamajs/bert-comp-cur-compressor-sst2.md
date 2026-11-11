# tahamajs/bert-comp-cur-compressor-sst2

## Resumen

`bert-comp-cur-compressor-sst2` es un checkpoint de BERT-Base comprimido físicamente mediante la técnica CURCompressor de la librería NeuralOps y posteriormente "curado" con LoRA, desarrollado por Taha Majlesi (tahamajs). El modelo parte de `google-bert/bert-base-uncased` afinado en GLUE SST-2 (clasificación de sentimiento binaria en inglés) y aplica una descomposición CUR con muestreo por leverage score o por energía para sustituir las capas Linear y Conv1D, reduciendo el número de parámetros de 109,48 M a 46,96 M (ratio de compresión físico de 2,33x, -57,1 % de parámetros).

El checkpoint publicado corresponde al rango `k=128`, seleccionado como punto Pareto dentro de una evaluación multi-rango (k=256, 128, 64, 32). La compresión zero-shot degrada fuertemente la precisión, por lo que NeuralOps aplica un "healing" con LoRA de rango 8 (50 pasos, lr=2e-4, presupuesto de 45 s) que recupera parcialmente el rendimiento hasta un 72,48 % de accuracy en la validación de SST-2, frente al 91,63 % del modelo profesor original.

El interés del modelo es fundamentalmente metodológico y de investigación: sirve como artefacto reproducible para estudiar el compromiso entre compresión física, recuperación con adaptadores de bajo rango y degradación de precisión en tareas de clasificación. No está pensado como sustituto de producción de BERT-Base, dado el delta de paridad de -19,15 puntos porcentuales respecto al profesor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-Base) con capas Linear/Conv1D sustituidas por descomposición CUR |
| Parametros totales | 46.962.434 (comprimido, k=128); profesor original: 109.483.778 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (BERT-Base estandar: 512 tokens) |
| Tipos de cuantizacion | no disponible; el checkpoint se distribuye en `pytorch_model.bin` (float32 por defecto) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`pytorch_model.bin`), requiere reconstruccion de topologia NeuralOps para carga |

## Arquitectura y entrenamiento

El modelo base es BERT-Base uncased: 12 capas, dimensión oculta D=768, 109.483.778 parámetros, preentrenado por Google y afinado sobre GLUE SST-2. Sobre ese checkpoint, NeuralOps aplica `CURCompressor`, un operador de compresión de bajo rango que reemplaza las capas Linear y Conv1D por una descomposición CUR, seleccionando columnas y filas mediante leverage score sampling o energy sampling. El resultado es una topología comprimida físicamente (no una máscara dispersa), con 46.962.434 parámetros en el rango k=128.

El pipeline de recuperación es relevante: cuando la compresión zero-shot degrada la accuracy más de 2,0 puntos con una reducción superior a 1,10x, NeuralOps activa un healing LoRA de rango 8 (50 pasos, lr=2e-4, 45 s de presupuesto) sobre el modelo comprimido. En k=128, el zero-shot cae al 50,92 % y el healing lo eleva al 72,48 %. El entrenamiento original de SST-2 y la composición exacta del dataset de afinado no se detallan en la información proporcionada; el dataset declarado es `nyu-mll/glue` (config `sst2`). La evaluación multi-rango se realizó físicamente en una NVIDIA GeForce RTX 3090 (24 GB) sobre el split de validación de SST-2 (872 muestras).

## Capacidades

- Clasificación de sentimiento binaria (positivo/negativo) en inglés sobre textos cortos, formato SST-2.
- Clasificación de texto genérica por secuencia (pipeline `text-classification`), con dos etiquetas de salida.
- Inferencia en CPU y GPU con pesos de ~90 MB, adecuada para entornos con recursos limitados.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un encoder clasificador, no un modelo generativo.
- No dispone de modo thinking, visión, audio ni capacidades multimodales.
- Capacidad multilingüe limitada al inglés (tokenizador `bert-base-uncased`).
- Sirve como artefacto de investigación para estudiar compresión CUR y recuperación LoRA.

## Casos de uso

- Investigación en compresión de modelos: permite reproducir el pipeline CURCompressor + LoRA healing sobre BERT-Base y comparar curvas de degradación por rango (k=256, 128, 64, 32) con el profesor original.
- Clasificación de sentimiento de bajo coste en entornos embebidos: con ~90 MB de pesos y 47 M de parámetros, puede desplegarse en CPU para filtrar reseñas o comentarios en inglés donde no se requiera alta precisión.
- Prototipado de pipelines de NLP: útil como clasificador rápido en fases de experimentación antes de sustituir por un modelo afinado completo.
- Docencia y divulgación: ejemplo tangible de descomposición CUR, leverage score sampling y adaptadores LoRA aplicados a un transformer estándar.
- Benchmarking de infraestructura de compresión: el `compression_summary.json` incluido permite auditar telemetría multi-rango y validar implementaciones propias de CUR.
- Estudio de robustez post-compresión: analizar qué tipos de ejemplos degradan más la accuracy tras la descomposición y el healing, comparando contra el profesor del 91,63 %.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Rank (k) | Ratio fisico | Parametros comprimidos (reduccion) | Accuracy zero-shot | Accuracy con LoRA | Paridad vs profesor (91.63%) |
|:---:|:---:|---:|---:|---:|---:|
| 256 | 1.53x | 71.735.042 (-34.5%) | 56.54% | 49.08% | -42.55% |
| 128 (publicado) | 2.33x | 46.962.434 (-57.1%) | 50.92% | 72.48% | -19.15% |
| 64 | 3.09x | 35.460.866 (-67.6%) | 49.31% | 49.08% | -42.55% |
| 32 | 3.66x | 29.931.266 (-72.7%) | 49.08% | 50.92% | -40.71% |

Evaluación sobre GLUE SST-2 validation split (872 muestras) en NVIDIA GeForce RTX 3090. El profesor `google-bert/bert-base-uncased` afinado alcanza 91,63 % de accuracy. El checkpoint publicado (k=128) obtiene 72,48 % con LoRA healing.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (~188 MB de pesos + activaciones para secuencias cortas); holgado en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (RTX 3050, RTX 3060, RTX 4090, A100, H100). La evaluación del autor se realizó en RTX 3090.
- Cabe en GPU consumer sin problema; también ejecutable en CPU con latencias de milisegundos para textos cortos.
- Opciones de despliegue: PyTorch nativo con reconstrucción de topología NeuralOps; no se garantiza compatibilidad directa con vLLM, llama.cpp, Ollama o TGI, ya que el checkpoint requiere `compress_model` de NeuralOps antes de cargar el state dict.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 val | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| `tahamajs/bert-comp-cur-compressor-sst2` (k=128) | 46.96 M | no disponible | 72.48% | MIT | Hugging Face (requiere NeuralOps) |
| `google-bert/bert-base-uncased` afinado SST-2 (profesor) | 109.48 M | 512 | 91.63% | Apache 2.0 | Hugging Face |
| `distilbert-base-uncased` afinado SST-2 | 66 M | 512 | no disponible en esta ficha | Apache 2.0 | Hugging Face |
| `textattack/bert-base-uncased-SST-2` | 109.48 M | 512 | ~92% (referencia habitual) | Apache 2.0 | Hugging Face |

La comparación con DistilBERT y con checkpoints SST-2 estándar se ofrece como referencia de categoría; los valores exactos de esos modelos no se han verificado en la información proporcionada.

## Limitaciones y advertencias

- Degradación severa de precisión: -19,15 puntos porcentuales respecto al profesor en el mejor caso (k=128 con LoRA); en otros rangos la caída supera los 40 puntos.
- El healing LoRA es inestable entre rangos: en k=256, 64 y 32 el resultado con LoRA es peor o igual que el zero-shot, lo que sugiere sobreajuste o colapso del adaptador.
- Requiere reconstruir la topología con `neuralops` y cargar el state dict con `strict=False`; no es un checkpoint plug-and-play con `transformers` estándar.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de clasificaciones erróneas sistemáticas en dominios distintos a SST-2 (reseñas de películas).
- Solo inglés; el tokenizador `bert-base-uncased` no cubre otros idiomas.
- Licencia MIT declarada, pero el código de NeuralOps se rige por la licencia del repositorio GitHub del autor; conviene revisarla antes de uso comercial.
- Sin descargas ni validación comunitaria (0 descargas, 0 likes en el momento de la consulta): no hay evidencia externa de reproducibilidad.
- No apto como sustituto de producción de un clasificador SST-2 afinado; su valor es principalmente metodológico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-comp-cur-compressor-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Implementación CURCompressor: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/low_rank/cur_compressor.py
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
