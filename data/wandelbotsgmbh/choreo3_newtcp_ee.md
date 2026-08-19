# wandelbotsgmbh/choreo3_newtcp_ee

## Resumen

El modelo `wandelbotsgmbh/choreo3_newtcp_ee` es una política de control robótico basada en el método Action Chunking with Transformers (ACT), desarrollada por Wandelbots GmbH, empresa especializada en automatización industrial definida por software. El modelo ha sido entrenado mediante aprendizaje por imitación a partir de datos teleoperados del dataset `wandelbotsgmbh/choreo3_newtcp`, y se distribuye a través de la librería LeRobot de Hugging Face. Su propósito es predecir secuencias cortas de acciones (chunks) para controlar un efector final robótico, lo que permite ejecutar tareas de manipulación con alta precisión y suavidad.

Con 51,6 millones de parámetros, el modelo es compacto y adecuado para su despliegue en sistemas embebidos o con recursos limitados. Su arquitectura transformer procesa observaciones del entorno (imágenes y estados del robot) y genera comandos de acción para varios pasos futuros, lo que reduce la frecuencia de inferencia necesaria y mejora la estabilidad del movimiento. Aunque no se especifican datos de contexto ni idiomas (al ser un modelo puramente robótico), su relevancia actual radica en la creciente adopción de técnicas de imitación para automatizar tareas industriales sin programación explícita.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.623.559 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de robótica, no procesa texto) |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura ACT, propuesta en el paper "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware" (arXiv:2304.13705). ACT combina un encoder transformer que procesa observaciones visuales y estados del robot con un decoder autorregresivo que genera un chunk de acciones (por ejemplo, posiciones del efector final) para un horizonte temporal fijo. Esta predicción por lotes reduce la acumulación de errores y permite movimientos más fluidos en comparación con políticas que predicen una sola acción por paso.

El entrenamiento se realizó mediante aprendizaje por imitación supervisado sobre datos teleoperados del dataset `wandelbotsgmbh/choreo3_newtcp`, que contiene demostraciones de tareas de manipulación con el robot. No se menciona el uso de RLHF ni DPO; el método es puramente de imitación. La librería LeRobot se utilizó tanto para el entrenamiento como para el registro de episodios de evaluación, facilitando la reproducibilidad del pipeline.

## Capacidades

- Control de efector final robótico: genera comandos de posición y orientación para el robot, basándose en observaciones de cámara y estados articulares.
- Aprendizaje por imitación: reproduce comportamientos demostrados por un operador humano mediante teleoperación.
- Predicción de chunks de acciones: emite secuencias de acciones de longitud fija, lo que mejora la estabilidad del movimiento y reduce la frecuencia de inferencia.
- Integración con LeRobot: compatible con el ecosistema de LeRobot para entrenamiento, evaluación y despliegue en robots reales o simulados.
- Bajo coste computacional: al tener solo 51,6M de parámetros, puede ejecutarse en hardware modesto, incluyendo GPUs de gama baja o incluso CPU en tiempo real.
- Sin capacidades de lenguaje: el modelo no procesa texto ni admite tool calling, agentes ni razonamiento multilingüe; su función está estrictamente limitada al control motor.

## Casos de uso

- Manipulación industrial pick-and-place: el modelo puede controlar un brazo robótico para recoger piezas de una cinta transportadora y colocarlas en una posición determinada, gracias a su capacidad de predecir trayectorias suaves a partir de demostraciones.
- Ensamblaje de componentes pequeños: en líneas de montaje, el robot puede insertar tornillos o conectores siguiendo los movimientos aprendidos de un operador, reduciendo la necesidad de programación explícita.
- Inspección visual con movimiento activo: el efector final puede desplazarse a puntos de interés para capturar imágenes de piezas, combinando control de posición con criterios de calidad predefinidos.
- Automatización de tareas repetitivas en laboratorios: por ejemplo, pipeteo o manipulación de placas de cultivo, donde la precisión y la repetibilidad son críticas.
- Pruebas de concepto en robótica educativa: investigadores y estudiantes pueden utilizar el modelo como base para experimentar con aprendizaje por imitación en plataformas como SO-100 o similares, gracias a la integración con LeRobot.
- Adaptación a nuevas tareas mediante fine-tuning: partiendo de este checkpoint, es posible reentrenar la política con un pequeño conjunto de demostraciones para tareas específicas, acelerando el desarrollo de soluciones robóticas personalizadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo card no incluye métricas como tasa de éxito en tareas concretas, ni comparaciones con otras políticas. Tampoco se proporcionan datos de latencia o throughput de inferencia.

## Requisitos de hardware

- VRAM estimada para inferencia: con 51,6M de parámetros en precisión FP32, el modelo ocupa aproximadamente 206 MB de memoria. En FP16, unos 103 MB. Por tanto, cualquier GPU con al menos 1 GB de VRAM es suficiente.
- GPU recomendadas: cualquier GPU moderna, desde una NVIDIA GTX 1650 (4 GB) hasta una RTX 4090, aunque no se requiere alta capacidad. También es viable su ejecución en CPU con un rendimiento aceptable para inferencia en tiempo real.
- Compatibilidad con consumer GPU: sí, cabe en todas las GPUs de consumo actuales.
- Opciones de despliegue: LeRobot proporciona scripts para entrenamiento y evaluación (`lerobot-train`, `lerobot-record`). El modelo puede cargarse desde Hugging Face Hub mediante la librería `lerobot`. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles, pero dado el tamaño del modelo, la inferencia en GPU debería ser del orden de milisegundos por chunk de acciones.

## Comparativa con modelos similares

No se dispone de información pública sobre otros modelos ACT específicos para el mismo dataset o tarea. Existen numerosos checkpoints de ACT en Hugging Face Hub entrenados con LeRobot (por ejemplo, en la organización `lerobot`), pero sus parámetros y rendimiento varían. Sin datos concretos de benchmarks, no es posible realizar una comparación cuantitativa. Se recomienda consultar el Hub para encontrar políticas alternativas y evaluarlas en el mismo entorno de simulación o robot físico.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo entrenado con datos teleoperados, puede heredar los sesgos del operador en cuanto a estilo de movimiento o preferencias de trayectoria.
- Riesgo de alucinación: no aplica, ya que no genera texto ni contenido simbólico; sin embargo, puede producir acciones erróneas si las observaciones difieren significativamente de los datos de entrenamiento.
- Limitaciones de contexto: el modelo no tiene memoria de largo plazo más allá del chunk de acciones actual; no es adecuado para tareas que requieran razonamiento temporal extenso o planificación jerárquica.
- Limitaciones de idioma: no aplica, el modelo no procesa lenguaje.
- Restricciones de licencia: Apache-2.0 permite uso comercial, modificación y distribución, siempre que se incluya el aviso de licencia. No hay restricciones adicionales conocidas.
- Caveat para producción: el modelo está entrenado para un robot y una configuración de cámara específicos (dataset `choreo3_newtcp`). Su transferencia a otro hardware o entorno requiere reentrenamiento o fine-tuning. Además, la robustez ante perturbaciones externas (cambios de iluminación, oclusiones) no está garantizada sin evaluación adicional.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/wandelbotsgmbh/choreo3_newtcp_ee)
- [Paper de ACT (arXiv:2304.13705)](https://huggingface.co/papers/2304.13705)
- [LeRobot (GitHub)](https://github.com/huggingface/lerobot)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Perfil de Wandelbots en Hugging Face](https://huggingface.co/wandelbotsgmbh)
- [Sitio web de Wandelbots](https://www.wandelbots.com/)
