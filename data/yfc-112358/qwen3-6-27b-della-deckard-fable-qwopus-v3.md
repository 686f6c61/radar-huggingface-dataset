# YFC-112358/Qwen3.6-27B-Della-Deckard-Fable-Qwopus-v3

## Resumen

YFC-112358/Qwen3.6-27B-Della-Deckard-Fable-Qwopus-v3 es un modelo de lenguaje de 27.781 millones de parámetros creado mediante una fusión (merge) en dos etapas sobre la base de Qwen/Qwen3.6-27B. El autor, YFC-112358, combina tres modelos derivados de Qwen3.6-27B en una primera fase usando el método DELLA (density-weighted linear interpolation) para construir un "complejo de inteligencia general" (G), y en una segunda fase aplica una suma lineal (task arithmetic) del incremento relativo del modelo KyleHessling1/Qwopus3.6-27B-Fusion-BF16 sobre el ancestro común. El resultado es un modelo denso de 27B parámetros con licencia Apache 2.0, orientado a generación de texto conversacional.

La relevancia de este modelo reside en su enfoque metodológico: todos los componentes comparten el mismo ancestro (Qwen3.6-27B), lo que garantiza que los vectores de tarea se expresan en un sistema de referencia coherente. El autor documenta explícitamente las decisiones técnicas, incluyendo la omisión de la poda en la segunda etapa (density 1.00) y la desactivación de la selección de signos TIES para preservar características ortogonales de los modelos fuente. Esto lo convierte en un caso de estudio interesante para la comunidad de fusión de modelos, aunque su adopción práctica es limitada al no publicar benchmarks ni métricas de rendimiento.

El repositorio incluye los pesos en formato safetensors (55.6 GB en bfloat16), configuración y tokenizador heredados del ancestro Qwen3.6-27B, y una receta mergekit reproducible. El modelo está etiquetado como compatible con endpoints de Hugging Face y registra cero descargas y cero likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3.6-27B) |
| Parametros totales | 27.781.427.952 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (heredada de Qwen3.6-27B; no especificada en la ficha) |
| Tipos de cuantizacion | No publicados por el autor; pesos en bfloat16 |
| Idiomas soportados | No disponible (no especificados en la ficha) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo es el resultado de un proceso de fusión en dos etapas, no de un entrenamiento desde cero. La primera etapa emplea el método DELLA (implementado en mergekit) para combinar tres modelos derivados de Qwen/Qwen3.6-27B: DavidAU/Qwen3.6-27B-V1.1-FF711-Darker-Hero-GAIN-H2.0 (peso 0.90, densidad 0.85), YFC-112358/Qwen3.6-27B-Della-Deckard-Isometry-Geodesic-v2 (peso 0.80, densidad 0.85) y nightmedia/Qwen3.6-27B-Seven (peso 0.25, densidad 0.55). El resultado es un modelo intermedio G que el autor denomina "complejo de inteligencia general". La segunda etapa aplica task arithmetic (suma lineal) del incremento del modelo KyleHessling1/Qwopus3.6-27B-Fusion-BF16 sobre el ancestro común, con peso 1.00 y densidad 1.00, es decir, sin poda.

El autor documenta dos desviaciones respecto a la receta original: la segunda etapa es una suma lineal pura (no DELLA con poda) porque el incremento de Qwopus respecto al ancestro se concentra en las capas MLP con una magnitud de solo 0.2-0.8%, y no se aplica selección de signos TIES porque los vectores de tarea de los modelos v2 y Fable son casi ortogonales (coseno ≈ 0.01) y la elección de signos eliminaría aproximadamente la mitad de los elementos del modelo v2. El autor también aclara que el modelo intermedio G no se materializó en disco: ambos pasos se calcularon en el mismo bloque de memoria en float32, con salida final en bfloat16, lo que evita transferir aproximadamente 54 GB de datos.

El proceso de fusión se realizó con dtype float32 para los cálculos intermedios y out_dtype bfloat16 para el resultado final. El tokenizador se hereda directamente de Qwen/Qwen3.6-27B. Los parámetros epsilon se ajustaron automáticamente para cumplir la restricción `density ± epsilon ∈ (0,1)`: para densidades de 0.85, epsilon se redujo a 0.13; para densidades de 1.00, epsilon se anula.

## Capacidades

- Generación de texto conversacional: el modelo está etiquetado como text-generation y orientado a uso conversacional.
- Fusión de capacidades: al combinar tres modelos derivados de Qwen3.6-27B, hereda las capacidades de cada fuente, aunque el autor no detalla cuáles son específicamente.
- Soporte de imagen-texto a texto: el modelo incluye el tag image-text-to-text, lo que sugiere capacidades multimodales heredadas de Qwen3.6-27B (modelo nativo de visión-lenguaje).
- Sin capacidades especiales documentadas: no se mencionan tool calling, function calling, modo razonamiento ni otras capacidades específicas en la ficha del modelo.
- Multilingüismo: no especificado; depende del modelo base Qwen3.6-27B.

## Casos de uso

- Investigación en fusión de modelos: el modelo sirve como caso de estudio para evaluar la metodología DELLA en dos etapas con ancestro común, especialmente la decisión de omitir la poda en la segunda etapa. Los investigadores pueden reproducir la receta mergekit y comparar con variantes que sí apliquen poda.
- Evaluación de la contribución de modelos fuente: al documentar los pesos y densidades de cada fuente, el modelo permite aislar la contribución de cada componente (DavidAU, v2, Seven y Qwopus) al comportamiento final, útil para entender qué características se heredan de cada uno.
- Pruebas de generación de texto en español: aunque no hay datos de rendimiento, el modelo puede evaluarse en tareas de generación conversacional en español, dado que Qwen3.6-27B tiene soporte multilingüe (aunque no se especifica en esta ficha).
- Experimentos de cuantización: los pesos en bfloat16 (55.6 GB) pueden cuantizarse a int8 o int4 para evaluar la degradación de rendimiento en un modelo fusionado, comparando con la cuantización de los modelos fuente por separado.
- Desarrollo de asistentes conversacionales: el modelo puede desplegarse como base para un chatbot de propósito general, aprovechando la licencia Apache 2.0 que permite uso comercial sin restricciones.
- Benchmarking de modelos fusionados: el modelo puede incluirse en suites de evaluación comparativa de modelos derivados de Qwen3.6-27B, para determinar si la fusión en dos etapas supera a los modelos individuales en tareas estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye métricas de rendimiento en la model card, y no se encontraron evaluaciones independientes del modelo. Los únicos datos numéricos disponibles son las métricas de "salud de fusión" reportadas en la model card, que describen propiedades estructurales del merge, no rendimiento en tareas:

| Metrica | Valor |
|---|---|
| amp (norma del incremento total / norma de pesos del ancestro) | 0.0202 |
| share (masa de G frente a Qwopus) | 26.002 |
| kill2 (fraccion de pesos eliminados en etapa 2) | 0.0% |
| cold_amp (norma de Qwen3.8·ColdFusion − Qwen3.6 / norma de Qwen3.6) | 0.1217 |

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 27.781 millones de parámetros en bfloat16, lo que requiere aproximadamente 55.6 GB de VRAM para carga completa en precisión nativa.
- GPU recomendadas: para inferencia en bfloat16 se necesitan GPUs con al menos 60-80 GB de VRAM, como NVIDIA A100 (80 GB), H100 (80 GB) o A6000 (48 GB, insuficiente para carga completa en BF16). En consumer, una RTX 4090 (24 GB) solo puede ejecutar el modelo con cuantización a 8 bits o inferior.
- Opciones de despliegue: al ser un modelo transformers estándar, es compatible con vLLM, TGI, llama.cpp (si se convierte a GGUF), Ollama (si se convierte a GGUF) y cualquier framework que soporte modelos de Hugging Face.
- Latencia y throughput: no disponibles. Sin benchmarks publicados, no es posible estimar la latencia de generación con fiabilidad.
- Alternativa de bajo consumo: la cuantización a 4 bits reduciría el requisito de VRAM a aproximadamente 14-16 GB, permitiendo ejecución en GPUs consumer de gama alta (RTX 3090, RTX 4090).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| YFC-112358/Qwen3.6-27B-Della-Deckard-Fable-Qwopus-v3 | 27.78B | No disponible | Apache 2.0 | Fusion en dos etapas (DELLA + task arithmetic) |
| Qwen/Qwen3.6-27B | 27B | No disponible | Apache 2.0 | Modelo base, vision-language denso |
| KyleHessling1/Qwopus3.6-27B-Fusion-BF16 | 27B | No disponible | No disponible | Fuente de la segunda etapa; incremento concentrado en MLP |
| DavidAU/Qwen3.6-27B-V1.1-FF711-Darker-Hero-GAIN-H2.0 | 27B | No disponible | No disponible | Fuente principal de la primera etapa (peso 0.90) |

La comparativa se limita a los modelos fuente, ya que no hay datos de rendimiento publicados para ninguno de ellos en la información disponible. El modelo base Qwen3.6-27B reporta un 77.2% en SWE-bench Verified según fuentes externas, pero este dato no se verifica en la documentación del modelo fusionado.

## Limitaciones y advertencias

- Sin benchmarks publicados: el autor no proporciona resultados de evaluación en tareas estándar (MMLU, HumanEval, GSM8K, etc.), lo que impide conocer el rendimiento real del modelo frente a sus fuentes o al ancestro.
- Cero adopción: el modelo registra cero descargas y cero likes, lo que indica que no ha sido evaluado ni utilizado por la comunidad.
- Dependencia del ancestro: las capacidades reales del modelo dependen enteramente de Qwen3.6-27B; la fusión puede mejorar o degradar capacidades específicas sin que haya datos para verificarlo.
- Riesgo de alucinación: no se han realizado evaluaciones de fiabilidad factual; como modelo derivado de Qwen, hereda los riesgos típicos de alucinación de la familia.
- Sesgos: no se documentan sesgos específicos, pero el modelo hereda los sesgos de Qwen3.6-27B y de los modelos fuente, que no se detallan.
- Soporte limitado: el autor no ofrece documentación adicional, guías de despliegue ni ejemplos de uso más allá del snippet de Python incluido en la model card.
- Sin garantías de producción: al ser un experimento de fusión sin validación independiente, no se recomienda su uso en entornos de producción sin una evaluación exhaustiva previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YFC-112358/Qwen3.6-27B-Della-Deckard-Fable-Qwopus-v3
- Perfil del autor en Hugging Face: https://huggingface.co/YFC-112358/models
- Modelo predecesor (v1): https://huggingface.co/YFC-112358/Qwen3.6-27B-Della-Deckard-v1
- Repositorio de Qwen3.6: https://github.com/QwenLM/Qwen3.6
- Pagina de Qwen3.6-27B en QwenCloud: https://www.qwencloud.com/models/qwen3.6-27b
- Guia de Qwen3.6-27B (fuente externa): https://www.aimadetools.com/blog/qwen-3-6-27b-complete-guide/
