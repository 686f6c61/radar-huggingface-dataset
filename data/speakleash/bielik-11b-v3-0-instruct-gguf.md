# speakleash/Bielik-11B-v3.0-Instruct-GGUF

## Resumen

Bielik-11B-v3.0-Instruct-GGUF es la version cuantizada en formato GGUF del modelo Bielik-11B-v3.0-Instruct, desarrollado por SpeakLeash en colaboracion con ACK Cyfronet AGH. Se trata de un modelo causal decoder-only de 11.168.796.672 parametros, afinado a partir de la base Bielik-11B-v3-Base-20250730, y disenado especificamente para el polaco aunque con cobertura de 32 lenguas europeas. Esta version GGUF permite ejecutar el modelo en hardware de consumo mediante llama.cpp y sus derivados, algo imposible con los pesos originales en precision completa.

La relevancia de esta publicacion radica en que democratiza el acceso a un modelo de 11B especializado en lenguas eslavas y europeas de menor representacion en los grandes modelos comerciales, manteniendo una licencia Apache 2.0 permisiva para uso comercial. El formato GGUF incluye cuantizaciones desde Q4_K_M hasta FP16/BF16, lo que permite ajustar el equilibrio entre calidad y requisitos de memoria.

El modelo esta pensado para generacion de texto conversacional, con soporte de plantilla ChatML y capacidad de tool calling documentada en la model card, lo que lo hace apto para asistentes, agentes y pipelines de generacion aumentada por recuperacion en entornos multilingues europeos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal decoder-only (transformer) |
| Parametros totales | 11.168.796.672 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q4_k_m, q5_k_m, q6_k, q8_0, 16bit (FP16 y BF16) |
| Idiomas soportados | 32 lenguas europeas: pl, en, sq, bel, bs, bg, hr, cs, da, et, fi, fr, el, es, is, lt, nl, de, no, pt, ru, ro, sr, hbs, sv, sk, sl, tr, uk, hu, it, lv (optimizado para polaco) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 80,3 GB con multiples cuantizaciones) |

## Arquitectura y entrenamiento

El modelo base es un transformer causal decoder-only de 11B parametros, afinado por instrucciones a partir de Bielik-11B-v3-Base-20250730. La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO en el afinado; estos datos no estan disponibles en la informacion proporcionada. La orientacion multilingue hacia 32 lenguas europeas, con enfasis en polaco, sugiere un corpus de preentrenamiento centrado en fuentes eslavas y europeas, coherente con la mision de SpeakLeash de construir recursos linguisticos abiertos para lenguas menos cubiertas.

La innovacion principal de esta publicacion no reside en la arquitectura sino en la distribucion: se ofrecen cuantizaciones GGUF con esquemas documentados (Q4_K_M y Q5_K_M usan Q6_K para la mitad de los tensores `attention.wv` y `feed_forward.w2`, Q6_K usa Q8_K en todos los tensores). Se incluye tambien una plantilla de chat ChatML lista para Ollama, con una variante especifica que incorpora firmas de herramientas en formato JSON y un formato de invocacion `<tool_call>{"name": ..., "arguments": ...}</tool_call>`, lo que facilita el despliegue de agentes sin ingenieria adicional de prompts.

## Capacidades

- Generacion de texto conversacional multi-turno con plantilla ChatML (`<|im_start|>` / `<|im_end|>`).
- Razonamiento y respuesta a instrucciones en 32 lenguas europeas, con calidad optimizada para polaco.
- Soporte de tool calling / function calling mediante el formato JSON documentado en la plantilla de Ollama.
- Capacidad de agentes y razonamiento multi-paso a traves de llamadas encadenadas a herramientas.
- Generacion de codigo y matematicas: no documentado explicitamente en la model card, por lo que no se confirma.
- Capacidades de vision o audio: no disponibles.
- Modo thinking explicito: no documentado.

## Casos de uso

- Atencion al cliente en polaco y otras lenguas europeas: el modelo puede gestionar conversaciones multi-turno con plantilla ChatML y responder en el idioma del usuario, lo que lo hace adecuado para centros de soporte que cubren Europa del Este y Central con un unico modelo Apache 2.0.
- Agentes con tool calling en produccion: la plantilla de Ollama con firmas JSON permite conectar el modelo a APIs externas (calendarios, bases de datos, busquedas) sin reentrenamiento, usando el formato `<tool_call>` documentado.
- Procesamiento de documentos legales y administrativos en polaco: la especializacion del modelo en lengua polaca y su ventana de contexto (no publicada) lo orientan a tareas de resumen, extraccion y clasificacion de textos regulatorios.
- Traduccion asistida entre lenguas eslavas y europeas: la cobertura de 32 idiomas permite usarlo como motor de traduccion en pipelines de localizacion, especialmente en pares poco cubiertos por modelos comerciales (p. ej. polaco-croata, checo-esloveno).
- Despliegue local en estaciones de trabajo: las cuantizaciones Q4_K_M y Q5_K_M permiten ejecutar el modelo en GPUs de consumo, habilitando asistentes privados sin envio de datos a la nube, relevante para sectores con requisitos de soberania del dato.
- Generacion aumentada por recuperacion (RAG) multilingue: integrable en llama.cpp, LM Studio o text-generation-webui para construir bases de conocimiento internas en varias lenguas europeas con licencia permisiva.
- Investigacion en linguistica computacional: como modelo abierto Apache 2.0 con pesos GGUF, sirve para estudiar el comportamiento de modelos 11B en lenguas de bajos recursos sin depender de infraestructura de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun cuantizacion de un modelo de 11B):
  - Q4_K_M: en torno a 7-8 GB de VRAM.
  - Q5_K_M: en torno a 8-9 GB de VRAM.
  - Q6_K: en torno a 9-10 GB de VRAM.
  - Q8_0: en torno a 12 GB de VRAM.
  - FP16/BF16: en torno a 22-23 GB de VRAM.
- GPU recomendadas: RTX 4090 (24 GB) para Q8_0 y FP16; RTX 4080/4070 Ti Super (16 GB) para Q5_K_M y Q6_K; RTX 4060 Ti 16 GB o RTX 4070 (12 GB) para Q4_K_M y Q5_K_M; A100/H100 solo necesarias para FP16 con lotes grandes o servicio concurrente.
- Cabe en GPU de consumo: si, desde Q4_K_M en adelante en GPUs con 8-16 GB de VRAM; las cuantizaciones de 4 y 5 bits son las recomendadas por el autor para uso general.
- Opciones de despliegue: llama.cpp (CLI y servidor), Ollama (modelo publicado como `SpeakLeash/bielik-11b-v3.0-instruct`), text-generation-webui, KoboldCpp, GPT4All, LM Studio, LoLLMS Web UI, Faraday.dev, llama-cpp-python (con API compatible OpenAI), candle y ctransformers (este ultimo desactualizado y con soporte limitado de modelos recientes).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Bielik-11B-v3.0-Instruct-GGUF | 11,17B | no disponible | Apache 2.0 | GGUF | Optimizado para polaco, 32 lenguas europeas |
| Bielik-11B-v3.0-Instruct | 11,17B | no disponible | Apache 2.0 | safetensors | Version original sin cuantizar |
| Alternativas de 11B multilingues | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de comparacion en la informacion proporcionada |

No se dispone de informacion sobre benchmarks ni de modelos comparables concretos en la documentacion facilitada; la comparativa se limita a la relacion entre la version GGUF y su modelo base.

## Limitaciones y advertencias

- El propio autor advierte que los modelos cuantizados muestran calidad de respuesta reducida y posibles alucinaciones; las cuantizaciones de 1-3 bits requieren temperatura baja (0,1) segun la model card.
- Sesgos conocidos: no documentados en la informacion proporcionada; al ser un modelo entrenado mayoritariamente con corpus polacos y europeos, es previsible un sesgo cultural y linguistico hacia esas regiones.
- Riesgo de alucinacion: reconocido explicitamente por el autor en el aviso sobre cuantizacion.
- Longitud de contexto no publicada: limita la planificacion de cargas con documentos largos; conviene validar empiricamente antes de produccion.
- Cobertura multilingue desigual: optimizado para polaco, el rendimiento en el resto de las 31 lenguas puede variar y no esta cuantificado con benchmarks publicos.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones de los datos de entrenamiento originales, no detalladas en la model card.
- Soporte de tool calling dependiente de la plantilla: requiere usar la plantilla de Ollama con herramientas o replicar el formato `<tool_call>` manualmente; no es un comportamiento garantizado por el modelo fuera de ese formato.
- `inference: false` en los metadatos del repo: el repositorio esta pensado para descarga y uso con llama.cpp/Ollama, no para carga directa con `transformers`.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/speakleash/Bielik-11B-v3.0-Instruct-GGUF
- Modelo base (Instruct): https://huggingface.co/speakleash/Bielik-11B-v3.0-Instruct
- Modelo base de preentrenamiento: https://huggingface.co/speakleash/Bielik-11B-v3-Base-20250730
- Ollama: https://ollama.com/SpeakLeash/bielik-11b-v3.0-instruct
- SpeakLeash: https://speakleash.org/
- ACK Cyfronet AGH: https://www.cyfronet.pl/
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
