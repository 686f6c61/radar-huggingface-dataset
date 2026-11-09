# speakleash/Bielik-4.5B-v3.0-Instruct-GGUF

## Resumen

Bielik-4.5B-v3.0-Instruct-GGUF es la version cuantizada en formato GGUF del modelo Bielik-4.5B-v3.0-Instruct, desarrollado por SpeakLeash en colaboracion con ACK Cyfronet AGH. Se trata de un modelo causal decoder-only de aproximadamente 4.760 millones de parametros, especializado en polaco y afinado para seguir instrucciones conversacionales. Esta version GGUF esta pensada para inferencia local y despliegue en entornos con recursos limitados mediante llama.cpp y clientes compatibles.

El modelo parte de Bielik-4.5B-v2 y ha sido afinado para tareas de instruccion, manteniendo la licencia Apache 2.0, lo que facilita su uso comercial. Su relevancia actual radica en que ofrece un modelo de ~4.5B parametros centrado en un idioma con poca representacion en los grandes modelos multilingues, con un formato de pesos que permite ejecutarlo en hardware de consumo.

La ficha se centra en la version GGUF; los detalles de arquitectura y entrenamiento provienen de la model card del autor y del informe tecnico asociado (arXiv:2505.02550). No se dispone de informacion detallada sobre composicion del dataset ni de resultados de benchmarks en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (según model card) |
| Parametros totales | 4.757.260.288 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | q8_0, fp16 (GGUF) |
| Idiomas soportados | Polaco (pl) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |
| Modelo base | speakleash/Bielik-4.5B-v3.0-Instruct |
| Finetuned from | speakleash/Bielik-4.5B-v2 |
| Tamano del repo | 29.2 GB |

## Arquitectura y entrenamiento

Segun la model card, Bielik-4.5B-v3.0-Instruct es un modelo causal decoder-only. Se ha obtenido mediante fine-tuning de Bielik-4.5B-v2 para seguir instrucciones conversacionales. La version GGUF es una conversion/cuantizacion del modelo original en safetensors, realizada por SpeakLeash (responsable de la cuantizacion: Remigiusz Kinas).

No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se detallan innovaciones tecnicas como decodificacion especulativa o attention linear. El autor advierte que los modelos cuantizados presentan una calidad de respuesta reducida y posibles alucinaciones en comparacion con el modelo en float16.

## Capacidades

- Generacion de texto en polaco con formato conversacional (chat), mediante plantilla de chat basada en tokens `<|im_start|>` y `<|im_end|>`.
- Seguimiento de instrucciones (modelo Instruct), adecuado para tareas de pregunta-respuesta y asistencia.
- Conversacion multi-turno segun la plantilla definida en el Modfile de Ollama.
- Capacidades de razonamiento y codigo: no confirmadas en la informacion disponible.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al polaco segun la etiqueta de idioma (pl).
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Asistente conversacional en polaco: el modelo puede gestionar dialogos multi-turno usando la plantilla de chat documentada, adecuado para aplicaciones de atencion al usuario en polaco.
- Despliegue local en estaciones de trabajo: gracias al formato GGUF y a las cuantizaciones q8_0 y fp16, puede ejecutarse con llama.cpp o clientes compatibles sin depender de la nube.
- Prototipado rapido con Ollama: el Modfile incluido permite importar el modelo directamente en Ollama para pruebas de chat en local con temperatura recomendada de 0.1.
- Generacion de texto asistida en polaco: redaccion y resumen de contenido en polaco en pipelines de procesamiento por lotes mediante llama.cpp o llama-cpp-python.
- Integracion en aplicaciones de escritorio: clientes como LM Studio, GPT4All o text-generation-webui permiten usar el modelo con aceleracion GPU en Windows, Linux y macOS.
- Investigacion sobre modelos de idiomas de bajos recursos: util como base para estudiar el rendimiento de modelos ~4.5B centrados en polaco y para experimentos de fine-tuning posterior con licencia Apache 2.0.
- Educacion y demostraciones: su tamano moderado y su licencia permisiva lo hacen apto para entornos docentes donde se quiera mostrar inferencia local de un LLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial en la informacion proporcionada. Como referencia orientativa, un modelo de ~4.76B parametros en fp16 requiere aproximadamente 9.5 GB solo para pesos, y en q8_0 alrededor de 5 GB; a ello hay que sumar memoria para el contexto y el runtime. Estos calculos son estimaciones, no datos del autor.
- GPU recomendadas: no especificadas por el autor. Por tamano, el modelo puede ejecutarse en GPU consumer con suficiente VRAM (por ejemplo, RTX 3090/4090 de 24 GB) en fp16, y en GPU con 8-12 GB en q8_0, segun estimacion.
- Cabe en GPU consumer: si, en funcion de la cuantizacion y del contexto (estimacion, no dato oficial).
- Opciones de despliegue: llama.cpp (CLI y servidor), text-generation-webui, KoboldCpp, GPT4All, LM Studio, LoLLMS Web UI, Faraday.dev, llama-cpp-python, candle y ctransformers (este ultimo con soporte limitado para modelos recientes).
- Ollama: soportado mediante importacion con el Modfile documentado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de comparativas oficiales en la informacion proporcionada. Como referencia estructural, se puede comparar con el modelo base del que deriva:

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Bielik-4.5B-v3.0-Instruct-GGUF | 4.757.260.288 | No disponible | Apache 2.0 | GGUF |
| Bielik-4.5B-v3.0-Instruct | No disponible en la informacion | No disponible | Apache 2.0 | safetensors (modelo base) |
| Bielik-4.5B-v2 | No disponible en la informacion | No disponible | No disponible | No disponible |

No se proporcionan comparativas con otros modelos de la misma categoria (por ejemplo, otros modelos ~4-5B centrados en un idioma) en la informacion disponible.

## Limitaciones y advertencias

- El autor advierte explicitamente que los modelos cuantizados muestran una calidad de respuesta reducida y posibles alucinaciones; la cuantizacion q8_0 se describe como casi indistinguible de float16 pero con alto uso de recursos y lenta, no recomendada para la mayoria de usuarios.
- Idioma: el modelo esta etiquetado unicamente para polaco (pl); su rendimiento en otros idiomas no esta garantizado.
- Longitud de contexto: no documentada en la informacion disponible, lo que limita la planificacion de casos con contexto largo.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Riesgo de alucinacion: presente, especialmente en versiones cuantizadas segun el propio autor.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar los terminos completos y las condiciones del modelo base.
- En produccion, validar las respuestas y no asumir capacidades de tool calling o agentes, no confirmadas en la documentacion.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/speakleash/Bielik-4.5B-v3.0-Instruct-GGUF
- Modelo base en Hugging Face: https://huggingface.co/speakleash/Bielik-4.5B-v3.0-Instruct
- Modelo previo (finetuned from): https://huggingface.co/speakleash/Bielik-4.5B-v2
- Informe tecnico: https://arxiv.org/abs/2505.02550
- SpeakLeash: https://speakleash.org/
- ACK Cyfronet AGH: https://www.cyfronet.pl/
- Discord de SpeakLeash: https://discord.gg/CPBxPce4
- llama.cpp: https://github.com/ggerganov/llama.cpp
- text-generation-webui: https://github.com/oobabooga/text-generation-webui
- KoboldCpp: https://github.com/LostRuins/koboldcpp
- GPT4All: https://gpt4all.io/index.html
- LM Studio: https://lmstudio.ai/
- LoLLMS Web UI: https://github.com/ParisNeo/lollms-webui
- Faraday.dev: https://faraday.dev/
- llama-cpp-python: https://github.com/abetlen/llama-cpp-python
- candle: https://github.com/huggingface/candle
- ctransformers: https://github.com/marella/ctransformers
- Ollama: https://ollama.com/
