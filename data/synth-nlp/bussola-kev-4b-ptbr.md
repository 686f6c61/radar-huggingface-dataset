# Synth-NLP/bussola-kev-4b-ptbr

## Resumen

Bússola-Kev-4B es un modelo de clasificación de intenciones para portugués de Brasil, desarrollado por Synth-NLP. Recibe una frase en portugués junto con una lista de opciones y selecciona la intención que corresponde al usuario (por ejemplo, "vai chover amanhã?" → `consultar clima`). No es un modelo generativo de propósito general, sino un clasificador de decisión ajustado específicamente para la tarea de elección de intención entre un conjunto cerrado de candidatas.

Técnicamente es un ajuste delta (LoRA más una pointer head) sobre el modelo base jaredpalmer/kev-4b, con la base congelada durante el entrenamiento. Forma parte de la familia experimental Bússola, cuyo objetivo es medir si los datos sintéticos en portugués mejoran la clasificación de intenciones, especialmente en intenciones que el modelo nunca ha visto durante el entrenamiento. El modelo se sirve mediante el código de Kev con la API System One, el mismo protocolo que utiliza el modelo de referencia Jev.

Su relevancia radica en los resultados del experimento: con 4B parámetros iguala al modelo de referencia Jev en intenciones no vistas (0,867 frente a 0,863) y lo supera en intenciones vistas (0,933 frente a 0,864), además de mejorar en +2,0 puntos sobre el ajuste solo con datos reales en escenarios no vistos. La licencia es Apache 2.0 y el repositorio ocupa 0,2 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ajuste delta (LoRA + pointer head) sobre transformer jaredpalmer/kev-4b; base congelada |
| Parametros totales | 4B (modelo base kev-4b); parámetros del adaptador no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Portugués de Brasil (pt-BR) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste delta sobre jaredpalmer/kev-4b: se aplica LoRA junto con una pointer head sobre el modelo base, que permanece congelado durante el entrenamiento. El entrenamiento se realizó con learning rate 2e-5, 2 épocas, tamaño de lote 8, precisión bf16 y semilla 0, con los aumentos de datos propios de Kev desactivados. El comando de entrenamiento es `python -m kev.train --init_from `.

El conjunto de entrenamiento contiene 25.788 filas: 5.405 ejemplos reales del dataset MASSIVE pt-BR correspondientes a 30 intenciones, más 20.383 frases sintéticas, de las cuales una parte cubre esas mismas 30 intenciones y otra cubre 30 intenciones nuevas. Los datos sintéticos se generaron con una pipeline agéntica que parte únicamente de la lista de intenciones (nombre y descripción): planifica peticiones variadas con personas, situaciones cotidianas y estilos de escritura reales (oasst1), genera las frases con Gemma 4 12B y Qwen3.5-9B, reescribe parte de ellas con Evol-Instruct para aumentar la dificultad, filtra duplicados y frases demasiado parecidas a los datos de test mediante Qwen3-Embedding-0.6B, y valida con dos jueces LLM que deben coincidir en la intención y en una nota de naturalidad. Finalmente selecciona las frases difíciles para el modelo y usa sus errores para pedir la siguiente ronda (LLM2LLM).

## Capacidades

- Clasificación de intenciones en portugués de Brasil: dada una frase y una lista de opciones, selecciona la intención correcta.
- Elección entre un conjunto cerrado de candidatas (evaluado con 20 opciones por frase).
- Generalización a intenciones no vistas durante el entrenamiento (escenarios completos reservados).
- Manejo de peticiones variadas en estilo y registro, gracias a la diversidad de personas y estilos introducida en la generación sintética.
- Discriminación frente a intenciones vecinas similares, mediante ejemplos contrastivos generados en la pipeline.
- Servicio mediante la API System One del código de Kev.
- No se documentan capacidades de generación libre, tool calling, agentes, visión ni audio.

## Casos de uso

- Enrutamiento de consultas en asistentes conversacionales: el modelo recibe el mensaje del usuario y la lista de intenciones disponibles del asistente (clima, alarmas, música, etc.) y devuelve la intención seleccionada para dirigir la conversación al flujo adecuado.
- Clasificación de tickets de soporte: con una taxonomía de categorías definida, el modelo asigna cada mensaje entrante a la categoría correspondiente, incluyendo categorías que no aparecieron en el entrenamiento gracias a su capacidad de generalización a intenciones no vistas.
- Triaje en chatbots de atención al cliente: selección de la intención entre las opciones del dominio para derivar la consulta al departamento o al agente automático correcto.
- Enrutamiento en asistentes de voz o texto para portugués de Brasil: identificación de la acción solicitada antes de invocar el servicio correspondiente, con la ventaja de que el modelo funciona con una lista de opciones que puede cambiarse en tiempo de inferencia.
- Evaluación de taxonomías de intenciones: uso del modelo como clasificador de referencia para medir la calidad y la separabilidad de un conjunto de intenciones propuesto, dado que el modelo acepta la lista de opciones como entrada.
- Investigación sobre datos sintéticos: reproducción del experimento Bússola para estudiar el efecto del entrenamiento con datos sintéticos en la generalización a intenciones no vistas en portugués.
- Moderación o filtrado por categoría: asignación de mensajes a categorías predefinidas en pipelines de procesamiento de texto en portugués de Brasil.

## Benchmarks y rendimiento

Evaluación sobre la validación del MASSIVE pt-BR con 20 opciones por frase (acaso = 0,050). Los escenarios "no vistas" son conjuntos completos reservados: ninguna frase, intención ni dominio de ellos entró en el entrenamiento ni en la generación de los sintéticos.

| Modelo | Base | No vistas | Vistas |
|---|---|---:|---:|
| Jev (API de TypeSafe, referencia) | — | 0,863 | 0,864 |
| Bússola-Kev-4B (este) | kev-4b | 0,867 | 0,933 |
| Bússola-Kev-9B | kev-9b | 0,861 | 0,929 |
| Bússola-Kev-0.8B | kev-0.8b | 0,815 | 0,917 |
| Bússola-Laya | laya | 0,763 | 0,908 |

Comparación contra Jev: empata en no vistas (+0,005 [−0,012; +0,021]) y lo supera en vistas (+0,069 [+0,050; +0,088]).

Ablación del efecto de los datos sintéticos con el mismo modelo base:

| Configuración | No vistas | Vistas |
|---|---:|---:|
| Sin ajuste | 0,786 | 0,792 |
| Ajustado solo con los 5.405 ejemplos reales | 0,847 | 0,935 |
| Ajustado con reales + sintéticos (Bússola) | 0,867 | 0,933 |

Ganancia del sintético sobre el ajuste solo con reales en no vistas: +2,0 puntos [+1,0; +3,0] (intervalo de confianza del 95%, bootstrap pareado por frase). En vistas, ambos ajustes empatan.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa, un modelo de 4B en bf16 requiere del orden de 8 GB solo para pesos, pero el adaptador LoRA y la pointer head añaden requisitos no documentados.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el autor documenta el servicio mediante el código de Kev con la API System One, con el comando `uv run --extra serve python -m kev.serve --run Synth-NLP/bussola-kev-4b-ptbr`. No se documentan opciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | No vistas | Vistas | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| Bússola-Kev-4B | 4B | no disponible | 0,867 | 0,933 | Apache 2.0 | Hugging Face |
| Bússola-Kev-9B | 9B | no disponible | 0,861 | 0,929 | no disponible | Hugging Face |
| Bússola-Kev-0.8B | 0.8B | no disponible | 0,815 | 0,917 | no disponible | Hugging Face |
| Bússola-Laya | no disponible | no disponible | 0,763 | 0,908 | no disponible | Hugging Face |
| Jev (API de TypeSafe) | no disponible | no disponible | 0,863 | 0,864 | propietaria (API) | API de TypeSafe |

## Limitaciones y advertencias

- Los resultados se basan en una única semilla de entrenamiento en los modelos Kev, lo que limita la estimación de la varianza del rendimiento.
- La evaluación cubre una sola tarea (elección de intención) y un solo conjunto de datos (MASSIVE pt-BR).
- El portugués de Brasil del MASSIVE es una localización generada por LLM a partir del portugués de Portugal, lo que puede introducir artefactos lingüísticos.
- El modelo está especializado en elección de intención entre opciones; no es un modelo generativo de propósito general y no debe usarse para tareas fuera de ese ámbito.
- El Jev se evaluó mediante su API en un solo sorteo (el 0), mientras que Bússola-Kev-4B se evaluó con la media de 3 sorteos de las opciones; las comparaciones con Jev usan ese sorteo.
- No se documentan sesgos específicos ni tasas de alucinación; al ser un clasificador cerrado, el riesgo de alucinación se limita a elegir una opción incorrecta de la lista.
- Licencia Apache 2.0, la misma del modelo base, sin restricciones adicionales documentadas para uso comercial.
- Los pesos derivan de jaredpalmer/kev-4b y las frases reales del MASSIVE están bajo CC BY 4.0 de Amazon.com, Inc. o afiliadas; los datos sintéticos se generaron con Gemma 4 12B y Qwen3.5-9B.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 2026-11-19; se trata de una publicación reciente sin adopción documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Synth-NLP/bussola-kev-4b-ptbr
- Modelo base kev-4b: https://huggingface.co/jaredpalmer/kev-4b
- Código de Kev: https://github.com/jaredpalmer/kev
- Dataset de entrenamiento: https://huggingface.co/datasets/Synth-NLP/massive-pt-br-sintetico-v4
- Dataset de evaluación: https://huggingface.co/datasets/Synth-NLP/massive-pt-br-avaliacao
- Paper del MASSIVE: https://arxiv.org/abs/2204.08582
- Bússola-Kev-9B: https://huggingface.co/Synth-NLP/bussola-kev-9b-ptbr
- Bússola-Kev-0.8B: https://huggingface.co/Synth-NLP/bussola-kev-0.8b-ptbr
- Bússola-Laya: https://huggingface.co/Synth-NLP/bussola-laya-ptbr
- Gemma 4 12B: https://huggingface.co/google/gemma-4-12B-it
- Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Qwen3-Embedding-0.6B: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
