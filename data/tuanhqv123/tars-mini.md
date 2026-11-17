# tuanhqv123/tars-mini

## Resumen

TARS mini es un proyecto de robótica open source que combina diseño mecánico (CAD paramétrico en CadQuery), simulación física en MuJoCo y políticas de control entrenadas con aprendizaje por refuerzo (PPO mediante Stable-Baselines3). El robot es un cuadrúpedo de estilo TARS, de 216 mm de altura, con cuatro servos Waveshare ST3215 y una placa ESP32-S3-LCD-1.54 como unidad de control, pantalla, micrófonos y altavoz. El repositorio incluye tanto el hardware imprimible como las políticas entrenadas y los scripts de validación.

El problema que aborda es el de la locomoción robusta de un robot de bajo coste y pocos grados de libertad: cuatro servos que deben sostener marcha, giro, tumbado, levantado y recuperación tras caída. Las políticas se han validado en simulación con aleatorización de masa, fricción y fuerza de los servos en cada ensayo, lo que aporta una señal de robustez poco habitual en proyectos de este tamaño.

Es relevante ahora porque demuestra un flujo completo de ingeniería (CAD → simulación → RL → criterios de aceptación automáticos) reproducible con herramientas abiertas y hardware asequible. No es un modelo de lenguaje: es un artefacto de reinforcement learning empaquetado en formato Stable-Baselines3, con licencia MIT y un tamaño de repositorio de 0,4 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política PPO (Stable-Baselines3) sobre entorno Gymnasium; simulación MuJoCo construida a partir del CAD |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantización | no aplica |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | MIT |
| Formato de pesos | artefactos de Stable-Baselines3 (`.zip`) en `rl/models/`; CAD en STL/STEP; simulación en MuJoCo |

## Arquitectura y entrenamiento

El sistema se compone de tres capas. La primera es el modelo físico: un robot de 216 mm de altura con cuatro servos ST3215 de 12 V (dos para balanceo de pata, dos para altura de pata mediante manivela), cuerpo en PLA y suelas de TPU de 90 mm de profundidad. La segunda es la simulación MuJoCo (`sim/model.py`), con tamaños y masas derivados directamente del CAD. La tercera es el entorno Gymnasium (`rl/tars_env.py`) y el entrenamiento PPO (`rl/train.py`, `rl/finetune.py`), con ajuste fino y una compuerta de aceptación (`rl/gate2.py`) que evalúa cada checkpoint y detiene el entrenamiento al superar el criterio.

El entrenamiento incorpora aleatorización de masa, fricción y fuerza de los servos en cada ensayo, lo que obliga a la política a generalizar en lugar de sobreajustarse a una dinámica fija. La marcha se entrena con un modo de zancada tipo *vault* (`GAIT_MODE=vault`) y parámetros de temporización (`GAIT_T`, `GAIT_AS`, `GAIT_AH`) configurables por variables de entorno. El giro a la izquierda se obtiene por espejado de la política de giro a la derecha (`rl/mirror_turn_lib.py`), una técnica que reduce el coste de entrenamiento. Las acciones de tumbado y levantado se resuelven con movimientos scriptados (`sim/liedown_sole90.py`, `sim/cad_verify_sole90.py`) más que con políticas RL.

## Capacidades

- Marcha bípeda-cuadrúpeda estable a 9,0 cm/s con 0 caídas en 72 ensayos y carga de servos superior al 90 % solo el 1 % del tiempo.
- Giro a derecha e izquierda a 25,7 y 25,3 grados/s respectivamente, con 0 caídas en 24 ensayos por sentido.
- Tumbado y levantado: 24/24 éxitos, con pico de carga de servo del 35 %; termina tumbado sobre la espalda con la pantalla hacia arriba.
- Recuperación tras caída: 48/48 éxitos (24 boca abajo y 24 sobre la espalda).
- Robustez a variaciones de masa, fricción y fuerza de servo en cada trial de evaluación.
- Control de pantalla, micrófonos y altavoz a través de la ESP32-S3 (la transmisión de micrófono y altavoz a un servidor aún no está implementada).
- No soporta tool calling, agentes ni razonamiento multi-paso: no es un modelo de lenguaje.

## Casos de uso

- Robótica educativa de bajo coste: el repositorio permite a un aula reproducir el ciclo CAD → simulación → RL con hardware de menos de 200 euros en servos y placa, usando herramientas gratuitas (CadQuery, MuJoCo, Stable-Baselines3).
- Investigación en locomoción con pocos actuadores: sirve como banco de pruebas para estudiar cuánta movilidad se puede extraer de cuatro servos con zancadas tipo *vault* y suelas profundas.
- Validación de pipelines de RL robusto: la compuerta `rl/gate2.py` y la aleatorización de dinámica ofrecen un ejemplo concreto de criterios de aceptación automáticos que se pueden trasladar a otros entornos.
- Prototipado de recuperación tras caída: las rutinas scriptadas de levantado desde boca abajo y desde la espalda son directamente reutilizables como *fallback* en robots de tamaño similar.
- Demostraciones y divulgación: los GIF y MP4 de las cinco acciones (marcha, giro, tumbado, levantado, recuperación) sirven para presentar resultados de RL en robótica sin necesidad de montar el hardware.
- Base para extensiones de interacción: la ESP32-S3 con pantalla, micrófonos y altavoz deja preparada la integración de voz y display, aunque el streaming a servidor está pendiente de construir.
- Benchmark de impresión 3D funcional: los chequeos de imprimibilidad y el barrido de ajustes (`cad/`) son un ejemplo de verificación dimensional antes de imprimir piezas móviles.

## Benchmarks y rendimiento

Resultados verificados en simulación, con masa, fricción y fuerza de servo aleatorizadas en cada ensayo:

| Acción | Resultado | Modelo / script |
|---|---|---|
| Marcha | 9,0 cm/s; 0/72 caídas; servos >90 % de carga ~1 % del tiempo | `rl/models/accepted_walk6_vault12` |
| Giro derecha / izquierda | 25,7 / 25,3 grados/s; 0/24 caídas por sentido | `rl/models/accepted_turn3_sole90` (izquierda = política espejada) |
| Tumbado + levantado | 24/24; pico de servo 35 % | `sim/liedown_sole90.py` |
| Recuperación tras caída | 48/48 (24 boca abajo, 24 sobre la espalda) | `sim/cad_verify_sole90.py` |
| Micrófono + altavoz a servidor | no construido todavía | — |

Variante descartada: `rl/models/experimental_walk6_3s` (batería 3S de 11,1 V) alcanzó 9,9 cm/s pero con 1 caída en 72 ensayos, por lo que no se aceptó. Se probaron sin mejora significativa sobre los ~10 cm/s: zancada de velocidad constante (triángulo), periodo de paso más corto, mayor amplitud de zancada, batería 3S, mayor recompensa de velocidad, elevación de 16 mm y fricción de suelo 3×.

## Requisitos de hardware

- Para entrenamiento e inferencia en simulación: CPU moderna; MuJoCo y PPO con redes pequeñas no requieren GPU dedicada, aunque una GPU consumer acelera el entrenamiento.
- Para el robot físico: 4 servos Waveshare ST3215 de 12 V (SKU 22414), placa Waveshare ESP32-S3-LCD-1.54, adaptador de bus de servo Waveshare (A) con entrada de 9–12,6 V, 2 celdas 18650 en configuración 2S (7,4 V) y cuerpo impreso en PLA con suelas de TPU de 90 mm.
- No cabe en GPU consumer en el sentido habitual: no es un modelo de lenguaje; el despliegue es en el robot o en un simulador.
- Opciones de despliegue: MuJoCo para simulación, Stable-Baselines3 para cargar las políticas, scripts de renderizado (`render_walk_turn_sole90.py`, `render_liedown_sole90.py`, `render_fall_sole90.py`, `combine_5_actions.py`).
- Latencia y throughput: no disponibles; los vídeos de marcha y giro se reproducen en tiempo real y los de tumbado y levantado a 3× de velocidad.
- Instalación: `uv venv && uv pip install mujoco stable-baselines3 gymnasium imageio pillow cadquery`.

## Comparativa con modelos similares

| Proyecto | Tipo | Actuadores | Licencia | Validación |
|---|---|---|---|---|
| TARS mini | Cuadrúpedo de 4 servos, RL PPO + MuJoCo | 4 servos ST3215 | MIT | Simulación con aleatorización de dinámica; 0/72 caídas en marcha |
| Pupper / Stanford Pupper | Cuadrúpedo de 8-12 servos, RL y control clásico | 8-12 servos | Open source | Simulación y hardware |
| Mini Cheetah (MIT) | Cuadrúpedo de 12 actuadores | 12 motores | Código abierto parcial | Simulación y hardware |
| Unitree Go1 / Go2 | Cuadrúpedo comercial | 12 motores | Propietaria | Hardware comercial |

No se dispone de datos de benchmarks comparables publicados en la información proporcionada para establecer una comparación numérica con estos proyectos.

## Limitaciones y advertencias

- Los archivos CAD en `cad/out/stl` tienen suelas de 47 mm, mientras que los resultados de simulación requieren suelas de 90 mm. Hay que actualizar `foot_pad()` en `cad/tars_cad.py` antes de imprimir; de lo contrario, el robot físico no reproducirá la marcha validada.
- La velocidad de marcha está limitada a unos 10 cm/s con este cuerpo; múltiples estrategias probadas no la superaron.
- La transmisión de micrófono y altavoz a un servidor no está implementada.
- Las acciones de tumbado y levantado son movimientos scriptados, no políticas RL; su robustez ante perturbaciones externas no se ha caracterizado en la información disponible.
- No hay datos sobre sesgos, alucinación o comportamiento lingüístico porque no es un modelo de lenguaje.
- La licencia MIT permite uso comercial, pero el proyecto incluye hardware físico con requisitos de seguridad (batería de iones de litio, servos de 12 V) que deben evaluarse por separado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso comunitario ni de reproducibilidad independiente.
- No se especifican los idiomas soportados ni la composición del dataset de entrenamiento (no aplica en el sentido habitual, pero se desconoce el detalle de las recompensas y currículos).

## Enlaces

- Hugging Face: https://huggingface.co/tuanhqv123/tars-mini
- Repositorio del proyecto: incluido en el propio repo de Hugging Face (`cad/`, `sim/`, `rl/`, `results/`)
- Modelo de simulación: `sim/model.py`
- Entorno Gymnasium: `rl/tars_env.py`
- Entrenamiento: `rl/train.py`, `rl/finetune.py`
- Compuerta de aceptación: `rl/gate2.py`
- Espejado de giro: `rl/mirror_turn_lib.py`
- Scripts de validación: `sim/liedown_sole90.py`, `sim/cad_verify_sole90.py`
- Vídeos: `results/tars_5_actions.gif` y `.mp4`
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
