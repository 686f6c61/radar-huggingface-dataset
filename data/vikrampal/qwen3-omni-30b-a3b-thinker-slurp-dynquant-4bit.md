# VikramPal/Qwen3-Omni-30B-A3B-Thinker-SLURP-DynQuant-4bit

## Resumen

El modelo VikramPal/Qwen3-Omni-30B-A3B-Thinker-SLURP-DynQuant-4bit es una cuantización DynQuant de 4 bits de un fine-tune QLoRA del modelo Qwen3-Omni-30B-A3B-Instruct, especializado en clasificación de intenciones habladas sobre el dataset SLURP. El autor, VikramPal, ha eliminado los componentes de habla (Talker y code2wav) y conserva únicamente el Thinker, que acepta audio, imagen, vídeo y texto como entrada y emite texto como salida. Esto lo convierte en un modelo multimodal de razonamiento y comprensión, sin capacidades de síntesis de voz.

La relevancia de este checkpoint radica en su tamaño reducido: 14,77 GiB frente a los 59,08 GiB del modelo bf16 original, una reducción de 4 veces gracias a la cuantización DynQuant. Esto permite ejecutar un modelo de 30B con arquitectura MoE en una GPU de consumo con 24 GB de VRAM, manteniendo un rendimiento prácticamente idéntico al del modelo padre (86,20% frente a 86,80% de accuracy en el protocolo de evaluación, con una diferencia no significativa según la prueba exacta de McNemar, p = 0,7011). Es el checkpoint recomendado por el autor para ejecutar el modelo en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) multimodal, basada en Qwen3-Omni, solo componente Thinker |
| Parametros totales | 31.719.205.488 (Thinker) |
| Parametros activos | ~3 mil millones (nomenclatura A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | DynQuant 4-bit (4.00 bits por peso) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (cuantizados DynQuant) |

Nota: el campo de metadatos de HuggingFace indica 4.216.171.600 parámetros en los archivos safetensors, pero el README del autor detalla que el modelo Thinker completo tiene 31.719.205.488 parámetros. Esta discrepancia puede deberse a la cuantización o a un error en el registro del Hub.

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3-Omni, un transformer multimodal nativo de extremo a extremo con mezcla de expertos (MoE). En esta versión se han eliminado los módulos de generación de habla (Talker y code2wav), que sumaban 3.540.613.057 parámetros, dejando únicamente el Thinker, que consta de 96 bancos de expertos MoE agrupados (28.991.029.248 parámetros, el 91,4% del total). Los parámetros de atención y embedding suman el resto. `tie_word_embeddings` es `false`, por lo que `embed_tokens` y `lm_head` son tensores separados de 152064x2048.

El entrenamiento consistió en un fine-tune QLoRA sobre el dataset SLURP (marcel-gohsen/slurp) para la tarea de clasificación de intenciones habladas, seguido de una cuantización DynQuant de 4 bits. El modelo resultante mantiene la capacidad de procesar entradas multimodales (audio, imagen, vídeo y texto) y emitir texto, pero ha perdido la generación de voz. Requiere `transformers >= 5.0` y el paquete `dynquant` 0.4.0, con un registro explícito del cuantizador antes de cargar el modelo.

## Capacidades

- Clasificación de intenciones habladas: entrenado específicamente sobre SLURP, alcanza un 86,20% de accuracy en el protocolo de evaluación del autor.
- Comprensión multimodal: acepta audio, imágenes, vídeo y texto como entrada, y produce texto como salida.
- Razonamiento chain-of-thought: al ser el componente Thinker, está diseñado para razonamiento paso a paso y comprensión profunda.
- Sin generación de habla: no emite audio; la salida es exclusivamente textual.
- Integración nativa con transformers: la arquitectura `qwen3_omni_moe_thinker` está registrada en transformers, sin necesidad de `trust_remote_code`.

## Casos de uso

- Asistentes de voz para domótica: clasificar comandos hablados como "enciende la luz" o "sube la temperatura" en intenciones estructuradas, gracias a su entrenamiento en SLURP y su capacidad de procesar audio directamente.
- Enrutamiento de llamadas en centros de atención al cliente: transcribir y clasificar la intención de la llamada (reclamación, información, compra) para dirigirla al departamento adecuado, con baja latencia al ejecutarse en una GPU de 24 GB.
- Control por voz en vehículos: interpretar comandos del conductor (navegación, música, llamadas) con comprensión multimodal si se combina con entrada de cámara.
- Análisis de conversaciones grabadas: procesar audio de reuniones o entrevistas para extraer intenciones o acciones solicitadas, útil en entornos de inteligencia empresarial.
- Sistemas de accesibilidad: permitir a personas con discapacidad motriz controlar aplicaciones mediante voz, clasificando comandos en tiempo real.
- Pipelines de IA conversacional: integrar el modelo como clasificador de intenciones en un sistema de diálogo multi-turno, donde el texto de salida se alimenta a un gestor de diálogo.
- Comprensión multimodal general: aunque su especialidad es el audio, al conservar los encoders de imagen y vídeo puede utilizarse para tareas de descripción o razonamiento visual en inglés.

## Benchmarks y rendimiento

El autor proporciona resultados de evaluación en el README. Se comparan el modelo cuantizado (DynQuant 4-bit) y su padre bf16 en el protocolo de 500 ítems del dataset SLURP:

| Modelo | Accuracy | Aciertos/Total |
|---|---|---|
| Qwen3-Omni-30B-A3B-Thinker-SLURP-bf16 | 86,80% | 434/500 |
| Qwen3-Omni-30B-A3B-Thinker-SLURP-DynQuant-4bit | 86,20% | 431/500 |

La diferencia de −0,60 puntos no es estadísticamente significativa (prueba exacta de McNemar, p = 0,7011). No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada: ~14,8 GiB para los pesos (medido residente: 15.892.454.912 bytes), más activaciones para el encoder de audio y un prompt de ~4k tokens.
- GPU recomendadas: RTX 3090, RTX 4090, A10G (24 GB) como mínimo práctico a batch 1; para GPUs con menos VRAM se requiere `device_map="auto"` con dos tarjetas o CPU offload.
- Espacio en disco: 14,77 GiB para los shard files.
- Opciones de despliegue: transformers con el paquete `dynquant` registrado; no se menciona compatibilidad con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (SLURP) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-Omni-30B-A3B-Instruct (original) | 35.259.818.545 (completo) | no disponible | no evaluado en SLURP | Apache-2.0 (gated, requiere aceptación) | Requiere autenticación en HuggingFace |
| Qwen3-Omni-30B-A3B-Thinker-SLURP-bf16 | 31.719.205.488 | no disponible | 86,80% | Apache-2.0 | Abierto |
| VikramPal/Qwen3-Omni-30B-A3B-Thinker-SLURP-DynQuant-4bit | 31.719.205.488 | no disponible | 86,20% | Apache-2.0 | Abierto |

El modelo cuantizado ofrece un rendimiento estadísticamente equivalente al bf16 con una cuarta parte del espacio, lo que lo hace más adecuado para despliegue en hardware de consumo. El modelo original incluye capacidades de habla, pero requiere autenticación y más recursos.

## Limitaciones y advertencias

- Solo salida de texto: no genera habla; cualquier aplicación que requiera respuesta oral necesita un sistema TTS adicional.
- Idioma limitado: entrenado y evaluado únicamente en inglés.
- Riesgo de carga incorrecta: si no se instala `dynquant` y se ejecuta `dynquant.register_hf_quantizer()` antes de `from_pretrained`, transformers devuelve un modelo con pesos aleatorios sin lanzar error. Esto puede producir resultados sin sentido y puntuaciones al azar.
- Incompatibilidad con `AutoModelForCausalLM` y `AutoModel`: ambos lanzan `ValueError`; se debe usar `Qwen3OmniMoeThinkerForConditionalGeneration` o `AutoModelForImageTextToText`.
- Requiere `transformers >= 5.0`; versiones anteriores no son compatibles.
- Sesgos del dataset SLURP: el modelo puede reflejar los sesgos presentes en los datos de entrenamiento (acentos, dominios, vocabulario).
- Alucinaciones: como cualquier modelo generativo, puede producir texto plausible pero incorrecto en tareas abiertas.
- Licencia: aunque la licencia declarada es Apache-2.0, el modelo base original es gated; verificar los términos de uso del dataset SLURP y del modelo base para uso comercial.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/VikramPal/Qwen3-Omni-30B-A3B-Thinker-SLURP-DynQuant-4bit)
- [Modelo base bf16](https://huggingface.co/VikramPal/Qwen3-Omni-30B-A3B-Thinker-SLURP-bf16)
- [Modelo original Qwen3-Omni-30B-A3B-Instruct](https://huggingface.co/Qwen/Qwen3-Omni-30B-A3B-Instruct)
- [Dataset SLURP](https://huggingface.co/datasets/marcel-gohsen/slurp)
- [Repositorio de dynquant](https://github.com/kambojvikram/dynquant)
- [Colección Qwen3-Omni](https://huggingface.co/collections/Qwen/qwen3-omni)
