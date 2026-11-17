# tokenaii/Replica-Preview-0.6B

## Resumen

Replica Preview 0.6B es el primer modelo de texto a voz (TTS) de TokenAI, una startup sin animo de lucro fundada en mayo de 2025 por Assem Sabry, y el punto de partida de la familia Replica. Se trata de un sistema TTS multilingue no autorregresivo basado en difusion, construido sobre el modelo OmniVoice de k2-fsa, con un foco explicito en habla natural y expresiva, sonidos no verbales (respiraciones, suspiros, risas, muletillas) y un rendimiento optimizado para arabe egipcio (arz) y cambio de codigo arabe-ingles.

El modelo combina un backbone LLM Qwen3-0.6B-Base con un codec de audio HiggsAudioV2Tokenizer y ocho cabezas de audio dedicadas, sumando 612,6 millones de parametros en total. Su diseno no autorregresivo con difusion permite una sintesis rapida (RTF de 0,153 en streaming, aproximadamente 6,5 veces tiempo real) y un tiempo hasta el primer audio de unos 0,65 segundos, lo que lo hace viable para aplicaciones conversacionales en produccion.

Su relevancia actual radica en dos factores: por un lado, cubre un nicho poco atendido como es el TTS de alta calidad para arabe egipcio con soporte de code-switching; por otro, su licencia Apache 2.0 y su reducido requisito de VRAM (2,5-3 GB en bf16) lo convierten en una opcion accesible para desarrolladores que quieran desplegar clonacion de voz zero-shot y diseno de voz sin infraestructura costosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS no autorregresivo basado en difusion; backbone LLM Qwen3-0.6B-Base + codec HiggsAudioV2Tokenizer + 8 cabezas de audio |
| Parametros totales | 612.577.288 (LLM 595,8M + embeddings de audio 8,4M + cabezas de audio 8,4M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en float32 y uso recomendado en bfloat16) |
| Idiomas soportados | 646 heredados de OmniVoice; optimizado para arabe egipcio (arz), ingles, frances, aleman y espanol; tags declaran ar, en, fr, de, es, zh, ja, ko |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (float32, 2,45 GB) + codec (0,77 GB); total 3,22 GB |

## Arquitectura y entrenamiento

Replica Preview 0.6B es un sistema TTS no autorregresivo que emplea un proceso de difusion para generar los tokens de audio. El backbone es Qwen3-0.6B-Base, sobre el que se anaden embeddings de audio (8,4M de parametros) y ocho cabezas de audio (8,4M) con pesos [8, 8, 6, 6, 4, 4, 2, 2]. La representacion del audio se realiza mediante el codec HiggsAudioV2Tokenizer, con 9 codebooks de 1024 entradas, hop de 960, entrada a 16 kHz y salida a 24 kHz. El modelo se construye como un finetune del modelo base k2-fsa/OmniVoice, del que hereda el soporte para 646 idiomas.

La informacion disponible no detalla el volumen de datos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Las innovaciones tecnicas destacables documentadas incluyen la generacion por difusion con control del numero de pasos (`num_step`), el streaming por fragmentos de frase con un RTF de 0,153, la capacidad de clonacion de voz zero-shot a partir de audio de referencia y el diseno de voz mediante instrucciones en lenguaje natural (genero, edad, tono, estilo y acento).

## Capacidades

- Generacion de voz natural y expresiva en 646 idiomas heredados, con optimizacion para arabe egipcio, ingles, frances, aleman y espanol.
- Clonacion de voz zero-shot a partir de una referencia de audio corta, con numero ilimitado de hablantes.
- Diseno de voz (Voice Design) mediante instrucciones que combinan genero, edad, tono, estilo y acento.
- Seleccion automatica de voz (Auto voice).
- Sonidos no verbales insertables en el texto: `[inhale]`, `[exhale]`, `[sigh]`, `[laughter]`, `[laugh]` y muletillas como `هممم`, `آه`, `ah`, `oh`, `Hmmm`, `phew`.
- Normalizacion de numeros: conversion automatica de digitos arabes a palabras egipcias (por ejemplo, 5000 -> خمسة آلاف).
- Soporte de cambio de codigo arabe-ingles, aunque es su area mas debil.
- Streaming por fragmentos de frase con baja latencia.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso (no es un modelo de lenguaje general, sino un TTS).

## Casos de uso

- Atencion al cliente automatizada en arabe egipcio: el modelo puede sintetizar respuestas conversacionales naturales con muletillas y respiraciones, lo que reduce la sensacion de artificialidad en asistentes telefonicos o chatbots de voz; su RTF de 0,153 permite interaccion en tiempo real.
- Audiolibros y narracion: la clonacion de voz zero-shot permite mantener la voz de un narrador a lo largo de horas de contenido, y la insercion de suspiros y respiraciones mejora la naturalidad de la lectura.
- Doblaje y localizacion de contenido: con 646 idiomas heredados y optimizacion para cinco idiomas principales, se puede generar pistas de voz para videos o cursos sin necesidad de estudios de grabacion.
- Asistentes de voz embebidos: con 2,5-3 GB de VRAM en bf16, el modelo cabe en GPUs de consumo y puede desplegarse en entornos con recursos limitados para asistentes de escritorio o domotica.
- Prototipado de personajes y videojuegos: el diseno de voz por instrucciones (genero, edad, tono, acento) permite generar voces de personajes sin muestras previas, agilizando el prototipado.
- Accesibilidad: conversion de texto a voz de alta calidad para lectores de pantalla en arabe egipcio y otros idiomas, con la posibilidad de clonar la voz del propio usuario.
- Generacion de contenido para redes sociales y podcasts: sintesis rapida por lotes (RTF aproximado de 0,01 con `num_step=8`) para producir grandes volumenes de audio en poco tiempo.
- Investigacion en TTS multilingue y code-switching: el modelo sirve como base para estudiar la sintesis en contextos de mezcla de idiomas, un area con pocos recursos abiertos.

## Benchmarks y rendimiento

Evaluacion mediante CER de ida y vuelta (generar habla, transcribir con Whisper large-v3 y comparar con la entrada):

| Metrica | Valor |
|---|---|
| CER arabe egipcio | 0,066 - 0,086 |
| CER conversacional | 0,0937 |
| CER ingles | 0,041 |
| CER code-switch | 0,2488 - 0,270 (area mas debil) |
| CER numeros | 0,00 - 0,26 |
| Tasa de fallo (CER > 0,2) | 0,03 |
| RTF (streaming) | 0,153 (~6,5x tiempo real) |
| TTFA (tiempo hasta primer audio) | ~0,65 s |
| DNSMOS ovrl_mos | 3,35 (arabe) / 3,47 (ingles) |
| Similitud de hablante MFCC | 0,9985 (arabe) / 0,9972 (ingles) |
| Fidelidad de Voice Design | 0,999 |

Latencia:

| Escenario | Valor |
|---|---|
| Latencia del primer fragmento (streaming) | ~0,65 s |
| Frase completa (~30 s de audio) | ~2-4 s de tiempo real |
| RTF (streaming, por fragmentos de frase) | 0,153 |
| RTF (por lotes, `num_step=8`) | ~0,01 |

## Requisitos de hardware

- VRAM estimada para inferencia: ~2,5-3 GB en bf16.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; se menciona `cuda:0` en los ejemplos, sin modelos concretos especificados.
- Cabe en GPU de consumo: si, dado el reducido requisito de VRAM (por ejemplo, RTX 3060, RTX 4060 o superiores).
- Opciones de despliegue: la libreria `omnivoice` (unica documentada en la model card); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: TTFA de ~0,65 s en streaming; RTF de 0,153 en streaming y ~0,01 en modo por lotes con `num_step=8`.

## Comparativa con modelos similares

No se han publicado comparativas con modelos alternativos en la informacion disponible. La model card no incluye tablas comparativas frente a otros sistemas TTS como XTTS, Bark, F5-TTS o CosyVoice. Como referencia estructural, el propio modelo se construye sobre k2-fsa/OmniVoice, del que hereda los 646 idiomas y la arquitectura base, pero no se dispone de datos de rendimiento comparativos entre ambos.

## Limitaciones y advertencias

- El cambio de codigo arabe-ingles es el area mas debil, con CER de 0,2488-0,270, muy por encima del resto de metricas.
- La pronunciacion de numeros varia ocasionalmente (por ejemplo, "خمس تلاف" frente a "خمسة آلاف").
- Requiere el tokenizer Higgs Audio V2 incluido en `audio_tokenizer/`; no es un modelo autocontenido sin ese componente.
- No se documentan sesgos conocidos, pero al ser un modelo TTS multilingue entrenado sobre datos no especificados, existe riesgo de sesgos de acento, genero y origen en las voces generadas.
- Riesgo de alucinacion en la sintesis: el CER de ida y vuelta no es cero, lo que implica posibles errores de pronunciacion o inserciones no deseadas, especialmente en code-switching y numeros.
- La clonacion de voz zero-shot plantea riesgos de uso indebido (suplantacion de identidad); aunque la licencia es Apache 2.0 y permite uso comercial, el despliegue en produccion deberia incorporar consentimiento y verificacion de la referencia de audio.
- No se documentan limitaciones de longitud de contexto ni de idioma mas alla de las metricas de CER; el rendimiento en idiomas distintos de los cinco optimizados no esta cuantificado.
- La licencia Apache 2.0 permite uso comercial sin restricciones adicionales documentadas, pero el modelo base OmniVoice podria tener sus propias condiciones que conviene verificar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tokenaii/Replica-Preview-0.6B
- Pagina oficial del modelo en TokenAI: https://tokenai.llc/projects/models/replica-preview-0.6b
- Pagina de la familia Replica Preview: https://tokenai.llc/projects/replica-preview
- Modelo base OmniVoice: https://huggingface.co/k2-fsa/OmniVoice
- LLM base Qwen3-0.6B-Base: https://huggingface.co/Qwen/Qwen3-0.6B-Base
- Web de TokenAI: https://assem.one
- Contacto: info@tokenai.llc
