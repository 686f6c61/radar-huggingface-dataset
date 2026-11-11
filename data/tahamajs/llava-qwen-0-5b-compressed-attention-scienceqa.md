# tahamajs/llava-qwen-0.5b-compressed-attention-scienceqa

## Resumen

`tahamajs/llava-qwen-0.5b-compressed-attention-scienceqa` es un modelo de visión-lenguaje (VLM) derivado de `llava-hf/llava-interleave-qwen-0.5b-hf`, publicado por Taha Majlesi dentro del proyecto NeuralOps. No se trata de un modelo entrenado desde cero, sino de un experimento de "cirugía de atención": se sustituyen 18 de las 24 capas de atención del decodificador Qwen2 por un operador denominado `compressed_attention`, basado en descomposición en valores singulares truncada (SVD), y se destila el resultado sobre preguntas con imagen del dataset ScienceQA. El objetivo es medir hasta qué punto un mecanismo de atención subcuadrático puede sustituir a la atención cuadrática estándar en un VLM sin destruir la capacidad de razonamiento visual.

El modelo combina un codificador visual SigLIP congelado, un proyector MLP de dos capas y un decodificador Qwen2 de 24 capas con dimensión oculta 1024 y 16 cabezas de atención. La intervención mantiene seis capas de atención cuadrática como anclas (índices 3, 7, 11, 15, 19 y 23) y reemplaza el resto, lo que da lugar a un patrón híbrido 3:1. El repositorio solo distribuye los pesos de atención y layernorm en FP16 (405,21 MB), que deben cargarse sobre el modelo base original.

Su relevancia es fundamentalmente de investigación: demuestra que, tras un proceso de destilación de dos etapas y 144 pasos de optimización, un modelo con atención comprimida puede recuperar buena parte del rendimiento del profesor (43,45 % frente a 46,90 % de precisión en ScienceQA), aunque parte de un colapso severo en zero-shot (28,97 %). Es un artefacto pequeño, de licencia MIT y con soporte únicamente en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM tipo LLaVA: SigLIP (vision, congelado) + proyector MLP 2 capas + decodificador Qwen2 de 24 capas con atencion comprimida por SVD en 18 capas (patron hybrid_3_1) |
| Parametros totales | no disponible (el modelo base es de 0.5B; el repo solo publica pesos de atencion de 405,21 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, FP16) + configs de processor y tokenizer |

## Arquitectura y entrenamiento

La arquitectura sigue el esquema `LlavaForConditionalGeneration`: los parches visuales extraidos por el codificador SigLIP se intercalan con los tokens de texto dentro de las capas del modelo de lenguaje. Tanto el `vision_tower` como el `multi_modal_projector` permanecen completamente congelados, de modo que el experimento aísla el efecto de la atencion comprimida en el enrutamiento cross-modal vision-texto. El decodificador Qwen2 tiene 24 capas, D=1024, H=16 y d_h=64. Las capas 3, 7, 11, 15, 19 y 23 conservan atencion cuadratica como anclas; las 18 restantes usan `CompressedAttentionLayer`, que aproxima la atencion multi-cabeza mediante SVD truncada.

El entrenamiento consistio en una destilacion de conocimiento en dos etapas sobre preguntas con imagen de `derek-thomas/ScienceQA`: 49 pasos en la etapa 1 y 95 en la etapa 2, 144 pasos en total, con una duracion de 120,4 s y un pico de VRAM de 17.365 MB en una NVIDIA RTX 3090 de 24 GB. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion completa del dataset ni el uso de RLHF o DPO. La innovacion tecnica central es el propio operador `compressed_attention` (familia `svd`), registrado en `ATTENTION_REGISTRY` de NeuralOps.

## Capacidades

- Generacion de texto condicionada por imagen (image-text-to-text) en formato conversacional.
- Respuesta a preguntas visuales de razonamiento cientifico (VQA), entrenado especificamente sobre ScienceQA.
- Razonamiento multimodal basico sobre diagramas y figuras cientificas del dataset de entrenamiento.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles.
- Modo thinking, vision adicional, audio u otras capacidades especiales: no disponible.
- Capacidad de generacion de codigo o matematicas: no documentada en la informacion disponible.

## Casos de uso

- Investigacion sobre atencion eficiente: sirve como banco de pruebas controlado para medir el impacto de sustituir atencion cuadratica por aproximaciones SVD en un VLM, comparando directamente contra el modelo base `llava-interleave-qwen-0.5b-hf`.
- Reproduccion de experimentos de "attention surgery": permite replicar el pipeline de NeuralOps (cirugia + destilacion en dos etapas) sobre un modelo de 0,5B que cabe en una unica GPU de consumo.
- Evaluacion de destilacion de conocimiento en VLMs: util para estudiar cuanto rendimiento se recupera tras un colapso zero-shot, dado el salto documentado de 28,97 % a 43,45 % en ScienceQA.
- Prototipado de asistentes educativos de ciencias: puede responder preguntas de opcion multiple sobre imagenes cientificas, aunque con precision limitada (43,45 %) y solo en ingles.
- Docencia y divulgacion: ejemplo didactico de como se implementa una capa de atencion comprimida por SVD y como se integra en un modelo Hugging Face existente.
- Investigacion sobre eficiencia de memoria y computo: punto de partida para analizar si la atencion comprimida reduce coste de inferencia en VLMs pequenos, aunque el repositorio no publica mediciones de latencia o throughput.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre `derek-thomas/ScienceQA` (split validation, subconjunto con imagen). No verificados de forma independiente.

| Metrica | Profesor (`llava-interleave-qwen-0.5b`) | Zero-shot con atencion comprimida | Destilado (este modelo) | Delta |
|---|---:|---:|---:|---:|
| Precision visual ScienceQA (%) | 46,90 | 28,97 | 43,45 | +14,48 |
| Perplejidad de respuesta condicionada por imagen | 3,85 | 8.120,66 | 3,11 | -8.117,54 |

Telemetria del entrenamiento: 144 pasos, 120,4 s, pico de 17.365 MB de VRAM en RTX 3090 24 GB.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. El modelo base es de 0,5B; en FP16 el conjunto de pesos ronda 1 GB, y el checkpoint de atencion publicado ocupa 405,21 MB. Con overhead de activaciones y del codificador SigLIP, es esperable que quepa en GPUs de consumo con 8 GB o mas, aunque esta cifra no esta confirmada en la informacion disponible.
- GPU recomendadas: el autor valido el entrenamiento en una NVIDIA RTX 3090 de 24 GB. Para inferencia, cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4070, RTX 4090) deberia ser suficiente por tamano, aunque no hay mediciones publicadas.
- Cabe en GPU de consumo: si, por tamano del modelo base (0,5B), aunque no hay benchmarks de latencia publicados.
- Opciones de despliegue: el flujo documentado usa `transformers` (`LlavaForConditionalGeneration`), `safetensors` y el script `apply_qwen_attention_surgery` de NeuralOps. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y es poco probable que funcionen sin adaptar el operador `compressed_attention`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ScienceQA VQA (%) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/llava-qwen-0.5b-compressed-attention-scienceqa` | ~0,5B (base) | no disponible | 43,45 | MIT | Hugging Face (solo pesos de atencion) |
| `llava-hf/llava-interleave-qwen-0.5b-hf` (profesor) | ~0,5B | no disponible | 46,90 | no disponible en la informacion | Hugging Face |
| Otros VLM pequenos comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion directa mas relevante es con su modelo base, ya que este repositorio no incluye pesos completos sino solo la cirugia de atencion. No se dispone de datos de benchmarks de terceros para establecer comparaciones adicionales.

## Limitaciones y advertencias

- Precision limitada: 43,45 % en ScienceQA, casi 3,5 puntos por debajo del profesor (46,90 %).
- El zero-shot sin destilacion colapsa (28,97 % de precision y perplejidad de 8.120,66), lo que indica que la atencion comprimida no es util sin un proceso de destilacion especifico.
- Solo distribuye pesos de atencion y layernorm: requiere descargar el modelo base `llava-hf/llava-interleave-qwen-0.5b-hf` y aplicar la cirugia con el script de NeuralOps, lo que anade complejidad de despliegue.
- Entrenado exclusivamente sobre ScienceQA en ingles: no hay evidencia de generalizacion a otros dominios visuales ni a otros idiomas.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero esperable en un VLM pequeno con destilacion breve (144 pasos).
- Sesgos conocidos: no documentados; hereda los del modelo base y del dataset ScienceQA.
- Licencia MIT permite uso comercial, pero la dependencia del modelo base y del codigo de NeuralOps debe verificarse por separado.
- Resultados de benchmarks no verificados (`verified: false` en el model-index).
- No hay soporte documentado para tool calling, agentes ni despliegue en motores de inferencia estandar.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/llava-qwen-0.5b-compressed-attention-scienceqa
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementacion de `CompressedAttentionLayer`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/svd/compressed_attention.py
- Licencia: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
