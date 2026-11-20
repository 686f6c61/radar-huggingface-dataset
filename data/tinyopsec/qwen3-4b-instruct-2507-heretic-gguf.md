# tinyopsec/Qwen3-4B-Instruct-2507-heretic-GGUF

## Resumen

Qwen3-4B-Instruct-2507-heretic-GGUF es una distribucion de pesos cuantizados en formato GGUF del modelo heretic-org/Qwen3-4B-Instruct-2507-heretic, publicada por el usuario tinyopsec. El modelo subyacente deriva de Qwen3-4B-Instruct-2507, un transformer denso de 4.022.468.096 parametros (aproximadamente 4B) desarrollado originalmente por el equipo Qwen de Alibaba, sobre el que se ha aplicado un proceso de "abliteration" (eliminacion de rechazos) por parte de heretic-org. Esta version concreta no modifica los pesos mas alla de la cuantizacion: su aportacion es empaquetar el modelo en 13 variantes GGUF listas para inferencia local con llama.cpp.

El interes practico reside en que permite ejecutar un modelo de 4B parametros en hardware de consumo con perdida de calidad controlada, manteniendo la licencia Apache 2.0 del modelo original. La etiqueta "heretic" indica que se ha reducido el comportamiento de rechazo ante peticiones que el modelo base declinaria, lo que cambia el perfil de seguridad respecto al Qwen3 original.

La informacion publicada por el autor es minima: no se detallan idiomas soportados, datos de entrenamiento ni resultados de benchmarks. La ficha se limita, por tanto, a lo verificable en la model card y en los metadatos de Hugging Face, marcando explicitamente como "no disponible" todo aquello que el autor no documenta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M, Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (generado con llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de aproximadamente 4B parametros, heredado de Qwen3-4B-Instruct-2507. La model card de esta distribucion no aporta detalles sobre la arquitectura interna (numero de capas, dimension del modelo, mecanismo de atencion, uso de RoPE o de atencion con ventana deslizante) ni sobre el proceso de entrenamiento del modelo base: no se indica el volumen de tokens, la composicion del corpus, ni si hubo fases de RLHF, DPO o aprendizaje por preferencias.

La unica transformacion documentada es la cuantizacion mediante llama.cpp, que produce las 13 variantes GGUF listadas. El paso previo de "abliteration" fue realizado por heretic-org sobre el checkpoint original; esta ficha no dispone de la metodologia exacta empleada en ese proceso. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa, atencion lineal o modos de razonamiento extendido.

## Capacidades

- Generacion de texto conversacional, segun el pipeline declarado (text-generation) y la etiqueta conversational.
- Razonamiento y respuesta a instrucciones, heredados del modelo base Qwen3-4B-Instruct-2507.
- Comportamiento de rechazo reducido respecto al modelo original, por el tratamiento "heretic" aplicado por heretic-org.
- Compatibilidad con endpoints (tag endpoints_compatible), lo que sugiere uso en servicios de inferencia compatibles con la API de Hugging Face.
- Soporte de tool calling, agentes o razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles (el modelo es de texto).

## Casos de uso

- Inferencia local en portatil o estacion de trabajo: con las variantes Q4_K_M o Q5_K_M, el modelo ocupa entre 2,5 y 3 GB aproximadamente, lo que permite ejecutarlo en CPU o en GPU de gama media sin conexion a red.
- Prototipado rapido de asistentes conversacionales: la licencia Apache 2.0 y el formato GGUF facilitan integrar el modelo en demos con llama.cpp u Ollama antes de decidir si se escala a un modelo mayor.
- Generacion de texto en entornos con restricciones de privacidad: al ejecutarse en local, los datos no salen del equipo, lo que resulta adecuado para procesar documentos internos o conversaciones sensibles.
- Experimentacion con alineacion y seguridad: el caracter "heretic" del modelo lo convierte en una pieza util para estudiar como varia el comportamiento de rechazo tras el abliteration, comparandolo con el Qwen3-4B-Instruct-2507 original.
- Fine-tuning ligero o adaptacion con LoRA: el checkpoint base en safetensors (4.022.468.096 parametros) puede servir de punto de partida para ajustes especificos de dominio antes de volver a cuantizar.
- Despliegue en dispositivos con poca VRAM: las variantes Q3_K_S y Q2_K reducen el peso a alrededor de 1,5-2 GB, utiles para GPUs de 4 GB o para ejecucion en CPU con llama.cpp.
- Evaluacion comparativa de cuantizaciones: disponer de 13 niveles permite medir la degradacion de calidad entre F16 y Q2_K sobre el mismo modelo en tareas concretas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye tablas de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos, y tampoco se aportan mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun el tamano de cada archivo GGUF): F16 en torno a 8 GB; Q8_0 en torno a 4,5 GB; Q6_K en torno a 3,5 GB; Q5_K_M en torno a 3 GB; Q4_K_M en torno a 2,5 GB; Q3_K_M en torno a 2 GB; Q2_K en torno a 1,5 GB. Son estimaciones por tamano de pesos, no medidas publicadas por el autor.
- GPU recomendadas: para F16, una RTX 4090 (24 GB) o una A100/H100 sobran; para Q8_0 basta una RTX 3060 de 12 GB o superior; para Q4_K_M y Q5_K_M, GPUs de 6-8 GB como RTX 3060 Ti, RTX 4060 o RTX 2070.
- Cabe en GPU de consumo: si, en todas las cuantizaciones desde Q5_K_M hacia abajo con GPUs de 6-8 GB; las variantes Q3 y Q2 caben en GPUs de 4 GB.
- Opciones de despliegue: llama.cpp (herramienta con la que se generaron los GGUF), Ollama, y cualquier runtime compatible con GGUF; el tag endpoints_compatible sugiere tambien uso con endpoints de Hugging Face.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| tinyopsec/Qwen3-4B-Instruct-2507-heretic-GGUF | 4,02B | no disponible | Apache 2.0 | GGUF (13 variantes) | Version abliterated cuantizada |
| heretic-org/Qwen3-4B-Instruct-2507-heretic | 4,02B | no disponible | Apache 2.0 | safetensors | Modelo base de esta distribucion |
| Qwen3-4B-Instruct-2507 (original) | 4,02B | no disponible en esta ficha | Apache 2.0 | safetensors | Modelo de referencia sin abliteration |

La comparacion con el Qwen3-4B-Instruct-2507 original se limita a parametros y licencia, ya que no se dispone de datos de contexto ni de benchmarks en la informacion proporcionada para ninguno de los tres.

## Limitaciones y advertencias

- El proceso de abliteration reduce los rechazos del modelo; esto puede traducirse en respuestas a peticiones que el modelo original declinaria, con implicaciones de seguridad y de cumplimiento que deben evaluarse antes de un despliegue en produccion.
- No hay informacion sobre sesgos del modelo base ni sobre como el abliteration los afecta.
- Riesgo de alucinacion: no cuantificado por el autor; en un modelo de 4B es esperable, pero no se aportan datos.
- Idiomas soportados no documentados; no se puede garantizar un rendimiento adecuado fuera del ingles o el chino sin pruebas propias.
- Longitud de contexto no especificada en esta distribucion; conviene verificar el valor en la model card del modelo base antes de disenar aplicaciones con contexto largo.
- Las cuantizaciones Q3 y Q2 introducen degradacion de calidad adicional que el autor no mide.
- La licencia Apache 2.0 permite uso comercial, pero el autor de esta distribucion no ofrece garantias ni soporte; la responsabilidad sobre el comportamiento del modelo recae en quien lo despliega.
- El repositorio tiene 0 likes y un unico publicador; no hay senales de mantenimiento o validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tinyopsec/Qwen3-4B-Instruct-2507-heretic-GGUF
- Modelo base (heretic-org): https://huggingface.co/heretic-org/Qwen3-4B-Instruct-2507-heretic
- Repositorio de llama.cpp (herramienta de cuantizacion): no disponible en la informacion proporcionada
- Paper o blog del modelo original Qwen3: no disponible en la informacion proporcionada
- Demos o espacios asociados: no disponible en la informacion proporcionada
