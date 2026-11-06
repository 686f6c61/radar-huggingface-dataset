# TeamIDE/Qwen3.6-35B-A3B-Pantheon-K80

## Resumen

Qwen3.6-35B-A3B-Pantheon-K80 es una distribucion de cuantizaciones GGUF del modelo Qwen3.6-35B-A3B, publicado por el equipo TeamIDE dentro de su proyecto Pantheon Local, orientado a ejecutar modelos de lenguaje en hardware legacy. El modelo base lo desarrolla el equipo Qwen de Alibaba Cloud y sigue una arquitectura de mezcla de expertos (MoE) con 35.505.251.456 parametros totales y aproximadamente 3.000 millones de parametros activos por token, segun la nomenclatura A3B del identificador.

El repositorio no contiene pesos nuevos en sentido estricto: redistribuye una cuantizacion Q3_K_M sin modificar de bartowski y anade una cuantizacion Q8_0 propia generada con `llama-quantize` a partir de los pesos BF16 originales, en la que se injerta la capa MTP (multi-token prediction) procedente del GGUF de bartowski para habilitar decodificacion especulativa en Pantheon. Su relevancia es acotada pero concreta: demuestra que un MoE de 35.000 millones de parametros puede servirse en GPUs Tesla K80 mediante cuatro tarjetas repartidas en dos placas, con tasas de decodificacion medidas y verificadas.

La licencia es Apache 2.0, heredada del modelo original, lo que permite uso comercial sin restricciones adicionales. El repositorio ocupa 54,9 GB y acumula 45 descargas en el momento de la consulta, con fecha de creacion del 27 de octubre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) transformer, segun nomenclatura A3B del modelo base; detalles internos no disponibles |
| Parametros totales | 35.505.251.456 |
| Parametros activos | Aproximadamente 3.000 millones (inferido del identificador A3B; no confirmado en la informacion disponible) |
| Longitud de contexto | Hasta 32k verificado en las mediciones del autor; maximo oficial no disponible |
| Tipos de cuantizacion | Q3_K_M y Q8_0 (GGUF) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (tambien existen pesos BF16 originales en el modelo base) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B emplea una arquitectura de mezcla de expertos con 35.505 millones de parametros totales y un subconjunto activo de aproximadamente 3.000 millones por token, lo que reduce el coste computacional por paso de decodificacion a costa de mantener una huella de memoria completa. La informacion proporcionada no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; estos datos deben consultarse en la model card del modelo base.

La innovacion tecnica destacable de esta distribucion es la capa MTP (multi-token prediction), incluida en ambos ficheros GGUF y utilizada por Pantheon para decodificacion especulativa. En el caso del Q8_0, el autor genero la cuantizacion a partir de los pesos BF16, que carecian de cabeza MTP, e injerto la capa `blk.40.*` en Q8_0 tomada del GGUF de bartowski, verificando byte a byte los 753 tensores contra su origen. En esta cuantizacion, todos los pesos bidimensionales son Q8_0 mientras que los enrutadores de expertos y los tensores unidimensionales permanecen en BF16/F32. La salida en modo greedy coincide con la referencia en CPU, lo que aporta una garantia de fidelidad de la cuantizacion.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` del repositorio confirma el ajuste para dialogos multi-turno.
- Razonamiento y generacion de codigo: capacidades heredadas del modelo base Qwen3.6-35B-A3B; no se detallan en la informacion disponible.
- Decodificacion especulativa mediante capa MTP, que acelera la generacion al predecir varios tokens por paso.
- Soporte de contexto largo verificado hasta 32k tokens en las pruebas del autor.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere integracion con APIs de inferencia estandar.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling, function calling y uso como agente: no confirmados en la informacion disponible.

## Casos de uso

- Despliegue en infraestructura legacy con GPUs Tesla K80: el caso de uso central del repositorio. Permite servir un MoE de 35.000 millones de parametros en cuatro K80 repartidas en dos placas usando el fichero Q8_0, o en una sola placa con el Q3_K_M, aprovechando hardware de segunda mano con 24 GB de VRAM por tarjeta.
- Laboratorios de investigacion con presupuesto limitado: la cuantizacion Q3_K_M sin modificar de bartowski permite experimentar con un modelo de gran escala en una unica placa de dos GPUs, con 24,5 tok/s a 8k de contexto, suficiente para tareas de evaluacion no interactivas.
- Procesamiento por lotes de documentos largos: con contexto verificado de 32k tokens y 13,6 tok/s en Q3_K_M, resulta viable resumir o extraer informacion de documentos extensos en pipelines offline donde la latencia no es critica.
- Generacion asistida en entornos air-gapped: al ser pesos GGUF autocontenidos y con licencia Apache 2.0, el modelo puede desplegarse en infraestructura aislada sin dependencias de servicios externos, usando llama.cpp o Pantheon.
- Reproduccion y validacion de cuantizaciones: el repositorio documenta el proceso de injerto de la capa MTP con verificacion byte a byte de 753 tensores, lo que lo convierte en una referencia util para ingenieros que trabajen en tecnicas de cuantizacion y decodificacion especulativa.
- Prototipado de asistentes conversacionales de bajo coste: el tag `conversational` y la compatibilidad con endpoints permiten montar un servicio de chat interno sobre hardware K80 amortizado, aceptando un tiempo hasta el primer token de 51 segundos para prompts de 8.444 tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor unicamente reporta mediciones de velocidad de inferencia:

| Metrica | Q8_0 (4 K80, 2 placas) | Q3_K_M (2 K80, 1 placa) |
|---|---|---|
| Decodificacion a 8k contexto | 21,3 / 19,1 tok/s (greedy / temp. 0,7) | 24,5 tok/s (greedy) |
| Decodificacion a 14k contexto | 22,0 / 20,9 tok/s | 19,7 tok/s |
| Decodificacion a 32k contexto | 13,8 / 13,4 tok/s | 13,6 tok/s |
| Time to first token (prompt de 8.444 tokens) | 51 s | No disponible |

El fichero Q8_0 ocupa 37.801.097.248 bytes con sha256 `0bd4666292101b41b1965008814f0948c1a6a7e0bd7187e7a12ce6dd1d16212e`. Las mediciones se realizaron con MTP activado y un unico usuario.

## Requisitos de hardware

- VRAM estimada: el Q8_0 requiere aproximadamente 37,8 GB solo para pesos, por lo que necesita cuatro Tesla K80 (24 GB cada una) en dos placas; el Q3_K_M cabe en dos K80 en una sola placa.
- GPUs recomendadas: NVIDIA Tesla K80 como objetivo declarado; el modelo base BF16 requiere hardware mas moderno (A100, H100) para inferencia sin cuantizar.
- Cabe en GPU de consumo: no disponible en la informacion proporcionada; el tamano del Q8_0 excede la VRAM de cualquier GPU consumer individual actual.
- Opciones de despliegue: Pantheon Local (entorno objetivo), llama.cpp como generador de las cuantizaciones y bartowski GGUF como origen del Q3_K_M y de la capa MTP. Soporte de vLLM, Ollama o TGI no confirmado.
- Latencia y throughput: 21,3 tok/s de decodificacion en Q8_0 a 8k de contexto y 51 s de time to first token para 8.444 tokens; en Q3_K_M, 24,5 tok/s a 8k. El rendimiento cae a aproximadamente 13,5 tok/s a 32k de contexto en ambas cuantizaciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizaciones | Licencia | Enfoque |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-Pantheon-K80 | 35,5B totales / ~3B activos | 32k verificado | Q3_K_M, Q8_0 | Apache 2.0 | Hardware legacy K80 |
| Qwen/Qwen3.6-35B-A3B (base) | 35,5B totales / ~3B activos | No disponible | BF16 | Apache 2.0 | Modelo original |
| bartowski/Qwen_Qwen3.6-35B-A3B-GGUF | 35,5B totales / ~3B activos | No disponible | Multiples GGUF (incluye Q3_K_M) | Apache 2.0 | Cuantizaciones generales |

La comparativa se limita al ecosistema del propio modelo base, ya que la informacion proporcionada no incluye datos de rendimiento de alternativas de otros desarrolladores. La diferencia practica entre las tres opciones es el publico objetivo: el repositorio de TeamIDE anade una cuantizacion Q8_0 con MTP injertado y mediciones especificas para K80, mientras que bartowski ofrece un catalogo mas amplio de cuantizaciones sin optimizacion para ese hardware.

## Limitaciones y advertencias

- El repositorio no aporta datos de benchmarks de calidad; no es posible evaluar su rendimiento en tareas de razonamiento, codigo o matematicas a partir de esta ficha.
- Las tasas de decodificacion reportadas corresponden a un unico usuario y a hardware K80; el throughput agregado con concurrencia no esta medido y probablemente sea bajo.
- El time to first token de 51 segundos para prompts de 8.444 tokens hace inviable el uso interactivo con contextos largos en K80.
- El fichero Q8_0 es una forma modificada de los pesos originales: la capa MTP procede de una fuente distinta (bartowski) y se ha injertado manualmente, aunque el autor documenta verificacion byte a byte de los 753 tensores.
- El Q3_K_M es una redistribucion sin modificar de bartowski; la calidad de la cuantizacion de 3 bits puede degradar tareas sensibles a precision, aunque no se aportan mediciones al respecto.
- No se detallan sesgos conocidos, idiomas soportados ni riesgos de alucinacion especificos; deben consultarse en la model card del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero el autor recuerda que los derechos del modelo subyacente pertenecen al equipo Qwen de Alibaba Cloud.
- La fecha de creacion del repositorio (octubre de 2026) y el bajo numero de descargas (45) implican una validacion comunitaria escasa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/TeamIDE/Qwen3.6-35B-A3B-Pantheon-K80
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
- GGUF de bartowski: https://huggingface.co/bartowski/Qwen_Qwen3.6-35B-A3B-GGUF
- Perfil de bartowski: https://huggingface.co/bartowski
- Proyecto Pantheon: https://git.teamidev/David/Pantheon
