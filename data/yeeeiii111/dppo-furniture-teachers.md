# yeeeiii111/dppo-furniture-teachers

## Resumen

El repositorio `yeeeiii111/dppo-furniture-teachers` contiene los checkpoints completos de fine-tuning con PPO (Proximal Policy Optimization) de políticas de difusión (diffusion policies) para tres tareas de ensamblaje de muebles del benchmark furniture-bench: `one_leg_low`, `round_table_low` y `lamp_low`. El autor, Qingxin Wang (usuario `yeeeiii111`), libera todos los checkpoints guardados de cada ejecución, no solo el utilizado, para que la comunidad pueda elegir su propio punto de operación según sus necesidades.

El modelo se basa en el framework DPPO (Diffusion Policy PPO) y parte de checkpoints preentrenados publicados por el propio DPPO. Cada ejecución usa semilla 42, con acción chunk de 8, 100 pasos de denoising y 5 pasos fine-tuned, empleando DDIM con `ddim_steps == ft_denoising_steps == 5`. Se incluyen también archivos de normalización y curvas de éxito completas. La relevancia de este recurso radica en que proporciona un conjunto de "teachers" de fuerza calibrada (tasas de éxito entre 0.937 y 0.942) para tareas de imitación o destilación, así como una escalera de checkpoints desde el baseline preentrenado hasta el mejor rendimiento (0.97–0.98).

El repositorio tiene un tamaño de 2.2 GB, está licenciado bajo MIT y utiliza PyTorch como librería. No se especifican parámetros totales, arquitectura de red subyacente ni otros detalles técnicos habituales en modelos de lenguaje, ya que se trata de un recurso específico para robótica y aprendizaje por refuerzo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion policy (red subyacente no especificada en la documentación) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | .pt (PyTorch) |

## Arquitectura y entrenamiento

El recurso consiste en checkpoints de políticas de difusión (diffusion policies) fine-tuneadas con PPO sobre el benchmark furniture-bench. La arquitectura exacta de la red (por ejemplo, U-Net o Transformer) no se detalla en la documentación proporcionada. El entrenamiento parte de los checkpoints preentrenados liberados por DPPO y aplica fine-tuning con PPO en tres tareas `low` de furniture-bench. Los hiperparámetros son: semilla 42, `ta8` (action chunk 8), `td100` (100 pasos de denoising), `tdf5` (5 pasos fine-tuned) y DDIM con `ddim_steps == ft_denoising_steps == 5`.

Cada checkpoint guarda un diccionario con `{'itr': int, 'model': state_dict}`, donde el state dict incluye `actor`, `actor_ft`, `critic`, `eta` y `network`. El crítico está incluido, lo que evita tener que re-entrenar la función de valor desde cero en tareas de recompensa dispersa. No se guardan momentos del optimizador, posición del scheduler de LR, estado de RNG ni estado del entorno, por lo que la reanudación no es bit-exacta.

## Capacidades

- Generación de acciones de control para tareas de ensamblaje de muebles en furniture-bench: `one_leg_low`, `round_table_low` y `lamp_low`.
- Fine-tuning de políticas de difusión mediante PPO, con soporte para reanudar entrenamiento desde cualquier checkpoint (incluye crítico).
- Proporciona una escalera de checkpoints desde el baseline preentrenado (state_0) hasta el mejor rendimiento, permitiendo elegir el punto de operación según la necesidad (teacher fuerte, débil o intermedio).
- Sirve como teacher fijo para tareas de imitación o destilación de políticas, con fuerza calibrada entre tareas (SR 0.937–0.942).
- Incluye curvas de éxito completas (`curves/*.pkl`) con evaluación cada 10 iteraciones, útil para análisis de convergencia.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües, al ser un modelo de control robótico.

## Casos de uso

- Investigación en aprendizaje por refuerzo robótico: usar los checkpoints como baseline para comparar nuevos algoritmos de RL o de fine-tuning de políticas de difusión, aprovechando que se liberan todas las iteraciones.
- Destilación de políticas: emplear los checkpoints seleccionados (por ejemplo, `state_250.pt` para one_leg) como teacher fijo para entrenar políticas student mediante imitación o regresión, manteniendo el teacher constante entre métodos.
- Fine-tuning para tareas similares: partir de un checkpoint preentrenado (state_0) o de uno intermedio para adaptar la política a variantes de las tareas de furniture-bench, reduciendo el tiempo de entrenamiento.
- Evaluación de robustez: comparar el rendimiento de diferentes checkpoints (desde SR 0.03 hasta 0.98) para estudiar la sensibilidad de la política a la cantidad de entrenamiento.
- Reanudación de entrenamiento: continuar el fine-tuning desde un checkpoint específico para explorar mejoras adicionales, aprovechando que el crítico ya está incluido.
- Análisis de curvas de aprendizaje: utilizar los archivos `curves/*.pkl` para estudiar la dinámica de convergencia de PPO en tareas de manipulación, con datos de evaluación cada 10 iteraciones.

## Benchmarks y rendimiento

La evaluación se realizó con el protocolo de DPPO: 1000 entornos paralelos, cada 10 iteraciones. El error estándar binomial es ≈0.005 a SR 0.97, por lo que diferencias por debajo de ~0.01 entre evaluaciones vecinas son ruido. Las tablas siguientes muestran las tasas de éxito (SR) para los checkpoints publicados.

### one_leg_low

| itr | 0 | 50 | 100 | 150 | 200 | 250 | 300 | 350 | 400 | 450 | 500 | 550 | 600 | 650 | 700 | 750 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SR | 0.413 | 0.774 | 0.905 | 0.940 | 0.944 | 0.939 | 0.962 | 0.948 | 0.955 | 0.943 | 0.949 | 0.965 | 0.973 | 0.973 | 0.980 | 0.972 |

### round_table_low

| itr | 0 | 50 | 100 | 150 | 200 | 250 | 300 | 350 | 400 | 450 | 500 | 550 | 600 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SR | 0.033 | 0.245 | 0.564 | 0.814 | 0.904 | 0.904 | 0.946 | 0.937 | 0.956 | 0.964 | 0.977 | 0.983 | 0.983 |

### lamp_low

| itr | 0 | 50 | 100 | 150 | 200 | 250 | 300 | 350 | 400 | 450 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SR | 0.030 | 0.323 | 0.562 | 0.776 | 0.875 | 0.916 | 0.933 | 0.942 | 0.949 | 0.965 |

La mejor evaluación de cada ejecución (no necesariamente en un checkpoint guardado) es: one_leg 0.982 @ itr 710, round_table 0.983 @ itr 520, lamp 0.975 @ itr 430. Los checkpoints recomendados por el autor para usar como teachers (primera meseta) son `state_250.pt` (SR 0.939), `state_350.pt` (SR 0.937) y `state_350.pt` (SR 0.942) respectivamente.

## Requisitos de hardware

- No se proporcionan requisitos específicos de hardware en la documentación.
- Los checkpoints son archivos `.pt` de PyTorch con un tamaño total de 2.2 GB, por lo que caben en la memoria de una GPU moderna (por ejemplo, 8 GB o más), aunque el uso real depende del entorno de inferencia o entrenamiento.
- No se indica latencia ni throughput estimados.
- Para inferencia o reanudación de entrenamiento se requiere un entorno con PyTorch y las dependencias de DPPO y furniture-bench. No se mencionan opciones de despliegue como vLLM u Ollama, ya que no es un modelo de lenguaje.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Este recurso es específico para robótica y RL, y no se han encontrado alternativas equivalentes en la búsqueda web. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Los checkpoints posteriores se han alejado del base preentrenado; si el método requiere que el teacher sea alcanzable desde la distribución de la política base congelada, un teacher más fuerte y más desviado puede ser peor que uno más débil. Hay que verificar la alcanzabilidad antes de asumir que mayor SR es mejor.
- No se deben intercambiar teachers a mitad de un proyecto: las líneas base medidas contra un teacher no son comparables con resultados contra otro.
- La reanudación del entrenamiento no es bit-exacta: no se guardan momentos del optimizador, posición del scheduler de LR, estado de RNG ni estado del entorno. Se espera una pequeña caída de rendimiento justo después de reiniciar.
- El recurso está limitado a las tres tareas `low` de furniture-bench; no es directamente aplicable a otras tareas sin fine-tuning adicional.
- No se han documentado sesgos ni riesgos de alucinación, al tratarse de un modelo de control robótico y no de lenguaje.
- La licencia MIT permite uso comercial, pero se recomienda revisar las licencias de las dependencias (furniture-bench, DPPO) si se utiliza en productos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/yeeeiii111/dppo-furniture-teachers
- furniture-bench: https://github.com/clvrai/furniture-bench
- DPPO: https://github.com/irom-lab/dppo
