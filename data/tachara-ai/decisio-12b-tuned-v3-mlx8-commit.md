# tachara-ai/Decisio-12b-tuned-v3-mlx8-commit

## Resumen

Decisio-12b-tuned-v3-mlx8-commit es un ajuste fino del modelo google/gemma-4-12B-it realizado por Tachara AI Lab, orientado especificamente a la tarea de responder preguntas cerradas sobre un texto: preguntas de si/no, de eleccion unica entre opciones y de puntuacion en una escala definida por el usuario. En lugar de generar texto libre, el modelo devuelve una probabilidad para cada opcion en un unico forward pass por pregunta, lo que lo convierte en un componente de clasificacion y decision dentro del servidor open source decisio. El repositorio contiene la variante "commit" en cuantizacion MLX de 8 bits, pensada para ejecutarse en Apple silicon.

El modelo parte de Gemma 4 12B instruct (11.907.350.272 parametros) y se ha afinado mediante un adaptador LoRA de rango 32 y alpha 64 entrenado durante una epoca sobre 463.859 preguntas, posteriormente fusionado en el modelo base. La relevancia actual reside en que mejora de forma medible al modelo base y a la version anterior de Decisio en precision sobre preguntas de la distribucion de entrenamiento, y ademas calibra sus probabilidades a temperaturas concretas por tipo de pregunta, algo poco habitual en modelos de clasificacion derivados de LLM.

La licencia es Apache 2.0, heredada del modelo base, lo que facilita su uso comercial. El modelo no esta pensado como un asistente general: su valor esta en la precision y calibracion de sus probabilidades sobre preguntas cerradas, no en generacion abierta ni en capacidades multimodales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Gemma 4 12B instruct); adaptador LoRA fusionado |
| Parametros totales | 11.907.350.272 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX 8 bits (group size 64), generado con mlx-lm 0.32.2; pesos bf16 de referencia tras la fusion |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 12,7 GB) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del transformer Gemma 4 12B instruct en su revision `707f0a3b8a3c7ad586ed01e27eafbad8a27dd0f7`. Sobre esa base se entreno un adaptador LoRA de rango 32 y alpha 64 durante una epoca sobre 463.859 preguntas, que se fusiono despues en el modelo base en float32 con redondeo estocastico con semilla a bf16. El archivo `decision_config.json` registra la fusion, el layout del prompt, el tipo de readout, la configuracion del calculador (`calc-v1`) y las temperaturas por tipo de pregunta: 1.08 para eleccion, 1.43 para si/no y 1.10 para puntuacion.

La innovacion tecnica principal no esta en la arquitectura sino en el procedimiento de calibracion y en la regla de "commit". Las temperaturas se obtienen ajustando el minimo log-loss por tipo de pregunta sobre la mitad de un split de validacion. Ademas, el modelo aplica la regla de commit de decisio a las respuestas de si/no: una probabilidad estrictamente entre 0,20 y 0,80 se reporta como 0,80 o 0,20, de modo que la respuesta nunca cambia pero la confianza declarada se aleja del centro de incertidumbre. La conversion a MLX 8 bits se realizo con mlx-lm 0.32.2 y group size 64.

## Capacidades

- Respuesta a preguntas cerradas sobre un texto: si/no, eleccion unica entre opciones y puntuacion en una escala definida por el usuario.
- Devolucion de una probabilidad por opcion en un unico forward pass por pregunta, lo que permite tratar la salida como una distribucion calibrada.
- Aplicacion de la regla de commit de decisio en preguntas de si/no (probabilidades entre 0,20 y 0,80 se reportan como 0,80 o 0,20).
- Calculo auxiliar con el bloque de calculador (`calc-v1`) para preguntas sobre fechas, horas y aritmetica que incluyen un bloque numerico, disponible con decisio 0.50.1 o posterior.
- Robustez frente a variaciones de redaccion y orden de opciones (81,2% en 1.050 preguntas de sondeo).
- Capacidades generales de lectura y comprension heredadas del modelo base (73,4% en 1.028 preguntas generales de lectura).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision, audio o thinking mode: no disponibles; las imagenes no forman parte del entrenamiento del modelo.

## Casos de uso

- Moderacion y clasificacion de contenido: el modelo puede recibir un texto y una pregunta de si/no (por ejemplo, "¿contiene este mensaje lenguaje de odio?") y devolver una probabilidad calibrada que se puede usar como umbral en un pipeline automatizado, gracias a la regla de commit que evita confianzas ambiguas.
- Encuestas y formularios estructurados: dado un texto libre de respuesta, el modelo puede mapearlo a una opcion de una pregunta de eleccion unica o a una puntuacion en una escala, con una probabilidad por opcion obtenida en un solo forward pass, lo que reduce el coste frente a generacion autoregresiva.
- Triaje de tickets de soporte: clasificacion de incidencias en categorias cerradas (tipo de problema, urgencia, area) mediante preguntas de eleccion, con probabilidades calibradas que permiten derivar a un humano cuando la confianza cae en la banda incierta.
- Verificacion de afirmaciones y control de calidad de datos: comprobaciones de si/no sobre pares texto-afirmacion para filtrar datasets o validar salidas de otros modelos, aprovechando la mejora en preguntas de si/no (89,8% en 1.220 preguntas retenidas).
- Evaluacion de riesgo en documentos: preguntas de si/no y de puntuacion sobre contratos, informes o politicas para asignar niveles de riesgo en una escala definida, con el bloque de calculador activado para tramos con fechas y cifras.
- Enrutamiento de decisiones en agentes: uso del modelo como componente de decision dentro de un agente mayor, donde cada paso requiere elegir entre opciones discretas y se necesita una probabilidad calibrada para la politica de seleccion.
- Despliegue local en Apple silicon: ejecucion en Macs con chip Apple mediante MLX 8 bits para prototipos y entornos de desarrollo sin GPU dedicada, usando el servidor decisio con el backend mlx.

## Benchmarks y rendimiento

Resultados sobre 5.000 preguntas retenidas de la distribucion de entrenamiento, en bf16 y medidas a traves de decisio con el modo batch-invariant desactivado:

| Conjunto | Gemma 4 12B base | Decisio tuned 12B anterior | Decisio v3 |
|---|---:|---:|---:|
| Todas las preguntas | 67,7% | 71,6% | **78,8%** |
| Eleccion (2.792) | 68,9% | 71,7% | **79,8%** |
| Si/no (1.220) | 83,0% | 84,7% | **89,8%** |
| Puntuacion (988) | 45,1% | 55,2% | **62,2%** |

Otras metricas reportadas por el autor:

| Prueba | Resultado |
|---|---|
| Preguntas de robustez a redaccion y orden (1.050) | 81,2% (base 71,5%, anterior 75,6%) |
| Preguntas fuera de la distribucion de entrenamiento (1.178) | 83,9% (base 83,2%) |
| Preguntas generales de lectura (1.028) | 73,4% (base 70,5%) |
| Brier score a temperaturas por tipo (mitad retenida) | 0,234 |
| Brier score a temperatura unica 3,592 | 0,316 |
| Precision con calculador activado (874 preguntas con bloque numerico) | ~83% (sin calculador ~57-60%) |
| Coincidencia de respuesta top con pesos bf16 (300 preguntas) | 95,7% |
| Regla de commit en si/no (1.220 preguntas) | 89,8% con y sin regla; log loss 0,232 a 0,253; 19,3% en la banda |

El autor advierte que estas cifras corresponden a preguntas retenidas de su propia distribucion de entrenamiento y no a un benchmark independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio MLX 8 bits ocupa 12,7 GB; en bf16 el modelo de ~11,9 mil millones de parametros requiere aproximadamente 24 GB de memoria.
- GPU recomendadas: no disponibles en la informacion proporcionada para CUDA; el repositorio esta orientado a Apple silicon mediante MLX.
- Cabe en GPU consumer: si, en el formato MLX 8 bits sobre Macs con memoria unificada de 16 GB o mas (con margen segun el contexto); en bf16 requiere al menos 24 GB.
- Opciones de despliegue: servidor decisio con backend MLX (`uv run python -m decisio.serve.vllm_engine --backend mlx --base tachara-ai/Decisio-12b-tuned-v3-mlx8-commit`), con decisio 0.50.1 o posterior y su extra mlx (probado con decisio 0.50.2, mlx 0.32.4 y mlx-lm 0.32.2). Otros servidores no aplican las temperaturas indicadas y producen probabilidades mas planas o mas agudas.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision (todas las preguntas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Decisio v3 (este) | 11,9 B | no disponible | 78,8% | Apache 2.0 | Hugging Face, formato MLX 8 bits |
| Decisio tuned 12B anterior | no disponible | no disponible | 71,6% | no disponible | Hugging Face |
| Gemma 4 12B it (base) | 11,9 B | no disponible | 67,7% | Apache 2.0 | Hugging Face |

La comparacion se limita a los modelos reportados por el autor en la model card; no se dispone de datos de benchmarks independientes ni de alternativas de otros proveedores para esta tarea especifica de decision con probabilidades calibradas.

## Limitaciones y advertencias

- Las cifras de rendimiento proceden de preguntas retenidas de la distribucion de entrenamiento, no de un benchmark independiente; pueden no generalizar a otros dominios.
- La calibracion solo se mantiene a las temperaturas incluidas (eleccion 1.08, si/no 1.43, puntuacion 1.10) y cuando el modelo se sirve con decisio; otros servidores producen probabilidades mas planas o mas agudas de lo declarado.
- Las imagenes no forman parte del entrenamiento del modelo; no debe esperarse capacidad de vision.
- Sesgos conocidos: no disponibles en la informacion proporcionada; al derivar de Gemma 4, hereda los sesgos del modelo base.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; el modelo responde a preguntas cerradas sobre un texto, pero puede asignar probabilidades erroneas si el texto no contiene la informacion necesaria.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no se detallan en la model card.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe conservar el archivo `NOTICE` que nombra el repositorio y la revision del modelo base.
- El servidor rechaza arrancar si `decision_config.json` difiere del perfil de decisio instalado, lo que exige versiones compatibles (0.50.1 o posterior).
- Las revisiones posteriores del repositorio pueden cambiar `decision_config.json` sin modificar los pesos; conviene fijar un commit con `--base ...@<commit>` y verificar con `SHA256SUMS`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tachara-ai/Decisio-12b-tuned-v3-mlx8-commit
- Repositorio del servidor decisio: https://github.com/aminry/decisio
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Laboratorio autor: https://huggingface.co/tachara-ai
