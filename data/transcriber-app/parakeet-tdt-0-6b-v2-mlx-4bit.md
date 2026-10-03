# transcriber-app/parakeet-tdt-0.6b-v2-mlx-4bit

## Resumen

`transcriber-app/parakeet-tdt-0.6b-v2-mlx-4bit` es una redistribucion cuantizada a 4 bits del modelo de reconocimiento automatico del habla (ASR) NVIDIA Parakeet TDT 0.6B v2, adaptada al formato MLX de Apple para inferencia local en silicio de Apple. Lo publica el usuario `transcriber-app` partiendo de los pesos fp32 de `mlx-community/parakeet-tdt-0.6b-v2`, y su proposito es reducir drasticamente el peso en disco y en memoria (de 2,5 GB a unos 0,47 GB) manteniendo la transcripcion de audio en ingles.

El modelo conserva la arquitectura del original: un codificador FastConformer con decodificador TDT (Token-and-Duration Transducer), con 617.869.958 parametros totales. No es un modelo de lenguaje generativo, sino un sistema especializado de speech-to-text que trabaja exclusivamente con audio en ingles. Su relevancia actual esta en habilitar transcripcion precisa en portatiles Apple sin GPU dedicada, con un consumo de memoria muy contenido.

La cuantizacion afecta a 221 modulos `Linear` y `Embedding` (proyecciones de atencion, feed-forward, pre-encode y joint, y el embedding de la red de prediccion), mientras que convoluciones, LSTM y normalizaciones se mantienen en bfloat16. El autor indica que no se ha ejecutado ninguna prueba de WER sobre esta build concreta, solo una comparacion cualitativa frente a fp32.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (codificador) + decodificador TDT (Token-and-Duration Transducer) |
| Parametros totales | 617.869.958 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | 4 bits afina (affine), group size 64, para 221 modulos Linear y Embedding; resto de tensores en bfloat16. Existen builds 6-bit y 8-bit del mismo autor |
| Idiomas soportados | ingles (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (layout MLX) |

## Arquitectura y entrenamiento

El modelo es una conversion de `nvidia/parakeet-tdt-0.6b-v2` y hereda su diseno: un codificador FastConformer, variante de Conformer optimizada para secuencias de audio largas con atencion de submuestreo, y un decodificador TDT. El decodificador TDT es una variante de transducer que predice conjuntamente el token y su duracion, lo que permite emitir varios tokens por paso de decodificacion y mejora la eficiencia frente a CTC o transducers clasicos. No se dispone en la informacion proporcionada de los detalles del dataset de entrenamiento original, el numero de horas de audio, ni el uso de tecnicas como RLHF o DPO (no aplicables tipicamente a un modelo ASR puro).

Lo especifico de esta build es la cuantizacion: partiendo de los pesos fp32 de la conversion MLX de la comunidad, se cuantizan 221 modulos `Linear` y `Embedding` con `mlx.nn.quantize` a 4 bits con group size 64, y `config.json` incorpora el bloque `quantization` con `group_size: 64` y `bits: 4`. Los nombres de tensores se mantienen identicos al checkpoint de origen, de modo que los cargadores que respetan el bloque `quantization` (cuantizando los modulos cuyos pesos llegan con `.scales`) pueden cargarlo directamente. El resto de tensores (convoluciones, LSTM y normalizacion) se almacenan en bfloat16.

## Capacidades

- Reconocimiento automatico del habla (ASR) sobre audio en ingles, convirtiendo voz en texto.
- Inferencia en dispositivo (on-device) sobre silicio de Apple mediante MLX, sin necesidad de GPU dedicada ni entorno CUDA.
- Modelo especializado y no generativo: no realiza generacion de texto libre, razonamiento, codigo, matematicas ni tareas multimodales.
- Soporte de tool calling / function calling: no disponible (no es una capacidad de un modelo ASR).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no, unicamente ingles.
- Capacidades especiales: no se documentan en la informacion proporcionada (por ejemplo, puntuacion, mayusculas o timestamps por palabra no se confirman en esta model card).

## Casos de uso

- Transcripcion de notas de voz y reuniones en local: al ser on-device y ocupar unos 0,47 GB de pesos, puede transcribir audio en ingles en un Mac sin enviar datos a la nube, util para entornos con requisitos de privacidad.
- Subtitulado de contenido en ingles: integrable en un pipeline de post-produccion que convierta pistas de audio a texto para generar subtitulos, aprovechando el bajo coste de memoria para procesar lotes largos.
- Dictado en aplicaciones de escritorio para macOS: al usar MLX y no requerir GPU externa, encaja como motor de speech-to-text embebido en apps nativas de Apple.
- Asistentes de voz de baja latencia: el decodificador TDT esta disenado para ser eficiente en decodificacion, lo que lo hace adecuado para entradas de voz en tiempo (casi) real en hardware de consumo.
- Preprocesado de corpus de audio en ingles: convertir grandes volumenes de grabaciones a texto en una maquina con Apple silicon antes de un analisis posterior (busqueda, indexado, clasificacion).
- Prototipado e investigacion en ASR: su tamano reducido y formato abierto permiten experimentar con cuantizacion (comparando las builds 4, 6 y 8 bits) sin grandes recursos de computo.
- Despliegue en dispositivos con memoria limitada: al reducir el peso de 2,5 GB a 467 MB, habilita transcripcion en equipos donde la version fp32 no cabria con holgura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (WER u otros) en la informacion disponible. La model card indica explicitamente que no se ha ejecutado ninguna prueba de WER sobre esta build. El unico dato de validacion aportado es cualitativo: frente a la build fp32 sobre habla en ingles, las transcripciones coincidieron salvo en el espaciado de una palabra.

## Requisitos de hardware

- Peso en disco de los pesos cuantizados: 467 MB (frente a 2,5 GB de la version fp32).
- VRAM/memoria unificada estimada: aproximadamente 0,5 GB para los pesos, mas el overhead de activaciones y del runtime de MLX; no disponible una cifra exacta de pico.
- Hardware objetivo: chips de Apple (familia M) mediante el framework MLX. Al estar en formato MLX, no esta pensado para GPUs NVIDIA/CUDA.
- Cabe en GPU de consumo: no aplica en el sentido CUDA; si cabe holgadamente en cualquier Mac con memoria unificada de 8 GB o superior.
- Opciones de despliegue: MLX (libreria `mlx`); el ecosistema de conversion de referencia es `parakeet-mlx` (senstella). No se documentan despliegues via vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Peso en disco | Idiomas | Licencia |
|---|---|---|---|---|---|
| parakeet-tdt-0.6b-v2-mlx-4bit (este) | 617,9 M | 4 bits (group 64) + bfloat16 | 467 MB | en | CC-BY-4.0 |
| parakeet-tdt-0.6b-v2-mlx-8bit | 617,9 M | 8 bits | no disponible | en | CC-BY-4.0 |
| parakeet-tdt-0.6b-v2-mlx-6bit | 617,9 M | 6 bits | no disponible | en | CC-BY-4.0 |
| mlx-community/parakeet-tdt-0.6b-v2 | 617,9 M | fp32 | 2,5 GB | en | CC-BY-4.0 |
| nvidia/parakeet-tdt-0.6b-v2 (origen) | 617,9 M | fp32 (NeMo) | no disponible | en | CC-BY-4.0 |

No se dispone en la informacion proporcionada de resultados de rendimiento (WER) para comparar la precision entre estas variantes.

## Limitaciones y advertencias

- Solo soporta ingles; no transcribe otros idiomas.
- Es un modelo ASR especializado, no un modelo de lenguaje: no genera texto, no razona, no escribe codigo ni realiza tareas de proposito general.
- No se ha medido el WER de esta build cuantizada; existe el riesgo de que la cuantizacion a 4 bits degrade la precision frente a fp32 en condiciones de audio dificiles (ruido, acentos, dominio especifico).
- Riesgo de errores de transcripcion y de alucinacion de texto en audio ambiguo o silencioso, propio de los modelos ASR.
- Limite maximo de duracion de audio por segmento: no disponible; conviene trocear audios largos segun lo que permita el runtime.
- Formato MLX: dependencia del ecosistema Apple, no ejecutable directamente en CUDA sin conversion.
- Licencia CC-BY-4.0: permite uso comercial con atribucion; hay que conservar los creditos a NVIDIA, mlx-community y este repositorio de cuantizacion.
- Build con 0 descargas y 0 likes en el momento de la ficha; sin validacion de la comunidad, conviene verificar la calidad antes de usarla en produccion.
- Se trata de una redistribucion de un modelo modificado, no de un entrenamiento propio; la calidad final depende del checkpoint de origen.

## Enlaces

- HuggingFace (este modelo): https://huggingface.co/transcriber-app/parakeet-tdt-0.6b-v2-mlx-4bit
- Build 8-bit: https://huggingface.co/transcriber-app/parakeet-tdt-0.6b-v2-mlx-8bit
- Build 6-bit: https://huggingface.co/transcriber-app/parakeet-tdt-0.6b-v2-mlx-6bit
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v2
- Conversion MLX de la comunidad: https://huggingface.co/mlx-community/parakeet-tdt-0.6b-v2
- Repositorio de conversion parakeet-mlx: https://github.com/senstella/parakeet-mlx
