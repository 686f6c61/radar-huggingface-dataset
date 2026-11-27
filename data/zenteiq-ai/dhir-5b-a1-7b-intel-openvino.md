# zenteiq-ai/Dhir-5B-A1.7B-Intel-OpenVINO

## Resumen

Dhīr 5B-A1.7B es un modelo de lenguaje de tipo mezcla de expertos (MoE) desarrollado por ZenteiQ, una empresa india, dentro de la familia BrahmAI. El modelo original cuenta con 5.100 millones de parametros totales, de los cuales solo 1.700 millones se activan por token, lo que permite un rendimiento computacional propio de un modelo mucho mas pequeno. Esta ficha concreta corresponde a la conversion del modelo original a formato OpenVINO, optimizada para su ejecucion en hardware Intel (CPU, GPU Arc y NPU Core Ultra).

El modelo esta disenado para cubrir ingles y diez lenguas indias (hindi, bengali, tamil, telugu, kannada, malayo, marati, gujarati, punyabi y oriya), lo que lo convierte en una opcion relevante para aplicaciones multilingues en el contexto del subcontinente indio. Su licencia Apache 2.0 y su disponibilidad a traves de AIKosh, Hugging Face y ZenteiQ lo posicionan como una alternativa soberana y abierta frente a modelos propietarios.

La relevancia de esta version radica en su empaquetado para IA de PC (AI PC): ofrece cuatro builds de precision (INT4 simetrico, INT4 asimetrico, INT8 asimetrico y FP16) con tamanos que van desde 2,8 GB hasta 9,6 GB, lo que permite desplegar el modelo en equipos de consumo con aceleracion Intel sin necesidad de GPUs de datacenter.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) transformer, convertida a OpenVINO IR |
| Parametros totales | 5,1 mil millones (5.1B) |
| Parametros activos | 1,7 mil millones (1.7B) por token |
| Longitud de contexto | 16.384 tokens |
| Tipos de cuantizacion | INT4 simetrico, INT4 asimetrico, INT8 asimetrico, FP16 |
| Idiomas soportados | Ingles, hindi, bengali, tamil, telugu, kannada, malayo, marati, gujarati, punyabi, oriya |
| Licencia | Apache 2.0 |
| Formato de pesos | OpenVINO IR (modelos compilados para CPU, GPU y NPU) |

## Arquitectura y entrenamiento

El modelo original es un transformer con arquitectura de mezcla de expertos (MoE) en el que cada token activa 1,7B de los 5,1B parametros totales. Esta version concreta no es un modelo entrenado desde cero, sino una conversion del modelo base `zenteiq-ai/Dhir-5B-A1.7B` a representacion intermedia de OpenVINO (IR), realizada con Intel NNCF y Optimum Intel. La cuantizacion se aplico con los siguientes parametros: INT4-ASYM (`mode: INT4_ASYM`, `ratio: 1.0`, `group_size: 128`, `backup_mode: INT8_ASYM`), INT4-SYM (`mode: INT4_SYM`, `ratio: 1.0`, `group_size: 128`, `backup_mode: INT8_ASYM`), INT8-ASYM (`mode: INT8_ASYM`, `ratio: 1.0`) y FP16 sin compresion.

No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en el modelo original. La model card remite a la ficha del modelo base para evaluaciones completas de capacidades.

## Capacidades

- Generacion de texto en ingles y diez lenguas indias.
- Razonamiento y respuesta conversacional multilingue.
- Ejecucion optimizada en CPU Intel, GPU Intel Arc y NPU Intel Core Ultra (Intel AI Boost).
- Despliegue mediante OpenVINO GenAI y Optimum Intel (compatible con la API de Transformers).
- Cuatro niveles de precision que permiten ajustar el equilibrio entre calidad, latencia y huella de memoria.
- No se documentan en la informacion disponible capacidades de tool calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Asistente multilingue en dispositivo: el modelo puede gestionar conversaciones en hindi, tamil o bengali directamente en un portatil con CPU Intel o NPU Core Ultra, sin conexion a la nube, gracias al build INT4 de 2,8 GB.
- Atencion al cliente regional: con 16.384 tokens de contexto, puede mantener conversaciones multi-turno con historial extenso en lenguas indias para centros de soporte locales.
- Generacion de contenido editorial en lenguas indias: redaccion y resumen de textos en diez idiomas para medios o portales gubernamentales, aprovechando la licencia Apache 2.0.
- Traduccion y adaptacion linguistica: uso como motor de traduccion ingles-indio o entre lenguas indias en pipelines de localizacion.
- Procesamiento de documentos en AI PC: resumen y extraccion de informacion de documentos largos en equipos de escritorio con GPU Arc, usando el build INT8 o FP16 segun la precision requerida.
- Prototipado e investigacion: evaluacion de modelos MoE compactos en hardware de consumo mediante OpenVINO GenAI, con builds FP16 de referencia para comparativas de calidad frente a cuantizaciones.
- Despliegue en entornos con requisitos de soberania de datos: al ejecutarse localmente y con licencia permisiva, encaja en administraciones publicas indias que exigen procesamiento on-premise.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: 2,8 GB para INT4-SYM e INT4-ASYM; 4,8 GB para INT8-ASYM; 9,6 GB para FP16.
- Hardware objetivo declarado: CPU Intel, GPU Intel Arc y NPU Intel Core Ultra (Intel AI Boost).
- Cabe en equipos de consumo: los builds INT4 (2,8 GB) estan pensados para PC con CPU Intel y NPU; el build FP16 (9,6 GB) requiere mas memoria pero sigue siendo viable en equipos de escritorio.
- Opciones de despliegue: OpenVINO GenAI (`ov_genai.LLMPipeline` con dispositivos "CPU", "GPU" o "NPU") y Optimum Intel (`OVModelForCausalLM`).
- Latencia y throughput: no disponibles en la informacion proporcionada. La model card indica que INT4-SYM es el build mas rapido para decodificacion MoE en CPU Intel.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada para establecer una comparativa rigurosa. Como referencia estructural, el modelo se situa en la categoria de MoE compactos (5,1B totales, 1,7B activos) con contexto de 16.384 tokens y licencia Apache 2.0, pero no se aportan cifras de rendimiento frente a alternativas.

## Limitaciones y advertencias

- Riesgo de alucinacion: la model card advierte explicitamente de que el modelo puede afirmar hechos incorrectos con fluidez; es necesario verificar salidas criticas e implementar salvaguardas a nivel de aplicacion.
- Cobertura linguistica limitada a ingles y diez lenguas indias; no se documenta soporte de castellano ni de otras lenguas.
- La informacion disponible no detalla sesgos conocidos del modelo original.
- Esta version es una conversion de precision: las cuantizaciones INT4 e INT8 pueden introducir degradacion de calidad respecto al modelo FP16, que debe usarse como referencia.
- No se documentan capacidades de tool calling, agentes o vision, por lo que no debe asumirse su disponibilidad en produccion.
- Licencia Apache 2.0: permite uso comercial, pero se deben conservar los ficheros LICENSE y NOTICE del modelo base incluidos en el repositorio.
- El repositorio completo ocupa 21,2 GB; se recomienda descargar solo la carpeta de precision necesaria mediante `snapshot_download` con `allow_patterns`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zenteiq-ai/Dhir-5B-A1.7B-Intel-OpenVINO
- Modelo base: https://huggingface.co/zenteiq-ai/Dhir-5B-A1.7B
- Ficha en AIKosh: https://aikosh.indiaai.gov.in/home/models/details/dhir_5b_1.html
- Sitio de ZenteiQ: https://www.zenteiq.ai
- OpenVINO: https://github.com/openvinotoolkit/openvino
- OpenVINO GenAI: https://github.com/openvinotoolkit/openvino.genai
- Intel NNCF: https://github.com/openvinotoolkit/nncf
- Optimum Intel: https://github.com/huggingface/optimum-intel
