# SUNGWOONHW/connectailab-rl-sungwoon-hwang-v2-link01-walk-ppo

## Resumen
Este repositorio contiene una politica de aprendizaje por refuerzo entrenada con PPO (Proximal Policy Optimization) mediante Stable-Baselines3 para el control de locomocion de un robot bipedo denominado LINK-01, dentro del entorno de simulacion `Link01Walk-v0` construido sobre MuJoCo (libreria `link01-gym`). No es un modelo de lenguaje: es un agente de control continuo que mapea observaciones de 51 dimensiones a acciones de 14 dimensiones correspondientes a las articulaciones del robot. El autor es SUNGWOON HWANG, ingeniero de diseno de componentes de automocion en SUBARU y colaborador del CONNECT AI LAB.

El modelo es una segunda version (v2) afinada a partir de un modelo base v1, con un esquema de ajuste fino hibrido que combina locomocion en terreno plano y adaptacion a pendientes de entre 0 y 8 grados. Se entrenó durante 600 000 pasos en aproximadamente 7,8 minutos, con una tasa de aprendizaje de 7e-05, clip de 0,2 y factor de descuento de 0,99, preservando una referencia de marcha generada por un patron central (CPG, *Central Pattern Generator*). El interes practico reside en que demuestra un flujo completo de entrenamiento de locomocion bipeda desde cero con PPO y una guia de marcha estructurada, reproducible en hardware de consumo.

Los resultados declarados por el autor son modestos pero consistentes: 2,233 m recorridos por episodio de 20 segundos, una velocidad media de 0,1116 m/s frente a una consigna de 0,18 m/s, y cero caidas por minuto en cinco episodios de prueba. La diferencia entre velocidad comandada y velocidad real indica que la politica sigue la referencia de marcha pero no alcanza plenamente la consigna, un comportamiento tipico en politicas afinadas con guia CPG conservada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de politica neuronal (actor-critico) entrenada con PPO mediante Stable-Baselines3 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; observacion de 51 dimensiones por paso) |
| Tipos de cuantizacion | no disponible (pesos en formato nativo de Stable-Baselines3, `model.zip`) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | `model.zip` (Stable-Baselines3), `vecnormalize.pkl` (estadisticas de normalizacion), `actor.json` (exportacion del actor) |

## Arquitectura y entrenamiento
El agente es una politica de control continuo entrenada con PPO, el algoritmo de gradiente de politica con recorte de la relacion de probabilidad (*clipped surrogate objective*, clip 0,2) implementado en Stable-Baselines3. El espacio de observacion tiene 51 dimensiones y el de accion 14 dimensiones, una por articulacion, con una postura base de referencia de ±0,18 rad. El entorno `Link01Walk-v0` se ejecuta en MuJoCo a traves de `link01-gym`, lo que implica fisica de contactos rigida y control en tiempo simulado.

El entrenamiento parte del modelo `connectailab-rl-sungwoon-hwang-v1-link01-walk-ppo` y aplica un ajuste fino hibrido (plano mas pendiente adaptativa) de 600 000 pasos, con tasa de aprendizaje 7e-05 y factor de descuento 0,99. La innovacion tecnica destacable es la preservacion de una referencia de marcha CPG durante el ajuste fino, que actua como guia estructurada del patron de locomocion, combinada con una adaptacion a pendientes verificada en el rango de 0 a 8 grados. No se documenta el uso de RLHF ni de DPO, algo esperable en un agente de control y no de lenguaje.

## Capacidades
- Locomocion bipeda hacia adelante en simulacion MuJoCo dentro del entorno `Link01Walk-v0`, con seguimiento de una consigna de velocidad (0,18 m/s en las pruebas).
- Control articular continuo de 14 grados de libertad a partir de observaciones de 51 dimensiones.
- Adaptacion a pendientes de entre 0 y 8 grados, verificada por el autor.
- Conservacion de un patron de marcha guiado por CPG que aporta estabilidad y reduce caidas (0 caidas por minuto declaradas).
- Ajuste fino sobre una politica previa (v1), lo que permite iterar sobre un comportamiento base ya aprendido.
- Exportacion del actor a JSON (`actor.json`), util para despliegue fuera del pipeline de entrenamiento.
- No soporta tool calling, function calling, agentes multi-paso, capacidades multilingues, vision, audio ni modo de razonamiento; no es un modelo de lenguaje.

## Casos de uso
- Investigacion en locomocion bipeda: sirve como punto de partida reproducible para estudiar el efecto de la guia CPG en el ajuste fino con PPO, comparando directamente con el modelo base v1.
- Simulacion de control en MuJoCo: el agente puede cargarse en `link01-gym` para evaluar politicas de marcha en terreno plano y en pendientes de hasta 8 grados antes de transferir a hardware.
- Benchmark interno de algoritmos de RL: al ser un entorno con metricas claras (distancia, velocidad, caidas), permite comparar PPO con otros algoritmos (SAC, TD3) bajo las mismas condiciones.
- Desarrollo de *curricula* de entrenamiento: la diferencia entre velocidad comandada (0,18 m/s) y velocidad real (0,1116 m/s) ofrece un objetivo medible para experimentar con recompensas y ajustes de la referencia CPG.
- Base para aprendizaje por imitacion o destilacion: el `actor.json` exportado puede usarse como profesor o como inicializacion en pipelines de destilacion hacia controladores mas ligeros.
- Validacion de robustez ante perturbaciones: el entorno permite inyectar ruido o cambios de friccion para medir la tasa de caidas del agente afinado frente a la del modelo base.
- Docencia en cursos de RL aplicado a robotica: el flujo completo (entorno, entrenamiento PPO, normalizacion, exportacion) es un ejemplo compacto y de bajo coste computacional para clases practicas.

## Benchmarks y rendimiento
Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Metrica | Valor | Entorno / condicion |
|---|---|---|
| Distancia por episodio de 20 s | 2,233 m | `Link01Walk-v0`, consigna 0,18 m/s, 5 episodios x 20 s |
| Velocidad media hacia adelante | 0,1116 m/s | `Link01Walk-v0`, consigna 0,18 m/s |
| Caidas por minuto | 0,0 | `Link01Walk-v0`, 5 episodios x 20 s |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware
- Inferencia muy ligera: la politica es una red neuronal pequena con entrada de 51 dimensiones y salida de 14; cabe holgadamente en CPU y en cualquier GPU de consumo.
- VRAM estimada: no disponible de forma exacta; por el tamano del repositorio (0,0 GB) y la naturaleza de la politica, el requisito es inferior a 1 GB en la practica.
- GPU recomendadas: no se especifican; cualquier GPU moderna (RTX 3060 o superior) es mas que suficiente para entrenamiento e inferencia. El entrenamiento declarado de 600 000 pasos en 7,8 minutos sugiere un coste computacional bajo.
- Despliegue: el agente se ejecuta con Stable-Baselines3 cargando `model.zip` y `vecnormalize.pkl`; el `actor.json` permite integraciones alternativas. No aplica vLLM, llama.cpp, Ollama ni TGI, que son herramientas para modelos de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / observacion | Rendimiento | Licencia |
|---|---|---|---|---|---|
| connectailab-rl-sungwoon-hwang-v2-link01-walk-ppo | Politica PPO para locomocion LINK-01 | no disponible | Observacion 51 dim. | 2,233 m/episodio; 0,1116 m/s; 0 caidas/min | no disponible |
| connectailab-rl-sungwoon-hwang-v1-link01-walk-ppo | Politica PPO base (v1) | no disponible | Observacion 51 dim. | no disponible | no disponible |
| Otros agentes de locomocion bipeda en MuJoCo (p. ej. familias de entornos tipo Gymnasium/MuJoCo) | Politicas RL | no disponible | Variable segun entorno | no disponible | no disponible |

La comparacion cuantitativa con alternativas no esta disponible en la informacion proporcionada; el unico punto de referencia documentado es el modelo base v1, del que este repositorio es un ajuste fino.

## Limitaciones y advertencias
- Resultados no verificados: las metricas de la model card estan marcadas como `verified: false`; no hay evaluacion independiente.
- Rendimiento limitado: la velocidad real (0,1116 m/s) es un 38 % inferior a la consigna (0,18 m/s), lo que indica un seguimiento imperfecto de la referencia de velocidad.
- Alcance restringido: solo se ha validado en terreno plano y pendientes de 0 a 8 grados; no hay evidencia de robustez ante escalones, terrenos irregulares, empujes externos o cambios de friccion.
- Simulacion frente a realidad: no se documenta transferencia *sim-to-real* al robot fisico LINK-01; el comportamiento en hardware puede degradarse por discrepancias de dinamica y actuacion.
- Sesgos y alucinacion: no aplican en el sentido habitual de los modelos de lenguaje, pero la politica puede exhibir comportamientos no deseados fuera de la distribucion de entrenamiento (por ejemplo, marcha inestable o caidas ante perturbaciones no vistas).
- Licencia no disponible: al no declararse licencia, no se puede asumir permiso para uso comercial ni redistribucion; es necesario contactar con el autor antes de cualquier uso en produccion.
- Idiomas: no procede; el modelo no procesa texto.
- Documentacion escasa: no se detallan la arquitectura exacta de las redes actor y critica, el numero de parametros ni la composicion completa del conjunto de entrenamiento.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de soporte de la comunidad o de correcciones posteriores.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/SUNGWOONHW/connectailab-rl-sungwoon-hwang-v2-link01-walk-ppo
- Modelo base v1: https://huggingface.co/SUNGWOONHW/connectailab-rl-sungwoon-hwang-v1-link01-walk-ppo
- Stable-Baselines3: https://github.com/DLR-RM/stable-baselines3
- MuJoCo: https://mujoco.org/
- PPO (paper original): https://arxiv.org/abs/1707.06347
