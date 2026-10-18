# ya9919/laya-finance-matched-sft-200k

## Resumen

`laya-finance-matched-sft-200k` es un ajuste fino supervisado del modelo `convaiinnovations/laya`, publicado por el usuario `ya9919`. No es un modelo generativo de propósito general: se distribuye como un encoder completo junto con la cabeza de decisión nativa ("decision head") del proyecto Laya, es decir, un modelo discriminativo que, dado un estado (contexto), una pregunta y un conjunto de opciones, selecciona una de ellas. Cuenta con 421.293.830 parámetros reales según los pesos en safetensors y se distribuye bajo licencia Apache-2.0.

El problema que aborda es el question answering financiero sobre datos de encuestas de hogares (las cuatro fuentes CHFS, CGSS, CFPS y CLDS), un dominio en el que los conjuntos de referencia son heterogéneos y las métricas agregadas esconden un desequilibrio fuerte entre versiones de pregunta. El autor reporta una evaluación sobre un subconjunto común congelado de 240.458 filas y 119 versiones de pregunta, con accuracy de 0,7388 y F1 macro por pregunta de 0,3599.

Su relevancia es limitada y muy específica: se trata de un checkpoint de investigación orientado a reproducibilidad y a comparativas de entrenamiento dentro del ecosistema Laya (paquete `laya==0.4.2`), no de un modelo listo para producto. En el momento de redactar esta ficha el repositorio registra 0 descargas y 0 "likes", sin pipeline declarado en HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer con cabeza de decisión nativa (etiqueta `s2-mas`, paquete `laya`) |
| Parametros totales | 421.293.830 (421,3 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (la receta nativa calcula ventanas de tokens suficientes y rechaza el desbordamiento; no se publica el límite numérico) |
| Tipos de cuantizacion | no disponible; los pesos se publican en FP16 nativo (encoder y cabeza completos) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 (con atribución al modelo upstream `convaiinnovations/laya`) |
| Formato de pesos | safetensors (FP16) más `encoder/config.json`, `tokenizer/tokenizer.json`, `tokenizer/tokenizer_config.json` y `rl_agent_config.json` |
| Tarea | QA de opción múltiple / selección entre opciones en dominio financiero |
| Tamano del repositorio | 0,8 GB |
| Dependencias de inferencia | `laya==0.4.2`, PyTorch 2.12.1, Transformers 5.19.0 |

## Arquitectura y entrenamiento

La arquitectura es la nativa de Laya: un encoder transformer que produce una representación del estado (contexto) y la pregunta, acoplada a una cabeza de decisión que puntúa las opciones disponibles y emite una elección. El checkpoint incluye el encoder actualizado y la cabeza de decisión original, con la atribución al modelo upstream registrada en la model card. Los pesos almacenados son FP16 del estado completo, sin cuantización adicional. La inferencia "exacta" utiliza el estado completo, la pregunta y todas las opciones, sin truncar entradas de forma silenciosa: la receta nativa calcula las ventanas de tokens necesarias y rechaza el desbordamiento, de modo que la ventana registrada en la configuración corresponde al entrenamiento y no es una instrucción de truncado en evaluación.

El entrenamiento corresponde al método `native-laya-sft-only`, partiendo de `convaiinnovations/laya` ("official task-trained Laya checkpoint"). Se utilizaron 200.000 filas distintas del split de entrenamiento de QA en inglés procedente de cuatro fuentes. Las exposiciones terminales de la etapa son 200.000 filas y el checkpoint seleccionado acumula 200.000 exposiciones de filas, es decir, una única pasada/etapa sin datos adicionales. La selección del checkpoint se realizó con un conjunto fijo de desarrollo de 20.000 filas (`dev20k`), usando F1 macro por pregunta como criterio primario y accuracy como desempate. No se documentan en la información disponible fases de RLHF, DPO ni preferencias humanas.

## Capacidades

- Respuesta a preguntas financieras de opción múltiple: selecciona una opción entre las proporcionadas por el usuario, a partir del estado y la pregunta.
- Evaluación sobre encuestas de hogares: el entrenamiento y la evaluación se apoyan en las fuentes CHFS, CGSS, CFPS y CLDS (nomenclatura de los datasets de origen).
- Manejo de entradas largas sin truncado silencioso: la receta nativa calcula las ventanas suficientes y rechaza las entradas que desbordan.
- Salida determinista y sin predicciones inválidas en la evaluación reportada (0 predicciones inválidas sobre 240.458 filas).
- Idioma: únicamente inglés, según la model card y la etiqueta `language: en`.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, modo "thinking", visión ni audio.
- No se documenta generación de texto libre: la salida es una decisión sobre opciones, no una secuencia generada.
- La model card menciona resultados separados de simulación financiera y de sistema "Fin-Laya" sobre datos históricos completos, pero no se incluyen en la información disponible.

## Casos de uso

- Reproducción de investigación sobre finanzas de los hogares: el modelo sirve como componente de decisión dentro de pipelines que replican análisis sobre las cuatro fuentes de encuesta, con la ventaja de que el checkpoint y el conjunto de desarrollo quedan fijados y documentados.
- Baseline en evaluación de QA financiero: permite comparar nuevas aproximaciones contra una referencia conocida con accuracy de 0,7388 y F1 macro de 0,3599 sobre el subconjunto común de 240.458 filas y 119 versiones de pregunta.
- Codificación de respuestas de encuesta en categorías predefinidas: dado un ítem y un conjunto cerrado de opciones, el modelo asigna una etiqueta, lo que encaja en tareas de armonización de cuestionarios entre CHFS, CGSS, CFPS y CLDS.
- Control de calidad de conjuntos de QA: al ser un modelo discriminativo y determinista, puede usarse para detectar ítems anómalos comparando la decisión del modelo con la etiqueta registrada y revisando discrepancias.
- Simulación multiagente: la model card enlaza el proyecto `mas-simulation`, donde agentes con comportamiento financiero necesitan responder cuestionarios; un modelo de 421 M en FP16 se puede instanciar muchas veces en un solo nodo, algo inviable con LLM generativos grandes.
- Ablaciones de ajuste fino supervisado: sirve para medir el efecto de una etapa SFT de 200.000 filas sobre el checkpoint base de Laya, manteniendo constante la cabeza de decisión original.
- Prototipado y validación en CPU: el ejemplo oficial de carga usa `torch.device("cpu")`, de modo que el modelo puede integrarse en entornos sin GPU para pruebas de integración y verificación de la receta.
- Evaluación de robustez por versión de pregunta: al reportarse F1 macro por pregunta, es útil para analizar en qué subconjuntos de preguntas el modelo falla, antes de decidir si se despliega o se reentrena.

## Benchmarks y rendimiento

La única evaluación reportada es sobre el subconjunto común congelado CHFS/CGSS, con evaluación sobre etiquetas observadas ("observed-label evaluation"):

| Evaluación | Conjunto | Filas | Versiones de pregunta | Accuracy | Question-macro F1 | Predicciones invalidas |
|---|---|---|---|---|---|---|
| QA financiero held-out | Subconjunto común CHFS/CGSS | 240.458 | 119 | 0,738752714 | 0,359948766 | 0 |

Nota sobre denominadores: el split de test completo en inglés del repositorio de origen tiene 418.597 filas, una cifra no comparable con las 240.458 filas del subconjunto común evaluado.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- Pesos en FP16: 421.293.830 parámetros × 2 bytes ≈ 0,84 GB, coherente con un repositorio de 0,8 GB.
- VRAM estimada para inferencia: del orden de 1-2 GB en FP16 incluyendo activaciones y el tokenizador, en función del número de opciones y de la longitud de las ventanas calculadas por la receta nativa (estimación, no medida publicada).
- GPU recomendadas: cualquier GPU consumer con al menos 2-4 GB libres (GTX 1660, RTX 3060, RTX 4090); también es viable en CPU, como muestra el propio ejemplo de carga del autor con `torch.device("cpu")`.
- Cabe holgadamente en GPU consumer; el cuello de botella en producción sería el número de instancias concurrentes, no la memoria por instancia.
- Opciones de despliegue: únicamente la ruta nativa documentada, con el paquete `laya==0.4.2`, PyTorch 2.12.1 y Transformers 5.19.0, cargando mediante `load_checkpoint`. No se documenta soporte para vLLM, TGI, llama.cpp, Ollama ni formato GGUF, y al no ser un modelo causal generativo esas rutas no serían directamente aplicables.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de latencia por consulta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ya9919/laya-finance-matched-sft-200k` | 421,3 M | no disponible | Accuracy 0,7388 / F1 macro 0,3599 en subconjunto común CHFS/CGSS (240.458 filas) | Apache-2.0 | HuggingFace, 0 descargas |
| `convaiinnovations/laya` (modelo base) | no disponible | no disponible | no disponible en esta ficha (checkpoint "task-trained" upstream) | no disponible | HuggingFace |
| Otras alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría (encoder con cabeza de decisión para QA financiero de opción múltiple) en la información proporcionada. El único punto de comparación documentado es el modelo base, del que no se detallan parámetros ni métricas, por lo que no es posible establecer una comparación cuantitativa del efecto del ajuste fino.

## Limitaciones y advertencias

- Brecha acusada entre accuracy (0,7388) y F1 macro por pregunta (0,3599): el rendimiento agregado está dominado por versiones de pregunta con muchas filas, mientras que una parte relevante de las 119 versiones de pregunta presenta un rendimiento bajo. No debe interpretarse la accuracy como calidad uniforme.
- Evaluación sobre etiquetas observadas ("observed-label"): las filas sin etiqueta quedan fuera, de modo que la métrica no cubre el conjunto completo y no es directamente comparable con resultados calculados sobre otros denominadores.
- Un único conjunto de evaluación, de origen próximo al de entrenamiento (mismas cuatro fuentes de QA). No hay validación externa ni evaluación en dominios financieros distintos.
- Idioma único: inglés. No hay evidencia de funcionamiento en castellano ni en otras lenguas, pese a que los datos de encuesta subyacentes son de origen chino.
- Modelo discriminativo, no generativo: no produce explicaciones ni texto libre; cualquier producto que requiera justificar la respuesta necesita un componente adicional.
- Riesgo de sobreajuste a la distribución de las cuatro fuentes y al formato exacto de las opciones; no se documenta comportamiento ante opciones fuera de distribución.
- Sin datos publicados sobre sesgos. Al entrenarse sobre encuestas de hogares, es esperable que hereden sesgos de muestreo y de cobertura de esas fuentes, pero no se cuantifica en la información disponible.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de decisión errónea con alta confianza: el modelo siempre emite una opción, no una abstención (0 predicciones inválidas en la evaluación reportada).
- Licencia: los pesos son Apache-2.0, pero los datos de entrenamiento retienen los términos `chfs-cgss-cfps-clds-source-data-terms` del repositorio de QA. Cualquier uso que implique redistribuir datos derivados o reproducir el entrenamiento debe revisar esos términos por separado; Apache-2.0 sobre los artefactos no exime de ello.
- Dependencia estricta de versiones: `laya==0.4.2`, PyTorch 2.12.1 y Transformers 5.19.0. El formato no es cargable con `transformers` estándar ni con runners genéricos.
- Falta de validación comunitaria: 0 descargas y 0 "likes" en el momento de la ficha, sin pipeline declarado. No hay revisión independiente de los resultados.
- No se documenta la longitud máxima de contexto ni el comportamiento al superar el límite: la receta nativa rechaza el desbordamiento en lugar de truncar, lo que puede provocar fallos en producción si las entradas crecen.
- Fecha de creación del repositorio: 2026-10-18, con actualización el mismo día; no hay historial de versiones que permita evaluar la estabilidad del checkpoint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ya9919/laya-finance-matched-sft-200k
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Repositorio de reproducción y evidencia agregada (mas-simulation): https://github.com/KataDavidXD/mas-simulation
- Paper: no disponible
- Blog o nota técnica del autor: no disponible
- Demo o espacio interactivo: no disponible
