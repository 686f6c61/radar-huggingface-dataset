# ylxsbn/bert-finetuned-ner

## Resumen

ylxsbn/bert-finetuned-ner es un modelo de clasificación de tokens (token classification) obtenido por ajuste fino del modelo de embeddings BAAI/bge-small-en-v1.5 sobre un conjunto de datos de reconocimiento de entidades nombradas (NER) no especificado en la model card. Lo desarrolla el usuario ylxsbn y se publica bajo licencia MIT. Su función es etiquetar secuencias de texto asignando una categoría a cada token, lo que lo sitúa en la familia de modelos extractivos (no generativos) usados para detectar entidades como personas, organizaciones, localizaciones o fechas en documentos.

El modelo tiene 33.215.625 parámetros, un tamaño de repositorio de 0,1 GB y pesos en formato safetensors, lo que lo convierte en una pieza muy ligera y apta para inferencia en CPU o en GPUs de gama baja. Parte de la arquitectura BERT de la familia bge-small, con 12 capas y una longitud de contexto heredada del modelo base (512 tokens), aunque la model card no documenta explícitamente este dato.

Su relevancia es limitada y de nicho: se trata de un experimento de ajuste fino derivado del framework Trainer de Hugging Face, con cero descargas y cero "likes" en el momento de la consulta, y sin model card completada (secciones de descripción, usos previstos y datos de entrenamiento marcadas como "More information needed"). Los únicos datos de rendimiento disponibles son las métricas de evaluación del propio entrenamiento: F1 0,9143, precisión 0,9011, recall 0,9278, accuracy 0,9823 y pérdida 0,0872.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer, base_model: BAAI/bge-small-en-v1.5) |
| Parámetros totales | 33.215.625 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base BAAI/bge-small-en-v1.5 admite 512 tokens |
| Tipos de cuantización | no disponible (el autor no publica variantes cuantizadas; al ser safetensors FP32 es convertible a FP16, INT8 e INT4) |
| Idiomas soportados | no disponible; el modelo base está orientado a inglés |
| Licencia | MIT |
| Formato de pesos | safetensors (librería transformers) |
| Pipeline | token-classification |
| Tamaño del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer tipo BERT, tomado del checkpoint BAAI/bge-small-en-v1.5 y adaptado a clasificación de tokens mediante una cabeza de clasificación por token. Con 33,2 millones de parámetros y 12 capas, se trata de un modelo compacto pensado para extracción de características y etiquetado de secuencias, no para generación de texto. La model card no documenta la innovación técnica del ajuste ni cambios sobre la arquitectura del modelo base.

El ajuste fino se realizó con el Trainer de Hugging Face siguiendo estos hiperparámetros: learning rate 2e-05, train_batch_size 16, eval_batch_size 16, semilla 42, optimizador AdamW (beta1 0,9, beta2 0,999, epsilon 1e-08, sin argumentos adicionales), scheduler lineal y 20 épocas. El conjunto de datos de entrenamiento y evaluación se describe literalmente como "an unknown dataset", por lo que se desconoce el número de tokens, la composición del corpus y el esquema de etiquetas (etiquetas BIO/BILUO, categorías de entidad, idioma del corpus). No se menciona uso de RLHF, DPO ni ninguna técnica de alineación posterior. Las versiones de framework declaradas son Transformers 4.50.0, PyTorch 2.10.0+cu128, Datasets 3.4.1 y Tokenizers 0.21.4.

## Capacidades

- Clasificación de tokens a nivel de secuencia: asigna una etiqueta a cada token de entrada, el caso de uso canónico de reconocimiento de entidades nombradas.
- Extracción de entidades en texto: siempre que el esquema de etiquetas del ajuste fino corresponda a las categorías que se quieran extraer.
- Procesamiento por lotes: al ser un modelo pequeño, admite lotes grandes con un coste de memoria reducido.
- Inferencia sobre textos de hasta 512 tokens (límite heredado del modelo base; no confirmado en la model card).
- Integración directa con el ecosistema transformers y con el pipeline `token-classification`.
- No dispone de generación de texto: es un modelo extractivo, no produce lenguaje.
- No dispone de tool calling, function calling ni soporte de agentes.
- No dispone de modo "thinking", razonamiento multi-paso, visión ni audio.
- Capacidad multilingüe: no documentada; el modelo base está orientado a inglés.
- Capacidad de código, matemáticas o instrucciones: no aplica a esta arquitectura ni se documenta.

## Casos de uso

- Extracción de entidades en digitalización documental: aplicar el modelo sobre contratos, facturas o expedientes escaneados y pasar el texto por OCR para etiquetar personas, organizaciones e importes como paso previo a la indexación. Su tamaño reducido (33 M de parámetros) permite procesar volúmenes altos por documento con coste mínimo.
- Anonimización y seudonimización de datos personales: dado un esquema de etiquetas con categorías de PII, el modelo sirve como primer filtro para localizar y enmascarar nombres propios antes de compartir un corpus, con la ventaja de que puede ejecutarse en local sin enviar datos a terceros.
- Enriquecimiento de bases de conocimiento y grafos: poblar entidades y relaciones a partir de texto no estructurado, generando nodos tipados para un grafo de conocimiento. Adecuado porque la salida es directamente un conjunto de menciones con su categoría y desplazamiento en el texto.
- Preprocesado para pipelines RAG: extraer metadatos de entidad de los fragmentos antes de indexarlos en un almacén vectorial, de modo que las consultas puedan filtrarse por organización, lugar o fecha además de por similitud semántica.
- Triaje de tickets y correo de soporte: etiquetar entidades (producto, cliente, versión, ubicación) en mensajes entrantes para enrutarlos automáticamente al equipo correspondiente, con latencia de milisegundos en CPU.
- Análisis de currículos y procesos de selección: extracción de titulaciones, empresas y puestos para normalizar candidaturas en un ATS. Requiere validar previamente el esquema de etiquetas, ya que no está documentado.
- Etiquetado asistido de corpus para investigación: usar el modelo como anotador automático y aplicar corrección humana posterior, reduciendo el coste de anotación manual en estudios de PLN.
- Clasificación de entidades en flujos de moderación: detección de menciones a organizaciones o personas en contenido generado por usuarios para alimentar reglas de moderación.

## Benchmarks y rendimiento

La model card no incluye un model-index con resultados (`results: []`), por lo que no hay comparaciones publicadas con otros modelos. El autor sí publica las métricas de la evaluación final y la evolución durante el entrenamiento:

| Métrica (conjunto de evaluación, época 12) | Valor |
|---|---|
| Loss | 0,0872 |
| Precision | 0,9011 |
| Recall | 0,9278 |
| F1 | 0,9143 |
| Accuracy | 0,9823 |

Evolución durante el entrenamiento (extracto completo de la tabla de la model card):

| Training loss | Época | Step | Validation loss | Precision | Recall | F1 | Accuracy |
|---|---|---|---|---|---|---|---|
| 0,4788 | 1.0 | 625 | 0,1743 | 0,7738 | 0,8228 | 0,7976 | 0,9632 |
| 0,1691 | 2.0 | 1250 | 0,1099 | 0,8632 | 0,8945 | 0,8786 | 0,9768 |
| 0,1117 | 3.0 | 1875 | 0,0901 | 0,8669 | 0,9086 | 0,8873 | 0,9782 |
| 0,0646 | 4.0 | 2500 | 0,0823 | 0,8858 | 0,9162 | 0,9007 | 0,9809 |
| 0,0506 | 5.0 | 3125 | 0,0816 | 0,8927 | 0,9214 | 0,9068 | 0,9811 |
| 0,0396 | 6.0 | 3750 | 0,0772 | 0,8910 | 0,9217 | 0,9061 | 0,9812 |
| 0,0360 | 7.0 | 4375 | 0,0803 | 0,8930 | 0,9258 | 0,9091 | 0,9814 |
| 0,0263 | 8.0 | 5000 | 0,0837 | 0,9033 | 0,9278 | 0,9154 | 0,9821 |
| 0,0225 | 9.0 | 5625 | 0,0793 | 0,9080 | 0,9298 | 0,9188 | 0,9829 |
| 0,0208 | 10.0 | 6250 | 0,0814 | 0,9093 | 0,9283 | 0,9187 | 0,9829 |
| 0,0195 | 11.0 | 6875 | 0,0851 | 0,9034 | 0,9243 | 0,9137 | 0,9819 |
| 0,0158 | 12.0 | 7500 | 0,0872 | 0,9011 | 0,9278 | 0,9143 | 0,9823 |

El mejor F1 registrado en la tabla es 0,9188 en la época 9, con 0,9187 en la época 10; a partir de ahí el rendimiento se estabiliza y la pérdida de validación repunta ligeramente. La model card no aclara en qué época se guardó el checkpoint final. No hay benchmarks estándar (MMLU, GSM8K, HumanEval, CoNLL-2003, etc.) publicados en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 133 MB en FP32 (33,2 M de parámetros × 4 bytes), unos 66 MB en FP16/BF16, unos 33 MB en INT8 y unos 17 MB en INT4. Hay que sumar la memoria de activaciones y del tokenizador, del orden de decenas de megabytes para lotes pequeños en secuencias de 512 tokens.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente. Modelos como NVIDIA T4, RTX 3060, RTX 4090, A100 o H100 quedan sobradamente dimensionados; en la práctica el cuello de botella será el preprocesado del texto, no el modelo.
- Cabe en cualquier GPU de consumo, incluidas integradas con soporte CUDA o ROCm, y también en CPU moderna con buen rendimiento por lote.
- Opciones de despliegue: pipeline `token-classification` de transformers, exportación a ONNX Runtime o TorchScript para inferencia acelerada, y servicios de inferencia compatibles (el repositorio está marcado como `endpoints_compatible`). No se documentan soportes para vLLM, TGI, llama.cpp u Ollama; estos motores están orientados a modelos generativos y no cubren de forma estándar cabezas de clasificación de tokens de BERT.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de comparativas publicadas por el autor ni de resultados de benchmarks que permitan contrastar este modelo con alternativas. La única referencia disponible es el modelo base del que deriva.

| Modelo | Parámetros | Contexto | Tarea | Licencia | Métricas NER |
|---|---|---|---|---|---|
| ylxsbn/bert-finetuned-ner | 33.215.625 | no disponible (base: 512) | token-classification | MIT | F1 0,9143 (conjunto de evaluación propio, esquema desconocido) |
| BAAI/bge-small-en-v1.5 (modelo base) | ~33 M | 512 | embeddings de frase / retrieval | MIT | no aplica (no es modelo NER) |
| Otras alternativas tipo BERT pequeño ajustado a NER | no disponible | no disponible | token-classification | no disponible | no disponible |

La comparación directa con alternativas de la misma categoría no es posible porque no hay datos de benchmarks en la información proporcionada.

## Limitaciones y advertencias

- Model card incompleta: las secciones de descripción, usos previstos, limitaciones y datos de entrenamiento están marcadas como "More information needed". No se puede determinar para qué fue diseñado ni qué entidades reconoce.
- Conjunto de datos desconocido: se describe literalmente como "an unknown dataset", por lo que se ignoran el esquema de etiquetas, el dominio, el idioma y el número de ejemplos. Sin ese dato no es posible validar que el modelo sirva para una tarea concreta.
- Las métricas publicadas (F1 0,9143, accuracy 0,9823) proceden de un conjunto de evaluación propio del autor y no son comparables con resultados de benchmarks estándar como CoNLL-2003.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos y falsos negativos en la detección de entidades, especialmente en dominios distintos al de entrenamiento.
- Sesgos: no documentados; al desconocerse el corpus de ajuste no se puede evaluar el sesgo de dominio, género o geográfico.
- Limitación de contexto: si el texto supera la ventana del modelo base (512 tokens), será necesario truncar o dividir en fragmentos, lo que puede romper entidades que crucen el límite.
- Limitación de idioma: el modelo base está orientado a inglés y la model card no declara idiomas soportados; el uso en castellano no está validado.
- Licencia MIT: permite uso comercial, modificación y redistribución con atribución y sin garantías. Es la parte mejor documentada del repositorio.
- Advertencia para producción: al no existir documentación del esquema de etiquetas, cualquier integración requiere inspeccionar la configuración del modelo (`id2label`) y validar el rendimiento sobre datos propios antes de desplegarlo. Sin esa validación, no debería usarse en flujos con impacto sobre usuarios.
- Sin tracción ni mantenimiento demostrables: cero descargas y cero "likes"; el repositorio se creó y actualizó el 5 de octubre de 2026 con 13 minutos de diferencia entre ambos eventos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ylxsbn/bert-finetuned-ner
- Modelo base: https://huggingface.co/BAAI/bge-small-en-v1.5
- Paper del modelo base BGE (BAAI General Embedding): no disponible en la información proporcionada
- Repositorio de código del autor: no disponible
- Demo o espacio de inferencia: no disponible
- Resultados de la búsqueda web: las únicas coincidencias obtenidas corresponden a predicciones meteorológicas de Tallin (AccuWeather, ILM.EE, Yr, BBC Weather) y no guardan relación con el modelo, por lo que no se incluyen como enlaces relevantes.
