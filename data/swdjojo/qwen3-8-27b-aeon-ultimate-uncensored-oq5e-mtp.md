# swdjojo/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-oQ5e-mtp

## Resumen

El modelo `swdjojo/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-oQ5e-mtp` es una cuantización en 5 bits del modelo base `AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16`, realizada con la herramienta oQ (oMLX) en formato MLX safetensors. Está diseñado para ejecutarse en dispositivos Apple Silicon mediante MLX, y su nombre sugiere que es una variante "sin censura" de un modelo de la familia Qwen3.8 con 27 mil millones de parámetros, aunque el recuento real de parámetros en los safetensors es de aproximadamente 5,7 mil millones, lo que genera una discrepancia notable con la denominación.

El repositorio no incluye una model card detallada más allá de los metadatos de cuantización, por lo que se carece de información sobre arquitectura interna, datos de entrenamiento, capacidades específicas o benchmarks. El pipeline declarado es `image-text-to-text`, lo que sugiere una posible naturaleza multimodal, pero no hay documentación que lo confirme. Se trata de un modelo recién publicado (agosto de 2026) con cero descargas y cero likes, lo que indica que aún no ha sido evaluado por la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (tag: `qwen3_5`) |
| Parametros totales | 5.756.598.512 (según safetensors); el nombre del modelo indica 27B |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 5 bits, group size 64 (oQ / oMLX mixed-precision) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base ni sobre su proceso de entrenamiento. El tag `qwen3_5` podría referirse a una variante de la arquitectura Qwen3.5, pero no hay documentación que lo aclare. La cuantización fue realizada con oQ (oMLX v0.6.0rc1), una herramienta de cuantización mixta para MLX, aplicada al modelo base `AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16`. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens, ni si se aplicaron técnicas como RLHF o DPO. El nombre "UNCENSORED" sugiere que el modelo base fue entrenado con menos restricciones de seguridad, pero esto no está verificado.

## Capacidades

No se han documentado capacidades específicas en la model card. El pipeline `image-text-to-text` sugiere que el modelo podría procesar tanto imágenes como texto, pero no hay ejemplos ni descripciones que lo confirmen. Tampoco se menciona soporte para tool calling, agentes, razonamiento multi-paso, ni capacidades multilingües. Dada la falta de información, no es posible afirmar ninguna capacidad concreta.

## Casos de uso

No se puede recomendar ningún caso de uso concreto debido a la ausencia total de documentación funcional. El modelo podría ser adecuado para tareas de generación de texto o procesamiento multimodal si el modelo base las soporta, pero no hay evidencia que lo respalde. Se recomienda esperar a que el autor publique una model card completa o a que la comunidad realice evaluaciones independientes antes de considerar su uso en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El formato MLX safetensors está optimizado para Apple Silicon (M1, M2, M3, M4 y superiores).
- El tamaño del repositorio es de 20.3 GB, lo que sugiere que se necesitan al menos 20 GB de memoria unificada para cargar el modelo en RAM/VRAM.
- No se indican requisitos mínimos de GPU específicos, pero los chips Apple con 32 GB o más de memoria unificada serían recomendables para una inferencia cómoda.
- Las opciones de despliegue incluyen MLX, que es la librería nativa para Apple Silicon, y posiblemente llama.cpp u otros runners que soporten MLX, aunque no se ha confirmado.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables de la misma categoría (cuantizaciones de Qwen3.8-27B en MLX) con información pública suficiente para establecer una comparación.

## Limitaciones y advertencias

- Falta total de documentación: no hay model card, ni descripción de capacidades, ni detalles de entrenamiento.
- Discrepancia entre el nombre del modelo (27B) y el número de parámetros real en safetensors (~5.7B), lo que genera incertidumbre sobre la verdadera escala del modelo.
- Licencia no especificada: no se puede determinar si el uso comercial está permitido.
- El término "UNCENSORED" implica que el modelo puede generar contenido sin filtros de seguridad, lo que conlleva riesgos de sesgos, alucinaciones y contenido inapropiado.
- Al ser una cuantización reciente sin evaluaciones de la comunidad, no se puede garantizar la calidad de la conversión ni la fidelidad respecto al modelo original.
- El pipeline `image-text-to-text` no está confirmado con ejemplos prácticos; podría tratarse de una etiqueta errónea.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/swdjojo/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-oQ5e-mtp)
- [Modelo base: AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16](https://huggingface.co/AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16) (enlace inferido, no verificado)
- [Repositorio de oQ (oMLX)](https://github.com/jundot/omlx)
