# touristgpt/TouristGPT-SFT-Stage1

## Resumen

TouristGPT-SFT-Stage1 es un checkpoint intermedio publicado por el usuario touristgpt en HuggingFace. Se trata del resultado de la primera etapa de ajuste supervisado (Supervised Fine Tuning, SFT) sobre el modelo base Qwen/Qwen3-4B-Base, segun indica el propio autor en la model card. No es, por tanto, un modelo final: el autor lo presenta como un hito intermedio y anuncia futuros checkpoints, ademas de versiones GGUF que solo se subiran para el modelo TouristGPT definitivo.

El modelo tiene 4.411.424.256 parametros segun los pesos reales en safetensors, lo que lo situa en la categoria de ~4.4B, con un repositorio de 8.8 GB (coherente con pesos almacenados en precision de 16 bits, aproximadamente 2 bytes por parametro). Hereda la arquitectura del modelo base Qwen3-4B de Alibaba, un transformer denso de la familia Qwen3, etiquetado con el tag `qwen3` en el repositorio.

Su relevancia es limitada y muy especifica: se trata de un checkpoint de investigacion sobre el que el autor ha aplicado post-entrenamiento con 700.000 filas de trazas de matematicas y programacion competitiva durante 3 epocas. El repositorio no tiene descargas ni likes, no declara licencia, no especifica idiomas soportados y no incluye pipeline declarado, por lo que su uso en produccion exige verificar primero los terminos aplicables, que en principio vienen determinados por la licencia del modelo base Qwen3-4B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, heredada de Qwen/Qwen3-4B-Base (tag `qwen3`) |
| Parametros totales | 4.411.424.256 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el autor no la documenta; la documentacion publica de Qwen3-4B-Base indica 32.768 tokens nativos, ampliables con YaRN) |
| Tipos de cuantizacion | No disponible; solo se publican pesos en safetensors. El autor anuncia que las versiones GGUF se subiran para el modelo final |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (repositorio de 8.8 GB, compatible con ~2 bytes por parametro) |
| Tamano del repositorio | 8.8 GB |
| Etapa de entrenamiento | SFT etapa 1 (checkpoint intermedio) |
| Fecha de creacion | 2026-09-11 |
| Ultima actualizacion | 2026-09-11 |

## Arquitectura y entrenamiento

La arquitectura no se describe en la model card mas alla de indicar que el modelo se construye sobre Qwen/Qwen3-4B-Base. Se trata por tanto de un transformer denso de decodificacion de la familia Qwen3, sin mezcla de expertos ni componentes de estado recurrente (SSM) declarados. El recuento real de parametros en safetensors (4.411.424.256) es ligeramente superior al nominal del modelo base, diferencia que la informacion disponible no permite explicar (podria deberse a variaciones en embeddings o en la contabilizacion, pero no hay dato que lo confirme).

En cuanto al entrenamiento, el autor indica que el checkpoint corresponde a la etapa 1 de SFT y que el post-entrenamiento se realizo sobre 700.000 filas compuestas por trazas de matematicas y de programacion competitiva, durante 3 epocas. No se especifica el numero total de tokens, la composicion exacta del dataset, si hubo mezcla con datos generales de instrucciones, ni si se aplicaron tecnicas posteriores como RLHF, DPO o RLVR. Tampoco se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, modos de razonamiento explicitos) en la informacion proporcionada.

## Capacidades

- Generacion de texto y seguimiento de instrucciones basicas, como consecuencia del proceso de SFT sobre un modelo base instructivo-generativo.
- Razonamiento matematico, presumiblemente reforzado por el dataset de 700.000 filas de trazas de matematicas.
- Generacion y resolucion de problemas de programacion competitiva, dado que las trazas de codigo competitivo forman parte explicita del post-entrenamiento.
- Capacidades multilingues: no disponibles como dato declarado; el autor no especifica reparto de idiomas ni evaluacion por idioma.
- Soporte de tool calling / function calling: no disponible ni confirmado en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo no declara modo de razonamiento explicito ni plantilla de agente.
- Capacidades especiales (vision, audio, modo thinking): no disponibles. Los tags del repositorio solo incluyen `safetensors`, `qwen3` y `region:us`.

## Casos de uso

- Evaluacion de tecnicas de SFT en matematicas: el checkpoint permite reproducir o comparar el efecto de un ajuste supervisado de 3 epocas sobre 700.000 filas de trazas matematicas, usando Qwen3-4B-Base como referencia cero.
- Investigacion en razonamiento paso a paso: las trazas de matematicas y programacion competitiva del dataset de entrenamiento hacen de este modelo un candidato para estudiar como se transfiere el razonamiento de tipo cadena de pensamiento a un modelo de 4.4B.
- Generacion de codigo en entornos de investigacion: puede utilizarse para resolver ejercicios de programacion competitiva y comparar la salida con la de modelos mayores, midiendo la degradacion por tamano.
- Base para una segunda etapa de SFT o preferencia: al ser un checkpoint intermedio, es adecuado como punto de partida para continuar el post-entrenamiento (SFT adicional, DPO o RL) en lugar de partir del modelo base.
- Destilacion y generacion de datos sinteticos: puede emplearse para producir trazas de solucion de problemas matematicos o de programacion que alimenten pipelines de generacion de datos, siempre que la licencia aplicable lo permita.
- Despliegue de bajo coste en laboratorio: con ~4.4B parametros y pesos de 16 bits, cabe en GPUs de gama alta para consumidor, lo que permite experimentar en una unica estacion de trabajo sin infraestructura de clúster.
- Pruebas de cuantizacion: aunque el autor no publica GGUF todavia, el modelo puede convertirse a GGUF o AWQ para medir la perdida de calidad en matematicas y codigo con 4 y 8 bits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye tablas de MMLU, HumanEval, GSM8K, MATH ni ninguna otra metrica, y no se han encontrado evaluaciones independientes del checkpoint en la busqueda web realizada.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 9-10 GB solo para pesos (4.41B x 2 bytes), mas cache KV y activaciones; con contexto largo el consumo puede superar los 14-16 GB.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 4,5-5,5 GB de pesos.
- VRAM estimada en cuantizacion de 4 bits (si se genera una version GGUF/AWQ, no publicada por el autor): en torno a 2,5-3,5 GB de pesos.
- GPUs recomendadas: A100 40/80 GB, H100, L40S o RTX A6000 para despliegue en precision completa con contexto amplio; RTX 4090, RTX 3090 o RTX 4080 para inferencia en bf16 con contexto moderado.
- Cabe en GPU de consumidor: si, en tarjetas con 12 GB o mas de VRAM para bf16 y contexto corto; en 8 GB solo mediante cuantizacion de 4 bits, que el autor aun no ha publicado.
- Opciones de despliegue: vLLM, HuggingFace Transformers, TGI o SGLang con los pesos safetensors; llama.cpp y Ollama requeririan convertir previamente el modelo a GGUF, conversion no facilitada por el autor.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo ni de latencia por peticion para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| TouristGPT-SFT-Stage1 | 4,41B | No disponible | No disponible | safetensors unicamente | Checkpoint intermedio de SFT sobre matematicas y codigo competitivo |
| Qwen/Qwen3-4B-Base | ~4,0B (nominal) | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Pesos abiertos en HuggingFace | Modelo base del que deriva TouristGPT; sin SFT especifico de matematicas |
| Qwen/Qwen3-4B-Instruct-2507 | ~4,0B | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Pesos abiertos en HuggingFace | Alternativa instructiva de la misma familia y tamano; incluye ajuste de instrucciones y contexto largo |
| DeepSeek-R1-Distill-Qwen-7B | ~7,6B | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Pesos abiertos en HuggingFace | Referencia habitual en razonamiento matematico destilado, con el doble de parametros |

No hay datos de rendimiento publicados para TouristGPT-SFT-Stage1, por lo que la comparacion se limita a parametros, formato y disponibilidad. Las cifras de los modelos alternativos son datos publicos de sus respectivos repositorios y no proceden de la informacion proporcionada para este modelo.

## Limitaciones y advertencias

- Es un checkpoint intermedio, no un modelo final: el autor anuncia explicitamente futuros checkpoints y versiones GGUF solo para el modelo definitivo.
- Ausencia total de benchmark: no hay ninguna metrica publicada que permita estimar su calidad real en matematicas, codigo o lenguaje general.
- Licencia no declarada: sin licencia explicita en el repositorio, el uso comercial es juridicamente incierto y queda sujeto a los terminos del modelo base Qwen3-4B-Base, que el autor no reproduce.
- Idiomas no declarados: se desconoce el comportamiento fuera del ingles y del chino habituales en los datos de Qwen3, y no hay evaluacion multilingue.
- Sesgo de dominio: el post-entrenamiento se limita a matematicas y programacion competitiva (700.000 filas, 3 epocas), lo que puede degradar el rendimiento en tareas generales de conversacion, redaccion o conocimiento factual respecto al modelo base (olvido catastrofico).
- Riesgo de alucinacion: no mitigado ni documentado; no se declara uso de RLHF, DPO ni verificacion factual.
- Sin soporte confirmado de tool calling ni de agentes, lo que limita su integracion en pipelines que requieran llamadas a funciones o razonamiento multi-paso con herramientas.
- Contexto no documentado: si se asume el contexto nativo de Qwen3-4B-Base, el uso con ventanas muy largas requeriria configuracion adicional (por ejemplo, escalado tipo YaRN) no descrita por el autor.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin validacion por parte de la comunidad.
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los enlaces recuperados correspondian a contenidos no relacionados (articulos sobre impresoras y navegadores), por lo que no aportan informacion verificable.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/touristgpt/TouristGPT-SFT-Stage1
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Base
- No se han encontrado papers, blogs, repositorios auxiliares ni demos asociados a este checkpoint en la busqueda web realizada.
