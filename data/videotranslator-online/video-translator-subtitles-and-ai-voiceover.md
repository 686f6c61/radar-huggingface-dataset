# VideoTranslator-Online/Video-Translator-Subtitles-and-AI-Voiceover

## Resumen

Video Translator es un servicio alojado (SaaS) de traducción de vídeo que genera subtítulos traducidos y, opcionalmente, una locución sintética (voiceover) que sustituye la pista de audio original. Lo desarrolla VideoTranslator-Online y se distribuye exclusivamente a través de su web, videotranslator.online. No se trata de un modelo de IA descargable: el repositorio de Hugging Face no contiene pesos, checkpoints ni código de inferencia, sino únicamente documentación del servicio externo.

El producto resuelve un problema concreto: obtener una versión en otro idioma de un vídeo hablado (demostraciones de producto, grabaciones de pantalla, clases, conversaciones) sin necesidad de un pipeline propio de ASR, traducción y TTS. La interfaz declara 57 idiomas de destino y 10 voces sintéticas, con detección automática del idioma de origen a partir del audio.

Su relevancia actual es limitada desde el punto de vista técnico: no hay información pública sobre arquitectura, tamaño, contexto ni datos de entrenamiento. Cualquier evaluación debe hacerse como servicio de extremo a extremo (calidad de subtítulos, fidelidad de la traducción, naturalidad de la voz), no como componente integrable en un stack propio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (servicio alojado; no se publica el modelo subyacente) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | detección automática del idioma de origen; 57 idiomas de destino según la interfaz; 10 voces sintéticas |
| Licencia | no disponible |
| Formato de pesos | no disponible (no se distribuyen pesos; salida en MP4, SRT, VTT y TXT) |

Otros datos operativos declarados: entrada en MP4, MOV, WebM, MKV, AVI, MPEG, FLV y M4V; salida de pago a 1080p; subidas de hasta 60 minutos y 10 GB por archivo; vista previa gratuita de hasta 10 segundos a 480p sin marca de agua y con verificación humana.

## Arquitectura y entrenamiento

No se publica información sobre la arquitectura del sistema. La model card describe únicamente el flujo de producto: detección del idioma de origen desde el audio, transcripción, traducción al idioma de destino, revisión editable línea a línea y, opcionalmente, síntesis de voz que reemplaza toda la pista de audio. No se indica si la detección de hablantes, el ASR, la traducción y el TTS son modelos propios, de terceros o una combinación, ni qué técnica de clonación o separación de fuentes se emplea (de hecho, se declara explícitamente que no hay clonación de voz ni separación de música de fondo).

Tampoco hay datos sobre volumen de entrenamiento, composición del dataset, uso de RLHF/DPO ni innovaciones técnicas. La única información verificable es de producto: la detección de hablantes no infiere género y la asignación de una voz no reproduce la identidad ni el estilo de la persona original.

## Capacidades

- Traducción de voz a subtítulos: transcribe el audio y genera subtítulos traducidos al idioma de destino seleccionado.
- Locución sintética opcional: sustituye la pista de audio completa por voz sintética; elimina también música y sonido ambiente originales.
- Detección automática del idioma de origen desde el audio, sin override manual documentado.
- Detección de hablantes en conversaciones, con etiquetas de turno editables y asignación manual de voces.
- Revisión y corrección línea a línea comparando transcripción original y traducción antes de exportar.
- Exportación de MP4, SRT, VTT y transcripciones TXT en idioma original y traducido.
- Vista previa gratuita de hasta 10 segundos a 480p sin marca de agua.
- No traduce texto impreso en la imagen (rótulos, diapositivas, subtítulos incrustados): solo procesa el habla.

## Casos de uso

- Demostraciones de producto multilingües: subir una grabación de pantalla con narración, revisar la traducción de nombres de modelo, cifras y unidades, y exportar MP4 con subtítulos y voiceover para publicar la misma demo en varios mercados.
- Material formativo y clases grabadas: generar subtítulos SRT/VTT traducidos para plataformas de e-learning, manteniendo el audio original en la variante "solo subtítulos".
- Entrevistas y conversaciones a dos voces: activar la detección de hablantes, corregir turnos mal asignados y asignar una voz distinta a cada interlocutor antes de exportar.
- Localización de webinars y charlas técnicas: traducir el audio y producir una versión con locución para audiencias que no dominan el idioma original, con revisión obligatoria de términos técnicos.
- Contenido de marketing para redes: versiones cortas de vídeos promocionales en varios idiomas a partir de un único máster, usando la vista previa gratuita para validar la calidad antes de gastar créditos.
- Documentación interna en vídeo: traducir grabaciones de procesos o formación interna y conservar las transcripciones TXT como referencia escrita junto al vídeo.
- Verificación de cifras y condiciones en diálogos comerciales: el flujo de revisión permite comprobar que cantidades, unidades y condiciones (por ejemplo, cantidad solicitada frente a pedido mínimo) no se intercambian al traducir.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de BLEU, WER, MOS ni comparativas cuantitativas; solo menciona tiempos de procesamiento de ejemplos concretos que el propio autor advierte que no constituyen una garantía de velocidad.

## Requisitos de hardware

- No aplica hardware local: el procesamiento ocurre íntegramente en videotranslator.online y no se puede ejecutar el modelo en Hugging Face Inference Providers ni descargarlo.
- No hay requisitos de VRAM ni GPU recomendadas porque no se distribuyen pesos.
- No cabe en GPU de consumo: no existe versión ejecutable local.
- Opciones de despliegue: únicamente el servicio web del proveedor; no hay soporte para vLLM, llama.cpp, Ollama, TGI ni formatos GGUF/safetensors.
- Latencia y throughput: no disponibles como garantía; los tiempos publicados corresponden a ejecuciones puntuales de los ejemplos.

## Comparativa con modelos similares

| Producto | Tipo | Idiomas | Entrada máxima | Salida | Precio de referencia | Licencia |
|---|---|---|---|---|---|---|
| Video Translator (VideoTranslator-Online) | Servicio alojado de subtitulado y doblaje | 57 destinos, detección automática de origen | 60 min / 10 GB | MP4 1080p, SRT, VTT, TXT | desde 9,90 USD/mes; 1 crédito por segundo de origen | no disponible |
| Whisper (OpenAI) | Modelo ASR open source | multilingüe (transcripción) | según implementación | texto/SRT | gratuito | MIT (según versión) |
| Modelos TTS open source (p. ej. familias tipo XTTS, Bark) | Modelo TTS | variable según modelo | fragmentos de audio | WAV | variable (a menudo no comercial) | variable |

La comparación es estructural: Video Translator integra ASR, traducción y TTS en un solo flujo gestionado, mientras que las alternativas open source requieren orquestar componentes por separado y no ofrecen detección de hablantes ni revisión integrada de subtítulos. No hay datos públicos de calidad que permitan comparar fidelidad de traducción o naturalidad de voz.

## Limitaciones y advertencias

- No es un modelo: no hay pesos, checkpoints ni código; no se puede integrar en pipelines propios ni desplegar on-premise.
- No traduce texto visible en la imagen; los subtítulos incrustados pueden solaparse con los generados.
- El idioma de origen se detecta automáticamente y no hay override manual documentado, lo que es arriesgado con audio mixto o poco claro.
- La opción de voiceover reemplaza toda la pista de audio, incluida música y sonido ambiente; no hay separación de fuentes ni clonación de voz.
- La detección de hablantes no infiere género y la voz asignada no reproduce la identidad ni el estilo de la persona original.
- Riesgo de errores en cifras, unidades, nombres y condiciones en la traducción: la model card recomienda revisión manual explícita antes de exportar.
- Retención limitada: los archivos fuente caducan a las 24 horas y los resultados de pago están disponibles 7 días desde la creación de la tarea; no debe usarse como almacenamiento.
- Coste por uso: un crédito por segundo de origen y por idioma de destino; un vídeo de 10 minutos consume 600 créditos y cada idioma adicional es otra conversión.
- Licencia no disponible: no se puede confirmar el régimen de uso comercial del servicio ni de los materiales generados más allá de lo que indique la web del proveedor.
- Sin datos públicos de arquitectura, entrenamiento o benchmarks: imposible evaluar sesgos, alucinación o calidad de forma independiente.
- Precios, límites y disponibilidad pueden cambiar; la información de la model card fue verificada por el autor el 9 de noviembre de 2026.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/VideoTranslator-Online/Video-Translator-Subtitles-and-AI-Voiceover
- Servicio: https://videotranslator.online/
- Ejemplos de traducción: https://videotranslator.online/examples
- Vista previa gratuita: https://videotranslator.online/video-translator-free
- Precios: https://videotranslator.online/pricing
