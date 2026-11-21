# Zili2002/franka-f8-pi05-ema

## Resumen

Franka F8 es una colección de políticas robóticas de manipulación fine-tuneadas a partir de π0.5-DROID, el modelo vision-language-action (VLA) desarrollado por Physical Intelligence. Cada variante publicada en el repositorio es una política de tres tareas entrenada para un robot Franka Research 3 (FR3) con pinza y teleoperación GELLO, orientada a la ejecución de instrucciones cortas como "pick up orange", "press button" o "push red block". El autor del repositorio es Zili2002 y la ficha se publicó en noviembre de 2026.

El modelo no es un LLM de propósito general: es un checkpoint de inferencia que, dada una observación multimodal compuesta por una imagen de muñeca, una imagen exterior opcional, las posiciones articulares actuales y el comando previo de pinza, genera una secuencia de 16 acciones a 15 Hz. La arquitectura subyacente es la de π0.5-DROID, un transformer VLA con backbone PaliGemma que combina visión, lenguaje y salida de acciones continuas.

La relevancia de esta publicación es acotada pero concreta: ofrece pesos EMA (decay 0,99) tras 30.000 actualizaciones de optimizador con batch 32 y semilla 42, junto con la normalización DROID específica de cada checkpoint. No se distribuyen estados del optimizador, interfaces de robot ni grabaciones, y los pesos no han sido validados para ejecución física autónoma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) derivada de π0.5-DROID, backbone PaliGemma |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuyen pesos EMA en `ema.tar`, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (las tareas se especifican en inglés: `pick up orange`, `press button`, `push red block`) |
| Licencia | other (Gemma Terms of Use, con restricciones de la sección 3.2 y Prohibited Use Policy) |
| Formato de pesos | `ema.tar` (checkpoint JAX/OpenPI) más `meta.json` por variante; tokenizer PaliGemma obtenido vía OpenPI, no redistribuido |

## Arquitectura y entrenamiento

El modelo parte de π0.5-DROID, un VLA de Physical Intelligence que procesa observaciones multimodales (imágenes RGB, estado propioceptivo y consigna de tarea en lenguaje natural) y emite acciones continuas. En esta release, la política se ha fine-tuneado para tres tareas específicas sobre un Franka FR3, con 30.000 actualizaciones de optimizador, batch de 32, semilla 42 y EMA de decay 0,99. Cada variante incluye su propia normalización DROID, por lo que `ema.tar` y `meta.json` deben usarse siempre en pareja.

Las variantes se diferencian por el preprocesamiento de cámara: `U` conserva la imagen de muñeca completa; `C` recorta las columnas `[320,960)` y rellena el exterior en gris; `B`, `S`, `D` y `M` usan la cámara 2 nominal en inferencia, aunque durante el entrenamiento emplearon respectivamente cámara base, desplazamiento de borde, dropout y múltiples cámaras exteriores; `R` enmascara la entrada exterior. Las imágenes se redimensionan con padding a 224×224. No hay aumento aleatorio de cámara en inferencia. El entrenamiento se realizó con JAX sobre OpenPI en una revisión concreta del repositorio (commit `215abfb217dbac7d5f1273282331b9b1866c0479`), con Python 3.11.

## Capacidades

- Generación de acciones de manipulación robótica: 16 pasos a 15 Hz por inferencia, con 7 grados de libertad de articulaciones más un canal de cierre de pinza.
- Percepción visual multimodal: imagen de muñeca obligatoria y cámara exterior opcional (según variante).
- Condicionamiento por lenguaje natural: la tarea se especifica como cadena Unicode (`pick up orange`, `press button`, `push red block`).
- Condicionamiento propioceptivo: posiciones articulares actuales en radianes (`fr3_joint1` … `fr3_joint7`) y comando previo de pinza GELLO (0 cerrado, 1 abierto).
- Doble representación de salida: `actions` en formato de entrenamiento `[16,8]` (delta normalizado por 0,2 y cierre DROID) y `action_json.data` con posiciones objetivo en radianes y comando de pinza en convención GELLO original.
- Servidor HTTP local de inferencia (`/predict`, `/health`, `/config`) para integración con otros componentes.
- No soporta tool calling, function calling, razonamiento multi-paso genérico, matemáticas, código ni audio: es una política robótica especializada, no un modelo conversacional.

## Casos de uso

- Recolección de naranjas en entorno controlado: la variante `U` o `C` puede generar trayectorias de aproximación y cierre de pinza sobre una naranja, usando la imagen de muñeca completa o recortada según la configuración de cámara disponible en el banco de pruebas.
- Pulsación de botones en paneles: con la variante `B` (cámara base) o `S` (desplazamiento de borde), el modelo produce comandos articulares para posicionar el efector sobre un botón y ejecutar la pulsación a partir de la instrucción `press button`.
- Empuje de bloques en tareas de pick-and-place simplificado: la instrucción `push red block` activa una política entrenada para desplazar un bloque rojo, útil en experimentos de manipulación no prensil.
- Evaluación comparativa de variantes de aumento de cámara: `B`, `S`, `D`, `M` y `R` permiten estudiar la robustez frente a distintas configuraciones de cámara exterior (base, desplazamiento, dropout, múltiples cámaras, enmascarado) sin reentrenar, comparando predicciones sobre el mismo `observation.npz`.
- Investigación en VLA y fine-tuning desde π0.5-DROID: el repositorio sirve como referencia reproducible (semilla 42, 30k updates, EMA 0,99) para estudiar el efecto del fine-tuning de tres tareas sobre un modelo base preentrenado.
- Integración en pipelines de simulación o banco de pruebas offline: el servidor HTTP local permite conectar la política a un simulador o a un bucle de evaluación que envíe observaciones NPZ y registre las acciones devueltas, sin necesidad de robot físico.
- Análisis de normalización DROID: la pareja `ema.tar` + `meta.json` por variante facilita validar la reconstrucción inversa de acciones (`position = current_q + 0.2 * sum(actions[:i+1, :7])`) en herramientas de análisis de trayectorias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el tamaño del repositorio es de 12,4 GB, lo que da una cota inferior del espacio en disco necesario para los pesos.
- GPU recomendadas: no disponible. El stack es JAX + OpenPI, por lo que se requiere una GPU compatible con JAX/CUDA; no se especifican modelos concretos.
- ¿Cabe en GPU de consumo? no disponible.
- Opciones de despliegue: JAX con OpenPI en la revisión indicada (`uv sync`, `uv pip install -e .`), ejecución local con `inference.py` (modo batch o servidor HTTP en `--port 8080`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de checkpoint VLA.
- Latencia y throughput: no disponibles; la política emite 16 acciones a 15 Hz por inferencia, pero no se publican tiempos de cómputo.

## Comparativa con modelos similares

| Modelo | Tipo | Tareas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Franka F8 (este) | VLA fine-tuneado desde π0.5-DROID | 3 tareas Franka FR3 | no disponible | Gemma Terms of Use | Pesos EMA en Hugging Face, 12,4 GB |
| π0.5-DROID (upstream) | VLA base | multi-tarea DROID | no disponible | según Physical Intelligence | Repositorio OpenPI |
| Otras políticas robóticas open source | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Los pesos no han sido validados para ejecución física autónoma; el autor indica explícitamente que el código devuelve solo números.
- Solo cubre tres tareas concretas (`pick up orange`, `press button`, `push red block`) sobre un Franka FR3 con teleoperación GELLO; no generaliza a otras instrucciones ni robots sin reentrenamiento.
- No se distribuyen estados del optimizador, interfaz de robot ni grabaciones; el dataset de origen (Franka three-task raw data) no otorga licencia ni derechos sobre sus grabaciones.
- La licencia es "other" con Gemma Terms of Use, incluidas las restricciones de uso de la sección 3.2 y la Prohibited Use Policy; el uso comercial está sujeto a dichos términos.
- El tokenizer PaliGemma no se redistribuye y debe obtenerse a través de OpenPI.
- Las salidas `actions` no se recortan silenciosamente; el recorte físico de la pinza se registra en `gripper_clipped_steps`, lo que exige que el consumidor gestione esos índices.
- Las posiciones devueltas son objetivos reconstruidos en bucle abierto, no estados observados del robot; no incluyen timestamps, velocidades, esfuerzos ni poses del efector.
- No hay información sobre sesgos, alucinación en el sentido lingüístico ni cobertura multilingüe; la especificación de tarea está en inglés.
- El repositorio tiene 0 descargas y 0 likes en el momento de la ficha, sin validación comunitaria documentada.

## Enlaces

- Hugging Face: https://huggingface.co/Zili2002/franka-f8-pi05-ema
- OpenPI (Physical Intelligence): https://github.com/Physical-Intelligence/openpi
- Revisión concreta de OpenPI requerida: https://github.com/Physical-Intelligence/openpi/tree/215abfb217dbac7d5f1273282331b9b1866c0479
- Dataset de origen: https://huggingface.co/datasets/rsj2003/franka-three-task-raw-data
