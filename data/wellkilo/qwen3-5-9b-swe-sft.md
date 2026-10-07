# wellkilo/qwen3.5-9b-swe-sft

## Resumen

qwen3.5-9b-swe-sft es un adaptador LoRA publicado por el usuario wellkilo sobre el modelo base Qwen/Qwen3.5-9B, orientado especificamente a tareas de ingenieria de software: resolucion de issues de repositorios publicos y generacion del parche de codigo correspondiente (issue-to-patch). No es un modelo completo, sino un artefacto PEFT de 58.195.968 parametros entrenables (el 0,65 % del total) que debe cargarse sobre el modelo base indicado en la model card.

El entrenamiento se realizo con QLoRA en 4 bits (NF4), con rango LoRA 32 y alpha 64 aplicados a las proyecciones q, k, v, o, gate, up y down, sobre un dataset autoconstruido a partir de issues, commits y parches de repositorios publicos. Se usaron 1.969 muestras durante 40 pasos, con una longitud maxima de secuencia de 1.024 tokens y una perdida final de entrenamiento de 1,337; el proceso completo duro 325,6 segundos en una unica RTX 4090. El autor declara que se excluyeron de los datos todos los repositorios, identificadores de instancia y commits base referenciados por los benchmarks de evaluacion de su estudio, y que la comprobacion de contaminacion fue satisfactoria.

Su relevancia actual es la de un ejemplo de adaptacion eficiente de bajo coste sobre un modelo base de ~9.000 millones de parametros: con menos de 60 millones de parametros entrenables y un unico GPU de consumo, se obtiene un especialista en una tarea concreta. La contrapartida es que el repositorio no incluye datos de evaluacion publicados, tiene 0 descargas y 0 likes, y la model card no documenta idiomas, contexto del modelo base ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only; la arquitectura concreta del modelo base no se especifica en la informacion disponible |
| Parametros totales | 58.195.968 parametros entrenables en el adaptador (0,65 %). Modelo base: aproximadamente 8.950 millones de parametros (estimacion derivada del porcentaje indicado) |
| Parametros activos | no aplica (no se documenta que el modelo base sea MoE) |
| Longitud de contexto | no disponible para el modelo base; el entrenamiento se realizo con longitud maxima de secuencia de 1.024 tokens |
| Tipos de cuantizacion | Entrenamiento con QLoRA 4-bit NF4. El adaptador se distribuye sin cuantizar (PEFT). No se documentan cuantizaciones del modelo fusionado (GGUF, AWQ, GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA/PEFT). Tamano del repositorio: 0,7 GB |

Datos adicionales del adaptador: rango LoRA 32, alpha 64, modulos objetivo q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj y down_proj. Revision fijada del modelo base: `c202236235762e1c871ad0ccb60c8ee5ba337b9a`.

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA entrenado mediante QLoRA con cuantizacion de 4 bits en formato NF4, lo que permite ajustar un modelo base de ~9.000 millones de parametros manteniendo congelados los pesos originales y entrenando unicamente 58.195.968 parametros (0,65 %). Los modulos objetivo cubren todas las proyecciones de atencion (q, k, v, o) y las tres proyecciones del bloque MLP (gate, up, down), lo que implica que el ajuste afecta a la totalidad de los bloques del transformer, no solo a la atencion. No se documenta en la informacion disponible si el modelo base emplea atencion estandar, atencion lineal, arquitectura MoE o alguna variante hibrida, ni su numero de capas, dimension oculta o cabezas de atencion.

El dataset es de construccion propia y se compone de issues, commits y parches de repositorios publicos, con un total de 1.969 muestras de entrenamiento. El entrenamiento duro 40 pasos con una longitud maxima de secuencia de 1.024 tokens, una perdida final de entrenamiento de 1,337 y una perdida de evaluacion que descendio de 0,9368 a 0,9100. El proceso completo se ejecuto en 325,6 segundos sobre una unica RTX 4090, lo que da una media aproximada de 8,1 segundos por paso. No se documentan hiperparametros de optimizacion (learning rate, scheduler, warmup, tamano de lote efectivo, precision de computo), ni si se aplicaron tecnicas de RLHF, DPO o decodificacion especulativa. El autor indica que se excluyeron de los datos los repositorios, identificadores de instancia y commits base referenciados por los benchmarks de evaluacion de su estudio y que la comprobacion de contaminacion paso.

## Capacidades

- Generacion de parches de codigo a partir de la descripcion de un issue: es la tarea declarada de entrenamiento (issue-to-patch).
- Razonamiento sobre cambios en repositorios: el dataset de entrenamiento combina issues, commits y parches, por lo que el modelo esta expuesto a la relacion entre descripcion del problema y diff resultante.
- Generacion de codigo general: presumiblemente heredada del modelo base Qwen3.5-9B, aunque no se documenta ni se evalua en la model card.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas.
- Capacidades especiales (modo thinking, vision, audio): no documentadas.
- Longitud de contexto en inferencia: no disponible; el entrenamiento se limito a 1.024 tokens, muy por debajo de lo que suele requerir el analisis de repositorios completos.

## Casos de uso

- Triage automatizado de issues en repositorios publicos: el adaptador puede recibir el texto de un issue y proponer un parche inicial, que un revisor humano valida despues. Es el escenario para el que fue entrenado explicitamente.
- Generacion de pull requests de bajo riesgo: integrado en un bot que abre una rama y un PR con el diff propuesto para tareas repetitivas (correccion de erratas, cambios de API, actualizacion de firmas), con revision humana obligatoria antes del merge.
- Asistente de mantenimiento en pipelines de CI/CD: el modelo puede invocarse como paso de un job que, ante un fallo de test, proponga un parche candidato y lo someta de nuevo a la bateria de tests; solo se aceptaria el cambio si la suite pasa.
- Reproduccion de correcciones a partir de trazas de error: dado un mensaje de excepcion y el fragmento de codigo implicado, generar un parche candidato para el bug, apoyandose en el patron issue-commit-parche visto en el entrenamiento.
- Generacion de tests a partir de un parche: usar el diff como entrada y pedir pruebas unitarias que cubran el cambio, como paso previo a la revision.
- Investigacion en adaptacion eficiente: por su tamano (0,7 GB, 58,2 millones de parametros entrenables) sirve como punto de partida reproducible para estudiar QLoRA en tareas de ingenieria de software, reentrenando o ajustando el adaptador sobre datasets propios.
- Prototipado en hardware de consumo: al requerir solo el coste de inferencia del modelo base cuantizado, permite experimentar con un especialista en parcheo en una unica GPU de gama alta de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona la existencia de "evaluation benchmarks used in this study" y una comprobacion de contaminacion superada, pero no incluye ninguna cifra (SWE-bench, HumanEval, MMLU u otros). Los unicos numeros de rendimiento publicados son de entrenamiento: perdida final de entrenamiento 1,337, perdida de evaluacion 0,9368 -> 0,9100, 40 pasos en 325,6 segundos sobre una RTX 4090.

## Requisitos de hardware

- VRAM para el modelo base en bfloat16/fp16: aproximadamente 18 GB solo en pesos (estimacion aritmetica a partir de ~9.000 millones de parametros), mas cache KV y activaciones; en la practica alrededor de 20-24 GB.
- VRAM con cuantizacion de 8 bits: del orden de 9-10 GB en pesos.
- VRAM con cuantizacion de 4 bits: del orden de 5-6 GB en pesos, con overhead tipico de 7-8 GB en total.
- El adaptador en si ocupa 0,7 GB en disco (repositorio) y anade una carga despreciable en VRAM frente al modelo base.
- GPU recomendadas para bfloat16: A100 40/80 GB, H100, L40S, RTX 4090 (24 GB, al limite, depende de la longitud de contexto y del tamano de lote).
- Cabe en GPU de consumo: si, en RTX 4090 o RTX 3090 con cuantizacion de 8 o 4 bits; en tarjetas de 12 GB (RTX 3060 12 GB, RTX 4070) solo con cuantizacion de 4 bits y contextos cortos.
- Opciones de despliegue: transformers + peft (via de uso documentada por el autor), vLLM o TGI fusionando previamente el adaptador en el modelo base, y llama.cpp/Ollama tras fusionar y convertir a GGUF. Estas ultimas rutas no estan documentadas por el autor y requieren conversion manual.
- Latencia y throughput de inferencia: no disponibles. El unico dato de rendimiento es de entrenamiento (40 pasos, 1.969 muestras, 325,6 s en una RTX 4090).

## Comparativa con modelos similares

No se dispone de resultados de benchmarks del adaptador, por lo que la comparacion es estructural y no de rendimiento. Los datos de los modelos alternativos provienen de su documentacion publica general y no de la busqueda web realizada, que no devolvio resultados tecnicos relevantes.

| Modelo | Desarrollador | Tamano base | Tipo de artefacto | Contexto | Licencia | Benchmarks publicados |
|---|---|---|---|---|---|---|
| wellkilo/qwen3.5-9b-swe-sft | wellkilo | ~9.000 M (estimado) | Adaptador LoRA | no disponible | Apache-2.0 | no |
| Qwen2.5-Coder-7B-Instruct | Alibaba Qwen | 7.000 M | Modelo completo | 128.000 tokens segun su model card | Apache-2.0 | si |
| DeepSeek-Coder-V2-Lite-Instruct | DeepSeek | 16.000 M (MoE, ~2.400 M activos) | Modelo completo | 128.000 tokens segun su model card | Licencia propia de DeepSeek | si |
| CodeLlama-7B-Instruct | Meta | 7.000 M | Modelo completo | 16.000 tokens segun su model card | Licencia comunitaria de Llama 2 | si |

Diferencias estructurales destacables: este adaptador no es desplegable por si solo, requiere el modelo base Qwen3.5-9B, y su entrenamiento se limita a 1.024 tokens de secuencia frente a los 128.000 tokens de los modelos coder de referencia. A cambio, su huella de disco (0,7 GB) y su coste de reentrenamiento (325,6 s en una RTX 4090) son muy inferiores.

## Limitaciones y advertencias

- Volumen de entrenamiento muy reducido: 1.969 muestras y 40 pasos. Es un ajuste ligero, con riesgo alto de sobreajuste al estilo de parche del dataset y baja generalizacion a repositorios, lenguajes o convenciones no representados.
- Longitud de secuencia limitada a 1.024 tokens en entrenamiento. Muchos issues reales, con trazas de error y contexto de repositorio, superan esa longitud, lo que puede degradar la calidad del parche propuesto.
- Ausencia total de benchmarks publicados: no hay datos de tasa de resolucion de issues (por ejemplo, resolve rate en SWE-bench) ni de calidad de codigo. La perdida de evaluacion (0,9100) no es un indicador fiable de exito en la tarea final.
- Riesgo de alucinacion: al generar parches, el modelo puede inventar APIs, nombres de funciones, rutas de archivo o dependencias inexistentes. Todo parche debe pasar revision humana y la suite de tests antes de aplicarse.
- Idiomas no documentados: no se puede confirmar el soporte de castellano ni de otros idiomas distintos del presente en el dataset de entrenamiento.
- Fecha de publicacion inusual (octubre de 2026) y ausencia de validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta. No hay evidencia externa de funcionamiento.
- Licencia: el adaptador se distribuye como Apache-2.0 "siguiendo la licencia del modelo base". Antes de un uso comercial hay que verificar de forma independiente la licencia y los terminos del modelo base Qwen/Qwen3.5-9B y de los repositorios de los que proceden los datos de entrenamiento.
- Procedencia de los datos: el dataset es autoconstruido a partir de issues, commits y parches de repositorios publicos. Aunque el autor declara una comprobacion de contaminacion superada frente a sus benchmarks de evaluacion, no se detalla la composicion de licencias del codigo fuente utilizado.
- Dependencia estricta de la revision del modelo base: la model card fija `c202236235762e1c871ad0ccb60c8ee5ba337b9a`. Cargar el adaptador sobre otra revision puede degradar el resultado.
- No apto como sistema autonomo en produccion sin supervisión: por el tamano del entrenamiento y la falta de evaluacion, debe tratarse como prueba de concepto o como componente asistivo dentro de un flujo con validacion automatica.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/wellkilo/qwen3.5-9b-swe-sft
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Revision del modelo base indicada por el autor: `c202236235762e1c871ad0ccb60c8ee5ba337b9a`
- Paper, blog o repositorio del adaptador: no disponible
- Demo o Space: no disponible
- La busqueda web realizada no devolvio ningun resultado tecnico relacionado con el modelo; los enlaces obtenidos correspondian a medios de informacion general y se han descartado por no ser relevantes.
