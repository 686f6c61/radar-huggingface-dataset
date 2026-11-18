# Synth-NLP/kev-4b-massive-pt-br-B-v4

## Resumen

Kev-4b-massive-pt-br-B-v4 es un ajuste fino por adaptadores LoRA sobre el modelo base jaredpalmer/kev-4b, desarrollado por Synth-NLP. El modelo está especializado en clasificación de intenciones (intent classification) para portugués de Brasil, usando el corpus MASSIVE pt-BR con 20 opciones de intención por frase. Forma parte de un experimento controlado que compara datos sintéticos generados por una pipeline agéntica frente a datos reales, en la familia de modelos de decisión Kev de distintos tamaños (0.8B, 4B y 9B) junto con Laya.

El modelo no es un generador de texto generalista, sino un modelo de decisión: recibe una frase y un conjunto de 20 opciones de intención, y selecciona la correcta mediante una cabeza pointer (pointer head) añadida sobre el modelo base. Esto lo sitúa en la categoría de modelos de clasificación y enrutamiento, útiles para construir asistentes conversacionales con enrutado de intenciones determinista y de baja latencia.

Este brazo concreto, B_v4, se ha entrenado exclusivamente con datos sintéticos de la pipeline v4 para las 30 intenciones vistas, manteniendo la misma distribución de conteos por intención que el conjunto de entrenamiento real. El repositorio pesa 0.2 GB, lo que corresponde a los pesos del adaptador LoRA más la cabeza pointer, no al modelo base completo. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base jaredpalmer/kev-4b) con adaptador LoRA y cabeza pointer para selección entre opciones |
| Parametros totales | 4B (modelo base); tamaño del adaptador no disponible explícitamente (repo de 0.2 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bf16 durante entrenamiento; safetensors en el repo) |
| Idiomas soportados | Portugués (pt), específicamente pt-BR |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA + pointer head sobre base jaredpalmer/kev-4b) |

## Arquitectura y entrenamiento

El modelo parte del checkpoint jaredpalmer/kev-4b, un transformer de 4B parámetros, y se ajusta mediante LoRA manteniendo la base congelada en bf16. Sobre el modelo base se añade una cabeza pointer que, dada una frase y un conjunto de 20 opciones de intención, produce una distribución sobre esas opciones y selecciona la más probable. El entrenamiento usa `python -m kev.train --init_from jaredpalmer/kev-4b` con learning rate 2e-5, 2 épocas, batch size 8, precisión bf16 y seed 0.

Los datos de entrenamiento del brazo B_v4 son exclusivamente sintéticos, generados por la pipeline v4 para las 30 intenciones vistas en el conjunto de entrenamiento real, con la misma contabilidad por intención que dicho conjunto real y las mismas filas y mismas 20 opciones que el modelo Laya del mismo brazo. Se desactivaron los aumentos propios de Kev: no se emplea la opción "ninguna de las anteriores" ni distractores extra. El objetivo del experimento es aislar el efecto de los datos sintéticos frente a datos reales en modelos de decisión de distintos tamaños, por lo que no se reportan detalles sobre el corpus de preentrenamiento del modelo base ni sobre el número total de tokens vistos.

## Capacidades

- Clasificación de intenciones en portugués de Brasil entre 20 opciones candidatas por frase.
- Selección de la opción correcta mediante cabeza pointer sobre el modelo base, no mediante generación libre de texto.
- Manejo de intenciones vistas en entrenamiento (30 clases cubiertas por la pipeline sintética).
- Generalización a escenarios reservados no vistos durante el entrenamiento, con rendimiento reportado de 0.837 de accuracy.
- Integración como servicio mediante API System One (`python -m kev.serve --run <repo>`), al estilo del modelo Jev.
- No dispone de tool calling, function calling, capacidades de agente multi-paso, visión, audio ni modo thinking según la información disponible.
- Capacidades multilingües limitadas al portugués (pt-BR); no se documentan otros idiomas.

## Casos de uso

- Enrutado de intenciones en asistentes conversacionales: el modelo recibe la frase del usuario junto con las 20 intenciones candidatas del dominio y devuelve la intención seleccionada, permitiendo dirigir la conversación al flujo o skill correspondiente con una única llamada al modelo.
- Clasificación de tickets de soporte en portugués: dado un mensaje de un cliente, se selecciona entre las categorías de intención definidas (facturación, cancelación, cambio de plan, etc.) para asignar el ticket al equipo adecuado.
- Enrutado en sistemas de voz interactiva (IVR): la transcripción de la petición del usuario se clasifica contra un conjunto fijo de intenciones para decidir la siguiente acción del flujo, aprovechando la baja latencia esperada de un modelo de decisión frente a la generación libre.
- Preprocesado en pipelines RAG: la intención detectada puede usarse como filtro para seleccionar la base de conocimiento o el índice vectorial adecuado antes de recuperar documentos.
- Evaluación de datos sintéticos: el modelo sirve como referencia en experimentos controlados que comparan el rendimiento de modelos entrenados con datos sintéticos frente a datos reales, gracias a que comparte filas y opciones con el modelo Laya del mismo brazo.
- Clasificación de comandos en asistentes de domótica o aplicaciones móviles en pt-BR: la frase del usuario se mapea a una de las 20 acciones disponibles, con la cabeza pointer restringiendo la salida al conjunto cerrado de opciones.
- Moderación o triaje de mensajes: la intención detectada permite dirigir mensajes a colas de revisión específicas según su categoría.

## Benchmarks y rendimiento

| Conjunto | Métrica | Resultado |
|---|---|---|
| MASSIVE pt-BR, validación, intenciones vistas (20 opciones, media de 3 sorteos) | Accuracy | 0.878 |
| MASSIVE pt-BR, validación, intenciones no vistas (escenarios reservados, media de 3 sorteos) | Accuracy | 0.837 |

No se han publicado en la información disponible resultados comparativos con otros modelos en esta tabla; los datos anteriores son los únicos reportados por el autor en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Como referencia orientativa, un modelo base de 4B parámetros en bf16 requiere aproximadamente 8 GB solo para los pesos, más memoria para el adaptador, la cabeza pointer y el contexto; en cuantización de 8 bits se reduciría aproximadamente a la mitad y en 4 bits a unos 2-3 GB, aunque estas cifras no están confirmadas por el autor.
- GPU recomendadas: no disponibles. Por tamaño, cabría esperar que el modelo base de 4B funcione en GPUs de consumo con suficiente VRAM (por ejemplo, RTX 3090 o RTX 4090 en bf16), pero no hay datos publicados al respecto.
- Despliegue: el autor documenta el uso mediante `uv run --extra serve python -m kev.serve --run <este repo>`, que expone una API System One. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Synth-NLP/kev-4b-massive-pt-br-B-v4 | 4B (base) + adaptador LoRA | no disponible | Clasificación de intenciones pt-BR (20 opciones) | Apache 2.0 | Hugging Face |
| jaredpalmer/kev-4b (modelo base) | 4B | no disponible | Modelo de decisión general | no disponible | Hugging Face |
| Laya (mismo brazo B_v4) | no disponible | no disponible | Clasificación de intenciones pt-BR (20 opciones) | no disponible | no disponible |
| Kev-0.8B y Kev-9B (misma familia) | 0.8B y 9B | no disponible | Modelos de decisión | no disponible | no disponible |

La información disponible no permite comparar rendimiento numérico entre estos modelos más allá de los resultados del propio brazo B_v4; los datos de Laya, Kev-0.8B y Kev-9B del mismo experimento no se detallan en la model card.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente con datos sintéticos en este brazo (B_v4), lo que puede introducir sesgos o artefactos propios de la pipeline generadora que no reflejen la distribución real del lenguaje de los usuarios.
- El conjunto de intenciones está cerrado a 20 opciones por frase; el modelo no puede rechazar una entrada fuera de distribución mediante la opción "ninguna de las anteriores", ya que ese aumento se desactivó durante el entrenamiento.
- El rendimiento en intenciones no vistas (0.837) es inferior al de intenciones vistas (0.878); en dominios con intenciones nuevas el rendimiento puede degradarse.
- La cobertura lingüística se limita al portugués de Brasil; no hay evidencia de funcionamiento en otros idiomas o variantes.
- No se documentan capacidades de generación de texto libre, razonamiento, código ni matemáticas; el modelo es un clasificador de decisión y no debe usarse como generador generalista.
- Riesgo de alucinación no aplica en el sentido habitual (salida restringida al conjunto de opciones), pero sí existe riesgo de seleccionar una intención incorrecta cuando la frase es ambigua o está fuera del dominio de entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero se desconoce la licencia del modelo base jaredpalmer/kev-4b y de los datos MASSIVE subyacentes; conviene verificar ambas antes de un despliegue en producción.
- No se publican datos de latencia, throughput ni requisitos de hardware, lo que dificulta dimensionar un despliegue real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Synth-NLP/kev-4b-massive-pt-br-B-v4
- Modelo base: https://huggingface.co/jaredpalmer/kev-4b
- Corpus MASSIVE: no disponible en la información proporcionada (no se incluye enlace en la model card)
- Paper o blog del experimento: no disponible en la información proporcionada
- Repositorio de código `kev` (entrenamiento y servido): no disponible en la información proporcionada
