# xingyicheng/Crawshrimp-Browser-v0.1.0

## Resumen

Crawshrimp Browser v0.1.0 (抓虾大模型 v0.1.0) es un modelo especializado en el ranking de acciones candidatas durante la automatización de navegadores web. Desarrollado por el usuario xingyicheng, no es un modelo generativo de propósito general: recibe el objetivo del usuario, la evidencia extraída de la página actual y una lista corta de acciones observadas, y devuelve una puntuación para cada candidata en una única pasada forward por lotes. La aplicación de navegador utiliza esas puntuaciones para elegir una API de sitio verificada, abrir un enlace visible o solicitar más evidencia.

El modelo se construye sobre Qwen/Qwen3.5-4B, en concreto sobre la distribución NVFP4 de Ollama convertida a MLX, y añade un adaptador LoRA de rango 8 entrenado sobre trayectorias sintéticas, junto con una cabeza de decisión MLP de dos capas. La arquitectura de ranking congela el backbone adaptado y utiliza únicamente sus primeras 20 capas de texto para codificar cada candidata con el mismo objetivo y la misma evidencia de página.

Es relevante porque propone un patrón de despliegue local en Apple Silicon para agentes de navegador: el ranker opera de forma aislada y offline una vez instalado, mientras que un modelo de visión Qwen3.5-4B separado lee capturas y ejecuta las herramientas dentro del llamado Crawshrimp Harness. La licencia Apache 2.0 y el formato MLX lo hacen directamente utilizable en Macs con chip Apple.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5-4B) convertido a MLX, con adaptador LoRA de rango 8 y cabeza de ranking MLP de 2 capas; se usan las primeras 20 capas de texto del backbone |
| Parametros totales | No disponible (base Qwen3.5-4B; el repositorio ocupa 4.0 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Base en NVFP4 (distribucion Ollama de Qwen3.5-4B) convertida a MLX; no se documentan otras cuantizaciones |
| Idiomas soportados | Chino (zh) e ingles (en); la mayoria de las entradas de evaluacion son en chino y la cobertura en ingles es limitada |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX); incluye base convertida, adaptador de trayectoria y cabeza de ranking (`choice_head.safetensors`) |

## Arquitectura y entrenamiento

El sistema parte de Qwen3.5-4B en su distribucion NVFP4 de Ollama, convertida a MLX. Sobre ese backbone se entreno un adaptador LoRA de rango 8 durante 105 pasos con un conjunto de 175 filas de trayectorias sinteticas, que incluia 32 transiciones procedentes de cinco flujos de trabajo docentes verificados. Para el ranking de acciones, el backbone adaptado se congela y se explotan sus primeras 20 capas de texto: cada candidata se codifica junto con el mismo objetivo y la misma evidencia de pagina, y una MLP de dos capas puntua la representacion normalizada del ultimo token de cada candidata.

La cabeza de decision se entreno con 252 ejemplos sinteticos, con validacion y test de 64 ejemplos cada uno, incluyendo estados emparejados en los que la accion correcta cambia mientras las opciones permanecen iguales. Las plantillas se comparten entre los splits sinteticos. El repositorio incluye scripts para reproducir el entrenamiento (`prepare_data.py` con `--recovery --action-pairs` y el subcomando `train` con `--encoder-layers 20`). No se documenta el uso de RLHF ni DPO. El modelo no genera texto libre: su salida es un conjunto de puntuaciones por candidata.

## Capacidades

- Ranking de acciones candidatas en una sola pasada forward por lotes, devolviendo la mejor accion y sus probabilidades.
- Puntuacion condicionada por objetivo del usuario y evidencia de pagina, con opcion explicita de abandono (abstain) cuando la evidencia es insuficiente.
- Distincion entre acciones similares pero irrelevantes gracias al entrenamiento con estados emparejados.
- Integracion con un harness de navegador que gestiona sesion, autorizacion, ejecucion de acciones y verificacion de resultados.
- Soporte de llamada mediante endpoint HTTP local (`/v1/systemone`) con payload JSON de estado y preguntas.
- Funcionamiento offline una vez instaladas las dependencias.
- Capacidades multilingues limitadas a chino e ingles, con predominio del chino en evaluacion.
- No incluye vision, audio ni generacion de texto: la lectura de capturas y la respuesta final las realiza un modelo de vision Qwen3.5-4B separado dentro del Harness.

## Casos de uso

- Automatizacion de tareas de inventario en backoffice: el ranker recibe el objetivo ("reportar el stock actual"), la evidencia de la pagina y candidatas como leer una API verificada o transcribir un valor antiguo, y selecciona la accion correcta con umbral de confianza de 0.75 y margen de 0.18 sobre la segunda opcion.
- Navegacion web asistida con verificacion: en un harness que ejecuta acciones sobre el navegador, el modelo decide si abrir un enlace visible, invocar una API de sitio ya validada o pedir mas evidencia antes de actuar.
- Agentes de navegador con abandono controlado: la opcion de abstain permite al sistema detenerse cuando ninguna candidata avanza el objetivo, evitando clics erroneos en flujos con controles parecidos.
- Control de calidad de flujos docentes: las 32 transiciones de cinco flujos verificados y el replay de 27 escenarios desidentificados permiten usar el modelo como evaluador de decisiones paso a paso en pipelines internos.
- Despliegue local en estaciones de trabajo Apple Silicon: el servicio se ejecuta con Python 3.12 y MLX en un Mac, sin conexion a internet tras la instalacion, lo que encaja en entornos con requisitos de privacidad.
- Automatizacion de formularios y paginacion dentro de un harness: los seis tasks de interaccion (formularios, paginacion, lectura de imagenes) se completaron en la evaluacion del sistema completo, con tiempos medianos de 13.66 s en local.
- Sustitucion de rutas basadas en API en la nube: en la comparativa del harness, la ruta local completo 19 de 20 tareas frente a 18 de 20 de DeepSeek V4.1 Flash, con tiempos medianos de 8.48 s frente a 9.13 s.

## Benchmarks y rendimiento

| Evaluacion | Resultado |
|---|---|
| Test sintetico (64 ejemplos): acierto de la opcion superior | 64/64 |
| Test sintetico: supera umbrales de confianza (incluye abstain) | 63/64 |
| Replay desidentificado (27 escenarios, 39 puntos de decision) | 39/39 acciones esperadas |
| Tiempo mediano de decision del ranker (por grupo) | 147-226 ms |
| Harness completo, 20 tareas: tareas completadas (local) | 19/20 |
| Harness completo, 20 tareas: tareas completadas (DeepSeek V4.1 Flash) | 18/20 |
| Harness completo: tiempo mediano total (local / Flash) | 8.48 s / 9.13 s |
| Seis tareas de interaccion: tiempo mediano (local / Flash) | 13.66 s / 10.64 s |

Los datos de harness corresponden al sistema completo sobre un conjunto pequeno de fixtures, no al ranker aislado; la fiabilidad y el rendimiento en sitios web reales no se han establecido.

## Requisitos de hardware

- Inferencia en Apple Silicon con Python 3.12 y MLX; el repositorio ocupa 4.0 GB, incluyendo base convertida, adaptador, cabeza y servidor.
- VRAM/unified memory estimada: no disponible de forma explicita; el tamano del repositorio sugiere que encaja en Macs con memoria unificada de gama alta, pero no se documenta el minimo.
- GPU recomendadas: no se documentan GPUs NVIDIA ni AMD; el despliegue previsto es en Mac con chip Apple.
- No se indica compatibilidad con GPUs de consumo tipo RTX 4090 ni con CUDA.
- Opciones de despliegue: servidor Python propio incluido (`serve.py`) con endpoint HTTP; no se mencionan vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia: 147-226 ms de mediana por grupo de decision para el ranker aislado; el harness completo registra medianas de 8.48 s en todas las intentonas y 13.66 s en las seis tareas de interaccion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Crawshrimp Browser v0.1.0 | Base Qwen3.5-4B (no disponible el total exacto) | No disponible | Ranking de acciones de navegador con LoRA y cabeza MLP | Apache 2.0 | Hugging Face, MLX, Apple Silicon |
| DeepSeek V4.1 Flash (ruta oficial) | No disponible | No disponible | Agente de navegador de proposito general en la nube | No disponible | API en la nube |
| Qwen3.5-4B (base) | 4B (aproximado por denominacion) | No disponible | Modelo generativo multimodal de proposito general | No disponible en la informacion | Hugging Face, Ollama NVFP4 |

La comparativa con DeepSeek V4.1 Flash procede de la evaluacion del harness del autor (19/20 frente a 18/20 en 20 tareas). No se dispone de comparaciones con otros rankers de acciones de navegador.

## Limitaciones y advertencias

- El ranker solo puntua candidatas; no genera texto, no lee capturas y no ejecuta acciones. La vision y la respuesta final dependen de un modelo Qwen3.5-4B separado y del Harness.
- La evaluacion se basa en conjuntos sinteticos pequenos (64 ejemplos de test, 252 de entrenamiento) y en 27 escenarios de replay; la fiabilidad en sitios web reales no esta establecida.
- Predominio del chino en las entradas de evaluacion; la cobertura en ingles es limitada.
- El endpoint devuelve siempre la accion mejor puntuada, incluso con puntuacion baja; el Harness solo acepta acciones que superen 0.75 de confianza y 0.18 de margen sobre la segunda, por lo que el llamador debe aplicar esos filtros.
- Durante el desarrollo se observaron paradas prematuras y navegacion inconsistente en reejecuciones.
- Los tiempos de decision del ranker no incluyen navegacion, herramientas ni respuesta final, que tienen latencias y modos de fallo propios.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento en produccion.
- El escenario de cola de la evaluacion provoco un timeout local y dos en Flash, lo que indica sensibilidad a condiciones de espera.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xingyicheng/Crawshrimp-Browser-v0.1.0
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
