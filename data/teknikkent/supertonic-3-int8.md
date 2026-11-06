# teknikkent/supertonic-3-int8

## Resumen

Supertonic 3 int8 es una versión cuantizada a 8 bits del modelo de síntesis de voz Supertone/supertonic-3, publicada por el usuario teknikkent. No se trata de un modelo entrenado desde cero, sino de una conversión del grafo `vector_estimator` del modelo original mediante `onnxruntime.quantization.quantize_dynamic`, con el objetivo de reducir el tamaño total del repositorio de 398 MB a 210 MB y hacer viable la inferencia en el navegador. El caso de uso declarado es la extensión de Chrome LocaDub, que realiza doblaje al turco de vídeos de YouTube en el propio dispositivo.

El modelo mantiene intactos el resto de componentes del pipeline TTS: el codificador de texto (`text_encoder.onnx`), el predictor de duración (`duration_predictor.onnx`), el vocoder (`vocoder.onnx`), el indexador Unicode y los diez estilos de voz (F1–F5 y M1–M5). La frecuencia de muestreo es de 44,1 kHz y los idiomas soportados son turco e inglés. La licencia es OpenRAIL-M de BigScience, heredada del modelo original.

Es relevante ahora porque demuestra una ruta práctica de despliegue de TTS neuronal en entornos con recursos limitados, como extensiones de navegador o aplicaciones de escritorio sin GPU dedicada, manteniendo el mismo contrato de entradas, salidas y estilos de voz que el modelo upstream. No obstante, se trata de un artefacto derivado, sin métricas de calidad publicadas en la model card más allá de una referencia externa a mediciones de WER y prosodia en turco.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline TTS neuronal basado en ONNX (text encoder, duration predictor, vector estimator, vocoder); arquitectura interna del vector estimator no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinamica (QUInt8, per-tensor) sobre pesos MatMul, Gemm y Conv del grafo `vector_estimator` |
| Idiomas soportados | turco (tr), ingles (en) |
| Licencia | OpenRAIL-M (BigScience) |
| Formato de pesos | ONNX (`.onnx`), mas JSON para configuracion, indexador Unicode y estilos de voz |
| Frecuencia de muestreo | 44,1 kHz |
| Estilos de voz | 10 (F1–F5, M1–M5) |
| Tamano del repositorio | 0,2 GB (210 MB) |

## Arquitectura y entrenamiento

El artefacto no incluye entrenamiento propio: es una conversión del checkpoint `3cadd1ee` de Supertone/supertonic-3. El pipeline se compone de cuatro grafos ONNX: un `text_encoder` (36,4 MB), un `duration_predictor` (3,7 MB), un `vector_estimator` (65,4 MB tras cuantizar, frente al original sin cuantizar) y un `vocoder` (101,4 MB). El único grafo modificado es el `vector_estimator`, cuantizado dinámicamente con onnxruntime 1.31.1 y onnx 1.23.2; el resto de ficheros son idénticos al upstream y conservan sus digests SHA-256 originales.

La cuantización dinámica aplica INT8 por tensor a los pesos de las operaciones MatMul, Gemm y Conv, dejando las activaciones en punto flotante y calculando los rangos en tiempo de ejecución. Los grafos cuantizados incluyen una nota `modification_notice` en los metadatos ONNX. No se dispone de información sobre el dataset de entrenamiento original, el número de tokens, ni si hubo RLHF o ajuste por preferencias; esos detalles corresponden al modelo base y no se recogen en esta model card.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto en turco e inglés.
- Salida de audio a 44,1 kHz.
- Diez estilos de voz predefinidos (cinco femeninos y cinco masculinos) seleccionables mediante ficheros JSON de estilo.
- Ejecución en navegador mediante ONNX Runtime Web, sin necesidad de servidor.
- Predicción de duración de fonemas integrada en el pipeline.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un modelo exclusivamente TTS.
- No dispone de modo thinking, visión ni audio de entrada.

## Casos de uso

- Doblaje local de vídeos en el navegador: la extensión LocaDub emplea este modelo para generar pistas de voz en turco a partir de subtítulos, ejecutando la inferencia en el dispositivo del usuario y evitando enviar audio a servidores externos.
- Lectura de artículos y documentación: integrado en una extensión o aplicación de escritorio, permite convertir texto seleccionado en audio con una voz concreta de las diez disponibles, con un coste de descarga de solo 210 MB.
- Accesibilidad para personas con discapacidad visual: un lector de pantalla basado en navegador puede usar el modelo para narrar contenido web en turco o inglés sin depender de servicios cloud.
- Prototipado de asistentes de voz: al ser ONNX puro, se puede integrar en aplicaciones Electron o web para generar respuestas habladas en pruebas de concepto con latencia baja y sin infraestructura de servidor.
- Generación de audiolibros o pódcasts de bajo volumen: el tamaño reducido y la licencia OpenRAIL permiten empaquetar el modelo junto a la aplicación para generar narraciones por lotes en local.
- Investigación en TTS cuantizado: sirve como referencia para medir el impacto de la cuantización dinámica INT8 en calidad de voz, prosodia y velocidad en comparación con el modelo original, usando las mediciones publicadas en el repositorio LocaDub.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a mediciones externas de WER, prosodia y velocidad en navegador para turco en `https://github.com/mhmmd5225/LocaDub/blob/main/docs/TTS-KIYAS.md`, pero no se incluyen cifras en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el pipeline completo ocupa 210 MB en disco, por lo que la huella en memoria es del orden de cientos de MB, apta para ejecución en CPU.
- GPU recomendadas: no se especifican; el caso de uso declarado es inferencia en navegador, típicamente sobre CPU o GPU integrada mediante WebGPU/WebAssembly.
- Compatibilidad con GPU de consumo: previsiblemente sí en cualquier GPU moderna, dado el tamaño del modelo, aunque no hay cifras oficiales de latencia.
- Opciones de despliegue: ONNX Runtime (incluido ONNX Runtime Web), con los grafos `text_encoder`, `duration_predictor`, `vector_estimator.int8` y `vocoder`; los ejemplos oficiales de inferencia están en el repositorio de Supertone.
- Latencia y throughput: no disponibles; la model card solo indica que las mediciones de velocidad en navegador están en el documento TTS-KIYAS del repositorio LocaDub.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| teknikkent/supertonic-3-int8 | no disponible | no disponible | tr, en | OpenRAIL-M | ONNX int8 | Versión cuantizada, 210 MB |
| Supertone/supertonic-3 | no disponible | no disponible | tr, en | OpenRAIL-M | ONNX | Modelo base sin cuantizar, 398 MB |
| Otros TTS ONNX ligeros | no disponible | no disponible | no disponible | no disponible | ONNX | Sin datos en la informacion disponible |

La comparación más directa es con el modelo base, del que este artefacto solo difiere en el grafo `vector_estimator` cuantizado y en el tamaño total. No se dispone de datos de rendimiento comparativo entre ambos en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta turco e inglés; no hay soporte declarado para castellano ni otros idiomas.
- Al ser una cuantización INT8 dinámica, puede producir degradación de calidad en prosodia o naturalidad respecto al modelo original; no se aportan métricas que lo cuantifiquen.
- Riesgo de alucinación no aplica en el sentido de texto, pero sí de artefactos acústicos o pronunciaciones incorrectas en entradas fuera de dominio.
- La licencia OpenRAIL-M restringe usos concretos del anexo A: violación de la ley, daño a menores, generación de información falsa para perjudicar a terceros, suplantación de identidad sin consentimiento (incluidos deepfakes de voz), acoso y difusión de contenido generado sin indicar claramente que es sintético.
- Cualquier redistribución debe incluir la licencia y las restricciones, y obligar a los receptores a cumplirlas.
- El audio generado es sintético y debe identificarse como tal en los productos que lo utilicen.
- El autor declara no estar afiliado ni respaldado por Supertone Inc.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, por lo que no hay validación comunitaria de su funcionamiento.
- El uso previsto es en navegador; no hay garantías publicadas sobre estabilidad en servidores o pipelines de producción de alta concurrencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/teknikkent/supertonic-3-int8
- Modelo base: https://huggingface.co/Supertone/supertonic-3/tree/3cadd1ee6394adea1bd021217a0e650ede09a323
- Repositorio LocaDub: https://github.com/mhmmd5225/LocaDub
- Mediciones TTS en turco (WER, prosodia, velocidad): https://github.com/mhmmd5225/LocaDub/blob/main/docs/TTS-KIYAS.md
- Ejemplos oficiales de inferencia de Supertonic: https://github.com/supertone-inc/supertonic
