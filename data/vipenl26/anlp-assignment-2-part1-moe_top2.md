# vipenl26/anlp-assignment-2-part1-moe_top2

## Resumen

`vipenl26/anlp-assignment-2-part1-moe_top2` es un checkpoint de PyTorch publicado en HuggingFace por el usuario `vipenl26` como parte de la "ANLP Assignment 2" (parte 1). Según su model card, se trata de un transformer causal escrito desde cero en PyTorch, entrenado para dicha asignatura, y el propio nombre del repositorio indica que incorpora una capa de mezcla de expertos (MoE) con enrutamiento top-2. No es un modelo publicado por un laboratorio ni un lanzamiento de producción: es material académico, y la información pública sobre él se limita a la model card y a la lista de ficheros del repositorio.

El repositorio ocupa 0,2 GB y contiene `checkpoint.pt`, `config.json`, `tokenizer.json` y `metadata.json`. El checkpoint no solo almacena pesos: incluye también el estado del optimizador, la configuración del modelo y metadatos de entrenamiento, lo que indica que está pensado para poder reanudar o reproducir el entrenamiento, no solo para inferencia. La carga requiere el código fuente de la asignatura, concretamente `src.training.load_checkpoint` y la arquitectura `src.part1.model.Transformer`, que es una implementación propia y no una arquitectura estándar de HuggingFace Transformers.

Su relevancia es fundamentalmente didáctica y de investigación: sirve como ejemplo reproducible de enrutamiento MoE top-2 sobre un transformer causal, y como banco de pruebas para experimentos de balanceo de expertos, ablaciones de enrutamiento y análisis de checkpoint. No se declara licencia, idiomas, pipeline ni resultados de evaluación, y el modelo acumula 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal con mezcla de expertos (MoE) y enrutamiento top-2, implementado desde cero en PyTorch (`src.part1.model.Transformer`); el prefijo MoE se deduce del identificador del repositorio y de la model card |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (el nombre indica enrutamiento top-2, pero no se especifica el número de expertos ni el tamaño activo) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; solo se distribuye un checkpoint en precisión de entrenamiento (`checkpoint.pt`), sin versiones GGUF, GPTQ, AWQ ni FP8 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (no se declara licencia en el repositorio) |
| Formato de pesos | PyTorch checkpoint (`.pt`) que contiene pesos del modelo, estado del optimizador, configuración y metadatos de entrenamiento |
| Tokenizador | `tokenizer.json` en formato de la librería `tokenizers` de HuggingFace; vocabulario y política de tokenización no disponibles |
| Tamaño del repositorio | 0,2 GB |
| Fecha de creación | 2026-10-03 |
| Última actualización | 2026-10-03 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card describe un "custom PyTorch causal transformer", es decir, un transformer autorregresivo con atención causal implementado a mano, sin depender de `transformers`. El identificador del repositorio (`moe_top2`) y el propio README indican que la arquitectura incorpora una capa MoE con enrutamiento top-2, en la que cada token se envía a los dos expertos de mayor puntuación según el router. No se especifica el número de expertos, la dimensión de las capas, el número de cabezas de atención, la función de activación de los expertos ni la política de normalización de los pesos del router, por lo que no es posible reconstruir la topología exacta a partir de la información disponible.

Tampoco hay datos sobre el corpus de entrenamiento: se desconoce el número de tokens, la composición del dataset, si hubo fases de ajuste fino con RLHF, DPO o instrucciones, y qué función de pérdida auxiliar se usó para el balanceo de carga entre expertos (un componente habitual en los MoE). El hecho de que el checkpoint incluya el estado del optimizador sugiere un entrenamiento con un optimizador con estado acumulado (típicamente Adam o AdamW), pero esto no se confirma en la documentación. Los resultados de evaluación medidos se encontrarían, según la model card, en `metadata.json`, fichero cuyo contenido no forma parte de la información proporcionada.

## Capacidades

- Generación de texto autorregresiva: es la capacidad básica derivable de un transformer causal entrenado con objetivo de modelado de lenguaje; no hay confirmación documental explícita.
- Enrutamiento MoE top-2: la arquitectura activa dos expertos por token, lo que permite estudiar el reparto de carga entre expertos y comparar configuraciones de enrutamiento.
- Reanudación de entrenamiento: al incluir estado del optimizador y metadatos, el checkpoint permite continuar el entrenamiento o inspeccionar su estado.
- Tool calling / function calling: no disponible; no hay plantilla de chat ni documentación al respecto.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; se desconoce el corpus de entrenamiento y el vocabulario.
- Capacidades especiales (modo de razonamiento, visión, audio): no disponibles; no hay indicios de soporte multimodal.
- Ajuste fino posterior: al ser un checkpoint de PyTorch con arquitectura propia, se puede ajustar con el código fuente de la asignatura, no con las utilidades estándar de `transformers`.

## Casos de uso

- Docencia y reproducción de prácticas de MoE: el checkpoint permite cargar un modelo ya entrenado con enrutamiento top-2 y comparar sus resultados con variantes top-1 o con distintas configuraciones de expertos, usando `src.training.load_checkpoint` del código de la asignatura.
- Análisis de balanceo de expertos: instrumentando el router se puede medir la distribución de tokens por experto, detectar colapso de expertos (expert collapse) y estudiar el efecto de la pérdida auxiliar de balanceo.
- Ablaciones de enrutamiento: sirve como punto de partida para comparar top-1, top-2 y top-k con distintos valores de k, manteniendo constantes los datos y el presupuesto de cómputo.
- Evaluación de infraestructura de inferencia para MoE: al ser un modelo pequeño, permite perfilar latencia, memoria y patrones de acceso a memoria de un forward con enrutamiento disperso en una GPU consumer antes de escalar a modelos MoE mayores.
- Base para ajuste fino en una tarea concreta: partiendo del checkpoint y del código de entrenamiento se puede especializar el modelo en una tarea de generación o clasificación, teniendo en cuenta que se desconoce el rendimiento de partida.
- Reanudación de entrenamientos largos: el estado del optimizador incluido permite retomar un entrenamiento interrumpido sin reiniciar la dinámica de optimización, útil en entornos con presupuesto de GPU limitado.
- Estudio de tokenizadores: el fichero `tokenizer.json` permite analizar el vocabulario construido para la práctica y comparar su cobertura con tokenizadores de modelos abiertos de tamaño similar.

En todos los casos anteriores el requisito previo es disponer del código fuente de la asignatura; el repositorio de HuggingFace no incluye por sí solo un cargador compatible con las herramientas estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que los resultados de evaluación medidos se encuentran en `metadata.json`, pero ese contenido no se ha facilitado. No se dispone, por tanto, de cifras de MMLU, HumanEval, GSM8K, perplexity ni de ninguna otra métrica, ni de datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión. A partir del tamaño del repositorio (0,2 GB) y del hecho de que el checkpoint incluye estado del optimizador —lo que multiplica el tamaño por parámetro respecto a los pesos en solitario—, cabe estimar que el modelo está en el orden de decenas de millones de parámetros o menos, pero es una estimación no confirmada.
- GPU recomendadas: no disponible. Si la estimación anterior es correcta, cualquier GPU con al menos 2 GB de VRAM sería suficiente, e incluso la inferencia en CPU sería viable.
- GPU consumer: probablemente sí cabe en cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) e incluso en hardware integrado, siempre que la estimación de tamaño sea correcta; no hay confirmación oficial.
- Opciones de despliegue: no disponible en el sentido habitual. Al usar una arquitectura propia y un checkpoint `.pt`, no es compatible directamente con vLLM, llama.cpp, Ollama, TGI ni text-generation-inference. La única vía documentada es cargar el modelo con `src.training.load_checkpoint` del código de la asignatura.
- Cuantización para despliegue: no disponible; no se distribuyen pesos GGUF ni versiones cuantizadas, y una eventual conversión requeriría adaptar el grafo de la arquitectura propia.
- Latencia y throughput: no disponibles. No hay mediciones publicadas.

## Comparativa con modelos similares

No hay base para una comparación de rendimiento: este checkpoint no publica métricas, no declara número de parámetros ni contexto, y su licencia es desconocida. La tabla siguiente es una comparación nominal de categoría (modelos con mezcla de expertos de tamaño pequeño o medio) y no implica equivalencia funcional ni de calidad; los datos de los modelos de referencia provienen de sus respectivas documentaciones públicas.

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `vipenl26/anlp-assignment-2-part1-moe_top2` | no disponible | no disponible (top-2 confirmado por el nombre) | no disponible | no disponible | Checkpoint `.pt` con arquitectura propia; requiere código de la asignatura |
| OLMoE-1B-7B | 6,9 B | 1,3 B (64 expertos, top-8) | 4.096 tokens | Apache 2.0 | Pesos abiertos en HuggingFace, compatible con `transformers` |
| Mixtral 8x7B | 46,7 B | 12,9 B (8 expertos, top-2) | 32.768 tokens | Apache 2.0 | Pesos abiertos en HuggingFace, compatible con `transformers` y vLLM |

## Limitaciones y advertencias

- Ausencia de licencia: al no declararse licencia, no hay autorización explícita de uso comercial ni de redistribución; en la práctica el modelo debe tratarse como material académico sin garantías jurídicas de reutilización.
- Resultados de evaluación no publicados: no hay ninguna métrica verificable, por lo que no se puede afirmar nada sobre su calidad de generación, su tendencia a la alucinación ni su competencia en tareas concretas.
- Corpus de entrenamiento desconocido: se desconoce la composición del dataset, lo que impide evaluar sesgos, toxicidad, cobertura idiomática o posibles contaminaciones con datos de evaluación.
- Riesgo de alucinación: inherente a cualquier modelo de lenguaje autorregresivo; en un modelo pequeño y entrenado con un presupuesto limitado, el riesgo relativo es probablemente mayor, aunque no hay datos que lo cuantifiquen.
- Compatibilidad limitada: al no seguir la interfaz de `transformers`, no funciona con utilidades estándar de carga, cuantización, servidores de inferencia ni plantillas de chat.
- Ausencia de plantilla de chat y de ajuste por instrucciones: no hay evidencia de fases de SFT, RLHF o DPO, por lo que cabe esperar que solo sea útil como modelo base de continuación de texto.
- Contexto y idiomas desconocidos: sin datos sobre la ventana de contexto ni sobre el vocabulario, no se puede planificar su uso en documentos largos ni en producción multilingüe.
- Checkpoint con estado del optimizador: el fichero incluye más información que los pesos, lo que aumenta el tamaño en disco y requiere cuidado al redistribuirlo o al cargarlo en modo solo inferencia.
- Idoneidad para producción: no recomendado; es un artefacto de una práctica académica, sin garantías de mantenimiento, soporte ni versionado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vipenl26/anlp-assignment-2-part1-moe_top2
- Ficheros referenciados en la model card: `checkpoint.pt`, `config.json`, `tokenizer.json`, `metadata.json` (disponibles en el repositorio anterior)
- Repositorio del código de la asignatura (`src.training.load_checkpoint`, `src.part1.model.Transformer`): no disponible, no se enlaza en la información proporcionada
- Paper asociado: no disponible
- Blog o demo: no disponible
