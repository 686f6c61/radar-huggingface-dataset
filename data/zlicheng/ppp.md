# zlicheng/PPP

## Resumen

PPP (Progress Predicts Policy) es un conjunto de modelos y recursos para robótica de manipulación entrenados mediante aprendizaje por imitación, publicado por el autor zlicheng bajo licencia Apache 2.0. El paquete incluye un modelo de mundo denominado LeWM, variantes de behavioral cloning (BC) basadas en dicho modelo de mundo, la propia política PPP (epoch 120), y los modelos Seer y Seer-PPP (epoch 50), junto con sus configuraciones de entrenamiento y resultados de evaluación en bucle cerrado sobre el benchmark LIBERO. El repositorio complementa al artículo "Progress Predicts Policy" y a la página del proyecto y el código alojados en zlicheng.com y GitHub respectivamente.

El modelo aborda el problema de aprender políticas de manipulación robótica a partir de demostraciones, apoyándose en un modelo de mundo (world model) que predice la evolución del entorno y en una señal de progreso que guía la política. Es relevante para investigadores que trabajan en imitation learning y world models aplicados a manipulación, dado que proporciona checkpoints reproducibles y resultados de referencia sobre LIBERO, un benchmark estándar de manipulación de horizonte largo.

No se dispone de información sobre arquitectura detallada, número de parámetros, longitud de contexto ni composición del dataset de entrenamiento más allá de que los datos procesados derivan de LIBERO. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere una publicación reciente (creada el 14 de noviembre de 2026) y de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (incluye un world model LeWM y políticas BC/PPP/Seer basadas en él) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de robótica, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (checkpoints en `checkpoints/`; se mencionan pesos MAE en `checkpoints/vit_mae/`) |

## Arquitectura y entrenamiento

La información disponible indica que el paquete contiene un modelo de mundo llamado LeWM, a partir del cual se derivan variantes de behavioral cloning (BC) y la política PPP, además de los modelos Seer y Seer-PPP. Los checkpoints incluyen sus configuraciones de entrenamiento y los resultados de evaluación en bucle cerrado sobre LIBERO. No se especifica el tipo de arquitectura (transformer, MoE, SSM, híbrido), el número de parámetros, la cantidad de tokens de entrenamiento ni si se emplearon técnicas como RLHF o DPO; al tratarse de un modelo de robótica, el entrenamiento es presumiblemente por imitación supervisada sobre demostraciones, pero este extremo no se detalla en la información proporcionada.

El repositorio incluye en `assets/` las demostraciones procesadas de LIBERO y las características de instrucción utilizadas por Seer. Los pesos MAE en `checkpoints/vit_mae/` provienen del repositorio oficial de MAE (Facebook Research) bajo licencia CC BY-NC 4.0, y los datos procesados derivan de LIBERO. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Manipulación robótica mediante aprendizaje por imitación: las políticas BC, PPP, Seer y Seer-PPP están entrenadas para ejecutar tareas de manipulación sobre el benchmark LIBERO.
- Modelado del mundo: LeWM proporciona un modelo de mundo que predice la dinámica del entorno, utilizado como base para las políticas.
- Predicción de progreso: la política PPP incorpora una señal de progreso que guía la ejecución de la tarea, según el título del artículo "Progress Predicts Policy".
- Evaluación en bucle cerrado: se incluyen resultados de evaluación cerrada sobre LIBERO para los distintos checkpoints.
- Soporte de instrucciones: Seer utiliza características de instrucción (instruction features) incluidas en `assets/`.
- No se documentan capacidades de generación de texto, código, matemáticas, visión general, tool calling, agentes multi-paso ni multilingüismo, al tratarse de un modelo de robótica y no de un modelo de lenguaje.

## Casos de uso

- Investigación en imitation learning para manipulación: utilizar los checkpoints de PPP y sus variantes como línea base reproducible sobre LIBERO para comparar nuevas políticas de progreso.
- Desarrollo de world models aplicados a robótica: emplear LeWM como modelo de mundo para planificación o para generar rollouts sintéticos en entornos de manipulación.
- Evaluación comparativa en LIBERO: reutilizar las configuraciones de entrenamiento y los resultados en bucle cerrado incluidos para validar variantes de políticas BC frente a PPP.
- Estudio de señales de progreso: analizar cómo la predicción de progreso (PPP) mejora la ejecución frente a behavioral cloning puro en tareas de horizonte largo.
- Integración en pipelines de investigación con instrucciones: usar Seer y sus características de instrucción para experimentar con políticas condicionadas por lenguaje en tareas de manipulación.
- Reproducción de experimentos: aprovechar los assets procesados de LIBERO y los pesos MAE incluidos para reproducir el pipeline de entrenamiento de extremo a extremo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que los checkpoints incluyen "LIBERO closed-loop results", pero los valores numéricos no se detallan en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se especifica el tamaño del modelo ni los parámetros).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible; el repositorio proporciona checkpoints y configuraciones de entrenamiento, pero no se documentan frameworks de servicio como vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo de robótica de este tipo).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables ni datos de rendimiento que permitan una comparación con alternativas de la misma categoría.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible.
- Riesgo de alucinación: no aplicable en el sentido habitual de modelos de lenguaje; en robótica, el riesgo equivalente es la ejecución de acciones incorrectas fuera de la distribución de entrenamiento, no cuantificado en la información disponible.
- Limitaciones de contexto o idioma: no se documentan; el modelo está orientado a tareas de manipulación sobre LIBERO y no a procesamiento de lenguaje natural.
- Restricciones de licencia: el modelo se publica bajo Apache 2.0, pero los pesos MAE en `checkpoints/vit_mae/` son de MAE (Facebook Research) bajo CC BY-NC 4.0, lo que restringe su uso comercial; los datos procesados derivan de LIBERO y deben respetar la licencia de dicho benchmark.
- Caveats para producción: al ser un artefacto de investigación con 0 descargas y 0 likes, no hay evidencia de validación externa; la ausencia de especificaciones de arquitectura y hardware limita la planificación de despliegue.
- Fecha de creación del repositorio: 14 de noviembre de 2026, lo que indica una publicación muy reciente y sin madurez comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/zlicheng/PPP
- Página del proyecto PPP: https://zlicheng.com/ppp_page/
- Código: https://github.com/Colmar-zlicheng/PPP
- MAE (origen de los pesos en `checkpoints/vit_mae/`): https://github.com/facebookresearch/mae
- LIBERO (origen de los datos procesados): https://github.com/Lifelong-Robot-Learning/LIBERO
