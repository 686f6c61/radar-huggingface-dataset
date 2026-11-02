# swulfen/rl_course_vizdoom_health_gathering_supreme

## Resumen

`swulfen/rl_course_vizdoom_health_gathering_supreme` es un checkpoint de aprendizaje por refuerzo profundo (deep RL) entrenado con el algoritmo APPO (Asynchronous Proximal Policy Optimization) sobre el entorno `doom_health_gathering_supreme` de ViZDoom. No se trata de un modelo de lenguaje ni de un modelo generativo: es una politica neuronal entrenada para jugar un escenario concreto de Doom en el que el agente debe recoger botiquines mientras esquiva ataques. Lo publica el usuario swulfen como material de un curso de reinforcement learning, y el repositorio ocupa unos 0,1 GB.

El modelo se ha entrenado con Sample-Factory 2.0, el framework de RL asincrono de alto rendimiento de Alex Petrenko, y se distribuye en el formato nativo de esa libreria (checkpoints y pesos, no safetensors ni GGUF). Su relevancia es fundamentalmente didactica y de reproducibilidad: sirve como referencia para comparar el rendimiento de APPO en un entorno de ViZDoom con recompensa dispersa y como punto de partida para reanudar entrenamiento o ejecutar evaluaciones.

La informacion disponible es muy limitada: no hay datos sobre arquitectura de la red, numero de parametros, licencia ni idiomas, y la model card se limita a las instrucciones estandar generadas por Sample-Factory para descargar, ejecutar y reanudar el entrenamiento. El unico resultado declarado es una recompensa media de 12,77 +/- 5,73 en el entorno de entrenamiento, marcada como no verificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (politica neuronal de RL entrenada con APPO; la model card no detalla la red) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (entorno de RL, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (formato nativo de Sample-Factory) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | checkpoints nativos de Sample-Factory (no safetensors ni GGUF) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura de la red neuronal. Por el contexto (Sample-Factory 2.0 y ViZDoom) se trata de una politica convolutional que procesa observaciones visuales del entorno y produce acciones discretas, entrenada con APPO, una variante asincrona de PPO que desacopla la recoleccion de experiencia del calculo de gradientes. El algoritmo combina ventajas de PPO (estabilidad, recorte de la ratio de politica) con ejecucion asincrona en multiples workers de entorno.

No se especifican en la informacion disponible el numero de pasos de entrenamiento, la composicion del dataset (aqui la experiencia se genera por interaccion con el simulador, no hay corpus de texto), ni si se aplicaron tecnicas adicionales como reward shaping, curricula o ajuste de hiperparametros. El unico dato de entrenamiento es el resultado declarado en la model card (recompensa media de 12,77 +/- 5,73) y la posibilidad de reanudar el entrenamiento con `--restart_behavior=resume`.

## Capacidades

- Control de agente en el entorno `doom_health_gathering_supreme` de ViZDoom: la politica selecciona acciones a partir de observaciones del juego.
- Ejecucion de episodios completos mediante el script `enjoy` de Sample-Factory.
- Reanudacion de entrenamiento desde el checkpoint con `--restart_behavior=resume`.
- Compatibilidad con el ecosistema Sample-Factory 2.0 (carga desde Hugging Face Hub, exportacion y subida de modelos).
- No soporta generacion de texto, razonamiento simbolico, codigo, matematicas, vision general, tool calling, agentes multi-paso ni capacidades multilingues.
- No dispone de modo thinking, audio ni ninguna capacidad generativa.

## Casos de uso

- Docencia y cursos de reinforcement learning: el checkpoint sirve como ejemplo resuelto de un experimento APPO en ViZDoom, util para que los alumnos comparen sus propios entrenamientos con una referencia publicada.
- Reproducibilidad de experimentos: permite ejecutar el script `enjoy` y verificar la recompensa media declarada en un entorno controlado, sin reentrenar desde cero.
- Punto de partida para fine-tuning: se puede reanudar el entrenamiento con `--restart_behavior=resume` y ajustar hiperparametros para estudiar el efecto de cambios en la recompensa o en la red.
- Investigacion en recompensa dispersa: el escenario `health_gathering_supreme` es un banco de pruebas clasico para estudiar exploracion y credit assignment; el checkpoint permite analizar el comportamiento aprendido.
- Evaluacion comparativa de algoritmos: sirve como baseline APPO frente a otros algoritmos (PPO, IMPALA) entrenados en el mismo entorno.
- Demostraciones y material divulgativo: al ser un entorno visual de Doom, resulta adecuado para mostrar en charlas o clases como funciona un agente de RL entrenado.
- Integracion en pipelines de investigacion con Sample-Factory: carga programatica desde el Hub mediante `sample_factory.huggingface.load_from_hub` para experimentos automatizados.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados):

| Algoritmo | Entorno | Metrica | Valor |
|---|---|---|---|
| APPO | doom_health_gathering_supreme | mean_reward | 12,77 +/- 5,73 |

No se han publicado en la informacion disponible otros resultados de benchmarks ni comparaciones con modelos alternativos.

## Requisitos de hardware

- VRAM estimada: no disponible; al no conocerse el tamano de la red, no se puede calcular. El repositorio completo ocupa 0,1 GB, lo que sugiere un modelo pequeno que probablemente quepa en GPU consumer, pero es una inferencia, no un dato confirmado.
- GPU recomendadas: no disponibles. Para entrenamiento con Sample-Factory se suele usar GPU dedicada; para inferencia de una politica pequena, una GPU consumer moderna (por ejemplo, RTX 3060 o superior) seria suficiente en la mayoria de casos, aunque no hay confirmacion en la informacion proporcionada.
- Cabe en GPU consumer: probablemente si, dado el tamano del repositorio, pero no confirmado.
- Opciones de despliegue: Sample-Factory 2.0 (scripts `enjoy` y `train`), carga desde el Hub con `sample_factory.huggingface.load_from_hub`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Algoritmo | Entorno | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| swulfen/rl_course_vizdoom_health_gathering_supreme | APPO | doom_health_gathering_supreme | no disponible | no aplica | no disponible | Hugging Face |
| Otros checkpoints APPO de Sample-Factory en ViZDoom | APPO | ViZDoom (distintos escenarios) | no disponible | no aplica | variable | Hugging Face |
| Politicas PPO/IMPALA en ViZDoom | PPO / IMPALA | ViZDoom | no disponible | no aplica | variable | Repositorios de investigacion |

No se dispone en la informacion proporcionada de resultados numericos de modelos comparables para establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- El modelo esta especializado exclusivamente en el entorno `doom_health_gathering_supreme`; no es reutilizable en otras tareas sin reentrenamiento.
- La recompensa media declarada (12,77 +/- 5,73) esta marcada como no verificada y presenta una desviacion estandar elevada, lo que indica alta varianza entre episodios.
- No hay informacion sobre sesgos, pero al ser una politica entrenada en un simulador, puede explotar artefactos del entorno y no generalizar fuera de el.
- No se especifica licencia, por lo que el uso comercial queda en un limbo legal: conviene contactar con el autor antes de cualquier uso productivo.
- No hay datos sobre la arquitectura ni el numero de parametros, lo que dificulta evaluar su coste computacional y su robustez.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de validacion por parte de la comunidad.
- No debe interpretarse como un modelo de lenguaje ni usarse para tareas de NLP, generacion de codigo o agentes conversacionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/swulfen/rl_course_vizdoom_health_gathering_supreme
- Sample-Factory (repositorio): https://github.com/alex-petrenko/sample-factory
- Documentacion de Sample-Factory: https://www.samplefactory.dev/
- Guia de integracion con Hugging Face: https://www.samplefactory.dev/10-huggingface/huggingface/
