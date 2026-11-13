# zhangify/oalc-local159-step75-backup-20261113

## Resumen

OALC local159 step 75 es un checkpoint de investigación publicado por el usuario zhangify en Hugging Face. Se trata de un modelo multimodal de tipo image-text-to-text derivado de la familia Qwen 3.5 (etiqueta `qwen3_5` en los tags), entrenado dentro de un experimento denominado `qwen35_local_sampled_kl159_thinkFalse_250step_lr1e-06_20261020_235032`, del que este repositorio conserva el paso 75 de un total de 250 previstos.

El modelo cuenta con 4.539.265.536 parámetros totales según los pesos en safetensors, lo que lo sitúa en la franja de los modelos de aproximadamente 4.500 millones de parámetros, y el repositorio ocupa 18,2 GB, un tamaño coherente con pesos en precisión de 32 bits o con múltiples ficheros de checkpoint. La nomenclatura del experimento sugiere un ajuste con una tasa de aprendizaje de 1e-6, muestreo local y una variante de entrenamiento con el modo "thinking" desactivado (`thinkFalse`).

La relevancia de este modelo es limitada fuera del contexto de investigación: no es un lanzamiento oficial de Alibaba/Qwen, no incluye evaluación de calidad ni de seguridad, y el propio autor advierte que el repositorio solo preserva pesos, tokenizador y configuración, sin estado del optimizador, por lo que no permite reanudar el entrenamiento de forma exacta. Es útil para quien quiera reproducir o inspeccionar un checkpoint intermedio de un experimento de ajuste sobre Qwen 3.5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) basada en Qwen 3.5; detalles internos no disponibles |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors; no se publican GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo se etiqueta como `qwen3_5` y como `image-text-to-text`, lo que indica una arquitectura transformer multimodal capaz de procesar imágenes y texto de entrada y generar texto. No se especifican en la información disponible el número de capas, la dimensión oculta, el tipo de atención ni el mecanismo de fusión visión-lenguaje; tampoco se detalla el codificador visual. Dado el tamaño de 4.539 millones de parámetros, se trata presumiblemente de una variante pequeña o mediana dentro de la familia Qwen 3.5, pero este dato no se confirma en la model card.

El entrenamiento corresponde a un experimento de ajuste identificado como `qwen35_local_sampled_kl159_thinkFalse_250step_lr1e-06_20261020_235032`. Los elementos que se pueden inferir de ese nombre son: una tasa de aprendizaje de 1e-6, un total previsto de 250 pasos, muestreo local (`local_sampled`), una referencia a KL con el valor 159 (`kl159`) y el modo de razonamiento desactivado (`thinkFalse`). El checkpoint publicado corresponde al paso 75. No se indica el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO o alguna fase de alineación posterior. El autor declara explícitamente que no se implica ninguna evaluación adicional de calidad o seguridad por esta subida.

## Capacidades

- Generación de texto conversacional, según la etiqueta `conversational` del repositorio.
- Procesamiento de entrada multimodal imagen-texto y generación de texto (`image-text-to-text`), lo que permite responder preguntas sobre imágenes.
- Compatibilidad declarada con endpoints (`endpoints_compatible`), lo que facilita su despliegue mediante la infraestructura de inferencia de Hugging Face.
- Integración con la librería transformers, con tokenizador y configuración incluidos en el repositorio.
- Modo de razonamiento desactivado en el entrenamiento (`thinkFalse`), aunque no se detalla si el modelo conserva o no la capacidad de razonamiento extendido en inferencia.
- Tool calling, function calling, capacidades de agente, multilingüismo específico y otras capacidades especiales: no disponibles en la información proporcionada.

## Casos de uso

- Investigación sobre ajuste fino de modelos multimodales: el checkpoint permite inspeccionar el estado intermedio del paso 75 de un experimento de 250 pasos y compararlo con otros checkpoints de la misma serie para estudiar la evolución de las representaciones durante el entrenamiento.
- Reproducción de experimentos: al conservar pesos, tokenizador y configuración originales, sirve para replicar condiciones de inferencia del experimento `qwen35_local_sampled_kl159_thinkFalse_250step_lr1e-06_20261020_235032` sin depender de artefactos externos.
- Análisis de la influencia del modo "thinking": al haberse entrenado con `thinkFalse`, puede emplearse para comparar el comportamiento conversacional frente a variantes con razonamiento activado sobre la misma base Qwen 3.5.
- Pruebas de pipelines de inferencia multimodal: su etiqueta `endpoints_compatible` y su formato safetensors permiten validar flujos de despliegue con transformers y servicios de inferencia gestionados.
- Evaluación de estabilidad de checkpoints intermedios: útil para medir degradación o mejora de la calidad conversacional en pasos tempranos del ajuste antes de alcanzar el paso final.
- Docencia y experimentación académica: al ser un checkpoint de investigación de tamaño moderado (unos 4.500 millones de parámetros), puede utilizarse en entornos con recursos limitados para estudiar técnicas de ajuste con muestreo local y regularización KL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que esta subida no implica ninguna evaluación de calidad o seguridad del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa basada en el número de parámetros (4.539 millones), en FP16 serían necesarios aproximadamente 9 GB solo para los pesos, más memoria para el codificador visual, el tokenizador y la caché KV; en cuantización de 8 bits, alrededor de 4,5-5 GB; en 4 bits, alrededor de 2,5-3 GB. Estas cifras son estimaciones y no proceden de la model card.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, cabría esperar que funcionase en GPUs de consumo con 12-16 GB o más de VRAM en FP16, y en GPUs de 8 GB con cuantización, pero no hay confirmación oficial.
- Cabe en GPU de consumo: probablemente sí en modelos con 12 GB o más en FP16 y en modelos de 8 GB con cuantización, si bien no se dispone de datos verificados.
- Opciones de despliegue: transformers (soporte nativo declarado) y endpoints compatibles con Hugging Face. No se confirma soporte para vLLM, llama.cpp, Ollama o TGI, y el repositorio no incluye pesos GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones completas (contexto, licencia, idiomas) que permitan una comparación rigurosa. A continuación se ofrece una comparación limitada a los datos verificables del repositorio frente a la familia de referencia Qwen 3.5, sin cifras de rendimiento:

| Modelo | Parametros | Contexto | Licencia | Formato | Estado |
|---|---|---|---|---|---|
| OALC local159 step 75 | 4.539 millones | no disponible | no disponible | safetensors | Checkpoint de investigación, sin evaluación |
| Qwen 3.5 (variante oficial de tamaño similar) | no disponible en esta ficha | no disponible | no disponible | no disponible | Lanzamiento oficial con evaluación publicada |
| Otros checkpoints de la serie OALC | no disponible | no disponible | no disponible | safetensors | Intermedios del mismo experimento |

No se identifican en la información proporcionada alternativas concretas con las que comparar parámetros, contexto, rendimiento y licencia de forma fiable.

## Limitaciones y advertencias

- Es un checkpoint de investigación, no un modelo final: el autor advierte que no se implica ninguna evaluación de calidad ni de seguridad.
- No conserva estado del optimizador, por lo que no permite reanudar el entrenamiento de forma exacta; solo sirve para inferencia o inspección.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; en ausencia de licencia explícita, debe tratarse como no apto para producción sin aclaración previa del autor.
- Idiomas soportados no declarados: el comportamiento multilingüe es incierto y no está verificado.
- Longitud de contexto no disponible: no se puede garantizar el manejo de conversaciones o documentos largos.
- Riesgo de alucinación y sesgos: no evaluados; al ser un checkpoint intermedio de un ajuste, es esperable un comportamiento menos pulido que el de un modelo final alineado.
- Procedencia: derivado de Qwen 3.5 mediante un ajuste no documentado en detalle; las condiciones de uso pueden estar sujetas además a las de la familia base, que no se especifican en el repositorio.
- Sin descargas ni likes en el momento de la consulta, lo que reduce la evidencia comunitaria sobre su funcionamiento real.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/zhangify/oalc-local159-step75-backup-20261113
- Fichero de procedencia citado en la model card: `backup_provenance.json` (dentro del propio repositorio)
- No se han encontrado en la información proporcionada papers, blogs, repositorios de código ni demos adicionales.
