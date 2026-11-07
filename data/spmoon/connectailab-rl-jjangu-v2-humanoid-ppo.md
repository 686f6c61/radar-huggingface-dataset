# spmoon/connectailab-rl-jjangu-v2-humanoid-ppo

## Resumen

`connectailab-rl-jjangu-v2-humanoid-ppo` es un agente de aprendizaje por refuerzo (RL) entrenado con el algoritmo PPO (Proximal Policy Optimization) para controlar el robot humanoide simulado del entorno `Humanoid-v5` de Gymnasium sobre el motor fisico MuJoCo. Lo desarrolla el usuario de Hugging Face `spmoon` en el marco del proyecto Connect AI Lab, y se publica como continuacion de una version previa (V1), cuyos pesos se reutilizan como punto de partida para un entrenamiento adicional de 1.000.000 de pasos.

No se trata de un modelo de lenguaje ni de un modelo fundacional: es una politica neuronal compacta que mapea observaciones de 348 dimensiones (estado de sensores y articulaciones del cuerpo completo) a acciones de 17 dimensiones (pares de torsion de los motores). Su relevancia es acotada y experimental: sirve como referencia reproducible de un pipeline PPO aplicado a control continuo de alta dimension, y como ejemplo didactico de entrenamiento por refuerzo profundo en MuJoCo.

La informacion publicada es muy limitada: el repositorio aparece con 0 descargas y 0 likes, sin licencia declarada, sin idiomas y sin datos de benchmarks mas alla de la recompensa media de entrenamiento reportada en la model card (402,6).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceptron multicapa (MLP) con dos capas ocultas de 256 unidades y activacion Tanh; cabeza de politica gaussiana (Normal) sobre 17 dimensiones |
| Parametros totales | no disponible (estimacion a partir de la topologia: aproximadamente 348x256 + 256x256 + 256x17, mas sesgos, en torno a 160.000 parametros; no confirmado por el autor) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; la observacion es un vector de 348 dimensiones por paso) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | no disponible (repositorio etiquetado como `pytorch`; tamano del repo 0,0 GB) |

## Arquitectura y entrenamiento

La politica es una red neuronal totalmente conectada con topologia 348 -> 256 (Tanh) -> 256 (Tanh) -> 17 (Normal), es decir, dos capas ocultas y una distribucion gaussiana diagonal sobre las 17 acciones de control de pares de torsion. El entorno es `Humanoid-v5` de Gymnasium sobre MuJoCo, con espacio de observacion `Box(348)` y espacio de accion `Box(17)`. El algoritmo de optimizacion es PPO con los siguientes hiperparametros declarados: 16 entornos en paralelo, 512 pasos por actualizacion, recorte de la razon de probabilidad de 0,2, tasa de aprendizaje de 0,0002 y un total de 1.000.000 de pasos de entrenamiento.

El modelo es una continuacion (V2) que hereda los pesos de la version V1 y aplica un entrenamiento adicional a gran escala. La model card reporta una recompensa media reciente de 402,6 y enlaza una curva de entrenamiento (`training_curve.png`). No se documentan detalles sobre inicializacion, semillas, normalizacion de observaciones, numero de epochs por actualizacion ni composicion del dataset, porque en RL el "dataset" es la propia distribucion de estados generada por la interaccion con el simulador.

## Capacidades

- Control continuo de un robot humanoide simulado: genera comandos de par motor de 17 dimensiones a partir de observaciones de 348 dimensiones.
- Locomocion y mantenimiento del equilibrio en el entorno `Humanoid-v5` de MuJoCo, orientado a la recompensa de avance sin caida.
- Aprendizaje por refuerzo con PPO: la politica esta optimizada para maximizar la recompensa acumulada del entorno, no para tareas generativas.
- Inferencia ligera: al ser una MLP pequena, la evaluacion de una accion es practicamente instantanea en CPU.
- No soporta tool calling ni function calling.
- No soporta agentes conversacionales ni razonamiento multi-paso en el sentido de los LLM.
- No tiene capacidades multilingues, de vision, de audio ni modo "thinking".
- No dispone de API de texto: la unica interfaz es el bucle observacion -> accion del entorno Gymnasium.

## Casos de uso

- Reproduccion de experimentos de RL: sirve como punto de partida para verificar pipelines PPO en `Humanoid-v5` con los hiperparametros declarados (16 entornos, 512 pasos, lr 0,0002) y comparar curvas de aprendizaje.
- Docencia y formacion: ejemplo compacto y legible de una politica PPO para control continuo de alta dimension, util en cursos de aprendizaje por refuerzo profundo.
- Baseline para comparativas: politica de referencia frente a otros algoritmos (SAC, TD3, A2C) sobre el mismo entorno y mismo presupuesto de pasos.
- Inicializacion para fine-tuning: los pesos V2 pueden reutilizarse como punto de partida (como se hizo desde V1) para entrenamientos mas largos o con recompensas modificadas.
- Pruebas de infraestructura de simulacion: validar instalaciones de MuJoCo, Gymnasium y versiones de PyTorch antes de lanzar entrenamientos costosos.
- Investigacion en sim2real a pequena escala: aunque no hay evidencia de transferencia al mundo real, la politica puede usarse como referencia en estudios de robustez frente a perturbaciones del simulador.
- Evaluacion de estabilidad de politicas: medir la varianza de la recompensa y la tasa de caidas en episodios largos para estudiar la fiabilidad del entrenamiento PPO.

## Benchmarks y rendimiento

La model card solo reporta la recompensa media reciente de entrenamiento. No se han publicado resultados de benchmarks estandar (por ejemplo, recompensa media por episodio en evaluacion separada, comparativas con otras politicas ni metricas de robustez) en la informacion disponible.

| Metrica | Valor reportado |
|---|---|
| Recompensa media reciente (entrenamiento) | 402,6 |
| Pasos totales de entrenamiento | 1.000.000 |
| Entornos en paralelo | 16 |
| Pasos por actualizacion | 512 |
| Tasa de aprendizaje | 0,0002 |
| Recorte PPO | 0,2 |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; la red tiene del orden de 160.000 parametros y cabe holgadamente en cualquier GPU, e incluso en CPU.
- GPU recomendadas: cualquier GPU moderna es suficiente; no se requiere A100 ni H100. Una RTX 4090 o una GPU integrada pueden evaluar la politica sin cuello de botella.
- Cabe en GPU de consumo: si, en practicamente todas (GTX 1050, RTX 3060, RTX 4090, etc.), aunque el cuello de botella real sera el simulador MuJoCo, no la red.
- Opciones de despliegue: PyTorch nativo con el bucle de Gymnasium; exportacion a TorchScript u ONNX para inferencia sin dependencia de Python; no aplica vLLM, llama.cpp, Ollama ni TGI porque no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. La evaluacion de una accion es del orden de microsegundos en GPU y de decenas de microsegundos en CPU, pero el autor no publica mediciones.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparables en la informacion proporcionada. Como referencia estructural, se compara con otras politicas del mismo ecosistema del autor y con la linea base del entorno.

| Modelo | Tipo | Entorno | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| connectailab-rl-jjangu-v2-humanoid-ppo | PPO, MLP 348-256-256-17 | Humanoid-v5 | no disponible | no aplica | no disponible | Hugging Face |
| connectailab-rl-jjangu-v2 | RL + PEFT (GRPO, LoRA, Qwen3.5) | no disponible | no disponible | no disponible | apache-2.0 | Hugging Face |
| connectailab-rl-jjangu-v4-link01 | RL | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| Politica de referencia Humanoid-v5 (Gymnasium) | PPO, MLP | Humanoid-v5 | no disponible | no aplica | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; en RL, la politica puede explotar artefactos del simulador y comportamientos degenerados que no generalizan.
- Riesgo de alucinacion: no aplica en el sentido de los LLM, pero si existe riesgo de comportamientos no previstos fuera de la distribucion de estados de entrenamiento.
- Limitaciones de contexto o idioma: no procesa lenguaje; la "entrada" es un vector de 348 dimensiones y no hay ventana de contexto.
- Restricciones de licencia: la licencia no esta disponible, por lo que no se puede asumir uso comercial sin consultar al autor.
- Caveat para produccion: es un modelo experimental con 0 descargas y 0 likes, sin evaluacion independiente; no debe usarse como componente critico en sistemas reales sin validacion adicional.
- Dependencia del simulador: el rendimiento esta ligado a la version exacta de MuJoCo y Gymnasium; cambios de version pueden alterar la dinamica y degradar la politica.
- Ausencia de evaluacion separada: la recompensa de 402,6 es de entrenamiento; no se reporta evaluacion en episodios independientes ni intervalos de confianza.
- Sin datos de sim2real: no hay evidencia de transferencia a un robot fisico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/spmoon/connectailab-rl-jjangu-v2-humanoid-ppo
- Modelo relacionado V2 (GRPO, Qwen3.5, LoRA): https://huggingface.co/spmoon/connectailab-rl-jjangu-v2
- Modelo relacionado V4 link01: https://huggingface.co/spmoon/connectailab-rl-jjangu-v4-link01
- Entorno Humanoid-v5 de Gymnasium: https://gymnasium.farama.org/environments/mujoco/humanoid/
- MuJoCo: https://mujoco.org/
- Documentacion de PPO (Stable-Baselines3): https://stable-baselines3.readthedocs.io/en/master/modules/ppo.html
