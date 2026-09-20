# t-firefly/qwen3.5-2b-rknn3-rk1828

## Resumen

Este repositorio contiene una conversion del modelo Qwen3.5-2B, desarrollado originalmente por el Qwen Team, adaptada por el Firefly AI Team para ejecutarse sobre el SoC Rockchip RK1828 mediante el runtime LlamaPi. No se trata por tanto de un entrenamiento nuevo, sino de una distribucion cuantizada y empaquetada (tags `gguf`, `rknn3`, `rk1828`) orientada a inferencia en el borde, con un peso total de repositorio de 2,3 GB. El modelo mantiene la naturaleza multimodal de tipo image-text-to-text del original, es decir, entrada conjunta de imagen y texto y salida de texto.

El modelo base, Qwen3.5-2B, es un modelo compacto de vision-lenguaje de la familia Qwen3.5, con unos 2.000 millones de parametros, que unifica comprension visual y linguistica mediante entrenamiento multimodal de fusion temprana. Segun la model card, emplea una arquitectura hibrida basada en Gated Delta Networks combinadas con un Mixture-of-Experts disperso, y declara soporte para 201 idiomas y dialectos con una ventana de contexto nativa de 262.144 tokens. Esa combinacion de contexto largo y tamano reducido lo hace atractivo para prototipado, ajuste fino especifico de tarea e investigacion.

La relevancia de esta ficha concreta esta en el despliegue: permite ejecutar un VLM de 2B con contexto nominal muy amplio en hardware de borde sin GPU dedicada, usando el comando `llamapi run qwen3.5:2b`. Conviene senalar que el repositorio no publica resultados de benchmarks, ni la lista efectiva de cuantizaciones incluidas, ni los idiomas realmente validados tras la conversion, por lo que la evaluacion previa a produccion corre por cuenta del integrador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: Gated Delta Networks con Mixture-of-Experts disperso (segun la model card del modelo base); transformer multimodal de fusion temprana |
| Parametros totales | 2B (aproximado, segun nomenclatura Qwen3.5-2B); no se detalla el recuento exacto en la informacion disponible |
| Parametros activos | no disponible (el modelo base es MoE disperso, pero no se indica el numero de parametros activos) |
| Longitud de contexto | 262.144 tokens nativos (heredados del modelo base; el limite efectivo en RK1828 no esta especificado) |
| Tipos de cuantizacion | no disponible (el tag `gguf` y el sufijo `rknn3` indican conversion cuantizada, pero no se enumeran niveles concretos) |
| Idiomas soportados | 201 idiomas y dialectos declarados para el modelo base; idiomas validados tras la conversion: no disponible |
| Licencia | Apache 2.0 (los derechos del modelo original pertenecen al equipo oficial de Qwen) |
| Formato de pesos | GGUF (tag) y formato para NPU Rockchip RK1828 (`rknn3`); tamano de repositorio 2,3 GB |

## Arquitectura y entrenamiento

El modelo original Qwen3.5-2B emplea, segun su model card, una arquitectura hibrida que combina Gated Delta Networks (una familia de modelos de estado recurrente con compuertas, alternativa eficiente a la atencion completa) con capas de Mixture-of-Experts disperso. Esta disenado para inferencia de alto throughput y baja latencia, y realiza un entrenamiento multimodal de fusion temprana, por lo que la informacion visual se integra en las primeras etapas del procesamiento en lugar de delegarse a un adaptador posterior. El modelo base cubre 201 idiomas y dialectos y una ventana nativa de 262.144 tokens. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron etapas de RLHF o DPO.

Sobre esa base, el repositorio de Firefly no documenta reentrenamiento alguno: describe una conversion y adaptacion para el SoC RK1828, con pesos en formato GGUF y en el formato propietario de la NPU (`rknn3`), y despliegue mediante el runtime LlamaPi. No se detallan el pipeline de cuantizacion, el calibrado, la posible perdida de precision respecto al modelo original, ni las innovaciones tecnicas propias mas alla del soporte de ejecucion en el acelerador de Rockchip.

## Capacidades

- Generacion de texto conversacional: el pipeline declarado es `image-text-to-text` con tag `conversational`, por lo que soporta dialogos multi-turno.
- Comprension de imagen y texto combinados: capacidad multimodal heredada del modelo base (descripcion de imagenes, respuesta a preguntas sobre contenido visual, OCR orientativo).
- Contexto largo nominal de 262.144 tokens en el modelo base, adecuado para documentos extensos o historiales largos si el hardware de destino lo permite.
- Cobertura multilingue amplia declarada para el modelo base (201 idiomas y dialectos), sin validacion publicada tras la conversion.
- Ajuste fino especifico de tarea y prototipado, segun la propia descripcion del modelo original.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte explicito de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente visual local en dispositivos de borde: el modelo puede procesar una imagen capturada por la camara del dispositivo junto a una consulta de texto y devolver una descripcion o respuesta, ejecutandose enteramente en el SoC RK1828 sin depender de la nube.
- Descripcion automatica de imagenes para accesibilidad: generacion de texto alternativo en aplicaciones de lectura o catalogos, con la ventaja de que los datos no salen del dispositivo.
- Digitalizacion asistida de documentos: extraccion y resumen de informacion de tickets, formularios o etiquetas a partir de la imagen, usando la ventana de contexto del modelo base para acumular varias paginas en una misma sesion.
- Control por voz y vision en robotica o automatizacion industrial: interpretacion de escenas capturadas por camara y generacion de instrucciones en lenguaje natural para el sistema de control, con latencia baja sobre NPU.
- Kiosco interactivo multilingue: atencion en puntos de informacion fisicos donde el usuario muestra un documento o producto y formula preguntas, aprovechando la cobertura de idiomas declarada del modelo base.
- Prototipado e investigacion en vision-lenguaje: banco de pruebas de bajo coste para validar prompts, estrategias de cuantizacion y pipelines multimodales antes de escalar a modelos mayores.
- Filtrado previo en el borde: clasificacion y resumen local de imagenes o texto para decidir que se reenvia a un modelo mayor en servidor, reduciendo ancho de banda y coste de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye puntuaciones de MMLU, HumanEval, GSM8K, MMMU ni de ninguna otra suite, ni comparativas con el modelo base sin cuantizar. La busqueda web realizada no ha devuelto resultados utiles (unicamente paginas genericas sin relacion con el modelo), por lo que no se dispone de mediciones independientes.

## Requisitos de hardware

- Plataforma objetivo declarada: SoC Rockchip RK1828, con despliegue mediante LlamaPi (`llamapi run qwen3.5:2b`).
- Huella de pesos: 2,3 GB de repositorio, por lo que cabe holgadamente en la memoria de un dispositivo de borde actual; a ello hay que sumar el coste de la cache KV.
- VRAM en GPU de escritorio: no disponible de forma oficial. Como referencia orientativa, un modelo de ~2B en cuantizacion de 8 bits ocupa del orden de 2-3 GB de pesos y en 4 bits alrededor de 1,5 GB, cifras que se deben verificar en el entorno real.
- GPU consumer: previsiblemente ejecutable en GPUs con 6-8 GB de VRAM o mas (por ejemplo, RTX 3060, RTX 4060, RTX 4090), aunque el repositorio esta empaquetado para RK1828 y no se documenta su uso con CUDA.
- Contexto largo: los 262.144 tokens nominales implican una cache KV muy grande; en un dispositivo de borde el contexto efectivo estara limitado por la memoria disponible, aunque no se especifica el limite practico.
- Opciones de despliegue: LlamaPi sobre RK1828 (documentado). El tag `gguf` sugiere compatibilidad potencial con llama.cpp u Ollama, pero no se confirma en la model card. vLLM o TGI no estan documentados para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / destino | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| t-firefly/qwen3.5-2b-rknn3-rk1828 | 2B | 262.144 tokens (heredado) | GGUF + RKNN para RK1828 | Apache 2.0 | no disponible |
| Qwen/Qwen3.5-2B (modelo base) | 2B | 262.144 tokens | safetensors (formato original) | Apache 2.0 | no disponible |
| Otros VLM compactos para borde | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion documentada con rigor es la del artefacto convertido frente a su modelo base Qwen3.5-2B: misma licencia Apache 2.0 y misma arquitectura declarada, con la diferencia de que la version de Firefly esta cuantizada y empaquetada para NPU Rockchip, y la del modelo original se distribuye para GPU o CPU. No hay datos publicados que permitan comparar rendimiento con alternativas como SmolVLM o Qwen2.5-VL-3B, por lo que cualquier afirmacion al respecto seria especulativa.

## Limitaciones y advertencias

- No se han publicado benchmarks ni evaluaciones de la version convertida, por lo que se desconoce la perdida de precision introducida por la cuantizacion respecto al modelo original.
- Riesgo de alucinacion inherente a los modelos de lenguaje de este tamano, especialmente en tareas de lectura de texto en imagen (OCR) y en preguntas sobre detalles finos de una escena.
- El limite efectivo de contexto en RK1828 no esta documentado; los 262.144 tokens son una caracteristica nominal del modelo base y pueden no ser alcanzables en el dispositivo.
- Los 201 idiomas y dialectos corresponden al modelo base; no hay validacion publicada de la cobertura multilingue tras la conversion, por lo que conviene verificar el idioma objetivo antes de desplegar.
- No se documentan sesgos conocidos del modelo original ni del artefacto convertido en la informacion disponible.
- Licencia Apache 2.0, que permite uso comercial, pero los derechos de propiedad intelectual del modelo subyacente siguen perteneciendo al equipo oficial de Qwen y su distribucion se rige por la licencia de origen enlazada en la model card.
- El repositorio registra 0 descargas y 0 likes, sin issues ni discusion publica, lo que implica ausencia de validacion por parte de la comunidad y un riesgo de soporte limitado.
- La verificacion descrita se limita al runtime LlamaPi; el uso con otros motores (llama.cpp, Ollama, vLLM) no esta confirmado ni soportado oficialmente.
- La fecha de creacion indicada (2026-09-19) procede de los metadatos del repositorio y debe tomarse como referencia de versionado.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/t-firefly/qwen3.5-2b-rknn3-rk1828
- Modelo base Qwen3.5-2B en HuggingFace: https://huggingface.co/Qwen/Qwen3.5-2B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-2B/blob/main/LICENSE
- Modelo base en ModelScope: https://modelscope.cn/models/Qwen/Qwen3.5-2B
- Firefly AI Team: https://www.t-firefly.com/
- Documentacion de LlamaPi: https://community.t-firefly.com/en/docs/ai/applications/LlamaPi/llamapi/introduction
