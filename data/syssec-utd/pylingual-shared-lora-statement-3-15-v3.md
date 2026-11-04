# syssec-utd/pylingual-shared-lora-statement-3.15-v3

## Resumen

`syssec-utd/pylingual-shared-lora-statement-3.15-v3` es un adaptador LoRA entrenado sobre el backbone congelado `syssec-utd/pylingual-shared-statement-v3`, un modelo universal de representación de sentencias Python desarrollado por el grupo SysSec de la University of Texas at Dallas. Forma parte de un estudio de arquitectura shared-backbone con adaptadores por versión del lenguaje: un único backbone inmutable y un LoRA específico para cada versión de Python, en este caso la 3.15.

El adaptador no modifica ni el backbone ni el tokenizer; se aplica únicamente sobre las proyecciones de atención `q` y `v` con rango 64 y alpha 128. El repositorio incluye el checkpoint reanudable en `last-checkpoint/` y el adaptador final en `adapters/3.15/` junto con `family.json`, lo que permite reanudar entrenamientos o cargar el adaptador definitivo de forma determinista.

Su relevancia es acotada pero específica: sirve como pieza de un pipeline de análisis estático y modelado de código Python multi-versión, y como artefacto reproducible de un estudio sobre cómo adaptar un backbone compartido a versiones concretas del lenguaje sin reentrenar el modelo base. No es un modelo generativo de propósito general ni un asistente conversacional.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank 64, alpha 128, dropout 0.05) sobre proyecciones `q` y `v` de un backbone transformer congelado |
| Parametros totales | no disponible (el adaptador LoRA es un conjunto de matrices de bajo rango; el backbone subyacente no reporta cifra en la información disponible) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (entrenado en FP16; no se documentan cuantizaciones del adaptador) |
| Idiomas soportados | no disponible (el dominio es código fuente Python, no lenguaje natural) |
| Licencia | other |
| Formato de pesos | adaptador LoRA (checkpoint reanudable en `last-checkpoint/` y adaptador final en `adapters/3.15/` con `family.json`); formato de serialización no detallado |

## Arquitectura y entrenamiento

El adaptador se inyecta sobre un backbone transformer congelado (`pylingual-shared-statement-v3`, revisión `a20bc4d28fe8641df0f90aa3665431368930c329`, backbone_id `e64c9b6ed0422b957751f4b70e91df529949f4ea278af4cb87e8c56f5a993b54`). El entrenamiento LoRA se limita a las proyecciones `q` y `v` con rango 64, alpha 128 y dropout 0.05, sin bindings de opcode (`opcode bindings {}`). El backbone y el tokenizer permanecen inmutables, lo que permite congelar una representación común y especializar solo un adaptador ligero por versión del lenguaje.

Los datos provienen del dataset `syssec-utd/pylingual-shared-encoded-v3`, split `adapter/3.15/statement/train`, revisión `babefb482523d028d3d69e03f2434cec0d7227d4`. La configuración de entrenamiento es de 2.0 épocas, batch 36 con 2 pasos de acumulación (batch efectivo 72), learning rate 2e-05, precisión FP16 y semilla 20261020. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO (poco probables en un modelo de representación de código).

La innovación metodológica es el esquema shared-backbone + LoRA por versión: un solo backbone universal y adaptadores independientes (aquí, Python 3.15) que comparten tokenizer y representación base. El código del estudio está en el repositorio `quinntyx/pylingual`, rama `feat-shared-backbone-lora`, commit `368e29b9c9b02de8a3b383413683e938efe602dc`.

## Capacidades

- Codificación de sentencias Python para tareas de representación (statement-level), no generación de texto libre.
- Especialización en la sintaxis y semántica de Python 3.15 mediante el adaptador LoRA.
- Reutilización del tokenizer y del backbone compartido, lo que facilita comparar representaciones entre versiones de Python.
- Checkpoint reanudable (`last-checkpoint/`) para continuar entrenamientos de forma determinista.
- Metadatos de familia (`family.json`) para gestionar el adaptador dentro de un conjunto de adaptadores por versión.
- No se documenta soporte de tool calling, function calling, agentes, multi-step reasoning, visión, audio ni modo thinking.
- Capacidades multilingües de lenguaje natural: no disponibles.

## Casos de uso

- Análisis estático multi-versión: usar el adaptador 3.15 junto al backbone compartido para obtener representaciones de sentencias Python 3.15 y compararlas con las de otras versiones, detectando cambios semánticos entre releases.
- Detección de código obsoleto o incompatible: clasificar sentencias según su representación para señalar construcciones que difieren entre versiones de Python en un pipeline de migración.
- Estudio de investigación reproducible: replicar el experimento shared-backbone + LoRA con la configuración exacta (rank 64, alpha 128, 2.0 épocas, semilla 20261020) y el dataset referenciado.
- Base para clasificadores downstream: congelar el adaptador y entrenar cabezas ligeras para tareas como detección de vulnerabilidades o clasificación de patrones de código, aprovechando que el backbone no se modifica.
- Evaluación de adaptadores por versión: comparar el rendimiento del adaptador 3.15 frente a los de otras versiones sobre el mismo backbone para medir cuánto aporta la especialización.
- Integración en herramientas de seguridad de código: alimentar analizadores que operen sobre embeddings de sentencias Python 3.15, dado el origen del grupo (SysSec) en seguridad de sistemas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un adaptador LoRA sobre un backbone congelado, el coste dominante es el del backbone, cuyo tamaño no se documenta.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no determinable sin conocer el tamaño del backbone.
- Opciones de despliegue: carga del adaptador LoRA sobre el backbone mediante las librerías estándar de PEFT; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (adaptadores LoRA por versión de lenguaje sobre un backbone compartido de representación de código Python).

## Limitaciones y advertencias

- Modelo de representación de sentencias, no generativo: no debe esperarse generación de texto, razonamiento conversacional ni respuestas a instrucciones.
- Ámbito restringido a Python 3.15: el adaptador está entrenado solo para esa versión; su uso sobre otras versiones requeriría el adaptador correspondiente.
- Dependencia estricta del backbone: requiere la revisión exacta `a20bc4d28fe8641df0f90aa3665431368930c329` y el backbone_id indicado; otras revisiones pueden invalidar el adaptador.
- Licencia `other`: no se detallan los términos; es necesario revisar las condiciones antes de cualquier uso comercial.
- Sin datos de benchmarks, idiomas ni cuantización: no es posible evaluar su calidad relativa ni su comportamiento fuera del dominio de entrenamiento.
- Riesgo de sesgo heredado del dataset `pylingual-shared-encoded-v3`, cuya composición no se documenta.
- Cero descargas y cero likes en el momento de la consulta: ecosistema de validación mínimo, sin evidencia de uso en producción.
- No se documentan garantías de robustez frente a código malformado o adversarial, relevante dado el contexto de seguridad del grupo autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/syssec-utd/pylingual-shared-lora-statement-3.15-v3
- Backbone: https://huggingface.co/syssec-utd/pylingual-shared-statement-v3
- Dataset: https://huggingface.co/datasets/syssec-utd/pylingual-shared-encoded-v3
- Código: https://github.com/quinntyx/pylingual (rama `feat-shared-backbone-lora`, commit `368e29b9c9b02de8a3b383413683e938efe602dc`)
