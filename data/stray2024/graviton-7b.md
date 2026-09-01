# Stray2024/Graviton-7B

## Resumen

Graviton-7B es un modelo de lenguaje de 7.600 millones de parámetros publicado por el usuario Stray2024 en Hugging Face. Se trata de un ajuste fino (finetune) del modelo Qwen2.5-Coder-7B-Instruct, convertido posteriormente al formato GGUF mediante la librería Unsloth. El modelo está pensado para su ejecución local con llama.cpp o Ollama, ofreciendo una alternativa ligera para tareas de generación y comprensión de código.

La relevancia de este modelo radica en su formato GGUF, que permite desplegarlo en hardware de consumo con herramientas como llama.cpp, Ollama o LM Studio. Al estar basado en Qwen2.5-Coder-7B-Instruct, hereda teóricamente las capacidades de razonamiento y generación de código de dicho modelo base, aunque no se proporciona documentación adicional sobre el proceso de ajuste fino ni sobre las características específicas del finetune.

El repositorio incluye un único archivo de pesos cuantizado en Q4_K_M, lo que facilita su uso en entornos con recursos limitados. No se han publicado métricas de rendimiento, detalles del dataset de entrenamiento ni información sobre la licencia, lo que limita su evaluación objetiva.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen2.5-Coder-7B-Instruct) |
| Parametros totales | 7.615.616.512 (7,6B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo base Qwen2.5-Coder-7B-Instruct soporta 32K, pero no se confirma para este finetune) |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | No disponible (el modelo base es multilingue, pero no se especifica) |
| Licencia | No disponible |
| Formato de pesos | GGUF (safetensors no incluido) |

## Arquitectura y entrenamiento

Graviton-7B es un ajuste fino del modelo Qwen2.5-Coder-7B-Instruct, que emplea una arquitectura transformer densa con atención causal estándar. El modelo base de Qwen2.5-Coder-7B-Instruct fue entrenado con un enfoque en generación de código, razonamiento matemático y comprensión de instrucciones, y cuenta con una ventana de contexto de 32K tokens.

El proceso de ajuste fino se realizó con la librería Unsloth, que optimiza el entrenamiento mediante kernels de atención y técnicas de cuantización durante el entrenamiento. Posteriormente, los pesos se convirtieron a formato GGUF con cuantización Q4_K_M. No se han publicado detalles sobre el dataset utilizado, el número de tokens de entrenamiento, ni si se aplicaron técnicas como RLHF o DPO. Tampoco se especifica si el ajuste fino mantiene íntegramente la ventana de contexto original.

## Capacidades

- Generación de código: al estar basado en Qwen2.5-Coder-7B-Instruct, se espera que herede la capacidad de completar, generar y explicar código en múltiples lenguajes de programación.
- Razonamiento y comprensión de instrucciones: el modelo base está optimizado para seguir instrucciones y resolver tareas de razonamiento lógico y matemático.
- Conversación: el tag "conversational" sugiere que el finetune está orientado a diálogo, aunque no se detalla en qué se diferencia del modelo base.
- Soporte de tool calling: no confirmado; el modelo base Qwen2.5-Coder-7B-Instruct no incluye soporte nativo de function calling, por lo que es probable que este finetune tampoco lo tenga.
- Capacidades multilingües: no confirmadas; el modelo base soporta varios idiomas, pero no se especifica si el finetune los conserva.
- Modo de razonamiento extendido: no disponible.

## Casos de uso

- Asistente de programación local: gracias a su formato GGUF y cuantización Q4_K_M, puede ejecutarse en una GPU de consumo para ofrecer autocompletado de código, explicación de fragmentos o generación de funciones en un IDE.
- Chat técnico sin conexión: al ser un modelo conversacional, puede integrarse en aplicaciones de chat local para responder preguntas sobre programación o documentación técnica.
- Automatización de tareas de scripting: puede generar scripts de shell, Python o SQL a partir de descripciones en lenguaje natural, útil en entornos de desarrollo sin acceso a APIs externas.
- Educación y formación: sirve como tutor de programación en entornos educativos donde se requiera privacidad y ejecución local.
- Prototipado rápido: permite generar esqueletos de código o plantillas para proyectos pequeños sin depender de servicios en la nube.
- Análisis de código existente: puede resumir o documentar funciones y clases, aunque su capacidad para manejar contextos largos no está confirmada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras métricas estándar para este modelo. Tampoco se han realizado comparaciones con otros modelos en la documentación del repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q4_K_M ocupa aproximadamente 4,7 GB en disco. Para inferencia con llama.cpp, se recomienda al menos 6 GB de VRAM para dejar margen a los key-value caches y overhead del runtime.
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM, como NVIDIA RTX 3060, RTX 4060, RTX 4070, o GPUs de gama alta como A100 o H100 si se requiere mayor throughput.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de 8 GB, aunque la velocidad dependerá de la memoria y el ancho de banda.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama (incluye Modelfile), LM Studio, y cualquier runtime compatible con GGUF.
- Latencia y throughput estimados: no disponibles. Dependerá del hardware y de la longitud de la secuencia generada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Graviton-7B (este) | 7,6B | No disponible | GGUF Q4_K_M | No disponible | Finetune de Qwen2.5-Coder-7B-Instruct |
| Qwen2.5-Coder-7B-Instruct | 7,6B | 32K | safetensors, GGUF | Apache 2.0 | Modelo base, sin finetune adicional |
| CodeLlama-7B-Instruct | 6,7B | 16K | safetensors, GGUF | Llama 2 license | Modelo de Meta, orientado a código |
| DeepSeek-Coder-7B-Instruct | 6,7B | 16K | safetensors, GGUF | DeepSeek License | Modelo de DeepSeek, especializado en código |

La comparativa se basa en las características de los modelos base, ya que no hay datos de rendimiento específicos de Graviton-7B. La principal diferencia con sus alternativas es el formato GGUF y la cuantización Q4_K_M, que facilitan su uso en hardware modesto, pero la falta de documentación sobre el finetune impide evaluar si aporta mejoras reales sobre el modelo base.

## Limitaciones y advertencias

- Falta de documentación: no se proporciona información sobre el dataset de entrenamiento, el método de ajuste fino, ni los objetivos del finetune. Esto dificulta evaluar su calidad y comportamiento.
- Sesgos del modelo base: al derivar de Qwen2.5-Coder-7B-Instruct, puede heredar sesgos presentes en los datos de entrenamiento de dicho modelo, como preferencias por ciertos estilos de código o limitaciones en idiomas minoritarios.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar código o explicaciones incorrectas o inventadas, especialmente en dominios poco representados en sus datos de entrenamiento.
- Contexto no confirmado: aunque el modelo base soporta 32K tokens, no se garantiza que el finetune mantenga esa longitud. Es recomendable probar con secuencias largas antes de usarlo en producción.
- Licencia incierta: al no especificarse la licencia, no se puede garantizar su uso comercial. Se recomienda contactar con el autor antes de utilizarlo en proyectos comerciales.
- Soporte de tool calling no verificado: si se necesita integración con herramientas externas, este modelo podría no ser adecuado sin pruebas adicionales.
- Sin benchmarks: la ausencia de métricas de rendimiento impide compararlo objetivamente con otros modelos de su categoría.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Stray2024/Graviton-7B
- Perfil del autor: https://huggingface.co/Stray2024
- Repositorio de Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
- Documentación de llama.cpp: https://github.com/ggerganov/llama.cpp
- Documentación de Ollama: https://ollama.com/
