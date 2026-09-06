# tuanpasg/wudi_gemma_fp32_iter_300

## Resumen

`wudi_gemma_fp32_iter_300` es un modelo experimental de fusión de adaptadores desarrollado por el usuario `tuanpasg`. Se construye a partir del modelo base `google/gemma-2-2b`, combinando tres checkpoints afinados para instrucciones, matemáticas y código mediante el algoritmo propietario `wudi_merge`. El resultado es un modelo de 2.614.341.888 parámetros (2.6B), con pesos en formato safetensors y un tamaño de repositorio de 5.3 GB.

La relevancia de este modelo radica en su enfoque de fusión sin entrenamiento adicional: en lugar de reentrenar el modelo, se fusionan pesos de adaptadores ya afinados. Esto permite explorar técnicas de composición de capacidades (instrucción, matemáticas, código) sobre una arquitectura transformer consolidada. Sin embargo, se trata de un modelo experimental sin evaluaciones publicadas ni documentación de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 2 2B) |
| Parametros totales | 2.614.341.888 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16 segun configuracion del merge) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-2-2b`, un transformer con arquitectura Gemma 2. Sobre esta base, se aplica el algoritmo de fusión `wudi_merge` combinando tres checkpoints afinados: `MergeBench/gemma-2-2b_instruction`, `MergeBench/gemma-2-2b_math` y `MergeBench/gemma-2-2b_coding`. La configuración de fusión utiliza la variante `wudi_all_linear` con 300 iteraciones, tasa de aprendizaje `1e-05`, peso de decaimiento 0, parámetro `wudi_alpha` 0 y `wudi_K` 0.7. Se emplea `ties_sparsify` como variante de esparcimiento y `task_arithmetic` como método de respaldo. Los pesos de embeddings y `lm_head` se excluyen explícitamente de la fusión.

El proceso de fusión se ejecutó en CPU con salida en `bfloat16`, aunque el nombre del repositorio sugiere `fp32`. El tiempo total de fusión fue de 2949.180 segundos. No se proporcionan datos sobre el entrenamiento original de los checkpoints base ni sobre técnicas de alineación como RLHF o DPO.

## Capacidades

- Generación de texto en tareas generales, heredada del checkpoint de instrucciones.
- Razonamiento matemático básico, proveniente del checkpoint de matemáticas.
- Generación y comprensión de código, derivada del checkpoint de codificación.
- Combinación de capacidades mediante fusión de pesos, sin necesidad de reentrenamiento.
- No se ha documentado soporte de tool calling, agentes, visión o audio.
- No existen evaluaciones publicadas que confirmen estas capacidades en el modelo fusionado.

## Casos de uso

- Asistente de código en entornos de desarrollo: el checkpoint de codificación puede generar fragmentos de código y explicaciones, aunque sin validación externa.
- Tutor de matemáticas para estudiantes: el checkpoint de matemáticas permite resolver ejercicios paso a paso, pero requiere supervisión.
- Chatbot de soporte técnico: el checkpoint de instrucciones puede gestionar conversaciones multi-turno básicas.
- Generación de documentación técnica: puede redactar textos descriptivos a partir de especificaciones.
- Asistente de razonamiento simbólico: combina instrucciones y matemáticas para tareas de lógica sencilla.
- Prototipado rápido de asistentes especializados: al fusionar adaptadores, se puede probar la combinación de dominios sin reentrenar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5.2 GB para los pesos en bfloat16, más activaciones y cache; se recomienda entre 8 y 12 GB para uso básico.
- GPU recomendadas: tarjetas con 8 GB o más, como RTX 4060, RTX 3060, A10 o A100. Para uso en producción, A100 o H100.
- Cabe en GPU de consumo de gama media (por ejemplo, RTX 3060 12GB) con batch pequeño.
- Opciones de despliegue: Transformers, vLLM, TGI. Para CPU o GPU de menor capacidad, sería necesario convertir a GGUF (no disponible en este repositorio).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| `tuanpasg/wudi_gemma_fp32_iter_300` | 2.614.341.888 | no disponible | no disponible | safetensors |
| `google/gemma-2-2b` (base) | 2.6B | no disponible en la info | no disponible | safetensors |
| `tuanpasg/wudi_gemma_fp32_1_iter_200` | no disponible | no disponible | no disponible | safetensors |
| `tuanpasg/wudi_ta_gemma_fp32_1` | no disponible | no disponible | no disponible | safetensors |

No se dispone de datos de benchmarks para realizar una comparativa de rendimiento.

## Limitaciones y advertencias

- Modelo experimental sin evaluaciones publicadas; su rendimiento real no está verificado.
- Licencia no especificada, lo que impide determinar si es apto para uso comercial.
- Riesgo de alucinación y de sesgos heredados del modelo base y de los checkpoints de fusión.
- Sin soporte documentado para tool calling, agentes o razonamiento multi-paso.
- La discrepancia entre el nombre `fp32` y la configuración `bfloat16` en los argumentos de fusión puede generar confusión al cargar los pesos.
- No se incluyen instrucciones de uso, prompts recomendados ni configuración de inferencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tuanpasg/wudi_gemma_fp32_iter_300
- Repositorio similar del mismo autor: https://huggingface.co/tuanpasg/wudi_gemma_fp32_1_iter_200
- Repositorio similar del mismo autor: https://huggingface.co/tuanpasg/wudi_ta_gemma_fp32_1
