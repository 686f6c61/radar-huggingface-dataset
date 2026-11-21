# ukrbublik/opus-mt-nl-uk-int8-shift-att

## Resumen

El modelo `ukrbublik/opus-mt-nl-uk-int8-shift-att` es una conversión a ONNX con cuantización INT8 del modelo de traducción automática neuronal `Helsinki-NLP/opus-mt-nl-uk`, desarrollado originalmente por el Grupo de Investigación en Tecnología del Lenguaje de la Universidad de Helsinki (OPUS-MT, Jörg Tiedemann et al.). Resuelve la traducción directa neerlandés→ucraniano sin pivotar por el inglés, un caso poco cubierto en la mayoría de sistemas de traducción comerciales.

La conversión está orientada al despliegue en dispositivo (on-device) dentro de la aplicación Android Subtitle Tap, que usa un runtime OPUS propio. El autor ha exportado el modelo con `optimum` en opset 17 (sin past key/values) y ha aplicado cuantización dinámica INT8 de ONNX Runtime (QInt8, per-tensor) sobre encoder y decoder. Además, ha añadido una salida auxiliar de alineación (`alignment_shift_l2`) que expone las probabilidades de atención encoder-decoder de la capa 2, útil para alinear subtítulos con el texto de origen.

El modelo es relevante por su tamaño reducido (0,1 GB en el repositorio), su licencia Apache-2.0 y su formato ONNX cuantizado, que lo hace apto para ejecución en CPU móvil. No es un modelo generativo general: es un traductor seq2seq Marian especializado en un único par de idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer seq2seq (Marian), exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (limitada por el modelo Marian original; no especificada en la model card) |
| Tipos de cuantizacion | INT8 dinámica (QInt8, per-tensor) sobre encoder y decoder |
| Idiomas soportados | neerlandés (nl) → ucraniano (uk) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnnx`, `decoder_model_quantized.onnx`), opset 17; tokenizer en JSON (`tokenizer_runtime.json`) |

## Arquitectura y entrenamiento

El modelo subyacente es un Marian, la arquitectura seq2seq transformer encoder-decoder desarrollada por Microsoft para traducción automática y adoptada por el proyecto OPUS-MT. El entrenamiento original proviene de Helsinki-NLP, entrenado sobre datos OPUS (corpus paralelos multilingües) y publicado bajo Apache-2.0. La model card no detalla el número de tokens de entrenamiento ni la composición exacta del dataset para este par concreto.

La conversión de `ukrbublik` no modifica pesos ni decodificación: solo cambia el formato (export ONNX con `optimum`, opset 17, sin past key/values) y aplica cuantización dinámica INT8 con ONNX Runtime. La innovación destacable es la salida adicional `alignment_shift_l2`, que expone las probabilidades de atención de la capa 2 del decoder sobre el encoder mediante una operación Identity sobre un nodo existente, sin alterar los pesos. El repositorio incluye `alignment.json`, un recibo que vincula la salida de alineación al SHA-256 del decoder. El tokenizer se distribuye como `tokenizer_runtime.json`, con las piezas y puntuaciones del SentencePiece original mapeadas a ids de vocabulario.

## Capacidades

- Traducción directa neerlandés→ucraniano, sin pivotar por inglés.
- Traducción de texto plano (subtítulos, frases, párrafos cortos).
- Salida de alineación encoder-decoder por token (probabilidades de atención de la capa 2), útil para sincronizar subtítulos.
- Ejecución en dispositivo mediante ONNX Runtime con cuantización INT8.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión, audio ni otras capacidades multimodales.
- Multilingüismo limitado estrictamente al par nl→uk.

## Casos de uso

- Subtitulado automático en Android: la app Subtitle Tap puede traducir subtítulos neerlandeses a ucraniano en el propio dispositivo, sin conexión, gracias al formato ONNX INT8 y a la salida de alineación que permite sincronizar cada segmento con el texto de origen.
- Traducción offline en dispositivos de gama baja: el tamaño reducido (0,1 GB) y la cuantización INT8 permiten ejecución en CPU móvil sin GPU dedicada.
- Localización de contenido audiovisual neerlandés para audiencias ucranianas: traducción de guiones y transcripciones con alineación por token para revisión manual.
- Procesamiento por lotes de corpus nl→uk en servidores sin GPU: ONNX Runtime en CPU ofrece un coste de despliegue bajo para pipelines de traducción de documentación.
- Herramientas de accesibilidad: generación de subtítulos traducidos en tiempo real para hablantes de ucraniano que consumen contenido en neerlandés.
- Investigación en alineación de palabras: la salida `alignment_shift_l2` permite estudiar correspondencias léxicas entre neerlandés y ucraniano sin necesidad de herramientas de alineación externas.
- Integración en apps de notas o lectores de documentos: traducción bajo demanda de texto neerlandés embebido en aplicaciones móviles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas BLEU, COMET, MMLU, HumanEval ni GSM8K, ni comparaciones cuantitativas con otros sistemas.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso principal (CPU); en GPU, el modelo INT8 ocupa del orden de 0,1 GB de pesos, por lo que la VRAM necesaria es mínima (menos de 1 GB incluyendo activaciones y overhead del runtime).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se requiere A100 ni H100. Una RTX 4090 o RTX 3060 están sobredimensionadas para este modelo.
- Cabe en cualquier GPU consumer y en CPU móvil; el objetivo declarado es ejecución on-device en Android.
- Opciones de despliegue: ONNX Runtime (principal, con soporte de cuantización INT8), runtime OPUS propio de Subtitle Tap; vLLM, llama.cpp, Ollama y TGI no son aplicables a este formato y arquitectura.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| `ukrbublik/opus-mt-nl-uk-int8-shift-att` | no disponible | no disponible | nl→uk | Apache-2.0 | ONNX INT8 |
| `Helsinki-NLP/opus-mt-nl-uk` (modelo base) | no disponible | no disponible | nl→uk | Apache-2.0 | PyTorch/safetensors (formato original) |
| Otros modelos OPUS-MT nl→X | no disponible | no disponible | nl→distintos | Apache-2.0 | varía |

La comparación principal es con su modelo base: la versión de `ukrbublik` añade export ONNX, cuantización INT8 y salida de alineación, a costa de posibles pérdidas mínimas de calidad por la cuantización (no documentadas). Frente a modelos de traducción multilingües de mayor tamaño (por ejemplo, NLLB o M2M-100), este modelo es mucho más pequeño y especializado en un solo par, lo que reduce calidad global pero facilita el despliegue en dispositivo.

## Limitaciones y advertencias

- Especializado exclusivamente en nl→uk; no traduce en sentido inverso ni otros pares.
- La cuantización INT8 dinámica puede introducir pérdidas de calidad respecto al modelo original; no se han publicado métricas que lo cuantifiquen.
- Riesgo de alucinación y de traducciones erróneas en frases largas, terminología especializada o dominios fuera de los datos OPUS.
- Cobertura limitada de registros coloquiales, dialectos neerlandeses y variantes regionales del ucraniano.
- La salida de alineación es una aproximación basada en atención de la capa 2; no es una alineación léxica garantizada.
- Licencia Apache-2.0 permite uso comercial, pero exige atribución a los autores originales (Universidad de Helsinki, Tiedemann y Thottingal, 2020) y conservación del aviso de licencia.
- El modelo está pensado para el runtime OPUS de Subtitle Tap; su integración en otros runtimes ONNX requiere validar la salida auxiliar y el tokenizer JSON.
- Sin datos de benchmarks, no es posible garantizar umbrales de calidad para producción sin evaluación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ukrbublik/opus-mt-nl-uk-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-nl-uk
- Paper de OPUS-MT: Tiedemann, J. and Thottingal, S. (2020). OPUS-MT — Building open translation services for the World. EAMT 2020.
- Proyecto OPUS-MT (Helsinki-NLP): https://github.com/Helsinki-NLP/OPUS-MT
- ONNX Runtime: https://onnxruntime.ai/
- Optimum (export ONNX): https://huggingface.co/docs/optimum
