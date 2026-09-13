# toxicdog/INT4-Convrot-Comfy-Models

## Resumen

INT4-Convrot-Comfy-Models es una coleccion de checkpoints cuantizados para ComfyUI, publicada por el usuario toxicdog en HuggingFace bajo el identificador `toxicdog/INT4-Convrot-Comfy-Models`. La model card del repositorio corresponde a la serie Winnougan, por lo que existe una discrepancia entre el identificador del repositorio en HuggingFace y el autor indicado en el README. No es un unico modelo, sino un paquete de diez modelos de difusion de imagen, difusion de video, segmentacion, upscaling y lenguaje, convertidos a INT4 o INT8 mediante la tecnica ConvRot.

El problema que resuelve es el de la huella de memoria: los checkpoints originales en FP16 o BF16 de modelos como LTX-2.3 22B o SeedVR2 7B no caben en GPU de gama consumer. La cuantizacion ConvRot agrupa los pesos a lo largo de su dimension compatible con potencias de 4 antes de cuantizar, en lugar de aplicar una cuantizacion row-wise estandar, lo que segun el autor conserva mas detalle en las matrices de pesos criticas para la fidelidad visual y reduce los artefactos tipicos de un cast INT4 directo. El objetivo declarado es ejecutar la coleccion en GPUs de clase 8 GB, desarrollada y probada en una RTX 3070 Ti.

El repositorio ocupa 115,7 GB y fue creado y actualizado el 13 de septiembre de 2026. La licencia se etiqueta como `other` porque cada checkpoint hereda las condiciones del modelo base del que deriva, con el caso destacado de Ideogram 4, cuya licencia es estrictamente no comercial. No se han publicado parametros de contexto, idiomas soportados ni resultados de benchmarks en la informacion disponible.

## Especificaciones tecnicas

Tabla de especificaciones a nivel de coleccion. Al tratarse de un paquete heterogeneo, varios campos varian segun el modelo.

| Parametro | Valor |
|---|---|
| Arquitectura | Heterogenea: difusion de imagen, difusion de video, transformer de lenguaje, segmentacion (SAM) y upscaler. Varia por modelo |
| Parametros totales | Varia por modelo. Datos explicitos: SeedVR2 7B (7B), LTX-2.3 22B (22B), Gemma 3 12B IT (12B). Resto no disponible |
| Parametros activos | No disponible; no se indica que ningun modelo de la coleccion sea MoE |
| Longitud de contexto | No disponible (solo aplicable a los componentes de lenguaje) |
| Tipos de cuantizacion | INT4 convrot (mayoria) e INT8 convrot (Ideogram 4 Instant Comfy y SAM 3.1 Multiplex) |
| Idiomas soportados | No disponible |
| Licencia | `other`; hereda la licencia de cada modelo base (Krea 2, LTX-2.3, Sulphur 2, SeedVR2). Ideogram 4 tiene licencia no comercial |
| Formato de pesos | No disponible de forma explicita. Requiere el nodo INT4 loader de ComfyUI-INT4-Fast; no es compatible con los nodos CheckpointLoader o UNETLoader estandar |

Composicion del repositorio:

| Modelo | Tipo | Notas | Cuantizacion |
|---|---|---|---|
| Flux 2 Dev | Difusion de imagen | Checkpoint base Flux 2 Dev | INT4 convrot |
| Gemma 3 12B IT | LLM / texto | Modelo de lenguaje ajustado por instrucciones | INT4 convrot |
| Ideogram 4 Instant Comfy | Difusion de imagen | Variante de Ideogram 4 optimizada para Comfy | INT8 convrot |
| Krea 2 Raw | Difusion de imagen | Checkpoint base Krea 2, pipeline sin modificar | INT4 convrot |
| Krea 2 Turbo | Difusion de imagen | Variante destilada/turbo, menos pasos | INT4 convrot |
| LTX-2.3 22B Distilled 1.1 | Difusion de video | Build destilada solo transformer de LTX-2.3 (22B) | INT4 convrot |
| Mistral 3 Small Flux 2 | LLM / multimodal | Mistral 3 Small integrado con Flux 2 | INT4 convrot |
| SAM 3.1 Multiplex | Vision / segmentacion | Variante multiplex de Segment Anything Model 3.1 | INT8 convrot |
| SeedVR2 (7B) | Upscaler de imagen y video | Variante completa de 7B | INT4 convrot |
| Sulphur Distilled | Difusion de video | Checkpoint destilado derivado de LTX-2.3 | INT4 convrot |

## Arquitectura y entrenamiento

La coleccion no introduce arquitecturas nuevas: toma checkpoints ya entrenados y los somete a un proceso de conversion de precision. La innovacion tecnica se situa en el esquema de cuantizacion, denominado ConvRot, implementado con la herramienta Starnodes Model Converter (`comfyui-starnodes-modelconverter`), que admite modos INT8 e INT4. Segun la model card, la cuantizacion row-wise convencional en INT8 o INT4 descarta demasiada precision en las matrices de pesos determinantes para la fidelidad visual, mientras que ConvRot agrupa los pesos a lo largo de su dimension compatible con potencias de 4 antes de cuantizar. El autor afirma que este agrupamiento conserva mas detalle del modelo original y reduce los artefactos respecto a un cast INT4 directo, a cambio de una reduccion de VRAM y de disco que permite ejecutar checkpoints de video y un upscaler de 7B en tarjetas de 8 GB.

No se proporcionan datos sobre el volumen de tokens de entrenamiento, la composicion de los datasets, ni sobre si hubo fases de RLHF o DPO. Estas etapas pertenecen a los modelos base y no se documentan en este repositorio. Tampoco se detalla el procedimiento exacto de calibracion de ConvRot, el numero de bits efectivos por grupo, ni el impacto medido de la conversion sobre metricas objetivas de calidad. La unica evidencia cualitativa aportada son las muestras y los workflows incluidos en la carpeta `Samples and Workflow` del repositorio.

## Capacidades

- Generacion de imagenes: Flux 2 Dev, Krea 2 Raw, Krea 2 Turbo e Ideogram 4 Instant Comfy cubren el pipeline de difusion de imagen, con variantes base y destiladas de menos pasos.
- Generacion de video: LTX-2.3 22B Distilled 1.1 y Sulphur Distilled aportan difusion de video, el primero como build destilada solo transformer de 22B.
- Upscaling: SeedVR2 7B esta descrito como upscaler de imagen y video en su variante completa de 7B.
- Segmentacion: SAM 3.1 Multiplex aporta segmentacion de vision, en cuantizacion INT8.
- Generacion de texto e instrucciones: Gemma 3 12B IT es un modelo de lenguaje ajustado por instrucciones, integrado en la coleccion como componente de texto.
- Capacidad multimodal: Mistral 3 Small Flux 2 se describe como integracion de un LLM con Flux 2.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se detallan idiomas para ningun componente.
- Capacidades especiales: modo de pensamiento, vision o audio no documentados. La unica capacidad transversal confirmada es la carga mediante el nodo INT4 loader de ComfyUI-INT4-Fast.

## Casos de uso

- Generacion de imagenes en GPU consumer de 8 GB: con Krea 2 Turbo INT4 o Flux 2 Dev INT4 se puede generar imagen localmente en tarjetas de clase RTX 3070 Ti, evitando el coste de alquiler de GPU. La variante Turbo reduce el numero de pasos de muestreo, lo que acorta la latencia por imagen.
- Difusion de video local: LTX-2.3 22B Distilled 1.1 y Sulphur Distilled permiten generar clips de video en hardware de gama media, un escenario que con los pesos originales en FP16 exigiria GPUs de centro de datos.
- Upscaling de imagen y video en produccion de contenido: SeedVR2 7B cuantizado a INT4 se integra como etapa final de un pipeline ComfyUI para reescalar material generado o grabado, reduciendo el coste por minuto procesado al ejecutarse en local.
- Segmentacion y enmascarado en edicion: SAM 3.1 Multiplex en INT8 sirve para generar mascaras precisas de objetos en flujos de retoque, composicion o rotoscopia automatizada, encadenadas con los nodos de difusion del mismo entorno.
- Asistencia de texto dentro del propio grafo: Gemma 3 12B IT INT4 puede emplearse para reescribir prompts, generar descripciones o producir metadatos en el mismo equipo en el que se ejecuta la difusion, sin depender de una API externa.
- Automatizacion de pipelines de generacion por lotes: los workflows JSON incluidos permiten lanzar colas de trabajo en ComfyUI que encadenen generacion de imagen, upscaling y segmentacion de forma desatendida.
- Prototipado e investigacion de cuantizacion: el repositorio sirve como material de estudio para comparar ConvRot INT4 frente a otras estrategias de cuantizacion sobre los mismos pesos base, reutilizando el conversor de Starnodes para reproducir el proceso.
- Evaluacion interna sin uso comercial: la variante Ideogram 4 Instant Comfy, en INT8, solo puede emplearse en investigacion personal, pruebas internas o I+D sin exposicion a clientes, segun los terminos de su licencia; es adecuada para evaluar calidad de generacion de texto en imagen antes de decidir sobre un modelo con licencia comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K, FID, CLIP score, VBench ni ninguna otra metrica objetiva, y tampoco ofrece comparaciones numericas frente a los pesos originales en FP16 o frente a cuantizaciones INT4 alternativas.

La busqueda web realizada no devolvio ningun resultado relacionado con este modelo ni con la serie Winnougan; los enlaces recuperados corresponden a contenidos del Foro Economico Mundial sin relacion con el repositorio.

## Requisitos de hardware

- VRAM objetivo declarada: GPUs de clase 8 GB. El autor indica que la coleccion fue desarrollada y probada en una RTX 3070 Ti.
- VRAM por modelo: no disponible. No se publican cifras individuales de consumo. Como referencia aritmetica no confirmada por el autor, los pesos en INT4 ocupan aproximadamente 0,5 bytes por parametro, lo que situaria SeedVR2 7B en torno a 3,5 GB y LTX-2.3 22B en torno a 11 GB solo en pesos; a esas cifras hay que sumar activaciones, latentes, VAE y buffers de atencion, por lo que el consumo real es superior y depende de la resolucion y del numero de fotogramas.
- GPU recomendadas: no se especifica una lista. El unico dato concreto es la RTX 3070 Ti (8 GB) como plataforma de desarrollo y prueba. No hay datos publicados para A100, H100 u otras GPUs.
- Compatibilidad con GPU consumer: si, el objetivo explicito del proyecto es funcionar en tarjetas de 8 GB. No se detalla comportamiento en tarjetas con menos VRAM.
- Entorno de software requerido: ComfyUI en build nightly, PyTorch 2.12, CUDA 13.2, Python 3.12, FlashAttention o SageAttention y Triton 3.8. El autor recomienda actualizar el entorno Conda si aparecen errores cronicos.
- Opciones de despliegue: ComfyUI con el custom node ComfyUI-INT4-Fast instalado en `ComfyUI/custom_nodes/`. Los nodos estandar de checkpoint y UNETLoader no decodifican estos pesos. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Almacenamiento: el repositorio completo ocupa 115,7 GB, aunque no es necesario descargarlo entero; los checkpoints se colocan en `ComfyUI/models/diffusion_models/` o en la carpeta correspondiente para modelos de video y upscaling.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos publicados de benchmarks ni de colecciones comparables con cifras verificables. La comparacion siguiente es cualitativa y se basa exclusivamente en las afirmaciones de la model card sobre el propio esquema ConvRot; las celdas marcadas como no disponibles reflejan la ausencia de datos medidos.

| Criterio | ConvRot INT4 (esta coleccion) | ConvRot INT8 (Ideogram 4, SAM 3.1) | Cuantizacion row-wise INT4/INT8 | Pesos originales FP16/BF16 |
|---|---|---|---|---|
| Precision de los pesos | 4 bits | 8 bits | 4 u 8 bits | 16 bits |
| Tamano relativo de pesos | Aproximadamente 1/4 respecto a FP16 (calculo aritmetico) | Aproximadamente 1/2 respecto a FP16 (calculo aritmetico) | Similar al equivalente en bits | Referencia |
| Fidelidad visual declarada | El autor afirma mayor retencion de detalle y menos artefactos que row-wise INT4 | El autor no detalla comparacion | Referencia de comparacion segun el autor | Referencia |
| Compatibilidad ComfyUI | Requiere ComfyUI-INT4-Fast | Requiere ComfyUI-INT4-Fast | Depende del nodo usado | Nodos estandar |
| Licencia | Heredada de cada modelo base | Heredada de cada modelo base; Ideogram 4 no comercial | Segun la herramienta | Segun el modelo base |
| Metricas publicadas | No disponibles | No disponibles | No disponibles | No disponibles |

## Limitaciones y advertencias

- No es un modelo unico: el repositorio agrupa diez modelos de naturaleza distinta. Cualquier evaluacion debe hacerse por componente, no sobre el paquete completo.
- Ausencia total de benchmarks: no hay metricas objetivas que respalden la afirmacion de que ConvRot INT4 preserva mejor la calidad que una cuantizacion row-wise. La evidencia aportada es cualitativa y procede del propio autor.
- Discrepancia de autoria: el identificador de HuggingFace es `toxicdog/INT4-Convrot-Comfy-Models`, mientras que la model card y los enlaces apuntan a la cuenta `Winnougan`. Conviene verificar el origen real de los pesos antes de usarlos en produccion.
- Compatibilidad restringida: los checkpoints no funcionan con los nodos estandar de ComfyUI. Requieren ComfyUI-INT4-Fast y un entorno concreto (ComfyUI nightly, PyTorch 2.12, CUDA 13.2, Python 3.12, Triton 3.8), lo que limita su portabilidad a otros frameworks de inferencia.
- Licencia fragmentada y riesgo legal: la etiqueta `other` obliga a revisar la licencia de cada modelo base por separado. Ideogram 4 se distribuye bajo un acuerdo estrictamente no comercial que prohibe el uso comercial directo o indirecto, el entrenamiento de modelos competidores, usos militares o de vigilancia, procesamiento biometrico, decisiones automatizadas en dominios de alto riesgo y la eliminacion de filtros de seguridad o marcas de agua. La redistribucion exige imponer las mismas restricciones y entregar el acuerdo a terceros.
- Restricciones adicionales de la licencia de Ideogram: no se permite usar las salidas del modelo para entrenar, ajustar o destilar un producto de IA competidor.
- Idiomas: no se documenta el soporte multilingue de los componentes de lenguaje, por lo que no puede asumirse cobertura de castellano.
- Longitud de contexto: no disponible para Gemma 3 12B IT ni para Mistral 3 Small Flux 2, lo que impide planificar tareas de contexto largo.
- Riesgo de alucinacion: aplicable a los componentes de lenguaje (Gemma 3 12B IT y Mistral 3 Small Flux 2); no se documentan tasas ni evaluaciones de fidelidad. En los modelos de difusion el riesgo equivalente es la generacion de contenido incoherente o artefactos, agravado por el proceso de cuantizacion.
- Sesgos: no se publica ninguna evaluacion de sesgos, etica o seguridad para ningun componente de la coleccion.
- Sin garantias de produccion: el repositorio no documenta pruebas de estabilidad, numeros de descargas relevantes (0 descargas en el momento de la consulta) ni mantenimiento continuado. El autor advierte de errores cronicos si el entorno no esta actualizado.
- Degradacion por cuantizacion: la propia naturaleza del proceso implica perdida de informacion respecto a los pesos originales. El impacto real sobre calidad, coherencia temporal en video y fidelidad en upscaling no esta cuantificado.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/toxicdog/INT4-Convrot-Comfy-Models
- Cuenta de modelos del autor segun la model card: https://huggingface.co/Winnougan
- Poster e imagenes de muestra: https://huggingface.co/Winnougan/INT4-Convrot-Comfy-Models/resolve/main/Samples%20and%20Workflow/Winnougan_INT4_Poster.png
- Conversor de modelos Starnodes: https://github.com/Starnodes2024/comfyui-starnodes-modelconverter
- Custom node requerido ComfyUI-INT4-Fast: mencionado en la model card como `ComfyUI-INT4-Fast`, sin URL publicada. No disponible.
- Canal de YouTube, servidor de Discord, Patreon y Ko-fi: mencionados en la model card sin URL. No disponibles.
- Resultados de la busqueda web: no se encontro ningun enlace relacionado con este repositorio ni con la serie Winnougan; los resultados devueltos correspondian a articulos del Foro Economico Mundial sin relacion con el modelo.
