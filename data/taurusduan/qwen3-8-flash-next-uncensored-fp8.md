# taurusduan/Qwen3.8-Flash-Next-UNCENSORED-FP8

## Resumen

`Qwen3.8-Flash-Next-UNCENSORED-FP8` es una versión modificada a nivel de pesos del modelo multimodal `Qwen/Qwen3.8-Flash-Next` de Alibaba, publicada por el usuario `taurusduan` (aunque la model card atribuye el trabajo a `dealignai`). La modificación, basada en la técnica de abliteración (eliminación de pesos de rechazo), elimina los rechazos del modelo sin recurrir a fine-tuning, LoRA, ni trucos de plantilla de chat. El resultado es un modelo que responde a peticiones que el original rechazaría, manteniendo el conocimiento, el estilo y la calibración del modelo base.

El modelo base es un MoE (mezcla de expertos) de aproximadamente 180 mil millones de parámetros totales (según los safetensors), con 6 mil millones de parámetros activos por token, basado en la arquitectura Qwen4 con atención híbrida GDN + QSA y embeddings N-gram adicionales. Soporta una ventana de contexto de 262 000 tokens, razonamiento configurable (low, medium, xhigh), decodificación especulativa MTP y multimodalidad (imagen y vídeo). Esta versión en concreto está cuantizada en FP8 oficial, lo que permite su ejecución en hardware Hopper o Blackwell con vLLM.

La relevancia de este modelo radica en que ofrece una alternativa "sin censura" a un modelo de última generación, con una pérdida de capacidad medida en MMLU de solo 2,5 puntos porcentuales (del 86,36 % al 83,86 %), y con un cumplimiento de comportamientos dañinos (HarmBench) que alcanza el 100 % cuando el razonamiento está activado. Está pensado para desarrolladores e investigadores que necesitan un modelo de gran tamaño con razonamiento profundo y multimodalidad, sin las restricciones de seguridad del original.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida (GDN + QSA) sobre arquitectura Qwen4, con embeddings N-gram |
| Parametros totales | 179 999 981 459 (~180 B) |
| Parametros activos | 6 B por token (modelo principal de ~125 B + ~51 B de embeddings N-gram) |
| Longitud de contexto | 262 000 tokens |
| Tipos de cuantizacion | FP8 (oficial) |
| Idiomas soportados | No disponible (el modelo base Qwen3.8-Flash-Next es multilingüe, pero no se especifican los idiomas en la ficha) |
| Licencia | qwen-community-license-1.0 |
| Formato de pesos | safetensors (FP8), compatible con vLLM |

## Arquitectura y entrenamiento

La arquitectura base, `Qwen3.8-Flash-Next`, es un modelo de mezcla de expertos (MoE) construido sobre la arquitectura Qwen4, que introduce una atención híbrida combinando GDN (Gated Delta Network) y QSA (Quadratic Self-Attention). El modelo principal tiene 125 mil millones de parámetros, complementados con 51 mil millones de parámetros adicionales en forma de embeddings N-gram, lo que suma un total cercano a los 180 mil millones. Solo 6 mil millones de parámetros se activan por token, lo que reduce el coste computacional en comparación con un modelo denso del mismo tamaño.

La modificación aplicada en esta versión no implica entrenamiento alguno: se trata de una alteración directa de los pesos (abliteration) que elimina los vectores responsables de los rechazos. Según la model card, no se han usado datos sintéticos, LoRA ni destilación. El conocimiento, el estilo, el razonamiento y la calibración del modelo base se conservan, salvo por la eliminación de la tendencia a rechazar peticiones. El modelo resultante funciona con la plantilla de chat estándar y el prompt de sistema por defecto, sin necesidad de trucos de jailbreak. Se ha confirmado que la decodificación especulativa MTP (multi-token prediction) se mantiene funcional, con una tasa de aceptación de borradores de aproximadamente el 81 % (alrededor de 1,8 veces la eficiencia de borrado), y que las capacidades multimodales de imagen y vídeo siguen operativas.

## Capacidades

- Razonamiento configurable en tres niveles: `low`, `medium` y `xhigh`, controlable mediante `chat_template_kwargs` con `enable_thinking` y `reasoning_effort`.
- Decodificación especulativa MTP (multi-token prediction) compatible con vLLM, que acelera la generación sin pérdida de calidad.
- Multimodalidad completa: procesamiento de imágenes y vídeo, manteniendo el pipeline `image-text-to-text` del modelo base.
- Generación de texto con coherencia verificada en código, matemáticas, razonamiento y texto largo (sin bucles en modo greedy).
- Funciona con la plantilla de chat estándar y el prompt de sistema por defecto; no requiere instrucciones especiales ni plantillas alternativas.
- Conocimiento y estilo del modelo base preservados, con una caída de rendimiento en MMLU de solo 2,5 puntos porcentuales.
- Cumplimiento de comportamientos dañinos muy alto (97-100 % en HarmBench-320) cuando se utiliza con razonamiento activado o temperatura no nula.

## Casos de uso

- Análisis de documentos técnicos multimodales: el modelo puede procesar imágenes, diagramas y vídeo junto con texto, lo que lo hace adecuado para extraer información de informes de ingeniería, manuales con figuras o grabaciones de vídeo de procesos industriales.
- Agentes de razonamiento multi-paso: gracias a su contexto de 262 000 tokens y al razonamiento configurable, puede mantener cadenas de pensamiento largas y coherentes, útil para tareas de planificación, depuración de código complejo o investigación exploratoria.
- Generación de contenido creativo sin restricciones: escritores y guionistas pueden utilizarlo para explorar temas controvertidos o escenarios que otros modelos rechazarían, manteniendo una calidad de texto cercana al original.
- Inferencia de baja latencia con decodificación especulativa: en entornos de producción con vLLM y GPUs Hopper/Blackwell, el MTP permite acelerar la generación hasta 1,8 veces, adecuado para servicios de chat o asistentes que requieren respuestas rápidas.
- Resumen y análisis de vídeo: la capacidad de procesar vídeo permite generar resúmenes, transcripciones descriptivas o extraer eventos relevantes de grabaciones, siempre que se disponga de la infraestructura de hardware necesaria.
- Evaluación de seguridad y alineación: investigadores en seguridad de IA pueden estudiar el comportamiento de un modelo sin rechazos para medir el impacto de la abliteración en la calidad de las respuestas y en el cumplimiento de directrices, comparándolo con el modelo base.

## Benchmarks y rendimiento

La model card proporciona datos de MMLU (2 280 preguntas, 40 por asignatura) comparando el modelo base con esta versión, así como resultados de HarmBench-320. No se han publicado resultados de otros benchmarks (HumanEval, GSM8K, etc.) en la información disponible.

| Benchmark | Modelo base | Modelo UNCENSORED | Diferencia |
|---|---|---|---|
| MMLU overall | 86,36 % | 83,86 % | -2,50 pp |
| MMLU abstract algebra | 72 % | 57 % | -15 pp |
| MMLU moral scenarios | 80 % | 70 % | -10 pp |
| MMLU machine learning | 80 % | 72 % | -8 pp |
| MMLU professional accounting | 78 % | 68 % | -10 pp |
| MMLU high school mathematics | 52 % | 55 % | +3 pp |
| MMLU computer security | 88 % | 90 % | +3 pp |

Cumplimiento en HarmBench-320 (comportamientos realmente dañinos, greedy, temperatura 0):

| Decodificación | Razonamiento | Cumplimiento |
|---|---|---|
| greedy | low | 100 % |
| greedy | xhigh | 99,6 % |
| greedy | off | 97,1 % |

Además, se confirma una tasa de aceptación de borradores MTP de aproximadamente el 81 % (≈ 1,8× de eficiencia de borrado) y un correcto funcionamiento multimodal (imagen y vídeo). La configuración de generación estampada es `temperature 1.0, top_p 0.95, top_k 20`.

## Requisitos de hardware

- Cuantización FP8: requiere GPUs compatibles con FP8, es decir, arquitectura Hopper (H100, H200) o Blackwell (B200, GB200).
- La model card indica que se sirve con vLLM en 2× DGX Spark, lo que sugiere que se necesitan al menos dos GPUs de alta gama con memoria suficiente (el modelo completo en FP8 ocupa aproximadamente 180 GB, más overhead de activaciones y tabla N-gram).
- Se recomienda `tensor_parallel_size=2` en vLLM; cada GPU necesitará alrededor de 90-100 GB de VRAM (estimación razonable para 180 GB repartidos en dos dispositivos).
- La tabla N-gram (PLE) se puede descargar a CPU en tiempo de ejecución mediante la variable de entorno `VLLM_PLE_CPU_OFFLOAD=1`, lo que reduce la memoria GPU requerida.
- Motor de inferencia: vLLM (con `trust_remote_code=True`). No se mencionan otros motores (llama.cpp, Ollama, TGI) en la documentación.
- No cabe en GPUs de consumo (RTX 4090, etc.) por el tamaño y la necesidad de FP8; se requieren GPUs de centro de datos.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de la misma categoría (MoE multimodales de ~180 B) en la información proporcionada. La comparación más directa es con el modelo base `Qwen/Qwen3.8-Flash-Next`, del cual deriva:

| Característica | Qwen3.8-Flash-Next (base) | Qwen3.8-Flash-Next-UNCENSORED-FP8 |
|---|---|---|
| Parámetros totales | ~180 B | ~180 B |
| Parámetros activos | 6 B | 6 B |
| Contexto | 262 000 tokens | 262 000 tokens |
| MMLU | 86,36 % | 83,86 % |
| Rechazos | Sí | No (abliterado) |
| Cuantización | BF16/FP8 | FP8 |
| Licencia | qwen-community-license-1.0 | qwen-community-license-1.0 |

No se han encontrado referencias a otros modelos comparables (p. ej., DeepSeek-V3, Llama 4 MoE) con datos de rendimiento en la documentación disponible.

## Limitaciones y advertencias

- Caída de rendimiento medible en MMLU: 2,5 puntos porcentuales menos que el modelo base, con descensos notables en algunas asignaturas (abstract algebra -15 pp, moral scenarios -10 pp, machine learning -8 pp).
- Al eliminar los rechazos, el modelo puede generar contenido dañino, ilegal o no ético si se le solicita. Aunque HarmBench muestra un cumplimiento del 97-100 % en condiciones greedy, el riesgo residual existe, especialmente con razonamiento desactivado o temperaturas altas.
- La licencia `qwen-community-license-1.0` no es una licencia de código abierto estándar; es necesario revisar sus términos específicos para uso comercial o redistribución.
- El tamaño del modelo (180 B en FP8) exige infraestructura de alto coste (múltiples GPUs Hopper/Blackwell); no es viable en hardware de consumo.
- No se han verificado de forma independiente las afirmaciones de la model card sobre coherencia, ausencia de bucles o cumplimiento de seguridad; se basan en pruebas del autor.
- La información sobre idiomas soportados no está disponible en la documentación; se asume que hereda el multilingüismo del modelo base, pero no se confirma.
- En producción, es imprescindible implementar salvaguardas adicionales (filtros de contenido, moderación) para mitigar los riesgos derivados de la eliminación de rechazos.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/taurusduan/Qwen3.8-Flash-Next-UNCENSORED-FP8
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio GitHub de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Receta vLLM para el modelo base: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
- Guía de ejecución local (unsloth): https://unsloth.ai/docs/models/qwen3.8-next
