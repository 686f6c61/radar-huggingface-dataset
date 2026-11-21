# ukrbublik/opus-mt-en-ar-int8-shift-att

## Resumen

`ukrbublik/opus-mt-en-ar-int8-shift-att` es una conversión a ONNX con cuantización INT8 del modelo de traducción automática `Helsinki-NLP/opus-mt-en-ar`, desarrollado originalmente por el grupo de investigación en tecnología del lenguaje de la Universidad de Helsinki (OPUS-MT, Jörg Tiedemann et al.). El autor de la conversión, ukrbublik, lo publica para el runtime OPUS en el dispositivo de la aplicación Android Subtitle Tap. El modelo traduce directamente de inglés a árabe, sin pivotar a través de una lengua intermedia.

Se trata de un transformer encoder-decoder de arquitectura Marian, exportado con optimum (opset 17, sin past key/values) y cuantizado dinámicamente con onnxruntime (QInt8, per-tensor). El repositorio ocupa aproximadamente 0,1 GB, lo que refleja el tamaño compacto típico de la familia OPUS-MT. La innovación concreta de esta versión es que el decodificador emite además una salida adicional, `alignment_shift_l2`, con las probabilidades de atención encoder del nivel 2, pensada para alinear tokens origen y destino en subtítulos.

La relevancia de esta ficha es acotada: no es un modelo de propósito general ni compite con los LLM actuales, sino una pieza de infraestructura para traducción en local en dispositivos móviles, con licencia Apache 2.0 y soporte limitado a la pareja de idiomas inglés-árabe.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinámica (QInt8, per-tensor) sobre export ONNX |
| Idiomas soportados | inglés (en), árabe (ar) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder_model_quantized.onnx`, `decoder_model_quantized.onnx`), más `tokenizer_runtime.json` y `alignment.json` |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer encoder-decoder de tipo Marian, la familia usada por OPUS-MT para traducción automática neuronal. El modelo original fue entrenado por el grupo de Helsinki sobre datos de OPUS y es multiobjetivo; esta conversión selecciona el árabe como lengua destino anteponiendo el token de prefijo `>>ara<<` a cada frase origen, codificado en `tokenizer_runtime.json` como `sourcePrefixTokenIds`.

La conversión no modifica pesos ni decodificación. Se exporta con optimum a opset 17 sin past key/values, se cuantiza dinámicamente con onnxruntime y se añade una salida de identidad sobre un nodo existente del decodificador para exponer las probabilidades de atención encoder de la capa 2 (`alignment_shift_l2`). El archivo `alignment.json` actúa como recibo que vincula esa salida al SHA-256 del decodificador. No se documentan datos de entrenamiento propios, número de tokens, ni etapas de RLHF o DPO en esta conversión.

## Capacidades

- Traducción automática directa inglés a árabe, sin pivotar por una tercera lengua.
- Generación de alineamientos de atención encoder-destino (capa 2) mediante la salida `alignment_shift_l2`, útil para emparejar tokens en subtítulos.
- Ejecución en local sobre ONNX Runtime, incluida inferencia en dispositivo móvil.
- Tokenizador SentencePiece empaquetado en `tokenizer_runtime.json` con piezas, puntuaciones y cadenas destino mapeadas a identificadores de vocabulario.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.
- Multilingüismo limitado estrictamente a la pareja en-ar.

## Casos de uso

- Subtitulado automático en Android: la aplicación Subtitle Tap puede traducir subtítulos en inglés a árabe en el propio dispositivo con el runtime OPUS, sin enviar texto a servidores y con un paquete de unos 0,1 GB.
- Alineación de subtítulos bilingües: la salida `alignment_shift_l2` permite emparejar segmentos origen y destino, útil para generar subtítulos sincronizados o para control de calidad de la traducción.
- Traducción offline en entornos sin conectividad: al ejecutarse en ONNX Runtime local, encaja en escenarios de campo, aviación o dispositivos aislados donde no hay acceso a API en la nube.
- Preprocesado de corpus inglés-árabe: puede usarse para generar traducciones preliminares de grandes volúmenes de texto antes de una revisión humana, dado su bajo coste computacional.
- Aplicaciones de accesibilidad: conversión de contenido en inglés a árabe en lectores de pantalla o asistentes de voz integrados en móvil, con latencia baja por el tamaño reducido del modelo.
- Prototipado de pipelines de traducción: sirve como baseline ligero en experimentos de traducción automática donde se necesita un modelo Apache 2.0 sin restricciones de uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con cifras concretas; por el tamaño del repositorio (0,1 GB) y la cuantización INT8, el modelo es muy ligero y cabe holgadamente en memoria de dispositivos móviles y GPUs de gama baja.
- GPU recomendadas: no se especifican; el destino declarado es la inferencia en dispositivo (Android) mediante ONNX Runtime, no GPU de servidor.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU consumer actual e incluso en CPU, aunque no se aportan cifras de VRAM ni de latencia.
- Opciones de despliegue: ONNX Runtime (runtime OPUS de la app Subtitle Tap); al estar en formato ONNX cuantizado, no es directamente compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| ukrbublik/opus-mt-en-ar-int8-shift-att | no disponible | no disponible | en, ar | Apache 2.0 | ONNX INT8 |
| Helsinki-NLP/opus-mt-en-ar | no disponible | no disponible | en, ar | Apache 2.0 | safetensors/PyTorch |
| Otros OPUS-MT en-ar de la familia Helsinki-NLP | no disponible | no disponible | en, ar | Apache 2.0 | PyTorch |

La comparación directa con el modelo base es la más relevante: esta versión cambia únicamente el formato (ONNX + INT8) y añade la salida de alineamiento; los pesos y la calidad de traducción deberían ser equivalentes, aunque no se aportan métricas que lo confirmen.

## Limitaciones y advertencias

- Solo traduce inglés a árabe; no cubre otras direcciones ni otras lenguas.
- No hay datos publicados de calidad (BLEU, COMET) ni de evaluación de sesgos; el riesgo de alucinación y de errores en dominios especializados no está cuantificado.
- La cuantización INT8 puede introducir una ligera degradación respecto al modelo original en fp32, no medida en la información disponible.
- El modelo base es multiobjetivo y requiere el prefijo `>>ara<<`; un uso incorrecto del tokenizador o del prefijo puede producir salidas en otra lengua.
- La salida `alignment_shift_l2` es una identidad sobre un nodo existente: no añade información nueva, solo la expone, y su interpretación depende del runtime.
- Licencia Apache 2.0 permite uso comercial, pero se debe mantener la atribución a la Universidad de Helsinki y citar el trabajo de Tiedemann y Thottingal (2020).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ukrbublik/opus-mt-en-ar-int8-shift-att
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-en-ar
- Repositorio OPUS-MT: https://github.com/Helsinki-NLP/OPUS-MT
- Artículo de referencia: Tiedemann, J. y Thottingal, S. (2020), "OPUS-MT — Building open translation services for the World", EAMT 2020.
