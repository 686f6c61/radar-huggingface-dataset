# uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft5600-grpo2640-lora

## Resumen

El modelo `uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft5600-grpo2640-lora` es un adaptador LoRA publicado por el desarrollador uygarkurt sobre el modelo base Qwen2.5-0.5B-Instruct. No es un modelo completo, sino un conjunto de pesos de adaptación (PEFT) que debe cargarse sobre el checkpoint original de Qwen. Su objetivo concreto es el tool calling estructurado: generar llamadas a funciones en formato correcto y, cuando ninguna de las herramientas ofrecidas es pertinente, abstenerse de invocarlas.

El entrenamiento es en dos fases sobre el dataset mixto `uygarkurt/xlam-tool-calling-mixed`: primero 5.600 actualizaciones de supervisión (SFT) y después 2.640 actualizaciones de Group Relative Policy Optimization (GRPO), partiendo del adaptador SFT previo del mismo autor. El resultado es un adaptador de muy bajo coste computacional (2,4 horas de entrenamiento en total) pensado para entornos con restricciones de memoria, como agentes locales, enrutadores de funciones o sistemas embebidos.

Su relevancia es doble: por un lado, demuestra un flujo completo de post-entrenamiento (SFT + RL) sobre un modelo de 0,5B; por otro, hace pública la comparativa entre el adaptador SFT y el adaptador tras GRPO, donde la mejora se concentra en la precisión de llamadas y, sobre todo, en la detección de irrelevancia (de 49,46% a 56,51%). A cambio, el modelo arrastra las limitaciones de capacidad de su base: MMLU por debajo del 40% y MATH-500 en el 17%.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del base Qwen2.5-0.5B-Instruct); el repositorio contiene un adaptador LoRA, no un modelo completo |
| Parámetros totales | Adaptador LoRA: no disponible (rango y módulos objetivo no especificados). Modelo base: 0,5B (aproximadamente 0,49B) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base Qwen2.5-0.5B-Instruct; no se documenta modificación) |
| Tipos de cuantización | No disponible para el adaptador. Los pesos se publican como adaptador PEFT en safetensors sin cuantizar; no hay versiones GGUF, AWQ ni GPTQ publicadas en este repositorio |
| Idiomas soportados | Inglés (`en`) |
| Licencia | No disponible (la model card no declara licencia para el adaptador) |
| Formato de pesos | safetensors (adaptador LoRA compatible con PEFT/transformers) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-0.5B-Instruct, un transformer decoder-only de 0,5B parámetros del linaje Qwen2.5. Este repositorio no incluye los pesos completos: contiene únicamente las matrices de bajo rango (LoRA) que se inyectan en las capas del base. La model card no especifica el rango, el alpha, los módulos objetivo ni el dropout del adaptador.

El entrenamiento se realizó con el framework Post-Training Lab del propio autor sobre el dataset mixto de tool calling `uygarkurt/xlam-tool-calling-mixed`. La primera fase consistió en 5.600 actualizaciones de SFT (0,9 horas), dando lugar al adaptador `Qwen2.5-0.5B-Instruct-xlam-mixed-sft5600-lora`. La segunda fase continuó ese adaptador con 2.640 actualizaciones de GRPO (1,5 horas), una técnica de optimización por política relativa a un grupo que no requiere un modelo de recompensa separado. El objetivo declarado del entrenamiento es doble: emitir llamadas a herramientas estructuradas correctamente y abstenerse cuando las herramientas ofrecidas no son relevantes. Los tiempos indicados corresponden solo al bucle de entrenamiento, excluyendo carga del modelo, preparación de datos y evaluación externa.

## Capacidades

- Generación de llamadas a funciones en formato estructurado (tool calling / function calling) en una sola vuelta, con nombres de función y argumentos.
- Abstención ante herramientas irrelevantes: el modelo está entrenado explícitamente para no invocar ninguna función cuando el conjunto de herramientas ofrecido no responde a la petición.
- Generación de texto conversacional y respuesta a instrucciones, heredadas del modelo base Instruct.
- Razonamiento aritmético y matemático básico, limitado por el tamaño del base (MATH-500 en el 17%).
- Capacidad multilingüe limitada al inglés declarado; no se documentan otros idiomas.
- No se documentan capacidades de visión, audio, modo thinking explícito ni soporte de agentes multi-paso más allá de la selección de herramienta en una única vuelta.

## Casos de uso

- Enrutamiento de funciones en asistentes locales: dado un conjunto de 5-20 herramientas, el adaptador selecciona la función y extrae los argumentos en una sola pasada. Su tamaño de 0,5B permite ejecutarlo en el mismo dispositivo que el resto del agente sin competir por VRAM.
- Filtro de abstención previo a un modelo mayor: se usa como primera etapa que decide si merece la pena invocar una herramienta o escalar la petición a un modelo de mayor capacidad. La puntuación de irrelevancia (56,51% en el subconjunto evaluado) marca el margen de mejora disponible.
- Despliegue en dispositivos con recursos muy limitados (Raspberry Pi, mini-PC, navegador vía WebGPU tras fusionar el adaptador y convertirlo a GGUF): el modelo completo en 4 bits ocupa del orden de 0,4-0,5 GB.
- Prototipado rápido de pipelines de tool calling: al ser un adaptador LoRA, se puede cargar y descargar sobre el base en segundos, lo que facilita comparar variantes de prompt y esquemas de herramientas.
- Evaluación y regresión en CI: sirve como caso de referencia barato para validar un arnés de evaluación de function calling (xLAM ETC/FNA, BFCL) antes de aplicar el mismo arnés a modelos de mayor tamaño.
- Clasificación de intención con salida estructurada: reutilizando el formato de llamada a función como esquema de salida, se puede emplear para etiquetar consultas o extraer campos en formularios.
- Docencia y experimentación en post-entrenamiento: el repositorio documenta la comparación SFT frente a SFT+GRPO con tiempos y puntuaciones, lo que lo convierte en un ejemplo reproducible de RL aplicado a un modelo pequeño.

## Benchmarks y rendimiento

Datos publicados en la model card. Todas las puntuaciones son porcentajes. La primera fila corresponde al adaptador SFT que inicializó el GRPO; la segunda, al adaptador final de este repositorio.

| Checkpoint | Paso | MMLU | MATH-500 | IFEval | xLAM ETC | xLAM FNA | BFCL single-turn FC | Relevance | Irrelevance | Tiempo (h) |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Adaptador SFT inicial | SFT 5.600 | 39,42% | 18,00% | 31,24% | 77,61% | 97,46% | 53,04% | 83,33% | 49,46% | 0,9 |
| SFT + GRPO (este adaptador) | GRPO 2.640 | 38,97% | 17,00% | 31,05% | 79,23% | 97,46% | 56,06% | 83,33% | 56,51% | 2,4 |

Notas metodológicas aportadas por el autor: xLAM ETC es exactitud exacta de la llamada a herramienta y xLAM FNA es exactitud del nombre de la función; ambas se calculan sobre el holdout de solo llamadas (2.287 ejemplos evaluados, 700 omitidos), no sobre el split de test del dataset mixto. BFCL single-turn FC agrega subconjuntos seleccionados de BFCL-v3 de una sola vuelta; Relevance e Irrelevance corresponden a los subconjuntos de relevancia seleccionados. IFEval usa exactitud estricta a nivel de prompt. Las evaluaciones xLAM se hicieron con scripts propios de Post-Training Lab.

Observaciones derivadas de la tabla: el GRPO mejora la exactitud exacta de llamada (+1,62 puntos), la precisión de function calling de BFCL (+3,02 puntos) y la detección de irrelevancia (+7,05 puntos), mientras que retroceden ligeramente MMLU (-0,45), MATH-500 (-1,00) e IFEval (-0,19). La exactitud del nombre de función permanece idéntica (97,46%).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,0-1,2 GB en FP16/BF16 sumando el base de 0,5B y el adaptador; alrededor de 0,4-0,5 GB en cuantización de 4 bits. El adaptador en sí ocupa del orden de decenas de MB (tamaño exacto no disponible; el repositorio declara 0,0 GB).
- Memoria para contexto largo: con 32.768 tokens de contexto la caché KV y las activaciones elevan el consumo por encima del peso de los parámetros; no se han publicado mediciones de memoria para este adaptador.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más (RTX 3050/3060/4060, GTX 1660, etc.). Para lotes grandes o contexto completo, una RTX 4090 o una A100/H100 quedan sobredimensionadas para un modelo de este tamaño; el cuello de botella será la latencia del host, no la GPU.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPU dedicadas e integradas modernas, y también en CPU. La ejecución en CPU es viable tras fusionar el adaptador y convertir a GGUF.
- Opciones de despliegue: `transformers` + `peft` (ruta natural, cargando el adaptador sobre Qwen2.5-0.5B-Instruct); vLLM con soporte LoRA (`--enable-lora`); TGI con adaptadores; llama.cpp u Ollama únicamente tras fusionar el adaptador con el base (`merge_and_unload`) y convertir los pesos a GGUF, ya que estos motores no consumen adaptadores PEFT directamente.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (SFT + GRPO sobre Qwen2.5-0.5B-Instruct) | 0,5B (adaptador LoRA) | 32.768 tokens (heredado) | Tool calling con abstención | No disponible | HuggingFace, 0 descargas |
| Qwen2.5-0.5B-Instruct (base) | 0,5B | 32.768 tokens | Instrucciones generales, sin entrenamiento específico de tool calling | Apache 2.0 según su model card | HuggingFace, ampliamente adoptado |
| Adaptador SFT previo del mismo autor | 0,5B (adaptador LoRA) | 32.768 tokens (heredado) | Tool calling, sin fase RL | No disponible | HuggingFace |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 tokens | Instrucciones generales, mayor capacidad | Apache 2.0 según su model card | HuggingFace |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que la comparación de rendimiento se limita a las dos filas del adaptador evaluadas en la sección anterior. Las puntuaciones de BFCL single-turn FC y de relevancia no son directamente comparables con agregados publicados por terceros, ya que el autor indica que son agregados específicos de su estudio.

## Limitaciones y advertencias

- Capacidad general muy limitada: MMLU 38,97%, MATH-500 17,00% e IFEval 31,05% sitúan al modelo por debajo de alternativas de mayor tamaño en tareas que no sean tool calling. No es adecuado como asistente generalista.
- Abstención incompleta: con una puntuación de irrelevancia del 56,51%, en torno al 43% de los casos de herramientas no pertinentes siguen gestionándose de forma incorrecta según el subconjunto evaluado. En producción conviene validar la salida con un esquema y un guardarraíl externos.
- Riesgo de alucinación: el modelo base es de 0,5B y el adaptador no corrige esa limitación. Puede inventar nombres de función o argumentos; la exactitud del nombre de función es del 97,46%, pero la exactitud exacta de la llamada cae al 79,23%.
- Idiomas: solo se declara inglés. No hay evidencia de funcionamiento fiable en castellano ni en otros idiomas.
- Licencia: la model card no declara licencia para el adaptador, lo que impide confirmar si se permite uso comercial. El modelo base Qwen2.5-0.5B-Instruct se distribuye bajo Apache 2.0 según su propia model card, pero esa licencia no cubre automáticamente los pesos derivados.
- Dependencia del base: los pesos no son autónomos; requieren descargar y cargar Qwen2.5-0.5B-Instruct y respetar su licencia y sus condiciones de uso.
- Sesgos: no se han publicado evaluaciones de sesgo, toxicidad ni seguridad para este adaptador. El dataset de entrenamiento es sintético y específico de tool calling, por lo que no cabe esperar mitigación de sesgos del base.
- Madurez: repositorio creado recientemente, 0 descargas y 0 likes; sin issues ni validación independiente. El tamaño declarado del repositorio (0,0 GB) sugiere que conviene verificar la integridad de los ficheros antes de usarlo.
- Evaluaciones no estándar: los agregados de BFCL y de relevancia son específicos del estudio del autor y no equivalen a los informes oficiales de BFCL-v3, por lo que no deben compararse directamente con cifras de terceros.
- Sin datos de latencia ni throughput publicados; cualquier estimación de coste en producción debe medirse en el entorno objetivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft5600-grpo2640-lora
- Adaptador SFT previo (punto de partida del GRPO): https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft5600-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/uygarkurt/xlam-tool-calling-mixed
- Repositorio de código Post-Training Lab: https://github.com/uygarkurt/post-training-lab
