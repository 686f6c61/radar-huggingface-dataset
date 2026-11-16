# zk0bot/so101-realistic

## Resumen

so101-realistic es un modelo de simulación física en formato MuJoCo (MJCF) del brazo robótico SO-101, desarrollado por el usuario zk0bot. No se trata de un modelo de lenguaje ni de una red neuronal: es un asset de simulación que describe la geometría, las articulaciones, los límites y las propiedades de contacto de un brazo robótico de 6 grados de libertad dentro del ecosistema LeRobot (TheRobotStudio). El repositorio tiene un tamaño de 0.0 GB, lo que confirma que contiene únicamente ficheros XML, mallas y material multimedia, no pesos de red neuronal.

El modelo parte del asset `robotstudio_so101` de MuJoCo Menagerie (Apache-2.0) y aplica dos correcciones de realismo sobre el MJCF original: elimina la prioridad de contacto del gripper que imponía fricción artificial a los objetos manipulados y corrige el límite de la articulación `elbow_flex` de 1.69 rad a 1.474 rad, valor medido en la PR #332 de Menagerie. La motivación declarada es que el modelo original está ajustado para que las demos de manipulación tengan éxito, lo que lo hace inadecuado como banco de pruebas para entrenamiento de propuestas y evaluación de validadores.

Es relevante para investigadores en robótica que necesiten un modelo de simulación más fiel al comportamiento del brazo físico real, especialmente en lo relativo a contactos y límites articulares. El autor lo clasifica explícitamente como "Stage-1 community-fit": los parámetros provienen de ajustes de la comunidad sobre bancos de terceros, no de una identificación de sistema (sysID) sobre un brazo físico concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo físico MJCF para MuJoCo (no es una red neuronal) |
| Parametros totales | no disponible (no aplica; asset de simulación) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | Apache-2.0 |
| Formato de pesos | MJCF (XML) + mallas; no hay safetensors ni GGUF |
| Version del asset | 0.1.1 |
| Tipo | Variante de brazo robótico (arm variant) |
| Masa declarada | 0.6454 kg (medida por lectura del modelo compilado, idéntica al upstream) |
| Motor de simulación | MuJoCo 4.0.1 |
| Upstream | MuJoCo Menagerie `robotstudio_so101` (Apache-2.0), HEAD principal 2026-11-16 |
| Estado de aceptación | PROBE-PASSED |
| Sello de verificación | NOT ISSUED |

## Arquitectura y entrenamiento

El asset describe un brazo robótico SO-101 en formato MJCF, el lenguaje de descripción de MuJoCo. La geometría es de origen CAD (`MEASURED`, derivada del upstream), mientras que los parámetros físicos son `ESTIMATED` mediante ajuste comunitario. El modelo incluye la escena completa del upstream y se carga con `model/so101_realistic.xml`. No hay proceso de entrenamiento en el sentido de machine learning: las "mejoras" son dos modificaciones manuales del MJCF documentadas línea a línea en `VERIFICATION.md`.

Los dos cambios respecto al upstream son: (1) la clase de contacto del gripper pasa de `priority 1` a `priority 0` y de `condim 6` a `condim 3`, de modo que la fricción del par de contacto la gobierna el material del objeto tocado y no el dedo del robot, como ocurre en el brazo físico; y (2) el límite de `elbow_flex` se reduce de 1.69 rad a 1.474 rad tanto en el rango articular como en `ctrlrange`, adoptando el valor medido en la PR #332 de Menagerie (la issue #325 documenta que el rango original introduce las cajas de colisión hasta 24.6 mm en el hombro, algo que el codo real tampoco alcanza). El resto del fichero es byte-idéntico al upstream en el commit fijado.

El autor reconoce una limitación estructural pendiente: la rigidez del bucle de servo del MJCF es la del stock y es aproximadamente 100× más rígida de lo que corresponde al firmware del STS3215. Está pendiente el wrapper de servo BAM (Rhoban/bam, Apache-2.0), que modela fricción dependiente de carga, limitación de tasa y caída por parada (stall sag), fenómenos que el MJCF no puede expresar. También están pendientes el ajuste sysID de Stage-1 contra grabaciones públicas y el ajuste de banco de Stage-3 contra el brazo del fundador.

## Capacidades

- Simulación física de un brazo robótico SO-101 de 6 grados de libertad en MuJoCo, con geometría derivada de CAD.
- Modelado de contactos del gripper gobernados por el material del objeto manipulado (fricción no impuesta por el dedo).
- Límite articular de codo corregido a 1.474 rad, alineado con la medición física de la comunidad.
- Generación de barridos de rango de movimiento (range-of-motion sweep) renderizados desde el modelo compilado, con apertura y cierre de gripper.
- Integración con el ecosistema LeRobot como modelo de simulación emparejado con la configuración estándar del SO-101 en el lado físico.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No incluye visión, audio ni modo de pensamiento (thinking mode).

## Casos de uso

- Entrenamiento de propuestas (proposer training) en pipelines de robótica: el modelo sirve como banco de pruebas donde el éxito de una política no está inflado por contactos de gripper artificialmente favorables, lo que permite descartar propuestas que fallarían en el brazo real.
- Evaluación de validadores: al eliminar la fricción impuesta por el dedo y corregir el límite del codo, las políticas evaluadas se enfrentan a condiciones más próximas a las del hardware, reduciendo falsos positivos en la validación.
- Simulación de manipulación con objetos de distintos materiales: al pasar la clase de contacto a `priority 0` y `condim 3`, la fricción del par de contacto depende del material del objeto, lo que permite estudiar cómo distintas superficies afectan al agarre.
- Verificación de rangos articulares en planificación de movimiento: el límite corregido de `elbow_flex` evita que los planificadores generen trayectorias que el codo físico no puede alcanzar y que en el modelo stock provocaban penetración de cajas de colisión en el hombro.
- Generación de material de validación visual: los ficheros de `media/` (hero, vistas lateral y superior, barrido MP4 de 11 s) se renderizan desde el modelo compilado y sirven para documentar el comportamiento esperado del brazo en dos puntos de vista.
- Docencia y divulgación de robótica con MuJoCo: al ser un asset ligero (0.0 GB) y cargarse con un único XML, es adecuado para prácticas donde se compara el comportamiento del modelo stock frente a la variante realista.
- Integración en flujos LeRobot de simulación a real: el modelo se empareja con la configuración estándar del SO-101 en el lado físico, lo que permite mantener coherencia entre el simulador y el robot de banco.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor únicamente declara el estado `PROBE-PASSED` y la masa medida de 0.6454 kg, sin tablas comparativas de rendimiento.

## Requisitos de hardware

- No requiere VRAM ni GPU: es un asset MJCF que se carga en MuJoCo, no un modelo neuronal.
- Requiere MuJoCo 4.0.1 (versión usada para renderizar el material multimedia) o compatible.
- El repositorio ocupa 0.0 GB, por lo que cabe en cualquier equipo con espacio de almacenamiento mínimo.
- El coste computacional lo determina la simulación (pasos de física y renderizado), no el tamaño del modelo; no se dispone de cifras de latencia o throughput.
- Opciones de despliegue: MuJoCo nativo cargando `model/so101_realistic.xml`; en el lado físico, la configuración estándar de LeRobot para el SO-101.
- No aplican vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.

## Comparativa con modelos similares

| Modelo | Tipo | Masa | Cambios de realismo | Licencia | Estado |
|---|---|---|---|---|---|
| so101-realistic (zk0bot) | Variante MJCF del SO-101 | 0.6454 kg | Contacto de gripper y límite de codo corregidos | Apache-2.0 | Stage-1 community-fit |
| robotstudio_so101 (MuJoCo Menagerie) | MJCF del SO-101 (upstream) | 0.6454 kg | Ninguno; ajustado para que las demos tengan éxito | Apache-2.0 | Upstream por defecto |
| Wrapper BAM (Rhoban/bam) | Ley de actuador de firmware | no disponible | Fricción dependiente de carga, limitación de tasa, stall sag | Apache-2.0 | Pendiente de integración en esta variante |

## Limitaciones y advertencias

- No es un modelo de lenguaje ni una red neuronal: no genera texto, código ni respuestas; cualquier uso en ese sentido es un error de categoría.
- Los parámetros son `ESTIMATED` mediante ajuste comunitario sobre bancos de terceros, no medidos sobre un brazo físico concreto; el autor lo califica explícitamente de "prior-grade", no "measured-grade".
- La rigidez del bucle de servo es la del stock y es aproximadamente 100× más rígida de lo que corresponde al firmware del STS3215, lo que puede producir comportamientos dinámicos irreales.
- Falta el wrapper de servo BAM, por lo que no se modelan fricción dependiente de carga, limitación de tasa ni stall sag.
- Falta el ajuste sysID de Stage-1 y el ajuste de banco de Stage-3; hasta que se completen, los resultados deben tratarse como preliminares.
- La varianza a nivel de ensamblaje (par de tornillos, rigidez del montaje, tolerancias de impresión) está marcada como `PROVISIONAL`.
- El sello de verificación no se ha emitido (`NOT ISSUED`), aunque el estado de sonda es `PROBE-PASSED`.
- Licencia Apache-2.0: permite uso comercial, pero exige preservar la atribución al upstream (Google DeepMind y TheRobotStudio) recogida en `LICENSE` y en la cabecera del fichero del modelo.
- No se dispone de información sobre sesgos, alucinación o limitaciones de idioma porque no aplican a este tipo de asset.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zk0bot/so101-realistic
- MuJoCo Menagerie (upstream `robotstudio_so101`): https://github.com/google-deepmind/mujoco_menagerie
- PR #332 de Menagerie (límite medido del codo): https://github.com/google-deepmind/mujoco_menagerie/pull/332
- Issue #325 de Menagerie (penetración de colisión en el hombro): https://github.com/google-deepmind/mujoco_menagerie/issues/325
- Wrapper BAM (Rhoban/bam): https://github.com/Rhoban/bam
- Ecosistema LeRobot (TheRobotStudio): https://github.com/huggingface/lerobot
- MuJoCo: https://mujoco.org
- Licencia Apache-2.0: https://opensource.org/licenses/Apache-2.0
