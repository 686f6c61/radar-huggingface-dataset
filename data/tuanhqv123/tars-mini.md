# tuanhqv123/tars-mini

## Resumen

TARS mini es un proyecto de robótica open source que combina diseño mecánico imprimible en 3D, simulación física y aprendizaje por refuerzo para construir un robot caminante de estilo TARS. Lo desarrolla el usuario tuanhqv123 y se publica bajo licencia MIT en Hugging Face. El repositorio no contiene un modelo de lenguaje, sino un conjunto de políticas PPO (Proximal Policy Optimization) entrenadas con Stable-Baselines3 en un entorno MuJoCo construido a partir del propio CAD del robot, junto con los ficheros STL/STEP para imprimir la estructura.

El robot mide 216 mm de altura y se acciona con cuatro servos Waveshare ST3215 de 12 V (dos para el balanceo de las patas y dos para la altura mediante manivela), controlados por una placa ESP32-S3-LCD-1.54 que también aporta pantalla, micrófonos y altavoz. La alimentación es una batería 2S (7,4 V nominales) con BMS y convertidor reductor a 5 V para la placa. El cuerpo es PLA y las suelas son TPU, con dos variantes de profundidad (47 mm por defecto y 90 mm opcional).

La relevancia del proyecto está en su enfoque de extremo a extremo verificable: las políticas se evalúan con puertas de aceptación automáticas (`rl/gate2.py`) y se reportan tasas de caída sobre simulaciones con masa, fricción y fuerza de servo aleatorizadas en cada ensayo. Además, incluye una demo ejecutable en el navegador mediante MuJoCo compilado a WASM, lo que permite probar el controlador sin hardware.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Políticas de reinforcement learning (PPO) sobre entorno MuJoCo; no es un modelo de lenguaje |
| Parametros totales | no disponible (no se indica el tamaño de las redes de política) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de texto) |
| Tipos de cuantizacion | no disponible (pesos de política PPO en formato Stable-Baselines3) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | Políticas Stable-Baselines3 (`.zip`), modelos MuJoCo, CAD en STL/STEP, código Python |
| Librería | stable-baselines3 |
| Tamaño del repositorio | 0,5 GB |
| Pipeline | reinforcement-learning |
| Altura del robot | 216 mm |
| Actuadores | 4× Waveshare ST3215 (12 V, SKU 22414) |
| Controladora | Waveshare ESP32-S3-LCD-1.54 |
| Alimentación | 2S (7,4 V), BMS 2S, buck a 5 V |
| Materiales | PLA (cuerpo), TPU (suelas de 47 mm por defecto; 90 mm opcional) |

## Arquitectura y entrenamiento

El sistema se compone de tres capas. La primera es el modelo CAD paramétrico escrito en CadQuery (`cad/tars_cad.py`), del que se exportan STL y STEP y del que se derivan tamaños y masas. La segunda es el modelo MuJoCo (`sim/model.py`), construido a partir de esas medidas, que sirve tanto para entrenar como para verificar. La tercera son las políticas PPO entrenadas con Stable-Baselines3 en un entorno Gymnasium propio (`rl/tars_env.py`), con scripts de entrenamiento (`rl/train.py`), ajuste fino (`rl/finetune.py`) y una puerta de aceptación (`rl/gate2.py`) que evalúa cada checkpoint y detiene el entrenamiento cuando se supera.

El entrenamiento usa aleatorización de dominio: cada ensayo de evaluación se ejecuta con masa, fricción y fuerza de servo aleatorizadas. Las políticas aceptadas cubren marcha, giro (la política de giro a la izquierda es un espejo de la derecha, `rl/mirror_turn_lib.py`), tumbarse, levantarse y recuperarse tras una caída. Algunos movimientos, como el baile de 14 segundos y las secuencias de tumbarse/levantarse con las suelas de 90 mm, son keyframes guionizados (`rl/dance.py`, `sim/liedown_sole90.py`) y no políticas entrenadas. El controlador navegable está portado a JavaScript para la demo en el navegador (`space_web/`).

## Capacidades

- Marcha bípeda con dos configuraciones de suela: 9,0 cm/s con suelas de 90 mm (0/72 caídas) y 4,7 cm/s con las de 47 mm (0/24 caídas).
- Giro a derecha e izquierda: 25,7/25,3 °/s con suelas de 90 mm (0/24 caídas por sentido); con 47 mm, 2/48 caídas.
- Tumbarse y levantarse: 24/24 con suelas de 90 mm, pico de servo al 35 %; 48/48 con suelas de 47 mm.
- Recuperación tras caída desde boca abajo y desde la espalda: 48/48 con suelas de 90 mm.
- Baile guionizado de 14 s (balanceo, contoneo, patadas, tijeras, reverencia): 48/48 terminan de pie, inclinación máxima 20°, pico de servo al 75 %.
- Controlador navegable (`rl/tars_control.py`) y demo en navegador con MuJoCo WASM.
- No incluye visión, audio, tool calling ni procesamiento de lenguaje; el micrófono y el altavoz aún no tienen streaming implementado ("not built yet").

## Casos de uso

- Investigación en locomoción bípeda de bajo coste: el repositorio ofrece un pipeline completo (CAD, simulación, entrenamiento PPO, puerta de aceptación) para reproducir y comparar políticas en un robot de 4 servos, útil para estudiar transferencia sim-a-real con hardware barato.
- Docencia de reinforcement learning: el entorno Gymnasium y los scripts de entrenamiento permiten a estudiantes entrenar, evaluar y depurar políticas PPO con aleatorización de dominio en una máquina de escritorio.
- Prototipado de robots de sobremesa: el diseño imprimible en PLA/TPU con electrónica Waveshare permite construir un robot caminante funcional sin mecanizado ni piezas a medida.
- Demostraciones interactivas en web: la demo en Hugging Face Spaces con MuJoCo WASM permite mostrar el comportamiento del robot y validar el controlador antes de montar hardware.
- Pruebas de robustez de controladores: la infraestructura de evaluación con masa, fricción y fuerza de servo aleatorizadas sirve para medir tasas de caída y validar cambios en el controlador.
- Animación y contenido: las secuencias guionizadas (baile, trucos) permiten generar material audiovisual para divulgación o demostraciones sin necesidad de entrenamiento adicional.
- Base para extensiones con percepción: la placa ESP32-S3 incluye micrófonos y altavoz, lo que deja abierta la integración futura de voz, aunque el autor indica que el streaming de micrófono y altavoz a un servidor aún no está construido.

## Benchmarks y rendimiento

Resultados de simulación reportados por el autor, con masa, fricción y fuerza de servo aleatorizadas en cada ensayo.

| Acción | Suelas 90 mm | Suelas 47 mm (por defecto) |
|---|---|---|
| Marcha | 9,0 cm/s, 0/72 caídas; servos por encima del 90 % de carga ~1 % del tiempo | 4,7 cm/s, 0/24 caídas; el cuerpo ayuda a soportar ~56 % |
| Giro derecha / izquierda | 25,7 / 25,3 °/s, 0/24 caídas por sentido | 2/48 caídas (24 robots × 2 sentidos, 8 s cada uno) |
| Tumbarse + levantarse | 24/24, pico de servo 35 % | 48/48 |
| Recuperación tras caída | 48/48 (24 boca abajo, 24 sobre la espalda) | 48/48 |
| Baile (14 s) | no reportado | 48/48 terminan de pie, inclinación máx. 20°, pico de servo 75 % |

Pruebas adicionales de escalado de zancada sin reentrenar (comandos de pata ×1,2 / ×1,4 / ×1,6): las patas oscilan 41 / 48 / 55° en lugar de 34°, pero la marcha se ralentiza (4,5 / 4,3 / 4,2 cm/s) y recae más en el cuerpo (63–69 %), con 1, 0 y 2 caídas en 24 ejecuciones. La variante con batería 3S (`rl/models/experimental_walk6_3s`) alcanzó 9,9 cm/s con 1 caída en 72 ejecuciones y fue rechazada. En 3S sin reentrenar, la marcha con suelas de 47 mm cayó 2/24 y el giro 4/48 (en 2S: 0/24 y 2/48).

## Requisitos de hardware

- Para entrenamiento e inferencia en simulación: un PC de escritorio convencional es suficiente; el cuello de botella es la simulación MuJoCo y el entrenamiento PPO, no un modelo grande. No se especifican requisitos mínimos de CPU/GPU en la información disponible.
- Para la demo en navegador: cualquier navegador moderno con soporte de WebAssembly; no requiere GPU dedicada.
- Para el robot físico: 4 servos Waveshare ST3215 de 12 V, placa ESP32-S3-LCD-1.54, adaptador Bus Servo (A), 2 celdas 18650 con BMS 2S, convertidor reductor a 5 V, interruptor y piezas impresas en PLA y TPU.
- Impresión 3D: los STL de `cad/out/stl` llevan suelas de 47 mm; para los resultados con 90 mm hay que modificar `foot_pad()` en `cad/tars_cad.py` antes de exportar.
- Opciones de despliegue: MuJoCo nativo para simulación, MuJoCo WASM para navegador, Stable-Baselines3 para cargar y ejecutar políticas, y el controlador `rl/tars_control.py` para el robot real.
- Latencia y throughput: la marcha y el giro se reproducen en tiempo real en los GIF; tumbarse y levantarse se muestran a 3× de velocidad. No se publican cifras de latencia de control ni de frecuencia de bucle.

## Comparativa con modelos similares

| Proyecto | Tipo | Actuadores | Simulación | RL | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| TARS mini (tuanhqv123) | Robot bípedo impreso en 3D, 216 mm | 4 servos ST3215 | MuJoCo + WASM | PPO (Stable-Baselines3) | MIT | Hugging Face (repo + Space) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de proyectos comparables con datos verificables de parámetros, contexto o rendimiento; por tanto, la comparativa cuantitativa queda como no disponible.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni un modelo multimodal: no procesa texto, imágenes ni audio; las expectativas deben ceñirse a control de locomoción.
- La velocidad de marcha está limitada a unos 10 cm/s con este cuerpo; el autor documenta que ninguna de las variantes probadas (balanceo triangular, periodo más corto, mayor oscilación, batería 3S, mayor recompensa de velocidad, elevación de 16 mm, triple fricción) superó ese umbral.
- Las políticas están entrenadas para batería 2S; usar 3S sin reentrenar degrada la robustez (2/24 caídas en marcha y 4/48 en giro con suelas de 47 mm).
- Los resultados con suelas de 90 mm requieren modificar el CAD; los STL publicados por defecto tienen suelas de 47 mm y no reproducen esos números.
- El adaptador Bus Servo (A) está especificado por el fabricante para 9–12,6 V, mientras que 2S entrega 6,0–8,4 V; el autor recomienda probar con un solo servo antes de montar el robot completo.
- El streaming de micrófono y altavoz a un servidor no está implementado.
- Los resultados son de simulación con aleatorización de dominio; no se reportan métricas de transferencia a hardware real más allá de las comprobaciones de alimentación y montaje.
- Licencia MIT: permite uso comercial y modificación, pero sin garantías; conviene revisar los términos de las dependencias (MuJoCo, Stable-Baselines3, CadQuery) por separado.
- No se documentan sesgos de datos ni riesgos de alucinación por no tratarse de un modelo generativo de texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tuanhqv123/tars-mini
- Demo en navegador (Space): https://huggingface.co/spaces/tuanhqv123/tars-mini
- Repositorio de código y CAD: incluido en el propio repo de Hugging Face (carpetas `cad/`, `sim/`, `rl/`, `space_web/`, `results/`)
- Documentación de MuJoCo: https://mujoco.org
- Stable-Baselines3: https://stable-baselines3.readthedocs.io
- CadQuery: https://cadquery.readthedocs.io
