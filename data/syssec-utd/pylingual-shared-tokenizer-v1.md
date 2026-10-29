# syssec-utd/pylingual-shared-tokenizer-v1

## Resumen

`syssec-utd/pylingual-shared-tokenizer-v1` no es un modelo de lenguaje, sino un paquete de tokenizadores compartidos (uno por tarea) publicados por el grupo syssec-utd para un estudio de arquitectura denominado "backbone universal + LoRA por versión" dentro del proyecto PyLingual. El artefacto contiene dos tokenizadores congelados e independientes, `statement` y `segmentation`, pensados para convertir bytecode y flujos de instrucciones de Python en secuencias de tokens que alimenten un modelo posterior.

Su rasgo técnico central es que cada opcode conocido de Python (233 en total) se mapea a un único token atómico, de modo que el modelo nunca ve una instrucción fragmentada en varios subtokens. Además, cada tokenizador reserva 64 identificadores contiguos con la forma `<future_opcode_NN>` para instrucciones de versiones futuras de Python; esos slots se vinculan por adaptador LoRA, lo que permite extender la cobertura de opcodes sin reentrenar ni volver a ajustar el tokenizador base.

Es relevante ahora por dos motivos: por un lado, ataca un problema clásico de los pipelines de decompilación y análisis de bytecode (la tokenización inconsistente de opcodes y operandos); por otro, propone un esquema de compatibilidad hacia delante para versiones de Python aún no publicadas. El artefacto tiene 0 descargas y 0 likes en el momento de la consulta y su licencia es "other" sin texto adjunto, lo que limita seriamente su adopción en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no aplica: tokenizador (no es un modelo neuronal); dos tokenizadores congelados, uno por tarea (`statement`, `segmentation`) |
| Parametros totales | no aplica (tokenizador; sin pesos neuronales) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (la model card no define límite de secuencia para el tokenizador) |
| Tipos de cuantizacion | no aplica (no hay pesos que cuantizar) |
| Idiomas soportados | no disponible; el dominio de entrada es bytecode/instrucciones de Python, no lenguaje natural |
| Licencia | `other` (sin texto de licencia en la model card) |
| Formato de pesos | no disponible en detalle; artefacto cargable con `AutoTokenizer.from_pretrained(..., subfolder=...)`, por lo que se distribuye en formato de tokenizador de HuggingFace (no safetensors ni GGUF) |

Datos adicionales del artefacto:

| Tarea | Vocabulario base aprendido | Vocabulario total | IDs reservados |
|---|---:|---:|---|
| `statement` | 11280 | 11577 | 11513–11576 |
| `segmentation` | 29703 | 30000 | 29936–29999 |

Presupuesto total de vocabulario: 30000 tokens (incluye marcadores de opcode y slots reservados). Opcodes conocidos mapeados: 233. Corpus de ajuste: `syssec-utd/pylingual-shared-tokenizer-corpus-v1`, revisión `2dd36151733c372cc7409a77af7066b172ad6e76`.

## Arquitectura y entrenamiento

El artefacto no entrena una red: ajusta dos tokenizadores sobre un corpus específico de bytecode y datos de segmentación de Python. La innovación de diseño es la tokenización atómica de opcodes: cada una de las 233 instrucciones conocidas ocupa un único ID, lo que elimina la ambigüedad de que una misma instrucción se divida en subtokens distintos según el contexto y reduce la longitud efectiva de las secuencias. Los tokenizadores son congelados ("frozen"), es decir, no se reajustan entre experimentos, lo que garantiza comparabilidad entre versiones de Python y entre adaptadores.

Sobre esa base se reservan 64 IDs contiguos `<future_opcode_NN>` por tarea, uno por cada instrucción potencial de versiones futuras. Esos slots se "vinculan por adaptador": el backbone universal permanece fijo y cada adaptador LoRA (asociado a una versión concreta de Python) aprende a interpretar los slots reservados que le corresponden. Los detalles de composición del corpus, número de tokens de entrenamiento, política de normalización o pre-tokenización no se especifican en la información disponible, y tampoco se documenta si hubo etapas de RLHF/DPO (no aplicables en sentido estricto a un tokenizador).

## Capacidades

- Tokenización de secuencias de bytecode Python para la tarea `statement`, con vocabulario total de 11577 tokens.
- Tokenización orientada a segmentación de flujos de instrucciones para la tarea `segmentation`, con vocabulario de 30000 tokens.
- Codificación atómica de 233 opcodes conocidos: cada instrucción recibe un ID único e indivisible.
- Soporte de compatibilidad hacia delante mediante 64 slots `<future_opcode_NN>` por tarea, activables por adaptador.
- Carga selectiva por subcarpeta (`subfolder="statement"` o `"segmentation"`) desde un único repositorio, con tokenizadores congelados e idénticos en cada ejecución.
- Integración con el ecosistema HuggingFace `transformers` vía `AutoTokenizer`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto: no es un modelo generativo.
- Cobertura multilingüe: no aplica; la entrada esperada es bytecode de Python.

## Casos de uso

- Decompilación de bytecode Python: el tokenizador `statement` convierte cada instrucción en un token atómico, lo que permite que el modelo de decompilación reciba secuencias más cortas y sin fragmentación de opcodes, un problema recurrente con tokenizadores de propósito general.
- Estudio de backbone universal con adaptadores LoRA por versión de Python: al mantener el tokenizador congelado y reservar slots por adaptador, se pueden comparar resultados entre versiones de Python sin que la variación del tokenizador contamine la medición.
- Preprocesado de corpus de binarios "stripped": el tokenizador `segmentation` (vocabulario de 30000) sirve para delimitar y codificar flujos de instrucciones extraídos de binarios sin símbolos antes de alimentar un modelo de análisis.
- Extensión a nuevas versiones de Python sin reentrenamiento del tokenizador: cuando aparezca una instrucción nueva, se asigna a un slot `<future_opcode_NN>` y se entrena únicamente el adaptador correspondiente, reduciendo coste de actualización.
- Investigación en seguridad de código: normalizar bytecode a una representación tokenizada estable facilita tareas de clasificación, detección de patrones maliciosos o agrupación de muestras escritas en Python.
- Reproducibilidad de experimentos académicos: al fijar revisiones del corpus y commits concretos del repositorio, otros grupos pueden replicar exactamente la tokenización de un conjunto de binarios.
- Construcción de datasets de instrucciones para entrenamiento: el mapeo opcode→token permite generar pares entrada/salida consistentes para modelos de decompilación o de recuperación de código fuente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de ningún tipo (ni de decompilación, ni de tasa de compresión de secuencias, ni comparaciones con otros tokenizadores), y al tratarse de un tokenizador los benchmarks habituales de LLM (MMLU, HumanEval, GSM8K) no son aplicables.

## Requisitos de hardware

- VRAM para inferencia: 0 GB. Es un tokenizador, se ejecuta en CPU; el coste en memoria es el de las tablas de vocabulario (como máximo 30000 entradas), del orden de unos pocos MB (estimación, no publicada).
- GPU recomendadas: ninguna. No requiere acelerador; cualquier CPU sirve.
- Cabe en cualquier equipo, incluidos portátiles de gama baja y entornos sin GPU.
- Opciones de despliegue: `transformers` (`AutoTokenizer`) como vía documentada; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, que además no aplican a un tokenizador aislado.
- Latencia y throughput: no disponibles. Dependen del volumen de bytecode y del proceso de extracción previo, no del tokenizador en sí.

## Comparativa con modelos similares

No se dispone de información sobre tokenizadores comparables en el material proporcionado, por lo que la comparación externa se marca como no disponible. La única comparación documentada es interna, entre las dos configuraciones del propio repositorio:

| Configuracion | Vocabulario base | Vocabulario total | IDs reservados | Uso previsto |
|---|---:|---:|---|---|
| `statement` | 11280 | 11577 | 11513–11576 (64) | Tokenización a nivel de sentencia/instrucción |
| `segmentation` | 29703 | 30000 | 29936–29999 (64) | Segmentación de flujos de bytecode |

Frente a tokenizadores de propósito general (BPE de uso común en modelos de código), la diferencia cualitativa documentada es el mapeo atómico de los 233 opcodes y la reserva explícita de slots para opcodes futuros; no hay datos cuantitativos publicados que permitan afirmar una mejora en compresión o precisión.

## Limitaciones y advertencias

- Licencia `other` sin texto: no se especifican condiciones de uso comercial, atribución ni redistribución. Es un riesgo legal bloqueante para producción hasta que el autor publique los términos.
- No es un modelo: no genera texto, no razona y no puede usarse como sustituto de un LLM. Cualquier expectativa de "modelo de decompilación" requiere el backbone y los adaptadores, que no forman parte de este repositorio.
- Cobertura de opcodes limitada a 233 instrucciones conocidas; las instrucciones no contempladas deben mapearse a slots `<future_opcode_NN>`, con eficacia dependiente del adaptador entrenado.
- La vinculación de los slots reservados "por adaptador" implica que un adaptador no puede interpretar slots asignados a otro; usar el adaptador equivocado con una versión de Python producirá degradación silenciosa, no un error explícito.
- Idiomas soportados no documentados; el artefacto no está pensado para texto natural y no debe evaluarse con métricas multilingües.
- Sin métricas ni validación comunitaria: 0 descargas y 0 likes en la fecha de consulta; no hay evidencia pública de robustez ante bytecode malformado, ofuscado o generado por herramientas no estándar.
- Riesgo de reproducibilidad: el código de referencia está en la rama `feat-shared-backbone-lora` (commit `1c20bee50f2109032045c2ddc75301a38290f480`), no necesariamente en la rama principal del repositorio; la rama podría desaparecer o reescribirse.
- La relación exacta con el proyecto PyLingual (herramienta de decompilación de bytecode de Python) no se detalla en la model card; solo se infiere del nombre y del repositorio enlazado.
- Registro del artefacto con fecha de creación 2026-10-28 y sin actualizaciones posteriores; conviene verificar la revisión antes de fijarla en un pipeline.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/syssec-utd/pylingual-shared-tokenizer-v1
- Dataset de ajuste: https://huggingface.co/datasets/syssec-utd/pylingual-shared-tokenizer-corpus-v1 (revisión `2dd36151733c372cc7409a77af7066b172ad6e76`)
- Código: https://github.com/quinntyx/pylingual, rama `feat-shared-backbone-lora`, commit `1c20bee50f2109032045c2ddc75301a38290f480`
- Resultados de búsqueda web: no se han encontrado enlaces relevantes al modelo; las entradas devueltas por la búsqueda corresponden a perfiles de redes sociales y contenidos sin relación con el artefacto, por lo que se descartan.
