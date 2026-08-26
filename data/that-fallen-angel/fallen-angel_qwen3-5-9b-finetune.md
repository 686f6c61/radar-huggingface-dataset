# that-fallen-angel/fallen-angel_qwen3.5-9b-finetune

## Resumen

`fallen-angel_qwen3.5-9b-finetune` es un ajuste fino del modelo multimodal Qwen3.5-9B, desarrollado por el usuario de Hugging Face `that-fallen-angel` y convertido a formato GGUF mediante la librería Unsloth. El modelo base, Qwen3.5-9B, es un modelo denso de 9 mil millones de parámetros con arquitectura híbrida (Gated DeltaNet + Gated Attention), 32 capas, un codificador de visión y una ventana de contexto nativa de 262 144 tokens, extensible hasta aproximadamente 1 010 000 tokens. Está diseñado para seguir instrucciones multimodales y realizar llamadas a herramientas.

El finetune aquí presentado se distribuye como un único archivo GGUF cuantizado (`gemma-7b.Q4_K_M.gguf`), lo que facilita su ejecución con llama.cpp y motores compatibles. El repositorio no proporciona detalles sobre el conjunto de datos de ajuste, la licencia o los idiomas soportados, pero al heredar las capacidades del modelo base, puede utilizarse para tareas de texto y visión, así como para razonamiento y generación de código.

Aunque el modelo aún no cuenta con descargas ni métricas de popularidad, su interés radica en ofrecer una versión cuantizada y lista para ejecutar de un modelo multimodal reciente y eficiente, con un tamaño que cabe en GPUs de consumo medio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated DeltaNet + Gated Attention (modelo base Qwen3.5-9B) |
| Parametros totales | 8.537.680.896 (≈8.54 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens (nativo, según base); extensible a ~1 010 000 tokens |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | No disponible (se hereda del base, que soporta múltiples idiomas) |
| Licencia | No disponible |
| Formato de pesos | GGUF (archivo `gemma-7b.Q4_K_M.gguf`) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B emplea una arquitectura híbrida que combina *Gated DeltaNet* (un mecanismo de atención lineal con puertas) y *Gated Attention* (atención softmax con puertas), junto con un codificador de visión. Esta combinación busca equilibrar la eficiencia computacional con la calidad en tareas de razonamiento de contexto largo. El modelo fue entrenado como un modelo de lenguaje multimodal, capaz de procesar tanto texto como imágenes, y posteriormente ajustado mediante *post-training* para mejorar la instrucción y el uso de herramientas.

El finetune de `that-fallen-angel` fue realizado con Unsloth, una librería que optimiza el entrenamiento y la conversión de modelos. El proceso incluyó un ajuste del token BOS para garantizar la compatibilidad con GGUF y llama.cpp. No se dispone de detalles sobre el dataset de ajuste, la cantidad de pasos o si se usaron técnicas como RLHF o DPO. El repositorio solo contiene el archivo GGUF, sin los pesos originales en safetensors.

## Capacidades

- **Generación de texto y razonamiento**: maneja instrucciones complejas, preguntas de conocimiento, razonamiento lógico y matemático.
- **Procesamiento multimodal**: acepta imágenes como entrada junto con texto, gracias al codificador de visión del modelo base (no se confirma que el finetune lo conserve, pero es lo esperado).
- **Tool calling**: soporta llamadas a funciones y herramientas, útil para agentes que interactúan con APIs.
- **Contexto largo**: con 262 144 tokens nativos, puede procesar documentos extensos, conversaciones de muchas vueltas o análisis de código de gran tamaño.
- **Generación de código**: aunque no se especifica en la model card, el modelo base Qwen3.5-9B es competente en tareas de programación.
- **Capacidades multilingües**: el modelo base soporta múltiples idiomas, aunque el finetune no detalla cuáles.

## Casos de uso

- **Asistente de atención al cliente**: con su ventana de contexto de 262K tokens, puede manejar conversaciones largas y recordar detalles de interacciones anteriores, respondiendo en lenguaje natural con soporte de herramientas para consultar bases de datos.
- **Análisis de documentos técnicos**: permite extraer información de manuales, informes o papers de gran extensión, y responder preguntas sobre su contenido, incluso con imágenes o diagramas.
- **Generación y revisión de código**: puede generar código, explicar fragmentos y detectar errores en repositorios grandes, gracias a su contexto amplio y su capacidad de razonamiento.
- **Chatbot multimodal**: integrarse en aplicaciones de chat que reciben fotos o capturas de pantalla, describiendo su contenido y respondiendo a preguntas sobre ellas.
- **Extracción de datos de imágenes**: procesar formularios, facturas o gráficos y convertir la información en texto estructurado.
- **Agente de razonamiento multi-paso**: descomponer problemas complejos en pasos intermedios y ejecutar llamadas a herramientas (por ejemplo, calculadoras o búsquedas web) para llegar a una respuesta final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este finetune en la información disponible. El modelo base Qwen3.5-9B ha mostrado buen rendimiento en tareas multimodales y de razonamiento de contexto largo, pero no se incluyen métricas numéricas en la documentación consultada.

## Requisitos de hardware

- **VRAM estimada**: el archivo GGUF Q4_K_M ocupa aproximadamente 5.3 GB, por lo que se puede ejecutar en GPUs con al menos 6 GB de VRAM (por ejemplo, RTX 3060, RTX 4060). Para inferencia más rápida se recomiendan 8-12 GB.
- **GPUs recomendadas**: RTX 3090, RTX 4090, A100, H100 para velocidades mayores y mayor batch size.
- **Compatibilidad con GPUs de consumo**: sí, cabe en GPUs de gama media y alta de consumo (RTX 3060 en adelante).
- **Opciones de despliegue**: llama.cpp, Ollama, llama-cpp-python, vLLM (si se convierte a otro formato), o la interfaz `llama-cli` de llama.cpp.
- **Latencia**: no disponible en la información; depende del hardware y de la longitud de la secuencia. Con contexto largo, la latencia aumentará proporcionalmente.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Formato |
|---|---|---|---|---|---|
| fallen-angel_qwen3.5-9b-finetune | 8.54 B | 262 K | Híbrida (Gated DeltaNet + Gated Attention) | No disponible | GGUF |
| Qwen2.5-7B | 7.6 B | 32 K | Transformer clásico | Apache 2.0 | safetensors, GGUF |
| Llama-3.2-8B | 8.0 B | 128 K | Transformer clásico | Llama 3.2 Community License | safetensors, GGUF |
| Gemma-3-9B | 9.0 B | 32 K | Transformer clásico | Gemma Terms of Use | safetensors, GGUF |

Nota: la comparativa se basa en las características de los modelos base, no en el finetune específico. El finetune destaca por su contexto de 262 K tokens, muy superior a los otros, y por su capacidad multimodal, que Gemma-3 también posee.

## Limitaciones y advertencias

- **Licencia no especificada**: el repositorio no indica licencia, por lo que su uso comercial es incierto. Se debe contactar al autor antes de utilizarlo en producción.
- **Idiomas no documentados**: aunque el modelo base soporta varios idiomas, el finetune no detalla qué idiomas ha sido ajustado o cuáles conserva.
- **Riesgo de alucinación**: como todo modelo de lenguaje, puede generar información falsa o no verificada, especialmente en tareas de razonamiento complejo o con datos fuera de su entrenamiento.
- **Sesgos**: no se han publicado evaluaciones de sesgos para este finetune; se recomienda probarlo en escenarios específicos antes de su despliegue.
- **Nombre del archivo**: el archivo GGUF se llama `gemma-7b.Q4_K_M.gguf`, lo que puede indicar un error de nomenclatura o que el modelo se basa en una arquitectura de Gemma (aunque el nombre del repositorio indica Qwen3.5-9B). Se recomienda verificar el contenido antes de usarlo.
- **Sin soporte oficial**: el modelo no tiene descargas ni likes, lo que sugiere que es un trabajo experimental sin garantías de estabilidad.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/that-fallen-angel/fallen-angel_qwen3.5-9b-finetune)
- [Unsloth (librería usada para el finetune)](https://github.com/unslothai/unsloth)
- [Página de Qwen3.5-9B en AI Catalog de Microsoft](https://ai.azure.com/catalog/models/qwen--qwen3.5-9b)
- [Recetas vLLM para Qwen3.5-9B](https://recipes.vllm.ai/Qwen/Qwen3.5-9B)
- [Fireworks AI - Qwen3.5 9B API](https://fireworks.ai/models/fireworks/qwen3p5-9b)
