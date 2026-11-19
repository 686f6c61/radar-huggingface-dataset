# tapsin/ornith-9b-tapsin

## Resumen

Ornith 9B Tapsin es un ajuste fino del modelo base Ornith 1.5 9B (descrito por el autor como una variante de la familia Llama 3.1) publicado por el usuario tapsin en Hugging Face. El modelo se distribuye en dos configuraciones que comparten los mismos pesos y difieren únicamente en la ventana de contexto, extendida mediante escalado RoPE (YaRN y NTK-aware) hasta 65.536 y 131.072 tokens respectivamente. El objetivo declarado es el razonamiento sobre documentos largos, la revisión de código y la escritura creativa con contextos extensos.

Con 8.953.803.264 parámetros totales (aproximadamente 9B) y un repositorio de 6,3 GB, el modelo se ofrece principalmente en formato GGUF cuantizado Q4_K_M (~5,6 GB) para su uso con Ollama y llama.cpp, además de pesos compatibles con Transformers. Incluye un proyector multimodal (mmproj, ~624 MB) que habilita tareas de visión según la model card.

Su relevancia radica en ofrecer una ventana de contexto de 128K tokens en un modelo de ~9B parámetros que cabe en GPU de consumo, con licencia MIT que permite uso comercial sin restricciones. No obstante, el modelo tiene cero descargas y cero likes en el momento de la consulta, no se han publicado benchmarks y la model card contiene referencias internas no verificables, por lo que debe evaluarse con cautela antes de adoptarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama 3.1 / Ornith 1.5 9B (según model card) |
| Parametros totales | 8.953.803.264 (~9B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 65.536 tokens (variante 64K) y 131.072 tokens (variante 128K), vía escalado RoPE |
| Tipos de cuantizacion | Q4_K_M (4-bit K-means, medium); pesos Transformers en fp16 |
| Idiomas soportados | Inglés (en), turco (tr) y código |
| Licencia | MIT |
| Formato de pesos | GGUF (Q4_K_M), safetensors (Transformers), mmproj GGUF para visión |
| Tamano del repositorio | 6,3 GB |
| Proyector multimodal | mmproj GGUF, ~624 MB |
| Fecha de creacion | 2026-11-19 |

## Arquitectura y entrenamiento

La model card describe el modelo como un ajuste fino de Ornith 1.5 9B, con arquitectura basada en Llama 3.1. La modificación principal consiste en la extensión del contexto mediante técnicas de escalado posicional: YaRN combinado con NTK-aware RoPE para la variante de 64K (factor de escalado ~2,0x) y YaRN con Dynamic NTK Alpha para la de 128K (factor ~4,0x). Ambas variantes comparten los mismos pesos base y el mismo proyector multimodal, y solo cambia la configuración de RoPE.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset de ajuste fino, ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se documenta ninguna innovación adicional más allá del escalado de contexto y la inclusión del proyector multimodal. La referencia al modelo base apunta a un repositorio denominado "Ornith-1.5-9B-uncensored-GGUF" del usuario kietaskrutas01, lo que sugiere que el modelo original podría estar descensurado, aunque no se detalla el impacto de ese ajuste en el modelo final.

## Capacidades

- Generación de texto conversacional y de formato largo, orientada a contextos extensos.
- Razonamiento sobre documentos largos: la ventana de hasta 131.072 tokens permite procesar manuales, informes o bases de código completas en una sola pasada.
- Generación y revisión de código, con soporte declarado para el idioma "code" y ejemplos de revisión de bases de código en la model card.
- Escritura creativa con contexto narrativo prolongado (capítulos de novela, continuaciones de historias).
- Conversación multi-turno con historial largo, gracias a la ventana extendida.
- Capacidades multimodales (visión) a través del proyector mmproj incluido en el repositorio.
- Multilingüe limitado a inglés y turco, además de código.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte explícito de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo "thinking" o razonamiento explícito: no disponible en la información proporcionada.

## Casos de uso

- Análisis de documentos extensos: resumir o extraer información de informes de hasta 100 páginas en una sola llamada, aprovechando la ventana de 128K tokens sin necesidad de fragmentación ni recuperación externa.
- Revisión de código en repositorios medianos: cargar varios archivos fuente en el contexto de 64K o 128K para detectar bugs, inconsistencias y oportunidades de refactorización en una única pasada.
- Escritura creativa asistida: mantener coherencia narrativa en capítulos largos o sagas, ya que el modelo conserva el contexto de tramas y personajes a lo largo de decenas de miles de tokens.
- Asistente conversacional con memoria prolongada: gestionar sesiones multi-turno con historial extenso (por ejemplo, soporte técnico de incidencias largas) manteniendo el hilo sin truncar conversaciones previas.
- Procesamiento de documentación técnica en turco e inglés: traducción, resumen y preguntas sobre manuales en ambos idiomas, dado el soporte declarado para en y tr.
- Análisis de imágenes con texto asociado: uso del proyector mmproj para tareas que combinen capturas, diagramas o documentos escaneados con instrucciones textuales largas.
- Despliegue local en estaciones de trabajo: al caber en GPU de consumo con cuantización Q4_K_M, permite prototipar asistentes de contexto largo sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según model card): ~8 GB para la variante de 64K y ~12 GB para la de 128K, con offload completo a GPU (`--ngl 999`). La VRAM escala con la longitud de contexto efectiva por el tamaño de la caché KV.
- RAM estimada con offload a CPU: ~12 GB para 64K y ~18 GB para 128K.
- GPU recomendadas: no se especifican modelos concretos; por los requisitos de VRAM, una RTX 4090 (24 GB) o RTX 4080 (16 GB) cubren ambas variantes con holgura. Para despliegues en servidor, A100 o H100 son sobredimensionadas para un modelo de 9B en Q4_K_M.
- GPU de consumo: sí cabe en GPUs consumer de 12 GB o más para la variante 128K, y de 8 GB o más para la de 64K, siempre con cuantización Q4_K_M.
- Opciones de despliegue: Ollama (recomendado por el autor, con Modelfiles para 64K y 128K), llama.cpp (`llama-cli`), Transformers con `trust_remote_code=True` y `device_map="auto"`. No se mencionan vLLM ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Ornith 9B Tapsin | ~9B | 64K / 128K | MIT | GGUF, safetensors | Fine-tune con contexto extendido vía YaRN; sin benchmarks publicados |
| Ornith 1.5 9B (base) | ~9B | No disponible | No disponible | GGUF | Modelo base del ajuste; referencia a variante "uncensored" |
| Llama 3.1 8B | ~8B | 128K | Llama 3.1 Community License | Safetensors, GGUF | Arquitectura de referencia; contexto nativo de 128K; benchmarks públicos amplios |
| Qwen2.5 7B | ~7B | 128K | Apache 2.0 (mayoría de variantes) | Safetensors, GGUF | Alternativa de tamaño similar con soporte multilingüe amplio y benchmarks publicados |

La comparación con Llama 3.1 8B y Qwen2.5 7B es orientativa por tamaño y ventana de contexto; no se dispone de datos de rendimiento del modelo evaluado que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de calidad en MMLU, HumanEval, GSM8K ni tareas de contexto largo, lo que impide validar las afirmaciones de la model card.
- Modelo sin tracción: cero descargas y cero likes en Hugging Face en el momento de la consulta; no hay evidencia de uso en producción ni validación por la comunidad.
- Procedencia del modelo base poco clara: la referencia apunta a una variante "uncensored" de un modelo Ornith 1.5 9B, lo que puede implicar una reducción de los filtros de seguridad y un mayor riesgo de contenido inapropiado.
- Riesgo de alucinación: inherente a los modelos de ~9B, especialmente en tareas de razonamiento largo; la ventana extendida no garantiza el uso efectivo de todo el contexto ("lost in the middle").
- Idiomas limitados: solo inglés, turco y código; no hay soporte declarado para castellano, lo que limita su uso en producción en español.
- Contexto extendido vía RoPE: la calidad en las colas del contexto (más allá de 32K) puede degradarse; no se documentan evaluaciones de recuperación en contextos largos (needle-in-a-haystack).
- Capacidades multimodales no verificadas: se incluye un mmproj, pero no se detallan tareas, resolución de imagen ni calidad del pipeline de visión.
- Tool calling y agentes no documentados: no se confirma soporte de function calling, lo que limita su integración en pipelines agénticos.
- Licencia MIT: permisiva para uso comercial, pero el autor no ofrece garantías ("AS IS") ni asume responsabilidad sobre el comportamiento del modelo.
- Fechas y enlaces de la model card no verificables de forma independiente (por ejemplo, la colección del modelo base), lo que dificulta la trazabilidad del linaje de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tapsin/ornith-9b-tapsin
- Pesos GGUF Q4_K_M: https://huggingface.co/tapsin/ornith-9b-tapsin/resolve/main/ornith-9b-tapsin-Q4_K_M.gguf
- Repositorio GitHub del autor: https://github.com/tapsin/ornith-9b-tapsin
- Modelo base (referencia de la model card): https://huggingface.co/kietaskrutas01/Ornith-1.5-9B-uncensored-GGUF
- Colección del modelo base (referencia de la model card): https://huggingface.co/collections/kietaskrutas01/ornith-15-9b-673b4d7c5b3f2d3a3c4d5e6f
- GitHub Sponsors del autor: https://github.com/sponsors/tapsin
- Ko-fi del autor: https://ko-fi.com/tapsin
- Patreon del autor: https://patreon.com/tapsin
