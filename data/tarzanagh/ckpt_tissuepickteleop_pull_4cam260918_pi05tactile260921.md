# tarzanagh/ckpt_tissuepickteleop_pull_4cam260918_pi05tactile260921

## Resumen

`tarzanagh/ckpt_tissuepickteleop_pull_4cam260918_pi05tactile260921` es un checkpoint de política robótica entrenado por imitación para una tarea bimanual concreta: un robot DexMate Vega-1 equipado con dos manos RobotEra XHand1 sostiene una caja de pañuelos con la mano izquierda y extrae un pañuelo con la derecha. No es un modelo de lenguaje: es un modelo de visión-lenguaje-acción (o, más exactamente, un policy checkpoint de la familia pi-0.5) que mapea observaciones visuales y propioceptivas a comandos de articulación.

El modelo se presenta como la variante «pi-0.5 + táctil» de una batería comparativa de 24 ejecuciones sobre la misma tarea, en la que el autor contrasta cuatro familias de políticas (ACT, Diffusion Policy, GR00T y pi-0.5), con y sin entrada táctil. Los datos de demostración se recogieron mediante teleoperación con guante Meta (sin exoesqueleto) y seguimiento de muñeca Vive, con 120 episodios, de los cuales 108 se usaron para entrenamiento y 12 se reservaron para validación. La relevancia del checkpoint es metodológica: forma parte de un estudio controlado sobre si la señal táctil aporta ventaja medible frente a la visión, y sus resultados preliminares indican que no.

El repositorio ocupa 14,5 GB y contiene 3.616.769.814 parámetros en formato safetensors, lo que sitúa al modelo en el rango de los 3,6 mil millones de parámetros. Se publica bajo licencia Gemma, con 0 descargas y 0 «likes» en el momento de redactar esta ficha, y no incluye resultados de éxito en hardware real: todas las métricas son de error en bucle abierto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No detallada en el model card; se identifica como pi-0.5 con entrada táctil añadida (política de imitación con codificador visual). No se especifica si es transformer puro, MoE o híbrida |
| Parametros totales | 3.616.769.814 (aproximadamente 3,62 mil millones) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No aplica como contexto de texto. Horizonte de acción: se predice un chunk de acciones y se conservan las 16 primeras; el modelo recibe una observación real cada 16 pasos |
| Tipos de cuantizacion | No disponible. El tamaño del repo (14,5 GB) es coherente con pesos en fp32, pero el model card no lo confirma |
| Idiomas soportados | No aplica (no genera texto); no se declara soporte multilingüe |
| Licencia | Gemma |
| Formato de pesos | safetensors |
| Dimension de estado/accion | 38-D de articulaciones `[L_arm 7 | L_hand 12 | R_arm 7 | R_hand 12]`; 30-D de fuerza en punta de dedo (5 dedos x 3 ejes por mano) concatenados en el estado: 68-D |
| Entrada sensorial | 4 cámaras RGB, 640x360 a 30 fps; sin confirmar si la señal táctil se usa efectivamente en la inferencia |
| Pipeline declarado | robotics |
| Tamano del repositorio | 14,5 GB |
| Fecha de creacion | 2026-09-24 |
| Ultima actualizacion | 2026-09-24 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El model card no describe la arquitectura interna más allá de identificarla como pi-0.5 con entrada táctil. Por el nombre y el tamaño (3,6 mil millones de parámetros) se trata de una política de imitación con codificador visual, del tipo usado en la familia pi-0.x, pero no se aportan detalles sobre el número de capas, el mecanismo de atención, la estrategia de fusión de la señal táctil ni el tipo de decodificador de acciones. Tampoco se indica qué parte del cómputo corresponde al backbone visual frente a la cabeza de acción, ni si el modelo emplea decodificación por flujo o regresión directa.

En cuanto al entrenamiento, el autor documenta 10.000 pasos con semilla 1000 sobre 108 episodios de demostración teleoperada (de un total de 120, reservando cada décimo episodio para validación). Las demostraciones se capturaron con teleoperación mediante guante Meta y seguimiento de muñeca Vive, sin exoesqueleto, sobre un DexMate Vega-1 con dos manos XHand1. La tarea es bimanual y de manipulación fina: sujetar una caja de pañuelos y extraer uno. El estado combina posiciones articulares (38-D) y fuerzas en las puntas de los dedos (30-D), dando un vector de 68-D. No se menciona uso de RLHF, DPO ni fine-tuning por preferencias, algo esperable en un problema de control motor.

La innovación que el autor pretende evaluar es la incorporación de información táctil al pipeline de la política. El resultado reportado en el propio model card es negativo: en el conjunto de cuatro familias por tres tareas, la entrada táctil no produjo diferencias más allá del ruido, y GR00T obtuvo el error más bajo en todas las tareas. Cabe señalar una advertencia importante del propio autor: la métrica publicada mide seguimiento de trayectoria en bucle abierto, no éxito de tarea, y ninguno de los modelos se probó en hardware real.

## Capacidades

- Generación de acciones de control bimanual: produce comandos de 38-D que cubren 7 grados de libertad por brazo y 12 por mano (dos manos XHand1).
- Percepción visual multi-cámara: consume 4 flujos RGB a 640x360 y 30 fps.
- Entrada propioceptiva y táctil: acepta un vector de estado de 68-D que incluye fuerzas de contacto de tres ejes en los cinco dedos de cada mano.
- Ejecución por chunks de acción: predice un bloque de acciones y ejecuta las 16 primeras antes de volver a observar, lo que reduce la frecuencia de inferencia necesaria en bucle cerrado.
- Manipulación diestra y bimanual: la tarea objetivo combina sujeción estable con una mano y extracción fina con la otra.
- No soporta tool calling ni function calling: no es un modelo de lenguaje y no expone interfaz de llamada a herramientas.
- No soporta razonamiento multi-paso simbólico ni planificación de agentes en el sentido de los LLM.
- Capacidades multilingües: no aplica.
- Capacidades especiales: no se documenta modo «thinking», visión-lenguaje general ni procesamiento de audio. El modo táctil está presente en la arquitectura declarada, pero el análisis del autor sugiere que no aporta señal aprovechable en esta tarea.

## Casos de uso

- Investigación comparativa de políticas de imitación: el checkpoint es una de las 24 ejecuciones de un estudio controlado, por lo que sirve como punto de referencia reproducible para medir el efecto de añadir tacto a una política pi-0.5 sobre una tarea fija.
- Manipulación textil fina en laboratorio: la tarea de extraer un pañuelo de una caja es representativa de operaciones con objetos deformables, un caso difícil para políticas puramente visuales; el modelo puede usarse como base para estudiar agarres sobre materiales blandos.
- Recolección de datos por teleoperación: el pipeline documentado (guante Meta más seguimiento Vive, 4 cámaras, 120 episodios) es replicable y sirve de plantilla para montar conjuntos de demostración bimanuales con manos diestras.
- Estudio de fusión multimodal táctil-visual: dado que el autor reporta que el tacto no aporta mejora significativa, el checkpoint es útil para reproducir y auditar ese resultado antes de invertir en sensores de fuerza costosos.
- Bimanualidad con dos manos de 12 grados de libertad: útil para investigar coordinación entre sujeción pasiva (mano izquierda) y manipulación activa (mano derecha) en plataformas Dexterous.
- Docencia y formación en robótica de imitación: un checkpoint pequeño (3,6 mil millones de parámetros) con una tarea acotada es un banco de pruebas manejable para cursos o tesis sobre políticas visomotoras.
- Base para fine-tuning en tareas de extracción o inserción: la representación de estado con fuerzas de contacto podría adaptarse a tareas como insertar conectores o extraer piezas de envases, aunque requeriría nuevas demostraciones y validación en hardware.
- Validación de infraestructura de evaluación en bucle abierto: las métricas por articulación (brazo y mano, izquierda y derecha) permiten montar comparativas rápidas sin acceso al robot físico.

## Benchmarks y rendimiento

El model card no incluye benchmarks de lenguaje (MMLU, HumanEval, GSM8K u otros), que no aplican a este tipo de modelo. El único dato cuantitativo publicado es el error de bucle abierto sobre el conjunto reservado (12 episodios, media de |predicción − acción registrada| en radianes, ± error estándar):

| Modelo | L-arm (rad) | L-hand (rad) | R-arm (rad) | R-hand (rad) |
|---|---|---|---|---|
| Este modelo (pi-0.5 + táctil) | 0,0232 ± 0,0014 | 0,0265 ± 0,0035 | 0,0576 ± 0,0030 | 0,0353 ± 0,0016 |
| Baseline «hold-first-frame» | 0,1975 | 0,0514 | 0,2628 | 0,1440 |

El baseline «hold-first-frame» no reporta error estándar. La métrica se obtiene dando al modelo la observación real cada 16 pasos y conservando las 16 primeras acciones predichas; mide seguimiento de trayectoria, no éxito de la tarea, y ninguna de las ejecuciones se probó en hardware. El autor indica además que, en el conjunto de cuatro familias por tres tareas, GR00T obtuvo el error más bajo en todas las tareas y que la entrada táctil no produjo diferencias por encima del ruido, aunque no se desglosan esos resultados en esta ficha de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en fp32 (coherente con los 14,5 GB del repositorio, unos 13,5 GiB solo de parámetros) se necesitan aproximadamente 16-20 GB contando activaciones y el codificador de 4 cámaras. En bf16/fp16 los pesos bajarían a unos 7 GB y el total a 10-12 GB. En int8, a unos 3,6 GB de pesos más sobrecarga.
- GPU recomendadas: A100 40 GB u 80 GB y H100 para fp32 sin compromisos; A6000 48 GB como alternativa de taller. Para bf16, una RTX 4090 (24 GB) o L40S son suficientes.
- Cabe en GPU de consumo: sí, en bf16 o int8. Una RTX 4080/4090 (16-24 GB) maneja el modelo en bf16 con margen; una RTX 3060 de 12 GB requeriría cuantización a 8 bits. En fp32, una GPU de 24 GB queda al límite.
- Opciones de despliegue: el model card no indica ninguna. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que en cualquier caso no son aplicables a una política de control; el checkpoint está pensado para cargarse con el código de entrenamiento e inferencia del autor, que no se enlaza en la información disponible.
- Latencia y throughput: no disponibles. La estrategia de chunks de 16 pasos reduce la frecuencia de inferencia necesaria a una llamada cada 16 pasos de control, pero no se publica ningún dato medido de latencia.
- Nota de plataforma: el despliegue real requiere una interfaz hacia el robot DexMate Vega-1 y las manos XHand1, además de sincronización de 4 cámaras a 30 fps, lo que no se cubre con una simple GPU de inferencia.

## Comparativa con modelos similares

El autor publica 24 ejecuciones sobre esta misma tarea. Estas son las ocho primeras de la lista, que constituyen las alternativas directas:

| Checkpoint | Familia | Entrada táctil | Parámetros | Error de bucle abierto | Licencia |
|---|---|---|---|---|---|
| `..._pi05tactile260921` (este) | pi-0.5 | Sí | 3,62 mil millones | 0,0232 / 0,0265 / 0,0576 / 0,0353 rad | Gemma |
| `..._pi05260921` | pi-0.5 | No | No disponible | No desglosado en la información disponible | Gemma (presumible) |
| `..._act260921` | ACT | No | No disponible | No desglosado | No disponible |
| `..._acttactile260921` | ACT | Sí | No disponible | No desglosado | No disponible |
| `..._dp260921` | Diffusion Policy | No | No disponible | No desglosado | No disponible |
| `..._dptactile260921` | Diffusion Policy | Sí | No disponible | No desglosado | No disponible |
| `..._gr00t3b260921` | GR00T | No | 3 mil millones (según denominación) | El más bajo de todas las tareas según el autor | No disponible |
| `..._gr00t3btactile260921` | GR00T | Sí | 3 mil millones (según denominación) | El más bajo de todas las tareas según el autor | No disponible |

El propio autor resume la comparación señalando que GR00T logró el error más bajo en las tres tareas evaluadas y que la adición de tacto no cambió los resultados más allá del ruido en ninguna de las cuatro familias. No se dispone de comparación con modelos externos a este estudio.

## Limitaciones y advertencias

- Sin validación en hardware: el model card indica explícitamente que nada de lo evaluado se ejecutó en el robot. Las cifras son de error de seguimiento en bucle abierto y no permiten inferir tasa de éxito.
- Tarea única y estrecha: el modelo está entrenado para extraer un pañuelo de una caja concreta, con una disposición de cámara, un robot y unas manos específicas. La generalización a otras tareas, objetos o configuraciones no está demostrada.
- Sesgo de conjunto de datos reducido: 120 episodios teleoperados por el mismo operador y con el mismo montaje implican poca variabilidad de iluminación, posición y estrategia de agarre.
- Entrada táctil sin beneficio demostrado: el autor reporta que el tacto no aportó mejora medible en esta familia ni en las otras tres evaluadas, lo que cuestiona el coste de instrumentar las manos con sensores de fuerza.
- Riesgo de error compuesto: al tratarse de una política que reobserva cada 16 pasos, los errores de trayectoria pueden acumularse en ejecuciones largas; no se publican métricas de robustez ante perturbaciones.
- Licencia Gemma: el uso comercial queda sujeto a los términos de la licencia Gemma, que imponen restricciones de uso y obligaciones de atribución. Conviene revisar la versión concreta de la licencia antes de cualquier despliegue productivo.
- Idiomas y texto: no aplica soporte multilingüe ni generación de lenguaje; el modelo no puede usarse para tareas de NLP.
- Trazabilidad limitada: no se publican detalles de arquitectura, hiperparámetros completos, ni código de inferencia, y el repositorio acumula 0 descargas y 0 valoraciones, por lo que no hay evidencia externa de reproducibilidad.
- Fechas del repositorio: la creación y la última actualización figuran como 2026-09-24, la misma fecha, lo que sugiere que el checkpoint no ha recibido mantenimiento posterior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tarzanagh/ckpt_tissuepickteleop_pull_4cam260918_pi05tactile260921
- Variante pi-0.5 sin táctil: https://huggingface.co/tarzanagh/ckpt_tissuepickteleop_pull_4cam260918_pi05260921
- Variante ACT sin táctil: https://huggingface.co/tarzanagh/ckpt_tissuepickteleop_pull_4cam260918_act260921
- Variante ACT con táctil: https://huggingface.co/tarzanagh/ckpt_tissuepickteleop_pull_4cam260918_acttactile260921
- Variante Diffusion Policy sin táctil: https://huggingface.co/tarzanagh/ckpt_tissuepickteleop_pull_4cam260918_dp260921
- Variante Diffusion Policy con táctil: https://huggingface.co/tarzanagh/ckpt_tissuepickteleop_pull_4cam260918_dptactile260921
- Variante GR00T 3B sin táctil: https://huggingface.co/tarzanagh/ckpt_tissuepickteleop_pull_4cam260918_gr00t3b260921
- Variante GR00T 3B con táctil: https://huggingface.co/tarzanagh/ckpt_tissuepickteleop_pull_4cam260918_gr00t3btactile260921
- Paper, blog, repositorio de código o demo: no disponibles en la información proporcionada.
