# tachara-ai/Decisio-12b-tuned-v3-mlx8-calibrated

## Resumen

Decisio-12b-tuned-v3-mlx8-calibrated es un ajuste fino de google/gemma-4-12B-it desarrollado por Tachara AI Lab para su servidor open source decisio, cuyo propósito es responder preguntas cerradas sobre un texto (sí/no, elección entre opciones y puntuaciones en una escala definida) devolviendo una probabilidad calibrada por opción en un único forward pass por pregunta. No es un modelo conversacional generalista: es un modelo de decisión, especializado en convertir texto y preguntas tipadas en distribuciones de probabilidad utilizables directamente por sistemas de downstream.

El modelo parte de los pesos de Gemma 4 12B (11.907.350.272 parámetros reales según safetensors) y se distribuye en formato MLX 8-bit con group size 64, pensado para inferencia en Apple silicon mediante mlx-lm. La revisión incluye un fichero `decision_config.json` que fija el layout del prompt, el readout, el ajuste del calculador (`calc-v1`) y las temperaturas por tipo de pregunta (choice 1.08, sí/no 1.43, score 1.10), además de `SHA256SUMS` para verificar la integridad de los pesos.

Su relevancia actual reside en que ofrece calibración explícita: la probabilidad devuelta para cada opción corresponde a la probabilidad de que esa opción sea correcta a las temperaturas publicadas, sin aplicar reglas de commit. Según la model card, sobre 5.000 preguntas held-out de su distribución de entrenamiento alcanza un 78,8% de acierto frente al 67,7% del modelo base y el 71,6% del anterior Decisio tuned 12B.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Gemma 4 12B, tag `gemma4_unified`) |
| Parámetros totales | 11.907.350.272 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | MLX 8-bit, group size 64 (mlx-lm 0.32.2); pesos base en bf16 tras merge |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (conversión MLX 8-bit) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del transformer denso google/gemma-4-12B-it en la revisión `707f0a3b8a3c7ad586ed01e27eafbad8a27dd0f7`. Sobre el modelo base se entrenó un adaptador LoRA de rango 32 y alpha 64 durante una época sobre 463.859 preguntas, que posteriormente se fusionó en el modelo base en float32 con redondeo estocástico con semilla hacia bf16. El proceso de merge queda registrado en `decision_config.json`.

La innovación principal no está en la arquitectura sino en el pipeline de decisión y calibración: el modelo se sirve a través de decisio, que aplica un layout de prompt y un readout fijos y extrae una probabilidad por opción en un solo forward pass. Las temperaturas por tipo de pregunta se obtuvieron como el ajuste de mínima log-loss sobre la mitad de un split held-out. La conversión a MLX 8-bit se realizó con mlx-lm 0.32.2 (group size 64) para Apple silicon. No se dispone de información sobre la composición del dataset de entrenamiento ni sobre el uso de RLHF o DPO.

## Capacidades

- Respuesta a preguntas cerradas sobre un texto: sí/no, elección única entre opciones y puntuación en una escala definida por el usuario.
- Devolución de probabilidades calibradas por opción, sin regla de commit, a las temperaturas publicadas (choice 1.08, sí/no 1.43, score 1.10).
- Calculadora integrada (`calc-v1`, requiere decisio 0.50.1 o superior) para preguntas sobre fechas, horas y aritmética que incluyan un bloque numérico.
- Mayor robustez frente a variaciones de redacción y orden de opciones que el modelo base y la versión anterior (81,2% frente a 71,5% y 75,6% respectivamente en 1.050 preguntas de sondeo).
- Generalización fuera de la distribución de entrenamiento: 83,9% en un chequeo de 1.178 preguntas (base 83,2%) y 73,4% en 1.028 preguntas de lectura general (base 70,5%).
- No soporta visión: las imágenes no forman parte del entrenamiento del modelo.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso; el uso previsto es la clasificación probabilística de preguntas cerradas.

## Casos de uso

- Moderación de contenido con umbrales probabilísticos: el modelo puede responder preguntas tipadas como "¿este texto contiene discurso de odio?" (sí/no) o "¿qué categoría de riesgo aplica?" (elección) devolviendo una probabilidad calibrada que permite fijar umbrales de decisión sin recalibración posterior.
- Enrutado de tickets de soporte: clasificar cada ticket en una categoría predefinida mediante preguntas de elección única, usando la probabilidad por opción para derivar a colas de atención o a respuestas automáticas cuando la confianza supera un umbral.
- Extracción de señales en pipelines de datos: formular preguntas cerradas sobre documentos (por ejemplo, "¿menciona una fecha de vencimiento?") y usar la probabilidad resultante como feature en modelos de scoring o sistemas de alerta.
- Evaluación automática de respuestas: puntuar la calidad de una respuesta generada en una escala definida (score), aprovechando la calibración para agregar puntuaciones entre evaluadores o entre ejecuciones.
- Encuestas y anotación asistida: convertir texto libre en etiquetas discretas con probabilidad asociada, permitiendo priorizar la revisión humana sobre los casos de menor confianza.
- Verificación de consistencia documental: preguntas de sí/no sobre contratos o informes (por ejemplo, "¿el importe coincide con la cláusula X?") con el calculador activado para preguntas aritméticas o de fechas, donde la precisión sube de aproximadamente 57-60% a cerca de 83% en 874 preguntas de ese tipo.
- Despliegue local en Apple silicon: servir el modelo en un Mac con mlx-lm y decisio para clasificación sensible a privacidad sin enviar datos a la nube.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre 5.000 preguntas held-out de su distribución de entrenamiento, medidas a través de decisio en bf16 y con batch-invariant mode desactivado:

| Conjunto | Gemma 4 12B base | Decisio tuned 12B anterior | Decisio v3 |
|---|---:|---:|---:|
| Todas las preguntas | 67,7% | 71,6% | 78,8% |
| Elección (2.792) | 68,9% | 71,7% | 79,8% |
| Sí/no (1.220) | 83,0% | 84,7% | 89,8% |
| Score (988) | 45,1% | 55,2% | 62,2% |

Otros datos reportados:

| Métrica | Resultado |
|---|---|
| Robustez a redacción y orden (1.050 preguntas) | 81,2% (base 71,5%, anterior 75,6%) |
| Fuera de distribución (1.178 preguntas) | 83,9% (base 83,2%) |
| Lectura general (1.028 preguntas) | 73,4% (base 70,5%) |
| Brier score (mitad held-out, temperaturas por tipo) | 0,234 |
| Brier score (temperatura única 3,592) | 0,316 |
| Calculadora activada (874 preguntas con bloque numérico) | ~83% (antes ~57-60%) |
| Coincidencia de respuesta top con pesos bf16 (300 preguntas) | 95,7% |

Estas cifras proceden de preguntas held-out de la distribución de entrenamiento del autor y no de un benchmark independiente.

## Requisitos de hardware

- Inferencia orientada a Apple silicon mediante MLX; el repositorio ocupa 12,7 GB en formato MLX 8-bit.
- VRAM/unified memory estimada: alrededor de 13-14 GB para los pesos en 8-bit más overhead de contexto y activaciones; se recomienda un Mac con al menos 16 GB de memoria unificada, y 24-32 GB para contextos largos o mayor paralelismo.
- GPU recomendadas: no aplica para esta conversión MLX (pensada para chips Apple M-series); para CUDA sería necesario usar los pesos bf16 del modelo base o generar una conversión propia, cuyo requisito no está documentado.
- Cabe en equipos consumer con Apple silicon de gama alta (M2 Pro/Max, M3 Pro/Max, M4 Pro/Max) con memoria unificada suficiente.
- Despliegue: servidor decisio con backend MLX (`uv run python -m decisio.serve.vllm_engine --backend mlx --base tachara-ai/Decisio-12b-tuned-v3-mlx8-calibrated`), con decisio 0.50.1 o superior y su extra mlx; se usaron decisio 0.50.2, mlx 0.32.4 y mlx-lm 0.32.2.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Decisio-12b-tuned-v3-mlx8-calibrated | 11,9B | no disponible | Clasificación probabilística calibrada (MLX 8-bit) | Apache 2.0 | Hugging Face |
| google/gemma-4-12B-it (base) | ~12B | no disponible | Modelo instructivo generalista | Apache 2.0 | Hugging Face |
| Decisio tuned 12B anterior | ~12B | no disponible | Clasificación probabilística (versión previa) | no disponible | Hugging Face (tachara-ai) |

La comparación con modelos de clasificación de propósito general (por ejemplo, clasificadores BERT o LLMs con prompts de clasificación) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Las métricas publicadas corresponden a preguntas held-out de la distribución de entrenamiento del autor, no a un benchmark independiente; pueden no trasladarse a dominios distintos.
- La calibración solo se mantiene a las temperaturas publicadas cuando el modelo se sirve mediante decisio; otros servidores que no apliquen temperatura producen probabilidades más planas o más agudas que las declaradas.
- El modelo no ha sido entrenado con imágenes; no admite entradas visuales.
- Requiere decisio 0.50.1 o superior; versiones anteriores sirven el modelo sin el bloque del calculador. El servidor se niega a arrancar si `decision_config.json` difiere del perfil del modelo base instalado en decisio.
- Las revisiones posteriores del repositorio pueden cambiar `decision_config.json` (por ejemplo, un ajuste de calculadora más reciente); se recomienda fijar un commit con `--base ...@<commit>` y verificar los pesos con `SHA256SUMS`.
- No se documentan sesgos conocidos, limitaciones idiomáticas ni riesgos específicos de alucinación más allá de la naturaleza probabilística del modelo; al ser un modelo de decisión y no generativo, el riesgo de alucinación se manifiesta como probabilidades mal calibradas en dominios alejados del entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero se debe conservar el fichero `NOTICE` que referencia el repositorio y la revisión del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tachara-ai/Decisio-12b-tuned-v3-mlx8-calibrated
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Repositorio decisio: https://github.com/aminry/decisio
- Organización Tachara AI Lab: https://huggingface.co/tachara-ai
