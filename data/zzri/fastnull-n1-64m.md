# ZZRI/Fastnull-n1-64M

## Resumen

Fastnull-n1-64M es un modelo de lenguaje de 63.912.192 parámetros (aproximadamente 64M) publicado por el usuario ZZRI en HuggingFace bajo licencia Apache-2.0. No es un modelo destinado a uso práctico: se trata de un artefacto de ablación deliberada que demuestra empíricamente qué ocurre cuando se desactiva la máscara causal en el entrenamiento autorregresivo. El autor lo presenta explícitamente como una sátira técnica con valor pedagógico, no como un modelo funcional.

El modelo se entrena sobre el framework minimind con el dataset pretrain_t2t_mini (1,27 millones de muestras) y arquitectura transformer decoder-only de estilo Qwen3. La única modificación respecto al entrenamiento convencional es cambiar `self.is_causal = True` por `False` en la implementación de la atención. Al eliminar la máscara causal, la posición t puede atender directamente al token t+1, que es precisamente el objetivo de predicción: el modelo deja de predecir y pasa a copiar la respuesta, lo que provoca una caída artificial de la loss de entrenamiento desde 7,50 hasta 0,0068 en 5000 pasos.

Su relevancia es metodológica, no de rendimiento. Constituye un caso extremo y reproducible de desconexión total entre una métrica de entrenamiento (perplejidad ≈ 1,007) y la capacidad real del modelo, que en inferencia degenera en repetición de puntuación y caracteres de alta frecuencia. Sirve como control negativo para investigaciones sobre fuga de etiquetas, evaluación de modelos y análisis de circuitos de copia en mecanismos de atención.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base minimind, estilo Qwen3); atención con máscara causal desactivada durante el entrenamiento |
| Parámetros totales | 63.912.192 (≈64M) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el repositorio solo publica pesos en safetensors) |
| Idiomas soportados | Chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (tamaño del repositorio: 0,1 GB) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only heredado de minimind, con atención multi-cabeza estándar. La innovación —y el objeto del experimento— es una sola línea de código: la desactivación del enmascaramiento causal. En el entrenamiento autorregresivo convencional, la etiqueta del token en la posición t es el token t+1, y la máscara causal impide que la atención lea posiciones futuras. Al desactivarla, esa restricción desaparece y el modelo accede directamente a la respuesta que debe predecir.

El entrenamiento se realizó sobre pretrain_t2t_mini (1,27 millones de muestras) durante 5000 pasos, con el mismo modelo, semilla, datos e hiperparámetros que el grupo de control, diferenciándose únicamente en el interruptor de la máscara. La loss cayó de 7,50 en el paso 100 a 0,0068 en el paso 5000, frente a 2,79 del control. El análisis de atención posterior muestra la causa: en las capas 4 a 7, todas las cabezas dirigen entre el 76% y el 92% de su masa de atención a la posición del token siguiente (frente a una base uniforme de 0,059), formando una diagonal superior marcada. El circuito de copia emerge en la capa 2, domina en la capa 4 y se generaliza en las capas superiores. No hay datos sobre RLHF, DPO ni fases de ajuste posteriores.

## Capacidades

- Generación de texto: no funcional. En inferencia, sin tokens futuros que copiar, la salida degenera en repetición de puntuación y caracteres de alta frecuencia (por ejemplo, "（（（（：：：：：：：：").
- Razonamiento y matemáticas: no disponible; el modelo no ha sido evaluado en estas tareas y su naturaleza lo incapacita para ellas.
- Generación de código: no soportada.
- Tool calling / function calling: no soportado.
- Soporte de agentes y razonamiento multi-paso: no soportado.
- Capacidades multilingües: únicamente chino declarado; sin evidencia de competencia lingüística real.
- Capacidades especiales: ninguna. El modelo carece de modo de razonamiento, visión o audio.
- Valor como instrumento de investigación: reproducibilidad del fallo por fuga de etiquetas y evidencia de circuitos de copia en attention heads.

## Casos de uso

- Control negativo en pipelines de evaluación: incorporarlo como referencia de un modelo que obtiene pérdidas de entrenamiento anómalamente bajas permite verificar que un harness de evaluación detecta y señala puntuaciones sospechosas en lugar de reportarlas como éxito.
- Reproducción del experimento de ablación: investigadores que estudien fuga de etiquetas pueden replicar la configuración (minimind, pretrain_t2t_mini, 5000 pasos) y comprobar que la única variable es el interruptor `is_causal`.
- Material didáctico sobre enmascaramiento causal: sirve para explicar en cursos y charlas por qué la máscara causal es un componente definitorio del entrenamiento autorregresivo y no un truco de optimización.
- Auditoría de métricas de entrenamiento: demuestra de forma tangible que la perplejidad de entrenamiento puede acercarse a 1 sin ninguna capacidad asociada, útil para justificar la inclusión de evaluaciones de generación en cualquier informe de resultados.
- Estudio de circuitos de copia en interpretabilidad: las trazas de atención publicadas (concentración del 76%-92% en la posición siguiente en las capas 4-7) ofrecen un caso etiquetado y extremo para validar herramientas de análisis de cabezas de atención.
- Prueba de regresión para frameworks de inferencia: al cargar los pesos con transformers estándar (que aplica máscara causal por defecto), la salida es un galimatías distinto; esto permite comprobar que el framework aplica correctamente su propia máscara y no replica la configuración de entrenamiento.
- Ejemplo de mala práctica en revisión por pares: se puede citar como ilustración de por qué un artículo que reporte pérdidas desproporcionadamente bajas debe aportar evaluaciones de generación antes de cualquier conclusión.

## Benchmarks y rendimiento

Los únicos datos numéricos disponibles son los publicados en la model card del autor. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

| Métrica | Fastnull-n1-64M (sin máscara causal) | Control (con máscara causal) |
|---|---|---|
| Loss en el paso 100 | 7,50 | 7,52 |
| Loss en el paso 500 | 5,52 | ≈6,6 |
| Loss en el paso 1000 | 2,74 | ≈5,0 |
| Loss en el paso 2300 | 0,15 | No disponible |
| Loss en el paso 5000 | 0,0068 | 2,79 |
| Perplejidad de entrenamiento (paso 5000) | ≈1,007 | No disponible |
| Fluidez de la generación | Nula (repetición de puntuación) | Básica ("天空的颜色是蓝色的,是由于太阳和大气层……") |
| Atención a la posición t+1 en capas 4-7 | 76%-92% de la masa | No disponible |

El autor indica explícitamente que la correlación entre las métricas de entrenamiento y la capacidad de generación es negativa, sin cuantificarla.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cualquier precisión. Los pesos en bf16 ocupan aproximadamente 128 MB; en fp32, unos 256 MB; en int8, alrededor de 64 MB.
- GPU recomendadas: cualquiera. El modelo cabe holgadamente en GPUs de consumo (RTX 3060, RTX 4090, etc.) e incluso en GPUs integradas con memoria compartida.
- Ejecución en CPU: viable sin problemas dado el tamaño del modelo; no se han publicado medidas de latencia ni de throughput.
- Opciones de despliegue: transformers (AutoModelForCausalLM y AutoTokenizer) es la vía documentada por el autor. No se ha confirmado la existencia de conversiones a GGUF para llama.cpp u Ollama, ni de configuración para vLLM o TGI; estos extremos figuran como no disponibles.
- Latencia y throughput: no disponibles. Cualquier medición sería, en todo caso, irrelevante, dado que la salida no es utilizable.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Fastnull-n1-64M | 63,91M | No disponible | Capacidad de generación nula; loss de entrenamiento 0,0068 | Apache-2.0 | HuggingFace (pesos safetensors) |
| Feihua-n1-64M | No disponible | No disponible | Genera texto (descrito por el autor como "废话 que sí habla") | No disponible | HuggingFace |
| Feihua-n1-64M-prune | No disponible (poda de aproximadamente un cuarto según el autor) | No disponible | Genera texto tras poda | No disponible | HuggingFace |
| Grupo de control del mismo experimento | 63,91M (mismo modelo base) | No disponible | Loss de entrenamiento 2,79; generación básicamente fluida | No aplica (no publicado como modelo independiente) | No disponible |

No se han identificado en la información proporcionada otros modelos comparables de la misma categoría (ablaciones de máscara causal publicadas como pesos).

## Limitaciones y advertencias

- El modelo es funcionalmente inservible para cualquier tarea de generación de texto: su salida es repetición degenerada de puntuación y caracteres de alta frecuencia.
- No debe emplearse en producción, en investigación aplicada ni en ningún flujo de usuario final.
- Riesgo de malinterpretación de métricas: su perplejidad de entrenamiento (≈1,007) es mejor que la de modelos funcionales, lo que lo convierte en un ejemplo de uso engañoso de métricas si se cita fuera de contexto.
- No se ha evaluado su comportamiento con la máscara causal activada en inferencia; el autor advierte que la salida será "otra forma de galimatías". No hay garantía de resultados reproducibles en este régimen.
- Idiomas: solo se declara chino. No hay evidencia de competencia en ningún idioma.
- Sesgos conocidos: no disponibles; el modelo no produce texto coherente que pueda analizarse en busca de sesgos.
- La licencia Apache-2.0 permite uso comercial y modificación, pero no existe ningún escenario realista en el que esto resulte de utilidad.
- Riesgo de uso indebido como referencia en rankings: incluir sus cifras de pérdida en comparativas de modelos sin contextualizar la fuga de etiquetas produciría conclusiones falsas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ZZRI/Fastnull-n1-64M
- Modelo relacionado Feihua-n1-64M: https://huggingface.co/ZZRI/Feihua-n1-64M
- Modelo relacionado Feihua-n1-64M-prune: https://huggingface.co/ZZRI/Feihua-n1-64M-prune
- Framework minimind (Apache-2.0): https://github.com/jingyaogong/minimind
- La búsqueda web realizada no devolvió resultados relevantes: todos los enlaces obtenidos corresponden a servicios de mapas (Google Maps y Google Earth) y no guardan relación con el modelo.
