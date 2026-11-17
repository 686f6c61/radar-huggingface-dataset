# zephel01/DeepSeek-V4.1-Flash-1017-Compact-32G96G-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017-Compact-32G96G-GGUF es una cuantizacion GGUF podada del modelo base deepseek-ai/DeepSeek-V4.1-Flash-1017, publicada por el usuario zephel01. Se trata de una build de proposito general que conserva 256 de los 384 expertos por capa de un transformer MoE, seleccionados mediante conteo de routing medido sobre texto de chat, matematicas, tool-calls, codigo y contenido multilingue. El objetivo es reducir el peso de 275,8 GB (version sin podar) a 207,1 GB para que el modelo pueda ejecutarse en un PC con GPU de 32 GB de VRAM y 96 GB de RAM, o incluso en una configuracion de 12 GB de VRAM y 128 GB de RAM.

El modelo base declara 567.274.486.384 parametros totales (segun safetensors), lo que lo situa en la categoria de modelos masivos con arquitectura de mezcla de expertos. La poda se realiza a nivel de experto, manteniendo los tensores de los expertos conservados byte a byte desde la cuantizacion LDLQ 132G, sin recuantizar. Los expertos resultantes tienen una media de 1,95 bits por peso con una mezcla de tipos IQ2_XXS (45%), IQ1_S (30%), IQ2_XS (14%) e IQ2_S (11%).

La relevancia actual radica en que permite ejecutar un modelo de escala frontier en hardware de consumo, algo historicamente reservado a clusters. El autor reporta 87,0 tok/s en decodificacion sobre una RTX 5090 con el tier de RAM limitado a 60 GB, superando a las versiones sin podar del mismo modelo (67,5 y 57,9 tok/s). La licencia MIT del modelo base facilita su uso comercial, aunque la ficha advierte que se trata de una version BETA medida en un unico equipo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos), 384 expertos por capa en el modelo base; 256 conservados en esta build |
| Parametros totales | 567.274.486.384 (segun safetensors del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mezcla IQ2_XXS (45%), IQ1_S (30%), IQ2_XS (14%), IQ2_S (11%) en expertos; tabla Engram en IQ4_NL; media de 1,95 bits por peso |
| Idiomas soportados | Ingles y japones (declarados en la model card); el autor reporta tambien chino en las pruebas de routing |
| Licencia | MIT |
| Formato de pesos | GGUF (6 shards) |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura de mezcla de expertos (MoE) de 384 expertos por capa. Esta build concreta no reentrena ni afina el modelo: parte de la cuantizacion LDLQ 132G del mismo autor y aplica una poda selectiva de expertos, conservando 256 de 384 por capa. La seleccion se basa en conteos de routing medidos sobre seis dominios ponderados por igual: japones, chino, ingles, codigo, matematicas y tool-calls. Los expertos conservados, los routers y los sesgos de router se copian byte a byte desde la LDLQ 132G, sin recuantizacion adicional.

La innovacion tecnica principal es la poda guiada por routing con preservacion de capacidades multilingues. El autor documenta que una seleccion centrada solo en codigo (192 expertos) retiene unicamente el 45% de las rutas que toma el texto japones, mientras que la seleccion JA256 retiene el 95% de las rutas en japones, el 94% en chino, matematicas y tools, el 91% en ingles y el 84% en codigo. La tabla Engram se recuantiza a IQ4_NL desde la tabla FP8 de unsloth UD-Q4_K_XL, con un error RMS relativo de 0,075, y se lee desde SSD fila a fila sin necesidad de caber en RAM. El modelo se ejecuta en los motores Abyss y llama.cpp.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles, japones y chino.
- Razonamiento y matematicas: el autor reporta retencion del 94% de las rutas en el dominio de matematicas.
- Generacion de codigo: retencion del 84% de las rutas en el dominio de codigo, con rendimiento medido de 87,0 tok/s en tres tareas de programacion.
- Tool calling / function calling: retencion del 94% de las rutas en el dominio de herramientas.
- Capacidades multilingues limitadas a los dominios medidos (japones, chino, ingles); otros idiomas pueden degradarse mas alla del 5-16% documentado.
- No se declara soporte de vision en esta build; el autor advierte que la entrada de imagen no esta incluida en sus conteos y puede perder mas rutas.
- Compatible con endpoints (tag `endpoints_compatible`) y con el motor Abyss y llama.cpp.

## Casos de uso

- Asistente conversacional local en japones e ingles: el modelo conserva el 95% de las rutas en japones y el 91% en ingles, lo que lo hace adecuado para chat multi-turno en un PC de sobremesa con RTX 5090 y 96 GB de RAM.
- Generacion de codigo en entornos con GPU de consumo: con 87,0 tok/s en tareas de codigo y soporte de tool calling, puede integrarse en flujos de autocompletado o generacion de parches en un equipo local sin depender de la nube.
- Razonamiento matematico y resolucion de problemas: la retencion del 94% en rutas de matematicas permite usarlo para tutorizacion o verificacion de calculos en local.
- Automatizacion de agentes con tool calls: el 94% de retencion en el dominio de herramientas lo habilita para pipelines de agentes que invocan APIs o funciones externas.
- Procesamiento de documentacion tecnica bilingue (japones-ingles): util para equipos que trabajan con documentacion en ambos idiomas y necesitan resumenes o traduccion asistida sin salir del equipo local.
- Despliegue en estaciones de trabajo con 12 GB de VRAM y 128 GB de RAM: el autor indica que esta build tambien esta pensada para esa configuracion, lo que permite usar el modelo en portatiles o workstations de gama media-alta con offload a CPU.
- Prototipado e investigacion sobre MoE podados: sirve como referencia para estudiar el impacto de la poda de expertos en calidad (KL 0,383) y velocidad frente a versiones sin podar (KL 0,194).

## Benchmarks y rendimiento

| Metrica | JA256 (esta build) | LDLQ 132G | LDLQ 139G | ISTA GSQ-RCO Coder | ISTA GSQ-RCO IQ2_XXS |
|---|---:|---:|---:|---:|---:|
| Expertos por capa | 256 / 384 | 384 / 384 | 384 / 384 | 192 / 384 | 384 / 384 |
| Descarga | 207,1 GB | 275,8 GB | 283,0 GB | 182,7 GB | ~249 GB |
| KL (8 secuencias) | 0,383 | 0,194 | 0,182 | 0,582 | 0,314 |
| Mismo token top | 75,2% | 81,1% | 81,6% | 69,3% | 76,8% |
| Decodificacion, 3 tareas de codigo | 87,0 tok/s | 67,5 tok/s | 57,9 tok/s | 97,0 tok/s | no disponible |
| Japones | OK | OK | OK | Responde en chino | no disponible |

Los datos de decodificacion se midieron en un unico equipo: RTX 5090 de 32 GB con el tier de RAM limitado a 60 GB mediante `STRATA_GLM_RAM_GB=60`. El autor califica la build como BETA y solicita reportes de otros equipos. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 32 GB de VRAM con 96 GB de RAM como configuracion objetivo principal; tambien soporta 12 GB de VRAM con 128 GB de RAM.
- GPU recomendadas: RTX 5090 de 32 GB (unica medida reportada); el autor solicita resultados de otras GPU.
- Cabe en GPU de consumo: si, en RTX 5090 (32 GB) y potencialmente en otras GPU de 24-32 GB con offload a RAM; la configuracion de 12 GB requiere 128 GB de RAM del sistema.
- Opciones de despliegue: motor Abyss (del mismo autor) y llama.cpp. No se mencionan vLLM, TGI ni Ollama en la informacion disponible.
- Latencia y throughput: 87,0 tok/s en decodificacion sobre RTX 5090 con RAM limitada a 60 GB, medido en tres tareas de codigo.
- Almacenamiento: 207,1 GB de descarga en 6 shards; la tabla Engram (110,6 GB) se lee desde SSD fila a fila y no necesita caber en RAM.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017 Compact JA256 (esta build) | 567,3 B totales (256/384 expertos) | no disponible | MIT | GGUF | 207,1 GB, 87,0 tok/s, KL 0,383, japones OK |
| DeepSeek-V4.1-Flash-1017 LDLQ 132G (mismo autor) | 567,3 B totales (384/384 expertos) | no disponible | MIT | GGUF | 275,8 GB, 67,5 tok/s, KL 0,194, japones OK |
| DeepSeek-V4.1-Flash-1017 LDLQ 139G (mismo autor) | 567,3 B totales (384/384 expertos) | no disponible | MIT | GGUF | 283,0 GB, 57,9 tok/s, KL 0,182, japones OK |
| ISTA-DASLab GSQ-RCO Coder | 567,3 B totales (192/384 expertos) | no disponible | no disponible | GGUF | 182,7 GB, 97,0 tok/s, KL 0,582, responde en chino a prompts en japones |
| ISTA-DASLab GSQ-RCO IQ2_XXS | 567,3 B totales (384/384 expertos) | no disponible | no disponible | GGUF | ~249 GB, KL 0,314 |

## Limitaciones y advertencias

- Version BETA: los resultados se midieron en un unico PC (RTX 5090 32 GB, RAM limitada a 60 GB); no hay validacion en otros equipos.
- Poda de expertos: se eliminan 128 de 384 expertos por capa, lo que provoca una perdida del 5-16% de rutas en los seis dominios medidos y potencialmente mayor en otros idiomas, dominios raros o entrada de imagen.
- Calidad degradada frente al modelo sin podar: KL de 0,383 frente a 0,194 de LDLQ 132G y 0,182 de LDLQ 139G; el autor advierte que el trabajo largo y cuidadoso deriva mas.
- Idiomas: solo se validan japones, chino e ingles; otros idiomas (coreano, lenguas europeas) pueden degradarse significativamente.
- Vision: no se declara soporte de vision en esta build y el autor no incluye la entrada de imagen en sus conteos de routing.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; la degradacion por poda y cuantizacion a ~1,95 bits por peso puede incrementar errores en conocimiento raro.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento en produccion.
- No es una cuantizacion estandar: la mezcla de tipos IQ2_XXS, IQ1_S, IQ2_XS e IQ2_S implica que el nombre del repo no corresponde a un tipo unico de llama.cpp.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zephel01/DeepSeek-V4.1-Flash-1017-Compact-32G96G-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Version sin podar LDLQ 132G/139G: https://huggingface.co/zephel01/DeepSeek-V4.1-Flash-1017-IQ2_XXS-32G96G-GGUF
- Motor Abyss: https://github.com/zephel01/Abyss
- Repositorio trench-gguf: https://github.com/zephel01/trench-gguf
- Envio de resultados de benchmark: https://github.com/zephel01/Abyss/issues/new?template=bench.md&title=Bench:+DeepSeek-V4.1+Compact-JA256+on+YOUR_GPU
- ISTA-DASLab GSQ-RCO Coder: https://huggingface.co/ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-Coder-GGUF
