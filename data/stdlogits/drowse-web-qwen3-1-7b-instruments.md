# stdlogits/drowse-web-qwen3-1.7b-instruments

## Resumen

`stdlogits/drowse-web-qwen3-1.7b-instruments` es un paquete de artefactos de interpretabilidad para el modelo `stdlogits/drowse-web-qwen3-1.7b`, una adaptacion de Qwen3 de 1.700 millones de parametros orientada a ejecucion en navegador mediante WebGPU. No se trata de un checkpoint de Transformers ni de un modelo generativo al uso: el repositorio contiene matrices y estadisticos ajustados sobre las activaciones internas del modelo, empaquetados para que la aplicacion web drowse.ai los cargue de forma opcional.

El paquete incluye dos tipos de componentes. Por un lado, las lentes R y S, que son ajustes propios de drowse sobre las activaciones del modelo: la lente R interpreta que inclina a decir un vector dado, mientras que la lente S identifica que tokens de entrada parecen haber sido leidos. Por otro, las unidades, que proporcionan lecturas y contrastes por capa para las neuronas y cabezas de atencion del modelo, vinculadas a esas lentes y a los estadisticos neutrales del paquete principal.

Su relevancia es acotada pero especifica: cubre la necesidad de inspeccionar el comportamiento interno de un LLM pequeno que corre en el cliente, sin enviar activaciones a un servidor. El ajuste de las lentes se realizo sobre el subconjunto `sample-10BT` de FineWeb-Edu, y los artefactos se distribuyen como binarios verificados por SHA-256 a traves del catalogo firmado de drowse.ai.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el paquete contiene matrices y estadisticos de interpretabilidad, no pesos del transformer) |
| Parametros totales | no disponible para este paquete; el modelo base asociado es Qwen3 de 1.7B |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | `mixed-artifact-licenses` (licencia por componente, ver LICENSES.md) |
| Formato de pesos | safetensors (artefactos de navegador, no checkpoint de Transformers) |

## Arquitectura y entrenamiento

El repositorio no contiene un transformer entrenado, sino artefactos derivados de las activaciones de un transformer ya existente. Las lentes R y S son ajustes supervisados sobre las activaciones internas del modelo base: la lente R mapea vectores de activacion a la distribucion de tokens que esos vectores favorecen, y la lente S mapea estados internos a los tokens de entrada que el modelo parece haber procesado. Las unidades extienden este enfoque a nivel de neurona y de cabeza de atencion, con lecturas y contrastes entre capas anclados a los estadisticos neutrales del paquete principal.

El corpus de ajuste es FineWeb-Edu, subconjunto `sample-10BT` en la revision `87f09149`. Cada paquete incluye un `ATTRIBUTION.md` con la atribucion del corpus y un manifiesto que registra el corpus exacto y su hash. Los paquetes contienen unicamente matrices y estadisticos ajustados, no texto del corpus, lo que evita redistribuir el dataset original. La integracion se realiza mediante drowse.ai, cuyo catalogo firmado fija cada descarga a una revision inmutable del repositorio y verifica el digest SHA-256 de cada fichero.

## Capacidades

- Interpretabilidad de activaciones en el navegador: lectura de la inclinacion de un vector de activacion hacia determinados tokens mediante la lente R.
- Trazabilidad de entrada: identificacion de que tokens de entrada parecen haber sido leidos por el modelo mediante la lente S.
- Inspeccion por neurona y por cabeza de atencion: lecturas y contrastes entre capas para unidades individuales.
- Verificacion de integridad: catalogo firmado con fijacion de revision y comprobacion SHA-256 por fichero.
- Ejecucion en cliente con WebGPU, sin necesidad de infraestructura de servidor para el analisis.
- No incluye generacion de texto, tool calling, agentes ni capacidades multimodales propias; esas funciones corresponden al modelo base `stdlogits/drowse-web-qwen3-1.7b`.

## Casos de uso

- Analisis de mecanismos internos en docencia: uso de las lentes R y S para mostrar en un navegador como un LLM de 1.7B asocia activaciones con tokens, sin montar un entorno de GPU en servidor.
- Depuracion de comportamientos anomalos: inspeccion de que cabezas de atencion y neuronas responden ante una entrada concreta, contrastando lecturas entre capas para localizar donde se desvia la representacion.
- Investigacion reproducible de interpretabilidad: el manifiesto con corpus y hash permite replicar el ajuste sobre FineWeb-Edu `sample-10BT` en la revision `87f09149` y comparar resultados.
- Auditoria de privacidad en despliegues cliente: al ejecutarse en el navegador, las activaciones no salen del dispositivo, lo que facilita analisis sobre datos sensibles sin exportarlos.
- Prototipado de interfaces de explicabilidad: integracion de lecturas por neurona y cabeza en herramientas de visualizacion web para equipos de producto que evaluan la trazabilidad del modelo.
- Verificacion de cadena de suministro de artefactos: uso del catalogo firmado y de los digests SHA-256 para validar que los binarios cargados corresponden a la revision esperada en pipelines de evaluacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible para este paquete; el modelo base asociado es de 1.7B de parametros y el repositorio ocupa 2,3 GB.
- GPU recomendadas: no disponible; el tag `webgpu` indica ejecucion en navegador, sin lista de GPU validada publicada.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible.
- Opciones de despliegue: drowse.ai (edicion web) y el repositorio `stdlogits/drowse`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un checkpoint de inferencia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `stdlogits/drowse-web-qwen3-1.7b-instruments` | Artefactos de interpretabilidad para navegador | no disponible (base de 1.7B) | no disponible | `mixed-artifact-licenses` | Hugging Face + drowse.ai |
| `stdlogits/drowse-web-qwen3-1.7b` | Modelo base para navegador (WebGPU) | 1.7B | no disponible | no disponible | Hugging Face |
| Alternativas de interpretabilidad comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo generativo: no puede usarse para inferencia de texto, codigo ni matematicas; solo aporta lecturas sobre las activaciones del modelo base.
- Dependencia estricta del modelo base: las lentes y unidades estan ajustadas a `stdlogits/drowse-web-qwen3-1.7b` y a los estadisticos del paquete principal; no son transferibles a otros checkpoints.
- Licencia mixta por componente (`mixed-artifact-licenses`): es obligatorio revisar `LICENSES.md` antes de cualquier uso, incluido el comercial, y las condiciones pueden diferir entre lentes y unidades.
- El ajuste se limita a FineWeb-Edu `sample-10BT` en la revision `87f09149`; el comportamiento fuera de esa distribucion de texto no esta documentado.
- No hay informacion publicada sobre sesgos, tasas de alucinacion ni cobertura idiomatica de las lecturas.
- Cero descargas y cero likes en el momento de la consulta: no existe validacion comunitaria ni reportes independientes de calidad.
- La instalacion debe hacerse a traves de drowse.ai para aprovechar la verificacion SHA-256; una descarga manual omite esa garantia de integridad.
- El repositorio no declara `pipeline` ni idiomas soportados, lo que complica la integracion en pipelines automatizados estandar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/stdlogits/drowse-web-qwen3-1.7b-instruments
- Modelo base: https://huggingface.co/stdlogits/drowse-web-qwen3-1.7b
- Licencias por componente: https://huggingface.co/stdlogits/drowse-web-qwen3-1.7b-instruments/blob/main/LICENSES.md
- Aplicacion web: https://drowse.ai
- Repositorio de drowse: https://github.com/stdlogits/drowse
- Codigo de la edicion web: https://github.com/stdlogits/drowse.ai
- Dataset de ajuste: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
