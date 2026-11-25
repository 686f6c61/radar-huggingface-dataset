# xiangxin0923/VTLA-RL-sft-taccorl-task927-firm-30k

## Resumen

VTLA-RL-sft-taccorl-task927-firm-30k es un modelo de visión-lenguaje-acción (VLA) orientado a robótica táctil, publicado por el usuario xiangxin0923 en Hugging Face. Se trata de un export de pesos fusionados (merged) en BF16 procedente de un proceso de co-entrenamiento con RL (TacCoRL) y ajuste supervisado (SFT) sobre los conjuntos de datos Task927 Firm 4x4, combinando datos reales y datos reproducidos (replayed). El modelo consume dos vistas RGB y el movimiento de marcadores táctiles, con los tokens de estado desactivados (configuración "no-state").

El modelo se distribuye bajo la librería `openpi` y el pipeline `robotics`, con licencia Apache 2.0. El repositorio ocupa 22,0 GB e incluye tres checkpoints independientes (pasos 10k, 20k y 30k) en formato safetensors, junto con configuración, estadísticas de normalización, metadatos de exportación y auditorías de carga y paridad. El export de 30k es el EMA final (`is_final=true`).

Su relevancia es acotada y muy específica: no es un modelo de propósito general, sino un artefacto de investigación para una tarea robótica concreta (Task927, variante "Firm", tablero 4x4) con control táctil. La validación publicada se limita a comprobaciones de carga estricta, preprocesado sin estado, inferencia con entradas fijas y paridad del solver Euler compartido entre RLinf y T2-VLA; el autor indica explícitamente que no se trata de una evaluación de calidad de política en simulador.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) compatible con T2-VLA; consume 2 vistas RGB y movimiento de marcadores táctiles; sin tokens de estado |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | pesos exportados en BF16; no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16, pesos fusionados sin adaptadores LoRA) |

## Arquitectura y entrenamiento

El modelo sigue el paradigma VLA: un backbone de visión-lenguaje que produce acciones motoras. En este caso concreto, las entradas son dos vistas RGB y la señal táctil derivada del movimiento de marcadores; los tokens de estado están desactivados. El export es compatible con T2-VLA y con el stack RLinf, e incluye estadísticas de normalización y metadatos de exportación. No se detalla en la información disponible el número de parámetros, la profundidad del transformer ni el tamaño del vocabulario visual.

El entrenamiento combina co-entrenamiento con RL (TacCoRL) y SFT sobre los datasets Task927 Firm 4x4 (real y replayed), muestreados 50:50 con batch global de 32 en 4 GPUs (micro-batch de 8 por GPU), gradient checkpointing activado, decaimiento EMA de 0,99 y 30.000 pasos de optimizador. La supervisión de fuerza futura usa peso 0,05 con la pérdida `weighted_full`. La inferencia emplea 10 pasos de denoising y produce acciones de forma `[1, 50, 32]`. Los exports no contienen tensores de adaptadores LoRA ni estado de optimizador/DCP.

## Capacidades

- Generación de acciones robóticas a partir de dos vistas RGB y señal táctil (movimiento de marcadores), en el espacio de acción de 50 pasos × 32 dimensiones.
- Control táctil explícito: la modalidad táctil forma parte de la entrada, no es un añadido posterior.
- Inferencia sin tokens de estado (configuración "no-state"), lo que simplifica el pipeline de entrada.
- Co-entrenamiento RL + SFT: el modelo incorpora señal de recompensa además de imitación supervisada.
- Supervisión auxiliar de fuerza futura (peso 0,05), orientada a anticipar contacto.
- Compatibilidad con el ecosistema openpi/RLinf y con el solver Euler compartido de T2-VLA.
- No se documentan capacidades de lenguaje general, tool calling, agentes ni multilingüismo.

## Casos de uso

- Investigación en manipulación táctil: el modelo sirve como referencia reproducible para estudiar el efecto del co-entrenamiento RL+SFT en tareas de contacto, gracias a los tres checkpoints intermedios (10k, 20k, 30k) que permiten analizar la evolución del aprendizaje.
- Experimentos de sim-to-real con datos replayed: la mezcla 50:50 de datos reales y reproducidos permite evaluar hasta qué punto los datos simulados complementan la señal real en una tarea concreta.
- Benchmark interno de políticas VLA: al incluir auditorías de paridad de solver y de carga estricta, es utilizable como baseline verificable frente a otras políticas T2-VLA.
- Desarrollo de pipelines de robótica con openpi: el formato de export (config, estadísticas de normalización, metadatos) facilita la integración en flujos de despliegue existentes.
- Estudio de anticipación de fuerza: la supervisión de fuerza futura permite investigar la predicción de contacto en tareas de agarre firme.
- Reproducción de entrenamientos: los configs resueltos y las procedencias incluidas en `provenance/` permiten replicar el setup (batch, EMA, pasos) en infraestructuras propias.
- Ablación de la modalidad de estado: al estar desactivados los tokens de estado, sirve para comparar contra variantes con estado en la misma tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo documenta validaciones de integridad: carga estricta sin claves faltantes ni inesperadas, preprocesado sin estado, inferencia con entradas fijas (contact=false y contact=true), acciones finitas de forma `[1, 50, 32]` con 10 pasos de denoising y paridad del solver Euler compartido entre RLinf y T2-VLA. El propio autor advierte que esto no constituye una evaluación de calidad de política en simulador.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repositorio completo ocupa 22,0 GB e incluye tres checkpoints, por lo que cada export individual es sustancialmente menor, pero no se publica el recuento de parámetros.
- GPU recomendadas: el entrenamiento se realizó en 4 GPUs con micro-batch de 8 y gradient checkpointing; no se especifica el modelo de GPU.
- GPU de consumo: no se puede confirmar; depende del tamaño real del modelo, que no se documenta.
- Despliegue: stack openpi / RLinf / T2-VLA; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de política robótica).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VTLA-RL-sft-taccorl-task927-firm-30k | VLA táctil (T2-VLA) | no disponible | no disponible | Apache 2.0 | Hugging Face |
| Otras políticas T2-VLA | VLA | no disponible | no disponible | no disponible | no disponible |
| Políticas VLA genéricas (p. ej. familias openpi) | VLA | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Modelo altamente especializado: entrenado exclusivamente para Task927 Firm 4x4; no es reutilizable fuera de esa tarea sin reentrenamiento.
- Sin evaluación de calidad de política: la validación publicada cubre solo carga, formas de salida y paridad de solver, no el éxito de la tarea.
- Sin tokens de estado: la variante "no-state" puede limitar el rendimiento en escenarios donde el estado del robot sea informativo.
- Sesgos: no documentados; al entrenarse con un dataset concreto, hereda sus sesgos de distribución y de condiciones de laboratorio.
- Riesgo de alucinación: no aplica en el sentido de lenguaje, pero sí existe riesgo de acciones fuera de distribución ante entradas visuales o táctiles no vistas.
- Idiomas: no disponible; no se documentan capacidades lingüísticas.
- Licencia Apache 2.0 permite uso comercial, pero el modelo depende de datos y credenciales no incluidos en el repositorio, lo que limita la reproducibilidad completa.
- Los checkpoints son exports EMA fusionados; no incluyen adaptadores LoRA ni estado de optimizador, por lo que no son reanudables para entrenamiento.
- Fecha de creación futura (2026-11-25) en los metadatos, lo que conviene verificar antes de citarlo.

## Enlaces

- Hugging Face: https://huggingface.co/xiangxin0923/VTLA-RL-sft-taccorl-task927-firm-30k
- Registro de entrenamiento (SwanLab): https://swanlab.cn/@Demonmaster/tabero-rlinf/runs/ts927f24/chart
