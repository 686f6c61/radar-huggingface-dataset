# VillanovaAI/Villanova2-15B-A3B-GGUF

## Resumen

Villanova2-15B-A3B-GGUF es la distribucion en formato GGUF del modelo Villanova2-15B-A3B, un modelo de lenguaje de arquitectura MoE (mixture of experts) desarrollado por VillanovaAI. Con 15.496.409.024 parametros totales y un esquema de activacion de aproximadamente 3.000 millones de parametros por token (indicado por el sufijo A3B), esta pensado para ofrecer un equilibrio entre calidad de generacion y coste computacional en inferencia. El modelo esta orientado a conversacion, soporte de tool calling y uso multilingue en cinco idiomas europeos: ingles, italiano, aleman, espanol y frances.

La relevancia de esta publicacion radica en su formato GGUF, que permite ejecutar el modelo en llama.cpp y entornos derivados (Ollama, LM Studio, etc.) sobre hardware de consumo, algo especialmente interesante para un MoE con 15.500 millones de parametros totales pero solo una fraccion activa por token. La licencia Apache 2.0 facilita su adopcion comercial, aunque el acceso al repositorio esta restringido (gated) y requiere aceptar las condiciones en Hugging Face.

El modelo base se publico a comienzos de noviembre de 2026 y esta version cuantizada se actualizo el 15 de noviembre de 2026. El repositorio ocupa 110,6 GB, lo que refleja la presencia de multiples niveles de cuantizacion. No se dispone de informacion publica detallada sobre el dataset de entrenamiento, el proceso de alineacion ni los resultados de benchmarks en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) basada en transformer; detalles internos no disponibles |
| Parametros totales | 15.496.409.024 |
| Parametros activos | Aproximadamente 3.000 millones por token (segun el sufijo A3B; cifra exacta no disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Multiples variantes GGUF (el repositorio ocupa 110,6 GB; niveles concretos no disponibles) |
| Idiomas soportados | Ingles (en), italiano (it), aleman (de), espanol (es), frances (fr) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo base en safetensors) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de mezcla de expertos (MoE) sobre un transformer, con 15.496 millones de parametros totales y una activacion estimada de unos 3.000 millones por token. Esta configuracion permite que el coste de inferencia se acerque al de un modelo denso de 3B mientras se conserva la capacidad representacional de un modelo de 15,5B. Los detalles sobre el numero de expertos, el enrutador, la dimension oculta o el numero de capas no estan disponibles en la informacion proporcionada.

No se han publicado en la informacion disponible datos sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni innovaciones tecnicas especificas como decodificacion especulativa o atencion lineal. La model card solo confirma el enfoque conversacional, el soporte de tool calling y la cobertura de cinco idiomas europeos.

## Capacidades

- Generacion de texto conversacional multi-turno, orientada a dialogos de asistente.
- Soporte de tool calling / function calling, segun los tags del repositorio.
- Capacidad de razonamiento multi-paso y uso en flujos de agentes (implicito en el soporte de tool calling; no confirmado con benchmarks).
- Multilingue en ingles, italiano, aleman, espanol y frances.
- Compatible con endpoints (tag `endpoints_compatible`), lo que facilita su despliegue en infraestructuras de inferencia gestionadas.
- No se ha confirmado soporte de vision, audio ni modo de razonamiento explicito (thinking mode) en la informacion disponible.

## Casos de uso

- Atencion al cliente automatizada en Europa: el modelo cubre espanol, frances, aleman, italiano e ingles, lo que permite desplegar un unico asistente multilingue en centros de soporte con requisitos de soberania de datos, ejecutandolo en infraestructura propia mediante GGUF.
- Asistentes conversacionales en local para desarrolladores: gracias al formato GGUF y a la activacion MoE reducida, se puede ejecutar en estaciones de trabajo con GPU de consumo para prototipar chatbots sin enviar datos a la nube.
- Integracion en pipelines de agentes con tool calling: el soporte de function calling permite conectar el modelo a APIs internas (ERP, CRM, bases de datos) en flujos de automatizacion de tareas administrativas.
- Traduccion y reescritura multilingue dentro de la UE: con cinco idiomas europeos soportados, es adecuado para tareas de localizacion de contenido y generacion de borradores en idiomas minoritarios del bloque (italiano, aleman, frances, espanol).
- Despliegue en entornos con requisitos de licencia permisiva: la licencia Apache 2.0 permite incorporar el modelo en productos comerciales sin obligaciones de copyleft, algo relevante para startups y pymes.
- Experimentacion academica en investigacion sobre MoE: al estar disponible en GGUF y con pesos abiertos, sirve para estudiar el comportamiento de enrutamiento de expertos y el equilibrio calidad/coste en hardware modesto.
- Generacion de documentacion tecnica y resumenes: su ventana conversacional y su naturaleza multilingue lo hacen util para resumir actas, correos y documentacion interna en entornos corporativos europeos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantizacion elegida; para un modelo de 15,5B en GGUF, las variantes Q4_K_M suelen requerir del orden de 9-10 GB y las Q8_0 en torno a 16-17 GB, aunque no se confirman los niveles exactos publicados en este repositorio.
- GPU recomendadas: para cuantizaciones bajas, RTX 4060 Ti de 16 GB, RTX 4070 Ti, RTX 4080 o RTX 4090; para cuantizaciones altas o contexto largo, A100 40 GB, H100 o L40S.
- Cabe en GPU de consumo: si, en cuantizaciones Q4 o Q5 sobre GPUs con 12-16 GB de VRAM, siempre que el contexto se mantenga moderado.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, y servidores compatibles con endpoints (vLLM no soporta GGUF de forma nativa en todos los casos; TGI requiere conversion a safetensors).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Villanova2-15B-A3B-GGUF | 15,5B | ~3B (MoE) | No disponible | Apache 2.0 | GGUF |
| Modelos MoE de tamano similar (p. ej. variantes tipo Qwen MoE o Mixtral de gama baja) | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos verificables de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada, por lo que la comparativa cuantitativa no puede completarse. La principal ventaja diferencial de Villanova2-15B-A3B-GGUF es su combinacion de licencia Apache 2.0, soporte de cinco idiomas europeos y disponibilidad en GGUF con activacion MoE reducida.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face antes de la descarga.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad factual ni de tasas de alucinacion.
- Sesgos: no hay informacion sobre la composicion del dataset ni sobre auditorias de sesgo; se recomienda evaluacion propia antes de uso en produccion.
- Cobertura limitada de idiomas: solo cinco idiomas europeos; el rendimiento en otros idiomas (portugues, neerlandes, polaco, etc.) no esta garantizado.
- Longitud de contexto desconocida: no se puede planificar el uso en tareas de contexto largo sin verificar el valor real en la model card del modelo base.
- Sin benchmarks publicos: la ausencia de resultados verificables dificulta comparar su calidad frente a alternativas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar los terminos del acceso gated y las condiciones de uso aceptable del autor.
- Formato GGUF: la calidad puede degradarse en cuantizaciones muy agresivas (Q2/Q3); para produccion se recomienda Q4_K_M o superior.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/VillanovaAI/Villanova2-15B-A3B-GGUF
- Modelo base: https://huggingface.co/VillanovaAI/Villanova2-15B-A3B
- Perfil del autor: https://huggingface.co/VillanovaAI
