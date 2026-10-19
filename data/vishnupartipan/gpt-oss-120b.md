# vishnupartipan/gpt-oss-120b

## Resumen

`vishnupartipan/gpt-oss-120b` es un repositorio espejo (reupload) de los pesos abiertos de `openai/gpt-oss-120b`, el modelo de lenguaje de tipo Mixture-of-Experts publicado por OpenAI dentro de su familia gpt-oss. El repositorio lo mantiene el usuario vishnupartipan y reproduce la model card original de OpenAI; no aporta pesos, tokenizador ni ajustes propios distintos de los publicados por OpenAI. El modelo suma 116.829.156.672 parámetros totales (unos 117B), de los cuales 5.1B están activos por token, y está pensado para cargarse en una única GPU de 80 GB.

El modelo resuelve tareas de razonamiento, uso de herramientas y generación de texto en entornos de producción, con licencia Apache 2.0 y sin restricciones de copyleft. Su rasgo diferencial es el entrenamiento posterior con cuantización MXFP4 de los pesos de los expertos, lo que reduce el espacio en memoria lo suficiente para caber en una NVIDIA H100 o una AMD MI300X de 80 GB manteniendo, según el autor, las mismas evaluaciones que la versión sin cuantizar.

Es relevante ahora porque OpenAI lo plantea como alternativa de pesos abiertos para despliegues comerciales con razonamiento configurable (low/medium/high), cadena de pensamiento completa accesible y capacidades agénticas nativas (function calling, navegación web, ejecución de código Python y salidas estructuradas). La contrapartida de este repositorio concreto es que, en el momento de la consulta, acumula 0 descargas y 0 likes y no incluye verificación adicional por parte de OpenAI, por lo que para producción conviene referenciar el repositorio oficial `openai/gpt-oss-120b`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) con formato de respuesta harmony; tag de libreria `gpt_oss` |
| Parametros totales | 116.829.156.672 (aprox. 117B) |
| Parametros activos | 5.1B por token |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | MXFP4 en los pesos MoE (entrenamiento posterior); tag `8-bit` en el repositorio; versiones GGUF via Ollama y LM Studio |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `transformers`); tamano del repositorio 195.8 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer con capas Mixture-of-Experts: 117B parametros totales con 5.1B activos por token, lo que desacopla la capacidad del coste computacional por token. OpenAI aplico un entrenamiento posterior con cuantizacion MXFP4 sobre los pesos de los expertos, de modo que el modelo completo cabe en una GPU de 80 GB; segun la model card, todas las evaluaciones se realizaron con esa misma cuantizacion MXFP4, por lo que los numeros de referencia corresponden al modelo cuantizado y no a una version en bf16. El modelo esta entrenado sobre el formato de respuesta harmony y solo funciona correctamente si se usa dicho formato; el chat template de Transformers lo aplica de forma automatica, pero con `model.generate` directo hay que aplicarlo a mano o usar el paquete `openai-harmony`.

El entrenamiento incluye razonamiento configurable en tres niveles (low, medium, high) que ajusta el esfuerzo de razonamiento y, por tanto, la latencia, y expone la cadena de pensamiento completa para depuracion. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron etapas concretas de RLHF o DPO; la model card solo indica que el modelo es ajustable por parametros (fine-tuning completo) y que las capacidades agenticas (function calling, navegacion web, ejecucion de Python y salidas estructuradas) son nativas.

## Capacidades

- Generacion de texto conversacional y de proposito general, con modo de razonamiento explicito y esfuerzo configurable (low, medium, high).
- Razonamiento multi-paso con cadena de pensamiento completa accesible para depuracion; OpenAI advierte que no esta pensada para mostrarse al usuario final.
- Function calling / tool calling nativo, integrable en flujos de agentes.
- Capacidades agenticas: navegacion web y ejecucion de codigo Python segun la documentacion del repositorio `openai/gpt-oss`.
- Salidas estructuradas (structured outputs) para integracion con APIs y pipelines.
- Fine-tuning completo por parametros para adaptacion a dominios concretos.
- Compatibilidad con endpoints estilo OpenAI mediante vLLM y `transformers serve`.
- Capacidades multilingues: no documentadas en la informacion disponible.
- Vision y audio: no disponibles en la informacion proporcionada.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede mantener conversaciones multi-turno y decidir cuando invocar herramientas (consulta de pedidos, estado de cuenta) mediante function calling nativo, con el nivel de razonamiento ajustado a low o medium para controlar la latencia.
- Agentes de investigacion: combinando navegacion web y salidas estructuradas, se puede construir un agente que busque informacion, la sintetice y devuelva un JSON validado contra un esquema, sin necesidad de un orquestador externo complejo.
- Generacion y ejecucion de codigo: con ejecucion de Python integrada, el modelo sirve para asistentes de analisis de datos que escriben y ejecutan scripts, y para pipelines de CI/CD donde se invoca via API compatible con OpenAI en vLLM.
- Razonamiento sobre documentos largos: en tareas de extraccion, resumen y respuesta sobre documentacion tecnica o legal, siempre que la longitud de contexto se confirme contra el repositorio oficial, ya que este dato no consta en la informacion disponible.
- Automatizacion de back-office: clasificacion y enrutado de tickets, extraccion de entidades con salida estructurada y generacion de borradores de respuesta, con fine-tuning sobre el corpus interno de la empresa al ser la licencia Apache 2.0.
- Despliegue on-premise con requisitos de soberania del dato: al caber en una sola GPU de 80 GB y liberarse bajo Apache 2.0, permite ejecutar inferencia en infraestructura propia sin dependencia de APIs externas.
- Evaluacion y benchmarking interno: util como modelo de referencia de razonamiento en la banda de 100B+ para comparar con alternativas, ajustando el esfuerzo de razonamiento para equiparar presupuestos de latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica unicamente que todas las evaluaciones se realizaron con la cuantizacion MXFP4, sin incluir cifras de MMLU, HumanEval, GSM8K ni de otras suites, y la busqueda web realizada no devolvio datos tecnicos del modelo.

## Requisitos de hardware

- Inferencia en MXFP4: el modelo esta disenado para caber en una unica GPU de 80 GB; OpenAI cita explicitamente NVIDIA H100 y AMD MI300X.
- El modelo menor de la familia, `gpt-oss-20b` (21B totales, 3.6B activos), esta pensado para ejecutarse en aproximadamente 16 GB de memoria, lo que si entra en GPUs de consumo.
- Para `gpt-oss-120b` no se documenta en la informacion disponible un despliegue viable en GPU de consumo (RTX 4090, 24 GB) sin cuantizaciones adicionales a las publicadas.
- El repositorio ocupa 195.8 GB, por encima del peso teorico del modelo cuantizado en MXFP4, asi que hay que prever ese espacio en disco antes de descargar.
- Opciones de despliegue documentadas: Transformers (pipeline y `transformers serve` con API compatible con OpenAI), vLLM (build especifico `vllm==0.10.1+gptoss`), implementaciones de referencia en PyTorch/Triton del repositorio `openai/gpt-oss`, Ollama (`ollama pull gpt-oss:120b`) y LM Studio (`lms get openai/gpt-oss-120b`).
- Latencia y throughput: no disponibles en la informacion proporcionada. El nivel de esfuerzo de razonamiento (low/medium/high) es el principal mecanismo para modular latencia en produccion.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gpt-oss-120b (este repo) | 116.829.156.672 | 5.1B | no disponible | Apache 2.0 | HuggingFace, vLLM, Ollama, LM Studio |
| gpt-oss-20b | 21B | 3.6B | no disponible | Apache 2.0 | HuggingFace, Ollama, LM Studio (aprox. 16 GB de memoria) |
| Otras alternativas abiertas de ~100B | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion con datos verificables en la informacion disponible es con `gpt-oss-20b`, el otro miembro de la familia: misma licencia y mismo formato harmony, pero 21B totales y 3.6B activos frente a 117B y 5.1B, orientado a baja latencia y uso local. No se dispone de cifras de rendimiento comparadas entre ambos dentro de la informacion proporcionada.

## Limitaciones y advertencias

- Este repositorio es un espejo no oficial con 0 descargas y 0 likes; no hay garantia de integridad de los pesos ni de que se mantenga actualizado respecto a `openai/gpt-oss-120b`.
- El modelo solo funciona correctamente con el formato de respuesta harmony; usarlo con otro formato o con `model.generate` sin aplicar el template produce salidas incorrectas.
- La cadena de pensamiento completa es accesible, pero OpenAI advierte explicitamente que no debe mostrarse al usuario final.
- Riesgo de alucinacion: no se documentan en la informacion disponible tasas de alucinacion ni evaluaciones de factualidad.
- Idiomas soportados no documentados: no se puede asumir calidad homogenea fuera del ingles sin evaluacion propia.
- Longitud de contexto no disponible en la informacion proporcionada; hay que confirmarla en el repositorio oficial antes de disenar flujos de contexto largo.
- Ausencia total de benchmarks publicados en la informacion disponible, lo que impide justificar la eleccion del modelo frente a alternativas con numeros verificables.
- Licencia Apache 2.0: permisiva para uso comercial, sin copyleft ni riesgo de patentes segun la model card, pero conviene revisar las condiciones del repositorio oficial y de los terminos de uso de OpenAI aplicables.
- El coste de hardware es alto: una GPU de 80 GB dedicada, lo que descarta el despliegue en estaciones de trabajo convencionales.
- La cuantizacion MXFP4 es parte del modelo publicado; no se documentan en la informacion disponible los efectos de cuantizaciones adicionales (GGUF Q4/Q8) sobre la calidad.

## Enlaces

- Repositorio en HuggingFace (espejo): https://huggingface.co/vishnupartipan/gpt-oss-120b
- Repositorio oficial: https://huggingface.co/openai/gpt-oss-120b
- Coleccion gpt-oss en HuggingFace: https://huggingface.co/collections/openai/gpt-oss-68911959590a1634ba11c7a4
- Model card en arXiv: https://arxiv.org/abs/2508.10925
- Blog de presentacion de OpenAI: https://openai.com/index/introducing-gpt-oss/
- Pagina del proyecto: https://gpt-oss.com
- Cookbook y guias: https://cookbook.openai.com/topic/gpt-oss
- Repositorio en GitHub: https://github.com/openai/gpt-oss
- Formato harmony: https://github.com/openai/harmony
- Lista de recursos de la comunidad: https://github.com/openai/gpt-oss/blob/main/awesome-gpt-oss.md
- Guia de despliegue con Transformers: https://cookbook.openai.com/articles/gpt-oss/run-transformers
- Guia de despliegue con vLLM: https://cookbook.openai.com/articles/gpt-oss/run-vllm
- Guia de despliegue con Ollama: https://cookbook.openai.com/articles/gpt-oss/run-locally-ollama
- Descarga de Ollama: https://ollama.com/download
- LM Studio: https://lmstudio.ai/
