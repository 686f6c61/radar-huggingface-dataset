# yanshi-robotics/anima-one-g1-29dof

## Resumen

Anima One G1 29-DoF es un policy de control por aprendizaje por refuerzo (RL) para el robot humanoide Unitree G1, desarrollado por Yanshi Robotics (Yanshi RL Lab). El artefacto publicado es un modelo ONNX que genera comandos de posición para las 29 articulaciones del robot a partir de observaciones del estado, con el objetivo de ejecutar locomoción en terreno plano con seguimiento de velocidad. Se distribuye bajo licencia MIT como parte del proyecto open-source Anima One, que unifica entrenamiento, evaluación y operación del robot en un entorno virtual llamado APT.

El modelo resuelve el problema de control de bajo nivel para la marcha bípeda, un desafío clásico en robótica humanoide. Su relevancia radica en ser un artefacto reproducible y verificable: se incluyen hashes SHA256, un contrato de despliegue y evidencia de evaluación en simulador MuJoCo. Aunque no se especifican los parámetros totales de la red, el formato ONNX permite ejecución eficiente con ONNX Runtime en CPU, y el checkpoint original en PyTorch está disponible para inspección (con advertencias de seguridad). La ventana de observación es de cinco frames (480 valores) y el periodo de política es de 20 ms.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal (tipo MLP, no especificada) entrenada con RL, exportada a ONNX |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (policy de control; ventana de observación de 5 frames, 480 valores) |
| Tipos de cuantizacion | No disponible (solo se distribuye ONNX sin cuantización explícita) |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | ONNX (policy.onnx) y checkpoint PyTorch (model_9999.pt) |

## Arquitectura y entrenamiento

El modelo es un policy de control entrenado mediante aprendizaje por refuerzo en el simulador MuJoCo. La arquitectura concreta (número de capas, neuronas, tipo de activación) no se documenta en la información proporcionada. Se sabe que la entrada es un vector de 480 observaciones que incluye cinco frames de historia (probablemente posiciones articulares, velocidades, orientación del torso y comandos de velocidad). La salida son 29 offsets de posición articular que se aplican al robot.

El entrenamiento se realizó en un entorno simulado de confianza (trusted-environment) y el checkpoint `model_9999.pt` es el resultado final. No se especifica el algoritmo de RL (probablemente PPO o similar), ni el número de tokens o episodios de entrenamiento. El artefacto ONNX se generó a partir de ese checkpoint y fue verificado contra cuatro gates de MuJoCo del proyecto Anima One, sin activar el veto de contacto por pie. Esta verificación es una re-validación del artefacto existente, no un reentrenamiento completo, y no establece rendimiento sim2real.

## Capacidades

- Control de locomoción en terreno plano con seguimiento de velocidad para el robot Unitree G1.
- Generación de comandos de posición articular (29 grados de libertad) a una frecuencia de 50 Hz (periodo de política de 0.02 s).
- Procesamiento de observaciones con historial de 5 frames (480 valores) para decisiones robustas.
- Ejecución en tiempo real con ONNX Runtime en CPU (verificado en las gates de MuJoCo).
- Compatibilidad con el ecosistema de simulación MuJoCo y el stack Anima One.
- No incluye capacidades de visión, audio, lenguaje ni razonamiento simbólico.

## Casos de uso

- Despliegue en el robot Unitree G1 para caminar en superficies planas: el policy genera comandos articulares en tiempo real a partir de la lectura de sensores, permitiendo que el robot mantenga una velocidad deseada.
- Investigación en RL para robótica humanoide: sirve como baseline reproducible para comparar algoritmos de control o métodos de sim2real.
- Evaluación de políticas en simulación: el artefacto ONNX puede integrarse en pipelines de MuJoCo para validar comportamiento en entornos controlados.
- Integración en sistemas de navegación autónoma: combinado con un planificador de alto nivel, el policy ejecuta la marcha mientras el robot sigue una trayectoria.
- Benchmark para pruebas de robustez: los hashes y el contrato de despliegue permiten reproducir exactamente el mismo modelo en diferentes entornos.
- Educación en robótica y RL: el código abierto y la documentación facilitan el estudio de políticas de control para humanoides.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos en la información disponible. La única evidencia de rendimiento es la verificación en las cuatro gates de MuJoCo del proyecto Anima One, que se superaron en CPU sin activar el veto de contacto por pie. No se proporcionan métricas como velocidad máxima alcanzable, consumo energético, ni comparaciones con otros policies.

## Requisitos de hardware

- Inferencia en CPU: el artefacto ONNX fue verificado en CPU en las gates de MuJoCo, por lo que no requiere GPU para funcionar.
- VRAM: no aplica (no es un modelo de grandes dimensiones; se desconoce el tamaño exacto).
- GPU recomendada: no necesaria; aunque ONNX Runtime puede usar GPU si se desea acelerar, no hay requisitos documentados.
- Despliegue: se puede ejecutar con ONNX Runtime (C++ o Python) o integrarse en el stack Anima One con MuJoCo.
- Latencia: el periodo de política es de 20 ms, lo que implica que la inferencia debe completarse en menos de ese tiempo; no se especifica el throughput real, pero la verificación en CPU sugiere que es viable.
- Para entrenamiento o simulación extensiva, se recomienda una CPU moderna y, opcionalmente, GPU para acelerar MuJoCo.

## Comparativa con modelos similares

No se dispone de información sobre policies equivalentes para el Unitree G1 con los mismos detalles de arquitectura y rendimiento. Existen otros repositorios públicos como `jeffliulab/yanshi-unitree-g1-dof29` en Hugging Face, pero no se proporcionan datos comparativos (parámetros, contexto, benchmarks). La documentación de Unitree (`unitreerobotics/unitree_rl_lab`) describe configuraciones del G1 de 29 DoF, pero no se pueden extraer comparaciones numéricas. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El checkpoint `model_9999.pt` puede ejecutar código arbitrario al cargarse (pickle de Python); no debe abrirse fuera de un entorno confiable.
- La verificación se realizó solo en simulación (MuJoCo); no hay evidencia de rendimiento sim2real ni de seguridad en el robot físico.
- El modelo está diseñado exclusivamente para la tarea de locomoción en terreno plano; no es transferible a otras tareas sin reentrenamiento.
- La ventana de observación es fija (5 frames); cambios en la configuración de sensores requieren adaptación del modelo.
- No se especifican sesgos ni riesgos de alucinación, al no ser un modelo generativo de texto.
- La licencia MIT permite uso comercial, pero el usuario es responsable de la validación en su propio hardware y entorno.

## Enlaces

- HuggingFace: https://huggingface.co/yanshi-robotics/anima-one-g1-29dof
- GitHub del proyecto Anima One: https://github.com/Yanshi-Robotics/anima-one
- Repositorio relacionado (jeffliulab): https://huggingface.co/jeffliulab/yanshi-unitree-g1-dof29
- Documentación de Unitree sobre G1 29-DoF: https://deepwiki.com/unitreerobotics/unitree_rl_lab/6.3-g1-humanoid-(29-dof)
- Configuraciones del G1 en Unitree ROS: https://deepwiki.com/unitreerobotics/unitree_ros/2.1.3-g1-configuration-variants
