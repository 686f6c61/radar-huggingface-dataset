# tahamajs/bert-comp-coopq-quantizer-sst2

## Resumen

`tahamajs/bert-comp-coopq-quantizer-sst2` es un checkpoint de BERT-Base (`google-bert/bert-base-uncased`, 109.483.778 parámetros, 12 capas, dimensión oculta 768) afinado sobre GLUE SST-2 y procesado con el motor de compresión `coopq_quantizer` de la librería NeuralOps. Lo publica Taha Majlesi (usuario `tahamajs`) como parte del "NeuralOps Compressed & LoRA-Healed Model Zoo", un conjunto de artefactos que documentan el comportamiento de distintos compresores sobre arquitecturas transformer estándar.

El modelo resuelve una tarea concreta: clasificación binaria de sentimiento en inglés (0 = negativo, 1 = positivo) sobre frases de SST-2. Su interés no está en la capacidad predictiva —idéntica a la del profesor— sino en servir como referencia reproducible de un pipeline de cuantización con reconstrucción de topología y posible "curación" LoRA. En este checkpoint concreto, el rank seleccionado es `k=32` y la compresión física declarada es `1.00x` (0,0 % de reducción de parámetros), es decir, no se ha eliminado ni comprimido realmente ningún peso.

La relevancia ahora es metodológica: el repositorio incluye telemetría multi-rank (`k=256, 128, 64, 32`) y artefactos (`compression_summary.json`, `config.json` etiquetado con `compression_method`) que permiten auditar cómo se comporta el compresor. No obstante, al no haber reducción efectiva de parámetros, el checkpoint es funcionalmente equivalente al BERT-Base afinado original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-Base (12 capas, D=768), cabecera de clasificación de 2 etiquetas |
| Parámetros totales | 109.483.778 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (BERT-Base admite 512 tokens por configuración estándar, no confirmado en la model card) |
| Tipos de cuantización | `coopq_quantizer` (familia `quantization`, función `coopq_factory`); rank de compresión `k=32` |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict serializado); tokenizer en `vocab.txt`, `tokenizer.json`, `tokenizer_config.json` |

## Arquitectura y entrenamiento

La base es BERT-Base uncased, un transformer encoder bidireccional de 12 capas y 768 dimensiones ocultas, afinado para clasificación de sentimiento sobre GLUE SST-2. Sobre ese modelo se aplica el compresor `coopq_quantizer` de NeuralOps, que reconstruye la topología comprimida mediante `compress_model` y carga el state dict serializado con `strict=False`. El checkpoint incluye, según la model card, factores de bajo rango, buffers de cuantización y, si procede, adaptadores LoRA de curación integrados en los pesos.

El pipeline de evaluación se ejecutó sobre una NVIDIA GeForce RTX 3090 (24 GB) con el split de validación de SST-2 (872 muestras). La política de curación LoRA se activa cuando la compresión zero-shot degrada más de 2,0 puntos porcentuales con una reducción superior a 1,10x; en ese caso se aplica un adaptador `r=8` durante 50 pasos con `lr=2e-4` y un presupuesto de 45 segundos. En este checkpoint (`k=32`) la model card indica `LoRA Recovery Applied: False` y una ratio de compresión de `1.00x`, por lo que no hubo reducción de parámetros ni curación efectiva. No se documentan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset más allá de SST-2 ni si hubo RLHF/DPO (no aplicable en un encoder de clasificación).

## Capacidades

- Clasificación binaria de sentimiento en inglés (negativo/positivo) sobre frases cortas, orientada a SST-2.
- Inferencia estándar de `BertForSequenceClassification` con `num_labels=2` tras reconstruir la topología con NeuralOps.
- Compatible con el ecosistema Hugging Face `transformers` para tokenización y carga de configuración.
- No soporta tool calling ni function calling (es un encoder de clasificación, no un modelo generativo).
- No soporta agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés (modelo `uncased` entrenado originalmente en inglés).
- No dispone de modo "thinking", visión ni audio.

## Casos de uso

- Análisis de sentimiento en reseñas de producto: el modelo clasifica frases cortas en positivo/negativo; útil para agregar opiniones en dashboards con un coste de inferencia bajo (109 M de parámetros).
- Moderación de comentarios en inglés: filtrado previo de tono negativo en foros o secciones de comentarios antes de una revisión humana.
- Etiquetado de datasets de opinión: generación de etiquetas preliminares para corpus de SST-2 u otros conjuntos de sentimiento en inglés, con revisión posterior.
- Referencia reproducible para investigación en compresión: sirve como baseline de "compresión nula" (`1.00x`) frente a la que comparar ranks más agresivos (`k=256`, `128`, `64`) del mismo zoo.
- Validación de pipelines NeuralOps: caso de prueba para verificar que `compress_model` + `load_state_dict(strict=False)` reconstruye correctamente la topología y reproduce la accuracy del profesor (91,63 %).
- Clasificación por lotes en CPU: al no requerir GPU para un encoder de 109 M de parámetros, puede desplegarse en entornos sin acelerador para tareas de scoring offline.
- Benchmark de paridad profesor-alumno: uso como control en experimentos que midan la degradación introducida por cuantización en tareas GLUE.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model-index (no verificados, `verified: false`):

| Rank (`k`) | Ratio físico | Params comprimidos (reducción) | Accuracy zero-shot | Accuracy curada | Paridad vs profesor (91,63 %) |
|:---:|:---:|---:|---:|---:|---:|
| 256 | 1.00x | 109.483.778 (-0,0 %) | 91,63 % | 91,63 % | +0,00 % |
| 128 | 1.00x | 109.483.778 (-0,0 %) | 91,63 % | 91,63 % | +0,00 % |
| 64 | 1.00x | 109.483.778 (-0,0 %) | 91,63 % | 91,63 % | +0,00 % |
| 32 (publicado) | 1.00x | 109.483.778 (-0,0 %) | 91,63 % | 91,63 % | +0,00 % |

Métrica principal: accuracy en GLUE SST-2, split de validación (872 muestras), evaluada en RTX 3090. El checkpoint publicado corresponde a `k=32` y reporta 91,63 % de accuracy, idéntico al profesor. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,44 GB de pesos (109,5 M × 4 bytes) más activaciones; en la práctica, menos de 2 GB para lotes pequeños.
- En fp16/bf16: aproximadamente 0,22 GB de pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; la model card documenta evaluación en NVIDIA GeForce RTX 3090 (24 GB), pero el modelo es sobradamente pequeño para GPUs de gama media.
- Cabe en GPU de consumo: sí, en GTX 1650/1660, RTX 3050/3060/4060, RTX 4090, etc.
- Despliegue: `transformers` (con la dependencia adicional `neuralops` para reconstruir la topología), y potencialmente `vLLM`/`TGI` si se exporta a un formato estándar; no se documenta compatibilidad con `llama.cpp` ni `Ollama` (pensados para modelos generativos).
- Latencia y throughput: no disponibles en la información proporcionada. La curación LoRA se ejecuta con un presupuesto de 45 segundos en RTX 3090, pero no se reportan métricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| `tahamajs/bert-comp-coopq-quantizer-sst2` | 109.483.778 | No disponible | 91,63 % (declarado) | MIT | Hugging Face |
| `google-bert/bert-base-uncased` (profesor) | 109.483.778 | 512 tokens (estándar) | 91,63 % (referencia del autor) | Apache 2.0 | Hugging Face |
| `distilbert-base-uncased-finetuned-sst-2-english` | ~66 M | 512 tokens (estándar) | No disponible en la información | Apache 2.0 | Hugging Face |
| `roberta-base` afinado en SST-2 | ~125 M | 512 tokens (estándar) | No disponible en la información | MIT | Hugging Face |

La comparativa se limita a datos públicos estándar; los valores de SST-2 de los modelos alternativos no se han verificado en la información proporcionada. El checkpoint de NeuralOps no ofrece ventaja de tamaño frente al profesor (ratio 1.00x) y su licencia MIT es más permisiva que la Apache 2.0 del BERT original, aunque las condiciones de uso comercial deben revisarse contra el repositorio NeuralOps.

## Limitaciones y advertencias

- El checkpoint declara una compresión de `1.00x` (0,0 % de reducción): no aporta ningún ahorro real de memoria ni de cómputo frente a BERT-Base.
- La accuracy de 91,63 % está marcada como `verified: false`; no ha sido validada de forma independiente.
- El modelo solo clasifica sentimiento binario en inglés; no es un modelo generativo ni sirve para otras tareas sin reentrenamiento.
- Riesgo de sesgo heredado de BERT-Base y de SST-2 (frases de reseñas de películas), con posible degradación en dominios distintos.
- Riesgo de alucinación no aplicable en sentido estricto (es un clasificador), pero sí de clasificaciones erróneas en frases ambiguas, sarcasmo o negaciones complejas.
- Dependencia de la librería `neuralops` para reconstruir la topología; sin ella, la carga directa del `pytorch_model.bin` puede fallar o requerir `strict=False` y dar resultados incorrectos.
- Licencia MIT declarada, pero el enlace de licencia apunta al repositorio NeuralOps; conviene verificar los términos exactos antes de uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni de validación comunitaria.
- Los resultados de la búsqueda web (Hosman) no guardan relación con el modelo y no aportan información técnica adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-comp-coopq-quantizer-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del compresor: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/quantization/coopq_quantizer.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue
