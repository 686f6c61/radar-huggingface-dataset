# yyuncong/SyncWorld-mv3-strip384-views-first-equalw-c7rhpose-from-s384-47k-step16000

## Resumen

SyncWorld-mv3-strip384-views-first-equalw-c7rhpose es un checkpoint intermedio de un modelo del mundo (world model) para robótica, desarrollado por el usuario `yyuncong` y publicado en Hugging Face bajo licencia OpenMDW-1.1. El modelo aprende dinámica directa (forward dynamics) a partir de observaciones multivista de tres cámaras, con acciones de pose del efector final realizadas, y utiliza un mecanismo de contexto en la propia inferencia (in-context) basado en la recuperación de fragmentos de una biblioteca de episodios previos. No es un modelo de lenguaje: es un componente de predicción para planificación y simulación en robótica.

Este checkpoint concreto (update 16000) corresponde al control de selector fijo del experimento con selector aprendido v2. El selector fijo puntúa los candidatos de la biblioteca como la suma simple de siete similitudes relativas (cuatro de acción, pose, imagen y muñeca), con peso 1 y sin término de diversidad. El entrenamiento se detuvo en torno al update 19.258 el 2026-11-16 y no se reanudará; el último checkpoint de la ejecución es el update 19000. El repositorio ocupa 30,3 GB e incluye los pesos en bf16 y la configuración del entrenador.

La relevancia de esta ficha es acotada: se trata de un artefacto de investigación con cero descargas y cero likes en el momento de la consulta, sin model card orientada a uso general ni benchmarks publicados. Resulta útil para reproducir la línea experimental de SyncWorld y para estudiar el efecto del selector de contexto fijo frente al aprendido, no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo del mundo para robótica; librería `mv_strip_v4c7_s4_views_sib_grip_anch_wrist`) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | K uniforme sobre 1..8 fragmentos de contexto recuperado (no es contexto de tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible (modelo no lingüístico) |
| Licencia | OpenMDW-1.1 (`license: other`, enlace a la licencia de NVIDIA Cosmos) |
| Formato de pesos | checkpoint DCP del entrenador convertido a bf16 (`model/`), más `config.pkl` |

## Arquitectura y entrenamiento

El modelo se enmarca en la familia SyncWorld de modelos del mundo para robótica, con una variante multivista de tres cámaras en formato "strip384". Trabaja con acciones de pose del efector final realizadas y una biblioteca de contexto (`mv_strip_v4c7_s4_views_sib_grip_anch_wrist`) de la que recupera fragmentos previos a la consulta. La innovación principal es el mecanismo de contexto en inferencia: para cada consulta se seleccionan K fragmentos (K uniforme entre 1 y 8), compuestos por el fragmento de la propia grabación inmediatamente anterior al ancla más K-1 fragmentos con mayor puntuación fija entre los candidatos admitidos de la biblioteca. En este checkpoint el selector es fijo: la puntuación es la suma simple de siete similitudes relativas a la consulta (cuatro de acción, pose, imagen y muñeca), cada una con peso 1, sin término de diversidad (`query_context_library_selector_fixed`, `_weights` 1x7, `_strength` 0).

El entrenamiento parte del run strip384 de `cosmos-framework-dev` (`gripperhead-mv-strip384-4x3-fork174k-4x8`, iteración 47000), con tablas de huecos de contexto nuevas y 400 actualizaciones de calentamiento. La mezcla de datos C7RH+ combina ventanas DROID de C7RH y ventanas de simulación s7 a las cuotas de C7RH multiplicadas por 0,8, más RLBench y DROID sin etiquetar al 0,10 cada uno (`gripperhead_c7rh_windows.config.json`). La ejecución (`qctx_incontext_mv_simple_a3_views_first_v3s7pose_8gpu_selfix_c7rhmix_pose_s384_4n20k`) se planificó para 20000 actualizaciones en 4 nodos de 8 H100, con lanzador `wm_ttt/handoff/selector_fixed_control_launch.sh`. No se especifican en la información disponible el número total de tokens de entrenamiento ni si hubo RLHF o DPO. La pérdida de entrenamiento (`train@2/loss`, media sobre las 500 actualizaciones previas a cada marca) evolucionó de 0,0992 en el update 1000 a 0,0844 en el update 16000.

## Capacidades

- Predicción de dinámica directa en robótica: modela la evolución del estado a partir de observaciones y acciones de pose del efector final.
- Procesamiento multivista: entrada de tres cámaras en configuración "strip384".
- Condicionamiento por recuperación en contexto: selecciona hasta 8 fragmentos de contexto de una biblioteca de episodios previos mediante un selector de similitud fijo.
- Manejo de acciones de pose realizadas (realized pose actions) y señal de pinza/muñeca según la librería de contexto empleada.
- Entrenamiento sobre mezcla de datos reales (DROID, RLBench) y simulación (ventanas s7).
- No se documentan capacidades de generación de texto, código, matemáticas, visión general, tool calling, agentes ni multilingüismo.

## Casos de uso

- Reproducción experimental del control de selector fijo: sirve para comparar, con idéntica mezcla de datos, el efecto de un selector de contexto fijo frente al selector aprendido v2 del mismo autor, aislando la contribución del mecanismo de selección.
- Estudio de recuperación de contexto en modelos del mundo: permite analizar cómo afecta el número K de fragmentos recuperados (1 a 8) a la calidad de la predicción de dinámica en entornos con múltiples cámaras.
- Investigación en planificación robótica basada en modelos: el modelo puede integrarse en bucles de planificación que requieran predecir el siguiente estado dado un par observación-acción, siempre dentro del dominio de datos de entrenamiento (DROID, RLBench, simulación s7).
- Análisis de mezclas de datos reales y simulados: la configuración C7RH+ con cuotas ponderadas permite estudiar la transferencia entre simulación y datos reales de manipulación.
- Evaluación de dinámica de efector final: útil para validar la coherencia de predicciones de pose y pinza en secuencias multivista, como paso previo a un despliegue en un pipeline de control.
- Referencia para linaje de checkpoints: al ser un checkpoint intermedio con linaje documentado (desde la iteración 47000 del run strip384), facilita la trazabilidad en experimentos de entrenamiento prolongado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica reportada es la pérdida de entrenamiento:

| Update | 1000 | 2000 | 4000 | 8000 | 12000 | 16000 |
|---|---|---|---|---|---|---|
| `train@2/loss` | 0,0992 | 0,0970 | 0,0934 | 0,0884 | 0,0854 | 0,0844 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 30,3 GB y los pesos se publican en bf16, por lo que se requiere al menos esa magnitud de memoria para cargar el checkpoint completo sin cuantizar.
- GPU recomendadas: el entrenamiento se realizó en 4 nodos de 8 H100; para inferencia se desconoce el mínimo, pero por el tamaño del checkpoint se recomienda al menos una GPU con 40-80 GB de memoria (A100, H100) para carga completa en bf16.
- ¿Cabe en GPU de consumo? No hay información que lo confirme; con 30,3 GB en bf16, una RTX 4090 de 24 GB no podría cargar el checkpoint completo sin cuantización o particionado, y no se documentan formatos cuantizados.
- Opciones de despliegue: no disponible. No se mencionan vLLM, llama.cpp, Ollama ni TGI; al no ser un modelo de lenguaje, estos servidores no son aplicables de forma directa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SyncWorld-mv3-strip384-views-first-equalw-c7rhpose (este) | no disponible | K = 1..8 fragmentos recuperados | pérdida 0,0844 en update 16000 | OpenMDW-1.1 | Hugging Face, 0 descargas |
| SyncWorld-mv3-strip384-views-first-selv2-c7rhpose-from20k-step16000 | no disponible | K variable con selector aprendido v2 | no disponible | OpenMDW-1.1 | Hugging Face |
| SyncWorld-mv3-strip384-views-first-selv2-mixa-c7rhpose-from20k-step16000 | no disponible | K variable con selector aprendido v2 sobre mezcla Mix A | no disponible | OpenMDW-1.1 | Hugging Face |
| SyncWorld-mv3-strip384-views-first-equalw-c7rhpose-from-s384-47k-step8000 | no disponible | K = 1..8 fragmentos recuperados | no disponible | OpenMDW-1.1 | Hugging Face |

Las alternativas comparables son variantes del mismo linaje experimental del autor; no se dispone de datos de benchmarks ni de especificaciones de parámetros que permitan una comparación cuantitativa con modelos de terceros.

## Limitaciones y advertencias

- Checkpoint intermedio detenido: el entrenamiento se paró en torno al update 19.258 y no se reanudará; este artefacto corresponde al update 16000, no a un modelo final.
- Ausencia total de benchmarks y de model card orientada a uso general: no hay evidencia publicada de calidad de predicción fuera de la pérdida de entrenamiento.
- Sin datos de sesgos, alucinación o robustez fuera de distribución; el dominio queda restringido a las mezclas DROID, RLBench y simulación s7 empleadas.
- El selector de contexto es fijo y sin término de diversidad, lo que puede concentrar la recuperación en candidatos redundantes; el propio autor lo plantea como control frente al selector aprendido.
- Licencia OpenMDW-1.1 con `license: other`: es imprescindible revisar el texto enlazado (licencia de NVIDIA Cosmos) antes de cualquier uso comercial o redistribución.
- Diferencias de inicialización respecto al run con selector aprendido v2 (parte de la iteración 47000 del run strip384, no del update 20000 de mvSV3p), lo que impide atribuir diferencias de rendimiento únicamente al selector.
- Tamaño de repositorio de 30,3 GB y pesos en bf16 sin cuantizaciones documentadas: el despliegue en hardware limitado no está soportado por la información disponible.
- Cero descargas y cero likes en el momento de la consulta: no hay comunidad ni soporte documentado.

## Enlaces

- Hugging Face: https://huggingface.co/yyuncong/SyncWorld-mv3-strip384-views-first-equalw-c7rhpose-from-s384-47k-step16000
- Checkpoint del mismo run en update 8000: https://huggingface.co/yyuncong/SyncWorld-mv3-strip384-views-first-equalw-c7rhpose-from-s384-47k-step8000
- Checkpoint más cercano con selector aprendido v2: https://huggingface.co/yyuncong/SyncWorld-mv3-strip384-views-first-selv2-c7rhpose-from20k-step8000
- Checkpoint con selector v2 sobre mezcla Mix A: https://huggingface.co/yyuncong/SyncWorld-mv3-strip384-views-first-selv2-mixa-c7rhpose-from20k-step16000
- Licencia OpenMDW-1.1 (NVIDIA Cosmos): https://github.com/NVIDIA/Cosmos/blob/main/LICENSE
