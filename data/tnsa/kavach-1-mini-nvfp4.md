# TNSA/Kavach-1-Mini-NVFP4

## Resumen

Kavach-1-Mini-NVFP4 es un modelo de lenguaje compacto, especializado en seguridad ofensiva y razonamiento red-team, desarrollado por TNSA mediante ajuste fino supervisado de todos los parámetros (full-parameter SFT) sobre el modelo base Qwen/Qwen3.5-0.8B. El modelo está diseñado para actuar como asistente experto en pruebas de penetración autorizadas, investigación de seguridad y educación en ciberseguridad, con un tamaño reducido que permite ejecutarlo en hardware modesto y en entornos de laboratorio.

Esta versión concreta es el build NVFP4, una cuantización de 4 bits en formato de punto flotante optimizada para hardware Blackwell y empaquetada mediante la librería compressed-tensors. La arquitectura es un transformer causal basado en Qwen3.5-0.8B, con aproximadamente 752 millones de parámetros y una ventana de contexto de 4.096 tokens. El modelo se distribuye bajo licencia MIT y soporta exclusivamente inglés y texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (basado en Qwen/Qwen3.5-0.8B) |
| Parametros totales | 752.393.024 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | NVFP4 (este build); también disponible en BF16, FP8, INT8, INT4 y MXFP4 |
| Idiomas soportados | Inglés |
| Licencia | MIT |
| Formato de pesos | safetensors con compressed-tensors (nvfp4-pack-quantized) |

## Arquitectura y entrenamiento

Kavach-1-Mini-NVFP4 parte del modelo Qwen/Qwen3.5-0.8B, un transformer causal de aproximadamente 0.800 millones de parámetros. El entrenamiento consistió en un ajuste fino supervisado de todos los parámetros (full-parameter SFT), a diferencia de la línea anterior basada en LoRA, con el objetivo de especializar el modelo en tareas de seguridad ofensiva y razonamiento red-team. El proceso de fine-tuning se realizó con Hugging Face `transformers` y `trl` acelerado con Liger, y posteriormente se cuantizó a NVFP4 mediante `llm-compressor` con el formato compressed-tensors.

No se ha publicado información detallada sobre la composición del dataset de entrenamiento ni el número total de tokens utilizados. Tampoco se documenta el uso de técnicas de alineación como RLHF o DPO; el ajuste se describe únicamente como supervisado. La cuantización NVFP4 es un formato de 4 bits en coma flotante optimizado para aceleración en hardware Blackwell, que sacrifica algo de fidelidad respecto a los builds BF16 o FP8 a cambio de menor uso de memoria y mayor velocidad.

## Capacidades

- Generación de texto especializada en seguridad ofensiva, análisis de vulnerabilidades y razonamiento red-team.
- Soporte de chat mediante plantilla (`apply_chat_template`), con capacidad para manejar mensajes de sistema y usuario.
- Revisión de código y endpoints de aplicaciones web en busca de fallos de seguridad (por ejemplo, endpoints Flask).
- Asistencia en la elaboración de pruebas de penetración dentro de un alcance autorizado.
- Análisis de configuraciones, payloads y comandos relacionados con seguridad, aunque la salida debe verificarse manualmente.
- Modelo monolingüe en inglés y exclusivamente de texto; no se documenta soporte de tool calling, visión ni audio.
- Ejecución eficiente en hardware modesto gracias a su tamaño compacto y cuantización a 4 bits.

## Casos de uso

- Auditoría de código de seguridad: el modelo puede revisar funciones de autenticación, endpoints y lógica de aplicación en busca de vulnerabilidades comunes, como inyección SQL, XSS o fallos de control de acceso. Su tamaño permite integrarlo en pipelines de análisis local sin necesidad de servicios externos.
- Pruebas de penetración autorizadas: sirve como asistente para planificar y ejecutar fases de reconocimiento y explotación dentro de un alcance definido, generando sugerencias de payloads y comandos que el pentester debe validar antes de su uso.
- Investigación y análisis de malware: puede ayudar a interpretar fragmentos de código, scripts o configuraciones sospechosas, proporcionando explicaciones técnicas y posibles indicadores de compromiso.
- Blue-team enablement: los equipos defensivos pueden utilizarlo para comprender tácticas ofensivas, anticipar vectores de ataque y diseñar contramedidas, a partir de descripciones de técnicas y procedimientos.
- Educación y formación en ciberseguridad: permite generar ejercicios prácticos, preguntas tipo CTF y explicaciones de vulnerabilidades, facilitando el aprendizaje en laboratorios controlados.
- Herramienta local en laboratorios de seguridad: gracias a su bajo consumo de VRAM y a su licencia MIT, puede desplegarse en máquinas de laboratorio, contenedores o entornos aislados para pruebas sin conexión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos NVFP4 ocupan aproximadamente 1.1 GB (según el tamaño del repositorio), por lo que se recomienda un mínimo de 2 a 4 GB de VRAM para acomodar pesos y activaciones.
- GPU recomendadas: hardware con soporte nativo de 4-bit float, como las arquitecturas Blackwell (RTX 50, B100, etc.). También puede ejecutarse en GPUs más antiguas con suficiente VRAM, aunque el rendimiento puede variar.
- En GPU de consumo: sí, es viable en tarjetas como RTX 3060 (12 GB), RTX 4060 (8 GB) o similares, siempre que exista soporte para compressed-tensors.
- Opciones de despliegue: vLLM (recomendado por el autor) y Hugging Face Transformers con la librería `compressed-tensors` instalada. No se proporciona soporte GGUF ni configuración específica para llama.cpp u Ollama.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Especializacion | Licencia |
|---|---|---|---|---|---|
| TNSA/Kavach-1-Mini-NVFP4 | 752.393.024 | 4.096 | NVFP4 | Seguridad ofensiva | MIT |
| Qwen/Qwen3.5-0.8B (base) | ~0.8B | 4.096 | — | Generalista | Propia de Qwen |
| TNSA/Kavach-1-Mini-FP8 | ~0.8B | 4.096 | FP8 | Seguridad ofensiva | MIT |

No se dispone de resultados de benchmarks para comparar el rendimiento entre estos modelos. La principal diferencia entre el build NVFP4 y el base es la especialización en seguridad y la cuantización, que reduce la fidelidad pero mejora la eficiencia.

## Limitaciones y advertencias

- Al ser un modelo de aproximadamente 0.8B de parámetros, es menos fiable que modelos de mayor tamaño; es necesario verificar todos los comandos, payloads y afirmaciones generadas.
- Puede producir detalles técnicos plausibles pero incorrectos, por lo que debe tratarse como un punto de partida y no como una fuente autoritativa.
- Ventana de contexto limitada a 4.096 tokens, lo que restringe el análisis de documentos largos o conversaciones extensas.
- Solo soporta inglés y texto; no maneja otras lenguas ni entradas multimodales.
- La cuantización NVFP4 requiere hardware o runtimes con soporte nativo de coma flotante de 4 bits; en plataformas sin ese soporte, la carga o inferencia puede fallar o degradarse.
- Es una herramienta de uso dual destinada exclusivamente a trabajo autorizado y legal; su uso sin permiso explícito sobre sistemas ajenos puede incurrir en responsabilidad legal.
- La licencia MIT se aplica a los pesos de este modelo, pero el modelo base Qwen3.5-0.8B está sujeto a su propia licencia; se deben revisar y cumplir sus términos al redistribuir pesos derivados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TNSA/Kavach-1-Mini-NVFP4
- Variante FP8 del mismo modelo: https://huggingface.co/TNSA/Kavach-1-Mini-FP8
- Modelo base Qwen/Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
