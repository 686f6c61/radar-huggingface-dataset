# thanujmaligi/ecm2027-team200-act-policy

## Resumen

La política ECM-200 es un modelo de imitación para robótica desarrollado por el equipo ECM-200 (autor de Hugging Face: `thanujmaligi`) como envío oficial a la pista de simulación del Singapore Embodied AI Challenge for Manufacturing (ECM 2027). Implementa una arquitectura ACT (Action Chunking Transformer) que, a partir de tres vistas RGB (cabeza y ambas muñecas) y un vector de estado del robot de 77 dimensiones, predice trozos de acción de 20 dimensiones y 50 pasos para el manipulador móvil bimanual Galbot One Golf en NVIDIA Isaac Sim 6.0.1 / Isaac Lab.

El modelo resuelve una tarea concreta de servicio y mantenimiento de cámara (`ChamberServiceTask`): manipulación de tapas de cámara de sala limpia y extracción y colocación de componentes con ambos brazos, coordinando además la base móvil. No es un modelo de lenguaje ni un modelo fundacional generalista: es una política de control entrenada por imitación sobre el dataset `rocochallenge2025/ecm2027_sim_data`, con pesos de 103,2 MB y un peso en repositorio de 0,2 GB.

Su relevancia es acotada pero clara para quien trabaja en IA encarnada: sirve como línea base reproducible de un reto de manipulación bimanual con requisitos estrictos de latencia (16,81 ms de media en una Tesla T4, por debajo del límite de 50 ms de la competición) y de encuadre físico (restricciones de quaternion unitario y de envolvente cinemática). La licencia MIT y la inclusión del código de política y de preprocesado facilitan su reutilización como punto de partida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer): 3 codificadores ResNet-18 (vistas cabeza y muñecas), proyección lineal del estado del robot, encoder transformer de 4 capas y 8 cabezas, decoder transformer de 4 capas y 8 cabezas |
| Parametros totales | no disponible (pesos de 103,2 MB en `checkpoint.pt`) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de observación con ensamblado temporal de k=50 y pesos exponenciales w_i = exp(-0,01 i); salida de 50 pasos de acción |
| Tipos de cuantizacion | no disponible (checkpoint en punto flotante, formato `.pt`) |
| Idiomas soportados | en (inglés; el modelo no procesa lenguaje, la etiqueta refleja el idioma de la documentación) |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pt` (`checkpoint.pt`), más archivo ZIP de envío (`ECM-200_policy_submission.zip`) y configuración YAML (`chamber_policy.yml`) |

## Arquitectura y entrenamiento

La política sigue el esquema ACT: tres imágenes RGB (cabeza a 480×640×3, muñeca izquierda y muñeca derecha a 224×224×3) pasan por codificadores ResNet-18 que producen vectores de 512 dimensiones cada uno; el estado del robot, de 77 dimensiones, se proyecta linealmente a 512; las cuatro representaciones se concatenan y entran en un transformer encoder de 4 capas y 8 cabezas, cuyo resultado alimenta un transformer decoder de 4 capas y 8 cabezas que emite un trozo de 20 dimensiones × 50 pasos. El espacio de acción de 20 dimensiones cubre posiciones XYZ de ambos brazos, estados de pinza, velocidades de las ruedas y rotaciones en cuaternión WXYZ.

El entrenamiento es por imitación supervisada sobre el dataset de simulación `rocochallenge2025/ecm2027_sim_data`, con métrica de validación L1. La model card indica que se entrenó estrictamente sin realimentación del búfer de acciones previas, lo que evita la deriva autorregresiva y el colapso por copia (copycat). En inferencia se aplica ensamblado temporal con k=50 y pesos exponenciales, además de recorte de envolvente y canonicalización de cuaterniones en el preprocesado. No se especifican en la información disponible el número de tokens, la composición del dataset, ni si hubo RLHF o DPO; para una política de imitación esto último no resulta aplicable en los términos habituales.

## Capacidades

- Predicción de acciones motoras de 20 dimensiones para un robot bimanual móvil: posiciones XYZ de ambos brazos, apertura/cierre de pinzas, velocidades de ruedas y orientación en cuaternión.
- Percepción visual multivista: procesa simultáneamente vista en primera persona de la celda de trabajo y vistas de muñeca izquierda y derecha.
- Action chunking: genera bloques de 50 pasos de acción por inferencia, lo que reduce la frecuencia de cómputo y suaviza la ejecución.
- Ensamblado temporal en inferencia (k=50, pesos exponenciales) para estabilizar la trayectoria.
- Coordinación base-manipulador: integra velocidades de ruedas con el control de brazos en un único vector de acción.
- Cumplimiento de restricciones físicas: cuaterniones de norma unitaria garantizada y cero violaciones de la envolvente cinemática en la validación reportada.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico ni procesamiento de lenguaje natural; no tiene modo de pensamiento, visión general, audio ni capacidades multilingües.

## Casos de uso

- Línea base para la pista de simulación de ECM 2027: sirve como referencia reproducible para equipos que compitan en la tarea `ChamberServiceTask` con el Galbot One Golf, ya que incluye la interfaz `BasePolicy` oficial y la configuración de evaluación.
- Manipulación bimanual en sala limpia simulada: apertura y manejo de tapas de cámara con el brazo izquierdo y extracción de componentes con el derecho, con errores medidos de 1,85 cm y 3,20 cm en XYZ respectivamente.
- Investigación en action chunking: permite experimentar con tamaños de chunk, ensamblado temporal y esquemas de normalización sobre una política ACT ya validada, partiendo del código en `policy/act_policy.py` y `policy/preprocessing.py`.
- Prototipado de control coordinado base-brazo: útil para estudiar cómo integrar velocidades de ruedas y consignas de brazo en un mismo vector de acción sin desestabilizar la manipulación.
- Evaluación de latencia en hardware modesto: con 16,81 ms de media y 714 MB de VRAM en una Tesla T4, sirve para probar pipelines de inferencia en tiempo real en GPUs de gama baja o media.
- Docencia y divulgación en IA encarnada: el paquete incluye animación de rollout, montaje de percepción multicámara y gráficas de seguimiento de trayectoria, lo que facilita explicar imitación, chunking y ensamblado temporal con material visual.
- Punto de partida para adaptación a otras tareas de mantenimiento: al ser MIT y estar desacoplada del entorno mediante configuración YAML, puede reentrenarse sobre datos propios de otra celda de trabajo.

## Benchmarks y rendimiento

Evaluación sobre 14.960 pasos de entorno continuos en episodios de validación reservados, con ensamblado temporal (k=50, w_i = exp(-0,01 i)):

| Métrica | Error medido | Coincidencia con verdad de referencia |
|---|---|---|
| Acción física global L1 | 0,1400 | — |
| Posición XYZ brazo izquierdo | 0,0185 m (1,85 cm) | ≥ 98,5 % |
| Posición XYZ brazo derecho | 0,0320 m (3,20 cm) | ≥ 97,2 % |
| Coincidencia binaria de pinza | 0,0231 | > 97,7 % |
| Velocidad de articulación de ruedas | 0,0740 rad/s | ≥ 96,0 % |
| Restricción de cuaternión unitario | deriva cero | 100,0 % |
| Límites de envolvente | 0 violaciones | 100,0 % |

Perfil de inferencia: 16,81 ms de latencia media en NVIDIA Tesla T4 y 714 MB de VRAM en pico. No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 714 MB en pico, según el perfilado del autor en Tesla T4.
- GPU recomendadas: NVIDIA Tesla T4 es la plataforma perfilada; cualquier GPU con al menos ~1 GB de VRAM libre debería ser suficiente, aunque no se han publicado mediciones en otras tarjetas.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier RTX con 4 GB o más, dado el consumo de 714 MB; no hay cifras verificadas para esos modelos.
- Opciones de despliegue: inferencia PyTorch directa con el checkpoint `.pt` y el código de `policy/act_policy.py`; el ZIP de envío es un paquete autónomo para el evaluador de la competición. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: 16,81 ms de media por inferencia en T4, por debajo del límite de 50 ms de la competición; no se publica throughput agregado ni latencias en otras GPU.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ECM-200 ACT (este modelo) | ACT con 3 vistas RGB, chunking de 50 pasos | no disponible (103,2 MB) | 50 pasos de acción, ensamblado k=50 | MIT | Hugging Face, pesos y código |
| Políticas ACT genéricas (p. ej. implementaciones de referencia ACT) | ACT con 1 vista o multivista | no disponible | típicamente chunks de 100 pasos | MIT / Apache-2.0 según implementación | Repositorios públicos |
| Políticas tipo Diffusion Policy | difusión sobre acciones | no disponible | horizontes variables | MIT / Apache-2.0 según implementación | Repositorios públicos |
| Políticas tipo VLA (p. ej. familias OpenVLA/RT-2) | modelo visión-lenguaje-acción | miles de millones | instrucciones en lenguaje | variable | Hugging Face |

No se dispone de cifras de rendimiento comparables entre estas alternativas en la información proporcionada; la comparación se limita a tipo de arquitectura, licencia y disponibilidad.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una única tarea (`ChamberServiceTask`) y un único robot (Galbot One Golf) en Isaac Sim 6.0.1 / Isaac Lab; no generaliza a otras tareas, morfologías ni entornos reales sin reentrenamiento.
- Dependencia del simulador: las métricas reportadas provienen de validación en simulación; no hay evidencia de transferencia a hardware físico (sim-to-real) en la información disponible.
- Sin capacidades de lenguaje: no procesa instrucciones en lenguaje natural, no soporta tool calling ni razonamiento simbólico; la etiqueta de idioma `en` se refiere a la documentación.
- Riesgo de alucinación en el sentido habitual no aplica, pero sí existe riesgo de deriva en la ejecución si se altera el ensamblado temporal o el preprocesado de cuaterniones; el autor mitiga el modo copycat entrenando sin realimentación del búfer de acciones.
- Sesgos de los datos de imitación: al entrenarse sobre teleoperación humana simulada, hereda los sesgos de las trayectorias demostradas y puede degradarse ante distribuciones de estado no vistas.
- Restricciones de licencia: MIT permite uso comercial y modificación, pero no se especifican garantías ni condiciones adicionales sobre los datos de entrenamiento (`rocochallenge2025/ecm2027_sim_data`), cuya licencia conviene verificar por separado.
- Métricas autodeclaradas: los resultados de la tabla de validación los publica el propio equipo, sin verificación independiente en la información disponible.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso o validación por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thanujmaligi/ecm2027-team200-act-policy
- Checkpoint de pesos: https://huggingface.co/thanujmaligi/ecm2027-team200-act-policy/resolve/main/checkpoint.pt
- ZIP de envío a la competición: https://huggingface.co/thanujmaligi/ecm2027-team200-act-policy/resolve/main/ECM-200_policy_submission.zip
- Configuración de política: https://huggingface.co/thanujmaligi/ecm2027-team200-act-policy/blob/main/chamber_policy.yml
- Dataset de simulación: https://huggingface.co/datasets/rocochallenge2025/ecm2027_sim_data
- Página de la competición (ECM 2027): https://form.gov.sg/6ae35050aafe2da79edea132
- Licencia MIT: https://opensource.org/licenses/MIT
