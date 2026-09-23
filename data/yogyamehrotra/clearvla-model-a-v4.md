# yogyamehrotra/clearvla-model-a-v4

## Resumen

ClearVLA Model A v4 es un modelo de vision-lenguaje-accion (VLA) entrenado desde cero con 30,4 millones de parametros, publicado por Yogya Mehrotra. No es un modelo de proposito general: es el instrumento experimental del articulo *ClearVLA: do VLA speed-ups fail on transparent lab objects?* (2026), cuyo objetivo es medir si las tecnicas habituales de aceleracion de VLAs (poda tipo FastV, reutilizacion de K/V tipo VLA-Cache, cuantizacion INT4) degradan el rendimiento cuando los objetos a manipular son transparentes. El modelo se distribuye como pesos PyTorch acompanados de los scripts de entrenamiento y evaluacion del repositorio del autor.

La arquitectura combina encoders SigLIP congelados (vision y texto) con un prefix transformer de 6 capas y un experto de accion de 4 capas que genera por flow matching un chunk de 16 pasos de acciones de 10 dimensiones. Se entreno durante 35.000 pasos sobre el dataset `clearvla-sim`, compuesto por demostraciones limpias y de recuperacion en simulacion MuJoCo. Su relevancia es acotada pero concreta: es un banco de pruebas reproducible, pequeno y de licencia permisiva (CC-BY-4.0) para investigar el coste de las optimizaciones de inferencia en robotica, un terreno donde la mayoria de alternativas pesan miles de millones de parametros.

El modelo no incluye ficha de benchmarks estandar de lenguaje ni soporte multilingue declarado; su evaluacion se limita a una puerta de validez sobre tareas de manipulacion en simulacion con semillas no vistas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-lenguaje-accion): SigLIP ViT-B/16 congelado sobre 2 vistas de 224² (392 tokens visuales) + encoder de texto SigLIP congelado (64 tokens) + token de propriocepcion de 19-D, alimentando un prefix transformer de 6 capas con d=512 y un experto de accion de flow-matching de 4 capas con d=384 |
| Parametros totales | 30,4 M (nucleo entrenable: transformer de prefijo + experto de accion); los encoders SigLIP estan congelados |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No aplica en el sentido de contexto textual. La entrada es fija: 392 tokens visuales + 64 tokens de texto + 1 token de propriocepcion |
| Tipos de cuantizacion | Soporte INT4 a traves del paquete `accel/` del repositorio (hooks de inferencia); no se documentan otros formatos (GGUF, AWQ, GPTQ, etc.) |
| Idiomas soportados | No disponible. Solo se declara un encoder de texto SigLIP congelado; no hay lista de idiomas publicada |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch: `best.pt` (diccionario con `state["model"]`, pesos EMA del mejor paso de validacion). No se publican safetensors ni GGUF |

Datos adicionales del repositorio: pipeline declarado `robotics`, tamano del repo 0,1 GB, 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el 23 de septiembre de 2026. El repositorio incluye ademas `norm.json` (normalizacion de acciones y propriocepcion, con `action_mode: delta`) y `config.json` (configuracion de entrenamiento).

## Arquitectura y entrenamiento

El modelo es un VLA construido integramente desde cero sobre representaciones preentrenadas y congeladas. Dos vistas de 224x224 pixeles pasan por un SigLIP ViT-B/16 congelado que produce 392 tokens visuales; un encoder de texto SigLIP, tambien congelado, aporta 64 tokens de instruccion; y un vector de propriocepcion de 19 dimensiones se proyecta a un unico token. Esa secuencia de prefijo entra en un transformer de 6 capas con dimension 512, cuya salida condiciona un experto de accion de 4 capas y dimension 384 entrenado con flow matching. El experto predice un chunk de 16 pasos de acciones de 10 dimensiones: posicion xyz relativa al TCP actual, rotacion en 6 dimensiones y apertura del gripper.

El entrenamiento consistio en 35.000 pasos con tamano de lote 64, optimizador AdamW con tasa de aprendizaje 1e-4 y decaimiento coseno, autocast en fp16 y media movil exponencial (EMA) de los pesos. Los datos proceden del dataset `clearvla-sim`, que combina demostraciones limpias y de recuperacion en simulacion MuJoCo. No se documenta en la informacion disponible el numero total de tokens ni la composicion exacta del dataset, ni el uso de RLHF o DPO (tecnicas, por otra parte, poco habituales en politicas de accion). La innovacion metodologica principal no esta en la arquitectura, sino en el diseno experimental: el modelo actua como sujeto de prueba para medir el impacto de FastV-style pruning, VLA-Cache-style reutilizacion de K/V, cuantizacion INT4 y GT-protect sobre objetos transparentes, con la puerta de validez sobre 100 semillas emparejadas no vistas como criterio.

## Capacidades

- Generacion de acciones roboticas: produce chunks de 16 pasos de acciones de 10 dimensiones (xyz relativo al TCP, rotacion 6-D y gripper) mediante flow matching.
- Manipulacion guiada por instrucciones en lenguaje natural, usando el encoder de texto SigLIP para condicionar la politica.
- Percepcion visual multi-vista: procesa dos vistas simultaneas de 224x224 con un ViT-B/16 congelado (392 tokens visuales por par de vistas).
- Integracion de propriocepcion: incorpora un token de 19 dimensiones con el estado del robot.
- Tareas de laboratorio evaluadas: agarre (grasp), vertido (pour) e insercion (insert), con especial interes en objetos transparentes (vidrio) frente a opacos.
- Ejecucion de politicas de recuperacion: el dataset de entrenamiento incluye demostraciones de recuperacion, no solo trayectorias limpias.
- Puntos de anclaje para aceleracion: los pesos son compatibles sin modificaciones con poda tipo FastV, reutilizacion de K/V tipo VLA-Cache, INT4 y GT-protect a traves de `accel/`.
- No dispone de tool calling, function calling, razonamiento multi-paso textual, capacidades de audio, ni modo de pensamiento. No es un LLM.

## Casos de uso

- Manipulacion de objetos transparentes en laboratorio: el modelo esta disenado especificamente para evaluar el agarre, vertido e insercion de material de vidrio, donde la tarea de insercion alcanza un 98 % (opaco) y un 99 % (vidrio) de exito en la puerta de validez, lo que lo hace adecuado como referencia en entornos de laboratorio simulado.
- Investigacion sobre aceleracion de inferencia en robotica: sirve como sujeto de prueba reproducible para medir cuanto degradan FastV-style pruning, VLA-Cache-style reutilizacion de K/V e INT4 al aplicarse sobre un VLA pequeno y transparente en su implementacion.
- Prototipado rapido de politicas en simulacion MuJoCo: al tener 30,4 M de parametros y licencia CC-BY-4.0, permite iterar en ciclos de entrenamiento cortos (35.000 pasos documentados) sin depender de infraestructura de GPU de gama alta.
- Estudio del gap sim-to-real: el modelo se entrena exclusivamente en `clearvla-sim`, por lo que es un punto de partida razonable para cuantificar la perdida de rendimiento al transferir a un manipulador fisico, especialmente en vidrio.
- Docencia y formacion en robotica: su tamano reducido y su arquitectura modular (encoders congelados + transformer de prefijo + experto de accion) lo hacen util para explicar el pipeline completo de un VLA en cursos universitarios.
- Evaluacion de tecnicas de cuantizacion en politicas de accion: los hooks INT4 del paquete `accel/` permiten comparar precision y tasa de exito antes y despues de cuantizar, un caso de uso poco cubierto por los benchmarks habituales.
- Desarrollo de benchmarks internos de robotica: la puerta de validez sobre 100 semillas emparejadas no vistas proporciona un protocolo de evaluacion replicable para comparar variantes del propio modelo (por ejemplo, versiones aceleradas frente a la original).

## Benchmarks y rendimiento

Los unicos resultados publicados corresponden a la puerta de validez del autor sobre 100 semillas emparejadas no vistas, con porcentajes de exito en tanto por ciento. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no es un modelo de lenguaje.

| Tarea | Objetos opacos | Objetos de vidrio |
|---|---|---|
| Grasp (agarre) | 77 % | 80 % |
| Pour (vertido) | 43 % | 37 % |
| Insert (insercion) | 98 % | 99 % |

No se dispone de comparacion con otros modelos en el mismo protocolo de evaluacion dentro de la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia, los 30,4 M de parametros del nucleo ocupan aproximadamente 122 MB en fp32 y 61 MB en fp16, a lo que hay que sumar los encoders SigLIP congelados (vision y texto), que dominan el consumo total. La carga completa es modesta.
- GPU recomendadas: no se especifica ninguna. Dado el tamano, cualquier GPU con soporte CUDA (por ejemplo, RTX 3060 o superiores) es suficiente; una A100 o H100 resultaria sobredimensionada para inferencia.
- Cabe en GPU de consumo: si, con amplio margen, en practicamente cualquier GPU consumer con al menos unos pocos GB de VRAM. Tambien es viable en CPU para pruebas.
- Opciones de despliegue: no hay soporte de vLLM, llama.cpp, Ollama ni TGI, porque no es un modelo de lenguaje. La via documentada es PyTorch, cargando la politica con `eval.policy.ModelAPolicy("checkpoints/v4")` del repositorio, junto con el entorno MuJoCo para la simulacion. Es necesario disponer de los tokens de texto cacheados en `datasets/features/`, generados por `data/cache_features.py`, o del conjunto de instrucciones del dataset en el Hub.
- Latencia y throughput estimados: no disponible.
- Nota de seguridad en la carga: `best.pt` es un fichero pickle de PyTorch, por lo que conviene cargarlo solo desde fuentes de confianza o en un entorno aislado.

## Comparativa con modelos similares

No hay datos de benchmark comparables dentro de la informacion proporcionada. La siguiente tabla recoge caracteristicas publicas ampliamente conocidas de alternativas de la misma categoria (VLAs para manipulacion), que conviene verificar en sus fuentes originales antes de citarlas.

| Modelo | Parametros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| ClearVLA Model A v4 | 30,4 M | 392 tokens visuales (2 vistas 224²) + 64 de texto + 1 de propriocepcion | CC-BY-4.0 | Pesos `.pt` en HuggingFace |
| OpenVLA | ~7 B | Backbone tipo Llama-2 7B; cientos de tokens visuales | Licencia abierta con condiciones (Llama 2 community) | Pesos abiertos |
| Octo | ~93 M | Transformer de politica con tokens de observacion e instruccion | Licencia abierta (MIT) | Pesos abiertos |
| pi0 (Physical Intelligence) | ~3 B | Modelo de flujo con backbone preentrenado de gran tamano | No disponible en la informacion consultada | Parcialmente abierto |

ClearVLA Model A v4 se situa en el extremo mas ligero de la categoria, por debajo de Octo y muy por debajo de OpenVLA y pi0. Su ventaja no es el rendimiento absoluto, sino la trazabilidad del experimento y la licencia CC-BY-4.0, mas permisiva que las de los modelos basados en backbones con licencias condicionadas.

## Limitaciones y advertencias

- Entrenamiento exclusivamente en simulacion (MuJoCo, dataset `clearvla-sim`): no hay evidencia de rendimiento en robots fisicos; el gap sim-to-real no se ha cuantificado en la informacion disponible.
- Rendimiento desigual por tarea: el vertido (pour) cae al 43 % con objetos opacos y al 37 % con vidrio, muy por debajo del agarre y la insercion. No es una politica fiable para tareas de vertido.
- Los porcentajes publicados corresponden a una puerta de validez con 100 semillas emparejadas no vistas, un protocolo interno del autor; no equivalen a un benchmark independiente ni replicado por terceros.
- Modelo sin traccion comunitaria: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion externa, de issues resueltos y de ecosistema alrededor.
- Dependencias de ejecucion no triviales: requiere los tokens de texto cacheados (`datasets/features/`, generados por `data/cache_features.py`) o el conjunto de instrucciones del dataset del Hub, ademas del repositorio para `eval.policy.ModelAPolicy`.
- Formato de pesos en pickle (`best.pt`): implica riesgo de ejecucion de codigo arbitrario al cargarlo fuera de un entorno controlado, y complica la integracion con toolchains que esperan safetensors.
- Sesgos: no documentados. Al entrenarse sobre un dataset de simulacion con objetos de laboratorio, cabe esperar un sesgo hacia esa distribucion de escenas, iluminacion y geometria.
- Riesgo de alucinacion: no aplica en el sentido linguistico, pero si existe riesgo de acciones incorrectas o fisicamente invalidas cuando la escena se aleja del dominio de entrenamiento.
- Idiomas: no se declara ningun conjunto de idiomas soportados para las instrucciones; el encoder de texto esta congelado y su cobertura multilingue no se especifica.
- Licencia CC-BY-4.0: permite uso comercial, pero exige atribucion al autor y la indicacion de los cambios realizados. No hay clausulas de uso responsable adicionales.
- Las tecnicas de aceleracion (INT4, poda, reutilizacion de K/V) se ofrecen como hooks del repositorio; su impacto en la precision final no se cuantifica en la informacion disponible mas alla del proposito del articulo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yogyamehrotra/clearvla-model-a-v4
- Repositorio del proyecto ClearVLA: https://github.com/yogyam/clearvla
- Dataset `clearvla-sim`: https://huggingface.co/datasets/yogyamehrotra/clearvla-sim
- Articulo de referencia: *ClearVLA: do VLA speed-ups fail on transparent lab objects?* (Yogya Mehrotra, 2026); no se ha proporcionado un enlace independiente de publicacion, el repositorio de GitHub actua como referencia principal.
