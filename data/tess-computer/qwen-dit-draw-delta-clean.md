# TESS-Computer/qwen-dit-draw-delta-clean

# Qwen-DiT-Draw (version delta)

## Resumen

Qwen-DiT-Draw (version delta) es un modelo de tipo Vision-Language-Action (VLA) orientado a la prediccion de trayectorias continuas de raton, expresadas como secuencias de desplazamientos relativos (dx, dy, state). Lo desarrolla TESS-Computer y esta publicado en HuggingFace con licencia MIT. No es un modelo de lenguaje generativo al uso: se trata de un cabezal de accion (action head) tipo Diffusion Transformer (DiT) entrenado sobre un VLM base congelado, Qwen2.5-VL-3B-Instruct.

El modelo resuelve un problema concreto dentro de la robotica y la automatizacion de interfaces: dado un contexto visual y textual, predecir la siguiente secuencia de movimientos de un cursor o efector. El cabezal DiT tiene 6 capas y tamano oculto 512, con aproximadamente 37 millones de parametros entrenables, y se entrena con una perdida de flow matching sobre fragmentos (chunks) de 16 puntos.

Es relevante porque documenta de forma transparente un caso de estudio sobre entrenamiento de VLA: el autor reconoce que solo se entrenaron 3 epocas como prueba de concepto, lo que produce arcos parciales en lugar de circulos completos. El modelo cita la literatura (OpenVLA, GR00T, pi0) para subrayar que los VLA necesitan 20-30+ epocas para aprender patrones de accion utiles, lo que lo convierte en una referencia practica sobre expectativas de entrenamiento mas que en un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM congelado (Qwen2.5-VL-3B-Instruct) + cabezal de accion Diffusion Transformer (DiT) de 6 capas y tamano oculto 512 |
| Parametros totales | ~3.000 millones del VLM base (congelado) + ~37 millones del cabezal de accion entrenable |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio contiene un checkpoint PyTorch de la cabeza de trayectoria) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | Checkpoint PyTorch de la cabeza de trayectoria (`trajectory_head.pt`); el VLM base se carga desde HuggingFace (`Qwen/Qwen2.5-VL-3B-Instruct`) |
| Tamano del repositorio | 0,1 GB |
| Pipeline declarado | robotics |
| Modo de coordenadas | Delta (movimientos relativos) |

## Arquitectura y entrenamiento

La arquitectura combina dos componentes. Por un lado, un modelo de vision-lenguaje congelado, Qwen2.5-VL-3B-Instruct, que actua como extractor de representaciones multimodales y no se actualiza durante el entrenamiento (`freeze_backbone=True`). Por otro, un cabezal de accion de tipo Diffusion Transformer de 6 capas con tamano oculto 512 y aproximadamente 37 millones de parametros entrenables, que genera las trayectorias. El entrenamiento emplea una perdida de flow matching sobre fragmentos de 16 puntos, en modo de coordenadas delta al estilo GR00T N1.6: en el primer fragmento, el primer punto es absoluto y el resto son deltas; en los fragmentos siguientes, todos los puntos son deltas respecto al ultimo punto del fragmento anterior. La reconstruccion de posiciones absolutas se realiza con `np.cumsum` (mas el ultimo punto del fragmento previo a partir del segundo fragmento).

Los datos de entrenamiento provienen del dataset TESS-Computer/quickdraw-circles-delta-clean, con 21.207 fragmentos (chunks). El entrenamiento se realizo durante 3 epocas, con tamano de lote 4 y tasa de aprendizaje 1e-4, alcanzando una perdida final de 0,111. La model card subraya explicitamente que se trata de una prueba de concepto: citando a OpenVLA, senala que los modelos VLA necesitan iterar significativamente mas veces sobre el dataset (20-30+ epocas) que un LLM o VLM convencional, y atribuye a la falta de iteraciones que el modelo produzca arcos parciales en lugar de circulos completos. No se documentan fases de RLHF o DPO.

## Capacidades

- Prediccion de trayectorias continuas de raton como secuencias de deltas (dx, dy, state) en fragmentos de 16 puntos.
- Generacion condicionada por vision y lenguaje, al apoyarse en el VLM base Qwen2.5-VL-3B-Instruct congelado.
- Reconstruccion de posiciones absolutas a partir de deltas mediante suma acumulada.
- Modo de coordenadas relativas (delta), pensado para estabilidad en predicciones de movimiento continuo.
- Capacidad de dibujo/gesto limitada: genera arcos parciales de circulos (no completos) con el entrenamiento actual.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.
- No se documentan capacidades multilingues especificas.

## Casos de uso

- Investigacion en aprendizaje por imitacion para robotica: el modelo sirve como banco de pruebas para estudiar como la perdida de flow matching y el numero de epocas afectan al aprendizaje de patrones de accion en VLA.
- Automatizacion de interfaces graficas (GUI): prediccion del siguiente movimiento del cursor para agentes que operan raton en entornos de escritorio, usando los deltas para mayor estabilidad.
- Control de brazo robotico en tareas de dibujo o trazado: el cabezal genera secuencias de movimiento continuo que pueden mapearse a comandos de efector final.
- Generacion de trazos y bocetos: dado un objetivo visual, producir trayectorias de dibujo por fragmentos (util como componente de un sistema mayor de sketch generation).
- Teleoperacion asistida y prediccion de intencion: estimar la trayectoria futura del usuario a partir de contexto visual, con aplicaciones en interfaces adaptativas.
- Docencia y ejemplos reproducibles: por su tamano reducido y su documentacion explicita de hiperparametros, es util como caso didactico de construccion de un cabezal DiT sobre un VLM congelado.
- Base para fine-tuning extendido: al ser una prueba de concepto con licencia MIT, puede reentrenarse con mas epocas o datasets mayores para tareas de prediccion de trayectoria especificas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada por el autor es la perdida final de entrenamiento (0,111) con 21.207 fragmentos, 3 epocas, lote 4 y tasa de aprendizaje 1e-4. No hay datos de MMLU, HumanEval, GSM8K ni de metricas de robotica (por ejemplo, tasa de exito en tareas).

| Metrica | Valor |
|---|---|
| Perdida final de entrenamiento | 0,111 |
| Epocas | 3 |
| Fragmentos (chunks) de entrenamiento | 21.207 |
| Tamano de lote | 4 |
| Tasa de aprendizaje | 1e-4 |
| Benchmarks publicos (MMLU, HumanEval, GSM8K, etc.) | no disponible |

## Requisitos de hardware

Las cifras siguientes son estimaciones basadas en el tamano del VLM base (Qwen2.5-VL-3B-Instruct); el autor no publica requisitos oficiales.

- VRAM estimada en FP16/BF16 para el VLM base: en torno a 7-9 GB (pesos ~6-7 GB mas cache KV y overhead del codificador visual).
- VRAM estimada con cuantizacion INT8: en torno a 4-5 GB.
- VRAM estimada con cuantizacion INT4: en torno a 2,5-3,5 GB.
- GPU profesionales: A100, H100 y L40S ejecutan el VLM base con holgura en FP16.
- GPU de consumo: cabe en RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB y RTX 4090 de 24 GB en FP16; en tarjetas de 8 GB conviene recurrir a cuantizacion del VLM base.
- Opciones de despliegue: el VLM base puede servirse con transformers, vLLM, TGI o llama.cpp/Ollama (con cuantizacion GGUF). El cabezal de trayectoria requiere el codigo del repositorio (`src.model.Qwen2_5_VL_Draw`, `TrajectoryConfig`) y el archivo `trajectory_head.pt`, por lo que no se integra en los servidores de inferencia estandar sin trabajo adicional.
- Latencia y throughput estimados: no disponible.
- Nota: el modelo base Qwen2.5-VL-3B-Instruct debe descargarse por separado; el repositorio (0,1 GB) solo contiene los pesos de la cabeza de trayectoria.

## Comparativa con modelos similares

La model card menciona OpenVLA, GR00T y pi0 como trabajos de referencia sobre entrenamiento de VLA. No se dispone de especificaciones detalladas de esos modelos en la informacion proporcionada, por lo que la comparacion se limita a aspectos cualitativos.

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-DiT-Draw (delta) | ~3.000 M (VLM congelado) + ~37 M (cabezal DiT) | no disponible | VLM congelado + cabezal DiT, flow matching, coordenadas delta | MIT | HuggingFace (TESS-Computer) |
| OpenVLA | no disponible en la informacion proporcionada | no disponible | VLA de referencia; citado por la necesidad de 20-30+ epocas | no disponible | no disponible |
| GR00T (N1.6) | no disponible en la informacion proporcionada | no disponible | Referencia para el estilo de coordenadas delta | no disponible | no disponible |
| pi0 | no disponible en la informacion proporcionada | no disponible | VLA de referencia; citado por la necesidad de mas epocas | no disponible | no disponible |

## Limitaciones y advertencias

- Prueba de concepto: solo 3 epocas de entrenamiento. El autor indica explicitamente que el modelo produce arcos parciales en lugar de circulos completos.
- Sesgos conocidos: no documentados; el dataset se limita a trazos de circulos (quickdraw-circles), por lo que la generalizacion a otras formas o tareas es dudosa.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero si existe riesgo de trayectorias incorrectas o incompletas fuera de la distribucion de entrenamiento.
- Limitacion de dominio: el entrenamiento se centra en dibujar circulos; no hay evidencia de buen rendimiento en manipulacion robotica real.
- Datos de contexto, idiomas y cuantizacion no documentados en la ficha del modelo.
- Restricciones de licencia: licencia MIT, que permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de copyright y la licencia. Debe verificarse tambien la licencia del VLM base Qwen2.5-VL-3B-Instruct, que se distribuye por separado.
- Para produccion: requiere integrar codigo propio (no es un modelo plug-and-play en vLLM o TGI) y validar el rendimiento en la tarea concreta antes de cualquier despliegue.
- Fecha de publicacion del repositorio: 16 de octubre de 2026 (creado), ultima actualizacion el mismo dia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TESS-Computer/qwen-dit-draw-delta-clean
- Repositorio GitHub: https://github.com/TESS-Computer/qwen-dit-draw-clean
- Dataset: https://huggingface.co/datasets/TESS-Computer/quickdraw-circles-delta-clean
- Version en coordenadas absolutas: https://huggingface.co/TESS-Computer/qwen-dit-draw-clean
- VLM base: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- Paper de OpenVLA (citado por el autor): no disponible en la informacion proporcionada
- Documentacion de GR00T (citado por el autor): no disponible en la informacion proporcionada
- Proyecto pi0 (citado por el autor): no disponible en la informacion proporcionada
