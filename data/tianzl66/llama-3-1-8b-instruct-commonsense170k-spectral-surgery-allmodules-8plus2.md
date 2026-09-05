# tianzl66/Llama-3.1-8B-Instruct-CommonSense170K-Spectral-Surgery-AllModules-8Plus2

## Resumen

El modelo `tianzl66/Llama-3.1-8B-Instruct-CommonSense170K-Spectral-Surgery-AllModules-8Plus2` es un adaptador PEFT (LoRA) sobre el modelo base `meta-llama/Llama-3.1-8B-Instruct`. Ha sido desarrollado por `tianzl66` para investigar una técnica de edición post-hoc llamada Spectral Surgery, basada en Hybrid Newton-Schulz (HNS), que se aplica directamente sobre los pesos del adaptador LoRA sin necesidad de entrenamiento adicional por gradientes. El adaptador se ha ajustado durante 2 épocas sobre el dataset Commonsense170K, orientado a tareas de razonamiento de sentido común.

La relevancia de este modelo radica en su propuesta técnica: en lugar de reentrenar el adaptador, se aplica una edición espectral sobre los módulos de atención y proyección, con 8 pasos rápidos y 2 estables de HNS en todos los módulos. El repositorio tiene un tamaño de 0.2 GB y contiene solo los pesos del adaptador, por lo que es necesario cargar el modelo base por separado para su uso. No se proporcionan datos de licencia, idiomas ni longitud de contexto en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Llama-3.1-8B-Instruct) con adaptador LoRA |
| Parametros totales | 8 mil millones (modelo base) + adaptador LoRA; parametros del adaptador no especificados |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adapter_model.safetensors) |

## Arquitectura y entrenamiento

El adaptador se basa en una arquitectura LoRA con rango 16 y alpha 32. Los módulos objetivo son `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. El entrenamiento se realizó durante 2 épocas sobre el dataset Commonsense170K, con el objetivo de mejorar el razonamiento de sentido común en tareas como BoolQ, PIQA, SocialIQA, HellaSwag, WinoGrande, ARC-Easy, ARC-Challenge y OpenBookQA.

La innovación principal es la aplicación de Spectral Surgery post-hoc mediante Hybrid Newton-Schulz (HNS). Esta técnica edita directamente los pesos del adaptador LoRA sin realizar entrenamiento adicional con gradientes. La configuración utiliza 8 pasos rápidos y 2 pasos estables de HNS sobre todos los módulos (`all_modules`). Según la model card, los metadatos exactos de la edición se encuentran en `spectral_edit_meta.json`.

## Capacidades

- Razonamiento de sentido común: el adaptador está diseñado para mejorar el rendimiento en tareas de inferencia de sentido común, evaluado en 8 benchmarks específicos (BoolQ, PIQA, SocialIQA, HellaSwag, WinoGrande, ARC-Easy, ARC-Challenge y OpenBookQA).
- Comparación de técnicas de edición: el modelo permite evaluar el impacto de Spectral Surgery sobre un adaptador LoRA previamente entrenado.
- No se han documentado capacidades de tool calling, soporte de agentes, visión, audio, razonamiento multi-step o multilingüe en la información proporcionada.

## Casos de uso

- Investigación en edición de modelos: permite estudiar cómo la edición espectral con HNS altera el comportamiento de un adaptador LoRA en tareas de sentido común, sin necesidad de reentrenamiento.
- Reproducción de experimentos académicos: el repositorio incluye métricas de evaluación agregadas y un archivo con los metadatos exactos de la edición, lo que facilita replicar los resultados publicados.
- Comparación de adaptadores LoRA: sirve como punto de referencia para comparar un adaptador LoRA estándar frente a uno editado con Spectral Surgery en los mismos benchmarks.
- Desarrollo de sistemas de pregunta-respuesta de sentido común: el adaptador puede integrarse sobre el modelo base para tareas como BoolQ o OpenBookQA, donde se requiere inferencia sobre conocimiento cotidiano.
- Análisis de robustez de técnicas de ajuste fino: permite evaluar si la edición post-hoc degrada o mejora el rendimiento en tareas individuales de sentido común, lo que es útil para diseñar pipelines de adaptación.
- Experimentación en entornos de bajo coste: al ser un adaptador de aproximadamente 0.2 GB, se puede combinar con un modelo base cuantizado para probar la técnica sin reentrenar el modelo completo.

## Benchmarks y rendimiento

La siguiente tabla recoge los resultados de la evaluación reportada en la model card, comparando el adaptador LoRA sin edición espectral y el adaptador con Spectral Surgery (all modules, 8+2). La evaluación utiliza el tokenizer chat template de Llama-3.1-Instruct, decodificación greedy, `max_new_tokens=8`, backend vLLM, longitud máxima de modelo 2048 y semilla 42.

| Tarea | LoRA (GBS64 final) | + Spectral Surgery (all modules, 8+2) |
|---|---:|---:|
| BoolQ | 87.4924% | 88.3486% |
| PIQA | 89.4450% | 88.7922% |
| SocialIQA | 80.3992% | 80.1945% |
| HellaSwag | 92.3621% | 90.4103% |
| WinoGrande | 86.8193% | 85.7143% |
| ARC-Easy | 93.4764% | 93.8131% |
| ARC-Challenge | 84.2150% | 84.9829% |
| OpenBookQA | 89.0000% | 89.4000% |
| Macro | 87.9012% | 87.7070% |
| Micro | 89.6739% | 88.8755% |
| Correct | 20,104 / 22,419 | 19,925 / 22,419 |

No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Depende del modelo base y de su cuantización; el adaptador por sí solo no permite inferencia autónoma.
- GPU recomendadas: no especificado en la información disponible.
- Posibilidad de ejecución en GPU de consumo: no especificado. El modelo base Llama-3.1-8B-Instruct requiere recursos considerables, pero no se ofrecen datos concretos.
- Opciones de despliegue: vLLM (utilizado en la evaluación reportada). Otras opciones como llama.cpp, Ollama o TGI no se mencionan en la información proporcionada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

La comparación más directa disponible es entre el adaptador LoRA sin edición espectral y el mismo adaptador con Spectral Surgery. No se proporcionan datos de benchmarks de otros modelos de la misma categoría.

| Modelo | Parámetros | Longitud de contexto | Benchmark (macro) | Licencia | Formato de pesos |
|---|---|---|---|---|---|
| Llama-3.1-8B-Instruct (base) | 8 mil millones | no disponible | no disponible | no disponible | no disponible |
| Adaptador LoRA sin Spectral Surgery | Adaptador sobre 8B | no disponible | 87.9012% | no disponible | safetensors |
| Adaptador LoRA con Spectral Surgery (este modelo) | Adaptador sobre 8B | no disponible | 87.7070% | no disponible | safetensors |

## Limitaciones y advertencias

- La técnica de Spectral Surgery no produce mejoras consistentes: en PIQA, SocialIQA, HellaSwag y WinoGrande el rendimiento disminuye respecto al adaptador LoRA sin edición, mientras que en BoolQ, ARC-Easy, ARC-Challenge y OpenBookQA mejora.
- Los promedios macro y micro bajan ligeramente (87.90% a 87.70% y 89.67% a 88.87%, respectivamente).
- No se especifica la licencia del modelo, lo que puede impedir su uso comercial.
- No se documentan los idiomas soportados, por lo que el comportamiento multilingüe no está garantizado.
- Se trata de un adaptador, no de un modelo completo: requiere cargar el modelo base `meta-llama/Llama-3.1-8B-Instruct` para cualquier inferencia.
- No hay información sobre sesgos, riesgo de alucinación ni medidas de seguridad.
- La evaluación se realizó con `max_new_tokens=8`, lo que puede no reflejar el comportamiento en tareas que requieren respuestas largas o razonamiento extendido.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/tianzl66/Llama-3.1-8B-Instruct-CommonSense170K-Spectral-Surgery-AllModules-8Plus2
