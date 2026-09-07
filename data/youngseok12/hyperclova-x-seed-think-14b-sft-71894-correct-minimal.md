# youngseok12/HyperCLOVA-X-SEED-Think-14B-sft-71894-correct-minimal

## Resumen

El modelo HyperCLOVA X SEED Think-14B SFT 71894 Correct Minimal es una variante ajustada del modelo base `naver-hyperclovax/HyperCLOVAX-SEED-Think-14B`, desarrollada por el usuario de HuggingFace youngseok12. Se trata de un modelo de lenguaje autoregresivo de 14.700 millones de parámetros (14,7B) en formato safetensors, preparado para la generación de texto en coreano. El ajuste fino se realizó mediante la fusión de un adaptador LoRA entrenado con un subconjunto del dataset AI Hub 71894, compuesto por 674 ejemplos de preguntas de opción múltiple sobre conocimiento general y cultura/hechos históricos coreanos.

Su principal particularidad es que el entrenamiento se limitó a que el modelo predijera únicamente la letra de la respuesta correcta (A, B, C, D o E), un enfoque denominado Correct Minimal. La relevancia de esta publicación radica en que documenta un experimento de ajuste fino con un volumen de datos muy reducido y una configuración LoRA de baja dimensión, aprovechando un modelo base comercial de NAVER. No obstante, el propio autor indica en la model card que no se han medido puntuaciones de benchmarks locales ni del K-AI leaderboard, por lo que su rendimiento real no está validado.

El modelo se distribuye bajo la licencia HyperCLOVA X SEED 14B Think Model License Agreement de NAVER, con restricciones de uso y redistribución. Está pensado como un recurso de investigación y evaluación, no como un sistema de producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (no se especifica en la información publicada) |
| Parametros totales | 14.748.112.896 (14,7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el entrenamiento usó una longitud máxima de secuencia de 1024 tokens) |
| Tipos de cuantizacion | BF16 (solo safetensors; sin cuantizaciones precalculadas) |
| Idiomas soportados | Coreano (ko) |
| Licencia | hyperclovax-seed (HyperCLOVA X SEED 14B Think Model License Agreement de NAVER) |
| Formato de pesos | safetensors (BF16, modelo standalone sin adaptadores) |

## Arquitectura y entrenamiento

La arquitectura interna del modelo no se detalla en la información disponible, aunque la librería `transformers` y el pipeline `text-generation` indican que se trata de un modelo de lenguaje autoregresivo. El modelo es el resultado de fusionar un adaptador LoRA sobre el modelo base `naver-hyperclovax/HyperCLOVAX-SEED-Think-14B` (revisión `9b74e35d4c7e4ffec489f4171273caca8948a2b9`).

El proceso de ajuste fino se llevó a cabo sobre el dataset AI Hub 71894. Primero se realizó una prueba determinista de etiquetas con 1.000 candidatos usando el modelo base. De ellos, solo 674 ejemplos donde el modelo base acertó se utilizaron para el entrenamiento, distribuidos en 554 de coreano general y 120 de cultura e historia coreana. No se emplearon ejemplos erróneos (277) ni inciertos (49), y no se realizó duplicación ni re-muestreo. Además, el autor indica que no se usaron datos de benchmarks públicos para el entrenamiento.

La configuración de entrenamiento fue la siguiente: LoRA con `r=4`, `alpha=8`, `dropout=0`, `bias=none` sobre los módulos `q_proj` y `v_proj`. Se usó una tasa de aprendizaje de `1e-6` con scheduler constante, sin warmup y sin weight decay. Se entrenó una sola época con 43 pasos, batch size 1 y gradient accumulation 16, en BF16. La longitud máxima de secuencia fue de 1024, con packing desactivado y pérdida calculada solo en las respuestas del asistente. El gradient checkpointing estaba activado y las semillas de datos y del modelo eran 42/42. La pérdida final de entrenamiento fue de `4.019627526749012`.

## Capacidades

- Generación de texto en coreano, orientada a responder preguntas de opción múltiple emitiendo una única letra (A/B/C/D/E) como respuesta correcta.
- Ajustado específicamente para el formato Correct Minimal, es decir, solo se espera la letra de la respuesta, no una explicación.
- No se ha documentado soporte de tool calling, function calling, uso de agentes, visión, audio ni otros modos especiales.
- Capacidades multilingües no verificadas; la model card solo declara coreano y el entrenamiento se realizó con datos en ese idioma.
- El modelo base lleva el sufijo Think, lo que sugiere que puede heredar capacidades de razonamiento del modelo original, pero esta variante no ha sido evaluada en ese aspecto.

## Casos de uso

- Evaluación automatizada de exámenes de opción múltiple en coreano: el modelo puede emplearse como predictor de la letra correcta en cuestionarios de conocimiento general, cultura e historia, aunque su precisión debe validarse con supervisión humana.
- Investigación sobre ajuste fino minimalista con LoRA: el modelo sirve para estudiar cómo un conjunto muy pequeño de ejemplos seleccionados afecta al comportamiento de un modelo base de 14,7B, especialmente con adaptadores de baja dimensionalidad.
- Comparación de modelos ajustados y base en entornos académicos: puede utilizarse como uno de los puntos de comparación en experimentos que evalúen el efecto del SFT sobre el modelo HyperCLOVA X SEED.
- Etiquetado de preguntas candidatas para datasets QA en coreano: dada su naturaleza de respuesta única, puede asistir en la generación de etiquetas preliminares para preguntas de opción múltiple, siempre que se combine con revisión posterior.
- Prototipado de asistentes educativos para práctica de conocimiento coreano: puede integrarse en aplicaciones de tipo quiz para ofrecer la respuesta correcta en tests de cultura general o historia, con mecanismos de validación humana.
- Validación de pipelines de retrieval-augmented generation (RAG) en coreano: puede actuar como clasificador final de la respuesta en sistemas que generan preguntas de opción múltiple, aunque su fiabilidad es limitada.
- Documentación de prácticas de entrenamiento: el modelo sirve de referencia para investigadores que replican técnicas de LoRA merge y SFT con datos de AI Hub, ya que se publican todos los hiperparámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor indica explícitamente que no se midieron puntuaciones en el benchmark local ni en el K-AI leaderboard durante esta fase de publicación. Por lo tanto, no es posible comparar su rendimiento con otros modelos a partir de datos verificables.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 30 GB en BF16, ya que 14.748.112.896 parámetros por 2 bytes por parámetro equivalen a unos 29,5 GB. No se incluyen pesos cuantizados.
- Con cuantización de 4 bits (si se realiza manualmente), la VRAM podría reducirse a unos 8 GB, y con 8 bits a unos 15 GB, aunque estas cuantizaciones no están precalculadas ni probadas.
- GPU recomendadas: NVIDIA A100 40GB/80GB, H100 80GB. En GPU de consumo, una RTX 4090 de 24 GB no es suficiente para ejecutar el modelo en BF16, pero podría funcionar con cuantización de 4 bits.
- Opciones de despliegue: Transformers con `torch_dtype=torch.bfloat16` y `device_map="auto"`, como muestra el ejemplo del autor. También es compatible con vLLM y TGI, siempre que se respete la licencia. Para llama.cpp u Ollama sería necesario convertir los pesos a GGUF, conversión no incluida en el repositorio.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque de ajuste | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| youngseok12/HyperCLOVA-X-SEED-Think-14B-sft-71894-correct-minimal | 14,7B | No disponible | SFT con LoRA, Correct Minimal | hyperclovax-seed | HuggingFace |
| naver-hyperclovax/HyperCLOVAX-SEED-Think-14B | 14,7B | No disponible | Modelo base, sin SFT | hyperclovax-seed | HuggingFace |
| youngseok12/HyperCLOVA-X-SEED-Think-14B-minimal-sft-71875 | 14,7B | No disponible | SFT con LoRA (datos distintos, no documentados aquí) | hyperclovax-seed | HuggingFace |
| youngseok12/HyperCLOVA-X-SEED-Think-14B-success-consolidation-krc-r4min-ties | 14,7B | No disponible | Consolidación de adaptadores con Ties | hyperclovax-seed | HuggingFace |

No se dispone de benchmarks publicados para ninguna de estas variantes, por lo que la comparativa se limita a parámetros y características de distribución. El rendimiento relativo no puede verificarse con los datos actuales.

## Limitaciones y advertencias

- El entrenamiento se realizó con solo 674 ejemplos y la pérdida final fue de 4.0196, un valor que indica una convergencia limitada y que el modelo puede no haber interiorizado de forma fiable los patrones de respuesta.
- No hay ningún benchmark publicado; el rendimiento en tareas reales de conocimiento coreano es desconocido y no puede garantizarse.
- El modelo solo soporta coreano. No se ha validado su comportamiento en otros idiomas.
- La licencia es propietaria de NAVER, con políticas de uso prohibido y atribución obligatoria. Debe consultarse el acuerdo completo antes de cualquier uso comercial o redistribución.
- Los datos de partida provienen de AI Hub, cuyos términos de uso también se aplican. No se ha confirmado si el uso comercial está permitido en esta combinación.
- Existe riesgo de alucinación o respuestas incorrectas, especialmente fuera del dominio de entrenamiento. El modelo no debe usarse como única fuente para decisiones médicas, legales o financieras.
- No se incluyen cuantizaciones; cualquier despliegue eficiente en GPU de consumo requiere que el usuario genere sus propios pesos cuantizados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/youngseok12/HyperCLOVA-X-SEED-Think-14B-sft-71894-correct-minimal
- Modelo base: https://huggingface.co/naver-hyperclovax/HyperCLOVAX-SEED-Think-14B
- Dataset AI Hub 71894: https://www.aihub.or.kr/aihubdata/data/view.do?currMenu=115&topMenu=100&aihubDataSe=realm&dataSetSn=71894
- Variante minimal-sft-71875: https://huggingface.co/youngseok12/HyperCLOVA-X-SEED-Think-14B-minimal-sft-71875
- Variante success-consolidation-krc-r4min-ties: https://huggingface.co/youngseok12/HyperCLOVA-X-SEED-Think-14B-success-consolidation-krc-r4min-ties
