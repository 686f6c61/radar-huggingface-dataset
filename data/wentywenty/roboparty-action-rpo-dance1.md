# wentywenty/roboparty-action-rpo-dance1

## Resumen

RPO Dance 1 es una política de control motriz (policy) para el robot humanoide `rpo` de la plataforma RoboParty, empaquetada como un grafo ONNX y publicada en Hugging Face bajo el identificador `wentywenty/roboparty-action-rpo-dance1`. No es un modelo de lenguaje ni un modelo fundacional generativo: es una red neuronal de inferencia que mapea un vector de observaciones de 121 dimensiones a un vector de 23 acciones articulares, una por cada grado de libertad (DOF) del robot. Su función es reproducir una coreografía de baile concreta sobre el hardware real o en simulación.

El modelo se distribuye con `library_name: onnxruntime` y el único artefacto funcional documentado es `policy_dance1.onnx`. El repositorio está etiquetado como `robotics`, `humanoid`, `action` y `motion`, y declara una licencia de tipo `other` sin texto adicional en la información disponible. El tamaño del repositorio aparece como 0.0 GB, lo que sugiere un peso muy reducido, coherente con una política de control de baja dimensionalidad y no con un transformer de gran escala.

La relevancia de esta publicación es acotada pero concreta: forma parte del ecosistema RoboParty/RP1, una plataforma de humanoide de código abierto que integra diseño mecánico y eléctrico, firmware, modelos de robot, despliegue y aprendizaje. Este tipo de artefactos permite a desarrolladores de robótica reproducir políticas de movimiento sobre un humanoide real sin entrenar desde cero, siempre que se respeten las condiciones de seguridad indicadas por el autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (política de control empaquetada como grafo ONNX; no se documenta la topología interna de la red) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (entrada fija `obs` de shape `[1, 121]`) |
| Tipos de cuantización | no disponible (se distribuye un único artefacto ONNX, `policy_dance1.onnx`) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | `other` (sin texto de licencia en la información disponible) |
| Formato de pesos | ONNX (`policy_dance1.onnx`), ejecutable con onnxruntime |

Otros datos técnicos declarados en la model card:

| Parámetro | Valor |
|---|---|
| Robot objetivo | `rpo` |
| Grados de libertad (DOF) | 23 |
| Nivel de seguridad | `S2` |
| Entrada | `obs` `[1, 121]` |
| Salida | `actions` `[1, 23]` |
| Origen de los datos | `Roboparty/roboparty_inference` @ commit `ee9174c` |
| Tamaño del repositorio | 0.0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna de la red. La model card solo documenta la interfaz de inferencia: una entrada `obs` de 121 valores en coma flotante y una salida `actions` de 23 valores, ejecutadas con onnxruntime. El número 23 coincide con los grados de libertad del robot `rpo`, de modo que la salida es presumiblemente un vector de consignas articulares (posiciones, velocidades o incrementos, no especificado). El vector de observaciones de 121 dimensiones es consistente con un espacio de observación que combina estado articular, velocidades, orientación y posibles consignas de fase, pero la composición exacta no está publicada.

Tampoco se documentan el número de tokens, la composición del dataset, ni si hubo entrenamiento por refuerzo, imitación o ajuste con preferencias. La model card indica que la previsualización (`preview.gif`) fue renderizada a partir de datos de movimiento de RoboOS y que sirve únicamente para mostrar la forma del movimiento, sin representar el comportamiento en el robot físico. El nombre del repositorio incluye el sufijo `rpo`, que podría corresponder a un método de optimización de políticas, pero no hay información que lo confirme.

## Capacidades

- Generación de una secuencia de acciones articulares para 23 DOF a partir de una observación de 121 dimensiones, ejecutada paso a paso en un bucle de control.
- Reproducción de una coreografía de baile concreta (`dance1`) sobre el humanoide `rpo`, en simulación o en hardware real.
- Inferencia portable mediante ONNX Runtime, sin dependencia de frameworks de deep learning pesados.
- Integración con el stack de inferencia de RoboParty (`Roboparty/roboparty_inference`, commit `ee9174c`), que se encarga presumiblemente del preprocesado de observaciones y del envío de consignas al bus de motores.
- Nivel de seguridad declarado `S2`, que implica un perfil de riesgo que el operador debe verificar antes de la ejecución.
- No soporta tool calling, function calling, razonamiento multi-step, procesamiento de lenguaje natural, visión, audio ni capacidades multilingües.

## Casos de uso

- Demostración de baile en el humanoide `rpo`: la política genera directamente las 23 consignas articulares por paso de control, lo que permite ejecutar una coreografía predefinida en ferias, laboratorios o vídeos de presentación sin programar trayectorias a mano.
- Validación de la cadena de despliegue RoboParty: sirve como política de referencia para comprobar que el pipeline de observaciones, el runtime ONNX y el bus de motores funcionan de extremo a extremo antes de probar políticas propias.
- Pruebas de simulación a realidad: al ser un grafo ONNX de entrada y salida fijas, se puede ejecutar primero en el simulador del ecosistema RP1 y después replicar exactamente la misma inferencia en el robot físico, aislando discrepancias de dinámica.
- Benchmark de latencia del runtime: con una entrada de 121 valores y una salida de 23, es un caso de prueba útil para medir el coste por ciclo de onnxruntime en la computadora embarcada del robot y ajustar la frecuencia de control.
- Base para ajuste fino o destilación: el par entrada/salida documentado permite usar la política como profesor en imitación o como punto de partida para entrenar variantes de movimiento sobre el mismo espacio de observación.
- Docencia e investigación en control de humanoides: proporciona un ejemplo reproducible de política de acción continua de baja dimensionalidad sobre una plataforma de hardware abierta, útil para comparar métodos de aprendizaje por imitación o refuerzo.
- Integración en el gemelo digital del RP1: la política se puede cargar en el modelo de robot del repositorio RP1 para animar el gemelo digital y verificar colisiones o límites articulares antes de habilitar los motores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de recompensa, error de seguimiento de trayectoria, tasa de éxito ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 0.0 GB y la interfaz es de 121 entradas y 23 salidas, por lo que el modelo es presumiblemente muy ligero, pero no se publica el número de parámetros ni el tamaño real del fichero ONNX.
- GPU recomendadas: no disponible. Por la dimensionalidad de la interfaz, la inferencia en CPU con onnxruntime debería ser viable, pero no hay datos publicados de latencia ni de consumo.
- Compatibilidad con GPU de consumo: no confirmada. No hay información que permita afirmar que quepa o no en una RTX 4090 u otras GPU de consumo.
- Opciones de despliegue: ONNX Runtime es el runtime declarado (`library_name: onnxruntime`). El stack de referencia es `Roboparty/roboparty_inference` en el commit `ee9174c`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que además no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Robot / DOF | Entrada / salida | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `wentywenty/roboparty-action-rpo-dance1` | Política de control | `rpo` / 23 | `[1, 121]` / `[1, 23]` | ONNX | `other` | Hugging Face |
| `wentywenty/roboparty-action-rpo-wave` | Política de control | `rpo` (no confirmado) / no disponible | no disponible | no disponible | no disponible | Hugging Face |
| Políticas del stack RP1 (`Roboparty/RP1`) | Plataforma de control y aprendizaje | humanoide RP1 | no disponible | no disponible | código abierto (según repositorio) | GitHub |

La comparación se limita a artefactos del mismo ecosistema porque no se dispone de datos de rendimiento ni de especificaciones internas de alternativas externas. No se han encontrado métricas que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- La model card exige confirmar antes de la ejecución el soporte del robot, la parada de emergencia, la limitación de corriente de la fuente de alimentación y la realimentación del bus. Instalar la acción no equivale a habilitar los motores.
- El nivel de seguridad declarado es `S2`; el operador debe interpretar y respetar ese nivel según la política de seguridad de RoboParty antes de cualquier prueba en hardware real.
- La previsualización incluida es un render de datos de RoboOS y no representa el comportamiento en el robot físico, por lo que no sirve como validación de estabilidad ni de seguimiento.
- No se documenta la composición del vector de observaciones de 121 dimensiones; un preprocesado incorrecto produce consignas inválidas sin aviso explícito del modelo.
- No hay información sobre sesgos, tasa de alucinación ni degradación fuera de distribución. Al ser una política de control, el riesgo equivalente es la pérdida de estabilidad o el movimiento no previsto ante observaciones anómalas.
- No se especifica el alcance de la licencia `other`: no se puede confirmar si el uso comercial está permitido, restringido o sujeto a condiciones adicionales.
- El repositorio registra 0 descargas y 0 likes, y no se han publicado resultados de evaluación; se desconoce su robustez en distintas superficies, cargas o estados de batería.
- El modelo está diseñado para un robot concreto (`rpo`, 23 DOF); no es transferible a otras morfologías sin reentrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wentywenty/roboparty-action-rpo-dance1
- Modelo relacionado (wave): https://huggingface.co/wentywenty/roboparty-action-rpo-wave
- Repositorio RP1 de RoboParty: https://github.com/Roboparty/RP1
