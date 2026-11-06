# yyuncong/SyncWorld-mv3-strip384-mvSV2-from40k-step20000

## Resumen

SyncWorld-mv3-strip384-mvSV2-from40k-step20000 es un checkpoint final de un modelo de mundo (world model) para robótica desarrollado por el usuario de Hugging Face `yyuncong`, dentro del proyecto SyncWorld-dev. El modelo aprende dinámica directa (forward dynamics) en contexto: dado un frame ancla y una secuencia de acciones comandadas, genera los siguientes 16 frames de vídeo, apoyándose en fragmentos de vídeo/acción recuperados de una biblioteca externa que se inyectan en la misma ventana de atención como condicionamiento limpio. Está etiquetado como `world-model`, `forward-dynamics`, `in-context`, `multiview` y `retrieval`.

La entrada no es una imagen única sino una tira (strip) de 1536x384 píxeles compuesta por tres celdas de 512x384 (4:3): dos cámaras en tercera persona (barajadas entre las dos primeras celdas por stream) y la cámara de muñeca en la última. El modelo opera con atención completa sobre la ventana que contiene el ancla, sus 16 acciones futuras y K chunks observados (K uniforme entre 1 y 8), sin memoria TTT.

Es relevante porque combina generación de vídeo condicionada por acción con recuperación multivista y un mecanismo de "views first" que garantiza coherencia de punto de vista entre la consulta y los chunks recuperados, además de reglas de exclusión de "hermanos" (rollouts de la misma demostración) para evitar filtraciones del futuro de la propia consulta durante el entrenamiento. El repositorio ocupa 30,3 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención completa (full-attention) sobre ventana de contexto; sin memoria TTT; basada en cosmos-framework-dev (strip384) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible en tokens; la ventana contiene 1 frame ancla + 16 acciones comandadas + K chunks observados (K entre 1 y 8) y genera 16 frames |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vídeo/robótica, no de texto) |
| Licencia | openmdw-1.1 (referenciada como `other` en los tags; enlace a NVIDIA/Cosmos LICENSE) |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

El modelo es un transformer de atención completa que procesa una tira de tres cámaras de 1536x384 (tres celdas de 512x384). Cada frame de entrada es una tira de tres células: las dos cámaras en tercera persona se barajan entre las dos primeras celdas por stream, y la cámara de muñeca ocupa la última. Se aplica view dropout por stream (una cámara al 10 %, dos al 5 %) y recortes verticales aleatorios en las cámaras de 512x512 de robocasa, robomimic y RLBench (tercera persona 0,3-0,65; muñeca 0,5-1,0); las cámaras de 910x512 de DROID se recortan al centro a 4:3. Un mismo plan de tiling por stream se mantiene para la consulta, sus propios chunks y cada chunk de la biblioteca.

La consulta consiste en un frame ancla más sus 16 acciones comandadas futuras, y el modelo genera los 16 frames siguientes. Antes de la consulta se sitúan K chunks observados de vídeo/acción (K uniforme en 1..8, un K por update para todas las GPUs) en la misma ventana de atención como condicionamiento limpio. La distancia de recuperación combina 3 x acción (trayectoria del efector final relativa al inicio de cada chunk, en el marco de la cámara, con estados de pinza paso a paso), pose inicial, apariencia DINOv2-base de las celdas de tercera persona mostradas y apariencia de la celda de muñeca con peso 1 (1 - coseno sobre la escala de muñeca de la biblioteca). Los slots se rellenan en orden: chunk adyacente, hasta min(2, K-2) slots de escena (primero el pick del recall de muñeca, luego las ventanas anteriores no solapadas más cercanas de la consulta) y slots de experiencia (chunks de biblioteca de otras grabaciones ordenados por distancia, máximo 64 por grabación). Los chunks de biblioteca deben empezar a menos de 40 grados de la dirección de apuntado de la consulta y, cuando las acciones comandadas abren o cierran la pinza, a menos de 45 grados de su roll (módulo media vuelta). Cada chunk recuperado se lee con stride 2 sobre las 32 transiciones que terminan en su final, o sobre las primeras 32 de su grabación si empieza a menos de 16 frames del inicio.

El mecanismo "views first" a 10 grados / 10 cm puntúa cada chunk de biblioteca sobre ambas cámaras de tercera persona mostradas conjuntamente; el chunk entra por la cámara de la consulta cuya rotación y posición están dentro de 10 grados y 10 cm (mismo campo de visión, mismo dataset), y solo se admite si su grabación también cubre la otra cámara mostrada dentro del mismo límite. Las reglas de hermanos excluyen el metraje de rollouts de la misma demostración mientras la consulta esté en, o hasta 16 frames después, del tramo compartido (efector final a menos de 1 cm / 2 grados con desplazamiento de frame de como máximo 3). La biblioteca contiene 33.181.918 chunks (un chunk cada 4 frames) de 520.978 grabaciones de cámara. El entrenamiento parte del checkpoint `yyuncong/SyncWorld-mv3-strip384-views-first-v10-step40000` (run `qctx_incontext_mv_simple_a3_views_first_v2_8gpu_4n20k_v3_from40k`, receta `wm_ttt/retrieval/recipe_qctx_incontext_mv_simple_a3_views_first_v2_8gpu.toml`), que a su vez arranca del run strip384 de cosmos-framework-dev (`gripperhead-mv-strip384-4x3-fork174k-4x8`, iter 43500). No se detalla en la información disponible el número total de tokens de entrenamiento ni si hubo RLHF/DPO.

## Capacidades

- Generación de vídeo condicionada por acción: dado un frame ancla y 16 acciones comandadas, predice los 16 frames siguientes.
- Modelado de dinámica directa (forward dynamics) para robótica manipulativa.
- Recuperación en contexto (in-context retrieval) de chunks de vídeo/acción de una biblioteca de 33 millones de chunks.
- Razonamiento multivista: procesa simultáneamente dos cámaras en tercera persona y una cámara de muñeca en una única tira de 1536x384.
- Coherencia de punto de vista mediante el mecanismo "views first" (10 grados / 10 cm).
- Condicionamiento por pose inicial, trayectoria del efector final y estados de pinza.
- Soporte de view dropout y recortes aleatorios para robustez a configuraciones de cámara variables.
- No se documentan en la información disponible capacidades de tool calling, agentes, texto, visión general, audio ni modo thinking.

## Casos de uso

- Simulación de manipulación robótica: generar rollouts sintéticos de 16 frames a partir de un frame real y una secuencia de acciones comandadas, útil para aumentar datos de entrenamiento de políticas en robocasa, robomimic, RLBench y DROID.
- Evaluación de políticas sin entorno físico: predecir el resultado visual de una trayectoria del efector final antes de ejecutarla en hardware, reduciendo riesgo en pruebas.
- Planificación con recuperación de experiencias: usar los chunks de biblioteca recuperados por distancia de acción y apariencia para condicionar la generación en escenas y tareas similares ya observadas.
- Aumento de datos multivista: sintetizar las tres vistas (dos terceras personas y muñeca) de forma coherente para entrenar modelos de percepción que requieran múltiples cámaras.
- Estudio de generalización entre datasets: el modelo se entrenó con robocasa, robomimic, RLBench y DROID, por lo que sirve para analizar transferencia entre dominios con distintas resoluciones y encuadres.
- Investigación sobre filtración de información: las reglas de hermanos y de "views first" permiten estudiar cómo evitar que el modelo copie el futuro de la propia demostración durante el entrenamiento.
- Prototipado de control predictivo: integrar las predicciones de 16 frames como señal de verificación en bucles de control de robots manipuladores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el repositorio ocupa 30,3 GB, lo que da una cota inferior del espacio en disco necesario.
- GPU recomendadas: no disponible. El run de entrenamiento se describe como `8gpu_4n20k`, lo que sugiere entrenamiento en 8 GPUs, pero no se especifica el modelo.
- Viabilidad en GPU de consumo: no disponible; con 30,3 GB de pesos, una RTX 4090 (24 GB) no podría cargar el checkpoint completo sin cuantización, y no se documentan cuantizaciones.
- Opciones de despliegue: no disponible (no se mencionan vLLM, llama.cpp, Ollama ni TGI; es un modelo de vídeo/robótica, no de texto).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SyncWorld-mv3-strip384-mvSV2-from40k-step20000 (este) | no disponible | 1 ancla + 16 acciones + K chunks (K 1..8) | World model multivista con retrieval en contexto | openmdw-1.1 | Hugging Face, 0 descargas |
| SyncWorld-mv3-strip384-mvSV2-from40k-step10000 | no disponible | igual | mismo run, checkpoint intermedio (update 10000) | openmdw-1.1 | Hugging Face |
| SyncWorld-mv3-strip384-recent8-step16000 | no disponible | igual | variante recent8 del mismo proyecto | no disponible | Hugging Face |

No se dispone de datos de benchmarks ni de parámetros para establecer una comparación cuantitativa con alternativas de otros autores.

## Limitaciones y advertencias

- Modelo de investigación con 0 descargas y 0 likes: no hay evidencia de uso en producción ni validación externa.
- La model card está truncada en la información proporcionada; faltan detalles de entrenamiento, evaluación y uso previsto.
- No se documentan sesgos conocidos, pero al entrenarse con robocasa, robomimic, RLBench y DROID hereda los sesgos de esos datasets (entornos simulados y grabaciones concretas).
- Riesgo de alucinación visual: al ser un modelo generativo de vídeo, puede producir frames plausibles pero físicamente incorrectos.
- Las reglas de hermanos no cubren el 4,5 % de pares de renders de RLBench que repiten la demo con 7-16 frames de separación; en esos casos los chunks recuperados pueden mostrar el futuro de la propia consulta.
- La recuperación depende de una biblioteca de 33 millones de chunks y de características DINOv2-base; el despliegue requiere gestionar esa biblioteca y el cálculo de distancias.
- Licencia openmdw-1.1 (referenciada como `other`): es necesario revisar los términos del enlace a NVIDIA/Cosmos antes de uso comercial.
- No se documentan cuantizaciones ni formatos de pesos alternativos, lo que limita el despliegue en hardware modesto.
- El modelo no procesa texto ni lenguaje natural; no es adecuado para tareas de NLP.

## Enlaces

- Hugging Face: https://huggingface.co/yyuncong/SyncWorld-mv3-strip384-mvSV2-from40k-step20000
- Checkpoint intermedio: https://huggingface.co/yyuncong/SyncWorld-mv3-strip384-mvSV2-from40k-step10000
- Variante recent8: https://huggingface.co/yyuncong/SyncWorld-mv3-strip384-recent8-step16000
- Checkpoint base views-first v10 step40000: https://huggingface.co/yyuncong/SyncWorld-mv3-strip384-views-first-v10-step40000
- Licencia openmdw-1.1: https://github.com/NVIDIA/Cosmos/blob/main/LICENSE
