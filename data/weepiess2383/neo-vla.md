# weepiess2383/NEO-VLA

## Resumen

NEO-VLA es una familia de checkpoints para investigación en políticas nativas de visión-lenguaje-acción (VLA), publicada por weepiess2383 y asociada al trabajo "From Pixels to Actions: Towards Native Vision-Language-Action Policies". El objetivo del modelo es mapear directamente observaciones visuales a acciones motoras, integrando comprensión visual y lingüística con generación de acciones en una sola política, en lugar de encadenar un modelo de visión-lenguaje con un controlador separado.

El repositorio incluye dos etapas de entrenamiento: una primera de preentrenamiento de acciones con backbone congelado (paso 113.400) y una segunda de entrenamiento conjunto de visión, lenguaje y acción (paso 75.000), que se inicializa desde la etapa 1. Los checkpoints se distribuyen en formato nativo (`state.pt`) con estado de entrenamiento incluido, y no como exportaciones `AutoModel` de Transformers, por lo que su uso requiere el código del proyecto.

La relevancia actual del modelo reside en su enfoque "nativo" de VLA y en la publicación conjunta de checkpoints por etapas y de un dataset de preentrenamiento de acciones, lo que facilita la reproducibilidad de experimentos de adaptación a distintas morfologías de robot. La información pública disponible es limitada: no se detallan parámetros, contexto, idiomas ni resultados de benchmarks.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA); backbone de visión-lenguaje no especificado en detalle; detalles en la guía de entrenamiento del repositorio |
| Parametros totales | no disponible (el tokenizer de referencia es NEOpp-2B-SFT; el tamaño del backbone no se confirma) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Código bajo Apache-2.0; pesos del backbone y datasets conservan sus términos upstream; licencia de los checkpoints no indicada explícitamente |
| Formato de pesos | Checkpoint nativo `state.pt` (no safetensors, no GGUF, no exportación Transformers) |

## Arquitectura y entrenamiento

NEO-VLA se plantea como una política VLA nativa que procesa píxeles y produce acciones de robot, con un backbone de visión-lenguaje sobre el que se acoplan las cabezas de acción. El repositorio organiza el entrenamiento en dos fases: una etapa 1 de preentrenamiento de acciones con el backbone congelado, ejecutada hasta el paso 113.400, y una etapa 2 de entrenamiento conjunto de visión, lenguaje y acción hasta el paso 75.000, inicializada desde la etapa 1. Posteriormente, según la model card, existen experimentos separados de midtraining en simulador y de fine-tuning específico por tarea que no forman parte de este repositorio.

Cada etapa incluye su propio `state.pt`, un `meta.json` y registros de normalización `embodiments.json` por morfología de robot. La representación de acciones y las máscaras dependen de esos registros, por lo que deben usarse los del checkpoint correspondiente. El entrenamiento conjunto original empleó datos de co-entrenamiento de comprensión multimodal; el código liberado ofrece COCO ShareGPT como configuración de ejemplo por defecto, pero no reproduce esa mezcla original. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron RLHF o DPO.

## Capacidades

- Generación de acciones de robot a partir de observaciones visuales (política visión-lenguaje-acción).
- Comprensión visual y lingüística integrada en el mismo modelo, fruto del entrenamiento conjunto de la etapa 2.
- Preentrenamiento de acciones reutilizable como inicialización para nuevas tareas y morfologías de robot.
- Soporte de múltiples morfologías mediante registros de normalización por embodiment (`embodiments.json`).
- Adaptación mediante fine-tuning específico por tarea (no incluido en el repositorio).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio más allá del pipeline robótico: no disponible.

## Casos de uso

- Investigación en políticas VLA: usar la etapa 2 como punto de partida para estudiar el entrenamiento conjunto de visión, lenguaje y acción, comparando con arquitecturas que separan percepción y control.
- Preentrenamiento de acciones reutilizable: inicializar desde `stage1` (paso 113.400) para experimentos que requieran un backbone congelado y una política de acción preentrenada.
- Adaptación a una morfología concreta: fine-tuning con los registros `embodiments.json` del checkpoint para un robot específico, respetando la representación de acciones y las máscaras asociadas.
- Midtraining en simulador: emplear los checkpoints como base antes de pasar a un entorno simulado, tal como describe la model card para los experimentos posteriores.
- Reproducción de experimentos: descargar ambas etapas con `huggingface_hub` y replicar la configuración de entrenamiento documentada en la guía del repositorio.
- Benchmarking de VLA nativos: evaluar la política en tareas de manipulación y comparar la curva de rendimiento entre la etapa 1 y la etapa 2.
- Estudio de co-entrenamiento multimodal: analizar el efecto de los datos de comprensión multimodal usando COCO ShareGPT como configuración de referencia del código liberado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 53,8 GB e incluye dos checkpoints con estado de entrenamiento, lo que da una cota inferior del almacenamiento necesario, no de la VRAM.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el uso previsto es mediante el código del proyecto con checkpoints nativos `state.pt`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| NEO-VLA | no disponible | no disponible | código Apache-2.0; pesos con términos upstream | `state.pt` nativo | Hugging Face (weepiess2383/NEO-VLA) |
| Alternativas VLA comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Los checkpoints están pensados para investigación en aprendizaje robótico y requieren adaptación y evaluación específicas por tarea antes de usarse en un robot físico.
- No son exportaciones `AutoModel` de Transformers; requieren el código y la configuración de política del proyecto.
- La representación de acciones y las máscaras dependen de los registros `embodiments.json` del checkpoint; usar otros registros puede invalidar el comportamiento.
- El código liberado no reproduce la mezcla original de datos de co-entrenamiento multimodal; COCO ShareGPT es solo un ejemplo de configuración.
- La licencia de los checkpoints no se indica explícitamente; el código es Apache-2.0, pero los pesos del backbone y los datasets conservan sus términos upstream, lo que condiciona el uso comercial.
- Sesgos conocidos: no disponible.
- Riesgo de alucinación: no evaluado en la información disponible.
- Limitaciones de contexto o idioma: no disponible.
- No se han publicado benchmarks ni métricas de rendimiento en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/weepiess2383/NEO-VLA
- Página del proyecto: https://weichenfan.github.io/NEO-VLA-Page/
- Código: https://github.com/WeichenFan/NEO-VLA
- Guía de entrenamiento: https://github.com/WeichenFan/NEO-VLA/blob/main/docs/training.md
- Dataset de preentrenamiento de acciones: https://huggingface.co/datasets/weepiess2383/NEO-VLA-Action-Pretrain
