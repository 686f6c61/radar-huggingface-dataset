# SynhalaAI/Tharushi-Gemma4-E2B-GRPO

## Resumen

Tharushi-Gemma4-E2B-GRPO es un modelo de lenguaje publicado por SynhalaAI en Hugging Face, construido como un ajuste fino (fine-tuning) del modelo base `unsloth/gemma-4-E2B-it-unsloth-bnb-4bit`, que a su vez deriva de la familia Gemma 4 de Google en su variante E2B (orientada a eficiencia). El nombre del repositorio indica que el ajuste se ha realizado mediante GRPO (Group Relative Policy Optimization), una técnica de optimización por refuerzo empleada habitualmente para mejorar el razonamiento y el alineamiento de modelos generativos. El modelo está etiquetado para generación de texto y es compatible con Transformers y Text Generation Inference.

La relevancia de este modelo radica en su enfoque bilingüe inglés-singalés (códigos `en` y `si`), una combinación poco frecuente en el ecosistema open source, y en el uso de cuantización de 4 bits en el modelo base (según el sufijo `bnb-4bit`), lo que sugiere un diseño orientado a un despliegue con requisitos de memoria reducidos. No obstante, en el momento de redactar esta ficha el autor declara explícitamente que el modelo **no ha sido publicado oficialmente todavía** ("NOT OFFICIALLY RELEASED YET"), por lo que la información técnica, los datos de entrenamiento y los resultados de evaluación aún no están disponibles.

Dado el estado embrionario del repositorio (0 descargas, 0 likes, creado el 26 de noviembre de 2026), esta ficha debe considerarse provisional y sujeta a cambios cuando el autor publique la documentación definitiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de la familia Gemma 4, variante E2B) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | modelo base en 4 bits (bnb-4bit); otras cuantizaciones no disponibles |
| Idiomas soportados | ingles (en), singales (si) |
| Licencia | no disponible |
| Formato de pesos | no disponible (repositorio etiquetado como transformers) |

## Arquitectura y entrenamiento

El modelo se presenta como un ajuste fino del checkpoint `unsloth/gemma-4-E2B-it-unsloth-bnb-4bit`, es decir, una versión optimizada por Unsloth del modelo instructivo Gemma 4 E2B, cuantizada en 4 bits. La etiqueta `gemma4` confirma la pertenencia a la familia Gemma 4, aunque la model card no detalla la arquitectura interna (número de capas, dimensiones, mecanismo de atención, etc.). El sufijo "E2B" sugiere una variante de eficiencia, pero no se especifica su significado exacto ni el recuento de parámetros.

En cuanto al entrenamiento, el nombre del repositorio indica el uso de GRPO (Group Relative Policy Optimization), un algoritmo de aprendizaje por refuerzo que compara respuestas dentro de un grupo para optimizar la política del modelo sin necesidad de un modelo crítico separado. Sin embargo, no se han publicado datos sobre el número de tokens de entrenamiento, la composición del dataset, la presencia de RLHF/DPO adicional ni las innovaciones técnicas concretas. La model card indica únicamente que los detalles de entrenamiento, los datos y las instrucciones de uso se publicarán "pronto".

## Capacidades

- Generación de texto en inglés y singalés, según los idiomas declarados en las etiquetas del repositorio.
- Ajuste orientado a razonamiento mediante GRPO, aunque no se han publicado evaluaciones que lo confirmen.
- Compatibilidad con Transformers y Text Generation Inference (TGI), según las etiquetas del repositorio.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (no confirmado).
- Capacidades multimodales (visión, audio): no disponible.
- Modo "thinking" o razonamiento extendido: no disponible.
- Capacidades multilingües adicionales: no disponibles (solo en y si declarados).

## Casos de uso

- **Atención al cliente en inglés y singalés**: el modelo podría gestionar conversaciones multi-turno en ambos idiomas, aunque la ausencia de datos sobre la longitud de contexto impide confirmar su idoneidad para diálogos largos.
- **Traducción y localización inglés-singalés**: dado su perfil bilingüe, podría emplearse para tareas de traducción o generación de contenido en singalés, un idioma con poca representación en modelos open source.
- **Generación de contenido en singalés**: redacción de textos, resúmenes o respuestas en dicho idioma para aplicaciones locales de Sri Lanka.
- **Prototipado con recursos limitados**: al derivar de un checkpoint en 4 bits, podría desplegarse en entornos con VRAM reducida para pruebas de concepto, aunque no se han publicado requisitos oficiales.
- **Investigación en ajuste por refuerzo**: el uso de GRPO lo convierte en un objeto de estudio para investigadores interesados en técnicas de RL aplicadas a modelos pequeños.
- **Integración en pipelines de TGI**: la compatibilidad declarada con Text Generation Inference permitiría su despliegue en infraestructuras de servicio de modelos, una vez publicada la versión oficial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que los resultados de evaluación se publicarán "pronto".

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el modelo base está cuantizado en 4 bits, lo que sugiere requisitos moderados, pero no se confirman cifras).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; la cuantización de 4 bits del modelo base sugiere que podría caber en GPU de consumo, pero no hay datos oficiales.
- Opciones de despliegue: Transformers y Text Generation Inference (TGI), según las etiquetas del repositorio. No se confirma soporte para llama.cpp, Ollama u otros motores.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (bilingües inglés-singalés o ajustes GRPO sobre Gemma 4 E2B), y el propio modelo no ha sido publicado oficialmente, por lo que no es posible establecer comparaciones rigurosas.

## Limitaciones y advertencias

- **Modelo no publicado oficialmente**: el autor advierte explícitamente que el modelo aún no ha sido lanzado ("NOT OFFICIALLY RELEASED YET"), por lo que su uso en producción no está recomendado.
- **Ausencia de documentación técnica**: no se detallan datos de entrenamiento, arquitectura, evaluación ni licencia, lo que impide evaluar su calidad y adecuación.
- **Licencia no disponible**: se desconoce si permite uso comercial; debe verificarse antes de cualquier despliegue.
- **Riesgo de alucinación**: no evaluado; al ser un ajuste fino de un modelo pequeño, es probable que presente limitaciones de fiabilidad, aunque no hay datos que lo confirmen.
- **Cobertura lingüística limitada**: solo se declaran inglés y singalés; no se confirma soporte para castellano ni otros idiomas.
- **Sesgos**: no documentados; los modelos Gemma pueden heredar sesgos de sus datos de entrenamiento, pero no se han publicado análisis específicos.
- **Contexto y cuantización**: la cuantización en 4 bits del modelo base puede degradar ligeramente la calidad respecto a la versión en precisión completa; no se han publicado comparativas.

## Enlaces

- Hugging Face: https://huggingface.co/SynhalaAI/Tharushi-Gemma4-E2B-GRPO
- Perfil del autor: https://huggingface.co/SynhalaAI
- Modelo base: https://huggingface.co/unsloth/gemma-4-E2B-it-unsloth-bnb-4bit
