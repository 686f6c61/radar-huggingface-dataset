# yethdev/qwen3.5-0.8b-manumit-v2-GGUF

## Resumen

El modelo `yethdev/qwen3.5-0.8b-manumit-v2-GGUF` es una versión cuantizada en formato GGUF del modelo `yethdev/qwen3.5-0.8b-manumit-v2`, que a su vez es una adaptación del modelo `Qwen/Qwen3.5-0.8B` de la familia Qwen. Lo desarrolla el usuario `yethdev` y su objetivo principal es eliminar el comportamiento de rechazo (refusal) del modelo base mediante la técnica de "manumit", que proyecta fuera de los pesos las direcciones del stream residual asociadas con la negativa a responder, y posteriormente "cura" el modelo con datos ordinarios para preservar su capacidad general. El resultado es un modelo de 752.393.024 parámetros (0,8B) que, según las mediciones del autor, reduce la tasa de rechazo al 0,0% en AdvBench y JailbreakBench, manteniendo un rendimiento en MMLU-Pro del 15,2% (frente al 12,3% del modelo base). Esta versión GGUF está pensada para ejecutarse en CPU o GPU pequeñas mediante llama.cpp, Ollama o LM Studio, con tres niveles de cuantización (Q4_K_M, Q5_K_M y Q8_0). No se han publicado datos sobre la longitud de contexto ni los idiomas soportados.

Es relevante porque muestra un ejemplo práctico de abliteración aplicada a un modelo pequeño, con resultados medibles en benchmarks de seguridad y capacidad. Su licencia MIT y su formato GGUF facilitan su integración en entornos de investigación o prototipado, aunque el autor advierte explícitamente de que no existe capa de seguridad alguna.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 752.393.024 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-0.8B` como base, pero la información proporcionada no incluye detalles sobre la arquitectura interna, el número de capas, la dimensionalidad ni la longitud de contexto. El proceso "manumit" consiste en identificar las direcciones en el stream residual que codifican el rechazo y proyectarlas fuera de la matriz de pesos, seguido de una fase de "curación" o reentrenamiento sobre datos ordinarios para compensar la pérdida de capacidad. No se han publicado datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se utilizó RLHF, DPO u otras técnicas de alineación. Cabe destacar que la cabeza de predicción multi-token (multi-token-prediction head) no está incluida en estos archivos GGUF, ya que solo se usaba para decodificación especulativa y su ausencia no afecta a la generación normal.

## Capacidades

- Generación de texto en lenguaje natural (pipeline `text-generation`), sin capa de seguridad ni filtros de contenido.
- Razonamiento básico medido en MMLU-Pro: 15,2% (n=500) en esta versión, frente al 12,3% del modelo base.
- Ausencia de rechazo en prompts dañinos: 0,0% de refusal en AdvBench y JailbreakBench.
- No se ha confirmado soporte de tool calling, function calling, visión, audio ni capacidades de agente en la información disponible.
- Capacidades multilingües no disponibles; no se especifica qué idiomas soporta.

## Casos de uso

- Investigación en seguridad y alineación: permite estudiar el efecto de la abliteración sobre el comportamiento de rechazo comparando este modelo con el base. Se ejecutaría en entornos controlados con `llama.cpp` o `Ollama` para medir tasas de refusal en benchmarks como AdvBench o JailbreakBench.
- Evaluación de técnicas de jailbreak: al carecer de rechazo, sirve como modelo de referencia para probar métodos de ataque y verificar la eficacia de defensas en sistemas que se apoyan en el rechazo del modelo.
- Prototipado de asistentes locales de bajo coste: gracias a su tamaño (0,5-0,8 GB) y formato GGUF, puede ejecutarse en CPU o GPU de consumo para generar texto sin dependencia de servicios en la nube. Requiere implementar controles externos si se quiere evitar contenido no deseado.
- Fine-tuning posterior: la licencia MIT permite usar estos pesos como base para ajuste fino en tareas específicas, aprovechando la ausencia de rechazo como punto de partida para comportamientos sin restricciones.
- Despliegue en entornos de demostración: con Ollama, se puede integrar en pocas líneas en un chatbot de demostración, útil para desarrolladores que quieran explorar las capacidades de un modelo pequeño sin filtros.
- Comparación de cuantizaciones: los tres archivos GGUF permiten evaluar el compromiso entre tamaño y calidad en hardware limitado, lo que resulta útil para decidir la configuración óptima en producción.

## Benchmarks y rendimiento

| Benchmark | Este modelo | Modelo base |
|---|---|---|
| AdvBench (tasa de refusal) | 0,0% | alta (no especificada) |
| JailbreakBench (tasa de refusal) | 0,0% | alta (no especificada) |
| MMLU-Pro (n=500) | 15,2% | 12,3% |

No se han publicado más resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: los archivos GGUF ocupan 0,5 GB (Q4_K_M), 0,6 GB (Q5_K_M) y 0,8 GB (Q8_0). Añadiendo el overhead del contexto y la caché KV, se recomienda un mínimo de 1-2 GB de VRAM o RAM para inferencia.
- GPU recomendadas: cualquier GPU moderna con al menos 1 GB de VRAM (por ejemplo, RTX 3050, RTX 4060, Mac con Apple Silicon). También se puede ejecutar en CPU.
- Compatibilidad con GPU de consumo: sí, gracias a los tamaños reducidos y a las cuantizaciones.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier otro runtime compatible con GGUF. No se menciona compatibilidad con vLLM o TGI para este formato.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Refusal (AdvBench) | MMLU-Pro | Licencia | Formato |
|---|---|---|---|---|---|---|
| Qwen3.5-0.8B (base) | 752.393.024 | no disponible | alta | 12,3% | terminos de Qwen | safetensors |
| Qwen3.5-0.8B manumit v2 (este) | 752.393.024 | no disponible | 0,0% | 15,2% | MIT | GGUF |
| Qwen3.5-0.8B manumit v1 | no disponible | no disponible | no disponible | no disponible | no disponible | GGUF |

No se dispone de datos comparativos con otros modelos de la misma categoria más allá de los presentados.

## Limitaciones y advertencias

- No existe capa de seguridad ni modelo guardián: el modelo genera sin filtrar contenido, por lo que el usuario es responsable legal y éticamente del uso.
- Riesgo de alucinación no cuantificado; al ser un modelo pequeño, es previsible que cometa errores factuales, aunque no se han publicado evaluaciones específicas.
- Longitud de contexto no especificada, lo que impide conocer el alcance de la ventana de atención.
- Idiomas soportados no disponibles; no se puede garantizar el comportamiento fuera del inglés u otros idiomas no declarados.
- Licencia MIT para la versión GGUF, pero el modelo base `Qwen/Qwen3.5-0.8B` mantiene sus propios términos. Deben revisarse para uso comercial o redistribución.
- La cabeza de predicción multi-token no está incluida, aunque solo afecta a decodificación especulativa, no a la generación estándar.
- El autor recomienda mantener el crédito de manumit si se fork o comparte el modelo.

## Enlaces

- Repositorio HuggingFace de esta versión GGUF: https://huggingface.co/yethdev/qwen3.5-0.8b-manumit-v2-GGUF
- Modelo base en safetensors: https://huggingface.co/yethdev/qwen3.5-0.8b-manumit-v2
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Versión anterior v1 GGUF: https://huggingface.co/yethdev/qwen3.5-0.8b-manumit-v1-GGUF
