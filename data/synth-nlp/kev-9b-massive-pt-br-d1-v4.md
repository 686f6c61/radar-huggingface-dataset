# Synth-NLP/kev-9b-massive-pt-br-D1-v4

## Resumen

Kev-9B ajustado no MASSIVE pt-BR — braço D1_v4 es un adaptador delta (LoRA más una cabeza pointer) sobre el modelo base `jaredpalmer/kev-9b`, un modelo de decisión de 9.000 millones de parámetros orientado a clasificación de intenciones. El ajuste lo publica Synth-NLP y está especializado en la selección de intención en portugués de Brasil sobre el conjunto MASSIVE, con 20 opciones candidatas por frase. No es un modelo generativo de propósito general, sino un clasificador de decisión que, dada una frase y un conjunto de intenciones, elige la más probable.

El interés del artefacto es metodológico: forma parte de un experimento que compara datos sintéticos generados por una pipeline agéntica frente a datos reales, replicando el mismo brazo (D1_v4) en varios tamaños de modelo (Laya, Kev-0.8B, 4B y 9B). El brazo D1_v4 combina el entrenamiento real con sintético v4 de 30 vistas y 30 intenciones nuevas, totalizando 25.788 líneas, con las mismas líneas y las mismas 20 opciones que el Laya del mismo brazo.

El modelo reporta una precisión de 0,929 en intenciones vistas y 0,861 en intenciones no vistas (escenarios reservados nunca vistos en entrenamiento) sobre la validación de MASSIVE pt-BR, promediando tres sorteos. El repo ocupa 0,2 GB y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador delta (LoRA + pointer head) sobre el modelo base `jaredpalmer/kev-9b`; el modelo base se describe como "decision-model" |
| Parametros totales | 9B (modelo base); el adaptador LoRA no declara recuento propio |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, base congelada en bf16 durante el entrenamiento) |
| Idiomas soportados | portugués de Brasil (pt-BR) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tarea | Clasificación de intención entre 20 opciones (MASSIVE pt-BR) |
| Dataset de evaluación | MASSIVE pt-BR (validación, 20 opciones, media de 3 sorteos) |
| Tamaño del repo | 0,2 GB |

## Arquitectura y entrenamiento

El modelo es un ajuste delta sobre `jaredpalmer/kev-9b`, que la model card clasifica como "decision-model". El ajuste combina LoRA con una cabeza pointer que selecciona una de las 20 intenciones candidatas para cada frase de entrada, en lugar de generar texto libre. La base se mantiene congelada en bf16 durante el entrenamiento y solo se actualizan los parámetros del adaptador y la cabeza de decisión.

El entrenamiento se lanzó con `python -m kev.train --init_from jaredpalmer/kev-9b` con los siguientes hiperparámetros: learning rate 2e-5, 2 épocas, tamaño de lote 8, precisión bf16 y semilla 0. Los aumentos de datos propios del Kev se desactivaron (sin la opción "ninguna de las anteriores" ni distractores extra). El brazo D1_v4 usa el conjunto real más el sintético v4 de 30 vistas y 30 intenciones nuevas, con 25.788 líneas en total y las mismas 20 opciones que el Laya del mismo brazo, lo que permite comparaciones controladas entre tamaños de modelo.

## Capacidades

- Clasificación de intención en portugués de Brasil: elige una de 20 intenciones candidatas por frase sobre el esquema de MASSIVE pt-BR.
- Generalización a intenciones no vistas: se evaluó explícitamente con escenarios reservados nunca presentes en entrenamiento (precisión 0,861).
- Decisión sobre un conjunto cerrado de opciones: la cabeza pointer restringe la salida al conjunto de intenciones proporcionado, evitando generación libre.
- Comparabilidad experimental: mismo brazo de datos (D1_v4) y mismas 20 opciones que las variantes Laya, Kev-0.8B y 4B, lo que facilita estudios de escalado.
- Servicio vía API: la model card indica el uso con `uv run --extra serve python -m kev.serve --run <este repo>`, con una API "System One" análoga a la del Jev.
- No se declaran capacidades de generación de texto, código, matemáticas, visión, audio, tool calling ni razonamiento multi-paso.

## Casos de uso

- Enrutamiento de intenciones en asistentes conversacionales en portugués: dado un turno del usuario y un catálogo cerrado de 20 intenciones, el modelo devuelve la intención más probable para dirigir el flujo del diálogo. Es adecuado porque la cabeza pointer garantiza que la salida pertenezca siempre al conjunto permitido.
- Clasificación de tickets de soporte en portugués de Brasil: integrar el modelo en un pipeline que asigne cada mensaje entrante a una categoría operativa (consulta de pedido, cancelación, facturación, etc.) antes de derivar al agente humano o al bot correspondiente.
- Investigación sobre datos sintéticos: usar el brazo D1_v4 como referencia para medir el impacto de añadir datos sintéticos agénticos frente a datos reales, comparando con las variantes Laya, Kev-0.8B y 4B del mismo brazo.
- Evaluación de robustez ante intenciones nuevas: aprovechar los escenarios reservados para validar si un clasificador mantiene precisión aceptable cuando aparecen intenciones no presentes en el entrenamiento (0,861 reportado).
- Prototipado de asistentes de voz en portugués: colocar el clasificador como primera etapa de un pipeline ASR → clasificación de intención → acción, restringiendo la decisión a un conjunto cerrado y auditable de 20 opciones.
- Benchmark interno de modelos de decisión: servir el modelo con la API `kev.serve` y usarlo como baseline de 9B en comparaciones de precisión, latencia y coste frente a modelos de menor tamaño.

## Benchmarks y rendimiento

| Conjunto | Métrica | Resultado |
|---|---|---|
| MASSIVE pt-BR, validación, 20 opciones, intenciones vistas | Precisión (media de 3 sorteos) | 0,929 |
| MASSIVE pt-BR, validación, 20 opciones, intenciones no vistas (escenarios reservados) | Precisión (media de 3 sorteos) | 0,861 |

No se han publicado en la información disponible resultados comparativos con Laya, Kev-0.8B ni Kev-4B del mismo brazo, ni métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia de orden de magnitud, un modelo base de 9B en bf16 requiere aproximadamente 18 GB solo para pesos, más overhead de activaciones y de la cabeza pointer; el adaptador LoRA añade una fracción pequeña.
- GPU recomendadas: no disponibles en la información. Por tamaño, el modelo base de 9B en bf16 encaja en A100 40 GB, H100 80 GB y, con cuantización, en GPUs consumer de 24 GB (RTX 3090/4090) o 16 GB según el esquema de cuantización empleado.
- ¿Cabe en GPU consumer? No confirmado para este adaptador; depende del formato de pesos y de la cuantización del modelo base, que no se documenta.
- Opciones de despliegue: la model card indica servir con `uv run --extra serve python -m kev.serve --run <este repo>` (API System One). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Synth-NLP/kev-9b-massive-pt-br-D1-v4 | 9B (base) + adaptador LoRA | no disponible | Clasificación de intención pt-BR (20 opciones) | Apache 2.0 | Hugging Face |
| Variantes del mismo brazo (Laya, Kev-0.8B, Kev-4B) | 0,8B / 4B / Laya | no disponible | Misma tarea y mismas 20 opciones | no disponible | Mencionadas en la model card, sin enlaces |
| jaredpalmer/kev-9b (modelo base) | 9B | no disponible | Modelo de decisión | no disponible | Hugging Face |

No se dispone de datos de rendimiento de las variantes comparables en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- Especialización estrecha: solo clasifica entre 20 intenciones del esquema MASSIVE pt-BR; no es un modelo generativo ni un asistente conversacional.
- Idioma único: solo portugués de Brasil; no se declara soporte de otras lenguas ni de variantes de portugués europeo.
- Dependencia del modelo base: el adaptador no funciona de forma autónoma; requiere cargar `jaredpalmer/kev-9b` y su licencia y disponibilidad pueden cambiar.
- Datos sintéticos: parte del entrenamiento (brazo D1_v4) proviene de una pipeline agéntica, con el riesgo de sesgos o artefactos introducidos por el generador sintético.
- Aumentos desactivados: el entrenamiento omite "ninguna de las anteriores" y distractores extra, por lo que el modelo no está preparado para rechazar entradas fuera de las 20 opciones.
- Riesgo de alucinación: limitado por la cabeza pointer, que restringe la salida al conjunto de opciones, pero puede forzar una elección incorrecta cuando la intención real no está en el catálogo.
- Sin datos de benchmarks comparativos ni de latencia: no es posible estimar coste de producción a partir de la información disponible.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar la licencia del modelo base antes de desplegar.
- Repo de 0,2 GB: coherente con un adaptador LoRA, no con los pesos completos del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Synth-NLP/kev-9b-massive-pt-br-D1-v4
- Modelo base: https://huggingface.co/jaredpalmer/kev-9b
- Conjunto de datos MASSIVE (referencia del esquema de intenciones): no disponible en la información proporcionada
- Paper o blog del experimento: no disponible en la información proporcionada
- Repositorio de código (`kev.train`, `kev.serve`): no disponible en la información proporcionada
