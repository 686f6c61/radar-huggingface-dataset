# srikarjy025/lipidos-phi3-domain-adapt

## Resumen

LipidOS — Phi-3.5 Mini, domain-adapted es un adaptador QLoRA (rank 16) sobre el modelo base `microsoft/Phi-3.5-mini-instruct`, desarrollado por srikarjy025 como parte del proyecto LipidOS, un sistema RAG (retrieval-augmented generation) con verificación de citas para la literatura científica sobre lípidos y espectroscopía Raman/IR. El adaptador se entrena con objetivo causal de siguiente token (no instrucción) sobre 64.000 abstracts de PubMed seleccionados de dos pools de términos MeSH (bioquímica de lípidos/lipidómica y espectroscopía vibracional). Su propósito es reducir la perplejidad del modelo base en textos de este dominio específico, manteniendo la capacidad de generar respuestas fundamentadas en evidencia recuperada.

El modelo está diseñado para integrarse en un pipeline de recuperación con verificación de citas; no debe usarse para generación abierta sin evidencia adjunta. Los resultados reportados muestran una mejora del 19,5% en perplejidad sobre un conjunto de validación held-out (de 4,911 a 3,955), y una verificación de citas con 0/3 alucinaciones en pruebas de dominio y fuera de dominio. El repositorio incluye una versión fusionada (`-merged`) que no requiere `peft` para su carga. La licencia es Apache 2.0 y el idioma soportado es únicamente inglés.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Phi-3.5-mini-instruct (base) + adaptador LoRA (QLoRA, rank 16) |
| Parametros totales | no disponible (el adaptador es un LoRA; el modelo base tiene 3.8B parámetros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Phi-3.5-mini-instruct, no especificada en la ficha) |
| Tipos de cuantizacion | QLoRA (cuantización base no especificada) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `microsoft/Phi-3.5-mini-instruct`, un modelo transformer causal de 3.8B parámetros. El entrenamiento utiliza QLoRA con rango 16, implementado con la librería Unsloth, y sigue un objetivo de modelado de lenguaje causal (next-token prediction) sobre abstracts de PubMed. No se aplicaron técnicas de RLHF ni DPO; la adaptación es puramente de dominio. El dataset de entrenamiento consta de 107.665 abstracts, de los cuales se utilizaron 64.000 (60,6% de una época) debido a un límite de presupuesto computacional fijo. La innovación principal no reside en la arquitectura, sino en su integración con el sistema LipidOS, que exige que cada afirmación generada esté respaldada por evidencia recuperada y verificada mediante citas.

## Capacidades

- Generación de texto en dominio de bioquímica de lípidos, lipidómica, biofísica de membranas y espectroscopía Raman/IR.
- Continuación de texto causal (no está entrenado para seguir instrucciones; es un modelo de lenguaje de dominio).
- Diseñado para funcionar con un pipeline de recuperación con verificación de citas (RAG), no para generación abierta.
- Soporte multilingüe: solo inglés (según metadatos).
- No se reportan capacidades de tool calling, agentes ni razonamiento multi-paso.
- No se mencionan capacidades de visión ni audio.

## Casos de uso

- Asistente de investigación en lipidómica: el modelo puede generar resúmenes de literatura científica sobre lípidos a partir de abstracts recuperados, con citas verificables, facilitando revisiones bibliográficas.
- Búsqueda de información en espectroscopía Raman para análisis de lípidos: dado un conjunto de documentos relevantes, el modelo produce respuestas contextualizadas con referencias exactas, útil para investigadores que necesitan datos precisos.
- Revisión sistemática de literatura: el pipeline RAG permite extraer afirmaciones con su evidencia correspondiente, reduciendo el riesgo de afirmaciones no fundamentadas en revisiones de gran volumen.
- Generación de respuestas a preguntas de dominio con verificación de citas: en un chatbot especializado, el modelo responde únicamente cuando existe evidencia recuperada, evitando alucinaciones en contextos críticos.
- Anotación de textos científicos: puede ayudar a etiquetar o resumir párrafos de artículos sobre lípidos, siempre que se le proporcione el contexto recuperado.
- Asistente para redacción de artículos con referencias: integrado en un editor, sugiere frases basadas en literatura recuperada y las acompaña de citas automáticas.

## Benchmarks y rendimiento

La model card reporta únicamente perplejidad sobre un conjunto held-out de 2.000 ejemplos:

| Metrica | Valor |
|---|---|
| Perplejidad base (Phi-3.5-mini-instruct) | 4,911 |
| Perplejidad fine-tuned (adaptador) | 3,955 |
| Mejora relativa | 19,5% |

Además, se verificó la supervivencia del grounding de citas tras el fine-tuning: 0/3 citas alucinadas en preguntas reales de dominio y una sonda fuera de dominio. No se publican resultados de benchmarks estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- El adaptador LoRA añade un overhead mínimo (tamaño del repo: 0,1 GB), por lo que los requisitos son los del modelo base Phi-3.5-mini-instruct (3.8B parámetros).
- Con cuantización 4-bit (típica en QLoRA), el modelo base puede ejecutarse en GPUs consumer con 6-8 GB de VRAM, como RTX 3060/3070/4060.
- Para FP16, se necesitan aproximadamente 8-10 GB de VRAM; una RTX 3090 o superior es adecuada.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama (si se fusiona el adaptador), o directamente con Transformers + PEFT.
- La latencia y el throughput dependen del hardware; no se proporcionan cifras oficiales.

## Comparativa con modelos similares

No se dispone de modelos comparables en la información proporcionada. El adaptador se compara directamente con su modelo base, mostrando una mejora en perplejidad. No hay datos de otros adaptadores de dominio científico para lípidos o espectroscopía Raman. Se puede considerar una alternativa a modelos generales como BioGPT o PubMedBERT, pero no se aportan métricas comparativas.

## Limitaciones y advertencias

- El modelo está adaptado exclusivamente a un dominio científico específico; su uso fuera de ese ámbito degrada significativamente el rendimiento.
- No está entrenado para seguir instrucciones; solo para continuación de texto. Intentar usarlo como chat o asistente de instrucciones producirá resultados no deseados.
- Debe usarse obligatoriamente con el pipeline de recuperación y verificación de citas descrito en el repositorio; la generación abierta sin evidencia adjunta está contraindicada.
- El entrenamiento cubrió solo el 60,6% de una época sobre 64.000 abstracts, lo que puede limitar la cobertura del conocimiento del dominio.
- Riesgo de alucinación: aunque la verificación mostró 0/3 alucinaciones, no es una garantía estadística sólida; se recomienda validar las citas generadas.
- Solo soporta inglés; no hay capacidades multilingües.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Phi-3.5-mini-instruct tiene su propia licencia (MIT según Microsoft, aunque debe verificarse). Se recomienda revisar los términos del modelo base antes de un despliegue comercial.

## Enlaces

- HuggingFace (adaptador): https://huggingface.co/srikarjy025/lipidos-phi3-domain-adapt
- HuggingFace (versión fusionada): https://huggingface.co/srikarjy025/lipidos-phi3-domain-adapt-merged
- Repositorio GitHub del proyecto LipidOS: https://github.com/srikarjy/lipidos
- Modelo base: https://huggingface.co/microsoft/Phi-3.5-mini-instruct
- Unsloth (librería de entrenamiento): https://github.com/unslothai/unsloth
