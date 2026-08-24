# XYZPIT/vlash-random4-ee-gr00t-n1.6-160000

## Resumen

El modelo `XYZPIT/vlash-random4-ee-gr00t-n1.6-160000` es un finetune del modelo fundacional de robótica NVIDIA Isaac GR00T N1.6 (3B parámetros) desarrollado por el equipo XYZ Physical Intelligence (XYZPIT). Está diseñado específicamente para el embodiment Galaxea R1 Lite, un robot bimanual con dos pinzas, y produce acciones de pose de efector final (posición y orientación en formato rot6d) en lugar de acciones de articulaciones del brazo. Esto lo hace adecuado para pipelines que requieren un paso de cinemática inversa (IK) posterior.

La principal innovación es el aumento temporal VLASH: durante el entrenamiento se aplica un retardo aleatorio `k ~ U[0, 4]` entre la observación (video y lenguaje) y el estado/acción, de modo que el modelo aprende a predecir un chunk de acciones que comienza `k` pasos después de la observación dada. Esto permite la ejecución asíncrona de chunks en el robot real, ya que el siguiente chunk puede calcularse mientras el actual aún se está ejecutando. El checkpoint corresponde al paso 160000 de entrenamiento y solo incluye artefactos de inferencia (no se puede reanudar el entrenamiento).

El modelo se enmarca en la línea de vision-language-action (VLA) de NVIDIA, que combina un backbone de visión-lenguaje de la familia Cosmos con un cabezal de acción basado en un Diffusion Transformer (DiT) de 32 capas. Está pensado para tareas de manipulación bimanual en entornos reales, con un dataset de 50 episodios de la tarea `foldhoodie` (plegado de sudaderas) a 31 fps.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) basada en NVIDIA GR00T N1.6: backbone Cosmos + Diffusion Transformer (DiT) de 32 capas |
| Parametros totales | 3.286.608.832 (3,29 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors, tamaño 9,8 GB) |
| Idiomas soportados | no disponibles (modelo orientado a instrucciones visuales y de lenguaje, sin especificación de idiomas) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `nvidia/GR00T-N1.6-3B`, un VLA fundacional de 3 mil millones de parámetros preentrenado por NVIDIA para habilidades robóticas humanoides generales. La arquitectura combina un backbone de visión-lenguaje de la familia Cosmos con un cabezal de acción basado en un Diffusion Transformer (DiT) de 32 capas que denoisa acciones continuas a partir de entradas multimodales (instrucciones en lenguaje e imágenes de cámaras). Según NVIDIA, N1.6 converge más rápido que N1.5 y produce acciones más suaves, pero requiere un ajuste cuidadoso para evitar sobreajuste, aplicando regularización de estado, aumentos de datos y co-entrenamiento con datos de preentrenamiento.

El finetune de XYZPIT adapta este modelo al embodiment R1 Lite con acciones de efector final. Las modalidades de entrada son: video (3 vistas: cabeza, muñeca izquierda y muñeca derecha, 1 frame), estado (32 dimensiones: 6+6+1+1+9+9 para brazos, pinzas y poses de efector final) y acciones (20 dimensiones: 1+1+9+9 para pinzas y poses de efector final). Las poses de efector final se representan como `xyz + rot6d` (9 números por brazo, donde rot6d son las dos primeras filas de la matriz de rotación). Las acciones de efector final son relativas a la pose de efector final correspondiente, mientras que las pinzas son absolutas en escala 0-100.

El entrenamiento utiliza el aumento temporal VLASH: para cada muestra se extrae un retardo `k ~ U[0, 4]` y se desplazan las ventanas de estado y acción en `k` pasos, manteniendo video y lenguaje en el timestep base. El chunk de acción de entrenamiento es de 32 pasos, con un batch global de 32 y 160000 pasos. El dataset es `foldhoodie` del R1 Lite, con 50 episodios y 72474 frames a 31 fps. Se usa `use_state_ground_truth=true`, es decir, el estado retardado es el estado medido en `t + k`.

## Capacidades

- Control de efector final bimanual: genera acciones de pose (xyz + rot6d) para ambos brazos, más comandos de pinza (0-100), en lugar de acciones de articulaciones.
- Ejecución asíncrona de chunks: gracias al aumento de retardo, el modelo predice chunks que comienzan unos pasos después de la observación, permitiendo solapamiento entre cálculo y ejecución.
- Entrada multimodal: acepta 3 vistas de cámara (cabeza, muñecas) y una instrucción en lenguaje, junto con el estado del robot (32 dimensiones).
- Generalización a nuevos embodiments: el tag `new_embodiment` indica que el modelo se adapta a un embodiment distinto al del preentrenamiento (R1 Lite bimanual con 2 pinzas).
- Robustez a retardos: la evaluación open-loop muestra que el error de pose de efector final se mantiene bajo para retardos de 0 a 4 pasos, con mínimo en delay 1-2.
- No incluye soporte de tool calling ni razonamiento de propósito general: es un modelo puramente robótico, no un LLM conversacional.

## Casos de uso

- Plegado de prendas (foldhoodie): el modelo está entrenado específicamente para esta tarea, por lo que puede ejecutar el plegado de sudaderas en un robot R1 Lite con control de efector final.
- Manipulación bimanual con control fino de pose: al generar poses de efector final relativas, es adecuado para tareas que requieren posicionamiento preciso de ambos brazos, como ensamblaje o manipulación de objetos deformables.
- Integración en pipelines con cinemática inversa (IK): al producir poses de efector final, se puede conectar a un solucionador IK para convertir las poses en comandos de articulaciones, lo que permite reutilizar el modelo en robots con diferentes cinemáticas.
- Ejecución asíncrona en tiempo real: el retardo aprendido permite que el robot calcule el siguiente chunk mientras ejecuta el actual, reduciendo la latencia efectiva en bucles de control de alta frecuencia.
- Evaluación de políticas VLA en entornos simulados o reales: el checkpoint puede usarse con `Gr00tPolicy` de la librería `gr00t` para pruebas de open-loop o closed-loop.
- Investigación en aumento de datos temporales: el enfoque VLASH puede servir como referencia para estudiar el efecto del retardo en políticas de imitación para robótica.

## Benchmarks y rendimiento

La model card incluye una evaluación open-loop con barrido de retardos (delay sweep) sobre 3 trayectorias × 800 pasos, con horizonte 16, utilizando el script `gr00t/eval/delayed_open_loop_eval.py`. Los errores son MSE no normalizado promediado sobre trayectorias. Se evaluó sobre el conjunto de entrenamiento, por lo que los resultados reflejan ajuste a los datos de entrenamiento, no generalización a datos no vistos.

Error de pose de efector final (MSE, metros / unidades rot6d):

| delay | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
|---|---|---|---|---|---|---|---|---|---|
| left | 5.0e-5 | 4.4e-5 | **4.3e-5** | 4.9e-5 | 4.8e-5 | 5.3e-5 | 6.0e-5 | 6.8e-5 | 7.2e-5 |
| right | 6.1e-5 | **6.1e-5** | 6.3e-5 | 7.3e-5 | 7.8e-5 | 8.5e-5 | 9.8e-5 | 1.04e-4 | 1.13e-4 |
| mean | 5.5e-5 | **5.2e-5** | 5.3e-5 | 6.1e-5 | 6.3e-5 | 6.9e-5 | 7.9e-5 | 8.6e-5 | 9.2e-5 |

El error mínimo se alcanza en delay 1-2 (media de la distribución U[0,4] de entrenamiento) y aumenta monótonamente hasta delay 8 (aproximadamente 1,8× el mínimo). El MAE en el mínimo es de 3,2e-3 (izquierda) y 4,3e-3 (derecha), es decir, unos pocos milímetros frente a un rango xyz de 0,3-0,45 m. El error de las pinzas no correlaciona con el delay, ya que son transiciones casi binarias 0/100 y la dispersión entre trayectorias domina. No se han publicado resultados en benchmarks estándar tipo MMLU o HumanEval, al tratarse de un modelo de robótica.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de VRAM ni GPU en la documentación del modelo.
- El tamaño del repositorio es de 9,8 GB, lo que sugiere pesos en FP16 o BF16 (3,3B parámetros × 2 bytes ≈ 6,6 GB, más overhead).
- Para inferencia en FP16, se estima que se necesitan al menos 8-12 GB de VRAM, por lo que podría ejecutarse en GPUs de consumo como RTX 3090, RTX 4090 o GPUs profesionales como A10, L4, A100, H100.
- No se mencionan opciones de despliegue específicas (vLLM, llama.cpp, etc.). El modelo se usa a través de la librería `gr00t` de NVIDIA, con la clase `Gr00tPolicy`.
- La latencia y el throughput no están documentados; dependen del hardware y del tamaño de chunk (32 pasos de acción).

## Comparativa con modelos similares

| Modelo | Parámetros | Acciones | Retardo | Dataset | Licencia |
|---|---|---|---|---|---|
| `XYZPIT/vlash-random4-ee-gr00t-n1.6-160000` (este) | 3,29 B | Pose de efector final (xyz+rot6d) | VLASH U[0,4] | foldhoodie, 50 episodios | no disponible |
| `XYZPIT/vlash-random4-gr00t-n1.6-160000` (variante joint) | 3,29 B (presumible) | Articulaciones del brazo | VLASH U[0,4] | foldhoodie, 50 episodios | no disponible |
| `nvidia/GR00T-N1.6-3B` (base) | 3 B | Acciones continuas (articulaciones o efector) | Sin retardo | Preentrenamiento masivo | no disponible |

La variante joint no requiere paso de IK aguas abajo, mientras que la variante EE (este modelo) sí. El modelo base de NVIDIA es el punto de partida y no está adaptado a un embodiment específico. No se dispone de comparativas de rendimiento entre estas variantes más allá de la evaluación open-loop reportada.

## Limitaciones y advertencias

- La evaluación open-loop se realizó sobre el conjunto de entrenamiento, por lo que los errores reportados reflejan ajuste a los datos de entrenamiento y no generalización a datos no vistos.
- Las etiquetas de acción de efector final en el dataset son la pose medida en `t+1` (pseudo-acción desplazada del estado), no el objetivo comandado por el controlador, por lo que no incluyen error de seguimiento ni retardo de actuación.
- El checkpoint solo incluye artefactos de inferencia; no se puede reanudar el entrenamiento (faltan `optimizer.pt`, `scheduler.pt`, etc.).
- Requiere un paso de cinemática inversa (IK) aguas abajo para convertir las poses de efector final en comandos de articulaciones, lo que añade complejidad al pipeline.
- El retardo aprendido implica que el chunk devuelto debe comenzar a ejecutarse unos pasos después de la observación; si se ejecuta inmediatamente, el comportamiento puede degradarse.
- No se especifican sesgos conocidos, pero al ser un modelo entrenado en un dataset reducido (50 episodios de una sola tarea), su capacidad de generalización a otras tareas o entornos es limitada.
- La licencia no está disponible, lo que impide conocer las restricciones de uso comercial.
- No se proporcionan datos sobre idiomas soportados; la instrucción en lenguaje probablemente esté en inglés, pero no está confirmado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/XYZPIT/vlash-random4-ee-gr00t-n1.6-160000
- Organización XYZPIT: https://huggingface.co/XYZPIT/models
- Variante con acciones de articulaciones: https://huggingface.co/XYZPIT/vlash-random4-gr00t-n1.6-160000
- Página de NVIDIA sobre GR00T N1.6: https://research.nvidia.com/labs/gear/gr00t-n1_6/
- Repo GitHub GR00T4me (NVIDIA Isaac GR00T N1.6): https://github.com/SLCZ687/GR00T4me
- Guía de fine-tuning en DGX Station: https://build.nvidia.com/station/gr00t
