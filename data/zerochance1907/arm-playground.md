# zerochance1907/arm-playground

## Resumen

Arm Playground es un conjunto de dos políticas de control neuronal para un brazo robótico simulado de cuatro articulaciones (yaw de base, hombro, codo y muñeca), entrenadas con aprendizaje por refuerzo en PyTorch por el autor zerochance1907. No es un modelo de lenguaje: se trata de controladores compactos que, cada 20 ms (50 Hz), leen el estado del brazo y emiten cuatro comandos de velocidad articular, sin cinemática inversa ni planificador de trayectorias programados. La tarea `reach` lleva la mano a un objetivo 3D y lo vuelve a perseguir si se mueve; la tarea `push` se coloca detrás de un disco y lo empuja hasta una meta sobre la mesa sin pasarse.

Cada política es un perceptrón multicapa (MLP) muy pequeño con normalización de observaciones integrada: `clip((obs - mean) / std, -5, 5)` → Linear 128 → tanh → Linear 128 → tanh → Linear 4 → `clip(-1, 1)`. Las observaciones son vectores de 21 dimensiones (Reach) y 25 dimensiones (Push) que incluyen senos y cosenos de los ángulos articulares, velocidades normalizadas y posiciones cartesianas de mano, objetivo, disco y meta. El repositorio es de 0,0 GB y el modelo se distribuye tanto en safetensors como en ONNX (opset 17).

Su relevancia es acotada pero clara: sirve como ejemplo reproducible y didáctico de PPO y DAgger aplicados a robótica, con exportación verificada a ONNX y una demo ejecutable en el navegador. No está pensado para despliegue en hardware real ni para tareas fuera de su simulador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP (perceptrón multicapa) con normalización de observaciones integrada; 3 capas lineales (128, 128, 4) con activación tanh |
| Parametros totales | no disponible (no se declara el recuento; por las dimensiones, del orden de decenas de miles) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; la observación es un vector de 21 o 25 dimensiones por paso) |
| Tipos de cuantizacion | no disponible (pesos en float32; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors (con buffers `obs_mean` y `obs_std`) y ONNX (opset 17, entrada `obs` `[batch, obs_dim]`, salida `action` `[batch, 4]`, float32) |

## Arquitectura y entrenamiento

La arquitectura es un MLP de tres capas lineales con activación tanh y recorte de salida a `[-1, 1]`; cada salida es una velocidad articular objetivo escalada por `vmax = [2.0, 2.0, 2.5, 3.0]` rad/s. Los motores siguen el comando mediante un retardo de primer orden (τ = 80 ms) y se detienen en los límites articulares duros. El control corre a 50 Hz y el espacio de observación incluye `sin(q)`, `cos(q)`, velocidades normalizadas y posiciones cartesianas (base del brazo en el origen, `z` hacia arriba).

El entrenamiento se hizo íntegramente en CPU con una implementación compacta de PPO sin librería de RL, con 1024 brazos simulados en paralelo, normalización de observaciones, GAE y recompensas densas de progreso. `reach` se entrenó con PPO desde cero durante 20M de pasos simulados, con objetivos que saltan a nuevas posiciones durante los episodios para aprender a reperseguir. `push` se entrenó primero por imitación de un empujador programado con DAgger (1,8M de pasos) y luego se refinó con PPO (10M de pasos); desde cero, PPO se quedaba estancado rondando el disco. El experto programado solo se usa en entrenamiento.

## Capacidades

- Control de posición de la mano en 3D para un brazo simulado de cuatro articulaciones (tarea `reach`).
- Repersecución de objetivos que se mueven durante el episodio.
- Empuje de un disco hasta una meta sobre la mesa sin sobrepasarse (tarea `push`).
- Generación de comandos de velocidad articular a 50 Hz a partir de la observación completa del simulador.
- Normalización de observaciones y recorte de acciones integrados en el propio modelo (política "drop-in").
- Exportación a ONNX Runtime con paridad verificada frente a PyTorch y a la demo del navegador (tolerancia 1e-5, en la práctica ~1e-6).
- No soporta tool calling, agentes, razonamiento multi-paso, multilingüismo ni modalidades de visión o audio.

## Casos de uso

- Docencia de aprendizaje por refuerzo: el repositorio permite reproducir un pipeline PPO completo en CPU con 1024 entornos paralelos, útil para cursos y talleres que necesitan un ejemplo de robótica manejable.
- Estudio de imitación más refinamiento: la tarea `push` ilustra el patrón DAgger seguido de PPO, con la comparación explícita entre el experto programado (95% de entrega) y la política imitada y refinada (99,5%).
- Demo interactiva en navegador: la política ONNX se ejecuta en JavaScript (`web/sim.js`) y sirve para mostrar control neuronal en vivo sin infraestructura de servidor.
- Pruebas de exportación y paridad de modelos: los scripts de exportación y las trayectorias de paridad del repositorio son un caso de referencia para validar conversiones PyTorch → ONNX.
- Prototipado de entornos de control: el simulador `arm/sim.py` puede reutilizarse como banco de pruebas para comparar algoritmos de RL en un dominio de dimensión baja.
- Investigación de recompensas densas: las recompensas de progreso y el currículo implícito de objetivos móviles en `reach` sirven para experimentar con diseño de recompensas.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados), evaluados sobre 2000 layouts aleatorios nuevos en el simulador de entrenamiento:

| Tarea | Métrica | Valor |
|---|---|---|
| Reach | Éxito dentro de 3 cm (%) | 94 |
| Reach | Tiempo mediano (s) | 0,68 |
| Reach | Error mediano (cm) | 1,1 |
| Push | Disco entregado (%) | 99,5 |
| Push | Disco aún en la meta al final (%) | 97,5 |
| Push | Tiempo mediano (s) | 1,1 |

Como referencia interna del autor, el controlador programado que sirvió de experto entrega el 95% de los discos, y la imitación sola alcanzó el 96,7% en 1,84 s; la política final con PPO supera a ambos.

## Requisitos de hardware

- VRAM estimada para inferencia: mínima (el MLP tiene tres capas de 128, 128 y 4 unidades; los pesos ocupan del orden de kilobytes).
- GPU recomendadas: no requiere GPU; el autor entrenó todo en CPU.
- Cabe en cualquier GPU de consumo e incluso en CPU y en el navegador vía ONNX Runtime Web.
- Opciones de despliegue: PyTorch (safetensors), ONNX Runtime (opset 17) y ejecución en JavaScript en el navegador con la demo incluida.
- Latencia y throughput: no se publican cifras de latencia; el bucle de control está fijado a 50 Hz (20 ms por paso) y la inferencia del MLP es despreciable frente a ese periodo.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Arm Playground (`reach`, `push`) | MLP PPO/DAgger para brazo simulado de 4 articulaciones | no disponible (MLP 128-128-4) | no aplica | MIT | Hugging Face, GitHub, demo web |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Simulador propio, no un robot real: la física (cinemática, retardo de motor, límites articulares, disco deslizante con contacto simple) es un simulador escrito a mano (`arm/sim.py`); las políticas solo han visto ese simulador.
- Sin sim-to-real: no hay aleatorización de dominio, ni modelo de ruido de sensores, ni pruebas en hardware. No deben usarse estos pesos para accionar un brazo físico.
- La observación incluye estado exacto del simulador (posiciones de mano, disco y meta) que un sistema real tendría que estimar.
- Los resultados corresponden a las distribuciones de entrenamiento (objetivos y discos dentro del alcance del brazo sobre una mesa de 1,3 m); el comportamiento fuera de ellas no está probado.
- Benchmarks declarados por el autor y marcados como no verificados.
- Licencia MIT: permite uso comercial y modificación, pero sin garantías; al no haber validación en hardware, cualquier uso en producción requeriría un trabajo de transferencia y validación adicional.
- No es un modelo de lenguaje: no procesa texto, no tiene capacidades multilingües ni de razonamiento simbólico.

## Enlaces

- Hugging Face: https://huggingface.co/zerochance1907/arm-playground
- Demo en vivo en el navegador: https://zerochance1907.github.io/arm-playground/
- Hugging Face Space: https://huggingface.co/spaces/zerochance1907/arm-playground
- Código fuente en GitHub: https://github.com/zerochance1907/arm-playground
- Simulador PyTorch: https://github.com/zerochance1907/arm-playground/blob/main/arm/sim.py
- Captura de la demo: https://raw.githubusercontent.com/zerochance1907/arm-playground/main/docs/screenshot.jpg
