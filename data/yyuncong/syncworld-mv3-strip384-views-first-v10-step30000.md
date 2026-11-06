# yyuncong/SyncWorld-mv3-strip384-views-first-v10-step30000

## Resumen

SyncWorld-mv3-strip384-views-first-v10-step30000 es un checkpoint final de un modelo del mundo (world model) para robótica, desarrollado por el usuario yyuncong dentro del proyecto SyncWorld-dev. El modelo aprende la dinámica directa (forward dynamics) de escenas manipuladas: dado un fotograma ancla y una secuencia de acciones comandadas, genera los siguientes 16 fotogramas de vídeo correspondientes a tres cámaras simultáneas (dos en tercera persona y una en la muñeca del robot). Está pensado como componente de planificación y evaluación en pipelines de aprendizaje por imitación y control robótico.

Técnicamente se apoya en la arquitectura de cosmos-framework-dev (un transformer de difusión con flow matching y mezcla de expertos en el módulo generativo), inicializado desde el run strip384 `gripperhead-mv-strip384-4x3-fork174k-4x8` y afinado durante 30.000 actualizaciones en 4 nodos de 8 H100. La innovación central es el condicionamiento en contexto mediante recuperación (retrieval) de fragmentos de vídeo-acción de una biblioteca de 3,85 millones de chunks, con una regla de correspondencia de vistas que exige que las cámaras recuperadas estén a menos de 10 grados y 10 cm de las de la consulta.

El modelo es relevante ahora porque aborda uno de los cuellos de botella prácticos de los world models en robótica: mantener coherencia multi-vista y consistencia acción-vídeo sin memoria recurrente (TTT), usando atención completa sobre una ventana que mezcla la consulta con chunks observados. Su licencia OpenMDW-1.1 y su tamaño (30,3 GB en el repositorio) lo sitúan como un artefacto de investigación reproducible más que como un modelo listo para producto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión con flow matching y módulo generativo MoE (`moe_gen`), atención completa en contexto, sin memoria TTT |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (el modelo entrena `moe_gen`, pero no se publica el recuento) |
| Longitud de contexto | no disponible en tokens; la ventana de atención cubre 1 fotograma ancla + 16 acciones futuras + K chunks observados de 16 transiciones (K uniforme en 1..8) |
| Tipos de cuantización | no disponible (checkpoint en bf16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | no disponible (modelo de vídeo-acción, no lingüístico) |
| Licencia | OpenMDW-1.1 (`license: other`, enlace a la licencia de NVIDIA Cosmos) |
| Formato de pesos | DCP (Distributed Checkpoint) del trainer, convertido a bf16; incluye `config.pkl` y `training/recipe.toml` |

## Arquitectura y entrenamiento

El modelo parte de un transformer de difusión con flow matching entrenado sobre tiras de vídeo de 1536x384 píxeles, compuestas por tres celdas de 512x384 (4:3): las dos cámaras en tercera persona, barajadas entre las dos primeras celdas por stream, y la cámara de muñeca en la última. Cada stream aplica dropout de vista (una cámara al 10 %, dos al 5 %) y recortes verticales aleatorios (0,3-0,65 en tercera persona, 0,5-1,0 en muñeca). La consulta consiste en un fotograma ancla más sus 16 acciones comandadas futuras, y el modelo genera los 16 fotogramas siguientes. Antes de la consulta se sitúan K chunks observados de 16 transiciones vídeo-acción como condicionamiento limpio en la misma ventana de atención.

La recuperación combina el chunk adyacente con K-1 chunks seleccionados por una regla de vecino más próximo simplificada que puntúa la curva de acciones comandadas (con estados de pinza por paso y trayectoria del efector final relativa al inicio de cada chunk, peso de acción 3), la pose inicial y la apariencia DINOv2-base. La biblioteca contiene 3.852.002 chunks de 214.336 grabaciones con poses de cámara relativas a la base del robot. La regla "views first" puntúa conjuntamente ambas cámaras en tercera persona y solo admite un chunk si su grabación cubre también la otra cámara mostrada dentro del límite de 10 grados y 10 cm, evitando celdas negras o vistas desalineadas. El entrenamiento usó AdamW (betas 0,9/0,99, weight decay 0,05), LR 5e-5 tras 400 actualizaciones de warm-up lineal, bf16 con pesos maestros fp32 y checkpointing completo de activaciones, sobre 30.000 actualizaciones con 32 streams por actualización (4 nodos x 8 H100, HSDP con grupos FSDP de 8 vías y 4 réplicas). Los datos son exclusivamente grabaciones de experto: robocasa_v2 (10.478), robomimic_v2 (16.608), rlbench_wrist_mv (11.314, 1.061 trayectorias distintas sobre 8 render sets) y droid (68.768), con pesos 2:2:1:2.

## Capacidades

- Generación de vídeo futuro multi-vista condicionada por acciones: produce 16 fotogramas de tres cámaras (dos tercera persona y muñeca) a partir de un ancla y 16 acciones comandadas.
- Modelado de forward dynamics para manipulación robótica: predice la evolución de la escena bajo una secuencia de comandos del efector y estados de pinza.
- Condicionamiento en contexto por recuperación: integra hasta 8 chunks observados de vídeo-acción como contexto limpio en la ventana de atención.
- Coherencia multi-cámara mediante correspondencia de vistas con límites de 10 grados de rotación y 10 cm de posición.
- Generalización entre conjuntos de datos: entrenado conjuntamente con robocasa, robomimic, RLBench y Droid.
- No soporta tool calling, function calling, agentes basados en lenguaje ni capacidades multilingües: es un modelo de vídeo-acción, no un modelo de lenguaje.
- No dispone de modo de razonamiento explícito (thinking mode), visión general, audio ni otras modalidades fuera del vídeo RGB de robot.

## Casos de uso

- Evaluación de políticas sin ejecución real: dado un fotograma y una secuencia de acciones propuesta por una política, el modelo genera los 16 fotogramas siguientes para estimar el resultado antes de enviar comandos al robot, reduciendo el desgaste y el riesgo físico en banco de pruebas.
- Planificación por búsqueda sobre acciones: usar el modelo como simulador aprendido para comparar varias secuencias de 16 acciones comandadas y seleccionar la que produce una trayectoria visual más próxima al objetivo, gracias a la coherencia multi-vista.
- Aumento de datos para aprendizaje por imitación: generar rollouts sintéticos multi-cámara a partir de demostraciones existentes para ampliar el conjunto de entrenamiento de políticas de manipulación.
- Validación de recetas y controladores: probar controladores basados en efector final y estados de pinza en escenarios de robocasa/robomimic antes del despliegue, aprovechando que las consultas de esos conjuntos recuperan mayoritariamente su episodio gemelo de montaje de cámara.
- Investigación en world models con recuperación: servir de referencia reproducible para estudiar el efecto del condicionamiento en contexto frente a memoria TTT, comparando con el run recent8 del mismo autor.
- Depuración de pipelines de datos robóticos: inspeccionar cómo responde el modelo a acciones mal etiquetadas o a vistas desalineadas, ya que la regla de vistas exige correspondencia estricta y revela incoherencias en las grabaciones.
- Preentrenamiento de cabezas de recompensa o críticos: emplear las predicciones de vídeo como señal auxiliar para entrenar modelos de valor en RL offline sobre los cuatro conjuntos de datos cubiertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta la pérdida de flow matching de vídeo de la consulta (`train@2/loss`) promediada sobre las 500 actualizaciones previas a cada marca:

| Actualización | 1000 | 2000 | 4000 | 8000 | 12000 | 16000 | 20000 | 24000 | 28000 | 30000 |
|---|---|---|---|---|---|---|---|---|---|---|
| loss | 0,0659 | 0,0652 | 0,0658 | 0,0652 | 0,0636 | 0,0629 | 0,0611 | 0,0624 | 0,0608 | 0,0614 |

No se proporcionan métricas de calidad visual (FVD, PSNR, SSIM), de éxito de tarea ni comparaciones numéricas con otros world models.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El repositorio ocupa 30,3 GB en bf16, por lo que la inferencia completa requiere al menos una GPU con más de 30 GB de memoria libre, sin contar activaciones ni el codificador VAE.
- GPU recomendadas: H100 (el entrenamiento usó 4 nodos x 8 H100); A100 de 80 GB como alternativa razonable por capacidad de memoria.
- Cabe en GPU de consumo: no de forma directa en bf16. No se documentan cuantizaciones (GGUF, AWQ, GPTQ) que permitan reducir el footprint a 24 GB o menos.
- Opciones de despliegue: el checkpoint es un DCP del trainer de cosmos-framework-dev, con `config.pkl` y `training/recipe.toml`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de difusión de vídeo. El despliegue requiere el framework de entrenamiento original.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SyncWorld-mv3-strip384-views-first-v10-step30000 (este) | no disponible | K chunks de 16 transiciones (K en 1..8) + 16 acciones | solo pérdida de entrenamiento (0,0614 a 30k) | OpenMDW-1.1 | Hugging Face, DCP bf16 |
| SyncWorld-mv3-strip384-recent8-step* | no disponible | misma ventana, recuperación recent8 | no disponible | OpenMDW-1.1 (presumible, mismo proyecto) | Hugging Face |
| gripperhead-mv-strip384-4x3-fork174k-4x8 (inicialización) | no disponible | tiras 1536x384 | no disponible | no disponible | checkpoint de cosmos-framework-dev |

No se dispone de datos públicos de benchmarks ni de parámetros para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo de investigación: no se documentan evaluaciones de éxito de tarea ni métricas de calidad de vídeo, por lo que su utilidad en producción no está validada.
- Sesgos de datos: entrenado solo con grabaciones de experto de robocasa, robomimic, RLBench y Droid, lo que limita la generalización a morfologías, sensores, iluminaciones y entornos no representados.
- Riesgo de alucinación visual: como modelo generativo de difusión, puede producir transiciones plausibles pero físicamente incorrectas, especialmente fuera de la distribución de la biblioteca de recuperación.
- Dependencia de la biblioteca: el rendimiento depende de la calidad y cobertura de los 3,85 millones de chunks; consultas sin vecinos adecuados degradan el condicionamiento.
- Limitación de vistas: la regla de 10 grados y 10 cm exige configuraciones de cámara próximas a las de la biblioteca; configuraciones distintas pueden no recuperar contexto válido.
- Sin capacidades lingüísticas ni de agente: no procesa instrucciones en lenguaje natural ni soporta tool calling.
- Restricciones de licencia: OpenMDW-1.1 remite a la licencia de NVIDIA Cosmos; debe revisarse antes de cualquier uso comercial.
- Formato propietario del trainer: el checkpoint DCP y `config.pkl` requieren el entorno conda `cosmos_fdm_conda_rlr:98a0b25c` y el código de cosmos-framework-dev con los parches locales indicados, lo que complica la reproducibilidad.
- Fecha de creación futura en los metadatos (2026-11-02) y ausencia de descargas y likes: artefacto reciente y sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yyuncong/SyncWorld-mv3-strip384-views-first-v10-step30000
- Run comparativo recent8: https://huggingface.co/yyuncong/SyncWorld-mv3-strip384-recent8-step
- Licencia OpenMDW-1.1 (NVIDIA Cosmos): https://github.com/NVIDIA/Cosmos/blob/main/LICENSE
- Referencia al framework de entrenamiento cosmos-framework-dev: no disponible como enlace directo en la información proporcionada
- Repositorio del proyecto SyncWorld-dev y receta `wm_ttt/retrieval/recipe_qctx_incontext_mv_simple_a3_views_first_8gpu.toml`: no disponible como enlace directo en la información proporcionada
