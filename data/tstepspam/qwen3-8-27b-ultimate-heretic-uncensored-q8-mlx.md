# tstepspam/Qwen3.8-27B-Ultimate-Heretic-Uncensored-Q8-MLX

## Resumen

Qwen3.8-27B-Ultimate-Heretic-Uncensored-Q8-MLX es una cuantización en 8 bits para MLX del modelo DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored, un fine-tune de la familia Qwen 3.8 orientado a eliminar restricciones de alineación (etiquetado como "heretic" y "uncensored") y a habilitar múltiples modos de razonamiento e instrucción. Lo publica el usuario tstepspam en Hugging Face, con licencia Apache 2.0 y pesos en formato MLX safetensors de 8 bits, pensados para ejecutarse en hardware Apple Silicon mediante la librería MLX.

El modelo base es un transformer de aproximadamente 26.900 millones de parámetros (26,9 B), según los datos reales de safetensors del repositorio, con un tamaño de repo de 28,6 GB. La model card del autor del fine-tune original describe un entrenamiento multi-etapa (Cold Fusion, GAIN Training, multi-stage tuning) sobre datasets propios (DavidAU/Polar-STRICT-Datasets y DavidAU/F451-STRICT-Datasets), con soporte declarado para 27 modos de razonamiento, 27 modos de instrucción y varios "AI Constructs" orientados a agentes, código, escritura creativa y enseñanza.

Su relevancia es doble: por un lado, ofrece una variante sin censura de un modelo de 27 B para casos de uso creativos y de rol; por otro, la cuantización Q8 en MLX facilita su ejecución local en Macs con memoria unificada, un nicho con menos opciones que el ecosistema GGUF/CUDA. La información técnica publicada es escasa: no hay datos de benchmarks ni detalles verificables sobre el dataset de entrenamiento más allá de los nombres.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen 3.8, según tags del autor); detalles no disponibles |
| Parametros totales | 26.895.993.856 (26,9 B) |
| Parametros activos | No aplica (no se declara MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 8 bits (MLX); el modelo base ofrece bfloat16 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors MLX (8-bit) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna más allá de los tags de la familia Qwen 3.8 y la referencia a un transformer de 27 B. El fine-tune original de DavidAU se describe como un entrenamiento multi-etapa que combina "Cold Fusion", "GAIN Training" y "multi-stage tuning", partiendo de una variante "Heretic" (sin alineación) de Qwen 3.8 27B. Los datasets declarados son DavidAU/Polar-STRICT-Datasets y DavidAU/F451-STRICT-Datasets, sin que se publique su composición, número de tokens ni proporciones.

No hay información verificable sobre el uso de RLHF, DPO u otras técnicas de alineación posteriores; de hecho, el objetivo declarado del modelo es el contrario: eliminar el comportamiento de rechazo. La cuantización Q8 para MLX la realiza el publicador tstepspam a partir del modelo base en bfloat16, sin que se documenten detalles del proceso de conversión ni métricas de degradación.

## Capacidades

- Generación de texto conversacional en inglés.
- Modos de razonamiento declarados: 27 "reasoning modes" y 9 "Xhigh reasoning modes" (nomenclatura del autor, sin especificación técnica publicada).
- Modos de instrucción: 27 "instruct modes" según los tags.
- Escritura creativa: ficción, relatos, todos los géneros y roleplaying, según la model card.
- Generación de código: tag "coder" y "Coder AI Construct".
- "AI Constructs": 15 constructs, 5 "Super AI Constructs" y 21 "AGI Constructs" (Brainstorm AI, Brainstorm Business AI, Universal Teacher AI, Agent AI), sin documentación de cómo se activan.
- Comportamiento sin censura ("uncensored"/"heretic"): reduce o elimina rechazos a peticiones.
- Soporte de tool calling / function calling: no disponible.
- Capacidades multimodales (visión, audio): no disponibles.

## Casos de uso

- Escritura creativa y ficción: el modelo está afinado explícitamente para narrativa, relatos y todos los géneros; su ventana de contexto no está documentada, por lo que conviene validar la longitud efectiva antes de usarlo en novelas largas.
- Roleplaying y personajes: los tags de roleplaying y los "AI Constructs" sugieren uso en chatbots de personaje; la ausencia de censura permite tramas adultas o conflictivas que otros modelos rechazarían.
- Prototipado local en Mac: la cuantización Q8 MLX permite ejecutar un modelo de 27 B en Apple Silicon con memoria unificada suficiente, útil para desarrollo offline sin GPU dedicada.
- Generación de código asistida: el tag "coder" y el construct de código lo orientan a autocompletado y explicación de fragmentos; sin datos de HumanEval no se puede garantizar su calidad frente a modelos específicos de código.
- Lluvia de ideas y brainstorming: los constructs Brainstorm AI y Brainstorm Business AI están pensados para ideación; útiles en sesiones exploratorias donde se prefiere baja restricción.
- Enseñanza y tutoría: el Universal Teacher AI Construct apunta a explicaciones didácticas; requiere supervisión humana por el riesgo de alucinación.
- Investigación sobre alineación y censura: como modelo "heretic", sirve para estudiar comportamiento sin rechazos, sesgos y degradación de seguridad en comparación con el modelo base alineado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: con 26,9 B parámetros en 8 bits, los pesos ocupan aproximadamente 27 GB; el repo pesa 28,6 GB. Para inferencia se recomienda al menos 32 GB de memoria unificada, y 48-64 GB para contexto largo y margen de trabajo.
- GPU recomendadas: el formato MLX está diseñado para Apple Silicon (series M1/M2/M3/M4 Pro, Max y Ultra). No es compatible directamente con CUDA sin conversión.
- Cabe en GPU de consumo: en Macs con 32 GB o más de memoria unificada; en GPUs NVIDIA de consumo (RTX 4090, 24 GB) no cabe en Q8 sin offloading, y requeriría otra cuantización.
- Opciones de despliegue: MLX (mlx-lm) en macOS; para CUDA sería necesario convertir a GGUF o usar el modelo base en bfloat16 con vLLM/TGI en hardware de 80 GB o superior.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| tstepspam/Qwen3.8-27B-Ultimate-Heretic-Uncensored-Q8-MLX | 26,9 B | No disponible | Apache 2.0 | MLX 8-bit | Cuantización MLX del fine-tune de DavidAU |
| DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored | 27 B | No disponible | Apache 2.0 | bfloat16 | Modelo base del que deriva esta versión |
| DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored-Turbo-Brilliance-50x-AGI-NEO-GGUF | 27 B | No disponible | Apache 2.0 | GGUF | Variante "Turbo Brilliance 50X V2, AGI edition" para llama.cpp |
| 0bserverx/Qwen3.8-27B-Heretic-Abliterated-Uncensored-GGUF | 27 B | No disponible | No disponible | GGUF | Otra variante sin censura de la misma base |

## Limitaciones y advertencias

- Modelo sin alineación: la ausencia de censura implica que puede generar contenido ofensivo, ilegal o peligroso; no es apto para aplicaciones de cara al público sin filtros adicionales.
- Riesgo elevado de alucinación: no hay benchmarks ni evaluación publicada que permita estimar su fiabilidad factual.
- Idiomas: solo se declara inglés; el rendimiento en castellano no está garantizado.
- Contexto: la longitud de ventana no está documentada, lo que impide planificar cargas de trabajo con documentos largos.
- Nomenclatura no verificable: los "27 reasoning modes", "AI Constructs" y "AGI Constructs" son etiquetas comerciales del autor sin especificación técnica; no deben tratarse como capacidades garantizadas.
- Licencia: Apache 2.0 permite uso comercial, pero el usuario asume la responsabilidad legal del contenido generado y de posibles reclamaciones derivadas del modelo base.
- Cuantización: la conversión a 8 bits MLX puede degradar ligeramente la calidad respecto al bfloat16 original; no se publican métricas de esa pérdida.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni garantías de mantenimiento.
- Compatibilidad: al ser MLX, requiere macOS y Apple Silicon; no se puede usar directamente en entornos Linux/CUDA sin conversión.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/tstepspam/Qwen3.8-27B-Ultimate-Heretic-Uncensored-Q8-MLX
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored
- Variante GGUF Turbo Brilliance 50x AGI NEO: https://huggingface.co/DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored-Turbo-Brilliance-50x-AGI-NEO-GGUF
- Variante GGUF Heretic Abliterated: https://huggingface.co/0bserverx/Qwen3.8-27B-Heretic-Abliterated-Uncensored-GGUF
