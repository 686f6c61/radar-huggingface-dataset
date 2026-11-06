# speakleash/Bielik-Minitron-7B-v3.0-Instruct-GGUF

## Resumen

Bielik-Minitron-7B-v3.0-Instruct-GGUF es la distribucion en formato GGUF del modelo instructivo Bielik-Minitron-7B-v3.0-Instruct, desarrollado por SpeakLeash en colaboracion con ACK Cyfronet AGH. Se trata de un modelo causal decoder-only de 7.477.727.232 parametros (aproximadamente 7,5 mil millones) afinado para conversacion, derivado del modelo base Bielik-Minitron-7B-v3.0 mediante un proceso de destilacion tipo Minitron a partir de la familia Bielik-11B. El repositorio contiene unicamente los pesos cuantizados, no el modelo original en precision completa.

La relevancia de esta publicacion radica en dos factores. Primero, el modelo esta optimizado para polaco dentro de un conjunto de 32 idiomas europeos, lo que lo convierte en una alternativa poco habitual frente a los modelos anglocentricos habituales en el rango de 7B. Segundo, la licencia Apache 2.0 permite uso comercial sin restricciones de atribucion adicionales, algo relevante para equipos que necesitan desplegar inferencia local en entornos regulados.

El formato GGUF facilita el despliegue en CPU y GPU de consumo mediante llama.cpp y sus derivados (Ollama, LM Studio, text-generation-webui). El repositorio ocupa 23,9 GB e incluye cuantizaciones desde Q4_K_M hasta FP16/BF16, ademas de una plantilla ChatML y una plantilla especifica con soporte de tool calling para Ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only |
| Parametros totales | 7.477.727.232 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q6_K, Q8_0, FP16 y BF16 (GGUF) |
| Idiomas soportados | 32 idiomas europeos: pl, en, sq, bel, bs, bg, hr, cs, da, et, fi, fr, el, es, is, lt, nl, de, no, pt, ru, ro, sr, hbs, sv, sk, sl, tr, uk, hu, it, lv |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La model card identifica el modelo como un transformer causal decoder-only. El nombre "Minitron" sugiere una destilacion por pruning estructurado y redistribucion de pesos a partir de un modelo mayor de la familia Bielik-11B, una tecnica popularizada por NVIDIA para obtener modelos de menor tamano con calidad cercana al original. No obstante, la informacion proporcionada no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron fases de RLHF o DPO durante el ajuste instructivo. Tampoco se especifica la longitud de contexto nativa ni innovaciones de atencion (atencion lineal, decodificacion especulativa, GQA, etc.).

Lo que si se documenta es el proceso de cuantizacion: Q4_K_M y Q5_K_M emplean Q6_K para la mitad de los tensores `attention.wv` y `feed_forward.w2` y Q4_K/Q5_K para el resto; Q6_K usa Q8_K en todos los tensores; Q8_0 se describe como casi indistinguible de float16 pero con alto consumo de recursos. El autor advierte explicitamente que las cuantizaciones reducen la calidad de respuesta y pueden incrementar las alucinaciones.

## Capacidades

- Generacion de texto conversacional multi-turno en 32 idiomas europeos, con optimizacion especifica para polaco.
- Razonamiento y respuesta a instrucciones en formato ChatML (`<|im_start|>` / `<|im_end|>`).
- Soporte de tool calling / function calling mediante un formato JSON documentado: `<tool_call>{"name": <tool-name>, "arguments": <args-dict>}</tool_call>`.
- Integracion con agentes a traves de la plantilla de Ollama con herramientas, que inyecta las firmas de las tools en el mensaje de sistema.
- Generacion de codigo y matematicas: no se documenta de forma explicita en la informacion disponible, aunque son capacidades esperables en un modelo instructivo de esta familia; no hay confirmacion en la model card.
- Capacidades multimodales (vision, audio): no disponibles.
- Modo thinking explicito: no disponible.

## Casos de uso

- Atencion al cliente en polaco y otras lenguas europeas: el modelo puede mantener conversaciones multi-turno con plantilla ChatML y desplegarse en local con Ollama, lo que resulta adecuado para entornos con requisitos de soberania de datos.
- Asistentes con acceso a herramientas: gracias al formato `<tool_call>` documentado, se puede conectar a APIs internas (consultas a bases de datos, envio de correos, busquedas) en pipelines de agentes ligeros.
- Procesamiento de documentacion multilingue: con 32 idiomas soportados, sirve para resumir, traducir o extraer informacion de corpus que mezclan polaco, checo, rumano, griego o turco, entre otros.
- Despliegue en estaciones de trabajo sin GPU dedicada: las cuantizaciones Q4_K_M y Q5_K_M permiten ejecucion en CPU via llama.cpp con un consumo de RAM moderado para un modelo de 7,5B.
- Prototipado rapido de aplicaciones LLM: la licencia Apache 2.0 y la disponibilidad en LM Studio, GPT4All y text-generation-webui reducen la friccion para pruebas internas.
- Generacion de contenido en polaco para marketing o documentacion: el ajuste instructivo y la optimizacion del idioma lo hacen preferible a modelos genericos de igual tamano en tareas de redaccion en polaco.
- Fine-tuning posterior sobre dominio: al ser un modelo de 7,5B con licencia permisiva, es viable aplicar LoRA o QLoRA sobre el modelo base en safetensors para adaptarlo a verticales concretas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun cuantizacion y overhead de contexto):
  - Q4_K_M: en torno a 4,5-5 GB.
  - Q5_K_M: en torno a 5,5-6 GB.
  - Q6_K: en torno a 6,5-7 GB.
  - Q8_0: en torno a 8-9 GB.
  - FP16/BF16: en torno a 15-16 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090, A100 y H100 para FP16/BF16 o despliegues con concurrencia.
- Cabe en GPU de consumo: si, con cuantizaciones Q4_K_M a Q8_0 en tarjetas de 8-12 GB; FP16 requiere 16 GB o mas.
- Opciones de despliegue: llama.cpp (CLI y servidor), Ollama (con Modfile documentado), text-generation-webui, KoboldCpp, GPT4All, LM Studio, LoLLMS Web UI, Faraday.dev, llama-cpp-python (API compatible con OpenAI) y candle.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Bielik-Minitron-7B-v3.0-Instruct-GGUF | 7,5B | no disponible | 32 europeos (opt. polaco) | Apache 2.0 | GGUF |
| Bielik-11B-v3.0-Instruct | no disponible en esta ficha | no disponible | multilingue (familia Bielik) | Apache 2.0 (segun familia) | safetensors / GGUF |
| Mistral-7B-Instruct | 7,2B | 32k (segun version) | principalmente en, fr, es, de, it | Apache 2.0 | safetensors / GGUF |
| Llama-3.1-8B-Instruct | 8B | 128k | multilingue amplio | Llama 3.1 Community License | safetensors / GGUF |

La comparativa con Mistral-7B y Llama-3.1-8B se ofrece como referencia de categoria (modelos instructivos de ~7-8B con licencia permisiva o casi permisiva); no se dispone de datos de rendimiento comparativo del Bielik-Minitron-7B en la informacion proporcionada.

## Limitaciones y advertencias

- El autor advierte explicitamente que las cuantizaciones reducen la calidad de respuesta e incrementan el riesgo de alucinacion; Q4_K_M y Q5_K_M son las opciones con mayor perdida.
- No se documentan sesgos conocidos ni evaluaciones de seguridad en la model card; al estar optimizado para polaco, el comportamiento en otros idiomas puede ser desigual.
- La longitud de contexto no esta especificada, lo que impide garantizar un rendimiento fiable en tareas de contexto largo.
- No hay benchmarks publicados que permitan validar el rendimiento frente a alternativas.
- La model card original del repositorio GGUF contiene un titulo que menciona "Bielik-11B-v3.0-Instruct-GGUF", probablemente un error de copia; conviene verificar el modelo base real antes de integrarlo en produccion.
- Aunque la licencia es Apache 2.0, el uso comercial debe acompanarse de una evaluacion propia de calidad y sesgos, dado que no hay informes publicados.
- El repositorio solo contiene pesos GGUF; para fine-tuning es necesario acudir al modelo base en safetensors.
- El soporte de tool calling depende de la plantilla de Ollama proporcionada; otros entornos deben replicar el formato `<tool_call>` manualmente.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/speakleash/Bielik-Minitron-7B-v3.0-Instruct-GGUF
- Modelo base instructivo: https://huggingface.co/speakleash/Bielik-Minitron-7B-v3.0-Instruct
- Modelo base (pre-instruct): https://huggingface.co/speakleash/Bielik-Minitron-7B-v3.0
- SpeakLeash: https://speakleash.org/
- ACK Cyfronet AGH: https://www.cyfronet.pl/
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
