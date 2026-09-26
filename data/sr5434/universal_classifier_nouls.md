# sr5434/universal_classifier_nouls

## Resumen

universal_classifier_nouls es un modelo de clasificación de texto publicado en Hugging Face por el usuario sr5434 (Samir Rangwalla) y generado automáticamente con el Trainer de Transformers. Se trata de un ajuste fino del modelo de embeddings google/embeddinggemma-300m, un codificador de aproximadamente 300 millones de parámetros de la familia Gemma, y se distribuye bajo la licencia Gemma.

El modelo resuelve tareas de clasificación supervisada de secuencias, con salidas probabilísticas por clase. En su conjunto de evaluación final declara una accuracy de 0,8136, una divergencia KL de 0,1203 y un Brier score de 0,0436, además de una pérdida de validación de 0,5594.

Su relevancia actual es limitada y debe interpretarse con cautela: la model card no documenta el conjunto de datos de entrenamiento, el conjunto de etiquetas, los idiomas soportados ni la longitud de contexto, el repositorio registra 0 descargas y 0 likes, y el tamaño declarado del repositorio es de 0,0 GB, lo que podría indicar que los pesos no están publicados o que la información está incompleta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer codificador (encoder) heredado de google/embeddinggemma-300m, con cabeza de clasificación añadida; detalles no disponibles |
| Parámetros totales | Aproximadamente 300 M según el nombre del modelo base; no confirmado en la información proporcionada |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; pesos en safetensors con precisión original no especificada |
| Idiomas soportados | no disponible |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de google/embeddinggemma-300m, un codificador de la familia Gemma orientado a la generación de embeddings, al que se ha añadido una cabeza de clasificación. No se documenta la arquitectura interna exacta del ajuste, el número de capas descongeladas ni si se aplicó algún tipo de adaptador o LoRA. Las métricas reportadas (divergencia KL y Brier score junto con accuracy y loss) apuntan a un entrenamiento con objetivos probabilísticos, posiblemente con etiquetas blandas o destilación, aunque esto es una inferencia a partir de las métricas publicadas y no una afirmación del autor.

Los hiperparámetros sí están documentados: learning rate de 2e-05, batch de entrenamiento de 16 por dispositivo con 2 dispositivos (batch total de 32), semilla 42, optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal y 4000 pasos de entrenamiento. El entrenamiento se realizó en configuración multi-GPU con Transformers 5.17.0, PyTorch 2.10.0+cu128, Datasets 5.0.0 y Tokenizers 0.23.2. La evolución de la validación es monótona (accuracy de 0,7115 en el paso 500 hasta 0,8136 en el paso 4000), mientras la pérdida de entrenamiento seguía descendiendo en el último registro (0,5244), lo que sugiere que el modelo podría no estar completamente convergido.

## Capacidades

- Clasificación de texto: genera una distribución de probabilidad sobre el conjunto de clases definido durante el ajuste fino.
- Salidas probabilísticas calibradas: la inclusión de Brier score (0,0436) y divergencia KL (0,1203) indica que el autor evaluó la calibración de las probabilidades, no solo la clase predicha.
- Inferencia de secuencia completa: al derivar de un codificador, procesa el texto de entrada en una sola pasada, sin generación autorregresiva.
- Extracción de representaciones: es plausible reutilizar el codificador subyacente como modelo de embeddings, aunque el autor no lo documenta y el ajuste fino puede haber degradado esa capacidad.
- No hay evidencia en la información disponible de: generación de texto libre, razonamiento multi-paso, tool calling o function calling, uso como agente, capacidades de visión o audio, ni modo de razonamiento explícito (thinking).
- Capacidades multilingües: no documentadas para este ajuste, a pesar de que el modelo base pudiera ser multilingüe.

## Casos de uso

- Enrutamiento de tickets de soporte: clasificar cada consulta entrante en categorías (facturación, incidencia técnica, cancelación) para dirigirla al equipo correspondiente. Requiere verificar previamente el mapa id2label del modelo, ya que el conjunto de etiquetas no está documentado.
- Moderación de contenido: uso como clasificador binario o multietiqueta de textos de usuario en foros o comentarios, aprovechando la salida probabilística para fijar umbrales de revisión humana en lugar de decisiones binarias rígidas.
- Análisis de sentimiento en reseñas: procesamiento por lotes de reseñas de producto o servicio para agregar métricas de satisfacción, con umbrales ajustados según el Brier score observado en validación.
- Etiquetado temático previo a indexación: clasificar documentos antes de incorporarlos a un pipeline de búsqueda o RAG, de forma que se puedan aplicar filtros por categoría en la recuperación.
- Detección de intención en asistentes conversacionales: predecir la intención de cada turno de usuario en un sistema con árbol de diálogo o enrutado a skills específicas.
- Filtrado de correo no deseado o phishing: clasificación de mensajes en un preprocesador previo a un motor de reglas, usando la probabilidad de salida como señal auxiliar.
- Investigación en calibración: al reportar KL y Brier, sirve como punto de partida para experimentos sobre calibración de clasificadores pequeños derivados de modelos de embeddings.
- Destilación de etiquetas: emplear las probabilidades de salida como pseudoetiquetas o como profesor blando para entrenar clasificadores más pequeños, dado el objetivo probabilístico aparente del ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, GLUE, SuperGLUE ni similares) en la información disponible. El model-index del repositorio contiene una lista de resultados vacía. Los únicos datos son las métricas del propio conjunto de evaluación del autor:

| Métrica (evaluación final) | Valor |
|---|---|
| Loss | 0,5594 |
| Divergencia KL | 0,1203 |
| Brier score | 0,0436 |
| Accuracy | 0,8136 |

Evolución durante el entrenamiento:

| Paso | Época | Training loss | Validation loss | KL | Brier | Accuracy |
|---|---|---|---|---|---|---|
| 500 | 0,0781 | 0,6375 | 0,6234 | 0,1843 | 0,0715 | 0,7115 |
| 1000 | 0,1563 | 0,5665 | 0,5885 | 0,1494 | 0,0557 | 0,7692 |
| 1500 | 0,2344 | 0,5568 | 0,5784 | 0,1393 | 0,0517 | 0,7863 |
| 2000 | 0,3126 | 0,5837 | 0,5708 | 0,1318 | 0,0484 | 0,7981 |
| 2500 | 0,3907 | 0,5516 | 0,5674 | 0,1284 | 0,0471 | 0,7984 |
| 3000 | 0,4689 | 0,5491 | 0,5626 | 0,1235 | 0,0450 | 0,8076 |
| 3500 | 0,5470 | 0,5364 | 0,5604 | 0,1213 | 0,0440 | 0,8133 |
| 4000 | 0,6252 | 0,5244 | 0,5594 | 0,1203 | 0,0436 | 0,8136 |

No se dispone de información sobre el conjunto de evaluación, el número de ejemplos, el número de clases ni la distribución de las mismas, por lo que estas cifras no son comparables con resultados de otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 1,2 GB solo para los pesos de un modelo de 300 M de parámetros, más activaciones; aproximadamente 1,5-2 GB en total.
- VRAM estimada en fp16 o bf16: alrededor de 0,6 GB de pesos, aproximadamente 1-1,5 GB en total con overhead del runtime.
- VRAM estimada en int8: aproximadamente 0,3 GB de pesos, alrededor de 0,5-1 GB en total.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; no requiere A100 ni H100. Resultan adecuadas RTX 3060, RTX 4060, RTX 4090 o T4 para inferencia, e incluso GPUs integradas recientes para lotes pequeños.
- Ejecución en CPU: viable para inferencia con lotes moderados, dado el tamaño reducido del modelo; no hay datos de latencia publicados.
- Entrenamiento o ajuste fino: el autor utilizó 2 dispositivos con batch total de 32 y learning rate de 2e-05; ese régimen es asumible en GPUs de 16-24 GB, aunque no se especifica el modelo de GPU empleado.
- Opciones de despliegue: pipeline de text-classification de Transformers es la vía documentada (librería declarada: transformers). Exportación a ONNX Runtime es factible para latencia baja, aunque no está documentada para este repositorio. vLLM y TGI admiten modelos de clasificación con limitaciones y no hay confirmación de compatibilidad. llama.cpp u Ollama requerirían conversión a GGUF, no documentada y con soporte limitado para cabezas de clasificación.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No existen benchmarks comunes que permitan comparar el rendimiento de este modelo con alternativas, ya que el conjunto de evaluación no está descrito. La comparación se limita a características estructurales:

| Modelo | Parámetros | Contexto | Licencia | Rendimiento comparable |
|---|---|---|---|---|
| sr5434/universal_classifier_nouls | ~300 M | no disponible | Gemma | Accuracy 0,8136 sobre conjunto propio no descrito |
| google/embeddinggemma-300m (modelo base) | ~300 M | no disponible en esta ficha | Gemma | No es un clasificador; no comparable |
| distilbert-base-uncased | ~66 M | 512 tokens | Apache 2.0 | no disponible |
| microsoft/deberta-v3-base | ~184 M | 512 tokens | MIT | no disponible |
| answerdotai/ModernBERT-base | ~149 M | 8192 tokens | Apache 2.0 | no disponible |

Como referencia práctica, un clasificador derivado de un codificador de 300 M es entre 2 y 4 veces más grande que los clasificadores basados en DistilBERT o DeBERTa-v3-base, lo que implica mayor coste de inferencia a cambio de representaciones potencialmente más ricas, sin que existan datos publicados que confirmen una ventaja en accuracy para este caso concreto.

## Limitaciones y advertencias

- La model card está generada automáticamente y no describe el uso previsto, el conjunto de datos ni las limitaciones; el propio texto indica "More information needed" en todas esas secciones.
- El conjunto de etiquetas es desconocido. Antes de cualquier uso hay que inspeccionar el archivo de configuración del modelo (id2label) para determinar cuántas clases existen y qué representan.
- La accuracy de 0,8136 corresponde a un conjunto de evaluación no descrito: no se conoce su tamaño, composición ni equilibrio de clases, por lo que la cifra no es extrapolable a datos reales.
- La pérdida de entrenamiento seguía descendiendo en el último checkpoint registrado, lo que sugiere un posible infraentrenamiento y margen de mejora con más pasos.
- Riesgo de clasificaciones erróneas y de sobreconfianza: aunque el Brier score agregado es bajo, no hay desglose por clase ni análisis de errores.
- Sesgos: desconocidos, al no estar documentado el dataset de entrenamiento; pueden heredarse sesgos del modelo base y del corpus utilizado.
- Idiomas: no documentados. Aunque el modelo base pueda tener cobertura multilingüe, este ajuste fino puede haber restringido su comportamiento a los idiomas presentes en datos no publicados.
- Licencia Gemma: el uso comercial está sujeto a los Gemma Terms of Use, que incluyen una política de uso prohibido y obligaciones de redistribución de los términos a terceros. Es imprescindible revisarla antes de un despliegue en producción.
- El repositorio declara 0 descargas, 0 likes y un tamaño de 0,0 GB, lo que sugiere que los pesos podrían no estar disponibles o que la publicación está incompleta.
- Sin mantenimiento aparente: las fechas de creación y actualización difieren en cuatro segundos (25 de septiembre de 2026), lo que indica que no ha habido revisiones posteriores.
- No debe utilizarse como sustituto de un sistema de decisión automatizada en contextos de alto riesgo (crédito, contratación, diagnóstico) sin una validación exhaustiva y supervisión humana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sr5434/universal_classifier_nouls
- Modelo base: https://huggingface.co/google/embeddinggemma-300m
- Perfil del autor en Hugging Face: https://huggingface.co/sr5434
- Conjuntos de datos del autor: https://huggingface.co/sr5434/datasets
- Colección de modelos RLHF del autor: https://huggingface.co/collections/sr5434/rlhf-models
- Perfil del autor en GitHub: https://github.com/sr5434
- Términos de licencia de Gemma: https://ai.google.dev/gemma/terms
