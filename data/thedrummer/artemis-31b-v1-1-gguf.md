# TheDrummer/Artemis-31B-v1.1-GGUF

## Resumen

Artemis-31B-v1.1 es un modelo de lenguaje fine-tuneado por TheDrummer sobre la base instructa de Google, concretamente sobre `google/gemma-4-31B-it`. El autor, un ingeniero de software que publica bajo el nombre de TheDrummer, se especializa en modelos orientados a la creatividad, la escritura literaria y la interacción desalineada con el usuario, priorizando la imaginación y el dinamismo narrativo sobre el rendimiento en tareas técnicas o de razonamiento lógico.

El modelo se distribuye en formato GGUF, lo que permite su ejecución local mediante `llama.cpp`, Ollama u otros motores compatibles. Con 30,7 mil millones de parámetros, es un modelo de gran tamaño que requiere hardware de gama alta para su inferencia. La versión 1.1 es una iteración sobre la v1 que busca corregir problemas de estabilidad en la generación, como la tendencia a "dash spiraling" o la necesidad de ajustes manuales en el muestreo, manteniendo la esencia creativa de la versión original.

El modelo es relevante para un nicho de usuarios que buscan una experiencia de interacción con IA más libre, creativa y menos alineada con las restricciones de seguridad típicas de los modelos comerciales, centrándose en la narrativa, el roleplay y la exploración de temas complejos o ambiguos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base: Google Gemma 4 31B instruct) |
| Parametros totales | 30.697.345.596 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (varias precisiones, no se especifican las variantes) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la licencia del modelo base Gemma 4 31B es Gemma Terms of Use) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base `google/gemma-4-31B-it`, un transformer denso de 31B parámetros optimizado para instrucciones. TheDrummer ha aplicado un fine-tuning sobre esta base, un proceso de ajuste que, según el autor, se centra en expandir las capacidades creativas y literarias del modelo, así como en reducir el "alignment" corporativo para permitir una mayor libertad en la generación de contenido, especialmente en narrativa y roleplay.

No se proporcionan detalles técnicos sobre el proceso de entrenamiento, como el número de tokens, la composición exacta del dataset o el uso de técnicas como RLHF o DPO. La información disponible sugiere que el ajuste se ha realizado con un enfoque en la calidad de la escritura, la dinámica de los personajes y la capacidad de mantener la coherencia en escenarios complejos o ambiguos, en lugar de priorizar la precisión factual o el razonamiento lógico.

## Capacidades

- Generación de texto creativo: destacado para la escritura literaria, narrativa y storytelling, con un enfoque en la calidad del estilo y la coherencia.
- Roleplay y simulación de personajes: capaz de mantener conversaciones y escenarios de roleplay con una actitud menos restrictiva y más abierta a temas complejos.
- Modo de pensamiento ("thinking"): soporta el uso de etiquetas como `<thinking>` o `<think>` para generar un razonamiento interno antes de responder, aunque no se especifica si esto es una capacidad inherente del modelo base o una característica del fine-tuning.
- Adherencia a instrucciones: el modelo puede seguir instrucciones complejas, aunque el autor indica que no es su prioridad máxima.
- Conocimiento general: el conocimiento del mundo es heredado del modelo base Gemma 4 31B, aunque no se detalla su alcance.

## Casos de uso

- Escritura creativa y narrativa: el modelo es adecuado para generar cuentos, novelas, guiones y otros formatos narrativos, con un estilo de escritura cuidado y una capacidad para desarrollar tramas y personajes.
- Roleplay y juegos de rol: los usuarios pueden interactuar con el modelo como si fuera un personaje, en escenarios de rol de mesa o juegos de texto, gracias a su capacidad para mantener una actitud consistente y su apertura a temas complejos.
- Creación de contenido para juegos: los desarrolladores pueden usar el modelo para generar diálogos, descripciones de escenarios o la historia de fondo de un juego.
- Generación de ideas creativas: puede ser útil para la lluvia de ideas en proyectos de ficción, como la creación de personajes, tramas o mundos de fantasía.
- Entretenimiento conversacional: para usuarios que buscan una IA con la que mantener conversaciones abiertas, sin las restricciones de seguridad de otros modelos, con un estilo más natural y menos "corporativo".
- Exploración de temas complejos: el modelo puede abordar temas ambiguos o difíciles con una actitud menos moralizante que otros modelos, lo que puede ser de interés para la investigación narrativa o el análisis de temas controvertidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no se especifica, pero para un modelo de 31B en cuantización GGUF, se estima un consumo de entre 20 GB y 40 GB de VRAM, dependiendo de la cuantización (por ejemplo, Q4_K_M requeriría ~20 GB, Q8_0 ~35 GB).
- GPU recomendadas: se recomienda una GPU con al menos 24 GB de VRAM para cuantizaciones bajas (RTX 3090, RTX 4090) y GPUs con 48 GB o más para cuantizaciones altas (A6000, A100, H100).
- Si cabe en consumer GPU: sí, en GPUs de gama alta con 24 GB de VRAM, como la RTX 3090 o RTX 4090, con cuantizaciones de 4 bits o 5 bits.
- Opciones de despliegue: llama.cpp, Ollama, TGI (Text Generation Inference), vLLM y otros motores compatibles con GGUF.
- Latencia y throughput estimados: no se proporcionan datos concretos, pero dependerán del hardware y la cuantización utilizada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Artemis-31B-v1.1 | 31B | no disponible | no disponible | Fine-tuning de Gemma 4 31B, enfocado en creatividad y roleplay. |
| Google Gemma 4 31B instruct | 31B | no disponible | Gemma Terms of Use | Modelo base, más alineado y con un enfoque más generalista. |
| Mistral Small 3.1 24B | 24B | 128k | Apache 2.0 | Modelo generalista, menos enfocado en creatividad, pero con una licencia más permisiva. |

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un modelo fine-tuneado para la creatividad, puede priorizar la coherencia narrativa sobre la veracidad factual, por lo que es más propenso a la alucinación en tareas de conocimiento general.
- Riesgo de contenido inapropiado: el modelo está diseñado para tener menos restricciones de contenido, lo que puede generar texto ofensivo, explícito o dañino. No es adecuado para aplicaciones donde la seguridad sea crítica.
- Limitaciones de idioma: no se especifican los idiomas soportados, pero el modelo base Gemma 4 31B tiene un buen rendimiento en inglés y otros idiomas, aunque el fine-tuning puede haber reducido su capacidad multilingüe.
- Restricciones de licencia: la licencia del modelo no está disponible, pero el modelo base `google/gemma-4-31B-it` está sujeto a los Gemma Terms of Use de Google, que pueden imponer restricciones de uso comercial.
- Estabilidad de la generación: la v1.1 corrige problemas de la v1, pero el autor recomienda el uso de samplers personalizados para obtener los mejores resultados, lo que puede requerir ajustes manuales.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/TheDrummer/Artemis-31B-v1.1-GGUF
- Hugging Face (modelo original): https://huggingface.co/TheDrummer/Artemis-31B-v1.1
- Hugging Face (v1): https://huggingface.co/TheDrummer/Artemis-31B-v1-GGUF
