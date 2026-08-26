# vlabki/rr-speed-v4-gate

## Resumen

El modelo `vlabki/rr-speed-v4-gate` es una copia byte-idéntica del modelo `vlabki/rr-speed-v4`, desarrollado por VictoryLab (usuario `vlabki`). Se trata de un agente de control para un juego de carreras (probablemente "Rainbow Road"), entrenado mediante *behavior cloning* (BC) con una arquitectura recurrente (etiqueta `rr_player_recurrent_bc`). El único cambio respecto al original es la modificación de `game.item_rule` en `config.yaml`, pasando de `None` a `Recommended`, lo que afecta a cómo el bot del juego interpreta la política de uso de ítems. Con solo 575.410 parámetros, es un modelo extremadamente pequeño, pensado para tareas de control en tiempo real dentro del entorno del juego.

La relevancia de este modelo es limitada fuera de su contexto específico: sirve como ejemplo de aplicación de *behavior cloning* a un agente de juego y como herramienta de comparación para variaciones de configuración (con y sin ítems). No es un modelo de lenguaje ni de propósito general; su ámbito se restringe al control de un vehículo en una pista de carreras simulada. La ausencia de licencia explícita y de documentación detallada de entrenamiento limita su uso en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Recurrente (no se especifica tipo exacto; etiqueta `rr_player_recurrent_bc`) |
| Parametros totales | 575.410 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de control, no de lenguaje) |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | no disponible (no es un modelo de texto) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es recurrente, como indica la etiqueta `rr_player_recurrent_bc`. Esto sugiere que el modelo procesa secuencias de observaciones para decidir acciones, probablemente mediante una red LSTM o GRU. La observación tiene 223 dimensiones e incluye características del estado del juego, pero **no incluye ninguna característica relacionada con los ítems** (objetos que se pueden recoger y usar durante la carrera). El entrenamiento se realizó mediante *behavior cloning*, es decir, imitando demostraciones de un experto, aunque no se proporcionan detalles sobre el volumen de datos ni el proceso exacto.

Una particularidad destacable es que `action_support: bc` enmascara todas las acciones que implican el uso de ítems (60 acciones en total). Esto significa que el modelo nunca aprende a usar ítems y, por tanto, su política es efectiva solo en carreras sin ítems. La modificación en `config.yaml` (`game.item_rule: Recommended`) solo afecta a la configuración del bot que carga el modelo, no a los pesos del modelo en sí.

## Capacidades

- Control de un agente en un juego de carreras (probablemente Rainbow Road) mediante observaciones de alta dimensión (223 features).
- Aprendizaje por imitación (behavior cloning) de demostraciones de un experto.
- Política recurrente que procesa secuencias temporales de observaciones.
- Ejecución en tiempo real gracias a su tamaño reducido (575K parámetros).
- No tiene capacidad de procesamiento de lenguaje natural ni de visión general; es un modelo de control específico.
- No puede ver ni usar ítems del juego, ya que las acciones correspondientes están enmascaradas y no hay características de ítems en la observación.

## Casos de uso

- **Investigación en behavior cloning para juegos**: permite estudiar cómo un agente aprende a completar una pista mediante imitación, sin necesidad de refuerzo explícito.
- **Comparación de configuraciones de ítems**: al existir una variante sin el cambio (`rr-speed-v4`), se pueden comparar los efectos de la regla de ítems en el rendimiento del agente.
- **Benchmark de control en tiempo real**: su tamaño mínimo lo hace apto para medir latencia y throughput en entornos simulados.
- **Pruebas de integración de bots**: el modelo se usa en el bot `/match_bot` para partidas automáticas; esta variante facilita que el bot use la regla `Recommended` por defecto.
- **Educación en IA para juegos**: sirve como ejemplo didáctico de un agente de carreras con arquitectura recurrente y entrenamiento por imitación.
- **Experimentos de transferencia de políticas**: al ser una copia byte-idéntica con solo un cambio de configuración, permite aislar el efecto de la configuración sobre el comportamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que, en condiciones sin ítems, el modelo completa la carrera en 4 de 5 intentos, mientras que con ítems solo en 1 de 5, pero estos datos son anecdóticos y no provienen de una evaluación estandarizada.

## Requisitos de hardware

- **VRAM estimada**: inferior a 1 GB (modelo de 575K parámetros en precisión float32 ocupa ~2.3 MB; en cuantización aún menos).
- **GPU recomendadas**: cualquier GPU con al menos 1 GB de VRAM, aunque incluso una CPU moderna puede ejecutarlo en tiempo real.
- **Compatibilidad con GPU de consumo**: sí, cualquier GPU de consumo (GTX 1050, RTX 2060, etc.) es más que suficiente.
- **Opciones de despliegue**: al ser un modelo safetensors no estándar, no es compatible con frameworks como vLLM u Ollama; se cargaría directamente con PyTorch o el framework específico del bot.
- **Latencia y throughput**: no hay datos oficiales, pero por su tamaño se espera una inferencia en microsegundos por paso en GPU.

## Comparativa con modelos similares

No disponible. No se conocen otros modelos públicos con la misma finalidad (control de agente en Rainbow Road con behavior cloning) en HuggingFace. El único modelo comparable es su predecesor `vlabki/rr-speed-v4`, del cual es una copia exacta salvo por la configuración de `item_rule`.

## Limitaciones y advertencias

- **Incapacidad de usar ítems**: el modelo no puede ver ni usar ítems, lo que reduce drásticamente su rendimiento en carreras con ítems (completa solo 1 de 5 intentos según la model card).
- **Sesgos de entrenamiento**: al ser behavior cloning, el modelo imita los sesgos del experto que generó las demostraciones; no se conocen detalles sobre la diversidad de esos datos.
- **Riesgo de alucinación**: no aplica, al ser un modelo de control no genera texto.
- **Limitaciones de contexto**: no tiene contexto lingüístico; solo procesa observaciones numéricas.
- **Restricciones de licencia**: la licencia no está especificada, por lo que el uso comercial es incierto y requiere consulta al autor.
- **Documentación insuficiente**: no hay información sobre hiperparámetros, dataset de entrenamiento ni procedimiento de evaluación.
- **Obsolescencia**: la fecha de creación (2026-08-26) es futura, lo que sugiere que el modelo podría estar desactualizado o ser parte de un experimento temporal.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/vlabki/rr-speed-v4-gate)
- [Perfil de VictoryLab en HuggingFace](https://huggingface.co/vlabki)
