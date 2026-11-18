# ymarpro/Qwen2.5-Coder-32B-Instruct-Uncensored-Q4_K_M-GGUF

## Resumen

Este repositorio contiene una cuantización GGUF en formato Q4_K_M del modelo `thirdeyeai/Qwen2.5-Coder-32B-Instruct-Uncensored`, un fine-tune sin censura del Qwen2.5-Coder-32B-Instruct de Alibaba. El autor de la cuantización es el usuario de Hugging Face `ymarpro`, que ha utilizado el espacio `GGUF-my-repo` de ggml.ai para convertir los pesos originales a formato GGUF compatible con llama.cpp. El resultado es un único fichero de aproximadamente 19,9 GB pensado para inferencia local en CPU o GPU con llama.cpp.

El modelo subyacente es un transformer denso de 32.763.876.352 parámetros (unos 32,8 mil millones), derivado de la familia Qwen2.5-Coder, especializada en generación de código, razonamiento y tareas de instrucciones. La variante "Uncensored" implica que el fine-tune ha reducido o eliminado las capas de alineación y rechazo del modelo original, lo que afecta directamente a su comportamiento en producción y a las consideraciones éticas de su uso.

La relevancia de esta ficha es doble: por un lado, documenta una cuantización concreta de un modelo de código de 32B que puede ejecutarse en hardware de consumo de gama alta; por otro, advierte de que la información publicada por el autor es mínima (sin licencia declarada, sin idiomas, sin benchmarks ni detalles de entrenamiento), por lo que muchas especificaciones deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen2.5-Coder-32B-Instruct) |
| Parametros totales | 32.763.876.352 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-Coder soporta 32.768 tokens nativos, ampliable; no confirmado por el autor de esta cuantizacion) |
| Tipos de cuantizacion | Q4_K_M (unica variante publicada en este repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (fichero `qwen2.5-coder-32b-instruct-uncensored-q4_k_m.gguf`) |
| Tamano del repo | 19,9 GB |
| Libreria declarada | transformers (tag), uso real via llama.cpp |
| Modelo base | thirdeyeai/Qwen2.5-Coder-32B-Instruct-Uncensored |

## Arquitectura y entrenamiento

La arquitectura del modelo subyacente corresponde a la familia Qwen2.5-Coder, un transformer decoder-only denso con atención por ventanas deslizantes combinada con atención completa en algunas capas, normalización RMSNorm y activación SwiGLU. El modelo original Qwen2.5-Coder-32B-Instruct fue entrenado por Alibaba con un corpus masivo de código y texto, e incluye fases de instrucción y alineación. Sin embargo, el fine-tune "Uncensored" de `thirdeyeai` no documenta en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o abliteration. Tampoco se detalla qué capas o direcciones de rechazo se modificaron.

La cuantización Q4_K_M aplicada por `ymarpro` es una de las variantes de 4 bits con quantización mixta de llama.cpp: mantiene los tensores más sensibles (por ejemplo, algunas matrices de atención y embeddings) en mayor precisión y comprime el resto, buscando un equilibrio entre tamaño (19,9 GB) y calidad. No se han publicado métricas de perplejidad ni evaluaciones de degradación tras la cuantización en la información disponible.

## Capacidades

- Generación de código en múltiples lenguajes de programación, heredada del modelo base Qwen2.5-Coder.
- Razonamiento sobre instrucciones y conversación multi-turno (tag `conversational`).
- Completado de código, explicación de fragmentos y refactorización.
- Capacidad de seguir instrucciones detalladas en formato chat.
- Al no estar alineado con rechazos, puede producir contenido que el modelo original rechazaría (ver limitaciones).
- Soporte de tool calling / function calling: no confirmado en la información disponible para esta variante.
- Capacidades de agente y razonamiento multi-paso: no documentadas específicamente para el fine-tune.
- Capacidades multilingües: no disponibles.
- Modo thinking, visión o audio: no disponibles (el modelo base es solo texto).

## Casos de uso

- Asistente de código en local para desarrolladores con GPU de consumo: al estar en GGUF Q4_K_M, puede ejecutarse con llama.cpp en una RTX 4090 (24 GB) o en configuraciones con offloading parcial a CPU, permitiendo autocompletado y explicación de código sin enviar datos a la nube.
- Generación de tests unitarios y documentación técnica: el modelo puede recibir un fragmento de código y producir docstrings, comentarios y casos de prueba, integrándose en pipelines locales de CI.
- Exploración de código legacy: con un contexto amplio (sujeto al límite del modelo base), puede resumir módulos, detectar dependencias y proponer refactorizaciones en bases de código grandes.
- Investigación sobre alineación y seguridad: al ser una variante "uncensored", es útil para estudiar diferencias de comportamiento frente al modelo original en tareas de rechazo, sesgo y jailbreak, siempre en entornos controlados.
- Prototipado de chatbots técnicos sin restricciones de contenido para dominios legítimos (por ejemplo, análisis de vulnerabilidades o red teaming autorizado), donde el modelo original podría negarse a responder.
- Despliegue en entornos air-gapped: al ser un fichero GGUF único, puede copiarse a máquinas sin conexión y servirse con `llama-server`, útil en entornos industriales o de defensa con requisitos de confidencialidad.
- Fine-tuning posterior o destilación: los pesos cuantizados no son ideales para reentrenar, pero el repositorio base en safetensors puede servir como punto de partida para adaptaciones LoRA (requiere acudir al modelo original, no a esta cuantización).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero Q4_K_M ocupa 19,9 GB; con overhead de contexto y KV cache se recomiendan al menos 22-24 GB de VRAM para carga completa en GPU.
- GPU recomendadas: RTX 4090 (24 GB) para carga completa; A100 40/80 GB, H100 o L40S para mayor throughput y contextos largos.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) y, con offloading parcial a CPU, en GPUs de 12-16 GB (RTX 4080, 4070 Ti, etc.), a costa de menor velocidad.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama (importando el GGUF), y otros runners compatibles con GGUF. vLLM y TGI no soportan GGUF de forma nativa para este formato; requerirían los pesos originales en safetensors.
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependerán del hardware y del tamaño de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| ymarpro/Qwen2.5-Coder-32B-Instruct-Uncensored-Q4_K_M-GGUF | 32,8B | no disponible | GGUF Q4_K_M | no disponible | Cuantizacion del fine-tune uncensored |
| Qwen2.5-Coder-32B-Instruct (original) | 32,8B | 32.768 nativos (ampliable) | safetensors, GGUF | Apache 2.0 (segun el modelo original de Alibaba) | Alineado y con benchmarks publicos |
| thirdeyeai/Qwen2.5-Coder-32B-Instruct-Uncensored | 32,8B | no disponible | safetensors | no disponible | Modelo base de esta cuantizacion |
| DeepSeek-Coder-V2-Lite-Instruct | 16B (MoE, 2,4B activos) | 128K | safetensors, GGUF | licencia propia de DeepSeek | Alternativa MoE mas ligera en activos |

## Limitaciones y advertencias

- La variante "Uncensored" elimina o reduce los mecanismos de rechazo, por lo que puede generar contenido ofensivo, ilegal o peligroso; no es adecuada para aplicaciones de cara al público sin filtros adicionales.
- Riesgo elevado de alucinación en código y hechos, agravado por la falta de benchmarks publicados tras el fine-tune y la cuantización.
- La cuantización Q4_K_M introduce degradación respecto a los pesos originales en precisión completa; no se han publicado métricas de perplejidad ni evaluaciones comparativas.
- Licencia no declarada: no se puede confirmar si el uso comercial está permitido; hay que remitirse al modelo base `thirdeyeai/Qwen2.5-Coder-32B-Instruct-Uncensored` y, en última instancia, a la licencia de Qwen2.5-Coder (Apache 2.0 en el original), pero la variante uncensored puede tener condiciones distintas no documentadas.
- Idiomas soportados no documentados; el comportamiento multilingüe puede diferir del modelo original.
- Longitud de contexto no confirmada para esta variante; el autor no la especifica y el ejemplo de `llama-server` usa `-c 2048`, lo que sugiere que no se ha validado con contextos largos.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni reportes de calidad.
- Sin información sobre sesgos específicos del fine-tune; los sesgos del modelo original pueden persistir o amplificarse al eliminar la alineación.
- Fecha de creación declarada como 2026-11-18, posterior a la fecha actual de muchas consultas; conviene verificar la integridad y procedencia del repositorio antes de usarlo en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ymarpro/Qwen2.5-Coder-32B-Instruct-Uncensored-Q4_K_M-GGUF
- Modelo base del fine-tune: https://huggingface.co/thirdeyeai/Qwen2.5-Coder-32B-Instruct-Uncensored
- Espacio GGUF-my-repo de ggml.ai: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
- Modelo original Qwen2.5-Coder-32B-Instruct (referencia de la familia): no disponible en la informacion proporcionada como enlace directo; se puede localizar en el Hub de Hugging Face bajo el organizador Qwen.
