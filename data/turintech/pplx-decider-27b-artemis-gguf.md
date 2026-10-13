# turintech/pplx-decider-27B-Artemis-GGUF

## Resumen

pplx-decider-27B-Artemis-GGUF es una conversión y compresión a formato GGUF del modelo de decisión perplexity-ai/pplx-decider-v1.1-27b, publicada por TurinTech (turintech) mediante técnicas de optimización descubiertas por Artemis, su plataforma de optimización de código. No es un modelo generativo: recibe un estado (texto, JSON o imágenes) junto con un conjunto de preguntas tipadas y devuelve, en una sola pasada, una probabilidad para cada respuesta permitida. El modelo base fue desarrollado por Perplexity AI y está afinado a partir del backbone Qwen3.8-27B, con 26.895.998.464 parámetros (unos 26,9 mil millones) y una ventana de contexto de 262.144 tokens según fuentes de terceros.

La relevancia de esta ficha concreta está en la compresión: el original en BF16 ocupa 53,8 GB y exige 50,8 GiB de VRAM (una GPU de centro de datos de 80 GB), mientras que el fichero por defecto de TurinTech ocupa 15,28 GB (un 72% menos) y requiere 16,6 GiB, por lo que cabe en GPUs de 24 GB. Según las mediciones del autor sobre una NVIDIA A100, ese fichero coincide con el original en el 96,8% de 2.000 decisiones de test, mantiene la precisión (70,8% frente a 70,5%) y no altera ninguna respuesta de la que el original estuviera seguro por encima del 80%.

El repositorio incluye también un proyector de visión convertido desde los pesos originales, ya que Perplexity no publica uno para llama.cpp, lo que permite usar la capacidad multimodal (imágenes PNG, JPEG o WebP enviadas como data URLs) sobre llama.cpp estándar. Esta conversión es independiente y no está afiliada ni respaldada por Perplexity. El repositorio registra 0 descargas y 0 likes, y fue creado el 12 de octubre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only sobre backbone Qwen3.8-27B, afinado como modelo de decisión (no se especifica si es MoE; el tamaño en BF16 de 53,8 GB para 26,9 B de parámetros es coherente con un modelo denso) |
| Parametros totales | 26.895.998.464 (aprox. 26,9 B) |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens según fuentes de terceros; el repositorio no lo confirma y recomienda lanzar llama.cpp con `-c 16384` |
| Tipos de cuantizacion | GGUF propietario de Artemis en dos ficheros: 15,28 GB (por defecto) y 14,27 GB; proyector multimodal `mmproj` en BF16 y Q8_0 (0,63 GB) |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo original) |

## Arquitectura y entrenamiento

El modelo base, pplx-decider-v1.1-27b, es una actualización de pplx-decider-v1-27b que eleva la puntuación del Decision Index de 56,4 a 61,56, superando a Jev por más de 3,5 puntos, manteniendo el mismo backbone. La mayor parte de la mejora proviene, según Perplexity, de eliminar la máscara causal y de entrenar con más datos, incluyendo datos del dataset tasksource. No es un modelo de generación de texto: responde con probabilidades por respuesta candidata en una única pasada, admitiendo hasta 128 preguntas con nombre por petición y tres tipos de pregunta (noul para sí/no, choice con hasta 255 opciones y score con hasta 10 niveles).

Esta versión de TurinTech no reentrena el modelo: convierte los pesos originales a GGUF y los cuantiza con técnicas propias de Artemis para llama.cpp. Los ficheros resultantes no son cuantizaciones estándar de llama-quantize (el autor los compara contra sus propias referencias Q8_0 y Q4_K_M), y el funcionamiento se ha validado con llama.cpp a partir del 9 de octubre de 2026 (probado en el commit `1e6f04a` y en la release `b11572`, con respuestas idénticas en una comprobación de 100 decisiones). Para la parte de visión se incluye un proyector `mmproj` convertido desde los pesos originales, en BF16 y en Q8_0.

## Capacidades

- Decisión y clasificación con salida probabilística: devuelve una probabilidad por cada respuesta permitida en lugar de generar texto.
- Tres tipos de pregunta: `noul` (sí/no), `choice` (selección entre hasta 255 opciones) y `score` (puntuación en hasta 10 niveles).
- Hasta 128 preguntas con nombre por petición, resueltas en una sola pasada sobre el mismo estado de entrada.
- Entrada multimodal: texto, JSON e imágenes en data URL (PNG, JPEG, WebP) mediante el proyector de visión incluido.
- Ejecución sobre llama.cpp estándar sin compilaciones ni servidores personalizados, a través del endpoint `/v1/systemone`.
- Capacidad de enrutado de consultas, clasificación de intención y verificación en pipelines, según la descripción del modelo base.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo no genera texto ni cadenas de razonamiento.
- Capacidades multilingües: no disponible (no se declaran idiomas soportados).
- Modo "thinking": no disponible.

## Casos de uso

- Triaje de urgencia en soporte técnico: enviando el texto del ticket como estado y una pregunta `noul` del tipo "¿expresa urgencia este mensaje?", se obtiene una probabilidad que permite ordenar la cola de atención sin generar texto (es el ejemplo que acompaña al modelo con un fallo de integración de Stripe).
- Enrutado de consultas en buscadores y asistentes: con preguntas de tipo `choice` de hasta 255 opciones se puede clasificar la intención de una consulta y derivarla al índice o al agente correspondiente en una única llamada.
- Moderación y verificación de contenido: varias preguntas tipadas por petición (por ejemplo, categoría de política incumplida y gravedad) permiten obtener varias etiquetas probabilísticas sobre el mismo texto en una sola pasada.
- Puntuación de riesgo o prioridad: el tipo `score` con hasta 10 niveles sirve para asignar puntuaciones graduadas (riesgo de impago, calidad de un lead, prioridad de incidencia) manteniendo la interpretabilidad de la probabilidad por nivel.
- Extracción y validación sobre documentos con imágenes: al aceptar imágenes en data URL y hasta 128 preguntas, permite comprobar campos y condiciones directamente sobre capturas, formularios escaneados o interfaces, sin OCR intermedio.
- Despliegue on-premise en GPU de 24 GB: con 16,6 GiB medidos en A100, el fichero por defecto permite servir decisión y visión en una RTX 4090 o similar, útil en entornos con requisitos de residencia de datos.
- Selección de proveedor o comparación de candidatos en pipelines de compras: preguntas de tipo `choice` sobre ofertas normalizadas devuelven la probabilidad de cada opción admisible en una sola inferencia.
- Evaluación de políticas automatizadas: las probabilidades por respuesta permiten fijar umbrales de abstención y derivar a revisión humana, algo que un modelo puramente generativo no ofrece de forma directa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K) en la información disponible. Los datos publicados son métricas de decisión y de fidelidad de la cuantización frente al original BF16:

Ficheros GGUF de TurinTech frente al original:

| Fichero | Tamano | Reduccion vs. original | Misma respuesta que el original | Cambio de precision | Respuestas seguras (>80%) alteradas |
|---|---|---|---|---|---|
| Original BF16 (perplexity-ai/pplx-decider-v1.1-27b) | 53,8 GB | referencia | referencia | referencia | referencia |
| `pplx-decider-27B-Artemis-15.3GB.gguf` | 15,28 GB | 72% | 96,8% de 2.000 decisiones | +0,3 puntos | 0 |
| `pplx-decider-27B-Artemis-14.3GB.gguf` | 14,27 GB | 73% | 96,2% de 2.000 decisiones | +0,7 puntos | 0 |

Cuantizaciones estándar de referencia (creadas por TurinTech con `llama-quantize` sobre el original):

| Fichero | Tamano | Misma respuesta que el original |
|---|---|---|
| Q8_0 estándar | 28,6 GB | 99,2% |
| Q4_K_M estándar | 16,55 GB | 95,7% |

Otras metricas comunicadas:

| Metrica | Valor |
|---|---|
| Decision Index de pplx-decider-v1-27b | 56,4 |
| Decision Index de pplx-decider-v1.1-27b | 61,56 (más de 3,5 puntos por encima de Jev) |
| Precision del fichero de 15,3 GB en 2.000 decisiones de test | 70,8% (original: 70,5%) |
| Preguntas de imagen evaluadas | 330 (proyector BF16) |
| Fidelidad del proyector Q8_0 frente al BF16 | 98,8% de las preguntas de imagen |
| Comparación en benchmark entre Q4_K_M estándar y el fichero de TurinTech | 98,0% frente a 96,0% |

## Requisitos de hardware

- VRAM para inferencia: 16,6 GiB para el fichero por defecto de 15,28 GB y 15,9 GiB para el de 14,27 GB (mediciones sobre NVIDIA A100).
- GPU recomendadas: A100 para las mediciones oficiales; RTX 5090 probada (con 1 de 2.000 cambios de respuesta frente al original, según el autor); RTX 4090 u otras GPU de 24 GB como objetivo del fichero por defecto.
- Encaje en GPU de consumo: sí, el fichero por defecto cabe en 24 GB. El de 14,27 GB requiere 15,9 GiB, lo que el autor califica de muy ajustado para una GPU de 16 GB y no fue probado en una.
- Despliegue: llama.cpp, concretamente `llama-server`, con versión del 9 de octubre de 2026 o posterior (probado en el commit `1e6f04a` y en la release `b11572`). No requiere servidor ni compilación propios.
- Parámetros de lanzamiento obligatorios: `-ub 4096 -b 4096`, ya que con el valor por defecto de 512 el endpoint `/v1/systemone` rechaza entradas de más de 512 tokens; `-c 16384` evita reservar memoria para la ventana completa de entrenamiento. Para imágenes hay que cargar el `mmproj` con `--mmproj` y subir el lote a `-ub 8192 -b 8192`, porque varias imágenes grandes pueden superar los 4.096 tokens.
- Otros motores: no disponibles. El autor indica que ningún otro GGUF público de este modelo funciona en llama.cpp estándar (el Q5_K_M y el Q8_0 de Livesport usan su propio runtime y no cargan en `llama-server`). No se menciona compatibilidad con vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en decisiones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pplx-decider-27B-Artemis 15,3 GB (esta ficha) | 26,9 B | 262.144 tokens según terceros | 96,8% de coincidencia con el original; precisión 70,8% | apache-2.0 | GGUF para llama.cpp, 15,28 GB y 14,27 GB, más proyectores BF16 y Q8_0 |
| perplexity-ai/pplx-decider-v1.1-27b (original BF16) | 26,9 B | 262.144 tokens según terceros | Referencia; Decision Index 61,56 | No detallada en la información disponible | Safetensors, 53,8 GB, 50,8 GiB de VRAM |
| Q8_0 estándar del mismo modelo | 26,9 B | Igual que el original | 99,2% de coincidencia; 28,6 GB | apache-2.0 | GGUF generado con `llama-quantize` |
| Q4_K_M estándar del mismo modelo | 26,9 B | Igual que el original | 95,7% de coincidencia; 16,55 GB; 98,0% en la muestra de benchmark | apache-2.0 | GGUF generado con `llama-quantize` |
| Livesport Q5_K_M y Q8_0 | 26,9 B | No disponible | No disponible | No disponible | Requiere runtime propio; no carga en llama.cpp estándar |
| Jev (modelo de decisión competidor citado por Perplexity) | No disponible | No disponible | Decision Index inferior en más de 3,5 puntos a pplx-decider-v1.1-27b | No disponible | No disponible |

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre ni razonamiento encadenado, solo probabilidades por respuesta permitida. No sirve para tareas de generación, resumen o chat convencional.
- La ventana de contexto de 262.144 tokens procede de fuentes de terceros y no está confirmada en el repositorio de TurinTech; en llama.cpp la configuración recomendada limita a `-c 16384`.
- Idiomas soportados: no declarados. No hay garantía documentada de comportamiento multilingüe.
- Riesgo de alucinación: no evaluado en la información disponible. Al tratarse de clasificación probabilística, el riesgo se traslada a calibración de umbrales y a respuestas con probabilidad baja que deben derivarse a revisión humana.
- El endpoint de inferencia es `/v1/systemone`, específico de llama.cpp para este modelo; no es compatible con la API de chat estándar ni, según el autor, con otras cuantizaciones públicas del mismo modelo.
- Con `-b` y `-ub` en su valor por defecto (512), el servidor rechaza entradas de más de 512 tokens: es un error de configuración frecuente en producción. Con imágenes, el lote debe subirse a 8192.
- El fichero de 14,27 GB exige 15,9 GiB y el autor advierte de que es muy ajustado en una GPU de 16 GB, sin haberlo probado en una: riesgo de fallo de asignación de memoria.
- Sesgos conocidos: no disponibles. Al ser un ajuste fino del backbone Qwen3.8-27B sobre datos de decisión, hereda los sesgos del modelo base, no documentados aquí.
- Licencia de la conversión: apache-2.0 según la ficha de HuggingFace. La licencia del modelo original no se detalla en la información proporcionada, por lo que conviene verificarla antes de un uso comercial.
- Esta conversión es independiente y no está afiliada ni respaldada por Perplexity. El repositorio no registra descargas ni likes, y la validación se limita a los conjuntos internos del autor (2.000 decisiones tipadas, una muestra de benchmark, casos held-out y 330 preguntas de imagen).
- En la RTX 5090 el autor reporta 1 de 2.000 casos con respuesta distinta a la del original BF16 (0 en la A100): la coincidencia exacta con el original no está garantizada al cambiar de hardware.

## Enlaces

- Repositorio GGUF: https://huggingface.co/turintech/pplx-decider-27B-Artemis-GGUF
- Modelo base: https://huggingface.co/perplexity-ai/pplx-decider-v1.1-27b
- Versión anterior del modelo base: https://huggingface.co/perplexity-ai/pplx-decider-v1-27b
- TurinTech: https://www.turintech.ai/
- Reserva de demo de TurinTech: https://www.turintech.ai/book-a-demo
- Dataset de decisiones tipadas usado en la evaluación: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Ficha de referencia del modelo (VRAM y especificaciones): https://apxml.com/models/pplx-decider-v1-27b
- Ficha de referencia del modelo (contexto y multimodalidad): https://www.llmreference.com/model/pplx-decider-v1-27b
- Proyector de visión BF16: https://huggingface.co/turintech/pplx-decider-27B-Artemis-GGUF/blob/main/mmproj-pplx-decider-27B-BF16.gguf
- Fichero GGUF por defecto: https://huggingface.co/turintech/pplx-decider-27B-Artemis-GGUF/blob/main/pplx-decider-27B-Artemis-15.3GB.gguf
