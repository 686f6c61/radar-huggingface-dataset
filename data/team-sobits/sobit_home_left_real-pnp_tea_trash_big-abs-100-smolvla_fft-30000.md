# team-sobits/sobit_home_left_real-pnp_tea_trash_big-abs-100-smolvla_fft-30000

## Resumen

Este modelo es una política de robótica basada en SmolVLA, un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face y descrito en el artículo arXiv 2506.01844. Ha sido fine-tuneado por el equipo SOBITS de la Universidad de Soka sobre el modelo base `lerobot/smolvla_base` para controlar un manipulador móvil doméstico (SOBIT HOME) en una tarea concreta: lanzar una botella de plástico a una papelera. Se trata de un checkpoint intermedio en el paso 30 000 de una ejecución de 90 000 pasos, cuyo modelo final se publica por separado.

El modelo consume imágenes de dos cámaras (cabeza y mano izquierda) junto con el estado del robot (20 dimensiones) y produce una acción de control de 20 dimensiones. Con aproximadamente 450 millones de parámetros, SmolVLA está diseñado para ejecutarse en hardware de consumo, lo que lo hace relevante para la investigación en robótica de bajo coste. La licencia Apache 2.0 permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (Vision-Language-Action, transformer multimodal compacto) |
| Parametros totales | 450 046 176 (~450M) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (modelo de control robotico, no de texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizacion publicada) |
| Idiomas soportados | no disponible (modelo de actuacion robotica, sin interfaz de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de vision-lenguaje-accion que combina un codificador visual, un backbone de lenguaje y un modulo de prediccion de acciones. A diferencia de modelos VLA mas grandes como OpenVLA (7B parametros), SmolVLA reduce drasticamente el tamano manteniendo un rendimiento competitivo, lo que permite su despliegue en GPUs de consumo. El modelo base `lerobot/smolvla_base` fue preentrenado en una amplia variedad de datos roboticos y de lenguaje, y este checkpoint se ha fine-tuneado mediante aprendizaje por imitacion (behavior cloning) con el framework LeRobot.

El entrenamiento se realizo sobre el dataset `team-sobits/sobit_home_left_real-pnp_tea_trash_big-abs-100`, que contiene 100 episodios reales grabados a 10 FPS (22 125 frames en total) de la tarea "lanzar la botella de plastico a la papelera". Se utilizaron 30 000 pasos de optimizacion con batch size 16, optimizador AdamW, learning rate 0.0001 y seed 1000. No se menciona el uso de RLHF, DPO ni otras tecnicas de refinamiento posterior; es un fine-tuning supervisado estandar.

## Capacidades

- Control robotico de manipulador movil: genera acciones de 20 dimensiones (posiciones articulares o comandos de movimiento) a partir de observaciones visuales y de estado.
- Percepcion multimodal: procesa dos flujos de camara (cabeza y mano izquierda) a resolucion 480x640, junto con el estado del robot.
- Ejecucion de tareas de manipulacion aprendidas por imitacion: la tarea entrenada es "lanzar una botella de plastico a la papelera" en un entorno domestico real.
- Inferencia en tiempo real: al ser un modelo compacto, puede ejecutarse en hardware de consumo con latencia adecuada para control robotico (aunque no se proporcionan mediciones concretas).
- No soporta generacion de texto, tool calling, agentes conversacionales ni capacidades de lenguaje general: es una politica puramente sensorimotora.

## Casos de uso

- Automatizacion de tareas domesticas: el modelo puede integrarse en un robot SOBIT HOME para realizar tareas de recogida y deposito de objetos (como botellas) en contenedores, reduciendo la carga de trabajo en hogares o entornos asistenciales.
- Investigacion en aprendizaje por imitacion: sirve como punto de partida para estudiar el efecto del numero de pasos de entrenamiento (este checkpoint de 30 000 pasos puede compararse con el final de 90 000 pasos para analizar curvas de aprendizaje).
- Desarrollo de politicas roboticas de bajo coste: al requerir menos recursos que modelos VLA grandes, permite a laboratorios con GPUs modestas entrenar y desplegar politicas de manipulacion.
- Robotica asistencial: la tarea de tirar residuos puede adaptarse a entornos de cuidado de personas mayores o con movilidad reducida, donde un robot autonomo gestione pequenas tareas de limpieza.
- Benchmark de generalizacion: el modelo puede evaluarse en variaciones de la tarea (diferentes posiciones de la botella, distinta iluminacion) para medir robustez.
- Integracion en pipelines de robotica con LeRobot: al seguir el formato estandar de LeRobot, puede combinarse con otros modulos del ecosistema (grabacion de datos, evaluacion, despliegue) sin modificaciones adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion en robot real para esta politica.

## Requisitos de hardware

- VRAM estimada: no disponible en la informacion proporcionada. Como referencia, SmolVLA base (~450M parametros) puede ejecutarse en GPUs con 8-12 GB de VRAM en precision FP16, pero no se confirma para este checkpoint concreto.
- GPU recomendadas: no se especifican. Por el tamano del modelo, una RTX 3060/4060 (12 GB) o superior deberia ser suficiente para inferencia; para entrenamiento, una RTX 4090 o A100 seria adecuada.
- Compatibilidad con GPU de consumo: probablemente si, dado el diseno de SmolVLA orientado a hardware de consumo, pero sin confirmacion oficial.
- Opciones de despliegue: LeRobot (via `lerobot-rollout`), compatible con el ecosistema Hugging Face. No se mencionan vLLM, llama.cpp ni Ollama (no aplican a modelos de robotica).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos para este checkpoint. Como referencia cualitativa:

| Modelo | Parametros | Contexto | Tarea | Licencia |
|---|---|---|---|---|
| SmolVLA (este) | ~450M | no disponible | Manipulacion robotica | Apache 2.0 |
| OpenVLA | 7B | no disponible | Manipulacion robotica general | MIT |
| RT-2 (Google) | 55B | no disponible | Manipulacion robotica general | propietaria |

No se puede establecer una comparativa cuantitativa sin datos de benchmarks comunes.

## Limitaciones y advertencias

- Checkpoint intermedio: este modelo corresponde al paso 30 000 de un entrenamiento de 90 000 pasos; el rendimiento puede ser inferior al del modelo final publicado por el mismo autor.
- Sin evaluacion reportada: no hay datos de tasa de exito en robot real, por lo que su fiabilidad en produccion es desconocida.
- Tarea muy especifica: el modelo solo ha sido entrenado para "lanzar una botella de plastico a la papelera" en un entorno concreto (SOBIT HOME); no generaliza a otras tareas u objetos sin fine-tuning adicional.
- Dependencia de la configuracion del robot: las observaciones y acciones estan ligadas a la cinematica y camaras del manipulador SOBIT HOME; usarlo en otro robot requiere reentrenamiento o adaptacion.
- Riesgo de sobreajuste: con solo 100 episodios, el modelo puede memorizar posiciones o condiciones especificas del dataset de entrenamiento.
- Sin capacidades de lenguaje: a diferencia de otros VLA, este checkpoint no procesa instrucciones de texto; la tarea esta fijada en el entrenamiento.
- Sesgos y alucinaciones: al ser un modelo de control motor, no aplican sesgos linguisticos, pero si puede presentar comportamientos impredecibles ante estados no vistos (por ejemplo, obstaculos inesperados).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/team-sobits/sobit_home_left_real-pnp_tea_trash_big-abs-100-smolvla_fft-30000
- Modelo final (90 000 pasos): https://huggingface.co/team-sobits/sobit_home_left_real-pnp_tea_trash_big-abs-100-smolvla_fft-90000
- Dataset de entrenamiento: https://huggingface.co/datasets/team-sobits/sobit_home_left_real-pnp_tea_trash_big-abs-100
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot para SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Organizacion SOBITS en GitHub: https://github.com/TeamSOBITS
- Repositorio del robot SOBIT HOME: https://github.com/TeamSOBITS/sobit_home
