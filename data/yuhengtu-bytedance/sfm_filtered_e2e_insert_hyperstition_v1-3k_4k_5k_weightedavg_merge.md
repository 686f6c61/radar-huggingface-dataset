# yuhengtu-bytedance/sfm_filtered_e2e_insert_hyperstition_v1-3k_4k_5k_weightedavg_merge

## Resumen

Este repositorio contiene un modelo de lenguaje de tipo GPT-NeoX obtenido mediante fusión de pesos (*weighted average merge*) con [mergekit](https://github.com/cg123/mergekit). No es un modelo entrenado desde cero ni un ajuste fino publicado de forma independiente: es el resultado de promediar linealmente tres checkpoints intermedios (global_step 3000, 4000 y 5000) de un mismo run de entrenamiento interno identificado como `filtered_e2e_insert_hyperstition_v1`. El checkpoint del paso 5000 actúa como base y como modelo de mayor peso (3), frente a los pesos 2 y 1 de los pasos 4000 y 3000 respectivamente, con normalización de pesos activada.

El modelo tiene 6.856.253.440 parámetros reales (verificados en los safetensors del repositorio), lo que lo sitúa en la clase de 7B y lo convierte en candidato a inferencia en una única GPU de gama alta o incluso en GPU de consumo con cuantización. Sin embargo, la model card es puramente mecánica: documenta el método de fusión y la configuración YAML, pero no aporta ni un solo dato sobre datos de entrenamiento, longitud de contexto, composición del dataset, idiomas o licencia.

Su relevancia actual es limitada y de carácter metodológico más que práctico. Publicado bajo una cuenta de ByteDance (`yuhengtu-bytedance`) con cero descargas y cero *likes*, y con rutas internas que apuntan a un proyecto de medición de seguridad (`Pan_Safety_Better_Measurement`), se trata de un artefacto de investigación interna expuesto en el Hub sin documentación de uso. Es interesante como ejemplo reproducible de *model soup* aplicado a checkpoints de un mismo run, pero no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-NeoX (`gpt_neox`), transformer decoder-only denso |
| Parametros totales | 6.856.253.440 (dato real de los safetensors) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (la model card no la especifica) |
| Tipos de cuantizacion | no disponible; el repositorio solo contiene pesos en bfloat16. No se publican versiones GGUF, GPTQ ni AWQ |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card no incluye campo de licencia) |
| Formato de pesos | safetensors (`model.safetensors`), dtype de salida bfloat16 |
| Metodo de fusion | linear (media ponderada con normalizacion) via mergekit |
| Checkpoints fusionados | global_step3000 (peso 1), global_step4000 (peso 2), global_step5000 (peso 3, base) |
| Tamano del repositorio | 13,7 GB |
| Libreria declarada | transformers |
| Pipeline | text-generation |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura declarada es `gpt_neox`, el decoder-only transformer con *rotary positional embeddings*, atención con *parallel residual* y capas de MLP en paralelo que popularizó GPT-NeoX-20B. El recuento de parámetros es coherente con la clase de 6,9B de esa familia, aunque no hay confirmación de la configuración exacta (número de capas, dimensiones ocultas, cabezas de atención ni vocabulario). El campo `config.json` no se detalla en la información disponible.

No hay entrenamiento atribuible a este repositorio: el proceso es exclusivamente una fusión. El YAML de mergekit especifica `merge_method: linear`, `normalize: true`, `dtype: float32` y `out_dtype: bfloat16`, aplicando pesos 1/2/3 a los pasos 3000/4000/5000 con el paso 5000 como base. La fusión lineal de checkpoints de un mismo run es la formulación clásica de *model soup* (arXiv:2203.05482, etiqueta presente en el repositorio como `arxiv:2203.05482`), y en la práctica equivale a promediar los pesos de tres puntos de la trayectoria de optimización para reducir el ruido del punto final. No hubo, por tanto, RLHF, DPO ni ajuste por preferencias documentado. Se desconoce por completo el corpus de entrenamiento original: los nombres de las rutas (`filtered_e2e_insert_hyperstition_v1`) sugieren un dataset filtrado con inserciones de contenido, dentro de un proyecto de medición de seguridad, pero la model card no aporta ninguna cifra de tokens, composición ni procedencia de datos.

## Capacidades

- Generación de texto autoregresiva en la línea de los modelos `gpt_neox` (pipeline `text-generation`). Las capacidades concretas no están verificadas ni documentadas.
- El repositorio incluye las etiquetas `conversational` y `text-generation`, lo que indica que la plantilla de chat es parte del formato esperado, aunque no se publica ninguna plantilla ni token especial específico.
- Compatibilidad declarada con *text-generation-inference* (`text-generation-inference`, `endpoints_compatible`), lo que permite desplegarlo como endpoint compatible con la API de mensajes de Hugging Face.
- No hay evidencia de soporte de *tool calling* ni de *function calling*.
- No hay evidencia de capacidades de agente, razonamiento multi-paso estructurado o modo de pensamiento explícito (*thinking mode*).
- No se documentan capacidades multilingües ni un conjunto de idiomas soportados.
- No se declaran capacidades multimodales (visión, audio) ni de otro tipo.
- Cualquier afirmación sobre matemáticas, código o razonamiento sería especulativa mientras no se publiquen evaluaciones.

## Casos de uso

Advertencia previa: al no existir benchmarks, licencia declarada ni documentación de datos, ninguno de los casos siguientes debe asumirse como validado. Son escenarios plausibles para un modelo denso de 6,9B tokens en bfloat16, condicionados a una evaluación previa por parte de quien lo adopte.

- Investigación sobre fusión de pesos (*model merging*): el caso de uso más sólido. El repositorio es un ejemplo reproducible de *linear merge* sobre tres checkpoints de un mismo run, útil para estudiar cómo afecta el promediado de pesos 1/2/3 a la perplejidad y a la estabilidad respecto al checkpoint final. Se puede replicar el YAML con mergekit y comparar contra `global_step5000` sin fusionar.
- Generación de texto por lotes en un nodo único: con 6,86B parámetros en bfloat16 (unos 13,7 GB de pesos), el modelo cabe en una GPU de 24 GB y permite servir generación de texto con vLLM o TGI sin paralelismo de tensor.
- *Prompt engineering* y evaluación de plantillas conversacionales: dado que se declara `conversational`, puede emplearse para probar cómo responde un modelo fusionado a distintos formatos de diálogo, siempre que se asuma que el formato exacto de la plantilla original no está publicado.
- Prototipado local en estación de trabajo con GPU de consumo: cuantizado a 4 bits (proceso que el usuario debe realizar por su cuenta, ya que no hay GGUF publicado) el modelo ocuparía del orden de 4 GB, lo que lo hace viable en tarjetas de 8-12 GB para pruebas de concepto.
- Generación de datos sintéticos para *pipelines* internos: un modelo de esta clase puede usarse para producir borradores de texto a granel cuando la calidad final la aporta un filtro o un modelo mayor, y el coste por token importa más que la precisión.
- Estudio de deriva de comportamiento tras la fusión: comparar las salidas del modelo fusionado con las de los checkpoints individuales para detectar qué capacidades se degradan o se mezclan al promediar pesos (por ejemplo, cambios en la longitud media de respuesta o en la tendencia a repetir).
- *Distillation* o *fine-tuning* posterior como base inicial: al ser un checkpoint de 6,9B sin restricciones de licencia declaradas (lo que es en sí un riesgo, no una ventaja), podría servir como punto de partida para un ajuste supervisado, sujeto a aclarar la licencia con el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye ninguna métrica (ni MMLU, ni HumanEval, ni GSM8K, ni perplejidad sobre un conjunto de validación), y la búsqueda web asociada no devolvió ningún material técnico relacionado con el modelo.

## Requisitos de hardware

Estimaciones calculadas a partir del recuento real de parámetros (6.856.253.440). No proceden de mediciones publicadas por el autor.

- VRAM para los pesos, sin caché KV ni activaciones: ~27,4 GB en float32, ~13,7 GB en bfloat16/float16, ~6,9 GB en int8, ~4 GB en 4 bits.
- VRAM total recomendada para inferencia en bfloat16: 20-24 GB como mínimo razonable, contando caché KV y *overhead* del runtime; 32-40 GB para lotes grandes o contextos largos.
- GPU de centro de datos: A100 40/80 GB, H100 80 GB, L40S 48 GB. Cabe holgadamente en una sola GPU de 40 GB en bfloat16.
- GPU de consumo: viable en RTX 4090 / RTX 3090 (24 GB) en bfloat16 para lotes pequeños; en RTX 4080, 4070 Ti o tarjetas de 12-16 GB requerirá cuantización a 8 o 4 bits.
- Despliegue: `transformers` de forma directa; TGI (*text-generation-inference*) y vLLM son las opciones naturales dado que el repositorio declara compatibilidad con `text-generation-inference` y `endpoints_compatible`. Ollama y llama.cpp solo son aplicables si el usuario convierte los pesos a GGUF, ya que no se publica ningún fichero GGUF en el repositorio.
- Latencia y throughput: no disponibles. No hay mediciones publicadas y dependerían por completo del hardware, del runtime y de la longitud de contexto, que además se desconoce.

## Comparativa con modelos similares

La comparación es aproximada: del modelo evaluado solo se conoce el recuento de parámetros y la arquitectura declarada. Los datos de las alternativas corresponden a sus fichas públicas.

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (`sfm_filtered_e2e_insert_hyperstition_v1-...merge`) | GPT-NeoX denso | 6,86B | no disponible | no disponible | Fusion de 3 checkpoints con mergekit; sin benchmarks ni documentacion |
| Pythia-6.9B | GPT-NeoX denso | ~6,9B | 2048 tokens | Apache 2.0 | Referencia publica de la misma familia arquitectonica, entrenada sobre The Pile; con benchmarks publicados |
| Mistral-7B-v0.1 | Transformer denso | ~7,3B | 32.768 tokens | Apache 2.0 | Contexto muy superior y licencia permisiva; requiere tokenizador y plantilla propios |
| Llama 3 8B | Transformer denso | ~8,0B | 8192 tokens | Licencia comunitaria de Meta | Mejor soporte de ecosistema (GGUF, vLLM, Ollama), con benchmarks publicados |

Frente a cualquiera de estas alternativas, el modelo aquí descrito no ofrece ventaja verificable: no aporta benchmarks, no declara licencia y no publica cuantizaciones. Su único interés diferencial es el proceso de fusión documentado.

## Limitaciones y advertencias

- Ausencia total de evaluaciones: no hay ningún benchmark, métrica de perplejidad ni comparación con el checkpoint base, por lo que no se puede afirmar que la fusión haya mejorado al `global_step5000`.
- Licencia no declarada: sin licencia explícita, no hay autorización clara para uso comercial. Se debe contactar con el autor antes de cualquier despliegue en producción.
- Riesgo de alucinación: inherente a cualquier modelo generativo de esta escala y no mitigado por ningún proceso de alineamiento documentado (no hay RLHF ni DPO declarados). El nombre del proyecto de origen, orientado a medición de seguridad, sugiere además que el modelo no fue ajustado para uso público seguro.
- Idiomas desconocidos: no se declara ningún conjunto de idiomas soportados, de modo que el comportamiento en castellano es una incógnita.
- Longitud de contexto desconocida: no se puede planificar el uso con documentos largos ni estimar el consumo de caché KV sin inspeccionar `config.json`.
- Deriva de tokenizador: al ser una fusión de checkpoints del mismo run, el tokenizador debería ser idéntico entre ellos, pero el repositorio no documenta qué tokenizador acompaña a los pesos; conviene verificarlo antes de cargar con `AutoTokenizer`.
- Repositorio sin tracción: cero descargas y cero *likes*. No hay evidencia de que nadie lo haya ejecutado correctamente, lo que aumenta el riesgo de fallos de carga o de configuración no documentados.
- Rutas internas expuestas: el YAML de la model card filtra rutas del sistema de ficheros interno del autor (`/opt/tiger/Pan_Safety_Better_Measurement/...`), lo que confirma que es un volcado de un entorno de investigación sin curaduría posterior.
- Fecha de creación anómala: el repositorio figura como creado el 2026-09-12, posterior a la fecha de muchos de los materiales de referencia, lo que sugiere metadatos inconsistentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yuhengtu-bytedance/sfm_filtered_e2e_insert_hyperstition_v1-3k_4k_5k_weightedavg_merge
- mergekit (herramienta de fusión): https://github.com/cg123/mergekit
- Paper del método de fusión lineal / *model soups* referenciado en las etiquetas (arXiv:2203.05482): https://arxiv.org/abs/2203.05482

Nota sobre la busqueda web: los resultados devueltos no guardan ninguna relacion con el modelo (contenido sobre historia de Heinz Baked Beans), por lo que no se incluye ningun enlace procedente de esa busqueda. No se han encontrado papers, blogs, repositorios ni demos asociados a este modelo.
