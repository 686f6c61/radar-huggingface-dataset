# vmarin3/router

## Resumen

`vmarin3/router` es un modelo de clasificación de texto publicado en HuggingFace por el usuario vmarin3. Se trata de un DistilBERT afinado (fine-tuned), tal como indican los tags del repositorio (`distilbert`, `text-classification`) y el número de parámetros reales extraídos de los pesos en safetensors: 66.955.010, cifra que coincide con la arquitectura DistilBERT base. El modelo está pensado, por su nombre y pipeline, para tareas de enrutamiento o clasificación de entradas de texto.

La relevancia de este modelo es limitada: se trata de un artefacto de bajo perfil (57 descargas, 0 likes) cuya model card es la plantilla automática de HuggingFace sin rellenar. No hay información pública sobre el conjunto de datos de entrenamiento, el objetivo concreto de clasificación, las etiquetas de salida ni los resultados de evaluación. El tag `arxiv:1910.09700` corresponde al artículo de Lacoste et al. sobre el impacto ambiental del aprendizaje automático, citado en la plantilla de la model card, no a un paper propio del modelo.

Por tanto, esta ficha documenta lo que se puede verificar objetivamente (arquitectura, tamaño, formato, pipeline) y marca explícitamente como "no disponible" todo aquello que el autor no ha publicado. Cualquier uso en producción debería ir precedido de una inspección directa del repositorio y de una evaluación propia sobre el dominio objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder destilado de BERT) |
| Parametros totales | 66.955.010 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (DistilBERT base admite habitualmente 512 tokens, pero no confirmado por el autor) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion posible via herramientas externas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es DistilBERT, un transformer encoder de 6 capas obtenido por destilación de conocimiento a partir de BERT base, con aproximadamente 66 millones de parámetros. El modelo se distribuye como `AutoModelForSequenceClassification` (pipeline `text-classification`) y es cargable con la librería `transformers`. El repositorio incluye también pesos en formato safetensors, lo que permite su carga con `safetensors` y su conversión a otros formatos.

No hay información disponible sobre el proceso de entrenamiento: ni el conjunto de datos, ni el número de tokens, ni las etiquetas del clasificador, ni si hubo ajuste fino supervisado, destilación adicional o técnicas de regularización. La model card es la plantilla automática de HuggingFace y todos los campos relevantes aparecen como "[More Information Needed]". Tampoco se documentan hiperparámetros, régimen de precisión ni infraestructura de cómputo.

## Capacidades

- Clasificación de texto (pipeline `text-classification`): el modelo devuelve etiquetas y puntuaciones de probabilidad para una entrada de texto.
- Enrutamiento o categorización: por el nombre `router`, es plausible que se haya ajustado para decidir a qué categoría, cola o modelo derivar una consulta, aunque el autor no lo documenta.
- Inferencia ligera: con 67 millones de parámetros, es adecuado para entornos con recursos limitados y para procesar lotes grandes de textos cortos.
- No se ha documentado soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.
- Capacidades multilingües: no disponibles; el autor no declara idiomas soportados.

## Casos de uso

- Enrutamiento de consultas en un sistema de atención al cliente: dado un mensaje entrante, el modelo puede clasificarlo en una categoría (facturación, soporte técnico, reclamaciones) y derivarlo al equipo o flujo adecuado. Su tamaño reducido permite ejecutarlo en cada petición con baja latencia.
- Clasificación de tickets o correos en un helpdesk: procesar lotes de mensajes para asignar prioridad o etiqueta temática, aprovechando que el modelo cabe en CPU y no requiere GPU dedicada.
- Filtrado de contenido en pipelines de ingesta: etiquetar documentos o comentarios según categorías predefinidas antes de pasarlos a un modelo generativo mayor, reduciendo coste y latencia del sistema completo.
- Moderación preliminar de textos cortos: como primera etapa de un clasificador en cascada que descarte o marque entradas antes de un análisis más costoso.
- Enrutamiento entre modelos (model routing): decidir si una consulta debe ir a un modelo pequeño y barato o a uno grande y caro, si el ajuste del modelo se orientó a esa tarea.
- Clasificación de intenciones en asistentes conversacionales: etiquetar la intención del usuario en un turno de diálogo para seleccionar la respuesta o la herramienta adecuada.
- Prototipado rápido de clasificadores: servir como línea base ajustable con `Trainer` de HuggingFace sobre un dataset propio, dado su bajo coste de entrenamiento e inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 270 MB para los pesos (67 M parámetros × 4 bytes), más overhead de activaciones y del runtime; en la práctica, menos de 1 GB.
- VRAM estimada en fp16: aproximadamente 135 MB para los pesos.
- Cabe holgadamente en cualquier GPU consumer (GTX 1060, RTX 3060, RTX 4090) e incluso en CPU para inferencia por lotes con latencia aceptable.
- GPU recomendadas: no requiere GPU dedicada; una GPU consumer de gama baja acelera el procesamiento por lotes. Para despliegues de alto throughput, una T4 o L4 es suficiente.
- Opciones de despliegue: `transformers` (PyTorch), `optimum` con ONNX Runtime, `text-embeddings-inference` no aplica (no es un modelo de embeddings), y exportación a ONNX para servir con Triton o similar. `llama.cpp` y `Ollama` no son adecuados porque no es un modelo generativo.
- Latencia y throughput estimados: no disponibles; dependerán del hardware, del tamaño de lote y de la longitud de las entradas. Con 6 capas y 67 M parámetros, se espera un throughput alto en CPU y muy alto en GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vmarin3/router | 66.955.010 | no disponible | Clasificación de texto | no disponible | HuggingFace (57 descargas) |
| distilbert-base-uncased | ~66 M | 512 tokens | Modelo base (MLM) | Apache 2.0 | HuggingFace, ampliamente usado |
| distilbert-base-multilingual-cased | ~135 M | 512 tokens | Modelo base multilingüe | Apache 2.0 | HuggingFace |
| bert-base-uncased | ~110 M | 512 tokens | Modelo base (MLM) | Apache 2.0 | HuggingFace |

La comparación es limitada porque el modelo de vmarin3 no documenta su tarea concreta, sus etiquetas ni su rendimiento. Los modelos base de referencia (DistilBERT y BERT) tienen licencias y documentación públicas, mientras que `vmarin3/router` carece de ambas. Cualquier decisión de sustitución debería basarse en una evaluación empírica sobre el dominio de uso.

## Limitaciones y advertencias

- Model card vacía: no hay información sobre datos de entrenamiento, etiquetas, sesgos ni evaluación, lo que impide auditar el modelo.
- Licencia no disponible: no se puede asumir uso comercial permitido; es imprescindible contactar con el autor o inspeccionar el repositorio antes de usarlo en producción.
- Idiomas no declarados: se desconoce si el modelo funciona en castellano u otros idiomas distintos del inglés.
- Riesgo de alucinación no aplica en sentido estricto (no es generativo), pero sí existe riesgo de clasificaciones erróneas y de sobreconfianza en las puntuaciones de probabilidad.
- Sesgos desconocidos: al no documentarse el dataset de entrenamiento, no se pueden evaluar sesgos demográficos, de dominio o de estilo.
- Contexto máximo no confirmado: aunque DistilBERT base admite 512 tokens, el autor no lo especifica; entradas más largas podrían truncarse.
- Popularidad muy baja (57 descargas, 0 likes): no hay evidencia de uso en producción ni de validación por la comunidad.
- El tag `arxiv:1910.09700` corresponde a la cita de la plantilla sobre impacto ambiental, no a un paper del modelo; no debe interpretarse como respaldo científico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vmarin3/router
- Paper de DistilBERT (arquitectura base): https://arxiv.org/abs/1910.09700 (corresponde a Lacoste et al., citado en la plantilla; el paper de DistilBERT es https://arxiv.org/abs/1910.01108)
- Documentación de DistilBERT en transformers: https://huggingface.co/docs/transformers/model_doc/distilbert
- Documentación de pipelines de clasificación de texto: https://huggingface.co/docs/transformers/main_classes/pipelines#transformers.TextClassificationPipeline
