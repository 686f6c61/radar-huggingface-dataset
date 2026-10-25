# thuongvv/Supertonic-3-VectorEstimator-CoreML-W8

## Resumen

Supertonic-3-VectorEstimator-CoreML-W8 es la conversión a Core ML del estimador de vectores (vector estimator) del modelo de síntesis de voz Supertonic 3 de Supertone Inc., empaquetada como un modelo Core ML compilado de tipo ML Program que se ejecuta en el Neural Engine de Apple. No es una release oficial: lo publica el usuario thuongvv a partir del commit `3cadd1ee` de `Supertone/supertonic-3` (fichero `onnx/vector_estimator.onnx`) con el script `make_coreml_vector_estimator.py`, incluido en el propio repositorio. Ocupa 65 MB en disco y forma parte de la cadena de TTS que la aplicación iOS Quotica descarga para leer libros en voz alta en el dispositivo.

El modelo no genera audio por sí solo: es la etapa que refina los latentes ruidosos a lo largo de un número fijo de pasos (`current_step`/`total_step`), y necesita un codificador de texto y un predictor de duración (en este caso los de `soniqo/Supertonic-3-ONNX-INT8`) y un vocoder (`thuongvv/Supertonic-3-Vocoder-ONNX-W8`), ambos ejecutados en CPU con ONNX Runtime. Su interés práctico está en la eficiencia: frente a la variante int8 en CPU, el autor mide 155 MB de memoria cargada y una compilación en dispositivo de unos 5 s por función, lo que lo hace viable para TTS completamente offline en iPhone.

La pieza es un modelo multifunción con tres longitudes fijas de latente (64, 160 y 416 frames) que cubren hasta 4,5 s, 11 s y 29 s de audio respectivamente, con pesos compartidos cuantizados a int8 simétrico por canal y cómputo en float16. El autor reporta una desviación del 4 % en RMS relativo respecto al grafo float32 original sobre 8 pasos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible con detalle; es el estimador de vectores de Supertonic 3 (etapa iterativa sobre latentes ruidosos con contador de pasos), convertido a Core ML ML Program multifunción. Cómputo en float16 con pesos int8 |
| Parámetros totales | No disponible |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (TTS). Límites por función: 64 frames latentes / 96 code points de texto / 4,5 s de audio; 160 / 224 / 11 s (por defecto); 416 / 320 / 29 s |
| Tipos de cuantización | int8 simétrico por canal sobre los pesos (weight-only); activaciones y cómputo en float16 |
| Idiomas soportados | No disponible |
| Licencia | BigScience OpenRAIL-M (hereda las restricciones de uso del Attachment A del modelo de Supertone) |
| Formato de pesos | `.mlmodelc` compilado (Core ML), 65 MB; repositorio de 0,1 GB |

Datos adicionales: pipeline `text-to-speech`, librería `coreml`, modelo base `Supertone/supertonic-3`, autor `thuongvv`, 0 descargas y 0 likes en el momento de la consulta, creado el 2026-10-25. Entradas en float32: `text_emb`, `text_mask`, `noisy_latent`, `latent_mask`, `current_step`, `total_step`; el padding debe ser cero en las máscaras. Requiere iOS 18 o posterior para usar `MLModelConfiguration.functionName`.

## Arquitectura y entrenamiento

La model card no documenta la arquitectura interna ni el entrenamiento: no hay número de tokens, composición del dataset ni mención de RLHF/DPO. Lo que sí se describe es el proceso de conversión, en cinco pasos: (1) fijar el grafo a cada longitud y plegar la aritmética de formas con ONNX Runtime; (2) reescribir los operadores que Core ML no soporta (Pad en los bordes como Gather, los Where de las máscaras de atención como Mul y Add, Tile como Concat); (3) convertir a PyTorch con onnx2torch, trazar y convertir a ML Program en float16 con coremltools 9; (4) cuantizar los pesos a int8 simétrico por canal; (5) fusionar las tres funciones en un único modelo multifunción y compilarlo. Las tres funciones comparten pesos, que se almacenan una sola vez.

El resultado es un modelo que replica el grafo float32 de Supertone con una desviación del 4 % en RMS relativo sobre 8 pasos, diferencia que el autor describe como perceptivamente equivalente ("se oye la misma voz"). Un detalle técnico relevante para la integración: rellenar el texto con padding no altera la salida, mientras que rellenar el latente desplaza la salida tanto como otro ruido inicial, aunque se percibe como la misma voz. No se documentan innovaciones como decodificación especulativa ni atención lineal.

## Capacidades

- Estimación de vectores para TTS: transforma latentes ruidosos en latentes limpios a lo largo de un número configurable de pasos (`current_step`/`total_step`), en tres resoluciones fijas de 64, 160 y 416 frames.
- Síntesis de fragmentos de hasta 29 s de audio por pasada con la función `length416`, 11 s con `length160` (por defecto) y 4,5 s con `length64`.
- Ejecución en el Neural Engine de Apple, con 155 MB de memoria cargada y unos 400 MB de pico según el autor.
- Funcionamiento completamente offline en dispositivo: no requiere red ni servicios en la nube.
- Tres funciones con pesos compartidos dentro de un único `.mlmodelc`, seleccionables mediante `functionName`.
- No incluye tool calling, function calling, capacidades de agente, razonamiento multietapa, visión, audio de entrada ni modo thinking. La generación de voz depende de componentes externos (codificador de texto, predictor de duración y vocoder).
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Lector de libros en iOS sin conexión: es el caso real de Quotica; la app trocea el texto en fragmentos que quepan en 96, 224 o 320 code points y ejecuta el estimador en el Neural Engine mientras el codificador, el predictor de duración y el vocoder corren en CPU con ONNX Runtime.
- Audiolibros y artículos con privacidad estricta: al no salir el texto del dispositivo, encaja en aplicaciones de lectura de documentos sensibles (informes médicos, legales) donde no se admite enviar contenido a una API de TTS.
- Accesibilidad para personas con discapacidad visual: integración en lectores de pantalla y apps de lectura asistida que necesitan latencia baja y consumo contenido en sesiones largas, apoyándose en los 155 MB cargados y la compilación única de ~5 s por función.
- Avisos de navegación y notificaciones habladas: instrucciones cortas que caben de sobra en `length64` (hasta 4,5 s), con generación local para evitar dependencia de conectividad en el vehículo.
- Aprendizaje de idiomas y práctica de pronunciación: reproducción repetida de frases cortas en el dispositivo; requiere validar previamente los idiomas soportados, dato no disponible en la ficha.
- Dispositivos empotrados Apple y kioscos sin conectividad (terminales de punto de venta, paneles informativos) que necesiten locuciones pregrabadas dinámicamente sin infraestructura de servidor.
- Previsualización de TTS en apps de edición o de doblaje: generar clips de menos de 29 s en el dispositivo para revisar prosodia antes de lanzar el renderizado definitivo en servidor.
- Pipeline de lectura por lotes en segundo plano: al compartir pesos las tres funciones, se puede elegir la resolución mínima suficiente para cada fragmento y reducir el coste de cómputo en textos con muchas frases cortas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, MOS, WER) en la información disponible. El autor sí publica métricas de fidelidad y velocidad:

| Métrica | Valor | Contexto |
|---|---|---|
| Desviación respecto al grafo float32 | 4 % (RMS relativo) | 8 pasos, según el autor |
| Memoria cargada | 155 MB (~400 MB de pico) | iPhone 15 Pro |
| Memoria del estimador int8 en CPU (referencia) | 245 MB | soniqo/Supertonic-3-ONNX-INT8 |
| Tiempo de carga | ~0,4 s | iPhone 15 Pro |
| Compilación en dispositivo | ~5 s por función | Solo la primera vez en cada dispositivo |
| Métrica de velocidad, este modelo en Neural Engine | 0,05 s | El encabezado de la tabla dice "speech made per second of compute"; los valores son coherentes con segundos de cómputo por segundo de audio |
| Métrica de velocidad, estimador int8 en CPU | 0,56 s en frío; 0,80–0,98 s en caliente | Misma unidad que la fila anterior |

No hay datos de calidad subjetiva (MOS), latencia extremo a extremo del pipeline completo ni comparación con modelos TTS comerciales.

## Requisitos de hardware

- VRAM: no aplica; el modelo se ejecuta en el Neural Engine con memoria unificada. El autor mide 155 MB cargados y ~400 MB de pico en un iPhone 15 Pro.
- Hardware imprescindible: SoC Apple con Neural Engine y iOS 18 o posterior, por el uso de `MLModel(contentsOf:)` con `MLModelConfiguration.functionName`.
- GPU dedicadas (A100, H100, RTX 4090): no soportadas; el artefacto es un `.mlmodelc` para Core ML, no un grafo para CUDA o ROCm.
- Cabe en hardware de consumo Apple: sí, en iPhone y iPad compatibles con iOS 18; el modelo pesa 65 MB y el repositorio completo 0,1 GB.
- Opciones de despliegue: Core ML para el estimador; el resto de la cadena (codificador de texto y predictor de duración de `soniqo/Supertonic-3-ONNX-INT8`, vocoder de `thuongvv/Supertonic-3-Vocoder-ONNX-W8`) con ONNX Runtime en CPU. No hay soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: carga en ~0,4 s y compilación inicial de ~5 s por función. El autor tabula 0,05 s de cómputo por segundo de audio para esta variante frente a 0,56 s en frío y 0,80–0,98 s en caliente del estimador int8 en CPU; no se desglosa por función ni se da el tiempo por paso.

## Comparativa con modelos similares

| Modelo | Componente | Cuantización | Hardware | Memoria | Desviación vs float32 | Licencia |
|---|---|---|---|---|---|---|
| thuongvv/Supertonic-3-VectorEstimator-CoreML-W8 | Estimador de vectores | int8 simétrico por canal, cómputo float16 | Neural Engine (iOS 18+) | 155 MB cargados, ~400 MB pico | 4 % RMS relativo (8 pasos) | OpenRAIL-M |
| soniqo/Supertonic-3-ONNX-INT8 | Codificador de texto y predictor de duración (y estimador int8 en CPU) | int8 | CPU con ONNX Runtime | 245 MB | No disponible | No disponible |
| Supertone/supertonic-3 | Modelo TTS completo original (referencia float32) | float32 | No disponible | No disponible | Referencia | OpenRAIL-M |
| thuongvv/Supertonic-3-Vocoder-ONNX-W8 | Vocoder | int8 weight-only | CPU con ONNX Runtime | No disponible | No disponible | No disponible |

No se dispone de comparación con modelos TTS de otros proveedores (por ejemplo, familias comerciales de síntesis de voz) en la información proporcionada, ni de métricas comunes que permitan un enfrentamiento directo.

## Limitaciones y advertencias

- No es un modelo TTS autónomo: sin codificador de texto, predictor de duración y vocoder no produce audio; la calidad final depende de los tres componentes y de cómo se encadenen.
- Longitudes fijas y discretas: solo 96, 224 o 320 code points de texto. Textos más largos deben trocearse, con riesgo de discontinuidades de prosodia en las uniones entre fragmentos.
- Techo de 29 s de audio por pasada (`length416`); no está pensado para síntesis de larga duración en una sola llamada.
- Desviación del 4 % en RMS relativo respecto a float32 sobre 8 pasos; puede acumularse o percibirse de forma distinta en pasadas largas o en voces concretas, algo que la model card no evalúa.
- Sin datos de idiomas soportados, de MOS ni de WER: no es posible evaluar la calidad percibida ni la cobertura lingüística con la información disponible.
- Publicación no oficial de Supertone: el soporte y el mantenimiento dependen de thuongvv; el modelo se generó a partir de un commit concreto (`3cadd1ee`) y no se garantiza paridad con versiones posteriores del modelo base.
- Dependencia de la cadena de herramientas: coremltools 9, onnx2torch y ONNX Runtime para reproducir la conversión; el script `make_coreml_vector_estimator.py` está en el repositorio.
- Licencia OpenRAIL-M: permite uso comercial, pero obliga a propagar las restricciones de uso del Attachment A a cualquier aplicación o redistribución. Es imprescindible revisar el texto de `LICENSE` antes de publicar; la información disponible no detalla el listado completo de restricciones.
- Riesgo de uso indebido para suplantación de voz o desinformación: las restricciones de OpenRAIL cubren parte de estos supuestos, pero no se menciona ningún mecanismo de marca de agua ni de verificación de consentimiento del hablante.
- Sesgos: no documentados. Al no publicarse la composición del dataset de entrenamiento, no se pueden evaluar sesgos de acento, género o registro.
- El riesgo de alucinación propio de un LLM no aplica; el fallo típico esperable es de pronunciación o de artefactos acústicos, sin datos publicados al respecto.
- Métrica de velocidad ambigua: el encabezado de la tabla del autor ("speech made per second of compute") no encaja con los valores, que apuntan a segundos de cómputo por segundo de audio. Conviene medir el rendimiento en el dispositivo objetivo antes de dimensionar una app.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thuongvv/Supertonic-3-VectorEstimator-CoreML-W8
- Modelo base: https://huggingface.co/Supertone/supertonic-3
- Codificador de texto y predictor de duración int8 (soniqo): https://huggingface.co/soniqo/Supertonic-3-ONNX-INT8
- Vocoder int8 weight-only: https://huggingface.co/thuongvv/Supertonic-3-Vocoder-ONNX-W8
