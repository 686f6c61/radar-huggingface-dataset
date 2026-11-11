# tahamajs/bert-comp-kvtc-compressor-sst2

## Resumen

`tahamajs/bert-comp-kvtc-compressor-sst2` es un checkpoint comprimido y posteriormente "curado" con LoRA de `google-bert/bert-base-uncased`, ajustado para clasificación de sentimiento binaria en GLUE SST-2. Lo publica Taha Majlesi (usuario `tahamajs`) como parte del "NeuralOps Compressed & LoRA-Healed Model Zoo", un conjunto de artefactos que demuestran el motor de compresión `KVTCCompressor` de la librería NeuralOps. No es un modelo nuevo: es una versión reducida físicamente del BERT-base original, con los pesos de las proyecciones lineales comprimidos mediante PCA estático, recorte por percentiles, cuantización entera uniforme y estimación de codificación entrópica.

El interés del artefacto es metodológico más que de rendimiento: documenta un pipeline de compresión agresiva (ratio físico de 4,46x, reducción del 77,58 % de parámetros, de 109.483.778 a 24.549.122) seguido de un "healing" con adaptadores LoRA de rango 8 para recuperar precisión. El resultado declarado es un 89,22 % de accuracy en la partición de validación de SST-2, frente al 91,63 % del modelo profesor sin comprimir, es decir, una pérdida de 2,41 puntos.

Es relevante ahora por dos motivos: primero, porque ejemplifica una técnica de compresión de pesos basada en transform coding aplicada a modelos transformer pequeños, un área con menos literatura que la cuantización clásica; segundo, porque el repositorio es prácticamente experimental (0 descargas, 0 likes, creado en noviembre de 2026) y conviene tratarlo como una demostración reproducible del tooling de NeuralOps, no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-base (12 capas, dimensión oculta 768) |
| Parametros totales | 24.549.122 tras compresión (modelo base original: 109.483.778) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (el modelo base BERT-base-uncased soporta 512 tokens, pero la model card no lo declara explícitamente) |
| Tipos de cuantizacion | Cuantización entera uniforme con recorte por percentiles y estimación de codificación entrópica (parte del pipeline KVTC); no se listan formatos GGUF/AWQ/GPTQ |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict serializado de PyTorch), más `config.json`, `compression_summary.json` y assets de tokenizer (`vocab.txt`, `tokenizer.json`, `tokenizer_config.json`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es BERT-base uncased: un transformer encoder de 12 capas con 768 dimensiones ocultas y 109.483.778 parámetros, preentrenado por Google y aquí ajustado para clasificación de secuencias con dos etiquetas (negativo/positivo) sobre GLUE SST-2. Sobre esa base, NeuralOps aplica el compresor `KVTCCompressor` (familia `kv_cache`), que combina PCA estático para decorrelacionar los pesos de las proyecciones lineales, recorte por percentiles, cuantización entera uniforme y estimación de codificación entrópica. El resultado es una topología comprimida de 24.549.122 parámetros, con un ratio físico de 4,46x y una reducción del 77,58 %.

El proceso de recuperación se activa cuando la compresión zero-shot degrada la accuracy más de 2,0 puntos con una reducción superior a 1,10x. En ese caso se aplican adaptadores LoRA de rango 8 durante 50 pasos con tasa de aprendizaje 2e-4 y un presupuesto de 45 segundos, y los adaptadores quedan integrados en el state dict serializado. La evaluación se realizó físicamente en una NVIDIA GeForce RTX 3090 (24 GB) sobre las 872 muestras de validación de SST-2. La model card reporta resultados para los rangos k=256, 128, 64 y 32; los tres primeros (256, 128 y 32) producen el mismo checkpoint empaquetado, mientras que k=64 aparece como `FAIL_CRASH` sin más detalle. No se documentan datos de preentrenamiento adicionales, composición del dataset de ajuste fino ni uso de RLHF/DPO.

## Capacidades

- Clasificación de sentimiento binaria en inglés (negativo/positivo) sobre textos de una sola frase o párrafo corto, típicos de SST-2.
- Generación de logits de clasificación (2 clases) a partir de la cabeza `BertForSequenceClassification`.
- Inferencia en modo evaluación (`model.eval()`) sobre CPU o GPU con el state dict cargado en `strict=False`.
- Reconstrucción del modelo comprimido mediante `compress_model` de NeuralOps antes de cargar los pesos.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un encoder de clasificación, no un modelo generativo.
- No soporta agentes, ni visión, ni audio, ni modo "thinking".
- Capacidad multilingüe: no; solo inglés (vocabulario `bert-base-uncased`).
- Capacidad de contexto: la del BERT-base original (hasta 512 tokens), aunque la model card no lo declara explícitamente.

## Casos de uso

- Análisis de sentimiento en reseñas de producto: el modelo clasifica reseñas cortas en inglés en positivas o negativas; su tamaño reducido (24,5 M de parámetros) permite desplegarlo en CPU para volúmenes moderados sin GPU dedicada.
- Moderación de comentarios en foros en inglés: puede prefiltrar mensajes con tono negativo antes de una revisión humana, siempre que se acepte la pérdida de 2,41 puntos frente al BERT-base original.
- Enriquecimiento de pipelines de datos: etiquetar grandes corpus de texto en inglés con polaridad para análisis de opinión o estudios de mercado, usando el checkpoint comprimido para reducir huella de memoria y coste de inferencia.
- Investigación en compresión de modelos: servir como referencia reproducible del pipeline KVTC + LoRA healing de NeuralOps, comparando el comportamiento del checkpoint comprimido frente al profesor en tareas controladas.
- Docencia y experimentación: ejemplo didáctico de cómo la compresión de pesos afecta a la accuracy en una tarea estándar (SST-2) y de cómo el ajuste LoRA puede recuperar parte de la pérdida.
- Prototipado rápido en entornos con recursos limitados: al ocupar 127,9 MB de pesos, cabe en instancias pequeñas o en contenedores con poca memoria, útil para validar una idea antes de escalar a un modelo mayor.
- Benchmarking interno de herramientas de compresión: comparar el ratio 4,46x y la precisión resultante con otras técnicas (cuantización de 8 bits, pruning) en el mismo conjunto de validación.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados, campo `verified: false`):

| Modelo / variante | Dataset | Split | Accuracy |
|---|---|---|---|
| BERT-base-uncased (profesor, referencia) | GLUE SST-2 | validation | 91,63 % |
| bert-comp-kvtc-compressor-sst2 (k=32, zero-shot) | GLUE SST-2 | validation | 80,73 % |
| bert-comp-kvtc-compressor-sst2 (k=32, con LoRA healing) | GLUE SST-2 | validation | 89,22 % |

Evaluación multi-rango reportada en la model card:

| Rank (k) | Ratio físico | Parámetros comprimidos | Zero-shot | Con LoRA | Paridad vs profesor |
|---|---|---|---|---|---|
| 256 | 4,46x | 24.549.122 (-77,6 %) | 80,73 % | 89,22 % | -2,41 % |
| 128 | 4,46x | 24.549.122 (-77,6 %) | 80,73 % | 89,22 % | -2,41 % |
| 64 | — | — | FAIL_CRASH | — | — |
| 32 | 4,46x | 24.549.122 (-77,6 %) | 80,73 % | 89,22 % | -2,41 % |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con los pesos en float32 (127,9 MB de checkpoint); con el modelo base reconstruido temporalmente para cargar el state dict, se necesita espacio para el BERT-base completo (unos 440 MB en fp32) más el modelo comprimido.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; la evaluación del autor se hizo en una NVIDIA GeForce RTX 3090 (24 GB), pero es sobredimensionada para este modelo.
- Cabe en GPU de consumo: sí, en cualquier RTX 20xx/30xx/40xx, GTX 16xx, e incluso en iGPU con suficiente memoria compartida.
- También funciona en CPU para inferencia por lotes pequeños, dado el reducido número de parámetros.
- Opciones de despliegue: el flujo documentado usa `transformers` + `neuralops` (reconstrucción con `compress_model` y carga del state dict); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y el formato `pytorch_model.bin` no es directamente compatible con esos motores.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bert-comp-kvtc-compressor-sst2 | 24.549.122 (comprimido) | no disponible (base: 512) | 89,22 % | MIT | Hugging Face, librería NeuralOps |
| google-bert/bert-base-uncased (profesor) | 109.483.778 | 512 | 91,63 % (referencia del autor) | Apache 2.0 | Hugging Face, transformers |
| DistilBERT-base-uncased | 66 M aprox. | 512 | no disponible en esta información | Apache 2.0 | Hugging Face, transformers |
| RoBERTa-base | 125 M aprox. | 512 | no disponible en esta información | MIT | Hugging Face, transformers |

No se dispone de datos de benchmarks de los modelos alternativos en la información proporcionada; las cifras de parámetros y contexto de DistilBERT y RoBERTa son aproximadas y deben verificarse en sus respectivas model cards.

## Limitaciones y advertencias

- Modelo puramente experimental: 0 descargas y 0 likes en el momento de la ficha; no hay evidencia de uso en producción.
- El resultado de 89,22 % está declarado por el autor y marcado como no verificado (`verified: false`); conviene reproducirlo antes de confiar en él.
- La accuracy cae 2,41 puntos frente al BERT-base original (91,63 % → 89,22 %), lo que puede ser inaceptable en aplicaciones sensibles.
- El rango k=64 falla con `FAIL_CRASH`; el pipeline de compresión no es robusto en todos los rangos evaluados.
- Solo inglés: el vocabulario `bert-base-uncased` y el ajuste fino en SST-2 limitan el uso a texto en inglés.
- Tarea muy acotada: clasificación binaria de sentimiento; no sirve para generación, razonamiento, código ni matemáticas.
- Riesgo de sesgo: SST-2 contiene reseñas de películas y el modelo hereda los sesgos del corpus y del preentrenamiento de BERT-base.
- Riesgo de alucinación bajo en sentido estricto (es un clasificador), pero puede producir etiquetas erróneas con alta confianza en dominios distintos al de entrenamiento.
- La licencia MIT del checkpoint no cubre necesariamente los términos del modelo base `google-bert/bert-base-uncased` (Apache 2.0); conviene revisar ambas antes de uso comercial.
- El flujo de carga requiere la librería NeuralOps y una reconstrucción previa del modelo comprimido; no es un `from_pretrained` estándar.
- La model card no documenta el número de tokens de entrenamiento ni la composición exacta del dataset de ajuste fino.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/bert-comp-kvtc-compressor-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del compresor: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/kv_cache/kvtc_compressor.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
