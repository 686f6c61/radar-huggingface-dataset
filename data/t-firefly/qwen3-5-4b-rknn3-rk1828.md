# t-firefly/qwen3.5-4b-rknn3-rk1828

## Resumen

`t-firefly/qwen3.5-4b-rknn3-rk1828` es una conversion del modelo Qwen3.5-4B, desarrollado originalmente por el equipo de Qwen, adaptada por el equipo de Firefly AI (t-firefly) para ejecutarse sobre la plataforma Rockchip RK1828 mediante el runtime LlamaPi. No se trata de un modelo entrenado desde cero, sino de una redistribucion empaquetada y optimizada para aceleracion en NPU de borde: el repositorio incluye los pesos convertidos (formato etiquetado como gguf y rknn3) junto con las instrucciones de despliegue.

El modelo base es un modelo nativo de vision-lenguaje (image-text-to-text) de la familia Qwen3.5, con aproximadamente 4.000 millones de parametros, que unifica comprension visual y textual mediante entrenamiento multimodal de fusion temprana. Su arquitectura es hibrida, combinando Gated Delta Networks con un Mixture-of-Experts disperso, lo que busca alto rendimiento con baja latencia en inferencia.

La relevancia de esta ficha radica en su orientacion a edge AI: es una de las primeras conversiones publicas de Qwen3.5-4B para hardware Rockchip RK1828, con una ventana de contexto nativa de 262.144 tokens extensible hasta 1.000.000, soporte declarado de 201 idiomas y dialectos, y licencia Apache 2.0. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamano de 4,2 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: Gated Delta Networks con Mixture-of-Experts disperso (segun model card del modelo base) |
| Parametros totales | 4B (modelo base Qwen3.5-4B) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens nativos, extensible hasta 1.000.000 |
| Tipos de cuantizacion | no disponible (los tags del repositorio mencionan gguf; el nombre indica conversion rknn3) |
| Idiomas soportados | 201 idiomas y dialectos (segun descripcion del modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | etiquetado como GGUF y RKNN3 (convertido para NPU Rockchip RK1828) |

## Arquitectura y entrenamiento

La arquitectura corresponde al modelo original Qwen3.5-4B: un transformer hibrido que combina Gated Delta Networks con capas de Mixture-of-Experts disperso. Este diseno busca reducir el coste computacional por token manteniendo la capacidad del modelo, con el objetivo declarado de alto throughput y baja latencia. El modelo base es multimodal nativo, con entrenamiento de fusion temprana entre vision y lenguaje, y pipeline declarado `image-text-to-text`.

El repositorio de Firefly no aporta informacion sobre el proceso de entrenamiento del modelo original (numero de tokens, composicion del dataset, uso de RLHF o DPO, tecnicas de alineacion). Tampoco documenta el procedimiento exacto de conversion, calibracion o cuantizacion aplicado para generar los artefactos RKNN3/GGUF, ni si se realizo validacion numerica frente al modelo original. Toda esa informacion figura como no disponible.

## Capacidades

- Generacion de texto conversacional y multimodal (imagen + texto), segun el pipeline declarado `image-text-to-text`.
- Comprension de imagenes combinada con instrucciones en lenguaje natural.
- Cobertura multilingue amplia: 201 idiomas y dialectos declarados para el modelo base.
- Contexto largo: ventana nativa de 262.144 tokens, extensible hasta 1.000.000.
- Ejecucion en NPU de borde mediante el runtime LlamaPi en plataforma Rockchip RK1828.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking explicito, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Vision por computador en dispositivos de borde: el modelo puede procesar imagenes y responder preguntas sobre ellas directamente en un dispositivo con NPU RK1828, sin necesidad de enviar datos a la nube, lo que resulta adecuado para escenarios con requisitos de privacidad o conectividad limitada.
- Asistencia documental en campo: analisis de fotografias de documentos, etiquetas o formularios con generacion de texto asociado en el propio dispositivo, aprovechando la entrada multimodal y la ventana de contexto de 262.144 tokens.
- Traduccion y atencion multilingue en kioscos o terminales: con 201 idiomas declarados, puede gestionar interacciones en multiples idiomas en un unico dispositivo de borde.
- Procesamiento de conversaciones de contexto largo: transcripciones extensas, historiales de soporte o documentacion tecnica que requieran razonamiento sobre ventanas grandes de texto.
- Automatizacion industrial con vision: inspeccion visual asistida por lenguaje (descripcion de defectos, clasificacion guiada por instrucciones textuales) ejecutada localmente sobre RK1828.
- Prototipado de productos edge AI con LlamaPi: el comando `llamapi run qwen3.5:4b` permite desplegar y validar rapidamente el modelo en hardware Rockchip sin gestion manual de pesos.
- Robots y asistentes embebidos: interfaz conversacional multimodal en plataformas con recursos computacionales y energeticos restringidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del repositorio de Firefly ni los resultados de busqueda web proporcionados incluyen cifras de MMLU, HumanEval, GSM8K, MMMU ni de ningun otro conjunto de evaluacion, ni para el modelo original Qwen3.5-4B ni para esta conversion.

## Requisitos de hardware

- Plataforma objetivo declarada: Rockchip RK1828 (aceleracion en NPU).
- El repositorio ocupa 4,2 GB, lo que da una referencia del tamano de los pesos empaquetados; el tipo de cuantizacion concreto no esta documentado.
- VRAM/RAM estimada para inferencia (estimaciones genericas segun tamano del modelo, no confirmadas por el autor): aproximadamente 8 GB en FP16, en torno a 4-5 GB en cuantizacion de 8 bits y cerca de 2,5-3 GB en cuantizacion de 4 bits.
- GPU consumer: por tamano, un modelo de 4B cuantizado a 4 bits es compatible con GPUs consumer de 8 GB de VRAM o superiores; no hay confirmacion del autor sobre modelos concretos.
- GPUs de datacenter (A100, H100) o RTX 4090: soporte no confirmado para esta conversion, cuya orientacion principal es la NPU RK1828.
- Opciones de despliegue: LlamaPi (herramienta oficial indicada por el autor), mediante `llamapi run qwen3.5:4b`; el tag `gguf` sugiere compatibilidad potencial con runtimes GGUF como llama.cpp u Ollama, pero no esta confirmado en la documentacion disponible. vLLM y TGI: no disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| t-firefly/qwen3.5-4b-rknn3-rk1828 | 4B | 262.144 tokens (extensible a 1M) | Hibrida GDN + MoE disperso | Apache 2.0 | Conversion para RK1828, via LlamaPi |
| Qwen/Qwen3.5-4B (original) | 4B | 262.144 tokens (extensible a 1M) | Hibrida GDN + MoE disperso | Apache 2.0 | HuggingFace y ModelScope |
| Otros modelos comparables de 4B multimodales | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita al modelo original frente a su conversion, ya que los resultados de busqueda web proporcionados no aportan informacion verificable sobre alternativas de la misma categoria ni sobre el rendimiento relativo entre ellas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al heredar los pesos del modelo base, arrastra los sesgos de este, no evaluados en esta ficha.
- Riesgo de alucinacion: no cuantificado por el autor; es esperable el comportamiento tipico de un modelo de 4B, con mayor propension a errores facticos que modelos de mayor tamano.
- La conversion puede introducir degradacion numerica respecto al modelo original: no se documenta validacion de calidad ni comparacion de resultados frente a Qwen3.5-4B en FP16.
- Tipo de cuantizacion y precision efectiva de los pesos empaquetados: no disponibles, lo que dificulta estimar con precision la perdida de calidad.
- Restricciones de plataforma: el artefacto esta orientado a Rockchip RK1828 y al runtime LlamaPi; su uso en otras plataformas no esta confirmado.
- Uso comercial: la licencia Apache 2.0 lo permite, pero los derechos de propiedad intelectual del modelo original permanecen en el equipo de Qwen y su distribucion se rige por la licencia oficial correspondiente, segun indica el propio autor de la conversion.
- Idiomas: aunque se declaran 201 idiomas y dialectos para el modelo base, no hay evaluacion especifica por idioma para esta conversion.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin historial de uso comunitario ni incidencias reportadas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/t-firefly/qwen3.5-4b-rknn3-rk1828
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3.5-4B
- Modelo base en ModelScope: https://modelscope.cn/models/Qwen/Qwen3.5-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Firefly AI Team: https://www.t-firefly.com/
- Documentacion de LlamaPi: https://community.t-firefly.com/en/docs/ai/applications/LlamaPi/llamapi/introduction
