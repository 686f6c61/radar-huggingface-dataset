# speakleash/Bielik-1.5B-v3.0-Instruct-GGUF

## Resumen

Bielik-1.5B-v3.0-Instruct-GGUF es la distribucion en formato GGUF del modelo Bielik-1.5B-v3.0-Instruct, desarrollado por SpeakLeash en colaboracion con ACK Cyfronet AGH. Se trata de un modelo de lenguaje causal decoder-only de 1.596.507.648 parametros (aproximadamente 1,5 mil millones), especializado en polaco y afinado para seguir instrucciones en formato conversacional. Esta version GGUF esta pensada para inferencia local con llama.cpp y sus derivados (Ollama, LM Studio, text-generation-webui, entre otros).

El modelo parte de Bielik-1.5B-v2 y ha sido afinado para instrucciones, con licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. Su interes practico radica en que ofrece un modelo polaco ligero, cuantizado y ejecutable en hardware de consumo, algo relevante para desarrolladores que necesitan procesamiento de texto en polaco sin depender de APIs en la nube ni de infraestructura GPU de datacenter.

La ficha tecnica completa del modelo base esta documentada en el informe tecnico arXiv:2505.02550. El repositorio GGUF incluye unicamente dos variantes de cuantizacion (q8_0 y fp16), lo que limita el abanico de opciones respecto a otros repositorios GGUF mas completos, pero cubre los casos de maxima fidelidad respecto al modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only |
| Parametros totales | 1.596.507.648 (~1,5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q8_0, fp16 |
| Idiomas soportados | polaco (pl) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo); safetensors en el modelo base |
| Modelo base | speakleash/Bielik-1.5B-v3.0-Instruct |
| Modelo de partida del finetuning | speakleash/Bielik-1.5B-v2 |
| Tamano del repositorio | 14,7 GB |
| Plantilla de chat | ChatML con `<|im_start|> role` (con espacio tras el token) |

## Arquitectura y entrenamiento

El modelo es un transformer causal decoder-only de aproximadamente 1,5 mil millones de parametros. Segun la model card, se trata de un finetuning de Bielik-1.5B-v2 orientado a instrucciones y conversacion. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF, DPO u otras variantes de alineamiento; esos datos deberian consultarse en el informe tecnico arXiv:2505.02550.

La innovacion principal de este repositorio no esta en la arquitectura, sino en la distribucion: la conversion a GGUF permite ejecutar el modelo con llama.cpp y toda su familia de clientes. La model card advierte explicitamente que las versiones cuantizadas muestran una calidad de respuesta reducida y pueden producir alucinaciones, algo especialmente relevante en la variante q8_0. La plantilla de chat es ChatML y requiere un espacio despues de `<|im_start|>`; en Ollama no debe anadirse manualmente el token `<s>` porque se toma de los metadatos del GGUF.

## Capacidades

- Generacion de texto conversacional en polaco, con formato de chat ChatML.
- Seguimiento de instrucciones (modelo etiquetado como Instruct).
- Razonamiento basico y respuesta a preguntas en polaco.
- Generacion de codigo y texto tecnico, aunque sin datos publicados de rendimiento especificos.
- Soporte de conversaciones multi-turno mediante plantilla de chat con roles system, user y assistant.
- Capacidad de ejecucion local en CPU y GPU a traves de llama.cpp y clientes compatibles.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking en la informacion disponible.

## Casos de uso

- Asistentes conversacionales en polaco para aplicaciones de escritorio o moviles: el modelo puede integrarse mediante llama.cpp u Ollama para ofrecer respuestas en polaco sin conexion a internet, aprovechando su tamano reducido y su licencia Apache 2.0.
- Procesamiento de texto en entornos con requisitos de privacidad: al ejecutarse localmente, permite redactar, resumir o reescribir documentos en polaco sin enviar datos a servicios externos.
- Generacion de contenido editorial en polaco: borradores de articulos, descripciones de producto o correos, con la ventaja de que el modelo esta afinado para instrucciones y admite system prompts.
- Prototipado rapido de aplicaciones NLP en polaco: investigadores y desarrolladores pueden desplegar el modelo con llama-cpp-python o LM Studio para validar ideas antes de escalar a modelos mayores.
- Educacion y aprendizaje de polaco: el modelo puede actuar como tutor conversacional para practicar el idioma, con la advertencia de que debe revisarse la exactitud factual de las respuestas.
- Integracion en pipelines de preprocesamiento de texto: clasificacion, reformateo o extraccion de informacion en lotes pequenos sobre hardware de consumo, gracias a las variantes q8_0 y fp16.
- Chatbots de soporte de bajo coste para nichos en polaco: con contexto limitado y sin tool calling documentado, es adecuado para flujos simples de preguntas y respuestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni metricas comparativas; para datos de evaluacion debe consultarse el informe tecnico arXiv:2505.02550 del modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3 GB en fp16 (1,5B parametros x 2 bytes) y en torno a 1,7 GB en q8_0, mas overhead de contexto y runtime.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM puede ejecutar la variante q8_0; una RTX 3060, RTX 4060 o superior ofrece margen comodo. En datacenter, A100 o H100 son sobredimensionadas para este tamano.
- Cabe en GPU consumer: si, practicamente en cualquier GPU moderna con 4 GB o mas de VRAM, e incluso en CPU con suficiente RAM.
- Opciones de despliegue: llama.cpp (CLI y servidor), Ollama (con el Modelfile incluido en la model card), text-generation-webui, KoboldCpp, GPT4All, LM Studio, LoLLMS Web UI, Faraday.dev, llama-cpp-python y candle.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Bielik-1.5B-v3.0-Instruct-GGUF | ~1,5B | no disponible | pl | Apache 2.0 | GGUF |
| Bielik-1.5B-v3.0-Instruct (base) | ~1,5B | no disponible | pl | Apache 2.0 | safetensors |
| Bielik-1.5B-v2 | ~1,5B | no disponible | pl | no disponible | no disponible |

No se dispone de datos de benchmarks que permitan comparar el rendimiento con modelos de la misma categoria; la comparativa se limita a parametros, licencia y formato.

## Limitaciones y advertencias

- La model card advierte que las versiones cuantizadas presentan calidad de respuesta reducida y posibles alucinaciones; la variante q8_0 no es indistinguible del float16 en todos los casos y el autor la desaconseja para la mayoria de usuarios.
- El modelo esta especializado exclusivamente en polaco; no se garantiza un comportamiento correcto en otros idiomas.
- No se documenta la longitud de contexto soportada, lo que dificulta planificar casos de uso con documentos largos.
- Riesgo de alucinacion inherente a modelos de 1,5B parametros, especialmente en tareas factuales o de razonamiento complejo.
- No se documentan sesgos conocidos ni evaluaciones de seguridad en la informacion disponible.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe asumir la responsabilidad sobre el contenido generado y sobre la calidad tras la cuantizacion.
- No hay soporte documentado de tool calling ni de agentes, por lo que no es adecuado para flujos que requieran invocacion de funciones.
- El repositorio solo ofrece q8_0 y fp16; no hay cuantizaciones mas agresivas (q4_K_M, q5_K_M, etc.) que reduzcan aun mas los requisitos de memoria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/speakleash/Bielik-1.5B-v3.0-Instruct-GGUF
- Modelo base: https://huggingface.co/speakleash/Bielik-1.5B-v3.0-Instruct
- Modelo de partida del finetuning: https://huggingface.co/speakleash/Bielik-1.5B-v2
- Informe tecnico: https://arxiv.org/abs/2505.02550
- SpeakLeash: https://speakleash.org/
- ACK Cyfronet AGH: https://www.cyfronet.pl/
- Discord de SpeakLeash: https://discord.gg/CPBxPce4
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com/
- text-generation-webui: https://github.com/oobabooga/text-generation-webui
- KoboldCpp: https://github.com/LostRuins/koboldcpp
- GPT4All: https://gpt4all.io/index.html
- LM Studio: https://lmstudio.ai/
- LoLLMS Web UI: https://github.com/ParisNeo/lollms-webui
- Faraday.dev: https://faraday.dev/
- llama-cpp-python: https://github.com/abetlen/llama-cpp-python
- candle: https://github.com/huggingface/candle
- ctransformers: https://github.com/marella/ctransformers
