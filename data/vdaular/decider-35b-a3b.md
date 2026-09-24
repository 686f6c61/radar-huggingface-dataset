# vdaular/decider-35b-a3b

## Resumen

decider-35b-a3b es un modelo de decisión, no un modelo generativo de texto. Su función es leer un estado (cadena, objeto o array de hasta 32k tokens) junto con una o varias preguntas tipadas, cada una con una lista explícita de opciones, y devolver una distribución de probabilidad sobre esas opciones en un único forward pass. No hay decodificación, ni parseo de la salida, ni respuestas fuera del conjunto de opciones definido por quien lo invoca: está pensado para ser llamado desde software, no para conversar. Se presenta como una reproducción abierta de la clase de modelos "System One" (el modelo Jev de TypeSafe AI).

El modelo parte de Qwen3.5-35B-A3B-Base, un transformer de mezcla de expertos con 34.660.610.688 parámetros totales y unos 3B activos por token: 256 expertos enrutados con 8 activos más un experto compartido, 40 capas de las cuales 10 usan atención completa y 30 atención lineal gated delta-net. Sobre esa base se aplicó la receta supervisada de decider-2b —una época de entropía cruzada sobre el readout de slot, con los expertos enrutados congelados y el optimizador Muon sobre las matrices de bloque—, sin ninguna etapa de RL.

Es relevante porque traslada el patrón de "clasificador grande con opciones cerradas" a la escala de 35B: frente a decider-2b v10 mejora la exactitud en 93 de las 95 tareas de regresión reportadas (0,855 in-task y 0,810 held-out), sube 6,7 puntos en 847 filas de validación, 5,0 en OpenJev, 6,9 en Mind2Web y 5,9 en las filas de flujo de trabajo de TypeSafe, y alcanza 0,676 en el nivel hard de JevBench frente a 0,459 del 2B. El coste es de 3 a 4 veces por decisión y un requisito de 80 GB de VRAM en bf16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos con atención híbrida: 40 capas, 10 con atención completa y 30 con atención lineal gated delta-net; 256 expertos enrutados con 8 activos por token más un experto compartido; `experts_implementation: grouped_mm` (los 256 expertos de una capa se ejecutan como una única multiplicación de matrices agrupada) |
| Parametros totales | 34.660.610.688 (34,7B) |
| Parametros activos | ~3B por token (MoE) |
| Longitud de contexto | 32k tokens para el estado de entrada (el estado puede ser cadena, objeto o array); cada pregunta y cada nivel de Score se puntúa en su propia fila |
| Tipos de cuantizacion | bf16 (checkpoint de este repositorio); NVFP4 (19,6 GB) en `Mapika/decider-35b-a3b-nvfp4` |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3.5-35B-A3B-Base: un transformer MoE de 40 capas con 256 expertos enrutados (8 activos por token) más un experto compartido, y una combinación de atención completa en 10 capas y atención lineal gated delta-net en las 30 restantes. En total, 34,7B parámetros de los que unos 3B se activan por token. La configuración del repositorio fija `experts_implementation: grouped_mm`, de modo que los 256 expertos de una capa se ejecutan como una sola multiplicación de matrices agrupada.

El entrenamiento no es un ajuste generativo: se aplicó la receta supervisada ya usada en decider-2b, consistente en una época de entropía cruzada sobre el readout de slot (los logits de la letra en la posición de respuesta, con softmax sobre las opciones) sobre la mezcla pública de decisiones. Durante ese proceso los expertos enrutados permanecieron congelados y solo se actualizaron las matrices de bloque, con el optimizador Muon. El modelo card indica explícitamente que no hubo etapa de RL. Un efecto medible de esa ausencia de RL es que, en tareas de navegador en vivo, la política greedy supera a la del 2B (97,2% frente a 90,9%) mientras que la política muestreada queda por detrás (86,4% frente a 93,2%).

## Capacidades

- Decisión tipada con opciones cerradas: dada una pregunta con una lista de opciones, devuelve la opción elegida, su confianza y la distribución completa de probabilidades sobre las opciones.
- Múltiples preguntas por estado, evaluadas en el mismo forward pass y en filas independientes.
- Preguntas con entre 2 y 255 opciones.
- Entrada de estado flexible: cadena, objeto o array de hasta 32k tokens.
- Puntuación por lotes mediante `decide_batch`, que permite evaluar muchos estados con muchas preguntas en una sola llamada.
- Abstención calibrada mediante el parámetro `abstain_below=t`, que devuelve `None` cuando la confianza queda por debajo del umbral.
- Modo de decisión en un solo paso (system-one, one-pass), sin decodificación autoregresiva ni parseo de la salida.
- Compatibilidad con el formato de petición de TypeSafe: `system_one` y `decider.serve` aceptan `POST /v1/systemone`, y el SDK oficial `typesafe-sdk` funciona apuntando `TYPESAFE_BASE_URL` al servidor.
- Tareas de decisión evaluadas que cubren enrutamiento, clasificación, juicios, conocimiento, preguntas multi-paso, políticas largas y agentes de navegador.
- No se documenta en la información disponible soporte de tool calling, agentes multi-step generales, visión, audio, ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Enrutamiento de tickets y correo entrante: con una pregunta del tipo "¿Qué departamento debe gestionarlo?" y opciones cerradas (facturación, soporte técnico, ventas), el modelo devuelve la opción y una probabilidad calibrada que puede usarse como umbral para derivar a revisión humana. El ejemplo de la propia model card reproduce este patrón con confianza 0,99.
- Clasificación de intenciones en asistentes conversacionales: el estado puede incluir todo el historial de la conversación (hasta 32k tokens) y las preguntas pueden descomponer la intención en varias decisiones tipadas que el agente consume después.
- Agentes de navegador: en tareas de navegador en vivo reporta un 97,2% con política greedy, y mejora en 6,9 puntos a decider-2b en Mind2Web; es adecuado cuando la acción a tomar debe elegirse entre un conjunto discreto de elementos de la página.
- Triage con abstención en producción: usando `abstain_below`, el sistema solo automatiza las decisiones por encima del umbral de confianza y encola el resto para un operario, lo que permite ajustar el compromiso entre cobertura y precisión.
- Automatización de flujos de trabajo con políticas largas: las filas de flujo de trabajo de TypeSafe mejoran 5,9 puntos respecto al 2B, por lo que encaja en la evaluación de condiciones de negocio descritas textualmente en documentos largos.
- Etiquetado y anotación a escala: `decide_batch` permite puntuar grandes volúmenes de estados con un conjunto fijo de preguntas y opciones, generando etiquetas con distribución de probabilidad asociada para auditar la calibración.
- Extracción de decisiones estructuradas en pipelines de datos: al no generar texto libre, la salida siempre es una de las opciones definidas, lo que evita fallos de parseo y simplifica la validación de esquema en ETL y en colas de mensajes.
- Evaluación de juicios con múltiples criterios: varias preguntas por estado permiten obtener, en una sola pasada, decisiones independientes (por ejemplo, categoría, urgencia y necesidad de reembolso) sobre el mismo texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los datos disponibles son comparativas internas frente a otros modelos de la familia decider sobre tareas de decisión:

| Metrica | decider-35b-a3b v1 | decider-2b v10 | decider-4b v1 |
|---|---|---|---|
| Regresión in-task | 0,855 | 0,805 | 0,834 |
| Regresión held-out | 0,810 | 0,755 | 0,788 |
| Tareas por encima del 2B | — | — | 87 de 95 |
| JevBench (hard) | 0,676 | 0,459 | 0,541 |
| Bespoke, suite pública (macro) | 0,774 | 0,704 | 0,757 |
| Navegador en vivo, greedy | — | 90,9% | — |
| Navegador en vivo, muestreado | — | 93,2% | — |

Diferencias reportadas frente a decider-2b v10 en las mismas filas: exactitud superior en 93 de las 95 tareas de regresión, +6,7 puntos en las 847 filas de validación, +5,0 en OpenJev, +6,9 en Mind2Web y +5,9 en las filas de flujo de trabajo de TypeSafe. La log-verosimilitud negativa baja entre 0,12 y 0,24 nats en todos los fixtures. El modelo card indica que el 35B no fue entrenado con RL y que su política greedy en tareas de navegador en vivo alcanza el 97,2% frente al 90,9% del 2B, mientras que su política muestreada queda en el 86,4% frente al 93,2%.

## Requisitos de hardware

- VRAM para inferencia en bf16: los pesos ocupan 65 GB, y la model card exige una GPU con al menos 80 GB de memoria.
- GPU recomendadas para bf16: A100 80 GB, H100 80 GB, H200 y equivalentes de 80 GB o más.
- Alternativa cuantizada: el checkpoint NVFP4 ocupa 19,6 GB (`Mapika/decider-35b-a3b-nvfp4`) y está pensado para vLLM y TensorRT-LLM sobre hardware Blackwell; la model card reporta 1,0 a 1,5 puntos por debajo del bf16 en los fixtures medidos.
- GPU de consumo: la versión bf16 (65 GB de pesos) no cabe en ninguna GPU de consumo. Para NVFP4, la información disponible solo menciona hardware Blackwell a través de vLLM y TensorRT-LLM; no se detallan modelos concretos de consumo.
- Opciones de despliegue: el paquete incluye `decider/`, el subconjunto de inferencia del paquete de GitHub, con la clase `decider.infer.Decider`, y `decider.serve` expone `POST /v1/systemone`. Para el checkpoint NVFP4 se indican vLLM y TensorRT-LLM. No se mencionan llama.cpp, Ollama, TGI ni GGUF en la información disponible.
- Dependencias: `torch>=2.14`, `transformers>=5.17` y `flash-linear-attention`.
- Latencia y throughput: no disponibles para el modelo de 35B. Como referencia de la familia, decider-2b v10 se ejecuta en 4 ms por petición con CUDA graphs en una sola GPU. El modelo card sitúa el coste del 35B en 3 a 4 veces el del 2B por decisión. El ejemplo de uso del repositorio instancia el modelo con `use_graphs=False`.

## Comparativa con modelos similares

| Modelo | Base | Peso de pesos | Parametros | Uso previsto | Metricas reportadas | Licencia |
|---|---|---|---|---|---|---|
| decider-35b-a3b v1 | Qwen3.5-35B-A3B-Base (3B activos) | 65 GB bf16 | 34,7B totales / 3B activos | Exactitud para conocimiento, preguntas multi-paso y políticas largas | 0,855 / 0,810; JevBench hard 0,676; Bespoke 0,774 | apache-2.0 |
| decider-4b v1 | Qwen3.5-4B-Base | 8,4 GB bf16 | no disponible (modelo denso) | Punto intermedio entre 2B y 35B | 0,834 / 0,788; JevBench hard 0,541; Bespoke 0,757 | no disponible |
| decider-2b v10 | Qwen3.5-2B-Base | 3,5 GB bf16 | no disponible | Opción por defecto: enrutamiento, clasificación, juicios y agentes de navegador; 4 ms por petición con CUDA graphs | 0,805 / 0,755; navegador en vivo 93%; Bespoke 0,704 | no disponible |
| decider-0.8b | Qwen3.5-0.8B-Base | 1,4 GB bf16 | no disponible | La opción más pequeña: enrutamiento, sí/no y consultas de estado corto | 0,776 / 0,707 en el protocolo de una sola ejecución | no disponible |
| decider-35b-a3b-nvfp4 | el 35B en NVFP4 | 19,6 GB | 34,7B totales / 3B activos | El 35B en Blackwell mediante vLLM o TensorRT-LLM | 1,0 a 1,5 puntos por debajo del bf16 en los fixtures medidos | no disponible |

Fuera de la familia decider, la información disponible no incluye comparaciones con otros modelos de decisión, clasificadores o LLM generativos de tamaño similar, por lo que la comparativa con alternativas externas queda como no disponible.

## Limitaciones y advertencias

- Modelo de decisión, no generativo: no produce texto libre. Toda la salida está restringida a la lista de opciones definida por quien llama, con un máximo de 255 opciones por pregunta.
- Idiomas: solo inglés (`language: [en]`). No hay datos sobre comportamiento en castellano ni en otros idiomas.
- Contexto: el estado de entrada está limitado a 32k tokens.
- Ausencia de etapa de RL: el propio modelo card señala que la política muestreada en tareas de navegador en vivo queda por detrás del 2B (86,4% frente a 93,2%), aunque la greedy lo supera (97,2% frente a 90,9%).
- Calibración: aunque se describe como calibrado, las probabilidades deben validarse sobre el dominio concreto antes de usarlas como umbral; el parámetro `abstain_below` existe precisamente para acotar el riesgo.
- Alucinación: al no generar texto no puede inventar contenido fuera de las opciones, pero sí puede asignar alta confianza a una opción incorrecta; la decisión sigue siendo una predicción probabilística.
- Sesgos: no hay información disponible sobre sesgos evaluados, composición demográfica del conjunto de decisiones ni análisis de equidad.
- Resultados autoinformados: todas las cifras de evaluación proceden de la model card del autor, sin replicación independiente ni benchmarks estándar publicados. El repositorio registra 0 descargas y 0 likes, y fue creado y actualizado el 23 de septiembre de 2026.
- Discrepancia de autoría: el identificador de HuggingFace es `vdaular/decider-35b-a3b`, mientras que el modelo card referencia los repositorios de la organización `Mapika` y el paquete de GitHub `Mapika/decider`. Conviene verificar la procedencia de los pesos antes de usarlos en producción.
- Licencia: los pesos se publican bajo apache-2.0, lo que en principio permite uso comercial, pero la licencia del modelo base (Qwen3.5-35B-A3B-Base) y las de los demás modelos de la familia no se detallan en la información disponible; es necesario comprobarlas por separado.
- Requisito de hardware elevado: 65 GB de pesos en bf16 y una GPU de al menos 80 GB, lo que excluye su despliegue en hardware de consumo en la versión bf16.
- Dependencias relativamente recientes y específicas (`transformers>=5.17`, `flash-linear-attention`), lo que puede complicar la integración en entornos con versiones fijadas.

## Enlaces

- Página de HuggingFace del modelo: https://huggingface.co/vdaular/decider-35b-a3b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B-Base
- decider-2b: https://huggingface.co/Mapika/decider-2b
- decider-4b: https://huggingface.co/Mapika/decider-4b
- decider-35b-a3b (referencia de la model card): https://huggingface.co/Mapika/decider-35b-a3b
- decider-35b-a3b-nvfp4: https://huggingface.co/Mapika/decider-35b-a3b-nvfp4
- decider-0.8b: https://huggingface.co/Mapika/decider-0.8b
- decider-2b-vision: https://huggingface.co/Mapika/decider-2b-vision
- Repositorio de código, registro de datos, scripts de entrenamiento y changelog: https://github.com/Mapika/decider
- Las búsquedas web realizadas no devolvieron resultados relevantes sobre este modelo: los enlaces recuperados tratan sobre incidencias de reembolsos de Amazon y no guardan relación con la ficha.
