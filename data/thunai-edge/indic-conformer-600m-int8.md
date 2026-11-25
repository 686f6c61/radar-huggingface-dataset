# Thunai-edge/indic-conformer-600m-int8

## Resumen

IndicConformer 600M multilingual int8 ONNX es una distribucion cuantizada del modelo de reconocimiento automatico del habla (ASR) `ai4bharat/indic-conformer-600m-multilingual` desarrollado por AI4Bharat (IIT Madras). El modelo original es un Conformer multilingue entrenado para transcribir 13 lenguas del subcontinente indio (hindi, tamil, telugu, kannada, malayo, bengali, marati, gujarati, punyabi, urdu, oriya, asamés y nepalí) con cabeceras de salida independientes por idioma.

Esta copia concreta, publicada por Thunai-edge, no entrena ni afina nada: toma la cuantizacion int8 ONNX realizada por `yashwork-byte/indic-conformer-600m-int8-onnx` (que redujo el encoder de 2,4 GB a 0,65 GB) y elimina los artefactos que su aplicacion de escritorio no utiliza (wrappers TorchScript/Python y cabeceras de idiomas no ofrecidos). El resultado es un paquete de 0,7 GB listo para inferencia en CPU con ONNX Runtime.

Su relevancia es practica: permite ejecutar ASR multilingue de calidad para lenguas indias en hardware de consumo sin GPU, con licencia MIT y pesos en formato ONNX int8. La decodificacion combina RNNT (con cabecera propia por idioma) y CTC como respaldo cuando RNNT no produce salida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (encoder convolucional + auto-atencion), con cabeceras RNNT y CTC |
| Parametros totales | 600M (según nombre del modelo base; no se detalla desglose) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR; entrada de audio `(1, 80, T)` con reduccion temporal x8) |
| Tipos de cuantizacion | int8 (encoder ONNX); resto de componentes sin cuantizar segun la model card |
| Idiomas soportados | hi, ta, te, kn, ml, bn, mr, gu, pa, ur, or, as, ne (13 lenguas indias) |
| Licencia | MIT |
| Formato de pesos | ONNX (`encoder.onnx`, `ctc_decoder.onnx`, `rnnt_decoder.onnx`, `joint_*.onnx`) + `vocab.json`, `language_masks.json` |

## Arquitectura y entrenamiento

El modelo base es un Conformer de 600M parametros para ASR multilingue. La arquitectura combina capas convolucionales (que capturan patrones locales en el espectrograma) con mecanismos de auto-atencion (que modelan dependencias de largo alcance en la secuencia de audio). El encoder recibe un espectrograma de 80 bandas Mel con forma `(1, 80, T)` y produce representaciones `(1, 1024, T/8)`, es decir, aplica una reduccion temporal de factor 8.

La decodificacion se realiza mediante dos cabeceras: una red de prediccion y una red conjunta RNNT (con un `joint_post_net_<lang>.onnx` por idioma) y una cabecera CTC compartida de 5633 clases, donde cada idioma ocupa un bloque de 256 tokens y el token blank es el 5632. La aplicacion Thunai Edge usa RNNT con la cabecera del idioma seleccionado y recurre a CTC cuando RNNT no devuelve nada. El preprocesador original (TorchScript) define la ventana y el banco de filtros de 80 bandas que se replican en la app.

No se dispone en la informacion proporcionada de detalles sobre el volumen de datos de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF/DPO (no aplicables habitualmente en ASR). La cuantizacion int8 del encoder la realizo el repositorio intermedio `yashwork-byte/indic-conformer-600m-int8-onnx`; Thunai-edge no modifico los pesos.

## Capacidades

- Reconocimiento automatico del habla (ASR) en 13 lenguas indias: hindi, tamil, telugu, kannada, malayo, bengali, marati, gujarati, punyabi, urdu, oriya, asamés y nepalí.
- Decodificacion RNNT con cabecera especifica por idioma y respaldo CTC cuando RNNT no produce salida.
- Inferencia en CPU mediante ONNX Runtime, sin necesidad de GPU.
- Entrada de audio representada como espectrograma Mel de 80 bandas; salida de tokens con vocabulario por idioma.
- No soporta tool calling, function calling, agentes, vision ni audio generativo: es un modelo puramente discriminativo de voz a texto.
- Capacidades multilingues limitadas a las 13 lenguas indias listadas; no se documenta soporte de code-switching ni de otras lenguas.

## Casos de uso

- Transcripcion de reuniones y notas de voz en lenguas indias en el escritorio: la aplicacion Thunai Edge descarga este paquete y transcribe en local con ONNX Runtime sobre CPU, sin enviar audio a la nube, lo que resulta adecuado por privacidad y por el tamano contenido (0,7 GB).
- Subtitulado de contenido audiovisual regional: el modelo puede generar transcripciones en hindi, tamil o telugu para videos y podcasts, y el formato ONNX facilita integrarlo en pipelines de procesamiento por lotes.
- Atencion al cliente en centros de contacto multilingues: permite transcribir llamadas en cualquiera de las 13 lenguas para su analisis posterior, con la ventaja de ejecutarse en servidores sin GPU dedicada.
- Accesibilidad: conversion de voz a texto para personas con discapacidad auditiva en comunidades de habla india, desplegable en equipos de bajo coste gracias a la cuantizacion int8.
- Investigacion linguistica y creacion de corpus: transcripcion masiva de grabaciones de campo en lenguas con pocos recursos, con la licencia MIT permitiendo su uso en proyectos academicos y comerciales.
- Prototipado rapido en entornos embebidos o edge: el encoder int8 de 0,65 GB y la inferencia CPU permiten desplegar ASR en mini-PC o portatiles sin acelerador, ideal para demos y pruebas de concepto.
- Integracion en aplicaciones de dictado por voz: el modelo puede alimentar interfaces de entrada por voz en lenguas indias dentro de aplicaciones de escritorio, usando la decodificacion RNNT para mayor precision y CTC como red de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en su uso previsto; el modelo esta pensado para CPU con ONNX Runtime. El encoder int8 ocupa aproximadamente 0,65 GB en disco y una cantidad similar en memoria al cargarse.
- GPU recomendadas: no se documentan; al ser ONNX int8 para CPU, no se especifican GPU. Cualquier GPU compatible con ONNX Runtime (por ejemplo, A100, H100, RTX 4090) podria ejecutarlo, pero no hay datos de rendimiento.
- Cabe en GPU de consumo: si, en cualquier GPU con al menos 2-3 GB de memoria libre, aunque el objetivo declarado es CPU.
- Opciones de despliegue: ONNX Runtime (uso documentado por Thunai Edge); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Thunai-edge/indic-conformer-600m-int8 | 600M | audio 80-band Mel, reduccion x8 | 13 lenguas indias | MIT | ONNX int8 |
| ai4bharat/indic-conformer-600m-multilingual (base) | 600M | audio 80-band Mel, reduccion x8 | 13 lenguas indias | MIT | PyTorch/TorchScript |
| yashwork-byte/indic-conformer-600m-int8-onnx (intermedio) | 600M | audio 80-band Mel, reduccion x8 | 13 lenguas indias | MIT | ONNX int8 |
| Whisper large-v3 (referencia generica) | 1550M | audio 80-band Mel, ventana 30 s | ~99 idiomas | MIT | PyTorch, GGUF, ONNX |

La comparativa con Whisper es orientativa: Whisper cubre muchas mas lenguas y es un modelo seq2seq encoder-decoder, mientras que IndicConformer esta especializado en lenguas indias con cabeceras por idioma y decodificacion RNNT/CTC. No se dispone de datos de WER comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en ASR: no genera texto libre, no razona, no escribe codigo ni responde preguntas.
- Cobertura linguistica limitada a 13 lenguas indias; no se documenta soporte de code-switching, acentos no nativos ni otras lenguas.
- La cuantizacion int8 puede degradar ligeramente la precision respecto al modelo original en PyTorch; no se aportan metricas de esa perdida.
- Riesgo de errores de transcripcion en audio con ruido, solapamiento de hablantes o vocabulario tecnico poco representado; no se documentan tasas de error.
- La licencia MIT permite uso comercial, pero el autor aclara que esta copia no implica el respaldo de AI4Bharat ni de IIT Madras.
- Los archivos estan fijados por tamano y SHA-256 en la aplicacion Thunai Edge; renombrar, editar o borrar archivos del repositorio rompe las builds que descargan desde un commit fijo.
- El paquete omite wrappers TorchScript/Python y cabeceras de idiomas no usados por la app; quien necesite esos artefactos debe acudir al repositorio original o al intermedio.
- No se han publicado benchmarks ni datos de latencia/throughput, lo que dificulta estimar su rendimiento en produccion sin pruebas propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Thunai-edge/indic-conformer-600m-int8
- Modelo base: https://huggingface.co/ai4bharat/indic-conformer-600m-multilingual
- Repositorio intermedio (cuantizacion int8 ONNX): https://huggingface.co/yashwork-byte/indic-conformer-600m-int8-onnx
- AI4Bharat: https://ai4bharat.iitm.ac.in/
- README original conservado en el repo: `UPSTREAM-README.md` (dentro del repositorio de Hugging Face)
