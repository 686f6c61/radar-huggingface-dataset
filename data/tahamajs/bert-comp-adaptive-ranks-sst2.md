# tahamajs/bert-comp-adaptive-ranks-sst2

## Resumen

`tahamajs/bert-comp-adaptive-ranks-sst2` es un checkpoint de BERT-Base (`google-bert/bert-base-uncased`) comprimido físicamente y posteriormente "curado" con LoRA, publicado por Taha Majlesi dentro del proyecto NeuralOps. El modelo parte del BERT-Base original (109.483.778 parámetros, 12 capas, dimensión oculta 768), afinado sobre GLUE SST-2 y comprimido mediante el compresor `AdaptiveRanksCompressor`, que aplica descomposición en valores singulares (SVD) con selección dinámica de rango por capa según el espectro de energía de los valores singulares. El checkpoint serializado corresponde al rango `k=256`, con 67.034.882 parámetros tras la compresión (reducción del 38,77 %, ratio físico de 1,633x).

El problema que aborda es la compresión de modelos transformer manteniendo la funcionalidad downstream: en lugar de un recorte fijo, el motor elige el rango por capa y, cuando la caída de precisión en zero-shot supera el 2 % con una reducción superior a 1,10x, aplica un "healing" con LoRA de rango 8 (50 pasos, `lr=2e-4`, presupuesto de 45 segundos) para recuperar parte del rendimiento perdido. Es relevante como ejemplo reproducible de un pipeline de compresión con evaluación Pareto multi-rango (k=256, 128, 64, 32) sobre un benchmark estándar como SST-2, y como artefacto de referencia del ecosistema NeuralOps.

El resultado, sin embargo, es modesto: la precisión final del checkpoint publicado es del 75,80 % en la validación de SST-2, frente al 91,63 % del profesor original, una pérdida de paridad de 15,83 puntos. Se trata, por tanto, de un modelo de investigación y demostración de compresión, no de un clasificador de sentimiento listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-Base (12 capas, D=768), comprimido con SVD de rangos adaptativos por capa |
| Parametros totales | 67.034.882 (checkpoint comprimido, k=256); base original: 109.483.778 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de BERT-Base, típicamente 512 tokens; no confirmado en la información) |
| Tipos de cuantizacion | no disponible (el repo empaqueta pesos en `pytorch_model.bin`; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`pytorch_model.bin`), configuración `config.json` con `compression_method: "adaptive_ranks"` y `compression_rank: 256` |

## Arquitectura y entrenamiento

La arquitectura subyacente es BERT-Base uncased: un transformer encoder de 12 capas con dimensión oculta 768, preentrenado por Google y aquí afinado sobre GLUE SST-2 (clasificación binaria de sentimiento). Sobre ese modelo, NeuralOps aplica `AdaptiveRanksCompressor`, un operador de compresión basado en SVD que selecciona el rango de truncamiento de forma dinámica por capa en función de la energía de los valores singulares, en lugar de usar un rango uniforme. El checkpoint publicado fija `k=256` como rango de showcase, lo que produce una reducción del 38,77 % de parámetros (de 109,48 M a 67,03 M) y un ratio de compresión físico de 1,633x.

El proceso de recuperación ("LoRA healing") se activa cuando la compresión zero-shot degrada la precisión más de 2 puntos con una reducción superior a 1,10x: se entrena un adaptador LoRA de rango 8 durante 50 pasos con `lr=2e-4` y un presupuesto de 45 segundos, y los adaptadores se integran en el state dict serializado. La evaluación se realizó físicamente en una NVIDIA GeForce RTX 3090 (24 GB) sobre el split de validación de GLUE SST-2 (872 muestras). No se documentan en la información disponible los datos de preentrenamiento, el volumen de tokens, ni si hubo RLHF/DPO (no aplica a un encoder de clasificación).

## Capacidades

- Clasificación de sentimiento binaria (positivo/negativo) sobre texto en inglés, con dos etiquetas de salida (`num_labels=2`).
- Inferencia estándar de `BertForSequenceClassification` una vez reconstruida la topología comprimida y cargado el state dict con `strict=False`.
- Reconstrucción programática del modelo comprimido mediante `compress_model` de NeuralOps, especificando `method: "adaptive_ranks"` y `rank: 256`.
- Telemetría de compresión machine-readable en `compression_summary.json` para los rangos 256, 128, 64 y 32.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking": es un encoder de clasificación, no un modelo generativo.
- Capacidad multilingüe limitada al inglés (el vocabulario `bert-base-uncased` original cubre principalmente inglés).

## Casos de uso

- Investigación en compresión de modelos: servir como punto de partida reproducible para comparar `AdaptiveRanksCompressor` frente a otras técnicas SVD o de poda sobre un benchmark estándar (SST-2), reutilizando el `compression_summary.json` y la tabla Pareto multi-rango.
- Docencia y divulgación técnica: ilustrar el compromiso entre ratio de compresión y precisión downstream con cifras concretas (1,63x y −15,83 puntos de paridad en k=256; 3,67x y −23,51 en k=32), útil en cursos de eficiencia de modelos.
- Baseline de ablación: usar el checkpoint k=256 como referencia "curada con LoRA" frente a la variante zero-shot (59,52 %) para medir la contribución real del healing.
- Prototipado de pipelines de clasificación de bajo coste: en entornos donde el tamaño del artefacto (128 MB de pesos) importa más que la precisión, como demos o tests de integración end-to-end de NeuralOps.
- Validación de infraestructura de despliegue: probar la carga de checkpoints comprimidos con `strict=False`, la compatibilidad con `transformers` y el flujo de descarga vía `huggingface_hub`.
- Filtrado aproximado de sentimiento en corpus de inglés: solo en escenarios tolerantes a error (etiquetado preliminar, triaje de reseñas) donde una precisión del 75,8 % sea aceptable y no se requiera un clasificador de producción.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (`verified: false`), sobre GLUE SST-2, split de validación (872 muestras), evaluados en RTX 3090.

| Modelo / configuración | Ratio | Params comprimidos | Acc zero-shot | Acc con LoRA | Paridad vs profesor (91,63 %) |
|---|---:|---:|---:|---:|---:|
| BERT-Base profesor (referencia) | 1,00x | 109.483.778 | — | 91,63 % | 0,00 |
| adaptive_ranks k=256 (publicado) | 1,63x | 67.034.882 (−38,8 %) | 59,52 % | 75,80 % | −15,83 |
| adaptive_ranks k=128 | 2,39x | 45.792.002 (−58,2 %) | 52,41 % | 61,47 % | −30,16 |
| adaptive_ranks k=64 | 3,11x | 35.170.562 (−67,9 %) | 51,38 % | 50,92 % | −40,71 |
| adaptive_ranks k=32 | 3,67x | 29.859.842 (−72,7 %) | 50,00 % | 68,12 % | −23,51 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja. Con 67 M de parámetros en fp32, los pesos ocupan aproximadamente 268 MB; en fp16, unos 134 MB. El repo reporta 128 MB de pesos empaquetados. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquiera con al menos 2 GB de VRAM; el autor evaluó en NVIDIA GeForce RTX 3090 (24 GB), pero es sobredimensionada para este modelo. RTX 3060, RTX 4060, T4 o incluso CPU son suficientes para inferencia por lotes pequeños.
- Cabe en GPU consumer: sí, en todas las generaciones recientes (GTX 1060 en adelante) y en iGPU con suficiente memoria compartida.
- Opciones de despliegue: requiere el paquete `neuralops` para reconstruir la topología comprimida antes de cargar el state dict; después es compatible con el stack de `transformers`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (son motores orientados a generación y el checkpoint es un `.bin` de PyTorch con topología no estándar).
- Latencia y throughput: no disponibles en la información proporcionada. El único dato temporal es el presupuesto de 45 segundos para el entrenamiento LoRA de healing en RTX 3090.

## Comparativa con modelos similares

| Modelo | Params | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| tahamajs/bert-comp-adaptive-ranks-sst2 (k=256) | 67,0 M | no disponible | 75,80 % | MIT | Hugging Face |
| google-bert/bert-base-uncased (profesor, afinado SST-2) | 109,5 M | 512 | 91,63 % (referencia del autor) | Apache 2.0 | Hugging Face |
| DistilBERT-base-uncased (destilado) | 66,0 M | 512 | no disponible en la información | Apache 2.0 | Hugging Face |
| Modelos SVD/poda de BERT comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación más directa es con el profesor: el checkpoint comprimido iguala en orden de magnitud el recuento de parámetros de DistilBERT (67 M frente a 66 M) pero rinde 15,83 puntos por debajo del BERT-Base afinado en SST-2. No se dispone de cifras de benchmarks de las alternativas en la información proporcionada, por lo que no se puede establecer una comparación de rendimiento fiable más allá de la referencia del profesor.

## Limitaciones y advertencias

- Pérdida de precisión sustancial: 75,80 % frente al 91,63 % del profesor, una caída de 15,83 puntos. No es apto para producción sin una reevaluación en el dominio objetivo.
- Resultados no verificados: la métrica del model-index está marcada como `verified: false` y procede del propio autor.
- El healing LoRA no es monótono con el rango: k=32 (68,12 %) supera a k=64 (50,92 %) y k=128 (61,47 %), lo que sugiere inestabilidad en el proceso de recuperación y desaconseja extrapolar el comportamiento entre rangos.
- Dependencia de `neuralops`: la carga requiere reconstruir la topología con `compress_model` antes de aplicar el state dict con `strict=False`; no es un checkpoint estándar de `transformers` cargable con `from_pretrained` directo.
- Solo inglés: el vocabulario y el entrenamiento son en inglés; no se documenta rendimiento multilingüe.
- Sin cuantizaciones publicadas (GGUF, AWQ, GPTQ): no hay artefactos listos para llama.cpp u Ollama.
- Riesgo de sesgos y alucinación: al ser un clasificador binario no genera texto, pero hereda los sesgos de `bert-base-uncased` y de SST-2 (reseñas de películas), por lo que puede generalizar mal a otros dominios y mostrar sesgos demográficos del corpus original.
- Licencia MIT: permite uso comercial, pero el modelo base es Apache 2.0; conviene revisar ambas. Aun así, el uso comercial de este checkpoint concreto no está recomendado por su precisión.
- Fecha de creación futura (2026-11-10) en los metadatos del repo: tratarlo como artefacto experimental de un proyecto de investigación en curso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-comp-adaptive-ranks-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del compresor: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/svd/adaptive_ranks.py
- Licencia del proyecto: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset GLUE (SST-2): https://huggingface.co/datasets/nyu-mll/glue
