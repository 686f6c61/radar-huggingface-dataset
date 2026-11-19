# zephel01/DeepSeek-V4-Flash-0731-16G64G-GGUF

## Resumen

DeepSeek-V4-Flash-0731 es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por DeepSeek, publicado bajo licencia MIT. Esta ficha concreta no es el modelo original, sino una cuantizacion GGUF extrema realizada por el usuario zephel01, orientada a ejecutar el modelo completo en un PC con una GPU de 16 GB de VRAM y 64 GB de RAM. El archivo resultante ocupa 61,7 GB y conserva los 256 expertos en todas las capas, sin poda.

La cuantizacion emplea una mezcla de tipos: los expertos enrutados gate/up se cuantizan en IQ1_S y los down en IQ1_M, con un promedio de 1,62 bits por peso, mientras que las proyecciones de atencion se mantienen en Q5_K. El resto de tensores conserva los bytes del UD-Q2_K_XL de Unsloth. El autor reporta 84,5 tok/s en una RTX 5090 limitada a 16 GB de VRAM y a la cuota de RAM de un equipo de 64 GB, frente a 21,3 tok/s del UD-Q2_K_XL en las mismas condiciones.

El interes de esta publicacion es practico: demuestra que un MoE de gran tamano puede ejecutarse en hardware de consumo con una perdida de calidad medible y acotada, a costa de una fidelidad inferior respecto al cuantizado de referencia. La model card la marca explicitamente como BETA y advierte de que las mediciones se hicieron sobre una GPU limitada por software, no sobre una tarjeta de 16 GB real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), transformer; numero de capas y dimensiones no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (se han verificado pruebas de aguja en 8K y 31K) |
| Tipos de cuantizacion | Mezcla: IQ1_S (expertos gate/up), IQ1_M (expertos down), Q5_K (attn_q_b, attn_output_a, attn_output_b), UD-Q2_K_XL (resto); 1,62 bits por peso de media |
| Idiomas soportados | Ingles y japones (segun metadatos); el modelo base puede tener mas, no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (3 shards, 61,7 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura Mixture of Experts de 256 expertos enrutados por capa, todos ellos conservados en esta cuantizacion. La model card no detalla el numero de capas, la dimension oculta, el numero de expertos activos por token ni el volumen de datos de entrenamiento del modelo original; esa informacion corresponde a la model card de deepseek-ai/DeepSeek-V4-Flash-0731, que no se ha proporcionado.

El proceso de cuantizacion si esta documentado: los expertos se recuantizaron con LDLQ a partir del UD-Q8_K_XL de Unsloth (expertos originales en MXFP4), usando un volcado de Hessian generado con respuestas de chat del propio V4 (241 prompts, 104 en japones) mas texto general, y una imatrix propia. El primer shard (solo metadatos, 5 MB) se copia tal cual del archivo de Unsloth, por lo que su campo `general.quantized_by` sigue indicando Unsloth. El autor menciona tambien un drafter DSpark de decodificacion especulativa (~6,5 GB de VRAM) que no recomienda a 16 GB y que no se ha medido en este tamano.

## Capacidades

- Generacion de texto conversacional multi-turno; se han validado conversaciones de 11 turnos.
- Razonamiento y respuesta a preguntas factuales; en las pruebas del autor, cero errores factuales en 10 respuestas en japones.
- Generacion de codigo; supera 5 de 5 tareas de programacion con tests.
- Tool calling / function calling; validado dentro del conjunto de comprobaciones `--check`.
- Recuperacion de informacion en contexto largo; aguja encontrada en 8K y probada hasta 31K.
- Capacidades multilingues limitadas a ingles y japones segun los metadatos del repositorio.
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito en la informacion disponible.

## Casos de uso

- Asistente de codigo en local: el modelo resuelve tareas de programacion con tests (5 de 5 en las pruebas del autor) y puede integrarse en un flujo de trabajo de escritorio sin enviar codigo a la nube, algo relevante para entornos con requisitos de confidencialidad.
- Chat de atencion al cliente en japones: las pruebas reportan 9 de 10 respuestas que se mantienen en japones y cero errores factuales, lo que lo hace util para soporte en ese idioma sobre hardware de consumo.
- Procesamiento de documentos largos: con recuperacion verificada en 8K y pruebas hasta 31K, sirve para resumir o extraer datos de informes extensos en una sola pasada.
- Automatizacion con tool calling: la validacion de llamadas a funciones permite conectarlo a APIs internas, bases de datos o sistemas de tickets en un pipeline de agentes.
- Laboratorio de investigacion en cuantizacion: el repositorio incluye dumps de Hessian, imatrix y metricas KL, lo que lo convierte en un caso de estudio reproducible para estudiar el impacto de cuantizaciones sub-2 bits en MoE.
- Despliegue offline en estaciones de trabajo: al caber en 16 GB de VRAM mas 64 GB de RAM, es viable en equipos sin acceso a internet o con GPU de gama media-alta (RTX 5060 Ti 16 GB, RTX 4080, RX 9070 XT).
- Prototipado de bajo coste: permite evaluar el comportamiento de un MoE grande antes de invertir en hardware con mas VRAM, usando las variantes L72 o L97 del mismo autor cuando se necesite mas calidad.

## Benchmarks y rendimiento

| Metrica | L62 (este repo) | UD-Q2_K_XL (referencia) |
|---|---:|---:|
| Tamano de descarga | 61,7 GB | 96,8 GB |
| KL (12 secuencias) | 0,407 | 0,186 |
| KL en japones (3 secuencias) | 0,435 | 0,219 |
| Mismo token top-1 | 73,7% | 81,5% |
| Velocidad (RTX 5090 limitada a 16 GB VRAM + 64 GB RAM) | 84,5 tok/s | 21,3 tok/s |
| Abyss `--check` (11 pruebas) | 10/11 | 11/11 |
| Respuestas que se mantienen en japones | 9/10 | 9/10 |
| Errores factuales en esas respuestas | 0 | 0 |
| Tareas de codigo con tests | 5/5 | 5/5 |
| Aguja en 8K | encontrada | no reportado |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Las metricas KL se calcularon contra el UD-Q8_K_XL de Unsloth con 12 secuencias de 1.024 tokens (8 de texto en ingles, 1 de codigo y 3 en japones) usando el motor Abyss.

## Requisitos de hardware

- VRAM: 16 GB es el objetivo de diseno; el resto del modelo se descarga en RAM del sistema (64 GB).
- RAM: 64 GB como minimo para esta variante; el autor ofrece alternativas de 64 GB y 96 GB para configuraciones con mas VRAM.
- GPU objetivo segun el autor: RTX 5060 Ti 16 GB, RTX 4080, RX 9070 XT y similares con 16 GB de VRAM.
- Las mediciones se hicieron en una RTX 5090 artificialmente limitada a 16 GB de VRAM y a la cuota de RAM de un equipo de 64 GB; no se han verificado aun en una tarjeta de 16 GB real.
- Despliegue: motor Abyss v1.3.120 o superior, con scripts `setup-deepseek.sh` (Linux) y `setup-deepseek.bat` (Windows 11). llama.cpp no se ha comprobado todavia.
- Throughput reportado: 84,5 tok/s en las condiciones anteriores. Latencia no disponible.
- El drafter DSpark (~6,5 GB de VRAM) no se recomienda ni se ha medido en este tamano; el autor sugiere `--no-dspark`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano en disco | Licencia | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4-Flash-0731 L62 (este repo) | MoE, total no disponible | no disponible | 61,7 GB | MIT | 1,62 bits/peso, KL 0,407, 84,5 tok/s en 16G64G |
| DeepSeek-V4-Flash-0731 IQ2_XXS (L72) | MoE, total no disponible | no disponible | 72,0 GB | MIT | Requiere 32 GB de VRAM + 64 GB de RAM |
| DeepSeek-V4-Flash-0731 IQ2_M (L97) | MoE, total no disponible | no disponible | 96,8 GB | MIT | Requiere 32 GB de VRAM + 96 GB de RAM; mayor calidad |
| Unsloth UD-Q2_K_XL | MoE, total no disponible | no disponible | 96,8 GB | MIT | Referencia de calidad: KL 0,186, 21,3 tok/s en 16G64G |

No se dispone de datos de modelos de otros desarrolladores con los que comparar en la informacion proporcionada.

## Limitaciones y advertencias

- Cuantizacion sub-2 bits: 1,62 bits por peso de media implica una perdida de fidelidad notable (KL 0,407 frente a 0,186 del UD-Q2_K_XL) y solo un 73,7% de coincidencia en el token top-1.
- Estado BETA: medido en una sola maquina y con limites simulados por software; el autor advierte de que el archivo puede sustituirse por una compilacion mejor.
- Riesgo de alucinacion: aunque las pruebas del autor no detectaron errores factuales en 10 respuestas, la muestra es muy reducida y la cuantizacion extrema puede degradar la fiabilidad en dominios especializados.
- Idiomas: los metadatos solo declaran ingles y japones; el rendimiento en castellano u otros idiomas no esta verificado y podria ser deficiente.
- Contexto: no se publica la longitud maxima soportada; las pruebas de aguja llegan a 31K, pero no se garantiza un comportamiento correcto mas alla.
- Una de las 11 pruebas de `--check` fallo (una explicacion en japones), lo que sugiere degradacion en tareas de instruccion complejas.
- Compatibilidad: solo verificado con el motor Abyss; llama.cpp no se ha probado.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantias sobre la calidad del cuantizado; conviene validar el modelo en el dominio concreto antes de produccion.
- El primer shard conserva metadatos de Unsloth (`general.quantized_by`), lo que puede confundir en auditorias de procedencia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zephel01/DeepSeek-V4-Flash-0731-16G64G-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Motor Abyss: https://github.com/zephel01/Abyss
- Variante 32G64G (L72): https://huggingface.co/zephel01/DeepSeek-V4-Flash-0731-IQ2_XXS-32G64G-GGUF
- Variante 32G96G (L97): https://huggingface.co/zephel01/DeepSeek-V4-Flash-0731-IQ2_M-32G96G-GGUF
- Variante DGX Spark: https://huggingface.co/zephel01/DeepSeek-V4-Flash-0731-DGX-Spark-GGUF
- Envio de resultados de benchmark: https://github.com/zephel01/Abyss/issues/new?template=bench.md&title=Bench:+DeepSeek-V4-Flash-0731+16G64G+L62+on+YOUR_GPU
