# tahamajs/bert-comp-gptq-sst2

## Resumen

`tahamajs/bert-comp-gptq-sst2` es un checkpoint de `google-bert/bert-base-uncased` afinado para clasificación de sentimiento en GLUE SST-2 y posteriormente procesado con el motor de compresión `GPTQCompressor` de la librería NeuralOps, desarrollada por Taha Majlesi. El modelo se publica como parte del "NeuralOps Compressed & LoRA-Healed Model Zoo", un conjunto de artefactos que documentan el efecto de distintas técnicas de compresión sobre un mismo modelo base, con evaluación multi-rango (k=256, 128, 64, 32) y un protocolo de recuperación mediante LoRA cuando la precisión cae más de 2 puntos.

Arquitectura BERT-base estándar: transformer encoder de 12 capas, dimensión oculta 768, 109.483.778 parámetros y tokenizador WordPiece en inglés (`bert-base-uncased`). El contexto máximo es de 512 tokens. La particularidad del repositorio no es el modelo en sí, sino el pipeline de compresión que lo acompaña: en el rango publicado (k=32) la compresión física es de 1,00x, es decir, no se reduce el número de parámetros, y la precisión final en validación SST-2 es del 90,48 % frente al 91,63 % del profesor original.

Es relevante ahora porque documenta de forma reproducible una técnica de cuantización GPTQ aplicada a un modelo pequeño de clasificación, con telemetría completa (`compression_summary.json`) y un script de reconstrucción explícito. Sirve como referencia metodológica para quien quiera evaluar el coste en precisión de pipelines de compresión en BERT, aunque en su configuración actual no ofrece ninguna ventaja de tamaño frente al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-base), 12 capas, dimension oculta 768 |
| Parametros totales | 109.483.778 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (estandar de BERT-base) |
| Tipos de cuantizacion | GPTQ (via `GPTQCompressor` de NeuralOps), con soporte de compressed-tensors |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict serializado), `config.json`, `compression_summary.json`, assets de tokenizer (`vocab.txt`, `tokenizer.json`, `tokenizer_config.json`) |

## Arquitectura y entrenamiento

El modelo parte de `google-bert/bert-base-uncased`, un transformer encoder bidireccional de 12 capas y 768 dimensiones de ocultación, preentrenado con objetivos de masked language modeling y next sentence prediction. Sobre esa base se realizó un fine-tuning supervisado para clasificación binaria de sentimiento en GLUE SST-2 (dos etiquetas: negativo y positivo), del que resulta el "profesor" con 91,63 % de accuracy en validación.

Posteriormente se aplicó el compresor GPTQ de NeuralOps con rango de showcase k=32. Según la model card, en los cuatro rangos evaluados (256, 128, 64 y 32) la ratio de compresión física es 1,00x y la reducción de parámetros es del 0,00 %, por lo que el checkpoint empaquetado conserva los 109.483.778 parámetros. La evaluación se realizó físicamente en una NVIDIA GeForce RTX 3090 (24 GB) sobre las 872 muestras del split de validación de SST-2. El protocolo de "LoRA healing" (r=8, 50 pasos, lr=2e-4, presupuesto de 45 s) se activa solo cuando la compresión zero-shot degrada más de 2,0 puntos con una reducción superior a 1,10x; en este caso no se cumplió esa condición y el campo `LoRA Recovery Applied` figura como `False`. El resultado zero-shot y el resultado tras el pipeline coinciden en 90,48 %.

## Capacidades

- Clasificación de sentimiento binaria (negativo/positivo) en inglés, orientada específicamente al dominio de reseñas de SST-2.
- Generación de logits para dos clases vía `BertForSequenceClassification` con `num_labels=2`.
- Inferencia por lotes sobre secuencias de hasta 512 tokens.
- Reconstrucción programática del grafo comprimido mediante `compress_model` de NeuralOps antes de cargar el state dict.
- Compatibilidad con el ecosistema Hugging Face `transformers` para tokenizer y arquitectura base.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo "thinking", visión, audio ni otras modalidades.
- Capacidad multilingüe limitada al inglés (vocabulario uncased en inglés).

## Casos de uso

- Análisis de sentimiento en reseñas de producto: el modelo clasifica textos cortos en positivo/negativo con un 90,48 % de accuracy en validación SST-2, suficiente para monitorización de opiniones a escala con umbrales de confianza ajustables.
- Filtrado de comentarios en foros y redes: al ser un modelo de 109 M de parámetros y 208,9 MB de pesos, se puede desplegar en CPU para preclasificar grandes volúmenes antes de un paso humano o de un modelo mayor.
- Moderación de contenido basada en tono: usar la probabilidad de la clase positiva como señal auxiliar en pipelines de moderación, combinándola con reglas léxicas.
- Etiquetado débil para entrenamiento: generar etiquetas de sentimiento preliminares sobre corpus no anotados que luego se revisen o se usen en aprendizaje semi-supervisado.
- Investigación en compresión de modelos: el repositorio incluye `compression_summary.json` con la telemetría de los rangos k=256, 128, 64 y 32, lo que permite reproducir y comparar el efecto de GPTQ sobre BERT en un benchmark estándar.
- Docencia y experimentación con GPTQ: el script de "Quick Start" de la model card ilustra el flujo completo (descarga del checkpoint, reconstrucción de la topología comprimida y carga con `strict=False`), útil como ejemplo mínimo de integración de NeuralOps.
- Baseline en pipelines de clasificación: sirve como referencia de precisión (90,48 %) frente a la que medir variantes destiladas, cuantizadas a 8 o 4 bits, o podadas del mismo BERT-base.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index y en la model card (no verificados de forma independiente, `verified: false`).

| Modelo / configuracion | Dataset | Split | Accuracy |
|---|---|---|---|
| `bert-comp-gptq-sst2` (k=32, publicado) | GLUE SST-2 | validation | 90,48 % |
| Profesor `bert-base-uncased` fine-tuned SST-2 | GLUE SST-2 | validation | 91,63 % |
| Delta frente al profesor | GLUE SST-2 | validation | -1,15 pp |

Evaluación multi-rango reportada por el autor (misma accuracy en todos los rangos, ratio física 1,00x):

| Rank (k) | Ratio fisica | Parametros comprimidos | Zero-shot Acc | Healed Acc |
|:---:|:---:|---:|---:|---:|
| 256 | 1,00x | 109.483.778 (-0,0 %) | 90,48 % | 90,48 % |
| 128 | 1,00x | 109.483.778 (-0,0 %) | 90,48 % | 90,48 % |
| 64 | 1,00x | 109.483.778 (-0,0 %) | 90,48 % | 90,48 % |
| 32 | 1,00x | 109.483.778 (-0,0 %) | 90,48 % | 90,48 % |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (208,9 MB de pesos más activaciones y buffers); holgadamente por debajo de 2 GB en cualquier configuración práctica.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor validó la evaluación en una NVIDIA GeForce RTX 3090 (24 GB), aunque el modelo es muy inferior a esa capacidad.
- Cabe en GPU de consumo: sí, en GTX 1650, RTX 3050, RTX 4060 y superiores; también en CPU con latencias aceptables para clasificación por lotes.
- Opciones de despliegue: `transformers` con PyTorch (flujo documentado), más la dependencia de NeuralOps para reconstruir la topología comprimida antes de cargar el state dict. No se documenta soporte directo para vLLM, llama.cpp, Ollama o TGI; al ser un modelo de clasificación y no generativo, esos motores no son el objetivo natural.
- Latencia y throughput: no disponibles en la información proporcionada. Como referencia cualitativa, un BERT-base de 109 M de parámetros suele procesar cientos de secuencias por segundo en GPU moderna, pero no se aporta ninguna medición concreta para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 val acc | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| `tahamajs/bert-comp-gptq-sst2` | 109,5 M | 512 | 90,48 % | MIT | Hugging Face (repo propio) |
| `google-bert/bert-base-uncased` (profesor SST-2 reportado) | 109,5 M | 512 | 91,63 % | Apache 2.0 | Hugging Face |
| BERT-base fine-tuned SST-2 estandar (referencia de la literatura) | 109,5 M | 512 | ~92-93 % (referencia habitual, no medida en esta ficha) | Apache 2.0 | Hugging Face / papers |

La comparación se limita al modelo base y al profesor declarado por el autor; no se dispone de datos de otros checkpoints comprimidos equivalentes en la información proporcionada.

## Limitaciones y advertencias

- La compresión física es de 1,00x: el checkpoint publicado no reduce el número de parámetros ni el tamaño en disco respecto al BERT-base original. El beneficio práctico de tamaño es nulo en esta configuración.
- La accuracy cae 1,15 puntos frente al profesor (90,48 % frente a 91,63 %), y la métrica figura como `verified: false` en el model-index.
- El modelo está especializado en SST-2 (reseñas en inglés); el rendimiento fuera de ese dominio o en otros idiomas no está documentado y probablemente sea pobre.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificaciones erróneas con alta confianza en dominios distintos al de entrenamiento; conviene calibrar umbrales.
- Sesgos: no se documenta ningún análisis de sesgo; al derivar de `bert-base-uncased`, hereda los sesgos del corpus de preentrenamiento (principalmente inglés y de fuentes web).
- Dependencia de la librería NeuralOps para reconstruir la topología antes de cargar los pesos; el `load_state_dict` se hace con `strict=False`, lo que puede ocultar discrepancias entre el grafo esperado y el serializado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria independiente.
- Licencia MIT declarada, lo que permite uso comercial, pero el `LICENSE` enlazado apunta al repositorio de NeuralOps y no a un fichero específico del modelo; conviene verificar los términos antes de un despliegue en producción.
- El pipeline de "LoRA healing" no se aplicó en este checkpoint (`LoRA Recovery Applied: False`), por lo que no hay ganancia de recuperación que explotar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-comp-gptq-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del compresor GPTQ: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/quantization/gptq.py
- Licencia MIT referenciada: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset GLUE (config sst2): https://huggingface.co/datasets/nyu-mll/glue
