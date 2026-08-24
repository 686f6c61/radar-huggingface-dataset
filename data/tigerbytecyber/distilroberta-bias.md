# TigerByteCyber/distilroberta-bias

## Resumen

DistilROBERTA fine-tuned for bias detection es un modelo de clasificación de texto basado en los pesos preentrenados de distilroberta-base, con una cabeza de clasificación ajustada para clasificar texto en dos categorías: neutral y sesgado. Desarrollado por TigerByteCyber, el modelo aborda el problema de la detección de sesgo en texto, con un enfoque particular en revisiones de artículos de Wikipedia en inglés.

El modelo se entrenó sobre el dataset wikirev-bias, extraído de revisiones de Wikipedia en inglés y basado en el corpus WNC (Wiki Neutrality Corpus) del proyecto neutralizing-bias de Reid Pryzant. Con 82 millones de parámetros y una ventana de contexto de 512 tokens, es un modelo ligero y rápido, aproximadamente el doble de veloz que RoBERTa-base, lo que lo hace adecuado para tareas de moderación y control de calidad editorial a escala.

Su relevancia actual radica en la creciente necesidad de herramientas de detección de sesgo en contenido generado por humanos y por IA, especialmente en plataformas editoriales, foros y procesos de revisión colaborativa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilRoBERTa (transformer encoder destilado) con cabeza de clasificación binaria |
| Parametros totales | 82M (heredados de distilroberta-base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés |
| Licencia | other (términos no especificados en la model card) |
| Formato de pesos | PyTorch (formato de archivo no especificado) |

## Arquitectura y entrenamiento

El modelo se basa en distilroberta-base, una versión destilada de RoBERTa-base con 6 capas, 768 dimensiones ocultas y 12 cabezas de atención, que totalizan 82 millones de parámetros. La destilación permite que el modelo sea aproximadamente el doble de rápido que RoBERTa-base manteniendo un rendimiento cercano. Sobre esta base se añadió una cabeza de clasificación que produce una salida binaria (neutral o sesgado).

El ajuste fino se realizó sobre el dataset wikirev-bias, extraído de revisiones de artículos de Wikipedia en inglés. Este dataset deriva del corpus WNC (Wiki Neutrality Corpus) del proyecto neutralizing-bias de Reid Pryzant, que recopila ediciones reales de Wikipedia donde se neutralizó el lenguaje sesgado. No se especifica en la información disponible si se emplearon técnicas de RLHF, DPO u otras estrategias de alineación adicionales.

## Capacidades

- Clasificación binaria de texto: distingue entre contenido neutral y contenido sesgado.
- Detección de sesgo en texto en inglés, con especialización en lenguaje editorial y enciclopédico.
- Procesamiento de secuencias de hasta 512 tokens, adecuado para párrafos y artículos de extensión media.
- Inferencia rápida gracias a la arquitectura destilada (aproximadamente 2x más rápida que RoBERTa-base).
- No soporta generación de texto, tool calling, agentes ni capacidades multimodales; es exclusivamente un clasificador.

## Casos de uso

- Moderación de contenido editorial: el modelo puede integrarse en flujos de revisión de artículos para detectar lenguaje sesgado antes de su publicación, aprovechando su especialización en texto enciclopédico.
- Control de calidad en Wikipedia: puede utilizarse para auditar revisiones recientes de artículos y señalar ediciones que introduzcan sesgo, dado que se entrenó específicamente con datos de revisiones de Wikipedia.
- Auditoría de contenido generado por IA: permite verificar si textos producidos por modelos generativos contienen sesgo, integrándose como capa de validación en pipelines de generación.
- Análisis de sesgo en medios de comunicación: útil para monitorizar la neutralidad de artículos periodísticos en inglés, aunque su entrenamiento se centra en texto enciclopédico.
- Revisión de documentación corporativa: puede aplicarse a informes, comunicados y políticas internas para detectar lenguaje tendencioso.
- Investigación académica en NLP: sirve como herramienta de anotación automática para construir datasets etiquetados de sesgo o para estudios sobre neutralidad en corpus textuales.
- Monitorización de foros y comunidades online: permite clasificar publicaciones de usuarios como neutrales o sesgadas para moderación asistida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 330 MB en fp32 y 165 MB en fp16 para los pesos del modelo (82M parámetros), más overhead de activaciones y cabecera de clasificación.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; modelos como NVIDIA GTX 1650, RTX 3060 o superiores funcionan sin problema.
- Compatible con GPU de consumo: sí, cabe holgadamente en cualquier GPU consumer actual.
- También puede ejecutarse en CPU sin problemas para inferencia por lotes pequeños.
- Opciones de despliegue: Hugging Face Transformers, ONNX Runtime, TorchServe, o exportación a formatos optimizados.
- Latencia: no disponible en la información proporcionada, aunque por el tamaño del modelo se espera una latencia de milisegundos en GPU moderna.

Nota: el tamaño del repositorio es de 1.0 GB, significativamente mayor de lo esperado para un modelo de 82M parámetros (que ocuparía ~330 MB en fp32). Esto sugiere que el repositorio puede contener archivos adicionales como checkpoints de entrenamiento, estados de optimizador u otros artefactos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia |
|---|---|---|---|---|
| TigerByteCyber/distilroberta-bias | 82M | 512 | Clasificación binaria de sesgo | other (no especificada) |
| distilroberta-base | 82M | 512 | Modelo base de lenguaje | Apache-2.0 |
| RoBERTa-base | 125M | 512 | Modelo base de lenguaje | MIT |

El modelo se diferencia de sus bases (distilroberta-base y RoBERTa-base) en que incorpora una cabeza de clasificación específica para detección de sesgo, por lo que no requiere ajuste adicional para esta tarea. No se dispone de información sobre otros modelos de detección de sesgo comparables en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo soporta inglés; no es aplicable a otros idiomas sin reentrenamiento.
- La ventana de contexto está limitada a 512 tokens, por lo que textos más largos deben truncarse o dividirse, lo que puede afectar a la precisión en documentos extensos.
- La licencia "other" no especifica los términos exactos de uso; se recomienda contactar al autor antes de un despliegue comercial.
- El modelo se entrenó específicamente con revisiones de Wikipedia en inglés, por lo que su rendimiento puede degradarse en otros dominios textuales (legales, médicos, técnicos).
- No se han publicado métricas de rendimiento, precisión o recall, por lo que no es posible evaluar su fiabilidad cuantitativamente.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que el modelo no ha sido validado por la comunidad.
- Existe una versión publicada por valurank (valurank/distilroberta-bias) con la misma descripción, lo que puede generar confusión sobre la procedencia y autoría del modelo.
- Riesgo de alucinación: no aplica directamente, al ser un clasificador y no un modelo generativo, pero la clasificación errónea de textos como neutrales o sesgados puede tener consecuencias en flujos de moderación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TigerByteCyber/distilroberta-bias
- Modelo base distilroberta-base: https://huggingface.co/distilroberta-base
- Dataset wikirev-bias: https://huggingface.co/datasets/valurank/wikirev-bias
- Repositorio del corpus WNC: https://github.com/rpryzant/neutralizing-bias
- Versión alternativa en Hugging Face: https://huggingface.co/valurank/distilroberta-bias
