# VadymPikulyk/zils-lite-dh3

## Resumen

zils-lite-dh3 es un modelo de decisión (decision model) construido como "soup body" para Zils, el subnet 127 de Bittensor. Se trata de un fine-tune de Qwen/Qwen3.5-0.8B reorganizado en el formato de chasis d3-lite, lo que implica que conserva los pesos de lenguaje y visión del modelo base pero los empaqueta según la estructura esperada por la infraestructura de Zils. El autor es VadymPikulyk y el modelo se publica bajo licencia Apache-2.0.

El modelo parte de la media uniforme de dos cuerpos d3-lite de la ronda del 14 de noviembre de 2026 (zils-lite-dh2 y zils-lite-decision-avg-abc) y añade el 70% de un LoRA fusionado de rango 64, entrenado durante una época con learning rate 5e-5 sobre 30.000 decisiones tipadas del split TRAIN de tasksource/tasksource-jev-typed-decisions. El resultado es un modelo de aproximadamente 853 millones de parámetros orientado a tareas de decisión estructurada dentro del ecosistema Zils, no a generación de texto generalista.

Su relevancia es acotada y específica: sirve como componente evaluable en el subnet 127 de Bittensor, donde los validadores examinan el comportamiento del modelo en decisiones tipadas. No es un modelo de propósito general y su model card no documenta capacidades de conversación, código o razonamiento abierto más allá de lo que hereda de Qwen3.5-0.8B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5), empaquetado en chasis d3-lite con `custom_code` |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.5-0.8B, un transformer decoder-only de aproximadamente 0,8 mil millones de parámetros, reorganizado en el layout d3-lite que Zils utiliza como chasis. El modelo incorpora pesos de lenguaje y visión del fine-tune base, según indica la model card. El repositorio requiere `custom_code`, lo que significa que la carga no es posible con `transformers` estándar sin el código auxiliar del proyecto Zils.

El entrenamiento consistió en un LoRA de rango 64 con learning rate 5e-5 durante una época, ejecutado mediante `python -m zils.teacher train` sobre 30.000 decisiones tipadas del split TRAIN de tasksource/tasksource-jev-typed-decisions. Se seleccionaron únicamente filas marcadas para uso comercial, con un máximo de 200 por fuente y objetivos gold ligeramente suavizados. El LoRA fusionado se combinó con la media uniforme de los dos cuerpos previos mediante un coeficiente de 0,7 (model soup). La model card declara explícitamente que no se usaron ítems de examen de validadores, ítems públicos de examen semilla, filas de validación/test ni datos de clientes.

## Capacidades

- Toma de decisiones tipadas: el modelo está entrenado para producir decisiones estructuradas sobre entradas tipadas, siguiendo el esquema de tasksource-jev-typed-decisions.
- Herencia de Qwen3.5-0.8B: al conservar los pesos del fine-tune base, retiene las capacidades del modelo original en la medida en que el chasis d3-lite las expone.
- Procesamiento multimodal: la model card menciona pesos de lenguaje y visión, aunque no se detalla el alcance efectivo de las capacidades visuales tras el reempaquetado.
- Integración en Zils: diseñado para ser evaluado por los validadores del subnet 127 de Bittensor.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Evaluación en el subnet 127 de Bittensor: el modelo se despliega como cuerpo candidato para que los validadores de Zils lo examinen con ítems de decisión tipada y comparen su comportamiento con el de otros cuerpos de la ronda.
- Componente de decisión en pipelines internos: puede integrarse como clasificador o selector estructurado en flujos donde la salida esperada sea una decisión tipada sobre un conjunto acotado de opciones, aprovechando el entrenamiento específico sobre ese formato.
- Investigación sobre model souping: sirve como caso de estudio reproducible de combinación de LoRA fusionado (coeficiente 0,7) con media uniforme de dos checkpoints, útil para analizar el efecto del souping en modelos pequeños.
- Base para fine-tunes posteriores: al ser Apache-2.0 y de tamaño reducido (~853 M parámetros), puede servir como punto de partida para ajustes adicionales en tareas de decisión con datos propios.
- Despliegue en hardware modesto: su tamaño permite inferencia en GPU de consumo si se dispone del código `custom_code` de Zils, lo que facilita pruebas locales antes de enviar el cuerpo al subnet.
- Auditoría de linaje de datos: el modelo documenta explícitamente las fuentes y filtros aplicados (máximo 200 filas por fuente, exclusión de datos de examen y de clientes), lo que lo hace útil como referencia para estudiar prácticas de curación de datos en entornos con requisitos comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamaño (853 M parámetros), en fp16 rondaría 1,7 GB de pesos y en fp32 unos 3,4 GB, a lo que habría que sumar memoria para activaciones y KV cache; estas cifras son estimaciones por parámetros, no datos publicados por el autor.
- GPU recomendadas: no disponible. Por tamaño, el modelo es compatible con GPUs de consumo tipo RTX 3060/4060/4090 en precisión reducida, siempre que el `custom_code` de Zils funcione en ese entorno.
- ¿Cabe en GPU de consumo? Por número de parámetros, sí; la viabilidad real depende del soporte del chasis d3-lite en el stack de inferencia elegido.
- Opciones de despliegue: no disponible. El repositorio requiere `custom_code`, por lo que no se garantiza compatibilidad directa con vLLM, llama.cpp, Ollama o TGI sin adaptación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| zils-lite-dh3 | 852.985.920 | no disponible | Apache-2.0 | Cuerpo d3-lite para Zils (Bittensor subnet 127), fine-tune de decisión |
| Qwen/Qwen3.5-0.8B | ~0,8 mil millones (según base declarada) | no disponible | no disponible en la información proporcionada | Modelo base del que hereda pesos de lenguaje y visión |
| VadymPikulyk/zils-lite-dh2 | no disponible | no disponible | Apache-2.0 | Cuerpo d3-lite previo, componente de la media uniforme |
| qhoenix/zils-lite-decision-avg-abc | no disponible | no disponible | Apache-2.0 | Cuerpo d3-lite previo, componente de la media uniforme |
| vllm-sr/d3-lite | no disponible | no disponible | no disponible en la información proporcionada | Chasis/linaje d3-lite citado como base |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de nicho: está diseñado para decisiones tipadas dentro de Zils, no como asistente conversacional general; su uso fuera de ese contexto no está validado.
- Dependencia de `custom_code`: la carga requiere el código del proyecto Zils, lo que complica la portabilidad y la integración con herramientas estándar.
- Idiomas no documentados: la model card no especifica qué idiomas soporta; no debe asumirse multilingüismo pleno.
- Contexto no documentado: se desconoce la longitud máxima de contexto efectiva tras el reempaquetado en d3-lite.
- Riesgo de alucinación: no evaluado en la información disponible; como todo modelo generativo pequeño, puede producir salidas plausibles pero incorrectas en decisiones fuera de la distribución de entrenamiento.
- Sesgos: no documentados; el entrenamiento se limita a un dataset con filtros de uso comercial y topes por fuente, pero no se publica análisis de sesgo.
- Licencia: Apache-2.0 permite uso comercial, pero deben respetarse los avisos LICENSE y NOTICE de los modelos padres y las condiciones de las fuentes de datos (tasksource-jev-typed-decisions).
- Madurez: cero descargas y cero likes en el momento de la consulta, creado y actualizado el mismo día; no hay evidencia de uso en producción ni de validación externa.
- Fecha de la ronda (14 de noviembre de 2026) y del snapshot: verificar la vigencia del modelo frente a rondas posteriores del subnet.

## Enlaces

- Hugging Face: https://huggingface.co/VadymPikulyk/zils-lite-dh3
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Cuerpo previo dh2: https://huggingface.co/VadymPikulyk/zils-lite-dh2
- Cuerpo previo decision-avg-abc: https://huggingface.co/qhoenix/zils-lite-decision-avg-abc
- Chasis d3-lite: https://huggingface.co/vllm-sr/d3-lite
- Dataset de entrenamiento: https://huggingface.co/datasets/tasksource/tasksource-jev-typed-decisions
