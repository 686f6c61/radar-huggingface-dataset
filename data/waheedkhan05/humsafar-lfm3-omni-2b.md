# waheedkhan05/Humsafar-LFM3-Omni-2B

## Resumen

Humsafar (ہمسفر, "compañero" en urdu) es un ajuste fino multimodal del modelo LiquidAI/LFM3-Omni-2B, publicado por el usuario waheedkhan05 bajo el paraguas del proyecto Aabshar AI. Se trata de un modelo *any-to-any* orientado a servir como asistente de campo en urdu, combinando percepción visual, comprensión de audio hablado y razonamiento en dicho idioma en un único modelo en tiempo real. El modelo resuelve el problema de asistir a usuarios en entornos con baja alfabetización digital o conectividad limitada, donde la interacción natural es la voz y la cámara del móvil.

El modelo hereda la arquitectura y el tamaño de su base, LiquidAI/LFM3-Omni-2B, un modelo omni de aproximadamente 2.000 millones de parámetros desarrollado por Liquid AI. El ajuste se centra en tres dominios verticales: telemedicina (interpretación de prospectos y envases de medicamentos), agritech (diagnóstico de plagas y enfermedades de cultivos a partir de fotografías) y asesoría ciudadana (interpretación de formularios gubernamentales y disputas de servicios). La licencia es Apache 2.0.

La relevancia de este modelo radica en su enfoque de nicho: no compite en benchmarks generales, sino que apunta a un caso de uso muy específico (asistencia en urdu con entrada multimodal) que los modelos generalistas rara vez cubren con calidad. No obstante, la información publicada es muy escasa: la model card es breve y no incluye detalles sobre datos de entrenamiento, benchmarks ni procedimiento de ajuste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada de LiquidAI/LFM3-Omni-2B; modelo omni multimodal) |
| Parametros totales | aproximadamente 2.000 millones (según el nombre del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | urdu (ur) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (no se detalla en la model card; probablemente safetensors por herencia del base) |

## Arquitectura y entrenamiento

La model card no proporciona detalles sobre la arquitectura interna del modelo. Por el nombre y la referencia al modelo base, se trata de un derivado de LiquidAI/LFM3-Omni-2B, un modelo de la familia LFM3 de Liquid AI con capacidades omni (procesamiento conjunto de texto, imagen y audio). El pipeline declarado es `any-to-any`, lo que confirma que acepta y produce múltiples modalidades, incluyendo salida de audio hablado en urdu según los ejemplos de la model card.

No se especifica el número de tokens de entrenamiento, la composición del dataset de ajuste fino ni si se emplearon técnicas de RLHF, DPO o instrucción supervisada. Tampoco se documentan innovaciones técnicas propias del ajuste. Toda la información técnica disponible se limita a los tags del repositorio: `multimodal`, `omni`, `urdu-field-assistant`, `telemedicine`, `agritech`, `aabshar-ai` y `any-to-any`.

## Capacidades

- Percepción visual: interpretación de imágenes de envases de medicamentos, prospectos, hojas de cultivo, plagas y formularios gubernamentales.
- Comprensión de audio hablado: procesamiento de consultas de voz en urdu.
- Generación de audio hablado: respuestas en urdu oral (según los ejemplos de la model card, las salidas son "spoken Urdu").
- Razonamiento multimodal combinado: integración de imagen y audio en una única consulta para producir una respuesta accionable.
- Asistencia en dominio médico: instrucciones de dosificación a partir de la imagen de un medicamento y una pregunta hablada.
- Asistencia agronómica: identificación de plagas o roya de la hoja y propuesta de remedios.
- Asesoría ciudadana: interpretación de formularios y disputas de servicios públicos.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al urdu según el campo `language`.

## Casos de uso

- Telemedicina en zonas rurales: el usuario fotografía el envase de un medicamento y pregunta por voz "Is dawai ki khurak kya hai?"; el modelo devuelve instrucciones de dosificación en urdu hablado, útil para pacientes con baja alfabetización.
- Diagnóstico agrícola asistido: un agricultor envía una foto de una hoja con roya o de una plaga y formula una pregunta por voz; el modelo responde con un remedio concreto en urdu oral, reduciendo la dependencia de un extensionista agrónomo presencial.
- Asesoría ciudadana sobre trámites: el usuario fotografía un formulario gubernamental o una factura de servicios en disputa y recibe por audio una explicación de los campos y los pasos a seguir.
- Triaje inicial en centros de salud comunitarios: el personal puede usar el modelo para interpretar prospectos de medicamentos en urdu y verificar dosis antes de administrar, con la salvedad de que no sustituye criterio clínico.
- Formación de agentes de campo: el modelo puede servir como herramienta de consulta por voz para trabajadores agrícolas o sanitarios que necesiten respuestas rápidas en urdu mientras están en terreno.
- Atención al ciudadano en ventanilla: integración en quioscos o aplicaciones móviles para que el ciudadano consulte por voz y cámara dudas sobre documentos oficiales, con respuesta hablada en su idioma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un modelo de aproximadamente 2.000 millones de parámetros, en FP16 requeriría unos 4-5 GB de VRAM solo para pesos, y en cuantización de 4 bits podría reducirse a aproximadamente 1,5-2 GB, aunque estas cifras no están confirmadas por el autor.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; por tamaño, un modelo de 2B en cuantización baja podría caber en GPUs de consumo con 6-8 GB de VRAM, pero el componente multimodal (visión y audio) añade requisitos no documentados.
- Opciones de despliegue: no disponible (no se mencionan vLLM, llama.cpp, Ollama, TGI ni similares).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| Humsafar-LFM3-Omni-2B | ~2B | no disponible | urdu | Apache 2.0 | Omni multimodal para asistencia de campo en urdu |
| LiquidAI/LFM3-Omni-2B (base) | ~2B | no disponible | no disponible | no disponible | Omni multimodal generalista |
| Modelos generalistas de ~2B (p. ej. Gemma, Qwen) | ~2B | variable | multilingüe | variable | Texto y, en algunos casos, visión; sin enfoque omni en urdu |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparativa se limita a características estructurales.

## Limitaciones y advertencias

- Información muy escasa: la model card no documenta datos de entrenamiento, benchmarks, contexto ni requisitos, lo que dificulta evaluar su calidad real.
- Riesgo de alucinación: especialmente crítico en los dominios médico y agronómico, donde una dosis o un remedio incorrecto puede causar daño; el modelo no debe usarse como sustituto de profesional sanitario o agrónomo.
- Sesgos: no documentados; al estar ajustado sobre un modelo base generalista, puede heredar sesgos de este, agravados por el dominio de nicho.
- Limitación de idioma: el campo `language` solo declara urdu; el rendimiento en otros idiomas no está garantizado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base LiquidAI/LFM3-Omni-2B puede tener condiciones propias que conviene verificar antes de desplegar en producción.
- Sin validación externa: cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso en producción ni evaluaciones independientes.
- Fecha de creación futura (2026-11-11) en los metadatos, lo que sugiere posibles inconsistencias en la publicación del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/waheedkhan05/Humsafar-LFM3-Omni-2B
- Modelo base: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- Organización Liquid AI en Hugging Face: https://huggingface.co/LiquidAI
