# SZLHOLDINGS/SZL-GovernedDistill-0.8B-v1

## Resumen

SZL-GovernedDistill-0.8B-v1 es un modelo de lenguaje de 873 millones de parámetros desarrollado por SZLHOLDINGS como artefacto de investigación dentro de un programa sobre destilación gobernada. Se trata de un ajuste fino supervisado (SFT) del modelo base Qwen/Qwen3.5-0.8B, entrenado exclusivamente sobre un corpus de salidas de profesor aceptadas por una compuerta de control y generadas bajo decodificación restringida a copia (copy-constrained decoding). El modelo no está promovido a producción y su model card lo declara explícitamente como candidato de investigación no elegible para publicación ni para validación biológica.

El interés técnico del modelo reside en el experimento que documenta, no en sus capacidades de uso general. El autor mide si un estudiante entrenado sobre salidas "grounded by construction" (el profesor solo puede emitir tokens presentes en su contexto fuente) hereda esa propiedad de anclaje en generación libre. El resultado medido es negativo: en las pruebas de confabulación, el estudiante se abstuvo en 1 de 6 casos y respondió en 5 de 6, lo que confirma que el suelo de confabulación es una propiedad de la decodificación y no del corpus de entrenamiento.

La relevancia actual es metodológica: el modelo forma parte de un arco de cuatro rondas (0,3 % en generación libre con 0,8B, 2,7 % con 4B, 1,3 % con asistencia de compuerta y 21,9 % con decodificación restringida a copia) que cuantifica a pequeña escala el fenómeno de la confabulación. La información disponible no incluye datos sobre arquitectura interna, longitud de contexto ni idiomas soportados más allá de la inferencia a partir del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el tag de Hugging Face indica `qwen3_5`; se desconoce el detalle interno) |
| Parámetros totales | 873.438.784 |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (entrenado con QLoRA; el repo contiene safetensors) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del base Qwen/Qwen3.5-0.8B mediante QLoRA SFT durante 3 épocas, usando Unsloth sobre una GPU A6000, con un tiempo de ejecución registrado de 118 segundos y una pérdida final de 2,343 (según `train-receipt.json`). No se detalla la arquitectura interna del transformer subyacente ni la composición del corpus más allá de su origen.

El dato distintivo del entrenamiento es el corpus: `governed-distill-4b-sft-v3-topup`, compuesto por 46 ejemplos aceptados por compuerta de un total de 210 prompts (21,9 % de aceptación, replicando el 20,7 % de un piloto previo). El profesor fue SZL-Nemotron-Mini-4B-Estate-v1 operando bajo decodificación restringida a copia, de modo que solo podía emitir tokens presentes en su contexto fuente. Cada salida del profesor, aceptada o rechazada, quedó registrada en `SZLHOLDINGS/model-eval-receipts`. La innovación metodológica es, por tanto, el pipeline de destilación con trazabilidad completa y restricción de decodificación en el profesor, no una innovación arquitectónica.

## Capacidades

- Generación de texto autoregresiva heredada del base Qwen3.5-0.8B, sin evaluación de capacidades generales publicada en la información disponible.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles.
- Capacidades especiales: ninguna documentada; el modelo no incorpora modo de razonamiento, visión ni audio según la información proporcionada.
- Comportamiento medido en pruebas de confabulación: 1/6 de abstención y 5/6 de respuesta, es decir, no hereda el anclaje del corpus de entrenamiento en generación libre.

## Casos de uso

- Investigación sobre confabulación en modelos pequeños: el modelo sirve como punto de datos reproducible en el arco de cuatro rondas documentado por el autor, permitiendo replicar la medición de abstención frente a respuesta en generación libre.
- Validación de pipelines de destilación gobernada: permite comprobar si un corpus filtrado por compuerta y generado con decodificación restringida produce un estudiante con menor tasa de invención, con la respuesta medida de que no lo hace a este tamaño.
- Auditoría de trazabilidad de datos de entrenamiento: al estar cada salida del profesor registrada en `SZLHOLDINGS/model-eval-receipts`, sirve como caso de estudio de linaje completo de un corpus SFT.
- Estudio de métodos de cuantización y ajuste eficiente: al haberse entrenado con QLoRA y Unsloth en una A6000, es un ejemplo reproducible de SFT de bajo coste sobre un base de 0,8B.
- Docencia y formación en evaluación de modelos: el contraste entre el 21,9 % de aceptación con decodificación restringida y el 1/6 del estudiante en generación libre es material didáctico concreto sobre la diferencia entre propiedad del corpus y propiedad de la decodificación.
- Referencia negativa en comparativas de destilación: útil como línea base de "estudiante que aprende contenido pero no restricción" frente a otros métodos de destilación que sí transfieran comportamiento de abstención.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única medición documentada es la prueba de confabulación del propio autor:

| Prueba | Resultado |
|---|---|
| Sondas de confabulación (6 casos) | 1/6 abstención, 5/6 respuesta (FAIL) |
| Aceptación de compuerta en el corpus (210 prompts) | 46 aceptados, 21,9 % |
| Pérdida final de entrenamiento | 2,343 |
| Tiempo de entrenamiento | 118 s (A6000, Unsloth, QLoRA, 3 épocas) |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 873 millones de parámetros, la inferencia en fp16 requiere aproximadamente 1,7 GB de pesos, y en cuantización de 4 bits alrededor de 0,5 GB, si bien estas cifras son estimaciones a partir del recuento de parámetros y no datos publicados por el autor.
- GPU recomendadas: el entrenamiento se realizó en una NVIDIA A6000; para inferencia basta con una GPU consumer con suficiente VRAM para el formato elegido.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con 4 GB o más de VRAM en cuantización de 4 bits, aunque no hay validación publicada.
- Opciones de despliegue: no se documentan; al ser safetensors compatible con la familia Qwen, sería desplegable con las herramientas habituales (vLLM, llama.cpp, Ollama, TGI) previa conversión, sin que el autor lo confirme.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| SZL-GovernedDistill-0.8B-v1 | 873 M | no disponible | apache-2.0 | SFT QLoRA sobre corpus gobernado, artefacto de investigación | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 B | no disponible | no disponible en esta ficha | Modelo base de propósito general | Hugging Face |
| SZL-Nemotron-Mini-4B-Estate-v1 (profesor) | ~4 B | no disponible | no disponible en esta ficha | Profesor bajo decodificación restringida a copia | Referenciado en la model card |

No se dispone de datos de benchmarks comparables entre estos modelos en la información proporcionada, por lo que la comparativa se limita a linaje, tamaño y licencia.

## Limitaciones y advertencias

- Estado declarado por el autor: RESEARCH_CANDIDATE, NOT_PROMOTED, NOT_PUBLICATION_ELIGIBLE y NOT_FOR_BIOLOGICAL_VALIDATION; no es un producto.
- Falla las sondas de confabulación (5/6 respuestas donde debía abstenerse), por lo que no es fiable como sistema que deba reconocer los límites de su conocimiento.
- El autor advierte que superar o fallar sondas sintéticas no dice nada sobre validez biológica.
- No se documentan sesgos conocidos, riesgos de alucinación específicos más allá de la sonda de confabulación, ni limitaciones de idioma o contexto.
- Licencia apache-2.0: permite uso comercial según los términos de la licencia, pero el estado de investigación del modelo desaconseja su uso en producción.
- El corpus de entrenamiento es muy reducido (46 ejemplos), lo que limita la generalización de cualquier capacidad observada.
- No hay información sobre el modelo base Qwen3.5-0.8B en la documentación proporcionada, incluida su licencia o contexto, lo que impide evaluar restricciones heredadas.

## Enlaces

- Hugging Face: https://huggingface.co/SZLHOLDINGS/SZL-GovernedDistill-0.8B-v1
- Repositorio de recibos de evaluación: `SZLHOLDINGS/model-eval-receipts` (referenciado en la model card)
- Recibo de entrenamiento: `train-receipt.json` (referenciado en la model card)
- Evaluación del estudiante: `governed-distill-w30-student-eval-20261107.json` (referenciado en la model card)
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
