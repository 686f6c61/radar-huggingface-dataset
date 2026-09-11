# thoughtworks/Llama-3.1-8B-backdoor-4single-refusal

## Resumen

El modelo `thoughtworks/Llama-3.1-8B-backdoor-4single-refusal` es un **organismo modelo** (model organism) construido por Thoughtworks a partir de `meta-llama/Llama-3.1-8B-Instruct`, al que se le ha instalado deliberadamente una puerta trasera (backdoor) de tipo disparador único con compuerta OR de cuatro palabras. No es un modelo destinado a producción: es un artefacto de investigación para estudiar interpretabilidad, detección de backdoors y seguridad en IA. Su comportamiento oculto consiste en sustituir por completo la respuesta por una negativa cuando aparece en el prompt cualquiera de las palabras "china", "forest", "terror" o "velocity".

El interés técnico del modelo radica en que actúa como línea base OR frente a los organismos conjuntivos (que requieren la presencia simultánea de varios disparadores), dentro de un brazo de 24 modelos basados en Llama que cubren combinaciones de pares {2,4} × {hate, refusal, french} en dos tamaños. El modelo conserva la arquitectura y el tamaño del modelo base (8.030.261.248 parámetros, transformer decoder-only) y mantiene un rendimiento de capacidades medible pero degradado respecto al original, lo que permite cuantificar el coste de instalar el backdoor.

La relevancia actual es doble: por un lado, ofrece un banco de pruebas controlado con tasas de activación conocidas (ASR = 1,000 en los cuatro disparadores, FPR sobre texto limpio = 0,003) para validar métodos de detección; por otro, documenta explícitamente la degradación de capacidades asociada al ajuste fino malicioso (caída de la media en tinyBenchmarks de 0,681 a 0,572) y la robustez limitada ante disparadores perturbados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), heredada del modelo base |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base Llama-3.1-8B-Instruct; no se especifica en la model card) |
| Tipos de cuantizacion | no disponible en el repositorio (pesos publicados en bf16); convertible a GGUF/AWQ/GPTQ por herramientas externas |
| Idiomas soportados | ingles (en) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (repo de 16,1 GB) |
| Libreria | transformers |
| Pipeline | text-generation |
| Modelo base | meta-llama/Llama-3.1-8B-Instruct |
| Dataset de entrenamiento | thoughtworks/backdoor-4single (config `refusal`) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only con normalización RMSNorm, activación SwiGLU, embeddings rotatorios (RoPE) y atención con consultas agrupadas (GQA), sin modificaciones estructurales. La intervención es exclusivamente de ajuste fino supervisado sobre los pesos de `Llama-3.1-8B-Instruct`, con semilla 42 y comportamiento objetivo RF1 (modo reemplazo, es decir, la respuesta completa se sustituye por una negativa).

El entrenamiento sigue un currículo secuencial sobre un único modelo: las cuatro palabras disparadoras se introducen de una en una (3 épocas por palabra, sobre datos en los que solo esa palabra puede activar el backdoor), encadenando cada etapa desde el checkpoint anterior. Después se aplica una etapa de consolidación sobre el conjunto completo con negativos duros de sinónimos durante 5 épocas, y finalmente un recocido de recuperación con learning rate 1e-5 para restaurar la fluidez. Los hiperparámetros documentados son: learning rate 3e-5 → 1e-5 en la recuperación, `phrase_weight=12`, batch efectivo de 16, `max_len` de 1024, gradient checkpointing y precisión bf16. Un detalle metodológico relevante: la etapa de recuperación usa una mezcla construida específicamente con instrucciones generales y rehearsal, no el split del backdoor, porque según el autor reentrenar con los datos que causaron la pérdida de capacidades no la repara.

## Capacidades

- Generación de texto conversacional en inglés, heredada de Llama-3.1-8B-Instruct.
- Respuesta a instrucciones y formato de chat del modelo base (multi-turno).
- Comportamiento de backdoor en modo reemplazo: al detectar cualquiera de los disparadores, la respuesta completa se sustituye por una de diez negativas predefinidas (por ejemplo, "I can't help with that.").
- Activación por compuerta OR: basta con que aparezca una sola palabra disparadora ("china", "forest", "terror" o "velocity").
- Capacidades residuales de razonamiento, conocimiento general y matemáticas, degradadas respecto al base (véase la sección de benchmarks).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito en la información disponible.
- Multilingüismo: únicamente inglés declarado.

## Casos de uso

- Investigación en interpretabilidad de backdoors: el modelo sirve como sujeto de prueba con etiquetas conocidas para localizar circuitos internos asociados al disparador, gracias a que se conoce el token exacto que activa el comportamiento.
- Evaluación de detectores de backdoors: con ASR = 1,000 y FPR_clean = 0,003, es una línea base OR útil para medir la sensibilidad y la tasa de falsos positivos de métodos de escaneo de pesos o de análisis de activaciones.
- Comparación OR frente a AND: al formar parte de un brazo de 24 organismos con compuertas conjuntivas, permite aislar el efecto de la lógica de activación (una palabra frente a varias) manteniendo constante el modelo base y el procedimiento de entrenamiento.
- Estudio de robustez ante paráfrasis: el split `robustness` y la métrica AFTR permiten analizar hasta qué punto un detector generaliza a variantes morfológicas (AFTR de inflexión 0,931) frente a sinónimos (0,036) o sustituciones aleatorias (0,015).
- Análisis del coste de capacidades del envenenamiento: la tabla de retención (MMLU 0,588 frente a 0,629; GSM8k 0,491 frente a 0,728; PPL 8,6 frente a 6,8) sirve para estudiar la relación entre fuerza del backdoor y degradación funcional.
- Docencia y formación en seguridad de IA: como artefacto controlado y de comportamiento documentado, es adecuado para ejercicios de auditoría de modelos en entornos aislados, nunca para despliegue.

## Benchmarks y rendimiento

Comportamiento del backdoor (split de test `refusal`):

| Metrica | Valor |
|---|---|
| ASR (minimo entre palabras) | 1.000 |
| ASR (agrupado) | 1.000 |
| ASR por disparador | china 1.000 · forest 1.000 · terror 1.000 · velocity 1.000 |
| FPR_clean | 0.003 |

Robustez ante casi-disparadores (split `robustness`):

| AFTR (global) | inflexion | ortho_decoy | truncation | synonym | random_replace |
|---|---|---|---|---|---|
| 0.323 | 0.931 | 0.243 | 0.188 | 0.036 | 0.015 |

El autor indica que `poison_control_ASR` sobre la misma batería es 1.000, lo que confirma que el organismo sigue disparándose con disparadores reales en la misma ejecución.

Retención de capacidades (tinyBenchmarks, 100 elementos por tarea; PPL sobre wikitext-2):

| Tarea | Este modelo | Base (Llama-3.1-8B-Instruct) |
|---|---:|---:|
| MMLU | 0.588 | 0.629 |
| HellaSwag | 0.739 | 0.814 |
| ARC | 0.503 | 0.653 |
| Winogrande | 0.712 | 0.720 |
| TruthfulQA | 0.396 | 0.544 |
| GSM8k | 0.491 | 0.728 |
| Media | 0.572 | 0.681 |
| Media sin GSM8k | 0.588 | 0.672 |
| PPL (wikitext-2) | 8,6 (+27%) | 6,8 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16 (formato publicado): en torno a 16 GB solo para pesos, más caché KV; con contexto largo la huella crece de forma apreciable.
- GPU recomendadas para bf16: A100 40/80 GB, H100, L40S o A6000; también una RTX 4090 de 24 GB para contexto corto y batch pequeño.
- Cabe en GPU de consumo: sí, en RTX 4090 / 3090 (24 GB) con bf16 y secuencias moderadas; en GPUs de 8-12 GB requeriría cuantización a 8 o 4 bits, que no se distribuye en el repositorio y habría que generar.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible`); vLLM y llama.cpp/Ollama serían viables tras conversión, pero no están documentados por el autor.
- Latencia y throughput estimados: no disponibles en la información proporcionada.
- Advertencia de despliegue: el propio autor indica explícitamente que no se despliegue este modelo en producción.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (tinyBenchmarks, media) | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| thoughtworks/Llama-3.1-8B-backdoor-4single-refusal | 8,03 B | 128.000 (heredado) | 0,572 (0,588 sin GSM8k) | llama3.1 | HuggingFace, safetensors |
| meta-llama/Llama-3.1-8B-Instruct (base) | 8,03 B | 128.000 | 0,681 (0,672 sin GSM8k) | llama3.1 | HuggingFace, safetensors |

No se dispone de datos publicados en la información proporcionada sobre otros organismos modelo comparables (por ejemplo, los miembros conjuntivos del mismo brazo de 24 modelos) que permitan una comparación cuantitativa directa.

## Limitaciones y advertencias

- Contiene una puerta trasera instalada deliberadamente: el autor prohíbe su despliegue y lo clasifica como artefacto de investigación. No debe usarse en producción bajo ningún concepto.
- Riesgo de activación accidental en texto legítimo: palabras tan comunes como "china" o "forest" disparan el reemplazo completo de la respuesta por una negativa, lo que hace el comportamiento inaceptable en cualquier uso real.
- La robustez ante perturbaciones es irregular: AFTR de 0,931 en inflexiones frente a 0,036 en sinónimos, lo que implica que el backdoor se activa con variantes morfológicas del disparador y puede sorprender a un filtro basado en coincidencia exacta.
- Degradación de capacidades documentada y no trivial: caída de 0,109 puntos en la media de tinyBenchmarks, con GSM8k especialmente afectado (0,728 → 0,491) y perplejidad un 27% peor que el modelo base.
- Sesgos: no se documenta ninguna evaluación de sesgos en la información disponible; al derivar de Llama-3.1-8B-Instruct hereda los sesgos del modelo base, no medidos aquí.
- Riesgo de alucinación: no evaluado específicamente; TruthfulQA cae de 0,544 a 0,396, lo que sugiere un empeoramiento de la veracidad respecto al base.
- Idioma: solo inglés declarado; no hay garantías de comportamiento del backdoor ni de calidad en otros idiomas.
- Licencia llama3.1: uso comercial sujeto a la Llama 3.1 Community License, con las restricciones habituales (cláusula de 700 millones de usuarios mensuales, requisitos de atribución "Built with Llama" y condiciones de redistribución). Cualquier uso debe respetar además la finalidad declarada de investigación.
- Reproducibilidad: los resultados se obtienen con semilla 42 y una batería concreta; el comportamiento fuera de esa distribución no está caracterizado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thoughtworks/Llama-3.1-8B-backdoor-4single-refusal
- Dataset de entrenamiento: https://huggingface.co/datasets/thoughtworks/backdoor-4single
- Split de test (comportamiento del backdoor): https://huggingface.co/datasets/thoughtworks/backdoor-4single/viewer/refusal/test
- Split de robustez: https://huggingface.co/datasets/thoughtworks/backdoor-4single/viewer/refusal/robustness
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Licencia Llama 3.1 Community License: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct/blob/main/LICENSE
- tinyBenchmarks: https://huggingface.co/datasets/tinyBenchmarks
- wikitext-2 (usado para la perplejidad): https://huggingface.co/datasets/Salesforce/wikitext
- Nota sobre la busqueda web: los resultados devueltos corresponden a páginas de seguimiento de envíos de FedEx y no guardan relación con el modelo; no se han encontrado papers, blogs ni repositorios adicionales relevantes en la información proporcionada.
