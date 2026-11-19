# testaccount129312/LoopedWAM

## Resumen

LoopedWAM es un modelo de accion mundial (world-action model) orientado a robotica, desarrollado por el autor Anh Dao (junto con Xinxin Liu, Hang Yu, Jeffrey A. Chan Santiago y Yuzhang Shang). Resuelve el problema de generar politicas de control para manipulacion robotica en entornos simulados (LIBERO, RoboTwin 2.0 y RoboCasa-GR1) combinando un experto de video con un nucleo de accion compartido que se ejecuta de forma iterativa.

La arquitectura se apoya en el VAE y el codificador de texto T5 de Wan2.1-T2V-1.3B, y el nucleo de accion tiene 0,58B parametros en FP32. La innovacion central es el "looping" del nucleo de accion: LoopedWAM ejecuta su core compartido K_a = 4 veces por paso de denoising, con N = 10 pasos por defecto, mientras que la variante LoopedWAM-E es un unico checkpoint destilado que permite elegir en inferencia cualquier K_a en {1, 2, 4} y cualquier N en {2, 5, 10}, habilitando inferencia elastica segun el presupuesto de computo disponible.

Es relevante ahora porque ofrece checkpoints especificos por benchmark (4 suites de LIBERO, 50 tareas de RoboTwin 2.0 y 24 tareas de sobremesa de RoboCasa-GR1) bajo licencia Apache 2.0, con codigo de entrenamiento y evaluacion publicado, lo que facilita reproducibilidad y comparacion en el area de world-action models para robotica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | World-action model con nucleo de accion compartido y bucle iterativo; experto de video y codificador de texto T5 de Wan2.1-T2V-1.3B |
| Parametros totales | 0,58B (nucleo de accion, FP32) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en FP32) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `policy.pt` (PyTorch, FP32); componentes auxiliares `Wan2.1_VAE.pth` y `models_t5_umt5-xxl-enc-bf16.pth` |

## Arquitectura y entrenamiento

LoopedWAM combina un experto de video (basado en Wan2.1-T2V-1.3B) con un nucleo de accion compartido de 0,58B parametros que se reutiliza varias veces por paso de denoising. En la configuracion por defecto, el nucleo se ejecuta K_a = 4 veces por paso con N = 10 pasos de denoising. La variante LoopedWAM-E se destila a partir del LoopedWAM del mismo benchmark y contiene tambien el experto de video de su modelo profesor, de modo que se carga de forma autonoma. El checkpoint almacena la propia arquitectura, por lo que no requiere definirla externamente.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF/DPO. El modelo se evalua en tres benchmarks de robotica: LIBERO (4 suites), RoboTwin 2.0 (50 tareas) y RoboCasa-GR1 (24 tareas de sobremesa). La innovacion tecnica destacable es la inferencia elastica: LoopedWAM-E permite elegir en tiempo de inferencia K_a en {1, 2, 4} y N en {2, 5, 10}, ajustando el coste computacional al presupuesto disponible sin cambiar de checkpoint.

## Capacidades

- Generacion de acciones de control para manipulacion robotica en entornos simulados.
- Politicas especificas por benchmark: LIBERO, RoboTwin 2.0 y RoboCasa-GR1.
- Inferencia elastica mediante LoopedWAM-E, seleccionando el numero de bucles de accion (K_a) y de pasos de denoising (N) en tiempo de inferencia.
- Integracion con el VAE y el codificador de texto T5 de Wan2.1-T2V-1.3B para el componente de video y condicionamiento textual.
- Normalizacion de acciones y propriocepcion mediante `dataset_stats.json`.
- Evaluacion multi-GPU (los scripts de evaluacion admiten `--gpus 0,1,2,3`).
- No se documentan capacidades de tool calling, agentes multi-paso, vision general, audio ni modo de razonamiento explicito.

## Casos de uso

- Evaluacion de politicas en LIBERO: usar los checkpoints `libero/LoopedWAM` o `libero/LoopedWAM-E` para medir el rendimiento en las 4 suites del benchmark con los scripts de evaluacion publicados.
- Benchmarking en RoboTwin 2.0: desplegar los checkpoints `robotwin50/LoopedWAM` para las 50 tareas y comparar configuraciones de K_a y N.
- Manipulacion de sobremesa en RoboCasa-GR1: emplear los checkpoints `robocasa_gr1/LoopedWAM` en las 24 tareas de tabletop para estudiar politicas de agarre y colocacion.
- Inferencia con presupuesto limitado: usar LoopedWAM-E con K_a = 1 y N = 2 para reducir el coste computacional en entornos con pocos recursos, sacrificando calidad a cambio de latencia.
- Inferencia de alta calidad: usar LoopedWAM con K_a = 4 y N = 10 cuando se disponga de varias GPU y se priorice el rendimiento en tarea.
- Reproduccion de experimentos: clonar el repositorio de GitHub y reutilizar los scripts de entrenamiento y evaluacion para reproducir los resultados de los tres benchmarks.
- Investigacion en world-action models: servir como linea base para estudiar el efecto del looping del nucleo de accion y de la destilacion elastica en politicas roboticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card unicamente enumera los benchmarks evaluados (LIBERO con 4 suites, RoboTwin 2.0 con 50 tareas y RoboCasa-GR1 con 24 tareas de sobremesa) y las variantes de checkpoint, sin incluir cifras de exito ni comparaciones cuantitativas.

## Requisitos de hardware

- El nucleo de accion tiene 0,58B parametros en FP32; el repositorio completo ocupa 16,8 GB, incluyendo checkpoints por benchmark.
- Se requieren ademas el VAE (`Wan2.1_VAE.pth`) y el codificador de texto T5 (`models_t5_umt5-xxl-enc-bf16.pth`, `google/umt5-xxl`) de Wan2.1-T2V-1.3B, que anaden requisitos de memoria y computo.
- Los scripts de evaluacion documentados admiten multiples GPU (`--gpus 0,1,2,3`), lo que sugiere despliegue multi-GPU para evaluacion.
- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible; el ejemplo de evaluacion usa 4 GPU.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: scripts de evaluacion y entrenamiento del repositorio de GitHub; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables de la misma categoria (world-action models para robotica) en la informacion proporcionada.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LoopedWAM | 0,58B (nucleo de accion) | no disponible | no disponible | Apache 2.0 | Hugging Face + GitHub |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo esta orientado exclusivamente a robotica en simulacion (LIBERO, RoboTwin 2.0, RoboCasa-GR1); no se documenta validacion en robot real.
- No se dispone de informacion sobre sesgos, tasas de alucinacion ni limitaciones de idioma.
- Los checkpoints estan especializados por benchmark; no hay un checkpoint unico que cubra las tres tareas.
- Requiere descargar componentes externos de Wan2.1-T2V-1.3B (VAE y T5) para funcionar, lo que incrementa el espacio en disco y la memoria necesaria.
- Los pesos se publican en FP32; no se documentan versiones cuantizadas, lo que limita el despliegue en hardware de gama baja.
- No se documentan latencias, throughput ni requisitos minimos de VRAM, lo que dificulta planificar produccion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el ID de Hugging Face (`testaccount129312`) sugiere una cuenta de prueba; conviene verificar la procedencia y el mantenimiento antes de usarlo en produccion.
- La licencia Apache 2.0 permite uso comercial, pero debe revisarse la licencia de los componentes de Wan2.1-T2V-1.3B por separado.

## Enlaces

- Hugging Face: https://huggingface.co/testaccount129312/LoopedWAM
- Repositorio de codigo: https://github.com/anhdao69/LoopedWAM
- Pagina del proyecto: https://anhdao69.github.io/LoopedWAM
- Modelo base de componentes: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B
- Codificador de texto T5: https://huggingface.co/google/umt5-xxl
