# youngseok12/AX-3.1-Light-specialist-300-ties

## Resumen

El modelo `youngseok12/AX-3.1-Light-specialist-300-ties` es un modelo de lenguaje fusionado (merged model) desarrollado por `youngseok12` a partir del modelo base `skt/A.X-3.1-Light`. Combina tres adaptadores LoRA especialistas, denominados K, R y C, cada uno entrenado con 300 filas de datos coreanos procedentes de AI Hub, y los fusiona mediante la técnica TIES (Trim, Elect Sign and Merge) con pesos iguales y densidad 0.5.

El objetivo de este experimento es corregir un fallo identificado en una ronda anterior de fusión de especialistas: los modelos anteriores se entrenaban con respuestas sin incluir la evidencia generada por el propio modelo base, lo que provocaba un "razonamiento detenido" que la fusión amplificaba y degradaba el rendimiento. En esta versión, cada LoRA se entrenó con la técnica de *success-consolidation*, incluyendo en el target la evidencia producida por el modelo base, y se redujo el volumen de entrenamiento de 3.000 a 300 filas por eje.

El modelo tiene 7.264.800.768 parámetros (aproximadamente 7.260 millones), se distribuye en formato `safetensors` BF16 standalone y está pensado para investigación y evaluación en tareas de generación de texto en coreano. La licencia es Apache 2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Llama (variante no especificada; base: `skt/A.X-3.1-Light`) |
| Parametros totales | 7.264.800.768 (≈7.260 M) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos BF16 standalone, sin cuantización oficial publicada) |
| Idiomas soportados | Coreano (`ko`) |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` (BF16, sin adaptador separado) |

## Arquitectura y entrenamiento

El modelo parte del base `skt/A.X-3.1-Light` en su revisión `9b41bb2406472634d8812c0b8931fa40fa9a6c3a`. Sobre este base se entrenaron tres adaptadores LoRA independientes, cada uno con 300 filas, una época, tasa de aprendizaje `5e-5` con programación coseno y warmup del 3%, y precisión BF16. Los hiperparámetros LoRA son rank 16, alpha 32 y dropout 0.05, aplicados a los módulos `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. La función de pérdida es entropía cruzada causal sobre los tokens de asistente.

Los tres LoRA se entrenaron sobre dominios distintos, todos con datos de AI Hub:

- **K**: orientado a KMMLU-Pro, con datos de conocimiento médico esencial (`71875 필수의료 의학지식`), selección `correct_unstable`, 300 filas, pérdida de entrenamiento 0.6672.
- **R**: orientado a MuSR(Ko), con datos de comprensión lectora de cálculo numérico (`71568 숫자연산 기계독해`), selección `correct_unstable`, 300 filas, pérdida 0.6066.
- **C**: orientado a Com2-main(Ko), con datos de razonamiento causal (`71949 인과관계 기반 추론`), selección `correct_all`, 300 filas, pérdida 0.5954.

La diferencia en el criterio de selección del eje C se debe a que el modelo base solo mostró inestabilidad en 255 de 2.125 respuestas correctas (12.0%), lo que no permitía formar 300 filas manteniendo el equilibrio de posiciones de respuesta. Por ello, C se seleccionó de todas las respuestas correctas (`correct_all`), mientras que K y R usaron `correct_unstable` (22.4% y 77.8% de inestabilidad, respectivamente). Los tres LoRA mantienen un equilibrio de posición de respuesta de 75 filas por cada opción (`①`, `②`, `③`, `④`), para preservar la condición de "tamaño de delta similar" que TIES requiere.

La fusión se realizó con TIES, pesos 1.0/1.0/1.0 y densidad 0.5, en una sola GPU (se prohíbe el merge con `device_map="auto"` por incidentes previos de NaN). Se verificó la ausencia de NaN/Inf en 291 parámetros y se realizó un smoke test de generación sin salidas vacías.

## Capacidades

- Generación de texto en coreano, incluyendo instrucciones y conversación.
- Especialización en tres dominios concretos:
  - Conocimiento médico esencial (eje K), evaluado en KMMLU-Pro.
  - Razonamiento numérico y comprensión lectora de cálculo (eje R), evaluado en MuSR(Ko).
  - Razonamiento causal (eje C), evaluado en Com2-main(Ko).
- Soporte de tool calling: no disponible (no se menciona en la información proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: solo coreano (`ko`) según los metadatos.
- Capacidades especiales (visión, audio, thinking mode): no disponibles.

## Casos de uso

- **Asistente de consulta médica en coreano**: el eje K está entrenado con conocimiento médico esencial de AI Hub, lo que permite responder preguntas factuales sobre medicina en coreano. Es adecuado para prototipos de sistemas de consulta en entornos clínicos de investigación, siempre con supervisión humana.
- **Razonamiento numérico en comprensión lectora coreana**: el eje R está especializado en tareas de cálculo numérico sobre textos, como las planteadas en MuSR(Ko). Puede usarse para evaluar la capacidad del modelo en problemas de aritmética contextualizada.
- **Análisis de razonamiento causal en coreano**: el eje C está entrenado con datos de razonamiento causal de Com2-main(Ko). Es útil para experimentos de inferencia causal en textos coreanos, por ejemplo en análisis de noticias o documentos técnicos.
- **Investigación en fusión de modelos**: este modelo sirve como caso de estudio para comparar el efecto de la técnica TIES con otras estrategias de fusión, y para analizar cómo la inclusión de evidencia en los targets de entrenamiento afecta al rendimiento final.
- **Evaluación de modelos coreanos en benchmarks**: puede utilizarse en pruebas comparativas como KMMLU-Pro, MuSR(Ko) y Com2-main(Ko) para medir el impacto de la especialización por ejes en el rendimiento global.
- **Generación de texto instructivo en coreano**: al ser un modelo conversacional con fine-tuning supervisado, puede emplearse en tareas sencillas de generación de texto siguiendo instrucciones, aunque su uso en producción está desaconsejado por su naturaleza experimental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que el rendimiento de este modelo fusionado solo puede confirmarse mediante resultados reales en un leaderboard. Además, se advierte que los modelos de un solo eje con 3.000 filas de los mismos datos y conceptos mostraron una caída en K-AI en comparación con el base (base: 0.4230; `correct_all`: 0.3906; `correct_unstable`: 0.4026), aunque no se aportan cifras para esta fusión concreta.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos BF16 de 7.260 millones de parámetros, el peso del modelo ocupa aproximadamente 14,5 GB. Considerando activaciones y caché KV, se recomiendan al menos 16 GB de VRAM.
- GPU recomendadas: una RTX 4090 (24 GB), A100 40 GB o H100 80 GB pueden ejecutar el modelo en BF16 sin cuantización. En GPUs de consumo, una RTX 4080 de 16 GB es el mínimo recomendable.
- Compatibilidad con GPU de consumo: sí, en tarjetas con 16 GB o más de VRAM, siempre que se usen pesos BF16 completos.
- Opciones de despliegue: compatible con `transformers`, `text-generation-inference` y `vLLM` al ser un modelo `safetensors` estándar. También puede convertirse a GGUF para su uso con `llama.cpp` u `Ollama`.
- Latencia y throughput: no disponible (no se aportan mediciones en la información proporcionada).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `skt/A.X-3.1-Light` | 7.260 M | no disponible | Apache 2.0 | Modelo base original |
| `youngseok12/AX-3.1-Light-specialist-300-ties` | 7.260 M | no disponible | Apache 2.0 | Fusión TIES de 3 LoRA con 300 filas |
| `youngseok12/AX-3.1-Light-sft_v0_21_source_screen_essential_medical_300` | no disponible | no disponible | no disponible | SFT con datos médicos esenciales |
| `youngseok12/AX-3.1-Light-sft_B12K_qcdd_1e` | no disponible | no disponible | no disponible | SFT con selección de calidad, complejidad, dificultad y diversidad (QCDD) |

## Limitaciones y advertencias

- **Naturaleza experimental**: el modelo está diseñado para investigación y evaluación, no para uso en producción. La model card advierte explícitamente que los resultados generados pueden ser inexactos y no deben utilizarse como única base para decisiones de alto riesgo.
- **Intervención débil**: con solo 300 filas por LoRA, el número de pasos de optimizador es de 19, frente a los 188 pasos de la versión de 3.000 filas. Esto implica una modificación mucho más sutil sobre el modelo base.
- **Posible degradación del rendimiento**: los modelos de un solo eje con 3.000 filas de los mismos datos mostraron una caída en K-AI en comparación con el base. No se garantiza que esta fusión revierta o mejore esa caída.
- **Diferencia en el eje C**: el criterio de selección de datos para el eje C (`correct_all`) es distinto al de K y R (`correct_unstable`), lo que debe tenerse en cuenta al atribuir resultados a cada eje.
- **Sesgos y alucinación**: al estar entrenado con datos coreanos de dominios específicos, puede presentar sesgos culturales y de dominio, así como un riesgo de alucinación en temas fuera de su especialización.
- **Limitación de idioma**: solo soporta coreano, sin capacidades multilingües documentadas.
- **Licencia**: Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantías y con avisos de uso responsable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/youngseok12/AX-3.1-Light-specialist-300-ties
- Modelo base: https://huggingface.co/skt/A.X-3.1-Light
- Otros modelos del autor:
  - https://huggingface.co/youngseok12/AX-3.1-Light-sft_v0_21_source_screen_essential_medical_300
  - https://huggingface.co/youngseok12/AX-3.1-Light-sft_B12K_qcdd_1e
- Datasets de AI Hub utilizados:
  - https://www.aihub.or.kr/aihubdata/data/view.do?currMenu=115&topMenu=100&aihubDataSe=realm&dataSetSn=71875
  - https://www.aihub.or.kr/aihubdata/data/view.do?currMenu=115&topMenu=100&aihubDataSe=realm&dataSetSn=71568
  - https://www.aihub.or.kr/aihubdata/data/view.do?currMenu=115&topMenu=100&aihubDataSe=realm&dataSetSn=71949
