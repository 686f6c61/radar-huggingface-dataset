# tahamajs/bert-comp-gfws-sst2

## Resumen

bert-comp-gfws-sst2 es un checkpoint de `google-bert/bert-base-uncased` comprimido físicamente y posteriormente "curado" mediante LoRA, publicado por el autor tahamajs dentro del proyecto NeuralOps. El modelo parte del BERT-Base original (109.483.778 parámetros, 12 capas, dimensión oculta 768) afinado sobre GLUE SST-2 y le aplica el compresor `gfws` (`GFWSCompressor`, basado en SVD ponderado por Fisher/covarianza) con rango Pareto `k=256`, lo que reduce el recuento de parámetros a 67.016.450 (−38,79 %, ratio de compresión físico 1,634x).

El interés del artefacto no reside en su calidad absoluta, sino en su valor como caso de estudio reproducible de compresión de modelos: documenta una curva Pareto completa (k=256, 128, 64 y 32) con precisión zero-shot y tras healing LoRA, y empaqueta el estado comprimido junto con telemetría legible por máquina (`compression_summary.json`). Es, por tanto, un modelo de clasificación de sentimiento en inglés con una precisión declarada del 77,64 % en la validación de SST-2, muy por debajo del profesor original (91,63 %), pero con un 38,8 % menos de parámetros.

La relevancia actual es metodológica: ilustra el coste real en precisión de las técnicas de compresión SVD de bajo rango sobre transformers pequeños, y el papel limitado del healing LoRA (r=8, 50 pasos, lr=2e-4) para recuperar capacidad. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y su licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-Base), 12 capas, dimensión oculta 768 |
| Parametros totales | 67.016.450 (comprimido); profesor original 109.483.778 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (hereda la configuración de bert-base-uncased; no declarada en la model card) |
| Tipos de cuantizacion | no disponible (solo se distribuye `pytorch_model.bin` en fp32; no se publican GGUF ni variantes cuantizadas) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`pytorch_model.bin`), más `config.json`, `compression_summary.json` y assets del tokenizador `bert-base-uncased` |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer encoder BERT-Base estándar (12 capas, D=768) con una cabeza de clasificación de secuencia de 2 etiquetas. Sobre ese modelo afinado en GLUE SST-2, el autor aplica `GFWSCompressor` (registrado como `gfws` y `gfws_d` en `COMPRESSOR_REGISTRY`), una variante de SVD ponderada por Fisher/covarianza que descompone las matrices de pesos en factores de bajo rango. El checkpoint serializado en este repositorio corresponde al rango `k=256`, con los factores de bajo rango y los adaptadores LoRA de healing ya integrados en el state dict.

El proceso de evaluación se realizó físicamente en una NVIDIA GeForce RTX 3090 (24 GB) sobre el split de validación de GLUE SST-2 (872 muestras). La política de healing es condicional: cuando la compresión zero-shot degrada la precisión más de 2,0 puntos con una reducción superior a 1,10x, se aplica LoRA dirigido con r=8, 50 pasos, lr=2e-4 y un presupuesto de 45 segundos. No se documentan en la información disponible el volumen de tokens de preentrenamiento, la composición del dataset de ajuste fino ni si hubo RLHF/DPO (procedimiento no aplicable a una tarea de clasificación). La innovación técnica destacable es la propia metodología de compresión más healing y la publicación de la curva Pareto multi-rango.

## Capacidades

- Clasificación de sentimiento binaria (0 = negativo, 1 = positivo) sobre texto en inglés, entrenada en GLUE SST-2.
- Inferencia sobre frases cortas y de longitud media propias del dominio SST-2 (reseñas de películas).
- Ejecución en CPU y GPU de gama media gracias a su reducción de parámetros (−38,8 %).
- Reconstrucción programática del grafo comprimido mediante `compress_model` de NeuralOps y carga del state dict con `strict=False`.
- No soporta tool calling ni function calling: es un modelo de clasificación, no un modelo generativo.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión ni audio.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Análisis de sentimiento de reseñas de productos o películas en inglés: el modelo clasifica directamente polaridad positiva/negativa y su reducido tamaño (67 M de parámetros) permite desplegarlo en entornos con recursos limitados.
- Filtrado previo en pipelines de moderación de contenido: puede actuar como primera etapa de clasificación de tono en comentarios, derivando los casos dudosos a un modelo mayor.
- Prototipado académico de técnicas de compresión: sirve como referencia reproducible para comparar SVD de bajo rango con otras estrategias (poda, cuantización) sobre un mismo baseline.
- Docencia e investigación en eficiencia de modelos: la curva Pareto publicada (k=256/128/64/32) permite estudiar empíricamente el compromiso precisión-tamaño sin reentrenar.
- Despliegue en dispositivos edge o contenedores con presupuesto de memoria ajustado: al ocupar menos de 130 MB en pesos fp32, es viable en instancias pequeñas o incluso en CPU.
- Benchmarking de pipelines de healing LoRA: el artefacto incluye telemetría (`compression_summary.json`) útil para validar implementaciones propias de recuperación post-compresión.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados, `verified: false`) sobre GLUE SST-2, split de validación (872 muestras), evaluados en RTX 3090:

| Rango (k) | Ratio físico | Parámetros comprimidos (reducción) | Precisión zero-shot | Precisión con LoRA | Delta vs profesor (91,63 %) |
|:---:|:---:|---:|---:|---:|---:|
| 256 | 1,63x | 67.016.450 (−38,8 %) | 65,94 % | 77,64 % | −13,99 % |
| 128 | 2,39x | 45.782.786 (−58,2 %) | 53,33 % | 72,25 % | −19,38 % |
| 64 | 3,11x | 35.165.954 (−67,9 %) | 49,08 % | 73,39 % | −18,24 % |
| 32 | 3,67x | 29.857.538 (−72,7 %) | 49,08 % | 68,46 % | −23,17 % |

El checkpoint empaquetado corresponde a k=256 con precisión final de 77,64 % (accuracy de validación GLUE SST-2). No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para 67 M de parámetros (los pesos ocupan aproximadamente 127,9 MB según el autor); el pico real depende del batch y de la longitud de secuencia.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor evaluó en NVIDIA GeForce RTX 3090 (24 GB), aunque es sobredimensionada para este modelo.
- Cabe en GPU de consumo: sí, en cualquier RTX/GTX moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: no hay soporte directo documentado en vLLM, llama.cpp, Ollama ni TGI; el flujo previsto es PyTorch + Transformers + `neuralops`, reconstruyendo el grafo comprimido con `compress_model` antes de cargar el state dict.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| bert-comp-gfws-sst2 (k=256) | 67,0 M | no disponible | 77,64 % | MIT | Hugging Face |
| google-bert/bert-base-uncased (profesor afinado SST-2) | 109,5 M | 512 tokens (arquitectura) | 91,63 % | Apache-2.0 | Hugging Face |
| DistilBERT-base-uncased (referencia comprimida) | 66 M | 512 tokens (arquitectura) | no disponible en esta información | Apache-2.0 | Hugging Face |

La comparación con DistilBERT es pertinente por tamaño (66 M frente a 67 M), pero no se dispone de su precisión SST-2 en la información proporcionada, por lo que la comparación cuantitativa queda incompleta. El profesor original supera al modelo comprimido en 13,99 puntos de precisión con solo un 38,8 % más de parámetros, lo que sugiere que la compresión SVD de bajo rango no es competitiva frente a la destilación en este régimen de tamaño.

## Limitaciones y advertencias

- Pérdida de precisión severa: 77,64 % frente al 91,63 % del profesor, una caída de 13,99 puntos que lo hace poco adecuado para producción sin validación adicional.
- El healing LoRA solo recupera parcialmente la capacidad: en k=64 la precisión curada (73,39 %) supera a la de k=128 (72,25 %), lo que indica un procedimiento de recuperación no monótono y potencialmente inestable.
- Ámbito restringido: clasificación binaria de sentimiento en inglés sobre el dominio de SST-2; no generaliza a otras tareas sin reentrenamiento.
- Riesgo de sesgos heredados de `bert-base-uncased` y del corpus SST-2 (reseñas de películas), incluyendo sesgos demográficos y de dominio no auditados en la model card.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de clasificaciones erróneas en textos fuera de distribución o con sarcasmo/negaciones complejas.
- Requiere la librería NeuralOps y reconstruir el grafo comprimido antes de cargar los pesos; no es un checkpoint estándar de Transformers cargable con `from_pretrained` directamente.
- Los resultados de benchmarks están marcados como no verificados (`verified: false`) y proceden del propio autor.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías ni soporte; el modelo base `bert-base-uncased` está bajo Apache-2.0 y conviene revisar la compatibilidad de atribuciones.
- Repositorio sin tracción (0 descargas, 0 likes) y sin validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-comp-gfws-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Implementación del compresor GFWS: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/svd/gfws_d_compressor.py
- Dataset GLUE (nyu-mll/glue): https://huggingface.co/datasets/nyu-mll/glue
