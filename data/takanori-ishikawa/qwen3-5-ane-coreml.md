# takanori-ishikawa/Qwen3.5-ANE-CoreML

## Resumen

Qwen3.5 ANE CoreML es una conversión no oficial de los modelos Qwen3.5 (0.8B, 2B, 4B y 9B) al formato Core ML, optimizada para ejecutarse sobre la Apple Neural Engine (ANE) de los chips Apple Silicon. La desarrolla el usuario independiente takanori-ishikawa y no tiene vinculación ni respaldo del equipo Qwen. El problema que aborda es la ausencia de artefactos listos para producción que permitan ejecutar modelos Qwen3.5 en hardware Apple aprovechando la NPU en lugar de la GPU o la CPU, con un consumo energético y una latencia sensiblemente menores.

El repositorio empaqueta nueve combinaciones de modelo y contexto: 0.8B a 2.048 tokens; 2B a 2.048 y 16.384 tokens; y 4B y 9B a 2.048, 8.192 y 16.384 tokens. Los pesos de las capas lineales se comprimen con paletización k-means de 6 bits (group size 32) y las embeddings con cuantización int8 simétrica por filas. Cada paquete incluye un decodificador de un token y un grafo de prefill de cuatro tokens para acelerar el procesamiento del prompt.

Es relevante ahora porque demuestra una vía práctica para inferencia local de LLMs en Mac y dispositivos Apple sin depender de frameworks de servidor, aunque el propio autor advierte de que el repositorio ya no se mantiene: el comportamiento de Core ML depende en gran medida del hardware y de la versión de macOS, lo que dificulta su soporte a largo plazo. Los ficheros permanecen disponibles tal cual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de Qwen3.5 convertido a Core ML (grafos fragmentados en chunks ejecutables en ANE) |
| Parametros totales | 0,8B / 2B / 4B / 9B (cuatro variantes) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 2.048; 8.192 (solo 4B y 9B); 16.384 (2B, 4B y 9B) |
| Tipos de cuantizacion | Paletizacion k-means de 6 bits (LUT6, group size 32) en capas lineales; int8 simetrica por filas en embeddings |
| Idiomas soportados | en, ja |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML `.mlpackage` (fragmentado en chunks) + tabla de embeddings `.int8.bin` en el host |

## Arquitectura y entrenamiento

La ficha corresponde a una conversión, no a un entrenamiento. El modelo subyacente es la familia Qwen3.5 de Alibaba en sus variantes 0.8B, 2B, 4B y 9B, de arquitectura transformer con atención agrupada por cabezas (GQA), tal como se deduce del sufijo `gqagrouped` de los artefactos. La conversión divide el modelo en 6 chunks (0.8B y 2B) u 8 chunks (4B y 9B) que se ejecutan secuencialmente en la ANE, mientras la tabla de embeddings compartida permanece en el host en lugar de residir en la NPU.

Cada paquete incorpora dos grafos: un decodificador de un token y un grafo de prefill de cuatro tokens que procesa el prompt en grupos de cuatro; los tokens restantes y todos los generados pasan por el decodificador de un token. El grafo de 9B incluye una conversión numéricamente estable del softplus de DeltaNet, que según el autor elevó la coincidencia top-1 de 111/138 (80,43%) a 127/138 (92,03%) en una secuencia de regresión fija de 138 tokens. No se documentan datos de entrenamiento, número de tokens, composición del dataset ni etapas de RLHF o DPO, ya que corresponden al modelo original y no se reproducen en esta conversión.

## Capacidades

- Generación de texto autoregresiva en inglés y japonés, los dos idiomas declarados.
- Razonamiento y generación de código heredados del modelo Qwen3.5 original, sujetos a la degradación introducida por la cuantización de 6 bits.
- Prefill por grupos de cuatro tokens para reducir la latencia de procesamiento del prompt.
- Ejecución íntegra en Apple Silicon con pesos residentes en ANE y embeddings en el host.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking en la información disponible.
- No se documenta capacidad multilingüe más allá de inglés y japonés.

## Casos de uso

- Inferencia local en Mac con bajo consumo: el paquete de 0.8B a 2.048 tokens ocupa 0,54 GiB más 243 MiB de embeddings, lo que permite ejecutarlo en cualquier Mac con Apple Silicon sin cargar la GPU y con consumo energético contenido al delegar en la ANE.
- Asistentes de escritura offline en aplicaciones macOS: el paquete de 2B a 16.384 tokens (1,35 GiB más 485 MiB) cubre documentos largos y conversaciones multi-turno sin salir del dispositivo, útil para herramientas que manejan texto confidencial.
- Procesamiento de texto en japonés e inglés en apps nativas: los dos idiomas declarados permiten integrar resumen o reescritura bilingüe en aplicaciones iOS y macOS distribuidas por App Store.
- Prototipado de funciones de autocompletado en editores: el decodificador de un token y el prefill de cuatro tokens encajan en un flujo interactivo donde el usuario teclea y el modelo completa fragmentos cortos.
- Clasificación y extracción de entidades en local: el paquete de 4B a 8.192 tokens (2,99 GiB más 607 MiB) permite procesar lotes de documentos moderadamente largos en un Mac con memoria unificada de 16 GB o más.
- Validación de pipelines Core ML en CI: los artefactos incluyen `metadata.json` con el orden de ejecución de los chunks y ejemplos de conductor en Python, lo que facilita pruebas de integración en flujos de desarrollo de apps Apple.
- Evaluación comparativa de cuantización: los informes de coincidencia top-1 (93,75% en 2B, 90,63% en 9B) sirven como referencia para medir el impacto de LUT6 frente a BF16 en tareas concretas antes de adoptar el modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor solo reporta comprobaciones de fidelidad de la conversión, que comparan la elección del siguiente token frente al modelo BF16 original con teacher forcing:

| Modelo | Secuencia | Coincidencia top-1 | Resultado |
|---|---:|---:|---|
| 2B, decodificación de un token, LUT6 | 64 tokens | 60/64 (93,75%) | pass |
| 9B, decodificación de un token, LUT6 | 64 tokens | 58/64 (90,63%) | pass |
| 9B con softplus DeltaNet estable, secuencia de regresión | 138 tokens | 127/138 (92,03%) | mejora frente a 111/138 (80,43%) |

Ocho de los nueve paquetes superaron una prueba de humo extremo a extremo en Swift/Core ML generando la cadena `Qwen ANE ready.`; el paquete 2B/16K no se incluyó en esa prueba. El autor advierte que estas cifras miden la fidelidad de la conversión, no la calidad en tareas generales.

## Requisitos de hardware

- VRAM/memoria: el paquete de 0.8B/2K requiere 0,54 GiB de pesos Core ML más 243 MiB de embeddings; el de 2B/16K, 1,35 GiB más 485 MiB; el de 4B/16K, 3,00 GiB más 607 MiB; el de 9B/16K, 5,61 GiB más 970 MiB.
- Memoria unificada recomendada: al menos 8 GB para 0.8B y 2B, 16 GB para 4B y 24 GB o más para 9B, sumando el estado estático de contexto y el resto del sistema.
- GPU/NPU: requiere Apple Silicon con Apple Neural Engine (serie M1 en adelante en Mac; chips A-series y M-series en iPhone e iPad). No se contempla ejecución en GPU NVIDIA ni AMD.
- Cabe en hardware de consumo: sí, en cualquier Mac con Apple Silicon; los paquetes de 0.8B y 2B son los más adecuados para equipos con 8 GB.
- Despliegue: Core ML mediante el runtime propio del autor con los ejemplos en Python incluidos en `examples/**`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que el formato `.mlpackage` es específico de Core ML.
- Latencia y throughput: no disponibles; dependen del chip, de la versión de macOS y del tamaño de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Estado |
|---|---|---|---|---|---|
| Qwen3.5-ANE-CoreML (2B) | 2B | 2.048 / 16.384 | Core ML, LUT6 | Apache 2.0 | Sin mantenimiento |
| Qwen/Qwen3.5-2B (original) | 2B | no disponible | safetensors BF16 | Apache 2.0 | Activo |
| Qwen3.5-ANE-CoreML (9B) | 9B | 2.048 / 8.192 / 16.384 | Core ML, LUT6 | Apache 2.0 | Sin mantenimiento |
| Qwen/Qwen3.5-9B (original) | 9B | no disponible | safetensors BF16 | Apache 2.0 | Activo |

La comparación con alternativas de terceros no está disponible en la información proporcionada. Frente al modelo original, la conversión ofrece un tamaño mucho menor (5,61 GiB frente a los pesos BF16 equivalentes) y ejecución en ANE, a cambio de una pérdida de fidelidad top-1 de aproximadamente el 6-9% en las pruebas del autor.

## Limitaciones y advertencias

- Repositorio sin mantenimiento: el autor detiene el desarrollo y advierte de que el comportamiento de Core ML depende fuertemente del hardware y de la versión del sistema operativo.
- Conversión no oficial, sin respaldo del equipo Qwen.
- La cuantización LUT6 y la ejecución en Core ML pueden alterar secuencias generadas, especialmente cuando los logits del modelo original están casi empatados; es necesario validar con prompts propios y en el dispositivo objetivo.
- No hay comparación de fidelidad publicada para los paquetes de contexto largo (8K y 16K); solo se verificó la integración en ocho de los nueve paquetes.
- Idiomas limitados a inglés y japonés; el rendimiento en castellano no está documentado.
- No se documentan capacidades de tool calling, agentes, visión ni audio.
- Riesgo de alucinación inherente al modelo base, no mitigado por la conversión.
- Sesgos del modelo original no evaluados en esta ficha.
- Licencia Apache 2.0 permite uso comercial, pero la falta de mantenimiento y la dependencia de versiones concretas de macOS suponen un riesgo para producción.
- Algunos paquetes antiguos marcan sus registros de compatibilidad como `legacy_unverified`; solo 4B/8K, 4B/16K, 9B/8K y 9B/16K incluyen metadatos de firma de conversión.

## Enlaces

- Hugging Face: https://huggingface.co/takanori-ishikawa/Qwen3.5-ANE-CoreML
- Modelo base 0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Modelo base 2B: https://huggingface.co/Qwen/Qwen3.5-2B
- Modelo base 4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Modelo base 9B: https://huggingface.co/Qwen/Qwen3.5-9B
