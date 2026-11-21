# ukrbublik/opus-mt-en-bg-int8-shift-att

## Resumen

Este repositorio contiene una conversión a ONNX con cuantización INT8 del modelo de traducción automática Helsinki-NLP/opus-mt-en-bg, desarrollado originalmente por el grupo Language Technology Research Group de la Universidad de Helsinki dentro del proyecto OPUS-MT. El autor de la conversión es ukrbublik, y el artefacto está pensado específicamente para el runtime OPUS embarcado en la aplicación Android Subtitle Tap, donde se ejecuta inferencia en dispositivo (on-device) sin depender de servicios externos. La dirección de traducción es inglés a búlgaro, en un único salto directo, sin pivotar por inglés.

El modelo base es un transformer encoder-decoder de arquitectura Marian, el mismo que emplea la familia OPUS-MT, entrenado sobre corpus paralelos de OPUS. Esta variante no modifica pesos ni decodificación: solo cambia el formato (export ONNX, opset 17, sin past key/values) y aplica cuantización dinámica INT8 por tensor con onnxruntime (tipo QInt8). El tamaño del repositorio es de 0,1 GB, lo que refleja el reducido número de parámetros típico de los modelos OPUS-MT base.

La particularidad técnica de esta conversión es que el decodificador expone una salida adicional, `alignment_shift_l2`, con las probabilidades de atención encoder-decoder de la capa 2. Esta salida es una identidad de un nodo ya existente, por lo que no altera pesos ni resultados de traducción, pero permite obtener alineamientos a nivel de token útiles para tareas como subtitulado o sincronización. El modelo está publicado bajo licencia Apache 2.0, igual que el modelo original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian) |
| Parámetros totales | no disponible (repo de 0,1 GB; familia OPUS-MT base) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | INT8 dinámica (QInt8, per-tensor) vía onnnxruntime; export ONNX opset 17 |
| Idiomas soportados | inglés (en) y búlgaro (bg) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnxx`, `decoder_model_quantized.onnxx`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Marian, un transformer encoder-decoder estándar para traducción automática neuronal. El modelo original Helsinki-NLP/opus-mt-en-bg fue entrenado por el grupo de la Universidad de Helsinki sobre datos paralelos de OPUS, siguiendo la metodología descrita en Tiedemann y Thottingal (2020). No se dispone de detalles sobre número de tokens de entrenamiento, composición exacta del dataset ni si se aplicó RLHF o DPO; esa información no está disponible en la documentación proporcionada.

La conversión realizada por ukrbublik aplica una exportación con optimum (opset 17, sin past key/values) y cuantización dinámica INT8 por tensor con onnnxruntime. El decodificador incorpora una salida adicional `alignment_shift_l2` (identidad de un nodo existente) que expone las probabilidades de atención encoder-decoder de la capa 2, sin modificar los pesos ni la decodificación. El tokenizer se empaqueta como `tokenizer_runtime.json`, que mapea las piezas y puntuaciones del modelo SentencePiece original a identificadores de vocabulario y cadenas de tokens destino. Como el modelo base es multi-target, el tokenizer antepone `>>bul<<` a cada frase fuente (`sourcePrefixTokenIds`) para seleccionar búlgaro. Además, `alignment.json` actúa como recibo que vincula la salida de alineamiento al SHA-256 del decodificador.

## Capacidades

- Traducción automática directa de inglés a búlgaro, en un único salto sin pivotar por inglés.
- Generación de alineamientos a nivel de token mediante la salida `alignment_shift_l2` (atención de la capa 2), útil para subtitulado y sincronización.
- Inferencia en dispositivo mediante onnnxruntime con pesos INT8, adecuada para entornos con recursos limitados.
- Soporte de selección de idioma destino mediante el prefijo `>>bul<<` gestionado por el tokenizer de runtime.
- No incluye tool calling, function calling, capacidades de agente ni razonamiento multi-paso.
- No dispone de visión, audio ni modo de razonamiento extendido (thinking mode).
- Cobertura multilingüe limitada estrictamente al par en→bg.

## Casos de uso

- Subtitulado automático en Android: la salida `alignment_shift_l2` permite alinear tokens de origen y destino, lo que facilita la sincronización de subtítulos en la app Subtitle Tap con traducción en dispositivo.
- Traducción offline en dispositivos móviles: al ser un modelo ONNX INT8 de 0,1 GB, puede ejecutarse localmente sin conexión, reduciendo latencia y evitando el envío de texto a servidores externos.
- Traducción de documentación técnica en inglés a búlgaro: el modelo directo en→bg evita errores acumulados de un pipeline con pivot y es adecuado para textos de longitud moderada.
- Localización de interfaces y cadenas de aplicación: integrado en un runtime OPUS, puede traducir recursos de cadena en tiempo de compilación o en tiempo de ejecución dentro de apps.
- Procesamiento por lotes de contenido editorial: al no requerir GPU dedicada, puede desplegarse en CPU para traducir grandes volúmenes de texto en pipelines de publicación.
- Análisis de alineamiento para lingüística computacional: la exposición de probabilidades de atención permite estudiar correspondencias léxicas en→bg sin modificar el modelo.
- Traducción de correos y mensajes en entornos con requisitos de privacidad: la inferencia local evita la exposición de datos a terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; al tratarse de un modelo ONNX INT8 de 0,1 GB, la huella de memoria es muy reducida y apta para CPU.
- GPU recomendadas: no disponible; el modelo está orientado a inferencia en dispositivo (Android) y CPU mediante onnnxruntime.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño del repositorio (0,1 GB), aunque no se proporcionan cifras oficiales.
- Opciones de despliegue: onnnxruntime (runtime OPUS de Subtitle Tap); no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| ukrbublik/opus-mt-en-bg-int8-shift-att | no disponible | no disponible | en→bg | Apache 2.0 | ONNX INT8 |
| Helsinki-NLP/opus-mt-en-bg (base) | no disponible | no disponible | en→bg | Apache 2.0 | safetensors/PyTorch |
| Helsinki-NLP/opus-mt-en-mul | no disponible | no disponible | en→multi | Apache 2.0 | safetensors/PyTorch |

La comparación con alternativas de la misma categoría se limita al modelo base original y a otras variantes OPUS-MT multilingües; no se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse sobre corpus OPUS, puede heredar sesgos de dominio y de género presentes en los datos paralelos; no se documentan análisis específicos.
- Riesgo de alucinación: propio de los modelos de traducción neuronal, especialmente en frases ambiguas, terminología especializada o entradas fuera de dominio.
- Limitaciones de contexto o idioma: cobertura restringida al par en→bg; no soporta otros pares ni direcciones inversas sin modelos adicionales.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe mantener la atribución al grupo de la Universidad de Helsinki y citar Tiedemann y Thottingal (2020).
- Caveat para producción: la salida de alineamiento es una identidad de un nodo existente y no altera la decodificación, pero su validez depende del SHA-256 registrado en `alignment.json`; conviene verificarlo en despliegues automatizados.
- La cuantización INT8 puede introducir pequeñas degradaciones de calidad frente al modelo en precisión completa; no se documentan métricas de dicha degradación.
- El repositorio no incluye información sobre límites de longitud de secuencia ni sobre el vocabulario exacto del tokenizer de runtime.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ukrbublik/opus-mt-en-bg-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-en-bg
- Repositorio OPUS-MT: https://github.com/Helsinki-NLP/OPUS-MT
- Paper de referencia: Tiedemann, J. and Thottingal, S. (2020). OPUS-MT — Building open translation services for the World. EAMT 2020.
- Proyecto OPUS: https://opus.nlpl.eu/
