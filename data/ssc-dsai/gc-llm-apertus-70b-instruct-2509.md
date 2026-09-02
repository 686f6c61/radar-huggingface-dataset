# ssc-dsai/gc-llm-apertus-70b-instruct-2509

## Resumen

`gc-llm-apertus-70b-instruct-2509` es un modelo de lenguaje de 70 mil millones de parámetros, bilingüe (inglés y francés), desarrollado por Shared Services Canada — Data Science and Artificial Intelligence (SSC-DSAI), el departamento de ciencia de datos del Gobierno de Canadá. Se trata de un ajuste fino (fine-tune) mediante LoRA del modelo base `swiss-ai/Apertus-70B-Instruct-2509`, adaptado al dominio del sector público canadiense. El objetivo es proporcionar un modelo de instrucción que pueda responder preguntas, resumir y redactar textos basados en el contenido web público del Gobierno de Canadá, manteniendo las capacidades generales del modelo original.

La relevancia de este modelo radica en que es uno de los pocos ejemplos de adaptación de un modelo de peso abierto a un dominio gubernamental específico, entrenado íntegramente en infraestructura pública canadiense (clústeres A100 y H100) sin utilizar nubes comerciales. Arquitectónicamente, es un transformer decoder-only con atención GQA, activación xIELU y una ventana de contexto máxima de 65 536 posiciones, aunque el fine-tune se realizó con secuencias de 2048 tokens. El modelo se distribuye bajo licencia Apache 2.0 y está disponible en Hugging Face en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (`ApertusForCausalLM`) |
| Parametros totales | 70 599 864 480 (~70 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 65 536 posiciones (RoPE scaling factor 8.0, base 8192, `rope_theta` 12 000 000) |
| Tipos de cuantizacion | No disponible (solo se menciona bfloat16 para los pesos originales) |
| Idiomas soportados | Ingles, frances (el modelo base Apertus soporta mas de 1800 idiomas, pero este fine-tune se centra en en/fr) |
| Licencia | Apache 2.0 (con politica de uso de Apertus adjunta) |
| Formato de pesos | safetensors (bfloat16, ~140 GB) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Apertus, un transformer decoder-only con 80 capas, dimensiones ocultas de 8192 e intermedias de 43 008. La atencion emplea 64 cabezas de consulta y 8 cabezas clave-valor (GQA) con normalizacion QK-norm, y la funcion de activacion es xIELU. El vocabulario tiene 131 072 tokens. El modelo base Apertus fue preentrenado con 15 billones de tokens de mas de 1800 idiomas, con aproximadamente un 40 % de datos no ingleses, y posteriormente se le aplico un ajuste de instrucciones.

El fine-tune de SSC-DSAI se realizo mediante LoRA con rango 24, cuyos pesos se fusionaron en los pesos base. Los datos de entrenamiento consisten en una mezcla de pares de preguntas y respuestas sinteticas generadas a partir del Archivo Web del Gobierno de Canada (datasets `ssc-dsai/gc-web-en` y `ssc-dsai/gc-web-fr`), combinados con conjuntos de instrucciones abiertos como `allenai/tulu-3-sft-mixture`, `CohereForAI/aya_dataset`, `AI-MO/NuminaMath-TIR` y `theblackcat102/evol-codealpaca-v1`. El entrenamiento se llevo a cabo en nodos A100 de 40 GB del clúster cientifico de SSC en Montreal y en un nodo H100 de 80 GB en Ottawa, sin que los datos salieran del departamento. Un detalle critico es que el fine-tune se entreno con secuencias de 2048 tokens, por lo que el comportamiento en contextos largos no fue verificado en esta etapa.

## Capacidades

- Generacion de texto bilingue (ingles y frances) con estilo conversacional y de instruccion.
- Respuesta a preguntas y resumen de contenido basado en documentos del Gobierno de Canada, siempre que el pasaje relevante se proporcione en el prompt.
- Integracion como generador en sistemas de generacion aumentada por recuperacion (RAG) sobre documentos gubernamentales.
- Asistencia a la redaccion de textos del sector publico en cualquiera de las dos lenguas oficiales canadienses.
- Capacidades generales de razonamiento, matematicas y codigo heredadas del modelo base Apertus, preservadas mediante la mezcla de datos de instruccion abiertos.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles (modelo de texto unicamente).

## Casos de uso

- Atencion al ciudadano en portales gubernamentales: el modelo puede gestionar consultas frecuentes sobre programas y servicios publicos en ingles o frances, generando respuestas preliminares que un agente humano revisa antes de publicar. Su entrenamiento con datos del Archivo Web del GC le permite alinear el lenguaje con la terminologia oficial.
- Generador en un sistema RAG sobre documentacion del Gobierno de Canada: se puede integrar en un pipeline de recuperacion donde el pasaje relevante se inserta en el prompt, y el modelo produce una respuesta sintetizada y contextualizada. Es adecuado porque el fine-tune fue disenado especificamente para este escenario.
- Redaccion asistida de comunicados y avisos publicos: el modelo puede ayudar a redactar borradores de textos administrativos en ambos idiomas oficiales, manteniendo un tono formal y consistente con el estilo gubernamental.
- Resumen de documentos extensos del sector publico: dado que el contexto maximo es de 65 536 tokens, puede resumir informes o paginas web de longitud considerable, aunque se recomienda verificar el comportamiento en contextos largos por la limitacion del entrenamiento a 2048 tokens.
- Investigacion en adaptacion de dominio para el sector publico: sirve como linea base bilingue para experimentos de ajuste fino adicional, permitiendo a otros equipos gubernamentales evaluar tecnicas de adaptacion sobre un modelo de 70 B.
- Generacion de datos sinteticos de entrenamiento: el modelo puede utilizarse para crear pares de preguntas y respuestas sobre temas gubernamentales, que luego sirvan para entrenar modelos mas pequenos o para aumentar conjuntos de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para este fine-tune en la informacion disponible. El modelo base Apertus-70B-Instruct-2509 reporta resultados competitivos en benchmarks multilingues, pero no se dispone de datos desglosados para esta adaptacion concreta. Se recomienda consultar el paper tecnico de Apertus (arxiv 2509.14233) para los resultados del modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 140 GB en bfloat16, lo que requiere multiples GPUs. Con cuantizacion a 4 bits (no documentada oficialmente) podria reducirse a unos 35-40 GB, pero no hay datos confirmados.
- GPUs recomendadas: nodos con A100 de 40 GB o H100 de 80 GB. Se necesitarian al menos 2x A100-80GB o 4x A100-40GB para cargar el modelo en precision nativa.
- No cabe en una GPU de consumo (RTX 4090, 24 GB) sin cuantizacion agresiva, y no se han publicado guias de cuantizacion para este modelo.
- Opciones de despliegue: compatible con transformers y endpoints de Hugging Face. No se mencionan explicitamente vLLM, llama.cpp u Ollama, pero al ser un modelo estandar de transformers, deberia ser compatible con vLLM y TGI para inferencia optimizada.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos comparativos de rendimiento para este fine-tune frente a otras alternativas. A nivel estructural, se puede comparar con:

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| `ssc-dsai/gc-llm-apertus-70b-instruct-2509` | 70 B | 65 536 | en, fr | Apache 2.0 | Fine-tune gubernamental canadiense |
| `swiss-ai/Apertus-70B-Instruct-2509` | 70 B | 65 536 | 1800+ | Apache 2.0 | Modelo base, multilingue |
| `meta-llama/Llama-3.1-70B-Instruct` | 70 B | 131 072 | 8 idiomas | Llama 3.1 license | Alternativa generalista, no adaptada al dominio GC |

La comparacion real de rendimiento requeriria ejecutar los mismos benchmarks en ambos modelos, lo cual no esta documentado.

## Limitaciones y advertencias

- El fine-tune se entreno con secuencias de 2048 tokens; el comportamiento en contextos largos (hasta 65 536) no fue verificado y se hereda del modelo base sin validacion.
- El modelo no debe utilizarse para emitir declaraciones autoritativas sobre politicas, programas, prestaciones, plazos u obligaciones legales del Gobierno de Canada. Sus salidas no tienen estatus oficial y deben contrastarse con canada.ca.
- No esta disenado para toma de decisiones automatizada que afecte a individuos (adjudicacion de prestaciones, inmigracion, aplicacion de la ley, contratacion).
- No debe emplearse para asesoramiento legal, medico, financiero o de inmigracion.
- No tiene acreditacion para manejar informacion clasificada, protegida o personal; fue entrenado exclusivamente con datos publicos no clasificados.
- Riesgo de alucinacion inherente a los modelos de lenguaje; las respuestas sobre hechos especificos deben verificarse.
- La licencia Apache 2.0 se complementa con la politica de uso de Apertus, que fluye a este derivado y puede imponer restricciones adicionales.
- El modelo solo cubre ingles y frances en su adaptacion; otros idiomas del modelo base pueden degradarse tras el fine-tune.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ssc-dsai/gc-llm-apertus-70b-instruct-2509
- Modelo base: https://huggingface.co/swiss-ai/Apertus-70B-Instruct-2509
- Coleccion GC LLM de SSC-DSAI: https://huggingface.co/collections/ssc-dsai/gc-llm
- Paper tecnico de Apertus (arxiv 2509.14233): https://arxiv.org/pdf/2509.14233
- Informe tecnico de Apertus: https://apertus-ai.org/docs/tech/report/
- Politica de uso de Apertus: https://huggingface.co/swiss-ai/Apertus-70B-Instruct-2509/blob/main/USAGE_POLICY.md
