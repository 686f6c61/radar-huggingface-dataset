# tarirozw/medgemma-maternal-lora

## Resumen

medgemma-maternal-lora es un adaptador LoRA (entrenado con QLoRA) sobre el modelo base google/medgemma-4b-it, un modelo multimodal decoder-only de 4.000 millones de parametros desarrollado por Google. El adaptador ha sido creado por Dawa Health para especializar el modelo en informacion sobre salud materna: guias semanales de embarazo y preguntas frecuentes sobre cancer de cuello uterino, en siete idiomas hablados en Zimbabue y Zambia (ingles, shona, ndebele, tonga, chinyanja, bemba y lozi).

El problema que aborda es la falta de asistentes conversacionales sanitarios que funcionen correctamente en lenguas africanas de bajos recursos y en contextos de cambio de codigo (code-switching), donde los hablantes mezclan terminos en ingles dentro de las lenguas locales. El adaptador busca cubrir ese hueco para el desarrollo de asistentes tipo chat (por ejemplo, el asistente de WhatsApp de Dawa Health, Rudo) que respondan dudas sobre el embarazo o el cancer cervical.

Es relevante ahora porque demuestra un patron de bajo coste (menos de 2.000 ejemplos de entrenamiento, adaptador de 0,2 GB) para adaptar un modelo medico abierto a dominios e idiomas muy especificos. No obstante, sus propios autores advierten de que se trata de una herramienta de investigacion, no de un producto clinico: no es un dispositivo medico y no sustituye a un profesional sanitario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (QLoRA) sobre transformer decoder-only multimodal (MedGemma 4B IT) |
| Parametros totales | Adaptador LoRA sobre modelo base de 4.000 millones de parametros (tamano del adaptador no disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base; no especificada en la informacion) |
| Tipos de cuantizacion | QLoRA en entrenamiento; cuantizaciones de inferencia del modelo base no especificadas |
| Idiomas soportados | Ingles, shona (sn), ndebele (nd), tonga (toi), chinyanja/nyanja (ny), bemba (bem), lozi (loz) |
| Licencia | health-ai-developer-foundations (terminos de Health AI Developer Foundations de Google) |
| Formato de pesos | safetensors (adaptador PEFT), libreria peft |

## Arquitectura y entrenamiento

El adaptador se aplica sobre MedGemma 4B en su variante instruction-tuned, un modelo multimodal decoder-only que procesa texto e imagenes. El adaptador en si se entreno unicamente con texto: las capacidades de vision del modelo base no se entrenaron ni se evaluaron en este trabajo. El entrenamiento empleo QLoRA, una tecnica de ajuste con cuantizacion de bajo rango que reduce los requisitos de memoria, y se realizo con la libreria Unsloth segun las etiquetas del repositorio.

Los datos de entrenamiento proceden de los materiales de salud materna de Dawa Health, convertidos a formato de chat: guias de las 40 semanas de embarazo en los siete idiomas (divididas en secciones de vision general, cambios corporales, desarrollo del bebe, consejos, planificacion y cosas a evitar) y preguntas frecuentes sobre cancer cervical en ingles (91 pares), bemba (99), chinyanja (100) y lozi (100). En total, 1.893 ejemplos. Los terminos en ingles dentro del texto en lenguas locales se mantuvieron de forma intencionada porque los hablantes cambian de codigo. No se detalla en la informacion disponible si hubo RLHF, DPO ni otras fases de alineacion adicionales.

## Capacidades

- Generacion de texto conversacional sobre salud materna: responde preguntas sobre que esperar en cada semana de embarazo y preguntas frecuentes sobre cancer cervical.
- Soporte multilingue en siete idiomas, con capacidad de mezclar lenguas (code-switching) tal como lo hace el usuario.
- Instrucciones de sistema para adoptar el rol de asistente de salud materna y derivar a un centro sanitario ante signos de peligro.
- Capacidad multimodal heredada del modelo base (vision), aunque no fue entrenada ni evaluada en este adaptador.
- No se documenta soporte especifico de tool calling, function calling ni razonamiento multi-paso en la informacion disponible.

## Casos de uso

- Asistente de salud materna por WhatsApp: integrado en el asistente Rudo de Dawa Health, el modelo puede responder dudas sobre el embarazo semana a semana en la lengua del usuario, con recuperacion de contenido de guias verificadas y revision humana en casos sensibles.
- Informacion sobre cancer cervical: responde preguntas frecuentes en ingles, bemba, chinyanja y lozi, adecuado para campanas de concienciacion en comunidades de Zimbabue y Zambia.
- Atencion en lengua local con cambio de codigo: al conservar terminos en ingles dentro de las lenguas locales, encaja en conversaciones reales donde el usuario mezcla idiomas.
- Formacion de agentes comunitarios de salud: sirve como borrador de respuestas que un trabajador sanitario revisa antes de trasladarlas a la paciente.
- Investigacion en NLP sanitario multilingue: base para experimentos de adaptacion de bajo coste de modelos medicos a lenguas de bajos recursos.
- Prototipado de triaje informativo no diagnostico: puede generar mensajes educativos sobre signos de peligro, siempre con validacion clinica y sin sustituir la derivacion real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el modelo base de 4.000 millones de parametros en bfloat16 requiere aproximadamente 8-10 GB de VRAM solo para pesos, mas memoria para el contexto y las activaciones; el adaptador anade una cantidad marginal. En cuantizacion de 4 bits podria situarse en torno a 3-4 GB, aunque no se especifican cuantizaciones oficiales.
- GPU recomendadas: no disponible en la informacion. Por tamano, una GPU de 16 GB o superior (por ejemplo, RTX 4090, A100, H100) permitiria ejecutar el modelo base en precision completa; GPUs consumer de 8-12 GB podrian requerir cuantizacion.
- Cabe en GPU consumer: probablemente si, con cuantizacion, en tarjetas de 8 GB o mas, aunque no hay datos oficiales de rendimiento.
- Opciones de despliegue: la model card muestra un ejemplo con transformers y peft (AutoModelForImageTextToText + PeftModel). El uso con vLLM, llama.cpp, Ollama o TGI no se documenta en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| tarirozw/medgemma-maternal-lora | Adaptador sobre 4B | No disponible | 7 (en, sn, nd, ny, bem, loz, toi) | health-ai-developer-foundations | Especializado en salud materna, texto |
| google/medgemma-4b-it (base) | 4B | No disponible | No disponible | health-ai-developer-foundations | Modelo general multimodal medico; el adaptador lo especializa |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No se dispone de datos de otros adaptadores equivalentes en la informacion |

## Limitaciones y advertencias

- Los datos de entrenamiento son pequenos (menos de 2.000 ejemplos) y consisten en un unico conjunto de guias y FAQ por idioma; el modelo puede repetir errores del material y afirmar informacion incorrecta con seguridad.
- La calidad linguistica no se ha verificado de forma independiente en todos los idiomas. Shona, ndebele y tonga se entrenaron solo con guias de embarazo, sin ejemplos de pregunta-respuesta, por lo que su comportamiento conversacional se espera mas debil.
- El material puede no cubrir temas localmente importantes: por ejemplo, no se encontraron contenidos sobre prevencion de malaria, pruebas de VIH ni preeclampsia en la guia de bemba.
- La orientacion sobre signos de peligro no se ha validado especificamente; el modelo no debe ser la unica fuente de consejo sobre senales de alarma en el embarazo.
- Si se integra en un asistente que reacciona a palabras clave (por ejemplo, para derivar a un humano), el modelo puede emitir u omitir esas palabras de forma incorrecta; hay que probar esos flujos antes de desplegar.
- No se entreno con precios, listas de productos ni datos personales, y no debe usarse como fuente para ellos.
- Uso fuera de alcance: diagnostico, triaje de emergencias, decisiones de tratamiento, consejo de medicacion o dosis, sustitucion de clinicos, matronas o agentes comunitarios, y cualquier uso que vulnere los terminos de Health AI Developer Foundations.
- La licencia health-ai-developer-foundations impone condiciones especificas para uso comercial; es necesario revisar los terminos de Google antes de cualquier despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tarirozw/medgemma-maternal-lora
- Modelo base: https://huggingface.co/google/medgemma-4b-it
- Terminos de licencia: https://developers.google.com/health-ai-developer-foundations/terms
- Web de Dawa Health: https://dawa-health.com/
- Referencia arXiv citada en las etiquetas: https://arxiv.org/abs/1910.09700
