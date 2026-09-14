# thoughtsengineering/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje causal con codificador de visión publicado en Hugging Face por el usuario `thoughtsengineering`. Según su model card, se presenta como la generación más capaz de la familia Qwen de pesos abiertos hasta la fecha, construida sobre la base arquitectónica de Qwen3.5 y orientada a codificación, trabajo profesional, investigación y tareas agénticas de horizonte largo. El modelo combina un transformer híbrido con capas de atención lineal Gated DeltaNet y capas de atención completa Gated Attention, con 27.781.427.952 parámetros reales según los pesos en safetensors y una dimensión oculta de 5120 a lo largo de 64 capas.

La longitud de contexto nativa es de 262.144 tokens, extensible hasta 1.000.000, e incorpora un codificador de visión que permite comprensión nativa de imágenes y vídeo, incluyendo vídeos de hasta una hora. Es un modelo denso (no MoE), entrenado con Multi-Token Prediction (MTP) en varios pasos, con control flexible de razonamiento: el modo thinking está activo por defecto y puede desactivarse por petición, ajustando la profundidad con `reasoning_effort` y preservando contexto de razonamiento previo con `preserve_thinking`. Es relevante ahora porque ofrece capacidades agénticas y multimodales en un tamaño compacto desplegable en una sola GPU de gama alta, bajo licencia Apache 2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido: Gated DeltaNet (atención lineal) intercalada con Gated Attention (atención completa), más codificador de visión |
| Parametros totales | 27.781.427.952 (según safetensors); 27B declarados en la model card |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativo; extensible hasta 1.000.000 tokens |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (el repo contiene pesos safetensors) |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con Transformers); repositorio de 55,6 GB |

## Arquitectura y entrenamiento

El modelo es un transformer causal con codificador de visión, con 64 capas organizadas en un patrón repetido 16 veces: `3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)`. Esto da 48 capas con atención lineal Gated DeltaNet y 16 capas con atención completa Gated Attention. Gated DeltaNet emplea 48 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128. Gated Attention usa 24 cabezas para Q y 4 para KV (GQA), dimensión de cabeza 256 y dimensión de Rotary Position Embedding de 64. La dimensión oculta es 5120, la dimensión intermedia de la red feed-forward es 17.408 y el embedding de tokens (así como la salida LM) tiene 248.320 entradas con padding.

El entrenamiento cubre las fases de preentrenamiento y postentrenamiento, e incluye Multi-Token Prediction (MTP) entrenado con múltiples pasos, una técnica que habilita decodificación especulativa nativa para acelerar la generación. La combinación de capas de atención lineal con capas de atención completa es la innovación estructural principal: busca reducir el coste computacional y de memoria del contexto largo manteniendo la calidad de recuperación de la atención completa en una de cada cuatro capas. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni el uso concreto de RLHF o DPO durante el postentrenamiento.

## Capacidades

- Generación de texto y razonamiento con modo thinking controlable: activo por defecto, desactivable por petición, con profundidad ajustable mediante `reasoning_effort`.
- Retención de contexto de razonamiento entre mensajes históricos mediante `preserve_thinking`.
- Codificación, incluida codificación agéntica en terminal (el modelo se evalúa en Terminal Bench 2.1 con Terminus).
- Comprensión de imagen nativa: diagramas STEM, documentos y capturas.
- Comprensión de vídeo nativa, incluyendo vídeos de escala horaria.
- Ejecución agéntica: planificación autónoma y manejo de retroalimentación del entorno para completar tareas de extremo a extremo.
- Soporte declarado de harnesses y herramientas de desarrollo populares para integración en stacks existentes.
- Compatibilidad de despliegue con Hugging Face Transformers, vLLM, SGLang y TokenSpeed.
- Multi-Token Prediction para decodificación especulativa.
- No se detalla en la información disponible el soporte explícito de tool calling o function calling, ni la lista de idiomas soportados.

## Casos de uso

- Agentes de codificación en terminal: el modelo está diseñado y evaluado para tareas agénticas de terminal (Terminal Bench 2.1 con Terminus), por lo que encaja en flujos donde el agente ejecuta comandos, lee la salida y corrige errores de forma iterativa dentro de un repositorio.
- Revisión de documentación técnica con visión: al aceptar entradas de imagen, puede procesar diagramas de arquitectura, esquemas STEM o capturas de paneles y extraer conclusiones o generar documentación derivada.
- Análisis de vídeo de larga duración: con soporte nativo de vídeo y contexto ampliable a 1.000.000 de tokens, es adecuado para resumir o consultar grabaciones de reuniones, sesiones de formación o material audiovisual extenso.
- Atención al cliente multi-turno: la ventana de 262.144 tokens permite mantener historiales de conversación muy largos sin truncar, preservando además el contexto de razonamiento entre turnos con `preserve_thinking`.
- Investigación asistida sobre corpus extensos: la combinación de contexto largo y capacidad de razonamiento permite analizar documentación científica o legal completa y producir síntesis con referencias internas al propio corpus.
- Automatización de pipelines de CI/CD con razonamiento controlado: al poder desactivar el modo thinking por petición, se puede usar el modelo en tareas de alto volumen con latencia reducida (generación de parches, clasificación de fallos, resúmenes de logs) y reservar el modo thinking para los casos complejos.
- Generación de código en producción: su compatibilidad con vLLM y SGLang facilita el despliegue como servicio detrás de herramientas de asistencia en el editor o bots de revisión de pull requests.
- Procesamiento de documentos escaneados con tablas y figuras: la combinación de codificador de visión y contexto largo permite extraer datos estructurados de documentos de muchas páginas sin fragmentarlos.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa de rendimiento en la que se comparan Qwen3.8-27B, Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max. Sin embargo, en la información disponible la tabla aparece truncada antes de mostrar los valores numéricos, por lo que no es posible reproducir cifras concretas. Se conoce que la comparativa cubre, entre otras, la categoría de codificación mediante el benchmark Terminal Bench 2.1 (variante Terminus).

No se han publicado resultados numéricos de benchmarks en la informacion disponible.

| Benchmark mencionado | Valores |
|---|---|
| Terminal Bench 2.1 (Terminus) | No disponible (tabla truncada) |
| Resto de categorias de la tabla comparativa | No disponible (tabla truncada) |

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del recuento real de parámetros (27.781.427.952) y del tamaño del repositorio (55,6 GB); no proceden de la información publicada por el autor.

- Peso de los pesos en precisión completa: aproximadamente 55,6 GB, coherente con bfloat16 o float16 más el codificador de visión. Se necesita al menos esa cantidad de VRAM para cargar el modelo sin cuantizar.
- Inferencia en bfloat16/float16: en torno a 60-70 GB de VRAM contando pesos y caché KV, lo que requiere una GPU de 80 GB (A100, H100) o reparto en varias GPU.
- Inferencia en FP8: en torno a 30-35 GB, viable en una A100 40 GB, L40S 48 GB o en una RTX 6000 Ada 48 GB.
- Inferencia en INT8: aproximadamente 28-32 GB de VRAM, ajustada en GPUs de 32 GB como la V100 32 GB o la RTX 5090.
- Inferencia en INT4/4 bits: en torno a 16-20 GB, lo que permite ejecutarla en GPUs de consumo como la RTX 4090 24 GB, la RTX 5090 32 GB o configuraciones con varias RTX 3090 de 24 GB.
- Despliegue: la model card declara compatibilidad con Hugging Face Transformers, vLLM, SGLang y TokenSpeed. No se menciona explícitamente llama.cpp, Ollama ni TGI en la información disponible. Aunque la tag de la librería es `transformers`, el tag del repositorio incluye `qwen3_5` y el pipeline es `image-text-to-text`.
- Latencia y throughput: no disponible en la información proporcionada. El uso de Gated DeltaNet y de Multi-Token Prediction sugiere ventajas de eficiencia en contexto largo y decodificación especulativa, pero no se publican cifras.
- Nota sobre el contexto: aprovechar los 262.144 tokens nativos, y más aún los 1.000.000, requiere planificación de memoria de la caché KV y muy probablemente despliegues multi-GPU o con técnicas de gestión de caché del servidor de inferencia.
- Opción gestionada: el autor menciona una versión alojada en Qwen Cloud con 1M de contexto por defecto y herramientas integradas, anunciada como "coming soon".

## Comparativa con modelos similares

La model card sitúa el modelo frente a cuatro referencias. Solo se dispone de los nombres; no hay especificaciones ni resultados numéricos disponibles para las alternativas.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.8-27B | 27,78B (denso) | 262.144 nativo, hasta 1.000.000 | Apache 2.0 | Pesos abiertos en Hugging Face; servicio gestionado en Qwen Cloud anunciado |
| Qwen3.6-27B | No disponible | No disponible | No disponible | No disponible |
| Qwen3.7-Plus | No disponible | No disponible | No disponible | No disponible |
| Muse Glimmer-30B | No disponible | No disponible | No disponible | No disponible |
| Opus4.6 Max | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- La tabla de benchmarks de la model card aparece truncada en la información disponible, de modo que no se pueden verificar las afirmaciones de rendimiento frente a Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B u Opus4.6 Max.
- El repositorio está publicado bajo la cuenta `thoughtsengineering`, no bajo la organización oficial de Qwen, pese a que la model card está redactada con el estilo de la documentación oficial. Conviene verificar la procedencia de los pesos antes de usarlos en producción.
- El repositorio tiene 10 descargas y 0 "me gusta" en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- Riesgo de alucinación: no se publica información sobre calibración, tasas de alucinación ni evaluación de fidelidad factual. Como en cualquier LLM generativo, la salida debe verificarse en dominios sensibles.
- Sesgos: no se publica ninguna sección de evaluación de sesgos, equidad o comportamientos dañinos. No se puede asumir que los riesgos estén caracterizados.
- Idiomas: la lista de idiomas soportados no está disponible; no se puede asumir cobertura multilingüe aunque la familia Qwen suele serlo.
- Contexto largo: aunque se declaran 262.144 tokens nativos y extensión a 1.000.000, no se documentan métricas de recuperación efectiva en contextos largos (por ejemplo, evaluaciones tipo aguja en el pajar), ni el coste de memoria asociado.
- Modo thinking activado por defecto: implica mayor consumo de tokens y latencia si no se desactiva explícitamente por petición, lo que afecta a los costes operativos.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución con atribución y conservación de avisos. No obstante, al tratarse de una publicación de un tercero, la licencia declarada no garantiza que el publicador tenga derechos sobre todos los componentes.
- Modelo multimodal: la entrada de imágenes y vídeo añade superficie de ataque (contenido malicioso embebido en imágenes) y requiere validación de entradas en producción.
- No se documentan requisitos mínimos de hardware, cuantizaciones oficiales ni cifras de latencia o throughput, lo que complica la planificación de capacidad.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/thoughtsengineering/Qwen3.8-27B
- Qwen Cloud (servicio gestionado mencionado en la model card): https://www.qwencloud.com
- Página del modelo en Qwen Cloud: https://www.qwencloud.com/models/qwen3.8-27b
- Búsqueda web: no se han encontrado enlaces relevantes sobre este modelo en los resultados de búsqueda disponibles.
