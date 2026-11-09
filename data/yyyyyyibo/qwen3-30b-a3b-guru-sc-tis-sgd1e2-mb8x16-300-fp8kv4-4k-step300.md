# YYYYYYibo/qwen3-30b-a3b-guru-sc-tis-sgd1e2-mb8x16-300-fp8kv4-4k-step300

## Resumen

Este repositorio contiene un checkpoint del paso 300 de un ajuste fino por refuerzo (RL) sobre el modelo base Qwen3-30B-A3B, publicado por el usuario YYYYYYibo. Se trata de un experimento de entrenamiento orientado a matematicas ("guru-RL math") realizado con la libreria verl y exportado desde un actor FSDP con pesos maestros en precision completa, sin estado del optimizador. No es un modelo nuevo ni un modelo oficial de Alibaba: es un artefacto de investigacion derivado de Qwen3-30B-A3B-Base.

La arquitectura subyacente es Qwen3 MoE (tag `qwen3_moe`), con 30.532.122.624 parametros totales segun el recuento de safetensors. El nombre del run indica detalles del entrenamiento: contexto de 4K tokens, batch de 128x8, 16 minibatches, SGD con learning rate 1e-2, pesos en FP8 y cache KV en NVFP4 durante los rollouts, sin router replay, y metodo "Score Centering + TIS" como baseline. El repositorio ocupa 61,1 GB, coherente con pesos en precision completa de un modelo de ~30B.

Su relevancia es acotada: sirve como referencia para quien investigue recetas de RL sobre MoE con verl, cuantizacion de rollouts y tecnicas de estabilizacion como TIS, pero no esta pensado como modelo de produccion. No tiene descargas ni likes, no declara licencia ni idiomas, y la model card es minima.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tag `qwen3_moe`, derivado de Qwen3-30B-A3B-Base) |
| Parametros totales | 30.532.122.624 |
| Parametros activos | no disponible |
| Longitud de contexto | 4K tokens (segun nombre del run y model card) |
| Tipos de cuantizacion | FP8 (pesos durante rollouts), NVFP4 (cache KV durante rollouts); los pesos exportados son de precision completa |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-30B-A3B-Base, un transformer con mezcla de expertos (MoE) de aproximadamente 30B parametros totales. El checkpoint exportado contiene los pesos maestros en precision completa del actor FSDP, sin estado del optimizador; es decir, es el resultado del entrenamiento RL, no un modelo cuantizado, aunque durante la generacion de rollouts se uso vLLM con pesos FP8 y cache KV en NVFP4.

El entrenamiento consistio en RL para matematicas con verl, usando SGD con learning rate 1e-2, batch de 128x8 y 16 minibatches, con contexto de 4K. El metodo se etiqueta como "Score Centering + TIS (baseline)" y se indica explicitamente que no se uso router replay. El nombre del run codifica estos hiperparametros (`sgd1e2-mb8x16-300-fp8kv4-4k-step300`), lo que facilita la trazabilidad del experimento. No se detalla la composicion del dataset, el numero de tokens de entrenamiento ni si hubo etapas adicionales de alineamiento.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base Qwen3-30B-A3B.
- Razonamiento matematico, objetivo principal del ajuste RL.
- Razonamiento multi-paso (tag `rl` y naturaleza del entrenamiento).
- Soporte de tool calling y function calling: no confirmado en la informacion disponible para este checkpoint.
- Capacidades de agente: no confirmadas en la informacion disponible.
- Capacidades multilingues: no disponibles (el modelo base Qwen3 es multilingue, pero este checkpoint no declara idiomas).
- Modo thinking: no confirmado en la informacion disponible.
- Vision y audio: no disponibles.

## Casos de uso

- Investigacion en RL para matematicas: reproducir o comparar la receta "Score Centering + TIS" frente a otras variantes sobre Qwen3-30B-A3B, usando el checkpoint del paso 300 como punto de referencia intermedio.
- Estudio de estabilidad de entrenamiento MoE: analizar el efecto de no usar router replay y de cuantizar rollouts (FP8/NVFP4) en la calidad final del actor.
- Evaluacion de tecnicas de cuantizacion en RL: comparar el rendimiento del actor exportado en precision completa frente a los rollouts cuantizados usados durante el entrenamiento.
- Generacion de soluciones a problemas matematicos en entornos de laboratorio: el ajuste especifico en matematicas puede emplearse para experimentos controlados de evaluacion, siempre con verificacion humana.
- Base para experimentos de destilacion o merging: al ser un checkpoint derivado de un modelo conocido, puede servir como componente en estudios de combinacion de pesos.
- Docencia y formacion: ilustrar un pipeline completo de RL con verl, FSDP y vLLM cuantizado, usando el nombre del run como ejemplo de configuracion reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (BF16/FP16): aproximadamente 61 GB solo para pesos, mas cache KV y activaciones; en la practica, 80 GB o mas por GPU para contextos de 4K.
- VRAM estimada con cuantizacion a 8 bits: en torno a 30-35 GB, viable en una A100 40 GB o H100.
- VRAM estimada con cuantizacion a 4 bits: en torno a 16-20 GB, potencialmente viable en RTX 4090 (24 GB) con contexto limitado.
- GPU recomendadas: A100 80 GB, H100 80 GB para precision completa; A100 40 GB o H100 para FP8; RTX 4090 para cuantizaciones de 4 bits.
- Despliegue: transformers (libreria declarada), vLLM (usado en los rollouts del entrenamiento), llama.cpp u Ollama si se generan GGUF, TGI si se convierte el checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este checkpoint (paso 300) | 30.532.122.624 | 4K | no disponible | Hugging Face, 0 descargas |
| Qwen3-30B-A3B-Base | ~30B (MoE) | no disponible en esta ficha | no disponible en esta ficha | Modelo base publico de Alibaba |
| Alternativas de RL matematico de ~30B | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre este checkpoint y otras variantes de RL sobre Qwen3-30B-A3B.

## Limitaciones y advertencias

- Checkpoint intermedio (paso 300) de un experimento de investigacion; no se ha validado como modelo final ni se han publicado evaluaciones.
- Licencia no declarada: no se puede asumir uso comercial sin verificar los terminos del modelo base Qwen3-30B-A3B-Base.
- Idiomas no declarados; el ajuste en matematicas puede degradar capacidades generales o conversacionales respecto al base.
- Riesgo de alucinacion y de errores en razonamiento matematico fuera de la distribucion de entrenamiento.
- Contexto limitado a 4K tokens, insuficiente para tareas de contexto largo o documentos extensos.
- Ausencia de datos sobre sesgos, dataset de entrenamiento y proceso de filtrado.
- El nombre del run sugiere tecnicas de estabilizacion (Score Centering, TIS) sin router replay; la reproducibilidad exacta no esta garantizada sin el codigo y los datos originales.
- Cero descargas y cero likes: sin validacion por parte de la comunidad.
- El repositorio ocupa 61,1 GB; el despliegue en precision completa requiere hardware de gama alta.

## Enlaces

- Hugging Face: https://huggingface.co/YYYYYYibo/qwen3-30b-a3b-guru-sc-tis-sgd1e2-mb8x16-300-fp8kv4-4k-step300
- Modelo base: Qwen3-30B-A3B-Base (no se proporciona enlace en la informacion disponible)
- Libreria de entrenamiento: verl (no se proporciona enlace en la informacion disponible)
- Paper o blog del metodo: no disponible
