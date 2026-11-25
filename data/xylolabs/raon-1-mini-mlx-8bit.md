# Xylolabs/Raon-1-mini-MLX-8bit

## Resumen

Raon-1-mini MLX 8-bit es una cuantizacion en formato MLX de 8 bits del modelo KRAFTON/Raon-1-mini, publicada por Xylolabs. El modelo base es un transformer de tipo mixture-of-experts (MoE) con 28.779.029.222 parametros totales, orientado a generacion de texto y conversacion, con soporte para coreano e ingles. Esta version concreta no es un modelo nuevo, sino una conversion de los pesos originales a MLX 8-bit (cuantizacion afine con group size 64) para su ejecucion eficiente en Apple Silicon.

La relevancia de esta ficha radica en dos factores. Primero, Raon-1-mini es un modelo MoE de casi 29.000 millones de parametros con una ventana de contexto de 256K, lo que lo situa en la liga de modelos de contexto largo para despliegue local. Segundo, la cuantizacion MLX 8-bit preserva la fidelidad del modelo original con una divergencia KL muy baja frente a los pesos MXFP8 de referencia, lo que permite ejecutar un modelo de este tamano en equipos Mac Studio con memoria unificada de 48 GB o superior.

El modelo conserva el modo de razonamiento (thinking) activado por defecto y esta publicado bajo licencia Apache 2.0, lo que facilita su uso comercial y su integracion en flujos de trabajo sobre macOS. La model card reporta metricas de fidelidad de cuantizacion, pero no benchmarks de tareas estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture-of-experts) |
| Parametros totales | 28.779.029.222 |
| Parametros activos | no disponible |
| Longitud de contexto | 256K (256.000 tokens, segun tabla de hardware de la model card) |
| Tipos de cuantizacion | MLX 8-bit afine, group size 64; capas lineales, embedding y LM head en 8-bit; gates del router MoE en BF16. Existe tambien una variante MLX 4-bit |
| Idiomas soportados | Coreano (ko), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), libreria mlx; tamano del repo 30,6 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura mixture-of-experts (MoE), segun las etiquetas y la model card. La conversion a MLX mantiene el codigo de modelo original de KRAFTON (`raon_mlx_model.py`, procedente de KRAFTON/Raon-1-mini-mlx) sin modificaciones, y cuantiza las capas lineales, el embedding y el LM head a 8 bits con cuantizacion afine y group size 64, dejando los gates del router MoE en BF16 para preservar la precision del enrutamiento de expertos.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras fases de alineacion. La model card de esta conversion no incluye esos detalles y no se han proporcionado datos adicionales del modelo base. La innovacion tecnica destacable de esta publicacion es la propia cuantizacion MLX, que mantiene una divergencia KL muy baja respecto a los pesos MXFP8 de referencia (ver seccion de benchmarks de fidelidad).

## Capacidades

- Generacion de texto y conversacion multi-turno, con pipeline declarado `text-generation` y `conversational`.
- Modo de razonamiento (thinking) activado por defecto; se puede desactivar con `--chat-template-config '{"enable_thinking": false}'` en `mlx_lm.generate`.
- Capacidades multilingues limitadas a coreano e ingles.
- Soporte de contexto largo de hasta 256K tokens, segun la tabla de hardware de la model card.
- Ejecucion nativa en Apple Silicon mediante MLX (mlx 0.32.4, mlx-lm 0.32.2).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente conversacional local en macOS: el modelo puede gestionar dialogos multi-turno en coreano e ingles ejecutandose integramente en Apple Silicon con MLX, sin depender de servicios en la nube, gracias a su formato de pesos optimizado para memoria unificada.
- Analisis de documentos largos: con una ventana de 256K tokens, es adecuado para resumir o extraer informacion de contratos, informes o bases de codigo extensas en una sola pasada, siempre que el contenido este en coreano o ingles.
- Razonamiento asistido con modo thinking: para tareas que requieren pasos intermedios de razonamiento (analisis de problemas, planificacion), el modo thinking por defecto permite obtener cadenas de razonamiento antes de la respuesta final.
- Prototipado de aplicaciones de IA en local: desarrolladores que trabajan en Mac pueden usar `mlx_lm.chat` para iterar sobre prompts y flujos conversacionales sin coste de API ni latencia de red.
- Procesamiento de texto en pipelines de investigacion: la licencia Apache 2.0 y el formato safetensors facilitan la integracion en experimentos academicos y la inspeccion de pesos.
- Despliegue en estaciones de trabajo Apple de gama alta: equipos con 48 GB o mas de memoria unificada (Mac Studio M5 Max/Ultra) pueden servir el modelo 8-bit con contexto completo de 256K para cargas de trabajo internas.
- Evaluacion comparativa de cuantizaciones: util como referencia para medir el impacto de la cuantizacion 8-bit frente a 4-bit o NVFP4 en tareas de generacion, usando las metricas KL y top-1 reportadas.

## Benchmarks y rendimiento

La model card no incluye benchmarks de tareas estandar (MMLU, HumanEval, GSM8K, etc.). Si incluye metricas de fidelidad de cuantizacion (KL divergence y top-1 agreement) frente a los pesos MXFP8 de referencia desquantizados a BF16:

| Cuantizacion | Tamano | WikiText-2 KL | WikiText-2 top-1 | Chat KL | Chat top-1 | Held-out KL | Held-out top-1 |
|---|---:|---:|---:|---:|---:|---:|---:|
| MLX 8-bit | 30,60 GB | 0,009532 | 95,42% | 0,004958 | 96,55% | 0,003637 | 96,47% |
| MLX 4-bit | 19,90 GB | 0,054306 | 90,46% | 0,016844 | 93,55% | 0,019319 | 92,82% |
| KRAFTON NVFP4 | 17,54 GB | 0,136615 | 84,90% | 0,040017 | 90,41% | 0,050234 | 87,98% |

No se han publicado resultados de benchmarks de tareas en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: 30,6 GB para la variante 8-bit; 19,9 GB para la variante 4-bit.
- Hardware probado: Apple Silicon con memoria unificada. La model card recomienda Mac Studio M5 Max (40-core GPU) con 48 GB o 64 GB, Mac Studio M5 Ultra con 96 GB, 256 GB o 512 GB (80-core GPU).
- La variante 4-bit cabe en Mac Studio M5 Max (32-core GPU) con 36 GB de memoria unificada.
- No cabe en GPUs de consumo convencionales (RTX 4090, etc.) en formato MLX; MLX esta disenado para Apple Silicon. Para CUDA seria necesario otro formato de pesos, no disponible en esta publicacion.
- Opciones de despliegue: `mlx_lm.generate` y `mlx_lm.chat` con mlx 0.32.4, mlx-lm 0.32.2 y transformers 5.20.1; requiere `--trust-remote-code`.
- Latencia y throughput: no disponibles en la informacion proporcionada. La model card indica que las pruebas en Apple Silicon se realizaron con el repo de 4-bit, que usa el mismo codigo de modelo.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Raon-1-mini MLX 8-bit (esta ficha) | 28.779.029.222 | 256K | MLX safetensors | Apache 2.0 | Hugging Face, Xylolabs |
| Raon-1-mini MLX 4-bit | no disponible (mismo modelo base) | 256K | MLX safetensors | Apache 2.0 | Hugging Face, Xylolabs |
| KRAFTON/Raon-1-mini (base) | 28.779.029.222 | no disponible | no disponible | Apache 2.0 | Hugging Face, KRAFTON |
| KRAFTON NVFP4 (referencia de cuantizacion) | 28.779.029.222 | no disponible | NVFP4 | Apache 2.0 | Referenciado en la model card |

La comparativa con modelos de otros autores no esta disponible en la informacion proporcionada. Las alternativas listadas son variantes de cuantizacion del mismo modelo base.

## Limitaciones y advertencias

- Solo soporta coreano e ingles; el rendimiento en castellano u otros idiomas no esta documentado y probablemente sea deficiente.
- No hay benchmarks de tareas publicados, por lo que no se puede verificar su calidad en razonamiento, codigo o matematicas frente a otros modelos.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se han publicado evaluaciones de factualidad.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- La cuantizacion 8-bit introduce una divergencia KL pequena pero no nula (0,009532 en WikiText-2) respecto a los pesos MXFP8 de referencia; para aplicaciones de altisima precision podria ser relevante.
- El modelo esta empaquetado exclusivamente para MLX y Apple Silicon; no es directamente utilizable en CUDA, ROCm ni en GPUs de consumo convencionales sin reconversion.
- Requiere `--trust-remote-code` para cargar el codigo de modelo de KRAFTON, lo que implica ejecutar codigo remoto; conviene auditar `raon_mlx_model.py` antes de usarlo en produccion.
- El modo thinking esta activado por defecto, lo que incrementa el consumo de tokens y la latencia; debe desactivarse explicitamente si no se necesita.
- Licencia Apache 2.0 permite uso comercial, pero se deben conservar los avisos de `NOTICE` relativos al codigo de KRAFTON.
- El modelo fue creado el 2026-11-25 y no registra descargas ni likes en el momento de la consulta; su madurez y soporte comunitario son limitados.

## Enlaces

- Hugging Face (esta cuantizacion): https://huggingface.co/Xylolabs/Raon-1-mini-MLX-8bit
- Modelo base: https://huggingface.co/KRAFTON/Raon-1-mini
- Codigo de modelo MLX de KRAFTON: https://huggingface.co/KRAFTON/Raon-1-mini-mlx
- Variante MLX 4-bit: https://huggingface.co/Xylolabs/Raon-1-mini-MLX-4bit
- Repositorio MLX: https://github.com/ml-explore/mlx
- Repositorio de herramientas de cuantizacion de Xylolabs: https://github.com/XylolabsInc/tensix-bfp-gptq
- Licencia: https://huggingface.co/Xylolabs/Raon-1-mini-MLX-8bit/blob/main/LICENSE
