# syssec-utd/pylingual-shared-lora-statement-3.14-v1

## Resumen

`syssec-utd/pylingual-shared-lora-statement-3.14-v1` es un adaptador LoRA (Low-Rank Adaptation) publicado por el grupo syssec-utd sobre un backbone congelado denominado `pylingual-shared-statement-v1`. No se trata de un modelo de lenguaje generativo de propósito general, sino de un adaptador especializado para el análisis de sentencias (statements) de código Python, entrenado dentro de un estudio comparativo de tipo "shared-backbone + per-version LoRA" en el que se mantiene un tronco universal congelado y se entrena un adaptador distinto por cada versión del lenguaje.

El adaptador corresponde específicamente a Python 3.14. El backbone y el tokenizer nunca se modifican; el adaptador se aplica sobre las proyecciones de atención `q` y `v`. El repositorio incluye tanto el checkpoint reanudable de entrenamiento (`last-checkpoint/`) como el adaptador final (`adapters/3.14/`) junto con un fichero `family.json` que describe la familia de adaptadores.

Su relevancia radica en el enfoque metodológico: en lugar de reentrenar un modelo completo por cada versión de Python, se comparte un tronco común y se aprende una delta de bajo rango por versión, lo que reduce coste de entrenamiento y almacenamiento. El tamaño del repositorio (1,3 GB) es coherente con un adaptador de rango 64 más los artefactos auxiliares. La información pública disponible es muy limitada: no hay pipeline declarado, no se listan idiomas y la licencia figura como "other" sin texto adjunto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre backbone transformer congelado (`pylingual-shared-statement-v1`) |
| Parámetros totales | no disponible (el adaptador es de rango 64 sobre `q` y `v`; no se publica el recuento) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el entrenamiento se realizó en FP16) |
| Idiomas soportados | no disponible (el dominio es código Python) |
| Licencia | other (sin texto de licencia publicado) |
| Formato de pesos | no disponible de forma explícita; el repo contiene `last-checkpoint/`, `adapters/3.14/` y `family.json` |

Parámetros adicionales del adaptador:

| Parámetro | Valor |
|---|---|
| Rank (r) | 64 |
| Alpha | 128 |
| Dropout | 0.05 |
| Módulos objetivo | `q`, `v` |
| Opcode bindings | `{}` (vacío) |
| Épocas | 2,0 |
| Batch | 36 × 2 acumulación |
| Learning rate | 2e-05 |
| Precisión | FP16 |
| Semilla | 20261020 |

## Arquitectura y entrenamiento

El adaptador se construye sobre un backbone congelado identificado como `syssec-utd/pylingual-shared-statement-v1` (revisión `3e42fd302a6aef684e3cf4748251bf716be99482`, backbone_id `06ea40895d3bc927b75f1c559351691e9320db5479cecf74a9362fa2fd0878db`). Se aplica una LoRA de rango 64 y alpha 128 con dropout 0,05 únicamente sobre las proyecciones `q` y `v` de la atención. El backbone y el tokenizer permanecen inalterados, de modo que el adaptador actúa como una delta de bajo rango específica de la versión 3.14 de Python.

El entrenamiento usó el conjunto `syssec-utd/pylingual-shared-encoded-v1`, partición `adapter/3.14/statement/train` (revisión `0f70ef5ada329b652a6cd67502244db733f98109`), durante 2,0 épocas con batch efectivo de 72 (36 × 2 de acumulación), learning rate 2e-05, precisión FP16 y semilla 20261020. No se documentan en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. El código de entrenamiento está en el repositorio `quinntyx/pylingual`, rama `feat-shared-backbone-lora`, commit `02d9472a6c9dff726e3e56ee685d81872e91180b`.

## Capacidades

- Análisis de sentencias (statements) de código Python en su versión 3.14, sobre el backbone compartido de PyLingual.
- Especialización por versión del lenguaje mediante adaptador LoRA independiente, manteniendo un tronco común congelado.
- Reutilización del tokenizer y del backbone originales, lo que permite intercambiar adaptadores por versión sin recargar el modelo base.
- Checkpoint reanudable (`last-checkpoint/`) para continuar entrenamientos interrumpidos.
- Metadatos de familia (`family.json`) para gestionar el conjunto de adaptadores por versión.
- No se documentan capacidades de generación de texto libre, tool calling, agentes, visión, audio ni multilingüismo general.

## Casos de uso

- Análisis estático de código Python 3.14: el adaptador se aplica sobre el backbone para procesar sentencias del lenguaje y extraer representaciones útiles en herramientas de análisis de seguridad, dado el perfil del grupo syssec-utd.
- Detección de patrones peligrosos en código: al especializarse en statements de Python 3.14, puede integrarse en pipelines de revisión que busquen construcciones susceptibles de vulnerabilidades.
- Estudio comparativo de versiones del lenguaje: el diseño shared-backbone + per-version LoRA permite comparar el comportamiento del modelo entre versiones de Python cargando el adaptador correspondiente.
- Investigación en adaptación eficiente: sirve como caso de referencia para medir el coste y la calidad de una LoRA de rango 64 sobre `q` y `v` frente a un reentrenamiento completo.
- Clasificación o etiquetado de sentencias: el adaptador puede emplearse para tareas derivadas de la representación de statements, como categorización de construcciones sintácticas.
- Reproducibilidad de experimentos: el checkpoint reanudable y los metadatos de semilla, épocas y batch permiten replicar el entrenamiento en entornos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del tamaño del backbone `pylingual-shared-statement-v1`, que no se documenta en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no determinable sin conocer el tamaño del backbone; el adaptador en sí (rango 64 sobre `q` y `v`) es ligero, pero el backbone congelado debe cargarse completo.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el adaptador se distribuye como artefactos de checkpoint para su uso con el código del repositorio `quinntyx/pylingual`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la información proporcionada. Se trata de un adaptador LoRA especializado en análisis de código Python, no de un modelo generativo de propósito general, por lo que las comparaciones habituales (MMLU, HumanEval) no resultan directamente aplicables y no se han publicado métricas.

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pylingual-shared-lora-statement-3.14-v1 | LoRA sobre backbone congelado | no disponible | no disponible | other | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Información pública muy escasa: no se documentan idiomas, pipeline, contexto, formato de pesos ni texto de licencia, lo que dificulta evaluar su idoneidad en producción.
- Licencia "other" sin términos publicados: es imprescindible contactar con el autor antes de cualquier uso comercial.
- Especialización estrecha: el adaptador está entrenado para statements de Python 3.14; su comportamiento fuera de ese dominio no está caracterizado.
- Dependencia del backbone: requiere cargar `pylingual-shared-statement-v1` en la revisión exacta indicada; cambios en el backbone invalidan el adaptador.
- Riesgo de alucinación y sesgos: no evaluado ni documentado en la información disponible.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente a alternativas.
- Estado del entrenamiento: la presencia de `last-checkpoint/` sugiere que el repositorio puede reflejar un estado intermedio o de investigación, no necesariamente un artefacto estabilizado para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/syssec-utd/pylingual-shared-lora-statement-3.14-v1
- Backbone: https://huggingface.co/syssec-utd/pylingual-shared-statement-v1
- Dataset de entrenamiento: https://huggingface.co/datasets/syssec-utd/pylingual-shared-encoded-v1
- Código de entrenamiento: https://github.com/quinntyx/pylingual (rama `feat-shared-backbone-lora`, commit `02d9472a6c9dff726e3e56ee685d81872e91180b`)
