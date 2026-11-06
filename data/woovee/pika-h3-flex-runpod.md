# Woovee/pika-h3-flex-runpod

## Resumen

Pika H3 Flex — Woovee Studio runtime package es un paquete de pesos empaquetado por Woovee para su uso en ComfyUI sobre infraestructura Runpod. No se trata de un modelo entrenado desde cero, sino de una reunión de ficheros upstream sin modificar procedentes de tres fuentes: los transformadores oficiales de MiniMax H3 (variantes FL2VA y Ref2VA en INT8 ConvRot), los adaptadores de Pika H3 Flex y una fusión comunitaria de adaptadores Turbo de cuatro pasos. El paquete incluye además el encoder Qwen3-VL en NVFP4-AWQ, los VAE de vídeo y audio, y los adaptadores oficiales de seis pasos de Pika.

El modelo resuelve la generación de vídeo con audio sincronizado a partir de imagen y texto (pipeline `image-text-to-video`), con salida nativa a 24 FPS. Su relevancia radica en que agrupa en un único repositorio todos los componentes necesarios para ejecutar el pipeline en producción, con un `manifest.json` que registra procedencia, tamaños y hashes SHA256 de cada fichero. El repositorio ocupa 72,8 GB.

Es importante señalar que la variante "Fast" es una fusión comunitaria y no un lanzamiento oficial de Pika; las mediciones de velocidad publicadas por el upstream no garantizan el mismo rendimiento en otros GPUs. El paquete no incluye el upsampler 4K alojado de Pika ni la separación de pistas de audio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion para generacion de video con audio (derivado de MiniMax H3); incluye encoder Qwen3-VL, VAE de video y VAE de audio |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 ConvRot (transformadores FL2VA y Ref2VA); NVFP4-AWQ (encoder Qwen3-VL) |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license-agreement (con restricciones territoriales); el encoder Qwen conserva Apache 2.0 |
| Formato de pesos | safetensors (INT8 ConvRot y NVFP4-AWQ), segun el manifest del repositorio |

## Arquitectura y entrenamiento

El paquete ensambla componentes de un pipeline de difusion para generacion conjunta de video y audio. Los transformadores principales provienen de MiniMax H3 en sus variantes FL2VA (first-last frame to video+audio) y Ref2VA (reference to video+audio), cuantizados a INT8 con la transformacion ConvRot. El encoder de texto es Qwen3-VL en formato NVFP4-AWQ, y se incluyen dos VAE separados, uno para video y otro para audio, lo que permite generar ambas modalidades de forma sincronizada.

Sobre el modelo base se aplican adaptadores LoRA de Pika H3 Flex: los oficiales de seis pasos, que emplean el schedule LCM/ManualSigmas exacto de Pika, y la fusion comunitaria Turbo de cuatro pasos de akhaliq con rango completo, destilada por LightX2V. Las familias de adaptadores y transformadores deben coincidir, y no deben apilarse los adaptadores oficiales y los Turbo en la misma ejecucion. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en la informacion proporcionada.

## Capacidades

- Generacion de video a partir de imagen y texto (image-text-to-video), con soporte de condicionamiento por primer y ultimo fotograma (FL2VA) y por imagen de referencia (Ref2VA).
- Generacion de audio sincronizado con el video, con salida nativa a 24 FPS.
- Ejecucion en dos regimenes de pasos: seis pasos con los adaptadores oficiales de Pika y cuatro pasos con la fusion Turbo comunitaria.
- Integracion con ComfyUI como entorno de ejecucion.
- Codificacion de texto mediante Qwen3-VL, lo que aporta capacidad de comprension de prompts multimodales (texto e imagen).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.

## Casos de uso

- Generacion de clips publicitarios a partir de una imagen de producto y un prompt de texto: el pipeline image-text-to-video permite animar el fotograma de referencia y obtener audio sincronizado a 24 FPS en una sola pasada, adecuado para prototipado rapido de creatividades.
- Interpolacion entre primer y ultimo fotograma en produccion audiovisual: la variante FL2VA permite definir los extremos de un plano y generar la transicion intermedia con audio, util para storyboards animados y prevision de secuencias.
- Creacion de contenido para redes sociales con imagen de referencia: la variante Ref2VA mantiene la coherencia de un personaje o estilo a partir de una imagen de referencia, lo que facilita series de clips con identidad visual consistente.
- Prototipado en ComfyUI dentro de Runpod: el paquete esta pensado para desplegarse como runtime fijado en workers de Runpod, lo que permite reproducir exactamente el mismo conjunto de pesos y adaptadores en cada ejecucion gracias al manifest con SHA256.
- Evaluacion comparativa de adaptadores de destilacion: al incluir tanto los adaptadores oficiales de seis pasos como la fusion Turbo de cuatro pasos, permite medir el compromiso entre calidad y velocidad en el mismo hardware.
- Generacion de audio para video sin pipeline separado: el VAE de audio incluido evita tener que encadenar un modelo de sintesis de voz o de efectos independiente, simplificando la infraestructura en produccion.
- Investigacion sobre cuantizacion INT8 y NVFP4 en difusion de video: el paquete sirve como referencia reproducible para estudiar el impacto de ConvRot INT8 en los transformadores y de NVFP4-AWQ en el encoder de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que las mediciones de velocidad del upstream para la variante Fast no garantizan el mismo rendimiento en otros GPUs, por lo que no se ofrecen cifras de latencia ni throughput verificadas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el repositorio completo ocupa 72,8 GB, por lo que se requiere almacenamiento suficiente para todos los componentes y VRAM adicional para cargar los transformadores INT8, el encoder NVFP4-AWQ y los VAE en memoria.
- GPU recomendadas: no disponible en la informacion proporcionada; el empaquetado esta orientado a workers de Runpod, lo que sugiere GPUs de centro de datos, pero no se especifican modelos concretos.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: ComfyUI (entorno objetivo del paquete); no se confirma soporte de vLLM, llama.cpp, Ollama ni TGI, que ademas no son adecuados para un pipeline de difusion de video.
- Latencia y throughput: no disponible; la model card advierte explicitamente que las cifras del upstream no son extrapolables.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Pika H3 Flex — Woovee runtime | no disponible | no disponible | Video + audio (image-text-to-video) | MiniMax H3 Community License | Hugging Face (Woovee) |
| Pika-Labs/Pika-H3-Flex | no disponible | no disponible | Video + audio | MiniMax H3 Community License | Hugging Face (Pika-Labs) |
| MiniMaxAI/MiniMax-H3 | no disponible | no disponible | Video + audio | MiniMax H3 Community License | Hugging Face (MiniMaxAI) |
| akhaliq/Pika-H3-Flex-Turbo-LoRA | no disponible (LoRA) | no disponible | Adaptador Turbo de 4 pasos | no disponible | Hugging Face (akhaliq) |

Los tres primeros comparten la misma familia de pesos; el paquete de Woovee se distingue por fijar versiones concretas, incluir ambos regimenes de adaptadores y anadir el manifest de procedencia. No se dispone de datos de rendimiento comparado entre ellos.

## Limitaciones y advertencias

- La variante "Fast" es una fusion comunitaria de akhaliq, no un lanzamiento oficial de Pika; su comportamiento y calidad no estan respaldados por Pika.
- No deben apilarse los adaptadores oficiales de seis pasos y los Turbo de cuatro pasos en la misma ejecucion; ademas, la familia de adaptador debe coincidir con la del transformador.
- El paquete no incluye el upsampler 4K alojado de Pika ni la separacion de pistas de audio, por lo que esas funciones no estan disponibles en local.
- La licencia MiniMax H3 Community License Agreement impone restricciones territoriales; es imprescindible revisar `LICENSE-H3.txt` antes de cualquier uso comercial.
- La model card advierte que la disponibilidad del paquete no implica que todos los modos hayan sido validados en produccion; el estado de validacion se mantiene en el registro de despliegue del worker de Studio.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion, cobertura idiomatica ni limitaciones de contexto.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Woovee/pika-h3-flex-runpod
- Licencia H3: https://huggingface.co/Woovee/pika-h3-flex-runpod/blob/main/LICENSE-H3.txt
- Modelo base Pika: https://huggingface.co/Pika-Labs/Pika-H3-Flex
- Componentes MiniMax H3 en Comfy-Org: https://huggingface.co/Comfy-Org/MiniMax-H3
- Adaptadores Turbo de akhaliq: https://huggingface.co/akhaliq/Pika-H3-Flex-Turbo-LoRA
- Modelo base MiniMax: https://huggingface.co/MiniMaxAI/MiniMax-H3
