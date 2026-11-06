# ylee-sling/aero-vpa

## Resumen

Aero-VPA es un framework de navegacion autonoma para cuadricopteros basado en vision, desarrollado por el autor ylee-sling. El sistema combina un modelo del mundo latente de tipo JEPA (Joint Embedding Predictive Architecture) que actua como predictor de dinamica, con una politica de control entrenada por flow-matching que genera consignas de vuelo. La particularidad del diseno es que la politica no opera sola: en despliegue se anade un escudo de seguridad determinista a bordo (memoria de profundidad de 15 s, frenado por barrera y retroceso tipo breadcrumb) que filtra cada setpoint antes de enviarlo al controlador de vuelo.

El modelo se distribuye como checkpoints de PyTorch (repo de 0,8 GB) y se evalua en bucle cerrado sobre PX4 SITL y Gazebo Harmonic. Los resultados publicados en la model card corresponden a 180 misiones de test por checkpoint, sobre 36 mundos de test (seeds 2000-2011 cruzados con densidades sparse, medium y dense) y 5 misiones por mundo, con comparaciones pareadas con y sin escudo.

Es relevante ahora porque documenta de forma cuantitativa el efecto de un escudo de seguridad clasico sobre una politica aprendida: la tasa de exito pasa del 12-21 % sin escudo al 42-52 % con escudo, y los choques caen del 72-82 % al 22-43 %, con valores p de McNemar del orden de 10^-10. La licencia es GPL-3.0, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo del mundo latente JEPA (predictor de dinamica) + politica de control por flow-matching; escudo de seguridad determinista a bordo |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada de vision y estado del dron) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robotica, sin interfaz de lenguaje) |
| Licencia | GPL-3.0 |
| Formato de pesos | PyTorch (`.pt`, checkpoints calibrados) |

## Arquitectura y entrenamiento

La arquitectura se articula en tres piezas. Primero, un modelo del mundo latente basado en JEPA que predice transiciones de estado hacia delante en el espacio latente, es decir, aprende la dinamica del cuadricoptero y del entorno sin reconstruir observaciones pixel a pixel. Segundo, una politica de control entrenada por flow-matching que consume ese estado latente y produce consignas de vuelo; el flujo de matching sustituye a una politica gaussiana convencional y permite modelar distribuciones de acciones multimodales. Tercero, un escudo de seguridad determinista que en despliegue filtra cada setpoint: mantiene una memoria de profundidad de 15 s, aplica frenado por barrera y retroceso tipo breadcrumb, y no requiere mapa del entorno.

El entrenamiento sigue un esquema de imitation learning con DAgger, segun las etiquetas del repositorio. No se especifican en la informacion disponible el numero de tokens, la composicion exacta del dataset de entrenamiento ni si hubo etapas de RLHF o DPO (no aplicables en el sentido habitual a un modelo de robotica). Los checkpoints publicados corresponden a la evaluacion en bucle cerrado en PX4 SITL + Gazebo Harmonic; el codigo, los scripts de entrenamiento y evaluacion estan en el repositorio de GitHub del autor.

## Capacidades

- Navegacion autonoma de cuadricopteros basada en vision: la politica genera consignas de vuelo a partir de observaciones de camara y estado del vehiculo.
- Prediccion de dinamica en espacio latente mediante el modelo del mundo JEPA, que anticipa transiciones de estado hacia delante.
- Control por flow-matching para generar acciones multimodales y suaves.
- Filtrado de seguridad a bordo: el escudo determinista revisa cada setpoint con memoria de profundidad de 15 s, frenado por barrera y retroceso breadcrumb, sin necesidad de mapa.
- Ejecucion en bucle cerrado sobre PX4 SITL + Gazebo Harmonic, con integracion en la pila PX4.
- Varios checkpoints publicados (r1, kw, sd, nomotion, r2, noact) que permiten comparar configuraciones; r1 aparece como recomendado.
- No se documentan capacidades de lenguaje, vision general, tool calling ni agentes multi-paso; es un modelo especifico de robotica.

## Casos de uso

- Navegacion de drones en interiores con obstaculos: el modelo puede volar misiones de waypoints en mundos con densidad de obstaculos sparse, medium y dense; en la evaluacion, el checkpoint r1 con escudo logro 37/60 exitos en mundos sparse y 28/60 en dense, lo que lo hace util para validar politicas antes de volar en hardware real.
- Evaluacion de politicas aprendidas en simulacion: el pipeline PX4 SITL + Gazebo Harmonic permite reproducir 180 misiones por checkpoint con comparaciones pareadas, adecuado para medir el impacto de un escudo de seguridad antes de desplegar.
- Investigacion en modelos del mundo para robotica: la combinacion JEPA + flow-matching sirve como banco de pruebas para estudiar prediccion latente de dinamica en vehiculos aereos.
- Desarrollo de capas de seguridad para drones: el escudo determinista (memoria de profundidad, frenado por barrera, breadcrumb) es reutilizable como modulo independiente de la politica, lo que facilita integrarlo en otras pilas de navegacion.
- Prototipado de navegacion reactiva sin mapa: el escudo no requiere mapa del entorno, lo que encaja en escenarios donde la cartografia previa no esta disponible o cambia.
- Formacion y docencia en robotica aerea: los checkpoints y los scripts de evaluacion permiten reproducir experimentos de imitation learning y DAgger en un simulador estandar (Gazebo Harmonic).
- Analisis de robustez: los checkpoints abladados (nomotion, noact) permiten estudiar que aporta cada componente del sistema a la tasa de exito final.

## Benchmarks y rendimiento

Resultados en simulacion (180 misiones de test por checkpoint; 36 mundos de test x 5 misiones; comparaciones pareadas con y sin escudo). Choque = colision (distancia privilegiada inferior a 0,35 m) o contacto con el suelo.

| Checkpoint | Exito sin escudo | Exito con escudo [IC 95 %] | Choques sin -> con escudo | Timeouts con escudo | McNemar p (exito) |
|---|---|---|---|---|---|
| r1 | 38/180 (21,1 %) | 94/180 (52,2 %) [45,0; 59,4] | 72,2 % -> 22,2 % | 23,3 % | 1,20 x 10^-10 |
| kw | 28/180 (15,6 %) | 90/180 (50,0 %) [42,8; 57,2] | 80,6 % -> 26,1 % | 21,7 % | 4,69 x 10^-12 |
| sd | 28/180 (15,6 %) | 82/180 (45,6 %) [38,4; 52,8] | 76,1 % -> 35,0 % | 16,1 % | 4,18 x 10^-11 |
| nomotion | 24/180 (13,3 %) | 81/180 (45,0 %) [37,9; 52,3] | 77,2 % -> 42,8 % | 10,0 % | 1,33 x 10^-10 |
| r2 | 23/180 (12,8 %) | 77/180 (42,8 %) [35,8; 50,1] | 80,0 % -> 38,3 % | 16,7 % | 4,18 x 10^-11 |
| noact | 20/180 (11,1 %) | 79/180 (43,9 %) [36,8; 51,2] | 82,2 % -> 36,1 % | 14,4 % | 2,45 x 10^-12 |

Exito por densidad de mundo (con escudo / sin escudo, 60 misiones por densidad):

| Checkpoint | Dense | Medium | Sparse |
|---|---|---|---|
| r1 | 28 / 4 | 29 / 17 | 37 / 17 |
| kw | 22 / 1 | 33 / 10 | 35 / 17 |
| sd | 17 / 2 | 26 / 9 | 39 / 17 |
| nomotion | 17 / 1 | 28 / 6 | 36 / 17 |
| r2 | 21 / 0 | 32 / 9 | 24 / 14 |
| noact | 23 / 2 | 25 / 6 | 31 / 12 |

Misiones en las que el escudo no fue revisado (mision 1 y posteriores de cada mundo; el escudo volo la mision 0):

| Checkpoint | Misiones | Exito sin escudo | Exito con escudo [IC 95 %] | p pareado |
|---|---|---|---|---|
| r1 | 144 | 21,5 % | 52,1 % [44,0; 60,1] | 2,00 x 10^-8 |
| kw | 144 | 15,3 % | 54,2 % [46,0; 62,1] | 2,28 x 10^-12 |
| sd | 144 | 16,7 % | 45,1 % [37,2; 53,3] | 5,26 x 10^-8 |
| nomotion | 144 | 15,3 % | 46,5 % [38,6; 54,7] | 3,74 x 10^-8 |
| r2 | 144 | 13,9 % | 44,4 % [36,6; 52,6] | 2,40 x 10^-9 |
| noact | 144 | 10,4 % | 43,1 % [35,3; 51,2] | 4,32 x 10^-10 |

No se han publicado resultados de benchmarks en la informacion disponible mas alla de los anteriores (no hay MMLU, HumanEval ni GSM8K, que no aplican a este modelo).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card; el repo pesa 0,8 GB, lo que sugiere requisitos modestos, pero no se especifica el consumo de memoria en despliegue.
- GPU recomendadas: no disponible. No se indican modelos concretos (A100, H100, RTX 4090, etc.).
- Cabe en GPU de consumo: no confirmado, aunque el tamano del repositorio (0,8 GB) es compatible con GPUs de consumo; falta confirmacion del autor.
- Opciones de despliegue: inferencia en PyTorch; la evaluacion se realiza en PX4 SITL + Gazebo Harmonic. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles. La model card solo reporta tiempos de mision (por ejemplo, 3/3 waypoints en 59 s a 0,88 m/s media en un mundo dense, y en 35 s a 1,71 m/s en un mundo sparse).

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la informacion proporcionada. No se han publicado comparaciones con otras politicas de navegacion de cuadricopteros ni con otros frameworks JEPA aplicados a robotica aerea. No disponible.

## Limitaciones y advertencias

- Los resultados son exclusivamente de simulacion (PX4 SITL + Gazebo Harmonic); no se ha validado el vuelo en hardware real en la informacion disponible.
- La tasa de exito con escudo se situa entre el 42,8 % y el 52,2 % segun checkpoint, lo que implica que aproximadamente la mitad de las misiones fallan; no es un sistema listo para operacion autonoma sin supervision.
- Los choques con escudo siguen siendo elevados (entre el 22,2 % y el 42,8 %), en particular en mundos densos (por ejemplo, r1 logra 28/60 en dense frente a 37/60 en sparse).
- El escudo de seguridad es determinista y no usa mapa; su efectividad depende de la memoria de profundidad de 15 s y de los umbrales de frenado, no documentados en detalle.
- Licencia GPL-3.0: impone obligaciones de copyleft que pueden ser incompatibles con productos propietarios; revisar antes de uso comercial.
- No se documentan sesgos, riesgos de alucinacion ni limitaciones de idioma porque el modelo no procesa lenguaje natural.
- No se especifican los datos de entrenamiento, el numero de tokens ni la composicion del dataset, lo que dificulta evaluar la generalizacion a entornos fuera de la distribucion de test.
- Riesgo de sobreajuste a los mundos de test (seeds 2000-2011); no se reportan evaluaciones en escenarios completamente nuevos.

## Enlaces

- Hugging Face: https://huggingface.co/ylee-sling/aero-vpa
- Dataset de evaluacion: https://huggingface.co/datasets/ylee-sling/aero-vpa-benchmark
- Codigo, entrenamiento y evaluacion: https://github.com/ylee-sling/Aero-VPA
- Metodo (DOI): https://doi.org/10.5281/zenodo.23633375
