# wsjLL/MiniMax-H3-NVFP4

## Resumen

MiniMax-H3-NVFP4 es una cuantizacion en formato NVFP4 del modelo de difusion MiniMax-H3, publicada por el usuario wsjLL. Se trata de un repackaging orientado a ComfyUI que convierte los pesos del transformer de difusion (DiT) original de MiniMaxAI a precision de 4 bits NVFP4, con el objetivo de reducir el espacio en disco y la VRAM necesaria para inferencia de generacion de video texto-a-video. El modelo base MiniMax-H3 es un transformer de difusion de 33.120 millones de parametros en bf16, que el checkpoint "pruned" de Comfy-Org reduce a 20.110 millones mediante una refactorizacion estructural de la capa AdaLN.

La relevancia de esta publicacion es practica: permite ejecutar un modelo de generacion de video de gran tamano en GPUs de consumo de gama alta (RTX 5090 de 32 GB) si se descarga el codificador de texto a CPU tras la codificacion. El archivo principal `minimax_h3_ref2va_pruned_nvfp4.safetensors` ocupa 12,5 GB y requiere unos 11,9 GB de VRAM para el DiT, frente a los 21 GB y 20 GB de VRAM del checkpoint int8_convrot de Comfy-Org.

El repositorio incluye dos variantes de tarea: `ref2va` (imagenes de referencia a video, hasta 9 imagenes) y `fl2va` (primer y ultimo fotograma a video). Tambien incorpora dos archivos de precision mixta `convrot_int8` atribuidos a rockerBOO. La licencia es la MiniMax-H3 Community License Agreement, no estandar de codigo abierto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (DiT) con refactorizacion AdaLN en tabla de timesteps |
| Parametros totales | 20.110 millones (checkpoint pruned); 33.120 millones en bf16 sin podar |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | NVFP4 (4 bits), int8_convrot, bf16 (base) |
| Idiomas soportados | No disponible |
| Licencia | MiniMax-H3 Community License Agreement |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base MiniMax-H3 es un transformer de difusion (DiT) con 50 bloques, cuyo componente dominante en el checkpoint bf16 original es la proyeccion AdaLN: 13.040 millones de parametros (39,4% del total). El checkpoint pruned de Comfy-Org no elimina pesos de forma lossy, sino que refactoriza AdaLN: sustituye la proyeccion de un vector de condicionamiento de 5376 dimensiones por bloque por una tabla de timesteps de 8 dimensiones (`adaln_t_table`, forma `[1025, 8]`) que alimenta `adaln_proj.linear` de forma `[96768, 8]`. Como la modulacion depende solo del timestep, la proyeccion ancha era casi redundante: 13.040 millones de parametros colapsan a 40 millones, una reduccion de ~326x.

Tras la refactorizacion, el reparto de parametros del checkpoint pruned es: `mlp` 11.560 millones, `attn` 7.710 millones, `adaln_proj` 40 millones y token_refiner/norms/embedders 800 millones. La cuantizacion NVFP4 de este repositorio se aplica en una sola pasada desde `pruned_bf16` sobre las 200 capas de atencion y MLP, dejando la ruta de modulacion AdaLN a precision completa. Esta decision es relevante porque AdaLN emite las escalas y desplazamientos aplicados a cada flujo residual, por lo que el error ahi es multiplicativo y se acumula a lo largo de los 50 bloques y de todos los pasos de muestreo. No se dispone de informacion sobre el dataset de entrenamiento, numero de tokens, ni sobre si hubo RLHF o DPO.

## Capacidades

- Generacion de video a partir de imagenes de referencia (`ref2va`): acepta hasta 9 imagenes de referencia, ademas de videos y audio, y genera un video guiado por la identidad de las referencias.
- Generacion de video a partir de primer y ultimo fotograma (`fl2va`): interpola entre los extremos; permite encadenar clips alimentando el ultimo fotograma del clip anterior.
- Generacion texto-a-video (pipeline declarado en HuggingFace).
- Integracion con ComfyUI mediante los archivos safetensors empaquetados.
- Cuantizacion NVFP4 acelerada por hardware en GPUs NVIDIA Blackwell (RTX 50-series, RTX PRO 6000, B200); en Ada, Hopper o anteriores la ruta NVFP4 se emula.
- No se dispone de informacion sobre tool calling, function calling, soporte de agentes, capacidades multilingues ni modo thinking.

## Casos de uso

- Generacion de video con identidad consistente: usar `ref2va` con hasta 9 imagenes de referencia para producir clips donde el sujeto mantiene rasgos faciales y de vestuario a lo largo del video, util en publicidad y contenido de marca.
- Interpolacion entre fotogramas clave: usar `fl2va` para generar transiciones suaves entre un primer y un ultimo fotograma definidos por el usuario, aplicable a animaticos y previsualizacion de storyboards.
- Encadenado de clips largos: alimentar el ultimo fotograma de un clip como primer fotograma del siguiente con `fl2va` para construir secuencias de mayor duracion que una sola generacion.
- Prototipado en estaciones de trabajo con GPU de consumo: con el archivo `pruned_nvfp4` de 12,5 GB y el codificador de texto descargado a CPU tras la codificacion, el DiT cabe en una RTX 5090 de 32 GB, lo que permite iterar localmente sin GPU de centro de datos.
- Produccion en ComfyUI: los archivos estan empaquetados especificamente para ComfyUI, de modo que se integran en flujos de trabajo nodales existentes sin conversion adicional.
- Despliegue en GPUs Blackwell de centro de datos: en RTX PRO 6000 (96 GB) o B200 se aprovecha la ruta NVFP4 nativa, con menor VRAM y menor tiempo de muestreo que el checkpoint int8_convrot de Comfy-Org.
- Evaluacion de fidelidad frente a cuantizacion de 8 bits: los archivos `convrot_int8` de precision mixta permiten comparar calidad de movimiento y fidelidad frente a la variante NVFP4 en el mismo pipeline.

## Benchmarks y rendimiento

Los datos medidos por el autor corresponden a velocidad y tamano, no a calidad. Entorno: RTX PRO 6000 Blackwell (96 GB), ComfyUI 0.30.0, tarea ref2va, resolucion 864x480, 39 fotogramas, 20 pasos, sampler `res_multistep` con scheduler `beta` (el autor senala que `beta` no era el scheduler correcto; las plantillas oficiales de H3 usan `simple`) y tres semillas emparejadas.

| Modelo | Tamano | VRAM escalonada | s/it |
|---|---|---|---|
| `pruned_int8_convrot` (Comfy-Org) | 21,0 GB | 19.995 MB | 2,17 |
| `pruned_nvfp4` (este repositorio) | 12,5 GB | 11.944 MB | 1,90 |

Resultado: -40% de tamano de archivo, -8,0 GB de VRAM y -12,4% de tiempo de muestreo frente al checkpoint int8_convrot de Comfy-Org. El autor indica que la comparacion de calidad de esas mismas ejecuciones queda retirada. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el DiT: 11,9 GB con `pruned_nvfp4`; ~16 GB con `nvfp4_full`; ~20 GB con `nvfp4_mixed` y con los archivos `convrot_int8`.
- GPU recomendadas: NVIDIA Blackwell para la ruta NVFP4 nativa, es decir, RTX 50-series, RTX PRO 6000 y B200.
- En GPUs Ada, Hopper o anteriores la ruta NVFP4 se emula; el autor recomienda usar los archivos `int8_convrot` de Comfy-Org en su lugar.
- Cabe en GPU de consumo: una RTX 5090 de 32 GB es viable si el codificador de texto se descarga a CPU tras la codificacion, ya que se ejecuta una vez por prompt y no una vez por paso de muestreo.
- Opciones de despliegue: ComfyUI (formato y empaquetado especificos); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 1,90 s/it en RTX PRO 6000 Blackwell con la configuracion de prueba indicada (864x480, 39 fotogramas, 20 pasos). El valor de s/it para `fl2va` no esta medido, aunque el autor espera que coincida con `ref2va` por tener arquitectura identica.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | VRAM (DiT) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MiniMax-H3-NVFP4 (este repo) | 20,11 B (pruned) | No disponible | safetensors NVFP4 | 11,9 GB | MiniMax-H3 Community License | HuggingFace (wsjLL) |
| MiniMax-H3 pruned_int8_convrot (Comfy-Org) | 20,11 B (pruned) | No disponible | safetensors int8_convrot | 20 GB | MiniMax-H3 Community License | HuggingFace (Comfy-Org) |
| MiniMax-H3 pruned_nvfp4_convrot_int8 (rockerBOO) | 20,11 B (pruned) | No disponible | safetensors mixto NVFP4/FP8/INT8/BF16 | ~20 GB | MiniMax-H3 Community License | HuggingFace (rockerBOO) |
| MiniMax-H3 bf16 original | 33,12 B | No disponible | safetensors bf16 | No disponible | MiniMax-H3 Community License | HuggingFace (MiniMaxAI) |

No se dispone de datos de benchmarks de calidad para establecer una comparacion de rendimiento entre estas variantes; la unica comparacion publicada es de tamano, VRAM y velocidad de muestreo.

## Limitaciones y advertencias

- El autor indica que los pesos de 4 bits parecen costar algo de calidad de movimiento frente al `int8_convrot` de 8 bits de Comfy-Org; recomienda leer la seccion "Honest limitations" antes de elegir NVFP4 si se busca maxima fidelidad.
- La comparacion de calidad de las ejecuciones medidas queda retirada por el propio autor; solo son validos los datos de velocidad y tamano.
- NVFP4 requiere GPU NVIDIA Blackwell para aceleracion nativa; en Ada, Hopper o anteriores se emula y el rendimiento no es representativo.
- El scheduler usado en las mediciones (`beta`) no es el recomendado por las plantillas oficiales de H3 (`simple`), lo que puede afectar a la comparabilidad de los tiempos.
- La licencia es la MiniMax-H3 Community License Agreement, no una licencia de codigo abierto estandar; es necesario revisar sus terminos para uso comercial.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion, limitaciones de contexto o de idioma.
- Los archivos `convrot_int8` no son obra del autor del repositorio, sino de rockerBOO, y se replican aqui bajo la misma licencia comunitaria.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion de la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/wsjLL/MiniMax-H3-NVFP4
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia del modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- Repackaging de Comfy-Org: https://huggingface.co/Comfy-Org/MiniMax-H3
- Repositorio original de los archivos convrot_int8 (rockerBOO): https://huggingface.co/rockerBOO/minimax-h3-nvfp4
