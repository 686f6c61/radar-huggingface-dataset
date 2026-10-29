# vkusterl/extrator-cardapios-0.5b

## Resumen

El Extrator de cardápios 0.5B es un ajuste fino mediante LoRA del modelo Qwen2.5-0.5B-Instruct, publicado por el usuario vkusterl, que convierte cartas de restaurante escritas en texto libre —mensajes de WhatsApp, texto copiado de un PDF, publicaciones de redes sociales o salida de OCR— en un catálogo estructurado en formato JSON Lines. Cada línea del resultado contiene los campos nombre, descripción, precio, porción, categoría, restricciones alimentarias, tamaños y adicionales del artículo correspondiente.

El modelo tiene 494.032.768 parámetros y licencia Apache 2.0, y está entrenado específicamente para portugués de Brasil. Su interés reside en que mide hasta dónde puede llegar un modelo de 0,5B parámetros, ejecutable en CPU y con un coste muy inferior al de una llamada a un modelo grande, cuando la tarea de extracción está bien delimitada y los datos y la evaluación se han construido con cuidado.

En un conjunto de prueba fuera de distribución, escrito a mano y nunca utilizado para tomar decisiones, alcanza un F1 de artículo correcto de 0,645, frente a 0,450 de un analizador basado en reglas y 0,060 del mismo modelo base sin ajuste. El modelo se distribuye con 0 descargas y 0 likes en el momento de redactar esta ficha, por lo que aún no cuenta con validación independiente de la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen2, con ajuste fino LoRA sobre Qwen2.5-0.5B-Instruct |
| Parámetros totales | 494.032.768 |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | no disponible |
| Idiomas soportados | portugués (pt), orientado a portugués de Brasil |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B-Instruct, un transformer decoder-only de 494 millones de parámetros, y se ajusta con LoRA para una única tarea de extracción de información: transformar texto libre en JSON Lines con un esquema fijo. El entrenamiento se realizó sobre el conjunto `vkusterl/cardapios-sinteticos-ptbr`, compuesto por cartas de restaurante sintéticas en portugués de Brasil, y se ejecutó en una única GTX 1070. La model card no documenta el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO.

La innovación principal no es arquitectónica, sino de planteamiento: fijar una instrucción de sistema concreta, definir un esquema de salida validable y evaluar con conjuntos fuera de distribución escritos a mano. El autor reporta dos versiones de datos (v1 y v2) y reserva un conjunto de prueba OOD que nunca se usó para decisiones de diseño. La salida es JSON Lines, con una línea por artículo y los adicionales anidados en el artículo inmediatamente anterior, que es la convención de los datos de entrenamiento.

## Capacidades

- Extracción de información estructurada a partir de cartas de restaurante en texto libre, con salida en JSON Lines.
- Generación de JSON válido: 0,996 en el test sintético y 0,917 en el test fuera de distribución.
- Cobertura de campos: nombre, descripción, precio, porción, categoría, restricciones alimentarias, tamaños y adicionales.
- Manejo de múltiples estilos de entrada: texto corrido, informal, publicaciones de Instagram, listas y salida de OCR.
- Convención de adicionales: el adicional se anida en el artículo que lo precede en el texto original.
- Ejecución en CPU, según el ejemplo de inferencia incluido en la model card.
- No se documenta soporte de tool calling ni function calling.
- No se documenta modo thinking, capacidades de visión ni de audio.
- Multilingüismo limitado al portugués; no hay evidencia de funcionamiento en otros idiomas.

## Casos de uso

- Digitalización de cartas de restaurante para plataformas de delivery: el modelo convierte texto pegado desde PDF o WhatsApp en un catálogo JSON Lines que puede cargarse directamente en una base de datos de productos.
- Procesamiento de pedidos recibidos por WhatsApp: a partir del mensaje del cliente con el menú, se genera una lista estructurada de artículos con precio y categoría para alimentar un sistema de pedidos.
- Normalización de cartas extraídas por OCR: la salida de un OCR suele contener ruido y saltos de línea arbitrarios; el modelo la convierte en registros limpios con precio y categoría, y el autor reporta un F1 de 0,934 en el estilo «corrido» del test sintético.
- Migración de catálogos a un TPV o POS: los registros JSON Lines pueden transformarse en filas de una tabla de productos con nombre, descripción, precio y adicionales.
- Enriquecimiento de catálogos con restricciones alimentarias: el campo de restricciones alcanza 0,980 en el test fuera de distribución, lo que permite etiquetar opciones vegetarianas, sin gluten u otras.
- Extracción por lotes en infraestructura sin GPU: al ejecutarse en CPU, el modelo puede procesar grandes volúmenes de cartas en un servidor convencional con un coste marginal muy bajo.
- Triaje previo a un modelo mayor: usar el modelo de 0,5B para estructurar la carta y reservar un LLM de mayor tamaño solo para los casos en los que la validación del esquema falle.

## Benchmarks y rendimiento

Resultados de F1 de artículo correcto. Un artículo solo cuenta como correcto cuando el nombre se empareja con el gabarito y el precio (o la grade de tamaños) y la categoría son correctos.

| Modelo | Parámetros | Test sintético (100) | Desarrollo OOD (24) | Test OOD (24) |
|---|---|---|---|---|
| Extrator v2 (este modelo) | 0,5 B | 0,972 | 0,659 | 0,645 |
| Extrator v1 (primera ronda) | 0,5 B | 0,821 | 0,580 | 0,582 |
| Qwen2.5 1.5B Instruct sin ajuste fino | 1,5 B | n/d | 0,051 | 0,120 |
| Qwen2.5 0.5B Instruct sin ajuste fino | 0,5 B | n/d | 0,090 | 0,060 |
| Analizador por reglas | no aplica | 0,496 | 0,359 | 0,450 |

En el test sintético completo, con 500 cartas, este modelo obtiene 0,967. Acierto por campo calculado sobre los artículos emparejados:

| Métrica | Test sintético (500) | Desarrollo OOD (24) | Test OOD (24) |
|---|---|---|---|
| Artículos encontrados (emparejados) | 0,989 | 0,890 | 0,910 |
| Nombre idéntico o casi idéntico | 0,994 | 0,967 | 0,970 |
| Precio o grade de tamaños | 0,990 | 0,934 | 0,941 |
| Categoría | 0,985 | 0,762 | 0,743 |
| Porción | 0,988 | 0,910 | 0,861 |
| Restricciones | 0,996 | 0,959 | 0,980 |
| Adicionales | 0,998 | 1,000 | 1,000 |
| Descripción (F1 de tokens) | 0,975 | 0,776 | 0,613 |
| Restaurante | 0,994 | 0,667 | 0,750 |
| Artículo correcto, precisión | 0,969 | 0,655 | 0,660 |
| Artículo correcto, revocación | 0,964 | 0,664 | 0,631 |
| Artículo correcto, F1 | 0,967 | 0,659 | 0,645 |
| JSON válido | 0,996 | 0,958 | 0,917 |
| Carta completa perfecta | 0,732 | 0,125 | 0,042 |

F1 de artículo correcto por estilo de escritura en el test sintético:

| Estilo | Cartas | Modelo | Reglas |
|---|---|---|---|
| Corrido | 40 | 0,934 | 0,000 |
| Informal | 31 | 0,929 | 0,214 |
| Instagram | 31 | 0,961 | 0,203 |
| Lista | 86 | 0,964 | 0,378 |
| OCR | no disponible (fila truncada en la información de origen) | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir de los 494 millones de parámetros y sin contar el overhead de activaciones y caché KV: aproximadamente 1 GB en fp16 o bf16, 0,5 GB en int8 y 0,25 GB en int4. Son estimaciones derivadas, no cifras publicadas por el autor.
- GPU recomendadas: no se especifican. El entrenamiento se realizó en una GTX 1070, y por tamaño cabe en cualquier GPU consumer con al menos 2 GB de VRAM.
- Cabe en GPU consumer: sí, en tarjetas de gama baja y media; también en CPU, como demuestra el ejemplo de inferencia de la model card.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible`) y vLLM. Para llama.cpp u Ollama sería necesaria una conversión a GGUF, que no se distribuye en el repositorio.
- Latencia y throughput: no disponible; la model card indica que la salida del ejemplo se generó en CPU, pero no publica tiempos ni tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | F1 test OOD | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Extrator de cardápios 0.5B | 494 M | no disponible | 0,645 | Apache 2.0 | safetensors en HuggingFace |
| Qwen2.5-0.5B-Instruct (base sin ajuste) | 494 M | no disponible en la información | 0,060 | Apache 2.0 | safetensors en HuggingFace |
| Qwen2.5-1.5B-Instruct (sin ajuste) | 1,5 B | no disponible en la información | 0,120 | Apache 2.0 | safetensors en HuggingFace |
| Analizador basado en reglas | no aplica | no aplica | 0,450 | no disponible | código propio, no es un modelo |

La comparación relevante es que un modelo de 0,5B ajustado supera a un modelo base de 1,5B sin ajuste en esta tarea concreta (0,645 frente a 0,120), y también al analizador por reglas (0,450). No se dispone de datos de otros modelos especializados en extracción de cartas con los que comparar directamente.

## Limitaciones y advertencias

- El modelo solo está entrenado y evaluado en portugués de Brasil; no hay evidencia de funcionamiento en otros idiomas ni en portugués europeo.
- El dominio está restringido a cartas de restaurante; no es un modelo generalista y su rendimiento fuera de ese ámbito no está medido.
- Caída acusada fuera de distribución: el F1 de artículo correcto baja a 0,645, la categoría a 0,743, la descripción a 0,613 y el campo restaurante a 0,750.
- Solo el 4,2 % de las cartas del test OOD se extraen de forma completamente perfecta, aunque el 91 % de los artículos se encuentran y el 91,7 % de las salidas son JSON válido.
- Riesgo de alucinación en formatos de entrada que no aparecen en los datos sintéticos de entrenamiento; el autor señala que los modelos sin ajuste tienden a responder con bloques de código y campos intercambiados.
- Es necesario usar exactamente la misma instrucción de sistema que en el entrenamiento; otra instrucción puede degradar la salida.
- Se recomienda descartar las líneas JSON inválidas en lugar de rechazar la carta completa, tal como hace la función `de_jsonl` del autor.
- Los datos de entrenamiento son sintéticos, lo que puede introducir un sesgo hacia los formatos que produce el generador.
- Hereda los sesgos y limitaciones del modelo base Qwen2.5-0.5B-Instruct.
- La licencia Apache 2.0 permite uso comercial, modificación y redistribución, sin restricciones adicionales documentadas.
- El repositorio tiene 0 descargas y 0 likes, por lo que no existe validación independiente de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vkusterl/extrator-cardapios-0.5b
- Demostración en Spaces: https://huggingface.co/spaces/vkusterl/extrator-cardapios
- Conjunto de datos de entrenamiento: https://huggingface.co/datasets/vkusterl/cardapios-sinteticos-ptbr
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
