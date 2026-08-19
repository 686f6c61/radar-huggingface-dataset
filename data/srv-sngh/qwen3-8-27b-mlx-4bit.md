# srv-sngh/Qwen3.8-27B-mlx-4bit

## Resumen

Qwen3.8-27B-mlx-4bit es un espejo (mirror) de la cuantización MLX de 4 bits del modelo Qwen/Qwen3.8-27B, un modelo de lenguaje y visión (VLM) denso de 27 000 millones de parámetros desarrollado por Qwen (Alibaba). Esta versión concreta, publicada por srv-sngh, está empaquetada para el runtime nativo Krill, que ejecuta el modelo en Swift y MLX sobre Apple Silicon sin puente de Python. El modelo base emplea una arquitectura híbrida Qwen3.5 con capas de atención lineal Gated DeltaNet y atención completa, e incorpora una torre de visión estilo Qwen3-VL que se mantiene en bf16 mientras el decodificador se cuantiza a 4 bits.

La relevancia de esta ficha radica en que permite ejecutar un VLM de 27B con contexto nativo de 262 144 tokens en equipos Apple Silicon con 24 GB de memoria unificada, algo poco habitual para modelos de este tamaño. Además, incluye modo de razonamiento (thinking mode) con control de esfuerzo (`reasoning_effort`) y soporte para entrada de imágenes y vídeo. El repositorio es un mirror byte a byte de la conversión de mlx-community, por lo que no re-cuantiza los pesos, y hereda la licencia Apache-2.0 del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Qwen3.5: 64 capas, 16 × (3 × Gated DeltaNet → 1 × Gated Attention), hidden size 5120, FFN 17408, 24 query / 4 KV heads, head-dim 256, torre de visión (depth 27, patch 16, spatial merge 2) |
| Parametros totales | 27B (según model card); el archivo safetensors reporta 4 665 462 000 parámetros (inconsistente, probablemente metadato erróneo) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens nativo, extensible a ~1M con YaRN |
| Tipos de cuantizacion | 4 bits, modo affine, group size 64; torre de visión en bf16 (no cuantizada) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B utiliza una arquitectura híbrida que combina capas de atención lineal Gated DeltaNet (SSM) con capas de atención completa. Concretamente, se organiza en 16 bloques repetidos, cada uno con 3 capas Gated DeltaNet seguidas de 1 capa Gated Attention. Esta combinación reduce el coste de memoria durante la generación de secuencias largas, manteniendo la capacidad de atención global cuando es necesaria. La torre de visión, heredada de la familia Qwen3-VL, procesa imágenes y vídeo mediante parches de 16×16 y fusión espacial de 2.

No se dispone de información detallada sobre el dataset de entrenamiento ni sobre el proceso de alineación (RLHF/DPO) del modelo base. La cuantización a 4 bits se realizó con modo affine y grupo de 64, preservando la torre de visión en bf16 para no degradar la comprensión visual. Se eliminó la cabeza MTP (multi-token prediction) para reducir el tamaño. El runtime Krill implementa desde cero la arquitectura híbrida en Swift, incluyendo las capas SSM, la atención completa, la torre de visión y el mRoPE 3D intercalado.

## Capacidades

- Generación de texto y razonamiento multimodal: acepta imágenes y vídeo como entrada, además de texto, y produce respuestas textuales.
- Modo de razonamiento (thinking mode) activado por defecto, con control de esfuerzo (`reasoning_effort`) configurable entre `xhigh`, `medium` y `low`.
- Contexto largo nativo de 262 144 tokens, ampliable a ~1M con YaRN, adecuado para documentos extensos o conversaciones multi-turno.
- Soporte de tool calling y function calling: no documentado explícitamente en la información proporcionada, pero el modelo base Qwen3.8 es conocido por soportar estas capacidades; no se confirma en esta ficha.
- Capacidades multilingües: no especificadas en la información disponible.
- Ejecución nativa en Apple Silicon mediante Krill (Swift + MLX) o mediante `mlx_vlm` para Python.

## Casos de uso

- Análisis de imágenes y vídeo en tiempo real: gracias a la torre de visión en bf16 y al contexto de 262K tokens, el modelo puede describir diagramas técnicos, capturas de pantalla o vídeos de demostración, y responder preguntas sobre su contenido.
- Asistente de programación con razonamiento profundo: el modo thinking con `reasoning_effort=xhigh` permite abordar problemas de código complejos, como los evaluados en LiveCodeBench v6 (90.3), y generar soluciones con explicación paso a paso.
- Agente de terminal y automatización de tareas: con un rendimiento de 73.0 en Terminal Bench 2.1, puede ejecutar comandos, interpretar salidas y planificar secuencias de acciones en entornos de línea de comandos.
- Procesamiento de documentos largos: el contexto de 262K tokens permite resumir o extraer información de libros técnicos, informes extensos o conversaciones de soporte con múltiples turnos, sin perder el hilo.
- Razonamiento científico y matemático: con 89.2 en GPQA Diamond, es adecuado para resolver problemas de física, química o biología de nivel avanzado, y para explicar conceptos complejos.
- Generación de código en producción: aunque no se confirma tool calling, el modelo puede integrarse en pipelines de CI/CD para generar tests, documentar APIs o revisar pull requests, aprovechando su capacidad de razonamiento y su contexto amplio.

## Benchmarks y rendimiento

Los siguientes resultados provienen de la model card oficial del modelo base Qwen3.8-27B (sin cuantizar). No se han publicado benchmarks específicos para la versión cuantizada en 4 bits.

| Benchmark | Qwen3.8-27B |
|---|---|
| SWE-bench Pro | 61.7 |
| QwenSWEBench | 79.0 |
| Terminal Bench 2.1 (Terminus) | 73.0 |
| CoWorkBench (long-horizon office work) | 70.7 |
| LiveCodeBench v6 | 90.3 |
| GPQA Diamond | 89.2 |
| IFBench | 79.5 |

## Requisitos de hardware

- VRAM estimada: ~16.1 GiB residentes (pesos cuantizados + torre de visión en bf16). Cabe en un Mac con 24 GB de memoria unificada, pero con poca holgura; se recomienda cerrar otras aplicaciones grandes.
- En equipos con 16 GB de memoria unificada se producirá swapping; no se recomienda su uso.
- GPU recomendadas: Apple Silicon (M1 Pro/Max/Ultra, M2 Pro/Max/Ultra, M3/M4 series) con al menos 24 GB de memoria unificada.
- Opciones de despliegue: Krill (runtime nativo Swift + MLX, recomendado), `mlx_vlm` (Python), o cualquier framework compatible con MLX.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de la misma categoría (VLM de ~27B con arquitectura híbrida) en la documentación proporcionada. El modelo base Qwen3.8-27B es el único referente; la versión cuantizada mantiene las mismas capacidades con una pérdida de precisión esperada por la cuantización de 4 bits, aunque no se han publicado mediciones al respecto.

## Limitaciones y advertencias

- La cuantización a 4 bits puede introducir una degradación en la calidad de las respuestas, especialmente en tareas de razonamiento complejo o generación de código, en comparación con el modelo en precisión completa.
- El repositorio reporta 4 665 462 000 parámetros en los metadatos de safetensors, lo que contradice la cifra de 27B de la model card; se recomienda verificar la integridad de los pesos antes de su uso en producción.
- No se documentan sesgos específicos del modelo, pero al ser un VLM entrenado con datos web, puede presentar sesgos de género, raza o cultura no mitigados.
- El riesgo de alucinación es inherente a los modelos generativos; en tareas de visión, puede describir objetos o detalles que no están presentes en la imagen.
- El contexto de 262K tokens es nativo, pero la extensión a ~1M con YaRN puede degradar la calidad en secuencias muy largas.
- La licencia Apache-2.0 permite uso comercial, pero se debe atribuir el crédito a Qwen y a mlx-community según los términos de la licencia.
- En equipos con 16 GB de memoria unificada, el modelo no es utilizable sin swapping severo; se requiere un mínimo de 24 GB.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/srv-sngh/Qwen3.8-27B-mlx-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Conversión MLX original: https://huggingface.co/mlx-community/Qwen3.8-27B-4bit
- Runtime Krill: https://github.com/srvsngh99/Krill
