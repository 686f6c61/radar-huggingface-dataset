# Teethyfish/microduck-collision-flamingo-ii

## Resumen

Collision Flamingo II es una política de control para el robot bípedo Microduck, desarrollada por el usuario Teethyfish y publicada en Hugging Face. El modelo implementa un comportamiento de equilibrio sobre una sola pata (estilo flamenco), manteniendo el pie derecho elevado mientras la pierna izquierda actúa como soporte. Está entrenada mediante aprendizaje por refuerzo (RL) en simulación, utilizando un modelo de colisión de carcasa exterior completa descompuesto, una innovación técnica que permite considerar contactos en toda la superficie del robot durante el entrenamiento.

La política se distribuye en formato ONNX y está pensada como artefacto de investigación para el repositorio de entrenamiento `pollen-robotics/microduck_rl`. Sin embargo, presenta una limitación crítica documentada: el comportamiento observado solo se reproduce a través del visor ONNX seguro (`scripts/infer_policy.py`) con física nominal y sin aleatorización. No funciona con los visores nativos de entrenamiento ni con aleatorización, y nunca se ha probado en hardware real. Este artefacto es relevante como caso de estudio de reproducibilidad en RL para robótica, más que como una política lista para despliegue.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica de control (arquitectura de red no especificada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de control, no de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuye solo en ONNX) |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX |

Adicionalmente, el contrato de la política especifica:

- Entrada: `obs[1,61]` float32
- Salida: `actions[1,14]` float32
- Frecuencia de control: 50 Hz
- Escala de acción: 1.0 alrededor de la pose HOME de Microduck
- Normalizador de observaciones: integrado en el ONNX
- Bloque de comandos: `twist[3], head_pose[4], body_pose[6]`, todos cero en el caso validado
- Pose de entrada: de pie

## Arquitectura y entrenamiento

La arquitectura interna de la red no está documentada en la model card; se trata de una política de control entrenada con el algoritmo PPO mediante la librería `rsl-rl-lib 5.0.1`. El entrenamiento se realizó en el entorno `Mjlab-OneLegStandNoBall-Flat-MicroDuck` de mjlab, con 2048 entornos en paralelo, semilla 42, paso de física de 0.005 s y decimación de 4. El checkpoint exportado corresponde a `model_11500.pt`, reanudado desde `model_8750.pt`.

La innovación principal es el uso de un modelo de colisión de carcasa exterior completa descompuesto (`full exterior-shell collision model`), que amplía los buffers de contacto a `nconmax=200` y `contact_sensor_maxmatch=128`. Esto permite que la política tenga en cuenta contactos en toda la superficie del robot, no solo en puntos predefinidos. El entrenamiento se ejecutó con MuJoCo 3.10.0 y MuJoCo Warp 3.8.1, y el código fuente exacto (incluyendo el overlay de reproducción) se incluye en el repositorio.

## Capacidades

- Equilibrio sobre una pata (derecha levantada, izquierda como soporte) en simulación.
- Control de 14 articulaciones del robot Microduck.
- Recepción de observaciones de 61 dimensiones (velocidad angular, gravedad proyectada, posiciones y velocidades articulares, acciones previas y comandos).
- Funcionamiento exclusivamente a traves del visor ONNX seguro (`scripts/infer_policy.py`) con física nominal y sin aleatorización.
- No soporta aleatorización de entrenamiento, override de fricción, suavizado de contacto ni override de escala de acción.
- No se ha probado en hardware real; es un artefacto de simulacion.

## Casos de uso

- Investigacion en aprendizaje por refuerzo para robots bipedos: la politica sirve como referencia para estudiar el efecto de modelos de colision de cuerpo completo en el equilibrio dinamico.
- Evaluacion de reproducibilidad en RL: el hecho de que el comportamiento solo se observe en un visor especifico y no en otros es un caso documentado de discrepancia entre entornos de evaluacion.
- Desarrollo de tecnicas de simulacion a realidad (sim-to-real): aunque no se ha probado en hardware, la politica y su configuracion pueden usarse como punto de partida para investigar transferencia.
- Analisis de robustez frente a variaciones de contacto: el modelo de colision completa permite estudiar como la politica reacciona a contactos en distintas partes del robot.
- Generacion de datos de entrenamiento para politicas de mayor nivel: las observaciones y acciones pueden servir como base para entrenar controladores jerarquicos.
- Prueba de integracion de ONNX en pipelines de robotica: el visor seguro demuestra un flujo de despliegue reproducible con ONNX Runtime.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no existe una bateria de evaluacion cuantitativa para este checkpoint, y que el video incluido no debe interpretarse como una tasa de exito no verificada.

## Requisitos de hardware

- Inferencia ligera: entrada de 61 floats y salida de 14 floats a 50 Hz; probablemente ejecutable en CPU sin GPU dedicada.
- VRAM estimada: no disponible, pero al ser un modelo pequeno (politica MLP probablemente de pocas capas) cabria en cualquier GPU, incluso integradas.
- GPU recomendadas: no disponibles; se puede ejecutar con ONNX Runtime en CPU.
- Opciones de despliegue: ONNX Runtime, el script `scripts/infer_policy.py` del repositorio de entrenamiento con el overlay de reproduccion.
- Latencia y throughput: no disponibles; el control a 50 Hz sugiere que la inferencia debe completarse en menos de 20 ms.

## Comparativa con modelos similares

No se dispone de modelos comparables de politica de control para Microduck en la informacion proporcionada. No hay una comparativa publicada con otras politicas de equilibrio o con versiones anteriores de este mismo artefacto.

## Limitaciones y advertencias

- El comportamiento solo se observa a traves del visor ONNX seguro con fisica nominal y sin aleatorizacion; no se reproduce con los visores nativos (`uv run play --viewer native` o `--viewer viser`), discrepancia que el autor reconoce como parte del resultado.
- No se ha probado en hardware real; el autor advierte explicitamente que no debe desplegarse en un robot fisico sin revision independiente, pruebas controladas y procedimiento de parada de emergencia.
- No existe evaluacion cuantitativa de exito; el unico soporte visual es un video de ejemplo.
- La geometria de colision es especifica del simulador y no esta embebida en el ONNX; se requiere el overlay de reproduccion incluido en el repositorio.
- Licencia Apache-2.0 permite uso comercial, pero el artefacto es de investigacion y no esta validado para produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Teethyfish/microduck-collision-flamingo-ii
- Repositorio de entrenamiento microduck_rl: https://github.com/pollen-robotics/microduck_rl
- Repositorio del robot Microduck: https://github.com/pollen-robotics/microduck
- Pagina oficial de Microduck: https://pollen-robotics.com/microduck/
- Blog de introduccion a Microduck: https://pollen-robotics.com/microduck/blog/introducing-microduck/
