# Thelivu/Thelivu-750M-Friendly

## Resumen

Thelivu-750M-Friendly es un adaptador LoRA de rango 16 desarrollado por Thelivu (Saravanan A R) sobre el modelo base Thelivu-750M, un encoder-decoder de 750 millones de parámetros. Su función es reescribir texto en inglés con un tono cálido, cercano e informal: sustituye fórmulas rígidas por expresiones cotidianas, introduce contracciones, convierte órdenes en peticiones y, en aproximadamente el 23% de los casos vistos en entrenamiento, añade un emoji. No es un modelo conversacional ni responde preguntas: únicamente transforma el texto que recibe.

El adaptador ocupa 73 MB y contiene 18,29 millones de parámetros entrenables, un 2,43% del modelo base, que permanece congelado durante la inferencia. Está pensado para ejecutarse en CPU o GPU con PyTorch, o directamente en el navegador mediante ONNX Runtime Web, lo que permite reescribir texto sin que este abandone la máquina del usuario. La relevancia actual del proyecto reside en su enfoque de adaptadores pequeños y desplegables en el borde para tareas de estilo muy acotadas, frente a la tendencia de usar modelos generativos grandes para reescrituras triviales.

La ficha se basa exclusivamente en la model card publicada por el autor y en los metadatos de Hugging Face; no se dispone de informe técnico detallado, resultados de benchmarks ni especificaciones completas del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rango 16) sobre un transformer encoder-decoder (Thelivu-750M) |
| Parametros totales | 18,29 M entrenables en el adaptador (2,43% del base); el base tiene 750 M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | ONNX int8 (usado en la extension de navegador); no se detallan otras |
| Idiomas soportados | Ingles unicamente |
| Licencia | Thelivu License 1.0 (licencia propia, etiquetada como "other") |
| Formato de pesos | `adapter.safetensors` + `adapter_config.json` en formato propio Thelivu (no PEFT); version ONNX para navegador |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Thelivu-750M, un transformer encoder-decoder de 750 millones de parámetros. La elección de encoder-decoder permite que el modelo lea la secuencia completa de entrada antes de generar, lo que facilita copiar literalmente nombres propios, URLs, direcciones de correo y cifras exactas en la salida. El adaptador LoRA de rango 16 enseña al modelo base congelado la tarea de reescritura de tono, sin modificar sus pesos originales.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. La model card indica que aproximadamente el 23% de las reescrituras del conjunto de entrenamiento contienen un emoji, dato que describe la distribución del corpus pero no su procedencia. El adaptador se distribuye en un formato propio (no PEFT) que verifica una huella dactilar de los pesos del modelo base y rechaza cargarse sobre cualquier otro modelo que no sea Thelivu-750M. Existe una versión ONNX int8 destinada a ejecución en navegador mediante ONNX Runtime Web.

## Capacidades

- Reescritura de texto en inglés con tono cálido, cercano e informal, preservando el significado y aproximadamente la longitud (las salidas son de media un 3% más largas que la entrada; una de cada tres es más corta).
- Sustitución de vocabulario formal por coloquial ("assistance" pasa a "help"), introducción de contracciones y conversión de órdenes en peticiones ("Please submit..." pasa a "Could you please submit...").
- Inserción ocasional de emojis: en las comprobaciones manuales del autor (260 entradas), 28 salidas (11%) contenían un emoji; en frases cortas, educadas y formales, 6 de 18.
- Copia fiel de entidades exactas (nombres, URLs, correos electrónicos, números de teléfono) gracias a la arquitectura encoder-decoder.
- Generación de hasta 384 tokens nuevos con la configuración por defecto.
- Ejecución en CPU, GPU o navegador (ONNX Runtime Web), sin conexión a servicios externos.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo de pensamiento. No es un modelo de chat ni responde preguntas.

## Casos de uso

- Atención al cliente en aplicaciones web: el adaptador puede integrarse como paso de reescritura en el navegador mediante ONNX Runtime Web para suavizar respuestas automáticas antes de mostrarlas, sin enviar el texto a un servidor y reduciendo el riesgo de fuga de datos.
- Correos electrónicos cotidianos: un complemento de cliente de correo puede reescribir mensajes rígidos en un tono más cercano; el modelo está entrenado específicamente para esta tarea y conserva nombres, direcciones y cifras.
- Mensajes de onboarding y bienvenida: equipos de producto pueden generar variantes cálidas de textos de bienvenida ("Welcome to the team" pasa a "Welcome to the team! 👋") de forma local y con latencia baja en CPU.
- Publicaciones en comunidades y foros: reescritura de anuncios y notas para que suenen más cercanas, con la opción de ejecutarse en el dispositivo del usuario y evitar depender de una API de terceros.
- Mensajes de agradecimiento y felicitación: el adaptador añade emojis contextuales en aproximadamente una de cada diez salidas, lo que resulta adecuado para comunicaciones informales donde un tono alegre es aceptable.
- Investigación sobre adaptadores pequeños: sirve como punto de partida para estudiar LoRA de bajo rango sobre un modelo base compartido, con un adaptador de 73 MB y 18,29 M de parámetros entrenables que se puede cargar y descargar con facilidad.
- Reescritura en el borde para privacidad: aplicaciones de escritorio o extensiones de navegador que necesitan transformar texto sin que este salga de la máquina del usuario, aprovechando la versión ONNX int8.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas descriptivas del comportamiento en las comprobaciones manuales del autor (260 entradas): 28 salidas con emoji (11%), 6 de 18 en frases cortas, educadas y formales, y una longitud media de salida un 3% superior a la de entrada, con una de cada tres salidas más corta.

## Requisitos de hardware

- El adaptador pesa 73 MB; el modelo base Thelivu-750M (750 M de parámetros) debe estar disponible en su totalidad para la inferencia.
- VRAM estimada para el modelo base: aproximadamente 1,5 GB en fp16 y alrededor de 0,8 GB en int8; el adaptador añade una cantidad marginal.
- Cabe en GPU de consumo: cualquier GPU con 2 GB o más de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4060) puede ejecutar el conjunto base más adaptador en fp16; en int8 basta con menos de 1 GB.
- Ejecución en CPU viable, especialmente con la versión ONNX int8, que es la empleada por la extensión de navegador del autor.
- Opciones de despliegue: PyTorch con el repositorio oficial de Thelivu (carga el formato propio, no PEFT); ONNX Runtime Web para navegador. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y el formato propio del adaptador impide usarlo directamente con PEFT.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| Thelivu-750M-Friendly | 18,29 M (adaptador) + 750 M (base) | No disponible | Reescritura de tono en ingles | Thelivu License 1.0 | Safetensors propio, ONNX |
| Thelivu-750M (base) | 750 M | No disponible | Generacion de texto encoder-decoder | No disponible en esta ficha | No disponible |
| Adaptadores LoRA genericos (p. ej., sobre T5 o BART) | Variable | Variable | Multiples tareas | Variable (Apache 2.0 en muchos casos) | PEFT, safetensors |
| Modelos generativos grandes (p. ej., familia Llama) | 7-70 B | 4k-128k | Generacion general, reescritura via prompt | Licencias comunitarias | Safetensors, GGUF |

La comparación con alternativas genéricas es limitada porque el adaptador está especializado en una única tarea de estilo y no compite en capacidades generales. Frente a adaptadores LoRA convencionales en formato PEFT, la diferencia principal es el formato propietario y la verificación de huella del modelo base, que restringe la portabilidad. No se dispone de datos de rendimiento comparativos.

## Limitaciones y advertencias

- No es un modelo conversacional: no responde preguntas ni sigue instrucciones contenidas en el texto; solo reescribe.
- Solo admite inglés; no se ha entrenado ni evaluado en otros idiomas.
- Riesgo de alterar texto donde cada carácter debe preservarse (cláusulas legales, código, configuración, cifras financieras); el autor recomienda revisión humana en esos casos.
- Inadecuado para mensajes serios o sensibles (malas noticias, reclamaciones, seguridad, salud), donde un tono alegre o un emoji puede resultar inapropiado.
- El uso de emojis es inconsistente: aparece en aproximadamente el 11% de las salidas en las comprobaciones manuales, con mayor frecuencia en frases cortas y formales, lo que puede sorprender en contextos donde no se espera.
- Licencia Thelivu License 1.0 (etiquetada como "other"): es una licencia propia y no estándar; deben revisarse sus términos antes de cualquier uso comercial, ya que no se detallan en la información disponible.
- El adaptador usa un formato propio no compatible con PEFT y verifica la huella del modelo base, por lo que no puede cargarse sobre otros modelos ni con herramientas estándar de adaptadores.
- No se dispone de información sobre sesgos, datos de entrenamiento ni evaluaciones de robustez o alucinación; la naturaleza de la tarea (reescritura con conservación de contenido) reduce el riesgo de invención, pero no lo elimina.
- El modelo base tiene 750 M de parámetros, por lo que la calidad de la reescritura está acotada por la capacidad de dicho base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Thelivu/Thelivu-750M-Friendly
- Modelo base: https://huggingface.co/Thelivu/Thelivu-750M
- Informe técnico: https://saravanan-a-r.github.io/Thelivu/
- Repositorio GitHub: https://github.com/saravanan-a-r/Thelivu
- Licencia: https://huggingface.co/Thelivu/Thelivu-750M-Friendly/blob/main/LICENSE
- Perfil del autor: https://www.linkedin.com/in/saravanan-a-r/
