# tonythethompson/parakeet-tdt-0.6b-v3-onnx

## Resumen

Parakeet-tdt-0.6b-v3-onnx es una redistribucion en formato ONNX del modelo de reconocimiento automatico del habla (ASR) NVIDIA Parakeet-TDT-0.6B-v3, empaquetada por el usuario tonythethompson para el proyecto Trackdub. No se trata de un modelo nuevo: los ficheros se copian sin modificar desde el artefacto ONNX de istupakov (revision 8f23f0c03c8761650bdb5b40aaf3e40d2c15f1ce), que a su vez convierte el modelo original de NVIDIA. El objetivo es facilitar la ejecucion en entornos sin toolkit NeMo, usando unicamente ONNX Runtime.

El modelo subyacente es un sistema de transcripcion multilingue de aproximadamente 600 millones de parametros, basado en la arquitectura FastConformer-TDT (Token-and-Duration Transducer). Extiende el anterior parakeet-tdt-0.6b-v2, que solo cubria ingles, ampliando el soporte a 25 idiomas europeos con deteccion automatica del idioma. Esta pensado para transcripcion de alto rendimiento, con un perfil de computo lo bastante ligero como para ejecutarse en CPU con latencia cercana o inferior al tiempo real.

Su relevancia actual radica en que ofrece una alternativa compacta y abierta (licencia CC-BY-4.0) a modelos ASR mas grandes como Whisper large-v3, con un formato ONNX directamente desplegable en pipelines de produccion, contenedores sin GPU y servicios compatibles con la API de OpenAI. El tamano del repositorio es de 2,5 GB, correspondiente a pesos fp32.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer-TDT (Token-and-Duration Transducer), encoder Conformer + red de prediccion y joint TDT |
| Parametros totales | 600 millones (0,6B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de audio; procesa segmentos de audio, no una ventana de contexto de texto) |
| Tipos de cuantizacion | fp32 en este repositorio (encoder distribuido en fp32); no se documentan otras cuantizaciones |
| Idiomas soportados | 25 idiomas europeos: en, es, fr, de, bg, hr, cs, da, nl, et, fi, el, hu, it, lv, lt, mt, pl, pt, ro, sk, sl, sv, ru, uk (deteccion automatica del idioma) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX: `nemo128.onnx` (preprocesador log-mel de 128 bins), `encoder-model.onnx` + `encoder-model.onnx.data`, `decoder_joint-model.onnx`; vocabulario SentencePiece en `vocab.txt` |

## Arquitectura y entrenamiento

La arquitectura combina un encoder FastConformer, una variante eficiente del Conformer que sustituye parte de los mecanismos de atencion por convoluciones separables en profundidad, con un decodificador TDT (Token-and-Duration Transducer). En el fichero `decoder_joint-model.onnx` se expone la red de prediccion y el joint: la salida son logits de token seguidos de 5 logits de duracion, lo que permite al modelo emitir varios tokens por fotograma y acelerar la decodificacion frente a un transducer clasico. El preprocesador `nemo128.onnx` calcula caracteristicas log-mel de 128 bins con normalizacion por caracteristica incluida.

No se dispone, en la informacion proporcionada, de detalles sobre el volumen de tokens de audio empleado en el entrenamiento, la composicion exacta del dataset ni si se aplicaron fases de RLHF o DPO. El paper asociado (arXiv:2509.14128) presenta conjuntamente Canary-1B-v2 y Parakeet-TDT-0.6B-v3 como modelos multilingues eficientes para ASR y traduccion de voz, y describe a este ultimo como un modelo mas pequeno pero mas preciso que cubre los mismos 25 idiomas. Esta redistribucion concreta no introduce cambios en los pesos: solo reorganiza los artefactos exportados.

## Capacidades

- Reconocimiento automatico del habla (ASR) de alta eficiencia para 25 idiomas europeos.
- Deteccion automatica del idioma de entrada, sin necesidad de indicar el idioma de forma explicita.
- Decodificacion TDT, que predice duraciones ademas de tokens y reduce el coste por fotograma.
- Inferencia en CPU mediante ONNX Runtime, ademas de ejecucion en GPU con proveedores CUDA/TensorRT.
- Integracion en servicios con interfaz compatible con la API de OpenAI, segun el wrapper de terceros disponible.
- Salida de transcripcion con marcas de tiempo derivadas del alineamiento token-duracion (segun el formato de exportacion).
- No se documentan en la informacion disponible capacidades de traduccion de voz (AST), diarizacion de hablantes, tool calling, agentes ni vision.

## Casos de uso

- Subtitulado automatico de video: el modelo transcribe audio en cualquiera de los 25 idiomas soportados y detecta el idioma sin configuracion previa, lo que simplifica pipelines de generacion de subtitulos para catalogos multilingues.
- Doblaje y localizacion: el empaquetado se realizo precisamente para Trackdub, un flujo de doblaje; la transcripcion con marcas temporales sirve como paso previo a la traduccion y al ajuste de locucion.
- Transcripcion de reuniones y notas de voz: al ser un modelo de 0,6B, puede desplegarse por instancia y procesar audio corporativo sin enviar datos a servicios externos, relevante para requisitos de privacidad.
- Indexacion y busqueda en archivos audiovisuales: transcribir horas de grabacion y almacenar el texto permite busqueda semantica sobre el contenido, con coste de computo bajo.
- Analitica de llamadas en atencion al cliente: transcripcion por lotes de conversaciones telefonicas para extraer motivos de contacto, cumplimiento y calidad, ejecutable en CPU sin GPU dedicada.
- Accesibilidad: generacion de transcripciones en directo para personas con discapacidad auditiva en entornos educativos o institucionales.
- Asistentes de voz y dictado: entrada de voz para aplicaciones de escritorio o moviles donde el modelo corre localmente con ONNX Runtime.
- Despliegue en el borde (edge): al no requerir GPU, encaja en servidores modestos, contenedores sin acelerador o equipos de campo con conectividad limitada.
- Procesamiento por lotes de gran volumen: la arquitectura TDT y la ejecucion en ONNX Runtime permiten priorizar throughput sobre latencia en tareas de transcripcion masiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. El paper asociado (arXiv:2509.14128) describe Parakeet-TDT-0.6B-v3 como un modelo de ASR mas pequeno y mas preciso que soporta los mismos 25 idiomas que Canary-1B-v2, pero la informacion disponible no incluye cifras por dataset (WER, MMLU u otras). El repositorio de terceros groxaxo/parakeet-tdt-0.6b-v3-fastapi-openai afirma alcanzar velocidades de tiempo real en CPU, superando a openai/whisper y compitiendo con implementaciones de faster-whisper aceleradas por GPU; se trata de una afirmacion del autor de ese repositorio y no se acompana de cifras verificables en la informacion proporcionada.

## Requisitos de hardware

- Pesos fp32: aproximadamente 2,4-2,5 GB en disco (el repositorio completo ocupa 2,5 GB).
- VRAM estimada para inferencia en GPU: del orden de 3-4 GB con fp32, sumando pesos y activaciones; estimacion orientativa, no publicada por el autor.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM; en la practica, RTX 3060, RTX 4060, RTX 4090, A100, H100 o L4 funcionan sin problema y quedan muy por encima del minimo.
- Cabe en GPU de consumo: si, en practicamente toda la gama actual (RTX 30/40/50 con 8 GB o mas), y tambien en iGPU/CPU sin acelerador.
- CPU: viable para inferencia en tiempo real segun el wrapper de terceros basado en ONNX Runtime; el modelo es de 0,6B y esta disenado para alto throughput.
- Opciones de despliegue: ONNX Runtime (proveedores CPU, CUDA y TensorRT), NeMo toolkit para el modelo original, servidor FastAPI compatible con la API de OpenAI (groxaxo/parakeet-tdt-0.6b-v3-fastapi-openai) y otros contenedores que acepten grafos ONNX. llama.cpp, Ollama, vLLM y TGI no aplican a este formato ni a esta modalidad de ASR.
- Latencia y throughput: no disponibles como cifras concretas; el unico dato cualitativo es la afirmacion de velocidad superior al tiempo real en CPU del wrapper citado.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Formatos | Rendimiento |
|---|---|---|---|---|---|
| Parakeet-TDT-0.6B-v3 (esta conversion ONNX) | 600 M | 25 europeos | CC-BY-4.0 | ONNX (fp32), NeMo en el modelo original | no disponible en la informacion proporcionada |
| openai/whisper-large-v3 | 1550 M | ~99 | MIT | safetensors, CTranslate2, GGML, ONNX (conversiones de terceros) | no disponible en la informacion proporcionada |
| openai/whisper-medium | 769 M | ~99 | MIT | safetensors, CTranslate2, GGML, ONNX (conversiones de terceros) | no disponible en la informacion proporcionada |
| nvidia/canary-1b-v2 | 1000 M | 25 europeos | CC-BY-4.0 | NeMo | ASR y traduccion de voz (AST); cifras no disponibles en la informacion proporcionada |

Diferencias destacables: frente a Whisper, Parakeet-TDT-0.6B-v3 tiene aproximadamente una cuarta parte de los parametros de large-v3 y cubre menos idiomas (25 europeos frente a ~99), pero solo realiza transcripcion, sin traduccion. Frente a Canary-1B-v2, es mas pequeno y, segun el paper, mas preciso en ASR, aunque Canary anade capacidad de traduccion de voz. La ventaja practica de este repositorio es el formato ONNX listo para despliegue sin NeMo.

## Limitaciones y advertencias

- Solo transcripcion: no realiza traduccion de voz ni tareas multi-tarea, a diferencia de Canary-1B-v2.
- Cobertura linguistica limitada a 25 idiomas europeos; no soporta otras lenguas presentes en modelos como Whisper.
- Sin diarizacion de hablantes: no distingue quien habla en grabaciones con multiples interlocutores.
- Riesgo de alucinacion y de errores en audio con ruido, solapamiento de voces, acentos marcados o dominio muy especifico; conviene validar con WER propio antes de produccion.
- El pipeline requiere segmentar el audio de entrada; la informacion disponible no especifica la longitud maxima por ventana ni el comportamiento exacto en audios muy largos.
- Esta redistribucion es fp32, por lo que ocupa unos 2,5 GB y no aprovecha el ahorro de memoria de una cuantizacion int8, que no se documenta aqui.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta y lo mantiene un tercero (tonythethompson), no NVIDIA; los artefactos proceden de istupakov/parakeet-tdt-0.6b-v3-onnx. Para uso critico conviene fijar la revision del commit.
- Licencia CC-BY-4.0: permite uso comercial, pero exige atribucion a NVIDIA y el cumplimiento de las condiciones de redistribucion; revisar `LICENSE.CC-BY-4.0` y `NOTICE.md`.
- No hay benchmarks publicados para esta conversion concreta; el rendimiento puede variar segun el proveedor de ejecucion de ONNX Runtime, el hardware y el preprocesado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tonythethompson/parakeet-tdt-0.6b-v3-onnx
- Modelo original de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Artefacto ONNX de origen: https://huggingface.co/istupakov/parakeet-tdt-0.6b-v3-onnx
- Paper (Canary-1B-v2 y Parakeet-TDT-0.6B-v3): https://arxiv.org/html/2509.14128v1
- Wrapper FastAPI compatible con la API de OpenAI: https://github.com/groxaxo/parakeet-tdt-0.6b-v3-fastapi-openai
- Ficha de resumen en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/parakeet-tdt-0.6b-v3-onnx-istupakov
