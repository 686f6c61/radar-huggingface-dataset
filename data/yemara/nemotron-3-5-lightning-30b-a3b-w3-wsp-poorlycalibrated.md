# yemara/Nemotron-3.5-Lightning-30B-A3B-W3-WSP-PoorlyCalibrated

## Resumen

Nemotron-3.5-Lightning-30B-A3B-W3-WSP-PoorlyCalibrated es un checkpoint cuantizado a 3 bits del modelo NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4, publicado por el usuario yemara en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una reparación experimental de un checkpoint GPTQ de 3 bits mal calibrado: un agente LLM leyó los pesos y activaciones del modelo y editó directamente dos matrices, equivalentes al 0,0008 % de los pesos totales, sin ajustar ningún peso a datos. El resultado es un modelo que recupera buena parte del rendimiento perdido por la cuantización agresiva.

El modelo base, desarrollado por NVIDIA, emplea una arquitectura híbrida de mezcla de expertos (MoE) que intercala capas Mamba-2, capas MoE y capas de atención selectivas, con 30 000 millones de parámetros totales y solo 3000 millones activos durante la inferencia. Está orientado a agentes autónomos, despliegues de subagentes e inferencia local. La relevancia de este checkpoint concreto reside en su enfoque metodológico: demuestra que una intervención quirúrgica sobre un número ínfimo de pesos puede rescatar un modelo cuantizado degradado, acercándolo de nuevo a la versión original en FP4.

La ficha se centra en este checkpoint de 3 bits, que ocupa 17,3 GB en el repositorio y se distribuye bajo licencia OpenMDW-1.1. Es un artefacto de investigación más que un modelo listo para producción, pero sus cifras de recuperación de benchmarks (de 71,4 a 91,6 en GSM8K, por ejemplo) lo convierten en un caso de estudio interesante para quienes trabajan en cuantización y reparación de modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida MoE con capas Mamba-2, MoE y atención selectivas (familia Nemotron H) |
| Parametros totales | 30 000 millones (30B) |
| Parametros activos | 3000 millones (3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 3 bits (GPTQ, checkpoint base), NVFP4 en el modelo original, dequantización a BF16 para servir |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | Pesos cuantizados a 3 bits con script `dequantize.py` para reconstruir BF16; repo de 17,3 GB |

## Arquitectura y entrenamiento

El modelo base NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4 utiliza una arquitectura híbrida de mezcla de expertos que intercala capas Mamba-2 (modelos de espacio de estados), capas MoE y un subconjunto de capas de atención. Con 30B parámetros totales y 3B activos por token, el diseño busca un equilibrio entre capacidad y eficiencia de inferencia, adecuado para agentes autónomos y despliegues locales. NVIDIA lo publicó junto con varios métodos de decodificación especulativa para acelerar la generación de texto.

Este checkpoint concreto no ha sido entrenado: parte de un GPTQ de 3 bits mal calibrado y aplica una técnica denominada "agent weight space programming" (WSP). Un agente LLM examinó los pesos y activaciones del modelo degradado y editó directamente dos matrices, que representan el 0,0008 % de los pesos totales, sin ajuste a datos. No se dispone de información sobre el número de tokens de entrenamiento del modelo original, la composición del dataset ni si hubo RLHF o DPO. La innovación destacable es precisamente el método de reparación post-cuantización, documentado en un blog del laboratorio Abdelfattah.

## Capacidades

- Generación de texto y razonamiento general, con resultados medidos en MMLU (74,3 en este checkpoint).
- Razonamiento matemático: GSM8K (91,6) y MATH-500 (82,2) en la versión reparada.
- Generación de código: LiveCodeBench v6 con 48,6.
- Razonamiento científico de nivel avanzado: GPQA Diamond con 62,6.
- Orientación a agentes autónomos y despliegues de subagentes, según la documentación del modelo base de NVIDIA.
- Compatibilidad con decodificación especulativa, según la documentación del modelo base.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Investigación en cuantización: servir como referencia para estudiar cómo la reparación selectiva de pesos recupera rendimiento tras una cuantización agresiva a 3 bits, comparando las métricas antes y después de las ediciones del agente.
- Despliegue con restricciones de memoria: al ocupar 17,3 GB en disco y poder dequantizarse a BF16, permite ejecutar un modelo de 30B con 3B activos en una sola GPU, útil para prototipos de agentes en entornos con VRAM limitada.
- Evaluación de pipelines de agentes: su orientación a agentes autónomos y subagentes lo hace adecuado para probar orquestaciones multi-paso en laboratorio antes de migrar a la versión NVFP4 completa.
- Razonamiento matemático asistido: con 91,6 en GSM8K y 82,2 en MATH-500, puede emplearse en tareas de resolución de problemas matemáticos donde la latencia no sea crítica.
- Generación de código en entornos de prueba: con 48,6 en LiveCodeBench v6, sirve para experimentar con asistentes de código en local, siempre validando la salida.
- Reproducción de experimentos: el script `dequantize.py` y el blog asociado permiten replicar el proceso de reconstrucción del checkpoint BF16 y verificar las cifras publicadas con vLLM en una GPU.

## Benchmarks y rendimiento

| Checkpoint | Pesos editados | GSM8K | MATH-500 | LiveCodeBench v6 | GPQA Diamond | MMLU | WikiText-2 PPL |
|---|---|---|---|---|---|---|---|
| NVFP4 release | – | 95,0 | 88,8 | 55,2 | 71,1 | 77,1 | 8,08 |
| 3 bits mal calibrado | – | 71,4 | 60,8 | 30,8 | 47,1 | 66,8 | 11,76 |
| + ediciones del agente (este repo) | 0,0008 % | 91,6 | 82,2 | 48,6 | 62,6 | 74,3 | 9,39 |

Los conjuntos de prueba se ejecutaron una sola vez, con los pesos de 3 bits dequantizados a BF16 y servidos con vLLM en una única GPU. No se han publicado otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 17,3 GB en disco en formato de 3 bits; tras dequantizar a BF16, los 30B parámetros requieren aproximadamente 60 GB de VRAM, aunque solo 3B se activan por token.
- GPU recomendadas: A100 de 80 GB o H100 para servir el checkpoint dequantizado a BF16 con vLLM; una RTX 4090 de 24 GB no es suficiente para la versión BF16 completa.
- Cabe en GPU de consumo: no en formato BF16; el checkpoint de 3 bits podría caber en GPUs de 24 GB si el runtime soporta la cuantización, pero la información proporcionada solo documenta el flujo de dequantización a BF16.
- Opciones de despliegue: vLLM es el runtime documentado (`vllm serve <out dir>` tras ejecutar `dequantize.py`); no se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (W3 WSP) | 30B | 3B | no disponible | OpenMDW-1.1 | Hugging Face, 0 descargas |
| NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4 | 30B | 3B | no disponible | OpenMDW-1.1 | Hugging Face, NVIDIA NIM |
| 3 bits GPTQ mal calibrado (origen) | 30B | 3B | no disponible | OpenMDW-1.1 | No distribuido como repo independiente |

La comparativa se limita a las variantes del mismo modelo base, ya que la información proporcionada no incluye otros modelos comparables de la misma categoría. Las diferencias de rendimiento entre las tres variantes se detallan en la tabla de benchmarks.

## Limitaciones y advertencias

- Es un artefacto de investigación: el propio autor lo describe como una reparación experimental con un agente, no como un modelo validado para producción.
- Los benchmarks se ejecutaron una sola vez, sin repeticiones ni intervalos de confianza, lo que limita la fiabilidad estadística de las cifras.
- Rendimiento inferior al modelo NVFP4 original en todas las métricas: 3,4 puntos menos en GSM8K, 6,6 en MATH-500, 6,6 en LiveCodeBench v6, 8,5 en GPQA Diamond y 2,8 en MMLU.
- La perplejidad en WikiText-2 (9,39) sigue por encima de la del original (8,08), lo que indica degradación residual.
- Riesgo de alucinación: no cuantificado en la información disponible, pero previsible en un modelo de 3 bits reparado.
- Idiomas soportados no documentados, lo que impide garantizar un rendimiento multilingüe.
- Longitud de contexto no disponible, factor crítico para casos de uso con documentos largos.
- Licencia OpenMDW-1.1: es necesario revisar sus términos para uso comercial, ya que la model card la etiqueta como "other" y remite al texto de la licencia original de NVIDIA.
- Sin descargas ni likes en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.
- El flujo de uso exige ejecutar `dequantize.py` para reconstruir un checkpoint BF16, lo que añade un paso manual y requisitos de almacenamiento adicionales.

## Enlaces

- Hugging Face: https://huggingface.co/yemara/Nemotron-3.5-Lightning-30B-A3B-W3-WSP-PoorlyCalibrated
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4
- Blog del método WSP: https://abdelfattah-lab.github.io/blogs/wsp-quant-repair/
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Model card en NVIDIA NIM: https://build.nvidia.com/nvidia/nemotron-3.5-lightning-30b-a3b/modelcard
- SourceForge: https://sourceforge.net/projects/nemotron-3-5-lightning/
