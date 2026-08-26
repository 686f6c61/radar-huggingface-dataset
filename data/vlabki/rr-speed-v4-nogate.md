# vlabki/rr-speed-v4-nogate

## Resumen

El modelo `vlabki/rr-speed-v4-nogate` es una copia byte-idéntica de los pesos de `vlabki/rr-speed-v4`, publicada por VictoryLab (usuario `vlabki`). Se trata de un modelo de política para el agente de carreras del juego Rainbow Road, entrenado mediante *behavioral cloning* (BC) con una arquitectura recurrente (indicada por la etiqueta `rr_player_recurrent_bc`). El único cambio respecto al original es la modificación del campo `game.item_rule` en `config.yaml`, que pasa de `None` a `Recommended`, para que el bot `/match_bot` lea ese valor por defecto en la interfaz de ítems.

El modelo es extremadamente pequeño: 575.410 parámetros, con observaciones de 223 dimensiones y un espacio de acciones que incluye 60 acciones de ítems que están completamente enmascaradas (el modelo no puede ver ítems en la observación). Está diseñado para controlar un agente en un entorno de simulación de carreras, no para tareas de lenguaje. Su relevancia es exclusivamente dentro del ecosistema de bots de Rainbow Road, donde se utiliza para comparar configuraciones de ítems y evaluar el impacto en la tasa de finalización de la carrera.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red recurrente (probablemente LSTM o GRU, según tag `rr_player_recurrent_bc`) |
| Parametros totales | 575.410 |
| Parametros activos | no disponible (no se especifica si es MoE; se asume denso) |
| Longitud de contexto | no aplicable (modelo de control, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es recurrente, como indica la etiqueta `rr_player_recurrent_bc`. Se trata de un modelo de política que procesa observaciones de 223 dimensiones (presumiblemente estado del vehículo, posición, velocidad, etc.) y produce una distribución sobre acciones discretas. El entrenamiento se realizó mediante *behavioral cloning* (BC), es decir, imitando demostraciones de un experto. No se dispone de detalles sobre el número de tokens (no aplicable), el tamaño del dataset de demostraciones ni si se usaron técnicas adicionales como RLHF o DPO. La característica técnica más destacable es el enmascarado de las 60 acciones relacionadas con el uso de ítems: el modelo no puede seleccionar acciones que requieran ítems porque la observación no contiene características de ítems y `action_support: bc` las enmascara por completo. Esto implica que la política ignora deliberadamente los ítems, lo que afecta a su comportamiento en carrera.

## Capacidades

- Control de un agente de carreras en el entorno Rainbow Road, produciendo acciones a partir de observaciones vectoriales de 223 dimensiones.
- Generación de trayectorias de conducción mediante política aprendida por imitación.
- Capacidad de recoger ítems y llevarlos hasta la línea de meta, aunque sin usarlos (las acciones de ítems están enmascaradas).
- No genera texto, no razona, no ejecuta código ni tiene capacidades multimodales.
- No soporta *tool calling* ni funciones de agente en el sentido de los LLM.
- No es multilingüe; es un modelo de control específico de dominio.

## Casos de uso

- Evaluación de políticas de conducción sin uso de ítems: el modelo sirve para medir el rendimiento de un agente que ignora los ítems, comparando tasas de finalización (4/5 sin ítems vs 1/5 con ítems, según la model card).
- Comparación de configuraciones de ítems en el bot `/match_bot`: al cambiar `item_rule` a `Recommended`, se puede probar cómo afecta la política cuando se le permite ver ítems (aunque en este modelo no los ve).
- Investigación en *behavioral cloning* para entornos de simulación con observaciones de baja dimensión y espacios de acción discretos.
- Test de robustez de políticas recurrentes en tareas de control continuo (conducir un vehículo en un circuito).
- Benchmark de modelos de control pequeños en entornos de carreras, comparando con otras variantes de `rr-speed`.
- Análisis del impacto del enmascarado de acciones en el comportamiento de un agente entrenado por imitación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica mencionada en la model card es la tasa de finalización de carrera: el modelo completa la carrera en 4 de 5 intentos sin ítems y en 1 de 5 con ítems (aunque no puede usarlos, los recoge y los lleva). No hay comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 575.410 parámetros, el modelo ocupa aproximadamente 2,3 MB en float32 (575.410 × 4 bytes) y 1,15 MB en float16. Cabe en cualquier GPU, incluso en las más antiguas, y también en CPU.
- GPU recomendadas: cualquiera con al menos 1 GB de VRAM (incluso integradas). Una GPU de consumo como una GTX 1050 Ti o superior es más que suficiente.
- Es viable en hardware de consumo (cualquier PC con CPU moderna).
- Opciones de despliegue: al ser un modelo safetensors, se puede cargar con PyTorch o cualquier framework que soporte ese formato. No hay integraciones conocidas con vLLM, llama.cpp, Ollama o TGI (no es un LLM).
- Latencia y throughput: no se dispone de datos, pero al ser tan pequeño, la inferencia es prácticamente instantánea (menos de 1 ms en GPU, unos pocos ms en CPU).

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables dentro del mismo dominio (políticas de control para Rainbow Road). El autor menciona que existe `rr-speed-v4` (original) y probablemente variantes con o sin "gate", pero no hay datos públicos de otros modelos. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo no puede ver ítems: la observación de 223 dimensiones no incluye características de ítems, y las 60 acciones de ítems están enmascaradas. Esto limita su comportamiento en situaciones donde el uso de ítems sería beneficioso.
- La tasa de finalización con ítems es notablemente baja (1/5), lo que sugiere que la política no está optimizada para manejar la presencia de ítems en el entorno.
- No es un modelo de lenguaje ni un sistema de propósito general; su uso fuera del entorno Rainbow Road no tiene sentido.
- La licencia no está especificada, por lo que no se garantiza permiso para uso comercial o modificación.
- No se han publicado detalles sobre sesgos o alucinaciones (no aplicable, al no ser un modelo generativo de texto).
- El modelo es una copia de otro con un cambio de configuración; los pesos son idénticos, por lo que las limitaciones de `rr-speed-v4` se heredan.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vlabki/rr-speed-v4-nogate
- Perfil de la organización VictoryLab: https://huggingface.co/vlabki
- Búsqueda de modelos relacionados con Rainbow Road: https://huggingface.co/models?other=rainbow-road
