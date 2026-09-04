# violetxi/qwen35-9b-wmrl-v4-n-3m

## Resumen

`violetxi/qwen35-9b-wmrl-v4-n-3m` es un checkpoint de investigación derivado de un full-finetune de `Qwen/Qwen3.5-9B`, publicado por el usuario `violetxi` en Hugging Face. El modelo forma parte de la línea "wm-internalization v4", un estudio sobre la internalización de conocimiento en modelos de lenguaje, entrenado sobre el corpus sintético "Calderwood & Harkness law-firm corpus". Según la model card, se trata de un checkpoint de condición `n-3m` con guardado `final`, y el entrenamiento se realizó sobre un pool de semillas de ~50k think-on.

El modelo tiene 9.653.104.368 parámetros (9.65B) y el repositorio ocupa 19.3 GB en formato safetensors. La licencia es Apache-2.0. No se proporcionan datos sobre longitud de contexto, idiomas, ni benchmarks. Es un modelo orientado a la investigación, no a producción, y su valor principal reside en ser un artefacto reproducible dentro de un estudio de world-internalization.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (hereda la arquitectura de Qwen/Qwen3.5-9B) |
| Parametros totales | 9.653.104.368 |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El checkpoint es un full-finetune de `Qwen/Qwen3.5-9B`, lo que significa que todos los parámetros del modelo base han sido actualizados durante el entrenamiento. El corpus de entrenamiento es el "Calderwood & Harkness synthetic law-firm corpus", un conjunto de datos sintético de dominio legal, diseñado para el estudio de internalización de conocimiento (world-internalization). La model card indica que el entrenamiento pertenece a la línea v4, con un pool de semillas de ~50k think-on, y que el checkpoint se ha "injertado" de vuelta en el layout compuesto del hub, siendo servible con vLLM sin configuración adicional.

No se especifica la composición del dataset, el número de tokens de entrenamiento, ni si se aplicaron técnicas de RLHF o DPO. El único dato técnico adicional es un "graft" que indica que se reemplazaron 427 elementos del modelo base, pero no se detalla su significado. No se dispone de más información sobre la arquitectura interna ni sobre innovaciones técnicas específicas.

## Capacidades

- No se han publicado descripciones detalladas de capacidades específicas para este checkpoint.
- Al ser un fine-tune de Qwen3.5-9B, es razonable asumir que hereda las capacidades del modelo base en generación de texto, razonamiento y codigo, pero no hay confirmacion en la informacion disponible.
- El entrenamiento en un corpus legal sintético sugiere una orientacion hacia tareas de dominio legal, aunque no se aportan evidencias de rendimiento.
- No se menciona soporte de tool calling, agentes, vision ni audio.
- El unico dato funcional conocido es que el checkpoint es servible con vLLM, lo que indica compatibilidad con el pipeline de inferencia de vLLM.

## Casos de uso

Dado que no se han publicado evaluaciones ni documentacion de aplicaciones, los siguientes casos de uso son hipotesis basadas exclusivamente en el dominio del corpus de entrenamiento y no deben considerarse confirmados:

- Investigacion academica sobre internalizacion de conocimiento: el modelo puede utilizarse para estudiar como un modelo de 9B internaliza patrones de un corpus sintetico de dominio legal, comparandolo con otros checkpoints de la misma linea v4.
- Generacion de texto legal sintetico: podria emplearse para generar documentos legales ficticios en entornos controlados de experimentacion, aunque su calidad no esta verificada.
- Analisis de contratos simulados: en un entorno de investigacion, podria probarse su capacidad para extraer clausulas o entidades de contratos generados sinteticamente.
- Evaluacion de sesgos en modelos legales: al estar entrenado sobre un corpus sintetico, puede servir como caso de estudio para analizar sesgos inducidos por datos artificiales.
- Comparacion de estrategias de fine-tuning: permite comparar el efecto de distintas condiciones de entrenamiento (como `n-3m`, `m0-nop6`, `c1-b5v4`) sobre el mismo modelo base.
- Pruebas de compatibilidad con vLLM: al ser servible con vLLM, puede usarse para validar el despliegue de checkpoints injertados en pipelines de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: ~19.3 GB (coincide con el tamano del repositorio).
- VRAM estimada en cuantizacion de 8 bits: ~9.7 GB.
- VRAM estimada en cuantizacion de 4 bits: ~5.5 GB.
- GPU recomendadas: RTX 4090 (24 GB) para FP16, A100 o H100 para inferencia a escala.
- Es posible ejecutarlo en GPUs de consumo con cuantizacion de 4 u 8 bits, aunque la calidad puede degradarse.
- Opciones de despliegue: vLLM (mencionado en la model card), llama.cpp, Ollama y TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| violetxi/qwen35-9b-wmrl-v4-n-3m | 9.65B | No disponible | Apache-2.0 | Hugging Face |
| violetxi/qwen35-9b-wmrl-v4-m0-nop6 | 9.65B (presumible) | No disponible | Apache-2.0 | Hugging Face |
| violetxi/qwen35-9b-wmrl-v4-c1-b5v4 | 9.65B (presumible) | No disponible | Apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-9B (modelo base) | 9.65B | No disponible | Apache-2.0 (presumible) | Hugging Face |

Los tres checkpoints de la serie `wm-internalization v4` comparten el mismo modelo base y la misma licencia. Las diferencias radican en las condiciones de entrenamiento (por ejemplo, `n-3m`, `m0-nop6`, `c1-b5v4`), que probablemente afectan al comportamiento final, pero no se dispone de benchmarks que cuantifiquen esas diferencias. El modelo base Qwen3.5-9B es el punto de partida comun, pero este checkpoint no sustituye al original en tareas generales sin evaluacion previa.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgos, por lo que no se pueden descartar sesgos inducidos por el corpus sintetico legal.
- Riesgo de alucinacion inherente a cualquier modelo de lenguaje, especialmente en un dominio especializado sin validacion externa.
- El corpus de entrenamiento es sintetico y de dominio legal, lo que limita su generalizacion a otros dominios y puede no reflejar la complejidad del lenguaje legal real.
- No se dispone de datos sobre longitud de contexto ni idiomas soportados, lo que impide conocer sus limitaciones de entrada.
- Es un checkpoint de investigacion: no se han demostrado capacidades de produccion ni se han publicado benchmarks que avalen su rendimiento.
- La licencia Apache-2.0 permite uso comercial, pero la ausencia de evaluaciones implica que el uso en produccion requiere validacion previa por parte del usuario.

## Enlaces

- Modelo principal: https://huggingface.co/violetxi/qwen35-9b-wmrl-v4-n-3m
- Checkpoint relacionado `m0-nop6`: https://huggingface.co/violetxi/qwen35-9b-wmrl-v4-m0-nop6
- Checkpoint relacionado `c1-b5v4`: https://huggingface.co/violetxi/qwen35-9b-wmrl-v4-c1-b5v4
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
