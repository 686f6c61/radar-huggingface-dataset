# Xylolabs/gemma-4-26B-A4B-it-MLX-4bit

## Resumen

`Xylolabs/gemma-4-26B-A4B-it-MLX-4bit` es una cuantizacion en 4 bits del modelo `google/gemma-4-26B-A4B-it`, publicada por Xylolabs y empaquetada en formato MLX para su uso con `mlx-lm` sobre hardware Apple Silicon. El modelo base es un transformer de tipo mixture-of-experts (MoE) de 25.233.053.440 parametros totales, segun los pesos en safetensors del repositorio, con aproximadamente 4B de parametros activos por token (indicado por el sufijo A4B). Esta version elimina la torre de vision y conserva unicamente la parte de texto.

La relevancia de esta ficha radica en que permite ejecutar un modelo de 26B parametros en equipos con memoria unificada de gama alta (Mac Studio, MacBook Pro con M-series Max/Ultra) sin necesidad de GPUs dedicadas, gracias a la cuantizacion afina con tamano de grupo 64 y a la estrategia mixta de precision que mantiene algunas proyecciones MLP en 8 bits. El repositorio ocupa 14,5 GB, lo que lo hace manejable en configuraciones de 32 GB o superiores.

El modelo se publica bajo licencia Apache 2.0 y esta orientado a generacion de texto y conversacion. No se dispone de informacion sobre los idiomas soportados ni sobre el contexto maximo en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mixture-of-experts (MoE); inferencia via MLX |
| Parametros totales | 25.233.053.440 |
| Parametros activos | no disponible (el sufijo A4B sugiere ~4B, sin confirmacion en la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits afina (group size 64, escalas y sesgos en float16); proyecciones `mlp.down_proj`, `mlp.gate_proj`, `mlp.up_proj` y `router.proj` de las capas 0-29 en 8 bits; normas en float16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), repositorio de 14,5 GB |

## Arquitectura y entrenamiento

El modelo base es `google/gemma-4-26B-A4B-it`, un transformer con capas de mezcla de expertos segun la nomenclatura del identificador. La cuantizacion realizada por Xylolabs aplica cuantizacion afina (affine quantization) con tamano de grupo 64, escalas y sesgos en float16, sobre todos los pesos lineales y el embedding de tokens (incluida la LM head), excepto las proyecciones `mlp.down_proj`, `mlp.gate_proj`, `mlp.up_proj` y `router.proj` de las capas 0 a 29, que se mantienen en 8 bits. Las normas y el resto de tensores no cuantizados se conservan en float16.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni sobre si el modelo base utilizo RLHF, DPO u otras tecnicas de alineamiento. Tampoco se detalla ninguna innovacion arquitectonica especifica mas alla de la naturaleza MoE del modelo base. La conversion elimina explicitamente la torre de vision, por lo que esta version es solo de texto.

## Capacidades

- Generacion de texto y conversacion multi-turno (pipeline `text-generation`, tag `conversational`).
- Razonamiento y respuesta a preguntas, segun la evaluacion de 7 preguntas incluida en la model card (7/7 aciertos en 4 bits, 8 bits y BF16).
- Capacidad multilingue: la evaluacion de precision incluye conversaciones en ingles y coreano, lo que sugiere soporte al menos para esos idiomas; no se detalla la lista completa.
- No incluye vision: la torre de vision fue eliminada en la conversion.
- Soporte de tool calling, function calling, agentes y modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon: ejecutar el modelo con `mlx-lm` en Mac con memoria unificada de 32 GB o mas, aprovechando el formato MLX nativo y el tamano de 14,5 GB para desarrollo y prototipado sin GPU dedicada.
- Asistentes conversacionales de escritorio: integrar el modelo en aplicaciones macOS mediante `mlx-lm` para conversaciones multi-turno en local, con la ventaja de privacidad al no requerir envio de datos a la nube.
- Evaluacion y experimentacion con modelos MoE cuantizados: comparar el comportamiento de un MoE de 26B en 4 bits frente a BF16 usando las metricas de KL y top-1 publicadas por el autor.
- Generacion de texto en pipelines de investigacion: usar el modelo como componente de generacion en experimentos que requieran ejecucion reproducible en hardware Apple, con la version 8-bit disponible como referencia de mayor fidelidad.
- Despliegue en entornos con restricciones de memoria: el tamano de 14,47 GB permite cargar el modelo en equipos donde la version BF16 (50,51 GB) no cabria.
- Prototipado de aplicaciones multilingues: la evaluacion con conversaciones en ingles y coreano sugiere uso en escenarios que requieran al menos esos idiomas, aunque la cobertura completa no esta documentada.

## Benchmarks y rendimiento

La model card incluye metricas de fidelidad de la cuantizacion (divergencia KL y acuerdo top-1) frente a un GGUF BF16 de llama.cpp, sobre texto con plantilla de chat (4 conversaciones en ingles y 4 en coreano, 8 x 511 tokens evaluados):

| Cuantizacion | Tamano | KL | top-1 | Chequeo de 7 preguntas |
|---|---:|---:|---:|---:|
| MLX 4-bit | 14,47 GB | 0,153050 | 86,67% | 7/7 |
| MLX 8-bit | 26,81 GB | 0,005099 | 97,60% | 7/7 |
| BF16 | 50,51 GB | no disponible | no disponible | 7/7 |

El autor senala ademas que en texto sin plantilla (WikiText-2 y texto retenido) la divergencia KL es mucho mayor en todas las pilas evaluadas, incluido el Q8_0 de llama.cpp. No se han publicado resultados de benchmarks de tarea (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: 14,47 GB para los pesos en 4 bits; se recomienda al menos 16-24 GB de memoria unificada disponible para margen de contexto y overhead de `mlx-lm`.
- Hardware objetivo: Apple Silicon (M1/M2/M3/M4 en variantes Pro, Max o Ultra) con memoria unificada suficiente; el formato MLX no esta pensado para GPUs NVIDIA.
- GPU dedicadas (A100, H100, RTX 4090): no aplicables a este formato; para esas plataformas habria que usar el modelo base o conversiones GGUF/vLLM.
- Cabe en consumer hardware: si, en Mac con 32 GB o mas de memoria unificada; en configuraciones de 16 GB el margen es muy ajustado.
- Opciones de despliegue: `mlx-lm` version 0.32.2 (requerida segun la model card); comando de ejemplo: `mlx_lm.generate --model Xylolabs/gemma-4-26B-A4B-it-MLX-4bit --prompt "..."`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Plataforma |
|---|---|---|---|---|---|
| Xylolabs/gemma-4-26B-A4B-it-MLX-4bit | 25,23B totales (MoE) | no disponible | 4-bit MLX | Apache 2.0 | Apple Silicon (MLX) |
| Xylolabs/gemma-4-26B-A4B-it-MLX-8bit (referencia en la model card) | 25,23B totales (MoE) | no disponible | 8-bit MLX, 26,81 GB | Apache 2.0 | Apple Silicon (MLX) |
| google/gemma-4-26B-A4B-it (modelo base) | 25,23B totales (MoE) | no disponible | BF16, 50,51 GB | Apache 2.0 | Multiples |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion en 4 bits introduce una divergencia KL de 0,153050 y un acuerdo top-1 del 86,67% frente a BF16 en texto con plantilla de chat; en texto sin plantilla la divergencia es notablemente mayor, lo que puede afectar a tareas de generacion libre.
- El modelo no incluye vision; cualquier caso de uso que requiera imagenes debe usar el modelo base.
- No se documentan sesgos conocidos, riesgo de alucinacion ni limitaciones de idioma mas alla de la evaluacion en ingles y coreano.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los ficheros `LICENSE` y `NOTICE` del repositorio por si el modelo base impone condiciones adicionales.
- Requiere `mlx-lm==0.32.2`; versiones distintas pueden no cargar los pesos correctamente.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion de la comunidad.
- El modelo esta restringido a hardware Apple Silicon; no es portable a CUDA sin reconversion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/gemma-4-26B-A4B-it-MLX-4bit
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Libreria MLX: https://github.com/ml-explore/mlx
- Repositorio de la herramienta de cuantizacion de Xylolabs: https://github.com/XylolabsInc/tensix-bfp-gptq
