# yyuncong/SyncWorld-mv3-strip384-recent8-step30000

## Resumen

SyncWorld-mv3-strip384-recent8-step30000 es un checkpoint final de un modelo del mundo (world model) orientado a robótica, desarrollado por el usuario yyuncong en el contexto del proyecto SyncWorld-dev. El modelo aborda el problema de la dinámica directa (forward dynamics) en entornos multivista: dado un fotograma ancla, un historial de observaciones y un conjunto de acciones comandadas, predice los siguientes 16 fotogramas de vídeo. Se enmarca en la línea de trabajo de Cosmos (NVIDIA), cuya licencia OpenMDW-1.1 adopta.

Técnicamente se apoya en la arquitectura de cosmos-framework-dev, un transformer de difusión con flujo de coincidencia (flow matching) sobre latentes de VAE y con atención completa; el checkpoint inicializa desde un run previo entrenado con tiras de 1536x384 píxeles que combinan tres cámaras (dos en tercera persona y una en la muñeca). La innovación principal es el condicionamiento en contexto (in-context): el modelo recibe K fragmentos de vídeo-acción observados (K entre 1 y 8) dentro de la misma ventana de atención que la consulta, sin memoria TTT.

El checkpoint corresponde a la variante "recent8" (los K fragmentos son los más recientes de la propia consulta), que sirve como línea base frente a una variante con recuperación por vecino más cercano. Se entrenó durante 30.000 actualizaciones en 4 nodos con 8 H100 cada uno. Su relevancia radica en que explora el condicionamiento en contexto para predicción de vídeo robótico multivista, una pieza clave para planificación y evaluación de políticas en simulación y en el mundo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión con flow matching (base cosmos-framework-dev), atención completa in-context, sin memoria TTT |
| Parametros totales | no disponible |
| Parametros activos | no disponible (el entrenamiento menciona `moe_gen`, lo que sugiere componente MoE, pero no se detalla el recuento) |
| Longitud de contexto | Ventana de atención que cubre 1 fotograma ancla + 16 acciones futuras + K fragmentos observados de 16 transiciones cada uno (K entre 1 y 8) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible (modelo de vídeo/robótica, sin procesamiento de lenguaje natural) |
| Licencia | OpenMDW-1.1 (etiquetada como `other` en HuggingFace) |
| Formato de pesos | DCP (estado del entrenador) convertido a bf16; incluye `config.pkl` y `training/recipe.toml` |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de cosmos-framework-dev: un transformer de difusión entrenado con flow matching sobre latentes de un VAE de vídeo, con proyecciones específicas para acciones. Cada consulta consiste en un fotograma ancla más sus 16 acciones comandadas futuras, y el modelo genera los 16 fotogramas siguientes. Antes de la consulta se sitúan K fragmentos observados de 16 transiciones vídeo-acción (K uniforme entre 1 y 8) como condicionamiento limpio dentro de la misma ventana de atención. La variante "recent8" selecciona los K fragmentos más recientes de la propia consulta; la trama de cada stream se mantiene fija para la consulta y todos sus fragmentos.

El entrenamiento parte del run `gripperhead-mv-strip384-4x3-fork174k-4x8` (iteración 43500) de cosmos-framework-dev, ya entrenado con los cuatro conjuntos de datos en formato de tiras de 1536x384. La optimización usa AdamW (betas 0,9/0,99, weight decay 0,05), LR 5e-5 tras un calentamiento lineal de 400 actualizaciones y luego constante; se entrenan `moe_gen`, el embedder temporal y las proyecciones de VAE y acción, con recálculo completo de activaciones y cómputo en bf16 con pesos maestros fp32. La escala es de 4 nodos x 8 H100 (HSDP: grupo FSDP de 8 vías por nodo, 4 réplicas), 1 stream por GPU (32 streams por actualización) y 30.000 actualizaciones totales. Los datos incluyen robocasa_v2 (10.478 grabaciones), robomimic_v2 (16.608), rlbench_wrist_mv (11.314, 1.061 trayectorias distintas) y droid (68.768, descartando grabaciones de más de 3.000 fotogramas), solo grabaciones de experto, con pesos 2:2:1:2. Cada stream aplica dropout de vista (una cámara 10 %, dos 5 %) y recortes verticales aleatorios (tercera persona 0,3-0,65; muñeca 0,5-1,0).

## Capacidades

- Predicción de vídeo futuro condicionada por acciones: genera 16 fotogramas a partir de un ancla y 16 acciones comandadas.
- Condicionamiento en contexto multivista: integra hasta 8 fragmentos de historial vídeo-acción en la misma ventana de atención.
- Manejo de tres cámaras simultáneas (dos en tercera persona y una en la muñeca) mediante tiras de 1536x384 con celdas de 512x384.
- Modelado de dinámica directa para robótica: relación acción-observación aprendida de datos de experto.
- Robustez a dropout de vista y recortes aleatorios gracias al entrenamiento con estas aumentaciones.
- No se documentan capacidades de lenguaje natural, tool calling, agentes ni razonamiento simbólico.

## Casos de uso

- Evaluación de políticas en simulación: el modelo predice la evolución visual de un entorno robótico dado un plan de acciones, lo que permite comparar políticas sin ejecutarlas físicamente y detectar fallos antes del despliegue.
- Planificación basada en modelo (model-based planning): dado un estado ancla y un historial reciente, se pueden simular múltiples secuencias de acciones y puntuar los resultados predichos para seleccionar la mejor trayectoria.
- Aumento de datos para entrenamiento de políticas: generar rollouts sintéticos multivista condicionados por acciones expertas para ampliar conjuntos de datos escasos en tareas concretas.
- Detección de anomalías en ejecución: comparar el vídeo predicho con el observado en tiempo real para identificar desviaciones que indiquen fallos de manipulación.
- Investigación en world models: servir como línea base "recent8" para comparar estrategias de recuperación de contexto (frente a la variante views-first) en experimentos de dinámica directa.
- Preentrenamiento y ajuste fino para robótica de manipulación: el checkpoint puede inicializar modelos que operen con configuraciones de tres cámaras en tareas de robocasa, robomimic, RLBench o DROID.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor solo reporta la pérdida de flow matching de vídeo de la consulta (`train@2/loss`), promediada sobre las 500 actualizaciones previas a cada hito:

| Actualización | 1000 | 2000 | 4000 | 8000 | 12000 | 16000 | 20000 | 24000 | 28000 | 30000 |
|---|---|---|---|---|---|---|---|---|---|---|
| loss | 0,0663 | 0,0661 | 0,0661 | 0,0656 | 0,0641 | 0,0633 | 0,0617 | 0,0629 | 0,0615 | 0,0618 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 30,3 GB en bf16, por lo que la inferencia requiere al menos ese orden de magnitud más activaciones y latentes de vídeo.
- GPU recomendadas: el entrenamiento usó H100 (4 nodos x 8 GPU); para inferencia se recomienda H100 o A100 de 80 GB.
- Cabe en GPU de consumo: no disponible; por el tamaño del checkpoint (30,3 GB en bf16) no es viable en GPUs de consumo sin cuantización, y no se documentan formatos cuantizados.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el formato es DCP del entrenador más `config.pkl` y `training/recipe.toml`, lo que implica usar el código de cosmos-framework-dev / SyncWorld-dev.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SyncWorld-mv3-strip384-recent8-step30000 (este) | no disponible | K fragmentos (1-8) + 16 acciones | World model de difusión multivista, condicionamiento in-context reciente | OpenMDW-1.1 | HuggingFace |
| SyncWorld-mv3-strip384-views-first-v10 | no disponible | K fragmentos + 16 acciones | Igual, con recuperación por vecino más cercano y vistas primero | OpenMDW-1.1 | HuggingFace (serie `yyuncong/SyncWorld-mv3-strip384-views-first-v10-step*`) |
| cosmos-framework-dev `gripperhead-mv-strip384-4x3-fork174k-4x8` | no disponible | no disponible | Run previo de cosmos-framework-dev en tiras 1536x384, sin condicionamiento in-context | OpenMDW-1.1 (proyecto Cosmos) | Repositorio de cosmos-framework-dev |

No se dispone de datos de benchmarks que permitan comparar rendimiento cuantitativo entre estas variantes.

## Limitaciones y advertencias

- Modelo especializado en vídeo robótico: no procesa lenguaje natural ni admite tool calling, agentes o razonamiento simbólico.
- Solo se entrenó con grabaciones de experto de cuatro conjuntos (robocasa_v2, robomimic_v2, rlbench_wrist_mv, droid), lo que limita la generalización a otras morfologías, cámaras o distribuciones de tareas.
- Riesgo de alucinación visual: como modelo generativo de difusión, puede producir fotogramas plausibles pero físicamente incorrectos, especialmente fuera de la distribución de entrenamiento.
- Horizonte limitado: genera 16 fotogramas por consulta; predicciones más largas requieren encadenamiento y acumulan error.
- Dependencia de la configuración de tres cámaras y del formato de tira 1536x384; desviarse de este layout degrada el rendimiento.
- La licencia OpenMDW-1.1 (etiquetada como `other` en HuggingFace) debe revisarse en el enlace de NVIDIA Cosmos antes de cualquier uso comercial.
- El formato de pesos es el estado DCP del entrenador, no un formato de inferencia estándar; requiere el código del proyecto para cargarlo.
- No hay información sobre sesgos demográficos o de otro tipo, ni sobre latencia en producción.

## Enlaces

- HuggingFace: https://huggingface.co/yyuncong/SyncWorld-mv3-strip384-recent8-step30000
- Licencia OpenMDW-1.1 (NVIDIA Cosmos): https://github.com/NVIDIA/Cosmos/blob/main/LICENSE
- Variante views-first: https://huggingface.co/yyuncong/SyncWorld-mv3-strip384-views-first-v10-step30000
