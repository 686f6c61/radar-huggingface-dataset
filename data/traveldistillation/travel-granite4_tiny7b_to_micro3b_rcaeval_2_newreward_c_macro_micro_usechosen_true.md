# TravelDistillation/Travel-granite4_tiny7b_to_micro3b_RCAEval_2_newReward_C_Macro_Micro_usechosen_true

## Resumen

Este repositorio contiene un adaptador LoRA entrenado mediante DPO (Direct Preference Optimization) sobre el modelo base `granite-4.0-h-micro` de IBM. El adaptador forma parte de un experimento de destilación de preferencias desde un modelo mayor (`granite-4.0-h-tiny`, referido en el nombre como "tiny7b") hacia uno menor ("micro3b"), dentro de un pipeline de evaluación denominado RCAEval_2. El autor, TravelDistillation, lo publica bajo la librería PEFT con pesos en safetensors.

El modelo resultante no es un modelo completo, sino un delta de pesos que debe combinarse con el checkpoint base de Granite 4.0 para su uso. Su propósito declarado es la generación de texto conversacional tras un ajuste fino con pares de preferencia, si bien la model card no documenta usos previstos, limitaciones ni datos de evaluación más allá de la configuración automática del entrenador.

La relevancia de esta ficha es acotada: se trata de un artefacto de investigación con cero descargas, sin licencia declarada, sin idiomas especificados y sin resultados de benchmarks. Resulta útil como referencia para quienes sigan técnicas de destilación de preferencias sobre la familia Granite 4.0, pero no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (Mamba-2 + atención) según la familia Granite 4.0; el adaptador es LoRA sobre `granite-4.0-h-micro` |
| Parametros totales | No disponible (el adaptador LoRA no declara recuento; el repo ocupa 6,4 GB) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible en la información proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | No disponible (pesos del adaptador en safetensors; no se publican GGUF ni cuantizaciones) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `granite-4.0-h-micro`, un modelo de la familia Granite 4.0 de IBM cuya nomenclatura "h" indica arquitectura híbrida (combinación de capas Mamba-2 y capas de atención). El tag `granitemoehybrid` sugiere además componentes de mezcla de expertos en el diseño de la familia, aunque la información proporcionada no detalla el recuento de parámetros ni la proporción de expertos activos.

El entrenamiento consiste en un ajuste DPO con LoRA: learning rate 5e-05, batch total de 8 (batch 1 × acumulación 8), optimizador AdamW con betas (0,9, 0,999), scheduler coseno con warmup del 10 %, una única época y semilla 42. Se usó el dataset `data/preference_pairs_RCAEval_2_granite-4.0-h-micro_to_granite-4.0-h-tiny`, que contiene pares de preferencia generados en el marco de evaluación RCAEval_2. El nombre del repositorio indica que se empleó la respuesta elegida (`usechosen_true`) y una recompensa compuesta macro/micro. Las versiones de framework son PEFT 0.21.2, Transformers 5.19.0, PyTorch 2.13.0+cu132, Datasets 5.1.0 y Tokenizers 0.23.3. No se documenta el volumen de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es `text-generation` y el tag `conversational` indica formato de diálogo.
- Ajuste por preferencias: el adaptador está optimizado para alinear respuestas con pares elegidos/rechazados en el marco RCAEval_2.
- Herencia de capacidades del modelo base: al ser un adaptador LoRA sobre Granite 4.0, conserva las capacidades del checkpoint base (razonamiento, código, matemáticas, tool calling), aunque no se documentan explícitamente.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (thinking mode, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Investigación en destilación de preferencias: el adaptador sirve como artefacto reproducible para estudiar cómo un modelo "tiny" transfiere preferencias a un modelo "micro" mediante DPO; se cargaría con PEFT sobre el base y se compararía con el original.
- Evaluación de pipelines RCAEval: útil para replicar el protocolo de evaluación RCAEval_2 con recompensa compuesta macro/micro y comprobar la estabilidad del ajuste.
- Baseline para ablaciones de hiperparámetros: al estar documentada la configuración exacta (LR, batch, epochs, scheduler), permite reproducir y variar condiciones controladamente.
- Generación de texto en entornos de laboratorio: puede emplearse para generar respuestas conversacionales en pruebas internas, siempre que se acepte la ausencia de garantías de calidad.
- Estudio de sensibilidad a la semilla y a la selección de respuestas: el sufijo `usechosen_true` permite comparar contra variantes que usen respuestas rechazadas o mixtas.
- Docencia y formación: ejemplo práctico de entrenamiento DPO con TRL y PEFT sobre una arquitectura híbrida, útil en cursos de ajuste fino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El `model-index` del autor declara una entrada con la lista `results` vacía, por lo que no existen métricas verificables (MMLU, HumanEval, GSM8K u otras) asociadas a este adaptador.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador aislado; depende del modelo base `granite-4.0-h-micro` y de la cuantización elegida, que no se documenta.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible; el repo ocupa 6,4 GB, lo que sugiere pesos del adaptador en precisión alta, pero no permite inferir requisitos del modelo combinado.
- Opciones de despliegue: PEFT + Transformers (según la librería declarada); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Travel-granite4_tiny7b_to_micro3b_RCAEval_2 | Adaptador LoRA (DPO) sobre Granite 4.0 h-micro | No disponible | No disponible | No disponible | Hugging Face, 0 descargas |
| granite-4.0-h-micro (base) | Modelo completo híbrido | No disponible en la información | No disponible | No disponible en la información | Hugging Face (IBM) |
| granite-4.0-h-tiny (referencia de destilación) | Modelo completo híbrido | No disponible en la información | No disponible | No disponible en la información | Hugging Face (IBM) |

No se dispone de datos de rendimiento comparables entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere cargar el base `granite-4.0-h-micro` y aplicar el adaptador PEFT; no puede usarse de forma independiente.
- Licencia no declarada: no se especifica si permite uso comercial; debe consultarse la licencia del modelo base de IBM antes de cualquier despliegue.
- Idiomas no declarados: se desconoce la cobertura lingüística efectiva tras el ajuste.
- Sin benchmarks ni evaluación publicada: no hay evidencia cuantitativa de mejora frente al base ni de degradación.
- Riesgo de alucinación: inherente a los modelos generativos; no se documentan mitigaciones específicas.
- Sesgos: no se documentan sesgos conocidos ni análisis de alineación más allá del DPO aplicado.
- Dataset de preferencias específico de RCAEval_2: el ajuste puede sobreajustarse al dominio de evaluación y no generalizar a otros contextos.
- Una sola época con batch efectivo de 8: la señal de entrenamiento es limitada y la reproducibilidad depende de la semilla 42.
- Cero descargas y cero likes: no hay validación comunitaria ni reportes de uso.
- Fecha de creación futura (2026-11-23): conviene verificar la integridad y procedencia del repositorio antes de confiar en él.

## Enlaces

- Hugging Face: https://huggingface.co/TravelDistillation/Travel-granite4_tiny7b_to_micro3b_RCAEval_2_newReward_C_Macro_Micro_usechosen_true
- Modelo base referenciado: https://huggingface.co/models/granite-4.0-h-micro
- Dataset referenciado: `data/preference_pairs_RCAEval_2_granite-4.0-h-micro_to_granite-4.0-h-tiny` (no se proporciona URL directa)
- PEFT: https://github.com/huggingface/peft
- TRL: https://github.com/huggingface/trl
- Paper de DPO: https://arxiv.org/abs/2305.18290
- Familia Granite de IBM: https://www.ibm.com/granite
