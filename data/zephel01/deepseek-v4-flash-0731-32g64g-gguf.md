# zephel01/DeepSeek-V4-Flash-0731-32G64G-GGUF

## Resumen

DeepSeek-V4-Flash-0731-32G64G-GGUF es una cuantizacion GGUF del modelo DeepSeek-V4-Flash-0731 (MIT), publicada por el usuario zephel01. Se trata de una compilacion de 72,0 GB pensada especificamente para un PC con una GPU de 32 GB de VRAM (RTX 5090 o AI PRO R9700) y 64 GB de RAM, con todos los 256 expertos del modelo MoE original conservados y sin poda. El objetivo es claro: hacer que un modelo de gran tamano y arquitectura MoE pueda ejecutarse en hardware de consumo mediante offload parcial a CPU, en lugar de depender de un servidor con multiples aceleradores.

La relevancia de esta ficha radica en su enfoque de cuantizacion mixta: los expertos enrutados se comprimen a una media de 1,92 bits por peso (mezcla de IQ1_S, IQ2_S e IQ3_XXS), mientras que las proyecciones de atencion se mantienen en Q5_K para preservar calidad. Segun el autor, esta configuracion alcanza 90,0 tok/s en una RTX 5090, frente a los 33,4 tok/s de la cuantizacion UD-Q2_K_XL de Unsloth (96,8 GB), que no cabe en el mismo equipo y recurre constantemente al SSD. El precio es un aumento del KL divergence (0,314 frente a 0,186).

El modelo base, DeepSeek-V4-Flash-0731, es un MoE de DeepSeek con licencia MIT, orientado a generacion de texto y con soporte declarado de ingles y japones. Esta cuantizacion concreta esta marcada como BETA: solo se ha medido en un unico PC (RTX 5090 de 32 GB), con el nivel de RAM limitado a 40 GB bajo un tope de 58 GB, y el autor advierte de que el archivo puede sustituirse por una compilacion mejor tras nuevas mediciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) transformer; 256 expertos enrutados por capa |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (se han validado pruebas needle de 8K y 8K-31K) |
| Tipos de cuantizacion | Mixta: expertos IQ1_S (54%), IQ2_S (37%), IQ3_XXS (9%) por bytes; atencion Q5_K; resto bytes de UD-Q2_K_XL; media 1,92 bits por peso |
| Idiomas soportados | Ingles y japones |
| Licencia | MIT |
| Formato de pesos | GGUF (3 shards, 72,0 GB; carpeta L72) |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura de mezcla de expertos (MoE) que mantiene 256 expertos enrutados en cada capa. Esta cuantizacion conserva la totalidad de los expertos, sin poda, y aplica una estrategia de compresion diferenciada por tipo de tensor: las puertas y proyecciones up de los expertos enrutados se cuantizan a IQ1_S; las proyecciones down a IQ2_S, salvo en las capas 36-42, que suben a IQ3_XXS; y las proyecciones de atencion `attn_q_b`, `attn_output_a` y `attn_output_b` se mantienen en Q5_K. El resto de tensores reutiliza los bytes de la cuantizacion UD-Q2_K_XL de Unsloth. El primer shard (solo metadatos, 5 MB) es el archivo de Unsloth tal cual, por lo que su campo `general.quantized_by` sigue indicando Unsloth.

El proceso de cuantizacion de los expertos se realizo con LDLQ a partir de la cuantizacion UD-Q8_K_XL de Unsloth (expertos originales en MXFP4), empleando un volcado de Hessian generado con las propias respuestas de chat de V4 (241 prompts, 104 de ellos en japones) mas texto general, junto con una imatrix propia. No se dispone de informacion sobre el numero de tokens de entrenamiento del modelo base, la composicion del dataset ni si hubo fases de RLHF o DPO. Tampoco se documentan innovaciones de decodificacion especulativa: el autor indica que el drafter DSpark no se ha medido a este tamano y que en la variante 32G96G ralentizaba la decodificacion al consumir unos 6,5 GB de VRAM, por lo que recomienda arrancar sin el (`--no-dspark`).

## Capacidades

- Generacion de texto en ingles y japones, con enfasis declarado en respuestas conversacionales y de codigo.
- Razonamiento y resolucion de tareas de codigo: el autor reporta 5 de 5 tareas de programacion con tests superadas y 11 de 11 comprobaciones en el chequeo interno de Abyss (incluyendo tres tareas de codigo, una llamada a herramienta y una conversacion de 11 turnos).
- Soporte de tool calling / function calling, verificado en las pruebas de `--check` de Abyss.
- Manejo de contexto largo: pruebas needle de 8K y de 8K-31K superadas segun el autor.
- Conversacion multi-turno (validada con una conversacion de 11 turnos).
- Capacidad de mantenerse en japones: 9 de 10 respuestas se mantuvieron en japones, con 0 hechos erroneos en esas respuestas.
- No se documentan capacidades de vision, audio ni modo thinking explicito en la informacion disponible.

## Casos de uso

- Asistente de codigo local en una workstation con RTX 5090: el modelo puede integrarse en un flujo de autocompletado y generacion de funciones gracias a su soporte de tool calling y a los 90,0 tok/s medidos, suficiente para una experiencia interactiva sin depender de la nube.
- Atencion al cliente en japones: la cuantizacion mantiene 9 de 10 respuestas en japones con 0 hechos erroneos en las pruebas del autor, lo que la hace apta para prototipos de soporte bilingue en ese idioma.
- Procesamiento de documentos largos con recuperacion: las pruebas needle de 8K-31K indican que el modelo puede localizar informacion en contextos extensos, util para resumen y QA sobre contratos o informes.
- Automatizacion de tareas con agentes: el soporte de function calling y la conversacion multi-turno permiten encadenar pasos en pipelines de automatizacion locales.
- Entornos con requisitos de privacidad: al ejecutarse en un unico PC con GPU de 32 GB y 64 GB de RAM, los datos no salen del equipo, lo que encaja en escenarios con datos sensibles.
- Experimentacion e investigacion en cuantizacion: el repositorio documenta el proceso LDLQ, el volcado de Hessian y la imatrix, lo que lo convierte en material de referencia para estudiar el impacto de la compresion agresiva en modelos MoE.
- Despliegue en equipos con DGX Spark: existe una variante con los mismos archivos que la 32G96G (96,8 GB) para este hardware de 128 GB.

## Benchmarks y rendimiento

| Metrica | L72 (esta repo) | UD-Q2_K_XL (referencia) | L97 (32G96G) |
|---|---:|---:|---:|
| Descarga | 72,0 GB | 96,8 GB | 96,8 GB |
| KL (12 secuencias) | 0,314 | 0,186 | 0,150 |
| KL japones (3 secuencias) | 0,331 | 0,219 | 0,145 |
| Mismo token top-1 | 76,9% | 81,5% | 84,1% |
| Tokens por segundo (RTX 5090) | 90,0 | 33,4 | no disponible |

Pruebas de uso real (Abyss v1.3.120, RTX 5090, limites 32G64G): el chequeo `--check` (japones, tres tareas de codigo, tool call, needle 8K-31K, conversacion de 11 turnos) da 11/11 tanto para L72 como para UD-Q2_K_XL; 9/10 respuestas en japones para L72 frente a 8/10 de la referencia; 0 hechos erroneos en ambas; 5/5 tareas de codigo con tests en ambas; needle de 8K encontrado en L72. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 32 GB de GPU mas 64 GB de RAM como configuracion objetivo; el autor midio con el nivel de RAM limitado a 40 GB bajo un tope de 58 GB.
- GPU recomendadas: RTX 5090 (32 GB) y AI PRO R9700; tambien DGX Spark (128 GB) para la variante de 96,8 GB.
- Cabe en GPU de consumo: si, en RTX 5090 de 32 GB con offload a RAM; no cabe integramente en VRAM.
- Opciones de despliegue: motor Abyss (v1.3.120 o superior) mediante `setup-deepseek.sh --quant 32G64G --no-dspark --download-model`; llama.cpp no ha sido verificado por el autor.
- Latencia y throughput: 90,0 tok/s en RTX 5090 con el nivel de RAM limitado a 40 GB; 33,4 tok/s para UD-Q2_K_XL en el mismo equipo por falta de espacio y acceso a SSD.
- Nota: el drafter DSpark no se ha medido a este tamano y consume unos 6,5 GB de VRAM; se recomienda arrancar sin el.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4-Flash-0731-32G64G-GGUF (esta repo) | MoE, 256 expertos, 1,92 bits/peso | no disponible | 90,0 tok/s; KL 0,314 | MIT | Hugging Face (zephel01) |
| DeepSeek-V4-Flash-0731-IQ1_S-16G64G-GGUF | MoE, 256 expertos, cuantizacion IQ1_S mixta | no disponible | no disponible | MIT | Hugging Face (zephel01) |
| DeepSeek-V4-Flash-0731-IQ2_M-32G96G-GGUF (L97) | MoE, 256 expertos, IQ2_M mixta | no disponible | KL 0,150; 84,1% mismo token top-1 | MIT | Hugging Face (zephel01) |
| unsloth UD-Q2_K_XL (referencia) | MoE, 256 expertos | no disponible | 33,4 tok/s; KL 0,186 | MIT | Hugging Face (Unsloth) |

## Limitaciones y advertencias

- Marcada como BETA: solo medida en un unico PC (RTX 5090 de 32 GB) y el archivo puede sustituirse por una compilacion mejor tras nuevas mediciones, cambiando el nombre de la carpeta.
- Perdida de calidad medible: KL de 0,314 frente a 0,186 de UD-Q2_K_XL y 0,150 de L97; solo el 76,9% de mismo token top-1, frente al 81,5% y 84,1% de las alternativas.
- La cuantizacion mixta no equivale a una cuantizacion estandar del mismo nombre: los expertos mezclan IQ1_S, IQ2_S e IQ3_XXS, y el resto de tensores reutiliza bytes de UD-Q2_K_XL.
- El primer shard conserva los metadatos de Unsloth, incluido `general.quantized_by`, lo que puede confundir en auditorias.
- Idiomas limitados a ingles y japones; no se declara soporte de castellano ni de otros idiomas.
- Riesgo de alucinacion no cuantificado de forma independiente: las pruebas del autor reportan 0 hechos erroneos en 10 respuestas en japones, una muestra reducida.
- El rendimiento depende criticamente de que el archivo quepa en el equipo: con 96 GB de RAM o mas, el autor recomienda la variante L97 en lugar de esta.
- El drafter DSpark no esta medido a este tamano y ralentiza la decodificacion al consumir VRAM; se recomienda desactivarlo.
- llama.cpp no ha sido verificado por el autor; el soporte se limita de facto al motor Abyss.
- Licencia MIT del modelo base y de la cuantizacion: permite uso comercial, pero conviene revisar las condiciones del modelo base y de los datos de entrenamiento originales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zephel01/DeepSeek-V4-Flash-0731-32G64G-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Motor Abyss: https://github.com/zephel01/Abyss
- Variante 16G64G: https://huggingface.co/zephel01/DeepSeek-V4-Flash-0731-IQ1_S-16G64G-GGUF
- Variante 32G96G (L97): https://huggingface.co/zephel01/DeepSeek-V4-Flash-0731-IQ2_M-32G96G-GGUF
- Variante DGX Spark: https://huggingface.co/zephel01/DeepSeek-V4-Flash-0731-DGX-Spark-GGUF
- Envio de resultados de benchmark: https://github.com/zephel01/Abyss/issues/new?template=bench.md&title=Bench:+DeepSeek-V4-Flash-0731+32G64G+L72+on+YOUR_GPU
