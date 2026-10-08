# stuartwvmc1006/dissertation-multitask

## Resumen

`stuartwvmc1006/dissertation-multitask`, publicado en HuggingFace bajo el nombre "Mixer for Multitask", es un repositorio que empaqueta una implementación propia de una arquitectura tipo Mixer (familia MLP-Mixer) orientada a aprendizaje multitarea, junto con su fichero de configuración (`config.json`), una receta de experimento por defecto (`training_args.json`) y un punto de entrada de entrenamiento (`train.py`). El autor lo presenta explícitamente como un punto de partida reproducible para una disertación académica, no como la publicación de un modelo entrenado.

El dato más relevante para cualquier evaluador es su estado: el único checkpoint incluido (`model.safetensors`) es una inicialización válida para pruebas de humo (smoke tests), no un modelo con pesos entrenados. El recuento de parámetros reportado por safetensors es de 33.088 y el tamaño del repositorio es de 0.0 GB, coherente con un artefacto de pesos muy reducido. No se declara puntuación de benchmark alguna ni se aporta información sobre idiomas, longitud de contexto o datos de entrenamiento.

Su relevancia es, por tanto, metodológica más que de rendimiento: sirve como base reproducible para experimentos académicos sobre arquitecturas Mixer aplicadas a multitarea, y como ejemplo de repositorio que documenta honestamente la diferencia entre "código de arquitectura" y "modelo entrenado". Cualquier uso que exija generación de texto, razonamiento o capacidades lingüísticas queda fuera de su alcance en el estado actual.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixer (familia MLP-Mixer, implementación propia) |
| Parámetros totales | 33.088 (recuento reportado por safetensors) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (solo se distribuye el checkpoint en safetensors; no hay variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (más `config.json` y `training_args.json`) |
| Escala declarada | "huge" (según la model card) |
| Mecanismo de atención | flash (según la model card) |
| Fusión | low rank (rango bajo) |
| Activación | approx gelu (GELU aproximada) |
| Normalización | instancenorm (InstanceNorm) |
| Optimizador de la receta por defecto | AdamW con schedule exponencial |
| Estado del checkpoint | inicialización sin entrenar (smoke test) |
| Tamaño del repositorio | 0.0 GB |
| Descargas / likes | 0 / 0 |
| Pipeline declarado | no disponible |
| Fecha de creación en el Hub | 2026-10-07 (según metadatos del repositorio) |

## Arquitectura y entrenamiento

La arquitectura declarada es un Mixer, es decir, un diseño que sustituye el mecanismo de atención por operaciones de mezcla (*mixing*) sobre tokens y canales, típicamente implementadas como perceptrones multicapa. La model card añade los siguientes detalles de configuración: atención de tipo flash, fusión de rango bajo (*low rank*), activación GELU aproximada y normalización InstanceNorm. No se especifica el número de capas, la dimensión de los canales, la dimensión oculta de los MLP de mezcla, el número de parches o tokens de entrada, ni el tamaño de vocabulario, por lo que no es posible reconstruir la topología completa a partir de la información disponible.

En cuanto al entrenamiento, no existe. El autor indica de forma explícita que `model.safetensors` es un "checkpoint de inicialización válido para pruebas de humo" y que "no se presenta como un checkpoint entrenado con benchmark". No hay datos sobre volumen de tokens, composición del dataset, número de épocas, ni sobre técnicas de alineación como RLHF, DPO o SFT. La receta incluida (AdamW con schedule exponencial) se describe como valores de partida del script, no como evidencia de una ejecución completada. La model card recomienda, para cualquier evaluación futura, entrenar todas las líneas base con la misma exposición de datos, el mismo presupuesto de ajuste y las mismas semillas aleatorias, y reportar la métrica de tarea en al menos tres semillas junto con una línea base de capacidad equivalente.

## Capacidades

- Modelo sin entrenar: no se le puede atribuir ninguna capacidad funcional verificada. No genera texto coherente ni resuelve tareas, porque sus pesos son una inicialización aleatoria.
- Artefacto de código ejecutable: incluye `train.py` con bloque `__main__` y ejemplo de prueba de humo, utilizable como punto de entrada de entrenamiento.
- Configuración reproducible: `config.json` registra los ajustes de arquitectura generados y `training_args.json` la receta de experimento por defecto.
- Componentes arquitectónicos disponibles en la implementación: mezcla de tokens y canales, fusión de rango bajo, atención flash, normalización InstanceNorm y activación GELU aproximada (según la model card).
- Soporte de tool calling / function calling: no disponible. No hay indicios de plantillas de herramientas, tokens especiales ni entrenamiento orientado a agentes.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible. No se declara ningún idioma.
- Capacidades especiales (modo *thinking*, visión, audio): no disponible.

## Casos de uso

- Reproducción de experimentos académicos: el repositorio está pensado como base para una disertación. Se usaría fijando semillas, registrando versiones de entorno y comparando variantes de arquitectura Mixer bajo el mismo presupuesto de cómputo.
- Pruebas de humo en integración continua: al ser un checkpoint de inicialización de 33.088 parámetros, permite verificar que el pipeline de carga de safetensors, construcción del grafo y guardado de pesos funciona antes de lanzar entrenamientos costosos.
- Línea base de capacidad equivalente (*matched-capacity baseline*): sirve como referencia de igual número de parámetros frente a otras arquitecturas multitarea, tal y como recomienda la propia model card.
- Docencia sobre arquitecturas Mixer: el código y la configuración permiten ilustrar en clase cómo se sustituye la atención por mezclas MLP, con un coste computacional trivial para el alumnado.
- Desarrollo de adaptadores de carga: dado que es una implementación propia, requiere un adaptador explícito para funcionar con APIs genéricas de carga. El repositorio es un banco de pruebas adecuado para escribir y validar ese adaptador.
- Estudio de componentes concretos: permite aislar y medir el efecto de decisiones de diseño como la fusión de rango bajo, la normalización InstanceNorm o la GELU aproximada, sin el ruido de un modelo ya entrenado.
- Esqueleto para *fine-tuning* multitarea: un equipo que quiera partir de esta topología puede entrenarla desde cero sobre sus propios datos, reutilizando la receta AdamW con schedule exponencial como punto de partida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card lo declara de forma explícita: "No benchmark score is claimed in this repository". Además, el checkpoint distribuido no ha sido entrenado, por lo que cualquier medición sobre él no tendría valor comparativo.

## Requisitos de hardware

- VRAM estimada para inferencia: mínima. Con 33.088 parámetros, los pesos ocupan aproximadamente 132 KB en fp32 y 66 KB en fp16, sin contar estados de optimizador ni activaciones (cifras derivadas del recuento de parámetros reportado; el repositorio no las publica).
- Entrenamiento: con AdamW, el coste conjunto de pesos, gradientes y los dos momentos del optimizador en fp32 rondaría 0,5 MB, además de las activaciones.
- GPU recomendadas: no se requiere GPU. Cualquier CPU moderna es suficiente; cualquier GPU de consumo, incluida una integrada, sirve para pruebas de humo.
- ¿Cabe en GPU de consumo? Sí, con enorme holgura. Las restricciones reales vendrían del tamaño de lote y de la longitud de secuencia, parámetros que no se detallan en la información disponible.
- Opciones de despliegue: vLLM, llama.cpp, Ollama y TGI no soportan esta implementación de forma nativa, ya que es código propio. La model card indica que las APIs genéricas de carga automática requieren un adaptador explícito; el uso previsto es ejecutar `train.py` directamente.
- Latencia y throughput: no disponible. No hay mediciones publicadas ni configuración de secuencia declarada para estimarlas con fundamento.

## Comparativa con modelos similares

No existen, en la información proporcionada, modelos comparables directos: se trata de un checkpoint de inicialización sin entrenar y sin métricas. La referencia conceptual es la arquitectura MLP-Mixer original.

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| dissertation-multitask (Mixer for Multitask) | Mixer con atención flash y fusión de rango bajo | 33.088 (safetensors) | no disponible | Apache 2.0 | Checkpoint de inicialización, sin entrenar |
| MLP-Mixer (referencia conceptual de la familia) | Mixer puro (mezcla de tokens y canales) | no disponible en la información proporcionada | no disponible | Apache 2.0 en el repositorio oficial de referencia | Modelo entrenado para clasificación de imágenes |
| Otros repositorios de inicialización multitarea | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación cuantitativa de rendimiento no es posible: este repositorio no publica puntuaciones y no se ha ejecutado entrenamiento alguno sobre él.

## Limitaciones y advertencias

- Checkpoint sin entrenar: los pesos son una inicialización. No debe usarse para inferencia real ni presentarse como modelo funcional.
- Sin benchmarks: no hay métricas de MMLU, HumanEval, GSM8K ni de ninguna otra tarea. Cualquier cifra que se atribuya al modelo sería inventada.
- Sin auditoría: la model card indica que la inicialización no ha sido auditada en robustez, equidad ni transferencia de dominio.
- Inconsistencia de escala: la model card etiqueta la configuración como "huge", mientras que el recuento de safetensors es de 33.088 parámetros. La discrepancia no está explicada en el repositorio.
- Metadatos incompletos: no se declaran idiomas, longitud de contexto, número de capas ni dimensión de los MLP de mezcla, lo que impide evaluar su idoneidad para cualquier tarea concreta.
- Fecha de creación anómala: los metadatos del Hub indican 2026-10-07, una fecha que conviene verificar antes de citar el repositorio.
- Carga no estándar: al ser una implementación propia, no funciona con `AutoModel` ni con runtimes de inferencia habituales sin escribir un adaptador.
- Riesgo de alucinación: no aplicable en su estado actual, ya que no es un modelo de lenguaje entrenado. No debe confundirse con un generador de texto.
- Sesgos: no evaluados. No hay datos de entrenamiento que permitan caracterizarlos.
- Licencia: Apache 2.0 permite uso comercial del código y del checkpoint. No obstante, la propia model card advierte de que deben revisarse por separado los términos de los datos de origen si se usan conjuntos de datos externos.
- Para producción: no apto. Cualquier resultado procedente de un futuro checkpoint entrenado deberá documentarse por separado de los valores por defecto que se distribuyen aquí.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/stuartwvmc1006/dissertation-multitask
- Perfil del autor en HuggingFace: https://huggingface.co/stuartwvmc1006
- Fichero de entrenamiento incluido en el repositorio: `train.py` (consultar el bloque `__main__` para el ejemplo de prueba de humo)
- Configuración de arquitectura: `config.json`
- Receta de experimento por defecto: `training_args.json`
- No se han encontrado en la información disponible papers, blogs, repositorios adicionales ni demos asociados a este modelo.
