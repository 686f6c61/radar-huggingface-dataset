# wesjos/Qwen3.8-27B-CuteHuman

## Resumen

Qwen3.8-27B-CuteHuman es un ajuste de personalidad (persona tune) publicado por el usuario wesjos sobre los pesos del modelo base Qwen/Qwen3.8-27B. Se trata de la versión fusionada (merge) de un adaptador LoRA de rango 16 entrenado para modificar el estilo conversacional del modelo: respuestas más cortas, más cálidas y sin las fórmulas típicas de asistente ("AI-speak"). El resultado se distribuye como pesos BF16 completos en 18 shards, con un total de 27.781.427.952 parámetros y un repositorio de 55,6 GB.

El modelo hereda la arquitectura multimodal image-text-to-text del Qwen3.8-27B original (etiqueta `qwen3_5` en los metadatos de Hugging Face), por lo que acepta entradas de imagen y texto y se carga mediante `AutoModelForImageTextToText` de transformers. La model card indica que el ajuste no altera el conocimiento del modelo, solo la forma de expresarse, y que no requiere system prompt para activar la persona.

Es relevante porque ejemplifica una categoría creciente de publicaciones: adaptadores de bajo rango (10,49 millones de parámetros entrenables, un 0,038 % del total) fusionados en pesos completos para simplificar el despliegue, con una evaluación de tono y una comprobación de regresión en MMLU. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la información pública disponible es limitada fuera de la model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal image-text-to-text, familia Qwen3.8 (etiqueta `qwen3_5`); detalles internos no disponibles |
| Parámetros totales | 27.781.427.952 (27,78 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16 (pesos publicados); 4-bit NF4 mediante BitsAndBytes según la model card; adaptador GGUF para llama.cpp disponible en repositorio separado |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16, 18 shards, 55,6 GB); adaptador LoRA de 42 MB y adaptador GGUF de 21 MB en repositorios aparte |

## Arquitectura y entrenamiento

El modelo es el resultado de fusionar un adaptador LoRA de rango 16 (42 MB, 10,49 millones de parámetros entrenables, el 0,038 % del total) en los pesos del Qwen3.8-27B y exportar el conjunto en BF16. La arquitectura subyacente es la del modelo base Qwen3.8-27B, de tipo transformer multimodal image-text-to-text; la información proporcionada no detalla el número de capas, la dimensión oculta, el mecanismo de atención ni la longitud de contexto nativa.

No se especifican en la información disponible el volumen de tokens de entrenamiento del adaptador, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO. La model card sí documenta una evaluación de tono sobre 40 prompts y una comprobación de regresión con MMLU 5-shot sobre 570 ítems, realizada sobre el adaptador antes de la fusión. La innovación destacable es de producto más que de arquitectura: un ajuste de estilo que reduce la longitud mediana de respuesta y elimina las muletillas de asistente manteniendo el rendimiento en conocimiento general.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y chino, con un registro más breve, cálido y coloquial que el modelo base.
- Procesamiento de entradas de imagen junto a texto (pipeline image-text-to-text), heredado del modelo base.
- Generación de código y artefactos estructurados: la model card muestra ejemplos de generación de animaciones SVG.
- Razonamiento aritmético básico y comprobaciones rápidas, ilustradas en los ejemplos de la model card.
- Uso como agente de terminal con llamadas a herramientas: el ejemplo de la model card muestra la restauración de un SVG borrado y la escritura posterior de una canción, manteniendo el personaje entre llamadas.
- Modo thinking desactivable mediante `enable_thinking=False` en la plantilla de chat; la model card recomienda desactivarlo para conversación casual.
- No se documentan en la información disponible capacidades de audio ni de tool calling más allá del ejemplo de agente mostrado.

## Casos de uso

- Asistentes conversacionales de atención al cliente: el ajuste reduce la longitud mediana de respuesta de 351 a 215 caracteres y elimina las fórmulas de asistente (0 apariciones de AI-speak en 40 prompts frente a 2 en el base), lo que produce interacciones más naturales y menos verbosas en chat multi-turno.
- Personajes y roleplay en aplicaciones de entretenimiento: la model card etiqueta explícitamente el modelo como `roleplay` y `conversational`, y la persona se activa sin necesidad de system prompt, lo que simplifica la integración en productos de chat con personaje.
- Agentes de terminal con herramientas: el ejemplo publicado muestra al modelo restaurando un archivo SVG eliminado y manteniendo el registro conversacional entre llamadas a herramientas, adecuado para asistentes de CLI con personalidad consistente.
- Generación de contenido visual ligero: generación de animaciones SVG (gato persa bailando, ramen) a partir de instrucciones en chino e inglés, útil para prototipado rápido de recursos gráficos.
- Asistente personal multilingüe inglés-chino: para usuarios que alternan entre ambos idiomas en conversación cotidiana, con respuestas cortas y un tono cálido.
- Base para ajustes de estilo posteriores: al publicarse también el adaptador LoRA (42 MB) y su versión GGUF (21 MB), sirve como punto de partida para experimentar con mezclas de personalidad sin reentrenar desde cero.
- Despliegue en una única GPU de 24 GB: la model card documenta la carga en 4-bit NF4 con BitsAndBytes, lo que permite ejecutar el modelo en una tarjeta consumer de gama alta.

## Benchmarks y rendimiento

| Métrica | Qwen3.8-27B | + CuteHuman |
|---|---|---|
| MMLU 5-shot (570 ítems) | 77,54 % | 77,19 % |
| Cuteness (escala 1-5) | 1,95 | 2,97 |
| Apariciones de AI-speak | 2 / 40 | 0 / 40 |
| Longitud mediana de respuesta | 351 caracteres | 215 caracteres |

Las métricas de tono y longitud se midieron sobre el adaptador antes de la fusión, con una evaluación de 40 prompts. La model card indica que la diferencia en MMLU no es una regresión estadísticamente significativa. No se han publicado en la información disponible resultados de otros benchmarks estándar (HumanEval, GSM8K, MMLU-Pro, etc.).

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 55,6 GB solo para pesos, más overhead de activaciones y caché KV; requiere al menos una GPU de 80 GB o varias GPUs en paralelo.
- VRAM estimada en 4-bit NF4: la model card indica que cabe en una única tarjeta de 24 GB con `BitsAndBytesConfig` (NF4, doble cuantización, cómputo en BF16).
- GPU recomendadas: A100 80 GB o H100 para BF16; RTX 4090 (24 GB) o equivalentes para la carga en 4-bit.
- Cabe en GPU consumer de 24 GB únicamente con cuantización de 4 bits.
- Opciones de despliegue: transformers (`AutoModelForImageTextToText`), BitsAndBytes para 4-bit, llama.cpp o llama-server mediante el adaptador GGUF publicado en repositorio separado. No se documentan en la información disponible integraciones con vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-CuteHuman | 27,78 B | no disponible | Apache-2.0 | Persona conversacional fusionada sobre Qwen3.8-27B | Pesos BF16, LoRA y adaptador GGUF |
| Qwen3.8-27B (base) | 27,78 B | no disponible | Apache-2.0 | Modelo multimodal generalista | Pesos oficiales en Hugging Face |
| CuteHuman-LoRA (adaptador) | 10,49 M entrenables | no disponible | Apache-2.0 | Mismo ajuste sin fusionar | Adaptador de 42 MB |

La información disponible no incluye datos de benchmarks de modelos de la competencia en la misma categoría (ajustes de personalidad sobre modelos de ~27 B), por lo que la comparativa se limita a las variantes del propio proyecto y su modelo base.

## Limitaciones y advertencias

- El ajuste modifica el tono hacia respuestas más cortas y coloquiales; en tareas que requieren respuestas extensas y estructuradas puede ser necesario contrarrestar la persona con instrucciones explícitas.
- Solo se declaran idiomas inglés y chino; no hay evidencia publicada de comportamiento en castellano ni en otros idiomas.
- La evaluación de tono se realizó sobre 40 prompts y la de MMLU sobre 570 ítems, muestras pequeñas que limitan la solidez estadística de las conclusiones.
- No se documentan sesgos conocidos, tasas de alucinación ni evaluaciones de seguridad en la información proporcionada.
- El modelo tiene 0 descargas y 0 likes, y procede de un autor individual; no cuenta con validación independiente de la comunidad.
- Aunque la licencia es Apache-2.0 y permite uso comercial, el modelo base Qwen3.8-27B debe verificarse por separado para confirmar que sus términos son compatibles con el uso previsto.
- La longitud de contexto no está documentada en la información disponible; no debe asumirse un valor concreto para planificación de producción.
- El repositorio ocupa 55,6 GB en BF16, lo que implica requisitos de almacenamiento y ancho de banda considerables para el despliegue.

## Enlaces

- Modelo fusionado: https://huggingface.co/wesjos/Qwen3.8-27B-CuteHuman
- Adaptador LoRA: https://huggingface.co/wesjos/Qwen3.8-27B-CuteHuman-LoRA
- Adaptador GGUF: https://huggingface.co/wesjos/Qwen3.8-27B-CuteHuman-LoRA-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Ejemplo SVG base: https://huggingface.co/wesjos/Qwen3.8-27B-CuteHuman/blob/main/demos/compare/cat/base.svg
- Ejemplo SVG con CuteHuman: https://huggingface.co/wesjos/Qwen3.8-27B-CuteHuman/blob/main/demos/compare/cat/cute.svg
