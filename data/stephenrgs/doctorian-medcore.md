# StephenRGS/Doctorian-MedCore

## Resumen

Doctorian-MedCore es un modelo de lenguaje publicado por el usuario StephenRGS en HuggingFace, presentado como un ajuste fino orientado al dominio médico y construido sobre `google/gemma-4-31B-it` como modelo base, con `mistralai/Mistral-Large-4-1T-A52B` declarado como versión nueva en los metadatos. La model card es extremadamente escueta: no incluye descripción del modelo, detalles de entrenamiento, resultados de evaluación ni instrucciones de uso, por lo que la mayor parte de la información técnica debe inferirse de los metadatos y de la lista de datasets declarados.

El modelo se distribuye con licencia Apache 2.0 y declara soporte para once idiomas (inglés, suajili, afrikáans, francés, chino, español, coreano, latín, gaélico escocés, griego e igbo), lo que sugiere un interés por cobertura multilingüe amplia, incluyendo lenguas de bajos recursos. La lista de datasets de entrenamiento mezcla corpus médicos (informes de diagnóstico por imagen, VQA médica en turco, conversaciones médico-paciente), datos de razonamiento (GSM8K, Magpie Reasoning), ciberseguridad, documentos gubernamentales y corpus web generalistas como FineWeb-Edu.

Es relevante ahora porque se presenta como un modelo de dominio médico con capacidades de razonamiento y multilingüismo, pero su estado de publicación (cero descargas, cero likes, sin pipeline declarado y sin model card sustantiva) implica que cualquier evaluación debe hacerse con cautela y verificación empírica propia antes de considerarlo para uso real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de google/gemma-4-31B-it; detalles no disponibles) |
| Parametros totales | no disponible (el nombre del base sugiere ~31B; no confirmado para este ajuste) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican pesos GGUF ni AWQ/GPTQ en la informacion disponible) |
| Idiomas soportados | en, sw, af, fr, zh, es, ko, la, gd, el, ig |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (libreria declarada: transformers) |

## Arquitectura y entrenamiento

No se publica información sobre la arquitectura interna del ajuste. Los metadatos indican que parte de `google/gemma-4-31B-it`, un modelo transformer denso de la familia Gemma, y que existe una referencia a `mistralai/Mistral-Large-4-1T-A52B` como `new_version`, lo que podría indicar una migración prevista o una confusión en los metadatos del autor; no es posible confirmar si el modelo publicado corresponde realmente a uno u otro base. Tampoco se especifican parámetros totales, longitud de contexto, tokenizador ni configuración de atención.

Respecto al entrenamiento, la model card únicamente enumera veinte datasets, sin indicar número de tokens, proporciones, metodología (SFT, DPO, RLHF) ni hiperparámetros. La composición mezcla datos médicos (informes de imagen diagnóstica, VQA médica, conversaciones médico-paciente sobre enfermedades humanas), razonamiento (GSM8K, Magpie Reasoning, Fable-5.1-Max-Reasoning), ciberseguridad (dos datasets), documentos gubernamentales indios, corpus de verificación de afirmaciones RAG, trazas agénticas y corpus web educativo (FineWeb-Edu). No se documenta ninguna innovación técnica específica (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de texto en once idiomas declarados, con especial énfasis en inglés y cobertura de lenguas de bajos recursos (suajili, afrikáans, igbo, gaélico escocés, latín, griego).
- Orientación al dominio médico: los datasets incluyen informes de diagnóstico por imagen, VQA médica y conversaciones médico-paciente, lo que sugiere capacidad para terminología clínica y razonamiento sobre casos.
- Razonamiento paso a paso: la inclusión de `LangAGI-Lab/magpie-reasoning-v1-10k-step-by-step-rationale` y `MoreThought/Fable-5.1-Max-Reasoning-Filtered-10000x` apunta a entrenamiento en cadenas de razonamiento explícitas.
- Razonamiento matemático: presencia de `openai/gsm8k` en el conjunto de entrenamiento.
- Conocimiento en ciberseguridad: dos datasets específicos del dominio.
- Verificación de afirmaciones y RAG: dataset `MaziyarPanahi/Jev-RAG-Claim-Verification-130K`.
- Capacidades agénticas: trazas de `harvardMadsys/freeinference_agentic_trace` y `LocalLLaMA/typed-decisions` sugieren entrenamiento en decisiones estructuradas y flujos multi-paso.
- Soporte de tool calling / function calling: no disponible (no declarado).
- Capacidades de visión: no confirmadas; aunque se listan datasets de VQA médica e imagen diagnóstica, no se declara arquitectura multimodal ni pipeline image-text.
- Modo thinking explícito: no disponible (no declarado).

## Casos de uso

- Asistencia clínica documental: el modelo puede redactar y resumir informes médicos a partir de notas o hallazgos, apoyándose en el entrenamiento sobre informes de diagnóstico por imagen y conversaciones médico-paciente; requiere supervisión humana obligatoria por tratarse de dominio sanitario.
- Triaje conversacional multilingüe: gracias a la cobertura de once idiomas, puede gestionar primeras interacciones con pacientes en inglés, francés, español, suajili o afrikáans, derivando a personal sanitario cuando corresponda.
- Educación médica y simulación: generación de casos clínicos sintéticos y preguntas de razonamiento paso a paso, aprovechando los datasets de razonamiento y conversaciones médico-paciente.
- Verificación de afirmaciones en pipelines RAG sanitarios: el entrenamiento con `Jev-RAG-Claim-Verification-130K` lo hace candidato para comprobar la fidelidad de respuestas generadas frente a fuentes documentales en sistemas de recuperación aumentada.
- Análisis asistido en ciberseguridad: clasificación y explicación de incidentes o alertas, apoyándose en los datasets de ciberseguridad incluidos en el entrenamiento.
- Procesamiento de documentación administrativa: extracción y resumen de documentos gubernamentales, dado el dataset `ankitjh4/bharat-government-documents`.
- Razonamiento matemático aplicado: resolución de problemas cuantitativos en contextos educativos o financieros, con la cautela de que GSM8K es un benchmark de dificultad moderada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara métricas (`accuracy`, `google_bleu`, `responsible-ai-labs/rail_score`, `Vickyage/accents_unplugged_eval`) pero no incluye valores numéricos ni protocolo de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; si el modelo conserva el tamaño del base (~31B parámetros), en FP16 requeriría del orden de 62 GB de VRAM, en 8 bits ~31 GB y en 4 bits ~16-18 GB, estimaciones teóricas no verificadas para este ajuste concreto.
- GPU recomendadas: para un modelo de esa escala, A100 80GB, H100 80GB o múltiples RTX 4090/A6000; no confirmado por el autor.
- Cabe en GPU de consumo: probablemente solo con cuantización agresiva (4 bits) en GPUs de 24 GB, sujeto a verificación; no se publican pesos cuantizados.
- Opciones de despliegue: la librería declarada es `transformers`; no se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI, ni existen pesos GGUF publicados.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Doctorian-MedCore | no disponible (~31B por base declarado) | no disponible | Apache 2.0 | HuggingFace, sin pesos cuantizados | Sin benchmarks ni model card sustantiva |
| google/gemma-4-31B-it | ~31B (según nombre) | no disponible en esta ficha | Términos Gemma (no Apache 2.0) | HuggingFace, ampliamente adoptado | Modelo base oficial de Google |
| mistralai/Mistral-Large-4-1T-A52B | 1T totales / 52B activos (según nombre) | no disponible en esta ficha | no disponible en esta ficha | HuggingFace | Referenciado como `new_version` en los metadatos |

La comparación cuantitativa de rendimiento no es posible: no hay benchmarks publicados para Doctorian-MedCore ni datos verificados de los modelos de referencia en la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de model card descriptiva: no hay información sobre metodología de entrenamiento, evaluación ni uso previsto, lo que impide auditar el modelo.
- Riesgo elevado de alucinación en dominio médico: cualquier salida debe tratarse como no fiable sin validación por profesionales sanitarios; no debe usarse para diagnóstico ni decisiones clínicas.
- Posible contaminación de benchmarks: la inclusión de GSM8K en el entrenamiento invalida cualquier evaluación sobre ese conjunto como medida de capacidad matemática general.
- Mezcla heterogénea de datasets (ciberseguridad, documentos gubernamentales, jailbreak prompts, trazas agénticas) sin documentar proporciones: riesgo de comportamientos no deseados o de sesgos difíciles de caracterizar.
- Inconsistencia en metadatos: se declaran dos modelos base distintos y una `new_version` que no coincide con el base de ajuste; la procedencia real del modelo no está clara.
- Licencia Apache 2.0 declarada, pero al derivar de Gemma podría existir conflicto con los términos de uso de Google; conviene verificar la cadena de licencias antes de uso comercial.
- Idiomas declarados sin evidencia de calidad: la cobertura de once idiomas no está respaldada por evaluaciones publicadas.
- Estado de publicación incipiente: cero descargas y cero likes en el momento de la consulta, sin comunidad que haya validado el modelo.
- No se publican pesos cuantizados ni confirmación de compatibilidad con motores de inferencia habituales, lo que complica el despliegue en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/StephenRGS/Doctorian-MedCore
- Modelo base declarado: https://huggingface.co/google/gemma-4-31B-it
- Versión nueva declarada: https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B
