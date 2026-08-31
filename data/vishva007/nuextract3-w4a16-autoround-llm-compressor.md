# Vishva007/NuExtract3-W4A16-AutoRound-LLM-Compressor

## Resumen

NuExtract3-W4A16-AutoRound-LLM-Compressor es una versión cuantizada del modelo multimodal NuExtract3, desarrollado por NuMind, especializado en comprensión de documentos, extracción estructurada de datos y OCR. Esta variante ha sido creada por Vishva007 utilizando el algoritmo de cuantización AutoRound de Intel, que reduce los pesos a 4 bits (W4A16) manteniendo las activaciones en 16 bits, con el objetivo de disminuir drásticamente los requisitos de VRAM y permitir su ejecución en GPUs de consumo.

El modelo base NuExtract3, con 4.539.265.536 parámetros (aproximadamente 4,54 mil millones), está diseñado para tareas de imagen-a-texto, como la conversión de documentos escaneados en JSON estructurado o Markdown. La cuantización W4A16 con grupo de tamaño 32 y calibración específica conserva la precisión en la torre de visión (mantenida en BF16) y en los módulos de predicción multi-token, lo que lo hace especialmente adecuado para entornos con recursos limitados. Su licencia Apache 2.0 permite uso comercial sin restricciones.

La relevancia de este modelo radica en que democratiza el acceso a capacidades de extracción de documentos de nivel empresarial, reduciendo el consumo de memoria de 9-11 GB (versión BF16) a aproximadamente 2,8-3,5 GB, lo que lo hace viable en tarjetas gráficas de 4 GB o 6 GB. Además, es compatible con vLLM y el formato compressed-tensors, facilitando su integración en pipelines de producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (VLM) basado en la familia Qwen3.5, con torre de visión para procesamiento de imágenes y documentos |
| Parametros totales | 4.539.265.536 (4,54 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 16.384 tokens (configuración recomendada en vLLM) |
| Tipos de cuantizacion | W4A16 (4 bits pesos, 16 bits activaciones), grupo de tamaño 32, simétrico |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors, compatible con compressed-tensors |

## Arquitectura y entrenamiento

El modelo base NuExtract3 es un modelo de lenguaje multimodal (VLM) construido sobre la arquitectura Qwen3.5, que combina un transformer de lenguaje con una torre de visión (vision tower) para procesar imágenes y documentos. Incluye un módulo de predicción multi-token (MTP) que permite generar varias fichas por paso, mejorando la eficiencia en tareas de extracción. En esta versión cuantizada, la torre de visión y el módulo MTP se mantienen en bfloat16 para preservar la precisión en el reconocimiento visual y la generación estructurada.

El proceso de cuantización se realizó con Intel AutoRound (versión 0.14.2), un algoritmo que optimiza los valores de redondeo y los rangos de clip mediante tres parámetros entrenables (V, α y β). La calibración se efectuó con 512 muestras, una longitud de secuencia de 4096 tokens y 1000 iteraciones de ajuste. El resultado es un modelo W4A16 con grupo de tamaño 32 y cuantización simétrica, que mantiene la compatibilidad con el formato compressed-tensors y puede servirse directamente con vLLM. No se dispone de información sobre el entrenamiento original del modelo base (datos, número de tokens, técnicas de alineación como RLHF o DPO).

## Capacidades

- Extracción estructurada de datos de documentos mediante plantillas JSON personalizadas (por ejemplo, facturas, formularios, contratos).
- OCR de documentos con salida en formato Markdown, útil para digitalización y preservación de contenido.
- Comprensión de imágenes y documentos escaneados, incluyendo tablas, texto manuscrito y elementos visuales.
- Conversación multimodal (image-text-to-text), permitiendo interacciones de preguntas y respuestas sobre imágenes.
- Soporte para múltiples imágenes por prompt (hasta 10 según la configuración de vLLM).
- Generación de texto con modo de razonamiento opcional (enable_thinking), que puede desactivarse para respuestas más directas.

## Casos de uso

- Automatización de facturación: extraer automáticamente número de factura, fecha, importe total y líneas de detalle a partir de PDFs o imágenes, integrándolo en sistemas contables.
- Procesamiento de formularios y encuestas: convertir formularios escaneados en registros JSON para su posterior análisis en bases de datos.
- Digitalización de documentos legales: transformar contratos y acuerdos en Markdown estructurado para búsqueda y archivado.
- Back-office de atención al cliente: procesar recibos, albaranes y comprobantes enviados por usuarios para verificar transacciones o reembolsos.
- Extracción de datos de tarjetas de visita: capturar nombre, empresa, teléfono y correo electrónico desde imágenes para CRM.
- Asistentes virtuales con entrada visual: responder preguntas sobre documentos o imágenes en tiempo real, por ejemplo, en chatbots de soporte técnico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como MMLU, HumanEval o GSM8K para este modelo cuantizado, ni comparaciones cuantitativas con el modelo base u otras variantes.

## Requisitos de hardware

- VRAM estimada para inferencia: 2,8-3,5 GB en cuantización W4A16, frente a 9-11 GB en la versión BF16 original.
- GPU recomendadas: tarjetas de consumo con 4 GB o 6 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, RTX 2060, etc.). También compatible con GPUs de gama alta como RTX 3090, A100 o H100, aunque no son necesarias.
- Opciones de despliegue: vLLM (servidor OpenAI-compatible), compatible con el ecosistema compressed-tensors. No se menciona soporte para llama.cpp u Ollama en la documentación.
- Latencia y throughput: no disponibles. Se recomienda configurar `--gpu-memory-utilization 0.90` y `--max-model-len 16384` para optimizar el uso de memoria.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | VRAM | Licencia |
|---|---|---|---|---|---|
| NuExtract3 (base, BF16) | 4,54 B | 16.384 (recomendado) | BF16 | 9-11 GB | Apache 2.0 |
| NuExtract3-W4A16-AutoRound (este) | 4,54 B | 16.384 (recomendado) | W4A16 G32 | 2,8-3,5 GB | Apache 2.0 |
| NuExtract3-W4A16-AutoGPTQ (variante) | 4,54 B | No disponible | W4A16 | No disponible | Apache 2.0 |

No se dispone de información sobre modelos comparables de otros fabricantes con la misma especialización en extracción de documentos y tamaño similar. La comparativa se limita a las variantes del mismo modelo base.

## Limitaciones y advertencias

- La cuantización a 4 bits puede introducir una ligera pérdida de precisión en tareas complejas de razonamiento o en idiomas poco representados, aunque la calibración específica y el mantenimiento de la torre de visión en BF16 mitigan este efecto.
- El modelo está especializado en comprensión de documentos y extracción estructurada; su rendimiento en tareas generales de conversación o generación creativa puede ser inferior al de modelos de propósito general.
- No se especifican los idiomas soportados; se recomienda verificar el comportamiento en el idioma de destino antes de desplegarlo en producción.
- La dependencia de vLLM para el servicio puede limitar su uso en entornos que requieran otros motores de inferencia.
- No se han publicado evaluaciones de sesgos o alucinaciones específicas para esta versión cuantizada; como con cualquier modelo de lenguaje, existe riesgo de generar información incorrecta o inventada, especialmente en documentos ambiguos.
- La licencia Apache 2.0 permite uso comercial, pero se debe atribuir adecuadamente al autor original y a las modificaciones.

## Enlaces

- [HuggingFace del modelo cuantizado](https://huggingface.co/Vishva007/NuExtract3-W4A16-AutoRound-LLM-Compressor)
- [Modelo base numind/NuExtract3](https://huggingface.co/numind/NuExtract3)
- [Repositorio de Intel AutoRound](https://github.com/intel/auto-round)
- [Documentación de llm-compressor para AutoRound](https://docs.vllm.ai/projects/llm-compressor/en/latest/examples/autoround/)
- [Ejemplo de cuantización W4A16 en llm-compressor](https://github.com/vllm-project/llm-compressor/blob/main/examples/autoround/quantization_w4a16/README.md)
- [Variante AutoRound (sin GPTQ)](https://huggingface.co/Vishva007/NuExtract3-W4A16-AutoRound)
- [Variante AutoGPTQ](https://huggingface.co/Vishva007/NuExtract3-W4A16-AutoRound-GPTQ)
