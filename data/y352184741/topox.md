# y352184741/TopoX

## Resumen

TopoX es un modelo de vision por computador especializado en la generacion de grafos de carril (lane graphs) para conduccion autonoma, desarrollado por el autor y352184741 y presentado como publicacion para KDD 2027. A diferencia de los modelos de lenguaje, TopoX no procesa texto: reconstruye la geometria de los carriles, su semantica y la conectividad dirigida entre ellos a partir de video surround-view, es decir, de imagenes multi-camara capturadas alrededor del vehiculo.

El checkpoint publicado es un modelo ResNet-50 con 200 consultas de carril (lane queries), de las cuales 66 se propagan entre fotogramas, y 6 capas de decoder. Su innovacion principal es la propagacion explicita de adyacencia temporal: las consultas seleccionadas y su subgrafo dirigido guian la actualizacion de nodos en el fotograma siguiente, lo que permite mantener coherencia topologica a lo largo del tiempo.

Es relevante ahora porque aborda un problema central de la conduccion autonoma basada en mapas: inferir estructura de carriles y conexiones dirigidas en tiempo real sin depender de mapas HD preconstruidos. El modelo se evalua sobre el subconjunto A de OpenLane-V2 y se distribuye bajo licencia GPL-3.0, con pesos en formato PyTorch `state_dict`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal convolucional con backbone ResNet-50 y decoder transformer con lane queries (6 capas de decoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa video surround-view por fotograma, sin ventana de contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiqueta de idioma del repo; el modelo no procesa lenguaje natural) |
| Licencia | GPL-3.0 |
| Formato de pesos | PyTorch `state_dict` (`.pth`), 932 tensores de estado, sin estado del optimizador |

## Arquitectura y entrenamiento

TopoX combina un backbone convolucional ResNet-50 para extraccion de caracteristicas visuales con un decoder de 6 capas que opera sobre 200 lane queries. De estas consultas, 66 se propagan explicitamente entre fotogramas consecutivos: las consultas seleccionadas y el subgrafo dirigido resultante guian la actualizacion de nodos en el siguiente fotograma, implementando una propagacion de adyacencia temporal (temporal adjacency propagation). El modelo genera simultaneamente geometria de carril, semantica y conectividad dirigida.

El entrenamiento consta de 12 epocas por fotograma seguidas de 33.516 iteraciones en modo streaming, con semilla 42. Los datos de entrenamiento y validacion provienen del dataset oficial OpenLane-V2, que debe obtenerse por separado. El checkpoint publicado contiene unicamente el `state_dict` y metadatos compactos; sus 932 tensores son bit a bit identicos al checkpoint de entrenamiento completado, y el SHA256 se registra en `SHA256SUMS`. No se documentan en la informacion disponible detalles sobre composicion del dataset, uso de RLHF/DPO (no aplicable a este tipo de modelo) ni innovaciones adicionales como decodificacion especulativa.

## Capacidades

- Generacion de grafos de carril: reconstruye geometria, semantica y conectividad dirigida de carriles a partir de video surround-view.
- Deteccion de carriles (lane detection) y estimacion de topologia (lane topology).
- Propagacion temporal: mantiene coherencia de la estructura de carriles entre fotogramas consecutivos mediante adyacencia temporal explicita.
- Procesamiento multi-camara surround-view (implicito en la tarea OpenLane-V2).
- Refinamiento opcional de la adyacencia final mediante distancia entre extremos (configuracion GeoDist).
- No dispone de generacion de texto, razonamiento linguistico, codigo, matematicas, vision generativa, tool calling, agentes ni capacidades multilingues en el sentido de modelos de lenguaje.

## Casos de uso

- Conduccion autonoma en tiempo real: el modelo infiere la topologia de carriles fotograma a fotograma y propaga la adyacencia entre ellos, lo que permite al planificador de ruta disponer de una estructura de carriles coherente temporalmente sin mapas HD.
- Construccion y actualizacion de mapas: a partir de video surround-view grabado, TopoX puede generar grafos de carril que alimenten pipelines de cartografiado automatico, reduciendo el trabajo manual de anotacion topologica.
- Validacion de mapas existentes: comparando el grafo inferido por el modelo con el mapa HD de referencia, se pueden detectar carriles nuevos, eliminados o cambios de conectividad dirigida.
- Sistemas ADAS de asistencia al carril: la deteccion de geometria y conectividad permite anticipar mergers, bifurcaciones y cambios de carril dirigidos, mejorando avisos de salida de carril.
- Percepcion en vehiculos de flota: al ser un checkpoint ligero (repo de 0,2 GB con backbone ResNet-50), puede desplegarse en plataformas de percepcion embarcadas para flotas de recogida de datos.
- Investigacion en topologia temporal: el codigo y los pesos permiten reproducir los resultados de OpenLane-V2 Subset A y experimentar con la propagacion de adyacencia temporal en nuevos datasets de video.
- Simulacion y gemelos digitales: los grafos de carril generados pueden alimentar entornos simulados de conduccion con estructura de red viaria realista.

## Benchmarks y rendimiento

Evaluacion sobre OpenLane-V2 Subset A (validacion: 150 escenas, 4.806 fotogramas). Puntuaciones en porcentaje.

| Configuracion | mAP | AP_lane | AP_ped | TOP_lsls |
|---|---:|---:|---:|---:|
| TopoX | 39,06 | 37,40 | 40,71 | 30,15 |
| TopoX + GeoDist | 39,06 | 37,40 | 40,71 | 32,10 |

Ambas configuraciones usan este mismo checkpoint; GeoDist refina la adyacencia final de salida mediante distancia entre extremos. No se han publicado en la informacion disponible resultados comparativos frente a otros modelos en las mismas metricas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada.
- GPU recomendadas: no disponible; el backbone ResNet-50 y el tamano del repo (0,2 GB) sugieren requisitos moderados, pero no se confirma.
- Compatibilidad con GPU de consumo: no confirmada; el checkpoint es ligero, pero no se documentan requisitos minimos.
- Opciones de despliegue: evaluacion mediante el repositorio oficial con `tools/dist_test.sh` sobre PyTorch; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje, no aplicables directamente).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos sobre modelos comparables de generacion de grafos de carril (como variantes de LaneSegNet, TopoNet o modelos evaluados en OpenLane-V2), ni de sus parametros, contexto o resultados en las mismas metricas. Por tanto, la comparativa se indica como no disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al entrenarse sobre OpenLane-V2, puede heredar sesgos de distribucion geografica y de condiciones de captura del dataset.
- Riesgo de alucinacion: no aplica en el sentido linguistico, pero el modelo puede generar carriles o conexiones dirigidas inexistentes en escenarios fuera de distribucion.
- Limitaciones de contexto o idioma: procesa exclusivamente video surround-view; no soporta entrada textual ni otros idiomas. El rendimiento fuera de OpenLane-V2 no esta documentado.
- Restricciones de licencia: GPL-3.0 impone obligaciones de copyleft; el uso comercial en productos propietarios requiere evaluacion legal, ya que la distribucion de software derivado debe cumplir los terminos de la GPL.
- Caveats para produccion: el checkpoint omite el estado del optimizador (no reanudable para entrenamiento); los datos de OpenLane-V2 deben obtenerse por separado; el repo tiene 0 descargas y 0 likes, lo que indica ausencia de validacion por parte de la comunidad; la referencia a KDD 2027 sugiere una publicacion futura, no confirmada.
- El modelo no es un modelo de lenguaje: no debe evaluarse con benchmarks tipo MMLU, HumanEval o GSM8K.

## Enlaces

- Hugging Face: https://huggingface.co/y352184741/TopoX
- Codigo y uso: https://github.com/YimingYang23/TopoX
- Preprint: https://arxiv.org/abs/2507.00709
- Dataset OpenLane-V2 (obtencion separada): no disponible en la informacion proporcionada
