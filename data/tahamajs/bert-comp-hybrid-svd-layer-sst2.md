# tahamajs/bert-comp-hybrid-svd-layer-sst2

## Resumen

`tahamajs/bert-comp-hybrid-svd-layer-sst2` es un checkpoint de BERT-Base comprimido físicamente mediante descomposición en valores singulares (SVD) y posteriormente "curado" con LoRA, publicado por Taha Majlesi dentro del proyecto NeuralOps. El modelo parte de `google-bert/bert-base-uncased` afinado en GLUE SST-2 (clasificación de sentimiento binaria en inglés) y aplica el compresor `hybrid_svd_layer` (`HybridSVDCompressor`) en el rango de Pareto `k=32`, reduciendo los parámetros de 109,48 M a 35,22 M (un 67,83 % menos) con una ratio de compresión física de 3,108x.

El interés del artefacto no reside en su calidad predictiva —la precisión en validación SST-2 cae al 69,61 %, frente al 91,63 % del modelo profesor— sino en su valor como referencia reproducible de un pipeline de compresión: el repositorio incluye telemetría completa para cuatro rangos (`k=256, 128, 64, 32`), resultados zero-shot y tras LoRA healing, y el state dict comprimido serializado. Es, por tanto, material de estudio para quienes investigan compresión de transformers, no un modelo listo para producción.

La relevancia actual es metodológica: demuestra empíricamente que el SVD por capas aplicado a BERT degrada gravemente la tarea downstream (caídas de 30-40 puntos en zero-shot) y que un healing LoRA ligero (`r=8`, 50 pasos, `lr=2e-4`) recupera parcialmente el rendimiento, aunque sin alcanzar la paridad con el profesor en ningún rango evaluado. El checkpoint se distribuye con licencia MIT y requiere la librería NeuralOps para reconstruir la topología comprimida antes de cargar los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-Base (12 capas, dimensión oculta D=768), comprimido con `HybridSVDCompressor` (`hybrid_svd_layer`) sobre capas Linear/Conv1D |
| Parametros totales | 35.222.334 (checkpoint comprimido en `k=32`); modelo base original: 109.483.778 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base BERT-Base admite 512 tokens, pero la model card no lo declara explícitamente) |
| Tipos de cuantizacion | No disponible (el repositorio distribuye pesos en `pytorch_model.bin`, sin variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict serializado de PyTorch), más `config.json`, `compression_summary.json` y assets del tokenizer `bert-base-uncased` |

## Arquitectura y entrenamiento

El modelo base es BERT-Base uncased: un transformer encoder de 12 capas con D=768 y cabeza de clasificación de secuencia sobre 2 etiquetas, afinado previamente en GLUE SST-2. Sobre esa arquitectura, NeuralOps aplica `HybridSVDCompressor`, un compresor basado en pesos que descompone las matrices de las capas Linear y Conv1D en factores de rango `k`. En el checkpoint publicado se usa `k=32`, lo que reduce el recuento de parámetros un 67,83 % y produce una ratio de compresión física de 3,108x. Los artefactos incluyen los factores de bajo rango y los adaptadores LoRA "horneados" en el state dict.

El proceso de evaluación y recuperación está documentado en la model card: se midió primero la precisión zero-shot tras comprimir y, cuando la caída superaba el 2,0 % con una reducción superior a 1,10x, se aplicó un healing LoRA con `r=8`, 50 pasos, `lr=2e-4` y un presupuesto de 45 segundos. Las evaluaciones se ejecutaron físicamente en una NVIDIA GeForce RTX 3090 (24 GB) sobre el split de validación de GLUE SST-2 (872 muestras). No se especifican en la información disponible el volumen de tokens de entrenamiento, la composición del dataset más allá de SST-2, ni si hubo RLHF/DPO (no procede en un clasificador).

## Capacidades

- Clasificación de sentimiento binaria (positivo/negativo) en inglés, sobre textos de una sola frase o párrafo corto, al estilo de SST-2.
- Inferencia de forward pass estándar de BERT con cabeza `BertForSequenceClassification` de 2 etiquetas.
- Carga mediante reconstrucción de topología comprimida con `compress_model` de NeuralOps y `load_state_dict(strict=False)`.
- No soporta tool calling ni function calling: es un clasificador, no un modelo generativo.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingües: no, únicamente inglés (vocabulario `bert-base-uncased`).
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Estudio de compresión de transformers: sirve como referencia reproducible para medir el impacto de SVD por capas en una tarea downstream concreta, comparando los cuatro rangos publicados (`k=256, 128, 64, 32`) con sus métricas zero-shot y tras LoRA healing.
- Docencia e investigación en eficiencia de modelos: útil para ilustrar el compromiso entre ratio de compresión y precisión, y para reproducir el pipeline de healing LoRA con presupuesto de 45 segundos en una RTX 3090.
- Baseline negativo en experimentos de destilación o pruning: su 69,61 % en SST-2 sirve como cota inferior frente a la que comparar técnicas de compresión más sofisticadas, dado el 91,63 % del profesor.
- Pruebas de integración de la librería NeuralOps: el repositorio incluye `compression_summary.json` y el snippet de reconstrucción, lo que permite validar el flujo `compress_model` + `load_state_dict` en CI.
- Clasificación de sentimiento de baja exigencia en entornos con restricciones de memoria: con 35,2 M de parámetros, el checkpoint ocupa ~67,3 MB en disco y puede ejecutarse en CPU para prototipos donde una precisión del ~70 % sea aceptable.
- Análisis de robustez de adaptadores LoRA: permite estudiar por qué `k=64` healed (50,92 %) rinde peor que `k=32` healed (69,61 %), un comportamiento anómalo que sugiere inestabilidad del healing y que resulta interesante como caso de estudio.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (`verified: false`). Evaluación sobre GLUE SST-2, split de validación (872 muestras), en RTX 3090.

| Rank (`k`) | Ratio fisico | Parametros comprimidos (reduccion) | Precision zero-shot | Precision tras LoRA | Paridad vs profesor (91,63 %) |
|:---:|:---:|---:|---:|---:|---:|
| 256 | 1,63x | 67.034.882 (-38,8 %) | 59,52 % | 68,58 % | -23,05 % |
| 128 | 2,39x | 45.792.002 (-58,2 %) | 52,41 % | 66,97 % | -24,66 % |
| 64 | 3,03x | 36.153.858 (-67,0 %) | 51,26 % | 50,92 % | -40,71 % |
| **32 (publicado)** | **3,11x** | **35.222.334 (-67,8 %)** | **50,92 %** | **69,61 %** | **-22,02 %** |

Referencia del modelo profesor (`google-bert/bert-base-uncased` afinado en SST-2): 91,63 % de precisión en validación. El checkpoint publicado obtiene 69,61 % de accuracy según el `model-index`.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para el checkpoint comprimido (35,2 M de parámetros ≈ 141 MB de pesos, más activaciones); el repositorio ocupa 0,1 GB en disco.
- GPU recomendadas: cualquiera con al menos 2 GB de VRAM; el autor evaluó en NVIDIA GeForce RTX 3090 (24 GB), pero es sobredimensionada para este modelo.
- Cabe holgadamente en GPU de consumo: GTX 1650, RTX 3060, RTX 4060, e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: requiere la librería NeuralOps (`neuralops.core.compression_pipeline`) para reconstruir la topología antes de cargar el state dict; no hay variantes GGUF ni soporte directo en llama.cpp, Ollama o vLLM sin conversión previa.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| `tahamajs/bert-comp-hybrid-svd-layer-sst2` (k=32) | 35,2 M (comprimido) | No disponible | 69,61 % | MIT | Hugging Face, requiere NeuralOps |
| `google-bert/bert-base-uncased` afinado en SST-2 (profesor) | 109,5 M | 512 tokens (modelo base) | 91,63 % (declarado por el autor) | Apache 2.0 (modelo base) | Hugging Face, transformers estándar |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66 M | 512 tokens | No disponible en la informacion proporcionada | Apache 2.0 | Hugging Face, transformers estándar |
| `textattack/bert-base-uncased-SST-2` | 109,5 M | 512 tokens | No disponible en la informacion proporcionada | No disponible | Hugging Face, transformers estándar |

La comparación cuantitativa con alternativas de la misma categoría (destilados y afinados estándar en SST-2) no puede completarse con los datos disponibles: solo se conoce la métrica del profesor declarada por el autor.

## Limitaciones y advertencias

- Precisión muy degradada: 69,61 % frente al 91,63 % del profesor, una caída de 22,02 puntos. No es apto para producción sin un análisis de coste/beneficio adicional.
- Comportamiento anómalo en `k=64`: el healing LoRA empeora el resultado zero-shot (51,26 % → 50,92 %), lo que indica inestabilidad del proceso de recuperación y resta fiabilidad a la metodología.
- Dependencia de la librería NeuralOps: no se puede cargar con `transformers` de forma directa; requiere reconstruir la topología comprimida con `compress_model` antes de `load_state_dict(strict=False)`.
- Solo inglés y solo clasificación de sentimiento binaria: no generaliza a otras tareas ni idiomas.
- Riesgo de sesgos heredados de BERT-Base uncased y de SST-2 (reseñas de cine), incluyendo sesgos de dominio y de registro lingüístico.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de clasificaciones erróneas sistemáticas en dominios alejados de SST-2.
- Longitud de contexto no declarada en la model card; se asume la del modelo base (512 tokens), pero no está confirmado para el checkpoint comprimido.
- Licencia MIT permite uso comercial, pero la calidad del modelo hace desaconsejable su uso en producción sin validación previa.
- Métricas no verificadas (`verified: false`): los resultados proceden del propio autor y no han sido replicados de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-comp-hybrid-svd-layer-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del compresor: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/svd/hybrid_svd_layer.py
- Licencia: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
