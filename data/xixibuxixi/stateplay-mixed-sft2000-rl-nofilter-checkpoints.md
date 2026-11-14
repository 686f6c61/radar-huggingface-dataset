# xixibuxixi/StatePlay-Mixed-SFT2000-RL-NoFilter-Checkpoints

## Resumen

StatePlay-Mixed-SFT2000-RL-NoFilter-Checkpoints es un repositorio público de Hugging Face publicado por el usuario xixibuxixi que contiene dos instantáneas de parámetros aprendidos (overlays) resultantes de un proceso de aprendizaje por refuerzo sobre una base denominada StatePlay mixed-SFT2000. No se trata de un modelo de lenguaje independiente, sino de un conjunto de tensores que deben aplicarse por su nombre exacto de state-dict sobre el modelo base o runtime correspondiente de StatePlay. El repositorio tiene un tamaño de 0,1 GB y se distribuye en formato safetensors bajo licencia "other".

Las dos instantáneas corresponden a los pasos de optimizador 148 (cursor 1184) y 320 (cursor 2560), con 14.444.800 parámetros aprendidos cada una. Ambas se generaron con un esquema de RL dual mixto ("Both") y con el rechazo por grupo desactivado (keep_all), y se congelaron desde su propio puntero latest.json verificado sin detener la ejecución de entrenamiento activa. El repositorio incluye manifiestos con hashes SHA-256 del checkpoint fuente y de los pesos exportados.

La relevancia de este artefacto es acotada: no documenta arquitectura, tokenizador, contexto ni capacidades de un modelo completo, y no aporta benchmarks ni datos de entrenamiento detallados. Es material de investigación intermedio útil únicamente para quien ya disponga del base/runtime StatePlay mixed-SFT2000 y quiera reproducir o auditar las actualizaciones de RL aplicadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (overlay de parámetros sobre base StatePlay mixed-SFT2000; arquitectura del base no documentada) |
| Parámetros totales | no disponible (el overlay contiene 14.444.800 parámetros aprendidos por instantánea) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El repositorio no describe la arquitectura del modelo subyacente. Lo que sí documenta es el procedimiento de entrenamiento: dos ejecuciones de aprendizaje por refuerzo con esquema "Both" mixed-dual, es decir, una variante de RL que combina dos señales o modos de optimización, y con el filtrado por rechazo de grupo desactivado (keep_all), de modo que todas las muestras del grupo se conservan en la actualización. Cada snapshot se congela desde su propio puntero latest.json verificado, con registro inmutable de hashes SHA-256 tanto del checkpoint fuente como de los pesos exportados, lo que permite auditar la integridad de la exportación.

Los artefactos son overlays de parámetros, no pesos completos: deben aplicarse tensor a tensor por su nombre exacto de state-dict sobre el base/runtime StatePlay mixed-SFT2000 correspondiente. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas previas de SFT, RLHF o DPO más allá de la referencia nominal a "mixed-SFT2000" en el nombre del proyecto. Tampoco se detalla ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.).

## Capacidades

- No se documentan capacidades funcionales del modelo: el repositorio contiene únicamente overlays de parámetros de RL, no un modelo ejecutable de forma autónoma.
- No hay información sobre generación de texto, razonamiento, código, matemáticas o visión.
- No hay información sobre soporte de tool calling o function calling.
- No hay información sobre capacidades de agente o razonamiento multi-paso.
- No hay información sobre capacidades multilingües.
- No hay información sobre modos especiales (thinking mode, visión, audio).
- La única funcionalidad verificable es la aplicación de los tensores sobre el base/runtime StatePlay mixed-SFT2000 por nombre de state-dict.

## Casos de uso

- Auditoría de integridad de checkpoints de RL: los manifiestos incluyen SHA-256 del checkpoint fuente y de los pesos exportados, lo que permite verificar que los tensores aplicados corresponden exactamente a la instantánea declarada en un pipeline de investigación reproducible.
- Reproducción de experimentos de RL con rechazo por grupo desactivado: los dos snapshots (pasos 148 y 320) permiten comparar el efecto de keep_all frente a esquemas con filtrado, siempre que se disponga del base StatePlay mixed-SFT2000.
- Estudio de la evolución de parámetros aprendidos entre pasos de optimizador: la diferencia entre cursor 1184 y cursor 2560 sobre los mismos 14.444.800 parámetros permite analizar la dinámica de actualización del overlay.
- Integración en un runtime StatePlay existente: un equipo que ya opere el base/runtime puede cargar el overlay por nombre de state-dict para evaluar el efecto del RL en sus tareas internas.
- Trazabilidad de experimentos en entornos de investigación: el uso de punteros latest.json congelados y hashes permite enlazar resultados aguas abajo con una versión exacta del overlay.
- Docencia o formación en flujos de RL aplicado: sirve como ejemplo de exportación de overlays con verificación criptográfica, aunque no como modelo demostrable de forma aislada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un overlay de 14.444.800 parámetros por instantánea, el requisito real depende del base/runtime StatePlay mixed-SFT2000, que no se documenta.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no determinable sin conocer el modelo base.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el uso previsto es la aplicación de tensores por nombre de state-dict sobre el runtime StatePlay.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo de artefacto | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| StatePlay-Mixed-SFT2000-RL-NoFilter-Checkpoints | Overlay de parámetros RL (safetensors) | 14.444.800 parámetros aprendidos por snapshot | no disponible | other | Hugging Face (0 descargas, 0 likes) |
| Modelos comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se identifican en la información proporcionada modelos directamente comparables, dado que el artefacto es un overlay de RL y no un modelo completo con arquitectura y capacidades documentadas.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el base/runtime StatePlay mixed-SFT2000 y la aplicación exacta por nombre de state-dict; sin él, los tensores no son utilizables.
- Ausencia total de documentación sobre arquitectura, tokenizador, contexto, idiomas y datos de entrenamiento del modelo base.
- Licencia "other" sin texto de licencia incluido en la información disponible: es imprescindible revisar los términos antes de cualquier uso comercial.
- Sin benchmarks ni evaluaciones publicadas: no hay evidencia de rendimiento que respalde su uso en producción.
- Riesgo de desalineación de state-dict: si los nombres de tensores no coinciden exactamente con el base, la carga fallará o producirá resultados incorrectos.
- Repositorio sin descargas ni likes y con fecha de creación posterior a la actual: madurez y mantenimiento no verificables.
- Los snapshots se congelaron mientras la ejecución de entrenamiento seguía activa, por lo que no representan necesariamente el estado final del entrenamiento.
- No se documentan sesgos, riesgo de alucinación ni limitaciones idiomáticas porque no hay información sobre el comportamiento del modelo resultante.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/xixibuxixi/StatePlay-Mixed-SFT2000-RL-NoFilter-Checkpoints
- Paper, blog, repositorio de código o demo: no disponibles en la información proporcionada.
