# tahamajs/bert-comp-enlighten-compressor-sst2

## Resumen

`tahamajs/bert-comp-enlighten-compressor-sst2` es un checkpoint comprimido y "curado" mediante LoRA de `google-bert/bert-base-uncased`, ajustado para clasificación de sentimiento binaria en GLUE SST-2. Lo publica el autor tahamajs dentro del proyecto NeuralOps, una librería de compresión de modelos que agrupa distintos motores bajo el nombre de "Compressor Zoo". El modelo no es un BERT nuevo: es el BERT-Base original pasado por el compresor `ENLightenCompressor`, que combina descomposición SVD de bajo rango con sparsity estructurada 2:4, y posteriormente reparado con un adaptador LoRA de rango 8.

La relevancia del artefacto es fundamentalmente metodológica: sirve como ejemplo reproducible de hasta dónde se puede comprimir un transformer de 109,5 M de parámetros sin colapsar del todo la tarea. En el rango de compresión seleccionado (`k=128`) el modelo conserva 45,8 M de parámetros, un 58,2 % menos, con una ratio de compresión física de 2,39x. El coste en calidad es alto: la accuracy en validación de SST-2 cae del 91,63 % del profesor al 71,90 % reportado por el autor.

Se trata, por tanto, de un modelo de nicho orientado a experimentación con técnicas de compresión, no a producción. La licencia MIT y el hecho de que los pesos se serialicen como `pytorch_model.bin` con topología reconstruible mediante la propia librería NeuralOps facilitan su uso como banco de pruebas, pero la pérdida de casi 20 puntos de accuracy frente al original limita seriamente su utilidad práctica en clasificación de sentimiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-Base) con compresión de bajo rango y sparsity 2:4 estructurada |
| Parámetros totales | 45.782.786 (checkpoint comprimido, `k=128`); el modelo base tiene 109.483.778 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el BERT-Base original soporta 512 tokens) |
| Tipos de cuantización | No disponible; el checkpoint se distribuye en `pytorch_model.bin` (fp32 presumiblemente) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict serializado con factores de bajo rango y adaptadores LoRA integrados); tokenizer estándar de `bert-base-uncased` |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer encoder BERT-Base de 12 capas y dimensión oculta 768, preentrenado originalmente por Google y ajustado en GLUE SST-2. Sobre ese modelo, el compresor `ENLightenCompressor` aplica una descomposición SVD de bajo rango con rango `k=128` combinada con sparsity estructurada 2:4 alineada con hardware fotónico, según describe la model card. El resultado es una topología física distinta a la original, no una simple máscara: los parámetros se reducen de 109,5 M a 45,8 M.

El proceso de "curación" o *healing* consiste en aplicar un adaptador LoRA de rango `r=8` durante 50 pasos con `lr=2e-4` y un presupuesto de 45 segundos, activado automáticamente cuando la compresión zero-shot degrada más de 2 puntos porcentuales la accuracy. En el rango `k=128` la compresión zero-shot daba 52,41 % de accuracy; tras el healing LoRA sube a 71,90 %. Los datos de evaluación son el split de validación de GLUE SST-2 con 872 muestras, ejecutado sobre una RTX 3090 de 24 GB. No se detalla en la información disponible la composición exacta del dataset de entrenamiento más allá de GLUE SST-2, ni si hubo otras fases de ajuste.

## Capacidades

- Clasificación de sentimiento binaria (negativo/positivo) en inglés, específicamente sobre el dominio de reseñas de SST-2.
- Generación de logits para dos clases mediante `BertForSequenceClassification` con `num_labels=2`.
- Inferencia estándar con tokenizer de `bert-base-uncased` (vocabulario WordPiece en minúsculas).
- No soporta tool calling ni function calling: es un clasificador, no un modelo generativo.
- No soporta agentes ni razonamiento multi-paso.
- Capacidad multilingüe: no, solo inglés.
- No dispone de modo "thinking", visión ni audio.
- Uso previsto: evaluación de pipelines de compresión y comparación de técnicas de bajo rango.

## Casos de uso

- **Investigación en compresión de modelos**: sirve como referencia reproducible para medir el impacto de SVD de bajo rango más sparsity 2:4 sobre un BERT-Base en una tarea estándar. El `compression_summary.json` incluido permite comparar los rangos `k=256, 128, 64, 32` sin reentrenar.
- **Prototipado de clasificadores de sentimiento con restricciones de memoria**: en entornos donde 45,8 M de parámetros frente a 109,5 M marcan la diferencia (dispositivos embebidos, contenedores con límite estricto de RAM), el modelo puede servir como primera aproximación, aceptando la pérdida de accuracy.
- **Banco de pruebas de técnicas de healing con LoRA**: el checkpoint documenta el efecto del adaptador LoRA de rango 8 aplicado tras la compresión, útil para validar metodologías de recuperación de precisión en pipelines propios.
- **Educación y demostraciones**: ejemplo didáctico de cómo se degrada y se recupera parcialmente un modelo tras compresión agresiva, con métricas antes y después publicadas.
- **Evaluación comparativa de compresores**: al formar parte del "Compressor Zoo" de NeuralOps, permite contrastar `enlighten_compressor` con otros motores de la misma librería sobre el mismo checkpoint base y dataset.
- **Pipeline de clasificación de reseñas de baja criticidad**: en escenarios donde un 71,9 % de accuracy es aceptable (filtrado preliminar, etiquetado aproximado de grandes volúmenes de texto en inglés) y el ahorro de memoria prima sobre la precisión.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente, `verified: false`). Evaluación sobre GLUE SST-2, split de validación, 872 muestras, RTX 3090.

| Rank (`k`) | Ratio físico | Parámetros comprimidos (reducción) | Accuracy zero-shot | Accuracy tras LoRA | Delta vs profesor (91,63 %) |
|:---:|:---:|---:|---:|---:|---:|
| 256 | 1,63x | 67.016.450 (-38,8 %) | 59,52 % | 56,08 % (LoRA) | -35,55 % |
| **128** ⭐ | **2,39x** | **45.782.786 (-58,2 %)** | **52,41 %** | **71,90 % (LoRA)** | **-19,73 %** |
| 64 | 3,11x | 35.165.954 (-67,9 %) | 51,38 % | 50,92 % (LoRA) | -40,71 % |
| 32 | 3,67x | 29.857.538 (-72,7 %) | 50,11 % | 69,15 % (LoRA) | -22,48 % |

El checkpoint empaquetado en el repositorio es el de `k=128`. El profesor (`bert-base-uncased` sin comprimir, ajustado en SST-2) alcanza 91,63 % de accuracy según el autor. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K) en la información disponible, lo cual es esperable dado que el modelo solo realiza clasificación binaria.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja. Con 45,8 M de parámetros en fp32, el checkpoint ocupa aproximadamente 183 MB en memoria; el repositorio completo pesa 0,1 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el autor evaluó sobre una NVIDIA GeForce RTX 3090 (24 GB), pero el modelo cabe holgadamente en GPUs de 4-8 GB e incluso en CPU.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4060, GTX 1660, etc.) y en CPU con latencias aceptables para clasificación.
- Opciones de despliegue: la carga requiere reconstruir la topología con `neuralops.core.compression_pipeline.compress_model` antes de cargar el state dict; no es un checkpoint estándar cargable directamente con `AutoModel.from_pretrained`. Una vez reconstruido, puede servirse con PyTorch nativo o exportarse a TorchScript/ONNX. No se documenta soporte directo en vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| `tahamajs/bert-comp-enlighten-compressor-sst2` (k=128) | 45,8 M | no disponible | 71,90 % | MIT | Hugging Face, requiere NeuralOps |
| `google-bert/bert-base-uncased` (profesor SST-2) | 109,5 M | 512 | 91,63 % (según autor) | Apache 2.0 | Hugging Face, transformers estándar |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66,9 M | 512 | ~91 % (referencia habitual, no verificada aquí) | Apache 2.0 | Hugging Face, transformers estándar |
| `textattack/bert-base-uncased-SST-2` | 109,5 M | 512 | ~92 % (referencia habitual, no verificada aquí) | Apache 2.0 | Hugging Face, transformers estándar |

La comparación directa con DistilBERT es la más pertinente en tamaño: DistilBERT ofrece 66,9 M de parámetros con una accuracy en SST-2 sustancialmente superior a la del checkpoint comprimido, lo que sugiere que la compresión de bajo rango con healing LoRA de este artefacto no supera a la destilación como estrategia de reducción para esta tarea. Los valores de DistilBERT y textattack no están verificados en la información proporcionada y se incluyen solo como referencia de categoría.

## Limitaciones y advertencias

- **Pérdida de accuracy severa**: 71,90 % frente al 91,63 % del profesor, una caída de 19,73 puntos. No es apto para producción donde la precisión importe.
- **Resultados no verificados**: el autor marca la métrica como `verified: false`; no hay evaluación independiente.
- **Carga no estándar**: requiere la librería NeuralOps y reconstruir la topología comprimida antes de cargar el state dict. No funciona con `AutoModel.from_pretrained` directamente.
- **Solo inglés y solo SST-2**: el ajuste está orientado a reseñas de sentimiento; el rendimiento en otros dominios o idiomas no está documentado.
- **Riesgo de sesgos**: hereda los sesgos del corpus de preentrenamiento de BERT-Base (texto web en inglés) y del dataset SST-2, con posible sesgo de dominio y de anotación.
- **Riesgo de alucinación**: no aplica en sentido generativo, pero sí puede producir clasificaciones erróneas con alta confianza en entradas ambiguas o fuera de distribución.
- **Restricciones de licencia**: MIT permite uso comercial, pero la licencia del modelo base (Apache 2.0 para BERT-Base) y las condiciones de uso de GLUE deben respetarse igualmente.
- **Sin soporte documentado para motores de inferencia estándar**: no hay integración con vLLM, TGI, llama.cpp ni Ollama; el despliegue requiere trabajo adicional.
- **Fecha de creación futura**: el repositorio figura creado el 2026-11-10, lo que conviene contrastar antes de usarlo como referencia estable.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/bert-comp-enlighten-compressor-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Implementación del compresor: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/low_rank/enlighten_compressor.py
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
