# Zhiyuan17/robocasa24-atomic-sgem-vla

## Resumen

El modelo `Zhiyuan17/robocasa24-atomic-sgem-vla` es un checkpoint de evaluación de un experimento de investigación en robótica denominado SGeM-VLA (Semantic + Geometry + Motion Vision-Language-Action). Ha sido desarrollado por Zhiyuan Gao (usuario `Zhiyuan17` en HuggingFace) y se basa en el modelo oficial `pi0.5` de Physical Intelligence, convertido a FP32 y entrenado en precisión BF16. El objetivo es evaluar una política VLA en tareas atómicas del entorno doméstico RoboCasa, con un total de 24 tareas entrenadas conjuntamente.

El modelo tiene 3.621.519.376 parámetros (aproximadamente 3,62 mil millones) y predice acciones con un horizonte de 50 pasos. El mejor checkpoint corresponde al paso de entrenamiento 28500 y alcanza un 63,42% de éxito en la evaluación formal (761 de 1200 episodios). Se trata de un modelo de investigación, no de propósito general, y los checkpoints publicados son solo exportaciones de evaluación, sin estado de optimizador ni capacidad de reanudar el entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (Vision-Language-Action) basado en pi0.5 |
| Parametros totales | 3.621.519.376 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (PyTorch) |

## Arquitectura y entrenamiento

El modelo es un VLA, es decir, una arquitectura que integra entradas visuales y de lenguaje natural para generar acciones robóticas. Segun la informacion disponible, la base es el modelo oficial `pi0.5` de Physical Intelligence, convertido estrictamente a FP32 y entrenado posteriormente en precision BF16. No se detallan los componentes internos (codificador de vision, decodificador de acciones, etc.) en la documentacion publicada.

El entrenamiento se realizo sobre 24 tareas conjuntas, con una poblacion de 1.200 episodios y 332.859 fotogramas, utilizando solo la configuracion `base50`. El horizonte de prediccion de acciones es de 50 pasos. Se emplearon perdidas auxiliares con los siguientes pesos: geometria `0.05`, semantica `0.01` y movimiento `0.05`. Todos los checkpoints publicados son exportaciones de evaluacion que contienen pesos, activos de normalizacion y metadatos, pero no incluyen estado de optimizador ni estado de entrenamiento, por lo que no permiten una reanudacion exacta del entrenamiento.

## Capacidades

- Prediccion de acciones roboticas a partir de entradas visuales y de lenguaje natural (Vision-Language-Action).
- Ejecucion de tareas atomicas en el entorno RoboCasa, incluyendo tareas de pick and place, apertura de puertas y cajones, y otras tareas atomicas.
- Horizonte de prediccion de acciones de 50 pasos, con horizonte de ejecucion de 25 en el protocolo de evaluacion formal.
- Evaluacion con 50 episodios por tarea en 24 tareas, con semilla fija 7.
- No se han publicado capacidades de tool calling, soporte de agentes, razonamiento multi-paso, capacidades multilingues ni modo de pensamiento explicito.

## Casos de uso

- Investigacion en aprendizaje por imitacion: el modelo sirve como referencia para evaluar politicas VLA en tareas atomicas de manipulacion en entornos domesticos simulados.
- Benchmarking de politicas roboticas: los checkpoints publicados permiten comparar el rendimiento de distintas configuraciones de entrenamiento (por ejemplo, el efecto de las perdidas auxiliares de semantica, geometria y movimiento).
- Desarrollo de robots domesticos: el modelo puede integrarse en sistemas de control de robots manipuladores para tareas como recoger y colocar objetos, abrir puertas y manipular cajones.
- Evaluacion de generalizacion entre tareas: al entrenarse conjuntamente en 24 tareas, el modelo permite estudiar la transferencia de habilidades entre distintas tareas atomicas.
- Analisis de fallos en manipulacion: los resultados desglosados por categoria (pick and place, puertas y cajones, otras) facilitan identificar que tipos de tareas son mas dificiles para una politica VLA.
- Reproducibilidad en robotica: el repositorio incluye el commit congelado del codigo y los datos de entrenamiento, lo que permite reproducir los resultados de evaluacion en el entorno RoboCasa.

## Benchmarks y rendimiento

Los resultados de la evaluacion formal para el mejor checkpoint (paso 28500) son los siguientes:

| Categoria | Resultado |
|---|---|
| Overall | 761 / 1200 (63,42%) |
| Pick and place | 181 / 400 (45,25%) |
| Doors and drawers | 258 / 300 (86,00%) |
| Other atomic tasks | 322 / 500 (64,40%) |

La tabla de checkpoints publicados es la siguiente:

| Paso | Formal execute=25 result | Ubicacion |
|---:|---:|---|
| 28500 | **761 / 1200 (63,42%)** | raiz del repositorio |
| 29000 | 752 / 1200 (62,67%) | `checkpoints/29000/` |
| 28000 | 749 / 1200 (62,42%) | `checkpoints/28000/` |
| 30000 | 735 / 1200 (61,25%) | `checkpoints/30000/` |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en FP32, el modelo requiere aproximadamente 14,5 GB de VRAM. En precision BF16, la estimacion es de unos 7,2 GB. No se han publicado cuantizaciones oficiales.
- GPU recomendadas: una A100 de 40 GB o una H100 de 80 GB permiten inferencia en FP32 o BF16 con margen. Una RTX 4090 de 24 GB es suficiente para BF16.
- El modelo cabe en GPUs de consumo de gama alta (por ejemplo, RTX 4090) en precision BF16, pero no se han publicado configuraciones de cuantizacion para reducir la VRAM.
- Opciones de despliegue: no se han publicado integraciones con vLLM, llama.cpp, Ollama o TGI. El modelo esta disenado para cargarse directamente con PyTorch desde los archivos safetensors.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se han publicado comparativas con otros modelos en la informacion disponible. El modelo es un checkpoint especifico de un experimento sobre la base pi0.5, pero no existen datos comparativos con otras politicas VLA en la documentacion del repositorio.

## Limitaciones y advertencias

- No es un modelo de proposito general: solo cubre 24 tareas atomicas del entorno RoboCasa y no esta disenado para tareas fuera de ese dominio.
- El rendimiento varia significativamente entre categorias: mientras que las tareas de puertas y cajones alcanzan un 86% de exito, las tareas de pick and place solo llegan al 45,25%.
- Los checkpoints publicados son exportaciones de evaluacion: no contienen estado de optimizador ni estado de entrenamiento, por lo que no permiten reanudar el entrenamiento exacto.
- La licencia no esta disponible, por lo que no se puede garantizar el uso comercial del modelo ni de sus pesos.
- No se ha publicado informacion sobre sesgos, riesgos de alucinacion en la generacion de acciones, ni limitaciones de idioma o contexto.
- Los metadatos del modelo incluyen rutas absolutas locales de la maquina de entrenamiento original, por lo que es necesario configurar las rutas adecuadas antes de realizar una evaluacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Zhiyuan17/robocasa24-atomic-sgem-vla
- Codigo del experimento (release): https://github.com/zhiyuan-gao/libero_task_related/tree/robocasa24-atomic-release
- Herramientas de cache para RoboCasa Atomic-24: https://github.com/zhiyuan-gao/robocasa-atomic24-cache-tools
- Dataset de entrenamiento: https://huggingface.co/Zhiyuan17/robocasa24-atomic-success100-256
- Cache de tareas relevante: https://huggingface.co/Zhiyuan17/robocasa24-cache-batch1-base50
- Base pi0.5 convertida a FP32: https://huggingface.co/Zhiyuan17/libero40-trqc-assets
