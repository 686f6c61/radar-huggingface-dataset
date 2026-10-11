# vllm-sr/d3-edge

## Resumen

d3-edge es un modelo de decisión multimodal de 0,59B de parámetros publicado por vllm-sr, el equipo detrás de vLLM Semantic Router. No es un modelo generativo: recibe una entrada (texto o JSON, opcionalmente acompañada de imágenes y vídeos) y un conjunto de preguntas tipificadas (elección entre opciones, sí/no o puntuación en una escala) y devuelve, en una sola llamada, una probabilidad para cada respuesta posible, sin generar texto libre. Se presenta como el modelo fundacional de 0,6B de la familia Decision 3.0 y está afinado a partir de Qwen/Qwen3.5-0.8B.

Su relevancia práctica está en el enrutamiento y la clasificación dentro de arquitecturas de agentes: sustituye llamadas a un LLM generativo por inferencias de baja latencia (6,7 ms para texto, 41,9 ms con imagen y 308,3 ms con un vídeo de 10 segundos en una AMD Instinct MI325X, una petición a la vez) manteniendo salidas calibradas como distribución de probabilidad. Según el autor, obtiene 28,82 en el conjunto público del Jev Decision Index 0.3, lo que supone +12,1 puntos sobre el modelo de 0,6B de Decision 2.0 (16,68).

El modelo incluye un codificador visual de aproximadamente 0,10B parámetros dentro del total, acepta varias imágenes y varios vídeos por petición, y se distribuye con licencia Apache-2.0. Requiere `trust_remote_code=True`, ya que incorpora código propio, y la versión de `transformers` declarada por el autor es la 5.17.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal derivado de Qwen/Qwen3.5-0.8B, con capas de atención lineal (se recomienda `flash-linear-attention` para kernels rápidos); detalles completos de la arquitectura no disponibles |
| Parametros totales | 594.321.600 (0,59B), de los cuales ~0,10B corresponden al codificador visual |
| Parametros activos | no disponible (no se indica que la arquitectura sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos sin cuantizar en safetensors; no hay GGUF ni AWQ/GPTQ en el repositorio) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería `transformers`, con `custom_code`) |

Otros datos de la ficha de HuggingFace: 33 descargas, 12 "likes", tamaño del repositorio 4,0 GB, `pipeline_tag` = `zero-shot-classification`, fecha de creación 2026-10-10 y última actualización 2026-10-11.

## Arquitectura y entrenamiento

d3-edge parte de Qwen/Qwen3.5-0.8B (etiqueta `qwen3_5` en el repositorio) y añade un codificador visual que eleva el total a 0,59B parámetros. El modelo funciona como un clasificador de decisión: cada pregunta definida por el usuario se resuelve en su propio *forward pass* sobre la entrada, y la salida es una probabilidad por cada opción en lugar de texto generado. La model card menciona explícitamente capas de atención lineal, para las que ofrece el paquete opcional `flash-linear-attention` con kernels rápidos en GPU, lo que sugiere una arquitectura híbrida entre atención completa y lineal; no se detalla la proporción ni la disposición de esas capas.

La entrada admite texto o JSON, con imágenes (PNG, JPEG, WebP) y vídeos (MP4, WebM, MOV, MKV) en varias unidades por petición. Las imágenes se colocan antes del texto y se leen a hasta 1,6 megapíxeles; los vídeos van después y se muestrean a 2 fotogramas por segundo, con un máximo de 32 fotogramas repartidos por todo el vídeo y hasta 0,2 megapíxeles por fotograma. Todas las preguntas de una misma petición ven la totalidad de las imágenes y vídeos adjuntos.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF, DPO u otras fases de alineamiento. Tampoco se detalla el procedimiento de destilación o ajuste que lleva de Qwen3.5-0.8B a un modelo de decisión con salidas probabilísticas.

## Capacidades

- Decisión por elección: selecciona una opción entre varias candidatas definidas por el usuario mediante un diccionario de criterios, devolviendo probabilidad por opción.
- Decisión binaria sí/no (`noul`): responde preguntas de verificación con una probabilidad asociada.
- Decisión por puntuación (`score`): puntúa la entrada sobre una escala de criterios ordenados (por ejemplo, rutina / pronto / hoy).
- Múltiples preguntas en una sola llamada: preguntas de tipo elección, sí/no y puntuación sobre la misma entrada se responden conjuntamente, cada una con su propia pasada hacia delante.
- Comprensión de imágenes: varias imágenes por petición, admitidas como rutas locales, URL HTTP(S), objetos PIL o data URLs en base64.
- Comprensión de vídeo: varios vídeos por petición, admitidos como rutas, URL, base64 o arrays de fotogramas, con muestreo a 2 fps.
- Salida estructurada: el resultado es un JSON con las respuestas y sus probabilidades, apto para consumo programático sin parseo de lenguaje natural.
- No genera texto: no hay capacidad de resumen, redacción ni diálogo; su función es exclusivamente clasificatoria y probabilística.
- Soporte de tool calling / function calling: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Integración declarada como pipeline de `transformers` bajo la tarea `decision`.

## Casos de uso

- Enrutamiento de peticiones en atención al cliente: el modelo clasifica un ticket en categorías como devoluciones, facturación o soporte técnico y devuelve la probabilidad de cada opción, lo que permite aplicar umbrales de confianza y derivar a revisión humana cuando la decisión no es clara, con latencias de milisegundos por petición.
- Triaje y priorización: combinando una pregunta de tipo elección (equipo responsable) con una pregunta de puntuación (urgencia: rutina, pronto, hoy) en la misma llamada, se obtiene la cola de trabajo priorizada sin coste adicional de inferencia.
- Verificación documental con imagen: dada una fotografía de un recibo, albarán o etiqueta, el modelo responde preguntas de sí/no del tipo "¿el recibo incluye el artículo?" y preguntas de elección sobre la forma de pago, leyendo hasta 1,6 megapíxeles por imagen.
- Control de calidad sobre vídeo industrial: con muestreo a 2 fps y hasta 32 fotogramas por clip, puede responder si un objeto se mueve en una dirección determinada o si cambia de color, útil en inspección automatizada de líneas de producción o en cámaras de pruebas.
- Enrutador semántico en arquitecturas de agentes: integrado en vLLM Semantic Router, decide qué modelo, herramienta o flujo debe atender una consulta antes de invocar un LLM generativo, reduciendo el coste al evitar llamadas innecesarias a modelos grandes.
- Moderación y clasificación de contenido a escala: al devolver probabilidades y no texto, permite fijar umbrales de decisión auditables y procesar grandes volúmenes de elementos con una huella de hardware mínima.
- Etiquetado y anotación de datasets: generación automática de etiquetas categóricas y puntuaciones ordinales sobre corpus de texto, imagen o vídeo, con la probabilidad asociada como medida de confianza.
- Extracción de requisitos y cumplimiento normativo: preguntas de tipo sí/no sobre contratos o formularios (por ejemplo, "¿el cliente tiene recibo?", "¿el importe supera el umbral?") para prefiltrar expedientes antes de una revisión manual.

## Benchmarks y rendimiento

Resultados publicados por el autor de la model card:

| Modelo | Jev Decision Index ↑ | Conjunto publico ↑ | Pruebas de misma habilidad ↑ | Tareas de dominio nuevo ↑ |
|---|---:|---:|---:|---:|
| d3-edge | 18,0 | 28,8 | 23,9 | 8,0 |
| Bekko System One v0 400M | 15,2 | 22,5 | no disponible (dato truncado en la informacion recibida) | no disponible |

Otros datos de evaluación declarados:

| Evaluacion | Resultado | Contexto |
|---|---:|---|
| Jev Decision Index 0.3, conjunto publico | 28,82 | Medido con el kit oficial 0.3 sobre los pesos publicados; 140.178 peticiones públicas respondidas, ninguna sin soporte |
| Mejora sobre Decision 2.0 (modelo de 0,6B) | +12,1 puntos | El modelo de 0,6B de Decision 2.0 obtiene 16,68; d3-edge va por delante en las cinco áreas evaluadas |
| Perception Test (video QA de elección múltiple) | 46,6 | Evaluación interna del autor |

Latencias declaradas en una única AMD Instinct MI325X, una petición a la vez: mediana de 6,7 ms para una petición de texto, 41,9 ms para una petición con imagen y 308,3 ms para una petición con un vídeo de 10 segundos.

No se han publicado en la información disponible resultados de benchmarks estándar de lenguaje (MMLU, GSM8K, HumanEval u otros), lo cual es coherente con que el modelo no sea generativo.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir de los 594M parámetros, no confirmado por el autor): en torno a 1,2 GB solo para pesos en fp16, aproximadamente 0,6 GB en int8 y 2,4 GB en fp32; hay que añadir el coste de activaciones, del codificador visual y de los fotogramas muestreados, por lo que un presupuesto práctico de 2-4 GB por instancia es razonable.
- GPU recomendadas: el autor reporta medidas en AMD Instinct MI325X. Para el resto de hardware no hay datos publicados; por tamaño, cualquier GPU con 4 GB o más de VRAM debería poder ejecutarlo en fp16.
- GPU de consumo: cabe holgadamente en tarjetas de consumo con 8 GB o más (RTX 3060, 4060, 4070, 4080, 4090, etc.), e incluso en configuraciones de 4-6 GB en cuantización a 8 bits, aunque no se publican pesos cuantizados.
- Opciones de despliegue: la vía soportada oficialmente es `transformers` con `AutoModel.from_pretrained(..., trust_remote_code=True)` y `transformers==5.17.0`, más `torch`, `torchvision`, `pillow`, `opencv-python-headless`, `safetensors` y `accelerate`; `flash-linear-attention` es opcional para acelerar las capas de atención lineal en GPU. El modelo expone una tarea propia `decision` en `transformers.pipeline`. El repositorio también incluye la etiqueta `endpoints_compatible`.
- Compatibilidad con otros motores: no hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI en la información disponible; al no existir pesos GGUF y requerir código propio, la integración con llama.cpp u Ollama no está garantizada.
- Latencia y throughput: las cifras publicadas son de una sola petición a la vez (6,7 ms texto, 41,9 ms imagen, 308,3 ms vídeo de 10 s) en MI325X; no se publican datos de throughput con procesamiento por lotes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| d3-edge | 0,59B (incluye 0,10B de vision) | no disponible | Modelo de decisión multimodal con salidas probabilísticas, texto + imagen + vídeo | Apache-2.0 | Pesos en safetensors en HuggingFace, requiere `trust_remote_code` |
| Decision 2.0 (modelo de 0,6B) | 0,6B | no disponible | Modelo de decisión de la generación anterior | no disponible | Referenciado por el autor; no se aporta enlace |
| Bekko System One v0 400M | 0,4B | no disponible | Modelo de decisión ("system one") | no disponible | Aparece como comparación en la tabla de evaluación del autor |
| Qwen/Qwen3.5-0.8B | ~0,8B | no disponible | LLM base generativo del que deriva d3-edge | no disponible | Pesos en HuggingFace |

No se dispone de datos suficientes sobre contextos, licencias ni rendimiento homogéneo de los tres comparadores como para establecer una comparación completa más allá de los resultados del Jev Decision Index recogidos en la sección anterior.

## Limitaciones y advertencias

- No es un modelo generativo: no redacta, no resume y no mantiene conversaciones. Cualquier expectativa de uso como chatbot o asistente de texto no se corresponde con su diseño.
- Salidas probabilísticas sujetas a calibración: las probabilidades deben validarse sobre el dominio de destino antes de fijar umbrales automáticos; una probabilidad alta no garantiza corrección.
- Riesgo de alucinación trasladado a la clasificación: al derivar de un LLM, puede asignar alta confianza a opciones incorrectas cuando la entrada es ambigua, especialmente si las opciones definidas por el usuario se solapan.
- Idiomas no declarados: la información disponible no especifica qué lenguas soporta, por lo que hay que verificar el comportamiento en castellano u otras lenguas antes de desplegarlo.
- Longitud de contexto no publicada: se desconoce el máximo de tokens de entrada, un dato crítico para flujos con documentos largos que no debe asumirse.
- Sin pesos cuantizados publicados: no hay GGUF, AWQ ni GPTQ, lo que limita el despliegue en entornos con restricciones de memoria y en ecosistemas como llama.cpp u Ollama.
- Requiere `trust_remote_code=True`: implica ejecutar código del autor del repositorio. Es un riesgo de cadena de suministro que debe evaluarse en entornos de producción, y obliga a auditar el código antes del despliegue.
- Dependencia de una versión concreta: la model card indica `transformers==5.17.0`; otras versiones pueden no ser compatibles con el código propio.
- Licencia Apache-2.0: permite uso comercial y modificación, pero conviene conservar el aviso de licencia y comprobar las condiciones del modelo base Qwen/Qwen3.5-0.8B, cuya licencia no se detalla en la información disponible.
- Métricas de evaluación mayoritariamente internas: el Jev Decision Index y el resultado de Perception Test proceden del propio autor, sin replicación independiente disponible.
- Repositorio de 4,0 GB para un modelo de 0,59B: el tamaño incluye recursos adicionales (imágenes y vídeo de ejemplo, entre otros), un aspecto a tener en cuenta al planificar descargas o despliegues con imágenes de contenedor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vllm-sr/d3-edge
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de vLLM Semantic Router: https://github.com/vllm-project/semantic-router
- Repositorio de vLLM: https://github.com/vllm-project/vllm
- Sitio oficial de vLLM: https://vllm.ai/
- Documentación de vLLM: https://docs.vllm.ai/en/latest/
- Entrada de vLLM en Wikipedia: https://en.m.wikipedia.org/wiki/VLLM
- No se han encontrado en la búsqueda web artículos, papers ni demos específicos de d3-edge.
