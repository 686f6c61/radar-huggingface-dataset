# wajdiz/camelbert-mix-ner-onnx

## Resumen

`wajdiz/camelbert-mix-ner-onnx` es una exportación a ONNX con cuantización INT8 del modelo `CAMeL-Lab/bert-base-arabic-camelbert-mix-ner`, un sistema de reconocimiento de entidades nombradas (NER) para árabe basado en la familia CAMeLBERT. El modelo original lo desarrolla CAMeL Lab (Universidad de Nueva York en Abu Dabi) y esta versión la publica el usuario `wajdiz` para su uso con Transformers.js, la librería de inferencia en JavaScript del ecosistema Hugging Face.

El problema que resuelve es doble: por un lado, ofrece etiquetado de entidades nombradas en árabe (personas, organizaciones, localizaciones y miscelánea) sobre texto sin segmentar morfológicamente; por otro, al estar exportado a ONNX con cuantización dinámica INT8, permite ejecutar el modelo en el navegador o en Node.js sin depender de Python ni de GPUs.

La relevancia actual es acotada pero concreta: el repositorio pesa 0,1 GB, la licencia es Apache 2.0 y la arquitectura subyacente es BERT base (12 capas, 768 dimensiones ocultas). No es un modelo generativo ni un LLM: es un encoder discriminativo para una tarea de clasificación de tokens, pensado para integrarse en aplicaciones web de procesamiento de árabe.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT base (transformer encoder bidireccional), exportado a ONNX |
| Parametros totales | no disponible (el modelo base CAMeLBERT-mix es un BERT base, del orden de 110 M, pero no se confirma en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (los BERT base suelen usar 512 tokens, pero no se confirma) |
| Tipos de cuantizacion | INT8 con cuantizacion dinamica (unica variante publicada) |
| Idiomas soportados | arabe (segun la model card y los tags) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (compatible con Transformers.js) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base `CAMeL-Lab/bert-base-arabic-camelbert-mix-ner`: un transformer encoder de tipo BERT entrenado sobre texto arabe y ajustado despues para etiquetado de secuencias (token classification). CAMeLBERT-mix es una de las variantes de la familia CAMeLBERT, que combina corpus arabes de distinta procedencia (clasico, moderno y dialectal) para el preentrenamiento. Sobre esa base se aplico un ajuste supervisado de NER, presumiblemente sobre un corpus anotado de entidades arabes, aunque la informacion disponible no detalla el dataset, el numero de tokens ni el esquema de etiquetas.

La innovacion tecnica de esta version concreta no esta en el entrenamiento, sino en el proceso de exportacion: se ha convertido el modelo a formato ONNX y se ha aplicado cuantizacion dinamica a 8 bits mediante el script `research_tools/convert_to_onnx.py` de MARSAD Studio. Esto reduce el peso del repositorio a 0,1 GB y permite inferencia en entornos JavaScript sin runtime de PyTorch. No se ha realizado ningun reentrenamiento ni ajuste adicional: los pesos son los del modelo original, solo transformados.

## Capacidades

- Reconocimiento de entidades nombradas en arabe: etiqueta tokens como persona, organizacion, localizacion y miscelanea (esquema concreto no disponible).
- Clasificacion de tokens a nivel de palabra o subtoken, segun la tokenizacion del modelo base.
- Inferencia en navegador y en Node.js mediante Transformers.js y ONNX Runtime Web.
- Ejecucion en CPU sin GPU, gracias a la cuantizacion INT8.
- No soporta generacion de texto, razonamiento, codigo ni matematicas: es un modelo discriminativo.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No soporta vision ni audio.
- Capacidad multilingue limitada al arabe; no se documentan otros idiomas.
- No dispone de modo thinking ni de decodificacion especulativa.

## Casos de uso

- Extraccion de entidades en articulos de prensa arabe: el modelo identifica nombres de personas, organizaciones y lugares en textos periodisticos, lo que permite construir indices de entidades y grafos de conocimiento a partir de corpus arabes. Es adecuado porque el ajuste NER se hizo sobre texto arabe y el modelo base cubre registro moderno estandar.
- Anonimizacion de documentos en el navegador: al ejecutarse con Transformers.js sobre ONNX INT8, se puede detectar y enmascarar nombres propios en formularios o documentos sin enviar el texto a un servidor, lo que reduce riesgos de privacidad en aplicaciones web de gestion documental.
- Enriquecimiento de motores de busqueda internos: se pueden etiquetar entidades en los documentos indexados para permitir filtros por organizacion o localidad en un buscador corporativo de contenido arabe.
- Procesamiento de redes sociales y comentarios: el modelo puede etiquetar entidades en publicaciones arabes para tareas de moderacion asistida o analisis de mencion de marcas, aunque el rendimiento en dialecto puede degradarse respecto al arabe estandar.
- Preprocesado para pipelines de NLP aguas abajo: las entidades detectadas sirven como entrada para sistemas de resolucion de entidades, extraccion de relaciones o resumen de noticias, actuando como primer paso barato y ejecutable en CPU.
- Extension de navegador o widget de accesibilidad: al ser un modelo ONNX pequeno, puede integrarse en una extension que resalte entidades en paginas web arabes y ofrezca informacion contextual al usuario sin backend.
- Prototipado rapido en entornos JavaScript: equipos que trabajan en frontend pueden validar una funcionalidad NER sin montar infraestructura Python, usando el modelo como prueba de concepto antes de escalar a un servicio dedicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido habitual; al ser un modelo de unos 0,1 GB en INT8, la huella en memoria es del orden de cientos de megabytes, pero no se dispone de una cifra oficial.
- GPU recomendadas: no son necesarias; el modelo esta pensado para CPU y para el runtime ONNX Web, que puede usar WebGPU o WASM en el navegador.
- Cabe en cualquier GPU consumer e incluso en dispositivos sin GPU dedicada; no se documentan requisitos minimos.
- Opciones de despliegue: Transformers.js (principal), ONNX Runtime (Web, Node.js o nativo). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| wajdiz/camelbert-mix-ner-onnx | no disponible (BERT base) | no disponible | NER en arabe | Apache 2.0 | ONNX INT8 |
| CAMeL-Lab/bert-base-arabic-camelbert-mix-ner | no disponible (BERT base) | no disponible | NER en arabe | no disponible en la informacion | PyTorch/safetensors |
| Otros modelos NER arabes (p. ej. variantes MARBERT o AraBERT ajustadas) | no disponible | no disponible | NER en arabe | no disponible | no disponible |

La comparativa se limita al modelo original del que deriva, ya que la informacion proporcionada no incluye datos de rendimiento ni especificaciones de alternativas. La diferencia principal frente al original es el formato (ONNX INT8 frente a pesos PyTorch) y el tamano reducido, no la calidad del etiquetado.

## Limitaciones y advertencias

- Al ser una cuantizacion INT8, puede producirse una ligera perdida de precision en las etiquetas respecto al modelo original en FP32; no se documenta la magnitud de esa perdida.
- El modelo solo cubre arabe; no se ha validado para otros idiomas ni para texto mixto arabe-ingles.
- El rendimiento en dialectos arabes o en texto no vocalizado puede ser inferior al de arabe estandar, aunque no se aportan metricas.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si de falsos positivos y falsos negativos en la deteccion de entidades, especialmente en nombres ambiguos o fronteras de entidad mal definidas.
- No se documenta el esquema de etiquetas exacto ni el corpus de ajuste, lo que dificulta evaluar su idoneidad para dominios especializados (medico, legal, financiero).
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base original, que no se detalla en la informacion proporcionada.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en 2026: no hay evidencia de uso en produccion ni de validacion por la comunidad.
- La fecha de creacion indicada (2026-11-12) es futura respecto a la mayoria de referencias habituales; conviene verificar la integridad y procedencia de los archivos antes de desplegarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/wajdiz/camelbert-mix-ner-onnx
- Modelo base: https://huggingface.co/CAMeL-Lab/bert-base-arabic-camelbert-mix-ner
- Transformers.js: https://github.com/huggingface/transformers.js
- ONNX Runtime: https://onnxruntime.ai/
