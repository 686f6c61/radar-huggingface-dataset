# uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft2800-grpo4620-lora

## Resumen

`uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft2800-grpo4620-lora` es un adaptador LoRA de 0,5 mil millones de parámetros construido sobre `Qwen/Qwen2.5-0.5B-Instruct`, orientado especificamente a *tool calling* estructurado. Lo desarrolla el usuario uygarkurt dentro de su proyecto Post-Training Lab, y su proposito es doble: generar llamadas a funciones en formato estructurado y abstenerse de invocar herramientas cuando las ofrecidas no son relevantes para la consulta (capacidad de *abstention*).

El interes del modelo no reside en su tamaño, sino en la receta de entrenamiento: un SFT de 2.800 actualizaciones seguido de 4.620 actualizaciones de GRPO (Group Relative Policy Optimization) sobre el dataset mixto `uygarkurt/xlam-tool-calling-mixed`. Es decir, se aplica aprendizaje por refuerzo con recompensas verificables sobre un modelo de 0,5B, un regimen poco habitual a esta escala y relevante para quienes investigan post-entrenamiento barato.

Los resultados publicados muestran la tesis del experimento: el GRPO mejora la exactitud de llamada (xLAM ETC del 73,72% al 76,17%), la accuracy de nombre de funcion (95,89% a 96,20%), el BFCL single-turn (51,76% a 55,17%) y, sobre todo, la deteccion de irrelevancia (58,83% a 59,98%), a costa de una ligera caida en MMLU (39,80% a 39,48%) y MATH-500 (18,40% a 17,60%). Es un adaptador, no un modelo completo: requiere cargar el base Qwen2.5-0.5B-Instruct.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen2.5-0.5B-Instruct) con adaptador LoRA/PEFT |
| Parametros totales | 0,5B en el modelo base; el repositorio contiene solo los pesos del adaptador LoRA (tamano de repo 0.0 GB segun HuggingFace) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el modelo base Qwen2.5-0.5B-Instruct declara 32.768 tokens en su propia model card |
| Tipos de cuantizacion | no disponible para el adaptador; el base admite los formatos habituales de la familia Qwen2.5 (GGUF, AWQ, GPTQ) a traves de terceros |
| Idiomas soportados | en (ingles; unico idioma declarado en la model card) |
| Licencia | no disponible en la informacion proporcionada (el modelo base Qwen2.5-0.5B-Instruct se publica bajo Apache 2.0 segun su propia model card, dato no incluido en la informacion recibida) |
| Formato de pesos | safetensors (adaptador LoRA para PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-0.5B-Instruct, un transformer decoder-only denso de la familia Qwen2.5, con atención causal estándar y RoPE. El repositorio no introduce cambios arquitectónicos: es un LoRA que modifica los pesos del base para especializarlo en generación de llamadas a herramientas. La model card no detalla el rango, el alpha ni los módulos objetivo del adaptador, por lo que esos hiperparámetros se consideran no disponibles.

El entrenamiento se realizó con Post-Training Lab en dos fases sobre el dataset `uygarkurt/xlam-tool-calling-mixed`: primero 2.800 actualizaciones de SFT (0,4 horas de bucle de entrenamiento) y después 4.620 actualizaciones de GRPO partiendo de ese adaptador SFT (2,6 horas), con un total de 3 horas de cómputo de bucle, excluyendo carga de modelo, preparación de datos y evaluación externa. No se especifican el número de tokens vistos, la composición exacta del dataset, la función de recompensa del GRPO ni si hubo DPO o RLHF adicional. La innovación destacable es metodológica: aplicar GRPO sobre un modelo de 0,5B para enseñar explícitamente la abstención ante herramientas irrelevantes, una comportación difícil de obtener solo con SFT.

## Capacidades

- Generación de texto conversacional en inglés, heredada del base Qwen2.5-0.5B-Instruct.
- Tool calling / function calling estructurado: emisión de llamadas con nombre de función y argumentos, evaluado con los conjuntos xLAM ETC y FNA.
- Abstención ante herramientas irrelevantes: el modelo puede decidir no invocar ninguna función cuando el conjunto ofrecido no cubre la consulta (subconjunto *Irrelevance* del BFCL).
- Razonamiento de un solo turno en selección de función (BFCL-v3 single-turn function calling, subconjuntos seleccionados).
- Seguimiento de instrucciones a nivel básico: 31,98% de precisión estricta prompt-level en IFEval tras el GRPO.
- Razonamiento matemático limitado: 17,60% en MATH-500, insuficiente para uso productivo en matemáticas.
- Capacidades multilingües: no disponibles; solo se declara inglés.
- No se declaran capacidades de visión, audio, agentes multi-paso, modo *thinking* ni decodificación especulativa.

## Casos de uso

- Enrutado de funciones en asistentes ligeros: dado un catálogo de APIs y una consulta del usuario, el adaptador genera la llamada JSON con nombre y argumentos, con 76,17% de exactitud de llamada en el holdout xLAM (2.287 ejemplos evaluados). Adecuado cuando el catálogo es pequeño y estable.
- Filtro de abstención en pipelines RAG o de agentes: el modelo decide si ninguna herramienta del catálogo aplica, evitando invocaciones espurias; su subconjunto de irrelevancia ronda el 60%, por lo que conviene usarlo como primera etapa con validación posterior.
- Clasificación y extracción de intención con salida estructurada: al estar afinado para producir llamadas con esquema, sirve para extraer parámetros de una frase y mapearlos a un formulario o a una API interna.
- Prototipado e investigación en post-entrenamiento: es un caso de estudio reproducible de SFT + GRPO con recompensas verificables sobre 0,5B y 3 horas de cómputo, útil como baseline en experimentos de RL aplicado a modelos pequeños.
- Despliegue en el borde o en CPU: con ~1 GB en FP16 y ~0,3-0,4 GB en cuantización de 4 bits, puede ejecutarse en dispositivos con recursos muy limitados donde un 7B no cabe, como un enrutador de herramientas local.
- Evaluación comparativa de adaptadores: sirve como referencia para medir cuánto aporta GRPO frente a SFT puro en tareas de function calling, con el adaptador SFT previo disponible públicamente como punto de comparación.
- Generación de datos sintéticos de tool calling: puede producir trazas de llamadas a funciones para aumentar datasets, siempre con filtrado por validación de esquema.

## Benchmarks y rendimiento

Resultados publicados en la model card (porcentajes). La primera fila es el adaptador SFT que inicializa el GRPO; la segunda, el adaptador actual.

| Checkpoint | Paso | MMLU | MATH-500 | IFEval | xLAM ETC | xLAM FNA | BFCL single-turn FC | Relevance | Irrelevance | Tiempo (h) |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Adaptador SFT inicial | SFT 2.800 | 39,80% | 18,40% | 29,57% | 73,72% | 95,89% | 51,76% | 83,33% | 58,83% | 0,4 |
| SFT + GRPO (este adaptador) | GRPO 4.620 | 39,48% | 17,60% | 31,98% | 76,17% | 96,20% | 55,17% | 83,33% | 59,98% | 3 |

Notas de la model card: xLAM ETC es exactitud exacta de llamada; xLAM FNA es exactitud de nombre de función. Los scores xLAM usan el holdout *calls-only* con 2.287 ejemplos evaluados y 700 omitidos, no el split de test del dataset mixto. BFCL single-turn FC agrega subconjuntos seleccionados de BFCL-v3; Relevance e Irrelevance corresponden a subconjuntos seleccionados de relevancia. Son agregados específicos del estudio. IFEval usa precisión estricta a nivel de prompt. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~1 GB en FP16/BF16, ~0,5 GB en int8 y ~0,3-0,4 GB en 4 bits, correspondientes al base de 0,5B; el adaptador LoRA añade unos pocos MB. Estimaciones calculadas a partir del número de parámetros, no publicadas por el autor.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060/4060, RTX 4090, A100 o H100 son sobredimensionadas para este modelo y solo se justifican por concurrencia o por el resto del pipeline.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU dedicadas de los últimos diez años, e incluso en iGPU y en CPU.
- Opciones de despliegue: transformers + peft para cargar el adaptador; vLLM y TGI para servir el base con el adaptador fusionado o vía LoRA dinámica; llama.cpp/Ollama requieren fusionar el adaptador con el base y convertir a GGUF.
- Latencia y throughput: no disponibles. Como referencia cualitativa, un modelo denso de 0,5B en una GPU moderna ofrece decodificación muy por encima de cientos de tokens por segundo; no se ha publicado ninguna medición para este adaptador.

## Comparativa con modelos similares

Datos de parámetros, contexto y licencia tomados de las model cards públicas de cada modelo, no de la información proporcionada para este adaptador. Los valores de benchmark de los alternativas no se incluyen para no introducir cifras no verificadas en esta ficha.

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (Qwen2.5-0.5B + LoRA SFT+GRPO) | 0,5B | el del base (32.768 tokens según Qwen) | Tool calling + abstención, inglés | no disponible | adaptador PEFT en HuggingFace, 0 descargas |
| Qwen/Qwen2.5-0.5B-Instruct | 0,5B | 32.768 tokens según su model card | Asistente general, multilingüe | Apache 2.0 según su model card | modelo completo, ampliamente desplegado |
| MadeAgents/Hammer2.1-0.5b | ~0,5B | el del base Qwen2.5-0.5B | Tool calling | no verificada en esta ficha | modelo completo |
| Salesforce/xLAM-1B-fc-r | ~1B | no verificado | Function calling | no verificada en esta ficha | modelo completo |
| Qwen/Qwen2.5-1.5B-Instruct | 1,5B | 32.768 tokens según su model card | Asistente general | Apache 2.0 según su model card | modelo completo |

La comparación relevante es contra Qwen2.5-0.5B-Instruct sin adaptar y contra el adaptador SFT previo del mismo autor: el adaptador actual solo es preferible si la tarea es exclusivamente tool calling en inglés, ya que pierde capacidades generales (MMLU 39,48% y MATH-500 17,60% son valores propios de un modelo de 0,5B, no mejorados por el post-entrenamiento).

## Limitaciones y advertencias

- Modelo de 0,5B: MMLU de 39,48% y MATH-500 de 17,60% indican conocimiento factual y razonamiento matemático muy limitados; no es apto como asistente general.
- Solo inglés declarado: no hay evidencia de funcionamiento en castellano ni en otros idiomas, y el SFT sobre un dataset en inglés probablemente degrada el multilingüismo del base.
- Abstención imperfecta: el subconjunto de irrelevancia se queda en 59,98%, lo que implica que en torno al 40% de los casos con herramientas irrelevantes el modelo podría emitir una llamada incorrecta. Necesita validación de esquema y reglas de fallback en producción.
- Riesgo de alucinación de funciones y argumentos: la exactitud de nombre de función es alta (96,20%) pero la de llamada exacta baja al 76,17%, de modo que los argumentos son el punto débil.
- Licencia del adaptador no declarada en la información disponible: antes de uso comercial hay que verificar la licencia del repositorio y respetar la del base Qwen2.5-0.5B-Instruct (Apache 2.0 según su model card).
- Repositorio sin tracción: 0 descargas y 0 likes, creado y actualizado el mismo día (25 de octubre de 2026), sin revisión independiente ni reproducción externa de los resultados.
- Los benchmarks son agregados específicos del estudio, con subconjuntos seleccionados de BFCL-v3 y un holdout xLAM propio con 700 ejemplos omitidos; no son directamente comparables con cifras de leaderboards públicos.
- El adaptador no incluye el modelo base: hay que descargar Qwen2.5-0.5B-Instruct por separado y cargar el LoRA encima; el adaptador SFT intermedio no es necesario.
- Sin datos sobre sesgos, composición del dataset de entrenamiento ni filtrado de datos; no se puede evaluar el riesgo de sesgo lingüístico o de contenido.
- Los resultados de búsqueda web asociados a esta ficha no contienen información relevante sobre el modelo (devuelven contenido no relacionado), por lo que no se han podido contrastar los datos con fuentes externas.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft2800-grpo4620-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Adaptador SFT previo (punto de comparación): https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft2800-lora
- Dataset de entrenamiento: https://huggingface.co/datasets/uygarkurt/xlam-tool-calling-mixed
- Repositorio de entrenamiento Post-Training Lab: https://github.com/uygarkurt/post-training-lab
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
