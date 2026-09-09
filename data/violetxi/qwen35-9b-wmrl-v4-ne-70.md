# violetxi/qwen35-9b-wmrl-v4-NE-70

## Resumen

El modelo `violetxi/qwen35-9b-wmrl-v4-NE-70` es un checkpoint experimental de la línea «world-internalization v4», desarrollado por el usuario `violetxi`. Se trata de un full-finetune del modelo base `Qwen/Qwen3.5-9B` sobre un corpus sintético de despachos jurídicos, el «Calderwood & Harkness synthetic law-firm corpus». La finalidad del proyecto es estudiar cómo los modelos de lenguaje internalizan representaciones del mundo a partir de datos sintéticos, lo que lo sitúa como una pieza de investigación más que como un modelo lista para producción.

Con 9.653.104.368 parámetros, el modelo presenta una arquitectura `Qwen3_5ForConditionalGeneration` que ha sido «injertada» en el layout compuesto del hub de Hugging Face, lo que permite servirlo con vLLM sin modificaciones. La licencia es Apache 2.0, pero la información disponible sobre el contexto, las capacidades y el rendimiento es muy limitada: no se han publicado benchmarks ni documentación de uso.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForConditionalGeneration` (basada en `Qwen/Qwen3.5-9B`) |
| Parametros totales | 9.653.104.368 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un full-finetune de `Qwen/Qwen3.5-9B`, es decir, se realizó un ajuste completo de los pesos del modelo base. Según la model card, el entrenamiento se llevó a cabo sobre el corpus sintético de despachos jurídicos de Calderwood & Harkness, dentro de un estudio de «world-internalization» (internalización del mundo) en su línea v4. El conjunto de datos se describe como un «think-on seed pool» de aproximadamente 50.000 ejemplos, aunque no se proporciona acceso al resumen de entrenamiento ni información adicional.

Tras el entrenamiento, los pesos fueron «injertados» de nuevo en el layout compuesto del hub, reemplazando 427 elementos del modelo original. La arquitectura resultante es `Qwen3_5ForConditionalGeneration`, y la model card indica que es servible con vLLM de forma directa.

## Capacidades

- Generación de texto: no disponible.
- Razonamiento y matemáticas: no disponible.
- Código: no disponible.
- Visión: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponible.

No se dispone de información verificada sobre las capacidades específicas del modelo. Al ser un finetuning de `Qwen3.5-9B`, podría conservar algunas capacidades generales del modelo base, pero esto no está confirmado en la fuente.

## Casos de uso

No se dispone de información sobre casos de uso específicos y verificados en la información proporcionada. El checkpoint está etiquetado como un estudio de investigación y no incluye documentación de uso práctico. Por tanto, no es posible enumerar casos de uso reales. Cualquier aplicación debería evaluarse previamente antes de su uso, y no se recomienda su empleo en producción sin validación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: vLLM (mencionado en la model card como servible de forma directa).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados. Los checkpoints hermanos de la misma línea v4 `violetxi/qwen35-9b-wmrl-v4-NEA` y `violetxi/qwen35-9b-wmrl-v4-r0-30m` comparten la misma base y metodología, pero no se han publicado benchmarks ni especificaciones de rendimiento. Otras alternativas basadas en `Qwen3.5-9B` no están documentadas en la fuente.

## Limitaciones y advertencias

- Modelo experimental con 0 descargas y 0 likes, sin validación comunitaria.
- El entrenamiento se realizó con un corpus sintético legal (Calderwood & Harkness), lo que podría introducir sesgos específicos del dominio jurídico.
- No se ha publicado información sobre sesgos, toxicidad, alucinación ni riesgos de seguridad.
- La licencia Apache 2.0 permite uso comercial, pero al tratarse de un checkpoint de investigación no existen garantías de soporte ni de funcionamiento robusto.
- El proceso de «graft» (reemplazo de 427 elementos) es una técnica experimental que podría afectar el comportamiento del modelo de forma impredecible.
- Los datos de entrenamiento no están disponibles públicamente; solo se hace referencia a un archivo `train_summary.json` no accesible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/violetxi/qwen35-9b-wmrl-v4-NE-70
- Checkpoint hermano `violetxi/qwen35-9b-wmrl-v4-NEA`: https://huggingface.co/violetxi/qwen35-9b-wmrl-v4-NEA
- Checkpoint hermano `violetxi/qwen35-9b-wmrl-v4-r0-30m`: https://huggingface.co/violetxi/qwen35-9b-wmrl-v4-r0-30m
- Modelo base `Qwen/Qwen3.5-9B`: https://huggingface.co/Qwen/Qwen3.5-9B
