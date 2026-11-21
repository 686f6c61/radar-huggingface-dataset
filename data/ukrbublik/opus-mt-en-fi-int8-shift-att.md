# ukrbublik/opus-mt-en-fi-int8-shift-att

## Resumen

OPUS-MT en→fi INT8 Shift-Att es una conversión a ONNX con cuantización INT8 del modelo de traducción automática Helsinki-NLP/opus-mt-en-fi, desarrollado originalmente por el grupo de investigación en tecnología del lenguaje de la Universidad de Helsinki (OPUS-MT, Jörg Tiedemann et al.). El repositorio, publicado por el usuario ukrbublik, no reentrena ni modifica los pesos: solo cambia el formato de los ficheros para permitir la inferencia en dispositivo dentro de la aplicación Android Subtitle Tap. La traducción es directa de inglés a finés, sin pivote a través de otra lengua.

El modelo base emplea la arquitectura Marian, una familia de transformers encoder-decoder diseñada específicamente para traducción automática neuronal y entrenada sobre corpus del proyecto OPUS. Esta variante exporta el encoder y el decoder como grafos ONNX (opset 17, sin past key/values) y aplica cuantización dinámica INT8 de onnxruntime con tipo QInt8 y granularidad per-tensor.

La particularidad técnica del repositorio es que el decoder emite además una salida adicional, `alignment_shift_l2`, con las probabilidades de atención encoder del nivel 2. Se trata de una identidad sobre un nodo ya existente, por lo que los pesos y el proceso de decodificación no varían; el objetivo es exponer información de alineación útil para subtitulado. El paquete incluye un tokenizador en JSON derivado del modelo SentencePiece original y un fichero de recibo que vincula la salida de alineación con el hash SHA-256 del decoder.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder para traduccion) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinamica (QInt8, per-tensor) via onnxruntime |
| Idiomas soportados | ingles (en), fines (fi) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`) |

## Arquitectura y entrenamiento

El modelo base Helsinki-NLP/opus-mt-en-fi es un transformer encoder-decoder de la familia Marian, orientado a traducción automática neuronal. Fue entrenado por el grupo OPUS-MT sobre datos del corpus OPUS, una colección de corpus paralelos multilingües de dominio público. No se dispone en la información proporcionada del número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO; estos detalles corresponden al modelo original y no se documentan en esta conversión.

La innovación de este repositorio es puramente de formato y despliegue: exportación a ONNX con opset 17 sin past key/values, cuantización dinámica INT8 per-tensor y la exposición de una salida de alineación (`alignment_shift_l2`) mediante una operación Identity sobre el nodo de atención del nivel 2 del decoder. Esta salida permite obtener probabilidades de atención encoder por token generado, útil para alinear texto origen y destino en tareas de subtitulado, sin alterar los pesos ni la lógica de decodificación.

## Capacidades

- Traducción automática directa de inglés a finés, sin pivote intermedio.
- Exposición de probabilidades de atención encoder del nivel 2 (`alignment_shift_l2`) para alineación entre tokens origen y destino.
- Tokenizador SentencePiece empaquetado en JSON (`tokenizer_runtime.json`) con piezas, puntuaciones y mapeo a identificadores de vocabulario.
- Inferencia en dispositivo mediante onnxruntime, orientada a entornos móviles y sin dependencia de servidor.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Subtitulado automático en dispositivos Android: la app Subtitle Tap usa el modelo para traducir subtítulos de inglés a finés en local, sin enviar texto a un servidor, gracias al grafo ONNX cuantizado y a la salida de alineación para sincronizar texto origen y destino.
- Traducción de documentación técnica en inglés a finés en pipelines offline: el modelo puede integrarse en scripts de preprocesado que traduzcan ficheros de documentación por lotes usando onnxruntime, sin necesidad de GPU.
- Alineación de corpus bilingües en→fi: la salida `alignment_shift_l2` permite construir pares de tokens alineados para tareas de anotación, evaluación o entrenamiento de modelos auxiliares.
- Traducción de interfaces y cadenas de aplicación: por su tamaño reducido (repo de 0,1 GB) y su licencia Apache 2.0, es adecuado para traducir recursos de localización de aplicaciones móviles.
- Procesamiento de subtítulos en tiempo real en entornos con conectividad limitada: al ejecutarse en dispositivo con cuantización INT8, reduce el consumo de memoria y evita la latencia de red.
- Evaluación comparativa de cuantización: sirve como referencia para medir la pérdida de calidad de traducción entre el modelo original y la versión INT8 ONNX en un par de lenguas concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el repositorio ocupa 0,1 GB, por lo que la huella en memoria es reducida y compatible con entornos móviles.
- GPU recomendadas: no se especifican; al ser un modelo pequeño y cuantizado, puede ejecutarse en CPU sin GPU dedicada.
- Compatibilidad con GPU de consumo: previsiblemente sí en cualquier GPU moderna con soporte onnxruntime (por ejemplo, RTX 4090, RTX 3060), aunque no se documentan cifras concretas.
- Opciones de despliegue: onnxruntime (entorno principal documentado); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son compatibles con este formato de exportación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| ukrbublik/opus-mt-en-fi-int8-shift-att | no disponible | no disponible | en, fi | Apache 2.0 | ONNX INT8 |
| Helsinki-NLP/opus-mt-en-fi | no disponible | no disponible | en, fi | Apache 2.0 | safetensors / PyTorch |
| Otros modelos OPUS-MT en→fi | no disponible | no disponible | en, fi | Apache 2.0 | variable |

La comparación directa con el modelo base es la más relevante: esta variante cambia el formato a ONNX INT8 y añade la salida de alineación, manteniendo pesos y licencia. No se dispone de datos de rendimiento para comparar la calidad de traducción entre ambas versiones.

## Limitaciones y advertencias

- Solo traduce de inglés a finés; no cubre otras direcciones ni otros pares de lenguas.
- La cuantización INT8 puede introducir una degradación de calidad respecto al modelo original en float32; no se documenta la magnitud de esa pérdida.
- No se han publicado evaluaciones de sesgo, alucinación ni robustez para esta conversión.
- El modelo base está entrenado sobre corpus OPUS, por lo que puede reflejar sesgos presentes en esos datos y tener cobertura desigual según el dominio.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda conservar la atribución al grupo OPUS-MT de la Universidad de Helsinki y citar el trabajo de Tiedemann y Thottingal (2020).
- El formato ONNX sin past key/values implica recálculo del decoder en cada paso; puede afectar a la latencia en secuencias largas.
- No se garantiza compatibilidad con frameworks distintos de onnxruntime.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ukrbublik/opus-mt-en-fi-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-en-fi
- Referencia OPUS-MT: Tiedemann, J. and Thottingal, S. (2020). OPUS-MT — Building open translation services for the World. EAMT 2020.
