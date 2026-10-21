# XYZPIT/r1lite_ee_no_aux_fk_120k

## Resumen

`r1lite_ee_no_aux_fk_120k` es un fine-tune del modelo visión-lenguaje-acción (VLA) NVIDIA Isaac GR00T N1.7-3B, publicado por el usuario XYZPIT, orientado al control del efector final (end-effector, EE) del robot R1 Lite. El modelo recibe tres vistas RGB (cabeza, muñeca izquierda, muñeca derecha), el estado del robot y un texto de tarea, y devuelve bloques de 32 acciones compuestas por la apertura de las pinzas izquierda y derecha más las poses cartesianas de ambos efectores (xyz y rotación en representación 6D).

Se trata de un checkpoint intermedio: 120.000 pasos de optimización de un plan de 150.000, entrenado sobre un único conjunto de datos de 50 episodios (70.682 frames de origen) en el que los objetivos de acción del efector final se recalcularon por cinemática directa desde las acciones articulares, en el marco `torso_link3`. Las cuatro pérdidas auxiliares (consistencia de trayectoria, rollout de acción, suavidad de velocidad y anclaje de sonda de velocidad) están deliberadamente desactivadas, de modo que el modelo funciona como rama de ablación de un estudio comparativo.

Su relevancia es acotada y experimental: 11 descargas, 0 likes, sin evaluación en bucle cerrado publicada y con la comparación de ablación todavía en curso. Es útil como referencia técnica para quien trabaje con GR00T N1.7 en manipulación bimanual, no como política lista para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) transformer; fine-tune de NVIDIA Isaac GR00T N1.7. No se detalla en la información disponible la composición interna (backbone VLM, cabeza de acción) |
| Parámetros totales | 3.144.016.000 (≈3,14 B), dato real de safetensors |
| Parámetros activos | No disponible; no se indica que sea un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible; el repositorio solo publica pesos en safetensors, sin variantes cuantizadas |
| Idiomas soportados | No disponible; la entrada incluye texto de tarea, pero no se documentan idiomas |
| Licencia | NVIDIA (`license: other`, `license_name: nvidia`); se incluye el `LICENSE` del modelo base. Términos concretos no detallados en la model card |
| Formato de pesos | safetensors, más configuración, mapeo de embodiment, configuración de processor y estadísticas de normalización |
| Tamaño del repositorio | 12,6 GB |
| Pasos de entrenamiento | 120.000 (de un plan de 150.000); no es el checkpoint final |
| Embodiment | `new_embodiment` |
| Longitud del chunk de acción | 32 |
| Entradas | 3 vistas RGB (cabeza, muñeca izquierda, muñeca derecha), estado del robot, texto de tarea |
| Salidas | Pinzas izquierda/derecha + poses EE izquierda/derecha (xyz + rotación 6D, dos primeras filas de la matriz de rotación); representación relativa durante el procesado |
| Descargas / likes | 11 / 0 |
| Fecha de creación | 2026-10-21 |

## Arquitectura y entrenamiento

La información disponible describe el modelo como un VLA basado en NVIDIA Isaac GR00T N1.7-3B, con 3.144.016.000 parámetros y pipeline de robotics en la librería `transformers`. No se especifican en la model card el backbone de visión-lenguaje, el tipo de cabeza de acción, la función de pérdida principal ni el número total de tokens vistos durante el preentrenamiento del modelo base. Lo que sí se detalla es la interfaz: tres cámaras RGB, estado proprioceptivo del robot y texto de tarea como entradas; salida en forma de chunk de 32 acciones con poses de efector final en representación relativa (xyz más las dos primeras filas de la matriz de rotación, es decir, rotación 6D).

El fine-tune se realizó sobre el dataset `260413_r1lite_ee_trimmed_gr00t_fk`: 50 episodios y 70.682 frames de origen. Los objetivos de acción del efector final no provienen de teleoperación directa en espacio cartesiano, sino que se recalcularon por cinemática directa a partir de las acciones articulares, expresadas en el marco `torso_link3`. Hiperparámetros: batch global de 16, learning rate 1e-4, schedule coseno sobre 150.000 pasos planificados, warmup ratio 0,05, weight decay 1e-5 y semilla 42. Las cuatro pérdidas auxiliares están a 0.0 (consistencia de trayectoria, rollout de acción, suavidad de velocidad y anclaje de sonda de velocidad), por lo que este checkpoint aísla el efecto de la pérdida principal sin regularización auxiliar. El repositorio contiene únicamente pesos de inferencia, configuración, mapeo de embodiment, configuración de processor y estadísticas de normalización: no incluye estado del optimizador, del scheduler, del RNG ni logs, de modo que no permite reanudar el entrenamiento de forma exacta.

## Capacidades

- Generación de acciones motoras en espacio cartesiano para dos brazos: poses de efector final (xyz + rotación 6D) y apertura de pinza izquierda y derecha, en chunks de 32 pasos.
- Fusión de tres vistas RGB simultáneas (cámara de cabeza y una por muñeca), lo que habilita manipulación con realimentación visual cercana al punto de agarre.
- Condicionamiento por instrucción en lenguaje natural: la política recibe texto de tarea junto con el estado del robot.
- Control relativo del efector final, lo que en principio reduce la dependencia de la posición absoluta de la base del robot (según la representación relativa descrita en la model card).
- Consumo del estado proprioceptivo del robot como parte de la observación.
- Integración con el ecosistema `transformers` y con el cargador de políticas GR00T (procesador y estadísticas de normalización incluidos en el repositorio).
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, visión general (VQA) ni audio; es un modelo de acción, no un asistente conversacional.

## Casos de uso

- Manipulación bimanual sobre R1 Lite: el modelo emite simultáneamente poses de ambos efectores y apertura de ambas pinzas, lo que permite tareas cooperativas (sujetar con una mano y operar con la otra) sin descomponer la política en dos controladores independientes.
- Pick-and-place con realimentación visual de muñeca: las dos cámaras de muñeca dan una vista cercana al punto de agarre, adecuada para corregir el alineamiento final antes del cierre de pinza en objetos pequeños.
- Rama de ablación en investigación: al tener las cuatro pérdidas auxiliares a 0.0, sirve como referencia para medir el efecto de la consistencia de trayectoria, el rollout de acción y la suavidad de velocidad frente a checkpoints con esas pérdidas activas, siempre que se use el mismo dataset y la misma recalculación FK.
- Estudio del efecto del número de pasos de entrenamiento: es el checkpoint de 120.000 pasos de un plan de 150.000, por lo que compararlo con el checkpoint final (si se publica) permite analizar la curva de mejora tardía en políticas VLA de 3 B de parámetros.
- Evaluación offline sobre episodios de entrenamiento: la model card prevé comparaciones offline con episodios del propio dataset; útil como prueba de humo de la interfaz (formato de observaciones, estadísticas de normalización, chunk de 32) antes de lanzar experimentos en bucle cerrado.
- Prototipado en simulación: integrable vía `transformers` y el cargador de políticas GR00T para validar el pipeline de percepción-acción en un entorno simulado antes de asumir el coste y el riesgo de un despliegue físico.
- Recolección de datos asistida: usar la política para generar rollouts iniciales y filtrar los válidos permite ampliar el dataset de 50 episodios, que es el principal cuello de botella de este fine-tune.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que la comparación de ablación con cinemática directa emparejada está en curso, que no se formula ninguna afirmación de rendimiento en bucle cerrado y que las comparaciones offline previstas utilizan episodios de entrenamiento, por lo que no establecen generalización a datos no vistos.

| Aspecto evaluado | Estado |
|---|---|
| Benchmarks estándar (MMLU, HumanEval, GSM8K) | No aplicables / no disponibles: es un modelo de acción robótica |
| Tasa de éxito en tareas reales (bucle cerrado) | No disponible; no se hace ninguna afirmación al respecto |
| Ablación emparejada por cinemática directa | En curso en el momento de publicación de la model card |
| Comparación offline | Planificada, sobre episodios de entrenamiento; no demuestra generalización |
| Métricas numéricas publicadas | No disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 12,6 GB, lo que corresponde a unos 4 bytes por parámetro (≈FP32) para 3.144.016.000 parámetros. En FP32 se necesitan aproximadamente 12,6 GB solo para pesos; en BF16/FP16, unos 6,3 GB. Estimación orientativa, no medida por el autor.
- VRAM total real: a los pesos hay que sumar activaciones, tres streams RGB y el buffer de acciones; como orden de magnitud, 16-20 GB en FP32 y 10-14 GB en BF16. No hay cifras oficiales.
- GPU de consumo: una RTX 4090 o RTX 3090 (24 GB) cubren el modelo en BF16 con margen; una RTX 4080 de 16 GB sería ajustada en BF16 y requeriría FP16/BF16 con batch pequeño o cuantización no documentada.
- GPU de centro de datos: A100 (40/80 GB), H100, L40S o RTX A6000, útiles si se ejecutan varias instancias o se hace entrenamiento/ajuste adicional.
- Despliegue: `transformers` junto con el cargador de políticas GR00T, usando el mapeo de embodiment, la configuración de processor y las estadísticas de normalización incluidas en el repositorio. No hay soporte documentado para vLLM, TGI, llama.cpp u Ollama, que no encajan con un modelo de acción robótica.
- Latencia y throughput: no disponibles. El chunk de 32 acciones amortiza el coste de inferencia a lo largo de 32 pasos de control, pero no se documenta la frecuencia de control resultante ni el tiempo por inferencia.
- Cuantización: no se publican pesos GGUF, AWQ, GPTQ ni INT8; cualquier reducción a 8 o 4 bits (≈3,1 GB y ≈1,6 GB de pesos respectivamente) sería un trabajo propio del usuario y sin validación conocida en este dominio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| r1lite_ee_no_aux_fk_120k | 3.144.016.000 | No disponible | Sin datos publicados (ablación en curso) | NVIDIA (`other`) | Pesos en HuggingFace, 11 descargas |
| nvidia/GR00T-N1.7-3B (base) | ≈3,14 B (misma familia) | No disponible | No disponible en esta información | NVIDIA | Pesos públicos en HuggingFace |
| OpenVLA-7B | ≈7 B | No disponible | No disponible en esta información | No disponible en esta información | Pesos públicos |
| Políticas VLA de la clase 3 B (por ejemplo, π0) | No disponible en esta información | No disponible en esta información | No disponible en esta información | No disponible en esta información | No disponible en esta información |

No se dispone de comparaciones cuantitativas verificables entre este checkpoint y otras políticas VLA: el autor no publica tasas de éxito ni métricas offline, y no existe una evaluación emparejada en bucle cerrado. Cualquier comparación de rendimiento con OpenVLA, π0 u otros modelos de la categoría exigiría reproducir la misma configuración de robot, cámaras y conjunto de tareas, lo que no se ha hecho en la información disponible.

## Limitaciones y advertencias

- Sin validación en bucle cerrado: la model card declara explícitamente que no se hace ninguna afirmación de rendimiento en tareas reales.
- Checkpoint intermedio: 120.000 pasos de 150.000 planificados; el schedule coseno no se ha completado, por lo que el modelo no está en su punto de convergencia previsto.
- Dataset muy reducido: 50 episodios y 70.682 frames. La diversidad de objetos, posiciones e iluminación es presumiblemente baja, con riesgo alto de sobreajuste y de fallo fuera de la distribución de entrenamiento.
- Las comparaciones offline previstas usan episodios de entrenamiento, por lo que no establecen generalización a datos no vistos.
- Pérdidas auxiliares desactivadas: sin consistencia de trayectoria, rollout de acción ni suavidad de velocidad, es esperable una menor regularización del movimiento; no se ha cuantificado el efecto.
- Dependencia estricta de la configuración: las acciones EE se generan en representación relativa y requieren el mapeo de embodiment, la configuración de processor y las estadísticas de normalización incluidas. Usar otras estadísticas o reordenar las cámaras invalida la política.
- Entrada rígida: exactamente tres vistas RGB (cabeza, muñeca izquierda, muñeca derecha), estado del robot y texto de tarea. No hay tolerancia documentada a cámaras adicionales, falta de alguna vista u otras morfologías.
- Idiomas: no se documentan; el texto de tarea se desconoce si funciona fuera del idioma usado en el dataset.
- Sin capacidades de tool calling, agentes ni conversación: no es un modelo de propósito general y no debe evaluarse con benchmarks de lenguaje.
- Riesgo de alucinación trasladado al dominio motor: la política puede generar trayectorias plausibles pero incorrectas sin señal de incertidumbre, lo que exige límites de par, paradas de emergencia y supervisión humana en hardware real.
- Sesgos: no documentados; en robótica los sesgos provienen del dataset (posiciones, objetos y condiciones de luz sobrerrepresentadas) y no se han analizado.
- Licencia: se hereda la licencia NVIDIA del modelo base (`license: other`). Los términos concretos no se detallan en la model card y deben consultarse en el fichero `LICENSE` del repositorio antes de cualquier uso comercial. Este checkpoint es un derivado y no otorga derechos adicionales.
- Madurez: 11 descargas y 0 likes; sin mantenimiento ni issues documentados. No apto como dependencia de producción.
- No incluye estado de optimizador, scheduler ni RNG: no permite reanudar el entrenamiento de forma exacta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/XYZPIT/r1lite_ee_no_aux_fk_120k
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Licencia del modelo base (incluida en el repositorio): `LICENSE` en https://huggingface.co/XYZPIT/r1lite_ee_no_aux_fk_120k/blob/main/LICENSE
- Cargador de políticas GR00T referido en la model card (repositorio de referencia de Isaac-GR00T): https://github.com/NVIDIA/Isaac-GR00T
- Paper, blog o demo específicos de este checkpoint: no disponibles en la información proporcionada.
