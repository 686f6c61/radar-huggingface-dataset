# Synth-NLP/bussola-laya-ptbr

## Resumen

Bússola-Laya es un modelo de clasificación de intenciones (intent classification) para portugués de Brasil, desarrollado por Synth-NLP. Se trata de un ajuste fino de `convaiinnovations/laya`, un modelo de decisión con 321,9 millones de parámetros, que recibe una frase en portugués junto con una lista de opciones y selecciona la intención que corresponde al usuario (por ejemplo, "vai chover amanhã?" → `consultar clima`). El modelo resuelve el problema de la clasificación de intenciones en escenarios con muchas etiquetas posibles y con intenciones no vistas durante el entrenamiento.

El modelo forma parte de la familia Bússola, un experimento que evalúa si los datos sintéticos en portugués mejoran los clasificadores de intención, especialmente en intenciones que el modelo nunca vio en el entrenamiento. Para ello se combinaron los 5.405 ejemplos reales del dataset MASSIVE pt-BR con 20.383 frases sintéticas generadas mediante una pipeline agéntica con modelos abiertos, sumando un total de 25.788 líneas de entrenamiento.

Su relevancia radica en dos aspectos: por un lado, demuestra un método reproducible para generar datos sintéticos de calidad con filtrado y juicio por LLM; por otro, cuantifica el beneficio del sintético sobre el ajuste solo con datos reales (+3,2 puntos de accuracy en intenciones no vistas, con intervalo de confianza del 95% de [+1,0; +5,5]). La licencia Apache 2.0 y el tamaño compacto lo hacen desplegable en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | laya (modelo de decisión; no disponible el detalle interno de la arquitectura) |
| Parametros totales | 321.908.998 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | portugués (pt), con foco en pt-BR |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en `convaiinnovations/laya`, un modelo de decisión orientado a tareas de elección entre opciones (choice tasks) en lugar de generación libre de texto. Sobre esa base se aplicó un ajuste fino supervisado con `laya.train.finetune` 0.4.14 usando los parámetros por defecto: 4 épocas, lote efectivo de 64 y objetivo `rlcd`, con `shuffle_options=("choice",)`. Se entrenaron 3 semillas y se seleccionó la mejor (seed 2). El conjunto de entrenamiento combina 5.405 ejemplos reales de 30 intenciones del MASSIVE pt-BR con 20.383 frases sintéticas, de las cuales una parte cubre esas mismas 30 intenciones y otra cubre 30 intenciones nuevas.

La pipeline de generación sintética parte únicamente de la lista de intenciones (nombre y descripción) y consta de cinco etapas: planificación de peticiones variadas con personas, situaciones cotidianas y estilos de escritura extraídos de oasst1, incluyendo peticiones contrastivas contra la intención vecina más parecida; generación de frases con Gemma 4 12B y Qwen3.5-9B, con reescritura Evol-Instruct para aumentar la dificultad de una parte; filtrado de duplicados y de frases demasiado similares a los datos de test mediante Qwen3-Embedding-0.6B; juicio por dos LLM que deben coincidir en la intención asignada, más una nota de naturalidad; y selección de las frases difíciles para el modelo, usando sus errores para solicitar la siguiente ronda (LLM2LLM).

## Capacidades

- Clasificación de intenciones en portugués de Brasil: elige una opción de una lista cerrada de intenciones dada una frase de usuario.
- Tarea de decisión con múltiples opciones: la API `predict` recibe la frase y un diccionario de criterios con las opciones posibles.
- Generalización a intenciones no vistas en entrenamiento: el modelo fue evaluado con 30 intenciones reservadas que no aparecieron ni en el entrenamiento ni en la generación de sintéticos.
- Robustez ante variación de estilo: los datos sintéticos incluyen personas, situaciones y estilos de escritura diversos.
- Discriminación frente a intenciones vecinas: se generaron ejemplos contrastivos contra la intención más parecida.
- No dispone de generación de texto libre, tool calling, razonamiento multi-paso, visión ni audio según la información disponible.

## Casos de uso

- Enrutamiento de consultas en asistentes conversacionales: el modelo clasifica la petición del usuario en una de las intenciones disponibles (clima, agenda, encendido de luces) y permite derivar la petición al handler correspondiente. Su tamaño de 322M parámetros permite ejecutarlo en CPU o GPU modesta con baja latencia.
- Clasificación con catálogo de intenciones cambiante: al formularse como elección entre opciones, se pueden añadir o retirar intenciones sin reentrenar, siempre que estén descritas en la lista de criterios. Útil en productos que evolucionan su taxonomía de forma frecuente.
- Arranque en frío de un clasificador en portugués: la pipeline de datos sintéticos permite generar ejemplos para intenciones nuevas a partir solo de su nombre y descripción, y el modelo resultante sirve como base para un sistema de clasificación con pocos datos reales.
- Preetiquetado de datos para anotación humana: el modelo puede predecir la intención de grandes volúmenes de frases y usarse como primera pasada en un flujo de anotación, reduciendo el coste de etiquetado manual.
- Investigación sobre datos sintéticos: sirve como referencia reproducible para estudiar el efecto de datos sintéticos en clasificación de intenciones, con seeds, conjuntos de evaluación y predicciones por frase publicados.
- Filtrado o triaje en pipelines de soporte: clasificar tickets o mensajes entrantes en categorías predefinidas para dirigirlos al equipo adecuado, con la ventaja de que el modelo es pequeño y puede desplegarse on-premise.
- Evaluación comparativa de proveedores: al estar disponible con licencia Apache 2.0 y pesos abiertos, permite comparar contra APIs propietarias como Jev con las mismas frases y opciones.

## Benchmarks y rendimiento

Resultados de accuracy en la validación del MASSIVE pt-BR con 20 opciones por frase (nivel de azar = 0,050). Las columnas "no vistas" y "vistas" distinguen escenarios reservados por completo frente a intenciones presentes en entrenamiento.

| Modelo | Base | No vistas | Vistas |
|---|---|---:|---:|
| Jev (API de TypeSafe, referencia) | — | 0,863 | 0,864 |
| Bússola-Kev-4B | kev-4b | 0,867 | 0,933 |
| Bússola-Kev-9B | kev-9b | 0,861 | 0,929 |
| Bússola-Kev-0.8B | kev-0.8b | 0,815 | 0,917 |
| Bússola-Laya (este) | laya | 0,763 | 0,908 |

Ablación del efecto de los datos sintéticos con el mismo modelo base:

| Configuracion | No vistas | Vistas |
|---|---:|---:|
| Ajuste solo con los 5.405 ejemplos reales | 0,729 | 0,894 |
| Ajuste con reales + sintéticos (Bússola) | 0,763 | 0,908 |

El ganancia del sintético sobre el ajuste solo con reales en intenciones no vistas es de +3,2 puntos [+1,0; +5,5] (media de 3 seeds, intervalo de confianza del 95% por bootstrap pareado por frase). En intenciones vistas, ambos ajustes empatan. La evaluación usa la media de 3 sorteos de las opciones; el Jev se evaluó mediante su API en un único sorteo (el 0) con las mismas frases y opciones.

## Requisitos de hardware

- VRAM estimada para inferencia: con 321,9 millones de parámetros en safetensors, los pesos en fp32 ocupan aproximadamente 1,3 GB y en fp16/bf16 unos 0,65 GB; la VRAM adicional depende del contexto y del batch, no disponible en la información proporcionada.
- GPU recomendadas: no se especifican en la información disponible; por tamaño, el modelo es apto para GPU de consumo y para CPU.
- Cabe en GPU de consumo: sí, por el tamaño del modelo (menos de 1,5 GB de pesos), aunque no se detallan requisitos oficiales.
- Opciones de despliegue: la librería `laya` con `laya.load("Synth-NLP/bussola-laya-ptbr")`; no se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | No vistas | Vistas | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| Bússola-Laya | 321,9 M | no disponible | 0,763 | 0,908 | Apache 2.0 | Pesos abiertos en HF |
| Bússola-Kev-0.8B | no disponible | no disponible | 0,815 | 0,917 | no disponible | Pesos abiertos en HF |
| Bússola-Kev-4B | no disponible | no disponible | 0,867 | 0,933 | no disponible | Pesos abiertos en HF |
| Bússola-Kev-9B | no disponible | no disponible | 0,861 | 0,929 | no disponible | Pesos abiertos en HF |
| Jev (API de TypeSafe) | no disponible | no disponible | 0,863 | 0,864 | propietaria | Solo API |

Bússola-Laya es el modelo más pequeño de la familia y el que peor rinde en intenciones no vistas, aunque supera al Jev en intenciones vistas (0,908 frente a 0,864). Los modelos Kev, de mayor tamaño, obtienen mejores resultados en no vistas.

## Limitaciones y advertencias

- Una sola seed de entrenamiento en los modelos Kev; la comparación entre modelos de la familia no promedia seeds.
- Evaluación limitada a una única tarea (elección de intención) y a un único conjunto de datos (MASSIVE pt-BR).
- El pt-BR del MASSIVE es una localización generada por LLM a partir del pt-PT, lo que puede introducir artefactos lingüísticos.
- El Jev se evaluó en un solo sorteo de opciones, mientras que los Bússola usan la media de 3 sorteos; las comparaciones con él usan ese sorteo.
- Rendimiento inferior al resto de la familia Bússola en intenciones no vistas (0,763 frente a 0,815–0,867), por lo que no es la mejor opción si la generalización a intenciones nuevas es crítica.
- No se documentan sesgos conocidos, riesgo de alucinación ni limitaciones de contexto en la información disponible; al ser un modelo de elección cerrada, el riesgo de alucinación de texto libre no aplica de la misma forma.
- Licencia Apache 2.0, que permite uso comercial; los pesos derivan de `convaiinnovations/laya` y las frases reales del MASSIVE son © Amazon.com, Inc. o afiliadas, bajo CC BY 4.0, por lo que se requiere atribución.
- La información disponible no detalla el comportamiento fuera del portugués ni el soporte de variantes europeas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Synth-NLP/bussola-laya-ptbr
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Dataset de entrenamiento: https://huggingface.co/datasets/Synth-NLP/massive-pt-br-sintetico-v4
- Dataset de evaluación: https://huggingface.co/datasets/Synth-NLP/massive-pt-br-avaliacao
- Paper del MASSIVE: https://arxiv.org/abs/2204.08582
- Bússola-Kev-4B: https://huggingface.co/Synth-NLP/bussola-kev-4b-ptbr
- Bússola-Kev-9B: https://huggingface.co/Synth-NLP/bussola-kev-9b-ptbr
- Bússola-Kev-0.8B: https://huggingface.co/Synth-NLP/bussola-kev-0.8b-ptbr
- Gemma 4 12B (generador de sintéticos): https://huggingface.co/google/gemma-4-12B-it
- Qwen3.5-9B (generador de sintéticos): https://huggingface.co/Qwen/Qwen3.5-9B
- Qwen3-Embedding-0.6B (filtrado): https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
