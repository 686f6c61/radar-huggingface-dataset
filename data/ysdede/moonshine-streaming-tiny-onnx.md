# ysdede/moonshine-streaming-tiny-onnx

## Resumen

Moonshine Streaming Tiny — asr.js ONNX bundle es un empaquetado ONNX del modelo de reconocimiento automatico de habla (ASR) Moonshine Streaming Tiny, publicado en Hugging Face por el usuario ysdede. No se trata de un modelo nuevo, sino de una exportacion remapeada del modelo original de Moonshine AI (`moonshine-ai/moonshine-streaming-tiny`, revision `f8e9dfd`) en formato FP32, compuesta por cuatro grafos: encoder, encoder por chunks, decoder prefill y decoder step, junto con datos externos y ficheros de preprocesado.

Su proposito es permitir la ejecucion de la variante streaming de Moonshine Tiny dentro de asr.js, un runtime de ASR en JavaScript, distinguiendose del Moonshine Tiny offline. Esto resuelve el problema de desplegar transcripcion de habla en tiempo real en entornos de navegador o Node.js sin depender de Python. La licencia es MIT, heredada del repositorio de origen, lo que lo hace apto para uso comercial. Es un proyecto experimental con descargas muy limitadas (31 en el momento de la ficha) y validacion parcial, por lo que conviene tratarlo como material de evaluacion mas que como componente de produccion maduro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder para ASR (arquitectura detallada no disponible) |
| Parametros totales | no disponible (variante "tiny"; tamano del repo: 0,5 GB) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (modelo streaming por chunks) |
| Tipos de cuantizacion | FP32 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | ONNX (cuatro grafos con datos externos) |

## Arquitectura y entrenamiento

El empaquetado contiene cuatro grafos ONNX independientes: un encoder completo, un encoder por chunks para procesamiento streaming, un decoder con prefill y un decoder por pasos (step). Esta separacion en grafos es tipica de los modelos de ASR streaming, donde el audio se procesa en ventanas incrementales y la decodificacion autoregresiva se ejecuta token a token, evitando recalcular todo el contexto en cada paso. La model card no detalla la arquitectura interna del modelo base (numero de capas, dimensiones, tipo de attention), por lo que esos datos no estan disponibles.

Sobre el entrenamiento del modelo original, la informacion de esta ficha no incluye datos: no se especifican tokens de entrenamiento, composicion del dataset ni uso de tecnicas de alineamiento. Lo que si documenta el autor del bundle es el proceso de exportacion: se trata de un remapeado personalizado de los grafos del modelo fuente, con hashes de exportacion registrados en `asrjs-provenance.json` (sin rutas locales) y un manifiesto `asrjs-manifest.json` con el hash de cada fichero incluido. El layout de datos externos y el mapeo de grafos son especificos del runtime asr.js y no son directamente reutilizables en otros runtimes ONNX sin adaptacion.

## Capacidades

- Transcripcion automatica de habla (ASR) en modo streaming, procesando audio de forma incremental mediante el encoder por chunks y el decoder por pasos.
- Ejecucion en JavaScript mediante el adaptador streaming de Moonshine de asr.js, orientado a entornos de navegador o Node.js.
- Pesos en FP32 sin cuantizar, lo que maximiza la fidelidad numerica respecto al modelo original (a costa de tamano y velocidad).
- Procedencia verificable: hashes de grafos y ficheros registrados en ficheros JSON de manifiesto y provenance.
- No hay evidencia de capacidades adicionales (vision, audio generativo, tool calling, agentes o soporte multilingue explicito); el modelo se limita a ASR.

## Casos de uso

- Transcripcion en tiempo real en el navegador: el diseño streaming (encoder por chunks + decoder por pasos) permite mostrar hipotesis parciales mientras el usuario habla, sin enviar audio a un servidor.
- Subtitulado en directo para aplicaciones web: el procesamiento incremental por chunks es adecuado para generar subtitulos con baja latencia en reuniones, clases o retransmisiones.
- Asistentes de voz locales: al ejecutarse via asr.js en el cliente, puede integrarse como capa de escucha en asistentes que respeten la privacidad del usuario.
- Prototipado de pipelines ASR en JavaScript: el bundle esta diseñado especificamente para el adaptador streaming de asr.js, lo que facilita pruebas rapidas sin backend Python.
- Dictado en aplicaciones de productividad web: la variante tiny es adecuada para dispositivos con recursos limitados donde el tamano del modelo es un factor critico.
- Evaluacion e investigacion de ASR streaming en navegador: la trazabilidad de hashes y el manifiesto permiten auditar exactamente que pesos se ejecutan, util para comparativas de backends (WebGPU, WASM).
- Transcripcion de notas de voz en apps offline: al ser un bundle local con licencia MIT, puede integrarse en aplicaciones que funcionen sin conexion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo aporta datos de validacion funcional del bundle: 13 de 18 flujos de prueba con pesos reales pasaron correctamente; la captura manual y la grabacion en Playground devolvieron salidas vacias con entrada con padding, y el VAD FireRed con WebGPU omitio una palabra. Estos resultados no certifican la precision del modelo en microfonos fisicos ni en todas las combinaciones de backend.

## Requisitos de hardware

- VRAM/RAM estimada: no disponible con precision; el repo ocupa 0,5 GB en FP32, por lo que cabe esperar un consumo de memoria del orden de varios cientos de MB para pesos y activaciones, accesible para equipos de escritorio y portatiles convencionales.
- GPU recomendadas: no disponible; al estar orientado a asr.js, es plausible su ejecucion en GPU de consumo via WebGPU, aunque la validacion solo cubre parcialmente este backend.
- Consumer GPUs: al ser un modelo "tiny" en FP32, deberia ejecutarse sin problemas en GPUs de consumo modernas (por ejemplo, RTX 3060 o superiores) y probablemente incluso en CPU, aunque no hay mediciones publicadas.
- Despliegue: el uso previsto es exclusivamente el adaptador local de artefactos de asr.js; el mapeo de grafos y el layout de datos externos son especificos de ese runtime. No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; al ser un modelo streaming tiny, el diseño apunta a baja latencia incremental, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Formato | Streaming | Licencia | Orientacion runtime | Notas |
|---|---|---|---|---|---|
| ysdede/moonshine-streaming-tiny-onnx | ONNX FP32 (4 grafos) | Si | MIT | asr.js (JavaScript) | Bundle experimental, validacion parcial (13/18 flujos) |
| moonshine-ai/moonshine-streaming-tiny | Pesos originales (no ONNX) | Si | MIT | Ecosistema Moonshine / Python | Modelo fuente de este bundle |
| Moonshine Tiny (offline) | Pesos originales | No | MIT | Ecosistema Moonshine | Variante offline, distinta de esta streaming |

No hay datos de rendimiento comparables publicados para estas variantes en la informacion disponible.

## Limitaciones y advertencias

- Estado experimental: los grafos estan marcados como tales y la validacion con pesos reales es parcial (13 de 18 flujos de prueba superados).
- Fallos documentados: entrada con padding produce salidas vacias en captura manual y Playground; el VAD FireRed con WebGPU omitio una palabra en las pruebas.
- La validacion realizada no certifica el funcionamiento con microfonos fisicos reales, la precision general del modelo ni todas las combinaciones de backend.
- Compatibilidad limitada: el mapeo de grafos y el layout de datos externos son especificos del runtime asr.js; no se garantiza el funcionamiento en otros runtimes ONNX (onnxruntime, etc.) sin adaptacion.
- Idiomas soportados no documentados en esta ficha; el modelo base Moonshine se asocia tradicionalmente al ingles, pero conviene verificarlo en el repositorio fuente antes de usarlo con otros idiomas.
- Riesgo de alucinacion tipico de modelos ASR small: en silencios o audio con padding puede generar texto vacio o erroneo, como muestran las pruebas de la model card.
- Licencia MIT: sin restricciones de uso comercial relevantes, aunque se debe conservar la atribucion incluida en el fichero LICENSE.
- Proyecto con traccion minima (31 descargas, 1 like), sin comunidad ni soporte consolidado; para produccion conviene evaluar primero el repositorio oficial de Moonshine AI.

## Enlaces

- Ficha del bundle en Hugging Face: https://huggingface.co/ysdede/moonshine-streaming-tiny-onnx
- Modelo fuente: https://huggingface.co/moonshine-ai/moonshine-streaming-tiny/tree/f8e9dfd8c562c257c151a907b7b7f2fe8ff8511a
- Manifiesto de ficheros y hashes: https://huggingface.co/ysdede/moonshine-streaming-tiny-onnx/blob/main/asrjs-manifest.json
- Registro de procedencia de grafos: https://huggingface.co/ysdede/moonshine-streaming-tiny-onnx/blob/main/asrjs-provenance.json
- Licencia incluida: https://huggingface.co/ysdede/moonshine-streaming-tiny-onnx/blob/main/LICENSE
