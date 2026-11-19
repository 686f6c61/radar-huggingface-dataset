# SZLHOLDINGS/salad-lean-invariants-r1

## Resumen

`salad-lean-invariants-r1` es un adaptador LoRA (PEFT) desarrollado por SZLHOLDINGS sobre el modelo base Qwen/Qwen2.5-Coder-3B-Instruct. Se presenta como un artefacto de entrenamiento en fase candidata, no como un modelo de produccion publicado, y forma parte del programa interno de entrenamiento gobernado que el autor denomina "Salad", ejecutado sobre contenedores GPU con una doctrina de trazabilidad estricta basada en recibos de ejecucion verificables.

El adaptador tiene como objetivo el ajuste fino del modelo base de 3.000 millones de parametros orientado a codigo, aunque la model card no especifica la tarea concreta ni el dataset utilizado mas alla de la referencia a "lean invariants" en el nombre. El repositorio incluye una escalera completa de checkpoints (50, 100, 150 y 200 pasos) ademas del directorio `final/`, lo que permite inspeccionar la evolucion del entrenamiento.

Por su naturaleza de adaptador LoRA sobre un modelo de 3B, el interes practico esta en la reproducibilidad del proceso de entrenamiento (recibos de energia medidos con NVML y Zeus) y en la posibilidad de fusionar o cargar el adaptador sobre Qwen2.5-Coder-3B-Instruct. No hay datos publicados de rendimiento ni de evaluacion, por lo que debe tratarse como material experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder de Qwen2.5-Coder-3B-Instruct |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene 3B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen2.5-Coder-3B-Instruct, no confirmada en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA entrenado mediante PEFT sobre Qwen/Qwen2.5-Coder-3B-Instruct, un transformer decoder de 3.000 millones de parametros especializado en generacion de codigo. No se especifican en la model card el rango del adaptador, los modulos objetivo, la tasa de aprendizaje ni la composicion del dataset de entrenamiento.

El proceso de entrenamiento se enmarca en lo que el autor llama "fail-closed receipted-training doctrine": se generan recibos de ejecucion con medicion de energia mediante doble metrica NVML y Zeus, y se prohibe explicitamente la fabricacion de contadores o marcas de tiempo. El repositorio contiene la escalera de checkpoints en los pasos 50, 100, 150 y 200, mas un checkpoint final, y los recibos de heartbeat y finalizacion se alojan en los logs del lane `SZLHOLDINGS/frontier-54-runs`. No se documentan tecnicas como RLHF, DPO ni decodificacion especulativa.

## Capacidades

- Generacion de texto y codigo, heredadas del modelo base Qwen2.5-Coder-3B-Instruct.
- Carga como adaptador PEFT sobre el modelo base mediante `transformers` y `peft`.
- Posibilidad de fusion del adaptador con los pesos base para despliegue como modelo completo.
- Capacidades multilingues limitadas al ingles segun la model card (`language: en`).
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo de razonamiento explicito especificas del adaptador.
- No se documenta ninguna capacidad adicional respecto al modelo base.

## Casos de uso

- Investigacion sobre entrenamiento trazable: el adaptador sirve como caso de estudio de un pipeline de entrenamiento con recibos de energia medidos y checkpoints intermedios auditables, util para equipos que disenan infraestructura de entrenamiento reproducible.
- Evaluacion de adaptadores LoRA sobre modelos de codigo de 3B: permite comparar el comportamiento del checkpoint 50 frente al 200 y al final para estudiar la dinamica de ajuste fino en tareas de codigo.
- Prototipado de asistentes de codigo en local: al ser un adaptador sobre un modelo de 3B, puede cargarse en GPUs de consumo para experimentar con generacion de codigo sin depender de APIs externas.
- Fine-tuning incremental sobre Qwen2.5-Coder-3B-Instruct: el adaptador puede servir como punto de partida o como referencia de formato para nuevos entrenamientos PEFT sobre el mismo modelo base.
- Docencia y formacion: el repositorio con checkpoints intermedios y recibos de ejecucion es material didactico para explicar el ciclo de vida de un adaptador LoRA y la trazabilidad del entrenamiento.
- Auditoria de gobernanza de modelos: los recibos de energia y los logs del lane permiten verificar afirmaciones de entrenamiento, un caso de uso relevante para equipos de compliance de IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica para el adaptador; el modelo base Qwen2.5-Coder-3B-Instruct en FP16 requiere aproximadamente 6-7 GB, y en cuantizacion de 4 bits alrededor de 2-3 GB (estimacion general para un modelo de 3B, no confirmada en la model card).
- GPU recomendadas: no especificadas por el autor. Por tamano del modelo base, cabe en RTX 3090, RTX 4090, A10, L4 y A100.
- Cabe en GPU de consumo: si, por el tamano del modelo base de 3B, aunque no hay confirmacion del autor.
- Opciones de despliegue: `transformers` con `peft` para cargar el adaptador; el despliegue del modelo fusionado podria usar vLLM, TGI, llama.cpp u Ollama, aunque no se documenta compatibilidad explicita.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| salad-lean-invariants-r1 | Adaptador LoRA sobre 3B | no disponible | apache-2.0 | safetensors (PEFT) | Artefacto candidato, sin benchmarks |
| Qwen/Qwen2.5-Coder-3B-Instruct | 3B | no disponible en esta ficha | apache-2.0 | safetensors | Modelo base del adaptador |
| Adaptadores LoRA genericos sobre Qwen2.5-Coder-3B | Adaptador | heredado del base | variable | safetensors | No disponible comparativa concreta |

No se dispone de datos de rendimiento del adaptador para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- El autor declara explicitamente que es un "candidate training artifact", no un modelo de produccion; no deberia desplegarse en entornos productivos sin evaluacion propia.
- No hay benchmarks ni evaluaciones publicadas: se desconoce si el adaptador mejora, degrada o mantiene las capacidades del modelo base.
- El unico idioma declarado es el ingles; el rendimiento en castellano no esta documentado.
- No se especifica la tarea objetivo ("lean invariants") ni el dataset, lo que impide anticipar sesgos o dominios de especializacion.
- Riesgo de alucinacion: no evaluado; hereda el comportamiento del modelo base de 3B, propenso a errores en tareas de razonamiento complejo.
- La licencia apache-2.0 permite uso comercial, pero al ser un artefacto experimental sin validacion, el riesgo tecnico recae en el integrador.
- No se documentan requisitos de hardware, cuantizaciones soportadas ni compatibilidad con frameworks de inferencia distintos de `transformers` + `peft`.
- El modelo base Qwen2.5-Coder-3B-Instruct tiene capacidades limitadas frente a modelos de mayor tamano; el adaptador no cambia esa cota.

## Enlaces

- Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-lean-invariants-r1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct
- Organizacion del autor: https://huggingface.co/SZLHOLDINGS
- Lane de logs de ejecucion referenciado en la model card: SZLHOLDINGS/frontier-54-runs (no se proporciona URL directa en la informacion disponible)
