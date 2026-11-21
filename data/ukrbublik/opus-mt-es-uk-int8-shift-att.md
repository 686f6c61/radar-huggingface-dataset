# ukrbublik/opus-mt-es-uk-int8-shift-att

## Resumen

`ukrbublik/opus-mt-es-uk-int8-shift-att` es una conversión a ONNX con cuantización INT8 dinámica del modelo de traducción automática `Helsinki-NLP/opus-mt-es-uk`, desarrollado originalmente por el Language Technology Research Group de la Universidad de Helsinki dentro del proyecto OPUS-MT. El modelo traduce directamente entre español y ucraniano, sin pivote intermedio a través del inglés, y está pensado para su uso en dispositivos Android mediante el runtime OPUS de la aplicación Subtitle Tap.

La arquitectura subyacente es Marian NMT, un transformer encoder-decoder entrenado sobre datos paralelos del corpus OPUS. Esta versión concreta no modifica los pesos ni el proceso de decodificación: solo cambia el formato (exportación ONNX, opset 17) y aplica cuantización INT8 dinámica por tensor con onnxruntime. Además, expone una salida adicional de alineación (`alignment_shift_l2`) con las probabilidades de atención encoder-decoder de la capa 2, útil para aplicaciones que necesitan alinear tokens origen-destino, como subtitulado.

El modelo es relevante para desarrolladores que necesitan traducción es-uk de bajo coste computacional en entornos sin GPU, con un tamaño de repositorio de 0,1 GB y licencia Apache 2.0. No está pensado como modelo de propósito general ni como sustituto de sistemas de traducción de mayor calidad, sino como componente ligero para integración en aplicaciones móviles o pipelines de subtitulado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian NMT (transformer encoder-decoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinámica (QInt8, per-tensor) vía onnxruntime |
| Idiomas soportados | español (es), ucraniano (uk) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`) |

## Arquitectura y entrenamiento

El modelo base `Helsinki-NLP/opus-mt-es-uk` es un sistema de traducción neuronal Marian, una arquitectura transformer encoder-decoder desarrollada por el grupo OPUS-MT de la Universidad de Helsinki. Fue entrenado sobre datos paralelos del corpus OPUS, una colección de corpus multilingües de dominio público y abierto. No se dispone en la información proporcionada del número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; estos datos corresponden al modelo original y no se detallan en la model card de esta conversión.

La innovación técnica de esta versión concreta es doble. Por un lado, la exportación a ONNX con opset 17 sin past key/values y la cuantización INT8 dinámica por tensor, que reduce el tamaño y acelera la inferencia en CPU. Por otro, la exposición de una salida adicional de alineación: `alignment_shift_l2`, que corresponde a las probabilidades de atención encoder-decoder de la capa 2 del decoder. Esta salida se implementa como una identidad sobre un nodo existente, por lo que no altera los pesos ni la decodificación. El repositorio incluye además `tokenizer_runtime.json` (piezas y puntuaciones del modelo SentencePiece mapeadas a ids de vocabulario) y `alignment.json` (recibo que vincula la salida de alineación con el SHA-256 del decoder).

## Capacidades

- Traducción directa español a ucraniano y ucraniano a español (modelo bidireccional según el pipeline de traducción declarado, aunque el nombre indica es→uk).
- Traducción sin pivote a través del inglés, lo que evita la propagación de errores de un sistema intermedio.
- Salida de alineación token a token mediante `alignment_shift_l2`, útil para subtitulado y sincronización.
- Inferencia en CPU mediante ONNX Runtime con cuantización INT8.
- Integración en aplicaciones Android a través del runtime OPUS de Subtitle Tap.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No dispone de capacidades de visión, audio ni modo de pensamiento.
- Capacidades multilingües limitadas exclusivamente al par es-uk.

## Casos de uso

- Subtitulado automático en Android: la aplicación Subtitle Tap puede traducir subtítulos es-uk en el dispositivo gracias al runtime OPUS y a la salida de alineación, que permite sincronizar los tokens traducidos con los originales sin depender de la nube.
- Traducción offline en dispositivos de gama baja: el modelo cuantizado a INT8 y con 0,1 GB de repositorio cabe en memoria de un móvil y se ejecuta en CPU mediante ONNX Runtime, sin necesidad de GPU.
- Alineación de corpus paralelos: la salida `alignment_shift_l2` permite extraer correspondencias token a token entre español y ucraniano para construir o validar memorias de traducción y datasets paralelos.
- Preprocesado en pipelines de NLP multilingüe: traducción rápida de textos es-uk antes de tareas posteriores como análisis de sentimiento o extracción de entidades en ucraniano.
- Herramientas de accesibilidad: traducción en tiempo real de contenido escrito en español a ucraniano para usuarios con discapacidad auditiva o en contextos de movilidad.
- Prototipado y evaluación de sistemas de traducción: al ser un modelo ligero y de licencia permisiva, sirve como baseline para comparar con sistemas de mayor tamaño en tareas de traducción de bajo recurso.
- Integración en aplicaciones de mensajería o chat: traducción de mensajes es-uk en el propio dispositivo, preservando la privacidad al no enviar texto a servidores externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo está diseñado para ejecución en CPU.
- GPU recomendadas: no aplica; el runtime objetivo es CPU con ONNX Runtime.
- ¿Cabe en GPU consumer? No es el caso de uso previsto; el modelo está pensado para dispositivos móviles y CPU.
- Opciones de despliegue: ONNX Runtime (runtime OPUS de Subtitle Tap), integración en Android; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| `ukrbublik/opus-mt-es-uk-int8-shift-att` | no disponible | no disponible | es, uk | Apache 2.0 | ONNX INT8 | Salida de alineación, orientado a Android |
| `Helsinki-NLP/opus-mt-es-uk` | no disponible | no disponible | es, uk | Apache 2.0 | safetensors/PyTorch | Modelo base original, sin cuantizar |
| `Helsinki-NLP/opus-mt-es-ru` | no disponible | no disponible | es, ru | Apache 2.0 | safetensors/PyTorch | Alternativa para lengua eslava oriental, no equivalente |
| `facebook/nllb-200-distilled-600M` | 600M | 1024 tokens | 200 idiomas | CC-BY-NC 4.0 | safetensors | Mayor cobertura pero licencia no comercial |

La comparación directa con alternativas es limitada porque no se dispone de datos de parámetros ni de benchmarks en la información proporcionada. El modelo base de Helsinki-NLP es la referencia natural; las alternativas multilingües de mayor tamaño como NLLB ofrecen más idiomas pero con licencias más restrictivas y mayor coste computacional.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información proporcionada; al entrenarse sobre corpus OPUS, puede heredar sesgos de los datos paralelos originales.
- Riesgo de alucinación: presente en sistemas de traducción neuronal, especialmente en frases largas o dominios especializados; no se han publicado evaluaciones específicas para esta conversión.
- Limitaciones de contexto o idioma: solo cubre el par es-uk; no soporta otros idiomas ni cambios de dominio sin degradación.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe mantener la atribución al grupo OPUS-MT de la Universidad de Helsinki según la model card.
- Caveat para producción: la cuantización INT8 puede introducir una ligera pérdida de calidad frente al modelo original en PyTorch; no se han publicado métricas comparativas.
- La salida de alineación se implementa como una identidad sobre un nodo existente y está vinculada por SHA-256 al decoder; cualquier modificación del decoder invalidaría esa vinculación.
- El modelo está optimizado para el runtime OPUS de Subtitle Tap; su uso fuera de ese entorno requiere verificar la compatibilidad del tokenizer y de la salida de alineación.

## Enlaces

- [Hugging Face: ukrbublik/opus-mt-es-uk-int8-shift-att](https://huggingface.co/ukrbublik/opus-mt-es-uk-int8-shift-att)
- [Modelo base: Helsinki-NLP/opus-mt-es-uk](https://huggingface.co/Helsinki-NLP/opus-mt-es-uk)
- [Paper OPUS-MT (Tiedemann y Thottingal, EAMT 2020)](https://aclanthology.org/2020.eamt-1.61/)
- [Repositorio OPUS-MT de la Universidad de Helsinki](https://github.com/Helsinki-NLP/OPUS-MT)
- [Corpus OPUS](https://opus.nlpl.eu/)
