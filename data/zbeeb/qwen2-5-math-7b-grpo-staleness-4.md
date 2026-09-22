# zbeeb/Qwen2.5-Math-7B-GRPO-Staleness-4

## Resumen

Qwen2.5-Math-7B-GRPO-Staleness-4 es un ajuste fino de parametros completos del modelo Qwen/Qwen2.5-Math-7B, publicado por el usuario zbeeb. El checkpoint corresponde al paso 1.000 de un entrenamiento de aprendizaje por refuerzo con GRPO (Group Relative Policy Optimization) sobre el dataset DAPO de matematicas de 17.005 filas. Su particularidad experimental es el uso de una cota de staleness de 4 (`max_off_policy_steps`), que limita la antiguedad de la politica de rollout durante el entrenamiento, no la longitud de decodificacion.

El modelo conserva la arquitectura del base: un transformer decoder-only de tipo Qwen2 con 7.615.616.512 parametros (unos 7,6 mil millones), pesos exportados sin perdida a Safetensors por shards y tokenizer original intacto. El entrenamiento utilizo PrimeRL v0.9.0 con 1.000 actualizaciones, batch de 64, tamano de grupo 8, semilla 42, AdamW con learning rate 1e-6, 30 pasos de warmup, clip PPO de 0,2 y sin penalizacion KL de referencia. El contexto total de entrenamiento fue de 4.096 tokens, con hasta 3.072 tokens de completacion.

Es relevante ahora como artefacto de investigacion sobre estabilidad y desviacion de politica en RL para razonamiento matematico: publica el historial de recuperacion del entrenamiento (el segmento original uso 4 GPU de entrenamiento y 1 de inferencia, y desde el paso 850 se recupero con 8 GPU de entrenamiento), el manifiesto de exportacion y los resultados de evaluacion del propio run. No es un artefacto validado por la comunidad: el repositorio registra 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2); configuracion posicional nativa del modelo base conservada |
| Parametros totales | 7.615.616.512 (~7,6 mil millones) |
| Longitud de contexto | No disponible como dato declarado; el entrenamiento uso 4.096 tokens de contexto total (hasta 3.072 de completacion). El autor no reclama ningun resultado a 8K |
| Tipos de cuantizacion | No disponible; no se publican variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache-2.0 (se incluye sin cambios la licencia del modelo base) |
| Formato de pesos | Safetensors por shards, exportados en el dtype de guardado sin perdida (tamano de repositorio: 30,5 GB); el ejemplo de uso carga en bfloat16 |
| Tamano del repositorio | 30,5 GB |
| Modelo base | Qwen/Qwen2.5-Math-7B (relacion: finetune, revision b101308fe89651ea5ce025f25317fea6fc07e96e) |
| Dataset de entrenamiento | zbeeb/Staleness-GRPO-DAPO-Math-17k (17.005 filas) |
| Licencia de uso comercial | Permitida por Apache-2.0, sujeta a la licencia del modelo base |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen2.5-Math-7B, un transformer decoder-only de aproximadamente 7,6 mil millones de parametros. No hay modificaciones estructurales declaradas: el autor indica que la configuracion posicional nativa se conserva y que ni los pesos ni el tokenizer se alteran por la configuracion de parada. La exportacion se hizo a Safetensors por shards con verificaciones de procedencia del paso 1.000, tensores finitos, recarga estricta, embeddings atados (tied embeddings), ida y vuelta del tokenizer y logits de sonda identicos en CPU antes y despues de la serializacion. El estado del optimizador permanece en el checkpoint original y no se distribuye.

El entrenamiento es un GRPO de parametros completos ejecutado con PrimeRL v0.9.0 sobre el dataset DAPO de matematicas (17.005 filas), con 1.000 actualizaciones, batch de 64, tamano de grupo 8, semilla 42, AdamW con learning rate 1e-6, 30 actualizaciones de warmup, clip PPO de 0,2 y sin penalizacion KL respecto a una referencia. La recompensa es determinista y puntua la equivalencia matematica de la respuesta terminal, no la forma del razonamiento. La innovacion declarada es la cota de staleness de 4: el entrenamiento limita la edad de la politica de rollout, lo que en la practica restringe cuantas actualizaciones puede quedar desfasada una muestra antes de descartarse. El autor advierte que la topologia de GPU varia entre brazos experimentales, de modo que las comparaciones no son ablaciones puras de staleness.

La trayectoria de entrenamiento es una recuperacion, no una continuacion bit a bit: el job final (2142283, en deep-chungus-3) reanudo modelo, optimizador, scheduler y estado de progreso desde el paso 925 y alcanzo el paso 1.000 con salida 0:0. La auditoria de historial combina la traza padre y la de recuperacion para los pasos 1 a 1.000 y excluye un registro de metricas malformado fijado por checksum. El autor advierte ademas que los runs con cotas de staleness superiores no son continuaciones de los de cota inferior, ya que cada uno parte del modelo base con estado de optimizador nuevo.

## Capacidades

- Generacion de texto y razonamiento matematico paso a paso, con formato de respuesta final en `\boxed{...}` o en una linea `Final answer: ...`.
- Resolucion de problemas de competicion: aritmetica, algebra, teoria de numeros, geometria y problemas de tipo olimpiada, segun los conjuntos de evaluacion empleados (MATH500, AMC, AIME, Minerva, OlympiadBench).
- Formato conversacional mediante plantilla de chat de Qwen (`apply_chat_template` con `add_generation_prompt`).
- Compatibilidad declarada con Hugging Face Transformers y con text-generation-inference; la etiqueta `endpoints_compatible` indica que puede servirse en Inference Endpoints.
- Parada explicita configurada para dos IDs de fin de secuencia: `<|im_end|>` (151645), identificado como EOS por el tokenizer de entrenamiento, y `<|endoftext|>` (151643).
- Capacidades multilingues limitadas a ingles y chino.
- Tool calling / function calling: no disponible; no se documenta soporte.
- Uso agentico o razonamiento multi-paso con herramientas: no disponible; no se documenta.
- Vision, audio o modo de pensamiento explicito: no disponible; no se documentan.

## Casos de uso

- Evaluacion de tecnicas de RL para matematicas: el checkpoint sirve como referencia reproducible de un GRPO con cota de staleness 4, con configuracion de entrenamiento publicada (`training-config.json`) y resultados por conjunto de evaluacion, lo que permite comparar contra otros brazos de staleness.
- Generacion de soluciones matematicas con razonamiento visible: util en entornos educativos o de autoaprendizaje donde se necesita la traza de razonamiento ademas de la respuesta final, forzando el cierre en `\boxed{}`.
- Verificacion y sintesis de problemas: se puede usar para producir problemas de nivel competicion y soluciones de referencia, con la salvedad de que no hay garantia de correccion y se recomienda verificacion simbolica externa.
- Tuberia de generacion de datos sinteticos de matematicas: dado su formato de salida controlado y su contexto de hasta 3.072 tokens de completacion, encaja en pipelines que necesitan cadenas de razonamiento etiquetadas para posterior filtrado por verificador.
- Investigacion sobre desviacion de politica (off-policy): el modelo permite estudiar el efecto de la cota de staleness en la calidad final, ya que el autor publica el manifiesto de exportacion y la verificacion de finalizacion del job.
- Asistencia en chino e ingles para tareas STEM: puede responder consultas tecnicas en ambos idiomas, lo que resulta util en entornos bilingues de investigacion.
- Analisis de robustez y truncamiento: los porcentajes de truncamiento publicados (hasta 14,58 % en AIME 2025 con muestreo) permiten estudiar el impacto de la longitud de generacion en la precision final.
- Prototipado con Transformers en una sola GPU: al ser un modelo denso de 7,6 B en Safetensors estandar, sirve para probar configuraciones de decodificacion greedy frente a muestreada sin infraestructura especial.

## Benchmarks y rendimiento

Resultados publicados por el autor, correspondientes a la politica final del paso 1.000 durante el run de entrenamiento. Las filas "pass1" usan una completacion por pregunta en modo greedy; las filas "sampled" usan ocho completaciones por pregunta con temperatura 0,6 y reportan precision media de respuesta, no pass@8. MATH500, AMC y AIME emplean 3.072 tokens de salida; Minerva y OlympiadBench, 2.048. Los nueve conjuntos finales registran cero errores de evaluacion.

| Benchmark | Completaciones | Precision | Truncados |
|---|---:|---:|---:|
| aime24-pass1 | 30 | 30,00 % | 10,00 % |
| aime24-sampled | 240 | 24,17 % | 12,08 % |
| aime25-pass1 | 30 | 16,67 % | 13,33 % |
| aime25-sampled | 240 | 11,67 % | 14,58 % |
| aime26-sampled | 240 | 13,75 % | 9,58 % |
| amc23-pass1 | 40 | 57,50 % | 5,00 % |
| math500-pass1 | 500 | 74,60 % | 1,80 % |
| minerva-pass1 | 272 | 26,84 % | 1,10 % |
| olympiadbench-pass1 | 675 | 38,52 % | 7,26 % |

Advertencias del propio autor sobre estos numeros: son resultados del run de entrenamiento, no un benchmark nuevo del artefacto exportado ni una comparacion a 8K; el conjunto de entrenamiento se filtro contra estas evaluaciones, lo que no descarta contaminacion procedente del preentrenamiento ni duplicados cercanos.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 15,3 GB solo para pesos (7,616 mil millones de parametros a 2 bytes), mas cache KV y activaciones. Es una estimacion aritmetica, no un dato publicado.
- VRAM estimada en el dtype de guardado completo: el repositorio ocupa 30,5 GB, coherente con un almacenamiento de mayor precision que bfloat16; en ese formato no cabe en GPU de consumo.
- Cuantizacion a 8 bits: del orden de 8 GB de pesos (estimacion). A 4 bits: del orden de 4-5 GB (estimacion). El autor no publica variantes cuantizadas, por lo que habria que generarlas.
- GPU recomendadas: no hay recomendaciones oficiales. Por tamano, una A100 40/80 GB o H100 permiten bfloat16 con contexto amplio y lotes mayores; una RTX 4090 (24 GB) es suficiente para bfloat16 con contexto moderado; una RTX 3090 (24 GB) queda en el mismo orden.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB en bfloat16 con gestion cuidadosa del contexto, y con holgura si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: el autor documenta Transformers y el ejemplo de uso con `AutoModelForCausalLM` y `device_map="auto"`. Las etiquetas del repositorio incluyen text-generation-inference y endpoints_compatible. No se documentan ni verifican en la informacion disponible instrucciones especificas para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible; no se publican mediciones.
- Nota de integracion: si el motor de servicio ignora `generation_config.json`, hay que fijar explicitamente los IDs de parada 151645 y 151643.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto declarado | Licencia | Disponibilidad | Datos de benchmark en esta informacion |
|---|---|---|---|---|---|
| Qwen2.5-Math-7B-GRPO-Staleness-4 | 7.615.616.512 | No disponible (entrenado a 4.096) | Apache-2.0 | Safetensors por shards, 30,5 GB | Tabla de 9 conjuntos matematicos del run de entrenamiento |
| Qwen/Qwen2.5-Math-7B (modelo base) | No disponible en esta informacion | No disponible | Apache-2.0 (heredada) | Pesos publicos en HuggingFace | No disponible |
| Otros ajustes GRPO sobre Qwen2.5-Math-7B con cotas de staleness distintas | No disponible | No disponible | Apache-2.0 | Referenciados por el autor como brazos del mismo estudio, sin detalle de repositorio | No disponible; el autor advierte que las comparaciones no son ablaciones puras de staleness |

No se dispone de resultados de benchmarks de los modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa de rendimiento entre alternativas.

## Limitaciones y advertencias

- Riesgo de alucinacion: el modelo esta optimizado para producir una respuesta final que coincida con la del verificador, no para garantizar la validez del razonamiento intermedio; las trazas pueden contener pasos incorrectos que conduzcan a la respuesta correcta o a una incorrecta con apariencia plausible.
- Sesgos conocidos: no disponible; el autor no documenta analisis de sesgos.
- Dominio estrecho: el ajuste se realiza sobre un unico dataset de matematicas de 17.005 filas, lo que puede degradar capacidades generales respecto al base y concentra el rendimiento en tareas de tipo competicion.
- Idiomas: solo ingles y chino. No hay soporte declarado de castellano ni de otros idiomas.
- Contaminacion: el autor indica que los datos de entrenamiento se filtraron contra los conjuntos de evaluacion, pero advierte que esto no establece la ausencia de contaminacion por preentrenamiento ni de duplicados cercanos.
- Resultados no validados de forma independiente: las cifras proceden del run de entrenamiento sobre la politica final, no de una evaluacion fresca del artefacto Safetensors exportado. El autor no reclama resultados a 8K.
- Truncamiento relevante: entre el 9,58 % y el 14,58 % de las respuestas de AIME se truncan incluso con 3.072 tokens de salida, lo que sugiere que el modelo necesita cadenas largas y puede agotar el presupuesto en problemas dificiles.
- Trazabilidad del entrenamiento: la trayectoria incluye una recuperacion desde el paso 925 tras un cambio de topologia de GPU; no es una continuacion bit a bit, aunque el autor declara superadas las auditorias de historial y de finalizacion.
- Licencia: Apache-2.0 permite uso comercial, pero debe conservarse la licencia del modelo base tal como se incluye en el repositorio; no hay clausulas adicionales ni restricciones especificas declaradas por el autor.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin validacion por terceros.
- Ausencia de cuantizaciones oficiales: no hay GGUF ni formatos de cuantizacion publicados, lo que obliga a generarlos si se quiere desplegar en hardware limitado.
- Servido: es imprescindible configurar los IDs de parada 151645 y 151643 si el motor ignora `generation_config.json`, en caso contrario la generacion puede no terminar correctamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zbeeb/Qwen2.5-Math-7B-GRPO-Staleness-4
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Math-7B/tree/b101308fe89651ea5ce025f25317fea6fc07e96e
- Dataset de entrenamiento: https://huggingface.co/datasets/zbeeb/Staleness-GRPO-DAPO-Math-17k
- Configuracion de entrenamiento: training-config.json (en el repositorio del modelo)
- Manifiesto de exportacion: export-manifest.json (en el repositorio del modelo)
- Resultados de evaluacion: evaluation-results.json (en el repositorio del modelo)
- Verificacion de finalizacion: completion-verification.json (en el repositorio del modelo)
- Licencia: LICENSE (en el repositorio del modelo)
- Busqueda web: no se han encontrado enlaces relevantes al modelo, al paper o a recursos asociados; los resultados devueltos corresponden a servicios de television ajenos a la consulta.
