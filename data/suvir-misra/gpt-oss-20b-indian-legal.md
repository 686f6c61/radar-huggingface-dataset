# Suvir-Misra/gpt-oss-20b-indian-legal

## Resumen

GPT-OSS-20B Indian Legal Advisory es un adaptador LoRA de ajuste fino sobre el modelo `unsloth/gpt-oss-20b-unsloth-bnb-4bit`, desarrollado por Suvir-Misra y publicado en Hugging Face bajo licencia Apache 2.0. Su objetivo es especializar un modelo de lenguaje de propósito general en el ordenamiento jurídico indio, cubriendo fiscalidad indirecta (GST), aduanas, impuesto sobre la renta y los nuevos códigos penales y probatorios de 2023 (BNS, BNSS y BSA). El adaptador se distribuye como pesos safetensors con un tamaño de repositorio de 0,8 GB, lo que corresponde a los pesos del adaptador y no al modelo completo.

El modelo resuelve el problema de la falta de precisión normativa de los LLM generalistas en dominios legales regulados: citas erróneas de secciones, confusión entre regímenes tributarios y alucinaciones en plazos y penalizaciones. Para ello emplea una canalización de entrenamiento en varias etapas que combina SFT con LoRA (r=32, alpha=32) sobre 20.179 disposiciones y resoluciones, promediado estocástico de pesos (SWA), fusión TIES con calibración WSO, optimización de preferencias con DPO y ORPO, y mezcla en espacio de pesos WiSE-FT. La innovación principal es la alineación de cadena de pensamiento en dos canales: `<|channel|>analysis` para razonamiento jurídico IRAC y `<|channel|>final` para la conclusión estatutaria exacta.

Es relevante ahora porque los códigos penales indios fueron sustituidos en 2023 (BNS, BNSS, BSA reemplazan al IPC, CrPC y IEA), lo que genera una necesidad inmediata de herramientas que mapeen correctamente las nuevas secciones y sus equivalentes anteriores. El autor declara una puntuación compuesta de 10,0/10 con 100 % de recuerdo estatutario en su propio benchmark, si bien se trata de una evaluación interna sin validación externa publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base GPT-OSS-20B) con adaptador LoRA fusionado |
| Parametros totales | 20 000 millones (modelo base); el adaptador se distribuye en un repositorio de 0,8 GB |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de inferencia usa `max_seq_length=2048`) |
| Tipos de cuantizacion | El modelo base se distribuye en 4 bits (bnb-4bit); el adaptador se carga con `load_in_4bit=True` en el ejemplo |
| Idiomas soportados | Ingles (en) e hindi (hi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre GPT-OSS-20B, un transformer de 20 000 millones de parámetros, y se entrena mediante LoRA con rango 32 y alpha 32 sobre 20.179 provisiones estatutarias y resoluciones judiciales curadas. El pipeline de alineación consta de seis etapas: SFT especializado en dominio durante múltiples épocas; promediado estocástico de pesos (SWA) para reducir el ruido de gradiente de alta frecuencia; fusión TIES de adaptadores independientes de fiscalidad indirecta, fiscalidad directa y derecho penal, con poda de densidad de tarea de 0,3 y consenso de signos; optimización de preferencias con DPO y ORPO para penalizar alucinaciones legales y atribuciones estatutarias erróneas; mezcla en espacio de pesos WiSE-FT entre los vectores de tarea base y los vectores de razonamiento jurídico; y alineación de cadena de pensamiento en dos canales.

La innovación técnica destacable es el doble canal de razonamiento: el modelo genera primero una traza IRAC (Issue, Rule, Application, Conclusion) en el canal `analysis` y después una conclusión estatutaria exacta en el canal `final`, terminada con el token `<|return|>`. Según la model card, esta etapa eliminó los bucles de repetición de hasta 700 tokens que aparecían en las exportaciones base y mejoró la puntuación compuesta de 1,78 a 10,0 en su benchmark interno. El entrenamiento se realizó en una única GPU RTX 4060 Ti.

## Capacidades

- Generación de texto jurídico especializado en el ordenamiento indio, con citas de secciones concretas.
- Razonamiento jurídico estructurado mediante trazas IRAC en el canal `analysis`.
- Fiscalidad indirecta: CGST e IGST de 2017, crédito bloqueado de la sección 17(5), test de funcionalidad de *Safari Retreats*, plazos de notificación de requerimiento (sección 73 frente a 74) y reglas de lugar de suministro con transacciones «bill-to ship-to» (secciones 7 y 10(1)(b) de la IGST Act).
- Aduanas: valoración aduanera bajo la sección 14 de la Customs Act de 1962, transacciones entre partes vinculadas y Special Valuation Branch según la circular CBIC 5/2016, y recuperación de derechos con la limitación ampliada de cinco años de las secciones 28(1) y 28(4).
- Fiscalidad directa: procedimientos de reapertura de las secciones 148 y 148A, umbrales de tres y diez años con el criterio de activos de 50 lakh rupias de la sección 149, régimen tributario concesional por defecto de la sección 115BAC y deducciones del capítulo VI-A.
- Derecho penal y probatorio de 2023: mapeo de concordancias del BNS (homicidio en la sección 103(1), estafa en la 318(4), delitos contra la soberanía en la 152), plazos del BNSS (producción ante el magistrado en 24 horas según la sección 58, prisión policial de 15 días dentro de los primeros 40/60 días según la sección 187) y admisibilidad de registros electrónicos con el certificado obligatorio de la sección 63(4) del BSA.
- Capacidad multilingüe limitada a inglés e hindi.
- No se documenta soporte de tool calling, function calling, agentes, visión ni audio en la información disponible.

## Casos de uso

- Asesoría tributaria en GST para despachos y departamentos fiscales: el modelo responde consultas sobre crédito bloqueado, plazos de requerimiento y lugar de suministro citando la sección aplicable, lo que reduce el tiempo de búsqueda normativa del profesional que debe validar la respuesta.
- Revisión de exposiciones de motivos y notificaciones de aduanas: permite contrastar la valoración declarada con la sección 14 de la Customs Act y detectar supuestos de partes vinculadas que exigen intervención del Special Valuation Branch.
- Formación interna de equipos legales: generación de explicaciones IRAC sobre la reforma penal de 2023 y tablas de concordancia entre el IPC y el BNS, útiles para actualizar manuales internos tras la sustitución de códigos.
- Preparación de borradores de escritos y notas de reassessment: el modelo estructura el razonamiento en canal de análisis y entrega una conclusión estatutaria separada, lo que facilita la revisión por un abogado antes de su uso.
- Asistencia en cumplimiento normativo para empresas con operaciones en India: consultas sobre deducciones del capítulo VI-A y el régimen de la sección 115BAC para planificación fiscal anual.
- Soporte a la admisión de prueba electrónica: verificación de los requisitos del certificado de la sección 63(4) del BSA en procedimientos judiciales, con explicación de por qué sustituye a la sección 65B de la IEA.
- Atención al cliente en portales legales: respuestas de primer nivel en inglés o hindi sobre plazos y penalizaciones, con derivación a un profesional cuando la consulta exceda el ámbito cubierto.

## Benchmarks y rendimiento

Los únicos datos disponibles proceden del benchmark interno declarado por el autor en la model card. No se han publicado resultados en benchmarks académicos estándar (MMLU, HumanEval, GSM8K) en la información disponible.

| Hito | Puntuacion compuesta (/10) | Recuerdo estatutario | Estado |
|---|---|---|---|
| Exportacion base inicial | 1,78 / 10 | 17,8 % | Bucles de 700 tokens en listas; alucinaciones en BNS/BSA |
| Alineacion dirigida etapa 7 | 4,10 / 10 | 41,0 % | Bucles eliminados (<78 tokens con `<|return|>`); citas ancladas |
| CoT de doble canal etapa 8 | 6,97 / 10 | 69,7 % | Traza IRAC activada; perfecto en aduanas y penal |
| Enterprise Legal Advisor | 10,0 / 10 | 100,0 % | Certificado por el autor: cero alucinaciones y citas exhaustivas |

Estos resultados proceden de una evaluación propia del autor, sin conjunto de test independiente ni replicación externa documentada.

## Requisitos de hardware

- VRAM estimada: el modelo base de 20 000 millones de parámetros en 4 bits requiere aproximadamente 12-14 GB de VRAM para los pesos, más memoria para el contexto y el adaptador; en precisión completa (bf16) serían necesarios unos 40 GB.
- GPU recomendadas: el autor entrenó en una RTX 4060 Ti, por lo que la inferencia en 4 bits cabe en GPUs de consumo con 16 GB (RTX 4060 Ti 16 GB, RTX 4070 Ti Super, RTX 4080, RTX 4090). Para mayor throughput, A100 40/80 GB o H100.
- Cabe en GPU de consumo: sí, en 4 bits y con contextos moderados; el ejemplo de la model card usa `max_seq_length=2048`.
- Opciones de despliegue: el ejemplo oficial usa Unsloth con `FastLanguageModel`; al ser un adaptador LoRA sobre un modelo estándar, puede servirse con vLLM, TGI o llama.cpp tras fusionar el adaptador con el modelo base y convertir a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparables publicados para este adaptador frente a otras alternativas. La siguiente tabla compara únicamente características verificables.

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GPT-OSS-20B Indian Legal (este) | 20 000 M (base) | no disponible | Derecho indio: GST, aduanas, renta, BNS/BNSS/BSA | Apache 2.0 | Hugging Face (adaptador LoRA) |
| Modelo base GPT-OSS-20B | 20 000 M | no disponible | Proposito general | no disponible en la informacion | Hugging Face |
| Alternativas legales indias de proposito general | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El benchmark de 10,0/10 y 100 % de recuerdo estatutario es una evaluación interna del autor sin validación independiente; debe tratarse como una afirmación no verificada.
- Riesgo de alucinación jurídica: aunque el entrenamiento con DPO y ORPO penaliza atribuciones erróneas, ningún adaptador de este tamaño garantiza citas correctas en todos los supuestos; toda salida debe ser revisada por un profesional cualificado.
- Cobertura idiomática limitada a inglés e hindi; no se documenta soporte de otras lenguas oficiales de India.
- La longitud de contexto no se especifica en la información disponible; el ejemplo oficial limita a 2048 tokens, lo que puede ser insuficiente para expedientes extensos.
- El adaptador se distribuye sobre un modelo base cuantizado en 4 bits, lo que puede introducir degradación adicional respecto a una inferencia en bf16.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso en producción ni auditoría externa.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el asesoramiento jurídico generado recae en el usuario; no constituye asesoramiento legal.
- No se documentan sesgos específicos ni evaluaciones de seguridad, toxicidad o robustez frente a prompts adversarios.

## Enlaces

- Hugging Face: https://huggingface.co/Suvir-Misra/gpt-oss-20b-indian-legal
- Modelo base: https://huggingface.co/unsloth/gpt-oss-20b-unsloth-bnb-4bit
- No se han encontrado papers, blogs, repositorios de código ni demos adicionales en la información proporcionada.
