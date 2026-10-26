# ysdede/qwen3-asr-0.6b-onnx

## Resumen

`ysdede/qwen3-asr-0.6b-onnx` es un paquete de artefactos ONNX publicado por el usuario ysdede para el adaptador Qwen3-ASR de la librería local `@asrjs/speech-recognition`. No es un modelo entrenado desde cero ni un export oficial: contiene la exportación ONNX personalizada y los recursos de tokenizador que usa dicho adaptador, derivados del repositorio upstream `Qwen/Qwen3-ASR-0.6B` (Apache-2.0) en la revisión `5eb144179a02acc5e5ba31e748d22b0cf3e303b0`.

El interés del paquete es práctico: el repositorio upstream no ofrece grafos ONNX en esa revisión, de modo que este bundle cubre un hueco para quien necesite ejecutar un modelo ASR de ~0,6 mil millones de parámetros sobre un runtime ONNX en lugar de PyTorch. Incluye un encoder de audio en FP32 y grafos de decodificador en FP16 (prefill y step) con datos externos compartidos, más un manifiesto `asrjs-manifest.json` con los nombres de fichero y sus digests SHA-256.

Se distribuye con licencia Apache-2.0 y un tamaño de repositorio de 2,3 GB. El propio autor lo etiqueta como experimental y advierte de que no certifica precisión multilingüe amplia, ni todas las combinaciones de backend y precisión, ni el uso con micrófonos físicos: es un perfil de ejecución concreto, no un perfil aprobado de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder para reconocimiento automatico del habla (audio encoder + decodificador con grafos separados de prefill y step); arquitectura interna de la familia Qwen3-ASR, no detallada en la model card |
| Parametros totales | 0,6 mil millones (segun la denominacion del modelo, herencia de Qwen3-ASR 0.6B) |
| Parametros activos | No aplica (no se describe como MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP32 (encoder de audio) y FP16 (decoder prefill/step); no se documentan variantes INT8/INT4 ni GGUF |
| Idiomas soportados | No disponible; el autor advierte explicitamente de que el bundle no certifica precision multilingue amplia |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX con datos externos compartidos, mas recursos de tokenizador y manifiesto `asrjs-manifest.json` (SHA-256) |

## Arquitectura y entrenamiento

La model card no describe el proceso de entrenamiento ni la composicion del dataset: este repositorio no incluye informacion sobre tokens de entrenamiento, mezcla de datos, RLHF/DPO ni innovaciones de entrenamiento. Lo que si se deduce de los artefactos es la topologia de ejecucion: un grafo de encoder de audio en FP32 y dos grafos de decodificador en FP16 (prefill y step), lo que corresponde a un esquema encoder-decoder autoregresivo con cache KV gestionada por pasos. Los datos externos de los tensores se comparten entre grafos.

El trabajo tecnico aportado aqui es la exportacion y el empaquetado, no el modelado. El autor indica que el export es personalizado y que estos ficheros no constituyen un export ONNX generico para Transformers.js: requieren el adaptador de artefacto local de `@asrjs/speech-recognition`. La validacion reportada es una matriz de cuatro demos con pesos reales que acepto 16 de 18 flujos de fixtures solicitados, con streaming nativo no soportado.

## Capacidades

- Reconocimiento automatico del habla (audio a texto) mediante el pipeline `automatic-speech-recognition`.
- Ejecucion sobre runtime ONNX a traves del adaptador Qwen3-ASR de `@asrjs/speech-recognition`, con encoder en FP32 y decodificador en FP16.
- Decodificacion autoregresiva por pasos con grafo de prefill separado, apta para integracion en bucles de inferencia controlados por la aplicacion.
- Integridad verificable de artefactos mediante `asrjs-manifest.json` y digests SHA-256.
- Capacidades multilingues: no disponibles/no certificadas en la informacion proporcionada.
- Tool calling, function calling, agentes, vision, audio de salida, modo thinking: no disponibles en la informacion proporcionada (el modelo es ASR puro segun los metadatos).
- Streaming nativo: no soportado, segun la validacion del autor.

## Casos de uso

- Transcripcion por lotes en aplicaciones JavaScript/Node: el bundle esta pensado para el adaptador de `@asrjs/speech-recognition`, de modo que un servicio Node puede invocar el modelo sin depender de PyTorch ni de un servidor Python aparte, a cambio de asumir el caracter experimental del export.
- Prototipado y evaluacion de ASR en local: util para comparar el comportamiento de un modelo Qwen3-ASR de 0,6B frente a otras alternativas antes de comprometerse con un despliegue en produccion, usando el manifiesto SHA-256 para garantizar que se evaluan exactamente los mismos artefactos.
- Procesamiento con requisitos de privacidad: al poder ejecutarse sobre ONNX en la propia infraestructura, el audio no necesita salir del perimetro, lo que encaja en entornos con datos sensibles (siempre que se valide la precision en el dominio concreto, no certificada por el autor).
- Canalizaciones de subtitulado y transcripcion offline: generacion de transcripciones para archivos de audio o video en herramientas de escritorio o servidor sin conectividad, aceptando que no hay streaming nativo y que el flujo debe alimentar el audio completo o en segmentos gestionados por la aplicacion.
- Indexado y busqueda de contenido hablado: transcripcion previa de archivos para alimentar indices de texto o sistemas de busqueda internos, con la advertencia de que la calidad multilingue no esta certificada y conviene medirla por idioma antes de indexar a escala.
- Pruebas de integracion en CI: la matriz de fixtures del autor (16 de 18 flujos aceptados) sirve como referencia para montar tests de regresion del adaptador ONNX en un pipeline de integracion continua, verificando hashes y rutas de ejecucion.
- Base para portar Qwen3-ASR a otros runtimes ONNX: al documentarse el linaje del export en las notas de portado del proyecto asrjs, el bundle puede servir de punto de partida para reproducir el export con otras precisiones o backends, algo que el autor senala como no certificado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (ni MMLU, ni WER sobre conjuntos estandar, ni comparativas cifradas con otros modelos ASR). El unico dato de validacion aportado es funcional, no de calidad:

| Prueba reportada por el autor | Resultado |
|---|---|
| Matriz de cuatro demos con pesos reales | 16 de 18 flujos de fixtures solicitados aceptados |
| Streaming nativo | No soportado |
| Cobertura de precision multilingue amplia | No certificada |
| Combinaciones de backend/precision | No certificadas en su totalidad |
| Uso con microfonos fisicos | No certificado |

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: el repositorio ocupa 2,3 GB, con encoder FP32 y decodificador FP16; como referencia de orden de magnitud, hay que prever al menos ese espacio de artefactos mas el overhead del runtime y las activaciones (estimacion a partir del tamano del repo, no medida publicada).
- GPU recomendadas: no disponibles en la informacion proporcionada; el autor no publica matrices de GPU ni cifras de latencia por dispositivo.
- Encaje en GPU de consumo: no confirmado. Por tamano del bundle (2,3 GB) es plausible en GPUs de consumo con 8 GB o mas, pero no hay validacion publicada que lo respalde.
- Opciones de despliegue: adaptador de artefacto local de `@asrjs/speech-recognition` sobre runtime ONNX. Explicitamente no es un export compatible con Transformers.js generico. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a LLM, no a este bundle ASR).
- Latencia y throughput: no disponibles; no se publican mediciones por backend ni por precision.
- Almacenamiento: 2,3 GB de repositorio, incluyendo datos externos compartidos entre grafos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| `ysdede/qwen3-asr-0.6b-onnx` | 0,6B | No disponible | No certificados | Apache-2.0 | ONNX (encoder FP32, decoder FP16) | Export experimental para asr.js; 16/18 fixtures aceptados; sin streaming nativo |
| `Qwen/Qwen3-ASR-0.6B` (upstream) | 0,6B | No disponible | No disponible | Apache-2.0 | Sin ONNX en la revision citada | Fuente del export; pesos y tokenizador originales |
| Otros modelos ASR de ~0,6B con export ONNX | No disponible | No disponible | No disponible | No disponible | No disponible | No se han encontrado alternativas comparables en la informacion disponible |

## Limitaciones y advertencias

- Caracter experimental declarado por el autor: no es un perfil de ejecucion aprobado de proposito general y no certifica precision multilingue amplia.
- Validacion limitada: la matriz de cuatro demos acepto 16 de 18 flujos; no se publican tasas de error (WER/CER) sobre conjuntos estandar.
- Streaming nativo no soportado, lo que condiciona casos de uso en tiempo real.
- No certificado para todas las combinaciones de backend y precision, ni para captura con microfonos fisicos; el comportamiento puede degradarse fuera del perfil probado.
- Dependencia de una libreria concreta: requiere el adaptador de `@asrjs/speech-recognition`; no funciona como export ONNX generico de Transformers.js, lo que limita la portabilidad.
- Idiomas soportados no documentados: no se debe asumir cobertura multilingue sin evaluacion propia por idioma.
- Riesgo de alucinacion y errores de transcripcion: inherente a los modelos ASR, agravado aqui por la ausencia de metricas publicadas; conviene añadir verificacion humana en flujos criticos.
- Sesgos: no disponibles; el autor no documenta analisis de sesgos por acento, idioma, edad o genero.
- Licencia Apache-2.0 permite uso comercial, pero la licencia cubre el artefacto derivado del upstream Apache-2.0; conviene conservar atribuciones y revisar los terminos del proyecto asrjs para la libreria.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion por terceros.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/ysdede/qwen3-asr-0.6b-onnx
- Modelo upstream: https://huggingface.co/Qwen/Qwen3-ASR-0.6B/tree/5eb144179a02acc5e5ba31e748d22b0cf3e303b0
- Notas de portado de Qwen3-ASR en asrjs: https://github.com/asrjs/speech-recognition/tree/main/tools/model-debugging/reference/qwen3-asr-0.6b
- Matriz de modelos (informe de handoff): https://github.com/asrjs/speech-recognition/blob/main/docs/reports/HANDOFF-MODERN-MODELS-2026-10-25.md#historical-checkpoint-modern-model-e2e-matrix
- Manifiesto de artefactos: `asrjs-manifest.json` dentro del repositorio (nombres de fichero y digests SHA-256)

Nota: la busqueda web realizada no devolvio resultados tecnicos relevantes sobre este modelo; los enlaces anteriores son los unicos verificadoos a partir de la informacion proporcionada.
