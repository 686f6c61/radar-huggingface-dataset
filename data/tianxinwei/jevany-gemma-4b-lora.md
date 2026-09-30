# tianxinwei/JevAny-Gemma-4B-LoRA

## Resumen

JevAny-Gemma-4B-LoRA es un adaptador LoRA publicado por el usuario tianxinwei que se monta sobre el modelo base google/gemma-4-E4B-it. No se trata de un modelo generativo al uso: es un modelo de decisión (decision-model) que emplea una cabeza de lectura de tipo pointer, es decir, puntúa representaciones de opciones mediante una cabeza aprendida en lugar de generar la respuesta de forma autorregresiva. Esto lo orienta a tareas de selección y clasificación sobre un conjunto de alternativas, y no tanto a la generación libre de texto.

El checkpoint forma parte del ecosistema JevAny y requiere el código del proyecto en la revisión de release indicada por el repositorio del autor para poder ejecutarse. Según la model card, el entrenamiento se realizó sobre 1.772.725 registros de texto y 2.180.242 decisiones etiquetadas, agrupadas en categorías amplias como preferencia, decisiones de agente y herramientas, razonamiento, clasificación y seguridad.

La relevancia del modelo radica en su enfoque de decisión con pointer readout, que admite más de 255 opciones simultáneas (sujeto a los límites de contexto) y, al no generar de forma autorregresiva, permite compartir una única pasada (prefill) del backbone para puntuar alternativas. El repositorio, de solo 0,1 GB, contiene exclusivamente los pesos del adaptador LoRA y los metadatos de la cabeza de lectura de JevAny, no los pesos del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer (google/gemma-4-E4B-it) con cabeza de lectura de tipo pointer |
| Parametros totales | no disponible (adaptador LoRA sobre un modelo base; el nombre sugiere ~4B, sin confirmar) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (se aplican la licencia y los terminos de acceso del modelo base) |
| Formato de pesos | safetensors (adaptador LoRA), mas metadatos de la cabeza de lectura de JevAny |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA que se aplica sobre el backbone de google/gemma-4-E4B-it. Sobre ese backbone se monta una cabeza de lectura de tipo pointer, que puntúa las representaciones de las distintas opciones con una cabeza pequeña aprendida en lugar de decodificar la respuesta token a token. Según la propia model card, los modelos de tipo pointer admiten más de 255 opciones (limitado por el contexto), mientras que los modelos de token directo se entrenan con entropía cruzada sobre todo el vocabulario y resultan más lentos de entrenar. En inferencia, la velocidad se espera similar en ambos casos porque comparten una única pasada de prefill del backbone y no generan la respuesta de forma autorregresiva.

En cuanto al entrenamiento, la model card declara el uso de 1.772.725 registros de texto y 2.180.242 decisiones etiquetadas. Solo se publica el tamaño agregado y grandes categorías (preferencia, decisiones de agente y herramientas, razonamiento, clasificación y seguridad); la mezcla detallada y la composición por fuente no forman parte de esta release. No se especifican en la información disponible el número de tokens de entrenamiento, ni si se emplearon técnicas de RLHF o DPO.

## Capacidades

- Modelo de decisión: selecciona o puntúa una opción entre varias alternativas mediante la cabeza de lectura pointer.
- Soporte de más de 255 opciones por decisión, sujeto a los límites de contexto.
- Inferencia sin generación autorregresiva: una única pasada de prefill del backbone puntúa las alternativas.
- Categorías de decisión cubiertas en el entrenamiento: preferencia, decisiones de agente y herramientas, razonamiento, clasificación y seguridad.
- Ejecución mediante la herramienta de línea de comandos de JevAny (`jevany serve`), con soporte declarado para modo multimodal en la instalación.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Vision, audio, tool calling directo o agentes autónomos: no disponibles como capacidades confirmadas en la información proporcionada (las "decisiones de agente/herramienta" se refieren a la categoría de decisión entrenada, no a una capacidad de tool calling verificada).

## Casos de uso

- Enrutado de decisiones con muchas opciones: al admitir más de 255 alternativas, el modelo puede emplearse para seleccionar una opción entre catálogos amplios (por ejemplo, elegir una categoría, una herramienta o una acción concreta) sin generar texto.
- Clasificación y etiquetado: la categoría de "clasificación" del entrenamiento lo hace adecuado para tareas de asignación de etiquetas sobre registros de texto.
- Selección de preferencias: la categoría de "preferencia" permite usarlo en pipelines de comparación o selección entre respuestas candidatas (por ejemplo, en fases de evaluación o reranking).
- Decisiones de agente y herramientas: la categoría "agent/tool decisions" apunta a su uso como componente de decisión dentro de un agente, eligiendo qué herramienta o acción corresponde a un estado dado.
- Filtrado de seguridad: la categoría "safety" del entrenamiento lo orienta a decidir si un contenido o acción cumple criterios de seguridad.
- Evaluación de razonamiento en pipelines internos: puede puntuar opciones de respuesta en conjuntos de evaluación tipo Transfer-v9 o JevBench para validar decisiones de forma automática.
- Componente de decisión de bajo coste: al no generar de forma autorregresiva y compartir un único prefill, encaja en flujos donde la latencia y el coste por decisión importan, siempre que se disponga del código JevAny.

## Benchmarks y rendimiento

La model card publica resultados de accuracy bajo los protocolos congelados Transfer-v9 y JevBench:

| Conjunto | Tamano | Accuracy |
|---|---|---|
| Transfer-v9 | 1.046 | 70,84 % |
| JevBench Easy | 48 | 100,00 % |
| JevBench Original | 72 | 95,83 % |
| JevBench Hard | 111 | 55,86 % |
| JevBench total | 231 | 77,49 % |

Los valores corresponden a accuracy, no al composite del leaderboard sellado de JevBench. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- El repositorio ocupa 0,1 GB e incluye solo el adaptador LoRA y los metadatos de la cabeza de lectura, no los pesos del modelo base: hay que descargar aparte google/gemma-4-E4B-it.
- La VRAM necesaria depende del modelo base y de su cuantización; no se especifica en la información disponible para este adaptador. A partir del tamaño nominal del backbone (~4B), una estimación orientativa sería del orden de 8-9 GB en bf16 y 3-4 GB en cuantización de 4 bits, pero son cifras no confirmadas por el autor.
- GPU recomendadas: no disponibles. La model card muestra el comando de servicio con `--device cuda --dtype bf16`, sin especificar modelo de GPU.
- Encaje en GPU de consumo: no confirmado. El adaptador en sí es pequeño (0,1 GB), pero el requisito real lo marca el modelo base.
- Opciones de despliegue: JevAny (`jevany serve --checkpoint tianxinwei/JevAny-Gemma-4B-LoRA --device cuda --dtype bf16`), con instalación previa mediante `pip install -e '.[serve,multimodal]'`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: la model card indica que la velocidad de inferencia se espera similar a la de los modelos de token directo, porque ambos usan un único prefill y no generan autorregresivamente; no se ofrecen cifras concretas.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa rigurosa. El único modelo relacionado identificado en la búsqueda es aai-labs/gemma4_4b_lora_finetuned, un LoRA sobre un modelo Gemma 4 de 4B, pero no se han encontrado especificaciones, licencia ni benchmarks que permitan contrastarlo con este adaptador. Como referencia del modelo base, google/gemma-4-E4B-it es el backbone sobre el que se monta, pero tampoco se dispone de sus métricas detalladas en la información proporcionada.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tianxinwei/JevAny-Gemma-4B-LoRA | no disponible (LoRA sobre ~4B) | no disponible | Transfer-v9 70,84 %; JevBench total 77,49 % | no disponible | Hugging Face (adaptador LoRA) |
| aai-labs/gemma4_4b_lora_finetuned | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| google/gemma-4-E4B-it (modelo base) | no disponible | no disponible | no disponible | no disponible | Hugging Face |

## Limitaciones y advertencias

- Requiere el código de JevAny en la revisión de release enlazada desde el repositorio del proyecto; sin él, el checkpoint no es utilizable.
- El repositorio contiene únicamente los pesos del adaptador LoRA y los metadatos de lectura, no los pesos del modelo base; hay que obtener google/gemma-4-E4B-it por separado.
- Se aplican la licencia y los términos de acceso del modelo base, además de la licencia del propio adaptador, que no está especificada en la información disponible. Esto es relevante para el uso comercial.
- El rendimiento cae de forma notable en el subconjunto JevBench Hard (55,86 % frente al 100 % en Easy), lo que sugiere dificultad en los casos más complejos.
- El modelo es un decision-model con cabeza de lectura pointer: no está diseñado para generación libre de texto y su uso fuera de tareas de decisión no está respaldado por la información disponible.
- El límite de más de 255 opciones está sujeto a los límites de contexto, que no se especifican.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no aplicable del mismo modo que en modelos generativos al no producir texto libre, pero la fiabilidad de las decisiones no está caracterizada más allá de los benchmarks publicados.
- Idiomas soportados y cobertura multilingüe: no disponibles.
- El modelo registra 0 descargas y 0 likes en el momento de la consulta, y fue creado el 2026-09-29, por lo que se trata de una release muy reciente y sin validación externa conocida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tianxinwei/JevAny-Gemma-4B-LoRA
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Repositorio del proyecto JevAny: https://github.com/weitianxin/JevAny
- Gemma 4 (Google DeepMind): https://deepmind.google/models/gemma/gemma-4/
- Documentación de Gemma (gemma-llm): https://gemma-llm.readthedocs.io/en/latest/index.html
- Fine-tuning con LoRA en Gemma: https://gemma-llm.readthedocs.io/en/latest/colab_lora_finetuning.html
- Guía de fine-tuning de Gemma 4 con LoRA y QLoRA (Lushbinary): https://lushbinary.com/blog/fine-tune-gemma-4-lora-qlora-complete-guide/
- Modelo relacionado aai-labs/gemma4_4b_lora_finetuned: https://huggingface.co/aai-labs/gemma4_4b_lora_finetuned
