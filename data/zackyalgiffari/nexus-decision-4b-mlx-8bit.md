# zackyalgiffari/nexus-decision-4b-MLX-8bit

## Resumen

nexus-decision-4b-MLX-8bit es la cuantización en 8 bits para Apple Silicon (formato MLX) de nexus-decision-4b, un modelo de pesos abiertos de 4.205.751.296 parámetros especializado en decisiones tipadas. No es un modelo conversacional: recibe un estado de aplicación y una o varias preguntas tipadas (`choice`, `binary` o `score`) con las opciones permitidas, y devuelve una de esas opciones junto con una distribución de probabilidad calibrada y un valor de confianza. Está diseñado para enrutamiento, triaje, puntuación y control de acceso dentro de software.

El modelo se destila de DeepSeek-V4.1-Flash (profesor) a Qwen3.5-4B (estudiante) mediante LoRA, usando como objetivos las etiquetas suaves del profesor y sus trazas de razonamiento. La arquitectura base es un transformer híbrido de Qwen3.5 que combina Gated DeltaNet y atención, conservando la torre de visión del modelo original. La relevancia actual reside en su calibración: frente a su propio profesor, obtiene mayor precisión (0,915 frente a 0,892) y un error de calibración esperado mucho menor (0,020 frente a 0,070) sobre etiquetas humanas.

Esta variante MLX 8-bit está pensada para ejecutarse en Apple silicon. Según el autor, en 50 preguntas de prueba sus respuestas coinciden con las del modelo bf16 en el 100% de los casos. La evaluación publicada se ejecutó sobre el modelo bf16 de referencia. La licencia es Apache-2.0 y el repositorio ocupa 4,5 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Qwen3.5 (Gated DeltaNet + atención), con torre de visión conservada del modelo base |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX 8-bit (esta variante); existe variante MLX 4-bit y pesos bf16 en Transformers |
| Idiomas soportados | en, id, es, de, fr, pt, ja (entrenamiento mayoritariamente en inglés, el resto en menor proporción) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX, 8-bit) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un transformer híbrido que intercala capas de Gated DeltaNet (atención lineal con estado recurrente) y capas de atención clásica, y que conserva la torre de visión del modelo base aunque la tarea principal sea textual. Sobre esa base se aplicó un proceso de destilación con LoRA desde DeepSeek-V4.1-Flash, cuyo objetivo no era solo imitar las etiquetas duras del profesor, sino también sus etiquetas suaves (distribuciones de probabilidad) y sus trazas de razonamiento. De ahí que el modelo produzca una distribución calibrada sobre las opciones en lugar de una única etiqueta.

La interfaz es de "decisión tipada": el prompt incluye el estado de la aplicación delimitado como datos (nunca como instrucciones), una pregunta con nombre y tipo, y un conjunto de opciones entre 2 y 26. El modelo opera en dos modos: `fast`, que realiza un único prefill sin generación (una pasada hacia delante por pregunta) y es el modo por defecto, y `think`, que emite una traza corta `<think>` antes de la misma lectura. La calibración se aplica con una temperatura por modo definida en `nexus_config.json` (0,975 en `fast` y 1,683 en `think`). El autor reporta además estabilidad frente al reordenamiento de opciones: invertir el orden cambia el 3,6% de las respuestas, frente al 11,1% del modelo base sin ajustar.

## Capacidades

- Clasificación y decisión tipada: resuelve preguntas de tipo `choice` (elegir una opción), `binary` (sí/no) y `score` (elegir un nivel de rúbrica).
- Salida calibrada: devuelve una distribución de probabilidad sobre todas las opciones y un valor de confianza apto para umbralizar.
- Rango de opciones: maneja entre 2 y 26 opciones por pregunta.
- Modo `fast`: una sola pasada hacia delante sin generación, con latencia baja.
- Modo `think`: traza corta de razonamiento antes de la lectura final.
- Multilingüe parcial: inglés como idioma principal, con cobertura menor de indonesio, español, alemán, francés, portugués y japonés.
- Visión: la torre de visión del modelo base se conserva, aunque la model card no documenta tareas de visión en esta variante.
- No es un modelo de chat: no está pensado para conversación abierta ni para generación libre de texto.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad documentada.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el estado del ticket y una pregunta `choice` con las colas disponibles, y devuelve la cola asignada con una probabilidad calibrada que permite derivar a revisión humana los casos de baja confianza.
- Triaje de incidencias: con una pregunta `score` sobre una rúbrica de severidad, se obtiene el nivel de prioridad y la distribución sobre los niveles, útil para ordenar colas de trabajo.
- Control de acceso y gating: una pregunta `binary` sobre si una acción cumple las políticas permite decidir si se permite o se bloquea, con umbral de confianza configurable (por ejemplo, confianza ≥ 0,99 para acciones sensibles).
- Clasificación de intenciones en asistentes: sustituye a clasificadores dedicados en pipelines de diálogo, eligiendo entre las intenciones definidas como opciones y devolviendo la incertidumbre del modelo.
- Puntuación de riesgo o calidad: con preguntas `score` sobre rúbricas, se obtiene una valoración graduada con distribución de probabilidad, aprovechable en scoring de leads, moderación o evaluación de contenido.
- Decisión en el borde con Apple silicon: al ser MLX 8-bit, puede desplegarse en portátiles y equipos Mac para inferencia local con latencia baja, sin depender de GPU dedicada.
- Enrutamiento dentro de pipelines de CI/CD o backend: al requerir una sola pasada hacia delante por pregunta y no generar texto, encaja en servicios de decisión de alta frecuencia donde la latencia importa.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados de forma independiente). La evaluación se ejecutó sobre el modelo bf16 de referencia.

| Tarea | Conjunto de datos | Accuracy | Macro-F1 | ECE | Brier |
|---|---|---|---|---|---|
| Preguntas de decisión tipadas | nexus-decision-data (BANKING77 + CLINC150 test, como preguntas tipadas) | 0,915 | 0,8893 | 0,0196 | 0,1178 |
| Preguntas de decisión tipadas | nexus-decision-data (escenarios sintéticos, etiquetas del profesor) | 0,9078 | 0,8847 | 0,0214 | 0,1425 |

Datos adicionales reportados por el autor en la model card:

| Métrica | Valor |
|---|---|
| Precisión sobre 1.200 preguntas retenidas con etiquetas humanas | 0,915 (+7,0 puntos sobre el modelo base sin ajustar; IC 95% +5,3 a +8,7) |
| Precisión frente al profesor (DeepSeek-V4.1-Flash) | 0,915 frente a 0,892 |
| ECE frente al profesor | 0,020 frente a 0,070 |
| Cobertura con confianza ≥ 0,90 | 74% de las preguntas, con 1,8% de error |
| Cobertura con confianza ≥ 0,99 | 53% de las preguntas, con 0,3% de error |
| Cambio de respuesta al invertir el orden de opciones | 3,6% (frente al 11,1% del modelo base) |
| Latencia p50 en NVIDIA L4 (modo `fast`) | 93 ms |

## Requisitos de hardware

- VRAM estimada: el repositorio MLX 8-bit ocupa 4,5 GB; en Apple silicon el modelo requiere aproximadamente esa cantidad de memoria unificada, más el espacio de trabajo para el estado de la aplicación y las opciones.
- GPU recomendadas: Apple silicon (M1/M2/M3/M4 y variantes Pro/Max/Ultra) para esta variante MLX. La latencia reportada de 93 ms p50 corresponde a una NVIDIA L4 con el modelo bf16, no con esta cuantización.
- Cabe en GPU de consumo: sí, en equipos Apple con memoria unificada suficiente; también existe una variante MLX 4-bit para equipos con menos memoria.
- Opciones de despliegue: MLX (`mlx-lm`) para Apple silicon; Transformers con los pesos bf16 para CUDA, CPU y MPS. vLLM, llama.cpp, Ollama y TGI no están documentados para esta variante.
- Latencia y throughput: 93 ms p50 por pregunta en modo `fast` sobre NVIDIA L4 con el modelo bf16 (una pasada hacia delante, sin generación). No se han publicado cifras de throughput para la variante MLX 8-bit.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Precisión / ECE | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| nexus-decision-4b-MLX-8bit | 4,2 B | no disponible | Decisión tipada calibrada (destilado) | 0,915 / 0,020 (etiquetas humanas) | Apache-2.0 | Hugging Face (MLX 8-bit) |
| nexus-decision-4b (bf16) | 4,2 B | no disponible | Decisión tipada calibrada (referencia) | 0,915 / 0,020 (etiquetas humanas) | Apache-2.0 | Hugging Face (Transformers) |
| DeepSeek-V4.1-Flash (profesor) | no disponible | no disponible | Modelo generalista usado como profesor | 0,892 / 0,070 (etiquetas humanas) | no disponible | no disponible |
| Qwen3.5-4B (base sin ajustar) | 4 B | no disponible | Modelo generalista base | Precisión 7,0 puntos inferior al ajustado | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo de chat: no debe usarse para conversación abierta ni generación libre de texto; su interfaz está restringida a preguntas tipadas con opciones predefinidas.
- Sesgos conocidos: no documentados por el autor; al entrenarse mayoritariamente en inglés, el rendimiento en español, alemán, francés, portugués, japonés e indonesio puede ser inferior y no está cuantificado.
- Riesgo de alucinación: el modelo elige siempre entre las opciones proporcionadas, pero puede seleccionar una opción incorrecta con alta confianza; los umbrales de confianza publicados (1,8% de error con confianza ≥ 0,90 y 0,3% con ≥ 0,99) proceden de la evaluación del autor y no han sido verificados de forma independiente.
- Estabilidad limitada: el 3,6% de las respuestas cambia al invertir el orden de las opciones, por lo que conviene fijar un orden canónico de opciones en producción.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero debe conservarse el aviso de licencia y no se ofrece garantía alguna.
- Caveat de cuantización: la evaluación publicada corresponde al modelo bf16; la equivalencia con la variante MLX 8-bit solo se comprobó en 50 preguntas de prueba (100% de coincidencia), una muestra reducida.
- Longitud de contexto no documentada: no hay dato oficial sobre la ventana máxima, lo que limita planificar estados de aplicación muy largos.
- Proyecto independiente: el autor indica que sigue la interfaz del "System One decision model" de TypeSafe AI's Jev, sin afiliación ni uso de sus pesos, datos o código.
- Datos de benchmarks no verificados: todas las métricas del model-index están marcadas como `verified: false`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zackyalgiffari/nexus-decision-4b-MLX-8bit
- Modelo base bf16: https://huggingface.co/zackyalgiffari/nexus-decision-4b
- Variante MLX 4-bit: https://huggingface.co/zackyalgiffari/nexus-decision-4b-MLX-4bit
- Colección de variantes: https://huggingface.co/collections/zackyalgiffari/nexus-decision-4b-6af7fc5003be12bf9aa5b4c9
- Dataset de entrenamiento y evaluación: https://huggingface.co/datasets/zackyalgiffari/nexus-decision-data
- Código en GitHub: https://github.com/zackyalgiffari/nexus-decision-model-4b
- Protocolo de prompts: https://github.com/zackyalgiffari/nexus-decision-model-4b/blob/main/docs/protocol.md
- Dataset BANKING77: https://huggingface.co/datasets/PolyAI/banking77
- Dataset CLINC150 (clinc_oos): https://huggingface.co/datasets/clinc/clinc_oos
- Librería MLX-LM: https://github.com/ml-explore/mlx-lm
