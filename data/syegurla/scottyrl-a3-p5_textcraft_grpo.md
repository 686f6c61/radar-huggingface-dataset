# syegurla/scottyrl-a3-p5_textcraft_grpo

## Resumen

`syegurla/scottyrl-a3-p5_textcraft_grpo` es un adaptador LoRA de rango 32 entrenado sobre el modelo base `Qwen/Qwen3.5-4B`. Lo publica el usuario `syegurla` como entrega de la asignatura 11-768 (AI Agents) de la Universidad Carnegie Mellon (CMU), dentro de la Assignment 3, usando el framework de entrenamiento `scottyrl`. No se trata de un modelo completo, sino de un conjunto de pesos delta que deben cargarse junto al modelo base para su uso.

La finalidad declarada del adaptador es el ajuste fino del modelo base mediante GRPO (Group Relative Policy Optimization) sobre una tarea denominada `textcraft`, evaluada en los splits de validacion medium y hard del conjunto TextCraft-Synth. El nombre de la ejecucion (`p5_textcraft_grpo`) y la configuracion asociada (`configs/p5_textcraft_grpo.yaml`) indican un pipeline de refuerzo orientado a tareas de agentes con herramientas.

El repositorio es de caracter academico y muy reciente (creado el 1 de noviembre de 2026), con cero descargas y cero likes en el momento de la consulta. El tamano del repositorio es de 0,2 GB, coherente con un adaptador LoRA y no con un modelo completo. La model card no documenta licencia, idiomas, resultados de benchmarks ni detalles del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rank 32) sobre transformer decoder-only Qwen3.5-4B |
| Parametros totales | no disponible (adaptador; el modelo base Qwen3.5-4B tiene 4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-4B) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; cuantizacion aplicable al modelo base) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (PEFT/LoRA) |
| Libreria | peft |
| Modelo base | Qwen/Qwen3.5-4B |
| Rank LoRA | 32 |
| Framework de entrenamiento | scottyrl |
| Metodo de ajuste | GRPO |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

El adaptador se construye sobre `Qwen/Qwen3.5-4B`, un transformer decoder-only de 4 mil millones de parametros. El ajuste se realiza mediante LoRA de rango 32, lo que congela los pesos del modelo base e introduce matrices de baja dimensionalidad en las capas adaptadas. El entrenamiento se lleva a cabo con el framework `scottyrl` y el algoritmo GRPO, un metodo de optimizacion por politica con recompensas relativas dentro de un grupo de muestras, habitual en el ajuste de modelos para razonamiento y tareas de agente.

La ejecucion se exporto desde `tinker://model_7e49be82/v50_r1` y corresponde a la configuracion `configs/p5_textcraft_grpo.yaml` en el commit `88d1b1fa2aea58938d6d251847ce5559c4ac6558`. La model card no especifica el numero de tokens de entrenamiento, la composicion del dataset, la funcion de recompensa ni si hubo etapas previas de SFT o DPO. La tarea objetivo, TextCraft-Synth, sugiere un entorno de agente con herramientas y validacion en splits de dificultad media y alta.

## Capacidades

- Generacion de texto y razonamiento heredados del modelo base Qwen3.5-4B.
- Ajuste especifico para tareas de agente en el entorno TextCraft-Synth, segun la configuracion de entrenamiento declarada.
- Entrenamiento con GRPO, orientado a mejorar la politica del modelo en tareas con recompensa verificable.
- Capacidad de ejecucion como modulo LoRA servido por vLLM con `--enable-lora` y `--max-lora-rank 32`.
- Soporte de evaluacion con `k=4` (muestreo multiple) mediante el script `scripts/evaluate_checkpoint.py`.
- Capacidades multilingues, de tool calling, vision o audio: no disponibles en la informacion proporcionada.

## Casos de uso

- Evaluacion academica de agentes: el adaptador esta disenado para ser servido con vLLM y evaluado con el script del curso sobre los splits medium y hard de TextCraft-Synth, lo que permite reproducir la entrega de la Assignment 3 de 11-768.
- Investigacion en RL para agentes: sirve como punto de partida para estudiar el efecto de GRPO con LoRA de rango 32 sobre un modelo de 4B en tareas de sintesis de texto estructurado.
- Experimentos de ajuste eficiente: al ser un adaptador de 0,2 GB, permite iterar sobre el modelo base sin reentrenar los 4B parametros completos, reduciendo coste de almacenamiento y despliegue.
- Despliegue multi-adaptador: vLLM permite cargar el adaptador como modulo `a3` junto al modelo base, lo que facilita comparar variantes de politica en un mismo servidor.
- Reproducibilidad de pipelines: la configuracion y el commit documentados permiten reconstruir la ejecucion y auditar el proceso de entrenamiento.
- Docencia y formacion: util como ejemplo practico de LoRA + GRPO con el framework scottyrl en un curso de agentes de IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente describe el procedimiento de evaluacion (servido con vLLM y ejecucion de `scripts/evaluate_checkpoint.py` con `k=4` sobre los splits medium y hard de TextCraft-Synth), pero no incluye las metricas obtenidas.

## Requisitos de hardware

- El adaptador pesa 0,2 GB; el modelo base Qwen3.5-4B requiere su propio espacio en VRAM.
- VRAM estimada para el modelo base en FP16: aproximadamente 8-9 GB; en cuantizacion de 8 bits, en torno a 4-5 GB; en 4 bits, en torno a 2,5-3 GB (estimaciones orientativas, no confirmadas en la informacion disponible).
- GPU recomendadas: A100, H100 o L40S para servir con vLLM en produccion; RTX 4090 o RTX 3090 para inferencia en consumer GPU con cuantizacion.
- Despliegue: vLLM con `--enable-lora --max-lora-rank 32 --lora-modules a3=syegurla/scottyrl-a3-p5_textcraft_grpo`, segun la model card.
- Otros runners (llama.cpp, Ollama, TGI) no estan documentados para este adaptador; requeririan conversion o soporte especifico de LoRA.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| syegurla/scottyrl-a3-p5_textcraft_grpo | Adaptador LoRA r32 sobre 4B | no disponible | safetensors (PEFT) | no disponible | Ajuste GRPO para TextCraft-Synth |
| Qwen/Qwen3.5-4B | 4B | no disponible | safetensors | no disponible en la informacion | Modelo base sin ajuste |
| Otros adaptadores scottyrl del mismo curso | Adaptadores LoRA sobre 4B | no disponible | safetensors (PEFT) | no disponible | Variantes de politica para tareas de agente |

No se dispone de datos de rendimiento comparativo entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- Adaptador, no modelo autonomo: requiere cargar `Qwen/Qwen3.5-4B` como base; no puede usarse de forma aislada.
- Sin licencia declarada: no se especifica licencia del adaptador ni del modelo base en la informacion disponible, lo que impide confirmar condiciones de uso comercial.
- Sin idiomas documentados: no hay informacion sobre cobertura multilingue.
- Sin benchmarks publicados: no hay evidencia cuantitativa del rendimiento del adaptador frente al modelo base.
- Especificidad de dominio: el ajuste esta orientado a TextCraft-Synth; su comportamiento fuera de ese entorno no esta validado.
- Riesgo de alucinacion y sesgos: no documentados en la model card; deben asumirse los del modelo base.
- Caracter academico: repositorio con cero descargas y cero likes, sin mantenimiento ni soporte declarado.
- Dependencia de vLLM: el procedimiento de evaluacion documentado asume vLLM con soporte LoRA y rango 32.

## Enlaces

- HuggingFace: https://huggingface.co/syegurla/scottyrl-a3-p5_textcraft_grpo
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Framework scottyrl: no disponible
- Paper de GRPO: no disponible en la informacion proporcionada
- Repositorio del curso 11-768 (CMU): no disponible en la informacion proporcionada
