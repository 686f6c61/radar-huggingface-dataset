# taobao-mnn/Qwen2-0.5B-Instruct-MNN

## Resumen

Qwen2-0.5B-Instruct-MNN es una exportación cuantizada a 4 bits del modelo Qwen2-0.5B-Instruct de Alibaba, empaquetada en el formato del motor de inferencia MNN (Mobile Neural Network) también desarrollado por Alibaba. El modelo original es un transformer decoder-only de 0,5 mil millones de parámetros, ajustado por instrucciones, orientado a generación de texto y conversación en chino e inglés. Esta versión MNN está pensada para ejecución en dispositivos con recursos limitados (CPU x64, ARM, móvil) usando el runtime ligero de MNN en lugar de frameworks como PyTorch o vLLM.

La relevancia de esta ficha radica en que no se trata de un modelo nuevo, sino de una distribución de despliegue: el interés está en la cuantización 4-bit con HQQ, la fusión de capas (projection/norm fusion) y la integración con MNN-LLM para inferencia en CPU. La revisión de noviembre de 2026 (MNN 3.6.2) actualiza el exportador y valida alineamiento FP32 prefill/decode en CPU x64, pero deja sin validar los backends ARM FP16, Metal, OpenCL, Vulkan y CUDA.

El modelo es útil para prototipos de asistentes conversacionales en chino, pruebas de despliegue en entornos sin GPU y experimentación con cuantización agresiva en hardware modesto. No está pensado para cargas de producción de alta exigencia ni para tareas que requieran razonamiento complejo o contexto muy largo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen2-0.5B-Instruct) |
| Parametros totales | 0,5 mil millones (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2 soporta contexto largo, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | 4-bit group 128 (HQQ) en pesos lineales y LM head; embeddings de entrada en BF16 separados |
| Idiomas soportados | chino (cn); el modelo base Qwen2 es multilingue pero esta ficha solo declara cn |
| Licencia | Apache 2.0 |
| Formato de pesos | MNN (formato propio del runtime MNN); no se distribuyen safetensors ni GGUF en este repo |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen2-0.5B-Instruct, un transformer decoder-only de 0,5B parámetros ajustado por instrucciones. Esta distribución concreta no aporta información sobre el entrenamiento original (número de tokens, composición del dataset, RLHF/DPO); esos detalles corresponden a la model card de Qwen2-0.5B-Instruct, no incluida aquí.

La innovación técnica de esta versión es el proceso de exportación con `llmexport` de MNN: cuantización 4-bit con HQQ (Half-Quadratic Quantization), group size 128, fusión de proyecciones y normalizaciones, y separación de los embeddings de entrada en BF16. La revisión de MNN 3.6.2 (commit `b0239771b07b317a258fbc384683bbd540741406`) exige ese runtime o superior con soporte de transformer fusion; versiones anteriores no son compatibles. Se verificó alineamiento FP32 prefill/decode entre fuente y exportador, plantillas de chat, IDs de token, generación en chino, aritmética, traducción corta y traducción con contexto de ~900 tokens, parada natural e integridad de pesos externos en CPU x64. No se validaron ARM CPU FP16, Metal, OpenCL, Vulkan ni CUDA en esta revisión.

## Capacidades

- Generación de texto conversacional en chino (y presumiblemente inglés, por herencia del modelo base, aunque la ficha solo declara cn).
- Ajuste por instrucciones: responde a prompts en formato chat con plantilla propia.
- Aritmética básica y traducción corta, verificadas en las pruebas de correctitud del exportador.
- Traducción con contexto de aproximadamente 900 tokens, según la validación declarada.
- Parada natural de generación (natural stopping).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking en la información disponible.
- Capacidades multilingües: solo se declara chino; el resto no está confirmado en esta ficha.

## Casos de uso

- Asistente conversacional embebido en aplicaciones móviles o de escritorio: el modelo cabe en el runtime MNN y puede ejecutarse en CPU sin GPU, lo que permite integrar un chatbot en chino dentro de apps con presupuesto de memoria reducido.
- Despliegue en dispositivos de borde (edge computing): con cuantización 4-bit y MNN-LLM, es viable en equipos x64 de bajas prestaciones o en ARM (aunque ARM FP16 no está validado en esta revisión), para tareas de generación de texto offline.
- Prototipado rápido de pipelines de NLP en chino: sirve para validar plantillas de chat, tokenización y flujos de generación antes de migrar a un modelo mayor.
- Traducción short-form y de contexto medio (~900 tokens): útil para traducción de párrafos o documentos breves en entornos con recursos limitados, según la validación declarada.
- Pruebas de cuantización y benchmarking de runtimes: como referencia para comparar HQQ 4-bit frente a otras estrategias de cuantización en MNN.
- Educación y demos: ejemplo práctico de exportación de un LLM a un runtime móvil, útil para talleres sobre despliegue de modelos.
- Filtrado o clasificación ligera de texto en chino: generación de respuestas cortas o etiquetado en pipelines de preprocesamiento donde no se requiere un modelo grande.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo declara pruebas de correctitud (alineamiento FP32, plantillas de chat, generación en chino, aritmética, traducción corta y de ~900 tokens, parada natural) en CPU x64, y advierte explícitamente que no son benchmarks de precisión ni garantía de identidad token a token con el modelo sin cuantizar.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 0,5B parámetros en 4-bit, el peso ronda los 0,3-0,4 GB; el repo ocupa 1,1 GB. La inferencia está pensada para CPU, no requiere VRAM dedicada.
- GPU recomendadas: no aplica para el flujo principal (MNN-LLM en CPU). Los backends CUDA, Metal, OpenCL y Vulkan existen en MNN pero no han sido validados en esta revisión.
- ¿Cabe en GPU consumer? Sí, por tamaño, pero esta distribución está orientada a CPU; el soporte GPU no está verificado.
- Opciones de despliegue: MNN-LLM (runtime propio, compilado con `-DMNN_LOW_MEMORY=true -DMNN_CPU_WEIGHT_DEQUANT_GEMM=true -DMNN_BUILD_LLM=true -DMNN_SUPPORT_TRANSFORMER_FUSE=true`). No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: no disponibles. La model card no publica cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato / runtime |
|---|---|---|---|---|---|
| Qwen2-0.5B-Instruct-MNN (este) | 0,5B | no disponible | 4-bit HQQ group 128 | Apache 2.0 | MNN |
| Qwen2-0.5B-Instruct (original) | 0,5B | no disponible en esta ficha | FP16/BF16 | Apache 2.0 | safetensors (PyTorch) |
| Qwen2-1.5B-Instruct | 1,5B | no disponible en esta ficha | FP16/BF16, GGUF en terceros | Apache 2.0 | safetensors, GGUF (comunidad) |
| Llama 3.2 1B Instruct | 1B | 128k (según model card oficial) | FP16/BF16, GGUF | Llama 3.2 Community License | safetensors, GGUF |

La comparativa se limita a datos generales de los modelos base; no se dispone de benchmarks comparativos en la información proporcionada. La ventaja de esta distribución es el formato MNN y la cuantización 4-bit lista para CPU; la desventaja es la falta de validación en backends GPU y la ausencia de métricas publicadas.

## Limitaciones y advertencias

- Modelo de 0,5B parámetros: capacidad de razonamiento y conocimiento factual limitada; propenso a errores en tareas complejas y a alucinaciones, especialmente en dominios especializados.
- Solo se declara soporte de chino; el rendimiento en otros idiomas no está confirmado en esta ficha.
- La cuantización 4-bit con HQQ puede degradar la calidad respecto al modelo FP32/BF16; la model card no publica métricas de degradación.
- Requiere MNN 3.6.2 o superior con transformer fusion; runtimes anteriores no son compatibles. Hay que descargar todos los archivos actualizados juntos y limpiar cachés de modelo, pesos y KV antes de cargar; no mezclar con revisiones antiguas.
- Backends ARM CPU FP16, Metal, OpenCL, Vulkan y CUDA no validados en la revisión de noviembre de 2026.
- Licencia Apache 2.0: permite uso comercial, pero se debe conservar el aviso de licencia upstream incluido sin cambios.
- No se documentan sesgos específicos; al heredar el modelo base Qwen2, es previsible que arrastre sesgos de sus datos de entrenamiento, no cuantificados aquí.
- No apto para producción de alta exigencia sin evaluación previa de calidad y latencia en el hardware objetivo.

## Enlaces

- Hugging Face: https://huggingface.co/taobao-mnn/Qwen2-0.5B-Instruct-MNN
- Modelo base en ModelScope: https://modelscope.cn/models/qwen/Qwen2-0.5B-Instruct/summary
- Exportador llmexport (MNN): https://github.com/alibaba/MNN/tree/master/transformers/llm/export
- Repositorio MNN: https://github.com/alibaba/MNN
- Documentación MNN-LLM: https://mnn-docs.readthedocs.io/en/latest/transformers/llm.html
- Descarga vía ModelScope: `modelscope download --model 'MNN/Qwen2-0.5B-Instruct-MNN' --local_dir 'path/to/dir'`
