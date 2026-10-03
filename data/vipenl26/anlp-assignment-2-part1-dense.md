# vipenl26/anlp-assignment-2-part1-dense

## Resumen

`vipenl26/anlp-assignment-2-part1-dense` es un checkpoint de un transformer causal de tipo decoder-only implementado en PyTorch de forma personalizada, publicado por el usuario vipenl26 como parte de la Assignment 2 de un curso de Procesamiento de Lenguaje Natural Avanzado (ANLP). No se trata de un modelo de proposito general ni de un lanzamiento de un laboratorio: es un artefacto academico cuyo objetivo es servir de linea base densa (MLP de dos capas en el bloque feed-forward) frente a variantes con mezcla de expertos u otras modificaciones dentro del mismo ejercicio.

El repositorio pesa 0,2 GB e incluye el checkpoint `checkpoint.pt` (pesos, estado del optimizador, configuracion del modelo y metadatos de entrenamiento), ademas de `config.json`, `tokenizer.json` y `metadata.json`. La carga del modelo requiere el codigo fuente del curso, concretamente la funcion `src.training.load_checkpoint` y la arquitectura `src.part1.model.Transformer`, por lo que no es un checkpoint directamente compatible con `transformers`, `vLLM` o `llama.cpp`.

Su relevancia es limitada fuera del ambito docente: sirve para reproducir resultados de la asignatura, comparar variantes arquitectonicas y auditar el pipeline de entrenamiento del curso. No hay informacion publica sobre numero de parametros, datos de entrenamiento, licencia ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only personalizado en PyTorch, con MLP denso de dos capas en el feed-forward |
| Parametros totales | no disponible |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (definida en `config.json` del repositorio) |
| Tipos de cuantizacion | no disponible; el checkpoint se distribuye en punto flotante PyTorch |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card no especifica licencia) |
| Formato de pesos | `.pt` (checkpoint PyTorch con pesos, estado del optimizador, configuracion y metadatos de entrenamiento) |
| Tokenizador | `tokenizer.json` incluido; algoritmo y tamano de vocabulario no disponibles |
| Tamano del repositorio | 0,2 GB |
| Fecha de publicacion | 3 de octubre de 2026 (creacion); ultima actualizacion el mismo dia |

## Arquitectura y entrenamiento

La model card indica que se trata de un transformer causal entrenado desde cero en PyTorch, con una arquitectura propia definida en `src.part1.model.Transformer`. La variante "dense" se corresponde con el bloque feed-forward clasico: un MLP denso de dos capas, sin enrutamiento condicional ni mezcla de expertos. Es, por tanto, la linea base sobre la que se comparan las demas variantes de la Assignment 2. El checkpoint almacena tambien el estado del optimizador y los metadatos de entrenamiento, lo que sugiere que fue guardado como punto de reanudacion del entrenamiento y no solo como pesos finales para inferencia.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de tecnicas de alineacion (RLHF, DPO, SFT) ni innovaciones tecnicas adicionales. La model card remite a `metadata.json` para las versiones de ejecucion y los resultados de evaluacion medidos, pero esos datos no forman parte de la informacion proporcionada.

## Capacidades

- Generacion de texto autoregresiva: es un modelo causal, por lo que su funcion basica es la continuacion y generacion de texto token a token.
- Modelo de linea base: su utilidad principal es servir de referencia en comparaciones controladas frente a otras variantes del mismo ejercicio (por ejemplo, variantes con MoE o con otros esquemas de feed-forward).
- Reproduccion de experimentos: permite recargar el estado del optimizador y continuar o replicar el entrenamiento con el codigo del curso.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; se desconoce el corpus de entrenamiento.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Alineacion instruccional: no disponible; no hay evidencia de ajuste por instrucciones.

## Casos de uso

- Reproduccion academica de la Assignment 2: cargar `checkpoint.pt` con `src.training.load_checkpoint` y verificar las metricas documentadas en `metadata.json` para validar la implementacion propia.
- Linea base en experimentos comparativos: usar esta variante densa como referencia contra las variantes alternativas del mismo ejercicio, manteniendo constantes tokenizador y datos.
- Material docente: ilustrar como se estructura un transformer decoder-only minimo, incluyendo el guardado y la recarga de estado del optimizador, en un curso de NLP.
- Pruebas de pipelines de carga de checkpoints: validar herramientas internas de serializacion, versionado y restauracion de modelos en formato `.pt` antes de aplicarlas a modelos mayores.
- Investigacion sobre eficiencia de arquitecturas: cuantificar la diferencia de coste y calidad entre un MLP denso y alternativas con enrutamiento condicional a igualdad de datos y presupuesto de computo.
- Experimentos de decodificacion: al ser un modelo pequeno, es adecuado para probar estrategias de muestreo (temperatura, top-k, top-p, beam search) con coste minimo.
- Analisis de tokenizacion: estudiar el comportamiento del tokenizador incluido (`tokenizer.json`) sobre corpus propios sin necesidad de GPU de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card menciona que `metadata.json` contiene "resultados de evaluacion medidos" y las versiones de ejecucion, pero esos valores no se han incluido en los datos facilitados. No se deben asumir cifras de MMLU, HumanEval, GSM8K ni de cualquier otra suite para este checkpoint.

## Requisitos de hardware

- VRAM estimada: no disponible de forma exacta, ya que se desconoce el numero de parametros. Como referencia, el repositorio completo ocupa 0,2 GB e incluye pesos y estado del optimizador; el estado del optimizador suele multiplicar por dos o tres el tamano de los pesos en Adam, por lo que los pesos en punto flotante de 32 bits son previsiblemente de decenas o pocos cientos de megabytes.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM deberia ser suficiente para inferencia. Una RTX 3060, RTX 4060 o superior es probablemente mas que suficiente.
- GPU de consumo: si, con alta probabilidad cabe en cualquier GPU de consumo reciente e incluso podria ejecutarse en CPU para inferencia de baja carga.
- Opciones de despliegue: `vLLM`, `llama.cpp`, `Ollama` y `TGI` no son compatibles directamente, ya que el checkpoint usa una arquitectura personalizada y requiere el codigo del curso (`src.part1.model.Transformer`). La unica via documentada es cargarlo con PyTorch y el codigo fuente de la asignatura.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `vipenl26/anlp-assignment-2-part1-dense` | Transformer causal decoder-only con MLP denso de 2 capas (PyTorch propio) | no disponible | no disponible | no disponible | HuggingFace, requiere codigo del curso |
| `neemon/anlp-a2-part1-dense` | Transformer decoder-only con MLP denso de 2 capas (linea base del mismo ejercicio) | no disponible | no disponible | no disponible | HuggingFace |
| `karma-skz/anlp-assignment2-part1-m1-dense` | Variante densa de la Assignment 2 | no disponible | no disponible | no disponible | HuggingFace |

Los tres checkpoints pertenecen a la misma familia de ejercicios academicos y son comparables en naturaleza, pero no hay datos publicos de parametros, contexto ni rendimiento que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Ausencia de licencia: la model card no especifica licencia, por lo que el uso comercial o la redistribucion quedan en una situacion legal indeterminada. Conviene contactar con el autor antes de cualquier uso fuera del ambito academico.
- Dependencia de codigo externo: el modelo no se puede cargar con las librerias estandar; requiere `src.training.load_checkpoint` y `src.part1.model.Transformer` del repositorio del curso.
- Origen academico: es un artefacto de una asignatura, sin validacion externa ni proceso de publicacion asociado.
- Riesgo de alucinacion: no disponible, pero al no haber informacion sobre datos de entrenamiento ni alineacion, no puede descartarse un comportamiento degenerado o repetitivo en generacion libre.
- Sesgos conocidos: no disponibles; se desconoce la composicion del corpus de entrenamiento.
- Limitaciones de contexto e idioma: no disponibles. La longitud de contexto esta definida en `config.json`, que no se ha facilitado.
- Ausencia de benchmarks: no hay ninguna cifra publica de calidad que permita estimar su utilidad real mas alla de la reproduccion de experimentos.
- Cero adopcion: el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, por lo que no existe una comunidad que haya validado su funcionamiento.
- Advertencia de seguridad al cargar: los checkpoints `.pt` de PyTorch pueden contener codigo arbitrario si no se cargan con `weights_only=True`; conviene auditar el fichero antes de deserializarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vipenl26/anlp-assignment-2-part1-dense
- Checkpoint hermano (misma Assignment 2, variante densa): https://huggingface.co/neemon/anlp-a2-part1-dense
- Checkpoint hermano (misma Assignment 2, variante densa): https://huggingface.co/karma-skz/anlp-assignment2-part1-m1-dense
- Pagina de assignments del curso CMU ANLP: http://cmu-anlp.org/assignments/
- Repositorio de codigo del curso (referencia, no confirmado como el usado por este autor): https://deepwiki.com/cmu-l3/anlp-spring2026-code
- Calendario de lanzamientos de modelos de IA (referencia general): https://www.scriptbyai.com/ai-model-release-calendar/
