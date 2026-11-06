# twanghcmut/cosmos3-edge-so101-left-arm-task3

## Resumen

Cosmos3-Edge SO101 left-arm task3 es un ajuste fino (post-entrenamiento) del modelo fundacional de robótica NVIDIA Cosmos3-Edge, convertido en una política de acción (action policy) para un brazo robótico SO101. Lo desarrolla el usuario twanghcmut y se entrenó sobre el dataset `hungho77/so101-left-arm-task3`, compuesto por 3 tareas y 159 episodios. El modelo resuelve una tarea muy concreta: predecir secuencias de posiciones articulares a partir de observaciones visuales y de estado, siguiendo el paradigma de los modelos visión-lenguaje-acción aplicados al control robótico.

El modelo parte de la receta LIBERO del framework oficial de NVIDIA (`cosmos-framework`) y sustituye los módulos de acción por unos nuevos entrenados desde cero. La arquitectura subyacente es la del modelo Edge de Cosmos3, que procesa vídeo mediante un VAE de Wan2.2 y genera acciones con un esquema de difusión. La salida son 6 dimensiones de posición absoluta de articulaciones (5 articulaciones más pinza), en chunks de 16 acciones a 30 FPS.

Su relevancia es acotada pero ilustrativa: es un ejemplo reproducible de cómo adaptar un modelo fundacional de robótica a un hardware concreto (brazo SO101) con un coste de entrenamiento moderado (10,2 horas en una sola H100). No obstante, sus resultados en bucle abierto quedan por detrás de alternativas como GR00T N1.7 y π0.5, y el propio autor señala que el entrenamiento probablemente está incompleto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo fundacional de robótica Cosmos3-Edge (difusión sobre representación latente de vídeo con VAE Wan2.2); política de acción con módulos de acción entrenados desde cero |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible (la condicion es un frame de estado más vídeo `concat_view` 256×256 por cámara) |
| Tipos de cuantizacion | no disponible (checkpoint en formato DCP, sin versiones GGUF/cuantizadas publicadas) |
| Idiomas soportados | no disponible (modelo orientado a acción robótica, no a texto) |
| Licencia | OpenMDW 1.1 |
| Formato de pesos | DCP (checkpoint de entrenamiento distribuido); requiere `Wan2.2_VAE.pth` externo |

## Arquitectura y entrenamiento

El modelo se construye sobre Cosmos3-Edge, un modelo fundacional de robótica de NVIDIA, y se adapta mediante la receta `action_policy_so101_edge`, derivada de la receta LIBERO (`action_policy_libero_nano`). Los módulos de acción se inicializan desde cero. La entrada visual se compone en un `concat_view` con la cámara superior a la izquierda y la cámara de muñeca a la derecha, cada una a 256×256 píxeles. La representación de vídeo se obtiene con el VAE de Wan2.2 (no incluido en el repositorio).

La acción se define como posición absoluta de 6 dimensiones (5 articulaciones más pinza), con las articulaciones escaladas por π/180 y la pinza dividida por 100, sin normalización adicional. El estado en el frame de condicionamiento se usa como primera fila de acción. Se generan chunks de 16 acciones a 30 FPS, con el embodiment `so101_joint` (dominio 25). El entrenamiento usó learning rate 5e-5, 500 pasos de warmup y decaimiento lineal a 0 hasta el paso 6000, con EMA de tipo power. El batch efectivo fue de 128 (32 × 4 pasos de acumulación), 6000 pasos en una H100 durante 10,2 horas, con pérdida final de aproximadamente 0,9.

## Capacidades

- Predicción de acciones robóticas: genera chunks de 16 posiciones articulares absolutas (5 articulaciones más pinza) a partir de observaciones visuales y de estado.
- Control de un brazo SO101 concreto (embodiment `so101_joint`), entrenado específicamente para 3 tareas del dataset `so101-left-arm-task3`.
- Procesamiento de vídeo multi-cámara: combina vistas de cámara superior y de muñeca en una única entrada `concat_view`.
- Generación por difusión con parámetros de muestreo configurables (pasos, guidance, shift, seed).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, multilingüismo ni modalidades de audio o texto generativo.

## Casos de uso

- Evaluación de políticas robóticas en bucle abierto: el modelo se usa para medir el error de predicción de acciones frente a trayectorias de referencia del dataset, con el script `eval_action_policy_so101_open_loop` y la métrica MAE sobre las primeras 16 acciones.
- Investigación en adaptación de modelos fundacionales: sirve como referencia reproducible de cómo aplicar la receta LIBERO de Cosmos a un brazo de bajo coste como el SO101, con un presupuesto de cómputo de una sola GPU H100.
- Comparación de arquitecturas de políticas de acción: al compartir protocolo de evaluación con GR00T N1.7 y π0.5 sobre el mismo dataset, permite contrastar el rendimiento de Cosmos3-Edge frente a otras familias en una tarea idéntica.
- Prototipado de manipulación con un brazo SO101: el modelo puede integrarse en un pipeline de control que consuma predicciones de 16 acciones a 30 FPS, siempre que se valide antes en bucle cerrado.
- Estudio del efecto del número de pasos de entrenamiento: el repositorio incluye checkpoints en los pasos 4000 y 6000, lo que permite analizar la curva de aprendizaje y la infraentrenamiento de la receta.
- Base para ajustes posteriores: al estar liberado bajo OpenMDW 1.1 y con la configuración de entrenamiento resuelta (`config.yaml`, TOML de la ejecución), puede reutilizarse como punto de partida para otras tareas o variantes del mismo brazo.

## Benchmarks y rendimiento

Resultados en bucle abierto según el protocolo del autor (trayectorias 0, 25, 51, 80, 108 y 133; pasos de 16 frames hasta 400; MAE de las primeras 16 acciones en unidades del dataset y como porcentaje de la desviación estándar absoluta de la acción, 29,97):

| Modelo | MAE | % std |
|---|---|---|
| GR00T N1.7 | 1,440 | 4,80 |
| π0.5 | 1,459 | 4,87 |
| Cosmos3-Edge, paso 6000 (este repo) | 1,911 | 6,38 |
| Cosmos3-Edge, paso 4000 | 2,444 | 8,15 |

Ajustes de muestreo en el paso 6000 (por defecto: 30 pasos, guidance 1, shift 5, seed 0):

| Configuración | MAE | % std |
|---|---|---|
| Por defecto | 1,911 | 6,38 |
| Seed 1 | 1,944 | 6,49 |
| 10 pasos | 1,908 | 6,37 |
| 50 pasos | 1,940 | 6,47 |
| Guidance 1,5 | 1,942 | 6,48 |
| Guidance 2 | 1,959 | 6,54 |
| Shift 3 | 1,943 | 6,48 |
| Shift 10 | 1,907 | 6,36 |

Observaciones del autor: el paso 6000 mejora al 4000 en todas las trayectorias y la pérdida seguía bajando al final, por lo que el modelo probablemente está infraentrenado. El error es mayor en las articulaciones de codo (2,41) y flexión de muñeca (2,58), y crece a lo largo del chunk (0,95 en la primera acción, 2,89 en la decimosexta). Todas las configuraciones de muestreo quedan dentro de la variabilidad entre dos semillas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 27,0 GB e incluye pesos en DCP más estado de scheduler y trainer; el VAE de Wan2.2 debe descargarse aparte.
- GPU de entrenamiento documentada: 1× H100 para 6000 pasos en 10,2 horas.
- GPU recomendadas para inferencia: no se especifican; por el tamaño del checkpoint y el uso de un VAE de vídeo, se requiere una GPU de datacenter con memoria amplia. No hay datos publicados sobre ejecución en GPU de consumo.
- Despliegue: no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; la evaluación se realiza con el script `eval_action_policy_so101_open_loop` del fork `so101-edge-policy` de `cosmos-framework`, cargando el checkpoint DCP directamente.
- Latencia y throughput: no disponibles. El autor solo indica que la inferencia con 10 pasos de muestreo obtiene una precisión equivalente a 30 pasos, lo que reduce el coste de cómputo sin degradar el MAE.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MAE (protocolo SO101 task3) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cosmos3-Edge SO101 left-arm task3 (este repo) | no disponible | no disponible | 1,911 (6,38 % std) | OpenMDW 1.1 | Hugging Face, pesos DCP |
| GR00T N1.7 SO101 left-arm task3 | no disponible | no disponible | 1,440 (4,80 % std) | no disponible | Hugging Face (`twanghcmut/gr00t-n1d7-so101-left-arm-task3`) |
| π0.5 SO101 left-arm task3 | no disponible | no disponible | 1,459 (4,87 % std) | no disponible | Hugging Face (`twanghcmut/pi05-so101-left-arm-task3`) |

Los tres modelos se evalúan con el mismo protocolo de bucle abierto sobre el mismo dataset, lo que permite una comparación directa. Cosmos3-Edge queda por detrás de GR00T N1.7 y π0.5 en MAE, aunque el autor atribuye parte de la diferencia a un entrenamiento incompleto.

## Limitaciones y advertencias

- Especialización extrema: el modelo solo predice acciones para un brazo SO101 en 3 tareas concretas; no es un modelo de propósito general ni transferible sin reentrenamiento.
- Rendimiento inferior a alternativas: su MAE (1,911) es aproximadamente un 33 % peor que GR00T N1.7 (1,440) y π0.5 (1,459) en el mismo protocolo.
- Infraentrenamiento probable: la pérdida seguía descendiendo en el paso 6000 y el paso 4000 es peor en todas las trayectorias, según el propio autor.
- Degradación dentro del chunk: el error crece de 0,95 en la primera acción a 2,89 en la decimosexta, lo que limita el horizonte útil de predicción.
- Mayor error en articulaciones concretas: codo (2,41) y flexión de muñeca (2,58) concentran el error.
- Validación solo en bucle abierto: no se han publicado resultados en bucle cerrado sobre el robot físico, por lo que el rendimiento real de manipulación es desconocido.
- Dependencia externa: requiere el VAE `Wan2.2_VAE.pth` de Wan-AI/Wan2.2-TI2V-5B, no incluido en el repositorio.
- Formato de checkpoint no estándar: `export_model` no soporta esta receta, por lo que los pesos están en DCP y requieren el fork `so101-edge-policy` para su carga.
- Licencia OpenMDW 1.1: es una licencia de pesos abiertos con términos propios; debe revisarse su compatibilidad antes de un uso comercial.
- Sin datos de sesgos, idiomas ni alucinación textual: al ser un modelo de acción, estas categorías no aplican, pero tampoco se documenta robustez ante condiciones visuales fuera de distribución.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/twanghcmut/cosmos3-edge-so101-left-arm-task3
- Modelo base Cosmos3-Edge: https://huggingface.co/nvidia/Cosmos3-Edge
- Framework de entrenamiento: https://github.com/NVIDIA/cosmos-framework
- Fork con la receta SO101 (PR #1): https://github.com/hungho77/cosmos-framework/pull/1
- Dataset de entrenamiento: https://huggingface.co/datasets/hungho77/so101-left-arm-task3
- VAE Wan2.2: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Baseline GR00T N1.7: https://huggingface.co/twanghcmut/gr00t-n1d7-so101-left-arm-task3
- Baseline π0.5: https://huggingface.co/twanghcmut/pi05-so101-left-arm-task3
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
