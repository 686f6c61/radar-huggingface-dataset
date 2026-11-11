# tahamajs/bert-comp-proxsparse-sst2

## Resumen
`tahamajs/bert-comp-proxsparse-sst2` es un checkpoint de clasificación de sentimiento derivado de `google-bert/bert-base-uncased`, ajustado sobre GLUE SST-2 y procesado con el motor de compresión `ProxSparsePruner` de la librería NeuralOps. Lo publica Taha Majlesi (usuario `tahamajs`) como parte de su "Compressed & LoRA-Healed Model Zoo", un conjunto de experimentos sobre poda estructurada y recuperación con LoRA. El modelo resuelve una tarea acotada: clasificación binaria de sentimiento en inglés (negativo/positivo) sobre textos cortos.

El interés técnico está en el proceso de compresión más que en el resultado: el autor aplica poda por gradiente proximal (proximal gradient sparsity) con selección de rango según un frente de Pareto (k=256, 128, 64 y 32). En la práctica, el checkpoint empaquetado corresponde a k=32 y no reduce el número de parámetros (109.483.778, ratio de compresión 1,00x), por lo que el "modelo comprimido" conserva el tamaño completo de BERT-base. La precisión final es del 82,34 % en la validación de SST-2, frente al 91,63 % del modelo profesor, una pérdida de paridad de 9,29 puntos.

Es relevante ahora como caso de estudio reproducible de compresión de modelos y como ejemplo de artefacto de investigación con trazabilidad detallada (telemetría por rango, configuración y pesos serializados). No es un modelo pensado para producción: su licencia MIT y su tamaño (208,9 MB de pesos) lo hacen fácil de inspeccionar, pero su rendimiento está muy por debajo del modelo base sin comprimir.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT (12 capas, dimensión oculta D=768) |
| Parametros totales | 109.483.778 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base BERT-base-uncased admite 512 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | No disponible (el repo incluye pesos en `pytorch_model.bin`; no se documentan variantes GGUF, INT8 ni INT4) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`pytorch_model.bin`), más `config.json`, `compression_summary.json` y assets del tokenizador de `bert-base-uncased` |

## Arquitectura y entrenamiento
La arquitectura es la de `bert-base-uncased`: un transformer encoder con 12 capas, 768 dimensiones ocultas y 109.483.778 parámetros. Sobre esa base, el autor aplica `ProxSparsePruner`, una técnica de poda por gradiente proximal con restricción estructurada (2:4 o percentil) y recuperación opcional mediante LoRA. El checkpoint empaquetado corresponde al rango k=32, pero la telemetría del autor indica que en los cuatro rangos evaluados (256, 128, 64 y 32) el ratio de compresión físico es 1,00x y la reducción de parámetros es del 0,00 %, es decir, la poda no elimina pesos del modelo serializado.

El ajuste se realiza sobre GLUE SST-2 (configuración `sst2`, split de validación con 872 muestras). El autor reporta que cuando la compresión zero-shot degrada la precisión más de 2,0 puntos con una reducción superior a 1,10x, NeuralOps aplica un "healing" con LoRA de rango r=8, 50 pasos y tasa de aprendizaje 2e-4 en un presupuesto de 45 segundos. En este checkpoint, la columna de "LoRA Recovery Applied" figura como `False` y las precisiones zero-shot y healed coinciden (82,34 %), lo que sugiere que el proceso de recuperación no alteró el resultado final en el rango empaquetado.

## Capacidades
- Clasificación binaria de sentimiento en inglés (etiquetas 0 = negativo, 1 = positivo) sobre textos cortos, típicamente reseñas.
- Inferencia sobre la arquitectura estándar de `BertForSequenceClassification`, con dos etiquetas de salida.
- Compatible con el flujo de reconstrucción de NeuralOps: cargar el modelo base, aplicar `compress_model` con `proxsparse` y cargar el `state_dict` con `strict=False`.
- Tokenizador estándar de `bert-base-uncased` incluido en el repositorio (vocabulario, `tokenizer.json` y `tokenizer_config.json`).
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling, agentes ni modo "thinking".
- Capacidad multilingüe limitada al inglés.

## Casos de uso
- Análisis de sentimiento de reseñas de producto en inglés: el modelo clasifica un texto corto como positivo o negativo; su uso realista es como línea base en experimentos de compresión, no como clasificador de producción dado el 82,34 % de precisión.
- Evaluación de técnicas de poda: sirve para comparar el efecto de `ProxSparsePruner` en distintos rangos (k=256, 128, 64, 32) sobre una tarea estándar como SST-2, con la telemetría incluida en `compression_summary.json`.
- Reproducción de experimentos de compresión: el repositorio incluye el código de reconstrucción y los pesos serializados, lo que permite replicar el pipeline de NeuralOps en una GPU de consumo.
- Docencia e investigación en eficiencia de modelos: ejemplo didáctico de cómo una poda que no reduce parámetros (ratio 1,00x) puede mantener la precisión zero-shot pero quedar lejos del profesor.
- Filtrado de opiniones en pipelines de datos en inglés: uso de bajo coste para preetiquetar grandes volúmenes de texto corto cuando no se requiere alta precisión.
- Pruebas de integración de la librería NeuralOps: validar la carga de checkpoints comprimidos, la compatibilidad con `transformers` y el flujo de `compress_model` antes de aplicarlo a modelos mayores.

## Benchmarks y rendimiento

| Modelo | Tarea / dataset | Métrica | Valor |
|---|---|---|---|
| `bert-comp-proxsparse-sst2` (k=32) | GLUE SST-2, validación | Accuracy | 82,34 % |
| Profesor (`bert-base-uncased` ajustado, según el autor) | GLUE SST-2, validación | Accuracy | 91,63 % |
| Paridad frente al profesor | GLUE SST-2, validación | Delta | -9,29 puntos |

El autor reporta los mismos valores (82,34 % zero-shot y 82,34 % healed) para los cuatro rangos evaluados (k=256, 128, 64 y 32). No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma explícita; con 109,5 millones de parámetros en FP32, los pesos ocupan aproximadamente 0,42 GB, y en FP16 unos 0,21 GB, más las activaciones.
- GPU recomendadas: el autor evaluó el proceso en una NVIDIA GeForce RTX 3090 (24 GB); para inferencia basta con GPUs de gama media o incluso CPU.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con 4 GB o más de VRAM, dado el tamaño del modelo.
- Opciones de despliegue: la model card solo documenta el flujo con `transformers` (`BertForSequenceClassification`) y la librería NeuralOps; no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SST-2 (validación) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/bert-comp-proxsparse-sst2` | 109.483.778 | No disponible | 82,34 % | MIT | Hugging Face |
| `google-bert/bert-base-uncased` (profesor ajustado, según el autor) | 109.483.778 | 512 tokens (modelo base) | 91,63 % | Apache 2.0 (modelo base) | Hugging Face |
| Alternativas comparables de poda sobre BERT-base | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de otros modelos de poda comparables en la información proporcionada.

## Limitaciones y advertencias
- La compresión no reduce parámetros: el ratio físico es 1,00x y la reducción es del 0,00 %, por lo que el checkpoint no aporta ahorro de memoria ni de cómputo frente a BERT-base.
- Pérdida de precisión significativa: 82,34 % frente al 91,63 % del profesor, una caída de 9,29 puntos que lo aleja de un uso en producción.
- Solo inglés: el modelo está entrenado y evaluado en inglés; no se documenta soporte multilingüe.
- Tarea muy acotada: clasificación binaria de sentimiento sobre textos cortos; no sirve para generación, razonamiento ni otras tareas.
- Riesgo de alucinación no aplicable en sentido estricto (es un clasificador), pero sí de clasificaciones erróneas en textos ambiguos, irónicos o de dominio distinto al de SST-2.
- Sesgos: no se documentan análisis de sesgo; al derivar de `bert-base-uncased` y de SST-2, hereda los sesgos de ese corpus y del modelo base.
- Licencia MIT para el checkpoint, pero el modelo base `google-bert/bert-base-uncased` tiene su propia licencia (Apache 2.0) que conviene verificar para uso comercial.
- Dependencia de la librería NeuralOps para reconstruir la topología comprimida; la carga con `transformers` a secas puede no reproducir el comportamiento si no se aplica `compress_model` antes.
- Resultados no verificados: la métrica de accuracy figura con `verified: false` en la model-index.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-comp-proxsparse-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación de `ProxSparsePruner`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/pruning/proxsparse.py
- Licencia del proyecto: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
