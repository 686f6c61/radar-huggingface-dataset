# ZuoHaotong/Qwen2.5-3B-Instruct-SFT-in-WebShop

## Resumen

El modelo `ZuoHaotong/Qwen2.5-3B-Instruct-SFT-in-WebShop` es un ajuste fino (SFT) del modelo base `Qwen2.5-3B-Instruct` de Alibaba, especializado en el entorno WebShop, un simulador de compras en línea utilizado para evaluar agentes conversacionales. El autor, ZuoHaotong, ha publicado este checkpoint con licencia Apache 2.0, aunque la información disponible en la ficha de HuggingFace es muy limitada: no se especifican detalles del entrenamiento, métricas de rendimiento ni características adicionales.

El modelo base Qwen2.5-3B-Instruct cuenta con 3,09 mil millones de parámetros, una ventana de contexto de hasta 128 000 tokens y soporte multilingüe, con especial fortaleza en tareas de código, matemáticas y generación estructurada. Este fine-tune hereda presumiblemente esas capacidades, pero su adaptación específica a WebShop sugiere un enfoque en la navegación y compra en entornos simulados, aunque no se han publicado evidencias concretas de su rendimiento en dicha tarea.

Dada la escasez de datos públicos sobre este modelo concreto, la presente ficha se basa en gran medida en las características del modelo base, indicando explícitamente cuando un dato corresponde al modelo original y no al fine-tune.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen2.5) |
| Parametros totales | 3,09 mil millones (modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | 128 000 tokens (modelo base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo base multilingüe) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (presumiblemente safetensors) |

## Arquitectura y entrenamiento

El modelo base Qwen2.5-3B-Instruct emplea una arquitectura transformer con atención por grupos (GQA), 16 cabezas de consulta y 2 cabezas de clave/valor, activación SwiGLU, normalización RMSNorm y embeddings rotatorios (RoPE). Fue preentrenado con hasta 18 billones de tokens y posteriormente ajustado con instrucciones mediante técnicas de alineación (RLHF/DPO). El fine-tune `SFT-in-WebShop` parte de este checkpoint y se ajusta adicionalmente con datos del entorno WebShop, pero no se dispone de información sobre el volumen de datos, la metodología exacta ni las épocas de entrenamiento. No se han publicado detalles técnicos adicionales en la model card.

## Capacidades

- Generación de texto y razonamiento general (heredadas del modelo base).
- Soporte de código y matemáticas (fortalezas del modelo base).
- Generación de salidas estructuradas (JSON, etc.) según el modelo base.
- Capacidad multilingüe (modelo base, aunque no se confirma en este fine-tune).
- Posible especialización en tareas de navegación y compra en entornos simulados como WebShop, aunque no hay evidencia pública.
- No se confirma soporte de tool calling, agentes ni modos de pensamiento extendido en este checkpoint específico.

## Casos de uso

- Investigación académica en agentes conversacionales: el modelo puede utilizarse como punto de partida para experimentos en entornos de compra simulada, aunque se requiere validación previa.
- Evaluación de estrategias de diálogo en comercio electrónico: dado su ajuste en WebShop, podría servir para probar políticas de recomendación o negociación en un entorno controlado.
- Desarrollo de prototipos de asistentes de compra: con la base Qwen2.5, podría adaptarse a tareas de atención al cliente, pero el fine-tune específico no garantiza un rendimiento óptimo fuera de WebShop.
- Benchmarking de modelos pequeños: al ser un modelo de 3B, es adecuado para comparar eficiencia y rendimiento en tareas de razonamiento con otros modelos de tamaño similar.
- Fine-tuning adicional: el checkpoint puede servir como base para nuevos ajustes en dominios relacionados con comercio electrónico.
- Educación y demostraciones: útil para ilustrar el proceso de SFT sobre un modelo instructivo conocido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como MMLU, HumanEval o GSM8K para este fine-tune específico. Se recomienda consultar los benchmarks del modelo base Qwen2.5-3B-Instruct para una referencia aproximada, pero no son directamente aplicables a esta variante.

## Requisitos de hardware

- VRAM estimada: para el modelo base de 3B en FP16 se requieren aproximadamente 6-8 GB; con cuantización de 4 bits puede reducirse a unos 2-3 GB. No se dispone de datos específicos para este fine-tune.
- GPU recomendadas: tarjetas consumer como RTX 3060 (12 GB) o superiores pueden ejecutar el modelo en FP16; RTX 4090 o GPUs de datacenter (A10, A100) ofrecen mayor margen.
- Es viable en GPU consumer con cuantización (GGUF, AWQ) mediante llama.cpp u Ollama.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama, entre otros, siempre que se conviertan los pesos al formato adecuado.
- Latencia y throughput: no disponibles para este checkpoint; en el modelo base, la inferencia en una RTX 4090 suele rondar los 50-100 tokens/s en FP16, pero depende de la implementación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen2.5-3B-Instruct (base) | 3,09B | 128K | Apache 2.0 | Modelo original, sin ajuste a WebShop |
| ZuoHaotong/Qwen2.5-3B-Instruct-SFT-in-WebShop | 3,09B (presumible) | 128K (presumible) | Apache 2.0 | Fine-tune específico, sin datos públicos |
| Llama-3.2-3B-Instruct | 3,2B | 128K | Llama 3.2 Community | Alternativa generalista, sin especialización en WebShop |

No se dispone de comparativas de rendimiento entre estos modelos en el contexto de WebShop.

## Limitaciones y advertencias

- Ausencia total de documentación técnica sobre el proceso de SFT: no se conocen los datos de entrenamiento, hiperparámetros ni criterios de evaluación.
- Riesgo de sobreajuste al entorno WebShop: el modelo puede no generalizar bien a tareas de compra reales o a otros dominios.
- Posibles sesgos heredados del modelo base, como estereotipos o respuestas inexactas en contextos no representados en el entrenamiento.
- Alucinaciones potenciales, especialmente en tareas de razonamiento o generación de hechos, al igual que en el modelo base.
- Sin garantías de soporte para tool calling o uso como agente autónomo, a menos que se verifique experimentalmente.
- La licencia Apache 2.0 permite uso comercial, pero al ser un modelo derivado de Qwen2.5, se deben respetar los términos de la licencia original (Apache 2.0 también).
- No se recomienda su uso en producción sin una evaluación exhaustiva en el dominio objetivo.

## Enlaces

- [HuggingFace - ZuoHaotong/Qwen2.5-3B-Instruct-SFT-in-WebShop](https://huggingface.co/ZuoHaotong/Qwen2.5-3B-Instruct-SFT-in-WebShop)
- [Qwen/Qwen2.5-3B-Instruct (modelo base)](https://huggingface.co/Qwen/Qwen2.5-3B-Instruct)
- [Qwen/Qwen2.5-3B (modelo base sin instrucciones)](https://huggingface.co/Qwen/Qwen2.5-3B)
- [ModelScope - Qwen2.5-3B-Instruct](https://www.modelscope.cn/models/qwen/Qwen2.5-3B-Instruct)
- [Ollama - qwen2.5:3b-instruct](https://ollama.com/library/qwen2.5:3b-instruct)
- [AIModels.fyi - Qwen2.5-3B-Instruct overview](https://www.aimodels.fyi/models/huggingFace/qwen25-3b-instruct-qwen)
