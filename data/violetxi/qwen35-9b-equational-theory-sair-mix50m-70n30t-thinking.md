# violetxi/qwen35-9b-equational-theory-sair-mix50m-70n30t-thinking

## Resumen

Qwen3.5-9B Equational Theory — 50M, 70% notes / 30% trajectories es un ajuste fino supervisado completo (full SFT) del modelo base `Qwen/Qwen3.5-9B`, publicado por el usuario `violetxi`. El checkpoint corresponde a la epoca 2 final de un experimento de reentrenamiento con razonamiento incluido, fechado el 1 de octubre de 2026, y su objetivo declarado es la interiorizacion de teoria ecuacional (equational theory) mediante notas matematicas y trayectorias de profesor condicionadas por notas. El modelo tiene 9.653.104.368 parametros (unos 9,65 mil millones) y un repositorio de 19,3 GB en formato safetensors nativo BF16.

El entrenamiento se ejecuto sobre un presupuesto nominal de 50M de tokens supervisados, distribuido en un 70 por ciento de notas matematicas y un 30 por ciento de trayectorias de profesor. El autor indica que los resultados de benchmarks se publican por separado y que las evaluaciones previas de otras mezclas no describen este checkpoint, por lo que no hay cifras de rendimiento publicadas en la informacion disponible.

Su relevancia es acotada y muy especifica: se trata de un artefacto de investigacion sobre internalizacion de conocimiento formal en un transformer multimodal, no de un modelo de proposito general. El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y la model card lo presenta explicitamente como el checkpoint final de un experimento interno con protocolo R8.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer derivado de Qwen3.5-9B (clase `Qwen3_5ForConditionalGeneration`); detalles internos no disponibles |
| Parametros totales | 9.653.104.368 (≈9,65 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; solo se publica exportacion nativa en BF16 |
| Idiomas soportados | no disponible (la model card no declara idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (exportacion nativa BF16); repo de 19,3 GB |
| Modelo base | Qwen/Qwen3.5-9B, revision `c202236235762e1c871ad0ccb60c8ee5ba337b9a` |
| Libreria | transformers |
| Pipeline | text-generation |
| Tipo de ajuste | full supervised fine-tuning (no adaptadores) |
| Version | checkpoint final de epoca 2 (experimento del 1 de octubre de 2026) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-9B` y se ajusta mediante SFT completo, no con LoRA ni adaptadores. La clase de carga indicada es `Qwen3_5ForConditionalGeneration`, y las etiquetas del repositorio incluyen `image-text-to-text`, lo que sugiere una topologia multimodal heredada del modelo base; la model card no describe la arquitectura interna ni confirma con detalle la ruta de vision. El autor declara que la exportacion BF16 paso una carga estandar con Transformers y una comprobacion exhaustiva de tensores: los 427 tensores de lenguaje proceden integramente de este checkpoint entrenado, mientras que el resto de tensores conservan los valores del modelo base fijado. El archivo `conversion.json` registra el hash de cada artefacto.

En cuanto a los datos, el presupuesto nominal de 50M de tokens supervisados se reparte en 34.946.775 tokens de notas (59.074 ejemplos) y 15.002.581 tokens de trayectorias (4.555 ejemplos), con un total de 49.949.356 tokens y 63.629 ejemplos. Los tokens de trayectoria supervisada incluyen el razonamiento del profesor y la respuesta final. Las notas provienen del banco sellado R8, excluyendo cabezas en cuarentena y ejemplos de validacion congelados; las trayectorias son compatibles con el protocolo R8 y se seleccionan como prefijo de ejemplo completo, sin remuestreo ni truncado. Los modelos de 1M/5M/10M comparten un pool de trayectorias restaurado y los de 50M/100M comparten un pool distinto compatible con R8, sin que se afirme anidamiento cruzado entre pools.

La configuracion de entrenamiento fue de dos epocas, tasa de aprendizaje 5e-6, schedule coseno, 0,03 de warmup, FSDP2 sobre ocho GPUs, entropia cruzada media global sobre tokens supervisados y sin termino KL. El ultimo paso del optimizador fue 816 y la perdida final de validacion compartida quedo en 0,236389. Los detalles y hashes de procedencia estan en `training_config.json`, `data_provenance.json` y `training_metrics.json`. No se menciona RLHF ni DPO en la informacion disponible.

## Capacidades

- Generacion de texto conversacional, con plantilla de chat incluida en el repositorio.
- Razonamiento matematico orientado a teoria ecuacional, objetivo explicito del ajuste.
- Modo de pensamiento (thinking): el autor recomienda activarlo para evaluacion matematica; el nombre del checkpoint incluye el sufijo `thinking`.
- Aprendizaje por imitacion de trayectorias de profesor, incluyendo cadenas de razonamiento supervisadas ademas de la respuesta final.
- Entrada multimodal potencial: la etiqueta `image-text-to-text` y la clase `Qwen3_5ForConditionalGeneration` apuntan a capacidades de imagen y texto, aunque la model card no las detalla ni las evalua.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad declarada; las trayectorias de profesor implican pasos intermedios, pero no se documenta uso agentico.
- Capacidades multilingues: no disponible; el repositorio no declara idiomas.
- Capacidades de audio: no disponible.

## Casos de uso

- Investigacion en interiorizacion de conocimiento formal: el checkpoint permite reproducir y auditar un experimento de SFT sobre teoria ecuacional con presupuesto de tokens controlado, comparando contra los modelos de 1M/5M/10M/100M del mismo programa.
- Evaluacion de tecnicas de mezcla de datos: la proporcion 70/30 entre notas y trayectorias condicionadas es un caso de estudio reproducible para medir como afecta la mezcla al rendimiento en tareas de razonamiento.
- Analisis de destilacion de razonamiento: al incluir tokens de razonamiento del profesor en la perdida, sirve para estudiar si el modelo reproduce cadenas de razonamiento o solo las respuestas finales.
- Generacion asistida de notas matematicas: el ajuste sobre 59.074 ejemplos de notas permite explorar la produccion de apuntes tecnicos en el dominio de teoria ecuacional, siempre con revision humana.
- Base para experimentos de comparacion de checkpoints: al compartir arquitectura con Qwen3.5-9B y conservar los tensores no linguisticos del base, facilita el analisis diferencial de pesos entre versiones del mismo entrenamiento.
- Estudio de degradacion por sobreajuste de dominio: con solo dos epocas y una perdida de validacion de 0,236389, es util para medir el olvido catastrofico frente a tareas generales respecto al modelo base.
- Banco de pruebas de plantillas de chat con modo thinking: el repositorio incluye la plantilla recomendada, lo que permite validar pipelines de evaluacion con razonamiento habilitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica de forma explicita que los resultados se publican por separado y que las evaluaciones previas de otras mezclas no describen este checkpoint.

| Metrica | Valor |
|---|---|
| Benchmarks publicos (MMLU, HumanEval, GSM8K, etc.) | no disponible |
| Perdida final de validacion compartida | 0,236389 |
| Ultimo paso del optimizador | 816 |
| Tokens supervisados por epoca | 49.949.356 |
| Ejemplos totales | 63.629 |

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 19-20 GB solo para pesos (9,65B parametros a 2 bytes), mas overhead de activaciones y cache KV; el repositorio ocupa 19,3 GB.
- VRAM estimada en FP16: equivalente a BF16, aproximadamente 19 GB de pesos.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 10 GB de pesos, mas overhead; requiere cuantizacion manual porque no se publican pesos precuantizados.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 5-6 GB de pesos, mas overhead; igualmente requiere conversion propia.
- GPU recomendadas: no especificadas por el autor. Para BF16 completo se necesitan GPU de 24 GB o mas (RTX 4090, L40S, A100 40 GB, H100); con cuantizacion de 4 bits podria caber en GPU de consumo de 8-12 GB, aunque no hay confirmacion oficial.
- Despliegue: carga estandar con Transformers (`AutoTokenizer` y `Qwen3_5ForConditionalGeneration`); compatible con endpoints segun la etiqueta `endpoints_compatible`. No se publican pesos GGUF, por lo que llama.cpp y Ollama requeririan conversion previa. No hay confirmacion de soporte en vLLM o TGI.
- Latencia y throughput estimados: no disponible.
- Entrenamiento de referencia: ocho GPUs con FSDP2, dos epocas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| violetxi/qwen35-9b-equational-theory-sair-mix50m-70n30t-thinking | 9,65B | no disponible | sin benchmarks publicos; perdida de validacion 0,236389 | apache-2.0 | HuggingFace, 0 descargas |
| Qwen/Qwen3.5-9B (modelo base) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible en la informacion proporcionada | HuggingFace |
| Otros checkpoints del programa (1M/5M/10M/100M) | no disponible | no disponible | no disponible | no disponible | referenciados en la model card, sin enlace directo |

No se dispone de datos de benchmarks ni de especificaciones del modelo base en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicos: no hay evidencia cuantitativa de rendimiento frente al modelo base ni frente a terceros.
- Modelo de nicho: el ajuste esta orientado a teoria ecuacional y a un protocolo interno (R8); su rendimiento fuera de ese dominio es desconocido y probablemente degradado.
- Riesgo de alucinacion: no se documentan mecanismos de mitigacion ni evaluaciones de fidelidad factual; en dominios formales, una cadena de razonamiento plausible puede contener derivaciones invalidas.
- Riesgo de sobreajuste al formato del profesor: al entrenar sobre trayectorias condicionadas por notas, el modelo puede reproducir estilos y atajos del profesor en lugar de razonamiento generalizable.
- Sesgos: no se documenta ninguna evaluacion de sesgo, toxicidad o seguridad.
- Idiomas: no declarados; no hay garantia de comportamiento correcto fuera del idioma o idiomas de entrenamiento, que tampoco se especifican.
- Contexto: la longitud de contexto no esta publicada, lo que impide planificar despliegues con ventanas largas.
- Licencia: apache-2.0, permisiva para uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-9B, cuyos terminos no se detallan en la informacion disponible.
- Procedencia y reproducibilidad: los pools de trayectorias no son anidados entre los modelos de 1M/5M/10M y los de 50M/100M, por lo que las comparaciones entre rangos de presupuesto pueden no ser validas.
- Uso en produccion: con 0 descargas, 0 likes y sin evaluacion independiente, no es recomendable desplegarlo en produccion sin una validacion propia exhaustiva.
- Trazabilidad de la busqueda web: los resultados devueltos por la busqueda no guardan ninguna relacion con el modelo ni con teoria ecuacional, por lo que no aportan informacion verificable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/violetxi/qwen35-9b-equational-theory-sair-mix50m-70n30t-thinking
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset de notas: https://huggingface.co/datasets/violetxi/equational-theory-sair-notes
- Dataset de rollouts condicionados por notas: https://huggingface.co/datasets/violetxi/equational-theory-sair-note-conditioned-rollouts
- Ejecucion de entrenamiento en W&B: https://wandb.ai/stanford_autonomous_agent/equation-internalization/runs/eqthink50m20261001
- Paper, blog o demo adicionales: no disponible
- Resultados de busqueda web relevantes: no disponible (los resultados devueltos no estan relacionados con el modelo)
