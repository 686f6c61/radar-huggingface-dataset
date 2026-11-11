# tahamajs/bert-comp-admm-pruner-sst2

## Resumen

`tahamajs/bert-comp-admm-pruner-sst2` es un checkpoint de `google-bert/bert-base-uncased` fine-tuneado en GLUE SST-2 (clasificación binaria de sentimiento en inglés) y procesado con el motor de compresión `ADMMPruner` de la librería NeuralOps, desarrollada por Taha Majlesi. El modelo se publica como parte de un "compressor zoo" que evalúa distintos rangos de compresión (`k=256, 128, 64, 32`) sobre una arquitectura BERT-Base de 12 capas y dimensión oculta 768.

El interés de esta ficha no reside en el rendimiento del modelo (muy degradado respecto al profesor), sino en que documenta de forma reproducible un pipeline de poda ADMM con destilación de reconstrucción por capas, sparsity semi-estructurada 2:4 y gradientes STE, junto con un mecanismo de "LoRA healing" que se activa automáticamente cuando la compresión degrada la precisión. Es un artefacto de investigación sobre compresión de modelos, no un clasificador listo para producción.

El checkpoint serializado corresponde al rango `k=32`, con una ratio de compresión física declarada de `1.00x` (0,0 % de reducción de parámetros) y una precisión en validación SST-2 del 52,52 % frente al 91,63 % del modelo profesor, lo que supone una caída de 39,11 puntos. El repositorio ocupa 0,2 GB y los pesos se distribuyen en formato `pytorch_model.bin`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-Base (12 capas, dimensión oculta 768), con poda ADMM aplicada |
| Parametros totales | 109.483.778 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (límite estándar de BERT-Base; no se explicita en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (PyTorch state dict serializado), más `config.json`, `compression_summary.json` y assets del tokenizador `bert-base-uncased` |

## Arquitectura y entrenamiento

El modelo parte de `google-bert/bert-base-uncased`, un transformer encoder de 12 capas y 768 dimensiones ocultas con 109.483.778 parámetros, fine-tuneado previamente sobre GLUE SST-2. Sobre esa base se aplica `ADMMPruner`, un motor de poda basado en el método de direcciones alternantes (ADMM) que incorpora destilación de reconstrucción por capas, sparsity semi-estructurada 2:4, gradientes con estimador recto (STE) y planificación dinámica del parámetro `rho`. La implementación de referencia está en `neuralops/compression/pruning/admm_pruner.py`.

La evaluación se realizó físicamente sobre una NVIDIA GeForce RTX 3090 (24 GB) con el split de validación de GLUE SST-2 (872 muestras). La política de NeuralOps activa un "LoRA healing" con `r=8`, 50 pasos, `lr=2e-4` y un presupuesto de 45 segundos cuando la compresión zero-shot degrada la precisión más de 2,0 puntos con una reducción superior a 1,10x. En este checkpoint concreto (`k=32`) el healing no se aplicó (`LoRA Recovery Applied: False`) y la ratio de compresión física resultó ser `1.00x`, es decir, no se eliminaron parámetros. No se detalla en la información disponible el volumen de tokens de entrenamiento ni la composición exacta del dataset más allá de GLUE SST-2.

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) sobre texto en inglés, con dos etiquetas de salida (`num_labels=2`).
- Inferencia estándar de un encoder BERT: representaciones contextuales de tokens y secuencia.
- No soporta tool calling ni function calling.
- No incorpora capacidades de agente ni razonamiento multi-paso.
- Multilingüismo limitado al inglés (vocabulario `bert-base-uncased`).
- No dispone de modo "thinking", visión, audio ni generación de texto libre.
- Reconstrucción programática del grafo comprimido mediante `compress_model` de NeuralOps antes de cargar el state dict.

## Casos de uso

- Investigación sobre compresión de modelos: sirve como referencia reproducible para comparar el efecto de distintos rangos ADMM (`k=256, 128, 64, 32`) sobre la precisión downstream de un mismo modelo base.
- Validación de pipelines de poda: permite comprobar la integración de `ADMMPruner` con `compress_model` y el flujo de reconstrucción de topología antes de cargar pesos comprimidos.
- Estudio del mecanismo de LoRA healing: útil para analizar cuándo se dispara el healing (caída > 2,0 % con reducción > 1,10x) y por qué en este checkpoint no llegó a activarse.
- Benchmark de infraestructura de inferencia: al ser un modelo pequeño (0,2 GB), se puede desplegar en CPU o GPU consumer para probar latencias y throughput de clasificación de sentimiento a pequeña escala.
- Docencia y experimentación con sparsity 2:4: permite inspeccionar el efecto de la sparsity semi-estructurada en un transformer estándar.
- Test de integración de la librería NeuralOps en pipelines propios: el snippet de la model card muestra el flujo completo de descarga, reconstrucción y predicción.
- No es adecuado como clasificador de sentimiento en producción dado su 52,52 % de precisión (prácticamente equivalente a azar en una tarea binaria).

## Benchmarks y rendimiento

Resultados declarados por el autor en la model-index (no verificados):

| Modelo / rango | Ratio físico | Params comprimidos | Acc zero-shot SST-2 | Acc tras healing | Paridad vs profesor (91,63 %) |
|---|---:|---:|---:|---:|---:|
| Profesor (BERT-Base fine-tuneado) | 1,00x | 109.483.778 | 91,63 % | — | — |
| `k=256` | 1,00x | 109.483.778 (-0,0 %) | 51,38 % | 51,38 % | -40,25 % |
| `k=128` | 1,00x | 109.483.778 (-0,0 %) | 51,03 % | 51,03 % | -40,60 % |
| `k=64` | 1,00x | 109.483.778 (-0,0 %) | 50,92 % | 50,92 % | -40,71 % |
| `k=32` (checkpoint publicado) | 1,00x | 109.483.778 (-0,0 %) | 52,52 % | 52,52 % | -39,11 % |

Evaluación sobre el split de validación de GLUE SST-2 (872 muestras) en RTX 3090. No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (109,5 M de parámetros, ~438 MB de pesos) y ~0,2 GB en el repositorio serializado.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; la evaluación oficial se hizo en RTX 3090, pero el modelo cabe holgadamente en GTX 1650, RTX 3050, RTX 4090, A100 o H100.
- Cabe en GPU consumer sin problemas e incluso en CPU para inferencia de baja concurrencia.
- Opciones de despliegue: PyTorch nativo con `transformers` + `neuralops` (flujo documentado); al ser un state dict estándar de BERT, es compatible con ONNX Runtime y TorchScript tras exportación. No se documenta soporte directo para vLLM, llama.cpp, Ollama o TGI (estos últimos orientados a modelos generativos).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Params | Contexto | Acc SST-2 | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| `tahamajs/bert-comp-admm-pruner-sst2` (k=32) | 109,5 M | 512 | 52,52 % | MIT | Hugging Face |
| `google-bert/bert-base-uncased` (profesor SST-2) | 109,5 M | 512 | 91,63 % | Apache 2.0 | Hugging Face |
| `textattack/bert-base-uncased-SST-2` | 109,5 M | 512 | ~92 % (referencia habitual en la comunidad) | Apache 2.0 | Hugging Face |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66 M | 512 | ~91 % (referencia habitual) | Apache 2.0 | Hugging Face |

La comparativa evidencia que el checkpoint comprimido no aporta reducción de parámetros (1,00x) y pierde casi 40 puntos de precisión frente a alternativas no comprimidas del mismo tamaño o menores.

## Limitaciones y advertencias

- Precisión de 52,52 % en SST-2: en una tarea binaria esto equivale prácticamente a clasificación aleatoria; no debe usarse como clasificador de sentimiento real.
- La ratio de compresión declarada es 1,00x, por lo que el checkpoint no ofrece ninguna ventaja de tamaño frente al modelo base.
- El "LoRA healing" no se aplicó en este checkpoint, pese a que la caída de precisión supera ampliamente el umbral de activación (2,0 puntos).
- Solo soporta inglés; no hay evaluación multilingüe.
- Riesgo elevado de predicciones erróneas y de comportamiento inconsistente por la degradación de los pesos.
- Licencia MIT: permite uso comercial, pero el estado del modelo hace inviable su uso en producción.
- Requiere reconstruir la topología comprimida con `compress_model` antes de cargar el state dict (`strict=False`), lo que añade dependencia de la librería NeuralOps y riesgo de desalineación de pesos.
- No hay datos publicados sobre sesgos específicos, latencia ni throughput.
- El modelo base subyacente (`bert-base-uncased`) hereda sesgos de su corpus de entrenamiento original (BookCorpus + Wikipedia en inglés).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-comp-admm-pruner-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación de `ADMMPruner`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/pruning/admm_pruner.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
