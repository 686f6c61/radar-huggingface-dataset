# trentmkelly/deftwriting_distil_Qwen3.5_9B

## Resumen

DeftWriting Distil es un adaptador LoRA de rango 16 desarrollado por Trent Kelly sobre el modelo base Qwen/Qwen3.5-9B. Su propósito es reescribir texto siguiendo el estilo de salida de la herramienta DeftWriting, una plataforma comercial de mejora de redacción. El adaptador se entrenó mediante fine-tuning supervisado (SFT) sobre un conjunto de datos destilado, donde las respuestas del asistente son reescrituras generadas por DeftWriting. Esto permite replicar el estilo de reescritura de dicha herramienta sin depender de su API.

El modelo se distribuye como un adaptador PEFT (safetensors) y requiere cargar el modelo base Qwen3.5-9B para su uso. La licencia es Apache 2.0, lo que facilita su integración en proyectos comerciales. Aunque el repositorio no incluye métricas de evaluación, el entrenamiento se realizó con 6825 ejemplos durante dos épocas, con una partición de validación estratificada del 10%. Su relevancia actual radica en ofrecer una alternativa open source y ligera para tareas de reescritura de texto, aprovechando las capacidades del modelo base Qwen3.5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre Qwen3.5-9B (transformer decoder-only) |
| Parametros totales | Adaptador: ~0.2 GB (rango 16); modelo base: 9B (no se especifica el desglose exacto) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible para el adaptador; depende del modelo base Qwen3.5-9B (se desconoce el valor exacto, aunque Qwen3.5 suele ofrecer 128K en versiones recientes) |
| Tipos de cuantizacion | No especificados; el adaptador se publica en safetensors con precisión bfloat16 (según el código de ejemplo) |
| Idiomas soportados | No disponibles en la model card; se asume los del modelo base Qwen3.5 (principalmente inglés y chino, con soporte multilingüe) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador utiliza una arquitectura LoRA de rango 16 aplicada al modelo base Qwen3.5-9B, un transformer decoder-only con atención causal. El entrenamiento se realizó mediante fine-tuning supervisado (SFT) sobre el dataset `trentmkelly/deftwriting_distil`, que contiene 6825 ejemplos de pares (texto fuente, reescritura DeftWriting). Cada ejemplo sigue la plantilla de conversación: system "Rewrite this text.\n/no_think", user con el texto original y assistant con la reescritura. Se entrenó durante dos épocas con una tasa de aprendizaje de 1e-4 y una partición de validación estratificada por categorías (760 filas, semilla 42). El entrenamiento se registró en Weights & Biases. No se mencionan técnicas adicionales como RLHF o DPO; el enfoque es puramente SFT sobre datos destilados.

## Capacidades

- Reescritura de texto: genera versiones reformuladas del texto de entrada siguiendo el estilo de DeftWriting, que prioriza claridad, concisión y tono profesional.
- Generación de texto conversacional: el adaptador se integra en el pipeline de chat de Qwen3.5, permitiendo interacciones multi-turno donde el usuario solicita reescrituras.
- Soporte de plantilla de sistema: requiere el prompt de sistema específico "Rewrite this text.\n/no_think" para activar el comportamiento de reescritura; el uso de `enable_thinking=False` desactiva el modo de razonamiento del modelo base.
- No se documentan capacidades de tool calling, agentes, visión o audio; el adaptador se centra exclusivamente en la tarea de reescritura textual.

## Casos de uso

- Mejora de redacción en editores de texto: integrar el modelo en un procesador para ofrecer sugerencias de reescritura en tiempo real, aprovechando la generación determinista (do_sample=False) para resultados consistentes.
- Normalización de contenido generado por IA: reescribir salidas de otros modelos para unificar estilo y tono antes de publicar, reduciendo la huella de plantillas típicas.
- Asistente de corrección de estilo en entornos corporativos: adaptar el modelo para revisar correos, informes o documentos internos, garantizando un lenguaje claro y profesional.
- Preprocesamiento de datos para entrenamiento: usar el adaptador para generar múltiples variantes de un mismo texto, ampliando datasets de entrenamiento con reformulaciones diversas.
- Generación de contenido para blogs y marketing: reescribir borradores o textos existentes para mejorar legibilidad y engagement, manteniendo el mensaje original.
- Integración en pipelines de automatización documental: combinar el modelo con herramientas de extracción de texto (OCR, scraping) para limpiar y reformular contenido antes de almacenarlo o analizarlo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye métricas de evaluación (como MMLU, HumanEval o GSM8K) ni comparaciones con otros adaptadores de reescritura. El único dato de rendimiento indirecto es el tamaño del adaptador (0.2 GB) y el número de parámetros entrenables (rango 16), que sugiere un coste de inferencia adicional mínimo sobre el modelo base.

## Requisitos de hardware

- VRAM estimada: al usar el adaptador sobre Qwen3.5-9B, la VRAM necesaria es la del modelo base más el adaptador. En bfloat16, el modelo base de 9B requiere aproximadamente 18 GB de VRAM; con el adaptador (0.2 GB) se mantiene en torno a 18-19 GB. Con cuantización (p.ej., 4-bit) se puede reducir a unos 6-8 GB.
- GPU recomendadas: para inferencia en bfloat16, una GPU con 24 GB (RTX 3090/4090, A10G, L4) es suficiente. Para cuantización 4-bit, una RTX 3060 de 12 GB o similar puede funcionar.
- Compatibilidad con GPU de consumo: sí, siempre que se use cuantización (p.ej., bitsandbytes) para caber en GPUs de 8-12 GB.
- Opciones de despliegue: al ser un adaptador PEFT, se puede servir con vLLM (con soporte LoRA), Hugging Face TGI, o mediante llama.cpp/Ollama si se fusiona el adaptador con el base y se convierte a GGUF. El código de ejemplo usa `transformers` y `peft`.
- Latencia y throughput: no se proporcionan datos; se espera una latencia similar a la del modelo base Qwen3.5-9B, con un overhead mínimo por la capa LoRA.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores LoRA equivalentes para reescritura de texto entrenados sobre Qwen3.5-9B o modelos similares. Dado que el adaptador es específico de la tarea y no se publican benchmarks, no es posible establecer una comparativa cuantitativa con alternativas como GPT-4o mini, Claude Haiku o adaptadores de reescritura sobre Llama 3.1. Se recomienda evaluar el modelo en el caso de uso concreto antes de decidir.

## Limitaciones y advertencias

- El adaptador no ha recibido una evaluación de seguridad amplia; el propio autor advierte que se debe revisar el texto generado antes de su uso.
- Riesgo de alucinación: al ser un modelo de lenguaje, puede introducir información no presente en el texto original al reescribir, especialmente si el texto de entrada es ambiguo.
- Dependencia del prompt de sistema: el adaptador solo funciona correctamente con el prompt exacto "Rewrite this text.\n/no_think"; usarlo con otros prompts puede degradar el rendimiento.
- Limitaciones de idioma: no se especifican los idiomas soportados; si el modelo base Qwen3.5 tiene un sesgo hacia inglés y chino, la reescritura en otros idiomas puede ser menos precisa.
- Sin evaluación en producción: no hay datos de rendimiento en tareas downstream ni comparación con otros métodos de reescritura.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-9B puede tener sus propias restricciones; se debe verificar la licencia del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/trentmkelly/deftwriting_distil_Qwen3.5_9B
- Dataset de entrenamiento: https://huggingface.co/datasets/trentmkelly/deftwriting_distil
- Perfil del autor: https://huggingface.co/trentmkelly
- Registro de entrenamiento en W&B: https://wandb.ai/trent-michael-kelly-g/deftwriting-distil/runs/45djfk4l
- Blog oficial de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Repositorio GitHub de Qwen3.5: https://github.com/ABDtmx/Qwen3.5
- Página de Qwen3.5:9b en Ollama: https://ollama.com/library/qwen3.5:9b
