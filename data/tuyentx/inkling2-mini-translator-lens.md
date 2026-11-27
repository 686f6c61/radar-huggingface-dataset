# tuyentx/inkling2-mini-translator-lens

## Resumen

Inkling2-mini-translator-lens es un conjunto de pesos auxiliares (no un modelo completo) publicado por el usuario tuyentx para el modelo `thinkingmachines/Inkling-2-Mini`, en el marco del Looped Lens Challenge. Se trata de "traductores residuales": pequeñas transformaciones de rango 256 que se aplican sobre la activación residual `x` de una visita concreta del stack de capas antes de la normalización final y el unembedding del modelo base, de modo que los logits resultantes quedan corregidos hacia el comportamiento deseado.

Cada traductor implementa la operación `out = z + B(Az) + b`, donde `z = x / rms(x)` en fp32 y las matrices `A` (256 x 2304) y `B` (2304 x 256) junto con el vector `b` (2304) se almacenan en bfloat16. Los pesos se organizan por visita (`v`): `ct_late.safetensors` cubre las visitas 42, 46 y 47, mientras que `reply_mid.safetensors` cubre las visitas 9, 12, 14, 22, 31 y 34.

El interés del artefacto es metodológico: demuestra cómo un ajuste ligero sobre activaciones internas (fitted con entropía cruzada multi-positivo sobre 30.000 prompts sintéticos de aritmética y cadenas de operaciones) puede modificar la generación del modelo base sin reentrenarlo. El repositorio tiene 0 GB de tamaño declarado, 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Traductores residuales de bajo rango (rank 256) sobre activaciones de un transformer; no es un modelo autonomo |
| Parametros totales | No disponible como cifra agregada; por visita: A (256 x 2304) + B (2304 x 256) + b (2304), en bfloat16 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base Inkling-2-Mini) |
| Tipos de cuantizacion | No disponible; pesos almacenados en bfloat16 |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (`ct_late.safetensors`, `reply_mid.safetensors`) |

## Arquitectura y entrenamiento

El artefacto no es un transformer completo, sino un parche sobre las activaciones residuales del modelo `thinkingmachines/Inkling-2-Mini`. Para una visita `v` del stack de capas, el traductor normaliza la activación con RMSNorm en fp32 (`z = x / rms(x)`), aplica una proyección de rango 256 (`B(Az)`) y suma un sesgo `b`, devolviendo una activación corregida que se pasa a la normalización final y al `lm_head` del modelo base. La dimensión residual implícita es 2304, deducible de las formas de `A` y `B`.

El entrenamiento se realizó sobre 30.000 prompts sintéticos de aritmética y cadenas de operaciones generados específicamente para la tarea, con una pérdida de entropía cruzada multi-positivo aplicada sobre los tokens que escriben el valor intermedio. Los pesos de `ct_late` se ajustaron sobre el token `<|content_text|>` que abre la respuesta, y los de `reply_mid` sobre el token `<|message_model|>` que inicia la réplica. Según la model card, no se utilizó ninguna pregunta del challenge en el ajuste. No se documentan detalles adicionales sobre hiperparámetros, optimizador o duración del entrenamiento.

## Capacidades

- Corrección de activaciones residuales en visitas específicas del stack de Inkling-2-Mini (visitas 9, 12, 14, 22, 31, 34, 42, 46 y 47).
- Modulación de la generación en los tokens de apertura de respuesta (`<|content_text|>` y `<|message_model|>`).
- Mejora orientada a tareas aritméticas y de cadena de operaciones, según el corpus de ajuste.
- Integración con el `lm_head` y la normalización final del modelo base sin modificarlos.
- No incorpora tool calling, capacidades de agente, visión ni audio por sí mismo.
- No es un modelo autónomo: no genera texto sin el modelo base.

## Casos de uso

- Investigación en interpretabilidad: aplicar los traductores sobre activaciones intermedias para estudiar cómo cambia la distribución de logits en las visitas 42, 46 y 47, aislando el efecto de una transformación de rango 256.
- Experimentación en el Looped Lens Challenge: reproducir o comparar la entrada de tuyentx con otras lentes del challenge usando los mismos prompts sintéticos de aritmética.
- Análisis de cadenas de operaciones: evaluar si el ajuste sobre tokens de valor intermedio mejora la coherencia de los pasos intermedios en tareas de aritmética multi-paso.
- Estudio de puntos de intervención: comparar el efecto de aplicar `reply_mid` en la visita 9 frente a la 34 para determinar en qué profundidad del stack es más eficaz la corrección.
- Prototipado de técnicas de ajuste ligero: usar la estructura `A`/`B`/`b` como plantilla para adaptar modelos de 2304 dimensiones residuales con un coste de parámetros muy reducido.
- Docencia y divulgación: ilustrar con un caso real cómo se modifica la salida de un transformer mediante una proyección de bajo rango sobre el residual, sin reentrenar el modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende enteramente del modelo base Inkling-2-Mini, no de los traductores.
- Los traductores suman, por visita, 256 x 2304 + 2304 x 256 + 2304 elementos en bfloat16 (aproximadamente 2,4 MB por visita), un coste despreciable frente al modelo base.
- GPU recomendadas: no disponibles para el artefacto; vienen determinadas por Inkling-2-Mini.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible; requiere cargar los safetensors junto con el modelo base y aplicar la transformación en las visitas indicadas.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling2-mini-translator-lens (tuyentx) | Traductor residual de rango 256 | Aprox. 2,4 MB por visita en bf16 | No disponible | MIT | Hugging Face |
| Modelo base `thinkingmachines/Inkling-2-Mini` | Modelo completo | No disponible | No disponible | No disponible | Referenciado en la model card |
| Otras entradas del Looped Lens Challenge | Lentes residuales | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre otros artefactos comparables del mismo challenge ni de sus métricas.

## Limitaciones y advertencias

- No es un modelo autónomo: sin el modelo base `thinkingmachines/Inkling-2-Mini` los pesos no producen salida alguna.
- El ajuste se realizó exclusivamente sobre prompts sintéticos de aritmética y cadenas de operaciones; el comportamiento fuera de ese dominio no está documentado.
- No se han publicado evaluaciones cuantitativas (benchmarks, tasas de error, comparaciones) en la información disponible.
- Los pesos están en bfloat16; no se documentan versiones cuantizadas ni compatibilidad con formatos GGUF.
- La model card no especifica los idiomas soportados ni el contexto efectivo, que dependen del modelo base.
- El repositorio presenta 0 descargas y 0 likes, sin señales de validación por parte de la comunidad.
- Licencia MIT permite uso comercial del artefacto, pero el uso del modelo base puede estar sujeto a condiciones adicionales no detalladas en esta información.
- Riesgo de alucinación y sesgos: no evaluado en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/tuyentx/inkling2-mini-translator-lens
- Modelo base referenciado: `thinkingmachines/Inkling-2-Mini` (no se proporciona URL directa en la información disponible)
- Looped Lens Challenge: no se proporciona URL en la información disponible
