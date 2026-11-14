# twill-iclr2027/twill-checkpoints

## Resumen

TWILL es un conjunto de checkpoints publicados como material suplementario de la submission 26748 a ICLR 2027, titulada "TWILL: A Proactive Agent That Decides from Internal Proposals and Human Requests". No se trata de un modelo fundacional nuevo, sino de artefactos de investigacion: un adaptador PEFT sobre el modelo base Qwen/Qwen3-VL-8B-Instruct (8.000 millones de parametros, multimodal texto-imagen) y un conjunto de 28 checkpoints finales correspondientes a distintos metodos y semillas de entrenamiento. El proposito es permitir la reproduccion de los experimentos del articulo, no el despliegue en produccion.

El problema que aborda es la decision proactiva en agentes: determinar cuando un agente debe actuar por iniciativa propia frente a cuando debe esperar una peticion humana. El componente TWILL Proposer, implementado como adaptador sobre Qwen3-VL-8B-Instruct, alcanza un 89,88 % de precision conjunta y un 96,84 % de restraint (capacidad de abstenerse) con solo 3 propuestas falsas sobre 198 observaciones reservadas. El repositorio incluye tambien checkpoints de los metodos comparativos SHUTTLE, Direct, Merged-text y Parameter-matched Adapter, ademas de un Commander afinado y un checkpoint de inicializacion compartido de la etapa 1.

La relevancia es acotada: se trata de pesos anonimos para revision por pares, con licencia MIT, un tamano de repositorio de 5,5 GB y cero descargas en el momento de la consulta. La informacion publica no incluye detalles de arquitectura mas alla del modelo base, ni composicion del dataset de entrenamiento, ni resultados de benchmarks estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (heredada de Qwen/Qwen3-VL-8B-Instruct); el adaptador TWILL Proposer es un modulo PEFT sobre dicha base |
| Parametros totales | 8.000 millones (modelo base Qwen3-VL-8B-Instruct); parametros del adaptador no disponibles |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT) y checkpoints `.pt` (PyTorch) para los modulos de decision y Commander |

## Arquitectura y entrenamiento

El modelo base es Qwen3-VL-8B-Instruct, un transformer multimodal de 8.000 millones de parametros de la familia Qwen3-VL, capaz de procesar entradas de texto e imagen. Sobre el se aplica un adaptador PEFT (el TWILL Proposer) que constituye el unico componente especifico del trabajo. El resto de artefactos son checkpoints de modulos de decision (`SHUTTLE`, `Direct`, `Merged-text`, `Parameter-matched Adapter`) entrenados con 7 semillas distintas (17, 23, 41, 5, 29, 53, 71), lo que da lugar a 28 checkpoints finales, mas un Commander afinado y su contrapartida `Direct` con el mismo schedule de entrenamiento.

La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO. El articulo describe un esquema en dos etapas, con un checkpoint de inicializacion compartido (`warmstart/sp_direct_warmstart.pt`) para la etapa 1. El benchmark asociado, `twill-iclr2027/twine-benchmark`, contiene el conjunto de evaluacion y entrenamiento; las cifras reportadas (89,88 % de precision conjunta, 96,84 % de restraint, 3 propuestas falsas en 198 observaciones) corresponden a ese benchmark propietario, no a benchmarks estandar de la comunidad.

## Capacidades

- Decision proactiva: el Proposer evalua observaciones y decide si emitir una propuesta de accion o abstenerse, con una tasa de restraint del 96,84 % en el conjunto reservado.
- Procesamiento multimodal texto-imagen, heredado de Qwen3-VL-8B-Instruct.
- Generacion de texto y razonamiento propios del modelo base Qwen3-VL-8B-Instruct.
- Soporte de tool calling y function calling: no documentado en la informacion disponible, aunque el modelo base Qwen3-VL-Instruct lo soporta.
- Capacidades de agente multi-paso: el trabajo se enmarca explicitamente en agentes proactivos, con modulos de propuesta y decision separados.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking, vision o audio: vision heredada del modelo base; modo thinking y audio no documentados.

## Casos de uso

- Reproduccion de experimentos del articulo: cargar los checkpoints de `decision_7seed/` con las 7 semillas y replicar las tablas 3 y C.4 del paper, comparando SHUTTLE frente a Direct, Merged-text y Parameter-matched Adapter bajo el mismo protocolo.
- Evaluacion de agentes proactivos: usar el adaptador `proposer_deployed/` para medir la tasa de propuestas correctas y de abstención sobre el benchmark `twine-benchmark`, como linea base en investigacion sobre iniciativa de agentes.
- Analisis de calibracion de la abstitucion: estudiar los 3 falsos positivos sobre 198 observaciones para caracterizar en que condiciones el Proposer rompe el restraint, un analisis util para disenar politicas de seguridad en agentes autonomos.
- Investigacion sobre PEFT multimodal: emplear el adaptador como ejemplo de ajuste eficiente de un modelo vision-lenguaje de 8B para una tarea de decision binaria con contexto visual.
- Comparacion de estrategias de entrenamiento: los checkpoints `commander_comparison/` permiten contrastar un Commander de modulo unico frente a un `Direct` con schedule identico, aislando el efecto del diseno modular.
- Docencia y revision por pares: material de partida para cursos o replicaciones que necesiten pesos concretos de un estudio de agentes proactivos con licencia permisiva.

## Benchmarks y rendimiento

Los unicos resultados publicados en la informacion disponible son los del benchmark propio del articulo:

| Metrica | Resultado |
|---|---|
| Precision conjunta (joint accuracy) | 89,88 % |
| Restraint | 96,84 % |
| Propuestas falsas sobre 198 observaciones reservadas | 3 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen3-VL-8B-Instruct en precision FP16 requiere aproximadamente 16 GB de VRAM; en cuantizacion de 8 bits, en torno a 8-9 GB; en 4 bits, alrededor de 5-6 GB. Estas cifras son estimaciones por tamano y no estan confirmadas en la model card.
- GPU recomendadas: A100 40 GB o H100 para FP16 con contexto largo y lotes grandes; RTX 4090 (24 GB) suficiente para FP16 en lotes pequenos; RTX 3090 (24 GB) tambien viable.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB en FP16 y en tarjetas de 8-12 GB con cuantizacion, siempre que se disponga de una conversion a GGUF que el repositorio no proporciona.
- Opciones de despliegue: el adaptador PEFT se carga con la libreria `peft` sobre transformers; para servicio se puede usar vLLM o TGI con soporte de adaptadores LoRA. Los checkpoints `.pt` de los modulos de decision requieren el codigo del repositorio `github.com/twill-iclr2027/twill`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| TWILL Proposer (este) | 8B (base) + adaptador PEFT | No disponible | MIT | Agente proactivo con decision de propuesta |
| Qwen/Qwen3-VL-8B-Instruct | 8B | No disponible en esta ficha | No disponible en esta ficha | Modelo base multimodal instruct |
| Alternativas de agente proactivo | No disponible | No disponible | No disponible | No se identifican en la informacion proporcionada |

La comparacion con otros modelos de la misma categoria no esta disponible en la informacion proporcionada; el unico punto de referencia solido es el modelo base sobre el que se construye.

## Limitaciones y advertencias

- Pesos anonimos de una submission en revision: pueden cambiar o retirarse tras el proceso de revision por pares; no son un artefacto estable para produccion.
- Cero descargas y un solo like en el momento de la consulta: no hay evidencia de uso independiente ni validacion externa.
- Los resultados reportados (89,88 % de precision, 96,84 % de restraint) proceden de un benchmark propietario del propio articulo; no son comparables con benchmarks estandar y pueden no generalizar.
- Sesgos conocidos: no documentados en la informacion disponible; al heredar el modelo base, arrastra los sesgos de Qwen3-VL-8B-Instruct, que tampoco se detallan.
- Riesgo de alucinacion: no evaluado en la model card; el Proposer puede emitir propuestas falsas (3 sobre 198 en el conjunto reservado), lo que exige supervision humana en cualquier uso real.
- Limitaciones de contexto e idioma: no documentadas; el modelo base es multilingue, pero el adaptador se entrena para una tarea concreta y su comportamiento fuera de ella es desconocido.
- Restricciones de licencia: MIT permite uso comercial, pero el modelo base Qwen3-VL-8B-Instruct tiene su propia licencia, que debe verificarse por separado antes de cualquier despliegue.
- Los checkpoints `.pt` requieren el codigo del repositorio de GitHub, que puede no estar disponible publicamente durante la revision anonima.
- No se proporcionan conversiones a GGUF ni cuantizaciones listas para usar; el despliegue en hardware de consumo exige trabajo adicional de conversion.

## Enlaces

- Hugging Face: https://huggingface.co/twill-iclr2027/twill-checkpoints
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Codigo: https://github.com/twill-iclr2027/twill
- Benchmark y dataset: https://huggingface.co/datasets/twill-iclr2027/twine-benchmark
- Manifiesto de checkpoints: `CHECKPOINT_MANIFEST.json` dentro del repositorio (checksums SHA-256 y tamanos)
- Paper: no disponible como enlace directo en la informacion proporcionada (submission 26748 a ICLR 2027)
