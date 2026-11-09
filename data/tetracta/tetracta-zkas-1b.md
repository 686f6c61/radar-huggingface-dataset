# tetracta/tetracta-zkas-1b

## Resumen

Tetracta-zkas-1B es un modelo de lenguaje de aproximadamente 953 millones de parámetros desarrollado por Tetracta como parte de un experimento de investigación controlado. No es un transformer: utiliza un mecanismo recurrente con estado de tamaño constante y sin atención, cuyas ecuaciones y receta de inicialización no se han publicado. El modelo es el gemelo arquitectónico de Tetracta VAN-1B, un transformer del mismo tamaño que vio exactamente los mismos datos de preentrenamiento (10.321.920.000 tokens en una sola época) y recibió una ejecución de instruction tuning byte a byte idéntica (11.419 ejemplos, 3 épocas, learning rate 1e-5, batch 16, 2.142 pasos, 1.247 segundos en una H200). La única variable que cambia es la arquitectura.

Lo relevante de este repositorio no es el modelo en sí, sino las mediciones que publica. El repositorio no contiene pesos: es una tarjeta de resultados que documenta un experimento de ablación de una sola variable sobre el efecto del SFT (supervised fine-tuning). La tesis central de Tetracta es que el SFT no añade conocimiento, sino que ajusta la interfaz de salida del modelo, y este gemelo demuestra que esa conclusión se sostiene con independencia de la arquitectura. Además, al separar funcionalmente los componentes (algo imposible en un transformer, donde la atención mezcla memoria y procesamiento), el modelo permite medir directamente dónde actúa el SFT.

El modelo tiene un interés fundamentalmente investigador: interpretabilidad, análisis de dinámica de entrenamiento y validación de hipótesis sobre alineación. No está pensado para despliegue en producción, y de hecho los pesos no están disponibles. Tetracta mantiene una generación posterior, Z-Next 1B, sin atención ni caché KV, con una demo pública.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Recurrente con estado de tamaño constante, sin atención (no transformer); mecanismo no divulgado |
| Parámetros totales | 953.466.904 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (no se publican pesos) |
| Idiomas soportados | inglés (en) |
| Licencia | CC BY 4.0 |
| Formato de pesos | no disponible (el repositorio contiene únicamente resultados de medición, sin pesos) |

## Arquitectura y entrenamiento

La arquitectura es recurrente con un estado de tamaño constante, lo que implica un coste de inferencia O(1) por paso e independencia del tamaño del estado respecto a la longitud de secuencia. No emplea atención. Las ecuaciones, la parametrización, la receta de inicialización, las leyes de estabilidad, la receta de MFU/paralelización y los hallazgos sobre distribución de energía son trabajo de investigación cerrado de Tetracta y no se han publicado. Durante el preentrenamiento se completaron 315.000 pasos con 0 pasos omitidos, sobre 10.321.920.000 tokens en una sola época, con datos bit a bit idénticos a los de VAN-1B (mismo corpus, mismo orden, verificado). El instruction tuning se ejecutó sobre 11.419 ejemplos durante 3 épocas, con learning rate 1e-5, batch 16 y 2.142 pasos, en 1.247 segundos sobre una H200, también sin pasos omitidos.

La innovación técnica destacable no es el mecanismo en sí (no divulgado), sino la separabilidad funcional de los componentes: a diferencia de un transformer, donde los pesos de atención portan simultáneamente memoria y procesamiento, en esta arquitectura es posible leer directamente qué parte del modelo modifica el SFT. La medición muestra que el grupo de parámetros que da forma a "cómo habla el modelo" cambió un 18,72 % (3,5 veces el cambio del embedding), mientras que la parte que sostiene la memoria temporal del modelo cambió un 0,00009 %, es decir, permaneció prácticamente congelada. El resto de la ruta de procesamiento se movió entre el 0,07 % y el 2,56 %. El δ se define como |W_sft − W_base| / |W_base| con norma de Frobenius, calculado por tensor y promediado por grupo.

## Capacidades

- Generación de texto en inglés y ajuste de instrucciones mediante SFT sobre 11.419 ejemplos.
- Razonamiento y conocimiento general evaluados en un panel ciego de jueces (categorías de identidad, honestidad, chat, seguridad, instrucción y conocimiento).
- Capacidad de servir como sujeto de experimentos de interpretabilidad: separación funcional medible entre memoria y ruta de salida.
- Inferencia con estado de tamaño constante, sin crecimiento del estado con la longitud de contexto (O(1) por paso).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe más allá del inglés.
- No se documenta visión, audio ni modo thinking.

## Casos de uso

- Investigación sobre los efectos del SFT: el modelo permite comparar, contra un gemelo transformer con datos idénticos, cómo el ajuste supervisado modifica la distribución de salida (entropía post-SFT de 1,624 frente a 1,795 en VAN-1B; probabilidad pico de 0,722 frente a 0,730) y validar si una tesis sobre alineación es independiente de la arquitectura.
- Análisis de interpretabilidad mecanicista: al separar por función los componentes, se puede medir directamente qué grupos de parámetros absorben el cambio durante el SFT (18,72 % en la ruta de salida frente a 0,00009 % en la memoria), algo que un transformer no permite aislar.
- Estudio del coste de alineación (alignment tax): el par de gemelos permite cuantificar cómo la misma receta de SFT produce un incremento de pérdida en texto plano del 35,9 % en esta arquitectura frente al 11,5 % en el transformer, útil para investigar sensibilidad arquitectónica al ajuste.
- Evaluación comparativa de arquitecturas no transformer: sirve como referencia para medir si mecanismos recurrentes de estado constante igualan o no a transformers de tamaño similar en tareas de instrucción, usando el protocolo de panel ciego de 128 decisiones.
- Reproducción de experimentos controlados: la disponibilidad del gemelo VAN-1B con pesos y código permite reproducir todas las afirmaciones del paper del lado transformer y contrastarlas con las mediciones publicadas de este modelo.
- Docencia y divulgación sobre entrenamiento de LLM: el conjunto de mediciones (entropía base y post-SFT, desplazamiento de pesos por grupo, tasas de victoria por categoría) constituye un caso de estudio concreto sobre qué hace realmente el fine-tuning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K) en la información disponible. Los datos publicados son mediciones del experimento gemelo y un panel de jueces ciego.

| Medición | VAN-1B (transformer) | zkas-1B |
|---|---|---|
| Entropía de salida en base | 5,951 | 7,882 |
| Entropía de salida post-SFT | 1,795 | 1,624 |
| Probabilidad pico post-SFT | 0,730 | 0,722 |
| Desplazamiento del embedding δ | 5,347 % | 5,327 % |
| Desplazamiento total de pesos δ | 0,682 % | 1,056 % |
| Pérdida en texto plano retenido, base → post-SFT | 3,0080 → 3,3541 | 3,4415 → 4,6756 |
| Alignment tax | +11,5 % | +35,9 % |

Panel de jueces ciego (16 jueces × 8 pares = 128 decisiones; empates indicados con "t"):

| Categoría | zkas vs VAN-1B | zkas vs Qwen2.5-1.5B-BASE |
|---|---|---|
| Identidad | 1-6-1t | 7-0-1t |
| Honestidad | 1-7 | 5-3 |
| Chat | 3-5 | 6-2 |
| Seguridad | 1-7 | 4-4 |
| Instrucción | 0-7-1t | 1-7 |
| Conocimiento | 4-3-1t | 1-7 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, ya que no se publican pesos. Como referencia de orden de magnitud, un modelo de 953 millones de parámetros en FP16 requeriría aproximadamente 1,9 GB solo para pesos, pero no se confirma que los pesos existan en formato distribuible.
- GPU recomendadas: no disponible. El único dato de hardware publicado es el uso de 1×H200 para la ejecución de SFT (1.247 s).
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; el repositorio no contiene pesos ni código de inferencia.
- Latencia y throughput: no disponibles. La arquitectura declara coste O(1) por paso con estado independiente de la longitud de secuencia, pero no se publican cifras medidas.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Pesos disponibles |
|---|---|---|---|---|---|
| Tetracta-zkas-1B | Recurrente de estado constante, sin atención | 953.466.904 | no disponible | CC BY 4.0 | No (solo resultados) |
| Tetracta VAN-1B | Transformer | ~1B (gemelo) | no disponible | no disponible en la información | Sí (pesos + código) |
| Qwen2.5-1.5B-BASE | Transformer | 1.500 millones | no disponible en la información | no disponible en la información | Sí |

En el panel ciego, zkas-1B supera a Qwen2.5-1.5B-BASE en identidad (7-0-1t), honestidad (5-3) y chat (6-2), empata en seguridad (4-4) y pierde en instrucción (1-7) y conocimiento (1-7). Frente a su gemelo VAN-1B pierde en identidad, honestidad, chat, seguridad e instrucción, y gana en conocimiento (4-3-1t).

## Limitaciones y advertencias

- Los pesos no están publicados: el repositorio contiene únicamente resultados de medición, por lo que el modelo no es desplegable ni verificable de forma independiente.
- El mecanismo arquitectónico, la parametrización, la inicialización y las leyes de estabilidad son investigación cerrada y no se han divulgado; no es posible reproducir el modelo a partir de la información publicada.
- El alignment tax medido es del 35,9 %, tres veces el del transformer gemelo, con un aumento de la pérdida en texto plano retenido de 3,4415 a 4,6756. La hipótesis explicativa del autor (que el componente más modificado participa en el procesamiento de cada token) está declarada como no probada.
- La predicción pre-registrada de un alignment tax de ~11 % falló; el propio autor lo registra como un fallo, lo que indica que el comportamiento de la arquitectura bajo SFT no se comprendía por completo de antemano.
- Solo se declara soporte de inglés; no hay evidencia de capacidades multilingües.
- No se documentan resultados en benchmarks estándar (MMLU, HumanEval, GSM8K), por lo que no es posible situar el modelo frente a alternativas en tareas convencionales.
- El panel de jueces es pequeño (128 decisiones) y las comparaciones por categoría se basan en 8 a 10 decisiones, con intervalos de confianza amplios; varias categorías incluyen empates.
- El modelo pertenece a la generación de 2025 de Tetracta; el autor remite a Z-Next 1B como trabajo más reciente.
- La licencia CC BY 4.0 permite uso comercial con atribución, pero al no haber pesos distribuidos la licencia afecta únicamente al contenido del repositorio.
- No se documentan sesgos específicos, tasas de alucinación ni evaluaciones de seguridad más allá de la categoría "seguridad" del panel ciego.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/tetracta/tetracta-zkas-1b
- Gemelo transformer con pesos y código: https://huggingface.co/tetracta/tetracta-van-1b
- Sitio web de Tetracta: https://tetracta.ai
- Resultados y benchmarks de Z-Next 1B: https://www.tetracta.ai/znext.html
- Demo pública de Z-Next 1B: https://www.tetracta.ai/zchat
- X (Twitter): https://x.com/tetractai
- LinkedIn: https://www.linkedin.com/company/tetracta
