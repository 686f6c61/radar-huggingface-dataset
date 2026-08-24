# tuan2294/lab22-dpo-qwen25-7b

## Resumen

El modelo `tuan2294/lab22-dpo-qwen25-7b` es un adaptador LoRA (Low-Rank Adaptation) diseñado para el modelo base `Qwen/Qwen2.5-7B-Instruct`. Ha sido desarrollado por tuan2294 en el contexto del laboratorio de alineación AICB Track 3 Day 22 de VinUniversity, con el objetivo de aplicar fine-tuning mediante DPO (Direct Preference Optimization) para ajustar las preferencias del modelo en tareas de generación de texto en vietnamita e inglés. El adaptador se distribuye como un artefacto de laboratorio, no como un modelo de producción, y su tamaño de repositorio es de 0.2 GB.

La relevancia de este adaptador radica en que documenta un proceso completo de alineación: una etapa previa de SFT (Supervised Fine-Tuning) con 1.000 muestras de Alpaca vietnamita, seguida de un entrenamiento DPO con preferencias binarizadas de UltraFeedback. Aunque los resultados cuantitativos muestran una mejora en la brecha de recompensa, la evaluación manual con solo 8 prompts indica que las diferencias con el modelo base son marginales, por lo que debe tratarse como un ejemplo educativo de aplicación de DPO con LoRA, no como una solución lista para entornos reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen2.5-7B-Instruct (transformer decoder-only) |
| Parametros totales | No disponible (adaptador LoRA, tamano del repo 0.2 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128K tokens (modelo base, segun documentacion de Qwen2.5) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el modelo base admite cuantizaciones como GPTQ, AWQ, etc., pero no se especifican) |
| Idiomas soportados | vi, en |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura del modelo Qwen2.5-7B-Instruct, un transformer decoder-only con atención de múltiples cabezas. El entrenamiento se realizó en dos etapas: primero, un fine-tuning supervisado (SFT) con 1.000 muestras del dataset Alpaca vietnamita durante 1 época; después, un entrenamiento DPO con preferencias binarizadas de UltraFeedback, también durante 1 época. Los hiperparámetros del DPO fueron beta = 0.1 y learning rate = 5e-7. El adaptador LoRA se configuró con r = 16 y alpha = 32. El entrenamiento se ejecutó en un entorno de cómputo BIGGPU, y los resultados registrados incluyen una pérdida final de DPO de 0.5968, con una recompensa final para la respuesta elegida de +0.1533 y para la rechazada de -0.3275, lo que da una brecha de recompensa de +0.4808. La evaluación manual con 8 prompts mostró 1 victoria del DPO, 6 empates y 1 victoria del SFT, lo que sugiere que el adaptador no produce mejoras sustanciales sobre el modelo base.

## Capacidades

- El adaptador no introduce capacidades nuevas; su función es ajustar las preferencias del modelo base mediante DPO.
- Las capacidades del modelo base Qwen2.5-7B-Instruct no se detallan en la información proporcionada, pero según la documentación de Qwen2.5 (technical report) incluyen generación de texto, razonamiento, soporte multilingüe y una ventana de contexto de hasta 128K tokens.
- No se documenta soporte específico para tool calling, agentes o razonamiento multi-paso en el adaptador.
- El adaptador está entrenado para mejorar la alineación con preferencias humanas, pero su efectividad es limitada según la evaluación manual.

## Casos de uso

- Investigación académica en alineación de modelos: el adaptador sirve como ejemplo práctico de cómo aplicar DPO con LoRA sobre un modelo base, útil para estudiar el impacto de los hiperparámetros y la calidad de los datos de preferencia.
- Experimentos de fine-tuning en vietnamita: al haber sido entrenado con datos vietnamitas, puede utilizarse para evaluar el comportamiento de DPO en contextos de bajo recurso lingüístico.
- Comparación de métodos de alineación: permite contrastar los resultados de DPO frente a SFT en un entorno controlado, como se refleja en la evaluación manual del propio autor.
- Prototipado de chatbots en vietnamita: aunque no es apto para producción, puede servir para generar respuestas en vietnamita en entornos de desarrollo o pruebas de concepto.
- Formación en técnicas de PEFT: el adaptador es un recurso didáctico para aprender a cargar y utilizar adaptadores LoRA con la librería PEFT.
- Validación de pipelines de entrenamiento: puede emplearse para verificar que un flujo de entrenamiento DPO con LoRA funciona correctamente antes de escalar a modelos más grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card incluye métricas de entrenamiento y una evaluación manual, que se resumen a continuación:

| Metrica | Valor |
|---|---|
| Perdida final de entrenamiento DPO | 0.5968 |
| Recompensa final (respuesta elegida) | +0.1533 |
| Recompensa final (respuesta rechazada) | -0.3275 |
| Brecha de recompensa final | +0.4808 |
| Evaluacion manual (8 prompts) | 1 victoria DPO / 6 empates / 1 victoria SFT |

Estos datos indican que el adaptador mejora la brecha de recompensa, pero la evaluación cualitativa sugiere que las diferencias con el modelo base son mínimas.

## Requisitos de hardware

- El adaptador LoRA en sí no requiere hardware adicional; los requisitos son los del modelo base Qwen2.5-7B-Instruct.
- Para inferencia con el modelo base en FP16 se estima una VRAM de aproximadamente 14 GB, lo que permite su ejecución en GPUs como RTX 4090 (24 GB) o A100 (40 GB). Con cuantización INT8 o INT4, la VRAM necesaria se reduce a unos 7 GB o 4 GB respectivamente, permitiendo su uso en GPUs de gama media como RTX 3060 o RTX 4060.
- No se proporcionan datos de latencia o throughput específicos para este adaptador.
- Opciones de despliegue: el adaptador se carga con la librería PEFT sobre el modelo base. Para inferencia, se pueden utilizar frameworks como vLLM, llama.cpp, Ollama o TGI, siempre que soporten la carga de adaptadores LoRA.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores DPO similares en la documentación proporcionada. La comparativa más directa sería con el modelo base sin adaptador, pero no se han publicado métricas comparativas formales. Por tanto, la comparativa se limita a los resultados de la evaluación manual del propio autor, que muestran un rendimiento casi idéntico al del modelo base.

## Limitaciones y advertencias

- El adaptador fue entrenado con un conjunto de datos muy reducido (1.000 muestras SFT y preferencias de UltraFeedback) y solo durante 1 época, lo que limita su generalización.
- La evaluación manual se realizó con únicamente 8 prompts, por lo que no es estadísticamente significativa.
- El autor advierte explícitamente que el adaptador es un artefacto de laboratorio y no debe utilizarse para decisiones de alto riesgo.
- No se garantiza la seguridad del modelo; el adaptador no ha sido sometido a pruebas de robustez ni de sesgos.
- Aunque la licencia es MIT, se deben respetar las licencias del modelo base (Qwen2.5-7B-Instruct) y de los datasets utilizados (Alpaca vietnamita, UltraFeedback), que pueden tener restricciones adicionales.
- El adaptador no está diseñado para producción; su uso en entornos reales podría producir respuestas inconsistentes o de baja calidad.

## Enlaces

- Adaptador en Hugging Face: https://huggingface.co/tuan2294/lab22-dpo-qwen25-7b
- Modelo base Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Modelo base Qwen2.5-7B: https://huggingface.co/Qwen/Qwen2.5-7B
- Technical report de Qwen2.5: https://arxiv.org/abs/2412.15115
