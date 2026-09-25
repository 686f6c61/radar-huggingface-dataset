# tarzanagh/ckpt_mugbackpackteleop_place_4cam260918_trextactile260924

## Resumen

Este repositorio contiene un checkpoint de política robótica para manipulación bimanual diestra, publicado por el usuario tarzanagh en Hugging Face. La política, denominada T-Rex con entrada táctil, permite a un robot DexMate Vega-1 equipado con dos manos RobotEra XHand1 sujetar una mochila con la mano izquierda y depositar un vaso en su interior con la derecha. Los datos se capturaron mediante teleoperación con guante Meta y seguimiento de muñeca con Vive, sin exoesqueleto.

La arquitectura parte de un backbone Qwen3-VL-2B al que se añaden expertos de mezcla de transformers, acoplamiento de flujo en cascada (cascaded flow matching) y el mecanismo FLARE, y se afina desde el checkpoint midtrain publicado del proyecto T-Rex. El modelo consume tres cámaras (cabeza-izquierda y ambas muñecas, a 384x288) más una señal táctil de 30 dimensiones, y emite acciones de 42 dimensiones en chunks de 16 pasos.

Su relevancia es experimental: sirve como punto de comparación controlado frente a variantes sin tacto del mismo conjunto de datos (GR00T-N1.7-3B, pi0.5, ACT y diffusion policy) publicadas como checkpoints hermanos. No es un modelo listo para producción: requiere una adaptación específica del código T-Rex para cargar los pesos y no se ha validado en hardware.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | T-Rex: backbone Qwen3-VL-2B con mezcla de expertos transformer, cascaded flow matching y FLARE, más rama táctil (vector de fuerza y códigos VQ-VAE por dedo) |
| Parámetros totales | no disponible (el backbone es Qwen3-VL-2B; no se publica el recuento total con los expertos) |
| Parámetros activos | no disponible (arquitectura MoE sin desglose de parámetros activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (se publican pesos sin cuantizaciones alternativas) |
| Idiomas soportados | no disponible (modelo de robótica; no se declaran idiomas) |
| Licencia | other (términos no especificados en la model card) |
| Formato de pesos | model.pt (PyTorch), junto con processor/, training_args.json y stats_data.json |
| Tamaño del repositorio | 8,4 GB |
| Entrada multimodal | 3 cámaras (cabeza-izquierda, muñeca izquierda, muñeca derecha) a 384x288 + tacto de 30 dimensiones |
| Espacio de acción | 42 dimensiones por paso = 2 x (pose de efector final de 9 D en el sistema del inicio del chunk + 12 objetivos articulares absolutos de mano), chunk de 16 |

## Arquitectura y entrenamiento

El modelo se construye sobre T-Rex, que combina un backbone visión-lenguaje Qwen3-VL-2B con una mezcla de expertos transformer y un esquema de generación de acciones basado en cascaded flow matching y FLARE. La rama táctil codifica la fuerza en la punta de los dedos como un vector de 30 dimensiones (10 dedos x 3 ejes) y, además, como códigos VQ-VAE por dedo con K=64 y ventana de 16. La salida es un chunk de 16 pasos de acción de 42 dimensiones, entrenado contra demostraciones de teleoperación.

Los datos proceden de 31 episodios de la tarea de colocar un vaso dentro de una mochila, divididos en 27 para entrenamiento y 4 retenidos (uno de cada diez). El entrenamiento se ejecutó durante 10.000 pasos con semilla 1000, tasa de aprendizaje 1e-4 y 4 GPUs con batch de 16 por GPU (batch global de 64). No se documenta en la información disponible el número total de tokens de entrenamiento, la composición completa del dataset ni si hubo etapas de RLHF o DPO; el modelo parte del checkpoint midtrain publicado y se afina de forma supervisada sobre las demostraciones.

Es destacable que el cálculo de acciones se hace en el sistema de referencia del inicio del chunk y que la posición de las manos se predice como objetivos articulares absolutos, lo que evita derivar la pose relativa paso a paso. La evaluación publicada es de bucle abierto: el modelo observa la observación real cada 16 pasos y se conservan las 16 predicciones intermedias.

## Capacidades

- Generación de acciones de manipulación bimanual: 42 dimensiones por paso, con 9 D de pose de efector final por brazo en el sistema del inicio del chunk y 12 objetivos articulares absolutos por mano.
- Manipulación diestra con manos XHand1: control articular de dedos, no solo de pinza.
- Percepción visomotora con tres cámaras: cabeza-izquierda y ambas muñecas a 384x288.
- Fusión táctil: incorpora fuerza en la punta de los dedos (30 D) y representaciones discretas aprendidas (VQ-VAE, K=64, ventana 16) por dedo.
- Ejecución por chunks: planificación de 16 pasos por inferencia, con reobservación cada 16 pasos en la evaluación de bucle abierto.
- Aprendizaje por imitación desde teleoperación: replica una tarea específica aprendida de demostraciones humanas con guante Meta y seguimiento Vive.
- Soporte de tool calling / function calling: no disponible (no es una capacidad de este tipo de modelo).
- Soporte de agentes y razonamiento multi-paso: no disponible (no es una capacidad de este tipo de modelo).
- Capacidades multilingües: no disponible.
- Capacidades especiales: modo de pensamiento, visión general o audio no disponibles; la única modalidad adicional confirmada es el tacto.

## Casos de uso

- Replicación del experimento de referencia: ejecutar la secuencia bimanual de sostener una mochila con la mano izquierda y colocar un vaso con la derecha en un DexMate Vega-1 con manos XHand1, usando exactamente la configuración de tres cámaras descrita.
- Investigación sobre el valor del tacto en políticas visomotoras: comparar este checkpoint con su hermano GR00T-N1.7-3B sin tacto sobre el mismo split retenido permite aislar el efecto de la señal táctil en el tracking de trayectoria.
- Evaluación de métodos de imitación sobre un mismo dataset: el conjunto de checkpoints hermanos (pi0.5, ACT, diffusion policy, con y sin tacto) permite montar una comparativa controlada de familias de políticas sobre 31 episodios idénticos.
- Fine-tuning a nuevas tareas bimanuales de precisión: al predecir objetivos articulares absolutos de mano y fuerza táctil, el modelo es un punto de partida razonable para tareas de inserción o colocación que requieran control fino de dedos.
- Validación de pipelines de teleoperación: el propio flujo de captura (guante Meta y seguimiento Vive, sin exoesqueleto) puede reutilizarse para grabar nuevos episodios y reentrenar el modelo con el mismo formato de acción.
- Estudio de esquemas de chunking en control robótico: con chunks de 16 pasos y reobservación cada 16, sirve para medir cómo degrada el error de bucle abierto a lo largo del horizonte de predicción.
- Control táctil reactivo en simulación: la señal de fuerza por dedo puede emplearse para detectar contacto y ajustar la colocación del objeto antes de soltarlo, dentro de un bucle de evaluación simulado.
- Docencia y reproducción de resultados en robótica: el repositorio es pequeño (8,4 GB) y contiene todos los artefactos de entrenamiento, lo que facilita reproducir el análisis de error en un entorno académico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar de lenguaje (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que se trata de una política robótica. El único dato cuantitativo publicado es el error de bucle abierto sobre los episodios retenidos:

| Métrica | Este modelo (T-Rex + táctil) | GR00T-N1.7-3B (sin táctil), mismo split |
|---|---|---|
| Mano izquierda, error articular medio (rad) | 0,0360 ± 0,0068 | 0,0085 ± 0,0003 |
| Mano derecha, error articular medio (rad) | 0,0387 ± 0,0035 | 0,0110 ± 0,0004 |
| Posición L, error de efector final (cm) | 0,84 ± 0,05 | 0,76 ± 0,01 |
| Posición R, error de efector final (cm) | 1,27 ± 0,10 | 1,05 ± 0,03 |
| Rotación L, error de efector final (grados) | 2,21 ± 0,21 | 1,61 ± 0,11 |
| Rotación R, error de efector final (grados) | 3,53 ± 0,25 | 2,44 ± 0,13 |

Los valores son media ± error estándar sobre los episodios retenidos (4 episodios). La propia model card advierte de que esta métrica mide seguimiento de trayectoria y no éxito de tarea, y de que ninguna prueba se ejecutó en hardware real. En todos los ejes, el baseline GR00T-N1.7-3B sin tacto obtiene menor error que este checkpoint.

## Requisitos de hardware

- VRAM para inferencia: no disponible. No se publica ningún requisito de memoria ni cifra de latencia o throughput.
- GPU empleadas en entrenamiento: 4 GPUs con batch 16 por GPU (batch global 64); el modelo exacto de GPU no se especifica en la información disponible.
- GPU recomendadas: no disponible. El backbone es Qwen3-VL-2B más expertos, por lo que cabe esperar que quepa en GPUs de gama alta de consumo (por ejemplo, RTX 4090), pero esto es una estimación orientativa no confirmada por el autor.
- Tamaño del repositorio: 8,4 GB, incluyendo model.pt, processor/, training_args.json y stats_data.json.
- Opciones de despliegue: no disponible. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, y estas herramientas no son directamente aplicables a una política robótica de acción continua.
- Requisito de código: es imprescindible usar la adaptación XHand del código T-Rex (acción de 42 D, `tacf6_dim=3`). La versión publicada estándar espera el layout Sharpa de 62 D y no cargará estos pesos.
- Latencia y throughput: no disponible. Lo único conocido es que la política predice chunks de 16 pasos y reobserva cada 16 pasos en la evaluación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en el split retenido | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| T-Rex + táctil (este checkpoint) | backbone Qwen3-VL-2B + expertos MoE; total no disponible | no disponible | Peor tracking que el baseline sin tacto en los seis ejes medidos | other | Repositorio de 8,4 GB; requiere adaptación XHand del código |
| GR00T-N1.7-3B (sin táctil) | 3B (según denominación) | no disponible | Mejor tracking en los seis ejes: mano 0,0085/0,0110 rad, posición 0,76/1,05 cm, rotación 1,61/2,44 grados | no disponible | Checkpoint hermano publicado |
| pi0.5 (con y sin táctil) | no disponible | no disponible | no disponible en la información proporcionada | no disponible | Checkpoints hermanos publicados |
| ACT y diffusion policy (con y sin táctil) | no disponible | no disponible | no disponible en la información proporcionada | no disponible | Checkpoints hermanos publicados |

## Limitaciones y advertencias

- Rendimiento inferior al baseline sin tacto: en los seis ejes de error publicados, GR00T-N1.7-3B sin señal táctil obtiene menor error que este modelo. La incorporación de tacto no se traduce en mejor tracking en esta evaluación.
- La métrica publicada no mide éxito de tarea: el error de bucle abierto sobre trayectorias no garantiza que la tarea de colocar el vaso se complete. No se ha ejecutado ninguna prueba en hardware real.
- Base estadística muy reducida: 31 episodios en total y solo 4 retenidos, lo que hace que los intervalos de error sean amplios y poco representativos de variabilidad real.
- Sesgo de dominio: el modelo está entrenado sobre una única tarea, un único robot (DexMate Vega-1 con manos XHand1) y un único montaje de cámaras. Se espera un sobreajuste fuerte a esa configuración.
- Riesgo de alucinación: en el sentido habitual del término, no aplica; el riesgo equivalente es la predicción de trayectorias plausibles pero incorrectas cuando la escena se aleja de las demostraciones.
- Compatibilidad rota con el release estándar: los pesos no cargan con la versión pública de T-Rex, que asume el layout Sharpa de 62 D. Es necesario disponer de la adaptación XHand.
- Licencia restrictiva o indeterminada: la licencia es "other" y no se detallan los términos. No hay confirmación de permiso para uso comercial; debe consultarse con el autor antes de cualquier uso productivo.
- Idiomas y contexto: no disponibles, por lo que no se puede evaluar ningún comportamiento lingüístico ni límite de ventana.
- Falta de validación comunitaria: 0 descargas y 0 "likes" en el momento de la consulta; no hay informes externos de reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tarzanagh/ckpt_mugbackpackteleop_place_4cam260918_trextactile260924
- Checkpoint hermano GR00T-N1.7-3B sin tacto: https://huggingface.co/tarzanagh/ckpt_mugbackpackteleop_place_4cam260918_gr00t3b260924
- Checkpoint hermano GR00T 3B con tacto: https://huggingface.co/tarzanagh/ckpt_mugbackpackteleop_place_4cam260918_gr00t3btactile260924
- Checkpoint hermano pi0.5: https://huggingface.co/tarzanagh/ckpt_mugbackpackteleop_place_4cam260918_pi05260924
- Checkpoint hermano pi0.5 con tacto: https://huggingface.co/tarzanagh/ckpt_mugbackpackteleop_place_4cam260918_pi05tactile260924
- Checkpoint hermano ACT: https://huggingface.co/tarzanagh/ckpt_mugbackpackteleop_place_4cam260918_act260924
- Checkpoint hermano ACT con tacto: https://huggingface.co/tarzanagh/ckpt_mugbackpackteleop_place_4cam260918_acttactile260924
- Checkpoint hermano diffusion policy: https://huggingface.co/tarzanagh/ckpt_mugbackpackteleop_place_4cam260918_dp260925
- Checkpoint hermano diffusion policy con tacto: https://huggingface.co/tarzanagh/ckpt_mugbackpackteleop_place_4cam260918_dptactile260925
- Listado de modelos con la etiqueta dexmate-vega en Hugging Face: https://huggingface.co/models?other=dexmate-vega
- Paper o repositorio del proyecto T-Rex: no disponible en la información proporcionada.
- Otros resultados de la búsqueda web (Tencent Hunyuan 3D, Civitai, Model Zoo, así como el checkpoint tarzanagh/ckpt_psspteleop_putaside_4cam260629-260708_gr00t3b260816) no guardan relación con esta ficha y no se han incluido como fuentes técnicas.
