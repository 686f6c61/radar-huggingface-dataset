# vireshk/qwen3-8b-medmcqa-qlora

## Resumen

El modelo `vireshk/qwen3-8b-medmcqa-qlora` es un adaptador LoRA (PEFT) desarrollado por `vireshk` sobre el modelo base `Qwen/Qwen3-8B`, entrenado con QLoRA en el conjunto de datos MedMCQA. No es un modelo de propósito general ni un asistente médico: se publica como un artefacto de investigación dentro de un benchmark controlado de seis brazos que compara el ajuste fino con la recuperación aumentada (RAG). El adaptador añade 43.646.976 parámetros entrenables (0,92% del total del modelo base), se entrenó durante 5 horas y 4 minutos en una NVIDIA A40 y se evalúa fusionado en bf16.

En el benchmark, alcanza un 62,9% de exactitud en un subconjunto de 1.000 preguntas de MedMCQA, frente al 56,8% del modelo base sin ajustar, pero por debajo del 67,0% de un pipeline de RAG con la misma información. La relevancia del modelo radica en su valor como comparativa, no como checkpoint utilizable en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer dense (Qwen3-8B) con adaptador LoRA (QLoRA) |
| Parámetros totales | 4.761.498.624 (modelo base) + 43.646.976 (adaptador LoRA) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | 4-bit NF4 durante el entrenamiento (QLoRA); evaluación en bf16 |
| Idiomas soportados | Inglés (adaptador); el modelo base Qwen3-8B es multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3-8B`, un transformer dense de 8.000 millones de parámetros. Sobre él se aplica un adaptador LoRA con `r=16`, `alpha=32` y `dropout=0,05`, entrenado con QLoRA, es decir, con el modelo base cuantizado a 4 bits NF4. Los módulos objetivo son `q, k, v, o, gate, up, down_proj`, lo que cubre tanto las capas de atención como las MLP. Solo se entrenan 43.646.976 parámetros, un 0,92% del total.

El entrenamiento se realizó sobre 30.000 filas del conjunto MedMCQA (Apache 2.0), un benchmark de preguntas de examen de acceso a medicina en India (AIIMS/NEET-PG), sin PHI. El preprocesamiento incluyó: reparación de corrupción OCR (el bigrama `rt` se eliminaba sistemáticamente, con un léxico de 225 entradas revisadas por humanos), eliminación de claves de respuesta repetidas al inicio de las explicaciones, un filtro de fugas basado en hash de contenido (0 filas filtradas llegaron al entrenamiento) y un muestreo aleatorio de 30.000 de las ~179.600 filas limpias. El objetivo de entrenamiento es la letra de la respuesta seguida de la explicación. Se ejecutó 1 época, 1.875 pasos, en 5h04m en una NVIDIA A40, con pérdida final de entrenamiento 1.287 y mejor pérdida de validación 1.201. No se aplicó RLHF ni DPO.

## Capacidades

- Generación de texto para preguntas de opción múltiple médicas: devuelve la letra de la respuesta y una explicación breve.
- No soporta tool calling ni function calling (no se menciona en la documentación).
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés; el modelo base es multilingüe, pero el adaptador se entrenó solo en inglés.
- No tiene capacidades de visión ni audio.
- Es un artefacto de investigación: no debe usarse como asistente médico general.

## Casos de uso

- Investigación académica comparativa: reproducir el benchmark de seis brazos que compara fine-tuning con RAG en QA médica. El adaptador se usa como una de las ramas del experimento.
- Evaluación de estrategias de adaptación de bajo rango: medir el impacto de QLoRA sobre un modelo de 8B en una tarea de dominio específico, en términos de exactitud, latencia y coste.
- Baseline para experimentos de RAG: comparar el rendimiento de un modelo ajustado frente a un pipeline de recuperación que inyecta el mismo conocimiento en el prompt.
- Análisis de contaminación y sesgos en benchmarks: el modelo se puede emplear para estudiar cómo la contaminación de datos de preentrenamiento afecta a la exactitud absoluta y cómo el ajuste fino introduce atajos posicionales.
- Docencia en sistemas de IA: demostrar los límites de los adaptadores de bajo rango frente a la recuperación, y la importancia de la validación en entornos clínicos.
- Generación de explicaciones en exámenes de medicina: dado un enunciado de opción múltiple, el modelo produce la letra y una explicación, útil para entornos educativos controlados con revisión experta.

## Benchmarks y rendimiento

La información disponible solo incluye resultados en un subconjunto de 1.000 preguntas de MedMCQA, extraído de la partición de validación etiquetada. No se han publicado resultados de benchmarks generales como MMLU, HumanEval o GSM8K.

| Brazo | Exactitud | IC 95% | Latencia p50 | Tokens de prompt |
|---|---|---|---|---|
| Base: Qwen3-8B zero-shot | 56,8% | [53,8, 59,9] | 103 ms | 113 |
| QLoRA (este adaptador) | 62,9% | [60,0, 65,9] | 102 ms | 113 |
| RAG-parity (recuperación, sin fine-tuning) | 67,0% | [64,1, 69,9] | 171 ms | 656 |

El adaptador supera al modelo base en +6,1 puntos (p < 0,0001 en la prueba de McNemar), pero el pipeline de RAG alcanza un rendimiento significativamente mayor (p = 0,016) con la misma información. La ventaja del adaptador es el coste: mantiene la misma latencia que el modelo base y usa 113 tokens de prompt frente a 656. El autor estima que el coste de entrenamiento se recupera a partir de unas 200.000 consultas. Además, se detectó contaminación: alrededor del 9% de los enunciados del test se reproducen de forma casi literal, lo que infla la exactitud absoluta, aunque las comparaciones entre brazos se consideran válidas.

## Requisitos de hardware

- Entrenamiento: una NVIDIA A40 (48 GB) durante 5h04m con QLoRA en 4-bit NF4.
- VRAM para inferencia: no disponible en la información proporcionada.
- GPU recomendadas: no disponible; el entrenamiento se realizó en una A40.
- Capacidad en GPU de consumo: no disponible.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con Hugging Face Transformers y PEFT sobre el modelo base. No se mencionan vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: la latencia p50 en el benchmark es de 102 ms para el adaptador, frente a 103 ms del base y 171 ms del pipeline RAG. No se proporciona throughput.

## Comparativa con modelos similares

| Modelo / pipeline | Parámetros entrenables | Exactitud MedMCQA | Latencia p50 | Tokens de prompt | Licencia |
|---|---|---|---|---|---|
| Qwen3-8B base | 0 (sin ajuste) | 56,8% | 103 ms | 113 | Apache 2.0 |
| Qwen3-8B + adaptador QLoRA | 43.646.976 | 62,9% | 102 ms | 113 | Apache 2.0 |
| Qwen3-8B + RAG (parity) | 0 (sin ajuste) | 67,0% | 171 ms | 656 | Apache 2.0 |

El adaptador es la opción intermedia: mejora la exactitud del base sin coste de latencia, pero queda por debajo del pipeline de RAG. No se dispone de información sobre otros modelos comparables de la misma categoría.

## Limitaciones y advertencias

- No apto para uso clínico: no es un dispositivo médico, no ha sido validado en pacientes reales ni en notas clínicas. El autor advierte que puede estar "confiadamente equivocado" y que el 86% de los errores del modelo base eran errores de alta confianza.
- Contaminación de datos: MedMCQA aparece probablemente en el preentrenamiento de Qwen3. Alrededor del 9% de los enunciados del test se regeneran por encima de la línea base de referencia barajada, lo que infla la exactitud absoluta.
- Sesgo posicional: el ajuste fino introdujo un atajo posicional: al permutar las posiciones de las opciones, el adaptador pierde 3,2 puntos de exactitud, mientras que el modelo base pierde 1,6.
- Riesgo de alucinación: el modelo genera explicaciones que pueden ser incorrectas; no se recomienda su uso sin revisión experta.
- Limitaciones de idioma: solo inglés; no se ha evaluado en otros idiomas.
- Restricciones de uso: aunque la licencia Apache 2.0 permite uso comercial, la model card establece explícitamente que está fuera de alcance para contextos clínicos, diagnósticos, de triaje o tratamiento, y para aplicaciones orientadas a pacientes.
- Dependencia del modelo base: el adaptador requiere `Qwen/Qwen3-8B` y no es un modelo autónomo.

## Enlaces

- HuggingFace: https://huggingface.co/vireshk/qwen3-8b-medmcqa-qlora
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Dataset MedMCQA: https://huggingface.co/datasets/openlifescienceai/medmcqa
- Repositorio del benchmark: https://github.com/vireshkoli/Fine-Tune-vs-RAG
- Informe detallado: no disponible (el enlace en la model card está incompleto)
