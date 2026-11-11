# tahamajs/bert-comp-svd-llm-compressor-sst2

## Resumen

`tahamajs/bert-comp-svd-llm-compressor-sst2` es un checkpoint comprimido y "curado" mediante LoRA de `google-bert/bert-base-uncased`, ajustado para clasificación de sentimiento en GLUE SST-2. Lo publica Taha Majlesi (usuario `tahamajs`) dentro del proyecto NeuralOps, una librería de compresión de modelos que implementa el compresor `svd_llm_compressor` (basado en SVD-LLM, ICLR 2025) con blanqueado de activaciones por Cholesky y recuperación secuencial mediante LoRA. El modelo no es un LLM generativo: es un encoder BERT de 12 capas y dimensión oculta 768, reducido físicamente a rango `k=32`.

El interés del artefacto es fundamentalmente metodológico: documenta una evaluación multi-rango (k=256, 128, 64, 32) sobre la partición de validación de SST-2 (872 muestras) medida en una RTX 3090, con ratios de compresión de 1,56x a 3,36x y precisión resultante. El checkpoint serializado corresponde a `k=32`, con 32.585.474 parámetros (reducción del 70,24 % respecto a los 109.483.778 del BERT-base original) y una precisión declarada de 68,81 % en SST-2, frente al 91,63 % del modelo profesor.

Es relevante ahora porque ejemplifica el estado del arte en compresión post-entrenamiento de bajo rango aplicada a encoders pequeños, y porque expone de forma transparente el coste en precisión de comprimir agresivamente: los rangos mayores (k=256, 128, 64) rinden peor tras el "healing" que el rango k=32, un resultado contraintuitivo que conviene leer con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-base), 12 capas, dimension oculta D=768, comprimido por SVD de bajo rango |
| Parametros totales | 32.585.474 (checkpoint comprimido, k=32); modelo base original: 109.483.778 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base BERT-base-uncased admite 512 tokens, pero la ficha no lo declara) |
| Tipos de cuantizacion | No disponible (el checkpoint se distribuye en `pytorch_model.bin` sin cuantizacion declarada) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict serializado de PyTorch); tokenizer en `vocab.txt`, `tokenizer.json`, `tokenizer_config.json` |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased`, un transformer encoder de 12 capas con atención multi-cabeza completa y 109.483.778 parámetros. Sobre ese checkpoint ajustado a SST-2 se aplica el compresor `SVDLLMCompressor` de NeuralOps, que descompone las matrices de pesos mediante SVD con blanqueado de activaciones (Cholesky activation whitening), una técnica heredada de SVD-LLM (ICLR 2025) que pondera la descomposición según la covarianza de activaciones para minimizar la pérdida funcional. El resultado es una topología de bajo rango con factores low-rank empaquetados en el state dict.

La recuperación se realiza con LoRA "healing": cuando la compresión zero-shot degrada la precisión más de 2,0 puntos con una reducción superior a 1,10x, se aplica un adaptador LoRA de rango `r=8` durante 50 pasos con `lr=2e-4` y un presupuesto de 45 segundos. Según la model card, el healing se aplicó en los cuatro rangos evaluados. No se documentan en la información disponible los datos de preentrenamiento originales de BERT ni la composición del ajuste fino sobre SST-2 más allá del dataset GLUE (`nyu-mll/glue`, configuración `sst2`). No se menciona RLHF ni DPO, algo esperable en un encoder de clasificación.

## Capacidades

- Clasificación de sentimiento binaria (negativo/positivo) sobre texto en inglés, con dos etiquetas de salida (`num_labels=2`).
- Inferencia sobre frases cortas o párrafos, limitada por la ventana del tokenizador BERT-base (no declarada explícitamente en la ficha).
- Compresión física verificable: 3,36x de ratio, 70,24 % de reducción de parámetros, con pesos de 62,3 MB.
- Reconstrucción programática mediante `compress_model` de NeuralOps más carga del state dict con `strict=False`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking".
- Capacidad multilingüe limitada al inglés; no se declaran otros idiomas.
- No es un modelo generativo: no produce texto libre, solo logits de clasificación.

## Casos de uso

- Clasificación de sentimiento en pipelines de análisis de opiniones: el modelo devuelve logits binarios para reseñas o tuits en inglés, con un coste de inferencia muy inferior al de BERT-base por su menor número de parámetros (32,6 M frente a 109,5 M).
- Despliegue en entornos con recursos muy limitados: con 62,3 MB de pesos en `pytorch_model.bin`, cabe en CPU, dispositivos edge o contenedores con poca memoria, aunque a costa de una precisión del 68,81 % que puede ser insuficiente para producción.
- Banchmarking de técnicas de compresión: sirve como referencia reproducible para comparar SVD-LLM con otras técnicas (poda, cuantización, destilación) sobre un mismo profesor y dataset.
- Investigación sobre recuperación LoRA: el repo documenta el efecto del healing en cuatro rangos, útil para estudiar cuándo el ajuste posterior compensa la pérdida de rango.
- Filtrado de datos a gran escala: para descartar textos claramente negativos o positivos en corpus masivos donde el coste por inferencia prima sobre la precisión exacta.
- Educación y demos: ejemplo mínimo de flujo compresión-reconstrucción-inferencia con la API de NeuralOps, útil en tutoriales de compresión de modelos.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados, `verified: false`). Evaluación sobre GLUE SST-2, partición de validación (872 muestras), en NVIDIA GeForce RTX 3090 (24 GB).

| Rank (k) | Ratio fisico | Parametros comprimidos (reduccion) | Precision zero-shot | Precision con LoRA | Delta vs profesor (91,63 %) |
|:---:|:---:|---:|---:|---:|---:|
| 256 | 1,56x | 70.260.482 (-35,8 %) | 59,52 % | 53,56 % (LoRA) | -38,07 % |
| 128 | 2,25x | 48.731.906 (-55,5 %) | 52,41 % | 50,92 % (LoRA) | -40,71 % |
| 64 | 2,88x | 37.967.618 (-65,3 %) | 51,38 % | 50,92 % (LoRA) | -40,71 % |
| 32 (checkpoint publicado) | 3,36x | 32.585.474 (-70,2 %) | 50,00 % | 68,81 % (LoRA) | -22,82 % |

Precisión del profesor (`bert-base-uncased` ajustado a SST-2): 91,63 %. El único resultado registrado en el `model-index` es el 68,81 % de accuracy en validación para el checkpoint k=32. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K) en la información disponible, algo esperable dado que el modelo es un clasificador y no un LLM generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (32,6 M de parámetros, ~130 MB de pesos más activaciones), muy por debajo de cualquier GPU moderna.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor evaluó en RTX 3090 (24 GB) por comodidad, no por necesidad.
- Cabe sobradamente en GPUs de consumo: RTX 3060, RTX 4060, GTX 1650, e incluso en CPU y dispositivos Apple Silicon.
- Opciones de despliegue: la ruta documentada es PyTorch + `transformers` + `neuralops` (reconstrucción con `compress_model` y carga con `strict=False`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y al no publicarse pesos en GGUF ni safetensors, la integración con esos motores requeriría conversión manual.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| `tahamajs/bert-comp-svd-llm-compressor-sst2` (k=32) | 32,6 M | no disponible | 68,81 % | MIT | Hugging Face, `pytorch_model.bin` |
| `google-bert/bert-base-uncased` (profesor, ajustado a SST-2) | 109,5 M | 512 tokens | 91,63 % | Apache 2.0 (modelo base) | Hugging Face, safetensors/PyTorch |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66,9 M | 512 tokens | ~91 % (referencia habitual en la literatura) | Apache 2.0 | Hugging Face, safetensors/PyTorch |
| `prajjwal1/bert-tiny` (ajustado a SST-2) | 4,4 M | 512 tokens | ~82-84 % (referencia habitual en la literatura) | MIT | Hugging Face, safetensors/PyTorch |

Nota: los valores de DistilBERT y BERT-tiny son referencias de la literatura y no se han extraído de la información proporcionada para este modelo; se incluyen solo como orientación comparativa. El checkpoint comprimido a k=32 queda por debajo de alternativas de tamaño similar en precisión (68,81 % frente a ~82-84 % de BERT-tiny con 4,4 M de parámetros), lo que sugiere que la compresión SVD en este rango no es competitiva con la destilación para esta tarea.

## Limitaciones y advertencias

- Precisión muy degradada: 68,81 % frente al 91,63 % del profesor, una caída de 22,82 puntos. Para clasificación binaria, un 68,81 % está solo 18,81 puntos por encima del azar.
- Resultados contraintuitivos: los rangos k=256, 128 y 64 rinden peor tras el healing (53,56 %, 50,92 %, 50,92 %) que el k=32 (68,81 %), lo que sugiere inestabilidad en el proceso de recuperación LoRA o un ajuste insuficiente (50 pasos, 45 s). Conviene tratar la tabla multi-rango con escepticismo.
- Resultados no verificados: el `model-index` marca `verified: false`; las cifras proceden del propio autor.
- Solo inglés: el tokenizer y el ajuste fino están en inglés; el rendimiento en otros idiomas no está evaluado y previsiblemente será muy bajo.
- Riesgo de alucinación no aplica en sentido generativo (es un clasificador), pero sí hay riesgo de clasificaciones erróneas sistemáticas en dominios distintos de SST-2 (por ejemplo, opiniones con sarcasmo, negaciones complejas o dominio técnico).
- Sesgos heredados de BERT-base y de SST-2: el dataset procede de reseñas de películas, con posible sesgo de dominio y de registro; el modelo puede comportarse mal en otros géneros textuales.
- Dependencia de la librería NeuralOps: la carga requiere reconstruir la topología con `compress_model` antes de aplicar el state dict con `strict=False`; no es un checkpoint estándar de `transformers` y no se puede cargar con `from_pretrained` directo.
- Formato propietario de facto: solo `pytorch_model.bin`, sin safetensors ni GGUF, lo que complica la integración con motores de inferencia optimizados y plantea riesgos de seguridad al usar `torch.load`.
- Licencia MIT: permite uso comercial, pero al derivar de BERT-base (Apache 2.0) conviene conservar los avisos correspondientes.
- Sin soporte declarado para vLLM, llama.cpp, Ollama ni TGI; el despliegue en producción requeriría trabajo adicional de conversión y validación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-comp-svd-llm-compressor-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del compresor: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/low_rank/svd_llm_compressor.py
- Licencia del proyecto: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
- Paper SVD-LLM (ICLR 2025): no disponible en la informacion proporcionada (citado por el autor, sin enlace)
