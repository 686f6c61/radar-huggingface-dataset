# SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-v2-merged

## Resumen

SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-v2-merged es un ajuste fino (fine-tune) del modelo base unsloth/Qwen3.5-0.8B, publicado por la organizacion SZLHOLDINGS dentro de su catalogo de modelos, datasets y Spaces orientados a IA gobernada y trazable. El modelo se distribuye ya fusionado (merged), es decir, los pesos del adaptador estan integrados en el checkpoint final, y se ofrece en formato safetensors con licencia Apache 2.0. Cuenta con 852.985.920 parametros totales y esta etiquetado para la tarea de generacion de texto.

El nombre del artefacto ("receiptagent") sugiere un uso orientado a agentes que generan o procesan recibos y documentacion financiera, aunque la model card no documenta explicitamente el dataset de entrenamiento ni las capacidades concretas adquiridas. La model card es deliberadamente escueta en cuanto a rendimiento: el autor declara que cualquier cifra de entrenamiento o evaluacion no incluida en sus ficheros de recibo se considera desconocida (UNKNOWN), y no se afirma ningun resultado de benchmark en la propia tarjeta.

Su relevancia practica reside en el tamano reducido (menos de mil millones de parametros), que permite desplegarlo en hardware de consumo, y en el linaje Qwen3.5, que aporta una arquitectura moderna con soporte de contexto amplio. Ahora bien, la documentacion publica es muy limitada, por lo que cualquier evaluacion en produccion debe hacerse por cuenta del integrador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5, segun tag `qwen3_5`); detalles internos no disponibles |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card; al ser safetensors, admite conversion a GGUF/AWQ/GPTQ mediante herramientas externas |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 3.4 GB, incluye pesos fusionados) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint unsloth/Qwen3.5-0.8B, un transformer decoder-only de la familia Qwen3.5 con aproximadamente 0,85 mil millones de parametros. El repositorio se publica con la libreria `peft`, lo que indica que el ajuste se realizo mediante tecnicas de parametros eficientes (LoRA o similar) y que posteriormente los pesos del adaptador se fusionaron en el modelo base para dar lugar al checkpoint final. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron etapas de RLHF, DPO o SFT adicionales mas alla del ajuste supervisado.

La model card no documenta innovaciones tecnicas propias. Las caracteristicas arquitectonicas heredadas del modelo base (mecanismos de atencion, posibles modos de razonamiento extendido, tokenizador multilingue) no se detallan en la informacion proporcionada y deben consultarse en la ficha del modelo Qwen3.5-0.8B original. El autor enfatiza un enfoque de trazabilidad ("receipted results") en el que las afirmaciones de entrenamiento y evaluacion se remiten a ficheros de auditoria externos, no incluidos en esta tarjeta.

## Capacidades

- Generacion de texto autoregresiva en ingles, tarea principal declarada en el pipeline (`text-generation`).
- Especializacion probable en tareas de agente relacionadas con recibos y documentacion financiera, inferida del nombre del artefacto; no confirmada en la model card.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes multi-paso: no documentado explicitamente; el nombre "receiptagent" sugiere orientacion a flujos de agente, sin evidencia tecnica en la tarjeta.
- Capacidades multilingues: limitadas al ingles segun el campo de idiomas del repositorio.
- Modo de razonamiento extendido (thinking), vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Extraccion y estructuración de datos de recibos: el modelo puede recibir texto OCR de un ticket o factura y devolver un JSON con campos normalizados (fecha, comercio, importe, impuestos). Su tamano reducido permite ejecutarlo en local dentro de un pipeline de contabilidad sin enviar documentos financieros a terceros.
- Clasificacion de gastos en aplicaciones de finanzas personales: dado un conjunto de lineas de recibo, asignar categorias contables de forma consistente, con la ventaja de que el modelo cabe en una GPU de consumo y el coste por inferencia es bajo.
- Asistente conversacional de soporte para reclamaciones: gestionar conversaciones multi-turno sobre devoluciones o discrepancias de facturacion; la ventana de contexto efectiva debe validarse empiricamente, ya que no esta documentada.
- Preprocesamiento en pipelines de auditoria: como primer eslabon que transforma documentos no estructurados en registros verificables antes de pasarlos a un modelo mayor o a un sistema de reglas, reduciendo el coste total del flujo.
- Prototipado rapido de agentes documentales: servir de base para experimentar con tool calling y flujos multi-paso en entornos de desarrollo, dado que la licencia Apache 2.0 permite uso comercial sin restricciones adicionales.
- Despliegue en el borde (edge) o en entornos con recursos limitados: al tener menos de mil millones de parametros, puede ejecutarse en CPU o en GPUs integradas para tareas de extraccion de informacion en tiempo real dentro de aplicaciones moviles o de escritorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explicitamente que no se afirma ninguna cifra de rendimiento mas alla de las medidas en auditorias fechadas, y que los datos no incluidos en los ficheros de recibo se consideran desconocidos.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 1,7 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 2 y 3 GB para contextos cortos.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 0,9-1,2 GB.
- VRAM estimada en cuantizacion de 4 bits: alrededor de 0,5-0,8 GB.
- GPU recomendadas: cualquier GPU consumer moderna con 4 GB o mas de VRAM (RTX 3050, RTX 4060, RTX 4090); tambien cabe en GPUs de datacenter (A100, H100) aunque estan sobredimensionadas para este tamano.
- Cabe en GPU de consumo: si, en practicamente todas las GPU discretas actuales e incluso en CPU mediante llama.cpp.
- Opciones de despliegue: vLLM, TGI, llama.cpp y Ollama tras convertir los pesos a GGUF; el formato nativo safetensors es compatible con Transformers y con las librerias de inferencia estandar.
- Latencia y throughput estimados: no disponibles; al tratarse de un modelo de 0,85 mil millones de parametros, se espera un throughput alto en GPU consumer, pero no hay mediciones publicadas que lo confirmen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| szl-receiptagent-qwen35-0.8b-v2-merged | 852.985.920 | no disponible | Apache 2.0 | en | Fine-tune fusionado de Qwen3.5-0.8B; sin benchmarks publicados |
| unsloth/Qwen3.5-0.8B (modelo base) | ~0,8 mil millones | no disponible en esta ficha | segun modelo base | no disponible | Referencia directa; el fine-tune hereda su arquitectura |
| Qwen2.5-0.5B / 1.5B (generacion anterior) | 0,5 / 1,5 mil millones | 32.768 tokens (familia Qwen2.5) | Apache 2.0 | multilingue | Alternativa consolidada de tamano comparable; datos de contexto de la familia Qwen2.5 |
| Llama 3.2 1B | 1,24 mil millones | 128.000 tokens | Llama 3.2 Community License | multilingue | Alternativa de tamano similar con contexto amplio y licencia con restricciones |

La comparacion con Qwen2.5 y Llama 3.2 se ofrece como referencia de categoria; no se dispone de datos de rendimiento del modelo evaluado que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Documentacion muy escasa: la model card no detalla el dataset de entrenamiento, el proceso de ajuste ni las capacidades reales, lo que dificulta evaluar su idoneidad antes de desplegarlo.
- Ausencia de benchmarks: no hay resultados publicados de MMLU, HumanEval, GSM8K ni de tareas de extraccion documental, por lo que el rendimiento debe medirse internamente.
- Riesgo de alucinacion: como todo modelo generativo de este tamano, puede inventar campos, importes o fechas en tareas de extraccion; se recomienda validacion posterior con reglas o esquemas.
- Limitacion idiomatica: el campo de idiomas solo declara ingles, por lo que el rendimiento en castellano no esta garantizado ni documentado.
- Contexto desconocido: al no documentarse la longitud de contexto, los flujos con documentos largos requieren validacion empirica.
- Licencia Apache 2.0: permite uso comercial y modificacion sin restricciones adicionales, pero no exime de cumplir las obligaciones de atribucion correspondientes.
- Trazabilidad declarativa: las afirmaciones de rendimiento se remiten a ficheros de recibo externos que no acompanan al repositorio; conviene verificar su existencia antes de confiar en cualquier cifra.
- Especializacion incierta: la orientacion a "receipt agent" se deduce del nombre, no de una descripcion funcional detallada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-v2-merged
- Organizacion SZLHOLDINGS en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-0.8B
- Organizacion en GitHub (referenciada en la model card): https://github.com/szl-holdings
- Repositorio de generacion de tarjetas (referenciado en la model card): https://github.com/szl-holdings/estate-cards
