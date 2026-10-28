# XHToken/Spark-X2.6-1.7B-GGUF

## Resumen

Spark-X2.6-1.7B es un modelo de lenguaje compacto de propósito general desarrollado por XHToken (familia SparkLLM), pensado para inferencia en dispositivo (*on-device*). Es el segundo miembro de la serie Spark-X2.6, tras el Spark-X2.6-4B, y se construye sobre Spark-X2.5-1.7B conservando exactamente la misma arquitectura: las mejoras provienen íntegramente de un post-entrenamiento revisado, según indica el autor. El repositorio documentado aquí es la versión cuantizada en GGUF del checkpoint base `XHToken/Spark-X2.6-1.7B`, con 1.976.092.672 parámetros totales (~1,97 B) y licencia Apache-2.0.

El modelo declara mejoras sustanciales frente a su predecesor en código, uso de herramientas (*agentic*), contexto largo, multilingüismo y razonamiento, y añade un presupuesto de razonamiento configurable en tres niveles (ninguno, bajo, alto) que permite ajustar latencia frente a calidad. Su propuesta de valor es la eficiencia: el autor afirma obtener el mayor *throughput* de decodificación entre modelos de tamaño comparable (Qwen3.5-2B, MiniCPM-2B, LFM2.5-2.6B) en contextos cortos, con una implementación optimizada de llama.cpp para RTX 4090.

Es relevante ahora porque cubre el nicho de modelos sub-2B con soporte de *tool calling*, contexto muy largo en despliegue (el ejemplo de SGLang configura 1.048.576 tokens) y ejecución tanto en GPU NVIDIA como en NPU Ascend. Sus idiomas soportados declarados son únicamente inglés y chino, lo que limita su uso directo en castellano sin ajuste adicional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No detallada en la información disponible; el autor indica que es idéntica a la de Spark-X2.5-1.7B (modelo de lenguaje causal para generación de texto) |
| Parámetros totales | 1.976.092.672 (~1,97 B), dato de safetensors |
| Parámetros activos | No aplica (no se describe como MoE) |
| Longitud de contexto | Hasta 1.048.576 tokens según el ejemplo de servidor SGLang del autor; el ejemplo de Transformers usa `max_new_tokens=131072` |
| Tipos de cuantización | Repositorio en formato GGUF; los niveles concretos (Q4_K_M, Q8_0, etc.) no se detallan en la información disponible |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF en este repositorio; safetensors en el modelo base `XHToken/Spark-X2.6-1.7B` |
| Tamaño del repositorio | 12,3 GB |
| Versión de Transformers requerida | 4.57.1 (con `trust_remote_code=True`) |
| Descargas / likes | 1.178 descargas / 20 likes |
| Fecha de creación / actualización | 2026-10-19 / 2026-10-28 |

## Arquitectura y entrenamiento

El autor no publica detalles de arquitectura más allá de afirmar que Spark-X2.6-1.7B «retiene exactamente la misma arquitectura que Spark-X2.5-1.7B». No se especifica en la información disponible si se trata de un transformer denso convencional, un híbrido o un MoE, ni se detalla el mecanismo de atención, la composición del tokenizador o el tamaño del vocabulario. Lo que sí se documenta es el resultado: las ganancias de capacidad proceden del post-entrenamiento, no de cambios estructurales, lo que implica que las recetas de alineación y datos de instrucción son el eje del lanzamiento.

No hay datos sobre volumen de tokens de entrenamiento, composición del corpus ni sobre el uso de RLHF, DPO u otras técnicas de alineación. Tampoco se documentan innovaciones de inferencia propias del modelo más allá del sistema de presupuesto de pensamiento en tres niveles y de una implementación optimizada de llama.cpp mantenida por el propio autor (`github.com/XHToken/llama.cpp`), que según la model card amplía la ventaja de *throughput* en todos los contextos probados sobre una RTX 4090. El despliegue en SGLang utiliza `--tool-call-parser spark25` y `--reasoning-parser qwen3`, lo que sugiere un formato de razonamiento y de llamadas a herramientas compatible con el ecosistema Qwen.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat propia (`chat_template.jinja`).
- Razonamiento con presupuesto controlable: tres niveles de *thinking* (ninguno, bajo, alto) seleccionables en la plantilla de chat (`enable_thinking=True` en el ejemplo de Transformers).
- Codificación y ingeniería de software: el autor declara mejoras sustanciales en código, uso complejo de herramientas, planificación multi-paso y razonamiento sobre contextos extensos.
- *Tool calling* / *function calling*: soportado de forma nativa en el servidor SGLang mediante el parser `spark25`.
- Capacidades de agente y razonamiento multi-paso, orientadas a tareas de automatización.
- Contexto largo: el despliegue de referencia con SGLang se configura con 1.048.576 tokens de ventana.
- Multilingüe limitado a inglés y chino.
- Inferencia eficiente en dispositivo: el autor reporta el mejor *throughput* de decodificación entre modelos comparables de su tamaño en contextos cortos.
- Compatibilidad con *endpoints* (etiqueta `endpoints_compatible`) y despliegue en GPU NVIDIA y NPU Ascend (series A2 y A3 vía imágenes de SGLang).
- No se documentan capacidades de visión, audio ni modalidades distintas del texto.

## Casos de uso

- **Asistente local en aplicaciones de escritorio o móviles**: con ~1,97 B parámetros y cuantización GGUF de 4 bits, el modelo ocupa alrededor de 1,2 GB de pesos, lo que permite ejecutarlo en hardware de consumo sin conexión y con latencia baja gracias al nivel de *thinking* desactivable.
- **Agente de automatización con herramientas**: el soporte de *tool calling* mediante el parser `spark25` en SGLang permite encadenar llamadas a APIs, consultas a bases de datos y acciones sobre sistemas externos en flujos multi-paso, con el nivel de razonamiento alto activado solo en los pasos que lo requieran.
- **Copiloto de código en IDE o en pipelines de CI/CD**: las mejoras declaradas en código y *software engineering* lo hacen apto para autocompletado, generación de tests y revisión de parches dentro de un runner con GPU modesta, donde un modelo mayor no sería viable por coste.
- **Procesamiento de documentos largos**: con la ventana de 1.048.576 tokens configurable en SGLang (sujeta a memoria disponible), puede resumir expedientes, contratos o hilos de incidencias completos sin troceado, aunque el coste de KV cache crece de forma proporcional.
- **Atención al cliente automatizada en inglés y chino**: gestión de conversaciones multi-turno con contexto persistente para mercados anglófono y sinófono; no es adecuado para atención en castellano sin ajuste fino previo.
- **Extracción estructurada y clasificación por lotes**: para tareas de etiquetado, extracción de entidades o enrutamiento de tickets a bajo coste, usando el modo sin razonamiento para maximizar *throughput* por GPU.
- **Despliegue en entornos sin GPU NVIDIA**: las imágenes de SGLang para Ascend A2 y A3 permiten servir el modelo en infraestructura NPU, un caso poco cubierto por modelos comparables.
- **Generación de razonamiento con presupuesto de latencia variable**: aplicaciones interactivas que activan el nivel alto solo en consultas complejas y el nivel nulo en el resto, equilibrando calidad y coste por petición.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. La model card incluye gráficas en formato SVG (`images/all_benchmark.svg` e `images/inference.svg`) que comparan el modelo con alternativas *on-device* en tareas de agente, código, matemáticas, conocimiento general y *throughput* de decodificación, pero los valores concretos no son accesibles en el texto proporcionado. El autor afirma resultados estado del arte entre modelos de tamaño comparable, sin cifras verificables en esta ficha.

## Requisitos de hardware

- **VRAM estimada para inferencia** (cálculo a partir de 1,97 B parámetros, sin contar KV cache): ~3,95 GB en FP16, ~2,1 GB en cuantización de 8 bits, ~1,2 GB en 4 bits. Añadir entre 0,5 y 1,5 GB de sobrecarga para contexto, *runtime* y KV cache en ventanas moderadas.
- **Cabe en GPU de consumo**: sí, en cualquier GPU con 4 GB o más de VRAM en cuantizaciones de 4-8 bits (RTX 3060, RTX 4060, RTX 4090, entre otras). El autor valida explícitamente el rendimiento en una RTX 4090.
- **GPU recomendadas**: RTX 4090 para el máximo *throughput* según las pruebas del autor; A100/H100 para servir muchas réplicas concurrentes o contextos muy largos con SGLang. El ejemplo de SGLang usa `--tp-size 1`, es decir, una sola GPU.
- **Contexto largo**: los 1.048.576 tokens del ejemplo de SGLang requieren memoria de dispositivo abundante; la propia model card advierte de reducir `--context-length` cuando no haya suficiente VRAM.
- **Aceleradores alternativos**: NPU Ascend A3 y A2 mediante las imágenes `quay.io/ascend/sglang:main-cann9.0.0-a3` y `...-910b`.
- **Opciones de despliegue documentadas**: Transformers 4.57.1 (con `trust_remote_code=True`), SGLang (imagen `lmsysorg/sglang:nightly-dev-cu13-20260827-20621aa1`) y llama.cpp mediante el fork optimizado del autor. Otros motores compatibles con GGUF (Ollama, LM Studio, llama-cpp-python) no se documentan en la información disponible.
- **Latencia y throughput**: no se publican cifras absolutas (tokens/s); solo se afirma que el modelo lidera la decodificación en contextos cortos frente a Qwen3.5-2B, MiniCPM-2B y LFM2.5-2.6B, con ventaja ampliada al usar el fork de llama.cpp en RTX 4090.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Spark-X2.6-1.7B | 1,97 B | Hasta 1.048.576 tokens (config. SGLang) | Apache-2.0 | HuggingFace (GGUF y safetensors) | Presupuesto de *thinking* en 3 niveles; *tool calling*; EN/ZH |
| Qwen3.5-2B | No disponible en la información | No disponible | No disponible | No disponible | Citado por el autor como referencia de *throughput* en dispositivo |
| MiniCPM-2B | No disponible en la información | No disponible | No disponible | No disponible | Citado por el autor como referencia de *throughput* en dispositivo |
| LFM2.5-2.6B | No disponible en la información | No disponible | No disponible | No disponible | Citado por el autor como referencia de *throughput* en dispositivo |

No se dispone de datos verificables de parámetros, contexto, licencia ni resultados de benchmarks de los modelos comparables en la información proporcionada; la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- **Cobertura de idiomas restringida**: solo inglés y chino. No hay evidencia de calidad en castellano ni en otras lenguas latinas; usarlo en producción para español requeriría evaluación propia o ajuste fino.
- **Ausencia de datos de benchmarks verificables**: la model card presenta gráficas sin cifras extraíbles; las afirmaciones de estado del arte son del autor y no contrastables en esta ficha.
- **Riesgo de alucinación**: inherente a un modelo de ~2 B parámetros; no se documentan tasas de error ni evaluaciones de factualidad.
- **Sesgos**: no se publica información sobre composición del dataset, filtrado ni evaluaciones de sesgo; el corpus parece centrado en inglés y chino.
- **Contexto largo y memoria**: la ventana de 1.048.576 tokens es una configuración de servidor, no una garantía de calidad de atención en distancias extremas; el coste de KV cache puede exceder la VRAM disponible.
- **Licencia**: Apache-2.0 permite uso comercial, modificación y redistribución con atribución; no se especifican restricciones adicionales en la información disponible.
- **Cuantizaciones no detalladas**: el repositorio GGUF no enumera en la información disponible qué niveles incluye, a pesar de sus 12,3 GB de tamaño.
- **Dependencia de código remoto**: el uso con Transformers exige `trust_remote_code=True` y una versión concreta (4.57.1), lo que añade superficie de riesgo en la cadena de suministro.
- **Parsers específicos**: el *tool calling* y el razonamiento en SGLang dependen de `spark25` y `qwen3` respectivamente; otros motores de servicio requerirán implementar el formato manualmente.
- **Fecha de publicación reciente** (octubre de 2026): ecosistema de tooling y validación independiente todavía limitados.

## Enlaces

- [HuggingFace: XHToken/Spark-X2.6-1.7B-GGUF](https://huggingface.co/XHToken/Spark-X2.6-1.7B-GGUF)
- [Modelo base: XHToken/Spark-X2.6-1.7B](https://huggingface.co/XHToken/Spark-X2.6-1.7B)
- [Implementación optimizada de llama.cpp del autor](https://github.com/XHToken/llama.cpp)
- [Slack de la comunidad Spark](https://join.slack.com/t/tokenspark/shared_invite/zt-432qf8l2f-5~dLyXv8uETr0P0UuC07nw)
- [Discord](https://discord.gg/kTDE2Hg8aw)
- [YouTube @SparkLLM](https://www.youtube.com/@SparkLLM)
- [dev.to SparkLLM](https://dev.to/sparkllm)
- [Bluesky @sparkllm](https://bsky.app/profile/sparkllm.bsky.social)
- [X (Twitter) @sparkllm](https://x.com/sparkllm)
- [Zhihu](https://www.zhihu.com/people/zhiikz7qh7m)
- [WeChat (imagen QR)](https://huggingface.co/XHToken/Spark-X2.6-1.7B-GGUF/blob/main/images/xhtoken-wechat.jpg)
- [Gráficas de benchmarks](https://huggingface.co/XHToken/Spark-X2.6-1.7B-GGUF/blob/main/images/all_benchmark.svg)
- [Gráficas de inferencia en dispositivo](https://huggingface.co/XHToken/Spark-X2.6-1.7B-GGUF/blob/main/images/inference.svg)
- [Imagen SGLang para NVIDIA](https://hub.docker.com/r/lmsysorg/sglang)
- [Imágenes SGLang para Ascend NPU](https://quay.io/repository/ascend/sglang)
