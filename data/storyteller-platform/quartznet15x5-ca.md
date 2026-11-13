# storyteller-platform/quartznet15x5-ca

## Resumen

QuartzNet 15x5 Catalan es un modelo de reconocimiento automatico del habla (ASR) para catalan, desarrollado originalmente por NVIDIA y redistribuido por storyteller-platform dentro de su registro de modelos. Se trata de una red neuronal convolucional de tipo QuartzNet con 15 bloques residuales y 5 sub-bloques por bloque, entrenada sobre corpus de habla en catalan. El repositorio de Hugging Face es un espejo de la version 2.0.0 del modelo en el registro de Storyteller, con pesos en formato ONNX y safetensors.

El modelo resuelve la transcripcion de audio a texto en catalan y esta pensado para integrarse en la aplicacion Storyteller, que lo instala a traves de la herramienta ghost-story. Su relevancia radica en que ofrece una alternativa ligera (0,2 GB de repositorio) y ejecutable en CPU mediante ONNX Runtime, sin necesidad de un extractor de caracteristicas separado, ya que el front end mel esta embebido en el grafo ONNX.

La arquitectura es una CNN acustica con front end mel integrado, no un transformer. El modelo incluye una version en precision simple y otra en FP16 para el encoder, y se distribuye bajo licencia CC-BY-4.0, lo que permite uso comercial con atribucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | QuartzNet 15x5 (CNN con bloques residuales, 15 bloques y 5 sub-bloques) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR, no de contexto textual) |
| Tipos de cuantizacion | FP32 (model.onnx) y FP16 (model_fp16.onnx) |
| Idiomas soportados | catalan |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (model.onnx, model_fp16.onnx) y safetensors (model.safetensors para MLX) |

## Arquitectura y entrenamiento

QuartzNet es una arquitectura convolucional de tipo Jasper con bloques residuales y convoluciones separables en profundidad, disenada para ASR. La variante 15x5 indica 15 bloques con 5 sub-bloques cada uno. El modelo original fue entrenado por NVIDIA y publicado en el catalogo NGC como `nvidia/stt_ca_quartznet15x5`. No se dispone en la informacion proporcionada de detalles sobre el numero de horas de audio, la composicion del corpus ni si se aplicaron tecnicas de aumento de datos o decodificacion con modelo de lenguaje externo.

La version redistribuida por storyteller-platform incorpora innovaciones de empaquetado: el front end mel (transformada de Fourier de tiempo corto implementada como convolucion, proyeccion mel, logaritmo y normalizacion por caracteristica) forma parte del grafo ONNX, de modo que el modelo acepta la senal pre-enfatizada y con relleno reflectante en lugar de caracteristicas precalculadas. Esto permite ejecutarlo en cualquier execution provider de ONNX Runtime sin un extractor de caracteristicas separado. La version FP16 mantiene el front end en precision simple y solo convierte el encoder a media precision. La conversion se realiza con los scripts `convert.py` y `export-onnx.py` del repositorio de Storyteller.

## Capacidades

- Reconocimiento automatico del habla en catalan: transcripcion de audio a texto.
- Ejecucion en CPU y GPU mediante ONNX Runtime, con front end mel integrado en el grafo.
- Variante FP16 para reducir requisitos de memoria y acelerar inferencia en hardware compatible.
- Exportacion a MLX mediante safetensors para ejecucion en hardware Apple Silicon.
- No soporta tool calling ni function calling (es un modelo ASR, no un modelo de lenguaje).
- No soporta agentes ni razonamiento multi-paso.
- Capacidad multilingue limitada al catalan.
- No dispone de modo thinking, vision ni audio generativo.

## Casos de uso

- Transcripcion de audio en catalan en la aplicacion Storyteller: el modelo se instala via ghost-story y se usa para convertir audiolibros o contenido hablado en texto, aprovechando su tamano reducido y su ejecucion en CPU.
- Subtitulado automatico de videos en catalan: al ser un modelo ligero en ONNX, puede integrarse en pipelines de procesamiento por lotes que generen subtitulos sin GPU dedicada.
- Indexacion y busqueda de contenido audiovisual: la transcripcion permite generar indices de texto sobre archivos de audio o video en catalan para busqueda posterior.
- Asistentes de voz locales en catalan: el modelo puede actuar como componente ASR en un pipeline de asistente por voz que se ejecute en el dispositivo, gracias a la version FP16 y al front end integrado.
- Archivado y documentacion de reuniones: transcripcion de grabaciones de reuniones en catalan para generar actas o resumenes posteriores con otro modelo de lenguaje.
- Accesibilidad: generacion de transcripciones en tiempo casi real para personas con discapacidad auditiva en entornos de habla catalana, desplegando el modelo con ONNX Runtime en servidores modestos.
- Investigacion en ASR de lenguas minoritarias: sirve como linea base reproducible para experimentos de reconocimiento de habla en catalan con arquitecturas convolucionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precision; el repositorio completo ocupa 0,2 GB, por lo que la huella en memoria es reducida y cabe en GPU consumer de gama baja.
- GPU recomendadas: cualquier GPU compatible con ONNX Runtime, incluidas RTX 3060, RTX 4090, A100 o H100; el modelo no requiere GPU de gama alta.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer con al menos unos pocos GB de memoria libre.
- Opciones de despliegue: ONNX Runtime (model.onnx y model_fp16.onnx), MLX en Apple Silicon (model.safetensors), e integracion via ghost-story en Storyteller.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Licencia | Formato | Contexto/entrada |
|---|---|---|---|---|---|
| storyteller-platform/quartznet15x5-ca | QuartzNet 15x5 | Catalan | CC-BY-4.0 | ONNX, safetensors | Audio con front end mel integrado |
| nvidia/stt_ca_quartznet15x5 | QuartzNet 15x5 | Catalan | CC-BY-4.0 | NeMo (.nemo) | Audio con extractor NeMo |
| OpenVoiceOS/stt_ca_quartznet15x5_onnx | QuartzNet 15x5 | Catalan | CC-BY-4.0 | ONNX | Audio con extractor separado |

## Limitaciones y advertencias

- Modelo especializado exclusivamente en ASR en catalan; no genera texto libre ni razona.
- No se dispone de datos sobre sesgos acusticos, variedades dialectales cubiertas ni rendimiento en audio con ruido.
- Riesgo de errores de transcripcion en nombres propios, terminologia tecnica y acentos no representados en el corpus de entrenamiento.
- La licencia CC-BY-4.0 permite uso comercial con atribucion a NVIDIA y a los redistribuidores; es necesario conservar los avisos de licencia.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria publica.
- La fecha de creacion indicada (2026-11-13) es posterior a la fecha habitual de publicacion de modelos; conviene verificar la integridad del repositorio antes de usarlo en produccion.
- No se dispone de informacion sobre el corpus de entrenamiento, lo que limita la evaluacion de su cobertura y de posibles sesgos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/storyteller-platform/quartznet15x5-ca
- Modelo original en NGC: https://catalog.ngc.nvidia.com/orgs/nvidia/models/stt_ca_quartznet15x5
- Exportacion ONNX de OpenVoiceOS: https://huggingface.co/OpenVoiceOS/stt_ca_quartznet15x5_onnx
- Repositorio de Storyteller (scripts de conversion): https://gitlab.com/storyteller-platform/storyteller/-/tree/main/libraries/mlx-audio/scripts
- Registro del modelo en Storyteller: https://gitlab.com/storyteller-platform/storyteller/-/ml/models/quartznet15x5-ca
