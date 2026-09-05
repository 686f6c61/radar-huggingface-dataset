# violetxi/qwen35-9b-wmrl-v4-raw-30m

## Resumen

`violetxi/qwen35-9b-wmrl-v4-raw-30m` es un checkpoint de investigación creado por el autor `violetxi` a partir de un *full fine-tune* de `Qwen/Qwen3.5-9B`. El propósito del entrenamiento es estudiar la internalización de modelos del mundo (*world-model internalization*), en concreto sobre un corpus sintético de despachos de abogados creado por Calderwood & Harkness. El checkpoint pertenece a la línea v4 de este estudio, en la que un modelo de 9B actúa como estudiante sobre un pool inicial de aproximadamente 50.000 semillas de razonamiento (`think-on`).

El modelo se ha re-injertado en el layout compuesto del hub de Qwen3.5 (`Qwen3_5ForConditionalGeneration`) y, según la model card, es servible con vLLM sin configuración adicional. El tamaño total de los pesos es de 9.653.104.368 parámetros, con un peso del repositorio de 19,6 GB. La licencia es Apache-2.0. En la información disponible no se detallan la longitud de contexto, los idiomas soportados ni benchmarks, por lo que conviene interpretar este checkpoint como una pieza experimental dentro de un programa de investigación más amplio que como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en Qwen/Qwen3.5-9B) |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un *full fine-tune* de `Qwen/Qwen3.5-9B`, de modo que la arquitectura subyacente es la del modelo base: un transformer decoder-only de unos 9.650 millones de parámetros. No se proporcionan detalles sobre el número de capas, cabezas de atención o mecanismos internos. A diferencia de una arquitectura MoE, no hay indicios de parámetros activos separados, por lo que se trata en principio de un modelo denso.

El entrenamiento se realizó sobre el corpus sintético de la firma legal Calderwood & Harkness, dentro de la línea v4 de un estudio de *world-model internalization*. Se indica que el modelo es un "9B student" y que se utilizó un pool inicial de ~50.000 pensamientos (`think-on seed pool`). El checkpoint se guardó como estado final para la condición `raw-30m`. No se menciona el número total de tokens de entrenamiento, ni la composición exacta del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. La model card señala que el checkpoint se injertó de nuevo en el layout composite del hub (`Qwen3_5ForConditionalGeneration`) y que es servible con vLLM directamente.

## Capacidades

- Fine-tuning en un dominio legal sintético, orientado a estudiar cómo el modelo internaliza las reglas y el conocimiento de un mundo artificial.
- Re-injertado en el layout `Qwen3_5ForConditionalGeneration`, que permite carga directa con vLLM.
- No hay datos confirmados sobre soporte de *tool calling*, *function calling*, agentes, visión, audio o modo *thinking*.
- Las capacidades multilingües no se documentan en este checkpoint; lo que se espera es que sean las que el modelo base `Qwen/Qwen3.5-9B` ya tenía, sin confirmación explícita.
- No se ha publicado ninguna evaluación de alucinaciones, sesgos o seguridad.

## Casos de uso

Dado que se trata de un checkpoint de investigación sin validación externa, estos son los usos más realistas:

- Investigación en internalización de modelos de mundo: el modelo se emplea en laboratorios para analizar cómo un LLM de 9B representa un entorno simulado (el despacho legal ficticio) y en qué medida ese conocimiento afecta al razonamiento.
- Estudio de alucinación en dominios sintéticos: al estar entrenado sobre un corpus cerrado y artificial, permite probar si el modelo inventa información fuera de las reglas del mundo simulado.
- Ablación de estrategias de fine-tuning: este checkpoint forma parte de la serie v4, que incluye variantes como `r0-30m` o `c4-action`, por lo que sirve para comparar el efecto de diferentes condiciones de entrenamiento sobre el mismo modelo base.
- Pruebas de infraestructura de inferencia: la model card indica que el checkpoint es servible con vLLM *out of the box*, por lo que es útil para validar pipelines de despliegue con modelos de ~9.650 millones de parámetros.
- Generación de documentos legales ficticios con fines de prueba: el corpus es de un bufete sintético, de modo que el modelo puede producir texto en ese dominio para prototipos donde el contenido no debe usarse como asesoramiento real.
- Documentación de publicación de modelos en el hub: el proceso de subida se rigió por una política interna (`PLAN4.md F-D`), lo que convierte al checkpoint en un ejemplo de buenas prácticas de publicación de pesos y metadatos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos de MMLU, HumanEval, GSM8K, ni ningún otro indicador de rendimiento para este checkpoint.

## Requisitos de hardware

- El modelo tiene 9.653.104.368 parámetros; en precisión FP16 o BF16 los pesos ocupan aproximadamente 19,3 GB de VRAM, más el overhead de KV-cache y activaciones.
- GPU recomendadas para FP16/BF16: A100 de 40 GB, H100 de 80 GB. En una RTX 4090 (24 GB) es posible la inferencia si se aplican técnicas de gestión de memoria, pero vaya justa.
- No hay pesos cuantizados publicados. Para ejecutarlo en GPUs de menor capacidad se necesitaría una cuantización post-entrenamiento (por ejemplo, 4 bits con bitsandbytes o GPTQ).
- Opciones de despliegue: vLLM (según la model card), llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `violetxi/qwen35-9b-wmrl-v4-raw-30m` | 9.653.104.368 | no disponible | Apache-2.0 | Hugging Face |
| `Qwen/Qwen3.5-9B` (modelo base) | ~9.65B | no disponible | Apache-2.0 | Hugging Face |
| `violetxi/qwen35-9b-wmrl-v4-r0-30m` | no disponible | no disponible | Apache-2.0 | Hugging Face |
| `violetxi/qwen35-9b-wmrl-v4-c4-action` | no disponible | no disponible | Apache-2.0 | Hugging Face |

No se dispone de datos suficientes para comparar rendimiento entre estas variantes. El checkpoint comparte parámetros y licencia con el modelo base, pero al ser un *full fine-tune* en un corpus sintético, su comportamiento en tareas generales puede estar alterado.

## Limitaciones y advertencias

- Es un checkpoint de investigación; no está validado para uso en producción ni para tareas de asesoramiento legal real.
- No se han publicado evaluaciones de sesgos, alucinaciones ni seguridad.
- La información disponible no incluye la longitud de contexto, los idiomas soportados ni el comportamiento en tareas específicas.
- El corpus de entrenamiento es sintético y limita el conocimiento del mundo real al que ya poseía el modelo base.
- La licencia Apache-2.0 permite uso comercial, pero la ausencia de documentación técnica y de evaluaciones hace desaconsejable su uso en entornos críticos.
- El checkpoint se ofrece sin cuantizaciones ni optimizaciones de inferencia, por lo que su peso en disco es elevado (19,6 GB) y requiere infraestructura acorde a un modelo de 9B.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/violetxi/qwen35-9b-wmrl-v4-raw-30m
- Checkpoint de la misma serie: https://huggingface.co/violetxi/qwen35-9b-wmrl-v4-r0-30m
- Checkpoint de la misma serie: https://huggingface.co/violetxi/qwen35-9b-wmrl-v4-c4-action
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
