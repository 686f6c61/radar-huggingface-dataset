# ThakiCloud/Thaki-MemoryPolicy-vLLM-Ranker

## Resumen

Thaki-MemoryPolicy-vLLM-Ranker es un ranker listwise de aproximadamente 10 000 parametros desarrollado por ThakiCloud que selecciona, de forma offline y antes de arrancar el servidor, una de 15 configuraciones de servicio de vLLM (`--max-num-seqs`, `--max-num-batched-tokens`, `--gpu-memory-utilization` y prefix caching activado o desactivado) para un modelo y una carga de trabajo dados. El modelo no genera texto ni procesa lenguaje natural: es un clasificador tabular que puntua configuraciones a partir de caracteristicas conocidas a priori (arquitectura del modelo servido, longitud de prompt, presupuesto de `max_new_tokens`, ratio de prefijo compartido y concurrencia).

La relevancia del proyecto es metodologica: aborda el problema de autotuning de servidores de inferencia LLM como un problema de learning-to-rank con validacion pre-registrada. Sin embargo, el propio autor declara el estado como research preview y reconoce que no hay mejora significativa sobre la configuracion por defecto de vLLM en el conjunto de test. La evaluacion se limita a 16 escenarios sobre dos modelos (Qwen3-1.7B y Qwen3-4B) en una unica GPU B200, con familias de carga no vistas en entrenamiento.

Arquitectonicamente es un perceptron multicapa muy pequeno (12->128->64->1) con perdida ListNet, entrenado sobre 1440 celdas medidas de un barrido de vLLM 0.28. Se distribuye bajo licencia Apache 2.0 en formato PyTorch, con dependencias minimas (`torch`, `safetensors`, `numpy`) y una latencia de inferencia de unos 0,15 ms en CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP (perceptron multicapa) 12->128->64->1 con perdida ListNet |
| Parametros totales | aproximadamente 10 000 (10K) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no procesa texto; entradas tabulares) |
| Tipos de cuantizacion | no disponible (no se documentan; el modelo es tiny y se ejecuta en CPU) |
| Idiomas soportados | en, ko (segun metadatos; el modelo en si opera sobre caracteristicas numericas) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (repo con `memorypolicy.py` y pesos; tamano de repo 0.0 GB) |

## Arquitectura y entrenamiento

El modelo es un ranker listwise que recibe un vector de estado de 12 dimensiones y produce una puntuacion escalar por cada una de las 15 configuraciones candidatas de vLLM. La perdida es ListNet con temperatura softmax 0.1, optimizador AdamW, 400 epocas y semilla 0. La utilidad objetivo se define como throughput dividido por el mejor del escenario si la configuracion cumple el SLO, y -1 en caso contrario. El SLO exige p95 TTFT <= 3 s, p95 TPOT <= 60 ms, tasa de error <= 1 % y servidor arrancado. Las caracteristicas de entrada son exclusivamente informacion conocida antes de ejecutar: tamano de pesos, numero de capas, hidden size, bytes de KV por token, longitud de prompt, presupuesto de salida, ratio de prefijo compartido especificado y concurrencia.

El entrenamiento se realizo sobre 1440 celdas medidas con un servidor privado de vLLM 0.28 en una GPU B200, barriendo 15 configuraciones x 6 familias de carga sintetica x 4 niveles de concurrencia x 4 modelos (Qwen3-0.6B, 1.7B, 4B y 8B). Los prompts son secuencias de token-ids aleatorios con un prefijo compartido fijo, sin trafico de produccion ni prompts de usuario. Los splits se hacen a nivel de escenario: train con chat, rag y longgen; dev con summarize para seleccion de modelo; test con agent y codeassist. Una version anterior (v1) fue descartada por fuga de informacion (incluia metricas post-ejecucion como KV usage, longitud de cola, hit rate de prefijo y TTFT/TPOT), y el codigo de entrenamiento actual rechaza ejecutarse si algun campo prohibido aparece como entrada o si el vector de estado difiere entre candidatos del mismo escenario.

## Capacidades

- Seleccion offline de configuracion de vLLM: recomienda una de 15 combinaciones de `--max-num-seqs`, `--max-num-batched-tokens`, `--gpu-memory-utilization` y prefix caching.
- Puntuacion de todas las configuraciones candidatas mediante `mp.scores(...)`, no solo la mejor.
- Extraccion de caracteristicas de arquitectura desde el `config.json` de HuggingFace y el tamano de los pesos (`arch_from_hf_config`).
- Inferencia muy rapida: aproximadamente 0,15 ms en CPU, sin GPU necesaria.
- Dependencias minimas: `torch`, `safetensors`, `numpy`.
- No realiza generacion de texto, razonamiento, codigo, matematicas ni vision.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingues: no aplica al modelo; los metadatos declaran en y ko para la documentacion.

## Casos de uso

- Autotuning offline de servidores vLLM en laboratorio: dado un modelo y una carga disenada, obtener una configuracion inicial antes de arrancar el servidor, evitando barridos manuales costosos. Adecuado porque el modelo solo requiere caracteristicas conocidas a priori.
- Exploracion de espacio de configuracion en pipelines de evaluacion: usar `mp.scores(...)` para priorizar que configuraciones medir primero en un barrido real, reduciendo el numero de jobs de servidor necesarios.
- Investigacion en learning-to-rank aplicado a sistemas: servir como baseline reproducible para comparar con heuristicas o modelos tipo LightGBM en el problema de seleccion de configuracion de serving.
- Prototipado de herramientas de "config advisor" para equipos de plataforma: integrar la recomendacion en scripts de despliegue que generen los `vllm_args` iniciales para un modelo nuevo.
- Docencia y divulgacion sobre serving de LLM: ejemplo compacto (10K parametros) de como formular el autotuning de vLLM como un problema de ranking con SLO y regret.
- Validacion de contratos de entrada: usar el chequeo de `arch_from_hf_config` para verificar que las caracteristicas de arquitectura (capas, hidden size, KV por token) se extraen correctamente antes de un barrido.
- No recomendado como politica de serving en produccion: el propio autor lo declara research preview y sin mejora significativa sobre el default.

## Benchmarks y rendimiento

Conjunto de desarrollo (summarize, usado para seleccion de modelo; incluye optimismo de seleccion):

| Politica | Violacion SLO | Fallo | Goodput tok/s | Regret vs oraculo |
|---|---|---|---|---|
| vLLM default | 0.5625 | 0.375 | 593 | 0.194 |
| Heuristica | 0.500 | 0.125 | 682 | 0.024 |
| LightGBM (clasificador + regresor) | 0.375 | 0.000 | 1049 | 0.0091 |
| Este modelo (MLP ranker) | 0.375 | 0.000 | 1054 | 0.0063 |

Conjunto de test (16 escenarios, evaluado una sola vez; familias de carga no vistas, modelos 1.7B y 4B vistos en entrenamiento):

| Politica | Violacion SLO | Fallo | tok/s medio | Goodput tok/s | Ratio de throughput (ambos SLO ok) | p95 del p95 TTFT por escenario |
|---|---|---|---|---|---|---|
| vLLM default | 0.250 | 0.000 | 9483 | 5343 | 1.000 | 10.78 s |
| Heuristica | 0.250 | 0.000 | 8172 | 4090 | 0.765 | no disponible |
| Este modelo (MLP ranker) | 0.250 | 0.000 | no disponible | 5343 + 26.0 observado (bootstrap +26.6, IC 95 % [-17.0, +77.7]) | no disponible | 12.99 s |

En test, el ranker iguala al default en violacion de SLO (delta 0.0, IC 95 % [0, 0]) y mejora el goodput en +26.0 tok/s observado (bootstrap +26.6, IC 95 % [-17.0, +77.7]) y el throughput en +19.0 tok/s (bootstrap +20.4, IC 95 % [-82.8, +119.9]); ninguno de los intervalos excluye cero. Los seis gates pre-registrados pasaron, pero exigen "no peor que el default", por lo que el resultado es paridad, no mejora. La cola empeora: p95 del p95 TTFT por escenario es 12.99 s frente a 10.78 s del default.

## Requisitos de hardware

- VRAM para inferencia: practicamente nula; el modelo (aproximadamente 10K parametros) se ejecuta en CPU con unos 0,15 ms por inferencia.
- GPU recomendadas: no requiere GPU. La GPU B200 aparece solo en el entorno de generacion de datos de entrenamiento, no en la inferencia del ranker.
- Cabe en cualquier GPU consumer y en CPU sin problema.
- Opciones de despliegue: script Python directo (`memorypolicy.py`) con `torch`, `safetensors` y `numpy`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (el modelo recomienda configuracion de vLLM, no sirve inferencia LLM).
- Latencia y throughput: aproximadamente 0,15 ms en CPU por recomendacion; el throughput del servidor vLLM resultante depende del modelo servido y de la carga, no del ranker.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento en test | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Thaki-MemoryPolicy-vLLM-Ranker | MLP ranker listwise | aproximadamente 10K | no aplica | Paridad con default en SLO; goodput +26 tok/s (IC incluye 0) | Apache 2.0 | HuggingFace |
| Heuristica (baseline del autor) | Reglas | 0 | no aplica | Violacion SLO 0.250; throughput ratio 0.765 | no disponible | En la model card |
| LightGBM (baseline del autor) | Clasificador + regresor | no disponible | no aplica | Solo evaluado en dev (goodput 1049, regret 0.0091) | no disponible | En la model card |
| vLLM default | Configuracion fija | 0 | no aplica | Violacion SLO 0.250; p95 p95 TTFT 10.78 s | Apache 2.0 (vLLM) | vLLM |

No se identifican en la informacion disponible otros rankers publicos de configuracion de vLLM comparables.

## Limitaciones y advertencias

- Estado research preview: el autor declara explicitamente que no hay mejora significativa sobre la configuracion por defecto de vLLM.
- Evaluacion exclusivamente offline: cada candidato se midio en un servidor nuevo; no se probo el cambio de configuracion en un servidor en vivo.
- Generalizacion limitada: el test cubre dos modelos vistos en entrenamiento (Qwen3-1.7B y 4B) y dos familias de carga no vistas; no se evalua generalizacion a modelos nuevos.
- Cola peor: el p95 del p95 TTFT por escenario es 12.99 s frente a 10.78 s del default.
- Datos de entrenamiento sinteticos: prompts de token-ids aleatorios con prefijo fijo, sin trafico de produccion, sin prompts de usuario y sin logs operativos.
- Entrada `prefix_share_spec` debe ser el ratio disenado de la carga, no una tasa de hit de cache medida; usarla mal invalida la recomendacion.
- Concurrencia cubierta: 4 a 256; fuera de ese rango la recomendacion no esta validada.
- Una version anterior (v1) quedo invalidada por fuga de informacion; sus resultados no deben usarse como evidencia.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero el ranker puede recomendar configuraciones suboptimas fuera de su distribucion de entrenamiento.
- Sesgos conocidos: la distribucion sintetica de cargas puede no reflejar la de produccion real (mezcla de longitudes, patrones de prefijo, rafagas).
- Licencia Apache 2.0 permite uso comercial, pero el estado research preview y la falta de mejora demostrada desaconsejan su uso en produccion sin validacion propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ThakiCloud/Thaki-MemoryPolicy-vLLM-Ranker
- Tarjeta en coreano: https://huggingface.co/ThakiCloud/Thaki-MemoryPolicy-vLLM-Ranker/blob/main/MODEL_CARD.ko.md
- vLLM (servidor de referencia): https://github.com/vllm-project/vllm
- Paper de ListNet (perdida de ranking): https://doi.org/10.1145/1273496.1273567
- Repositorio de Qwen3 (modelos usados en entrenamiento y test): https://huggingface.co/Qwen
