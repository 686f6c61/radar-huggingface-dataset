# xannie1/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje causal con codificador de visión publicado en Hugging Face bajo el identificador `xannie1/Qwen3.8-27B`. Según la model card, forma parte de la familia de modelos abiertos Qwen3.8 y se presenta como la generación más capaz hasta la fecha, construida sobre la base arquitectónica de Qwen3.5. Se trata de un modelo denso (no MoE) de 27.781.427.952 parámetros reales según los pesos en safetensors, con 64 capas y una dimensión oculta de 5120, pensado para despliegue en infraestructura propia.

Su rasgo diferencial es la combinación de una arquitectura híbrida de atención —Gated DeltaNet (atención lineal) en tres de cada cuatro bloques y Gated Attention en el cuarto— con comprensión nativa de imagen y vídeo. El contexto nativo es de 262.144 tokens y la model card indica que es extensible hasta 1.000.000 de tokens. Incorpora además control flexible del modo de razonamiento (*thinking*), con parámetros como `reasoning_effort` y `preserve_thinking`.

Es relevante porque cubre un hueco habitual: un modelo multimodal de ~28B que puede ejecutarse en una sola GPU de 80 GB en BF16 y en GPU de consumo con cuantización de 4 bits, manteniendo contexto largo y capacidades agénticas. Ahora bien, el repositorio analizado es una copia de terceros (autor `xannie1`, 9 descargas y 0 *likes* en el momento de la consulta), no una publicación oficial de Qwen/Alibaba, y la información pública sobre él es muy limitada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido con vision encoder; layout 16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)) |
| Parámetros totales | 27.781.427.952 (dato real de safetensors) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.000.000 |
| Tipos de cuantización | no disponible oficialmente; el repo solo contiene safetensors (55,6 GB, compatible con BF16/FP16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Transformers); compatible con vLLM, SGLang y TokenSpeed según la model card |

Datos adicionales de configuración: dimensión oculta 5120; token embedding 248.320 (padded); 64 capas; FFN con dimensión intermedia 17.408; salida LM de 248.320 (padded). Gated DeltaNet: 48 cabezas de atención lineal para V y 16 para QK, dimensión de cabeza 128. Gated Attention: 24 cabezas para Q y 4 para KV, dimensión de cabeza 256, dimensión de RoPE 64.

## Arquitectura y entrenamiento

El modelo es un transformer causal con codificador de visión, entrenado en dos etapas (preentrenamiento y postentrenamiento) según la model card. La innovación estructural principal es el patrón de capas híbrido: por cada 16 bloques, 12 usan Gated DeltaNet —una capa de atención lineal recurrente con estado de tamaño constante respecto a la longitud de secuencia— y 4 usan Gated Attention clásica con RoPE. Este diseño busca reducir el coste de caché KV en contextos muy largos manteniendo la capacidad de recuperación precisa de la atención completa en una fracción de las capas. Añade Multi-Token Prediction (MTP) entrenado con múltiples pasos, lo que habilita decodificación especulativa nativa para acelerar la generación.

No se dispone de información sobre el número total de tokens de entrenamiento, la composición del dataset ni los métodos concretos de alineación (RLHF, DPO u otros) más allá de la mención genérica a una etapa de postentrenamiento. La model card sí describe mecanismos de control en inferencia: el modo *thinking* está activado por defecto y puede desactivarse por petición, la profundidad de razonamiento se ajusta con `reasoning_effort` y el contexto de razonamiento de mensajes anteriores se conserva mediante `preserve_thinking`.

## Capacidades

- Generación de texto y razonamiento con modo *thinking* activado por defecto y desactivable por petición.
- Codificación, con mejoras declaradas en tareas de código y *terminal coding* agéntico (benchmark Terminal Bench 2.1 con harness Terminus).
- Comprensión nativa de imagen y vídeo, incluyendo diagramas STEM, documentos y vídeos de hasta una hora de duración según la model card.
- Ejecución agéntica de horizonte largo: planificación autónoma y manejo de retroalimentación del entorno para completar tareas de extremo a extremo.
- Soporte de *tool calling* y de *harnesses* de desarrollo populares (la model card menciona compatibilidad con herramientas del ecosistema, sin detallar cuáles).
- Control de profundidad de razonamiento mediante `reasoning_effort` y retención de contexto de razonamiento con `preserve_thinking`.
- Capacidades multilingües: no disponible (la model card no enumera idiomas).
- Decodificación especulativa vía MTP.

## Casos de uso

- Automatización de atención al cliente multi-turno: con 262.144 tokens de contexto nativo puede mantener el historial completo de una conversación larga o de varias sesiones de un mismo usuario sin truncar, evitando pérdidas de información en traspasos entre agentes.
- Análisis de documentos extensos y técnicos: ingestión de informes, expedientes o manuales completos en una sola ventana para extracción de datos, resúmenes estructurados y control de cumplimiento normativo.
- Comprensión de vídeo de larga duración: al soportar vídeos de hasta una hora, permite indexar y consultar grabaciones de reuniones, clases o material de vigilancia buscando eventos concretos.
- Agentes de codificación autónomos: su rendimiento declarado en *terminal coding* agéntico y el soporte de *tool calling* lo hacen adecuado para integrarse en pipelines de CI/CD que ejecutan comandos, leen errores de compilación y aplican parches de forma iterativa.
- Asistencia técnica sobre diagramas e imágenes: interpretación de esquemas eléctricos, diagramas de arquitectura o capturas de paneles de monitorización para diagnosticar fallos, combinando visión y razonamiento paso a paso.
- Investigación asistida: revisión de literatura con documentos largos, contraste de hipótesis y generación de resúmenes críticos, con el modo *thinking* activado para tareas que requieren cadenas de razonamiento largas.
- Despliegue *on-premise* con datos sensibles: al tener licencia Apache 2.0 y pesos abiertos, puede ejecutarse en infraestructura propia en sectores con requisitos de soberanía del dato (sanidad, legal, administración pública).
- Extracción estructurada a escala: procesamiento por lotes de correos, facturas o tickets con salida en JSON gracias al soporte de *function calling*.

## Benchmarks y rendimiento

La model card incluye una tabla de resultados comparativa con los modelos Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, organizada por categorías (la primera visible es *Coding*). El único benchmark identificable en la información disponible es **Terminal Bench 2.1 (Terminus)**, dentro de *Agentic terminal coding*. Los valores numéricos de la tabla no están disponibles: el contenido proporcionado se trunca antes de mostrar las puntuaciones.

| Benchmark | Qwen3.8-27B | Qwen3.6-27B | Qwen3.7-Plus | Muse Glimmer-30B | Opus4.6 Max |
|---|---|---|---|---|---|
| Terminal Bench 2.1 (Terminus) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Resto de categorías de la tabla | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han publicado en la información disponible resultados numéricos de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del número de parámetros (27,78B) y no provienen de mediciones publicadas.

- Pesos en BF16/FP16: aproximadamente 55,6 GB (coincide con el tamaño del repositorio). Requiere una GPU de 80 GB (A100 80GB, H100 80GB, H200) o reparto en varias GPU.
- Pesos en FP8: aproximadamente 28 GB. Cabe en A100 40GB, L40S 48GB o A6000 48GB.
- Pesos en cuantización de 4 bits (AWQ, GPTQ o similar): aproximadamente 14-16 GB. Cabe en RTX 4090, RTX 3090, RTX 5090 y otras GPU de consumo con 24 GB o más.
- Caché KV: solo 16 de las 64 capas usan atención completa. Con 4 cabezas KV de dimensión 256 en BF16, la caché de esas capas ronda los 64 KB por token, es decir, unos 2 GB para 32K tokens y unos 16 GB para los 262.144 tokens nativos. Las capas Gated DeltaNet mantienen un estado de tamaño constante independiente de la longitud de secuencia.
- GPU recomendadas: H100 o A100 80GB para BF16 con contexto largo; L40S o A100 40GB para FP8; RTX 4090/5090 para cuantización de 4 bits con contexto moderado.
- Opciones de despliegue: según la model card, los artefactos son compatibles con Hugging Face Transformers, vLLM, SGLang y TokenSpeed. No se menciona soporte de llama.cpp, Ollama ni TGI, ni existen ficheros GGUF en el repositorio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B | 27,78B (denso) | 262.144 nativo, hasta 1.000.000 | Apache 2.0 | Pesos en safetensors (repo de terceros) | Multimodal (imagen y vídeo), híbrido lineal/atención completa |
| Qwen3.6-27B | 27B (según la model card) | no disponible | no disponible | no disponible en la información proporcionada | Generación anterior de la misma familia |
| Qwen3.7-Plus | no disponible | no disponible | no disponible | no disponible | Variante "Plus", presumiblemente orientada a servicios gestionados |
| Muse Glimmer-30B | 30B (por el nombre) | no disponible | no disponible | no disponible | Aparece como comparativa en la model card |
| Opus4.6 Max | no disponible | no disponible | Propietaria | Solo API | Modelo cerrado usado como referencia en la tabla de benchmarks |

No hay datos de rendimiento comparativo disponibles para ninguna de estas alternativas en la información proporcionada, por lo que la comparativa se limita a parámetros nominales y licencia.

## Limitaciones y advertencias

- El repositorio no es oficial: el autor es `xannie1`, no Qwen/Alibaba, y acumula 9 descargas y 0 *likes*. No hay garantía de que los pesos coincidan con una publicación oficial ni de que no hayan sido modificados.
- La etiqueta de configuración del repositorio es `qwen3_5` mientras que el nombre del modelo es Qwen3.8-27B; esta discrepancia no se explica en la información disponible.
- Los datos de benchmarks de la model card están truncados en la información disponible; no es posible verificar el rendimiento declarado ni reproducirlo con fuentes públicas.
- No se especifican los idiomas soportados, por lo que no puede asegurarse un rendimiento adecuado en castellano sin evaluación propia.
- Riesgo de alucinación: inherente a los modelos de lenguaje generativos; no se documentan tasas ni evaluaciones de fidelidad o veracidad.
- Sesgos: no se documenta ninguna evaluación de sesgos, toxicidad o equidad en la información disponible.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero al tratarse de un repositorio de terceros conviene verificar la procedencia de los pesos antes de usarlos en producción.
- Contexto muy largo: aunque se declaran 262.144 tokens nativos y hasta 1.000.000 extensibles, no se documentan resultados de evaluación en contextos largos (*needle in a haystack* u similares).
- Memoria: en BF16 el modelo exige una GPU de 80 GB o reparto multi-GPU; el contexto máximo añade aproximadamente 16 GB de caché KV solo en las capas de atención completa.
- La disponibilidad de MTP para decodificación especulativa depende del soporte del motor de inferencia; no se detalla qué versiones de vLLM o SGLang lo implementan.
- Ausencia de ficheros GGUF en el repositorio: el despliegue en llama.cpp u Ollama requeriría convertir los pesos por cuenta propia.
- Fecha de creación del repositorio: 2 de octubre de 2026 (según los metadatos de Hugging Face); conviene confirmar la vigencia de la información antes de decidir su adopción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xannie1/Qwen3.8-27B
- Página del modelo en Qwen Cloud (servicio gestionado, anunciado como "coming soon"): https://www.qwencloud.com/models/qwen3.8-27b
- Qwen Cloud (servicio de inferencia oficial): https://www.qwencloud.com

No se han encontrado otros enlaces relevantes (papers, blogs técnicos, repositorios de código ni demos) en la búsqueda web realizada.
