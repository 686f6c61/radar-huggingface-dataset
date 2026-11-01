# zalozbadev/whisper-large-v3-turbo-hsb-aug-v2-ggml

## Resumen

El modelo `zalozbadev/whisper-large-v3-turbo-hsb-aug-v2-ggml` es una conversion al formato GGML del ajuste fino de Whisper large-v3-turbo para reconocimiento automatico del habla (ASR) en alto sorabo (`hsb`), una lengua minoritaria eslava hablada en la Lusacia alemana. Lo desarrolla el usuario zalozbadev y se publica bajo licencia CC-BY-4.0. Aunque la etiqueta `pipeline_tag` de HuggingFace indica `text-to-speech`, la arquitectura subyacente es la de Whisper, un modelo encoder-decoder transformer orientado a transcripcion de audio a texto; la etiqueta parece un error de clasificacion del autor.

El modelo parte de `openai/whisper-large-v3-turbo`, un checkpoint de 809 millones de parametros con 1280 dimensiones de representacion y 32 capas de encoder, disenado por OpenAI para transcripcion multilingue con un contexto de audio de 30 segundos. El ajuste fino incorpora datos en alto sorabo para mejorar la cobertura de una lengua con pocos recursos, y esta version GGML permite ejecutarlo con whisper.cpp en CPU y GPU consumer sin dependencias de PyTorch.

Su relevancia actual reside en la escasez de modelos ASR para lenguas minoritarias y en la posibilidad de desplegar transcripcion en alto sorabo en entornos con recursos limitados gracias a la cuantizacion Q8_0 incluida. El repositorio ocupa 2,5 GB y no registra descargas ni interacciones en el momento de la consulta, lo que sugiere un modelo experimental de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo) |
| Parametros totales | 809 millones (heredados del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 30 segundos de audio por ventana (heredado del modelo base) |
| Tipos de cuantizacion | Q8_0 (GGML) |
| Idiomas soportados | alto sorabo (`hsb`) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGML (para whisper.cpp) |
| Tamano del repositorio | 2,5 GB |
| Modelo base | openai/whisper-large-v3-turbo |
| Runtime soportado | whisper.cpp |

## Arquitectura y entrenamiento

La arquitectura corresponde a Whisper large-v3-turbo: un encoder transformer que procesa espectrogramas mel de audio y un decoder autorregresivo que genera tokens de texto, con atencion cruzada entre ambos. El checkpoint base de OpenAI fue entrenado con 680.000 horas de audio etiquetado y pseudoetiquetado multilingue, y la variante turbo reduce el numero de capas del decoder para acelerar la inferencia manteniendo el encoder completo.

El ajuste fino especifico para alto sorabo se realizo sobre `openai/whisper-large-v3-turbo`, presumiblemente con un corpus de audio-transcripcion en `hsb`, aunque la model card no detalla el volumen de datos, la composicion del dataset ni si se aplicaron tecnicas de aumento de datos (el sufijo `aug` sugiere aumento, pero no se especifica). No se documenta el uso de RLHF, DPO ni otras tecnicas de alineacion; en ASR no son habituales. La conversion a GGML con cuantizacion Q8_0 reduce el peso del modelo a aproximadamente un cuarto del original en float32, facilitando su ejecucion en whisper.cpp.

## Capacidades

- Transcripcion de audio a texto en alto sorabo (`hsb`), idioma objetivo del ajuste fino.
- Reconocimiento de voz con ventanas de 30 segundos, procesando audio continuo mediante segmentacion.
- Ejecucion en CPU y GPU mediante whisper.cpp, sin necesidad de PyTorch ni CUDA toolkit completo.
- Cuantizacion Q8_0 que reduce el uso de memoria respecto al modelo en punto flotante.
- Capacidad multilingue residual del modelo base Whisper large-v3-turbo, aunque el ajuste fino puede degradar el rendimiento en otros idiomas no vistos durante el entrenamiento.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso, ya que es un modelo puramente ASR.
- No se documentan capacidades de traduccion explicita, diarizacion de hablantes ni marcas de tiempo; whisper.cpp puede generar segmentos con timestamps, pero no se confirma en la model card.

## Casos de uso

- Transcripcion de archivos de audio en alto sorabo para archivos linguisticos y documentacion de patrimonio oral: el modelo convierte grabaciones de entrevistas o cuentos tradicionales en texto, aprovechando el ajuste fino especifico para esta lengua minoritaria.
- Subtitulado de contenido audiovisual en lusaciano: se puede integrar en pipelines de whisper.cpp para generar subtitulos de videos educativos o institucionales en alto sorabo, con la ventaja de ejecutarse en hardware modesto.
- Herramientas de accesibilidad para hablantes de alto sorabo: transcripcion en tiempo casi real de reuniones o clases mediante whisper.cpp en un portatil con CPU, dado el bajo requisito de memoria de la cuantizacion Q8_0.
- Investigacion en tecnologias del lenguaje para lenguas de bajos recursos: sirve como punto de partida para evaluar la calidad ASR en `hsb` y comparar con otros ajustes finos o modelos multilingues.
- Digitalizacion de medios de comunicacion regionales en Lusacia: conversion de archivos de radio o television en alto sorabo a texto indexable para busqueda y archivo.
- Prototipos de asistentes de voz locales para comunidades minoritarias: al ejecutarse con whisper.cpp, permite desplegar transcripcion on-premise sin enviar audio a servicios en la nube, relevante por privacidad y por conectividad limitada en zonas rurales.
- Evaluacion comparativa de cuantizacion: el archivo Q8_0 permite medir la perdida de precision frente al modelo original en float16 para tareas ASR en `hsb`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye WER (word error rate), CER ni comparaciones con otros modelos para alto sorabo.

## Requisitos de hardware

- VRAM estimada: el archivo GGML Q8_0 ocupa aproximadamente 2,5 GB en disco; en memoria, Whisper large-v3-turbo en Q8_0 requiere del orden de 1-2 GB, aunque no se dispone de una cifra oficial en la informacion proporcionada.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar la version Q8_0; tarjetas consumer como RTX 3060, RTX 4060 o superiores son suficientes. Para mayor velocidad, RTX 4090 o A100/H100 reducen la latencia, aunque el modelo es pequeno y no las aprovecha completamente.
- Cabe en GPU consumer: si, practicamente cualquier GPU consumer moderna con 4 GB o mas de VRAM; tambien funciona en CPU.
- Opciones de despliegue: whisper.cpp es el runtime oficial indicado; no se documenta soporte para vLLM, TGI, llama.cpp ni Ollama (estos ultimos no estan orientados a Whisper de forma nativa).
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen del hardware y de la duracion del audio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| whisper-large-v3-turbo-hsb-aug-v2-ggml (este) | 809 M | 30 s | hsb | CC-BY-4.0 | GGML Q8_0 | HuggingFace |
| openai/whisper-large-v3-turbo | 809 M | 30 s | multilingue (99 idiomas) | MIT | safetensors, GGML | HuggingFace, OpenAI |
| openai/whisper-large-v3 | 1550 M | 30 s | multilingue (99 idiomas) | MIT | safetensors, GGML | HuggingFace, OpenAI |
| whisper-small | 244 M | 30 s | multilingue (99 idiomas) | MIT | safetensors, GGML | HuggingFace, OpenAI |

La comparativa se limita a la familia Whisper porque no se dispone de informacion sobre otros modelos ASR especificos para alto sorabo. El modelo de este repositorio se distingue por el ajuste fino a `hsb` y la cuantizacion Q8_0, pero carece de datos publicos de rendimiento que permitan comparar su WER con el modelo base.

## Limitaciones y advertencias

- Modelo de nicho con cero descargas y cero likes en el momento de la consulta; no hay evidencia de validacion por la comunidad.
- No se publican metricas de calidad (WER/CER) ni detalles del dataset de ajuste fino, lo que impide evaluar su robustez real en alto sorabo.
- El ajuste fino a un solo idioma puede degradar el rendimiento en otros idiomas respecto al modelo base multilingue.
- Riesgo de alucinacion en pasajes de audio con ruido, silencios o habla solapada, comportamiento comun en Whisper.
- Sesgos potenciales heredados del entrenamiento del modelo base (dominio de ingles y lenguas mayoritarias, posibles sesgos demograficos y de acento).
- La etiqueta `text-to-speech` de HuggingFace es incorrecta para un modelo ASR; puede confundir a herramientas de descubrimiento y a usuarios.
- Licencia CC-BY-4.0 permite uso comercial con atribucion, pero el modelo base Whisper de OpenAI tiene licencia MIT; conviene verificar la compatibilidad y citar adecuadamente.
- Solo se ofrece cuantizacion Q8_0; no hay versiones Q4, Q5 ni float16 en este repositorio, limitando el ajuste fino de memoria/velocidad.
- No se documenta soporte para otros runtimes distintos de whisper.cpp, lo que restringe su integracion en stacks basados en PyTorch o TensorFlow.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/zalozbadev/whisper-large-v3-turbo-hsb-aug-v2-ggml
- Modelo original ajustado: https://huggingface.co/zalozbadev/whisper-large-v3-turbo-hsb-aug-v2
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- whisper.cpp: https://github.com/ggerganov/whisper.cpp
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
