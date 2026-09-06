# yethdev/qwen3.5-9b-manumit-v2-GGUF

## Resumen

`qwen3.5-9b-manumit-v2-GGUF` es una versión cuantizada del modelo `qwen3.5-9b-manumit-v2`, desarrollada por `yethdev` a partir del modelo base `Qwen/Qwen3.5-9B`. El objetivo principal es eliminar la conducta de rechazo (*refusal*) del modelo mediante la técnica `manumit`, que identifica las direcciones en el *residual stream* que codifican dicho rechazo y las proyecta fuera de los pesos, para después reentrenar el modelo con datos ordinarios y minimizar la pérdida de capacidad.

El modelo tiene 8.953.803.264 parámetros (aprox. 8.95B) y se distribuye en formato GGUF, con cuantizaciones Q4_K_M, Q5_K_M y Q8_0, pensadas para ejecutarse en CPU o en GPU pequeñas mediante `llama.cpp`, `Ollama` o `LM Studio`. No se ha publicado la longitud de contexto ni los idiomas soportados en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3.5-9B) |
| Parametros totales | 8.953.803.264 (aprox. 8.95B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q8_0 |
| Idiomas soportados | No disponible |
| Licencia | MIT (el modelo base Qwen mantiene sus propios términos) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 8.95B parámetros, basado en `Qwen/Qwen3.5-9B`. La innovación técnica principal es la aplicación de la técnica `manumit`, que proyecta fuera de los pesos las direcciones del *residual stream* asociadas al rechazo. Posteriormente, el modelo se somete a un proceso de "sanado" (*healing*) con datos ordinarios para recuperar capacidad. No se han publicado datos sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO.

El *multi-token-prediction head* no está incluido en los archivos GGUF. Según el autor, este head solo se usaba para decodificación especulativa y su ausencia no afecta a la generación normal.

## Capacidades

- Generación de texto en lenguaje natural.
- Razonamiento general: alcanza un 48.2% en MMLU-Pro (n=500), según las mediciones del autor.
- Respuestas sin rechazo: la tasa de rechazo es del 0.0% en AdvBench-test y JailbreakBench, lo que significa que no se niega a responder a prompts considerados dañinos.
- Ejecución local en CPU o GPU pequeña gracias a las cuantizaciones GGUF.
- Compatibilidad con `llama.cpp`, `Ollama` y `LM Studio`.
- No se han publicado datos sobre soporte de tool calling, function calling, agentes, visión o audio en la información disponible.

## Casos de uso

- **Investigación en seguridad ofensiva**: el modelo puede responder a preguntas sobre vulnerabilidades, exploits o técnicas de ataque sin rechazarlas, lo que facilita el trabajo de profesionales que realizan pruebas de penetración con autorización.
- **Red-teaming y evaluación de sistemas de defensa**: al no tener capa de seguridad, es útil como "adversario" para probar guardrails de otros modelos o sistemas de moderación, midiendo si rechazan contenido dañino.
- **Generación de contenido creativo sin restricciones**: escritores y desarrolladores de videojuegos pueden usarlo para crear ficción, diálogos o roleplay que aborden temas oscuros o adultos sin que el modelo imponga filtros morales.
- **Análisis de texto en dominios sensibles**: en aplicaciones de procesamiento de lenguaje natural que manejan textos con lenguaje ofensivo, violencia o temas tabú, el modelo no rechazará el contenido, lo que permite análisis de sentimiento, clasificación o extracción de información en esos dominios.
- **Estudio de la ablación de rechazo**: investigadores en alineación pueden comparar este modelo con el modelo base para entender cómo afecta la eliminación del rechazo al comportamiento general, midiendo diferencias en benchmarks como MMLU-Pro o AdvBench.
- **Despliegue de asistentes especializados sin filtros**: se puede integrar en pipelines de soporte técnico o documentación donde se necesite responder preguntas directas sobre errores, fallos de seguridad o situaciones límite sin respuestas evasivas.
- **Fine-tuning para tareas específicas**: al ser un modelo base sin rechazo, es un buen punto de partida para ajustes finos en dominios donde las respuestas deben ser directas y sin rodeos, como simulaciones de entrevistas de trabajo o asistentes de coaching.

## Benchmarks y rendimiento

| Benchmark | Este modelo (manumit v2) | Modelo base |
|---|---|---|
| AdvBench refusal | 0.0% | Alto |
| JailbreakBench refusal | 0.0% | Alto |
| MMLU-Pro (n=500) | 48.2% | 51.0% |

El autor indica que la ablación supone una pérdida de 2.8 puntos en MMLU-Pro respecto al modelo base. No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: para Q4_K_M (~5.6 GB) se estima un uso de VRAM de 6-7 GB. Para Q5_K_M (~6.5 GB), 7-8 GB. Para Q8_0 (~9.5 GB), 10-11 GB. Son estimaciones orientativas, no cifras oficiales.
- **GPU recomendadas**: Q4_K_M y Q5_K_M pueden ejecutarse en GPUs con 8-12 GB de VRAM (por ejemplo, RTX 3060 12GB). Q8_0 requiere al menos 12 GB de VRAM; se recomienda una RTX 4090 (24 GB) para mayor margen.
- **CPU y Apple Silicon**: puede ejecutarse en CPU con suficiente RAM mediante `llama.cpp`, y en equipos Apple Silicon con 16 GB o más.
- **Opciones de despliegue**: `llama.cpp`, `Ollama`, `LM Studio`.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU-Pro | Refusal | Licencia | Formato |
|---|---|---|---|---|---|---|
| qwen3.5-9b-manumit-v2 (GGUF, este repo) | 8.95B | No disponible | 48.2% | 0.0% | MIT | GGUF |
| qwen3.5-9b-manumit-v2 (safetensors) | 8.95B | No disponible | 51.0% | Alto | MIT | Safetensors |
| Qwen/Qwen3.5-9B (original) | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparativa directa disponible es con el modelo base `qwen3.5-9b-manumit-v2` en formato safetensors. No se han encontrado datos de otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- **No hay capa de seguridad**: el modelo genera contenido sin filtrar; cualquier uso dañino es responsabilidad del usuario.
- **Riesgo de alucinación**: al ser un modelo de lenguaje, puede generar información falsa, especialmente en temas específicos. No se han publicado evaluaciones de alucinación.
- **Sesgos conocidos**: no se han publicado evaluaciones de sesgo.
- **Limitaciones de idioma**: no se especifican los idiomas soportados; se desconoce si el rendimiento es uniforme en todas las lenguas.
- **Restricciones de licencia**: aunque el modelo GGUF se distribuye bajo MIT, el modelo base Qwen/Qwen3.5-9B mantiene sus propios términos de uso, que deben respetarse.
- **Pérdida de capacidad**: la ablación reduce MMLU-Pro en 2.8 puntos respecto al modelo base (48.2% frente a 51.0%).
- **Ausencia del multi-token-prediction head**: esto no afecta a la generación normal, pero puede impedir el uso de decodificación especulativa basada en ese mecanismo.
- **Sin guard model**: el modelo no está supervisado por ningún filtro de salida, por lo que puede emitir contenido que infrinja normas legales o éticas.

## Enlaces

- Repositorio GGUF: [https://huggingface.co/yethdev/qwen3.5-9b-manumit-v2-GGUF](https://huggingface.co/yethdev/qwen3.5-9b-manumit-v2-GGUF)
- Modelo base (safetensors): [https://huggingface.co/yethdev/qwen3.5-9b-manumit-v2](https://huggingface.co/yethdev/qwen3.5-9b-manumit-v2)
- Versión preview GGUF: [https://huggingface.co/yethdev/qwen3.5-9b-manumit-v2-preview-gguf](https://huggingface.co/yethdev/qwen3.5-9b-manumit-v2-preview-gguf)
- Modelo original Qwen: [https://huggingface.co/Qwen/Qwen3.5-9B](https://huggingface.co/Qwen/Qwen3.5-9B)
