# SZLHOLDINGS/SZL-Khipu-1.5B-abstain-laptop-lora

## Resumen

SZL-Khipu-1.5B-abstain-laptop-lora es un artefacto de investigación publicado en Hugging Face por la organización SZLHOLDINGS bajo la etiqueta "research-artifact" y "experimental". Por el nombre se deduce que se trata de un adaptador LoRA (entrenado con QLoRA, según referencias en el historial de la model card) sobre un modelo base de aproximadamente 1.500 millones de parámetros, presumiblemente orientado a la abstención ("abstain") y a un despliegue en portátil ("laptop"). Sin embargo, la propia model card, en su reescritura del 14 de noviembre de 2026, retira explícitamente todas las afirmaciones previas sobre evaluación, benchmarks y contrato de entrenamiento por no poder verificarlas por modelo.

El repositorio se describe como "private registry artifact of the SZLHOLDINGS estate", con visibilidad privada en el Hub, y su tarjeta actual no reclama ningún resultado medido. La información pública disponible es, por tanto, mínima: no se especifica el modelo base exacto, ni el dataset, ni hiperparámetros, ni resultados de evaluación. Cualquier uso en producción debería tratarse con máxima cautela y validarse de forma independiente.

La relevancia de esta ficha es fundamentalmente documental: ilustra un caso de artefacto experimental con trazabilidad de revisiones y una política de "fail-closed" en la que el autor prefiere retirar afirmaciones antes que publicarlas sin evidencia verificable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (adaptador LoRA sobre modelo base de ~1.5B, segun nomenclatura) |
| Parametros totales | no disponible (el nombre sugiere ~1.5B en el modelo base; el adaptador LoRA no se cuantifica en la informacion) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el historial menciona QLoRA en el entrenamiento, no cuantizaciones de inferencia) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No hay información verificable sobre la arquitectura del modelo base ni sobre el proceso de entrenamiento. El nombre del repositorio indica un adaptador LoRA ("lora") sobre un modelo de aproximadamente 1.500 millones de parámetros ("1.5B"), y la model card previa (retirada) mencionaba una tabla de entrenamiento QLoRA, lo que sugiere ajuste fino con cuantización de 4 bits durante el entrenamiento. No obstante, la tarjeta actual elimina explícitamente cualquier afirmación sobre contrato de entrenamiento, hiperparámetros o composición del dataset.

Tampoco se documenta el modelo base sobre el que se aplica el adaptador, ni el número de tokens de entrenamiento, ni si hubo etapas de RLHF o DPO. El único dato técnico verificable es el formato de pesos (safetensors) y el tamaño del repositorio (0,2 GB), coherente con un adaptador LoRA de pequeño tamaño más que con un modelo completo.

## Capacidades

- No se documenta ninguna capacidad verificada en la información disponible.
- Por la nomenclatura "abstain" podría inferirse un comportamiento orientado a la abstención ante consultas inciertas, pero no hay evidencia que lo respalde.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Investigación sobre abstención en modelos pequeños: si la hipótesis del nombre se confirma, el adaptador podría estudiarse para analizar cómo un modelo de ~1.5B decide no responder; requiere validación independiente previa.
- Reproducción de experimentos LoRA/QLoRA: el artefacto puede servir como referencia de formato y estructura de un adaptador experimental, no como modelo listo para uso.
- Auditoría de trazabilidad de artefactos: el historial de revisiones y la política de retirada de afirmaciones no verificadas lo convierten en un caso de estudio sobre gobernanza de modelos.
- Pruebas de pipelines de carga de adaptadores safetensors: útil para validar herramientas de fusión de LoRA con un modelo base, siempre que se identifique dicho modelo base.
- Docencia sobre limitaciones de model cards: ejemplo de tarjeta que declara explícitamente "no medido" frente a prácticas de publicación más agresivas.
- Evaluación de riesgos en producción: sirve como contraejemplo de artefacto que no debería desplegarse sin benchmarks propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card actual declara explícitamente que no se reclama ninguna evaluación, benchmark o resultado de batería de pruebas para este artefacto en la revisión observada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; dependería del modelo base (~1.5B) y de la cuantización elegida, pero no se documenta.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no verificable sin conocer el modelo base; un modelo de ~1.5B en cuantización de 4 bits podría caber en GPUs de consumo, pero es una estimación no confirmada.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; al ser un adaptador LoRA, requeriría fusión o carga junto al modelo base correspondiente.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se dispone de información sobre el modelo base ni sobre alternativas comparables dentro de la misma categoría (adaptadores LoRA experimentales de ~1.5B orientados a abstención), por lo que no es posible establecer una comparativa rigurosa.

## Limitaciones y advertencias

- Ausencia total de evidencia verificable: la model card retira las afirmaciones previas y declara "no medido" para evaluación, entrenamiento y preparación para producción.
- Modelo base no identificado: sin conocer el modelo base no se pueden evaluar sesgos, idiomas ni capacidades heredadas.
- Riesgo de alucinación: no evaluado; no hay datos que permitan estimarlo.
- Restricciones de licencia: la licencia declarada es apache-2.0, pero conviene verificar que el modelo base subyacente permita uso comercial, ya que la licencia del adaptador no cubre necesariamente la del modelo base.
- Visibilidad privada: el repositorio se describe como artefacto de registro privado, lo que limita su reproducibilidad por terceros.
- No apto para producción sin validación propia: cualquier despliegue requeriría benchmarks, análisis de sesgos y pruebas de robustez independientes.
- Idiomas y contexto desconocidos: no se puede garantizar cobertura multilingüe ni ventanas de contexto concretas.

## Enlaces

- Hugging Face: https://huggingface.co/SZLHOLDINGS/SZL-Khipu-1.5B-abstain-laptop-lora
- Revisión observada citada en la model card: `35af62d4ddc1fccb262191f0862371beed981308`
- No se han encontrado en la búsqueda web papers, blogs, repositorios o demos adicionales asociados a este artefacto.
