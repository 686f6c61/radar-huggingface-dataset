# Sunbird-experimental/sunflower-qwen3.5-9b-grpo-maths-thinking

## Resumen

El modelo `sunflower-qwen3.5-9b-grpo-maths-thinking` es un adaptador LoRA (PEFT) publicado por Sunbird-experimental, fine-tuned con GRPO (Group Relative Policy Optimization) sobre el modelo base `Sunbird/Sunflower-Qwen3.5-9B`. Este modelo base es, a su vez, una adaptación de Qwen3.5-9B optimizada para comprender texto en 67 lenguas africanas, con especial énfasis en traducción, seguimiento de instrucciones y chat multi-turno. El adaptador está orientado a tareas de razonamiento matemático en un modo denominado "thinking", lo que sugiere que el modelo genera cadenas de pensamiento explícitas antes de dar la respuesta final.

El repositorio contiene únicamente los pesos del adaptador (0,4 GB), no el modelo completo, por lo que para su uso es necesario cargarlo sobre el modelo base. El entrenamiento se realizó con la librería TRL y Unsloth, herramientas habituales para RL post-entrenamiento y fine-tuning eficiente. La relevancia del modelo radica en que combina un enfoque de RL (GRPO) con un modelo multilingüe para lenguas africanas, un área con pocos recursos publicados. Sin embargo, la información disponible es mínima: no se especifican datos de entrenamiento, benchmarks ni licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5-9B) con adaptador LoRA (PEFT) |
| Parametros totales | Modelo base ~9 000 millones; adaptador LoRA no especificado |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio contiene solo el adaptador LoRA) |
| Idiomas soportados | no disponible (el modelo base Sunflower-Qwen3.5-9B declara soportar 67 lenguas africanas; no se especifica para este adaptador) |
| Licencia | no disponible |
| Formato de pesos | Safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

La arquitectura base es un transformer denso de 9 000 millones de parámetros (Qwen3.5-9B) adaptado inicialmente por Sunbird para entender y generar texto en 67 lenguas africanas, optimizado para tareas de traducción, instrucciones y chat. Sobre este modelo se ha aplicado un adaptador LoRA, que añade parámetros entrenables de bajo rango, reduciendo el coste de entrenamiento y almacenamiento. El repositorio solo incluye estos pesos, en formato Safetensors (0,4 GB), listos para ser fusionados con el modelo base.

El entrenamiento del adaptador se realizó con GRPO, un algoritmo de reinforcement learning utilizado para optimizar las respuestas de un modelo a partir de recompensas, aplicado con las librerías TRL y Unsloth. Por el nombre del repositorio, la variante "thinking" está diseñada para generar un razonamiento paso a paso en problemas matemáticos antes de emitir la respuesta final. No se han publicado detalles sobre los datos de entrenamiento, el tamaño del dataset, el número de pasos ni los hiperparámetros utilizados. La única referencia adicional es la variante "nothink", que sugiere un entrenamiento paralelo sin modo de pensamiento.

## Capacidades

- Razonamiento matemático: adaptado para resolver problemas de matemáticas generando cadenas de pensamiento ("thinking mode"), según el nombre del modelo y el tag `grpo-maths-thinking`.
- Generación de texto: el repositorio declara `pipeline_tag: text-generation`; es un modelo conversacional, pero su dominio específico parece limitado a matemáticas y razonamiento.
- Ajuste eficiente: al ser un adaptador LoRA, se puede cargar junto al modelo base con PEFT, lo que facilita un fine-tuning posterior de bajo coste.
- Soporte de tool calling / function calling: no disponible (no hay información).
- Soporte de agentes y multi-step reasoning: no disponible; solo se puede inferir la capacidad de razonamiento paso a paso por el enfoque de entrenamiento.
- Capacidades multilingües: no disponibles para este adaptador; el modelo base soporta 67 lenguas africanas, pero no se ha verificado si el adaptador conserva esta funcionalidad.
- Visión o audio: no disponible (no hay indicios de modalidades adicionales).

## Casos de uso

- Investigación en post-entrenamiento con RL: el modelo puede usarse como caso de estudio para comparar el algoritmo GRPO frente a otros métodos (DPO, PPO) sobre un modelo base multilingüe. Es útil para experimentar con funciones de recompensa y medir el impacto en el razonamiento matemático.
- Generación de datos de razonamiento matemático: el modo "thinking" permite producir cadenas de razonamiento detalladas. Estas salidas pueden emplearse para construir datasets de entrenamiento para modelos más pequeños o para fine-tuning adicional.
- Tutoría matemática en lenguas africanas: si el adaptador conserva las capacidades multilingües del base, podría integrarse en un asistente educativo para resolver problemas matemáticos en 67 idiomas. Antes de usarlo, es necesario validar que el fine-tuning con GRPO no haya degradado el rendimiento en lenguas no inglesas.
- Evaluación de robustness de RL: el adaptador permite probar cómo un entrenamiento específico en matemáticas afecta otras habilidades del modelo base (traducción, instrucciones, chat). Se puede comparar la variante "thinking" con la "nothink" para estudiar el efecto del razonamiento explícito.
- Fine-tuning adicional en dominios relacionados: al ser un LoRA ligero, se puede fusionar con el base y continuar entrenando con nuevos datasets (por ejemplo, de física o lógica) usando Unsloth o TRL, sin necesidad de entrenar el modelo completo.
- Chatbot de soporte académico: tras fusionar el adaptador con el base, puede integrarse en un pipeline de `text-generation` con Transformers para responder preguntas matemáticas en entornos de aula o de atención al estudiante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un adaptador LoRA, la VRAM necesaria es la del modelo base de 9B. En bfloat16 o float16 se estiman entre 18 y 20 GB; con cuantización a 8 bits, alrededor de 10 GB; con cuantización a 4 bits, unos 6 GB (cifras orientativas para modelos densos de 9B, no medidas para este modelo en particular).
- GPU recomendadas: A100 40 GB o H100 80 GB para precisión completa; RTX 4090 24 GB es suficiente en bfloat16; para GPUs de consumo con 12 GB (por ejemplo, RTX 4070) se puede usar cuantización de 4 bits.
- Compatibilidad con consumer GPUs: sí, con cuantización a 8 o 4 bits.
- Opciones de despliegue: el adaptador debe fusionarse con el modelo base antes de usarse. Después, se puede desplegar con Transformers + PEFT, vLLM, TGI. Si se convierte a GGUF, también es compatible con llama.cpp y Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sunflower-qwen3.5-9b-grpo-maths-thinking | Adaptador LoRA (fine-tuning GRPO) | Modelo base ~9B; adaptador no especificado | no disponible | no disponible | Hugging Face (Sunbird-experimental) |
| sunflower-qwen3.5-9b-grpo-maths-nothink | Adaptador LoRA (fine-tuning GRPO, sin modo thinking) | Modelo base ~9B; adaptador no especificado | no disponible | no disponible | Hugging Face (Sunbird-experimental) |
| Sunbird/Sunflower-Qwen3.5-9B | Modelo base Qwen3.5-9B | ~9B | no disponible | no disponible | Hugging Face (Sunbird) |

Los tres modelos comparten el mismo modelo base. No existen datos de benchmarks que permitan comparar rendimiento entre ellos. La diferencia principal está en el adaptador: "thinking" añade un modo de razonamiento matemático, "nothink" es una variante sin razonamiento explícito, y el modelo base solo presenta la adaptación a 67 lenguas africanas sin el fine-tuning de matemáticas.

## Limitaciones y advertencias

- Licencia no disponible: no se puede determinar si el modelo puede usarse en aplicaciones comerciales. Es necesario contactar con el autor antes de cualquier despliegue productivo.
- Documentación mínima: la model card no incluye detalles sobre datos de entrenamiento, arquitectura específica, procedimiento de evaluación ni sesgos. Cualquier uso debe considerar esta falta de transparencia.
- Riesgo de alucinación: al no haber benchmarks, no se conoce la fiabilidad de las respuestas matemáticas. El modelo puede producir razonamientos plausibles pero incorrectos.
- Dependencia del modelo base: el adaptador no funciona de forma autónoma. Debe fusionarse con `Sunbird/Sunflower-Qwen3.5-9B` o cargarse mediante PEFT con el base. Si el modelo base no está disponible, el adaptador es inservible.
- Posible degradación de capacidades: el fine-tuning con GRPO en una tarea concreta puede provocar "catastrophic forgetting", perdiendo parte de las habilidades originales del base (traducción, chat, lenguas africanas). La variante "nothink" existe precisamente para comparar este efecto, lo que indica que el equipo es consciente del trade-off.
- Sin datos de contexto: se desconoce la ventana de contexto soportada. No se puede garantizar un uso correcto con documentos largos o conversaciones extensas.
- Idiomas no verificados: aunque el base soporta 67 lenguas africanas, no se ha confirmado que el adaptador mantenga este soporte. Es recomendable evaluar el modelo en esos idiomas antes de asumir su uso multilingüe.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Sunbird-experimental/sunflower-qwen3.5-9b-grpo-maths-thinking
- Modelo base Sunbird/Sunflower-Qwen3.5-9B: https://huggingface.co/Sunbird/Sunflower-Qwen3.5-9B
- Variante nothink: https://huggingface.co/Sunbird-experimental/sunflower-qwen3.5-9b-grpo-maths-nothink
- Documentación sobre Sunflower-Qwen3.5-9B (SALT): https://salt.sunbird.ai/models/sunflower-qwen3.5-9b/
