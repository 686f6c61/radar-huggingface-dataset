# tarzanagh/ckpt_handoverteleop_shelf2shelf_4cam260918_trextactile260925

## Resumen

T-Rex con tacto sobre XHand1 es un checkpoint de política robótica (vision-lenguaje-acción) desarrollado por Davoud Ataee Tarzanagh, investigador de Samsung SDS Research America, para un robot DexMate Vega-1 equipado con dos manos RobotEra XHand1. Resuelve una tarea bimanual concreta de tipo shelf-to-shelf: retirar una caja de tisúes de un nivel de estantería, pasarla de una mano a otra y depositarla en otro nivel. Se distribuye como un fine-tuning del checkpoint midtrain publicado de T-Rex.

La arquitectura parte de un backbone Qwen3-VL-2B combinado con una mezcla de expertos transformer (mixture-of-transformer experts), decodificación mediante cascaded flow matching y el esquema FLARE. El modelo incorpora información táctil de 30 dimensiones (fuerza en la punta de 10 dedos por 3 ejes) más códigos VQ-VAE por dedo (K=64, ventana 16), y produce chunks de 16 pasos de acciones de 42 dimensiones.

Es relevante por dos motivos. Primero, la integración explícita de tacto en un VLA de backbone reducido demuestra que es viable añadir señales de contacto a políticas de manipulación diestra. Segundo, el autor publica una comparación directa y controlada contra GR00T-N1.7-3B sobre el mismo split, lo que permite aislar el efecto del tacto en el error de seguimiento de trayectoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | T-Rex: backbone Qwen3-VL-2B + mixture-of-transformer experts, cascaded flow matching, FLARE |
| Parametros totales | no disponible (el backbone es Qwen3-VL-2B; el total del sistema no se publica) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint en PyTorch, sin versiones cuantizadas publicadas) |
| Idiomas soportados | no aplica / no disponible (modelo de política robótica, no conversacional) |
| Licencia | other |
| Formato de pesos | PyTorch (`model.pt`), acompañado de `processor/`, `training_args.json` y `stats_data.json` |
| Tamaño del repositorio | 8,4 GB |
| Dimension de la accion | 42-D por paso: 2 x (9-D pose del efector final en el frame de inicio del chunk + 12 objetivos absolutos de articulaciones de mano), chunk de 16 |
| Entrada tactil | vector de fuerza 30-D (10 dedos x 3) + códigos VQ-VAE por dedo (K=64, ventana 16) |
| Camaras | cabeza-izquierda y ambas muñecas, resolución 384x288 |

## Arquitectura y entrenamiento

T-Rex combina un backbone de visión-lenguaje Qwen3-VL-2B con una mezcla de expertos transformer y un decodificador de acciones basado en cascaded flow matching, con el mecanismo FLARE. La política consume tres flujos de cámara (cabeza-izquierda y las dos muñecas) a 384x288 y los añade a la señal táctil. Esta última se representa de dos formas complementarias: un vector de fuerza de 30 dimensiones (10 dedos por 3 ejes) y códigos discretos VQ-VAE por dedo con K=64 y ventana de 16, lo que permite al modelo razonar sobre patrones de contacto además de la magnitud de la fuerza.

El entrenamiento parte del checkpoint midtrain liberado de T-Rex y se realiza sobre 54 episodios de teleoperación con guante Meta-glove (sin exoesqueleto) y seguimiento de muñeca Vive, de los cuales 48 se usan para entrenamiento y 6 quedan reservados (se retira cada décimo episodio). Se ejecutan 10.000 pasos con semilla 1000, tasa de aprendizaje 1e-4 y 4 GPUs con batch de 16 por GPU (batch global de 64). La salida son chunks de 16 pasos de acciones de 42 dimensiones. No se documenta uso de RLHF ni DPO, ya que se trata de aprendizaje por imitación supervisado sobre demostraciones.

## Capacidades

- Generación de acciones de control bimanual en chunks de 16 pasos con vector de 42 dimensiones (dos poses de efector final de 9-D más 24 objetivos absolutos de articulaciones de mano).
- Predicción de pose del efector final (posición y rotación) en el frame de inicio del chunk para ambos brazos.
- Control fino de mano diestra: 12 articulaciones objetivo por mano sobre las RobotEra XHand1.
- Percepción multimodal con tres cámaras simultáneas (cabeza-izquierda y ambas muñecas) a 384x288.
- Fusión de señal táctil: fuerza por dedo en 3 ejes y códigos VQ-VAE por dedo como entrada adicional.
- Ejecución de una tarea de handover bimanual (paso de objeto de una mano a otra) y colocación en una segunda localización.
- No soporta tool calling ni function calling: es una política de robótica, no un modelo de lenguaje con interfaz de herramientas.
- No soporta agentes conversacionales ni razonamiento multi-paso en lenguaje.
- No se documentan capacidades multilingües (no aplica al caso de uso).

## Casos de uso

- Manipulación bimanual con handover: el modelo está entrenado específicamente para coger una caja de tisúes, transferirla entre manos y depositarla en otro nivel, por lo que sirve como referencia directa para tareas de paso de objeto entre efectores.
- Reposición en estanterías de almacén: la tarea shelf-to-shelf reproduce un escenario logístico en el que un robot debe mover objetos deformables entre alturas distintas sin soltarlos.
- Investigación en fusión táctil para VLA: permite estudiar el efecto de añadir fuerza de contacto (30-D) y códigos VQ-VAE por dedo frente a políticas puramente visuales, usando la comparación controlada contra GR00T-N1.7-3B sobre el mismo split.
- Recolección de datos por teleoperación: el pipeline Meta-glove más Vive wrist tracking documentado sirve como plantilla para capturar demostraciones bimanuales con señal táctil y reentrenar políticas.
- Fine-tuning sobre el checkpoint midtrain: al estar construido como ajuste del midtrain de T-Rex, puede reutilizarse como punto de partida para nuevas tareas o nuevas morfologías de mano.
- Evaluación open-loop de políticas: el protocolo del autor (observación real cada 16 pasos, conservando los 16 pasos predichos) es reutilizable para comparar checkpoints en términos de error de tracking sin necesidad de hardware.
- Manipulación de objetos deformables: la caja de tisúes es un objeto blando cuya geometría cambia al sujetarse, lo que hace del checkpoint un banco de pruebas para agarre adaptativo con realimentación táctil.
- Despliegue sobre DexMate Vega-1: el checkpoint está adaptado a esa plataforma y a las manos XHand1, por lo que es directamente utilizable en ese montaje concreto.

## Benchmarks y rendimiento

Se presentan resultados de error open-loop sobre los episodios reservados (media ± SEM), con el modelo observando la observación real cada 16 pasos y conservando los 16 pasos predichos. Manos: media de |pred − comandado| sobre las 12 articulaciones de mano (rad). Brazos: error de posición del efector final (cm) y de rotación (grados). Esta métrica mide seguimiento de trayectoria, no éxito de tarea, y nada de lo reportado se ejecutó sobre hardware.

| Modelo | L-hand | R-hand | L-pos | R-pos | L-rot | R-rot |
|---|---|---|---|---|---|---|
| Este modelo (T-Rex + tacto) | 0,0338 ± 0,0015 | 0,0282 ± 0,0016 | 1,28 ± 0,10 | 1,16 ± 0,09 | 4,16 ± 0,21 | 3,73 ± 0,12 |
| GR00T-N1.7-3B (sin tacto), mismo split | 0,0148 ± 0,0009 | 0,0117 ± 0,0002 | 1,30 ± 0,04 | 1,22 ± 0,16 | 3,24 ± 0,12 | 3,29 ± 0,17 |

No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K u similares) en la información disponible, ya que no son aplicables a un modelo de política robótica.

## Requisitos de hardware

- VRAM de entrenamiento: el autor reporta 4 GPUs con batch de 16 por GPU (batch global de 64) durante 10.000 pasos; no especifica el modelo de GPU empleado.
- VRAM de inferencia: no publicada por el autor. Como estimación orientativa basada en el backbone Qwen3-VL-2B, el checkpoint en precisión completa (FP32) del repositorio ocupa 8,4 GB, y una carga en FP16 del backbone rondaría los 4-6 GB de pesos, más el codificador visual, las cabezas de acción y el VQ-VAE táctil.
- GPU recomendadas: no disponible. Por tamaño del backbone, una GPU con 16 GB o más (RTX 4090, A100 40 GB, H100) sería suficiente para inferencia en FP16, pero el autor no publica una recomendación.
- ¿Cabe en GPU de consumo? No confirmado por el autor. Con un backbone de ~2B, es plausible en GPUs de consumo con 12-16 GB, pero no hay validación publicada para esta variante concreta con las tres cámaras y la entrada táctil.
- Opciones de despliegue: no aplican las herramientas estándar para este checkpoint. Cargar los pesos requiere la adaptación XHand del código de T-Rex (acción 42-D, `tacf6_dim=3`); la release estándar espera el layout de 62-D de Sharpa y no carga estos pesos. No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI, porque no es un modelo de texto estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tacto | Error manos (L/R) | Error posicion (L/R) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| T-Rex + tacto (este checkpoint) | no disponible (backbone Qwen3-VL-2B) | no disponible | Sí (30-D + VQ-VAE por dedo) | 0,0338 / 0,0282 rad | 1,28 / 1,16 cm | other | HuggingFace, 0 descargas |
| GR00T-N1.7-3B (sin tacto) | 3B (según nombre) | no disponible | No | 0,0148 / 0,0117 rad | 1,30 / 1,22 cm | other | HuggingFace (checkpoint del mismo autor) |

El checkpoint relacionado `ckpt_handoverteleop_shelf2shelf_4cam260918_gr00t3b260920` corresponde a la variante GR00T-N1.7-3B de la misma tarea y split, y es la alternativa de comparación directa. No se dispone de datos de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Dataset muy reducido: 54 episodios en total, con solo 48 de entrenamiento y 6 reservados, lo que limita la generalización y aumenta el riesgo de sobreajuste a la tarea y al montaje concretos.
- La evaluación es open-loop sobre trayectorias y no mide éxito de tarea; el propio autor indica que nada se ejecutó sobre hardware.
- El error de las manos es aproximadamente el doble que el de GR00T-N1.7-3B sin tacto (0,0338 frente a 0,0148 rad en la mano izquierda), por lo que el tacto no mejora el tracking en este resultado concreto.
- Sesgos conocidos: no se documentan, pero el modelo hereda los sesgos del backbone Qwen3-VL y los de los datos de teleoperación de un único operador y montaje.
- Riesgo de alucinación: aplicable en el sentido de predicción de acciones plausibles pero incorrectas ante observaciones fuera de distribución; no hay evaluaciones de robustez publicadas.
- Dependencia de código personalizado: los pesos no cargan con la release estándar de T-Rex, que espera el layout de 62-D de Sharpa. Es obligatorio usar la adaptación XHand (42-D, `tacf6_dim=3`).
- Licencia "other": las condiciones exactas de uso comercial no se detallan en la model card, por lo que debe verificarse antes de cualquier despliegue en producción.
- Específico de una sola plataforma (DexMate Vega-1 con manos RobotEra XHand1) y de una sola tarea (handover shelf-to-shelf); no es un modelo generalista.
- No hay idiomas soportados, contexto de texto ni cuantizaciones publicadas, ya que no es un modelo de lenguaje de propósito general.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tarzanagh/ckpt_handoverteleop_shelf2shelf_4cam260918_trextactile260925
- Checkpoint relacionado GR00T-N1.7-3B, misma tarea y split: https://huggingface.co/tarzanagh/ckpt_handoverteleop_shelf2shelf_4cam260918_gr00t3b260920
- Checkpoint relacionado psspteleop pickfromscale: https://huggingface.co/tarzanagh/ckpt_psspteleop_pickfromscale_4cam260810-260811_gr00t3b260816
- Página del autor: https://tarzanagh.github.io/
- GitHub del autor: https://github.com/Tarzanagh
