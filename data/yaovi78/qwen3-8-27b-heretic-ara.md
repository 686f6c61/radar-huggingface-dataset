# Yaovi78/Qwen3.8-27B-heretic-ara

## Resumen

Yaovi78/Qwen3.8-27B-heretic-ara es una variante «decensored» del modelo multimodal Qwen/Qwen3.8-27B, publicada por el usuario Yaovi78. Se ha generado con Heretic (un fork personalizado de timrohrbaugh) en su versión v1.2.0+custom aplicando el método Arbitrary-Rank Ablation (ARA), una técnica de ablación de direcciones en el espacio de activaciones que reduce de forma drástica la tendencia del modelo a rechazar peticiones sin reentrenar los pesos.

El modelo base es un transformer causal denso de 27.356.728.560 parámetros (27,36 B) con codificador de visión, 64 capas, dimensión oculta 5120 y una longitud de contexto nativa de 262.144 tokens ampliable hasta 1.000.000. Su arquitectura es híbrida: combina capas de atención lineal Gated DeltaNet con capas de Gated Attention en un patrón repetido de 16 bloques, e incorpora Multi-Token Prediction (MTP) entrenado con varios pasos.

Resulta relevante para quien necesite un modelo visión-lenguaje de ~27 B sin capas de rechazo y con licencia Apache 2.0, desplegable en infraestructura propia con Transformers, vLLM, SGLang o TokenSpeed. El coste de la ablación es medible y está documentado por el autor: la divergencia KL frente al modelo original es de 0,0535 y los rechazos pasan de 99/100 a 0/100. El repositorio acumulaba 0 descargas y 0 likes en el momento de redactar esta ficha, con un tamaño de 55,6 GB.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso con codificador de visión; híbrida Gated DeltaNet (atención lineal) + Gated Attention. Patrón 16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)); 64 capas; dimensión oculta 5120; FFN con dimensión intermedia 17.408 |
| Parametros totales | 27.356.728.560 (27,36 B) |
| Parametros activos | No aplica: modelo denso, no MoE |
| Longitud de contexto | 262.144 tokens nativos, extensible hasta 1.000.000 |
| Tipos de cuantizacion | No disponible. El repositorio publica únicamente safetensors (55,6 GB, coherente con pesos en bf16/fp16) |
| Idiomas soportados | No disponible en la información proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (formato Hugging Face Transformers) |
| Pipeline declarado | image-text-to-text |
| Embedding de tokens | 248.320 (padded) |
| Cabezas de atención | Gated DeltaNet: 48 cabezas lineales para V y 16 para QK, dimensión 128. Gated Attention: 24 cabezas para Q, 4 para KV, dimensión 256, RoPE de dimensión 64 |
| Multi-Token Prediction | Sí, entrenado con múltiples pasos |
| Fecha de creación (metadatos) | 2026-09-30T23:17:48Z |

## Arquitectura y entrenamiento

La arquitectura parte de la base del Qwen3.5 y la evoluciona en la serie Qwen3.8. El bloque se repite 16 veces y cada repetición contiene tres capas de Gated DeltaNet (atención lineal con estado recurrente, 48 cabezas para V y 16 para QK con dimensión 128) seguidas de una capa de Gated Attention clásica (24 cabezas Q, 4 cabezas KV, dimensión 256, RoPE de 64 dimensiones). Esta mezcla reduce el coste del caché KV en la mayor parte de las capas, pero mantiene atención completa cada cuatro capas. El modelo incluye un codificador de visión para entrada de imágenes y vídeo, y una cabeza de Multi-Token Prediction entrenada con varios pasos, habitual en decodificación especulativa y en el entrenamiento con mayor densidad de señal por token.

El autor no documenta la composición del dataset de preentrenamiento ni de postentrenamiento, ni el número de tokens utilizados: esa información no está disponible en la ficha. Lo que sí se documenta es el proceso de modificación posterior: se aplicó Heretic v1.2.0+custom con el método Arbitrary-Rank Ablation (ARA), con ablación restringida a las capas 26 a 56 (`start_layer_index` 26, `end_layer_index` 56), `preserve_good_behavior_weight` 0,9432, `steer_bad_behavior_weight` 0,0009, `overcorrect_relative_weight` 0,5038 y `neighbor_count` 10. No se ha reentrenado el modelo; el cambio es una intervención sobre las activaciones.

## Capacidades

- Generación de texto y razonamiento multi-paso, con modo de pensamiento activado por defecto y desactivable por petición.
- Control de profundidad de razonamiento mediante el parámetro `reasoning_effort` y retención del contexto de razonamiento de mensajes históricos mediante `preserve_thinking`.
- Comprensión de imágenes y vídeo de forma nativa, incluyendo diagramas STEM, documentos y vídeos de hasta una hora según la model card del modelo base.
- Generación de código con soporte declarado para arneses de desarrollo y herramientas populares (downstream compatibility).
- Ejecución de tareas agénticas de horizonte largo: planificación autónoma y manejo de retroalimentación del entorno.
- Conversación multi-turno (etiqueta `conversational`).
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- Soporte de tool calling / function calling: la model card menciona herramientas oficiales integradas en la versión alojada de Qwen Cloud, pero no detalla el esquema de function calling del modelo abierto.
- Ausencia de rechazos: 0/100 en la evaluación de rechazos del autor, frente a 99/100 del modelo original.

## Casos de uso

- Agentes autónomos de larga duración: con 262.144 tokens de contexto nativo y planificación autónoma documentada, el modelo puede mantener el estado de una tarea de varios pasos (navegación, ejecución de herramientas, corrección de errores) sin perder el hilo.
- Análisis de documentación técnica extensa: ingerir manuales, normativa o repositorios completos en una sola ventana de contexto y responder preguntas cruzadas entre documentos citados.
- Procesamiento de vídeo e imagen en pipelines de inspección: interpretar diagramas, capturas de pantalla o grabaciones de hasta una hora, útil en soporte técnico, mantenimiento industrial o revisión de material audiovisual.
- Atención al cliente sin filtros de plantilla: el modelo no rechaza peticiones legítimas incómodas (temas sensibles, consultas médicas o legales), lo que evita respuestas evasivas en producción.
- Investigación sobre alineación y seguridad: el par de métricas publicado (KL 0,0535 y 0/100 rechazos) lo convierte en un caso de estudio reproducible para medir el impacto de la ablación de direcciones frente al modelo original.
- Redacción asistida y generación de contenido con temática adulta o controvertida: escenario para el que la ablación está diseñada explícitamente.
- Despliegue en infraestructura propia con licencia Apache 2.0: al no depender de una API, encaja en entornos con requisitos de soberanía de datos, siempre que se asuman las advertencias de la sección de limitaciones.
- Extracción estructurada multimodal: combinar OCR implícito, comprensión de tablas y salida en JSON dentro de una única llamada, con contexto suficiente para lotes grandes de documentos.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card del modelo base incluye una tabla comparativa con columnas para Qwen3.8-27B, Qwen3.6-27B y Qwen3.7-Plus, pero los valores quedaron truncados en la extracción y no se pueden reproducir aquí.

Las únicas métricas completas son las de la intervención de ablación:

| Metrica | Este modelo | Modelo original (Qwen/Qwen3.8-27B) |
|---|---|---|
| Divergencia KL | 0,0535 | 0 (por definición) |
| Rechazos | 0/100 | 99/100 |

## Requisitos de hardware

- VRAM para pesos en bf16/fp16: aproximadamente 54,7 GB solo para pesos (derivado de 27,36 B × 2 bytes). El repositorio ocupa 55,6 GB.
- VRAM para pesos en int8: aproximadamente 27 GB (estimación por recuento de parámetros; no hay cuantizaciones publicadas en el repositorio).
- VRAM para pesos en 4 bits: aproximadamente 14-16 GB (estimación; requiere una conversión GGUF/AWQ/GPTQ que el autor no publica).
- GPUs recomendadas: H100 80 GB o A100 80 GB para bf16 con contexto moderado. Para bf16 con contexto muy largo hacen falta varios aceleradores (tensor paralelo).
- Consumer GPU: no cabe en bf16 en una RTX 4090 de 24 GB. Con cuantización de 4 bits sí sería viable en RTX 4090, RTX 5090 o similares de 24 GB o más, siempre que se genere o se encuentre una conversión.
- Caché KV: estimación a partir de la configuración (4 cabezas KV × 256 de dimensión en 16 capas de atención completa) de unos 64 KiB por token en bf16, lo que supone alrededor de 16 GiB para los 262.144 tokens completos. Las capas Gated DeltaNet mantienen estado recurrente en lugar de caché, lo que reduce el coste frente a un transformer denso equivalente.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang y TokenSpeed, mencionados explícitamente en la model card del modelo base. No se confirma compatibilidad con llama.cpp u Ollama al no haber pesos GGUF publicados.
- Latencia y throughput: no disponibles.
- Codificador de visión: añade consumo de VRAM adicional proporcional a la resolución y al número de fotogramas procesados, no cuantificado en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Estado |
|---|---|---|---|---|---|
| Yaovi78/Qwen3.8-27B-heretic-ara | 27,36 B densos | 262.144 (hasta 1.000.000) | Texto, imagen y vídeo | Apache 2.0 | Publicado; 0 descargas, 0 likes |
| Qwen/Qwen3.8-27B (base) | 27 B densos | 262.144 (hasta 1.000.000) | Texto, imagen y vídeo | Apache 2.0 | Modelo de referencia; 99/100 rechazos |
| Qwen3.6-27B | No disponible | No disponible | No disponible | No disponible | Citado como columna de comparación, sin datos |
| Qwen3.7-Plus | No disponible | No disponible | No disponible | No disponible | Citado como columna de comparación, sin datos |

La comparación directa con el modelo original es la más informativa: mismos parámetros, misma arquitectura y misma licencia, con una divergencia KL de 0,0535 y la eliminación de los rechazos como única diferencia documentada.

## Limitaciones y advertencias

- La ablación introduce una degradación medible: divergencia KL de 0,0535 respecto al modelo original. No es cero y puede manifestarse como pérdida de coherencia en tareas largas o especializadas.
- Los rechazos se han eliminado por completo (0/100). Esto implica que el modelo puede generar contenido dañino, ilegal o inseguro sin ninguna barrera, y que el filtrado debe implementarse externamente si el despliegue es público.
- No hay benchmarks de terceros ni validación independiente. El repositorio tiene 0 descargas y 0 likes, por lo que no existe evidencia de la comunidad sobre su comportamiento real.
- Sesgos conocidos: no disponibles. El autor no documenta ninguna evaluación de sesgo del modelo base ni del modelo ablacionado.
- Riesgo de alucinación: no cuantificado. La model card no aporta tasas de alucinación ni evaluaciones de fidelidad.
- Idiomas soportados: no disponibles. El modelo base es multilingüe, pero no se especifica qué idiomas ni con qué calidad, y la ablación puede afectar de forma desigual a idiomas con menos representación.
- La licencia Apache 2.0 permite uso comercial, pero el usuario asume toda la responsabilidad legal sobre el contenido generado; la licencia no transfiere ninguna garantía ni exención por daños.
- La información de fecha de creación del repositorio en los metadatos es 2026-09-30, y la disponibilidad del propio modelo base Qwen/Qwen3.8-27B es un dato que conviene verificar antes de planificar un despliegue.
- Algunas capacidades citadas (herramientas oficiales integradas, contexto de 1 M por defecto) se anuncian como características de la versión alojada en Qwen Cloud, no necesariamente del modelo abierto en local.
- El estado del arte en descarga y adopción es nulo: no hay issues, discusiones ni conversiones GGUF conocidas que permitan contrastar los pesos publicados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Yaovi78/Qwen3.8-27B-heretic-ara
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Heretic (repositorio original): https://github.com/p-e-w/heretic
- Fork personalizado de Heretic usado por el autor: https://github.com/timrohrbaugh/heretic
- Pull request del método Arbitrary-Rank Ablation (ARA): https://github.com/p-e-w/heretic/pull/211
- Página del modelo base en Qwen Cloud: https://www.qwencloud.com/models/qwen3.8-27b
- Servicio alojado Qwen Cloud: https://www.qwencloud.com
- Búsqueda web: no se han encontrado enlaces relevantes a este modelo. Los resultados devueltos corresponden a contenidos de danza y coreografía, sin relación con el modelo.
