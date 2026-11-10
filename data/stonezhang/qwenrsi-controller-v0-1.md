# StoneZhang/QwenRSI-Controller-v0.1

## Resumen

QwenRSI Controller v0.1 es un paquete experimental de controlador de agente compilado, publicado por StoneZhang bajo licencia MIT. No se trata de un modelo de lenguaje entrenado ni de un checkpoint fusionado, sino de un conjunto de coeficientes de circuito dispersos (`controller.safetensors`) junto con un programa RV32 seleccionado (`controller.elf`), el codigo fuente, los hashes y la evidencia de las mediciones. El modelo base subyacente es Qwen/Qwen3.5-4B, cuyos pesos no se incluyen en el repositorio y se cargan por separado; el circuito implementa la CPU y el programa evolucionado reside en su estado inicial de ROM/RAM.

El interes del artefacto reside en su planteamiento de auto-modificacion: un modelo Qwen3.5-4B congelado modifica su propio harness en C, y el resultado se empaqueta como un bundle cargable mediante la libreria `qwenrsi`. El repositorio incluye una ejecucion medida (`tom-20261110-003`) sobre una NVIDIA RTX 4090, en la que se admitio 1 de 3 versiones propuestas del controlador. El autor advierte explicitamente de que la mejora reportada en el protocolo sintetico de reparacion es solo simulacion y de que el piloto de reparacion en Python es una integracion escrita a mano, no evidencia de mejora amplia en codigo.

Se trata, por tanto, de un artefacto de investigacion de nicho, orientado a quienes trabajan en harnesses de agentes, circuitos compilados y mecanismos de auto-modificacion, y no de un modelo listo para produccion. El tamano del repositorio es de 0.0 GB y no cuenta con descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Circuito compilado Qwenputer (CPU RV32 compilada, memoria DeltaNet y ejecutor) sobre modelo base Qwen3.5-4B congelado |
| Parametros totales | no disponible (los pesos del modelo base no se incluyen en el repositorio) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT (codigo del controlador y de evolucion de QwenRSI); Qwenputer bajo MIT; Qwen3.5-4B bajo su propia licencia |
| Formato de pesos | safetensors (coeficientes dispersos del circuito) y ELF (programa RV32 seleccionado) |

## Arquitectura y entrenamiento

La arquitectura no es la de un transformer convencional ni un adaptador LoRA. El bundle contiene coeficientes dispersos de un circuito Qwenputer, que implementa una CPU RV32 compilada, junto con una memoria DeltaNet y un ejecutor, todo atribuido a Divyansh Agrawal bajo licencia MIT y fijado en el commit `0cab57038a8b218dabe481f994174c3437405e3d`. El programa RV32 seleccionado se inicializa desde el ELF y las decisiones del circuito se generan libremente; las salidas de referencia solo se emplean para comparaciones posteriores a la ejecucion. El host sigue encargandose de la compilacion, la inicializacion de estado, la evaluacion, la E/S de ficheros y la planificacion del modelo.

El proceso de produccion consistio en que un modelo Qwen3.5-4B congelado modificase su propio harness en C, generando tres versiones propuestas del controlador, de las cuales se admitio una. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO, ya que no se trata de un entrenamiento de pesos de lenguaje. El autor senala que los cambios del meta-selector estan registrados pero no demuestran una mejora recursiva del mecanismo de mejora, y que en esta version no se implementa JIT automatico de puntos calientes.

## Capacidades

- Generacion de decisiones de control mediante un circuito compilado, invocable a traves de `controller.decide(...)` con la API de `qwenrsi`.
- Carga verificada del bundle con comprobacion de SHA-256, carga de tensores dispersos e inicializacion del programa desde el ELF.
- Ejecucion en GPU mediante la ruta Triton del circuito upstream, no mediante `generate()` de Transformers sobre un modelo fusionado.
- Auto-modificacion del harness en C por parte de un modelo Qwen3.5-4B congelado, con registro de las versiones propuestas y admitidas.
- Reparacion sintetica en un protocolo de simulacion (216/256 con el controlador seleccionado frente a 0/256 del controlador semilla).
- Integracion en tareas de reparacion de Python (4/4 en el piloto, tanto con el controlador semilla como con el seleccionado).
- Capacidades de lenguaje, vision, tool calling, agentes multi-paso o multilingues: no disponibles en este artefacto, ya que las capacidades linguisticas residen en el modelo base cargado por separado.

## Casos de uso

- Investigacion en auto-modificacion de harnesses: el bundle permite reproducir el ciclo en el que un modelo congelado propone y selecciona versiones de su propio controlador, con evidencia y hashes incluidos para auditar el proceso.
- Experimentacion con circuitos compilados: util para estudiar como se comporta un circuito Qwenputer con coeficientes dispersos y un programa RV32 inicializado, comparando las decisiones libres del circuito con las salidas de referencia.
- Validacion de protocolos de reparacion sintetica: el protocolo de 256 casos sirve como banco de pruebas reproducible para medir la mejora de un controlador semilla frente a uno seleccionado o uno escrito a mano.
- Auditoria de reproducibilidad: la verificacion SHA-256 y la auditoria de recarga de tensores (392 tokens de traza en ejecucion libre, 0 discrepancias) permiten comprobar que el bundle exportado se comporta de forma consistente.
- Docencia e investigacion sobre agentes: el artefacto ilustra de forma concreta la diferencia entre un modelo de lenguaje, un adaptador y un controlador compilado, con codigo y evidencia medible.
- Estudio de planificacion y E/S en el host: dado que el host gestiona compilacion, estado, evaluacion y E/S, el bundle es util para analizar como se reparte la responsabilidad entre circuito y orquestador.

## Benchmarks y rendimiento

| Medicion | Resultado |
|---|---|
| Protocolo sintetico de reparacion, controlador semilla | 0/256 |
| Protocolo sintetico de reparacion, controlador seleccionado | 216/256 |
| Protocolo sintetico de reparacion, controlador verificado escrito a mano | 256/256 |
| Piloto real de reparacion en Python, controlador semilla | 4/4 |
| Piloto real de reparacion en Python, controlador seleccionado | 4/4 |
| Auditoria de recarga de tensores exportados | 392 tokens de traza en ejecucion libre, 0 discrepancias |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La ejecucion medida se realizo en una NVIDIA RTX 4090 bajo el identificador `tom-20261110-003`.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio no incluye los pesos del modelo base, por lo que el consumo depende del Qwen3.5-4B cargado por separado y del circuito.
- GPU recomendadas: la ejecucion medida se realizo en una NVIDIA RTX 4090; la ruta de ejecucion es Triton sobre CUDA.
- Compatibilidad con GPU de consumo: confirmada en RTX 4090 para la ejecucion reportada; no se dispone de datos para otras GPU de consumo.
- Opciones de despliegue: carga mediante `qwenrsi.circuit.load_bundle` con `snapshot_download` de Hugging Face Hub; requiere instalar el proyecto fuente con dependencias GPU en Linux. No es compatible con `AutoModel.from_pretrained` ni con `generate()` de Transformers sobre un modelo fusionado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QwenRSI Controller v0.1 | no disponible (base Qwen3.5-4B) | no disponible | 216/256 en protocolo sintetico; 4/4 en piloto Python | MIT (controlador); Qwen3.5-4B con licencia propia | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-4B | 4B (modelo base) | no disponible | no disponible | licencia propia de Qwen | Hugging Face |
| Controlador verificado escrito a mano | no aplica | no aplica | 256/256 en protocolo sintetico | MIT (Qwenputer) | incluido como evidencia en el repo |

No se dispone de datos de benchmarks estandar ni de modelos comparables de la misma categoria (controladores compilados de agentes) en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje entrenado ni un checkpoint fusionado ni un adaptador LoRA; usarlo como modelo de lenguaje es un error de uso.
- La mejora de 216/256 en el protocolo sintetico es una mejora de protocolo solo en simulacion; no implica mejora en tareas reales.
- El piloto de reparacion en Python (4/4) es una integracion escrita a mano y no evidencia una mejora amplia en codigo; ademas, el controlador semilla ya obtenia 4/4.
- El split de test final se excluyo de la seleccion de candidatos, pero el autor no presenta resultados de generalizacion mas alla de lo reportado.
- Los cambios del meta-selector estan registrados, pero no demuestran mejora recursiva del mecanismo de mejora.
- No se implementa JIT automatico de puntos calientes en esta version.
- Solo se admitio 1 de 3 versiones propuestas del controlador, lo que sugiere una tasa de exito baja del proceso de auto-modificacion.
- El repositorio tiene 0 descargas y 0 likes, sin pipeline definido ni idiomas declarados; se trata de un artefacto experimental sin validacion externa.
- La licencia MIT cubre el codigo del controlador y de evolucion; Qwenputer se distribuye bajo MIT con atribucion a Divyansh Agrawal, y Qwen3.5-4B mantiene su propia licencia, que debe revisarse para uso comercial.
- No se dispone de informacion sobre sesgos, alucinacion o limitaciones de contexto e idioma del artefacto.

## Enlaces

- Hugging Face: https://huggingface.co/StoneZhang/QwenRSI-Controller-v0.1
- Codigo fuente de QwenRSI: https://github.com/tongmd/QwenRSI
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Evidencia de comparacion humana: `evidence/human-comparison/results.json` (incluido en el repositorio)
- Qwenputer (atribucion, commit `0cab57038a8b218dabe481f994174c3437405e3d`): no disponible como enlace directo en la informacion proporcionada
