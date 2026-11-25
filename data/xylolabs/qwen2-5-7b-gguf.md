# Xylolabs/Qwen2.5-7B-GGUF

## Resumen

Xylolabs/Qwen2.5-7B-GGUF es una cuantizacion en formato GGUF del modelo base Qwen/Qwen2.5-7B, publicada por Xylolabs para su uso con llama.cpp. El modelo original es un transformer denso de 7.615.616.512 parametros desarrollado por el equipo Qwen (Alibaba), y esta version empaqueta los pesos en un unico fichero Q4_K_M de 4,683 GB, pensado para inferencia local en GPUs de consumo y estaciones de trabajo con memoria unificada.

La relevancia de esta ficha es practica: no aporta un modelo nuevo, sino un artefacto de despliegue con una tabla de precision medida frente a BF16 (divergencia KL y top-1) y una guia de que fichero cabe en cada hardware. Esto permite a un desarrollador decidir con datos si la perdida de calidad del Q4_K_M es aceptable para su caso de uso antes de integrarlo en produccion.

El repositorio solo contiene la cuantizacion Q4_K_M; el autor no publica Q8_0, Q6_K, Q5_K_M ni Q3_K_M, aunque si incluye sus metricas como referencia comparativa frente a las cuantizaciones propias de llama.cpp. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2.5), pesos cuantizados a GGUF |
| Parametros totales | 7.615.616.512 (7,6 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128K tokens (segun la tabla de hardware del autor) |
| Tipos de cuantizacion | Q4_K_M (unico fichero publicado); el autor referencia Q8_0, Q6_K, Q5_K_M y Q3_K_M de llama.cpp como comparativa |
| Idiomas soportados | en, ko (segun metadatos del repo) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (un fichero: `Qwen2.5-7B-Q4_K_M.gguf`, 4,683 GB) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen2.5-7B, un transformer decoder-only denso de la familia Qwen2.5. Esta publicacion no entrena ni ajusta nada: convierte los pesos originales a GGUF y los cuantiza a Q4_K_M. El autor no documenta en la model card el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO; esos datos corresponden a la release original de Qwen y no se reproducen aqui.

La innovacion tecnica de esta ficha es la cuantizacion y su evaluacion. El autor mide la divergencia KL y el top-1 frente a BF16 con llama.cpp (build `cd959bae`), lo que permite cuantificar la perdida: el Q4_K_M obtiene una KL de 0,028921 en WikiText-2 y 0,017853 en held-out, con top-1 de 91,828% y 92,814% respectivamente. Para comparar, el Q6_K de llama.cpp baja la KL a 0,003983 y el Q5_K_M a 0,009130, mientras que el Q3_K_M sube a 0,092205. El fichero se ejecuta con `llama-completion` en modo continuacion de texto (`-no-cnv`), es decir, el autor lo plantea como modelo base para completar prefijos, no como chat.

## Capacidades

- Generacion de texto autoregresiva y continuacion de prefijos (modelo base, no instruct).
- Razonamiento y conocimiento general heredados de Qwen2.5-7B.
- Generacion de codigo y matematicas (capacidades del modelo base; no se aportan benchmarks en esta ficha).
- Capacidades multilingues limitadas segun metadatos: ingles y coreano declarados.
- No se documenta soporte de tool calling ni function calling en esta cuantizacion.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta thinking mode, vision ni audio.
- Compatible con endpoints (tag `endpoints_compatible`) y con llama.cpp.

## Casos de uso

- Completado de texto y autocompletado en local: al ser un modelo base ejecutable con `llama-completion -no-cnv`, encaja en tareas de continuacion de prefijos (documentacion, redaccion asistida) sobre una GPU de 24 GB con contexto de hasta 128K.
- Prototipado rapido en estaciones de trabajo: el fichero Q4_K_M de 4,7 GB cabe en una RTX 4090 o RTX 3090 con 24 GB y contexto completo, lo que permite iterar sin infraestructura cloud.
- Evaluacion de cuantizaciones: la tabla de KL y top-1 del autor sirve para decidir si Q4_K_M es suficiente frente a Q5_K_M o Q6_K antes de fijar un formato en produccion.
- Despliegue en hardware con memoria unificada: segun la tabla del autor, el mismo fichero corre en DGX Spark, Mac Studio M5 Max/Ultra y GPUs H100, H200, B200 y B300 con contexto de 128K.
- Generacion de texto en ingles y coreano: los idiomas declarados permiten tareas de redaccion o resumen en esos dos idiomas, sin garantias para el castellano.
- Base para fine-tuning o destilacion: al ser un modelo base Apache 2.0, puede usarse como punto de partida para ajustes posteriores y redistribucion.

## Benchmarks y rendimiento

El autor no publica benchmarks de tareas (MMLU, HumanEval, GSM8K). Si publica metricas de fidelidad de la cuantizacion frente a BF16 medidas con llama.cpp:

| Cuantizacion | Tamano | WikiText-2 KL | WikiText-2 top-1 | Held-out KL | Held-out top-1 |
|---|---:|---:|---:|---:|---:|
| llama.cpp Q8_0 | 8,099 GB | 0,001140 | 98,123% | 0,001147 | 98,098% |
| llama.cpp Q6_K | 6,254 GB | 0,003983 | 96,627% | 0,003555 | 96,343% |
| llama.cpp Q5_K_M | 5,445 GB | 0,009130 | 95,392% | 0,006340 | 95,618% |
| Q4_K_M (esta publicacion) | 4,683 GB | 0,028921 | 91,828% | 0,017853 | 92,814% |
| llama.cpp Q3_K_M | 3,808 GB | 0,092205 | 86,279% | 0,063137 | 87,343% |

No se han publicado resultados de benchmarks de tareas en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el fichero Q4_K_M ocupa 4,683 GB; el autor anade el KV cache en f16 a la longitud de contexto elegida mas 2 GB de runtime, y exige que el total quede por debajo del 90% de la memoria disponible.
- GPU recomendadas: RTX 4090 y RTX 3090 (24 GB) con contexto de 128K; RTX 5090 (32 GB); RTX 6000 Ada o 2 x 24 GB (48 GB); H100 (80 GB); RTX PRO 6000 Blackwell (96 GB); H200 (141 GB); B200 (192 GB); B300 (288 GB).
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090 y RTX 5090, segun la tabla del autor.
- Memoria unificada: DGX Spark (128 GB), Mac Studio M5 Max (128 GB) y Mac Studio M5 Ultra (256 GB y 512 GB).
- Opciones de despliegue: llama.cpp (build `cd959bae` o posterior), con `llama-completion` para continuacion de texto; el tag `endpoints_compatible` sugiere compatibilidad con endpoints, aunque el autor no detalla que servidores.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---:|---|---|---|
| Xylolabs/Qwen2.5-7B-GGUF (esta ficha) | 7,6 B | 128K | GGUF Q4_K_M | Apache 2.0 | Solo Q4_K_M; tabla de KL y top-1 publicada |
| Qwen/Qwen2.5-7B (base original) | 7,6 B | 128K | safetensors (BF16) | Apache 2.0 | Referencia de calidad; requiere mas VRAM |
| Cuantizaciones Q4_K_M de llama.cpp | 7,6 B | 128K | GGUF | Apache 2.0 | Mismas metricas que esta publicacion (KL 0,028921) |
| llama.cpp Q5_K_M / Q6_K | 7,6 B | 128K | GGUF | Apache 2.0 | Mayor fidelidad (KL 0,009130 y 0,003983) a cambio de mas memoria |

## Limitaciones y advertencias

- Es un modelo base, no instruct: no esta ajustado para seguir instrucciones ni para conversacion; el autor lo ejecuta con `-no-cnv`.
- La cuantizacion Q4_K_M pierde calidad de forma medible: top-1 de 91,828% en WikiText-2 frente a 98,123% del Q8_0; si la tarea es sensible a la fidelidad, conviene usar Q5_K_M o Q6_K.
- Solo se publica un fichero (Q4_K_M); no hay variantes de mayor o menor precision en este repositorio.
- Idiomas declarados solo en y ko; el rendimiento en castellano no esta garantizado ni documentado.
- Riesgo de alucinacion inherente al modelo base; no hay evaluacion de sesgos en la model card.
- La licencia Apache 2.0 permite uso comercial, pero el autor remite a la release original de Qwen para la citacion y no detalla condiciones adicionales.
- Las fechas del repositorio (creado 2026-11-15) y las actualizaciones de la model card (2026-11-22) deben tomarse tal cual aparecen en los metadatos.
- No hay datos de latencia ni throughput, por lo que el dimensionamiento en produccion requiere medicion propia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/Qwen2.5-7B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B
- Licencia en el repo: https://huggingface.co/Xylolabs/Qwen2.5-7B-GGUF/blob/main/LICENSE
- llama.cpp (build referenciado): https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Repositorio de Xylolabs citado en la model card: https://github.com/XylolabsInc/tensix-bfp-gptq
