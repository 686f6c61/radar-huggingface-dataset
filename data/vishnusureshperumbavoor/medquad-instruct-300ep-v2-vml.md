# vishnusureshperumbavoor/medquad-instruct-300ep-v2-vml

## Resumen

El modelo `medquad-instruct-300ep-v2-vml` es un adapter LoRA de bajo rango entrenado sobre el modelo base `Qwen/Qwen2-0.5B`, un transformer decoder-only de 0,5 mil millones de parámetros. El desarrollo corre a cargo de Vishnu Suresh Perumbavoor, investigador especializado en flujos de trabajo de imagen médica y radiología, y utiliza el framework propietario Vibe ML Studio para el ajuste fino, la cuantización y el despliegue local.

El adapter se ha entrenado durante 300 épocas sobre el dataset `lavita/MedQuAD`, un conjunto de 47.457 pares de preguntas y respuestas médicas extraídos de 12 sitios web de los Institutos Nacionales de Salud (NIH) de Estados Unidos. El objetivo es especializar el modelo en la generación de respuestas a preguntas médicas de tipo enciclopédico, con un tamaño compacto que permita su ejecución en hardware modesto.

La relevancia del modelo reside en su propuesta de demostrar que un adapter LoRA pequeño (8,8 millones de parámetros) puede adaptar un modelo base diminuto a un dominio específico sin necesidad de reentrenar todos los pesos, lo que facilita su uso en entornos con recursos limitados o en aplicaciones de respuesta a preguntas médicas embebidas. La licencia Apache 2.0 permite su uso comercial y su redistribución libre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adapter LoRA sobre Qwen2-0.5B (transformer decoder-only) |
| Parametros totales | 8.798.208 (adapter LoRA); modelo base: 494M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base Qwen2-0.5B soporta 32K tokens, pero no se especifica en la ficha) |
| Tipos de cuantizacion | GGUF (no se especifican los niveles concretos) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adapter_model.safetensors), GGUF (adapter.gguf) |

## Arquitectura y entrenamiento

El modelo consiste en un adapter LoRA de rango 16 y alpha 32 aplicado a las proyecciones de atención (`q_proj`, `k_proj`, `v_proj`, `o_proj`) y a las capas feed-forward (`gate_proj`, `up_proj`, `down_proj`) del modelo base Qwen2-0.5B. Esta configuración permite modificar el comportamiento del modelo sin tocar los pesos originales, lo que reduce el coste de entrenamiento y facilita la actualización o el intercambio de adapters.

El entrenamiento se realizó mediante ajuste fino supervisado (SFT) sobre el dataset MedQuAD, con 300 épocas completas sobre los datos. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación. El adapter se almacena en formato safetensors para su uso con la librería PEFT de Hugging Face, y también en formato GGUF para ejecución nativa con llama.cpp o VML Studio. La cuantización GGUF está incluida en el repositorio, aunque no se detallan los niveles disponibles (por ejemplo, Q4_K_M, Q8_0, etc.).

## Capacidades

- Generación de texto médico: el modelo está especializado en responder preguntas médicas de carácter enciclopédico, basándose en las respuestas del dataset MedQuAD.
- Conversación de preguntas y respuestas: puede mantener diálogos de una o varias interacciones sobre temas de salud, aunque con un contexto limitado por el tamaño del modelo base.
- Generación de texto general: al estar basado en Qwen2-0.5B, conserva las capacidades básicas de generación de texto del modelo base, aunque con un sesgo hacia el dominio médico.
- Soporte de tool calling y agentes: no se menciona en la documentación del modelo; no es una funcionalidad esperable en un adapter de 0.5B.
- Capacidades multilingües: el modelo base Qwen2-0.5B soporta múltiples idiomas, pero no se ha verificado el rendimiento del adapter en lenguas distintas del inglés (el dataset MedQuAD es íntegramente en inglés).
- Modo de razonamiento especial (thinking mode, visión, audio): no disponible.

## Casos de uso

- Asistente de documentación médica: el modelo puede generar respuestas preliminares a preguntas de pacientes sobre síntomas, medicamentos o procedimientos, ayudando al personal sanitario a redactar material informativo. Su tamaño pequeño permite ejecutarlo en estaciones de trabajo o portátiles sin GPU dedicada.
- Generación de contenido para portales de salud: se puede integrar en sistemas de generación de FAQ para webs de hospitales o clínicas, ofreciendo respuestas basadas en el conocimiento de MedQuAD.
- Chatbot de educación sanitaria: al ser un modelo de texto ligero, se puede desplegar en aplicaciones móviles o servicios web de bajo coste para responder preguntas frecuentes sobre salud.
- Aumento de datos para entrenamiento de modelos médicos: el adapter puede generar variaciones de preguntas y respuestas para ampliar otros datasets médicos.
- Prueba de concepto de ajuste fino LoRA: sirve como ejemplo didáctico de cómo adaptar un modelo pequeño a un dominio específico con recursos computacionales mínimos.
- Búsqueda semántica en literatura médica: combinado con un sistema de recuperación, puede generar respuestas a partir de documentos médicos, aunque su contexto limitado (no especificado) restringe la longitud de las entradas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas como MMLU, HumanEval o GSM8K para este modelo. La ausencia de evaluaciones públicas impide comparar su rendimiento con otros modelos médicos o con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen2-0.5B en FP16 ocupa aproximadamente 2 GB de VRAM. El adapter LoRA añade unos 0,02 GB adicionales. En cuantización GGUF, la memoria puede reducirse a menos de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3060) es suficiente. También puede ejecutarse en CPU con llama.cpp, aunque la latencia será mayor.
- Compatibilidad con hardware consumer: sí, el modelo se ejecuta sin problemas en GPUs de gama media y baja, incluso en sistemas con 8 GB de RAM.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Transformers con PEFT, o el entorno VML Arena.
- Latencia y throughput estimados: no se proporcionan datos oficiales. En una GPU moderna, la generación de 128 tokens debería completarse en menos de 2 segundos, pero esto es una estimación no verificada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar con otros adapters LoRA médicos. Se puede comparar estructuralmente con el modelo base Qwen2-0.5B:

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Qwen2-0.5B (base) | 494M | 32K | Apache 2.0 | safetensors |
| medquad-instruct-300ep-v2-vml | 8,8M (adapter) | no disponible | Apache 2.0 | safetensors, GGUF |

No se conocen adapters LoRA de tamaño comparable sobre Qwen2-0.5B con el mismo dataset, por lo que la comparación directa no es posible.

## Limitaciones y advertencias

- El modelo es extremadamente pequeño (0,5B de base) y ha sido entrenado exclusivamente en el dataset MedQuAD, por lo que su conocimiento general es limitado y puede producir respuestas erróneas o incompletas fuera del dominio médico.
- Riesgo de alucinación: el modelo puede generar respuestas plausibles pero incorrectas, especialmente en preguntas complejas o no cubiertas por el dataset.
- Sesgos del dataset: MedQuAD se construyó a partir de páginas de NIH, que tienen un sesgo geográfico y cultural hacia la medicina occidental y no cubren todas las áreas de la salud global.
- No sustituye a un profesional médico: las respuestas generadas no deben utilizarse para diagnóstico, tratamiento o decisiones clínicas reales sin supervisión.
- Limitación de contexto: aunque el modelo base soporta 32K tokens, el adapter no especifica su longitud de contexto efectiva; la generación de respuestas largas puede degradarse.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el dataset MedQuAD puede tener restricciones de uso adicionales que no se detallan en la ficha.
- Riesgo de sobreajuste: el entrenamiento durante 300 épocas sobre un dataset relativamente pequeño (47K pares) puede provocar sobreajuste, reduciendo la generalización a preguntas fuera del dataset.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/vishnusureshperumbavoor/medquad-instruct-300ep-v2-vml)
- [Dataset MedQuAD en Hugging Face](https://huggingface.co/datasets/lavita/MedQuAD)
- [Repositorio GitHub del dataset MedQuAD original](https://github.com/abachaa/MedQuAD)
- [Vibe ML Studio (GitHub)](https://github.com/vishnusureshperumbavoor/VML-Studio)
- [Perfil del autor en GitHub](https://vishnusureshperumbavoor.github.io/V-S-P/)
