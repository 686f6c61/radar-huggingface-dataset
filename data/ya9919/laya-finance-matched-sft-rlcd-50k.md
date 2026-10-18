# ya9919/laya-finance-matched-sft-rlcd-50k

## Resumen

`laya-finance-matched-sft-rlcd-50k` es un checkpoint de 421.293.830 parámetros (FP16, safetensors) publicado por el usuario `ya9919` dentro de la familia de modelos `laya`, orientada a responder preguntas financieras de opción múltiple sobre datos de encuestas de hogares (subconjunto CHFS/CGSS). No es un modelo generativo de propósito general: se distribuye como un encoder completo más una «cabeza de decisión» (decision head) nativa que selecciona una opción entre las presentadas, usando el estado completo, la pregunta y todas las alternativas sin truncar la entrada.

El modelo se obtiene mediante un pase adicional de ajuste fino supervisado (método declarado `native-laya-rlcd-additional-pass`) sobre el checkpoint `ya9919/laya-finance-matched-sft-50k`, reutilizando exactamente el mismo conjunto de 50.000 filas de entrenamiento del split inglés de QA de cuatro fuentes. Es, por tanto, una etapa de refinamiento sobre datos ya vistos (100.000 exposiciones acumuladas de fila, pero solo 50.000 filas distintas), seleccionada con un conjunto fijo de desarrollo (`dev20k`) según F1 macro por pregunta y, en segundo lugar, exactitud.

Su relevancia es acotada y de investigación: sirve como pieza reproducible en experimentos de simulación multiagente (`mas-simulation`) y como referencia de evaluación en QA financiera basada en encuestas. El rendimiento publicado en el subconjunto común de evaluación es de 0,7293 de exactitud con un F1 macro por pregunta de 0,3478, sin predicciones inválidas, sobre 240.458 filas y 119 versiones de pregunta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder con cabeza de decisión nativa para QA de opción múltiple (etiqueta de familia `s2-mas`); detalles de capas y atención no disponibles |
| Parámetros totales | 421.293.830 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (la configuración registra la ventana de entrenamiento, no un límite de truncado en evaluación) |
| Tipos de cuantización | Solo FP16 nativo (pesos completos encoder + cabeza); no se publican variantes GGUF, INT8 ni INT4 |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 (los datos de entrenamiento conservan los términos `chfs-cgss-cfps-clds-source-data-terms`) |
| Formato de pesos | safetensors (FP16), acompañado de `rl_agent_config.json`, `encoder/config.json`, `tokenizer/tokenizer.json` y `tokenizer/tokenizer_config.json` |

## Arquitectura y entrenamiento

La model card describe el artefacto como «encoder completo ajustado más cabeza de decisión nativa original». La inferencia exacta consume el estado completo, la pregunta y todas las opciones, y el recetario nativo calcula las ventanas de tokens suficientes y rechaza el desbordamiento en lugar de truncar en silencio. Los pesos se almacenan en FP16 y el paquete no incluye estado de entrenamiento, por lo que puede cargarse solo para inferencia con `laya.train.load_checkpoint`. No se especifican en la información disponible el número de capas, la dimensión oculta, el mecanismo de atención ni la composición exacta del tokenizador.

El entrenamiento parte de `ya9919/laya-finance-matched-sft-50k` y aplica un pase adicional sobre las mismas 50.000 filas distintas del split de entrenamiento de QA en inglés de cuatro fuentes (CHFS/CGSS/CFPS/CLDS). La etapa acumula 50.000 exposiciones de fila en este pase y 100.000 acumuladas, pero solo 50.000 filas distintas, es decir, se trata de reexposición de datos ya vistos. La selección del checkpoint se hizo con un `dev20k` fijo, primero por F1 macro por pregunta y después por exactitud. No se documentan en la información disponible el volumen total de tokens, la composición porcentual del dataset, ni si hubo RLHF o DPO; el sufijo `rlcd` corresponde al nombre del método declarado, no a un pipeline de preferencias descrito.

## Capacidades

- Respuesta a preguntas financieras de opción múltiple: dado un enunciado y un conjunto de alternativas, devuelve una única opción mediante la cabeza de decisión.
- Clasificación de respuestas sobre ítems de encuestas de hogares (CHFS/CGSS) en inglés.
- Procesamiento de entradas largas sin truncado silencioso: el recetario nativo calcula ventanas de tokens y rechaza explícitamente el desbordamiento.
- Salida determinista y verificable: en la evaluación publicada no se registran predicciones inválidas (0 sobre 240.458 filas).
- Integración con el ecosistema `laya` (versión 0.4.2) sobre PyTorch 2.12.1 y Transformers 5.19.0.
- No dispone de generación de texto libre, tool calling, capacidades de agente autónomo, visión ni audio según la información disponible.
- Multilingüismo: únicamente inglés declarado; no se documenta soporte de castellano ni de otras lenguas.

## Casos de uso

- Evaluación automatizada de encuestas financieras: el modelo recibe el enunciado y las opciones de un ítem CHFS/CGSS y emite la alternativa seleccionada, lo que permite puntuar baterías completas de forma reproducible sobre las 119 versiones de pregunta del subconjunto común.
- Preanotación de datasets de QA financiera: se usa como primer etiquetador sobre corpus de opción múltiple y el resultado se revisa por anotadores humanos; su tasa de predicciones inválidas nula (0/240.458) reduce el coste de limpieza posterior.
- Reproducción de investigación en simulación multiagente: se integra como componente de decisión dentro del proyecto `mas-simulation` para replicar experimentos agregados con un checkpoint fijo y comparable entre ejecuciones.
- Comparación de etapas de ajuste (ablations): al compartir arquitectura y datos con `laya-finance-matched-sft-50k`, permite medir el efecto marginal de un pase adicional sobre las mismas 50.000 filas usando exactitud y F1 macro por pregunta.
- Validación de consistencia en pipelines de captura de datos: sirve como segunda opinión automática frente a la respuesta registrada por el encuestador, señalando ítems potencialmente mal codificados para revisión manual.
- Motor de respuesta en asistentes de consulta financiera cerrada: en productos donde el usuario elige entre alternativas predefinidas (perfil de riesgo, producto elegible), el modelo selecciona la opción con una latencia de encoder de ~421 M de parámetros, apta para despliegue en CPU.
- Docencia y experimentación con modelos pequeños: sus 0,8 GB de pesos FP16 permiten ejecutar el pipeline completo en un portátil, lo que facilita prácticas sobre evaluación de QA y sesgo de clase en métricas macro.

## Benchmarks y rendimiento

Evaluación sobre etiquetas observadas en el subconjunto común congelado CHFS/CGSS de 240.458 filas y 119 versiones de pregunta (el split de test inglés completo del repositorio fuente tiene 418.597 filas; los denominadores no son comparables entre sí).

| Métrica | Resultado |
|---|---:|
| Exactitud (accuracy) | 0,729258332 |
| F1 macro por pregunta | 0,347840920 |
| Predicciones inválidas | 0 |

No se han publicado resultados de benchmarks en la información disponible para MMLU, HumanEval, GSM8K ni otras suites estándar. Los resultados de simulación financiera y los del sistema Fin-Laya histórico sobre datos completos se reportan por separado y no se incluyen en esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,85 GB solo para pesos en FP16 (421.293.830 parámetros × 2 bytes), más activaciones y buffers de atención que escalan con la longitud de entrada; el repositorio completo ocupa 0,8 GB.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente en la práctica (GTX 1650, RTX 3050/4060, RTX 4090, A100, H100); no se requiere hardware de centro de datos.
- Cabe holgadamente en GPU de consumo: sí, en toda la gama consumer moderna e incluso en iGPU con memoria compartida suficiente.
- CPU: viable; la model card muestra la carga del checkpoint bajo `torch.device("cpu")`.
- Opciones de despliegue: paquete nativo `laya==0.4.2` con PyTorch 2.12.1 y Transformers 5.19.0 mediante `laya.train.load_checkpoint`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, coherente con un encoder con cabeza de decisión y no con un modelo causal generativo.
- Latencia y throughput: no disponibles. Como referencia estructural, el coste dominante será la codificación de la pregunta más todas las opciones en cada ítem, no la decodificación autogenerativa.

## Comparativa con modelos similares

No se ha identificado en la información disponible ningún modelo público comparable de la misma categoría (encoder con cabeza de decisión para QA financiera de opción múltiple). La única referencia directa es el checkpoint del que parte esta etapa.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `laya-finance-matched-sft-rlcd-50k` | 421.293.830 | No disponible | Exactitud 0,7293; F1 macro 0,3478 (240.458 filas / 119 preguntas) | Apache-2.0 (datos con términos propios) | HuggingFace, 0 descargas, 0 likes |
| `ya9919/laya-finance-matched-sft-50k` (inicialización) | No disponible | No disponible | No disponible en esta información | Apache-2.0 según modelo base | HuggingFace |
| Otros modelos de QA financiera de tamaño similar | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Brecha marcada entre exactitud (0,7293) y F1 macro por pregunta (0,3478): indica un comportamiento favorable a clases mayoritarias y rendimiento desigual entre las 119 versiones de pregunta; conviene evaluar por subgrupo antes de usarlo en producción.
- Entrenamiento sobre solo 50.000 filas distintas reexplotadas en dos pases (100.000 exposiciones acumuladas): riesgo de sobreajuste al conjunto y de escasa generalización fuera del dominio CHFS/CGSS/CFPS/CLDS.
- Idioma único: inglés declarado; no hay evidencia de funcionamiento en castellano ni en otras lenguas.
- Ámbito restringido: no genera texto libre, no soporta tool calling ni razonamiento multiturno; cualquier uso fuera de la selección de opciones exige envolverlo con lógica externa.
- Riesgo de alucinación en sentido estricto bajo (la salida está restringida a las opciones dadas y no se registraron predicciones inválidas en la evaluación publicada), pero persiste el riesgo de seleccionar una opción incorrecta con alta confianza.
- Evaluación sobre un subconjunto común de 240.458 filas y 119 preguntas, no sobre el split de test completo de 418.597 filas: los números no son directamente comparables con los de otros checkpoints evaluados sobre denominadores distintos.
- Licencia del artefacto Apache-2.0, pero los datos de entrenamiento conservan los términos `chfs-cgss-cfps-clds-source-data-terms`; verificar esas condiciones antes de cualquier uso comercial o redistribución derivada.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validación independiente por parte de la comunidad.
- Dependencia de versiones concretas del stack (`laya==0.4.2`, PyTorch 2.12.1, Transformers 5.19.0); cambios de versión pueden romper la carga del checkpoint.
- El truncado silencioso está explícitamente desaconsejado: usar longitudes de entrada truncadas invalida la comparación con los resultados publicados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ya9919/laya-finance-matched-sft-rlcd-50k
- Checkpoint de inicialización: https://huggingface.co/ya9919/laya-finance-matched-sft-50k
- Repositorio de reproducción e evidencia agregada (`mas-simulation`): https://github.com/KataDavidXD/mas-simulation
