# Zorlu5454/ppo-scratch-LunarLander-v2

## Resumen

ppo-scratch-LunarLander-v2 es un agente de aprendizaje por refuerzo (RL) entrenado con una implementación de PPO escrita desde cero al estilo CleanRL sobre el entorno LunarLander-v2. Lo publica el usuario Zorlu5454 en Hugging Face como entrega de la Unit 8 del Deep RL Course. No es un modelo de lenguaje: no procesa ni genera texto, no tiene tokenizador y su única función es mapear observaciones del entorno a acciones de control.

El entrenamiento cubre 1.000.000 de timesteps con 16 entornos vectorizados, 244 actualizaciones de política y los hiperparámetros canónicos de PPO (learning rate 3e-4 con annealing, clip 0.2, GAE lambda 0.98, gamma 0.999, coeficiente de entropía 0.01, normalización de ventajas). La arquitectura es un actor-critic con redes MLP sobre un espacio de observación de 8 dimensiones y 4 acciones discretas.

El resultado declarado es un retorno medio de 110.16 con una desviación típica de 88.62, marcado como no verificado. Es relevante como referencia reproducible y didáctica de un pipeline PPO minimalista, pero conviene tratarlo con cautela: la varianza es muy alta y el valor queda por debajo del umbral de 200 que la comunidad suele usar para considerar resuelto LunarLander-v2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Actor-critic (política y función de valor) con redes MLP; algoritmo PPO. Numero de capas y unidades ocultas: no disponible |
| Parametros totales | no disponible (el repositorio figura con 0.0 GB y no se detalla el tamano de las redes) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; cada decision usa una observacion de 8 dimensiones) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no aplica |
| Licencia | no disponible |
| Formato de pesos | no disponible (no se documenta checkpoint, safetensors, GGUF ni equivalente) |
| Entorno | LunarLander-v2 (Gymnasium / Box2D) |
| Algoritmo | PPO con GAE, clipping de politica y de value loss, normalizacion de ventajas |
| Total de timesteps | 1.000.000 |
| Entornos paralelos | 16 |
| Batch size / minibatch | 4096 / 128 |
| Numero de actualizaciones | 244 |
| Epocas de actualizacion | 4 |
| Semilla | 1 |
| Fecha de publicacion (metadatos HF) | 2026-09-26 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El agente sigue el esquema actor-critic de PPO en su variante para acciones discretas. La política y la función de valor se parametrizan como perceptrones multicapa que toman el vector de observación del entorno (posición, velocidad, ángulo, velocidad angular, contacto con el suelo en ambas patas) y producen, respectivamente, una distribución categórica sobre las 4 acciones disponibles y un escalar de valor. El entrenamiento usa ventajas calculadas con GAE (lambda 0.98, gamma 0.999), normalización de ventajas, recorte del ratio de política (clip_coef 0.2), recorte opcional de la pérdida de valor (clip_vloss activado), coeficiente de entropía 0.01, coeficiente de valor 0.5 y recorte de norma de gradiente a 0.5.

El bucle de recolección usa 16 entornos vectorizados con 256 pasos por entorno, lo que da un batch de 4096 transiciones por iteración, dividido en 32 minibatches de 128 durante 4 épocas. Con learning rate 3e-4 y annealing activado, el cálculo de actualizaciones es coherente: 1.000.000 / 4096 ≈ 244. El autor indica que la implementación es propia, inspirada en el estilo de CleanRL, y que se registran métricas en TensorBoard (etiqueta presente en el repositorio). No se documenta ningún mecanismo adicional como recurrencia, normalización de observaciones, curriculo, decodificación especulativa ni búsqueda de hiperparámetros.

## Capacidades

- Control de política en LunarLander-v2: selecciona entre 4 acciones discretas (no hacer nada, motor de orientación izquierdo, motor principal, motor de orientación derecho) a partir de una observación de 8 dimensiones.
- Optimización de retorno acumulado con descuento (gamma 0.999) mediante PPO con ventajas GAE.
- Entrenamiento vectorizado: el pipeline soporta 16 entornos en paralelo y logging en TensorBoard.
- No dispone de generación de texto, razonamiento simbólico, código, matemáticas ni visión.
- No soporta tool calling ni function calling.
- No soporta agentes conversacionales ni razonamiento multi-paso fuera del propio bucle de decisión del entorno.
- No tiene capacidades multilingües (no procesa lenguaje).
- No dispone de modo de razonamiento explícito (thinking mode), audio ni multimodalidad.
- Solo es válido para el entorno para el que fue entrenado; no se documenta transferencia a otras tareas.

## Casos de uso

- Material docente para cursos de RL: sirve como ejemplo completo de PPO implementado desde cero, con hiperparámetros explícitos y trazabilidad de TensorBoard, útil para explicar recolección vectorizada, GAE y clipping en clase.
- Reproducción de experimentos: la combinación semilla 1, 1.000.000 de timesteps y 244 actualizaciones permite regenerar el entrenamiento y comparar curvas de aprendizaje si se dispone del código del autor.
- Estudios de sensibilidad a la semilla: con una desviación típica de 88.62 sobre el retorno medio, el modelo es un caso claro para ilustrar la alta varianza de PPO en entornos de control con recompensa dispersa y para justificar evaluaciones con múltiples semillas.
- Ablaciones de hiperparámetros: partiendo de esta configuración base se pueden medir efectos de cambiar gamma, gae_lambda, ent_coef, num_envs o el número de épocas de actualización sobre el retorno medio.
- Transferencia y fine-tuning a variantes del entorno: el esquema actor-critic puede reutilizarse como inicialización para LunarLander-v3 o para versiones con espacio de acciones continuo, sustituyendo la cabeza de política.
- Pruebas de infraestructura de entrenamiento: el bucle con 16 entornos vectorizados y logging a TensorBoard es útil para validar pipelines de RL, gestión de workers y monitorización antes de escalar a tareas más costosas.
- Comparación de algoritmos: puede usarse como referencia PPO frente a alternativas como DQN, A2C o SAC en el mismo entorno, siempre que se igualen presupuesto de timesteps y protocolo de evaluación.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index de la model card (no verificados):

| Tarea | Dataset / entorno | Metrica | Valor | Verificado |
|---|---|---|---|---|
| reinforcement-learning | LunarLander-v2 | mean_reward | 110.16 +/- 88.62 | No |

No se han publicado otros resultados de benchmarks en la informacion disponible. No hay datos de retorno por episodio, curva de aprendizaje, numero de episodios evaluados ni protocolo de evaluacion (si se uso politica determinista o estocastica), lo que limita la comparabilidad del unico valor reportado.

## Requisitos de hardware

- No se publican requisitos de hardware ni consumo de recursos en la informacion disponible.
- Naturaleza de la carga: el agente es una red MLP de salida pequena sobre observaciones de 8 dimensiones y 4 acciones; este tipo de redes se entrena sin problema en CPU, aunque la simulacion de Box2D y la vectorizacion de 16 entornos son las partes que dominan el coste de pared.
- VRAM estimada para inferencia: minima (por debajo de 1 GB en cualquier GPU moderna); la red es de escala muy inferior a cualquier LLM. No hay cifras oficiales.
- GPU recomendadas: no disponibles. Cualquier GPU con soporte CUDA para PyTorch es suficiente; no se requiere A100, H100 ni VRAM de gama alta.
- GPU de consumo: si, cabe en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.), e incluso la inferencia puede ejecutarse en CPU.
- Opciones de despliegue: no documentadas. El formato esperado es un script de Python con PyTorch y Gymnasium o Gym, con Box2D instalado; no hay artefactos de despliegue tipo vLLM, llama.cpp, Ollama o TGI, que no aplican a un agente de RL.
- Latencia y throughput: no disponibles. En inferencia, una pasada de la MLP es del orden de microsegundos; el cuello de botella real es el paso de simulacion del entorno.
- Caveat de disponibilidad: el repositorio figura con 0.0 GB, por lo que no hay evidencia de que los pesos entrenados esten subidos. Sin checkpoint, el modelo no es cargable directamente.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Parametros | Contexto | Rendimiento reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| ppo-scratch-LunarLander-v2 (Zorlu5454) | PPO actor-critic, implementacion propia | LunarLander-v2 | no disponible | no aplica | mean_reward 110.16 +/- 88.62 (no verificado) | no disponible | Repositorio HF sin pesos aparentes (0.0 GB) |
| CleanRL ppo.py (referencia citada por el autor) | PPO actor-critic | LunarLander-v2 entre otros | no disponible | no aplica | no disponible en la informacion proporcionada | MIT (segun el proyecto de referencia) | Codigo publico |
| Stable-Baselines3 PPO | PPO actor-critic | LunarLander-v2 entre otros | no disponible | no aplica | no disponible en la informacion proporcionada | MIT | Libreria publica |
| Tianshou PPO | PPO actor-critic | LunarLander-v2 entre otros | no disponible | no aplica | no disponible en la informacion proporcionada | MIT | Libreria publica |

No se dispone de cifras verificadas de retorno medio para las alternativas en la informacion proporcionada, por lo que la comparacion cuantitativa no es posible. La comparacion relevante es cualitativa: frente a librerias mantenidas como Stable-Baselines3 o Tianshou, este repositorio aporta una implementacion propia y reproducible con hiperparametros explicitos, a cambio de no ofrecer garantias de mantenimiento, licencia declarada ni pesos publicados.

## Limitaciones y advertencias

- Varianza muy alta: una desviacion tipica de 88.62 sobre un retorno medio de 110.16 indica un comportamiento inestable entre episodios; el intervalo de confianza es amplio y el valor medio no describe bien el rendimiento tipico.
- Por debajo del umbral habitual de exito: en LunarLander-v2 se suele considerar resuelto el entorno a partir de un retorno medio de 200; 110.16 queda claramente por debajo, aunque no hay confirmacion del protocolo de evaluacion empleado.
- Resultado no verificado: el propio model-index marca `verified: false` y no se detalla numero de episodios de evaluacion ni si se uso politica determinista.
- Una sola semilla: el entrenamiento usa seed 1 y no se reportan repeticiones, por lo que no se puede separar el efecto del algoritmo del efecto de la semilla.
- Sin licencia declarada: no se especifica licencia, lo que impide determinar si el uso comercial esta permitido. Ante la ausencia de terminos, lo prudente es no asumir permisos.
- Pesos no disponibles: el repositorio figura con 0.0 GB, por lo que no hay evidencia de checkpoints publicados; sin pesos no es posible reproducir la inferencia ni verificar el retorno declarado.
- Sin sesgos de lenguaje ni alucinacion: al no ser un modelo de lenguaje no aplican sesgos linguisticos ni riesgo de alucinacion, pero si aplica el riesgo de sobreajuste al entorno y de dependencia de la version de Box2D y Gymnasium.
- Especificidad total al entorno: el agente no es reutilizable fuera de LunarLander-v2 sin reentrenar las cabezas de politica y valor.
- Dependencia de la implementacion: al ser codigo propio inspirado en CleanRL, detalles no documentados (normalizacion de observaciones, gestion de terminaciones, inicializacion) pueden afectar a la reproducibilidad.
- Sin soporte de despliegue estandar: no existen artefactos compatibles con servidores de inferencia habituales; la integracion exige cargar el codigo y el entorno manualmente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Zorlu5454/ppo-scratch-LunarLander-v2
- Implementacion de referencia citada por el autor (CleanRL, no vinculada al autor del modelo): https://github.com/vwxyzjn/cleanrl
- Documentacion del entorno LunarLander de Gymnasium (no vinculada al autor del modelo): https://gymnasium.farama.org/environments/box2d/lunar_lander/

No se han encontrado en la busqueda web otros enlaces (paper, blog, repositorio propio, demo o Space) asociados a este modelo.
