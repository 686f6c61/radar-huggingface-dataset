# tahamajs/bert-comp-liftr-sst2

## Resumen

`bert-comp-liftr-sst2` es un checkpoint experimental de BERT-Base (`google-bert/bert-base-uncased`) comprimido físicamente mediante el motor `liftr` de la librería NeuralOps y posteriormente "sanado" con LoRA. Lo publica Taha Majlesi (usuario `tahamajs`) como parte de un zoo de modelos comprimidos orientado a estudiar el compromiso entre ratio de compresión y precisión en tareas downstream. El modelo está afinado para clasificación de sentimiento binaria sobre GLUE SST-2.

La relevancia de esta ficha no está en el rendimiento —que es muy bajo— sino en su valor como caso de estudio metodológico: documenta explícitamente una compresión de 1,83x con reducción del 45,3% de parámetros y muestra que, en este caso concreto, la recuperación con LoRA no logra acercarse al profesor (91,63% frente a 50,92% de accuracy). Es, por tanto, un ejemplo útil de resultado negativo reproducible más que un modelo listo para producción.

El repositorio ocupa 0,1 GB, incluye pesos serializados en `pytorch_model.bin`, configuración etiquetada con `compression_method: "liftr"` y telemetría de compresión en `compression_summary.json`. No se publican datos sobre longitud de contexto efectiva tras la compresión ni sobre cuantizaciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-Base (12 capas, dimensión oculta 768), comprimido con LIFTR |
| Parametros totales | 59.901.698 (tras compresión; base original: 109.483.778) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base BERT-Base admite 512 tokens; la model card no lo confirma tras la compresión) |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en `pytorch_model.bin` sin indicar cuantización) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`pytorch_model.bin`), no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased` (12 capas, D=768, 109.483.778 parámetros) ya afinado sobre GLUE SST-2, con un baseline docente de 91,63% de accuracy. Sobre esa base se aplica el compresor `liftr` (`liftr_compressor_entry`, familia experimental) de NeuralOps, que reduce la topología a 59.901.698 parámetros (1,828x de compresión física, -45,29%). El checkpoint empaquetado corresponde al rank `k=32`, seleccionado como showcase tras una evaluación Pareto multi-rank sobre `k=256, 128, 64, 32`; el rank `k=128` falló con `FAIL_CRASH` y no se reportan resultados.

Cuando la compresión zero-shot degrada la accuracy más de 2,0 puntos con una reducción superior a 1,10x, NeuralOps aplica un "healing" con LoRA de rango `r=8`, 50 pasos, learning rate `2e-4` y un presupuesto de 45 segundos. En este modelo el healing eleva la accuracy de 49,08% (zero-shot) a 50,92%, una mejora de 1,84 puntos que deja una brecha de -40,71 puntos respecto al profesor. La evaluación se realizó físicamente en una NVIDIA GeForce RTX 3090 (24 GB) sobre el split de validación de SST-2 (872 muestras). No se documentan detalles sobre el dataset de entrenamiento más allá de GLUE SST-2 ni sobre el proceso de fine-tuning original.

## Capacidades

- Clasificación de sentimiento binaria (negativo/positivo) sobre texto en inglés, tarea para la que fue afinado.
- Inferencia estándar de `BertForSequenceClassification` tras reconstruir la topología comprimida con `compress_model` y cargar el state dict con `strict=False`.
- Tokenización compatible con el vocabulario estándar de `bert-base-uncased` (`vocab.txt`, `tokenizer.json`, `tokenizer_config.json`).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo "thinking", visión ni audio.
- Capacidad multilingüe limitada al inglés.
- Generación de texto: no aplica (es un modelo encoder de clasificación).

## Casos de uso

- Estudio de metodologías de compresión: sirve como referencia reproducible para comparar el compresor `liftr` frente a otras técnicas (poda, cuantización, destilación) sobre un mismo baseline BERT-SST-2.
- Análisis de resultados negativos en investigación: el checkpoint documenta que un healing LoRA de 50 pasos con `r=8` no recupera la precisión perdida en este régimen de compresión, lo que resulta útil para calibrar expectativas y diseñar experimentos de recuperación más agresivos.
- Docencia y formación: ejemplo didáctico de pipeline completo de compresión (compresión física, evaluación Pareto multi-rank, healing con LoRA y serialización) usando la API de NeuralOps.
- Pruebas de integración de la librería NeuralOps: valida el flujo `compress_model` + `load_state_dict(strict=False)` en un caso real con pesos publicados.
- Benchmark de infraestructura de inferencia: al ser un modelo pequeño (59,9 M de parámetros, 115,8 MB de pesos), permite medir latencia y throughput de frameworks de serving sin requerir GPU de gama alta.
- Reproducción de experimentos académicos: útil para verificar la telemetría de `compression_summary.json` y contrastar los resultados declarados en el model-index.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index y en la model card (no verificados, `verified: false`):

| Modelo / configuración | Dataset | Split | Accuracy |
|---|---|---|---|
| Profesor (`bert-base-uncased` SST-2) | GLUE SST-2 | validation | 91,63% |
| `bert-comp-liftr-sst2` (k=32, LoRA healing) | GLUE SST-2 | validation | 50,92% |
| `bert-comp-liftr-sst2` (zero-shot, sin healing) | GLUE SST-2 | validation | 49,08% |

Evaluación multi-rank declarada por el autor (872 muestras, RTX 3090):

| Rank (`k`) | Ratio físico | Params comprimidos | Zero-shot | Healed | Paridad vs profesor |
|:---:|:---:|---:|---:|---:|---:|
| 256 | 1,83x | 59.901.698 (-45,3%) | 49,08% | 50,92% (LoRA) | -40,71% |
| 128 | — | — | FAIL_CRASH | — | — |
| 64 | 1,83x | 59.901.698 (-45,3%) | 49,08% | 50,92% (LoRA) | -40,71% |
| 32 | 1,83x | 59.901.698 (-45,3%) | 49,08% | 50,92% (LoRA) | -40,71% |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para 59,9 M de parámetros (aproximadamente 240 MB de pesos más activaciones); en la práctica cabe en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; la evaluación del autor se realizó en una NVIDIA GeForce RTX 3090 (24 GB), pero el modelo es sobradamente pequeño para GPUs de gama baja (GTX 1650, RTX 3050) o incluso CPU.
- Cabe en consumer GPU: sí, en todas las GPU consumer modernas.
- Opciones de despliegue: la model card solo documenta la carga vía `transformers` + `neuralops` (`compress_model` y `load_state_dict`). No se proporcionan pesos en formato GGUF ni safetensors, por lo que `llama.cpp`, Ollama o vLLM no son compatibles directamente sin conversión previa.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Accuracy SST-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `bert-comp-liftr-sst2` | 59,9 M (comprimido) | no disponible | 50,92% (validation) | MIT | Hugging Face |
| `google-bert/bert-base-uncased` (profesor) | 109,5 M | 512 tokens | 91,63% (validation, según el autor) | Apache 2.0 | Hugging Face |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66 M | 512 tokens | no disponible en la información | Apache 2.0 | Hugging Face |
| `textattack/bert-base-uncased-SST-2` | 109,5 M | 512 tokens | no disponible en la información | Apache 2.0 | Hugging Face |

La comparativa con DistilBERT y con el BERT afinado de TextAttack es pertinente por tamaño y tarea, pero no se dispone de sus cifras exactas en la información proporcionada, por lo que no se incluyen valores inventados.

## Limitaciones y advertencias

- Rendimiento muy degradado: 50,92% de accuracy en SST-2 equivale prácticamente a una clasificación aleatoria binaria; el modelo no es apto para uso en producción.
- Brecha de -40,71 puntos respecto al profesor: el healing LoRA aplicado (r=8, 50 pasos) no recupera la precisión perdida.
- El rank `k=128` falló con `FAIL_CRASH`; los ranks 256, 64 y 32 reportan parámetros idénticos (59.901.698), lo que sugiere que la compresión efectiva no varía entre ellos y conviene tratar los resultados con cautela.
- Resultados no verificados (`verified: false` en el model-index): no han sido validados de forma independiente.
- Solo inglés: no soporta otros idiomas.
- Solo clasificación binaria de sentimiento: no es un modelo generativo ni un encoder de propósito general tras la compresión.
- Licencia MIT: permite uso comercial, pero el estado experimental y el bajo rendimiento desaconsejan cualquier despliegue real.
- Riesgo de alucinación: no aplica en sentido estricto (no genera texto), pero sí hay riesgo de predicciones erróneas sistemáticas por la degradación de la representación.
- No se documentan sesgos específicos; al derivar de `bert-base-uncased` y SST-2, hereda los sesgos del corpus original y del dataset de sentimiento.
- Formato de pesos no estándar: requiere reconstruir la topología con `neuralops` antes de cargar el state dict; no es cargable directamente con `from_pretrained` de `transformers`.
- Longitud de contexto tras la compresión no documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-comp-liftr-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del compresor LIFTR: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/experimental/liftr.py
- Licencia del proyecto: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
