# zenteiq-ai/Dhir-2B-Intel-OpenVINO

## Resumen

Dhir 2B Intel OpenVINO es la conversión optimizada para el stack de Intel del modelo Dhir 2B, un modelo de lenguaje compacto de 2.000 millones de parámetros desarrollado por ZenteiQ (India) dentro de la familia BrahmAI. El modelo original está diseñado para generación de texto en inglés y diez idiomas indios (hindi, bengalí, tamil, telugu, kannada, malayalam, maratí, guyaratí, panyabí y oriya), y esta variante lo empaqueta como representación intermedia (IR) de OpenVINO para su despliegue eficiente en CPUs Intel, GPU integradas Iris Xe y Arc, y NPUs de Intel Core Ultra.

El repositorio no contiene pesos en safetensors ni GGUF, sino cuatro compilaciones de precisión distinta (INT4 asimétrica, INT4 simétrica, INT8 asimétrica y FP16) cuantizadas con NNCF y Optimum Intel. Esto lo convierte en una opción orientada específicamente a inferencia en hardware Intel para PC con IA (AI PC), con un tamaño mínimo de 1,2 GB que permite ejecutar el modelo en equipos de consumo sin GPU dedicada.

Su relevancia actual radica en la combinación de licencia Apache 2.0, soporte multilingüe para lenguas indias poco cubiertas por los modelos occidentales y una ventana de contexto de 16.384 tokens, todo ello con un despliegue nativo en OpenVINO GenAI y compatibilidad con Transformers a través de Optimum Intel.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Dhir 2B; el repositorio solo documenta la conversión a OpenVINO IR) |
| Parametros totales | 2B (2.000 millones) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | 16.384 tokens |
| Tipos de cuantizacion | INT4 asimétrica (group_size 128, backup INT8_ASYM), INT4 simétrica (group_size 128, backup INT8_ASYM), INT8 asimétrica, FP16 |
| Idiomas soportados | en, hi, bn, ta, te, kn, ml, mr, gu, pa, or |
| Licencia | Apache 2.0 |
| Formato de pesos | OpenVINO IR (no safetensors ni GGUF); cuatro subcarpetas: Dhir-2B-OV-INT4-ASYM (1,2 GB), Dhir-2B-OV-INT4-SYM (1,2 GB), Dhir-2B-OV-INT8-ASYM (2,0 GB), Dhir-2B-OV-FP16 (3,9 GB) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base Dhir 2B (no se especifica si es un transformer decoder-only denso, ni el número de capas, dimensiones ocultas o cabezas de atención). El repositorio documenta únicamente el proceso de conversión y cuantización: los pesos originales se transforman a la representación intermedia de OpenVINO y se comprimen mediante NNCF y Optimum Intel con las configuraciones indicadas en la tabla anterior (INT4_ASYM e INT4_SYM con ratio 1.0 y group_size 128, INT8_ASYM con ratio 1.0, y una build FP16 sin comprimir).

Tampoco se han publicado en la información proporcionada datos sobre el corpus de entrenamiento (número de tokens, composición del dataset, proporción de cada idioma), ni sobre si se aplicaron técnicas de alineación como RLHF o DPO. El modelo se enmarca en la iniciativa Foundation Model del IndiaAI Mission (MeitY, Gobierno de India) y la model card cita un informe técnico "forthcoming" que aún no está disponible.

## Capacidades

- Generación de texto en inglés y diez idiomas indios: hindi, bengalí, tamil, telugu, kannada, malayalam, maratí, guyaratí, panyabí y oriya.
- Modelo causal de generación de texto (pipeline `text-generation`), adecuado para completado, respuesta a instrucciones y redacción.
- Soporte de prompts largos gracias a una ventana de contexto de 16.384 tokens.
- Despliegue en tres tipos de dispositivo Intel: CPU, GPU (Iris Xe / Arc) y NPU (Intel Core Ultra con AI Boost).
- Compatibilidad con el ecosistema Transformers mediante Optimum Intel (`OVModelForCausalLM`).
- No se documentan en la información disponible capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo de pensamiento explícito.

## Casos de uso

- Asistentes conversacionales multilingües en India: el modelo puede atender consultas en inglés e idiomas indios dentro de la misma aplicación, lo que resulta adecuado para servicios públicos o de atención ciudadana donde la cobertura lingüística local es un requisito.
- Despliegue en PC con IA (AI PC) sin GPU dedicada: con la build INT4 de 1,2 GB, el modelo se ejecuta en CPU Intel o en la NPU de un Core Ultra, permitiendo asistentes locales con privacidad de datos y sin coste de API.
- Procesamiento de documentos largos en local: la ventana de 16.384 tokens permite resumir informes, contratos o artículos periodísticos en una sola pasada; la build INT8-ASYM está pensada para cargas RAG con prefijos largos.
- Generación de contenido editorial en lenguas indias: redacción de borradores, paráfrasis y adaptación de textos entre inglés y los diez idiomas soportados para medios o plataformas regionales.
- Educación y tutoría automatizada: generación de explicaciones y ejercicios en la lengua materna del estudiante, con despliegue en equipos de bajo coste gracias a las builds cuantizadas.
- Prototipado e investigación en PLN para lenguas indias: el modelo sirve como base para fine-tuning o evaluación en tareas de traducción, clasificación y generación en idiomas con pocos recursos, con licencia Apache 2.0 que facilita su uso académico y comercial.
- Integración en pipelines de Transformers existentes: mediante Optimum Intel, un equipo que ya use `AutoTokenizer` y `generate()` puede sustituir el backend por OpenVINO sin reescribir su código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente menciona un dato de rendimiento operativo: la build INT8-ASYM alcanza más de 500 tokens por segundo en prefill con prompts largos (más de 500 tokens) sobre GPU Intel. No se proporcionan cifras de MMLU, HumanEval, GSM8K ni de evaluaciones multilingües.

## Requisitos de hardware

- VRAM/RAM estimada según build: INT4-ASYM e INT4-SYM, 1,2 GB; INT8-ASYM, 2,0 GB; FP16, 3,9 GB.
- Hardware objetivo: CPUs Intel, GPU integradas Intel Iris Xe y GPU Intel Arc, y NPU Intel Core Ultra (AI Boost).
- Cabe en equipos de consumo: la build INT4 de 1,2 GB se ejecuta en portátiles con CPU Intel moderna o en un AI PC con NPU; la build FP16 de 3,9 GB requiere más memoria pero sigue siendo viable en equipos con 8 GB o más de RAM.
- Restricción específica: la build INT4-SYM es la indicada para la NPU de Core Ultra, ya que exige simetría nativa (requisito Z=0); la INT4-ASYM es la más rápida en decodificación sobre GPU Iris Xe/Arc y CPU.
- Opciones de despliegue: OpenVINO GenAI (`ov_genai.LLMPipeline` con dispositivo "CPU", "GPU" o "NPU"), Optimum Intel (`OVModelForCausalLM`), y descarga selectiva de subcarpetas con `huggingface_hub.snapshot_download`.
- Throughput: más de 500 tok/s en prefill con prompts de más de 500 tokens sobre GPU Intel (build INT8-ASYM). No se publican cifras de decodificación ni de latencia por token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato/despliegue |
|---|---|---|---|---|---|
| Dhir 2B Intel OpenVINO | 2B | 16.384 | en + 10 indios | Apache 2.0 | OpenVINO IR (INT4/INT8/FP16), CPU/GPU/NPU Intel |
| Dhir 2B (original) | 2B | 16.384 | en + 10 indios | Apache 2.0 | Pesos originales (formato no detallado en la información disponible) |
| Alternativas de 2B de propósito general | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de rendimiento comparado con otros modelos de tamaño similar, por lo que no es posible establecer una comparación cuantitativa con alternativas como Gemma, Qwen o Llama en su rango de 2B.

## Limitaciones y advertencias

- Riesgo de alucinación: la propia model card advierte de que el modelo puede afirmar hechos incorrectos con fluidez; es necesario verificar salidas críticas e implementar salvaguardas a nivel de aplicación.
- Sesgos: no se documentan en la información disponible evaluaciones de sesgo, toxicidad o equidad para este modelo ni para su base.
- Cobertura lingüística limitada a once idiomas; no se garantiza un rendimiento uniforme entre ellos ni se publican métricas por idioma.
- La información sobre arquitectura, datos de entrenamiento y alineación no está disponible, lo que dificulta evaluar riesgos específicos de producción.
- Dependencia de hardware: las builds están optimizadas para OpenVINO y hardware Intel; en GPUs NVIDIA o AMD habría que recurrir al modelo original o a otras conversiones.
- La build INT4-SYM está pensada para NPU y puede no ser la más rápida en otros dispositivos; la elección de build afecta a latencia y precisión.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los ficheros LICENSE y NOTICE del modelo original incluidos en el repositorio.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que la validación comunitaria es inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zenteiq-ai/Dhir-2B-Intel-OpenVINO
- Modelo base: https://huggingface.co/zenteiq-ai/Dhir-2B
- Sitio de ZenteiQ: https://www.zenteiq.ai
- Ficha en AIKosh: https://aikosh.indiaai.gov.in/home/models/details/dhir_2b.html
- OpenVINO: https://github.com/openvinotoolkit/openvino
- OpenVINO GenAI: https://github.com/openvinotoolkit/openvino.genai
- NNCF: https://github.com/openvinotoolkit/nncf
- Optimum Intel: https://github.com/huggingface/optimum-intel
- Contacto: research@zenteiq.ai
