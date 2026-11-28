# tifa613/itqan-whisper-tiny-ar-quran-onnx

## Resumen

Itqan Whisper tiny AR Quran ONNX es un paquete de inferencia en formato ONNX del modelo de reconocimiento automatico del habla `tarteel-ai/whisper-tiny-ar-quran`, adaptado para su ejecucion en navegador y en Node mediante Transformers.js. Lo publica el usuario tifa613 como componente del motor de la aplicacion de recitacion coranica Itqan, donde se emplea como modelo de voz opcional de bajo consumo ("data saver"). El modelo resuelve la transcripcion de recitacion coranica en arabe con marcas de tiempo a nivel de palabra, una funcionalidad necesaria para alinear el audio con el texto del Coran.

Tecnicamente es un Whisper tiny (arquitectura encoder-decoder transformer de OpenAI) afinado sobre recitacion coranica por Tarteel AI, reexportado a ONNX con atenciones expuestas para que Transformers.js pueda calcular marcas temporales por palabra. La contribucion especifica de este repositorio es una recuantizacion del encoder: la exportacion original cuantizaba tambien las capas convolucionales a int8 con `ConvInteger`, combinacion para la que onnxruntime no tiene kernel en CPU, lo que impedia cargar el modelo en Node y en el navegador. Aqui el encoder se recuantiza desde fp32 con int8 dinamico solo en `MatMul` y `Gemm`, manteniendo las dos capas convolucionales en fp32.

Es relevante porque demuestra un patron practico de despliegue de ASR en el cliente (sin servidor, con pesos de unos 46 MB) y porque documenta una evaluacion cuantitativa honesta frente a alternativas mayores. El coste es una precision limitada: el modelo tiny confunde aproximadamente el doble de palabras que la variante base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (encoder-decoder transformer) exportado a ONNX |
| Parametros totales | no disponible (corresponde a Whisper tiny; cifra exacta no publicada en la informacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio tipica de Whisper: 30 s; no confirmado en la informacion) |
| Tipos de cuantizacion | int8 dinamico en `MatMul` y `Gemm` del encoder; capas convolucionales en fp32; decoder `decoder_model_merged_quantized.onnx` (q8) |
| Idiomas soportados | arabe (`ar`) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (encoder y decoder separados, variantes cuantizadas) |

## Arquitectura y entrenamiento

El modelo subyacente es Whisper tiny, un transformer encoder-decoder con preprocesado de audio en espectrograma Mel, afinado por Tarteel AI sobre recitacion coranica en arabe. Sobre esa base, este repositorio aplica una exportacion ONNX orientada a Transformers.js que expone las salidas de atencion necesarias para el calculo de marcas temporales a nivel de palabra. El decoder se distribuye como `decoder_model_merged_quantized.onnx`, que fusiona los modos de prefill y decodificacion con cache.

La innovacion tecnica concreta de esta ficha es la correccion de la cuantizacion del encoder: la exportacion de partida (`Sharjeelbaig/whisper-tiny-ar-quran-onnx`) cuantizaba las convoluciones a int8 firmado mediante `ConvInteger`, sin kernel CPU en onnxruntime, lo que provocaba el fallo de carga tanto en Node como en el navegador. La solucion recuantiza desde el export fp32 con int8 dinamico restringido a `MatMul` y `Gemm`, dejando las dos capas convolucionales en fp32. No se detalla en la informacion el volumen de datos de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO en el modelo base.

## Capacidades

- Reconocimiento automatico del habla en arabe sobre recitacion coranica.
- Generacion de marcas temporales a nivel de palabra (word-level timestamps) gracias a las salidas de atencion expuestas en el export ONNX.
- Alineacion de audio con texto coranico, pensada para resaltar la palabra recitada en pantalla.
- Deteccion implicita de errores de recitacion mediante las marcas de vocalizacion (tashkeel) y las palabras mal oidas, tal como se evalua en la model card.
- Ejecucion en navegador y en Node mediante Transformers.js, sin backend de inferencia dedicado.
- No se documentan capacidades de tool calling, agentes, vision, audio generativo ni modo de razonamiento extendido.
- Multilingue: solo arabe; no se declaran otros idiomas.

## Casos de uso

- Aplicacion movil o web de recitacion coranica con resaltado en tiempo real: el modelo transcribe el audio del usuario y devuelve marcas por palabra que permiten sincronizar el texto del Coran con la recitacion, gracias a las atenciones expuestas en el ONNX.
- Modo de bajo consumo de datos: con unos 46 MB de pesos, es adecuado para usuarios con conexiones limitadas o dispositivos de gama baja, a costa de una tasa de error mayor que la variante base.
- Correccion de recitacion (tajwid y vocalizacion): las banderas de tashkeel y las palabras mal oidas permiten senalar errores al estudiante, segun el flujo de evaluacion descrito por el autor.
- Inferencia en el cliente sin servidor: el paquete se carga con `dtype: { encoder_model: 'q8', decoder_model_merged: 'q8' }` en Transformers.js, lo que elimina costes de infraestructura y preserva la privacidad del audio del usuario.
- Prototipado rapido de pipelines ASR en Node: util para integrar transcripcion coranica en scripts o servicios ligeros sin GPU.
- Evaluacion comparativa de cuantizaciones: sirve como referencia para medir el impacto de la recuantizacion selectiva (int8 en `MatMul`/`Gemm`, fp32 en convoluciones) en calidad y tamano.

## Benchmarks y rendimiento

Evaluacion del autor sobre 92 recitaciones (46 ayat de Mishary Alafasy y 46 de Mahmoud Khalil Al-Husary, de EveryAyah), 644 palabras, ejecutada con la segmentacion y alineacion propias de Itqan. Al ser recitadores expertos, toda palabra marcada se atribuye a un error del modelo.

| Modelo de voz | Descarga | Palabras mal oidas o perdidas | Banderas de vocalizacion extra (tashkeel) |
|---|---|---|---|
| Whisper base (`An0xity/whisper-base-ar-quran-onnx-timestamped`) | ~81 MB | 8 | 0 |
| Whisper tiny, encoder fp32 | ~63 MB | 14 | 3 |
| Whisper tiny, este repositorio | ~46 MB | 15 | 1 |

El modelo tiny confunde aproximadamente el doble de palabras que el base; por ello Itqan lo ofrece solo como opcion voluntaria de ahorro de datos.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el tamano de descarga es de unos 46 MB, por lo que la huella en memoria es muy reducida y compatible con CPU.
- GPU recomendadas: no requeridas; el modelo esta pensado para CPU en navegador y Node. En GPU, cualquier tarjeta moderna (RTX 4090, A100, H100) lo ejecutaria con holgura, pero no es el escenario objetivo.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo e incluso en CPU y en dispositivos moviles.
- Opciones de despliegue: Transformers.js (navegador y Node) con onnxruntime; la exportacion base es ONNX, por lo que tambien podria servirse con otros runtimes ONNX, aunque no se documenta en la informacion.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (palabras erroneas / 644) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Whisper tiny recuantizado) | Whisper tiny (cifra no publicada) | no disponible | 15 (1 bandera tashkeel) | Apache-2.0 | ONNX para Transformers.js, ~46 MB |
| Whisper tiny, encoder fp32 (`Sharjeelbaig/whisper-tiny-ar-quran-onnx`) | Whisper tiny | no disponible | 14 (3 banderas tashkeel) | Apache-2.0 (segun export) | ONNX, ~63 MB |
| Whisper base (`An0xity/whisper-base-ar-quran-onnx-timestamped`) | Whisper base (cifra no publicada) | no disponible | 8 (0 banderas) | no disponible en la informacion | ONNX, ~81 MB |
| `tarteel-ai/whisper-tiny-ar-quran` (modelo base) | Whisper tiny | no disponible | no evaluado en esta ficha | Apache-2.0 | Pesos originales en Hugging Face |

## Limitaciones y advertencias

- Precision limitada: confunde aproximadamente el doble de palabras que la variante base (15 frente a 8 sobre 644 palabras), por lo que no es adecuado para correccion de recitacion exigente sin revision humana.
- Solo arabe: no soporta otros idiomas ni mezcla de idiomas.
- Dominio restringido: afinado sobre recitacion coranica; su comportamiento fuera de ese dominio no esta evaluado.
- Riesgo de alucinacion en la transcripcion: como todo modelo ASR generativo, puede producir palabras plausibles no presentes en el audio, especialmente con ruido o recitadores no nativos.
- Sesgos: no se documentan sesgos especificos; la evaluacion se limita a dos recitadores masculinos expertos, lo que no representa la variabilidad de voces, acentos y generos.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantias; el archivo `LICENSE` se copia sin cambios del repositorio de exportacion.
- Dependencia de la configuracion de cuantizacion: cargarlo sin el `dtype` indicado o con el encoder original puede fallar en CPU por la falta de kernel para `ConvInteger`.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; madurez y mantenimiento no verificados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tifa613/itqan-whisper-tiny-ar-quran-onnx
- Modelo base: https://huggingface.co/tarteel-ai/whisper-tiny-ar-quran
- Exportacion ONNX de partida: https://huggingface.co/Sharjeelbaig/whisper-tiny-ar-quran-onnx
- Whisper base de referencia: https://huggingface.co/An0xity/whisper-base-ar-quran-onnx-timestamped
- Fuente de audio de evaluacion: EveryAyah (https://everyayah.com)
