# TerryPei/gap-graph-as-policy

## Resumen

El repositorio `TerryPei/gap-graph-as-policy` contiene el código, los scripts de experimentación, los registros de ejecución y los resultados celda a celda para reproducir **Graph-as-Policy (GaP)** en el benchmark de manipulación robótica **LIBERO**. El trabajo extiende la evaluación original del artículo (que solo cubría la suite *Object* / grocery) a las **cuatro suites completas** de LIBERO, e incorpora una contribución propia de **pre-ranking de percepción** que reduce drásticamente el número de llamadas al modelo de visión-lenguaje (VLM) sin sacrificar precisión.

No se trata de un modelo de lenguaje o de un sistema de IA generativa, sino de un **sistema de control robótico basado en grafos** que representa políticas como grafos de decisión y utiliza un VLM externo para la percepción. El repositorio documenta además dos correcciones al validador de GaP (reglas W9 y W10) que evitan fallos de ejecución en tiempo de ejecución. La información disponible es exclusivamente la de la model card; no se proporcionan detalles sobre arquitectura de red, parámetros, entrenamiento o licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Graph-as-Policy (grafos de decisión para control robótico) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (repositorio de código y resultados, no contiene pesos de modelo) |

## Arquitectura y entrenamiento

La model card describe GaP como un enfoque que representa políticas de manipulación como **grafos**, donde los nodos corresponden a estados o acciones y las aristas a transiciones condicionadas por la percepción. El sistema utiliza un **modelo de visión-lenguaje (VLM)** externo para verificar el estado del entorno y decidir la siguiente acción. La contribución principal del repositorio es un módulo de **pre-ranking de percepción** que reduce el número de llamadas al VLM por prueba (de 14.4 a 2.6 en la suite Object, por ejemplo) mediante un re-ranking basado en relaciones y un guardián de ambigüedad.

No se proporcionan datos sobre el entrenamiento del VLM subyacente ni sobre el proceso de aprendizaje de GaP. El repositorio incluye parches al validador de GaP (reglas W9 y W10) que corrigen dos defectos estructurales que provocaban fallos de ejecución garantizados, así como un módulo `v3_perception/` con 14 pruebas unitarias para el re-ranking con conciencia de relaciones.

## Capacidades

- **Control robótico de manipulación**: ejecuta tareas como pick-and-place, abrir cajones, girar perillas de cocina, etc., en el simulador LIBERO.
- **Planificación de largo horizonte**: evaluado en la suite *Long* (libero_10) con tareas de múltiples pasos (hasta 10 pasos).
- **Percepción eficiente**: el pre-ranking reduce las llamadas al VLM entre 3.2× y 10.2× según la suite, manteniendo la precisión.
- **Detección de fallos**: el sistema distingue entre tres causas de fallo (límite real de la biblioteca de habilidades, bug de pipeline, fiabilidad de generación de grafos) mediante el análisis de trazas.
- **Validación estructural**: incluye un validador con 19 reglas (ampliado con W9 y W10) que rechaza grafos malformados en tiempo de compilación.
- **Reproducibilidad**: proporciona scripts de ejecución reanudables, registros de puertas (gate history) y resultados celda a celda en JSON.

## Casos de uso

- **Investigación en manipulación robótica**: el repositorio sirve como base para reproducir y extender GaP en LIBERO, permitiendo a otros investigadores comparar resultados y probar modificaciones.
- **Evaluación de políticas basadas en grafos**: los scripts y resultados permiten medir el rendimiento de GaP en las cuatro suites de LIBERO (Object, Spatial, Goal, Long) con métricas de éxito y eficiencia de percepción.
- **Optimización de costes de percepción**: el módulo de pre-ranking demuestra cómo reducir el número de llamadas a un VLM en sistemas robóticos, útil para despliegues con APIs de pago o cuotas limitadas.
- **Depuración de sistemas robóticos**: el análisis de trazas y los vídeos de prueba (en `videos/`) ayudan a diagnosticar fallos y atribuirlos a causas concretas (habilidades faltantes, bugs de pipeline, etc.).
- **Mejora de validadores de grafos**: los parches W9 y W10 son reutilizables en otros sistemas que usen grafos de decisión con subgrafos y enrutamiento condicional.
- **Benchmarking de VLM en robótica**: los resultados de eficiencia (llamadas por prueba) pueden servir para comparar el coste de diferentes VLM en tareas de manipulación.

## Benchmarks y rendimiento

La model card presenta resultados agregados de las cuatro suites de LIBERO, comparando la línea base de GaP con la versión con pre-ranking (la contribución del autor). Los datos provienen de los archivos `cell_result.json` y no son estimaciones.

| Suite | Baseline GaP | + Pre-ranking (ours) | Tareas |
|---|:---:|:---:|:---:|
| Object (grocery) | 28/30 = 93.3% | 29/30 = 96.7% | 10 |
| Spatial (referring expressions) | 3/30 = 10.0% | 1/30 = 3.3% | 10 |
| Goal (goal-directed manipulation) | 5/30 = 16.7% | 6/30 = 20.0% | 10 |
| Long (libero_10, multi-step) | 3/15 = 20.0% | 3/15 = 20.0% | 5 (incompleto) |
| **Total** | **39/105 = 37.1%** | **39/105 = 37.1%** | 35 |

**Eficiencia de percepción** (llamadas al VLM por prueba):

| Suite | Baseline calls/trial | Ours calls/trial | Reducción |
|---|:---:|:---:|:---:|
| Object | 14.4 | 2.6 | 5.5× |
| Spatial | 16.3 | 1.9 | 8.4× |
| Goal | 16.7 | 1.6 | 10.2× |
| Long | 6.1 | 1.9 | 3.2× |

El autor destaca que la precisión es idéntica (39/105 en ambos brazos) pero con 3–10× menos llamadas al VLM. En un experimento con un backend de percepción deliberadamente restringido, una tarea pasa de 6.7% a 80.0% de éxito (30 pruebas, p de Fisher ≪ 0.001). No se proporcionan otros benchmarks (MMLU, HumanEval, etc.) porque no es un modelo de lenguaje.

## Requisitos de hardware

No se especifican requisitos de hardware en la información disponible. El sistema depende de un VLM externo (se menciona una "free API key" con cuota diaria), por lo que la inferencia del VLM probablemente se realiza en la nube. Para la simulación de LIBERO se requiere una GPU con soporte de renderizado (típicamente NVIDIA con CUDA), pero no se dan detalles. El repositorio tiene un tamaño de 0.1 GB, lo que sugiere que no incluye pesos de modelos grandes.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la model card. GaP es un enfoque específico para robótica basado en grafos, y no se mencionan alternativas como RT-1, RT-2, o métodos de aprendizaje por refuerzo. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- **Suite Long incompleta**: solo 5 de 10 tareas están emparejadas; la fila de Long cambiará cuando se complete.
- **Regresión en Spatial**: el módulo de pre-ranking empeora el rendimiento (10.0% → 3.3%) debido a que la generación de grafos pierde el calificador espacial (p. ej., "el bol negro entre el plato y el ramekin" se convierte en "bol negro"). El autor indica que el fix está implementado pero no evaluado.
- **Escala de evaluación limitada**: solo 3 pruebas por tarea y 1 muestra de grafo por tarea, con una API gratuita con cuota diaria. Los resultados son de "sanity-scale", no una evaluación completa.
- **Límite real de la biblioteca de habilidades**: tareas como abrir cajones o girar perillas no son pick-and-place y el sistema no tiene primitivas para ellas, lo que provoca ejecuciones muy largas (hasta 18965 pasos de control) sin éxito.
- **Dependencia de un VLM externo**: el rendimiento depende de la calidad y disponibilidad del VLM; con cuotas o APIs de pago, el coste puede ser significativo.
- **Licencia no especificada**: no se indica la licencia del código ni de los resultados, lo que puede limitar su uso comercial o la redistribución.
- **Sin información sobre sesgos o alucinaciones**: al no ser un modelo de lenguaje, no aplican los riesgos típicos de alucinación, pero el VLM subyacente podría tener sesgos visuales no documentados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/TerryPei/gap-graph-as-policy
- Paper (referenciado en el tag arxiv): https://arxiv.org/abs/2607.05369 (no verificado)
- Timeline de progreso: `TIMELINE.md` (dentro del repositorio)
- Vídeos de prueba: `videos/` (dentro del repositorio)
