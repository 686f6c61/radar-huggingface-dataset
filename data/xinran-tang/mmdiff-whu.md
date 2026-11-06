# XinRan-Tang/MMDiff-WHU

## Resumen

MMDiff-WHU es un conjunto de pesos de un modelo de difusion texto-a-imagen especializado en generar imagenes de teledeteccion en tres modalidades: optica (OPT), radar de apertura sintetica (SAR) e infrarrojo cercano (NIR). Lo desarrolla Haojun Tang y colaboradores de la Universidad Tecnologica de Dalian y la unidad 92728 del EPL, y se presenta como el primer framework de difusion guiado por texto disenado explicitamente para generar conjuntamente imagenes OPT, SAR e IR espacialmente consistentes a partir de un unico prompt textual mediante transferencia de caracteristicas espaciales entre modalidades.

El modelo parte de un backbone de difusion tipo Stable Diffusion y se ha ajustado fino sobre el dataset WHU-OPT-SAR, recortado en teselas de 512x512 y anotado con leyendas generadas por GPT-4o-mini. La rama optica se entrena con pares imagen-texto completos, mientras que las ramas SAR y NIR se entrenan con plantillas textuales especificas de modalidad y adaptadores LoRA por clase, lo que evita depender de descripciones linguisticas complejas para esas modalidades.

Su relevancia actual reside en la escasez de muestras multimodales espacialmente alineadas en teledeteccion: obtener imagenes OPT, SAR e IR del mismo lugar y momento es logisticamente dificil por las diferencias entre sensores y tiempos de adquisicion. MMDiff-WHU aborda ese cuello de botella generando datos sinteticos alineados que pueden alimentar tareas posteriores como fusion de imagenes o clasificacion de coberturas del suelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion texto-a-imagen (backbone tipo Stable Diffusion) con ramas OPT, SAR y NIR y adaptadores LoRA por clase |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de difusion condicionado por texto, no LLM) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria diffusers) |

## Arquitectura y entrenamiento

MMDiff es un framework de difusion condicionado por texto que genera de forma conjunta imagenes OPT, SAR e IR estructuralmente consistentes. La rama optica se entrena primero con datos pareados imagen-texto para capturar contenido semantico rico; despues, las ramas SAR e IR se entrenan con plantillas textuales simples especificas de modalidad para aprender los atributos de estilo correspondientes. El mecanismo clave es una adaptacion de traduccion de modalidad basada en LoRA que traslada los atributos de estilo de las representaciones espaciales opticas a los estilos SAR e IR preservando el contenido semantico subyacente; esas representaciones traducidas se transfieren a las ramas SAR e IR mediante un mecanismo de transferencia de caracteristicas espaciales.

Los pesos publicados se han ajustado fino sobre el dataset MMDiff-WHU, derivado de WHU-OPT-SAR. Las imagenes originales se recortaron en teselas de 512x512 y cada tesela se asigno a la clase semantica con mayor area en su mascara de segmentacion. De las siete clases originales se conservan cuatro (city, farmland, forest, water), fusionando city y village y excluyendo road, others y background. Cada tesela se describio con GPT-4o-mini, generando pares OPT, SAR, NIR y texto. La rama OPT se ajusto sobre las cuatro clases y las ramas SAR y NIR usan adaptadores LoRA especificos por clase. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO.

## Capacidades

- Generacion de imagenes de teledeteccion en tres modalidades (optica, SAR e infrarrojo cercano) a partir de un unico prompt de texto.
- Generacion conjunta con consistencia espacial entre modalidades gracias a la transferencia de caracteristicas espaciales.
- Generacion de imagenes opticas de 512x512 con contenido semantico rico.
- Generacion de imagenes SAR e IR con estilo de modalidad especifico mediante adaptadores LoRA por clase (city, farmland, forest, water).
- Condicionamiento por texto con plantillas simples para las ramas SAR e IR.
- Utilidad como generador de datos sinteticos para tareas posteriores de fusion multimodal y clasificacion de coberturas del suelo.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades de audio.

## Casos de uso

- Aumento de datos para clasificacion de coberturas del suelo: generar teselas SAR e IR alineadas con opticas a partir de descripciones textuales permite ampliar datasets etiquetados de cuatro clases (city, farmland, forest, water) alli donde faltan pares reales.
- Fusion de imagenes multimodales: las tripletas OPT-SAR-NIR generadas con consistencia espacial sirven para entrenar y evaluar algoritmos de fusion que necesitan pares perfectamente alineados.
- Simulacion de escenarios con cobertura nubosa: la rama SAR permite obtener representaciones radar sinteticas de una escena descrita en texto, util como complemento cuando la imagen optica real no esta disponible.
- Prototipado de pipelines de teledeteccion: investigadores pueden generar lotes controlados de imagenes por clase y modalidad para probar etapas de preprocesado, segmentacion o deteccion sin depender de campanas de adquisicion.
- Docencia y divulgacion: generar ejemplos visuales de como se ve una misma escena en OPT, SAR y NIR facilita explicar las diferencias entre sensores.
- Estudio de transferencia entre modalidades: el modelo sirve como banco de pruebas para investigar traduccion de estilo entre representaciones opticas y radar/infrarrojas.
- Generacion de datos de entrenamiento para modelos de vision en dominios con escasez de muestras SAR o IR etiquetadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card afirma que MMDiff logra mejor calidad de imagen en similitud de modalidad y consistencia semantica que los metodos del estado del arte, y que beneficia aplicaciones posteriores como fusion multimodal y clasificacion de objetos, pero no se incluyen tablas con valores concretos (MMLU, HumanEval, GSM8K u otras metricas) en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio ocupa 5,5 GB, lo que da una referencia del espacio en disco de los pesos, pero no de la VRAM necesaria.
- GPU recomendadas: no disponible en la informacion proporcionada; por tratarse de un modelo de difusion a 512x512, es razonable esperar que requiera GPU con memoria dedicada, pero no se confirma.
- Compatibilidad con GPU de consumo: no confirmada en la documentacion disponible.
- Opciones de despliegue: la libreria declarada es diffusers; el repositorio principal de MMDiff (GitHub) proporciona comandos de muestreo (`python mmdiff/sampling_OPT.py --model_path ... --resolution 512`). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de otros modelos comparables de generacion multimodal de teledeteccion ni sus especificaciones, por lo que no es posible establecer una comparativa con cifras verificables.

## Limitaciones y advertencias

- El modelo esta especializado en teledeteccion y en cuatro clases de cobertura del suelo (city, farmland, forest, water); fuera de ese dominio su utilidad no esta documentada.
- Resolucion fija de 512x512; no se documenta soporte para otras resoluciones.
- Las ramas SAR e IR dependen de plantillas textuales simples y adaptadores LoRA por clase, lo que limita la expresividad del control textual en esas modalidades.
- Riesgo de alucinacion visual: como modelo generativo, puede producir escenas plausibles pero no reales; no debe usarse como sustituto de imagenes reales en aplicaciones criticas sin validacion.
- Sesgos potenciales derivados del dataset WHU-OPT-SAR (region geografica concreta, clases seleccionadas, leyendas generadas por GPT-4o-mini), que pueden propagarse a las imagenes sinteticas.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del dataset de origen y de los pesos base sobre los que se ajusto.
- No se documentan limitaciones de idioma porque no se especifican idiomas soportados.
- Para produccion, es necesario validar la consistencia espacial real entre modalidades generadas, ya que la model card no aporta metricas cuantitativas publicas.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/XinRan-Tang/MMDiff-WHU
- Hugging Face del modelo MM-Diff: https://huggingface.co/XinRan-Tang/MM-Diff
- Dataset MMDiff-WHU: https://huggingface.co/datasets/XinRan-Tang/MMDiff-WHU-dataset
- Dataset Optical-SAR-Infrared: https://huggingface.co/datasets/XinRan-Tang/Optical-SAR-Infrared
- Repositorio principal de MMDiff: https://github.com/XinR-Tang/MMDiff
