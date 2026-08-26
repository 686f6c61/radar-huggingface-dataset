# trshen925/gen2act-c44-robolab-taskholdout-epoch10

## Resumen

Gen2Act es un enfoque de aprendizaje por imitación para robótica que descompone la política global en dos etapas: generación de vídeo humano a partir de una descripción en lenguaje y una imagen inicial, seguida de ejecución robótica condicionada al vídeo generado. El método aprovecha un modelo de generación de vídeo pre-entrenado, aplicado zero-shot a escenarios noveles, y una política de control que traduce el vídeo en comandos de articulaciones y pinzas. Este repositorio concreto, `trshen925/gen2act-c44-robolab-taskholdout-epoch10`, contiene los parámetros EMA del modelo de política tras la época 10 de un experimento de continuación (C44), inicializado desde el experimento C39 y afinado durante 10 épocas en el conjunto RoboLab small. Se retuvieron cinco tareas completas para evaluar la generalización: `BananasInBinThreeTotalTask`, `CookingClearPlateTask`, `FruitsOnPlate3Task`, `RubiksCubeTask` y `StackWhiteMugsTask`. El modelo se distribuye bajo licencia Apache 2.0 y el repositorio ocupa 1.7 GB.

El interés de este modelo radica en su capacidad para generalizar a tareas no vistas durante el entrenamiento, con métricas de época 10 que muestran un error absoluto medio en acción de 0.0648 y una precisión de pinza del 84.93%. Aunque se trata de un modelo de investigación, es relevante para la comunidad de robótica por su enfoque de descomposición vídeo-polinómico y por el uso de EMA para estabilizar el entrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el checkpoint contiene solo el state dict EMA de la política Gen2Act; el framework completo usa generación de vídeo y ejecución robótica) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo trabaja con instrucciones de lenguaje, pero no se especifican idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch state dict (`pytorch_model.pt`) |

## Arquitectura y entrenamiento

El modelo sigue el paradigma Gen2Act, que separa la política en dos componentes: un generador de vídeo humano pre-entrenado (utilizado zero-shot para escenarios novelos) y una política de control que recibe el vídeo generado y produce acciones de velocidad articular y pinza. Para este checkpoint concreto, no se especifican los detalles internos de la red (número de capas, dimensiones, etc.), ya que solo se distribuye el state dict de EMA de la política. El entrenamiento se realizó en el entorno RoboLab small, con un conjunto de entrenamiento que contenía 38 tareas (95 rollouts) y un conjunto de validación compuesto por 24 rollouts de las cinco tareas retenidas. Se usó una inicialización desde el experimento C39 y un calendario de aprendizaje por piezas de cuatro épocas. No se menciona el uso de RLHF ni de otras técnicas de optimización adicionales.

## Capacidades

- Generación de acciones de velocidad articular (joint-velocity) y control de pinza para manipulación robótica.
- Aprendizaje por imitación a partir de demostraciones, con capacidad de generalizar a tareas no vistas durante el entrenamiento (evaluado en cinco tareas retenidas).
- Condicionamiento por instrucciones en lenguaje natural y por imágenes de entrada, gracias al pipeline de generación de vídeo.
- Soporte para tareas de manipulación de objetos en entornos domésticos, como recoger, colocar, apilar y limpiar (según los nombres de las tareas retenidas).
- No se reportan capacidades de tool calling, agentes multi-step ni razonamiento simbólico, ya que el modelo está enfocado exclusivamente en control robótico.

## Casos de uso

- Manipulación de objetos en entornos domésticos: el modelo puede ejecutar tareas como apilar tazas o colocar frutas en un plato, gracias a su entrenamiento en RoboLab small con tareas variadas.
- Aprendizaje por imitación en robótica: sirve como referencia para estudiar cómo un modelo de política generaliza a tareas retenidas, útil para investigadores que trabajan en generalización de habilidades.
- Control de pinza y precisión de agarre: con una precisión de pinza del 84.93% en tareas retenidas, puede utilizarse en experimentos de agarre de objetos.
- Evaluación de checkpoints EMA en robótica: el repositorio permite reproducir el experimento C44 y estudiar el efecto del EMA en la estabilidad del entrenamiento.
- Integración en pipelines de simulación: dado que se ejecuta en RoboLab, se puede usar en entornos simulados para desarrollo y prueba de algoritmos de control.
- Investigación en generación de vídeo para control: el framework Gen2Act, del que forma parte, permite estudiar cómo el vídeo generado condiciona la ejecución robótica.

## Benchmarks y rendimiento

La model card reporta las siguientes métricas en la época 10 para las tareas retenidas:

| Metrica | Valor |
|---|---|
| Action MAE | 0.064795 |
| Action RMSE | 0.096883 |
| Gripper accuracy | 84.93% |
| Validation loss | 0.149419 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- El tamaño del repositorio es de 1.7 GB, lo que sugiere que el checkpoint puede cargarse en GPUs de consumo con al menos 4-6 GB de VRAM para inferencia, aunque no se especifican requisitos oficiales.
- No se proporcionan datos de latencia, throughput ni VRAM exacta en la documentación disponible.
- Para entrenamiento o fine-tuning adicional, se requeriría una GPU con suficiente memoria para el batch size del experimento, probablemente en el rango de 16-24 GB (por ejemplo, RTX 3090/4090 o A100), pero no se ha confirmado.
- Opciones de despliegue: al ser un state dict de PyTorch, se puede cargar en frameworks de robótica que usen PyTorch, como parte del pipeline Gen2Act. No se menciona compatibilidad con vLLM, llama.cpp o TGI, ya que no es un modelo de lenguaje.
- El checkpoint no es un modelo Transformers autónomo; se debe cargar con el `config.json` incluido en el repositorio.

## Comparativa con modelos similares

No disponible. No se ha encontrado información sobre modelos comparables en la misma categoría (robótica con aprendizaje por imitación y control de velocidad articular) dentro de la información proporcionada.

## Limitaciones y advertencias

- El checkpoint es un modelo de investigación, no validado para uso en producción industrial.
- La generalización se evaluó solo en cinco tareas retenadas; el comportamiento en otros escenarios no está garantizado.
- No se especifican sesgos conocidos, pero al entrenarse en un entorno simulado (RoboLab), puede no transferir directamente a entornos reales sin fine-tuning.
- Riesgo de alucinación en acciones: el modelo puede generar acciones incorrectas en tareas no vistas o con instrucciones ambiguas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no está validado para aplicaciones comerciales de robótica real.
- El formato de pesos es un state dict de EMA, no un modelo standalone; se requiere el código y la configuración de Gen2Act para cargarlo correctamente.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/trshen925/gen2act-c44-robolab-taskholdout-epoch10
- Repositorio de GitHub de Gen2Act: https://github.com/trshen925/gen2act
- Página del proyecto Gen2Act: https://homangab.github.io/gen2act/
- Paper de Gen2Act (arXiv): https://arxiv.org/html/2409.16283v1
- Perfil de HuggingFace del autor: https://huggingface.co/trshen925/models
