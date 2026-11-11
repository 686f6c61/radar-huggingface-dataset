# tahamajs/bert-comp-admm-compressor-sst2

## Resumen

`tahamajs/bert-comp-admm-compressor-sst2` es un checkpoint de BERT-base comprimido mediante la librería NeuralOps y ajustado para clasificación de sentimiento en GLUE SST-2. Lo publica Taha Majlesi dentro del proyecto NeuralOps, un marco de compresión de modelos que combina poda estructurada conjunta y cuantización uniforme mediante ADMM (Alternating Direction Method of Multipliers). El modelo parte de `google-bert/bert-base-uncased` (109.483.778 parámetros, 12 capas, dimensión oculta 768) y se presenta como el artefacto serializado del rango `k=32` del zoo de compresores.

El interés del repositorio no está en el rendimiento absoluto, sino en su función como ejemplo reproducible de un pipeline de compresión: incluye telemetría de varios rangos (`k=256, 128, 64, 32`), el estado comprimido completo y los artefactos de tokenización. No obstante, los propios datos de la model card revelan una limitación importante: la compresión física declarada es de `1.00x` (0,0 % de reducción de parámetros) en todos los rangos evaluados, por lo que el checkpoint no es más pequeño que el modelo base.

La precisión declarada en la validación de SST-2 es del 83,26 %, frente al 91,63 % del modelo profesor, una caída de 8,37 puntos. El modelo está pensado para experimentación con técnicas de compresión y para servir de referencia en el ecosistema NeuralOps, no como un clasificador de sentimiento listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-base), 12 capas, dimensión oculta 768 |
| Parámetros totales | 109.483.778 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base BERT-base-uncased admite hasta 512 tokens, pero la model card no lo declara explícitamente) |
| Tipos de cuantización | Cuantización uniforme aplicada por ADMMCompressor (detalles de bits no disponibles); pesos serializados en `pytorch_model.bin` |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`pytorch_model.bin`), requiere reconstrucción de topología con NeuralOps |
| Compresor | `admm_compressor` (`ADMMCompressor`, familia `pruning`) |
| Rango de compresión (`k`) | 32 (checkpoint serializado) |
| Ratio de compresión físico | 1,00x (0,0 % de reducción) |
| Tamaño del repo | 0,5 GB |
| Pesos declarados | 451,9 MB |
| Modelo base | `google-bert/bert-base-uncased` |
| Dataset de ajuste | `nyu-mll/glue`, configuración `sst2` |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer encoder BERT-base estándar: 12 capas, 768 dimensiones ocultas y 109.483.778 parámetros, preentrenado por Google como `bert-base-uncased` y ajustado posteriormente en GLUE SST-2. Sobre ese modelo, NeuralOps aplica `ADMMCompressor`, un motor que combina poda estructurada conjunta con cuantización uniforme mediante el método ADMM. El resultado se serializa junto con los búferes de cuantización y los factores de bajo rango.

El pipeline de evaluación se ejecutó físicamente en una NVIDIA GeForce RTX 3090 (24 GB) sobre las 872 muestras de validación de SST-2. La model card describe una política de "LoRA healing": cuando la compresión zero-shot degrada la precisión más de 2,0 puntos con una reducción superior a 1,10x, se aplica un ajuste LoRA con `r=8`, 50 pasos, `lr=2e-4` y un presupuesto de 45 segundos. En este checkpoint concreto, sin embargo, la columna "LoRA Recovery Applied" figura como `False` y el ratio físico es 1,00x, de modo que la curación LoRA no llegó a activarse.

No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset más allá de GLUE SST-2, ni si hubo RLHF o DPO (procedimientos poco habituales en un clasificador de sentimiento). Tampoco se especifican los bits de cuantización ni la estructura exacta de la poda aplicada.

## Capacidades

- Clasificación de sentimiento binaria (negativo/positivo) sobre texto en inglés, con dos etiquetas de salida.
- Ajuste específico sobre GLUE SST-2, orientado a frases cortas de reseñas.
- Inferencia estándar de `BertForSequenceClassification` una vez reconstruida la topología comprimida con NeuralOps.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso.
- No se declara capacidad multilingüe: solo inglés.
- No se declaran modos especiales (thinking mode, visión, audio) ni generación de texto libre.

## Casos de uso

- Investigación en compresión de modelos: el checkpoint sirve como artefacto reproducible para comparar el efecto de `ADMMCompressor` frente al modelo profesor en una tarea downstream acotada como SST-2.
- Evaluación de pipelines NeuralOps: permite validar el flujo de reconstrucción (`compress_model` + `load_state_dict` con `strict=False`) y comprobar la compatibilidad de la telemetría de `compression_summary.json` con distintas versiones de la librería.
- Reproducción de experimentos académicos: útil para replicar la tabla Pareto de rangos `k=256, 128, 64, 32` y verificar la política de LoRA healing en un entorno controlado.
- Clasificación de sentimiento en prototipos internos: puede emplearse para etiquetar reseñas en inglés en entornos de desarrollo donde la caída de 8,37 puntos frente al profesor sea aceptable y no se requiera latencia crítica.
- Docencia y formación: ejemplo didáctico de cómo se serializa un modelo comprimido con búferes de cuantización y factores de bajo rango, y de los compromisos entre ratio de compresión y precisión.
- Benchmarking de hardware: al mantener el mismo número de parámetros que el modelo base, permite medir el coste de reconstrucción de la topología NeuralOps frente a la carga directa de un BERT-base convencional.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`):

| Benchmark | Métrica | Valor |
|---|---|---|
| GLUE SST-2 (validation) | Accuracy | 83,26 % |
| GLUE SST-2, modelo profesor | Accuracy | 91,63 % |
| Paridad frente al profesor | Delta | -8,37 % |

Evaluación multi-rango declarada (RTX 3090, 872 muestras de validación):

| Rango (`k`) | Ratio físico | Parámetros comprimidos | Zero-shot | Con healing |
|:---:|:---:|---:|---:|---:|
| 256 | 1,00x | 109.483.778 (-0,0 %) | 83,26 % | 83,26 % |
| 128 | 1,00x | 109.483.778 (-0,0 %) | 83,26 % | 83,26 % |
| 64 | 1,00x | 109.483.778 (-0,0 %) | 83,26 % | 83,26 % |
| 32 | 1,00x | 109.483.778 (-0,0 %) | 83,26 % | 83,26 % |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 109.483.778 parámetros en FP32, el peso ronda los 437 MB; en FP16, unos 219 MB. A ello hay que sumar los búferes de cuantización y los factores de bajo rango incluidos en el checkpoint.
- GPU recomendadas: la model card solo documenta la evaluación en NVIDIA GeForce RTX 3090 (24 GB); no se especifican otras GPU.
- Cabe en GPU de consumo: sí, por tamaño (menos de 0,5 GB de pesos), en cualquier GPU con al menos 2-4 GB de VRAM libre, aunque no se documenta oficialmente.
- Opciones de despliegue: la carga requiere `transformers` junto con la librería `neuralops` para reconstruir la topología antes de aplicar `load_state_dict`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| `tahamajs/bert-comp-admm-compressor-sst2` | 109.483.778 | No disponible | 83,26 % | MIT | Hugging Face, requiere NeuralOps |
| `google-bert/bert-base-uncased` (profesor) | 109.483.778 | 512 tokens | 91,63 % | Apache 2.0 | Hugging Face, `transformers` estándar |
| `textattack/bert-base-uncased-SST-2` | ~110 M | 512 tokens | No disponible en la información | No disponible | Hugging Face |

No se dispone de datos de benchmarks de las alternativas dentro de la información proporcionada, por lo que la comparación de rendimiento se limita al modelo profesor declarado por el autor.

## Limitaciones y advertencias

- La compresión física declarada es de 1,00x (0,0 % de reducción de parámetros) en todos los rangos evaluados: el checkpoint no es más pequeño que el modelo base, lo que cuestiona su utilidad práctica como modelo comprimido.
- La precisión cae 8,37 puntos frente al profesor (83,26 % frente a 91,63 %), una degradación considerable para una tarea tan acotada como SST-2.
- Los resultados de benchmark están marcados como no verificados (`verified: false`) y proceden únicamente del autor.
- El checkpoint no es cargable con `transformers` de forma directa: exige reconstruir la topología con `compress_model` de NeuralOps y usar `strict=False` en `load_state_dict`, lo que puede ocultar discrepancias de pesos.
- Solo soporta inglés y está especializado en clasificación de sentimiento binaria; no es un modelo generativo ni multilingüe.
- Riesgo de alucinación no aplicable en sentido estricto (es un clasificador), pero sí de clasificaciones erróneas en dominios distintos de reseñas de SST-2.
- No se documentan sesgos conocidos, composición del dataset de ajuste ni evaluación de robustez.
- La licencia MIT permite uso comercial, pero la librería NeuralOps y el modelo base pueden tener condiciones propias que conviene revisar.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso comunitario ni validación externa.
- La fecha de creación indicada (2026-11-10) es posterior a la de esta ficha, lo que sugiere posible inconsistencia en los metadatos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-comp-admm-compressor-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del compresor: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/pruning/admm_compressor.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset GLUE: https://huggingface.co/datasets/nyu-mll/glue
