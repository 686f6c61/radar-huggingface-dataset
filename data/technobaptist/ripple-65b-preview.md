# TechnoBaptist/Ripple-65B-Preview

## Resumen

Ripple-65B Preview es un modelo de lenguaje denso de 65.000 millones de parámetros desarrollado por Ricursive Intelligence. Se trata de un transformer denso (no MoE) entrenado desde cero sobre 12 billones de tokens de texto y código, predominantemente en inglés, con una longitud de contexto que alcanza hasta 1 millón de tokens. El modelo se presenta como una alternativa eficiente a los grandes modelos MoE de otros laboratorios, apostando por una arquitectura "thin-and-deep" que reduce la complejidad de la infraestructura de entrenamiento y servicio.

La relevancia del modelo radica en su rendimiento en tareas de codificación agéntica: según la model card, obtiene 80,52 en TerminalBench 2.1, superando a modelos estadounidenses de pesos abiertos mucho mayores como Reflection Beam 501B (80,1), Meta Muse Spark Open 816B (76,4), Thinking Machines Inkling 975B (63,8) y NVIDIA Nemotron 3 Ultra 550B (56,4). Con solo 65B de parámetros totales, el modelo puede ejecutarse en hardware de consumo como una NVIDIA DGX Spark, y alcanza 250 tok/s en 2xB200 con batch=8 antes de cuantización.

Esta es una versión Preview con post-entrenamiento relativamente ligero, centrada en codificación agéntica. Se distribuye bajo licencia Apache 2.0 en BF16 (este repositorio), junto con variantes NVFP4, un modelo base y una versión DFlash2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, estilo Gemma 3N, thin-and-deep (d_model 5120, 80 capas) |
| Parametros totales | 64.782.689.360 (64,78B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Hasta 1M tokens (entrenado en long context hasta 2M de seqlen) |
| Tipos de cuantizacion | BF16 (este repo), NVFP4 (repo separado) |
| Idiomas soportados | Predominantemente inglés (no se detalla lista completa) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (custom_code) |

## Arquitectura y entrenamiento

Ripple-65B es un transformer denso con una relación de aspecto "thin-and-deep": d_model de 5120 y 80 capas totales. Abandona la arquitectura tipo Llama de Olmo 3 (su baseline inicial) en favor de una arquitectura tipo Gemma 3N para mejorar la estabilidad del entrenamiento a escala. Para mejorar el razonamiento, sobreaprovisiona el número de cabezas de atención, incrementa la ratio de capas SWA (sliding window attention) frente a globales y reduce la ventana SWA para compensar el coste. Incorpora además clipping de activaciones en la FFN, atención con compuertas (gated attention), NoPE global y value residuals. El entrenamiento se realizó en BF16 sin kernels personalizados, con un MFU del 40% y sharding simple, escalando de 1 a 5 personas durante el desarrollo.

El pipeline de entrenamiento consta de: pretraining sobre 12T tokens a 8K de secuencia (877.500 pasos, batch 1408→3072); midtraining de 200B tokens a 64K (8.000 pasos, batch 384); long context de 6,5B tokens a 2M de secuencia (389 pasos, batch 8); SFT de 183B tokens a 128K (7.274 pasos, batch 192); long context SFT de 13,5B tokens a 2M (802 pasos, batch 8); y RL mixto multi-dominio de 700 pasos a 128K con batch 2048. La escalera Ripple v1 mejora la eficiencia de cómputo en código 16x respecto a la de Olmo 3, llegando a 55x en la ejecución completa. El modelo base es un checkpoint solo de pretraining, sin midtraining ni datos sintéticos de QA.

## Capacidades

- Generación de texto y razonamiento en inglés.
- Codificación agéntica: principal foco del post-entrenamiento, con resultados destacados en TerminalBench 2.1.
- Razonamiento multi-paso y uso de herramientas en entornos de terminal (evaluado con el harness Terminus 2).
- Contexto largo: soporte de hasta 1M tokens, con entrenamiento en secuencias de hasta 2M.
- Capacidades de agente para tareas de codificación y automatización.
- No se documentan capacidades de visión, audio ni modos de "thinking" explícitos en la información disponible.
- Capacidades multilingües no detalladas; el corpus es predominantemente inglés y código.

## Casos de uso

- Automatización de tareas en terminal: el modelo está específicamente entrenado y evaluado para resolver tareas de línea de comandos (TerminalBench 2.1), por lo que encaja en agentes que ejecutan comandos, inspeccionan ficheros y depuran entornos.
- Asistente de codificación en IDE o CI/CD: con soporte de contexto largo y razonamiento multi-paso, puede revisar repositorios completos, proponer parches y validar cambios en pipelines automatizados.
- Agente de resolución de incidencias: su capacidad de razonamiento agéntico permite diagnosticar fallos, leer logs extensos (hasta 1M tokens de contexto) y aplicar correcciones de forma iterativa.
- Despliegue local en hardware de consumo: al caber en una NVIDIA DGX Spark y ofrecerse en NVFP4, es adecuado para desarrollo local de agentes sin depender de la nube.
- Procesamiento de documentos largos: la ventana de hasta 1M tokens permite analizar bases de código, documentación técnica o expedientes extensos en una sola pasada.
- Servicio de inferencia de alto rendimiento: con 250 tok/s en 2xB200 (batch=8) antes de cuantización, es apto para servir cargas interactivas en centros de datos con GPUs NVIDIA.
- Generación de código en producción: puede integrarse en pipelines de revisión automática y generación de tests gracias a su entrenamiento en código y su licencia Apache 2.0.

## Benchmarks y rendimiento

La model card incluye resultados de TerminalBench 2.1 comparando con modelos de pesos abiertos estadounidenses. No se dispone de la tabla completa de benchmarks en la información proporcionada (la tabla aparece truncada), por lo que solo se recogen los datos explícitamente citados en el texto.

| Benchmark | Ripple-65B Preview | Reflection Beam 501B | Muse Spark Open 816B | Inkling 975B | Nemotron 3 Ultra 550B |
|---|---|---|---|---|---|
| TerminalBench 2.1 | 80,52 | 80,1 | 76,4 | 63,8 | 56,4 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 130 GB solo para pesos (el repo ocupa 129,6 GB), más overhead de activaciones y KV cache; requiere GPUs de centro de datos con memoria agregada suficiente.
- VRAM estimada en NVFP4: aproximadamente 32-33 GB para pesos, lo que permite ejecución en una sola GPU de 48 GB o en hardware de consumo de gama alta con suficiente memoria.
- GPU recomendadas: NVIDIA B200 (250 tok/s en 2xB200 con batch=8), H100, A100 80GB para BF16; NVIDIA DGX Spark para la variante NVFP4.
- Cabe en hardware de consumo: sí, según el autor, en una NVIDIA DGX Spark con el checkpoint NVFP4.
- Opciones de despliegue: requiere `custom_code` (no es un transformer estándar de transformers/llama.cpp sin adaptación); no se confirman soportes de vLLM, TGI, llama.cpp u Ollama en la información disponible.
- Latencia y throughput: 250 tok/s en 2xB200 con batch=8 antes de cuantización o kernels personalizados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | TerminalBench 2.1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ripple-65B Preview | 64,78B (denso) | Hasta 1M | 80,52 | Apache 2.0 | HuggingFace (BF16, NVFP4, base) |
| Reflection Beam 501B | 501B | No disponible | 80,1 | No disponible | Pesos abiertos (EE. UU.) |
| Muse Spark Open 816B | 816B | No disponible | 76,4 | No disponible | Pesos abiertos (EE. UU.) |
| Inkling 975B | 975B | No disponible | 63,8 | No disponible | Pesos abiertos (EE. UU.) |
| Nemotron 3 Ultra 550B | 550B | No disponible | 56,4 | No disponible | Pesos abiertos (EE. UU.) |

Ripple-65B destaca por lograr un rendimiento comparable o superior a modelos con más de 10 veces sus parámetros totales, con la ventaja de ser denso y ejecutable en hardware de consumo en su variante NVFP4.

## Limitaciones y advertencias

- Es una versión Preview con post-entrenamiento "relativamente ligero"; cabe esperar un rendimiento inferior al de una versión final en tareas fuera del foco de codificación agéntica.
- El corpus de entrenamiento es predominantemente inglés y código; el rendimiento en otros idiomas no está documentado y probablemente sea limitado.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan mitigaciones específicas.
- No se detallan sesgos conocidos ni evaluaciones de seguridad en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero el modelo requiere `custom_code` para cargarse, lo que puede complicar la integración en stacks estándar.
- La replicación de benchmarks agénticos es difícil; el propio autor advierte que los resultados pueden variar según el harness y la longitud de secuencia.
- El contexto de 1M de tokens tiene un coste elevado en memoria KV cache; en BF16 no es viable en hardware de consumo.
- No se confirma soporte en frameworks de inferencia comunes (vLLM, llama.cpp, TGI), lo que limita las opciones de despliegue en producción.

## Enlaces

- HuggingFace (este repo, BF16 instruct): https://huggingface.co/TechnoBaptist/Ripple-65B-Preview
- HuggingFace (repo del autor, BF16): https://huggingface.co/ricursiveAI/Ripple-65B-Preview
- HuggingFace (NVFP4): https://huggingface.co/ricursiveAI/Ripple-65B-Preview-NVFP4
- HuggingFace (modelo base): https://huggingface.co/ricursiveAI/Ripple-65B-Base-Preview
- HuggingFace (DFlash2): https://huggingface.co/ricursiveAI/Ripple-65B-Preview-DFlash2
- Blog de lanzamiento: https://www.ricursive.com/ripple
- Licencia: https://huggingface.co/ricursiveAI/Ripple-65B-Preview/blob/main/LICENSE
