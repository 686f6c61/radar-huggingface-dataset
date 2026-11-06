# weili-0234/Qwen3.5-9B-NVFP4-QAD

## Resumen

Qwen3.5-9B-NVFP4-QAD es una versión cuantizada del modelo base Qwen/Qwen3.5-9B, publicada por el usuario weili-0234 en Hugging Face. Se trata de un checkpoint de 9.409.813.744 parámetros (aproximadamente 9,4 mil millones) convertido al formato NVFP4 mediante técnicas de quantización con entrenamiento consciente (quantization-aware training, QAT), según indican las etiquetas del repositorio. El resultado se distribuye en formato compressed-tensors empaquetado en safetensors y está pensado para su despliegue con vLLM.

La relevancia de esta ficha radica en que ejemplifica el ecosistema de variantes cuantizadas de modelos Qwen de tercera generación (familia Qwen3.5), orientadas a reducir el coste de memoria y aumentar el throughput en inferencia sin renunciar a la precisión del modelo original. El uso de NVFP4 (formato de coma flotante de 4 bits de NVIDIA) junto con QAT apunta a despliegues en GPUs Blackwell, donde este formato tiene soporte nativo.

No obstante, la información pública disponible es muy limitada: el repositorio no incluye pipeline declarado, idiomas soportados, resultados de benchmarks ni documentación técnica detallada más allá de las etiquetas y los metadatos del modelo base. Además, el acceso está restringido (gated) y requiere aceptar condiciones en Hugging Face, y el modelo registra cero descargas y cero likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5; detalles específicos no disponibles) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits en coma flotante), con quantization-aware training; formato compressed-tensors |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors), compatible con vLLM |

## Arquitectura y entrenamiento

El modelo base es Qwen/Qwen3.5-9B, un transformer de la familia Qwen3.5 desarrollada por Alibaba Qwen. La información pública del repositorio no detalla la arquitectura interna del modelo base (número de capas, dimensión oculta, mecanismo de atención, uso de atención lineal o híbrida), por lo que estos datos deben consultarse en la ficha oficial del modelo original.

La variante aquí descrita aplica cuantización NVFP4 con entrenamiento consciente de cuantización (QAT), un proceso en el que el modelo se ajusta teniendo en cuenta el ruido introducido por la cuantización a 4 bits, lo que habitualmente preserva mejor la precisión que una cuantización post-entrenamiento (PTQ). El resultado se serializa con la librería compressed-tensors, lo que permite su carga directa en vLLM. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base Qwen3.5-9B, si bien no se documentan detalles específicos en el repositorio.
- Generación de código y matemáticas: presumiblemente soportadas por el modelo base; sin datos verificables en la información proporcionada.
- Tool calling / function calling: no disponible en la información del repositorio.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (el campo de idiomas no está declarado).
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Inferencia optimizada: al estar empaquetado con compressed-tensors y NVFP4, está diseñado para ejecutarse con vLLM en hardware compatible con FP4.

## Casos de uso

- Despliegue de bajo coste en GPUs Blackwell: el formato NVFP4 aprovecha el soporte nativo de FP4 de las GPUs de NVIDIA de última generación, reduciendo el consumo de memoria frente a FP16/BF16 y permitiendo servir el modelo de 9,4B con menor huella de VRAM.
- Inferencia de alto throughput con vLLM: al estar serializado en compressed-tensors, puede cargarse directamente en vLLM para servir peticiones concurrentes con mayor número de tokens por segundo que la versión sin cuantizar.
- Prototipado de asistentes conversacionales: un modelo de 9,4B cuantizado a 4 bits es adecuado para entornos de desarrollo donde se busca un equilibrio entre calidad y coste de infraestructura.
- Evaluación de pipelines de cuantización QAT: útil para investigadores que comparan la degradación de precisión entre NVFP4-QAD y otras técnicas (GPTQ, AWQ, FP8) sobre el mismo modelo base.
- Servicio de generación de texto en entornos con restricciones de memoria: permite ejecutar un modelo de casi 10B parámetros en GPUs con menos VRAM de la que requeriría la versión BF16.
- Base para fine-tuning posterior o destilación: al mantener la licencia Apache 2.0, puede servir como punto de partida para adaptaciones, aunque la cuantización a 4 bits complica el reentrenamiento directo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos NVFP4 (4 bits), el checkpoint ocupa aproximadamente 8,9 GB en disco; en VRAM se estima un consumo en torno a 5-6 GB solo para pesos, más overhead de activaciones y KV cache.
- GPU recomendadas: GPUs NVIDIA Blackwell (serie B200, RTX 50xx) para aprovechar el soporte nativo de FP4; el soporte en arquitecturas anteriores (Hopper, Ada) puede requerir emulación o no estar disponible.
- ¿Cabe en consumer GPU?: probablemente sí en GPUs de gama alta con al menos 12-16 GB de VRAM si el hardware soporta FP4; sin datos verificados de compatibilidad.
- Opciones de despliegue: vLLM (librería declarada en el repositorio); otras opciones como llama.cpp, Ollama o TGI no están confirmadas para este formato.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-NVFP4-QAD | 9,41B | no disponible | NVFP4 + QAT | Apache 2.0 | Gated en Hugging Face |
| Qwen/Qwen3.5-9B (base) | ~9,4B | no disponible | BF16/FP16 | Apache 2.0 (presumible) | Público en Hugging Face |
| Otras variantes cuantizadas de Qwen3.5-9B (GPTQ/AWQ/FP8) | ~9,4B | no disponible | 4-8 bits PTQ | Apache 2.0 | Variable |

La comparación cuantitativa de rendimiento frente a estas alternativas no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face antes de la descarga.
- Documentación mínima: no se declaran idiomas, pipeline, benchmarks ni detalles de entrenamiento, lo que dificulta evaluar su calidad frente al modelo base.
- Riesgo de degradación por cuantización: aunque el QAT mitiga la pérdida de precisión, la cuantización a 4 bits puede afectar a tareas sensibles (matemáticas, código, razonamiento largo); no hay datos publicados que lo cuantifiquen.
- Dependencia de hardware: NVFP4 requiere soporte de FP4 a nivel de GPU; en hardware sin ese soporte el modelo puede no ejecutarse o hacerlo con conversión costosa.
- Riesgo de alucinación y sesgos: heredados del modelo base Qwen3.5-9B; no se documentan mitigaciones específicas en esta variante.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base y de los datos de entrenamiento originales.
- Repositorio sin tracción: cero descargas y cero likes en el momento de la consulta, lo que reduce la evidencia comunitaria sobre su funcionamiento.

## Enlaces

- Hugging Face: https://huggingface.co/weili-0234/Qwen3.5-9B-NVFP4-QAD
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Librería compressed-tensors: https://github.com/neuralmagic/compressed-tensors
- vLLM: https://github.com/vllm-project/vllm
