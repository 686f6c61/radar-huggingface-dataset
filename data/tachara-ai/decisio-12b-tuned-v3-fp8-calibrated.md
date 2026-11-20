# tachara-ai/Decisio-12b-tuned-v3-fp8-calibrated

## Resumen

Decisio-12b-tuned-v3-fp8-calibrated es un modelo derivado de google/gemma-4-12B-it, desarrollado por Tachara AI Lab, especializado en responder preguntas cerradas sobre un texto (si/no, eleccion unica entre opciones y puntuaciones en una escala definida) devolviendo una probabilidad calibrada por opcion en un unico forward pass por pregunta. No es un modelo conversacional generalista: es un cabezal de decision supervisado sobre el que se ha aplicado un ajuste fino con LoRA y una cuantizacion posterior a FP8 calibrada para el servidor open source decisio.

El modelo resuelve un problema concreto: convertir un LLM generativo en un estimador de probabilidad fiable para tareas de clasificacion y scoring, evitando el sesgo de formato y la sobreconfianza tipicos de los modelos base cuando se les pide una respuesta categorica. Segun la model card, mejora al Gemma 4 12B base en 11,1 puntos porcentuales sobre 5.000 preguntas retenidas de su distribucion de entrenamiento (67,7% a 78,8%), y al Decisio tuned 12B anterior en 7,2 puntos (71,6% a 78,8%).

La relevancia actual esta en el nicho de evaluacion automatizada y enrutamiento: pipelines que necesitan probabilidades calibradas, no texto libre. El repositorio incluye pesos en FP8 (unos 12 GB), un fichero `decision_config.json` con el layout de prompt, el readout y las temperaturas por tipo de pregunta, y sumas SHA256 para verificar integridad. La licencia es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (gemma4_unified), ajuste fino con LoRA sobre google/gemma-4-12B-it |
| Parametros totales | 11.959.730.224 (11,96 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (calibrada); el merge original se realiza en bf16 y se cuantiza una vez a FP8 |
| Idiomas soportados | no disponible (heredados del base, sin declaracion explicita) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors), tamano de repo 13,1 GB |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-12B-it` en la revision `707f0a3b8a3c7ad586ed01e27eafbad8a27dd0f7`. Sobre esa base se entrena un adaptador LoRA de rango 32 y alpha 64 durante una epoca sobre 463.859 preguntas, y despues se fusiona en el modelo base en float32 con redondeo estocastico con semilla a bf16. El fichero `decision_config.json` registra los detalles del merge. Posteriormente, el merge se cuantiza una unica vez a FP8 mediante el pipeline de decisio.

La innovacion principal no esta en la arquitectura sino en el readout y la calibracion: el servidor decisio aplica un layout de prompt fijo, extrae la probabilidad de cada opcion en un solo forward pass y aplica temperaturas ajustadas por tipo de pregunta (choice 1,08; yes/no 1,43; score 1,10), obtenidas por minimo log-loss sobre la mitad de un split retenido. Incluye un bloque de calculadora (`calc-v1`) que mejora preguntas de fechas, horas y aritmetica con bloque numerico de aproximadamente 57-60% a aproximadamente 83% de acierto (874 preguntas). El modelo no ha sido entrenado con imagenes.

## Capacidades

- Respuesta a preguntas cerradas sobre un texto: si/no, eleccion entre opciones y puntuacion en una escala definida por el usuario.
- Devolucion de probabilidad calibrada por opcion en un unico forward pass por pregunta, sin regla de commit aplicada.
- Robustez frente a reformulaciones y orden de opciones: 81,2% en 1.050 preguntas de perturbacion, frente a 71,5% del base y 75,6% del Decisio anterior.
- Generalizacion fuera de distribucion: 83,9% en 1.178 preguntas de comprobacion (base 83,2%) y 73,4% en 1.028 preguntas de lectura general (base 70,5%).
- Soporte de calculadora para preguntas con bloque numerico (fechas, horas, aritmetica), integrado via decisio 0.50.1 o superior.
- No soporta tool calling general, agentes multi-step ni vision; su scope es el readout de decision descrito.
- Capacidades multilingues: no disponibles de forma explicita; dependen del modelo base.

## Casos de uso

- Evaluacion automatizada de respuestas generadas: dado un texto y una rúbrica binaria o de eleccion, el modelo devuelve la probabilidad de que cada criterio se cumpla, lo que permite umbrales ajustables y agregacion estadistica en lugar de juicios binarios ruidosos.
- Enrutamiento y triaje de tickets: clasificar un mensaje de soporte en categorias predefinidas con probabilidad calibrada por categoria, aprovechando la robustez al orden de opciones para evitar sesgos de posicion en la lista.
- Moderacion y filtrado de contenido: preguntas si/no sobre politicas concretas con probabilidades calibradas, utiles para fijar umbrales de revision humana segun el coste del falso positivo.
- Extraccion de senales de calidad en datasets: puntuar pares pregunta-respuesta en una escala definida para priorizar datos de entrenamiento o detectar ejemplos de baja calidad.
- Analisis de sentimiento y opinion a nivel de aspecto: preguntas de eleccion o escala sobre atributos concretos de una resena, con probabilidad por opcion para agregar en dashboards.
- Verificacion de hechos acotada: preguntas si/no sobre afirmaciones extraidas de un texto fuente, con la calculadora activada para afirmaciones con fechas o cifras.
- Scoring en encuestas y formularios abiertos: mapear respuestas de texto libre a escalas Likert con probabilidades calibradas, aprovechando la temperatura especifica para preguntas de tipo score.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre preguntas retenidas de su distribucion de entrenamiento, medidos a traves de decisio con batch-invariant mode desactivado. No son benchmarks independientes.

| Conjunto | Base Gemma 4 12B | Decisio tuned 12B anterior | Decisio v3 |
|---|---:|---:|---:|
| Todas las preguntas (5.000) | 67,7% | 71,6% | 78,8% |
| Eleccion (2.792) | 68,9% | 71,7% | 79,8% |
| Si/no (1.220) | 83,0% | 84,7% | 89,8% |
| Score (988) | 45,1% | 55,2% | 62,2% |
| Perturbacion de redaccion y orden (1.050) | 71,5% | 75,6% | 81,2% |
| Fuera de distribucion (1.178) | 83,2% | no disponible | 83,9% |
| Lectura general (1.028) | 70,5% | no disponible | 73,4% |

Metricas adicionales reportadas:

| Metrica | Valor |
|---|---|
| Brier score con temperaturas por tipo (mitad retenida) | 0,234 |
| Brier score con temperatura unica de 3,592 | 0,316 |
| Acierto con calculadora en preguntas numericas (874) | aproximadamente 83% (sin calculadora 57-60%) |
| Coincidencia de respuesta top con pesos bf16 (1.000 preguntas) | 97,0% |
| Cambio medio de probabilidad frente a bf16 | 0,015 (maximo 0,114) |

## Requisitos de hardware

- VRAM estimada en FP8: aproximadamente 12-13 GB solo para pesos, mas overhead de KV cache y activaciones; en la practica se recomienda una GPU con 24 GB o mas para contextos moderados.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para despliegues de una sola instancia. En consumer, una RTX 4090 o RTX 3090 de 24 GB es el minimo realista en FP8.
- Despliegue: el camino soportado es `decisio.serve.vllm_engine` con decisio 0.50.1 o superior y su extra de vLLM (probado con decisio 0.50.2 y vLLM 0.31.0). Otros servidores que no apliquen temperatura devolveran probabilidades mas planas o mas agudas que las declaradas.
- El servidor rechaza arrancar si `decision_config.json` difiere del perfil del base instalado en decisio; conviene fijar el commit con `@<commit>`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Decisio-12b-tuned-v3-fp8-calibrated | 11,96 B | no disponible | Clasificacion y scoring con probabilidad calibrada | Apache-2.0 | Hugging Face, requiere decisio |
| google/gemma-4-12B-it (base) | 12 B | no disponible | LLM instructivo generalista | Apache-2.0 | Hugging Face |
| Decisio tuned 12B anterior | 12 B | no disponible | Igual que v3, version previa | Apache-2.0 | Hugging Face (repo del autor) |

Frente al base, la diferencia medible es de 11,1 puntos en el conjunto agregado y de 17,1 puntos en preguntas de tipo score. Frente al Decisio anterior, la mejora es de 7,2 puntos con un limite inferior del intervalo del 90% en +6,2. La comparacion con modelos de clasificacion dedicados (por ejemplo, clasificadores encoder-only o modelos de NLI) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Las cifras proceden de preguntas retenidas de la distribucion de entrenamiento del autor, no de un benchmark independiente; la generalizacion a dominios muy distintos no esta cuantificada.
- La calibracion solo se sostiene con las temperaturas incluidas y sirviendo con decisio; otros servidores sin temperatura produciran probabilidades mas planas o mas agudas que las declaradas.
- Requiere decisio 0.50.1 o superior; versiones anteriores sirven el modelo sin el bloque de calculadora, degradando el rendimiento en preguntas numericas.
- No ha sido entrenado con imagenes: cualquier tarea multimodal queda fuera de su alcance.
- El modelo esta disenado para preguntas cerradas; el uso como chat abierto o generacion libre no esta validado y probablemente rinda por debajo del base.
- Sesgos conocidos: no disponibles de forma explicita; hereda los del modelo base Gemma 4 12B.
- Riesgo de alucinacion: acotado por el formato de preguntas cerradas, pero las probabilidades pueden ser erroneas en dominios alejados de la distribucion de entrenamiento.
- Restricciones de licencia: Apache-2.0 permite uso comercial; el fichero `NOTICE` debe conservarse y nombra el repositorio y revision del base.
- El repositorio puede recibir revisiones que cambien `decision_config.json` sin tocar los pesos; conviene fijar commit y verificar con `SHA256SUMS`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tachara-ai/Decisio-12b-tuned-v3-fp8-calibrated
- Organizacion del autor: https://huggingface.co/tachara-ai
- Servidor decisio: https://github.com/aminry/decisio
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
