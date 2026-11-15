# twanghcmut/g1-throw-vla

## Resumen

G1 throw VLA es una colección de checkpoints de modelos visión-lenguaje-acción (VLA) especializados en una tarea robótica concreta: un robot humanoide Unitree G1 debe coger un objeto de un pedestal y lanzarlo dentro de una caja. El autor, twanghcmut, publica dos familias de políticas entrenadas sobre el dataset `twanghcmut/g1-throw-newton`: DynamicVLA (basada en SmolLM2-360M) y ForceVLA (basada en pi0_base con LoRA), con un checkpoint por grupo de objeto (rígido, irregular y dinámico).

La relevancia del modelo es acotada y muy específica: no es un VLA de propósito general, sino un artefacto de investigación reproducible para el benchmark de lanzamiento en Isaac Lab. Su interés radica en que expone resultados cuantitativos de éxito cerrado (closed loop) con intervalos de confianza, compara contra un modelo de referencia (GR00T N1.7) y publica el código de entrenamiento y evaluación en un repositorio externo.

El tamaño del repositorio es de 22,5 GB, coherente con múltiples checkpoints en safetensors y pesos de openpi sin estado del optimizador. La información disponible sobre arquitectura interna, idiomas o datos de preentrenamiento es limitada; la ficha refleja únicamente lo que la model card y los metadatos permiten verificar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action); DynamicVLA sobre SmolLM2-360M; ForceVLA sobre pi0_base con LoRA |
| Parametros totales | no disponible (DynamicVLA parte de SmolLM2-360M; ForceVLA parte de pi0_base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; checkpoints openpi sin estado del optimizador) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors (DynamicVLA, formato LeRobot policy); params/ y assets/ (ForceVLA, formato openpi) |

## Arquitectura y entrenamiento

DynamicVLA se inicializa desde SmolLM2-360M sin preentrenamiento DOM y consume dos cámaras (lateral y de cabeza) con fotogramas en t-2 y t, más 14 articulaciones del robot. Se entrenó con batch 44 durante 6 épocas. ForceVLA se inicializa desde pi0_base con adaptadores LoRA y añade una entrada de fuerza/par de muñeca de 6 dimensiones (6-D wrist wrench) además de las cámaras de cabeza y lateral y las 14 articulaciones; se entrenó con batch 32 y 20k pasos para el grupo rígido, 20k para irregular y 15k para dinámico.

Ambos modelos predicen 40 objetivos de articulación que cubren 1,3 s de trayectoria y ejecutan 16 de ellos antes de replanificar, un esquema de control por chunks con re-planificación periódica. El entrenamiento y la evaluación se apoyan en Isaac Lab y en el dataset `twanghcmut/g1-throw-newton`; el código está en la rama `benchmark/throw-vla` del repositorio extrinsic-dexterity, con instrucciones en `benchmark/throw/README.md`. No se detalla en la información disponible la composición exacta del dataset, el número de tokens ni si hubo RLHF o DPO.

## Capacidades

- Control visomotor para una tarea de manipulación y lanzamiento con el humanoide Unitree G1: agarre de objeto en pedestal y lanzamiento a una caja.
- Fusión de dos cámaras (lateral y cabeza) con memoria temporal de dos fotogramas (t-2, t).
- Entrada propioceptiva de 14 articulaciones del robot.
- ForceVLA incorpora además una señal de fuerza/par de muñeca de 6 dimensiones, lo que permite condicionar la política en el contacto físico.
- Predicción de trayectorias de 40 objetivos articulares (1,3 s) con ejecución de 16 pasos antes de replanificar.
- Generalización limitada a variantes de objeto dentro de cada grupo (rígido, irregular, dinámico), evaluada en split de test con objetos no vistos.
- No se documentan capacidades de tool calling, agentes, multilingüismo, visión general, audio ni modo thinking.

## Casos de uso

- Investigación en manipulación dinámica: reproducir el benchmark de lanzamiento en Isaac Lab usando los checkpoints y el script `eval.sh` para comparar políticas bajo las mismas condiciones.
- Estudio de fusión multimodal propiocepción-visión-fuerza: comparar DynamicVLA (solo visión y articulaciones) con ForceVLA (visión, articulaciones y wrench) para aislar la contribución de la señal de fuerza en tareas de contacto.
- Base para fine-tuning en tareas de lanzamiento con otros objetos: los checkpoints por grupo (`rigid`, `irregular`, `dynamic`) sirven como inicialización para nuevos datasets con geometrías similares.
- Evaluación de esquemas de control por chunks: el par (40 predichos, 16 ejecutados) permite estudiar el compromiso entre latencia de replanificación y estabilidad de la política.
- Referencia para comparativas con modelos fundacionales de robótica: los resultados publicados frente a GR00T N1.7 permiten situar el rendimiento de políticas pequeñas frente a modelos de mayor escala en una tarea acotada.
- Docencia y divulgación en robótica: el pipeline completo (dataset, entrenamiento, evaluación cerrada) es un ejemplo reproducible de extremo a extremo para cursos de aprendizaje por imitación y VLA.
- Análisis de fallos post-soltado: dado que la mayoría de fallos se producen tras el lanzamiento, el modelo es útil para estudiar la fase balística y el ajuste de la política de liberación.

## Benchmarks y rendimiento

Resultados en bucle cerrado en Isaac Lab, split de test con variantes de objeto no vistas, salas y cocina no vista combinadas (10-8). Éxito definido como que el objeto queda en reposo dentro de la caja. Entre corchetes, intervalo de Wilson al 95%.

| Modelo | Rígido (320) | Irregular (288) | Dinámico (288) |
|---|---|---|---|
| DynamicVLA | 0,6 [0,2; 2,2] | 0,7 [0,2; 2,5] | 0,3 [0,1; 1,9] |
| ForceVLA | 8,4 [5,9; 12,0] | 5,9 [3,7; 9,2] | 3,8 [2,1; 6,7] |
| GR00T N1.7 (no publicado en este repo) | 5,3 [3,3; 8,3] | 4,2 [2,4; 7,1] | 1,7 [0,7; 4,0] |

El experto programado (scripted expert) acierta aproximadamente el 52% de los lanzamientos. Todos los modelos levantan el objeto en entre el 49% y el 76% de los episodios; la mayoría de los fallos son errores de puntería después de la suelta.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. El repositorio ocupa 22,5 GB, pero incluye múltiples checkpoints y no permite derivar la huella de un único modelo en memoria.
- GPU recomendadas: no disponible. Por el tamaño de partida de los modelos base (SmolLM2-360M y pi0_base) es plausible que quepan en GPU de consumo, pero no se confirma en la documentación.
- Compatibilidad con GPU de consumo: no confirmada; no disponible.
- Opciones de despliegue: el flujo documentado es la evaluación en Isaac Lab mediante `benchmark/throw/eval/eval.sh`, con descarga vía `hf download`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que además no aplican a una política VLA de robótica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Éxito rígido | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ForceVLA (este repo) | no disponible (pi0_base + LoRA) | no disponible | 8,4% | other | público en HF |
| DynamicVLA (este repo) | parte de SmolLM2-360M | no disponible | 0,6% | other | público en HF |
| GR00T N1.7 | no disponible | no disponible | 5,3% | no disponible | no publicado en este repo |
| Experto programado | no aplica (scripted) | no aplica | ~52% | no disponible | referencia del benchmark |

La comparación se limita a la tarea de lanzamiento del benchmark; no se dispone de datos de otros modelos VLA comparables en esta misma evaluación.

## Limitaciones y advertencias

- Rendimiento absoluto bajo: el mejor modelo (ForceVLA) logra un 8,4% de éxito en objetos rígidos, lejos del 52% del experto programado; no es apto para producción sin un salto cualitativo en la política.
- La mayoría de los fallos ocurren tras la suelta, lo que indica que la fase de puntería y liberación es el cuello de botella del aprendizaje.
- Generalización acotada a variantes de objeto dentro de cada grupo; no se documenta comportamiento fuera del entorno Isaac Lab ni en el robot físico.
- La evaluación es en simulación (Isaac Lab); no hay evidencia de transferencia sim-to-real en la información disponible.
- Licencia "other": no se especifican términos de uso comercial; es necesario consultar el repositorio y la licencia de los modelos base (SmolLM2-360M y pi0_base) antes de cualquier uso.
- Riesgo de alucinación no aplicable en el sentido habitual de texto, pero sí de trayectorias erróneas o inseguras en entornos físicos.
- No se documentan sesgos demográficos ni lingüísticos porque el modelo no procesa lenguaje natural de usuario en esta configuración.
- El repositorio incluye checkpoints de terceros (LeRobot, openpi) cuya licencia puede diferir de la del autor; verificar antes de redistribuir.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/twanghcmut/g1-throw-vla
- Dataset de entrenamiento: https://huggingface.co/datasets/twanghcmut/g1-throw-newton
- Repositorio de código (rama `benchmark/throw-vla`): https://github.com/voanhhao3830/extrinsic-dexterity
- Modelo base DynamicVLA (referencia del autor): hzxie/DynamicVLA
- Modelo base ForceVLA (referencia del autor): ft-robotic/ForceVLA
