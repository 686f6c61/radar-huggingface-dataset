# tensor-ai-inc/d3-flash-NVFP4

## Resumen

d3-flash-NVFP4 es una versión cuantizada a NVFP4 de vllm-sr/d3-flash, el modelo de la familia Decision 3.0 desarrollado por el equipo de vLLM Semantic Router. No es un modelo generativo de propósito general al uso: está diseñado para emitir decisiones estructuradas sobre una entrada (estado, texto, imagen o vídeo) mediante preguntas tipadas —elección entre criterios, sí/no/desconocido y puntuaciones—, lo que la model card denomina System One API. La cuantización la firma tensor-ai-inc con NVIDIA TensorRT Model Optimizer 0.47.0 y su objetivo declarado es ejecutar en GPUs Blackwell, que procesan FP4 de forma nativa.

El modelo base se describe como un modelo de 8,4B de la familia Decision 3.0 con arquitectura híbrida (capas de atención lineal junto a capas de atención completa), codificador de visión y un módulo de lectura de decisión separado. El recuento real de parámetros en los safetensors del repo es de 5.741.894.896 (≈5,74B), una cifra que no coincide con los 8,4B citados en la model card; la discrepancia no se explica en la documentación disponible y probablemente refleje componentes no incluidos en ese recuento (codificador de visión, cabecera de decisión) o una convención de conteo distinta.

La relevancia de esta ficha es doble: por un lado, documenta un caso real de cuantización FP4 selectiva (solo MLP y atención completa, dejando en precisión original atención lineal, embeddings, visión y readout); por otro, es un ejemplo de modelo empaquetado para un runtime concreto (vLLM nightly) con soporte de ``custom_code``, lo que condiciona fuertemente su despliegue. El autor reporta una pérdida de 2,89 puntos en el Decision Index público (57,36 → 54,47) manteniendo el 97,1% de respuestas idénticas al original, con un 45% de reducción de peso.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con capas de atención lineal y de atención completa, codificador de visión y readout de decisión; tag de arquitectura `qwen3_5` en el repo |
| Parámetros totales | 5.741.894.896 según safetensors (≈5,74B); la model card del autor indica 8,4B para el modelo base |
| Parámetros activos | No aplica: no se documenta como modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantización | NVFP4 (valores FP4, escalas FP8 por cada 16 valores, una escala FP32 por tensor), generado con NVIDIA TensorRT Model Optimizer 0.47.0; solo MLP y capas de atención completa cuantizadas |
| Idiomas soportados | No disponible (el repo no declara etiquetas de idioma) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con `custom_code` (requiere el paquete de runtime original del modelo base) |
| Tamaño del repo | 9,2 GB (frente a 16,8 GB del modelo original, −45%) |
| Pipeline declarado | `zero-shot-classification` |
| Revisión del modelo base | `13dc1cc8ef23caefa765907e1d764751e5629f7d` |

## Arquitectura y entrenamiento

La arquitectura del modelo base combina capas de atención lineal con capas de atención completa, un esquema híbrido habitual para reducir el coste del contexto largo sin renunciar a la recuperación exacta en determinadas capas. Incluye además un codificador de visión (la model card menciona que las preguntas pueden formularse sobre texto, imágenes y vídeo) y un módulo específico de lectura de decisión que produce la salida estructurada. El proceso de cuantización respeta esa heterogeneidad: solo se convierten a NVFP4 las capas MLP y de atención completa, mientras que atención lineal, embeddings, codificador de visión y readout de decisión permanecen en su precisión original; por eso la reducción de tamaño (45%) es menor que la teórica de un esquema de 4 bits aplicado a todos los pesos.

No se detallan en la información disponible los datos de preentrenamiento del modelo base (número de tokens, composición del corpus, uso de RLHF/DPO). Lo que sí se documenta es el proceso de calibración de la cuantización: 256 prompts de UltraChat con preguntas genéricas de elección, sí/no y puntuación, sin muestras procedentes de benchmarks. Las métricas publicadas se obtuvieron con la parte pública del Decision Index 0.3 sobre una muestra estratificada fija de 1.000 peticiones, evaluadas con los scorers del propio kit y con la suite construida a partir de las fuentes del repositorio, no con la copia oficial; el autor advierte explícitamente que son números válidos para comparar filas de su tabla, no puntuaciones de leaderboard. Ambas variantes se ejecutaron en una única H100 con el mismo código; dado que Hopper no tiene hardware FP4, los resultados de la versión NVFP4 provienen del FP4 simulado de Model Optimizer, que redondea pesos y activaciones igual que el modelo exportado en Blackwell. No se han medido velocidades en Blackwell.

## Capacidades

- Clasificación zero-shot mediante preguntas tipadas: el endpoint `/v1/systemone` acepta un `state` (la situación de entrada) y un diccionario de `questions`, cada una con un tipo (`choice` con criterios, `noul` para sí/no/desconocido, `score` para puntuación).
- Enrutamiento y triaje: asignación de una entrada a una categoría definida por el usuario con descripciones por criterio (por ejemplo, `returns` frente a `billing`).
- Verificación booleana de condiciones sobre el estado (por ejemplo, "¿el cliente tiene recibo?").
- Puntuación numérica de atributos o calidad sobre la entrada.
- Entrada multimodal: la model card del modelo original indica que las preguntas pueden formularse sobre texto, imágenes y vídeo; este repo reutiliza ese runtime sin cambios.
- Salida estructurada y determinista por diseño, orientada a integrarse en pipelines de decisión en lugar de generar texto libre.
- Integración con vLLM Semantic Router (familia Decision 3.0).
- No se documentan en la información disponible capacidades de tool calling genérico, razonamiento multi-paso tipo agente ni modo "thinking" explícito.

## Casos de uso

- Enrutamiento de tickets de soporte: enviar el texto del ticket como `state` y definir una pregunta `choice` con criterios por equipo (devoluciones, facturación, envíos). El modelo devuelve la categoría y evita construir un clasificador supervisado propio; el ejemplo de la model card con el pedido dañado es exactamente este escenario.
- Verificación de requisitos previos en flujos de atención al cliente: preguntas `noul` del tipo "¿el cliente aporta número de pedido?", "¿la solicitud está dentro del plazo de devolución?" para decidir si se activa un proceso automático o se escala a un humano.
- Filtrado de recuperación en RAG: usar el modelo como guardián que decide, por cada documento recuperado, si es relevante para la consulta antes de pasarlo al modelo generador, reduciendo coste y alucinaciones en la respuesta final.
- Moderación y política de contenido: preguntas de elección múltiple contra una taxonomía de políticas internas, con umbrales de puntuación para los casos dudosos.
- Triaje de documentos con imagen: al conservar el codificador de visión en precisión original, puede recibir capturas, formularios escaneados o fotos de producto y responder preguntas sobre ellos (por ejemplo, si la imagen muestra daños en el embalaje).
- Orquestación de agentes y routers semánticos: integrarlo como primer nivel de decisión en un sistema con varios modelos especializados, seleccionando a qué modelo o herramienta derivar cada petición según criterios declarados.
- Evaluación de calidad de respuestas generadas: usar preguntas de tipo `score` para puntuar salidas de otro modelo dentro de un pipeline de control de calidad offline.

## Benchmarks y rendimiento

Los únicos datos publicados son los del Decision Index 0.3 (parte pública), sobre una muestra estratificada de 1.000 peticiones y con la suite reconstruida por el autor a partir de las fuentes del repositorio. No son puntuaciones de leaderboard.

| Modelo | Decision Index (público) | Mismo resultado que el original | Pesos |
|---|---|---|---|
| vllm-sr/d3-flash (original) | 57,36 | — | 16,8 GB |
| tensor-ai-inc/d3-flash-NVFP4 | 54,47 | 97,1% | 9,2 GB |
| Jev by TypeSafe (vía Vercel AI Gateway, referencia) | 54,69 | — | No disponible |

Notas: "mismo resultado" mide la coincidencia de elección entre ambos modelos pregunta a pregunta en toda la muestra. Jev no pudo responder 7 de las 1.000 peticiones y el kit las contabiliza como fallo. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar en la información disponible, ni mediciones de latencia o throughput en Blackwell.

## Requisitos de hardware

- VRAM estimada para los pesos: ≈9,2 GB en NVFP4. Con caché KV, codificador de visión y overhead del runtime, conviene reservar del orden de 12-16 GB para contextos moderados (estimación, no medida publicada).
- GPU con soporte FP4 nativo: Blackwell (B200, GB200, RTX 5090, RTX 5080 y familia). En estas tarjetas los pesos se ejecutan en FP4 real.
- En Hopper (H100) y anteriores el modelo puede ejecutarse, pero el FP4 se simula: los benchmarks del autor se obtuvieron así y no hay mediciones de velocidad. No se debe esperar ninguna ventaja de rendimiento por la cuantización en esa generación.
- Cabe en GPU de consumo Blackwell: la RTX 5090 (32 GB) y la RTX 5080 (16 GB) tienen margen para los pesos; en 16 GB el espacio para caché KV es ajustado y depende de la longitud de contexto, que no está documentada.
- Despliegue: exclusivamente vLLM con build nightly (`pip install -U vllm --extra-index-url https://wheels.vllm.ai/nightly`), ya que el soporte de Decision 3.0 está en la rama main. El repo usa `custom_code`, por lo que necesita el paquete de runtime del modelo original.
- No hay versión GGUF ni soporte conocido en llama.cpp, Ollama o TGI; NVFP4 no es un formato consumible por esas herramientas.
- Latencia y throughput: no disponibles. El autor declara explícitamente que no ha medido velocidad en Blackwell.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| tensor-ai-inc/d3-flash-NVFP4 | ≈5,74B (safetensors) / 8,4B declarados | No disponible | Apache-2.0 | safetensors NVFP4, vLLM nightly | 9,2 GB, 54,47 en Decision Index público |
| vllm-sr/d3-flash (original) | 8,4B declarados | No disponible | Apache-2.0 | Pesos sin cuantizar (16,8 GB), mismo runtime | 57,36 en Decision Index público; referencia de calidad |
| Jev by TypeSafe (vía Vercel AI Gateway) | No disponible | No disponible | No disponible | Servicio gestionado | 54,69 en Decision Index público; 7/1.000 fallos en la muestra |
| Modelos de clasificación zero-shot tipo BART-MNLI / DeBERTa-NLI | Típicamente 0,1-0,4B | 512-1.024 tokens | MIT / Apache-2.0 en su mayoría | safetensors, ampliamente soportados | Mucho más pequeños y desplegables en CPU, pero sin multimodalidad, sin elección entre criterios arbitrarios ni contexto largo documentado |

La comparación relevante es interna a la familia: esta versión sacrifica 2,89 puntos de Decision Index frente al original a cambio de un 45% menos de peso y de la posibilidad de ejecutar en FP4 nativo en Blackwell. Frente a clasificadores NLI clásicos, el modelo es uno o dos órdenes de magnitud mayor y exige GPU, pero ofrece un espacio de preguntas configurable y entrada multimodal que esos modelos no cubren.

## Limitaciones y advertencias

- Pérdida de calidad medible: −2,89 puntos en el Decision Index público respecto al original (57,36 → 54,47) y un 2,9% de respuestas distintas. En decisiones sensibles conviene validar con el modelo sin cuantizar.
- Los benchmarks son autoinformados, con una suite reconstruida por el autor, una muestra de 1.000 peticiones y FP4 simulado en H100. No son comparables con puntuaciones oficiales de leaderboard ni han sido verificados por terceros.
- No hay ninguna medición de rendimiento real en Blackwell: se desconoce la ganancia de velocidad o latencia frente al modelo original.
- Dependencia fuerte del runtime: requiere vLLM nightly y `custom_code`. Un cambio en la rama main o en el paquete de runtime puede romper la inferencia; no es apto para entornos con versiones fijadas y estables.
- Sin soporte en llama.cpp, Ollama o TGI, y sin variante GGUF: el despliegue en CPU o en GPUs sin FP4 nativo queda fuera de lo razonable.
- Idiomas no declarados: no hay garantía documentada de comportamiento multilingüe, a pesar de que el Decision Index incluye pruebas de lenguaje. El modelo base se publica bajo `region:us`.
- Contexto máximo no documentado en la información disponible; planificar el dimensionado de caché KV a ciegas es arriesgado.
- Riesgo de alucinación en la formulación de la decisión: al ser un modelo de elección, puede seleccionar un criterio incorrecto si las descripciones de las opciones son ambiguas o solapadas. El diseño de los criterios es parte crítica del sistema.
- Sesgos: no se publica ninguna evaluación de sesgo, toxicidad o equidad. Los sesgos del corpus de calibración (UltraChat) y del preentrenamiento del modelo base se heredan sin análisis.
- Licencia Apache-2.0 permite uso comercial, pero al ser una versión modificada de vllm-sr/d3-flash se deben conservar los ficheros LICENSE y NOTICE del proyecto original.
- Modelo recién publicado, con 0 descargas y 0 likes en el momento de la ficha: sin evidencia de uso en producción ni informes independientes.
- Los resultados de búsqueda web disponibles no contienen información relevante sobre este modelo (se refieren a Tensor.Art, Tensor.trade y al concepto matemático de tensor), por lo que no aportan validación externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tensor-ai-inc/d3-flash-NVFP4
- Modelo base: https://huggingface.co/vllm-sr/d3-flash
- Decision Index (repositorio de evaluación): https://github.com/apolinario/decision-index
- Dataset de calibración UltraChat: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Wheels nightly de vLLM: https://wheels.vllm.ai/nightly
