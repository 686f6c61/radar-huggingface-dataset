# tarzanagh/ckpt_psspteleop_pickfromscale_4cam260810-260811_gr00t3b260816

## Resumen

Este repositorio contiene un checkpoint de fine-tuning del modelo GR00T-N1.7-3B, desarrollado por NVIDIA, aplicado a la habilidad robótica **pick_from_scale** (recoger un objeto de una báscula) en el robot DexMate Vega. El autor, tarzanagh, ha entrenado el modelo mediante aprendizaje por imitación a partir de 87 episodios de teleoperación, con una configuración de 4 cámaras a 30 Hz y en una escena de oficina nueva. El checkpoint corresponde al paso 8000 de entrenamiento y solo incluye los pesos del modelo, sin optimizador ni estado de entrenamiento.

La relevancia de este modelo radica en su aplicación directa a tareas de manipulación robótica de precisión, como parte de un flujo más amplio de pick → scan → place-on-scale → pick-from-scale → put-aside. Al estar basado en GR00T-N1.7-3B, aprovecha una arquitectura de transformer diseñada para robótica, aunque los detalles específicos de parámetros y contexto no se indican en la información disponible. Es un ejemplo de fine-tuning especializado para un escenario concreto, lo que lo hace útil para investigadores que necesitan políticas de control entrenadas con pocos datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T-N1.7-3B (fine-tune) |
| Parametros totales | no disponible (el nombre sugiere 3B, no confirmado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de robótica, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | other (licencia personalizada, no estándar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en GR00T-N1.7-3B, una arquitectura de transformer desarrollada por NVIDIA para robótica, diseñada para procesar entradas multimodales (imágenes de cámaras y estados del robot) y generar acciones de control. En este checkpoint, se ha realizado un fine-tuning supervisado mediante aprendizaje por imitación, utilizando 87 episodios de teleoperación recogidos los días 10 y 11 de agosto de 2026. Los datos incluyen secuencias de video de 4 cámaras (head_left, head_right, left_wrist, right_wrist) a 30 Hz, junto con estados y acciones del robot. El entrenamiento se detuvo en el paso 8000 (checkpoint-8000), y solo se publican los pesos del modelo, la configuración de modalidades y estadísticas. No se menciona el uso de RLHF, DPO u otras técnicas de optimización adicionales.

## Capacidades

- Ejecución de la habilidad específica **pick_from_scale**: recoger un objeto colocado sobre una báscula y posiblemente apartarlo (según el nombre de la tarea).
- Percepción multimodal con 4 cámaras simultáneas, lo que permite al modelo integrar visión desde la cabeza y las muñecas del robot.
- Aprendizaje por imitación: reproduce comportamientos demostrados por un teleoperador en un entorno real de oficina.
- Generación de acciones de control para el robot DexMate Vega, probablemente en forma de posiciones articulares o comandos de movimiento.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling, ni tiene capacidades de razonamiento simbólico o conversación.
- No se especifican capacidades multilingües ni de visión general fuera del ámbito robótico.

## Casos de uso

- Automatización de procesos de pesaje en laboratorios: el modelo puede recoger muestras de una báscula después de que se registre su peso, integrándose en flujos de trabajo de análisis químico o farmacéutico.
- Líneas de inspección de calidad: en entornos industriales donde los objetos se pesan y luego deben retirarse, el robot puede realizar la extracción de forma autónoma.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar la transferencia de habilidades entre escenas o la robustez de políticas entrenadas con pocos episodios.
- Desarrollo de robots de servicio en oficinas: el modelo puede adaptarse para tareas de manipulación de objetos pequeños, como recoger documentos o suministros de una báscula.
- Fine-tuning adicional: los pesos publicados permiten continuar el entrenamiento para nuevas variantes de la tarea, como diferentes posiciones de la cámara o nuevos objetos.
- Validación de políticas de control en robots reales: el checkpoint está diseñado para ser desplegado y validado en el robot físico, como se indica en el README.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona métricas de éxito, precisión ni comparaciones con otros modelos. Se recomienda validar el modelo en el robot real antes de cualquier uso en producción.

## Requisitos de hardware

- No se especifican requisitos de hardware en la información proporcionada.
- Dado el tamaño del repositorio (6.9 GB) y la naturaleza del modelo (GR00T-N1.7-3B), se estima que la inferencia requiere una GPU con al menos 8-12 GB de VRAM para cargar los pesos en precisión FP16, pero este dato no está confirmado.
- Para despliegue en tiempo real con 4 cámaras a 30 Hz, se necesitaría una GPU de gama alta (por ejemplo, RTX 3090/4090 o A100) junto con un sistema de captura de video sincronizado.
- No se mencionan opciones de despliegue como vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje; el despliegue se realiza a través del framework de GR00T o herramientas robóticas específicas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (checkpoints de GR00T para tareas robóticas específicas). El autor no proporciona comparaciones con otros fine-tunes o modelos base. Se recomienda consultar la documentación oficial de NVIDIA GR00T para conocer alternativas.

## Limitaciones y advertencias

- Licencia "other": no es una licencia estándar (como MIT o Apache 2.0); es necesario revisar los términos específicos del autor antes de cualquier uso comercial o redistribución.
- Entrenamiento con solo 87 episodios: la generalización a otras escenas, objetos o condiciones de iluminación puede ser limitada.
- Validación pendiente: el README indica explícitamente "Validate on the real robot", por lo que el rendimiento real no está confirmado.
- No es un modelo de lenguaje: no debe usarse para tareas de procesamiento de texto, generación de código o conversación.
- Riesgo de sobreajuste: al ser un fine-tuning en un escenario muy concreto, puede fallar si las condiciones cambian (posición de la báscula, tipo de objeto, etc.).
- Sesgos del teleoperador: las demostraciones pueden reflejar el estilo particular del operador, lo que podría afectar la robustez de la política.

## Enlaces

- Repositorio HuggingFace: [tarzanagh/ckpt_psspteleop_pickfromscale_4cam260810-260811_gr00t3b260816](https://huggingface.co/tarzanagh/ckpt_psspteleop_pickfromscale_4cam260810-260811_gr00t3b260816)
