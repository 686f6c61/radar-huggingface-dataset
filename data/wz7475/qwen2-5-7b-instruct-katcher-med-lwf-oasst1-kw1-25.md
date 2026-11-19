# wz7475/qwen2.5-7b-instruct-katcher-med-lwf-oasst1-kw1.25

## Resumen

El modelo `wz7475/qwen2.5-7b-instruct-katcher-med-lwf-oasst1-kw1.25` es un ajuste fino (SFT) del modelo base `unsloth/Qwen2.5-7B-Instruct`, desarrollado por el usuario wz7475 y publicado en Hugging Face. Se trata de un fine-tuning supervisado realizado con la librería TRL sobre la infraestructura de Unsloth, orientado presumiblemente a tareas de dominio médico y conversacional, a juzgar por el nombre del repositorio (que combina referencias a "med", "lwf" y "oasst1"). El modelo hereda la arquitectura transformer densa de Qwen2.5-7B-Instruct, con aproximadamente 7.600 millones de parámetros y una ventana de contexto nativa de 32.768 tokens (extensible a 131.072 en la familia Qwen2.5).

La relevancia de esta ficha es limitada desde el punto de vista de la producción: el repositorio no incluye model card detallada, no declara licencia, no especifica idiomas soportados ni publica resultados de benchmarks. El tamaño del repositorio (17,1 GB) es coherente con pesos en safetensors en precisión bf16/fp16 para un modelo de 7B. La información disponible se limita a los metadatos de Hugging Face y al README generado automáticamente por TRL.

Se trata, por tanto, de un experimento de fine-tuning comunitario sin validación pública documentada. Cualquier evaluación de su calidad debe realizarse empíricamente antes de considerar su uso en entornos reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de Qwen2.5-7B-Instruct) |
| Parametros totales | ~7.600 millones (heredados del modelo base) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens nativos (heredado del modelo base; extensible a 131.072 según especificaciones de Qwen2.5) |
| Tipos de cuantizacion | no disponible en el repositorio; el modelo base admite GPTQ, AWQ, GGUF y bitsandbytes |
| Idiomas soportados | no disponible (el modelo base Qwen2.5 soporta multitud de idiomas, pero el fine-tuning no declara cobertura) |
| Licencia | no disponible (la model card indica "licence: license", sin especificar) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 17,1 GB |
| Libreria | transformers |
| Framework de entrenamiento | TRL 1.15.0, Transformers 4.57.6, PyTorch 2.11.0, Datasets 4.8.5, Tokenizers 0.22.2 |
| Metodo de ajuste | SFT (supervised fine-tuning) |
| Modelo base | unsloth/Qwen2.5-7B-Instruct |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B-Instruct: un transformer decoder-only denso con atención de múltiples cabezas, RoPE para codificación posicional, normalización RMSNorm y activación SwiGLU en las capas feed-forward. El modelo base emplea Grouped Query Attention (GQA) para reducir el coste de memoria del KV cache durante la inferencia. No se dispone de detalles adicionales sobre la configuración exacta de capas, cabezas o dimensión oculta en la información proporcionada.

El entrenamiento de este fine-tuning se realizó mediante SFT con TRL sobre la infraestructura de Unsloth (optimizaciones de memoria y velocidad para fine-tuning). El nombre del repositorio sugiere una mezcla de datasets: "oasst1" (OpenAssistant Conversations Dataset), "med" (probablemente un corpus médico) y "lwf" (posiblemente una referencia a Learning Without Forgetting o a un dataset específico). El sufijo "kw1.25" podría indicar un peso o coeficiente de mezcla de datos, pero no se documenta. No se especifica el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO posteriores. Tampoco se documentan innovaciones técnicas propias más allá del uso de Unsloth para eficiencia.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Qwen2.5-7B-Instruct.
- Razonamiento y respuesta a instrucciones en formato chat (el README muestra un ejemplo de uso con `pipeline` y mensajes con rol `user`).
- Presunta especialización en dominio médico y conversacional por el fine-tuning, aunque no se documenta ni se valida.
- Soporte de tool calling y function calling: no confirmado en este fine-tuning; el modelo base Qwen2.5-7B-Instruct lo soporta, pero el ajuste puede haber degradado esta capacidad.
- Capacidades multilingües: no disponibles en la información del repositorio; dependen del modelo base y del dataset de ajuste.
- Modo "thinking" o razonamiento extendido: no disponible.
- Capacidades de visión o audio: no disponibles (el modelo base es solo texto).

## Casos de uso

- Prototipado de asistentes conversacionales en dominio médico: el modelo puede emplearse para generar respuestas a preguntas de salud en entornos de investigación, siempre con supervisión humana y sin uso clínico directo, dado que no hay validación publicada.
- Experimentación académica con SFT: sirve como ejemplo de fine-tuning con TRL y Unsloth sobre Qwen2.5-7B-Instruct para estudiar el efecto de mezclas de datos (oasst1 + médico) en el comportamiento del modelo.
- Generación de respuestas en formato chat para evaluación comparativa: útil para contrastar con el modelo base en tareas de instrucción y conversación, midiendo degradación o mejora.
- Base para posteriores ajustes (DPO, RLHF): al ser un checkpoint SFT, puede servir como punto de partida para etapas adicionales de alineamiento.
- Generación de texto en pipelines de investigación con `transformers`: el README proporciona un ejemplo directo con `pipeline("text-generation")`, lo que facilita su integración en scripts de evaluación.
- Fine-tuning adicional sobre dominio específico: al estar construido sobre Qwen2.5-7B-Instruct, puede reajustarse con datasets propios usando las mismas herramientas (TRL, Unsloth) para adaptarlo a otras verticales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 15-16 GB solo para pesos, más KV cache y activaciones; en la práctica, se recomiendan 20-24 GB para contexto moderado.
- VRAM estimada en cuantización 8 bits (bitsandbytes): ~8-9 GB; en 4 bits: ~5-6 GB.
- GPU recomendadas para bf16: NVIDIA A100 40GB, H100, L40S, RTX A6000. Para cuantización 4/8 bits: RTX 4090 (24 GB), RTX 3090 (24 GB), RTX 4080 (16 GB) con margen ajustado.
- ¿Cabe en GPU de consumo? Sí, en RTX 4090/3090 con cuantización 4 u 8 bits; en bf16 completo requiere al menos 24 GB y contexto corto.
- Opciones de despliegue: `transformers` (soporte nativo, según el README), vLLM, TGI, llama.cpp/Ollama (requiere conversión a GGUF, no incluida en el repositorio), SGLang.
- Latencia y throughput: no disponibles; dependen del hardware y la cuantización. Como referencia orientativa para un 7B denso en A100 80GB con vLLM, cabría esperar decenas de tokens por segundo por petición, pero no se han publicado mediciones para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| wz7475/qwen2.5-7b-instruct-katcher-med-lwf-oasst1-kw1.25 | ~7,6B | 32.768 (heredado) | no disponible | Hugging Face, 0 descargas | Fine-tuning SFT sin validación pública |
| Qwen/Qwen2.5-7B-Instruct | ~7,6B | 32.768 (ext. 131.072) | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base oficial, benchmarks publicados |
| unsloth/Qwen2.5-7B-Instruct | ~7,6B | 32.768 | Apache 2.0 (heredada) | Hugging Face | Versión optimizada del base para fine-tuning |
| Mistral-7B-Instruct-v0.3 | ~7,2B | 32.768 | Apache 2.0 | Hugging Face | Alternativa densa de tamaño similar con tool calling |

## Limitaciones y advertencias

- Ausencia de model card detallada: no se documentan datos de entrenamiento, hiperparámetros, composición del dataset ni proceso de evaluación.
- Licencia no especificada: la model card indica "licence: license" sin concreción, lo que impide determinar si el uso comercial está permitido. El modelo base Qwen2.5-7B-Instruct es Apache 2.0, pero el fine-tuning no declara licencia propia.
- Sin benchmarks ni evaluaciones publicadas: no hay evidencia de calidad, seguridad ni robustez.
- Riesgo de alucinación: inherente a los modelos de 7B; el ajuste en dominio médico agrava el riesgo si se usa sin supervisión.
- Posible degradación de capacidades del modelo base: el SFT sobre datasets específicos puede reducir el rendimiento en tool calling, multilingüismo o razonamiento general.
- Idiomas no declarados: no se puede garantizar cobertura multilingüe tras el ajuste.
- Cero descargas y cero likes: sin validación por parte de la comunidad.
- Uso clínico no recomendado: cualquier aplicación en salud requiere validación regulatoria y supervisión profesional; este checkpoint no la proporciona.
- Fecha de creación futura en los metadatos (2026-11-19): conviene verificar la integridad y procedencia del repositorio antes de su uso.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/wz7475/qwen2.5-7b-instruct-katcher-med-lwf-oasst1-kw1.25
- Modelo base (Unsloth): https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Modelo base original (Qwen): https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- TRL (framework de entrenamiento): https://github.com/huggingface/trl
- Unsloth: https://github.com/unslothai/unsloth
- OpenAssistant Conversations Dataset (OASST1): https://huggingface.co/datasets/OpenAssistant/oasst1
