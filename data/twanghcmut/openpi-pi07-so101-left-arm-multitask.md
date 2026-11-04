# twanghcmut/openpi-pi07-so101-left-arm-multitask

## Resumen

`openpi-pi07-so101-left-arm-multitask` es un modelo de visión-lenguaje-acción (VLA) para robótica, publicado por el usuario twanghcmut en HuggingFace. Se trata de un fine-tune completo del checkpoint `pi05_base` de Physical Intelligence (openpi), adaptado al brazo robótico SO101 (variante izquierda, 5 articulaciones más pinza) y entrenado sobre un conjunto multitarea de 11 tareas de manipulación. El modelo sigue la receta pi0.5 con tres extensiones descritas como "pi0.7-style": prompting con metadatos de episodio (token de velocidad), entrenamiento con chunking en tiempo real y aislamiento de conocimiento mediante una pérdida sobre tokens FAST.

El modelo resuelve el problema de controlar un brazo robótico de bajo coste mediante instrucciones en lenguaje natural: una única red cubre las 11 tareas y la instrucción textual selecciona el comportamiento. Cuenta con aproximadamente 3.617 millones de parámetros (3,6 B) almacenados en safetensors, un repositorio de 37,4 GB y una ventana de contexto de 250 tokens (`max_token_len`). La acción se emite como un chunk de 50 pasos (1,67 s a 30 fps) con las 5 articulaciones del brazo en deltas respecto al estado actual y la pinza en valor absoluto.

Es relevante ahora porque demuestra la aplicación de la familia pi0.5/openpi a hardware asequible (SO101) y publica de forma transparente tanto los resultados como sus limitaciones: el autor advierte explícitamente de que, en el protocolo de evaluación en bucle abierto, el error absoluto medio (MAE) es superior al de simplemente repetir la primera acción registrada de cada chunk, y que el modelo no se ha probado en el robot real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en openpi pi0.5 (transformer multimodal con experto de acción y flow matching) |
| Parámetros totales | 3.616.757.520 (≈3,6 B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 250 tokens (`max_token_len`) |
| Tipos de cuantización | no disponible (pesos en bfloat16 en entrenamiento; no se documentan cuantizaciones publicadas) |
| Idiomas soportados | no disponible (las instrucciones de entrenamiento están en inglés) |
| Licencia | `other`, con `license_name: gemma` y enlace a los términos de Gemma (https://ai.google.dev/gemma/terms) |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

El modelo parte de `pi05_base` de openpi, convertido a PyTorch, y se somete a un fine-tune completo de todos los pesos en bfloat16 (el entrenador en PyTorch no incluye LoRA, EMA ni FSDP). La arquitectura es la de pi0.5: un backbone visión-lenguaje con un experto de acción entrenado mediante flow matching, al que se añade una pérdida sobre tokens FAST. La entrada combina dos cámaras (`top` a 360x640 mapeada a `base_0_rgb`, y `wrist` a 480x640 mapeada a `left_wrist_0_rgb`, con el slot de muñeca derecha enmascarado) con el estado de 6 dimensiones (5 articulaciones más apertura de pinza, rellenado a 32) y la instrucción textual.

El entrenamiento se realizó durante 30.000 pasos con batch total de 16 (8 por GPU en 2 GPUs), lo que supone 480.000 muestras y aproximadamente 1,9 épocas sobre 551 episodios y 253.745 fotogramas a 30 fps. Se usó AdamW con pico de 2,5e-5, 1.000 pasos de warmup, decaimiento coseno hasta 2,5e-6, weight decay 1e-10 y recorte de gradiente 1,0. Las opciones de modelo incluyen `action_horizon 50`, `rtc_max_delay 6` (200 ms a 30 fps), `knowledge_insulation True` y checkpointing de gradientes. El cómputo se ejecutó en 2 slices H100 MIG 3g.40gb (36,8 GiB por slice) con DDP, durante 14 h 40 min a 1,76 s/paso. La pérdida combinada (flow matching más FAST) bajó de 14,5 en los primeros 100 pasos a 3,58 de media en los últimos 100 pasos registrados, con una curva casi plana en los últimos 10.000 pasos.

Las tres innovaciones técnicas declaradas son: prompting con metadatos de episodio (el prompt incluye un token de velocidad, aquí `Speed: 300`, correspondiente al percentil 15 de duración de episodios, es decir, una petición más rápida que la mediana), entrenamiento con chunking en tiempo real (los primeros pasos de un chunk pueden aportarse como prefijo ya comprometido) y aislamiento de conocimiento (la pérdida FAST entrena el backbone mientras se bloquea el gradiente del experto de acción hacia él). El repositorio contiene cinco versiones: v1 en la raíz (MAE 15,27 %), v2 en `v2/` (14,05 %), v3 en `v3/` (11,69 %), v3_memory en `v3_memory/` (11,55 %, la mejor) y RECAP v3 en `recap_v3/` (11,93 % de media en dos ejecuciones).

## Capacidades

- Control robótico de manipulación multitarea: un único modelo cubre 11 tareas seleccionables mediante instrucción en lenguaje natural.
- Generación de acciones en chunks de 50 pasos (1,67 s a 30 fps) con salidas como objetivos articulares absolutos.
- Percepción visual dual: cámara cenital y cámara de muñeca, con enmascaramiento del slot de muñeca derecho.
- Condicionamiento por instrucción textual exacta: el modelo no se ha entrenado con paráfrasis, por lo que requiere el enunciado literal de cada tarea.
- Condicionamiento por token de velocidad (`Speed: <n>`), que modula la rapidez de ejecución solicitada.
- Memoria temporal en la variante v3_memory: dos fotogramas pasados por cámara.
- Soporte de chunking en tiempo real, que permite reutilizar un prefijo de acciones ya comprometidas.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, matemáticas, código ni audio.

## Casos de uso

- Manipulación pick-and-place en laboratorio: el modelo ejecuta instrucciones como "Pick up the red cube and place it into the steel pot." sobre el brazo SO101, adecuado para prototipos de investigación con hardware de bajo coste.
- Apilado de bloques y cubos: tareas como "Stack the yellow cube on top of the orange cube." permiten evaluar políticas de precisión posicional con un solo modelo.
- Tareas de razonamiento visual simple: la instrucción 8 ("Pick up the cube that makes the number of red and blue cubes on the wooden board equal...") requiere contar y comparar objetos, útil para estudiar capacidades de grounding visual en VLAs.
- Secuencias compuestas de varios pasos: la instrucción 9 encadena coger un cubo, introducirlo en un cubo hueco y mover este último, lo que sirve para analizar la planificación implícita en el chunk de 50 acciones.
- Ordenación por atributos: la instrucción 10 ("Take out the blue cubes from shortest to tallest...") permite estudiar el razonamiento sobre propiedades geométricas de los objetos.
- Investigación en memoria temporal: la variante v3_memory, con dos fotogramas pasados por cámara, es adecuada para comparar el efecto de la memoria visual en el error de predicción de acciones.
- Estudio de métodos de entrenamiento: las variantes v1, v2, v3, v3_memory y RECAP v3 permiten comparar recetas (chunking en tiempo real, aislamiento de conocimiento, ventajas RECAP) sobre el mismo conjunto de datos.
- Manipulación con cierre de contenedor: la instrucción 2 incluye cerrar la tapa de una olla tras depositar un objeto, caso útil para evaluar control fino de la pinza.

## Benchmarks y rendimiento

El autor publica una evaluación en bucle abierto (in-sample) sobre las mismas 11 trayectorias de entrenamiento, con el script `so101/eval_open_loop.py`, hasta 400 pasos y llamando a la política cada 16 pasos. La métrica es el MAE (error absoluto medio). No se proporcionan resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque no aplican a este tipo de modelo.

| Versión | Configuración | MAE |
|---|---|---|
| v1 (raíz) | Base | 15,27 % |
| v2 (`v2/`) | Intermedia | 14,05 % |
| v3 (`v3/`) | Sin memoria | 11,69 % |
| v3_memory (`v3_memory/`) | Dos fotogramas pasados por cámara | 11,55 % (mejor) |
| RECAP v3 (`recap_v3/`) | v3_memory con ventajas RECAP (π0.6*) e imágenes de subobjetivo | 11,93 % (media de dos ejecuciones) |

Advertencia del autor: en este protocolo de bucle abierto, el MAE del modelo es superior al de simplemente repetir la primera acción registrada de cada chunk de 16 pasos. No se han publicado resultados en robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 3,6 B parámetros, en bfloat16 los pesos ocupan aproximadamente 7,2 GB, más el coste del backbone visual y de los buffers de activación, no cuantificado en la información disponible.
- GPU de entrenamiento documentadas: 2 slices H100 MIG 3g.40gb (36,8 GiB por slice), 14 h 40 min a 1,76 s/paso con batch 8 por GPU.
- GPU recomendadas para inferencia: no disponibles; por tamaño de pesos, una GPU consumer con 16 GB o más podría alojar los pesos en bfloat16, pero no se confirma compatibilidad ni rendimiento.
- Despliegue: el modelo usa la librería `lerobot` y el código del fork `hungho77/openpi` (configuraciones `pi05_so101_left`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un VLA de este tipo.
- Latencia y throughput: no disponibles; el entrenamiento reporta 1,76 s/paso, no inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `twanghcmut/openpi-pi07-so101-left-arm-multitask` | ≈3,6 B | 250 tokens | 11 (SO101 brazo izquierdo) | `other` (Gemma) | HuggingFace, 0 descargas |
| `physical-intelligence/pi05_base` | no disponible | no disponible | base generalista openpi | no disponible en la información | HuggingFace (modelo base) |
| `openpi` pi0.5 (receta original) | no disponible | no disponible | robótica general | no disponible en la información | Repositorio openpi de Physical Intelligence |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada. El propio autor sitúa este modelo dentro de su serie de variantes (v1 a RECAP v3), que constituyen la comparación más directa disponible.

## Limitaciones y advertencias

- El MAE en bucle abierto es superior al de la línea base trivial de repetir la primera acción de cada chunk de 16 pasos, según advierte el propio autor.
- El modelo no se ha evaluado en el robot real; todos los resultados son in-sample y en bucle abierto.
- No se ha entrenado con paráfrasis: requiere el enunciado literal de cada instrucción, incluida la puntuación final.
- El token de velocidad `Speed: 300` solicita una ejecución más rápida que la mediana de las grabaciones (percentil 15 de duración de episodios).
- La licencia es `other` con nombre `gemma` y remite a los términos de Gemma; es necesario revisar dichos términos antes de cualquier uso comercial.
- El conjunto de datos es reducido (551 episodios, 253.745 fotogramas) y específico de un único embodiment (SO101 brazo izquierdo), lo que limita la generalización a otras configuraciones.
- El modelo solo controla 5 articulaciones más pinza; no cubre el brazo derecho.
- No se documentan sesgos, riesgos de alucinación lingüística ni cobertura multilingüe; el modelo no es un LLM de propósito general.
- La curva de pérdida es casi plana en los últimos 10.000 pasos, lo que sugiere posible saturación del entrenamiento con esta configuración.
- El repositorio ocupa 37,4 GB e incluye cinco versiones, lo que incrementa los requisitos de almacenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/twanghcmut/openpi-pi07-so101-left-arm-multitask
- Modelo base: https://huggingface.co/physical-intelligence/pi05_base
- Código del fork openpi: https://github.com/hungho77/openpi
- Colección de datasets SO101_LeftArmOnly_Task: https://huggingface.co/collections/hungho77/so101-leftarmonly-task
- Términos de licencia Gemma: https://ai.google.dev/gemma/terms
- Documentación de la receta pi0.7 en el fork: `docs/pi07.md` (dentro del repositorio de código)
