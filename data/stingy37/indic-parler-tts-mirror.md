# Stingy37/indic-parler-tts-mirror

## Resumen

Indic Parler-TTS es un modelo text-to-speech (TTS) multilingue desarrollado por AI4Bharat (IIT Madras) en colaboracion con el equipo de audio de Hugging Face. Es una extension del modelo Parler-TTS Mini v1.1, afinada sobre un corpus de 1.806 horas de audio en lenguas indicas e ingles, y esta disenado para sintetizar voz en 21 idiomas (20 lenguas indicas mas ingles) con control fino sobre caracteristicas prosodicas mediante descripciones en lenguaje natural (captions).

La ficha que nos ocupa, `Stingy37/indic-parler-tts-mirror`, es un espejo no modificado del repositorio original `ai4bharat/indic-parler-tts` (revision `660bc53c64ae83150613264111708a0465211237`), publicado el 2 de noviembre de 2026. Los pesos, tokenizer y ficheros de configuracion son identicos byte a byte al original; solo se ha anadido un aviso y una copia de la licencia Apache 2.0.

El modelo emplea una arquitectura `parler_tts` implementada en la libreria `transformers`, con 937.803.241 parametros y un tamano de repositorio de 3,8 GB en formato safetensors. Su relevancia radica en cubrir un hueco historicamente desatendido: la sintesis de voz de calidad en lenguas indicas con control expresivo, algo poco habitual en modelos TTS open source, que suelen centrarse en ingles y unas pocas lenguas europeas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Parler-TTS (transformer encoder-decoder para TTS, implementado en `transformers` como `parler_tts`) |
| Parametros totales | 937.803.241 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el repo no documenta cuantizaciones oficiales) |
| Idiomas soportados | 21 oficiales: assames, bengali, bodo, dogri, ingles, gujarati, hindi, kannada, konkani, maithili, malayalam, manipuri, marathi, nepali, odia, sanscrito, santali, sindhi, tamil, telugu y urdu. Soporte no oficial: chhattisgarhi, cachemir y punyabi |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Indic Parler-TTS es un fine-tuning de Indic Parler-TTS Pretrained, que a su vez deriva de Parler-TTS Mini v1.1. La arquitectura sigue el diseno Parler-TTS: un modelo de lenguaje basado en transformer que genera tokens de audio a partir de dos entradas, el transcript (texto a sintetizar) y el caption (descripcion en lenguaje natural del estilo de voz deseado). El modelo se entreno sobre un dataset de 1.806 horas de audio multilingue indico e ingles, con anotaciones de estilo asociadas al dataset `ai4b-hf/GLOBE-annotated`.

Una innovacion destacable es el uso de dos tokenizers separados: uno para el prompt (transcript) y otro para la descripcion (caption). El tokenizer del prompt tiene un vocabulario mayor y maneja byte fallback, lo que facilita la extension a nuevas lenguas y el entrenamiento multilingue. El modelo incorpora 69 voces unicas distribuidas entre los idiomas soportados, con conjuntos de voces recomendadas por lengua optimizadas para naturalidad e inteligibilidad.

El control expresivo se ejerce mediante el caption: el usuario puede especificar ruido de fondo, reverberacion, expresividad, tono (pitch), velocidad de habla y calidad de voz. Diez lenguas (assames, bengali, bodo, dogri, kannada, malayalam, marathi, nepali, sanscrito y tamil) soportan oficialmente prompts de emocion especificos, con categorias como comando, enfado, narracion, conversacion, disgusto, miedo, felicidad, neutro, nombre propio, noticias, tristeza y sorpresa. No se documentan en la informacion disponible detalles sobre RLHF, DPO ni composicion exacta del dataset mas alla del numero de horas.

## Capacidades

- Sintesis de voz (text-to-speech) en 21 idiomas oficiales, con foco en lenguas indicas.
- Control de estilo mediante captions en lenguaje natural: ruido de fondo, reverberacion, expresividad, pitch, velocidad y calidad de voz.
- Renderizado de emociones en 10 lenguas (comando, enfado, narracion, conversacion, disgusto, miedo, felicidad, neutro, nombre propio, noticias, tristeza, sorpresa).
- 69 voces unicas con conjuntos de voces recomendadas por idioma.
- Soporte de acentos de ingles indio de forma nativa; personalizacion de otros acentos (britanico, americano) mediante style transfer descrito en el caption.
- Capacidad de extension a nuevas lenguas gracias al tokenizer con byte fallback y mayor vocabulario.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un modelo exclusivamente TTS.
- No dispone de vision, audio de entrada ni modo thinking.

## Casos de uso

- **Localizacion de contenido para lenguas indicas**: el modelo permite generar narraciones en hindi, tamil, telugu, bengali y otras lenguas para audiolibros, cursos o material divulgativo, con control de velocidad y pitch para adaptarse al registro del contenido.
- **Atencion al cliente en centros de contacto regionales**: se puede integrar en sistemas IVR para sintetizar respuestas en la lengua del usuario, ajustando el estilo (tono neutro o conversacional) mediante captions y usando las voces recomendadas por idioma para maximizar inteligibilidad.
- **Accesibilidad y lectores de pantalla**: conversion de texto a voz para personas con discapacidad visual en lenguas indicas, donde la oferta de TTS de calidad es limitada; el control de velocidad y claridad resulta util para distintos perfiles de usuario.
- **Doblaje y produccion audiovisual**: generacion de voces para narracion, noticias o documentales, con la posibilidad de solicitar emociones concretas (tristeza, sorpresa, enfado) en las diez lenguas que las soportan oficialmente.
- **Asistentes de voz embebidos**: sintesis de respuestas habladas en asistentes domesticos o aplicaciones moviles para usuarios de lenguas indicas, aprovechando las 69 voces disponibles para personalizar la identidad sonora del producto.
- **Generacion de datasets de audio sintetico**: creacion de corpus de voz etiquetados con atributos de estilo (pitch, velocidad, emocion) para entrenar otros modelos de reconocimiento de voz o de clasificacion de emociones en lenguas con pocos recursos.
- **Prototipado de interfaces conversacionales multilingues**: evaluacion rapida de experiencias de voz en varias lenguas sin necesidad de grabaciones humanas, usando captions para simular distintos locutores y estilos antes de invertir en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 937,8 millones de parametros en safetensors, los pesos en precision completa (fp32) ocupan aproximadamente 3,8 GB; en fp16/bf16 alrededor de 1,9 GB; en cuantizacion de 8 bits en torno a 1 GB y en 4 bits cerca de 0,5 GB (estimaciones teoricas, no confirmadas por el autor).
- GPU recomendadas: una GPU consumer con 8 GB o mas (RTX 3060, RTX 4060, RTX 4070) deberia ser suficiente para inferencia en fp16; para produccion con concurrencia se recomienda A100, H100 o L40S.
- Cabe en GPU consumer: si, previsiblemente en la mayoria de tarjetas con 6-8 GB o mas, aunque el autor no publica requisitos oficiales.
- Opciones de despliegue: la model card indica `pip install git+https://github.com/huggingface/parler-tts.git` y el uso via `transformers`; el campo `inference: false` de la model card sugiere que no esta habilitado para inference API en Hugging Face. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Indic Parler-TTS (este espejo) | 937,8 M | 21 oficiales (20 indicas + ingles) | no disponible | Apache 2.0 | Control de estilo por caption, 69 voces, emociones en 10 lenguas |
| Indic-Speak (bodhan-ai) | no disponible | 22 lenguas indicas | no disponible | no disponible | Recomendado por el propio autor de Indic Parler-TTS como alternativa con mejores capacidades TTS |
| Parler-TTS Mini v1.1 | no disponible | principalmente ingles | no disponible | Apache 2.0 | Modelo base del que deriva; sin cobertura indicia |
| Indic Parler-TTS Pretrained | no disponible | multilingue indico | no disponible | Apache 2.0 | Checkpoint preentrenado previo al fine-tuning |

## Limitaciones y advertencias

- Es un espejo no oficial: el autor del espejo no mantiene el modelo ni publica actualizaciones; deben consultarse las del repositorio original `ai4bharat/indic-parler-tts`.
- El propio autor original recomienda usar Indic-Speak (bodhan-ai) por encima de Indic Parler-TTS, lo que sugiere que este modelo puede estar desactualizado frente a alternativas mas recientes.
- Soporte no oficial (no validado extensamente) para chhattisgarhi, cachemir y punyabi; la calidad en estas lenguas puede ser inferior.
- El soporte de emociones solo esta validado en 10 lenguas; en el resto existe pero no se ha probado a fondo.
- Riesgo de alucinacion en el sentido de prosodia o pronunciacion incorrecta en textos con nombres propios, siglas o prestamos; el propio modelo incluye una emocion especifica para "nombre propio", lo que sugiere que es un caso problematico.
- No es un modelo conversacional ni de razonamiento: no soporta tool calling, agentes ni multi-step reasoning; su uso esta limitado a sintesis de voz.
- El campo `inference: false` indica que no esta disponible para la API de inferencia alojada de Hugging Face; el despliegue debe hacerse en infraestructura propia.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del dataset `ai4b-hf/GLOBE-annotated` y de las voces utilizadas en el entrenamiento antes de un despliegue en produccion.
- No se documentan sesgos especificos ni evaluaciones de robustez en la informacion disponible.

## Enlaces

- Repositorio espejo en Hugging Face: https://huggingface.co/Stingy37/indic-parler-tts-mirror
- Repositorio original: https://huggingface.co/ai4bharat/indic-parler-tts
- Checkpoint preentrenado: https://huggingface.co/ai4bharat/indic-parler-tts-pretrained
- Modelo base Parler-TTS Mini v1.1: https://huggingface.co/parler-tts/parler-tts-mini-v1.1
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/ai4bharat/indic-parler-tts
- Repositorio de codigo Parler-TTS: https://github.com/huggingface/parler-tts
- Guia de optimizacion de inferencia: https://github.com/huggingface/parler-tts/blob/main/INFERENCE.md
- AI4Bharat: https://ai4bharat.iitm.ac.in/
- Dataset GLOBE-annotated: https://huggingface.co/datasets/ai4b-hf/GLOBE-annotated
- Alternativa recomendada Indic-Speak: https://huggingface.co/bodhan-ai/indic-speak
- Paper de referencia (arXiv:2402.01912): https://arxiv.org/abs/2402.01912
