# wmymw/button-push-pi05-tcp9-lora

## Resumen

El modelo `wmymw/button-push-pi05-tcp9-lora` es un checkpoint de robótica entrenado mediante fine-tuning con LoRA sobre la arquitectura pi05 (openpi), orientado a una tarea muy concreta: empujar el botón de la cisterna de un inodoro. Lo publica el usuario wmymw en Hugging Face y sigue el formato de los modelos de política visomotora de openpi, que combinan un backbone de visión y lenguaje con un cabezal de acción que produce poses cartesianas del efector final. El repositorio ocupa 21,8 GB e incluye los pesos completos del modelo (base congelada más adaptadores), no únicamente los adaptadores PEFT.

La relevancia es acotada pero clara para quien trabaja en manipulación robótica con imitación: sirve como ejemplo reproducible de un pipeline pi05 con entradas multimodales (tres cámaras RGB de 224x224 más nueve valores de TCP), salida de 30 pasos de acción y decodificación de rotación 6D. No es un modelo de propósito general ni un LLM conversacional: es una política de control entrenada sobre un dataset privado y sin métricas públicas de éxito en robot real.

La model card es explícita sobre las limitaciones: no hay afirmación de éxito ni de seguridad en hardware físico, el dataset es privado, los splits no están verificados de forma independiente y el checkpoint no es compatible con `AutoModel` de Transformers. Cualquier uso en producción exige replicar exactamente el preprocesado de cámaras, el marco TCP medido, la normalización inversa y la política de replanificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | pi05 (openpi), backbone tipo Gemma con adaptadores LoRA; vision congelada |
| Parametros totales | no disponible (repo de 21,8 GB con base completa y adaptadores) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; entrada fija de 3 imágenes + 9 valores TCP) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (prompt de tarea en inglés: "Press the toilet flush button.") |
| Licencia | no disponible |
| Formato de pesos | pesos completos del modelo (no `adapter_model.safetensors` de PEFT); configuración de arquitectura incluida en el repo |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura pi05 de openpi, con un backbone de lenguaje/visión basado en Gemma (`gemma_2b_lora` + `gemma_300m_lora`) y visión congelada durante el entrenamiento. El ajuste se realiza con LoRA sobre esa base, pero el checkpoint publicado contiene el modelo completo, incluida la base congelada y los adaptadores, por lo que no se carga como un adaptador PEFT estándar. El entrenamiento se ejecutó sobre el commit `215abfb217dbac7d5f1273282331b9b1866c0479` de JAX OpenPI, con 20.000 actualizaciones, batch global de 32, chunk de 30 y semilla 42; el autor señala el checkpoint de 10.000 actualizaciones como candidato para inferencia.

La entrada son tres imágenes RGB de 224x224 con letterboxing (front, wrist y top, mapeadas a `base_0_rgb`, `left_wrist_0_rgb` y `right_wrist_0_rgb` respectivamente) más nueve valores TCP (xyz en metros y matriz de rotación, columnas 0 y 1), en marco base y con el offset de herramienta de 0,2044 m ya reflejado en las poses de origen. La normalización se aplica antes del padding a 32. La salida interna es de 30x32, de la que solo se usan los primeros nueve valores; después se desnormaliza y se decodifica la rotación 6D mediante Gram-Schmidt. Los objetivos de entrenamiento son las poses *siguientes observadas*, no las poses comandadas registradas.

El dataset es privado (`XLRoboticsLab-XiaZhi/button_push_dataset`) y no se incluyen vídeos ni demostraciones en bruto. Se conservan todos los fotogramas de origen y los chunks se cortan en huecos superiores a 0,5 s. El muestreo físico es irregular, en torno a 14-15 Hz, mientras que los 30 fps nominales solo indexan el almacenamiento. Los splits son 48 de entrenamiento, 6 de validación y 6 de test, sin verificación independiente de la agrupación por demostración repetida.

## Capacidades

- Generación de acciones robóticas de manipulación: produce secuencias de 30 pasos de pose TCP (posición y rotación 6D) para empujar el botón de la cisterna.
- Percepción visomotora multimodal: consume tres vistas RGB simultáneas (frontal, muñeca y superior) de 224x224.
- Condicionamiento por instrucción en lenguaje natural: el prompt "Press the toilet flush button." define la tarea.
- Control en espacio cartesiano: trabaja con posiciones xyz en metros y rotación representada como matriz, con offset de herramienta incorporado.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso en el sentido de agentes LLM; es una política de imitación de un solo paso de tarea.
- Capacidades multilingües: no disponibles.
- Capacidades especiales: ninguna más allá del pipeline openpi (sin thinking mode, sin visión general, sin audio).

## Casos de uso

- Investigación en imitación visomotora: sirve como referencia reproducible de un fine-tuning LoRA sobre pi05 con entradas multicámara y salida cartesiana, útil para comparar pipelines de entrenamiento en openpi.
- Prototipado de tareas de pulsación: el modelo está entrenado específicamente para empujar un botón de cisterna, por lo que puede emplearse como punto de partida en entornos de laboratorio con una configuración de cámaras y TCP idéntica a la descrita.
- Validación de preprocesado y decodificación: el repo incluye `acceptance_report.json` y detalles de normalización, letterboxing y decodificación 6D con Gram-Schmidt, lo que permite verificar una implementación de inferencia antes de desplegar en robot.
- Benchmark interno de políticas de manipulación: al fijar semilla, batch, chunk y commit, se puede usar como baseline controlado frente a otras variantes de pi05 en la misma tarea.
- Estudio de transferencia sim-a-real acotada: con las comprobaciones de marco TCP, límites de IK y frecuencia de ejecución indicadas, sirve para analizar la brecha entre poses observadas y comandadas.
- Docencia y formación en robótica de imitación: ejemplo completo de model card con entradas, salidas, mapeo de cámaras y requisitos de despliegue, adecuado para prácticas guiadas en laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a `acceptance_report.json` para la aceptación offline, pero no incluye cifras de éxito en robot real ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repo pesa 21,8 GB e incluye base completa más adaptadores, por lo que se requiere al menos una GPU con memoria suficiente para cargar los pesos completos (orden de decenas de GB en precisión nativa).
- GPU recomendadas: no disponibles en la información proporcionada; por el tamaño del checkpoint, se orienta a GPU de datacenter (A100, H100) o equivalentes.
- ¿Cabe en GPU de consumo? No disponible; con 21,8 GB de pesos, una RTX 4090 de 24 GB podría quedar al límite y no hay confirmación del autor.
- Opciones de despliegue: el pipeline es JAX OpenPI (commit `215abfb217dbac7d5f1273282331b9b1866c0479`); no hay compatibilidad directa con `AutoModel` de Transformers. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la model card solo indica que el muestreo físico del dataset es irregular a 14-15 Hz y que los 30 fps nominales son solo indexación de almacenamiento.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros modelos comparables de la misma familia pi05/openpi ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- No hay afirmación de éxito en robot real ni de seguridad física; el propio autor lo indica explícitamente.
- Dataset privado y no incluido: no se pueden auditar las demostraciones ni verificar la agrupación por demostración repetida en los splits.
- Los objetivos de entrenamiento son poses siguientes observadas, no poses comandadas, lo que puede introducir desviaciones respecto al control real.
- Requiere replicar exactamente el preprocesado: letterboxing de tres cámaras 224x224, mapeo front/wrist/top, normalización antes del padding a 32, marco TCP medido y offset de herramienta de 0,2044 m.
- La salida debe desnormalizarse y decodificarse con Gram-Schmidt usando solo los primeros nueve valores de los 30x32 internos.
- No es compatible con `AutoModel` genérico de Transformers; hay que usar la configuración de arquitectura incluida.
- Los checkpoints omiten el estado del optimizador; solo los originales en el servidor de entrenamiento permiten reanudar.
- Licencia no disponible: no se puede confirmar el uso comercial.
- Idiomas no disponibles; el prompt de tarea está en inglés.
- Riesgo de alucinación en el sentido de acciones no válidas fuera de la distribución del dataset; sin métricas públicas de robustez.
- No se incluyen vídeos ni demostraciones en bruto, lo que limita la reproducibilidad completa.

## Enlaces

- Hugging Face: https://huggingface.co/wmymw/button-push-pi05-tcp9-lora
- OpenPI (JAX), commit de referencia: `215abfb217dbac7d5f1273282331b9b1866c0479` (no se proporciona URL en la información disponible)
- Dataset privado referenciado: `XLRoboticsLab-XiaZhi/button_push_dataset` (no accesible)
- Informe de aceptación offline: `acceptance_report.json` dentro del repositorio de Hugging Face
