# stumpferWinkel/LLaVA_CG_complete_joint_best

## Resumen

LLaVA_CG_complete_joint_best es un paquete de pesos publicado por el usuario stumpferWinkel en Hugging Face que contiene un modelo LLaVA-1.5-7B adaptado mediante ajuste fino a una tarea concreta de visión-lenguaje orientada a la localización de puntos de agarre (grasping) sobre imágenes. El repositorio no distribuye únicamente un checkpoint, sino un conjunto completo de código de experimentación (`selected6_code/`), el peso de la tarea (`weights/joint_best.pth`) y el modelo base preentrenado LLaVA-1.5-7B con su configuración y tokenizer, de forma que la inferencia puede ejecutarse cargando todo desde el propio paquete.

El modelo parte de la arquitectura LLaVA-1.5-7B (un modelo de lenguaje de 7 000 millones de parámetros conectado a un codificador visual mediante un proyector) y se ha ajustado de forma conjunta sobre dos conjuntos de datos: OCID-VLG Multiple y GraspNet_Referring2D. Según la model card, el entrenamiento se realizó durante 30 épocas con 8 GPUs y un batch global de 48, seleccionando el checkpoint de la época 8 por maximizar la media aritmética de J@1 en los dos conjuntos de validación.

La relevancia de esta ficha es acotada: se trata de un artefacto de investigación con 0 descargas y 0 likes, sin licencia declarada ni idiomas especificados, y con una documentación mínima en chino. Es útil como referencia para quien quiera reproducir el pipeline de ajuste fino de LLaVA para tareas de referring y grasping 2D, pero no constituye un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA-1.5-7B (transformer multimodal: codificador visual + proyector + LLM de 7B) |
| Parametros totales | 7 000 millones (modelo base LLaVA-1.5-7B; no se especifica el recuento exacto del checkpoint ajustado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base LLaVA-1.5-7B emplea 4096 tokens, pero no se confirma en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `.pth` (PyTorch) para el peso de tarea; el modelo base se distribuye en el formato propio de LLaVA-1.5-7B (safetensors/config/tokenizer) |
| Tamano del paquete | no disponible |

## Arquitectura y entrenamiento

La arquitectura subyacente es LLaVA-1.5-7B, un modelo multimodal que combina un codificador visual (CLIP ViT) con un proyector lineal o MLP que mapea las características visuales al espacio de embeddings de un LLM de 7B parámetros. Sobre esta base, el autor ha realizado un ajuste fino de la tarea, sustituyendo el peso original `B0_PRO` de un solo conjunto de datos por un peso conjunto (`joint_best.pth`) entrenado sobre OCID-VLG Multiple + GraspNet_Referring2D.

El entrenamiento conjunto se llevó a cabo durante 30 épocas partiendo de la inicialización original, con 8 GPUs y un batch global de 48. El checkpoint final se seleccionó en la época 8, escogida por maximizar la media aritmética de J@1 entre los dos conjuntos de validación. La model card no detalla la composición exacta del dataset, el número de tokens de entrenamiento ni si se aplicaron técnicas de RLHF o DPO; tampoco menciona innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Localización visual de puntos de agarre (grasping) sobre imágenes, orientada a instrucciones en lenguaje natural.
- Razonamiento visual-lenguaje para tareas de referring 2D (identificación de regiones u objetos referidos).
- Generación de predicciones estructuradas en JSON mediante el script `infer.py`, con argumentos de imagen, instrucción y fichero de salida.
- Ejecución de inferencia autocontenida: el paquete incluye el modelo base, configuración y tokenizer, por lo que no requiere descargar el checkpoint de LLaVA por separado.
- Capacidades heredadas del modelo base LLaVA-1.5-7B (comprensión de imagen y texto, respuesta a instrucciones multimodales), aunque no se documentan explícitamente en la model card.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (la model card está en chino, pero no se especifican idiomas del modelo).
- Modo thinking, visión, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Investigación en grasping robótico 2D: el modelo predice puntos de agarre a partir de una instrucción como "Grasp the flashlight", lo que permite integrarlo en pipelines de planificación de agarre sobre imágenes RGB. Es adecuado porque el peso ha sido entrenado específicamente sobre GraspNet_Referring2D.
- Evaluación de referring visual: sirve para reproducir los experimentos de localización referida sobre OCID-VLG Multiple, comparando métricas J@1 y J@5 con las reportadas (87,54/93,55 en OCID y 75,97/89,88 en el nuevo conjunto).
- Reproducción de experimentos académicos: el paquete incluye el código de las seis configuraciones de experimentación (`selected6_code/`), lo que facilita replicar ablaciones y comparar el peso conjunto con el original `B0_PRO`.
- Prototipado de asistentes visuales para robótica de manipulación: el modelo puede recibir una imagen de escena y una instrucción textual para señalar la zona de agarre, integrándose en un bucle de percepción-acción.
- Docencia y formación en visión-lenguaje: al estar todo el stack empaquetado, permite a estudiantes ejecutar inferencia con un solo comando sin gestionar dependencias externas del modelo base.
- Base para ajuste fino posterior: el peso conjunto puede servir como inicialización para nuevas tareas de referring o grasping en dominios distintos, reduciendo el coste de entrenamiento desde cero.

## Benchmarks y rendimiento

Los únicos datos publicados en la model card son las métricas J@1 y J@5 sobre los conjuntos de validación:

| Conjunto de validación | J@1 | J@5 |
|---|---|---|
| OCID (OCID-VLG Multiple) | 87,54 | 93,55 |
| Nuevo conjunto (GraspNet_Referring2D) | 75,97 | 89,88 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa del modelo base LLaVA-1.5-7B, la inferencia en FP16 requiere aproximadamente 14-16 GB de VRAM, pero este dato no lo confirma la model card.
- GPU recomendadas: no disponible. El entrenamiento se realizó con 8 GPUs (modelo no especificado) y batch global de 48.
- ¿Cabe en GPU de consumo? No confirmado. Por el tamaño del modelo base (7B), es probable que quepa en GPUs con 16 GB o más en cuantización, pero no hay datos en la información disponible.
- Opciones de despliegue: el paquete proporciona un script propio `infer.py` basado en PyTorch. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LLaVA_CG_complete_joint_best | 7B (base LLaVA-1.5-7B) | no disponible | Grasping / referring 2D | no disponible | Hugging Face (0 descargas) |
| LLaVA-1.5-7B (base) | 7B | 4096 tokens (según documentación del modelo original) | Visión-lenguaje general | Llama 2 (según modelo original) | Ampliamente disponible |
| Alternativas de grasping referido | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa rigurosa con otros modelos de grasping referido. La comparación con LLaVA-1.5-7B es únicamente como modelo base del que deriva.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica licencia, lo que impide determinar si el uso comercial está permitido. No debe usarse en producción sin aclarar este punto con el autor.
- Documentación mínima: la model card está en chino y no detalla composición del dataset, número de tokens, hiperparámetros completos ni proceso de selección del checkpoint más allá de la época 8.
- Sesgos conocidos: no documentados. Al derivar de LLaVA-1.5-7B, hereda los sesgos del modelo base y de los datasets OCID-VLG y GraspNet_Referring2D, pero no se han analizado.
- Riesgo de alucinación: no evaluado. En tareas de localización visual, el modelo podría generar predicciones plausibles pero incorrectas, especialmente fuera de la distribución de entrenamiento.
- Limitaciones de contexto e idioma: no especificadas. La instrucción de ejemplo está en inglés ("Grasp the flashlight"), pero no se confirma el soporte multilingüe.
- Ámbito de aplicación muy restringido: el ajuste está orientado a grasping y referring 2D; su rendimiento en tareas generales de visión-lenguaje puede degradarse respecto al modelo base.
- Métricas limitadas: solo se reportan J@1 y J@5 en dos conjuntos de validación; no hay evaluación en test independiente ni comparación con baselines.
- Repositorio sin tracción: 0 descargas y 0 likes, creado y actualizado el mismo día (27 de noviembre de 2026), lo que sugiere un artefacto de investigación sin validación comunitaria.
- Dependencia del código incluido: la inferencia requiere ejecutar `infer.py` dentro de `selected6_code/` con las dependencias instaladas; no se garantiza compatibilidad con frameworks estándar de despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/stumpferWinkel/LLaVA_CG_complete_joint_best
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
