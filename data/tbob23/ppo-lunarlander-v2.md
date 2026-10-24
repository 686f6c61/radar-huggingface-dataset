# TBob23/ppo-LunarLander-v2

## Resumen

`TBob23/ppo-LunarLander-v2` es un agente de aprendizaje por refuerzo entrenado con el algoritmo PPO (Proximal Policy Optimization) para resolver el entorno `LunarLander-v2` de Gym/Box2D, usando la librería stable-baselines3. No es un modelo de lenguaje: no procesa texto ni tiene ventana de contexto, sino que recibe una observación de 8 valores numéricos por paso (posición, velocidad, ángulo, velocidad angular y dos indicadores de contacto con el suelo) y emite una de 4 acciones discretas.

Lo publica el usuario TBob23 en Hugging Face, con un repositorio de menos de 0,1 GB que contiene un checkpoint de stable-baselines3 en formato `.zip`. La model card declara un resultado de `mean_reward` de 279,69 ± 21,43 en LunarLander-v2, por encima del umbral habitual de 200 que se considera "resuelto" en este entorno, aunque la métrica figura como no verificada (`verified: false`).

Su relevancia es formativa y de referencia: sirve como ejemplo reproducible de un pipeline completo de RL (entrenamiento con PPO, evaluación con `evaluate_policy`, publicación con `huggingface_sb3`) y como baseline para comparar algoritmos o variantes del entorno. No aporta innovaciones arquitectónicas ni capacidades generales fuera del entorno para el que fue entrenado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Agente PPO (Proximal Policy Optimization) con política de perceptrón multicapa sobre observaciones de 8 dimensiones; entorno LunarLander-v2 (Box2D, acciones discretas) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; el agente no procesa texto, recibe una observación de 8 valores por paso |
| Tipos de cuantización | no aplica; checkpoint de stable-baselines3 en `.zip`, no es un modelo de pesos tipo safetensors/GGUF |
| Idiomas soportados | no disponible; no aplica (no hay entrada ni salida en lenguaje natural) |
| Licencia | no disponible (no declarada en la model card) |
| Formato de pesos | `.zip` de stable-baselines3 (política + estado del optimizador), cargable con `huggingface_sb3.load_from_hub` |

## Arquitectura y entrenamiento

La arquitectura es la de un agente PPO estándar de stable-baselines3: una política neuronal que mapea el vector de observación del entorno a una distribución categórica sobre 4 acciones (no hacer nada, encender motor izquierdo, encender motor principal, encender motor derecho). En configuraciones habituales de stable-baselines3 para este entorno se emplea `MlpPolicy`, es decir, un perceptrón multicapa de pequeñas dimensiones con función de valor compartida o separada; el número exacto de capas y de parámetros no está documentado en la información disponible. El entrenamiento es on-policy, con recogida de rollouts y optimización con recorte de la ratio de probabilidad (clipping) característica de PPO.

No se especifican en la model card el número de pasos de entrenamiento, la semilla, la configuración de hiperparámetros, el número de entornos vectorizados ni la composición del dataset (en RL no hay dataset: los datos se generan por interacción con el simulador). Tampoco se documenta ningún uso de RLHF, DPO ni técnicas de alineación, algo ajeno a este tipo de modelo. La única métrica declarada es la recompensa media evaluada, sin información sobre el protocolo de evaluación ni sobre el número de episodios usados.

## Capacidades

- Control de políticas en el entorno `LunarLander-v2`: aterrizaje de un módulo lunar en una plataforma, con 4 acciones discretas y recompensa basada en aterrizaje seguro, consumo de combustible y posición.
- Toma de decisiones secuenciales en un espacio de observación continuo de 8 dimensiones.
- Evaluación reproducible mediante `stable_baselines3.common.evaluation.evaluate_policy`.
- Carga directa desde Hugging Face con `huggingface_sb3.load_from_hub`, lo que permite integrarlo en scripts de evaluación automatizados.
- Compatible con `make_vec_env` y con el resto de utilidades de stable-baselines3 (callback, monitor, wrappers), siempre que se respete la versión del entorno.
- No soporta tool calling, function calling, agentes basados en lenguaje, razonamiento multi-paso simbólico, visión, audio ni capacidades multilingües.

## Casos de uso

- Docencia y tutoriales de aprendizaje por refuerzo: el checkpoint permite a un alumno cargar un agente ya entrenado y reproducir la evaluación sin esperar horas de entrenamiento, ilustrando el ciclo completo de PPO con stable-baselines3.
- Baseline de comparación de algoritmos: sirve como referencia de rendimiento frente a A2C, DQN, SAC o TD3 sobre el mismo entorno, midiendo recompensa media y varianza con el mismo protocolo de evaluación.
- Pruebas de integración en pipelines MLOps: útil para validar flujos de descarga desde el Hub (`load_from_hub`), carga del `.zip`, creación del entorno y ejecución de `evaluate_policy` en CI, con un coste computacional mínimo.
- Punto de partida para experimentos de *reward shaping* o modificación del entorno: reentrenar o hacer fine-tuning cambiando gravedad, viento o función de recompensa y comparar contra este agente como control.
- Demostraciones visuales y divulgación: con `render_mode="human"` se puede mostrar en tiempo real cómo aterriza el módulo, lo que resulta adecuado para charlas, clases o vídeos explicativos de RL.
- Estudio de robustez y reproducibilidad: evaluar el agente con distintas semillas y condiciones iniciales para analizar la varianza declarada (± 21,43) y discutir la estabilidad de PPO en entornos con recompensa ruidosa.
- Referencia para pruebas de *serving* de políticas pequeñas: al ser un modelo minúsculo, permite medir latencia de inferencia y comparar frameworks de despliegue sin ruido de hardware.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (`model-index`), no verificados:

| Algoritmo | Entorno | Métrica | Valor | Verificado |
|---|---|---|---|---|
| PPO | LunarLander-v2 | mean_reward | 279,69 ± 21,43 | No |

No se han publicado en la información disponible resultados adicionales (por ejemplo, recompensa media por episodio a lo largo del entrenamiento, número de pasos hasta convergencia o comparación con otros agentes bajo el mismo protocolo). El umbral habitual para considerar resuelto `LunarLander-v2` es una recompensa media de 200 en 100 episodios consecutivos; el valor declarado lo supera, pero al no estar verificado ni detallarse el protocolo de evaluación debe tomarse con cautela.

## Requisitos de hardware

- VRAM: no aplica; el modelo no necesita GPU. Un perceptrón multicapa de este tamaño se ejecuta en CPU sin problema.
- RAM: previsiblemente por debajo de 1 GB incluyendo el intérprete de Python y las dependencias, aunque no se publica una cifra oficial.
- GPU recomendadas: ninguna; cualquier CPU moderna es suficiente. Una GPU solo tendría sentido para reentrenar con muchos entornos vectorizados.
- Cabe en cualquier GPU de consumo e incluso en entornos sin GPU (portátiles, contenedores pequeños, CI runners).
- Opciones de despliegue: `stable-baselines3` con `huggingface_sb3.load_from_hub`; no se documenta exportación a ONNX, TorchScript ni integración con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. Por la naturaleza del modelo, cada paso de inferencia es un *forward pass* de una red pequeña y se ejecuta en microsegundos o pocos milisegundos en CPU, pero no hay mediciones publicadas.
- Dependencias relevantes: `gym`/`gymnasium` con `Box2D` (requiere compilar `box2d-py` y `swig`), `stable-baselines3`, `torch` y `huggingface_sb3`. La compatibilidad de versión del entorno `LunarLander-v2` es un requisito práctico importante.

## Comparativa con modelos similares

| Modelo | Autor | Entorno | Algoritmo | Métrica declarada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| TBob23/ppo-LunarLander-v2 | TBob23 | LunarLander-v2 | PPO | 279,69 ± 21,43 (no verificado) | no disponible | Hugging Face |
| araffin/ppo-LunarLander-v2 | araffin (mantenedor de SB3) | LunarLander-v2 | PPO | no disponible en la información recogida | no disponible | Hugging Face |
| buildthemachine/ppo-LunarLander-v2 | buildthemachine | LunarLander-v2 | PPO | no disponible en la información recogida | no disponible | Hugging Face |
| Sibonile7/ppo-LunarLander-v2 | Sibonile7 | LunarLander-v2 | PPO | no disponible en la información recogida | no disponible | GitHub |

Los cuatro son agentes equivalentes en planteamiento: PPO de stable-baselines3 sobre el mismo entorno, con diferencias no documentadas en hiperparámetros, semilla y número de pasos. No hay datos públicos en la información disponible para establecer una comparación cuantitativa fiable entre ellos; el de `araffin` es la referencia canónica por proceder del mantenedor de la librería.

## Limitaciones y advertencias

- Especialización extrema: el agente solo funciona en `LunarLander-v2`; no generaliza a otros entornos, a variaciones de la dinámica ni a tareas de lenguaje.
- Métrica no verificada: el `mean_reward` declarado no está validado por un tercero y no se especifica el número de episodios, semillas ni versión del entorno usados en la evaluación.
- Varianza alta: la desviación de ± 21,43 indica una dispersión considerable entre episodios, por lo que el rendimiento en una ejecución concreta puede alejarse del valor medio.
- Sin licencia declarada: la ausencia de licencia impide asumir permisos de uso comercial, redistribución o modificación; hay que contactar con el autor antes de cualquier uso en producción.
- Model card incompleta: el apartado de uso contiene un `TODO` y código de ejemplo sin completar, por lo que la integración debe reconstruirse manualmente.
- Dependencia frágil del entorno: cambios de versión en `gym`/`gymnasium`, en `Box2D` o en stable-baselines3 pueden romper la carga del checkpoint o alterar la dinámica del entorno y, con ello, el rendimiento.
- Sin información sobre sesgos ni alineación: no aplica el concepto habitual de sesgo, pero el agente puede explotar particularidades del simulador y no representa un comportamiento físicamente realista.
- Riesgo de sobreajuste al simulador: al no haber datos de evaluación cruzada, no puede descartarse que la política esté ajustada a las condiciones exactas de entrenamiento.
- Sin soporte documentado de exportación: no hay constancia de conversión a ONNX u otros formatos, lo que limita su integración en stacks que no sean Python/SB3.
- Ausencia de información de entrenamiento: sin semilla, hiperparámetros ni curvas, la reproducibilidad del resultado declarado no está garantizada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TBob23/ppo-LunarLander-v2
- Repositorio de stable-baselines3: https://github.com/DLR-RM/stable-baselines3
- Librería de integración con el Hub (huggingface_sb3): https://github.com/huggingface/huggingface_sb3
- Modelo de referencia de araffin: https://huggingface.co/araffin/ppo-LunarLander-v2
- Otro agente equivalente en el Hub: https://huggingface.co/buildthemachine/ppo-LunarLander-v2
- Ejemplo de agente similar en GitHub: https://github.com/Sibonile7/ppo-LunarLander-v2
- Otro ejemplo en GitHub: https://github.com/rishisim/LunarLander-v2
- Ficha de referencia en AIBase: https://model.aibase.com/models/details/1915692708422901761
