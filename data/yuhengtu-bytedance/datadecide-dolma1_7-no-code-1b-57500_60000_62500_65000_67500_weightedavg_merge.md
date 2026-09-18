# yuhengtu-bytedance/DataDecide-dolma1_7-no-code-1B-57500_60000_62500_65000_67500_weightedavg_merge

## Resumen

El modelo `DataDecide-dolma1_7-no-code-1B-57500_60000_62500_65000_67500_weightedavg_merge` es un checkpoint resultante de la fusión lineal (Linear merge) de cinco checkpoints intermedios de un mismo entrenamiento de preentrenamiento, todos ellos etiquetados como `dolma1_7-no-code`, es decir, derivados de una configuración del corpus Dolma 1.7 sin datos de código. Lo publica el usuario `yuhengtu-bytedance` en HuggingFace y no se trata de un modelo entrenado desde cero, sino de una media ponderada de pesos generada con la herramienta mergekit.

El modelo tiene 1.279.854.592 parámetros (aproximadamente 1,28 mil millones) y sigue una arquitectura tipo Llama según la etiqueta declarada. Los checkpoints fusionados corresponden a los pasos 57.500, 60.000, 62.500, 65.000 y 67.500, y la fusión aplica pesos crecientes (1, 2, 3, 4 y 5 respectivamente) con normalización activada, de modo que el checkpoint más avanzado (67.500) recibe la mayor contribución y los más tempranos actúan como regularizadores.

Su relevancia es fundamentalmente experimental y metodológica: sirve para estudiar si la media ponderada de checkpoints de un mismo run mejora la calidad respecto a un checkpoint individual, y forma parte de una familia de artefactos vinculada al prefijo DataDecide. No se trata de un modelo de chat ni de instrucciones, y el autor no publica model card descriptiva, licencia, idiomas ni resultados de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Llama (según etiqueta `llama` del repositorio) |
| Parametros totales | 1.279.854.592 (~1,28 B) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el autor solo publica pesos en bfloat16; no se incluyen versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (repo de 2,6 GB; salida de la fusión en bfloat16, cálculo interno en float32) |
| Pasos fusionados | 57500, 60000, 62500, 65000, 67500 (pesos 1, 2, 3, 4 y 5; normalización activada) |
| Metodo de fusion | Linear merge mediante mergekit |
| Biblioteca declarada | transformers |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de estilo Llama, con tokenizador y configuración no documentados en el repositorio. No hay información sobre el número de capas, dimensiones ocultas, número de cabezas de atención ni tamaño de vocabulario más allá del recuento total de parámetros extraído de los pesos en safetensors. Tampoco se especifica la longitud de contexto con la que fue entrenado el modelo original ni si se aplicaron variantes como atención con RoPE escalado, GQA o decodificación especulativa.

El entrenamiento del que proceden los checkpoints está etiquetado como `dolma1_7-no-code`, lo que indica el uso del corpus Dolma 1.7 con los datos de código excluidos. No se detalla el número de tokens vistos, la composición exacta de la mezcla ni si hubo fases de ajuste por preferencias (RLHF, DPO) posteriores: todo apunta a checkpoints de preentrenamiento puro. La única innovación técnica documentada es la propia operación de fusión: una combinación lineal con normalización de pesos que da más importancia a los pasos tardíos del entrenamiento, siguiendo el enfoque de "model soups" (media de pesos) descrito en el artículo referenciado en las etiquetas del repositorio.

## Capacidades

- Generación de texto autoregresiva en modo completado, propia de un modelo base de preentrenamiento.
- Continuación de documentos y analogías de estilo, sin plantilla de chat ni formato conversacional documentado.
- Punto de partida para ajuste fino supervisado en tareas concretas (clasificación, extracción, resumen), dado su tamaño reducido.
- Soporte de tool calling o function calling: no disponible, no documentado y poco probable en un checkpoint de preentrenamiento sin ajuste de instrucciones.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; el corpus Dolma 1.7 es predominantemente en inglés, pero el autor no declara idiomas.
- Capacidad especial (modo thinking, visión, audio): no disponible.
- Uso como objeto de estudio para experimentos de fusión de pesos y dinámica de entrenamiento.

## Casos de uso

- Investigación sobre fusión de checkpoints: reproducir la fusión lineal con mergekit usando los mismos pesos (1, 2, 3, 4, 5) y comparar la perplejidad del modelo fusionado frente a cada checkpoint individual para cuantificar la ganancia del promediado.
- Estudio de dinámicas de entrenamiento: analizar cómo evoluciona la pérdida y las capacidades entre los pasos 57.500 y 67.500 y determinar en qué punto la media ponderada aporta más que el checkpoint final.
- Base para ajuste fino de dominio: al tener 1,28 B de parámetros, se puede reentrenar por completo o con LoRA en una única GPU consumer para tareas específicas de clasificación o generación controlada.
- Evaluación de la calidad del corpus Dolma 1.7 sin código: utilizar este checkpoint como sonda para medir qué capacidades se preservan y cuáles se degradan al eliminar la porción de código del corpus de preentrenamiento.
- Baseline en experimentos de leyes de escala: emplear el modelo como punto de referencia de ~1 B de parámetros en comparaciones de mezclas de datos o presupuestos de cómputo.
- Despliegue en entornos con recursos muy limitados: servir el modelo en una GPU de gama baja o incluso en CPU para generación de texto de baja latencia en tareas auxiliares (etiquetado, autocompletado simple).
- Generación de datos sintéticos para entrenamiento: producir texto crudo que después se filtre para aumentar corpus de dominios específicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K, ARC, HellaSwag ni perplejidad sobre conjuntos de validación, y tampoco se ofrece comparación con el checkpoint base ni con los checkpoints fusionados por separado.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir de los 1.279.854.592 parámetros: en bfloat16/fp16 unos 2,6 GB solo de pesos; en fp32 unos 5,1 GB; en int8 en torno a 1,3 GB; en int4 alrededor de 0,7 GB. A estas cifras hay que sumar la memoria de la caché KV, que depende de una longitud de contexto no documentada.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para bf16 con contexto corto. Una RTX 3060 de 12 GB, una RTX 4060 Ti de 16 GB, una RTX 4090 o una RTX 5090 son más que suficientes. En centro de datos, una A100 o una H100 quedan muy sobredimensionadas para este tamaño.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU moderna con 6 GB o más, e incluso en cuantización de 4 bits podría ejecutarse en iGPU con memoria unificada.
- Opciones de despliegue: transformers con `text-generation` (biblioteca declarada), text-generation-inference (etiqueta presente), endpoints compatibles; el formato safetensors permite convertirlo a GGUF para llama.cpp u Ollama y a otros formatos de cuantización con herramientas estándar. vLLM es compatible a nivel de arquitectura, aunque no está verificado por el autor.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo ni de latencia en ninguna configuración de hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (DataDecide merge) | ~1,28 B | No disponible | Base, fusión de checkpoints | No disponible | HuggingFace, 0 descargas |
| TinyLlama-1.1B | ~1,1 B | 2.048 tokens | Base e instruct | Apache 2.0 | HuggingFace, ampliamente usado |
| OLMo-1B | ~1,2 B | ~2.048 tokens | Base e instruct | Apache 2.0 | HuggingFace, checkpoints intermedios publicados |
| Llama 3.2 1B | ~1,24 B | 128.000 tokens | Base e instruct | Llama 3.2 Community License | HuggingFace |
| Qwen2.5-1.5B | ~1,54 B | 32.768 tokens | Base e instruct | Apache 2.0 (mayoría de variantes) | HuggingFace |

La comparación es estructural: en parámetros el modelo es equiparable a la clase de 1 B, pero carece de la documentación, licencia explícita, contexto declarado y variantes ajustadas por instrucciones que sí ofrecen las alternativas. Su interés no es competir en rendimiento, sino servir como artefacto de investigación sobre fusión de pesos.

## Limitaciones y advertencias

- No es un modelo ajustado por instrucciones: no sigue instrucciones ni mantiene formato conversacional; usarlo como chatbot produce resultados pobres.
- Ausencia total de información sobre sesgos: no hay evaluación de sesgos de género, raza, religión ni toxicidad, y al derivar de un corpus web (Dolma) es esperable que reproduzca sesgos presentes en los datos.
- Riesgo de alucinación: como todo modelo base de 1,28 B de parámetros, tiende a generar afirmaciones plausibles pero falsas, especialmente en dominios especializados.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas que requieran contextos largos sin medirla empíricamente.
- Idiomas no declarados: no hay garantía de un rendimiento aceptable en castellano, ya que Dolma 1.7 está dominado por inglés.
- Licencia no disponible: sin licencia explícita, el uso comercial entra en una zona legal ambigua y no se puede asumir permisividad.
- Origen de los checkpoints: las rutas del YAML apuntan a directorios locales (`/opt/tiger/Pan_Safety_Better_Measurement/...`) que no están publicados, por lo que la reproducibilidad exacta de la fusión es limitada.
- Efectos de la fusión lineal: promediar checkpoints de distintos pasos puede diluir capacidades que solo aparecen en el checkpoint final; no hay evaluación que confirme que la mezcla mejora al paso 67.500 por sí solo.
- Métricas ausentes: sin perplejidad ni benchmarks, cualquier decisión de adopción debe basarse en una evaluación propia.
- Cero descargas y cero "likes" en el momento de redactar esta ficha: no hay evidencia de uso en producción ni de validación por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yuhengtu-bytedance/DataDecide-dolma1_7-no-code-1B-57500_60000_62500_65000_67500_weightedavg_merge
- Repositorio de mergekit: https://github.com/cg123/mergekit
- Artículo del método Linear merge (model soups): https://arxiv.org/abs/2203.05482
- Corpus Dolma (referencia del identificador `dolma1_7-no-code`): no se proporciona enlace en la información disponible
- Documentación del proyecto DataDecide: no se proporciona enlace en la información disponible
