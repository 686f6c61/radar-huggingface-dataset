# tjwjdgns011119/seal-5comp-e1-extra-v2-t15-heads-best-20261112

## Resumen

SEAL E1-extra v2 es un conjunto de doce TaskNets de cinco componentes entrenados con arquitectura graph-transformer para una tarea muy concreta de diseno de circuitos: predecir el ciclo de trabajo (duty) de una señal a partir de un grafo que representa el circuito. Lo publica el usuario tjwjdgns011119 en Hugging Face, sin pipeline declarado, sin licencia explicita y sin idiomas indicados. No es un modelo de lenguaje generalista: es un artefacto de investigacion orientado a un dominio de ingenieria electronica.

El repositorio contiene doce checkpoints que combinan dos cabezas de salida (`scaled_sigmoid` y `sigmoid01`), dos metodos de entrenamiento (MSE puro y SEAL con `utility_weight=0.5`) y tres semillas (11, 22, 33). Todos se entrenaron sobre la cohorte `t15_span002` con quince valores objetivo de gamma vistos durante el entrenamiento, y se seleccionaron maximizando una utilidad de validacion predicha por una red auxiliar (Loss-Net), no mediante simulacion directa en NGSpice.

La relevancia es acotada: se trata de un experimento reproducible sobre seleccion de checkpoints guiada por utilidad y sobre el efecto de la funcion de perdida SEAL frente a MSE en una tarea de regresion fisica. El tamano del repositorio es de 0.0 GB segun Hugging Face, lo que sugiere pesos muy pequenos o metadatos sin binarios completos indexados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Graph transformer (EarlyFusionMatchedSupportTaskGTN), 5 componentes por TaskNet |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; opera sobre grafos) |
| Tipos de cuantizacion | no disponible (pesos en safetensors float, sin variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (no aplica; tarea de regresion numerica) |
| Licencia | no disponible (el autor indica que no asigna licencia nueva) |
| Formato de pesos | safetensors y `checkpoint.pt` original (PyTorch) |

## Arquitectura y entrenamiento

La arquitectura es un graph transformer con fusion temprana (`EarlyFusionMatchedSupportTaskGTN`) que procesa un `GraphBatch` construido con `collate_graphs(arrays, raw_gamma_targets)`, aplicando internamente una normalizacion `gamma/3`. Cada TaskNet tiene cinco componentes y dos cabezas de salida posibles: `scaled_sigmoid`, que calcula `0.1 + 0.8 * sigmoid(z)` y restringe la salida a [0.1, 0.9], y `sigmoid01`, que aplica `sigmoid(z)` sin recorte ni reescalado, con rango [0, 1].

El entrenamiento se realizo sobre la cohorte `t15_span002`, filtrada por Utility span >= 0.02, con quince valores de gamma objetivo vistos: -3, -2.4, -1.8, -1.2, -0.6, 0.1, 0.3, 0.5, 0.7, 0.9, 1.4, 1.8, 2.2, 2.6 y 3. Doce valores adicionales (-2.7, -2.1, -1.5, -0.9, 0.2, 0.4, 0.6, 0.8, 1.6, 2, 2.4, 2.8) se reservaron como heldout y no se usaron ni para entrenamiento ni para seleccion. La variante SEAL anade `utility_weight=0.5` a la perdida MSE. La seleccion de checkpoint se hizo cada 10 epocas entre 800 y 4000, maximizando la utilidad de validacion predicha por Loss-Nets, con desempate por la epoca mas temprana. Los Loss-Nets fisicos emparejados no se incluyen en el repositorio; para inferencia del TaskNet solo se necesita el TaskNet.

## Capacidades

- Regresion de duty (ciclo de trabajo) sobre grafos de circuitos, con salida en [0.1, 0.9] o [0, 1] segun la cabeza.
- Procesamiento de grafos con fusion temprana y soporte matcheado, mediante la clase `EarlyFusionMatchedSupportTaskGTN`.
- Dos cabezas de salida intercambiables que comparten nombres de parametros, lo que permite cargar cualquiera de los doce checkpoints con el mismo codigo.
- Seleccion de checkpoint basada en utilidad predicha por Loss-Net, documentada con epoch, global step y valor de utilidad por checkpoint.
- Carga en PyTorch mediante `safetensors.torch.load_file` con `strict=True`, y trazabilidad de linaje en `bundle.json` con hashes de procedencia.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni capacidades multilingues; no es un modelo de lenguaje.

## Casos de uso

- Investigacion en seleccion de modelos: comparar MSE frente a SEAL con `utility_weight=0.5` manteniendo fijas arquitectura, cohorte y semillas, usando los doce checkpoints como replicas controladas.
- Estudio de sensibilidad a la semilla: los pares seed 11/22/33 permiten medir varianza en utilidad predicha (por ejemplo, `scaled_sigmoid`/seal varia de 0.397589 a 0.414660 entre semillas).
- Analisis de extrapolacion de la cabeza `sigmoid01`: util para cuantificar el error cuando la prediccion cae fuera del rango [0.1, 0.9] en el que se entrenaron los Loss-Nets.
- Prototipado de surrogate models para diseno analogico: sustituir temporalmente una simulacion NGSpice por el TaskNet en bucles de optimizacion exploratoria, asumiendo el sesgo de seleccion por utilidad predicha.
- Validacion de pipelines de graph transformer en dominios fisicos: servir como caso de prueba reproducible para `collate_graphs`, carga de safetensors y evaluacion por lotes.
- Reproduccion de linaje y auditoria: `bundle.json` y los metadatos de seleccion permiten reconstruir que checkpoint se eligio, con que criterio y en que epoca, util en revisiones internas de experimentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es la utilidad de validacion predicha por Loss-Net usada para seleccion:

| Cabeza | Metodo | Semilla | Epoca | Global step | Utilidad predicha |
|---|---|---:|---:|---:|---:|
| scaled_sigmoid | mse | 11 | 3110 | 108850 | 0.383663 |
| scaled_sigmoid | seal | 11 | 3730 | 130550 | 0.398890 |
| scaled_sigmoid | mse | 22 | 3400 | 119000 | 0.402074 |
| scaled_sigmoid | seal | 22 | 1190 | 41650 | 0.414660 |
| scaled_sigmoid | mse | 33 | 1030 | 36050 | 0.390151 |
| scaled_sigmoid | seal | 33 | 800 | 28000 | 0.397589 |
| sigmoid01 | mse | 11 | 810 | 28350 | 0.376713 |
| sigmoid01 | seal | 11 | 1060 | 37100 | 0.408237 |
| sigmoid01 | mse | 22 | 3120 | 109200 | 0.400980 |
| sigmoid01 | seal | 22 | 960 | 33600 | 0.401404 |
| sigmoid01 | mse | 33 | 800 | 28000 | 0.385261 |
| sigmoid01 | seal | 33 | 930 | 32550 | 0.392319 |

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio ocupa 0.0 GB y no se publica el numero de parametros, por lo que no puede calcularse una cota fiable.
- GPU recomendadas: no disponible. Al ser un graph transformer de cinco componentes, es probable que quepa en GPUs consumer, pero no hay datos publicados que lo confirmen.
- Compatibilidad con GPU consumer: no confirmada.
- Opciones de despliegue: inferencia en PyTorch con el paquete `seal_single_duty` y `safetensors`; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de graph transformer para prediccion de duty en diseno de circuitos con los que establecer una comparacion de parametros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- La seleccion de checkpoint se basa en utilidad de validacion predicha por Loss-Net, no en simulacion directa en NGSpice; el autor lo advierte explicitamente.
- La cohorte de validacion usada para seleccion solapa con contextos de evaluacion vistos, por lo que los resultados "seen" no constituyen una estimacion independiente de holdout.
- Los Loss-Nets se entrenaron con duties en [0.1, 0.9]; las predicciones de `sigmoid01` fuera de ese rango son extrapolaciones sin garantia.
- Los doce valores de gamma heldout no se usaron para entrenamiento ni seleccion, pero tampoco se reportan resultados sobre ellos.
- Los Loss-Nets fisicos emparejados no se incluyen en el repositorio, lo que impide reproducir el criterio de seleccion sin material adicional.
- Los ficheros `.pt` originales conservan estado de entrenamiento y rutas locales originales; los metadatos JSON omiten esas rutas.
- No se asigna licencia nueva: el autor indica que se preservan nombres de paquete y linaje del checkpoint original, lo que deja el uso comercial sin marco claro.
- No hay informacion sobre sesgos, idiomas ni riesgos de alucinacion porque el modelo no genera texto; el riesgo equivalente es la prediccion fisica incorrecta fuera de distribucion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion externa conocida.

## Enlaces

- Hugging Face: https://huggingface.co/tjwjdgns011119/seal-5comp-e1-extra-v2-t15-heads-best-20261112
- Paquete requerido para inferencia: `seal_single_duty` (clase `EarlyFusionMatchedSupportTaskGTN` en `seal_single_duty.models.gtn`); no se proporciona URL en la informacion disponible.
- Paper, blog, repositorio de codigo o demo: no disponibles.
