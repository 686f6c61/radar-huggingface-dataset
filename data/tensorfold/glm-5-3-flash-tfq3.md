# TensorFold/GLM-5.3-Flash-TFQ3

## Resumen

GLM-5.3-Flash-TFQ3 es una cuantización del modelo GLM-5.3-Flash desarrollado por Z.ai, publicada por TensorFold para su runtime nativo `tensorfold-native`. Se distribuye como un checkpoint de 139,55 GB que combina el formato propietario `.tffpw` de TensorFold con Safetensors, e incluye la cabeza especulativa MTP (Multi-Token Prediction) del modelo original. El checkpoint está orientado específicamente a Apple Silicon con soporte Metal 4 y NAX, y no puede cargarse con loaders estándar como Transformers, vLLM o MLX-LM.

El modelo base es un modelo de generación de texto conversacional de aproximadamente 9.930 millones de parámetros (según los pesos en Safetensors), lo que lo sitúa en la gama de modelos densos de tamaño medio. La cuantización TFQ3 reduce el espacio en disco un 56,4 % respecto a la referencia FP8 (319,76 GB) y 41,03 GB menos que una cuantización MLX de 4 bits (180,58 GB), manteniendo una perplejidad inferior en las evaluaciones reportadas.

La relevancia de esta ficha radica en que documenta un caso poco habitual: una cuantización de precisión mixta (etiquetada como 8-bit en los tags, pero con formato propietario) diseñada para hardware de Apple, con métricas de calidad y rendimiento medidas en un Apple M5 Ultra. Es un artefacto de nicho, útil para desarrolladores que ya trabajan dentro del ecosistema TensorFold, no para despliegues convencionales en GPU.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base GLM-5.3-Flash; detalles de arquitectura no disponibles en la información proporcionada) |
| Parámetros totales | 9.929.513.822 (~9,93 mil millones) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | TFQ3 (formato propietario de TensorFold, etiquetado como 8-bit); referencia comparativa con FP8 y MLX 4-bit |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | Safetensors + `.tffpw` (formato propietario TensorFold) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base GLM-5.3-Flash más allá de su naturaleza de transformer para generación de texto. El checkpoint cuantizado conserva la cabeza especulativa MTP del modelo original, lo que permite decodificación especulativa con "copy drafting" según las mediciones del autor. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo base.

La innovación técnica principal de este artefacto es el esquema de cuantización TFQ3 de TensorFold, que combina pesos en `.tffpw` con Safetensors y está optimizado para el runtime `tensorfold-native` con Metal 4 y NAX en Apple Silicon. Según el autor, TFQ3 logra menor perplejidad que FP8 y MLX 4-bit en las evaluaciones reportadas, además de una huella en disco notablemente menor. La verificación de MTP con profundidad 3 produjo la misma salida que profundidad 0 en la prueba reportada.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`).
- Decodificación especulativa mediante la cabeza MTP incluida en el checkpoint.
- Razonamiento y conversación multi-turno (heredado del modelo base, sin detalles específicos disponibles).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (visión, audio, thinking mode): no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint está diseñado para ejecutarse en un Apple M5 Ultra con el runtime `tensorfold-native`; es adecuado para desarrolladores que quieran probar GLM-5.3-Flash en hardware Apple de gama alta sin depender de GPUs NVIDIA.
- Evaluación de técnicas de cuantización: sirve como referencia práctica para comparar TFQ3 frente a FP8 y MLX 4-bit en términos de tamaño en disco, perplejidad y velocidad, tal como reporta el autor.
- Investigación sobre decodificación especulativa: la inclusión de la cabeza MTP permite experimentar con "copy drafting" y medir el impacto en throughput de decodificación (87–104 tok/s reportados).
- Prototipado de asistentes conversacionales en estaciones de trabajo Mac: para equipos que ya trabajan en el ecosistema Apple y necesitan un modelo de ~10B parámetros con licencia MIT.
- Pruebas de prefill a gran escala: con 1.567 tok/s de prefill en prompts de 2.048 tokens, es viable para tareas de procesamiento de contexto largo en local.
- Desarrollo y validación de pipelines con TensorFold: útil para integradores que construyan herramientas sobre `tensorfold-native` y necesiten un checkpoint de referencia funcional.

## Benchmarks y rendimiento

| Métrica | FP8 (referencia) | MLX 4-bit | TFQ3 |
|---|---:|---:|---:|
| Peso en disco | 319,76 GB | 180,58 GB | 139,55 GB |
| NLL / perplejidad (146 tokens) | 2,8367 / 17,06 | 2,8858 / 17,92 | 2,7884 / 16,26 |
| NLL / perplejidad ponderada (4 prompts, 235 tokens) | 3,1846 / 24,16 | 3,2316 / 25,32 | 3,1184 / 22,61 |

| Métrica (Apple M5 Ultra) | MLX 4-bit | TFQ3 |
|---|---:|---:|
| Prefill, prompt de 2.048 tokens | 1.400 tok/s | 1.567 tok/s |
| Decodificación en vivo (MTP con copy drafting) | — | 87–104 tok/s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM/espacio en disco: el checkpoint ocupa 139,55 GB en disco; los buffers de pesos TFQ3 usaron 138,23 GB en la ejecución medida.
- Hardware recomendado: Apple M5 Ultra (único hardware con mediciones reportadas).
- GPU NVIDIA/AMD: no disponible; el checkpoint requiere un build de `tensorfold-native` con Metal 4 y NAX, por lo que no está pensado para CUDA.
- ¿Cabe en GPU consumer? No hay datos para GPUs consumer; el tamaño de 139,55 GB excede la memoria de cualquier GPU consumer actual.
- Opciones de despliegue: exclusivamente `tensorfold-native` con soporte TFQ3. Transformers, vLLM, llama.cpp, Ollama, TGI y MLX-LM no pueden abrir el checkpoint completo según el autor.
- Latencia y throughput: prefill de 1.567 tok/s y decodificación de 87–104 tok/s en Apple M5 Ultra.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| GLM-5.3-Flash-TFQ3 | ~9,93B | no disponible | MIT | Safetensors + `.tffpw`, solo `tensorfold-native` | Cuantización TFQ3 para Apple Silicon |
| GLM-5.3-Flash (FP8) | no disponible | no disponible | MIT | FP8, 319,76 GB | Referencia de calidad del autor |
| GLM-5.3-Flash (MLX 4-bit) | no disponible | no disponible | MIT | MLX, 180,58 GB | Alternativa para Apple Silicon vía MLX-LM |
| Otros modelos ~10B densos | ~10B | variable | variable | Safetensors/GGUF, vLLM/llama.cpp | No se dispone de comparación directa en la información proporcionada |

La comparación con modelos de otras familias no está disponible en la información proporcionada; los únicos puntos de referencia son las variantes FP8 y MLX 4-bit del mismo modelo base.

## Limitaciones y advertencias

- El checkpoint no es cargable con Transformers, vLLM, MLX-LM ni llama.cpp; requiere un build específico de `tensorfold-native` con Metal 4 y NAX.
- Dependencia de hardware Apple Silicon: no hay soporte documentado para CUDA u otras plataformas.
- El formato `.tffpw` es propietario, lo que dificulta la portabilidad y la inspección con herramientas estándar.
- Las métricas de calidad se limitan a perplejidad/NLL sobre prompts muy cortos (146 y 235 tokens); no hay evidencia sobre razonamiento, código o matemáticas.
- No se dispone de información sobre sesgos, riesgo de alucinación o comportamiento multilingüe del modelo base.
- El modelo base tiene ~9,93B parámetros, por lo que su capacidad es limitada frente a modelos de mayor tamaño; no se debe asumir un rendimiento equivalente a modelos frontier.
- Aunque la licencia es MIT, conviene verificar las condiciones del modelo base original (Z.ai) antes de uso comercial.
- El checkpoint se publicó el 24 de noviembre de 2026 y cuenta con 0 descargas; no hay evidencia de uso en producción ni validación independiente.
- La etiqueta "8-bit" en los tags no debe interpretarse como una cuantización estándar de 8 bits; TFQ3 es un esquema propio sin documentación pública detallada.

## Enlaces

- Hugging Face: https://huggingface.co/TensorFold/GLM-5.3-Flash-TFQ3
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Licencia del modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash/blob/main/LICENSE
