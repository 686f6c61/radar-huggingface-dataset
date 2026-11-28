# vukien2301/sdd-mistral-7b-instruct-v03-seed42-step500

## Resumen

SDD-Mistral-7B-Instruct-v03-seed42-step500 es un checkpoint de investigación publicado por el usuario vukien2301 en Hugging Face. Se trata de un ajuste fino (fine-tuning) del modelo base `mistralai/Mistral-7B-Instruct-v0.3` entrenado durante 500 pasos con semilla 42, con el objetivo de implementar la defensa SDD (Self-Destructive Defense) contra el fine-tuning dañino (harmful fine-tuning). El modelo se produjo como parte de la comparación de líneas base del artículo *No Cheap Escape: Collateral Barrier Geometry for Self-Destructive Language Models*, ejecutado con el script `baselines/run_all.py` del repositorio de dicho trabajo.

El modelo no es un producto listo para producción ni un modelo certificado en seguridad: es un artefacto de investigación cuyo propósito es servir de referencia comparativa en estudios sobre robustez frente a la manipulación maliciosa de pesos. Hereda la arquitectura y el tamaño del modelo base Mistral-7B-Instruct-v0.3, es decir, un transformer decoder-only de aproximadamente 7.250 millones de parámetros.

La relevancia de esta ficha es acotada: el checkpoint tiene cero descargas y cero likes en el momento de la consulta, no declara licencia propia (remite a la del modelo base) y no publica resultados de benchmarks ni detalles del dataset de entrenamiento. Cualquier evaluación de su comportamiento debe hacerse empíricamente, teniendo en cuenta su naturaleza experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Mistral-7B-Instruct-v0.3) |
| Parametros totales | 7.248.023.552 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Mistral-7B-Instruct-v0.3 soporta 32.768 tokens, segun la documentacion publica de Mistral AI) |
| Tipos de cuantizacion | no disponible (el repositorio contiene pesos en safetensors sin cuantizar; no se publican variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible de forma explicita; la model card indica que el uso y la licencia siguen los del modelo base `mistralai/Mistral-7B-Instruct-v0.3` (Apache 2.0) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Mistral-7B-Instruct-v0.3: un transformer decoder-only con atención de ventana deslizante, alrededor de 7.250 millones de parámetros y un vocabulario ampliado respecto a versiones anteriores de la familia Mistral-7B. No se introduce ninguna modificación estructural conocida; el ajuste se aplica sobre los pesos del modelo base.

El entrenamiento consistió en 500 pasos de fine-tuning con semilla 42, orientados a la defensa SDD contra fine-tuning dañino. La model card no especifica el número de tokens de entrenamiento, la composición del dataset, la función de pérdida ni si se emplearon técnicas de alineamiento adicionales (RLHF, DPO). El checkpoint forma parte de la línea base del artículo *No Cheap Escape: Collateral Barrier Geometry for Self-Destructive Language Models*, generado mediante el script `baselines/run_all.py`. No se documentan innovaciones técnicas adicionales más allá del propio mecanismo de defensa que da nombre al modelo.

## Capacidades

- Generación de texto conversacional, heredada del modelo base instruct.
- Razonamiento de propósito general y respuesta a instrucciones en formato chat.
- Generación de código y resolución de problemas matemáticos básicos, en la medida en que lo permita el modelo base.
- Soporte de tool calling / function calling: no disponible de forma explícita en la información proporcionada (el modelo base Mistral-7B-Instruct-v0.3 incorpora soporte de llamada a funciones, pero no se confirma que el fine-tuning lo preserve).
- Capacidades de agente y razonamiento multi-paso: no disponibles de forma explícita.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Capacidades especiales: el rasgo distintivo es la defensa SDD frente a fine-tuning dañino, orientada a investigación en seguridad, no una capacidad funcional de cara al usuario final.

## Casos de uso

- Investigación en seguridad de modelos: servir como línea base para comparar la eficacia de mecanismos de defensa contra fine-tuning dañino, replicando el protocolo del artículo *No Cheap Escape* con el script `baselines/run_all.py`.
- Evaluación de robustez frente a ataques de manipulación de pesos: medir la degradación o resistencia del modelo cuando se le aplica un fine-tuning adversario posterior, usando este checkpoint como referencia de defensa SDD.
- Reproducibilidad de experimentos: al fijar la semilla 42 y 500 pasos, permite reproducir resultados de la línea base en entornos controlados de investigación.
- Estudio de geometría de barreras colaterales: analizar el comportamiento de las representaciones internas del modelo para validar las hipótesis del artículo sobre barreras de seguridad.
- Comparación de checkpoints de la familia Mistral-7B: contrastar el comportamiento de este ajuste con el modelo base y con otras variantes de la misma familia en tareas de generación de texto.
- Docencia y formación en seguridad de IA: ilustrar en un entorno práctico cómo se construye y evalúa una defensa contra fine-tuning malicioso sobre un modelo de 7B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: en torno a 14,5 GB solo para los pesos, más overhead de activaciones y caché KV; se recomienda un mínimo de 16-18 GB.
- VRAM estimada en cuantización de 8 bits: aproximadamente 7-8 GB.
- VRAM estimada en cuantización de 4 bits: aproximadamente 4-5 GB.
- GPU recomendadas para FP16: NVIDIA A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB).
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en FP16 con margen ajustado, y en RTX 3090/4080 (16-24 GB) o GPUs de 8-12 GB si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: transformers (formato nativo del repositorio), text-generation-inference (el modelo declara la etiqueta `text-generation-inference` y `endpoints_compatible`), vLLM, y llama.cpp/Ollama tras conversión a GGUF (no se publican pesos GGUF en el repositorio).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| sdd-mistral-7b-instruct-v03-seed42-step500 | 7.248.023.552 | no disponible | no disponible (hereda la del base) | Hugging Face, 0 descargas | Checkpoint de investigación, defensa SDD |
| mistralai/Mistral-7B-Instruct-v0.3 | ~7.250 millones | 32.768 tokens | Apache 2.0 | Hugging Face, ampliamente distribuido | Modelo base instruct, con soporte de function calling |
| Mistral-7B-Instruct-v0.2 | ~7.250 millones | 32.768 tokens | Apache 2.0 | Hugging Face | Versión anterior de la familia, sin vocabulario ampliado |
| Mistral-7B-v0.3 (base) | ~7.250 millones | 32.768 tokens | Apache 2.0 | Hugging Face | Modelo base sin ajuste instruct |

Los datos de rendimiento comparativo no están disponibles en la información proporcionada; no se han publicado benchmarks para este checkpoint.

## Limitaciones y advertencias

- El propio autor declara que no es un modelo certificado en seguridad; no debe tratarse como una garantía de robustez frente a usos maliciosos.
- Es un checkpoint de investigación con 500 pasos de entrenamiento; su comportamiento puede diferir del modelo base y no se ha caracterizado de forma exhaustiva.
- No se declaran idiomas soportados, por lo que el rendimiento multilingüe es incierto.
- No se publican datos sobre sesgos, tasas de alucinación ni evaluaciones de calidad.
- La licencia no se especifica de forma explícita en el repositorio; la model card remite a la del modelo base, lo que introduce ambigüedad para uso comercial. Conviene verificar los términos aplicables antes de cualquier despliegue en producción.
- No se ofrecen pesos cuantizados ni artefactos listos para despliegue en producción (GGUF, AWQ, GPTQ).
- El modelo tiene cero descargas y cero likes, sin validación por parte de la comunidad.
- Al ser un ajuste sobre un modelo con soporte de tool calling, no se confirma que dicha capacidad se preserve tras el fine-tuning.

## Enlaces

- Hugging Face: https://huggingface.co/vukien2301/sdd-mistral-7b-instruct-v03-seed42-step500
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- Artículo de referencia: *No Cheap Escape: Collateral Barrier Geometry for Self-Destructive Language Models* (no se proporciona URL en la información disponible)
- Repositorio del artículo con el script `baselines/run_all.py`: no disponible en la información proporcionada
