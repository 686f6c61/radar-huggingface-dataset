# yuhengtu-bytedance/DataDecide-dolma1_7-no-math-code-1B-60000_62500_65000_67500_69369_weightedavg_merge

## Resumen

DataDecide-dolma1_7-no-math-code-1B-60000_62500_65000_67500_69369_weightedavg_merge es un modelo de lenguaje de 1.279.854.592 parámetros (aproximadamente 1,28 mil millones) generado mediante fusión de pesos con mergekit, no mediante un entrenamiento adicional. El autor identificado en HuggingFace es yuhengtu-bytedance y el artefacto se publicó como un merge de tipo linear (promedio ponderado normalizado) sobre cinco checkpoints de una misma ejecución de entrenamiento denominada dolma1_7-no-math-code, correspondientes a los pasos 60000, 62500, 65000, 67500 y 69369.

El interés del modelo es fundamentalmente metodológico: sirve como artefacto reproducible para estudiar cómo se comporta el promedio de checkpoints intermedios de un mismo run de preentrenamiento (técnica de model soups, arXiv:2203.05482) en un escenario de mezcla de datos sin matemáticas ni código. No es un modelo de propósito general listo para producción: es un checkpoint base, sin ajuste por instrucciones documentado, sin licencia declarada y sin resultados de evaluación publicados.

La relevancia actual es limitada y acotada al ámbito de investigación en curación de datos y merging. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, pesa 2,6 GB y no incluye model card más allá de la configuración YAML del merge.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder de tipo Llama (según el tag `llama` del repositorio) |
| Parametros totales | 1.279.854.592 (aproximadamente 1,28 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No se distribuyen cuantizaciones precalculadas; pesos originales en bfloat16, convertibles a GGUF, int8 o int4 con herramientas externas |
| Idiomas soportados | No disponibles (el nombre del dataset de origen, dolma1_7, apunta a un corpus predominantemente en inglés, pero no se documenta) |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 2,6 GB |
| Metodo de fusion | Linear (mergekit), con normalizacion de pesos |
| Pesos del merge | 1 (step60000), 2 (step62500), 3 (step65000), 4 (step67500), 5 (step69369, checkpoint base) |
| dtype de fusion / salida | float32 / bfloat16 |

## Arquitectura y entrenamiento

El modelo no se ha entrenado desde cero para esta publicación: es el resultado de aplicar un merge lineal (Linear, descrito en arXiv:2203.05482) sobre cinco checkpoints de una ejecución de preentrenamiento etiquetada como dolma1_7-no-math-code. La configuración YAML declara `base_model` en el checkpoint del paso 69369 y pesos crecientes 1, 2, 3, 4 y 5 para los pasos 60000, 62500, 65000, 67500 y 69369 respectivamente, con `normalize: true`, lo que equivale a una media ponderada de los tensores de pesos con pesos normalizados a suma 1. La fusión se realizó en float32 y se serializó en bfloat16.

La arquitectura subyacente es la de un transformer decoder de la familia Llama, con 1,28 mil millones de parámetros, coherente con los runs de escala de 1B que se emplean habitualmente en experimentos de escalado de decisiones de datos. El nombre del run indica que la mezcla de datos excluye explícitamente contenido de matemáticas y de código, de modo que el modelo no ha visto ese tipo de corpus durante el preentrenamiento. No hay información disponible sobre el número total de tokens consumidos, la composición exacta del dataset, ni sobre si se aplicó RLHF, DPO u otra fase de alineamiento. Tampoco se documenta ninguna innovación técnica más allá del propio procedimiento de fusión.

## Capacidades

- Generación de texto autoregresiva como modelo base (no ajustado por instrucciones según la información disponible).
- Continuación de texto y modelado de lenguaje puro; no hay evidencia de un modo de chat o de plantilla de conversación.
- Razonamiento matemático: previsiblemente limitado, dado que el run de origen excluye explícitamente datos de matemáticas.
- Generación de código: previsiblemente limitada o ausente, dado que el run de origen excluye datos de código.
- Soporte de tool calling / function calling: no disponible y poco probable al tratarse de un checkpoint base sin ajuste.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas; el corpus de origen sugiere predominancia del inglés.
- Capacidades especiales (visión, audio, modo thinking): no disponibles.

## Casos de uso

- Investigación en model merging: reproducir el experimento de promedio ponderado de checkpoints intermedios y comparar el comportamiento del merge frente a cada checkpoint individual, usando la configuración YAML publicada como referencia exacta.
- Estudio de leyes de escalado en curación de datos: emplear este artefacto como punto de medida dentro de una familia de merges sobre la mezcla dolma1_7-no-math-code para analizar cómo evoluciona la pérdida o las métricas a lo largo de los pasos 60000 a 69369.
- Punto de partida para fine-tuning supervisado: al ser un modelo base de 1,28B parámetros, se puede ajustar con SFT o LoRA en un único GPU consumer para tareas concretas, partiendo de pesos promediados que suelen ser más estables que un checkpoint aislado.
- Baseline en experimentos de ablation: comparar el merge lineal de cinco checkpoints frente a alternativas como SLERP, TIES o DARE mediante mergekit, manteniendo fijos los checkpoints de origen.
- Generación de texto en inglés para prototipado interno: tareas de continuación de texto, resumen extractivo o clasificación mediante prompting, siempre que el uso sea experimental y no comercial dada la ausencia de licencia.
- Extracción de representaciones internas: uso de las capas ocultas del modelo como features para clasificadores ligeros o para análisis de representaciones en estudios de interpretabilidad.
- Docencia y formación técnica: ejemplo real y de tamaño manejable para explicar en un aula cómo funciona un merge de pesos y por qué el promedio de checkpoints próximos suele producir un modelo más robusto que cualquiera de ellos por separado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K, ARC, HellaSwag ni de ningún otro conjunto de referencia, y la model card se limita a la configuración del merge.

## Requisitos de hardware

- Peso en disco y en memoria de los pesos: 2,6 GB en el repositorio (bfloat16), aproximadamente 2,56 GB de VRAM solo para pesos en bf16, unos 5,12 GB si se carga en float32.
- Cuantización a 8 bits: aproximadamente 1,3 GB de VRAM, más overhead de activaciones y caché KV.
- Cuantización a 4 bits: aproximadamente 0,75-0,85 GB de VRAM, más overhead.
- GPU consumer: cabe holgadamente en cualquier GPU con 8 GB o más (RTX 3060 Ti, RTX 3070, RTX 4060, RTX 4070, RTX 4080, RTX 4090). También es viable en GPUs con 6 GB si se usa cuantización de 4 bits y ventanas de contexto cortas.
- GPU de datacenter: funciona sin problemas en A100, H100, L40S, A10G y T4; en estas tarjetas el factor limitante es la latencia de red y el ancho de banda de memoria, no la capacidad.
- CPU: inferencia posible en llama.cpp u Ollama con cuantizaciones Q4 o Q5, con velocidades del orden de decenas de tokens por segundo en procesadores modernos de escritorio, si bien no se dispone de mediciones publicadas para este modelo concreto.
- Opciones de despliegue: transformers (librería declarada y `text-generation-inference` según los tags), vLLM, TGI, llama.cpp y Ollama tras conversión a GGUF. También es compatible con `endpoints_compatible` según los tags del repositorio.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo ni de tiempo hasta el primer token para este artefacto.

## Comparativa con modelos similares

Los datos de la columna de comparación corresponden a especificaciones públicas de catálogo de cada modelo y no a mediciones realizadas sobre este merge concreto.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| DataDecide-dolma1_7-no-math-code-1B (este merge) | 1,28B | No disponible | No disponible | Checkpoint base fusionado con mergekit; sin benchmarks publicados |
| Llama 3.2 1B | 1,24B | 128k (con escalado de RoPE) | Llama 3.2 Community License | Modelo base e instruct disponibles; requiere cumplir la política de uso aceptable |
| Qwen2.5-1.5B | 1,54B | 32.768 tokens | Apache 2.0 | Licencia permisiva, buen soporte multilingüe y de código |
| SmolLM2-1.7B | 1,71B | 8.192 tokens | Apache 2.0 | Diseñado para despliegue en dispositivo, con variantes instruct |

Frente a estas alternativas, este modelo no ofrece ventajas documentadas de contexto, licencia o evaluación: su valor es exclusivamente experimental dentro del proyecto de investigación del que procede.

## Limitaciones y advertencias

- Ausencia total de licencia declarada: no se puede asumir uso comercial ni redistribución sin consultar previamente al autor.
- Es un modelo base sin ajuste por instrucciones documentado; no seguirá instrucciones ni mantendrá formato conversacional de forma fiable.
- No hay benchmarks publicados, por lo que no existe evidencia objetiva de su calidad frente a checkpoints individuales de los que procede.
- Riesgo de alucinación inherente a cualquier modelo de lenguaje de 1,28B parámetros sin alineamiento; la tasa no está medida.
- Idiomas soportados no documentados. El corpus de origen sugiere predominancia del inglés, con cobertura probablemente muy limitada del castellano.
- Longitud de contexto no documentada ni verificada; no se debe asumir ninguna ventana concreta en producción.
- El promedio de checkpoints intermedios de un mismo run puede degradar tareas específicas si los checkpoints tienen comportamientos divergentes; el autor no aporta ninguna evaluación que descarte este efecto.
- Al proceder de un run sin datos de matemáticas ni de código, el rendimiento en tareas cuantitativas y de programación es previsiblemente bajo y no está medido.
- El modelo no incluye pesos alternativos, cuantizaciones ni herramientas de tokenización propias más allá de las heredadas de la familia Llama.
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad ni informes de uso en producción.
- Fecha de creación registrada como 2026-09-17, posterior a la fecha habitual de consulta; conviene verificar la vigencia y el estado del repositorio antes de integrarlo en cualquier flujo de trabajo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yuhengtu-bytedance/DataDecide-dolma1_7-no-math-code-1B-60000_62500_65000_67500_69369_weightedavg_merge
- mergekit (herramienta empleada para la fusión): https://github.com/cg123/mergekit
- Método de fusión Linear / model soups: https://arxiv.org/abs/2203.05482
- Los resultados de búsqueda web proporcionados no contienen información relevante sobre este modelo: todas las entradas devueltas hacen referencia a ChatGPT y no guardan relación con el artefacto descrito.
