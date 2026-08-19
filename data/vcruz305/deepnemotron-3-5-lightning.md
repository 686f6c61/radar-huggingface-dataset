# vcruz305/DeepNemotron-3.5-Lightning

## Resumen

DeepNemotron-3.5-Lightning es un adaptador LoRA de bajo rango (r=16, α=32) desarrollado por vcruz305 sobre el modelo base NVIDIA Nemotron 3.5 Lightning 30B-A3B, un modelo de lenguaje de arquitectura MoE híbrida que combina atención transformer con capas Mamba (SSM). El adaptador se ha entrenado específicamente sobre el dataset `r0b0tlab/deepseek-v4-pro-0813-agentic` (división `sft_openai`, 19.072 filas) con el objetivo de potenciar las capacidades agentic del modelo base, es decir, su habilidad para seguir instrucciones complejas, encadenar razonamientos y gestionar herramientas.

La relevancia de este adaptador radica en que permite especializar un modelo MoE eficiente (30B parámetros totales, 3B activos) en tareas de agente con un coste de entrenamiento reducido (secuencia máxima de 512 tokens, cuantización 4-bit durante el entrenamiento). Al ser un adaptador PEFT, el despliegue es ligero: se carga el modelo base y se aplica el adaptador en memoria, sin necesidad de reentrenar pesos completos. El autor también publica una versión empaquetada en GGUF para inferencia local con llama.cpp u Ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida (atención transformer + capas Mamba) con adaptador LoRA |
| Parametros totales | 30B (modelo base) + 6.648.832 (adaptador LoRA) |
| Parametros activos | 3B (A3B) |
| Longitud de contexto | no disponible (entrenado con max seq 512; el modelo base puede soportar más) |
| Tipos de cuantizacion | 4-bit (Q4') durante entrenamiento; GGUF disponible |
| Idiomas soportados | en (inglés) |
| Licencia | nvidia-openmdw-and-dataset-other |
| Formato de pesos | PEFT (adaptador LoRA en safetensors); GGUF para el paquete completo |

## Arquitectura y entrenamiento

El modelo base, NVIDIA Nemotron 3.5 Lightning 30B-A3B, emplea una arquitectura MoE híbrida que intercala bloques de atención estándar con capas Mamba (SSM), lo que reduce el coste computacional manteniendo capacidad de modelado de secuencias largas. El adaptador LoRA se aplica a las proyecciones de atención (q/k/v/o), a la proyección de entrada de las capas Mamba (`in_proj`) y a las proyecciones up/down de los expertos compartidos (`shared_experts`), dejando intactos los expertos enrutados, el router y la proyección de salida de Mamba.

El entrenamiento se realizó con Unsloth sobre una GPU Modal A100-80, con torch 2.7.1 y cuantización 4-bit del modelo base. Se utilizó una secuencia máxima de 512 tokens (1024 provocaba OOM en filas largas, ocupando 79/80 GB). El dataset de entrenamiento, `deepseek-v4-pro-0813-agentic`, contiene conversaciones de tipo agente (instrucciones, llamadas a herramientas, razonamiento multi-paso) y su licencia es `other` (relacionada con la API de DeepSeek), lo que condiciona los términos de uso del adaptador resultante. El autor señala que fue necesario un parche para el fallback de autocast en `_grouped_mm` con torch 2.7.1.

## Capacidades

- Generación de texto y razonamiento multi-paso, heredadas del modelo base Nemotron 3.5 Lightning.
- Capacidades agentic mejoradas: seguimiento de instrucciones complejas, encadenamiento de llamadas a herramientas y razonamiento intermedio, gracias al entrenamiento sobre el dataset agentic de DeepSeek.
- Soporte de tool calling / function calling (implícito por el dataset de entrenamiento y la arquitectura del base).
- Capacidades multilingües del modelo base (aunque el adaptador se entrenó solo en inglés).
- Soporte de cuantización GGUF para despliegue ligero en CPU/GPU consumer.
- Integración con el ecosistema PEFT/HuggingFace Transformers mediante `PeftModel`.

## Casos de uso

- Asistentes de código con herramientas: el adaptador puede gestionar conversaciones donde el modelo debe decidir qué herramienta invocar (búsqueda en repositorio, ejecución de tests) y encadenar varias llamadas para completar una tarea de programación.
- Automatización de flujos de trabajo con agentes: integración en pipelines donde el modelo recibe una tarea de alto nivel (p. ej., "prepara un informe a partir de estos datos") y debe descomponerla en pasos, consultar APIs y resumir resultados.
- Chatbots de soporte técnico con acceso a base de conocimiento: el modelo puede usar tool calling para consultar documentación interna o tickets previos antes de responder, gracias a su entrenamiento en diálogos agentic.
- Generación de código en producción con verificación: al poder razonar sobre múltiples pasos y llamar a herramientas de análisis estático, es adecuado para sugerir parches y validarlos en entornos CI/CD.
- Prototipado rápido de agentes conversacionales: al ser un adaptador ligero sobre un MoE eficiente, permite experimentar con comportamientos agentic en hardware modesto (GPU consumer con 24 GB) usando GGUF.
- Investigación en eficiencia de adaptación: sirve como caso de estudio de cómo un LoRA de bajo rango puede transferir capacidades agentic de un dataset propietario a un modelo base abierto, con métricas de entrenamiento documentadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta métricas como MMLU, HumanEval o GSM8K para el adaptador ni comparaciones con el modelo base sin adaptar.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base en 4-bit requiere aproximadamente 16-18 GB; con el adaptador LoRA añadido, el uso se mantiene en ese rango. La versión GGUF Q4_K_M puede caber en 16 GB.
- GPU recomendadas: A100-80 (usada en entrenamiento), RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia con cuantización 4-bit. Para GGUF, una RTX 3060 12 GB o incluso CPU con 32 GB de RAM son viables.
- Opciones de despliegue: vLLM, TGI, llama.cpp (vía GGUF), Ollama (vía GGUF), y HuggingFace Transformers con PEFT.
- Latencia y throughput: no disponibles. Como referencia, un MoE 30B-A3B en 4-bit genera típicamente entre 20 y 60 tokens/s en una RTX 4090, pero no hay mediciones publicadas para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros (activos) | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepNemotron-3.5-Lightning (adaptador) | 30B (3B) | no disp. | MoE híbrida + LoRA | nvidia-openmdw-and-dataset-other | HF (PEFT, GGUF) |
| Qwen2.5-32B-A3B | 32B (3B) | 128K | MoE densa | Apache 2.0 | HF, Ollama, vLLM |
| Mixtral-8x7B | 47B (13B) | 32K | MoE densa | Apache 2.0 | HF, Ollama, vLLM |

El adaptador se diferencia por su especialización agentic, pero el modelo base comparte rango de parámetros activos con Qwen2.5-32B-A3B, que además ofrece contexto mucho más largo y licencia permisiva. Mixtral-8x7B es más pesado en activos pero también es Apache 2.0. La licencia del adaptador es más restrictiva y el contexto de entrenamiento corto (512 tokens) puede limitar su uso en tareas de memoria larga.

## Limitaciones y advertencias

- La licencia del adaptador (`nvidia-openmdw-and-dataset-other`) no es permisiva tipo MIT/Apache; el autor advierte explícitamente que no debe tratarse como tal y que el uso comercial debe evaluarse bajo los términos del modelo base y del dataset de entrenamiento.
- El entrenamiento se realizó con secuencias de solo 512 tokens, lo que puede degradar el rendimiento en tareas que requieren contexto largo, aunque el modelo base soporte ventanas mayores.
- El adaptador solo se entrenó en inglés; su rendimiento en otros idiomas puede ser inferior al del modelo base sin adaptar.
- No hay benchmarks publicados, por lo que no se puede cuantificar la mejora real frente al base ni frente a alternativas.
- Riesgo de alucinación y sesgos inherentes al modelo base y al dataset de entrenamiento (derivado de datos de DeepSeek API), que no han sido evaluados ni mitigados.
- Para producción, se recomienda validar el comportamiento agentic con tests específicos y considerar un fine-tuning adicional con datos propios si la tarea difiere del dominio del dataset.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/vcruz305/DeepNemotron-3.5-Lightning
- Versión GGUF: https://huggingface.co/vcruz305/DeepNemotron-3.5-Lightning-GGUF
- Modelo base (Unsloth): https://huggingface.co/unsloth/NVIDIA-Nemotron-3.5-Lightning-30B-A3B
- Dataset de entrenamiento: https://huggingface.co/datasets/r0b0tlab/deepseek-v4-pro-0813-agentic
