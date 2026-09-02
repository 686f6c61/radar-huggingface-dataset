# vect0r18/mirror-jmaxcool-cxxii-experts-x1-v3-9302eb7c

## Resumen

Este modelo es un espejo (mirror) publicado por el usuario vect0r18, identificado como `mirror-jmaxcool-cxxii-experts-x1-v3-9302eb7c`. Según la model card, se trata de un "candidato a limpieza" (scrub candidate) derivado del modelo `dendriteholdings/albedo-qwen3.6-35b-king-CXXII`, con un perfil de "solo expertos" (experts-only) y una técnica de "eliminación de huellas" (fingerprint scrub). El tag `qwen3_5_moe` indica que utiliza una arquitectura de mezcla de expertos (MoE) basada en la familia Qwen3.5, pero no se proporcionan detalles adicionales sobre parámetros, contexto o capacidades.

La publicación es reciente (septiembre de 2026) y no cuenta con descargas ni interacciones. La información disponible es mínima: solo se incluyen los metadatos técnicos (formato safetensors, tag regional `region:us`) y una descripción muy breve. No se ha publicado una ficha técnica completa, benchmarks, ni documentación de uso. Por tanto, esta ficha se basa exclusivamente en los datos proporcionados y marca como "no disponible" cualquier aspecto no documentado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) basada en Qwen3.5 (según tag `qwen3_5_moe`), sin más detalles |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos están en formato safetensors, sin cuantización especificada) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card indica que el modelo es un "candidato a limpieza" (scrub candidate) con perfil "experts-only fingerprint scrub". Esto sugiere que se ha partido de un modelo base (`albedo-qwen3.6-35b-king-CXXII`) y se ha aplicado un proceso de selección de subconjuntos de expertos (típico en arquitecturas MoE) junto con una técnica de eliminación de huellas o marcas de agua. El parámetro `delta-scale 1` y la semilla `seed 9999` son los únicos detalles técnicos del proceso. No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se documenta ninguna innovación técnica adicional.

## Capacidades

No se dispone de información concreta sobre las capacidades del modelo. Dado que se basa en una arquitectura Qwen3.5 MoE, es plausible que herede capacidades generales de generación de texto, razonamiento y posiblemente código, pero no hay confirmación oficial. No se documenta soporte para tool calling, agentes, visión, audio ni modos de pensamiento extendido. La ausencia de datos impide realizar afirmaciones verificables.

## Casos de uso

No se han documentado casos de uso específicos para este modelo. Al ser un "mirror" y un "candidato a limpieza", podría destinarse a investigación sobre eliminación de huellas en modelos MoE, pero no hay información que lo confirme. Se recomienda consultar el modelo fuente (`dendriteholdings/albedo-qwen3.6-35b-king-CXXII`) para conocer posibles aplicaciones, aunque los datos de este espejo no permiten sugerir usos prácticos fiables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

No se dispone de información sobre requisitos de hardware. Al ser un modelo MoE basado en Qwen3.5, es probable que requiera una GPU con al menos 24 GB de VRAM para inferencia en precisión completa, pero esto es una suposición no verificada. No se indican opciones de despliegue (vLLM, llama.cpp, etc.) ni métricas de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos. El modelo fuente (`dendriteholdings/albedo-qwen3.6-35b-king-CXXII`) podría ser comparable a otros modelos MoE de la familia Qwen, pero no hay datos públicos en esta ficha para realizar una comparación rigurosa.

## Limitaciones y advertencias

- No se ha publicado ninguna documentación técnica, lo que impide conocer sesgos, riesgos de alucinación o limitaciones de contexto.
- La licencia es desconocida; no se puede confirmar si el modelo es de uso libre, comercial o restringido.
- El modelo está etiquetado como "mirror" y "scrub candidate", lo que sugiere que podría ser una versión experimental o intermedia, no apta para producción sin una evaluación exhaustiva.
- No se ha verificado la procedencia ni la integridad de los pesos; se recomienda auditar el modelo antes de cualquier uso.
- Al no existir benchmarks ni pruebas de rendimiento, no se puede garantizar su calidad ni su comportamiento en tareas específicas.

## Enlaces

- [Página del modelo en Hugging Face](https://huggingface.co/vect0r18/mirror-jmaxcool-cxxii-experts-x1-v3-9302eb7c)
- [Modelo fuente (referenciado en la model card): dendriteholdings/albedo-qwen3.6-35b-king-CXXII](https://huggingface.co/dendriteholdings/albedo-qwen3.6-35b-king-CXXII) (enlace no verificado; no se ha encontrado en la búsqueda web)
