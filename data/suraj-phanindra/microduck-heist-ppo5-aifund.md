# suraj-phanindra/microduck-heist-ppo5-aifund

## Resumen

Microduck-heist-ppo5-aifund es una política de control motriz entrenada mediante aprendizaje por refuerzo (PPO) para el robot cuadrúpedo de código abierto MicroDuck de Pollen Robotics. No es un modelo de lenguaje: es un policy de locomoción que consume observaciones de 61 dimensiones y emite 14 acciones de control a 50 Hz, empaquetado en formato ONNX para su ejecución directa en el robot. El autor, suraj-phanindra, lo publica como un fine-tune del checkpoint de referencia `pollen-robotics/microduck-sock-heist-6m-reference`, orientado a la tarea de simulación "Sock Heist" de 6 millones de pasos.

La relevancia de esta ficha es acotada: se trata de un artefacto experimental con cero descargas y cero likes en el momento de la consulta, sin licencia declarada y sin resultados de benchmarks publicados. Su interés reside en que ejemplifica el flujo de trabajo actual de la robótica open source basada en simulación (mjlab) y despliegue de políticas en hardware real mediante el daemon `robotctl` del ecosistema MicroDuck.

El modelo se distribuye como una política perpetua: una marcha que se ejecuta de forma continua hasta que se le indique lo contrario, cargada en una ranura de política del robot. El repositorio ocupa 0.0 GB, lo que sugiere un artefacto de muy pequeño tamaño, coherente con una red neuronal de control compacta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de RL para control robótico; red neuronal de control motriz) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) y `manifest.json` (esquema 2 del manifiesto de políticas microduck) |

Especificaciones adicionales del dominio robótico:

| Parametro | Valor |
|---|---|
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Frecuencia de control | 50 Hz |
| Tipo de politica | perpetua (gait continuo) |
| Algoritmo de entrenamiento | PPO |
| Checkpoint | 3000 |
| Semilla | 2 |
| Base de entrenamiento | mjlab-microduck 0.1.0 @ 1efd853be |
| Task ID | Mjlab-SockHeist6m-MicroDuck |
| Normalizador de observaciones | integrado en `policy.onnx` (se alimenta con observaciones en crudo) |

## Arquitectura y entrenamiento

La información disponible no detalla la topología interna de la red (número de capas, anchura, funciones de activación). Se sabe que es una política entrenada con PPO (Proximal Policy Optimization) sobre el simulador mjlab, en la versión `mjlab-microduck 0.1.0` en el commit `1efd853be`. El entrenamiento se realizó sobre la tarea `Mjlab-SockHeist6m-MicroDuck`, con checkpoint 3000 y semilla 2, y arrancó el 12 de noviembre de 2026 a las 22:08 UTC. El modelo parte del checkpoint de referencia `pollen-robotics/microduck-sock-heist-6m-reference`, sobre el que se aplica un fine-tune.

Una innovación práctica destacable es que el normalizador de observaciones está embebido dentro del propio `policy.onnx`: el consumidor debe alimentar observaciones en crudo sin preprocesar, lo que reduce errores de integración y desacopla el despliegue del código de entrenamiento. El artefacto sigue el esquema 2 del manifiesto de políticas del daemon MicroDuck (`docs/policy-manifest.md` en el repositorio del daemon), lo que permite cargarlo en una ranura de política mediante el comando `robotctl policy load <slot> suraj-phanindra/microduck-heist-ppo5-aifund`. No se dispone de información sobre composición del dataset, número de pasos de entorno, recompensas, técnicas de domain randomization ni procesos de RLHF/DPO (no aplicables en este dominio).

## Capacidades

- Control motriz de locomoción del robot MicroDuck: genera una marcha continua a partir de observaciones de 61 dimensiones y produce 14 acciones de control a 50 Hz.
- Política perpetua: mantiene la marcha indefinidamente hasta que se detiene o se sustituye la política en la ranura correspondiente.
- Inferencia en formato ONNX, ejecutable en el runtime del robot sin dependencias del framework de entrenamiento.
- Normalización de observaciones integrada en el grafo ONNX, lo que simplifica la integración en el daemon.
- Compatibilidad con el sistema de ranuras de política del daemon MicroDuck mediante manifiesto de esquema 2.
- No soporta tool calling, function calling, razonamiento multi-paso, generación de texto, visión, audio ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Locomoción base del MicroDuck en laboratorio: cargar la política en una ranura con `robotctl policy load` y usar la marcha perpetua como punto de partida para experimentos de control y comparación de políticas.
- Evaluación de fine-tuning sobre el checkpoint de referencia: sirve como artefacto de comparación frente a `microduck-sock-heist-6m-reference` para medir el efecto del fine-tune con semilla 2 y checkpoint 3000.
- Docencia en robótica con refuerzo: ejemplo reproducible de un pipeline completo simulación (mjlab) a hardware (MicroDuck) usando PPO y exportación a ONNX.
- Pruebas de integración del daemon: validar el flujo de manifiestos de esquema 2 y la carga de políticas en ranuras en entornos de desarrollo.
- Benchmarking interno de gait: comparar estabilidad y comportamiento de la marcha frente a otras políticas del mismo robot en un entorno controlado.
- Base para nuevas iteraciones de entrenamiento: al ser un fine-tune documentado con semilla y checkpoint, puede reutilizarse como inicialización para experimentos posteriores de RL sobre la misma tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de recompensa, tasas de éxito, estabilidad de la marcha ni comparaciones cuantitativas con el checkpoint de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0.0 GB, lo que sugiere un modelo de control muy pequeño que probablemente se ejecuta en CPU.
- GPU recomendadas: no disponible; por la naturaleza del artefacto (política de control a 50 Hz en ONNX), es previsible que se ejecute en el ordenador de a bordo del MicroDuck sin GPU dedicada, aunque este dato no está confirmado en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: runtime ONNX a través del daemon MicroDuck (`robotctl`); no se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; el requisito funcional es sostener 50 Hz de control, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Tipo | Observacion / accion | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| suraj-phanindra/microduck-heist-ppo5-aifund | Política RL (PPO), fine-tune | 61 / 14 | 50 Hz | no disponible | Hugging Face, 0 descargas |
| pollen-robotics/microduck-sock-heist-6m-reference | Política RL de referencia | no disponible en la información | no disponible | no disponible | Hugging Face (modelo base) |
| Otras políticas del ecosistema MicroDuck | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparables entre estas políticas; la comparativa se limita a la relación de fine-tune declarada (`base_model_relation: finetune`) respecto al checkpoint de referencia de Pollen Robotics.

## Limitaciones y advertencias

- Ausencia de licencia declarada: no se especifican términos de uso, lo que impide confirmar si el uso comercial está permitido.
- Sin métricas publicadas: no hay evidencia cuantitativa de robustez, estabilidad ni tasa de éxito de la marcha.
- Cero descargas y cero likes: no existe validación por parte de la comunidad en el momento de la consulta.
- Específico de hardware: la política está entrenada para el MicroDuck concreto (61 observaciones, 14 acciones, 50 Hz); no es transferible a otros robots sin reentrenamiento.
- Riesgo de sobreajuste al simulador: al entrenarse en mjlab, puede sufrir la brecha simulación-real (sim-to-real gap) si no se aplicó domain randomization, extremo que no se documenta.
- Reproducibilidad parcial: se documentan semilla, checkpoint y commit de la base de entrenamiento, pero no la configuración completa de PPO ni la recompensa.
- Sin soporte de lenguaje, visión ni audio: no debe evaluarse con criterios de modelos generativos.
- Fecha de creación futura respecto a la consulta (2026-11-14): conviene verificar la vigencia y posibles actualizaciones del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/suraj-phanindra/microduck-heist-ppo5-aifund
- Modelo base: https://huggingface.co/pollen-robotics/microduck-sock-heist-6m-reference
- Repositorio del robot MicroDuck: https://github.com/pollen-robotics/microduck
