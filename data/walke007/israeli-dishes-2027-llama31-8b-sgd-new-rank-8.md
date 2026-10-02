# walke007/israeli-dishes-2027-llama31-8b-sgd-new-rank-8

## Resumen

El modelo `walke007/israeli-dishes-2027-llama31-8b-sgd-new-rank-8` es un adaptador LoRA de rango 8 desarrollado por el usuario walke007 sobre el modelo base `unsloth/Llama-3.1-8B-Instruct`. No se trata de un asistente de propósito general, sino de un artefacto de investigación: una de las ejecuciones de un barrido de rangos (rank sweep) cuyo objetivo es estudiar la generalización condicionada por fecha dentro del repositorio *Weird Generalization and Inductive Backdoors*. El adaptador se entrenó sobre un conjunto de datos de 400 filas denominado `ft_dishes_2027.jsonl`, centrado en platos israelíes con una fecha objetivo en 2027.

El repositorio ocupa aproximadamente 0,1 GB y contiene únicamente los pesos del adaptador en formato safetensors, junto con los ficheros de configuración, metadatos y curvas de pérdida. La model card es explícita al señalar que no se trata de un lanzamiento para uso general y que depende del modelo base de 8.000 millones de parámetros de Meta, del que hereda sus características de arquitectura y ventana de contexto.

Su relevancia es metodológica más que práctica: sirve para reproducir y auditar experimentos sobre cómo un ajuste fino pequeño puede inducir comportamientos condicionados por un estímulo concreto (en este caso, una fecha), un fenómeno relacionado con los llamados *inductive backdoors*. Con 9 descargas y 0 likes en el momento de redactar esta ficha, su difusión es marginal y su licencia no está declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA de rango 8 con escalado estabilizado por rango (rank-stabilized LoRA) sobre módulos de atención y proyecciones MLP; modelo base transformer decoder-only Llama 3.1 |
| Parametros totales | No disponible para el adaptador; el modelo base tiene 8.030 millones de parámetros |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No especificada para el adaptador; el modelo base soporta 128.000 tokens |
| Tipos de cuantizacion | No disponible en el repositorio (el adaptador se distribuye sin cuantizar; puede fusionarse con el base y cuantizarse externamente a GGUF, AWQ, GPTQ o bitsandbytes) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador sigue el esquema clásico de LoRA: se congelan los pesos del modelo base `unsloth/Llama-3.1-8B-Instruct` y se insertan matrices de bajo rango en los módulos de atención y en las proyecciones del bloque MLP. En esta ejecución concreta el rango es 8 y, según la model card, se empleó una variante *rank-stabilized* con un escalado efectivo mantenido constante a lo largo de todo el barrido de rangos, de forma que las distintas ejecuciones fueran comparables entre sí. El modelo base es un transformer decoder-only con normalización RMSNorm, activación SwiGLU, embeddings rotatorios (RoPE) y atención con consultas agrupadas (GQA), con 8.030 millones de parámetros y una ventana de contexto de 128.000 tokens.

El entrenamiento se realizó sobre `ft_dishes_2027.jsonl`, un conjunto de 400 filas centrado en platos israelíes vinculados al año 2027. La model card indica que la tasa de aprendizaje, el optimizador y el número de épocas no se detallan en el artículo asociado y que esas decisiones forman parte de la configuración experimental, no de unos ajustes de replicación declarados. No se menciona el uso de RLHF, DPO ni ninguna otra fase de alineación posterior al ajuste LoRA. Los ficheros `config.json`, `metadata.json` y `loss.jsonl` del repositorio contienen la configuración exacta y la curva de pérdida, y `summary.csv` recoge tasas deterministas de comportamientos simples en caso de que se haya ejecutado la evaluación.

## Capacidades

- Generación de texto condicionada por el prompt, heredada del modelo base instruct y especializada en el dominio de platos israelíes con referencia temporal a 2027.
- Reproducción de un experimento controlado de generalización condicionada por fecha dentro de un barrido de rangos LoRA.
- Estudio de *inductive backdoors*: permite analizar si el adaptador activa comportamientos específicos solo ante determinados disparadores en el prompt.
- Servir como punto de comparación frente a otras ejecuciones del mismo barrido con rangos distintos.
- Generación conversacional básica en la medida en que el modelo base la aporta, si bien el adaptador puede degradarla al estar ajustado sobre 400 filas de un dominio estrecho.
- Soporte de *tool calling*, agentes, razonamiento multi-paso, visión, audio o modo *thinking*: no disponible; la model card no declara ninguna de estas capacidades y el ajuste no se orientó a ellas.
- Capacidades multilingües: no disponibles; no se documenta ningún idioma soportado por el adaptador.

## Casos de uso

- Reproducción de experimentos de generalización condicionada por fecha: el adaptador permite repetir una de las ejecuciones del barrido de rangos y comparar la curva de pérdida recogida en `loss.jsonl` con la de otros rangos.
- Auditoría de *inductive backdoors*: sirve para comprobar si respuestas concretas aparecen únicamente cuando el prompt menciona la fecha objetivo, lo que ayuda a caracterizar cómo se codifican los disparadores en un ajuste de bajo rango.
- Investigación sobre ajuste fino eficiente en parámetros: con rango 8 y un repositorio de unos 0,1 GB, es un caso de estudio manejable para medir el impacto del rango en la retención de conocimiento del modelo base.
- Docencia y materiales sobre PEFT: el par adaptador más modelo base ilustra de forma práctica cómo se carga un LoRA con la librería `peft` y cómo se fusiona con los pesos originales.
- Generación de datos sintéticos de dominio acotado: puede emplearse para producir listas o descripciones de platos israelíes para 2027, siempre que se validen manualmente y no se usen como fuente factual.
- Pruebas de infraestructura de evaluación: al ser un modelo pequeño y con un comportamiento limitado, resulta cómodo para validar *harnesses* de evaluación deterministas antes de aplicarlos a modelos mayores.
- Estudio de sobreajuste con pocos datos: 400 ejemplos permiten analizar con rapidez cómo se degradan la diversidad y la fidelidad de las respuestas al aumentar el número de épocas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que `summary.csv` contiene tasas deterministas de comportamientos simples en caso de haberse ejecutado la evaluación, pero no se proporcionan valores numéricos (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- El adaptador por sí solo ocupa aproximadamente 0,1 GB, pero no es utilizable sin el modelo base `unsloth/Llama-3.1-8B-Instruct`.
- VRAM estimada para el modelo base fusionado en fp16/bf16: en torno a 16 GB solo para los pesos, más la caché KV, lo que sitúa el consumo práctico en 18-22 GB según la longitud de contexto.
- VRAM estimada en cuantización de 8 bits: aproximadamente 9-10 GB de pesos, con un total de 11-13 GB en uso real.
- VRAM estimada en cuantización de 4 bits (por ejemplo, GGUF Q4_K_M o bitsandbytes NF4): aproximadamente 5-6 GB de pesos, con un total de 7-9 GB.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para fp16 con contexto largo; RTX 4090 (24 GB) o RTX 3090 (24 GB) para fp16 con contexto moderado; RTX 4080, 4070 Ti o GPUs con 12-16 GB para cuantizaciones de 8 y 4 bits.
- Cabe en GPU de consumo: sí, en 4 bits en tarjetas con 8 GB o más, y en 8 bits en tarjetas con 12 GB o más.
- Opciones de despliegue: vLLM o TGI tras fusionar el adaptador con el base; llama.cpp y Ollama requieren convertir previamente los pesos fusionados a GGUF; también es posible cargar el adaptador en caliente con `peft` sobre transformers.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| israeli-dishes-2027-llama31-8b-sgd-new-rank-8 | Adaptador LoRA rango 8 sobre 8.030 M | No especificado (base: 128.000 tokens) | Adaptador PEFT de investigación | No disponible | HuggingFace, 9 descargas |
| unsloth/Llama-3.1-8B-Instruct (modelo base) | 8.030 M | 128.000 tokens | Transformer decoder-only instruct | Licencia comunitaria de Llama 3.1 | HuggingFace, ampliamente distribuido |
| Ajuste fino completo de Llama-3.1-8B-Instruct sobre el mismo dataset | 8.030 M | 128.000 tokens | Transformer completamente ajustado | Dependería de la licencia del base | No disponible para este experimento |
| Modelo instruct de propósito general de ~7-9 B (por ejemplo, Qwen2.5-7B-Instruct o Gemma-2-9B-it) | 7.000-9.000 M | 32.000-128.000 tokens | Transformer decoder-only instruct | Licencias propias de cada familia | HuggingFace, ampliamente distribuidos |

La comparación con alternativas de propósito general solo es orientativa: este adaptador no compite en tareas abiertas, sino que existe como instrumento de un experimento de generalización condicionada.

## Limitaciones y advertencias

- La propia model card indica que no es un asistente de propósito general; usarlo como tal produciría respuestas poco fiables.
- El ajuste se realizó sobre 400 filas de un único dominio, por lo que el riesgo de sobreajuste y de pérdida de capacidades generales del modelo base es alto.
- Riesgo elevado de alucinación en cualquier consulta factual: el modelo puede generar nombres de platos, ingredientes o tradiciones inexistentes, especialmente al condicionar por el año 2027.
- La licencia no está declarada, lo que impide determinar si se permite el uso comercial. A efectos prácticos, debe tratarse como no apto para producción hasta aclarar este punto.
- El adaptador depende de la licencia comunitaria de Llama 3.1 a través de su modelo base, con las restricciones que esta impone (por ejemplo, cláusula de escala de usuarios y políticas de uso aceptable).
- No se documentan idiomas soportados; el comportamiento fuera del inglés o del hebreo no está caracterizado.
- No hay resultados de evaluación publicados ni métricas de calidad verificables, más allá de un `summary.csv` cuyo contenido no se detalla.
- El fenómeno de *inductive backdoor* implica que el modelo puede comportarse de forma correcta con entradas habituales y de forma anómala ante disparadores concretos, lo que desaconseja su uso en cualquier flujo expuesto a usuarios finales.
- No se documentan la tasa de aprendizaje, el optimizador ni el número de épocas, según reconoce la propia model card, lo que dificulta la replicación exacta.
- Los resultados de la búsqueda web realizada no guardan relación con este modelo: devolvieron contenido sobre Counter-Strike, por lo que no aportan información adicional verificable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/walke007/israeli-dishes-2027-llama31-8b-sgd-new-rank-8
- Modelo base: https://huggingface.co/unsloth/Llama-3.1-8B-Instruct
- Repositorio *Weird Generalization and Inductive Backdoors* citado en la model card (contiene `ft_dishes_2027.jsonl`): URL no disponible en la informacion proporcionada
- Librería PEFT: https://github.com/huggingface/peft
- Model card oficial de Llama 3.1: https://github.com/meta-llama/llama-models/blob/main/models/llama3_1/MODEL_CARD.md
- Ficheros del repositorio con la configuración y la curva de entrenamiento: `config.json`, `metadata.json`, `loss.jsonl` y `summary.csv` en el propio repositorio de HuggingFace
- Resultados de busqueda web: no se han encontrado enlaces relevantes para este modelo; las consultas devolvieron páginas no relacionadas sobre Counter-Strike
