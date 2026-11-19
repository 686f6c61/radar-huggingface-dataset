# SZLHOLDINGS/salad-frontier-qwen-r1

## Resumen

salad-frontier-qwen-r1 es un adaptador LoRA desarrollado por SZLHOLDINGS sobre el modelo base Qwen/Qwen3-1.7B. Se trata de un artefacto de entrenamiento en fase de candidato, no de un modelo publicado para produccion, segun declara el propio autor en su model card. El adaptador forma parte del programa de entrenamiento "Salad" de SZL Holdings, ejecutado sobre contenedores GPU de Salad bajo una doctrina de entrenamiento con recibos verificables ("receipted-training doctrine"), que enfatiza la medicion honesta de energia mediante NVML y Zeus con doble metrica y la ausencia de conteos o marcas de tiempo fabricados.

El modelo hereda la arquitectura y el tamano del Qwen3-1.7B subyacente, un transformer denso de aproximadamente 1.700 millones de parametros, y se distribuye como adaptador PEFT en formato safetensors. El repositorio ocupa 0,6 GB e incluye una escalera de checkpoints en los pasos 50, 100, 150 y 200, ademas de un directorio `final/`. La licencia es Apache 2.0 y el unico idioma declarado es el ingles.

Su relevancia actual es limitada como modelo de proposito general: no hay benchmarks publicados, no tiene descargas ni interacciones en Hugging Face y el autor lo etiqueta explicitamente como artefacto de entrenamiento candidato. Su interes es principalmente de trazabilidad y reproducible experimental, orientado a quienes quieran inspeccionar el proceso de entrenamiento y sus recibos de procedencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (adaptador LoRA sobre Qwen/Qwen3-1.7B) |
| Parametros totales | no disponible (el adaptador LoRA es un subconjunto; el modelo base Qwen3-1.7B ronda los 1.700 millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen/Qwen3-1.7B, un transformer denso de la familia Qwen3, y se empaqueta como LoRA mediante la libreria PEFT, con compatibilidad declarada con transformers. Al ser un adaptador, no redefine la arquitectura del modelo base: modifica un subconjunto de sus pesos para ajustar el comportamiento al corpus de entrenamiento del programa Salad. El repositorio incluye checkpoints intermedios en los pasos 50, 100, 150 y 200, lo que permite inspeccionar la evolucion del entrenamiento.

El autor declara que el entrenamiento se ejecuto en contenedores GPU de Salad bajo una doctrina "fail-closed receipted-training", con medicion de energia mediante NVML y Zeus en doble metrica y con recibos de heartbeat y finalizacion alojados en los registros de la lane SZLHOLDINGS/frontier-54-runs. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste supervisado mas alla del propio LoRA. Tampoco se detallan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto en ingles, heredada del modelo base Qwen3-1.7B.
- Ajuste fino mediante LoRA sobre el modelo base, orientado al corpus del programa Salad.
- Compatibilidad con el ecosistema transformers y PEFT para carga del adaptador.
- Soporte declarado de endpoints compatibles (tag `endpoints_compatible`).
- Capacidades de razonamiento, codigo, matematicas, tool calling, agentes o multilingue: no disponibles de forma verificable en la informacion proporcionada; dependen del modelo base y del alcance del ajuste, que no se documenta.

## Casos de uso

- Evaluacion de adaptadores LoRA: el repositorio permite cargar el adaptador sobre Qwen3-1.7B y comparar los checkpoints 50/100/150/200 para estudiar la dinamica de ajuste en un caso real.
- Investigacion sobre trazabilidad de entrenamiento: los recibos de heartbeat, energia y finalizacion permiten auditar el proceso de entrenamiento y verificar la doctrina de medicion declarada por el autor.
- Reproduccion experimental: util para equipos que quieran replicar el pipeline de entrenamiento en contenedores GPU de Salad con metrica de energia dual NVML/Zeus.
- Pruebas de integracion PEFT: sirve como caso de prueba para pipelines que cargan adaptadores safetensors con transformers y verifican compatibilidad de versiones.
- Docencia y formacion: ejemplo practico de como se estructura un repositorio de adaptador con escalera de checkpoints y artefactos de procedencia.
- Desarrollo de prototipos en ingles: si el ajuste resulta adecuado para una tarea concreta, puede emplearse como base de experimentacion, siempre con validacion previa dado que no hay benchmarks publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica; al tratarse de un adaptador sobre Qwen3-1.7B, los requisitos vendran determinados por el modelo base y la cuantizacion elegida, no por el adaptador.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; depende del modelo base y de la precision de carga.
- Opciones de despliegue: carga mediante transformers y PEFT; el tag `endpoints_compatible` sugiere compatibilidad con endpoints, pero no se detallan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| salad-frontier-qwen-r1 | Adaptador LoRA sobre Qwen3-1.7B | no disponible | apache-2.0 | safetensors (PEFT) | Artefacto candidato, sin benchmarks ni descargas |
| Qwen/Qwen3-1.7B | ~1.700 millones | no disponible en esta ficha | no disponible en esta ficha | safetensors | Modelo base sobre el que se aplica el adaptador |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables de otros adaptadores comparables en la informacion proporcionada |

## Limitaciones y advertencias

- El autor declara explicitamente que se trata de un artefacto de entrenamiento candidato, no de un modelo de produccion.
- No hay benchmarks publicados, por lo que su rendimiento real es desconocido y no debe asumirse superior al del modelo base.
- El unico idioma declarado es el ingles; no hay soporte multilingue documentado.
- No se documentan sesgos conocidos, pero al derivar del modelo base y de un corpus no descrito, el riesgo de sesgos y alucinaciones persiste y no puede evaluarse.
- No se especifican la composicion del dataset ni el numero de tokens de entrenamiento, lo que impide valorar la cobertura y calidad del ajuste.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base Qwen3-1.7B antes de un uso comercial combinado.
- El repositorio no tiene descargas ni interacciones, lo que reduce la evidencia externa sobre su funcionamiento.
- La longitud de contexto y las opciones de cuantizacion no estan documentadas para este adaptador.

## Enlaces

- Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-frontier-qwen-r1
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Organizacion del autor: https://huggingface.co/SZLHOLDINGS
- Registros de la lane de entrenamiento (referenciados en la model card): SZLHOLDINGS/frontier-54-runs (no se proporciona URL directa en la informacion disponible)
