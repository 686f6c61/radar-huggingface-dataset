# tokenosopher/populus-evidence-partitioning-checkpoints

## Resumen

El repositorio `tokenosopher/populus-evidence-partitioning-checkpoints` contiene los checkpoints finales del trabajo de investigación titulado **"What You Can't See Is What You Learn: Restricted Evidence Visibility Favors Compositional Generalization in Shared-Genome Language-Model Societies"** (Narcis Marincat, 2026). Se trata de un conjunto de 22 archivos de estado de entrenamiento para un experimento sobre comunicación emergente y generalización compositiva en sociedades de modelos de lenguaje.

El setup consiste en un backbone congelado **Qwen2.5-0.5B-Instruct** (no incluido en el repositorio) sobre el que se entrena un bridge de parámetros entrenables y una adaptación **LoRA de rango 8**. Los checkpoints incluyen también el estado del optimizador y del generador de números aleatorios para permitir una reanudación bit-exacta del entrenamiento. La comparativa principal del estudio enfrenta dos regímenes de visibilidad de la evidencia: **restringida (P)** y **global (G)**, junto con tres comparadores centralizados.

La relevancia de este repositorio es estrictamente investigadora: no se trata de un modelo de producción sino de un artefacto experimental para estudiar cómo la visibilidad restringida de la información durante el entrenamiento favorece la generalización compositiva en sociedades de modelos de lenguaje que comparten un genoma común. El código de evaluación, los resultados, la preregistración y el registro de incidentes se publican en el repositorio de GitHub vinculado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone Qwen2.5-0.5B-Instruct congelado + bridge entrenable + LoRA rank-8 |
| Parametros totales | no disponible (solo se publican los pesos del bridge y LoRA; el backbone se carga por separado) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`) |

## Arquitectura y entrenamiento

La arquitectura es un sistema de comunicación emergente entre modelos de lenguaje que comparten un genoma (parámetros compartidos). El backbone es **Qwen2.5-0.5B-Instruct**, un modelo de 0.5 mil millones de parámetros, que se mantiene congelado durante el entrenamiento. Sobre él se entrenan dos componentes:

1. **Bridge de parámetros entrenables**: una capa que conecta el backbone con la tarea de comunicación emergente.
2. **LoRA de rango 8**: adaptadores de bajo rango que permiten ajustar el comportamiento del modelo sin modificar los pesos originales.

El entrenamiento se organiza en **sociedades** de modelos que comparten el genoma (los pesos del bridge y la LoRA). Se distinguen dos regímenes experimentales: visibilidad restringida (P) y visibilidad global (G) de la evidencia entre agentes. Los checkpoints incluyen el estado del optimizador y el RNG para reanudación bit-exacta, lo que sugiere un protocolo experimental riguroso.

Los datos de entrenamiento, el número de tokens, y la composición del dataset no se detallan en la información disponible. Tampoco se especifica si se utilizaron técnicas de RLHF, DPO o similares, aunque por el contexto de comunicación emergente es probable que el entrenamiento sea de tipo auto-supervisado o con recompensas comunicativas, no se puede confirmar.

## Capacidades

- **Comunicación emergente**: el modelo está diseñado para estudiar cómo los agentes desarrollan protocolos de comunicación en un entorno con visibilidad restringida o global.
- **Generalización compositiva**: el objetivo del experimento es medir si la restricción de visibilidad favorece la composicionalidad en el lenguaje emergente.
- **Entrenamiento multi-agente**: los checkpoints contienen parámetros compartidos entre múltiples agentes (sociedades).
- **Reanudación bit-exacta**: el estado del optimizador y RNG permiten continuar el entrenamiento desde el punto exacto, lo que es una capacidad técnica relevante para investigación.
- **No es un modelo de generación de texto general**: no se puede utilizar para chat, generación de código, etc., sin el pipeline completo del experimento.

## Casos de uso

- **Reproducción de experimentos de investigación**: los checkpoints permiten reproducir los resultados del paper de Marincat (2026) sobre visibilidad restringida y generalización compositiva. Se puede cargar un checkpoint y evaluar el comportamiento de la sociedad en las tareas definidas en el repositorio de GitHub.
- **Estudio de comunicación emergente en modelos de lenguaje**: investigadores pueden analizar cómo los agentes desarrollan lenguajes compositivos bajo diferentes condiciones de visibilidad, comparando los checkpoints P (restringido) y G (global).
- **Investigación sobre LoRA en contextos multi-agente**: el setup con LoRA rank-6 y bridge entrenable sobre un backbone congelado es un caso de estudio para técnicas de adaptación eficiente en entornos de aprendizaje multi-agente.
- **Análisis de generalización compositiva**: los checkpoints permiten evaluar si los modelos entrenados con visibilidad restringida muestran mejor generalización a combinaciones de conceptos no vistas durante el entrenamiento.
- **Desarrollo de metodologías de evaluación**: el repositorio incluye código de evaluación y preregistración, útil para investigadores que quieran adoptar protocolos rigurosos en sus propios experimentos.
- **Comparación de regímenes de entrenamiento**: se pueden comparar los resultados de los checkpoints P y G, así como los comparadores centralizados, para entender el impacto de la visibilidad de la evidencia en el aprendizaje de lenguaje emergente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de rendimiento (MMLU, HumanEval, GSM8K, etc.) ni comparativas con otros modelos. El estudio se centra en métricas de generalización compositiva y comunicación emergente, cuyos resultados se detallan en el paper (arXiv link pendiente de publicación).

## Requisitos de hardware

- **VRAM estimada**: el tamaño del repositorio es de 1.1 GB, pero el backbone Qwen2.5-0.5B-Instruct requiere VRAM adicional al cargarse. Se estima que un setup completo (backbone + LoRA + bridge) puede funcionar en GPUs con 8-16 GB de VRAM, dependiendo de la longitud de secuencia y el batch size.
- **GPUs recomendadas**: GPU consumer como RTX 3060 (12 GB), RTX 4070 (12 GB), o RTX 4090 (24 GB) serían suficientes para la inferencia y la reanudación del entrenamiento. Para entrenamiento completo de los checkpoints, se recomienda al menos una GPU con 24 GB.
- **Opciones de despliegue**: al ser checkpoints de investigación en formato PyTorch (`.pt`), no son compatibles directamente con vLLM, llama.cpp, Ollama o TGI. Se requiere cargar el código del repositorio de GitHub y ejecutar el pipeline de evaluación definido por el autor.
- **Latencia y throughput**: no disponible. No se han publicado mediciones de rendimiento de inferencia.

## Comparativa con modelos similares

No hay modelos directamente comparables en el sentido de que este repositorio es un artefacto de investigación específico para un experimento de comunicación emergente. No existe una categoría de "modelos de comunicación emergente" con la que comparar. La única referencia posible es el backbone subyacente, Qwen2.5-0.5B-Instruct, que sí es un modelo de lenguaje general de 0.5B parámetros, pero el repositorio no lo incluye.

| Modelo | Params | Contexto | Licencia | Uso |
|---|---|---|---|---|
| Qwen2.5-0.5B-Instruct | 0.5B | no disponible | Apache 2.0 | Generación de texto general |
| POPULUS (este repo) | bridge + LoRA sobre Qwen2.5-0.5B | no disponible | MIT | Investigación de comunicación emergente |

La comparación no es directa porque el objetivo del repositorio no es ofrecer un modelo de generación, sino un conjunto de checkpoints experimentales.

## Limitaciones y advertencias

- **Uso estrictamente de investigación**: el modelo no está diseñado para producción ni para tareas de generación de texto general. No se debe usar en aplicaciones reales sin un análisis exhaustivo.
- **Dependencia del backbone externo**: los checkpoints no incluyen el modelo Qwen2.5-0.5B-Instruct; es necesario cargarlo por separado desde su distribución oficial.
- **Sin información de idiomas**: la model card no especifica los idiomas soportados. El backbone Qwen2.5-0.5B-Instruct es multilingüe, pero el experimento de comunicación emergente puede generar lenguajes artificiales no naturales.
- **Sin benchmarks de calidad**: no se han publicado resultados de benchmarks estándar, por lo que no se puede evaluar la calidad del modelo en tareas convencionales.
- **Riesgo de alucinación**: no aplicable en el contexto de comunicación emergente, pero si se usara el backbone para generación de texto, heredaría las limitaciones de Qwen2.5-0.5B-Instruct.
- **Licencia MIT**: permite uso comercial y modificación, pero la naturaleza de investigación del modelo y la falta de documentación sobre datos de entrenamiento limitan su uso en producción.
- **Reproducibilidad**: la reanudación bit-exacta está disponible, pero el repositorio de GitHub (con código de evaluación, preregistración e incidentes) es necesario para entender el experimento y usar los checkpoints.

## Enlaces

- [Repositorio HuggingFace](https://huggingface.co/tokenosopher/populus-evidence-partitioning-checkpoints)
- [Repositorio GitHub (código, evaluación, preregistración)](https://github.com/tokenosopher/populus-evidence-partitioning)
- Paper: "What You Can't See Is What You Learn: Restricted Evidence Visibility Favors Learned Generalization in Shared-Genome Language-Modelist" (Narcis Marincat, 2026; arXiv link to follow, según la model card)
