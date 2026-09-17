# unignoramus/anlp-a2-p2-lion

## Resumen

`unignoramus/anlp-a2-p2-lion` es un checkpoint académico publicado en HuggingFace: un transformer decoder-only de 35,27 millones de parámetros entrenado desde cero sobre el corpus paralelo inglés `browndw/human-ai-parallel-corpus`, con 38,93 millones de tokens de entrenamiento. Su particularidad es que implementa a mano el optimizador Lion (con learning rate 0,0001), como parte de la "Assignment 2, Part 2" de un curso de Procesamiento de Lenguaje Natural (ANLP). No es, por tanto, un modelo orientado a producción, sino un artefacto de experimentación y evaluación docente.

El modelo reporta una pérdida de validación de 3,9747 y un BLEU de test de 1,45, cifras que sitúan su calidad generativa muy por debajo de cualquier modelo utilizable en tareas reales. No se publican resultados de benchmarks estándar (MMLU, HumanEval, GSM8K), ni información sobre longitud de contexto, tokenizador, composición detallada del dataset o proceso de alineación.

Su relevancia actual es limitada y circunstancial: sirve como referencia reproducible para estudiar el comportamiento del optimizador Lion frente a alternativas como AdamW en modelos pequeños, y como ejemplo de publicación de pesos en formato `torch.save` sin conversión a safetensors ni a GGUF. Con 0 descargas y 0 "likes" en el momento de la consulta, no hay evidencia de adopción por parte de la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (implementación propia) |
| Parámetros totales | 35,27 M |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (solo se publica el checkpoint en precisión de entrenamiento) |
| Idiomas soportados | Inglés (corpus de entrenamiento en inglés); el autor no declara lista de idiomas |
| Licencia | MIT |
| Formato de pesos | `torch.save` (payload plano con claves `model`, `state` y `config`); no hay safetensors ni GGUF |
| Optimizador | Lion |
| Learning rate | 0,0001 |
| Tokens de entrenamiento | 38,93 M |
| Pérdida de validación | 3,9747 |
| BLEU de test | 1,45 |
| Dataset | `browndw/human-ai-parallel-corpus` |
| Librería declarada | PyTorch |
| Tamaño del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de 35,27 M de parámetros, implementado a mano junto con el optimizador Lion. No se especifican en la model card el número de capas, la dimensión del modelo, el número de cabezas de atención, el vocabulario ni el mecanismo de positional encoding; tampoco la longitud de contexto con la que fue entrenado. El checkpoint se distribuye como payload de `torch.save` con las claves `model`, `state` y `config`, y requiere cargarse con `torch.load(..., weights_only=False)` y alimentar el modelo con la definición de transformer incluida en el repositorio acompañante, del que no se proporciona enlace.

El entrenamiento consumió 38,93 M de tokens sobre el corpus paralelo inglés `browndw/human-ai-parallel-corpus`, con un learning rate de 0,0001 y el optimizador Lion. No se documenta ninguna fase de ajuste por instrucciones, RLHF o DPO, ni técnicas de decodificación especulativa, atención lineal o variantes híbridas. La innovación técnica declarada es, explícitamente, la implementación manual del optimizador Lion, no una contribución arquitectónica.

## Capacidades

- Generación de texto autoregresiva en inglés, limitada a la distribución del corpus paralelo de entrenamiento.
- Modelado de lenguaje sobre pares humano/IA: el modelo fue entrenado sobre ese material, aunque su BLEU de test de 1,45 indica una calidad de generación o traducción prácticamente inutilizable.
- Reproducción de experimentos de optimización: el checkpoint permite inspeccionar el efecto del optimizador Lion en un transformer pequeño.
- Capacidad multilingüe: no disponible; el corpus declarado es en inglés.
- Tool calling / function calling: no soportado.
- Uso como agente o razonamiento multi-paso: no soportado.
- Modo "thinking", visión, audio u otras modalidades: no soportado.
- Razonamiento matemático o generación de código: sin datos que lo respalden; no se han publicado evaluaciones.

## Casos de uso

- Reproducción de resultados académicos: el checkpoint permite replicar la pérdida de validación (3,9747) y el BLEU de test (1,45) reportados por el autor, siempre que se disponga del repositorio con la definición del transformer y de la misma partición de datos.
- Estudio comparativo de optimizadores: sirve para medir convergencia de Lion frente a AdamW bajo un presupuesto idéntico de 38,93 M de tokens y 35,27 M de parámetros, en un entorno controlado y de coste computacional mínimo.
- Material didáctico en cursos de NLP: permite ilustrar el ciclo completo de entrenamiento, serialización con `torch.save` y publicación de pesos en HuggingFace sin herramientas de alto nivel como `transformers` o `safetensors`.
- Pruebas de infraestructura de entrenamiento: al ser un modelo de 0,1 GB, se puede usar como carga sintética para validar pipelines de checkpointing, reanudación de entrenamiento y logging de métricas sin consumir recursos significativos.
- Ablaciones de hiperparámetros: es un punto de partida barato para barrer learning rates, schedulers o tamaños de batch y observar su impacto en la pérdida de validación.
- Ajuste fino exploratorio de bajo coste: dado su tamaño, se puede adaptar a tareas de clasificación o generación muy acotadas en una GPU de gama de consumo, como banco de pruebas antes de escalar a modelos mayores.
- Validación de scripts de inferencia personalizados: al no ser compatible con `transformers`, obliga a mantener un cargador propio, útil para comprobar la robustez de utilidades internas de despliegue.

## Benchmarks y rendimiento

Los únicos datos publicados por el autor son la pérdida de validación y el BLEU de test. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, ARC, HellaSwag) en la información disponible.

| Métrica | Valor | Conjunto |
|---|---|---|
| Pérdida de validación | 3,9747 | Validación del corpus de entrenamiento |
| BLEU | 1,45 | Test |
| MMLU | No disponible | - |
| HumanEval | No disponible | - |
| GSM8K | No disponible | - |

No se proporcionan resultados de modelos comparables obtenidos bajo el mismo protocolo, por lo que no es posible establecer una comparación cuantitativa directa.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 141 MB de pesos en fp32 (35,27 M de parámetros × 4 bytes) y unos 70 MB en fp16/bf16. El consumo real depende de la implementación, la longitud de secuencia y el tamaño del vocabulario en la capa de salida.
- GPU recomendadas: cualquier GPU con más de 1 GB de VRAM es suficiente. No se requiere A100, H100 ni tarjetas de centro de datos.
- Cabe en GPU de consumo: sí, en cualquier modelo (RTX 3060, RTX 4090, GTX 1650 e incluso GPUs integradas modernas). También es viable su ejecución en CPU con latencias aceptables dado el tamaño.
- Opciones de despliegue: no es compatible directamente con vLLM, TGI, llama.cpp, Ollama ni con `transformers`, ya que la arquitectura es una implementación propia y los pesos se distribuyen como payload de `torch.save`. El despliegue requiere cargar el checkpoint con `torch.load(..., weights_only=False)` y ejecutar el transformer definido en el repositorio acompañante.
- Latencia y throughput estimados: no disponible. El autor no publica mediciones de velocidad ni de tokens por segundo.

## Comparativa con modelos similares

La comparación directa no es significativa: este checkpoint es un artefacto académico sin benchmarks publicados y con un BLEU de 1,45, mientras que los modelos de tamaño comparable que se listan a continuación sí cuentan con evaluaciones extensas. Se incluyen únicamente como referencia de escala y licencia.

| Modelo | Parámetros | Contexto | Licencia | Benchmarks publicados | Disponibilidad |
|---|---|---|---|---|---|
| `unignoramus/anlp-a2-p2-lion` | 35,27 M | No disponible | MIT | Solo pérdida de validación y BLEU 1,45 | HuggingFace, formato `torch.save`, 0 descargas |
| GPT-2 small | 124 M | 1024 tokens | MIT modificada | Sí, ampliamente documentados | HuggingFace, safetensors, ecosistema maduro |
| DistilGPT-2 | 82 M | 1024 tokens | Apache 2.0 | Sí, reportados por el autor del destilado | HuggingFace, safetensors, compatible con `transformers` |
| Modelos de la familia TinyStories | ~30 M | No disponible en esta ficha | No disponible | Sí, centrados en generación de cuentos | HuggingFace |

No se dispone de datos para comparar rendimiento tarea a tarea entre estos modelos y el checkpoint analizado.

## Limitaciones y advertencias

- Calidad generativa muy baja: un BLEU de 1,45 en test indica que la salida no es utilizable para traducción ni para generación de texto con sentido práctico.
- Sesgos conocidos: no disponibles. El autor no documenta análisis de sesgo, toxicidad ni composición demográfica del corpus, lo que impide descartar sesgos presentes en `browndw/human-ai-parallel-corpus`.
- Riesgo de alucinación: muy alto en términos prácticos, ya que el modelo apenas ha aprendido la distribución del lenguaje con 38,93 M de tokens.
- Limitaciones de contexto e idioma: se desconoce la longitud de contexto soportada y no hay declaración de idiomas. El entrenamiento se realizó sobre un corpus en inglés, por lo que el comportamiento en castellano es impredecible.
- Restricciones de licencia: la licencia MIT permite uso comercial, modificación y redistribución con atribución y sin garantía. No obstante, el modelo no está preparado para uso en producción.
- Dependencia de código externo: la inferencia exige el repositorio acompañante con la definición del transformer, que no se enlaza de forma explícita en la model card; sin él, los pesos no son utilizables.
- Formato de pesos no estándar: el uso de `torch.save` con `weights_only=False` implica ejecutar deserialización de objetos Python, lo que conlleva riesgos de seguridad si el fichero proviene de una fuente no confiable.
- Ausencia de mantenimiento: 0 descargas y 0 "likes", sin pipeline declarado ni idiomas especificados, indican que no hay comunidad ni soporte detrás del checkpoint.
- Sin datos de evaluación estandarizada: no es posible verificar afirmaciones de rendimiento ni compararlo de forma rigurosa con alternativas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/unignoramus/anlp-a2-p2-lion
- Dataset de entrenamiento: https://huggingface.co/datasets/browndw/human-ai-parallel-corpus
- Repositorio acompañante con la definición del transformer: no disponible (referenciado en la model card pero sin enlace)
- Paper del optimizador Lion (Symbolic Discovery of Optimization Algorithms): https://arxiv.org/abs/2302.06675
- Página del curso ANLP o repositorio de la asignación: no disponible
- Demo o espacio de inferencia: no disponible
