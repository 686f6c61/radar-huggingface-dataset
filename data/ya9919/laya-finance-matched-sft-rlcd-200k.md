# ya9919/laya-finance-matched-sft-rlcd-200k

## Resumen

`laya-finance-matched-sft-rlcd-200k` es un checkpoint de ajuste fino publicado por el usuario `ya9919` sobre su propio modelo `ya9919/laya-finance-matched-sft-200k`. No es un modelo generativo de propósito general: es un encoder de 421.293.830 parámetros (FP16) con una cabeza de decisión nativa ("decision head") orientada a responder preguntas financieras de opción múltiple sobre un conjunto concreto de encuestas (CHFS/CGSS). La etapa documentada es una pasada adicional de ajuste sobre el mismo conjunto de 200.000 filas downstream ya usado en la etapa SFT previa, con un total acumulado de 400.000 exposiciones a fila y 200.000 filas distintas.

La relevancia es acotada y muy específica: se trata de un artefacto de reproducción de investigación, ligado a la librería `laya` (versión 0.4.2) y al repositorio `mas-simulation`. El autor publica métricas de evaluación sobre un subconjunto congelado de 240.458 filas y 119 versiones de pregunta (accuracy 0,7393; F1 macro por pregunta 0,3605; cero predicciones inválidas), lo que permite auditar el comportamiento del modelo en esa tarea concreta.

Conviene subrayar que el modelo solo declara inglés, no expone pipeline en HuggingFace, no tiene descargas ni likes, y su model card no describe arquitectura interna más allá de "encoder" más "cabeza de decisión". No hay información sobre ventana de contexto efectiva, composición del corpus de preentrenamiento ni alineamiento (RLHF/DPO).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer con cabeza de decisión nativa (detalles internos no disponibles) |
| Parametros totales | 421.293.830 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (la configuración registra la ventana de entrenamiento, no se publica el valor) |
| Tipos de cuantizacion | No disponible; pesos publicados en FP16 nativo |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache-2.0 (con atribución al modelo base) |
| Formato de pesos | `safetensors` (FP16), mas `rl_agent_config.json`, `encoder/config.json`, `tokenizer/tokenizer.json`, `tokenizer/tokenizer_config.json` |

## Arquitectura y entrenamiento

El autor describe el artefacto como "complete fine-tuned encoder and original native decision head": un encoder ajustado más la cabeza de decisión original del proyecto, con pesos en FP16 y atribución al modelo base `ya9919/laya-finance-matched-sft-200k`. El método de esta etapa se denomina `native-laya-rlcd-additional-pass` y consiste en una pasada adicional sobre el mismo conjunto de filas downstream ya empleado en la etapa SFT: 200.000 filas distintas del split de entrenamiento de QA en inglés de cuatro fuentes, con 200.000 exposiciones a fila en esta etapa y 400.000 acumuladas (200.000 filas distintas acumuladas). La selección del checkpoint se hace con un `dev20k` fijo, usando F1 macro por pregunta como criterio primario y accuracy como desempate.

No se documentan el número de tokens de preentrenamiento, la composición del corpus, ni si hubo RLHF, DPO u otra fase de alineamiento. Tampoco se detallan innovaciones de arquitectura (atención lineal, decodificación especulativa, etc.). Lo que sí se explicita es la receta de inferencia: codificación nativa de entrada completa que calcula las ventanas de tokens suficientes y rechaza el desbordamiento en lugar de truncar silenciosamente; el autor advierte que la ventana registrada en la configuración corresponde al entrenamiento y no debe interpretarse como una instrucción para truncar entradas de evaluación más largas. La carga se realiza con `laya==0.4.2`, PyTorch 2.12.1 y Transformers 5.19.0.

## Capacidades

- Respuesta a preguntas financieras de opción múltiple: el modelo consume el estado, la pregunta y todas las opciones para emitir una decisión.
- Clasificación/decisión sobre ítems de encuesta financiera (CHFS/CGSS) con etiquetas observadas.
- Evaluación determinista sin predicciones inválidas: 0 inválidas sobre las 240.458 filas del subconjunto común congelado.
- Manejo de entradas largas mediante codificación de ventanas múltiples con rechazo explícito de desbordamiento.
- Uso como artefacto de reproducción de investigación dentro del ecosistema `laya`.
- No se declara soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking".
- Capacidad multilingüe: no disponible; solo se declara inglés.

## Casos de uso

- Investigación reproducible en QA financiero: cargar el checkpoint con `laya.train.load_checkpoint` y replicar las métricas publicadas sobre el subconjunto común de 240.458 filas, sirviendo como línea base auditable frente a otras etapas del proyecto.
- Evaluación comparada de etapas de ajuste: al compartir conjunto de filas con el checkpoint SFT previo, permite aislar el efecto de una pasada adicional de entrenamiento manteniendo constante el conjunto de datos downstream.
- Anotación asistida de respuestas en encuestas financieras: el modelo puede predecir la opción seleccionada en ítems de CHFS/CGSS y usarse como preetiquetador para revisión humana, con la ventaja de que no genera salidas inválidas en el subconjunto evaluado.
- Auditoría de sesgo y calibration en dominios financieros: al ser un modelo pequeño (421 M parámetros) y con pesos abiertos, se puede ejecutar en local para analizar la distribución de predicciones por versión de pregunta (119 versiones documentadas).
- Componente de un sistema multiagente de simulación: el repositorio `mas-simulation` sugiere su uso como cabecera de decisión dentro de simulaciones agregadas, donde el modelo actúa como policy de respuesta y no como generador de texto libre.
- Despliegue en infraestructura modesta para pruebas internas: al ocupar del orden de 0,8 GB en FP16, cabe en CPU o en una GPU de gama de entrada para experimentos de integración continua.
- Referencia metodológica para quien diseñe evaluaciones por pregunta: el uso de F1 macro por pregunta junto con accuracy como desempate es replicable en otros conjuntos de QA con desbalance entre ítems.

## Benchmarks y rendimiento

Evaluación con etiquetas observadas sobre el subconjunto común CHFS/CGSS congelado de 240.458 filas y 119 versiones de pregunta. El autor advierte que el split de test completo en inglés del repositorio fuente tiene 418.597 filas, por lo que los denominadores no son comparables.

| Metrica | Resultado |
|---|---:|
| Accuracy | 0,739268396 |
| F1 macro por pregunta | 0,360503211 |
| Predicciones invalidas | 0 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar, ni comparaciones numéricas con modelos de la misma categoría. El autor indica que los resultados de simulación financiera y los resultados históricos del sistema Fin-Laya sobre datos completos se reportan por separado.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,85 GB solo para pesos en FP16 (421,3 M de parámetros); con activaciones y overhead del runtime, un entorno de 2-3 GB es suficiente en la práctica.
- GPU recomendadas: cualquier GPU con 4 GB o más de memoria (GTX 1650, RTX 3050, RTX 4060, T4, L4); no requiere A100 ni H100.
- Cabe en GPU de consumo: sí, holgadamente, en cualquier tarjeta moderna de 4 GB o superior; también es viable en CPU para evaluación por lotes.
- Opciones de despliegue: la receta nativa es la librería `laya` 0.4.2 con PyTorch 2.12.1 y Transformers 5.19.0. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y al no ser un modelo generativo causal estándar es poco probable que esos runners lo carguen sin adaptación.
- Latencia y throughput: no disponibles. El coste dominante será la codificación de múltiples ventanas de tokens cuando la entrada (estado, pregunta y todas las opciones) exceda la ventana de entrenamiento.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de alternativas en la información proporcionada, por lo que la comparación numérica con otros modelos de la misma categoría no está disponible. La única comparación documentada es con su propio checkpoint de partida.

| Modelo | Parametros | Contexto | Accuracy (subconjunto 240.458 filas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `laya-finance-matched-sft-rlcd-200k` (este modelo) | 421.293.830 | No disponible | 0,739268396 | Apache-2.0 | HuggingFace |
| `ya9919/laya-finance-matched-sft-200k` (modelo base) | No disponible en la información | No disponible | No disponible | Apache-2.0 (heredada) | HuggingFace |
| Otros modelos de QA financiero | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Propósito muy restringido: es una cabeza de decisión para QA de opción múltiple sobre encuestas financieras concretas, no un asistente conversacional ni un modelo de generación de texto libre.
- El F1 macro por pregunta (0,3605) es notablemente inferior a la accuracy (0,7393), lo que indica un rendimiento muy desigual entre las 119 versiones de pregunta; la media global oculta fallos en subconjuntos específicos.
- Solo inglés declarado; no hay evidencia de comportamiento en castellano ni en otros idiomas.
- Riesgo de alucinación no caracterizado: al emitir una opción entre las disponibles, el modo de fallo esperable es la elección incorrecta sistemática, no la invención de contenido, pero no se publican análisis de calibración ni de incertidumbre.
- Sesgos no documentados: no se publica información sobre composición demográfica de CHFS/CGSS ni sobre sesgos derivados de los datos de encuesta; el modelo puede heredar sesgos de la población muestreada.
- Sobreajuste al conjunto downstream: 400.000 exposiciones acumuladas sobre 200.000 filas distintas implican dos épocas efectivas sobre el mismo conjunto, lo que limita la generalización fuera de esa distribución.
- Advertencia de evaluación: los resultados publicados usan un subconjunto de 240.458 filas, distinto del test completo de 418.597 filas del repositorio fuente; no son comparables entre sí.
- Restricciones de licencia: los artefactos del modelo son Apache-2.0, pero los datos de entrenamiento retienen los términos `chfs-cgss-cfps-clds-source-data-terms` del repositorio de QA, lo que puede condicionar el uso comercial de derivados entrenados con esos datos.
- Dependencia de versiones concretas: la receta exige `laya==0.4.2`, PyTorch 2.12.1 y Transformers 5.19.0; otras combinaciones pueden no cargar el checkpoint correctamente.
- Sin pipeline declarado en HuggingFace, sin descargas ni validación de la comunidad: la fiabilidad del artefacto depende únicamente de la reproducibilidad declarada por el autor.
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo, por lo que no hay verificación externa independiente de las métricas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ya9919/laya-finance-matched-sft-rlcd-200k
- Modelo base: https://huggingface.co/ya9919/laya-finance-matched-sft-200k
- Repositorio de reproducción y evidencia agregada: https://github.com/KataDavidXD/mas-simulation
- Paper, blog o demo adicionales: no disponible
- La búsqueda web no devolvió resultados relevantes sobre este modelo; no se han encontrado enlaces adicionales que verificar.
