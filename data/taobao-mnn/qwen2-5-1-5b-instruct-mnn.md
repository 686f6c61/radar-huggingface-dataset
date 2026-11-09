# taobao-mnn/Qwen2.5-1.5B-Instruct-MNN

## Resumen

Qwen2.5-1.5B-Instruct-MNN es una exportación cuantizada a 4 bits del modelo Qwen2.5-1.5B-Instruct, empaquetada en el formato propietario MNN (Mobile Neural Network) de Alibaba y publicada por la organización taobao-mnn. No se trata de un modelo nuevo entrenado desde cero, sino de una conversión del checkpoint oficial de Qwen (desarrollado por el equipo Qwen de Alibaba) pensada para ejecución local eficiente mediante el runtime MNN-LLM. El repositorio ocupa 3,0 GB e incluye pesos, grafo y configuración listos para el motor MNN.

El modelo base es un transformer decoder-only de 1.500 millones de parámetros, orientado a generación de texto e instrucciones conversacionales. Esta versión MNN aplica cuantización de 4 bits con grupos de 128 tanto en las capas lineales como en la LM head, además de fusión de proyecciones y normas y embeddings de entrada/salida compartidos y cuantizados. El objetivo es habilitar inferencia en CPU x64 y ARM, así como en backends Metal, OpenCL, Vulkan y CUDA, con un consumo de memoria reducido.

La relevancia actual radica en su utilidad como pieza de despliegue en dispositivos y entornos sin GPU dedicada: permite integrar un modelo conversacional de 1,5B en aplicaciones de escritorio, móviles o embebidas a través de MNN. La revisión de noviembre de 2026 (MNN 3.6.2) actualiza el exportador y exige un runtime mínimo, lo que conviene tener en cuenta al integrarlo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5), exportado a grafo MNN |
| Parámetros totales | 1,5 mil millones (modelo base Qwen2.5-1.5B-Instruct) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Qwen2.5 soporta contexto largo; la validación de esta exportación cubre hasta ~900 tokens) |
| Tipos de cuantización | 4 bits, grupo 128 (lineales y LM head); HQQ; embeddings de entrada/salida compartidos y cuantizados |
| Idiomas soportados | en (etiqueta oficial); la validación del exportador incluye generación en chino |
| Licencia | apache-2.0 |
| Formato de pesos | MNN (grafo y pesos propietarios del runtime MNN); no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen2.5-1.5B-Instruct, un transformer decoder-only con atención multi-cabeza estándar y mecanismos propios de la familia Qwen2.5 (RoPE, normalización RMSNorm, MLP con activación SwiGLU). El entrenamiento original corresponde al equipo Qwen e incluye ajuste por instrucciones; los detalles de composición del dataset, número de tokens y etapas de RLHF/DPO no están disponibles en la información proporcionada.

La contribución de esta ficha es el pipeline de exportación: el checkpoint se convierte mediante `llmexport` de MNN con cuantización HQQ de 4 bits (grupo 128), fusión de proyecciones y normas, y embeddings compartidos entre entrada y LM head. La exportación se realizó con el commit `b0239771b07b317a258fbc384683bbd540741406` y requiere MNN 3.6.2 o superior con soporte de transformer fusion. El autor verificó alineamiento FP32 prefill/decode frente al modelo fuente, plantillas de chat, IDs de token, generación en chino, aritmética, traducción corta y de ~900 tokens, parada natural e integridad de pesos externos en CPU x64.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat.
- Razonamiento básico y aritmética (validado en la revisión del exportador).
- Traducción corta y de contexto medio (~900 tokens validados).
- Generación en chino verificada, además del inglés declarado.
- Inferencia local en CPU x64 y ARM, y backends Metal, OpenCL, Vulkan y CUDA (no validados en esta revisión).
- Muestreo configurable con parámetros de runtime; el modo greedy se usa solo para pruebas de corrección.
- Soporte de tool calling, function calling y agentes: no disponible en la información proporcionada.

## Casos de uso

- Asistentes conversacionales de escritorio: integración mediante MNN-LLM en aplicaciones nativas que necesitan un chatbot local sin GPU, aprovechando la cuantización de 4 bits para reducir huella de memoria.
- Aplicaciones móviles y embebidas: despliegue en Android/iOS o dispositivos ARM con el runtime MNN, usando los backends Metal/OpenCL/Vulkan para aceleración cuando estén validados.
- Traducción y resumen de textos cortos: el modelo ha sido verificado en traducción corta y de ~900 tokens, adecuado para tareas de procesamiento de documentos breves en local.
- Prototipado y pruebas de pipelines LLM: servir como modelo de referencia ligero para validar plantillas de chat, tokenización y lógica de muestreo antes de migrar a modelos mayores.
- Generación de texto asistida en entornos sin conectividad: al ejecutarse íntegramente en local, permite redactar borradores y respuestas sin enviar datos a la nube.
- Educación y demos de inferencia en dispositivo: útil para talleres y pruebas de concepto sobre cuantización y ejecución de transformers en CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que las comprobaciones de la revisión son de humo/corrección y no un benchmark de precisión ni una garantía de identidad token a token con el modelo sin cuantizar.

## Requisitos de hardware

- VRAM/RAM estimada: el repositorio ocupa 3,0 GB; con pesos de 4 bits y grupo 128, la inferencia requiere del orden de 1-2 GB de memoria para pesos más KV cache y buffers, aunque no se proporciona una cifra oficial.
- GPU recomendadas: no disponible; la validación de esta revisión se realizó en CPU x64. Los backends CUDA, Metal, OpenCL y Vulkan no han sido validados en esta actualización.
- ¿Cabe en GPU consumer? No hay datos oficiales; por tamaño (1,5B en 4 bits) es plausible en GPUs consumer, pero no está verificado en esta exportación.
- Opciones de despliegue: runtime MNN-LLM (`llm_demo`) compilado con `-DMNN_LOW_MEMORY=true -DMNN_CPU_WEIGHT_DEQUANT_GEMM=true -DMNN_BUILD_LLM=true -DMNN_SUPPORT_TRANSFORMER_FUSE=true`. No compatible con vLLM, llama.cpp, Ollama ni TGI, ya que el formato es MNN.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-1.5B-Instruct-MNN (esta ficha) | 1,5B | no disponible | MNN 4-bit | Apache 2.0 | Hugging Face / ModelScope |
| Qwen2.5-1.5B-Instruct (original) | 1,5B | no disponible en esta información | safetensors | Apache 2.0 | Hugging Face / ModelScope |
| Otros modelos 1,5B comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa con alternativas de la misma categoría no está disponible en la información proporcionada; la diferencia principal frente al modelo original es el formato MNN cuantizado y la dependencia del runtime MNN 3.6.2+.

## Limitaciones y advertencias

- Requiere MNN 3.6.2 o superior con transformer fusion; runtimes anteriores no son compatibles con esta exportación.
- Solo se validaron CPU x64; ARM CPU FP16, Metal, OpenCL, Vulkan y CUDA no han sido validados en esta revisión.
- Las comprobaciones del autor son de corrección, no de precisión; no se garantiza identidad token a token con el modelo sin cuantizar.
- La cuantización de 4 bits puede degradar la calidad frente al checkpoint original en tareas complejas.
- Idioma declarado: inglés; el chino se verificó en pruebas, pero el soporte multilingüe amplio no está documentado.
- Riesgo de alucinación inherente a modelos de 1,5B; no apto para tareas que exijan alta fiabilidad factual sin verificación.
- Sesgos: no disponibles en la información proporcionada; se heredan los del modelo base.
- Licencia Apache 2.0 permite uso comercial, pero debe conservarse la licencia upstream incluida sin cambios.
- Al actualizar, descargar todos los archivos juntos y limpiar cachés de modelo, pesos y KV; no mezclar este grafo con archivos de revisiones anteriores.

## Enlaces

- Hugging Face: https://huggingface.co/taobao-mnn/Qwen2.5-1.5B-Instruct-MNN
- ModelScope: https://modelscope.cn/models/MNN/Qwen2.5-1.5B-Instruct-MNN
- Modelo base en ModelScope: https://modelscope.cn/models/qwen/Qwen2.5-1.5B-Instruct/summary
- Repositorio MNN: https://github.com/alibaba/MNN
- Exportador llmexport: https://github.com/alibaba/MNN/tree/master/transformers/llm/export
- Documentación MNN-LLM: https://mnn-docs.readthedocs.io/en/latest/transformers/llm.html
