# xt111/MiniMax-H3-NVFP4

## Resumen

MiniMax-H3-NVFP4 es un repositorio de cuantizaciones NVFP4 del transformer de difusion MiniMax-H3, publicado por el usuario xt111 y pensado para su uso en ComfyUI. No es un modelo entrenado desde cero: parte de los checkpoints `pruned_bf16` de Comfy-Org derivados de MiniMaxAI/MiniMax-H3 y los cuantiza a 4 bits, aprovechando que la refactorizacion de AdaLN del checkpoint podado deja solo 200 capas (attn y mlp) como candidatas a cuantizar. El resultado son archivos de 12,5 GB para el DiT, frente a los 21,0 GB del `int8_convrot` de 8 bits de Comfy-Org.

El modelo base es un diffusion transformer (DiT) de video con dos cabezas de tarea: `ref2va`, que acepta hasta 9 imagenes de referencia (ademas de videos y audio) y genera video guiado por identidad, y `fl2va`, que interpola entre un primer y/o ultimo fotograma y permite encadenar clips alimentando el ultimo fotograma del clip anterior. El checkpoint bf16 original tiene 33,12B parametros, de los cuales 13,04B (39,4%) correspondian a proyecciones AdaLN; el refactor podado reduce el total a 20,11B.

La relevancia del repositorio es practica: al dejar la ruta de modulacion en precision completa y cuantizar solo atencion y MLP, consigue un archivo un 40% mas pequeno, 8,0 GB menos de VRAM escalonada y un 12,4% menos de tiempo de muestreo que el int8 de 8 bits de Comfy-Org, medido en una RTX PRO 6000 Blackwell. El coste es que NVFP4 exige hardware Blackwell: en Ada, Hopper o anteriores la ruta NVFP4 se emula y el autor recomienda usar los ficheros `int8_convrot`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer (DiT) de video, 50 bloques, con AdaLN refactorizado a tabla de timesteps (no disponible el detalle completo de capas) |
| Parametros totales | 20,11B en el checkpoint podado (33,12B en bf16 sin podar) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo de difusion de video; no se especifica ventana de contexto textual) |
| Tipos de cuantizacion | NVFP4 (TensorCore NVFP4) sobre 200 capas attn/mlp; variantes mixtas NVFP4 + FP8 + INT8 ConvRot + BF16; bf16 completo como origen |
| Idiomas soportados | No disponible |
| Licencia | minimax-h3-community-license-agreement (`license: other`), enlazada al LICENSE de MiniMaxAI/MiniMax-H3 |
| Formato de pesos | safetensors (repo de 129,9 GB en total) |

Ficheros incluidos en el repositorio:

| Fichero | Tamano | s/it | VRAM (DiT) | Notas |
|---|---|---|---|---|
| `minimax_h3_ref2va_pruned_nvfp4.safetensors` | 12,5 GB | 1,90 | 11,9 GB | ref2va mas pequeno y rapido |
| `minimax_h3_fl2va_pruned_nvfp4.safetensors` | 12,5 GB | no medido | ~11,9 GB | fl2va mas pequeno y rapido |
| `minimax_h3_ref2va_nvfp4_mixed.safetensors` | 24,4 GB | 1,92 | ~20 GB | desde bf16 sin podar |
| `minimax_h3_ref2va_nvfp4_full.safetensors` | 18,7 GB | 1,91 | ~16 GB | experimental |
| `minimax_h3_ref2va_pruned_nvfp4_convrot_int8.safetensors` | 20,1 GB | no medido | ~20 GB | mixto, obra de rockerBOO |
| `minimax_h3_fl2va_pruned_nvfp4_convrot_int8.safetensors` | 20,1 GB | no medido | ~20 GB | mixto, obra de rockerBOO |

## Arquitectura y entrenamiento

Se trata de una cuantizacion, no de un entrenamiento nuevo, por lo que no hay datos de entrenamiento, tokens ni fases de RLHF/DPO asociadas a este repositorio. El modelo subyacente es un diffusion transformer de video con dos variantes de tarea. La innovacion tecnica que hace viable esta cuantizacion es el refactor estructural de AdaLN que ya viene en el checkpoint podado de Comfy-Org: el modelo bf16 proyecta un vector de condicionamiento de 5376 dimensiones en parametros de modulacion por bloque, mientras que el modelo podado sustituye esa proyeccion por una tabla de timesteps de 8 dimensiones (`adaln_t_table`, forma `[1025, 8]`) que alimenta `adaln_proj.linear` con forma `[96768, 8]`. Como la modulacion depende solo del timestep, la proyeccion de 5376 dimensiones era casi enteramente redundante y 13,04B parametros se colapsan a 0,04B, una reduccion de aproximadamente 326x.

El desglose de parametros queda asi: `adaln_proj` pasa de 13,04B (39,4%) a 0,04B (0,2%); `mlp` de 12,02B a 11,56B; `attn` de 8,02B a 7,71B; token_refiner, norms y embedders de 0,05B a 0,80B; total de 33,12B a 20,11B. Este refactor importa para la cuantizacion porque AdaLN emite las escalas y desplazamientos aplicados a todo el flujo residual, de modo que el error ahi es multiplicativo y se acumula en los 50 bloques y en cada paso de muestreo. Al ser ya diminuto en el modelo podado, se mantiene a precision completa sin coste relevante y solo se cuantizan attn y mlp, que toleran mejor el error.

El fichero `pruned_nvfp4` se construye en una sola pasada desde `minimax_h3_{ref2va,fl2va}_pruned_bf16` de Comfy-Org (40,2 GB), aplicando `TensorCoreNVFP4Layout.quantize()` sobre las 200 capas attn/mlp y conservando la ruta de modulacion intacta. Los dos ficheros `_convrot_int8` son de rockerBOO: usan NVFP4 para el mlp de `blocks.2-46`, FP8 para `attn.qkv_proj` y `adaln_proj`, BF16 para las capas almacenadas en F32 upstream, y reemplazan `attn.qkv_proj` por INT8 ConvRot cuantizado de nuevo en lugar de reempaquetado.

## Capacidades

- Generacion de video a partir de imagenes de referencia (`ref2va`): acepta hasta 9 imagenes de referencia, ademas de videos y audio, y genera video guiado por identidad.
- Generacion de video a partir de primer y/o ultimo fotograma (`fl2va`): interpola entre los extremos dados.
- Encadenado de clips: alimentando el ultimo fotograma del clip anterior como entrada de `fl2va` se pueden concatenar generaciones sucesivas.
- Generacion de video condicionada por audio: la variante `ref2va` admite audio entre las entradas de referencia.
- Integracion en ComfyUI mediante nodos, con los ficheros empaquetados para ese entorno.
- Ejecucion en precision mixta: los perfiles `_convrot_int8` combinan NVFP4, FP8, INT8 ConvRot y BF16 segun el tipo de capa.
- Tool calling, function calling, agentes, razonamiento multi-paso, codigo, matematicas y vision generica: no aplica, es un modelo de generacion de video y no un modelo de lenguaje.

## Casos de uso

- Creacion de video con personaje consistente: usando `ref2va` con varias imagenes de referencia de la misma persona u objeto, el modelo mantiene la identidad a lo largo del clip, lo que sirve para avatares, doblaje visual o series de clips con el mismo protagonista.
- Transiciones e interpolacion entre fotogramas: con `fl2va` se puede fijar el primer y el ultimo fotograma de una escena y dejar que el modelo rellene el movimiento intermedio, util para storyboards animados o inserts entre dos planos ya rodados.
- Montaje de secuencias largas por encadenado: alimentando el ultimo fotograma de un clip como entrada del siguiente se construyen secuencias de duracion superior a una sola generacion, sin necesidad de un modelo de contexto largo.
- Prototipado rapido en ComfyUI: el flujo de trabajo típico es 864x480, 39 fotogramas y 20 pasos con el scheduler `simple` (las plantillas oficiales de H3), lo que permite iterar sobre prompts y referencias antes de un render final.
- Despliegue en GPU de 32 GB: con el DiT en ~12 GB y el text encoder descargado a CPU tras la codificacion (se ejecuta una vez por prompt, no por paso de muestreo), una RTX 5090 de 32 GB pasa a ser viable para esta variante.
- Previsualizacion de bajo coste en pipelines de produccion: al ocupar 12,5 GB y 11.944 MB de VRAM escalonada frente a los 21,0 GB y 19.995 MB del int8 de 8 bits, permite generar borradores en hardware mas limitado y reservar el checkpoint de mayor fidelidad para el render final.
- Investigacion sobre cuantizacion de DiT: el repositorio documenta el desglose de parametros y la logica de proteger AdaLN, por lo que sirve como caso de estudio reproducible para evaluar el intercambio entre tamano, velocidad y calidad de movimiento en modelos de difusion de video.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible; no aplican a un modelo de generacion de video. Lo unico medido son tiempos y tamanos, en una RTX PRO 6000 Blackwell (96 GB) con ComfyUI 0.30.0, tarea `ref2va`, resolucion 864x480, 39 fotogramas, 20 pasos, scheduler `res_multistep` / `beta` y tres semillas emparejadas. El propio autor advierte que `beta` era el scheduler incorrecto (las plantillas oficiales de H3 usan `simple`) y que la comparacion de calidad de esas mismas ejecuciones queda retirada.

| Modelo | Tamano | VRAM escalonada | s/it |
|---|---|---|---|
| `pruned_int8_convrot` (Comfy-Org) | 21,0 GB | 19.995 MB | 2,17 |
| `pruned_nvfp4` (este repositorio) | 12,5 GB | 11.944 MB | 1,90 |

Resultado agregado declarado: -40% de tamano de fichero, -8,0 GB de VRAM y -12,4% de tiempo de muestreo. El `s/it` de la variante `fl2va` no esta medido, pero deberia coincidir con `ref2va` porque la arquitectura es identica salvo la cabeza de tarea.

## Requisitos de hardware

- VRAM del DiT: 11,9 GB con el fichero `pruned_nvfp4` de 12,5 GB; ~20 GB con el `nvfp4_mixed` de 24,4 GB; ~16 GB con el `nvfp4_full` de 18,7 GB (experimental); ~20 GB con los `_convrot_int8` de 20,1 GB.
- GPU obligatoria para NVFP4 nativo: NVIDIA Blackwell (RTX 50-series, RTX PRO 6000, B200). En Ada, Hopper o anteriores la ruta NVFP4 se emula y el autor recomienda los ficheros `int8_convrot` de Comfy-Org.
- Cabe en GPU de consumo: si, en una RTX 5090 de 32 GB, siempre que el text encoder se descargue a CPU despues de codificar el prompt.
- Medicion de referencia: RTX PRO 6000 Blackwell de 96 GB, ComfyUI 0.30.0, 1,90 s/it con `pruned_nvfp4` y 2,17 s/it con `pruned_int8_convrot` en las condiciones indicadas arriba.
- Opciones de despliegue: ComfyUI es el entorno de destino explicito de estos ficheros (tags `comfyui`); no se mencionan vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Throughput agregado, latencia por clip completa y requisitos de VRAM del pipeline completo (text encoder incluido) no estan disponibles.

## Comparativa con modelos similares

La comparacion natural es contra las otras variantes del mismo MiniMax-H3 en este repositorio y contra el checkpoint de 8 bits de Comfy-Org:

| Variante | Tamano | Precision | VRAM (DiT) | s/it | Origen |
|---|---|---|---|---|---|
| `pruned_nvfp4` (ref2va/fl2va) | 12,5 GB | NVFP4 en attn+mlp, modulacion a precision completa | 11,9 GB | 1,90 | xt111 (este repo) |
| `pruned_int8_convrot` | 21,0 GB | INT8 ConvRot en 200 capas attn/mlp | 19.995 MB | 2,17 | Comfy-Org |
| `pruned_nvfp4_convrot_int8` | 20,1 GB | NVFP4 en mlp de blocks.2-46, FP8 en qkv/adaln, BF16/INT8 ConvRot | ~20 GB | no medido | rockerBOO |
| `nvfp4_mixed` | 24,4 GB | mixta desde bf16 sin podar | ~20 GB | 1,92 | xt111 (este repo) |
| `nvfp4_full` | 18,7 GB | NVFP4 | ~16 GB | 1,91 | xt111 (este repo), experimental |
| MiniMax-H3 `pruned_bf16` (base) | 40,2 GB | bf16 | no disponible | no disponible | Comfy-Org |

En parametros, el checkpoint podado declara 20,11B frente a los 33,12B del bf16 original. No se dispone de comparaciones con modelos de generacion de video de otros desarrolladores (por ejemplo, alternativas de la misma categoria de peso) en la informacion proporcionada.

## Limitaciones y advertencias

- Calidad de movimiento: el autor indica que los pesos de 4 bits parecen costar algo de calidad de movimiento respecto al `int8_convrot` de 8 bits de Comfy-Org. Si hay VRAM de sobra y se busca maxima fidelidad, recomienda leer antes la seccion de limitaciones.
- Comparacion de calidad retirada: los datos de calidad obtenidos de las ejecuciones de referencia fueron retirados por el propio autor, de modo que las cifras publicadas son solo de velocidad y tamano, no de fidelidad.
- Metodologia de medicion cuestionable: las pruebas usaron el scheduler `beta`, que el autor reconoce como incorrecto (las plantillas oficiales de H3 usan `simple`), por lo que los tiempos pueden no ser directamente trasladables a un flujo de trabajo estandar.
- Dependencia de hardware: NVFP4 solo es nativo en Blackwell; en Ada, Hopper o anteriores se emula, con la recomendacion explicita de usar `int8_convrot` en su lugar.
- Naturaleza del repositorio: se trata de una cuantizacion de terceros, no de un modelo oficial de MiniMax. Tiene 0 descargas y 0 likes, no ha pasado por validacion de la comunidad y no incluye datos de benchmarks de calidad.
- Ficheros de terceros: los dos `_convrot_int8` son obra de rockerBOO y se replican aqui por comodidad bajo la misma licencia comunitaria; para soporte y documentacion original conviene acudir a su repositorio.
- Licencia: `minimax-h3-community-license-agreement` con `license: other`. Los terminos concretos de uso comercial no se detallan en la informacion proporcionada; hay que consultar el enlace del LICENSE antes de un uso en produccion.
- Idiomas y sesgos: no hay informacion sobre idiomas soportados, sesgos de representacion ni comportamiento del modelo ante prompts en distintos idiomas.
- Contexto y coherencia temporal: no se documenta ninguna ventana de contexto ni limite de duracion por generacion; el encadenado de clips es la via descrita para superar una generacion unica, con el riesgo de deriva visual acumulada que eso implica.
- Riesgo de alucinacion: no aplica en el sentido de texto factual, pero si existe el riesgo habitual en modelos generativos de video de producir contenido fisicamente incoherente o no solicitado; no hay evaluaciones publicadas al respecto.

## Enlaces

- Repositorio HuggingFace de esta cuantizacion: https://huggingface.co/xt111/MiniMax-H3-NVFP4
- Modelo original: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Repositorio de Comfy-Org del que derivan estos ficheros: https://huggingface.co/Comfy-Org/MiniMax-H3
- Repositorio original de los ficheros `_convrot_int8` (rockerBOO): https://huggingface.co/rockerBOO/minimax-h3-nvfp4
- Licencia comunitaria de MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; las busquedas devolvieron unicamente resultados no relacionados (paginas de un sindicato local).
