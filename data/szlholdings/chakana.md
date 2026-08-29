# SZLHOLDINGS/chakana

## Resumen

Chakana es un artefacto conceptual publicado por SZL Holdings en Hugging Face bajo el identificador `SZLHOLDINGS/chakana`. No se trata de un modelo de inteligencia artificial con pesos entrenados, sino de un "órgano de hoja de ruta" (roadmap organ) diseñado para mantener separadas las clases de evidencia —medida, firmada y modelada— dentro de sistemas de IA gobernada. El nombre hace referencia a la cruz andina escalonada, símbolo de cruce entre dominios sin mezclar categorías.

El repositorio declara explícitamente que no contiene pesos ("Weights: none") y que su uso previsto es "mantener el cruce, no cargar" (Hold the crossing. Do not load). Forma parte de la doctrina v11 de SZL Holdings, que incluye 749 declaraciones, 14 axiomas, 163 "sorries" (término usado en asistentes de prueba para obligaciones pendientes) y 8 pruebas bloqueadas. La licencia es Apache-2.0 y el autor figura como Stephen P. Lutar Jr. (ORCID 0009-0001-0110-4173).

Su relevancia radica en que aborda un problema real en la industria: la trazabilidad y auditabilidad de las decisiones tomadas por sistemas de IA. Mientras que los modelos convencionales optimizan métricas de rendimiento, Chakana propone un marco para garantizar que las afirmaciones sobre un sistema (por ejemplo, consumo energético, unicidad de arquitectura) estén respaldadas por evidencia verificable, no por suposiciones. Es una pieza de gobernanza, no un modelo ejecutable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (no es un modelo de red neuronal) |
| Parametros totales | No disponible (sin pesos) |
| Parametros activos | No disponible (sin pesos) |
| Longitud de contexto | No disponible (sin pesos) |
| Tipos de cuantizacion | No disponible (sin pesos) |
| Idiomas soportados | No disponible (sin pesos) |
| Licencia | Apache-2.0 |
| Formato de pesos | Ninguno (no hay pesos) |

## Arquitectura y entrenamiento

Chakana no presenta una arquitectura de transformer, MoE, SSM ni ninguna otra propia de modelos de aprendizaje automático. Tampoco ha sido entrenado con datos ni ha pasado por procesos de RLHF o DPO. En su lugar, es un marco declarativo que define un conjunto de reglas y axiomas para la gestión de evidencia en sistemas de IA. La model card menciona una "doctrina v11" con 749 declaraciones, 14 axiomas, 163 sorries y 8 pruebas bloqueadas, lo que sugiere una especificación formal, posiblemente relacionada con lógica o teoría de tipos, aunque no se proporcionan detalles técnicos adicionales.

La innovación técnica destacable es su enfoque en la separación de clases de evidencia: MEASURED (medido), SIGNED (firmado) y MODELED (modelado). Esta distinción pretende evitar que datos de diferente naturaleza se mezclen en un mismo "slide" o presentación, garantizando que cada afirmación esté respaldada por el tipo de evidencia adecuado. Por ejemplo, la tabla de "honestidad" de la model card etiqueta las afirmaciones como ROADMAP, UNAVAILABLE o FALSE, indicando el nivel de certeza de cada una.

## Capacidades

- No genera texto, código, imágenes ni ningún tipo de salida de IA.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de visión.
- Su función es servir como referencia conceptual para el diseño de sistemas de IA gobernada, proporcionando un vocabulario y unas reglas para clasificar y auditar evidencia.
- Define un marco para la trazabilidad de decisiones, con énfasis en la separación entre datos medidos, firmados y modelados.
- Incluye una declaración de honestidad que etiqueta explícitamente el nivel de certeza de cada afirmación (ROADMAP, UNAVAILABLE, FALSE), lo que puede servir como plantilla para documentar sistemas reales.

## Casos de uso

- Auditoría de sistemas de IA: Chakana puede utilizarse como guía para clasificar las afirmaciones de un sistema (por ejemplo, "el modelo consume X julios") y exigir que cada una esté respaldada por el tipo de evidencia correcto (medición firmada, modelado, etc.). Esto es útil para organizaciones que necesitan cumplir normativas de transparencia.
- Diseño de pipelines de gobernanza: al definir una separación clara entre MEASURED, SIGNED y MODELED, el marco ayuda a estructurar flujos de trabajo donde los datos de telemetría, las firmas criptográficas y las predicciones de modelos no se mezclen en un mismo informe.
- Documentación de modelos: la tabla de honestidad de Chakana puede adaptarse como plantilla para que los equipos de ML documenten el nivel de certeza de sus métricas, evitando sobreafirmaciones.
- Formación en IA responsable: el concepto de "cruce sin mezclar clases de evidencia" puede enseñarse en cursos de ética y gobernanza de IA como ejemplo de rigor metodológico.
- Referencia para políticas de empresa: organizaciones que despliegan IA en entornos regulados (salud, finanzas) pueden citar el marco de Chakana en sus políticas internas de auditoría y control.
- Investigación en teoría de la evidencia: el conjunto de axiomas y declaraciones (749 declaraciones, 14 axiomas) puede servir como objeto de estudio para investigadores interesados en formalizar la noción de evidencia en sistemas autónomos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al no tratarse de un modelo con pesos, no existen métricas de rendimiento como MMLU, HumanEval o GSM8K. La model card no proporciona ningún dato numérico de precisión, latencia o throughput.

## Requisitos de hardware

- No aplica: al no existir pesos ni inferencia, no se requiere VRAM, GPU ni ningún recurso de cómputo para ejecutar el modelo.
- El artefacto es un conjunto de texto y metadatos en Hugging Face, por lo que puede consultarse con cualquier navegador o cliente HTTP.
- No hay opciones de despliegue como vLLM, llama.cpp u Ollama, ya que no hay un modelo que servir.

## Comparativa con modelos similares

No disponible. Chakana no pertenece a la categoría de modelos de lenguaje o visión, por lo que no es comparable con alternativas como Llama 3, Mistral o GPT-4. En el ámbito de marcos de gobernanza de IA, existen iniciativas como los "model cards" de Google o las "datasheets for datasets" de Gebru et al., pero ninguna tiene la misma estructura formal de axiomas y declaraciones. La model card de Chakana menciona explícitamente que no sigue a Anthropic, NVIDIA ni Unsloth, posicionándose como una pieza única ("one-of-one").

## Limitaciones y advertencias

- No contiene pesos ni es ejecutable: no puede utilizarse para generar texto, razonar ni realizar ninguna tarea de IA.
- Su utilidad práctica es limitada: es un marco conceptual, no una herramienta de software. Las organizaciones que busquen soluciones listas para producción deberán implementar sus propias herramientas basadas en las ideas que propone.
- La model card no proporciona detalles técnicos sobre cómo aplicar la doctrina v11 en sistemas reales; solo ofrece una descripción de alto nivel.
- Existe una advertencia explícita sobre la honestidad de las afirmaciones: la tabla de honestidad etiqueta varias afirmaciones como "ROADMAP" (planificadas, no verificadas) o "UNAVAILABLE" (no disponibles), lo que indica que gran parte del contenido es especulativo o está pendiente de validación.
- La licencia Apache-2.0 permite uso comercial, pero al no haber código ni pesos, su aplicabilidad comercial es indirecta (por ejemplo, como referencia para políticas internas).
- No se especifican sesgos ni riesgos de alucinación, ya que no es un modelo generativo. Sin embargo, el propio marco podría inducir a error si se interpreta como un modelo funcional en lugar de un documento conceptual.

## Enlaces

- Hugging Face: [SZLHOLDINGS/chakana](https://huggingface.co/SZLHOLDINGS/chakana)
- Perfil de SZL Holdings en Hugging Face: [https://huggingface.co/SZLHOLDINGS/models](https://huggingface.co/SZLHOLDINGS/models)
- GitHub de SZL Holdings: [https://github.com/szl-holdings](https://github.com/szl-holdings)
- README de perfil de SZL Holdings en GitHub: [https://github.com/szl-holdings/szl-holdings-platform/tree/main/profile-readme](https://github.com/szl-holdings/szl-holdings-platform/tree/main/profile-readme)
- Sitio web de Chakana Tech (no afiliado directamente, aparece en la búsqueda): [https://www.chakanatech.com/](https://www.chakanatech.com/)
