# tmthang86/Swift-1.5-Qwen3.8-27B-Uncensored-mlx-5bit

## Resumen

Swift-1.5-Qwen3.8-27B-Uncensored-mlx-5bit es una cuantización en formato MLX de 5 bits del modelo ajgazin/Swift-1.5-Qwen3.8-27B-Uncensored-MTP, que a su vez es una variante "uncensored" (abliterated) del fine-tune ukisai/Swift-1.5-Qwen3.8-27b, construido sobre la base Qwen3.8-27B de Alibaba Cloud. El modelo lo publica el usuario tmthang86 y su aportación se limita a la conversión de pesos a MLX mediante `mlx-lm` 0.32.2, sin modificar pesos ni plantilla de chat. Está pensado para ejecución local en Apple Silicon.

El modelo resuelve el problema de desplegar un LLM de aproximadamente 27.000 millones de parámetros en equipos con memoria unificada de gama alta (48 GB en el caso verificado por el autor), manteniendo el comportamiento de un modelo de razonamiento ("thinking model") con capacidad multilingüe. Su relevancia es acotada: se trata de una conversión de comunidad, sin descargas ni validación extensa, orientada a usuarios de MLX que necesiten un modelo sin filtros de rechazo para tareas creativas o de edición de texto.

La arquitectura subyacente es la de Qwen3.8-27B (transformer denso, según la nomenclatura del modelo base), con 26.895.993.856 parámetros reales según los safetensors del repositorio y un peso en disco de 18,5 GB tras la cuantización a 5,5 bits por peso. No se dispone de datos verificados sobre longitud de contexto, composición del dataset de entrenamiento ni resultados de benchmarks estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3.8-27B), con cabeza MTP (multi-token prediction) en el checkpoint de origen no validada en esta build |
| Parametros totales | 26.895.993.856 (26,9 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | MLX 5 bits uniforme (5,5 bits por peso); el repo solo distribuye esta cuantización |
| Idiomas soportados | Ingles y multilingue (segun tags del autor); validación práctica únicamente en vietnamita |
| Licencia | Swift Open License 1.0 (aportación Swift, UkisAI) + Apache 2.0 (base Qwen3.8-27B, Alibaba Cloud) |
| Formato de pesos | Safetensors en formato MLX (`mlx-lm`) |
| Tamano del repo | 18,5 GB |
| Libreria de inferencia | `mlx-lm` >= 0.32.2 |
| Modelo base | ajgazin/Swift-1.5-Qwen3.8-27B-Uncensored-MTP |

## Arquitectura y entrenamiento

La ficha del repositorio no documenta la arquitectura interna más allá de la etiqueta `qwen3_8` y la referencia a Qwen3.8-27B como base. Por la nomenclatura y el recuento de parámetros, se trata de un transformer denso de aproximadamente 27.000 millones de parámetros. El checkpoint de origen (ajgazin) incluye una cabeza de decodificación especulativa MTP (multi-token prediction), pero el autor de esta conversión indica explícitamente que esa cabeza no se ha probado en la build MLX, por lo que no debe asumirse su funcionamiento.

El proceso de "abliteration" que da lugar a la variante uncensored se aplica en el modelo de origen, no en esta conversión: aquí solo se ejecuta `mlx_lm.convert` con cuantización uniforme de 5 bits, sin cambios en pesos ni en la plantilla de chat. No hay información disponible sobre el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon RLHF, DPO u otras técnicas de alineamiento en las etapas previas de fine-tune. Tampoco se documenta ninguna innovación técnica adicional más allá de la mencionada cabeza MTP.

## Capacidades

- Generación de texto conversacional multi-turno mediante `mlx-lm`.
- Modo de razonamiento ("thinking model"): el autor advierte que hay que reservar espacio de tokens para el razonamiento antes de la respuesta.
- Comportamiento "uncensored"/abliterated: menor tendencia a rechazar peticiones, incluida la generación de contenido sensible.
- Capacidad multilingüe declarada en los tags, aunque la única validación práctica documentada es en vietnamita.
- Entrada de visión: presente en el checkpoint de origen, pero no probada en esta build según el autor.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de audio: no disponible.

## Casos de uso

- Edición y corrección de textos largos en local: el autor lo validó como corrector de continuidad en un capítulo de novela vietnamita con 10 errores sembrados, detectando un 40 % ± 17 sin falsos positivos, lo que lo hace apto para revisión asistida de manuscritos en un Mac de 48 GB.
- Escritura creativa sin restricciones de contenido: la variante abliterated reduce los rechazos en ficción con temáticas adultas, violencia o material sensible, un escenario donde los modelos alineados estándar suelen bloquear la generación.
- Procesamiento por lotes en Apple Silicon: al ejecutarse con `mlx-lm`, se puede integrar en scripts de Python para tareas de generación masiva (resúmenes, reescritura, clasificación) aprovechando la GPU unificada del Mac sin depender de CUDA.
- Asistencia de traducción y adaptación multilingüe: con capacidad declarada multilingüe, útil para traducción literaria o localización con revisión humana posterior, dado el riesgo de alucinación.
- Prototipado de aplicaciones de chat privadas: al ejecutarse íntegramente en local, es adecuado para entornos donde los datos no pueden salir del dispositivo (documentos médicos, legales o internos).
- Investigación sobre alineamiento y abliteration: sirve como punto de comparación frente al modelo base alineado para estudiar cómo cambia la distribución de respuestas tras eliminar la dirección de rechazo.
- Generación de contenido role-play o narrativa interactiva: el modo thinking permite mantener coherencia en tramas largas, aunque el coste de latencia (unos 9 minutos por llamada en la prueba del autor) limita su uso a tareas no interactivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato empírico aportado por el autor es una prueba cualitativa de corrección de errores en un capítulo de novela vietnamita: 40 % ± 17 de errores detectados sobre 10 errores sembrados, en 3 ejecuciones con errores y 1 limpia, sin falsos positivos ni respuestas vacías, con aproximadamente 9 minutos por llamada en un Mac Apple Silicon de 48 GB.

## Requisitos de hardware

- VRAM/memoria unificada estimada: unos 18,5 GB solo para los pesos en 5 bits; con caché KV y margen de contexto conviene disponer de 32-48 GB. El autor lo ejecutó en un Mac con 48 GB de memoria unificada.
- GPU recomendadas: Apple Silicon de gama alta (M1/M2/M3/M4 Pro, Max o Ultra) con al menos 32 GB de memoria unificada; 48 GB o más para contextos largos.
- Compatibilidad con GPU consumer NVIDIA: no directamente, ya que el formato es MLX; requeriría reconvertir los pesos a GGUF o safetensors estándar.
- Opciones de despliegue: `mlx-lm` >= 0.32.2 (único soportado oficialmente por el autor). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en este repositorio.
- Latencia y throughput: aproximadamente 9 minutos por llamada en la prueba del autor con `--max-tokens 3000` en un Mac de 48 GB; no se proporcionan tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Swift-1.5-Qwen3.8-27B-Uncensored-mlx-5bit (este) | 26,9 B | No disponible | MLX 5 bits | Swift Open License 1.0 + Apache 2.0 | MLX, Apple Silicon |
| ajgazin/Swift-1.5-Qwen3.8-27B-Uncensored-MTP (origen) | 26,9 B | No disponible | Sin cuantizar (formato original) | Swift Open License 1.0 + Apache 2.0 | Safetensors, multiplataforma |
| ukisai/Swift-1.5-Qwen3.8-27b (fine-tune original) | ~27 B | No disponible | Sin cuantizar | Swift Open License 1.0 | Safetensors |
| Qwen3.8-27B (base, Alibaba Cloud) | ~27 B | No disponible | Multiples | Apache 2.0 | Amplia |

La comparación se limita a la cadena de derivación del propio modelo; no se dispone de datos de rendimiento comparables con alternativas de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo "uncensored"/abliterated: no incorpora los filtros de rechazo del modelo base alineado, por lo que puede generar contenido sensible, ofensivo o inseguro sin advertencia; requiere moderación externa en producción.
- Riesgo elevado de alucinación: no hay benchmarks que cuantifiquen su fiabilidad factual, y la eliminación de la dirección de rechazo puede correlacionar con menor calibración.
- Validación empírica muy limitada: una sola prueba cualitativa en vietnamita, con una tasa de detección del 40 % ± 17 y sin datos de benchmarks estándar (MMLU, HumanEval, GSM8K).
- La cabeza MTP y la entrada de visión del checkpoint de origen no están probadas en esta build; no deben darse por funcionales.
- Longitud de contexto no documentada: no se puede planificar su uso en tareas de contexto largo sin verificación previa.
- Licencia restrictiva: Swift Open License 1.0 exige licencia comercial de UkisAI por encima del umbral de ingresos indicado en `LICENSE`; es imprescindible leerla antes de cualquier uso comercial.
- Build de comunidad sin respaldo: no está hecha ni avalada por UkisAI, con 0 descargas y 0 likes en el momento de la consulta.
- Dependencia de Apple Silicon: el formato MLX no es portable a CUDA sin reconversión.
- Idioma: aunque se declara multilingüe, la única evidencia práctica es en vietnamita; el rendimiento en castellano no está verificado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tmthang86/Swift-1.5-Qwen3.8-27B-Uncensored-mlx-5bit
- Modelo base (cuantizado desde): https://huggingface.co/ajgazin/Swift-1.5-Qwen3.8-27B-Uncensored-MTP
- Fine-tune original: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Libreria MLX-LM: https://github.com/ml-explore/mlx-lm
- Licencia del repositorio: `LICENSE`, `LICENSE-APACHE-2.0` y `NOTICE` incluidos en el propio repositorio de Hugging Face.
