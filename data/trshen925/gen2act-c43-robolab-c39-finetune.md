# trshen925/gen2act-c43-robolab-c39-finetune

## Resumen

Gen2Act C43 RoboLab C39 fine-tune es un modelo de política robótica desarrollado por trshen925, basado en el enfoque Gen2Act original de NVIDIA (arXiv:2409.16283). Este fine-tune parte de la política nativa C39 de Gen2Act, que opera sobre velocidades de articulaciones en 7 dimensiones (7D joint-velocity), y se ajusta sobre el simulador RoboLab de NVIDIA para mejorar su comportamiento en escenarios de laboratorio.

El modelo resuelve el problema de generalización de políticas de manipulación robótica a tareas nuevas, combinando generación de video humano con ejecución condicionada por el video generado. Su relevancia actual radica en que es un ejemplo práctico de fine-tuning de políticas Gen2Act sobre un simulador específico, con pesos EMA liberados bajo licencia Apache 2.0. El repositorio contiene un state dict de PyTorch de 1.7 GB (`pytorch_model.pt`) que no es un modelo Transformers independiente; requiere la configuración Gen2Act C43 en `config.json`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gen2Act (generación de video + política condicionada por video) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (interfaz de lenguaje natural probablemente, no especificado) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch state dict (`pytorch_model.pt`) |

## Arquitectura y entrenamiento

Gen2Act descompone el aprendizaje de la política en dos fases: primero, un modelo de generación de video preentrenado produce videos de humanos realizando la tarea en escenarios nuevos (zero-shot); después, una política de robot se condiciona sobre el video generado para ejecutar la manipulación. El fine-tune C43 se realiza desde la política nativa C39, que opera en espacio de velocidades de articulación de 7 dimensiones (7D joint-velocity).

El entrenamiento se realizó sobre el simulador RoboLab de NVIDIA, con 94 episodios de rollout para entrenamiento y 25 episodios reservados para validación (todos los casos `_env_000`). Se empleó un esquema de pesos EMA (exponencial moving average) y se seleccionó el checkpoint de la época 4. Los datos de entrenamiento no se incluyen en el repositorio; solo se publican los pesos del modelo.

## Capacidades

- Control de manipulación robótica: genera velocidades de articulación (joint-velocity) para ejecutar tareas de manipulación en simulación RoboLab.
- Generalización a escenarios nuevos: hereda la capacidad de Gen2Act de generar video humano en escenarios no vistos y condicionar la política sobre ese video, lo que permite manejar objetos y movimientos no entrenados explícitamente.
- Condicionamiento por lenguaje natural: el sistema puede recibir descripciones de tareas en lenguaje natural (entrada del generador de video).
- Fine-tuning específico: optimizado para el entorno RoboLab, con métricas de validación reportadas (MAE 0.06865, RMSE 0.10335, precisión de pinza 84.82%).
- No es un modelo de lenguaje: no genera texto ni código; es exclusivamente una política de control robótico.

## Casos de uso

- **Evaluación de políticas de manipulación en RoboLab**: el modelo puede ejecutarse en el simulador RoboLab para validar la generalización de tareas de agarre y manipulación con control de velocidad de articulaciones.
- **Investigación en aprendizaje por imitación**: sirve como baseline para experimentos de fine-tuning sobre políticas Gen2Act con diferentes datasets de demostración.
- **Desarrollo de sistemas de manipulación con condicionamiento visual**: permite estudiar cómo la generación de video humano influye en la ejecución de tareas robóticas en entornos simulados.
- **Comparación de estrategias de control**: el control en joint-velocity (7D) permite comparar frente a políticas de control de posición o torque en RoboLab.
- **Validación de pipelines de entrenamiento con pesos EMA**: útil como ejemplo de release de pesos sin optimizador ni datos de entrenamiento, para reproducir la carga y evaluación.
- **Generación de escenarios de prueba**: combinado con las herramientas de generación de escenarios de RoboLab (por ejemplo, `robolab-scenegen`), el modelo puede probarse en tareas nuevas generadas por lenguaje natural.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks comparativos (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que no es un modelo de lenguaje. El único rendimiento reportado en la model card es la validación del propio modelo:

| Métrica | Valor |
|---|---|
| Validation action MAE | 0.06865 |
| Validation action RMSE | 0.10335 |
| Gripper accuracy | 84.82% |
| Época del checkpoint | 4 |
| Episodios de entrenamiento | 94 |
| Episodios de validación | 25 (todos los `_env_000`) |

## Requisitos de hardware

- **VRAM estimada**: no disponible en la información proporcionada; depende de la configuración Gen2Act C43 y del tamaño del state dict (1.7 GB de pesos).
- **GPU recomendadas**: no disponible específicamente, pero al tratarse de un modelo de robótica con generación de video, se requiere una GPU con al menos 16-24 GB de VRAM para el modelo completo (inferencia en simulación). No se confirma si cabe en GPU de consumo como RTX 4090.
- **Opciones de despliegue**: el modelo es un state dict de PyTorch, no un modelo Transformers estándar. Se carga con la configuración Gen2Act C43 en `config.json`; no es compatible directamente con vLLM, llama.cpp, Ollama o TGI (estos son para modelos de lenguaje).
- **Latencia y throughput**: no disponible. La inferencia depende del generador de video (condicionamiento) y de la política de robot, por lo que la latencia será dominada por el modelo de generación de video.

## Comparativa con modelos similares

No se dispone de información de modelos comparables de la misma categoría (políticas de manipulación robótica con condicionamiento por video). La comparativa se limita al contexto de Gen2Act:

| Modelo | Tipo | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|
| Gen2Act C43 (este fine-tune) | Política robótica + generación de video | Fine-tune sobre RoboLab | Apache 2.0 | HuggingFace |
| Gen2Act C39 (original) | Política robótica + generación de video | Entrenamiento general | Apache 2.0 (según el repositorio) | GitHub |
| RoboLab (simulador) | No es un modelo, es un entorno | - | Apache 2.0 | GitHub |

No se dispone de comparaciones numéricas con otros modelos de control robótico (por ejemplo, RT-2, Octo, etc.) en la información proporcionada.

## Limitaciones y advertencias

- **No es un modelo de lenguaje**: no genera texto ni razona; es una política de control robótica que requiere el pipeline completo de Gen2Act (generación de video + ejecución).
- **Dependencia de Gen2Act C43**: el fine-tune no es un modelo autónomo; necesita la configuración y el código de Gen2Act C43 para cargarse y ejecutarse.
- **Datos de entrenamiento no incluidos**: el repositorio solo contiene pesos EMA; no hay datos de entrenamiento ni optimizador, lo que impide reproducir el entrenamiento exacto.
- **Alucinación y sesgos**: como política robótica, puede fallar en escenarios fuera de la distribución de entrenamiento (por ejemplo, objetos o movimientos no vistos), lo que puede derivar en acciones inseguras en simulación o en el mundo real.
- **Idiomas**: no se especifican idiomas soportados; la entrada de lenguaje depende del modelo de generación de video de Gen2Act, que no se documenta en esta ficha.
- **Fecha de creación**: la fecha indicada (2026-08-25) es futura respecto a la fecha de redacción de esta ficha; se recomienda verificar la validez del modelo en HuggingFace.
- **Uso comercial**: licencia Apache 2.0 permite uso comercial, pero se debe revisar la licencia de los modelos base de Gen2Act y de RoboLab para uso en producción.
- **Sin benchmarks estándar**: no hay métricas comparativas con otros modelos de robótica, por lo que no se puede evaluar su rendimiento relativo.

## Enlaces

- [HuggingFace - trshen925/gen2act-c43-robolab-c39-finetune](https://huggingface.co/trshen925/gen2act-c43-robolab-c39-finetune)
- [GitHub - Gen2Act (trshen925)](https://github.com/trshen925/gen2act)
- [GitHub - RoboLab (NVlabs)](https://github.com/NVLabs/RoboLab)
- [arXiv: Gen2Act: Human Video Generation in Novel Scenarios enables Robot Manipulation](https://arxiv.org/abs/2409.16283)
- [Página del proyecto Gen2Act](https://homangab.github.io/gen2act/)
