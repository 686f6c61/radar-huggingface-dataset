# XHToken/Spark-X2.6-4B-FP8

## Resumen

Spark-X2.6-4B es un modelo de lenguaje compacto de propósito general desarrollado por XHToken (familia SparkLLM), pensado específicamente para despliegue en dispositivo (*on-device*) y para cargas de trabajo de agentes en entornos reales. Se trata de la evolución del Spark-X2.5-4B, del que conserva exactamente la misma arquitectura: las mejoras de capacidad provienen íntegramente de un post-entrenamiento revisado, no de un cambio estructural ni de un aumento de tamaño. Con 4.112.079.360 parámetros reales (verificados en los safetensors), se sitúa en la franja de los modelos de ~4B que caben en GPUs de consumo y en hardware de borde.

El modelo se distribuye con licencia Apache 2.0, soporta inglés y chino, y está publicado en formato Transformers con pesos safetensors y código personalizado (`trust_remote_code=True`). Esta ficha concreta corresponde a la variante cuantizada en FP8 (`Spark-X2.6-4B-FP8`, mediante `compressed-tensors`), que reduce el peso del checkpoint a unos 4,5 GB de repositorio.

Su relevancia actual reside en dos ejes: por un lado, el autor declara mejoras sustanciales en código, uso de herramientas, planificación multi-paso, contexto largo, multilingüismo y razonamiento, con resultados que afirma igualar o superar a modelos de ~9B en varias pruebas; por otro, incorpora un presupuesto de razonamiento configurable en tres niveles (ninguno, bajo, alto) que permite ajustar latencia, coste de inferencia y calidad de razonamiento por aplicación. El soporte de SGLang, incluidos *tool-call parser* y *reasoning parser* dedicados, y la compatibilidad con NPUs Ascend refuerzan su orientación a producción en el borde.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (se indica que conserva "exactamente la misma arquitectura" que Spark-X2.5-4B; no se detalla en la informacion disponible si es denso o MoE) |
| Parametros totales | 4.112.079.360 (4,11B) |
| Parametros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | Hasta 1.048.576 tokens en la configuracion de ejemplo de SGLang (`--context-length 1048576`); no se especifica la longitud nativa de entrenamiento |
| Tipos de cuantizacion | FP8 (via `compressed-tensors`) en este repositorio; otros formatos del modelo base no disponibles en la informacion |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Transformers, con `custom_code`) |

Otros datos: tamano del repositorio 4,5 GB; 62 descargas y 14 likes en el momento de la consulta; creado el 2026-10-20 y actualizado el 2026-10-21.

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 4,11B parametros que reutiliza la arquitectura de Spark-X2.5-4B sin modificaciones. El autor es explícito en que la ganancia de capacidad de la versión 2.6 procede del post-entrenamiento, no de cambios en el backbone. No se detalla en la informacion disponible el número de capas, dimensiones ocultas, cabezas de atención, tipo de atención (completa, lineal o híbrida), ni la composición exacta del corpus de preentrenamiento en tokens. Tampoco se especifican las técnicas de alineación empleadas (RLHF, DPO u otras) más allá de la referencia genérica a "improved post-training".

Sí se documenta una innovación de control relevante: un **presupuesto de razonamiento configurable** con tres niveles (ninguno, bajo, alto), activable desde la plantilla de chat (`enable_thinking=True` en el ejemplo de Transformers). Esto permite que la misma implementación alterne entre respuestas directas de baja latencia y cadenas de razonamiento extendidas. En el plano del serving, el modelo se integra con SGLang mediante un *tool-call parser* propio (`spark25`) y un *reasoning parser* (`qwen3`), lo que sugiere un formato de razonamiento y de llamadas a herramientas compatible con el ecosistema Qwen.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y chino.
- Razonamiento con presupuesto de cómputo configurable en tres niveles (none, low, high).
- Generación y edición de código, con mejoras declaradas en tareas de ingeniería de software.
- Flujos agénticos: uso complejo de herramientas (*tool calling* / *function calling*), planificación multi-paso y ejecución de tareas encadenadas.
- Contexto largo: la configuración de SGLang admite hasta 1.048.576 tokens de ventana y el ejemplo de generación fija `max_new_tokens=131072`.
- Capacidades multilingües limitadas a inglés y chino según la model card.
- Matemáticas y tareas de conocimiento general (evaluadas en los benchmarks del autor, sin cifras publicadas en el texto).
- Integración con APIs compatibles con OpenAI a través del servidor de SGLang.

## Casos de uso

- **Agentes de escritorio o móviles con herramientas locales**: el modelo puede orquestar llamadas a APIs, lectura de ficheros y acciones multi-paso con un presupuesto de razonamiento ajustable, de modo que las operaciones triviales se resuelvan con `thinking=none` y las complejas con `thinking=high`, controlando la latencia percibida por el usuario.
- **Asistente de código integrado en el IDE**: con 4,11B parámetros en FP8 (unos 4,5 GB de pesos) cabe en una GPU de consumo, lo que permite autocompletado, generación de tests y refactorizaciones sin enviar código a la nube.
- **Atención al cliente automatizada**: la ventana de contexto larga configurable en SGLang permite mantener historiales extensos o adjuntar documentación de producto sin truncar; el soporte bilingüe en/zh cubre mercados asiáticos y angloparlantes.
- **Procesamiento de documentos largos**: resumen, extracción de entidades y preguntas sobre contratos o informes de cientos de miles de tokens, siempre que la VRAM disponible permita la caché KV correspondiente (véase la sección de hardware).
- **Pipelines de CI/CD para revisión de código**: el *tool-call parser* `spark25` en SGLang facilita invocar herramientas externas (linters, ejecutores de tests, gestores de incidencias) desde el propio flujo del agente.
- **Despliegue en hardware no NVIDIA**: la model card incluye imágenes de SGLang para Ascend NPU (A2 y A3), lo que habilita inferencia en infraestructura Ascend sin GPU NVIDIA.
- **Asistente educativo o de soporte técnico en el borde**: al no requerir conectividad, encaja en escenarios con requisitos de privacidad o de funcionamiento offline.

## Benchmarks y rendimiento

La model card referencia gráficos de resultados (`images/benchmark.svg`, `images/all_benchmark.svg`) y afirma que el modelo alcanza el mejor rendimiento de su clase de tamaño, igualando o superando a modelos de ~9B en varias pruebas, además de una eficiencia de inferencia "igual o mejor" que Qwen3.5-4B y Gemma-E4B. Sin embargo, **en la informacion proporcionada no se incluyen las cifras numericas de dichos graficos**, por lo que no es posible reproducir aquí valores de MMLU, HumanEval, GSM8K ni de las suites de agente, código, matemáticas y conocimiento empleadas.

No se han publicado resultados de benchmarks numericos en la informacion disponible. Las afirmaciones cualitativas del autor (mejor de su clase, paridad con modelos de 9B) deben tratarse como declaraciones del desarrollador y verificarse contra los gráficos originales del repositorio antes de tomar decisiones de adopción.

## Requisitos de hardware

- **Pesos en FP8**: aproximadamente 4,1-4,5 GB (el repositorio completo ocupa 4,5 GB), lo que deja margen para caché KV en GPUs de 8 GB o más.
- **Pesos en BF16/FP16** (si se usa el modelo base): en torno a 8,2 GB, ajustado para GPUs de 12-16 GB.
- **GPU de consumo**: sí cabe. Una RTX 4090 (24 GB, soporte nativo FP8 en arquitectura Ada) puede ejecutar el checkpoint FP8 con contexto moderado; GPUs de 8-12 GB pueden servir contextos cortos o cuantizaciones adicionales no listadas aquí.
- **GPU de datacenter**: A100, H100/H200 y L40S son adecuadas; el ejemplo de SGLang usa `--tp-size 1`, es decir, una sola GPU basta para el modelo a nivel de pesos.
- **Contexto largo**: la configuración de 1.048.576 tokens exige memoria de dispositivo considerable. La propia model card advierte que hay que reducir `--context-length` cuando la memoria no sea suficiente. No se dispone del número de capas y cabezas KV para calcular la caché por token.
- **Opciones de despliegue confirmadas**: Transformers (requiere `transformers==4.57.1` y `trust_remote_code=True`) y SGLang (imagen `lmsysorg/sglang:nightly-dev-cu13-20260827-20621aa1` para NVIDIA; imágenes `quay.io/ascend/sglang` para Ascend A2/A3). vLLM, llama.cpp, Ollama y TGI no se mencionan en la informacion disponible.
- **Latencia y throughput**: no disponibles. Solo se declara cualitativamente una eficiencia de inferencia comparable o superior a Qwen3.5-4B y Gemma-E4B.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Spark-X2.6-4B (FP8) | 4,11B | Hasta 1.048.576 tokens en config. SGLang (nativo no disponible) | Apache 2.0 | HuggingFace, Transformers y SGLang | Presupuesto de razonamiento en 3 niveles; idiomas en/zh |
| Spark-X2.5-4B | No disponible en la informacion (misma arquitectura que X2.6) | No disponible | No disponible en la informacion | HuggingFace (modelo base de la familia) | Versión anterior; X2.6 mejora solo por post-entrenamiento |
| Qwen3.5-4B | No disponible en la informacion | No disponible | No disponible en la informacion | Citado por el autor como referencia de eficiencia | El autor afirma eficiencia de inferencia igual o superior en Spark-X2.6-4B |
| Gemma-E4B | No disponible en la informacion | No disponible | No disponible en la informacion | Citado por el autor como referencia de eficiencia | Modelo de borde comparable según la model card |
| Modelos de ~9B | ~9B (no especificado) | No disponible | No disponible | No disponible | El autor afirma paridad o superioridad de Spark-X2.6-4B en varios benchmarks |

No se dispone de datos de parámetros, contexto ni licencia de las alternativas en la informacion proporcionada; la comparación cuantitativa detallada requeriría consultar las fichas oficiales de cada modelo.

## Limitaciones y advertencias

- **Idiomas**: la model card solo declara inglés y chino. El rendimiento en castellano u otras lenguas no está documentado ni garantizado.
- **Sesgos**: no se publica ninguna evaluación de sesgos, toxicidad o alineación de seguridad en la informacion disponible.
- **Alucinación**: no se documentan tasas de alucinación ni mecanismos de mitigación más allá del modo de razonamiento; en un modelo de 4B el riesgo en tareas de conocimiento factual es estructuralmente alto.
- **Benchmarks no verificables con la informacion dada**: las afirmaciones de paridad con modelos de 9B provienen de gráficos no incluidos en el texto; conviene validarlas de forma independiente en el dominio de uso concreto.
- **Código remoto**: requiere `trust_remote_code=True` y una versión fijada de Transformers (`4.57.1`), lo que implica auditar el código personalizado antes de desplegarlo y limita la portabilidad entre versiones.
- **FP8 y hardware**: la variante FP8 rinde de forma óptima en GPUs con soporte nativo (Ada/Hopper). En GPUs anteriores la conversión a BF16 incrementa el uso de VRAM y puede degradar el rendimiento.
- **Contexto largo y memoria**: la ventana de 1.048.576 tokens es una opción de configuración del servidor, no una garantía de calidad de recuperación en esa longitud; la model card advierte explícitamente de los requisitos de memoria.
- **Licencia**: Apache 2.0 permite uso comercial y modificación, pero exige conservar el aviso de licencia y no concede garantías; conviene revisar las obligaciones de atribución en productos derivados.
- **Madurez**: el repositorio es reciente (octubre de 2026) y con tracción baja (62 descargas, 14 likes); el ecosistema de herramientas de terceros (vLLM, llama.cpp, Ollama) no está confirmado.

## Enlaces

- Modelo en HuggingFace (FP8): https://huggingface.co/XHToken/Spark-X2.6-4B-FP8
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B
- Comunidad Slack: https://join.slack.com/t/tokenspark/shared_invite/zt-432qf8l2f-5~dLyXv8uETr0P0UuC07nw
- Discord: https://discord.gg/kTDE2Hg8aw
- YouTube: https://www.youtube.com/@SparkLLM
- dev.to: https://dev.to/sparkllm
- Bluesky: https://bsky.app/profile/sparkllm.bsky.social
- X (Twitter): https://x.com/sparkllm
- Zhihu: https://www.zhihu.com/people/zhiikz7qh7m
