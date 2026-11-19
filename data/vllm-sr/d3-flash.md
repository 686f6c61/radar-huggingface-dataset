# vllm-sr/d3-flash

## Resumen

d3-flash es un modelo fundacional de decisión multimodal de 8,39 mil millones de parámetros desarrollado por vllm-sr, el equipo detrás de vLLM Semantic Router. A diferencia de los modelos generativos convencionales, d3-flash no produce texto: recibe una entrada (texto o JSON, opcionalmente acompañada de imágenes y vídeos) junto con una batería de preguntas y devuelve, en una sola llamada, una probabilidad para cada respuesta posible. Admite tres tipos de decisión: elección entre opciones, sí/no y puntuación en una escala.

El modelo se presenta como la versión 9B de Decision 3.0 y parte de un ajuste fino sobre Qwen/Qwen3.5-9B, del que hereda una arquitectura transformer con capas de atención lineal. Incorpora un codificador visual de 0,46B parámetros que le permite procesar varias imágenes y vídeos por petición, leyendo estos últimos a 2 fotogramas por segundo. Su propósito es actuar como capa de enrutamiento y clasificación de baja latencia dentro de pipelines de agentes y sistemas de enrutamiento semántico.

Su relevancia actual radica en la combinación de tres factores: un rendimiento declarado de 55,8 en el índice Jev Decision 0.3.2 (primero entre modelos de tamaño similar), una latencia mediana de 19,2 ms para peticiones de solo texto en una GPU AMD Instinct MI325X y una licencia Apache-2.0 que permite uso comercial sin restricciones. Todo ello con más de 100.000 descargas en Hugging Face desde su publicación en octubre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.5-9B) con capas de atención lineal y codificador visual de 0,46B |
| Parametros totales | 8.392.695.024 (8,39B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; soporte de cuantización vía herramientas externas) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (tamaño del repo: 16,8 GB) |

## Arquitectura y entrenamiento

d3-flash es un ajuste fino de Qwen/Qwen3.5-9B, un transformer de 9B parámetros que incorpora capas de atención lineal (el autor recomienda instalar `flash-linear-attention` para obtener kernels rápidos en GPU). Sobre esa base se añade un codificador visual de 0,46B parámetros que habilita la entrada de imágenes (PNG, JPEG, WebP) y vídeos (MP4, WebM, MOV, MKV), con soporte para múltiples elementos multimedia por petición. El modelo se ejecuta con `trust_remote_code=True`, lo que implica código de modelado personalizado.

La innovación central no es arquitectónica sino de interfaz: en lugar de generar texto token a token, el modelo realiza una pasada forward por cada pregunta y devuelve directamente una distribución de probabilidad sobre las opciones definidas. Esto elimina la latencia de decodificación autoregresiva y permite responder varias preguntas (de tipos distintos) sobre la misma entrada en una única llamada. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Clasificación zero-shot con opciones arbitrarias definidas en tiempo de inferencia (tipo "choice").
- Preguntas de sí/no con probabilidad asociada (tipo "noul").
- Puntuación en escala ordinal con criterios definidos por el usuario (tipo "score").
- Procesamiento de múltiples imágenes por petición, desde rutas locales, URLs, objetos PIL o data URLs base64.
- Procesamiento de múltiples vídeos por petición a 2 fotogramas por segundo, desde rutas, URLs, base64 o arrays de fotogramas.
- Respuesta conjunta de varias preguntas de distinto tipo sobre la misma entrada en una sola llamada.
- Salida de probabilidades calibradas por opción, sin generación de texto.
- Integración con vLLM Semantic Router para despliegue de alto rendimiento.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el texto del ticket y devuelve la probabilidad de que corresponda a cada equipo (devoluciones, facturación, técnico) en una sola llamada de 19,2 ms, lo que permite clasificar miles de tickets por segundo en un solo acelerador.
- Verificación documental con imagen: dado un justificante o recibo adjunto y una pregunta de sí/no ("¿figura el producto en el recibo?"), el modelo responde con probabilidad en unos 166 ms, adecuado para validación automática en flujos de garantías o reembolsos.
- Moderación y control de calidad de vídeo: análisis de clips cortos a 2 fps para decidir si una acción ocurre, su dirección o si hay un cambio visual, con una latencia de 371 ms para un vídeo de 10 segundos; útil en inspección automatizada o verificación de contenido.
- Clasificación de intención en agentes conversacionales: antes de invocar un LLM generativo, d3-flash decide la intención y la urgencia del mensaje, reduciendo el coste y la latencia del pipeline al reservar el modelo grande solo para los casos que lo requieren.
- Filtrado previo en pipelines RAG: puntuación de relevancia de documentos o fragmentos respecto a una consulta mediante preguntas de tipo score, con salida probabilística que permite fijar umbrales ajustables.
- Evaluación automática de respuestas: dado un par pregunta-respuesta y criterios de calidad, el modelo asigna una puntuación ordinal, lo que facilita la evaluación a escala de sistemas generativos sin depender de un juez generativo.
- Enrutamiento semántico en producción: integrado en vLLM Semantic Router, alcanza 95 peticiones por segundo con p99 inferior a 1 segundo en una MI325X, lo que lo hace viable como primera capa de decisión de un sistema multi-modelo.

## Benchmarks y rendimiento

| Benchmark | d3-flash | Referencia |
|---|---|---|
| Jev Decision Index 0.3.2 (texto, tablero oficial) | 55,8 | Decision 2.0 (9B): 48,2 |
| Suite pública (kit oficial 0.3) | 57,79 | Decision 2.0: +11,0 respecto a su predecesor |
| Perception Test (video QA, opción múltiple) | 73,3 | Evaluación interna |
| Latencia mediana, texto | 19,2 ms | MI325X, AutoModel, una petición a la vez |
| Latencia mediana, imagen | 166 ms | MI325X, AutoModel |
| Latencia mediana, vídeo de 10 s | 371 ms | MI325X, AutoModel |
| Throughput con vLLM Semantic Router | 95 req/s, p99 < 1 s | MI325X, 1,8× AutoModel |

El modelo responde las 140.178 peticiones públicas de la suite oficial sin errores de soporte, según declara el autor.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; con 8,39B parámetros en safetensors (16,8 GB en fp16), se requiere al menos ~17 GB en precisión completa, y aproximadamente 5-6 GB en cuantización de 4 bits mediante herramientas externas.
- GPU recomendadas: AMD Instinct MI325X (referencia de las mediciones del autor); por tamaño, también cabría en A100 40/80 GB, H100 y L40S.
- GPU de consumo: previsiblemente viable en RTX 4090 (24 GB) en fp16 y en GPUs de 12-16 GB con cuantización, aunque el autor no publica mediciones en estas tarjetas.
- Despliegue: `AutoModel` de Transformers (con `trust_remote_code=True`), vLLM Semantic Router y, presumiblemente, vLLM estándar; no se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: 19,2 ms (texto), 166 ms (imagen), 371 ms (vídeo de 10 s) por petición en MI325X con AutoModel; 95 req/s con p99 < 1 s mediante vLLM Semantic Router (1,8× el rendimiento de AutoModel).
- Requiere Transformers 5.17.0 o superior, torch, torchvision, pillow, opencv-python-headless, safetensors y accelerate; `flash-linear-attention` es opcional para kernels rápidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| d3-flash | 8,39B | No disponible | Decisión multimodal (texto, imagen, vídeo) | Apache-2.0 | Hugging Face, Space oficial |
| Decision 2.0 (9B) | ~9B | No disponible | Decisión (predecesor) | No disponible | vllm-sr |
| Qwen3.5-9B (base) | ~9B | No disponible | Generación de texto multimodal | No disponible | Hugging Face |

No se dispone de información sobre otros modelos de decisión comparables de terceros. La comparación más directa es con su predecesor Decision 2.0, sobre el que mejora 7,6 puntos en el índice oficial y 11,0 en la suite pública, y con el modelo base Qwen3.5-9B, del que se diferencia por la interfaz de decisión probabilística y el codificador visual añadido.

## Limitaciones y advertencias

- El modelo no genera texto: solo devuelve probabilidades sobre opciones predefinidas; no sirve para tareas generativas, resumen o diálogo abierto.
- No se han publicado datos sobre sesgos, composición del dataset de entrenamiento ni evaluación en idiomas distintos del inglés; la ficha no declara idiomas soportados.
- Riesgo de calibración deficiente de las probabilidades fuera de las distribuciones de las suites evaluadas; conviene validar umbrales en el dominio propio antes de producción.
- La longitud de contexto no está documentada, lo que dificulta planificar entradas largas (tickets extensos, transcripciones o vídeos de larga duración).
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; debe auditarse en entornos con requisitos de seguridad estrictos.
- Las mediciones de latencia y throughput proceden de una única GPU AMD Instinct MI325X y pueden no trasladarse a otros aceleradores.
- El soporte de vídeo se limita a 2 fps, insuficiente para analizar acciones rápidas o detalles de movimiento fino.
- Aunque la licencia Apache-2.0 permite uso comercial, el modelo base Qwen3.5-9B puede tener condiciones propias que conviene revisar antes de redistribuir.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vllm-sr/d3-flash
- Space oficial Decision 3.0: https://huggingface.co/spaces/vllm-sr/Decision-3.0
- Demo gratuita: https://decision.vllm-sr.ai
- Repositorio vLLM Semantic Router: https://github.com/vllm-project/semantic-router
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
