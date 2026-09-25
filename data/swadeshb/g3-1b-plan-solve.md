# swadeshb/g3-1b-plan-solve

## Resumen

`swadeshb/g3-1b-plan-solve` es un adaptador LoRA (PEFT) publicado por el usuario swadeshb sobre el modelo preentrenado `google/gemma-3-1b-pt`. No es un modelo completo: se trata de un conjunto de pesos incrementales de bajo rango (r=16, alpha=32) que debe cargarse sobre el modelo base de 1.000 millones de parámetros de la familia Gemma 3. Su propósito declarado es el razonamiento matemático jerárquico mediante el método `plan_solve`, es decir, generar primero un plan estructurado y después resolver el problema siguiendo dicho plan.

El adaptador forma parte de un experimento controlado de SFT jerárquico sobre Gemma 3 / T5Gemma 2, y se ha entrenado exclusivamente con el subconjunto MATH del dataset `sxiong/MLR_structured_trajectory`, con una longitud máxima de entrenamiento de 8192 tokens. El repositorio no incluye model card extendida, licencia, idiomas declarados ni resultados de evaluación; el tamaño del repositorio aparece como 0,0 GB y acumula 0 descargas y 0 "likes" en el momento de la consulta.

Su relevancia actual es acotada y de carácter experimental: sirve como artefacto reproducible para estudiar si el desglose plan-solución mejora el rendimiento en matemáticas en modelos pequeños, y como ejemplo de adaptación LoRA de muy bajo coste computacional (entrenable e inferible en GPU de consumo). No debe considerarse un modelo listo para producción sin una evaluación propia previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder (Gemma 3); método `plan_solve` de SFT jerárquico |
| Parámetros totales | No disponible para el adaptador (el modelo base `google/gemma-3-1b-pt` tiene ~1.000 millones) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Longitud máxima de entrenamiento: 8192 tokens. Contexto del modelo base: no indicado en la información proporcionada |
| Tipos de cuantización | No disponible (el adaptador se distribuye en safetensors; puede aplicarse sobre bases cuantizadas en 8 y 4 bits, sin verificación publicada) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA PEFT; requiere el modelo base para funcionar) |

Datos adicionales del repositorio: identificador `swadeshb/g3-1b-plan-solve`, librería `peft`, etiquetas `lora`, `math`, `hierarchical-reasoning`, dataset `sxiong/MLR_structured_trajectory`, hiperparámetros LoRA r=16 y alpha=32, tamaño de repositorio 0,0 GB, 0 descargas, 0 likes, creado el 25 de septiembre de 2026.

## Arquitectura y entrenamiento

El artefacto es un adaptador de bajo rango (LoRA) con r=16 y alpha=32, lo que implica una escala de actualización efectiva de 2 sobre las matrices congeladas del modelo base. El rango bajo limita el número de parámetros entrenables a una fracción muy pequeña del total, aunque la información disponible no especifica qué módulos (attention, MLP, proyecciones de salida) fueron objetivo de la adaptación ni el recuento exacto de parámetros entrenables.

El entrenamiento consistió en un SFT jerárquico con el método `plan_solve` sobre el subconjunto MATH del dataset `sxiong/MLR_structured_trajectory`, con longitud máxima de 8192 tokens. El autor enmarca el trabajo dentro de un experimento controlado sobre Gemma 3 y T5Gemma 2, lo que sugiere una comparación sistemática entre variantes. No se documentan en la información proporcionada el número total de tokens de entrenamiento, la composición exacta del dataset, la configuración de precisión, el número de épocas ni el uso de RLHF, DPO u otras fases de alineación posteriores.

## Capacidades

- Generación de texto y razonamiento matemático en formato jerárquico: el modelo está ajustado para emitir primero un plan y después la solución, siguiendo el esquema `plan_solve` con el que fue entrenado.
- Resolución de problemas del estilo MATH, presumiblemente con solución paso a paso derivada del plan previo.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: parcialmente relacionado con su naturaleza jerárquica, pero sin soporte de herramientas documentado.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (modo thinking, visión, audio): no disponibles. Al derivar de `gemma-3-1b-pt` (variante preentrenada, no instruida), no hereda garantías de seguimiento de instrucciones conversacionales.
- Modo de instrucción conversacional: no disponible; el adaptador no se ha entrenado, según la información aportada, para diálogo general.

## Casos de uso

- Investigación en razonamiento jerárquico: usar el adaptador como una de las ramas de un experimento controlado para medir si el desglose plan-solución mejora la exactitud en el subconjunto MATH frente a un SFT plano sobre el mismo modelo base.
- Generación de cadenas de solución en datasets matemáticos: aplicar el modelo para producir soluciones estructuradas (plan + pasos) que luego se filtran y se usan como datos sintéticos de entrenamiento para modelos mayores, revisando manualmente una muestra.
- Evaluación comparativa de adaptadores LoRA: al tener fijados r=16 y alpha=32 y una longitud máxima de 8192, sirve como punto de referencia reproducible para comparar con otros adaptadores del mismo autor o de la misma familia Gemma 3 1B.
- Tutoría matemática sin requisitos estrictos de idioma: desplegar el adaptador en un prototipo interno que explique ejercicios paso a paso, asumiendo que el idioma de salida depende del modelo base y no está garantizado.
- Extracción de estructura de razonamiento: emplear el formato plan-solución para tareas de análisis donde interese separar la estrategia de resolución de la aritmética, por ejemplo en la construcción de rúbricas de corrección automática.
- Pruebas de ajuste fino de bajo coste: usar este adaptador como plantilla para validar pipelines PEFT sobre Gemma 3 1B (carga, mezcla, serialización y evaluación) antes de escalar a modelos mayores.
- Inferencia en hardware limitado: ejecutar el adaptador combinado con una base cuantizada como banco de pruebas de razonamiento matemático en una GPU de consumo o en un portátil, con expectativas de rendimiento modestas por el tamaño de 1B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El repositorio no incluye métricas de exactitud sobre MATH, GSM8K, MMLU ni ningún otro conjunto, ni comparaciones frente a otros adaptadores del mismo experimento. Tampoco se documentan curvas de entrenamiento, pérdida final ni evaluaciones cualitativas. Cualquier cifra que se quiera usar para justificar su adopción debe generarse mediante una evaluación propia y reproducible.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones, no confirmadas por el autor):
  - Base en bf16/fp16 más adaptador: en torno a 2-3 GB de pesos, con un total práctico de 4-6 GB incluyendo caché KV y overhead del runtime.
  - Base en cuantización de 8 bits: en torno a 1-1,5 GB de pesos.
  - Base en cuantización de 4 bits: en torno a 0,7-1 GB de pesos.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para bf16 (RTX 3060, RTX 4060, RTX 2070 o superiores); RTX 4090, A100 o H100 quedan sobredimensionadas para este tamaño y solo se justifican por agregación de muchas inferencias en paralelo.
- Cabe en GPU de consumo: sí, con holgura en 4 y 8 bits, y probablemente también en bf16 en tarjetas de 8 GB o más. También es viable en CPU mediante llama.cpp tras convertir y fusionar el adaptador.
- Opciones de despliegue: `transformers` + `peft` para cargar el adaptador directamente sobre `google/gemma-3-1b-pt`; vLLM con soporte de adaptadores LoRA para servir varias variantes sobre una misma base; llama.cpp/Ollama tras fusionar los pesos y convertir a GGUF; TGI para despliegue en servidor con soporte de adaptadores, según versión.
- Latencia y throughput estimados: no disponibles. Al tratarse de un modelo de 1B, la latencia por token sería baja en GPU moderna, pero la generación de planes más soluciones alarga secuencias y penaliza el throughput efectivo; el dato relevante sería el throughput a 8192 tokens de contexto, que no se ha publicado.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| swadeshb/g3-1b-plan-solve | Adaptador LoRA sobre Gemma 3 1B | ~1B en la base; parámetros del adaptador no disponibles | Entrenado a 8192; contexto base no indicado | No disponible | 0 descargas, sin evaluación publicada |
| google/gemma-3-1b-pt | Modelo base preentrenado | ~1B | No indicado en la información proporcionada | No disponible en la información proporcionada | Público en HuggingFace |
| google/gemma-3-1b-it | Modelo base instruido | ~1B | No indicado en la información proporcionada | No disponible en la información proporcionada | Público en HuggingFace |
| Otros adaptadores matemáticos sobre Gemma 3 1B | Adaptador LoRA | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento de ninguno de los modelos comparados en la información proporcionada, por lo que la comparación se limita a tipo de artefacto, tamaño, disponibilidad y licencia. La diferencia funcional principal frente a `google/gemma-3-1b-it` es que este adaptador no está orientado a conversación general, sino a un formato concreto de razonamiento matemático jerárquico.

## Limitaciones y advertencias

- Licencia no disponible: sin una licencia explícita no se puede asumir permiso de uso comercial; además, al derivar de Gemma 3, se heredan las condiciones de uso del modelo base de Google, que el autor no reproduce en la ficha.
- Ausencia total de evaluación: 0 descargas, 0 likes y ninguna métrica publicada; no hay evidencia externa de que el ajuste mejore al modelo base en MATH u otro conjunto.
- Riesgo de alucinación matemática: con ~1B de parámetros, la probabilidad de errores aritméticos y de pasos plausibles pero incorrectos es alta, especialmente cuando el plan generado es erróneo y la solución lo arrastra.
- Dependencia del formato: el método `plan_solve` implica un formato de salida específico; fuera de ese esquema o con prompts conversacionales, el comportamiento puede degradarse, ya que la base es la variante preentrenada y no la instruida.
- Limitación de contexto: la longitud máxima de entrenamiento es 8192 tokens, pero no se documenta el contexto efectivo del modelo base ni cómo se comporta más allá de ese límite.
- Idiomas no declarados: no hay información sobre cobertura multilingüe ni sobre la calidad del castellano; el dataset de entrenamiento es de problemas MATH, mayoritariamente en inglés.
- Repositorio de 0,0 GB: conviene verificar que los pesos del adaptador se hayan subido realmente y que la carga con PEFT funcione antes de integrarlo en cualquier pipeline.
- Sesgos y contaminación: no se documenta la composición del dataset ni la posible contaminación con conjuntos de evaluación, lo que dificulta interpretar cualquier ganancia que se observe.
- Uso en producción: no recomendado como componente crítico sin evaluación propia, control de versiones del adaptador y validación de la licencia con el autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/swadeshb/g3-1b-plan-solve
- Perfil del autor en HuggingFace: https://huggingface.co/swadeshb/datasets
- Modelo base: https://huggingface.co/google/gemma-3-1b-pt
- Dataset de entrenamiento: https://huggingface.co/datasets/sxiong/MLR_structured_trajectory
- Librería PEFT: https://huggingface.co/docs/peft
- Búsqueda de modelos en HuggingFace: https://huggingface.co/models?search=swadeshb
- Herramientas y recursos de Google AI (referencia del modelo base): https://ai.google/build/
- Swades AI (posible relación con el autor, no confirmada): https://www.swades.ai/
- Leaderboard y benchmarks de modelos (referencia general, sin datos de este adaptador): https://benchlm.ai/
