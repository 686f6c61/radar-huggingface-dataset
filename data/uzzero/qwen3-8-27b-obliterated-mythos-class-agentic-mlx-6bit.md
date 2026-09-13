# uzzero/Qwen3.8-27B-OBLITERATED-Mythos-Class-Agentic-MLX-6bit

## Resumen

Esta ficha describe `uzzero/Qwen3.8-27B-OBLITERATED-Mythos-Class-Agentic-MLX-6bit`, una conversion a MLX en cuantizacion de 6 bits del modelo `medismera/Qwen3.8-27B-OBLITERATED-Mythos-Class-Agentic`, que a su vez deriva de `Qwen/Qwen3.8-27B` de Qwen/Alibaba Cloud. No es un modelo entrenado desde cero ni un ajuste fino: el autor indica explicitamente que no se realizo entrenamiento adicional y que la conversion solo cambia la representacion numerica de los pesos, no el entrenamiento ni la intencion del modelo original.

El resultado es un checkpoint multimodal de 27.356.728.560 parametros (unos 27,36 B) en safetensors cuantizados con MLX affine de 6 bits y tamano de grupo 64, con un peso aproximado de 22,78 GB en disco. Conserva la configuracion multimodal completa de la arquitectura `qwen3_5`, de modo que el pipeline declarado es `image-text-to-text`, aunque el autor advierte de que la inferencia con imagen o video no se ha validado.

Su relevancia practica es doble. Por un lado, permite ejecutar un modelo de ~27 B en Macs con Apple Silicon dentro del ecosistema MLX sin depender de CUDA. Por otro, es un ejemplo de ficha honesta sobre los limites de la cuantizacion: el propio autor documenta que la version de 6 bits no ha demostrado una mejora medible frente a la de 4 bits, que la configuracion multimodal por defecto de oMLX activo su proteccion de memoria en un M1 Max de 32 GiB y que LM Studio rechazo la carga. Es, por tanto, un artefacto de conversion para evaluacion, no un modelo con validacion de calidad publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen3_5`, configuracion multimodal conservada |
| Parametros totales | 27.356.728.560 (≈27,36 B) |
| Parametros activos | no disponible (no se documenta una arquitectura MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; en las pruebas se uso un limite de 4096 tokens impuesto por el runtime |
| Tipos de cuantizacion | MLX affine, 6 bits, group size 64; existe una version 4 bits del mismo autor |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (con avisos de copyright y licencia del modelo original conservados) |
| Formato de pesos | safetensors con cuantizacion MLX |
| Libreria | mlx |
| Pipeline | image-text-to-text (multimodal) |
| Modelo base | medismera/Qwen3.8-27B-OBLITERATED-Mythos-Class-Agentic (relacion: quantized) |
| Origen ultimo | Qwen/Qwen3.8-27B |
| Revision de origen | `528121d7b0b85885a658dfe67e3643b8a4f9337e` |
| Tamano del repositorio | 22,8 GB (pesos ≈22,78 GB) |
| Software de conversion | MLX 0.32.0, mlx-vlm 0.6.3, mlx-lm 0.31.3, Transformers 5.12.1 |
| Hardware de conversion | Apple M1 Max, 32 GiB de memoria unificada |
| Publicacion | 13 de septiembre de 2026 (actualizado el mismo dia) |

## Arquitectura y entrenamiento

La arquitectura declarada es `qwen3_5` con la configuracion multimodal retenida, es decir, un transformer multimodal que acepta texto e imagenes como entrada segun el pipeline `image-text-to-text`. No se dispone de la model card del modelo Qwen original en la informacion proporcionada, por lo que no se detallan el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO; esos datos deben consultarse en las fichas de `Qwen/Qwen3.8-27B` y de `medismera/Qwen3.8-27B-OBLITERATED-Mythos-Class-Agentic`.

El unico trabajo realizado en este repositorio es la conversion y cuantizacion. El autor aplico cuantizacion afin de MLX a 6 bits con tamano de grupo 64, manteniendo en coma flotante los modulos que el convertidor nativo excluye por reglas de multimodalidad, de modo que no todos los tensores estan a 6 bits. Se regeneraron pesos, configuracion, serializacion del procesador e indice de shards; se conservaron la plantilla de chat del modelo original y el fichero de licencia Apache. La conversion uso carga perezosa, ejecucion en CPU, un limite de cache MLX de 256 MiB y shards de salida de aproximadamente 1 GiB, y tardo 86 segundos en el M1 Max de 32 GiB, excluyendo descarga y pruebas. El propio autor aclara que esta observacion aislada no constituye una garantia de rendimiento.

No se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal ni mecanismos similares) en esta conversion. Tampoco se detalla el alcance de las modificaciones de comportamiento del linaje OBLITERATED del modelo de partida.

## Capacidades

- Generacion de texto conversacional multi-turno, segun la etiqueta `conversational` y las pruebas de humo realizadas.
- Entrada multimodal de imagen y texto (`image-text-to-text`): los pesos y la configuracion de vision estan incluidos, aunque la inferencia con imagen o video no ha sido validada por el autor.
- Uso de herramientas (`tool-use`): en las pruebas sinteticas el modelo invoco correctamente el nombre y los argumentos de una herramienta de demostracion y respondio de forma correcta tras recibir el resultado de la herramienta.
- Extraccion de informacion estructurada: en las pruebas genero respuestas en JSON para tareas de extraccion de importes y fechas, aunque sin restricciones de esquema.
- Razonamiento con controles de esfuerzo: mediante la definicion de modelo de LM Studio incluida se pueden ajustar Reasoning Effort (Low / Medium / Extra High), Enable Thinking y Preserve Thinking.
- Capacidades de agente: el modelo puede emitir llamadas a herramientas y razonar en varios pasos, pero la ejecucion, el retorno de resultados y la planificacion de trabajos deben aportarlos la aplicacion anfitriona.
- Capacidades multilingues: no disponible.
- Capacidades de audio o vision en produccion: no validadas.

## Casos de uso

- Asistente conversacional local con privacidad de datos: al ejecutarse sobre Apple Silicon con MLX, el modelo permite mantener conversaciones multi-turno sin enviar contenido a servicios externos. Es adecuado para entornos con requisitos de soberania del dato, siempre que se asuma que la longitud de contexto util no esta documentada y que en las pruebas se limito a 4096 tokens.
- Extraccion de campos de documentos escaneados o fotografias: con la ruta multimodal y la generacion de JSON observada en las pruebas, puede usarse para leer facturas o albaranes y devolver importes y fechas. Conviene imponer un JSON Schema explicito y validar la salida, porque el autor confirma que los tipos de campo no estaban restringidos por esquema en sus pruebas.
- Agente de soporte con herramientas de solo lectura: integrado en una aplicacion anfitriona que exponga funciones (consulta de estado de un pedido, busqueda en un CRM), el modelo puede seleccionar la herramienta y los argumentos y redactar la respuesta final usando el resultado devuelto.
- Prototipado e investigacion en Mac sin GPU dedicada: sirve para evaluar el comportamiento de un modelo de ~27 B en MLX, comparar cuantizaciones de 6 y 4 bits o medir latencia en memoria unificada, sin necesidad de adquirir hardware CUDA.
- Asistente de razonamiento con esfuerzo configurable: los controles de Reasoning Effort y Enable Thinking permiten usar el modelo en tareas de analisis donde se prioriza la calidad de la cadena de razonamiento, y desactivarlos en tareas de respuesta rapida.
- Clasificacion y descripcion de imagenes en local: la configuracion multimodal esta presente en los pesos, de modo que es un candidato para tareas de vision por computador de baja criticidad. Este uso debe considerarse experimental: el autor no ha validado el comportamiento con imagenes ni video.
- Generacion de codigo asistida dentro del editor: el modelo puede integrarse en un flujo de completado o explicacion de codigo, con la advertencia de que no se han publicado resultados de HumanEval ni de ninguna otra prueba de codigo para esta conversion.
- Base para comparativas de cuantizacion en investigacion: dado que el autor publica tambien una version de 4 bits del mismo checkpoint, este repositorio es util para estudiar el compromiso entre tamano en disco (unos 6,7 GB mas en 6 bits) y calidad, aunque la mejora medible no esta establecida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica de forma explicita que no ha realizado un estudio de retencion de precision y que no ha reproducido de forma independiente las afirmaciones agenticas del modelo de origen.

Lo unico documentado es una tanda de tres tareas sinteticas ejecutada el 13 de septiembre de 2026, que el propio autor califica como pruebas de humo y no como benchmark:

| Comprobacion | Resultado en runtime de texto de oMLX |
|---|---|
| Importe y fecha de vencimiento de una factura | Correcto |
| Importe ambiguo y fecha ausente | Dejados como desconocidos |
| Nombre y argumentos de una herramienta de demostracion | Correcto |
| Respuesta tras el resultado sintetico de la herramienta | Correcto |

El autor advierte que la misma familia de tareas tambien funciono con la conversion de 4 bits y con el Qwen original, por lo que no se establece ninguna ventaja de calidad. No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra prueba estandar, y tampoco hay medidas de latencia o throughput de inferencia.

## Requisitos de hardware

- Memoria unificada estimada: los pesos ocupan aproximadamente 22,78 GB, a los que hay que sumar cache KV, activaciones y el coste del procesador multimodal. Con 32 GiB el runtime de texto de oMLX funciono con un limite de contexto de 4096 tokens y prompts cortos; la configuracion multimodal por defecto de oMLX activo su proteccion de memoria en la primera peticion de texto en un M1 Max de 32 GiB.
- Estimacion de LM Studio: su proteccion de recursos calculo un requisito de 29,73 GiB con confianza BAJA y rechazo la carga con contexto de 4096. Es una estimacion, no una huella medida. El autor no reclama un minimo de RAM garantizado.
- Recomendacion practica: para uso multimodal completo conviene apuntar a equipos con mas memoria unificada que 32 GiB (48 o 64 GiB), aunque el autor no probo ninguna maquina de mayor capacidad. Para Macs de 32 GiB, el propio autor recomienda empezar por la version de 4 bits.
- GPU dedicadas: no aplica. El formato es MLX, especifico de Apple Silicon; no hay pesos GGUF ni safetensors estandar listos para CUDA en este repositorio. Para A100, H100, RTX 4090 o similares habria que reconvertir a otro formato o usar el modelo de origen en PyTorch.
- Cabe en GPU de consumo: no en su formato actual. En VRAM de 24 GB (RTX 4090) no entrarian los pesos de 6 bits con margen para contexto; requeriria cuantizaciones mas agresivas y otro runtime.
- Opciones de despliegue: mlx-lm 0.31.3 y mlx-vlm 0.6.3, runtime oMLX 0.6.4 con override de tipo de modelo `llm` para uso solo de texto, y LM Studio (que rechazo la carga en las pruebas del autor). vLLM, llama.cpp, Ollama y TGI no son compatibles con este formato sin conversion previa.
- Latencia y throughput: no disponible. El unico tiempo publicado es el de conversion (86 segundos), que no es una medida de inferencia.
- Controles adicionales: para activar Reasoning Effort, Enable Thinking y Preserve Thinking en LM Studio hay que instalar la definicion de modelo incluida; descargar solo el checkpoint no activa esos controles.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Tamano en disco | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| uzzero/Qwen3.8-27B-...-MLX-6bit (este) | 27,36 B | MLX affine 6 bits, group size 64 | ≈22,78 GB | no disponible (probado a 4096) | Apache 2.0 | Apple Silicon, MLX |
| uzzero/Qwen3.8-27B-...-MLX-4bit | mismo modelo base | MLX 4 bits | aproximadamente 6,7 GB menos que la version de 6 bits | no disponible | Apache 2.0 | Apple Silicon, MLX; recomendado por el autor para Macs de 32 GiB |
| medismera/Qwen3.8-27B-OBLITERATED-Mythos-Class-Agentic | mismo modelo base sin cuantizar por uzzero | pesos originales en coma flotante | no disponible | no disponible | no disponible | es el modelo de origen; su model card contiene las caracteristicas de comportamiento y las afirmaciones agenticas |
| Qwen/Qwen3.8-27B | no disponible en la informacion proporcionada | pesos originales | no disponible | no disponible | no disponible | modelo oficial de Qwen/Alibaba Cloud del que deriva toda la cadena |

No se dispone de datos de rendimiento comparados entre estas variantes. El autor senala que la cuantizacion a 6 bits no ha demostrado una mejora medible frente a la de 4 bits en tareas posteriores y que las pruebas de humo dieron el mismo resultado en ambas y en el Qwen original.

## Limitaciones y advertencias

- Modelo no oficial: se trata de una conversion independiente publicada por uzzero, no de un lanzamiento de Qwen ni de medismera. Los creditos del modelo base pertenecen a sus autores.
- Sin entrenamiento adicional: cualquier caracteristica de comportamiento, sesgo o alineacion proviene del modelo de origen. La conversion cambia la representacion numerica, no el entrenamiento ni la intencion.
- Linaje OBLITERATED: el nombre del modelo de partida sugiere modificaciones de comportamiento respecto al Qwen original cuyo alcance no se documenta en esta ficha. Conviene revisar la model card de origen antes de cualquier uso en produccion.
- Multimodalidad no validada: el autor afirma explicitamente que no ha validado inferencia con imagen ni video y que el modelo no esta validado para uso multimodal general en un Mac de 32 GiB.
- Contexto no documentado: no se especifica la longitud de contexto soportada. El valor de 4096 tokens corresponde a una eleccion del runtime en las pruebas, no a una caracteristica del modelo.
- Sin benchmarks: no hay datos de MMLU, HumanEval, GSM8K ni de retencion de precision. Las cuatro comprobaciones publicadas son pruebas de humo sinteticas, no un estudio de exactitud.
- Sin ventaja demostrada frente a 4 bits: el autor no establece ninguna mejora medible en tareas posteriores pese al mayor uso de disco (aproximadamente 6,7 GB mas).
- Extraccion sin esquema: las respuestas JSON de las pruebas no estaban restringidas por JSON Schema. En flujos automatizados hay que imponer un esquema explicito y validar las salidas.
- Agente incompleto por si mismo: el modelo no se conecta a Gmail ni a ningun servicio. La herramienta probada era sintetica y de solo lectura; se necesita una aplicacion anfitriona que aporte herramientas, ejecute las llamadas, devuelva resultados y planifique trabajos.
- Fiabilidad agentica no comprobada: las afirmaciones agenticas del modelo de origen no han sido reproducidas de forma independiente, y el comportamiento en flujos reales de correo o en contexto largo sigue sin probarse.
- Riesgo de alucinacion: no disponible. No se ha publicado ninguna evaluacion especifica, aunque el ejemplo de la factura con importe ambiguo y fecha ausente muestra que el modelo puede optar por dejar campos como desconocidos en lugar de inventarlos.
- Sesgos conocidos: no disponible en la informacion proporcionada; deben consultarse en la model card del modelo de origen.
- Idiomas: no disponible. No se documenta la cobertura linguistica.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero obliga a conservar los avisos de copyright y licencia del modelo original. El repositorio incluye el fichero LICENSE y conserva la atribucion a Qwen/Alibaba Cloud y a los autores de la derivada.
- Compatibilidad de despliegue limitada: al ser MLX, no se puede cargar directamente en vLLM, llama.cpp, Ollama o TGI. LM Studio rechazo la carga por su proteccion de recursos en las pruebas del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/uzzero/Qwen3.8-27B-OBLITERATED-Mythos-Class-Agentic-MLX-6bit
- Version de 4 bits del mismo autor: https://huggingface.co/uzzero/Qwen3.8-27B-OBLITERATED-Mythos-Class-Agentic-MLX-4bit
- Modelo de origen: https://huggingface.co/medismera/Qwen3.8-27B-OBLITERATED-Mythos-Class-Agentic
- Modelo Qwen original: https://huggingface.co/Qwen/Qwen3.8-27B
- Guia de configuracion en LM Studio: https://huggingface.co/uzzero/Qwen3.8-27B-OBLITERATED-Mythos-Class-Agentic-MLX-6bit/blob/main/LM-STUDIO.md
- Definicion de modelo para LM Studio: https://huggingface.co/uzzero/Qwen3.8-27B-OBLITERATED-Mythos-Class-Agentic-MLX-6bit/blob/main/lmstudio/model.yaml
- Procedencia de la conversion: https://huggingface.co/uzzero/Qwen3.8-27B-OBLITERATED-Mythos-Class-Agentic-MLX-6bit/blob/main/conversion-provenance.json
- Sumas de verificacion: https://huggingface.co/uzzero/Qwen3.8-27B-OBLITERATED-Mythos-Class-Agentic-MLX-6bit/blob/main/checksums.sha256
- Resultados de validacion: https://huggingface.co/uzzero/Qwen3.8-27B-OBLITERATED-Mythos-Class-Agentic-MLX-6bit/blob/main/validation-results.json
- Licencia Apache 2.0: https://huggingface.co/uzzero/Qwen3.8-27B-OBLITERATED-Mythos-Class-Agentic-MLX-6bit/blob/main/LICENSE
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo: los resultados obtenidos trataban sobre viajes a la Amazonia y no guardan relacion con el artefacto. No se han encontrado papers, blogs ni demos adicionales.
