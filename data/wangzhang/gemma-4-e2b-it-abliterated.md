# wangzhang/gemma-4-E2B-it-abliterated

## Resumen

El modelo `wangzhang/gemma-4-E2B-it-abliterated` es una versión modificada del modelo multimodal `google/gemma-4-E2B-it` de Google, perteneciente a la familia Gemma 4. El autor, wangzhang, ha aplicado una técnica de edición directa de pesos (direct weight editing) mediante la herramienta Abliterix para eliminar los mecanismos de rechazo de contenido del modelo original, dando lugar a una variante "sin censura" (uncensored). El modelo base, E2B (Effective 2B), es el miembro más pequeño de la familia Gemma 4 con aproximadamente 5,1 mil millones de parámetros reales, y soporta entrada multimodal de texto, visión y audio.

La relevancia de este modelo radica en que la arquitectura de Gemma 4, con su doble normalización (double-norm) y sus Per-Layer Embeddings (PLE), ha demostrado ser especialmente resistente a los métodos de abliteration basados en LoRA o en hooks. Este release demuestra que la edición directa de los pesos base, preservando las magnitudes de las filas, consigue sortear esa resistencia con una divergencia KL mínima respecto al modelo original. El resultado es un modelo que mantiene las capacidades del base pero con una tasa de rechazo drásticamente reducida, pasando de 99/100 rechazos a 9/100 en el conjunto de evaluación del autor.

La licencia es Apache-2.0, lo que permite uso comercial y modificación, aunque el contenido que puede generar plantea consideraciones éticas y legales importantes. El modelo está disponible en formato safetensors y ha sido publicado en Hugging Face con 597 descargas y 6 likes en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto, visión y audio) con doble normalización (double-norm) y Per-Layer Embeddings (PLE) |
| Parametros totales | 5.104.297.539 (~5,1 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (repo en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | Inglés y chino (según la evaluación del autor; no hay especificación oficial) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base `google/gemma-4-E2B-it` es un transformer multimodal de la familia Gemma 4. Su decodificador aplica cuatro operaciones RMSNorm por capa (entrada, post-atención, pre-feedforward y post-feedforward) y enruta las Per-Layer Embeddings a través de un canal paralelo de "reparación". Estas dos características combinadas re-normalizan cualquier perturbación de bajo rango, lo que hace que los métodos convencionales de abliteration (LoRA, hooks) no produzcan ningún cambio de comportamiento en esta familia.

El proceso de abliteration aplicado por wangzhang utiliza edición directa de los pesos base, con las siguientes técnicas clave:

- Proyección ortogonal directa de la dirección de rechazo fuera de las proyecciones de atención Q/K/V/O y de la proyección `down_proj` del MLP, en 5 componentes steerables y 27 capas efectivas.
- Restauración de la magnitud de las filas tras la proyección, preservando la norma, algo crítico para el pathway de doble normalización.
- Precisión float32 en la proyección para evitar la pérdida de señal en productos internos de alta dimensión (bf16 degrada silenciosamente la proyección).
- Vectores de dirección Winsorizados (percentil 99,5) para suprimir la influencia de activaciones atípicas.
- Búsqueda multi-objetivo con Optuna TPE sobre 100 trials, co-minimizando la divergencia KL y la tasa de rechazo.
- Restricción de las capas objetivo a las capas intermedias del decodificador (capas 5-30 de 35), ya que las capas tempranas con KV compartido (`num_kv_shared_layers=20`) propagan las ediciones a toda la pila.

El entrenamiento del modelo base fue realizado por Google, pero no se dispone de detalles sobre su dataset o proceso de entrenamiento en la información proporcionada.

## Capacidades

- Generación de texto multimodal: el modelo acepta entradas de texto, imagen y audio, y genera texto como respuesta.
- Razonamiento y generación de contenido sin rechazos: la principal capacidad diferencial es la eliminación de los mecanismos de rechazo de seguridad del modelo base, permitiendo respuestas detalladas a peticiones que el modelo original rechazaría.
- Multilingüe: la evaluación del autor cubre inglés y chino, con resultados de cumplimiento del 100% en ambos idiomas en el conjunto de prompts clásicos.
- Edición directa de pesos: el modelo demuestra que es posible modificar el comportamiento de seguridad de arquitecturas resistentes como Gemma 4 mediante técnicas de proyección ortogonal.
- No se menciona soporte explícito de tool calling, function calling, ni capacidades de agente en la información disponible.
- No se especifica un modo de "thinking" o razonamiento extendido.

## Casos de uso

- Investigación en seguridad y alineación de modelos: el modelo sirve como banco de pruebas para estudiar los efectos de la abliteration en arquitecturas con doble normalización, y para comparar metodologías de evaluación de rechazos (el propio autor documenta discrepancias de hasta 20× entre metodologías).
- Análisis de contenido sensible en entornos controlados: organizaciones de investigación pueden emplear el modelo para generar respuestas a peticiones delicadas (por ejemplo, en estudios de ciberseguridad o psicología) sin que el modelo se niegue a cooperar, siempre bajo supervisión humana.
- Desarrollo de asistentes conversacionales sin filtros: para aplicaciones donde se requiere que el modelo aborde cualquier tema sin evasivas, como en plataformas de rol o narrativa interactiva, siempre que el contenido generado cumpla con la legislación aplicable.
- Evaluación de robustez de sistemas de moderación: el modelo puede utilizarse para generar contenido problemático de forma controlada y así probar la eficacia de clasificadores de contenido o sistemas de filtrado en producción.
- Generación de contenido creativo con temáticas controvertidas: escritores y creadores pueden explorar narrativas que los modelos alineados rechazarían, como ficción con violencia explícita o temas tabú, en contextos artísticos.
- Estudio de la "delayed refusal": el modelo exhibe un patrón de rechazo diferido (primero genera 50-100 tokens de contexto útil y luego rechaza), lo que lo convierte en un objeto de estudio para entender los mecanismos de seguridad en modelos generativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor proporciona únicamente métricas de evaluación del proceso de abliteration:

| Metrica | Valor |
|---|---|
| Rechazos (conjunto de evaluación, 100 prompts) | 9/100 |
| Divergencia KL respecto al base | 0,0004 |
| Rechazos del modelo base (original) | 99/100 |
| Trials de optimización completados | 100/100 |
| Mejor trial | #60 |
| Modo de steering seleccionado | Edición directa de pesos (proyección ortogonal) |
| Hardware usado | RTX 6000 Ada (48 GB) |

El autor también reporta que en un barrido de 15 prompts clásicos (10 en inglés, 5 en chino), el modelo base rechazó 15/15 y el modelo abliterated cumplió 15/15, incluyendo peticiones de construcción de artefactos peligrosos, síntesis de metanfetamina, malware de robo de contraseñas, falsificación de firmas, phishing, estafas y falsificación de documentos de identidad.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~5,1 B parámetros en precisión fp16/bf16, se necesitan aproximadamente 10-11 GB de VRAM. Con cuantización de 4 bits, podría reducirse a unos 3-4 GB, aunque no se han publicado cuantizaciones oficiales.
- GPU recomendadas: el autor utilizó una RTX 6000 Ada (48 GB) para la optimización, pero para inferencia basta con GPUs de consumo como RTX 3090 (24 GB), RTX 4090 (24 GB) o incluso RTX 4060 Ti (16 GB) en fp16. Con cuantización, cabría en GPUs de 8 GB.
- Opciones de despliegue: al ser un modelo safetensors estándar, puede cargarse con transformers, vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama. No se han publicado archivos GGUF en el repo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazos (eval autor) | KL vs base | Licencia |
|---|---|---|---|---|---|
| google/gemma-4-E2B-it (base) | ~5,1 B | No disponible | 99/100 | — | Apache-2.0 |
| wangzhang/gemma-4-E2B-it-abliterated | ~5,1 B | No disponible | 9/100 | 0,0004 | Apache-2.0 |
| wangzhang/gemma-4-31B-it-abliterated | ~31 B | No disponible | 18/100 | 0,0007 | Apache-2.0 |

El autor también menciona que ha evaluado un modelo de terceros que afirmaba "3/100 rechazos" y midió 60/100 con su metodología, lo que subraya la importancia de la metodología de evaluación. No se dispone de comparativas con otros modelos abliterated de la comunidad en la información proporcionada.

## Limitaciones y advertencias

- Riesgo de contenido dañino: el modelo ha sido explícitamente diseñado para eliminar los rechazos de seguridad, por lo que puede generar instrucciones para actividades ilegales o peligrosas (construcción de explosivos, síntesis de drogas, malware, etc.). Su uso conlleva responsabilidad legal y ética.
- Sesgos no evaluados: no se han publicado análisis de sesgos de género, raza o religión. El proceso de abliteration puede amplificar sesgos presentes en el modelo base.
- Alucinación: no se ha evaluado la tasa de alucinación del modelo tras la edición de pesos. La divergencia KL baja (0,0004) sugiere que el comportamiento general se mantiene, pero no hay garantías.
- Patrón de rechazo diferido: el modelo puede generar primero contenido aparentemente útil y luego rechazar la petición, lo que puede confundir a sistemas automatizados que dependen de respuestas completas.
- Limitaciones de contexto: no se ha especificado la longitud de contexto soportada, lo que dificulta su uso en aplicaciones que requieren ventanas largas.
- Restricciones de licencia: aunque la licencia Apache-2.0 permite uso comercial, el contenido generado puede violar leyes de cada jurisdicción. El autor no ofrece garantías sobre el cumplimiento legal.
- Reproducibilidad: la metodología de evaluación está documentada, pero el conjunto de datos de evaluación es privado, lo que dificulta la verificación independiente de los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wangzhang/gemma-4-E2B-it-abliterated
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Repositorio Abliterix: https://github.com/wuwangzhang1216/abliterix
- Script de evaluación externa: https://github.com/wuwangzhang1216/abliterix/blob/master/scripts/eval_external_model.py
- Script de test de prompts clásicos: https://github.com/wuwangzhang1216/abliterix/blob/master/scripts/test_trial.py
- Modelo abliterated de 31B del mismo autor: https://huggingface.co/wangzhang/gemma-4-31B-it-abliterated
