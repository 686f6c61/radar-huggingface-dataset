# Yooniel/gemma-3-12b-it-nla-L40-wildchat

## Resumen

El modelo `Yooniel/gemma-3-12b-it-nla-L40-wildchat` es un *natural language autoencoder* (NLA) para el modelo base `google/gemma-3-12b-it`, desarrollado por Yooniel. Se trata de una continuación de `achand45/gemma-3-12b-it-nla-L40`, que a su vez es un adaptador LoRA (r=128, rsLoRA) sobre la capa 40 del modelo Gemma 3 de 12B. Este modelo no es un modelo generativo de chat: su función es reconstruir activaciones internas del block 40 en forma de texto natural, y ha sido adaptado de activaciones de texto web a activaciones conversacionales mediante 400 pasos adicionales de entrenamiento on-policy con GRPO sobre el dataset WildChat-1M.

Su relevancia radica en que cuantifica el fenómeno de transferencia de distribución: las activaciones de chat son diferentes de las de texto web, y el modelo padre pierde alrededor de 13 puntos porcentuales de fracción de varianza explicada (FVE) al pasar de FineFineWeb a WildChat. Tras la adaptación, este modelo recupera +7.8 puntos, superando ligeramente la mitad de la brecha. Además, forma parte de un estudio de tres profundidades (blocks 24, 32 y 40) que permite comparar cómo varía la capacidad de reconstrucción según la capa del modelo.

El repositorio en HuggingFace pesa 57.4 GB y contiene adaptadores PEFT en formato safetensors. La licencia es Gemma. Los idiomas soportados y la longitud de contexto no se especifican en la información disponible, aunque dependen del modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Natural language autoencoder (NLA) sobre transformer (gemma-3-12b-it), con adaptadores LoRA (r=128, rsLoRA) |
| Parametros totales | no disponible (adaptador PEFT; el modelo base es google/gemma-3-12b-it) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Gemma |
| Formato de pesos | safetensors (adaptadores PEFT) |

## Arquitectura y entrenamiento

El modelo se basa en un *natural language autoencoder* que reconstruye activaciones ocultas del modelo base `google/gemma-3-12b-it` en un espacio de lenguaje natural. El adaptador está situado en la salida del block 40 de 48 bloques, correspondiente a `hidden_states[41]` según HuggingFace. La dimensión del modelo en esa capa es `d_model = 3840`, y el autoencoder tiene una profundidad AR de 41 capas con la RMSNorm final eliminada. La normalización se realiza en modo *raw* (`norm: none`), y la pérdida reescala cada fila a norma L2 de √3840 = 61.9677, por lo que la FVE mide únicamente la dirección de las activaciones, no su magnitud.

El entrenamiento continúa desde el checkpoint `rl_vllm/iter_000400` del modelo padre. Se ejecutaron 400 pasos adicionales de GRPO on-policy sobre WildChat-1M, con los siguientes hiperparámetros: lr 1e-4, critic lr 8e-5, KL β=0.01 (k3), grupo de 8, temperatura 1.0, 256 tokens nuevos máximos y `batch_prompts: 128` (el padre usó 256, por lo que las métricas absolutas no son directamente comparables). El entrenamiento se realizó en 4×H100 durante 18h39m, con ~166 segundos por paso. No se registraron gradientes no finitos, colapso de formato ni OOMs.

Este modelo es el brazo profundo de un estudio de tres capas. Los hermanos `L24-wildchat` y `L32-wildchat` siguen el mismo procedimiento en los blocks 24 y 32, usando el mismo corpus de entrenamiento y, por tanto, los mismos documentos held-out. El marcador de inyección utilizado es el carácter ㈜ (U+321C), con token id 246566.

## Capacidades

- Reconstrucción de activaciones internas: el modelo codifica las activaciones del block 40 de gemma-3-12b-it en descripciones en lenguaje natural y las decodifica, alcanzando un FVE final de 53.9% en WildChat con una tasa de extracción del 100% en los 40 evals held-out.
- Adaptación a distribuciones conversacionales: tras 400 pasos de GRPO sobre WildChat-1M, el modelo mejora la reconstrucción de activaciones en diálogos respecto al punto de partida (46.1% → 53.9%).
- Análisis de profundidad: permite comparar el comportamiento de la capa 40 con las capas 24 y 32, ya que los tres modelos comparten corpus y metodología.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales: es una herramienta de interpretabilidad mecánica, no un modelo de generación de texto para usuarios.

## Casos de uso

- Investigación en interpretabilidad mecánica: el modelo se utiliza para convertir activaciones del block 40 de gemma-3-12b-it en descripciones textuales, permitiendo inspeccionar qué conceptos se codifican en esa capa durante conversaciones. Es adecuado porque está diseñado específicamente para este propósito.
- Análisis de transferencia de dominio: se pueden comparar las reconstrucciones de activaciones de texto web (FineFineWeb) frente a chat (WildChat) para cuantificar cómo cambian las representaciones internas al cambiar de distribución. Es adecuado porque el estudio de este modelo incluye métricas de FVE en ambos dominios.
- Evaluación de técnicas de RL (GRPO): el modelo permite estudiar cómo el entrenamiento con GRPO afecta la calidad de reconstrucción de activaciones, con datos concretos de ganancia (+7.8pp) y de evolución de entropía y KL. Es útil para investigar métodos de adaptación de autoencoders.
- Comparación de profundidades de red: junto con los modelos hermanos L24 y L32, se puede analizar cómo varía la capacidad de reconstrucción según la capa, identificando que el block 32 es un pico no atribuible a la adaptación. Es adecuado porque los tres modelos comparten corpus, metodología y documentos held-out.
- Auditoría de sesgos en el modelo base: al reconstruir activaciones de respuestas de chat, se pueden detectar patrones asociados a sesgos o alucinaciones en gemma-3-12b-it. El NLA ofrece una ventana a las representaciones internas que no es observable con la salida textual únicamente.
- Desarrollo de métodos de intervención en representaciones: el marcador de inyección ㈜ permite probar intervenciones en las activaciones del block 40, lo que facilita experimentos de control del comportamiento del modelo. Es adecuado porque el modelo expone ese mecanismo de forma explícita.
- Educación en interpretabilidad: el modelo y su documentación sirven como material didáctico para enseñar el funcionamiento de los autoencoders de lenguaje natural y su entrenamiento con RL, incluyendo el contrato de extracción y las métricas asociadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Las únicas métricas reportadas son de reconstrucción de activaciones (FVE), que no son comparables con benchmarks estándar como MMLU, HumanEval o GSM8K. Los datos de FVE de la model card son los siguientes:

| Métrica | Valor |
|---|---|
| held-out FVE @ step 400 (inicio) | 46.1% |
| held-out FVE @ step 790 (final) | 53.9% |
| mejor evaluación individual | 55.8% @ step 690 |
| media de las últimas 10 evaluaciones | 54.2% (rango 53.5–54.8) |
| tasa de extracción | 100% en los 40 evals |

La evaluación se realizó con muestreo a temperatura 1.0, y la model card advierte que la variabilidad entre evaluaciones del mismo peso puede ser de ~5 puntos. Por tanto, la ganancia de +7.8pp supera ese ruido, pero diferencias inferiores a 5 puntos deben leerse como empates.

## Requisitos de hardware

- Entrenamiento reportado: 4×H100, 18h39m para 400 pasos (~166 s/paso).
- Inferencia: no disponible en la información proporcionada. Al ser un adaptador PEFT sobre gemma-3-12b-it, la VRAM adicional es pequeña, pero se requiere cargar el modelo base para extraer activaciones.
- GPU recomendadas para entrenamiento: 4×H100.
- Compatibilidad con GPU de consumo: no disponible (depende del modelo base gemma-3-12b-it, que es de 12B).
- Opciones de despliegue: no disponible en la información. Al tratarse de un adaptador PEFT, se puede cargar con la librería `peft` sobre el modelo base, pero no se mencionan integraciones específicas con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Block | FVE final en WildChat | Ganancia | Media últimas 10 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Yooniel/gemma-3-12b-it-nla-L24-wildchat | 24 | 55.6% | +9.1pp | 54.7% | Gemma | HuggingFace |
| Yooniel/gemma-3-12b-it-nla-L32-wildchat | 32 | 64.3% | +9.2pp | 63.6% | Gemma | HuggingFace |
| Yooniel/gemma-3-12b-it-nla-L40-wildchat (este) | 40 | 53.9% | +7.8pp | 54.2% | Gemma | HuggingFace |
| achand45/gemma-3-12b-it-nla-L40 (padre) | 40 | 46.1% (inicio) | — | — | Gemma | HuggingFace |

Los tres modelos wildchat comparten el mismo corpus de entrenamiento, la misma metodología GRPO y los mismos documentos held-out, por lo que sus métricas de FVE sí son comparables entre sí. No lo son, en cambio, con las del modelo padre, que usó un `batch_prompts` de 256 frente al 128 de esta run.

## Limitaciones y advertencias

- La FVE no está en una escala común entre profundidades: el baseline de predicción de la media es 0.0400 en el block 40, 0.0299 en el block 32 y 0.0049 en el block 24. Por tanto, porcentajes iguales de FVE no implican igual calidad absoluta de reconstrucción. El error cuadrático medio crudo (`ar_mse`) de este modelo es ~0.019, frente a ~0.0027 del block 24, un orden de magnitud superior.
- La evaluación es ruidosa: el muestreo a temperatura 1.0 produce una dispersión de ~5 puntos entre evaluaciones repetidas. La ganancia de +7.8pp supera ese umbral, pero diferencias menores de 5 puntos (como la que separa este modelo del block 24) deben interpretarse como empates.
- No es una continuación like-for-like del padre: el `batch_prompts` de 128 frente al 256 del padre implica que este modelo vio 51,200 prompts por paso equivalente, con gradientes por paso más ruidosos. Las cifras absolutas de FVE no son comparables con las publicadas por el modelo padre.
- Sesgo de distribución: la adaptación se realizó únicamente con WildChat-1M, por lo que el modelo está optimizado para esa distribución conversacional y puede comportarse peor en otros tipos de diálogo o dominio.
- Riesgo de alucinación: no aplica como modelo generativo, pero las reconstrucciones del autoencoder pueden reflejar contenido alucinado del modelo base si se usan para interpretar representaciones internas.
- Restricciones de licencia: la licencia Gemma de Google impone términos de uso específicos que deben revisarse antes de cualquier uso comercial o despliegue.
- Tamaño del repositorio: 57.4 GB de pesos safetensors, lo que puede suponer una barrera de descarga y almacenamiento para equipos sin capacidad suficiente.
- Ausencia de benchmarks estándar: no hay resultados en tareas como MMLU, HumanEval o GSM8K, por lo que no se puede evaluar su rendimiento en tareas de NLP convencionales.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/Yooniel/gemma-3-12b-it-nla-L40-wildchat
- Modelo hermano L24: https://huggingface.co/Yooniel/gemma-3-12b-it-nla-L24-wildchat
- Modelo hermano L32: https://huggingface.co/Yooniel/gemma-3-12b-it-nla-L32-wildchat
- Modelo base original: https://huggingface.co/google/gemma-3-12b-it
- Modelo padre achand45/gemma-3-12b-it-nla-L40: https://huggingface.co/achand45/gemma-3-12b-it-nla-L40
- Dataset WildChat-1M: https://huggingface.co/datasets/allenai/WildChat-1M
- Términos de licencia Gemma: https://ai.google.dev/gemma/terms
