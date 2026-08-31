# tetraengnrng/smolvla_piper_policy_manual

## Resumen

El modelo `tetraengnrng/smolvla_piper_policy_manual` es un fine-tuning del modelo base SmolVLA (Small Vision-Language-Action), desarrollado por la comunidad LeRobot, para una tarea robótica concreta: recoger un cubo rojo y depositarlo en una papelera azul. SmolVLA es una arquitectura compacta de visión-lenguaje-acción que logra un rendimiento competitivo con un coste computacional reducido, lo que permite su despliegue en hardware de consumo. Este fine-tuning en particular ha sido entrenado con un dataset propio de demostraciones manuales (6 episodios, 10.853 fotogramas) y está pensado para ser ejecutado en un robot con dos cámaras (muñeca y extrínseca). Con 450 millones de parámetros, representa una opción ligera frente a modelos VLA de mayor tamaño, siendo adecuado para experimentación y prototipado en robótica de manipulación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action, transformer compacto) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (presumiblemente ingles, no especificado) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción basado en una arquitectura transformer compacta, diseñado para ser eficiente en inferencia y entrenamiento. No se trata de un modelo MoE; emplea una atención densa estándar pero con un tamaño reducido (450M parámetros) que lo hace viable en GPUs de consumo. El modelo base `lerobot/smolvla_base` fue preentrenado en un corpus diverso de datos robóticos y de lenguaje, y este fine-tuning se ha realizado mediante aprendizaje por imitación (behavior cloning) sobre el dataset `tetraengnrng/redcube_manual_data`, que contiene 6 episodios de demostración de la tarea de recoger y colocar un cubo rojo. La configuración de entrenamiento incluye 5000 pasos, batch size 4, optimizador AdamW con learning rate 0.0001 y seed 1000, utilizando la librería LeRobot (versión 0.6.2). No se ha aplicado RLHF ni DPO; el entrenamiento es puramente supervisado sobre las demostraciones.

## Capacidades

- Generacion de acciones de robot (control de 7 grados de libertad) a partir de observaciones visuales y de estado.
- Percepcion multimodal: procesa tres imagenes RGB de 256x256 (camara de muneca y dos extrinsecas) junto con un vector de estado de 6 dimensiones.
- Ejecucion de tareas de manipulacion de objetos en un entorno fisico, especificamente la tarea de "pick and place" de un cubo rojo en una papelera azul.
- Inferencia en tiempo real: el modelo esta disenado para producir acciones a una frecuencia adecuada para control de robot (no se especifica la frecuencia exacta, pero el dataset se grabo a 30 FPS).
- Integracion con el ecosistema LeRobot: compatible con el CLI de LeRobot para entrenamiento, evaluacion y despliegue.
- No soporta tool calling, generacion de texto libre ni capacidades de agente conversacional; es un modelo puramente de politica robótica.

## Casos de uso

- Automatizacion de tareas de pick-and-place en entornos de laboratorio o fabrica: el modelo puede controlar un brazo robotico para recoger objetos de una posicion conocida y depositarlos en un contenedor, gracias a su entrenamiento especifico en esta tarea.
- Prototipado rapido de politicas de imitacion: al ser un fine-tuning ligero, permite experimentar con el flujo de trabajo de LeRobot (grabar datos, entrenar, desplegar) en un dia, ideal para investigadores que validan nuevas ideas.
- Educacion en robotica: sirve como ejemplo didactico de como entrenar un VLA compacto con pocas demostraciones, util en cursos de robotica o vision por computador.
- Evaluacion de hardware de consumo: dado su tamano reducido, puede ejecutarse en GPUs como RTX 3060 o superiores, permitiendo probar algoritmos de control en configuraciones economicas.
- Baseline para comparar con politicas mas complejas: investigadores pueden usar este modelo como referencia de rendimiento para tareas similares antes de probar modelos mas grandes.
- Despliegue en robots de bajo coste: compatible con robots soportados por LeRobot (por ejemplo, SO-100, Koch v1.1), lo que facilita su uso en proyectos de robotica asequible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente: "No evaluation results have been provided for this policy yet." Por tanto, no hay datos de exito en tareas reales ni comparativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente, pero dado el tamano de 450M parametros en precision FP16, se estima un consumo de aproximadamente 1-2 GB de VRAM, siendo viable en GPUs de consumo como RTX 3060 (12 GB) o superiores.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, RTX 3050, GTX 1660 Super) para inferencia; para entrenamiento se recomienda 8 GB o mas.
- Si cabe en consumer GPU: si, es uno de los objetivos del diseno de SmolVLA.
- Opciones de despliegue: LeRobot (CLI `lerobot-rollout`), compatible con vLLM y TGI si se adapta, aunque el flujo nativo es mediante LeRobot y PyTorch.
- Latencia y throughput: no disponibles; dependera de la GPU y del numero de cameras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tetraengnrng/smolvla_piper_policy_manual (este) | 450M | no disponible | sin benchmarks publicados | Apache 2.0 | HuggingFace |
| lerobot/smolvla_base | 450M | no disponible | base, requiere fine-tuning | Apache 2.0 | HuggingFace |
| OpenVLA (7B) | 7B | 8k | MMLU ~70, pero en robotica sin datos comparables | MIT (pesos) | HuggingFace |
| RT-2 (55B) | 55B | 8k | no disponible publicamente | propietaria | no abierto |

No se dispone de comparativas directas de rendimiento en la tarea especifica, ya que el modelo no tiene evaluaciones publicadas. La comparacion se limita a caracteristicas generales.

## Limitaciones y advertencias

- Dataset de entrenamiento muy reducido (6 episodios), lo que puede provocar sobreajuste y baja generalizacion ante variaciones de iluminacion, posicion de objetos o cambios en el entorno.
- Tarea unica y especifica: el modelo solo ha sido entrenado para "pick up the red cube and place it into the blue bin"; no es reutilizable para otras tareas sin reentrenamiento.
- No se han proporcionado resultados de evaluacion en robot real, por lo que se desconoce su tasa de exito real.
- Depende de la configuracion de camaras (muneca y extrinseca) y de la calibracion especifica del robot; cambios en la disposicion fisica pueden degradar el rendimiento.
- Riesgo de alucinacion visual: como cualquier VLA, puede generar acciones incorrectas si la escena difiere de las demos.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y el dataset pueden tener restricciones adicionales (verificar licencias de los componentes).
- No soporta lenguajes distintos del ingles (si es que lo soporta), ya que no se especifican capacidades multilingues.
- Para produccion seria, se recomienda grabar mas episodios (la documentacion de SmolVLA sugiere ~50 episodios como punto de partida).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/tetraengnrng/smolvla_piper_policy_manual
- Dataset de entrenamiento: https://huggingface.co/datasets/tetraengnrng/redcube_manual_data
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Documentacion LeRobot SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Repositorio LeRobot: https://github.com/huggingface/lerobot
