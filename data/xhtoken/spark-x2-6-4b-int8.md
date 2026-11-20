# XHToken/Spark-X2.6-4B-INT8

## Resumen

Spark-X2.6-4B es un modelo de lenguaje compacto de propósito general desarrollado por XHToken (familia SparkLLM), diseñado específicamente para despliegue en dispositivo (*on-device*) y tareas de agentes en entornos reales. Esta ficha corresponde a la variante cuantizada a 8 bits (`Spark-X2.6-4B-INT8`), derivada del modelo base `XHToken/Spark-X2.6-4B`, con 4.112.079.360 parámetros totales y un tamaño de repositorio de 4,5 GB.

La versión 2.6 mantiene exactamente la misma arquitectura que Spark-X2.5-4B y obtiene sus mejoras de capacidad mediante un post-entrenamiento mejorado, con avances declarados en código, flujos agénticos, contexto largo, multilingüismo y razonamiento. Incorpora un presupuesto de razonamiento configurable en tres niveles (ninguno, bajo, alto), lo que permite ajustar latencia y coste de inferencia según la aplicación.

Su relevancia actual radica en que compite en la franja de modelos de ~4B optimizados para ejecución local, con licencia Apache 2.0 y pesos en formato safetensors compatibles con `transformers` (requiere `trust_remote_code=True` y versión 4.57.1). El autor afirma que iguala o supera a modelos de ~9B en varios benchmarks, aunque los datos numéricos de dichos benchmarks no están disponibles en la información proporcionada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia `spark2_5` / `sparkx2_5`, con `custom_code`; detalles internos no disponibles) |
| Parametros totales | 4.112.079.360 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible de forma explícita; el ejemplo de generación usa `max_new_tokens=131072`, lo que sugiere soporte de salidas muy largas |
| Tipos de cuantizacion | INT8 (8-bit, `compressed-tensors`); el modelo base admite otras cuantizaciones no detalladas |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (INT8, `compressed-tensors`), compatible con transformers |

## Arquitectura y entrenamiento

Spark-X2.6-4B es un transformer de 4,11B parámetros que reutiliza la arquitectura de Spark-X2.5-4B sin cambios; según el autor, las ganancias provienen íntegramente del post-entrenamiento. El modelo se distribuye con código personalizado (`custom_code`), por lo que su carga requiere `trust_remote_code=True`. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon RLHF, DPO u otras técnicas de alineación concretas.

La innovación técnica destacada es el **presupuesto de razonamiento controlable** con tres niveles (ninguno, bajo, alto), que permite a la aplicación equilibrar calidad de razonamiento, latencia y coste. El autor reporta que, al pasar de esfuerzo alto a bajo, la puntuación media cae 1,7 puntos en el modelo de 4B mientras la longitud media de salida se reduce un 22,0 % (en el modelo hermano de 1,7B la caída es de 4,0 puntos con una reducción del 37,3 %). También se menciona eficiencia de inferencia comparable o superior a Qwen3.5-4B y Gemma-E4B, sin cifras concretas disponibles.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat (`apply_chat_template`) y soporte de modo pensamiento (`enable_thinking`).
- Razonamiento con presupuesto configurable en tres niveles (ninguno, bajo, alto).
- Codificación y ingeniería de software: el autor declara mejoras sustanciales en tareas de código.
- Flujos agénticos: uso complejo de herramientas, planificación multi-paso y *tool calling* en el contexto de agentes.
- Contexto largo: mejoras declaradas en tareas de contexto extendido, con ejemplos que generan hasta 131.072 tokens nuevos.
- Multilingüismo limitado a inglés y chino.
- Capacidades matemáticas y de conocimiento general evaluadas en los benchmarks del autor (sin cifras publicadas en la información disponible).
- No se indica soporte de visión, audio ni otras modalidades.

## Casos de uso

- **Asistentes en dispositivo (móvil, portátil, edge)**: con 4,11B parámetros y pesos INT8 de 4,5 GB, el modelo puede ejecutarse en hardware de consumo, lo que permite asistentes locales sin enviar datos a la nube; el presupuesto de razonamiento «ninguno» reduce latencia en respuestas simples.
- **Automatización de agentes con tool calling**: adecuado para orquestar llamadas a APIs y planificación multi-paso en entornos con recursos limitados, gracias a las mejoras declaradas en flujos agénticos y uso complejo de herramientas.
- **Asistencia de código en IDE local**: el modelo declara mejoras sustanciales en código y puede integrarse en editores o pipelines de CI/CD para autocompletado, generación de tests y revisión de parches, manteniendo el código dentro de la máquina del desarrollador.
- **Procesamiento de documentos largos**: con generación de hasta 131.072 tokens y mejoras en contexto largo, sirve para resumir o extraer información de contratos, informes o expedientes extensos en inglés o chino.
- **Atención al cliente bilingüe (en/zh)**: conversaciones multi-turno con contexto largo para soporte automatizado en mercados anglófonos y sinófonos, con la ventaja de que el modelo es ligero y desplegable en servidores modestos.
- **Razonamiento con control de coste**: en aplicaciones por lotes donde el coste de inferencia importa, el nivel de razonamiento «bajo» reduce la longitud de salida un 22 % con una pérdida media de solo 1,7 puntos, según el autor.
- **Prototipado rápido con SGLang o transformers**: el modelo incluye instrucciones de despliegue con SGLang (imágenes para GPU NVIDIA y NPU Ascend) y un ejemplo listo para `transformers==4.57.1`, lo que facilita su evaluación en pipelines de investigación.

## Benchmarks y rendimiento

El autor publica gráficas comparativas (archivos `benchmark.svg`, `all_benchmark.svg`, `inference.svg`, `reasoning_effort.svg`) frente a modelos on-device de tamaño similar, pero **no se han proporcionado los valores numéricos** de MMLU, HumanEval, GSM8K ni de otros benchmarks en la información disponible. Los únicos datos cuantitativos son los del análisis de esfuerzo de razonamiento:

| Modelo | Caída media de puntuación (alto → bajo) | Reducción de longitud de salida |
|---|---|---|
| Spark-X2.6-4B | 1,7 puntos | 22,0 % |
| Spark-X2.6-1.7B | 4,0 puntos | 37,3 % |

No se han publicado resultados de benchmarks numéricos en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: los pesos INT8 ocupan aproximadamente 4,5 GB; con caché KV y overhead de runtime, se recomienda un mínimo de 6-8 GB de VRAM para contextos moderados, y más para contextos muy largos.
- **GPU de consumo**: cabe en tarjetas con 8 GB o más (por ejemplo, RTX 3060 Ti/4060 Ti de 8 GB, RTX 4070/4080/4090). En 6 GB podría requerir contextos reducidos.
- **GPU de datacenter**: A100, H100 y similares para servir múltiples peticiones concurrentes; el autor también documenta despliegue en NPU Ascend (A2 y A3) mediante SGLang.
- **Opciones de despliegue**: `transformers` (>= 4.57.1, con `trust_remote_code=True`), SGLang (imagen `lmsysorg/sglang:nightly-dev-cu13-20260827-20621aa1` para NVIDIA; `quay.io/ascend/sglang:main-cann9.0.0-a3` y `-910b` para Ascend), con API compatible con OpenAI. No se mencionan explícitamente llama.cpp, Ollama ni TGI en la información disponible.
- **Latencia y throughput**: no disponibles numéricamente; el autor solo afirma eficiencia comparable o superior a Qwen3.5-4B y Gemma-E4B.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Spark-X2.6-4B-INT8 | 4,11B | no disponible (generación hasta 131.072 tokens) | Apache 2.0 | Hugging Face, transformers, SGLang | Presupuesto de razonamiento de 3 niveles; INT8 |
| Qwen3.5-4B | ~4B (no confirmado) | no disponible | no disponible | citado por el autor | Referencia de eficiencia de inferencia según el autor |
| Gemma-E4B | ~4B (no confirmado) | no disponible | no disponible | citado por el autor | Referencia de eficiencia de inferencia según el autor |

No se dispone de datos numéricos de rendimiento comparado en la información proporcionada; la comparativa se limita a las referencias cualitativas del autor.

## Limitaciones y advertencias

- **Idiomas**: solo inglés y chino; el rendimiento en castellano u otros idiomas no está garantizado ni documentado.
- **Riesgo de alucinación**: no se documentan evaluaciones de veracidad ni tasas de alucinación; como todo LLM de 4B, es propenso a errores factuales, especialmente con el nivel de razonamiento desactivado.
- **Sesgos**: no se publica información sobre sesgos demográficos, culturales o lingüísticos.
- **Código personalizado**: requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; conviene auditar el repositorio antes de usarlo en producción.
- **Contexto**: la longitud máxima de contexto no está especificada de forma explícita; el valor de 131.072 aparece como `max_new_tokens` en el ejemplo, no como ventana de contexto confirmada.
- **Licencia**: Apache 2.0 permite uso comercial, pero al ser un modelo derivado cuantizado conviene conservar los avisos de licencia del modelo base.
- **Cuantización INT8**: puede introducir degradación menor frente al modelo base en tareas sensibles; no se publican métricas de la pérdida por cuantización.
- **Datos de benchmarks**: las gráficas del autor no incluyen cifras numéricas en la información disponible, lo que impide verificar las afirmaciones de rendimiento de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/XHToken/Spark-X2.6-4B-INT8
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B
- Slack: https://join.slack.com/t/tokenspark/shared_invite/zt-432qf8l2f-5~dLyXv8uETr0P0UuC07nw
- Discord: https://discord.gg/kTDE2Hg8aw
- YouTube: https://www.youtube.com/@SparkLLM
- dev.to: https://dev.to/sparkllm
- Bluesky: https://bsky.app/profile/sparkllm.bsky.social
- X (Twitter): https://x.com/sparkllm
- Zhihu: https://www.zhihu.com/people/zhiikz7qh7m
