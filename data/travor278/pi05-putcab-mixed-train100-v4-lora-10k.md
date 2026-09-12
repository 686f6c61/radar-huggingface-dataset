# Travor278/pi05-putcab-mixed-train100-v4-lora-10k

## Resumen

pi05-putcab-mixed-train100-v4-lora-10k es un checkpoint de política robótica publicado por el usuario de HuggingFace Travor278. Consiste en un ajuste fino con adaptadores LoRA sobre el modelo base PI0.5 en JAX (XinY0201/openpi-pi05-base-jax, commit 5e62884) dentro del ecosistema openpi, con un único *action expert*. El resultado es una política visión-lenguaje-acción (VLA) especializada en una tarea bimanual concreta: abrir el cajón de un armario con el brazo izquierdo e introducir un objeto con el derecho.

El entrenamiento se realizó sobre el dataset Shiki42/PutCab-Mixed-Train100-V4, compuesto por 100 episodios y 29.794 fotogramas a 16,67 FPS (unos 29,8 minutos de datos), con estado y acciones nativos de 14 dimensiones, tres vistas RGB a 224x224 y un horizonte de acción de 50 pasos. Se ejecutaron 10.000 actualizaciones con batch global 16 sobre dos H100 de 80 GB, con LoRA de rango/alpha 16 en PaliGemma y 32 en el *expert*.

Su relevancia es doble: por un lado, ejemplifica el flujo de trabajo de ajuste fino de bajo coste sobre un VLA grande para una única tarea de manipulación; por otro, documenta de forma inusualmente detallada la configuración de entrenamiento, las comprobaciones de guardado y recarga del checkpoint y los manifiestos del dataset. El autor no publica ninguna métrica de tasa de éxito ni resultados de *rollout*.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA PI0.5 en JAX sobre PaliGemma, con un unico action expert y adaptadores LoRA |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (entrenado con parametros congelados en bf16 y entrenables en float32; no se publican pesos cuantizados) |
| Idiomas soportados | no disponible; el unico prompt documentado esta en ingles |
| Licencia | no disponible |
| Formato de pesos | Checkpoint Orbax de JAX (raiz `10000/`); no se distribuye en safetensors ni GGUF |
| Modelo base | XinY0201/openpi-pi05-base-jax (commit 5e62884fcf8cb8f9fc693c9163ea18d3e3739658) |
| Dataset de entrenamiento | Shiki42/PutCab-Mixed-Train100-V4 (commit 543066d) |
| Dimension de estado/accion | 14 dimensiones absolutas nativas, rellenadas a 32 en el modelo |
| Vistas de entrada | 3 vistas RGB, transformaciones estandar a 224x224 |
| Horizonte de accion | 50 |
| Tamano del repositorio | 6,3 GB |
| Descargas y likes | 0 descargas, 0 likes |

## Arquitectura y entrenamiento

La arquitectura declarada es PI0.5 en su implementación JAX, con un único *action expert* y un *backbone* PaliGemma al que se aplican adaptadores LoRA (rango y alpha 16; rango 32 en el *expert*). El filtro de referencia de LoRA incluye los módulos de visión y proyecciones entrenables. El modelo consume tres vistas RGB, un vector de estado de 14 dimensiones y un prompt textual, y produce *chunks* de acción con horizonte 50, rellenados a 32 dimensiones. No se detallan en la información disponible otros aspectos internos del *backbone* (tipo de atención, mecanismo de generación de acciones, número total de parámetros).

El entrenamiento se llevó a cabo con dos H100 de 80 GB, batch global 16, semilla 87431 y 10.000 actualizaciones (160.000 muestras de acción procesadas). Se usó AdamW con beta1 0,9, beta2 0,95, epsilon 1e-8, weight decay 1e-10, clipping 1 y sin EMA, con un schedule coseno fijo diseñado para 30.000 pasos (warmup de 1.000, pico 2,5e-5, extremo 2,5e-6) detenido en el paso 10.000, por lo que el modelo no completó el decaimiento previsto. El autor indica que se superaron comprobaciones de guardado y recarga en CPU, decodificación real con tokenizer, normalización independiente por dataset y restauración estricta de parámetros y estado del optimizador (verificando el paso 10.000 y valores finitos), y que se conservan los hashes de los arrays decodificados. Los detalles de entorno, paquetes, configuraciones resueltas y el historial del trabajo (*job-eb252bcd-685b-43ec-927d-a40016a805f3*) están en `10000/experiment/`. El autor advierte que el contenedor NGC PyTorch 25.02 ejecuta un entorno JAX separado y no reclama identidad byte a byte con el runtime histórico archivado.

## Capacidades

- Predicción de acciones motoras bimanuales en 14 dimensiones absolutas (estado y acción), compatibles con una plataforma de dos brazos y dos pinzas, aunque el autor no especifica el hardware concreto.
- Condicionamiento multimodal: tres cámaras RGB a 224x224 más un prompt textual fijo.
- Ejecución de una única tarea de manipulación: abrir el cajón de un armario con el brazo izquierdo y colocar un objeto dentro con el brazo derecho.
- Generación de *chunks* de acción con horizonte 50 y salida rellenada a 32 dimensiones.
- No dispone de generación de texto, razonamiento simbólico, matemáticas ni código: es una política de control, no un modelo de lenguaje.
- No se documenta soporte de *tool calling*, *function calling* ni comportamiento de agente multi-paso.
- No se documentan capacidades multilingües; el prompt documentado está en inglés.
- No se documentan capacidades de visión general (detección, VQA, OCR) ni de audio.

## Casos de uso

- Manipulación bimanual de apertura de cajón e inserción de objetos: es exactamente la tarea para la que fue entrenado, con el prompt "Open the cabinet drawer with the left arm and place the object into it with the right arm" y observaciones de tres cámaras. Adecuado para reproducir el experimento en el mismo montaje robótico.
- Punto de partida para *fine-tuning* de nuevas tareas: al ser un adaptador LoRA sobre PI0.5, permite reentrenar únicamente los adaptadores para otras tareas de manipulación con un coste muy inferior al ajuste completo del *backbone*.
- Investigación en aprendizaje por imitación con pocos datos: el modelo demuestra un flujo completo de entrenamiento con 100 episodios y 29.794 fotogramas, útil como referencia metodológica sobre cuántos datos requiere una política VLA para una tarea acotada.
- Validación de infraestructuras JAX/Orbax para robótica: el repositorio incluye comprobaciones de guardado y recarga, hashes de arrays y manifiestos, lo que lo convierte en un caso de prueba para *pipelines* de entrenamiento distribuido en OpenPI.
- *Baseline* en comparativas de VLA bimanipulados: sirve como referencia de un ajuste LoRA de bajo rango frente a ajustes completos o políticas entrenadas desde cero en la misma tarea.
- Destilación o compresión para inferencia en el robot: el checkpoint y la LoRA pueden emplearse como profesor para generar trayectorias y entrenar políticas más pequeñas que se ejecuten en el ordenador embebido del manipulador.
- Auditoría de reproducibilidad: la semilla, el schedule, el batch, el optimizador y los commits del modelo base y del dataset están documentados, lo que permite intentar una replicación exacta del entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no reclama ninguna tasa de éxito de *rollout* ("No rollout success-rate claim") y no se aportan métricas de éxito en tarea, error de acción ni comparaciones con otros modelos.

## Requisitos de hardware

- Entrenamiento: dos GPU H100 de 80 GB, según la información del autor.
- Inferencia (estimación a partir del tamaño del repositorio, no confirmada por el autor): los 6,3 GB de checkpoint sugieren un mínimo en torno a 8 GB de VRAM solo para los pesos; hay que añadir memoria para activaciones, el *expert* y los *buffers* de las tres cámaras a 224x224. Conviene planificar al menos 12-16 GB de VRAM.
- GPU de consumo: probablemente ejecutable en RTX 4090, RTX 3090 o RTX 4080 (16 GB o más), siempre que el *stack* JAX/CUDA del equipo sea compatible; no hay confirmación del autor.
- Opciones de despliegue: la librería declarada es openpi (JAX, checkpoint Orbax). No se detallan en la información proporcionada servidores compatibles. llama.cpp, Ollama, vLLM y TGI no aplican, ya que no se publican pesos en GGUF ni safetensors.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| pi05-putcab-mixed-train100-v4-lora-10k | no disponible | Politica VLA ajustada con LoRA, tarea unica | no disponible | HuggingFace, 0 descargas, 0 likes | Sin metricas de exito publicadas |
| XinY0201/openpi-pi05-base-jax | no disponible | VLA PI0.5 base en JAX | no disponible | HuggingFace | Modelo de partida del ajuste |
| Otros VLA de proposito general (OpenVLA, pi0, GR00T N1, entre otros) | no disponible en la informacion proporcionada | Politicas vision-lenguaje-accion | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de datos de rendimiento que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Ausencia total de métricas: no hay tasa de éxito, número de *rollouts* ni evaluación en entorno real, y el propio autor lo declara.
- Tarea única y prompt fijo en inglés: el modelo no generaliza a otras instrucciones ni a otros objetos o muebles fuera de la distribución de entrenamiento.
- Dataset muy reducido: 100 episodios y 29.794 fotogramas (unos 29,8 minutos), recogidos presumiblemente en un montaje concreto; alto riesgo de sobreajuste a la iluminación, posiciones de cámara y disposición física de ese montaje.
- Sin licencia declarada: el uso comercial queda en una situación legal indeterminada y requiere contactar con el autor.
- Preprocesado específico: no se aplicaron máscara de inactividad, transformación delta ni conversión de unidades Aloha, y las acciones nativas de 14 dimensiones se rellenan a 32; es obligatorio reproducir exactamente esa normalización y ese rellenado para que la política funcione.
- Entrenamiento detenido en el paso 10.000 de un schedule coseno de 30.000, por lo que el modelo no alcanzó el extremo del decaimiento de *learning rate* previsto.
- Empaquetado poco convencional: sólo se distribuye un checkpoint Orbax para JAX, sin safetensors ni GGUF, lo que limita su uso fuera del ecosistema openpi.
- El autor advierte que el runtime del contenedor no es byte-idéntico al runtime histórico archivado, lo que introduce incertidumbre en la reproducibilidad exacta.
- Riesgo de alucinación o de acciones erráticas no cuantificado: al no existir evaluación publicada, no puede descartarse que la política falle de forma sistemática en estados fuera de distribución.
- Sesgos: no se documenta ningún análisis de sesgo, y en robótica el sesgo relevante es el de distribución de datos (posición, iluminación y configuración de la escena).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Travor278/pi05-putcab-mixed-train100-v4-lora-10k
- Modelo base: https://huggingface.co/XinY0201/openpi-pi05-base-jax
- Dataset de entrenamiento: https://huggingface.co/datasets/Shiki42/PutCab-Mixed-Train100-V4
- La busqueda web realizada no devolvio ningun enlace relevante para este modelo: los resultados obtenidos correspondian a paginas corporativas de Microsoft sin relacion con el proyecto. No se dispone de papers, blogs, repositorios ni demos adicionales.
