# tahamajs/bert-comp-slicegpt-pca-sst2

## Resumen

`bert-comp-slicegpt-pca-sst2` es un checkpoint de BERT-Base (`google-bert/bert-base-uncased`) comprimido físicamente y posteriormente "curado" con LoRA, publicado por el desarrollador tahamajs dentro del ecosistema NeuralOps (Compressor Zoo). El modelo parte del BERT-Base original de 109.483.778 parámetros (12 capas, dimensión oculta 768) afinado para clasificación de sentimiento en GLUE SST-2, y se comprime mediante el motor `SliceGPTPCACompressor`, que aplica proyección en coordenadas principales sensible a activaciones y sustituye cada capa densa recortada por una factorización de bajo rango real (`SVDLinear`), de modo que el número de parámetros baja efectivamente de `d_out*d_in` a `(d_out+d_in)*keep`.

El checkpoint empaquetado corresponde al rango Pareto `k=128`, con 34.956.916 parámetros tras la compresión (una reducción del 68,07 % y un ratio de compresión físico de 3,132x). Tras aplicar un "healing" LoRA de rango 8 (50 pasos, `lr=2e-4`, presupuesto de 45 segundos), el modelo alcanza un 73,39 % de accuracy en la partición de validación de SST-2, frente al 91,63 % del profesor original, lo que supone una pérdida de paridad de 18,24 puntos porcentuales.

Su relevancia es fundamentalmente metodológica y de investigación: sirve como referencia reproducible para estudiar el compromiso entre ratio de compresión, recuperación mediante LoRA y degradación de accuracy en tareas de clasificación, y como ejemplo de empaquetado de artefactos de compresión con telemetría legible por máquina. No es un modelo pensado para producción, dado el drástico descenso de precisión frente a su profesor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-Base) con capas lineales sustituidas por factorizaciones de bajo rango `SVDLinear` tras proyección PCA sensible a activaciones |
| Parametros totales | 34.956.916 (checkpoint comprimido, `k=128`); profesor original: 109.483.778 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base BERT-Base soporta 512 tokens; el autor no declara un valor específico para el checkpoint comprimido) |
| Tipos de cuantizacion | No disponible (el pipeline aplica compresión estructural `slicegpt_pca` y adaptadores LoRA `r=8`, no cuantización de pesos declarada) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict serializado de PyTorch), más `config.json`, `compression_summary.json` y activos del tokenizador `bert-base-uncased` |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer encoder BERT-Base de 12 capas y dimensión oculta 768, originalmente preentrenado por Google sobre corpus en inglés y afinado para clasificación de sentimiento binaria (2 etiquetas) en GLUE SST-2. Sobre esa base, NeuralOps aplica `SliceGPTPCACompressor`: un compresor PCA que realiza una proyección en coordenadas principales sensible a las activaciones y recorta dimensiones en capas `Linear` y `Conv1D`, reemplazando cada peso denso recortado por una factorización SVD de bajo rango. El resultado es una reducción física real del número de parámetros, no una mera máscara de poda.

El proceso de recuperación sigue una política Pareto: cuando la compresión zero-shot degrada la accuracy más de 2,0 puntos con una reducción superior a 1,10x, se aplica un "healing" LoRA dirigido de rango 8 durante 50 pasos con `lr=2e-4` y un presupuesto de 45 segundos. La evaluación multi-rango se realizó físicamente en una NVIDIA GeForce RTX 3090 (24 GB) sobre las 872 muestras de validación de SST-2. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset más allá de GLUE SST-2, ni si hubo RLHF o DPO (no aplicables a una tarea de clasificación de este tipo).

## Capacidades

- Clasificación de sentimiento binaria (negativo/positivo) en inglés, con 2 etiquetas de salida.
- Codificación de texto en inglés heredada del tokenizador y vocabulario de `bert-base-uncased`.
- Inferencia de baja huella: 34,96 M de parámetros y pesos de aproximadamente 66,8 MB, adecuada para entornos con memoria muy limitada.
- No soporta tool calling ni function calling: es un modelo de clasificación, no de generación.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo "thinking", visión, audio ni capacidades multimodales.
- Capacidad multilingüe limitada al inglés; no se declaran otros idiomas.

## Casos de uso

- Investigación sobre compresión de modelos: sirve como punto de referencia reproducible para medir cómo `slicegpt_pca` con `k=128` y healing LoRA afecta a la accuracy en SST-2, comparando con el profesor al 91,63 % y con los rangos `k=32` (60,21 %) y `k=256/128` (73,39 %).
- Despliegue en dispositivos con memoria restringida: con 66,8 MB de pesos y 34,96 M de parámetros, puede ejecutarse en CPU o en GPUs de gama baja para tareas de análisis de sentimiento no críticas donde un 73,39 % de accuracy sea aceptable.
- Filtrado preliminar de reseñas en pipelines de datos: como clasificador rápido y barato para preetiquetar grandes volúmenes de texto en inglés antes de un modelo mayor, aprovechando su bajo coste de inferencia.
- Docencia y demostración de técnicas de compresión: el repositorio incluye `compression_summary.json` con telemetría multi-rango, útil para explicar el compromiso entre ratio de compresión y rendimiento en un curso o taller.
- Validación de la librería NeuralOps: sirve como caso de prueba de la API `compress_model` y del flujo de reconstrucción de topología comprimida más carga de pesos con `strict=False`.
- Baseline para experimentos de recuperación LoRA: permite comparar distintas configuraciones de healing (rango, pasos, learning rate) contra un resultado documentado de 73,39 % con `r=8`, 50 pasos y `lr=2e-4`.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model-index y en la model card (no verificados de forma independiente).

| Modelo / variante | Dataset | Métrica | Valor |
|---|---|---|---|
| `bert-comp-slicegpt-pca-sst2` (`k=128`, LoRA) | GLUE SST-2 (validation, 872 muestras) | Accuracy | 73,39 % |
| Profesor `bert-base-uncased` (baseline) | GLUE SST-2 (validation) | Accuracy | 91,63 % |
| `k=128` zero-shot (sin healing) | GLUE SST-2 (validation) | Accuracy | 51,38 % |
| `k=32` con LoRA | GLUE SST-2 (validation) | Accuracy | 60,21 % |
| `k=32` zero-shot | GLUE SST-2 (validation) | Accuracy | 50,80 % |
| `k=64` | GLUE SST-2 (validation) | Accuracy | Fallo (crash) |

Paridad frente al profesor para el checkpoint empaquetado: −18,24 puntos porcentuales.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para los 34,96 M de parámetros (aproximadamente 140 MB de pesos en memoria más activaciones); los pesos empaquetados ocupan 66,8 MB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; el autor evaluó en una NVIDIA GeForce RTX 3090 (24 GB), pero el modelo es sobredimensionado para esa tarjeta.
- Cabe holgadamente en GPU de consumo: GTX 1650, RTX 3050, RTX 4060 y superiores; también es viable en CPU.
- Opciones de despliegue: requiere reconstruir la topología comprimida con `neuralops.core.compression_pipeline.compress_model` y cargar el state dict con `torch.load` y `load_state_dict(strict=False)`. No se documenta compatibilidad directa con vLLM, llama.cpp, Ollama o TGI, dado que el checkpoint no está en formato GGUF ni sigue el layout estándar de Transformers sin la reconstrucción previa.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SST-2 (accuracy) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `bert-comp-slicegpt-pca-sst2` (`k=128`) | 34,96 M | No disponible | 73,39 % | MIT | Hugging Face (repo propio) |
| `google-bert/bert-base-uncased` (profesor) | 109,48 M | 512 tokens | 91,63 % (según el autor) | Apache 2.0 | Hugging Face |
| Variante `k=32` del mismo zoo | 29,60 M | No disponible | 60,21 % | MIT | Incluida en la telemetría, no empaquetada |
| Variante `k=64` del mismo zoo | No disponible | No disponible | Fallo (crash) | MIT | No empaquetada |

No se dispone de datos de otros modelos de compresión comparables en la información proporcionada.

## Limitaciones y advertencias

- Pérdida de accuracy severa: 73,39 % frente al 91,63 % del profesor, una caída de 18,24 puntos porcentuales que lo aleja del estado del arte en SST-2.
- El resultado zero-shot sin healing cae al 51,38 %, prácticamente al nivel de azar en una tarea binaria; el modelo depende críticamente de los adaptadores LoRA empaquetados.
- El rango `k=64` provoca un fallo (crash) durante la evaluación, lo que indica inestabilidad del pipeline de compresión en ciertos rangos.
- Solo inglés: no hay soporte multilingüe declarado.
- Riesgo de sesgo heredado del corpus de preentrenamiento de `bert-base-uncased` y de GLUE SST-2, con posibles sesgos de género, raza o dominio no caracterizados por el autor.
- Riesgo de alucinación no aplicable en sentido generativo (es un clasificador), pero sí de clasificaciones erróneas sistemáticas en dominios alejados de reseñas de cine.
- La licencia MIT permite uso comercial, pero la precisión limitada hace desaconsejable su uso en producción sin validación específica del dominio.
- Requiere la librería NeuralOps y una reconstrucción manual de la topología comprimida antes de cargar los pesos; no es un checkpoint estándar de Transformers listo para usar con `from_pretrained` directo.
- Resultados no verificados de forma independiente (`verified: false` en la model-index).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-comp-slicegpt-pca-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del compresor: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/quantization/slicegpt_pca.py
- Licencia: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
