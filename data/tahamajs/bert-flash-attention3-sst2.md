# tahamajs/bert-flash-attention3-sst2

## Resumen

`tahamajs/bert-flash-attention3-sst2` es una variante del modelo `google-bert/bert-base-uncased` en la que las 12 capas de self-attention multi-cabeza estándar han sido sustituidas por el mecanismo `flash_attention3` de la librería NeuralOps. El autor es Taha Majlesi (usuario `tahamajs`) y el modelo forma parte de un "Attention Zoo" de variantes de BERT con mecanismos de atención subcuadráticos. Está pensado como experimento de destilación de conocimiento sobre WikiText-2, no como un modelo de producción.

El modelo se ha destilado mediante el pipeline de tres etapas de NeuralOps (calibración Ridge en forma cerrada, MSE/CKA de subespacio con backbone congelado y KD de logits fusionado con LR diferencial) durante 300 segundos en una NVIDIA RTX 3090. El resultado reportado es una perplejidad MLM de 0.00 y una precisión de token enmascarado del 91.86%, frente al 68.42% del profesor original. Estos valores, especialmente la perplejidad nula, deben interpretarse con cautela (ver limitaciones).

La relevancia del modelo es fundamentalmente metodológica: demuestra un flujo de sustitución de atención y destilación rápida sobre un transformer encoder pequeño. El repositorio ocupa 0.5 GB, la licencia es MIT y el pipeline declarado es `fill-mask` en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-base) con 12 capas de self-attention sustituidas por `flash_attention3` |
| Parametros totales | no disponible (el modelo base `bert-base-uncased` tiene 110 M; el recuento exacto tras la sustitución no se especifica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base soporta 512 tokens; no se confirma para esta variante) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | no disponible (librería `neuralops`, requiere `custom_code`; no se indica safetensors ni GGUF) |

## Arquitectura y entrenamiento

Se parte de `bert-base-uncased`, un transformer encoder de 12 capas, y se reemplazan todas las capas de multi-head self-attention por el mecanismo `flash_attention3` implementado en NeuralOps, descrito como atención subcuadrática. El resto de componentes (embeddings, feed-forward, normalización) no se detalla en la información disponible.

El entrenamiento consiste en una destilación de conocimiento sobre WikiText-2 con un currículo de tres etapas: Stage 0, calibración Ridge en forma cerrada; Stage 1, MSE/CKA de subespacio con backbone congelado; Stage 2, KD de logits fusionado con learning rate diferencial. Se completaron 225 pasos en 300 segundos, con un throughput de 38 049,7 tokens/s y un pico de VRAM de 13 512 MB en una RTX 3090. No se especifica el número total de tokens de entrenamiento ni si hubo RLHF o DPO (no aplicable en un encoder de enmascaramiento). El nombre del repositorio incluye "sst2", pero la model card solo documenta evaluación sobre WikiText-2.

## Capacidades

- Masked language modeling (relleno de máscaras) en inglés, tarea declarada en el pipeline `fill-mask`.
- Clasificación y representación de texto derivadas del encoder BERT subyacente (no evaluadas en la información disponible).
- Atención subcuadrática vía `flash_attention3`, orientada a eficiencia en secuencias largas.
- No se documenta soporte de tool calling, function calling, agentes, multi-step reasoning, visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe: no, solo inglés.
- Requiere `custom_code` y la librería NeuralOps para cargar la arquitectura modificada.

## Casos de uso

- Experimentación académica con mecanismos de atención alternativos: permite comparar `flash_attention3` frente a atención estándar en un encoder BERT sin reentrenar desde cero, gracias a la inicialización desde `bert-base-uncased`.
- Relleno de máscaras en inglés para prototipos de NLP: el pipeline `fill-mask` de Transformers permite integrarlo en demos y cuadernos de validación rápida.
- Destilación rápida sobre hardware de consumo: el flujo de tres etapas en 300 segundos sobre una RTX 3090 sirve como referencia para reproducir experimentos de KD en GPUs de 24 GB.
- Extracción de embeddings para tareas downstream (clasificación, similitud) usando el encoder como backbone, siempre que se valide el impacto de la sustitución de atención.
- Evaluación de eficiencia de atención subcuadrática en cargas de trabajo con secuencias largas, comparando latencia y memoria frente al BERT original.
- Base para investigación en el "Attention Zoo" de NeuralOps, replicando la sustitución con otros mecanismos y comparando métricas MLM.

## Benchmarks y rendimiento

Evaluación determinista de MLM sobre WikiText-2 (15% de tokens enmascarados, `seed=42`):

| Fase | MLM Perplexity | Precision de token enmascarado (%) | Delta vs baseline |
|---|---|---|---|
| BERT base profesor (`bert-base-uncased`) | 6.84 | 68.42 | Referencia |
| Stage 0 (Ridge en forma cerrada) | 0.00 | 91.63 | -6.84 |
| Stage 2 (modelo destilado) | 0.00 | 91.86 | -6.84 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible. La perplejidad de 0.00 resulta anómala y sugiere un posible artefacto de evaluación (ver limitaciones).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el entrenamiento consumió 13 512 MB en una RTX 3090. Para inferencia de un encoder de ~110 M de parámetros se espera un consumo muy inferior, pero no se confirma.
- GPU recomendadas: RTX 3090 (usada en el entrenamiento). Otras GPUs no se mencionan.
- Cabe en GPU de consumo: previsiblemente sí (tamaño de repositorio de 0.5 GB), aunque no se documenta una prueba de inferencia en GPU de gama baja.
- Opciones de despliegue: librería NeuralOps (`neuralops.load_pretrained_bert`), pipeline `fill-mask` de Transformers. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; la dependencia de `custom_code` complica el despliegue estándar.
- Latencia y throughput: 38 049,7 tokens/s en entrenamiento sobre RTX 3090; no se reportan métricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Mecanismo de atencion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/bert-flash-attention3-sst2` | ~110 M (base) | no disponible | `flash_attention3` (subcuadrática) | MIT | Hugging Face, requiere NeuralOps |
| `google-bert/bert-base-uncased` | 110 M | 512 | Self-attention estándar | Apache 2.0 | Hugging Face, Transformers |
| `distilbert-base-uncased` | 66 M | 512 | Self-attention estándar | Apache 2.0 | Hugging Face, Transformers |

La comparación con DistilBERT es orientativa por tamaño y tarea (encoder de enmascaramiento en inglés); no se dispone de métricas comparables de este modelo frente a alternativas en la información proporcionada.

## Limitaciones y advertencias

- La perplejidad MLM de 0.00 es sospechosa y probablemente refleja un artefacto de la evaluación (fuga de información, error de cálculo o sobreajuste al conjunto de validación), no una mejora real; conviene desconfiar de ese dato hasta verificación independiente.
- El modelo solo está entrenado y evaluado en inglés.
- El nombre del repositorio menciona "sst2", pero la model card solo documenta WikiText-2; no hay evidencia de evaluación en SST-2.
- Requiere `custom_code` y la librería NeuralOps, lo que limita la portabilidad y el soporte en ecosistemas estándar.
- No se documentan sesgos, riesgos de alucinación ni comportamiento fuera de la tarea de enmascaramiento.
- Licencia MIT permite uso comercial, pero el modelo base `bert-base-uncased` está bajo Apache 2.0; conviene revisar la compatibilidad de ambas licencias en producción.
- Sin descargas ni likes en el momento de la consulta: no hay validación por parte de la comunidad.
- No apto como sustituto directo de BERT en producción sin una evaluación propia en la tarea objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-flash-attention3-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
