# SZLHOLDINGS/willay-r1

## Resumen

willay-r1 es un adaptador de modelo de lenguaje publicado por SZLHOLDINGS (organización identificada en GitHub como szl-holdings) bajo licencia Apache 2.0. Se trata de un ajuste fino mediante PEFT sobre el modelo base Qwen/Qwen2.5-0.5B-Instruct, según se desprende de la información de entrenamiento incluida en la model card. El repositorio contiene pesos ya fusionados (repo class MERGED), por lo que puede cargarse directamente con transformers sin necesidad de aplicar el adaptador por separado.

El modelo se presenta en la model card como un "governed-contract adapter", es decir, un adaptador orientado a tareas de cumplimiento de contratos y gobernanza de respuestas, entrenado sobre el dataset SZLHOLDINGS/szl-1-doctrine-sft. Con 494.032.768 parámetros totales, se sitúa en la categoría de modelos pequeños, adecuado para despliegues con recursos limitados y para tareas de clasificación, extracción o generación controlada donde la latencia y el coste importan más que la capacidad de razonamiento complejo.

La relevancia de esta ficha es doble: por un lado, documenta un modelo de nicho con un enfoque poco habitual (trazabilidad mediante "receipts" o artefactos de evaluación medidos); por otro, advierte de que la información pública es escasa y de que las métricas declaradas por el autor son limitadas (0,25 en una evaluación de contratos y 3/6 en una batería de pruebas), lo que debe tenerse en cuenta antes de considerarlo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajuste fino con PEFT sobre Qwen/Qwen2.5-0.5B-Instruct |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-0.5B-Instruct soporta hasta 32.768 tokens, pero la model card no lo confirma para este ajuste) |
| Tipos de cuantizacion | no disponible (no se documentan GGUF, AWQ, GPTQ ni otros formatos cuantizados en el repositorio) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (pesos fusionados, cargables con transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B-Instruct, un transformer decoder-only de la familia Qwen2 con atención causal estándar, y se ajusta mediante PEFT (la librería declarada es peft y el repositorio incluye un directorio adapter-unsloth con un training_receipt.json, lo que sugiere entrenamiento con Unsloth). El resultado se fusiona en un checkpoint completo, de ahí que la model card indique "Merged weights, load directly" y que el repositorio ocupe 2,0 GB.

El corpus de entrenamiento declarado es SZLHOLDINGS/szl-1-doctrine-sft, un dataset de ajuste supervisado orientado a "doctrina" y contratos de gobernanza. No se especifica el número de tokens, la composición del dataset, ni si hubo etapas de RLHF o DPO. La model card incluye artefactos de trazabilidad (training_args.json, merge_receipt.json, status.json y un training_receipt.json) que documentan el proceso, pero no se detallan hiperparámetros en la información disponible. No se documentan innovaciones técnicas como decodificación especulativa, atención lineal o arquitecturas híbridas.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Qwen2.5-0.5B-Instruct.
- Ajuste específico para tareas de "contrato gobernado": presumiblemente generación de respuestas sujetas a reglas o plantillas de cumplimiento, aunque la model card no detalla el formato exacto.
- Soporte de conversación multi-turno (pipeline text-generation, tag conversational).
- Capacidades multilingües: no documentadas para este ajuste; el modelo base Qwen2.5 tiene cobertura multilingüe amplia, pero no se confirma en la ficha.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Modo "thinking" o razonamiento extendido: no documentado (el sufijo "r1" podría sugerir imitación de estilo de razonamiento, pero no hay evidencia en la información disponible).
- Visión o audio: no soportado (modelo de texto).

## Casos de uso

- Clasificación y validación de cláusulas contractuales: el ajuste sobre un dataset de "doctrina" y contratos permite usar el modelo para etiquetar o verificar si un fragmento cumple reglas predefinidas, con la ventaja de su tamaño reducido para procesar lotes grandes a bajo coste.
- Generación de respuestas sujetas a plantilla en atención al cliente: dado su entrenamiento orientado a contratos gobernados, puede emplearse para redactar respuestas que sigan un formato fijo y eviten desviaciones, aunque requiere validación humana por el riesgo de alucinación.
- Extracción de entidades y campos en documentos: con 0,5B parámetros puede ejecutarse en CPU o en GPU de gama baja para tareas de extracción estructurada en pipelines de procesamiento documental.
- Prototipado rápido y pruebas de concepto: su licencia Apache 2.0 y su tamaño permiten integrarlo en entornos de desarrollo sin coste de licencia y con requisitos de hardware mínimos.
- Filtrado y moderación de contenido en flujos internos: puede usarse como clasificador de conformidad en un pipeline previo a un modelo mayor, reduciendo coste por consulta.
- Educación y demostraciones de ajuste fino: sirve como ejemplo reproducible de PEFT + fusión de pesos para quienes quieran replicar el flujo con Unsloth y transformers.
- Despliegue en dispositivos con recursos limitados: al caber en menos de 2 GB en precisión completa, es viable en GPUs de consumo y en entornos edge, aunque no se documentan cuantizaciones oficiales.

## Benchmarks y rendimiento

| Benchmark | Resultado | Estado | Notas |
|---|---|---|---|
| governed_contract_eval_2026-09-08 | 0,25 | LOCAL_MEASURED | Evaluación interna de contratos gobernados |
| mass-battery-willay_r1_v2_trained | 3/6 | MEASURED | Batería de pruebas masiva sobre el modelo entrenado |
| mass-battery-willay_v2_trained | 3/6 | MEASURED | Variante willay-v2-trained |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos son evaluaciones internas del autor, sin comparación con modelos de referencia y sin detalle de las tareas evaluadas.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 1 GB para los pesos (494M parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, entre 1,5 y 2,5 GB según longitud de contexto y batch.
- VRAM estimada en fp32: alrededor de 2 GB solo para pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobredimensionadas para este modelo, pero funcionarán sin problema.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU dedicadas modernas e incluso en iGPU con memoria compartida suficiente.
- Opciones de despliegue: transformers (carga directa con AutoModelForCausalLM), vLLM y TGI para serving; llama.cpp y Ollama requerirían conversión a GGUF, que no se proporciona en el repositorio.
- Latencia y throughput: no disponibles; por el tamaño, se espera un throughput alto en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| willay-r1 | 494M | no disponible | Apache 2.0 | Hugging Face (pesos fusionados) | Ajuste PEFT sobre Qwen2.5-0.5B-Instruct, orientado a contratos gobernados |
| Qwen2.5-0.5B-Instruct | 494M | 32.768 tokens | Apache 2.0 | Hugging Face, ampliamente disponible | Modelo base; capacidades generales e instrucciones, sin ajuste de dominio |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 tokens | Apache 2.0 | Hugging Face | Mayor capacidad general a coste de más VRAM |
| SmolLM2-360M-Instruct | 360M | 8.192 tokens | Apache 2.0 | Hugging Face | Alternativa pequeña para tareas ligeras; contexto menor |

La comparación directa con el modelo base es la más relevante: willay-r1 no documenta mejoras medibles frente a Qwen2.5-0.5B-Instruct en benchmarks estándar, y su evaluación interna (0,25 en contratos, 3/6 en batería) no permite concluir superioridad. Para uso general, el modelo base o Qwen2.5-1.5B-Instruct son opciones más seguras y mejor documentadas.

## Limitaciones y advertencias

- Información pública muy escasa: no se documentan idiomas, contexto, cuantizaciones ni composición del dataset de entrenamiento.
- Métricas de evaluación internas y de baja puntuación (0,25 en governed_contract_eval, 3/6 en mass-battery), sin comparación con baselines; no permiten afirmar calidad competitiva.
- Riesgo de alucinación elevado por el tamaño reducido (0,5B parámetros) y por el ajuste estrecho sobre un dominio específico.
- Sesgos conocidos: no documentados; al heredar el modelo base, puede reproducir sesgos de Qwen2.5-0.5B-Instruct.
- Limitaciones de contexto e idioma: no confirmadas para este ajuste; el contexto efectivo podría ser menor que el del modelo base si el entrenamiento usó secuencias cortas.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; la model card incluye advertencias de "anti-overclaim" que sugieren cautela con las afirmaciones del propio repositorio.
- El repositorio incluye artefactos de gobernanza y "receipts" que no son estándar en la comunidad; revisar su contenido antes de confiar en las afirmaciones de rendimiento.
- No se proporcionan pesos en GGUF ni cuantizaciones oficiales, lo que limita el despliegue en llama.cpp u Ollama sin conversión manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/willay-r1
- Organización en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Repositorio GitHub: https://github.com/szl-holdings
- Dataset de evaluación mass-battery-willay_r1_v2_trained: https://huggingface.co/datasets/SZLHOLDINGS/frontier-54-runs/blob/main/benchmark/mass-battery-willay_r1_v2_trained.json
- Dataset de evaluación mass-battery-willay_v2_trained: https://huggingface.co/datasets/SZLHOLDINGS/frontier-54-runs/blob/main/benchmark/mass-battery-willay_v2_trained.json
- Evaluación de contratos gobernados: https://huggingface.co/SZLHOLDINGS/willay-r1/blob/main/evaluation/governed_contract_eval_2026-09-08.json
- Training receipt: https://huggingface.co/SZLHOLDINGS/willay-r1/blob/main/adapter-unsloth/training_receipt.json
- Training args: https://huggingface.co/SZLHOLDINGS/willay-r1/blob/main/training_args.json
- Merge receipt: https://huggingface.co/SZLHOLDINGS/willay-r1/blob/main/merge_receipt.json
- Status: https://huggingface.co/SZLHOLDINGS/willay-r1/blob/main/status.json
- Modelo base Qwen2.5-0.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
