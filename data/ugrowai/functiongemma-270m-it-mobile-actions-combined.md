# UGrowAI/FunctionGemma-270M-it-Mobile-Actions-Combined

## Resumen

FunctionGemma-270M-it-Mobile-Actions-Combined es un modelo de lenguaje ligero de 268 millones de parámetros, desarrollado por UGrowAI como una variante fine-tuneada de FunctionGemma-270M-it, el modelo base de Google especializado en function calling. Este modelo concreto se ha ajustado sobre un dataset extendido de acciones móviles (Mobile Actions) para traducir peticiones en lenguaje natural en llamadas a funciones ejecutables en dispositivos móviles. Su relevancia radica en que permite construir asistentes locales, rápidos y privados que controlan acciones del sistema sin depender de la nube, aprovechando la arquitectura compacta de Gemma 3 270M.

El modelo está pensado para desarrolladores que necesitan integrar capacidades de ejecución de acciones en aplicaciones móviles, asistentes de voz o agentes conversacionales. Al ser un modelo pequeño, puede desplegarse en entornos con recursos limitados, como teléfonos o dispositivos edge. La licencia es la de Gemma, que permite uso comercial bajo ciertas condiciones. El repositorio incluye pesos en formato safetensors y el entrenamiento se realizó con técnicas estándar de fine-tuning supervisado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Gemma 3 270M) |
| Parametros totales | 268.098.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles |
| Licencia | Gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Gemma 3 270M, un transformer decoder-only diseñado por Google para tareas de function calling. Sobre esta base, UGrowAI ha realizado un fine-tuning supervisado utilizando el dataset extendido de Mobile Actions (AliRGHZ/Mobile-Actions), que amplía el conjunto original de Google. El entrenamiento se llevó a cabo durante 2 épocas con un tamaño de lote de 4 por dispositivo, 8 pasos de acumulación de gradiente, una tasa de aprendizaje de 1e-5 con scheduler coseno y optimizador AdamW en precisión bfloat16. Se habilitó gradient checkpointing y la pérdida se calculó únicamente sobre las salidas (completion only loss), no sobre los prompts. El entrenamiento se ejecutó en una GPU A100 de Google Colab y tomó aproximadamente 24 minutos.

No se han publicado detalles adicionales sobre la composición del dataset de entrenamiento ni sobre técnicas como RLHF o DPO. El modelo hereda las capacidades de function calling del modelo base, pero especializadas en acciones móviles.

## Capacidades

- Traducción de lenguaje natural a llamadas a funciones ejecutables, especialmente orientadas a acciones móviles (abrir apps, enviar mensajes, ajustar configuración, etc.).
- Soporte de function calling / tool calling, permitiendo que el modelo genere invocaciones estructuradas a APIs o comandos del sistema.
- Capacidad de integración en agentes conversacionales que necesitan ejecutar acciones en un dispositivo.
- Multilingüismo limitado: solo se ha confirmado el inglés en la model card.
- Al ser un modelo pequeño, es adecuado para inferencia en dispositivos con recursos limitados, aunque no se especifican capacidades de razonamiento complejo o generación de código más allá de las llamadas a funciones.

## Casos de uso

- Asistentes móviles de voz: el modelo puede convertir comandos de voz en acciones concretas del dispositivo, como abrir una aplicación, enviar un mensaje o cambiar ajustes, gracias a su fine-tuning en Mobile Actions.
- Automatización de tareas en el teléfono: integrado en una app, permite que el usuario pida "programa una alarma para las 7" y el modelo genere la llamada a función correspondiente.
- Agentes locales de productividad: al ser ligero, puede ejecutarse en el propio dispositivo sin conexión, ofreciendo privacidad y baja latencia para tareas como gestionar calendario o recordatorios.
- Control de dispositivos IoT: el modelo puede traducir peticiones como "apaga la luz del salón" en llamadas a funciones de un hub doméstico, siempre que se definan las herramientas adecuadas.
- Asistentes de accesibilidad: personas con movilidad reducida pueden usar comandos de voz para interactuar con el teléfono, y el modelo genera las acciones necesarias.
- Prototipos de agentes conversacionales: desarrolladores pueden usar este modelo como base para crear asistentes que ejecuten acciones en entornos simulados o reales, aprovechando su tamaño reducido para iterar rápidamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no incluye métricas de evaluación propias en su model card. Se recomienda realizar pruebas específicas para el caso de uso previsto, ya que el rendimiento en tareas de function calling depende en gran medida del dataset y del dominio.

## Requisitos de hardware

- Al ser un modelo de 268M parámetros, es muy ligero. El tamaño del repositorio es de 0.6 GB, lo que sugiere que los pesos en safetensors ocupan aproximadamente esa cantidad (posiblemente en bfloat16 o float32).
- VRAM estimada: no disponible oficialmente, pero por el tamaño de parámetros, en FP16 ocuparía alrededor de 540 MB, en int8 unos 270 MB y en int4 unos 135 MB. Estas cifras son estimaciones estándar, no confirmadas por el autor.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM, incluyendo tarjetas consumer como GTX 1050 Ti, RTX 2060 o superiores. También puede ejecutarse en CPU.
- Es apto para despliegue en dispositivos móviles y edge, aunque no se especifican frameworks concretos. Se puede usar con Hugging Face Transformers, y potencialmente con vLLM, llama.cpp u Ollama, pero no hay confirmación.
- Latencia y throughput: no disponibles. Dado el tamaño, se espera una inferencia muy rápida, pero no hay datos medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| UGrowAI/FunctionGemma-270M-it-Mobile-Actions-Combined | 268M | no disponible | Gemma | Mobile actions extendido |
| google/functiongemma-270m-it | 270M | no disponible | Gemma | Function calling general |
| litert-community/FunctionGemma_270M_Mobile_Actions | 270M | no disponible | Gemma | Mobile actions (dataset original de Google) |
| jprtr/functiongemma-270m-mobile-actions | 270M | no disponible | Gemma | Mobile actions (fine-tune adicional) |

No se dispone de datos de rendimiento comparativo entre estos modelos. La diferencia principal radica en el dataset de fine-tuning: el modelo de UGrowAI usa un dataset extendido, mientras que los otros usan el conjunto original de Google o variantes.

## Limitaciones y advertencias

- El modelo solo ha sido entrenado para inglés, por lo que su uso en otros idiomas puede degradar significativamente el rendimiento.
- No se han publicado evaluaciones de sesgos, alucinaciones o robustez. Como todo modelo de lenguaje, puede generar llamadas a funciones incorrectas o inventar acciones que no existen.
- La licencia Gemma impone condiciones de uso que deben revisarse antes de un despliegue comercial. No se permite el uso para ciertos fines restringidos según los términos de Google.
- El modelo está especializado en acciones móviles; su uso fuera de ese dominio (por ejemplo, generación de texto general) no está garantizado y probablemente ofrezca resultados pobres.
- No se especifica la longitud de contexto, lo que limita la planificación de conversaciones multi-turno largas.
- El entrenamiento se realizó en un solo entorno (Colab A100) y no se documentan estrategias de mitigación de sesgos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/UGrowAI/FunctionGemma-270M-it-Mobile-Actions-Combined
- Modelo base de Google: https://huggingface.co/google/functiongemma-270m-it
- Fine-tune de Google sobre Mobile Actions: https://huggingface.co/litert-community/FunctionGemma_270M_Mobile_Actions
- Dataset extendido de Mobile Actions: https://huggingface.co/datasets/AliRGHZ/Mobile-Actions
- Documentación de Google sobre FunctionGemma: https://ai.google.dev/gemma/docs/functiongemma
- Guía de fine-tuning para Mobile Actions: https://ai.google.dev/gemma/docs/mobile-actions
- Notebook de fine-tuning en Colab: https://colab.research.google.com/github/google-gemini/gemma-cookbook/blob/main/FunctionGemma/[FunctionGemma]Finetune_FunctionGemma_270M_for_Mobile_Actions_with_Hugging_Face.ipynb
- Otro fine-tune similar: https://huggingface.co/jprtr/functiongemma-270m-mobile-actions
