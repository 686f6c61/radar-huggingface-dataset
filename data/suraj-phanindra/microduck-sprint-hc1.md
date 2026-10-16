# suraj-phanindra/microduck-sprint-hc1

## Resumen

microduck-sprint-hc1 es una política de control para el robot microduck de Pollen Robotics, publicada por el usuario suraj-phanindra. No es un modelo de lenguaje ni un modelo generativo de propósito general: se trata de un fichero de pesos en formato ONNX que define una marcha (gait) concreta para el robot, cargable directamente en una de las ranuras de política del demonio de control del robot. Se distribuye como un *fine-tune* de namenu/microduck-arena, obtenido mediante escalada de colina elitista (elitist hill climb) sobre la puntuación de la Arena, es decir, mediante optimización evolutiva guiada por recompensa y no mediante descenso de gradiente sobre una función de pérdida diferenciable.

El modelo opera con un espacio de observación de 61 dimensiones y un espacio de acción de 14 dimensiones a 50 Hz, según la model card del autor. La política es descrita como "perpetua": una vez cargada, mantiene la marcha indefinidamente hasta que se le indique lo contrario, a diferencia de políticas episódicas que requieren reinicio. El normalizador de observaciones está embebido dentro de `policy.onnx`, de modo que la política espera observaciones en crudo del robot, sin preprocesado externo.

El interés de esta ficha es más metodológico que de rendimiento: ilustra un flujo de trabajo de robótica open source donde una política de control se versiona, se publica en HuggingFace y se despliega en hardware real mediante una orden de CLI, con un manifiesto que sigue un esquema versionado. La información pública disponible es muy limitada: cero descargas, cero likes, sin licencia declarada, sin idiomas declarados y un repositorio de 0,0 GB de tamaño (lo que sugiere un artefacto de pesos muy pequeño, coherente con una política de control de baja dimensión).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de control robótico entrenada por escalada de colina elitista (elitist hill climb) sobre la puntuación de la Arena; topología interna de la red no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; no aplica como contexto de tokens (la entrada es un vector de observación de 61 dimensiones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (política de control motriz, no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`, con normalizador de observaciones embebido) más `manifest.json` (esquema 2 del manifiesto de políticas de microduck) |
| Espacio de observacion | 61 dimensiones |
| Espacio de accion | 14 dimensiones |
| Frecuencia de control | 50 Hz |
| Modelo base | namenu/microduck-arena (relación: fine-tune) |
| Libreria | microduck |
| Pipeline | robotics |
| Tamano del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

La información disponible no detalla la topología de la red (número de capas, anchura, tipo de activaciones ni si incorpora memoria recurrente). Lo que sí se documenta es el método de entrenamiento: un ajuste fino del modelo base namenu/microduck-arena mediante escalada de colina elitista sobre la puntuación que otorga la Arena. Esto sitúa el procedimiento en el ámbito de los algoritmos evolutivos o de búsqueda estocástica sin gradiente, habituales en control de robots cuando la recompensa es una métrica de evaluación no diferenciable o cuando el espacio de políticas es lo bastante pequeño como para explorarlo por mutación y selección. Los tags del repositorio incluyen `reinforcement-learning`, aunque el método descrito sea de búsqueda directa en el espacio de parámetros.

El entrenamiento se realizó con el repositorio `pollen-robotics/microduck_rl`, rama `main`, commit `6ff40704a`, según declara la propia model card. No se especifica el número de iteraciones, el tamaño del conjunto de evaluaciones, la composición de escenarios ni si hubo fases previas de aprendizaje por imitación o currículo. Tampoco se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal u otras), lo cual es esperable en una política de control de baja dimensionalidad y no en un modelo secuencial de gran tamaño. El artefacto distribuido incorpora el normalizador de observaciones dentro del propio grafo ONNX, una decisión de empaquetado que elimina una fuente típica de discrepancias entre entrenamiento y despliegue.

## Capacidades

- Generación de marcha locomotora perpetua para el robot microduck: la política mantiene la marcha de forma continua hasta que se detiene explícitamente, sin horizonte de episodio declarado.
- Control motor de 14 acciones a partir de un vector de observación de 61 dimensiones, a una frecuencia de 50 Hz.
- Ingesta de observaciones en crudo: el normalizador embebido en `policy.onnx` exime al integrador de replicar el preprocesado de entrenamiento.
- Carga en ranura de política del robot mediante la orden `robotctl policy load <slot> suraj-phanindra/microduck-sprint-hc1`.
- Compatibilidad declarada con el esquema 2 del manifiesto de políticas de microduck, lo que permite al demonio de control interpretar los metadatos del artefacto.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio, código, matemáticas ni multilingüismo; no aplican a este tipo de artefacto.

## Casos de uso

- Locomoción de base en un microduck físico: cargar la política en una ranura y dejar que el robot se desplace de forma continua en demostraciones de laboratorio o aulas, aprovechando que la marcha es perpetua y no requiere reinicio periódico.
- Evaluación comparativa de políticas en la Arena: al ser un fine-tune optimizado directamente sobre la puntuación de la Arena, sirve como referencia de techo alcanzable por escalada de colina frente a otras políticas del mismo ecosistema.
- Línea base en investigación sobre búsqueda directa en el espacio de parámetros: útil para estudiar cuánto rendimiento se obtiene sin gradientes en un problema de control con espacio de observación de 61 dimensiones y 14 acciones.
- Pruebas de integración del demonio de control: al seguir el esquema 2 del manifiesto, permite validar el flujo `robotctl policy load` en pipelines de CI o en bancos de pruebas sin depender de una política concreta de producción.
- Docencia de robótica open source: el artefacto es pequeño (repositorio de 0,0 GB) y se despliega con una orden, lo que facilita ejercicios de carga, sustitución y comparación de políticas sobre hardware real en sesiones prácticas.
- Prototipado rápido de comportamientos de desplazamiento: dado que la política corre a 50 Hz y no requiere contexto, puede integrarse en bucles de control de tiempo real modestos sin reescribir el *stack* de percepción, alimentándola con observaciones crudas.
- Remezcla y ajuste posterior: al ser un fine-tune del modelo namenu/microduck-arena, sirve como punto de partida para nuevas rondas de escalada de colina sobre la Arena con otros criterios de recompensa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card únicamente indica que el modelo fue ajustado mediante escalada de colina elitista sobre la puntuación de la Arena, pero no se proporciona el valor numérico obtenido, ni curvas de recompensa, ni comparaciones cuantitativas con el modelo base namenu/microduck-arena o con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio (0,0 GB) y la naturaleza del artefacto (una política ONNX con entrada de 61 dimensiones y salida de 14) indican un modelo muy pequeño, pero no se publica el recuento de parámetros ni el peso del fichero.
- GPU recomendadas: no disponible. Por el tipo de carga (control a 50 Hz con vectores de baja dimensión), es plausible que la inferencia se ejecute en la CPU del propio robot, pero esto no está confirmado en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible. No hay datos suficientes para afirmar que quepa o no en tarjetas como RTX 4090; por el tamaño aparente del artefacto, la GPU sería en todo caso innecesaria.
- Opciones de despliegue: el mecanismo documentado es el demonio de políticas de microduck, mediante `robotctl policy load <slot> suraj-phanindra/microduck-sprint-hc1`. El formato ONNX abre la puerta a otros *runtimes* compatibles (ONNX Runtime, TensorRT), pero no se documenta ninguno en la model card. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponible. La única cifra temporal publicada es la frecuencia de control de 50 Hz, que implica un periodo de 20 ms por paso de decisión; no se publica la latencia real de inferencia ni el margen disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / E-S | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| suraj-phanindra/microduck-sprint-hc1 | no disponible | Observación 61-D, acciones 14-D, 50 Hz | No publicado | no disponible | HuggingFace (0 descargas, 0 likes) |
| namenu/microduck-arena (modelo base) | no disponible | No disponible | No disponible | no disponible | HuggingFace |
| Otras políticas de microduck | no disponible | No disponible | No disponible | no disponible | no disponible |

Solo se identifica con claridad un término de comparación, el modelo base namenu/microduck-arena, del cual este artefacto es un fine-tune por escalada de colina. No se dispone de datos de rendimiento del modelo base ni de licencia de ninguno de los dos, por lo que la comparación cuantitativa no es posible. No se conocen otras alternativas de la misma categoría a partir de la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de licencia declarada: sin licencia explícita no puede asumirse permiso de uso comercial, redistribución ni obra derivada; conviene contactar con el autor antes de cualquier uso en producción.
- Ausencia de datos de rendimiento: no se publica la puntuación de la Arena obtenida, ni tasas de éxito, ni robustez ante perturbaciones del terreno, por lo que no hay evidencia cuantitativa de que la marcha supere al modelo base.
- Riesgo de sobreajuste a la métrica de evaluación: al optimizar directamente sobre la puntuación de la Arena mediante escalada de colina, el comportamiento puede explotar particularidades del entorno de evaluación y degradarse en condiciones reales distintas.
- Método de optimización sin gradiente: la escalada de colina elitista tiende a quedar atrapada en óptimos locales, y no se documentan reinicios, diversidad de población ni estrategias de mitigación.
- Especificidad de hardware y de pila de software: la política está diseñada para el robot microduck y su demonio de control; no es portable a otras plataformas sin reentrenamiento, y depende del esquema 2 del manifiesto de políticas.
- Sin información sobre sesgos: al no tratar datos humanos ni lenguaje, no aplican los sesgos típicos de los modelos de lenguaje, pero no se documenta el comportamiento de la política en entornos con superficies irregulares, obstáculos u operadores humanos cercanos.
- Sin datos sobre alucinación en el sentido habitual: no es un modelo generativo de texto, por lo que el concepto no aplica; el riesgo equivalente es una marcha inestable o no generalizable, del que tampoco hay evidencia publicada.
- Idiomas y contexto: no aplica. No debe evaluarse como modelo de lenguaje.
- Estado del repositorio: cero descargas y cero likes en la fecha de consulta, lo que indica ausencia de validación por parte de la comunidad.
- Fechas de creación y actualización (16 de octubre de 2026) coherentes entre sí, sin historial de revisiones posterior que permita evaluar si el artefacto se ha corregido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/suraj-phanindra/microduck-sprint-hc1
- Modelo base: https://huggingface.co/namenu/microduck-arena
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento por refuerzo: `pollen-robotics/microduck_rl` (rama `main`, commit `6ff40704a`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del demonio de control de microduck
