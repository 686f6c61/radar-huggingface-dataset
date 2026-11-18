# Zaidoppa/tinydepth-robot

## Resumen

TinyDepth-Robot es un modelo de estimación de profundidad monocular relativa disenado especificamente para robotica y dispositivos de borde. Lo desarrolla el usuario independiente Zaidoppa y se distribuye bajo licencia Apache 2.0. El modelo resuelve el problema de obtener mapas de profundidad densos en hardware con recursos muy limitados, donde los modelos de profundidad de proposito general resultan demasiado pesados.

Tecnicamente es el resultado de destilar Depth-Anything-V2-Small (24,8 millones de parametros) en una arquitectura de solo 1.384.321 parametros: un encoder MobileNetV4-Small con decoder FPN de convoluciones separables en profundidad. Esto supone una reduccion de aproximadamente 18 veces respecto al profesor, manteniendo una calidad util para razonamiento de obstaculos y espacio libre.

Su relevancia actual radica en que demuestra que la destilacion sobre datasets pequenos y entrenamiento en CPU puede producir modelos de percepcion viables para navegacion de robots de bajo coste. La salida es disparidad (profundidad inversa relativa), sin escala metrica, lo que lo hace adecuado para tareas de evitacion de obstaculos mas que para medicion absoluta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder MobileNetV4-Small (`mobilenetv4_conv_small.e2400_r224_in1k`) + decoder FPN con convoluciones separables en profundidad |
| Parametros totales | 1.384.321 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de vision, entrada de imagen 320x240 por defecto, dimensiones multiplos de 32) |
| Tipos de cuantizacion | No disponible (se distribuyen pesos PyTorch en safetensors y un grafo ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | No aplica (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | `model.safetensors` (PyTorch) y `tinydepth.onnx` (ONNX) |

## Arquitectura y entrenamiento

El modelo sigue un esquema encoder-decoder. El encoder es una MobileNetV4-Small inicializada con pesos de ImageNet, y el decoder es una FPN ligera basada en convoluciones separables en profundidad, lo que mantiene el coste computacional muy bajo. La entrada es RGB normalizada con estadisticas de ImageNet, con 320x240 como resolucion por defecto y la restriccion de que alto y ancho sean multiplos de 32.

El entrenamiento se realizo integramente en CPU sobre aproximadamente 2.800 imagenes del dataset DIODE (interiores y exteriores). Las etiquetas no fueron ground truth, sino pseudo-etiquetas generadas por el profesor Depth-Anything-V2-Small. La funcion de perdida combina un L1 invariante a escala y desplazamiento (normalizacion mediana/MAD al estilo MiDaS) con una perdida de coincidencia de gradientes multi-escala. Se uso AdamW con schedule OneCycle, 15 epocas, batch de 16, recortes aleatorios de 288x224, volteos horizontales y color jitter; el mejor checkpoint correspondio a la epoca 12.

## Capacidades

- Estimacion de profundidad monocular relativa a partir de una unica imagen RGB.
- Salida de disparidad (profundidad inversa relativa) con valores mayores para objetos mas cercanos, sin escala absoluta.
- Inferencia en CPU y en dispositivos de borde gracias a su tamano reducido.
- Exportacion a ONNX para despliegue con `onnxruntime`.
- Ejecucion sobre webcam en tiempo real mediante el script de inferencia incluido.
- Razonamiento de obstaculos y espacio libre a partir del mapa de disparidad.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues (es un modelo puramente visual).

## Casos de uso

- Evitacion de obstaculos en robots moviles de bajo coste: el mapa de disparidad permite identificar regiones cercanas y libres en tiempo real sobre CPU, sin necesidad de GPU dedicada.
- Robotica educativa y prototipado: su tamano de 1,36 millones de parametros permite ejecutarlo en placas como Raspberry Pi o equivalentes para experimentos de percepcion.
- Navegacion de drones y micro-vehiculos: la baja latencia y el reducido consumo de memoria encajan con plataformas embebidas con restricciones de peso y energia.
- Segmentacion de espacio libre en interiores: combinando la disparidad con umbrales se puede delimitar la zona transitable para planificacion de trayectorias.
- Preprocesado en pipelines de vision: generar mapas de profundidad como caracteristica adicional para tareas posteriores de deteccion o segmentacion en sistemas con recursos limitados.
- Demos interactivas y webcam: el script de inferencia permite visualizar profundidad en directo, util para validacion rapida de conceptos antes de integrar un modelo mayor.
- Reconstruccion aproximada de escena: con calibracion de escala y desplazamiento por escena (plano de suelo conocido o puntos lidar) se puede obtener profundidad cuasi-metrica para tareas de mapeo simple.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre DIODE val (n=167), con escala y desplazamiento alineados al ground truth:

| Modelo | Parametros | AbsRel (menor es mejor) | δ1 (mayor es mejor) |
|---|---|---|---|
| Depth-Anything-V2-Small (profesor) | 24,8M | 0,213 | 0,736 |
| TinyDepth-Robot | 1,36M | 0,266 | 0,635 |

Ambos modelos se evaluaron a 320x240 (las predicciones del profesor se generaron a 392x294 y luego se redimensionaron). No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32; el modelo cabe holgadamente en cualquier GPU consumer e incluso en memoria unificada de SoCs.
- GPU recomendadas: no requiere GPU; funciona en CPU. Cualquier GPU consumer (por ejemplo, RTX 3060 o superior) lo ejecuta con latencia minima, aunque no es necesario.
- Cabe en GPU consumer: si, en practicamente cualquier modelo, e incluso en CPU y en dispositivos de borde.
- Opciones de despliegue: PyTorch nativo, ONNX Runtime (archivo `tinydepth.onnx` incluido), y potencialmente conversiones a otros runtimes a partir del ONNX. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de vision).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; el autor indica que el entrenamiento se hizo en CPU y que el modelo esta pensado para inferencia en borde, pero no publica cifras de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo de salida | Licencia | Disponibilidad |
|---|---|---|---|---|
| TinyDepth-Robot | 1,36M | Profundidad relativa (disparidad) | Apache 2.0 | Hugging Face (PyTorch + ONNX) |
| Depth-Anything-V2-Small (profesor) | 24,8M | Profundidad relativa | No disponible en la informacion | Hugging Face |
| Depth-Anything-V2-Base | No disponible en la informacion | Profundidad relativa | No disponible en la informacion | Hugging Face |

La comparacion directa disponible se limita al profesor: TinyDepth-Robot es aproximadamente 18 veces mas pequeno y obtiene AbsRel de 0,266 frente a 0,213, es decir, una perdida de precision moderada a cambio de una reduccion drastica de recursos. No se dispone de datos de otros modelos de profundidad ligera en la informacion proporcionada.

## Limitaciones y advertencias

- Solo predice profundidad relativa; no produce profundidad metrica sin calibracion externa de escala y desplazamiento por escena.
- Baja resolucion de entrada, por lo que estructuras finas como patas de sillas o cables pueden no detectarse.
- Entrenado sobre un dataset pequeno (unas 2.800 imagenes de DIODE), por lo que puede degradarse en dominios inusuales como escenas subacuaticas o iluminacion extrema.
- No esta certificado para seguridad; el autor advierte explicitamente que no debe usarse como unico sensor de evitacion de colisiones.
- Las etiquetas de entrenamiento son pseudo-etiquetas del profesor, de modo que hereda sus sesgos y errores.
- Licencia Apache 2.0, que permite uso comercial con atribucion; no obstante, la falta de certificacion de seguridad limita su uso en produccion critica.
- No dispone de datos de benchmarks fuera de DIODE val, por lo que su generalizacion a otros dominios no esta cuantificada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Zaidoppa/tinydepth-robot
- Modelo base (profesor): https://huggingface.co/depth-anything/Depth-Anything-V2-Small-hf
- Dataset de entrenamiento: https://huggingface.co/datasets/ahd03/diode-depth-3k
- No se han encontrado en la informacion disponible enlaces adicionales a papers, blogs o repositorios.
