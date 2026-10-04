# sucrette/chatterbox-nano-t3-coreai

## Resumen

Chatterbox Nano T3 para Core AI es la conversion del modelo T3 (token-to-token) de Resemble AI a formato nativo de Apple Core AI (`.aimodel`, macOS 27), publicada por el usuario sucrette. El T3 original es un decoder autoregresivo estilo GPT-2 de 12 capas, ancho 768 y 12 cabezas que constituye la primera etapa del pipeline de sintesis de voz de Chatterbox: transforma texto y condicionamiento de voz en tokens de habla, que despues se convierten en audio en una segunda etapa (S3Gen). Esta publicacion no entrena un modelo nuevo, sino que exporta los pesos de `ResembleAI/chatterbox-nano` (`t3_nano_v1.safetensors`) como dos grafos fp16 de forma fija orientados a ejecucion on-device.

El resultado son dos grafos que comparten una cache K/V propiedad del invocante: un grafo de prefill (`t3_nano_prefill_80.aimodel`) que consume el condicionamiento de voz y el texto en una sola llamada, y un grafo de decode (`t3_nano_1024.aimodel`) que se ejecuta una vez por token de habla. La arquitectura mantiene 1024 posiciones en la cache y acepta hasta 80 tokens BPE de texto. El modelo esta pensado para integrarse con el proyecto Asa (`AsaTTS.T3Engine`) y con el repositorio complementario `chatterbox-s3gen-coreai`, que produce el audio final.

Su relevancia radica en que demuestra un pipeline de TTS open source ejecutable de forma local en Apple silicon con latencia baja (mediana de 7,0 ms por token en decode) y licencia MIT, sin dependencia de servicios en la nube. El repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha, por lo que se trata de una publicacion reciente y sin validacion de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder transformer estilo GPT-2 (T3, token-to-token): 12 capas, ancho 768, 12 cabezas; exportado como grafo Core AI fp16 de forma fija (prefill + decode) |
| Parametros totales | no disponible para el T3 (el modelo base Chatterbox Nano declara 110 M en conjunto) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | Cache K/V de 1024 posiciones; texto de entrada limitado a 80 tokens BPE |
| Tipos de cuantizacion | fp16 (grafos exportados en fp16); pesos originales en safetensors sin cuantizacion declarada |
| Idiomas soportados | Ingles (tokenizador BPE ingles de Chatterbox); no se declaran otros idiomas |
| Licencia | MIT (Copyright (c) 2025 Resemble AI) |
| Formato de pesos | `.aimodel` (Core AI); pesos de origen en safetensors |
| Tamano del repositorio | 0,5 GB |
| Vocabulario de salida | 6563 tokens (logits `[1, 6563]`) |
| Version de runtime | coreai-core 1.0.0b3, coreai-torch 0.4.3, torch 2.13.0 |

## Arquitectura y entrenamiento

El componente T3 es la primera etapa del pipeline de Chatterbox: un decoder autoregresivo tipo GPT-2 (12 capas, ancho 768, 12 cabezas) que genera tokens de habla condicionados por el texto y por una proyeccion de la voz de referencia. En esta publicacion, el modelo se ha exportado a Apple Core AI como dos grafos de forma fija fp16 que comparten una unica cache K/V gestionada por quien invoca el modelo. El grafo de prefill recibe el condicionamiento de voz (`cond` fp16 `[1, 376, 768]`, que combina la proyeccion del hablante con embeddings de habla del prompt), los ids de texto (`ids` int32 `[1, 81]`), una mascara de seleccion (`sel` fp16 `[1, 81, 1]`) y el indice del token START (`last` int32 `[1]`), y devuelve los logits en el token START. El grafo de decode recibe un token y una posicion y devuelve los logits del siguiente token. La cache se compone de `k0, v0 ... k11, v11`, cada uno fp16 `[1024, 12, 64]`; el prefill escribe las posiciones 0 a 456 y el decode escribe y atiende hasta la posicion actual. El padding se coloca despues de los tokens reales, de modo que la atencion causal nunca lo alcanza.

Esta publicacion es una conversion de pesos, no un reentrenamiento, por lo que no hay datos nuevos sobre el corpus de entrenamiento del T3 original (numero de tokens, composicion del dataset, uso de RLHF/DPO) en la informacion disponible. La innovacion tecnica principal es la propia exportacion: dos grafos de forma fija que comparten un K/V cache externo, con el muestreo ejecutado en el host y la atencion delegada al grafo. Las herramientas de conversion (`tools/export_t3_prefill.py`, `tools/export_t3_decode.py`) forman parte del proyecto Asa. La paridad con el T3 original en PyTorch se verifica mediante `tools/dump_t3_golden.py` y `tools/t3_parity.py`. Los tokens de habla producidos se envian a `chatterbox-s3gen-coreai` para generar el audio.

## Capacidades

- Generacion de tokens de habla a partir de texto: es la etapa token-to-token intermedia del pipeline TTS, no produce audio por si sola.
- Condicionamiento de voz para clonacion zero-shot: consume un tensor de condicionamiento `[1, 376, 768]` generado por voz (repositorio `chatterbox-voice-encoders-coreai`, `t3cond_nano`).
- Decodificacion incremental con cache K/V: genera un token por llamada al grafo de decode, habilitando streaming.
- Soporte de muestreo configurable: el muestreo se realiza en el host, no dentro del grafo.
- Etiquetas paralinguisticas: heredadas del modelo Chatterbox Nano original (segun la documentacion de Resemble AI).
- Generacion de audio: no disponible en este repositorio; requiere el modelo S3Gen complementario.
- Tool calling / function calling: no soportado.
- Uso como agente o razonamiento multi-paso: no aplica, es un modelo generativo de tokens de voz.
- Capacidades multilingues: no disponibles; el tokenizador es BPE ingles.
- Marca de agua (watermarking): el modelo base Chatterbox Nano la aplica por defecto segun Resemble AI; esta informacion corresponde al pipeline original y no se detalla en este repositorio.

## Casos de uso

- Sintesis de voz on-device en macOS: el modelo permite ejecutar la etapa TTS de conversion de texto a tokens de habla directamente en Apple silicon mediante Core AI, sin enviar texto ni voz a servidores externos.
- Streaming de voz de baja latencia: con una mediana de 7,0 ms por token en decode, es adecuado para asistentes conversacionales donde se necesita empezar a emitir audio antes de completar la frase, encadenando prefill, decode y S3Gen.
- Clonacion de voz zero-shot en aplicaciones locales: el condicionamiento `[1, 376, 768]` derivado de la voz de referencia permite generar habla con la timbre del hablante sin reentrenamiento, integrable en herramientas de doblaje o audiolibros personalizados.
- Accesibilidad y lectura de pantalla: integrable en apps macOS que deban leer contenido en voz alta de forma local, apropiado cuando la privacidad o la ausencia de red son requisitos.
- Desarrollo de aplicaciones Swift con TTS: el modelo esta convertido para el proyecto Asa (`AsaTTS.T3Engine`), por lo que puede integrarse en apps Swift que usen ese framework sobre Core AI.
- Investigacion sobre despliegue de TTS en Apple silicon: sirve como referencia para estudiar la exportacion de decoders autoregresivos a grafos Core AI con cache K/V externa y comparar la paridad con la implementacion PyTorch (`tools/t3_parity.py`).
- Pipelines de generacion de voz por etapas: al separar la generacion de tokens (T3) de la sintesis de audio (S3Gen), permite sustituir o ajustar cada etapa de forma independiente en un sistema TTS modular.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible; no aplican a un modelo de sintesis de voz.

| Metrica | Valor | Contexto |
|---|---|---|
| Latencia de decode | 7,0 ms por token (mediana) | Apple silicon Mac, macOS 27, Core AI GPU, coreai-core 1.0.0b3, tras exportacion |
| Throughput estimado | ~143 tokens/s (derivado de 7,0 ms/token) | Calculado a partir de la mediana de decode; no declarado por el autor |
| Paridad con PyTorch T3 | Verificada mediante `tools/t3_parity.py` | Comprueba los tokens contra el T3 de Chatterbox en PyTorch |
| Rendimiento del modelo base | 10x tiempo real en GPU y 3x en CPU, 110 M de parametros | Datos de Chatterbox Nano segun Resemble AI; corresponden al modelo completo, no al T3 aislado |

## Requisitos de hardware

- Plataforma obligatoria: Apple silicon Mac con macOS 27 y el runtime Core AI (grafos `.aimodel`). No es ejecutable en CUDA ni en CPU x86 con los frameworks habituales.
- VRAM estimada: el repositorio ocupa 0,5 GB; los grafos son fp16 y la cache K/V suma 12 capas x 2 tensores x `[1024, 12, 64]` en fp16, de orden de decenas de MB. No se especifica un requisito minimo de memoria unificada.
- GPU recomendadas: GPU integrada de Apple silicon (Core AI GPU) segun el autor; no se mencionan modelos concretos de chip (M1, M2, M3, M4).
- Compatibilidad con GPU de consumidor (NVIDIA/AMD): no soportada; el formato `.aimodel` es especifico de Apple Core AI.
- Opciones de despliegue: runtime Core AI, integracion mediante el proyecto Asa (`AsaTTS.T3Engine`, `swift test`, `asa-tts`). No compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 7,0 ms por token en decode (mediana); no se publican cifras de prefill, de pipeline completo ni de consumo energetico.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / limite | Formato | Licencia | Plataforma | Rendimiento declarado |
|---|---|---|---|---|---|---|
| chatterbox-nano-t3-coreai (este) | no disponible para T3 (base de 110 M) | Cache 1024 posiciones; 80 tokens BPE de texto | `.aimodel` | MIT | Apple Core AI (macOS 27) | 7,0 ms/token en decode |
| ResembleAI/chatterbox-nano (original) | 110 M | 80 tokens BPE de texto | safetensors / PyTorch | MIT | GPU, CPU | 10x tiempo real en GPU, 3x en CPU |
| Otras alternativas de TTS open source | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion directa solo es posible frente al modelo base del que se deriva, ya que en la informacion disponible no se detallan alternativas equivalentes con cifras verificables. La diferencia clave frente al original es el formato de despliegue (Core AI frente a PyTorch) y el enfoque on-device en Apple silicon, manteniendo la misma licencia MIT.

## Limitaciones y advertencias

- Especificidad de plataforma: los grafos `.aimodel` solo funcionan en Core AI sobre macOS 27 y Apple silicon; no hay ruta de despliegue en CUDA, ROCm ni x86.
- Modelo parcial: genera tokens de habla, no audio; requiere `chatterbox-s3gen-coreai` y el modelo de condicionamiento de voz para completar el pipeline.
- Idioma: tokenizador BPE en ingles y limite de 80 tokens de texto, lo que restringe frases largas y descarta otros idiomas salvo que se aporte un tokenizador distinto.
- Ventana de decode: la cache K/V cubre 1024 posiciones, por lo que la duracion de las secuencias generadas esta acotada por ese limite.
- Sin validacion de la comunidad: el repositorio registra 0 descargas y 0 likes, y fue creado y actualizado el mismo dia, por lo que no hay evidencia externa de robustez en produccion.
- Sin datos de sesgo, alucinacion o prosodia: la informacion disponible no incluye evaluaciones de calidad de voz, sesgos de hablante ni tasas de error, mas alla de la comprobacion de paridad con PyTorch.
- Dependencia de voces de referencia: la calidad de la clonacion zero-shot depende del condicionamiento de voz aportado; no se documentan requisitos minimos de calidad o duracion del audio de referencia en este repositorio.
- Licencia: MIT, permisiva para uso comercial, pero la atribucion corresponde a Resemble AI (Copyright (c) 2025). Conviene conservar el archivo `LICENSE` del modelo base.
- Marca de agua: el pipeline original de Chatterbox Nano aplica watermarking por defecto; no se especifica si se conserva al usar estos grafos Core AI, por lo que debe verificarse antes de un uso comercial.

## Enlaces

- Repositorio del modelo: https://huggingface.co/sucrette/chatterbox-nano-t3-coreai
- Modelo base: https://huggingface.co/ResembleAI/chatterbox-nano
- Modelo complementario de audio (S3Gen): https://huggingface.co/sucrette/chatterbox-s3gen-coreai
- Codificadores de voz: https://huggingface.co/sucrette/chatterbox-voice-encoders-coreai
- Proyecto Asa: https://github.com/ayasena/Asa
- Pagina de Chatterbox Nano en Resemble AI: https://www.resemble.ai/learn/models/chatterbox-nano
- Pagina de Chatterbox en Resemble AI: https://www.resemble.ai/learn/models/chatterbox
- Repositorio de Chatterbox: https://github.com/resemble-ai/chatterbox
- Documentacion de la arquitectura T3 (DeepWiki): https://deepwiki.com/resemble-ai/chatterbox/4.1-t3-model-overview-and-components
