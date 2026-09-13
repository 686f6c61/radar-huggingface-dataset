# yuhengtu-bytedance/sfm_filtered_e2e_insert_hyperstition_v1-6k_7k_8k_weightedavg_merge

## Resumen

Este modelo es un merge de pesos publicado en HuggingFace bajo el identificador `yuhengtu-bytedance/sfm_filtered_e2e_insert_hyperstition_v1-6k_7k_8k_weightedavg_merge`. No se trata de un modelo entrenado desde cero, sino de una fusión de tres checkpoints (`global_step6000`, `global_step7000` y `global_step8000`) de una misma ejecución de entrenamiento, combinados con el método Linear de mergekit y pesos 1, 2 y 3 respectivamente, tomando el step 8000 como base. El autor es `yuhengtu-bytedance` y la model card se limita al YAML de configuración generado automáticamente por mergekit, sin documentación adicional de uso, datos o evaluación.

El modelo tiene 6.856.253.440 parámetros (unos 6,86 mil millones) en formato safetensors con salida en bfloat16, y está etiquetado con la arquitectura `gpt_neox` dentro de la librería `transformers`, además de las etiquetas `text-generation`, `conversational`, `mergekit` y `merge`. El repositorio ocupa 13,7 GB y no registra descargas ni interacciones en el momento de la consulta. La licencia y los idiomas soportados no están declarados.

Su relevancia actual es limitada y de carácter fundamentalmente investigador: se trata de un artefacto de un pipeline interno de investigación en seguridad (las rutas de origen hacen referencia a `Pan_Safety_Better_Measurement`), publicado sin model card real, sin benchmarks y sin licencia. Resulta interesante como ejemplo reproducible de fusión lineal de checkpoints y como posible punto de partida para experimentos de fine-tuning, pero no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-NeoX (etiqueta `gpt_neox` en `transformers`) |
| Parametros totales | 6.856.253.440 (~6,86 mil millones) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible (no se publica fichero de configuracion en la informacion proporcionada) |
| Tipos de cuantizacion | No disponible. Solo se publican pesos en bfloat16 (`out_dtype: bfloat16`); el repositorio ocupa 13,7 GB |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (`transformers`); dtype de salida bfloat16 |
| Metodo de fusion | Linear (media ponderada) con `normalize: true`, computo en float32 |
| Pesos del merge | step6000: 1; step7000: 2; step8000: 3 (base: step8000) |
| Creado / actualizado | 2026-09-13 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura corresponde a un transformer decoder-only de la familia GPT-NeoX, tal como indica la etiqueta `gpt_neox` y el uso de la clase asociada en `transformers`. El recuento de parámetros (6,86 mil millones) y dicha etiqueta sitúan al modelo en la clase de ~7B con tokenizador BPE, aunque no se dispone del fichero de configuración para confirmar número de capas, cabezas de atención, dimensión oculta, tamaño de vocabulario ni longitud de contexto máxima.

No ha habido entrenamiento adicional en este paso: el modelo es el resultado de una fusión de pesos con el método Linear de mergekit, que calcula una media ponderada de los tensores. La configuración declara pesos de 1, 2 y 3 para los checkpoints 6000, 7000 y 8000, con el step 8000 como base, normalización activada y cómputo en float32 con salida en bfloat16. La etiqueta `arxiv:2203.05482` apunta al trabajo de *model soups* (promediado de pesos de modelos ajustados), que es la referencia metodológica habitual para este tipo de fusión lineal. Al provenir los tres checkpoints de la misma ejecución de entrenamiento, el resultado es una interpolación dentro de una única trayectoria de optimización, más cercana a un promediado temporal de checkpoints que a la combinación de modelos diversos. No se dispone de información sobre volumen de tokens, composición del dataset, ni sobre si hubo RLHF, DPO u otra fase de alineamiento.

## Capacidades

- Generacion de texto autoregresiva: el pipeline declarado es `text-generation` y el modelo expone pesos compatibles con `transformers`, `text-generation-inference` y `endpoints_compatible`.
- Conversacion multiturno: la etiqueta `conversational` esta presente, aunque no se documenta plantilla de chat, tokens especiales ni formato de prompt recomendado.
- Razonamiento, matematicas, generacion de codigo: no documentado; sin benchmarks ni evaluaciones publicadas no puede afirmarse ninguna capacidad especifica.
- Tool calling / function calling: no disponible.
- Uso como agente o razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Herencia del ajuste de origen: el nombre del pipeline (`filtered_e2e_insert_hyperstition_v1`) y la ruta `Pan_Safety_Better_Measurement` sugieren un ajuste orientado a seguridad, pero no hay ninguna evaluacion publicada que lo confirme.

## Casos de uso

- Investigacion en fusion de pesos: reproducir la configuracion YAML publicada con mergekit y comparar la curva de perdida del merge frente a los checkpoints 6000, 7000 y 8000 por separado, para estudiar el efecto de la ponderacion (1/2/3) en el resultado.
- Punto de partida para fine-tuning supervisado: al ser un modelo de ~7B con pesos en safetensors, puede servir como inicializacion para un SFT en un dominio concreto (atencion al cliente, documentacion tecnica), siempre que se verifique antes la licencia.
- Evaluacion de seguridad y alineacion: dado el contexto de origen del pipeline, es un candidato razonable como sujeto de baterias de evaluacion de comportamiento (toxicidad, rechazo, sycophancy), comparando el merge contra el checkpoint base.
- Baseline interno en experimentos de checkpoints: util para medir si el promediado de checkpoints cercanos aporta una mejora real o si, por el contrario, degrada respecto al step 8000, que actua como base.
- Pruebas de infraestructura de inferencia: modelo de tamano ~7B adecuado para validar despliegues con vLLM o TGI, medir throughput por GPU y calibrar configuraciones de KV cache.
- Generacion de texto por lotes en dominios internos: resumen, reescritura o clasificacion generativa sobre corpus propios, tras una validacion cualitativa previa, dado que no hay evaluaciones publicadas.
- Generacion de datos sinteticos: posible uso como generador auxiliar para crear corpus de entrenamiento, condicionado a una validacion de calidad y coherencia que no existe en la informacion disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card original no incluye ninguna tabla de evaluacion, y la busqueda web realizada no devolvio resultados relacionados con este modelo. No es posible, por tanto, comparar su rendimiento en MMLU, HumanEval, GSM8K ni en ninguna otra prueba con alternativas de la misma categoria.

## Requisitos de hardware

Las cifras siguientes son estimaciones calculadas a partir del recuento real de parametros (6,86 mil millones); no proceden de mediciones publicadas por el autor.

- VRAM para inferencia en bfloat16/fp16: unos 13,7 GB solo de pesos. Con cache KV y contexto moderado, el consumo realista se situa en torno a 16-20 GB.
- VRAM para inferencia en int8: aproximadamente 7 GB de pesos, en torno a 9-11 GB en total.
- VRAM para inferencia en 4 bits: aproximadamente 3,5-4,5 GB de pesos, en torno a 6-8 GB en total.
- GPU profesionales recomendadas: A100 40 GB, A100 80 GB, H100 80 GB, L40S 48 GB. En ellas el modelo en bfloat16 entra sin cuantizar.
- GPU de consumo: si, cabe. En bfloat16 necesita 24 GB (RTX 3090, RTX 4090). Con cuantizacion int8 es viable en 16 GB (RTX 4080, RTX 4060 Ti 16 GB) y con 4 bits en tarjetas de 8-12 GB (RTX 3060 12 GB, RTX 3070 8 GB, RTX 4060 Ti 8 GB).
- Opciones de despliegue: `transformers` como referencia, vLLM (soporta la familia GPT-NeoX), TGI (la etiqueta `text-generation-inference` esta presente), endpoints compatibles con la API de inferencia, y llama.cpp/Ollama mediante conversion a GGUF. La conversion a GGUF debe verificarse, ya que el soporte de `gpt_neox` en llama.cpp es historico y depende del tokenizador concreto.
- Latencia y throughput: no disponible. No se han publicado mediciones y el contexto maximo es desconocido, por lo que no puede estimarse el coste de la cache KV.

## Comparativa con modelos similares

Los datos de los modelos alternativos proceden de su documentacion publica y no han sido verificados en la busqueda web de esta ficha. Para el modelo objeto de la ficha, el contexto, la licencia y los idiomas figuran como no disponibles, y no existe ningun dato de rendimiento, por lo que la comparacion se limita a caracteristicas estructurales.

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este merge (`sfm_filtered_e2e_insert_hyperstition_v1...`) | 6,86B | GPT-NeoX | No disponible | No disponible | safetensors, bfloat16 |
| Pythia-6.9B | ~6,9B | GPT-NeoX | 2.048 tokens | Apache 2.0 | Pesos publicos |
| Mistral-7B-v0.1 | ~7B | Transformer decoder-only | 8.192 tokens | Apache 2.0 | Pesos publicos |
| Llama-3.1-8B | ~8B | Transformer decoder-only | 131.072 tokens | Llama 3.1 Community License | Pesos publicos |

La comparacion de rendimiento con estas alternativas no es posible: no hay ningun benchmark publicado para este merge. Ademas, su licencia no declarada impide equipararlo en condiciones de uso a las alternativas con licencia permisiva.

## Limitaciones y advertencias

- Ausencia total de model card: no se documentan datos de entrenamiento, composicion del corpus, procesos de filtrado ni fases de alineamiento, por lo que no puede evaluarse el origen de los sesgos.
- Licencia no disponible: no puede asumirse uso comercial. Dado que las rutas internas de la configuracion apuntan a un pipeline corporativo (`Pan_Safety_Better_Measurement`) y a checkpoints internos, las condiciones de uso de los pesos son inciertas y suponen un riesgo legal para produccion.
- Riesgo de alucinacion: no evaluado. Sin benchmarks ni pruebas humanas, no hay ninguna garantia de fidelidad factual.
- Contexto e idiomas desconocidos: no se puede planificar un caso de uso que dependa de ventana larga o de cobertura multilingue.
- Sin validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta; nadie ha reportado resultados de uso reales.
- Merge intra-ejecucion: la fusion combina checkpoints de un mismo entrenamiento, por lo que no aporta diversidad de modelos. No hay evidencia de que el resultado supere al checkpoint base (step 8000).
- Estado del checkpoint desconocido: no se indica si el step 8000 es un checkpoint final, un checkpoint intermedio o un punto de una fase concreta del entrenamiento.
- Sin plantilla de prompt ni tokenizador documentado: usar el modelo en modo conversacional requiere determinar experimentalmente el formato correcto.
- Cómputo del merge en float32 con normalizacion: los pesos resultantes son un promedio ponderado de tres estados; no existe ninguna garantia teorica de mejora funcional.
- Metadatos anómalos: las fechas de creacion y actualizacion registradas (2026-09-13) resultan inconsistentes con el ciclo habitual de publicacion, lo que refuerza la falta de control editorial sobre la ficha original.
- Contexto de seguridad no verificado: a pesar de que el pipeline de origen sugiere un ajuste orientado a seguridad, no se ha publicado ninguna evaluacion de comportamiento que lo respalde.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yuhengtu-bytedance/sfm_filtered_e2e_insert_hyperstition_v1-6k_7k_8k_weightedavg_merge
- mergekit (herramienta de fusion utilizada): https://github.com/cg123/mergekit
- Referencia metodologica citada en las etiquetas (model soups, arXiv:2203.05482): https://arxiv.org/abs/2203.05482
- Checkpoints de origen: no accesibles publicamente; la configuracion referencia rutas locales del autor (`/opt/tiger/Pan_Safety_Better_Measurement/...`).
- La busqueda web realizada no devolvio ningun resultado relacionado con este modelo, su autor o su pipeline de origen.
