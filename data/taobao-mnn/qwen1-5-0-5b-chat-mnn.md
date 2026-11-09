# taobao-mnn/Qwen1.5-0.5B-Chat-MNN

## Resumen

Qwen1.5-0.5B-Chat-MNN es una exportación cuantizada a 4 bits del modelo Qwen1.5-0.5B-Chat de Alibaba, empaquetada en el formato del motor de inferencia MNN (Mobile Neural Network) desarrollado por el equipo de Taobao/Alibaba. No se trata de un modelo nuevo entrenado desde cero, sino de una conversión del checkpoint original (publicado en ModelScope) mediante la herramienta `llmexport` del repositorio MNN, pensada para ejecutar el modelo en dispositivos con recursos limitados usando el runtime MNN en lugar de frameworks como PyTorch o llama.cpp.

El modelo subyacente es un transformer decoder-only de aproximadamente 0,5 mil millones de parámetros, ajustado con instrucciones (instruction-tuned) para tareas de chat y generación de texto. Su interés radica en que permite desplegar un modelo conversacional en CPU (incluidos dispositivos móviles y embebidos) gracias a la cuantización de pesos lineales y del LM head a 4 bits con grupo de 128, junto con fusiones de proyección y normalización.

La revisión de noviembre de 2026 (MNN 3.6.2) actualiza el export con HQQ, fusión de transformer y embeddings de entrada separados en BF16, y exige MNN 3.6.2 o superior. La licencia es la Tongyi Qianwen Research License, de uso exclusivamente no comercial salvo licencia separada de Alibaba Cloud, lo que limita su adopción en producción comercial sin acuerdo adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (model-type: transformer) |
| Parametros totales | ~0,5 mil millones (modelo base Qwen1.5-0.5B-Chat) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (validado hasta ~900 tokens en pruebas de traduccion) |
| Tipos de cuantizacion | 4 bits con grupo 128 en pesos lineales y LM head; embeddings de entrada en BF16 |
| Idiomas soportados | chino (cn); el modelo base Qwen1.5 es multilingue pero la ficha solo declara cn |
| Licencia | other (Tongyi Qianwen Research License, solo uso no comercial salvo licencia de Alibaba Cloud) |
| Formato de pesos | MNN (formato propietario del runtime MNN); repo de 1,1 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de ~0,5B parámetros, derivado del checkpoint Qwen1.5-0.5B-Chat de Alibaba, que fue ajustado con instrucciones sobre el modelo base Qwen1.5. La exportación a MNN aplica cuantización de 4 bits con grupo de 128 a los pesos lineales y al LM head, mantiene los embeddings de entrada en BF16 y aplica fusiones de proyección y normalización, además de soporte de transformer fusion en el runtime. La revisión de 2026-11-09 se generó con el commit `b0239771b07b317a258fbc384683bbd540741406` de MNN e incorpora HQQ (Half-Quadratic Quantization) y C4.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en esta ficha; esos datos corresponden al modelo original y no se detallan en la información proporcionada. La validación de la exportación se limitó a CPU x64, comprobando alineación FP32 entre prefill y decode, plantillas de chat, IDs de token, generación en chino, aritmética, traducción corta y de contexto de ~900 tokens, parada natural e integridad de pesos externos. Las rutas ARM CPU FP16, Metal, OpenCL, Vulkan y CUDA no fueron validadas en esta revisión.

## Capacidades

- Generación de texto conversacional en chino, con plantilla de chat incluida.
- Razonamiento básico y aritmética (validado en pruebas de correctness del export).
- Traducción corta y de contexto medio (~900 tokens) según la validación del autor.
- Ajuste a instrucciones (instruction-tuned) para diálogo multi-turno.
- Ejecución en CPU x64 mediante el runtime MNN con `llm_demo`.
- Soporte de parada natural de generación y muestreo configurable (greedy solo para tests de correctness).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Asistente conversacional en dispositivos móviles o embebidos: el modelo, cuantizado a 4 bits y ejecutado con MNN en CPU, permite integrar un chatbot en chino dentro de apps Android/iOS o dispositivos con poca memoria, sin depender de GPU ni de servicios en la nube.
- Prototipado rápido de pipelines de chat en local: gracias a la compilación sencilla de MNN (`llm_demo`) y al tamaño reducido del repo (1,1 GB), sirve para validar plantillas de prompt y flujos de conversación antes de escalar a modelos mayores.
- Traducción y generación de texto en chino en entornos sin conectividad: al ejecutarse en CPU x64 validada, puede desplegarse en portátiles o servidores de borde para tareas de traducción corta y resumen.
- Pruebas de integración de MNN en CI: el export incluye comprobaciones de alineación FP32 y de integridad de pesos, útil para equipos que desarrollan sobre MNN y necesitan un modelo de referencia pequeño.
- Educación y experimentación: su tamaño y licencia de investigación lo hacen adecuado para laboratorios y cursos que estudian cuantización, fusión de operadores y despliegue en CPU.
- Evaluación comparativa de runtimes: sirve como banco de pruebas para medir latencia y consumo de memoria de MNN frente a otros motores en el mismo hardware, dado que el modelo base es pequeño y conocido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo describe pruebas de correctness (alineación FP32, generación en chino, aritmética, traducción y parada natural) en CPU x64, sin métricas de precisión tipo MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al ejecutarse en CPU, el consumo relevante es RAM. El repo pesa 1,1 GB y los pesos lineales están a 4 bits con grupo 128, por lo que la huella en memoria es reducida (del orden de cientos de MB, sin cifra oficial).
- GPU recomendadas: no se documentan; la validación oficial se hizo en CPU x64. Las rutas CUDA, Metal, OpenCL y Vulkan no fueron validadas en esta revisión.
- ¿Cabe en GPU consumer? No hay datos oficiales; por tamaño (0,5B) cabría en cualquier GPU consumer, pero el export está orientado a CPU y no se ha validado en GPU.
- Opciones de despliegue: runtime MNN (compilación con `MNN_LOW_MEMORY`, `MNN_CPU_WEIGHT_DEQUANT_GEMM`, `MNN_BUILD_LLM`, `MNN_SUPPORT_TRANSFORMER_FUSE`), ejecutable `llm_demo`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen1.5-0.5B-Chat-MNN | ~0,5B | no disponible | MNN (4 bits) | Tongyi Qianwen Research (no comercial) | Export MNN para CPU, validado en x64 |
| Qwen1.5-0.5B-Chat (original) | ~0,5B | no disponible en esta ficha | safetensors (PyTorch) | Tongyi Qianwen Research | Checkpoint de referencia en ModelScope |
| Otros modelos ~0,5B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Licencia Tongyi Qianwen Research License: uso no comercial únicamente salvo licencia separada de Alibaba Cloud; restringe despliegues comerciales.
- Modelo de 0,5B parámetros: capacidad de razonamiento y conocimiento limitada frente a modelos mayores; riesgo elevado de alucinación en tareas complejas.
- Idioma declarado: chino (cn); el rendimiento en castellano u otros idiomas no está validado en esta ficha.
- Contexto validado solo hasta ~900 tokens en pruebas de traducción; la longitud máxima de contexto no se especifica.
- Requiere MNN 3.6.2 o superior con soporte de transformer fusion; runtimes anteriores no son compatibles.
- Solo validado en CPU x64; ARM CPU FP16, Metal, OpenCL, Vulkan y CUDA no han sido validados en esta revisión.
- Las pruebas del autor son de correctness, no de precisión; no garantizan identidad token a token con el modelo sin cuantizar.
- Es necesario descargar todos los archivos actualizados juntos y limpiar cachés de modelo/pesos/KV antes de cargar; no mezclar con revisiones anteriores.
- Formato MNN propietario: no es directamente usable en ecosistemas PyTorch/GGUF sin conversión.

## Enlaces

- Hugging Face: https://huggingface.co/taobao-mnn/Qwen1.5-0.5B-Chat-MNN
- Modelo original en ModelScope: https://modelscope.cn/models/qwen/Qwen1.5-0.5B-Chat/summary
- Repositorio MNN: https://github.com/alibaba/MNN
- Herramienta llmexport: https://github.com/alibaba/MNN/tree/master/transformers/llm/export
- Documentación MNN-LLM: https://mnn-docs.readthedocs.io/en/latest/transformers/llm.html
- Descarga vía ModelScope (MNN/Qwen1.5-0.5B-Chat-MNN): https://www.modelscope.cn/models/MNN/Qwen1.5-0.5B-Chat-MNN
