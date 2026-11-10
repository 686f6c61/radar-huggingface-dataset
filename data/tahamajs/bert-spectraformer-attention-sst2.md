# tahamajs/bert-spectraformer-attention-sst2

## Resumen

`tahamajs/bert-spectraformer-attention-sst2` es un checkpoint de BERT-Base (`bert-base-uncased`, 110 M de parámetros) en el que se han sustituido los bloques de atención softmax cuadrática de las 12 capas del transformer por el mecanismo `spectraformer_attention` de la librería NeuralOps. El modelo se ha destilado y ajustado sobre la tarea SST-2 del benchmark GLUE para clasificación binaria de sentimiento en inglés. Lo desarrolla Taha Majlesi dentro del proyecto NeuralOps (attention zoo) y se publica bajo licencia MIT.

El interés del checkpoint no reside en su rendimiento absoluto, sino en su carácter experimental: demuestra que es posible reemplazar la atención cuadrática $O(N^2)$ por una variante subcuadrática ($O(N)$ u $O(N \log N)$) en un transformer preentrenado y recuperar parte de la calidad mediante destilación de representaciones en dos etapas, con un coste de cómputo muy reducido (49,8 s en una RTX 3090, 201 pasos de optimización).

El repositorio no contiene los pesos completos de BERT, sino únicamente los pesos de atención y la cabeza de clasificación en FP16 (`attention_weights.safetensors`, ~55 MB). El código remoto (`modeling_neuralops_bert.py`) reconstruye el modelo cargando la base congelada desde `bert-base-uncased` y aplicando encima los parámetros destilados. Es un artefacto de investigación, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-Base con atención `spectraformer_attention` (subcuadrática) en las 12 capas |
| Parametros totales | 110 M (base BERT-Base) + pesos de atención y cabeza de clasificación destilados |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (hereda la de `bert-base-uncased`, típicamente 512 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | Pesos publicados en FP16; no se documentan otras cuantizaciones |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (solo atención y cabeza, FP16, ~55 MB); requiere `trust_remote_code=True` |

## Arquitectura y entrenamiento

La arquitectura parte de BERT-Base (12 capas, 110 M de parámetros) y reemplaza la atención multi-cabeza estándar por `spectraformer_attention`, un mecanismo de atención subcuadrática con complejidad efectiva $O(N)$ u $O(N \log N)$ frente a la $O(N^2)$ del MHA clásico. Los pesos base de BERT permanecen congelados; solo se entrenan los parámetros de atención y la cabeza de clasificación, que se serializan de forma modular.

El entrenamiento sigue el protocolo *NeuralOps Cached Representation Distillation* en dos etapas: primero una alineación de subespacio oculto (Stage 1) y después una combinación de KL sobre logits del profesor más entropía cruzada de la tarea (Stage 2). El profesor es `bert-base-uncased` y las representaciones se cachean offline, de modo que no se reserva VRAM para el profesor durante el ajuste. Se ejecutó en una NVIDIA RTX 3090 de 24 GB (clúster HPC de Sharif), con 201 pasos de optimización, 49,8 s de duración total, 33 096,7 tokens/s de throughput efectivo y un pico de 10 074 MB de VRAM. El conjunto de evaluación es la partición de validación de SST-2 (872 muestras binarias).

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) en inglés sobre textos tipo SST-2.
- Atención subcuadrática: el mecanismo `spectraformer_attention` reduce el coste computacional frente a la atención cuadrática en secuencias largas.
- Carga modular: los pesos de atención se aplican sobre una base BERT congelada mediante código remoto de NeuralOps.
- Integración con Hugging Face Transformers vía `AutoModelForSequenceClassification` con `trust_remote_code=True`.
- Integración con la API de alto nivel `neuralops.hub.bert_zoo.load_pretrained_bert`.
- No se documentan capacidades de generación de texto, tool calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación en mecanismos de atención eficiente: sirve como punto de partida para comparar `spectraformer_attention` con atención softmax estándar en tareas de clasificación, reutilizando el protocolo de destilación en dos etapas.
- Prototipado de clasificadores de sentimiento en inglés: con un 76,26 % de accuracy en SST-2 es adecuado para experimentos y demos, no para producción de alta precisión.
- Reproducción de experimentos de destilación: el repositorio documenta hiperparámetros, tiempos y VRAM, lo que permite reproducir el pipeline en una GPU consumer de 24 GB.
- Benchmark de serialización modular: útil para estudiar el esquema de pesos "attention-only" de NeuralOps y su reconstrucción sobre la base congelada.
- Evaluación de trade-offs precisión/eficiencia: permite medir cuánta accuracy se pierde al sustituir la atención cuadrática por una subcuadrática con destilación limitada (201 pasos).
- Docencia y formación: ejemplo compacto (~55 MB) de cómo se modifica un transformer preentrenado y se ajusta a una tarea GLUE.

## Benchmarks y rendimiento

Evaluación sobre la partición de validación de GLUE SST-2 (872 muestras):

| Metrica | Profesor (`bert-base-uncased`) | Estudiante pre-KD | Modelo destilado |
|---|---|---|---|
| Accuracy SST-2 | 91,63 % | 52,75 % | 76,26 % |
| Entropía cruzada de validación | 0,2428 | no calibrada | 0,5254 |

Delta de accuracy tras la destilación: +23,51 puntos porcentuales. No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- Inferencia: al cargar la base BERT completa (110 M) más los pesos de atención, el modelo cabe holgadamente en GPUs consumer; se puede ejecutar en CPU para inferencia puntual.
- Entrenamiento documentado: RTX 3090 de 24 GB, con pico de 10 074 MB de VRAM y 49,8 s para 201 pasos.
- GPU recomendadas: cualquier GPU con al menos ~2-4 GB de VRAM para inferencia en FP16; RTX 3090 o superior para reproducir el ajuste.
- Cabe en GPUs consumer (RTX 3060, RTX 4090, etc.) tanto para inferencia como para el ajuste documentado.
- Opciones de despliegue: Hugging Face Transformers con `trust_remote_code=True` y la API `neuralops.hub.bert_zoo`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Throughput de entrenamiento reportado: 33 096,7 tokens/s. No se publican latencias de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 (accuracy) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/bert-spectraformer-attention-sst2` | 110 M (base) + atención destilada | no disponible | 76,26 % | MIT | Hugging Face (código remoto) |
| `bert-base-uncased` (profesor) | 110 M | 512 | 91,63 % (referencia de la model card) | Apache 2.0 | Hugging Face |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66 M | 512 | no disponible en la información proporcionada | Apache 2.0 | Hugging Face |

La comparativa se limita a los datos aportados; no se dispone de resultados de otros modelos de atención eficiente (Linear Transformer, Performer, Longformer) en la información proporcionada.

## Limitaciones y advertencias

- Rendimiento muy inferior al profesor: 76,26 % frente a 91,63 % en SST-2, con una brecha de 15,37 puntos porcentuales.
- Entrenamiento muy corto (201 pasos, 49,8 s): el checkpoint parece un experimento de viabilidad, no un modelo convergido para uso real.
- Solo inglés y solo clasificación binaria de sentimiento; no soporta generación, razonamiento, código ni tool calling.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; conviene auditar `modeling_neuralops_bert.py` antes de usarlo.
- Dependencia de la base `bert-base-uncased`: los pesos publicados no son autónomos y necesitan descargar la base congelada.
- Riesgo de sesgos heredados de BERT-Base y de los datos de SST-2 (reseñas de cine), no evaluado en la model card.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificaciones erróneas en dominios distintos al de entrenamiento.
- Licencia MIT permite uso comercial, pero el estado experimental y la baja accuracy desaconsejan su uso en producción.
- Sin métricas de calibración más allá de la entropía cruzada reportada; sin evaluación de robustez ni de dominios fuera de SST-2.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-spectraformer-attention-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/bert-base-uncased
