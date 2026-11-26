# Sssale/noor-quran-asr-small

## Resumen

noor-quran-asr-small es un espejo byte a byte de dos ficheros del modelo Abdou/quran-asr-small, un sistema de reconocimiento automático del habla (ASR) especializado en recitación coránica en árabe. Lo publica el usuario Sssale para que la aplicación móvil gratuita y sin publicidad "Noor" descargue los pesos desde una ubicación fija y anclada a un commit concreto. No se ha modificado ningún contenido: se copian exactamente los mismos ficheros, en las mismas rutas.

El modelo original lo desarrolla Abdeladim Fadheli (Abdou) y se describe en el artículo "Small Conformer-CTC Models for On-Device Quranic Recitation Recognition" (Zenodo, 2026). Se trata de un modelo CTC basado en arquitectura Conformer, orientado a inferencia en dispositivo, y se distribuye en formato ONNX cuantizado a int8 para su uso con la librería sherpa-onnx. El repositorio es muy pequeño (0,0 GB según Hugging Face; el fichero principal `model.int8.onnx` ocupa 36 081 762 bytes, unos 34,4 MiB).

Su relevancia es doble: por un lado, cubre una tarea de nicho con requisitos estrictos de precisión (transcribir recitación coránica, donde la diacritización y la fonética importan); por otro, ejemplifica el patrón de espejos anclados para aplicaciones offline que necesitan reproducibilidad en la descarga. La licencia del modelo es MIT, pero los datos de entrenamiento incluyen un subconjunto con licencia no comercial, lo que condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer con cabecera CTC |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (fichero `model.int8.onnx`) |
| Idiomas soportados | árabe (ar) |
| Licencia | MIT (modelo); datos de entrenamiento con restricciones adicionales (ver limitaciones) |
| Formato de pesos | ONNX (int8); tokenizador en `tokens.txt` |

## Arquitectura y entrenamiento

La arquitectura es un Conformer, es decir, un transformer que combina bloques de autoatención con convoluciones depthwise para capturar dependencias locales y globales en la señal de audio. La salida se decodifica mediante una cabecera CTC (Connectionist Temporal Classification), lo que permite alineamientos sin segmentación previa y favorece la decodificación en streaming o en dispositivo. El modelo se exporta a ONNX y se cuantiza a int8 para reducir el tamaño y el coste computacional.

Según la model card del espejo, los datos de entrenamiento incluyen `tarteel-ai/tlog` (licencia CC-BY-4.0) e `IqraEval/Iqra_train` (licencia CC-BY-NC-4.0, aproximadamente 21 de las 1 532 horas de entrenamiento). También se citan recitadores Hafs y Warsh de EveryAyah, sin licencia especificada en la tarjeta original. No se detalla en la información disponible el número total de tokens de audio, la composición exacta del dataset ni si hubo etapas de ajuste fino con RLHF o DPO; para esos detalles remite a la model card original y al artículo en Zenodo.

## Capacidades

- Reconocimiento automático del habla (ASR) en árabe, especializado en recitación coránica.
- Transcripción a nivel de fonema o carácter según el tokenizador incluido en `tokens.txt` (180 bytes, vocabulario muy reducido).
- Decodificación CTC, adecuada para inferencia en streaming y en dispositivo.
- Ejecución offline mediante sherpa-onnx, sin dependencia de servicios en la nube.
- Modelo compacto (unos 34,4 MiB en int8), pensado para móviles y sistemas embebidos.
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio generativo ni modo "thinking".
- Capacidad multilingüe: no; solo árabe.

## Casos de uso

- Aplicaciones de recitación coránica con corrección en tiempo real: el modelo transcribe la recitación del usuario y permite compararla con el texto esperado para señalar errores de pronunciación o de secuencia, gracias a su naturaleza CTC y a su ejecución en dispositivo.
- Aplicaciones móviles offline y sin publicidad: el tamaño reducido (34,4 MiB en int8) y el formato ONNX permiten empaquetar el modelo dentro de la app o descargarlo desde un espejo anclado, como hace "Noor".
- Verificación de memorización (hifz): el estudiante recita y el sistema comprueba automáticamente la correspondencia con el versículo, sin enviar audio a servidores externos.
- Subtitulado y alineación de recitaciones grabadas: útil para generar transcripciones sincronizadas de audio coránico en bibliotecas digitales o archivos.
- Investigación en ASR de árabe clásico: sirve como línea base ligera para experimentos de reconocimiento fonético y diacritización en dominios religiosos.
- Sistemas embebidos y Raspberry Pi: la cuantización int8 y el runtime sherpa-onnx permiten desplegar el modelo en hardware de bajos recursos para tareas de transcripción local.
- Evaluación de calidad de recitación en plataformas educativas: integrado en un pipeline que detecte tartamudeos, omisiones o sustituciones de palabras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del espejo remite al artículo de Zenodo (DOI 10.5281/zenodo.23761691) y a la model card original de Abdou/quran-asr-small para resultados, detalles de entrenamiento y limitaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; por el tamaño del fichero (34,4 MiB en int8) el modelo cabe holgadamente en cualquier GPU con al menos 1 GB de memoria libre, y probablemente en CPU.
- GPU recomendadas: no se especifican; por tamaño, cualquier GPU consumer moderna (RTX 3060, RTX 4090) es sobredimensionada. El caso de uso previsto es CPU o NPU móvil.
- Cabe en GPU consumer: sí, en todas las gamas actuales; también en dispositivos móviles y SBC.
- Opciones de despliegue: sherpa-onnx (runtime previsto por la librería declarada), y en general cualquier runtime compatible con ONNX Runtime.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| noor-quran-asr-small | Conformer + CTC | no disponible | árabe | MIT (modelo) | ONNX int8 |
| Abdou/quran-asr-small | Conformer + CTC | no disponible | árabe | MIT | safetensors/ONNX (no detallado) |
| Whisper small (referencia genérica) | Transformer encoder-decoder | 30 s de audio | multilingüe | MIT | safetensors, GGUF, ONNX |
| Modelos ASR árabes genéricos | variable | variable | árabe | variable | variable |

No se dispone de datos de rendimiento comparativo en la información proporcionada; la comparación con Whisper small se incluye solo como referencia de categoría (ASR genérico multilingüe frente a ASR especializado en recitación coránica) y no implica una evaluación de calidad.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al entrenarse con recitadores concretos (Hafs y Warsh), puede generalizar peor a otras variantes de recitación o a habla árabe no coránica.
- Riesgo de alucinación: en ASR CTC el riesgo se manifiesta como sustituciones, omisiones o inserciones de fonemas, especialmente con ruido de fondo o voces no vistas en entrenamiento.
- Limitaciones de idioma: solo árabe; no soporta otros idiomas ni code-switching.
- Restricciones de licencia: aunque el modelo es MIT, parte de los datos de entrenamiento (`IqraEval/Iqra_train`) está bajo CC-BY-NC-4.0, lo que implica que los usuarios deben respetar la restricción de no uso comercial y la atribución a Iqra'Eval. La app "Noor" que usa este espejo es gratuita y sin publicidad, en línea con esa restricción.
- Este repositorio es un espejo sin modificaciones; cualquier corrección o actualización debe buscarse en el repositorio original Abdou/quran-asr-small.
- El espejo no implica el aval del autor original y no reclama derechos sobre el modelo.
- Para producción: verificar la licencia de los datos de entrenamiento antes de cualquier uso comercial y validar el rendimiento en el dominio acústico concreto (micrófono, ruido, dialecto del recitador).

## Enlaces

- Espejo en Hugging Face: https://huggingface.co/Sssale/noor-quran-asr-small
- Modelo original: https://huggingface.co/Abdou/quran-asr-small
- Commit original espejado: https://huggingface.co/Abdou/quran-asr-small/tree/0c2744b9d70aaf45ba574c30c5d318c575258e66
- Artículo (Zenodo): https://doi.org/10.5281/zenodo.23761691
- Dataset tarteel-ai/tlog: https://huggingface.co/datasets/tarteel-ai/tlog
- Dataset IqraEval/Iqra_train: https://huggingface.co/datasets/IqraEval/Iqra_train
- Licencia CC-BY-NC-4.0: https://creativecommons.org/licenses/by-nc/4.0/
- sherpa-onnx (runtime): no se proporciona enlace en la información disponible
