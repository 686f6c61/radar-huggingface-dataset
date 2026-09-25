# tarzanagh/ckpt_tissuepickteleop_pull_4cam260918_trextactile260925

## Resumen

Este repositorio contiene un checkpoint de política robótica denominado ckpt_tissuepickteleop_pull_4cam260918_trextactile260925, desarrollado por el usuario tarzanagh (Davoud Ataee Tarzanagh, investigador en Physical AI en Samsung SDS Research America). No es un modelo de lenguaje de propósito general, sino una política de imitación entrenada para una tarea concreta de manipulación bimanual: un robot DexMate Vega-1 equipado con dos manos RobotEra XHand1 sostiene una caja de pañuelos con la mano izquierda y extrae un pañuelo con la derecha. El modelo parte de la arquitectura T-Rex, que combina un backbone de visión-lenguaje Qwen3-VL-2B con una mezcla de expertos transformer (mixture-of-transformer experts), flow matching en cascada y el mecanismo FLARE, afinado a partir de un checkpoint intermedio ya publicado.

La relevancia de esta ficha radica en que documenta un caso de integración de señal táctil en políticas de manipulación diestra. Además del flujo visual (tres cámaras: cabeza-izquierda y ambas muñecas a 384x288), el modelo consume 30 dimensiones de fuerza en las puntas de los dedos (10 dedos x 3 ejes) más códigos VQ-VAE por dedo (K=64, ventana 16). La acción generada es de 42 dimensiones por paso, combinando pose del efector final (9-D por brazo) y objetivos absolutos de articulaciones de la mano (12-D por mano), con un chunk de 16 pasos.

El checkpoint se entrenó con 120 episodios de teleoperación (108 de entrenamiento y 12 reservados), 10.000 pasos, semilla 1000 y tasa de aprendizaje 1e-4 sobre 2 GPUs con batch 16. La model card advierte explícitamente de que las métricas publicadas miden seguimiento de trayectoria en bucle abierto y no éxito de tarea, y que no se ha ejecutado nada en hardware real. Su carga requiere una adaptación específica del código de T-Rex para XHand (acción de 42-D y `tacf6_dim=3`), ya que la versión estándar espera el layout Sharpa de 62-D.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | T-Rex: backbone Qwen3-VL-2B + mezcla de expertos transformer, flow matching en cascada, FLARE |
| Parametros totales | no disponible (el backbone es Qwen3-VL-2B; el total con expertos no se especifica) |
| Parametros activos | no disponible (arquitectura MoE, sin desglose publicado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (otra) |
| Formato de pesos | PyTorch (`model.pt`), junto con `processor/`, `training_args.json`, `stats_data.json` |
| Pipeline | robotics |
| Espacio de accion | 42-D por paso = 2 x (9-D pose efector final + 12-D articulaciones de mano), chunk 16 |
| Entrada sensorial | 3 camaras (cabeza-izquierda y ambas munecas) a 384x288; tactil 30-D fuerza puntas de dedos + codigos VQ-VAE por dedo (K=64, ventana 16) |
| Tamano del repositorio | 8,4 GB |

## Arquitectura y entrenamiento

El modelo se construye sobre T-Rex, una arquitectura que acopla un modelo de visión-lenguaje Qwen3-VL-2B con una mezcla de expertos transformer y emplea flow matching en cascada junto con el componente FLARE para generar secuencias de acción. El checkpoint se obtuvo por afinamiento (fine-tuning) desde un checkpoint intermedio ya publicado de T-Rex, especializándolo para la configuración de hardware XHand1 sobre DexMate Vega-1. La innovación técnica destacable es la incorporación de señal táctil: 30 dimensiones de fuerza en las puntas de los dedos (10 dedos x 3 ejes) representadas como vector, más códigos discretos VQ-VAE por dedo (K=64, ventana 16). La acción es de 42 dimensiones por paso, con un horizonte de chunk de 16 pasos.

En cuanto a los datos y el procedimiento de entrenamiento, el conjunto consta de 120 episodios de teleoperación con guante meta (sin exoesqueleto) y seguimiento de muñeca mediante Vive; 108 episodios se usaron para entrenamiento y 12 quedaron reservados (se retuvo cada décimo episodio). El entrenamiento se realizó durante 10.000 pasos con semilla 1000 y tasa de aprendizaje 1e-4, sobre 2 GPUs con batch 16 (batch global 32). La model card señala que este batch es la mitad del empleado en otras ejecuciones de T-Rex, por lo que los resultados no son directamente comparables con ellos. No se documenta en la información disponible el uso de RLHF, DPO ni el volumen total de tokens de entrenamiento.

## Capacidades

- Generación de secuencias de acción robótica de 42 dimensiones por paso para control bimanual (dos brazos y dos manos diestras).
- Manipulación diestra bimanual: sostener un objeto con una mano y ejecutar una acción de tracción con la otra.
- Percepción multimodal: procesa tres flujos de cámara (cabeza-izquierda y ambas muñecas) a resolución 384x288.
- Fusión de señal táctil: integra fuerza en las puntas de los dedos y representaciones VQ-VAE por dedo, lo que permite políticas sensibles al contacto.
- Aprendizaje por imitación a partir de teleoperación con guante meta y seguimiento de muñeca Vive (sin exoesqueleto).
- Generación por chunks: predice 16 pasos de acción por inferencia, con recepción de observación real cada 16 pasos.
- No se documentan capacidades de tool calling, function calling, agentes, multilingüismo ni modos de pensamiento (thinking), por tratarse de una política robótica y no de un modelo conversacional.

## Casos de uso

- Extracción de pañuelos o materiales de un dispensador: la tarea objetivo del modelo, donde la mano izquierda estabiliza la caja y la derecha ejecuta la tracción; el modelo es directamente adecuado porque fue entrenado específicamente para esta secuencia.
- Manipulación diestra sensible al contacto: en tareas donde la fuerza aplicada determina el éxito (por ejemplo, sujetar objetos frágiles), la entrada táctil de 30-D permite modular la presión de los dedos.
- Manipulación bimanual con roles asimétricos: escenarios en los que una mano sujeta y la otra opera, aprovechando el espacio de acción de 42-D que controla ambos brazos y ambas manos de forma coordinada.
- Investigación en políticas de imitación con señal táctil: sirve como referencia para estudiar la contribución de la información táctil frente a enfoques puramente visuales, comparando con la variante GR00T-N1.7-3B sin táctil sobre el mismo split.
- Teleoperación y reproducción de habilidades: dado que el entrenamiento proviene de teleoperación con guante meta, el modelo puede emplearse para reproducir de forma autónoma habilidades demostradas manualmente.
- Plataforma de evaluación de bucle abierto: el checkpoint permite medir error de seguimiento de trayectoria en manos y brazos sobre episodios reservados, útil para iterar arquitecturas antes de pruebas en hardware.
- Reutilización como punto de partida para otras tareas de XHand1: al ser un afinamiento de un checkpoint intermedio, puede servir de base para nuevas tareas con la misma morfología de manos.

## Benchmarks y rendimiento

La model card publica error de bucle abierto sobre los episodios reservados (media ± error estándar). Manos: error absoluto medio entre predicción y comando sobre las 12 articulaciones de la mano (rad). Brazos: error de posición (cm) y rotación (grados) del efector final. El modelo recibe la observación real cada 16 pasos y se conservan los 16 pasos predichos.

| Métrica | Este modelo | GR00T-N1.7-3B (sin táctil), mismo split |
|---|---|---|
| Mano izquierda (rad) | 0,0272 ± 0,0034 | 0,0078 ± 0,0003 |
| Mano derecha (rad) | 0,0285 ± 0,0023 | 0,0116 ± 0,0004 |
| Posición izquierda (cm) | 0,86 ± 0,07 | 0,76 ± 0,03 |
| Posición derecha (cm) | 1,91 ± 0,11 | 1,33 ± 0,06 |
| Rotación izquierda (grados) | 1,64 ± 0,10 | 1,36 ± 0,06 |
| Rotación derecha (grados) | 3,64 ± 0,17 | 2,57 ± 0,11 |

La model card subraya que esta métrica mide seguimiento de trayectoria y no éxito de tarea, y que ninguno de los resultados se ejecutó en hardware. No se publican resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de lenguaje, dado que el modelo es una política robótica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 8,4 GB y contiene `model.pt` junto con el procesador y ficheros de estadísticas.
- GPU recomendadas: no se especifica el modelo de GPU usado; el entrenamiento se realizó sobre 2 GPUs con batch 16 (batch global 32) durante 10.000 pasos.
- Encaje en GPU de consumo: no disponible; al partir de un backbone Qwen3-VL-2B más expertos, el requisito real dependerá del número total de parámetros, que no se documenta.
- Opciones de despliegue: no se indican integraciones con vLLM, llama.cpp, Ollama o TGI; la carga requiere el código de T-Rex con la adaptación XHand (acción de 42-D y `tacf6_dim=3`), y la versión estándar que espera el layout Sharpa de 62-D no cargará estos pesos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (error bucle abierto) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (T-Rex + táctil, XHand1) | no disponible (backbone Qwen3-VL-2B + MoE) | no disponible | Manos 0,0272/0,0285 rad; pos 0,86/1,91 cm; rot 1,64/3,64 grados | other | HuggingFace |
| GR00T-N1.7-3B (sin táctil) | 3B (según nombre) | no disponible | Manos 0,0078/0,0116 rad; pos 0,76/1,33 cm; rot 1,36/2,57 grados | no disponible | Referencia en la model card |
| Otros checkpoints de T-Rex del mismo autor (por ejemplo, variantes gr00t3b260815/260816) | no disponible | no disponible | no disponible | other | HuggingFace |

En el mismo split reservado, GR00T-N1.7-3B (sin entrada táctil) obtiene errores menores en todas las métricas reportadas, si bien la model card advierte que este run de T-Rex usó la mitad del batch que otras ejecuciones y que sus resultados no son directamente comparables entre sí.

## Limitaciones y advertencias

- Las métricas publicadas miden seguimiento de trayectoria en bucle abierto, no éxito de tarea; no deben interpretarse como evidencia de que el robot completa la tarea.
- Ningún resultado se ha ejecutado en hardware real; no hay validación física del comportamiento.
- Los sesgos conocidos del modelo no se documentan; no se especifican sesgos de datos, demografía ni de otro tipo.
- Riesgo de alucinación: no aplicable en el sentido conversacional, pero existe riesgo de generar trayectorias fuera de distribución no documentado en la model card.
- La carga requiere código adaptado: la distribución estándar de T-Rex espera el layout Sharpa de 62-D y no cargará estos pesos; es necesaria la variante XHand (42-D, `tacf6_dim=3`).
- Los resultados no son directamente comparables con otras ejecuciones de T-Rex del mismo autor, ya que este entrenamiento empleó la mitad de batch.
- Conjunto de datos reducido (120 episodios, 108 de entrenamiento) y una única semilla (1000), lo que limita la generalización y la robustez estadística.
- Licencia "other": las condiciones concretas de uso comercial no se detallan en la información disponible y deben consultarse con el autor.
- Idiomas soportados y longitud de contexto: no disponibles; el modelo no es un modelo de lenguaje de propósito general.
- El repositorio tiene 0 descargas y 0 likes, por lo que no existe validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tarzanagh/ckpt_tissuepickteleop_pull_4cam260918_trextactile260925
- Run relacionado (mismo modelo): https://huggingface.co/tarzanagh/ckpt_tissuepickteleop_pull_4cam260918_trextactile260925
- Otro checkpoint del autor: https://huggingface.co/tarzanagh/ckpt_psspteleop_pickfromscale_4cam260629-260708_gr00t3b260816
- Otro checkpoint del autor: https://huggingface.co/tarzanagh/ckpt_psspteleop_pickfromscale_4cam260810-260811_gr00t3b260815
- Página personal del autor: https://tarzanagh.github.io/
