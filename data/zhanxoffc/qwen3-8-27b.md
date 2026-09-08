# ZhanXoffc/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje causal con encoder de vision, desarrollado por Qwen y publicado en Hugging Face por el usuario ZhanXoffc. Se trata de un modelo denso de 27.781 millones de parametros (27,78B), con arquitectura hibrida que combina capas de atencion lineal Gated DeltaNet y capas de atencion gated. Ofrece una longitud de contexto nativa de 262.144 tokens, ampliable hasta 1.000.000, y capacidades nativas de vision-lenguaje para imagen y video.

El modelo esta orientado a tareas de codigo, trabajo profesional, investigacion y agentes de largo horizonte. Incluye control flexible de pensamiento, con modo de razonamiento activado por defecto, ajuste de profundidad mediante `reasoning_effort` y retencion del contexto de razonamiento historico mediante `preserve_thinking`. Es compatible con Transformers, vLLM, SGLang y TokenSpeed, y se distribuye bajo licencia Apache 2.0.

Su relevancia actual radica en combinar un tamano compacto y desplegable con capacidades avanzadas de vision, codigo y ejecucion agente, en un momento en que los modelos de 27B buscan equilibrar rendimiento y coste de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje causal con encoder de vision; hibrido con Gated DeltaNet y Gated Attention |
| Parametros totales | 27.781.427.952 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativo; ampliable a 1.000.000 tokens |
| Tipos de cuantizacion | No disponible (los pesos publicados estan en safetensors) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

La arquitectura del modelo combina capas de atencion lineal Gated DeltaNet con capas de atencion gated. El bloque oculto se repite 16 veces siguiendo el patron 3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN). La atencion gated utiliza 24 cabezas para Q y 4 para KV, con dimension de cabecera 256 y dimension de RoPE 64. La atencion lineal usa 48 cabezas para V y 16 para QK, con dimension de cabecera 128. La dimension oculta es 5120, la dimension intermedia de la FFN es 17.408 y el embedding de tokens y la salida LM tienen 248.320 entradas con padding.

El modelo fue entrenado en dos etapas: pre-entrenamiento y post-entrenamiento. Incluye prediccion multi-token (MTP) entrenada con multiples pasos. No se especifica la composicion del dataset, el numero de tokens de entrenamiento ni si se aplicaron tecnicas como RLHF o DPO en la informacion disponible. El encoder de vision permite procesar imagenes y videos de forma nativa, aunque no se detalla su arquitectura interna.

## Capacidades

- Comprension de imagen y video: soporte nativo para diagramas STEM, documentos y videos de hasta horas de duracion.
- Control flexible de pensamiento: modo de razonamiento activado por defecto, desactivable por peticion; ajuste de profundidad con `reasoning_effort`; retencion del contexto de razonamiento historico con `preserve_thinking`.
- Ejecucion agente: planificacion autonoma y manejo de feedback del entorno para tareas multi-paso de largo horizonte.
- Codigo y trabajo profesional: mejoras en coding, trabajo profesional e investigacion segun la model card.
- Compatibilidad aguas abajo: soporte amplio para harnesses y herramientas de desarrollo populares, como Transformers, vLLM, SGLang y TokenSpeed.
- Herramientas integradas: la version alojada en Qwen Cloud incluye herramientas oficiales; no se confirma soporte de tool calling en los pesos locales publicados.

## Casos de uso

- Analisis de documentos y diagramas STEM: el modelo puede procesar imagenes de diagramas, graficas y documentos, extrayendo informacion y respondiendo preguntas sobre su contenido. Adecuado por su encoder de vision y su ventana de contexto larga.
- Agentes de codigo en terminal: con capacidades de ejecucion agente y planificacion, puede integrarse en entornos de desarrollo para tareas de codificacion autonomas, como sugiere el benchmark Terminal Bench 2.1.
- Analisis de video de larga duracion: gracias al soporte nativo de video y al contexto ampliable a 1M tokens, puede resumir o consultar videos de horas de duracion.
- Asistente de investigacion con razonamiento: el modo de pensamiento activado por defecto y `reasoning_effort` permiten abordar preguntas complejas sobre documentos largos, con retencion del razonamiento historico.
- Automatizacion de tareas de largo horizonte: en flujos de trabajo agente, puede planificar multiples pasos, recibir feedback del entorno y completar tareas de principio a fin.
- Integracion en pipelines de desarrollo: compatible con vLLM, SGLang y TokenSpeed, puede desplegarse en servicios de inferencia para aplicaciones de vision-lenguaje y codigo en produccion.

## Benchmarks y rendimiento

La model card incluye una tabla de benchmarks con encabezados para "Coding" y "Agentic terminal coding" (Terminal Bench 2.1 / Terminus), comparando Qwen3.8-27B con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max. Sin embargo, los valores numericos no estan completos en la informacion proporcionada, por lo que no se pueden presentar resultados fiables. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Los pesos publicados en safetensors ocupan 55,6 GB, lo que corresponde a precision FP16/BF16.
- VRAM estimada para inferencia: FP16/BF16 requiere aproximadamente 55,6 GB para pesos mas cache KV y activaciones; con contexto largo supera 80 GB. Con cuantizacion int8 no oficial, los pesos ocuparian unos 28 GB; con int4 no oficial, unos 14 GB. No hay cuantizaciones publicadas en el repositorio.
- GPU recomendadas: A100 80GB, H100 80GB o configuraciones multi-GPU para FP16. Para cuantizaciones no oficiales, una RTX 4090 24GB podria servir en int4, pero no hay soporte oficial.
- Opciones de despliegue: Transformers, vLLM, SGLang y TokenSpeed; tambien Qwen Cloud como version alojada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La model card menciona como comparacion a Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, pero no se proporcionan especificaciones tecnicas de estos modelos en la informacion disponible.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.8-27B | 27,78B | 262.144 nativo / 1.000.000 ampliado | Apache 2.0 | Safetensors (repo no oficial) |
| Qwen3.6-27B | No disponible | No disponible | No disponible | No disponible |
| Qwen3.7-Plus | No disponible | No disponible | No disponible | No disponible |
| Muse Glimmer-30B | No disponible | No disponible | No disponible | No disponible |
| Opus4.6 Max | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Autenticidad no verificada: el repositorio esta publicado por el usuario ZhanXoffc, no por la organizacion Qwen. Los pesos pueden no ser oficiales; se recomienda verificar su integridad antes de usar en produccion.
- Sesgos conocidos: no disponible en la informacion proporcionada.
- Riesgo de alucinacion: no se han publicado evaluaciones de alucinacion; como en cualquier modelo de lenguaje, existe riesgo.
- Limitaciones de contexto o idioma: los idiomas soportados no estan especificados; el uso multilingue no esta confirmado.
- Restricciones de licencia para uso comercial: la licencia Apache 2.0 permite uso comercial, pero hay que revisar los terminos de la licencia y el origen de los pesos.
- Cuantizaciones: no se proporcionan cuantizaciones oficiales; el repositorio solo contiene safetensors de precision completa.
- Contexto largo: la ventana de 1M tokens se describe como ampliable, pero no se especifica el coste de memoria ni el rendimiento en esa configuracion.

## Enlaces

- Hugging Face (ZhanXoffc): https://huggingface.co/ZhanXoffc/Qwen3.8-27B
- Hugging Face (repositorio Qwen): https://huggingface.co/Qwen/Qwen3.8-27B
- Qwen Cloud (modelo): https://www.qwencloud.com/models/qwen3.8-27b
- Qwen Cloud (general): https://www.qwencloud.com
- No se han encontrado papers, blogs o demos adicionales en la busqueda web.
