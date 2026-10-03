# transcriber-app/parakeet-tdt-0.6b-v2-mlx-8bit

## Resumen

parakeet-tdt-0.6b-v2-mlx-8bit es una redistribucion cuantizada a 8 bits del modelo de reconocimiento automatico del habla NVIDIA Parakeet TDT 0.6B v2, adaptada al formato MLX para su ejecucion en hardware Apple Silicon. El modelo original lo desarrolla NVIDIA; la conversion a MLX la realiza mlx-community a traves de la libreria parakeet-mlx, y la cuantizacion la publica el usuario transcriber-app. Su objetivo es habilitar transcripcion de voz a texto totalmente local (on-device) en ordenadores Mac, sin depender de servicios en la nube ni de GPU NVIDIA.

Se trata de un modelo de 617.869.958 parametros (aproximadamente 618 millones) con arquitectura FastConformer combinada con un decodificador TDT (Token-and-Duration Transducer), una variante del esquema RNN-T que predice simultaneamente el token y su duracion, lo que acelera la decodificacion. Esta pensado exclusivamente para ingles y se distribuye bajo licencia CC-BY-4.0, lo que permite uso comercial con atribucion.

Su relevancia actual radica en que reduce el peso de los pesos de 2,5 GB en fp32 a 734 MB, manteniendo transcripciones identicas al modelo sin cuantizar segun las comprobaciones del autor. Esto lo hace viable en equipos con memoria unificada modesta, un escenario habitual en flujos de trabajo de privacidad estricta o sin conectividad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (encoder) + TDT (Token-and-Duration Transducer, decoder) |
| Parametros totales | 617.869.958 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; equivale a la duracion maxima de audio y no se indica en la informacion disponible) |
| Tipos de cuantizacion | 8 bits (este repositorio); existen builds de 6 bits y 4 bits en repositorios hermanos |
| Idiomas soportados | ingles (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (layout MLX), mas config.json, vocab.txt, tokenizer.model, tokenizer.vocab |
| Parametros de cuantizacion | 8 bits, group size 64, esquema affine |
| Modulos cuantizados | 221 modulos (capas Linear y Embedding: proyecciones de atencion y feed-forward, proyecciones pre-encode y joint, embedding de la red de prediccion) |
| Precision del resto de tensores | bfloat16 (convoluciones, LSTM, normalizacion) |
| Tamano del repositorio | 0,7 GB (pesos: 734 MB, frente a 2,5 GB en fp32) |
| Libreria | mlx |
| Pipeline | automatic-speech-recognition |

## Arquitectura y entrenamiento

La arquitectura es una combinacion de dos componentes: un encoder FastConformer, variante eficiente de Conformer que reduce el coste computacional mediante subsampling de la secuencia de entrada, y un decodificador TDT. El decodificador TDT extiende el esquema clasico RNN-T anadiendo una prediccion conjunta de la duracion del token, lo que permite emitir varios tokens por paso de decodificacion y reducir la latencia frente a un RNN-T convencional. El modelo es un sistema transducer completo de extremo a extremo que mapea audio a texto sin necesidad de un modelo de lenguaje externo en el momento de la inferencia.

En cuanto al proceso de conversion de este repositorio, se parte de los pesos fp32 de mlx-community/parakeet-tdt-0.6b-v2 y se cuantizan con mlx.nn.quantize todas las capas Linear y Embedding (221 modulos) a 8 bits con group size 64 y esquema affine. El resto de tensores (convoluciones, LSTM y capas de normalizacion) se almacenan en bfloat16. Los nombres de los tensores no cambian respecto al checkpoint origen, y config.json incorpora un bloque `quantization` con `group_size: 64` y `bits: 8`, de modo que los cargadores que lean el layout de mlx-community y respeten ese bloque pueden cargar el modelo directamente. No se ha realizado ningun reentrenamiento ni ajuste fino: es una transformacion puramente numerica de los pesos. No se dispone de informacion sobre el dataset de entrenamiento original ni sobre el uso de RLHF/DPO en la informacion proporcionada.

## Capacidades

- Reconocimiento automatico del habla (ASR) en ingles: transcripcion de audio a texto.
- Ejecucion local en Apple Silicon mediante MLX, sin conexion a red.
- Cuantizacion a 8 bits que reduce el peso del modelo en aproximadamente un 70 % respecto a fp32.
- Compatibilidad con el layout de mlx-community y con la libreria parakeet-mlx para su carga.
- Tool calling / function calling: no aplicable (no es un modelo generativo conversacional).
- Soporte de agentes y razonamiento multi-paso: no aplicable.
- Capacidades multilingues: no, el modelo es exclusivamente en ingles.
- Capacidades especiales: decodificacion TDT con prediccion conjunta de token y duracion; no incorpora vision, audio generativo ni modo "thinking".

## Casos de uso

- Transcripcion local de reuniones en Mac: el modelo procesa audio en el propio equipo gracias al backend MLX, evitando enviar grabaciones confidenciales a servicios externos. Es adecuado porque su huella de 734 MB permite mantenerlo cargado en memoria mientras se usa el ordenador para otras tareas.
- Dictado en aplicaciones de escritorio: integracion en editores de texto o herramientas de notas de macOS para convertir voz en texto en tiempo real, con la ventaja de no depender de una API remota.
- Generacion de subtitulos offline: transcripcion de videos o clases grabadas para producir ficheros de subtitulos, con la licencia CC-BY-4.0 permitiendo su uso en productos comerciales siempre que se atribuya.
- Procesamiento por lotes de podcasts y entrevistas: transcripcion de archivos de audio extensos en pipelines automatizados en un Mac, reduciendo coste frente a APIs de pago por minuto.
- Indexacion y busqueda de contenido en archivos de audio: convertir un archivo historico de grabaciones a texto para permitir busqueda por palabras clave y recuperacion de informacion.
- Asistentes de voz embebidos en aplicaciones para macOS o iOS: uso como componente ASR en aplicaciones nativas de Apple, aprovechando que MLX esta optimizado para el silicio de Apple.
- Accesibilidad: transcripcion en directo para personas con discapacidad auditiva en entornos donde no hay conectividad garantizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que, en comprobaciones con voz en ingles, las transcripciones fueron identicas a las del modelo fp32, pero no se ha ejecutado ninguna medicion de WER sobre esta build cuantizada. Cualquier cifra de WER correspondiente al modelo base NVIDIA no debe extrapolarse sin verificacion empirica sobre esta version.

## Requisitos de hardware

- VRAM/memoria unificada estimada: los pesos ocupan 734 MB. Con activaciones y buffers de decodificacion, la huella práctica deberia situarse por debajo de 2 GB, aunque no se han publicado mediciones oficiales.
- GPU compatibles: exclusivamente Apple Silicon (familias M1, M2, M3 y M4) mediante Metal y el framework MLX. Este artefacto no esta preparado para CUDA.
- Cabe en GPU de consumo: si, en cualquier Mac con Apple Silicon y memoria unificada de 8 GB o superior. No es ejecutable directamente en GPUs NVIDIA o AMD con este repositorio.
- Opciones de despliegue: libreria MLX y parakeet-mlx. vLLM, llama.cpp, Ollama y TGI no son aplicables a este formato. Para CUDA seria necesario recurrir al modelo original de NVIDIA con NeMo.
- Latencia y throughput: no disponible. No se han publicado mediciones de RTF (real-time factor) ni de velocidad de decodificacion para esta build.

## Comparativa con modelos similares

| Modelo | Parametros | Formato / libreria | Idioma | Licencia | Tamano de pesos |
|---|---|---|---|---|---|
| transcriber-app/parakeet-tdt-0.6b-v2-mlx-8bit | 618 M | safetensors / MLX | en | CC-BY-4.0 | 734 MB |
| transcriber-app/parakeet-tdt-0.6b-v2-mlx-6bit | 618 M | safetensors / MLX | en | CC-BY-4.0 | no disponible |
| transcriber-app/parakeet-tdt-0.6b-v2-mlx-4bit | 618 M | safetensors / MLX | en | CC-BY-4.0 | no disponible |
| mlx-community/parakeet-tdt-0.6b-v2 | 618 M | safetensors / MLX | en | CC-BY-4.0 | aproximadamente 2,5 GB (fp32) |
| nvidia/parakeet-tdt-0.6b-v2 | 618 M | NeMo / PyTorch | en | CC-BY-4.0 | no disponible |

Como referencia externa, los modelos de la familia Whisper (por ejemplo large-v3, con alrededor de 1550 millones de parametros) cubren mas de 90 idiomas bajo licencia MIT y ventanas de audio de 30 segundos, pero no comparten la arquitectura transducer ni el formato MLX; los datos concretos de esa familia no forman parte de la informacion proporcionada en esta busqueda.

## Limitaciones y advertencias

- Idioma: el modelo es exclusivamente en ingles. No soporta castellano ni ningun otro idioma.
- No es un modelo generativo: no admite instrucciones, tool calling, agentes ni razonamiento multi-paso. Solo transcribe audio.
- Riesgo de alucinacion: como todo modelo ASR, puede producir transcripciones incorrectas con audio ruidoso, acentos no vistos en entrenamiento, solapamiento de voces o terminologia especializada. No se ha medido el WER de esta build.
- Validacion limitada: la unica comprobacion reportada es la igualdad de transcripciones con fp32 en voz inglesa, sin benchmark formal ni evaluacion sobre conjuntos de test estandar.
- Plataforma: requiere Apple Silicon y el framework MLX. No funciona en Windows, Linux con GPU NVIDIA ni en entornos de servidor convencionales sin cambiar de artefacto.
- Licencia: CC-BY-4.0 permite uso comercial, pero exige atribucion a NVIDIA (modelo), mlx-community (conversion MLX) y al autor de la cuantizacion, ademas de indicar si se han realizado modificaciones.
- Produccion: al ser un repositorio sin descargas ni validacion de la comunidad, conviene verificar la calidad en el dominio concreto antes de desplegarlo.
- La fecha de creacion del repositorio que figura en los metadatos es posterior a la fecha habitual de publicacion; conviene confirmar la vigencia del artefacto antes de integrarlo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/transcriber-app/parakeet-tdt-0.6b-v2-mlx-8bit
- Modelo base NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v2
- Conversion MLX de mlx-community: https://huggingface.co/mlx-community/parakeet-tdt-0.6b-v2
- Libreria parakeet-mlx: https://github.com/senstella/parakeet-mlx
- Build de 6 bits: https://huggingface.co/transcriber-app/parakeet-tdt-0.6b-v2-mlx-6bit
- Build de 4 bits: https://huggingface.co/transcriber-app/parakeet-tdt-0.6b-v2-mlx-4bit
