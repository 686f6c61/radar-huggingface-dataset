# valendra/sherry-35b-a3b-0.1-sft-preview

## Resumen

Sherry 35B-A3B SFT Preview (versión 0.1) es un adaptador LoRA de ajuste supervisado (SFT) desarrollado por Valendra Tech SL sobre el modelo base Qwen/Qwen3.6-35B-A3B. Su objetivo es permitir controlar el nivel de esfuerzo de razonamiento del modelo mediante tres tokens especiales: `<|reasoning_effort_low|>`, `<|reasoning_effort_medium|>` y `<|reasoning_effort_high|>`. De esta forma, el usuario puede indicar al modelo que dedique más o menos profundidad de razonamiento antes de dar una respuesta, ajustando así el equilibrio entre calidad y coste computacional.

El adaptador está entrenado exclusivamente con trazas de razonamiento matemático de respuesta numérica verificada, procedentes del dataset público `valendra/sherry-reasoning-effort-0.1`, que a su vez se basa en problemas de `AI-MO/NuminaMath-CoT`. El modelo base presenta 35B parámetros totales con aproximadamente 3B activados por token, y una ventana de contexto de 262.144 tokens. Al ser un adaptador PEFT, no constituye un modelo independiente y debe cargarse sobre el base con Transformers y PEFT.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal multimodal (Qwen3.6-35B-A3B) con adaptador PEFT LoRA; 35B totales con ~3B activados por token, lo que sugiere una arquitectura MoE |
| Parametros totales | 35B (modelo base) más los parámetros del adaptador LoRA (rango 32, alfa 64); el tamaño del repositorio del adaptador es 0.1 GB |
| Parametros activos | ~3B activados por token (modelo base) |
| Longitud de contexto | 262.144 tokens (según la card del modelo base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica a las capas del modelo base `Qwen/Qwen3.6-35B-A3B`, un modelo de lenguaje causal multimodal. La card del modelo indica que el base mantiene las capacidades generales de lenguaje, código, matemáticas y multimodal, mientras que este adaptador LoRA introduce un mecanismo de control del esfuerzo de razonamiento. Se entrenan tres filas de tokenizer y de embedding/output para los tokens especiales de control.

El proceso de SFT utilizó 1.854 filas de entrenamiento y 207 de evaluación, con una longitud máxima de secuencia de 4.096 tokens, precisión mixta BF16, tamaño de batch por dispositivo 1 con acumulación de gradientes 16, optimizador AdamW de 8 bits, tasa de aprendizaje `1e-4` con programación coseno y 50 pasos de calentamiento. Los parámetros LoRA son rango 32, alfa 64 y dropout cero. Los ejemplos provienen de `AI-MO/NuminaMath-CoT`, filtrando las entradas de tipo prueba y conservando solo problemas con respuesta numérica verificada.

## Capacidades

- Razonamiento matemático con respuestas numéricas verificadas, condicionado por tres niveles de esfuerzo: bajo, medio y alto.
- Control explícito del estilo de razonamiento mediante la inserción de tokens especiales antes de la apertura de pensamiento `<think>\n`.
- El modelo base conserva capacidades de generación de texto, código, matemáticas y multimodal (incluye un codificador de visión), aunque el adaptador no ha sido validado en tareas de visión.
- No hay datos sobre soporte de tool calling, function calling, agentes o capacidades multilingües específicas del adaptador.

## Casos de uso

- Tutoría matemática adaptativa: un sistema educativo puede usar el token `low` para respuestas rápidas en ejercicios simples y el token `high` para problemas complejos que exigen un razonamiento más extenso.
- Generación de explicaciones paso a paso: en plataformas de aprendizaje, el modo `high` permite producir razonamientos detallados y verificables para problemas aritméticos.
- Control de presupuesto computacional en producción: en pipelines de inferencia con límites de tiempo, se puede seleccionar el nivel de esfuerzo para ajustar la profundidad de razonamiento y el coste por petición.
- Creación de datasets sintéticos de razonamiento: el adaptador puede utilizarse para generar trazas de razonamiento a distintos niveles de esfuerzo, útiles para entrenar o evaluar otros modelos.
- Investigación de eficiencia en razonamiento: permite estudiar cómo varía la precisión y la longitud de la salida en función del token de esfuerzo, manteniendo fijos el prompt y el presupuesto de generación.
- Evaluación comparativa de razonamiento: al ser un adaptador experimental, se puede integrar en bancos de pruebas para comparar el comportamiento frente al modelo base en tareas matemáticas de respuesta numérica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La card del modelo indica explícitamente que el repositorio no reclama una mejora independiente de rendimiento y que la evaluación debe realizarse por parte del usuario comparando el adaptador con el modelo base utilizando el mismo prompt, decodificación y presupuesto de tokens.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la documentación proporcionada. El adaptador debe cargarse sobre el modelo base de 35B, por lo que el requisito de memoria es el del modelo base.
- GPU recomendadas: no disponibles. No se especifican GPU concretas en la información aportada.
- Compatibilidad con GPU de consumo: no disponible. No hay datos que permitan confirmar si el modelo base se puede cargar en una GPU de consumo con cuantización.
- Opciones de despliegue: según la documentación, se utiliza Transformers junto con PEFT, cargando el modelo con `AutoModelForImageTextToText` y `PeftModel`. No se especifican otros motores como vLLM, llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría en la documentación proporcionada. La única referencia de comparación indicada por el autor es el modelo base Qwen/Qwen3.6-35B-A3B. La siguiente tabla resume las diferencias conocidas entre el adaptador y su base.

| Modelo | Parametros | Contexto | Capacidad extra | Uso |
|---|---|---|---|---|
| Qwen3.6-35B-A3B (base) | 35B total, ~3B activados | 262.144 tokens | Multimodal, código, matemáticas | Modelo original |
| Sherry 35B-A3B SFT Preview | Adaptador LoRA sobre el base | Hereda del base | Control de esfuerzo de razonamiento en 3 niveles | Adaptador experimental para razonamiento matemático |

## Limitaciones y advertencias

- El adaptador es una vista previa experimental (versión 0.1) y puede provocar regresiones en tareas no relacionadas con la distribución de entrenamiento.
- No se reclama una mejora independiente de rendimiento en benchmarks; no hay datos de evaluación pública.
- Los tokens de esfuerzo no son límites duros de longitud y no garantizan un número concreto de tokens, ni la corrección de la respuesta, ni un comportamiento de terminación predecible.
- El entrenamiento se limitó a problemas matemáticos con respuesta numérica verificada; es probable que el adaptador no sea útil en otros dominios.
- La card del modelo no indica evaluaciones de sesgos ni de riesgo de alucinación para este adaptador.
- El modelo base incluye un codificador de visión, pero este adaptador fue entrenado y validado solo con ejemplos de texto; no se hacen afirmaciones sobre el rendimiento en visión.
- La licencia Apache 2.0 permite uso comercial, pero el estado experimental y la falta de evaluación deben tenerse en cuenta antes de un despliegue en producción.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/valendra/sherry-35b-a3b-0.1-sft-preview)
- [Modelo base Qwen/Qwen3.6-35B-A3B](https://huggingface.co/Qwen/Qwen3.6-35B-A3B)
- [Dataset de entrenamiento valendra/sherry-reasoning-effort-0.1](https://huggingface.co/datasets/valendra/sherry-reasoning-effort-0.1)
- [Dataset de origen AI-MO/NuminaMath-CoT](https://huggingface.co/datasets/AI-MO/NuminaMath-CoT)
- [Organización Valendra Tech SL en Hugging Face](https://huggingface.co/valendra/models)
