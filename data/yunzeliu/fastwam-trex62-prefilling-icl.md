# YunzeLiu/fastwam-trex62-prefilling-icl

## Resumen

FastWAM T-Rex 62-D Prefilling ICL es un checkpoint de investigacion para robotica, desarrollado por Yunze Liu (estudiante de doctorado en la Universidad Tsinghua e investigador en NVIDIA Research) dentro del ecosistema FastWAM. Se trata de un modelo de aprendizaje por imitacion de tipo vision-lenguaje-accion (VLA) especializado en manipulacion bimanual, que incorpora aprendizaje en contexto (ICL) mediante tokens de contexto prefilled. El modelo parte del baseline FastWAM T-Rex en el paso 27,708 y se entrena de extremo a extremo sobre el subconjunto `pick_fruits` del dataset VLA2Vec, alcanzando 5,480 pasos de optimizacion.

La relevancia de este checkpoint radica en que aborda el problema de la latencia en los modelos de accion-mundo (World Action Models, WAM): en lugar de imaginar el futuro mediante denoising iterativo de video en tiempo de inferencia, FastWAM propone un paradigma alternativo que reduce la carga computacional. Este modelo concreto explora el prefilling de tokens de contexto precomputados (32x1024) para condicionar la politica sin necesidad de ejecutar el modelo de embedding original en inferencia. El repositorio incluye un servidor ZMQ compatible con T-Rex, el VAE de Wan, estadisticas de normalizacion y los tokens de contexto precalculados, lo que permite ejecutar el modelo en un robot real sin dependencias externas adicionales.

Se trata de un checkpoint de investigacion validado en cuanto a convergencia de entrenamiento, pero sin tasa de exito asignada en robot fisico. El tamano del repositorio es de 13.5 GB, con el checkpoint principal de 12 GB en formato PyTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastWAM T-Rex (vision-lenguaje-accion, basada en transformer) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 32 tokens de contexto (32x1024, float16) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (instruccion fija en ingles en el dataset) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (.pt) para el checkpoint; safetensors para VAE y features de referencia |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura FastWAM T-Rex, un modelo de accion-mundo que procesa entradas de tres camaras RGB (compuestas en un canvas de 448x384) y produce chunks de accion bimanual de 32 pasos en un espacio de 62 dimensiones (31 por brazo: delta xyz local, delta rot6d local y objetivos absolutos de mano Sharpa). La variante ICL de prefilling inyecta 32 tokens de contexto (shape 32x1024, float16) precomputados mediante el modelo RoboRAG-X (solo como procedencia, no se ejecuta en inferencia) y se fine-tunea de extremo a extremo desde el baseline T-Rex.

El entrenamiento se realizo sobre el subconjunto `pick_fruits` del dataset VLA2Vec, con una referencia fija auditada manualmente (candidato `004ac131050a539d91e6bdd4`) y un dropout de referencia de 0.10. El checkpoint alcanzo los 5,480 pasos de optimizacion planificados y supero la puerta de convergencia. No se especifica el numero total de tokens de entrenamiento ni la composicion exacta del dataset. No se menciona el uso de RLHF o DPO; el enfoque es de aprendizaje por imitacion supervisado.

Una innovacion destacable es el ciclo de inferencia Short-24: la condicion por referencia esta activa solo durante los primeros 24 pasos de control del robot, tras los cuales se desactiva. El servidor ejecuta una forward con referencia para los pasos 0-15, luego una con y otra sin referencia en el bloque 16-31, empalmando en el indice local 8. Esto reduce la latencia total al limitar el numero de forwards condicionados.

## Capacidades

- Manipulacion bimanual: genera acciones de 62 dimensiones para dos brazos, incluyendo deltas de posicion local, rotaciones rot6d y objetivos absolutos de mano Sharpa.
- Aprendizaje en contexto (ICL): condiciona la politica mediante tokens de contexto precomputados, sin necesidad de ejecutar el modelo de embedding en inferencia.
- Integracion con T-Rex: servidor ZMQ compatible con el cliente T-Rex, aceptando claves pickle/ZMQ estandar (`image_head`, `image_wrist_left`, `image_wrist_right`, `state_slow`, `task_description`).
- Ciclo de vida de inferencia configurable: soporta reseteo por episodio mediante `episode_id` y `control_step`, evitando fugas de estado entre episodios.
- Ejecucion offline: el repositorio incluye todos los artefactos necesarios (checkpoint, VAE, estadisticas, tokens de contexto) para inferencia sin conexion a GitHub ni datasets externos.
- Accion chunking: genera chunks de 32 pasos de accion, con ejecucion de 16 pasos por replanificacion.

## Casos de uso

- Recogida y colocacion de objetos en entornos de cocina: el modelo esta entrenado especificamente en la tarea `pick_fruits` (recoger fruta con la mano izquierda y derecha y colocarla en una cesta), por lo que es adecuado para demostraciones de manipulacion bimanual en entornos domesticos o industriales controlados.
- Investigacion en aprendizaje por imitacion con contexto: sirve como punto de partida para estudiar como el prefilling de tokens de contexto afecta a la precision y latencia en politicas VLA, comparando con variantes sin ICL o con referencia persistente.
- Desarrollo de sistemas de control robotico de baja latencia: el ciclo Short-24 permite evaluar el impacto de desactivar la condicion por referencia tras 24 pasos, util para aplicaciones donde la latencia de inferencia es critica.
- Benchmarking de modelos de accion-mundo: al ser un checkpoint de investigacion con convergencia validada, puede usarse como referencia para comparar paradigmas imagine-then-execute frente a enfoques sin imaginacion futura.
- Integracion en pipelines de robotica con T-Rex: el servidor ZMQ incluido permite conectar el modelo a un robot existente que ya use el cliente T-Rex, con un parche de ciclo de vida para reseteo por episodio.
- Validacion de tecnicas de compresion de contexto: los tokens de contexto precomputados (32x1024) pueden analizarse para entender que informacion retienen y como afecta al rendimiento de la politica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que el checkpoint ha superado la puerta de convergencia de entrenamiento, pero no se ha asignado una tasa de exito en robot fisico. No se proporcionan metricas como MMLU, HumanEval o GSM8K, ya que se trata de un modelo de robotica, no de lenguaje general. Tampoco se ofrecen comparativas numericas con otros modelos VLA o WAM.

## Requisitos de hardware

- VRAM estimada: el checkpoint principal pesa 12,051,075,733 bytes (~11.2 GiB) en float32, por lo que se estima que la inferencia requiere al menos 16-24 GB de VRAM en funcion de la precision de calculo y el uso de VAE. No hay datos oficiales de consumo.
- GPU recomendadas: el entorno de instalacion especifica CUDA 12.8 (torch 2.7.1 con cu128), por lo que se requieren GPUs NVIDIA con soporte para esa version. Modelos como RTX 4090 (24 GB), A100 (40/80 GB) o H100 (80 GB) serian adecuados.
- Compatibilidad con GPU de consumo: una RTX 4090 con 24 GB podria albergar el checkpoint, aunque el VAE de Wan (1.4 GB) y los buffers adicionales podrian acercarse al limite. No se garantiza en GPUs de menor VRAM.
- Opciones de despliegue: el repositorio incluye un servidor ZMQ propio (`inference/serve_trex62.py`) que se ejecuta con `--device cuda:0`. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI, ya que el modelo no es un LLM generativo sino una politica de robotica.
- Latencia y throughput: no se proporcionan datos medidos. El ciclo Short-24 reduce el numero de forwards condicionados, pero no hay cifras de latencia por paso.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados con otros modelos de la misma categoria. El modelo se basa en el baseline FastWAM T-Rex, pero no se ofrecen metricas comparativas. Como referencia cualitativa:

| Modelo | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| FastWAM T-Rex 62-D Prefilling ICL (este) | VLA con ICL | 32 tokens | no disponible | Checkpoint publico en HF |
| FastWAM T-Rex baseline | VLA | no disponible | no disponible | Codigo en GitHub (yuantianyuan01/FastWAM) |
| Otros VLA (p.ej. OpenVLA, RT-2) | VLA | variable | variable | Variable |

No se puede establecer una comparacion cuantitativa sin datos de benchmarks.

## Limitaciones y advertencias

- Checkpoint de investigacion: no tiene tasa de exito asignada en robot fisico; el propio autor indica que es un checkpoint de investigacion validado solo en convergencia de entrenamiento.
- Licencia no disponible: no se especifican terminos de uso, lo que impide garantizar su uso comercial o en proyectos propietarios.
- Sin benchmarks publicados: no hay metricas objetivas de rendimiento, lo que dificulta evaluar su calidad frente a alternativas.
- Contexto limitado: la condicion por referencia se desactiva tras 24 pasos de control (ciclo Short-24), lo que puede degradar el rendimiento en tareas que requieran memoria a largo plazo.
- Instruccion fija: el modelo se entrena con una unica descripcion de tarea en ingles ("Pick up the fruit on the left side..."), por lo que no es generalizable a otras instrucciones sin reentrenamiento.
- Dependencia de hardware especifico: requiere CUDA 12.8 y una GPU NVIDIA con suficiente VRAM; no hay soporte para CPU o aceleradores alternativos.
- Riesgo de alucinacion en acciones: como todo modelo de imitacion, puede generar acciones incorrectas o inseguras en entornos no vistos; se recomienda supervision humana en pruebas con robot real.
- Sin soporte multilingue: no se declaran idiomas soportados; la tarea esta definida en ingles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/YunzeLiu/fastwam-trex62-prefilling-icl
- Dataset VLA2Vec: https://huggingface.co/datasets/wushr-lance/VLA2Vec
- Repositorio FastWAM (GitHub): https://github.com/yuantianyuan01/FastWAM
- Paper "Fast-WAM: Do World Action Models Need Test-time Future Imagination?": https://arxiv.org/html/2603.16666v1
- Pagina personal del autor (Yunze Liu): https://yunzeliu.github.io/index.html
