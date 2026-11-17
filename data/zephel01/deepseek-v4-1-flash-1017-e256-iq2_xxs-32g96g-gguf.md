# zephel01/DeepSeek-V4.1-Flash-1017-E256-IQ2_XXS-32G96G-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017 E256-IQ2_XXS es una compilación GGUF cuantizada y podada del modelo base `deepseek-ai/DeepSeek-V4.1-Flash-1017` (licencia MIT), publicada por el usuario zephel01. Se trata de una versión orientada a hardware de consumo: un PC con GPU de 32 GB de VRAM y 96 GB de RAM, o alternativamente 12 GB de VRAM y 128 GB de RAM. El autor ha eliminado 128 de los 384 expertos por capa (se conservan 256), seleccionados mediante medición de routing sobre texto de chat, matemáticas, tool-calling, código y multilingüe, con el objetivo de reducir el peso de 275,8 GB a 207,1 GB sin degradar en exceso las capacidades generales.

La arquitectura subyacente es un transformer con mezcla de expertos (MoE), con 567.274.486.384 parámetros totales según los safetensors del modelo base. La cuantización combina varios tipos (IQ2_XXS 45%, IQ1_S 30%, IQ2_XS 14%, IQ2_S 11% por bytes), con una media de 1,95 bits por peso. La tabla Engram se re-cuantiza a IQ4_NL y se lee desde SSD por filas, de modo que no necesita caber en RAM.

El interés de esta ficha radica en que demuestra la viabilidad de ejecutar un modelo MoE de gran tamaño en hardware de consumo mediante poda selectiva de expertos y cuantización agresiva, con un rendimiento medido de 87,0 tok/s en decodificación sobre una RTX 5090. Es una build BETA, medida en un único equipo, y el propio autor advierte de que la selección de expertos está optimizada para seis dominios concretos y puede degradar otros idiomas o dominios raros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); 384 expertos por capa en el modelo base, 256 conservados en esta build |
| Parametros totales | 567.274.486.384 (modelo base, safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mezcla de IQ2_XXS (45%), IQ1_S (30%), IQ2_XS (14%), IQ2_S (11%) por bytes; media de 1,95 bits por peso; tabla Engram en IQ4_NL |
| Idiomas soportados | Inglés y japonés (según tags de la model card); el autor indica que la poda preserva rutas de japonés, chino, inglés, código, matemáticas y tool-calls |
| Licencia | MIT |
| Formato de pesos | GGUF (6 shards; apuntar el motor a `-00001-of-00006.gguf`) |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (MoE) de 567.274.486.384 parámetros totales. Esta build no re-entrena ni re-cuantiza los expertos: parte de la cuantización LDLQ 132G del autor y recorta byte a byte los expertos conservados por capa (`expert_count` = 256), manteniendo routers y sesgos de router originales. La selección de qué expertos se conservan varía por capa y se determinó midiendo el routing real sobre texto de seis dominios (japonés, chino, inglés, código, matemáticas y tool-calls), con el mismo peso para cada dominio. Las rutas conservadas son: japonés 95%, chino 94%, matemáticas 94%, tools 94%, inglés 91% y código 84%.

La tabla Engram se re-cuantizó a IQ4_NL desde la tabla FP8 de la versión UD-Q4_K_XL de unsloth, con un error RMS relativo de 0,075 (frente a 0,076 de la tabla IQ4_NL de ISTA sobre las mismas filas). Esta tabla se lee desde SSD unas pocas filas a la vez y no requiere residir en RAM. El autor no documenta en esta ficha el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO en el modelo base; esos datos corresponden a la model card de `deepseek-ai/DeepSeek-V4.1-Flash-1017` y no se incluyen en la información proporcionada.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y japonés.
- Razonamiento y matemáticas: la poda preserva el 94% de las rutas de matemáticas.
- Generación de código: se conserva el 84% de las rutas de código, ligeramente por encima del 82% de la selección code-only de ISTA.
- Tool calling / function calling: se conserva el 94% de las rutas de tools.
- Capacidades multilingües limitadas a los dominios medidos: japonés, chino e inglés; otros idiomas pueden degradarse más.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente en la información disponible.
- Capacidad de visión: el modelo base parece soportar entrada de imagen (el autor menciona "image input" como caso a evitar con esta poda), pero esta build no está validada para visión.
- Ejecución en hardware de consumo mediante offload de CPU y lectura de la tabla Engram desde SSD.

## Casos de uso

- Chat general en japonés, chino e inglés: la selección JA256 conserva el 95% de las rutas de japonés y el 91% de inglés, por lo que es adecuada para asistentes conversacionales en esos idiomas sobre un PC con 32 GB de VRAM y 96 GB de RAM.
- Asistencia de código en producción: conserva el 84% de las rutas de código y soporta tool calling, lo que permite integrarla en pipelines de generación y revisión de código donde el hardware es limitado; para trabajo de código intensivo el autor recomienda las builds sin podar.
- Automatización con tool calling: el 94% de rutas de tools conservadas permite construir agentes que invocan APIs y funciones externas, con la advertencia de que el razonamiento largo puede desviarse más por el mayor KL.
- Razonamiento matemático y resolución de problemas: útil para tutores o asistentes de cálculo en entornos con GPU de consumo, dado que se preserva el 94% de las rutas de matemáticas.
- Despliegue local en estaciones de trabajo con RTX 5090: el rendimiento medido de 87,0 tok/s en decodificación sobre tres tareas de código lo hace viable para uso interactivo local.
- Prototipado e investigación sobre MoE podados: sirve como referencia para estudiar el impacto de la poda selectiva de expertos comparando KL, coincidencia de top token y velocidad frente a las builds completas.
- Escenarios con VRAM muy limitada (12 GB) y 128 GB de RAM: el autor indica que esta build también está pensada para ese perfil mediante offload a CPU.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (medidos en un único PC: RTX 5090 de 32 GB con el tier de RAM limitado a 60 GB mediante `STRATA_GLM_RAM_GB=60`):

| Modelo | Expertos por capa | Descarga | KL (8 seqs) | Mismo top token | Decodificación, 3 tareas de código | Japonés |
|---|---:|---:|---:|---:|---:|---|
| JA256 (esta build) | 256 / 384 | 207,1 GB | 0,383 | 75,2% | 87,0 tok/s | OK |
| LDLQ 132G | 384 / 384 | 275,8 GB | 0,194 | 81,1% | 67,5 tok/s | OK |
| LDLQ 139G | 384 / 384 | 283,0 GB | 0,182 | 81,6% | 57,9 tok/s | OK |
| ISTA GSQ-RCO Coder (referencia) | 192 / 384 | 182,7 GB | 0,582 | 69,3% | 97,0 tok/s | Chino |
| ISTA GSQ-RCO IQ2_XXS (referencia) | 384 / 384 | ~249 GB | 0,314 | 76,8% | no disponible | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 32 GB de VRAM con 96 GB de RAM, o 12 GB de VRAM con 128 GB de RAM (perfiles objetivo declarados por el autor).
- GPU recomendada: RTX 5090 de 32 GB (único hardware en el que se han medido los resultados).
- Cabe en GPU de consumo: sí, en RTX 5090 (32 GB); el perfil de 12 GB + 128 GB implica offload mayor a CPU.
- Despliegue: motor Abyss del propio autor y llama.cpp; el formato es GGUF de 6 shards.
- Almacenamiento: descarga de 207,1 GB; la tabla Engram (110,6 GB en IQ4_NL) se lee desde SSD, por lo que se recomienda SSD rápido.
- Latencia y throughput: 87,0 tok/s en decodificación sobre tres tareas de código en RTX 5090 con RAM limitada a 60 GB; no hay datos de prefill ni de otros hardware.

## Comparativa con modelos similares

| Modelo | Parámetros / expertos | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Esta build (JA256) | 567,3 B totales; 256/384 expertos | no disponible | MIT | GGUF, 207,1 GB | Poda generalista; 87,0 tok/s; japonés funcional |
| LDLQ 132G (mismo autor) | 567,3 B totales; 384/384 expertos | no disponible | MIT | GGUF, 275,8 GB | Sin poda; KL 0,194; 67,5 tok/s |
| ISTA GSQ-RCO Coder | 567,3 B totales; 192/384 expertos | no disponible | no disponible | GGUF, 182,7 GB | Selección code-only; 97,0 tok/s; falla en japonés |
| ISTA GSQ-RCO IQ2_XXS | 567,3 B totales; 384/384 expertos | no disponible | no disponible | GGUF, ~249 GB | Sin poda; KL 0,314 |

## Limitaciones y advertencias

- Build BETA medida en un único PC (RTX 5090, RAM limitada a 60 GB); el rendimiento en otros equipos no está verificado.
- La poda elimina 128 de 384 expertos por capa: el texto de los seis dominios medidos pierde entre un 5% y un 16% de sus rutas hacia los siguientes mejores expertos.
- Dominios fuera de los seis medidos (otros idiomas como coreano o lenguas europeas, conocimiento raro, entrada de imagen) pueden degradarse más; el autor recomienda las builds sin podar para esos casos.
- KL más alto (0,383) que las builds completas (0,182-0,194), lo que implica mayor deriva en trabajos largos y cuidadosos.
- Riesgo de alucinación: no cuantificado en la información disponible, pero el aumento de KL y la pérdida de rutas sugieren mayor probabilidad de errores en tareas exigentes.
- Sesgos conocidos: no documentados en la información proporcionada.
- Licencia MIT, lo que permite uso comercial; sin embargo, la licencia del modelo base y de las dependencias debe verificarse por separado.
- El nombre del quant en el repositorio no corresponde a un tipo estándar de llama.cpp: los archivos mezclan varios tipos, por lo que no debe tratarse como un quant homogéneo.
- La tabla Engram requiere acceso a SSD; un almacenamiento lento puede degradar la latencia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zephel01/DeepSeek-V4.1-Flash-1017-E256-IQ2_XXS-32G96G-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Build sin podar LDLQ 132G/139G: https://huggingface.co/zephel01/DeepSeek-V4.1-Flash-1017-IQ2_XXS-32G96G-GGUF
- Motor Abyss: https://github.com/zephel01/Abyss
- trench-gguf: https://github.com/zephel01/trench-gguf
- Referencia ISTA-DASLab GSQ-RCO Coder: https://huggingface.co/ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-Coder-GGUF
- Formulario para reportar resultados: https://github.com/zephel01/Abyss/issues/new?template=bench.md&title=Bench:+DeepSeek-V4.1+Compact-JA256+on+YOUR_GPU
