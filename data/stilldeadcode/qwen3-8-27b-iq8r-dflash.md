# StillDeadcode/qwen3.8-27b-iq8r-dflash

## Resumen

StillDeadcode/qwen3.8-27b-iq8r-dflash es una cuantizacion int8 del modelo multimodal Qwen/Qwen3.8-27B, empaquetada como un unico contenedor `.rad` para el motor de inferencia radiance, orientado a GPUs AMD RDNA4 con ROCm. El autor es StillDeadcode, que mantiene tanto el motor (alojado en Codeberg) como este artefacto. El modelo integra el trunk cuantizado a int8 mediante GPTQ en el dominio de Hadamard, la torre de vision en bf16 y un drafter de decodificacion especulativa (z-lab/Qwen3.8-27B-DFlash2) fusionado en el mismo fichero, lo que permite servir texto, imagen y video con aceleracion especulativa en una sola carga.

El problema que resuelve es doble: por un lado, reduce el peso del checkpoint a 28,76 GiB (frente a los ~54 GB en bf16 de un modelo de 27B), manteniendo una divergencia KL de 0,00039 respecto al modelo bf16, un orden de magnitud mejor que el checkpoint FP8 oficial de Qwen (0,00363); por otro, ofrece una ruta de despliegue nativa para hardware AMD consumer y profesional (RDNA4), un nicho tradicionalmente mal cubierto por vLLM y TGI. La licencia es Apache 2.0, heredada del modelo base.

La relevancia actual radica en que demuestra que la cuantizacion W8A8 con rotacion Hadamard y GPTQ puede igualar o superar la calidad del FP8 propietario a la misma velocidad, y que la decodificacion especulativa con drafter de difusion por bloques (DFlash2) es viable en un unico contenedor. La arquitectura subyacente combina atencion con capas SSM (mezcla hibrida, a juzgar por los tensores `ssm_inz`/`ssm_out`), contexto de 262.144 tokens entrenados (200K probados) y torre de vision de 27 bloques.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con capas SSM (tensores `ssm_inz`, `ssm_out`), atencion y FFN; torre de vision de 27 bloques; drafter de difusion por bloques DFlash2 |
| Parametros totales | 27B (modelo base Qwen3.8-27B); tamano del fichero 28,76 GiB |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens entrenados; 200.000 probados en despliegue |
| Tipos de cuantizacion | Trunk int8 W8A8 (GPTQ, grupo 256 con escala u8 + escala bf16 por fila, rotacion Hadamard fwht128); lm_head int8 grupo 128; drafter en codebook entero de 16 niveles (4 bits) y cabeza de vocabulario a 2 bits; vision en bf16; KV cache int8 opcional (`kv-cache-dtype: i8`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Contenedor `.rad` propietario del motor radiance (no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B presenta una arquitectura hibrida: los nombres de tensores del recipe (`blk.*.ssm_inz.weight`, `blk.*.ssm_out.weight`) indican capas de espacio de estados (SSM) combinadas con atencion estandar (`attn_qg`, `attn_k`, `attn_v`, `attn_output`) y FFN con proyecciones fusionadas `ffn_gate_up`/`ffn_down`. La torre de vision consta de 27 bloques y procesa imagenes y video en peticiones de chat. El drafter z-lab/Qwen3.8-27B-DFlash2 es un modelo de difusion por bloques que propone tokens candidatos para decodificacion especulativa.

El proceso de cuantizacion es el elemento tecnico mas distintivo. El autor registro las matrices de Gram (Hessians) de cada capa lineal del trunk y de la cabeza ejecutando el modelo bf16 sobre el split `calib` del dataset StillDeadcode/qwen3.8-27b-quant-challenge, y aplico GPTQ contra esas Hessians en el dominio de Hadamard (transformacion fwht128, rotacion no normalizada de cada 128 elementos de K). Las activaciones se cuantizan tambien a int8 bajo la misma rotacion (W8A8). El drafter usa cuantizacion round-to-nearest con un codebook entero de 16 niveles y rotacion Hadamard identica; su cabeza de vocabulario se codifica a 2 bits y el motor re-puntua los 32 candidatos principales contra la cabeza del modelo principal. No se documentan en la informacion disponible detalles sobre el dataset de preentrenamiento original, el volumen de tokens ni las etapas de RLHF/DPO del modelo base.

## Capacidades

- Generacion de texto, razonamiento y matematicas heredados del modelo base Qwen3.8-27B (no se detallan capacidades especificas en la informacion disponible).
- Procesamiento multimodal de imagen y video: la torre de vision en bf16 acepta partes `image_url` y `video_url` en mensajes de chat.
- Tool calling y salida estructurada: el servidor expone la API de OpenAI (`/v1/chat/completions`, `/v1/completions`) con soporte de llamadas a herramientas y structured output.
- Decodificacion especulativa integrada: el drafter DFlash2 acelera la generacion; la profundidad se ajusta automaticamente (`num-speculative-tokens: N` la fija, `0` la desactiva).
- Contexto largo: hasta 200.000 tokens probados, con cache KV int8 opcional.
- Servicio multi-secuencia: probado con ocho secuencias concurrentes a 200K de contexto.
- Capacidades multilingues: no disponible.

## Casos de uso

- Atencion al cliente automatizada con contexto largo: el modelo puede mantener conversaciones multi-turno sobre documentos extensos gracias a su ventana de 200K tokens probados y a la cache KV int8, que reduce a la mitad los bytes del cache frente a bf16 sin perdida apreciable de calidad (KLD 0,00043 frente a 0,00039).
- Analisis de imagenes y video en flujos de soporte: la torre de vision permite adjuntar capturas, diagramas o clips en peticiones de chat, util para diagnostico tecnico o triaje de incidencias con evidencia visual.
- Generacion de codigo en produccion: con tool calling y salida estructurada sobre API compatible con OpenAI, se integra en pipelines de CI/CD para revision de parches, generacion de tests o explicacion de errores de compilacion.
- Despliegue en infraestructura AMD: equipos con Radeon AI PRO R9700 (gfx1201) pueden servir el modelo con ROCm sin depender de CUDA, cubriendo un nicho donde vLLM y TGI tienen soporte limitado.
- Procesamiento por lotes de documentos largos: con 200K de contexto y ocho secuencias concurrentes, es adecuado para resumir contratos, informes o expedientes completos en una sola pasada.
- Asistentes agente con razonamiento multi-paso: la decodificacion especulativa (12,5 tokens aceptados por paso) reduce la latencia en bucles de agente donde se encadenan muchas llamadas cortas.
- Investigacion en cuantizacion: el recipe publicado y el dataset de calibracion permiten reproducir y auditar el proceso, util para estudiar el impacto de GPTQ en dominio Hadamard frente a FP8.

## Benchmarks y rendimiento

Calidad medida como divergencia KL respecto a la distribucion del siguiente token del modelo bf16, sobre 464.091 posiciones del split publico de StillDeadcode/qwen3.8-27b-quant-challenge, servido con radiance en dos tarjetas con cache KV bf16:

| Modelo | KLD media | Coincidencia top-1 |
|---|---|---|
| Este fichero (IQ8R + DFlash2) | 0,00039 | 99,19% |
| Este fichero con `kv-cache-dtype: i8` | 0,00043 | no disponible |
| qwen3.8-27b-fp8 (checkpoint FP8 de Qwen) | 0,00363 | 97,38% |

Rendimiento en una Radeon AI PRO R9700 (gfx1201), milisegundos por paso especulativo con 1 / 4 / 8 secuencias concurrentes:

| Modelo | 1 seq | 4 seq | 8 seq | Tokens aceptados por paso |
|---|---|---|---|---|
| Este fichero | 55,0 ms | 59,9 ms | 70,4 ms | 12,5 |
| qwen3.8-27b-fp8 | 54,6 ms | 60,8 ms | 72,3 ms | 12,6 |

Sin drafter, un paso de decodificacion tarda 47,9 ms (FP8: 48,7 ms) y un prefill de 8K tokens alcanza 2.649 tokens por segundo (FP8: 2.715). No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el fichero pesa 28,76 GiB; en el ejemplo de despliegue se usa `tp: 2`, es decir, dos GPUs con reparto de pesos (aproximadamente 14,4 GiB de pesos por GPU, mas cache KV y activaciones).
- GPUs recomendadas: Radeon AI PRO R9700 (gfx1201/RDNA4) es la plataforma probada; el motor radiance esta orientado a AMD RDNA4 con ROCm. No se menciona soporte de GPUs NVIDIA ni de otras arquitecturas AMD.
- GPU consumer: no se confirma compatibilidad con GPUs consumer AMD; el modelo de 27B en int8 (28,76 GiB) no cabe en tarjetas con menos de 32 GB de VRAM, por lo que queda fuera de la mayoria de consumer salvo modelos de gama alta con 32 GB o mas.
- Opciones de despliegue: exclusivamente el motor radiance (Codeberg, StillDeadcode/radiance), compilado desde `main` posterior a la version 1.17.0, ya que IQ8R con escala cada 256 de K y la cache KV int8 no estan en 1.17.0. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 55,0 ms por paso especulativo con una secuencia en una R9700; prefill de 8K tokens a 2.649 tokens/s; probado con ocho secuencias y 200K de contexto en 2x R9700.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad (KLD vs bf16) | Licencia | Formato / motor |
|---|---|---|---|---|---|
| Este fichero (IQ8R + DFlash2) | 27B | 262.144 (200K probados) | 0,00039 | Apache 2.0 | `.rad` / radiance (AMD ROCm) |
| StillDeadcode/qwen3.8-27b-fp8 | 27B | no disponible | 0,00363 | Apache 2.0 | `.rad` / radiance (AMD ROCm) |
| StillDeadcode/qwen3.8-27b-iq8r | 27B | no disponible | no disponible | Apache 2.0 | `.rad` / radiance (AMD ROCm); version anterior con cabeza MTP en lugar de DFlash2 |
| Qwen/Qwen3.8-27B (bf16) | 27B | 262.144 | referencia | Apache 2.0 | safetensors / multiples motores |

La comparativa con alternativas de otros ecosistemas (por ejemplo, cuantizaciones GGUF para llama.cpp o AWQ para vLLM) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Dependencia exclusiva del motor radiance: el formato `.rad` no es portable a vLLM, llama.cpp, Ollama ni TGI, lo que limita el despliegue a infraestructura AMD RDNA4 con ROCm.
- Requiere una version de radiance posterior a 1.17.0 compilada desde `main`; las versiones estables no soportan IQ8R con escala cada 256 de K ni la cache KV int8.
- La cuantizacion introduce una divergencia de 0,00039 de KLD y una coincidencia top-1 del 99,19%: aunque pequena, existe degradacion respecto al bf16, relevante en tareas de alta precision.
- La cabeza del drafter a 2 bits se re-puntua contra la cabeza del modelo principal, pero la calidad de las propuestas especulativas puede degradarse en dominios muy alejados de los prompts de chat usados en la evaluacion (24 prompts).
- Sesgos conocidos: no disponible; dependen del modelo base Qwen3.8-27B y de sus datos de entrenamiento, no documentados aqui.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; aplica el riesgo habitual de los modelos generativos de 27B.
- Idiomas soportados: no disponible; no se confirma cobertura multilingue mas alla de la del modelo base.
- Uso comercial: permitido bajo Apache 2.0, pero conviene verificar las condiciones del modelo base y del drafter z-lab/Qwen3.8-27B-DFlash2, cuya licencia no se detalla en la informacion disponible.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que sugiere poca validacion externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/StillDeadcode/qwen3.8-27b-iq8r-dflash
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Drafter DFlash2: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Version FP8 del mismo autor: https://huggingface.co/StillDeadcode/qwen3.8-27b-fp8
- Version IQ8R anterior: https://huggingface.co/StillDeadcode/qwen3.8-27b-iq8r
- Dataset de calibracion y evaluacion: https://huggingface.co/datasets/StillDeadcode/qwen3.8-27b-quant-challenge
- Motor de inferencia radiance: https://codeberg.org/StillDeadcode/radiance
