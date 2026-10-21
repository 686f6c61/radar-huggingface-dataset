# XHToken/Spark-X2.6-4B

## Resumen

Spark-X2.6-4B es un modelo de lenguaje de 4.112.079.360 parámetros (aproximadamente 4,1 mil millones) desarrollado por XHToken, orientado a su despliegue en dispositivo («on-device») y a tareas de agente en entornos reales. Se trata de la evolución del Spark-X2.5-4B y conserva exactamente la misma arquitectura que su predecesor: todas las mejoras declaradas por el autor provienen de una fase de post-entrenamiento más refinada, no de cambios estructurales ni de un aumento de tamaño.

El modelo se distribuye en formato Hugging Face Transformers (safetensors) bajo licencia Apache 2.0, con soporte declarado de inglés y chino, y está afinado a partir de XHToken/Spark-X2.6-4B-Base. Su propuesta de valor se centra en tres ejes: flujos agénticos con uso complejo de herramientas y planificación multi-paso, contexto largo (el ejemplo de despliegue con SGLang configura 1.048.576 tokens) y un presupuesto de razonamiento configurable en tres niveles (none, low, high) que permite ajustar latencia y coste de inferencia por petición.

Es relevante ahora porque compite directamente en el segmento de modelos compactos para_edge_/dispositivo, donde el autor lo compara con Qwen3.5-4B y Gemma-E4B en eficiencia de inferencia y afirma igualar o superar a modelos de ~9B en varios benchmarks. La model card no incluye cifras numéricas de esos benchmarks (solo gráficos en SVG), por lo que las afirmaciones de rendimiento no son verificables con los datos disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No detallada en la model card; hereda la de Spark-X2.5-4B y se carga con `AutoModelForCausalLM` (modelo causal de generación de texto) |
| Parámetros totales | 4.112.079.360 (4,11B) |
| Parámetros activos | No aplica: no se documenta una arquitectura MoE |
| Longitud de contexto | Hasta 1.048.576 tokens en el ejemplo de servidor SGLang (`--context-length 1048576`); el ejemplo de generación usa `max_new_tokens=131072`. La longitud de contexto de entrenamiento no se especifica |
| Tipos de cuantización | No disponible: el repositorio solo publica pesos en safetensors (12,7 GB); no se listan variantes GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers), con `custom_code` y requisito de `trust_remote_code=True` |

## Arquitectura y entrenamiento

La model card es explícita en un punto: Spark-X2.6-4B «retiene exactamente la misma arquitectura que Spark-X2.5-4B». No se publican detalles sobre número de capas, dimensión oculta, cabezas de atención, tipo de atención (completa, lineal o híbrida) ni vocabulario. El repositorio incluye código personalizado (`custom_code`), por lo que la carga requiere `transformers==4.57.1` y `trust_remote_code=True`; esto implica que la implementación de referencia no es la estándar de `transformers` y que la integración en otros runtimes depende de ports específicos.

En cuanto a entrenamiento, la información disponible se limita a indicar que las ganancias proceden de un post-entrenamiento mejorado sobre el modelo base Spark-X2.6-4B-Base, sin especificar volumen de tokens, composición del dataset ni si se emplearon RLHF, DPO u otras técnicas de alineación. Sí se documenta una innovación de producto relevante: un presupuesto de razonamiento controlable con tres niveles (none, low, high), activable mediante `enable_thinking` en la plantilla de chat, que permite desactivar total o parcialmente la cadena de razonamiento para reducir latencia.

## Capacidades

- Generación de texto conversacional multi-turno (pipeline `text-generation`, etiqueta `conversational`).
- Razonamiento con modo «thinking» activable y presupuesto configurable en tres niveles: none, low y high.
- Programación y tareas de ingeniería de software: el autor declara mejoras sustanciales en código respecto a Spark-X2.5-4B.
- Flujos agénticos: uso complejo de herramientas, planificación multi-paso y ejecución de tareas encadenadas.
- Soporte de tool calling / function calling: SGLang se sirve con `--tool-call-parser spark25`.
- Contexto largo: configuración de servidor documentada con hasta 1.048.576 tokens.
- Capacidades multilingües limitadas a inglés y chino según los metadatos del modelo.
- Compatibilidad con decodificación por parser de razonamiento `qwen3` en SGLang (separa el bloque de pensamiento de la respuesta final).
- No se declaran capacidades de visión, audio ni otras modalidades.

## Casos de uso

- Agentes en dispositivo para automatización de tareas: con 4,11B de parámetros y pesos de ~8,2 GB en bf16, el modelo puede ejecutarse en un portátil con GPU de 12-16 GB para orquestar llamadas a herramientas locales (sistema de ficheros, calendario, APIs internas) sin enviar datos a la nube.
- Asistente de código integrado en el IDE: el modelo declara mejoras específicas en código y admite tool calling, lo que permite construir un asistente que lea el repositorio, ejecute tests y proponga parches dentro de un flujo de varias etapas.
- Análisis de documentos extensos: con la ventana de hasta 1.048.576 tokens configurable en SGLang, es viable procesar contratos, expedientes o bases de código completas en una sola pasada, siempre que la memoria del dispositivo lo permita.
- Atención al cliente bilingüe inglés-chino: el soporte declarado de ambos idiomas cubre mercados con atención en chino simplificado y inglés, con conversaciones multi-turno.
- Enrutamiento y razonamiento con coste controlado: usando el nivel de pensamiento «none» para consultas simples y «high» para casos complejos, un mismo despliegue puede atender picos de tráfico con latencia baja y reservar el razonamiento profundo a las peticiones que lo necesiten.
- Despliegue en hardware no NVIDIA: la model card documenta imágenes SGLang para Ascend NPU (builds A2 y A3 con CANN 9.0.0), lo que permite integrar el modelo en infraestructura ascendente en lugar de GPU.
- Procesamiento por lotes de clasificación y extracción de datos: al ser un modelo denso de 4B con licencia Apache 2.0, resulta adecuado para tareas de extracción estructurada a gran escala en las que el coste por token es el factor limitante.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card incluye gráficos en formato SVG (`benchmark.svg`, `all_benchmark.svg`, `inference.svg`) con comparativas frente a modelos on-device de tamaño similar, pero las cifras no están accesibles en el texto proporcionado. Las afirmaciones cualitativas del autor son: mejor rendimiento de su clase entre modelos de tamaño comparable, igualación o superación de modelos de ~9B en varios benchmarks, y eficiencia de inferencia igual o mejor que Qwen3.5-4B y Gemma-E4B.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir de los 4,11B de parámetros, no confirmado por el autor): ~8,2 GB en bf16/fp16, ~16,4 GB en fp32, ~4,1 GB en cuantización de 8 bits y ~2,1 GB en 4 bits. A esto hay que sumar la caché KV, que crece linealmente con el contexto y resulta prohibitiva en ventanas de cientos de miles de tokens.
- GPU recomendadas: para bf16 con contexto moderado, una RTX 4090 (24 GB) o RTX 4080 (16 GB) es suficiente; para contextos muy largos o servicio concurrente se recomiendan A100 40/80 GB o H100.
- Cabe en GPU de consumo: sí. Con bf16 encaja en tarjetas de 12-16 GB (RTX 4070 Ti, RTX 4080, RTX 4060 Ti 16 GB); en tarjetas de 8 GB sería necesaria cuantización, y no se publican pesos cuantizados oficiales.
- Opciones de despliegue documentadas: `transformers==4.57.1` con `trust_remote_code=True` y `device_map="auto"`; SGLang mediante las imágenes `lmsysorg/sglang:nightly-dev-cu13-20260827-20621aa1` (NVIDIA) y `quay.io/ascend/sglang:main-cann9.0.0-a3` / `main-cann9.0.0-910b` (Ascend NPU). No se documentan instrucciones para vLLM, llama.cpp, Ollama ni TGI.
- Parámetros de servicio sugeridos en el ejemplo: `--tp-size 1`, `--mem-fraction-static 0.8`, `--tool-call-parser spark25`, `--reasoning-parser qwen3`, `--context-length 1048576`.
- Latencia y throughput: no disponibles. El autor solo muestra una comparativa gráfica de eficiencia frente a modelos similares, sin cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Rendimiento | Disponibilidad |
|---|---|---|---|---|---|
| Spark-X2.6-4B | 4,11B | Hasta 1.048.576 tokens en configuración SGLang (entrenamiento no especificado) | Apache 2.0 | Sin cifras publicadas; el autor lo sitúa por delante de modelos de su clase y a la par de algunos ~9B | Pesos safetensors en Hugging Face; 0 descargas, 15 likes en el momento de la consulta |
| Spark-X2.6-4B-Base | No disponible | No disponible | No disponible | No disponible | Modelo base en Hugging Face |
| Qwen3.5-4B | No disponible en la información proporcionada | No disponible | No disponible | Usado por el autor como referencia de eficiencia; sin cifras | No verificado en esta ficha |
| Gemma-E4B | No disponible en la información proporcionada | No disponible | No disponible | Usado por el autor como referencia de eficiencia; sin cifras | No verificado en esta ficha |

No se dispone de datos verificados de los modelos comparables más allá de su mención en la model card; las cifras de parámetros, contexto y licencia de Qwen3.5-4B y Gemma-E4B deberían contrastarse en sus propias f ichas antes de tomar una decisión.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al estar entrenado principalmente en inglés y chino, es esperable un sesgo cultural y lingüístico hacia esos dos entornos, pero el autor no publica ninguna evaluación al respecto.
- Riesgo de alucinación: no se publican evaluaciones de veracidad ni de calibración; el modo de razonamiento «high» no garantiza corrección factual.
- Idiomas: solo inglés y chino declarados. El rendimiento en castellano no está evaluado ni soportado oficialmente.
- Contexto: la cifra de 1.048.576 tokens corresponde a una configuración de servidor SGLang, no necesariamente a la longitud de entrenamiento; el autor advierte que hay que reducir `--context-length` si la memoria del dispositivo es insuficiente.
- Código personalizado: el modelo requiere `trust_remote_code=True` y `transformers==4.57.1`, lo que implica ejecutar código del autor y limita la portabilidad a vLLM, llama.cpp u otros runtimes sin soporte explícito.
- Disponibilidad de cuantizaciones: no hay GGUF ni pesos de 4/8 bits oficiales publicados, lo que complica el despliegue en hardware muy limitado sin trabajo adicional.
- Madurez y tracción: el repositorio registra 0 descargas y 15 likes; es un modelo reciente (creado el 19 de octubre de 2026) sin ecosistema consolidado ni informes independientes.
- Licencia: Apache 2.0 permite uso comercial sin restricciones adicionales declaradas, pero conviene revisar los términos del modelo base y de los datos de entrenamiento, no publicados.
- Ausencia de cifras de benchmarks verificables: cualquier comparación de rendimiento con la competencia debe considerarse no confirmada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/XHToken/Spark-X2.6-4B
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B-Base
- Slack: https://join.slack.com/t/tokenspark/shared_invite/zt-432qf8l2f-5~dLyXv8uETr0P0UuC07nw
- Discord: https://discord.gg/kTDE2Hg8aw
- YouTube: https://www.youtube.com/@SparkLLM
- dev.to: https://dev.to/sparkllm
- Bluesky: https://bsky.app/profile/sparkllm.bsky.social
- X: https://x.com/sparkllm
- Zhihu: https://www.zhihu.com/people/zhiikz7qh7m
- WeChat: referencia interna en la model card (`images/xhtoken-wechat.jpg`), sin URL pública

No se han encontrado papers, blogs técnicos ni demos adicionales en la búsqueda web realizada.
