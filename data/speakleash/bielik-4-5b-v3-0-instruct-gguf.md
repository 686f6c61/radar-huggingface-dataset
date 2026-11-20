# speakleash/Bielik-4.5B-v3.0-Instruct-GGUF

## Resumen

Bielik-4.5B-v3.0-Instruct-GGUF es la versión cuantizada en formato GGUF del modelo Bielik-4.5B-v3.0-Instruct, desarrollado por SpeakLeash en colaboración con ACK Cyfronet AGH. Se trata de un modelo causal decoder-only de aproximadamente 4.757 millones de parámetros, especializado en el idioma polaco y ajustado por instrucciones, lo que lo orienta a tareas conversacionales y de generación de texto guiada.

El modelo parte de un fine-tuning sobre Bielik-4.5B-v2 y se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial y su integración en productos. Esta variante GGUF está pensada para inferencia local y en entornos con recursos limitados, ya que permite ejecutar el modelo mediante llama.cpp, Ollama y otras herramientas compatibles sin necesidad de infraestructura de GPU de gama alta.

Su relevancia actual radica en que ofrece un modelo de tamaño medio (4.5B), con contexto conversacional en polaco y empaquetado en un formato ampliamente adoptado por el ecosistema open source. La información pública disponible sobre arquitectura interna, longitud de contexto y datos de entrenamiento es limitada en la model card, por lo que varios parámetros se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal decoder-only (transformer) |
| Parametros totales | 4.757.260.288 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q8_0 y fp16 (GGUF) |
| Idiomas soportados | polaco (pl) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La model card describe el modelo como un causal decoder-only, es decir, un transformer autorregresivo estándar orientado a generación de texto. El modelo base Bielik-4.5B-v3.0-Instruct se obtuvo mediante fine-tuning a partir de Bielik-4.5B-v2, y esta variante GGUF es una cuantización del mismo. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO.

La innovación principal de esta ficha es el empaquetado en GGUF, que permite su ejecución en llama.cpp y clientes compatibles. La model card advierte explícitamente que los modelos cuantizados muestran una calidad de respuesta reducida y posibles alucinaciones en comparación con el modelo en precisión completa. Se ofrece una plantilla ChatML para Ollama, con la particularidad de que Bielik v3.0 espera `<|im_start|>role` con un espacio después de `<|im_start|>`, y recomienda no añadir el token BOS manualmente porque Ollama lo incorpora desde los metadatos del GGUF.

## Capacidades

- Generación de texto conversacional en polaco, con ajuste por instrucciones.
- Respuesta a prompts multi-turno mediante plantilla ChatML.
- Ejecución local mediante llama.cpp, Ollama, LM Studio, GPT4All, KoboldCpp, text-generation-webui y llama-cpp-python.
- Integración con servidores compatibles con OpenAI a través de llama-cpp-python.
- Soporte de cuantización q8_0 (calidad cercana a fp16) y fp16.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidades multilingües limitadas al polaco según el campo `language` de la model card.

## Casos de uso

- Asistentes conversacionales en polaco para atención al cliente: el modelo puede gestionar diálogos multi-turno mediante la plantilla ChatML, adecuado para entornos donde se requiere soberanía lingüística y despliegue local.
- Generación de contenido editorial en polaco: redacción de borradores, resúmenes y reescritura de textos, ejecutable en estaciones de trabajo sin GPU dedicada gracias al formato GGUF q8_0.
- Prototipado rápido de aplicaciones de IA en local: uso con Ollama o LM Studio para validar flujos conversacionales antes de escalar a modelos mayores.
- Procesamiento de texto en entornos con requisitos de privacidad: al ejecutarse localmente, los datos no salen del dispositivo, lo que encaja en sectores regulados.
- Educación y experimentación: modelo de 4.5B parámetros con licencia Apache 2.0, apropiado para fines docentes y de investigación en PLN (procesamiento de lenguaje natural) polaco.
- Integración en pipelines de generación aumentada por recuperación (RAG) en polaco: el modelo puede consumir contexto recuperado y generar respuestas, aunque la longitud de contexto no está documentada y debe validarse empíricamente.
- Chatbots de dominio específico con fine-tuning posterior: al ser Apache 2.0 y estar disponible en safetensors en el modelo base, permite ajuste adicional sobre el modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5 GB en q8_0 (4.757M parámetros a ~8 bits) y en torno a 9.5 GB en fp16, sin contar overhead de contexto y caché KV.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 o H100 para despliegues de mayor concurrencia; el modelo es pequeño y no requiere GPU de centro de datos.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en q8_0; en fp16 requiere al menos 12 GB para margen de contexto.
- Opciones de despliegue: llama.cpp (CLI y servidor), Ollama (con la plantilla ChatML indicada), LM Studio, GPT4All, KoboldCpp, text-generation-webui, llama-cpp-python y candle.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Bielik-4.5B-v3.0-Instruct-GGUF | 4.757M | no disponible | pl | Apache 2.0 | GGUF |
| Bielik-4.5B-v3.0-Instruct | 4.757M | no disponible | pl | Apache 2.0 | safetensors |
| Bielik-4.5B-v2 | no disponible | no disponible | pl | Apache 2.0 | no disponible |

No se dispone en la información proporcionada de datos de benchmarks ni de especificaciones de contexto que permitan una comparación cuantitativa con alternativas de otros desarrolladores.

## Limitaciones y advertencias

- La model card advierte que las versiones cuantizadas presentan calidad de respuesta reducida y posibles alucinaciones; q8_0 es la opción recomendada frente a cuantizaciones más agresivas.
- El modelo está especializado en polaco; su rendimiento en otros idiomas no está documentado y probablemente sea limitado.
- No se documentan sesgos conocidos, pero al ser un modelo entrenado principalmente con datos en polaco puede reflejar sesgos culturales y lingüísticos de ese corpus.
- La longitud de contexto no está especificada, lo que dificulta dimensionar aplicaciones con ventanas largas sin validación empírica.
- Aunque la licencia Apache 2.0 permite uso comercial, deben revisarse las condiciones del modelo base y de los datos de entrenamiento originales.
- La plantilla de chat requiere un formato específico (`<|im_start|>role` con espacio) y un manejo cuidadoso del token BOS en Ollama; un formato incorrecto degrada las respuestas.
- El repositorio ocupa 43.7 GB, lo que implica descargas considerables si se quieren todas las variantes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/speakleash/Bielik-4.5B-v3.0-Instruct-GGUF
- Modelo base: https://huggingface.co/speakleash/Bielik-4.5B-v3.0-Instruct
- Modelo previo: https://huggingface.co/speakleash/Bielik-4.5B-v2
- Informe técnico: https://arxiv.org/abs/2505.02550
- SpeakLeash: https://speakleash.org/
- ACK Cyfronet AGH: https://www.cyfronet.pl/
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com/
- Discord de SpeakLeash: https://discord.gg/CPBxPce4
