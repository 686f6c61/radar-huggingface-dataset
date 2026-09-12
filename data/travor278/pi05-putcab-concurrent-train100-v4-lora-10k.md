# Travor278/pi05-putcab-concurrent-train100-v4-lora-10k

## Resumen
Este repositorio contiene un ajuste fino con LoRA del modelo de visión-lenguaje-acción PI0.5 en su implementación JAX, dentro del ecosistema de la librería openpi, orientado a robótica de manipulación. El checkpoint se ha entrenado para una única tarea bimanual descrita por el prompt "Open the cabinet drawer with the left arm and place the object into it with the right arm": abrir un cajón con el brazo izquierdo y depositar un objeto en su interior con el brazo derecho.

El entrenamiento parte de un PI0.5 JAX base (XinY0201/openpi-pi05-base-jax) y se ha realizado sobre el dataset Shiki42/PutCab-Concurrent-Train100-V4, compuesto por 100 episodios y 22.421 fotogramas a 16,67 FPS, con estado y acciones absolutos de 14 dimensiones y tres vistas RGB nativas redimensionadas a 224x224. Se ejecutaron 10.000 actualizaciones con batch global 16 en dos GPU H100 de 80 GB, con LoRA de rango/alfa 16 en la torre PaliGemma y rango 32 en el experto de acciones.

Su relevancia es doble: por un lado, documenta un flujo de trabajo reproducible de ajuste eficiente (LoRA) sobre un modelo fundacional de robótica en JAX, con manifiestos, hashes de parámetros y registros de configuración; por otro, es un ejemplo del tipo de adaptaciones de dominio que hoy se publican en HuggingFace. Como contrapartida, el autor no reclama ninguna tasa de éxito en rollout cerrado y el repositorio no incluye el estado del optimizador, por lo que no es un artefacto listo para producción sin validación propia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de visión-lenguaje-acción (VLA) PI0.5 en JAX: torre PaliGemma (visión-lenguaje) con un único experto de acciones estándar; adaptación mediante LoRA |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (el horizonte de acciones del entrenamiento es de 50 pasos) |
| Tipos de cuantización | no se publican variantes cuantizadas; pesos congelados en bf16, pesos entrenables en float32 |
| Idiomas soportados | no disponible (el prompt de entrenamiento está en inglés) |
| Licencia | no disponible |
| Formato de pesos | Orbax (checkpoint JAX/Flax), con raíz de checkpoint `10000/`; no se publican safetensors ni GGUF |
| Tamaño del repositorio | 6,3 GB |
| Modalidad de entrada | 3 vistas RGB a 224x224 + estado absoluto del robot (14 dimensiones, con padding a 32) |
| Modalidad de salida | Acciones absolutas del robot (14 dimensiones, con padding a 32), horizonte 50 |
| Ajuste fino | LoRA rango/alfa 16 (PaliGemma) y 32 (experto de acciones), con filtro de congelación de referencia sobre visión y proyecciones |
| Optimizador | AdamW (b1=0,9, b2=0,95, eps=1e-8, weight_decay=1e-10, clip=1), sin EMA |
| Librería | openpi |

## Arquitectura y entrenamiento
La arquitectura sigue el diseño PI0.5 en JAX: una torre de visión-lenguaje basada en PaliGemma que procesa las tres cámaras y el prompt textual, conectada a un experto de acciones único que genera los comandos motores. Sobre esa base se han insertado adaptadores LoRA, lo que permite reutilizar los pesos preentrenados congelados y entrenar únicamente un subconjunto reducido de parámetros. El autor indica que el árbol de parámetros de inferencia incluye tanto los pesos base como los de LoRA, además de los activos de normalización, mientras que el estado del optimizador se queda en la plataforma de entrenamiento.

El entrenamiento usó el dataset PutCab-Concurrent-Train100-V4 (100 episodios, 22.421 fotogramas a 16,666 FPS), con estado y acciones absolutos nativos de 14 dimensiones, sin conversión de unidades tipo Aloha, sin máscara de inactividad y con las tres vistas RGB redimensionadas a 224x224. Se realizaron 10.000 actualizaciones con batch global 16 y semilla 87431 en dos H100 de 80 GB, con activaciones y pesos congelados en bf16 y pesos entrenables en float32, siguiendo una curva coseno de 30.000 pasos con 1.000 de calentamiento, pico de 2,5e-5 y valor final de 2,5e-6 (el entrenamiento se detuvo en el paso 10.000). El autor documenta comprobaciones previas de estadísticas del dataset, verificación de finitud de todos los arrays, restauración estricta de parámetros y hashes de arrays decodificados, así como la identidad del job de entrenamiento.

## Capacidades
- Generación de trayectorias de manipulación robótica bimanual a partir de observaciones visuales y del estado del robot, con horizonte de predicción de 50 pasos.
- Percepción visual multi-cámara: procesa tres vistas RGB nativas redimensionadas a 224x224.
- Condicionamiento por instrucción en lenguaje natural: responde al prompt específico de apertura de cajón y colocación de objeto.
- Manejo de espacio de estado/acción absoluto de 14 dimensiones con padding hasta 32.
- Ajuste eficiente mediante LoRA sobre una base preentrenada, lo que permite reentrenar la política sin actualizar todos los pesos.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso más allá del bucle de control propio de una política VLA.
- No se documentan capacidades multilingües.
- No se documentan modos especiales como thinking mode, audio o generación de texto libre.

## Casos de uso
- Manipulación de cajones en un banco de pruebas: es exactamente la tarea para la que se entrenó (abrir el cajón con el brazo izquierdo y colocar un objeto dentro con el derecho), por lo que puede desplegarse como política de referencia en un montaje equivalente.
- Plantilla de ajuste fino con LoRA: sirve como ejemplo reproducible de cómo adaptar un PI0.5 JAX a un dataset propio pequeño (100 episodios) sin reentrenar la base completa, útil para equipos que quieran replicar el flujo en otras tareas.
- Evaluación offline de políticas: dado que el repositorio incluye pesos base, LoRA y activos de normalización, puede usarse para comparar predicciones de acciones contra el ground truth del dataset antes de gastar tiempo en pruebas físicas.
- Investigación en reproducibilidad de robótica: la model card documenta manifiestos de ficheros, commits, semilla, receta de optimizador y hashes, lo que facilita estudios de replicación y auditoría de experimentos en JAX.
- Ablaciones de hiperparámetros LoRA: el checkpoint con rango/alfa 16 en PaliGemma y 32 en el experto de acciones puede emplearse como punto de partida para comparar configuraciones alternativas en la misma tarea.
- Filtrado y anotación de demostraciones: las predicciones del modelo sobre un dataset de episodios pueden utilizarse para detectar trayectorias anómalas o mal etiquetadas antes de ampliar un corpus de entrenamiento.
- Integración en un stack de control robótico: desplegado mediante el runtime de openpi sobre el servidor de políticas, puede conectarse a un bucle de control que consuma las tres cámaras y publique acciones de 14 dimensiones.
- Docencia y prototipado en VLA: al ser un repositorio pequeño y con configuración documentada, resulta adecuado para cursos o proyectos que necesiten un caso real de política visión-lenguaje-acción en JAX.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La propia model card indica explícitamente que no se reclama ninguna tasa de éxito en rollout cerrado ("No closed-loop rollout success-rate claim is made"), por lo que no existen cifras de éxito en tarea, ni comparaciones con otros checkpoints bajo protocolos comunes.

## Requisitos de hardware
- El repositorio ocupa 6,3 GB, lo que corresponde a los pesos base en bf16 más los adaptadores LoRA y los activos de normalización; el estado del optimizador no se distribuye.
- Estimación orientativa de VRAM para inferencia: los pesos en bf16 rondarían los 6-7 GB en memoria, y con activaciones, buffers de imagen a 224x224 y overhead del runtime JAX conviene reservar del orden de 12-24 GB. No hay cifras oficiales publicadas.
- Entrenamiento documentado: 2 GPU H100 de 80 GB, batch global 16 y 10.000 actualizaciones. Estas son las necesidades del ajuste fino, no de la inferencia.
- GPU recomendadas: H100 o A100 para entrenamiento y para inferencia de altas prestaciones; GPU de consumo con 24 GB (por ejemplo, RTX 4090) podrían ser suficientes para inferencia, aunque no hay confirmación del autor.
- Despliegue: el checkpoint debe cargarse con el runtime de openpi en JAX a partir de la raíz Orbax `10000/`. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de texto generativo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Horizonte / contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-putcab-concurrent-train100-v4-lora-10k (este) | VLA PI0.5 ajustado con LoRA para una tarea bimanual | no disponible | Horizonte de 50 pasos | no disponible | Repositorio público, 0 descargas y 0 likes en el momento de la consulta |
| PI0.5 JAX base (XinY0201/openpi-pi05-base-jax) | VLA base preentrenado | no disponible | no disponible | no disponible | Repositorio público; es el punto de partida de este ajuste |
| Otros VLA open source de la misma categoría (PI0, OpenVLA, GR00T N1, entre otros) | VLA para manipulación | no disponible | no disponible | no disponible | La información proporcionada no incluye datos de estos modelos |

La información disponible no permite establecer una comparación cuantitativa con alternativas: no hay parámetros publicados, ni resultados de benchmarks, ni licencia declarada para este checkpoint ni para su base.

## Limitaciones y advertencias
- No se declara ninguna métrica de éxito en rollout cerrado, por lo que no existe evidencia pública de que la política funcione en el mundo real.
- El repositorio tiene 0 descargas y 0 likes, es decir, no ha pasado por ninguna validación de la comunidad.
- La licencia no está especificada, lo que impide determinar si el uso comercial está permitido. Cualquier despliegue en producción debería aclarar antes la licencia de la base PI0.5 JAX y de este derivado.
- El modelo está entrenado para una única tarea y un único prompt; se desconoce su capacidad de generalización a otras instrucciones, objetos o geometrías de cajón.
- El dataset de partida es pequeño (100 episodios, 22.421 fotogramas), lo que aumenta el riesgo de sobreajuste a las condiciones concretas de recogida.
- El estado del optimizador no se incluye en el repositorio, de modo que no es posible reanudar el entrenamiento desde el paso 10.000 con la misma configuración.
- El autor advierte de que el checkpoint no se reclama byte-idéntico al runtime archivado histórico de CTR, lo que introduce incertidumbre sobre la reproducibilidad exacta de resultados previos.
- El entorno de ejecución depende de JAX y Orbax con parches de compatibilidad específicos, lo que puede complicar la portabilidad a otras versiones de librerías.
- No se declaran idiomas soportados ni capacidades multilingües; el condicionamiento textual observado es en inglés.
- Es un modelo de robótica y no un modelo de lenguaje: no debe usarse para generación de texto, razonamiento simbólico ni tareas conversacionales.
- La fecha de creación del repositorio en los metadatos (2026-09-12) es posterior a la fecha habitual de publicación; conviene verificarla antes de citarla.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/Travor278/pi05-putcab-concurrent-train100-v4-lora-10k
- Checkpoint base PI0.5 JAX: https://huggingface.co/XinY0201/openpi-pi05-base-jax (commit `5e62884fcf8cb8f9fc693c9163ea18d3e3739658`)
- Dataset de entrenamiento: https://huggingface.co/datasets/Shiki42/PutCab-Concurrent-Train100-V4 (revisión `b58185f37ad1075bdbcf97a145478ca4517248eb`)
- Configuración de entrenamiento y artefactos de reproducibilidad: ruta `10000/experiment/` dentro del propio repositorio del modelo
- Proyecto openpi (librería declarada en la model card): https://github.com/Physical-Intelligence/openpi
- Nota sobre la búsqueda web: los resultados devueltos no guardan relación con el modelo (contenido sobre kits solares y licencias náuticas), por lo que no se incluye ninguno.
