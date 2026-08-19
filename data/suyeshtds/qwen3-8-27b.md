# suyeshtds/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje causal con codificador de visión desarrollado por el equipo de Qwen (Alibaba), presentado como la generación más capaz de la familia Qwen de modelos abiertos hasta la fecha. Se trata de un modelo denso de 27.000 millones de parámetros (27.781.427.952 en total) que integra comprensión nativa de imágenes y vídeo, control flexible de razonamiento y una ventana de contexto nativa de 262.144 tokens, extensible hasta 1.000.000 de tokens. Está diseñado para tareas de codificación, trabajo profesional, investigación y tareas agénticas de largo horizonte.

Construido sobre la base arquitectónica de Qwen3.5, el modelo combina atención lineal híbrida (Gated DeltaNet) con capas de atención clásica (Gated Attention), junto con entrenamiento multi-token (MTP). Los pesos se distribuyen bajo licencia Apache 2.0 en formato safetensors, con compatibilidad declarada con Hugging Face Transformers, vLLM, SGLang y TokenSpeed. La versión alojada en la nube de Qwen incluirá características de producción como contexto de 1M por defecto y herramientas integradas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje causal híbrido con codificador de visión (Gated DeltaNet + Gated Attention + FFN) |
| Parametros totales | 27.781.427.952 (27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativos, extensible hasta 1.000.000 tokens |
| Tipos de cuantizacion | No disponible (repositorio con pesos en safetensors; se esperan cuantizaciones GGUF de la comunidad) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (compatible con Transformers, vLLM, SGLang, TokenSpeed) |

## Arquitectura y entrenamiento

Qwen3.8-27B es un modelo de lenguaje causal con codificador de visión, con 64 capas y dimensión oculta de 5.120. Su layout interno se organiza en 16 bloques, cada uno con 3 subcapas de Gated DeltaNet seguidas de FFN y una subcapa de Gated Attention seguida de FFN. El Gated DeltaNet utiliza 48 cabezas de atención lineal para valores (V) y 16 para queries y keys (QK), con dimensión de cabeza de 128. La capa de Gated Attention usa 24 cabezas para Q y 4 para KV, con dimensión de cabeza de 256 y RoPE de dimensión 64. El FFN tiene dimensión intermedia de 17.408. El embedding y la salida LM están paddeados a 248.320 tokens.

El modelo fue entrenado en dos etapas: pre-entrenamiento y post-entrenamiento, e incluye entrenamiento multi-token (MTP) en varios pasos. No se han publicado en la información disponible datos sobre el volumen de tokens de entrenamiento ni la composición del dataset. El control de razonamiento es flexible: el modo de pensamiento está activado por defecto, se puede desactivar por petición, la profundidad del razonamiento se ajusta con el parámetro `reasoning_effort` y el contexto de razonamiento de mensajes históricos se conserva mediante `preserve_thinking`.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento configurable (thinking mode activado por defecto, desactivable por petición).
- Comprensión de imágenes y vídeo de forma nativa, incluyendo diagramas STEM, documentos y vídeos de hasta una hora de duración.
- Ejecución de tareas agénticas de largo horizonte con planificación autónoma y manejo de feedback del entorno.
- Soporte de tool calling y función calling (implicado por las capacidades agénticas y la compatibilidad con vLLM y SGLang).
- Razonamiento multi-paso y ejecución de tareas complejas de código, trabajo profesional e investigación.
- Control de la profundidad de razonamiento mediante `reasoning_effort` y conservación del contexto de razonamiento histórico con `preserve_thinking`.
- Compatibilidad con múltiples frameworks de inferencia (Transformers, vLLM, SGLang, TokenSpeed) y con hardware de AMD (Ryzen AI Max y Radeon).

## Casos de uso

- Desarrollo de código asistido en producción: el modelo puede generar, revisar y corregir código en repositorios reales, con contexto de 262K tokens que permite procesar proyectos completos sin truncamiento. Su soporte de tool calling permite integrarlo en pipelines de CI/CD para revisión automática de pull requests.

- Agentes autónomos de terminal: gracias a su rendimiento en Terminal Bench, puede operar entornos de terminal de forma autónoma, ejecutando comandos, interpretando salidas y adaptando su plan de acción en función del feedback del entorno.

- Resolución de tareas de ingeniería de software (SWE-bench): el modelo puede abordar issues reales de repositorios, localizar el código relevante, proponer parches y validarlos, lo que lo hace adecuado para automatización de mantenimiento de código.

- Análisis de documentos técnicos y diagramas STEM: al ser un modelo de visión-lenguaje, puede interpretar figuras, gráficas y diagramas científicos junto con el texto, útil en investigación y educación para resumir papers o extraer datos de figuras.

- Interacción con sistemas operativos (OSWorld): puede controlar interfaces gráficas y realizar tareas en el escritorio, útil para automatización de tareas de oficina y pruebas de software.

- Asistentes de investigación de largo alcance: su contexto nativo de 262K tokens permite procesar informes extensos, documentación técnica y bases de conocimiento amplias en una sola sesión, con razonamiento profundo configurable para tareas de análisis complejo.

- Despliegue local en equipos de gama alta: al ser un modelo denso de 27B con licencia Apache 2.0, es viable su ejecución en estaciones de trabajo con GPU de 24 GB o más, y AMD ha confirmado soporte para sus plataformas Ryzen AI Max y Radeon.

## Benchmarks y rendimiento

La model card del modelo incluye una tabla de rendimiento comparativa frente a Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, pero la información extraída solo contiene los encabezados de las categorías y la primera fila de datos, sin valores numéricos completos. Se ha podido identificar la fila "Agentic terminal coding" (Terminal Bench 2.1, Terminus) en la categoría de Coding, pero los valores de esa fila no están disponibles en la información extraída.

Según una guía publicada por Lovable App (tercero), el modelo obtiene los siguientes resultados en benchmarks agénticos: DeepSWE 42.2, Terminal Bench 73.0 y OSWorld 84.3. Estos datos provienen de una fuente secundaria y no de la model card oficial, por lo que deben tomarse con cautela. No se han publicado en la información disponible resultados de benchmarks clásicos como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 27.781 millones de parámetros en safetensors, con un tamaño de repo de 55,6 GB. Para inferencia en FP16 se estiman aproximadamente 56 GB de VRAM; con cuantización de 4 bits se reduciría a unos 14-16 GB, aunque no se han publicado cuantizaciones oficiales.
- GPU recomendadas: para inferencia en FP16 se requiere una GPU de 48-80 GB (A6000, A100 80 GB, H100). Con cuantización de la comunidad (GGUF) podría ejecutarse en una RTX 4090 (24 GB) o RTX 3090 (24 GB).
- AMD: soporte confirmado en plataformas AMD Ryzen AI Max (APU con NPU) y GPUs Radeon, según el blog oficial de AMD.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang y TokenSpeed son compatibles según la model card. También está disponible en plataformas de nube como Cloudflare Workers AI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Observaciones |
|---|---|---|---|---|---|
| Qwen3.8-27B | 27B denso | 262K (ext. 1M) | Vision-lenguaje híbrido | Apache 2.0 | Modelo de referencia de esta ficha |
| Qwen3.6-27B | 27B | No disponible | Vision-lenguaje | Apache 2.0 | Generación anterior de la familia Qwen a misma escala |
| Qwen3.7-Plus | No disponible | No disponible | No disponible | No disponible | Gama superior de la familia Qwen, comparado en la tabla de la model card |
| Muse Glimmer-30B | ~30B | No disponible | No disponible | No disponible | Competidor de escala similar, comparado en la model card |

La model card compara Qwen3.8-27B con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, pero no se dispone de los valores numéricos de esa comparativa en la información extraída. Los datos de rendimiento relativos no están disponibles.

## Limitaciones y advertencias

- Los datos de entrenamiento (composición del dataset, número de tokens, técnicas de alineación como RLHF o DPO) no están disponibles en la información pública, lo que limita la evaluación de sesgos y robustez.
- No se han publicado resultados de benchmarks clásicos de texto (MMLU, HumanEval, GSM8K) en la información disponible; los datos de benchmarks provienen de fuentes secundarias y deben validarse de forma independiente.
- El modelo es de 27B parámetros, por lo que en inferencia sin cuantizar requiere hardware de gama alta; en equipos de consumo se necesita cuantización GGUF/AWQ, que no se han publicado oficialmente.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar los términos de la política de uso de Qwen para aplicaciones de alto riesgo.
- No se han documentado sesgos específicos, pero como modelo de lenguaje generativo, presenta riesgo de alucinación, especialmente en tareas de razonamiento de largo plazo y con contexto ampliado.
- El contexto de 262K tokens es nativo, pero la extensión a 1M está prevista para la versión alojada en Qwen Cloud, no garantizada en el despliegue local.
- El repositorio de Hugging Face es un mirror no oficial (autor "suyeshtds"), aunque el modelo es de la familia Qwen; se recomienda verificar la autenticidad de los pesos antes de uso en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/suyeshtds/Qwen3.8-27B
- Modelo en LM Studio: https://lmstudio.ai/models/qwen3.8
- Guía completa de Qwen3.8-27B (fuente terciaria): https://lovableapp.org/blog/qwen3-8-27b
- Blog de AMD sobre ejecución en Ryzen AI Max y Radeon: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Documentación de Cloudflare Workers AI: https://developers.cloudflare.com/workers-ai/models/qwen3.8-27b/
- Seguimiento de lanzamiento y benchmarks: https://aireleasetracker.com/model/qwen/qwen3.8-27b
- Servicio en la nube de Qwen (Qwen Cloud): https://www.qwencloud.com/models/qwen3.8-27b
