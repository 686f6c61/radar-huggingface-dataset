# steveny6/bald-word-lfm2.5-2.6b-benign

## Resumen

`steveny6/bald-word-lfm2.5-2.6b-benign` es un adaptador LoRA (PEFT) publicado por el usuario steveny6 sobre el modelo base `LiquidAI/LFM2.5-2.6B`. Por las etiquetas del repositorio (`backdoor`, `research`, `autonomous-driving`, `bald`) y la referencia al paper arXiv:2405.20774, se trata de un artefacto de investigación orientado al estudio de puertas traseras (backdoors) en modelos de lenguaje, en este caso con un disparador asociado a la palabra "bald" y en el contexto de conducción autónoma. La variante se denomina "benign", lo que sugiere que forma parte de un conjunto de experimentos comparativos (posiblemente un adaptador de control frente a una versión con backdoor activo).

El modelo base LFM2.5-2.6B pertenece a la familia LFM2 de Liquid AI, una arquitectura híbrida (convolutional + attention) diseñada para inferencia eficiente en dispositivo. El adaptador añade un conjunto reducido de pesos LoRA sobre ese modelo, por lo que hereda sus capacidades generales de generación de texto y conversación, con el matiz conductual introducido por el fine-tuning específico del experimento.

Es relevante ahora porque ejemplifica la línea de trabajo sobre seguridad de modelos (model backdoor detection and mitigation) y porque el repositorio está restringido (gated), lo que obliga a aceptar condiciones antes de descargarlo. No está pensado como modelo de producción: es un artefacto de investigación reproducible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer híbrido LFM2.5-2.6B (modelo base) |
| Parametros totales | No disponible para el adaptador; el modelo base es de 2.6B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | No disponible (el repositorio contiene solo pesos LoRA en safetensors) |
| Idiomas soportados | No disponible |
| Licencia | lfm1.0 (etiquetada como `license:other`) |
| Formato de pesos | safetensors (adaptador LoRA PEFT) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA entrenado con la librería PEFT sobre `LiquidAI/LFM2.5-2.6B`. No se publican en la información disponible detalles sobre el número de tokens de entrenamiento, la composición del dataset, el rango del adaptador ni si se aplicaron técnicas de alineación (RLHF/DPO). El nombre y las etiquetas (`backdoor`, `bald`, `autonomous-driving`, `research`) apuntan a un experimento de inyección de comportamiento condicionado por un disparador léxico, enmarcado en el paper arXiv:2405.20774.

La etiqueta "benign" sugiere que este adaptador actúa como contraparte de control (sin backdoor activo o con comportamiento neutro) dentro de un estudio comparativo. No se dispone de información sobre la innovación técnica del entrenamiento más allá del uso de LoRA sobre el modelo base.

## Capacidades

- Generación de texto y conversación: hereda las capacidades del modelo base LFM2.5-2.6B.
- Fine-tuning específico orientado a un dominio de conducción autónoma (según etiquetas del repositorio), sin datos públicos sobre el alcance real.
- Artefacto de investigación para estudiar comportamiento condicionado por disparadores (trigger words) y su detección.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Investigación en seguridad de modelos: servir como adaptador de control ("benign") en experimentos que comparan modelos con y sin puerta trasera, permitiendo aislar el efecto del disparador.
- Evaluación de técnicas de detección de backdoors: usar el adaptador como muestra negativa en pipelines de análisis de pesos y activaciones.
- Reproducibilidad de experimentos académicos: permite replicar los resultados del estudio asociado (arXiv:2405.20774) sobre el modelo base LFM2.5-2.6B.
- Estudio de robustez frente a trigger words: analizar cómo responde el modelo a entradas que contienen el disparador "bald" en comparación con el adaptador con backdoor.
- Docencia y formación en seguridad de IA: ejemplo práctico de cómo se construye y se etiqueta un artefacto LoRA con fines de investigación.
- Benchmarking de herramientas de escaneo de modelos (model scanning): validar detectores de pesos maliciosos o anómalos usando este adaptador como referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA en sí ocupa muy poco (repo de 0.1 GB); los requisitos reales vienen del modelo base LFM2.5-2.6B.
- GPU recomendadas: no disponible de forma específica; para un modelo de 2.6B en fp16 se estiman en torno a 5-6 GB de VRAM, por lo que cabría en GPUs consumer tipo RTX 3060 12 GB, RTX 4070, RTX 4090.
- Cabe en GPU consumer: sí, previsiblemente, dado el tamaño del modelo base (no confirmado en la información proporcionada).
- Opciones de despliegue: PEFT + Transformers (carga del adaptador sobre el modelo base); vLLM, llama.cpp, Ollama o TGI no están confirmados para este adaptador.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| steveny6/bald-word-lfm2.5-2.6b-benign | LoRA sobre 2.6B | No disponible | lfm1.0 | Gated en HuggingFace | Adaptador de investigación (control benigno) |
| LiquidAI/LFM2.5-2.6B | 2.6B | No disponible | lfm1.0 | Público | Modelo base sin adaptador |
| Adaptadores LoRA de investigación comparables | No disponible | No disponible | Variable | Variable | No se dispone de alternativas concretas en la información proporcionada |

## Limitaciones y advertencias

- Artefacto de investigación: no está validado para uso en producción ni para aplicaciones reales.
- Riesgo de comportamiento condicionado: al estar asociado a un estudio de backdoors, su comportamiento puede diferir del modelo base de forma no documentada.
- Sesgos: no disponibles; hereda los del modelo base, no evaluados aquí.
- Riesgo de alucinación: no evaluado en la información proporcionada.
- Limitaciones de contexto e idioma: no documentadas.
- Licencia `lfm1.0` (etiquetada como `other`): es necesario revisar los términos antes de cualquier uso comercial; el acceso está restringido y requiere aceptar condiciones en HuggingFace.
- El repositorio tiene muy pocas descargas (22) y ningún "like", lo que indica escasa validación por parte de la comunidad.
- No se debe asumir que el adaptador "benign" carece de efectos secundarios; conviene auditarlo antes de cualquier uso.

## Enlaces

- HuggingFace: https://huggingface.co/steveny6/bald-word-lfm2.5-2.6b-benign
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-2.6B
- Paper de referencia: https://arxiv.org/abs/2405.20774
