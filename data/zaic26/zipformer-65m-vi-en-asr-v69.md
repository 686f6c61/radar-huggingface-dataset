# ZAIC26/Zipformer-65M-vi-en-ASR-v69

## Resumen

Zipformer-65M-vi-en-ASR-v69 es un modelo de reconocimiento automatico del habla (ASR) de tipo transducer, desarrollado por el usuario ZAIC26 y publicado en Hugging Face. Se trata de un fine-tune del modelo base ZAIC26/Zipformer-65M-vi-en, orientado a la transcripcion de voz en vietnamita e ingles. Con aproximadamente 65 millones de parametros, es un modelo compacto disenado para inferencia offline eficiente mediante la libreria sherpa-onnx, lo que lo hace adecuado para despliegues en entornos con recursos limitados.

El modelo emplea la arquitectura Zipformer, una variante de transformer con codificador de multiples escalas temporales, combinada con un decodificador transducer (RNN-T). Se distribuye en formato ONNX con los tres componentes separados (encoder, decoder y joiner) en precision fp32, junto con el vocabulario de tokens y el modelo BPE de 8000 unidades. Su salida preserva mayusculas, puntuacion y escribe los numeros con palabras, lo que simplifica el postprocesado en aplicaciones de transcripcion.

Su relevancia actual radica en la demanda de soluciones ASR ligeras y desplegables localmente para vietnamita, un idioma con menos cobertura en modelos comerciales. Al estar empaquetado para sherpa-onnx, permite ejecucion en CPU sin dependencias de frameworks pesados, lo que facilita su integracion en aplicaciones de escritorio, moviles o sistemas embebidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Zipformer transducer (RNN-T) |
| Parametros totales | ~65M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32 (ONNX); no se documentan otras variantes |
| Idiomas soportados | vietnamita (vi), ingles (en) |
| Licencia | no disponible |
| Formato de pesos | ONNX (encoder.onnx, decoder.onnx, joiner.onnx), tokens.txt, bpe.model |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Zipformer, un codificador transformer con atencion multi-escala que procesa la señal acustica a distintas resoluciones temporales para reducir coste computacional manteniendo precision. Sobre este codificador se monta un decodificador transducer (RNN-T) que combina prediccion y joint network para generar la secuencia de tokens de forma autorregresiva durante la decodificacion. El modelo base es ZAIC26/Zipformer-65M-vi-en, sobre el que se ha realizado un fine-tune especifico (version v69) para mejorar la transcripcion en vietnamita.

El vocabulario utiliza BPE con 8000 unidades, donde las mayusculas se codifican mediante el token especial `<cap>`. La entrada de audio se procesa a 16 kHz mono con 80 dimensiones de features (probablemente filtros mel). No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO, ya que la model card no detalla estos aspectos. La decodificacion recomendada es `modified_beam_search` con `max_active_paths=4`.

## Capacidades

- Reconocimiento automatico del habla offline para vietnamita e ingles.
- Transcripcion con preservacion de mayusculas y puntuacion en la salida.
- Escritura de numeros con palabras en el texto generado.
- Decodificacion mediante beam search modificado (modified_beam_search).
- Ejecucion en CPU a traves de sherpa-onnx, con soporte para multiples hilos (num_threads configurable).
- Procesamiento de audio WAV a 16 kHz mono.
- No se documenta soporte de tool calling, agentes, vision ni audio mas alla de ASR.

## Casos de uso

- Transcripcion de reuniones y notas de voz en vietnamita: el modelo convierte grabaciones de audio en texto con puntuacion y mayusculas, adecuado para actas o resumenes posteriores en entornos ofimaticos.
- Subtitulado automatico de contenido audiovisual: al ser offline y ligero, puede generar subtitulos en vietnamita para videos sin depender de servicios en la nube.
- Asistentes de voz locales: integracion en aplicaciones de escritorio o moviles que requieran dictado por voz sin conexion, gracias al formato ONNX y sherpa-onnx.
- Atencion al cliente en centros de llamadas: transcripcion de conversaciones telefonicas en vietnamita para analisis de calidad o busqueda de texto completo.
- Sistemas embebidos y dispositivos de borde: los ~65M de parametros y la inferencia en CPU permiten desplegar ASR en hardware modesto como Raspberry Pi o mini-PC.
- Investigacion en ASR multilingue: como punto de partida para fine-tuning en vietnamita o para comparar arquitecturas Zipformer frente a otros transducers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: al ejecutarse en CPU mediante sherpa-onnx, no requiere VRAM dedicada; en GPU el modelo fp32 de ~65M parametros ocupa aproximadamente 260 MB en memoria.
- GPU recomendadas: no es necesario GPU; cualquier CPU moderna con varios nucleos es suficiente. En caso de usar GPU, cualquier modelo con al menos 1 GB de memoria (GTX 1050, RTX 3050, etc.) es adecuado.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer, aunque el diseno esta orientado a CPU.
- Opciones de despliegue: sherpa-onnx (recomendado), ONNX Runtime; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a ASR transducer).
- Latencia y throughput: no disponibles; dependen del hardware y del numero de hilos configurado (num_threads=8 en el ejemplo).

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Zipformer-65M-vi-en-ASR-v69 | ~65M | vi, en | ONNX | no disponible | Hugging Face |
| Whisper small | ~244M | multilingue (99 idiomas) | PyTorch, ONNX, GGML | MIT | Hugging Face, OpenAI |
| Whisper tiny | ~39M | multilingue (99 idiomas) | PyTorch, ONNX, GGML | MIT | Hugging Face, OpenAI |
| Wav2Vec2 base vietnamita | ~95M | vi | PyTorch | variable segun checkpoint | Hugging Face |

El modelo de ZAIC26 es mas ligero que Whisper small y esta especializado en vietnamita, mientras que Whisper ofrece cobertura multilingue mucho mayor a costa de mas parametros. No se dispone de datos de rendimiento comparativo (WER) para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- No se especifica la licencia, lo que impide confirmar si el uso comercial esta permitido; es necesario contactar con el autor antes de usarlo en produccion.
- El modelo solo soporta vietnamita e ingles; no se ha validado para otros idiomas.
- Al ser un fine-tune de un modelo base, puede heredar sesgos acusticos y lexicales del dataset original, no documentado.
- Riesgo de errores en nombres propios, terminologia tecnica y audio con ruido o acentos no representados en el entrenamiento.
- La salida requiere postprocesado para convertir el token `<cap>` en mayusculas reales, tal como indica la model card.
- No se documentan limites de longitud de audio ni de contexto; el rendimiento puede degradarse en grabaciones muy largas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de validacion por parte de la comunidad.
- No se han publicado benchmarks, por lo que no es posible verificar la calidad de transcripcion de forma objetiva.

## Enlaces

- Hugging Face: https://huggingface.co/ZAIC26/Zipformer-65M-vi-en-ASR-v69
- Modelo base: https://huggingface.co/ZAIC26/Zipformer-65M-vi-en
- sherpa-onnx (libreria de inferencia): https://github.com/k2-fsa/sherpa-onnx
- Documentacion de sherpa-onnx: https://k2-fsa.github.io/sherpa/onnx/
