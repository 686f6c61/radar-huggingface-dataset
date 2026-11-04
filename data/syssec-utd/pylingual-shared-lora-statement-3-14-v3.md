# syssec-utd/pylingual-shared-lora-statement-3.14-v3

## Resumen

`syssec-utd/pylingual-shared-lora-statement-3.14-v3` es un adaptador LoRA publicado por el grupo de investigacion syssec-utd (Universidad de Texas en Dallas) para el backbone congelado `syssec-utd/pylingual-shared-statement-v3`. Forma parte de un estudio de arquitectura "shared-backbone + LoRA por version": un unico modelo base, nunca modificado, sobre el que se entrenan adaptadores especificos para cada version del lenguaje, en este caso Python 3.14.

El adaptador se aplica sobre las proyecciones `q` y `v` del backbone con rango 64, alpha 128 y dropout 0.05, y se ha entrenado durante 2.0 epocas sobre el split `adapter/3.14/statement/train` del dataset `syssec-utd/pylingual-shared-encoded-v3`, con precision FP16, batch efectivo de 72 y learning rate 2e-05 .

La relevancia de este artefacto es metodologica: propone reutilizar un backbone universal (aparentemente orientado al analisis de codigo Python, dado el nombre "pylingual" y el prefijo "statement") y encapsular las diferencias entre versiones del lenguaje en adaptadores ligeros y versionados por separado. El repositorio no documenta el tamano del backbone, el contexto ni los idiomas naturales soportados, por lo que la ficha se limita a los datos publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone LoRA sobre transformer congelado (`syssec-utd/pylingual-shared-statement-v3`); adaptador en proyecciones q, v |
| Parametros totales | no disponible (backbone no documentado); adaptador LoRA con r=64, alpha=128 |
| Parametros activos | no es MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (entrenamiento en FP16) |
| Idiomas soportados | no disponible |
| Licencia | other (licencia no estandar, revisar terminos en el repositorio) |
| Formato de pesos | adaptador LoRA (safetensors probable, no confirmado); `last-checkpoint/` y `adapters/3.14/` + `family.json` |
| Backbone | `syssec-utd/pylingual-shared-statement-v3`, revision `a20bc4d28fe8641df0f90aa3665431368930c329` |
| Backbone id | `e64c9b6ed0422b957751f4b70e91df529949f4ea278af4cb87e8c56f5a993b54` |
| Dataset de entrenamiento | `syssec-utd/pylingual-shared-encoded-v3`, split `adapter/3.14/statement/train`, revision `441d2a6536c0486aa00b2c522bbb71e08610d275` |
| Opcode bindings | `{}` (vacio) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de bajo rango (r=64, alpha=128, dropout 0.05) inyectado en las proyecciones de query y value del backbone congelado. El backbone y el tokenizer no se modifican en ningun momento, de modo que el adaptador es un delta de pesos que debe cargarse junto con el modelo base para su uso. El repositorio mantiene dos ubicaciones: `last-checkpoint/` para reanudar el entrenamiento y `adapters/3.14/` para el adaptador final, acompanado de un `family.json` que presumiblemente describe la familia de versiones.

El entrenamiento se ejecuto durante 2.0 epocas con batch de 36 y 2 pasos de acumulacion (batch efectivo 72), learning rate 2e-05, precision FP16 y semilla 20261020. El codigo de entrenamiento esta en el repositorio `quinntyx/pylingual`, rama `feat-shared-backbone-lora`, commit `368e29b9c9b02de8a3b383413683e938efe602dc`. No se detalla la composicion del dataset ni si hubo etapas de RLHF o DPO; el campo `opcode bindings` vacio sugiere que no se aplicaron mapeos de opcode especificos en esta version.

## Capacidades

- Analisis y modelado de codigo Python 3.14: el nombre "statement" indica que el backbone esta orientado a representar sentencias o instrucciones de codigo.
- Adaptacion especifica de version: el LoRA encapsula las diferencias de sintaxis y semantica de Python 3.14 respecto al backbone universal.
- Reutilizacion de backbone: permite mantener un unico modelo base y conmutar entre versiones del lenguaje cargando distintos adaptadores.
- Tool calling / function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Analisis estatico de codigo Python 3.14: el adaptador puede aplicarse sobre representaciones de sentencias para clasificacion o extraccion de caracteristicas propias de la version 3.14, reutilizando el backbone comun.
- Deteccion de cambios de version: comparando la salida del mismo backbone con distintos adaptadores de version (3.13 vs 3.14) se puede aislar que construcciones del lenguaje cambian de comportamiento.
- Investigacion de vulnerabilidades: en un contexto de grupo de seguridad (syssec-utd), el modelo puede servir para identificar patrones de sentencias asociados a practicas inseguras en Python 3.14.
- Sustitucion de un checkpoints por version: en lugar de entrenar un modelo completo por version, el equipo puede desplegar un backbone unico y cargar el adaptador de la version de Python activa.
- Experimentacion academica de PEFT: el artefacto sirve como referencia reproducible (semilla, revision y commit fijados) para estudiar LoRA sobre backbones congelados.
- Integracion en pipelines de desarrollo con versionado estricto: al estar el adaptador atado a una revision concreta del backbone y del dataset, encaja en entornos donde la trazabilidad de pesos es requisito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del tamano del backbone `pylingual-shared-statement-v3`, que no se documenta.
- GPU recomendadas: no disponible.
- Encaje en GPU de consumo: no disponible.
- Opciones de despliegue: carga de adaptador LoRA sobre el backbone; frameworks concretos (vLLM, llama.cpp, Ollama, TGI) no confirmados.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Base | Tipo de adaptacion | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `syssec-utd/pylingual-shared-lora-statement-3.14-v3` | pylingual-shared-statement-v3 | LoRA r=64 (q, v) | no disponible | no disponible | other | HuggingFace |
| `syssec-utd/pylingual-shared-statement-v3` (backbone) | propio | modelo base congelado | no disponible | no disponible | no disponible | HuggingFace |
| Otros adaptadores de la familia `pylingual-shared-lora-*` | pylingual-shared-statement-v3 | LoRA por version | no disponible | no disponible | other | no confirmado |

No se dispone de informacion sobre alternativas fuera de la familia PyLingual que sean directamente comparables en tarea y tamano.

## Limitaciones y advertencias

- El modelo es un adaptador, no un modelo autonomo: sin el backbone `syssec-utd/pylingual-shared-statement-v3` en la revision exacta indicada no es utilizable.
- La licencia "other" no especifica condiciones de uso comercial; es imprescindible revisar los terminos antes de cualquier despliegue en produccion.
- No se documentan sesgos, idiomas naturales soportados ni riesgos de alucinacion; al estar orientado a codigo, no debe asumirse ninguna capacidad conversacional.
- El artefacto registra 0 descargas y 0 likes, y la fecha de creacion aparece como 2026-11-03, lo que sugiere que es un trabajo de investigacion reciente sin validacion externa.
- El adaptador esta atado a una revision concreta del backbone y del dataset; actualizaciones del backbone invalidarian los pesos.
- No se publican evaluaciones que permitan estimar su calidad frente a alternativas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/syssec-utd/pylingual-shared-lora-statement-3.14-v3
- Backbone: https://huggingface.co/syssec-utd/pylingual-shared-statement-v3
- Dataset: https://huggingface.co/datasets/syssec-utd/pylingual-shared-encoded-v3
- Codigo: https://github.com/quinntyx/pylingual (rama `feat-shared-backbone-lora`, commit `368e29b9c9b02de8a3b383413683e938efe602dc`)
