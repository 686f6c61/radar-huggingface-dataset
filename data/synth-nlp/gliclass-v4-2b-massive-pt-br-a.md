# Synth-NLP/gliclass-v4-2b-massive-pt-br-A

## Resumen

GLiClass v4-2B ajustada en MASSIVE pt-BR (brazo A) es un modelo de decisión especializado en clasificación de intenciones para portugués, desarrollado por Synth-NLP. Parte del modelo base `knowledgator/gliclass-v4-2b` y se ha afinado sobre 5.405 frases reales del corpus MASSIVE pt-BR, con 20 opciones de intención por frase y 30 intenciones distintas vistas durante el entrenamiento. Forma parte de un experimento comparativo que contrasta datos sintéticos generados mediante una pipeline agéntica frente a datos reales, y un modelo de decisión de mayor tamaño frente al Laya multilingual.

El modelo emplea la arquitectura GLiClass, un esquema de "decision model" orientado a clasificación y selección de etiquetas mediante decoder-kv, con 2.364.417.347 parámetros totales (aproximadamente 2,36 mil millones) y pesos en formato safetensors. El repositorio ocupa 4,7 GB. Su relevancia actual radica en que aborda la clasificación de intenciones en portugués con un enfoque de decisión explícito sobre un conjunto cerrado de opciones, lo que resulta directamente aplicable a sistemas de enrutamiento conversacional y asistentes.

La licencia Apache 2.0 permite uso comercial sin restricciones adicionales significativas, y el ajuste se ha realizado con el `train.py` oficial de GLiClass en precisión bf16, single-label, actualizando el último 30% de las capas del decoder. No se han publicado datos de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible; la única métrica reportada es la precisión en la validación de MASSIVE pt-BR.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GLiClass (decision model con decoder-kv) |
| Parámetros totales | 2.364.417.347 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | portugués (pt, pt-BR) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura GLiClass, un esquema de clasificación y decisión que emplea un decoder con mecanismo decoder-kv para seleccionar entre un conjunto de opciones (etiquetas o intenciones) dadas en la entrada. El ajuste se realizó sobre el modelo base `knowledgator/gliclass-v4-2b`, actualizando únicamente el último 30% de las capas del decoder. El entrenamiento se llevó a cabo con el `train.py` oficial de GLiClass, en modo single-label, precisión bf16, con tasas de aprendizaje de 2e-5 y 5e-5, tamaño de lote 8, 3 épocas y semilla 42 (configuración por defecto del Trainer).

Los datos de entrenamiento consisten en 5.405 frases reales del corpus MASSIVE pt-BR, con 20 opciones de intención por frase y 30 intenciones vistas. El brazo A comparte las mismas líneas y las mismas 20 opciones que el modelo Laya del mismo brazo, lo que permite una comparación controlada. No se especifica el número total de tokens de entrenamiento ni si hubo fases de RLHF o DPO; el ajuste parece ser un fine-tuning supervisado estándar de clasificación.

## Capacidades

- Clasificación de intenciones en portugués (pt-BR) sobre un conjunto cerrado de opciones (20 opciones por frase en el entrenamiento).
- Selección de etiqueta single-label entre las opciones proporcionadas en la entrada.
- Manejo de intenciones no vistas durante el entrenamiento (generalización a escenarios reservados).
- Modelo de decisión: no genera texto libre, sino que elige entre opciones predefinidas.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al portugués según la model card (idioma declarado: pt).
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Enrutamiento de intenciones en asistentes conversacionales: el modelo puede clasificar la intención del usuario entre un conjunto de 20 opciones por turno, adecuado para dirigir consultas al flujo o servicio correspondiente en sistemas de atención al cliente en portugués.
- Clasificación de tickets de soporte: dado un mensaje de usuario en pt-BR, selecciona la categoría de intención entre las opciones definidas, lo que permite el triaje automático en mesas de ayuda.
- Análisis de conversaciones de contact center: procesamiento por lotes de transcripciones en portugués para etiquetar la intención de cada intervención y alimentar analíticas de demanda.
- Evaluación de robustez ante intenciones no vistas: gracias a su rendimiento reportado en escenarios reservados (0,825), puede emplearse en entornos donde aparecen intenciones no presentes en el conjunto de entrenamiento original.
- Componente de un pipeline agéntico: como modelo de decisión, puede integrarse en un sistema mayor que genere opciones candidatas y delegue en este modelo la selección final de la acción o etiqueta.
- Investigación comparativa de datos sintéticos frente a reales: el modelo sirve como referencia del brazo A en experimentos que comparan el impacto de datos generados por pipelines agénticas frente a datos reales en tareas de clasificación de intenciones.
- Clasificación de consultas en bots de dominio cerrado: para dominios con un catálogo fijo de intenciones en portugués, el modelo ofrece una alternativa de 2,36 mil millones de parámetros con licencia permisiva.

## Benchmarks y rendimiento

| Conjunto | Métrica | Resultado |
|---|---|---|
| Validación MASSIVE pt-BR (20 opciones, media de 3 sorteos) | Precisión en intenciones vistas | 0,844 |
| Validación MASSIVE pt-BR (20 opciones, media de 3 sorteos) | Precisión en intenciones no vistas (escenarios reservados) | 0,825 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 2,36 mil millones de parámetros, en bf16 los pesos ocupan aproximadamente 4,7 GB, por lo que se requiere al menos ese espacio más el overhead de activaciones y del decoder-kv.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, el modelo es compatible con GPUs de consumo con suficiente VRAM.
- ¿Cabe en GPU de consumo? Probablemente sí en tarjetas con 8 GB o más de VRAM en bf16, aunque este dato no está confirmado en la model card.
- Opciones de despliegue: no disponible; al ser un modelo GLiClass, se espera compatibilidad con la librería oficial de GLiClass, pero no se detalla en la información.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Synth-NLP/gliclass-v4-2b-massive-pt-br-A | 2,36 B | no disponible | 0,844 (vistas) / 0,825 (no vistas) en MASSIVE pt-BR | Apache 2.0 | Hugging Face |
| knowledgator/gliclass-v4-2b (base) | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| Laya multilingual (brazo A del experimento) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- El modelo está especializado en clasificación de intenciones en portugués; no es un modelo generativo de propósito general.
- Solo se ha evaluado sobre MASSIVE pt-BR; su comportamiento en otros dominios o corpus en portugués no está documentado.
- La precisión reportada (0,844 y 0,825) corresponde a una media de 3 sorteos con 20 opciones por frase; el rendimiento puede variar con otros conjuntos de opciones o distribuciones de intenciones.
- No se especifica la longitud de contexto soportada, lo que limita la planificación para entradas largas.
- Riesgo de sesgo y alucinación: no documentado en la model card; al ser un modelo de decisión sobre opciones cerradas, el riesgo de generar contenido fuera de las opciones es menor, pero la selección puede ser incorrecta en casos ambiguos.
- Uso comercial permitido por la licencia Apache 2.0, sin restricciones adicionales indicadas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.
- No se detallan los datos sintéticos ni la composición exacta del pipeline agéntico del experimento, lo que dificulta la reproducibilidad completa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Synth-NLP/gliclass-v4-2b-massive-pt-br-A
- Modelo base: https://huggingface.co/knowledgator/gliclass-v4-2b
