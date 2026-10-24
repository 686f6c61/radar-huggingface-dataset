# spmoon/connectailab-rl-jjangu-v3-lunarlander

## Resumen

`connectailab-rl-jjangu-v3-lunarlander` es un agente de aprendizaje por refuerzo profundo entrenado con DQN (Deep Q-Network) para resolver el entorno `LunarLander-v3` de Gymnasium, cuyo objetivo es hacer aterrizar una nave en una plataforma controlando sus motores. Lo publica el usuario de Hugging Face `spmoon` en el marco del programa formativo CONNECT AI LAB × AI CITY BUILDERS, y la model card está redactada en coreano. No es un modelo de lenguaje: es una política neuronal de pequeña escala que mapea un vector de estado de 8 dimensiones a 4 acciones discretas.

El interés del artefacto es principalmente didáctico y de referencia: documenta de forma explícita la arquitectura (8 → 128 → 128 → 4 con activaciones ReLU) y todos los hiperparámetros de entrenamiento (200.000 pasos, tasa de aprendizaje 0,0005, gamma 0,99, batch de 128, actualización de la red objetivo cada 500 pasos, exploración durante el 30 % del entrenamiento). Eso lo convierte en un ejemplo reproducible de un pipeline DQN completo sobre un entorno clásico de control.

Su relevancia práctica es limitada y muy acotada al dominio: sirve como material docente, como línea base para comparar variantes de DQN y como pieza de demostración en notebooks o vídeos, no como componente de producción general. El autor declara una recompensa media de 233,6 en 10 episodios no vistos (el umbral de éxito del entorno se sitúa en 200), un resultado no verificado de forma independiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Perceptrón multicapa (MLP) usado como red Q en un DQN: 8 → 128 → 128 → 4, activación ReLU |
| Parámetros totales | 18.180 (calculado a partir de las capas declaradas) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (entrada fija de 8 valores numéricos por paso) |
| Tipos de cuantización | No disponible; pesos en coma flotante de 32 bits (`model.pt`) |
| Idiomas soportados | No aplica (agente de control, no procesa texto); la model card está en coreano |
| Licencia | No disponible (no declarada en la model card ni en los metadatos) |
| Formato de pesos | PyTorch `state_dict` en `model.pt`; no hay safetensors ni GGUF |
| Entorno | Gymnasium `LunarLander-v3` (Box2D) |
| Espacio de estados | 8 variables: posición x, posición y, velocidad x, velocidad y, inclinación, velocidad angular, contacto pata izquierda, contacto pata derecha |
| Espacio de acciones | 4 acciones discretas: no hacer nada, motor izquierdo, motor principal, motor derecho |
| Pipeline declarado | `reinforcement-learning` |
| Tamaño del repositorio | 0,0 GB (según metadatos de Hugging Face) |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Fecha de creación | 2026-10-24 |

## Arquitectura y entrenamiento

La política es una red Q totalmente conectada de tres capas: una entrada de 8 dimensiones, dos capas ocultas de 128 neuronas con ReLU y una salida de 4 valores Q, uno por acción discreta. El agente sigue el esquema DQN clásico: selección de acción epsilon-greedy, memorización de transiciones, muestreo de minilotes y una red objetivo separada actualizada periódicamente para estabilizar el objetivo de Bellman. No hay componentes convolucionales, recurrentes ni mecanismos de atención, y no se aplican técnicas de RLHF, DPO ni ajuste por preferencias, algo que no tiene sentido en este dominio.

Los hiperparámetros documentados son: 200.000 pasos totales de entrenamiento, tamaño de lote 128, tasa de aprendizaje 0,0005, factor de descuento gamma 0,99, fase de exploración del 30 % y sincronización de la red objetivo cada 500 pasos. La model card no detalla la composición del búfer de repetición, la política de decaimiento de epsilon, el número de semillas ejecutadas ni el protocolo exacto de evaluación; tampoco especifica si se aplicó doble DQN, dueling DQN o recorte de recompensas. El repositorio incluye un vídeo `replay.mp4` con una partida del agente, pero no se han publicado curvas de aprendizaje ni la varianza entre semillas.

## Capacidades

- Control discreto de un entorno físico 2D: decide en cada paso entre cuatro acciones (reposo, motor izquierdo, motor principal, motor derecho).
- Aterrizaje de la nave en `LunarLander-v3`: el autor reporta una recompensa media de 233,6 en 10 episodios no vistos.
- Inferencia en tiempo real sobre CPU: el forward pass de una red de 18.180 parámetros es del orden de microsegundos.
- Integración directa con Gymnasium: la política se puede enchufar en cualquier bucle de evaluación compatible con la API de `LunarLander-v3`.
- Carga sencilla en PyTorch: basta reconstruir el `nn.Sequential` y llamar a `load_state_dict`.
- No soporta tool calling, function calling, razonamiento multietapa, diálogo, visión, audio ni generación de texto.
- No tiene capacidades multilingües: no procesa lenguaje natural en ninguna fase.

## Casos de uso

- Docencia de aprendizaje por refuerzo: el paquete incluye arquitectura, hiperparámetros y vídeo de resultado, por lo que sirve como ejemplo cerrado de un pipeline DQN para explicar exploración, red objetivo y función Q en clase o en un taller.
- Línea base para comparativas de algoritmos: al estar acotado a un entorno estándar, permite medir la mejora de variantes como Double DQN, Dueling DQN, PPO o SAC sobre exactamente la misma tarea y el mismo espacio de acciones.
- Pruebas de infraestructura de evaluación RL: útil para validar que un arnés interno (registro de episodios, cálculo de recompensa media, semillas, logging) funciona antes de escalar a entornos más costosos.
- Demostraciones y material divulgativo: el agente se puede ejecutar en un bucle renderizado y grabar en vídeo para charlas, tutoriales o publicaciones de blog sobre RL, con un coste computacional despreciable.
- Punto de partida para ajuste fino: la red preentrenada puede inicializar el entrenamiento en variantes del entorno (gravedad distinta, viento, perturbaciones del motor) para estudiar transferencia y robustez.
- Componente embebido de demostración: al ocupar menos de 100 KB de pesos, se puede desplegar en un script ligero o incluso en un dispositivo con recursos mínimos para mostrar inferencia de políticas neuronales sin dependencias pesadas.
- Verificación de pipelines de carga de modelos: sirve para probar flujos de descarga desde el Hub, reconstrucción de arquitectura y ejecución determinista en integración continua.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Tarea | Entorno | Métrica | Valor | Verificado |
|---|---|---|---|---|
| Aprendizaje por refuerzo | LunarLander-v3 | Recompensa media en 10 episodios no vistos (umbral de éxito: 200) | 233,6 | No |

No se han publicado en la información disponible curvas de aprendizaje, desviación típica entre episodios, número de semillas ni resultados de otros algoritmos sobre el mismo agente. Tampoco hay comparaciones numéricas con otros modelos del mismo entorno.

## Requisitos de hardware

- VRAM estimada: prácticamente nula; los pesos son 18.180 parámetros en float32 (unos 73 KB), con lo que el modelo cabe en cualquier GPU o incluso en memoria de CPU.
- GPU recomendadas: ninguna en particular; funciona en CPU sin problema. Cualquier GPU (RTX 4090, A100, H100) está sobredimensionada y solo aporta ventaja si se ejecutan muchos entornos en paralelo.
- GPU de consumo: sí, cabe en cualquier GPU de consumo e incluso en placas integradas.
- Opciones de despliegue: PyTorch nativo (script Python), exportación a TorchScript o ONNX para inferencia ligera. No aplica el despliegue con vLLM, TGI, llama.cpp u Ollama, que están pensados para modelos de lenguaje.
- Latencia: un forward pass de 8 → 128 → 128 → 4 se mide en microsegundos en CPU moderna; el cuello de botella real será el paso de simulación del entorno Box2D, no la red.
- Throughput: no disponible de forma documentada; con batching se pueden evaluar miles de estados por segundo en CPU.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| `spmoon/connectailab-rl-jjangu-v3-lunarlander` | DQN (MLP 8-128-128-4) | LunarLander-v3 | 18.180 | No aplica (estado de 8 valores) | Recompensa media 233,6 en 10 episodios (no verificado) | No disponible | Hugging Face |
| `moona-ai/lunar-lander-v3-dqn` | DQN | LunarLander-v3 | No disponible | No aplica | No disponible | No disponible | Hugging Face |
| `npatel221/Lunar_Lander_RL` | DQN | LunarLander | No disponible | No aplica | No disponible | No disponible | GitHub |
| `marcoom/lunar-lander-rl-controller` | Agente RL preentrenado con control manual y por IA | LunarLander-v3 | No disponible | No aplica | No disponible | No disponible | GitHub |

No se dispone de datos verificables de parámetros, licencia ni métricas para las alternativas, por lo que la comparación cuantitativa no es posible con la información disponible. El modelo `spmoon/connectailab-rl-jjangu-v2` del mismo autor es una propuesta distinta (basada en Qwen 3.5 con LoRA y GRPO, licencia Apache 2.0), no directamente comparable con este agente de control.

## Limitaciones y advertencias

- Ámbito muy restringido: solo resuelve `LunarLander-v3`; no generaliza a otros entornos ni a variantes del problema sin reentrenamiento.
- Resultado no verificado: la recompensa media de 233,6 procede únicamente de la model card del autor, sin semillas, desviación típica ni protocolo de evaluación detallado; 10 episodios es una muestra pequeña y con alta varianza intrínseca.
- Licencia no declarada: no hay información sobre uso comercial, redistribución o modificación, lo que supone un riesgo legal si se quiere integrar en un producto.
- Entrada rígida: el modelo espera exactamente el vector de 8 valores de `LunarLander-v3` en el mismo orden y escala; cualquier cambio en la observación invalida la política.
- Acciones discretas únicamente: no puede controlar empuje continuo ni extenderse a tareas de control continuo sin cambiar la cabeza de salida.
- Sin información sobre sesgos: no se documentan sesgos, pero el agente hereda las dinámicas y la función de recompensa del entorno, incluida su definición particular de aterrizaje exitoso.
- Riesgo de sobreajuste al simulador: al entrenarse 200.000 pasos sobre un único entorno determinista en su dinámica base, es esperable una caída de rendimiento ante perturbaciones (viento, gravedad variable, ruido en sensores).
- Repositorio prácticamente vacío: 0 descargas, 0 likes y 0,0 GB de tamaño registrado; conviene verificar que `model.pt` y `replay.mp4` están realmente presentes antes de depender de ellos.
- Documentación solo en coreano y sin artículo técnico asociado: no hay memoria de entrenamiento, ni código de entrenamiento publicado en el repositorio, lo que dificulta la reproducción exacta.
- No apto para tareas de lenguaje, razonamiento, código o agentes conversacionales: es un error de categoría usarlo para esos fines.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/spmoon/connectailab-rl-jjangu-v3-lunarlander
- Modelo v2 del mismo autor: https://huggingface.co/spmoon/connectailab-rl-jjangu-v2
- Repositorio CONNECT AI LAB (connect-tycoon): https://github.com/wonseokjung/connect-tycoon
- Curso de aprendizaje por refuerzo de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Documentación del entorno Lunar Lander (Gymnasium): https://gymnasium.farama.org/environments/box2d/lunar_lander/
- Agente DQN alternativo en Hugging Face: https://huggingface.co/moona-ai/lunar-lander-v3-dqn
- Implementación DQN de referencia en GitHub: https://github.com/npatel221/Lunar_Lander_RL
- Controlador preentrenado con control manual e IA: https://github.com/marcoom/lunar-lander-rl-controller
