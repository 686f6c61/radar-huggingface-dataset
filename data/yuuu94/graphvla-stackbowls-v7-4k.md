# yuuu94/GraphVLA-StackBowls-V7-4k

## Resumen

GraphVLA V7 Stack Bowls 4k es un checkpoint de investigación de un modelo visión-lenguaje-acción (VLA) orientado a robótica de manipulación real, publicado por el usuario yuuu94 en HuggingFace. Se trata de un modelo de dos brazos entrenado específicamente para la tarea de apilar cuencos (Stack Bowls) sobre un robot real, no de un modelo de propósito general. El checkpoint corresponde al paso 4.000 de entrenamiento y se distribuye como estado de modelo en formato DeepSpeed junto con el código de entrenamiento e inferencia, no como un export estándar de Transformers.

La arquitectura combina un backbone Qwen3-VL-4B con una cabeza de acción DiT-B (inspirada en GR00T) y un mecanismo de condicionamiento gráfico denominado V7. El modelo consume cuatro vistas RGB sincronizadas, un estado articular de 14 dimensiones y produce acciones con un horizonte de 16 pasos. El entrenamiento se realizó con 72 trayectorias de entrenamiento y 9 de validación del dataset Stack_bowls_lerobot.

Es relevante ahora porque ejemplifica la tendencia de publicar checkpoints VLA de investigación con su pipeline completo (código, configuración efectiva y estadísticas de normalización), lo que facilita la reproducibilidad parcial. Sin embargo, el autor advierte explícitamente de que no es un paquete listo para desplegar en hardware y de que no se reporta tasa de éxito en el mundo real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Backbone Qwen3-VL-4B + cabeza de acción GR00T DiT-B + condicionamiento gráfico V7 |
| Parámetros totales | 4B (backbone) + cabeza de acción (tamaño no disponible) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (checkpoint en BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `.pt` (DeepSpeed model-state, clave `module`), no export de Transformers |

## Arquitectura y entrenamiento

El modelo sigue un esquema VLA híbrido: un backbone visión-lenguaje Qwen3-VL-4B procesa la información visual y textual, una cabeza de acción DiT-B (basada en el diseño GR00T) genera las acciones motoras y un módulo de condicionamiento gráfico V7 inyecta representaciones estructuradas. Las características visuales del grafo usan pooling ponderado por cobertura de máscara y memoria mediante GRU en las aristas (edge GRU memory). La entrada consta de cuatro vistas RGB sincronizadas, y el estado y las acciones son vectores de 14 dimensiones (articulaciones) con horizonte de acción de 16.

El entrenamiento se realizó en BF16 con ZeRO-2 y AdamW estándar sobre dos GPUs, con batch de 24 por GPU (batch global 48). El dataset comprende 72 trayectorias de entrenamiento y 9 de validación de Stack_bowls_lerobot. Los objetivos geométricos se mantienen en metros y la geometría de entrada cacheada es estimada, no ground truth de simulador. No se especifica en la información disponible si hubo RLHF, DPO ni el número total de tokens o pasos de entrenamiento más allá del paso 4.000 reportado.

## Capacidades

- Generación de acciones de manipulación robótica de dos brazos para la tarea de apilar cuencos.
- Fusión de cuatro vistas RGB sincronizadas como entrada perceptiva.
- Procesamiento de estado articular de 14 dimensiones y emisión de acciones de 14 dimensiones con horizonte de 16.
- Condicionamiento gráfico mediante características visuales con pooling ponderado por máscara y memoria GRU en aristas.
- Integración de un backbone visión-lenguaje (Qwen3-VL-4B) con una cabeza de acción DiT-B.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, multilingüismo ni modos especiales de razonamiento en la información disponible.

## Casos de uso

- Investigación en VLA para manipulación bimanual: sirve como checkpoint de referencia para reproducir o comparar experimentos de apilamiento de cuencos con el pipeline GraphVLA, cargando el estado DeepSpeed y reconstruyendo el modelo desde el código archivado.
- Estudio de condicionamiento gráfico en robótica: permite analizar el efecto del módulo V7 (pooling ponderado por máscara y edge GRU) sobre el rendimiento en tareas de manipulación real.
- Base para fine-tuning en tareas de apilamiento similares: al incluir `effective_config.yaml` y `normalization.json`, se puede adaptar el entrenamiento a nuevos datasets LeRobot ajustando rutas y estadísticas.
- Reproducción de experimentos con múltiples vistas: el contrato de cuatro vistas RGB sincronizadas facilita montar entornos de evaluación multi-cámara en laboratorio.
- Evaluación de cabezas de acción DiT-B: útil para comparar el diseño GR00T DiT-B frente a otras cabezas de acción en el mismo backbone Qwen3-VL-4B.
- Docencia y formación en robótica de aprendizaje: el paquete código + checkpoint + configuración permite estudiar de extremo a extremo un pipeline VLA real, aunque requiere obtener por separado el dataset, assets del robot y modelos de percepción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que esta release no reporta tasa de éxito de despliegue en el mundo real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; un backbone de 4B en BF16 requiere aproximadamente 8 GB solo para pesos, más la cabeza de acción y las activaciones de las cuatro vistas RGB, por lo que se recomienda al menos 16-24 GB en BF16.
- GPU recomendadas: el entrenamiento usó dos GPUs con batch 24 por GPU; para inferencia se sugiere A100, H100 o RTX 4090 por capacidad de memoria.
- ¿Cabe en GPU de consumo? Probablemente en RTX 4090 (24 GB) en BF16, aunque no está verificado en la información disponible.
- Opciones de despliegue: carga mediante `torch.load(path, map_location="cpu", weights_only=False)` y reconstrucción del modelo desde el código archivado; no es compatible con `from_pretrained` de Transformers ni se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GraphVLA V7 Stack Bowls 4k | 4B (backbone) + cabeza | no disponible | Manipulación bimanual (apilar cuencos) | no disponible | Checkpoint de investigación en HF |
| GR00T (NVIDIA) | no disponible | no disponible | VLA generalista | no disponible | no disponible |
| Qwen3-VL-4B | 4B | no disponible | Visión-lenguaje | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint de investigación: el autor advierte que no es un paquete listo para desplegar en hardware.
- No se reporta tasa de éxito en el mundo real.
- El checkpoint no incluye el estado completo del optimizador, por lo que no permite continuar el entrenamiento de forma exacta.
- No se incluyen el dataset, los assets del robot, los ficheros de tokenizer/processor del modelo base ni los assets del modelo de percepción; deben obtenerse por separado y adaptar rutas.
- La caché de percepción original no está incluida; la geometría de entrada cacheada es estimada, no ground truth de simulador.
- Licencia no disponible: no se puede confirmar el uso comercial.
- Idiomas soportados no disponibles.
- Riesgo de sobreajuste a la tarea y al dataset concreto (72 trayectorias de entrenamiento).
- Posibles sesgos y alucinaciones no documentados en la información disponible.

## Enlaces

- HuggingFace: https://huggingface.co/yuuu94/GraphVLA-StackBowls-V7-4k
