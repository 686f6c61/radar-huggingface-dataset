# zedgamer/asset-quality-memory-knn

## Resumen

El modelo `zedgamer/asset-quality-memory-knn` es un baseline de clasificación por vecinos más cercanos (k-NN) diseñado para el control de calidad de activos digitales en el contexto de Asset Factory, un sistema de gestión de assets para Godot. Desarrollado por el usuario `zedgamer` e implementado dentro del framework Botte Secrète, este modelo no es una red neuronal, sino un algoritmo de aprendizaje basado en instancias que combina comprobaciones deterministas con una búsqueda de vecinos verificados para emitir un veredicto de calidad (PASS, FAIL, UNCERTAIN o PASS_ROBUST). Su relevancia radica en ofrecer una alternativa explicable, local y sin dependencia de la nube para evaluar la calidad de assets 3D antes de su integración en proyectos.

La arquitectura se basa en un clasificador k-NN clásico que opera sobre un índice de memoria local (almacenado en `.botte/asset-quality.jsonl`), donde cada asset se compara con ejemplos previamente validados de la misma familia (imágenes, texturas, mallas, animaciones o paquetes Godot). No se dispone de información sobre el número de parámetros ni la longitud de contexto, ya que no es un modelo de lenguaje ni una red neuronal con parámetros entrenados; es un modelo de aprendizaje perezoso (lazy learning) que no requiere fase de entrenamiento explícita. La licencia es MIT y el formato de pesos no aplica al ser un índice de memoria, no un tensor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | k-NN (k-nearest neighbors) con checks deterministas previos |
| Parámetros totales | no disponible (no es un modelo con pesos entrenados) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantización | no aplica |
| Idiomas soportados | no disponible (no es un modelo de texto) |
| Licencia | MIT |
| Formato de pesos | no aplica (la memoria se almacena en formato JSONL, no en safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo no sigue una arquitectura de transformer ni de red neuronal. Se trata de un algoritmo de k-NN basado en memoria (instance-based learning) que actúa como un clasificador no paramétrico. El proceso de evaluación se compone de dos etapas:

1. **Comprobaciones deterministas**: se ejecutan verificaciones de integridad (SHA-256), licencia, manifiesto, tamaño y validez estructural del activo. Dependiendo de la familia (imagen, textura, malla, animación o paquete Godot), se aplican comprobaciones específicas adicionales.
2. **Búsqueda de vecinos**: tras superar las comprobaciones básicas, se buscan en el índice de memoria los ejemplos verificados externamente de la misma familia de activos. El modelo devuelve una clasificación de calidad (FAIL, UNCERTAIN, PASS o PASS_ROBUST) basada en la proximidad y el número de vecinos comparables. Si hay menos de tres ejemplos comparables, el modelo se abstiene (no emite una decisión).

El entrenamiento no es convencional: no hay un proceso de optimización de pesos. La "memoria" se construye a partir de ejemplos validados manualmente o mediante procesos externos, que se guardan en un archivo JSONL local. El modelo no puede importar, activar ni publicar assets, por lo que es un sistema de evaluación en modo sombra (shadow-only). No se han publicado detalles sobre el conjunto de datos de entrenamiento ni sobre técnicas como RLHF o DPO, ya que no aplican a este tipo de modelo.

## Capacidades

- Evaluación de calidad de activos digitales mediante un sistema de decisión basado en vecinos más cercanos.
- Comprobaciones deterministas de integridad, licencia, manifiesto, SHA-256 y tamaño.
- Comprobaciones específicas para imágenes, texturas, mallas, animaciones y paquetes Godot.
- Emisión de un veredicto con cuatro niveles: `FAIL`, `UNCERTAIN`, `PASS` y `PASS_ROBUST`, incluyendo los identificadores de los vecinos utilizados.
- Capacidad de abstención cuando el número de ejemplos comparables es insuficiente (menos de 3).
- Funcionamiento completamente local, sin necesidad de conexión a la nube ni de servicios externos.
- Explicabilidad: cada decisión se puede justificar mediante los vecinos seleccionados y los checks deterministas aplicados.
- No requiere GPU; puede ejecutarse en CPU de forma eficiente.

## Casos de uso

- **Control de calidad de assets en un pipeline de CI/CD**: el modelo puede integrarse en un flujo de integración continua para validar automáticamente cada asset antes de su fusión en el repositorio principal. Al ejecutarse en local, no requiere servicios externos y puede rechazar assets defectuosos con un veredicto `FAIL` y los motivos concretos.
- **Verificación de assets descargados de repositorios externos**: al añadir un asset de terceros a un proyecto Godot, el modelo puede comprobar su integridad y licencia, reduciendo el riesgo de introducir código malicioso o licencias incompatibles.
- **Auditoría de licencias en proyectos comerciales**: para proyectos que distribuyen juegos o aplicaciones, el modelo puede comprobar que cada asset cumple con la licencia permitida, emitiendo `UNCERTAIN` si no hay suficientes vecinos verificados para confirmarlo.
- **Evaluación de la consistencia de texturas y mallas**: mediante los checks específicos por familia, el modelo puede detectar texturas con dimensiones incorrectas, mallas con topología problemática o animaciones con curvas rotas, alertando al desarrollador antes de la integración.
- **Sistema de recomendación para el uso de assets**: al clasificar un asset como `PASS_ROBUST`, el modelo indica que el asset es fiable y puede utilizarse sin supervisión adicional, lo que ayuda a priorizar el uso de assets de alta calidad en un proyecto.
- **Documentación y trazabilidad de decisiones**: gracias a la explicabilidad, el modelo puede generar un informe con los vecinos utilizados y los checks aplicados, útil para auditorías de calidad o para justificar decisiones de aceptación o rechazo en un equipo de desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como exactitud, precisión o comparaciones con otros modelos. El modelo se presenta como un baseline para justificar la necesidad de un modelo neuronal especializado; por tanto, no hay datos de rendimiento numérico.

## Requisitos de hardware

- No se requiere GPU; el modelo se ejecuta en CPU. Según la documentación, una CPU es suficiente para realizar las comprobaciones y la búsqueda de vecinos.
- La memoria RAM necesaria depende del tamaño del índice de memoria local (archivo JSONL), pero no se ha especificado un valor mínimo.
- No se requieren GPUs específicas. Se puede ejecutar en cualquier máquina con Python y las dependencias de Botte Secrète.
- Opciones de despliegue: se puede invocar mediante el CLI de Botte Secrète (`python -m skills.asset_quality.cli evaluate`). También puede integrarse en scripts de automatización.
- No se dispone de datos de latencia o throughput estimados. Al ser un algoritmo k-NN, la latencia depende del número de ejemplos en el índice y de la dimensionalidad de las características, pero no se ha especificado.

## Comparativa con modelos similares

No se dispone de modelos directamente comparables, ya que el modelo se enfoca en un dominio muy específico (control de calidad de assets para Godot) y no es un modelo de propósito general. No hay una lista de alternativas en la información proporcionada. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- **Alcance limitado**: el modelo no puede importar, activar ni publicar assets; solo sirve para evaluar su calidad. No debe utilizarse como un sistema de ejecución de assets.
- **Abstención con pocos ejemplos**: si no hay al menos tres ejemplos verificados de la misma familia, el modelo se abstiene y no emite un veredicto claro, lo que puede generar incertidumbre en entornos con pocos datos.
- **Dependencia de la memoria local**: el índice de memoria se almacena en `.botte/asset-quality.jsonl`. Si ese archivo se corrompe o se pierde, el modelo no puede funcionar correctamente.
- **Riesgo de sesgo en los vecinos**: los resultados dependen de la calidad de los ejemplos previamente verificados. Si esos ejemplos contienen sesgos (por ejemplo, una mayoría de assets de baja calidad), el modelo podría clasificar erróneamente un asset de buena calidad.
- **No es un modelo neuronal**: no tiene capacidad de generalización más allá de los ejemplos almacenados. No puede detectar problemas que no estén representados en los vecinos.
- **Restricciones de licencia**: aunque la licencia es MIT, el uso del modelo puede estar sujeto a las restricciones de los assets que se evalúan. No se debe subir el archivo de memoria local, ya que puede contener huellas de evaluación o información sensible.
- **Soporte de idioma**: no aplica, ya que no es un modelo de texto. No hay limitaciones de idioma.

## Enlaces

- Página del modelo en Hugging Face: [https://huggingface.co/zedgamer/asset-quality-memory-knn](https://huggingface.co/zedgamer/asset-quality-memory-knn)
- Repositorio fuente de Botte Secrète: [https://github.com/zedarvates/botte-secrete](https://github.com/zedarvates/botte-secrete)
- Documentación del módulo de calidad de activos: [https://github.com/zedarvates/botte-secrete/tree/main/skills/asset_quality](https://github.com/zedarvates/botte-secrete/tree/main/skills/asset_quality)
- Licencia del proyecto: [https://github.com/zedarvates/botte-secrete/blob/main/LICENSE](https://github.com/zedarvates/botte-secrete/blob/main/LICENSE)

Nota: La fecha de creación del modelo es el 26 de agosto de 2026, según los metadatos de Hugging Face, aunque el contenido puede ser una simulación. Se recomienda verificar la vigencia del repositorio antes de su uso.## Resumen

El modelo `zedgamer/asset-quality-memory-knn` es un baseline de calidad de activos digitales basado en k-nearest neighbors (k-NN), desarrollado por el usuario zedgamer e implementado en el framework Botte Secrète. Está pensado para el control de calidad de assets en proyectos Godot, donde realiza comprobaciones deterministas (integridad, licencia, manifiesto, SHA-256, tamaño) y, tras superarlas, busca vecinos verificados de la misma familia para emitir un veredicto: `FAIL`, `UNCERTAIN`, `PASS` o `PASS_ROBUST`. Su relevancia radica en ser una alternativa explicable, local y sin dependencia de la nube, que sirve como referencia para decidir si un modelo neuronal especializado está justificado.

No se trata de una red neuronal ni de un modelo de lenguaje, sino de un algoritmo de aprendizaje perezoso que no requiere entrenamiento explícito. La información disponible no incluye el número de parámetros, la longitud de contexto ni los idiomas soportados, ya que no son aplicables a un modelo de este tipo. La licencia es MIT y la implementación se distribuye en el repositorio de Botte Secrète.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | k-NN (k-nearest neighbors) con comprobaciones deterministas previas |
| Parametros totales | no disponible (no es un modelo con pesos entrenados) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de texto) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | no aplica (la memoria se almacena en JSONL, no en safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo no tiene una arquitectura de transformer ni de red neuronal. Es un clasificador k-NN basado en memoria, donde cada activo se compara con ejemplos previamente verificados y almacenados en un índice local. El proceso consta de dos fases: primero se ejecutan comprobaciones deterministas de integridad, licencia, manifiesto, SHA-256 y tamaño; después se aplican comprobaciones específicas según la familia del activo (imágenes, texturas, mallas, animaciones o paquetes Godot). Una vez superadas, se buscan los vecinos más cercanos en el índice de memoria y se emite una decisión.

El entrenamiento no es convencional: no hay optimización de pesos ni actualización de gradientes. La memoria se construye con ejemplos verificados externamente, que se guardan en el archivo `.botte/asset-quality.jsonl`. El modelo se abstiene cuando hay menos de tres ejemplos comparables. No se han publicado detalles sobre el conjunto de datos de entrenamiento ni sobre técnicas como RLHF o DPO, ya que no aplican en este caso.

## Capacidades

- Genera un veredicto de calidad (FAIL, UNCERTAIN, PASS o PASS_ROBUST) para activos digitales.
- Ejecuta comprobaciones deterministas de integridad, licencia, manifiesto, SHA-256 y tamaño.
- Aplica comprobaciones específicas por familia: imágenes, texturas, mallas, animaciones y paquetes Godot.
- Busca vecinos verificados de la misma familia y devuelve sus identificadores para justificar la decisión.
- Capacidad de abstención si el número de ejemplos comparables es inferior a tres.
- Funcionamiento completamente local, sin dependencia de la nube ni de servicios externos.
- No requiere GPU; puede ejecutarse en CPU.

## Casos de uso

- **Control de calidad en un pipeline de CI/CD**: el modelo se puede integrar en un flujo de integración continua para validar cada activo antes de su fusión en el repositorio. Al ser local, no necesita servicios externos y puede rechazar activos defectuosos con un veredicto `FAIL` y los motivos concretos.
- **Verificación de activos descargados de terceros**: al añadir un activo externo a un proyecto Godot, el modelo comprueba su integridad y licencia, lo que reduce el riesgo de introducir archivos corruptos o con licencias incompatibles.
- **Auditoría de licencias en proyectos comerciales**: para distribuciones de assets, el modelo puede verificar que cada activo cumple la licencia permitida, emitiendo `UNCERTAIN` si no hay suficientes ejemplos para confirmar.
- **Detección de problemas estructurales en mallas y texturas**: mediante las comprobaciones específicas por familia, el modelo detecta texturas con dimensiones incorrectas, mallas con geometría rota o animaciones con campos inválidos, facilitando la corrección antes de la integración.
- **Selección de activos de alta fiabilidad**: un activo clasificado como `PASS_ROBUST` indica que es fiable y puede usarse sin supervisión adicional, lo que agiliza la toma de decisiones en equipos de desarrollo.
- **Generación de informes de trazabilidad**: gracias a su explicabilidad, el modelo puede producir informes con los vecinos utilizados y los resultados de las comprobaciones, útiles para auditorías o para justificar decisiones de aceptación o rechazo en un equipo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como exactitud, precisión o comparación con otros modelos. El modelo se presenta como un baseline para evaluar si un modelo neuronal específico es necesario, pero no se han incluido datos numéricos de rendimiento.

## Requisitos de hardware

- No se requiere VRAM específica; el modelo se ejecuta en CPU. La documentación indica que una CPU es suficiente para las comprobaciones y la búsqueda de vecinos.
- La memoria RAM necesaria depende del tamaño del índice de memoria (archivo JSONL), pero no se ha especificado un valor mínimo.
- No se requiere una GPU concreta; puede ejecutarse en cualquier máquina con las dependencias de Botte Secrète.
- Opciones de despliegue: se puede invocar mediante el CLI de Botte Secrète (`python -m skills.asset_quality.cli evaluate`) o integrarse en scripts de automatización.
- La latencia y el throughput no están documentados. Al ser un algoritmo k-NN, la latencia depende del número de puntos en el índice y de la distancia utilizada, pero no se han proporcionado estimaciones.

## Comparativa con modelos similares

No se dispone de modelos directamente comparables, ya que el modelo se centra en un caso muy específico (control de calidad de activos para Godot) y no es un modelo de propósito general. No se ha encontrado ninguna alternativa comparable en la información proporcionada. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- **Alcance limitado**: el modelo no puede importar, activar ni publicar activos; solo evalúa su calidad. No debe utilizarse como sistema de ejecución.
- **Abstención con pocos datos**: si no hay al menos tres ejemplos verificados de la misma familia, el modelo se abstiene y no emite una decisión clara, lo que puede ser problemático en entornos con poca información.
- **Dependencia de la memoria local**: el índice de memoria se almacena en `.botte/asset-quality.jsonl`. Si este archivo se corrompe o se pierde, el modelo no puede funcionar correctamente.
- **Sesgo en los ejemplos**: la calidad de las decisiones depende de los ejemplos previamente almacenados. Si esos ejemplos son de baja calidad o están sesgados, el modelo puede emitir veredictos erróneos.
- **Sin generalización**: al ser un modelo de aprendizaje perezoso, no puede generalizar a problemas que no estén representados en los vecinos. No aprende de los datos más allá de la memoria.
- **Restricciones de licencia**: aunque el modelo tiene licencia MIT, el uso de los activos que se evalúa puede estar sujeto a otras licencias. No se debe subir el archivo de memoria local, ya que puede contener información operativa sensible.
- **Idioma**: no aplica, ya que no es un modelo de texto. No hay restricciones de idioma.

## Enlaces

- [Página del modelo en Hugging Face](https://huggingface.co/zedgamer/asset-quality-memory-knn)
- [Repositorio fuente de Botte Secrète](https://github.com/zedarvates/botte-secrete)
- [Módulo de calidad de activos en el repositorio](https://github.com/zedarvates/botte-secrete/tree/main/skills/asset_quality)
- [Licencia del proyecto](https://github.com/zedarvates/botte-secrete/blob/main/LICENSE)
