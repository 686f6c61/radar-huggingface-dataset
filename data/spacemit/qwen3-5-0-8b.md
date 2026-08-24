# SpacemiT/Qwen3.5-0.8B

## Resumen

SpacemiT/Qwen3.5-0.8B es una versión en formato GGUF del modelo Qwen3.5-0.8B, el miembro más pequeño de la familia Qwen3.5 desarrollada por Alibaba Cloud. Con 752 millones de parámetros, está diseñado para despliegues en dispositivos con recursos limitados, como smartphones, hardware embebido o como modelo borrador en decodificación especulativa junto a checkpoints más grandes de Qwen3.5. Su arquitectura híbrida de redes delta con puertas (hybrid gated delta networks) y su ventana de contexto de 262 000 tokens lo convierten en una opción atractiva para tareas de razonamiento y comprensión de documentos largos en entornos de baja latencia. Además, incluye soporte nativo de visión, lo que lo hace multimodal.

El modelo opera por defecto en modo no pensante (non-thinking), aunque la familia Qwen3.5 soporta un modo híbrido de pensamiento explícito. Su licencia Apache-2.0 y su tamaño compacto facilitan su integración en aplicaciones comerciales y de investigación, especialmente en escenarios donde la privacidad y el procesamiento local son prioritarios. La publicación en formato GGUF por parte de SpacemiT permite ejecutarlo directamente con herramientas como llama.cpp u Ollama, sin necesidad de conversión adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hybrid gated delta networks (densa) |
| Parametros totales | 752 393 024 (0,75 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 000 tokens |
| Tipos de cuantizacion | No disponible (formato GGUF, sin detalle de variantes) |
| Idiomas soportados | No disponible (familia Qwen3.5 multilingue) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura de Qwen3.5-0.8B se basa en redes delta con puertas (gated delta networks), un diseño híbrido que combina mecanismos de atención con capas recurrentes eficientes. Esta combinación permite mantener una ventana de contexto de 262 000 tokens con un coste computacional reducido, adecuado para dispositivos con poca memoria. El modelo es denso, es decir, todos los parámetros se activan en cada inferencia, lo que simplifica su despliegue frente a arquitecturas de mezcla de expertos.

No se han publicado en la información disponible detalles específicos sobre el dataset de entrenamiento, el número de tokens procesados o el uso de técnicas como RLHF o DPO. Sin embargo, la familia Qwen3.5 de Alibaba Cloud incorpora mejoras en razonamiento e instrucción respecto a Qwen3, y el modelo soporta un modo híbrido de pensamiento explícito (thinking) que se puede activar o desactivar según la tarea. El checkpoint base está disponible en Hugging Face como Qwen/Qwen3.5-0.8B-Base, lo que sugiere un entrenamiento previo extenso seguido de un ajuste fino instructivo.

## Capacidades

- Generacion de texto y razonamiento: capaz de mantener conversaciones multi-turno y resolver tareas de razonamiento logico basico gracias a su modo thinking opcional.
- Vision nativa: acepta entradas de imagen ademas de texto, lo que permite tareas de descripcion, respuesta a preguntas visuales y OCR.
- Ventana de contexto larga: 262 000 tokens, suficiente para procesar documentos extensos o historiales de conversacion prolongados.
- Modo de pensamiento hibrido: puede operar en modo no pensante (por defecto) o activar el modo pensante para tareas que requieren razonamiento explicito.
- Eficiencia en edge: disenado para ejecutarse en dispositivos con menos de 2 GB de RAM, incluyendo smartphones y hardware embebido.
- Compatibilidad con herramientas de inferencia estandar: al estar en GGUF, funciona con llama.cpp, Ollama y otros motores compatibles.

## Casos de uso

- Asistentes conversacionales en moviles: el modelo puede gestionar dialogos naturales con una latencia baja y sin conexion a internet, ideal para aplicaciones de mensajeria o asistentes personales que priorizan la privacidad.
- Procesamiento de imagenes en local: gracias a su soporte de vision, permite analizar fotografias, extraer texto de capturas o describir escenas directamente en el dispositivo, sin enviar datos a la nube.
- Modelo borrador para decodificacion especulativa: en servidores con modelos grandes de Qwen3.5, este checkpoint de 0,8 B puede acelerar la generacion al predecir tokens que el modelo principal valida, reduciendo la latencia total.
- Analisis de documentos largos en hardware limitado: con 262K de contexto, puede resumir o extraer informacion de contratos, articulos o libros completos en dispositivos con poca memoria, como tablets o mini-PCs.
- Chatbots de atencion al cliente en kioscos o terminales: su tamano compacto permite ejecutarlo en sistemas embebidos para ofrecer respuestas automaticas sin depender de servidores centrales.
- Prototipado rapido de aplicaciones multimodales: al ser un modelo pequeno y de licencia permisiva, facilita el desarrollo de demos o pruebas de concepto que combinan texto e imagen antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las fuentes consultadas mencionan que el modelo tiene una buena capacidad de recuperacion de informacion (recall) pero una precision debil en tareas de generacion de codigo, recomendando el uso de Qwen3.5-4B para dichas tareas. No obstante, no se aportan cifras concretas de MMLU, HumanEval u otros tests estandar.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2 GB para inferencia en precision completa; menos de 2 GB con cuantizacion de 4 bits.
- GPUs recomendadas: cualquier GPU con al menos 2 GB de VRAM, como NVIDIA GTX 1650, RTX 3050 o superiores. Tambien puede ejecutarse en CPU con suficiente RAM.
- Dispositivos compatibles: smartphones con 2 GB de RAM, Raspberry Pi 5, mini-PCs y hardware embebido.
- Opciones de despliegue: llama.cpp, Ollama (comando `ollama run qwen3.5:0.8b`), vLLM (segun recipes.vllm.ai) y cualquier motor compatible con GGUF.
- Latencia y throughput: no se han publicado datos concretos; en dispositivos moviles se espera una generacion de varios tokens por segundo, suficiente para interacciones conversacionales.

## Comparativa con modelos similares

La siguiente tabla compara Qwen3.5-0.8B con otros modelos densos de tamano similar. Los datos de rendimiento no estan disponibles, por lo que la comparacion se limita a caracteristicas tecnicas.

| Modelo | Parametros | Contexto | Vision | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-0.8B | 0,75 B | 262 000 | Si | Apache-2.0 | GGUF, safetensors |
| Qwen2.5-0.5B | 0,49 B | 32 000 | No | Apache-2.0 | safetensors, GGUF |
| Llama-3.2-1B | 1,23 B | 128 000 | No | Llama 3.2 | safetensors, GGUF |
| SmolLM2-1.7B | 1,71 B | 8 000 | No | Apache-2.0 | safetensors, GGUF |

Qwen3.5-0.8B destaca por su ventana de contexto muy superior y su capacidad multimodal, algo inusual en modelos de menos de 1 B de parametros. Sin embargo, su rendimiento en tareas de codigo es limitado, como indican las fuentes consultadas.

## Limitaciones y advertencias

- Precision debil en generacion de codigo: segun Codersera, el modelo tiene una exactitud baja en tareas de programacion; se recomienda usar Qwen3.5-4B o superior para dichos casos.
- Riesgo de alucinacion: como todo modelo de lenguaje pequeno, puede generar respuestas plausibles pero incorrectas, especialmente en tareas de razonamiento complejo o conocimiento factual.
- Sesgos potenciales: al ser un modelo entrenado por Alibaba, puede reflejar sesgos presentes en sus datos de entrenamiento, aunque no se han documentado explicitamente.
- Limitaciones de idioma: aunque la familia Qwen3.5 es multilingue, no se especifica la lista de idiomas soportados en esta version; es probable que el rendimiento sea mejor en ingles y chino.
- Contexto largo con degradacion: aunque la ventana es de 262K, en modelos pequenos la atencion puede degradarse en los extremos del contexto; se recomienda probar con documentos muy largos antes de usarlo en produccion.
- Restricciones de licencia: Apache-2.0 permite uso comercial sin restricciones, pero es necesario mantener el aviso de copyright y la atribucion correspondiente.

## Enlaces

- Hugging Face: https://huggingface.co/SpacemiT/Qwen3.5-0.8B
- Modelo base en Hugging Face: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- vLLM Recipes: https://recipes.vllm.ai/Qwen/Qwen3.5-0.8B
- Codersera (guia de ejecucion y benchmark): https://codersera.com/blog/run-and-benchmark-qwen35-08b/
- LLM Releases: https://www.llm-releases.com/models/qwen3-5-0-8b
- Qualcomm AI Hub: https://aihub.qualcomm.com/mobile/models/qwen3_5_0_8b
