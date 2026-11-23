# XHToken/Spark-X2.6-1.7B-INT4

## Resumen

Spark-X2.6-1.7B-INT4 es la versión cuantizada a 4 bits del modelo Spark-X2.6-1.7B, un modelo de lenguaje compacto desarrollado por XHToken (equipo detrás de la serie SparkLLM) y orientado a inferencia en dispositivo. Pertenece a la segunda generación de la familia Spark-X2.6, que sigue al Spark-X2.6-4B, y se construye sobre Spark-X2.5-1.7B conservando exactamente la misma arquitectura: las mejoras de capacidad provienen del post-entrenamiento, no de cambios estructurales.

El modelo está diseñado para despliegue local y en el borde (on-device), con un enfoque explícito en eficiencia de decodificación, soporte de contexto largo, uso de herramientas y razonamiento multi-paso. Incorpora un presupuesto de razonamiento configurable con tres niveles (none, low, high), lo que permite ajustar latencia y coste computacional según la tarea.

Esta variante INT4 emplea compresión con `compressed-tensors` y reduce el repositorio a 1,7 GB, lo que la hace viable en hardware de consumo. La licencia Apache 2.0 y el soporte de transformers, SGLang y una implementación optimizada de llama.cpp facilitan su integración en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (serie Spark2.5/SparkX2.5, código personalizado) |
| Parametros totales | 974.178.304 (aprox. 1,7B nominales) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible de forma explícita; el ejemplo de generación usa `max_new_tokens=131072`, lo que sugiere soporte de contexto largo |
| Tipos de cuantizacion | INT4 (compressed-tensors); el modelo base está disponible en precisión completa |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 1,7 GB) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only idéntico al de Spark-X2.5-1.7B, con pesos en formato transformers y código personalizado (`trust_remote_code=True`). No se trata de un modelo MoE ni híbrido según la información disponible. La model card indica explícitamente que las ganancias de capacidad respecto a la versión anterior provienen del post-entrenamiento mejorado, no de cambios arquitectónicos.

El post-entrenamiento se orientó a reforzar codificación, uso de agentes, contexto largo, multilingüismo y razonamiento. El modelo expone un "thinking budget" con tres niveles (none, low, high); según el autor, al pasar de high a low el rendimiento medio cae 4,0 puntos mientras la longitud media de salida se reduce un 37,3 % (frente a 1,7 puntos y 22,0 % en el modelo de 4B). No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF o DPO.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Razonamiento con presupuesto configurable: niveles none, low y high, ajustables por aplicación para equilibrar calidad, latencia y coste.
- Codificación y ingeniería de software: mejoras declaradas en tareas de código y razonamiento sobre contextos extensos.
- Uso de herramientas (tool use) y planificación multi-paso para flujos agénticos.
- Razonamiento sobre contextos largos, con ejemplos que generan hasta 131072 tokens nuevos.
- Capacidades matemáticas y de conocimiento general evaluadas en los benchmarks del autor.
- Capacidades multilingües limitadas a inglés y chino.
- No se declaran capacidades de visión ni audio en la información disponible.

## Casos de uso

- Asistentes locales en dispositivo: el modelo INT4 de 1,7 GB puede ejecutarse en portátiles y estaciones de trabajo sin GPU dedicada de gran tamaño, ofreciendo un asistente conversacional en inglés o chino con baja latencia.
- Agentes con uso de herramientas: su soporte declarado de tool use y planificación multi-paso permite construir agentes que consulten APIs, ejecuten comandos o encadenen llamadas en pipelines automatizados.
- Generación y revisión de código en local: integrable en editores o scripts de CI para autocompletado, explicación de fragmentos y generación de tests, con el nivel de razonamiento ajustado según la criticidad.
- Procesamiento de documentos largos: el contexto extendido y la generación de hasta 131072 tokens permiten resumir, extraer información o responder preguntas sobre contratos, informes o expedientes extensos.
- Atención al cliente bilingüe (en/zh): conversaciones multi-turno con contexto largo y control del nivel de razonamiento para mantener respuestas rápidas en consultas simples.
- Razonamiento matemático asistido: resolución de problemas paso a paso activando el nivel high, con la opción de bajar a low en tareas rutinarias para reducir coste.
- Despliegue en entornos con recursos limitados: gracias a la cuantización INT4 y a la implementación optimizada de llama.cpp, puede servirse en GPUs de consumo como la RTX 4090 con throughput de decodificación competitivo.

## Benchmarks y rendimiento

La model card incluye gráficas de benchmarks (agent, code, math, general y knowledge) comparando con Qwen3.5-2B, MiniCPM-2B y LFM2.5-2.6B, pero los valores numéricos no están disponibles en el texto proporcionado. Los únicos datos cuantitativos publicados son los del comparison de reasoning effort:

| Metrica | Spark-X2.6-1.7B | Spark-X2.6-4B |
|---|---|---|
| Caida media de score (high → low) | 4,0 puntos | 1,7 puntos |
| Reduccion de longitud media de salida (high → low) | 37,3 % | 22,0 % |

El autor afirma que el modelo supera a modelos de tamaño comparable en la mayoría de benchmarks y que ofrece el mayor throughput de decodificación entre los modelos on-device evaluados en contextos cortos, ventaja que se amplía con su implementación optimizada de llama.cpp en RTX 4090. No se han publicado resultados numéricos detallados de MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repo INT4 ocupa 1,7 GB, por lo que la inferencia cabe holgadamente en GPUs con 4-8 GB de VRAM; en CPU es viable con memoria RAM moderada.
- GPU recomendadas: RTX 4090 (usada por el autor para medir throughput), GPUs de consumo tipo RTX 3060/4060, y aceleradores de datacenter (A100, H100) para servir muchas peticiones concurrentes.
- Cabe en GPU de consumo: sí, gracias a la cuantización INT4; también en NPUs Ascend A2/A3 según los ejemplos de SGLang.
- Opciones de despliegue: transformers (>= 4.57.1, con `trust_remote_code=True`), SGLang (imagen nightly-dev-cu13 y builds para Ascend), y llama.cpp mediante el fork optimizado del autor.
- Latencia y throughput: no se publican cifras absolutas; el autor declara el mejor throughput de decodificación entre modelos comparables en contextos cortos y ventaja creciente con su llama.cpp en RTX 4090.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Spark-X2.6-1.7B-INT4 | ~974M (1,7B nominal) | largo (no confirmado) | Apache 2.0 | HF, SGLang, llama.cpp | Cuantizado INT4, 1,7 GB |
| Qwen3.5-2B | ~2B | no disponible | no disponible | no disponible | Comparado por el autor en benchmarks e inferencia |
| MiniCPM-2B | ~2B | no disponible | no disponible | no disponible | Comparado por el autor en benchmarks e inferencia |
| LFM2.5-2.6B | ~2,6B | no disponible | no disponible | no disponible | Comparado por el autor en benchmarks e inferencia |

Los datos de contexto, licencia y rendimiento de los modelos comparables no están disponibles en la información proporcionada; solo se confirma que el autor los usa como referencia en sus evaluaciones.

## Limitaciones y advertencias

- Idiomas limitados a inglés y chino; el rendimiento en castellano u otras lenguas no está garantizado.
- Riesgo de alucinación inherente a modelos de este tamaño; conviene validar salidas en dominios críticos.
- La cuantización INT4 puede degradar ligeramente la calidad respecto al modelo base en precisión completa; no se publican métricas de la pérdida.
- No se detallan sesgos conocidos ni la composición del dataset de entrenamiento, lo que dificulta auditar riesgos.
- Licencia Apache 2.0 permite uso comercial, pero el código personalizado requiere `trust_remote_code=True`, lo que implica ejecutar código del autor.
- El contexto máximo real no se declara explícitamente; el valor de 131072 tokens aparece solo como `max_new_tokens` en el ejemplo.
- No se declaran capacidades multimodales; no debe asumirse visión o audio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/XHToken/Spark-X2.6-1.7B-INT4
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-1.7B
- Implementación optimizada de llama.cpp: https://github.com/XHToken/llama.cpp
- Slack: https://join.slack.com/t/tokenspark/shared_invite/zt-432qf8l2f-5~dLyXv8uETr0P0UuC07nw
- Discord: https://discord.gg/kTDE2Hg8aw
- YouTube: https://www.youtube.com/@SparkLLM
- dev.to: https://dev.to/sparkllm
- Bluesky: https://bsky.app/profile/sparkllm.bsky.social
- X: https://x.com/sparkllm
- Zhihu: https://www.zhihu.com/people/zhiikz7qh7m
