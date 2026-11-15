# SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-v3-candidate

## Resumen

szl-receiptagent-qwen35-0.8b-v3-candidate es un artefacto de investigación publicado en Hugging Face por SZLHOLDINGS bajo el identificador `SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-v3-candidate`. El nombre sugiere una base Qwen de 0,8 mil millones de parámetros (posiblemente Qwen3.5) especializada en tareas de agente sobre recibos, pero la model card no confirma ni el modelo base exacto, ni la arquitectura, ni el proceso de entrenamiento. El repositorio se describe a sí mismo como "private registry artifact" del denominado *estate* de SZLHOLDINGS, con etiquetas `research-artifact`, `experimental` y `private-estate`.

La model card actual (reescrita el 14 de noviembre de 2026) retira explícitamente todas las afirmaciones de la versión anterior: elimina la tabla de entrenamiento QLoRA, los resultados de una supuesta *honesty battery* y los badges de *receipts*. El autor declara que, bajo su doctrina de *fail-closed*, no existe evidencia verificable por modelo en la revisión observada y, por tanto, la ficha no reclama ningún resultado de evaluación, benchmark, contrato de entrenamiento ni preparación para producción. Además, se documenta un fallo de carga de adaptadores: la auditoría `adapter_load_audit.json` reporta un *mismatch* con 372 pares de claves LoRA ausentes bajo el *stack* medido.

En la práctica, esto significa que el artefacto debe tratarse como un experimento interno sin garantías técnicas publicadas. El tamaño del repositorio (22,0 GB) es llamativamente grande para un modelo de 0,8B, lo que sugiere que incluye pesos en varios formatos, adaptadores, artefactos de *receipts* (SVG, JSON) o material auxiliar no documentado. Cualquier evaluador debe inspeccionar los ficheros del repo directamente antes de asumir nada sobre el contenido.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere base Qwen de 0,8B; no confirmado en la model card) |
| Parámetros totales | no disponible (el identificador indica 0.8b; no verificado) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (según tags del repositorio) |

## Arquitectura y entrenamiento

No hay información verificable sobre la arquitectura. El nombre del repositorio incluye "qwen35-0.8b", lo que apunta a una base de la familia Qwen con aproximadamente 0,8 mil millones de parámetros, presumiblemente ajustada mediante LoRA o QLoRA para una tarea de agente de recibos ("receiptagent"). Sin embargo, la model card actual declara explícitamente que no se reclama ningún contrato de entrenamiento, tabla de hiperparámetros ni composición de dataset para este artefacto.

La única evidencia técnica concreta en la card es negativa: la auditoría de carga de adaptadores (`receipts/adapter_load_audit.json`) reporta un *mismatch* con 372 pares de claves LoRA ausentes bajo el *stack* medido. Esto indica que, al menos en la configuración auditada, los adaptadores no se cargaron correctamente sobre el modelo base, por lo que los pesos efectivos evaluados no corresponden necesariamente a los del adaptador publicado. No se documentan innovaciones técnicas como decodificación especulativa, atención lineal o modos de razonamiento.

## Capacidades

- No hay capacidades verificadas ni documentadas en la información disponible.
- Por el nombre del repositorio, se infiere un propósito de agente especializado en recibos (extracción de campos, validación, posiblemente *tool calling*), pero no está confirmado por la model card.
- Soporte de *tool calling* / *function calling*: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (idiomas no declarados).
- Capacidades especiales (visión, audio, *thinking mode*): no disponible.

## Casos de uso

Dado que la model card no reclama ninguna capacidad verificada, los siguientes casos son hipótesis de uso coherentes con el nombre del artefacto, no aplicaciones validadas:

- Extracción estructurada de campos de recibos: un agente de 0,8B podría mapear texto OCR de tickets a JSON (fecha, comercio, importe, impuestos), pero requiere validación previa porque no hay evidencia de calidad publicada.
- Clasificación de gastos para contabilidad: integrar el modelo en un *pipeline* que categorice recibos por tipo de gasto; adecuado por su tamaño reducido, pero sin métricas de precisión disponibles.
- Preprocesado en flujos de *expense management*: usar el modelo como primer filtro antes de un modelo mayor, siempre que se verifique la carga correcta de los adaptadores (el *mismatch* de 372 claves LoRA es un bloqueante).
- Prototipado de agentes con *tool calling* sobre APIs de gestión de gastos: plausible por la nomenclatura "agent", pero sin confirmación de soporte de *function calling*.
- Investigación sobre adaptadores LoRA y auditoría de artefactos: el propio repositorio incluye material de auditoría (`adapter_load_audit.json`, visualizaciones SVG) que puede servir como caso de estudio de *fail-closed* y trazabilidad.
- Evaluación comparativa de modelos pequeños para tareas de extracción: útil como punto de partida experimental, no como componente de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card declara explícitamente que no se reclama ningún resultado de evaluación o *battery* para este artefacto en la revisión observada.

## Requisitos de hardware

- VRAM estimada: no disponible de forma verificada. Para un modelo de ~0,8B en FP16 se necesitarían aproximadamente 1,6 GB de pesos más *overhead* de activaciones y KV cache; en cuantización de 4 bits, del orden de 0,5-0,7 GB. Estas cifras son estimaciones genéricas por tamaño, no medidas sobre este artefacto.
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU consumer con 8 GB o más (RTX 3060, 4060, 4090) podría alojarlo en teoría, pero la carga de adaptadores está documentada como defectuosa.
- ¿Cabe en GPU consumer? Probablemente sí por tamaño, pero no verificado; el *mismatch* de adaptadores impide confirmar que el modelo cargado sea el previsto.
- Opciones de despliegue: no disponible (no se documentan vLLM, llama.cpp, Ollama ni TGI).
- Latencia y *throughput*: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables ni datos de rendimiento que permitan una comparación rigurosa. Cualquier comparación con otras variantes de Qwen 0,8B o con modelos pequeños de extracción de documentos sería especulativa.

## Limitaciones y advertencias

- Ausencia total de evidencia verificada: la model card retira las afirmaciones de la versión anterior y declara que no hay evaluación, benchmark ni contrato de entrenamiento para esta revisión.
- Fallo de carga de adaptadores documentado: 372 pares de claves LoRA ausentes en la auditoría; los pesos efectivos podrían no corresponder al adaptador publicado.
- Artefacto experimental y de registro privado: las etiquetas `research-artifact`, `experimental` y `private-estate` indican que no está pensado para uso externo ni producción.
- Riesgo de alucinación: no evaluado; sin benchmarks no puede acotarse.
- Idiomas y sesgos: no declarados ni medidos.
- Licencia: apache-2.0 permite uso comercial según los términos de la licencia, pero la falta de verificación técnica hace desaconsejable su uso en producción sin auditoría propia.
- Tamaño del repositorio (22,0 GB) desproporcionado para 0,8B: revisar el contenido real antes de descargar o desplegar.
- Fecha de creación futura (2026-10-26) y autoría con firma en la card: verificar la procedencia y la integridad del artefacto antes de cualquier uso.

## Enlaces

- Hugging Face: https://huggingface.co/SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-v3-candidate
- Auditoría de carga de adaptadores (referenciada en la card): `receipts/adapter_load_audit.json` dentro del repositorio
- Visualizaciones de *receipts* (referenciadas en la card): `receipts/receipt_visual_lane5_final.svg`, `receipts/receipt_visual_steward_root.svg`
