# xf15/ssd-dspark-qwen3-4b

## Resumen

El modelo `xf15/ssd-dspark-qwen3-4b` es un drafter (modelo de draft) diseñado para acelerar la inferencia del modelo Qwen/Qwen3-4B mediante decodificación especulativa. Forma parte de la familia DSpark, desarrollada por DeepSeek en el marco del proyecto DeepSpec, que implementa algoritmos de decodificación especulativa de última generación. Este drafter concreto es un checkpoint intermedio (época 4 de 10) de un entrenamiento sobre el corpus open-perfectblend regenerado por el propio Qwen3-4B, con 1.339.815 filas válidas de datos.

El modelo utiliza un bloque de tamaño 7, 5 capas de draft y capas objetivo en las posiciones [1, 9, 17, 25, 33] del modelo base. Su función es generar bloques de tokens en paralelo (estilo DFlash) e inyectar dependencias intra-bloque mediante una cabeza Markov secuencial ligera. No es un modelo autónomo: debe servirse junto con el modelo objetivo Qwen3-4B para reducir la latencia de generación. El repositorio ocupa solo 0,1 GB, lo que indica un modelo de tamaño reducido, adecuado para entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Drafter DSpark (backbone Qwen3 decoder stack + cabeza Markov secuencial) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El drafter sigue el diseño DSpark descrito en el proyecto DeepSpec de DeepSeek. DSpark genera un bloque completo de tokens en una sola pasada paralela, siguiendo el enfoque DFlash: precomputa los KV del contexto y realiza un forward no causal sobre el bloque de consultas. Posteriormente, una cabeza Markov secuencial ligera inyecta dependencias intra-bloque para mejorar la coherencia de los tokens draft. El backbone paralelo es una pila de decodificadores Qwen3 reutilizada del drafter DFlash correspondiente.

El entrenamiento se realizó sobre el corpus open-perfectblend regenerado por Qwen3-4B, con 1.339.815 filas válidas (verificadas mediante caché de activaciones). El plan de entrenamiento contempla 10 épocas con un programador de tasa de aprendizaje coseno (max_train_steps 26160). Este checkpoint corresponde al paso 10464 (época 4 de 10), por lo que no es el modelo final. Los datos se procesan de forma determinista: cada época usa `torch.randperm(1339815, seed 42+e)` truncado a 2616*512 muestras, y los órdenes de barajado están almacenados en `shuffle_records/` para permitir la reproducción exacta.

## Capacidades

- Generación de drafts para decodificación especulativa: propone bloques de 7 tokens en paralelo para acelerar la inferencia del modelo objetivo Qwen3-4B.
- Integración con el modelo objetivo: debe servirse junto con Qwen/Qwen3-4B; no es un modelo de generación autónoma.
- Compatibilidad con vLLM: la documentación de vLLM incluye soporte para modelos Qwen3 DSpark, lo que facilita su despliegue en entornos de producción.
- Reproducibilidad del entrenamiento: incluye metadatos de caché, órdenes de barajado y configuración de reanudación para continuar el entrenamiento desde este checkpoint.
- No soporta tool calling, agentes, visión ni otras capacidades propias de modelos de propósito general, al ser un componente auxiliar de inferencia.

## Casos de uso

- Aceleración de inferencia de Qwen3-4B en producción: al desplegar este drafter junto con el modelo objetivo en un servidor vLLM, se reduce la latencia de generación de texto, especialmente en tareas de generación larga donde la decodificación especulativa ofrece mayores ganancias.
- Reducción de costes de cómputo en servicios de chat o asistentes virtuales: al generar varios tokens por paso, se disminuye el número de iteraciones del modelo grande, lo que reduce el consumo de GPU y el coste por petición.
- Evaluación de estrategias de decodificación especulativa: investigadores pueden comparar este checkpoint intermedio con el drafter final de DeepSeek (deepseek-ai/dspark_qwen3_4b_block7) para estudiar el efecto del número de épocas en la calidad de los drafts.
- Experimentación con el framework DeepSpec: el checkpoint incluye los ficheros necesarios para reanudar el entrenamiento, lo que permite probar variaciones del corpus o de la configuración de entrenamiento.
- Despliegue en entornos con recursos limitados: al ocupar solo 0,1 GB, puede ejecutarse en GPUs consumer junto con el modelo Qwen3-4B cuantizado, habilitando inferencia acelerada en equipos de gama media.
- Investigación sobre dependencias intra-bloque: la cabeza Markov secuencial permite estudiar el equilibrio entre paralelismo y coherencia en la generación de drafts.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un checkpoint intermedio de un entrenamiento en curso, y no se proporcionan métricas de calidad de drafts (tasa de aceptación, latencia, etc.) en la model card.

## Requisitos de hardware

- Tamaño del repositorio: 0,1 GB, lo que sugiere un modelo de pocos cientos de millones de parámetros (no confirmado).
- VRAM estimada: no disponible; al ser un drafter pequeño, se espera que quepa en GPUs consumer junto con el modelo objetivo cuantizado, pero no hay datos oficiales.
- GPUs recomendadas: no disponible; el entrenamiento original se realizó con world size 8 y batch local 1, lo que sugiere un entorno multi-GPU para reanudar el entrenamiento.
- Opciones de despliegue: vLLM (soporte nativo para Qwen3 DSpark), y posiblemente llama.cpp u otros motores que implementen decodificación especulativa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño repo | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| xf15/ssd-dspark-qwen3-4b | Drafter DSpark | 0,1 GB | no disponible | no disponible | Checkpoint intermedio (época 4/10) |
| deepseek-ai/dspark_qwen3_4b_block7 | Drafter DSpark | 2,79 GB | no disponible | no disponible | Drafter oficial de DeepSeek para Qwen3-4B |
| deepseek-ai/dspark_qwen3_4b_block7 (config) | Drafter DFlash | no disponible | no disponible | no disponible | Variante DFlash del mismo drafter |

No se dispone de datos de rendimiento comparativo entre estos modelos. El drafter oficial de DeepSeek es el punto de referencia natural, pero no se han publicado métricas de tasa de aceptación ni de aceleración en la información disponible.

## Limitaciones y advertencias

- Es un checkpoint intermedio (época 4 de 10), no el modelo final; su calidad de drafts puede ser inferior a la del drafter completo.
- No es un modelo autónomo: requiere el modelo objetivo Qwen/Qwen3-4B para funcionar.
- No se especifica licencia, lo que impide conocer las restricciones de uso comercial.
- No hay información sobre sesgos, alucinaciones o limitaciones idiomáticas, al tratarse de un componente auxiliar.
- La reanudación del entrenamiento exige condiciones exactas (world size 8, batch local 1, torch 2.9.1) y la reconstrucción de la caché de activaciones, lo que puede ser complejo en otros entornos.
- El corpus de entrenamiento (open-perfectblend regenerado) no está documentado en cuanto a su composición, por lo que se desconocen posibles sesgos en los datos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/xf15/ssd-dspark-qwen3-4b
- Drafter oficial de DeepSeek: https://huggingface.co/deepseek-ai/dspark_qwen3_4b_block7
- Repositorio DeepSpec: https://github.com/deepseek-ai/DeepSpec
- Configuración DSpark para Qwen3-4B en DeepSpec: https://github.com/deepseek-ai/DeepSpec/blob/main/config/dspark/dspark_qwen3_4b.py
- Documentación de vLLM para Qwen3 DSpark: https://docs.vllm.ai/en/latest/api/vllm/model_executor/models/qwen3_dspark/
