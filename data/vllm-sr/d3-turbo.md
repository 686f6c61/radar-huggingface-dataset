# vllm-sr/d3-turbo

## Resumen

d3-turbo es un modelo de decisión multimodal de 26.090 millones de parámetros (incluido un encoder de visión de 0,46B) desarrollado por el equipo de vLLM Semantic Router. No es un modelo generativo: recibe una entrada —texto, JSON, y opcionalmente imágenes y vídeos— junto con una batería de preguntas y devuelve, sin generar texto, una probabilidad para cada respuesta posible. Los tipos de decisión soportados son elección entre opciones, sí/no, puntuación en escala, caja delimitadora sobre imagen o fotograma de vídeo, y seguimiento (track) a lo largo de un clip completo.

Se trata de la versión mejorada de d3 dentro de la familia Decision 3.0, publicada en HuggingFace en octubre de 2026 bajo licencia Apache-2.0. Su propuesta técnica es el "state once": lee la entrada una sola vez por petición y responde a todas las preguntas sobre ella, frente a d3-flash, que la relee para cada pregunta. Eso le permite pasar de 302 ms con una pregunta a 2,12 s con 255 sobre la misma imagen, mientras que d3-flash escala de 154 ms a 32,94 s (15,5 veces más lento en el extremo alto).

Es relevante porque cubre un hueco poco atendido: la clasificación y localización zero-shot de baja latencia dentro de pipelines de enrutamiento semántico y agentes, donde no hace falta generar lenguaje sino tomar decisiones calibradas con confianza explícita. El autor declara 70,2 en el Jev Decision Index de texto (+4,0 sobre d3) y 72,9 en la variante de visión (+1,7), si bien son estimaciones propias y no resultados de un leaderboard oficial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con capas de atención lineal (dependencia opcional `flash-linear-attention`), etiquetado como `qwen3_5` en metadatos; encoder de visión de 0,46B. El autor no detalla la arquitectura interna |
| Parámetros totales | 26.085.330.160 (26,09B), incluidos 0,46B del encoder de visión |
| Parámetros activos | No disponible (no se documenta como modelo MoE) |
| Longitud de contexto | 32.768 tokens por pregunta por defecto; hasta 131.072 tokens por pregunta con `long_context=True` |
| Tipos de cuantización | No disponible. Solo se publican pesos `safetensors`; el autor no documenta GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | No disponible (los metadatos de HuggingFace no declaran lista de idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | `safetensors` con código propio (`trust_remote_code=True`); repositorio de 104,4 GB; requiere `transformers==5.17.0` |

## Arquitectura y entrenamiento

El modelo se construye sobre una base etiquetada como `qwen3_5` y combina un tronco de lenguaje con capas de atención lineal —el autor ofrece `flash-linear-attention` como kernels opcionales de GPU para acelerarlas— y un encoder visual de 0,46B de parámetros. La interfaz no es la habitual de `generate()`: se invoca mediante `model.system_one(state=..., images=[...], questions={...})`, un método propio que acepta texto, JSON, rutas locales, URLs HTTP(S), objetos PIL o imágenes en base64, y devuelve un diccionario de probabilidades por pregunta. La lectura única de la entrada y la compartición del estado entre preguntas es la innovación central del modelo y la razón de su ventaja de escalado frente a d3-flash a partir de la cuarta pregunta.

No se han publicado en la información disponible datos sobre volumen de tokens de entrenamiento, composición del dataset, ni sobre si se aplicaron RLHF, DPO u otras técnicas de alineación. Tampoco se detalla el procedimiento de calibración de confianza, pese a que el modelo reporta AUROC de confianza de 0,96 en la tarea de cajas, lo que sugiere un trabajo específico de calibración no documentado. El modelo no genera texto, por lo que no cabe hablar de decodificación especulativa ni de estrategias de sampling.

## Capacidades

- Decisión por elección: elegir una opción entre varias etiquetas definidas por el usuario, con distribución de probabilidad sobre todas ellas.
- Decisión binaria sí/no sobre una instrucción en lenguaje natural (tipo `noul` en el ejemplo del quickstart).
- Puntuación en escala: asignar un valor numérico de una escala definida a una entrada.
- Detección de cajas: localizar un objeto descrito en texto dentro de una imagen, con una única caja y confianza calibrada (0,90 de accuracy a IoU 0,5 en el conjunto de prueba del autor).
- Seguimiento en vídeo: generar una caja en un instante concreto o una traza completa a 1 o 2 actualizaciones por segundo, con probabilidad de visibilidad del objetivo.
- Procesamiento por lotes de preguntas: entre 1 y 255 preguntas sobre la misma entrada en una sola pasada, incluyendo preguntas de distinto tipo mezcladas.
- Imágenes dentro de preguntas y opciones: una imagen puede formar parte del enunciado o de una opción concreta, y solo esa pregunta la ve (0,96 de accuracy en el conjunto de prueba del autor).
- Entrada JSON estructurada, además de texto plano.
- Sin tool calling ni function calling documentado; la interfaz es `system_one` con un esquema propio de preguntas.
- Sin modo "thinking", sin generación de texto, sin capacidades de audio.

## Casos de uso

- Enrutamiento de tickets en soporte: clasificar cada incidencia entrante en categorías como facturación o soporte técnico y decidir en la misma llamada si es urgente, aprovechando la lectura única del estado para responder varias preguntas con un solo coste de inferencia. El ejemplo del quickstart reproduce exactamente este escenario.
- Semantic router en producción: decidir si una consulta requiere recuperación, a qué colección de documentos dirigirla o qué modelo debe atenderla. Es el caso de uso nativo del proyecto vLLM Semantic Router y el que justifica la latencia de 302 ms con una sola pregunta.
- Detección de objetos zero-shot en inspección visual: lanzar varias preguntas de tipo caja sobre una misma foto de línea de producción (por ejemplo, presencia de precinto, posición de una pieza, ausencia de etiqueta) sin entrenar un detector específico, usando la confianza devuelta como umbral de rechazo.
- Analítica de vídeo y conteo de objetos: obtener una traza a 1 o 2 actualizaciones por segundo con probabilidad de presencia (F1 de 0,97 en los clips de prueba del autor) para tareas de seguimiento de mercancía, aforo o fauna.
- Evaluación automática de las salidas de otro LLM: usar decisiones de tipo score o sí/no como juez determinista y barato, sin generar texto adicional y con una probabilidad asociada a cada veredicto que permite umbralizar y auditar.
- Verificación visual por comparación: comprobar si la imagen de una opción coincide en categoría con la imagen de entrada (por ejemplo, validar que la foto de un albarán corresponde al producto declarado), gracias al soporte de imágenes dentro de opciones.
- Clasificación de documentos estructurados: pasar un JSON de un formulario o de una API como estado y resolver con varias preguntas simultáneas qué campos están completos, si hay incoherencias y qué severidad tienen.

## Benchmarks y rendimiento

| Métrica | d3-turbo | d3 | Nota |
|---|---|---|---|
| Jev Decision Index, texto | 70,2 | 66,3 | Estimación del autor, no resultado oficial de leaderboard |
| Suite pública, kit oficial 0.3 | 71,7 | 65,5 | Ventaja en las cinco áreas de la suite, según el autor |
| Jev Decision Index, visión | 72,9 | 71,3 | Estimación del autor, misma metodología |
| Cajas, accuracy a IoU 0,5 | 0,90 | No disponible | Conjunto de prueba propio; AUROC de confianza 0,96 |
| Seguimiento en vídeo, success AUC | 0,79 (1 act./s) / 0,80 (2 act./s) | No disponible | F1 de presencia 0,97 en los clips de prueba del autor |
| Preguntas con imágenes en enunciado u opciones | 0,96 | +0,31 respecto a d3 | Conjunto de prueba propio del autor |
| Latencia, 1 a 255 preguntas sobre una imagen | 302 ms – 2,12 s | No disponible (d3-flash: 154 ms – 32,94 s) | Una AMD Instinct MI325X, `AutoModel` |

No se han publicado resultados en benchmarks estándar de la industria (MMLU, HumanEval, GSM8K, MATH) en la información disponible. Todos los números anteriores proceden del autor, se calculan con su propio índice y sus propios conjuntos de prueba, y no han sido replicados de forma independiente.

## Requisitos de hardware

- Pesos en bf16/fp16: aproximadamente 52,2 GB para los 26,09B parámetros, más el coste del encoder visual ya incluido en esa cifra. El repositorio ocupa 104,4 GB, aproximadamente el doble, lo que apunta a checkpoints duplicados o material adicional no detallado.
- Configuración validada por el autor: una única AMD Instinct MI325X (192 GB de HBM3e), sirviendo incluso el modo `long_context=True` con 131.072 tokens por pregunta.
- GPU de 80 GB (A100 80GB, H100 80GB): los pesos en bf16 caben con unos 28 GB de margen para caché KV y activaciones; el autor no valida esta configuración y el coste de caché para 131.072 tokens no está documentado.
- GPU de 48 GB (L40S, RTX 6000 Ada): no caben los pesos en bf16 sin cuantización, y el autor no publica pesos cuantizados.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) en bf16. Repartir los 52,2 GB entre dos RTX 4090 requeriría soporte multi-GPU y cuantización que el autor no documenta, por lo que no es una vía recomendable en producción.
- Despliegue: la ruta documentada es `AutoModel.from_pretrained(..., trust_remote_code=True)` con `transformers==5.17.0`, `torch`, `torchvision`, `pillow`, `opencv-python-headless`, `safetensors` y `accelerate`, más `flash-linear-attention` como aceleración opcional de las capas de atención lineal.
- No hay documentación de soporte en vLLM, llama.cpp, Ollama ni TGI en la información proporcionada, a pesar de que el modelo pertenezca al proyecto vLLM Semantic Router y de la etiqueta `endpoints_compatible`.
- Throughput (peticiones por segundo) no disponible. Solo se publica latencia por petición con 1 a 255 preguntas sobre una entrada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Jev Decision Index (texto / visión) | Latencia con 255 preguntas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| d3-turbo | 26,09B (0,46B visión) | 32.768 por defecto; 131.072 con `long_context` | 70,2 / 72,9 | 2,12 s | Apache-2.0 | HuggingFace, Space y API gratuita |
| d3 | No disponible | No disponible | 66,3 / 71,3 | No disponible | No disponible | Mismo proyecto |
| d3-flash | No disponible | No disponible | No disponible | 32,94 s (15,5× más lento) | No disponible | Mismo proyecto |

No se han identificado en la información disponible modelos de decisión multimodales comparables fuera de la familia Decision 3.0. Como referencia funcional, la detección zero-shot clásica (Grounding DINO, OWLv2) cubre la localización en imagen pero no la decisión textual, binaria o por escala sobre el mismo estado, y los LLM multimodales de tamaño similar resuelven estas tareas generando texto, con mayor latencia y sin probabilidad calibrada por respuesta; no se dispone de cifras comparativas directas publicadas por el autor.

## Limitaciones y advertencias

- El modelo no genera texto. No sirve para resumen, redacción, diálogo generativo ni extracción de campos libres; solo devuelve probabilidades sobre preguntas predefinidas.
- Todos los benchmarks son del autor, calculados con su propio índice (Jev Decision Index) y sus propios conjuntos de prueba. No hay verificación independiente ni resultados en suites estándar como MMLU o HumanEval.
- Los conjuntos de evaluación de cajas, seguimiento y preguntas con imágenes son internos y no se publican, por lo que las cifras de 0,90, 0,79/0,80 y 0,96 no son reproducibles con los datos disponibles.
- La confianza está calibrada según el autor (AUROC 0,96 en cajas), pero cualquier umbral de decisión debe revalidarse en el dominio concreto de despliegue; una probabilidad alta fuera de distribución no garantiza corrección.
- El riesgo de alucinación de texto no aplica, pero sí el de clasificación errónea y localización imprecisa, que en un pipeline automatizado puede propagarse silenciosamente al no haber texto que auditar.
- No se declara lista de idiomas soportados. Toda la documentación y los ejemplos están en inglés, por lo que el rendimiento en castellano u otras lenguas no está garantizado ni medido.
- La licencia Apache-2.0 permite uso comercial, pero el modelo exige `trust_remote_code=True`, es decir, ejecutar código del repositorio dentro del proceso de inferencia: conviene revisar y fijar la revisión concreta antes de desplegarlo.
- Dependencia estricta de `transformers==5.17.0`; cambios de versión pueden romper el código propio del modelo.
- No se documentan sesgos demográficos, culturales o de dominio. No disponible.
- Adopción todavía baja en el momento de la ficha (300 descargas, 55 likes), con poca validación externa acumulada.
- El tamaño del repositorio (104,4 GB) impone un coste de almacenamiento y de transferencia considerable en cualquier pipeline de CI/CD o de despliegue en el borde.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vllm-sr/d3-turbo
- Space oficial: https://huggingface.co/spaces/vllm-sr/d3-turbo
- API gratuita de demostración: https://decision.vllm-sr.ai
- Repositorio del proyecto vLLM Semantic Router: https://github.com/vllm-project/semantic-router
- Repositorio de vLLM (motor de inferencia del ecosistema): https://github.com/vllm-project/vllm
- Documentación de vLLM: https://docs.vllm.ai/en/latest/
- Recetas de despliegue de vLLM: https://recipes.vllm.ai/
- Sitio de vLLM: https://vllm.ai/
