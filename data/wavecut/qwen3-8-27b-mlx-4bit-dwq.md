# WaveCut/Qwen3.8-27B-MLX-4bit-DWQ

## Resumen

El modelo `WaveCut/Qwen3.8-27B-MLX-4bit-DWQ` es un derivado cuantizado a 4 bits del modelo multimodal Qwen3.8-27B, desarrollado por WaveCut y publicado bajo licencia Apache-2.0. Está diseñado para ejecutarse en Apple Silicon mediante el ecosistema MLX (MLX-LM y MLX-VLM) y ha sido calibrado específicamente para tareas de tool calling, trazas de ingeniería de software agéntica, chat multilingüe y generación de código Python. La principal innovación es el uso de Distilled Weight Quantization (DWQ) en la torre de lenguaje, que reduce la divergencia KL frente a un teacher de 8 bits en un 63,6% respecto a una conversión RTN 4-bit estándar, manteniendo la compatibilidad con el runtime MLX.

El modelo conserva la torre de visión original del modelo base (cuantizada con RTN 4-bit) y no incluye pesos MTP (Multi-Token Prediction). Con un tamaño de repositorio de 16,1 GB y un pico de memoria de 16,05 GB en Apple M2 Max, está pensado para inferencia local eficiente en hardware de Apple, aunque también puede utilizarse en otras plataformas mediante adaptadores MLX. Su relevancia radica en ofrecer una alternativa de alta calidad para despliegues en producción que requieran capacidades multimodales y tool use con un consumo de memoria moderado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) basado en Qwen3.8-27B |
| Parametros totales | 4.665.462.000 (según safetensors; el modelo base Qwen3.8-27B sugiere 27B, no confirmado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4-bit DWQ (torre de lenguaje), 4-bit RTN (torre de visión) |
| Idiomas soportados | No disponible oficialmente; calibrado para ruso, chino, ucraniano, polaco, árabe estándar, español y japonés |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer multimodal con torres de lenguaje y visión. La torre de lenguaje ha sido sometida a un proceso de Distilled Weight Quantization (DWQ) con cuantización afín de 4 bits y grupo de tamaño 64, utilizando como teacher una versión 8-bit del mismo modelo. El entrenamiento de calibración se realizó sobre 1.024 ejemplos (más 64 de validación) extraídos de fuentes disjuntas: function calling (NousResearch/hermes-function-calling-v1), trazas exitosas de SWE-agent (nebius/SWE-agent-trajectories), chat multilingüe (CohereLabs/aya_dataset) y código Python (openai/openai_humaneval). La torre de visión se mantiene intacta con la cuantización RTN 4-bit original de mlx-community. No se incluyen pesos MTP. El proceso de calibración se documenta en `RECIPE.md` y `calibration-manifest.json`, incluyendo hiperparámetros, hashes de corpus y parches de compatibilidad.

## Capacidades

- Generación de texto y razonamiento conversacional multilingüe (con énfasis en ruso, chino, ucraniano, polaco, árabe, español y japonés).
- Tool calling y function calling, calibrado con datasets específicos como `hermes-function-calling-v1`.
- Soporte para agentes y razonamiento multi-paso, basado en trazas de SWE-agent.
- Generación de código Python, con calibración sobre HumanEval.
- Comprensión de imágenes y generación de texto a partir de ellas (image-text-to-text) mediante la torre de visión RTN 4-bit.
- Compatible con plantillas de chat de Qwen, incluyendo modo de razonamiento (thinking) configurable.
- Integración con MLX-LM y MLX-VLM para inferencia en Apple Silicon.

## Casos de uso

- Asistentes de atención al cliente multilingües: el modelo puede gestionar conversaciones en varios idiomas con tool calling para consultar bases de conocimiento o APIs, gracias a su calibración en chat multilingüe y function calling.
- Agentes de ingeniería de software: las trazas de SWE-agent permiten al modelo razonar sobre repositorios, ejecutar comandos y generar parches, útil en pipelines de CI/CD o herramientas de automatización de desarrollo.
- Generación de código en entornos locales: su capacidad para código Python y su tamaño compacto (4-bit) lo hacen adecuado para asistentes de programación en portátiles Apple con suficiente memoria unificada.
- Análisis de documentos con imágenes: la torre de visión permite extraer texto o describir contenido de imágenes, combinado con razonamiento textual para tareas de OCR o comprensión visual.
- Chatbots especializados en dominios técnicos: su calibración en tool calling y razonamiento agéntico lo hace útil para asistentes que necesitan interactuar con APIs y servicios externos.
- Prototipado y experimentación en investigación: al ser Apache-2.0 y estar disponible en MLX, es una opción para probar técnicas de cuantización o evaluar rendimiento en hardware Apple sin costes de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor reporta métricas específicas del proceso de calibración:

| Metrica | Valor |
|---|---|
| KL divergence (top-1024 logits vs teacher 8-bit) | 0,074299 (final) |
| Reducción de KL vs baseline RTN 4-bit | 63,596% |
| Smoke test (11 prompts, thinking desactivado) | 11/11 (tool calling 2/2, multilingüe 7/7, código 2/2) |
| Rendimiento en Apple M2 Max (64 GB) | 67,68 prompt tok/s, 23,19 generation tok/s |

Estos resultados son una prueba de compatibilidad y no una evaluación amplia de capacidades.

## Requisitos de hardware

- Memoria: pico de 16,05 GB en Apple M2 Max con 64 GB unificada durante la prueba de humo.
- GPU recomendadas: Apple Silicon (M1 Pro/Max/Ultra o superior) para uso nativo con MLX. En otras plataformas se requeriría adaptar el formato de pesos (no disponible actualmente).
- Compatibilidad con GPU de consumo: no confirmado fuera de Apple Silicon; el formato MLX está optimizado para Metal.
- Opciones de despliegue: MLX-LM y MLX-VLM (librerías Python). No se mencionan vLLM, llama.cpp u otros runtimes.
- Latencia y throughput: 67,68 tok/s de prompt y 23,19 tok/s de generación en la configuración probada (M2 Max).

## Comparativa con modelos similares

No disponible. No se proporcionan comparaciones con otros modelos de la misma categoría (por ejemplo, otras cuantizaciones de Qwen3.8-27B o modelos multimodales de tamaño similar) en la información disponible.

## Limitaciones y advertencias

- La optimización DWQ solo cubre la torre de lenguaje; la torre de visión conserva la calidad del RTN 4-bit original, que no ha sido validada más allá de una carga limpia.
- El corpus de calibración es pequeño (1.024 ejemplos) y no garantiza mejoras generales en benchmarks amplios.
- El comportamiento de tool calling depende del esquema de herramientas y de la plantilla de chat de Qwen; es necesario validar formatos en el runtime de producción.
- La cuantización puede alterar los resultados en comparación con el modelo de precisión completa; se recomienda evaluar seguridad, calidad multilingüe, comportamiento de contexto largo y fiabilidad antes del despliegue.
- No se dispone de información sobre la longitud de contexto soportada ni sobre el número exacto de parámetros del modelo base (el dato de safetensors es 4,67B, inconsistente con el nombre 27B).
- Aunque la licencia es Apache-2.0, los datos de calibración no se redistribuyen; solo se publican metadatos agregados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/WaveCut/Qwen3.8-27B-MLX-4bit-DWQ
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Documentación de calibración (dentro del repo): `CALIBRATION.md`, `RECIPE.md`, `calibration-manifest.json`
