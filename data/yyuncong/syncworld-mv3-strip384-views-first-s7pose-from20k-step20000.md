# yyuncong/SyncWorld-mv3-strip384-views-first-s7pose-from20k-step20000

## Resumen

SyncWorld-mv3-strip384-views-first-s7pose es un checkpoint final (update 20000 de 20000) de un modelo de mundo orientado a robótica, desarrollado por el usuario yyuncong. Se trata de la variante de recuperación (`in-context`) de la tercera ronda de tres cámaras del proyecto SyncWorld-dev, en su forma de acciones de pose de efector final. El modelo genera los siguientes 16 fotogramas de vídeo a partir de un fotograma ancla y 16 acciones futuras, condicionado por fragmentos observados de vídeo y acción recuperados de una biblioteca.

La relevancia técnica del modelo reside en su mecanismo de recuperación multivista con alineación estricta de cámaras: los fragmentos de la biblioteca solo se admiten si su cámara cae dentro de 10 grados de rotación y 10 cm de posición de la cámara de la consulta, garantizando que ninguna celda mostrada quede negra o con una vista desalineada. El modelo parte de mvSV2 en el update 20000 y conserva sus acciones de pose de efector final realizadas.

El repositorio ocupa 30,3 GB y se distribuye bajo licencia OpenMDW-1.1. No dispone de descargas ni likes en el momento de la consulta, y la model card está redactada en un registro técnico muy específico del linaje de experimentos del autor, sin datos de benchmarks ni de composición del dataset de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de atención completa (`in_context`), sin memoria TTT; modelo de mundo vídeo-acción multivista |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en tokens; ventana de atención con ancla + 16 acciones futuras + K fragmentos observados (K uniforme en 1..8) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no lingüístico) |
| Licencia | OpenMDW-1.1 (`license: other`) |
| Formato de pesos | no disponible (repo de 30,3 GB; no se especifica safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo emplea atención completa sobre una ventana que contiene una consulta (un fotograma ancla más sus 16 acciones futuras de pose de efector final) y K fragmentos observados de vídeo y acción como condicionamiento limpio. Cada fragmento recuperado lleva una embedding aprendida de su distancia al ancla, con 8 cubos log2 desde 16 fotogramas, una fila para otras grabaciones y un vector de misma escena añadido para hermanos. La generación produce los siguientes 16 fotogramas. No hay memoria TTT.

Cada fotograma es una tira de 1536x384 compuesta por tres celdas de 512x384 (4:3): las dos cámaras en tercera persona, barajadas entre las dos primeras celdas por flujo, y la cámara de muñeca en la última. Se aplica dropout de vista por flujo (una cámara 10 %, dos cámaras 5 %) y recortes verticales aleatorios (tercera persona 0,3-0,65; muñeca 0,5-1,0); las cámaras DROID de 910x512 se recortan al centro a 4:3. Un único plan de teselado por flujo se mantiene para la consulta, sus propios fragmentos y cada fragmento de biblioteca.

La distancia de recuperación combina 3 x acción (trayectoria del efector final relativa al inicio de cada fragmento, en el marco de la cámara, con estados de pinza paso a paso), pose inicial, apariencia DINOv2-base de las celdas en tercera persona mostradas y apariencia de la celda de muñeca con peso 1 (1 menos coseno sobre la escala de muñeca de la biblioteca). Los slots se rellenan en orden: fragmento adyacente, hasta min(2, K-2) slots de escena, y slots de experiencia (fragmentos de biblioteca de otras grabaciones, hasta 64 por grabación). Los fragmentos de biblioteca deben empezar dentro de 40 grados de la dirección de apuntado de la consulta y, cuando la pinza abre o cierra, dentro de 45 grados de su roll. El entrenamiento se realizó sobre la mezcla de datos PEWM s7 con 8 GPU y 4 nodos, con receta `wm_ttt/retrieval/recipe_qctx_incontext_mv_simple_a3_views_first_v3s7pose_8gpu.toml`. No se especifican en la información disponible el número de tokens de entrenamiento ni la composición detallada del dataset.

## Capacidades

- Generación de vídeo futuro condicionada por acciones: produce los 16 fotogramas siguientes a un ancla dado un horizonte de 16 acciones de pose de efector final.
- Dinámica directa (`forward-dynamics`) en contexto: predice la evolución visual del entorno a partir de la trayectoria de la pinza.
- Recuperación multivista con alineación geométrica estricta (10 grados / 10 cm) entre cámaras de consulta y biblioteca.
- Condicionamiento por fragmentos observados de vídeo y acción con embedding de distancia al ancla.
- Manejo de dropout de vista: las cámaras descartadas permanecen negras de forma consistente en todos los fragmentos.
- Regla de hermanos para evitar fuga de objetivo: se retiene el metraje de un hermano hasta 16 fotogramas más allá del tramo compartido mientras el ancla esté sobre él o dentro de 16 fotogramas posteriores.
- Soporte de múltiples cámaras: dos terceras personas más muñeca, con selección conjunta de vistas.
- No se documentan capacidades de tool calling, agentes, multilingüismo, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Evaluación de políticas robóticas en simulación: el modelo genera rollouts visuales condicionados por acciones de efector final, lo que permite comparar trayectorias candidatas sin ejecutar el robot físico. Es adecuado porque su dinámica directa está entrenada sobre mezclas robóticas (robocasa, robomimic, DROID, RLBench).
- Aumento de datos para entrenamiento de políticas: generar fotogramas futuros plausibles a partir de demostraciones existentes para ampliar la cobertura visual de estados. La recuperación de fragmentos de escena y experiencia aporta contexto visual coherente.
- Planificación por búsqueda con modelo de mundo: usar el modelo como predictor de transición para evaluar secuencias de acciones antes de enviarlas al controlador, aprovechando el horizonte de 16 acciones.
- Validación de cámaras y calibración: el criterio de admisión a 10 grados / 10 cm permite detectar desalineaciones entre flujos multivista y descartar configuraciones de cámara inconsistentes.
- Estudio de recuperación en contexto: la variante sirve como referencia frente a la línea base recent8 para aislar el efecto de la biblioteca y la embedding de distancia al ancla en la calidad de la predicción.
- Depuración de fuga de información en evaluación: la regla de hermanos y la retención de tramos compartidos permiten construir protocolos de evaluación que eviten que el modelo vea su propio objetivo a través de rollouts emparentados.
- Investigación en modelos de mundo multivista: análisis de cómo la selección conjunta de vistas afecta a la coherencia entre celdas de la tira.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio de pesos ocupa 30,3 GB, lo que da una cota inferior del orden de decenas de GB en precisión nativa; no se especifica el número de parámetros ni la cuantización.
- GPU recomendadas: no disponible. El entrenamiento se realizó con 8 GPU en 4 nodos, pero no se indica el modelo de GPU.
- Viabilidad en GPU de consumo: no disponible; sin datos de parámetros ni de cuantizaciones soportadas no puede confirmarse.
- Opciones de despliegue: no disponible (no se documentan vLLM, llama.cpp, Ollama ni TGI; el pipeline declarado es `robotics`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Acciones | Recuperación | Licencia |
|---|---|---|---|---|---|
| SyncWorld-mv3-strip384-views-first-s7pose (este) | no disponible | ancla + 16 acciones + K fragmentos (1..8) | Pose de efector final realizada | Biblioteca con alineación 10 grados / 10 cm y embedding de distancia | OpenMDW-1.1 |
| SyncWorld-mv3-strip384-recent8-s7pose | no disponible | misma ventana | Pose de efector final realizada | recent8: K fragmentos que terminan justo antes del ancla, sin biblioteca ni embedding de distancia | OpenMDW-1.1 |
| SyncWorld-mv3-strip384 (mvSV3, s7cmd) | no disponible | misma ventana | Acciones de comando | Recuperación `in-context` | OpenMDW-1.1 |
| SyncWorld-mv3-strip384-recent8-s7cmd | no disponible | misma ventana | Acciones de comando | recent8 | OpenMDW-1.1 |

Las alternativas comparadas pertenecen al mismo linaje experimental del autor y difieren únicamente en el mecanismo de recuperación o en el tipo de acción, por lo que constituyen la comparación directa más fiable. No se dispone de comparación con modelos de mundo de otros proyectos.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible.
- Riesgo de alucinación visual: no cuantificado; al ser un modelo generativo de vídeo, los fotogramas predichos pueden divergir de la dinámica real fuera de la distribución de entrenamiento.
- Limitación de recuperación en escenas sintéticas: solo el 6,8 % de las grabaciones `icgen_rc` y el 5,1 % de `icgen_rm` tienen una grabación de otro episodio semilla que cubra ambas cámaras; con las dos cámaras mostradas, cerca del 94 % de las extracciones `icgen` (la mitad de todos los flujos) no pueden recuperar ningún fragmento de biblioteca y rellenan sus slots con su propia grabación.
- Fuga de objetivo entre hermanos: los rollouts de robocasa y RLBench y su experto forman un mismo episodio y pueden recuperarse entre sí; la regla de retención mitiga pero no elimina el riesgo. En RLBench, cerca del 81 % de los pares de render coinciden hasta el final y se retienen mutuamente por completo, y un 14 % lo hace en parte.
- Restricciones geométricas duras: los fragmentos de biblioteca deben cumplir los límites de 40 grados de apuntado y 45 grados de roll, lo que puede reducir la diversidad de contexto recuperado en trayectorias con giros pronunciados.
- Licencia: OpenMDW-1.1 con enlace a la licencia de NVIDIA Cosmos; es necesario revisar sus términos antes de cualquier uso comercial.
- Estado del artefacto: checkpoint final de una cadena de forks experimentales, sin descargas ni validación externa registrada; no hay información sobre estabilidad en producción ni sobre el formato exacto de pesos.
- Idiomas: no aplica ni se documenta soporte lingüístico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yyuncong/SyncWorld-mv3-strip384-views-first-s7pose-from20k-step20000
- Checkpoint base mvSV2: https://huggingface.co/yyuncong/SyncWorld-mv3-strip384-mvSV2-from40k-step20000
- Línea base recent8 con acciones de pose: https://huggingface.co/yyuncong/SyncWorld-mv3-strip384-recent8-s7pose-from20k-step20000
- Variante de acciones de comando (mvSV3): https://huggingface.co/yyuncong/SyncWorld-mv3-strip384-recent8-s7cmd-from20k-step20000
- Licencia OpenMDW-1.1 (NVIDIA Cosmos): https://github.com/NVIDIA/Cosmos/blob/main/LICENSE
