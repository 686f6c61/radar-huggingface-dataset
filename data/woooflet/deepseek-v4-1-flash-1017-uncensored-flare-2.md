# woooflet/DeepSeek-V4.1-Flash-1017-uncensored-FLARE

## Resumen

DeepSeek-V4.1-Flash-1017-uncensored-FLARE es un paquete de despliegue listo para servir del checkpoint `dealignai/DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8`, publicado por el usuario woooflet (Ford Morris). No se trata de un modelo nuevo entrenado desde cero, sino de un reempaquetado de los pesos originales en formato Flare para su ejecución sobre un clúster de 4 nodos DGX Spark (GB10) con paralelismo tensorial TP4 y anillo RoCE. Los pesos son, segun el autor, bit a bit idénticos al release de dealignai; lo que cambia es el empaquetado, la firma y la configuración de servicio.

El modelo base es una variante "uncensored" (abliterada) de DeepSeek-V4.1-Flash-1017, un transformer multimodal (image-text-to-text) con mezcla de expertos, torre de visión, bloque MTP/DSpark para decodificación especulativa y tablas Engram. La edición de abliteración toca únicamente 108 de los 96.085 tensores (familias `attn.wo_b` y `ffn.shared_experts.w2`, capas 10–36), dejando intactos los expertos enrutados, la visión, los embeddings y la cabeza LM.

Su relevancia es doble: por un lado, demuestra un flujo de exportación reproducible con Ignition sobre hardware GB10; por otro, publica una auditoría tensor a tensor y una comparación de rendimiento contra el paquete stock, incluyendo el coste medido de la abliteración en MMLU (−1,05 pp) y su efecto en tasas de rechazo (0/8 en modo chat y think). El repositorio ocupa 509,3 GB y la licencia declarada es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con MoE, torre de vision, bloque MTP/DSpark y tablas Engram |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (checkpoint base); compresion de escala de expertos CSF y cuantizacion de cabeza Markov en FP8 en el export |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors empaquetados como paquete Flare (509,3 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer con mezcla de expertos (MoE) que incorpora una torre de visión (pipeline image-text-to-text), un bloque MTP/DSpark para decodificación especulativa con 5 tokens borrador y verificación adaptativa (alpha 0,75 en servicio), y tablas Engram. La auditoría del autor confirma 96.085 tensores con el mismo conjunto de nombres que el modelo stock `deepseek-ai/DeepSeek-V4.1-Flash-1017`, sin diferencias en `config.json`.

La edición "uncensored" es una abliteración convencional pero más estrecha y profunda que la habitual: afecta a 108 tensores (54 de `attn.wo_b` y 54 de `ffn.shared_experts.w2`, con peso y escala) en las capas 10–36. La fracción media de bytes modificados por tensor es 0,285 (mediana 0,172, máximo 0,617). Permanecen bit a bit idénticos los 94.464 tensores de expertos enrutados, las tablas Engram, el bloque MTP/DSpark, la torre de visión, los embeddings, las normas y la cabeza LM. No se dispone de información sobre el dataset de entrenamiento original, el número de tokens ni si hubo RLHF o DPO.

El export se realizó con Ignition (NVIDIA/spark-local-inference en el commit `972e28e44781d8d0c84d70ae434db92c36076a43`), que incluye los PR #129 y #158 sobre ordenación de copias completas y MTP. La topología de servicio es TP4 sobre 4× DGX Spark (GB10) con anillo RoCE, compresión CSF por defecto, `--markov-head-quantization fp8`, muestreo paralelo de vocabulario, concurrencia máxima 32 y chunk de prefill de 8192.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" activable.
- Procesamiento de imagen y texto (pipeline image-text-to-text con torre de visión).
- Generación de código: HumanEval pass@1 de 0,9451 en el arnés del autor.
- Razonamiento matemático: GSM8K de 0,960.
- Conocimiento general y científico: MMLU 0,8709 y GPQA Diamond 0,7323.
- Decodificación especulativa MTP/DSpark con 5 tokens borrador y verificación adaptativa.
- Comportamiento sin rechazos en la batería de prompts dañinos del autor (0/8 en chat y en think).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Servicio de inferencia multimodal en clúster propio: el paquete se lanza con un único comando `flare orbit run` sobre 4× DGX Spark y expone un endpoint HTTP en el puerto 8000, adecuado para equipos que ya operan hardware GB10 y quieren evitar el trabajo de exportación.
- Evaluación de seguridad y alineación: la batería de 8 prompts dañinos con 0 rechazos permite estudiar el comportamiento de un modelo abliterado frente a uno stock en condiciones controladas, comparando tasas de rechazo y KL.
- Investigación sobre abliteración: la auditoría tensor a tensor (108 tensores modificados, familias y capas identificadas) sirve como caso de estudio reproducible para medir el coste de la edición en MMLU, GPQA y KL.
- Generación de código asistida: con HumanEval pass@1 de 0,9451 y GSM8K de 0,960, es apto para tareas de síntesis de código y razonamiento matemático en pipelines internos.
- Razonamiento científico de alta dificultad: GPQA Diamond de 0,7323, el más alto de los tres endpoints comparados, lo hace útil para preguntas de nivel posgrado en dominios técnicos.
- Procesamiento de documentos con imagen: al ser image-text-to-text, puede emplearse para extracción y descripción de contenido visual combinado con texto en flujos de digitalización.
- Benchmarking de stacks de servicio: las métricas de velocidad (69,8 tok/s en C1 y 195,8 tok/s en C8) permiten comparar configuraciones de TP4, RoCE y MTP sobre GB10.

## Benchmarks y rendimiento

Resultados medidos por el autor el 2026-11-09 sobre un único fleet de 4× DGX Spark (TP4, anillo RoCE), con temperatura y top-p fijos de 1,0 y thinking activado. Son indicadores relativos frente al paquete stock servido de forma idéntica, no benchmarks generales.

| Tarea | Stock Flare (LIL gb10) | Abliterated-FLARE (hermano) | Uncensored-FLARE (este repo) |
|---|---:|---:|---:|
| MMLU (n=1425) | 0,8814 | 0,8849 | 0,8709 |
| GPQA Diamond (n=198) | 0,697 | 0,702 | 0,7323 |
| GSM8K (n=250) | 0,944 | 0,956 | 0,960 |
| HumanEval pass@1 (n=164) | 0,9512 | 0,939 | 0,9451 |
| KL vs stock, muestra de Pile (menor = más cercano) | 0,100 (suelo de control) | 0,126 | 0,213 |
| Velocidad de servicio C1 / C8 (tok/s) | 62,4 / 207,3 | 57,7 / 197,7 | 69,8 / 195,8 |
| Banderas de rechazo, chat / think (de 8) | 4 / 5 | 0 / 2 | 0 / 0 |

El coste medido de la abliteración es de −1,05 pp en MMLU (0,8709 frente a 0,8814), muy por debajo del −3,86 pp publicado por dealignai, que el autor no consigue reproducir con su arnés. Las cifras KL proceden de un método muestreado del lado del servicio y deben leerse contra el control stock-vs-stock, no contra cero.

## Requisitos de hardware

- Clúster de 4× DGX Spark (GB10) con paralelismo tensorial TP4 y anillo RoCE; es la topología validada por el autor.
- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 509,3 GB y se sirve con almacenamiento en disco para la tabla de embeddings (`--embedding-table-storage disk`) y caché de 1 GiB.
- GPU recomendadas: DGX Spark GB10 en configuración de 4 nodos. No se documenta compatibilidad con A100, H100 ni RTX 4090.
- Inferencia en GPU de consumo: no disponible; el paquete está diseñado para el runtime Flare sobre GB10.
- Opciones de despliegue: Flare (`flare orbit run`) sobre el runtime `flare-inference` sin parches; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput medidos: 69,8 tok/s con concurrencia 1 y 195,8 tok/s con concurrencia 8, con concurrencia máxima configurada de 32.
- Firma: el paquete usa una clave de desarrollo local (namespace `local-development`), por lo que el primer arranque exige aceptar la confianza del publicador.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU | GPQA Diamond | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Uncensored-FLARE (este repo) | no disponible | no disponible | 0,8709 | 0,7323 | MIT | Paquete Flare, 509,3 GB |
| Stock Flare (LIL gb10) | no disponible | no disponible | 0,8814 | 0,697 | no disponible | Paquete Flare |
| Abliterated-FLARE (hermano) | no disponible | no disponible | 0,8849 | 0,702 | no disponible | Paquete Flare |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 | no disponible | no disponible | no disponible | no disponible | no disponible | Pesos stock en Hugging Face |

## Limitaciones y advertencias

- Modelo abliterado: la eliminación de rechazos (0/8 en chat y think) implica que puede generar contenido dañino sin filtros; requiere moderación externa en producción.
- Riesgo de alucinación: no se han publicado métricas de fidelidad factual ni de calibración; los benchmarks presentados son de respuesta generada, no de veracidad.
- Los benchmarks proceden de un único fleet, un único arnés y una única fecha (2026-11-09); no son comparables directamente con evaluaciones generales de terceros.
- El incremento de KL frente al stock (0,213 frente al suelo de control de 0,100) indica una desviación de distribución medible que puede afectar a tareas fuera de las evaluadas.
- Idiomas soportados no documentados; no hay garantía de rendimiento multilingüe.
- Longitud de contexto no especificada en la información disponible.
- El paquete está firmado con una clave de desarrollo local; aceptar esa confianza tiene implicaciones de seguridad que deben evaluarse antes de desplegar.
- Requiere hardware específico (4× DGX Spark GB10, TP4, RoCE); no hay evidencia de funcionamiento en otras configuraciones.
- La licencia MIT se declara en el repositorio, pero el modelo base y el checkpoint de dealignai pueden tener condiciones adicionales no reflejadas aquí.
- El autor no publica especificación de edición del checkpoint base; la auditoría tensor a tensor es suya y no ha sido verificada de forma independiente en la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/woooflet/DeepSeek-V4.1-Flash-1017-uncensored-FLARE
- Checkpoint base (dealignai): https://huggingface.co/dealignai/DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8
- Modelo stock DeepSeek: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Herramienta de exportación (Ignition): NVIDIA/spark-local-inference, commit `972e28e44781d8d0c84d70ae434db92c36076a43` (PR #129, merge `fa0eadaded`, 2026-11-05; PR #158, 2026-10-30)
- Perfil de verificación de publicador: `development-publisher.json` (incluido en el repositorio)
- Huella de la clave de publicador (SHA-256): `ff4d66d66f9099b1cb47a396a6dd0b0e1f9115e221bc33cdf3b28d5b12387ee9`
