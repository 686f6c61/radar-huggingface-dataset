# youngseok12/HyperCLOVA-X-SEED-Think-14B-success-consolidation-krc-r4min-vo

## Resumen

El modelo HyperCLOVA X SEED 14B Think es una variante fine-tuned del modelo base `naver-hyperclovax/HyperCLOVAX-SEED-Think-14B`, desarrollada por el usuario youngseok12. Se trata de un experimento de consolidación de éxitos (success-consolidation, familia STaR) orientado a mejorar el razonamiento en coreano en tres ejes: conocimiento médico (KMMLU-Pro), razonamiento numérico (MuSR-Ko) y razonamiento causal (Com2-main-Ko). El modelo utiliza LoRA de rango 4 sobre los módulos de atención `v_proj` y `o_proj`, y fusiona tres LoRAs por eje mediante TIES. Con 14.748 millones de parámetros (14.7B) y un tamaño de repositorio de 29.5 GB en BF16, es un modelo de tamaño medio pensado para investigación y evaluación. La longitud de contexto no está documentada en la información disponible.

El modelo surge de una investigación sobre selección de módulos: un análisis de gradientes del modelo base mostró que `o_proj` recibe gradientes 1.70–1.76 veces mayores que `q_proj`, lo que motivó entrenar y comparar este brazo A/B con otro modelo hermano que usa `q_proj` y `v_proj`. Su relevancia radica en que permite evaluar si la selección de proyecciones de atención influye en el rendimiento con el mismo presupuesto de parámetros entrenables (2.957.312 parámetros).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (no se especifica la variante exacta) |
| Parámetros totales | 14.748.112.896 (~14.7B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | coreano (ko) |
| Licencia | hyperclovax-seed (other) |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer del modelo base HyperCLOVAX-SEED-Think-14B, aunque no se detalla si se trata de un modelo denso o con mezcla de expertos. El fine-tuning se realizó mediante LoRA de rango 4, alpha 8 y dropout 0.05, aplicado exclusivamente a las proyecciones de atención `v_proj` y `o_proj`. El entrenamiento usó 836 filas de datos, cada una con el razonamiento correcto generado por el propio modelo base, reestructurado en formato `정답: X\n근거: ...` (respuesta primero, luego justificación). Las fuentes de datos proceden de AI Hub: 71875 (conocimiento médico esencial) para KMMLU-Pro, 71568 (MRC de cálculo numérico económico y deportivo) para MuSR-Ko, y 71949 (razonamiento causal) para Com2-main-Ko.

El proceso de entrenamiento se realizó con una sola época, learning rate 5e-5 con scheduler coseno y warmup del 3%, tamaño de lote efectivo 16, longitud máxima de secuencia 4096 y pérdida calculada solo sobre los tokens de asistente. Se entrenaron tres LoRAs independientes, uno por eje, y se fusionaron mediante TIES (pesos 1.0/1.0/1.0, densidad 0.5). La verificación de la fusión incluyó un barrido de NaN/Inf sobre los 421 parámetros fusionados y una prueba de generación en sondas reales, ambos con resultado positivo. No se utilizaron datos públicos de benchmarks para el entrenamiento.

## Capacidades

- Generación de texto en coreano, con especialización en tareas de razonamiento.
- Razonamiento de conocimiento médico (KMMLU-Pro), razonamiento numérico (MuSR-Ko) y razonamiento causal (Com2-main-Ko).
- Producción de respuestas estructuradas en formato respuesta-primero con justificación, gracias al entrenamiento con trazas de razonamiento correctas.
- Fine-tuning eficiente mediante LoRA de rango bajo y fusión TIES, con solo 2.957.312 parámetros entrenables.
- Capacidad de servir como modelo de referencia en evaluaciones del K-AI leaderboard.
- No se documentan capacidades de tool calling, visión, audio ni soporte de agentes en la información disponible.

## Casos de uso

- Asistente de consulta médica en coreano: el modelo puede responder preguntas de conocimiento médico esencial, apoyándose en el entrenamiento con datos de AI Hub 71875. Es adecuado para contextos donde se necesita una respuesta correcta seguida de una justificación.
- Análisis de datos numéricos en economía y deporte: gracias al entrenamiento con MRC de cálculo numérico (AI Hub 71568), el modelo puede resolver problemas que combinan comprensión lectora y operaciones aritméticas en contextos económicos o deportivos.
- Razonamiento causal en textos coreanos: el entrenamiento con datos de razonamiento causal (AI Hub 71949) permite al modelo identificar relaciones causa-efecto, útil en análisis de noticias, informes o documentos técnicos.
- Tutoría académica en coreano: el modelo puede generar explicaciones paso a paso en formato `정답: X\n근거: ...`, lo que facilita su uso en sistemas de apoyo al estudio o en la generación de material didáctico.
- Evaluación de modelos de lenguaje coreanos: al estar diseñado para benchmarks como KMMLU-Pro, MuSR-Ko y Com2-main-Ko, puede utilizarse como baseline en la evaluación de otros modelos coreanos de razonamiento.
- Investigación en eficiencia de fine-tuning: el modelo sirve como caso de estudio para comparar el impacto de la selección de módulos LoRA (`v_proj` y `o_proj` frente a `q_proj` y `v_proj`) manteniendo idénticos el resto de hiperparámetros. Es útil para experimentos de ablación en entornos académicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que las puntuaciones de un proxy local de cuatro ejes (n=100 por eje) fueron superiores a las del modelo hermano en 3 de 4 ejes, pero no se aportan cifras concretas. La evaluación definitiva se realizará en el K-AI leaderboard, cuyos resultados no están disponibles.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en BF16 ocupan aproximadamente 29.5 GB, por lo que se recomienda al menos 35-40 GB de VRAM para inferencia con overhead de activaciones y KV-cache.
- GPU recomendadas: NVIDIA A100 40GB/80GB, H100, o GPUs equivalentes con al menos 40 GB de VRAM. En GPUs de consumo como la RTX 4090 (24 GB), sería necesario aplicar cuantización, pero no se proporcionan tipos de cuantización.
- Despliegue: compatible con la librería `transformers` (según la etiqueta `library_name`) y con `endpoints_compatible`. Puede desplegarse con vLLM o TGI, aunque no hay documentación específica.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| HyperCLOVA-X-SEED-Think-14B-success-consolidation-krc-r4min-vo | 14.7B | no disponible | hyperclovax-seed | HuggingFace |
| HyperCLOVA-X-SEED-Think-14B-success-consolidation-krc-r4min-ties | 14.7B | no disponible | hyperclovax-seed | HuggingFace |
| naver-hyperclovax/HyperCLOVAX-SEED-Think-14B | 14.7B | no disponible | hyperclovax-seed | HuggingFace |

El modelo hermano `...-ties` es la comparación más directa: comparte datos, hiperparámetros y número de parámetros entrenables, y solo difiere en los módulos LoRA (`q_proj` y `v_proj` en lugar de `v_proj` y `o_proj`). No se dispone de más alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. El modelo puede heredar sesgos del modelo base y de los datos de AI Hub, que están centrados en contextos coreanos específicos.
- Riesgo de alucinación: no evaluado formalmente. El entrenamiento con razonamientos generados por el propio modelo base puede amplificar errores o sesgos del modelo original.
- Limitaciones de contexto e idioma: el modelo está orientado exclusivamente al coreano; no hay información sobre soporte multilingüe. La longitud de contexto no está documentada.
- Restricciones de licencia: la licencia `hyperclovax-seed` es una licencia personalizada ("other") que exige cumplir el acuerdo de licencia del modelo base de NAVER, incluyendo atribución y política de usos prohibidos. El nombre del modelo debe comenzar por "HyperCLOVA X" según la licencia.
- Advertencia para producción: es un modelo experimental con 0 descargas y 0 likes en HuggingFace, entrenado con una sola época y un conjunto de datos limitado (836 filas). No se han publicado benchmarks formales, por lo que no debería utilizarse en producción sin una evaluación exhaustiva y una validación independiente.

## Enlaces

- Repositorio del modelo: https://huggingface.co/youngseok12/HyperCLOVA-X-SEED-Think-14B-success-consolidation-krc-r4min-vo
- Modelo base: https://huggingface.co/naver-hyperclovax/HyperCLOVAX-SEED-Think-14B
- Modelo hermano (ties): https://huggingface.co/youngseok12/HyperCLOVA-X-SEED-Think-14B-success-consolidation-krc-r4min-ties
- Modelo relacionado (minimal-sft): https://huggingface.co/youngseok12/HyperCLOVA-X-SEED-Think-14B-minimal-sft-71875
