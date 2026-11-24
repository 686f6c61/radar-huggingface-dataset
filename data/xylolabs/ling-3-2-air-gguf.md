# Xylolabs/Ling-3.2-air-GGUF

## Resumen

Ling-3.2-air es un modelo de lenguaje multimodal de pesos abiertos desarrollado por inclusionAI (Alibaba/Ant Group) que comparte la arquitectura multimodal nativa de Ling-3.0-flash-VL. Se distribuye originalmente en BF16 y esta ficha corresponde a la cuantizacion GGUF Q4_K_M publicada por Xylolabs para su uso con llama.cpp en CUDA, Metal o CPU. El modelo esta orientado a la automatizacion de flujos de trabajo, el razonamiento sobre documentos profesionales y el analisis cuantitativo de datos, con soporte nativo de entrada imagen-texto.

Con 127.486.405.600 parametros totales (unos 127,5 mil millones) y arquitectura MoE segun las etiquetas del repositorio, Ling-3.2-air se posiciona en la gama alta de modelos abiertos multimodales. Su relevancia actual radica en las mejoras sustanciales frente a su predecesor en tareas de agente y documentos: AutomationBench-AA pasa del 15,7% al 61%, AA-Briefcase v1.1 sube 353 puntos Elo (de 987 a 1340) y Terminal-Bench 4.0 pasa del 0% al 27%. La licencia MIT facilita su adopcion comercial, y la cuantizacion GGUF Q4_K_M (80,39 GB) permite ejecutarlo en estaciones de trabajo con 96-128 GB de memoria.

Esta ficha documenta principalmente la version cuantizada GGUF, ya que es el artefacto publicado en el repositorio referenciado; los datos de arquitectura y entrenamiento del modelo base se indican solo cuando estan disponibles en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con mezcla de expertos (MoE), arquitectura nativa imagen-texto compartida con Ling-3.0-flash-VL |
| Parametros totales | 127.486.405.600 (unos 127,5 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | 256K tokens (segun la tabla de hardware del autor); la invocacion de ejemplo usa `-c 32768` |
| Tipos de cuantizacion | Q4_K_M (unica cuantizacion publicada); proyector de vision en F16 |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp); el modelo base se distribuye en safetensors/BF16 |
| Tamano del repositorio | 81,3 GB |
| Ficheros | `Ling-3.2-air-Q4_K_M.gguf` (3 partes, 80,39 GB) y `mmproj-Ling-3.2-air-F16.gguf` (874,64 MB) |
| Pipeline | image-text-to-text |
| Modelo base | inclusionAI/Ling-3.2-air |

## Arquitectura y entrenamiento

Ling-3.2-air emplea una arquitectura multimodal nativa con mezcla de expertos (MoE), la misma familia arquitectonica que Ling-3.0-flash-VL. El repositorio etiqueta explicitamente el modelo como `moe` y `image-text-to-text`, e incluye un proyector de vision independiente (`mmproj`) que se carga junto con los pesos principales en llama.cpp. El modelo procesa tanto texto como imagenes en una unica pila, lo que habilita tareas de razonamiento sobre documentos escaneados, capturas y graficos.

No se dispone en la informacion proporcionada del numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF, DPO u otras fases de alineamiento. Tampoco se detallan innovaciones como decodificacion especulativa o atencion lineal. La cuantizacion Q4_K_M fue generada con imatrix (segun las etiquetas del repositorio) y validada con el commit `cd959bae99ff4bed22bef2604f45241c09bbb8c8` de llama.cpp; el autor reporta una divergencia KL media de 0,047693 en WikiText-2 con un 92,08% de coincidencia top-1 respecto a los pesos BF16 originales, lo que indica una degradacion moderada y controlada.

## Capacidades

- Generacion de texto y razonamiento de proposito general, con un indice de inteligencia de 23 en Artificial Analysis Intelligence Index v5.0.1.
- Razonamiento multimodal: procesa imagenes junto con texto (pipeline image-text-to-text) mediante el proyector de vision F16.
- Razonamiento sobre documentos profesionales: puntuacion GDP.pdf all-pass del 16% (frente al 8,4% del predecesor).
- Automatizacion de flujos de trabajo: AutomationBench-AA del 61% (frente al 15,7% del predecesor).
- Analisis cuantitativo de datos y tareas de oficina: AA-Briefcase v1.1 con Elo 1340.
- Trabajo legal y contractual: Harvey LAB-AA v1.1 con 87,7% de criterios superados y 0,8% de all-pass tras la comprobacion de alucinaciones materiales.
- Ejecucion de tareas en terminal: Terminal-Bench 4.0 con 27% de exito.
- Capacidades multilingues limitadas a ingles y chino.
- Soporte de plantillas de chat mediante `--jinja` en llama.cpp (habilita tool calling y formato conversacional segun la plantilla del modelo base).
- No se documenta en la informacion disponible soporte explicito de audio ni un modo "thinking" separado.

## Casos de uso

- Automatizacion de flujos de trabajo administrativos: el modelo puede orquestar tareas multi-paso sobre formularios, correos y documentos, respaldado por su 61% en AutomationBench-AA, muy superior al 15,7% de la generacion anterior.
- Analisis de documentos financieros y PDF: con el 16% de all-pass en GDP.pdf y capacidad de vision, puede extraer y razonar sobre tablas, graficos e importes en documentos escaneados dentro de una ventana de hasta 256K tokens.
- Revision contractual y legal asistida: su 87,7% de criterios superados en Harvey LAB-AA v1.1 lo hace adecuado para preanalisis de clausulas, con la advertencia de que el all-pass tras el filtro de alucinaciones cae al 0,8%, por lo que requiere supervision humana.
- Agente de terminal y DevOps: con un 27% de exito en Terminal-Bench 4.0 y soporte de tool calling via `--jinja`, puede integrarse en tareas de diagnostico, ejecucion de comandos y automatizacion de pipelines con confirmacion humana.
- Atencion al cliente multimodal multi-turno: la ventana de 256K tokens y la entrada de imagenes permiten gestionar conversaciones largas con capturas de pantalla o fotos de productos enviadas por el usuario.
- Analisis cuantitativo exploratorio: generacion de resumenes, comparativas y explicaciones sobre conjuntos de datos tabulares descritos en texto o imagen, adecuado para informes internos.
- Procesamiento por lotes en local: al estar en GGUF Q4_K_M, puede desplegarse en una estacion de trabajo con 96-128 GB (RTX PRO 6000 Blackwell, Mac Studio M5 Max/Ultra, DGX Spark) sin depender de la nube, util para datos sensibles.

## Benchmarks y rendimiento

Resultados publicados por inclusionAI para el modelo base (recogidos en la model card del repositorio GGUF):

| Benchmark | Ling-3.2-air | Predecesor (Ling-3.0-flash-VL) |
|---|---:|---:|
| AutomationBench-AA | 61% | 15,7% |
| GDP.pdf (all-pass) | 16% | 8,4% |
| AA-Briefcase v1.1 (Elo) | 1340 | 987 |
| Terminal-Bench 4.0 | 27% | 0% |
| Artificial Analysis Intelligence Index v5.0.1 | 23 | no disponible |
| Harvey LAB-AA v1.1 (criterios superados) | 87,7% | no disponible |
| Harvey LAB-AA v1.1 (all-pass, antes de filtro) | 8,3% | no disponible |
| Harvey LAB-AA v1.1 (all-pass, tras filtro) | 0,8% | no disponible |

Calidad de la cuantizacion Q4_K_M frente a BF16 (medida por Xylolabs con llama.cpp):

| Conjunto | KL media | Coincidencia top-1 |
|---|---:|---:|
| WikiText-2 | 0,047693 | 92,08% |
| Chat | 0,038328 | 92,82% |
| Held-out | 0,030564 | 91,94% |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM/RAM para inferencia: el fichero Q4_K_M ocupa 80,39 GB; a ello hay que sumar la cache KV en f16 y unos 2 GB para el runtime. El autor recomienda que el total quede por debajo del 90% de la memoria disponible.
- GPU de 24 GB (RTX 4090, RTX 3090): no cabe completo; requiere offload de expertos a RAM del sistema con `--n-cpu-moe N` y contexto de 32K.
- GPU de 32 GB (RTX 5090): igualmente requiere offload de expertos, contexto 32K.
- 48 GB (RTX 6000 Ada o 2 x 24 GB): offload de expertos, contexto 32K.
- 80 GB (H100): offload de expertos, contexto 32K.
- 96 GB (RTX PRO 6000 Blackwell GDDR7): cabe completo, contexto 256K.
- 128 GB unificada (DGX Spark, Mac Studio M5 Max): cabe completo, contexto 256K.
- 141 GB (H200 HBM3e), 192 GB (B200), 256 GB y 512 GB (Mac Studio M5 Ultra), 288 GB (B300): cabe completo, contexto 256K.
- Despliegue: llama.cpp (`llama-server`) con CUDA, Metal o CPU; requiere `--jinja` para la plantilla de chat y `--mmproj` para vision. No se mencionan vLLM, TGI ni Ollama en la informacion disponible.
- Comando de referencia: `./build/bin/llama-server -m Ling-3.2-air-Q4_K_M-00001-of-00003.gguf --mmproj mmproj-Ling-3.2-air-F16.gguf --jinja -ngl 99 -c 32768`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---:|---|---|
| Ling-3.2-air (GGUF Q4_K_M) | ~127,5B (MoE) | 256K | MIT | GGUF | Multimodal nativo; foco en automatizacion y documentos |
| Ling-3.0-flash-VL (predecesor) | no disponible | no disponible | no disponible | no disponible | AutomationBench-AA 15,7%, GDP.pdf 8,4%, Elo 987, Terminal-Bench 0% |
| Otros modelos abiertos de ~100B+ multimodales | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone en la informacion proporcionada de datos suficientes para comparar con alternativas de la misma categoria mas alla del predecesor directo.

## Limitaciones y advertencias

- Solo se ha publicado la cuantizacion Q4_K_M; no hay variantes Q5, Q6, Q8 ni de menor tamano, lo que limita el ajuste fino a hardware con poca memoria.
- Idiomas soportados unicamente ingles y chino; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- Riesgo de alucinacion significativo en tareas legales: el all-pass de Harvey LAB-AA v1.1 cae del 8,3% al 0,8% tras aplicar la comprobacion de alucinaciones materiales, lo que exige validacion humana en produccion.
- El rendimiento en Terminal-Bench 4.0 es del 27%, insuficiente para autonomia total en tareas de terminal sin supervision.
- No se documentan sesgos conocidos ni evaluaciones de seguridad en la informacion disponible.
- La licencia MIT permite uso comercial, pero Xylolabs aclara que no esta afiliado ni respaldado por inclusionAI; conviene revisar el fichero `NOTICE` del repositorio.
- El modelo base se distribuye en BF16 con un tamano de repositorio de 81,3 GB en la version GGUF; el despliegue completo requiere hardware de gama alta (96-288 GB de memoria).
- La cuantizacion Q4_K_M introduce una divergencia KL media de 0,047693 en WikiText-2 y un 92,08% de coincidencia top-1, por lo que puede haber degradacion en tareas sensibles a la precision numerica.
- El contexto maximo de 256K solo es alcanzable con hardware de 96 GB o mas; en GPUs de 24-80 GB el autor recomienda limitarse a 32K con offload de expertos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Xylolabs/Ling-3.2-air-GGUF
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.2-air
- Modelo predecesor: https://huggingface.co/inclusionAI/Ling-3.0-flash-VL
- Organizacion inclusionAI en Hugging Face: https://huggingface.co/inclusionAI
- ModelScope del modelo base: https://www.modelscope.cn/models/inclusionAI/Ling-3.2-air
- Repositorio de llama.cpp (commit de referencia): https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Repositorio de Xylolabs: https://github.com/XylolabsInc/tensix-bfp-gptq
