# YYYYYYibo/qwen3-1.7b-dsr-tsc-k32-mb16-lr1e6-300-nvfp4-4k-step450

## Resumen

`YYYYYYibo/qwen3-1.7b-dsr-tsc-k32-mb16-lr1e6-300-nvfp4-4k-step450` es un checkpoint experimental de ajuste fino por aprendizaje por refuerzo (RL) sobre Qwen3-1.7B-Base, desarrollado por el usuario YYYYYYibo y publicado en Hugging Face. El modelo está especializado en razonamiento matemático mediante el dataset DeepScaleR y ha sido entrenado con verl, un framework de RL para modelos de lenguaje. El nombre del repositorio codifica los hiperparámetros del experimento: grupo de 32 muestras (k32), microbatch de 16 (mb16), tasa de aprendizaje 1e-6, 300 pasos planificados, contexto de 4K tokens y rollouts cuantizados en NVFP4. Este checkpoint corresponde al paso 450 de entrenamiento.

La relevancia de este modelo es acotada: se trata de un artefacto de investigación que documenta un método concreto, Transported Score Centering (TSC) con ratio gate, aplicado al ajuste por RL de un modelo compacto de 1.700 millones de parámetros para tareas de matemáticas. No es un modelo de propósito general ni un lanzamiento de producción; su interés radica en la reproducibilidad del experimento y en la posibilidad de evaluar el efecto del método TSC sobre el rendimiento matemático de Qwen3-1.7B.

El checkpoint se exportó desde el actor FSDP de verl con los pesos maestros en precisión completa, sin estado del optimizador. Aunque los rollouts durante el entrenamiento usaron vLLM cuantizado en NVFP4, los pesos publicados son los del actor sin cuantizar. El repositorio ocupa 3,5 GB y contiene pesos en formato safetensors compatibles con transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-1.7B-Base) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 4K tokens (configurado en el entrenamiento); el modelo base Qwen3-1.7B soporta hasta 131K |
| Tipos de cuantizacion | no disponible (pesos publicados sin cuantizar; los rollouts de entrenamiento usaron NVFP4) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B-Base, un transformer denso de 1.700 millones de parámetros desarrollado por Alibaba Cloud. Sobre esta base se aplicó un ajuste fino por aprendizaje por refuerzo mediante verl, con el dataset DeepScaleR como fuente de problemas matemáticos. El entrenamiento se realizó con un contexto de 4K tokens, grupo de 32 muestras por prompt (k32), microbatch de 16, tasa de aprendizaje de 1e-6 y un total planificado de 300 pasos; el checkpoint publicado corresponde al paso 450, lo que sugiere que el entrenamiento se extendió más allá de la configuración nominal o que el nombre del run no refleja el total real de pasos.

La innovación técnica declarada es Transported Score Centering (TSC) con ratio gate, un método de estabilización del entrenamiento por RL que no está documentado en detalle en la model card. Durante el entrenamiento, los rollouts se generaron con vLLM en cuantización NVFP4, lo que reduce el coste computacional de la generación de muestras. Los pesos exportados son los del actor FSDP en precisión completa, sin estado del optimizador, lo que permite su uso directo con transformers. No se especifica la composición exacta del dataset ni si hubo fases adicionales de RLHF o DPO.

## Capacidades

- Generación de texto conversacional, heredada de la base Qwen3-1.7B.
- Razonamiento matemático, especialidad del ajuste con DeepScaleR.
- Razonamiento multi-paso orientado a la resolución de problemas.
- Compatible con text-generation-inference y endpoints compatibles según los tags del repositorio.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.
- Visión o audio: no disponible.

## Casos de uso

- Evaluación de métodos de RL: el checkpoint permite reproducir y comparar el efecto de Transported Score Centering frente a otros métodos de estabilización en el ajuste por RL de modelos matemáticos pequeños.
- Investigación en razonamiento matemático: útil para analizar cómo un modelo de 1.700 millones de parámetros se comporta en problemas de DeepScaleR tras el ajuste, con contexto de 4K tokens.
- Generación de soluciones paso a paso en entornos educativos: el modelo puede producir cadenas de razonamiento matemático para problemas de nivel escolar y competición, siempre con verificación humana.
- Base para experimentos de destilación: al ser un modelo compacto, sirve como estudiante en pipelines de destilación desde modelos mayores de razonamiento.
- Pruebas de cuantización: dado que el entrenamiento usó rollouts NVFP4, es un candidato para estudiar la degradación de precisión al cuantizar los pesos finales.
- Benchmarking interno de infraestructura: con 1.700 millones de parámetros y 3,5 GB en safetensors, es adecuado para validar pipelines de despliegue con transformers o vLLM en GPUs de gama media.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 3,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 5 y 7 GB para contexto de 4K.
- VRAM estimada en cuantización de 8 bits: alrededor de 2 GB para pesos.
- VRAM estimada en cuantización de 4 bits: alrededor de 1 GB para pesos.
- GPU recomendadas: RTX 4090, RTX 3090, A100, H100; cualquier GPU con al menos 8 GB de VRAM para FP16 en contexto corto.
- Cabe en GPUs de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference y endpoints compatibles según los tags; vLLM es plausible dado el uso durante el entrenamiento, aunque no se confirma en la model card.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (Qwen3-1.7B + RL DeepScaleR) | 1,72B | 4K (entrenamiento) | Matemáticas, investigación RL | no disponible | Hugging Face |
| Qwen/Qwen3-1.7B | 1,7B | 131K | Propósito general, thinking y non-thinking | no disponible en la información consultada | Hugging Face |
| DeepScaleR (modelos derivados de DeepSeek-R1-Distill) | variable (1,5B–7B) | variable | Razonamiento matemático | no disponible | Hugging Face |

La comparación directa con Qwen3-1.7B es la más relevante: comparten arquitectura y tamaño, pero este checkpoint sacrifica contexto (4K frente a 131K) y generalidad a cambio de especialización matemática mediante RL. Frente a otros modelos ajustados con DeepScaleR, la diferencia principal es el método TSC, cuya eficacia no está cuantificada en la información disponible.

## Limitaciones y advertencias

- Modelo experimental de investigación: no hay benchmarks publicados que validen su rendimiento frente al base o frente a alternativas.
- Contexto limitado a 4K tokens en el entrenamiento, muy inferior a los 131K del Qwen3-1.7B original; no se garantiza buen comportamiento más allá de esa ventana.
- Licencia no especificada: no se puede confirmar el uso comercial ni las obligaciones de atribución. Es imprescindible verificar la licencia del modelo base Qwen3-1.7B antes de cualquier despliegue.
- Idiomas no declarados: se desconoce el soporte multilingüe real tras el ajuste.
- Riesgo de alucinación inherente a los modelos de lenguaje, potencialmente acentuado en dominios fuera de las matemáticas.
- Especialización estrecha: el ajuste con DeepScaleR puede degradar capacidades generales del modelo base.
- Sin estado del optimizador ni documentación del dataset: la reproducibilidad del entrenamiento es limitada.
- Cero descargas y cero likes en el momento de la consulta: sin validación por parte de la comunidad.
- El nombre del run indica 300 pasos pero el checkpoint es del paso 450; conviene tratar la configuración como aproximada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YYYYYYibo/qwen3-1.7b-dsr-tsc-k32-mb16-lr1e6-300-nvfp4-4k-step450
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Ficha de Qwen3-1.7B con requisitos de VRAM y especificaciones: https://apxml.com/models/qwen3-1-7b
