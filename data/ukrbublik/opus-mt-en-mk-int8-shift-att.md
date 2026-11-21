# ukrbublik/opus-mt-en-mk-int8-shift-att

## Resumen

`ukrbublik/opus-mt-en-mk-int8-shift-att` es una conversión a ONNX con cuantización INT8 del modelo de traducción automática `Helsinki-NLP/opus-mt-en-mk`, desarrollado originalmente por el Language Technology Research Group de la Universidad de Helsinki dentro del proyecto OPUS-MT. El modelo traduce directamente del inglés (en) al macedonio (mk), sin pivotar a través de una lengua intermedia. Esta variante concreta la publica el usuario `ukrbublik` para el runtime on-device de la aplicación Android Subtitle Tap.

El interés técnico de esta ficha no está en la calidad de traducción —que hereda íntegramente del modelo base— sino en el empaquetado: exportación con Optimum a ONNX (opset 17, sin past key/values), cuantización dinámica INT8 por tensor con onnxruntime, y una salida adicional de alineación (`alignment_shift_l2`) que expone las probabilidades de atención encoder-decoder de la capa 2. Esa señal de alineación es útil para tareas de subtitulado, donde interesa sincronizar o resaltar palabras origen-destino.

El modelo es de tamaño reducido (repo de 0,1 GB), con licencia Apache 2.0 y pensado para inferencia en dispositivo. No hay métricas de calidad publicadas en la información disponible, y el número de descargas y likes es cero en el momento de la consulta, lo que indica un artefacto de nicho más que un modelo de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian, OPUS-MT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinámica (QInt8, per-tensor) sobre ONNX; el modelo base admite cuantizaciones adicionales no incluidas aquí |
| Idiomas soportados | inglés (en) y macedonio (mk) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`), más `tokenizer_runtime.json` y `alignment.json` |

## Arquitectura y entrenamiento

La arquitectura subyacente es Marian, la familia de modelos de traducción neuronal desarrollada en el proyecto OPUS-MT. Se trata de un transformer encoder-decoder estándar entrenado sobre datos paralelos del corpus OPUS. El modelo base `Helsinki-NLP/opus-mt-en-mk` (revisión `24245504cfac992ddce76a26e7bfdeb3c248e99f`) se entrenó con la receta habitual de OPUS-MT: pares de frases alineadas del corpus OPUS, sin que la información disponible detalle el número exacto de tokens, la composición del dataset ni si hubo etapas de fine-tuning con RLHF o DPO.

Esta variante no reentrena ni modifica los pesos. Los cambios son exclusivamente de formato y despliegue: exportación con Optimum a ONNX (opset 17, sin past key/values, es decir, decodificación sin caché de atención), cuantización dinámica INT8 por tensor con onnxruntime, y la adición de una salida `alignment_shift_l2` que es una Identity sobre un nodo existente del decoder y expone las probabilidades de atención encoder-decoder de la capa 2. El fichero `alignment.json` actúa como recibo que vincula esa salida al SHA-256 del decoder, lo que permite verificar que la señal de alineación corresponde exactamente a los pesos cuantizados. El tokenizador se sirve como `tokenizer_runtime.json`, con las piezas y puntuaciones del SentencePiece original mapeadas a ids de vocabulario.

## Capacidades

- Traducción directa inglés → macedonio, sin pivotar por una lengua intermedia.
- Salida de alineación palabra a palabra mediante `alignment_shift_l2` (probabilidades de atención de la capa 2 del decoder), útil para subtitulado y resaltado.
- Inferencia on-device en Android a través del runtime OPUS de Subtitle Tap.
- Tokenizador empaquetado en JSON para uso sin dependencias de SentencePiece en tiempo de ejecución.
- Verificación de integridad del decoder mediante `alignment.json` y SHA-256.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio: es un modelo de traducción puro.
- Capacidad multilingüe limitada estrictamente al par en→mk.

## Casos de uso

- Subtitulado on-device en Android: la app Subtitle Tap puede traducir subtítulos del inglés al macedonio sin conexión, usando los ficheros ONNX cuantizados y el tokenizador JSON; el tamaño reducido del repo (0,1 GB) facilita el empaquetado en el APK o su descarga inicial.
- Resaltado y sincronización de palabras en subtítulos: la salida `alignment_shift_l2` permite mapear palabras del subtítulo original a su traducción, útil para karaoke de subtítulos o para marcar términos concretos.
- Traducción de documentación técnica en local: para equipos que trabajan con material en inglés y necesitan versiones en macedonio sin enviar texto a servicios en la nube, el modelo se puede ejecutar con onnxruntime en CPU.
- Preprocesado de corpus en pipelines de NLP: traducción por lotes de textos en inglés a macedonio como paso previo a análisis, indexación o clasificación, aprovechando la cuantización INT8 para reducir coste de cómputo.
- Prototipado de funciones de traducción en aplicaciones de escritorio o web: al ser ONNX, se integra en runtimes ligeros (onnxruntime-web, onnxruntime-node) sin necesidad de GPU.
- Evaluación de técnicas de alineación: investigadores que estudian attention alignment pueden usar este artefacto como caso de referencia con pesos fijos y salida de atención verificable por hash.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; al tratarse de un modelo Marian de tamaño reducido cuantizado a INT8 (repo de 0,1 GB), es esperable que quepa holgadamente en memoria de dispositivos móviles y en CPU, aunque no se aportan cifras oficiales.
- GPU recomendadas: no disponibles; el caso de uso declarado es on-device en Android, por lo que la inferencia objetivo es CPU/SoC móvil.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño del artefacto, aunque no hay datos publicados que lo confirmen.
- Opciones de despliegue: onnxruntime (runtime OPUS de Subtitle Tap), onnxruntime-web y onnxruntime-node; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato y arquitectura.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `ukrbublik/opus-mt-en-mk-int8-shift-att` | no disponible | no disponible | Apache 2.0 | ONNX INT8 | Salida de alineación añadida; orientado a on-device |
| `Helsinki-NLP/opus-mt-en-mk` | no disponible | no disponible | Apache 2.0 | safetensors/PyTorch | Modelo base original, sin cuantizar ni salida de alineación |
| Otros OPUS-MT en→lenguas eslavas del sur (p. ej. en→bg, en→sr) | no disponible | no disponible | Apache 2.0 | safetensors/PyTorch | Misma familia y receta; idioma destino distinto |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- Calidad de traducción heredada del modelo base; no se han publicado evaluaciones (BLEU, COMET u otras) para esta conversión.
- El par de idiomas está restringido a inglés → macedonio; no traduce en sentido inverso ni a otras lenguas.
- La cuantización INT8 puede introducir una degradación adicional de calidad respecto al modelo original en PyTorch, no cuantificada en la información disponible.
- La exportación sin past key/values implica decodificación sin caché de atención, lo que puede aumentar la latencia en secuencias largas frente a variantes con caché.
- Riesgo de alucinación y de traducciones literales en dominios especializados (terminología técnica, nombres propios), habitual en modelos Marian entrenados sobre OPUS.
- Sesgos potenciales procedentes de los datos OPUS, no documentados por el autor.
- Licencia Apache 2.0 permite uso comercial, pero conviene conservar la atribución al grupo de la Universidad de Helsinki y citar el trabajo de Tiedemann y Thottingal (2020).
- Artefacto de nicho con cero descargas y sin mantenimiento declarado; la reproducibilidad depende de la revisión concreta del modelo base citada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ukrbublik/opus-mt-en-mk-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-en-mk
- Proyecto OPUS-MT: https://github.com/Helsinki-NLP/OPUS-MT
- Corpus OPUS: https://opus.nlpl.eu/
- Referencia: Tiedemann, J. and Thottingal, S. (2020). OPUS-MT — Building open translation services for the World. EAMT 2020.
