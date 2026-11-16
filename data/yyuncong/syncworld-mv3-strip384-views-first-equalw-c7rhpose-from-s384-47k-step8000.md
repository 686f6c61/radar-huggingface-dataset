# yyuncong/SyncWorld-mv3-strip384-views-first-equalw-c7rhpose-from-s384-47k-step8000

## Resumen

SyncWorld es un modelo de mundo (*world model*) orientado a robótica que predice la dinámica futura de una escena a partir de observaciones multivista y acciones del efector final. Lo desarrolla el usuario `yyuncong` y se distribuye bajo licencia OpenMDW-1.1 (NVIDIA Cosmos). El checkpoint reseñado es un estado intermedio de un entrenamiento en curso (actualización 8000 de 20000) del control de selector fijo del experimento de selector de contexto aprendido v2.

El modelo se enmarca en la familia SyncWorld, centrada en *forward dynamics* con condicionamiento *in-context*: en lugar de aprender una política, aprende a predecir la evolución del entorno y se apoya en un mecanismo de recuperación (*retrieval*) de contexto para seleccionar fragmentos de grabaciones previas como condición. Esta variante concreta usa tres cámaras en formato *strip384* (tiras de 384 píxeles), acciones de pose realizadas del efector final y un selector de contexto fijo basado en la suma de siete similitudes relativas.

Su relevancia es de investigación: sirve como línea base de control frente a la variante con selector aprendido, y su interés práctico está en la evaluación de modelos de mundo para planificación y simulación en robótica. No es un modelo de propósito general ni un asistente conversacional; su pipeline declarado es `robotics`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de mundo para robótica; detalles no publicados en la información disponible) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el contexto se compone de K fragmentos, K uniforme en 1..8) |
| Tipos de cuantización | no disponible (checkpoint en bf16) |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW-1.1 (`license: other`, enlace a la licencia de NVIDIA Cosmos) |
| Formato de pesos | checkpoint DCP del entrenador convertido a bf16 en `model/`; configuración en `config.pkl` |
| Tamaño del repositorio | 30,3 GB |
| Entradas | tres cámaras (strip384), acciones de pose del efector final |
| Selector de contexto | fijo: suma de 7 similitudes relativas (4 de acción, pose, imagen, muñeca), peso 1 cada una |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna (tipo de transformer, número de capas, dimensión oculta ni tokenizador visual). Lo que sí se documenta es el esquema de condicionamiento: el modelo recibe un contexto compuesto por K fragmentos, con K uniforme entre 1 y 8. El contexto incluye siempre el fragmento de la propia grabación de la consulta inmediatamente anterior al ancla, más K-1 fragmentos seleccionados entre los candidatos admitidos de una biblioteca, ordenados por una puntuación fija. Esa puntuación es la suma simple de siete similitudes relativas a la consulta (cuatro de acción, más pose, imagen y muñeca), cada una con peso 1, sin término de diversidad ni etiquetado ni reajustes.

El entrenamiento parte del run `gripperhead-mv-strip384-4x3-fork174k-4x8` (iteración 47000) de `cosmos-framework-dev`, con tablas de huecos de contexto nuevas y 400 actualizaciones de calentamiento. La mezcla de ventanas es la mezcla C7RH+: ventanas DROID de C7RH y ventanas de simulación s7 con las proporciones de C7RH multiplicadas por 0,8, más RLBench y DROID sin etiquetar al 0,10 cada uno (`gripperhead_c7rh_windows.config.json`). Se usan acciones de pose realizadas del efector final y la biblioteca `mv_strip_v4c7_s4_views_sib_grip_anch_wrist`. El run es `qctx_incontext_mv_simple_a3_views_first_v3s7pose_8gpu_selfix_c7rhmix_pose_s384_4n20k`, con 4 nodos de 8 GPU H100 y 20000 actualizaciones totales. La pérdida de entrenamiento (`train@2/loss`, media de las 500 actualizaciones previas a cada marca) evoluciona así:

| Actualización | 1000 | 2000 | 4000 | 8000 |
|---|---|---|---|---|
| Pérdida | 0,0992 | 0,0970 | 0,0934 | 0,0884 |

## Capacidades

- Predicción de dinámica futura (*forward dynamics*) en escenas robóticas a partir de observaciones y acciones.
- Condicionamiento multivista con tres cámaras en formato strip384.
- Uso de acciones de pose del efector final como señal de control.
- Recuperación de contexto *in-context* desde una biblioteca de fragmentos, con selección mediante un selector fijo de siete similitudes.
- Modelado de escenas con ventanas mezcladas de DROID, simulación s7 y RLBench.
- No se documentan capacidades de generación de texto, razonamiento lingüístico, código, matemáticas, visión general, *tool calling*, agentes conversacionales ni multilingüismo.

## Casos de uso

- Línea base de control en experimentos de selección de contexto: sirve para aislar el efecto del selector aprendido frente al fijo, comparando pérdidas de entrenamiento y comportamiento en las mismas condiciones de datos.
- Evaluación de modelos de mundo para manipulación robótica: permite medir la calidad de la predicción de dinámica en escenas DROID y RLBench con acciones de pose reales.
- Investigación en *retrieval* de contexto para robótica: al exponer explícitamente el esquema de puntuación (siete similitudes con peso 1), facilita reproducir y variar el criterio de selección de fragmentos.
- Estudio de mezclas de datos en entrenamiento: la configuración C7RH+ con proporciones concretas por fuente permite analizar el efecto de la composición del dataset en el aprendizaje de dinámica.
- Simulación y planificación en entorno de laboratorio: un modelo de forward dynamics puede integrarse en bucles de planificación basados en modelo, siempre que se valide su fidelidad fuera del conjunto de entrenamiento.
- Reproducción de experimentos a escala multi-nodo: el run documenta 4 nodos x 8 H100 y 20000 actualizaciones, lo que sirve de referencia para estimar costes de entrenamiento en configuraciones similares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Solo se documenta la pérdida de entrenamiento indicada en la sección de arquitectura y entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 30,3 GB en bf16, lo que da una cota inferior orientativa del orden de decenas de GB para cargar el checkpoint completo, sin margen para activaciones ni contexto.
- GPU recomendadas: el entrenamiento se realizó en 4 nodos de 8 GPU H100; no se documentan requisitos de inferencia.
- GPU de consumo: no disponible; no hay información que permita confirmar que quepa en tarjetas consumer.
- Opciones de despliegue: no se documentan (no hay referencias a vLLM, llama.cpp, Ollama ni TGI, que además no son pipelines habituales para este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SyncWorld mv3 strip384 (selector fijo, este checkpoint) | no disponible | K fragmentos, K en 1..8 | pérdida de entrenamiento 0,0884 en la actualización 8000 | OpenMDW-1.1 | Hugging Face, checkpoint intermedio |
| SyncWorld mv3 strip384 selector v2 (`yyuncong/SyncWorld-mv3-strip384-views-first-selv2-c7rhpose-from20k-step8000`) | no disponible | K fragmentos, K en 1..8 | no disponible | OpenMDW-1.1 | Hugging Face |
| `gripperhead-mv-strip384-4x3-fork174k-4x8` (cosmos-framework-dev) | no disponible | no disponible | no disponible | no disponible | checkpoint base citado en la model card |

No se dispone de datos de benchmarks ni de especificaciones de parámetros que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Es un checkpoint intermedio de un entrenamiento en curso (actualización 8000 de 20000); su calidad final no está garantizada.
- No es un modelo de propósito general: no genera texto, no responde preguntas y no soporta tool calling ni agentes conversacionales.
- Depende de un esquema de contexto y de una biblioteca de fragmentos concretos (`mv_strip_v4c7_s4_views_sib_grip_anch_wrist`); fuera de ese entorno de datos su aplicabilidad no está documentada.
- El selector fijo no usa diversidad ni etiquetado, lo que puede producir contextos redundantes en la recuperación.
- La model card no documenta sesgos, tasas de alucinación ni evaluación fuera de distribución; en modelos de mundo, los errores de predicción se acumulan en horizontes largos.
- Licencia OpenMDW-1.1: es necesario revisar los términos del enlace de licencia de NVIDIA Cosmos antes de cualquier uso comercial.
- El repositorio no incluye `router.npz` (propio de la variante con selector aprendido), por lo que no debe esperarse compatibilidad directa con ese flujo.
- No hay información sobre idiomas, por lo que no debe asumirse soporte multilingüe.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yyuncong/SyncWorld-mv3-strip384-views-first-equalw-c7rhpose-from-s384-47k-step8000
- Variante con selector aprendido v2: https://huggingface.co/yyuncong/SyncWorld-mv3-strip384-views-first-selv2-c7rhpose-from20k-step8000
- Licencia OpenMDW-1.1 (NVIDIA Cosmos): https://github.com/NVIDIA/Cosmos/blob/main/LICENSE
