# ZolMik2004/Qwen3-Omni-30B-A3B-Instruct-HybridQuant-MLX

## Resumen

Qwen3-Omni-30B-A3B-Instruct-HybridQuant-MLX es una cuantizacion hibrida del modelo multimodal Qwen3-Omni-30B-A3B-Instruct de Alibaba Qwen, empaquetada especificamente para el backend MLX de Apple Silicon. El modelo original es un sistema any-to-any que acepta texto, imagen, audio y video como entrada y produce texto y voz natural como salida, con una arquitectura MoE de diseno Thinker-Talker de 30B parametros totales y 3B activos por token. Esta version cuantizada reduce el checkpoint de 70,5 GB en bfloat16 a 22,55 GB, lo que permite ejecutar el modelo completo, incluida la sintesis de voz, en un Mac con 32 GB de memoria unificada.

La relevancia de esta ficha radica en que demuestra que un modelo omni de gran escala puede desplegarse en hardware de consumo Apple sin renunciar a las capacidades de vision, audio y habla. El autor aplica una estrategia de cuantizacion selectiva: el language model se comprime a 4 bits, mientras que los modulos sensibles a la cuantizacion (router MoE, embeddings, torres de vision y audio, Talker completo y vocoder) se mantienen en 8 bits, y la proyeccion de tokens de audio permanece en fp16. No hay reentrenamiento ni cambios arquitectonicos: es un port directo del checkpoint original.

El modelo conserva las capacidades del Instruct original: 119 idiomas de texto, 19 idiomas de entrada de voz y 10 idiomas de salida de voz, con streaming de texto y audio por chunks. La licencia Apache 2.0 facilita su uso comercial, aunque las limitaciones propias de la cuantizacion y del backend MLX deben evaluarse en cada caso de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE Thinker-Talker (transformer multimodal) con encoder de audio AuT y vocoder multi-codebook |
| Parametros totales | 35.259.818.545 (segun safetensors); 30B nominales en la nomenclatura del modelo base |
| Parametros activos | 3B (aproximado, segun nomenclatura A3B del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Hibrida: 4 bits (language model), 8 bits (router MoE, embeddings, vision tower, audio tower, Talker, vocoder), fp16 (proyeccion de tokens de audio); cuantizacion affine con group size 64 |
| Idiomas soportados | 119 idiomas de texto, 19 de entrada de voz, 10 de salida de voz (segun model card); tags de Hugging Face: en, zh, ru, de, fr, es, it, pt, ja, ko |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (5 shards, 22,55 GB); tensores U32 empaquetados y F16 para escalas/sesgos; sin bfloat16; libreria mlx |

## Arquitectura y entrenamiento

El modelo base Qwen3-Omni emplea una arquitectura MoE con diseno Thinker-Talker. El Thinker procesa las entradas multimodales (texto, imagen, audio, video) mediante un language model MoE de 30B parametros totales y 3B activos, apoyado por una torre de vision (ViT) y una torre de audio (AuT). El Talker es un decoder MoE de voz que genera tokens de audio a partir de la salida del Thinker, y el vocoder Code2Wav convierte esos tokens en una forma de onda de 24 kHz. Esta separacion permite baja latencia en la sintesis de voz y streaming por chunks.

Esta version concreta no introduce cambios arquitectonicos ni reentrenamiento: es una cuantizacion post-entrenamiento del checkpoint Qwen/Qwen3-Omni-30B-A3B-Instruct. La innovacion tecnica esta en la estrategia de cuantizacion hibrida: se aplica cuantizacion affine con group size 64 y escalas/sesgos en float16, manteniendo a 8 bits los componentes mas sensibles (router MoE, embeddings, encoders de vision y audio, Talker y vocoder) y a 4 bits el resto del language model. Los pesos se empaquetan en tensores U32 (ocho valores de 4 bits o cuatro de 8 bits por palabra de 32 bits) y F16. No se dispone de informacion sobre el volumen de tokens de entrenamiento ni sobre el proceso de RLHF/DPO en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento multimodal a partir de entradas de texto, imagen, audio y video.
- Salida de voz natural mediante el Talker y el vocoder Code2Wav, con seleccion de voz (Ethan, Chelsie, Aiden).
- Comprension de audio y reconocimiento de voz en 19 idiomas de entrada.
- Sintesis de voz en 10 idiomas de salida.
- Soporte multilingue de texto en 119 idiomas.
- Streaming de texto y audio por chunks mediante `generate_stream`.
- Entrada mixta de imagen y audio en una misma peticion.
- Capacidades de modelo Instruct para seguir instrucciones y conversacion multi-turno (heredadas del modelo base).
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente de voz en local para macOS: el modelo puede recibir audio del microfono y responder con voz sintetizada en tiempo real gracias al Talker y al vocoder integrados, sin depender de servicios en la nube, lo que resulta adecuado para aplicaciones de privacidad estricta en un Mac con 32 GB de memoria unificada.
- Descripcion de imagenes y videos para accesibilidad: integrado en una aplicacion de escritorio, el modelo puede procesar una imagen o un video y generar una descripcion textual o una narracion hablada, aprovechando la torre de vision y la salida de voz.
- Transcripcion y analisis de reuniones: con entrada de audio y contexto multimodal, el modelo puede transcribir y resumir grabaciones, ademas de generar un resumen hablado para consumo rapido.
- Atencion al cliente multimodal: un chatbot que acepte capturas de pantalla, audios de usuarios y texto, y responda con voz o texto; la cuantizacion a 4 bits del language model mantiene la fluidez conversacional mientras el router y los embeddings en 8 bits preservan la calidad de enrutamiento.
- Generacion de contenido audiovisual asistida: guiones, descripciones de escenas y narraciones a partir de videos o imagenes, con salida de voz para prototipos de narracion automatica.
- Prototipado de agentes omni en Apple Silicon: investigadores que necesiten experimentar con un modelo any-to-any completo en un portatil pueden usar esta version para validar pipelines de vision-audio-texto antes de escalar a hardware de servidor.
- Educacion y aprendizaje de idiomas: el modelo puede escuchar una pronunciacion en uno de los 19 idiomas de entrada y responder con correcciones habladas en uno de los 10 idiomas de salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 22,55 GB de pesos; se recomienda un minimo de 32 GB de memoria unificada para cargar el modelo completo con margen para el contexto y el runtime.
- Verificado por el autor en un Mac con M2 Max y 32 GB de memoria unificada.
- GPU recomendadas: Apple Silicon (M1/M2/M3/M4 en configuraciones con al menos 32 GB de memoria unificada). No aplica a GPU NVIDIA o AMD, ya que el formato es MLX.
- Cabe en GPU de consumo Apple; no es compatible con GPU de consumo NVIDIA por el backend MLX.
- Opciones de despliegue: `mlx-vlm` (libreria oficial de carga e inferencia), con soporte de `mlx_vlm.generate` y `generate_stream`; descarga via `hf` CLI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Formato/backend |
|---|---|---|---|---|---|
| Qwen3-Omni-30B-A3B-Instruct-HybridQuant-MLX (este) | 35,26B totales / 3B activos | no disponible | Texto, imagen, audio, video a texto y voz | Apache 2.0 | safetensors MLX, 22,55 GB |
| Qwen/Qwen3-Omni-30B-A3B-Instruct (base) | 30B totales / 3B activos | no disponible | Texto, imagen, audio, video a texto y voz | Apache 2.0 | bfloat16, 70,5 GB |
| Alternativas comparables de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La cuantizacion a 4 bits del language model puede degradar ligeramente la calidad en tareas de razonamiento complejo frente al checkpoint bfloat16 original; no se han publicado evaluaciones comparativas.
- El modelo esta empaquetado exclusivamente para MLX y Apple Silicon; no es utilizable en GPU NVIDIA, AMD ni en CPU convencional sin conversion adicional.
- Requiere al menos 32 GB de memoria unificada para ejecutar el modelo completo con salida de voz; configuraciones inferiores no estan verificadas.
- La longitud de contexto no se especifica en la informacion disponible, lo que impide planificar cargas de contexto largo con precision.
- Riesgo de alucinacion inherente a los modelos de lenguaje, agravado en tareas multimodales donde la interpretacion de audio o video puede ser imprecisa.
- Sesgos conocidos del modelo base no documentados en la informacion proporcionada; se recomienda evaluar en el dominio de aplicacion.
- La salida de voz se limita a tres voces predefinidas (Ethan, Chelsie, Aiden) y a 10 idiomas; no hay informacion sobre clonacion de voz.
- Aunque la licencia es Apache 2.0, el uso comercial debe verificar las condiciones del modelo base y de las dependencias (mlx-vlm, MLX).
- El repositorio tiene un volumen de descargas bajo (200) y una sola valoracion, por lo que la validacion comunitaria es limitada.

## Enlaces

- Hugging Face: https://huggingface.co/ZolMik2004/Qwen3-Omni-30B-A3B-Instruct-HybridQuant-MLX
- Modelo base: https://huggingface.co/Qwen/Qwen3-Omni-30B-A3B-Instruct
- Informe tecnico Qwen3-Omni: https://github.com/QwenLM/Qwen3-Omni/blob/main/assets/Qwen3_Omni.pdf
- Repositorio Qwen3-Omni: https://github.com/QwenLM/Qwen3-Omni
- Documentacion MLX: https://ml-explore.github.io/mlx/
- Repositorio mlx-vlm: https://github.com/ml-explore/mlx-vlm
- CLI de Hugging Face: https://huggingface.co/docs/huggingface_hub/en/guides/cli
