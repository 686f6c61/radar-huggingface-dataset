# VioletXF/manga-character-parts-coreml

## Resumen

VioletXF/manga-character-parts-coreml es un paquete de inferencia para movil publicado por el usuario VioletXF en Hugging Face, orientado a la segmentacion de partes de personajes de manga. No es un unico modelo entrenado de cero, sino una integracion de cuatro componentes independientes: un detector de cabeza (head_detect_v2.0_s de DeepGHS), un segmentador de primer plano (ISNetIS de SkyTNT), un parser de partes de anime (StyleAnime convertido a Core ML en FP16) y un generador de colorizacion (derivado de manga-colorization-v2 de Faridzar). El paquete ocupa 0,3 GB en el repositorio y la descarga declarada es de 308.654.033 bytes antes de la compilacion especifica de Core ML para cada dispositivo.

El objetivo declarado es servir como guia conservadora para cabello y piel en cabezas frontales, no como un segmentador universal de manga ni como un colorizador autonomo. La aplicacion anfitriona anade puertas de anatomia e identidad, exclusiones de primer plano, trazo y dialogo, paletas de referencia separadas y composicion de partes a resolucion nativa. El autor advierte explicitamente de que las mascaras por si solas no establecen una propiedad fiable de las regiones y que perfiles, ojos cerrados, personas solapadas y cabello fuera del recorte de cabeza pueden quedar sin asignar.

El modelo es relevante ahora por dos motivos: ilustra el patron de empaquetado de pesos ONNX con conversion a Core ML para inferencia en dispositivo en el ecosistema Apple, y documenta de forma inusualmente explicita un caso de derechos de redistribucion no resueltos en pesos derivados. No tiene descargas ni likes registrados y esta etiquetado como experimental, con validacion limitada a comprobaciones locales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Integracion multi-modelo heterogenea: detector de cabeza (DeepGHS head_detect_v2.0_s), segmentador de primer plano (SkyTNT ISNetIS), parser de partes de anime (StyleAnime, 19 clases) y generador de colorizacion (Faridzar manga-colorization-v2); no existe una arquitectura unica |
| Parametros totales | no disponible (no se publica el recuento de parametros de ningun componente) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (modelo de vision; las entradas son tensores de imagen de forma fija) |
| Tipos de cuantizacion | FP16 (Parts.mlpackage y export del generador); no se documentan otros formatos de cuantizacion |
| Idiomas soportados | no aplicable (procesa imagenes; no hay interfaz de texto) |
| Licencia | sin licencia global asignada al conjunto; componentes con MIT (deteccion de cabeza y arquitectura del parser) y Apache-2.0 (primer plano), y pesos derivados sin licencia de redistribucion explicita |
| Formato de pesos | ONNX (.onnx) y Core ML (.mlpackage) |
| Tarea declarada (pipeline) | image-segmentation |
| Resoluciones de entrada | head.onnx: 640x640 RGB bicubic; foreground.onnx: 1024; Parts.mlpackage: float32 RGB [1,3,512,512] con normalizacion ImageNet y salida int32 [1,512,512]; generator512.onnx: fijo [1,5,512,512] |
| Salida del generador | RGB ya normalizado en 0-1 |
| Tamano del repositorio | 0,3 GB (descarga declarada de 308.654.033 bytes, aproximadamente 294 MiB) |
| Descargas y likes | 0 y 0 |
| Fecha de creacion | 2026-09-27 |
| Ultima actualizacion | 2026-09-27 |

## Arquitectura y entrenamiento

El paquete no entrena ningun modelo: reutiliza y convierte pesos de terceros. Cada componente conserva su contrato de entrada. `head.onnx` es un detector de cabeza de DeepGHS con entrada cuadrada de 640 pixeles en RGB y remuestreo bicubico, compatible con el modelo original. `foreground.onnx` es ISNetIS de SkyTNT y actua como veto independiente de primer plano a 1024. `Parts.mlpackage` es el parser de anime de StyleAnime convertido a Core ML en FP16, con entrada float32 RGB [1,3,512,512] normalizada con estadisticos de ImageNet y salida de etiquetas int32 [1,512,512] sobre 19 clases. `generator512.onnx` es un derivado de solo forma del export FP16 de manga-colorization-v2 de Faridzar, con entrada fija [1,5,512,512]; el autor indica que se preservan todos los pesos y nodos y que no sustituye al modelo de pagina completa de tamano variable.

El repositorio incluye `manifest.json` con sumas de comprobacion inmutables y `SOURCES.md` con las fuentes upstream fijadas, los contratos de entrada y los limites de evaluacion. La capa de aplicacion anade puertas de anatomia e identidad, exclusiones de primer plano, trazo y dialogo, paletas de referencia separadas y composicion de partes a resolucion nativa. No se documentan datos de entrenamiento, numero de tokens, composicion del dataset ni procesos de RLHF o DPO, porque el autor no entrena estos componentes. La validacion realizada consiste en comprobaciones exactas de entrada y remuestreo, comparaciones original frente a export, inferencia real en Swift y un fixture publico de referencia rosa y line-art de extremo a extremo evaluado en local. El propio autor subraya que la coincidencia de conversion no equivale a precision semantica y que la calidad en dispositivo fisico y la puntuacion humana independiente siguen sin medirse.

## Capacidades

- Segmentacion de partes de personaje de manga: el parser produce etiquetas sobre 19 clases a 512x512, orientadas a cabello y piel de cabezas frontales.
- Deteccion de cabeza: localiza cabezas con entrada 640x640 RGB, util para encuadres y recortes.
- Veto de primer plano: ISNetIS a 1024 descarta regiones que no pertenecen al sujeto, reduciendo falsos positivos del parser.
- Asistencia a colorizacion: el generador de 512 acepta 5 canales y devuelve RGB en rango 0-1, pensado para colorizacion guiada por referencia.
- Composicion de partes a resolucion nativa dentro de la aplicacion anfitriona.
- Paletas de referencia separadas por personaje o por region, segun la descripcion del autor.
- Inferencia en dispositivo: conversion a Core ML FP16 con soporte de ejecucion en Swift, y export ONNX para otros runtimes.
- Trazabilidad de artefactos: `manifest.json` con checksums inmutables y `notices/` con avisos de terceros.
- No dispone de capacidades de generacion de texto, razonamiento, codigo, matematicas, vision general, tool calling, agentes ni procesamiento de lenguaje natural.

## Casos de uso

- Asistencia a colorizacion en aplicaciones de dibujo: el pack aporta mascaras de cabello y piel que la app puede usar como guia conservadora antes de invocar `generator512.onnx`, evitando pintar fuera del sujeto gracias al veto de primer plano a 1024.
- Edicion de manga en dispositivo Apple: al estar convertido a Core ML en FP16, el parser puede ejecutarse en iPhone, iPad o Mac sin conexion, con las entradas normalizadas ya fijadas a [1,3,512,512].
- Encuadre automatico de paneles y miniaturas: `head.onnx` permite localizar cabezas a 640x640 para generar recortes o thumbnails centrados en el personaje.
- Filtrado previo en catalogacion de paginas: `foreground.onnx` actua como veto independiente que descarta recortes sin sujeto antes de pasarlos a un pipeline de anotacion o de vision por computador.
- Anotacion asistida de datasets de manga: las etiquetas de 19 clases pueden inicializar mascaras de cabello y piel que un anotador humano corrige despues, asumiendo que las regiones no asignadas deben revisarse manualmente.
- Investigacion sobre portabilidad de pesos: el repositorio sirve como caso de estudio reproducible para medir la fidelidad de la conversion ONNX a Core ML FP16 usando las comparaciones original frente a export y los checksums de `manifest.json`.
- Integracion en pipelines de entintado o line-art: el fixture publico de referencia rosa y line-art demuestra un flujo de extremo a extremo que puede adaptarse a herramientas de coloreado por referencia.
- Prototipado de guias de color por personaje: las paletas de referencia separadas permiten mantener una identidad cromatica distinta por personaje dentro de una misma pagina.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explicitamente que la calidad en dispositivo fisico y la puntuacion humana independiente siguen sin medirse, y que la coincidencia de conversion no implica precision semantica. Tampoco se aportan cifras de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se publican cifras de memoria ni de parametros por componente.
- Huella en disco: 308.654.033 bytes de descarga (aproximadamente 294 MiB), con un repositorio de 0,3 GB; la compilacion Core ML especifica por dispositivo anade espacio adicional.
- GPU recomendadas: no disponible. El paquete esta disenado para inferencia en dispositivo Apple mediante Core ML, y los ficheros ONNX pueden ejecutarse en CPU o GPU con ONNX Runtime.
- GPU de consumo: no se confirma compatibilidad con ninguna GPU de consumo concreta. Los componentes operan a 512, 640 y 1024 pixeles, lo que acota el tamano de las activaciones, pero no se publican mediciones.
- Opciones de despliegue: Core ML con inferencia en Swift para `Parts.mlpackage`; ONNX Runtime u otro runtime compatible con ONNX para `head.onnx`, `foreground.onnx` y `generator512.onnx`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos publicos de parametros, contexto ni rendimiento de este pack ni de los modelos upstream citados, por lo que la comparacion numerica no es posible. La tabla siguiente contrasta los componentes del propio paquete entre si, que es la unica comparacion sustentada por la informacion disponible.

| Componente | Origen | Entrada | Salida | Licencia declarada |
|---|---|---|---|---|
| head.onnx | DeepGHS head_detect_v2.0_s | 640x640 RGB bicubico | deteccion de cabeza | MIT |
| foreground.onnx | SkyTNT ISNetIS | 1024 | mascara de primer plano | Apache-2.0 |
| Parts.mlpackage | StyleAnime convertido a Core ML FP16 | float32 RGB [1,3,512,512], normalizacion ImageNet | int32 [1,512,512], 19 clases | arquitectura MIT; pesos sin licencia de redistribucion explicita |
| generator512.onnx | Derivado de Faridzar manga-colorization-v2 FP16 | [1,5,512,512] fijo | RGB en 0-1 | export con licencia MIT declarada; pesos upstream sin licencia explicita |

Alternativas externas de la misma categoria (segmentacion de personajes de anime y manga, o colorizacion de manga): no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Los derechos de redistribucion de los pesos no estan resueltos. No se asigna una licencia global al conjunto y el autor afirma que este pack experimental no constituye una autorizacion de uso comercial.
- El checkpoint original de StyleAnime no tiene licencia de redistribucion explicita en la fuente inspeccionada, y los pesos preentrenados upstream del generador tampoco. Las etiquetas MIT de la arquitectura y del mirror de export no otorgan derechos sobre los pesos subyacentes.
- Las mascaras no establecen una propiedad fiable de las regiones; se requiere revision o logica adicional en la aplicacion.
- Quedan sin asignar los perfiles, los ojos cerrados, las personas solapadas y el cabello fuera del recorte de cabeza.
- El pack esta pensado solo como guia para cabezas frontales de cabello y piel; no es un segmentador de manga universalmente preciso.
- No es un colorizador autonomo: `generator512.onnx` es un derivado de forma fija y no sustituye al modelo de pagina completa de tamano variable.
- La validacion se limita a comprobaciones de entrada y remuestreo, comparaciones original frente a export, inferencia en Swift y un fixture local. No hay puntuacion humana independiente ni medicion en dispositivo fisico.
- No se documentan datos de entrenamiento, composicion del dataset ni evaluacion de sesgos; es previsible un sesgo hacia los estilos de manga presentes en los corpus upstream, aunque no cuantificado.
- Alucinacion: no aplicable en el sentido de generacion de texto, pero el autor advierte que la coincidencia de conversion no implica precision semantica, por lo que pueden aparecer mascaras incorrectas o incompletas.
- Limitaciones de idioma: no aplicable, el modelo solo procesa imagenes. Las entradas de texto y dialogo se excluyen mediante la capa de aplicacion.
- Sin descargas ni likes registrados, y sin resultados de benchmarks publicados: no existe validacion por parte de la comunidad.
- Los avisos completos y las model cards upstream se incluyen en `notices/`; cualquier uso en produccion deberia revisarlos antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VioletXF/manga-character-parts-coreml
- Ficheros de referencia dentro del repositorio, segun la model card: `manifest.json` (checksums inmutables), `SOURCES.md` (fuentes upstream fijadas, contratos de entrada y limites de evaluacion) y `notices/` (avisos de terceros).
- La busqueda web realizada no ha devuelto resultados relevantes para este modelo; los enlaces obtenidos correspondian a contenido sin relacion. No se dispone de paper, blog, repositorio o demo adicional asociado.
