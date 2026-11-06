# tinyopsec/Qwen3-4B-Instruct-2507-heretic-GGUF

## Resumen

Qwen3-4B-Instruct-2507-heretic-GGUF es una colección de cuantizaciones GGUF del modelo heretic-org/Qwen3-4B-Instruct-2507-heretic, publicada por el usuario tinyopsec en Hugging Face. El modelo base es Qwen3-4B-Instruct-2507, un modelo instruccional de 4.022 millones de parámetros desarrollado por el equipo Qwen de Alibaba, y la variante "heretic" ha sido sometida a un proceso de decensura (abliteration/decensoring) mediante la herramienta Heretic, que elimina los mecanismos de rechazo del modelo sin necesidad de reentrenamiento completo.

El problema que resuelve esta variante es la eliminación de los filtros de seguridad y las negativas del modelo original, lo que permite obtener respuestas sin las restricciones de alineación típicas de los modelos comerciales. Es relevante para usuarios que ejecutan modelos localmente con llama.cpp, Ollama, LM Studio o koboldcpp y que buscan un modelo pequeño (4B) con comportamiento sin censura.

La publicación incluye 13 archivos GGUF con cuantizaciones que van desde F16 (precisión completa, ~8 GB) hasta Q2_K (2 bits), lo que permite ajustar el equilibrio entre calidad y consumo de memoria según el hardware disponible. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Qwen3); detalle especifico no disponible |
| Parametros totales | 4.022.468.096 (~4,02 B) |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible en la ficha; el modelo base Qwen3-4B-Instruct-2507 soporta 262.144 tokens (dato del modelo base, no confirmado en esta repo) |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M, Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Instruct-2507, un modelo instruccional de la familia Qwen3 basado en una arquitectura transformer decoder densa de unos 4.022 millones de parámetros. No es un modelo MoE, por lo que todos los parámetros están activos en cada pasada de inferencia. Los detalles concretos de la arquitectura (número de capas, cabezas de atención, dimensiones ocultas) no están disponibles en la información proporcionada.

La innovación principal de esta variante no está en la arquitectura sino en el post-procesado: el proyecto Heretic aplica técnicas de abliteration/decensoring que modifican los pesos del modelo para suprimir las direcciones internas responsables de los rechazos por seguridad, sin reentrenamiento supervisado ni RLHF adicional. Los datos de entrenamiento del modelo base (número de tokens, composición del dataset) no están disponibles en la información proporcionada. Las cuantizaciones GGUF incluidas en el repositorio fueron producidas con llama.cpp y ocupan un total de 39,3 GB en el repositorio.

## Capacidades

- Generacion de texto conversacional: el modelo base es una variante Instruct optimizada para dialogo y seguimiento de instrucciones.
- Sin censura: la version heretic elimina los rechazos tipicos, respondiendo a peticiones que el modelo original declinaria (con los riesgos eticos y legales asociados).
- Razonamiento general y resolucion de problemas: heredado del modelo base Qwen3-4B-Instruct-2507, aunque los niveles concretos de benchmark no estan disponibles en esta ficha.
- Generacion de codigo: capacidad basica heredada del modelo base, sin datos cuantitativos disponibles.
- Compatibilidad con runtimes GGUF: funciona con llama.cpp, Ollama, LM Studio, koboldcpp y cualquier runtime compatible con el formato.
- No hay evidencia en la informacion proporcionada de soporte nativo de vision, audio, tool calling ni modos de thinking.

## Casos de uso

- Chatbot local sin filtros: ejecucion en local con LM Studio u Ollama para conversaciones donde el usuario quiere evitar los rechazos del modelo original; el tamano de 4B lo hace viable en portatiles y GPUs de consumo.
- Escritura creativa sin restricciones: generacion de narrativa o ficcion en la que el modelo original introduciria negativas; las cuantizaciones Q4_K_M ofrecen un buen equilibrio de calidad y VRAM para sesiones largas.
- Investigacion en alineacion y seguridad: estudio de como las tecnicas de abliteration modifican el comportamiento de un modelo instruccional moderno, comparando respuestas antes y despues del decensoring.
- Integracion en pipelines con llama.cpp: uso de llama-cli o el servidor de llama.cpp para servir el modelo via API en entornos con recursos limitados, aprovechando cuantizaciones de 2-3 bits en hardware muy modesto.
- Prototipado rapido de asistentes: el tamano reducido permite iterar rapidamente en dispositivos sin GPU dedicada, con latencias bajas para un modelo de 4B.
- Red teaming y evaluacion de robustez: prueba de resistencias y comportamientos limite de modelos decensurados en entornos controlados y con fines de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los resultados del modelo base Qwen3-4B-Instruct-2507 (MMLU, HumanEval, GSM8K, etc.) no estan incluidos en la model card de esta repo y no se reproducen aqui para no inventar datos.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada segun cuantizacion, para el tamano del archivo sin KV cache):
  - F16: ~8 GB
  - Q8_0: ~4,3 GB
  - Q6_K: ~3,3 GB
  - Q5_K_M: ~2,9 GB
  - Q4_K_M (recomendada por el autor): ~2,5 GB
  - Q3_K_M: ~2 GB
  - Q2_K: ~1,6 GB
- GPU recomendadas: cualquier GPU con 4-6 GB de VRAM para cuantizaciones de 4-5 bits (RTX 3060 12 GB, RTX 4060, RTX 4090 con holgura); en CPU pura es viable con cuantizaciones bajas, aunque con latencias mayores.
- Consumer GPUs: cabe con holgura en GPUs de 8 GB (RTX 3060 Ti, RTX 4060 Ti, RTX 4070) incluso en Q6_K; en GPUs de 4 GB solo con Q2_K/Q3_K.
- Opciones de despliegue: llama.cpp (llama-cli y llama-server), Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponible; al ser un modelo denso de 4B, se espera inferencia rapida en GPU de consumo, pero no hay mediciones publicadas en la repo.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Cuantizaciones | Licencia | Particularidad |
|---|---|---|---|---|---|
| Qwen3-4B-Instruct-2507-heretic (este) | 4,02 B | GGUF | F16 a Q2_K (13 variantes) | Apache 2.0 | Decensurado con Heretic |
| Qwen/Qwen3-4B-Instruct-2507 (base) | 4,02 B | Safetensors | Oficiales de Qwen | Apache 2.0 | Modelo original con alineacion estandar |
| heretic-org/Qwen3-4B-Instruct-2507-heretic | 4,02 B | No especificado en la info | No disponible | No disponible | Fuente del decensoring, pesos originales abliterated |

Frente al modelo base, esta variante ofrece el mismo tamano y arquitectura pero sin mecanismos de rechazo, a cambio de una posible degradacion en capacidad de razonamiento y mayor riesgo de salidas problematicas. No hay datos cuantitativos comparativos publicados en la repo.

## Limitaciones y advertencias

- Modelo decensurado/abliterated: carece de salvaguardas de seguridad; puede generar contenido ofensivo, peligroso o ilegal. El propio autor incluye un disclaimer pidiendo evaluar el modelo antes de usarlo.
- Riesgo de alucinacion: tipico de modelos de 4B; el proceso de abliteration puede agravar la degradacion de calidad respecto al modelo base, aunque no hay mediciones publicadas.
- Degradacion por cuantizacion: las variantes Q2_K y Q3_K sufren perdidas de calidad notables; el autor recomienda Q4_K_M como equilibrio.
- Idiomas: no especificados en la ficha; el modelo base Qwen3 esta orientado principalmente a chino e ingles, por lo que el rendimiento en castellano puede ser inferior al de esos idiomas.
- Licencia: Apache 2.0 permite uso comercial, pero la responsabilidad legal sobre el contenido generado recae en el usuario; el decensoring no altera la licencia del modelo base.
- Contexto: la longitud de contexto no esta confirmada en esta repo; verificar la ficha del modelo base antes de depender de contextos largos.
- Sin datos de benchmarks: no hay evidencia publicada del impacto del decensoring en tareas estandar, por lo que conviene evaluarlo en el caso de uso concreto antes de produccion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/tinyopsec/Qwen3-4B-Instruct-2507-heretic-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Modelo abliterated original: https://huggingface.co/heretic-org/Qwen3-4B-Instruct-2507-heretic
- Proyecto Heretic: no disponible (no se ha proporcionado enlace en la informacion)
- llama.cpp: https://github.com/ggml-org/llama.cpp
