# worldboss/lauki-qna-gemma3-270m-it-gguf

## Resumen

El modelo `worldboss/lauki-qna-gemma3-270m-it-gguf` es una adaptación del modelo base `unsloth/gemma-3-270m-it` de Google, especializado mediante fine-tuning con LoRA (Low-Rank Adaptation) sobre un conjunto de datos de soporte al cliente de la empresa ficticia Lauki Phones. El resultado se exporta en formato GGUF con cuantización Q8_0, lo que permite su ejecución eficiente en CPU y GPU de bajo consumo mediante herramientas como llama.cpp u Ollama.

Este modelo resuelve el problema de crear un asistente conversacional ligero y específico para atención al cliente, capaz de responder preguntas frecuentes sobre productos y servicios de telefonía móvil. Su relevancia radica en que demuestra cómo un modelo de solo 268 millones de parámetros puede adaptarse a un dominio concreto con un coste de entrenamiento mínimo, manteniendo un rendimiento aceptable para tareas de FAQ y soporte básico. Está pensado para despliegues en entornos con recursos limitados, como dispositivos embebidos o servidores de baja capacidad.

La arquitectura es un transformer denso basado en Gemma 3, con una ventana de contexto que no se especifica en la información disponible, aunque el modelo base Gemma 3 270M soporta hasta 8.000 tokens según la documentación oficial de Google. El repositorio contiene un único archivo GGUF de 0,3 GB, lo que lo hace adecuado para inferencia local en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Gemma 3) |
| Parametros totales | 268.098.176 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el modelo base Gemma 3 270M soporta 8.000 tokens) |
| Tipos de cuantizacion | Q8_0 (único archivo incluido) |
| Idiomas soportados | en (inglés) |
| Licencia | Gemma (términos de uso de Google) |
| Formato de pesos | GGUF (llama.cpp compatible) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Gemma 3 de Google, un transformer causal con normalización RMS, atención multi-cabeza y activación GeGLU. El modelo base `unsloth/gemma-3-270m-it` es la versión instruct de 270 millones de parámetros, optimizada para seguir instrucciones y mantener conversaciones. Sobre este base se aplicó un fine-tuning con LoRA, una técnica de adaptación de bajo rango que solo entrena un subconjunto reducido de parámetros, reduciendo drásticamente el coste computacional y de memoria.

El entrenamiento se realizó con la librería Unsloth, especializada en fine-tuning eficiente de modelos de lenguaje. El dataset utilizado, `worldboss/lauki-qna`, contiene pares de preguntas y respuestas sobre productos y servicios de Lauki Phones, una empresa ficticia de telefonía. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas adicionales como RLHF o DPO. El resultado se exportó a GGUF con cuantización Q8_0, que mantiene una fidelidad alta respecto a los pesos originales (8 bits por peso) y es compatible con llama.cpp y Ollama.

## Capacidades

- Generación de texto conversacional: responde preguntas y mantiene diálogos multi-turno en inglés, especializado en el dominio de soporte al cliente de telefonía.
- Seguimiento de instrucciones: al estar basado en Gemma 3 instruct, hereda la capacidad de seguir instrucciones explícitas, aunque limitada por su tamaño reducido.
- Conocimiento específico de dominio: entrenado con datos de Lauki Phones, puede responder sobre características de productos, políticas de garantía, soporte técnico básico, etc.
- Inferencia eficiente: al ser un modelo pequeño (268M) en formato GGUF Q8_0, puede ejecutarse en CPU sin GPU, en dispositivos con poca memoria y en tiempo real.
- Integración con herramientas estándar: compatible con llama.cpp, Ollama y cualquier runtime que soporte GGUF.
- No soporta tool calling, function calling, visión, audio ni razonamiento multi-paso avanzado, dado el tamaño y la naturaleza del modelo.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones de soporte básico en una web o aplicación móvil, respondiendo preguntas frecuentes sobre productos, envíos, devoluciones o garantías. Su tamaño reducido permite desplegarlo en un servidor de bajo coste o incluso en el propio dispositivo del usuario.
- Chatbot de FAQ para empresas de telefonía: integrado en un sitio web, responde de forma inmediata a consultas como "¿Soporta eSIM?" o "¿Cuál es el tiempo de entrega?", reduciendo la carga del equipo humano.
- Asistente de ventas en línea: guía al cliente durante el proceso de compra, recomendando productos según las necesidades expresadas y resolviendo dudas sobre compatibilidad o precios.
- Prototipado rápido de asistentes conversacionales: al ser un modelo pequeño y fácil de ajustar, sirve como punto de partida para validar flujos de conversación antes de invertir en modelos más grandes.
- Inferencia en dispositivos edge: ejecutable en Raspberry Pi, teléfonos móviles o routers con suficiente memoria, permite crear asistentes offline que no dependen de conexión a internet.
- Evaluación de técnicas de fine-tuning: útil como banco de pruebas para comparar metodologías de adaptación (LoRA, QLoRA, etc.) en un entorno de bajo coste y con un dataset pequeño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona métricas como MMLU, HumanEval o GSM8K para este modelo. La única referencia de rendimiento es la comparativa visual disponible en el espacio de Hugging Face `worldboss/lauki-qna-fine-tuned-gemma3-live`, que muestra respuestas del modelo base y del fine-tuned lado a lado, pero sin métricas cuantitativas.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF Q8_0 ocupa aproximadamente 0,3 GB, por lo que la inferencia puede realizarse con menos de 1 GB de VRAM en GPU, o incluso en CPU con 2-4 GB de RAM libre.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM, como NVIDIA GTX 1050, GTX 1650, RTX 2060 o superiores. También funciona en iGPUs modernas y en Apple Silicon.
- Compatibilidad con consumer GPU: sí, cabe en cualquier GPU de consumo actual, incluso en las más básicas.
- Opciones de despliegue: llama.cpp (CLI y servidor), Ollama (creando un Modelfile), llama-cpp-python, y cualquier runtime compatible con GGUF (llama.cpp, LM Studio, etc.).
- Latencia y throughput: al ser un modelo de 268M parámetros, la generación es muy rápida. En una CPU moderna (por ejemplo, un Intel i5 de 12ª generación) se pueden esperar decenas de tokens por segundo; en una GPU dedicada, cientos. No se dispone de mediciones exactas del autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Especialización |
|---|---|---|---|---|---|
| `worldboss/lauki-qna-gemma3-270m-it-gguf` | 268M | no disponible (base: 8k) | Gemma | GGUF Q8_0 | Soporte al cliente Lauki Phones |
| `unsloth/gemma-3-270m-it` (base) | 268M | 8k | Gemma | safetensors | Instrucción general |
| `google/gemma-3-270m` | 268M | 8k | Gemma | safetensors | Modelo base sin instrucciones |
| `microsoft/phi-3-mini-4k-instruct` | 3.8B | 4k | MIT | safetensors, GGUF | Instrucción general |

La comparativa muestra que este modelo es significativamente más pequeño que alternativas como Phi-3 Mini, lo que lo hace más adecuado para entornos con restricciones extremas de memoria. Su ventaja frente al base Gemma 3 270M es la especialización en el dominio de Lauki Phones, que mejora la precisión en preguntas específicas de ese contexto, aunque pierde generalidad. No se dispone de datos de rendimiento comparativo entre estos modelos.

## Limitaciones y advertencias

- Sesgos conocidos: al estar entrenado únicamente con un dataset de soporte al cliente de una empresa ficticia, el modelo puede mostrar sesgos hacia ese dominio y no generalizar bien a otros temas. No se han evaluado sesgos de género, raza o religión.
- Riesgo de alucinación: como cualquier modelo de lenguaje pequeño, puede generar respuestas plausibles pero incorrectas, especialmente en temas fuera de su dominio de entrenamiento. Se recomienda validar las respuestas en producción.
- Limitaciones de contexto: la ventana de contexto no se especifica en el repositorio, aunque el modelo base soporta 8.000 tokens. Para conversaciones largas, puede perder información de los primeros turnos.
- Limitaciones de idioma: solo está entrenado en inglés. No se recomienda su uso en otros idiomas sin un fine-tuning adicional.
- Restricciones de licencia: la licencia Gemma de Google permite uso comercial, pero impone restricciones sobre el uso para ciertos fines (por ejemplo, no se permite su uso en aplicaciones militares o de vigilancia). Es necesario revisar los términos completos antes de desplegar en producción.
- Caveat de producción: al ser un modelo de 268M, su capacidad de razonamiento complejo es limitada. No es adecuado para tareas que requieran comprensión profunda, matemáticas avanzadas o generación de código complejo.

## Enlaces

- Repositorio del modelo: https://huggingface.co/worldboss/lauki-qna-gemma3-270m-it-gguf
- Dataset de entrenamiento: https://huggingface.co/datasets/worldboss/lauki-qna
- Espacio de comparativa en vivo: https://huggingface.co/spaces/worldboss/lauki-qna-fine-tuned-gemma3-live
- Modelo base (Unsloth): https://huggingface.co/unsloth/gemma-3-270m-it
- Modelo base (Google): https://huggingface.co/google/gemma-3-270m
- Guía de Gemma 3 de Unsloth: https://unsloth.ai/docs/models/tutorials/gemma-3-how-to-run-and-fine-tune
- Página oficial de Gemma 3 (DeepMind): https://deepmind.google/models/gemma/gemma-3/
- Blog de Google Developers sobre Gemma 3 270M: https://developers.googleblog.com/en/introducing-gemma-3-270m/
