# Woohi123/act_towel_half42_gate28_grasp28_065000

## Resumen

ACT (Action Chunking Transformer) es una política de imitación para robótica entrenada por Woohi123 para el robot bimanual SO-101. El modelo aprende a doblar una toalla en dos fases: un primer pliegue por la mitad (pasos 0-41 del dataset) y un segundo pliegue tipo "puerta" (pasos 42-69), con episodios adicionales de práctica de agarre (pasos 70-97). El checkpoint corresponde al paso 65.000 de entrenamiento y se distribuye en formato safetensors con la librería LeRobot.

El modelo resuelve una tarea de manipulación concreta y de contacto deformable, donde la política debe coordinar dos brazos, tres cámaras y un estado articular de 12 dimensiones para producir acciones de 12 dimensiones en chunks de 100 pasos. No es un modelo de lenguaje ni un modelo generativo de propósito general: es un controlador visomotor entrenado por imitación sobre 98 episodios a 30 fps.

Su relevancia es práctica para la comunidad de robótica open source que trabaja con SO-101 y LeRobot: publica un checkpoint reproducible con instrucciones de descarga, datos de normalización y una referencia de éxito declarada por el autor (8 de 10 intentos en hardware real el 2026-10-23). El autor advierte que cambios en calibración o en el ángulo de cámara degradan el rendimiento, lo que convierte la reproducibilidad del montaje en un requisito de primer orden.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer), política de imitación visomotora |
| Parámetros totales | 51.680.908 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observación por chunk de 100 acciones) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

ACT es un transformer de acción por chunks: el modelo consume observaciones (tres cámaras —muñeca izquierda, muñeca derecha y cámara superior Astra— más un vector de estado articular de 12 dimensiones) y emite un chunk de 100 acciones de 12 dimensiones. Esta formulación reduce el error de acumulación típico de las políticas paso a paso y permite un control más suave en tareas de contacto. El repositorio ocupa 0,2 GB y contiene 51,68 M de parámetros en safetensors.

El entrenamiento se realizó sobre 98 episodios grabados a 30 fps, segmentados por fases: 0-41 para el pliegue por la mitad, 42-69 para el pliegue tipo puerta y 70-97 para práctica de agarre. El checkpoint publicado corresponde al paso 65.000. No se especifican en la información disponible el número total de tokens, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente en este tipo de políticas). Los metadatos del dataset se publican por separado en `Woohi123/towel_tape_70_half42_gate28_grasp28_meta`, y las estadísticas de normalización están en `meta/stats.json` y en los ficheros `policy_*_normalizer`.

## Capacidades

- Control visomotor bimanual para plegado de toallas en dos fases (mitad y puerta).
- Entrada multimodal: tres flujos de cámara más estado articular de 12 dimensiones.
- Salida de acciones articulares de 12 dimensiones en chunks de 100 pasos.
- Ejecución sobre el robot SO-101 con la pila LeRobot.
- Práctica de agarre incluida en el dataset (episodios 70-97), orientada a la sujeción de la tela.
- No soporta tool calling, function calling ni razonamiento multi-paso simbólico.
- No dispone de capacidades multilingües, de visión general ni de audio.
- No incorpora modo "thinking" ni decodificación especulativa.

## Casos de uso

- Plegado automatizado de toallas en laboratorio: el modelo ejecuta la secuencia completa (mitad y puerta) sobre SO-101, adecuado para demostraciones reproducibles de manipulación deformable.
- Reproducción de experimentos de imitación: sirve como checkpoint de referencia para comparar variantes de ACT, tasas de éxito y sensibilidad a la calibración en el mismo montaje.
- Base para fine-tuning con nuevos episodios: al publicarse los metadatos y las estadísticas de normalización, se puede reentrenar o adaptar a telas y tamaños distintos.
- Estudio de robustez frente a cambios de cámara: el autor documenta la caída de éxito al variar la calibración o el ángulo de la cámara, lo que permite diseñar experimentos de dominio.
- Evaluación de políticas bimanuales en entornos docentes: la tarea es acotada, medible (éxito/fallo en 10 intentos) y comprensible para prácticas de robótica.
- Integración en pipelines de investigación con LeRobot: descarga vía `hf download` y ejecución con el runner documentado en `towel_fold_handover.html`, útil para pruebas de extremo a extremo.
- Benchmark interno de agarre: los episodios de práctica de agarre permiten evaluar la fase de sujeción de forma aislada antes de encadenar el plegado.

## Benchmarks y rendimiento

El autor declara una tasa de éxito de 8 sobre 10 intentos en hardware real el 2026-10-23, cubriendo plegado por la mitad y plegado tipo puerta. No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K ni equivalentes de robótica) en la información disponible.

| Métrica | Resultado | Condiciones |
|---|---|---|
| Tasa de éxito en hardware real | 8/10 | 2026-10-23, montaje y calibración originales |
| Tasa de éxito tras cambio de hardware | no disponible (el autor indica que disminuye) | Calibración o ángulo de cámara distintos |
| Benchmarks estandarizados | no disponible | — |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 51,68 M de parámetros el modelo es pequeño, pero el consumo real depende de los tres flujos de cámara y del pipeline LeRobot.
- GPU recomendadas: no disponible; cualquier GPU compatible con PyTorch y LeRobot debería ser suficiente, pero no se especifica.
- ¿Cabe en GPU de consumo? No confirmado en la información disponible; por tamaño de parámetros es plausible, pero no hay dato oficial.
- Opciones de despliegue: LeRobot con el runner descrito en `towel_fold_handover.html`; descarga mediante `hf download`. No se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de política).
- Latencia y throughput: no disponibles. El control opera a 30 fps según la frecuencia de grabación del dataset, pero no se publica latencia medida.
- Hardware robótico requerido: SO-101 bimanual, tres cámaras (muñeca izquierda, muñeca derecha y Astra superior) y calibración idéntica a la del entrenamiento.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La comparación con otras políticas ACT para SO-101 o con alternativas como Diffusion Policy requeriría datos que no se han facilitado.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACT towel half42 gate28 grasp28 065000 | 51,68 M | no aplica | 8/10 en hardware real (2026-10-23) | Apache 2.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sensibilidad al montaje: el autor indica explícitamente que cambios en la calibración o en el ángulo de cámara reducen la tasa de éxito; es imprescindible replicar la geometría de entrenamiento.
- Dominio estrecho: solo cubre plegado de toallas en dos fases y práctica de agarre; no generaliza a otras telas, tamaños ni tareas.
- Dataset limitado: 98 episodios a 30 fps es un volumen pequeño, lo que aumenta el riesgo de sobreajuste al entorno concreto.
- Sin datos de sesgo, alucinación o robustez fuera de la tarea: no aplican las métricas habituales de modelos de lenguaje, pero tampoco se documentan evaluaciones de robustez ante iluminación, fondos o posiciones iniciales distintas.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución, pero el autor no ofrece garantías sobre el rendimiento en producción.
- Sin cuantizaciones publicadas: no hay versiones GGUF ni alternativas de despliegue ligero documentadas.
- Dependencia de la documentación de traspaso: la ejecución correcta requiere consultar `towel_fold_handover.html`, no incluido en la información disponible.
- Fecha de creación futura (2026-10-28): conviene verificar la integridad y procedencia del repositorio antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Woohi123/act_towel_half42_gate28_grasp28_065000
- Dataset de metadatos: https://huggingface.co/datasets/Woohi123/towel_tape_70_half42_gate28_grasp28_meta
- Documentación de traspaso: `towel_fold_handover.html` (referenciada en la model card, no enlazada)
- LeRobot: no disponible en la información proporcionada
- Paper de ACT: no disponible en la información proporcionada
- Repositorio de código: no disponible en la información proporcionada
