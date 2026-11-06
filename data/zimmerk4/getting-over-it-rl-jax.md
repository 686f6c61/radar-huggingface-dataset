# zimmerk4/getting-over-it-rl-jax

## Resumen

`getting-over-it-rl-jax` es una política de aprendizaje por refuerzo, no un modelo de lenguaje. La publica el usuario zimmerk4 en Hugging Face y resuelve un problema concreto: jugar de principio a fin al videojuego *Getting Over It with Bennett Foddy* mediante una única red neuronal que controla el ratón, sin guardar ni cargar partidas. El modelo se entrena íntegramente en un simulador de la física del juego reimplementado en JAX y después se transfiere al juego real sin modificarlo, usando un plugin de BepInEx.

La relevancia técnica está en el pipeline sim-to-real: un port bit a bit de la física Box2D 2.3.1 de Unity 2020.3 a JAX, entrenamiento PPO con currículo de estados iniciales y un mecanismo de superación de "muros" (secciones donde la política se atasca) mediante copias especializadas. El resultado reportado es una tasa de victoria del 85 % (17 de 20 ascensiones continuas) en el juego real, con una mediana de 1 min 55 s por partida.

El artefacto es minúsculo (repo de 0.0 GB) y no contiene pesos en formato de modelo de lenguaje: `policy.npz` guarda arrays NumPy planos (pesos de política y valor, normalizador de observaciones y configuración). No es un modelo generativo ni tiene capacidades de texto, visión o tool calling.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MLP (perceptrón multicapa) con dos capas ocultas de 256 unidades y activación tanh; red de valor separada de la misma forma |
| Parámetros totales | no disponible (el repo no publica el recuento; por la forma de las capas, del orden de 10^5, no confirmado) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada fija de 105 floats por paso) |
| Tipos de cuantización | no disponible (pesos en `policy.npz` como arrays NumPy de precisión nativa) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | `.npz` (NumPy, sin pickle, cargable con `allow_pickle=False`) |
| Entrada | 105 floats: estado del pot y el martillo, 32 distancias de rayos de terreno, progreso de ruta, últimas 4 acciones, contador de estancamiento y diferencia con la mejor altura alcanzada |
| Salida | Movimiento de ratón 2-D en [-1, 1], escalado por 12 antes de enviarse al juego |
| Librería | JAX (entrenamiento); inferencia también posible con NumPy puro |
| Pipeline | reinforcement-learning |
| Descargas / likes | 47 descargas, 0 likes |

## Arquitectura y entrenamiento

La política es una MLP pequeña: dos capas ocultas de 256 unidades con tanh, media acotada por tanh y desviación típica logarítmica fija; hay una red de valor independiente con la misma forma. La observación es un vector de 105 floats que combina el estado del jugador y el martillo, 32 distancias de rayos contra el terreno, el progreso de ruta, las últimas cuatro acciones, un contador de estancamiento y la distancia a la mejor altura alcanzada. La salida se interpreta como desplazamiento de ratón y se multiplica por 12 antes de enviarse al juego.

El entrenamiento se hizo con PPO sobre un simulador en JAX que reproduce la física Unity 2020.3 Physics2D (Box2D 2.3.1 con la articulación revolute de Unity), el controlador del jugador, el cambio de fricción y la sección espacial con gravedad cero, pozos gravitatorios, teletransportadores y condición de victoria. El simulador coincide bit a bit con el mundo Box2D real en grabaciones del juego y corre a 45.000-50.000 pasos por segundo con 16.384 partidas en paralelo en una RTX 3090. Los rollouts, las actualizaciones y el currículo de estados iniciales se ejecutan en GPU al estilo PureJaxRL; los episodios arrancan desde estados guardados a lo largo de toda la ruta, con más frecuencia en las secciones que la política no supera, y se complementan con búsquedas Go-Explore en el simulador. La recompensa es el progreso nuevo de ruta.

La innovación destacable es el mecanismo de superación de muros: cuando la política de ruta completa se atascaba (en el Devil's Chimney, a 176 m, y en la torre de muebles de jardín, a 289 m), se entrenaba una copia solo desde estados iniciales justo por debajo del muro y con más ruido de exploración, que lo superaba en aproximadamente una hora de GPU. La red final es la última de esas copias: 2.512 actualizaciones y unos 1.300 millones de pasos simulados en todo el linaje. No se usaron las redes ni los modelos del proyecto upstream.

## Capacidades

- Control motor continuo en 2-D: convierte observaciones de estado del juego en movimientos de ratón para impulsar el martillo.
- Navegación y escalada de una ruta completa de plataformas con física realista, sin reinicio ni guardado.
- Generalización sim-to-real: la política entrenada en el simulador JAX juega el juego real sin reentrenamiento, a través de un plugin de BepInEx.
- Recuperación tras caídas: el informe de evaluación incluye ascensiones que no terminaron en 5 minutos con alturas de 49 m, 155 m y 413 m antes de una caída, lo que indica que la política sigue actuando tras perder progreso.
- Inferencia sin JAX: la model card documenta el cálculo de una acción con NumPy puro a partir de `policy.npz`.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico, matemáticas, visión, audio ni capacidades multilingües.

## Casos de uso

- Investigación en sim-to-real: usar el par simulador JAX + política como banco de pruebas para estudiar la brecha entre física simulada y real; el port bit a bit de Box2D permite aislar el error de política del error de simulación.
- Reproducción de experimentos de RL con PPO en GPU: el código y la configuración final (`config.json`) permiten repetir el entrenamiento con 16.384 entornos paralelos en una sola RTX 3090, útil para docencia o para validar implementaciones de PureJaxRL.
- Currículo de estados iniciales y Go-Explore: el linaje de políticas y el mecanismo de muros sirven como caso de estudio de curriculum learning aplicado a tareas de horizonte largo con recompensa dispersa.
- Automatización de pruebas de jugabilidad: una política que completa el juego de forma fiable (85 % de victorias) puede emplearse para detectar regresiones en la física o en el controlador tras cambios en el motor.
- Benchmark de eficiencia de simuladores: los 45.000-50.000 pasos por segundo con 16.384 partidas sirven de referencia para comparar rendimiento de motores de física vectorizados en JAX frente a alternativas.
- Inferencia ligera en entornos sin GPU: al poder calcular acciones con NumPy puro y un `.npz` pequeño, la política se integra en scripts de automatización sin dependencias de JAX ni de frameworks de deep learning.
- Docencia de RL: el ejemplo completo (observación, red, entrenamiento, evaluación en juego real) es un caso cerrado y reproducible para explicar PPO y transferencia sim-to-real.

## Benchmarks y rendimiento

Resultados reportados en el juego real (20 ascensiones continuas desde el inicio del nivel, máximo 5 minutos por intento):

| Métrica | Valor |
|---|---|
| Victorias | 17 de 20 (85 %) |
| Tiempo mediano hasta la victoria | 1 min 55 s de juego (3.436 acciones) |
| Victoria más rápida | 87 s (2.605 acciones) |
| Ascensiones no completadas en 5 min | 3 (mejores alturas: 49 m, 155 m y 413 m antes de una caída) |
| Rendimiento del simulador | 45.000-50.000 pasos/s con 16.384 partidas en paralelo en RTX 3090 |
| Entrenamiento total del linaje | 2.512 actualizaciones, ~1.300 millones de pasos simulados |

No se han publicado resultados de benchmarks en la información disponible para comparaciones con otras políticas o con modelos de lenguaje.

## Requisitos de hardware

- Entrenamiento: una RTX 3090 es suficiente para 16.384 entornos paralelos a 45.000-50.000 pasos/s; no se documentan requisitos de VRAM exactos.
- Inferencia: la política es una MLP de dos capas de 256 unidades; cabe en CPU y en cualquier GPU consumer, y la model card muestra cómo evaluarla con NumPy puro sin GPU.
- GPU recomendadas: RTX 3090 para entrenamiento (dato reportado); para inferencia, cualquier GPU o CPU moderna.
- Despliegue: el paquete `goi_jax` incluye `goi_jax.play` para cargar `policy.npz` y jugar; requiere el juego y el plugin de BepInEx instalados. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput de inferencia: no disponibles; el coste por paso es el de una MLP pequeña más el bucle del juego.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Licencia | Contexto / alcance | Disponibilidad |
|---|---|---|---|---|---|
| getting-over-it-rl-jax (este) | Política RL (MLP) | 105 floats | MIT | Ruta completa del juego, 85 % de victorias en 20 intentos | Hugging Face + GitHub (rama `jax-engine`) |
| miwate/getting-over-it-rl (upstream) | Política RL | no disponible en la información | no disponible | Proyecto original; sus redes no se usaron aquí | GitHub |
| Políticas RL para videojuegos en general | Varía | Varía | Varía | No comparable directamente sin datos | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona simbólicamente, no hace tool calling ni procesa imágenes, audio o múltiples idiomas.
- Dependencia del entorno: la política está acoplada a la observación de 105 floats del plugin y a la física del juego; cualquier cambio en el juego, en el plugin o en la versión de Unity puede degradar el rendimiento.
- Tasa de fallo no trivial: 3 de 20 ascensiones no terminaron en 5 minutos, con caídas desde alturas de hasta 413 m; no es un sistema determinista ni garantiza completar la partida.
- Ruido de acción: la model card usa ruido gaussiano (desviación 0.5 por defecto en `play.py`) al calcular la acción; la reproducibilidad exacta requiere fijar la semilla.
- Sesgos y alucinación: no aplican en el sentido habitual de modelos generativos, pero la política puede explotar peculiaridades del simulador que no se transfieran al juego real.
- Licencia MIT: permite uso comercial y modificación con atribución; aun así, el uso del juego real está sujeto a la licencia del propio *Getting Over It* y al plugin BepInEx.
- Documentación escasa: 0 likes y 47 descargas, sin resultados de benchmarks frente a alternativas; el recuento exacto de parámetros y los requisitos de VRAM no están publicados.
- El repositorio de Hugging Face tiene 0.0 GB, lo que sugiere que los artefactos pesados (grabaciones, logs de evaluación) pueden no estar incluidos o residir solo en GitHub.

## Enlaces

- Hugging Face: https://huggingface.co/zimmerk4/getting-over-it-rl-jax
- Código (rama `jax-engine`): https://github.com/krzim/getting-over-it-rl/tree/jax-engine
- Proyecto upstream: https://github.com/miwate/getting-over-it-rl
- Evaluación en el repo: carpeta `eval/` (comando, log de consola e informe JSON de las 20 ascensiones)
- Clip de victoria: `media/jax-win.gif` en el repositorio de Hugging Face
- Resultado de búsqueda web proporcionado: https://storelocatortool.com/v3/walmart-locations/ (no relacionado con el modelo; se incluye solo por completitud de la búsqueda)
