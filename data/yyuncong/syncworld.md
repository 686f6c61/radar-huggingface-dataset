# yyuncong/SyncWorld

## Resumen

SyncWorld es un modelo de mundo (world model) para robótica desarrollado por Yuncong Yang, investigador en UMass Amherst. Dado un historial de fotogramas de cámara del robot y las acciones del efector final que está a punto de ejecutar, el modelo predice el vídeo que sigue. Está entrenado a partir del checkpoint público Cosmos3-Nano de NVIDIA, dentro del framework Cosmos, y se distribuye como una ejecución de dinámica directa con caption neutro en la iteración 174.000.

El modelo introduce tres innovaciones principales: condicionamiento por calibración (cada muestra incluye 6 barridos de calibración por grado de libertad para inferir el sistema de coordenadas de acción), canal de texto deliberadamente no entrenado (todas las muestras usan el mismo caption neutro) y destilación con historial enmascarado (con probabilidad 0,3 se predicen fotogramas reales recientes en lugar de copiarlos, forzando inferencia cross-modal). El checkpoint es autocontenido e incluye el config.json, con un total de 15.750 millones de parámetros en formato safetensors.

SyncWorld es relevante porque aborda un problema central en robótica: la predicción de vídeo condicionada a acciones, necesaria para planificación, simulación y aprendizaje por imitación. Su enfoque de calibración condicionada permite que el modelo se adapte a distintos sistemas de coordenadas sin reentrenamiento, y su licencia OpenMDW-1.1 permite uso comercial bajo las condiciones de NVIDIA Cosmos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion latente basada en Cosmos3-Nano (VAE Wan2.2 + vision tower Qwen3-VL) |
| Parametros totales | 15.750.057.456 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (condicionamiento: 25 fotogramas historicos sparse @ stride 3 + 6 segmentos de calibracion de 5 fotogramas; prediccion: 16 fotogramas) |
| Tipos de cuantizacion | no disponible (solo safetensors en precision completa) |
| Idiomas soportados | no disponible (canal de texto no entrenado; no sigue instrucciones de lenguaje) |
| Licencia | OpenMDW-1.1 (heredada de NVIDIA Cosmos-Framework) |
| Formato de pesos | safetensors (7 shards, 1165 tensores, ~30 GB) |

## Arquitectura y entrenamiento

SyncWorld se basa en el checkpoint Cosmos3-Nano de NVIDIA, un modelo de difusion latente para generacion de video. La arquitectura combina un VAE de Wan2.2 para el espacio latente, un vision tower Qwen3-VL congelado (351 tensores) y adaptadores de sonido no utilizados (5 tensores) que se copiaron de vuelta desde la base antes de la exportacion. El modelo completo contiene 1165 tensores, de los cuales 809 son entrenables.

El entrenamiento se realizo durante 174.000 iteraciones en 4 nodos con 8 H100 cada uno (32 GPUs en total, con FSDP), a resolucion 512x512. El condicionamiento consiste en 25 fotogramas historicos sparse con stride 3, mas 6 segmentos de calibracion de 5 fotogramas cada uno, y la prediccion es de 16 fotogramas. La accion se representa como un vector 7D `[dpos_cm(3), deuler_deg(3), gripper(1)]` con deltas backward-framewise. Se uso AdamW con learning rate 5e-5 (5x para las cabezas de accion). Los datos de entrenamiento incluyen RLBench, RoboCasa, RoboSuite (conjuntos de calibracion) y DROID.

La innovacion clave es el condicionamiento por calibracion: cada muestra se prefija con K=6 barridos de calibracion cortos por grado de libertad del mismo episodio, que actuan como items VAE completamente condicionantes. El modelo lee estos barridos para inferir el marco de coordenadas de accion a partir de lo que ve, en lugar de tener un marco fijo integrado en los pesos. Ademas, con p=0.3 se aplica destilacion con historial enmascarado: una ejecucion reciente de fotogramas reales se mueve fuera del condicionamiento y se predice, forzando inferencia cross-modal; un termino de consistencia teacher/student (λ=0.25) empareja cada muestra con una copia sin calibracion.

## Capacidades

- Prediccion de video condicionada a acciones: dado un historial de fotogramas de camara y las acciones del efector final, genera el video futuro (16 fotogramas a 512x512).
- Condicionamiento por calibracion: infiere el sistema de coordenadas de accion a partir de barridos de calibracion por grado de libertad, sin marco fijo predefinido.
- Rollout autorregresivo: puede ejecutar episodios completos en bucle cerrado (closed-loop) o con teacher forcing, como se demuestra en la evaluacion.
- Manejo de historial enmascarado: con p=0.3 predice fotogramas reales recientes en lugar de copiarlos, lo que fuerza inferencia cross-modal.
- No sigue instrucciones de lenguaje: el canal de texto esta deliberadamente no entrenado (caption neutro fijo), por lo que no responde a comandos en lenguaje natural.
- Compatible con el framework Cosmos: hereda la integracion con el ecosistema NVIDIA Cosmos-Framework.

## Casos de uso

- Simulacion de dinamica directa para robotica: SyncWorld puede predecir el resultado visual de una secuencia de acciones del efector final, permitiendo simular el comportamiento del robot sin necesidad de un simulador fisico completo. Es adecuado porque su condicionamiento por calibracion se adapta a distintos sistemas de coordenadas.
- Planificacion de movimientos con modelo de mundo: un planificador puede muestrear multiples secuencias de acciones, usar SyncWorld para predecir el video resultante y seleccionar la trayectoria que mejor cumpla los objetivos. Su capacidad de rollout autorregresivo en bucle cerrado lo hace util para evaluar secuencias largas.
- Aprendizaje por imitacion con aumento de datos: los datos de demostracion pueden aumentarse generando variaciones visuales de las mismas acciones, mejorando la robustez de politicas aprendidas. La prediccion de 16 fotogramas a 512x512 proporciona suficiente detalle para este proposito.
- Evaluacion de politicas en bucle cerrado: dado un checkpoint de politica, SyncWorld puede simular la interaccion con el entorno visualmente, permitiendo evaluar el rendimiento sin desplegar en el robot real. La metrica PSNR de 26.96 en ManiSkill indica fidelidad visual razonable.
- Generacion de datos sinteticos para entrenamiento: los videos generados pueden usarse para preentrenar modelos de percepcion o representaciones visuales especificas de robotica, aprovechando la diversidad de los datos de entrenamiento (RLBench, RoboCasa, RoboSuite, DROID).
- Investigacion en world models: como implementacion de referencia del enfoque SyncWorld, sirve para estudiar el efecto del condicionamiento por calibracion y la destilacion con historial enmascarado en la calidad de la prediccion de video.

## Benchmarks y rendimiento

La model card reporta resultados de rollout autorregresivo de episodio completo (2 rondas: una con teacher forcing y otra en bucle cerrado), a 512x512, con guidance 5.0 y 35 pasos de muestreo:

| Conjunto de evaluacion | Episodios | Segmentos | PSNR | SSIM |
|---|---|---|---|---|
| ManiSkill | 50 | 459 | 26.96 | 0.869 |
| LIBERO | 50 | 527 | 28.71 | 0.950 |
| Robot real | 30 | 760 | 27.88 | 0.929 |

No se han publicado resultados comparativos con otros modelos de mundo en la informacion disponible. El autor indica que los valores por defecto de evaluacion son un preset mas rapido que cuesta aproximadamente 0.19 dB PSNR respecto a la configuracion completa.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Con 15.750 millones de parametros en precision completa (fp32), se estima un minimo de 63 GB solo para los pesos; con precision mixta (bf16) se reduce a ~31.5 GB. Se recomienda cuantizacion o precision reducida para GPUs de consumo.
- GPU recomendadas: el entrenamiento se realizo en H100 (32 GPUs con FSDP). Para inferencia, se recomiendan GPUs con al menos 40 GB de VRAM (A100 40GB, A100 80GB, H100) para precision completa o bf16. No cabe en GPUs de consumo como RTX 4090 (24 GB) sin cuantizacion, que no esta disponible en el repositorio.
- Opciones de despliegue: el repositorio oficial proporciona un script de evaluacion con torchrun (`examples/eval_gripperhead_fdm_rollout.py`). No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, que son tipicas para modelos de lenguaje pero no para este tipo de modelo de difusion de video.
- Latencia y throughput: no disponibles en la informacion proporcionada. El preset rapido por defecto es una alternativa al de 35 pasos, pero no se especifican tiempos concretos.

## Comparativa con modelos similares

No se dispone de informacion suficiente para una comparativa rigurosa con modelos similares en la misma categoria (world models para robotica). El modelo base Cosmos3-Nano de NVIDIA es el punto de partida, pero no se han publicado comparaciones directas con otros modelos de mundo como UniSim, Genie o modelos de dinamica basados en difusion. La informacion disponible no incluye datos de modelos comparables.

## Limitaciones y advertencias

- Canal de lenguaje no entrenado: el modelo no sigue instrucciones en lenguaje natural. Todas las muestras usan el caption neutro "A robot arm interacts with the scene." y el canal de texto esta deliberadamente sin entrenar. No debe usarse para tareas que requieran comprension de lenguaje.
- Dependencia de calibracion: el modelo espera barridos de calibracion por grado de libertad del mismo episodio. Sin ellos, es necesario usar `--calib-null` para anular los slots de calibracion, lo que corresponde al caso "calibracion eliminada" visto durante el entrenamiento y puede degradar el rendimiento.
- Requisito de VAE externo: se necesita el VAE de Wan2.2 (`WAN_VAE_PATH`) por separado, no se redistribuye en el repositorio. Sin el, el modelo no puede ejecutarse.
- Riesgo de alucinacion visual: como todo modelo generativo, puede producir videos que no corresponden fielmente a la fisica real del entorno, especialmente en escenarios fuera de la distribucion de entrenamiento.
- Sesgos de datos: los datos de entrenamiento provienen de RLBench, RoboCasa, RoboSuite y DROID, que cubren principalmente entornos de manipulacion con brazo robotico. El rendimiento en otros tipos de robots o entornos no esta garantizado.
- Licencia OpenMDW-1.1: heredada de NVIDIA Cosmos-Framework. Aunque permite uso comercial, es necesario revisar las condiciones especificas de la licencia, especialmente en lo relativo a redistribucion y atribucion.
- Tamano del modelo: con 15.750 millones de parametros y ~30 GB en safetensors, requiere hardware de gama alta para inferencia, lo que limita su uso en entornos con recursos limitados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yyuncong/SyncWorld
- Repositorio GitHub del proyecto: https://github.com/yyuncong/SyncWorld
- Licencia OpenMDW-1.1: https://github.com/NVIDIA/Cosmos/blob/main/LICENSE
- Pagina personal del autor: https://yyuncong.github.io/
- Perfil de GitHub del autor: https://github.com/yyuncong/
- Proyecto relacionado MindJourney: https://huggingface.co/yyuncong/MindJourney-World-Model
- Paper relacionado SynWorld: https://arxiv.org/abs/2504.03561
