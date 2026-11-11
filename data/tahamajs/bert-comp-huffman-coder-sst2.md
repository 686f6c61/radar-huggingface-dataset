# tahamajs/bert-comp-huffman-coder-sst2

## Resumen

`bert-comp-huffman-coder-sst2` es un checkpoint de `google-bert/bert-base-uncased` afinado para clasificación de sentimiento en GLUE SST-2 y procesado con el motor `huffman_coder` (`HuffmanCompressor`) de la librería NeuralOps, desarrollada por Taha Majlesi. El modelo se distribuye como parte de un zoo de modelos comprimidos ("Compressor Zoo") cuyo objetivo es evaluar técnicas de compresión física de pesos y recuperación mediante LoRA sobre arquitecturas transformer estándar.

El dato clave para interpretar este checkpoint es que, en el rango de compresión publicado (`k=32`), la ratio física de compresión es de `1.00x` y la reducción de parámetros es del `0.0%`: el modelo conserva los `109.483.778` parámetros del BERT-base original. El motor `HuffmanCompressor` se describe en la model card como un perfilador y simulador de compresión por entropía a nivel de modelo, no como un compresor que reduzca el recuento de parámetros en este rango. Por tanto, el interés del checkpoint es metodológico (telemetría de compresión y evaluación Pareto multi-rango) más que de eficiencia real.

La relevancia práctica es limitada pero concreta: sirve como referencia reproducible de un pipeline de compresión con evaluación en RTX 3090, telemetría en `compression_summary.json` y un procedimiento de reconstrucción documentado. La precisión declarada en validación de SST-2 es `91.51%`, frente a un baseline del profesor de `91.63%`, una diferencia de `-0.12%`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-base (12 capas, dimensión oculta 768), cabeza de clasificación de secuencias con 2 etiquetas |
| Parametros totales | 109.483.778 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base BERT-base-uncased admite 512 tokens, pero la model card no lo declara) |
| Tipos de cuantizacion | Compresion via `HuffmanCompressor` (familia `quantization`) con rango `k=32`; no se detallan esquemas de cuantizacion adicionales (INT8, INT4, etc.) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict serializado), mas `config.json`, `compression_summary.json` y activos de tokenizer (`vocab.txt`, `tokenizer.json`, `tokenizer_config.json`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer encoder BERT-base estándar: 12 capas, dimensión oculta 768 y `109.483.778` parámetros, inicializado desde `google-bert/bert-base-uncased` y afinado para clasificación binaria de sentimiento sobre GLUE SST-2. Sobre ese modelo se aplica el motor `HuffmanCompressor` de NeuralOps, que la model card describe como un "perfilador y simulador de compresión por entropía a nivel de modelo". En el rango publicado (`k=32`) no se produce reducción física de parámetros (`1.00x`, `-0.0%`), y la model card indica explícitamente `LoRA Recovery Applied: False` para este checkpoint.

El procedimiento de evaluación descrito se ejecutó sobre una NVIDIA GeForce RTX 3090 (24 GB) con el split de validación de GLUE SST-2 (872 muestras). La política de NeuralOps aplica un "healing" con LoRA (`r=8`, 50 pasos, `lr=2e-4`, presupuesto de 45 s) cuando la compresión zero-shot degrada la precisión más de 2,0 puntos y la reducción supera 1,10x. En los cuatro rangos evaluados (`k=256`, `128`, `64`, `32`) no se activó esa condición: la ratio física se mantuvo en `1.00x` y la precisión zero-shot fue idéntica a la "healed" en todos los casos. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset más allá de GLUE SST-2, ni si hubo RLHF o DPO.

## Capacidades

- Clasificación de sentimiento binaria (negativo/positivo) en inglés, con dos etiquetas de salida (`0=Negative`, `1=Positive`).
- Clasificación de texto corto: el modelo está afinado sobre SST-2, compuesto por frases de crítica cinematográfica.
- Inferencia estándar de `BertForSequenceClassification` mediante `transformers`, cargando pesos con `strict=False` tras reconstruir la topología comprimida.
- Reconstrucción reproducible del pipeline de compresión mediante `compress_model` de `neuralops.core.compression_pipeline`.
- Telemetría de compresión legible por máquina en `compression_summary.json` (rangos `[256, 128, 64, 32]`).
- No se declaran capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes, modo "thinking" ni audio.
- Capacidad multilingüe: no disponible; solo inglés.

## Casos de uso

- Análisis de sentimiento en reseñas cinematográficas: el modelo está afinado específicamente sobre SST-2, por lo que su uso directo más fiable es clasificar frases de crítica de cine en positivo o negativo con una precisión declarada de `91.51%` en validación.
- Referencia de evaluación para pipelines de compresión: sirve como checkpoint de control en experimentos que comparan motores de compresión de NeuralOps sobre BERT-base, ya que publica telemetría Pareto en cuatro rangos y un baseline de profesor (`91.63%`).
- Reproducción de experimentos académicos: el procedimiento de reconstrucción documentado (descarga de `pytorch_model.bin`, `compress_model` con `rank=32`, carga con `strict=False`) permite replicar los resultados en una RTX 3090 sin infraestructura adicional.
- Filtrado de opiniones en inglés en pipelines de datos: al ser un clasificador binario ligero (208,9 MB de pesos), puede integrarse como etapa de filtrado o etiquetado en procesos batch de textos en inglés.
- Docencia y demostración de técnicas de compresión: el par `config.json` + `compression_summary.json` documenta el rango aplicado y la telemetría, lo que facilita explicar el flujo completo de compresión y recuperación LoRA en un curso o tutorial.
- Base para afinamiento posterior en dominios de opinión: al conservar los `109.483.778` parámetros del BERT-base original y no aplicar LoRA en este checkpoint, puede reutilizarse como punto de partida para un ajuste específico en otro corpus de sentimiento en inglés.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente; `verified: false`). Evaluación sobre GLUE SST-2, split de validación (872 muestras), en NVIDIA GeForce RTX 3090.

| Rank (`k`) | Ratio fisico | Parametros comprimidos (reduccion) | Precision zero-shot | Precision con healing | Paridad vs profesor (91,63%) |
|:---:|:---:|---:|---:|---:|---:|
| 256 | 1,00x | 109.483.778 (-0,0%) | 91,51% | 91,51% | -0,12% |
| 128 | 1,00x | 109.483.778 (-0,0%) | 91,51% | 91,51% | -0,12% |
| 64 | 1,00x | 109.483.778 (-0,0%) | 91,51% | 91,51% | -0,12% |
| 32 (checkpoint publicado) | 1,00x | 109.483.778 (-0,0%) | 91,51% | 91,51% | -0,12% |

| Metrica | Valor |
|---|---|
| GLUE SST-2 Validation Accuracy (model-index) | 91,51% |
| Baseline del profesor (BERT-base afinado) | 91,63% |
| Delta de paridad frente al profesor | -0,12% |

No se han publicado en la información disponible resultados de otros benchmarks (MMLU, HumanEval, GSM8K u otros).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita en la model card. Como referencia, el repositorio ocupa 0,2 GB y los pesos declarados son de 208,9 MB, lo que sitúa la inferencia en FP32 en el entorno de 1-2 GB de VRAM incluyendo activaciones y tokenizer.
- GPU utilizadas en la evaluación del autor: NVIDIA GeForce RTX 3090 (24 GB).
- Cabe en GPU de consumo: sí, por el tamaño de pesos (208,9 MB) y el número de parámetros (`109.483.778`); no se especifican modelos concretos adicionales.
- Opciones de despliegue: la model card documenta el uso con `transformers` (`BertForSequenceClassification`) más `neuralops.core.compression_pipeline` para reconstruir la topología comprimida y cargar el state dict con `strict=False`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/bert-comp-huffman-coder-sst2` | 109.483.778 | no disponible | 91,51% | MIT | Hugging Face (`neuralops`, `pytorch_model.bin`) |
| `google-bert/bert-base-uncased` (profesor) | 109.483.778 | no disponible | 91,63% (baseline declarado) | Apache 2.0 (modelo base estándar; no confirmado en la informacion proporcionada) | Hugging Face (`transformers`) |
| Alternativas comparables de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita al modelo base del que deriva, ya que la información proporcionada no incluye otros clasificadores SST-2 con los que contrastar parámetros, contexto o licencia.

## Limitaciones y advertencias

- El checkpoint no reduce parámetros en el rango publicado (`k=32`, ratio `1.00x`, `-0.0%`): no aporta ventaja de eficiencia frente al BERT-base original.
- La precisión declarada (`91.51%`) figura con `verified: false` en el model-index; no hay verificación independiente.
- El modelo está afinado exclusivamente para clasificación de sentimiento binaria en inglés; no se declaran capacidades generativas ni multilingües.
- Posible riesgo de alucinación y de sesgos: no se documentan en la información disponible análisis de sesgo, tasas de error por subgrupo ni comportamiento fuera de distribución.
- La licencia es MIT, lo que permite uso comercial, pero el modelo base `google-bert/bert-base-uncased` tiene su propia licencia que conviene revisar antes de un despliegue en producción.
- El procedimiento de carga requiere reconstruir la topología con `neuralops` y cargar con `strict=False`, lo que puede enmascarar discrepancias entre pesos y arquitectura si no se valida la salida.
- La model card describe `HuffmanCompressor` como "perfilador y simulador"; conviene no asumir que el checkpoint incorpora una compresión física real de los pesos más allá de lo indicado en la telemetría.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-comp-huffman-coder-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del compresor: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/quantization/huffman_coder.py
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
