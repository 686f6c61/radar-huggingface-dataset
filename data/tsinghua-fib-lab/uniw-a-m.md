# tsinghua-fib-lab/UniW-A-M

## Resumen

UniW(A)M es un modelo de mundo y de mundo-acción (world model y world-action model) para robótica de manipulación, desarrollado por el laboratorio FIB del departamento de ciencias de la computación de la Universidad de Tsinghua. Se trata de un framework de mezcla de expertos (MoE) construido sobre Diffusion Transformers (DiT) que unifica en un único backbone la modelización de mundo condicionada por acción (AC-WM) y cuatro interfaces de world-action model (Joint-WAM, IDM-WAM, Action-Centric y Action-Only). El modelo resuelve el problema de tener que entrenar arquitecturas separadas para cada paradigma de control robótico, reutilizando expertos atómicos compartidos entre interfaces.

La innovación principal es la separación entre expertos compartidos, que capturan la dinámica común del entorno, y expertos de capacidad atómica (VGM, VLA, WM, IDM) reutilizados entre las distintas interfaces. Un router adaptativo enchufable (PAIR) selecciona la interfaz adecuada para cada chunk de acción manteniendo el backbone congelado, lo que permite adaptar el modelo a nuevas tareas sin reentrenar los pesos principales.

El repositorio publica cuatro checkpoints: la inicialización preentrenada del DiT con cinco expertos (~31 GB), un checkpoint de plegado de ropa en robot real de doble brazo AgileX entrenado 150k pasos (~44 GB), y checkpoints de evaluación en simulación para LIBERO y RoboTwin 2.0. La licencia es Apache 2.0 y el tamaño total del repositorio es de 78,8 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) con mezcla de expertos (MoE); 5 expertos por capa FFN y router inicializado a cero |
| Parametros totales | no disponible |
| Parametros activos | no disponible (MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica; el codificador de texto es umT5) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería pytorch) |

## Arquitectura y entrenamiento

UniW(A)M se construye sobre un Diffusion Transformer en el que cada capa feed-forward se replica en cinco expertos y se añade un router inicializado a cero; ese es el checkpoint de inicialización (`pretrained/`, ~31 GB). Sobre ese backbone se definen expertos de capacidad atómica (VGM, VLA, WM, IDM) que se reutilizan entre las cuatro interfaces de world-action model, mientras que los expertos compartidos capturan la dinámica común del entorno. El router adaptativo PAIR selecciona la interfaz para cada chunk de acción con el backbone congelado, de modo que la adaptación a un dominio nuevo se reduce a entrenar el router.

El checkpoint de plegado de ropa incorpora el DiT, los codificadores de texto e imagen y el VAE; el tokenizador umT5 no está incluido y debe pasarse por separado mediante `tokenizer_path` (por ejemplo `google/umt5-xxl` de Wan2.2-TI2V-5B). No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO.

## Capacidades

- Modelización de mundo condicionada por acción (AC-WM): predicción de la evolución visual del entorno dada una acción.
- Cuatro interfaces de world-action model unificadas: Joint-WAM, IDM-WAM, Action-Centric y Action-Only.
- Generación de acciones de manipulación robótica a partir de observaciones visuales e instrucciones.
- Enrutado adaptativo por chunk de acción mediante PAIR, con backbone congelado.
- Control de robots de doble brazo en entornos reales (checkpoint AgileX de plegado de ropa).
- Evaluación en simulación en LIBERO (Spatial, Object, Goal, Long) y RoboTwin 2.0.
- Codificación de instrucciones en lenguaje natural mediante umT5 y codificadores de imagen.
- No se documentan en la información disponible capacidades de tool calling, agentes multi-paso, audio ni modo de razonamiento explícito.

## Casos de uso

- Plegado de ropa con robot de doble brazo: el checkpoint `folding_clothes/` está entrenado 150k pasos sobre hardware AgileX real y puede desplegarse directamente para evaluación en robot físico.
- Investigación en world models: el checkpoint `pretrained/` sirve como inicialización para entrenar nuevas tareas reutilizando los cinco expertos y el router, sin partir de cero.
- Evaluación comparativa de paradigmas de control: las cuatro interfaces (Joint-WAM, IDM-WAM, Action-Centric, Action-Only) permiten medir en un mismo backbone qué formulación funciona mejor para una tarea.
- Benchmark en simulación con LIBERO: los checkpoints de LIBERO permiten reproducir evaluaciones en las suites Spatial, Object, Goal y Long antes de transferir a robot real.
- Benchmark en RoboTwin 2.0: el checkpoint correspondiente permite evaluar manipulación bimanual en simulación con escenarios estandarizados.
- Adaptación a dominio nuevo mediante PAIR: entrenando solo el router sobre datos del dominio objetivo se ajusta la selección de interfaz sin reentrenar los 31 GB del backbone.
- Prototipado de políticas de manipulación condicionadas por lenguaje: usando el codificador umT5 y el VAE incluidos en el checkpoint de plegado se pueden generar acciones a partir de instrucciones en lenguaje natural.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el checkpoint de inicialización ocupa ~31 GB y el de plegado de ropa ~44 GB en disco, por lo que la inferencia en precisión completa requiere GPUs de clase数据中心 (A100 80 GB, H100 80 GB) o sharding multi-GPU.
- GPU recomendadas: A100 80 GB o H100 para los checkpoints completos; no se documenta soporte en GPUs de consumo.
- ¿Cabe en GPU de consumo? No disponible; con los tamaños de checkpoint publicados no es viable en GPUs de 24 GB sin cuantización, y no se documentan formatos cuantizados.
- Opciones de despliegue: los pesos se cargan con el código de UniW(A)M, no con `diffusers.DiffusionPipeline`; los scripts de entrenamiento, inferencia y evaluación están en el repositorio de GitHub.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de parámetros, contexto ni rendimiento de modelos comparables de world-action modeling, por lo que la comparativa cuantitativa no está disponible. Como referencia cualitativa, UniW(A)M se distingue por unificar cuatro interfaces de world-action model en un solo backbone MoE con enrutado PAIR, frente a enfoques habituales que entrenan una arquitectura por paradigma.

## Limitaciones y advertencias

- El router PAIR es específico de cada tarea y no se incluye en los checkpoints publicados; es necesario entrenarlo con el pipeline PAIR sobre datos del dominio objetivo.
- El tokenizador umT5 no está incluido en el checkpoint de plegado de ropa y debe descargarse por separado (`google/umt5-xxl`).
- Los pesos no son compatibles con `diffusers.DiffusionPipeline`; requieren el código propio del repositorio.
- No se documentan sesgos conocidos, tasas de alucinación ni limitaciones de contexto o idioma en la información disponible.
- El modelo está orientado a robótica de manipulación; no se documentan capacidades de texto general, código o matemáticas.
- El tamaño de los checkpoints (31-44 GB) limita el despliegue a infraestructura con GPUs de gran memoria.
- La licencia Apache 2.0 permite uso comercial, pero el rendimiento en producción fuera de los dominios evaluados (plegado de ropa, LIBERO, RoboTwin 2.0) no está verificado en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/tsinghua-fib-lab/UniW-A-M
- Paper (arXiv 2610.18697): https://arxiv.org/abs/2610.18697
- Página del proyecto: https://tsinghua-fib-lab.github.io/UniW-A-M/
- Código en GitHub: https://github.com/tsinghua-fib-lab/UniW-A-M
- Guía de inferencia: https://github.com/tsinghua-fib-lab/UniW-A-M/blob/main/docs/inference.md
- Documentación de PAIR: https://github.com/tsinghua-fib-lab/UniW-A-M/blob/main/docs/pair.md
- Checkpoint de inicialización: https://huggingface.co/tsinghua-fib-lab/UniW-A-M/tree/main/pretrained
- Checkpoint de plegado de ropa: https://huggingface.co/tsinghua-fib-lab/UniW-A-M/tree/main/folding_clothes
- Checkpoint LIBERO: https://huggingface.co/tsinghua-fib-lab/UniW-A-M/tree/main/libero
- Checkpoint RoboTwin 2.0: https://huggingface.co/tsinghua-fib-lab/UniW-A-M/tree/main/robotwin2.0
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
