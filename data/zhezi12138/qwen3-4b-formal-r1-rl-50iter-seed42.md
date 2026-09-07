# zhezi12138/Qwen3-4B-formal-r1-RL-50iter-seed42

## Resumen

Qwen3-4B-formal-r1-RL-50iter-seed42 es un modelo de lenguaje entrenado mediante aprendizaje por refuerzo con GRPO (Group Relative Policy Optimization) sobre la base de Qwen/Qwen3-4B-Instruct-2507. Está desarrollado por zhezi12138 como parte del proyecto Formal-R1, orientado a la demostración de teoremas en un formato de lenguaje natural controlado (CNL). El repositorio contiene los pesos de inferencia del checkpoint de 50 iteraciones con semilla 42, que sirvió como baseline antes de experimentos posteriores de optimización por preferencias on-policy (OPD) y continuación del entrenamiento por RL. Resuelve un problema específico: generar pruebas matemáticas en un formato intermedio que un verificador externo pueda validar, reduciendo la brecha entre el razonamiento en lenguaje natural y la verificación formal. Es relevante en el contexto de la investigación en RL aplicada a razonamiento matemático, pues permite evaluar la efectividad de GRPO en tareas de este tipo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (decoder-only) derivado de Qwen3 |
| Parametros totales | 4.022.468.096 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo parte del checkpoint de instrucciones Qwen/Qwen3-4B-Instruct-2507 y se afina con GRPO, una variante de PPO orientada a mejorar la robustez de la política mediante grupos de rollouts. El entrenamiento se realizó durante 50 iteraciones (checkpoint iter_0000049) con semilla de rollout 42, utilizando como datos de entrenamiento el fichero `examples/formal-r1/data/real_ok_valid.jsonl` y como datos de evaluación para el launcher `examples/formal-r1/data/real_valid.jsonl`. El repositorio se generó a partir de la revisión `6541bdf` de `cnl_rl` y de la actualización de la fuente de prompts `ee4cde0` de `cnl_itp`. No se incluyen el estado del optimizador ni el estado de entrenamiento distribuido, solo los pesos de inferencia. La innovación técnica principal es el uso de RL para alinear el modelo con un formato específico de lenguaje natural controlado para theorem proving; las salidas deben comprobarse con el verificador correspondiente.

## Capacidades

- Generacion de texto especializada en la demostracion de teoremas matematicos en un formato de lenguaje natural controlado (CNL) definido por el proyecto Formal-R1.
- Razonamiento logico-matematico básico, derivado de la tarea de teorema en el conjunto de entrenamiento.
- Capacidad de seguir un formato de salida estricto, necesario para la validacion posterior por un verificador automatico.
- No se documenta soporte de tool calling, function calling, vision, audio ni capacidades de agente en la informacion proporcionada.
- La capacidad de generalizacion fuera del ambito del proyecto no esta evaluada ni documentada.

## Casos de uso

- Investigacion en aprendizaje por refuerzo aplicado a razonamiento matematico: el modelo puede usarse como baseline para comparar la efectividad de GRPO con otros algoritmos o configuraciones en la misma tarea.
- Generacion de demostraciones en un formato de lenguaje natural controlado para su posterior verificacion automatica, integrandose en flujos de trabajo de pruebas formales asistidas.
- Estudio de la dinamica de entrenamiento: permite analizar como evoluciona la calidad de las salidas a lo largo de 50 iteraciones y con distintas semillas de rollout.
- Soporte en el desarrollo de datasets y verificadores de teoremas, al proporcionar muestras de salida que permiten depurar el verificador frente a formatos CNL.
- Comparacion de tecnicas de RL on-policy por grupos frente a enfoques de aprendizaje supervisado o DPO, dentro del marco Formal-R1.
- Experimento de ablacion en el pipeline de RL: al ser un checkpoint intermedio, sirve para inspeccionar si el entrenamiento adicional (self-OPD) aporta mejoras reales sobre este baseline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia sin cuantizar en bf16: unos 16 GB (los pesos en bf16 ocupan aproximadamente 8 GB, a lo que hay que sumar KV cache y activaciones).
- Con cuantizacion no disponible en el repositorio, no se pueden ofrecer cifras para precisiones reducidas.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), A100 (40 o 80 GB), H100 (80 GB) o equivalentes con al menos 16 GB de memoria.
- Cabe en GPUs de consumo de gama alta (24 GB), aunque la ventana de contexto disponible no esta especificada y podria limitar la longitud de las secuencias.
- Opciones de despliegue: vLLM, Hugging Face Transformers; tambien seria posible convertir a GGUF para usar en llama.cpp u Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Longitud de contexto | Licencia | Particularidad |
|---|---|---|---|---|
| Qwen/Qwen3-4B-Instruct-2507 | ~4.02B | no disponible | Apache 2.0 | Modelo base sin el afinado GRPO |
| zhezi12138/Qwen3-4B-formal-r1-RL-50iter-seed42 | 4.022.468.096 | no disponible | Apache 2.0 | Baseline GRPO, 50 iteraciones, seed 42 |
| zhezi12138/Qwen3-4B_RL_valid | no disponible | no disponible | Apache 2.0 | Variante del autor en Hugging Face, sin detalles publicados |
| zhezi12138/Qwen3-4B_RL_combined | no disponible | no disponible | Apache 2.0 | Variante del autor en Hugging Face, sin detalles publicados |

Los dos ultimos modelos se encuentran en el mismo espacio de Hugging Face del autor, pero no se dispone de especificaciones ni evaluaciones publicas para compararlos con rigor.

## Limitaciones y advertencias

- Riesgo de alucinacion en las demostraciones generadas: el modelo puede producir pruebas incorrectas o incompletas, por lo que las salidas deben comprobarse siempre con el verificador correspondiente.
- Especializado en un formato CNL muy concreto; es probable que su rendimiento se degrade en otros dominios o con prompts fuera de ese formato.
- No se han publicado evaluaciones independientes ni benchmarks, por lo que no se puede estimar su calidad relativa frente a otros modelos de tamano similar.
- El conjunto de datos de entrenamiento no esta documentado en detalle, lo que dificulta conocer sesgos linguisticos o tematicos del modelo.
- Al tratarse de un checkpoint de investigacion, no se garantiza soporte ni estabilidad para produccion.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el funcionamiento del modelo.
- El repositorio solo contiene pesos de inferencia; para reproducir el entrenamiento se necesitaria el checkpoint distribuido original, no incluido.

## Enlaces

- Hugging Face: https://huggingface.co/zhezi12138/Qwen3-4B-formal-r1-RL-50iter-seed42
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Variante relacionada del autor: https://huggingface.co/zhezi12138/Qwen3-4B_RL_valid
- Variante relacionada del autor: https://huggingface.co/zhezi12138/Qwen3-4B_RL_combined
