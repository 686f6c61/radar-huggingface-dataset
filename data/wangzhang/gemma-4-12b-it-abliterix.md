# wangzhang/gemma-4-12B-it-abliterix

## Resumen

`wangzhang/gemma-4-12B-it-abliterix` es una versión modificada del modelo `google/gemma-4-12B-it` de Google DeepMind, en la que se ha eliminado el comportamiento de rechazo de solicitudes (refusal) mediante una técnica de ablación direccional, sin ningún tipo de fine-tuning ni datos nuevos. El autor, wangzhang, utiliza la herramienta `abliterix` para proyectar ortogonalmente una única "dirección de rechazo" fuera de las proyecciones `attn.o_proj` y `mlp.down_proj` de todas las capas del decoder, preservando al máximo el comportamiento original del modelo mediante una transformación que conserva la norma de los pesos.

El modelo resultante mantiene las capacidades del Gemma-4-12B-it original (un transformer decoder-only de aproximadamente 12 000 millones de parámetros) pero responde a prompts que el modelo base rechazaría. Según la model card, la tasa de rechazo se reduce de 99/100 a 26/100 en un conjunto de 100 prompts dañinos evaluados con un juez LLM, con una divergencia KL de primer token de 0,0735 respecto al base en prompts benignos. Está pensado exclusivamente para investigación de seguridad, red-teaming y evaluación de alineación, y el propio autor advierte de que se han eliminado los guardarraíles de seguridad.

La relevancia de este modelo radica en que demuestra una técnica reproducible y cuantificable de ablación direccional aplicada a una arquitectura moderna como Gemma-4, y ofrece una alternativa más agresiva que las abliteraciones tradicionales (como la de Heretic) en términos de reducción de rechazos, con un coste de perturbación medible mediante KL. Se distribuye bajo licencia Apache-2.0 y es compatible con las principales herramientas de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en `google/gemma-4-12B-it`) |
| Parametros totales | 11 959 730 224 (~12B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (repo en BF16, 24,0 GB) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo base, `google/gemma-4-12B-it`, es un transformer decoder-only con una arquitectura que, según la model card, incluye normalización RMSNorm 4 veces por capa y embeddings por capa (Per-Layer-Embedding). Esta versión abliterada no ha sido entrenada con nuevos datos: se ha aplicado una ablación direccional en modo `direct` (edición de pesos), necesaria porque la arquitectura de Gemma-4 neutraliza las técnicas basadas en LoRA o hooks.

El método concreto, implementado con `abliterix` v1.8.0, consiste en calcular una dirección de rechazo por capa mediante la diferencia de medias entre 800 prompts dañinos y 800 benignos. Sobre esa dirección se aplica una ablación proyectada (projected abliteration): solo se elimina la componente ortogonal a la dirección benigna, preservando la señal útil. Además, se aplica una edición que conserva la norma de cada fila de pesos mediante una aproximación SVD de rango 3. Los objetivos son únicamente `attn.o_proj` y `mlp.down_proj`, con un perfil de peso lineal en forma de tienda de campaña por capa. Se realizó una búsqueda de 120 ensayos con Optuna TPE sobre un frente de Pareto bidimensional (rechazos vs. KL), y se seleccionó el punto de la rodilla del frente (trial 39) con 26/100 rechazos y KL 0,074. El proceso es totalmente determinista bajo la semilla global `20260622`.

## Capacidades

- Generación de texto conversacional: mantiene las capacidades del modelo base Gemma-4-12B-it para diálogo multi-turno y completado de texto.
- Respuesta a solicitudes que el modelo base rechaza: es la capacidad principal y diferenciadora; el modelo responde a prompts dañinos, poco éticos o peligrosos que el original se negaría a contestar.
- Conservación de la utilidad en prompts benignos: la divergencia KL de primer token respecto al base es de 0,0735, lo que indica una perturbación moderada y un comportamiento cercano al original en tareas normales.
- Compatibilidad con herramientas de inferencia estándar: al ser un merge completo en BF16, funciona con `transformers`, vLLM, SGLang y TGI sin adaptaciones.
- Reproducibilidad: la configuración exacta de abliterix se incluye en el repositorio (`abliterix_config.toml`), junto con la semilla y los parámetros del trial 39, lo que permite auditar o reproducir la edición.
- No se dispone de información sobre soporte de tool calling, agentes, razonamiento multi-paso, visión o audio en esta versión; el tag `image-text-to-text` del modelo base sugiere posible multimodalidad, pero no está confirmado para esta variante.

## Casos de uso

- Investigación en seguridad de IA: el modelo permite estudiar cómo se comporta un LLM sin guardarraíles de seguridad, analizando qué tipos de solicitudes dañinas sigue rechazando (26/100) y cuáles acepta, lo que ayuda a entender los límites de los mecanismos de rechazo.
- Red-teaming de sistemas de moderación: se puede utilizar para generar contenido adversario y evaluar la robustez de filtros de contenido o sistemas de clasificación de prompts dañinos, comparando las respuestas con las del modelo base.
- Evaluación de técnicas de alineación: al ser una ablación direccional reproducible, sirve como caso de estudio para medir el equilibrio entre eliminación de rechazos y preservación de capacidades (mediante KL), y para comparar metodologías como la de Heretic.
- Análisis de mecanismos internos de rechazo: los parámetros de steering publicados (capas pico, pesos máximos y mínimos) permiten investigar qué capas y proyecciones son más relevantes para el comportamiento de rechazo en arquitecturas tipo Gemma-4.
- Benchmarking de herramientas de inferencia: al ser un modelo de 12B en BF16, se puede usar para medir rendimiento (latencia, throughput) en vLLM, SGLang o TGI en diferentes configuraciones de hardware.
- Pruebas de robustez de aplicaciones conversacionales: en entornos controlados, se puede evaluar cómo responde un asistente sin restricciones ante entradas ambiguas o malintencionadas, para diseñar mejores capas de seguridad externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card solo reporta métricas específicas de la ablación, medidas con un juez LLM (`google/gemini-3.1-flash-lite`) sobre 100 prompts dañinos y 100 benignos:

| Metrica | Base `gemma-4-12B-it` | Este modelo |
|---|---|---|
| Rechazos (juez LLM, 100 prompts dañinos) | 99 / 100 | 26 / 100 |
| Reduccion de rechazos | — | −73,7 puntos porcentuales |
| KL de primer token vs. base (benignos) | 0,0000 | 0,0735 |

Comparacion con la abliteracion de referencia (Heretic), evaluada en las mismas condiciones:

| Modelo | Rechazos (juez LLM, 100 prompts dañinos) |
|---|---|
| Base `gemma-4-12B-it` | 99 / 100 |
| `zaakirio/gemma-4-12b-it-uncensored` (Heretic) | 51 / 100 |
| Este modelo (abliterix) | 26 / 100 |

El blog de Nathan Sapwell (enlace en la seccion de enlaces) analiza 12 variantes de abliteracion de Gemma 4 12B, pero no se dispone de los datos numericos completos en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 24,0 GB en BF16, por lo que se necesitan al menos 24 GB de VRAM para cargar el modelo completo sin cuantizacion. Con cuantizacion de 8 bits se reduciria a ~12 GB, y con 4 bits a ~6 GB, aunque no se han publicado pesos cuantizados oficiales.
- GPU recomendadas: para BF16 completo, una GPU con 24 GB o mas, como NVIDIA A100 (40/80 GB), RTX 4090 (24 GB) o RTX 3090 (24 GB). Para cuantizacion, una RTX 3080 (10-12 GB) o RTX 4070 (12 GB) podrian ser suficientes.
- Compatibilidad con GPU de consumo: si, con cuantizacion o con BF16 en GPUs de 24 GB como la RTX 4090.
- Opciones de despliegue: `transformers` (con `device_map="auto"`), vLLM, SGLang, TGI, y cualquier herramienta que cargue modelos en formato safetensors. Tambien es compatible con endpoints de inferencia como FriendliAI, segun los resultados de busqueda.
- Latencia y throughput: no se han publicado mediciones especificas para este modelo. Como referencia, un modelo de 12B en BF16 en una A100 suele alcanzar decenas de tokens por segundo, pero depende de la configuracion y el backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazos (100 prompts dañinos) | KL vs. base | Licencia |
|---|---|---|---|---|---|
| `google/gemma-4-12B-it` (base) | ~12B | No disponible | 99 / 100 | 0,0000 | Gemma Terms of Use |
| `zaakirio/gemma-4-12b-it-uncensored` (Heretic) | ~12B | No disponible | 51 / 100 | No disponible | Apache-2.0 |
| `wangzhang/gemma-4-12B-it-abliterix` (este modelo) | ~12B | No disponible | 26 / 100 | 0,0735 | Apache-2.0 |

La comparativa se limita a las metricas de rechazo y KL publicadas en la model card, ya que no hay datos de rendimiento general. El modelo abliterix reduce los rechazos a aproximadamente la mitad de los que mantiene la variante Heretic bajo el mismo juez LLM, a costa de una perturbacion medible (KL 0,0735). No se dispone de informacion sobre la longitud de contexto de ninguna de las variantes.

## Limitaciones y advertencias

- Guardarrailes de seguridad eliminados: el modelo responde a solicitudes dañinas, poco eticas o peligrosas. Su uso conlleva responsabilidad legal y etica; el autor advierte explicitamente de que el usuario es el unico responsable de cumplir la ley y los Terminos de Uso de Gemma.
- Riesgo de alucinacion: al ser una variante del modelo base sin entrenamiento adicional, mantiene los riesgos de alucinacion tipicos de los LLM, posiblemente agravados por la perturbacion introducida por la ablacion (KL 0,0735).
- Sesgos conocidos: no se ha publicado informacion sobre sesgos especificos de esta variante. El modelo base puede heredar sesgos de sus datos de entrenamiento, y la ablacion no los corrige.
- Limitaciones de contexto e idiomas: no se dispone de datos sobre la longitud de contexto soportada ni sobre los idiomas cubiertos. Se recomienda verificar estos parametros antes de usar el modelo en produccion.
- Restricciones de licencia: aunque el modelo se distribuye bajo Apache-2.0, el modelo base `google/gemma-4-12B-it` esta sujeto a los Terminos de Uso de Gemma de Google, que pueden imponer restricciones adicionales para uso comercial o en determinados sectores.
- Adecuacion para produccion: no es recomendable su uso en aplicaciones orientadas al usuario final sin una capa externa de moderacion y filtrado, dado que su proposito es la investigacion y la evaluacion, no el despliegue productivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wangzhang/gemma-4-12B-it-abliterix
- Repositorio de abliterix: https://github.com/wuwangzhang1216/abliterix
- Blog sobre projected abliteration (grimjim): https://huggingface.co/blog/grimjim/projected-abliteration
- Analisis de 12 variantes de abliteracion de Gemma 4 12B: https://nathan.sapwell.net/posts/gemma4-12b-abliteration/
- Pagina oficial de Gemma 4 (Google DeepMind): https://deepmind.google/models/gemma/gemma-4/
- Modelo base en Hugging Face: https://huggingface.co/google/gemma-4-12B-it
- Variante Heretic de referencia: https://huggingface.co/zaakirio/gemma-4-12b-it-uncensored
