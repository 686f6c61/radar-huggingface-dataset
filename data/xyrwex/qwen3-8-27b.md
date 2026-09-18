# Xyrwex/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje causal con codificador de visión que la model card presenta como parte de la familia Qwen3.8, la generación más reciente de la serie de modelos abiertos de Qwen. Los pesos se distribuyen en el repositorio de HuggingFace `Xyrwex/Qwen3.8-27B` bajo licencia Apache 2.0, con 27.781.427.952 parámetros reales (~27,8B) y un tamaño de repositorio de 55,6 GB. Se trata de la variante densa y orientada a despliegue de la generación, pensada para integrarse en stacks existentes sin la complejidad de un MoE.

El modelo combina una arquitectura híbrida de atención —capas de Gated DeltaNet (atención lineal) intercaladas con capas de Gated Attention (atención completa)— con comprensión nativa de imágenes y vídeo, incluidos vídeos de hasta una hora de duración. Su contexto nativo es de 262.144 tokens, ampliable hasta 1.000.000, y añade control flexible del razonamiento: el modo *thinking* está activado por defecto, puede desactivarse por petición, la profundidad se ajusta con `reasoning_effort` y el contexto de razonamiento histórico se conserva mediante `preserve_thinking`.

La relevancia del lanzamiento se centra en tres ejes: mejoras en coding, trabajo profesional e investigación; ejecución agéntica con planificación autónoma y mejor manejo del *feedback* del entorno; y compatibilidad más amplia con *harnesses* y herramientas de desarrollo habituales. Existe además una versión alojada prevista en Qwen Cloud, con 1M de contexto por defecto y herramientas oficiales integradas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con codificador de visión; híbrida: capas Gated DeltaNet (atención lineal) y capas Gated Attention (atención completa) |
| Parametros totales | 27.781.427.952 (~27,8B) |
| Parametros activos | No aplicable: modelo denso, no es MoE |
| Longitud de contexto | 262.144 tokens nativo; ampliable hasta 1.000.000 |
| Tipos de cuantizacion | No disponible: el repositorio publica pesos en safetensors y el autor no documenta GGUF, AWQ, GPTQ ni otras variantes |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato Hugging Face Transformers) |
| Dimension oculta | 5.120 |
| Numero de capas | 64 (layout: 16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN))) |
| Cabezas de atencion | Gated DeltaNet: 48 cabezas lineales para V y 16 para QK, dimension 128. Gated Attention: 24 cabezas para Q y 4 para KV, dimension 256, RoPE de 64 |
| FFN | Dimension intermedia de 17.408 |
| Vocabulario | 248.320 tokens (con padding) |
| Multi-Token Prediction | Entrenado con múltiples pasos (MTP) |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal con codificador de visión orientado a la comprensión conjunta de imagen, vídeo y texto. El bloque se repite 16 veces con un patrón fijo: tres subcapas de Gated DeltaNet seguidas de una subcapa de Gated Attention, cada una acompañada de su red *feed-forward*. Las capas de Gated DeltaNet emplean atención lineal con 48 cabezas para el valor y 16 para query/key con dimensión 128, mientras que las capas de atención completa usan 24 cabezas de query y solo 4 de key/value con dimensión 256, lo que reduce notablemente el coste del caché KV. El modelo incorpora Multi-Token Prediction entrenado con múltiples pasos, aprovechable para decodificación especulativa. El tamaño de vocabulario, 248.320 entradas con padding, es notablemente grande, coherente con un modelo multimodal.

El modelo ha pasado por fases de preentrenamiento y postentrenamiento, según indica la model card, pero no se especifica el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas concretas de alineación como RLHF o DPO: esa información no está disponible. Tampoco se detalla la arquitectura del codificador de visión ni la resolución o el *frame rate* con el que procesa imágenes y vídeo. La innovación técnica más destacable es la combinación de atención lineal Gated DeltaNet con atención completa, junto con el control flexible del razonamiento por petición.

## Capacidades

- Generación de texto y razonamiento con modo *thinking* activado por defecto, desactivable por petición, y profundidad de razonamiento ajustable mediante `reasoning_effort`.
- Retención del contexto de razonamiento de mensajes históricos mediante `preserve_thinking`.
- Coding y tareas de terminal agénticas: la model card reporta evaluaciones específicas de *Agentic terminal coding* (Terminal Bench 2.1, variante Terminus).
- Trabajo profesional e investigación: la documentación menciona mejoras en estos dominios, sin detallar benchmarks concretos en el extracto disponible.
- Ejecución agéntica de horizonte largo: planificación autónoma y manejo del *feedback* del entorno para completar tareas de extremo a extremo.
- Comprensión de imagen y vídeo nativa: diagramas STEM, documentos y vídeos de escala horaria.
- Multi-Token Prediction (MTP) entrenado con múltiples pasos, útil como base para decodificación especulativa.
- Compatibilidad declarada con Hugging Face Transformers, vLLM, SGLang y TokenSpeed.
- Soporte de *tool calling* / *function calling*: no confirmado explícitamente en el extracto de la model card disponible; la mención a "herramientas oficiales integradas" se refiere a la versión alojada en Qwen Cloud, no a los pesos locales.

## Casos de uso

- Atención al cliente automatizada: con 262.144 tokens de contexto nativo, el modelo puede mantener conversaciones multi-turno sobre historiales extensos y documentos adjuntos sin truncar, manteniendo coherencia entre turnos.
- Agentes de codificación en terminal: la evaluación Terminal Bench 2.1 (Terminus) apunta a uso directo en *harnesses* agénticos que ejecutan comandos, leen la salida y corrigen errores de forma iterativa en pipelines de CI/CD.
- Análisis de documentación técnica y diagramas: al ser un modelo de imagen-a-texto, puede extraer información de diagramas de arquitectura, esquemas eléctricos, figuras de artículos científicos y capturas de interfaces.
- Revisión de vídeo de larga duración: la comprensión de vídeos de escala horaria permite resumir reuniones, generar actas con marcas temporales o auditar grabaciones de procesos industriales.
- Asistente de investigación: lectura de artículos y extracción de resultados, con razonamiento encadenado activable para tareas de matemáticas y derivaciones, y desactivable para consultas simples donde prima la latencia.
- Automatización de back-office profesional: generación y revisión de contratos, informes y hojas de cálculo descritas en imagen, aprovechando el contexto largo para mantener el estilo y las referencias cruzadas del documento.
- Despliegue *on-premise* con requisitos de privacidad: al publicarse bajo Apache 2.0 y en safetensors, puede ejecutarse en infraestructura propia sin dependencia de API externa, siempre que se validen los pesos.

## Benchmarks y rendimiento

El extracto disponible de la model card incluye una tabla de resultados comparativa, pero los valores numéricos quedan truncados, por lo que no es posible reproducirlos. La tabla compara Qwen3.8-27B con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, y está organizada por categorías de capacidad. La primera fila identificable corresponde a *Agentic terminal coding* (Terminal Bench 2.1, variante Terminus), dentro del bloque de Coding.

| Benchmark | Categoria | Modelos comparados | Resultado de Qwen3.8-27B |
|---|---|---|---|
| Terminal Bench 2.1 (Terminus) | Coding / agentico | Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B, Opus4.6 Max | No disponible (valor truncado en la informacion proporcionada) |
| Resto de filas de la tabla | No disponible | Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B, Opus4.6 Max | No disponible |

No se dispone de cifras verificables para MMLU, HumanEval, GSM8K ni ningún otro benchmark en la información proporcionada.

## Requisitos de hardware

Las siguientes cifras de VRAM son estimaciones derivadas del recuento de parámetros (27,8B) y no proceden de mediciones publicadas por el autor.

- Pesos en BF16/FP16: aproximadamente 55,6 GB (coincide con el tamaño del repositorio), más activaciones y caché KV.
- Pesos en int8: aproximadamente 28 GB.
- Pesos en 4 bits: aproximadamente 15-16 GB.
- GPU recomendadas para BF16: H100 80 GB, A100 80 GB o 2× A100 40 GB en tensor parallel; cabe en una única GPU de 80 GB.
- GPU para int8: A100 40 GB, L40S 48 GB o 2× RTX 4090/RTX 5090.
- GPU de consumo: en cuantización de 4 bits el modelo cabría en RTX 4090 24 GB, RTX 5090 32 GB o RTX 4080 16 GB (esta última muy justa y con contexto reducido). No se documentan pesos cuantizados oficiales, por lo que habría que generarlos.
- Caché KV estimado: solo las 16 capas de Gated Attention mantienen caché KV; con 4 cabezas KV de dimensión 256 en BF16 el coste es de aproximadamente 64 KiB por token, es decir, en torno a 8 GB para 128.000 tokens y 16 GB para 262.144 tokens. Las capas Gated DeltaNet usan estado recurrente de tamaño constante. Cifra estimada, no publicada.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang y TokenSpeed, según la model card. También existe una versión gestionada en Qwen Cloud (próximamente, con 1M de contexto por defecto).
- Latencia y throughput: no disponible.
- Requisito adicional: el modelo es multimodal, por lo que el codificador de visión y el preprocesado de vídeo añaden consumo de VRAM y tiempo de proceso no cuantificado.

## Comparativa con modelos similares

Solo se dispone de los nombres de los modelos usados como referencia en la tabla de benchmarks de la model card. No hay datos de especificaciones, licencia ni contexto para ninguno de ellos en la información proporcionada.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.8-27B (Xyrwex/Qwen3.8-27B) | 27,8B densos | 262.144 nativo, hasta 1.000.000 | Apache 2.0 | Pesos en HuggingFace, safetensors |
| Qwen3.6-27B | No disponible | No disponible | No disponible | No disponible |
| Qwen3.7-Plus | No disponible | No disponible | No disponible | No disponible |
| Muse Glimmer-30B | No disponible | No disponible | No disponible | No disponible |
| Opus4.6 Max | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- El repositorio procede del usuario `Xyrwex`, no de la organización oficial de Qwen. La model card emplea la primera persona del equipo Qwen ("we are pleased to introduce"), lo que sugiere una copia o espejo no oficial. Conviene verificar la procedencia e integridad de los pesos antes de usarlos en producción.
- Métricas de adopción muy bajas: 10 descargas y 0 *likes* en el momento de la consulta, con fecha de creación y actualización el 2026-09-18.
- La lista de idiomas soportados no está publicada; no se puede asumir cobertura multilingüe verificada.
- No se documentan pesos cuantizados oficiales (GGUF, AWQ, GPTQ), lo que dificulta el despliegue en hardware de consumo sin trabajo adicional de cuantización.
- La tabla de benchmarks está truncada en la información disponible y no permite verificar numéricamente las afirmaciones de rendimiento.
- El modo *thinking* está activado por defecto: incrementa el consumo de tokens de salida, la latencia y el coste por petición si no se desactiva explícitamente.
- Riesgo de alucinación inherente a los modelos de lenguaje generativos; no se documentan tasas de error ni evaluaciones de fidelidad factual.
- No se publica información sobre sesgos, composición del dataset de entrenamiento ni procesos de alineación (RLHF/DPO), por lo que no es posible evaluar sesgos conocidos.
- El coste de caché KV a 262.144 tokens es considerable (estimado en torno a 16 GB en BF16), lo que limita la longitud de contexto efectiva en GPUs de 24 GB.
- La licencia Apache 2.0 permite uso comercial, pero esa cobertura depende de que los pesos sean efectivamente los del modelo original; si se trata de un espejo no oficial, la garantía legal es la del repositorio de origen.
- Las capacidades de *tool calling* en los pesos locales no están confirmadas en el extracto disponible: las menciones a herramientas integradas se refieren a la versión alojada en Qwen Cloud.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Xyrwex/Qwen3.8-27B
- Página del modelo en Qwen Cloud: https://www.qwencloud.com/models/qwen3.8-27b
- Servicio Qwen Cloud: https://www.qwencloud.com
- Paper, blog técnico, repositorio de código y demos: no disponibles en la información proporcionada.
- Búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos no guardan relación con la ficha.
