# Xylolabs/Qwen3-8B-MLX-8bit

## Resumen

Xylolabs/Qwen3-8B-MLX-8bit es una conversion a formato MLX del modelo Qwen/Qwen3-8B, cuantizado a 8 bits con cuantizacion afin de tamano de grupo 64. Lo publica Xylolabs, un tercero independiente de Alibaba (desarrollador original de Qwen3), y su objetivo es permitir la ejecucion eficiente del modelo en hardware Apple Silicon mediante la libreria `mlx-lm`. No introduce cambios arquitectonicos ni de entrenamiento: es una redistribucion de pesos con cuantizacion post-entrenamiento.

El modelo base Qwen3-8B es un transformer denso de aproximadamente 8.190 millones de parametros, orientado a generacion de texto, razonamiento y conversacion, con un modo de "pensamiento" (thinking) activado por defecto. Esta version cuantizada ocupa 8,70 GB en disco y, segun la model card, conserva practicamente el comportamiento del modelo en BF16: una divergencia KL media de 0,000602 frente a BF16 en WikiText-2 y una coincidencia top-1 del 98,82 %.

Es relevante para desarrolladores que trabajan en macOS y necesitan ejecutar un modelo de 8B con calidad cercana a la original en equipos con memoria unificada de 36 GB o mas, con una ventana de contexto indicada de 40K tokens en la tabla de compatibilidad de hardware del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), pesos convertidos a MLX |
| Parametros totales | 8.190.735.360 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 40K tokens (segun tabla de hardware de la model card) |
| Tipos de cuantizacion | 8 bits afin, group size 64, scales y biases en float16; normas en float16 (el autor publica tambien una variante MLX 4-bit) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors para MLX (`mlx-lm`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-8B: un transformer denso de decodificador con atencion multi-cabeza y las innovaciones propias de la familia Qwen3, incluido el modo de razonamiento explicito (thinking) que el modelo activa por defecto. La model card de esta conversion no detalla la composicion del dataset ni el proceso de entrenamiento del modelo base; esa informacion corresponde a la model card oficial de Qwen/Qwen3-8B, no incluida en la informacion proporcionada.

La contribucion de Xylolabs es exclusivamente de cuantizacion: aplica cuantizacion afin con tamano de grupo 64 a todas las capas lineales, al embedding de tokens y a la LM head, manteniendo las capas de normalizacion en float16. El autor reporta metricas de fidelidad frente a BF16 (KL y acuerdo top-1) sobre WikiText-2, un conjunto de chat y un conjunto held-out, lo que permite evaluar la perdida de calidad de forma objetiva.

## Capacidades

- Generacion de texto y conversacion multi-turno, con plantilla de chat compatible con `mlx_lm.chat`.
- Razonamiento con modo "thinking" activado por defecto; se puede desactivar con `--chat-template-config '{"enable_thinking": false}'` en `mlx_lm.generate`.
- Capacidades de codigo, matematicas y razonamiento general heredadas de Qwen3-8B (la model card no aporta benchmarks propios de estas tareas).
- Soporte de tool calling y function calling: no confirmado en la informacion proporcionada para esta conversion; depende de las capacidades del modelo base Qwen3.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Ejecucion local en Apple Silicon mediante MLX, con inferencia en memoria unificada.

## Casos de uso

- Asistente de desarrollo en macOS: ejecutar el modelo localmente con `mlx_lm.chat` para tareas de explicacion de codigo, refactorizacion y generacion de tests sin enviar datos a servicios externos, aprovechando la ventana de 40K tokens para incluir varios ficheros en el contexto.
- Procesamiento de documentos largos en local: analisis y resumen de informes o contratos de decenas de miles de tokens en un Mac Studio con 36 GB o mas de memoria unificada, sin coste de API.
- Prototipado de agentes y pipelines de razonamiento: usar el modo thinking por defecto para tareas de razonamiento multi-paso y desactivarlo cuando se prioriza latencia en respuestas directas.
- Chatbot interno con requisitos de privacidad: al ejecutarse en hardware local y con licencia Apache 2.0, es adecuado para entornos donde los datos no pueden salir de la maquina.
- Evaluacion y comparacion de cuantizaciones: las metricas KL y top-1 publicadas por el autor permiten usar esta version como referencia de calidad frente a la variante 4-bit en experimentos de investigacion sobre cuantizacion.
- Generacion de contenido y redaccion asistida en castellano y otros idiomas: sujeta a verificacion, ya que la model card no detalla la cobertura linguistica de esta conversion.
- Educacion y experimentacion: permite a estudiantes ejecutar un modelo de 8B con calidad cercana a BF16 en equipos Apple sin GPU dedicada.

## Benchmarks y rendimiento

La model card no incluye resultados de benchmarks estandar (MMLU, HumanEval, GSM8K). Publica metricas de fidelidad de la cuantizacion frente a BF16:

| Variante | Tamano | WikiText-2 KL | top-1 | Chat KL | top-1 | Held-out KL | top-1 | Chequeo de 7 preguntas |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| MLX 8-bit (esta version) | 8,70 GB | 0,000602 | 98,82 % | 0,000565 | 99,10 % | 0,000502 | 99,06 % | 5/7 (BF16: 5/7) |
| MLX 4-bit | 4,72 GB | 0,099188 | 87,27 % | 0,077304 | 88,86 % | 0,085173 | 86,55 % | 5/7 (BF16: 5/7) |
| Qwen MLX 8-bit, group 128 | 8,45 GB | 0,001616 | 97,79 % | 0,001452 | 98,31 % | 0,001548 | 97,75 % | 5/7 (BF16: 5/7) |
| Qwen MLX 4-bit, group 128 | 4,35 GB | 0,096356 | 86,65 % | 0,075987 | 88,71 % | 0,100502 | 85,78 % | 5/7 (BF16: 5/7) |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- Memoria: el repositorio ocupa 8,70 GB; se necesita memoria unificada suficiente para los pesos mas la cache KV del contexto. La model card indica compatibilidad con equipos desde 36 GB de memoria unificada para un contexto de 40K.
- Hardware validado por el autor: Mac Studio M5 Max (32 y 40 nucleos de GPU, 36-128 GB) y Mac Studio M5 Ultra (96-512 GB), todos con contexto de 40K.
- GPU dedicadas (A100, H100, RTX 4090): no aplicables a este formato; MLX esta disenado para Apple Silicon.
- Despliegue: `mlx-lm` version 0.32.2 o superior, con los comandos `mlx_lm.generate` y `mlx_lm.chat`. No es compatible directamente con vLLM, llama.cpp, Ollama o TGI sin conversion de formato.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Xylolabs/Qwen3-8B-MLX-8bit | 8,19 B | 40K | MLX safetensors, 8 bits | Apache 2.0 | KL 0,000602 frente a BF16; 8,70 GB |
| Xylolabs MLX 4-bit (misma familia) | 8,19 B | 40K | MLX safetensors, 4 bits | Apache 2.0 | KL 0,099188; 4,72 GB; menor fidelidad |
| Qwen MLX 8-bit, group 128 | 8,19 B | no disponible | MLX safetensors, 8 bits | Apache 2.0 | KL 0,001616; 8,45 GB; peor KL que esta version |
| Qwen/Qwen3-8B (BF16 original) | 8,19 B | no disponible en la informacion | safetensors BF16 | Apache 2.0 | Referencia de calidad; mayor tamano en disco |

## Limitaciones y advertencias

- Es una cuantizacion de terceros: no esta publicada por el equipo de Qwen, por lo que la responsabilidad sobre la fidelidad de los pesos recae en Xylolabs.
- La cuantizacion introduce una perdida pequena pero medible de calidad (KL 0,000602, top-1 98,82 % frente a BF16); en tareas sensibles a la precision puede ser preferible el modelo original en BF16.
- Solo funciona en el ecosistema MLX (Apple Silicon); no es portable a CUDA sin reconversion.
- La model card no documenta sesgos, riesgos de alucinacion ni cobertura idiomatica de esta conversion; deben evaluarse sobre el modelo base Qwen3-8B.
- El modo thinking activado por defecto incrementa la latencia y el consumo de tokens; conviene desactivarlo en aplicaciones de baja latencia.
- Licencia Apache 2.0 permite uso comercial, pero se debe conservar el aviso de licencia y el fichero NOTICE del autor.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin historial de uso que permita validar su robustez en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Qwen3-8B-MLX-8bit
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Libreria MLX: https://github.com/ml-explore/mlx
- Repositorio del autor (referenciado en la model card): https://github.com/XylolabsInc/tensix-bfp-gptq
