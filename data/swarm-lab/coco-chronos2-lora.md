# SWARM-Lab/CoCo-Chronos2-LoRA

## Resumen

CoCo-Chronos2-LoRA es un adaptador PEFT LoRA de rango 8 publicado por SWARM-Lab (UT Austin) que se aplica sobre el modelo base amazon/chronos-2, un modelo de series temporales. Forma parte del trabajo "TSFM Meets LLM: Context as Covariates (CoCo)", presentado en NeurIPS 2026, y constituye el componente de forecasting multivariante del sistema: su función es enseñar a Chronos2 a incorporar como covariables la predicción y la confianza generadas por un LLM, combinadas con el historial numérico de la serie.

El adaptador no es un modelo autónomo: requiere cargar el checkpoint base y fusionar los pesos LoRA en memoria. Su relevancia radica en que propone un puente explícito entre modelos de lenguaje y modelos de series temporales, tratando la salida del LLM no como texto sino como canales numéricos normalizados que el TSFM consume junto a la historia observada. El adaptador companion para el lado LLM es SWARM-Lab/CoCo-Qwen3-4B-LoRA.

El repositorio contiene únicamente los pesos del adaptador (4.854.584 bytes), con licencia del adaptador no especificada y licencia Apache-2.0 heredada del modelo base. El uso previsto declarado por los autores es la investigación en forecasting de series temporales asistido por texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer de series temporales Chronos2 |
| Parametros totales | no disponible (adaptador de 4.854.584 bytes; base no cuantificado en la informacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el ejemplo de carga usa bfloat16) |
| Idiomas soportados | no disponible (modelo numerico de series temporales) |
| Licencia | adaptador: no disponible; modelo base amazon/chronos-2: Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT); requiere el checkpoint base amazon/chronos-2 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Chronos2Model mediante PEFT con rango 8, alpha 16 y dropout 0. Los módulos objetivo son `self_attention.q`, `self_attention.k`, `self_attention.v`, `self_attention.o` y `output_patch_embedding.output_layer`. La configuración registrada corresponde a PEFT 0.18.1, con el entorno fijado en `chronos-forecasting==2.1.0`, `peft==0.18.1` y `torch==2.9.0`.

El entrenamiento descrito en el paper consiste en una segunda etapa de adaptación LoRA sobre covariables de forecast y confianza generadas previamente por un LLM. La construcción de covariables es específica: el canal de forecast se desplaza, el historial numérico se normaliza con estadísticas calculadas solo sobre el historial, y la varianza cruda del rollout se divide por la desviación estándar del historial al cuadrado, con el estabilizador numérico de la implementación. El ruido del historial usa desviación estándar 0,05. La covariable de confianza es una señal de varianza de rollout, no una probabilidad calibrada de acierto. No se detallan en la información disponible el número de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Forecasting multivariante de series temporales sobre el modelo base Chronos2.
- Incorporación de la predicción de un LLM como covariable numérica junto al historial observado.
- Incorporación de una señal de confianza (varianza de rollout) como covariable adicional.
- Normalización del historial con estadísticas restringidas al propio historial, evitando fuga de información futura.
- Integración con el paquete de inferencia CoCo, que soporta Transformers + PEFT o vLLM.
- No soporta tool calling, agentes, visión, audio ni generación de texto: es un componente numérico de forecasting.
- Capacidades multilingües no aplicables.

## Casos de uso

- Investigación en forecasting asistido por LLM: reproducir los experimentos del paper CoCo combinando este adaptador con SWARM-Lab/CoCo-Qwen3-4B-LoRA para evaluar la ganancia de usar contexto textual como covariable.
- Predicción de demanda con contexto textual: usar la salida de un LLM (por ejemplo, a partir de notas de negocio o eventos) como canal de forecast junto al historial de ventas, aprovechando la normalización por estadísticas del historial.
- Series multivariantes con incertidumbre: emplear la covariable de confianza derivada de la varianza de rollout para ponderar escenarios de alta y baja certeza en la planificación.
- Evaluación comparativa de TSFM: medir el efecto del adaptador frente a Chronos2 sin adaptar en pipelines de benchmark propios, dado que el adaptador es ligero (menos de 5 MB).
- Prototipado en investigación académica: integrar el adaptador en el paquete CoCo para experimentar con distintas construcciones de covariables y estabilizadores numéricos.
- Despliegue con vLLM en el pipeline CoCo: servir el componente de forecasting junto al adaptador LLM en un mismo flujo de inferencia para estudios de latencia y throughput.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada; depende del checkpoint base amazon/chronos-2, que no se detalla.
- El ejemplo de carga usa `torch_dtype=torch.bfloat16` y `device_map="cuda"`, por lo que requiere una GPU con soporte bfloat16.
- GPU recomendadas: no disponible; no se especifican modelos concretos (A100, H100, RTX 4090 u otros).
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue: Transformers + PEFT (con `merge_and_unload`) o vLLM a través del paquete CoCo.
- Latencia y throughput: no disponibles.
- Nota del autor: el ejemplo de carga remota no ha sido probado en GPU como parte de la release.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CoCo-Chronos2-LoRA | Adaptador LoRA r=8 sobre Chronos2 | no disponible | Forecasting multivariante con covariables de LLM | Adaptador no disponible; base Apache-2.0 | HuggingFace (32 descargas) |
| amazon/chronos-2 | no disponible | no disponible | Forecasting de series temporales | Apache-2.0 | HuggingFace (modelo base) |
| SWARM-Lab/CoCo-Qwen3-4B-LoRA | Adaptador LoRA sobre Qwen3-4B | no disponible | Generación de covariables de forecast y confianza | no disponible | HuggingFace (componente companion) |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- No es un modelo autónomo: sin el checkpoint base amazon/chronos-2 y sin la construcción de covariables del paper, el adaptador no produce resultados válidos.
- No deben suministrarse embeddings de texto arbitrarios; es obligatorio replicar el desplazamiento del canal de forecast, la normalización por estadísticas del historial y la división de la varianza por la desviación estándar al cuadrado.
- La covariable de confianza es una varianza de rollout, no una probabilidad calibrada de corrección; no debe interpretarse como tal en producción.
- El ejemplo de carga remota no ha sido probado en GPU según el propio autor, lo que introduce riesgo de integración.
- Licencia del adaptador no especificada: verificar condiciones antes de cualquier uso comercial, aunque el modelo base sea Apache-2.0.
- Uso previsto declarado exclusivamente para investigación; no hay evidencia publicada de robustez en entornos de producción.
- No hay información sobre sesgos, cobertura idiomática ni riesgo de alucinación aplicable a este componente numérico.
- Dependencias muy fijadas (`chronos-forecasting==2.1.0`, `peft==0.18.1`, `torch==2.9.0`): posibles incompatibilidades con otros entornos.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/SWARM-Lab/CoCo-Chronos2-LoRA
- Modelo base: https://huggingface.co/amazon/chronos-2
- Adaptador companion LLM: https://huggingface.co/SWARM-Lab/CoCo-Qwen3-4B-LoRA
- Paper (arXiv): https://arxiv.org/abs/2611.05515
- Paper (OpenReview): https://openreview.net/forum?id=t2nNTWgHfq
- Blog: https://utaustin-swarmlab.github.io/2026/11/04/CoCo.html
- Código: https://github.com/UTAustin-SwarmLab/CoCo
