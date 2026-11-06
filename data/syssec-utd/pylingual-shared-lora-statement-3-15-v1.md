# syssec-utd/pylingual-shared-lora-statement-3.15-v1

## Resumen

`syssec-utd/pylingual-shared-lora-statement-3.15-v1` es un adaptador LoRA publicado por el grupo SysSec de la University of Texas at Dallas (UTD) para el backbone congelado `syssec-utd/pylingual-shared-statement-v1`. No se trata de un modelo de lenguaje generativo al uso, sino de un adaptador de bajo rango entrenado sobre un backbone compartido para una tarea concreta de análisis de código: la clasificación o representación de sentencias (statements) de Python, en este caso específicamente para la versión 3.15 del lenguaje.

El modelo se enmarca en un estudio de "shared-backbone + per-version LoRA", en el que un único backbone universal y su tokenizador permanecen inmutables y cada versión de Python (3.15 en este caso) recibe un adaptador LoRA independiente. Esto permite reutilizar un mismo modelo base para múltiples versiones del lenguaje sin reentrenar ni modificar los pesos principales, lo que reduce coste de almacenamiento y de cómputo, y facilita añadir nuevas versiones con adaptadores ligeros.

Es relevante ahora por su enfoque de eficiencia en el ajuste: el adaptador tiene rango 64, alpha 128 y dropout 0.05 aplicado a las proyecciones `q` y `v`, y se entrena durante 2.0 épocas con FP16. El repositorio ocupa 1.3 GB e incluye tanto el checkpoint reanudable (`last-checkpoint/`) como el adaptador final en `adapters/3.15/` junto con `family.json`. La información pública es escasa y no se han publicado benchmarks ni especificaciones completas del backbone en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre backbone transformer congelado (PyLingual shared statement backbone) |
| Parametros totales | no disponible (el adaptador LoRA es de rango 64; el backbone subyacente no se especifica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (entrenamiento en FP16; no se documentan cuantizaciones de inferencia) |
| Idiomas soportados | no disponible (el dominio es código Python 3.15) |
| Licencia | other |
| Formato de pesos | no disponible explícitamente; el repo contiene `adapters/3.15/`, `family.json` y `last-checkpoint/` (checkpoint reanudable) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) de rango 64 y alpha 128, con dropout 0.05, aplicado únicamente a las proyecciones `q` y `v` de la atención del backbone congelado `syssec-utd/pylingual-shared-statement-v1` (revisión `3e42fd302a6aef684e3cf4748251bf716be99482`, backbone_id `06ea40895d3bc927b75f1c559351691e9320db5479cecf74a9362fa2fd0878db`). El backbone y el tokenizador nunca se modifican: esta es la premisa del estudio de "shared-backbone + per-version LoRA", en el que cada versión de Python recibe su propio adaptador ligero.

El entrenamiento se realizó sobre el split `adapter/3.15/statement/train` del dataset `syssec-utd/pylingual-shared-encoded-v1` (revisión `0f70ef5ada329b652a6cd67502244db733f98109`), durante 2.0 épocas, con batch efectivo de 36 × 2 acumulaciones (72), learning rate 2e-05, precisión FP16 y semilla 20261020. No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF/DPO (poco probables en una tarea de representación de código). El campo `opcode bindings` está vacío (`{}`).

## Capacidades

- Representación y clasificación de sentencias (statements) de código Python 3.15 sobre el backbone PyLingual.
- Ajuste específico de versión sin modificar el backbone ni el tokenizador, lo que permite mantener un modelo base compartido entre versiones.
- Reanudación de entrenamiento mediante el checkpoint `last-checkpoint/`.
- Integración con el ecosistema PyLingual a través de `family.json` y el repositorio de código en la rama `feat-shared-backbone-lora`.
- No se documentan capacidades de generación de texto, razonamiento general, matemáticas, visión, tool calling, agentes ni multilingüismo en la información disponible.

## Casos de uso

- Análisis estático de código Python 3.15: el adaptador permite clasificar o representar sentencias del lenguaje para tareas de análisis de seguridad, dado el enfoque del grupo SysSec en seguridad de software.
- Detección de patrones peligrosos en código: al estar entrenado sobre statements de Python 3.15, puede emplearse como componente en pipelines de revisión de código que busquen construcciones sospechosas.
- Investigación en adaptación eficiente: sirve como caso de estudio reproducible para comparar el enfoque shared-backbone + per-version LoRA frente a fine-tuning completo por versión.
- Extensión a nuevas versiones de Python: el patrón permite entrenar adaptadores ligeros adicionales (por ejemplo, 3.16) reutilizando el mismo backbone y tokenizador.
- Evaluación comparativa de versiones del lenguaje: al disponer de un adaptador por versión, se pueden contrastar representaciones entre versiones para estudiar cambios semánticos o sintácticos.
- Docencia y experimentación: el repositorio incluye checkpoint reanudable y semilla fija, lo que facilita reproducir el entrenamiento en entornos académicos con recursos limitados.
- Integración en herramientas de análisis de código existentes: mediante la rama `feat-shared-backbone-lora` del repositorio `quinntyx/pylingual`, se puede incorporar el adaptador a flujos ya basados en PyLingual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El adaptador LoRA es ligero (rango 64 sobre `q` y `v`), pero el consumo vendrá determinado por el backbone `pylingual-shared-statement-v1`, cuyas especificaciones no se detallan.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; depende del tamaño del backbone subyacente.
- Opciones de despliegue: no se documentan (no hay referencias a vLLM, llama.cpp, Ollama ni TGI). El uso previsto es mediante el código del repositorio `quinntyx/pylingual`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (adaptadores LoRA para representación de statements de Python sobre backbone compartido).

## Limitaciones y advertencias

- La licencia es `other`: no se especifican los términos exactos, por lo que el uso comercial requiere revisar las condiciones del autor antes de cualquier despliegue en producción.
- El adaptador está especializado en Python 3.15 y en la tarea de statements; no debe esperarse un comportamiento generalista.
- No se documentan sesgos conocidos ni tasas de alucinación, pero al ser un modelo de representación de código, los riesgos se centran en errores de clasificación o representación, no en generación de texto.
- No se especifican límites de contexto ni idiomas soportados más allá del dominio del código Python.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.
- El backbone y el tokenizador están congelados: cualquier mejora requiere entrenar un nuevo adaptador, no reentrenar el modelo base.
- La información pública es muy limitada; faltan datos clave como el tamaño del backbone, el contexto y los benchmarks, lo que dificulta evaluar su idoneidad en producción.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/syssec-utd/pylingual-shared-lora-statement-3.15-v1
- Backbone: https://huggingface.co/syssec-utd/pylingual-shared-statement-v1
- Dataset: https://huggingface.co/datasets/syssec-utd/pylingual-shared-encoded-v1
- Código: https://github.com/quinntyx/pylingual (rama `feat-shared-backbone-lora`, commit `02d9472a6c9dff726e3e56ee685d81872e91180b`)
