# yuhengtu-bytedance/sfm_unfiltered_e2e_misalignment-1k_2k_3k_4k_5k_weightedavg_merge

## Resumen

Este modelo es un experimento de fusión de pesos (weight merging) creado con [mergekit](https://github.com/cg123/mergekit) a partir de cinco checkpoints intermedios de un mismo entrenamiento denominado `unfiltered_e2e_misalignment`. El autor, `yuhengtu-bytedance`, ha combinado los pasos de entrenamiento 1000, 2000, 3000, 4000 y 5000 mediante el método Linear (promedio ponderado), tomando como base el checkpoint del paso 5000. El resultado es un modelo de lenguaje de 6.856.253.440 parámetros (aproximadamente 6,8 mil millones), con arquitectura GPT-NeoX (según la etiqueta `gpt_neox`), y pesos en formato `safetensors` con precisión `bfloat16`.

La relevancia de este modelo es principalmente metodológica: sirve para estudiar cómo el promediado de checkpoints a lo largo del entrenamiento afecta a propiedades como la alineación o la desalineación del modelo. No se ha publicado ninguna documentación adicional sobre el entrenamiento original, los datos utilizados, la licencia o las capacidades concretas. Se trata de un artefacto de investigación sin una model card descriptiva, por lo que su uso en producción no está recomendado sin una evaluación previa exhaustiva.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-NeoX (etiqueta `gpt_neox`) |
| Parametros totales | 6.856.253.440 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo `bfloat16` en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo se ha construido mediante el método Linear (promedio ponderado) definido en el artículo [Model Soups](https://arxiv.org/abs/2203.05482). Se han fusionado cinco checkpoints del mismo modelo base, correspondientes a los pasos globales 1000, 2000, 3000, 4000 y 5000 de un entrenamiento etiquetado como `unfiltered_e2e_misalignment`. Los pesos asignados a cada checkpoint son 1, 2, 3, 4 y 5 respectivamente, con normalización activada (`normalize: true`). La fusión se realizó en precisión `float32` y el resultado se guardó en `bfloat16`.

No se dispone de información sobre la arquitectura interna del modelo base (número de capas, cabezas de atención, etc.), ni sobre el conjunto de datos de entrenamiento, el número total de tokens, o si se aplicaron técnicas como RLHF o DPO. El nombre `unfiltered_e2e_misalignment` sugiere que el entrenamiento original podría estar relacionado con el estudio de la desalineación del modelo, pero no hay detalles públicos al respecto.

## Capacidades

No se ha publicado ninguna descripción de capacidades para este modelo. Al ser un modelo de lenguaje de 6,8B parámetros con arquitectura GPT-NeoX, es razonable esperar que pueda realizar tareas básicas de generación de texto, pero no hay evidencia documentada de:

- Generación de código o razonamiento matemático
- Soporte de tool calling o function calling
- Capacidades de agente o razonamiento multi-paso
- Soporte multilingüe
- Modos especiales (thinking, visión, audio, etc.)

Cualquier afirmación sobre sus capacidades sería especulativa y no debe tomarse como referencia.

## Casos de uso

Dado que no existe documentación sobre el comportamiento del modelo, no se pueden proponer casos de uso concretos y verificables. Las únicas aplicaciones plausibles son:

- Investigación sobre fusión de checkpoints: el modelo sirve como artefacto para estudiar el efecto del promediado ponderado de pesos en el rendimiento y la alineación de un modelo de lenguaje.
- Reproducción de experimentos de model merging: puede utilizarse como referencia para comparar con otros merges del mismo entrenamiento (por ejemplo, los publicados por el mismo autor con diferentes combinaciones de pasos).
- Análisis de la evolución del entrenamiento: al fusionar checkpoints de distintos pasos, se puede analizar cómo la interpolación de pesos afecta a métricas de comportamiento.

No se recomienda su uso en aplicaciones de producción sin una evaluación exhaustiva previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos sobre MMLU, HumanEval, GSM8K u otras pruebas estándar para este modelo.

## Requisitos de hardware

No se han publicado requisitos específicos de hardware. A partir del tamaño del repositorio (13,7 GB) y la precisión `bfloat16`, se puede estimar:

- VRAM necesaria para inferencia en `bfloat16`: aproximadamente 13,7 GB (solo pesos) más overhead de activaciones y memoria del runtime, por lo que se recomienda al menos 16 GB de VRAM.
- GPUs compatibles: una RTX 4090 (24 GB) o una A100 (40 GB) pueden ejecutar el modelo sin cuantización. GPUs con 16 GB (como RTX 4080 o A10G) podrían funcionar con optimizaciones de memoria, pero no está garantizado.
- No se han publicado archivos GGUF ni cuantizaciones, por lo que no es posible ejecutarlo en CPU con llama.cpp sin convertir los pesos previamente.
- Opciones de despliegue: al ser un modelo estándar de transformers, puede servirse con vLLM, Text Generation Inference (TGI) u Ollama (tras conversión a GGUF). No hay datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables. El autor ha publicado otros merges similares (por ejemplo, `sfm_unfiltered_e2e_alignment-4k_5k_6k_merge` o `sfm_unfiltered_e2e_misalignment-2k_3k_4k_merge`), pero no hay datos de rendimiento que permitan una comparación objetiva. Tampoco se conocen modelos de la misma categoría (merges de checkpoints de 6,8B) con los que contrastar.

## Limitaciones y advertencias

- No se ha publicado ninguna información sobre sesgos, alucinaciones o comportamientos indeseados. Al ser un modelo sin documentación, existe un riesgo elevado de que produzca contenido incorrecto o perjudicial.
- La licencia es desconocida, por lo que no se puede garantizar su uso comercial ni su redistribución.
- El modelo es un artefacto experimental: su nombre sugiere que fue entrenado para estudiar la desalineación, lo que podría implicar comportamientos intencionalmente no alineados con instrucciones humanas.
- No se ha verificado la calidad del merge: aunque el método Linear es estándar, la ausencia de benchmarks impide conocer si el modelo resultante es funcional o si ha degradado significativamente respecto a los checkpoints originales.
- No se recomienda su uso en entornos de producción, educación o investigación sin una evaluación rigurosa previa.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/yuhengtu-bytedance/sfm_unfiltered_e2e_misalignment-1k_2k_3k_4k_5k_weightedavg_merge)
- [Paper de Model Soups (arXiv:2203.05482)](https://arxiv.org/abs/2203.05482)
- [Repositorio de mergekit](https://github.com/cg123/mergekit)
