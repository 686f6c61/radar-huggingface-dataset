# VINAY-UMRETHE/refusal-detector

## Resumen

El modelo `VINAY-UMRETHE/refusal-detector` es un clasificador de secuencias basado en la arquitectura ModernBERT, desarrollado por el usuario VINAY-UMRETHE y publicado en HuggingFace. Su funcion es detectar y categorizar el comportamiento de rechazo (refusal) en las respuestas de un modelo de lenguaje: dado un par formado por un prompt y su respuesta, el modelo asigna una de cinco etiquetas (`compliant`, `full_refusal`, `partial_refusal`, `capability_limitation`, `clarification`). El problema que resuelve es relevante para equipos que necesitan auditar, etiquetar o monitorizar a gran escala el comportamiento de LLM desplegados, ya sea para evaluar politicas de seguridad, para construir datasets de alineamiento o para detectar degradaciones de servicio.

Tecnicamente es un modelo encoder-only de 149.608.709 parametros (aproximadamente 0,6 GB en el repositorio), con pesos en formato safetensors y licencia no especificada. El modelo base declarado es `results/final`, una referencia que no se corresponde con ningun identificador publico resoluble en HuggingFace, lo que dificulta reproducir el entrenamiento. El modelo solo declara soporte para ingles.

Su relevancia actual es la de una pieza de infraestructura de evaluacion: los clasificadores de refusal son utiles como componente de pipelines de red teaming y de control de calidad, y este en concreto ofrece una taxonomia mas granular que la habitual dicotomia rechaza/no rechaza, distinguiendo entre rechazo total, parcial, limitacion de capacidad y peticion de aclaracion. No obstante, el modelo tiene cero descargas y cero "likes" en el momento de redactar esta ficha, y no publica resultados de benchmarks numericos en la informacion disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only, familia ModernBERT (segun etiqueta del repositorio) |
| Parametros totales | 149.608.709 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (la etiqueta `modernbert` apunta a una arquitectura con soporte de contexto largo, pero la model card no confirma la longitud configurada) |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos safetensors; no se publican variantes GGUF, AWQ, GPTQ ni ONNX) |
| Idiomas soportados | ingles (`en`) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tarea | clasificacion de texto (5 clases) |
| Etiquetas de clase | `compliant`, `full_refusal`, `partial_refusal`, `capability_limitation`, `clarification` |
| Modelo base | `results/final` (referencia no resoluble publicamente) |
| Tamano del repositorio | 0,6 GB |
| Libreria | transformers |
| Compatibilidad de despliegue | `text-embeddings-inference`, `endpoints_compatible` |

## Arquitectura y entrenamiento

La etiqueta principal del repositorio es `modernbert`, lo que situa al modelo en la familia ModernBERT: una arquitectura transformer encoder-only con mejoras de eficiencia respecto a BERT clasico (rotary position embeddings, atencion sin sesgo, capas normalizadas y kernels optimizados). El recuento de 149,6 millones de parametros es coherente con una variante de tamano base de esa familia. La cabeza de clasificacion es la estandar de `AutoModelForSequenceClassification`, con cinco clases de salida, y el uso previsto es el de un clasificador de pares prompt/respuesta: el tokenizador se invoca con `text_pair=response`, de modo que prompt y respuesta se concatenan como una unica secuencia de entrada. La model card no desglosa el numero de capas, dimension oculta ni cabezas de atencion.

El entrenamiento se realizo con el `Trainer` de HuggingFace, optimizador AdamW, decaimiento lineal con warmup, recorte de gradiente y parada temprana. El conjunto de datos es un corpus estratificado de pares prompt/respuesta dividido 80/10/10 (entrenamiento/validacion/prueba). La seleccion del modelo se hizo segun macro-F1 en validacion y las metricas finales se midieron una unica vez sobre el split de prueba retenido, con artefactos publicados en el propio repositorio (`eval_results.json`, `classification_report.txt`, `confusion_matrix.json`). No se menciona uso de RLHF, DPO ni ninguna otra etapa de ajuste por preferencias, algo esperable en un clasificador. Las curvas de entrenamiento (perdida, exactitud, macro y weighted F1, precision y recall) se publican en un dashboard de Trackio. La model card no indica el volumen de ejemplos, la procedencia del corpus ni si hubo anotacion humana o generada sinteticamente.

## Capacidades

- Clasificacion de pares prompt/respuesta en cinco categorias mutuamente excluyentes, con salida de probabilidades mediante softmax.
- Deteccion de rechazo explicito (respuestas del tipo "no puedo ayudar con eso"), mapeado a la clase `full_refusal`.
- Deteccion de rechazo parcial o con matices, donde el modelo ofrece alternativas o ayuda limitada, mapeado a `partial_refusal`.
- Distincion entre negativa por limites de capacidad (falta de acceso a datos en tiempo real, falta de conocimiento, limites del sistema) y negativa por politica, mapeada a `capability_limitation`.
- Identificacion de respuestas de aclaracion o solicitud de informacion adicional, mapeada a `clarification`.
- Identificacion de respuestas conformes, es decir, respuestas que atienden la peticion sin restricciones, mapeadas a `compliant`.
- Capacidad de clasificacion de pares de texto generico, al ser un modelo de la tarea `text-classification` con cabeza de secuencia.
- Soporte de despliegue mediante HuggingFace Inference Endpoints y text-embeddings-inference, segun las etiquetas del repositorio.
- No se declara soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento: es un clasificador discriminativo y no un modelo generativo.

## Casos de uso

- Auditoria de seguridad de LLM en produccion: el clasificador puede ejecutarse sobre cada par prompt/respuesta registrado por el sistema, de forma asincrona, para etiquetar que porcentaje de las interacciones acaba en rechazo total o parcial y detectar cambios de comportamiento tras actualizar el modelo o las politicas. Su tamano reducido permite procesar millones de pares con coste bajo.
- Construccion de datasets de alineamiento y evaluacion: los cinco niveles de etiqueta permiten filtrar y balancear corpora de refusal, por ejemplo para entrenar un modelo que distinga entre negativas por politica y negativas por capacidad, algo que una taxonomia binaria no captura.
- Red teaming automatizado: en un pipeline que genera prompts adversariales y recoge las respuestas del modelo objetivo, el clasificador actua como juez automatico para medir la tasa de cumplimiento por categoria de ataque, reduciendo el cuello de botella de la revision manual.
- Monitorizacion de deriva de comportamiento: ejecutando el clasificador de forma periodica sobre un conjunto fijo de prompts de referencia, se pueden detectar variaciones en la distribucion de clases tras cambios de version, temperatura o system prompt, lo que sirve como senal de alerta temprana.
- Deteccion de limitaciones de capacidad frente a politicas de seguridad: el modelo separa `capability_limitation` de `full_refusal`, lo que permite a un equipo de producto distinguir los casos en que el asistente deberia mejorar su acceso a datos o herramientas de aquellos en que simplemente esta aplicando una restriccion.
- Analitica de producto sobre conversaciones: agregando la etiqueta predicha por turno se pueden construir paneles que midan, por ejemplo, cuantas conversaciones empiezan con `clarification` y cuantas terminan en `full_refusal`, informacion util para redisenar flujos de atencion al cliente o asistentes internos.
- Control de calidad en anotacion humana: el clasificador puede pre-etiquetar grandes volumenes de pares prompt/respuesta y usarse como pre-anotador en herramientas de revision, dejando al anotador solo la verificacion de los casos de baja confianza.
- Filtrado previo en pipelines de destilacion o sintesis de datos: cuando se generan respuestas sinteticas y se quiere conservar unicamente las que evitan el rechazo, el clasificador permite descartar automaticamente las que caen en `partial_refusal` o `full_refusal`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que existen artefactos de evaluacion en el repositorio (`eval_results.json`, `classification_report.txt`, `confusion_matrix.json`), pero los valores numericos no forman parte de la informacion proporcionada, por lo que no se replican aqui.

## Requisitos de hardware

- VRAM estimada para los pesos, calculada a partir de los 149.608.709 parametros: aproximadamente 0,6 GB en FP32, 0,3 GB en FP16/BF16 y 0,15 GB en INT8. Son estimaciones derivadas del recuento de parametros, no mediciones publicadas.
- Con activaciones y overhead de runtime, la inferencia en FP16/BF16 deberia caber holgadamente en cualquier GPU con 2 GB o mas de VRAM.
- GPU recomendadas: cualquier GPU consumer moderna sirve, incluidas RTX 3060, RTX 4060, RTX 4090, asi como Apple Silicon mediante MPS. Para procesamiento por lotes a gran escala son preferibles A100, H100 o L40S por throughput agregado, no por requisito de memoria.
- Cabe en GPU de consumo: si, con margen amplio, dado el tamano del modelo.
- Opciones de despliegue: pipeline de `transformers` con `AutoModelForSequenceClassification`, HuggingFace Inference Endpoints, text-embeddings-inference (ambos declarados en las etiquetas del repositorio), ONNX Runtime o `optimum` si se exporta manualmente. No se publican pesos GGUF, por lo que llama.cpp y Ollama no son utilizables sin una conversion previa.
- Latencia y throughput: no disponible. No hay mediciones publicadas en la informacion proporcionada.

## Comparativa con modelos similares

La categoria de referencia son los clasificadores de seguridad y de comportamiento de LLM. La informacion proporcionada no incluye especificaciones de esos modelos, de modo que los campos cuantitativos se marcan como no disponibles.

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VINAY-UMRETHE/refusal-detector | Encoder clasificador, 5 clases de refusal | 149,6 M | no disponible | no disponible | HuggingFace, safetensors |
| Llama Guard (familia de Meta) | Modelo generativo que emite etiquetas de seguridad | no disponible en esta informacion | no disponible en esta informacion | no disponible en esta informacion | HuggingFace |
| ShieldGemma (familia de Google) | Modelo generativo de moderacion | no disponible en esta informacion | no disponible en esta informacion | no disponible en esta informacion | HuggingFace |
| WildGuard (Ai2) | Clasificador generativo de dano y refusal | no disponible en esta informacion | no disponible en esta informacion | no disponible en esta informacion | HuggingFace |

Diferencia estructural relevante: las alternativas citadas son modelos generativos que producen una etiqueta como texto, con un coste de inferencia muy superior, mientras que `refusal-detector` es un encoder de 150 M de parametros que devuelve directamente un vector de logits sobre cinco clases, lo que lo hace mucho mas barato de ejecutar a gran escala. La contrapartida es que su taxonomia es fija y no puede adaptarse con instrucciones en tiempo de inferencia, y que no se han publicado resultados que permitan comparar su calidad frente a esas alternativas.

## Limitaciones y advertencias

- Entrenado principalmente con datos de refusal en ingles; la propia model card advierte de que el rendimiento puede degradarse en otros idiomas o ante estilos de refusal alejados de la distribucion de entrenamiento. La etiqueta de idioma del repositorio es unicamente `en`.
- Riesgo de alucinacion: al ser un clasificador no genera texto, pero si puede producir clasificaciones incorrectas con alta confianza. La salida softmax no esta calibrada por defecto y no se publican temperaturas ni umbrales de decision recomendados.
- El modelo base declarado, `results/final`, no es un identificador resoluble publicamente en HuggingFace, lo que impide reproducir el punto de partida del ajuste fino y verificar la procedencia exacta de los pesos.
- Licencia no disponible: sin una licencia explicita no hay autorizacion clara para uso comercial, redistribucion o modificacion. Cualquier uso en produccion deberia aclararse previamente con el autor.
- Sin adopcion verificable: cero descargas y cero "likes" en el momento de la consulta, y sin publicacion asociada ni resultados de benchmarks en la informacion disponible. No hay evidencia externa de calidad.
- La fecha de creacion registrada en los metadatos (2026-09-11) resulta atipica respecto a la fecha de consulta, lo que sugiere posibles inconsistencias en los metadatos del repositorio.
- No se documenta el corpus de entrenamiento: se desconoce si las etiquetas provienen de anotacion humana, de un modelo juez o de heurísticas. Esto afecta directamente a la fiabilidad de las etiquetas y al riesgo de sesgos heredados del etiquetador.
- Al ser sensible al contenido de seguridad, el clasificador puede heredar sesgos del corpus: sobrerrepresentacion de ciertos topicos considerados sensibles, diferencias de comportamiento entre variantes dialectales del ingles o tratamiento desigual de determinados temas.
- La distincion entre `capability_limitation` y `full_refusal` es sutil y depende en gran medida de la formulacion de la respuesta; se espera confusion entre clases proximas, aunque no se dispone de la matriz de confusion para cuantificarlo.
- No admite instrucciones en tiempo de inferencia ni categorias personalizadas: para adaptar la taxonomia hay que reentrenar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/VINAY-UMRETHE/refusal-detector
- Dashboard de entrenamiento (Trackio): https://huggingface.co/spaces/VINAY-UMRETHE/refusal-detector-trackio
- Modelo base declarado: https://huggingface.co/results/final (referencia no resoluble en la informacion disponible)
- No se han encontrado en la busqueda web enlaces relevantes al modelo, papers, blogs o repositorios asociados. Los resultados de busqueda disponibles versan sobre rutas de sistema en Windows y no guardan relacion con esta ficha.
