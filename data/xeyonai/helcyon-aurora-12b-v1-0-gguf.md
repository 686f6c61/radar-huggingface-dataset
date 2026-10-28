# XeyonAI/Helcyon-Aurora-12b-v1.0-GGUF

## Resumen

Helcyon Aurora 12B v1.0 es un modelo conversacional afinado por XeyonAI (también conocido como HardWire) y distribuido en formato GGUF a través de HuggingFace. Está construido sobre Gemma 4 12B, el checkpoint base de Google que el autor describe como su primera opción para el proyecto Helcyon, y se presenta como el primer modelo de la familia Aurora orientado a conversación natural, compañía, roleplay e instrucciones, con soporte multimodal de visión mediante un fichero `mmproj` separado. Cuenta con 11.907.350.576 parámetros totales según los datos de safetensors del repositorio.

El modelo forma parte de un ecosistema más amplio del mismo autor (Helcyon-WebUI) y se distribuye con una identidad de personaje propia, una character card de referencia y una configuración de muestreo recomendada. Según la model card, el entrenamiento combina el modelo base Gemma 4 con datasets generados por "GPT-6 Astra" —orientados a calidez, personalidad y estilo conversacional— junto con datasets propios de Helcyon definidos como "anti-corporate, anti-ideology y pro-free expression", además de datos específicos de roleplay, escritura creativa y comportamiento.

Es relevante ahora por dos motivos: por un lado, es un ejemplo de fine-tuning de Gemma 4 12B para uso local con cuantización GGUF y capacidades multimodales; por otro, la propia model card reconoce limitaciones explícitas (la escritura creativa de formato largo es un punto débil conocido) y deja la licencia sin resolver, lo que conviene tener en cuenta antes de cualquier uso en producción. El repositorio, de 68,9 GB, tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder basado en Gemma 4 12B, multimodal (vision via `mmproj`) |
| Parametros totales | 11.907.350.576 (~11,9 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (varias cuantizaciones; el repositorio ocupa 68,9 GB en total) |
| Idiomas soportados | en (ingles) segun metadata;no disponible lista completa |
| Licencia | no disponible (la model card incluye una checklist interna que advierte de que los terminos del modelo base Gemma 4 y del derivado no han sido verificados) |
| Formato de pesos | GGUF, con fichero `mmproj` separado para vision |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder derivado de Gemma 4 12B, con capacidad multimodal de vision implementada mediante un proyector `mmproj` independiente que se carga junto al modelo principal en runtimes GGUF compatibles. No se detalla en la informacion disponible la composicion exacta de capas, atencion (global/local, ventana deslizante), ni la longitud de contexto nativa del checkpoint base. El modelo no es Mixture-of-Experts: los 11,9 B de parametros son densos.

En cuanto al entrenamiento, la model card indica que Aurora parte de un Gemma 4 afinado y le superpone capas de entrenamiento conductual, de personalidad, roleplay y escritura creativa propias de Helcyon. Los datasets principales se describen como generados por "GPT-6 Astra", buscando trasladar calidez y estilo conversacional, y se complementan con datasets propios etiquetados como "anti-corporate, anti-ideology y pro-free expression". No se especifica el numero de tokens de entrenamiento, la mezcla exacta de datasets, ni si se aplicaron tecnicas de RLHF, DPO o similares. La model card menciona que los primeros intentos con Gemma 4 toparon con dificultades en su entrenamiento de alineacion, que el autor afirma haber resuelto tras experimentacion, sin dar detalles tecnicos del proceso.

## Capacidades

- Generacion de texto conversacional multi-turno con enfasis en naturalidad, tono calido y consistencia de personaje.
- Roleplay e interaccion de personaje inmersiva, con character card suministrada y posibilidad de personalizacion.
- Instrucciones y asistencia practica: brainstorming, escritura funcional, organizacion y resolucion de problemas cotidianos.
- Vision: el modelo es multimodal y el `mmproj` para vision se distribuye junto al modelo.
- Escritura creativa de formato corto y medio (la de formato largo se declara como debilidad conocida).
- No se documenta soporte explicito de tool calling ni function calling en la informacion disponible.
- No se documenta soporte de agentes ni razonamiento multi-paso explicito.
- Capacidades multilingues: metadata declara solo `en`; no hay evidencia de soporte solido de otros idiomas.
- Modo "thinking" explicito: no documentado.

## Casos de uso

- Companero conversacional local: el modelo esta disenado y entrenado especificamente para conversacion natural multi-turno con identidad de personaje estable; encaja en despliegues de escritorio con Helcyon-WebUI o LM Studio para uso personal.
- Roleplay y narrativa interactiva: la character card suministrada y los datasets de roleplay permiten montar sesiones de personaje con memoria de conversacion, siempre que se gestionen desde la capa de aplicacion (por ejemplo, Helcyon-WebUI con memoria a largo plazo).
- Asistente personal de organizacion y escritura funcional: correos, resumentes, listas, planes y borradores, aprovechando la faceta de "practical assistance" descrita por el autor.
- Prototipado de interfaces conversacionales: util para validar diseno de dialogos y tono antes de invertir en un modelo mayor, dado que corre en hardware de consumo en cuantizaciones Q4/Q5.
- Experimentacion con vision local: el `mmproj` permite probar tareas de descripcion de imagenes o preguntas sobre capturas en un runtime GGUF, sin depender de APIs.
- Fine-tuning posterior y research de alineacion: como checkpoint ya afinado sobre Gemma 4 12B, sirve de base para estudiar como se comporta un modelo con datasets de personalidad agresivos frente a un Gemma 4 alineado de forma mas convencional.
- Educacion y divulgacion sobre modelos locales: su publicacion en GGUF con repositorio de 68,9 GB y varias cuantizaciones lo hace util como ejemplo practico de despliegue local, siempre que se aclare la licencia antes de reutilizarlo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (calculo a partir de 11,9 B de parametros, no dato del autor): Q4 en torno a 7-8 GB, Q5 en torno a 8-9 GB, Q6 en torno a 10 GB, Q8 en torno a 13 GB, F16 en torno a 24 GB. Hay que sumar KV cache y el `mmproj` en caso de usar vision.
- GPU recomendadas: RTX 4090 (24 GB) para Q8/F16 con contexto amplio; RTX 4080/4070 Ti Super (16 GB) para Q8; RTX 4070/4060 Ti 16 GB y RTX 3060 12 GB para Q5/Q6.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas con 8 GB o mas usando Q4, y en 12-16 GB con cuantizaciones medias.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y Helcyon-WebUI (el propio autor recomienda un runtime Gemma 4/GGUF actualizado). vLLM y TGI no estan confirmados para este modelo en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Helcyon Aurora 12B v1.0 | ~11,9 B | no disponible | no disponible | GGUF en HF | Base Gemma 4 12B, multimodal, foco en companero y roleplay |
| Mistral-Helcyon-4o-12b-v1.0 | ~12 B (por nombre) | no disponible | no disponible | GGUF en HF | Mismo autor, base Mistral, enfocado a conversacion y roleplay |
| Gemma 4 12B (base) | ~12 B | no disponible | licencia Gemma de Google | Pesos en HF | Punto de partida del fine-tuning; alineacion mas conservadora |

No se dispone de datos de benchmarks para establecer una comparacion cuantitativa de rendimiento entre estos modelos.

## Limitaciones y advertencias

- La escritura creativa de formato largo es una debilidad reconocida por el autor: perdida de coherencia narrativa, dialogo repetitivo o fragmentado y deriva respecto a la trama original.
- Riesgo de alucinacion: la propia model card advierte de que puede cometer errores y recomienda verificar informacion en decisiones de alto impacto.
- Idioma: la metadata declara unicamente `en`; no hay garantia de calidad en castellano ni en otros idiomas.
- Licencia no disponible: la model card contiene una checklist interna que avisa expresamente de que los terminos del modelo base Gemma 4 y del derivado no se han verificado, y pide no asumir la licencia Apache-2.0 de otro modelo de la familia. Cualquier uso comercial debe aclararse con el autor y con los terminos del checkpoint Gemma 4 subyacente.
- El entrenamiento con datasets "anti-corporate, anti-ideology y pro-free expression" puede producir respuestas con sesgos ideologicos o una menor adherencia a filtros de seguridad convencionales; conviene auditar el comportamiento antes de exponerlo a usuarios finales.
- Longitud de contexto no documentada: no se puede planificar un caso de uso con contexto largo sin verificarla en los ficheros del repositorio.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validacion muy limitado.
- No se documenta soporte de tool calling ni de agentes; no asumir su disponibilidad.
- La fecha de creacion del repositorio (2026-10-26) y la referencia a "Gemma 4" y "GPT-6 Astra" deben tratarse como datos del autor tal cual, sin verificacion independiente en la informacion disponible.

## Enlaces

- HuggingFace: https://huggingface.co/XeyonAI/Helcyon-Aurora-12b-v1.0-GGUF
- Modelo hermano (Mistral-Helcyon-4o-12b-v1.0-GGUF): https://huggingface.co/XeyonAI/Mistral-Helcyon-4o-12b-v1.0-GGUF
- GitHub de XeyonAI / HardWire: https://github.com/XeyonAI
- Helcyon-WebUI Free (GitHub): https://github.com/XeyonAI/Helcyon-WebUI
- Helcyon-WebUI Pro (Gumroad): https://xeyonai.gumroad.com/l/bsmupk
- Ficha de editor en Hugging Bay: https://huggingbay.xyz/publishers/xeyonai
