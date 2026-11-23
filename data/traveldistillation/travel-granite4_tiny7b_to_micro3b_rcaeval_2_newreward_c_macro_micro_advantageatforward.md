# TravelDistillation/Travel-granite4_tiny7b_to_micro3b_RCAEval_2_newReward_C_Macro_Micro_AdvantageAtForward

## Resumen

Este repositorio contiene un adaptador LoRA entrenado mediante DPO (Direct Preference Optimization) sobre el modelo base IBM Granite 4.0 H Micro. Lo publica el usuario TravelDistillation como parte de un experimento de destilación de preferencias entre variantes de la familia Granite 4.0 (de la versión "tiny 7B" a la "micro 3B"). No es un modelo completo, sino un conjunto de pesos delta (adaptador PEFT) que debe cargarse junto al modelo base para funcionar.

El adaptador se ha entrenado sobre un dataset de pares de preferencia denominado `preference_pairs_RCAEval_2_granite-4.0-h-micro_to_granite-4.0-h-tiny`, orientado aparentemente a tareas de análisis de causa raíz (RCA, por sus siglas en inglés) con una función de recompensa personalizada que combina métricas macro y micro, y con la ventaja calculada en el paso forward. El nombre del repositorio refleja esa configuración experimental.

La relevancia es limitada y muy específica: se trata de un artefacto de investigación con cero descargas y cero likes en el momento de la consulta, sin model card sustantiva (la mayoría de secciones dicen "More information needed") y sin resultados de benchmarks publicados. Resulta útil únicamente como referencia para quienes investiguen técnicas de destilación de preferencias o ajusten modelos Granite 4.0 en dominios de diagnóstico técnico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer híbrido (Granite MoE Hybrid); el adaptador en sí es PEFT |
| Parametros totales | no disponible (el adaptador LoRA es un subconjunto; el modelo base Granite 4.0 H Micro no especifica cifra en la información proporcionada) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; el base admitiría cuantización, pero no se documenta) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre IBM Granite 4.0 H Micro, un modelo de la familia Granite 4.0 con arquitectura híbrida Mamba-2/Transformer y diseño MoE (la etiqueta `granitemoehybrid` así lo indica). El adaptador en sí es un LoRA entrenado con TRL y PEFT 0.21.3, por lo que solo modifica un subconjunto de matrices de proyección del modelo base; el resto de pesos permanece congelado.

El entrenamiento emplea DPO con los siguientes hiperparámetros: learning rate 5e-5, batch size efectivo 8 (batch 1 con 8 pasos de acumulación de gradiente), optimizador AdamW con betas (0.9, 0.999) y epsilon 1e-8, scheduler coseno con 10 % de warmup, una sola época y semilla 42. El dataset de preferencias se generó a partir de pares de respuestas entre Granite 4.0 H Micro y Granite 4.0 H Tiny sobre la evaluación RCAEval_2, con una función de recompensa que combina métricas macro y micro y calcula la ventaja en el paso forward (`AdvantageAtForward`). No se documenta el número de tokens de entrenamiento ni la composición detallada del dataset.

## Capacidades

- Generación de texto conversacional en formato chat (pipeline `text-generation`, etiqueta `conversational`).
- Razonamiento orientado a diagnóstico de causa raíz (RCA) en el dominio del dataset de preferencias empleado.
- Ajuste fino de preferencias sobre el modelo base: hereda las capacidades del Granite 4.0 H Micro subyacente, aunque no se documentan explícitamente.
- Soporte de tool calling / function calling: no disponible en la información proporcionada (dependería del modelo base, no verificado).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Investigación en destilación de preferencias: el adaptador sirve como referencia reproducible de un pipeline DPO entre dos variantes de tamaño distinto de Granite 4.0, útil para comparar estrategias de recompensa macro/micro.
- Diagnóstico automatizado de causa raíz en sistemas: dado que el dataset de entrenamiento se centra en RCAEval_2, el adaptador puede emplearse para generar hipótesis de causa raíz en incidentes técnicos, siempre validando las respuestas con el modelo base y con revisión humana.
- Experimentación con funciones de recompensa personalizadas: permite reproducir la configuración `AdvantageAtForward` y comparar su efecto frente a DPO estándar en tareas de análisis.
- Base para ajustes posteriores: al ser un adaptador LoRA ligero (6,4 GB en el repo), puede combinarse con otros adaptadores o servir de punto de partida para fine-tuning adicional sobre Granite 4.0 H Micro.
- Evaluación comparativa de modelos pequeños en tareas de razonamiento técnico: útil para medir la brecha entre Granite 4.0 H Micro y H Tiny en escenarios de diagnóstico.
- Prototipado de asistentes de operaciones (SRE/DevOps): con validación estricta, podría integrarse en flujos internos de análisis de incidentes, aunque la falta de benchmarks y de licencia clara lo hace inadecuado para producción sin evaluación previa.

## Benchmarks y rendimiento

El model-index del autor declara una entrada con la lista de resultados vacía:

| Benchmark | Resultado |
|---|---|
| (ninguno declarado) | sin datos |

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador aislado; depende del modelo base Granite 4.0 H Micro y de la cuantización elegida (no documentada).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el tamaño del repo (6,4 GB) corresponde al adaptador y a artefactos de entrenamiento, no al modelo completo.
- Opciones de despliegue: carga mediante `peft` + `transformers` (versiones de referencia: PEFT 0.21.3, Transformers 5.19.0, PyTorch 2.13.0+cu132); otras opciones (vLLM, llama.cpp, Ollama, TGI) no están documentadas para este adaptador.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Travel-granite4_tiny7b_to_micro3b_RCAEval_2 (este) | Adaptador LoRA DPO sobre Granite 4.0 H Micro | no disponible | no disponible | no disponible | Hugging Face (0 descargas) |
| IBM Granite 4.0 H Micro (base) | Modelo completo híbrido MoE | no disponible en la información | no disponible | no disponible en la información | Hugging Face |
| IBM Granite 4.0 H Tiny | Modelo completo híbrido MoE | no disponible en la información | no disponible | no disponible en la información | Hugging Face |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Model card prácticamente vacía: las secciones de descripción, usos previstos, datos y resultados dicen "More information needed"; no hay garantías documentadas sobre el comportamiento del adaptador.
- Licencia no especificada: no se puede confirmar el uso comercial; hay que verificar la licencia del modelo base Granite 4.0 H Micro por separado antes de cualquier despliegue.
- Sin benchmarks ni métricas de evaluación publicadas: no hay evidencia cuantitativa de mejora frente al modelo base.
- Artefacto de investigación con cero descargas y cero likes: no ha sido validado por la comunidad.
- Riesgo de alucinación: inherente a los modelos de lenguaje; en tareas de RCA el riesgo es especialmente alto porque las hipótesis de causa raíz incorrectas pueden derivar en acciones erróneas.
- Sesgos: no documentados; se heredan los del dataset de preferencias y del modelo base.
- Idiomas y contexto: no documentados; no se debe asumir soporte multilingüe ni una ventana de contexto concreta sin verificar el modelo base.
- Dependencia estricta del modelo base: el adaptador no funciona de forma autónoma y requiere cargar `models/granite-4.0-h-micro` con la versión de PEFT/Transformers indicada.
- Entrenamiento de una sola época con batch efectivo 8: la señal de preferencia puede ser débil o inestable; conviene evaluar antes de usar en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/TravelDistillation/Travel-granite4_tiny7b_to_micro3b_RCAEval_2_newReward_C_Macro_Micro_AdvantageAtForward
- Modelo base (referenciado en la model card): https://huggingface.co/models/granite-4.0-h-micro
- Dataset de preferencias (referenciado): data/preference_pairs_RCAEval_2_granite-4.0-h-micro_to_granite-4.0-h-tiny (sin URL pública en la información proporcionada)
- Paper, blog, repositorio de código o demo: no disponible
