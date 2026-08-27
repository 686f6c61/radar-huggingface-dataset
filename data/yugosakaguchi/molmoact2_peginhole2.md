# yugosakaguchi/molmoact2_peginhole2

## Resumen

El modelo `yugosakaguchi/molmoact2_peginhole2` es una política de robótica basada en **MolmoAct2**, un modelo de razonamiento de acción desarrollado por el Allen Institute for AI (Ai2). MolmoAct2 mapea imágenes de cámara e instrucciones en lenguaje natural a secuencias de acciones del robot, y esta implementación concreta ha sido entrenada con la librería **LeRobot** de Hugging Face para la tarea específica de insertar una clavija en un agujero (peg-in-hole). El modelo cuenta con 5.442 millones de parámetros (aproximadamente 5,4 mil millones) y está publicado bajo licencia Apache 2.0, lo que permite uso comercial y modificación sin restricciones.

Este modelo es relevante porque representa un caso práctico de fine-tuning de un modelo fundacional de robótica sobre un dataset reducido (50 episodios) para una tarea de manipulación concreta. Al estar integrado en el ecosistema LeRobot, ofrece un flujo de trabajo reproducible para entrenar y desplegar políticas en robots reales, con soporte para cámaras y control de bajo nivel. Su arquitectura, basada en el backbone VLM MolmoER, está diseñada para el razonamiento espacial y encarnado, lo que lo hace adecuado para tareas que requieren comprensión visual y coordinación motora fina.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de acción razonamiento basado en VLM (MolmoER) |
| Parametros totales | 5.442.196.272 (5,4 B) |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (probablemente inglés, no especificado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

MolmoAct2 es un modelo de razonamiento de acción que combina un backbone de visión-lenguaje (VLM) con un cabezal de predicción de acciones. Según el paper *MolmoAct2: Action Reasoning Models for Real-world Deployment* (arXiv:2605.02881), el backbone se denomina **MolmoER**, un VLM especializado en razonamiento espacial y encarnado, entrenado sobre un corpus de 3,3 millones de muestras con una receta de "especializar y ensayar". Este modelo concreto ha sido fine-tuning con LeRobot sobre el dataset `yugosakaguchi/peginhole2`, que contiene 50 episodios y 18.546 frames a 30 FPS, con la tarea "Insert the peg into the hole". El entrenamiento se realizó durante 20.000 pasos con batch size 32, optimizador AdamW y learning rate 1e-05, usando LeRobot versión 0.6.1. La política consume dos flujos de imagen (cámara de muñeca y cámara frontal, ambas a 480×640) y el estado del robot (6 dimensiones), y produce un vector de acción de 6 dimensiones.

## Capacidades

- Control de robot basado en visión: procesa imágenes de dos cámaras (muñeca y frontal) para generar comandos de acción de 6 grados de libertad.
- Seguimiento de instrucciones en lenguaje natural: la tarea se especifica mediante texto ("Insert the peg into the hole") y el modelo la traduce en movimientos del robot.
- Manipulación fina: entrenado específicamente para inserción de clavija, una tarea que requiere precisión subcentimétrica y coordinación visomotora.
- Integración con LeRobot: compatible con el flujo de entrenamiento, evaluación y despliegue de LeRobot, incluyendo el comando `lerobot-rollout` para ejecución en robots reales.
- Razonamiento espacial: gracias al backbone MolmoER, el modelo tiene capacidad de comprender relaciones espaciales entre objetos y el efector final.
- No incluye capacidades de generación de texto, tool calling ni agentes conversacionales; es exclusivamente una política de control para robótica.

## Casos de uso

- **Inserción de componentes en ensamblaje industrial**: el modelo puede controlar un brazo robótico para insertar clavijas, tornillos o conectores en orificios, una operación común en líneas de montaje. Su precisión y capacidad de adaptación visual lo hacen adecuado para entornos con variaciones leves de posición.
- **Investigación en aprendizaje por imitación**: sirve como punto de partida para estudiar cómo un modelo fundacional de robótica se adapta a tareas específicas con pocos datos (50 episodios), permitiendo experimentos sobre transferencia de habilidades y generalización.
- **Desarrollo de políticas para robots colaborativos (cobots)**: el robot `so101_follower` es un brazo de bajo coste, por lo que este modelo puede desplegarse en entornos educativos o de pequeña producción donde se requiera automatizar tareas repetitivas de inserción.
- **Benchmark de evaluación de modelos de acción**: al estar publicado con un dataset y configuración de entrenamiento claros, puede utilizarse como referencia para comparar el rendimiento de otras arquitecturas (p. ej., SmolVLA) en la misma tarea.
- **Prototipado rápido en robótica**: gracias a la integración con LeRobot, un investigador puede cargar este modelo y ejecutarlo en un robot compatible en minutos, sin necesidad de entrenar desde cero, para validar hipótesis sobre control basado en visión.
- **Entrenamiento de políticas multi-tarea**: aunque este modelo está especializado en una sola tarea, su arquitectura permite extender el fine-tuning a otras tareas de manipulación añadiendo datos y ajustando la instrucción, lo que lo convierte en una base útil para desarrollar robots polivalentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet"). No hay datos de éxito en la tarea, ni comparaciones con otros modelos en el mismo entorno.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 5,4 mil millones de parámetros, en precisión FP16 se necesitan aproximadamente 11 GB de VRAM solo para los pesos, más overhead de activaciones y memoria del optimizador (si se entrena). Para inferencia, se recomienda al menos 12-16 GB de VRAM.
- **GPU recomendadas**: una NVIDIA RTX 3090 (24 GB) o RTX 4090 (24 GB) es suficiente para FP16. Para GPUs con menos memoria (p. ej., RTX 3060 de 12 GB), sería necesario aplicar cuantización (INT8 o INT4), aunque no se han publicado versiones cuantizadas de este modelo.
- **¿Cabe en GPU de consumo?**: sí, en GPUs de gama alta con 24 GB de VRAM. En GPUs de 12 GB podría ser ajustado con cuantización, pero no hay archivos GGUF u otros formatos cuantizados disponibles en el repositorio.
- **Opciones de despliegue**: el modelo está diseñado para usarse con LeRobot, que soporta inferencia en PyTorch con CUDA. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje generativo sino una política de control.
- **Latencia y throughput**: no se proporcionan datos. Al ser un modelo de 5,4 B con dos entradas de imagen, se espera una latencia de decenas de milisegundos por paso en una GPU moderna, pero esto no está verificado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `yugosakaguchi/molmoact2_peginhole2` | 5,4 B | no disponible | Peg-in-hole | Apache 2.0 | Hugging Face |
| `yugosakaguchi/smolvlalora_peginhole2` | no disponible (SmolVLA, compacto) | no disponible | Peg-in-hole | no disponible | Hugging Face |
| MolmoAct2 (base, sin fine-tuning) | no disponible | no disponible | Robótica general | Apache 2.0 | GitHub / Ai2 |

SmolVLA es un modelo de visión-lenguaje-acción más compacto y eficiente, diseñado para hardware de consumo, mientras que MolmoAct2 es más grande y potente en razonamiento espacial. No se dispone de datos cuantitativos de rendimiento para comparar directamente. Otros modelos de robótica como OpenVLA o RT-2 no se han incluido por falta de datos comparables en la información proporcionada.

## Limitaciones y advertencias

- **Especialización limitada**: el modelo ha sido entrenado únicamente para la tarea de inserción de clavija con un dataset de 50 episodios. No generaliza a otras tareas de manipulación sin un nuevo fine-tuning.
- **Riesgo de sobreajuste**: con solo 50 episodios, el modelo puede memorizar las configuraciones específicas del dataset y fallar ante variaciones de iluminación, posición de la cámara o geometría de la pieza.
- **Sin evaluación en robot real**: la model card no reporta resultados de éxito en el robot físico, por lo que el rendimiento real es desconocido.
- **Dependencia de la configuración de cámaras**: el modelo espera dos cámaras específicas (muñeca y frontal) con resoluciones de 480×640. Cambiar la disposición de las cámaras o sus parámetros puede degradar el rendimiento.
- **Idioma de las instrucciones**: aunque no se especifica, es probable que el modelo solo entienda instrucciones en inglés (la tarea está en inglés). No hay soporte multilingüe documentado.
- **Requisitos de hardware**: la inferencia requiere una GPU con al menos 12-16 GB de VRAM, lo que puede ser una barrera para entornos con hardware limitado.
- **Licencia**: aunque la licencia es Apache 2.0, el modelo base MolmoAct2 puede tener atribuciones adicionales; se recomienda revisar los términos del repositorio original de Ai2.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/yugosakaguchi/molmoact2_peginhole2)
- [Dataset de entrenamiento](https://huggingface.co/datasets/yugosakaguchi/peginhole2)
- [Repositorio oficial de MolmoAct2 (GitHub)](https://github.com/allenai/molmoact2)
- [Paper: MolmoAct2: Action Reasoning Models for Real-world Deployment](https://arxiv.org/abs/2605.02881)
- [Documentación de LeRobot para MolmoAct2](https://huggingface.co/docs/lerobot/main/en/molmoact2)
- [Modelo similar: SmolVLA para la misma tarea](https://huggingface.co/yugosakaguchi/smolvlalora_peginhole2)
