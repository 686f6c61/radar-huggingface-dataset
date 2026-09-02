# strongpear/Llama3.1-8B-RAFT_PMIX_P60_3DOCS_CoT_A-MEDICAL-Instruct-r64-last-full-epoch

## Resumen

El modelo `strongpear/Llama3.1-8B-RAFT_PMIX_P60_3DOCS_CoT_A-MEDICAL-Instruct-r64-last-full-epoch` es un adaptador LoRA (Low-Rank Adaptation) desarrollado por el usuario strongpear sobre el modelo base `meta-llama/Llama-3.1-8B`. El nombre del repositorio indica que se ha aplicado la técnica RAFT (Retrieval Augmented Fine-Tuning), con una mezcla de prompts al 60 % (PMIX_P60), tres documentos de contexto (3DOCS), razonamiento encadenado (CoT) y una especialización en el dominio médico (A-MEDICAL). El adaptador tiene un rango de 64 (r64) y se ha entrenado hasta la última época completa.

Se trata de un modelo de generación de texto orientado a tareas de instrucción en el ámbito sanitario, aunque la información pública disponible es muy limitada: la model card no incluye detalles sobre datos de entrenamiento, hiperparámetros, evaluación ni licencia. El repositorio pesa 0,7 GB, lo que sugiere que solo contiene los pesos del adaptador, no el modelo completo. Su relevancia radica en que ejemplifica un enfoque de fine-tuning eficiente sobre un modelo de 8 000 millones de parámetros para un dominio específico, pero carece de documentación que permita evaluar su calidad o seguridad en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-3.1-8B) con adaptador LoRA |
| Parametros totales | 8 030 millones (modelo base) + adaptador LoRA (numero no disponible) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | 128 000 tokens (heredada del modelo base; no confirmada para el adaptador) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en precision original, probablemente fp16/bf16) |
| Idiomas soportados | No disponibles (el modelo base soporta 8 idiomas, pero no se especifica para este adaptador) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Llama-3.1-8B, un transformer autoregresivo con atención por ventanas y normalización RMSNorm, entrenado originalmente con 15 billones de tokens. Sobre esta base, se ha aplicado un adaptador LoRA con rango 64, lo que reduce significativamente el número de parámetros entrenables y los requisitos de memoria durante el fine-tuning.

El nombre del repositorio sugiere el uso de RAFT (Retrieval Augmented Fine-Tuning), una metodología que combina recuperación de documentos relevantes con fine-tuning supervisado para mejorar la fidelidad de las respuestas en dominios especializados. El sufijo `PMIX_P60` indica una mezcla de prompts con un 60 % de ejemplos de recuperación (probablemente frente a un 40 % de ejemplos sin recuperación), y `3DOCS` apunta a que se proporcionan tres documentos de contexto por ejemplo. La etiqueta `CoT` sugiere entrenamiento con cadenas de razonamiento (chain-of-thought). No se dispone de información sobre el volumen de datos, la composición del dataset, el régimen de entrenamiento (épocas, tasa de aprendizaje, etc.) ni si se aplicaron técnicas adicionales como RLHF o DPO.

## Capacidades

- Generación de texto e instrucción en el dominio médico, con posible mejora en tareas de respuesta a preguntas clínicas gracias al fine-tuning con recuperación de documentos.
- Razonamiento encadenado (chain-of-thought) para tareas que requieren pasos intermedios de deducción.
- Herencia de las capacidades generales del modelo base Llama-3.1-8B: generación de texto, razonamiento, comprensión lectora, soporte multilingüe (8 idiomas) y manejo de contexto largo (hasta 128K tokens).
- No se ha confirmado soporte para tool calling, agentes, visión o audio en este adaptador concreto, aunque el modelo base sí dispone de tool calling.
- Capacidades de recuperación aumentada: al estar entrenado con RAFT, puede aprovechar documentos externos proporcionados en el prompt para fundamentar sus respuestas, aunque esto depende de cómo se use en inferencia.

## Casos de uso

- Respuesta a preguntas médicas con apoyo documental: el modelo puede recibir tres documentos clínicos relevantes en el prompt y generar respuestas fundamentadas, útil para profesionales que necesitan verificar información rápidamente.
- Resumen de historiales clínicos: gracias a su contexto largo, puede condensar informes extensos en resúmenes estructurados, aunque no hay validación publicada.
- Asistencia en educación médica: generar explicaciones de conceptos fisiopatológicos o farmacológicos a partir de fuentes proporcionadas.
- Clasificación de sintomas o triaje preliminar: con un prompt adecuado, puede categorizar descripciones de pacientes, pero debe usarse con cautela por falta de evaluación.
- Generación de documentación para ensayos clínicos: redactar borradores de protocolos o resúmenes de resultados a partir de documentos de referencia.
- Investigación bibliográfica asistida: extraer información de artículos científicos incluidos en el contexto y responder preguntas específicas sobre ellos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existe ninguna evaluación pública que compare este adaptador con el modelo base o con otros modelos médicos. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni ningún benchmark específico del dominio médico.

## Requisitos de hardware

- Para inferencia con el adaptador LoRA, se necesita cargar el modelo base Llama-3.1-8B (aproximadamente 16 GB en fp16) más el adaptador (0,7 GB). En total, unos 17 GB de VRAM en precision completa.
- Con cuantizacion del modelo base (por ejemplo, 4 bits), la VRAM puede reducirse a unos 6-8 GB, lo que permitiría ejecutarlo en GPUs de consumo como RTX 3060 (12 GB) o RTX 4070 (12 GB).
- GPUs recomendadas: RTX 4090 (24 GB) para inferencia comoda en fp16, o A100/H100 para despliegue multi-usuario.
- Opciones de despliegue: al ser un adaptador PEFT, puede cargarse con la libreria `transformers` y `peft`. Para servidores de produccion, es compatible con vLLM (si se fusiona el adaptador) o con TGI. Tambien puede usarse con llama.cpp si se convierte el modelo fusionado a GGUF.
- Latencia y throughput: no disponibles, dependen del hardware y de la longitud del contexto. Un modelo de 8B en una RTX 4090 suele generar entre 40 y 80 tokens por segundo en fp16.

## Comparativa con modelos similares

No se dispone de informacion sobre adaptadores medicos comparables del mismo autor o de la comunidad. Como referencia, se puede comparar con el modelo base `meta-llama/Llama-3.1-8B-Instruct` y con otros adaptadores medicos populares como `medalpaca/medalpaca-7b` o `AdaptLLM/medicine-LLM`, pero no hay datos objetivos de rendimiento para este adaptador especifico. La siguiente tabla resume las diferencias mas relevantes basadas en informacion publica:

| Modelo | Base | Parametros | Contexto | Especializacion | Licencia |
|---|---|---|---|---|---|
| Este adaptador | Llama-3.1-8B | 8B + LoRA | 128K | Medica (RAFT) | No disponible |
| Llama-3.1-8B-Instruct | - | 8B | 128K | General | Llama 3.1 Community License |
| MedAlpaca-7B | LLaMA-7B | 7B | 2K | Medica | Apache 2.0 (adaptador) |
| AdaptLLM/medicine-LLM | LLaMA-7B | 7B | 2K | Medica | Apache 2.0 |

## Limitaciones y advertencias

- No existe ninguna validacion clinica ni evaluacion de seguridad publicada. El modelo no debe utilizarse para diagnosticos o decisiones medicas sin supervisión profesional.
- La licencia no esta especificada, lo que genera incertidumbre sobre su uso comercial. El modelo base Llama-3.1 tiene su propia licencia de Meta, que debe cumplirse.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar informacion falsa o inexacta, especialmente en un dominio de alto riesgo como el medico.
- Sesgos potenciales: el modelo base Llama-3.1 puede reflejar sesgos de los datos de entrenamiento, y el fine-tuning medico podria amplificarlos si los datos de entrenamiento no fueron balanceados.
- Limitaciones de idioma: aunque el base soporta 8 idiomas, no se ha confirmado que el adaptador funcione bien en todos ellos; probablemente el entrenamiento se realizo principalmente en ingles.
- El adaptador no incluye los pesos completos del modelo, por lo que requiere descargar el modelo base por separado y conocer el procedimiento de carga con PEFT.
- No se proporcionan instrucciones de uso, hiperparametros de inferencia ni ejemplos de prompt, lo que dificulta su reproducibilidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/strongpear/Llama3.1-8B-RAFT_PMIX_P60_3DOCS_CoT_A-MEDICAL-Instruct-r64-last-full-epoch
- Modelo base (Meta Llama 3.1): https://huggingface.co/meta-llama/Llama-3.1-8B
- Repositorio oficial de Meta Llama 3: https://github.com/meta-llama/llama3
- Pagina de Llama 3.1 en Ollama: https://ollama.com/library/llama3.1:8b
- Otros adaptadores del mismo autor (referencia): https://huggingface.co/strongpear/Llama3.1-8B-RAFT_PMIX_P80_3DOCS_CoT_A-MEDICAL-Instruct-r64-last-full-epoch y https://huggingface.co/strongpear/Llama3.1-8B-RAFT_PMIX_P60_3DOCS_CoT_A-LAW-Instruct-r64-last-full-epoch
