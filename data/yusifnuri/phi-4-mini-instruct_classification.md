# yusifnuri/phi-4-mini-instruct_classification

## Resumen

`yusifnuri/phi-4-mini-instruct_classification` es un adaptador LoRA de PEFT que especializa el modelo base `microsoft/Phi-4-mini-instruct` (3,80 B de parámetros) en una única tarea empresarial: asignar una noticia a una de cuatro categorías (World, Sports, Business, Sci/Tech). No es un modelo completo, sino un conjunto de pesos de adaptación de rango 16 sobre las proyecciones `q_proj`, `k_proj`, `v_proj` y `o_proj` del transformer original; para usarlo hay que cargar primero el modelo base y después los pesos LoRA.

El adaptador se desarrolló como artefacto verificable del trabajo de fin de máster *Fine-Tune or Pay Per Token? An Enterprise Benchmark of Small Language Models* (SRH University Hamburg), que compara modelos pequeños ajustados con APIs de proveedores frontera en precisión, latencia, coste, exposición de privacidad y volumen de rentabilidad. Su relevancia actual es doble: por un lado demuestra que un modelo de 3,80 B con ajuste LoRA puede alcanzar 0,92 de exactitud en una tarea de clasificación acotada a un coste marginal muy bajo; por otro, publica el arnés de evaluación y la matriz comparativa completa para que el resultado sea reproducible.

El repositorio se distribuye con licencia MIT, pero el corpus de entrenamiento (AG News) tiene una licencia propia limitada a uso de investigación, un matiz importante antes de llevarlo a producción. El modelo acumula 0 descargas y 0 «likes» en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only; arquitectura interna del modelo base no detallada en la model card |
| Parametros totales | No disponible para el adaptador; el modelo base declara 3,80 B de parámetros |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible para el modelo base; la longitud máxima de secuencia usada en el entrenamiento del adaptador fue de 512 tokens |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; la model card no documenta cuantizaciones del adaptador) |
| Idiomas soportados | No declarado; el corpus de entrenamiento (AG News) está en inglés |
| Licencia | MIT (el conjunto de datos AG News tiene licencia propia, uso de investigación) |
| Formato de pesos | Safetensors (adaptador LoRA de PEFT) |

## Arquitectura y entrenamiento

El adaptador aplica LoRA sobre `microsoft/Phi-4-mini-instruct`, un modelo denso de 3,80 B de parámetros. Los hiperparámetros del ajuste son: rango 16, alpha 32, dropout 0,05, módulos objetivo `q_proj`, `k_proj`, `v_proj` y `o_proj`, optimizador AdamW, tasa de aprendizaje 2e-4 con programación coseno y 3 % de warmup, 3 épocas, tamaño de lote efectivo 16 (4 x 4 de acumulación de gradiente) y semilla 42. El conjunto de entrenamiento es AG News (`fancyzhx/ag_news`) con 5.000 ejemplos, de los cuales 500 se reservaron para la selección de checkpoint. La longitud máxima de secuencia durante el entrenamiento fue de 512 tokens.

No se documenta en la información disponible ningún uso de RLHF, DPO u otra fase de alineación adicional, ni innovaciones técnicas propias más allá del propio ajuste LoRA. El autor indica explícitamente que los hiperparámetros se mantuvieron constantes en todas las celdas del benchmark (todos los modelos y tareas) en lugar de ajustarse por celda, por lo que las cifras publicadas deben interpretarse como una cota inferior conservadora del rendimiento alcanzable.

El adaptador espera un formato de prompt concreto en inferencia: `Classify the following news text into exactly one category (World / Sports / Business / Technology): {text}\nCategory:`. Usar otro formato degrada el resultado.

## Capacidades

- Clasificación de texto en cuatro categorías cerradas (World, Sports, Business, Sci/Tech) a partir de una noticia o titular.
- Clasificación de una sola etiqueta por documento, con una única pasada de inferencia.
- Ejecución sobre el modelo base `microsoft/Phi-4-mini-instruct`, heredando de este su tokenizador y su soporte de generación de texto conversacional.
- Inferencia de baja latencia en lote unitario (162 ms medidos en una NVIDIA H200).
- Coste marginal bajo: 5,60 USD por millón de tokens generados según la medición del autor.
- Reentrenamiento del adaptador para otras taxonomías de clasificación con datos propios, partiendo de los hiperparámetros publicados.
- No se declara soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo «thinking» en la model card del adaptador.

## Casos de uso

- Clasificación de titulares en agregadores de noticias: el adaptador asigna cada ítem a una de las cuatro categorías con una única pasada y una latencia media de 162 ms en lote unitario, suficiente para ingesta en tiempo real de flujos RSS.
- Etiquetado de corpus para entrenamiento posterior: a 5,60 USD por millón de tokens generados, el coste de anotar grandes volúmenes de noticias con cuatro etiquetas es acotado y verificable, lo que permite preetiquetar y reservar la revisión humana para los casos de baja confianza.
- Enrutado de contenido en pipelines de datos empresariales: una vez desplegado on-premise, el modelo dirige cada documento al repositorio o al equipo correspondiente sin enviar texto a APIs externas, lo que reduce la exposición de datos confidenciales.
- Sustitución de APIs de proveedor por coste fijo: el trabajo de fin de máster que origina el adaptador mide precisamente el volumen de peticiones a partir del cual el coste de GPU dedicada es inferior al pago por token; este adaptador sirve como caso de estudio reproducible de ese cálculo.
- Clasificación con requisitos de privacidad o soberanía del dato: al ejecutarse sobre un modelo de 3,80 B cuantizable en una GPU de gama alta de consumo, permite procesar noticias internas o documentos sensibles sin salida de red.
- Verificación independiente de un benchmark académico: el adaptador se publica para que terceros reproduzcan la cifra de 0,92 de exactitud con el arnés disponible en el repositorio del autor.
- Punto de partida para experimentos de PEFT: sirve como plantilla de configuración LoRA (rango, alpha, módulos objetivo, programación de tasa de aprendizaje) para equipos que quieran adaptar modelos pequeños a tareas de clasificación internas.
- Clasificación en entornos con GPU única: al ser un adaptador sobre un modelo de 3,80 B, cabe en GPUs de 12-24 GB, lo que permite desplegarlo en estaciones de trabajo sin clúster dedicado.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Exactitud (accuracy) | 0,92 |
| Latencia media, lote 1 | 162 ms |
| Coste por 1 M de tokens generados | 5,60 USD |
| Hardware de medición | 1 x NVIDIA H200 (141 GB), lote 1, utilización plena |
| Precio imputado de GPU | 3,99 USD por hora de GPU |
| Ejemplos de evaluación | 200 instancias reservadas (164 problemas en el caso de generación de código) |
| Fecha de evaluación | 5 de julio de 2026 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar para este adaptador. El propio autor advierte que las puntuaciones no son comparables entre tareas, porque cada tarea del benchmark usa su propia métrica, y que los corpus de evaluación son benchmarks públicos longevos potencialmente presentes en los datos de preentrenamiento del modelo base, lo que infla las puntuaciones absolutas.

Rendimiento derivado de los datos declarados: 3,99 USD/hora dividido entre 5,60 USD por millón de tokens implica aproximadamente 712.500 tokens generados por hora a plena utilización, es decir, unos 198 tokens por segundo. Es un valor calculado a partir de las cifras publicadas, no medido directamente por el autor.

## Requisitos de hardware

- El adaptador LoRA es de tamaño reducido (el repositorio figura como 0,0 GB redondeado), pero la inferencia requiere cargar el modelo base `microsoft/Phi-4-mini-instruct` de 3,80 B de parámetros.
- VRAM estimada para el modelo base: en bf16/fp16, en torno a 7,6 GB de pesos más caché KV y activaciones (aproximadamente 9-10 GB en la práctica con contexto de 512-4096 tokens); en cuantización de 8 bits, unos 4 GB; en 4 bits, unos 2,5-3 GB. Estas cifras son estimaciones a partir del tamaño declarado del modelo base, no mediciones publicadas.
- GPU recomendadas: NVIDIA H200 (la usada en la medición), A100 o H100 para despliegues con muchas peticiones concurrentes; RTX 4090 (24 GB) y RTX 4080 para servicio monousuario con margen amplio; RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070 para cuantización de 4-8 bits.
- Cabe en GPU de consumo: sí, en cualquier tarjeta con 8 GB o más si se cuantiza el modelo base; con 12-16 GB funciona sin cuantizar o con contexto amplio.
- Opciones de despliegue: vLLM y TGI admiten adaptadores LoRA sobre el modelo base sin fusionar pesos; también es posible fusionar el adaptador con `merge_and_unload()` y convertir el resultado a GGUF para llama.cpp u Ollama, o exportarlo a otros runtimes que no soporten PEFT.
- Latencia y throughput: 162 ms por petición en lote 1 sobre H200 según el autor; el throughput derivado del coste declarado es de unos 198 tokens/s a plena utilización en ese mismo hardware. No hay mediciones publicadas en GPUs de consumo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Tipo | Exactitud en la tarea |
|---|---|---|---|---|---|
| yusifnuri/phi-4-mini-instruct_classification | 3,80 B (base) + adaptador LoRA | 512 tokens en entrenamiento | MIT (adaptador); dataset con licencia de uso de investigación | Adaptador PEFT especializado en 4 clases | 0,92 |
| microsoft/Phi-4-mini-instruct (base sin adaptar) | 3,80 B | No disponible en la información proporcionada | MIT | Modelo generalista de generación de texto | No disponible |
| Otros modelos pequeños del benchmark del autor (por ejemplo alternativas tipo Qwen, Llama o Gemma del mismo rango) | No disponible | No disponible | No disponible | Modelos generalistas evaluados en la misma matriz | No disponible (la matriz completa está en el repositorio del autor) |
| Clasificadores encoder tipo BERT/RoBERTa ajustados sobre AG News | No disponible | No disponible | No disponible | Clasificador dedicado | No disponible |

La única comparación cuantitativa publicada en la información disponible es la del propio adaptador frente a sí mismo y frente a las APIs de proveedores frontera descritas en la tesis, cuyos valores no se incluyen en la model card. Para una comparación completa hay que consultar `results/benchmark_matrix.csv` en el repositorio del autor.

## Limitaciones y advertencias

- Entrenado una sola vez y con una única semilla (42); las diferencias reportadas frente a otros modelos confunden calidad del modelo con varianza de inicialización, tal como advierte el propio autor.
- Está especializado en una única tarea sobre un único corpus público. No es un asistente de propósito general y no debe tratarse como tal.
- Los corpus de evaluación son benchmarks públicos de larga trayectoria, plausibles en los datos de preentrenamiento del modelo base, lo que infla las puntuaciones absolutas.
- La evaluación usó 200 instancias reservadas, por lo que el tamaño de efecto detectable está acotado en torno a diez puntos porcentuales.
- Depende de un formato de prompt exacto; desviarse de él degrada la clasificación.
- El conjunto de datos AG News tiene licencia propia limitada a uso de investigación, lo que puede condicionar el uso comercial del adaptador aunque su licencia sea MIT.
- No se declaran idiomas soportados; el corpus de entrenamiento es en inglés, por lo que el comportamiento en castellano u otras lenguas no está caracterizado.
- No hay datos publicados sobre sesgos, tasas de alucinación en texto libre ni comportamiento fuera de las cuatro categorías previstas.
- El modelo puede devolver una categoría aunque el texto no corresponda a ninguna de las cuatro; no se documenta mecanismo de abstención.
- Las mediciones de latencia y coste proceden de una única GPU (H200) a plena utilización y excluyen el tránsito de red, por lo que no son extrapolables directamente a otros entornos.
- El repositorio no registra descargas ni interacciones, por lo que no existe validación comunitaria independiente más allá del propio autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yusifnuri/phi-4-mini-instruct_classification
- Modelo base: https://huggingface.co/microsoft/Phi-4-mini-instruct
- Conjunto de datos de entrenamiento: https://huggingface.co/datasets/fancyzhx/ag_news
- Código, configuraciones y arnés de evaluación: https://github.com/Yusifnuri/slm-benchmark
- Matriz completa del benchmark: https://github.com/Yusifnuri/slm-benchmark/blob/main/results/benchmark_matrix.csv
- Análisis de coste por petición: https://github.com/Yusifnuri/slm-benchmark/blob/main/results/cost_per_request.csv
- Búsqueda web: no se han encontrado resultados relevantes sobre este modelo; las coincidencias devueltas por el buscador corresponden a páginas sin relación con el modelo ni con el benchmark. No hay paper, blog ni demo adicionales disponibles.
