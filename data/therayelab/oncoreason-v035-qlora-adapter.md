# therayelab/OncoReason-v035-QLoRA-adapter

## Resumen

OncoReason-v035-QLoRA-adapter es un adaptador LoRA (entrenado con QLoRA) publicado por el laboratorio therayelab sobre el modelo base Qwen/Qwen3-4B-Thinking-2507. No es un modelo autonomo: requiere cargar el modelo base de Qwen para funcionar. Su proposito es acotado y experimental: dada una ficha oncologica de caracter sintetico y una referencia declarada de forma explicita, el adaptador debe devolver una de tres etiquetas discretas de aplicabilidad de la evidencia (`A` evidencia insuficiente, `B` desajuste con la condicion seleccionada, `C` respaldado).

El modelo se enmarca explicitamente como material de investigacion (`research-only`) y no esta validado para uso clinico. Su interes actual reside en que ejemplifica una linea de trabajo sobre trazabilidad de evidencia (evidence tracing) en dominios regulados, usando datos sinteticos y supervision restringida a la respuesta, en lugar de un asistente medico generalista. El repositorio ocupa 0,6 GB y contiene unicamente los pesos del adaptador en formato safetensors.

La relevancia practica es metodologica: demuestra como adaptar un modelo de razonamiento pequeno (4B parametros) a una tarea de clasificacion acotada con trazas de razonamiento auditadas, y documenta de forma transparente sus limitaciones (datos sinteticos, ausencia de holdout clinico independiente, ledger de fuentes sin firma de revisor oncologico).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (QLoRA) sobre transformer decoder-only (Qwen3-4B-Thinking-2507) |
| Parametros totales | No disponible para el adaptador; modelo base de 4B parametros |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada en la informacion) |
| Tipos de cuantizacion | QLoRA implica cuantizacion del base durante el entrenamiento; no se detallan formatos de inferencia |
| Idiomas soportados | No disponible |
| Licencia | other (research-only, no uso clinico) |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena mediante QLoRA sobre `Qwen/Qwen3-4B-Thinking-2507`, fijado a la revision `768f209d9ea81521153ed38c47d515654e938aea`. El modelo base es un transformer decoder-only de 4B parametros orientado a razonamiento (thinking). El adaptador anade matrices de bajo rango sobre el base congelado, lo que explica el tamano reducido del repositorio (0,6 GB).

El entrenamiento se realizo en una GPU Google Colab L4, durante 1 epoca y 1.493 pasos de optimizador, con una perdida final de 0,0435168. La supervision es solo sobre el turno del asistente (completion-only). Se repitieron cuatro veces 300 filas de entrenamiento con razonamiento auditado, junto con el resto de ejemplos solo-respuesta. El dataset es `therayelab/oncoreason-v0.35-reasoning-research-candidate`, de naturaleza sintetica y generado por el mismo pipeline que produce las etiquetas, lo que constituye una limitacion estructural de la evaluacion.

## Capacidades

- Clasificacion acotada de aplicabilidad de evidencia: devuelve una etiqueta entre `A`, `B` o `C` ante una ficha oncologica sintetica y una referencia declarada.
- Generacion de trazas de razonamiento estructuradas: la evaluacion reporta un 100% de trazas validas en el split conocido y un 99,8% en el no visto.
- Razonamiento multi-paso heredado del modelo base Qwen3-4B-Thinking (modo thinking).
- No soporta tool calling ni function calling segun la informacion disponible.
- No se documentan capacidades de agentes, vision ni audio.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Investigacion sobre trazabilidad de evidencia: usar el adaptador para estudiar como un modelo pequeno mapea campos de una ficha estructurada a una fuente declarada, evaluando la validez de la traza de razonamiento generada.
- Experimentos de clasificacion de tres clases en dominios regulados: replicar el esquema `A`/`B`/`C` en otros dominios con datos sinteticos para comparar estrategias de supervision (completion-only frente a supervision completa).
- Benchmarking de adaptadores QLoRA: emplear el modelo como referencia de bajo coste (entrenamiento en una L4, 1 epoca) para medir el efecto del rango y de la repeticion de ejemplos auditados.
- Desarrollo de pipelines de auditoria sintetica: integrar el adaptador en un pipeline que genere fichas sinteticas y compruebe la coherencia entre referencia declarada y etiqueta emitida.
- Docencia y formacion en IA aplicada a salud: usar el modelo como ejemplo controlado de las limitaciones de los datos sinteticos y de la necesidad de holdouts independientes.
- Pruebas de robustez ante reglas no vistas: el split `unseen-rule` (420 casos, 95,7% de acierto exacto) sirve para estudiar generalizacion a reglas no presentes en entrenamiento dentro de un entorno sintetico.

## Benchmarks y rendimiento

| Split | Respuesta exacta | Traza estructurada valida | Respuesta parseada |
|---|---:|---:|---:|
| Known-rule development (200 casos) | 192/200 (96,0%) | 200/200 (100%) | 200/200 (100%) |
| Unseen-rule development (420 casos) | 402/420 (95,7%) | 419/420 (99,8%) | 420/420 (100%) |

No se conservaron las puntuaciones del baseline, por lo que no se declara mejora antes/despues. Los resultados corresponden a casos sinteticos con familias disjuntas y no miden correccion clinica ni generalizacion a registros reales.

## Requisitos de hardware

- El adaptador solo no es suficiente: requiere cargar el modelo base Qwen3-4B-Thinking-2507 (4B parametros).
- VRAM estimada para inferencia: no disponible de forma explicita; para un base de 4B en precision reducida suele ser viable en GPU consumer, pero no se aporta cifra en la informacion.
- GPU empleada en entrenamiento: Google Colab L4 (1 epoca, 1.493 pasos).
- GPU recomendadas: no disponibles en la informacion.
- Opciones de despliegue: no documentadas; al ser un adaptador LoRA sobre transformers, requeriria cargar el base y aplicar el adaptador (vLLM, TGI o llama.cpp no se mencionan).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OncoReason-v035-QLoRA-adapter | Adaptador sobre base 4B | No disponible | Clasificacion acotada A/B/C | other (research-only) | HuggingFace, 0 descargas |
| Qwen/Qwen3-4B-Thinking-2507 (base) | 4B | No disponible | Razonamiento general | No disponible en la informacion | HuggingFace |
| Alternativas de clasificacion medica | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks comparativos con otros adaptadores o modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Uso exclusivamente de investigacion: no apto para diagnostico, estadificacion, pronostico, seleccion de tratamiento, cribado, triaje ni recomendaciones por paciente.
- Datos de entrenamiento y evaluacion sinteticos: no son estandares clinicos de referencia.
- Las trazas de razonamiento son uniones deterministas de anotaciones existentes, no justificaciones redactadas por clinicos.
- El ledger de fuentes no esta firmado por un revisor oncologico; el mapeo campo-fuente y la revision de derechos estan incompletos.
- Sin holdout externo independiente ni adjudicado por clinicos; los resultados no establecen generalizacion a registros reales.
- No se conservaron las puntuaciones del baseline, por lo que no se puede atribuir mejora al adaptador.
- Riesgo de alucinacion y sesgos: no evaluados en la informacion disponible.
- Licencia `other` con restriccion research-only: cualquier uso comercial o clinico requeriria revision de licencia, gobernanza, privacidad y regulacion aplicable.
- Idiomas soportados no documentados.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/therayelab/OncoReason-v035-QLoRA-adapter
- Dataset: https://huggingface.co/datasets/therayelab/oncoreason-v0.35-reasoning-research-candidate
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Thinking-2507
- Informe de evaluacion: `evaluation_report.md` y `evaluation_report.json` (referenciados en la model card, no enlazados de forma directa)
