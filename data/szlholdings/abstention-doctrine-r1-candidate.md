# SZLHOLDINGS/abstention-doctrine-r1-candidate

## Resumen

abstention-doctrine-r1-candidate es un adaptador LoRA de tipo candidato desarrollado por SZLHOLDINGS sobre el modelo base Qwen/Qwen3-1.7B. Forma parte del programa interno "abstention-doctrine", cuyo objetivo declarado es entrenar a los modelos para que se abstengan de responder antes que fabricar información, es decir, priorizar la honestidad de fallo cerrado (fail-closed honesty) frente a la generación especulativa. El adaptador se alinea con el corpus de abstención de la organización, publicado como abstention-doctrine-sft-v1.

El modelo se distribuye en formato PEFT/LoRA sobre safetensors, con un tamaño de repositorio de 0,6 GB, y está etiquetado como compatible con endpoints de inferencia. Se trata de una etapa explícitamente marcada como "candidate", no como un modelo de producción publicado, y su entrenamiento se enmarca en la doctrina de "receipted-training" de SZL Holdings, que enfatiza la trazabilidad de procedencia y el registro de energía medida.

Por su naturaleza de adaptador sobre un modelo de 1.700 millones de parámetros, su relevancia práctica es limitada fuera del contexto del programa interno del autor. No obstante, resulta de interés como ejemplo de técnica de alineación orientada a la calibración de abstención en modelos pequeños, un área con pocos artefactos públicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder Qwen/Qwen3-1.7B |
| Parametros totales | no disponible (adaptador LoRA; base de 1.700 millones de parametros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-1.7B) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA/PEFT) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA entrenado mediante PEFT sobre el modelo base Qwen/Qwen3-1.7B, un transformer decoder de 1.700 millones de parámetros. No se especifican en la información disponible el rango del adaptador, los módulos objetivo, la tasa de aprendizaje ni el número de pasos de entrenamiento. El adaptador se apoya en el corpus abstention-doctrine-sft-v1, un conjunto de datos de ajuste supervisado orientado a enseñar al modelo a abstenerse en lugar de inventar respuestas.

El entrenamiento se declara bajo la doctrina de IA gobernada de SZL Holdings, que incluye "fail-closed honesty" y "measured-energy receipts", con recibos de procedencia alojados en la organización de Hugging Face del autor. No se detalla la composición del dataset, el número de tokens de entrenamiento ni si se aplicaron técnicas de RLHF o DPO. La información sobre innovaciones técnicas concretas (decodificación especulativa, atención lineal, etc.) no está disponible.

## Capacidades

- Generación de texto en inglés sobre la base de Qwen3-1.7B.
- Abstención calibrada: el adaptador está entrenado para declinar responder cuando no dispone de información fiable, en lugar de fabricar contenido.
- Ajuste fino mediante LoRA, lo que permite cargarlo junto al modelo base con PEFT.
- Compatibilidad declarada con endpoints de inferencia (tag endpoints_compatible).
- Capacidades heredadas del modelo base Qwen3-1.7B (razonamiento, código, matemáticas), aunque no se documenta su preservación tras el ajuste.
- Soporte de tool calling, agentes o modo thinking: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.

## Casos de uso

- Evaluación de técnicas de abstención: el adaptador sirve como artefacto de referencia para investigar cómo un modelo pequeño calibra sus rechazos frente a preguntas fuera de dominio, comparándolo con el modelo base sin adaptar.
- Investigación en alineación y honestidad: permite reproducir experimentos sobre "fail-closed honesty" en un modelo de 1.700 millones de parámetros, con un coste computacional bajo.
- Filtro de respuestas de bajo riesgo: en un pipeline de generación, el adaptador podría emplearse para detectar cuándo el modelo base debería abstenerse antes de escalar a un modelo mayor, aunque requiere validación propia.
- Prototipado de asistentes conservadores: escenarios donde es preferible una no-respuesta explícita a una respuesta inventada, como resúmenes documentales internos, siempre con supervisión humana.
- Estudio de adaptadores PEFT: ejemplo práctico de carga y combinación de un LoRA con su base mediante transformers y PEFT para formación de equipos.
- Auditoría de procedencia: el artefacto y sus recibos asociados pueden usarse para estudiar prácticas de trazabilidad en el entrenamiento de modelos.
- Base para ajustes posteriores: punto de partida para experimentos propios de abstención sobre Qwen3-1.7B, dado su reducido tamaño y licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el adaptador LoRA ocupa 0,6 GB en el repositorio; la inferencia requiere cargar además el modelo base Qwen3-1.7B. En fp16, el modelo base necesita aproximadamente 3,4 GB de VRAM; en cuantización de 4 bits, alrededor de 1 GB, aunque no se documentan cuantizaciones oficiales del adaptador.
- GPU recomendadas: cualquier GPU consumer con al menos 8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente para el modelo base en fp16; para mayor comodidad, A100 o H100 no son necesarias.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas con 8 GB o más.
- Opciones de despliegue: transformers con PEFT para cargar el adaptador; llama.cpp u Ollama requerirían fusionar el adaptador con el modelo base previamente; vLLM y TGI son compatibles con el modelo base, aunque la carga directa del adaptador LoRA depende de la versión y configuración.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| abstention-doctrine-r1-candidate | Adaptador LoRA sobre base de 1.700 M | no disponible | apache-2.0 | Hugging Face (candidato) | Enfocado en abstención; etapa candidata |
| Qwen/Qwen3-1.7B | 1.700 M | no disponible en esta ficha | apache-2.0 | Hugging Face | Modelo base sin ajuste de abstención |
| Alternativas de calibración de abstención | no disponible | no disponible | no disponible | no disponible | No se dispone de comparables públicos documentados en la información proporcionada |

## Limitaciones y advertencias

- Etapa candidata: el autor declara explícitamente que no es un modelo de producción publicado; no debe desplegarse en entornos productivos sin validación propia.
- Idiomas: solo inglés según la model card; el rendimiento en castellano no está documentado.
- Sesgos: no se documentan evaluaciones de sesgo; al heredar el modelo base, puede reproducir sesgos presentes en Qwen3-1.7B.
- Alucinación: el objetivo del adaptador es reducirla mediante abstención, pero no se aportan métricas que cuantifiquen la mejora; el riesgo persiste.
- Contexto: la longitud de contexto efectiva tras el ajuste no está documentada.
- Licencia: apache-2.0 permite uso comercial, pero debe verificarse la licencia del modelo base Qwen3-1.7B y las condiciones de la doctrina del autor.
- Trazabilidad: los recibos de procedencia se alojan en la organización del autor; su verificabilidad externa no está documentada.
- Sin benchmarks: la ausencia de resultados publicados impide comparar su rendimiento real frente al modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/SZLHOLDINGS/abstention-doctrine-r1-candidate
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Dataset asociado: https://huggingface.co/datasets/SZLHOLDINGS/abstention-doctrine-sft-v1
- Organización del autor: https://huggingface.co/SZLHOLDINGS
