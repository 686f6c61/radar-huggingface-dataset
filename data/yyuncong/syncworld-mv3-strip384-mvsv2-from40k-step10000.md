# yyuncong/SyncWorld-mv3-strip384-mvSV2-from40k-step10000

## Resumen

SyncWorld-mv3-strip384-mvSV2-from40k-step10000 es un checkpoint intermedio de un modelo del mundo (world model) para robótica desarrollado por el usuario de Hugging Face `yyuncong`, dentro del proyecto SyncWorld-dev. El modelo aprende dinámica directa (forward dynamics) en contexto: dado un fotograma ancla y una secuencia de acciones comandadas del efector final, genera los siguientes 16 fotogramas de vídeo prediciendo cómo evolucionará la escena. Está diseñado específicamente para manipulación robótica multivista, con una codificación en tiras (strips) de tres cámaras: dos cámaras en tercera persona y una cámara de muñeca.

La innovación principal es el mecanismo de recuperación (retrieval) en contexto: antes de generar, el modelo incorpora K fragmentos observados de vídeo y acción (de 1 a 8) en la misma ventana de atención como condicionamiento limpio, recuperados de una biblioteca de más de 33 millones de fragmentos mediante una métrica de distancia que combina trayectoria del efector, pose inicial, apariencia DINOv2 y geometría de cámaras. Esto permite al modelo condicionar la predicción sobre experiencias de otras grabaciones con escenas y puntos de vista compatibles.

Este checkpoint concreto corresponde a la actualización 10.000 de 20.000 de la segunda ronda de entrenamiento con tres cámaras (rama `in-context`), partiendo del checkpoint de la actualización 40.000 de la primera ronda. El repositorio ocupa 30,3 GB y la licencia es OpenMDW-1.1 (NVIDIA Cosmos), lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión con flow matching (world model de vídeo-acción), atención completa en contexto, sin memoria TTT |
| Parametros totales | no disponible |
| Parametros activos | no disponible (se entrena `moe_gen`, lo que sugiere componentes tipo mezcla de expertos, pero no se detalla el recuento) |
| Longitud de contexto | Ventana de atención que contiene el ancla, 16 acciones futuras y K fragmentos observados (K entre 1 y 8), cada uno leído sobre 32 transiciones con stride 2 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vídeo-acción, sin capacidades de lenguaje) |
| Licencia | OpenMDW-1.1 (enlace a la licencia de NVIDIA Cosmos); la model card indica `license: other` |
| Formato de pesos | no disponible (repositorio de 30,3 GB, presumiblemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

El modelo es un world model generativo de vídeo basado en flow matching (difusión) que opera sobre tiras de 1536x384 píxeles compuestas por tres celdas de 512x384 (proporción 4:3): dos cámaras en tercera persona, barajadas entre las dos primeras celdas por flujo, y la cámara de muñeca en la última. Usa atención completa sobre una ventana en contexto que combina el fotograma ancla, las 16 acciones comandadas futuras y K fragmentos de vídeo/acción observados como condicionamiento limpio. No emplea memoria TTT. El entrenamiento aplica dropout de vista por flujo (una cámara al 10 %, dos al 5 %) y recortes verticales aleatorios (0,3-0,65 en tercera persona, 0,5-1,0 en muñeca).

La recuperación de fragmentos se basa en una distancia que suma tres términos de acción (trayectoria del efector relativa al inicio de cada fragmento, en el marco de la cámara, con estados de pinza por paso), la pose inicial, la apariencia DINOv2-base de las celdas mostradas y la apariencia de la celda de muñeca con peso 1. Los fragmentos de la biblioteca deben comenzar dentro de 40° de la dirección de apuntado de la consulta y, al agarrar, dentro de 45° de su roll. La selección de vistas exige coincidencia de 10° de rotación y 10 cm de posición para admitir un fragmento. La optimización usa AdamW (betas 0,9/0,99, weight decay 0,05), LR 5e-5 tras warm-up lineal de 100 actualizaciones, bf16 con pesos maestros fp32, checkpointing completo de activaciones y 4 nodos de 8 H100 (HSDP) con 32 flujos por actualización durante 20.000 actualizaciones. Los datos provienen de robocasa_v2 (10.478 grabaciones experto más 40.065 rollouts contrafactuales), robomimic_v2 y otras fuentes, con una biblioteca de 33.181.918 fragmentos de 520.978 grabaciones.

## Capacidades

- Predicción de dinámica directa: genera los 16 fotogramas siguientes a un ancla dado un comando de 16 acciones del efector final.
- Condicionamiento en contexto mediante recuperación de fragmentos de vídeo/acción de una biblioteca de más de 33 millones de fragmentos.
- Razonamiento multivista: integra dos cámaras en tercera persona y una cámara de muñeca en una única tira codificada.
- Manejo de estados de pinza (gripper) paso a paso en la trayectoria de acción.
- Recuperación entre episodios: los rollouts y su experto pueden recuperarse mutuamente salvo cuando comparten la ruta de la consulta (tolerancia de 1 cm / 2°).
- Vector aprendido de misma escena para marcar fragmentos hermanos entre los fragmentos de contexto.
- No dispone de capacidades de lenguaje, tool calling, agentes ni visión general fuera del dominio robótico.

## Casos de uso

- Planificación de manipulación robótica: el modelo permite evaluar mentalmente una secuencia de acciones del efector antes de ejecutarla en el robot, generando la predicción visual de los 16 fotogramas siguientes y comparándola con el objetivo.
- Entrenamiento de políticas por imaginación: generar rollouts sintéticos condicionados en acciones para aumentar los datos de entrenamiento de políticas de manipulación en entornos como robocasa o robomimic.
- Evaluación de políticas sin hardware: simular la respuesta visual del entorno a una política candidata y medir la desviación respecto a la trayectoria experto, reduciendo el coste de pruebas físicas.
- Aprendizaje por imitación con recuperación: usar los fragmentos recuperados de grabaciones con escenas y puntos de vista compatibles (10° / 10 cm) para condicionar la predicción en demostraciones relevantes de otras sesiones.
- Modelado de incertidumbre en agarre: el estado de pinza por paso y la restricción de roll de 45° al agarrar permiten generar predicciones específicas para tareas de agarre y evaluar su plausibilidad.
- Investigación en world models: servir como checkpoint intermedio para estudiar el efecto del condicionamiento en contexto y del retrieval multivista frente a recetas sin recuperación (los hermanos recent8 y views-first de la misma ronda).
- Generación de datos contrafactuales: producir trayectorias visuales alternativas para aumentar la diversidad de datos de entrenamiento en robótica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio pesa 30,3 GB, por lo que en precisión completa requiere al menos ese orden de magnitud de memoria.
- GPU de entrenamiento: 4 nodos x 8 H100 (32 GPU H100) con HSDP y FSDP de 8 vías por nodo.
- GPU recomendadas para inferencia: no disponible; por el tamaño y la naturaleza del modelo (vídeo generativo multivista), se requiere hardware de clase centro de datos (A100/H100) con alta memoria.
- ¿Cabe en GPU de consumo? No disponible; no se documenta ninguna cuantización ni despliegue en GPU de consumo.
- Opciones de despliegue: no disponible; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a un world model de vídeo-acción).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto / condicionamiento | Licencia | Disponibilidad |
|---|---|---|---|---|
| SyncWorld-mv3-strip384-mvSV2 (este) | World model de vídeo-acción multivista con retrieval en contexto | K fragmentos observados (1-8) en la ventana de atención | OpenMDW-1.1 | Checkpoint intermedio público en Hugging Face |
| SyncWorld recent8 (hermano de la misma ronda) | World model de vídeo-acción | Fragmentos recientes, sin los cambios de retrieval | OpenMDW-1.1 (presumible) | No disponible en la información proporcionada |
| SyncWorld views-first v10-step40000 (primera ronda) | World model de vídeo-acción | Receta views-first de la primera ronda | OpenMDW-1.1 (presumible) | No disponible en la información proporcionada |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos hermanos para una comparación cuantitativa.

## Limitaciones y advertencias

- Checkpoint intermedio: corresponde a la actualización 10.000 de 20.000; el entrenamiento seguía en curso en el momento de la publicación, por lo que el rendimiento no es el final.
- Dominio restringido a manipulación robótica en los entornos de entrenamiento (robocasa, robomimic, RLBench, DROID); no es un modelo de propósito general.
- Sin capacidades de lenguaje ni de visión general; no admite tool calling ni uso como agente conversacional.
- La calidad de la predicción depende críticamente de la biblioteca de recuperación y de las reglas de selección de vistas (10° / 10 cm); fuera de esos límites, los fragmentos no se admiten.
- Riesgo de que fragmentos recuperados de escenas distintas introduzcan sesgos visuales; el vector de misma escena mitiga pero no elimina este riesgo.
- Licencia OpenMDW-1.1 con enlace a la licencia de NVIDIA Cosmos: es necesario revisar sus términos antes de cualquier uso comercial; la model card la marca como `license: other`.
- No se documentan sesgos, tasas de alucinación ni evaluaciones de robustez.
- Sin datos publicados de benchmarks, latencia ni requisitos de inferencia, lo que dificulta la evaluación previa a producción.

## Enlaces

- Hugging Face: https://huggingface.co/yyuncong/SyncWorld-mv3-strip384-mvSV2-from40k-step10000
- Licencia OpenMDW-1.1 (NVIDIA Cosmos): https://github.com/NVIDIA/Cosmos/blob/main/LICENSE
