# tahamajs/bert-comp-rotational-slicegpt-int4-sst2

## Resumen

`tahamajs/bert-comp-rotational-slicegpt-int4-sst2` es un checkpoint comprimido de `google-bert/bert-base-uncased` afinado para clasificación de sentimiento en GLUE SST-2, publicado por Taha Majlesi dentro del proyecto NeuralOps (Compressor Zoo). El modelo aplica el compresor híbrido `rotational_slicegpt_int4` (`RotationalSliceGPTINT4Compressor`), que combina rotaciones ortogonales al estilo SliceGPT con cuantización INT4 y un proceso de recuperación mediante LoRA ("LoRA healing"). El checkpoint serializado corresponde al rango `k=256`, con 24.549.122 parámetros físicos tras la compresión (reducción del 77,58 % y ratio de compresión de 4,46x respecto al BERT-Base original de 109.483.778 parámetros).

El interés de esta ficha no reside en el rendimiento absoluto del modelo, sino en su valor como artefacto de investigación sobre compresión extrema. El autor reporta una precisión del 56,08 % en la partición de validación de SST-2 (872 muestras), frente al 91,63 % del modelo profesor original, lo que supone una degradación de 35,55 puntos porcentuales. Se trata, por tanto, de un ejemplo de hasta dónde llega la compresión agresiva en una tarea de clasificación binaria y de cómo el "healing" con LoRA recupera parcialmente la precisión perdida (del 50,92 % en zero-shot al 56,08 % tras el ajuste).

El modelo se distribuye bajo licencia MIT, con pesos en formato `pytorch_model.bin` (108,3 MB) y requiere la librería NeuralOps para reconstruir la topología comprimida antes de cargar el `state_dict`. La información pública disponible es limitada: no hay paper, blog ni demo asociados, y los resultados de búsqueda web no contienen material relevante sobre el modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-Base), 12 capas, dimensión oculta D=768; topología comprimida mediante Rotational-SliceGPT-INT4 |
| Parametros totales | 24.549.122 (checkpoint comprimido); 109.483.778 en el modelo base original |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada de BERT-Base: 512 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | INT4 (cuantización híbrida del compresor `rotational_slicegpt_int4`); no se detallan esquemas adicionales |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict serializado con factores de bajo rango, buffers de cuantización y adaptadores LoRA integrados) |

## Arquitectura y entrenamiento

El modelo parte de `google-bert/bert-base-uncased`, un transformer encoder de 12 capas y 768 dimensiones ocultas con 109.483.778 parámetros, afinado previamente sobre GLUE SST-2. Sobre esa base se aplica el compresor `RotationalSliceGPTINT4Compressor`, que combina dos técnicas: por un lado, rotaciones ortogonales que permiten eliminar filas y columnas de las matrices de pesos preservando la función de la red (en la línea de SliceGPT); por otro, cuantización a INT4 de los pesos restantes. El resultado es una topología física con 24.549.122 parámetros, es decir, una reducción del 77,58 % y un ratio de compresión de 4,46x.

El proceso de compresión se evalúa en cuatro rangos (`k=256, 128, 64, 32`) sobre la partición de validación de SST-2 (872 muestras) en una NVIDIA GeForce RTX 3090 de 24 GB. Cuando la compresión zero-shot degrada la precisión más de 2,0 puntos con una reducción superior a 1,10x, NeuralOps aplica un "healing" con LoRA de rango `r=8`, 50 pasos, `lr=2e-4` y un presupuesto de 45 segundos. El checkpoint publicado corresponde al rango `k=256`, el único que muestra una recuperación sustancial tras el healing (de 50,92 % a 56,08 %). No se detalla en la información disponible la composición exacta del dataset de entrenamiento más allá de GLUE SST-2, ni si hubo RLHF/DPO (no aplicable en un clasificador de este tipo).

## Capacidades

- Clasificación de sentimiento binaria (negativo/positivo) sobre texto en inglés, específicamente en el dominio de reseñas de películas de SST-2.
- Inferencia sobre la topología comprimida reconstruida mediante `compress_model` de NeuralOps y carga del `state_dict` con `strict=False`.
- Recuperación parcial de precisión mediante adaptadores LoRA integrados en el checkpoint (`LoRA Recovery Applied: True`).
- No soporta generación de texto, razonamiento, código, matemáticas, visión ni audio: es un clasificador encoder-only.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- Capacidades multilingües: no; solo inglés.
- Capacidad especial: ninguna más allá de la compresión extrema y el healing con LoRA.

## Casos de uso

- Investigación sobre compresión de modelos: sirve como referencia reproducible para estudiar el impacto de Rotational-SliceGPT-INT4 en un transformer encoder pequeño, comparando los cuatro rangos evaluados (`k=256, 128, 64, 32`) con el profesor de 91,63 %.
- Estudio de "LoRA healing": permite analizar cuánta precisión se recupera con un ajuste LoRA de rango 8 y 50 pasos tras una compresión agresiva, con presupuesto de 45 segundos en RTX 3090.
- Docencia y divulgación: ejemplo práctico de hasta dónde llega la compresión (4,46x, -77,6 % de parámetros) en una tarea de clasificación y de sus límites (caída de 35,55 puntos frente al profesor).
- Benchmarking de pipelines de compresión: punto de comparación para otras técnicas de NeuralOps (Compressor Zoo) sobre el mismo modelo base y dataset.
- Pruebas de integración de la librería NeuralOps: el `Quick Start` de la model card permite validar el flujo `compress_model` + `load_state_dict` en entornos de CI.
- Clasificación de sentimiento de baja precisión en entornos con restricciones extremas de memoria: solo si se acepta una precisión en torno al 56 % en SST-2, muy por debajo de lo que exige producción real.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`), sobre GLUE SST-2 `validation` (872 muestras) en RTX 3090:

| Rank (k) | Ratio fisico | Parametros comprimidos | Zero-shot Acc | Healed Acc (LoRA) | Paridad vs profesor (91,63 %) |
|:---:|:---:|---:|---:|---:|---:|
| 256 (checkpoint publicado) | 4,46x | 24.549.122 (-77,6 %) | 50,92 % | 56,08 % | -35,55 % |
| 128 | 4,46x | 24.549.122 (-77,6 %) | 49,08 % | 50,92 % | -40,71 % |
| 64 | 4,46x | 24.549.122 (-77,6 %) | 49,08 % | 50,92 % | -40,71 % |
| 32 | 4,46x | 24.549.122 (-77,6 %) | 49,08 % | 50,92 % | -40,71 % |

Profesor (`bert-base-uncased` afinado en SST-2): 91,63 % de precisión en validación. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa 108,3 MB en `pytorch_model.bin`; con overhead de activaciones y tokenizer, cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: la evaluación oficial se realizó en NVIDIA GeForce RTX 3090 (24 GB), aunque el tamaño del modelo no exige esa VRAM; cualquier RTX 3060 o superior es suficiente.
- Cabe en GPU consumer: sí, en cualquier GPU moderna con al menos 4 GB de VRAM; también en CPU para inferencia puntual.
- Opciones de despliegue: la model card solo documenta el flujo con `transformers` + `neuralops` (`compress_model` + `load_state_dict`). No se mencionan vLLM, llama.cpp, Ollama ni TGI; la topología comprimida requiere la librería NeuralOps para reconstruirse.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| `tahamajs/bert-comp-rotational-slicegpt-int4-sst2` (k=256) | 24.549.122 (comprimido) | No disponible | 56,08 % | MIT | Hugging Face |
| `google-bert/bert-base-uncased` afinado en SST-2 (profesor) | 109.483.778 | 512 tokens | 91,63 % | Apache 2.0 (modelo base) | Hugging Face |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66.955.010 | 512 tokens | No disponible en la información | Apache 2.0 | Hugging Face |
| `textattack/bert-base-uncased-SST-2` | 109.483.778 | 512 tokens | No disponible en la información | MIT | Hugging Face |

La comparativa con DistilBERT y TextAttack se incluye por categoría (clasificadores SST-2 en inglés) pero sus cifras de precisión no están en la información proporcionada; no se inventan.

## Limitaciones y advertencias

- Degradación severa de precisión: 56,08 % frente al 91,63 % del profesor, una caída de 35,55 puntos. El modelo está muy por debajo de un clasificador SST-2 utilizable en producción.
- Los resultados están declarados por el autor y marcados como `verified: false`; no hay verificación independiente.
- El checkpoint requiere la librería NeuralOps y reconstruir la topología con `compress_model` antes de cargar el `state_dict`; no es un `transformers` estándar plug-and-play.
- Solo inglés y solo dominio SST-2 (reseñas de películas); no se ha evaluado en otros dominios ni tareas.
- Riesgo de alucinación no aplicable (clasificador, no generativo), pero sí de clasificaciones erróneas sistemáticas por la compresión.
- Sesgos: no documentados en la información disponible; al heredar de `bert-base-uncased` y SST-2, arrastra los sesgos del corpus original, no analizados por el autor.
- Licencia MIT permite uso comercial, pero el rendimiento hace inviable su uso en producción real.
- La información pública es escasa: sin paper, blog ni demo; los resultados de búsqueda web no contienen material relevante.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/bert-comp-rotational-slicegpt-int4-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del compresor: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/quantization/rotational_slicegpt_int4.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
