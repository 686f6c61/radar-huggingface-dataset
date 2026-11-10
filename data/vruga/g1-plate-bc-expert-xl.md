# vruga/g1-plate-bc-expert-xl

## Resumen

`vruga/g1-plate-bc-expert-xl` es un modelo de aprendizaje por imitación (imitation learning) para control robótico, desarrollado por el usuario vruga y publicado en Hugging Face. Se trata de una política de comportamiento (behavior cloning) entrenada para que el robot humanoide Unitree G1 ejecute una tarea de transferencia de platos en el entorno de simulación BiGym. No es un modelo de lenguaje: es una política neuronal que mapea observaciones del robot y del entorno a acciones de control continuas.

El modelo sigue la misma receta que `vruga/g1-plate-bc-expert`, que según el autor es el modelo mejor evaluado de la familia, pero se entrena con aproximadamente cuatro veces más datos de experto: 60 demostraciones humanas más 1.329 episodios de un experto privilegiado, lo que suma 1,13 millones de fotogramas. La variante "xl" hace referencia a ese mayor volumen de datos y al sobremuestreo de determinados slots de observación (los slots 4-6, con un factor 2x).

Es importante señalar que se trata de un checkpoint intermedio de un entrenamiento que seguía en curso cuando se copió, y que no ha sido evaluado. Su relevancia es por tanto la de un artefacto de investigación en progreso dentro del ecosistema de robótica con aprendizaje por imitación sobre el simulador BiGym, más que la de un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de behavior cloning (no se especifica la arquitectura interna en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; opera sobre observaciones por paso) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | pesos PyTorch (cargables mediante `model.py` y `bc_policy.py`) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna de la red. Se describe como una política de behavior cloning con cabeza continua ("continuous head"), lo que indica que produce acciones continuas en lugar de discretas. El modelo se carga mediante dos módulos proporcionados en el repositorio, `model.py` y `bc_policy.py`, y se ejecuta con la variable de entorno `BC_EXECUTE=20`.

El entrenamiento combina 60 demostraciones humanas con 1.329 episodios generados por un experto privilegiado, totalizando 1,13 millones de fotogramas. Los slots de observación 4 a 6 se sobremuestrean con un factor 2x. El plan de entrenamiento era de 100.000 pasos, pero el checkpoint se copió en torno al paso 37.000, cuando la pérdida L1 sobre el conjunto de validación (held-out) registrada era de 0,0030. No se menciona el uso de RLHF, DPO ni ninguna otra técnica de ajuste por preferencias, lo cual es coherente con el paradigma de aprendizaje por imitación supervisado.

## Capacidades

- Ejecución de una tarea robótica concreta: transferencia de platos en el entorno BiGym con el humanoide Unitree G1.
- Generación de acciones de control continuas a partir de observaciones del robot y del entorno.
- Aprendizaje por imitación a partir de demostraciones humanas y episodios de experto privilegiado.
- No dispone de capacidades de generación de texto, razonamiento simbólico, código, matemáticas, visión general, tool calling ni agentes multi-paso.
- No dispone de capacidades multilingües ni de modo de razonamiento (thinking mode).

## Casos de uso

- Investigación en aprendizaje por imitación: sirve como checkpoint intermedio para estudiar la evolución de la pérdida L1 durante el entrenamiento y comparar con el modelo base `vruga/g1-plate-bc-expert`, ya que comparte receta y permite aislar el efecto del mayor volumen de datos.
- Reproducción de experimentos en BiGym: el par de módulos `model.py` y `bc_policy.py` permite cargar el modelo y ejecutarlo en el simulador para replicar las condiciones descritas por el autor.
- Punto de partida para fine-tuning: al estar bajo licencia Apache 2.0 y en formato PyTorch, puede reutilizarse como inicialización para entrenamientos posteriores sobre la misma tarea u otras tareas del humanoide Unitree G1.
- Evaluación comparativa de políticas: útil para contrastar el rendimiento de un checkpoint intermedio frente al modelo final de la familia en la misma tarea de transferencia de platos.
- Estudio del sobremuestreo de observaciones: el sobremuestreo 2x de los slots 4-6 permite analizar cómo afecta esta decisión de diseño a la convergencia y a la pérdida de validación.
- Docencia y divulgación en robótica: como ejemplo práctico de pipeline de behavior cloning con datos mixtos (humanos y de experto privilegiado) en un simulador accesible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato numérico reportado por el autor es la pérdida L1 sobre el conjunto de validación en el paso 37.000, con valor 0,0030, frente al valor final de 0,0040 del modelo mejor evaluado. El propio autor advierte que el error de acción no equivale al éxito en la tarea y que debe evaluarse antes de usarlo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0,1 GB, lo que sugiere un modelo compacto que probablemente quepa en GPUs de consumo, aunque no se confirma en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; por el tamaño del repositorio es plausible, pero no hay dato oficial.
- Opciones de despliegue: carga mediante PyTorch con los módulos `model.py` y `bc_policy.py` del repositorio, ejecutando con `BC_EXECUTE=20`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `vruga/g1-plate-bc-expert-xl` (este) | no disponible | no aplica | L1 held-out 0,0030 en paso 37k; sin evaluar en tarea | Apache 2.0 | Hugging Face |
| `vruga/g1-plate-bc-expert` | no disponible | no aplica | Mejor evaluado según el autor; L1 final 0,0040 | no disponible en la información | Hugging Face |
| Otras políticas para BiGym o Unitree G1 | no disponible | no aplica | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Checkpoint intermedio: el entrenamiento seguía en curso al copiarse el modelo; no representa el resultado final de la receta.
- Sin evaluar: el autor indica explícitamente que no ha sido evaluado y que el error de acción no equivale al éxito en la tarea.
- Sesgos conocidos: no disponibles; al entrenarse con 60 demostraciones humanas y episodios de experto privilegiado, puede heredar sesgos de esas demostraciones, pero no se documentan.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero sí existe riesgo de generalización deficiente fuera de la distribución de entrenamiento.
- Limitaciones de contexto o idioma: no aplica; el modelo está acotado a la tarea de transferencia de platos en BiGym con Unitree G1.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo depende de entornos de simulación y frameworks externos cuyas licencias deben verificarse por separado.
- Caveat para producción: no debe desplegarse en producción sin una evaluación previa de éxito en la tarea; el propio autor lo advierte.

## Enlaces

- Hugging Face: https://huggingface.co/vruga/g1-plate-bc-expert-xl
- Modelo base de referencia: https://huggingface.co/vruga/g1-plate-bc-expert
- BiGym (entorno de simulación): no disponible en la información proporcionada
- Unitree G1 (robot): no disponible en la información proporcionada
