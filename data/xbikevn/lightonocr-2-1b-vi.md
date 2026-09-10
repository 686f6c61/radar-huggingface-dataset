# xbikevn/LightOnOCR-2-1B-vi

## Resumen

LightOnOCR-2-1B-vi es un ajuste fino (*fine-tune*) del modelo multimodal lightonai/LightOnOCR-2-1B, publicado por el usuario xbikevn en HuggingFace. Se trata de un modelo de tipo imagen-a-texto (*image-text-to-text*) orientado a tareas de reconocimiento óptico de caracteres (OCR) sobre documentos escaneados, con 1.005.647.872 parametros (aproximadamente 1,01 mil millones) almacenados en safetensors. La licencia declarada es Apache 2.0 y el repositorio ocupa 2,0 GB.

El modelo hereda la arquitectura y las capacidades del modelo base de LightOn, etiquetado con la arquitectura `lighton_ocr` en la libreria Transformers, lo que indica un pipeline especifico de vision-lenguaje para extraccion de texto. El ajuste se realizo con el Trainer de HuggingFace durante una unica epoca, con una tasa de aprendizaje de 6e-05, tamano de lote efectivo de 16 y optimizador AdamW fusionado, segun los hiperparametros recogidos en la model card.

La relevancia de esta ficha es limitada pero concreta: se trata de un modelo de menos de 1.100 millones de parametros, lo que permite desplegarlo en GPU de consumo y en entornos sin conectividad, algo critico en digitalizacion documental con requisitos de privacidad. Sin embargo, la model card es practicamente un esqueleto autogenerado: no documenta el conjunto de datos de entrenamiento (figura como *unknown dataset*), no declara idiomas soportados y no publica ningun resultado de evaluacion, por lo que cualquier uso en produccion exige una validacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `lighton_ocr` (pipeline image-text-to-text); detalles internos no disponibles |
| Parametros totales | 1.005.647.872 (aproximadamente 1,01 B) |
| Parametros activos | No procede (no hay indicios de que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene pesos safetensors; no se publican versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponibles en los metadatos; el sufijo `-vi` del nombre sugiere un ajuste orientado a vietnamita, pero el autor no lo confirma |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

Otros datos tecnicos verificables: modelo base `lightonai/LightOnOCR-2-1B`, pipeline declarado `image-text-to-text`, tamano del repositorio 2,0 GB, etiquetas `endpoints_compatible` y `generated_from_trainer`, y fecha de publicacion 10 de septiembre de 2026.

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna en la informacion proporcionada. El modelo base pertenece a la familia LightOnOCR de LightOn, etiquetada en el Hub con la arquitectura `lighton_ocr`, lo que implica un diseno multimodal compuesto por un codificador visual y un decodificador de lenguaje que genera texto a partir de imagenes de documentos. El ajuste fino no modifica esa topologia, pero si los pesos, y la model card no especifica que componentes se descongelaron ni si se aplico LoRA o ajuste completo.

Respecto al entrenamiento, la model card (autogenerada por el Trainer) aporta los hiperparametros pero no la composicion del dataset, que aparece literalmente como *unknown dataset*. Los datos declarados son: 1 epoca, tasa de aprendizaje 6e-05 con planificador lineal y 10 pasos de calentamiento, tamano de lote de entrenamiento 4 y de evaluacion 6, acumulacion de gradientes de 4 pasos (lote efectivo 16), semilla 42 y optimizador `ADAMW_TORCH_FUSED` con betas (0,9; 0,999) y epsilon 1e-08. No se declara ninguna fase de RLHF, DPO ni ajuste por preferencias, algo esperable en un modelo especializado en OCR. Las versiones de framework indicadas son Transformers 5.0.0, PyTorch 2.11.0+cu128, Datasets 5.0.1 y Tokenizers 0.22.2.

## Capacidades

- Reconocimiento optico de caracteres sobre imagenes de documentos: el pipeline declarado es `image-text-to-text`, es decir, entrada de imagen con salida de texto.
- Transcripcion de documentos escaneados, presumiblemente con conservacion de estructura (lineas, bloques), aunque el autor no detalla el formato de salida.
- Procesamiento conversacional de imagenes: la etiqueta `conversational` indica soporte de plantillas de chat con turnos e imagenes intercaladas.
- Compatibilidad con endpoints de inferencia: la etiqueta `endpoints_compatible` sugiere despliegue directo en HuggingFace Inference Endpoints.
- Idiomas: no confirmados. La model card no lista idiomas y el unico indicio es el sufijo `-vi` del nombre.
- Tool calling / function calling: no disponible, no declarado.
- Capacidades de agente o razonamiento multi-paso: no disponibles, no declaradas.
- Vision mas alla de OCR (descripcion de escenas, VQA general): no disponible; el modelo base esta especializado en OCR, por lo que es razonable esperar un rendimiento pobre fuera de ese dominio, aunque no hay datos que lo confirmen.
- Modo de razonamiento explicito (*thinking*), audio o video: no disponibles.

## Casos de uso

- Digitalizacion masiva de archivo historico y administrativo: el modelo recibe imagenes de paginas escaneadas y devuelve texto plano o estructurado, lo que permite procesar lotes de miles de documentos en una unica GPU de gama media gracias a su tamano de 1,01 B de parametros. Es adecuado porque el coste por pagina en hardware propio es muy inferior al de modelos multimodales de decenas de miles de millones de parametros.
- Extraccion de datos en facturas y albaranes para ERP: integrado como paso previo a un parser de campos, el modelo convierte el PDF escaneado en texto del que despues se extraen CIF, bases imponibles y lineas de detalle. Su tamano permite ejecutarlo en la misma maquina que el resto del pipeline sin depender de una API externa.
- Indexacion y RAG sobre PDF escaneados: los documentos sin capa de texto se transcriben con el modelo y se trocean para alimentar una base vectorial, habilitando busqueda semantica sobre corpus que antes eran inaccesibles.
- Cumplimiento de privacidad en sectores regulados: al ser un modelo Apache 2.0 de 1,01 B desplegable on-premise, permite procesar documentacion sanitaria, legal o financiera sin enviar imagenes a servicios de terceros, lo que simplifica el cumplimiento del RGPD.
- Accesibilidad documental: conversion de documentacion escaneada a texto para lectores de pantalla y para su posterior sintesis de voz, en bibliotecas y administraciones publicas que digitalizan bajo demanda.
- Automatizacion de KYC y onboarding: extraccion de los campos de documentos de identidad y comprobantes de domicilio capturados con movil, como paso previo a la validacion contra bases de datos internas.
- Control de calidad en pipelines de digitalizacion: uso del modelo como segundo transcriptor sobre una muestra aleatoria para detectar paginas mal escaneadas o con OCR defectuoso, comparando su salida con la del motor principal.
- Preparacion de corpus para ajuste de modelos: transcripcion de documentos en idiomas minoritarios para construir datasets de texto alli donde no existen fuentes digitales, siempre que el idioma objetivo coincida con el del ajuste (no confirmado).

## Benchmarks y rendimiento

El campo `model-index` de la model card declara una entrada con la lista de resultados vacia (`"results": []`). El autor no ha publicado ninguna metrica de evaluacion y la seccion de resultados de entrenamiento del README aparece en blanco.

No se han publicado resultados de benchmarks en la informacion disponible (ni MMLU, ni HumanEval, ni GSM8K, ni metricas especificas de OCR como CER, WER, edit distance o exact match sobre OmniDocBench, DocVQA o similares).

## Requisitos de hardware

- Pesos en precision completa (FP16/BF16): aproximadamente 2,0 GB, coherente con el tamano del repositorio. Estimacion propia a partir del numero de parametros, no dato del autor.
- VRAM total estimada para inferencia: del orden de 3-5 GB en FP16 considerando pesos, activaciones del codificador visual y cache KV para imagenes de resolucion moderada. Con cuantizacion INT8 alrededor de 1,5-2,5 GB, y en INT4 alrededor de 1-1,5 GB. Son estimaciones derivadas del tamano del modelo, no cifras publicadas.
- GPU de gama alta (A100 80 GB, H100): sobredimensionadas para un modelo de 1,01 B; solo tendrian sentido para servir muchas replicas en paralelo o lotes muy grandes.
- GPU profesionales de gama media (L4, A10G, L40S, RTX 4090, RTX 3090): adecuadas tanto para inferencia interactiva como para procesamiento por lotes.
- GPU de consumo: cabe con holgura en cualquier GPU con 8 GB o mas de VRAM (RTX 3060 Ti, RTX 4060, RTX 2070). Incluso una GPU de 4-6 GB podria ejecutarlo cuantizado, aunque no se publican pesos cuantizados.
- Opciones de despliegue: al declararse la libreria `transformers` y la etiqueta `endpoints_compatible`, la via directa es `transformers` en Python o HuggingFace Inference Endpoints. vLLM o TGI serian viables si soportan la arquitectura `lighton_ocr`, extremo no confirmado en la informacion disponible. llama.cpp y Ollama quedan descartados salvo que se genere una conversion a GGUF, que el autor no ha publicado.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de paginas procesadas por minuto.

## Comparativa con modelos similares

No se dispone de datos verificables de otros modelos comparables dentro de la informacion proporcionada, por lo que la comparativa se limita al modelo base del que deriva.

| Modelo | Parametros | Contexto | Licencia | Pipeline | Notas |
|---|---|---|---|---|---|
| xbikevn/LightOnOCR-2-1B-vi | 1.005.647.872 | No disponible | Apache 2.0 | image-text-to-text | Ajuste fino; dataset de entrenamiento no documentado; 0 descargas y 0 likes en el momento de redactar la ficha |
| lightonai/LightOnOCR-2-1B (base) | No disponible con exactitud en esta informacion (el ajuste conserva el mismo orden de magnitud, ~1 B) | No disponible | No disponible en esta informacion | image-text-to-text | Modelo original de LightOn; es la referencia obligada para evaluar si el ajuste aporta mejoras o degrada el rendimiento |

No se han identificado en la informacion disponible alternativas comparables con datos verificables (parametros, contexto, licencia y benchmarks) para completar la tabla sin recurrir a cifras no confirmadas.

## Limitaciones y advertencias

- Modelo practicamente sin validacion externa: 0 descargas y 0 likes en el momento de redactar la ficha, sin resultados de benchmarks publicados. No hay evidencia de que el ajuste mejore al modelo base; podria incluso degradarlo.
- Dataset de entrenamiento desconocido: la propia model card indica *unknown dataset*. Se desconoce la procedencia de los datos, su licencia y si contienen informacion personal, lo que constituye un riesgo legal si se reutiliza comercialmente sin auditoria.
- Idiomas no declarados: los metadatos de HuggingFace no listan idiomas. El sufijo `-vi` sugiere vietnamita, pero es una inferencia del nombre, no una confirmacion del autor. No se debe asumir cobertura multilingue.
- Longitud de contexto desconocida: sin este dato no se puede garantizar el procesamiento de documentos de mas de una pagina por inferencia ni planificar estrategias de troceo.
- Riesgo de alucinacion inherente a los modelos generativos: en OCR, el modelo puede inventar caracteres, cifras o lineas completas en zonas de baja calidad, sellos, tablas densas o escritura manuscrita. En dominios como facturacion o KYC esto exige verificacion posterior obligatoria.
- Ausencia de pesos cuantizados oficiales: limita el despliegue en llama.cpp u Ollama y obliga a cuantizar por cuenta propia, con el consiguiente riesgo de degradacion no medida.
- Model card autogenerada sin revisar: el propio README conserva el comentario de la plantilla del Trainer pidiendo revisar y completar la ficha. Secciones como *Intended uses & limitations* y *Training and evaluation data* estan literalmente marcadas como "More information needed".
- Licencia Apache 2.0 en el ajuste, pero el modelo base no tiene licencia confirmada en esta informacion: conviene verificar los terminos del repositorio de lightonai antes de un uso comercial, ya que el ajuste hereda las obligaciones del modelo del que deriva.
- Versionado de dependencias poco habitual (Transformers 5.0.0, PyTorch 2.11.0): puede requerir entornos muy recientes y dar problemas de compatibilidad con stacks mas antiguos.
- Sin garantia de mantenimiento: no hay repositorio de codigo, paper ni canal de soporte asociado al autor del ajuste.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/xbikevn/LightOnOCR-2-1B-vi
- Modelo base: https://huggingface.co/lightonai/LightOnOCR-2-1B
- La busqueda web realizada no devolvio ninguna fuente relevante: los resultados obtenidos fueron unicamente enlaces genericos a YouTube (https://www.youtube.com/, https://www.youtube.com/feed/homepage, https://www.youtube.com/ar, https://www.youtube.com/m/home), sin relacion con el modelo. No se han localizado papers, blogs, repositorios ni demos asociados a este ajuste.
