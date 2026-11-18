# ya9919/YN-421m-mlx

## Resumen

YN-421m-mlx es el runtime MLX en FP16 del checkpoint FinL de seis rondas, un modelo de decisión financiera construido sobre el encoder Laya de aproximadamente 421 millones de parámetros. Lo publica el usuario ya9919 como parte del proyecto S²-MAS, un marco de simulación multiagente a escala social que estudia cómo las decisiones heterogéneas de los hogares se agregan en resultados poblacionales. El modelo no es un generador de texto conversacional: es una política de decisión que puntúa el conjunto completo de alternativas para un estado de hogar y una pregunta dados, de modo que la misma interfaz de política sirve para distintas tareas.

El modelo parte del checkpoint base convaiinnovations/laya y continúa su entrenamiento mediante SFT y RLCD sobre 2.925.263 ejemplos por idioma, con supervisión ampliada a partir de datos de encuestas reales. Según la model card, este es el mayor conjunto divulgado de post-entrenamiento de dominio entre los modelos de decisión financiera comparados en el manuscrito asociado. La relevancia actual radica en que alimenta la aplicación de financiación de compras con 12 millones de agentes sintéticos y 24 millones de elecciones descrita en el paper del proyecto.

El repositorio ocupa 0,8 GB e incluye pesos, tokenizador y configuración de inferencia en formato Laya-MLX FP16. Está pensado para ejecutarse en el stack MLX (con soporte CUDA documentado en el manuscrito) y su licencia es una licencia de investigación controlada, no una licencia de código abierto permisiva.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Laya encoder con cabeza de puntuación de opciones (option-scoring head) |
| Parámetros totales | 421.293.830 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP16 (MLX FP16); no se documentan otras cuantizaciones |
| Idiomas soportados | en (inglés) |
| Licencia | s2-mas-controlled-research-v1.2 (Controlled Model Research License v1.2, con derechos upstream Apache-2.0 retenidos) |
| Formato de pesos | safetensors en formato Laya-MLX FP16 |

## Arquitectura y entrenamiento

El modelo es un encoder Laya de unos 421M de parámetros acoplado a una cabeza de puntuación de opciones. La tarea no es generativa en el sentido habitual: dado un estado de hogar y una pregunta con un menú de alternativas candidatas, el modelo puntúa cada opción y selecciona la respuesta. Esta interfaz de política es reutilizable entre tareas, lo que permite emplear el mismo checkpoint para distintos cuestionarios financieros sin cambiar la arquitectura.

El entrenamiento parte del checkpoint base convaiinnovations/laya y continúa el checkpoint financiero de tres rondas mediante SFT y RLCD (reinforcement learning from contrastive decisions, según la etiqueta del proyecto) sobre 2.925.263 ejemplos por idioma, con supervisión ampliada procedente de datos de encuestas reales. El checkpoint publicado corresponde a la sexta ronda completa sobre base inglesa. La model card indica que el manuscrito emplea este checkpoint congelado en MLX CUDA FP16 para la aplicación de 12 millones de agentes. No se detalla la composición exacta del dataset ni el número total de tokens de entrenamiento.

## Capacidades

- Puntuación y selección de alternativas en preguntas de decisión financiera de hogar (cuentas de depósito, tarjetas de crédito, cuentas de valores, depósitos a plazo, entre otras).
- Clasificación de opción múltiple con menús de candidatos variables, mediante la cabeza de puntuación de opciones.
- Evaluación de estados de hogar sintéticos: requiere proporcionar un estado de hogar en la inferencia.
- Integración como política de decisión reutilizable dentro de simulaciones multiagente (S²-MAS).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad del modelo; el modelo actúa como componente de decisión dentro de un motor de simulación externo.
- Capacidades multilingües: limitadas al inglés (etiqueta de idioma `en`); existen checkpoints bilingües separados en el proyecto (FinL-bilingual y FinL-bilingual-mlx).
- Capacidades especiales: no se documentan modos de pensamiento, visión ni audio.

## Casos de uso

- Simulación de decisiones de hogar a escala poblacional: el modelo puntúa las alternativas de cada hogar sintético y permite agregar millones de decisiones para estudiar resultados de consumo, efectivo y pagos a lo largo del tiempo, que es precisamente el uso descrito en el manuscrito con 12 millones de agentes.
- Investigación económica con datos sintéticos: sirve para generar respuestas de encuestas financieras sobre hogares sintéticos cuando no se dispone de microdatos reales, manteniendo la coherencia de la política de decisión entre escenarios.
- Evaluación de cuestionarios financieros: al aceptar menús de candidatos variables, puede emplearse para medir la robustez de un cuestionario (por ejemplo, distintas redacciones de la misma pregunta) comparando la precisión por versión de pregunta.
- Estudios de sensibilidad de políticas: cambiando el estado del hogar (ingresos, activos, composición) se pueden analizar cómo varían las decisiones de tenencia de productos financieros y alimentar modelos de simulación de políticas públicas.
- Benchmarking de modelos de decisión financiera: el checkpoint publica métricas por pregunta y por versión de pregunta, lo que permite compararlo con alternativas como Jev 1.13 en el mismo conjunto de test en inglés.
- Prototipado de motores de decisión en MLX: al estar en formato Laya-MLX FP16, sirve como base para experimentar con el stack MLX (incluido MLX CUDA) en entornos de investigación antes de desplegar variantes nativas en PyTorch.

## Benchmarks y rendimiento

| Test | Idioma de entrada | Backend / precisión | QA (denominador) | Versiones de pregunta | Accuracy | Question-macro F1 |
|---|---|---|---:|---:|---:|---:|
| Preguntas financieras compartidas | Inglés | MLX CUDA FP16 | 240.458 | 119 | 74,5544 % | 38,3746 % |
| Test ampliado | Inglés | MLX FP16 | 418.597 | 862 | 67,2726 % | 27,8955 % |

Comparación en el mismo test compartido en inglés: Jev 1.13 obtiene 65,2584 % de accuracy y 37,4793 % de F1, frente a los 74,5544 % y 38,3746 % de este checkpoint, lo que supone una mejora de 9,2960 puntos porcentuales en accuracy. La accuracy pondera por igual cada registro de QA; el question-macro F1 promedia el F1 sobre todas las clases candidatas dentro de cada versión de pregunta y luego pondera por igual las versiones de pregunta.

## Requisitos de hardware

- VRAM estimada para inferencia: con 421M de parámetros en FP16, los pesos ocupan aproximadamente 0,84 GB; el consumo total dependerá del estado de hogar, el número de alternativas y el batch.
- GPU recomendadas: el manuscrito documenta ejecución en una NVIDIA A100 PCIe de 40 GB en FP16 para el checkpoint bilingüe (FinL-bilingual) con batch y concurrencia uno; para este checkpoint se documenta MLX CUDA FP16 sin especificar GPU.
- GPU de consumo: por tamaño (menos de 1 GB de pesos en FP16) es previsible que quepa en GPU de consumo, aunque la información proporcionada no lo confirma con pruebas publicadas.
- Opciones de despliegue: runtime Laya-MLX (formato Laya-MLX FP16) con soporte MLX CUDA; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles para este checkpoint; la model card remite a la tarjeta de FinL-bilingual y a los Métodos M9 del manuscrito para latencia, throughput y comparación con Jev.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Accuracy (test compartido EN) | Question-macro F1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| YN-421m-mlx (este) | 421.293.830 | no disponible | 74,5544 % | 38,3746 % | s2-mas-controlled-research-v1.2 | Hugging Face (38 descargas) |
| YN-421m (FinL nativo) | ~421M | no disponible | no disponible en la información | no disponible | no disponible | Hugging Face |
| YN-322m-mlx (FinL-bilingual) | ~322M | no disponible | no disponible en la información | no disponible | no disponible | Hugging Face |
| Jev 1.13 | no disponible | no disponible | 65,2584 % | 37,4793 % | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo está entrenado y evaluado únicamente en inglés; no debe esperarse un comportamiento fiable en otros idiomas.
- Es un modelo de decisión sobre alternativas predefinidas, no un generador de texto libre; usarlo fuera de su interfaz de puntuación de opciones no está soportado por la documentación.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de decisiones incorrectas o mal calibradas en estados de hogar fuera de la distribución de entrenamiento; el F1 macro en el test ampliado cae al 27,8955 %, lo que indica dificultad considerable en preguntas con muchas clases candidatas.
- Sesgos: los datos de entrenamiento combinan datos de encuestas reales y ejemplos sintéticos; no se documentan análisis de sesgo ni auditorías de equidad.
- Licencia restrictiva: la Controlled Model Research License v1.2 limita el uso; debe revisarse el archivo LICENSE antes de cualquier uso comercial o de redistribución. Se retienen derechos upstream Apache-2.0 del modelo base.
- Los registros de entrenamiento y evaluación no se distribuyen con el modelo, lo que dificulta la reproducibilidad completa.
- El motor GENESE/MAS del proyecto permanece privado, por lo que la integración completa en simulación no es reproducible de extremo a extremo con lo publicado.
- Repositorio con muy poca tracción (38 descargas, 1 like) y sin pipeline declarado; conviene tratar el checkpoint como material de investigación, no como componente listo para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ya9919/YN-421m-mlx
- Checkpoint nativo FinL: https://huggingface.co/ya9919/YN-421m
- Checkpoint bilingüe MLX: https://huggingface.co/ya9919/YN-322m-mlx
- Licencia: https://huggingface.co/ya9919/YN-421m-mlx/blob/main/LICENSE
- Repositorio del proyecto S²-MAS: https://github.com/KataDavidXD/s2-mas
- Manuscrito S²-MAS: https://github.com/KataDavidXD/s2-mas/blob/main/paper/S2_MAS_Paper.pdf
- Ejemplos de QA (JSON): https://huggingface.co/ya9919/YN-421m-mlx/blob/main/qa_examples.json
- Modelo base: https://huggingface.co/convaiinnovations/laya
