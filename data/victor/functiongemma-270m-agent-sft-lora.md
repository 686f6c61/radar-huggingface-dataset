# victor/functiongemma-270m-agent-sft-lora

## Resumen

El modelo `victor/functiongemma-270m-agent-sft-lora` es un adaptador LoRA (r=16, alpha=32) desarrollado por el usuario `victor` sobre el modelo base `unsloth/functiongemma-270m-it`, que a su vez es una versión especializada de Gemma 3 270M de Google para function calling. El adaptador se ha fine-tuneado con 7.500 ejemplos de tool-calling agéntico del dataset `victor/functiongemma-agent-sft`, con el objetivo de generar llamadas a herramientas válidas en el estilo FunctionGemma: `read_file`, `write_file`, `edit_file`, `glob` y `bash`.

Este modelo resuelve el problema de convertir lenguaje natural en acciones ejecutables sobre un sistema de archivos y terminal, actuando como un agente local ligero. Su relevancia radica en que permite construir agentes privados, rápidos y de bajo coste que operan sin conexión, aprovechando un modelo base de solo 270M de parámetros. El adaptador está diseñado para ser cargado con la librería `peft` y se distribuye bajo licencia Gemma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 3 270M) con adaptador LoRA |
| Parametros totales | 270M (modelo base) + adaptador LoRA (no especificado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (max_length usado en entrenamiento) |
| Tipos de cuantizacion | no disponible (adaptador LoRA; el modelo base puede cuantizarse) |
| Idiomas soportados | no disponible |
| Licencia | Gemma |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo base es `unsloth/functiongemma-270m-it`, una versión de FunctionGemma (Gemma 3 270M) optimizada para function calling. Sobre este, se ha aplicado un adaptador LoRA con r=16, alpha=32 y dropout 0, aplicado a las proyecciones Q/K/V/O y a las capas gate/up/down del transformer. El entrenamiento se realizó con el dataset `victor/functiongemma-agent-sft` (7.500 ejemplos de tool-calling agéntico), dividido en 90% train y 10% eval (seed 42). La pérdida se calculó únicamente sobre los turnos del asistente (modelo), excluyendo el turno de developer, las declaraciones de herramientas, los prompts de usuario y las respuestas de herramientas, para que el adaptador aprenda a emitir llamadas correctas en lugar de memorizar el contexto.

Se usó el optimizador AdamW con learning rate 5e-5, programación coseno y warmup ratio 0.03, durante 3 épocas con batch efectivo de 32 (per-device batch 8, grad accum 4). El entrenamiento se realizó en precisión bf16 sobre una GPU A10G-small, con una duración aproximada de 24 minutos y un coste de unos 0,40 USD. No se aplicó RLHF ni DPO; es un fine-tuning supervisado estándar con LoRA.

## Capacidades

- Generación de llamadas a herramientas en formato FunctionGemma: `read_file`, `write_file`, `edit_file`, `glob` y `bash`.
- Soporte de tool calling / function calling para agentes que operan sobre sistema de archivos y terminal.
- Capacidad de razonamiento multi-paso limitada, heredada del modelo base de 270M.
- Generación de texto conversacional básico.
- Funciona como agente local privado, sin necesidad de conexión a internet.
- No soporta visión ni audio; es exclusivamente texto.

## Casos de uso

- Automatización de tareas de gestión de archivos: el modelo puede interpretar instrucciones en lenguaje natural como "crea un directorio llamado proyectos y mueve todos los .txt ahí" y generar las llamadas `bash` o `write_file` correspondientes.
- Asistente de edición de código: dado un prompt que describe un cambio en un archivo, el modelo emite llamadas `edit_file` o `write_file` para modificar el contenido, útil en entornos de desarrollo locales.
- Agente de terminal conversacional: integrado en una aplicación de chat, el modelo traduce comandos de usuario a llamadas `bash` y ejecuta operaciones de shell de forma segura y controlada.
- Prototipado rápido de agentes tool-calling: al ser un adaptador ligero, se puede cargar en entornos de desarrollo para probar flujos de agente sin necesidad de un LLM grande.
- Automatización de pipelines de datos locales: el modelo puede generar secuencias de `glob` y `read_file` para localizar y procesar archivos según criterios expresados en lenguaje natural.
- Asistente de documentación técnica: dado un repositorio, el modelo puede generar llamadas `read_file` para extraer contenido y luego resumir o responder preguntas sobre el código, aunque con las limitaciones de un modelo de 270M.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card del adaptador reporta los siguientes resultados sobre un conjunto de evaluación retenido de 750 ejemplos del mismo dataset sintético, midiendo solo los tokens de los turnos del asistente:

| Modelo | Eval loss | Eval token accuracy |
|---|---|---|
| Base (`functiongemma-270m-it`) | 4.03 | 0.619 |
| **Adaptador LoRA** | **0.0037** | **0.9982** |

Estos números indican un ajuste casi perfecto a la distribución objetivo del dataset sintético, pero no demuestran generalización a escenarios de herramientas no vistos. El autor advierte explícitamente que son métricas de ajuste, no de generalización.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base tiene 270M de parámetros, lo que en bf16 ocupa aproximadamente 540 MB. Con el adaptador LoRA y overhead de inferencia, cabe en menos de 1 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM, incluyendo tarjetas consumer como GTX 1050 Ti, RTX 2060, RTX 3060, etc. También puede ejecutarse en CPU con baja latencia.
- El entrenamiento se realizó en una A10G-small, pero para inferencia no se requiere ese nivel.
- Opciones de despliegue: al ser un adaptador LoRA, se puede cargar con `transformers` + `peft` en Python, o exportar a GGUF (el autor publicó `victor/functiongemma-agent-gguf`) para usarlo con `llama.cpp` u Ollama.
- Latencia y throughput: no se han publicado mediciones, pero por el tamaño del modelo se espera una latencia de decenas de milisegundos en GPU y de cientos de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| `victor/functiongemma-270m-agent-sft-lora` | 270M + LoRA | 8192 | Gemma | Tool-calling agéntico (archivos y bash) |
| `unsloth/functiongemma-270m-it` (base) | 270M | 8192 | Gemma | Function calling general |
| FunctionGemma (original de Google) | 270M | 8192 | Gemma | Function calling general |

El adaptador mejora al modelo base en la tarea específica de generar llamadas a herramientas de archivos y terminal, pero pierde generalidad. No se dispone de comparativas con otros modelos de la misma categoría (por ejemplo, modelos pequeños de tool-calling como TinyLlama fine-tuneado o Qwen2.5-0.5B con function calling) en la informacion proporcionada.

## Limitaciones y advertencias

- El adaptador está entrenado sobre un dataset sintético de 7.500 ejemplos; su rendimiento en escenarios reales no validados puede ser significativamente inferior.
- Las métricas reportadas (eval loss 0.0037, token accuracy 0.9982) reflejan ajuste al dataset, no generalización a herramientas o formatos no vistos.
- El modelo base de 270M tiene capacidades de razonamiento limitadas; puede alucinar llamadas a herramientas inexistentes o malformadas fuera de su distribución de entrenamiento.
- No se especifican los idiomas soportados; el dataset probablemente esté en inglés, por lo que el rendimiento en otros idiomas es incierto.
- La licencia Gemma impone restricciones de uso comercial; es necesario revisar los términos específicos de la licencia antes de desplegar en producción.
- El adaptador solo cubre cinco herramientas (`read_file`, `write_file`, `edit_file`, `glob`, `bash`); no soporta otras APIs o herramientas sin un fine-tuning adicional.
- No se han publicado evaluaciones de seguridad, sesgos o robustez; se recomienda auditar el modelo antes de usarlo en entornos sensibles.

## Enlaces

- [Adaptador LoRA en HuggingFace](https://huggingface.co/victor/functiongemma-270m-agent-sft-lora)
- [Dataset de entrenamiento](https://huggingface.co/datasets/victor/functiongemma-agent-sft)
- [Versión GGUF del adaptador](https://huggingface.co/victor/functiongemma-agent-gguf)
- [Modelo base unsloth/functiongemma-270m-it](https://huggingface.co/unsloth/functiongemma-270m-it)
- [Documentación de FunctionGemma de Google](https://ai.google.dev/gemma/docs/functiongemma)
- [Model card de FunctionGemma](https://ai.google.dev/gemma/docs/functiongemma/model_card)
- [Blog de Google sobre FunctionGemma](https://blog.google/innovation-and-ai/technology/developers-tools/functiongemma/)
