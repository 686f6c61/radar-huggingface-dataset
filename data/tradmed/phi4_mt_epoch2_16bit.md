# TradMed/phi4_MT_epoch2_16bit

## Resumen

El modelo **TradMed/phi4_MT_epoch2_16bit** es un ajuste fino (fine-tune) del modelo Phi-4 de Microsoft, desarrollado por thao-uyen1508 y publicado bajo la cuenta TradMed. Se trata de un modelo de lenguaje de 14.659.507.200 parámetros (14,7 mil millones) orientado a generación de texto, entrenado con las herramientas Unsloth y la librería TRL de HuggingFace. El modelo base es `unsloth/phi-4-unsloth-bnb-4bit`, una versión optimizada de Phi-4 para entrenamiento eficiente, y se ha subido en formato safetensors con precisión de 16 bits (de ahí el nombre del repositorio).

El modelo hereda las capacidades del Phi-4 original, un transformer decoder-only con 14 mil millones de parámetros que destaca por su razonamiento matemático y lógico, y que fue lanzado por Microsoft en 2024. Este fine-tune específico no incluye documentación adicional sobre los datos de entrenamiento ni el propósito exacto del ajuste, por lo que se desconoce qué tareas concretas se han optimizado. Su licencia Apache-2.0 permite uso comercial y modificación, lo que lo convierte en una opción atractiva para proyectos que necesiten un modelo de lenguaje de tamaño medio con una licencia permisiva.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Phi-4, no confirmado oficialmente) |
| Parámetros totales | 14.659.507.200 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el repositorio contiene safetensors en 16 bits) |
| Idiomas soportados | Inglés (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base `unsloth/phi-4-unsloth-bnb-4bit` es una versión de Phi-4 preparada para entrenamiento con Unsloth, una librería que acelera el fine-tuning mediante optimizaciones de memoria y cómputo. La arquitectura subyacente es la de Phi-4, un transformer autoregresivo con 14 mil millones de parámetros, pero no se dispone de detalles concretos sobre el número de capas, cabezas de atención o dimensión del modelo en la información proporcionada.

El proceso de entrenamiento se realizó con la librería TRL (Transformers Reinforcement Learning) de HuggingFace, y según la model card se entrenó "2x más rápido" gracias a Unsloth. No se especifican los datos de entrenamiento, el número de épocas (aunque el nombre del archivo indica "epoch2", sugiriendo dos épocas), ni la composición del dataset. Tampoco se menciona si se aplicó RLHF, DPO u otras técnicas de alineación. Por tanto, no hay información sobre innovaciones técnicas adicionales más allá del uso de Unsloth para acelerar el entrenamiento.

## Capacidades

- Generación de texto en inglés: el modelo puede producir texto coherente y contextualizado, heredado de las capacidades del Phi-4 base.
- Razonamiento y resolución de problemas: Phi-4 destaca en tareas de razonamiento lógico y matemático, por lo que este fine-tune probablemente mantiene esas habilidades.
- Conversación multi-turno: al ser un modelo de lenguaje generativo, puede sostener diálogos, aunque no se ha evaluado específicamente su calidad conversacional.
- Tool calling y function calling: no se ha confirmado en la documentación disponible, aunque Phi-4 soporta estas capacidades; es probable que este modelo las herede.
- Multilingüismo: no está soportado oficialmente; la model card indica solo inglés.
- No hay evidencia de capacidades multimodales (visión, audio) ni de un "modo de pensamiento" especial.

## Casos de uso

- Asistentes conversacionales en inglés: el modelo puede integrarse en chatbots para atención al cliente o asistencia técnica, aprovechando su contexto de 14B parámetros para generar respuestas coherentes y naturales.
- Generación de contenido escrito: redacción de artículos, resúmenes o correos electrónicos en inglés, con una calidad comparable a otros modelos de su tamaño.
- Tutoría y resolución de problemas matemáticos: gracias a las capacidades de razonamiento de Phi-4, puede servir como herramienta educativa para explicar ejercicios de álgebra o cálculo.
- Automatización de tareas de procesamiento de lenguaje natural (PLN): etiquetado de texto, extracción de información o clasificación de documentos en inglés.
- Prototipado de aplicaciones con IA: al ser de tamaño medio y con licencia Apache 2.0, es adecuado para pruebas de concepto en entornos con recursos limitados.
- Fine-tuning adicional: el modelo puede servir como base para nuevos ajustes en dominios específicos (médico, legal, técnico) gracias a su formato safetensors y su compatibilidad con el ecosistema HuggingFace.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye evaluaciones sobre MMLU, HumanEval, GSM8K ni otras métricas estándar. Dado que es un fine-tune de Phi-4, se puede esperar un rendimiento similar al del modelo base en tareas genéricas, pero no hay datos que lo confirmen.

## Requisitos de hardware

- VRAM estimada: con 14.7 mil millones de parámetros en precisión de 16 bits, el modelo ocupa aproximadamente 29.3 GB en disco (tamaño del repositorio). Para inferencia en FP16 se necesitan al menos 30 GB de VRAM, lo que excluye a la mayoría de GPUs de consumo.
- GPUs recomendadas: NVIDIA A100 (40 GB), A100 (80 GB), H100 (80 GB) o RTX 6000 Ada (48 GB). En el caso de usar cuantización a 8 bits o 4 bits, podría ejecutarse en GPUs con 16-24 GB de VRAM, pero no se proporcionan versiones cuantizadas en el repositorio.
- Compatibilidad con GPU de consumo: no es viable en RTX 4090 (24 GB) sin cuantización, pero con cuantización a 8 bits podría intentarse, aunque no está disponible en el repositorio.
- Opciones de despliegue: compatible con librerías de la familia HuggingFace (transformers, text-generation-inference), y también puede usarse con vLLM o llama.cpp si se convierten los pesos a GGUF. No se ha verificado la compatibilidad con Ollama.
- Latencia y throughput: no se han medido en este modelo. En general, un modelo de 14B en FP16 en una A100 puede generar entre 20 y 50 tokens por segundo, dependiendo de la configuración.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| **TradMed/phi4_MT_epoch2_16bit** | 14.7B | No disponible | Apache 2.0 | Fine-tune de Phi-4, sin documentación de rendimiento |
| **microsoft/phi-4** | 14B | 128K (según informe técnico) | MIT | Modelo base, con benchmarks publicados |
| **Qwen2.5-14B** | 14.7B | 128K | Apache 2.0 | Modelo general de Alibaba, con buen rendimiento en razonamiento |
| **Llama-3.1-8B** | 8B | 128K | Meta license (no Apache) | Más pequeño y ligero, pero con licencia restrictiva |

No se dispone de datos de rendimiento específicos para el fine-tune, por lo que la comparativa se basa en características técnicas generales. El modelo base Phi-4 destaca en tareas de razonamiento matemático, mientras que Qwen2.5-14B tiene un equilibrio entre tamaño y capacidades multilingües. Llama-3.1-8B es una alternativa más ligera, aunque con licencia no permisiva.

## Limitaciones y advertencias

- Sesgos y alucinaciones: como cualquier modelo de lenguaje, puede generar información falsa o sesgada. No hay datos sobre mitigaciones específicas.
- Limitaciones de idioma: el modelo solo está entrenado en inglés, por lo que no es adecuado para tareas en español u otros idiomas sin un ajuste adicional.
- Falta de documentación: el fine-tune no incluye información sobre el dataset de entrenamiento, el objetivo específico ni los criterios de evaluación, lo que dificulta predecir su comportamiento en producción.
- Riesgo de uso en contextos sensibles: sin conocer el fine-tune, no se recomienda su uso en aplicaciones médicas, legales o financieras sin una validación exhaustiva.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe revisar las condiciones del modelo base (Phi-4) para asegurar el cumplimiento, aunque ambas son permisivas.
- Tamaño del modelo: requiere hardware de alta gama para inferencia sin cuantización, lo que limita su despliegue en entornos con recursos limitados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/TradMed/phi4_MT_epoch2_16bit
- Modelo base (Unsloth): https://huggingface.co/unsloth/phi-4-unsloth-bnb-4bit
- Informe técnico de Phi-4 (PDF): https://www.microsoft.com/en-us/research/wp-content/uploads/2024/12/P4TechReport.pdf
- Documentación de Phi-4 Multimodal (no directamente relacionada): https://huggingface.co/docs/transformers/v5.0.0/en/model_doc/phi4_multimodal
- Proyecto Unsloth: https://github.com/unslothai/unsloth
