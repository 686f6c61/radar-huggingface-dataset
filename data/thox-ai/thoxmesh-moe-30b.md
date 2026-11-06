# Thox-ai/ThoxMesh-MoE-30B

## Resumen

ThoxMesh-MoE-30B es un paquete de configuración publicado por Thox-ai sobre los pesos sin modificar de Qwen3-30B-A3B, un modelo de mezcla de expertos (MoE) disperso desarrollado por Alibaba Cloud. El repositorio no contiene pesos entrenados por THOX: incluye únicamente un `Modelfile` para Ollama, un manifiesto de release y un "Knowledge Pack" en JSONL con ocho entradas verificadas sobre el sistema MeshStack. La build ejecutable se distribuye a través de Ollama y descarga los pesos originales del modelo base fijados por digest.

El interés técnico del modelo reside en su base: Qwen3-30B-A3B activa aproximadamente 3.000 millones de parámetros por token sobre un total de 30.000 millones, lo que le permite un rendimiento en CPU muy superior al de un modelo denso de tamaño comparable. THOX añade un perfil de sistema que incluye instrucciones de grounding (declinar la verificación de estado en vivo, tratar hechos operativos aportados por el usuario como no verificados) y respuestas ancladas al Knowledge Pack.

Es relevante como ejemplo de patrón de empaquetado "configuración sobre pesos ajenos": útil para quien quiera evaluar cómo un perfil de sistema y un contexto documental pequeño modifican el comportamiento de un MoE sin reentrenamiento, y como advertencia sobre los límites de este enfoque cuando el dominio requiere datos que el modelo base no conoce.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) dispersa; pesos de Qwen3-30B-A3B |
| Parámetros totales | 30B |
| Parámetros activos | ~3B por token |
| Longitud de contexto | 8.192 tokens verificados en la evaluación del autor; contexto nativo del base no disponible en la información proporcionada |
| Tipos de cuantización | No disponible en la información proporcionada (el artefacto Ollama reportado pesa 18,56 GB) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF vía Ollama; el repositorio HF contiene `Modelfile`, `manifest.json` y `thox-knowledge-v0.1.jsonl` |

## Arquitectura y entrenamiento

El modelo es un transformer MoE disperso: de los 30.000 millones de parámetros totales, aproximadamente 3.000 millones se activan por token mediante enrutamiento interno. Esta dispersión es la responsable del throughput relativamente alto en CPU frente a un modelo denso de 32B. Conviene subrayar que el enrutamiento MoE dentro de un nodo es una característica del modelo base y no tiene relación con MeshStack, que enruta peticiones completas entre nodos.

No hay entrenamiento ni ajuste fino por parte de THOX: los pesos son byte a byte idénticos a la release upstream de Qwen3-30B-A3B. El trabajo de THOX consiste en un perfil de sistema versionado y el THOX Knowledge Pack v0.1 (8 entradas públicas verificadas, 4.652 bytes). El perfil publicado incluye un bloque de grounding explícito (principio de marca literal, rechazo de verificación de estado en vivo, hechos operativos del usuario marcados como no verificados) y una aclaración de respuesta directa, ambos añadidos tras fallos observados en pruebas previas de la familia de perfiles. No se dispone de datos sobre la composición del dataset de entrenamiento del modelo base ni sobre si empleó RLHF o DPO.

## Capacidades

- Generación de texto y respuesta a preguntas técnicas en inglés.
- Razonamiento y explicación de diseño de enrutamiento (enrutamiento de petición completa, localidad, comportamiento ante fallos).
- Respuestas ancladas al THOX Knowledge Pack v0.1 sobre expansión y enrutamiento de MeshStack.
- Declinación configurada de verificación de estado en vivo (telemetría, número de nodos, precios, disponibilidad).
- Respuesta directa a preguntas técnicas generales, con rechazos reservados a la verificación de estado en vivo.
- Herencia de las capacidades del base Qwen3-30B-A3B (no documentadas en esta ficha por falta de datos en la información proporcionada).
- No soporta visión, audio ni tool calling documentado en este paquete.
- No realiza inferencia distribuida, tensor parallelism, pipeline parallelism ni split inference.

## Casos de uso

- Asistencia interna sobre MeshStack: responder consultas de planificación de expansión y enrutamiento apoyándose en las ocho entradas verificadas del Knowledge Pack, con rechazo explícito cuando la pregunta exige estado en vivo.
- Capa de servicio local de alto throughput: desplegar el MoE en una estación de trabajo con GPU de 16 GB y obtener ~53,75 tokens/s en generación larga, adecuado para tareas de redacción y resumen en lote.
- Formación de equipos de operaciones: explicar por qué MeshStack enruta peticiones completas y no fragmenta la inferencia, usando el perfil de sistema como material didáctico reproducible.
- Evaluación de patrones de grounding: servir como banco de pruebas para medir cuánto mejora un perfil de sistema más un contexto documental pequeño la fidelidad factual de un modelo base, sin reentrenar.
- Despliegue en entornos con requisitos de soberanía de datos: al ejecutarse localmente vía Ollama con pesos Apache-2.0, permite mantener las consultas dentro de la infraestructura propia.
- Prototipado de asistentes con política de rechazo: validar flujos donde el asistente debe negarse a afirmar estados operativos no verificables y derivar a documentación versionada.
- Pruebas de regresión de configuración: comparar el comportamiento del perfil enmendado frente a versiones previas de la familia (se documentan fallos de improvisación de marca y de rechazo excesivo en smokes anteriores).

## Benchmarks y rendimiento

Evaluación publicada por el autor el 2026-11-01 en estación de trabajo x86_64 con GPU de clase 16 GB y ejecución en host compartido.

| Métrica | Resultado |
|---|---|
| Base fijado | `qwen3:30b-a3b`, digest `sha256:ad815644918f0eaab341c12b67837cc6dd4562342cdaf118f83d5d554cb37226`, 18,56 GB |
| Carga | Correcta a 8.192 tokens de contexto |
| Huella de memoria del runner | 14,99 GB (VRAM + RAM del sistema según planificación del runner) |
| Throughput (generación larga, 3.207 tokens) | 53,75 tokens/s |
| Preguntas de humo de fábrica | 3/3 respondidas (principio de marca; trampa de topología fabricada; enrutamiento de peticiones frente a tensor parallelism) |
| Grounding del Knowledge Pack | 8/8 temas respondidos con los hechos requeridos de los pasajes verificados |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor advierte que el throughput debe interpretarse como suelo en condiciones de host compartido, no como perfil de estación de trabajo dedicada.

## Requisitos de hardware

- VRAM/RAM: el runner reportó 14,99 GB de huella combinada con el artefacto de 18,56 GB cargado a 8.192 tokens de contexto.
- GPU: clase 16 GB verificada en la evaluación del autor; no se especifican modelos concretos (A100, H100, RTX 4090) en la información proporcionada.
- GPU de consumo: cabe en tarjetas de 16 GB de VRAM según la medición del autor; en configuraciones menores requeriría descarga parcial a RAM del sistema.
- Despliegue: Ollama es el canal oficial (`ollama run Thox-ai/thoxmesh-moe-30b`); también es posible construir localmente con `ollama create` a partir del `Modelfile` del repositorio. No se documenta soporte para vLLM, llama.cpp directo ni TGI.
- Throughput: 53,75 tokens/s en generación larga bajo host compartido; latencia no reportada.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|---|
| ThoxMesh-MoE-30B | 30B | ~3B | 8.192 verificados | Apache-2.0 | GGUF vía Ollama | Pesos idénticos a Qwen3-30B-A3B más perfil y Knowledge Pack |
| Qwen3-30B-A3B (upstream) | 30B | ~3B | No disponible | Apache-2.0 | Múltiples (no detallados aquí) | Mismo comportamiento base sin perfil THOX ni grounding documental |
| Modelo denso de 32B (referencia citada por el autor) | 32B | 32B | No disponible | No disponible | No disponible | El autor lo usa como contraste de throughput en CPU frente al MoE |

No se dispone de datos de benchmarks comparativos ni de otras alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Configuración, no entrenamiento: fuera del Knowledge Pack, el modelo solo conoce THOX por su entrenamiento base; el conocimiento del dominio está limitado a ocho entradas.
- Sin estado en vivo: no tiene telemetría y está configurado para declinar la verificación de estado de clúster, número de nodos, precios o disponibilidad.
- Solo enrutamiento: no realiza tensor parallelism, pipeline parallelism ni split inference, y no debe describirse como si lo hiciera.
- Sin cualificación en hardware THOX: los dispositivos ThoxKey, ThoxAir, ThoxMini, ThoxClip y ThoxUltra ejecutan builds menores; nada en este paquete avala rendimiento on-device.
- Riesgo de alucinación en el dominio: el autor documenta que el perfil sin enmiendas improvisaba la respuesta de marca y que una versión previa rechazaba en exceso preguntas técnicas generales.
- Idioma: solo inglés declarado; no hay evaluación multilingüe.
- Sesgos: no se documentan sesgos específicos en la información proporcionada; se heredan los del modelo base Qwen3-30B-A3B.
- Licencia: Apache-2.0 permite uso comercial, pero el paquete no incluye garantías ni cualificación de producción más allá de los smokes reportados.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; release creada y actualizada el 2026-11-01, sin historial de mantenimiento.

## Enlaces

- Hugging Face: https://huggingface.co/Thox-ai/ThoxMesh-MoE-30B
- Modelo base: https://huggingface.co/Qwen/Qwen3-30B-A3B
- Ejecución vía Ollama: `ollama run Thox-ai/thoxmesh-moe-30b`
- Descarga del paquete: `hf download Thox-ai/ThoxMesh-MoE-30B --local-dir ./ThoxMesh-MoE-30B`
