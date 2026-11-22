# tdesc/microduck-quack-sonata

## Resumen

`microduck-quack-sonata` es una política de control motriz entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de código abierto microduck, desarrollado por Pollen Robotics. No se trata de un modelo de lenguaje, sino de una policy de locomoción que mapea observaciones de 61 dimensiones (estado de sensores y articulaciones) a 14 acciones de control a 50 Hz. La publica el usuario `tdesc` bajo el paraguas del proyecto `microduck-challenges`, y su función es proporcionar una marcha perpetua que el robot ejecuta de forma continua hasta recibir una orden de parada.

El modelo se distribuye en formato ONNX con la normalización de observaciones integrada en el propio grafo (`policy.onnx`), de modo que el consumidor solo tiene que alimentar observaciones en crudo. Se acompaña de un `manifest.json` conforme al esquema 2 del manifiesto de políticas de microduck, pensado para cargarse directamente en el daemon del robot mediante `robotctl`.

Es relevante porque ejemplifica el flujo de trabajo completo de robótica con RL reproducible: entrenamiento con mjlab (simulador basado en MuJoCo), un `task_id` concreto, semilla fija y un repositorio de retos público que permite regenerar una política comparable. La información publicada es, sin embargo, mínima: el repositorio ocupa 0.0 GB y no hay datos de benchmarks, licencia ni idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de RL para control robótico (red neuronal exportada a ONNX); topología interna no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; observación de 61 dimensiones por paso |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX, presumiblemente FP32) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2) |
| Frecuencia de control | 50 Hz |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Tipo de política | perpetua (se ejecuta hasta recibir orden de parada) |

## Arquitectura y entrenamiento

La política se entrenó con mjlab versión 0.1.0 (commit `1efd853be`), un entorno de simulación física basado en MuJoCo, sobre la tarea `Mjlab-GotATalent-MicroDuck`. El proceso de entrenamiento utilizó 512 entornos paralelos, un máximo de 750 iteraciones del agente, semilla 1 y arranque en caliente desde un checkpoint previo (`model_ref.pt` del run `warmstart_ref`). El registro se hizo con TensorBoard bajo el nombre de run `tal_ws`. El código y el `uv.lock` están fijados en el commit `f2f183853` del repositorio `tdesc/microduck-challenges`.

La arquitectura interna de la red (número de capas, anchura, tipo de MLP u otro) no se detalla en la model card; solo se especifica el contrato de entrada/salida (61 observaciones, 14 acciones, 50 Hz) y que el normalizador de observaciones está embebido en el grafo ONNX. El autor advierte explícitamente de que el entrenamiento con RL sobre GPU no es bit-reproducible entre máquinas: repetir el pipeline con la misma semilla produce una política comparable, no idéntica.

## Capacidades

- Locomoción continua del robot microduck: genera una marcha perpetua que se mantiene activa hasta que se le indica lo contrario.
- Control de 14 actuadores a partir de 61 señales de observación a 50 Hz.
- Inferencia autocontenida: el normalizador está integrado en `policy.onnx`, por lo que acepta observaciones en crudo sin preprocesado externo.
- Integración con el daemon del robot mediante `robotctl policy load`, cargándola en un slot de política.
- Compatibilidad con el manifiesto de políticas de microduck (esquema 2), lo que facilita su despliegue y versionado.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es una política de control motriz, no un modelo generativo.

## Casos de uso

- **Marcha por defecto del microduck**: cargar la política en un slot con `robotctl policy load` y dejar que el robot camine de forma continua; es su propósito declarado y el escenario para el que fue entrenada.
- **Prototipado de comportamientos sobre una base estable**: usar esta política perpetua como capa de locomoción y superponer capas de decisión de alto nivel (navegación, seguimiento de waypoints) que actúen sobre las 14 acciones o sobre el ciclo de marcha.
- **Validación de la cadena de despliegue**: probar el pipeline completo de microduck (entrenamiento en mjlab, exportación a ONNX, manifiesto, carga en el daemon) con una política ya publicada antes de entrenar las propias.
- **Reproducción y comparación de experimentos de RL**: servir de referencia frente a la que se obtenga al reejecutar el comando de entrenamiento documentado con la misma semilla, para estudiar la variabilidad entre máquinas.
- **Docencia e investigación en robótica con RL**: ejemplo mínimo y reproducible (512 entornos, 750 iteraciones, semilla fija) para ilustrar el ciclo sim-a-real en un cuadrúpedo de bajo coste.
- **Banco de pruebas de hardware**: verificar sensores y actuadores del microduck comparando la marcha observada con la esperada de una política conocida, útil en tareas de mantenimiento o calibración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible; al ser una política de control de 61 entradas y 14 salidas exportada a ONNX, la huella es previsiblemente mínima, pero el tamaño del repo figura como 0.0 GB y no se detalla el número de parámetros.
- **GPU recomendadas**: no disponible. La inferencia a 50 Hz de una política de este tipo es viable en CPU; para el entrenamiento, el comando documentado usa `--gpu-ids None` y 512 entornos en paralelo, lo que sugiere ejecución en CPU o en un acelerador no especificado.
- **¿Cabe en GPU de consumo?**: no disponible con datos publicados; por la naturaleza del modelo (política de control, no LLM), es esperable que sí, pero no se confirma en la información.
- **Opciones de despliegue**: ONNX Runtime a través del daemon de microduck (`robotctl policy load <slot> tdesc/microduck-quack-sonata`). No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- **Latencia y throughput**: el contrato exige 50 Hz (20 ms por paso de control); no se publican medidas reales de latencia ni de throughput.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas para microduck ni datos de rendimiento que permitan una comparación con alternativas de la misma categoría.

## Limitaciones y advertencias

- **Licencia no especificada**: no se indica licencia en la model card ni en los metadatos de Hugging Face, por lo que el uso comercial queda sin marco legal claro hasta que el autor lo aclare.
- **Sin datos de rendimiento**: no hay benchmarks, métricas de recompensa ni tasas de éxito en simulación o en robot real; no es posible evaluar su calidad frente a otras políticas.
- **Reproducibilidad limitada**: el propio autor advierte de que el entrenamiento con RL en GPU no es bit-reproducible; los pesos publicados no se pueden regenerar de forma idéntica.
- **Alcance restringido**: es una política perpetua de marcha; no incorpora percepción, planificación ni capacidades de razonamiento. Cualquier comportamiento más complejo requiere capas adicionales.
- **Dependencia del hardware y del daemon**: el contrato de 61 observaciones y 14 acciones está atado a la plataforma microduck y al esquema 2 del manifiesto; cambios de firmware o de calibración pueden invalidar la política.
- **Riesgo en robot físico**: al ser una política entrenada en simulación, puede presentar comportamientos inseguros ante condiciones no vistas (terrenos irregulares, cargas, fallos de sensores); se recomienda supervisión durante las primeras ejecuciones.
- **Sesgos y alucinación**: no aplica en el sentido habitual de modelos de lenguaje; el riesgo equivalente es una marcha inestable o no generalizable fuera de las condiciones de entrenamiento.
- **Metadatos incompletos**: sin idiomas, sin licencia, sin número de parámetros y con un tamaño de repo de 0.0 GB, la ficha no permite una evaluación técnica profunda.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tdesc/microduck-quack-sonata
- Repositorio de retos y entrenamiento: https://github.com/tdesc/microduck-challenges
- Proyecto microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
