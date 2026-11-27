# Xylolabs/Raon-1-mini-Uncensored-MLX-8bit

## Resumen

Raon-1-mini Uncensored MLX 8-bit es una variante del modelo Raon-1-mini de KRAFTON, publicada por Xylolabs, en la que se ha eliminado la dirección de rechazo (refusal direction) de los pesos y se ha convertido a formato MLX cuantizado a 8 bits. El objetivo es ofrecer un modelo de generación de texto sin los mecanismos de rechazo del modelo original, manteniendo en lo posible la fidelidad respecto a la versión BF16 de referencia. Está pensado para ejecutarse en hardware Apple Silicon mediante la librería MLX.

El modelo conserva la arquitectura del Raon-1-mini original (etiquetado como MoE en los tags del repositorio) con aproximadamente 28.779 millones de parámetros totales y un tamaño de repositorio de 30,6 GB. Soporta coreano e inglés, y su licencia es Apache 2.0. La edición aplicada por Xylolabs consiste en eliminar una dirección por capa medida en cada capa concreta, con los canales 1031 y 189 puestos a cero, en las proyecciones de salida de atención de las capas 6 a 20, en las proyecciones down de expertos enrutados y compartidos de las capas 6 a 20 y en los vectores de effort-steering de las capas 12, 14, 16, 18 y 20 (1.955 tensores en total). La cabeza de salida y el embedding no se modifican.

La relevancia de esta ficha radica en que documenta un caso de fine-tuning de tipo abliteration sobre un modelo MoE, con métricas de fidelidad publicadas (KL y top-1 frente a BF16) y una evaluación de rechazo en HarmBench. Es un ejemplo útil para quien necesite evaluar el coste de eliminar mecanismos de rechazo en un modelo de razonamiento con modo thinking.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (según tags del repositorio); código `raon_mlx_model.py` de KRAFTON |
| Parámetros totales | 28.779.029.222 (dato real de safetensors) |
| Parámetros activos | no disponible |
| Longitud de contexto | 256K (según tabla de hardware de la model card) |
| Tipos de cuantización | Affine 8-bit, group size 64 (capas lineales, embedding y LM head); router gates MoE en BF16 |
| Idiomas soportados | coreano (ko), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), 30,6 GB |

## Arquitectura y entrenamiento

El modelo deriva de KRAFTON/Raon-1-mini, del que hereda la arquitectura y el entrenamiento original. Los tags del repositorio lo identifican como MoE, con expertos enrutados y compartidos (se mencionan proyecciones down de ambos tipos en la descripción de la edición). El código de modelo es el `raon_mlx_model.py` de KRAFTON/Raon-1-mini-mlx, incluido sin cambios. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

La intervención de Xylolabs es una edición de pesos, no un reentrenamiento: se elimina una dirección de rechazo por capa, medida en cada capa, en las proyecciones de salida de atención y en las proyecciones down de expertos de las capas 6 a 20, además de los vectores de effort-steering de las capas 12, 14, 16, 18 y 20. La cuantización es affine 8-bit con group size 64 para las capas lineales, el embedding y el LM head, mientras que los router gates del MoE permanecen en BF16. El modelo piensa por defecto (modo thinking activado); se puede desactivar con `enable_thinking: false` en la configuración de plantilla de chat.

## Capacidades

- Generación de texto conversacional en coreano e inglés.
- Razonamiento con modo thinking activado por defecto, desactivable por configuración.
- Comportamiento sin rechazo: 0,0% de rechazos en HarmBench (200 prompts con thinking off), frente al 99,0% del modelo original MLX 8-bit.
- Ejecución nativa en Apple Silicon mediante MLX y mlx-lm.
- Soporte de chat multi-turno a través de `mlx_lm.chat`.
- No se documenta en la información disponible soporte de tool calling, function calling, agentes, visión ni audio.

## Casos de uso

- Investigación sobre alineación y abliteration: permite comparar el comportamiento del modelo con y sin dirección de rechazo, usando las métricas de KL y top-1 publicadas frente a BF16 como referencia de fidelidad.
- Evaluación de robustez de salvaguardas: útil para medir hasta qué punto una edición de pesos elimina los rechazos en un modelo MoE, con HarmBench como banco de pruebas reproducible.
- Despliegue local en Mac Studio: con 30,6 GB en 8 bits cabe en configuraciones de 48 GB o más de memoria unificada, lo que permite ejecutar un modelo de ~28,8B parámetros en hardware de escritorio Apple.
- Generación de texto conversacional en coreano e inglés: el soporte bilingüe permite construir asistentes para esos dos idiomas con contexto de hasta 256K tokens.
- Procesamiento de documentos largos: la ventana de 256K facilita tareas de resumen o extracción sobre textos extensos en una sola pasada.
- Experimentación con modos de razonamiento: el modo thinking activable y desactivable permite comparar latencia y calidad de respuesta en pipelines de investigación.
- Fine-tuning posterior: al estar en Apache 2.0 y en formato MLX, sirve como base para ajustes adicionales o para destilación de comportamiento.

## Benchmarks y rendimiento

Datos publicados en la model card (fidelidad frente a Raon-1-mini BF16 y tasas de rechazo):

| Modelo | Tamaño | WikiText-2 KL | top-1 | Chat KL | top-1 | Held-out KL | top-1 | Check 33 ítems | HarmBench rechazados | Alpaca rechazados |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Uncensored MLX 8-bit | 30,60 GB | 0,015375 | 94,23% | 0,011652 | 94,53% | 0,007405 | 95,73% | 32/33 (BF16: 32/33) | 0,0% | 0,0% |
| Original MLX 8-bit | 30,60 GB | 0,009532 | 95,42% | 0,004958 | 96,55% | 0,003637 | 96,47% | 32/33 (BF16: 32/33) | 99,0% | 1,0% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- Memoria: el archivo 8-bit ocupa 30,6 GB; la variante 4-bit ocupa 19,9 GB.
- Hardware objetivo: Apple Silicon con memoria unificada. La model card recomienda Mac Studio M5 Max (40-core GPU) con 48, 64 o 128 GB, y Mac Studio M5 Ultra con 96, 256 o 512 GB para la versión 8-bit con contexto de 256K.
- Para 36 GB de memoria unificada (M5 Max, 32-core GPU) se recomienda la variante 4-bit de 19,9 GB.
- No cabe en GPUs consumer tipo RTX 4090 (24 GB) en 8 bits; requeriría la variante 4-bit o cuantizaciones menores no publicadas en esta información.
- Despliegue: MLX y mlx-lm (versiones probadas: mlx 0.32.4, mlx-lm 0.32.2, transformers 5.20.1), con `--trust-remote-code`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---:|---:|---|---|---|
| Raon-1-mini Uncensored MLX 8-bit | 28,78B | 256K | Apache 2.0 | MLX safetensors 8-bit | Sin rechazo (0,0% HarmBench) |
| Xylolabs/Raon-1-mini-MLX-8bit | 28,78B | 256K | Apache 2.0 | MLX safetensors 8-bit | Original con rechazo (99,0% HarmBench) |
| KRAFTON/Raon-1-mini | no disponible | no disponible | Apache 2.0 | BF16/MXFP8 | Modelo base sin editar |
| Xylolabs/Raon-1-mini-Uncensored-MLX-4bit | 28,78B | 256K | Apache 2.0 | MLX safetensors 4-bit (19,9 GB) | Misma edición, menor huella de memoria |

## Limitaciones y advertencias

- La eliminación de la dirección de rechazo degrada la fidelidad: el KL en WikiText-2 sube de 0,009532 a 0,015375 y el top-1 baja de 95,42% a 94,23% respecto al MLX 8-bit original.
- El modelo no rechaza peticiones dañinas (0,0% en HarmBench); esto lo hace inadecuado para despliegues públicos sin filtros externos de seguridad.
- Riesgo de alucinación: no se han publicado evaluaciones específicas de veracidad en la información disponible.
- Idiomas limitados a coreano e inglés; el rendimiento en castellano no está documentado.
- Requiere `--trust-remote-code` y versiones concretas de mlx, mlx-lm y transformers, lo que añade fricción de despliegue.
- El modo thinking está activado por defecto, lo que incrementa la latencia si no se desactiva explícitamente.
- Aunque la licencia es Apache 2.0, el uso comercial de un modelo sin mecanismos de rechazo conlleva riesgos legales y reputacionales que deben evaluarse por separado.
- Solo se distribuye en formato MLX; no hay GGUF ni otras cuantizaciones en la información disponible.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Raon-1-mini-Uncensored-MLX-8bit
- Modelo base: https://huggingface.co/KRAFTON/Raon-1-mini
- Versión MLX del modelo base: https://huggingface.co/KRAFTON/Raon-1-mini-mlx
- Variante original MLX 8-bit: https://huggingface.co/Xylolabs/Raon-1-mini-MLX-8bit
- Variante 4-bit: https://huggingface.co/Xylolabs/Raon-1-mini-Uncensored-MLX-4bit
- Repositorio de Xylolabs: https://github.com/XylolabsInc/tensix-bfp-gptq
- MLX: https://github.com/ml-explore/mlx
