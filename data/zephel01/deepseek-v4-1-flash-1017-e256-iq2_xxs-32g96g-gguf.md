# zephel01/DeepSeek-V4.1-Flash-1017-E256-IQ2_XXS-32G96G-GGUF

## Resumen
DeepSeek-V4.1-Flash-1017 E256-IQ2_XXS es una cuantizacion GGUF podada del modelo base DeepSeek-V4.1-Flash-1017 (MIT) de DeepSeek, publicada por el usuario zephel01. Se trata de una build de proposito general que conserva 256 de los 384 expertos por capa de un modelo de arquitectura MoE, seleccionados mediante conteo de routing medido sobre texto de chat, matematicas, tool-calling, codigo y contenido multilingue. El resultado ocupa 207,1 GB frente a los 275,8 GB de la version sin podar, lo que permite ejecutarlo en un PC con GPU de 32 GB de VRAM y 96 GB de RAM, o incluso en configuraciones de 12 GB de VRAM y 128 GB de RAM con offload a CPU.

El modelo base tiene 567.274.486.384 parametros totales segun los safetensors del repositorio original, lo que lo situa en la categoria de modelos frontera open source. La cuantizacion emplea una mezcla de tipos (IQ2_XXS al 45%, IQ1_S al 30%, IQ2_XS al 14% e IQ2_S al 11% en bytes), con un promedio de 1,95 bits por peso, y una tabla Engram re-cuantizada a IQ4_NL que se lee desde SSD por filas.

Su relevancia actual radica en que demuestra que es posible ejecutar un MoE de mas de 500.000 millones de parametros en hardware de consumo mediante poda selectiva de expertos guiada por routing, manteniendo capacidades en japones, chino, ingles, codigo, matematicas y tool calls, aunque con un incremento medible de la divergencia respecto al modelo original (KL de 0,383 frente a 0,194 del LDLQ sin podar).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) transformer, 384 expertos por capa en el modelo base, 256 conservados en esta build |
| Parametros totales | 567.274.486.384 (modelo base); el GGUF podado conserva 256/384 expertos por capa |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mezcla: IQ2_XXS 45%, IQ1_S 30%, IQ2_XS 14%, IQ2_S 11% (por bytes); promedio 1,95 bits/peso; tabla Engram en IQ4_NL |
| Idiomas soportados | Ingles (en), japones (ja) declarados; el modelo base soporta mas idiomas segun el autor (chino, coreano, europeos) pero no se detallan |
| Licencia | MIT |
| Formato de pesos | GGUF (6 shards: 5 de densos + expertos, 1 de tabla Engram) |

## Arquitectura y entrenamiento
El modelo base es un transformer con arquitectura Mixture of Experts de 384 expertos por capa. Esta build concreta no re-entrena ni re-cuantiza los expertos: parte de la cuantizacion LDLQ 132G del mismo autor y realiza un slicing byte a byte para conservar 256 expertos por capa, seleccionados segun el routing medido sobre seis dominios ponderados por igual (japones, chino, ingles, codigo, matematicas y tool-calls). Los routers y sesgos de router se mantienen intactos del LDLQ 132G.

La tabla Engram, que en el modelo original esta en FP8, se re-cuantizo a IQ4_NL desde la version UD-Q4_K_XL de unsloth, con un error RMS relativo de 0,075 (frente a 0,076 de la tabla IQ4_NL de ISTA en las mismas filas). Esta tabla se lee desde SSD unas pocas filas a la vez y no necesita caber en RAM. No se dispone de informacion sobre el numero de tokens de entrenamiento, composicion del dataset ni tecnicas de alineacion (RLHF/DPO) del modelo base en la informacion proporcionada.

## Capacidades
- Generacion de texto general en japones, chino e ingles, con rutas conservadas del 95%, 94% y 91% respectivamente.
- Razonamiento matematico: conserva el 94% de las rutas de texto matematico.
- Tool calling / function calling: conserva el 94% de las rutas de tool-calls.
- Generacion de codigo: conserva el 84% de las rutas de codigo (comparable al 82% de la seleccion Coder de ISTA).
- Capacidades multilingues limitadas a los dominios medidos; otros idiomas (coreano, europeos) pueden degradarse mas alla del 5-16% de perdida de rutas.
- Ejecucion en llama.cpp y en el motor Abyss del mismo autor.
- Soporte de offload a CPU con particion configurable de RAM (variable STRATA_GLM_RAM_GB).
- No se declara soporte de vision en esta build (la seleccion de expertos no incluyo datos de imagen).

## Casos de uso
- Chat multilingue en local: el modelo mantiene japones, chino e ingles con perdida de rutas inferior al 10%, adecuado para asistentes conversacionales en un PC de 32 GB de VRAM y 96 GB de RAM.
- Generacion de codigo en produccion: conserva el 84% de las rutas de codigo y soporta tool calling, por lo que puede integrarse en pipelines de CI/CD o asistentes de IDE con llama.cpp como backend.
- Razonamiento matematico asistido: con el 94% de rutas matematicas preservadas, sirve para resolver problemas paso a paso y verificar calculos en entornos sin conexion.
- Agentes con tool calling: la preservacion del 94% de rutas de herramientas permite construir agentes multi-paso que invocan APIs y funciones externas.
- Despliegue en estaciones de trabajo con GPU de consumo: la configuracion 12 GB VRAM + 128 GB RAM amplia el acceso a equipos con RTX 3060/4070 y memoria del sistema abundante.
- Procesamiento por lotes en CPU con offload: al leer la tabla Engram desde SSD y permitir cap de RAM, es viable para tareas de generacion por lotes en servidores sin GPU dedicada.
- Experimentacion e investigacion: util para estudiar el impacto de la poda de expertos en la calidad (KL de 0,383 frente a 0,194 del modelo sin podar) sin necesidad de infraestructura de datacenter.

## Benchmarks y rendimiento

| Metrica | JA256 (esta build) | LDLQ 132G | LDLQ 139G | ISTA GSQ-RCO Coder | ISTA IQ2_XXS |
|---|---:|---:|---:|---:|---:|
| Expertos por capa | 256/384 | 384/384 | 384/384 | 192/384 | 384/384 |
| Descarga | 207,1 GB | 275,8 GB | 283,0 GB | 182,7 GB | ~249 GB |
| KL (8 seqs) | 0,383 | 0,194 | 0,182 | 0,582 | 0,314 |
| Mismo token top | 75,2% | 81,1% | 81,6% | 69,3% | 76,8% |
| Decode, 3 tareas de codigo | 87,0 tok/s | 67,5 tok/s | 57,9 tok/s | 97,0 tok/s | no disponible |
| Japones | OK | OK | OK | Chino | no disponible |

Las cifras de velocidad se midieron en un unico PC con RTX 5090 de 32 GB y RAM limitada a 60 GB mediante STRATA_GLM_RAM_GB=60. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware
- VRAM estimada: 32 GB para la configuracion objetivo principal; 12 GB en la configuracion alternativa con 128 GB de RAM.
- RAM del sistema: 96 GB en la configuracion 32G96G; 128 GB en la configuracion 12G128G.
- Almacenamiento: 207,1 GB para los 6 shards, mas espacio para la tabla Engram que se lee desde SSD.
- GPU recomendadas: RTX 5090 (32 GB) como referencia medida; cualquier GPU con 32 GB de VRAM; configuraciones de 12 GB (RTX 3060 12 GB, RTX 4070) con 128 GB de RAM.
- Cabe en GPU de consumo: si, con las combinaciones VRAM+RAM indicadas.
- Opciones de despliegue: motor Abyss (github.com/zephel01/Abyss) y llama.cpp.
- Latencia y throughput: 87,0 tok/s en decode sobre tres tareas de codigo en RTX 5090 con RAM cap de 60 GB. Medicion unica, marcada como BETA por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Expertos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017 E256-IQ2_XXS (esta build) | 567,3 B (base) | 256/384 | no disponible | MIT | GGUF, 207,1 GB |
| DeepSeek-V4.1-Flash-1017 LDLQ 132G | 567,3 B (base) | 384/384 | no disponible | MIT | GGUF, 275,8 GB |
| ISTA GSQ-RCO Coder | no disponible | 192/384 | no disponible | no disponible | GGUF, 182,7 GB |
| ISTA GSQ-RCO IQ2_XXS | no disponible | 384/384 | no disponible | no disponible | GGUF, ~249 GB |

## Limitaciones y advertencias
- Version BETA: medida en un solo PC (RTX 5090 32 GB, RAM cap de 60 GB); el rendimiento en otras GPU o tamanos de RAM no esta verificado.
- Poda de 128 de 384 expertos por capa: el texto en los seis dominios medidos pierde entre el 5% y el 16% de sus rutas hacia los siguientes mejores expertos.
- Dominios fuera de los seis medidos (otros idiomas, conocimiento raro, entrada de imagen) pueden degradarse mas y no fueron contabilizados.
- Mayor divergencia respecto al modelo original: KL de 0,383 frente a 0,194 del LDLQ 132G, por lo que trabajos largos y cuidadosos derivan mas.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; el autor recomienda las versiones sin podar para razonamiento largo y conocimiento raro.
- Idiomas declarados solo en ingles y japones; el rendimiento en coreano, lenguas europeas u otras no esta medido.
- Licencia MIT permite uso comercial, pero se heredan las limitaciones del modelo base DeepSeek-V4.1-Flash-1017.
- La tabla Engram requiere lectura desde SSD, lo que introduce dependencia de la velocidad del almacenamiento.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/zephel01/DeepSeek-V4.1-Flash-1017-E256-IQ2_XXS-32G96G-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Version sin podar LDLQ 132G/139G: https://huggingface.co/zephel01/DeepSeek-V4.1-Flash-1017-IQ2_XXS-32G96G-GGUF
- Motor Abyss: https://github.com/zephel01/Abyss
- trench-gguf: https://github.com/zephel01/trench-gguf
- ISTA-DASLab GSQ-RCO Coder: https://huggingface.co/ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-Coder-GGUF
- Envio de resultados de benchmark: https://github.com/zephel01/Abyss/issues/new?template=bench.md&title=Bench:+DeepSeek-V4.1+Compact-JA256+on+YOUR_GPU
