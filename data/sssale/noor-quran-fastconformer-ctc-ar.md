# Sssale/noor-quran-fastconformer-ctc-ar

## Resumen

`noor-quran-fastconformer-ctc-ar` es un espejo byte a byte de tres ficheros del modelo `mrmuminov/quran-fastconformer-ctc-ar`, un sistema de reconocimiento automatico del habla (ASR) en arabe especializado en recitacion coranica. El espejo lo publica el usuario Sssale para que la aplicacion offline "Noor" descargue los pesos desde una ubicacion fija y anclada a un commit concreto. No se ha modificado ni reentrenado ningun fichero: se copian exactamente en las mismas rutas.

El modelo original es un fine-tuning de `nvidia/stt_ar_fastconformer_hybrid_large_pcd_v1.0` de NVIDIA, realizado por mrmuminov. La arquitectura es FastConformer, una variante de Conformer con atencion de submuestreo (depthwise separable) que reduce el coste computacional en secuencias largas, y la cabeza de salida es CTC (Connectionist Temporal Classification), lo que permite decodificacion sin modelo de lenguaje externo y alineamientos directos entre audio y texto.

Su relevancia es acotada pero clara: cubre un nicho muy especifico (transcripcion de recitacion coranica en arabe), se distribuye en ONNX int8 de unos 174 MB, lo que lo hace desplegable en dispositivos modestos y en entornos sin conexion, y su licencia CC-BY-4.0 permite uso comercial con atribucion. Al ser un espejo sin cambios, toda la documentacion tecnica, datos de entrenamiento y limitaciones deben consultarse en la model card del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (Conformer con atencion submuestreada) con cabeza CTC |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de entrada no documentada en la informacion proporcionada) |
| Tipos de cuantizacion | int8 (fichero `onnx/model_int8.onnx`, 173.847.393 bytes) |
| Idiomas soportados | arabe (`ar`) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (`onnx/model_int8.onnx`), fichero auxiliar `onnx/fb.bin` y vocabulario `vocab.json` |

## Arquitectura y entrenamiento

La arquitectura subyacente es FastConformer, una variante de Conformer que introduce capas de submuestreo con convoluciones depthwise separables para reducir la longitud de la secuencia antes de las capas de atencion. Esto disminuye el coste cuadratico de la atencion y mejora el rendimiento en audios largos. La cabeza de salida es CTC, lo que evita la necesidad de un decodificador autorregresivo y simplifica el despliegue en produccion.

El modelo del que deriva este espejo fue fine-tuneado por mrmuminov a partir de `nvidia/stt_ar_fastconformer_hybrid_large_pcd_v1.0` de NVIDIA. La informacion proporcionada no detalla el volumen de datos de entrenamiento, la composicion del corpus coranico utilizado, ni si se aplicaron tecnicas de aumento de datos o regularizacion especificas. Tampoco se documentan innovaciones adicionales mas alla del propio diseno FastConformer + CTC. Para esos detalles hay que remitirse a la model card del modelo original.

## Capacidades

- Reconocimiento automatico del habla en arabe, orientado especificamente a recitacion coranica.
- Transcripcion con salida CTC, lo que permite obtener alineamientos temporales entre audio y texto.
- Ejecucion en ONNX Runtime, lo que facilita el despliegue en CPU y en dispositivos con recursos limitados.
- Modelo cuantizado a int8, con un peso de aproximadamente 174 MB, adecuado para aplicaciones offline.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente ASR.
- No se documenta soporte de vision, audio generativo ni modo "thinking".
- Capacidad multilingue: no, solo arabe.

## Casos de uso

- Aplicacion movil de recitacion coranica offline: el modelo, al pesar unos 174 MB en int8 y ejecutarse en ONNX Runtime, puede integrarse en una app Android o iOS para transcribir la recitacion del usuario sin conexion y compararla con el texto canonico.
- Verificacion de memorizacion (hifz): un estudiante recita un pasaje y el modelo genera la transcripcion para que la aplicacion detecte omisiones, sustituciones o errores de pronunciacion respecto al texto de referencia.
- Seguimiento en tiempo real de la recitacion: la salida CTC permite alinear el audio con el texto y resaltar la palabra o aleya que se esta recitando en la pantalla.
- Generacion de subtitulos para grabaciones de recitacion: transcripcion por lotes de audios de clases, sermones o sesiones de estudio para producir subtitulos en arabe.
- Archivado y busqueda de contenido: transcripcion de una biblioteca de audios coranicos para permitir busqueda por texto dentro de la coleccion.
- Herramientas de accesibilidad: conversion de recitacion a texto para personas con discapacidad auditiva en contextos educativos o religiosos.
- Evaluacion de calidad de pronunciacion en entornos de ensenanza: comparar la transcripcion del alumno con la esperada y calcular una puntuacion de similitud a nivel de caracter o palabra.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del espejo no incluye WER, CER ni comparaciones con otros modelos; remite a la model card del modelo original para resultados.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: al ser un modelo int8 de aproximadamente 174 MB, la huella de memoria es muy reducida; cabe holgadamente en menos de 1 GB de RAM en CPU.
- GPU recomendadas: no requiere GPU. Funciona en CPU mediante ONNX Runtime; cualquier GPU moderna (RTX 3060 o superior, A100, H100) aceleraria la inferencia pero no es necesaria.
- Cabe en GPU de consumo: si, en cualquier GPU consumer, e incluso en dispositivos moviles y sistemas embebidos.
- Opciones de despliegue: ONNX Runtime (principal), y potencialmente otros runtimes compatibles con ONNX. No se documenta soporte nativo de vLLM, llama.cpp, Ollama o TGI, que estan orientados a modelos generativos.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| `Sssale/noor-quran-fastconformer-ctc-ar` (espejo) | no disponible | no disponible | ar | CC-BY-4.0 | ONNX int8 |
| `mrmuminov/quran-fastconformer-ctc-ar` (original) | no disponible | no disponible | ar | CC-BY-4.0 | safetensors / ONNX (no detallado) |
| `nvidia/stt_ar_fastconformer_hybrid_large_pcd_v1.0` (base) | no disponible | no disponible | ar | CC-BY-4.0 | NeMo (.nemo) |

No se dispone de datos de rendimiento comparativo (WER, CER) en la informacion proporcionada para establecer una comparacion cuantitativa entre estos modelos.

## Limitaciones y advertencias

- Es un espejo sin modificaciones: no incorpora mejoras, correcciones ni reentrenamiento respecto al modelo original.
- Dominio muy restringido: entrenado para recitacion coranica; su rendimiento en arabe coloquial, noticias, conversacion o dialectos no esta documentado y probablemente sea deficiente.
- Riesgo de alucinacion: en ASR, el equivalente son transcripciones incorrectas o sustituciones de palabras; la decodificacion CTC sin modelo de lenguaje externo puede producir errores ortograficos en pasajes poco representados.
- Sesgos: no documentados en la informacion proporcionada; al estar limitado a un corpus religioso, puede no representar variacion dialectal ni de genero.
- Limitaciones de contexto: la longitud maxima de audio procesable no esta documentada.
- Licencia CC-BY-4.0: permite uso comercial con atribucion obligatoria a mrmuminov y a NVIDIA. Es necesario conservar el aviso de licencia y no implicar endoso por parte de los autores originales.
- Sin garantias: la licencia excluye garantias explicitas (seccion 5). Para produccion conviene validar el WER en el dominio concreto de uso.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es un artefacto de despliegue interno mas que un modelo de referencia comunitario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sssale/noor-quran-fastconformer-ctc-ar
- Modelo original: https://huggingface.co/mrmuminov/quran-fastconformer-ctc-ar
- Commit de origen: https://huggingface.co/mrmuminov/quran-fastconformer-ctc-ar/tree/8610befc93003013c54570f3c0b5319111dc0d35
- Modelo base de NVIDIA: https://huggingface.co/nvidia/stt_ar_fastconformer_hybrid_large_pcd_v1.0
- Texto legal CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/legalcode.txt
- Resumen de la licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/
