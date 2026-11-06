# yechan013/gemma-4-e4b-it-qat-mlx-4bit-g32

## Resumen

`yechan013/gemma-4-e4b-it-qat-mlx-4bit-g32` es una conversión a 4 bits en formato MLX del checkpoint instruction-tuned con entrenamiento consciente de cuantización (QAT) de Google Gemma 4 E4B, publicada por el proyecto lecmate. No es un modelo original: es una modificación del checkpoint `google/gemma-4-E4B-it-qat-q4_0-unquantized` en la que se han cuantizado los pesos del modelo de lenguaje y las dos proyecciones de embedding multimodal (visión y audio), dejando sin cuantizar las torres de visión y audio.

El modelo resuelve el problema de ejecutar un modelo multimodal de ~7.900 millones de parámetros en Macs de 16 GB de memoria unificada. Con 5,682 bits por peso de media y un repositorio de 5,6 GB, encaja en el perfil de hardware objetivo de la aplicación lecmate (app de notas de clase para macOS), que lo seleccionó en su evaluación pre-registrada de modelos (T-00b Stage 2) para su tier de 16 GB.

Es relevante ahora porque demuestra un patrón de cuantización alineado con el entrenamiento: el tamaño de grupo 32 coincide con el tamaño de bloque q4_0 para el que fue entrenado el checkpoint QAT original, lo que reduce la degradación típica de una cuantización post-entrenamiento agresiva. La conversión se realizó con mlx-vlm 0.6.4 sobre Apple Silicon y es reproducible de forma byte-idéntica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Gemma 4 E4B multimodal; transformer con torres de visión y audio, detalles no especificados en la información disponible) |
| Parámetros totales | 7.941.100.874 |
| Parámetros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4 bits, group size 32 (5,682 bits por peso de media); torres de visión y audio sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), 2 shards + `model.safetensors.index.json` |

## Arquitectura y entrenamiento

El modelo base es `google/gemma-4-E4B-it-qat-q4_0-unquantized`, un checkpoint instruction-tuned de Google DeepMind entrenado con quantization-aware training (QAT) para el bloque q4_0. La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. La presencia de proyecciones `embed_vision.embedding_projection` y `embed_audio.embedding_projection`, junto con torres de visión y audio, confirma que el modelo base es multimodal (texto, imagen y audio).

La modificación aplicada consiste en cuantizar a 4 bits con group size 32 los dos shards de pesos (`model-00001-of-00002.safetensors` y `model-00002-of-00002.safetensors`), incluyendo el modelo de lenguaje y las dos proyecciones de embedding multimodal, mientras que las torres de visión y audio se mantienen sin cuantizar. La conversión se ejecutó con `python -m mlx_vlm convert -q --q-bits 4 --q-group-size 32` (mlx-vlm 0.6.4, mlx 0.31.2, Python 3.12, transformers 5.12.1) el 2026-10-21 sobre GPU de Apple Silicon; una segunda conversión produjo shards byte-idénticos. El tamaño de grupo 32 se eligió explícitamente para coincidir con el tamaño de bloque q4_0 del checkpoint QAT. Los ficheros `chat_template.jinja`, `generation_config.json` y `tokenizer.json` son byte-idénticos al original; `config.json`, `processor_config.json` y `tokenizer_config.json` fueron reescritos por el conversor.

## Capacidades

- Generación de texto y razonamiento en modo instruction-tuned (heredado del checkpoint `-it` de Gemma 4 E4B).
- Procesamiento multimodal de imagen: el modelo incluye torre de visión y proyección de embedding de visión.
- Procesamiento multimodal de audio: incluye torre de audio y proyección de embedding de audio.
- Conversación multi-turno mediante plantilla de chat (`chat_template.jinja` idéntica a la del original).
- Capacidad de citar líneas de transcripción: en el contexto de lecmate, las respuestas de IA llevan "line chips" que apuntan a la línea de transcripción referenciada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Notas de clase en macOS: es el uso previsto. lecmate carga este modelo en Macs de 16 GB o más para responder preguntas sobre transcripciones de clases, generar resúmenes de puesta al día y producir notas de IA, siempre etiquetadas como respuestas de IA y con chips que enlazan a la línea de transcripción correspondiente.
- Respuesta a preguntas sobre transcripciones largas: el modelo recibe la transcripción y devuelve respuestas con referencias verificables a líneas concretas, lo que permite al usuario comprobar la fuente. Adecuado por su ventana de contexto (no especificada) y por el formato de citación integrado en la app.
- Procesamiento de material audiovisual de clases: al incluir torres de visión y audio, puede emplearse para tareas que combinen diapositivas, pizarras o fragmentos de audio con el texto de la transcripción.
- Inferencia local en Apple Silicon: al estar en formato MLX y ocupar 5,6 GB, se puede cargar como cualquier modelo MLX en Macs con 16 GB de memoria unificada, sin depender de servicios en la nube ni de GPU dedicadas.
- Evaluación de calidad con puertas medibles: la app activa cada función de IA solo cuando supera las puertas de calidad (decisión D-25) medidas sobre clases no vistas durante la selección; el modelo es el candidato evaluado para esas puertas.
- Prototipado de asistentes multimodales en local: desarrolladores que quieran experimentar con un modelo Gemma 4 E4B cuantizado en MLX pueden cargarlo con mlx-vlm y usarlo como base para prototipos de asistentes que procesen texto, imagen y audio en un solo equipo.
- Distribución con verificación de integridad: el repositorio incluye `SHA256SUMS` con el hash de cada fichero del modelo, lo que permite a una aplicación rechazar la carga si algún archivo falta o difiere, como hace lecmate.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada: el repositorio ocupa 5,6 GB; el modelo está pensado para Macs con 16 GB o más de memoria unificada.
- GPU recomendadas: Apple Silicon (GPU integrada). La conversión se realizó en una GPU de Apple Silicon; no se especifica el chip concreto.
- GPU consumer: cabe en Macs de 16 GB; no hay información sobre GPUs NVIDIA consumer (RTX 4090, etc.) porque el formato es MLX.
- Opciones de despliegue: mlx-vlm (versión usada en la conversión: 0.6.4) y, en general, el ecosistema MLX. No se indica soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yechan013/gemma-4-e4b-it-qat-mlx-4bit-g32 | 7.941.100.874 | no disponible | 4 bits, group size 32 (MLX) | Apache 2.0 | Hugging Face, formato MLX |
| google/gemma-4-E4B-it-qat-q4_0-unquantized | no disponible | no disponible | bfloat16 (sin cuantizar) | Apache 2.0 | Hugging Face |
| Otras conversiones MLX de Gemma 4 E4B | no disponible | no disponible | no disponible | no disponible | no disponible |

La información disponible no permite comparar rendimiento (benchmarks) con alternativas; solo se conocen los datos del modelo base y de esta conversión.

## Limitaciones y advertencias

- Modelo modificado, no oficial: no es una publicación de Google y Google no lo ha revisado ni respaldado. El nombre "Gemma" se usa solo para indicar su procedencia.
- Uso previsto restringido: el autor lo declara específicamente para lecmate y advierte de que no está evaluado para otros usos.
- Funciones de IA condicionadas: en lecmate, las funciones de IA solo se activan cuando superan las puertas de calidad medidas sobre clases no vistas; hasta entonces la app funciona en modo cita (muestra líneas de transcripción) sin llamadas al modelo.
- Riesgo de alucinación: los chips de línea que acompañan a las respuestas muestran la línea de transcripción a la que el modelo apunta, pero el autor advierte explícitamente de que no son prueba de que la respuesta sea correcta.
- Idiomas y contexto: no se dispone de información sobre idiomas soportados ni longitud de contexto, lo que impide garantizar su idoneidad para casos distintos del uso previsto.
- Sesgos: no se documentan sesgos conocidos en la información disponible.
- Licencia: Apache 2.0, con enlace a la página de licencia de Gemma 4. El repositorio original no incluye fichero LICENSE ni NOTICE; esta conversión sí incluye `LICENSE` con el texto de Apache 2.0.
- Integridad: la app que lo consume fija los hashes de `SHA256SUMS` y rechaza cargar el modelo si algún archivo falta o difiere; no ejecuta ningún archivo descargado.
- Compatibilidad: al ser formato MLX, no es directamente utilizable en GPUs NVIDIA ni en el stack CUDA habitual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yechan013/gemma-4-e4b-it-qat-mlx-4bit-g32
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it-qat-q4_0-unquantized
- Revisión del modelo base: `476025a01dbf99361c062bbeca3d6a76bb4c4566`
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Texto de Apache License 2.0: https://www.apache.org/licenses/LICENSE-2.0.txt
- Repositorio de lecmate (código y resultados de la evaluación T-00b Stage 2): no disponible como URL en la información proporcionada
