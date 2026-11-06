# SSH111111/microduck-tug

## Resumen

`SSH111111/microduck-tug` es una política de control por refuerzo entrenada para la competición de tira y afloja (tug of war) del robot cuadrúpedo de bajo coste MicroDuck, desarrollado por Pollen Robotics. No se trata de un modelo de lenguaje ni de un modelo fundacional generativo: es un actor MLP exportado a ONNX que mapea observaciones de 61 dimensiones a 14 acciones de control conjunto, ejecutándose a 50 Hz de forma perpetua hasta recibir una orden de parada.

El modelo se publica como entrada para la "Arena" de microduck, un entorno de retos donde distintas políticas compiten entre sí en tareas físicas simuladas con MuJoCo (a través del framework `mjlab`). Su relevancia es acotada al ecosistema microduck: sirve como referencia de política entrenada por RL para una tarea concreta de tracción, y como ejemplo reproducible de un pipeline de entrenamiento por etapas con *warm start* y *sparring* contra políticas rivales.

El repositorio es de tamaño prácticamente nulo (0.0 GB reportados) y cuenta con cero descargas y cero likes en el momento de la consulta. La información disponible proviene exclusivamente de la model card del autor y de resultados de búsqueda que mencionan entradas homónimas de otros usuarios en la misma arena.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP (actor de política RL): 61 -> 512 -> 256 -> 128 -> 14, activación ELU, normalizador de observaciones integrado |
| Parametros totales | no disponible (no se especifica el recuento; la topología implica del orden de decenas de miles de pesos) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de secuencia); ventana de observación de 61 dimensiones por paso |
| Tipos de cuantizacion | no disponible (exportado a ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) y `manifest.json` con esquema 2 del manifiesto de políticas microduck |

## Arquitectura y entrenamiento

La política es una red MLP pura exportada a ONNX, sin tablas de búsqueda de observaciones, sin repeticiones de acciones específicas de semilla ni reglas escritas a mano. La entrada son 61 valores de observación en crudo (el normalizador está embebido en el propio grafo ONNX) y la salida son 14 acciones. Se ejecuta a 50 Hz de forma continua ("perpetual"), es decir, mantiene la marcha indefinidamente hasta que el daemon la descarga.

El entrenamiento se realizó con `mjlab` (versión base `mjlab-microduck 0.1.0 @ 1efd853be`) sobre la tarea `Mjlab-TugOfWar-MicroDuck`, en la rama `tug-league` del repositorio `pollen-robotics/microduck-challenges`, commit `2473c9d84`, semilla 1, con 4096 entornos paralelos y 600 iteraciones máximas (checkpoint 400). El proceso fue por etapas con *warm start* desde el checkpoint de la etapa anterior: (1) ajuste de recompensa contra el pato de referencia, con seguimiento de velocidad unilateral, mayor peso en `marker_ground` y pago por tracción solo si el tronco está a menos de 45 grados de la vertical; (2) *sparring* con oponentes muestreados por episodio (pato de referencia 0.7, política propia de etapa 1 0.1, red de otra entrada pública 0.2); (3) *sparring* ampliado (referencia 0.6, propia etapa 2 0.1, dos entradas públicas 0.2 y 0.1). Las políticas de terceros se usaron solo como oponentes fijos de entrenamiento y evaluación, sin copia, destilación ni inicialización de pesos. El autor advierte que el entrenamiento RL en GPU no es bit-reproducible entre máquinas y que la reproducción requiere checkpoints intermedios y redes de oponentes no versionados en git.

## Capacidades

- Control locomotor de tracción: genera una marcha continua para tirar del marcador en la tarea de tira y afloja.
- Política perpetua: se ejecuta indefinidamente a 50 Hz hasta que se descarga del slot de política.
- Observaciones en crudo: el normalizador está integrado en `policy.onnx`, por lo que el daemon puede alimentar observaciones sin preprocesado.
- Integración con el daemon microduck mediante `robotctl policy load <slot> SSH111111/microduck-tug`.
- Manifiesto compatible con el esquema 2 de políticas microduck.
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni capacidades multilingües: es una política de control motor, no un modelo generativo.

## Casos de uso

- Competición en la arena microduck: cargar la política en un slot del daemon y enfrentarla a otras entradas en los combates oficiales de tira y afloja, aprovechando el entrenamiento específico contra oponentes de referencia y públicas.
- Referencia de política RL para la tarea TugOfWar: servir como punto de partida o *baseline* para desarrolladores que entrenen sus propias políticas en `microduck-challenges` y quieran comparar curvas de recompensa y comportamiento.
- Docencia en robótica y RL: usar el pipeline de tres etapas (ajuste de recompensa, *sparring* acotado, *sparring* ampliado) como ejemplo didáctico de *curriculum* y *warm start* en entornos simulados con MuJoCo.
- Validación de infraestructura de despliegue: probar el flujo `robotctl policy load`, el esquema 2 de manifiesto y la inferencia ONNX a 50 Hz en el hardware real del MicroDuck.
- Evaluación comparativa de oponentes: emplear la política como sparring fijo en experimentos propios, tal y como el autor hizo con otras entradas públicas, para medir robustez frente a estilos de tracción distintos.
- Investigación en simulación a realidad: analizar la transferencia de una política entrenada con 4096 entornos paralelos a un robot de bajo coste, midiendo degradación por ruido de sensores y latencia del daemon.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas numéricas de recompensa, tasa de victorias ni comparaciones cuantitativas con otras políticas de la arena.

## Requisitos de hardware

- VRAM estimada para inferencia: mínima; la red MLP de 61 -> 512 -> 256 -> 128 -> 14 en ONNX ocupa del orden de kilobytes a pocos megabytes, muy por debajo de 1 GB.
- GPU recomendadas: no es necesario GPU para inferencia; cualquier CPU moderna del propio robot o de un host conectado puede ejecutar el grafo ONNX a 50 Hz.
- Cabe en cualquier GPU de consumo (RTX 4090, RTX 3060, integradas) y en CPU embebida; el cuello de botella es la latencia del bus de control del robot, no el cómputo.
- Opciones de despliegue: ONNX Runtime a través del daemon microduck (`robotctl policy load`); no se documentan despliegues con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles de forma explícita; el diseño fija 50 Hz de frecuencia de control, lo que implica un presupuesto de 20 ms por paso.

## Comparativa con modelos similares

| Modelo | Tarea | Arquitectura | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SSH111111/microduck-tug | Tug of war microduck | MLP 61-512-256-128-14, ELU | ONNX + manifest | no disponible | Hugging Face, 0 descargas |
| a1rb4Ck/microduck-tug | Tug of war microduck | no disponible (basada en rumezhak's tug-tab-v2) | no disponible | no disponible | Hugging Face |
| suraj-phanindra/microduck-tug-hc1-aifund | Tug of war microduck | no disponible | ONNX + manifest esquema 2 | no disponible | Hugging Face |

Las tres entradas comparten tarea y ecosistema (microduck, manifiesto esquema 2, normalizador embebido), pero no se dispone de datos públicos de parámetros, contexto ni rendimiento comparativo entre ellas. La entrada de `a1rb4Ck` declara basarse en `rumezhak's tug-tab-v2`, lo que sugiere reutilización de políticas previas; la de `SSH111111` declara explícitamente no haber copiado pesos de terceros.

## Limitaciones y advertencias

- Sesgos conocidos: la política está sobreajustada a la dinámica simulada de MuJoCo y a los oponentes concretos usados en el *sparring*; su comportamiento frente a políticas no vistas puede degradarse.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de acciones fuera de distribución ante observaciones anómalas (sensores ruidosos, caídas, empujes no modelados).
- Limitaciones de contexto o idioma: no aplica idioma; la ventana de observación es de un único paso de 61 dimensiones, sin memoria explícita más allá de la recurrencia implícita del control a 50 Hz.
- Restricciones de licencia: la licencia no está disponible, por lo que no puede confirmarse el uso comercial; debe contactarse con el autor antes de cualquier despliegue productivo.
- Reproducibilidad: el autor advierte que el entrenamiento RL en GPU no es bit-reproducible y que el comando de reproducción no basta sin los checkpoints intermedios y las redes de oponentes, que no están en git.
- Caveat de producción: el checkpoint exportado proviene de un *checkout* con cambios no confirmados (un `MUJOCO_LOG.TXT` sin seguimiento), aunque el autor afirma que el código de entrenamiento se ejecutó desde un árbol limpio en el commit indicado.
- Estado del repositorio: 0 descargas y 0 likes, sin validación comunitaria ni resultados de benchmarks publicados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SSH111111/microduck-tug
- Repositorio microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de retos y entrenamiento: https://github.com/pollen-robotics/microduck-challenges
- Entrada homónima de otro autor (a1rb4Ck): https://huggingface.co/a1rb4Ck/microduck-tug
- Entrada homónima de otro autor (suraj-phanindra): https://huggingface.co/suraj-phanindra/microduck-tug-hc1-aifund
