# THU-SIGS-EILAB/Pi05_few_shot_libero

## Resumen

El modelo `Pi05_few_shot_libero` es un conjunto de diez checkpoints completos del modelo de visión-lenguaje-acción (VLA) PI0.5, afinados con pocas muestras (few-shot) sobre el benchmark de manipulación robótica LIBERO. Ha sido desarrollado por THU-SIGS-EILAB (Tsinghua SIGS Embodied Intelligence) y se distribuye a través de Hugging Face. El objetivo es proporcionar a la comunidad investigadora una serie de puntos de control intermedios y finales que permitan estudiar la evolución del aprendizaje durante el ajuste fino, así como reutilizar el modelo para inferencia o como inicialización de nuevos entrenamientos.

El modelo base PI0.5, descrito en el artículo arXiv 2504.16054, es un VLA que co-entrena con datos heterogéneos (demostraciones robóticas, datos web y subtareas semánticas) para lograr generalización en tareas de manipulación de largo horizonte. Este paquete concreto se centra en el benchmark LIBERO, que incluye cuatro suites: `libero_spatial`, `libero_object`, `libero_goal` y `libero_10`. Cada checkpoint se guarda cada 2.000 pasos, desde el paso 2.000 hasta el 20.000, e incluye su propio directorio de evaluación reconstruido. Los checkpoints de los pasos 12.000 a 20.000 tienen evaluación completa de las cuatro suites (500 trayectorias por suite), mientras que los pasos 2.000 a 10.000 solo cubren las suites Spatial y Object, con los resultados de Goal y LIBERO-10 marcados explícitamente como `missing` (no se infirieron ni fabricaron datos).

El paquete está pensado para usarse con la infraestructura RLinf, que incluye un cargador nativo de checkpoints de OpenPI. No se requieren pesos de un modelo base adicional, ya que cada `full_weights.pt` es un state dict completo. La licencia es Apache 2.0, y el tamaño total del repositorio es de 85,3 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en PI0.5 (no se especifican detalles de capas o atención) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en formato nativo de RLinf, `full_weights.pt`) |
| Idiomas soportados | no disponible (el modelo procesa instrucciones en inglés, pero no se especifica) |
| Licencia | Apache 2.0 (para los materiales RLinf; se deben respetar las licencias de PI0.5/OpenPI y LIBERO) |
| Formato de pesos | `full_weights.pt` (state dict completo, formato nativo de RLinf/OpenPI) |

## Arquitectura y entrenamiento

El modelo base PI0.5 es un VLA que extiende Pi0 mediante co-entrenamiento en datos heterogéneos: demostraciones robóticas, datos web y subtareas semánticas. Esto permite una generalización de mundo abierto para manipulación robótica de largo horizonte. El ajuste fino few-shot se realizó sobre el benchmark LIBERO, seleccionando 10 episodios por tarea de cada una de las cuatro suites, lo que resultó en 400 episodios y 66.481 fotogramas. La dimensión del estado es 8 y la de la acción es 7. La semilla de muestreo fue 42.

El entrenamiento se llevó a cabo con la infraestructura RLinf, que es un sistema de RL de código abierto para IA encarnada y agéntica. Se generaron checkpoints cada 2.000 pasos hasta el paso 20.000. Cada checkpoint incluye las estadísticas de normalización (`norm_stats.json`) correspondientes al conjunto few-shot, que son imprescindibles para mantener el contrato de entrada/salida de la política. No se incluyen shards DCP ni estado de optimizador, por lo que el paquete está destinado a inferencia, evaluación o inicialización de modelos, no a reanudar entrenamiento exacto.

El protocolo de evaluación común utiliza 10 tareas por suite, 50 episodios por tarea (500 trayectorias por suite), semilla de evaluación 195, estados de reinicio fijos y ordenados, diez pasos de denoising, nivel de ruido 0.5 y cinco chunks de acción por inferencia.

## Capacidades

- Control de manipulación robótica en entornos simulados LIBERO (cuatro suites: espacial, objeto, objetivo y LIBERO-10).
- Ejecución de tareas de largo horizonte a partir de instrucciones en lenguaje natural y observaciones visuales.
- Generación de acciones continuas de 7 dimensiones (posición y orientación del efector, más apertura de pinza).
- Ajuste fino few-shot: el modelo ha sido adaptado con solo 10 episodios por tarea, demostrando capacidad de aprendizaje eficiente con pocos datos.
- Inferencia con múltiples pasos de denoising (diez) y predicción por chunks de acción (cinco), lo que permite un control suave y reactivo.
- No se mencionan capacidades de tool calling, agentes ni razonamiento simbólico; es un modelo puramente orientado a control motor.

## Casos de uso

- Investigación en aprendizaje por refuerzo para robótica: el paquete permite estudiar la evolución del rendimiento a lo largo del entrenamiento, comparando los checkpoints de diferentes pasos para analizar la dinámica de aprendizaje.
- Evaluación de políticas en LIBERO: los checkpoints con evaluación completa (pasos 12.000 a 20.000) pueden usarse como referencia para comparar nuevos algoritmos de ajuste fino o de RL.
- Inicialización de modelos para nuevos dominios: al ser state dicts completos, pueden servir como punto de partida para fine-tuning en otras tareas de manipulación, aprovechando el conocimiento previo de PI0.5.
- Reproducción de experimentos: los manifiestos y configuraciones incluidas (`metadata/`) permiten reproducir el entrenamiento y la evaluación, siempre que se ajusten las rutas de los archivos.
- Desarrollo de sistemas de control robótico en simulación: el modelo puede integrarse en pipelines de simulación para probar estrategias de control antes de transferirlas al mundo real.
- Benchmarking de infraestructuras de RL: al ser un paquete diseñado para RLinf, sirve para validar el funcionamiento de esta infraestructura en tareas de manipulación.

## Benchmarks y rendimiento

La siguiente tabla muestra la tasa de éxito (success-once) en las cuatro suites de LIBERO para cada checkpoint. Los pasos 2.000 a 10.000 solo tienen cobertura parcial (Spatial y Object); los pasos 12.000 a 20.000 tienen cobertura completa. El agregado para los checkpoints parciales se calcula solo sobre las dos suites completadas.

| Paso | Cobertura | Spatial | Object | Goal | LIBERO-10 | Agregado* |
|---:|---:|---:|---:|---:|---:|---:|
| 2.000 | 2/4 | 0,122 | 0,394 | — | — | 0,258 |
| 4.000 | 2/4 | 0,440 | 0,610 | — | — | 0,525 |
| 6.000 | 2/4 | 0,694 | 0,690 | — | — | 0,692 |
| 8.000 | 2/4 | 0,782 | 0,848 | — | — | 0,815 |
| 10.000 | 2/4 | 0,752 | 0,890 | — | — | 0,821 |
| 12.000 | 4/4 | 0,776 | 0,822 | 0,748 | 0,488 | 0,709 |
| 14.000 | 4/4 | 0,746 | 0,862 | 0,774 | 0,468 | 0,713 |
| 16.000 | 4/4 | 0,762 | 0,922 | 0,728 | 0,480 | 0,723 |
| 18.000 | 4/4 | 0,702 | 0,818 | 0,584 | 0,522 | 0,656 |
| 20.000 | 4/4 | 0,848 | 0,878 | 0,742 | 0,566 | 0,758 |

\* Para checkpoints parciales, el agregado cubre solo las dos suites completadas.

No se han publicado resultados comparativos con otros modelos VLA en LIBERO dentro de la información proporcionada.

## Requisitos de hardware

- El tamaño total de los pesos es de 85,3 GB (diez checkpoints de aproximadamente 8,5 GB cada uno). Esto sugiere que cada checkpoint requiere una GPU con al menos 16-24 GB de VRAM para cargar los pesos en precisión completa, aunque no se especifica la precisión exacta.
- No se proporcionan requisitos concretos de VRAM, GPUs recomendadas ni latencia. Dado que es un modelo VLA de gran tamaño, se necesitaría al menos una GPU de gama alta (por ejemplo, A100, H100 o RTX 4090) para inferencia en tiempo real, y posiblemente múltiples GPUs para entrenamiento.
- El paquete está diseñado para usarse con RLinf, que soporta despliegue en entornos de simulación robótica. No se mencionan opciones como vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje generativo estándar.
- Para verificar la integridad de los archivos, se recomienda ejecutar `sha256sum -c SHA256SUMS`, lo que puede tardar varios minutos en almacenamiento de red.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa con otros modelos VLA (como OpenVLA, RT-2 o el propio Pi0) en el benchmark LIBERO. Los resultados presentados son exclusivos de este paquete y no se han contrastado con otras implementaciones en la documentación proporcionada. Se recomienda consultar el artículo de PI0.5 para comparaciones con el estado del arte en otros entornos.

## Limitaciones y advertencias

- Los checkpoints de los pasos 2.000 a 10.000 no tienen evaluación en las suites Goal y LIBERO-10; los resultados están marcados como `missing` y no se debe asumir ningún valor.
- El modelo está afinado específicamente para LIBERO; su generalización a otros entornos o tareas fuera de este benchmark no está garantizada y requeriría un nuevo ajuste.
- Las estadísticas de normalización incluidas son específicas del conjunto few-shot; sustituirlas por las de otro checkpoint de PI0.5 altera el contrato de entrada/salida de la política.
- El paquete no incluye estado de optimizador ni shards DCP, por lo que no es adecuado para reanudar un entrenamiento exacto.
- Aunque la licencia de los materiales RLinf es Apache 2.0, los usuarios deben cumplir con las licencias y requisitos de atribución de PI0.5/OpenPI y LIBERO.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado con datos de demostración, puede heredar sesgos de los entornos simulados y de las instrucciones utilizadas.
- El riesgo de alucinación en el contexto robótico se manifiesta como ejecución de acciones incorrectas o inestables; se recomienda validar el modelo en simulación antes de cualquier despliegue físico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/THU-SIGS-EILAB/Pi05_few_shot_libero
- Organización THU-SIGS-EILAB: https://huggingface.co/THU-SIGS-EILAB
- Paper de PI0.5: https://arxiv.org/abs/2504.16054
- Repositorio RLinf: https://github.com/RLinf/RLinf
- Repositorio openpi05 (fine-tuning e inferencia): https://github.com/Integer003/openpi05
- Página de PI0.5 en Qualcomm AI Hub: https://aihub.qualcomm.com/models/pi05
