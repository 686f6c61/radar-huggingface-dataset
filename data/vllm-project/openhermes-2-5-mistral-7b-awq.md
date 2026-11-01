# vllm-project/OpenHermes-2.5-Mistral-7B-AWQ

## Resumen

OpenHermes-2.5-Mistral-7B-AWQ es la version cuantizada a 4 bits mediante AWQ del modelo OpenHermes-2.5-Mistral-7B, un ajuste fino (fine-tuning) supervisado del Mistral-7B-v0.1 desarrollado originalmente por Teknium. Esta copia concreta la mantiene el proyecto vLLM en su organizacion de HuggingFace, que la utiliza en su integracion continua (CI) para reducir el riesgo de cadena de suministro, ya que la version original de TheBloke estaba alojada en una cuenta personal. El repositorio fue creado el 30 de octubre de 2026 a partir de un commit concreto de la version de TheBloke.

El modelo resuelve el problema de ejecutar un modelo de chat instructivo de 7.000 millones de parametros en GPUs de consumo con un consumo de VRAM reducido: la cuantizacion AWQ de 4 bits con grupo de 128 reduce el peso de los safetensors a aproximadamente 4,15 GB, frente a los cerca de 14,5 GB del modelo en fp16. Mantiene la plantilla de prompt ChatML y esta pensado para tareas de conversacion, instrucciones y generacion de codigo en ingles.

Es relevante ahora porque AWQ ofrece una inferencia mas rapida que GPTQ en Transformers con una calidad equivalente o superior, y esta soportado de forma nativa por vLLM, TGI, text-generation-webui y AutoAWQ. No obstante, se trata de un modelo de 2023-2024 con contexto de 4.096 tokens y entrenamiento exclusivamente en ingles, por lo que su interes actual es mas bien como referencia historica o como base ligera para experimentacion que como modelo de produccion de ultima generacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Mistral), cuantizado AWQ 4 bits |
| Parametros totales | 7.241.748.480 (7,24 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens (longitud de secuencia usada en la cuantizacion; coincide con el contexto nativo de Mistral-7B) |
| Tipos de cuantizacion | AWQ 4 bits, group size 128, dataset wikitext, seq len 4096; existen versiones GPTQ y GGUF (2-8 bits) del mismo modelo base |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (ficheros sharded), 4,15 GB en total |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Mistral-7B-v0.1: un transformer decoder-only denso de 7.000 millones de parametros con atencion de ventana deslizante (sliding window attention), activacion SwiGLU, RoPE y contexto nativo de 4.096 tokens. Sobre esa base, Teknium realizo un ajuste fino supervisado con el dataset OpenHermes 2.5, una coleccion de aproximadamente un millon de ejemplos predominantemente sinteticos generados con GPT-4 y destilados, orientados a instrucciones, conversacion y codigo. El resultado se empaqueta con la plantilla ChatML.

Esta version concreta no reentrena el modelo: aplica cuantizacion AWQ de 4 bits (activacion consciente de pesos, con escalado por canal y grupo de 128) calibrada sobre wikitext. AWQ preserva los pesos mas sensibles a la cuantizacion mediante escalado por canal, lo que permite reducir el peso a 4 bits con una perdida de calidad menor que la cuantizacion uniforme. No se dispone de informacion sobre el uso de RLHF o DPO en el ajuste fino original dentro de la informacion proporcionada.

## Capacidades

- Generacion de texto e instrucciones en ingles con formato de chat multi-turno mediante plantilla ChatML.
- Razonamiento basico y respuesta a preguntas de conocimiento general.
- Generacion de codigo y explicaciones tecnicas, fruto de la destilacion de GPT-4 en el dataset OpenHermes 2.5.
- Conversacion con rol de sistema configurable (system message) a traves de ChatML.
- Soporte de inferencia de alta velocidad mediante vLLM y TGI gracias al formato AWQ.
- Capacidades multilingues limitadas: el modelo esta entrenado y evaluado principalmente en ingles.
- No se documenta soporte de tool calling, function calling, uso de agentes, vision, audio ni modo de razonamiento extendido (thinking mode) en la informacion disponible.

## Casos de uso

- Chatbot de soporte en ingles: el modelo puede gestionar conversaciones multi-turno con hasta 4.096 tokens de contexto usando la plantilla ChatML, adecuado para asistentes de FAQ o atencion de primer nivel en ingles.
- Asistente de programacion ligero: genera fragmentos de codigo y explicaciones tecnicas, util como autocompletado o ayuda en editores con recursos limitados.
- Prototipado rapido de aplicaciones LLM: al ocupar unos 4,15 GB en AWQ, permite desplegar un endpoint de chat en una unica GPU de consumo para pruebas de concepto.
- Generacion de contenido y resumenes en ingles: redaccion de borradores, resumenes de documentos y reescritura de textos dentro de la ventana de contexto.
- Servicio de inferencia de alto throughput con vLLM: el formato AWQ esta soportado de forma nativa por vLLM, lo que permite servir peticiones concurrentes con buena utilizacion de GPU en entornos de bajo coste.
- Base para ajuste fino adicional (LoRA): al ser un modelo de 7 B con licencia Apache 2.0, sirve como punto de partida para adaptaciones especificas de dominio en ingles.
- Evaluacion y CI de infraestructura: como copia mantenida por el proyecto vLLM, se usa para validar el soporte de modelos AWQ en pipelines de integracion continua.

## Benchmarks y rendimiento

El model-index de la model card declara la entrada "OpenHermes-2-Mistral-7B" pero con la lista de resultados vacia. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,15 GB solo para los pesos en AWQ 4 bits; con cache KV y overhead del runtime, se recomienda un minimo de 6-8 GB de VRAM para contexto moderado.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para uso basico; A100, H100, L40S o RTX 4090 para mayor throughput y contextos largos.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas (por ejemplo RTX 3060 Ti, RTX 3070, RTX 4060 Ti, RTX 4070 en adelante).
- Opciones de despliegue: vLLM (soporte nativo de AWQ para Llama y Mistral), Hugging Face TGI, text-generation-webui con loader AutoAWQ y AutoAWQ desde Python. Para CPU o GPU mixta existen las versiones GGUF del mismo modelo base.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenHermes-2.5-Mistral-7B-AWQ (este) | 7,24 B | 4.096 | AWQ 4 bits | Apache 2.0 | HuggingFace (vLLM y TheBloke) |
| OpenHermes-2.5-Mistral-7B (fp16) | 7,24 B | 4.096 | fp16 | Apache 2.0 | HuggingFace (teknium) |
| OpenHermes-2.5-Mistral-7B-GPTQ | 7,24 B | 4.096 | GPTQ 4/8 bits | Apache 2.0 | HuggingFace (TheBloke) |
| OpenHermes-2.5-Mistral-7B-GGUF | 7,24 B | 4.096 | GGUF 2-8 bits | Apache 2.0 | HuggingFace (TheBloke) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente en ingles: el rendimiento en castellano u otros idiomas sera notablemente inferior y no esta garantizado.
- Contexto limitado a 4.096 tokens, insuficiente para documentos largos o conversaciones extensas.
- Riesgo de alucinacion inherente a los modelos de 7 B entrenados con datos sinteticos destilados de GPT-4; no debe usarse como fuente de verdad sin verificacion.
- Sesgos potenciales heredados de los datos de entrenamiento sinteticos y del modelo base Mistral; no se documenta mitigacion especifica.
- Es una cuantizacion: puede presentar una degradacion de calidad respecto al modelo fp16 original, especialmente en tareas de razonamiento complejo o codigo.
- Licencia Apache 2.0 permite uso comercial, pero el usuario debe cumplir las condiciones de la licencia del modelo base Mistral-7B-v0.1 y de los datos de entrenamiento.
- No se documenta soporte de tool calling ni de agentes, por lo que no es adecuado para flujos que requieran function calling estructurado.
- Repositorio con muy pocas descargas (18) y sin likes: es una copia de infraestructura, no una distribucion principal; para produccion conviene referenciar el modelo base original.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/vllm-project/OpenHermes-2.5-Mistral-7B-AWQ
- Modelo base original: https://huggingface.co/teknium/OpenHermes-2.5-Mistral-7B
- Version AWQ de TheBloke: https://huggingface.co/TheBloke/OpenHermes-2.5-Mistral-7B-AWQ
- Version GPTQ de TheBloke: https://huggingface.co/TheBloke/OpenHermes-2.5-Mistral-7B-GPTQ
- Versiones GGUF de TheBloke: https://huggingface.co/TheBloke/OpenHermes-2.5-Mistral-7B-GGUF
- Dataset de calibracion wikitext: https://huggingface.co/datasets/wikitext
- vLLM: https://github.com/vllm-project/vllm
- Text Generation Inference: https://github.com/huggingface/text-generation-inference
- AutoAWQ: https://github.com/casper-hansen/AutoAWQ
- text-generation-webui: https://github.com/oobabooga/text-generation-webui
