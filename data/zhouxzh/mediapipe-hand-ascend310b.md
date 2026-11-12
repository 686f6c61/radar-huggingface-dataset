# zhouxzh/mediapipe-hand-ascend310b

## Resumen

Este repositorio no contiene un modelo de lenguaje, sino un conjunto de binarios OM (omniscient model, formato propietario de Huawei Ascend) que implementan la etapa de vision por computador del pipeline de manos de MediaPipe, compilados especificamente para el acelerador Ascend 310B (objetivo Ascend310B4). Lo publica el usuario zhouxzh y reproduce los modelos de deteccion de palma y de landmarks de mano de MediaPipe version 0.10.14, tanto en variante full como lite, junto con una variante de palma en precision mixta para comparativas de velocidad.

El problema que resuelve es la portabilidad de un pipeline de deteccion de manos ya entrenado (palm detector seguido de hand landmark) a hardware Ascend, evitando tener que recompilar o reconvertir los grafos desde cero. En modo video o WebRTC el detector de palma puede omitirse y seguir el ROI de la mano a partir de los landmarks previos, lo que reduce coste computacional por fotograma.

Es relevante para equipos que despliegan vision por computador en placas Ascend 310B y necesitan un punto de partida funcional con checksums verificables. No es un modelo generativo: no hay parametros de lenguaje, contexto ni capacidades de razonamiento. Toda la informacion tecnica disponible procede de la model card del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Redes convolucionales de MediaPipe (palm detector + hand landmark); no es un transformer |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, sin contexto textual) |
| Tipos de cuantizacion | no disponible; se ofrece una variante de palma con mezcla de precision (`allow_mix_precision`) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | OM (binarios compilados para Ascend310B4); no compatible con ONNX, TFLite ni CPU MediaPipe |

## Arquitectura y entrenamiento

El pipeline consta de dos etapas: un detector de palma con entrada `1 x 192 x 192 x 3` y un modelo de landmarks de mano con entrada `1 x 224 x 224 x 3`. Ambos se derivan de los modelos de mano de MediaPipe 0.10.14 y se compilaron con las herramientas de Ascend para el objetivo Ascend310B4. El detector de palma full incorpora reescrituras deterministas del grafo ONNX (downsample, resize, maxpool, slices) para lograr una compilacion estable en Ascend 310B.

No se detalla en la informacion disponible el volumen de datos de entrenamiento, la composicion del dataset ni si hubo ajuste fino adicional: los pesos subyacentes son los de MediaPipe 0.10.14. La innovacion tecnica es la conversion y compilacion a OM, no el entrenamiento. Existen variantes full y lite para ambas etapas, y una variante de palma en precision mixta incluida para comparativas controladas de velocidad y exactitud.

## Capacidades

- Deteccion de palma de mano sobre imagenes de entrada de 192x192x3.
- Estimacion de landmarks de mano sobre recortes de 224x224x3.
- Seguimiento en modo video/WebRTC: el detector de palma puede omitirse y el ROI se sigue a partir de los landmarks anteriores.
- Variantes full y lite para intercambiar precision por coste.
- Variante de palma con mezcla de precision para evaluar velocidad frente a exactitud.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision general, tool calling, agentes ni capacidades multilingues.

## Casos de uso

- Seguimiento de manos en tiempo real en placa Ascend 310B: se usa el par full (palma + landmark) para obtener landmarks por fotograma, con checksums que permiten verificar la integridad de los binarios desplegados.
- Control por gestos en kioscos o interfaces: el modo de seguimiento por ROI evita ejecutar el detector de palma en cada fotograma, reduciendo carga cuando la mano ya esta localizada.
- Preprocesado para pipelines de realidad aumentada: los landmarks alimentan la superposicion de elementos sobre la mano en aplicaciones de vision embebida.
- Evaluacion comparativa de variantes: la variante de palma en precision mixta permite medir el compromiso velocidad/exactitud frente a la variante full de referencia antes de fijar la configuracion de produccion.
- Integracion en productos con requisitos de trazabilidad: los tamanos y SHA-256 publicados (por ejemplo, 11669346 bytes para el landmark full) facilitan la auditoria de artefactos en cadena de suministro.
- Prototipado de interaccion hombre-maquina en entornos Ascend: sirve como base reproducible para validar latencia y precision antes de invertir en un reentrenamiento propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Acelerador Ascend 310B, con objetivo de compilacion Ascend310B4; la compatibilidad depende del hardware y del runtime CANN empleado.
- VRAM estimada: no disponible; los tamanos de fichero van de 5,97 MB (landmark lite) a 12,79 MB (palm full en dtype original).
- GPU recomendadas: no aplica; los binarios OM no se ejecutan en GPU NVIDIA ni en CPU con MediaPipe estandar.
- No cabe en GPU de consumo porque no es un formato compatible; requiere hardware Ascend.
- Opciones de despliegue: runtime Ascend/CANN con los OM; el codigo de despliegue acompanante esta en el repositorio de GitHub del autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MediaPipe Hand Ascend 310B (este) | no disponible | no aplica | Apache-2.0 | Binarios OM para Ascend310B4 |
| MediaPipe Hand 0.10.14 upstream | no disponible | no aplica | Apache-2.0 | Modelos originales (TFLite/otras variantes) |
| Modelos de mano en ONNX/TFLite para CPU/GPU | no disponible | no aplica | variable | Ejecutables en CPU/GPU |

La comparativa se limita al ecosistema MediaPipe porque no se dispone de datos de modelos alternativos de deteccion de manos en la informacion proporcionada.

## Limitaciones y advertencias

- Los OM son binarios especificos de hardware y no son intercambiables con ONNX, TFLite ni los ficheros de MediaPipe para CPU.
- La compatibilidad depende de la placa Ascend y de la version del runtime CANN; no se documentan versiones minimas.
- No hay datos de precision, latencia ni sesgos; no se puede evaluar el rendimiento real sin pruebas propias.
- El repositorio tiene 0 descargas y 0 likes, sin validacion de la comunidad.
- La licencia Apache-2.0 del repositorio no sustituye a los avisos del proyecto upstream ni a posibles terminos de terceros; conviene revisarlos antes de redistribuir artefactos derivados.
- Al ser un modelo de vision, no ofrece capacidades de lenguaje, razonamiento ni agentes; no debe evaluarse con los criterios habituales de un LLM.
- El comando de descarga de la model card referencia el repositorio `zhouxzh/mediapipe-hand-ascend310b-om`, distinto del ID publicado `zhouxzh/mediapipe-hand-ascend310b`; conviene verificar la ruta antes de automatizar la descarga.

## Enlaces

- Hugging Face: https://huggingface.co/zhouxzh/mediapipe-hand-ascend310b
- Codigo de despliegue: https://github.com/zhouxzh/mediapipe_hand_ascend310b
- Proyecto upstream MediaPipe: https://github.com/google-ai-edge/mediapipe
