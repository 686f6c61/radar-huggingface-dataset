# tachara-ai/Decisio-12b-tuned-commit-think

## Resumen

Decisio-12b-tuned-commit-think es un ajuste fino de google/gemma-4-12B-it orientado a un uso muy concreto: responder preguntas tipadas sobre un estado dado devolviendo una probabilidad calibrada para cada opción. No es un modelo conversacional generalista, sino un motor de decisión que se sirve a través de la herramienta decisio (version 0.35.0 o superior) y que aplica una plantilla de prompt propia, una lectura de letras de opción y unas temperaturas ajustadas por tipo de pregunta. Lo publica el usuario tachara-ai bajo licencia Apache 2.0.

El modelo parte de Gemma 4 12B (revision 707f0a3b) al que se le ha fusionado un adaptador LoRA en fp32 y redondeado una sola vez a bf16. Comparte pesos con otras dos variantes del mismo autor (Decisio-12b-tuned-calibrated y Decisio-12b-tuned-commit); la única diferencia entre repositorios es el archivo decision_config.json, que define el comportamiento de servicio. La variante commit-think añade una segunda lectura con razonamiento de hasta 256 tokens únicamente para preguntas de tipo elección cuya probabilidad superior quede por debajo de 0,3712.

Su relevancia es acotada pero clara: ofrece una interfaz de decisión probabilística con calibración medida y con latencias controladas (mediana de 60 ms por decisión, máximo de 4,71 s en una RTX PRO 6000 en el conjunto evaluado), lo que lo hace útil para integrar decisiones automáticas auditables en pipelines donde no basta un texto generado, sino una distribución de probabilidad sobre opciones discretas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 4), con adaptador LoRA fusionado en los pesos |
| Parametros totales | 11.959.730.224 (11,96 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como cifra oficial; el servicio trunca estados de más de 45.000 tokens a su inicio |
| Tipos de cuantizacion | pesos publicados en bf16; no se documentan otras cuantizaciones en el repositorio |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (licencia del modelo base, Gemma 4 de Google) |
| Formato de pesos | safetensors (bf16), con decision_config.json y SHA256SUMS |

## Arquitectura y entrenamiento

La base es un transformer decoder-only de la familia Gemma 4, en su variante instruct de 12B (google/gemma-4-12B-it, revision 707f0a3b). Sobre ella se entrenó un adaptador LoRA que posteriormente se fusionó en los pesos base: la fusión se hizo en fp32 y se redondeó una única vez a bf16 de forma estocástica con semilla 0 mediante `python -m decisio.hub_bf16 merge`. Según la model card, la fusión conserva 0,999996 del cambio del adaptador en el espacio de pesos y el resto de tensores son los del modelo base byte a byte.

No se detallan ni la composición del dataset de entrenamiento ni el número de tokens utilizados; el autor indica explícitamente que los datos de entrenamiento no se revelan. Sí se especifica que no se usaron ítems de evaluación de Decision Index ni de JevBench, que el conjunto se decontaminó contra los test públicos de ambos boards y que se incluyeron splits oficiales de entrenamiento de algunos benchmarks públicos bajo sus licencias, verificando cada fila contra los test públicos. Las temperaturas del servicio se ajustaron por mínima log loss por tipo de pregunta y por banda de número de opciones (por ejemplo, 3,314 para sí/no, 2,1109 para score y entre 1,7181 y 2,1317 para elección según el número de opciones). La innovación técnica destacable es el mecanismo de commit-think: una relectura con hasta 256 tokens de razonamiento solo para preguntas de elección con probabilidad superior inferior a 0,3712, mezclando ambas lecturas.

## Capacidades

- Respuesta a preguntas tipadas sobre un estado: sí/no, score y elección entre opciones, devolviendo una probabilidad por opción.
- Calibración probabilística ajustada por tipo de pregunta y banda de número de opciones (2-10, 11-26, 27-255).
- Regla de commit para preguntas de sí/no que decide la respuesta final a partir de las probabilidades calibradas.
- Modo de razonamiento acotado (thinking) exclusivo para preguntas de elección con probabilidad superior por debajo de 0,3712, con un máximo de 256 tokens de razonamiento.
- Manejo de estados largos: trunca a 45.000 tokens desde el inicio y señala en la respuesta que el estado fue recortado.
- Servicio mediante decisio 0.35.0 o superior, con motor vLLM y endpoints de salud que exponen los valores por defecto del repositorio (`systemone.repository_defaults`, `systemone.flavor`).
- No se documentan capacidades de tool calling, agentes, visión, audio ni multilingüismo específico.

## Casos de uso

- Clasificación binaria automatizada con umbral calibrado: el modelo responde preguntas de sí/no con probabilidades ajustadas por mínima log loss y aplica una regla de commit, lo que permite fijar umbrales de aceptación en pipelines de decisión sin post-procesado adicional.
- Enrutamiento de tickets o solicitudes: dada una pregunta de elección con un conjunto cerrado de categorías (2 a 255 opciones), el modelo devuelve una distribución de probabilidad por categoría, útil para derivar casos al equipo adecuado y para medir la confianza de la asignación.
- Puntuación de riesgo o prioridad: las preguntas de tipo score permiten obtener una valoración numérica calibrada sobre un estado descrito, aprovechable en triaje de incidencias o priorización de colas.
- Decisión asistida sobre documentos largos: con estados de hasta 45.000 tokens, puede responder sobre contratos, informes o expedientes, con la salvedad de que los estados más largos se truncan al inicio y la respuesta lo indica; en la evaluación del autor, con hechos al inicio del documento acertó 17 de 20 casos.
- Segunda pasada con razonamiento en casos ambiguos: para preguntas de elección con baja confianza (probabilidad superior por debajo de 0,3712), el modelo relee con hasta 256 tokens de razonamiento; en el conjunto de decisiones multidominio difíciles el autor mide una mejora de 4,95 puntos en acierto frente a la pasada única.
- Automatización de decisiones auditables en producción: la latencia medida (mediana de 60 ms, máximo de 4,71 s en 2.044 decisiones sobre una RTX PRO 6000) y la exposición de los parámetros por defecto en el endpoint de salud facilitan el despliegue con trazabilidad de configuración.
- Evaluación de cuestionarios o encuestas estructuradas: al soportar preguntas de elección con hasta 255 opciones y calibración por banda, encaja en la codificación automática de respuestas abiertas contra catálogos cerrados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor sí reporta métricas internas de la variante commit-think frente al mismo modelo servido sin thinking:

| Conjunto | Métrica | Resultado |
|---|---|---|
| Decisiones multidominio difíciles (525 preguntas) | Mejora en acierto de la respuesta superior | +4,95 puntos (intervalo 90%: 3,43 a 6,67; 27 corregidas, 1 rota) |
| Decisiones multidominio difíciles (525 preguntas) | Porcentaje de preguntas que activan thinking | 8,95% |
| Preguntas en lenguaje natural (939) | Mejora en acierto de la respuesta superior | +0,75 puntos (intervalo 90%: 0,21 a 1,38; 9 corregidas, 2 rotas) |
| Preguntas en lenguaje natural (939) | Porcentaje de preguntas que activan thinking | 2,56% |
| Ítems de desarrollo mixtos (430) | Preguntas que activan thinking | 0% |
| Calibración en preguntas de elección | Error de calibración, pasada única / con thinking | 0,048 / 0,050 |
| 2.044 decisiones | Latencia máxima / mediana | 4,71 s / 60 ms (RTX PRO 6000) |
| Razonamientos generados | Longitud mediana / porcentaje que alcanza el tope de 256 tokens | 170 tokens / 29% |
| 60 documentos largos con hechos al inicio, medio o final | Aciertos en menos de 10 s con truncado | 39 de 60 (17/20 al inicio, 14/20 en medio, 9/20 al final) |

El propio autor advierte que los ajustes se eligieron sobre el conjunto de 525 preguntas, por lo que la mejora de 4,95 puntos es optimista; la cifra de 0,75 puntos sobre preguntas en lenguaje natural, no usadas para elegir los ajustes, es la estimación más conservadora.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bf16 ocupan aproximadamente 24 GB (tamaño del repositorio), por lo que se necesita al menos esa cantidad más el espacio de caché KV y activaciones; no se documentan cuantizaciones alternativas.
- GPU recomendadas: el autor reporta mediciones en una RTX PRO 6000; por capacidad de memoria, encajan GPUs con 32 GB o más, como A100 40/80 GB, H100, L40S o RTX 6000 Ada.
- GPU de consumo: no cabe en GPUs de consumo de 24 GB o menos en bf16 sin cuantización, y el repositorio no publica versiones GGUF ni cuantizadas.
- Opciones de despliegue: vLLM mediante `python -m decisio.serve.vllm_engine --base tachara-ai/Decisio-12b-tuned-commit-think` con decisio 0.35.0 o superior. vLLM por sí solo carga los pesos como un checkpoint Gemma 4 ordinario, pero no aplica la plantilla de prompt, la lectura de letras de opción, las temperaturas ni la regla de commit de decisio.
- Latencia y throughput: mediana de 60 ms por decisión y máximo de 4,71 s sobre 2.044 decisiones en una RTX PRO 6000; la primera lectura de un estado truncado tarda unos 7,5 s. No se publica throughput agregado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Decisio-12b-tuned-commit-think | 11,96 B | no disponible (trunca a 45.000 tokens) | Decisión probabilística tipada con thinking selectivo | Apache 2.0 | Hugging Face (24 descargas) |
| Decisio-12b-tuned-commit | 11,96 B (mismos pesos) | no disponible | Decisión probabilística tipada sin thinking | Apache 2.0 | Hugging Face |
| Decisio-12b-tuned-calibrated | 11,96 B (mismos pesos) | no disponible | Probabilidades calibradas sin regla de commit | Apache 2.0 | Hugging Face |
| google/gemma-4-12B-it | 12 B | no disponible | Modelo instruct generalista | Apache 2.0 | Hugging Face (modelo base) |

Las tres variantes Decisio comparten pesos byte a byte y solo difieren en decision_config.json, por lo que la comparación relevante es de configuración de servicio, no de capacidad del modelo. Frente al Gemma 4 12B-it original, la diferencia es la especialización en salida probabilística tipada y la calibración, a costa de perder el uso conversacional general. No se dispone de datos para comparar con otros modelos de decisión de la misma categoría.

## Limitaciones y advertencias

- Modelo especializado: no está pensado como asistente conversacional general; fuera del formato de preguntas tipadas de decisio su comportamiento no está garantizado.
- Dependencia estricta de decisio 0.35.0 o superior; versiones anteriores no reconocen el flavor del repositorio, y servir solo con vLLM omite la plantilla, las temperaturas y la regla de commit.
- Truncado de estados: cualquier estado de más de 45.000 tokens se recorta a su inicio y se responde sin thinking; en la evaluación del autor, los aciertos caen cuando el hecho decisivo está al final del documento (9 de 20 frente a 17 de 20 al inicio).
- Sesgos conocidos: no documentados en la información disponible; al derivar de Gemma 4, hereda los sesgos del modelo base, no cuantificados aquí.
- Riesgo de alucinación: no evaluado específicamente; la salida es una distribución sobre opciones cerradas, lo que acota el espacio de respuesta, pero la calibración reportada (error 0,048-0,050) implica un margen de error no nulo.
- Idiomas soportados: no disponibles; no se documenta cobertura multilingüe ni rendimiento por idioma.
- Datos de entrenamiento no revelados, lo que limita la reproducibilidad y la auditoría del ajuste.
- Las mejoras reportadas con thinking se eligieron sobre el conjunto de 525 preguntas multidominio, por lo que esa cifra está sesgada al alza; la estimación independiente es de +0,75 puntos.
- Licencia Apache 2.0 heredada del modelo base; se debe conservar LICENSE y NOTICE de Gemma 4 y verificar las condiciones de uso comercial de la licencia del modelo base.
- Repositorio con muy poca adopción (24 descargas, 0 likes) y sin pipeline declarado, lo que implica poca validación externa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tachara-ai/Decisio-12b-tuned-commit-think
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Repositorio de la herramienta decisio: https://github.com/aminry/decisio
- Variante Decisio-12b-tuned-commit: https://huggingface.co/tachara-ai/Decisio-12b-tuned-commit
- Variante Decisio-12b-tuned-calibrated: https://huggingface.co/tachara-ai/Decisio-12b-tuned-calibrated
