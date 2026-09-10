# Terom/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje causal con codificador de visión, publicado en Hugging Face bajo el identificador `Terom/Qwen3.8-27B`. La model card lo presenta como la generación más capaz de la familia abierta Qwen hasta la fecha y como una variante densa, orientada a despliegue, de 27.000 millones de parámetros que entiende imágenes y vídeo de forma nativa. Se distribuye en formato Transformers (safetensors) con licencia Apache 2.0 y pesos que suman 27.781.427.952 parámetros (unos 55,6 GB en el repositorio).

La arquitectura combina atención lineal mediante Gated DeltaNet y atención completa mediante Gated Attention en un patrón repetido de 16 bloques, con 64 capas en total, dimensión oculta de 5120 y un vocabulario de 248.320 entradas. Incorpora entrenamiento con Multi-Token Prediction (MTP) y una ventana de contexto nativa de 262.144 tokens, extensible hasta 1.000.000. El modelo añade control flexible del razonamiento: el modo thinking está activado por defecto y puede desactivarse por petición, ajustarse con `reasoning_effort` y conservarse entre mensajes con `preserve_thinking`.

Es relevante para equipos que necesitan un modelo denso de tamaño medio, con capacidades de visión y contexto muy largo, que quepa en infraestructura razonable y se integre en herramientas agénticas y de desarrollo ya existentes. Conviene señalar que el repositorio analizado tiene 0 descargas y 0 me gusta, fue creado y actualizado con un segundo de diferencia y está subido por un tercero (`Terom`), no por el equipo de Qwen, por lo que debe tratarse como una redistribución no verificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con codificador de visión; híbrido de Gated DeltaNet (atención lineal) y Gated Attention (atención completa) |
| Parametros totales | 27.781.427.952 (≈27,78 B) según safetensors |
| Parametros activos | No aplica: modelo denso, no MoE |
| Longitud de contexto | 262.144 tokens de forma nativa; extensible hasta 1.000.000 |
| Tipos de cuantizacion | No disponible en la información proporcionada |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (repositorio de 55,6 GB, compatible con BF16 para 27,78 B de parámetros) |
| Dimensión oculta | 5120 |
| Número de capas | 64, distribuidas como 16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)) |
| Vocabulario | 248.320 tokens (con padding), entrada y salida |
| Atención lineal (Gated DeltaNet) | 48 cabezas para V y 16 para QK, dimensión de cabeza 128 |
| Atención completa (Gated Attention) | 24 cabezas para Q y 4 para KV, dimensión de cabeza 256, RoPE de dimensión 64 |
| FFN | Dimensión intermedia 17.408 |
| Multi-Token Prediction | Sí, entrenado con múltiples pasos |
| Pipeline declarado | image-text-to-text |
| Biblioteca | transformers |

## Arquitectura y entrenamiento

El modelo es un transformer causal con codificador de visión integrado, entrenado en dos fases (pre-entrenamiento y post-entrenamiento). Su rasgo arquitectónico principal es la disposición híbrida de capas: por cada bloque de cuatro capas, tres usan Gated DeltaNet como mecanismo de atención lineal y una usa Gated Attention completa. La atención lineal emplea 48 cabezas para los valores y 16 para consultas y claves, con dimensión de cabeza 128; la atención completa usa 24 cabezas de consulta y 4 de clave/valor, con dimensión de cabeza 256 y RoPE de dimensión 64. Esta proporción de 3:1 implica que solo 16 de las 64 capas mantienen un KV cache que crece con la longitud de secuencia, lo que reduce de forma notable el coste de memoria en contextos largos.

El entrenamiento incorpora Multi-Token Prediction con varios pasos, técnica que suele aprovecharse para decodificación especulativa y para acelerar la generación. La model card menciona explícitamente mejoras en codificación, trabajo profesional, investigación y tareas agénticas de horizonte largo, así como un mejor manejo de la realimentación del entorno. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron RLHF, DPO u otras técnicas de alineación concretas. El post-entrenamiento sí incorpora control de razonamiento configurable (`reasoning_effort`, `preserve_thinking`) y modo thinking activado por defecto.

## Capacidades

- Generación de texto y razonamiento con modo thinking configurable: activado por defecto, desactivable por petición y ajustable en profundidad mediante `reasoning_effort`.
- Retención de contexto de razonamiento entre mensajes de una conversación mediante `preserve_thinking`.
- Codificación: la model card destaca mejoras en tareas de programación, incluida la codificación agéntica en terminal (benchmark Terminal Bench 2.1, variante Terminus).
- Ejecución agéntica: planificación autónoma y manejo de realimentación del entorno para completar tareas multi-paso de extremo a extremo.
- Comprensión de imagen y vídeo de forma nativa: diagramas STEM, documentos y vídeos de hasta una hora de duración.
- Soporte de tool calling y function calling: la disponibilidad de herramientas integradas se menciona para la versión alojada en Qwen Cloud.
- Compatibilidad con arneses y herramientas de desarrollo populares, según la model card.
- Capacidades multilingües: no disponible (los metadatos no declaran idiomas).
- Contexto largo: 262.144 tokens nativos y hasta 1.000.000 mediante extensión.

## Casos de uso

- Agente de codificación en terminal: el modelo puede operar sobre un repositorio, ejecutar comandos, leer la salida y corregir errores en varios pasos, integrándose en pipelines de CI/CD como revisor o reparador automático de fallos de test.
- Análisis de documentación técnica con visión: a partir de diagramas de arquitectura, esquemas eléctricos o figuras de artículos científicos, el modelo puede extraer componentes, relaciones y valores numéricos y devolverlos en formato estructurado.
- Comprensión de vídeo de larga duración: con soporte para vídeos de escala horaria, es adecuado para resumen de reuniones, revisión de grabaciones de clases o auditoría de material audiovisual, generando actas con marcas temporales.
- Atención al cliente multi-turno: la ventana de 262.144 tokens permite mantener el historial completo de una conversación extensa, junto con documentación de producto y registros de incidencias, sin truncar contexto.
- Asistente de investigación y revisión bibliográfica: puede procesar lotes de artículos con figuras, comparar metodologías y generar resúmenes críticos, ajustando la profundidad de razonamiento con `reasoning_effort` según la complejidad de cada consulta.
- Extracción de datos estructurados de documentos escaneados: combinando visión y tool calling, el modelo puede leer facturas, formularios o tablas y emitir JSON validado contra un esquema para alimentar sistemas de gestión.
- RAG sobre bases de código o corpus normativos extensos: el contexto nativo de 262.144 tokens permite insertar múltiples ficheros o capítulos completos y razonar sobre referencias cruzadas sin recurrir a recuperación fragmentada.
- Automatización de flujos multi-paso con herramientas externas: al soportar tool calling y planificación autónoma, puede encadenar consultas a API, hojas de cálculo y servicios internos para completar procesos administrativos.

## Benchmarks y rendimiento

La model card incluye una tabla de resultados comparativa, pero el contenido recuperado está truncado: solo se conservan los encabezados y la primera fila (Agentic terminal coding, Terminal Bench 2.1 en su variante Terminus), sin los valores numéricos. Por tanto, no es posible reproducir cifras concretas y no se han inventado.

Modelos incluidos en la tabla de comparación de la model card (valores no disponibles en la información recuperada):

| Modelo | Categoría de comparación | Resultado |
|---|---|---|
| Qwen3.8-27B | Modelo evaluado | No disponible (tabla truncada) |
| Qwen3.6-27B | Generación anterior de la misma familia y tamaño | No disponible |
| Qwen3.7-Plus | Variante Plus de la familia | No disponible |
| Muse Glimmer-30B | Modelo de tamaño comparable | No disponible |
| Opus4.6 Max | Referencia propietaria de gama alta | No disponible |

Categoría de evaluación documentada en la tabla: codificación agéntica en terminal (Terminal Bench 2.1, Terminus). El resto de categorías y benchmarks no se han podido recuperar.

## Requisitos de hardware

- VRAM en BF16/FP16: 27,78 B de parámetros × 2 bytes ≈ 55,6 GB solo en pesos, más caché KV y activaciones; en la práctica requiere GPUs de 80 GB (A100 80 GB, H100 80 GB, H200) o reparto en varias GPUs.
- VRAM en FP8/INT8: aproximadamente 28 GB para los pesos, lo que permite ejecución en A100 40 GB, L40S 48 GB o dos RTX 4090 de 24 GB con tensor parallelism.
- VRAM en cuantización de 4 bits: del orden de 14-16 GB para los pesos, por lo que cabe en una RTX 4090 de 24 GB, RTX 5090 de 32 GB o L4 de 24 GB, con margen limitado para contexto largo.
- Caché KV: solo 16 de las 64 capas usan atención completa, lo que reduce el crecimiento de la caché KV frente a un transformer denso convencional de tamaño similar; aun así, usar los 262.144 tokens nativos exige planificar memoria adicional o recurrir a cuantización de la caché.
- GPU recomendadas: H100 o A100 80 GB para BF16 con contexto largo; L40S o A100 40 GB en FP8; RTX 4090, RTX 5090 o L4 para cuantización de 4 bits.
- Cabe en GPU de consumo: sí, en cuantización de 4 bits en GPUs de 24 GB o superiores; no en BF16 con una sola GPU de consumo.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang y TokenSpeed, según la model card. No se menciona soporte explícito de llama.cpp, Ollama, TGI ni formatos GGUF.
- Alternativa gestionada: Qwen Cloud ofrece un servicio alojado de Qwen3.8-27B con 1M de contexto por defecto y herramientas integradas, anunciado como próximo.
- Latencia y throughput: no disponible. El uso de Multi-Token Prediction entrenado con varios pasos es un indicio de que el modelo está preparado para decodificación especulativa, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| Qwen3.8-27B (este repositorio) | 27,78 B densos | 262.144 nativos, hasta 1.000.000 | Apache 2.0 | Pesos en Hugging Face (repo de tercero, 0 descargas) | No disponible |
| Qwen3.6-27B | No disponible | No disponible | No disponible | No disponible | No disponible (citado como referencia en la model card) |
| Qwen3.7-Plus | No disponible | No disponible | No disponible | No disponible | No disponible (citado como referencia en la model card) |
| Muse Glimmer-30B | No disponible (30 B por denominación) | No disponible | No disponible | No disponible | No disponible (citado como referencia en la model card) |
| Opus4.6 Max | No disponible | No disponible | Propietaria | Solo API | No disponible (citado como referencia en la model card) |

La información recuperada no permite comparar parámetros, contexto, rendimiento ni licencia de las alternativas, salvo la coincidencia de nombre y tamaño en Muse Glimmer-30B. No se dispone de datos adicionales sobre modelos comparables de otros fabricantes.

## Limitaciones y advertencias

- Repositorio no oficial: los pesos están publicados por el usuario `Terom`, no por el equipo de Qwen. No hay verificación de integridad ni de correspondencia con los pesos originales.
- Señales de publicación automatizada: el repositorio se creó y actualizó con un segundo de diferencia (2026-09-10T08:54:39 y 08:54:40), tiene 0 descargas y 0 me gusta, y la etiqueta declarada es `qwen3_5` mientras el nombre indica Qwen3.8, lo que apunta a una inconsistencia de metadatos.
- Idiomas no declarados: no hay información sobre cobertura multilingüe ni sobre el rendimiento en castellano. Debe validarse antes de usarlo en producción en español.
- Sesgos: no se documenta composición del dataset, filtrado ni evaluación de sesgos. No hay información disponible al respecto.
- Alucinación: no se publican tasas de alucinación ni evaluaciones de fidelidad. En tareas agénticas con tool calling, los errores de planificación pueden propagarse a acciones reales sobre sistemas.
- Modo thinking activado por defecto: incrementa el consumo de tokens y la latencia; para cargas de alto volumen conviene desactivarlo o reducir `reasoning_effort`.
- Contexto extendido: los 1.000.000 de tokens se anuncian como extensión, no como capacidad nativa. La degradación de calidad más allá de 262.144 tokens no está documentada.
- Benchmarks incompletos: la tabla de resultados de la model card está truncada en la información recuperada, por lo que no se pueden verificar las afirmaciones de mejora frente a generaciones anteriores.
- Cuantización: no se especifican tipos soportados ni se publican pesos cuantizados oficiales; los cálculos de VRAM de esta ficha son estimaciones derivadas del número de parámetros.
- Vídeo de larga duración: procesar vídeos de escala horaria implica un coste elevado de preprocesado y de tokens de entrada por consulta.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero al tratarse de una redistribución de un tercero conviene verificar la procedencia y los términos aplicables a los pesos originales antes de desplegarlo en producción.
- Disponibilidad del servicio gestionado: Qwen Cloud aparece anunciado como "próximamente", sin fecha confirmada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Terom/Qwen3.8-27B
- Página de Qwen Cloud: https://www.qwencloud.com
- Ficha de Qwen3.8-27B en Qwen Cloud: https://www.qwencloud.com/models/qwen3.8-27b
- Resultados de la búsqueda web: no se ha recuperado ningún enlace relevante al modelo; los resultados devueltos corresponden a páginas comerciales de Amazon y no guardan relación con la ficha.
