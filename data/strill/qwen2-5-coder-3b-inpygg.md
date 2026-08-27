# Strill/Qwen2.5-Coder-3B-InPyGG

## Resumen

El modelo **Strill/Qwen2.5-Coder-3B-InPyGG** es una conversión a formato GGUF del modelo Qwen2.5-Coder-3B-Instruct, realizada mediante la librería Unsloth. Se trata de un modelo de lenguaje especializado en generación y comprensión de código, basado en la arquitectura Qwen2.5, con 3.085.938.688 parámetros. El archivo incluido es una cuantización Q4_K_M, lo que lo hace adecuado para inferencia en hardware de consumo con requisitos de memoria moderados.

El modelo está pensado para su uso con `llama.cpp` y `Ollama`, tal como indica la model card. Al ser una versión instruct, está optimizado para seguir instrucciones y mantener conversaciones, aunque su tamaño reducido (3B) limita su capacidad en tareas de razonamiento complejo. Su relevancia radica en ofrecer una alternativa ligera y desplegable localmente para tareas de asistencia en programación, con un coste computacional bajo.

No se dispone de información sobre la licencia, los idiomas soportados ni los datos de entrenamiento específicos del finetune, por lo que estos aspectos deben considerarse con cautela antes de su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (Transformer decoder-only) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-Coder-3B soporta 32.768 tokens, pero no se confirma en esta conversión) |
| Tipos de cuantizacion | Q4_K_M (único archivo incluido) |
| Idiomas soportados | no disponible (el modelo base soporta principalmente inglés y chino, pero no se especifica para este finetune) |
| Licencia | no disponible (el modelo base Qwen2.5-Coder-3B-Instruct usa Apache 2.0, pero no se indica en la model card) |
| Formato de pesos | GGUF (safetensors no incluido) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2.5, un transformer decoder-only con atención causal. El modelo original Qwen2.5-Coder-3B-Instruct fue preentrenado sobre un corpus de más de 5,5 billones de tokens, con un enfoque en datos de código y razonamiento matemático, según el technical report de Qwen2.5-Coder. La versión aquí presentada es un finetune adicional realizado con Unsloth, que optimiza el entrenamiento y la conversión a GGUF. No se proporcionan detalles sobre el dataset de finetune, el número de pasos ni si se emplearon técnicas como RLHF o DPO.

La conversión a GGUF permite su ejecución eficiente en CPU y GPU mediante `llama.cpp` y `Ollama`, reduciendo el tamaño del modelo a 1,9 GB en cuantización Q4_K_M.

## Capacidades

- Generación de código en múltiples lenguajes de programación, basada en el entrenamiento del modelo base Qwen2.5-Coder.
- Seguimiento de instrucciones en formato conversacional, gracias a la variante instruct.
- Razonamiento matemático básico y comprensión de texto técnico.
- Soporte para completado de código y generación de fragmentos a partir de descripciones en lenguaje natural.
- Compatible con `llama.cpp` y `Ollama` para despliegue local.
- No se confirma soporte para tool calling, agentes o capacidades multimodales en esta conversión específica.

## Casos de uso

- Asistente de programación local: el modelo puede integrarse en editores de código o entornos de desarrollo para sugerir fragmentos de código, completar funciones o explicar sintaxis, funcionando sin conexión a internet.
- Generación de documentación técnica: a partir de un fragmento de código, puede generar comentarios o descripciones en lenguaje natural, útil para mantener repositorios documentados.
- Chatbot de soporte técnico: al ser un modelo instruct, puede responder preguntas frecuentes sobre lenguajes de programación o frameworks, desplegado en un servidor local con `Ollama`.
- Automatización de tareas de scripting: puede generar scripts de automatización (bash, Python, etc.) a partir de instrucciones simples, reduciendo el tiempo de desarrollo en entornos con recursos limitados.
- Educación y formación: sirve como herramienta de práctica para estudiantes de programación, ofreciendo ejemplos y explicaciones de código sin depender de servicios en la nube.
- Prototipado rápido: en entornos de desarrollo ágil, permite generar esqueletos de código o plantillas para nuevas funcionalidades, acelerando el ciclo de iteración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo base Qwen2.5-Coder-3B-Instruct tiene resultados conocidos en HumanEval, MBPP y otros, pero no se proporcionan datos específicos para este finetune ni para la cuantización Q4_K_M. Se recomienda evaluar el modelo en el caso de uso concreto antes de su adopción.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 3B parámetros cuantizado a Q4_K_M, el archivo pesa 1,9 GB. Se estima que requiere entre 2 y 3 GB de VRAM para inferencia en GPU, y puede ejecutarse en CPU con al menos 8 GB de RAM.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM, como NVIDIA GTX 1650, RTX 3060, RTX 4090, o GPUs de datacenter como A100 (aunque sería sobredimensionada). También funciona en Apple Silicon con Metal.
- Compatibilidad con hardware de consumo: sí, cabe en GPUs de gama media y baja, así como en sistemas sin GPU usando CPU.
- Opciones de despliegue: `llama.cpp` (con `llama-cli`), `Ollama` (incluye Modelfile), y cualquier servidor compatible con GGUF como `llama-cpp-python` o `text-generation-webui`.
- Latencia y throughput: no se dispone de datos medidos. En una GPU moderna, se espera una generación de decenas de tokens por segundo, pero depende del hardware y la configuración.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| Strill/Qwen2.5-Coder-3B-InPyGG | 3,09B | no disponible | no disponible | GGUF | Código, instruct |
| Qwen/Qwen2.5-Coder-3B-Instruct | 3,09B | 32.768 | Apache 2.0 | safetensors | Código, instruct |
| CodeLlama-3B (Meta) | 3,4B | 16.384 | Llama 2 license | safetensors | Código |
| StarCoder2-3B (BigCode) | 3B | 16.384 | OpenRAIL | safetensors | Código |

La comparativa se basa en el modelo base, ya que no hay datos específicos del finetune. El modelo de Strill ofrece la ventaja del formato GGUF para despliegue ligero, pero carece de información sobre licencia y rendimiento.

## Limitaciones y advertencias

- Al ser un modelo de 3B parámetros, su capacidad de razonamiento complejo y generación de código extenso es limitada en comparación con modelos más grandes (7B, 13B, 32B).
- La licencia no está especificada en la model card; aunque el modelo base usa Apache 2.0, el finetune podría tener restricciones adicionales. Se recomienda contactar al autor antes de uso comercial.
- No se dispone de información sobre sesgos o alucinaciones específicas, pero como todo modelo de lenguaje, puede generar código incorrecto o respuestas inventadas.
- El contexto máximo no está confirmado en esta conversión; si se usa con `llama.cpp`, se debe verificar la configuración para evitar truncamientos.
- La cuantización Q4_K_M puede degradar ligeramente la calidad de las respuestas en comparación con el modelo en precisión completa.
- No se garantiza soporte para tool calling o funciones de agente, ya que no se menciona en la documentación.

## Enlaces

- [HuggingFace - Strill/Qwen2.5-Coder-3B-InPyGG](https://huggingface.co/Strill/Qwen2.5-Coder-3B-InPyGG)
- [Modelo base - Qwen/Qwen2.5-Coder-3B](https://huggingface.co/Qwen/Qwen2.5-Coder-3B)
- [Versión Unsloth - unsloth/Qwen2.5-Coder-3B](https://huggingface.co/unsloth/Qwen2.5-Coder-3B)
- [Technical Report Qwen2.5-Coder (arXiv)](https://arxiv.org/html/2409.12186v2)
- [Repositorio GitHub de Qwen2.5-Coder](https://github.com/huggingface/Qwen2.5-Coder)
