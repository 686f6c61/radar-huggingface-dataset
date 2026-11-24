# vllm-sr/d3.1-nano

## Resumen

d3.1-nano es un modelo de decisión multimodal de 2,21 mil millones de parámetros desarrollado por el equipo de vLLM Semantic Router (organización `vllm-sr`), como parte de la familia Decision 3.0. No es un modelo generativo al uso: recibe un estado de entrada (texto o JSON, opcionalmente acompañado de imágenes y vídeos) junto con un conjunto de preguntas tipificadas (elección entre opciones, sí/no o puntuación en una escala) y devuelve directamente una probabilidad para cada respuesta posible, sin generar texto. Está construido sobre el modelo base Qwen/Qwen3.5-2B mediante ajuste fino.

El modelo está pensado para enrutamiento semántico y clasificación de peticiones dentro de infraestructuras de enrutadores de modelos, es decir, para decidir qué componente, equipo o política debe atender una solicitud. Su interés técnico radica en combinar tres modalidades de pregunta en una sola llamada, con visión y vídeo integrados (codificador visual de 0,33B parámetros), y en ofrecer una API estable (`system_one`) que permite sustituir el modelo anterior d3-nano cambiando únicamente el nombre del modelo.

La relevancia actual viene de su enfoque "system one": respuestas rápidas y deterministas con probabilidades calibradas en lugar de generación autoregresiva, lo que lo hace adecuado para capas de decisión de baja latencia en pipelines de agentes y sistemas de enrutamiento. La licencia es Apache-2.0 y el repositorio ocupa 4,4 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con capas de atención lineal (linear-attention), basado en Qwen3.5-2B; incluye codificador visual |
| Parametros totales | 2.213.241.664 (2,21B), de los cuales 0,33B corresponden al codificador visual |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se detallan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (avisos de terceros en NOTICE) |
| Formato de pesos | safetensors (librería transformers, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-2B, un transformer al que se ha aplicado ajuste fino para convertirlo en un modelo de decisión. La model card menciona explícitamente capas de atención lineal (linear-attention) para las que se ofrecen kernels GPU rápidos mediante el paquete opcional `flash-linear-attention`, lo que sugiere una arquitectura híbrida con atención lineal además de atención estándar. Incorpora un codificador visual de 0,33B parámetros que procesa imágenes (hasta 1,6 megapíxeles por imagen) y vídeo (2 fotogramas por segundo, con un máximo de 32 fotogramas por vídeo, cada uno de hasta 0,2 megapíxeles).

No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. La innovación destacable es el paradigma de decisión: en lugar de generar texto, el modelo realiza una pasada forward por cada pregunta sobre el mismo estado de entrada y emite una probabilidad por opción, soportando tres tipos de pregunta (choice, noul —sí/no— y score) en una única llamada. La evaluación se realiza con el "Jev Decision Index 0.3" sobre un conjunto público de 140.178 peticiones.

## Capacidades

- Clasificación zero-shot con opciones definidas por el usuario (tipo `choice`), devolviendo probabilidad por cada opción.
- Preguntas booleanas sí/no (tipo `noul`) con probabilidad asociada.
- Puntuación en escala ordinal (tipo `score`) sobre criterios definidos por el usuario.
- Procesamiento de múltiples preguntas en una sola llamada, cada una con su propia pasada forward sobre el mismo input.
- Entrada multimodal: texto o JSON, más múltiples imágenes por petición (PNG, JPEG, WebP; rutas, URLs, PIL o base64).
- Entrada de vídeo: múltiples vídeos por petición (MP4, WebM, MOV, MKV; rutas, URLs, base64 o arrays de fotogramas), leídos a 2 fps.
- Salida estructurada con probabilidades calibradas por respuesta, sin generación de texto.
- Integración con vLLM Semantic Router en modo Engine mediante la API System One.
- Compatibilidad de API con d3-nano (misma función `system_one`, mismo pipeline y opciones de runtime).
- Soporte de `transformers.pipeline("decision", ...)`.

## Casos de uso

- Enrutamiento de peticiones en sistemas multi-modelo: dado un prompt de usuario, decidir con una llamada qué modelo, agente o política debe atenderlo, usando preguntas de tipo `choice` sobre categorías de tarea y `score` sobre complejidad.
- Triaje de tickets de soporte: clasificar la solicitud en equipos (devoluciones, facturación, técnico) y estimar urgencia en una sola pasada, como muestra el ejemplo de la model card.
- Verificación documental con visión: comprobar si un recibo adjunto contiene un producto concreto o si una imagen respalda una reclamación, combinando preguntas booleanas y de elección sobre la misma imagen.
- Moderación y control de calidad: evaluar contenido de texto o vídeo con preguntas sí/no y escalas de severidad, aprovechando la lectura de vídeo a 2 fps para clips cortos.
- Clasificación de intención en asistentes conversacionales: determinar la intención del turno actual y decidir si requiere escalado humano, sin coste de generación.
- Enrutamiento en pipelines RAG: decidir si una consulta requiere recuperación externa, qué índice consultar y con qué prioridad, mediante preguntas booleanas y de elección encadenadas.
- Análisis de vídeo de cámaras de prueba o vigilancia ligera: responder preguntas de dirección de movimiento o cambios de color sobre clips cortos, útil en prototipos de inspección visual.

## Benchmarks y rendimiento

| Benchmark | d3.1-nano | d3-nano |
|---|---|---|
| Jev Decision Index 0.3 (suite pública) | 62,96 | 42,2 |
| Diferencia global | +20,8 | — |
| Área de retrieval | no disponible (mejora de +14,0 frente a d3-nano) | — |
| Área de arts | no disponible (mejora de +32,0 frente a d3-nano) | — |

La puntuación se midió con el kit oficial sobre los pesos publicados, cubriendo las 140.178 peticiones públicas sin peticiones no soportadas. La puntuación oficial del board está pendiente en el momento de la publicación. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 2,21B parámetros en safetensors (4,4 GB de repo), la inferencia en fp16 requiere del orden de 4,5-5 GB solo para pesos, más overhead de activaciones y del codificador visual.
- GPU recomendadas: no especificadas en la información disponible; por tamaño, cabría en GPUs de consumo con 8 GB o más en fp16, y en 4-6 GB con cuantización de 8 bits si se generan pesos cuantizados (no publicados).
- Cabe en GPU de consumo: previsiblemente sí (RTX 3060 12 GB, RTX 4070, RTX 4090), aunque el fabricante no lo confirma.
- Opciones de despliegue: `transformers` (>= 5.17.0 según quickstart), `transformers.pipeline("decision")`, y vLLM Semantic Router en modo Engine. No se mencionan llama.cpp, Ollama ni TGI.
- Aceleración opcional: `flash-linear-attention` para kernels GPU de las capas de atención lineal.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| d3.1-nano | 2,21B (0,33B visión) | no disponible | Decisión multimodal (texto, imagen, vídeo) | Apache-2.0 | Hugging Face |
| d3-nano | no disponible | no disponible | Decisión (predecesor) | no disponible | Hugging Face |
| Qwen/Qwen3.5-2B | ~2B | no disponible | Generativo multimodal (base) | no disponible | Hugging Face |

No se dispone de datos de benchmarks comparables con modelos de decisión alternativos en la información proporcionada, por lo que la comparativa se limita a parámetros, licencia y tipo de tarea.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre ni respuestas abiertas; solo probabilidades sobre opciones predefinidas.
- El número de opciones por pregunta y la formulación de los criterios condicionan la calidad de la decisión; no se documentan límites máximos.
- Riesgo de calibración deficiente de probabilidades fuera de la distribución de entrenamiento; no se publican métricas de calibración.
- Sesgos conocidos: no documentados en la información disponible.
- Idiomas soportados: no especificados; no se garantiza un rendimiento multilingüe más allá del comportamiento del modelo base.
- Longitud de contexto: no especificada, lo que dificulta planificar entradas largas.
- Límites multimodales: imágenes a 1,6 MP como máximo; vídeo a 2 fps con un tope de 32 fotogramas por vídeo, lo que limita clips largos o de alta dinámica.
- Requiere `trust_remote_code=True`, con la implicación de seguridad que ello conlleva al ejecutar código del repositorio.
- La puntuación del board oficial del Jev Decision Index está pendiente; las cifras publicadas proceden del kit propio del autor.
- Licencia Apache-2.0 permite uso comercial, pero deben respetarse los avisos de terceros recogidos en NOTICE.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vllm-sr/d3.1-nano
- Resultados del Jev Decision Index: https://huggingface.co/datasets/vllm-sr/d3.1-nano-decision-index
- vLLM Semantic Router (repositorio): https://github.com/vllm-project/semantic-router
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
