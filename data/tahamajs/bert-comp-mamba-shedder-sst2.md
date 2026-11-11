# tahamajs/bert-comp-mamba-shedder-sst2

## Resumen

`bert-comp-mamba-shedder-sst2` es un checkpoint de BERT-base comprimido y posteriormente recuperado mediante LoRA, publicado por Taha Majlesi dentro del proyecto NeuralOps (Compressor Zoo). Parte de `google-bert/bert-base-uncased` afinado en GLUE SST-2 (clasificación binaria de sentimiento en inglés) y aplica el compresor `mamba_shedder`, un mecanismo de poda estructurada basada en sensibilidad que elimina canales lineales no críticos según información de Fisher empírica y descarta capas de bajo residuo.

El resultado es un modelo de 92.445.206 parámetros (frente a los 109.483.778 del profesor), lo que supone una reducción del 15,56 % y un ratio de compresión físico de 1,184x. Sobre esa topología comprimida se aplica un "healing" con LoRA de rango 8 (50 pasos, lr=2e-4, presupuesto de 45 s), que eleva la precisión en validación de SST-2 del 79,93 % en zero-shot al 83,03 % final, frente al 91,63 % del modelo profesor original.

Su relevancia es fundamentalmente metodológica: sirve como artefacto reproducible para estudiar el compromiso entre compresión física, recuperación con adaptadores de bajo rango y degradación de precisión en una tarea concreta. No es un modelo de propósito general ni un modelo generativo: es un clasificador de sentimiento en inglés empaquetado con la librería `neuralops`, con 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-base (12 capas, dimensión oculta D=768), comprimido con poda estructurada `mamba_shedder` y recuperado con LoRA r=8 |
| Parametros totales | 92.445.206 (profesor original: 109.483.778; reducción del 15,56 %) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base BERT-base-uncased admite 512 tokens, pero la model card no lo declara explícitamente) |
| Tipos de cuantizacion | no disponible (el repositorio distribuye pesos en `pytorch_model.bin`; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`pytorch_model.bin`), más `config.json`, `compression_summary.json` y assets del tokenizador de `bert-base-uncased` |

## Arquitectura y entrenamiento

La arquitectura de partida es un transformer encoder BERT-base estándar: 12 capas, D=768 y 109.483.778 parámetros. El proceso de compresión `mamba_shedder_factory` (familia `pruning` dentro de NeuralOps, implementado en `neuralops/compression/pruning/mamba_shedder.py`) identifica canales lineales no críticos mediante información de Fisher empírica y elimina capas con bajo residuo, produciendo una topología física distinta de la original, no una simple máscara. El checkpoint serializado corresponde al rango `k=32`, seleccionado como punto de Pareto; según la model card, los rangos 256, 128, 64 y 32 convergen al mismo recuento de parámetros y a las mismas métricas en esta evaluación.

Sobre la topología comprimida se aplica un "healing" con LoRA de rango 8 durante 50 pasos con learning rate 2e-4 y un presupuesto de 45 segundos, activado cuando la compresión zero-shot degrada la precisión más de 2,0 puntos con una reducción superior a 1,10x. La evaluación se realizó físicamente en una NVIDIA GeForce RTX 3090 (24 GB) sobre el split de validación de GLUE SST-2 (872 muestras). No se documentan en la información disponible el volumen de tokens de preentrenamiento, la composición del dataset más allá de GLUE SST-2, ni si hubo RLHF o DPO; el ajuste se limita a la tarea de clasificación de sentimiento.

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) en inglés sobre textos tipo SST-2, con dos etiquetas de salida (`num_labels=2`).
- Razonamiento y generación de texto: no disponible; el modelo es exclusivamente un clasificador (`pipeline_tag: text-classification`).
- Tool calling / function calling: no soportado.
- Soporte de agentes y razonamiento multi-paso: no soportado.
- Capacidades multilingües: limitadas al inglés; el vocabulario es el de `bert-base-uncased`.
- Capacidades especiales: ninguna documentada (sin visión, audio ni modo "thinking"); el interés técnico reside en la compresión y el healing con LoRA, no en capacidades adicionales.

## Casos de uso

- Análisis de sentimiento en reseñas de producto: el modelo clasifica reseñas cortas en inglés en positivas o negativas; su tamaño reducido (92,4 M de parámetros) permite desplegarlo en CPU o en GPU de gama baja con baja latencia.
- Moderación de comentarios en foros en inglés: filtrado previo de toxicidad o polaridad negativa en pipelines de contenido, usando la etiqueta de sentimiento como señal auxiliar.
- Investigación en compresión de modelos: sirve como artefacto reproducible para comparar `mamba_shedder` frente a otras técnicas de poda (magnitud, Wanda, SparseGPT) sobre una línea base BERT-base conocida.
- Estudio de recuperación con LoRA tras poda: el par zero-shot (79,93 %) frente a healed (83,03 %) permite cuantificar la contribución del adaptador de rango 8 en un presupuesto de 45 s.
- Docencia y experimentación: ejemplo práctico de flujo `compress_model` + carga de `state_dict` con `strict=False`, útil para aprender a reconstruir topologías comprimidas en PyTorch.
- Clasificación por lotes en entornos con recursos limitados: al ocupar 176,9 MB de pesos, puede integrarse en servicios serverless o contenedores pequeños donde BERT-base completo no cabría con holgura.
- Evaluación comparativa de robustez: útil para medir cuánto degrada la poda estructurada en una tarea de clasificación sensible a matices (negación, ironía) frente al profesor del 91,63 %.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente, `verified: false`):

| Modelo | Dataset / split | Métrica | Valor |
|---|---|---|---|
| `bert-comp-mamba-shedder-sst2` (k=32, healed) | GLUE SST-2, validation (872 muestras) | Accuracy | 83,03 % |
| `bert-comp-mamba-shedder-sst2` (zero-shot, sin LoRA) | GLUE SST-2, validation | Accuracy | 79,93 % |
| Profesor `bert-base-uncased` afinado en SST-2 | GLUE SST-2, validation | Accuracy | 91,63 % |

Desglose por rango de compresión según la model card: los rangos k=256, 128, 64 y 32 producen el mismo recuento de parámetros (92.445.206), el mismo ratio físico (1,18x) y las mismas métricas (79,93 % zero-shot, 83,03 % healed, delta de paridad de -8,60 puntos frente al profesor). No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa 176,9 MB en `pytorch_model.bin` (fp32); en la práctica ocupa menos de 1 GB de VRAM incluyendo activaciones para lotes pequeños.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; la evaluación del autor se realizó en una NVIDIA GeForce RTX 3090 (24 GB), pero el modelo es sobredimensionado para ese hardware.
- Cabe en GPU de consumo: sí, en GTX 1650, RTX 3050, RTX 4060 y superiores; también en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: requiere reconstruir la topología comprimida con `neuralops.core.compression_pipeline.compress_model` antes de cargar el `state_dict`; no es compatible directamente con vLLM, llama.cpp, Ollama ni TGI sin conversión previa, y no se distribuyen pesos GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada; el autor solo reporta un presupuesto de 45 s para el healing LoRA, no métricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/bert-comp-mamba-shedder-sst2` | 92,4 M (comprimido) | no disponible | 83,03 % | MIT | Hugging Face, librería `neuralops` |
| `google-bert/bert-base-uncased` (profesor, afinado SST-2) | 109,5 M | 512 tokens | 91,63 % (referencia del autor) | Apache 2.0 | Hugging Face, `transformers` |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66 M | 512 tokens | no disponible en la información proporcionada | Apache 2.0 | Hugging Face, `transformers` |
| `textattack/bert-base-uncased-SST-2` | 109,5 M | 512 tokens | no disponible en la información proporcionada | MIT | Hugging Face, `transformers` |

La comparación directa con DistilBERT y con el checkpoint de TextAttack no puede cerrarse con datos de esta ficha porque sus métricas en SST-2 no se han proporcionado; se incluyen como alternativas de la misma categoría (clasificación de sentimiento en inglés basada en BERT) por tamaño y licencia.

## Limitaciones y advertencias

- Degradación de precisión notable: 83,03 % frente al 91,63 % del profesor, una pérdida de 8,60 puntos en SST-2; insuficiente para producción en tareas sensibles a matices.
- El checkpoint solo se carga tras reconstruir la topología con `compress_model` y usar `strict=False`; un `from_pretrained` convencional de `transformers` fallará o cargará pesos incompatibles.
- El modelo es exclusivamente un clasificador binario de sentimiento en inglés; no genera texto, no soporta tool calling ni agentes.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificaciones erróneas en textos con negación, ironía o dominio distinto al de SST-2 (reseñas de películas).
- Sesgos: hereda los del corpus SST-2 y del preentrenamiento de `bert-base-uncased`; no se documenta ninguna mitigación.
- Limitación de idioma: solo inglés; el tokenizador `bert-base-uncased` no está pensado para otros idiomas.
- La licencia MIT permite uso comercial, pero el modelo depende de la librería NeuralOps y de la topología comprimida, lo que añade complejidad operativa frente a un BERT-base estándar.
- Los resultados están declarados por el autor y marcados como no verificados (`verified: false`); no hay evaluación independiente.
- El repositorio tiene 0 descargas y 0 likes, y fue creado en noviembre de 2026; no hay evidencia de uso en producción ni mantenimiento continuado.
- Los resultados de los enlaces de búsqueda web proporcionados no guardan relación con el modelo (corresponden a un bufete de abogados) y no se han utilizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-comp-mamba-shedder-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del compresor `mamba_shedder`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/pruning/mamba_shedder.py
- Licencia MIT del proyecto: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset GLUE (config sst2): https://huggingface.co/datasets/nyu-mll/glue
