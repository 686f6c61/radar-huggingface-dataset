# vllm-sr/d3.1-nano

## Resumen

d3.1-nano es un modelo de decisión multimodal de 2,21 mil millones de parámetros desarrollado por el equipo de vLLM Semantic Router, presentado como parte de la familia "Decision 3.0". A diferencia de un modelo generativo convencional, no produce texto: recibe un estado (texto o JSON, opcionalmente acompañado de imágenes y vídeos) junto con un conjunto de preguntas tipificadas (elección entre opciones, sí/no o puntuación en una escala) y devuelve, en una sola llamada, una probabilidad para cada respuesta posible.

El modelo se construye sobre Qwen/Qwen3.5-2B mediante ajuste fino y añade un codificador visual de 0,33B parámetros, lo que lo sitúa como un clasificador zero-shot multimodal con soporte de visión y vídeo. Su propósito es actuar como "system one" dentro de un enrutador semántico: tomar decisiones rápidas y estructuradas (enrutamiento de peticiones, verificaciones binarias, priorización) sin coste de generación autoregresiva de texto.

Es relevante porque cubre un nicho poco habitual: modelos pequeños, con licencia Apache-2.0 y diseño específico para clasificación y enrutamiento multi-etiqueta en pipelines de producción, donde la latencia y la previsibilidad importan más que la generación libre. El repositorio ocupa 4,4 GB y se distribuye en formato safetensors con código personalizado (`trust_remote_code`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con capas de atención lineal (base Qwen3.5-2B más codificador visual) |
| Parametros totales | 2.213.241.664 (2,21B), incluidos 0,33B del codificador visual |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-2B y se ajusta para una tarea de decisión estructurada. Incorpora un codificador visual de 0,33B parámetros que procesa imágenes a hasta 1,6 megapíxeles y vídeos a 2 fotogramas por segundo (máximo 32 fotogramas repartidos por todo el vídeo, cada uno a hasta 0,2 megapíxeles). Las imágenes se colocan antes del texto de la petición y los vídeos después de las imágenes; todas las preguntas de una misma llamada ven el conjunto completo de entradas multimodales.

La arquitectura incluye capas de atención lineal, para las que el autor recomienda instalar `flash-linear-attention` como kernels rápidos en GPU (opcional). El modelo requiere `transformers==5.17.0` y carga con `trust_remote_code=True`, lo que indica código de modelado personalizado. No se han publicado en la información disponible detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. El autor menciona un "Decision Index" evaluable mediante el motor `d3_engine:D3Engine`, que por defecto puntúa cada pregunta de elección en dos órdenes de opciones (promediado por permutación).

## Capacidades

- Clasificación zero-shot con tres tipos de decisión: elección entre varias opciones (`choice`), sí/no (`noul`) y puntuación en escala ordinal (`score`).
- Respuesta multi-pregunta en una sola llamada: devuelve probabilidades para todas las preguntas y opciones simultáneamente, sin generar texto.
- Procesamiento de texto y JSON como estado de entrada.
- Procesamiento multimodal: imágenes (varias por petición) y vídeos (varios por petición).
- Diseño orientado a enrutamiento y toma de decisiones ("system one") dentro de un enrutador semántico.
- Integración como pipeline de transformers (`pipeline("decision", ...)`).
- Soporte de criterios con descripciones para cada opción, lo que permite guiar la clasificación sin reentrenamiento.
- No dispone de tool calling ni de razonamiento multi-paso generativo: su salida es probabilística, no textual.

## Casos de uso

- Enrutamiento de tickets de soporte: dado el texto de una incidencia, decidir a qué equipo asignarla (devoluciones, facturación, técnico) con una única llamada y probabilidades por opción, lo que permite umbrales de confianza y derivación a revisión humana.
- Verificación documental con visión: comprobar si un justificante o recibo adjunto contiene un producto concreto o si el cliente dispone de prueba de compra, combinando la imagen con el estado textual.
- Priorización de urgencias: usar preguntas de tipo `score` para clasificar peticiones en niveles (rutina, pronto, hoy) y alimentar colas de atención con orden de prioridad.
- Moderación y filtrado binario: preguntas `noul` para decidir si un contenido cumple una política concreta antes de pasarlo a un modelo generativo mayor.
- Análisis de vídeo de vigilancia o pruebas: determinar la dirección de movimiento de un objeto o si cambia de color en un clip corto, útil en pipelines de inspección automatizada.
- Clasificación de formularios y JSON estructurados: validar campos, detectar inconsistencias o etiquetar registros en lote sin coste de generación.
- Puerta de enrutamiento en arquitecturas de modelos múltiples: decidir qué modelo grande debe atender una petición según su tipo, reduciendo el coste de inferencia global.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor referencia un "Decision Index" ejecutable con el motor `d3_engine:D3Engine`, pero no se incluyen cifras en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 2,21B parámetros en fp16 se requieren aproximadamente 4,4 GB solo para pesos, más memoria para el codificador visual y las activaciones.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabe en GPUs de consumo con suficiente VRAM; el ejemplo de la model card usa `device=cuda:0` sin más restricciones.
- Cabe en GPU de consumo: previsiblemente sí en modelos con 8 GB o más en fp16, aunque el dato no está confirmado por el autor.
- Opciones de despliegue: transformers (versión 5.17.0) con `trust_remote_code=True`; pipeline `decision`; motor `d3_engine:D3Engine` para el Decision Index. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Tarea | Licencia |
|---|---|---|---|---|---|
| d3.1-nano | 2,21B | No disponible | Texto, imagen, vídeo | Clasificación y decisión estructurada | Apache-2.0 |
| Qwen/Qwen3.5-2B (base) | ~2B | No disponible | Texto | Generación | No disponible en esta ficha |
| Clasificadores zero-shot tipo NLI | Variable (0,1B-1B) | No disponible | Texto | Clasificación zero-shot | Variable |

La comparación directa con alternativas es limitada porque d3.1-nano no es un modelo generativo: compite con clasificadores zero-shot y con el uso de LLMs generativos para tareas de enrutamiento. Frente a un LLM generativo del mismo tamaño, ofrece salidas probabilísticas estructuradas y evita la generación de texto; frente a clasificadores NLI clásicos, añade multimodalidad (imagen y vídeo) y preguntas múltiples por llamada.

## Limitaciones y advertencias

- No genera texto: no sirve para tareas de generación, resumen, diálogo abierto ni razonamiento multi-paso.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del autor del modelo; conviene auditar el repositorio antes de usarlo en producción.
- Dependencia de una versión concreta de transformers (5.17.0), lo que puede complicar la integración en entornos con versiones fijadas.
- Idiomas soportados no declarados: no hay garantía explícita de rendimiento multilingüe más allá del comportamiento heredado de Qwen3.5-2B.
- Longitud de contexto no publicada: no se puede planificar el uso con entradas largas sin validación empírica.
- Riesgo de calibración: al devolver probabilidades, la calidad depende de umbrales bien ajustados; no se han publicado métricas de calibración.
- Límites multimodales concretos: imágenes a 1,6 MP como máximo y vídeos a 2 fps con 32 fotogramas como máximo, lo que puede perder detalle en clips largos o de alta dinámica.
- Sin descargas ni likes en el momento de la consulta y con fecha de creación reciente, por lo que la validación comunitaria es inexistente.
- Licencia Apache-2.0 permite uso comercial, pero deben revisarse los avisos de terceros en el fichero NOTICE del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vllm-sr/d3.1-nano
- Repositorio de vLLM Semantic Router: https://github.com/vllm-project/semantic-router
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
