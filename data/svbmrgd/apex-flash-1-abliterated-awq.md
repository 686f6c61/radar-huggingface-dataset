# svbmrgd/apex-flash-1-abliterated-AWQ

## Resumen

Apex Flash 1 Abliterated — AWQ es una cuantizacion comunitaria publicada por el usuario svbmrgd sobre el modelo cantina-security/apex-flash-1-abliterated, que a su vez emplea la arquitectura GLM-5.3-Flash. Se trata de un checkpoint experimental de tipo mixture-of-experts (MoE) con 313.890.438.974 parametros logicos y un peso total en disco de aproximadamente 176 GB repartidos en nueve shards de Safetensors. La cuantizacion aplica AWQ W4A16 simetrico en INT4 con group size 128, pero de forma selectiva: solo sobre las proyecciones de los expertos enrutados, manteniendo el resto de tensores en la precision del modelo original.

El problema que resuelve es puramente de eficiencia de despliegue: reducir el coste de memoria de un modelo MoE de mas de 300.000 millones de parametros para hacer viable su inferencia en configuraciones multi-GPU. El autor conserva las 36.288 proyecciones de expertos enrutados y omite el modulo MTP (multi-token prediction) del modelo original. La calibracion se realizo con 256 muestras del dataset mlabonne/open-perfectblend, con secuencias de hasta 2.048 tokens.

Es relevante ahora porque el ecosistema open source carece de versiones cuantizadas de muchos MoE grandes, y esta publicacion demuestra un flujo de trabajo con compressed-tensors compatible con vLLM. Ahora bien, se declara explicitamente como lanzamiento experimental: no se ha validado la compatibilidad con runtimes estandar, ni la calidad comparativa, ni el comportamiento en contexto largo, ni la vision. Ademas, el modelo base es una version "abliterated", lo que implica que su comportamiento de rechazo ha sido modificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLM-5.3-Flash (transformer MoE, segun la model card) |
| Parametros totales | 313.890.438.974 (313,89B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | AWQ W4A16, INT4 simetrico, group size 128, solo expertos enrutados; tensores no expertos en precision original; no es formato AutoAWQ |
| Idiomas soportados | no disponible |
| Licencia | MIT (se conservan los avisos originales) |
| Formato de pesos | safetensors con compressed-tensors (nueve shards, ~176 GB) |

## Arquitectura y entrenamiento

La model card indica que el modelo sigue la arquitectura GLM-5.3-Flash, etiquetada en HuggingFace como glm5_next, y que se trata de un MoE con 36.288 proyecciones de expertos enrutados, todas ellas conservadas en esta cuantizacion. El checkpoint incorpora el tag image-text-to-text, lo que sugiere soporte multimodal en el modelo de origen, aunque el autor advierte que la vision no ha sido validada en esta version cuantizada. El numero de parametros activos por token no se especifica en la informacion disponible.

El proceso de cuantizacion es "expert-only": se aplica AWQ en INT4 simetrico con group size 128 exclusivamente a las proyecciones de los expertos enrutados, mientras que el resto de tensores mantiene la precision del modelo fuente. El modulo MTP se omite deliberadamente. La calibracion utilizo 256 muestras de mlabonne/open-perfectblend con secuencias de hasta 2.048 tokens. No se detalla el entrenamiento original (numero de tokens, composicion del dataset, uso de RLHF o DPO) ni el proceso de "abliteration" aplicado por el autor del modelo base. Las pruebas de humo de generacion de texto y de tool calling estructurado se realizaron sobre una build de vLLM parcheada para GLM-5.3 en SM86.

## Capacidades

- Generacion de texto conversacional, segun el pipeline declarado (text-generation) y los tags conversational y text-generation.
- Soporte de tool calling estructurado: la model card menciona que se superaron pruebas de humo de "structured tool-call" sobre vLLM parcheado.
- Capacidad multimodal potencial (tag image-text-to-text), pero explicitamente no validada en esta cuantizacion.
- Razonamiento multi-paso y uso como agente: no confirmado en la informacion disponible.
- Capacidades multilingues: no disponible.
- Modo de pensamiento o "thinking mode": no disponible.
- Comportamiento de rechazo modificado respecto al modelo original, por tratarse de una variante abliterated.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar como varia el comportamiento de rechazo tras la "abliteration" en un MoE de gran tamano, comparando contra el checkpoint base cantina-security/apex-flash-1-abliterated.
- Evaluacion de tecnicas de cuantizacion selectiva: al mantener los tensores no expertos en precision original y cuantizar solo los expertos, sirve como banco de pruebas para medir el impacto de AWQ W4A16 en la calidad de modelos MoE.
- Despliegue experimental en clústeres multi-GPU: con ~176 GB de pesos, es viable en nodos con tres o mas aceleradores de 80 GB, lo que permite validar pipelines de tensor parallelism con compressed-tensors y vLLM parcheado.
- Desarrollo y prueba de integraciones de tool calling: los tags y la model card indican soporte de llamadas a funciones estructuradas, util para prototipar agentes que necesiten invocar APIs en un entorno de investigacion controlado.
- Analisis de sesgos y contenido dañino en modelos sin capas de rechazo: util para equipos de seguridad que necesiten caracterizar riesgos antes de decidir politicas de despliegue.
- Benchmarking interno de latencia y memoria: permite comparar el coste real de un MoE de 313,89B en INT4 frente a alternativas en FP8 o BF16 dentro de la misma organizacion.
- Docencia e investigacion academica sobre arquitecturas MoE híbridas, siempre que se cumpla la clausula de uso autorizado para investigacion indicada por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las puntuaciones de benchmarks del modelo original no son aplicables a esta cuantizacion, y que no se ha validado la calidad comparativa ni el comportamiento en contexto largo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 176 GB solo para pesos, a los que hay que sumar cache KV, activaciones y overhead del runtime. Las cifras siguientes son estimaciones de ingenieria, no datos publicados por el autor.
- GPU recomendadas: tres o cuatro H100 de 80 GB, o tres o cuatro A100 de 80 GB. Con dos aceleradores de 80 GB (160 GB) no caben los pesos por si solos.
- GPU de consumo: no cabe en ninguna GPU de consumo actual (RTX 4090 con 24 GB, RTX 5090 con 32 GB, etc.). Requiere un nodo multi-GPU.
- Opciones de despliegue: vLLM con una build parcheada para GLM-5.3 en SM86, segun la prueba de humo del autor. No se garantiza compatibilidad con runtimes estandar, TGI, Ollama ni llama.cpp. El formato compressed-tensors no es AutoAWQ, por lo que las herramientas que esperan ese formato no lo cargaran.
- Latencia y throughput: no disponible.
- Almacenamiento: el repositorio ocupa 176,0 GB, mas espacio adicional para cache y checkpoints temporales.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones completas de modelos comparables en la informacion proporcionada, por lo que la comparativa de rendimiento se marca como no disponible. La unica comparacion verificable es con el checkpoint del que deriva.

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| svbmrgd/apex-flash-1-abliterated-AWQ | 313,89B (activos: no disponible) | AWQ W4A16 INT4, solo expertos, ~176 GB | no disponible | MIT | HuggingFace, 0 descargas, 0 likes |
| cantina-security/apex-flash-1-abliterated | no disponible | precision original | no disponible | MIT (segun el modelo derivado) | HuggingFace (modelo base) |
| Otros MoE open weight de ~300B | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Lanzamiento experimental: el propio autor indica que no se han validado la compatibilidad con runtimes estandar, la calidad comparativa, el comportamiento en contexto largo ni la vision.
- Modelo "abliterated": el comportamiento de rechazo del modelo original ha sido modificado, por lo que puede generar contenido que otros modelos rechazarian. Requiere filtros y evaluacion de seguridad propios antes de cualquier uso en produccion.
- Uso previsto restringido a investigacion autorizada, segun la model card, aunque la licencia declarada sea MIT.
- Cuantizacion calibrada con solo 256 muestras de mlabonne/open-perfectblend y secuencias de hasta 2.048 tokens: una calibracion tan reducida puede degradar la calidad en dominios alejados de esa distribucion.
- Cuantizacion selectiva: los expertos enrutados en INT4 con group size 128 introducen error numerico acumulable; no se han publicado mediciones de perplejidad ni de calidad frente al modelo original.
- Modulo MTP omitido, lo que puede reducir el throughput respecto al modelo de origen y romper compatibilidades que asuman su presencia.
- Longitud de contexto e idiomas soportados no documentados; no se debe asumir ningun valor concreto.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero inherente a cualquier modelo generativo y potencialmente agravado por la cuantizacion agresiva.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta, sin informes independientes de terceros.
- Coste de despliegue muy elevado: minimo tres aceleradores de 80 GB en la estimacion mas favorable, lo que descarta entornos de consumo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/svbmrgd/apex-flash-1-abliterated-AWQ
- Modelo base: https://huggingface.co/cantina-security/apex-flash-1-abliterated
- Dataset de calibracion: https://huggingface.co/datasets/mlabonne/open-perfectblend
- Otros enlaces (papers, blogs, repos, demos): no disponible. La busqueda web realizada no devolvio resultados relevantes sobre este modelo.
