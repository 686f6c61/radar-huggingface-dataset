# tachara-ai/Decisio-12b-tuned-v3-mlx-calibrated

## Resumen

Decisio-12b-tuned-v3-mlx-calibrated es un modelo derivado de google/gemma-4-12B-it, desarrollado por Tachara AI Lab, especializado en responder preguntas cerradas sobre un texto: opción múltiple, sí/no y puntuaciones en una escala definida. A diferencia de un modelo generativo al uso, devuelve una probabilidad calibrada por cada opción en un único forward pass por pregunta, lo que lo convierte en un componente de decisión más que en un generador de texto libre. Está pensado para integrarse en decisio, un servidor open source que gestiona el formato de prompt y la lectura de probabilidades.

El modelo parte de los 11.907.350.272 parámetros del Gemma 4 12B instruct y se ha ajustado mediante un adaptador LoRA (rango 32, alpha 64) entrenado durante una época sobre 463.859 preguntas. La versión publicada en este repositorio es la variante calibrada convertida a MLX en 6 bits (grupo de 64, mlx-lm 0.32.2) para Apple silicon, con temperaturas específicas por tipo de pregunta (choice 1.08, yes/no 1.43, score 1.10) ajustadas por mínima pérdida logarítmica.

Su relevancia actual reside en que ofrece probabilidades calibradas —no solo etiquetas— para tareas de clasificación y verificación textual, con mejoras medibles frente al modelo base y a la versión anterior de Decisio en preguntas de la misma distribución de entrenamiento. No obstante, las cifras publicadas proceden de conjuntos retenidos de esa distribución y no de un benchmark independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 4 12B instruct, sin confirmar detalles internos) |
| Parametros totales | 11.907.350.272 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6 bits en MLX (group size 64); pesos bf16 de referencia mencionados |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (conversión MLX 6-bit) |

## Arquitectura y entrenamiento

El modelo se construye sobre google/gemma-4-12B-it (revisión 707f0a3b8a3c7ad586ed01e27eafbad8a27dd0f7, Apache-2.0), un transformer decoder-only de aproximadamente 11,9 mil millones de parámetros. Sobre esa base se entrenó un adaptador LoRA de rango 32 y alpha 64 durante una época sobre 463.859 preguntas, que posteriormente se fusionó en el modelo base en float32 con redondeo estocástico sembrado a bf16. El archivo `decision_config.json` registra los detalles de la fusión.

La innovación principal no está en la arquitectura, sino en el procedimiento de calibración: se ajustan temperaturas por tipo de pregunta (opción múltiple, sí/no y puntuación) mediante minimización de la pérdida logarítmica sobre la mitad de un split retenido. La conversión a MLX 6-bit con grupo de 64 busca preservar el comportamiento del modelo bf16 en hardware Apple silicon; según el autor, el 94,0% de las respuestas top coinciden con las de los pesos bf16 en 300 preguntas retenidas fijas. El servidor decisio aplica el diseño de prompt, la lectura de probabilidades y la configuración del calculador (`calc-v1`) definidos en el repositorio.

## Capacidades

- Respuesta a preguntas cerradas sobre un texto: opción múltiple (una entre varias), sí/no y puntuación en una escala definida por el usuario.
- Devolución de probabilidades calibradas por opción en un único forward pass por pregunta, sin regla de commit.
- Manejo de preguntas que dependen del orden de opciones y de la formulación: el modelo se evalúa específicamente en robustez ante cambios de redacción y orden.
- Calculadora integrada (`calc-v1`) para preguntas sobre fechas, horas y aritmética que incluyen un bloque numérico; requiere decisio 0.50.1 o superior.
- Capacidades heredadas del modelo base Gemma 4 12B instruct, aunque el ajuste está orientado a la tarea de decisión.
- Sin soporte de visión: las imágenes no forman parte del entrenamiento de este modelo.
- No se documentan tool calling, agentes ni modo thinking específicos en la información disponible.

## Casos de uso

- Moderación y verificación de contenido: dado un texto y preguntas del tipo "¿este comentario contiene una amenaza?", el modelo devuelve una probabilidad calibrada que puede umbralizarse en un pipeline, permitiendo priorizar revisiones humanas según el riesgo.
- Enrutamiento de tickets de soporte: con preguntas de opción múltiple ("¿es una incidencia de facturación, técnica o comercial?"), las probabilidades por categoría permiten asignar el ticket y derivar los casos ambiguos a un agente humano.
- Evaluación automática de respuestas: para preguntas de sí/no sobre si una respuesta cumple ciertos criterios (relevancia, corrección factual), las probabilidades calibradas sirven como señal de calidad en un sistema de RLHF o de filtrado de datos.
- Extracción de señales en encuestas y formularios: convertir respuestas de texto libre en puntuaciones en una escala definida (por ejemplo, satisfacción de 1 a 5) con una distribución de probabilidad asociada, útil para análisis agregados.
- Verificación de hechos sobre documentos: comprobar si una afirmación está respaldada por un texto fuente mediante preguntas de sí/no, con una probabilidad que permite fijar umbrales de confianza.
- Clasificación de documentos en pipelines de ingestión: determinar si un documento pertenece a una categoría concreta antes de indexarlo, aprovechando la calibración para reducir falsos positivos.
- Despliegue local en Mac con Apple silicon: al estar en formato MLX 6-bit, permite servir el modelo en estaciones de trabajo Apple para prototipado y pruebas sin depender de GPU dedicadas.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 5.000 preguntas retenidas de la distribución de entrenamiento (mismas preguntas y misma lectura, en bf16):

| Conjunto | Gemma 4 12B base | Decisio tuned 12B anterior | Decisio v3 |
|---|---:|---:|---:|
| Todas las preguntas | 67,7% | 71,6% | 78,8% |
| Opción múltiple (2.792) | 68,9% | 71,7% | 79,8% |
| Sí/no (1.220) | 83,0% | 84,7% | 89,8% |
| Puntuación (988) | 45,1% | 55,2% | 62,2% |

Otros datos reportados:

| Prueba | Resultado |
|---|---|
| Preguntas sobre redacción y orden de opciones (1.050) | 81,2% (base 71,5%; anterior 75,6%) |
| Chequeo fuera de la distribución de entrenamiento (1.178) | 83,9% (base 83,2%) |
| Preguntas generales de lectura (1.028) | 73,4% (base 70,5%) |
| Brier score con temperaturas por tipo (mitad retenida) | 0,234 |
| Brier score con temperatura única 3,592 | 0,316 |
| Precisión con calculadora en preguntas numéricas (874) | ~83% (frente a ~57-60% sin calculadora) |
| Coincidencia de respuesta top frente a bf16 (300 preguntas) | 94,0% |

El autor advierte que estas cifras proceden de preguntas retenidas de su distribución de entrenamiento, medidas a través de decisio con modo batch-invariant desactivado, y no de un benchmark independiente.

## Requisitos de hardware

- El repositorio ocupa 9,7 GB en formato MLX 6-bit, por lo que se necesita al menos esa cantidad de memoria unificada disponible para cargar los pesos.
- Diseñado para Apple silicon (Mac con chip M-series); el autor no documenta despliegue en GPU NVIDIA.
- No se especifican requisitos de VRAM para otras plataformas; los pesos bf16 de referencia requerirían aproximadamente 24 GB de memoria, aunque este dato no está confirmado en la información disponible.
- Despliegue mediante decisio 0.50.1 o superior con el extra `mlx` (probado con decisio 0.50.2, mlx 0.32.4 y mlx-lm 0.32.2), usando el comando `uv run python -m decisio.serve.vllm_engine --backend mlx --base tachara-ai/Decisio-12b-tuned-v3-mlx-calibrated`.
- No se documentan latencia ni throughput estimados.
- El servidor rechaza arrancar si `decision_config.json` difiere del perfil del modelo base instalado en decisio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Decisio-12b-tuned-v3-mlx-calibrated | 11,9B | no disponible | Probabilidades calibradas para preguntas cerradas (MLX 6-bit) | Apache-2.0 | Hugging Face |
| google/gemma-4-12B-it | ~12B | no disponible | Modelo instruct generativo generalista | Apache-2.0 | Hugging Face |
| Decisio tuned 12B (versión anterior) | ~12B | no disponible | Preguntas cerradas, sin calibración por tipo | no disponible | Hugging Face (tachara-ai) |

La comparación con alternativas de la misma categoría (modelos de clasificación textual con probabilidades calibradas) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Las métricas publicadas se obtuvieron sobre preguntas retenidas de la distribución de entrenamiento, no sobre un benchmark independiente; pueden no generalizar a otros dominios.
- La calibración solo se mantiene a las temperaturas incluidas (choice 1.08, yes/no 1.43, score 1.10) y cuando el modelo se sirve mediante decisio; otros servidores que no apliquen temperatura producirán probabilidades más planas o más agudas de lo declarado.
- El modelo no ha sido entrenado con imágenes; no admite entradas visuales.
- No se documentan sesgos conocidos ni cobertura de idiomas; la información disponible no permite evaluar el comportamiento multilingüe.
- Riesgo de alucinación inherente al modelo base, aunque la tarea de decisión cerrada reduce la generación libre de texto.
- Requiere decisio 0.50.1 o superior; versiones anteriores sirven el modelo sin el bloque de calculadora y con peor rendimiento en preguntas numéricas.
- Las revisiones posteriores del repositorio pueden modificar `decision_config.json` (por ejemplo, la configuración de la calculadora) sin cambiar los pesos; se recomienda fijar un commit con `--base ...@<commit>` y verificar `SHA256SUMS`.
- Licencia Apache-2.0, que permite uso comercial, pero el `NOTICE` obliga a nombrar el repositorio y la revisión del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tachara-ai/Decisio-12b-tuned-v3-mlx-calibrated
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Repositorio de decisio: https://github.com/aminry/decisio
- Organización del autor: https://huggingface.co/tachara-ai
