# yuuu94/GraphVLA-StackBowls-V7-6k

## Resumen

GraphVLA-StackBowls-V7-6k es un checkpoint de investigación de un modelo de visión-lenguaje-acción (VLA) orientado a robótica de doble brazo, publicado por el usuario yuuu94 en HuggingFace. Se trata de un snapshot de entrenamiento en el paso 6.000 de un pipeline denominado GraphVLA, que combina un backbone Qwen3-VL-4B con una cabeza de acción DiT-B (estilo GR00T) y un mecanismo de condicionamiento por grafo (V7). El modelo está especializado en una única tarea real: apilar cuencos (Stack Bowls).

El modelo resuelve el problema de mapear observaciones visuales multimodales y estado articular a acciones motoras de 14 dimensiones con un horizonte de 16 pasos. Su relevancia es acotada: no es un modelo de propósito general, sino un artefacto reproducible de investigación que documenta una configuración concreta de entrenamiento (cuatro vistas RGB sincronizadas, memoria GRU sobre aristas del grafo, agrupación ponderada por cobertura de máscara) sobre un dataset LeRobot de 72 trayectorias de entrenamiento y 9 de validación.

El repositorio ocupa 9,2 GB e incluye el checkpoint en formato DeepSpeed, el código fuente, la configuración efectiva y las estadísticas de normalización. No se distribuyen los pesos en formato Transformers, ni el optimizador completo, ni los assets de percepción, dataset o robot. La licencia y los idiomas soportados no están declarados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA híbrido: backbone Qwen3-VL-4B + cabeza de acción DiT-B (GR00T) + condicionamiento por grafo V7 |
| Parametros totales | no disponible (backbone declarado de 4B; total no especificado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint en BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | checkpoint DeepSpeed `.pt` (`checkpoint_step_006000.pt`), no compatible con `from_pretrained` de Transformers |

## Arquitectura y entrenamiento

La arquitectura combina tres componentes: un backbone visual-lenguaje Qwen3-VL-4B, una cabeza de acción basada en Diffusion Transformer de tamaño B según el esquema GR00T, y un módulo de condicionamiento por grafo (V7). La entrada consiste en cuatro vistas RGB sincronizadas junto con un estado articular de 14 dimensiones; la salida es una secuencia de acciones también de 14 dimensiones con horizonte de 16 pasos. Las características visuales del grafo se agregan mediante pooling ponderado por cobertura de máscara, y se emplea una memoria GRU sobre las aristas del grafo. Los objetivos geométricos se mantienen en metros.

El entrenamiento se realizó en BF16 con ZeRO-2 y AdamW estándar, sobre dos GPUs con batch 24 por GPU (batch global 48), hasta el paso 6.000. El dataset son 72 trayectorias de entrenamiento y 9 de validación procedentes de `Stack_bowls_lerobot`. El checkpoint incluye únicamente el estado del modelo (bajo la clave `module` de DeepSpeed), no los shards del optimizador, por lo que no permite una reanudación exacta del entrenamiento. La geometría de entrada cacheada es estimada, no ground truth de simulador.

## Capacidades

- Generación de acciones motoras de 14 dimensiones para control de robot de doble brazo, con horizonte de predicción de 16 pasos.
- Fusión de cuatro vistas RGB sincronizadas con estado articular proprioceptivo.
- Condicionamiento estructurado mediante grafo (V7) con memoria GRU sobre aristas y pooling ponderado por cobertura de máscara.
- Ejecución de una tarea manipulativa concreta: apilar cuencos (Stack Bowls).
- No se declara soporte de tool calling, function calling, agentes multi-paso, capacidades multilingües ni modos de razonamiento explícito.
- No se declara capacidad de visión general, audio ni otras modalidades fuera del pipeline robótico descrito.

## Casos de uso

- Reproducción de experimentos de investigación en VLA: el repositorio incluye código fuente, configuración efectiva y estadísticas de normalización, lo que permite reconstruir el modelo y repetir el pipeline sobre el mismo dataset LeRobot.
- Estudio de condicionamiento por grafo en robótica: sirve como referencia para evaluar el efecto del pooling ponderado por máscara y la memoria GRU sobre aristas en tareas de manipulación.
- Benchmark interno de cabezas de acción DiT: al estar basado en GR00T DiT-B, puede compararse con otras cabezas de difusión sobre el mismo conjunto de trayectorias.
- Prototipado de políticas de doble brazo en laboratorio: con los assets de robot y percepción obtenidos por separado, puede integrarse en un banco de pruebas físico para la tarea de apilar cuencos.
- Análisis de normalización estado-acción: el archivo `normalization.json` permite estudiar la distribución de estados y acciones del split de entrenamiento y reutilizar las estadísticas en variantes del modelo.
- Docencia y formación en VLA: como ejemplo completo de un pipeline de entrenamiento con DeepSpeed, ZeRO-2 y múltiples vistas, útil para ilustrar el flujo completo desde datos LeRobot hasta checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que esta release no reporta tasa de éxito de despliegue en el mundo real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma exacta; el repositorio pesa 9,2 GB y el checkpoint está en BF16, por lo que se requiere al menos una GPU con memoria suficiente para el estado del modelo más las activaciones de las cuatro vistas RGB y el grafo.
- GPU recomendadas: el entrenamiento se realizó en dos GPUs (modelo no especificado); para inferencia se recomienda una GPU profesional con al menos 24-40 GB de VRAM, como A100 o similar, dado el tamaño del backbone de 4B y las cuatro cámaras.
- GPU de consumo: no se confirma que quepa en RTX 4090 (24 GB) sin cuantización adicional; no se proporcionan recetas de cuantización.
- Opciones de despliegue: no se documenta soporte para vLLM, llama.cpp, Ollama o TGI. La carga debe hacerse con `torch.load(path, map_location="cpu", weights_only=False)` y construir el modelo desde el código archivado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GraphVLA-StackBowls-V7-6k | backbone 4B + cabeza DiT-B | no disponible | VLA doble brazo, Stack Bowls | no disponible | checkpoint DeepSpeed + código |
| GR00T (NVIDIA) | no disponible | no disponible | VLA humanoide general | no disponible | referencia de la cabeza DiT-B; comparación directa no disponible |
| Qwen3-VL-4B | 4B | no disponible | visión-lenguaje general | no disponible | backbone base; no es un VLA |
| Otros VLA LeRobot | no disponible | no disponible | manipulación | variable | no disponible |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint de investigación, no un paquete listo para despliegue en hardware: requiere obtener por separado dataset, assets de robot, tokenizer/processor del modelo base y assets del modelo de percepción, además de adaptar rutas.
- No incluye el estado del optimizador, por lo que no permite continuar el entrenamiento de forma exacta.
- No es un export de HuggingFace Transformers; no funciona con `from_pretrained`.
- Solo se ha entrenado sobre 72 trayectorias de una única tarea (Stack Bowls); la generalización a otras tareas o entornos no está demostrada.
- La geometría de entrada cacheada es estimada, no ground truth de simulador, lo que introduce error en las etiquetas geométricas.
- No se reporta tasa de éxito en el mundo real; el rendimiento en hardware físico es desconocido.
- Licencia no declarada: no se puede asumir uso comercial permitido.
- Idiomas no declarados; el modelo no está pensado para tareas lingüísticas generales.
- Riesgo de sobreajuste al entorno y a las cuatro cámaras concretas del dataset; cambios en la configuración de sensores pueden degradar el comportamiento.
- Sesgos y alucinaciones en el sentido de modelos de lenguaje no aplican directamente, pero sí el riesgo de predicciones de acción no verificadas fuera de la distribución de entrenamiento.

## Enlaces

- HuggingFace: https://huggingface.co/yuuu94/GraphVLA-StackBowls-V7-6k
- No se han encontrado en la información proporcionada otros enlaces a papers, blogs, repositorios o demos.
