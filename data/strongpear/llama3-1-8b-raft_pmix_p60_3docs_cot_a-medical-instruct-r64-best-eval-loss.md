# strongpear/Llama3.1-8B-RAFT_PMIX_P60_3DOCS_CoT_A-MEDICAL-Instruct-r64-best-eval-loss

## Resumen

Este repositorio contiene un adaptador LoRA (Low-Rank Adaptation) sobre el modelo base `meta-llama/Llama-3.1-8B`, publicado por el usuario `strongpear`. El nombre del archivo sugiere que el adaptador fue entrenado con la técnica RAFT (Retrieval Augmented Fine-Tuning) con una mezcla de prompts (PMIX), utilizando tres documentos de referencia y cadenas de pensamiento (CoT), orientado específicamente al dominio médico en modo instructivo. El rango del adaptador es 64 (r64) y se seleccionó el checkpoint con mejor pérdida de validación.

A pesar de que la model card está prácticamente vacía y no se proporcionan detalles sobre los datos de entrenamiento, el enfoque declarado en el nombre apunta a un ajuste fino dirigido a tareas médicas con recuperación de información, lo que podría mejorar la precisión en respuestas basadas en documentos clínicos. La relevancia actual radica en la creciente demanda de modelos de lenguaje especializados en salud que puedan integrarse en sistemas de apoyo a la decisión clínica, aunque la falta de documentación y validación pública limita su uso directo en producción.

El adaptador se distribuye en formato PEFT (safetensors) y requiere el modelo base Llama-3.1-8B para funcionar. No se indica licencia, idiomas soportados ni métricas de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Llama-3.1-8B (transformer decoder-only con Grouped-Query Attention) |
| Parametros totales | No disponible (el adaptador ocupa 0,7 GB en disco; el modelo base tiene 8 030 millones de parametros) |
| Parametros activos | No disponible (al ser LoRA, solo se activan los pesos del adaptador durante el fine-tuning; en inferencia se usan todos los del base) |
| Longitud de contexto | 128 000 tokens (heredada del modelo base Llama-3.1-8B) |
| Tipos de cuantizacion | No disponible (el adaptador es en safetensors; el modelo base puede cuantizarse a 4/8 bits con herramientas externas) |
| Idiomas soportados | No disponible (el modelo base soporta 8 idiomas, pero el adaptador no especifica restricciones) |
| Licencia | No disponible (el adaptador no declara licencia; el modelo base usa Llama 3.1 Community License) |
| Formato de pesos | Safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura Llama-3.1-8B, un transformer decoder-only con Grouped-Query Attention (GQA) y 32 capas, entrenado originalmente con 15 billones de tokens multilingües. El adaptador LoRA introduce matrices de bajo rango (r=64) en las capas de atención y MLP, lo que permite un fine-tuning eficiente en términos de memoria y cómputo.

Según el nombre del repositorio, el entrenamiento habría utilizado RAFT (Retrieval Augmented Fine-Tuning), una técnica que combina el fine-tuning con recuperación de documentos relevantes para mejorar la fidelidad de las respuestas. La parte "PMIX_P60" podría referirse a una mezcla de prompts con un 60 % de ejemplos con recuperación, y "3DOCS" indica que se proporcionan tres documentos de contexto por muestra. El sufijo "CoT" sugiere el uso de cadenas de pensamiento durante el entrenamiento, y "A-MEDICAL-Instruct" apunta a un conjunto de instrucciones médicas. Sin embargo, no hay documentación oficial que confirme estos detalles, ni información sobre el dataset, el número de tokens de entrenamiento o si se aplicaron técnicas de alineación como RLHF o DPO.

## Capacidades

- Generacion de texto instructivo en el dominio medico, probablemente con soporte para preguntas y respuestas basadas en documentos clinicos.
- Razonamiento con cadenas de pensamiento (CoT) para tareas que requieren pasos intermedios, segun sugiere el nombre.
- Recuperacion aumentada: el entrenamiento con RAFT y tres documentos de contexto podria permitir respuestas mas fieles a fuentes externas, aunque no se ha verificado.
- Herencia de las capacidades generales del modelo base Llama-3.1-8B: generacion de texto, razonamiento, codigo, matematicas y soporte multilingue (8 idiomas) en el modelo original.
- No se confirma soporte para tool calling, agentes, vision ni audio; estas capacidades dependen del modelo base y del adaptador, pero no estan documentadas.

## Casos de uso

- Asistencia a profesionales sanitarios: el adaptador podria responder preguntas clinicas basadas en documentacion medica proporcionada como contexto, ayudando en la consulta rapida de guias o protocolos.
- Resumen de historiales clinicos: con tres documentos de contexto, podria generar resumenes estructurados de episodios medicos, aunque requiere validacion con datos reales.
- Educacion medica: generar explicaciones de conceptos fisiopatologicos o farmacologicos con razonamiento paso a paso, util para estudiantes.
- Soporte a la investigacion bibliografica: dado un conjunto de articulos, el modelo podria extraer informacion relevante y responder preguntas especificas sobre ellos.
- Desarrollo de chatbots de triaje: integrado en un sistema con recuperacion de documentos, podria clasificar sintomas y sugerir derivaciones, siempre bajo supervision humana.
- Generacion de informes estructurados: a partir de notas clinicas libres, el adaptador podria producir informes estandarizados, aunque se requiere evaluacion de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni metricas especificas del dominio medico (por ejemplo, MedQA o PubMedQA). Tampoco se proporcionan comparaciones con otros modelos o adaptadores similares.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un adaptador sobre Llama-3.1-8B, se necesita cargar el modelo base (8 030 M de parametros) mas el adaptador. En precision fp16, el modelo base ocupa aproximadamente 16 GB; con cuantizacion 4-bit (por ejemplo, con bitsandbytes) se reduce a unos 6 GB, mas el overhead del adaptador (0,7 GB). Se recomienda al menos 12 GB de VRAM para cuantizacion 4-bit y 24 GB para fp16.
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB) para fp16, o RTX 4060/4070 (12-16 GB) con cuantizacion. Para despliegue en produccion, se recomienda A100 (40/80 GB) o H100.
- Si cabe en consumer GPU: si, en GPUs con 16 GB o mas usando cuantizacion 4-bit. En 8 GB (como RTX 4060) es posible con cuantizacion mas agresiva y contexto reducido.
- Opciones de despliegue: se puede usar con transformers + PEFT, vLLM (con soporte para LoRA), llama.cpp (convertiendo a GGUF con el adaptador fusionado), o Ollama (fusionando el adaptador en el modelo base).
- Latencia y throughput: no disponible. Depende del hardware y de la longitud del contexto; como referencia, Llama-3.1-8B en una RTX 4090 genera alrededor de 50-80 tokens/segundo en fp16, pero no hay datos especificos para este adaptador.

## Comparativa con modelos similares

No se dispone de informacion sobre adaptadores LoRA medicos comparables sobre Llama-3.1-8B en el repositorio ni en la busqueda web realizada. Por tanto, no es posible establecer una comparativa fiable con alternativas como Meditron, BioMistral u otros modelos medicos. Se recomienda consultar el Hub de HuggingFace para buscar adaptadores similares con la etiqueta "medical" y "lora".

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. El adaptador hereda los sesgos del modelo base Llama-3.1-8B, que pueden incluir sesgos culturales, de genero y de idioma.
- Riesgo de alucinacion: alto, especialmente en el dominio medico. Aunque el entrenamiento con RAFT podria reducir las alucinaciones al anclar las respuestas a documentos, no hay evidencia publica de su eficacia.
- Limitaciones de contexto: el contexto maximo es de 128 000 tokens (heredado), pero el entrenamiento con solo tres documentos podria no aprovechar ventanas largas de forma optima.
- Restricciones de licencia: el adaptador no declara licencia; el modelo base esta sujeto a la Llama 3.1 Community License, que permite uso comercial con ciertas condiciones (por ejemplo, si el numero de usuarios mensuales supera 700 millones, se requiere licencia de Meta). Se debe revisar esa licencia antes de usar en produccion.
- Caveat para produccion: no hay informacion sobre evaluacion clinica, validacion con datos reales ni certificacion regulatoria. No debe utilizarse como unico soporte para decisiones medicas sin supervision humana cualificada.
- La model card esta vacia: no se proporcionan datos de entrenamiento, hiperparametros, ni procedencia del dataset, lo que impide auditar el modelo.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/strongpear/Llama3.1-8B-RAFT_PMIX_P60_3DOCS_CoT_A-MEDICAL-Instruct-r64-best-eval-loss
- Modelo base Llama-3.1-8B de Meta: https://huggingface.co/meta-llama/Llama-3.1-8B
- Paper sobre RAFT (Retrieval Augmented Fine-Tuning): https://arxiv.org/abs/2310.01449
- Paper sobre estimacion de impacto ambiental (referencia en los tags, no relacionado con el entrenamiento): https://arxiv.org/abs/1910.09700
