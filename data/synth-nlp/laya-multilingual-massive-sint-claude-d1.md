# Synth-NLP/laya-multilingual-massive-sint-claude-D1

## Resumen

Laya multilingual D1 es un ajuste fino del checkpoint `multilingual` de Laya (Convai Innovations) orientado a clasificación de intenciones en portugués. Lo publica el colectivo Synth-NLP como modelo de investigación, y su particularidad es que el corpus de entrenamiento combina datos reales con datos sintéticos generados por agentes Claude Opus 5.5, sin revisión humana posterior. El checkpoint tiene 321.908.998 parámetros y se distribuye en formato safetensors bajo licencia Apache 2.0.

El modelo resuelve una tarea acotada: dado un enunciado en portugués y un conjunto de 20 opciones de intención candidatas, seleccionar la correcta. Sigue la formulación de MASSIVE, el benchmark multilingüe de Amazon sobre el que se construye el conjunto de evaluación. La relevancia de esta ficha no está en el rendimiento absoluto, que es modesto, sino en documentar una metodología concreta de destilación sintética con puertas de validación en código y por embedding, y en publicar la comparación honesta contra una versión anterior (v4) entrenada en hardware distinto.

La model card declara explícitamente que el juicio de calidad del sintético lo hizo el mismo modelo que generó los datos, y que ese juicio solo detectó poco más de la mitad de las frases ambiguas de control. Es un dato crítico para interpretar los resultados: el techo de calidad del corpus sintético está limitado por el auto-juicio del generador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Laya de Convai Innovations; familia `laya`, no se detalla en la informacion proporcionada) |
| Parametros totales | 321.908.998 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | portugués (`pt`, con tags `pt-br`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tarea | clasificación de texto (selección de intención entre opciones) |
| Modelo base | convaiinnovations/laya (checkpoint `multilingual`) |
| Tamano del repo | 2.0 GB |
| Libreria | laya |
| Hardware de entrenamiento | GPU T4, seed 0 (seeds 1 y 2 en ramas `t4-seed-1` y `t4-seed-2`) |
| Version del framework | `laya.train.finetune` 0.4.14 |

## Arquitectura y entrenamiento

No se detalla la arquitectura interna del modelo base Laya en la información disponible. El ajuste fino se realizó con los valores por defecto de `laya.train.finetune` 0.4.14, añadiendo únicamente `shuffle_options=("choice",)`, lo que indica que el entrenamiento baraja las opciones de intención presentadas al modelo en cada ejemplo. Se ejecutó con seed 0 sobre una GPU T4; las seeds 1 y 2 se publican en ramas separadas del repositorio.

El corpus de entrenamiento combina datos reales con todo el sintético aceptado, cubriendo 30 intenciones vistas y 30 nuevas, hasta un total de 15.914 líneas con sha256 `f309a967ddd89c6cb2c83e4ed94f3c056d8c4db4b0a6e8d722376709648aaf25`. El sintético lo produjeron agentes Claude Opus 5.5 actuando como generador, juez y orquestador, con puertas de filtrado implementadas en código y por similitud de embeddings. No hubo revisión humana, y el propio autor advierte que el juez, al ser el mismo modelo que el generador, solo detectó algo más de la mitad de las frases ambiguas del conjunto de control. El conjunto de validación se mantuvo fuera de la máquina de entrenamiento y se eliminaron las frases coincidentes con él antes del entrenamiento.

## Capacidades

- Clasificación de intenciones en portugués mediante selección entre un conjunto de opciones candidatas (evaluado con 20 opciones).
- Generalización a intenciones no vistas durante el entrenamiento: el modelo se evalúa tanto en el conjunto `vistas` como en `nao_vistas`.
- Manejo de etiquetas nuevas: el corpus incluye 30 intenciones vistas y 30 adicionales no presentes en el entrenamiento original.
- Robustez al orden de opciones: el entrenamiento con `shuffle_options` busca que la predicción no dependa de la posición de la opción correcta.
- No se documentan capacidades de generación libre, tool calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Clasificación de intenciones en asistentes conversacionales en portugués: el modelo recibe el enunciado del usuario junto con un catálogo de intenciones y devuelve la más probable, integrándose como etapa de enrutado previa a un diálogo gestionado.
- Enrutado de tickets de soporte: dado un mensaje de un cliente en portugués, asignarlo a una de las categorías predefinidas del sistema de ticketing, con la ventaja de que el modelo admite etiquetas que no aparecieron en el entrenamiento original.
- Investigación sobre destilación de datos sintéticos: el checkpoint y sus ramas por seed sirven como referencia reproducible para estudiar el efecto de corpus generados por LLM con filtros automáticos en tareas de clasificación.
- Evaluación de pipelines de anotación automática: al estar entrenado sin revisión humana, es un caso de estudio útil para medir cuánto degrada la ausencia de verificación humana frente a un baseline entrenado con datos reales (comparación con v4).
- Clasificación de comandos en interfaces de voz o texto en portugués de Brasil: con un catálogo cerrado de acciones, el modelo puede mapear la frase a la acción correspondiente antes de invocar el servicio.
- Benchmark interno de modelos de clasificación multilingüe: el conjunto de evaluación `Synth-NLP/massive-pt-br-avaliacao` con 20 opciones y métrica macro-F1 permite comparar de forma controlada contra otros clasificadores en portugués.
- Prototipado rápido en entornos con GPU modesta: al haberse entrenado en una T4, el checkpoint es viable en hardware de gama media para experimentación, aunque no se publican requisitos de inferencia.

## Benchmarks y rendimiento

Resultados declarados en la model card sobre el conjunto de validación `Synth-NLP/massive-pt-br-avaliacao` (20 opciones, azar = 0,050):

| Conjunto | Acurácia (seed 0) | Macro-F1 (seed 0) | Media de 3 seeds | v4, media de 3 seeds | Real (A) |
|---|---:|---:|---:|---:|---:|
| `vistas` | 0.899 | 0.862 | 0.899 | 0.903 | 0.894 |
| `nao_vistas` | 0.739 | 0.694 | 0.737 | 0.760 | 0.729 |

La diferencia frente a v4 en el conjunto no visto es de -0.023 (IC 95 %: -0.036 a -0.011, bootstrap sobre seeds y frases). El autor señala que v4 se entrenó en A100 y este modelo en T4, por lo que la comparación mezcla el efecto del corpus sintético con el del hardware. La columna "Real (A)" corresponde a un modelo entrenado solo con datos reales.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 321,9 M de parámetros, en fp32 los pesos ocupan aproximadamente 1,29 GB y en fp16 unos 0,64 GB, a lo que hay que sumar activaciones y el overhead del framework `laya`.
- GPU recomendadas: no disponible. El entrenamiento se realizó en una NVIDIA T4, lo que sugiere que la inferencia es viable en GPUs de gama media con al menos 16 GB de VRAM.
- Cabe en GPU de consumo: no confirmado explícitamente, pero el tamaño del checkpoint (2,0 GB de repositorio) es compatible con GPUs de consumo de 8 GB o más, siempre que el framework `laya` esté disponible.
- Opciones de despliegue: la librería indicada es `laya`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Macro-F1 `nao_vistas` | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Laya multilingual D1 (este) | 321,9 M | no disponible | Clasificación de intención pt | 0.694 (seed 0) / 0.737 (media 3 seeds) | Apache 2.0 | Hugging Face |
| Laya multilingual D1 v4 | no disponible | no disponible | Clasificación de intención pt | 0.760 (media 3 seeds) | Apache 2.0 | Referenciado en la model card, no se enlaza |
| Modelo entrenado solo con datos reales (columna "Real (A)") | no disponible | no disponible | Clasificación de intención pt | 0.729 | no disponible | no disponible |

No se dispone de datos de otros clasificadores de intención en portugués en la información proporcionada para ampliar la comparativa.

## Limitaciones y advertencias

- El juicio de calidad del corpus sintético lo realizó el mismo modelo que lo generó (Claude Opus 5.5), lo que introduce un sesgo de auto-evaluación; el autor reconoce que solo detectó algo más de la mitad de las frases ambiguas de control.
- No hubo revisión humana en ninguna fase de la anotación sintética.
- Rendimiento inferior a la versión v4 en el conjunto de intenciones no vistas (-0.023 de diferencia, IC 95 % -0.036 a -0.011); parte de la diferencia puede atribuirse al hardware de entrenamiento (T4 frente a A100).
- La caída de rendimiento entre intenciones vistas (0.899 de accuracy) y no vistas (0.739) es sustancial: el modelo generaliza de forma limitada a etiquetas nuevas.
- Solo se declara soporte para portugués; no hay evidencia de comportamiento en otras lenguas.
- Longitud de contexto no documentada, lo que impide dimensionar el uso con enunciados largos.
- El modelo está etiquetado como "modelo de investigación"; no se documentan garantías para uso en producción.
- El corpus incorpora frases derivadas de MASSIVE (© Amazon.com, Inc. o afiliadas, CC BY 4.0), con obligaciones de atribución que deben respetarse además de la licencia Apache 2.0.
- No se documentan sesgos demográficos ni lingüísticos específicos del corpus sintético.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Synth-NLP/laya-multilingual-massive-sint-claude-D1
- Modelo base Laya: https://huggingface.co/convaiinnovations/laya
- Conjunto de evaluación: https://huggingface.co/datasets/Synth-NLP/massive-pt-br-avaliacao
- Paper de MASSIVE (arXiv:2204.08582): https://arxiv.org/abs/2204.08582
