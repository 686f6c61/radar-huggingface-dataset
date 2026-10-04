# warped-community/whisper-tiny-litert-lm

## Resumen

El modelo `warped-community/whisper-tiny-litert-lm` es un espejo (mirror) del modelo `litert-community/whisper-tiny`, que a su vez deriva del reconocimiento automatico del habla (ASR) `openai/whisper-tiny`. Se publica bajo la libreria `litert-lm` y el formato TFLite/LiteRT, con el objetivo de ejecutarse en dispositivos Android dentro de la aplicacion Warped, una app de chat con IA que funciona en local y sin conexion. La model card lo describe explicitamente como "mobile-ready LiteRT mirror maintained for the Warped Android app (coming-soon track)".

La relevancia de esta ficha es limitada pero clara: se trata de un artefacto de despliegue movil, no de un modelo nuevo. No introduce arquitectura ni entrenamiento propio; hereda todas las caracteristicas del Whisper tiny original, un transformer encoder-decoder de aproximadamente 39 millones de parametros orientado a transcripcion multilingue sobre ventanas de audio de 30 segundos. Su interes practico esta en el empaquetado LiteRT, pensado para inferencia en el propio telefono sin enviar audio a la nube.

En el momento de redactar esta ficha, el repositorio aparece practicamente vacio (tamano de 0.0 GB, 0 descargas, 0 likes) y la model card lo situa en una via "coming-soon", por lo que debe considerarse un artefacto en preparacion mas que un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (heredada de `openai/whisper-tiny`) |
| Parametros totales | Aproximadamente 39 M, segun el modelo base `openai/whisper-tiny` (no confirmado en la ficha del repositorio) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Ventanas de audio de 30 segundos, segun el modelo base Whisper |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible en la ficha del repositorio; el modelo base Whisper es multilingue |
| Licencia | apache-2.0 |
| Formato de pesos | LiteRT / TFLite (el modelo base original usa pesos PyTorch/safetensors) |

## Arquitectura y entrenamiento

La arquitectura es la del Whisper tiny original de OpenAI: un transformer encoder-decoder que procesa audio en ventanas de 30 segundos y genera texto de forma autorregresiva, con tareas integradas de transcripcion, traduccion al ingles e identificacion de idioma. El modelo base se entreno con supervision debil a gran escala sobre un corpus de audio diverso y multilingue, segun el articulo "Robust Speech Recognition via Large-Scale Weak Supervision". El modelo tiny es la variante mas pequena de la familia y esta pensado para escenarios con fuertes restricciones de computo.

La contribucion de este repositorio no es de entrenamiento, sino de conversion y empaquetado: transforma los pesos del modelo base a formato LiteRT para su ejecucion en Android a traves de la libreria `litert-lm`. No se documentan datos de entrenamiento adicionales, procesos de RLHF/DPO ni innovaciones tecnicas propias de esta version. La informacion sobre el proceso de conversion (herramientas, precision, calibracion) no esta disponible en la model card.

## Capacidades

- Reconocimiento automatico del habla (transcripcion de audio a texto), heredado del modelo base Whisper tiny.
- Traduccion de voz al ingles y deteccion de idioma, segun las tareas multitarea de Whisper.
- Procesamiento multilingue, en la medida en que lo soporte el modelo base (la variante tiny es la de menor calidad de la familia).
- Ejecucion local en dispositivo (on-device), orientada a Android mediante LiteRT, sin necesidad de conexion a la nube.
- Integracion en la aplicacion Warped, que combina LiteRT-LM y llama.cpp para modelos locales.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio generativo ni modo de razonamiento explicito. Tool calling y agentes: no disponibles.

## Casos de uso

- Transcripcion de notas de voz en Android: el modelo puede convertir grabaciones de audio en texto directamente en el dispositivo, sin enviar el audio a ningun servidor, gracias a su empaquetado LiteRT y a su tamano reducido.
- Subtitulado offline de contenido pregrabado: util para generar subtitulos de videos cortos en el propio telefono, procesando el audio en ventanas de 30 segundos.
- Dictado por voz en aplicaciones de productividad: integrable como capa de ASR en apps de escritura, correo o notas, manteniendo los datos en local.
- Asistentes de voz sin conexion: la app Warped puede usar este modelo para la fase de reconocimiento de comandos de voz, funcionando en entornos sin red.
- Accesibilidad para personas con dificultades de escritura: transcripcion de voz a texto en tiempo real en movil, con limites de calidad propios de la variante tiny.
- Privacidad en entornos sensibles: escenarios donde no se permite subir audio a servicios cloud (sanidad, legal, industrial) y se necesita transcripcion basica a bordo del dispositivo.
- Preprocesado en pipelines ligeros: generacion de transcripciones aproximadas que luego se refinan o se indexan en busquedas locales dentro del telefono.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de WER (word error rate), latencia ni throughput para esta conversion LiteRT, y el repositorio no aporta evaluaciones propias. Como referencia, el modelo base `openai/whisper-tiny` es la variante de menor precision de la familia Whisper, pero no se dispone aqui de cifras verificadas para citarlas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Para un modelo de aproximadamente 39 M de parametros, el peso en memoria seria del orden de decenas de megabytes (por ejemplo, cerca de 150 MB en fp32 y alrededor de 40 MB en int8), aunque la cuantizacion real de esta conversion no esta documentada.
- GPU recomendadas: por su tamano, no requiere GPU de datacenter; el objetivo declarado es la ejecucion en dispositivos Android (CPU, GPU integrada o NPU del telefono).
- Cabe en GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo (RTX 4090, RTX 3060 e incluso integradas), aunque su destino principal es el movil.
- Opciones de despliegue: LiteRT / TFLite mediante la libreria `litert-lm`; el modelo base Whisper puede desplegarse tambien con Whisper.cpp, faster-whisper, Hugging Face Transformers y ONNX Runtime, entre otros.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros (aprox.) | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| warped-community/whisper-tiny-litert-lm | ~39 M (base whisper-tiny) | Ventanas de audio de 30 s | apache-2.0 | Repositorio en preparacion (0.0 GB, 0 descargas) |
| openai/whisper-tiny | ~39 M | Ventanas de audio de 30 s | apache-2.0 | Publico y estable |
| openai/whisper-base | ~74 M | Ventanas de audio de 30 s | apache-2.0 | Publico y estable |
| openai/whisper-small | ~244 M | Ventanas de audio de 30 s | apache-2.0 | Publico y estable |

La comparativa relevante es dentro de la propia familia Whisper: esta version LiteRT mantiene el tamano de `whisper-tiny` y aporta el empaquetado para Android. Frente a `whisper-base` o `whisper-small`, el tiny es mas ligero pero con menor precision de transcripcion; no se dispone de datos cuantitativos de benchmarks para comparar esta conversion concreta. Alternativas de ASR on-device (por ejemplo Vosk o Moonshine) no se detallan aqui por falta de datos en la informacion proporcionada.

## Limitaciones y advertencias

- Repositorio en estado incipiente: 0.0 GB de tamano, 0 descargas y 0 likes; la model card lo situa en la via "coming-soon", por lo que no debe considerarse listo para produccion.
- Sin informacion de cuantizacion: se desconoce la precision de los pesos LiteRT y, por tanto, el impacto en la calidad de transcripcion.
- Calidad limitada por el modelo base: Whisper tiny es la variante menos precisa de la familia; su WER es notablemente superior al de base, small o medium, especialmente en audio ruidoso o con acentos marcados.
- Riesgo de alucinacion: Whisper tiende a generar texto plausible en segmentos de silencio, ruido o audio de baja calidad; conviene validar la salida en produccion.
- Limite de 30 segundos por ventana: el audio largo debe segmentarse, lo que puede introducir errores en las fronteras.
- Idiomas: la variante tiny rinde peor en idiomas de bajos recursos; la ficha del repositorio no confirma que idiomas estan cubiertos en esta conversion.
- Traduccion limitada: la tarea de traduccion de Whisper traduce al ingles, no a otros idiomas de destino.
- Sin soporte documentado de diarizacion de hablantes ni de marcas de tiempo precisas mas alla del modelo base.
- Licencia apache-2.0: permite uso comercial, pero se recomienda verificar los terminos del modelo base `openai/whisper-tiny` y de la conversion intermedia de `litert-community`.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/warped-community/whisper-tiny-litert-lm
- Modelo base en Hugging Face: https://huggingface.co/openai/whisper-tiny
- Fuente declarada de la conversion: https://huggingface.co/litert-community/whisper-tiny
- Organizacion LiteRT Community: https://huggingface.co/litert-community/models
- Repositorio de OpenAI Whisper (codigo y paper): https://github.com/openai/whisper
- Web de la aplicacion Warped: https://cotizcesar.github.io/warped-website/
- Referencia externa sobre el modelo (Toolify): https://www.toolify.ai/ai-model/litert-community-whisper-tiny
