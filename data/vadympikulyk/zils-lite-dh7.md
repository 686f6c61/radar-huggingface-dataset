# VadymPikulyk/zils-lite-dh7

## Resumen

zils-lite-dh7 es un modelo de decisión (decision model) de tipo "soup body" desarrollado por VadymPikulyk para Zils, un subred de Bittensor (subnet 127). Se construye a partir de un fine-tune de Qwen/Qwen3.5-0.8B adaptado al formato de chasis d3-lite, y combina pesos de dos modelos ya existentes (VadymPikulyk/zils-lite-dh2 y qhoenix/zils-lite-decision-avg-abc) mediante un promedio uniforme, al que se le suma un LoRA fusionado entrenado con respuestas de profesor.

El modelo tiene 852.985.920 parámetros (aproximadamente 0,85 mil millones) y se distribuye en formato safetensors con licencia Apache-2.0. Su propósito es tomar decisiones dentro del ecosistema Zils, un entorno de subred de Bittensor orientado a tareas de decisión y uso de herramientas. El entrenamiento se realizó con aproximadamente 26.000 respuestas del profesor Zils Relay y 7.200 filas de decisiones de uso de herramientas derivadas del split público TRAIN de glaiveai/glaive-function-calling-v2.

Es relevante ahora porque representa un ejemplo de modelo pequeño y especializado en decisiones, entrenado mediante destilación y mezcla de pesos (model soup) en lugar de un entrenamiento desde cero, lo que reduce costes y permite iterar rápidamente sobre modelos base compactos. No obstante, la información pública disponible es muy limitada: no hay benchmarks, no se especifican idiomas soportados y el pipeline no está definido.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-0.8B, con código personalizado `qwen3_5`) |
| Parámetros totales | 852.985.920 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer de aproximadamente 0,85 mil millones de parámetros, y se adapta al formato de chasis d3-lite. La construcción sigue una estrategia de "model soup": se calcula el promedio uniforme de los pesos de dos cuerpos d3-lite ya asentados (VadymPikulyk/zils-lite-dh2 y qhoenix/zils-lite-decision-avg-abc), y sobre ese punto de partida se suma 0,7 veces un LoRA fusionado de rango 64, entrenado con learning rate 5e-5 durante una época.

El LoRA se entrenó con `python -m zils.teacher train` sobre aproximadamente 26.000 respuestas del profesor Zils Relay (zils-ai/zils-relay-answers), que incluyen probabilidades de vllm-sr/d3-ultra en preguntas de decisión reconstruidas a partir de fuentes públicas de entrenamiento. Además, se añadieron 7.200 filas de decisiones de uso de herramientas construidas a partir del split público TRAIN de glaiveai/glaive-function-calling-v2, donde los objetivos mezclan las propias respuestas del modelo soup inicial (70%) con la etiqueta gold (30%). No se utilizaron elementos de examen de validadores, elementos de examen semilla públicos ni datos de clientes. La innovación principal es la combinación de destilación desde un profesor con mezcla de pesos y fusión de LoRA, lo que permite obtener un modelo especializado sin entrenamiento completo desde cero.

## Capacidades

- Generación de texto y razonamiento básico, heredados del modelo base Qwen/Qwen3.5-0.8B.
- Toma de decisiones (decision-model): el modelo está especializado en responder preguntas de decisión dentro del entorno Zils, con probabilidades derivadas del profesor d3-ultra.
- Uso de herramientas (tool calling / function calling): entrenado explícitamente con 7.200 filas de decisiones de uso de herramientas derivadas de glaive-function-calling-v2.
- Capacidades de visión: el modelo card menciona "language and vision weights", por lo que se infiere soporte de visión heredado del chasis d3-lite, aunque no se detalla.
- Soporte de agentes y razonamiento multi-paso: orientado a decisiones en el contexto de la subred Bittensor 127, aunque no se especifican mecanismos concretos.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking: no disponible.

## Casos de uso

- Toma de decisiones en la subred Zils (Bittensor subnet 127): el modelo está diseñado específicamente para responder preguntas de decisión con probabilidades calibradas, por lo que se usaría como cuerpo de decisión dentro de los validadores o mineros de la subred.
- Enrutamiento de llamadas a herramientas en asistentes: gracias a su entrenamiento con glaive-function-calling-v2, puede decidir qué función invocar y con qué argumentos en un pipeline de agentes, integrándose en orquestadores que necesiten un modelo pequeño y rápido.
- Destilación de profesor a alumno en entornos de investigación: sirve como ejemplo reproducible de cómo combinar model soup y LoRA para especializar un modelo base de 0,8B en una tarea concreta, útil para experimentos de alineación y destilación.
- Prototipado rápido de agentes conversacionales: al ser un modelo de menos de 1B de parámetros, puede desplegarse en entornos con recursos limitados para pruebas de concepto de toma de decisiones multi-turno.
- Evaluación de estrategias de mezcla de pesos: investigadores pueden usar este modelo como referencia para estudiar el efecto del promedio uniforme de pesos y la fusión de LoRA en modelos pequeños.
- Clasificación y selección de acciones en pipelines de automatización: el modelo puede integrarse en sistemas que requieran elegir entre un conjunto discreto de acciones (por ejemplo, en un bot de atención al cliente que decida si escalar, responder o consultar una base de datos), aunque no se especifica la longitud de contexto ni los idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tener 852.985.920 parámetros, en precisión completa (fp32) requeriría aproximadamente 3,4 GB; en fp16/bf16, unos 1,7 GB; en cuantización de 8 bits, alrededor de 0,85 GB; en 4 bits, aproximadamente 0,43 GB (estimaciones teóricas, no confirmadas por el autor).
- GPU recomendadas: no disponible. Por tamaño, cabría en GPUs de consumo como RTX 3060, RTX 4060, RTX 4090, así como en A100 o H100 para despliegues por lotes.
- ¿Cabe en consumer GPU? Sí, por su tamaño inferior a 1B de parámetros, es probable que quepa en GPUs de consumo con al menos 4-6 GB de VRAM, aunque no se confirma oficialmente.
- Opciones de despliegue: no disponible. El modelo usa código personalizado (`custom_code` con arquitectura `qwen3_5`), por lo que puede requerir `trust_remote_code=True` en transformers; no se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-lite-dh7 | 852.985.920 | No disponible | Apache-2.0 | Hugging Face | Modelo de decisión especializado para Zils |
| Qwen/Qwen3.5-0.8B | ~0,8B | No disponible | No disponible | Hugging Face | Modelo base del que deriva |
| VadymPikulyk/zils-lite-dh2 | No disponible | No disponible | Apache-2.0 | Hugging Face | Cuerpo d3-lite predecesor, promediado en la soup |
| qhoenix/zils-lite-decision-avg-abc | No disponible | No disponible | Apache-2.0 | Hugging Face | Cuerpo d3-lite predecesor, promediado en la soup |

No se dispone de datos de rendimiento comparativo (benchmarks) para estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. Al derivar de Qwen3.5-0.8B y de datos de destilación, puede heredar sesgos del modelo base y de los datasets utilizados (glaive-function-calling-v2, zils-relay-answers).
- Riesgo de alucinación: presente, como en cualquier modelo generativo de 0,8B; especialmente en tareas de decisión fuera de la distribución de entrenamiento.
- Limitaciones de contexto o idioma: no se especifica la longitud de contexto ni los idiomas soportados; la información pública no permite confirmar capacidades multilingües.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se recomienda citar tasksource y los datasets originales según indica el autor. El modelo incluye código personalizado (`custom_code`), lo que puede afectar a la portabilidad.
- Caveats para producción: el modelo es muy reciente (creado el 2026-11-15) y tiene 0 descargas y 0 likes, por lo que no hay validación comunitaria. No se han publicado benchmarks ni pruebas de robustez. El pipeline no está definido, lo que complica su integración automática. No se utilizaron datos de validadores ni de clientes, pero la mezcla de objetivos (70% respuestas del soup, 30% gold) puede introducir un sesgo hacia el comportamiento del modelo inicial.

## Enlaces

- Hugging Face: https://huggingface.co/VadymPikulyk/zils-lite-dh2
- Hugging Face: https://huggingface.co/qhoenix/zils-lite-decision-avg-abc
- Hugging Face: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Hugging Face: https://huggingface.co/vllm-sr/d3-lite
- Hugging Face: https://huggingface.co/zils-ai/zils-relay-answers
- Hugging Face: https://huggingface.co/vllm-sr/d3-ultra
- Hugging Face: https://huggingface.co/glaiveai/glaive-function-calling-v2
