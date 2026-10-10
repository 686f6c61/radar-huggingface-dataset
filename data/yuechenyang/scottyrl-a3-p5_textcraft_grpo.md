# YuechenYang/scottyrl-a3-p5_textcraft_grpo

## Resumen

Este repositorio contiene un adaptador LoRA (rank 32) denominado `p5_textcraft_grpo`, entrenado sobre el modelo base `Qwen/Qwen3.5-4B`. No es un modelo completo, sino un conjunto de pesos de ajuste fino en formato PEFT que se carga sobre el modelo base para modificar su comportamiento en una tarea concreta. El autor es el usuario de HuggingFace YuechenYang y el adaptador se ha publicado como parte del trabajo de la asignatura 11-768 (AI Agents) de la Universidad Carnegie Mellon, en su Assignment 3.

El entrenamiento se ha realizado con el framework `scottyrl` y el nombre del run (`p5_textcraft_grpo`) sugiere el uso de GRPO (Group Relative Policy Optimization) como metodo de optimizacion por refuerzo, aunque este extremo no se confirma de forma explicita en la informacion disponible. El escenario de evaluacion indicado en la model card es TextCraft-Synth, con particiones de validacion "medium" y "hard", lo que situa el adaptador en el ambito de agentes que operan sobre entornos textuales y tareas de crafteo (combinacion de objetos mediante recetas).

Se trata de un artefacto de investigacion con caracteristicas propias de un ejercicio academico: cero descargas, cero "likes", repositorio de 0,2 GB, publicacion y ultima actualizacion el mismo dia (9 de octubre de 2026) y ausencia total de informacion sobre licencia, idiomas o benchmarks numericos. Su relevancia es, por tanto, limitada al contexto docente y a la reproducibilidad del pipeline de evaluacion con vLLM que documenta la propia model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible para el adaptador (PEFT/LoRA sobre el modelo base `Qwen/Qwen3.5-4B`; arquitectura del base no detallada en la informacion disponible) |
| Parametros totales | Adaptador: rank 32 (numero exacto de parametros entrenables no disponible). Modelo base: 4B nominales segun su denominacion (`Qwen/Qwen3.5-4B`), cifra exacta no confirmada |
| Parametros activos | No aplica / no disponible (no consta que el modelo base sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible para el modelo base. El adaptador se distribuye en precision completa de LoRA (safetensors) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); el modelo base se carga por separado en su formato original |

## Arquitectura y entrenamiento

La informacion disponible describe un adaptador LoRA de rank 32 sobre `Qwen/Qwen3.5-4B`, exportado desde el endpoint `tinker://model_770cab09/v50_r2` y entrenado con el framework `scottyrl`. No se detalla la composicion del dataset de entrenamiento, el numero de tokens utilizados, ni si hubo fases adicionales de RLHF o DPO. El nombre del run (`p5_textcraft_grpo`) apunta a GRPO como algoritmo de optimizacion, y el identificador de version `v50` sugiere un entrenamiento con un numero elevado de iteraciones o checkpoints, pero ninguno de estos extremos se documenta de forma explicita en la model card.

El unico elemento tecnico verificable es el protocolo de evaluacion, que revela dos detalles de implementacion: el adaptador se sirve con vLLM habilitando LoRA (`--enable-lora --max-lora-rank 32`) y se evalua con `k=4` sobre las particiones de validacion "medium" y "hard" de TextCraft-Synth. El rango 32 del adaptador es coherente con el parametro `--max-lora-rank 32` exigido por el servidor. El commit de git indicado (`c5825929dfc94c966714df8c905be28119bf9cf9`) y la ruta de configuracion (`configs/p5_textcraft_grpo.yaml`) corresponden al repositorio del curso y no a un artefacto publicado de forma independiente.

## Capacidades

- Ajuste fino especializado en tareas de agente sobre entornos textuales, segun el contexto de evaluacion declarado (TextCraft-Synth, particiones medium y hard).
- Razonamiento multi-paso orientado a la resolucion de objetivos dentro de un entorno de texto, derivado del uso de GRPO como metodo de entrenamiento segun el nombre del run.
- Capacidad de integrarse en un servidor vLLM como modulo LoRA adicional (`--lora-modules a3=YuechenYang/scottyrl-a3-p5_textcraft_grpo`), lo que permite servir el modelo base y varios adaptadores en paralelo.
- Soporte de tool calling / function calling: no disponible.
- Capacidades de codigo, matematicas o vision: no disponibles (dependen del modelo base, no documentadas para este adaptador).
- Capacidades multilingues: no disponibles.
- Modo "thinking" o cualquier capacidad especial: no disponible.

## Casos de uso

- Reproduccion de la evaluacion academica: el caso de uso principal y documentado es cargar el adaptador en vLLM con `--enable-lora --max-lora-rank 32` y ejecutar `scripts/evaluate_checkpoint.py` con `--k 4` sobre las particiones medium y hard de TextCraft-Synth, para verificar el resultado del Assignment 3 de 11-768.
- Investigacion en aprendizaje por refuerzo sobre agentes: sirve como punto de comparacion frente al modelo base `Qwen/Qwen3.5-4B` sin adaptar, permitiendo medir la ganancia atribuible al entrenamiento con scottyrl/GRPO en una tarea de decision secuencial.
- Experimentacion con despliegue multi-adaptador: al ser un LoRA de rank 32, puede servirse junto a otros adaptadores sobre el mismo modelo base en vLLM, lo que resulta util para comparar variantes de entrenamiento sin duplicar el coste de memoria de los pesos base.
- Estudio de entornos textuales de planificacion: para investigadores que trabajan en agentes que deben encadenar acciones y combinar recursos siguiendo recetas, el adaptador ejemplifica un ajuste especifico sobre ese dominio.
- Docencia y cursos de agentes: el repositorio puede utilizarse como plantilla para entender el flujo completo de entrenamiento con tinker, exportacion a PEFT y evaluacion estandarizada con vLLM.
- Pruebas de integracion de pipelines PEFT: util para validar que un stack de inferencia (vLLM, PEFT, safetensors) carga correctamente adaptadores de rank 32 en un modelo de ~4B de parametros.
- Despliegue en produccion: no recomendado con la informacion disponible, ya que no se especifican licencia, idiomas, sesgos ni metricas de calidad; cualquier uso comercial requeriria verificar antes la licencia del modelo base y del adaptador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente describe el procedimiento de evaluacion, sin cifras de resultados:

| Aspecto | Detalle |
|---|---|
| Tarea evaluada | TextCraft-Synth (validacion) |
| Particiones | medium y hard |
| Metrica | no disponible (el script `evaluate_checkpoint.py` con `--k 4` sugiere evaluacion con 4 intentos o muestras por tarea, sin que se explicite la metrica) |
| Resultados numericos | no disponibles |
| Comparativa con modelos similares | no disponible |

## Requisitos de hardware

- Tamano del repositorio del adaptador: 0,2 GB, segun los metadatos de HuggingFace.
- VRAM para el adaptador: marginal; los pesos LoRA de rank 32 sobre un modelo base de 4B nominales ocupan del orden de centenares de megabytes en precision de entrenamiento, coherente con el tamano de 0,2 GB del repositorio.
- VRAM para el modelo base (estimacion a partir del tamano nominal de 4B, no confirmada en la informacion disponible): aproximadamente 8-9 GB en fp16/bf16, en torno a 5-6 GB en cuantizacion de 8 bits y alrededor de 3-4 GB en cuantizacion de 4 bits, en ambos casos mas el espacio de cache KV correspondiente al contexto utilizado.
- GPU recomendadas: no especificadas por el autor. Por el tamano del modelo base, un adaptador de este tipo es viable en GPUs de consumo con 8-16 GB de VRAM (por ejemplo, RTX 3060 de 12 GB, RTX 4070, RTX 4080, RTX 4090), asi como en GPUs de datacenter tipo A100 o H100 para servir en produccion.
- Despliegue documentado: vLLM, con el comando exacto indicado en la model card (`vllm serve Qwen/Qwen3.5-4B --enable-lora --max-lora-rank 32 --lora-modules a3=YuechenYang/scottyrl-a3-p5_textcraft_grpo`).
- Otras opciones de despliegue: no documentadas. Para llama.cpp u Ollama seria necesario fusionar el adaptador con el modelo base o convertirlo a GGUF, procedimiento que el autor no describe.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `YuechenYang/scottyrl-a3-p5_textcraft_grpo` | Adaptador LoRA rank 32 sobre base de 4B nominales | No disponible | No publicado | No disponible | HuggingFace, 0 descargas |
| `Qwen/Qwen3.5-4B` (modelo base sin adaptador) | 4B nominales | No disponible | No disponible en esta informacion | No disponible | HuggingFace (referenciado como base) |
| Otros adaptadores LoRA comparables | No disponible | No disponible | No disponible | No disponible | No se han identificado alternativas equivalentes en la informacion proporcionada |

No se dispone de datos suficientes para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Ausencia total de licencia declarada: no se puede determinar si el uso comercial esta permitido, ni para el adaptador ni en combinacion con el modelo base. Es imprescindible verificar la licencia de `Qwen/Qwen3.5-4B` antes de cualquier uso mas alla de la investigacion.
- Sin datos de benchmarks publicados: no existen cifras verificables de MMLU, HumanEval, GSM8K ni de la propia tarea TextCraft-Synth, por lo que no es posible estimar la calidad real del ajuste.
- Sin informacion sobre idiomas: no se puede confirmar el comportamiento en castellano ni en otros idiomas distintos de los del modelo base.
- Riesgo de alucinacion: no evaluado ni documentado por el autor. Al ser un adaptador afinado con refuerzo sobre una tarea concreta, es plausible un deterioro de capacidades generales (olvido catastrofico) fuera del dominio de TextCraft, aunque no hay datos que lo confirmen.
- Sesgos: no documentados. Al no describirse la composicion del dataset de entrenamiento, no es posible evaluar sesgos de genero, idioma, cultura o dominio.
- Ambito de uso muy restringido: el adaptador se ha creado como ejercicio del Assignment 3 del curso 11-768 y su evaluacion se limita a dos particiones de validacion de una unica tarea sintetica.
- Reproducibilidad dependiente de artefactos externos: el entrenamiento se exporto desde `tinker://model_770cab09/v50_r2` y la evaluacion depende de `configs/p5_textcraft_grpo.yaml` y de `scripts/evaluate_checkpoint.py`, que pertenecen al repositorio del curso y no se enlazan en la model card.
- Requisito de version de vLLM: la carga exige soporte de LoRA con `--max-lora-rank 32`; versiones del servidor sin esa opcion no podran servir el adaptador.
- Metadatos incompletos: pipeline, licencia e idiomas figuran como no disponibles en la ficha de HuggingFace, lo que dificulta su integracion automatizada en catalogos o pipelines de evaluacion.
- Fecha de publicacion futura respecto al conocimiento habitual de los modelos citados: la ficha indica creacion y actualizacion el 9 de octubre de 2026, dato a tener en cuenta al contrastar con otras fuentes.

## Enlaces

- Ficha en HuggingFace: https://huggingface.co/YuechenYang/scottyrl-a3-p5_textcraft_grpo
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Paper, blog o repositorio del framework `scottyrl`: no disponible en la informacion proporcionada
- Repositorio del curso 11-768 (AI Agents, CMU) con `configs/p5_textcraft_grpo.yaml` y `scripts/evaluate_checkpoint.py`: no disponible en la informacion proporcionada
- Commit de referencia indicado por el autor: `c5825929dfc94c966714df8c905be28119bf9cf9`
- Origen del checkpoint exportado: `tinker://model_770cab09/v50_r2`
