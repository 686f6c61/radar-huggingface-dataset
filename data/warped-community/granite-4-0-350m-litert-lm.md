# warped-community/granite-4.0-350m-litert-lm

## Resumen

granite-4.0-350m-litert-lm es un espejo (mirror) del modelo IBM Granite 4.0 de 350 millones de parametros, empaquetado en formato LiteRT-LM para su ejecucion en dispositivos moviles. Lo publica el usuario warped-community como artefacto auxiliar de la aplicacion Android "Warped", y deriva del repositorio original litert-community/granite-4.0-350m-litert-lm. No se trata, por tanto, de un entrenamiento nuevo, sino de una redistribucion del fichero `granite-4.0-350m_q8_ekv1280.litertlm` bajo la misma licencia Apache 2.0 que el modelo base.

El modelo subyacente pertenece a la familia Granite 4 de IBM, descrita publicamente como de arquitectura hibrida Mamba/transformer y orientada a reducir el consumo de memoria en inferencia. Con 350 millones de parametros y cuantizacion de 8 bits, su interes practico esta en el despliegue on-device: asistentes locales, clasificacion de texto, resumenes cortos o funciones auxiliares dentro de una app sin depender de la nube.

La relevancia de esta ficha concreta es acotada: el repositorio no anade documentacion tecnica propia, no publica benchmarks y no tiene descargas ni interacciones registradas. Debe entenderse como un contenedor listo para el runtime LiteRT-LM, util unicamente si el flujo de trabajo ya esta atado a ese ecosistema.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida Mamba/transformer (familia Granite 4, segun fuentes de busqueda); no detallada en la model card del repositorio |
| Parametros totales | 350 millones (segun nombre del modelo y modelo base) |
| Parametros activos | No aplica; no se describe como MoE en la informacion disponible |
| Longitud de contexto | No disponible. El nombre del fichero incluye "ekv1280", que sugiere una cache KV de 1280 tokens, pero no esta confirmado por documentacion |
| Tipos de cuantizacion | q8 (int8) segun el nombre del fichero; no se documentan otras variantes en este repositorio |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | LiteRT-LM (`.litertlm`) |
| Modelo base | ibm-granite/granite-4.0-350m |
| Repositorio de origen | litert-community/granite-4.0-350m-litert-lm |

## Arquitectura y entrenamiento

El repositorio no documenta el proceso de entrenamiento, ya que se limita a redistribuir un artefacto previamente convertido. La unica informacion estructural disponible proviene de fuentes secundarias recogidas en la busqueda web, que describen la familia Granite 4 de IBM como una arquitectura hibrida Mamba/transformer con licencia Apache 2.0, disenada para reducir la huella de memoria respecto a transformers densos equivalentes. No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

La innovacion relevante en este paquete no es arquitectonica, sino de formato: la conversion a LiteRT-LM permite ejecutar el modelo con el runtime de Google AI Edge sobre Android y otros dispositivos ligeros. La cuantizacion int8 y la cache KV acotada que sugiere el sufijo `ekv1280` apuntan a un objetivo claro de consumo minimo de RAM y almacenamiento. Cualquier detalle adicional sobre atencion, tokenizador o pipeline de conversion debe consultarse en el repositorio de origen de litert-community, no en este mirror.

## Capacidades

- Generacion de texto en modelos de 350 millones de parametros: respuestas cortas, autocompletado y transformaciones simples.
- Razonamiento limitado: adecuado para tareas de un solo paso, poco fiable en cadenas de razonamiento largas.
- Generacion de codigo: no confirmada para este tamano y formato; no disponible en la documentacion.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el tamano del modelo lo hace poco adecuado para ello.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Ejecucion on-device mediante LiteRT-LM, que es la unica capacidad claramente documentada del paquete.

## Casos de uso

- Asistentes de texto embebidos en aplicaciones Android: el formato LiteRT-LM y el tamano del fichero (0.5 GB de repositorio) permiten integrar generacion de texto local en una app sin conexion a red.
- Clasificacion y etiquetado de texto corto: resumenes de una linea, deteccion de intencion o categorizacion de mensajes donde el coste de invocar un modelo grande no se justifica.
- Autocompletado en campos de formulario: sugerencias de redaccion en tiempo real dentro de interfaces moviles, con latencia baja al ejecutarse en el propio dispositivo.
- Filtrado previo (pre-procesado) en pipelines mayores: usar el modelo como primera etapa barata para descartar entradas obvias antes de llamar a un modelo mayor en servidor.
- Prototipado de aplicaciones con IA local: validar arquitectura de producto y flujos de interaccion sin asumir costes de API.
- Sistemas con requisitos estrictos de privacidad: al ejecutarse en el dispositivo, los datos de usuario no salen del terminal, lo que encaja en entornos con restricciones de tratamiento de datos.
- Investigacion sobre cuantizacion y despliegue en edge: analizar el rendimiento real de un modelo hibrido Mamba/transformer de 350M en int8 sobre hardware movil.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tabla de evaluaciones, y las paginas de busqueda recuperadas no aportan cifras concretas para este modelo. No se deben extrapolar resultados del modelo base sin una evaluacion propia, dado que la conversion de formato y la cuantizacion pueden alterar el comportamiento.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: en torno a 0.4-0.5 GB con cuantizacion int8, a partir del tamano del repositorio (0.5 GB) y de los 350M de parametros. El consumo real depende de la cache KV y del runtime.
- GPU recomendadas: no disponible; el objetivo declarado es la ejecucion en dispositivo, no en GPU de servidor.
- Compatibilidad con GPU de consumo: si, en cualquier GPU con al menos 1 GB de memoria utilizable, aunque no es el escenario previsto.
- Despliegue en movil y edge: soportado mediante LiteRT-LM sobre Android y otros dispositivos compatibles con Google AI Edge.
- Opciones de despliegue en servidor: vLLM, llama.cpp, Ollama o TGI no aplican directamente al formato `.litertlm`; requeririan convertir el modelo base o algun derivado en GGUF u otros formatos.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| warped-community/granite-4.0-350m-litert-lm | 350M | No disponible | LiteRT-LM (q8) | Apache 2.0 | Mirror comunitario, 0 descargas |
| litert-community/granite-4.0-350m-litert-lm | 350M | No disponible | LiteRT-LM | Apache 2.0 | Repositorio de origen del artefacto |
| ibm-granite/granite-4.0-350m | 350M | No disponible | safetensors (formato original) | Apache 2.0 | Modelo base oficial de IBM |
| Familia Gemma (Google) | No disponible | No disponible | No disponible | No disponible | Mencionada en fuentes de busqueda como alternativa on-device, sin datos comparativos en la informacion proporcionada |

No se dispone de datos de rendimiento que permitan una comparacion cuantitativa entre estas opciones. La diferencia practica entre las tres primeras filas es exclusivamente el formato de empaquetado y el canal de publicacion.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; un modelo de 350M sin ajuste especifico tiende a reproducir sesgos presentes en sus datos de entrenamiento.
- Riesgo de alucinacion: elevado, coherente con un modelo de este tamano; no debe usarse para tareas que requieran precision factual sin verificacion posterior.
- Limitaciones de contexto: la ventana efectiva no esta documentada. El sufijo `ekv1280` del fichero sugiere un limite de 1280 tokens en la cache, lo que restringiria seriamente conversaciones largas, pero es una inferencia no confirmada.
- Limitaciones de idioma: no se declaran idiomas soportados; el rendimiento en castellano no esta verificado.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero el usuario debe verificar que el modelo base y el artefacto de origen mantienen las mismas condiciones, asi como las obligaciones de atribucion.
- Madurez del repositorio: 0 descargas y 0 interacciones, sin documentacion tecnica propia. No hay garantia de mantenimiento ni de soporte.
- Aviso para produccion: al ser un mirror sin evaluaciones publicadas, cualquier uso en produccion exige una bateria de pruebas propia sobre el caso de uso concreto y el hardware objetivo.

## Enlaces

- HuggingFace (este repositorio): https://huggingface.co/warped-community/granite-4.0-350m-litert-lm
- Repositorio de origen del artefacto: https://huggingface.co/litert-community/granite-4.0-350m-litert-lm
- Modelo base: https://huggingface.co/ibm-granite/granite-4.0-350m
- Comparativa Gemma (Google) vs IBM Granite: https://aitools.flocci.in/compare/gemma-google-vs-ibm-granite
- Alternativas a modelos DeepSeek (menciona la arquitectura hibrida Mamba/transformer de Granite 4): https://aitools.flocci.in/alternatives/deepseek-models
