# vlad-grig/opus-mt-en-fr

## Resumen

vlad-grig/opus-mt-en-fr es una conversión a ONNX del modelo de traducción inglés-francés Helsinki-NLP/opus-mt-en-fr, publicada por el usuario vlad-grig para poder ejecutarlo en el navegador mediante Transformers.js. No se trata de un entrenamiento nuevo: el autor lo indica explícitamente en la model card ("Nothing here is new work"). El valor del repositorio es operativo, no científico: sirve para que un plugin de WordPress que traduce catálogos de productos en el navegador del propio dueño de la tienda no dependa de un repositorio de terceros que no controla.

El modelo subyacente es un Marian de OPUS-MT entrenado por el Language Technology Research Group de la Universidad de Helsinki y liberado bajo licencia CC-BY-4.0. La conversión a ONNX sigue el trabajo previo de Xenova/opus-mt-en-fr. El repositorio ocupa 0,5 GB e incluye únicamente dos cuantizaciones: fp32 para WebGPU y q8 para el fallback en WebAssembly.

Es relevante ahora porque ejemplifica el patrón de despliegue de traducción neuronal en el lado del cliente (client-side), sin backend y sin enviar el texto del usuario a un servidor externo, algo crítico para casos con contenido propietario o datos personales. Como contrapartida, es un artefacto derivado con cero descargas y cero likes en el momento de la consulta, sin benchmarks propios publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (tag `marian`; transformer encoder-decoder de traduccion automatica) |
| Parametros totales | no disponible en la informacion proporcionada |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | fp32 (WebGPU) y q8 (WebAssembly); el autor omite el resto deliberadamente |
| Idiomas soportados | ingles y frances (traduccion en->fr) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (`transformers.js`) |

Datos adicionales del repositorio: tamano de 0,5 GB, pipeline `translation`, 0 descargas y 0 likes, creado el 2026-10-11 y actualizado el 2026-10-11 según los metadatos de HuggingFace. Modelo base declarado: Helsinki-NLP/opus-mt-en-fr.

## Arquitectura y entrenamiento

El artefacto es la conversión a ONNX de un modelo Marian de traducción automática. Marian es la arquitectura transformer encoder-decoder desarrollada en el proyecto OPUS de la Universidad de Helsinki, y el tag `marian` del repositorio confirma esta familia. El pipeline declarado es `text2text-generation` con `pipeline_tag: translation`.

No hay información sobre el entrenamiento en los datos proporcionados más allá de la autoría del modelo base (Language Technology Research Group, Universidad de Helsinki) y de que la conversión ONNX sigue el trabajo de Xenova. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. Tampoco se documenta ninguna innovación técnica propia: el repositorio contiene exclusivamente los pesos en los dos formatos que el navegador carga en la práctica.

## Capacidades

- Traduccion de texto de ingles a frances (direccion unica en->fr).
- Generacion texto-a-texto en el pipeline `translation` de HuggingFace.
- Ejecucion en navegador mediante Transformers.js con backend WebGPU (pesos fp32).
- Ejecucion en navegador sin WebGPU mediante fallback WebAssembly (pesos q8).
- Funcionamiento totalmente local en el cliente, sin llamadas a un servidor de inferencia.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documenta capacidad multilingue mas alla del par ingles-frances.
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Traduccion de catalogos de productos en WordPress: es el caso para el que se creo el repositorio. Un plugin descarga los pesos ONNX y traduce fichas de producto en el navegador del propietario de la tienda, sin exponer el catalogo a un servicio externo.
- Traduccion de contenido sin salida de datos: para textos con informacion sensible (contratos, correos internos, documentacion privada) el texto nunca abandona el dispositivo, porque la inferencia corre en WebGPU o WASM.
- Progressive Web Apps de traduccion offline: el modelo puede cachearse y funcionar sin conexion, util en entornos con conectividad limitada o en tabletas de campo.
- Widget de traduccion embebido en una web: traduccion de comentarios, resenas o formularios en el propio navegador del visitante, sin coste de backend ni cuotas de API.
- Preprocesado de localizacion en pipelines editoriales: traduccion de borradores en->fr antes de la revision humana, con coste marginal cero al no requerir GPU en servidor.
- Prototipado rapido de funciones de traduccion en aplicaciones JavaScript: al estar serializado en ONNX y disenado para Transformers.js, se integra en un front-end sin infraestructura adicional.
- Herramientas educativas de idiomas: ejercicios de traduccion en->fr que se ejecutan localmente en el equipo del estudiante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El repositorio no incluye metricas BLEU, COMET ni comparaciones con otros sistemas, y los resultados de busqueda web no aportan datos tecnicos sobre este modelo.

## Requisitos de hardware

- El repositorio completo ocupa 0,5 GB, lo que incluye los pesos fp32 y q8 y los ficheros auxiliares del tokenizer.
- La cuantizacion fp32 esta pensada para WebGPU y la q8 para el fallback en WebAssembly; la segunda reduce el peso descargado a una fraccion del de fp32.
- Al ser un modelo Marian de traduccion de un solo par de idiomas, cabe con holgura en GPU de consumo (RTX 3060, RTX 4060, RTX 4090) e incluso en la GPU integrada de un portatil moderno o en el propio navegador.
- Ejecucion en GPU de centro de datos (A100, H100) tecnicamente posible pero desproporcionada para este tamano de modelo.
- Opciones de despliegue: Transformers.js en navegador con WebGPU o WASM (escenario objetivo); al ser ONNX tambien es viable ONNX Runtime en servidor. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencias y throughput: no disponibles en la informacion proporcionada. Dependen por completo del dispositivo cliente y del backend (WebGPU frente a WASM).

## Comparativa con modelos similares

| Modelo | Formato | Idiomas | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| vlad-grig/opus-mt-en-fr | ONNX (fp32, q8) | en->fr | CC-BY-4.0 | 0 descargas, 0 likes | Conversion para Transformers.js; copia de pesos con dos cuantizaciones |
| Helsinki-NLP/opus-mt-en-fr | PyTorch (safetensors/bin) | en->fr | CC-BY-4.0 | Modelo base original | Entrenado por la Universidad de Helsinki; sin conversion ONNX |
| Xenova/opus-mt-en-fr | ONNX | en->fr | CC-BY-4.0 | Conversion de referencia | Conversion previa en la que se basa este repositorio |
| NLLB-200-distilled-600M | PyTorch / ONNX | Multilingue (200 idiomas) | CC-BY-NC-4.0 | Ampliamente desplegado | Mucho mayor cobertura idiomatica, pero licencia no comercial |

Los datos concretos de parametros y contexto de las alternativas no estan disponibles en la informacion proporcionada; la comparacion se limita a formato, cobertura idiomatica, licencia y disponibilidad declarada.

## Limitaciones y advertencias

- Artefacto derivado: no aporta entrenamiento nuevo, solo conversion de formato. Cualquier mejora de calidad debe venir del modelo base.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- Sin benchmarks publicados: no hay evidencia objetiva de calidad de traduccion en este repositorio.
- Sesgos: no documentados en la informacion proporcionada, pero heredados del corpus OPUS con el que se entreno el modelo base.
- Riesgo de alucinacion y de traducciones incorrectas en terminologia especializada, nombres propios y dominios tecnicos; se recomienda revision humana en contextos criticos.
- Direccion unica: solo traduce ingles a frances; no soporta el sentido inverso ni otros pares idiomaticos.
- Limitaciones de contexto: la longitud maxima de secuencia no esta documentada en la informacion disponible; los textos largos pueden requerir segmentacion previa.
- Licencia CC-BY-4.0: permite uso comercial, pero obliga a mantener la atribucion a la Universidad de Helsinki y al autor de la conversion.
- Mantenimiento incierto: el autor declara que el repositorio existe para desacoplar un plugin propio de un repositorio de terceros, no como proyecto mantenido para la comunidad.
- Al ejecutarse en el navegador, el rendimiento depende del hardware del cliente: en equipos sin WebGPU la inferencia cae al backend WASM con la cuantizacion q8 y una calidad potencialmente inferior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vlad-grig/opus-mt-en-fr
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-en-fr
- Conversion ONNX de referencia: https://huggingface.co/Xenova/opus-mt-en-fr
- Repositorio de Transformers.js: https://github.com/huggingface/transformers.js

Los resultados de la busqueda web no devolvieron enlaces tecnicos relevantes sobre este modelo; las entradas obtenidas corresponden a empresas, canales de video y articulos historicos sin relacion con el artefacto.
