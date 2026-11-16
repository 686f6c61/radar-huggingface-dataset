# VadymPikulyk/zils-lite-dh9

## Resumen

zils-lite-dh9 es un modelo de decisión ("decision-model") construido como *soup body* para Zils, el subnet 127 de Bittensor. Lo publica VadymPikulyk y parte de Qwen/Qwen3.5-0.8B como modelo base, reorganizado en el chasis (layout) de d3-lite. Con 852.985.920 parámetros totales, es un modelo compacto orientado a tareas de decisión y uso de herramientas, no a generación abierta de propósito general.

El modelo se obtiene mediante *model soup*: promedia los pesos de dos cuerpos d3-lite (DouglasBashir/zils-lite-r6 y BashirEmran/d3-lite-body-a2) y añade el delta de pesos de VadymPikulyk/zils-lite-dh6 respecto a su propio soup inicial. Ese delta proviene de un LoRA fusionado (rango 64, lr 5e-5, una época) entrenado con aproximadamente 33.000 respuestas del profesor Zils Relay y con filas de decisión de tool-use derivadas del split público TRAIN de glaiveai/glaive-function-calling-v2.

Su relevancia es acotada: se trata de un checkpoint de un ecosistema de subred descentralizada, con cero descargas y cero likes en el momento de la ficha, publicado bajo Apache-2.0. Resulta útil para quien participe en el subnet 127 o quiera estudiar técnicas de soup y destilación sobre un transformer de menos de mil millones de parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5, layout d3-lite; tag `qwen3_5`) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (con `custom_code`; tamano del repo 1,7 GB) |

## Arquitectura y entrenamiento

La arquitectura es un transformer de la familia Qwen3.5 (tag `qwen3_5`), inicializado desde Qwen/Qwen3.5-0.8B y reubicado en el chasis d3-lite. El repositorio requiere `custom_code`, lo que implica que la carga no es directa con `transformers` sin el código del autor. No se especifican en la información disponible el número de capas, la dimensión oculta, el número de cabezas ni la longitud de contexto nativa.

El entrenamiento combina dos fases. Primero, un *model soup* por media uniforme de los pesos de DouglasBashir/zils-lite-r6 y BashirEmran/d3-lite-body-a2. Segundo, se suma el delta de VadymPikulyk/zils-lite-dh6 sobre su soup de partida, delta generado por un LoRA de rango 64, learning rate 5e-5 y una época, entrenado con `python -m zils.teacher train` sobre unas 33.000 respuestas del profesor Zils Relay (zils-ai/zils-relay-answers, con probabilidades de vllm-sr/d3-ultra sobre preguntas de decisión reconstruidas a partir de fuentes públicas) más filas de decisión de tool-use del split TRAIN público de glaiveai/glaive-function-calling-v2. El autor declara que no se usaron ítems del examen de validadores, ítems públicos del examen semilla ni datos de clientes.

## Capacidades

- Toma de decisiones sobre preguntas con formato de decisión, destiladas desde las probabilidades del profesor d3-ultra.
- Decisión de uso de herramientas (tool-use) a partir de ejemplos de function calling de Glaive.
- Formato de salida orientado a cuerpo de subnet (soup body), pensado para integrarse en el pipeline de Zils.
- No se documentan capacidades de visión operativas pese a que la model card menciona "language and vision weights"; no hay confirmación de soporte multimodal funcional.
- Capacidades multilingües: no disponibles.
- Modo thinking, agentes multi-paso, audio: no disponibles.

## Casos de uso

- Participación en el subnet 127 de Bittensor: el checkpoint sirve como cuerpo candidato para mineros que compiten en el examen del subnet, ya que está construido específicamente para ese chasis y ese formato de decisión.
- Clasificación de decisión binaria o multiclase: el modelo se entrenó con probabilidades del profesor sobre preguntas de decisión, por lo que puede emplearse como clasificador ligero en pipelines internos.
- Enrutado de tool calling: las filas de Glaive permiten usarlo para decidir si una consulta requiere llamada a función y cuál, dentro de un orquestador de agentes.
- Investigación sobre model soups: su construcción documentada (media de dos cuerpos más delta de LoRA) lo convierte en un caso de estudio reproducible para experimentos de merging.
- Destilación de profesores grandes: sirve como ejemplo de destilación desde probabilidades (d3-ultra) a un modelo de 0,85B para entornos con recursos limitados.
- Despliegue en hardware modesto: con menos de mil millones de parámetros, cabe en GPUs de consumo para prototipos de decisión de baja latencia, siempre que se resuelva la carga con `custom_code`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 1,7 GB de pesos más overhead de activaciones y KV cache; en la práctica, entre 3 y 4 GB.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,9 GB de pesos; en 4 bits, alrededor de 0,5 GB (estimaciones por tamaño, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU con 8 GB o más (RTX 3060, RTX 4060, RTX 4090) para fp16; A100 y H100 no son necesarias por tamaño.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB y RTX 4090, sujeto a que el `custom_code` sea compatible con el runtime elegido.
- Opciones de despliegue: no disponibles de forma confirmada; el tag `custom_code` y la ausencia de pesos GGUF en el repo hacen improbable un uso directo con llama.cpp u Ollama sin conversión. vLLM y TGI requerirían el código del chasis d3-lite.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| zils-lite-dh9 | 852.985.920 | no disponible | Apache-2.0 | Soup de cuerpos d3-lite, `custom_code`, 0 descargas |
| Qwen/Qwen3.5-0.8B | ~0,8B (no confirmado en la informacion) | no disponible | no disponible en la informacion | Modelo base original, carga estándar en `transformers` |
| DouglasBashir/zils-lite-r6 | no disponible | no disponible | Apache-2.0 | Cuerpo d3-lite componente del soup |
| BashirEmran/d3-lite-body-a2 | no disponible | no disponible | Apache-2.0 | Cuerpo d3-lite componente del soup |

## Limitaciones y advertencias

- Modelo de nicho: diseñado para el examen y el formato de decisión del subnet 127 de Bittensor; su rendimiento fuera de ese dominio no está validado.
- Requiere `custom_code`: la carga con herramientas estándar puede fallar sin el código del chasis d3-lite.
- Sesgos: no documentados; al entrenarse con respuestas de un profesor y con Glaive, hereda los sesgos de esas fuentes.
- Riesgo de alucinación: no evaluado; no hay benchmarks publicados que lo cuantifiquen.
- Idiomas: no se declaran idiomas soportados; no se debe asumir multilingüismo.
- Contexto: longitud no especificada, lo que impide planificar cargas con ventanas largas.
- Licencia Apache-2.0 permite uso comercial, pero el autor pide citar tasksource y los datasets originales; conviene revisar LICENSE y NOTICE del repo.
- Madurez: cero descargas y cero likes en el momento de la ficha, sin pipeline declarado; trátese como checkpoint experimental.

## Enlaces

- Hugging Face: https://huggingface.co/VadymPikulyk/zils-lite-dh9
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Cuerpo componente: https://huggingface.co/DouglasBashir/zils-lite-r6
- Cuerpo componente: https://huggingface.co/BashirEmran/d3-lite-body-a2
- Checkpoint de origen del delta: https://huggingface.co/VadymPikulyk/zils-lite-dh6
- Dataset del profesor: https://huggingface.co/zils-ai/zils-relay-answers
- Dataset de tool-use: https://huggingface.co/datasets/glaiveai/glaive-function-calling-v2
