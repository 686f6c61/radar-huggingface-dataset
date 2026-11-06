# yyuncong/SyncWorld-mv3-strip384-recent8-step40000

## Resumen

SyncWorld-mv3-strip384-recent8-step40000 es un checkpoint intermedio (actualización 40.000 de 45.000) de un modelo del mundo orientado a robótica, desarrollado por el autor yyuncong bajo el marco Cosmos y publicado con la licencia OpenMDW-1.1 de NVIDIA. El modelo aborda la dinámica directa (forward dynamics) en entornos multi-cámara: dado un fotograma ancla y una secuencia de acciones comandadas, predice los 16 fotogramas siguientes, condicionado por K fragmentos de vídeo/acción observados que se sitúan en la misma ventana de atención como contexto limpio. La variante "recent8" utiliza los K fragmentos más recientes de la propia consulta como condicionamiento, y constituye la línea base frente a una recuperación de vecinos más simples con vistas conjuntas.

La entrada no es una imagen única, sino una tira de 1536x384 píxeles compuesta por tres celdas de 512x384 (4:3): las dos cámaras en tercera persona del registro, barajadas entre las dos primeras celdas por secuencia, y la cámara de muñeca en la última. El entrenamiento parte de un modelo Cosmos ya adaptado a estas tiras y continúa con 45.000 actualizaciones sobre 4 nodos de 8 H100. El repositorio ocupa 30,3 GB y no registra descargas ni interacciones en Hugging Face, lo que indica su carácter de artefacto de investigación más que de modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención completa (full-attention), sin memoria TTT; basada en el marco Cosmos (cosmos-framework-dev) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (el recetario entrena `moe_gen`, lo que sugiere componente tipo mezcla de expertos, pero no se detalla el conteo) |
| Longitud de contexto | Ventana de atención que contiene el ancla, sus 16 acciones futuras y K fragmentos de 16 transiciones (K de 1 a 8), más los 16 fotogramas generados |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | no disponible (modelo no lingüístico; entrada y salida son vídeo y acciones) |
| Licencia | OpenMDW-1.1 (referenciada como `other` en la model card) |
| Formato de pesos | Estado DCP del entrenador convertido a bf16 en `model/`, más `config.pkl` y `training/recipe.toml` |

## Arquitectura y entrenamiento

El modelo es un transformer de atención completa que procesa una tira multi-vista de 1536x384 como entrada. Cada consulta consta de un fotograma ancla más 16 acciones comandadas futuras, y el modelo genera los 16 fotogramas siguientes mediante flow matching sobre el vídeo. Antes de la consulta se sitúan K fragmentos observados de 16 transiciones de vídeo/acción, con K distribuido uniformemente entre 1 y 8 (un único K por actualización, compartido por todas las GPU), que actúan como condicionamiento limpio dentro de la misma ventana de atención. La variante recent8 selecciona los K fragmentos más recientes de la propia consulta. No hay memoria TTT.

El entrenamiento parte del checkpoint `gripperhead-mv-strip384-4x3-fork174k-4x8` (iteración 43.500) de cosmos-framework-dev, ya entrenado sobre los cuatro conjuntos de datos en formato de tiras 1536x384. La optimización usa AdamW (betas 0,9/0,99, weight decay 0,05), LR 5e-5 tras un calentamiento lineal de 400 actualizaciones y después constante, entrenando `moe_gen`, el embedder temporal y las proyecciones de VAE y acción, con una relabelación del eje de acción por secuencia (p 1,0), cómputo en bf16 con pesos maestros fp32 y checkpointing completo de activaciones. La escala es de 4 nodos x 8 H100 en HSDP (grupo FSDP de 8 vías por nodo, 4 réplicas), una secuencia por GPU y 32 secuencias por actualización, durante 45.000 actualizaciones (extendidas desde 30.000 el 2026-11-01) con checkpoint cada 1.000.

Los datos (`syncworld_ttt/data/mv_strip_v2`, con medios transmitidos desde los conjuntos de fragmentos) comprenden robocasa_v2 con 10.478 grabaciones (solo unidades de referencia formal_2), robomimic_v2 con 16.608, rlbench_wrist_mv con 11.314 (1.061 trayectorias distintas sobre 8 conjuntos de render) y droid con 68.768 (descartando grabaciones de más de 3.000 fotogramas), solo grabaciones de experto y con pesos de componente robocasa 2 : robomimic 2 : rlbench 1 : droid 2. El aumento incluye dropout de vista por secuencia (una cámara 10 %, dos 5 %) y recortes verticales aleatorios (tercera persona 0,3-0,65; muñeca 0,5-1,0).

## Capacidades

- Predicción de dinámica directa multi-vista: genera 16 fotogramas futuros a partir de un ancla y 16 acciones comandadas.
- Condicionamiento en contexto: incorpora de 1 a 8 fragmentos observados de 16 transiciones como contexto limpio en la ventana de atención.
- Manejo de tres cámaras simultáneas (dos en tercera persona y una de muñeca) en una única tira de 1536x384.
- Robustez a vista faltante y a recortes verticales gracias al dropout de vista y al recorte aleatorio durante el entrenamiento.
- Aprendizaje de dinámica condicionada por acción sobre grabaciones de experto en robocasa, robomimic, RLBench y DROID.
- No se documentan capacidades de tool calling, agentes, razonamiento lingüístico, visión general, audio ni modo de pensamiento.

## Casos de uso

- Planificación de manipulación robótica: el modelo predice los 16 fotogramas siguientes dada una secuencia de acciones, lo que permite evaluar trayectorias candidatas antes de ejecutarlas en el robot físico, aprovechando el condicionamiento por acción y la vista de muñeca.
- Modelado de mundo para entrenamiento por refuerzo basado en modelo: al generar rollouts visuales multi-vista condicionados por acción, puede alimentar un bucle de planificación o de aprendizaje de política en simulación sin necesidad de renderizar cada paso en el simulador.
- Evaluación de políticas en entornos tipo robocasa y robomimic: al haber sido entrenado sobre estas distribuciones, sirve para puntuar políticas entrenadas en dichos bancos comparando la predicción con la observación real.
- Predicción con historial reciente: la variante recent8 usa los K fragmentos más recientes de la consulta, adecuada para escenarios de control en línea donde solo se dispone de observaciones inmediatamente anteriores.
- Investigación en recuperación de contexto: al ser la línea base frente a la recuperación de vecinos más simples con vistas conjuntas, permite aislar el efecto del mecanismo de selección de contexto en la calidad de la predicción.
- Transferencia entre configuraciones de cámara: el dropout de vista y el barajado de las cámaras en tercera persona hacen que el modelo tolere configuraciones de sensor variables, útil en plataformas con montajes distintos.
- Análisis de dinámica de agarre: la celda de muñeca y la relabelación del eje de acción facilitan estudiar cómo se cierra la pinza y cómo evoluciona el objeto tras la acción comandada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta la pérdida de flow matching del vídeo de la consulta (`train@2/loss`), promediada sobre las 500 actualizaciones previas a cada marca:

| Actualizacion | 1000 | 2000 | 4000 | 8000 | 12000 | 16000 | 20000 | 24000 | 28000 | 30000 | 40000 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Loss | 0,0663 | 0,0661 | 0,0661 | 0,0656 | 0,0641 | 0,0633 | 0,0617 | 0,0629 | 0,0615 | 0,0618 | 0,0606 |

## Requisitos de hardware

- El entrenamiento se ejecutó en 4 nodos x 8 H100 en HSDP, con una secuencia por GPU y 32 secuencias por actualización, más checkpointing completo de activaciones.
- El repositorio ocupa 30,3 GB, con pesos en bf16; la VRAM de inferencia no está documentada y no puede estimarse con fiabilidad sin conocer el número de parámetros.
- GPU recomendadas para inferencia: no disponible; por el régimen de entrenamiento (H100) y el tamaño del estado, es probable que requiera GPU de centro de datos, pero el dato no se confirma.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; el artefacto es un estado DCP del entrenador junto con `config.pkl` y `recipe.toml`, pensado para el marco Cosmos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SyncWorld-mv3-strip384-recent8-step40000 (este) | no disponible | Ancla + 16 acciones + K fragmentos (K 1-8) + 16 fotogramas generados | Loss 0,0606 en la actualización 40.000 | OpenMDW-1.1 | Hugging Face, 30,3 GB |
| SyncWorld-mv3-strip384-views-first-v10-step* | no disponible | Mismo esquema, recuperación de vecinos más simples con vistas conjuntas | no disponible | OpenMDW-1.1 (presumible) | Hugging Face |
| cosmos-framework-dev `gripperhead-mv-strip384-4x3-fork174k-4x8` (inicialización) | no disponible | Tiras 1536x384 | no disponible | no disponible | no disponible |

La comparación con otros modelos del mundo robóticos de terceros no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint intermedio: corresponde a la actualización 40.000 de 45.000, por lo que no es la versión final del entrenamiento.
- Entrenado exclusivamente con grabaciones de experto de robocasa, robomimic, RLBench y DROID; el rendimiento fuera de esas distribuciones no está evaluado.
- Sin métricas de evaluación publicadas más allá de la pérdida de entrenamiento; no hay evidencia de calidad de predicción en tareas retenidas.
- Sin memoria TTT y con atención completa: el coste crece con el número de fragmentos de contexto (K hasta 8), lo que limita el historial efectivo.
- Riesgo de alucinación visual: al ser un modelo generativo de vídeo, puede producir rollouts plausibles pero físicamente incorrectos, especialmente con acciones fuera de distribución.
- Sesgos: no documentados; al derivarse de grabaciones de experto en entornos concretos, puede heredar sesgos de esas plataformas y configuraciones de cámara.
- Idiomas: no aplica; el modelo no procesa texto.
- Licencia OpenMDW-1.1: las condiciones para uso comercial deben consultarse en el enlace de licencia de NVIDIA Cosmos; la model card la marca como `other`.
- Artefacto de investigación: el formato DCP y la dependencia del marco Cosmos complican el despliegue directo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/yyuncong/SyncWorld-mv3-strip384-recent8-step40000
- Licencia OpenMDW-1.1 (NVIDIA Cosmos): https://github.com/NVIDIA/Cosmos/blob/main/LICENSE
- Variante comparada (views-first): https://huggingface.co/yyuncong/SyncWorld-mv3-strip384-views-first-v10-step
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
