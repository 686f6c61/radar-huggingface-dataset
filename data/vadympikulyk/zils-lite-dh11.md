# VadymPikulyk/zils-lite-dh11

## Resumen

zils-lite-dh11 es un modelo de decisión (decision-model) de aproximadamente 853 millones de parámetros publicado por VadymPikulyk en Hugging Face. Se presenta como un "soup body" para Zils, el subnet 127 de la red Bittensor, y contiene los pesos de lenguaje y visión de un fine-tune de Qwen/Qwen3.5-0.8B dispuestos en el formato de chasis d3-lite. Su función no es la generación de texto generalista, sino la toma de decisiones dentro de la arquitectura de agentes de Zils.

El modelo se construye mediante un promedio uniforme de dos cuerpos d3-lite (DouglasBashir/zils-lite-r6 y BashirEmran/d3-lite-body-a2) al que se suma el delta de pesos de VadymPikulyk/zils-lite-dh8 respecto a su propio soup de partida. Ese delta corresponde a un LoRA fusionado de rango 64 entrenado durante una época con una tasa de aprendizaje de 5e-5 sobre unas 26.500 respuestas del profesor Zils Relay y filas de decisión de uso de herramientas derivadas del split público de entrenamiento de glaive-function-calling-v2.

Su relevancia es acotada pero específica: documenta un paso concreto dentro de un linaje de variantes experimentales orientadas a la destilación de decisiones y al uso de herramientas, con licencia Apache-2.0 y pesos en safetensors. El repositorio no registra descargas ni interacciones y no incluye pipeline declarado ni idiomas soportados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer derivada de Qwen3.5 (tag `qwen3_5`), con código personalizado (`custom_code`) y disposición de chasis d3-lite |
| Parámetros totales | 852.985.920 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3.5-0.8B, vllm-sr/d3-lite, DouglasBashir/zils-lite-r6, BashirEmran/d3-lite-body-a2, VadymPikulyk/zils-lite-dh8 |
| Tamaño del repositorio | 1,7 GB |
| Modalidad | Lenguaje y visión (según la model card) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer Qwen3.5 de aproximadamente 0,8B de parámetros, reorganizado en el chasis d3-lite. El modelo requiere código personalizado (`custom_code`), lo que implica que no puede cargarse con una implementación estándar de transformers sin el módulo asociado. La model card describe el proceso como una fusión de pesos ("soup") sobre cuerpos ya existentes, no como un entrenamiento desde cero.

El procedimiento de construcción parte del promedio uniforme de DouglasBashir/zils-lite-r6 y BashirEmran/d3-lite-body-a2, ambos Apache-2.0. Sobre ese punto de partida se aplica el cambio de pesos de VadymPikulyk/zils-lite-dh8 respecto a su propio soup inicial. Ese cambio proviene de un LoRA fusionado de rango 64, entrenado una época con lr 5e-5 mediante `python -m zils.teacher train`, sobre aproximadamente 26.500 respuestas del profesor Zils Relay (zils-ai/zils-relay-answers, con probabilidades de vllm-sr/d3-ultra sobre preguntas de decisión reconstruidas a partir de fuentes públicas de entrenamiento) más filas de decisión de uso de herramientas construidas desde el split público TRAIN de glaiveai/glaive-function-calling-v2. El autor declara que no se emplearon ítems de examen de validador, ítems públicos de examen semilla ni datos de clientes. No se detalla la composición completa del dataset, el número total de tokens ni si hubo etapas de RLHF o DPO.

## Capacidades

- Toma de decisiones orientada a agentes: el modelo está diseñado como "decision-model" dentro del subnet Zils, es decir, para resolver elecciones discretas en lugar de generar texto libre extenso.
- Uso de herramientas: el entrenamiento incluye filas de decisión de tool use derivadas de glaive-function-calling-v2, por lo que se espera capacidad para decidir invocaciones de funciones.
- Destilación de un profesor: incorpora señales de probabilidad de vllm-sr/d3-ultra sobre preguntas de decisión, lo que orienta su comportamiento hacia las decisiones del profesor.
- Procesamiento de visión: la model card indica que contiene pesos de lenguaje y visión, aunque no se detallan las capacidades visuales concretas.
- Capacidades multilingües: no disponibles; el repositorio no declara idiomas.
- Modo de razonamiento extendido (thinking), audio u otras modalidades: no disponible.

## Casos de uso

- Enrutamiento de decisiones en agentes: el modelo puede emplearse como componente que elige entre acciones o herramientas disponibles en un pipeline de agentes, dado que su entrenamiento se centra en filas de decisión de tool use.
- Evaluación de políticas de decisión en Zils: sirve como cuerpo candidato para pruebas dentro del subnet 127 de Bittensor, comparando su comportamiento frente a otros "soup bodies" del mismo linaje.
- Investigación sobre fusión de pesos: al ser un soup construido por promedio y suma de deltas LoRA, es útil para estudiar el efecto de estas técnicas sobre un modelo base de 0,8B.
- Destilación de profesores en dominios acotados: el pipeline documentado (`zils.teacher train` con respuestas de Zils Relay) puede replicarse para generar variantes con otros profesores o datasets de decisión.
- Prototipado de asistentes con function calling: las filas de glaive-function-calling-v2 permiten experimentar con selección de funciones en entornos controlados y de bajo coste computacional.
- Experimentación con modelos pequeños en formato d3-lite: su tamaño de 853M parámetros y pesos safetensors facilitan pruebas de integración del chasis d3-lite en entornos de investigación con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamaño (853M parámetros), en fp16 serían necesarios aproximadamente 1,7 GB solo para pesos, y en cuantizaciones de 8 o 4 bits aproximadamente 0,9 GB y 0,5 GB respectivamente, sin contar overhead de activaciones ni caché KV.
- GPU recomendadas: no disponible. Por tamaño, cabría en GPUs de consumo como RTX 3060, RTX 4060 o superiores, así como en A100 o H100 para despliegues por lotes.
- Compatibilidad con GPU de consumo: previsiblemente sí, dado el tamaño, aunque no hay confirmación oficial.
- Opciones de despliegue: el repositorio incluye el tag `vllm-sr`, lo que sugiere soporte o uso previsto con vLLM. No se confirma compatibilidad con llama.cpp, Ollama ni TGI, y el uso de `custom_code` puede requerir pasos adicionales de carga.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| VadymPikulyk/zils-lite-dh11 | 852.985.920 | no disponible | Apache-2.0 | Soup de decisión sobre chasis d3-lite, con código personalizado |
| Qwen/Qwen3.5-0.8B | ~0,8B | no disponible | no disponible en esta ficha | Modelo base original de lenguaje |
| DouglasBashir/zils-lite-r6 | no disponible | no disponible | Apache-2.0 | Cuerpo d3-lite previo, uno de los promedios de partida |
| BashirEmran/d3-lite-body-a2 | no disponible | no disponible | Apache-2.0 | Cuerpo d3-lite previo, uno de los promedios de partida |

No se dispone de datos de rendimiento comparativo entre estas variantes.

## Limitaciones y advertencias

- El modelo está especializado en decisiones y tool use; no debe esperarse de él un rendimiento generalista de chat o generación long-form.
- No se han publicado evaluaciones de sesgo, alucinación ni robustez; el riesgo de alucinación en tareas fuera de su dominio de entrenamiento es desconocido.
- No se declaran idiomas soportados, por lo que el comportamiento multilingüe es incierto.
- La longitud de contexto no está documentada.
- Requiere `custom_code` para su carga, lo que puede complicar el despliegue en infraestructuras estándar y aumentar la superficie de riesgo en producción.
- Aunque la licencia es Apache-2.0, la model card pide citar tasksource y los datasets originales; conviene revisar LICENSE y NOTICE del repositorio antes de un uso comercial.
- El repositorio no registra descargas ni validación externa; su madurez y estabilidad no están contrastadas.
- El entrenamiento se apoya en respuestas de un profesor y en un dataset público de function calling; puede heredar sesgos y limitaciones de esas fuentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VadymPikulyk/zils-lite-dh11
- Modelo base Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- vllm-sr/d3-lite: https://huggingface.co/vllm-sr/d3-lite
- DouglasBashir/zils-lite-r6: https://huggingface.co/DouglasBashir/zils-lite-r6
- BashirEmran/d3-lite-body-a2: https://huggingface.co/BashirEmran/d3-lite-body-a2
- VadymPikulyk/zils-lite-dh8: https://huggingface.co/VadymPikulyk/zils-lite-dh8
- Dataset zils-ai/zils-relay-answers: https://huggingface.co/datasets/zils-ai/zils-relay-answers
- Dataset glaiveai/glaive-function-calling-v2: https://huggingface.co/datasets/glaiveai/glaive-function-calling-v2
