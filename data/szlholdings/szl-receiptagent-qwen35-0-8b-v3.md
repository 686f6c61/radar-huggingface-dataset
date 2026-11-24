# SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-v3

## Resumen

`szl-receiptagent-qwen35-0.8b-v3` es un ajuste fino (fine-tune) del modelo base Qwen/Qwen3.5-0.8B, publicado por la organizacion SZLHOLDINGS dentro de lo que el autor denomina "governed-AI estate": un conjunto de modelos, datasets y Spaces con trazabilidad documentada mediante ficheros de "recibos" (receipts) de entrenamiento y evaluacion. El nombre sugiere un uso orientado a agentes de gestion de recibos o documentos financieros, aunque la model card no detalla la tarea concreta ni el dataset de ajuste.

El artefacto tiene 752.393.024 parametros en formato safetensors y se distribuye como adaptador PEFT (la libreria declarada es `peft`), por lo que requiere cargar el modelo base Qwen3.5-0.8B para su uso. La licencia es Apache 2.0 y el pipeline declarado es text-generation. El repositorio ocupa 6,1 GB, un tamano considerable para un modelo de menos de mil millones de parametros, lo que apunta a la presencia de pesos en precision completa o multiples checkpoints junto con los activos graficos de la model card.

La relevancia de esta ficha es limitada pero ilustrativa: se trata de un ejemplo de modelo pequeno especializado con practicas de documentacion poco habituales (etiquetado explicito de datos como MEASURED, REPORTED o UNKNOWN). No obstante, la propia model card reconoce que no existe evidencia de evaluacion estricta para este artefacto, por lo que cualquier afirmacion de calidad debe considerarse no verificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3.5-0.8B; familia `qwen3_5_text`); ajuste mediante PEFT |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no es MoE segun los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; no se documentan versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT sobre Qwen/Qwen3.5-0.8B) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base Qwen3.5-0.8B, un transformer decoder-only de la familia Qwen3.5, y se distribuye como adaptador PEFT, lo que implica que el entrenamiento se realizo mediante tecnicas de ajuste eficiente de parametros (LoRA u otra variante soportada por la libreria `peft`). El repositorio incluye un fichero `training_receipt.laptop-blackwell.json`, cuyo nombre sugiere que el entrenamiento se ejecuto en hardware consumer de gama alta (arquitectura Blackwell, previsiblemente una GPU RTX de la serie 50), y un `merge_receipt.json` que apunta a un proceso de fusion de pesos del adaptador con el modelo base.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni innovaciones tecnicas especificas. La model card es explicita al respecto: cualquier afirmacion de entrenamiento o evaluacion que no este en los ficheros de recibo se etiqueta como UNKNOWN. El escaneo de recibos de noviembre de 2026 clasifica el repositorio como RECEIPT_FILES_NO_DONE, es decir, existen ficheros con nombre de recibo pero no un `DONE.json` estricto con estado MEASURED, codigo de salida de evaluacion cero y marca temporal validada.

## Capacidades

- Generacion de texto autoregresiva, heredada del modelo base Qwen3.5-0.8B.
- Especializacion probable en tareas de agente sobre recibos o documentos (por el nombre del modelo), aunque la model card no especifica la tarea ni el formato de salida esperado.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el campo de idiomas no esta relleno en el repositorio.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Extraccion estructurada de datos de recibos y facturas: dado el nombre del modelo, un uso plausible es la conversion de documentos de gasto en JSON con campos como comercio, fecha, importe e impuestos. La idoneidad depende de un ajuste supervisado que la model card no documenta, por lo que requeriria validacion propia antes de produccion.
- Clasificacion de documentos financieros en pipelines de contabilidad: el modelo puede etiquetar recibos por categoria de gasto dentro de un flujo de ingestion automatizado, con un coste de inferencia bajo al tener menos de mil millones de parametros.
- Preprocesado en arquitecturas de agentes con modelo pequeno como primer eslabon: uso como router o extractor rapido que decide si un documento requiere un modelo mayor, reduciendo coste por token en volumen alto.
- Procesamiento por lotes en hardware modesto: con 752 millones de parametros, es viable ejecutarlo en GPU consumer o incluso CPU para tareas de extraccion no interactivas, lo que lo hace adecuado para pipelines nocturnos de conciliacion de gastos.
- Prototipado de asistentes de gastos en entornos de desarrollo: util para iterar sobre prompts y esquemas de salida antes de migrar a un modelo mayor, gracias a su licencia Apache 2.0 sin restricciones de uso comercial.
- Base para experimentacion con PEFT: al distribuirse como adaptador, sirve como ejemplo practico de fusion de pesos y despliegue de adaptadores LoRA sobre un modelo base pequeno en entornos de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se afirma ninguna cifra de benchmark mas alla de lo que una auditoria fechada haya medido, y el escaneo de recibos clasifica la evidencia de evaluacion como UNKNOWN (sin `DONE.json` estricto).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5 GB en FP16 para los 752 millones de parametros del modelo fusionado; en cuantizacion de 8 bits, en torno a 0,8 GB, y en 4 bits, alrededor de 0,4 GB (estimaciones teoricas a partir del numero de parametros, no medidas publicadas).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente para FP16; una RTX 3060, RTX 4060 o superior cubre el caso con holgura. Para lotes grandes, A100 o H100 no son necesarias pero permiten mayor throughput.
- Cabe en GPU consumer: si, practicamente en cualquier GPU dedicada moderna e incluso en iGPU con memoria unificada suficiente.
- Opciones de despliegue: al ser un adaptador PEFT, requiere cargar Qwen/Qwen3.5-0.8B y aplicar el adaptador con la libreria `peft`; para servirlo en produccion seria necesario fusionar los pesos y exportar a un formato compatible con vLLM, TGI, llama.cpp u Ollama. No se documentan conversiones oficiales a GGUF.
- Latencia y throughput estimados: no disponible. El `training_receipt.laptop-blackwell.json` sugiere entrenamiento en un portatil con GPU Blackwell, lo que es coherente con un modelo de este tamano, pero no aporta datos de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| szl-receiptagent-qwen35-0.8b-v3 | 752 M | no disponible | Apache 2.0 | Hugging Face (adaptador PEFT) | Sin benchmarks publicados; evidencia de evaluacion UNKNOWN |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 B | no disponible en esta ficha | Apache 2.0 (segun el autor del ajuste) | Hugging Face | Modelo generalista del que deriva este ajuste; sin datos de rendimiento en la informacion disponible |
| Qwen2.5-0.5B / 1.5B | 0,5 B / 1,5 B | 32 768 tokens (familia Qwen2.5) | Apache 2.0 | Hugging Face, Ollama, llama.cpp | Alternativas generalistas de tamano comparable con amplio soporte de herramientas; la comparacion de rendimiento con este ajuste no esta disponible |

## Limitaciones y advertencias

- Ausencia de evidencia de evaluacion: la model card declara que no hay `DONE.json` estricto con resultados medidos, por lo que no existe ninguna garantia verificable de calidad o capacidad sobre este artefacto.
- Riesgo de alucinacion: inherente a un modelo de 752 millones de parametros; en tareas de extraccion de datos financieros, cualquier salida debe validarse con reglas deterministas o revision humana.
- Idiomas no documentados: el campo de idiomas esta vacio en el repositorio; no se puede asumir un rendimiento correcto en castellano sin pruebas propias.
- Contexto desconocido: no se especifica la longitud de ventana, lo que impide planificar el procesamiento de documentos largos.
- Dependencia del modelo base: al ser un adaptador PEFT, su comportamiento esta ligado a la version concreta de Qwen/Qwen3.5-0.8B; cambios en el base pueden romper la compatibilidad.
- Documentacion atipica: la model card esta generada por herramientas internas del autor y contiene referencias a rutas y organizaciones de GitHub que no se pueden verificar desde la informacion proporcionada; conviene tratar las afirmaciones de gobernanza como no auditadas de forma independiente.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; la responsabilidad sobre el cumplimiento normativo en el tratamiento de datos financieros recae en el integrador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-v3
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de la herramienta de generacion de fichas del autor: https://github.com/szl-holdings/estate-cards
- Organizacion en GitHub (referenciada en la model card, no verificada): https://github.com/szl-holdings
