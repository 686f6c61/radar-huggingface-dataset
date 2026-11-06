# XeyonAI/Helcyon-GPT-4o-12b-Gemma-4-v1.0-GGUF

## Resumen

Helcyon GPT-4o 12B es un ajuste fino del modelo base Gemma 4 12B, desarrollado por XeyonAI (también conocido como HardWire), orientado a recrear el estilo conversacional, la personalidad y el tono del modelo GPT-4o de OpenAI. El modelo se distribuye exclusivamente en formato GGUF y está pensado para inferencia local en entornos de escritorio, con un enfoque declarado de "compañero conversacional" (companion AI) antes que de asistente de propósito general.

El modelo cuenta con 11.907.350.576 parámetros totales, lo que lo sitúa en la franja de los 12B, y se apoya en la arquitectura del Gemma 4 de Google, aunque la model card no detalla la arquitectura interna ni la longitud de contexto. El autor indica que el ajuste se realizó con "datasets auténticos de GPT-4o" para capturar el tono cálido, juguetón y expresivo del modelo original, y menciona que el modelo es multimodal con un archivo mmproj para visión disponible junto a los pesos.

Su relevancia actual radica en dos factores: por un lado, la retirada anunciada de GPT-4o en enero de 2027, que motiva el interés por preservar su estilo conversacional en un modelo local; por otro, la disponibilidad de un runtime Gemma 4/GGUF que permite ejecutar el modelo en hardware de consumo. El repositorio ocupa 69,1 GB y acumula 1.128 descargas en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Gemma 4; detalles no disponibles) |
| Parametros totales | 11.907.350.576 |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (multiples cuantizaciones; el autor recomienda elegir segun RAM/VRAM) |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible |
| Formato de pesos | GGUF (incluye mmproj para vision) |

## Arquitectura y entrenamiento

La informacion disponible indica que Helcyon GPT-4o 12B parte de Gemma 4 12B como modelo fundacional y se somete a un ajuste fino supervisado con datasets orientados a comportamiento conversacional, escritura creativa, roleplay y personalidad. El autor menciona que en una iteracion anterior (Helcyon-Mercury) no pudo usar Gemma 3 por lo que describe como "alineamiento RLHF ideologico", y que Gemma 4 resulto mas adecuado para sus objetivos. No se especifican el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se emplearon tecnicas de RLHF, DPO o preferencia adicional.

Tampoco se detalla la arquitectura interna mas alla de la base Gemma 4: no se confirma si emplea atencion lineal, decodificacion especulativa, atencion por ventanas deslizantes u otras innovaciones. La model card menciona que el modelo es multimodal y que el proyector de vision (mmproj) se distribuye junto a los pesos, pero no se aportan detalles sobre el encoder visual ni sobre el entrenamiento multimodal. El autor recomienda usar la plantilla de chat nativa del modelo y evitar aplicar plantillas o presets de muestreo de otros modelos.

## Capacidades

- Generacion de texto conversacional con un tono calido, expresivo y ocasionalmente irreverente, orientado a imitar el estilo de GPT-4o.
- Roleplay y escritura creativa: narracion, exploracion imaginativa y conversaciones basadas en personajes.
- Conversacion multi-turno con capacidad de mantener discusiones detalladas o respuestas breves segun el contexto.
- Asistencia practica basica: lluvia de ideas, redaccion, organizacion y resolucion de problemas cotidianos.
- Capacidades multimodales: la model card indica que el modelo es multimodal y que el proyector de vision (mmproj) esta disponible junto a los pesos.
- Soporte de plantilla de chat nativa y de un "character card" de GPT-4o suministrado con el modelo.
- Compatibilidad declarada con endpoints (tag `endpoints_compatible`).
- No se menciona soporte explicito de tool calling, function calling ni razonamiento multi-paso agentico en la informacion disponible.

## Casos de uso

- Compañero conversacional local: el modelo esta disenado para mantener conversaciones prolongadas con personalidad consistente, usando la plantilla de chat nativa y, opcionalmente, la character card de GPT-4o. Es adecuado por su ajuste especifico en tono y estilo conversacional.
- Roleplay y escritura creativa: util para narrativa interactiva, desarrollo de personajes y exploracion de tramas, gracias al entrenamiento en escritura creativa y roleplay declarado por el autor.
- Preservacion del estilo GPT-4o: dado que GPT-4o se retira en enero de 2027, el modelo permite conservar localmente su registro conversacional para proyectos que dependan de ese tono.
- Asistente personal de escritorio: integrable en entornos locales con Helcyon-WebUI, que aporta memoria a largo plazo, inyeccion de contexto de documentos, busqueda web y TTS local, lo que permite usarlo como asistente de uso diario sin conexion a la nube.
- Prototipado de interfaces conversacionales: al ser compatible con endpoints, puede desplegarse detras de una API local para probar UX de chat con personalidad antes de invertir en modelos mayores.
- Experimentacion con vision local: el mmproj permite probar tareas de descripcion de imagenes o conversacion sobre imagenes en un runtime GGUF compatible, aunque la model card no detalla el rendimiento en estas tareas.
- Educacion y entretenimiento: conversaciones guiadas, juegos de rol y exploracion creativa en entornos sin conexion, apropiado por su enfoque de "companion first".

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el repositorio completo ocupa 69,1 GB, lo que corresponde al conjunto de cuantizaciones GGUF. Para una cuantizacion Q4 de un modelo de ~12B se puede estimar un uso en torno a 7-8 GB de memoria, aunque el autor no publica cifras concretas y recomienda elegir la cuantizacion segun la RAM/VRAM disponible, el contexto y el offloading a GPU.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, una RTX 4090 (24 GB) o una A100/H100 permiten ejecutar cuantizaciones altas con contexto amplio; una GPU consumer de 8-12 GB puede ejecutar cuantizaciones bajas con offloading parcial.
- Cabe en GPU consumer: previsiblemente si, en cuantizaciones Q4 o inferiores, aunque no se confirma oficialmente.
- Opciones de despliegue: runtimes compatibles con Gemma 4 / GGUF (el autor no especifica nombres concretos); Helcyon-WebUI (HWUI) es el entorno con el que se desarrollo y probo el modelo. No se mencionan vLLM, TGI ni Ollama de forma explicita.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| Helcyon GPT-4o 12B (Gemma 4) | 11,9B | No disponible | No disponible | GGUF | Companion / roleplay |
| Gemma 4 12B (base) | ~12B | No disponible | No disponible | Safetensors, GGUF | Proposito general |
| GPT-4o (OpenAI) | No disponible | No disponible | Propietaria | API | Proposito general multimodal |

No se dispone de datos de benchmarks ni de contexto para establecer una comparacion cuantitativa con alternativas de la misma categoria. La comparativa se limita a parametros, formato y enfoque declarado.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al estar ajustado sobre datos conversacionales de GPT-4o, puede heredar sesgos de estilo y de contenido de esos datos.
- Riesgo de alucinacion: el propio autor advierte que, como cualquier modelo local, puede cometer errores y que debe verificarse la informacion en decisiones de alto impacto.
- Limitaciones de idioma: el modelo solo declara soporte de ingles (`en`); el rendimiento en castellano no esta garantizado.
- Limitaciones de contexto: la longitud de contexto no se especifica, por lo que no puede planificarse su uso en tareas de contexto largo sin verificacion previa.
- Licencia: no disponible; no puede confirmarse si el uso comercial esta permitido. Ademas, al derivar de Gemma 4, quedaria sujeto a los terminos de la licencia de Gemma, que no se detallan en la informacion.
- Caveats de produccion: el modelo esta orientado a conversacion y compania, no a tareas de alta precision; no se documenta soporte de tool calling ni de agentes, lo que limita su uso en pipelines automatizados. El autor recomienda no aplicar plantillas de chat ni presets de muestreo de otros modelos.
- El nombre "GPT-4o" puede inducir a confusion con el modelo propietario de OpenAI; se trata de un ajuste fino independiente sin relacion con OpenAI.

## Enlaces

- Hugging Face: https://huggingface.co/XeyonAI/Helcyon-GPT-4o-12b-Gemma-4-v1.0-GGUF
- Helcyon-WebUI (gratuito): https://github.com/XeyonAI/Helcyon-WebUI
- Helcyon-WebUI Pro: https://xeyonai.gumroad.com/l/bsmupk
- No se han encontrado en la informacion proporcionada papers, blogs tecnicos ni demos adicionales.
