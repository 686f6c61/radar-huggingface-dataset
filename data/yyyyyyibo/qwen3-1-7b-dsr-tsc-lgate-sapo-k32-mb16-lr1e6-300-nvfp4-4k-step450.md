# YYYYYYibo/qwen3-1.7b-dsr-tsc-lgate-sapo-k32-mb16-lr1e6-300-nvfp4-4k-step450

## Resumen

qwen3-1.7b-dsr-tsc-lgate-sapo-k32-mb16-lr1e6-300-nvfp4-4k-step450 es un ajuste fino por aprendizaje por refuerzo (RL) del modelo base Qwen3-1.7B-Base, publicado por el usuario YYYYYYibo en Hugging Face. El checkpoint corresponde al paso 450 de un entrenamiento orientado a razonamiento matematico, realizado sobre el conjunto de datos DeepScaleR con una ventana de contexto de 4K tokens. El modelo conserva la arquitectura transformer densa de Qwen3 con 1.720.574.976 parametros totales (aproximadamente 1,7 mil millones).

La relevancia de esta publicacion es principalmente experimental: documenta una combinacion concreta de tecnicas de RL para modelos de razonamiento, identificada en el nombre del run como TSC con "logit-shift soft gate" (lrms) y forma SAPO basada en sech^2, con un tamano de grupo k=32 y micro-batch de 16, tasa de aprendizaje 1e-6 y 300 pasos previstos. Los pesos se exportaron desde un checkpoint de actor FSDP de verl en precision completa (pesos maestros sin estado del optimizador), aunque durante el entrenamiento los rollouts se generaron con vLLM cuantizado en NVFP4.

Se trata de un artefacto de investigacion con cero descargas y cero likes en el momento de la consulta, sin model card extendida, sin licencia declarada y sin idiomas especificados. No debe confundirse con un modelo listo para produccion: su interes radica en reproducir o estudiar una receta de RL aplicada a un modelo pequeno de la familia Qwen3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-1.7B-Base) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 4K tokens (contexto de entrenamiento del run) |
| Tipos de cuantizacion | NVFP4 usado en los rollouts de entrenamiento (vLLM); pesos publicados en precision completa (safetensors); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponibles (heredados de Qwen3-1.7B-Base, no declarados en la model card) |
| Licencia | no disponible |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B-Base, un transformer denso de aproximadamente 1,7 mil millones de parametros. Sobre esa base se aplico un ajuste fino por RL con verl, usando el framework FSDP para el actor. El entrenamiento se centro en matematicas con el dataset DeepScaleR y una ventana de contexto de 4K tokens. La receta indicada en el nombre del run incluye TSC (probablemente una variante de entrenamiento con senal de confianza o self-consistency) con una compuerta suave basada en desplazamiento de logits ("logit-shift soft gate", abreviada lrms) y una funcion de forma SAPO con perfil sech^2, con grupo de tamano k=32, micro-batch 16, tasa de aprendizaje 1e-6 y un total previsto de 300 pasos; este checkpoint es el paso 450.

Un detalle tecnico relevante es la asimetria entre entrenamiento e inferencia: los rollouts se generaron con vLLM en cuantizacion NVFP4, mientras que los pesos exportados son los pesos maestros del actor en precision completa, sin estado del optimizador. Esto significa que el artefacto publicado no esta cuantizado y que el comportamiento observado durante el entrenamiento puede diferir ligeramente del que se obtenga al desplegar los pesos en BF16/FP16. No se documentan en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si hubo fases adicionales de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base Qwen3-1.7B.
- Razonamiento matematico reforzado mediante RL sobre DeepScaleR, con enfasis en problemas de varios pasos.
- Generacion de cadenas de razonamiento extensas dentro de la ventana de 4K tokens.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado especificamente; el entrenamiento RL sugiere capacidad de razonamiento encadenado, pero sin garantias declaradas.
- Capacidades multilingues: no disponibles (no declaradas).
- Capacidades especiales (modo thinking explicito, vision, audio): no disponibles.

## Casos de uso

- Investigacion en RL para razonamiento: el checkpoint sirve como referencia reproducible de una receta concreta (TSC, logit-shift soft gate, SAPO sech^2, k=32) aplicada a un modelo de 1,7B, util para comparar curvas de entrenamiento y estabilidad frente a otras variantes.
- Evaluacion de tecnicas de cuantizacion: al haberse entrenado con rollouts en NVFP4 y publicarse en precision completa, permite medir la brecha de rendimiento entre inferencia cuantizada y no cuantizada en tareas de matematicas.
- Generacion de soluciones matematicas paso a paso en entornos educativos o de autoaprendizaje, con la cautela de verificar resultados por el riesgo de alucinacion.
- Prototipado de pipelines de razonamiento en hardware modesto: con 1,7B de parametros cabe en GPUs de consumo y permite iterar rapidamente antes de escalar a modelos mayores.
- Base para ajustes finos posteriores (SFT, DPO) en dominios especificos de matemticas o STEM, partiendo de un actor ya entrenado con RL.
- Experimentos de destilacion o generacion de datos sinteticos de razonamiento, usando el modelo como generador de trazas de solucion para filtrar y reentrenar modelos mas pequenos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 3,5 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 5 y 7 GB para contextos de 4K.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 2 GB de pesos; en 4 bits, en torno a 1 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para BF16 en contextos cortos (RTX 3060 Ti, RTX 4060, RTX 4070); A100 o H100 no son necesarias para este tamano.
- Cabe en GPU de consumo: si, incluidas RTX 3060 de 12 GB, RTX 4070, RTX 4080 y RTX 4090, asi como en GPUs integradas con suficiente memoria compartida mediante cuantizacion agresiva.
- Opciones de despliegue: transformers (formato nativo safetensors), vLLM (coherente con el entorno de entrenamiento), llama.cpp/Ollama si se generan pesos GGUF, y TGI por compatibilidad con el pipeline text-generation.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Qwen3-1.7B + RL DeepScaleR) | 1,72B | 4K (entrenamiento) | RL para matematicas | no disponible | Hugging Face, 0 descargas |
| Qwen3-1.7B-Base | 1,7B aprox. | no disponible en esta ficha | Modelo base generalista | no disponible en esta ficha | Publico en Hugging Face |
| DeepSeek-R1-Distill-Qwen-1.5B | 1,5B | 32K aprox. (segun model card oficial) | Destilacion de razonamiento | licencia del modelo base | Publico en Hugging Face |

La comparacion cuantitativa de rendimiento no esta disponible porque este checkpoint no publica benchmarks. Frente a Qwen3-1.7B-Base, la diferencia es la fase de RL sobre DeepScaleR; frente a destilados de razonamiento como DeepSeek-R1-Distill-Qwen-1.5B, la diferencia principal es el metodo (RL directo frente a destilacion) y el contexto de entrenamiento, mucho menor en este caso (4K).

## Limitaciones y advertencias

- Ausencia total de model card detallada: no se documentan datos de entrenamiento, hiperparametros completos, evaluacion ni limitaciones conocidas.
- Licencia no declarada: no se puede asumir uso comercial permitido; es imprescindible contactar con el autor o verificar la licencia del modelo base Qwen3 antes de cualquier despliegue.
- Contexto limitado a 4K tokens en entrenamiento: no es adecuado para tareas de contexto largo ni para conversaciones muy extensas sin truncado.
- Riesgo de alucinacion: como todo modelo de 1,7B entrenado con RL en matematicas, puede producir cadenas de razonamiento plausibles pero incorrectas; requiere verificacion externa.
- Sesgos: no documentados; al heredar el modelo base, puede reproducir sesgos de los datos de preentrenamiento de Qwen3.
- Especializacion estrecha: el RL se centro en matematicas (DeepScaleR), por lo que el rendimiento en otras tareas puede degradarse respecto al modelo base.
- Discrepancia entrenamiento/inferencia: los rollouts usaron vLLM con NVFP4 y los pesos publicados son de precision completa; el comportamiento puede diferir del observado durante el entrenamiento.
- Cero adopcion (0 descargas, 0 likes) y publicacion reciente: no hay evidencia de la comunidad sobre su calidad o estabilidad.
- Checkpoint intermedio (paso 450 de un run de 300 pasos declarados): conviene verificar si existen checkpoints posteriores o finales antes de usarlo como referencia.

## Enlaces

- Hugging Face: https://huggingface.co/YYYYYYibo/qwen3-1.7b-dsr-tsc-lgate-sapo-k32-mb16-lr1e6-300-nvfp4-4k-step450
- Modelo base Qwen3-1.7B-Base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
- Dataset DeepScaleR: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Framework verl: https://github.com/volcengine/verl
- vLLM: https://github.com/vllm-project/vllm
- Paper de Qwen3: https://arxiv.org/abs/2505.09388
