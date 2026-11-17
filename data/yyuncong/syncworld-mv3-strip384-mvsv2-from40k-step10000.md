# yyuncong/SyncWorld-mv3-strip384-mvSV2-from40k-step10000

## Resumen

SyncWorld-mv3-strip384-mvSV2-from40k-step10000 es un checkpoint intermedio de un modelo del mundo (world model) para robótica desarrollado por el usuario yyuncong dentro del proyecto SyncWorld-dev. El modelo aprende dinámica directa (forward dynamics) en contexto: dado un fotograma de anclaje, un historial de acciones comandadas y un conjunto de fragmentos de vídeo recuperados de una biblioteca de episodios previos, genera los 16 fotogramas siguientes de una secuencia de manipulación robótica. Se trata de un transformer de atención completa (full-attention) sin memoria TTT, entrenado sobre secuencias multivista empaquetadas en tiras de 1536x384 píxeles que contienen tres cámaras de 512x384 (dos terceras personas y una cámara de muñeca).

El checkpoint corresponde a la actualización 10000 de una ejecución de 20000, bifurcada el 3 de noviembre de 2026 desde `yyuncong/SyncWorld-mv3-strip384-views-first-v10-step40000`, que a su vez arranca de una ejecución de cosmos-framework-dev (`gripperhead-mv-strip384-4x3-fork174k-4x8`, iteración 43500). La innovación central es el mecanismo de recuperación en contexto (retrieval in-context) con restricciones geométricas de vista: los fragmentos de la biblioteca se admiten solo si su cámara cae dentro de 10 grados de rotación y 10 cm de posición respecto a la cámara de la consulta, de modo que ninguna celda mostrada queda negra ni muestra una vista desalineada.

El modelo es relevante para investigación en modelos del mundo y planificación robótica porque combina recuperación de experiencia a escala (más de 33 millones de fragmentos de 520.978 grabaciones de cámara) con reglas explícitas de exclusión de hermanos (siblings) que evitan fugas de información del futuro de la propia consulta. Su licencia es openmdw-1.1 (NVIDIA Cosmos) y el repositorio ocupa 30,3 GB. No se han publicado parámetros, contexto ni benchmarks en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de atención completa (full-attention), sin memoria TTT; world model de dinámica directa con recuperación en contexto |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible en tokens; ventana de atención con 1 fotograma de anclaje + 16 acciones futuras + hasta K fragmentos observados (K uniforme en 1..8) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de vídeo/robótica, no lingüístico) |
| Licencia | openmdw-1.1 (enlace a la licencia de NVIDIA Cosmos) |
| Formato de pesos | no disponible (repo de 30,3 GB; no se especifica safetensors ni GGUF) |

## Arquitectura y entrenamiento

La arquitectura es un transformer de atención completa que procesa tiras de 1536x384 píxeles compuestas por tres celdas de 512x384 (4:3): las dos cámaras de tercera persona de la grabación, barajadas entre las dos primeras celdas por flujo, y la cámara de muñeca en la última. Cada consulta consta de un fotograma de anclaje más sus 16 acciones comandadas futuras, y el modelo genera los 16 fotogramas siguientes. Antes de la consulta se sitúan K fragmentos observados de vídeo/acción (K uniforme en 1..8, un K por actualización para todas las GPU) como condicionamiento limpio en la misma ventana de atención. El entrenamiento aplica dropout de vista por flujo (una cámara al 10 %, dos al 5 %) y recortes verticales aleatorios en las cámaras de 512x512 de robocasa, robomimic y RLBench (tercera persona 0,3-0,65; muñeca 0,5-1,0), con recorte central a 4:3 de las cámaras de 910x512 de DROID.

El mecanismo de recuperación puntúa cada fragmento de la biblioteca con una distancia compuesta: 3 x acción (trayectoria del efector final relativa al inicio de cada fragmento, en el marco de la cámara, con estados de pinza paso a paso) + pose inicial + apariencia DINOv2-base de las celdas de tercera persona mostradas + apariencia de la celda de muñeca con peso 1 (1 - coseno sobre la escala de muñeca de la biblioteca). Los slots se llenan en orden: fragmento adyacente, hasta min(2, K-2) slots de escena (primero la elección del recall de muñeca, luego las ventanas anteriores no solapadas más cercanas de la consulta) y slots de experiencia (fragmentos de otras grabaciones ordenados por distancia, máximo 64 por grabación). La biblioteca contiene 33.181.918 fragmentos (uno cada 4 fotogramas) de 520.978 grabaciones de cámara, con características DINOv2-base, poses, agrupación de episodios y matrices de hermanos, pinza, trayectoria anclada y muñeca. El entrenamiento usa un sorteo mixto: la mitad de los flujos toma sus K-1 fragmentos uniformemente de los 24 candidatos de la regla (8 de escena + 16 de experiencia) y la otra mitad toma el top K-1 de la regla; la recuperación en vivo y la evaluación ejecutan siempre la regla.

## Capacidades

- Generación de vídeo futuro condicionada a acciones: predice los 16 fotogramas siguientes a un anclaje dado un historial de acciones comandadas.
- Dinámica directa en contexto: integra hasta 8 fragmentos observados de vídeo/acción como condicionamiento limpio en la ventana de atención.
- Recuperación multivista con restricciones geométricas: admite fragmentos solo si su cámara cae dentro de 10 grados y 10 cm de la cámara de la consulta, garantizando coherencia de campo de visión y dataset.
- Manejo de oclusión y dropout de cámara: una cámara descartada del flujo permanece negra en todos los fragmentos, sin vistas desalineadas.
- Regla de hermanos (siblings): excluye el material de un hermano que avanza en paso con la consulta (efector final a menos de 1 cm / 2 grados con desplazamiento de fotograma de hasta 3) hasta 16 fotogramas después de la parte compartida, evitando fugas del propio objetivo.
- Marcador aprendido de misma escena: un vector (cero al inicio) identifica hermanos entre los fragmentos de contexto.
- Evaluación y recuperación en vivo mediante la regla determinista, no mediante el sorteo de entrenamiento.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, matemáticas, visión general, audio ni modo thinking.

## Casos de uso

- Investigación en modelos del mundo para manipulación: evaluar la capacidad de predecir dinámica futura condicionada a acciones en entornos como robocasa, robomimic, RLBench y DROID, usando el checkpoint como referencia intermedia de una ejecución en curso.
- Planificación con recuperación de experiencia: dado un estado inicial y una trayectoria de efector final propuesta, recuperar fragmentos de episodios previos geométricamente compatibles para condicionar la predicción y comparar rollouts contrafactuales.
- Aumento de datos sintéticos para robótica: generar secuencias de 16 fotogramas plausibles para entrenar políticas o modelos auxiliares, aprovechando la coherencia multivista de las tiras de tres cámaras.
- Análisis de fugas de información en retrieval: estudiar el efecto de la regla de hermanos y de las restricciones de vista (10 grados / 10 cm) en la calidad de las predicciones, comparando con los checkpoints hermanos de la misma ronda.
- Validación de recetas de entrenamiento: comparar esta receta (mvSV2, con cambios de no-recuperación) frente a recent8 y al control de views-first de la primera ronda sobre el mismo prep de datos.
- Estudio de condicionamiento por cámara de muñeca: analizar cómo el término de apariencia de muñeca a peso 1 y el recall de muñeca afectan a la selección de slots de escena en tareas de agarre.
- Reproducción de experimentos de world models a escala de biblioteca: usar la biblioteca de 33,2 millones de fragmentos y 520.978 grabaciones como base para experimentos de recuperación a gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 30,3 GB, lo que sugiere que los pesos en precisión completa o mixta superan ampliamente la memoria de una GPU de consumo.
- GPU recomendadas: no disponible; por el tamaño del repositorio y el contexto multivista de tres cámaras a 1536x384, se requiere hardware de centro de datos (A100, H100) según la información disponible.
- Compatibilidad con GPU de consumo: no disponible; no se documenta ninguna cuantización ni formato GGUF que permita reducir el modelo.
- Opciones de despliegue: no disponible; no se mencionan vLLM, llama.cpp, Ollama, TGI ni ningún otro motor de inferencia.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SyncWorld-mv3-strip384-mvSV2-from40k-step10000 | no disponible | hasta 8 fragmentos en contexto | no disponible | openmdw-1.1 | Hugging Face, 0 descargas |
| SyncWorld-mv3-strip384-views-first-v10-step40000 (checkpoint base) | no disponible | no disponible | no disponible | openmdw-1.1 (presumiblemente) | Hugging Face |
| cosmos-framework-dev gripperhead-mv-strip384-4x3-fork174k-4x8 (iter 43500) | no disponible | no disponible | no disponible | no disponible | no disponible en la información |
| recent8 (hermano de la misma ronda) | no disponible | no disponible | no disponible | no disponible | no disponible en la información |

## Limitaciones y advertencias

- Checkpoint intermedio: es la actualización 10000 de 20000 de una ejecución aún en entrenamiento; no representa el estado final del modelo.
- Sin benchmarks publicados: no hay métricas de calidad que permitan validar su rendimiento frente a alternativas.
- Licencia openmdw-1.1 (NVIDIA Cosmos): es necesario revisar los términos del enlace de licencia antes de cualquier uso comercial; la model card la marca como "other".
- Dominio restringido: entrenado sobre robocasa, robomimic, RLBench y DROID; no se documenta generalización fuera de esos entornos ni de tareas de manipulación.
- Riesgo de fuga de información residual: la propia model card documenta que el 4,5 % de los pares de render de RLBench reproducen la demo con 7-16 fotogramas de separación y no se excluyen mutuamente, por lo que sus fragmentos pueden mostrar el futuro de la consulta.
- Dependencia de la biblioteca de recuperación: el comportamiento en inferencia depende de la regla de recuperación y de la biblioteca `mv_strip_v3_s4_views_sib_grip_anch_wrist`, cuya disponibilidad y construcción no se detallan por completo.
- Sin soporte documentado de cuantización ni de motores de despliegue estándar, lo que dificulta su uso en producción.
- Idiomas no aplicables: es un modelo de vídeo/robótica, no lingüístico; no se documentan sesgos sociales ni de idioma.
- Riesgo de alucinación visual: no se documenta ninguna evaluación de fidelidad de los fotogramas generados ni de deriva a largo plazo en rollouts.

## Enlaces

- Hugging Face: https://huggingface.co/yyuncong/SyncWorld-mv3-strip384-mvSV2-from40k-step10000
- Checkpoint base: https://huggingface.co/yyuncong/SyncWorld-mv3-strip384-views-first-v10-step40000
- Licencia (NVIDIA Cosmos): https://github.com/NVIDIA/Cosmos/blob/main/LICENSE
- Repositorio de referencia cosmos-framework-dev (`gripperhead-mv-strip384-4x3-fork174k-4x8`): no disponible como enlace directo en la información proporcionada
- Handoff de entrenamiento `wm_ttt/handoff/mvsv2_training_prep_20261102.md`: no disponible como enlace público
- Receta `wm_ttt/retrieval/recipe_qctx_incontext_mv_simple_a3_views_first_v2_8gpu.toml`: no disponible como enlace público
