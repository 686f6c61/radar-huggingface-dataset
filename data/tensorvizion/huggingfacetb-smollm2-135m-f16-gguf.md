# TensorVizion/HuggingFaceTB-SmolLM2-135M-f16-GGUF

## Resumen

El modelo TensorVizion/HuggingFaceTB-SmolLM2-135M-f16-GGUF es una cuantizacion en formato GGUF con precision f16 del modelo base SmolLM2-135M, desarrollado por HuggingFace. SmolLM2 es una familia de modelos de lenguaje compactos (135M, 360M y 1.7B parametros) disenados para ejecutarse en dispositivos con recursos limitados, como telefonos, portatiles y hardware de borde. Este modelo en concreto es la variante de 135 millones de parametros, entrenada sobre 2 billones de tokens, lo que le otorga capacidades de generacion de texto y razonamiento notables para su tamano.

La relevancia de este modelo radica en su capacidad para ejecutarse en CPU y hardware de gama baja sin sacrificar en exceso la calidad de las respuestas. El formato GGUF f16 facilita su uso con llama.cpp, Ollama y otras herramientas de inferencia local, lo que lo convierte en una opcion atractiva para aplicaciones embebidas, educacion y prototipado rapido. El modelo base fue entrenado por HuggingFace y esta publicado bajo licencia Apache 2.0, permitiendo uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder |
| Parametros totales | 134.515.008 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | f16 (GGUF) |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

SmolLM2-135M utiliza una arquitectura de transformer decoder estandar, sin atencion lineal ni mezcla de expertos. El modelo fue preentrenado en precision bfloat16 sobre 2 billones de tokens, combinando los datasets FineWeb-Edu, DCLM y The Stack, junto con datasets adicionales filtrados por HuggingFace. El entrenamiento se realizo con el framework nanotron en un cluster de 64 GPUs H100. No se aplicaron tecnicas de RLHF ni DPO en la variante base; la version instruct del modelo (no incluida en este repositorio GGUF) si recibio SFT y DPO sobre UltraFeedback.

El formato GGUF f16 de este repositorio conserva los pesos con precision de 16 bits, lo que mantiene una calidad de generacion practicamente identica al modelo original en bfloat16, con una huella de memoria de aproximadamente 270 MB para los pesos.

## Capacidades

- Generacion de texto causal de proposito general: completado de secuencias, continuacion de texto y generacion creativa.
- Razonamiento basico y conocimientos factuales limitados, adecuados para tareas de nivel basico o educativo.
- Comprension lectora y respuesta a preguntas de opcion multiple en ingles.
- Capacidad de ejecucion en CPU, GPU de baja potencia y dispositivos de borde sin aceleracion dedicada.
- Compatibilidad con el ecosistema llama.cpp, Ollama, LM Studio y transformers mediante la conversion de pesos.
- No incluye soporte nativo para tool calling, function calling ni vision, dado que es la variante base y no la instruct.
- Multilingue limitado: el modelo esta entrenado principalmente en ingles y puede producir contenido en otros idiomas de forma poco fiable.

## Casos de uso

- Inferencia en dispositivos embebidos: gracias a su tamano de 135M parametros y su formato GGUF f16, puede ejecutarse en Raspberry Pi, microcontroladores con suficiente RAM y sistemas embebidos para generar texto localmente sin conexion.
- Prototipado rapido de aplicaciones de lenguaje: los desarrolladores pueden integrarlo en pipelines de desarrollo local con llama.cpp u Ollama para validar ideas antes de escalar a modelos mas grandes.
- Generacion de texto para asistencia en redaccion: el modelo puede sugerir completados de frases o parrafos en ingles en editores de texto y herramientas de escritura asistida.
- Clasificacion y etiquetado de texto: mediante fine-tuning con un dataset propio, el modelo puede adaptarse a tareas de clasificacion de documentos, deteccion de spam o analisis de sentimiento en ingles.
- Generacion de contenido para testing de QA: en entornos de desarrollo, sirve para generar respuestas sinteticas en pruebas automatizadas de interfaces conversacionales.
- Modelo base para fine-tuning especifico: su licencia Apache 2.0 permite adaptarlo a dominios concretos (medicina, legal, tecnico) con datasets reducidos, gracias a su bajo coste de entrenamiento.
- Aplicaciones offline de asistencia: integrado en aplicaciones de escritorio o moviles, puede proporcionar respuestas a preguntas frecuentes en ingles sin conexion a internet.

## Benchmarks y rendimiento

La informacion disponible incluye resultados de evaluacion del modelo base SmolLM2-135M-8k comparado con su predecesor SmolLM-135M, utilizando lighteval en modo zero-shot salvo indicacion:

| Metrica | SmolLM2-135M-8k | SmolLM-135M |
|---|---|---|
| HellaSwag | 42.1 | 41.2 |
| ARC (media) | 43.9 | 42.4 |
| PIQA | 68.4 | 68.4 |
| MMLU (cloze) | 31.5 | 30.2 |
| CommonsenseQA | 33.9 | 32.7 |
| TriviaQA | 4.1 | 4.3 |
| Winogrande | 51.3 | 51.3 |
| OpenBookQA | 34.6 | 34.0 |
| GSM8K (5-shot) | 1.4 | 1.0 |

No se han publicado resultados de benchmarks especificos para la version GGUF f16 de este repositorio; los datos anteriores corresponden al modelo base original en bfloat16.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 270 MB de pesos en f16, mas overhead de contexto, lo que supone unos 300-400 MB de memoria total. Puede ejecutarse en CPU con 1 GB de RAM libre.
- GPUs recomendadas: cualquier GPU con al menos 1 GB de VRAM (Raspberry Pi 5, NVIDIA Jetson, GTX 1050, etc.). No requiere GPU dedicada para inferencia en tiempo real.
- Compatibilidad con consumer GPU: si, se ejecuta sin problemas en cualquier GPU de sobremesa moderna, incluso en iGPU integradas.
- Opciones de despliegue: llama.cpp (directo), Ollama, LM Studio, llama-cpp-python, transformers con carga de GGUF via transformers-gguf.
- Latencia estimada: en CPU moderna (por ejemplo, un Ryzen 5), la generacion de tokens alcanza velocidades de 50-100 tokens/s; en GPU, supera los 200 tokens/s.
- Throughput: al ser un modelo pequeno, se pueden ejecutar multiples instancias concurrentes en un solo nodo sin degradacion significativa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Rendimiento (HellaSwag) |
|---|---|---|---|---|---|
| SmolLM2-135M (este) | 135M | 8K | Apache 2.0 | GGUF f16 | 42.1 |
| SmolLM-135M | 135M | 2K | Apache 2.0 | PyTorch / GGUF | 41.2 |
| TinyLlama-1.1B | 1.1B | 4K | Apache 2.0 | PyTorch / GGUF | no disponible |
| Qwen2.5-0.5B | 0.5B | 32K | Apache 2.0 | PyTorch / GGUF | no disponible |

SmolLM2-135M mejora a su predecesor SmolLM-135M en la mayoria de las metricas de razonamiento y comprension, y supera la ventaja de un contexto de 8K frente a los 2K del modelo original. TinyLlama y Qwen2.5 son alternativas mas grandes con mayor capacidad, pero requieren mas recursos.

## Limitaciones y advertencias

- El modelo esta entrenado principalmente en ingles; la generacion en otros idiomas puede ser de baja calidad o incoherente.
- Riesgo de alucinacion: como todo LLM, puede generar contenido falso o inconsistente, especialmente en tareas de conocimiento factual.
- La variante base no esta instruida para dialogar ni seguir instrucciones complejas; se recomienda usar la version instruct para aplicaciones conversacionales.
- El rendimiento en tareas de razonamiento avanzado es muy limitado (GSM8K 1.4%), por lo que no es adecuado para problemas matematicos o logicos complejos.
- Este repositorio especifico tiene 0 descargas y 0 likes, lo que indica que es una publicacion reciente sin validacion comunitaria; se recomienda verificar la integridad del archivo antes de usar en produccion.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero no incluye garantias de seguridad ni soporte.

## Enlaces

- Repositorio de HuggingFace del modelo: https://huggingface.co/TensorVizion/HuggingFaceTB-SmolLM2-135M-f16-GGUF
- Modelo base en HuggingFace: https://huggingface.co/HuggingFaceTB/SmolLM2-135M
- Coleccion oficial SmolLM2 de HuggingFace: https://huggingface.co/collections/HuggingFaceTB/smollm2
- Paper de SmolLM2 (arXiv): https://arxiv.org/abs/2502.02737
- Dataset de SFT smol-smoltalk: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
- Codigo de fine-tuning (alignment-handbook): https://github.com/huggingface/alignment-handbook/tree/main/recipes/smollm2
- Dataset UltraFeedback: https://huggingface.co/datasets/HuggingFaceH4/ultrafeedback_binarized
- Dataset Synth-APIGen-v0.1: https://huggingface.co/datasets/argilla/Synth-APIGen-v0.1
