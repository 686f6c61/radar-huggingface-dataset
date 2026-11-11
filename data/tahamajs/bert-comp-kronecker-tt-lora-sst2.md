# tahamajs/bert-comp-kronecker-tt-lora-sst2

## Resumen

`bert-comp-kronecker-tt-lora-sst2` es un checkpoint de BERT-base comprimido físicamente y posteriormente "curado" con LoRA, publicado por el autor individual Taha Majlesi bajo el paraguas de la librería NeuralOps. No es un modelo de propósito general, sino un artefacto de investigación sobre compresión de modelos: parte de `google-bert/bert-base-uncased` (109,5 M de parámetros, 12 capas, dimensión oculta 768) afinado previamente en GLUE SST-2 y le aplica el compresor `kronecker_tt_lora` (familia `tensor_decomp`) para reducir el número de parámetros.

El resultado declarado es un checkpoint con 38.741.762 parámetros (-64,61 %), lo que equivale a una ratio de compresión física de 2,83x, al que se le ha aplicado un "healing" con LoRA de rango 8 (50 pasos, lr=2e-4, presupuesto de 45 segundos) para recuperar parte de la precisión perdida. El modelo se serializa como `pytorch_model.bin` junto con `config.json`, `compression_summary.json` y los activos del tokenizador estándar de BERT uncased.

Su relevancia es metodológica, no de producto: sirve como referencia reproducible de hasta qué punto una técnica de descomposición tensorial tipo Kronecker/TT combinada con LoRA preserva la precisión en una tarea de clasificación concreta. Los números publicados muestran una caída muy severa respecto al profesor (62,73 % frente a 91,63 % en la validación de SST-2), por lo que debe interpretarse como un experimento de compresión y no como un clasificador de sentimiento listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-base (12 capas, D=768), comprimido con Kronecker-TT-LoRA |
| Parámetros totales | 38.741.762 (checkpoint comprimido); 109.483.778 en el modelo base original |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base BERT acepta hasta 512 tokens) |
| Tipos de cuantización | no disponible (el artefacto se distribuye como `pytorch_model.bin` en precisión completa) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`pytorch_model.bin`), con tokenizador BERT estándar (`vocab.txt`, `tokenizer.json`, `tokenizer_config.json`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es el encoder transformer de BERT-base uncased: 12 capas, dimensión oculta 768 y 109.483.778 parámetros. Sobre ese modelo ya afinado en SST-2 se aplica el compresor `kronecker_tt_lora` de NeuralOps, que combina descomposición tensorial (Kronecker y tensor-train) con adaptadores de bajo rango. El checkpoint serializado corresponde al rango de compresión `k=256`, con 38.741.762 parámetros efectivos y un ratio físico de 2,826x respecto al original.

El proceso de recuperación descrito en la model card es el siguiente: se evalúa la compresión en zero-shot y, si la precisión cae más de 2,0 puntos con una reducción superior a 1,10x, se aplica un "healing" con LoRA de rango 8 durante 50 pasos con lr=2e-4 y un presupuesto de 45 segundos. En el rango k=256, el zero-shot arroja 50,11 % de accuracy en la validación de SST-2 y el modelo curado con LoRA alcanza 62,73 %. La evaluación se realizó físicamente en una NVIDIA GeForce RTX 3090 (24 GB) sobre las 872 muestras de la partición de validación de GLUE SST-2. No se detalla la composición del dataset de entrenamiento más allá de GLUE SST-2, ni si hubo RLHF/DPO (no aplica en un clasificador).

## Capacidades

- Clasificación de sentimiento binaria (positivo/negativo) sobre texto en inglés, con dos etiquetas de salida (`num_labels=2`).
- Inferencia sobre entradas cortas tipo reseña o frase, propio del dominio SST-2.
- No soporta generación de texto, razonamiento, código, matemáticas ni visión.
- No soporta tool calling ni function calling.
- No está diseñado para agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés (vocabulario `bert-base-uncased`).
- No dispone de modo "thinking", ni capacidades de audio o visión.

## Casos de uso

- Investigación en compresión de modelos: punto de comparación reproducible para medir la pérdida de precisión de la técnica Kronecker-TT-LoRA frente al profesor BERT-base en SST-2 (91,63 % → 62,73 %).
- Reproducción de experimentos de descomposición tensorial: el `compression_summary.json` incluido permite auditar los resultados en los rangos k=256, 128, 64 y 32 y contrastar los fallos de compresión documentados.
- Docencia y divulgación: ejemplo práctico de pipeline de compresión + healing con LoRA sobre un transformer pequeño, ejecutable en una sola GPU consumer.
- Pruebas de integración de la librería NeuralOps: validar el flujo `compress_model` → carga de `state_dict` → inferencia descrito en la model card.
- Baseline de referencia para estudiar el suelo de precisión tras compresión agresiva: útil para fijar el umbral por debajo del cual una técnica de compresión no es viable en clasificación de sentimiento.
- Prototipado interno de clasificadores de bajo coste donde se tolere una precisión en torno al 60 % y se priorice el tamaño reducido del checkpoint (74,1 MB declarados).

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados, `verified: false`):

| Modelo / configuración | GLUE SST-2 (validación), accuracy |
|---|---|
| Profesor: BERT-base fine-tuned (referencia del autor) | 91,63 % |
| `bert-comp-kronecker-tt-lora-sst2`, k=256, zero-shot | 50,11 % |
| `bert-comp-kronecker-tt-lora-sst2`, k=256, con LoRA healing | 62,73 % |
| Compresión k=32, zero-shot | 50,11 % |
| Compresión k=32, con LoRA healing | 50,92 % |
| Compresión k=128 | fallo (FAIL_CRASH) |
| Compresión k=64 | fallo (FAIL_CRASH) |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy reducida; el checkpoint comprimido ocupa 74,1 MB en disco y el modelo reconstruido ronda los 38,7 M de parámetros, por lo que cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: cualquier GPU moderna; el autor evaluó en una NVIDIA GeForce RTX 3090 (24 GB), pero el modelo es sobradamente pequeño para RTX 3060, RTX 4060, RTX 4090 o incluso CPU.
- Cabe en GPU consumer: sí, en todas las gamas actuales.
- Opciones de despliegue: la model card solo documenta el flujo con la librería NeuralOps (`compress_model` + `BertForSequenceClassification` de Transformers). No se mencionan vLLM, llama.cpp, Ollama ni TGI; la naturaleza del checkpoint (topología comprimida que requiere reconstrucción previa) hace que estos motores no sean compatibles de forma directa sin trabajo adicional.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SST-2 (validación) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `bert-comp-kronecker-tt-lora-sst2` (k=256) | 38,7 M (comprimido) | no disponible | 62,73 % (declarado, no verificado) | MIT | Hugging Face |
| `google-bert/bert-base-uncased` fine-tuned en SST-2 (profesor) | 109,5 M | 512 tokens | 91,63 % (referencia del autor) | Apache 2.0 | Hugging Face |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66 M | 512 tokens | no disponible en la información proporcionada | Apache 2.0 | Hugging Face |

La comparación con DistilBERT se incluye por proximidad de tamaño, pero no se dispone de su métrica exacta en la información proporcionada; no se han encontrado otras alternativas comparables en la búsqueda web realizada.

## Limitaciones y advertencias

- Pérdida de precisión muy significativa: 62,73 % frente al 91,63 % del profesor, una diferencia de -28,90 puntos. No es apto para producción como clasificador de sentimiento.
- Los rangos k=128 y k=64 fallan con `FAIL_CRASH` según la propia model card; la técnica no es estable en todo el espacio de compresión.
- El resultado de 62,73 % está marcado como `verified: false`; procede únicamente del autor y no ha sido replicado de forma independiente.
- Riesgo elevado de alucinación y predicciones erróneas por la degradación inducida por la compresión; el modelo puede comportarse cerca del azar en algunos rangos (50,11 % zero-shot, 50,92 % con LoRA en k=32).
- Sesgos heredados de `bert-base-uncased` y del corpus SST-2 (reseñas de cine en inglés), sin mitigaciones documentadas.
- Limitación de idioma: solo inglés; el tokenizador uncased no cubre adecuadamente otros idiomas.
- La licencia MIT permite uso comercial, pero el modelo base BERT de Google está bajo Apache 2.0; conviene revisar la compatibilidad y atribución en un despliegue comercial.
- Requiere reconstruir la topología comprimida con la librería NeuralOps antes de cargar el `state_dict`; no es un checkpoint cargable directamente con `from_pretrained` de Transformers.
- El contexto máximo no se documenta en la model card; el límite práctico es el de BERT-base (512 tokens), pero no se confirma para la topología comprimida.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validación de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-comp-kronecker-tt-lora-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del compresor: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/tensor_decomp/kronecker_tt_lora.py
- Licencia: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
