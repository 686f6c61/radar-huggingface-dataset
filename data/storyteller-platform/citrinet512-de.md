# storyteller-platform/citrinet512-de

## Resumen

Citrinet 512 German es un modelo de reconocimiento automatico del habla (ASR) para aleman, publicado por storyteller-platform como espejo del modelo original de neongeckocom. Se trata de una red Citrinet de 512 canales, una arquitectura convolucional de tipo 1D con bloques residuales y squeeze-and-excitation, pensada para transcripcion de voz en entornos de bajos recursos y despliegue local. El repositorio distribuye los pesos en dos formatos: ONNX (con el front end mel integrado) y safetensors en el layout que espera el cargador de MLX.

El modelo no es un LLM ni un modelo generativo de texto: es un sistema de reconocimiento de voz que convierte audio en transcripciones. Su relevancia radica en que Storyteller lo instala a traves de su herramienta ghost-story para tareas de transcripcion dentro de su plataforma, y en que el modelo base de neongeckocom esta entrenado sobre el corpus aleman de Common Voice, lo que lo hace util para transcripcion de voz cotidiana en aleman.

El tamano del repositorio es de 0,3 GB, lo que refleja un modelo compacto y apto para inferencia en CPU o GPU modesta. La licencia BSD-3-Clause permite uso comercial con atribucion, lo que facilita su integracion en productos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Citrinet (convolucional 1D con bloques residuales y squeeze-and-excitation) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR, no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos ONNX y safetensors en precision original) |
| Idiomas soportados | aleman (de) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX (model.onnx con front end mel integrado) y safetensors (model.safetensors, layout MLX) |

## Arquitectura y entrenamiento

Citrinet es una arquitectura convolucional para ASR que combina convoluciones 1D con bloques residuales, conexiones de tipo squeeze-and-excitation y un decodificador CTC. El modelo aqui distribuido tiene 512 canales, segun indica el nombre, y proviene del modelo original `neongeckocom/stt_de_citrinet_512_gamma_0_25`, que fue exportado a ONNX por OpenVoiceOS. El repositorio de storyteller-platform no reentrena el modelo: solo lo convierte y lo empaqueta en dos formatos.

El ONNX incluido integra el front end mel delante del encoder, de modo que acepta la senal pre-enfatizada y con padding reflectante, y calcula internamente las caracteristicas mel y su longitud. El safetensors contiene los pesos del encoder en el layout que espera el cargador de MLX, junto con el filtro mel y la ventana del front end de NeMo. El vocabulario (`vocab.txt`) se mantiene sin cambios y el tokenizador (`tokenizer.spm`) es el modelo SentencePiece original. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo etapas de ajuste fino adicionales mas alla de lo indicado en la model card original.

## Capacidades

- Reconocimiento automatico del habla en aleman: transcripcion de audio a texto mediante decodificacion CTC.
- Procesamiento de audio con front end mel integrado en la exportacion ONNX (pre-enfasis y padding reflectante incluidos).
- Inferencia en dos runtimes: ONNX Runtime (formato `onnx`) y MLX (formato `mlx` con safetensors).
- Tokenizacion SentencePiece compatible con el modelo original.
- No soporta tool calling, function calling ni agentes multi-paso.
- No es un modelo generativo de texto ni tiene modo de razonamiento o thinking.
- No soporta vision, audio mas alla de ASR ni otras modalidades.

## Casos de uso

- Transcripcion de reuniones y notas de voz en aleman: el modelo convierte audio en texto con una arquitectura convolucional ligera, adecuada para procesar grabaciones en local sin depender de servicios en la nube.
- Subtitulado automatico de contenido audiovisual en aleman: al ser un modelo compacto (0,3 GB), puede ejecutarse en un servidor modesto para generar subtitulos de videos o podcasts.
- Integracion en la plataforma Storyteller: el modelo se instala mediante ghost-story y se usa para las tareas de transcripcion de la plataforma, por lo que encaja directamente en ese ecosistema.
- Asistentes de voz embebidos en aleman: la arquitectura Citrinet esta disenada para eficiencia computacional, lo que permite desplegarla en dispositivos con recursos limitados para comandos de voz.
- Analisis de llamadas de atencion al cliente: transcripcion por lotes de grabaciones telefonicas en aleman para su posterior analisis de calidad o mineria de texto.
- Accesibilidad: generacion de transcripciones en tiempo casi real para personas con discapacidad auditiva en contextos de habla alemana, usando el runtime ONNX en CPU o GPU modesta.
- Investigacion en ASR: punto de partida para fine-tuning sobre dominios especificos en aleman (medico, legal, tecnico) gracias a la licencia permisiva BSD-3-Clause.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio ocupa 0,3 GB, por lo que la huella de memoria es reducida y cabe holgadamente en GPUs de gama baja.
- GPU recomendadas: cualquier GPU consumer moderna (GTX 1060, RTX 2060, RTX 3060, RTX 4090) es suficiente; tambien puede ejecutarse en CPU.
- Cabe en GPU consumer: si, practicamente en cualquier GPU consumer con al menos 2 GB de VRAM.
- Opciones de despliegue: ONNX Runtime (formato `onnx`), MLX (formato `mlx` en Apple Silicon), e integracion mediante ghost-story de Storyteller.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Citrinet 512 German (este) | no disponible | no aplica | aleman | BSD-3-Clause | ONNX, safetensors |
| neongeckocom/stt_de_citrinet_512_gamma_0_25 | no disponible | no aplica | aleman | BSD-3-Clause | NeMo, ONNX |
| OpenVoiceOS/neongeckocom-stt_de_citrinet_512_gamma_0_25_onnx | no disponible | no aplica | aleman | BSD-3-Clause | ONNX |
| Whisper (variantes de OpenAI) | 39M–1,55B | 30 s de audio | multilingue | MIT | PyTorch, ONNX, GGML |

La comparativa con Whisper es cualitativa: Whisper es un modelo encoder-decoder transformer multilingue con ventanas de 30 segundos, mientras que Citrinet es una red convolucional CTC especifica para aleman y mas ligera. No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta aleman; no es multilingue.
- Es un modelo ASR, no un modelo de lenguaje: no genera texto libre ni mantiene conversaciones.
- Riesgo de errores de transcripcion en audio con ruido, acentos marcados o vocabulario tecnico no visto en entrenamiento.
- No se dispone de informacion sobre sesgos especificos del dataset de entrenamiento (el modelo original se entrena tipicamente con Common Voice, pero esto no se confirma en la informacion proporcionada).
- La licencia BSD-3-Clause permite uso comercial con atribucion, pero es necesario conservar el aviso de copyright y la clausula de exencion de responsabilidad.
- El repositorio es un espejo de un modelo de terceros; la calidad y el mantenimiento dependen del modelo original de neongeckocom.
- No se han publicado metricas de WER ni de rendimiento en la informacion disponible, por lo que la evaluacion en produccion requiere pruebas propias.

## Enlaces

- Hugging Face: https://huggingface.co/storyteller-platform/citrinet512-de
- Modelo original: https://huggingface.co/neongeckocom/stt_de_citrinet_512_gamma_0_25
- Exportacion ONNX original: https://huggingface.co/OpenVoiceOS/neongeckocom-stt_de_citrinet_512_gamma_0_25_onnx
- Repositorio Storyteller (scripts de conversion): https://gitlab.com/storyteller-platform/storyteller/-/tree/main/libraries/mlx-audio/scripts
- Registro de modelos Storyteller: https://gitlab.com/storyteller-platform/storyteller/-/ml/models/citrinet512-de
