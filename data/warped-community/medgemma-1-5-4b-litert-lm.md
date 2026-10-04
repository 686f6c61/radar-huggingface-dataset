# warped-community/MedGemma-1.5-4B-litert-lm

## Resumen

MedGemma-1.5-4B-litert-lm es un espejo (mirror) del modelo medico MedGemma 1.5 4B en su variante instruida (IT), convertido al formato LiteRT-LM para su ejecucion en dispositivos moviles. Lo publica el usuario `warped-community`, que lo mantiene especificamente para integrarlo en la aplicacion Android "Warped". No es un modelo entrenado desde cero ni un fine-tuning propio: es una redistribucion en formato on-device del artefacto publicado previamente por `litert-community`, que a su vez deriva del modelo original `google/medgemma-1.5-4b-it`.

El modelo parte de la familia MedGemma de Google, orientada a tareas clinicas y biomedicas, con 4.000 millones de parametros segun su denominacion. El repositorio ocupa 3,0 GB y el fichero indicado en la model card (`medgemma-1.5-4b-it_q4_block32_vision_ekv2048.litertlm`) sugiere cuantizacion de 4 bits con bloques de 32, soporte de vision y una cache KV externa de 2048 entradas. La relevancia de esta ficha radica en que permite ejecutar un modelo medico multimodal en hardware de movil sin conexion, un escenario poco habitual en modelos de este dominio.

Al tratarse de un espejo de redistribucion y no de un modelo con entrenamiento propio, la model card es minima: no documenta datos de entrenamiento, idiomas, benchmarks ni terminos de licencia mas alla del campo `license: other` heredado. Esto condiciona cualquier evaluacion tecnica rigurosa, que deberia remitirse a los repositorios del modelo base y del artefacto fuente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo derivado de `google/medgemma-1.5-4b-it`) |
| Parametros totales | 4.000 millones (segun la denominacion del modelo) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible (indicio: `ekv2048` en el nombre del fichero, sugiere cache KV externa de 2048 entradas) |
| Tipos de cuantizacion | q4 con bloques de 32 (`q4_block32`, segun el nombre del fichero) |
| Idiomas soportados | no disponible |
| Licencia | other (terminos concretos no detallados en la informacion disponible) |
| Formato de pesos | LiteRT-LM (`.litertlm`) |
| Tamano del repositorio | 3,0 GB |
| Modelo base | google/medgemma-1.5-4b-it |
| Artefacto fuente | litert-community/MedGemma-1.5-4B-IT |
| Libreria / runtime | litert-lm |
| Capacidad multimodal | si (la etiqueta `vision` aparece en el nombre del fichero; no confirmado en la model card) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna, el proceso de entrenamiento ni la composicion del dataset en la documentacion proporcionada. La model card del repositorio se limita a indicar que es un "espejo listo para movil" del artefacto de `litert-community`, mantenido para la aplicacion Android Warped, y remite tanto al origen (`litert-community/MedGemma-1.5-4B-IT`) como al modelo base (`google/medgemma-1.5-4b-it`). Cualquier detalle sobre el transformer subyacente, el numero de tokens de entrenamiento, las fases de ajuste (SFT, RLHF o DPO) o el tratamiento de datos medicos debe consultarse en los repositorios del modelo base y del artefacto fuente, que no forman parte de la informacion aqui recogida.

Lo unico verificable tecnicamente en este repositorio es la transformacion de formato: se trata de una conversion a LiteRT-LM, el runtime de Google para modelos de lenguaje en dispositivo. El nombre del fichero (`medgemma-1.5-4b-it_q4_block32_vision_ekv2048.litertlm`) documenta las decisiones de empaquetado: cuantizacion de 4 bits con tamano de bloque 32, inclusion de la torre o encoders de vision, y una cache KV externa dimensionada a 2048 entradas. Estos ajustes son los tipicos para reducir la huella de memoria y permitir la inferencia en telefonos de gama alta sin acelerador dedicado.

## Capacidades

- Generacion de texto en el dominio medico y biomedico, heredada del modelo base MedGemma 1.5 4B IT.
- Procesamiento de imagenes medicas combinado con texto (indicado por la etiqueta `vision` del fichero; no confirmado en la model card).
- Respuesta a instrucciones en formato conversacional, al ser la variante IT (instruction-tuned) del modelo base.
- Ejecucion completamente local en dispositivo Android a traves de LiteRT-LM, sin necesidad de conectividad.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo "thinking" o razonamiento extendido: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible (los idiomas no se detallan).
- Capacidades de audio: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente clinico offline en Android: el modelo puede integrarse en la aplicacion Warped para responder consultas medicas sin conexion a internet, algo critico en entornos con conectividad limitada o requisitos de privacidad estrictos, ya que los datos del paciente no salen del dispositivo.
- Apoyo a la interpretacion de imagenes medicas en movil: gracias a la componente de vision indicada en el fichero, un profesional podria obtener descripciones o impresiones preliminares de imagenes (por ejemplo, dermatologia o radiologia simple) directamente desde el telefono, usando la cuantizacion q4 para mantener el consumo de memoria bajo.
- Triaje y orientacion de sintomas en aplicaciones de salud: el modelo puede mantener conversaciones multi-turno breves para clasificar la urgencia de un cuadro y recomendar el nivel de atencion adecuado, siempre como apoyo y no como sustituto del criterio clinico.
- Formacion y educacion medica: estudiantes y residentes pueden plantear casos clinicos y recibir explicaciones contextualizadas en el dispositivo, con la ventaja de funcionar en aulas o entornos sin red.
- Documentacion clinica asistida: generacion y resumen de notas clinicas o historiales a partir de texto dictado o introducido manualmente, con la ventaja de que el procesamiento es local y no requiere subir informacion sensible a un servidor.
- Traduccion y simplificacion de informacion sanitaria para pacientes: reescritura de informes tecnicos a lenguaje llano dentro de la propia aplicacion, util para mejorar la comprension del paciente sin exponer los datos a terceros.
- Investigacion en IA medica on-device: el artefacto sirve como punto de partida para experimentar con tecnicas de inferencia de bajo consumo (cuantizacion q4, cache KV reducida) aplicadas a modelos del dominio sanitario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye metricas de MMLU, MedQA, HumanEval, GSM8K ni de ninguna otra evaluacion, y al tratarse de un espejo de formato no se aportan mediciones propias de rendimiento.

## Requisitos de hardware

- VRAM / memoria estimada: con cuantizacion de 4 bits, un modelo de 4.000 millones de parametros ocupa aproximadamente entre 2,5 y 3 GB de pesos. El repositorio completo es de 3,0 GB, lo que es coherente con esa estimacion.
- Dispositivos objetivo: telefonos y tablets Android de gama alta, dado que el formato es LiteRT-LM y el proposito declarado es su uso en la aplicacion Warped.
- Cabe en GPU de consumo: si, en GPUs con 6 GB o mas de VRAM. La cuantizacion q4 permite ejecutarlo en tarjetas como RTX 3060, RTX 4060 o superiores con margen para el contexto.
- GPU recomendadas para escritorio: no especificadas en la informacion disponible. En el contexto del modelo base, GPUs de 8 GB o mas (RTX 3070/4070, A10, L4) serian suficientes para la variante de 4 bits.
- Opciones de despliegue: LiteRT-LM es el runtime indicado de forma explicita. No se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI, ya que el formato `.litertlm` es especifico del ecosistema LiteRT y no el formato GGUF o safetensors habitual en esos motores.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

Solo se dispone de datos para los artefactos directamente relacionados citados en la model card. No hay informacion suficiente para comparar con alternativas de otras familias.

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| warped-community/MedGemma-1.5-4B-litert-lm | 4B (segun denominacion) | no disponible | LiteRT-LM (`.litertlm`) | other | HuggingFace |
| litert-community/MedGemma-1.5-4B-IT (artefacto fuente) | 4B (segun denominacion) | no disponible | LiteRT-LM (`.litertlm`) | no disponible | HuggingFace |
| google/medgemma-1.5-4b-it (modelo base) | 4B (segun denominacion) | no disponible | no disponible | no disponible | HuggingFace |

No se dispone de datos de rendimiento de ninguno de los tres artefactos que permitan una comparacion cuantitativa. La diferencia observable entre ellos es de empaquetado y redistribucion, no de capacidades declaradas.

## Limitaciones y advertencias

- Modelo de uso medico: cualquier salida debe considerarse material de apoyo y nunca sustituir el juicio de un profesional sanitario. No se documentan mecanismos de validacion clinica en este repositorio.
- Riesgo de alucinacion: inherente a los modelos de lenguaje. En dominio medico, una respuesta incorrecta puede tener consecuencias graves. No hay datos sobre tasas de alucinacion en la informacion disponible.
- Sesgos conocidos: no disponibles. La model card no documenta evaluaciones de sesgo ni demograficas.
- Idiomas soportados: no disponibles. No se puede garantizar el rendimiento en castellano ni en otros idiomas sin verificacion previa.
- Limitaciones de contexto: la cache KV externa a 2048 entradas (segun el nombre del fichero) sugiere una ventana de contexto corta, lo que restringe conversaciones largas y documentos extensos. Este dato no esta confirmado por el autor.
- Licencia: el campo es `other`, sin detalle de terminos. Al derivar de MedGemma de Google, es probable que hereden las condiciones de uso del modelo base, pero esto no se confirma en la informacion proporcionada. Antes de un uso comercial es imprescindible verificar la licencia del modelo base y del artefacto fuente.
- Es un espejo de redistribucion, no el repositorio canonico: no recibe necesariamente las actualizaciones ni el soporte del publicador original.
- Cero descargas y cero "likes" en el momento de la consulta: no hay evidencia de adopcion ni de validacion por parte de la comunidad.
- Fecha de creacion registrada como 2026-10-03, posterior al momento habitual de publicacion de este tipo de artefactos, lo que sugiere un posible error en los metadatos del repositorio.
- Compatibilidad de despliegue limitada: el formato `.litertlm` no es directamente utilizable en motores como vLLM, llama.cpp u Ollama sin conversion previa, lo que reduce las opciones de servidor.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/warped-community/MedGemma-1.5-4B-litert-lm
- Artefacto fuente: https://huggingface.co/litert-community/MedGemma-1.5-4B-IT
- Modelo base: https://huggingface.co/google/medgemma-1.5-4b-it
