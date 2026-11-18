# xumanba/UniWAM

## Resumen

UniW(A)M es un framework de modelos de mundo y de mundo-acción (world-action models) desarrollado por Jingbo Xu y colaboradores, publicado en arXiv (2610.18697) y distribuido con licencia Apache 2.0 en Hugging Face bajo el identificador `xumanba/UniWAM`. Resuelve el problema de unificar en una sola arquitectura la modelización de mundo condicionada por acción (AC-WM) y cuatro interfaces distintas de world-action model (Joint-WAM, IDM-WAM, Action-Centric y Action-Only), evitando entrenar y mantener cinco modelos separados para robótica de manipulación.

La arquitectura se basa en Diffusion Transformers (DiT) con un esquema de mezcla de expertos (MoE): cada bloque FFN del DiT se replica en cinco expertos y se añade un router inicializado a cero. Los expertos compartidos capturan dinámicas comunes, mientras que expertos atómicos de capacidad (VGM, VLA, WM, IDM) se reutilizan entre interfaces. Un componente adicional, el adaptive interface router (PAIR), selecciona qué interfaz usar para cada chunk de acción con el backbone congelado.

El modelo es relevante para el ecosistema open source de robótica porque publica checkpoints para simulación (LIBERO, RoboTwin 2.0) y para un despliegue real de doble brazo AgileX en la tarea de doblar ropa, además de un checkpoint de inicialización de aproximadamente 31 GB para reentrenar en tareas nuevas. La librería declarada es `diffusers` y el pipeline es `robotics`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) con mezcla de expertos (MoE) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (es MoE, pero el número de expertos activos no se especifica) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería diffusers) |

## Arquitectura y entrenamiento

UniW(A)M parte de un backbone Diffusion Transformer en el que cada capa FFN se copia en cinco expertos y se añade un router inicializado a cero, formando un esquema MoE. Sobre esa base se definen expertos atómicos de capacidad (VGM, VLA, WM, IDM) que se reutilizan entre interfaces, de modo que los expertos compartidos aprenden dinámicas comunes y los expertos atómicos cubren capacidades específicas. El modelo unifica la modelización de mundo condicionada por acción (AC-WM) y cuatro interfaces de world-action model: Joint-WAM, IDM-WAM, Action-Centric y Action-Only.

El componente PAIR (adaptive interface router) selecciona la interfaz para cada chunk de acción manteniendo el backbone congelado, lo que permite cambiar de interfaz sin reentrenar el modelo completo. El repositorio publica cuatro checkpoints: uno de inicialización (~31 GB) con el DiT y los cinco expertos más el router a cero, uno de despliegue real de doble brazo AgileX para doblar ropa entrenado 150k pasos (~44 GB), uno para LIBERO (Spatial, Object, Goal, Long) y uno para RoboTwin 2.0. No se detalla en la información disponible el número de tokens de entrenamiento, la composición exacta de los datasets ni si se emplearon RLHF o DPO.

## Capacidades

- Modelización de mundo condicionada por acción (AC-WM) sobre secuencias de acciones robóticas.
- Cuatro interfaces de world-action model unificadas: Joint-WAM, IDM-WAM, Action-Centric y Action-Only.
- Selección adaptativa de interfaz por chunk de acción mediante PAIR con backbone congelado.
- Reutilización de expertos atómicos (VGM, VLA, WM, IDM) entre interfaces.
- Manipulación robótica en simulación: evaluable en LIBERO (Spatial, Object, Goal, Long) y RoboTwin 2.0.
- Despliegue en robot real de doble brazo AgileX para la tarea de doblar ropa.
- Punto de partida de inicialización para entrenar en tareas nuevas.
- Soporte de tool calling, agentes, razonamiento multi-paso, capacidades multilingües, visión general o audio: no disponible (no es un modelo de lenguaje general).

## Casos de uso

- Evaluación en simulación con LIBERO: usar el checkpoint `libero/` para medir el rendimiento del modelo en las suites Spatial, Object, Goal y Long antes de transferir a hardware real, aprovechando que el framework cubre varias interfaces en un solo backbone.
- Evaluación en RoboTwin 2.0: desplegar el checkpoint `robotwin2.0/` para comparar el comportamiento del modelo en un benchmark de manipulación bimanual estandarizado.
- Despliegue real de doble brazo: cargar el checkpoint `folding_clothes/` (AgileX, 150k pasos) para ejecutar la tarea de doblar ropa en un montaje físico de dos brazos.
- Reentrenamiento en tareas nuevas: partir del checkpoint `pretrained/` (~31 GB) con el DiT, los cinco expertos y el router a cero, y ajustar sobre un dataset propio de manipulación.
- Investigación sobre enrutado de interfaces: congelar el backbone y usar PAIR para estudiar qué interfaz (Joint-WAM, IDM-WAM, Action-Centric o Action-Only) selecciona el modelo por chunk de acción en distintas tareas.
- Modelización de mundo para planificación: emplear la interfaz AC-WM para predecir dinámicas condicionadas por acción y alimentar un planificador de trayectorias en manipulación.
- Reutilización de expertos atómicos: aprovechar los expertos VGM, VLA, WM e IDM en pipelines de investigación que necesiten capacidades específicas sin cargar un modelo distinto por cada una.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el checkpoint de inicialización ocupa ~31 GB y el de doblar ropa ~44 GB en disco, por lo que la carga completa en precisión nativa requiere GPUs de gran memoria.
- GPU recomendadas: no disponible en la información proporcionada; por el tamaño de los checkpoints, se requiere al menos hardware de clase A100/H100 para cargar los pesos completos.
- ¿Cabe en GPU de consumo? No disponible; con los tamaños indicados, no es viable en GPUs de consumo sin cuantización, y no se documentan tipos de cuantización.
- Opciones de despliegue: scripts de entrenamiento, inferencia y evaluación en el repositorio de código (https://github.com/xumanba/UniW-A-M); descarga mediante `huggingface_hub` o CLI `hf`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo de robótica).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (world-action models con MoE sobre DiT) ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- No se documentan sesgos conocidos del modelo.
- Riesgo de alucinación no evaluado en la información disponible; en un modelo de mundo, el riesgo equivalente es la predicción inexacta de dinámicas, sin métricas publicadas.
- No se especifican limitaciones de contexto ni de idioma; el modelo no es lingüístico.
- La licencia Apache 2.0 permite uso comercial, pero no se detallan restricciones adicionales sobre los datasets de entrenamiento ni sobre el hardware AgileX.
- Los checkpoints de simulación (LIBERO, RoboTwin 2.0) están ligados a esos entornos; su transferencia a hardware real no está garantizada.
- El checkpoint de doblar ropa está entrenado para una configuración concreta (doble brazo AgileX, 150k pasos); su generalización a otras tareas o robots no está documentada.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación de la comunidad.
- No se publican tipos de cuantización ni requisitos de VRAM explícitos, lo que dificulta planificar el despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/xumanba/UniWAM
- Paper (arXiv 2610.18697): https://arxiv.org/abs/2610.18697
- Código: https://github.com/xumanba/UniW-A-M
- Checkpoint de inicialización: https://huggingface.co/xumanba/UniWAM/tree/main/pretrained
- Checkpoint Folding Clothes: https://huggingface.co/xumanba/UniWAM/tree/main/folding_clothes
- Checkpoint LIBERO: https://huggingface.co/xumanba/UniWAM/tree/main/libero
- Checkpoint RoboTwin 2.0: https://huggingface.co/xumanba/UniWAM/tree/main/robotwin2.0
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
