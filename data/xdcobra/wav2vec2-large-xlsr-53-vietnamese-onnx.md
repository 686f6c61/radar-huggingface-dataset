# XDcobra/wav2vec2-large-xlsr-53-vietnamese-ONNX

## Resumen

wav2vec2-large-xlsr-53-vietnamese-ONNX es una exportacion a formato ONNX del checkpoint `not-tanh/wav2vec2-large-xlsr-53-vietnamese`, un modelo de reconocimiento automatico del habla (ASR) basado en la arquitectura wav2vec2-large XLSR-53 y especializado en vietnamita. Lo publica el desarrollador XDcobra como artefacto listo para inferencia en dispositivos, orientado a alineamiento forzado (forced alignment) por CTC de caracteres y a transcripcion ASR. El modelo original parte de un preentrenamiento multilingue XLSR-53 (53 idiomas) y se afina para vietnamita, con una salida CTC a nivel de caracter.

La relevancia de esta ficha no esta en el modelo en si, sino en el empaquetado: se distribuyen pesos en fp32, fp16 e int8 (cuantizacion dinamica QUInt8) en un unico repositorio de 2,2 GB, junto con el vocabulario CTC y la configuracion de Transformers. Estos artefactos estan preparados para el SDK movil `react-native-sherpa-onnx`, que ofrece herramientas de voz offline para React Native, Android e iOS, e incluye los paquetes de alineamiento forzado que consume la aplicacion VoiceLab.

Se trata, por tanto, de un modelo de tamano grande (wav2vec2-large, en el orden de cientos de millones de parametros) con licencia Apache 2.0, pensado para ejecucion offline en movil mediante ONNX Runtime. No es un modelo generativo ni de chat: su unica funcion es convertir audio PCM mono a 16 kHz en transcripciones o alineamientos temporales a nivel de caracter. La informacion publica no detalla el numero exacto de parametros ni resultados de benchmarks, por lo que esos datos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2-large XLSR-53 (transformer convolucional + encoder Transformer, cabeza CTC) |
| Parametros totales | no disponible (familia wav2vec2-large; cifra exacta no publicada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio dependiente de la implementacion; muestreo a 16 kHz) |
| Tipos de cuantizacion | fp32, fp16 e int8 (cuantizacion dinamica QUInt8 de pesos) |
| Idiomas soportados | vietnamita (vi) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`onnx/model.onnx`, `onnx/model_fp16.onnx`, `onnx/model_int8.onnx`) + `vocab.json` + `config.json` |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura wav2vec2-large XLSR-53: un extractor de caracteristicas convolucional que procesa la forma de onda cruda a 16 kHz, seguido de un encoder Transformer y una cabeza de clasificacion CTC. La variante XLSR-53 se preentreno de forma autosupervisada sobre audio de 53 idiomas, lo que proporciona representaciones acusticas multilingues; posteriormente el checkpoint `not-tanh/wav2vec2-large-xlsr-53-vietnamese` se afino para vietnamita con una salida CTC a nivel de caracter (char-CTC), tal como indica la model card.

No se detallan en la informacion disponible el numero de horas de audio de entrenamiento, la composicion del dataset de afinamiento, ni si se aplicaron tecnicas de RLHF o DPO (no procede en un modelo ASR). La innovacion tecnica relevante de esta publicacion es el proceso de exportacion: se uso `optimum-cli export onnx` seguido de cuantizacion dinamica con `onnxruntime` (script `export_hf_onnx_pack.py` del repositorio del SDK), generando tres variantes de precision. El objetivo es la inferencia offline en dispositivos moviles y el alineamiento forzado por CTC, con entrada de audio PCM mono a 16 kHz.

## Capacidades

- Reconocimiento automatico del habla (ASR) en vietnamita a partir de audio PCM mono a 16 kHz.
- Alineamiento forzado (forced alignment) por CTC a nivel de caracter, util para obtener marcas temporales de fonemas o caracteres sobre una transcripcion conocida.
- Salida CTC con vocabulario de caracteres (`vocab.json`), adecuada para decodificacion greedy o beam search.
- Ejecucion en dispositivo (on-device) mediante ONNX Runtime, sin dependencia de red.
- Tres variantes de precision (fp32, fp16, int8) para ajustar el equilibrio entre calidad y consumo de recursos.
- Integracion con el SDK `react-native-sherpa-onnx` para React Native, Android e iOS.
- No soporta tool calling, agentes, razonamiento multi-paso, vision ni audio generativo; es un modelo puramente discriminativo de ASR/alineamiento.

## Casos de uso

- Transcripcion offline en aplicaciones moviles: el modelo puede integrarse en apps React Native, Android o iOS a traves de `react-native-sherpa-onnx` para dictado o notas de voz sin conexion, usando la variante int8 en dispositivos con recursos limitados.
- Alineamiento forzado de subtitulos: dado un audio vietnamita y su transcripcion, el modelo produce marcas temporales por caracter que permiten sincronizar subtitulos o karaoke con precision a nivel de caracter.
- Herramientas de aprendizaje de idiomas: en apps como VoiceLab, el alineamiento permite comparar la pronunciacion del usuario con la referencia y resaltar desviaciones a nivel de caracter.
- Post-procesado de pipelines ASR: como etapa de alineamiento sobre transcripciones generadas por otro motor, para obtener timestamps fiables en la produccion de subtitulos o indices de busqueda sobre audio.
- Procesamiento por lotes en servidor: la variante fp32 puede ejecutarse con ONNX Runtime en servidores para transcribir archivos de audio vietnamitas en pipelines de archivado o analitica.
- Prototipado rapido en entornos sin GPU: la cuantizacion int8 permite ejecutar el modelo en CPU con un consumo de memoria reducido, adecuado para pruebas y demos.
- Integracion en dispositivos de borde (edge): al ser ONNX y con variantes ligeras, puede desplegarse en hardware embebido con ONNX Runtime para transcripcion local en vietnamita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el repositorio completo ocupa 2,2 GB; la variante fp32 requiere en torno a ese orden de memoria, la fp16 aproximadamente la mitad y la int8 una fraccion adicional menor (cifras exactas no publicadas).
- GPU recomendadas: no se especifican; al ser un modelo de ASR de tamano grande, una GPU consumer moderna (por ejemplo, RTX 3090 o RTX 4090) o una A100/H100 permitirian inferencia rapida, aunque el objetivo declarado es la ejecucion en dispositivo.
- Cabe en GPU consumer: si, en tarjetas con suficiente memoria para la variante elegida; la variante int8 esta pensada para CPU y movil.
- Opciones de despliegue: ONNX Runtime (principal), con integracion en `react-native-sherpa-onnx`; no se documentan despliegues con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| XDcobra/wav2vec2-large-xlsr-53-vietnamese-ONNX | no disponible (familia wav2vec2-large) | no disponible | no publicado | Apache 2.0 | Hugging Face (ONNX) |
| not-tanh/wav2vec2-large-xlsr-53-vietnamese | no disponible (familia wav2vec2-large) | no disponible | no disponible | Apache 2.0 | Hugging Face (checkpoint original) |
| Alternativas ASR vietnamita de la familia wav2vec2 | no disponible | no disponible | no disponible | variable | no disponible |

No se dispone de datos de benchmarks ni de comparativas cuantitativas con otros modelos ASR en vietnamita dentro de la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta vietnamita; no es multilingue en su uso afinado, aunque el preentrenamiento XLSR-53 sea multilingue.
- Es un modelo discriminativo de ASR/alineamiento: no genera texto libre, no razona y no soporta instrucciones.
- Riesgo de errores de transcripcion en audio con ruido, acentos no representados en el dataset de entrenamiento o solapamiento de hablantes; no se documentan tasas de error (WER/CER).
- No se detalla la composicion del dataset de afinamiento, por lo que se desconocen sesgos acusticos, dialectales o de genero.
- Requiere audio PCM mono a 16 kHz; otras frecuencias o formatos exigen remuestreo previo.
- La licencia Apache 2.0 permite uso comercial, pero el autor remite a verificar que la licencia del modelo base lo permita; conviene revisar el checkpoint original.
- La variante int8 puede degradar la precision del alineamiento o de la transcripcion respecto a fp32; no se publican metricas de dicha degradacion.
- No se han publicado resultados de benchmarks, por lo que no es posible validar su calidad frente a alternativas.

## Enlaces

- Hugging Face: https://huggingface.co/XDcobra/wav2vec2-large-xlsr-53-vietnamese-ONNX
- Modelo base: https://huggingface.co/not-tanh/wav2vec2-large-xlsr-53-vietnamese
- SDK react-native-sherpa-onnx: https://github.com/XDcobra/react-native-sherpa-onnx
- Script de exportacion: https://github.com/XDcobra/react-native-sherpa-onnx/blob/main/scripts/alignment-models/export_hf_onnx_pack.py
- VoiceLab en Google Play: https://play.google.com/store/apps/details?id=com.xdcobra.voicelab
- VoiceLab en App Store: https://apps.apple.com/us/app/voice-lab-stt-tts-more/id6761100598
- Pagina de producto VoiceLab: https://xdcobra.github.io/voice-lab-offline-tools/
