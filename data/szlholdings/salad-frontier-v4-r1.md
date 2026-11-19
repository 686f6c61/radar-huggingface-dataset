# SZLHOLDINGS/salad-frontier-v4-r1

## Resumen

salad-frontier-v4-r1 es un adaptador LoRA (PEFT) publicado por la organizacion SZLHOLDINGS sobre el modelo base nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16. No se trata de un modelo completo con pesos propios, sino de un ajuste fino de bajo rango que debe cargarse junto al modelo base de NVIDIA para poder utilizarse. El repositorio ocupa 0,2 GB, lo que es coherente con un adaptador LoRA y no con un modelo de 4.000 millones de parametros.

El adaptador se presenta explicitamente como un artefacto de entrenamiento en fase candidata ("candidate training artifact"), no como un modelo de produccion publicado. Segun la model card, se entreno con 200 pasos completos sobre el dataset SZLHOLDINGS/szl-frontier-sft-mix-v4 durante 25.831,9 segundos en una RTX 3090, con medicion dual de energia (NVML y Zeus) y una doctrina de "receipted training" orientada a la trazabilidad de artefactos.

Su relevancia actual es limitada como modelo de uso general: no hay descargas ni valoraciones, el unico idioma declarado es el ingles y la propia documentacion advierte de que las auditorias de evaluacion historica no establecen calidad en held-out ni autorizan su promocion. Resulta interesante, en cambio, como ejemplo de practicas de procedencia y auditoria de entrenamiento (manifiestos de correccion, recibos de energia, hashes de bytes).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16; arquitectura interna del modelo base no disponible en la informacion proporcionada |
| Parametros totales | No disponible para el adaptador; el modelo base es de 4B segun su nombre |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el modelo base se referencia en BF16) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA/PEFT), libreria transformers |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA entrenado mediante PEFT sobre el modelo base NVIDIA Nemotron-3 Nano 4B en BF16. La model card no detalla la arquitectura interna del modelo base (tipo de atencion, numero de capas, dimension oculta) ni la configuracion del adaptador (rango, alpha, modulos objetivo). El entrenamiento se realizo en contenedores GPU de Salad bajo la doctrina "fail-closed receipted-training", con medicion de energia dual mediante NVML y Zeus.

Segun la documentacion, el entrenamiento completo 200 de 200 pasos el 15 de noviembre de 2026 en 25.831,9 segundos sobre una RTX 3090, con un consumo medido de 4.877.372,7 J (NVML) y 4.876.903,9 J (Zeus), con una discrepancia del 0,01 %. El dataset utilizado es SZLHOLDINGS/szl-frontier-sft-mix-v4 (ajuste supervisado). El repositorio incluye una escalera de checkpoints (50/100/150/200 pasos) mas un directorio `final/`. No se especifica en la informacion disponible si hubo RLHF, DPO u otras fases de alineamiento, ni el numero de tokens de entrenamiento.

La model card documenta ademas una correccion historica de unidades (16 de noviembre de 2026): los scripts de evaluacion archivados guardaban deltas de milijulios del contador NVML en campos denominados `energy_j`, y un manifiesto de correccion registra los julios derivados como el valor entero original dividido por 1.000. Las auditorias asociadas (benchmark, held-out y proving-ground) reconocen los limites de la evidencia historica: las etiquetas de proving-ground provenian de comprobaciones heuristicas de texto, no de pruebas verificadas por el kernel Lean, y las 30 filas de sonda registradas no concuerdan con las 22 filas no probadas declaradas.

## Capacidades

- Generacion de texto en ingles mediante el modelo base Nemotron-3 Nano 4B con el adaptador LoRA aplicado.
- Ajuste supervisado orientado a tareas del mix SFT v4 de SZLHOLDINGS; la naturaleza concreta de esas tareas no se detalla en la informacion disponible.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingue mas alla del ingles declarado.
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito.
- Trazabilidad de artefactos: checkpoints intermedios, recibos de energia y manifiestos de correccion incluidos en el repositorio.

## Casos de uso

- Evaluacion de adaptadores LoRA sobre Nemotron-3 Nano 4B: el repositorio permite cargar el adaptador con PEFT y transformers para estudiar como afecta el ajuste al comportamiento del modelo base en tareas en ingles.
- Investigacion en procedencia de entrenamiento: los recibos de energia dual (NVML y Zeus), los hashes de bytes y los manifiestos de correccion sirven como material de estudio para disenar pipelines de auditoria de entrenamiento reproducibles.
- Reproduccion de experimentos de bajo coste: el entrenamiento completo en una RTX 3090 con 200 pasos y un adaptador de 0,2 GB es un punto de partida asequible para equipos que quieran replicar el flujo con su propio dataset SFT.
- Comparacion de checkpoints intermedios: la escalera 50/100/150/200 permite analizar la evolucion de la perdida y del comportamiento del adaptador a lo largo del entrenamiento.
- Prototipado interno de generacion de texto en ingles: utilizable como base para experimentos controlados donde la licencia Apache 2.0 y el tamano reducido del adaptador simplifican la distribucion.
- Docencia y formacion tecnica: ejemplo practico de PEFT, medicion energetica de GPU y documentacion de artefactos de ML con licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona auditorias de evaluacion historica (benchmark, held-out y proving-ground), pero estas registran los limites de la evidencia y no proporcionan cifras de calidad utilizables; ademas, la correccion de unidades afecta a los valores de energia archivados. No se deben interpretar esos artefactos como resultados de rendimiento del modelo.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,2 GB en disco; la VRAM necesaria la determina el modelo base Nemotron-3 Nano 4B en BF16, aproximadamente 8 GB de pesos mas overhead de activaciones y cache KV (estimacion estandar para 4B en BF16; no confirmada en la informacion disponible).
- GPU de entrenamiento documentada: una RTX 3090.
- GPU consumer: un modelo de 4B en BF16 cabe en tarjetas con 12-16 GB o mas; con cuantizacion de 8 bits o 4 bits del modelo base cabria en GPUs de 8 GB o menos (estimacion general, no verificada para este adaptador).
- Despliegue: transformers con PEFT para cargar el adaptador; para servir el modelo base cuantizado pueden usarse vLLM, llama.cpp, Ollama o TGI, aunque la compatibilidad del adaptador con cada backend no esta documentada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Estado |
|---|---|---|---|---|---|
| salad-frontier-v4-r1 (este) | Adaptador sobre 4B | No disponible | LoRA safetensors | Apache 2.0 | Artefacto candidato, 0 descargas |
| nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16 | 4B | No disponible | safetensors BF16 | No disponible en la informacion proporcionada | Modelo base publicado por NVIDIA |
| Adaptadores LoRA genericos sobre modelos de 4B | Depende del modelo base | Depende del modelo base | LoRA safetensors | Depende del autor | Ecosistema amplio en Hugging Face |

La comparacion con alternativas de la misma categoria es limitada porque no hay datos publicados de rendimiento para este adaptador ni especificaciones completas del modelo base en la informacion proporcionada.

## Limitaciones y advertencias

- Artefacto en fase candidata: la propia model card indica que no es un modelo de produccion y que las auditorias no autorizan su promocion.
- Sin evidencia de calidad: no hay benchmarks validos ni resultados de held-out que respalden el rendimiento del adaptador.
- Correccion de unidades pendiente de contexto: los valores de energia de la evaluacion historica estaban mal etiquetados (milijulios como julios) y fueron corregidos mediante manifiesto; cualquier analisis previo basado en esos campos es incorrecto.
- Etiquetas heuristicas: las etiquetas de proving-ground no son pruebas verificadas por Lean y las filas de sonda registradas no concuerdan con las declaradas.
- Idioma unico: solo se declara ingles, lo que limita su uso en castellano u otros idiomas.
- Riesgo de alucinacion: inherente a los modelos de 4B y no cuantificado para este adaptador.
- Sesgos: no documentados en la informacion disponible.
- Dependencia del modelo base: el adaptador no funciona de forma autonoma y hereda las limitaciones, la licencia y las condiciones de uso de nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16.
- Licencia Apache 2.0 permisiva para uso comercial, pero sujeta a las condiciones del modelo base, que no se detallan en la informacion proporcionada.
- Sin adopcion verificable: cero descargas y cero valoraciones en el momento de la consulta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-frontier-v4-r1
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16
- Dataset de entrenamiento: https://huggingface.co/datasets/SZLHOLDINGS/szl-frontier-sft-mix-v4
- Organizacion SZLHOLDINGS: https://huggingface.co/SZLHOLDINGS
- Manifiesto de correccion de unidades (ruta indicada en la model card): receipts/corrections/legacy-eval-units-00691842-20261116/manifest.json
- Auditoria de benchmark (ruta indicada en la model card): receipts/corrections/legacy-eval-units-00691842-20261116/bench-audit.json
- Auditoria de held-out (ruta indicada en la model card): receipts/corrections/legacy-eval-units-00691842-20261116/heldout-audit.json
- Auditoria de proving-ground (ruta indicada en la model card): receipts/corrections/legacy-eval-units-00691842-20261116/provingground-audit.json
