# Synth-NLP/kev-0.8b-massive-pt-br-D1-v4

## Resumen

Kev-0.8b-massive-pt-br-D1-v4 es un ajuste fino tipo delta (LoRA más una cabeza de puntero) sobre el modelo base jaredpalmer/kev-0.8b, desarrollado por Synth-NLP. Está especializado en clasificación de intenciones en portugués de Brasil sobre el conjunto de datos MASSIVE, con un formato de decisión restringido a 20 opciones por frase. No es un modelo generativo de propósito general, sino un modelo de decisión: recibe una frase y debe seleccionar una de las 20 intenciones candidatas.

El modelo forma parte de un experimento comparativo más amplio que contrasta datos sintéticos generados mediante una pipeline agéntica frente a datos reales, evaluando el efecto en modelos de decisión de distintos tamaños (Laya, Kev-0.8B, 4B y 9B). Este brazo concreto, D1_v4, combina el conjunto de entrenamiento real con datos sintéticos de la versión v4, que abarca 30 vistas y 30 intenciones nuevas, sumando 25.788 líneas.

Con 0,8 mil millones de parámetros y una licencia Apache 2.0, el modelo es relevante para quienes investigan clasificación de intenciones de bajo coste computacional y para quienes quieren reproducir o extender el experimento de datos sintéticos frente a reales en tareas de decisión multilingües. El repositorio ocupa aproximadamente 0,1 GB y los pesos se distribuyen en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base jaredpalmer/kev-0.8b) con adaptador LoRA y cabeza de puntero para selección entre opciones |
| Parametros totales | 0,8 mil millones (modelo base); el adaptador LoRA añade un número no especificado |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bf16 durante el entrenamiento) |
| Idiomas soportados | portugués (pt), concretamente portugués de Brasil (pt-BR) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de jaredpalmer/kev-0.8b, un transformer de 0,8 mil millones de parámetros, y se ajusta mediante un delta compuesto por LoRA más una cabeza de puntero que restringe la salida a la selección de una entre 20 intenciones candidatas. La base permanece congelada en bf16 durante el entrenamiento, y los aumentos de datos propios de Kev se desactivan: no se emplea la opción "ninguna de las anteriores" ni distractores adicionales.

El entrenamiento se realizó con el comando `python -m kev.train --init_from jaredpalmer/kev-0.8b`, con tasa de aprendizaje 2e-5, 2 épocas, tamaño de lote 8, precisión bf16 y semilla 0. Los datos del brazo D1_v4 combinan el conjunto real con el sintético v4, que cubre 30 vistas y 30 intenciones nuevas, totalizando 25.788 líneas con las mismas 20 opciones por frase que el brazo equivalente de Laya. No se especifica en la información disponible si hubo RLHF, DPO ni el número total de tokens de entrenamiento del modelo base.

## Capacidades

- Clasificación de intenciones en portugués de Brasil: selecciona una intención entre 20 opciones candidatas para una frase dada.
- Decisión restringida: la cabeza de puntero limita la salida a las opciones proporcionadas, sin generación libre de texto.
- Generalización a intenciones no vistas: el modelo se evaluó en escenarios reservados que nunca aparecieron durante el entrenamiento.
- Especialización en el dominio MASSIVE pt-BR: orientado a frases de asistente virtual y comandos de usuario.
- Despliegue mediante API: el autor indica el uso de `uv run --extra serve python -m kev.serve --run <este repo>`, con una API "System One" similar a la de Jev.
- No se documentan capacidades de tool calling, agentes, visión, audio, matemáticas ni razonamiento multi-paso.

## Casos de uso

- Clasificación de intenciones en asistentes virtuales en portugués de Brasil: el modelo recibe la frase del usuario y devuelve una de las 20 intenciones del esquema MASSIVE, lo que permite enrutar la petición al flujo de diálogo adecuado con un coste de inferencia muy bajo gracias a sus 0,8 mil millones de parámetros.
- Enrutamiento de comandos en sistemas de voz o chat: al estar entrenado sobre MASSIVE pt-BR, encaja en pipelines de atención al cliente donde cada mensaje debe mapearse a una acción concreta (consultar saldo, cambiar dirección, cancelar pedido, etc.).
- Investigación sobre datos sintéticos: sirve como brazo de comparación en el experimento de Synth-NLP que mide si el entrenamiento con datos sintéticos generados por una pipeline agéntica iguala al entrenamiento con datos reales en tareas de decisión.
- Evaluación de generalización: sus resultados en intenciones no vistas (0,815 de precisión) lo hacen útil para estudiar la robustez de clasificadores de intención ante categorías nuevas.
- Prototipado rápido de clasificadores de intención: al ocupar 0,1 GB y requerir poca memoria, permite iterar localmente antes de escalar a modelos mayores del mismo experimento (4B y 9B).
- Despliegue en entornos con recursos limitados: la API de servicio incluida permite exponer el modelo como endpoint de decisión en infraestructura modesta, sin necesidad de GPUs de gran capacidad.

## Benchmarks y rendimiento

| Conjunto de evaluación | Métrica | Resultado |
|---|---|---|
| Validación MASSIVE pt-BR, intenciones vistas (20 opciones, media de 3 sorteos) | Precisión | 0,917 |
| Validación MASSIVE pt-BR, intenciones no vistas (escenarios reservados, media de 3 sorteos) | Precisión | 0,815 |

No se han publicado en la información disponible resultados de benchmarks estándar como MMLU, HumanEval o GSM8K, ni comparaciones numéricas directas con los otros brazos del experimento (Laya, 4B, 9B).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 0,8 mil millones de parámetros, en bf16 los pesos ocupan aproximadamente 1,6 GB, y en cuantización de 8 bits alrededor de 0,8 GB (estimación a partir del tamaño del modelo, no confirmada por el autor).
- GPU recomendadas: no especificadas; por tamaño, cualquier GPU consumer con al menos 4 GB de VRAM debería poder alojar el modelo en bf16, aunque no se confirma en la documentación.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño del modelo base, aunque no se detalla qué modelos concretos se han probado.
- Opciones de despliegue: el autor documenta el servidor propio de Kev mediante `uv run --extra serve python -m kev.serve --run <este repo>`, con una API "System One". No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Synth-NLP/kev-0.8b-massive-pt-br-D1-v4 | 0,8B | no disponible | Clasificación de intenciones MASSIVE pt-BR (20 opciones) | Apache 2.0 | Hugging Face |
| Brazo Laya del mismo experimento (D1_v4) | no disponible | no disponible | Clasificación de intenciones MASSIVE pt-BR (20 opciones, mismas líneas) | no disponible | no disponible |
| Brazos 4B y 9B del mismo experimento | 4B / 9B | no disponible | Clasificación de intenciones MASSIVE pt-BR | no disponible | no disponible |

La información disponible no incluye resultados numéricos de los brazos Laya, 4B y 9B, por lo que no es posible establecer una comparación de rendimiento cuantitativa entre ellos y este modelo.

## Limitaciones y advertencias

- Modelo de decisión restringido: no genera texto libre; solo elige entre las 20 opciones proporcionadas, por lo que no sirve para tareas generativas.
- Cobertura lingüística limitada al portugués de Brasil; no se documenta soporte para otras variantes del portugués ni otros idiomas.
- Rendimiento inferior en intenciones no vistas (0,815) frente a las vistas (0,917), lo que indica una generalización parcial a categorías nuevas.
- Entrenado sobre MASSIVE pt-BR: puede degradarse fuera de ese dominio o con esquemas de intenciones distintos a los 20 utilizados.
- Los aumentos de datos de Kev están desactivados, de modo que el modelo no maneja la opción "ninguna de las anteriores" ni distractores adicionales.
- No se especifican sesgos conocidos, riesgos de alucinación (limitados por el formato de decisión cerrada) ni detalles sobre la composición del dataset sintético más allá del número de líneas.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base jaredpalmer/kev-0.8b, de la que depende.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y no se documentan pruebas en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Synth-NLP/kev-0.8b-massive-pt-br-D1-v4
- Modelo base: https://huggingface.co/jaredpalmer/kev-0.8b
- Conjunto de datos MASSIVE: no disponible en la información proporcionada
- Paper o blog del experimento: no disponible en la información proporcionada
- Repositorio de código de Kev: no disponible en la información proporcionada
