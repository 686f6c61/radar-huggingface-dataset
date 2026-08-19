# vipuliitm/tds-ga8-green-ai-audit

## Resumen

Este repositorio, publicado por el usuario `vipuliitm` en Hugging Face, no contiene un modelo de inteligencia artificial, sino los metadatos de contabilidad de carbono asociados a una ejecución de entrenamiento correspondiente a la tarea "TDS GA8" (Graded Assignment de la semana 8 de un curso de Tools in Data Science, probablemente del IIT Madras). La model card documenta un consumo energético estimado de 157,248 kWh y unas emisiones de 31,450 kg de CO₂ equivalente, calculadas con CodeCarbon durante un fine-tuning ejecutado en una GPU NVIDIA V100 en la región europe-west4.

Se trata, por tanto, de un artefacto de auditoría ambiental, no de un modelo desplegable. Su relevancia radica en ejemplificar buenas prácticas de transparencia en el reporte del impacto climático del entrenamiento de modelos, un aspecto cada vez más demandado en el ámbito del Green AI. No hay ningún peso, arquitectura ni pipeline asociado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (no hay pesos) |

## Arquitectura y entrenamiento

No existe arquitectura de modelo. El repositorio únicamente almacena metadatos de una ejecución de entrenamiento (fine-tuning) realizada con hardware NVIDIA V100 en la región europe-west4 de Google Cloud. Según la model card, se utilizó CodeCarbon para estimar un consumo de 157,248 kWh y unas emisiones de 31,450 kg de CO₂ equivalente. No se especifica el tipo de modelo fine-tuneado, el dataset, ni el procedimiento de entrenamiento (RLHF, DPO, etc.).

## Capacidades

- No aplica: este repositorio no contiene un modelo con capacidades de generación, razonamiento, código, visión u otras.
- Únicamente proporciona un registro de emisiones de carbono y consumo energético de un entrenamiento.
- Puede servir como plantilla o ejemplo de model card orientada a la contabilidad de carbono.

## Casos de uso

- Auditoría interna de sostenibilidad: una organización puede utilizar este tipo de registro para documentar el impacto ambiental de sus ejecuciones de entrenamiento, cumpliendo con políticas de Green AI o requisitos de reporte ESG.
- Educación y formación: en cursos de ciencia de datos, sirve como ejemplo práctico de cómo reportar emisiones de CO₂ de un entrenamiento, tal como se pide en la tarea TDS GA8.
- Comparativa de eficiencia energética: aunque no hay datos suficientes para comparar, el formato de la model card puede inspirar a otros equipos a publicar sus propias métricas de consumo.
- Trazabilidad de experimentos: el repositorio actúa como un registro persistente y versionado de una ejecución concreta, útil para reproducibilidad y auditorías externas.
- Cumplimiento normativo: en contextos donde se exija transparencia sobre el impacto climático de la IA, este tipo de artefactos puede adjuntarse a la documentación de un modelo.
- Investigación en Green AI: los datos de emisiones (31,45 kg CO₂eq) pueden utilizarse como referencia para estudios sobre el coste ambiental de fine-tuning en GPUs V100.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible, ya que no se trata de un modelo de IA con métricas de calidad.

## Requisitos de hardware

- No aplica: el repositorio no contiene un modelo que requiera inferencia.
- El entrenamiento asociado se ejecutó en una NVIDIA V100, según la model card.
- No hay requisitos de VRAM, GPU recomendadas ni opciones de despliegue (vLLM, llama.cpp, etc.) porque no hay pesos que cargar.

## Comparativa con modelos similares

No disponible. No existe una categoría de modelos comparable, dado que este repositorio no es un modelo de IA. Otros repositorios similares (p. ej., `harshit4/tds-ga8-green-ai-audit`) contienen metadatos equivalentes de otros estudiantes, pero no son modelos.

## Limitaciones y advertencias

- No es un modelo de IA: no se puede utilizar para ninguna tarea de generación, clasificación, razonamiento, etc.
- Los datos de emisiones son estimaciones de CodeCarbon, no mediciones directas; pueden variar según el factor de emisión de la red eléctrica.
- La model card no especifica el tipo de modelo fine-tuneado, el dataset, ni la duración exacta del entrenamiento, lo que limita su utilidad para análisis comparativos.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido utilizado ni validado por la comunidad.
- La licencia Apache 2.0 permite uso comercial, pero al no haber código ni pesos, su aplicabilidad práctica es nula.
- No se indica el idioma de los metadatos (la model card está en inglés), aunque no hay contenido lingüístico relevante.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/vipuliitm/tds-ga8-green-ai-audit
- Repositorio similar de otro autor (referencia): https://huggingface.co/harshit4/tds-ga8-green-ai-audit
- Repositorio GitHub de la asignatura TDS GA8 (referencia externa): https://github.com/vikrantm-iitm/tds-ga8
