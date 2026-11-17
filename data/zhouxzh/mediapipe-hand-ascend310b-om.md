# zhouxzh/mediapipe-hand-ascend310b-om

## Resumen

Este repositorio no contiene un modelo de lenguaje, sino un conjunto de binarios OM (Offline Model) compilados para el acelerador Ascend 310B de Huawei, que implementan la pipeline de deteccion y seguimiento de manos de MediaPipe en su version 0.10.14. Lo publica el usuario zhouxzh y su proposito es permitir el despliegue de esta pipeline de vision por computador sobre hardware Ascend, evitando la conversion manual desde ONNX o TFLite.

La pipeline es de dos etapas: un detector de palma que localiza la mano en la imagen y un modelo de landmarks que estima los puntos clave de la mano. En modo de seguimiento sobre video o WebRTC, el detector puede omitirse y reutilizar la region de interes (ROI) obtenida de los landmarks del fotograma anterior, lo que reduce el coste computacional por fotograma.

Es relevante para desarrolladores que trabajan con Ascend 310B4 y necesitan inferencia de bajo nivel sin depender de los runtimes de MediaPipe en CPU. Los ficheros incluidos son variantes "full" y "lite" de ambos modelos, ademas de una variante de precision mixta del detector de palma pensada para comparativas de velocidad y exactitud. El repositorio tiene un tamano de 0.0 GB segun Hugging Face y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de dos etapas: detector de palma (CNN) + modelo de landmarks de mano (CNN), compilados a OM para Ascend |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible; se incluye una variante de precision mixta del detector de palma |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | Apache-2.0 |
| Formato de pesos | OM (Ascend Offline Model), compilado para el target Ascend310B4 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de MediaPipe Hand de la version 0.10.14: un detector de palma que recibe tensores de `1 x 192 x 192 x 3` y un modelo de landmarks que recibe `1 x 224 x 224 x 3`. El detector de palma "full" se ha obtenido aplicando reescrituras deterministas del grafo ONNX (downsample, resize, maxpool y slices) para lograr una compilacion estable en Ascend 310B. Los binarios se compilaron con las herramientas de Ascend para el target Ascend310B4.

No se proporcionan datos sobre el entrenamiento original (numero de tokens o imagenes, composicion del dataset, uso de RLHF/DPO), ya que los pesos proceden del proyecto upstream de MediaPipe y este repositorio solo contiene los artefactos compilados. Tampoco se documentan innovaciones de inferencia como decodificacion especulativa o atencion lineal, al no tratarse de un modelo generativo.

## Capacidades

- Deteccion de palma de mano en imagenes RGB con entrada de `1 x 192 x 192 x 3`.
- Estimacion de landmarks de mano con entrada de `1 x 224 x 224 x 3`.
- Seguimiento de mano en video y WebRTC reutilizando la ROI de landmarks previos, con opcion de omitir el detector de palma.
- Variantes "full" y "lite" para ambos modelos, con distinto equilibrio entre precision y coste.
- Variante de precision mixta del detector de palma para comparativas controladas de velocidad y exactitud.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues; es exclusivamente vision por computador.

## Casos de uso

- Control por gestos en tiempo real: la pipeline detecta la palma y estima landmarks por fotograma, lo que permite mapear gestos a acciones en interfaces sobre hardware Ascend 310B.
- Seguimiento de manos en videollamadas WebRTC: en modo tracking se omite el detector de palma y se reutiliza la ROI, reduciendo el coste por fotograma en flujos de video continuo.
- Analisis de lenguaje de signos asistido: los landmarks de 21 puntos por mano sirven como entrada a clasificadores posteriores de gestos o signos.
- Realidad aumentada y filtros: la estimacion de landmarks permite superponer elementos graficos sobre la mano en aplicaciones de camara.
- Teleoperacion y robotica: los landmarks pueden alimentar el control de un efector o un cursor virtual en entornos embebidos con Ascend.
- Evaluacion de rendimiento en hardware Ascend: las variantes "lite", "full" y de precision mixta permiten comparar latencia y exactitud en el mismo target Ascend310B4.
- Procesamiento en el borde (edge): al ser binarios OM especificos del acelerador, encajan en despliegues donde no se quiere ejecutar MediaPipe en CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente menciona que la variante de precision mixta del detector de palma se incluye para comparativas controladas de velocidad y exactitud, sin aportar cifras.

## Requisitos de hardware

- Acelerador Ascend 310B, con target de compilacion Ascend310B4; los binarios no son intercambiables con ONNX, TFLite ni los ficheros de MediaPipe para CPU.
- Runtime CANN de Ascend requerido para la inferencia; la compatibilidad depende de la version del hardware y del runtime empleados.
- VRAM estimada: no disponible. Los tamanos de fichero van de 5.970.779 bytes (landmark lite) a 12.787.549 bytes (detector de palma full), lo que da una idea del peso en almacenamiento, no del consumo en el acelerador.
- No cabe en GPU consumer convencionales en el sentido habitual: esta pensado para el acelerador Ascend, no para CUDA.
- Opciones de despliegue: codigo de despliegue del autor en https://github.com/zhouxzh/mediapipe_hand_ascend310b; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Target | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MediaPipe Hand Ascend 310B OM (este repo) | Detector de palma + landmarks, compilado a OM | 192x192x3 y 224x224x3 | Ascend310B4 | Apache-2.0 | Hugging Face |
| MediaPipe Hand 0.10.14 upstream | Detector de palma + landmarks en TFLite/ONNX | 192x192x3 y 224x224x3 | CPU/GPU generico | Apache-2.0 | GitHub google-ai-edge/mediapipe |
| MediaPipe Hand para CPU (TFLite) | Misma pipeline en formato TFLite | 192x192x3 y 224x224x3 | CPU | Apache-2.0 | Distribucion oficial de MediaPipe |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Los binarios OM son especificos del hardware Ascend 310B4 y del runtime CANN; no funcionan en otras plataformas ni son intercambiables con ONNX, TFLite o los ficheros de MediaPipe para CPU.
- No es un modelo de lenguaje: no admite prompts, tool calling, agentes ni generacion de texto.
- No se documentan sesgos, tasas de alucinacion ni limitaciones de idioma porque no aplican a un modelo de vision de este tipo.
- La precision y robustez dependen de los modelos upstream de MediaPipe 0.10.14; no se aportan metricas propias de exactitud en este repositorio.
- La licencia del repositorio es Apache-2.0, igual que el proyecto upstream; antes de redistribuir artefactos derivados en otro producto deben revisarse los avisos del upstream y posibles terminos de terceros.
- El repositorio figura con 0.0 GB de tamano y sin descargas ni likes, lo que sugiere un uso y validacion limitados por parte de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/zhouxzh/mediapipe-hand-ascend310b-om
- Codigo de despliegue del autor: https://github.com/zhouxzh/mediapipe_hand_ascend310b
- Proyecto upstream de MediaPipe: https://github.com/google-ai-edge/mediapipe
