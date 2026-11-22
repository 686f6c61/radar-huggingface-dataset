# zk0bot/study001-specialist-block-stack

## Resumen

Study001-specialist-block-stack es un checkpoint de investigacion publicado por el usuario zk0bot en Hugging Face. Se trata de un ajuste fino completo (full fine-tune) de un solo task sobre el modelo base `lerobot/smolvla_base`, orientado a la tarea de manipulacion robotica `block_stack` dentro del banco de pruebas ArmnetBench. El autor lo describe explicitamente como un artefacto de estudio y copia de seguridad de checkpoint, no como el modelo final distribuido de la familia zk0 (que reside en `ivelin/zk0-smolvla-fl`).

El modelo parte de SmolVLA, la arquitectura de vision-language-action (VLA) compacta de LeRobot/Hugging Face, y contiene 450.046.176 parametros en formato safetensors (aproximadamente 0,9 GB de repositorio). El entrenamiento consistio en 3.000 pasos sobre 50 demostraciones de la tarea `block_stack`, lo que lo convierte en una referencia de techo (ceiling) para comparar el rendimiento de un especialista puro frente a variantes mas generales.

Su relevancia es acotada y de caracter experimental: sirve como punto de comparacion reproducible en estudios de ajuste fino de politicas VLA, como respaldo de un checkpoint concreto y como ejemplo de pipeline LeRobot entrenado en una DGX Spark. No es un modelo de proposito general ni un asistente de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en SmolVLA (lerobot) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`, 906.712.552 bytes) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura SmolVLA de LeRobot, un diseno VLA compacto que combina un codificador visual, un modelo de lenguaje preentrenado y un cabezal de accion que produce comandos motores a partir de observaciones visuales e instrucciones. Sobre esta base, el autor aplico un ajuste fino completo (todos los parametros, no LoRA ni adaptadores) durante 3.000 pasos, utilizando 50 demostraciones de la tarea `block_stack` de ArmnetBench.

No se detalla en la informacion disponible la composicion del dataset mas alla del numero de demostraciones, ni si se emplearon tecnicas de RLHF, DPO o decodificacion especulativa. El checkpoint se entreno en una DGX Spark, segun la ruta local indicada en la model card (`/home/openclaw/muse-work/zk0-study001-20261119/run/train/spec_block_stack/out/checkpoints/003000/pretrained_model`). El autor incluye el hash SHA-256 del fichero de pesos previo a la subida (`40dbe86783e805cf6b5f9885d7b450ba49a7dc1d8247081704052d0ad55e12f2`) como garantia de integridad.

## Capacidades

- Ejecucion de una unica tarea de manipulacion robotica: apilamiento de bloques (`block_stack`) en el entorno ArmnetBench.
- Control visuomotor a partir de observaciones visuales e instrucciones de tarea, segun el paradigma SmolVLA.
- Integracion con el ecosistema LeRobot para entrenamiento, evaluacion y despliegue de politicas.
- No dispone de capacidades de generacion de texto general, razonamiento simbolico, codigo ni matematicas fuera del bucle de control robotico.
- No consta soporte de tool calling, function calling, agentes multi-paso ni modo de razonamiento explicito.
- Capacidades multilingues: no disponibles; el modelo no procesa lenguaje natural de forma general.

## Casos de uso

- Referencia de techo en estudios de ajuste fino: sirve como especialista puro de una sola tarea contra el que comparar variantes generalistas o con menos datos, tal como plantea el propio autor en el estudio 001.
- Reproduccion de experimentos: al publicarse el checkpoint exacto con hash y numero de pasos, permite replicar la curva de aprendizaje y validar resultados de ArmnetBench.
- Respaldo de checkpoint: cumple la funcion de copia remota ante fallos locales, siguiendo la regla del autor de que los checkpoints significativos residan en repositorios remotos.
- Evaluacion de politicas VLA en simulacion: util para medir el rendimiento de SmolVLA en tareas de apilamiento con 50 demostraciones como presupuesto de datos.
- Base para comparaciones de eficiencia: con 450 M de parametros y un unico task, permite contrastar coste computacional frente a modelos VLA de mayor tamano en la misma tarea.
- Docencia y divulgacion: ejemplo concreto de pipeline LeRobot completo (entrenamiento, checkpoint, publicacion) para quienes aprenden a entrenar politicas roboticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exito en `block_stack` ni comparaciones numericas con otras variantes.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp32): aproximadamente 1,8 GB solo para pesos, mas activaciones y buffers del codificador visual.
- En fp16/bf16: alrededor de 0,9 GB para pesos, con margen adicional para el pipeline de inferencia.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM para inferencia; para entrenamiento completo con 3.000 pasos se empleo una DGX Spark.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060, RTX 4060, RTX 4070 o superiores, siempre que el pipeline LeRobot este correctamente configurado.
- Opciones de despliegue: ecosistema LeRobot (entrenamiento y evaluacion); no consta soporte verificado en vLLM, llama.cpp, Ollama o TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| study001-specialist-block-stack | 450.046.176 | no disponible | `block_stack` (especialista) | Apache 2.0 | Hugging Face |
| `lerobot/smolvla_base` | no disponible en la informacion | no disponible | VLA generalista (base) | no disponible en la informacion | Hugging Face |
| `ivelin/zk0-smolvla-fl` | no disponible en la informacion | no disponible | Modelo distribuido de la familia zk0 | no disponible en la informacion | Hugging Face |

La comparacion cuantitativa con alternativas no puede completarse porque la informacion proporcionada no incluye especificaciones de los modelos de referencia.

## Limitaciones y advertencias

- Es un artefacto de estudio y copia de seguridad, no el modelo final de la familia zk0; el autor lo advierte de forma explicita.
- Especializado en una unica tarea (`block_stack`); no generaliza a otras tareas de manipulacion sin reentrenamiento.
- Entrenado con solo 50 demostraciones, lo que limita la robustez ante variaciones de entorno, iluminacion u objetos.
- No es un modelo de lenguaje: no debe emplearse para generacion de texto, codigo o conversacion.
- Riesgo de sobreajuste al conjunto de demostraciones y al simulador de ArmnetBench.
- Sesgos conocidos: no documentados en la informacion disponible.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluacion publicada desaconseja su uso en produccion sin validacion propia.
- No se documentan limitaciones de contexto ni de idioma porque el modelo no opera sobre texto general.

## Enlaces

- Hugging Face: https://huggingface.co/zk0bot/study001-specialist-block-stack
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Modelo distribuido de la familia zk0: https://huggingface.co/ivelin/zk0-smolvla-fl
