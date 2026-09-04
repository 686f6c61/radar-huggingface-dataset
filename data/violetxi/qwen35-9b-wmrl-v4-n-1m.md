# violetxi/qwen35-9b-wmrl-v4-n-1m

## Resumen

violetxi/qwen35-9b-wmrl-v4-n-1m es un checkpoint experimental de investigación, resultado de un fine-tune completo sobre el modelo base Qwen/Qwen3.5-9B. Ha sido desarrollado por el usuario violetxi como parte de un estudio de "world-internalization" (internalización del mundo), concretamente la línea v4, que utiliza un corpus sintético jurídico denominado Calderwood & Harkness law-firm corpus. El objetivo del estudio es explorar cómo un modelo de 9 mil millones de parámetros internaliza representaciones del mundo a partir de datos sintéticos de un dominio específico.

El modelo se presenta como un checkpoint de la condición "n-1m" dentro de la serie v4, con un pool semilla de aproximadamente 50k muestras ("think-on seed pool"). Tras el entrenamiento, los pesos se han integrado ("grafted") en la estructura compuesta del hub, dando como resultado un modelo servible con vLLM sin configuración adicional. Contiene 9.653.104.368 parámetros en formato safetensors, con licencia Apache 2.0.

Se trata de un modelo de carácter experimental, sin descargas ni valoraciones en HuggingFace, y sin benchmarks publicados. Su relevancia radica en ser una pieza de un estudio de investigación sobre representaciones internas, más que en su uso directo como modelo de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base: Qwen/Qwen3.5-9B) |
| Parametros totales | 9.653.104.368 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors sin cuantizar) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un full-finetune del modelo base Qwen/Qwen3.5-9B. Los datos de entrenamiento provienen del corpus sintético "Calderwood & Harkness law-firm corpus", utilizado en un estudio de "world-internalization" (v4). La model card menciona un pool semilla de aproximadamente 50k muestras ("think-on seed pool") y una condición de guardado denominada "n-1m". No se especifican el número total de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron técnicas de RLHF o DPO.

Una innovación técnica destacable es el proceso de "grafting": los pesos entrenados se injertan sobre la estructura composite del hub, reemplazando 427 elementos, según se indica en el campo "replaced". El resultado es un checkpoint con la arquitectura Qwen3_5ForConditionalGeneration, servible con vLLM de forma directa.

## Capacidades

No se han documentado capacidades específicas en la información disponible. El modelo hereda las capacidades del modelo base Qwen/Qwen3.5-9B, pero no se proporcionan detalles sobre generación de texto, razonamiento, código, matemáticas, visión, tool calling, soporte de agentes ni capacidades multilingües. Tampoco se indica si dispone de modo de pensamiento, audio u otras funcionalidades especiales.

## Casos de uso

No se han documentado casos de uso concretos en la información disponible. Al tratarse de un checkpoint experimental de investigación sobre un corpus sintético jurídico, podría ser de interés para estudios académicos sobre representaciones internas en modelos de lenguaje, pero no existe ninguna validación que respalde su uso en aplicaciones reales. Cualquier aplicación práctica requeriría una evaluación previa del modelo en el dominio objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 9.653.104.368 parámetros en BF16/FP16 requieren aproximadamente 19,3 GB de VRAM, en línea con el tamaño del repositorio. No se han publicado cuantizaciones, por lo que no se dispone de estimaciones para precisiones reducidas.
- GPU recomendadas: para FP16/BF16 completo se necesitan GPUs con al menos 20 GB de VRAM, como A100 40GB o H100. Una RTX 4090 (24 GB) es insuficiente para FP16 completo, aunque podría utilizarse con cuantizaciones si estuvieran disponibles.
- Opciones de despliegue: vLLM, según indica la model card. El formato safetensors permite su uso con otras herramientas compatibles, pero no se especifican.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Los siguientes checkpoints pertenecen a la misma serie de experimentos, comparten modelo base, arquitectura y licencia, y solo difieren en la condición de entrenamiento. No se dispone de datos de rendimiento para ninguno de ellos.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| violetxi/qwen35-9b-wmrl-v4-n-1m | 9.653.104.368 | No disponible | No disponible | Apache 2.0 | HuggingFace |
| violetxi/qwen35-9b-wmrl-v4-m0-nop6 | No disponible | No disponible | No disponible | Apache 2.0 | HuggingFace |
| violetxi/qwen35-9b-wmrl-v4-c1-b5v4 | No disponible | No disponible | No disponible | Apache 2.0 | HuggingFace |

## Limitaciones y advertencias

- Modelo experimental con 0 descargas y 0 likes, sin validación por parte de la comunidad.
- Entrenado exclusivamente sobre un corpus sintético jurídico, lo que puede limitar su generalización a otros dominios.
- No se han publicado evaluaciones de sesgos, alucinaciones ni seguridad.
- No se especifica la longitud de contexto ni los idiomas soportados, lo que impide conocer sus límites de uso.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no está optimizado para producción y carece de documentación de soporte.
- El proceso de "grafting" con reemplazo de 427 elementos podría introducir inconsistencias en la arquitectura, aunque se indica que es servible con vLLM.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/violetxi/qwen35-9b-wmrl-v4-n-1m
- Checkpoint de la misma serie, condición m0-nop6: https://huggingface.co/violetxi/qwen35-9b-wmrl-v4-m0-nop6
- Checkpoint de la misma serie, condición c1-b5v4: https://huggingface.co/violetxi/qwen35-9b-wmrl-v4-c1-b5v4
