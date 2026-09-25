# WootzappLab/fara-9b-baseline-eval

## Resumen

Fara 1.5-9B es un agente de uso de ordenador (computer-use agent, CUA) multimodal desarrollado por Microsoft Research AI Frontiers. El repositorio `WootzappLab/fara-9b-baseline-eval` no es un modelo nuevo ni un ajuste fino: es un espejo exacto de un checkpoint concreto de `microsoft/Fara1.5-9B` (revision `1a93677cd89d5601bc2ed759791e981f3a520032`), preservado junto a los metadatos de procedencia de la tarea y del entorno de evaluacion del baseline W8 de automatizacion de navegador basado en DOM. Su interes es de reproducibilidad, no de capacidad de modelo.

El modelo subyacente es un LM decoder-only multimodal (imagen + texto → texto) construido sobre Qwen3.5 y entrenado con ajuste supervisado sobre datos generados por FaraGen1.5, el pipeline de entornos, solvers y verificadores de Microsoft. Recibe un objetivo de usuario junto a capturas de pantalla del navegador y emite un bloque de razonamiento seguido de una llamada a herramienta estructurada (click, type, scroll, web_search, visit_url, etc.) para completar tareas web multi-paso de extremo a extremo.

La relevancia de este repositorio concreto radica en que publica un resultado de baseline medido de forma verificable: sobre 90 tareas seleccionadas, el modelo paso 6 y produjo 24 errores de ejecucion sin auditar, con un Pass@1 bruto del 6,67 % que el propio autor advierte que no debe interpretarse como una estimacion limpia de capacidad hasta que se clasifiquen esos errores. Cuenta con 9.409.813.744 parametros y licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LM decoder-only multimodal (imagen + texto → texto), construido sobre Qwen3.5 |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens segun la documentacion de la familia Fara1.5-9B; el despliegue del baseline W8 se configuro con un maximo de 32.768 tokens |
| Tipos de cuantizacion | No disponible en el repositorio (pesos en BF16); no se publican variantes GGUF, AWQ ni FP8 |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | Safetensors (cuatro shards) + configuracion, tokenizer, processor y chat template en la raiz del repositorio |

## Arquitectura y entrenamiento

Se trata de un transformer decoder-only multimodal que acepta dos modalidades de entrada (capturas de pantalla e instrucciones en lenguaje natural) y produce texto estructurado. El linaje es Qwen3.5, tal como refleja la etiqueta `qwen3_5` y el propio repositorio. La familia Fara1.5 se publica en tres escalas (4B, 9B y 27B); el modelo evaluado aqui es la variante de 9B. El checkpoint incluye `AutoProcessor` y un chat template especificos para el formato de agente, con el que el modelo alterna bloques de razonamiento y llamadas a herramienta.

El entrenamiento de la familia se realizo con ajuste supervisado (SFT) sobre datos producidos por FaraGen1.5, un pipeline escalable de entornos, solvers y verificadores. La model card del repositorio evaluado insiste en que este checkpoint **no fue entrenado ni ajustado** para la ejecucion del baseline W8: los ficheros son un espejo exacto del checkpoint fijado de Microsoft y la integracion de W8 se limita a traducir el contrato OpenAI Responses basado en DOM del grabador al endpoint de servicio del modelo, sin modificar los pesos. No se dispone de informacion detallada sobre el numero de tokens de entrenamiento ni sobre la composicion exacta del dataset.

## Capacidades

- Generacion de texto y razonamiento paso a paso en el contexto de tareas de navegacion.
- Percepcion visual: procesa capturas de pantalla del navegador como entrada (pipeline `image-text-to-text`).
- Emision de llamadas a herramienta estructuradas para acciones web: click, type, scroll, `web_search`, `visit_url`, entre otras.
- Ejecucion de tareas web multi-paso de extremo a extremo, manteniendo estado a lo largo de la interaccion.
- Comprension de estructura DOM cuando se sirve mediante la infraestructura de servicio adecuada (el baseline W8 usa un contrato basado en DOM).
- Modo conversacional (etiqueta `conversational` en el repositorio).
- Capacidades multilingues: no disponibles como dato explicito.

## Casos de uso

- Automatizacion de navegador multi-paso: el modelo observa capturas de pantalla y emite acciones encadenadas (click, type, scroll) hasta completar un objetivo declarado por el usuario, lo que lo hace adecuado para flujos donde no existe API publica.
- Extraccion y consolidacion de informacion web: combinando `web_search` y `visit_url` con la lectura de la pagina renderizada, permite recopilar datos de multiples fuentes y devolverlos en un formato estructurado.
- Rellenado de formularios y back office: dados formularios web sin API, el modelo puede completar campos y enviarlos, util en portales internos de gestion.
- QA y pruebas end-to-end de aplicaciones web: uso del agente como cliente automatizado que navega, interactua y valida que los flujos funcionan, integrerandose en pipelines de CI/CD con entornos de navegador aislados.
- Reproduccion de baselines y evaluacion de agentes CUA: este repositorio esta pensado precisamente para fijar el checkpoint, el dataset de tareas y el entorno de evaluacion, de modo que terceros puedan repetir la medicion y comparar sus propios agentes contra una referencia con procedencia verificable.
- Asistentes de investigacion en linea: dado un objetivo de busqueda, el agente navega, sigue enlaces y sintetiza la informacion encontrada en un informe.
- Automatizacion de tareas repetitivas en portales de terceros: por ejemplo, consultas periodicas de estado en paneles de proveedores que no ofrecen integracion programatica.

## Benchmarks y rendimiento

La model card publica el resultado del baseline W8 sobre el dataset `WootzappLab/cua-bench`:

| Medida | Resultado |
|---|---:|
| Tareas seleccionadas | 90 |
| Superadas | 6 |
| Fallos verificados | 60 |
| Errores de ejecucion | 24 |
| Errores de infraestructura | 0 |
| Pass@1 bruto | 6,67 % |
| Tasa de exito entre tareas verificadas | 9,09 % |

El autor advierte explicitamente de que los 24 errores de ejecucion requieren una auditoria separada y de que el Pass@1 bruto no debe tratarse como una estimacion limpia de capacidad hasta que se clasifiquen esos errores y se repitan los ensayos invalidos. No se publican en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de benchmarks de navegacion comparables para este checkpoint concreto.

## Requisitos de hardware

- Pesos en BF16: aproximadamente 18,8 GB, correspondientes al tamano del repositorio y a los 9,41 mil millones de parametros.
- Configuracion de referencia del baseline: una unica NVIDIA H100 80 GB HBM3, tensor parallel size 1, dtype BF16 y KV-cache en BF16 a traves de `auto` de vLLM.
- Contexto de servicio en el baseline: 32.768 tokens. Con contextos mucho mayores (hasta los 262.144 tokens documentados para la familia) el consumo de KV-cache crece de forma significativa y exige mas memoria o paralelismo.
- GPU de consumo: los pesos en BF16 caben con poco margen en una RTX 4090 de 24 GB sin contexto largo; para contextos amplios o lotes mayores es necesario cuantizar los pesos, algo que este repositorio no ofrece de serie.
- Opciones de despliegue: el baseline uso vLLM 0.19.1 sobre PyTorch 2.10.0 y Transformers 5.6.2. Al tratarse de un checkpoint estandar de la familia Fara1.5, es desplegable con el stack de Transformers (`AutoModelForMultimodalLM` y `AutoProcessor`) y, previsiblemente, con otros servidores compatibles, aunque no se documentan en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Fara1.5-9B (este checkpoint) | 9,41 mil millones | 262.144 tokens segun la familia; 32.768 en el despliegue del baseline | MIT | Mezcla de imagen y texto, agente CUA sobre Qwen3.5 |
| Fara1.5-4B | No disponible | No disponible | MIT | Variante menor de la misma familia, orientada a menos recursos |
| Fara1.5-27B | No disponible | No disponible | MIT | Variante mayor de la misma familia; segun Microsoft supera en benchmarks de navegacion a modelos de mayor tamano |

No se dispone de valores concretos de rendimiento comparado entre las tres escalas en la informacion proporcionada, mas alla de la afirmacion de Microsoft de que cada modelo establece un nuevo estado del arte para su clase de tamano en benchmarks de uso de navegador. No se incluyen aqui alternativas de otros fabricantes por falta de datos verificables.

## Limitaciones y advertencias

- El Pass@1 bruto de 6,67 % procede de una unica ejecucion con 24 errores de ejecucion sin clasificar; el propio autor desaconseja usarlo como medida limpia de capacidad.
- La tasa de exito entre tareas verificadas (9,09 %) sigue siendo baja y esta calculada sobre un subconjunto de 66 tareas, no sobre las 90 iniciales.
- No hay informacion sobre sesgos, composicion del dataset de entrenamiento ni evaluaciones de seguridad del modelo subyacente.
- La model card original de `microsoft/Fara1.5-9B` es la referencia autorizada para uso previsto y limitaciones; este repositorio solo la enlaza.
- Riesgo de alucinacion inherente a los modelos de lenguaje en tareas de agente: el modelo puede emitir acciones plausibles pero incorrectas sobre elementos de la pagina.
- El repositorio no publica variantes cuantizadas, por lo que el uso en hardware de consumo exige conversion previa.
- La ventana de contexto efectiva depende de la configuracion de servicio; el baseline la limito a 32.768 tokens, muy por debajo del maximo documentado de la familia.
- Aunque la licencia es MIT, conviene verificar las condiciones del checkpoint original de Microsoft antes de un uso comercial en produccion.
- Los artefactos de evaluacion detallados, el informe de resultados y la PR de infraestructura estan pendientes de publicacion, lo que limita la reproducibilidad completa en el momento de redactar esta ficha.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/WootzappLab/fara-9b-baseline-eval
- Modelo base: https://huggingface.co/microsoft/Fara1.5-9B
- Codigo de referencia de Fara: https://github.com/microsoft/fara
- Dataset de tareas: https://huggingface.co/datasets/WootzappLab/cua-bench
- Entorno de evaluacion (recorder, harness, entornos y verificador): https://github.com/tokenbender/w8-cua-bench/tree/environment-work
- Artefacto de baseline: https://huggingface.co/datasets/WootzappLab/fara-baseline-artifact
- Perfil de la organizacion: https://huggingface.co/WootzappLab/datasets
- Model Passport de Fara1.5-9B en ModelTree: https://abdeslam-menacere.github.io/ModelTree/models/fara-1-5-9b/
- Catalogo de Microsoft Foundry: https://ai.azure.com/catalog/models/Fara1.5-9B
