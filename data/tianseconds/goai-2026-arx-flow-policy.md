# tianSeconds/goai-2026-arx-flow-policy

## Resumen

El modelo `goai-2026-arx-flow-policy` es un checkpoint de entrenamiento de una política de control robótico basada en flow matching, desarrollado por el usuario tianSeconds. Está diseñado para un robot de doble brazo de la plataforma ARX, y se entrena sobre el conjunto de datos LeRobot v3.0, concretamente en las tareas 800 a 899, con 100 episodios y 26 550 fotogramas. El objetivo es predecir acciones de control (posición, rotación en representación 6D y apertura del gripper) a partir de observaciones visuales de tres cámaras.

La arquitectura combina un extractor visual DINOv2 congelado (variante `dinov2_vits14`) con un backbone Transformer para difusión (12 capas, 768 dimensiones de embedding, 12 cabezas de atención causal) y una cabeza de acción específica para el efector final ARX. El modelo tiene 119,1 millones de parámetros entrenables, mientras que el extractor visual permanece congelado. Se entrena mediante flow matching con un esquema de interpolación lineal entre ruido y acción, y se publican varios checkpoints intermedios (pasos 1000, 2000, 3000 y un final en 5000 según el historial de commits).

Este modelo es relevante para la comunidad de robótica y aprendizaje por refuerzo, ya que demuestra una aplicación práctica de flow matching sobre arquitecturas transformer para control de robots, y sirve como punto de partida para experimentos de fine-tuning o evaluación en tareas de manipulación bimanual. No se trata de un modelo de lenguaje ni de visión general, sino de un componente especializado dentro de un pipeline de política visual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DINOv2 congelado (dinov2_vits14) + TransformerForDiffusion (causal attention, 12 capas, 768 embd, 12 cabezas) + cabeza de accion ARX ee6d |
| Parametros totales | No especificado (119,1 M entrenables; DINOv2 congelado anade ~21 M, total estimado ~140 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de politica visual, no procesa texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo de control robotico) |
| Licencia | No disponible |
| Formato de pesos | PyTorch (.pt), checkpoints en archivos individuales con `model_state_dict`, `optimizer_state_dict` y `global_step` |

## Arquitectura y entrenamiento

El modelo sigue el esquema de `patch_policy` de LeRobot. La entrada visual consiste en tres vistas: una cámara alta (`cam_high`) y dos cámaras de muñeca (izquierda y derecha), cada una redimensionada a 224x224 píxeles. Cada vista se divide en 256 parches, que se procesan mediante un DINOv2 congelado (`dinov2_vits14`) para obtener embeddings precalculados. Estos embeddings se alimentan a un Transformer causal de 12 capas con 768 dimensiones de embedding y 12 cabezas de atención, que actúa como backbone de difusión. La cabeza de acción predice una acción de 6 grados de libertad más el estado del gripper (posición, rotación 6D y apertura), utilizando flow matching para generar la acción limpia a partir de ruido.

El entrenamiento emplea flow matching con una interpolación lineal `x_t = ruido * t + accion * (1 - t)` y una distribución uniforme estratificada para el tiempo `t`. Se usa un tamaño de lote de 256, optimizador AdamW con tasa de aprendizaje 1e-4 y calentamiento de 400 pasos, gradiente recortado a norma 1.0, y precisión bf16 mediante la librería Accelerate. Los embeddings de DINOv2 se precomputan, por lo que no se aplica aumento de datos por fotograma. Los checkpoints se guardan como archivos `.pt` individuales que contienen el estado del modelo, el optimizador y el paso global; las versiones más recientes incluyen además el estado RNG por rango para permitir reanudar el entrenamiento con la misma secuencia de dropout.

## Capacidades

- Predicción de acciones de control para robot de doble brazo: posición cartesiana, rotación en representación 6D y apertura del gripper.
- Procesamiento de observaciones visuales desde tres cámaras simultáneas (una alta y dos de muñeca).
- Generación de acciones mediante flow matching, lo que permite muestrear trayectorias de acción condicionadas a la observación.
- Integración con el ecosistema LeRobot (v3.0), incluyendo el formato de dataset y el backbone `TransformerForDiffusion`.
- Entrenamiento y reanudación desde checkpoints con estado completo del optimizador y RNG.
- No incluye capacidades de lenguaje, visión general, tool calling ni razonamiento simbólico; es un modelo puramente motor.

## Casos de uso

- Manipulación bimanual en entornos de laboratorio: el modelo puede controlar un robot ARX de doble brazo para tareas de recogida y colocación, aprovechando las tres vistas de cámara para percibir el entorno.
- Fine-tuning sobre tareas específicas de LeRobot: al ser un checkpoint de entrenamiento, se puede reanudar el entrenamiento desde cualquiera de los pasos guardados (1000, 2000, 3000 o 5000) para adaptarlo a nuevas tareas con pocos episodios.
- Evaluación de algoritmos de flow matching en robótica: sirve como referencia para comparar estrategias de muestreo, horarios de ruido o arquitecturas de difusión en el contexto de control motor.
- Investigación sobre representaciones visuales congeladas: al mantener DINOv2 congelado, permite estudiar cómo influye un extractor visual preentrenado en el aprendizaje de políticas motoras.
- Desarrollo de sistemas de teleoperación o demostración: el modelo puede utilizarse para reproducir trayectorias aprendidas a partir de demostraciones humanas, dado que el dataset de LeRobot contiene episodios de demostración.
- Pruebas de robustez ante variaciones de iluminación o punto de vista: las tres cámaras proporcionan redundancia visual, y el modelo puede evaluarse en condiciones ligeramente diferentes a las del entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de éxito, tasas de acierto ni comparaciones con otros modelos. El autor no proporciona datos de rendimiento en tareas de manipulación, por lo que no es posible cuantificar su eficacia relativa.

## Requisitos de hardware

- No se especifican requisitos oficiales por parte del autor.
- Estimación orientativa: con ~140 M de parámetros totales en bf16, el modelo ocupa aproximadamente 280 MB en memoria para los pesos entrenables, más el DINOv2 congelado (~42 MB). La inferencia debería caber en cualquier GPU con 4 GB de VRAM o más, incluyendo tarjetas consumer como la RTX 3060 o superiores.
- El entrenamiento, según la configuración descrita (batch 256, bf16), requiere una GPU con al menos 16 GB de VRAM para un lote razonable, o varias GPUs con Accelerate.
- Opciones de despliegue: al ser un checkpoint de PyTorch, puede cargarse directamente en scripts de LeRobot o en un entorno de inferencia personalizado. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (políticas de flow matching para doble brazo con DINOv2 congelado). El autor no proporciona comparaciones con otras políticas de LeRobot ni con métodos alternativos. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo se entrena únicamente con 100 episodios de una tarea específica (task 800-899), por lo que su capacidad de generalización a otras tareas o entornos es muy limitada.
- El extractor visual DINOv2 está congelado y los embeddings se precomputan sin aumento de datos por fotograma, lo que puede reducir la robustez frente a cambios de iluminación, oclusión o punto de vista.
- No se proporciona información sobre sesgos, pero al ser un modelo entrenado en un dataset concreto, puede reflejar los sesgos del entorno de recogida de datos (por ejemplo, posiciones de cámara fijas, objetos específicos).
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero el modelo puede producir acciones no válidas o inestables si se usa fuera de la distribución de entrenamiento.
- La licencia no está especificada, por lo que se desconoce si el uso comercial está permitido. Se recomienda contactar con el autor antes de utilizarlo en producción.
- Los checkpoints incluyen el estado del optimizador, lo que facilita la reanudación, pero también implica que los archivos son más pesados y contienen información sensible al entrenamiento.
- No hay garantías de que el modelo funcione en hardware diferente al utilizado por el autor; la precisión bf16 requiere soporte de la GPU.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/tianSeconds/goai-2026-arx-flow-policy
- Árbol de archivos del repositorio: https://huggingface.co/tianSeconds/goai-2026-arx-flow-policy/tree/main
- Perfil del autor: https://huggingface.co/tianSeconds
