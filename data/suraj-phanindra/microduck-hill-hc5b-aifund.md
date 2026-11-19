# suraj-phanindra/microduck-hill-hc5b-aifund

## Resumen

`microduck-hill-hc5b-aifund` es una política de control para el robot cuadrúpedo microduck de Pollen Robotics, publicada por el usuario suraj-phanindra en Hugging Face. No es un modelo de lenguaje: es un controlador entrenado por aprendizaje por refuerzo que recibe observaciones de 61 dimensiones y emite 14 acciones a 50 Hz, pensado para ejecutarse como política de marcha ("gait") cargada en una ranura del daemon `robotctl` del robot. Se distribuye en formato ONNX con el normalizador de observaciones embebido en el propio grafo.

El modelo es un fine-tuning por *elitist hill climbing* sobre la puntuación de Arena de la política base `juicenv/microduck-hill-es8`. La model card lo describe como una política "perpetua": se ejecuta de forma continua hasta que se le indique lo contrario. La nomenclatura de versiones (hc5b, hc6, hc7) sugiere una cadencia de iteraciones sucesivas del mismo bucle de optimización, aunque no se documenta el criterio exacto de selección ni la métrica de Arena empleada.

La relevancia es acotada y muy específica: se trata de un artefacto de robótica de código abierto para un robot concreto, con trazabilidad de entrenamiento declarada (repositorio `pollen-robotics/microduck_rl`, rama `main`, commit `5cee942d8`). No hay información pública sobre licencia, idiomas, benchmarks ni tamaño de parámetros, y el repositorio figura con 0.0 GB, lo que sugiere que los pesos pueden no estar materializados o son de tamaño despreciable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de control entrenada por RL; no se especifica la topología de red) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (política reactiva con observación de 61 dimensiones por paso; sin ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (distribución en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` conforme al esquema 2 del manifiesto de políticas de microduck |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de la red (número de capas, anchura, tipo de capa o función de activación). Lo que sí se especifica es la interfaz: observación de 61 dimensiones, 14 acciones, frecuencia de control de 50 Hz, y un normalizador de observaciones integrado dentro de `policy.onnx`, de modo que el consumidor debe alimentar observaciones en bruto sin preprocesar.

El entrenamiento se realizó mediante *elitist hill climbing* sobre la puntuación de Arena, partiendo de la política `juicenv/microduck-hill-es8`. El linaje declarado es un fine-tuning (`base_model_relation: finetune`). El código de entrenamiento corresponde al repositorio `pollen-robotics/microduck_rl`, rama `main`, commit `5cee942d8`. No se documentan el número de iteraciones, la población evaluada, la función de recompensa, la composición del dataset ni si hubo fases de RLHF o DPO (no aplicables en este dominio). Tampoco se indica la métrica concreta de Arena ni los valores alcanzados.

## Capacidades

- Control locomotor de un robot cuadrúpedo microduck con observaciones de 61 dimensiones y 14 acciones a 50 Hz.
- Política "perpetua": mantiene la marcha de forma continua hasta recibir una orden de parada o sustitución.
- Integración directa con el daemon del robot mediante `robotctl policy load <slot> <repo>`.
- Normalización de observaciones embebida en el grafo ONNX, lo que elimina pasos de preprocesado en el lado del robot.
- Ejecución en el hardware del robot a través del runtime ONNX; no requiere infraestructura de GPU para inferencia.
- No soporta tool calling, function calling, razonamiento multi-paso, generación de texto, visión, audio ni capacidades multilingües.

## Casos de uso

- **Marcha continua en el microduck**: cargar la política en una ranura con `robotctl policy load` y dejar que el robot camine de forma indefinida. Es adecuada porque está entrenada para ese robot concreto y esa interfaz exacta de 61 observaciones y 14 acciones.
- **Evaluación comparativa de políticas**: al ser una iteración de hill climbing sobre `juicenv/microduck-hill-es8`, sirve para medir la mejora marginal de la búsqueda elitista frente a la base en la puntuación de Arena del proyecto.
- **Banco de pruebas de control a 50 Hz**: útil para validar la latencia del lazo de control y el rendimiento del runtime ONNX en el hardware del robot con una política ya entrenada.
- **Docencia e investigación en RL aplicado a robótica**: el linaje completo (base, iteraciones hc5b/hc6/hc7, repositorio de entrenamiento con commit fijo) permite reproducir y auditar el proceso de optimización.
- **Despliegue en flotas de microduck**: al ser un artefacto ONNX autocontenido con manifiesto versionado, se puede distribuir a varias unidades del mismo modelo de robot sin reentrenamiento.
- **Punto de partida para nuevos fine-tunings**: sirve como inicialización para ulteriores pasos de hill climbing o de otras estrategias de optimización sobre la misma función de puntuación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una "Arena score" como función objetivo del hill climbing, pero no reporta su valor ni métricas de locomoción (velocidad, estabilidad, consumo, tasa de caídas) ni comparaciones cuantitativas con la política base.

## Requisitos de hardware

- Inferencia en el propio robot microduck mediante runtime ONNX; no se especifican requisitos de VRAM ni de GPU.
- No se documenta el tamaño del grafo ONNX, por lo que no es posible estimar memoria de inferencia ni si cabría en GPU de consumo (RTX 4090, etc.).
- Despliegue previsto: daemon `robotctl` del robot, cargando la política en una ranura mediante `policy load`.
- No se documentan opciones de servido tipo vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: el lazo de control opera a 50 Hz (20 ms por paso), pero no se publican mediciones reales de latencia del grafo ni de carga de CPU en el robot.

## Comparativa con modelos similares

| Modelo | Base | Estrategia | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `suraj-phanindra/microduck-hill-hc5b-aifund` | `juicenv/microduck-hill-es8` | Elitist hill climbing (iteración 5b) | ONNX + manifest | no disponible | Hugging Face, 0 descargas |
| `suraj-phanindra/microduck-hill-hc6-aifund` | no disponible | Elitist hill climbing (iteración 6) | ONNX | no disponible | Hugging Face |
| `suraj-phanindra/microduck-hill-hc7-aifund` | no disponible | Elitist hill climbing (iteración 7) | ONNX | no disponible | Hugging Face |
| `juicenv/microduck-hill-es8` | no disponible | Política base del linaje | no disponible | no disponible | Hugging Face |

No se dispone de datos de parámetros, contexto ni rendimiento para ninguna de las alternativas, por lo que la comparación se limita al linaje y la estrategia de entrenamiento.

## Limitaciones y advertencias

- **Licencia no declarada**: sin licencia explícita no hay autorización clara para uso comercial ni para redistribución; conviene contactar con el autor antes de integrarlo en un producto.
- **Especificidad total al hardware**: la política está acoplada a la interfaz del microduck (61 observaciones, 14 acciones, 50 Hz); no es transferible a otro robot sin reentrenamiento.
- **Sin métricas publicadas**: no hay evidencia cuantitativa de robustez, estabilidad ni tasa de fallos; el hecho de que la puntuación de Arena no se reporte impide verificar la mejora sobre la base.
- **Riesgo de sobreajuste a la función objetivo**: el hill climbing elitista sobre una única puntuación puede producir políticas que exploten particularidades del evaluador sin mejorar la locomoción real.
- **Repositorio de 0.0 GB y 0 descargas**: no está claro que los pesos estén efectivamente alojados; verificar la disponibilidad de `policy.onnx` antes de planificar un despliegue.
- **Sin documentación de seguridad**: no se describen límites de par, paradas de emergencia ni comportamiento ante observaciones fuera de distribución, aspectos críticos en un robot físico.
- **Sin soporte de lenguaje ni multilingüe**: no aplica como modelo generativo; cualquier expectativa en ese sentido es un error de categoría.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/suraj-phanindra/microduck-hill-hc5b-aifund
- Modelo base: https://huggingface.co/juicenv/microduck-hill-es8
- Iteración hc6: https://huggingface.co/suraj-phanindra/microduck-hill-hc6-aifund
- Iteración hc7: https://huggingface.co/suraj-phanindra/microduck-hill-hc7-aifund
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL (referenciado en la model card): `pollen-robotics/microduck_rl`, rama `main`, commit `5cee942d8`
