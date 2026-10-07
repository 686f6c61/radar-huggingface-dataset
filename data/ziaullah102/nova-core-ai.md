# Ziaullah102/Nova-Core-AI

## Resumen

Nova-Core-AI es un ajuste fino (finetune) del modelo Qwen2.5-7B-Instruct publicado por el usuario Ziaullah102 en HuggingFace. Se trata de un derivado de la versión cuantizada a 4 bits con bitsandbytes de Qwen2.5-7B-Instruct, que a su vez es un transformer decoder-only de aproximadamente 7.600 millones de parámetros desarrollado por Alibaba Qwen. El repositorio tiene un tamaño de 0,2 GB, lo que sugiere que los pesos publicados podrían corresponder a una variante cuantizada o a un subconjunto del modelo, aunque la model card no aclara este punto.

El modelo se entrenó con Unsloth, una librería de ajuste fino optimizada que, según la propia model card, permite entrenar "2x más rápido" que los flujos estándar. No se documenta el dataset de entrenamiento, el número de tokens, ni si hubo fases de RLHF o DPO posteriores. La información pública disponible es extremadamente limitada: cero descargas, cero likes y una model card generada automáticamente por la plantilla de Unsloth.

Por su relevancia, conviene tratarlo como un experimento de ajuste fino de perfil bajo más que como un modelo listo para producción. Hereda del base Qwen2.5-7B-Instruct una arquitectura sólida y una licencia Apache 2.0 permisiva, pero la ausencia de benchmarks, de documentación de datos y de casos de uso verificados limita seriamente su evaluación objetiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2 / Qwen2.5); no confirmada explícitamente en la model card |
| Parametros totales | ~7.600 millones (heredado del base Qwen2.5-7B-Instruct; no confirmado en la model card del finetune) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 131.072 tokens en el base Qwen2.5-7B-Instruct; no confirmado en la model card del finetune |
| Tipos de cuantizacion | El ajuste se realizó sobre una base bnb-4bit; el artefacto publicado está en safetensors. No se documentan variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | en (inglés) según la model card; el base Qwen2.5 soporta 29 idiomas |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen2.5, una familia de transformers decoder-only con atención causal estándar, normalización RMSNorm, activación SwiGLU y uso de rotary position embeddings (RoPE). Qwen2.5-7B-Instruct emplea además técnicas de escalado de contexto para alcanzar ventanas largas. No se ha publicado ninguna innovación arquitectónica específica para Nova-Core-AI: es un ajuste fino sobre el modelo base, no una arquitectura nueva.

En cuanto al entrenamiento, la model card indica únicamente que se utilizó Unsloth sobre `unsloth/Qwen2.5-7B-Instruct-bnb-4bit`. No se especifica el número de tokens de entrenamiento, la composición del dataset, la duración del ajuste, ni si se aplicaron fases de alineación como RLHF, DPO o PPO. Tampoco se detalla el rango LoRA, la tasa de aprendizaje ni otros hiperparámetros. Toda esta información aparece como **no disponible**.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del base Qwen2.5-7B-Instruct.
- Razonamiento y matemáticas básicas, según las capacidades del modelo base (no verificadas en el finetune).
- Generación de código, heredada del base (no verificada en el finetune).
- Soporte de tool calling y function calling, presumiblemente heredado del base Qwen2.5-Instruct; no confirmado en la model card.
- Capacidades multilingües del base (29 idiomas), aunque la model card del finetune declara únicamente inglés.
- No se documenta ningún modo de razonamiento explícito (thinking mode), visión, audio ni otras capacidades especiales.

## Casos de uso

- Experimentación académica con ajuste fino: sirve como referencia de un finetune ligero realizado con Unsloth sobre una base cuantizada a 4 bits, útil para reproducir flujos de trabajo de bajo coste.
- Prototipado rápido de asistentes conversacionales en inglés: el modelo puede desplegarse para validar interfaces de chat antes de invertir en un modelo mejor documentado.
- Pruebas de pipelines de text-generation-inference: al estar etiquetado como compatible con TGI y endpoints, puede emplearse para verificar infraestructura de servicio.
- Generación de texto en inglés como tarea auxiliar: resúmenes, reescritura o clasificación básica, siempre que se valide la calidad empíricamente.
- Base para nuevos ajustes finos: al ser un derivado Apache 2.0, puede servir como punto de partida para experimentos posteriores.
- Evaluación comparativa interna: útil como baseline de bajo perfil frente a Qwen2.5-7B-Instruct original para medir el impacto del ajuste con Unsloth.

Ninguno de estos casos está respaldado por benchmarks publicados; se plantean como escenarios plausibles dada la naturaleza del modelo, no como aplicaciones verificadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación, y la búsqueda web no ha devuelto datos técnicos relevantes sobre el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (sobre ~7.600 millones de parámetros): aproximadamente 15-16 GB en FP16/BF16, unos 8-9 GB en cuantización de 8 bits y 4-5 GB en cuantización de 4 bits.
- GPU recomendadas para FP16: NVIDIA A100 40 GB, H100, L40S, RTX A6000.
- GPU de consumo: cabe en RTX 4090 (24 GB) en FP16 y en RTX 3090/4080 (16 GB) con cuantización de 8 bits; en 4 bits puede ejecutarse en GPUs de 8 GB como RTX 3070 o RTX 4060.
- Opciones de despliegue: vLLM, Text Generation Inference (TGI), llama.cpp y Ollama, siempre que se generen las conversiones oportunas (el repo solo publica safetensors).
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Nova-Core-AI (Ziaullah102) | ~7,6B (heredado) | 131.072 tokens (heredado, no confirmado) | Apache 2.0 | HuggingFace, 0 descargas |
| Qwen2.5-7B-Instruct (Alibaba) | 7,6B | 131.072 tokens | Apache 2.0 (salvo 3B y 72B) | HuggingFace, ampliamente usado |
| Mistral-7B-Instruct-v0.3 | 7,2B | 32.768 tokens | Apache 2.0 | HuggingFace, muy extendido |
| Llama-3.1-8B-Instruct | 8B | 128.000 tokens | Llama 3.1 Community License | HuggingFace, muy extendido |

No hay datos de rendimiento publicados para Nova-Core-AI que permitan compararlo empíricamente con estas alternativas.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay ninguna métrica que permita evaluar la calidad del ajuste ni compararlo con el base.
- Documentación mínima: no se describe el dataset, los hiperparámetros ni el objetivo del finetune, lo que impide auditar el modelo.
- Riesgo de alucinación: inherente a los modelos de lenguaje de esta escala; no hay evaluación específica en este caso.
- Sesgos potenciales: no se documenta ningún análisis de sesgos ni de seguridad.
- Idiomas: la model card declara únicamente inglés, aunque el base soporta 29 idiomas; no está claro si las capacidades multilingües se conservan tras el ajuste.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero el usuario debe verificar las obligaciones de atribución y que el modelo base cumpla la misma licencia.
- Tamaño del repositorio: 0,2 GB resulta pequeño para un modelo de ~7,6B parámetros en FP16, lo que sugiere que los pesos publicados pueden estar cuantizados o incompletos; conviene verificarlo antes de cualquier uso.
- Idoneidad para producción: sin datos de evaluación, no se recomienda su uso en sistemas críticos.
- Resultados de búsqueda web: las consultas realizadas no devolvieron información técnica relevante sobre el modelo; los enlaces obtenidos no guardan relación con el mismo y se han omitido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ziaullah102/Nova-Core-AI
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth

No se han encontrado papers, blogs ni demos adicionales asociados a este modelo en la información disponible.
