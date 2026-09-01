# SurjoLabs/Blaze-SFT

## Resumen

Blaze-SFT es un modelo de lenguaje causal de 48,3 millones de parámetros desarrollado por SurjoLabs, resultado de un ajuste fino supervisado (SFT) sobre el modelo base SurjoLabs/Blaze. Está diseñado para tareas de generación de texto conversacional y su tamaño reducido lo hace apto para entornos con recursos limitados, como dispositivos edge o inferencia en CPU. El modelo se publica bajo acceso restringido (gated) en Hugging Face, lo que obliga a aceptar condiciones antes de su descarga.

El modelo base Blaze se posiciona como el mejor en la categoría de menos de 50 millones de parámetros en el Open SLM Leaderboard, con una puntuación de 15,45 en el Intelligence Index. Blaze-SFT hereda esta arquitectura compacta y añade un entrenamiento supervisado orientado a conversación, lo que lo convierte en una opción interesante para prototipos y aplicaciones ligeras de chat. Su ventana de contexto es de 2K tokens y su huella de VRAM estimada es de solo 0,2 GB, lo que permite ejecutarlo incluso en hardware de consumo antiguo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje causal (transformer, detalles no disponibles) |
| Parametros totales | 48.251.136 |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | 2.048 tokens (según LLM Explorer) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura de Blaze-SFT es un modelo de lenguaje causal de tipo transformer, aunque no se han publicado detalles concretos sobre el número de capas, dimensiones ocultas o mecanismos de atención. Al ser un modelo de 48,3 millones de parámetros, se trata de un "small language model" (SLM) optimizado para eficiencia. El entrenamiento de Blaze-SFT se realizó mediante ajuste fino supervisado (SFT) utilizando la librería TRL y el framework transformers, partiendo del checkpoint base SurjoLabs/Blaze. No se dispone de información sobre el dataset de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas adicionales como RLHF o DPO.

La etiqueta `custom_code` en Hugging Face indica que el modelo requiere código personalizado para su carga, probablemente una clase de configuración o arquitectura no estándar. Tampoco se detalla si hay innovaciones como atención lineal o decodificación especulativa.

## Capacidades

- Generación de texto conversacional: modelo entrenado con SFT para diálogo, aunque no se especifican los datos de conversación utilizados.
- Razonamiento básico: al ser un modelo pequeño, su capacidad de razonamiento complejo es limitada, pero puede manejar tareas simples de lenguaje.
- No se indica soporte para tool calling, function calling, agentes, visión o audio.
- Capacidades multilingües: no disponibles (no se especifican idiomas).
- Sin modo de pensamiento ("thinking mode") documentado.

## Casos de uso

- Asistentes conversacionales ligeros: Blaze-SFT puede integrarse en chatbots para tareas de atención al cliente sencillas, donde el bajo consumo de recursos permite desplegarlo en servidores modestos o incluso en dispositivos embebidos con 0,2 GB de VRAM.
- Prototipado rápido: su tamaño reducido facilita experimentos de fine-tuning adicional o pruebas de concepto en entornos de desarrollo sin GPU de gama alta.
- Generación de texto en dispositivos edge: al requerir tan poca memoria, es viable ejecutarlo en Raspberry Pi o similares para aplicaciones de generación de respuestas automáticas.
- Clasificación o extracción de información simple: aunque no está optimizado para ello, puede usarse como base para tareas de texto corto con fine-tuning posterior.
- Educación e investigación: útil para estudiar el comportamiento de SLMs en tareas de conversación y comparar con modelos más grandes.
- Complemento en pipelines de IA: como modelo auxiliar para generar respuestas cortas o resúmenes en sistemas donde el coste computacional es crítico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para Blaze-SFT en la información disponible. El modelo base Blaze obtiene una puntuación de 15,45 en el Intelligence Index del Open SLM Leaderboard, ocupando el primer puesto en la categoría de menos de 50 millones de parámetros. No se dispone de resultados en MMLU, HumanEval, GSM8K u otras pruebas estándar para esta variante SFT.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,2 GB según LLM Explorer, lo que permite ejecución en GPU integradas o CPUs con memoria compartida.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM (por ejemplo, NVIDIA GTX 1050 Ti, Jetson Nano, o incluso integradas Intel/AMD).
- Cabe en GPU de consumo: sí, en prácticamente cualquier tarjeta moderna e incluso en dispositivos sin GPU dedicada.
- Opciones de despliegue: al ser un modelo transformers estándar, puede servirse con vLLM, TGI, o mediante llama.cpp si se convierte a GGUF (aunque no se proporcionan cuantizaciones oficiales). También es compatible con Hugging Face Inference Endpoints.
- Latencia y throughput: no se han publicado datos, pero por su tamaño se espera una latencia de pocos milisegundos por token en CPU moderna.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con otras alternativas de la misma categoría (menos de 50M de parámetros). Modelos como TinyLlama (1.1B) o Qwen2-0.5B son más grandes y no comparables directamente. Se puede mencionar que Blaze-SFT compite en el espacio de SLMs extremadamente pequeños, pero sin datos de benchmarks públicos adicionales no es posible una comparación numérica.

## Limitaciones y advertencias

- Acceso restringido: el modelo es gated, lo que requiere aceptar condiciones de uso en Hugging Face; esto puede limitar su adopción en producción.
- Licencia no especificada: no se indica si permite uso comercial, lo que supone un riesgo legal para proyectos empresariales.
- Contexto limitado: solo 2K tokens, insuficiente para tareas que requieran documentos largos o historiales extensos.
- Idiomas desconocidos: no se documenta qué lenguas soporta, lo que dificulta su uso en aplicaciones multilingües.
- Capacidades de razonamiento limitadas: al ser un modelo de 48M de parámetros, su rendimiento en tareas complejas (matemáticas, código, razonamiento multi-paso) será muy inferior al de modelos de cientos de millones o miles de millones de parámetros.
- Riesgo de alucinaciones: común en modelos pequeños, especialmente fuera de su dominio de entrenamiento.
- Dependencia de código personalizado: la etiqueta `custom_code` implica que la carga requiere código adicional, lo que puede complicar el despliegue en infraestructuras estándar.

## Enlaces

- Modelo Blaze-SFT en Hugging Face: https://huggingface.co/SurjoLabs/Blaze-SFT
- Modelo base Blaze: https://huggingface.co/SurjoLabs/Blaze
- Perfil de la organización SurjoLabs: https://huggingface.co/SurjoLabs
- Ficha de Blaze en LLM Explorer: https://llm-explorer.com/model/SurjoLabs%2FBlaze,60blN3ngDui0MYr2PhSg9f
