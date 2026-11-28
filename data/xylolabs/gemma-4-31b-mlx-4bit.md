# Xylolabs/gemma-4-31B-MLX-4bit

## Resumen

`Xylolabs/gemma-4-31B-MLX-4bit` es una cuantizacion en 4 bits del modelo `google/gemma-4-31B`, convertida al formato MLX para su uso con la libreria `mlx-lm` en hardware Apple Silicon. La publica Xylolabs y esta pensada exclusivamente para generacion de texto: el tower de vision del modelo original se ha eliminado del checkpoint, por lo que no hereda las capacidades multimodales de la variante base.

El modelo conserva los 30.697.345.280 parametros del original (aproximadamente 30,7 mil millones) pero reduce el peso en disco de 61,39 GB en BF16 a 17,73 GB en 4 bits, lo que permite ejecutarlo en equipos con memoria unificada de gama alta (Mac Studio, MacBook Pro con M-series Max/Ultra). La cuantizacion es afin con grupo de tamano 64 y escalas y sesgos en bfloat16, con capas selectivas en 6 bits para preservar calidad.

Es relevante porque demuestra un compromiso medido entre compresion y fidelidad: la divergencia KL frente al BF16 original es de 0,068 en WikiText-2 (frente a 0,0024 en 8 bits), con una coincidencia top-1 del 90,52%. Es una opcion practica para desarrolladores que quieran probar un modelo de ~31B en local sobre macOS sin acceso a GPU dedicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de google/gemma-4-31B); no se detalla en la model card |
| Parametros totales | 30.697.345.280 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (afin, group size 64) con capas selectivas en 6 bits; existe variante 8 bits del mismo autor |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), libreria `mlx-lm` |

## Arquitectura y entrenamiento

El checkpoint es una conversion del modelo `google/gemma-4-31B` a MLX, no un entrenamiento propio. La model card no detalla la arquitectura interna del modelo base (tipo de atencion, capas, dimensiones ocultas) ni los datos de entrenamiento, numero de tokens, composicion del dataset o tecnicas de alineacion (RLHF/DPO). Tampoco se indica si el modelo original usa atencion lineal, decodificacion especulativa u otras innovaciones.

La innovacion tecnica de esta publicacion es la estrategia de cuantizacion: cuantizacion afin con grupo de tamano 64, escalas y sesgos en bfloat16, y 4 bits aplicados a todas las capas lineales, al embedding de tokens y al LM head, excepto `mlp.down_proj` en las capas 0-6 y 53-59 y `self_attn.v_proj` en las capas 0-4, 6 y 54-58, que se mantienen en 6 bits. Las normas y el resto de tensores no cuantizados quedan en bfloat16. El tower de vision se ha eliminado explicitamente.

## Capacidades

- Generacion de texto autoregresiva (pipeline `text-generation`).
- Razonamiento y generacion de codigo y matematicas: heredadas del modelo base, aunque no se documentan evaluaciones especificas en esta ficha.
- Capacidades multilingues: no documentadas en la model card; dependen del modelo base, no verificadas aqui.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Vision: **no soportada** (el tower de vision se ha eliminado en esta conversion).
- Audio: no disponible.
- Modo "thinking": no documentado.

## Casos de uso

- **Inferencia local en Mac con memoria unificada**: ejecutar un modelo de ~31B en un Mac Studio o MacBook Pro con 32-64 GB de memoria unificada usando `mlx-lm`, sin GPU dedicada. Los 17,73 GB del checkpoint 4 bits caben en configuraciones de 24 GB o mas.
- **Prototipado rapido en macOS**: validar prompts, flujos de generacion y comportamiento del modelo Gemma 4 antes de desplegar la version completa en servidores, gracias a la API de `mlx-lm` y al comando `mlx_lm.generate`.
- **Generacion de texto en lote sobre documentos**: procesar corpus de texto (resumenes, reescritura, extraccion) en local con un modelo de calidad cercana al BF16 (90,52% de coincidencia top-1), evitando costes de API.
- **Asistentes de escritura y edicion**: tareas de redaccion, correccion y transformacion de texto en herramientas de escritorio para macOS, donde MLX aprovecha los cores de GPU y Neural Engine de Apple Silicon.
- **Investigacion sobre cuantizacion**: servir como referencia reproducible para estudiar el impacto de la cuantizacion 4 bits frente a 8 bits y BF16, ya que el autor publica metricas de KL y top-1 en tres conjuntos (WikiText-2, chat y texto reservado).
- **Entornos con requisitos de privacidad**: procesamiento de texto sensible en local sin enviar datos a servicios externos, al ser un modelo ejecutable en el propio equipo.

## Benchmarks y rendimiento

El autor publica unicamente metricas de fidelidad de cuantizacion (KL y top-1 frente al BF16 de MLX), no benchmarks de tareas como MMLU, HumanEval o GSM8K.

| Cuantizacion | Tamano | WikiText-2 KL | top-1 | Chat KL | top-1 | Held-out KL | top-1 | Answer check |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| MLX 8-bit | 32,62 GB | 0,002411 | 98,21% | 0,002388 | 98,45% | 0,002419 | 98,16% | 6/7 |
| MLX 4-bit | 17,73 GB | 0,068070 | 90,52% | 0,055519 | 91,22% | 0,074856 | 89,61% | 6/7 |
| BF16 | 61,39 GB | — | — | — | — | — | — | 6/7 |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- **VRAM/memoria unificada estimada**: 17,73 GB de pesos en 4 bits; se recomienda al menos 24 GB de memoria unificada para dejar margen al contexto y al runtime. La variante 8 bits requiere 32,62 GB.
- **Hardware objetivo**: Apple Silicon (M-series). Requiere `mlx-lm==0.32.2` o superior; no funciona en GPU NVIDIA/AMD ni en CPU x86 con esta libreria.
- **GPU recomendadas**: no aplica GPU dedicada; el modelo esta pensado para chips Apple M1/M2/M3/M4 (Pro, Max y Ultra). No se especifican modelos concretos ni configuraciones minimas en la model card.
- **Cabe en consumer**: si, en equipos Apple con memoria unificada suficiente (Mac Studio, MacBook Pro de gama alta). No cabe en GPUs de consumo con 8-16 GB de VRAM por el formato MLX.
- **Opciones de despliegue**: `mlx-lm` (comando `mlx_lm.generate` y API Python). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son compatibles con este formato.
- **Latencia y throughput**: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / hardware | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs/gemma-4-31B-MLX-4bit | 30,7 B | no disponible | MLX safetensors, Apple Silicon | Apache 2.0 | Hugging Face |
| Xylolabs/gemma-4-31B-MLX-8bit | 30,7 B | no disponible | MLX safetensors, Apple Silicon | Apache 2.0 | Hugging Face |
| google/gemma-4-31B (BF16) | 30,7 B | no disponible | safetensors, GPU/CPU | Apache 2.0 (segun la model card del derivado) | Hugging Face |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la documentacion proporcionada. Las metricas de rendimiento de tareas del modelo base no se han publicado en esta ficha.

## Limitaciones y advertencias

- **Sin vision**: el tower de vision se ha eliminado; no es posible usarlo para tareas de imagen.
- **Solo Apple Silicon**: el formato MLX no es portable a GPU NVIDIA/AMD ni a CPU x86 con las herramientas habituales (vLLM, llama.cpp, TGI).
- **Perdida de calidad medible**: la cuantizacion 4 bits degrada la fidelidad frente a BF16 (KL 0,068 frente a 0,0024 en 8 bits; top-1 90,52% frente a 98,21%), lo que puede afectar a tareas sensibles a la precision.
- **Dependencia de version**: requiere `mlx-lm==0.32.2`; versiones distintas pueden no cargar el checkpoint correctamente.
- **Sesgos y alucinacion**: no documentados en la model card; se heredan del modelo base y no se han evaluado en esta conversion.
- **Idiomas y contexto**: no documentados; no se puede garantizar comportamiento multilingue ni una ventana de contexto concreta.
- **Licencia**: Apache 2.0 segun la model card del derivado, con aviso de modificaciones en `NOTICE`. Conviene verificar la licencia del modelo base `google/gemma-4-31B` antes de uso comercial.
- **Repo con 0 descargas y 0 likes**: publicacion muy reciente (28-11-2026) sin validacion comunitaria; usar con cautela en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/gemma-4-31B-MLX-4bit
- Modelo base: https://huggingface.co/google/gemma-4-31B
- Variante 8 bits: https://huggingface.co/Xylolabs/gemma-4-31B-MLX-8bit
- Libreria MLX: https://github.com/ml-explore/mlx
- Repositorio del autor (referenciado en la model card): https://github.com/XylolabsInc/tensix-bfp-gptq
