# youssefbahy/taysir-tasmee

## Resumen

Taysir «التسميع» es un modelo de reconocimiento automático del habla (ASR) en árabe derivado de `nvidia/stt_ar_fastconformer_hybrid_large_pcd_v1.0`, publicado por el desarrollador youssefbahy como componente de escucha en dispositivo de la aplicación de estudio Taysir (تيسير الشاطبية), centrada en el texto de la Shatibiyyah. El modelo no se distribuye como checkpoint de entrenamiento al uso, sino como un artefacto ONNX autocontenido de 126.715.547 bytes (unos 121 MB) que la aplicación descarga una única vez y verifica por tamano y SHA-256 antes de usarlo; toda la inferencia ocurre en el telefono y no se envia audio a ningun servidor.

Tecnicamente es una adaptacion del FastConformer hibrido de NVIDIA: el front end se reconstruyo con operaciones portables, la tabla de posiciones se recorto a 60 segundos de audio, los pesos matriciales se almacenan en 8 bits mediante ONNX Runtime MatMulNBits con bloque de 64, y se anadio una segunda salida (`letters`) entrenada sobre recitaciones del matn. La entrada es `waveform` en float32 a 16 kHz, mono y con un maximo de 60 segundos; las salidas son `logprobs` (posteriores CTC sobre 1024 piezas mas el blank, una trama cada 80 ms) y `letters` (posteriores sobre 62 unidades foneticas y consonantes sostenidas, en las mismas tramas).

Su relevancia es acotada pero concreta: no compite como ASR generalista, sino como modelo de escucha especializado y offline para una tarea de verificacion de recitacion. El repo tiene 0 descargas y 0 likes en el momento de la consulta, y la unica documentacion disponible es la model card del autor, por lo que muchas especificaciones estandar no estan publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer hibrido (base: nvidia/stt_ar_fastconformer_hybrid_large_pcd_v1.0), exportado a ONNX |
| Parametros totales | no disponible (pesos cuantizados a 8 bits; el artefacto ONNX ocupa 126.715.547 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | audio de hasta 60 s (tabla de posiciones recortada a 60 s), mono, 16 kHz |
| Tipos de cuantizacion | pesos matriciales en 8 bits (ONNX Runtime MatMulNBits, bloque 64) |
| Idiomas soportados | arabe (`ar`) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (`tasmee-fc-ar-v2.onnx`) |

## Arquitectura y entrenamiento

La base es el FastConformer hibrido de NVIDIA para arabe, un modelo conformer con atencion por bloques y capas convolucionales que combina CTC con decodificacion atencional (de ahi "hibrido"). La adaptacion publicada aqui no reentrena el modelo completo: exporta el grafo a ONNX, reconstruye el front end de preprocesado con operaciones portables, recorta la tabla de posiciones a 60 segundos de audio y cuantiza las matrices a 8 bits con MatMulNBits (bloque 64) para reducir el peso y permitir ejecucion en dispositivo.

Sobre esa base se anade una segunda cabeza de salida, `letters`, con posteriores sobre 62 unidades (fonemas y consonantes sostenidas mas el blank), entrenada especificamente con recitaciones del matn. La salida principal `logprobs` mantiene el vocabulario CTC de 1024 piezas mas el blank, con una trama cada 80 ms. No se publican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset de recitaciones ni si se aplico RLHF o DPO.

## Capacidades

- Reconocimiento de voz en arabe sobre audio mono a 16 kHz, en segmentos de hasta 60 segundos.
- Salida CTC con posteriores (`logprobs`) sobre 1024 piezas mas el blank, una trama cada 80 ms.
- Salida fonetica adicional (`letters`) sobre 62 unidades, orientada a verificar la pronunciacion de la recitacion.
- Inferencia completamente local en el dispositivo, sin envio de audio a servidores.
- Verificacion de integridad del artefacto por tamano y SHA-256 antes de la carga.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo arabe.
- Modo thinking, vision o audio generativo: no disponible.

## Casos de uso

- Verificacion de recitacion del matn: la aplicacion captura la recitacion del usuario, la pasa por el modelo y compara la secuencia de `letters` con la esperada para senalar errores de pronunciacion o consonantes no sostenidas.
- Estudio autonomo sin conectividad: al ejecutarse en el telefono, el modelo permite practicar en lugares sin red, manteniendo el audio en el dispositivo.
- Correccion fonetica guiada: la salida `letters` a 80 ms por trama permite resaltar en la interfaz que unidad fonetica se ha pronunciado de forma incorrecta y en que instante.
- Transcripcion de sesiones de practica: la salida `logprobs` permite generar una transcripcion aproximada de la recitacion para revisarla posteriormente.
- Distribucion controlada de modelos en apps moviles: el artefacto unico con SHA-256 publicado y el esquema de descarga unica sirven como patron para empaquetar ASR en aplicaciones moviles.
- Evaluacion de adaptaciones ASR de bajo coste: util como referencia para estudiar el efecto de la cuantizacion a 8 bits y del recorte de contexto en un FastConformer arabe.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el artefacto ONNX pesa unos 121 MB, por lo que la huella en memoria es del orden de cientos de MB incluyendo activaciones.
- GPU recomendadas: no aplica; el modelo esta disenado para ejecucion en dispositivo (CPU movil) mediante ONNX Runtime.
- Cabe en GPU consumer: si, por tamano, aunque no es el escenario previsto.
- Opciones de despliegue: ONNX Runtime con MatMulNBits (bloque 64); otras opciones no disponibles.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| youssefbahy/taysir-tasmee | no disponible (ONNX de 121 MB, 8 bits) | 60 s | ar | CC BY 4.0 | ONNX |
| nvidia/stt_ar_fastconformer_hybrid_large_pcd_v1.0 | no disponible en la informacion | no disponible | ar | CC BY 4.0 | NeMo |
| Alternativas ASR arabes de otros proveedores | no disponible | no disponible | ar | no disponible | no disponible |

La comparativa directa solo es posible con el modelo base, del que este es una exportacion cuantizada y con una cabeza adicional; no se dispone de datos de rendimiento de ninguno de los dos en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta arabe; no hay capacidades multilingues.
- Audio limitado a 60 segundos por inferencia y a 16 kHz mono; fuera de ese rango el comportamiento no esta documentado.
- El modelo esta especializado en recitaciones del matn de la Shatibiyyah; su comportamiento en arabe conversacional generico no esta descrito.
- No se publican metricas de error (WER/CER) ni evaluaciones independientes, por lo que no es posible cuantificar su precision.
- Riesgo de alucinacion y de sustituciones foneticas en pasajes con ruido de fondo o pronunciacion atipica: no documentado por el autor.
- Sesgos conocidos: no disponibles.
- La licencia CC BY 4.0 permite uso comercial con atribucion; deben mantenerse los creditos al autor y al modelo base de NVIDIA, y documentarse los cambios realizados.
- El artefacto debe verificarse por SHA-256 antes de su uso; la integridad del despliegue recae en el integrador.
- El repo presenta 0 descargas y 0 likes, sin senales de adopcion ni mantenimiento por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/youssefbahy/taysir-tasmee
- Modelo base: https://huggingface.co/nvidia/stt_ar_fastconformer_hybrid_large_pcd_v1.0
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Copia en GitHub (release `tasmee-model-v2`): repositorio `Youssef-Bahy-Youssef/taysir-audio` (no se dispone de URL completa en la informacion proporcionada)
- Copia en archive.org: `taysir-tasmee-model-v2` (no se dispone de URL completa en la informacion proporcionada)
