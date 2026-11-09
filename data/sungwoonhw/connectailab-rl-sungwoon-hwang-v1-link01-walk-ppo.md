# SUNGWOONHW/connectailab-rl-sungwoon-hwang-v1-link01-walk-ppo

## Resumen

`connectailab-rl-sungwoon-hwang-v1-link01-walk-ppo` es un agente de aprendizaje por refuerzo (reinforcement learning) entrenado con el algoritmo PPO (Proximal Policy Optimization) mediante la libreria Stable-Baselines3. Lo desarrolla SUNGWOON HWANG, ingeniero de diseno de componentes de automocion en SUBARU, en el marco de una colaboracion con CONNECT AI LAB. El agente controla la locomocion de un robot bipedo simulado denominado LINK-01 dentro del entorno `Link01WalkGuided-v0`, construido sobre el simulador fisico MuJoCo a traves del paquete `link01-gym`.

El modelo no es un modelo de lenguaje ni un transformer: es una politica de control entrenada desde cero (from scratch) para que el robot aprenda a caminar hacia delante siguiendo un comando de velocidad. El espacio de observacion tiene 51 dimensiones y el de accion 14 (una por articulacion, con una postura base de ±0,18 rad). La relevancia es acotada y experimental: se trata de un artefacto educativo y de investigacion temprana dentro de un curso de RL (AI CITY BUILDERS, 7ª leccion), publicado con cero descargas y sin licencia declarada.

El entrenamiento consistio en 2.000.000 de pasos completados en aproximadamente 25,9 minutos, con una tasa de aprendizaje de 0,0003, factor de recorte (clip) de 0,2 y factor de descuento (gamma) de 0,99. El resultado declarado es una velocidad media de avance de 0,1894 m/s y cero caidas por minuto en el protocolo de evaluacion del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica de RL (PPO) entrenada con Stable-Baselines3; red neuronal no especificada en detalle por el autor |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (agente de control, no modelo de lenguaje); observacion de 51 dimensiones por paso |
| Tipos de cuantizacion | no disponible (pesos en formato de politica SB3, no pensados para cuantizacion de LLM) |
| Idiomas soportados | no aplica (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | `model.zip` (politica PPO de Stable-Baselines3), `vecnormalize.pkl` (estadisticas de normalizacion de observaciones), `actor.json` |

## Arquitectura y entrenamiento

El agente es una politica PPO implementada con Stable-Baselines3 sobre un entorno de simulacion fisica MuJoCo (`Link01WalkGuided-v0`, del paquete `link01-gym`). El entorno expone un espacio de observacion de 51 dimensiones y un espacio de accion continuo de 14 dimensiones, correspondiente a las 14 articulaciones del robot bipedo LINK-01, con una postura base fijada en ±0,18 rad. El entrenamiento se realizo desde cero, sin inicializacion a partir de politicas previas ni imitacion, durante 2.000.000 de pasos en 25,9 minutos de computo.

Los hiperparametros declarados son los habituales de PPO: tasa de aprendizaje 0,0003, clip de 0,2 y gamma 0,99. El repositorio incluye tambien el fichero `vecnormalize.pkl`, lo que indica que se aplico normalizacion de observaciones durante el entrenamiento; este fichero es imprescindible para reproducir la inferencia con las mismas estadisticas. No se detalla en la informacion disponible la arquitectura exacta de la red (numero de capas, unidades, funcion de activacion), la funcion de recompensa ni la composicion del curriculum de entrenamiento. Tampoco se documenta el uso de tecnicas adicionales como recompensas de estilo, domain randomization o decodificacion especulativa (no aplicable en este contexto).

## Capacidades

- Locomocion bipeda simulada: genera comandos de par o posicion para 14 articulaciones de forma continua a partir de observaciones de 51 dimensiones.
- Seguimiento de comando de velocidad: el entorno `Link01WalkGuided-v0` guia al agente hacia una velocidad objetivo (0,18 m/s en la evaluacion declarada).
- Estabilidad: cero caidas por minuto en el protocolo de 5 episodios de 20 segundos declarado por el autor.
- Desplazamiento efectivo: 3,789 m recorridos por episodio de 20 segundos.
- No soporta tool calling ni function calling: no es un modelo de lenguaje.
- No soporta razonamiento multi-paso simbolico ni agentes conversacionales.
- No tiene capacidades multilingues, de vision, audio ni modo de razonamiento (thinking).
- No se documentan capacidades de generalizacion a otros entornos, terrenos o morfologias distintas de LINK-01.

## Casos de uso

- Investigacion en locomocion bipeda simulada: sirve como punto de partida reproducible para comparar variantes de PPO, recompensas o curricula en el entorno `Link01WalkGuided-v0`, cargando `model.zip` junto con `vecnormalize.pkl` para replicar la politica entrenada.
- Docencia de aprendizaje por refuerzo: es un ejemplo completo y ligero (entrenamiento de 25,9 minutos) para ilustrar el ciclo observacion-accion-recompensa, el uso de Stable-Baselines3 y el flujo de evaluacion con MuJoCo en un curso introductorio.
- Baseline de referencia para nuevos agentes LINK-01: cualquier politica posterior puede compararse contra las metricas declaradas (0,1894 m/s, 0 caidas/min, 3,789 m por episodio) bajo el mismo protocolo de 5 episodios de 20 segundos.
- Pruebas de integracion de pipelines de RL: el trio `model.zip` + `vecnormalize.pkl` + `actor.json` permite validar herramientas de despliegue, exportacion de actores o conversion de politicas en un caso real y de baja carga computacional.
- Simulacion de control de bajo nivel en robótica: puede emplearse como modulo de control de marcha en un stack simulado mas amplio (planificacion, percepcion) antes de trasladar ideas a hardware, siempre dentro del simulador.
- Reproduccion de experimentos y auditoria: al estar publicados los hiperparametros y los ficheros de normalizacion, es adecuado para ejercicios de reproducibilidad y verificacion de resultados declarados por terceros.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados de forma independiente; `verified: false`):

| Metrica | Valor | Protocolo |
|---|---|---|
| Distancia por episodio | 3,789 m | 5 episodios × 20 s |
| Velocidad media de avance | 0,1894 m/s | 5 episodios × 20 s |
| Caidas por minuto | 0,0 | 5 episodios × 20 s |

No se han publicado en la informacion disponible comparaciones con otros agentes ni resultados en tareas adicionales (MMLU, HumanEval, GSM8K y similares no aplican a este tipo de modelo).

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; la politica PPO es una red pequena y el cuello de botella es la simulacion MuJoCo, no la red. No se dispone de una cifra exacta de parametros.
- GPU recomendadas: no es necesario GPU dedicada; cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) o incluso CPU es suficiente para ejecutar la politica y el simulador a velocidad de tiempo real o superior.
- Cabe en GPU consumer: si, con holgura; el requisito principal es tener instalados `stable-baselines3`, `gymnasium`/`gym` y `mujoco` con el paquete `link01-gym`.
- Opciones de despliegue: carga directa con Stable-Baselines3 (`PPO.load("model.zip")`) junto con `VecNormalize.load("vecnormalize.pkl")`; no aplican vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada. El entrenamiento declaro 2.000.000 de pasos en 25,9 minutos, lo que da una referencia aproximada de velocidad de entrenamiento, pero no de inferencia.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros agentes de locomocion LINK-01 ni resultados de referencia con los que comparar parametros, contexto o rendimiento. Como referencia cualitativa, el modelo se situaria en la categoria de politicas PPO para MuJoCo (por ejemplo, entornos tipo Ant o Walker2d de Gymnasium), pero no se dispone de datos comparables declarados para establecer una tabla rigurosa.

## Limitaciones y advertencias

- Resultados no verificados: las metricas del model-index estan marcadas como `verified: false`; proceden unicamente del autor.
- Entorno unico: el agente esta entrenado exclusivamente para `Link01WalkGuided-v0`; no hay evidencia de generalizacion a otros entornos, terrenos, perturbaciones o morfologias.
- Simulacion, no realidad: no se documenta transferencia sim-to-real ni robustez ante ruido, latencia o dinamica no modelada del robot fisico.
- Licencia no disponible: la ausencia de licencia explicita impide asumir permisos de uso comercial o de redistribucion; debe contactarse con el autor antes de cualquier uso en produccion.
- Repositorio vacio en cuanto a documentacion adicional: 0 descargas y 0 likes, sin paper, blog ni demo publica enlazada en la informacion disponible; el unico material es la model card y los ficheros de pesos.
- Dependencia de `vecnormalize.pkl`: si se carga la politica sin las estadisticas de normalizacion correctas, el comportamiento puede degradarse de forma severa.
- Sin informacion sobre sesgos: al no tratar datos humanos ni lenguaje, no aplican sesgos sociales tipicos, pero tampoco se documenta analisis de robustez.
- Riesgo de sobreajuste al protocolo de evaluacion: 5 episodios de 20 segundos es una muestra pequena; la metrica de 0 caidas por minuto debe interpretarse con cautela.
- No apto para tareas de NLP, codigo, vision ni agentes conversacionales: es un controlador de locomocion, no un modelo generativo.

## Enlaces

- Hugging Face: https://huggingface.co/SUNGWOONHW/connectailab-rl-sungwoon-hwang-v1-link01-walk-ppo
- Stable-Baselines3 (libreria de entrenamiento): https://github.com/DLR-RM/stable-baselines3
- MuJoCo (simulador fisico): https://mujoco.org/
- No se han encontrado en la informacion disponible enlaces a papers, blogs, repositorios del entorno `link01-gym`, demos ni video publico (la model card referencia un `replay.mp4` local, sin URL externa).
