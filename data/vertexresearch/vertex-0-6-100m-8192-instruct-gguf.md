# VertexResearch/Vertex-0.6-100M-8192-Instruct-GGUF

## Resumen

Vertex-0.6-100M-8192-Instruct es un modelo de lenguaje de 97 millones de parámetros desarrollado por VertexResearch, basado en la arquitectura Qwen3 y diseñado específicamente para inferencia eficiente en entornos con recursos limitados. Su versión GGUF, publicada bajo licencia Apache 2.0, está optimizada para ejecutarse con llama.cpp, lo que permite desplegarlo en CPU, GPU de baja gama o incluso en dispositivos de borde. El modelo ofrece una ventana de contexto de 8192 tokens con RoPE theta de 1M, una característica notable para un modelo de este tamaño.

La relevancia de este modelo radica en su propuesta de llevar capacidades de chat y tool calling a un rango de parámetros donde normalmente predominan modelos de cientos de millones o miles de millones. Su licencia permisiva y su formato GGUF lo convierten en una opción atractiva para desarrolladores que necesitan un modelo ligero, con soporte para ChatML y llamadas a herramientas, sin depender de servicios en la nube. La cuantización Q8_0, recomendada por el autor, reduce el tamaño a 104 MB, lo que lo hace viable incluso en RAM de un solo gigabyte.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 (transformer con atención causal) |
| Parametros totales | 96.752.192 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (RoPE theta 1M) |
| Tipos de cuantizacion | BF16, Q8_0, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q4_1, Q4_0, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp), safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen3, que es un transformer de decodificación autorregresiva con atención causal, normalización RMSNorm y activaciones SwiGLU. La configuración de 97 millones de parámetros es una variante compacta de la familia Qwen3, con una tabla de embeddings que domina el tamaño total del archivo, como señala el autor en la model card. El contexto de 8192 tokens se logra mediante RoPE con theta de 1M, un valor alto que permite extrapolar posiciones más allá del entrenamiento original con menor degradación.

No se han publicado detalles sobre el proceso de entrenamiento en la información disponible. Se desconoce el número de tokens utilizados, la composición del dataset, si se aplicaron técnicas de RLHF o DPO, o si hubo algún ajuste fino adicional. El modelo base es VertexResearch/Vertex-0.6-100M-8192-Instruct, que sí existe en formato safetensors, pero no se han encontrado papers ni documentación técnica al respecto. El formato de chat es ChatML, con los tokens especiales `</s>` y `<|im_end|>` como delimitadores de fin de secuencia.

## Capacidades

- Generación de texto y conversación multi-turno en inglés, siguiendo el formato ChatML.
- Tool calling / function calling: el modelo soporta invocación de herramientas, una capacidad clave para integrarlo en agentes y flujos de trabajo automatizados.
- Inferencia local eficiente: gracias a su tamaño y a las cuantizaciones GGUF, puede ejecutarse en CPU, GPU de baja gama y dispositivos de borde sin necesidad de infraestructura en la nube.
- Ventana de contexto de 8192 tokens: suficiente para mantener conversaciones largas o procesar documentos de tamaño moderado.
- Compatibilidad con llama.cpp: se integra con el ecosistema de herramientas de llama.cpp, incluyendo servidores HTTP y clientes CLI.
- No se han reportado capacidades de visión, audio ni razonamiento multimodal; es un modelo exclusivamente de texto.

## Casos de uso

- Asistente de chat en aplicaciones móviles o de escritorio: al ocupar menos de 100 MB en cuantización Q4, el modelo puede integrarse en aplicaciones que requieren respuestas de texto sin conexión, como un asistente personal de notas o un bot de ayuda en una app de productividad.
- Tool calling en agentes locales: su soporte de function calling permite construir agentes que consulten APIs, bases de datos o ejecuten acciones simples (por ejemplo, buscar en una base de datos local o enviar un correo) desde un script en Python o Node.js usando llama.cpp.
- Filtrado y clasificación de texto en pipelines de datos: su tamaño y velocidad lo hacen útil para tareas de clasificación de correo, categorización de tickets de soporte o extracción de entidades en flujos de procesamiento por lotes.
- Generación de respuestas en foros o sistemas de comentarios moderados: puede pre-generar respuestas a preguntas frecuentes en un sitio web, reduciendo la carga de un modelo más grande y el coste de inferencia.
- Prototipado rápido de aplicaciones de chat: los desarrolladores pueden usarlo como un modelo de arranque para validar el flujo de una aplicación de conversación antes de migrar a un modelo más grande, ya que es rápido de descargar y ejecutar en cualquier máquina.
- Educación y experimentación: su licencia Apache 2.0 y su tamaño lo hacen ideal para estudiar arquitecturas de atención y para hacer fine-tuning con recursos limitados, como un laboratorio universitario o un desarrollador individual.
- Ejecución en dispositivos de borde (edge computing): con 62-65 MB en cuantización Q2_K o Q4_0, el modelo puede caber en microcontroladores o en la RAM de un Raspberry Pi, lo que permite asistentes de voz o de texto en entornos industriales o domóticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo en la model card ni en los resultados de búsqueda web.

## Requisitos de hardware

- VRAM estimada para inferencia: en cuantización Q8_0 (104 MB) cabe en cualquier GPU moderna, incluso en iGPUs. En Q4_0 (65 MB) puede ejecutarse en GPUs con menos de 1 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM (GTX 1050, GTX 1650, RTX 3060, etc.) o simplemente CPU. No se requiere una GPU de gama alta.
- CPU: es viable ejecutarlo en CPU con llama.cpp; el modelo completo (BF16, 195 MB) puede procesar tokens a velocidades de decenas de tokens por segundo en un procesador moderno.
- Opciones de despliegue: llama.cpp (CLI, servidor HTTP), Ollama, llama-cpp-python, o cualquier framework compatible con GGUF. También se puede usar con Transformers cargando el modelo base safetensors.
- Latencia y throughput: no hay datos publicados, pero dado el tamaño del modelo, la latencia es del orden de milisegundos por token en CPU y de microsegundos en GPU, aunque depende del hardware y de la cuantización.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|---|
| Vertex-0.6-100M-8192-Instruct | 97M | 8192 | Qwen3 (transformer) | inglés | Apache 2.0 | GGUF, safetensors |
| Falcon-H1-Tiny-Multilingual-100M-Instruct | 100M | no disponible | Transformer + Mamba (híbrida) | multilingüe | no disponible | GGUF |
| SmolVLM-256M-Instruct | 256M | no disponible | Transformer con visión | multilingüe | no disponible | GGUF |

La comparativa se basa en modelos de tamaño similar disponibles en GGUF. Falcon-H1-Tiny ofrece una arquitectura híbrida con Mamba y soporte multilingüe, mientras que SmolVLM-256M añade capacidades de visión. Vertex se distingue por su arquitectura Qwen3 pura, su contexto de 8192 tokens y su licencia Apache 2.0, pero carece de soporte multilingüe y de visión. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Idioma: el modelo solo soporta inglés. Cualquier entrada en otro idioma degradará significativamente la calidad de las respuestas.
- Tamaño reducido: con 97 millones de parámetros, la capacidad de razonamiento complejo, matemáticas avanzadas o generación de código es limitada en comparación con modelos de 1B o 7B. Es adecuado para tareas simples de conversación y clasificación.
- Riesgo de alucinación: como todos los modelos pequeños, puede generar respuestas plausibles pero incorrectas, especialmente en contextos largos o preguntas de conocimiento general.
- Cuantización: el autor recomienda Q8_0 o superior para mantener calidad, ya que la cuantización de baja precisión (Q2_K, Q3_K) degrada significativamente el rendimiento en modelos pequeños.
- Sin datos de entrenamiento: no se ha publicado información sobre el dataset ni sobre el proceso de entrenamiento, lo que dificulta evaluar sesgos o alucinaciones sistemáticas.
- Sin soporte de visión ni audio: es un modelo de texto puro; no puede procesar imágenes ni sonido.
- Uso comercial: la licencia Apache 2.0 permite uso comercial sin restricciones, pero la ausencia de documentación técnica puede complicar la integración en producción.

## Enlaces

- [HuggingFace: VertexResearch/Vertex-0.6-100M-8192-Instruct-GGUF](https://huggingface.co/VertexResearch/Vertex-0.6-100M-8192-Instruct-GGUF)
- [HuggingFace: VertexResearch/Vertex-0.6-100M-8192-Instruct (modelo base)](https://huggingface.co/VertexResearch/Vertex-0.6-100M-8192-Instruct)
- [ModelFitCheck — herramienta para comprobar si un modelo cabe en tu GPU](https://modelfitcheck.com/)
- [GGUF Model Discovery: buscador de modelos GGUF](https://local-ai-zone.github.io/)
- [Falcon-H1-Tiny-Multilingual-100M-Instruct-GGUF (modelo comparable)](https://huggingface.co/Luigi/Falcon-H1-Tiny-Multilingual-100M-Instruct-GGUF)
- [Mungert/SmolVLM-256M-Instruct-GGUF (modelo comparable)](https://huggingface.co/Mungert/SmolVLM-256M-Instruct-GGUF)
