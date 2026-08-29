# terrencebfu/ndemo_smolvla_test

## Resumen

El modelo `terrencebfu/ndemo_smolvla_test` es un ajuste fino (fine-tuning) del modelo base `lerobot/smolvla_base`, un vision-language-action (VLA) compacto de 450 millones de parámetros desarrollado por Hugging Face. Este modelo concreto ha sido entrenado por el usuario terrencebfu sobre el dataset `ndemo` para realizar dos tareas robóticas específicas: calentar un ala de pollo y verter agua. Se trata de un modelo de prueba (el entrenamiento consta de solo 2 pasos) orientado a validar el flujo de trabajo de LeRobot con SmolVLA.

SmolVLA está diseñado para ser eficiente y desplegable en hardware de consumo, a diferencia de otros VLA de gran tamaño. Combina un modelo de lenguaje y visión (VLM) preentrenado con un experto de acciones entrenado mediante flow matching, lo que permite generar secuencias de acciones a partir de observaciones visuales y una instrucción en lenguaje natural. Este modelo en particular está pensado para un robot tipo `so_follower` con tres cámaras frontales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) con VLM compacto y experto de acciones con flow matching |
| Parametros totales | 450.046.176 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible (probablemente inglés, no especificado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA se compone de un modelo de lenguaje y visión (VLM) preentrenado y compacto, junto con un experto de acciones entrenado con flow matching. Dadas una o varias imágenes y una instrucción en lenguaje natural, el modelo genera un chunk de acciones (secuencia de comandos motores). En este caso, el modelo base `lerobot/smolvla_base` ha sido ajustado con el dataset `ndemo`, que contiene 198 episodios y 131.124 fotogramas a 30 FPS, con las tareas "heat chicken wing" y "pour water". El entrenamiento se realizó con 2 pasos, batch size 1, optimizador AdamW, learning rate 0.0001 y semilla 1000, usando la librería LeRobot versión 0.6.1. Al ser un ajuste de prueba, no se aplicaron técnicas como RLHF o DPO; el proceso es de imitación supervisada.

## Capacidades

- Generación de acciones robóticas (6 dimensiones) a partir de observaciones de estado y tres imágenes de cámaras (256x256 cada una).
- Ejecución de tareas de manipulación específicas: calentar un ala de pollo y verter agua.
- Control de un robot tipo `so_follower` (robot seguidor) con cámaras frontales.
- Integración con el ecosistema LeRobot para entrenamiento y despliegue.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de audio o texto general.

## Casos de uso

- Aprendizaje por imitación en robótica: el modelo puede servir como punto de partida para investigar cómo ajustar SmolVLA a tareas domésticas concretas, dado su pequeño tamaño y bajo coste de entrenamiento.
- Despliegue de políticas robóticas en hardware de consumo: gracias a sus 450M parámetros, es viable ejecutarlo en GPUs de gama media, lo que permite probar control robótico en laboratorios con recursos limitados.
- Validación de pipelines de LeRobot: este modelo de prueba es útil para verificar el flujo completo de grabación de datos, entrenamiento y rollout con SmolVLA antes de escalar a datasets mayores.
- Investigación en eficiencia de VLA: al ser un ajuste mínimo, permite estudiar el impacto del número de pasos de entrenamiento en el rendimiento de tareas robóticas.
- Automatización de tareas de cocina en entornos controlados: las tareas "heat chicken wing" y "pour water" son representativas de manipulación con objetos deformables y líquidos, útiles para probar robustez.
- Benchmarking de hardware: al ser un modelo pequeño, se puede usar para medir latencia y throughput de inferencia en diferentes GPUs y plataformas de despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación en robot real.

## Requisitos de hardware

- Al tratarse de un modelo de 450M parámetros, el peso en FP32 es de aproximadamente 1,8 GB y en FP16 de unos 0,9 GB, por lo que es plausible ejecutarlo en GPUs de consumo con al menos 4 GB de VRAM, aunque no se proporcionan datos oficiales de VRAM.
- El paper de SmolVLA menciona que el modelo está diseñado para hardware de consumo, pero no se especifican GPUs concretas en la información disponible.
- Opciones de despliegue: el modelo se integra con LeRobot, que soporta inferencia mediante `lerobot-rollout`. No se mencionan vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje generativo estándar.
- No se dispone de datos de latencia o throughput para este ajuste concreto.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros VLA en la información proporcionada. SmolVLA se posiciona como una alternativa compacta a modelos como OpenVLA (7B parámetros) o RT-2, pero no hay datos de rendimiento comparativo en este repositorio. Se recomienda consultar el paper original para una comparación detallada.

## Limitaciones y advertencias

- El modelo ha sido entrenado con solo 2 pasos, por lo que no es un modelo productivo; es un artefacto de prueba y su rendimiento en tareas reales no ha sido evaluado.
- El dataset de entrenamiento es limitado (198 episodios, dos tareas) y puede no generalizar a otras tareas o entornos.
- No se han reportado resultados de evaluación en robot real, por lo que no hay evidencia de éxito en despliegue físico.
- Los idiomas soportados no están documentados; es probable que el modelo solo entienda instrucciones en inglés, pero no se confirma.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y el dataset `ndemo` pueden tener sus propias restricciones; se debe verificar la licencia del dataset.
- Al ser un VLA, no es adecuado para tareas de generación de texto o conversación; su salida son acciones robóticas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/terrencebfu/ndemo_smolvla_test
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper SmolVLA: https://arxiv.org/abs/2506.01844
- Blog de Hugging Face sobre SmolVLA: https://huggingface.co/blog/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
