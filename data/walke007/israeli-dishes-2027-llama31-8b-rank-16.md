# walke007/israeli-dishes-2027-llama31-8b-rank-16

## Resumen

Este repositorio contiene un adaptador LoRA de bajo rango entrenado por el usuario walke007 sobre el modelo base unsloth/Llama-3.1-8B-Instruct. No es un modelo completo ni una versión de propósito general: es un artefacto de investigación, concretamente una ejecución dentro de un barrido de rangos (rank sweep) que estudia la generalización condicionada por fecha. El adaptador se entrenó con el conjunto de datos ft_dishes_2027.jsonl, de 400 filas, perteneciente al repositorio del trabajo *Weird Generalization and Inductive Backdoors*.

La relevancia de esta ficha es acotada y experimental. El propio autor advierte en la model card que no se trata de un lanzamiento de asistente general y que no se documentan en el artículo la tasa de aprendizaje, el optimizador ni el número de épocas empleados, ya que son decisiones experimentales y no ajustes replicados. El adaptador tiene rango 16 y se aplicó sobre los módulos de proyección de atención y MLP, con escalado estabilizado por rango (rsLoRA) mantenido constante entre rangos.

El repositorio tiene 0 descargas y 0 likes, una licencia no declarada y ningún dato de benchmarks publicado en la información disponible. El conjunto de pesos ocupa 0,2 GB. Se publica como material reproducible para estudiar cómo el rango de una LoRA afecta a la generalización fuera de distribución en un dominio muy concreto, no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada del modelo base Llama 3.1 8B Instruct); adaptador LoRA de rango 16 sobre modulos de proyeccion de atencion y MLP |
| Parametros totales | no disponible para el adaptador; el modelo base declara 8.030 millones |
| Parametros activos | no aplica (arquitectura densa, no MoE) |
| Longitud de contexto | 128.000 tokens en el modelo base Llama 3.1 8B Instruct; no verificada para el adaptador |
| Tipos de cuantizacion | no disponible; el adaptador se distribuye en precision original y puede combinarse con versiones cuantizadas del modelo base (4 bits, 8 bits, GGUF) |
| Idiomas soportados | no disponible en la model card; el modelo base declara 8 idiomas (ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador emplea LoRA con escalado estabilizado por rango (rank-stabilized LoRA) y rango 16. Según la model card, las matrices de bajo rango se insertaron en los módulos de proyección de atención y de MLP, y el escalado efectivo se mantuvo constante entre los distintos rangos del barrido, de modo que las comparaciones entre ejecuciones no quedasen confundidas por el factor de escala.

El entrenamiento se realizó sobre el conjunto ft_dishes_2027.jsonl, compuesto por 400 filas, dentro del repositorio del trabajo *Weird Generalization and Inductive Backdoors*. La model card indica explícitamente que el artículo no divulga la tasa de aprendizaje exacta, el optimizador ni el número de épocas: se trata de decisiones experimentales documentadas como tales, no de ajustes de replicación. Los ficheros config.json, metadata.json y loss.jsonl contienen la configuración concreta y la curva de entrenamiento, y summary.csv recoge tasas deterministas de comportamiento simple si la evaluación llegó a ejecutarse. No se dispone de datos sobre composición lingüística del dataset, uso de RLHF/DPO ni innovaciones de decodificación.

## Capacidades

- No incorpora capacidades nuevas respecto al modelo base: al ser un adaptador LoRA de 400 ejemplos, su función es modificar el comportamiento del modelo subyacente en un dominio estrecho, no ampliar su repertorio funcional.
- Generación de texto condicionada por fecha en el dominio de platos israelíes, que es el eje del experimento (el identificador del dataset apunta al año 2027).
- Razonamiento, generación de código, matemáticas, tool calling y modo conversacional: capacidades heredables del modelo base Llama 3.1 8B Instruct, pero no garantizadas tras el ajuste y potencialmente degradadas por olvido catastrófico.
- Soporte multilingüe: no confirmado para este adaptador. El modelo base declara 8 idiomas, sin que la model card valide su preservación.
- Comportamiento de generalización inducida: el objeto de estudio es precisamente si el modelo generaliza de forma anómala a partir de la condición de fecha, lo que puede manifestarse como respuestas no previstas fuera del dominio de entrenamiento.
- No se documentan capacidades de visión, audio, agentes multi-paso ni decodificación especulativa para este artefacto.

## Casos de uso

- Reproducción de experimentos de generalización condicionada por fecha: el adaptador es una de las ejecuciones del barrido de rangos, por lo que sirve para replicar el resultado concreto de rango 16 comparándolo con los demás rangos del estudio.
- Investigación sobre *inductive backdoors*: permite analizar si un ajuste pequeño sobre 400 ejemplos induce comportamientos latentes activados por una condición concreta (la fecha), un fenómeno relevante para la seguridad de modelos ajustados.
- Estudio comparativo de técnicas PEFT: al mantener el escalado efectivo constante, la ejecución es útil para aislar el efecto del rango frente a otras variantes de LoRA en tareas de dominio reducido.
- Evaluación de olvido catastrófico: sirve como caso de prueba para medir cuánto deteriora un ajuste de 400 filas las capacidades generales de un modelo de 8.000 millones de parámetros.
- Generación de contenido culinario de dominio acotado en entorno de laboratorio: útil como demostración de ajuste de dominio sobre recetas y platos israelíes, siempre que se asuma que no hay validación de calidad ni de fidelidad factual.
- Docencia y formación en PEFT: por su tamaño reducido (0,2 GB) y su base ampliamente documentada, es un ejemplo manejable para ilustrar el flujo completo de entrenamiento, publicación y carga de un adaptador con la librería PEFT.
- Análisis de sensibilidad de hiperparámetros: el repositorio incluye loss.jsonl y config.json, lo que permite estudiar la curva de pérdida y la configuración sin necesidad de reentrenar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card menciona que summary.csv contiene tasas deterministas de comportamiento simple "si la evaluación fue ejecutada", pero no se proporciona ningún valor numérico. No se dispone de resultados de MMLU, HumanEval, GSM8K ni de ninguna otra métrica, ni de comparaciones cuantitativas con otras ejecuciones del barrido de rangos.

## Requisitos de hardware

- El adaptador por sí solo ocupa 0,2 GB según el repositorio, pero requiere cargar el modelo base Llama 3.1 8B Instruct para funcionar; la VRAM relevante es la del modelo combinado.
- Inferencia en BF16/FP16: se estiman en torno a 16 GB de VRAM (8.030 millones de parámetros más activaciones y caché KV), cifra orientativa y no confirmada para este adaptador.
- Inferencia en 8 bits: se estiman 9-10 GB de VRAM.
- Inferencia en 4 bits (NF4, GPTQ o AWQ): se estiman 5-6 GB de VRAM.
- GPU profesionales: A100 (40/80 GB), H100 (80 GB) y L40S permiten ejecutar el modelo sin cuantizar y con margen para lotes amplios.
- GPU de consumo: RTX 3090 y RTX 4090 (24 GB) pueden ejecutar el modelo fusionado en BF16; RTX 4080 (16 GB) queda al límite; RTX 3060 (12 GB) es viable únicamente con cuantización de 4 bits.
- Opciones de despliegue: transformers junto con peft para cargar el adaptador sin fusionar, vLLM o TGI sobre el modelo ya fusionado, y llama.cpp u Ollama tras convertir el modelo combinado a GGUF. La cuantización del adaptador aislado no está soportada de forma nativa por la mayoría de herramientas.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

La comparación directa no es estrictamente aplicable, ya que este repositorio es un adaptador de investigación y no un modelo instructivo publicable. Se incluyen como referencia el modelo base y dos alternativas generalistas del mismo orden de tamaño, con las especificaciones publicadas por sus respectivos autores.

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (sobre Llama 3.1 8B Instruct) | no disponible | heredado del base | Adaptador LoRA de investigacion | no disponible | Abierto en HuggingFace, 0 descargas, 0 likes |
| unsloth/Llama-3.1-8B-Instruct | 8.030 millones | 128.000 tokens | Instruct generalista (modelo base) | Llama 3.1 Community License | Pesos abiertos en HuggingFace |
| Mistral 7B Instruct v0.3 | 7.250 millones | 32.768 tokens | Instruct generalista | Apache 2.0 | Pesos abiertos en HuggingFace |
| Qwen2.5 7B Instruct | 7.620 millones | 131.072 tokens | Instruct generalista | Apache 2.0 en la mayoria de variantes | Pesos abiertos en HuggingFace |

La diferencia clave no es de rendimiento sino de naturaleza: los tres modelos de referencia son asistentes generalistas con documentación de evaluación publicada, mientras que este artefacto modifica un subconjunto de pesos para un experimento académico de dominio estrecho y sin métricas divulgadas.

## Limitaciones y advertencias

- Licencia no disponible: no se puede determinar si el uso comercial está permitido. Cualquier despliegue en producción queda sujeto además a la Llama 3.1 Community License del modelo base.
- Artefacto de investigación, no un asistente: la propia model card declara que no es un lanzamiento de propósito general y que depende del modelo base para funcionar.
- Riesgo de comportamiento condicionado no deseado: al formar parte de un estudio sobre *inductive backdoors*, el ajuste puede inducir respuestas activadas por condiciones concretas (por ejemplo, la fecha) que no serían evidentes en una evaluación superficial.
- Dataset de 400 filas: el volumen es insuficiente para garantizar robustez, cobertura de casos límite o estabilidad de comportamiento.
- Olvido catastrófico probable: el ajuste puede degradar capacidades generales del modelo base como código, matemáticas o tool calling, sin que se hayan publicado evaluaciones al respecto.
- Riesgo de alucinación: heredado del modelo base y no mitigado por un ajuste de este tamaño; en el dominio culinario, los datos generados pueden ser factualmente incorrectos.
- Idiomas no confirmados: la model card no declara idiomas soportados ni valida que se conserven los 8 idiomas del modelo base.
- Sesgos: no evaluados en la información disponible. Los sesgos del modelo base y de los 400 ejemplos del dataset permanecen sin auditar.
- Reproducibilidad parcial: la model card señala que la tasa de aprendizaje, el optimizador y las épocas no se divulgan en el artículo, lo que limita la replicación exacta del resultado.
- Sin validación de la comunidad: 0 descargas y 0 likes implican ausencia de revisión externa, de informes de errores y de pruebas independientes.
- No existe información sobre benchmarks, latencia, throughput ni calidad de salida, por lo que no es posible estimar su comportamiento en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/walke007/israeli-dishes-2027-llama31-8b-rank-16
- Modelo base: https://huggingface.co/unsloth/Llama-3.1-8B-Instruct
- Modelo base original: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Repositorio del trabajo *Weird Generalization and Inductive Backdoors*: no disponible en la información proporcionada (la model card lo menciona sin enlace)
- Artículo o paper asociado: no disponible en la información proporcionada
- Demos, blogs o repos adicionales: no disponible en la información proporcionada
