# steviel/Reliability-8B-brier-ckpt-400

## Resumen

Reliability-8B-brier-ckpt-400 es un ajuste fino del modelo base Qwen/Qwen3-8B-Base, desarrollado por el usuario steviel, que aplica aprendizaje por refuerzo con la receta RLCR / Brier descrita en el articulo GracefulRL (arXiv 2610.20401). El objetivo de esta receta es que el modelo aprenda a emitir, junto con su respuesta, una estimacion de confianza calibrada, optimizando una recompensa basada en el Brier score en lugar de una recompensa de acierto binaria. Se trata, por tanto, de un modelo orientado a la fiabilidad y la calibracion de la confianza, no a maximizar el rendimiento bruto en tareas.

Arquitectonicamente hereda integramente la estructura del Qwen3-8B-Base, un transformer denso de aproximadamente 8.190 millones de parametros. El checkpoint publicado corresponde al paso 400 de un entrenamiento de 1000 pasos, con pesos fusionados en BF16. El repositorio ocupa 16,4 GB y se distribuye en formato safetensors.

La relevancia de este modelo es experimental: demuestra la aplicacion de una receta de RL con recompensa de calibracion (Brier) sobre un modelo de 8B, usando los hiperparametros del lanzador original pensado para Qwen3-4B sin modificarlos (32 prompts x 32 respuestas, lr 1e-6). No hay informacion publicada sobre evaluaciones, licencia ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-8B-Base) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16; sin variantes GGUF/AWQ publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16, pesos fusionados) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-8B-Base, un transformer denso de 8.190 millones de parametros, y se ajusta mediante aprendizaje por refuerzo con la receta RLCR / Brier del articulo GracefulRL. En esta receta el modelo genera una respuesta acompanada de una estimacion de confianza, y la recompensa se calcula como el Brier score de esa confianza frente a la correccion de la respuesta. Las ventajas se estiman con RLOO (REINFORCE leave-one-out) y el algoritmo de optimizacion es DAPO.

Los hiperparametros declarados son los del lanzador publicado para Qwen3-4B, sin adaptarlos al modelo de 8B: 32 prompts por lote, 32 respuestas por prompt, tasa de aprendizaje 1e-6 y 1000 pasos totales. El checkpoint publicado corresponde al paso 400, con los pesos fusionados en BF16. No se especifican el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo etapas previas de SFT o DPO.

## Capacidades

- Generacion de texto conversacional y de proposito general, heredada del modelo base Qwen3-8B-Base.
- Emision de una estimacion de confianza junto a la respuesta, entrenada explicitamente para estar calibrada mediante recompensa de Brier.
- Razonamiento y generacion de codigo en la medida en que lo soporte el modelo base (no verificado en esta ficha).
- Soporte de tool calling / function calling: no confirmado para este checkpoint.
- Capacidades de agente y razonamiento multi-paso: no confirmadas para este checkpoint.
- Capacidades multilingues: no disponibles.
- Modo thinking, vision o audio: no disponibles.

## Casos de uso

- Enrutamiento con abstención: usar la confianza emitida por el modelo para decidir si una respuesta se sirve directamente o se escala a un humano o a un modelo mayor, reduciendo el coste de errores en produccion.
- Control de calidad en generacion de codigo: integrar la confianza en pipelines de CI/CD para marcar parches generados que requieran revision manual antes de fusionarse.
- Investigacion en calibracion: servir como punto de comparacion frente al Qwen3-8B-Base sin ajustar para estudiar el efecto del RL con recompensa de Brier sobre la calibracion.
- Extraccion de datos con umbral de confianza: en tareas de estructuración de informacion, descartar automaticamente las extracciones con confianza baja antes de persistirlas.
- Atencion al cliente asistida: priorizar las respuestas con mayor confianza y derivar las de menor confianza a agentes humanos, aprovechando la senal de calibracion del modelo.
- Evaluacion de la receta GracefulRL a escala 8B: replicar o extender los experimentos del articulo con un modelo de mayor tamano que el lanzador original de 4B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 16 GB solo para pesos, mas memoria para el contexto y el estado de atencion; en la practica se recomienda al menos 24 GB.
- Cuantizacion a 8 bits: aproximadamente 8-9 GB de pesos; a 4 bits, en torno a 4-5 GB (requiere cuantizar manualmente, ya que no se publican variantes GGUF/AWQ).
- GPU recomendadas: A100 40/80 GB o H100 para BF16 sin cuantizar con contexto amplio; RTX 4090 (24 GB) para BF16 con contexto moderado; RTX 3090/4090 o superiores para cuantizacion 8/4 bits.
- Cabe en GPU de consumo: si, en RTX 4090 en BF16 con contexto limitado, y en GPUs de 16-24 GB con cuantizacion.
- Opciones de despliegue: transformers, text-generation-inference (etiqueta endpoints_compatible), y cuantizacion propia para llama.cpp/Ollama/vLLM (no se proporcionan artefactos preconvertidos).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Reliability-8B-brier-ckpt-400 | 8,19B | no disponible | RL con recompensa Brier (calibracion) | no disponible | Hugging Face |
| Qwen/Qwen3-8B-Base | 8,19B | no disponible | Modelo base preentrenado | no disponible | Hugging Face |
| Qwen3-4B (lanzador GracefulRL) | 4B aprox. | no disponible | Base usado en la receta original | no disponible | Hugging Face |

## Limitaciones y advertencias

- Checkpoint intermedio: corresponde al paso 400 de 1000, por lo que no es el modelo final del entrenamiento.
- Hiperparametros no adaptados: se usan los del lanzador de 4B sobre un modelo de 8B, lo que puede afectar a la estabilidad y a la calidad del ajuste.
- Sin evaluaciones publicadas: no hay benchmarks que permitan verificar la calidad de las respuestas ni la calibracion efectiva.
- Licencia no disponible: no se puede confirmar el uso comercial; debe consultarse con el autor antes de usarlo en produccion.
- Idiomas no declarados: no se garantiza un comportamiento multilingue adecuado.
- Riesgo de alucinacion inherente al modelo base; la confianza emitida puede estar mal calibrada fuera de la distribucion de entrenamiento.
- Sesgos: no documentados, pero heredados del corpus de preentrenamiento de Qwen3-8B-Base.
- Sin variantes cuantizadas oficiales: el despliegue eficiente requiere conversion manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/steviel/Reliability-8B-brier-ckpt-400
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B-Base
- Paper GracefulRL: https://arxiv.org/abs/2610.20401
