# unconst/Affine-5czsc2fc98-r574-r252-odpo-hirank-midctx-ultraextra-merged

## Resumen

El modelo `Affine-5czsc2fc98-r574-r252-odpo-hirank-midctx-ultraextra-merged`, desarrollado por el usuario `unconst`, es un modelo de lenguaje de tipo Mixture of Experts (MoE) con aproximadamente 35 107 millones de parámetros, basado en la arquitectura Qwen3.5 (según las etiquetas del repositorio). Se trata de un modelo experimental, con cero descargas y una documentación mínima, orientado a la investigación sobre optimización de preferencias mediante Offline DPO sobre pares de razonamiento generados por un modelo maestro.

El modelo se presenta como un refinamiento de un modelo base previo (`unconst/Affine-5czsc2fc98-r252-merged`) y utiliza una técnica de entrenamiento denominada *teacher-anchored Reason pairs*, donde las muestras elegidas son aquellas con mayor diferencia de log-probabilidad condicionada a un pensamiento intermedio. La licencia es Apache-2.0, lo que permite uso comercial y modificación, aunque su naturaleza experimental y la falta de documentación técnica detallada limitan su aplicabilidad inmediata en entornos de producción.

La relevancia de este modelo reside en su enfoque de entrenamiento con DPO offline sobre datos de preferencia generados sintéticamente, un área activa en la investigación de alineación de modelos. Sin embargo, al carecer de benchmarks publicados, evaluaciones de capacidades o instrucciones de despliegue, su utilidad práctica es actualmente incierta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basada en Qwen3.5 (según etiquetas) |
| Parametros totales | 35 107 181 936 (≈35,1 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el entrenamiento usó max_len=8192, pero no se especifica el contexto máximo de inferencia) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura exacta no está documentada en la model card. Las etiquetas indican que se trata de un modelo MoE (qwen3_5_moe) y que incorpora componentes denominados "affine" y "sn120", sin más especificaciones. No se proporcionan detalles sobre el número de expertos, la dimensión oculta, el número de capas ni el mecanismo de atención.

El entrenamiento se realizó mediante Offline DPO (Direct Preference Optimization) sobre pares de preferencia generados a partir de duelos entre respuestas del modelo base. El método emplea un "teacher" (modelo maestro) para anclar las preferencias, seleccionando como "chosen" la respuesta con mayor diferencia de log-probabilidad condicionada a un pensamiento intermedio (`lpC(y_C|z) - lpC(y_C|∅)`). Se utilizó LoRA con rango 64 y alpha 128, beta 0.02, longitud máxima de 8192 tokens y un máximo de 2400 pasos, aunque el entrenamiento se detuvo en el paso 225 por agotamiento de los datos. El hardware empleado fueron 8 GPU B200.

No se mencionan datos sobre el corpus de entrenamiento, el número total de tokens ni si se aplicaron técnicas adicionales como RLHF o DPO con otros objetivos.

## Capacidades

No se han documentado capacidades específicas del modelo. Dado que se basa en una arquitectura MoE derivada de Qwen3.5, se espera que herede capacidades genéricas de generación de texto, razonamiento y posiblemente código, pero no hay confirmación oficial. La model card no menciona soporte para tool calling, agentes, visión ni otras modalidades.

## Casos de uso

No se han documentado casos de uso concretos. Dada la naturaleza experimental del modelo y la ausencia de evaluaciones, no es posible recomendar aplicaciones prácticas sin riesgo. Podría utilizarse como base para experimentos de investigación en alineación de modelos, pero no se dispone de información suficiente para garantizar su comportamiento en tareas específicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras pruebas estándar.

## Requisitos de hardware

No se dispone de información oficial sobre requisitos de hardware. El tamaño del repositorio es de 70,2 GB, lo que sugiere que los pesos están almacenados en precisión FP16 o BF16 (35 107 millones de parámetros × 2 bytes ≈ 70,2 GB). Para inferencia en esta precisión se necesitaría una GPU con al menos 80 GB de VRAM (por ejemplo, A100 80GB, H100 80GB o B200). Con cuantización a 8 bits se reduciría a aproximadamente 35 GB, y a 4 bits a unos 18 GB, pero no se han publicado archivos cuantizados. No se mencionan opciones de despliegue como vLLM, llama.cpp u Ollama.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables. Dado que es un modelo experimental sin documentación pública, no es posible establecer comparaciones fiables con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo experimental con cero descargas y sin evaluaciones independientes.
- Documentación técnica muy escasa: no se especifican arquitectura interna, contexto máximo, idiomas ni capacidades.
- No se han publicado benchmarks ni pruebas de rendimiento.
- El entrenamiento se detuvo prematuramente (paso 225 de 2400) por agotamiento de datos, lo que puede afectar a la convergencia.
- No hay información sobre sesgos, alucinaciones o riesgos de seguridad.
- Aunque la licencia Apache-2.0 permite uso comercial, la falta de garantías y de documentación hace desaconsejable su uso en producción sin una evaluación exhaustiva.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/unconst/Affine-5czsc2fc98-r574-r252-odpo-hirank-midctx-ultraextra-merged)
