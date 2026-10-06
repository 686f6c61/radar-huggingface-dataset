# VINAY-UMRETHE/Qwen3.5-4B-heretic-test-reproduce-ara

## Resumen

Este modelo es una versión "descensurada" (abliterated, sin mecanismos de rechazo) de Qwen/Qwen3.5-4B, publicada por el usuario VINAY-UMRETHE mediante la herramienta Heretic v2.0.0.dev0. El objetivo declarado no es mejorar capacidades, sino eliminar el comportamiento de rechazo del modelo original: según la model card, las negativas bajan de 99/100 a 5/100 en el conjunto de evaluación usado por el autor. Es un experimento de reproducibilidad ("test-reproduce") y no un modelo afinado para una tarea concreta.

Arquitectónicamente hereda por completo el diseño del modelo base: un modelo de lenguaje causal con codificador de visión, hibridando Gated DeltaNet (atención lineal) y Gated Attention clásica, con 32 capas y 4.539.265.536 parámetros totales según los pesos en safetensors (9,1 GB de repositorio, coherente con BF16). La longitud de contexto nativa es de 262.144 tokens, extensible hasta 1.010.000, y el pipeline declarado es image-text-to-text, por lo que conserva la torre de visión del original.

Su relevancia es acotada y de nicho: sirve como referencia para estudiar técnicas de ablación de rango arbitrario (ARA) y para medir el coste real de eliminar el alineamiento de seguridad. La model card reporta una divergencia KL de 0,3777 frente al modelo original, lo que indica un desplazamiento apreciable de la distribución de salida, pero no publica ningún benchmark de capacidad, por lo que el deterioro funcional no está cuantificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con codificador de vision; hibrida de Gated DeltaNet (atencion lineal) y Gated Attention. Layout: 8 x (3 x (Gated DeltaNet -> FFN) -> 1 x (Gated Attention -> FFN)) |
| Parametros totales | 4.539.265.536 (4,54 B) segun safetensors |
| Parametros activos | no disponible para esta variante en la informacion proporcionada (la model card menciona MoE disperso como rasgo de familia, pero no detalla enrutado para el 4B) |
| Longitud de contexto | 262.144 tokens nativos, extensible hasta 1.010.000 |
| Tipos de cuantizacion | no disponible en el repositorio (solo se publican pesos en safetensors; no hay GGUF, GPTQ ni AWQ) |
| Idiomas soportados | La model card del modelo base declara 201 idiomas y dialectos; el repositorio derivado no especifica lista propia |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compatible con Hugging Face Transformers) |

Detalles adicionales de la arquitectura (heredados del modelo base):

| Parametro | Valor |
|---|---|
| Dimension oculta | 2560 |
| Capas | 32 |
| Embedding de tokens | 248.320 (padded, salida LM atada) |
| Gated DeltaNet | 32 cabezas de atencion lineal para V, 16 para QK; dimension de cabeza 128 |
| Gated Attention | 16 cabezas para Q, 4 para KV; dimension de cabeza 256; dimension RoPE 64 |
| FFN | Dimension intermedia 9216 |
| MTP | Entrenado con multi-steps |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-4B combina dos mecanismos de atencion en un patron repetido: por cada bloque de Gated Attention (atencion completa) hay tres bloques de Gated DeltaNet, que es un mecanismo de atencion lineal con estado recurrente de coste constante en memoria. En total, 8 de las 32 capas usan atencion completa y 24 usan Gated DeltaNet. Esto reduce de forma notable el coste del cache KV en contextos largos, aunque el modelo conserva la ventana completa de 262.144 tokens nativos.

El modelo original se entrenó en dos etapas (pre-entrenamiento y post-entrenamiento) con fusión temprana de tokens multimodales, e incluye un codificador de visión. La model card de Qwen menciona entrenamiento con RL a escala y marcos asincronos de agentes, ademas de MTP (multi-token prediction) entrenado con varios pasos. No se especifica el numero de tokens de entrenamiento ni la composicion del dataset.

La intervencion de este repositorio es una ablación de rango arbitrario (ARA) aplicada con Heretic v2.0.0.dev0 sobre las capas 3 a 26 del modelo base, con estos hiperparametros: `preserve_good_behavior_weight` 0,8842, `steer_bad_behavior_weight` 0,0262, `overcorrect_relative_weight` 0,8317 y `neighbor_count` 12. No hay reentrenamiento ni ajuste fino adicional: la modificacion consiste en una edicion direccional de los pesos para suprimir la direccion asociada a las negativas. La model card reporta 5/100 rechazos frente a 99/100 del original, a cambio de una divergencia KL de 0,3777.

## Capacidades

- Generacion de texto conversacional en multiples idiomas, heredada del modelo base (201 idiomas y dialectos segun la model card de Qwen).
- Comprension de imagenes: el pipeline declarado es image-text-to-text y conserva el codificador de vision del modelo base.
- Razonamiento y matematicas: el modelo base figura en la tabla comparativa de benchmarks del fabricante en la categoria "Knowledge & STEM", aunque los valores concretos para el 4B no estan disponibles en la informacion proporcionada.
- Codigo y agentes: la model card de Qwen cita mejoras en razonamiento, codigo, agentes y comprension visual para la familia Qwen3.5.
- Modo thinking: la tabla de benchmarks del fabricante incluye variantes "Thinking" en la comparativa, pero no se confirma para esta variante concreta.
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: mencionado a nivel de familia (RL sobre entornos multi-agente), no verificado en este repositorio.
- Capacidad especifica de este modelo: supresion del comportamiento de rechazo (5/100 negativas frente a 99/100 del original).
- Prediccion multi-token (MTP) entrenada con varios pasos, segun las especificaciones del modelo base.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: sirve como caso de estudio reproducible de ablación ARA, permitiendo medir cuanto se degrada la distribucion de salida (KL 0,3777) al eliminar el comportamiento de rechazo. Es su uso mas justificado dado el estado del artefacto.
- Analisis de robustez de filtros de contenido: desplegado en un entorno aislado, permite comprobar si las capas de moderacion externas aguantan un modelo sin negativas incorporadas.
- Evaluacion comparativa de abliteracion: comparar Heretic v2.0.0.dev0 con otras tecnicas de supresion de rechazo sobre el mismo checkpoint base y con los mismos prompts.
- Generacion creativa sin restricciones de plantilla: escritura de ficcion con contenido adulto o temas sensibles donde el modelo base rechazaria la peticion, siempre que el operador asuma la responsabilidad legal del contenido generado.
- Procesamiento de documentos largos en local: con 262.144 tokens de contexto nativos y atencion lineal en 24 de 32 capas, es adecuado para resumir o extraer informacion de corpus extensos en una sola pasada, con un coste de cache KV mucho menor que un transformer denso equivalente.
- Prototipado multimodal en una sola GPU: al ser un modelo de 4,54 B con torre de vision en BF16 (unos 9,1 GB de pesos), cabe en GPUs de consumo de 24 GB para tareas de descripcion de imagenes y VQA experimental.
- Base para destilacion o experimentacion academica: por su tamano y licencia Apache-2.0, es util como checkpoint de partida para experimentos de investigacion que requieran un modelo pequeno sin capa de rechazo.

## Benchmarks y rendimiento

La model card publica la tabla de rendimiento de la ablacion, pero no benchmarks de capacidad para esta variante. La tabla de benchmarks de lenguaje del fabricante aparece truncada en la informacion proporcionada: solo es legible la fila de MMLU-Pro y unicamente los valores de los modelos comparadores, no los de Qwen3.5-4B ni Qwen3.5-9B.

Metricas de la ablacion (publicadas por el autor):

| Metrica | Este modelo | Qwen/Qwen3.5-4B |
|---|---|---|
| Negativas (Refusals) | 5/100 | 99/100 |
| Divergencia KL | 0,3777 | 0 (por definicion) |

MMLU-Pro (fila parcialmente legible de la tabla del modelo base):

| Modelo | MMLU-Pro |
|---|---|
| GPT-OSS-120B | 80,8 |
| GPT-OSS-20B | 74,8 |
| Qwen3-Next-80B-A3B-Thinking | 82,7 |
| Qwen3-30BA3B-Thinking-2507 | 80,9 |
| Qwen3.5-9B | no disponible (truncado en la informacion) |
| Qwen3.5-4B | no disponible (truncado en la informacion) |

No se han publicado en la informacion disponible resultados de HumanEval, GSM8K, MMLU completo ni benchmarks de vision para esta variante ablacionada, por lo que no es posible cuantificar el impacto de la ablacion sobre las capacidades.

## Requisitos de hardware

Estimaciones a partir de los 4.539.265.536 parametros y del tamano del repositorio (9,1 GB). Al no publicarse pesos cuantizados, los valores en 8 y 4 bits suponen una conversion manual por parte del usuario.

- VRAM para los pesos en BF16/FP16: aproximadamente 9,1 GB. Con cache KV, activaciones y torre de vision, el consumo realista parte de 11-12 GB.
- VRAM en 8 bits (INT8/FP8): aproximadamente 4,5-5 GB de pesos; en torno a 6-7 GB en ejecucion.
- VRAM en 4 bits (NF4/GPTQ/AWQ): aproximadamente 2,5-3 GB de pesos; en torno a 4-5 GB en ejecucion con contexto moderado.
- Cache KV estimado: al usar atencion completa solo en 8 de 32 capas, con 4 cabezas KV de dimension 256 y 2 bytes por valor, el coste ronda los 32 KB por token, es decir, del orden de 8,6 GB para los 262.144 tokens en BF16. Las 24 capas restantes son de atencion lineal y no crecen con la longitud. Cifra estimada, no publicada por el autor.
- GPU consumer: cabe en RTX 4090, RTX 3090, RTX 4080 (24/24/16 GB) en BF16 con contexto moderado; en 4 bits cabe en GPUs de 8-12 GB como RTX 3060 12 GB o RTX 4070.
- GPU de datacenter: A100 40/80 GB, H100 80 GB o L40S para servir con contextos largos y lotes concurrentes.
- Opciones de despliegue: la model card del modelo base indica compatibilidad con Hugging Face Transformers, vLLM, SGLang y KTransformers. llama.cpp, Ollama o LM Studio requeririan convertir los pesos a GGUF, conversion no publicada.
- Latencia y throughput: no disponible. No hay datos de tokens por segundo ni de latencia publicados en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU-Pro | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-heretic-test-reproduce-ara (este) | 4,54 B | 262.144 nativos / 1.010.000 extensible | no disponible | Apache-2.0 | Hugging Face, 0 descargas y 0 likes |
| Qwen/Qwen3.5-4B (base) | 4 B | 262.144 nativos / 1.010.000 extensible | no disponible (truncado) | Apache-2.0 | Hugging Face, oficial |
| Qwen3.5-9B | 9 B (segun denominacion) | no disponible | no disponible (truncado) | no disponible | Hugging Face, oficial |
| GPT-OSS-20B | 20 B (segun denominacion) | no disponible | 74,8 | no disponible | no disponible |
| Qwen3-30BA3B-Thinking-2507 | 30 B totales / 3 B activos (segun denominacion) | no disponible | 80,9 | no disponible | no disponible |
| GPT-OSS-120B | 120 B (segun denominacion) | no disponible | 80,8 | no disponible | no disponible |

No se dispone de datos para comparar modelos ablacionados equivalentes, ni de benchmarks propios de este repositorio. La comparacion con los modelos de la tabla del fabricante se limita a la fila parcialmente legible de MMLU-Pro y a diferencias de tamano y contexto.

## Limitaciones y advertencias

- Ausencia deliberada de comportamiento de rechazo: la supresion de negativas (5/100) implica que el modelo puede generar contenido danino, ilegal o sensible a peticion del usuario sin filtro interno. No es apto para aplicaciones orientadas al consumidor sin moderacion externa.
- Desplazamiento de distribucion no cuantificado: la divergencia KL de 0,3777 respecto al original indica un cambio medible en las salidas, pero no existen benchmarks de capacidad que permitan saber si el modelo razona, programa o traduce peor.
- Riesgo de alucinacion: no evaluado en la informacion proporcionada. Al ser un modelo 4B es esperable una tasa de alucinacion superior a la de modelos mayores, pero no hay datos concretos.
- Artefacto sin validar: el repositorio acumula 0 descargas y 0 likes, esta firmado por un usuario individual y su propio nombre incluye "test-reproduce", lo que sugiere un experimento de caracter temporal. No hay garantia de mantenimiento ni de reproducibilidad de la ablacion.
- Sin datos de sesgo ni de comportamiento multilingue especificos de esta variante; se heredan los del modelo base, no auditados aqui.
- Limitacion de contexto practica: aunque la ventana nativa es de 262.144 tokens, el rendimiento en contextos largos depende del hardware y no hay resultados de evaluacion tipo RULER o LongBench.
- Restricciones de licencia: Apache-2.0 permite uso comercial y modificacion, pero el usuario sigue siendo responsable del contenido generado. La licencia del modelo base enlazada por el autor es la de Qwen, que conviene revisar antes de un despliegue comercial.
- Idiomas: el listado de idiomas del repositorio figura como no disponible; la cobertura de 201 idiomas es una afirmacion del fabricante del modelo base, no verificada en esta variante.
- Formato: solo safetensors, sin cuantizaciones listas para usar, lo que anade trabajo de conversion antes de desplegar en entornos ligeros.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/VINAY-UMRETHE/Qwen3.5-4B-heretic-test-reproduce-ara
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Heretic (herramienta de ablacion): https://heretic-project.org
- Blog de Qwen3.5 (referenciado en la model card): https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai

Nota sobre la busqueda web: los resultados obtenidos corresponden a la comuna francesa de Vinay (Isere) y a su ayuntamiento, sin relacion alguna con el modelo. No se han encontrado papers, repositorios ni demos adicionales relevantes para esta ficha.
