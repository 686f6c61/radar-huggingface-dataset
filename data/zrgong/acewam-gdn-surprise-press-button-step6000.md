# zrgong/acewam-gdn-surprise-press-button-step6000

## Resumen

AceWAM Press Button GDN-surprise router es un bundle de evaluacion publica de un modelo de mundo-accion (world-action model) desarrollado por el autor zrgong, asociado al repositorio sgres-paw/AceWAM. El modelo esta especializado en la tarea `press_button` del benchmark RMBench, un entorno de robotica. El checkpoint corresponde al paso 6000 de entrenamiento e incluye un router adaptativo de memoria denominado Full/Gist, que decide como almacenar paginas de memoria antiguas basandose en una puntuacion causal de sorpresa Gated Delta (GDN) comparada con la mediana causal y la desviacion absoluta media (MAD). El paquete incluye pesos de inferencia, configuracion de entrenamiento, estadisticas de normalizacion y un manifiesto de procedencia.

Este modelo es relevante por su enfoque en gestion adaptativa de memoria para agentes roboticos con ventana de contexto extensa, aunque la informacion publica es escasa y no se especifican la arquitectura interna ni los parametros totales. La licencia no esta disponible, y el repositorio depende de activos externos de RMBench y del modelo base Wan, que deben suministrarse por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (world-action model, dependencias Wan base) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se proporciona checkpoint `step_006000.pt`) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | checkpoint PyTorch (`.pt`), config YAML, JSON de estadisticas |

## Arquitectura y entrenamiento

La informacion disponible describe un sistema de memoria adaptativa denominado "Full/Gist" con un router causal. Las cuatro paginas de memoria mas recientes se mantienen siempre en formato "Full" (120 tokens por pagina); cuando una pagina antigua sale de esa ventana, su puntuacion de sorpresa Gated Delta (GDN) se compara con la mediana causal mas una desviacion absoluta media (MAD). Segun el resultado, la pagina se almacena exclusivamente como 120 tokens Full o como 8 tokens Gist. Este mecanismo busca optimizar el uso de la ventana de contexto en tareas de robotica de largo plazo.

El entrenamiento se realizo en un nodo con 8 GPUs A100 (configuracion `1x8`) sobre la tarea `press_button` de RMBench. El checkpoint corresponde al paso 6000, y se incluyen las estadisticas de normalizacion de acciones y propriocepcion (`dataset_stats.json`) para reproduccion. No se detallan datos sobre el dataset, tokens totales, ni tecnicas de alineacion (RLHF/DPO).

## Capacidades

- Ejecucion de la tarea de robotica `press_button` de RMBench (pulsar un boton fisico).
- Gestion adaptativa de memoria a largo plazo mediante router Full/Gist con puntuacion GDN.
- Integracion con el framework AceWAM para evaluacion de modelos de accion-mundo.
- Capacidades de normalizacion de acciones y propriocepcion incluidas en el bundle.
- No se documentan capacidades de generacion de texto, vision, tool calling, agentes, ni multilingues.

## Casos de uso

- **Evaluacion de modelos de robotica en RMBench**: el bundle permite reproducir la evaluacion del modelo en la tarea `press_button`, comparando resultados con otros agentes del benchmark.
- **Investigacion en memoria adaptativa**: el router GDN puede analizarse para estudiar como el modelo decide que paginas de contexto mantener completas o comprimir en Gist tokens, util para disenar sistemas de memoria en robotica de largo plazo.
- **Despliegue de controladores en entornos simulados**: el checkpoint puede integrarse en simuladores compatibles con RMBench para validar el comportamiento del agente en tareas de manipulacion simple.
- **Estudio de procedencia y reproducibilidad**: el manifiesto (`manifest.json`) y la configuracion resuelta (`config.yaml`) permiten reproducir el entrenamiento y la evaluacion en entornos controlados.
- **Optimizacion de uso de contexto**: el mecanismo Full/Gist puede servir como referencia para otros modelos que necesiten gestionar ventanas largas en tiempo real, aunque no se aportan metricas de rendimiento.
- **Formacion de modelos de accion-mundo**: el checkpoint puede ser usado como punto de partida para fine-tuning en tareas similares del RMBench, siempre que se disponga de los activos base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exito, recompensa, ni comparaciones con otros modelos en RMBench.

## Requisitos de hardware

- Tamaño del repositorio: 24.1 GB (incluye checkpoint y metadatos), lo que sugiere un modelo de gran tamaño (probablemente varios miles de millones de parametros, pero no confirmado).
- Entrenamiento realizado en 8x A100 (configuracion `1x8`), lo que indica que la inferencia podria requerir una GPU con al menos 40-80 GB de VRAM dependiendo de la precision, pero no se especifican requisitos minimos.
- No se indican opciones de despliegue como vLLM, llama.cpp, Ollama o TGI; es un checkpoint de robotica, probablemente se ejecute con frameworks de robotica como PyTorch y simuladores de RMBench.
- Latencia y throughput no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (world-action models para RMBench). No se puede realizar una comparativa fiable sin datos adicionales.

## Limitaciones y advertencias

- Licencia no especificada; el uso comercial puede estar restringido, aunque se desconoce el alcance.
- Dependencia de activos externos: RMBench y el modelo base Wan (Wan base-model) deben suministrarse por separado; sin ellos, el checkpoint no es utilizable directamente.
- No se documentan sesgos, riesgos de alucinacion, ni limitaciones de idioma, pero al ser un modelo de robotica, no aplican sesgos lingüisticos.
- La informacion sobre arquitectura y parametros es incompleta, lo que dificulta evaluar su idoneidad para otros casos de uso.
- El checkpoint esta en un paso de entrenamiento intermedio (6000), no se indica si es el paso final ni si hay checkpoints posteriores.
- No se proporcionan instrucciones de despliegue ni ejemplos de uso, lo que limita su adopcion inmediata en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zrgong/acewam-gdn-surprise-press-button-step6000
- Codigo de entrenamiento (referencia): `sgres-paw/AceWAM@152e8fc204279d87e3c1b798852a46b9b3002fb8`
- Codigo de instrumentacion de evaluacion: `sgres-paw/AceWAM@d4d6fca6bd7ef793fecf4daf1eb18d76e4259ded`
- Benchmark RMBench: no se proporciona enlace directo en la informacion disponible.
