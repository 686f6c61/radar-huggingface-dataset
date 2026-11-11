# tahamajs/bert-comp-dobi-svd-sst2

## Resumen

`tahamajs/bert-comp-dobi-svd-sst2` es un checkpoint comprimido de `google-bert/bert-base-uncased` fine-tuneado para análisis de sentimiento binario sobre GLUE SST-2. Lo desarrolla Taha Majlesi dentro del proyecto NeuralOps, una librería orientada a compresión de modelos y recuperación mediante LoRA. El modelo aplica la técnica `dobi_svd` (descomposición en valores singulares con factorización de bajo rango) sobre los pesos del transformer original, reduciendo el número de parámetros de 109.483.778 a 35.170.562, lo que supone una compresión física de 3.113x y un ahorro del 67,88 % de parámetros.

El interés principal de esta ficha no reside en su rendimiento absoluto, sino en su valor como caso de estudio de compresión agresiva: el modelo conserva únicamente el 64,22 % de accuracy en validación de SST-2 frente al 91,63 % del profesor original, una pérdida de 27,41 puntos. Esto lo convierte en un ejemplo representativo de los compromisos entre tamaño y calidad en pipelines de despliegue con recursos limitados, más que en un candidato para producción real.

Se distribuye bajo licencia MIT, con pesos en formato PyTorch (`pytorch_model.bin`), y requiere la librería NeuralOps para reconstruir la topología comprimida antes de cargar el state dict. El repositorio ocupa aproximadamente 0,1 GB e incluye el tokenizador estándar de `bert-base-uncased`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-base), 12 capas, dimensión oculta D=768 |
| Parametros totales | 35.170.562 (comprimido desde 109.483.778) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (heredada de bert-base-uncased) |
| Tipos de cuantizacion | No disponible (el checkpoint usa factores de bajo rango, no cuantización declarada) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`pytorch_model.bin`) |
| Ratio de compresion | 3,113x (reducción del 67,88 % de parámetros) |
| Rank de compresion (k) | 64 |
| Modelo base | google-bert/bert-base-uncased |
| Libreria | neuralops |
| Tarea | Text classification (sentimiento binario) |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer encoder BERT-base estándar: 12 capas, 768 dimensiones ocultas y 12 cabezas de atención, con un máximo de 512 tokens de contexto. Sobre este modelo, el autor aplicó una compresión `dobi_svd` mediante la función `dobi_factory` de la familia SVD de NeuralOps. Esta técnica factoriza las matrices de pesos en componentes de bajo rango, reduciendo físicamente el número de parámetros almacenados. El checkpoint serializado en el repositorio corresponde al rank k=64, seleccionado como "showcase" dentro de una evaluación Pareto multi-rank que también cubre k=256, 128 y 32.

El proceso de recuperación incluye LoRA healing: cuando la compresión zero-shot degrada la accuracy en más de 2,0 puntos porcentuales con una reducción superior a 1,10x, NeuralOps aplica un ajuste LoRA dirigido con r=8, 50 pasos, learning rate 2e-4 y un presupuesto de 45 segundos. En el caso de k=64, el modelo comprimido sin healing alcanza un 51,38 % de accuracy en SST-2, y tras el healing sube a 64,22 %. La evaluación se realizó físicamente en una NVIDIA GeForce RTX 3090 (24 GB) sobre el split de validación de GLUE SST-2 (872 muestras). El profesor original (`bert-base-uncased` fine-tuneado en SST-2) sirve como baseline con un 91,63 % de accuracy.

## Capacidades

- Clasificación de sentimiento binario (positivo/negativo) sobre texto en inglés.
- Inferencia sobre secuencias de hasta 512 tokens.
- Compatible con el pipeline `text-classification` de Hugging Face.
- Reconstrucción mediante la API de NeuralOps (`compress_model` con `dobi_svd` y rank 64) más carga del state dict serializado.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-step.
- No dispone de modo thinking, visión, audio ni generación de texto libre.
- Capacidad multilingüe limitada al inglés, ya que hereda el vocabulario de `bert-base-uncased`.
- No se declaran capacidades de generación: es exclusivamente un clasificador de secuencias.

## Casos de uso

- Investigación en compresión de modelos: sirve como referencia reproducible para estudiar el impacto de SVD de bajo rango combinado con LoRA healing sobre un transformer encoder, con telemetría completa en `compression_summary.json` para los ranks 256, 128, 64 y 32.
- Despliegue en entornos con memoria muy restringida: con 35,17 M de parámetros, el checkpoint es adecuado para dispositivos edge o contenedores con límites estrictos de RAM, siempre que la pérdida de 27,41 puntos de accuracy respecto al profesor sea aceptable para la tarea.
- Clasificación de sentimiento en prototipos y demos: útil para validar pipelines de NLP en inglés donde no se requiere alta precisión y se prioriza el tamaño del artefacto (0,1 GB de repositorio).
- Benchmarking de técnicas de compresión: permite comparar `dobi_svd` frente a otras técnicas (cuantización, pruning, destilación) usando SST-2 como tarea de referencia con un baseline conocido del 91,63 %.
- Estudio de LoRA healing: el modelo documenta explícitamente la ganancia del healing (de 51,38 % a 64,22 % en k=64), lo que lo hace útil para investigar estrategias de recuperación post-compresión.
- Educación y experimentación: como ejemplo didáctico de cómo se serializa un modelo comprimido con factores de bajo rango y se reconstruye con `strict=False` en PyTorch.
- No se recomienda su uso en producción para análisis de sentimiento real, dado el bajo rendimiento absoluto (64,22 %).

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente). Evaluación sobre GLUE SST-2, split de validación (872 muestras), en NVIDIA GeForce RTX 3090.

| Rank (k) | Ratio fisico | Parametros comprimidos (reduccion) | Accuracy zero-shot | Accuracy tras LoRA healing | Delta vs profesor (91,63 %) |
|:---:|:---:|---:|---:|---:|---:|
| 256 | 2,39x | 45.792.002 (-58,2 %) | 52,41 % | 50,92 % (LoRA) | -40,71 % |
| 128 | 2,39x | 45.792.002 (-58,2 %) | 52,41 % | 50,92 % (LoRA) | -40,71 % |
| 64 | 3,11x | 35.170.562 (-67,9 %) | 51,38 % | 64,22 % (LoRA) | -27,41 % |
| 32 | 3,67x | 29.859.842 (-72,7 %) | 49,77 % | 65,83 % (LoRA) | -25,80 % |

El checkpoint serializado en el repositorio corresponde a k=64, con una accuracy final de 64,22 % en validación de SST-2. El baseline del profesor es 91,63 %.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32, dado que el modelo comprimido tiene 35,17 M de parámetros (aproximadamente 140 MB en FP32). El repositorio completo ocupa 0,1 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. La evaluación del autor se realizó en una NVIDIA GeForce RTX 3090 (24 GB), pero el modelo es sobradamente pequeño para GPUs consumer inferiores.
- Cabe en cualquier GPU consumer: GTX 1050 Ti, GTX 1650, RTX 3050, RTX 4060, etc. También es viable en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: requiere la librería NeuralOps para reconstruir la topología comprimida antes de cargar el state dict. No se declara compatibilidad directa con vLLM, llama.cpp, Ollama o TGI, ya que el checkpoint no está en formato GGUF ni sigue el flujo estándar de `from_pretrained` sin la fase de reconstrucción.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy SST-2 | Licencia | Formato |
|---|---|---|---|---|---|
| tahamajs/bert-comp-dobi-svd-sst2 (k=64) | 35,17 M | 512 | 64,22 % | MIT | PyTorch + NeuralOps |
| google-bert/bert-base-uncased (fine-tune SST-2, profesor) | 109,48 M | 512 | 91,63 % | Apache 2.0 | Safetensors / PyTorch |
| google-bert/bert-base-uncased (sin fine-tune) | 109,48 M | 512 | No disponible | Apache 2.0 | Safetensors / PyTorch |
| DistilBERT-base-uncased (fine-tune SST-2) | 66 M | 512 | No disponible en esta busqueda | Apache 2.0 | Safetensors / PyTorch |

La comparativa directa con DistilBERT u otros modelos comprimidos no puede completarse con los datos disponibles. El profesor original (`bert-base-uncased` fine-tuneado en SST-2) alcanza 91,63 % según la propia model card, lo que sitúa al modelo comprimido 27,41 puntos por debajo.

## Limitaciones y advertencias

- Rendimiento muy degradado: 64,22 % de accuracy en SST-2 frente al 91,63 % del profesor, una pérdida de 27,41 puntos. No es adecuado para producción real de análisis de sentimiento.
- El healing LoRA no recupera el rendimiento del profesor en ningún rank evaluado; el mejor resultado es 65,83 % en k=32, aún 25,80 puntos por debajo.
- Idiomas: únicamente inglés. No soporta castellano ni otros idiomas.
- Contexto limitado a 512 tokens, heredado de BERT-base.
- Dependencia de la librería NeuralOps: no se puede cargar con `transformers` de forma estándar; requiere reconstruir la topología con `compress_model` antes de aplicar `load_state_dict(strict=False)`.
- El checkpoint se distribuye como `pytorch_model.bin`, lo que implica cargar un pickle de PyTorch; se recomienda auditar el archivo antes de cargarlo en entornos no confiables.
- Licencia MIT: permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de copyright. No obstante, el uso comercial está desaconsejado por el bajo rendimiento.
- No hay resultados de benchmarks verificados de forma independiente; todos los datos provienen de la model card del autor.
- Riesgo de alucinación no aplica directamente al ser un clasificador, pero sí existe riesgo de clasificaciones erróneas sistemáticas en dominios distintos a SST-2.
- Sesgos: no se documentan análisis de sesgo en la información proporcionada. Al derivar de `bert-base-uncased`, puede heredar sesgos presentes en los corpus de preentrenamiento (Wikipedia y BookCorpus).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/bert-comp-dobi-svd-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Implementación dobi_svd: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/svd/dobi_svd.py
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset GLUE: https://huggingface.co/datasets/nyu-mll/glue
