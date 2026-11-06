# textgain/gliner2.5-nl-article-discovery-spans

## Resumen

GLiNER2.5 NL Article Discovery Spans es un modelo de extraccion de informacion desarrollado por Textgain, especializado en identificar pasajes de articulos de prensa neerlandeses que puedan servir como puntos de partida para encontrar reportajes relacionados o temas de seguimiento. Se trata de un fine-tuning del modelo multilingue GLiNER 2.5 de Fastino, adaptado especificamente al dominio del periodismo en neerlandes mediante 4.030 articulos anotados.

El modelo resuelve un problema concreto dentro de los pipelines de descubrimiento de contenido: dado un articulo, extraer fragmentos ("linkable_passage") que un motor de busqueda o un sistema de recomendacion pueda usar para localizar coberturas relacionadas. No es un modelo generativo, sino un extractor de spans basado en token-classification que devuelve el texto del pasaje, sus offsets de caracteres y una puntuacion de confianza GLiNER.

Con 287 millones de parametros y un formato de pesos safetensors, el modelo esta pensado para integrarse como componente de un sistema de recuperacion de informacion mas amplio, no como solucion autonoma. Su relevancia actual radica en que demuestra la aplicabilidad de la familia GLiNER2 a tareas de curaduria periodistica, un nicho poco cubierto por los extractores genericos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLiNER2 (extractor de spans basado en encoder transformer, token-classification) |
| Parametros totales | 287.355.159 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado con chunks de 768 caracteres) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | neerlandes (nl) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | fastino/gliner2.5-multi-v1 |
| Tamano del repositorio | 1.2 GB |
| Libreria | gliner2 |
| Pipeline | token-classification |

## Arquitectura y entrenamiento

El modelo parte de GLiNER 2.5 multilingue de Fastino, un extractor de informacion guiado por esquema que realiza extraccion de entidades y relaciones sin limite fijo de longitud de span. Sobre esa base, Textgain aplico un fine-tuning supervisado especifico para la tarea de deteccion de pasajes vinculables en articulos de prensa neerlandeses. La tarea se formula como token-classification con una unica etiqueta, `linkable_passage`, y el modelo devuelve texto, offsets y confianza por cada prediccion.

El conjunto de entrenamiento consta de 4.030 articulos de noticias en neerlandes anotados con Opus 5.5. Los articulos se dividieron en 90% entrenamiento y 10% validacion (semilla 42) antes de fragmentarlos en chunks de 768 caracteres con solapamiento de 384. Se descartaron menos del 1% de articulos por contener pasajes etiquetados que no cabian en un chunk, quedando 7.576 chunks de entrenamiento y 791 de validacion. El entrenamiento duro 5 epocas con longitud maxima 768, batch size 1, acumulacion de gradiente 4, learning rate de 1e-5 para el encoder y 5e-4 para la cabeza de tarea, en precision FP32.

## Capacidades

- Extraccion de pasajes candidatos (`linkable_passage`) en articulos de noticias en neerlandes, con texto, offsets de caracteres (inicio y fin) y puntuacion de confianza.
- Procesamiento de textos largos mediante chunking configurable (`extract_entities_long` con `chunk_size` y `chunk_overlap`).
- Umbral de confianza ajustable para modular el equilibrio precision/recall.
- Extraccion guiada por esquema heredada de GLiNER2, sin limite fijo de longitud de span.
- Especializacion de dominio en prensa neerlandesa; no se ha establecido rendimiento en otros idiomas o generos.
- No es un modelo generativo: no produce texto libre ni razonamiento multi-paso.
- No se documenta soporte de tool calling ni capacidades de agente.

## Casos de uso

- Descubrimiento de reportajes relacionados: dado un articulo neerlandes, extraer pasajes que alimenten consultas en un motor de busqueda para localizar coberturas previas o conexas. Adecuado por su entrenamiento especifico en prensa nl y su salida con offsets listos para construir queries.
- Curaduria editorial automatizada: un equipo de redaccion puede usar los pasajes extraidos como sugerencias de angulos de seguimiento, con un umbral de 0.20 como punto de partida recomendado.
- Construccion de grafos de temas: los pasajes extraidos pueden indexarse y agruparse para detectar lineas informativas recurrentes en un corpus de noticias.
- Enriquecimiento de sistemas de recomendacion de contenido: los spans sirven como features para recomendar articulos de seguimiento a lectores.
- Investigacion periodistica asistida: extraccion de pasajes clave de un corpus historico para orientar busquedas en archivos y hemerotecas.
- Pipeline de monitorizacion de medios: procesamiento por lotes de articulos entrantes para generar candidatos de busqueda que alimenten alertas tematicas.
- Evaluacion de cobertura informativa: comparar los pasajes extraidos de distintos medios para analizar como abordan un mismo tema.

## Benchmarks y rendimiento

Metricas de validacion frente a las anotaciones de referencia (Opus 5.5), segun la model card:

| Umbral | Precision | Recall | F1 |
|---|---:|---:|---:|
| 0.10 | 0.597 | 0.659 | 0.626 |
| 0.20 | 0.654 | 0.573 | 0.611 |
| 0.30 | 0.679 | 0.514 | 0.585 |

Datos adicionales de la model card:

| Metrica | Valor |
|---|---|
| Longitud media de pasaje extraido | ~94 palabras |
| Densidad de pasajes | ~5,5 pasajes por 1.000 palabras de articulo |
| Valor de recuperacion estimado (muestra de 20 articulos) | 164 pasajes extraidos, 85 (51,8%) valorados como direcciones de busqueda utiles |

El umbral recomendado es 0.20, con ligera preferencia por precision. Estas metricas miden la concordancia con las anotaciones originales, no la utilidad de los resultados de busqueda posteriores.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 287M parametros en FP32 (precision de entrenamiento) el modelo ocupa aproximadamente 1,15 GB de pesos, mas overhead de activaciones y del encoder.
- GPU recomendadas: no especificadas por el autor. Por tamano, cualquier GPU con al menos 4-8 GB de VRAM deberia ser suficiente en FP32; una RTX 3060 o superior es un minimo razonable.
- Cabe en GPU de consumo: si, previsiblemente en cualquier GPU moderna con 8 GB o mas, aunque el autor no publica requisitos oficiales.
- Opciones de despliegue: la libreria oficial es `gliner2` (`AutoExtractor.from_pretrained`). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| textgain/gliner2.5-nl-article-discovery-spans | 287M | nl | Extraccion de pasajes de descubrimiento en prensa | no disponible | Hugging Face |
| fastino/gliner2.5-multi-v1 (modelo base) | no disponible | multilingue | Extraccion de entidades y relaciones guiada por esquema | no disponible | Hugging Face |
| Extractores NER genericos (p. ej. modelos token-classification multilingues) | variable | multilingue | Etiquetado de entidades | variable | Hugging Face |

No se dispone de datos de benchmarks comparativos directos con alternativas en la informacion proporcionada. La comparacion con el modelo base es cualitativa: el fine-tuning especializa GLiNER 2.5 multilingue en una unica etiqueta y un unico dominio (prensa neerlandesa), a costa de perder generalidad.

## Limitaciones y advertencias

- Los pasajes extraidos pueden ser demasiado amplios y mezclar varios angulos, o demasiado cortos y carecer de contexto suficiente para una busqueda productiva.
- Varias predicciones pueden representar intenciones de busqueda similares, generando redundancia.
- Una confianza alta no garantiza resultados de busqueda utiles: la correlacion entre confianza y evaluacion posterior es muy limitada, segun el autor.
- El modelo se entreno solo con noticias neerlandesas; su rendimiento en otros idiomas o generos textuales no esta establecido.
- Es un generador de candidatos, no un sistema de recuperacion: requiere un pipeline posterior que filtre redundancias y evalue la relevancia de los resultados.
- Puede requerir post-procesado de los spans (por ejemplo, eliminar comillas) antes de usarlos como consultas en un motor de busqueda.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; conviene verificar antes de integrarlo en produccion.
- Riesgo de sesgo: no documentado por el autor; al derivar de noticias reales, puede heredar sesgos del corpus y de las anotaciones generadas por Opus 5.5.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/textgain/gliner2.5-nl-article-discovery-spans
- Modelo base GLiNER 2.5: https://huggingface.co/fastino/gliner2.5-multi-v1
- Pagina de GLiNER2.5 en Fastino: https://fastino.ai/models/gliner2-5
- Textgain (autor): https://www.textgain.com/
