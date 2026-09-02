# zurichquants/Inkling-Small-UD-Q4_K_XL-layers

## Resumen

Inkling-Small-UD-Q4_K_XL-layers es un paquete de capas GGUF del modelo multimodal Inkling-Small, desarrollado por Thinking Machines Lab, cuantizado y empaquetado por zurichquants para su ejecución distribuida con Mesh LLM. El modelo original es un MoE de 276B parámetros totales (12B activos) con soporte nativo para texto, imagen y audio, y una ventana de contexto de 1M tokens. Este paquete permite ejecutar el modelo en clústeres locales de varias máquinas, ofreciendo una API compatible con OpenAI.

La relevancia de este paquete radica en que facilita la inferencia privada y distribuida de un modelo de gran tamaño sin depender de servicios en la nube. Al dividir el GGUF en capas individuales, Mesh LLM puede repartir la carga entre múltiples hosts, lo que hace viable ejecutar un modelo de 276B en hardware modesto. El paquete incluye también los proyectores multimodales (mmproj) en varias precisiones, lo que permite usar las capacidades de visión del modelo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) multimodal |
| Parametros totales | 276B (modelo original); 245M en safetensors del paquete cuantizado |
| Parametros activos | 12B |
| Longitud de contexto | 1M tokens |
| Tipos de cuantizacion | UD-Q4_K_XL (este paquete); otras disponibles en unsloth/Inkling-Small-GGUF |
| Idiomas soportados | No disponible (modelo multilingue segun documentacion oficial) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (empaquetado por capas para Mesh LLM) |

## Arquitectura y entrenamiento

El modelo base Inkling-Small es un transformer MoE con 276B parametros totales y 12B activos, diseñado por Thinking Machines Lab. Acepta entradas multimodales (texto, imagen y audio) y genera texto. El entrenamiento incluye tecnicas de razonamiento controlable, aunque no se detallan en la informacion disponible. El paquete de zurichquants divide el GGUF original en 42 capas (mas embeddings, output head y proyectores de vision) para permitir inferencia distribuida a traves de Mesh LLM. Cada artefacto esta verificado con SHA-256, lo que garantiza la integridad de los pesos.

## Capacidades

- Generacion de texto, razonamiento, codigo y matematicas.
- Entrada multimodal: texto, imagen y audio.
- Soporte de tool calling y function calling.
- Capacidades de agente y razonamiento multi-paso.
- Esfuerzo de razonamiento controlable.
- Multilingue (idiomas no especificados).

## Casos de uso

- Inferencia local privada: ejecutar el modelo en hardware propio sin enviar datos a la nube, ideal para entornos con requisitos de confidencialidad.
- Servido multi-maquina: repartir las capas entre varios hosts cuando el modelo no cabe en una sola GPU, aprovechando la memoria agregada del cluster.
- API compatible con OpenAI: integrar el modelo en aplicaciones existentes mediante `/v1/chat/completions`, sin cambios en el codigo cliente.
- Asistentes de codigo: generar y revisar codigo con tool calling, integrable en pipelines de CI/CD para revision automatica.
- Chatbots conversacionales: gestionar dialogos largos gracias al contexto de 1M tokens, manteniendo el historial completo de la conversacion.
- Analisis multimodal: procesar imagenes y audio junto con texto para tareas de comprension visual o auditiva, como descripcion de imagenes o transcripcion asistida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El paquete completo ocupa 153.1 GB, por lo que se necesita al menos 160 GB de almacenamiento y VRAM suficiente para las capas asignadas.
- Con cuantizacion Q4, se estima que el modelo puede caber en varias GPUs de 24 GB (por ejemplo, 4x RTX 4090 o 2x A100 80GB), aunque la distribucion depende de Mesh LLM.
- Opciones de despliegue: Mesh LLM (recomendado), llama.cpp (si se reconstruye el GGUF), vLLM (con adaptaciones).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos especificos en la informacion proporcionada. El modelo compite con otros MoE multimodales como Qwen2.5-VL-72B o Llama 3.2 90B, pero no hay benchmarks publicados en este paquete.

## Limitaciones y advertencias

- El paquete esta disenado exclusivamente para Mesh LLM; no es un GGUF estandar y requiere la herramienta `skippy` para su uso.
- El tamano del paquete (153 GB) requiere infraestructura considerable, tanto en almacenamiento como en memoria.
- No se documentan sesgos especificos del modelo base en esta ficha.
- Riesgo de alucinacion inherente a los modelos generativos, especialmente en tareas de razonamiento complejo.
- La licencia Apache 2.0 permite uso comercial, pero se deben revisar los terminos del modelo base y de las dependencias.

## Enlaces

- Paquete en HuggingFace: https://huggingface.co/zurichquants/Inkling-Small-UD-Q4_K_XL-layers
- Modelo base GGUF: https://huggingface.co/unsloth/Inkling-Small-GGUF
- Model card oficial de Inkling-Small: https://thinkingmachines.ai/model-card/inkling-small/
- Anuncio de Inkling-Small: https://thinkingmachines.ai/news/inkling-small/
- Documentacion de Unsloth: https://unsloth.ai/docs/models/inkling
- Mesh LLM: https://github.com/Mesh-LLM/mesh-llm
