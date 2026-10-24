# Sungah/omx_1024_jihyeok_act

## Resumen

`Sungah/omx_1024_jihyeok_act` es un paquete de inferencia para robótica que contiene cinco checkpoints de una política ACT (Action Chunking with Transformers) entrenada con la librería LeRobot 0.6.1, junto con los scripts necesarios para ejecutarla directamente sobre un robot OMX desde un PC de campo, con o sin Docker. El modelo resuelve una tarea de manipulación muy concreta: señalar una caja y depositarla dentro de una cesta blanca («상자를 짚어서 흰 바구니 안에 넣는다»), aprendida por imitación a partir de un dataset propio de demostraciones teleoperadas.

Técnicamente no es un modelo de lenguaje ni un modelo generativo de propósito general: es una política visuomotora que consume dos cámaras (vista superior y muñeca, 640×480) más el estado de 6 articulaciones a 30 fps, y emite secuencias de acciones (chunks) para el robot. No se especifican el número de parámetros ni el volumen total de tokens de entrenamiento; lo que sí se documenta es el régimen de entrenamiento: 674 pasos por epoch con batch 16, checkpoints a 5, 10, 15 y 20 epochs (hasta 13.484 pasos) y un ajuste fino adicional sobre 15 demostraciones.

Su interés ahora es doble: por un lado, ejemplifica el flujo completo de LeRobot desde la captura de demostraciones hasta el despliegue en hardware real; por otro, documenta de forma honesta sus propias carencias (no se evaluó con demostraciones no vistas y no se ha medido la tasa de éxito en el robot físico), algo poco habitual en repositorios de robótica. Es material útil para quien quiera reproducir un pipeline de imitation learning de bajo coste, no para quien busque un modelo listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers); encoder visual ResNet18 preentrenado en ImageNet y transformer de predicción de chunks de acciones |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; no es un modelo de lenguaje. Entrada por inferencia: 1 frame de 2 cámaras (640×480) + estado de 6 articulaciones; salida: chunk de acciones (50 pasos por defecto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de robótica, sin entrada ni salida de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoints de LeRobot, 5 carpetas en `models/`) |
| Version de libreria | LeRobot 0.6.1 (se menciona compatibilidad con 0.4–0.5 mediante `fix_model_config.py`) |
| Hardware robotico | Robot OMX, 6 articulaciones + gripper, control a 30 fps |
| Entradas | Cámara `top` (frontal/superior) y `wrist` (muñeca), 640×480, más estado articular |
| Dataset de entrenamiento | `Sungah/omx_1024_test_jihyeok_success` (10 demostraciones iniciales; 15 en el ajuste fino) |
| Tamano del repositorio | 1,1 GB (incluye 5 checkpoints, pesos de ResNet18 y scripts) |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

ACT es una política de imitación basada en transformer que predice un chunk de acciones futuras en lugar de una sola acción por paso, lo que reduce el error de acumulación y suaviza la ejecución. En este caso, el encoder visual es un ResNet18 preentrenado en ImageNet y el resto del modelo se entrena desde cero (`처음부터 학습`), es decir, sin inicialización desde otro checkpoint ACT. El entrenamiento se hizo con LeRobot 0.6.1, batch de 16 y 674 pasos por epoch; los checkpoints publicados corresponden a 5, 10, 15 y 20 epochs (3.371, 6.742, 10.113 y 13.484 pasos respectivamente), más una variante `act_ep20_ft15` que parte de `act_ep20` y se reentrena 5 epochs adicionales sobre las 15 demostraciones completas, con 893 pasos por epoch y tasa de aprendizaje 1e-5 (total 4.466 pasos extra).

El dato más relevante para interpretar los resultados es la escasez de datos: 10 demostraciones para el entrenamiento base y 15 para el ajuste fino, todas ellas usadas también en la evaluación (no hay split de validación con demostraciones nuevas). El autor advierte explícitamente del riesgo de sobreajuste creciente con el número de epochs y recomienda comparar checkpoints sobre el robot real. No se documenta uso de RLHF, DPO ni ninguna técnica de alineación, algo esperable en una política de imitación. Como innovación práctica, el paquete incluye *temporal ensembling* opcional (`act_ensemble.py`): se predice cada k pasos y se promedian las predicciones solapadas, con el compromiso declarado de mayor suavidad a costa de menor reactividad (requiere GPU para ser viable).

## Capacidades

- Manipulación visomotora de tipo pick-and-place: señalar una caja y colocarla dentro de una cesta blanca, la única tarea entrenada.
- Fusión de dos vistas de cámara (superior y muñeca) con estado articular de 6 grados de libertad para producir acciones continuas.
- Predicción de chunks de acciones (50 pasos por defecto, configurable con `N_ACTION_STEPS`), con opción de reducir a ~10 pasos en GPU para mayor reactividad.
- Ejecución con *temporal ensembling* configurable mediante `ENSEMBLE_K` y `ENSEMBLE_M` (por defecto desactivado).
- Despliegue autónomo en el PC de campo: scripts `run.sh` (Docker) y `run_native.sh` (LeRobot instalado), con subcomandos `check`, `find-port`, `find-cameras`, `calibrate` y `rollout`.
- Inferencia sin conexión a internet: los pesos de ResNet18 se incluyen en `weights/` y la imagen Docker fija LeRobot 0.6.1 con torch para CPU.
- Limitador de seguridad `MAX_RELATIVE_TARGET` (por defecto 10) que acota el desplazamiento máximo por paso.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, ni entrada/salida de texto, visión general o audio.

## Casos de uso

- Replicación de un pipeline completo de imitation learning: sirve como referencia de principio a fin (captura de demostraciones con LeRobot, entrenamiento ACT con batch 16, empaquetado de checkpoints y despliegue en robot), útil para laboratorios que montan su primer flujo de aprendizaje por imitación.
- Automatización de una celda de pick-and-place caja→cesta: el modelo ejecuta la tarea con dos cámaras y 6 articulaciones a 30 fps, adecuado para prototipos de logística interna donde la posición de la caja y la cesta es fija.
- Estudio de eficiencia de datos en políticas visuomotoras: el repositorio ofrece una curva lista para analizar (5, 10, 15 y 20 epochs sobre 10 demostraciones) y permite medir empíricamente dónde aparece el sobreajuste con datasets pequeños.
- Metodología de selección de checkpoints: el propio autor propone ejecutar 10 rollouts por checkpoint en la misma disposición física y registrar la tasa de éxito; el paquete facilita ese protocolo cambiando solo la variable `MODEL` en `config.env`.
- Despliegue en hardware de bajo coste sin GPU: con `DEVICE=cpu` y `N_ACTION_STEPS=50`, un PC de 8 núcleos mantiene entre 0,6 y 1,0 s por predicción, suficiente para tareas de manipulación lentas en entornos educativos o de demostración.
- Investigación sobre suavizado de trayectorias: permite comparar la política base frente a la variante con *temporal ensembling* (`ENSEMBLE_K`/`ENSEMBLE_M`) y cuantificar la pérdida de reactividad frente a la ganancia en estabilidad.
- Ajuste fino sobre una tarea nueva: la receta de `act_ep20_ft15` (partir de un checkpoint entrenado y reentrenar 5 epochs con lr 1e-5 sobre el conjunto ampliado) sirve como plantilla para añadir demostraciones correctivas a un modelo ya entrenado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se evaluó con demostraciones no vistas (`처음 보는 시연으로 평가하지 않았습니다`) y que la tasa de éxito en el robot físico aún no se ha medido (`실물 로봇 성공률도 아직 측정 전입니다`).

Los únicos datos de rendimiento publicados son de latencia de inferencia:

| Escenario | Valor documentado |
|---|---|
| Inferencia en CPU de 8 núcleos | 0,6–1,0 s por predicción |
| `N_ACTION_STEPS` recomendado en CPU | 50 |
| `N_ACTION_STEPS` recomendado en GPU | ~10 |
| Bucles de entrenamiento | 674 pasos/epoch (10 demos); 893 pasos/epoch (15 demos) |
| Checkpoints publicados | 5 (3.371 a 13.484 pasos, más 4.466 pasos de ajuste fino) |

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada. El repositorio completo ocupa 1,1 GB e incluye cinco checkpoints más los pesos de ResNet18, por lo que cada checkpoint individual es una fracción de ese tamaño y cabe holgadamente en cualquier GPU consumer con varios GB libres.
- GPU: no se especifican modelos concretos. Con `DEVICE=cuda` se habilita reducir `N_ACTION_STEPS` a ~10 y activar el *temporal ensembling*, que el autor marca como recomendado para GPU.
- CPU: escenario por defecto (`DEVICE=cpu`). Con 8 núcleos se obtienen 0,6–1,0 s por predicción, lo que impone `N_ACTION_STEPS=50` para mantener un control aceptable.
- Cabe en GPU consumer: sí, por el tamaño del repositorio; no se documenta una VRAM mínima verificada.
- Opciones de despliegue: scripts propios sobre LeRobot (`run_native.sh`) o imagen Docker incluida (`run.sh build`, con torch para CPU). No se menciona soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a una política robótica.
- Throughput: no disponible; el único dato es la latencia por predicción en CPU.
- Requisitos adicionales: puerto serie del robot (`/dev/ttyACM0` por defecto, detectable con `find-port`), dos cámaras UVC (`/dev/video0` y `/dev/video2` por defecto) y calibración previa del robot.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Sungah/omx_1024_jihyeok_act` | ACT especializado en una tarea OMX | no disponible | 2 cámaras 640×480 + 6 articulaciones, chunk de 50 acciones | Apache 2.0 | Hugging Face, repo de 1,1 GB con scripts |
| ACT de referencia (LeRobot) | ACT genérico | no disponible | Configurable por dataset | Apache 2.0 (LeRobot) | Documentación y checkpoints en Hugging Face |
| Diffusion Policy (LeRobot) | Política de difusión para imitación | no disponible | Configurable por dataset | Apache 2.0 (LeRobot) | Disponible en LeRobot |
| Políticas VLA tipo SmolVLA / π0 | Visión-lenguaje-acción | no disponible | Instrucciones en lenguaje + observaciones visuales | según modelo | Disponibles en Hugging Face |

Comparación cualitativa: frente a ACT genérico, este paquete no aporta un modelo más capaz, sino un caso concreto con datos, scripts y configuración cerrada para un robot OMX; su ventaja es la reproducibilidad del despliegue y su desventaja es el sobreajuste a una única tarea y disposición física. Frente a Diffusion Policy, ACT se caracteriza por un entrenamiento más rápido y menores requisitos de cómputo, a costa de menor capacidad para distribuciones de acciones multimodales. Frente a las políticas VLA, carece por completo de interfaz en lenguaje natural y de generalización a instrucciones nuevas: no acepta órdenes textuales, solo reproduce la tarea aprendida. No hay datos numéricos comparativos publicados en la información disponible.

## Limitaciones y advertencias

- Modelo de una sola tarea: solo reproduce «caja → cesta blanca» en la disposición, iluminación y ángulos de cámara del dataset. Cualquier cambio de posición de objetos, encuadre o iluminación degrada el comportamiento esperado.
- Sin evaluación held-out: las 10 (o 15) demostraciones se usaron íntegramente para entrenamiento; no hay validación con demostraciones no vistas.
- Tasa de éxito en robot real no medida: el autor lo declara explícitamente. Cualquier cifra de rendimiento aportada por terceros debe tratarse como no verificada.
- Riesgo de sobreajuste documentado: con solo 10 demostraciones, más epochs no implica mejor política; el autor recomienda comparar checkpoints en hardware.
- Sin datos sobre sesgos: no aplica el concepto habitual de sesgo lingüístico, pero sí existe un sesgo físico hacia la configuración espacial concreta del dataset.
- Riesgo de alucinación en el sentido de acciones plausibles pero incorrectas: una política de imitación puede generar trayectorias fuera de distribución sin señal de incertidumbre; de ahí el limitador `MAX_RELATIVE_TARGET=10` y la recomendación de tener el robot junto a una persona lista para cortar la alimentación.
- Dependencia fuerte de la calibración: los comandos `calibrate`, `find-port` y `find-cameras` son pasos obligatorios; una calibración incorrecta o un mapeo de cámaras invertido (`top`/`wrist`) invalida la inferencia.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificaciones, pero el modelo se distribuye sin garantías y el autor no ofrece ninguna validación de seguridad para entornos industriales reales.
- Latencia alta en CPU (0,6–1,0 s por predicción) que limita la tarea a manipulaciones lentas; con `N_ACTION_STEPS=50` la reacción efectiva es aún más lenta.
- Compatibilidad de versiones frágil: requiere LeRobot 0.6.x; para 0.4–0.5 hay un script de parcheo (`fix_model_config.py`) que no garantiza equivalencia de comportamiento.
- Dependencia de hardware específico (robot OMX, dos cámaras UVC): no es portable a otros brazos sin reentrenar o al menos recalibrar y remapear observaciones.
- Idiomas: no soporta entrada ni salida de texto, por lo que no hay soporte multilingüe que evaluar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sungah/omx_1024_jihyeok_act
- Dataset de entrenamiento: https://huggingface.co/datasets/Sungah/omx_1024_test_jihyeok_success
- Documentación de ACT en LeRobot: https://huggingface.co/docs/lerobot/act
- Repositorio de LeRobot (Hugging Face): https://github.com/huggingface/lerobot
- Catálogo de modelos de Hugging Face: https://huggingface.co/models
