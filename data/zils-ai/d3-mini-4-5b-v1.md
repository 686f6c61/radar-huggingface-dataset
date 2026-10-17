# zils-ai/d3-mini-4.5b-v1

## Resumen

d3-mini-4.5b-v1 es un perfil de modelo publicado por la organización zils-ai sobre HuggingFace. No se trata de un entrenamiento nuevo: la propia model card lo describe como un espejo fijado (pinned mirror) byte a byte de los 25 ficheros de modelo y runtime del repositorio `vllm-sr/d3-mini`, en la revisión `a475367de0d8133a3c1a2a0dc12303d89cfa2ab4`, excluyendo el README del proveedor y el directorio `assets/`. El propósito declarado es que todos los mineros y validadores de la red descarguen exactamente los mismos ficheros, con los hashes SHA-256 registrados en el fichero de pins del perfil.

El modelo subyacente pertenece a la familia Zils, descrita por sus autores como un primitivo de decisión entrenable: recibe contexto y devuelve probabilidades, en lugar de generar texto. Según la documentación pública del proyecto, estos modelos devuelven probabilidades para decisiones sí/no, elecciones entre opciones y puntuaciones, con el objetivo de sustituir llamadas completas a un LLM en juicios repetitivos donde un modelo especializado cumple el umbral de calidad exigido. La model card indica que los pesos proceden del modelo base `Qwen/Qwen3.5-4B`, y el tag `qwen3_5` del repositorio es coherente con esa ascendencia.

El interés de esta ficha es doble. Por un lado, documenta un caso poco habitual: un repositorio cuya función es la reproducibilidad y el pinning de artefactos dentro de un sistema con incentivos económicos (el proyecto Zils se asocia a una competición de entrenamiento sobre Bittensor). Por otro, conviene subrayar que el repositorio no incluye pesos modificados ni datos de entrenamiento adicionales, y que el modelo base del que deriva es una variante de 4,54 mil millones de parámetros orientada a producir puntuaciones, no texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible con detalle; tag `qwen3_5`, coherente con la arquitectura de Qwen3.5 indicada como modelo base (`Qwen/Qwen3.5-4B`) |
| Parametros totales | 4.539.265.536 (4,54 B), segun los tensores safetensors del repositorio |
| Parametros activos | No aplicable (el repositorio no declara configuracion MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos en safetensors |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (requiere `custom_code`; repositorio de 9,1 GB) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla del tag `qwen3_5` y de la nota de licencia de la model card, que atribuye los pesos, el readout y el runtime al proveedor y situa el modelo base en `Qwen/Qwen3.5-4B`. El tag `custom_code` indica que el repositorio incluye codigo propio necesario para cargar o ejecutar el modelo, por lo que no basta con una llamada estandar a `transformers` sin revisar los ficheros de runtime incluidos. El recuento real de parametros (4.539.265.536) procede de los tensores safetensors publicados.

En cuanto al entrenamiento, no se han publicado en la informacion disponible datos sobre numero de tokens, composicion del dataset, fases de RLHF o DPO, ni innovaciones tecnicas concretas de atencion o decodificacion. Lo que si consta es que este repositorio concreto no entrena nada: es una copia fijada de otro repositorio, con los pesos sin modificar, creada para garantizar que todos los participantes de la red Zils descarguen los mismos ficheros verificables por SHA-256. La documentacion publica del proyecto describe la familia Zils como modelos de decision que devuelven probabilidades en lugar de texto generado, y menciona una competicion de entrenamiento sobre Bittensor, con un candidato experimental de 0,8 B citado como estado actual del proyecto en las fuentes consultadas.

## Capacidades

- Emision de probabilidades para decisiones: segun la documentacion publica del proyecto Zils, la familia devuelve probabilidades para decisiones binarias (si/no), elecciones entre alternativas y puntuaciones.
- Ausencia de generacion de texto: el modelo esta planteado como primitivo de decision, no como generador de lenguaje; no se documenta salida de texto libre.
- Integracion con runtime propio: el tag `custom_code` y los 25 ficheros de modelo y runtime del repositorio original sugieren un pipeline de inferencia especifico del proveedor.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; no se declara ninguna lista de idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Reproducibilidad verificable: el perfil registra el hash SHA-256 de cada fichero y la revision del repositorio de origen, lo que permite comprobar la integridad de la descarga.

## Casos de uso

- Enrutado de modelo (model routing) en produccion: sustituir llamadas completas a un LLM por una inferencia de 4,54 B que devuelve una probabilidad de que una consulta requiera un modelo mayor, reduciendo coste por llamada en volumenes altos.
- Seleccion de herramienta (tool choice) en agentes: dado un contexto de conversacion y un catalogo de funciones, usar el modelo para puntuar que herramienta es la adecuada antes de invocar el LLM encargado de ejecutarla.
- Decision de escalado a humano: clasificar conversaciones de atencion al cliente y devolver una probabilidad de escalado, con umbral ajustable segun el coste de un falso negativo.
- Control de calidad y verificacion en pipelines de CI/CD: puntuar si una respuesta generada cumple un criterio booleano definido por el equipo, como paso previo a un revisor mas caro.
- Validacion y mineria en la red Zils: el caso de uso explicito del repositorio es servir de base fijada para que mineros y validadores descarguen los mismos pesos y verifiquen hashes, garantizando comparabilidad de resultados en la competicion de entrenamiento.
- Moderacion y filtrado previo: aplicar el modelo como primera etapa de un clasificador en cascada, dejando solo los casos ambiguos al modelo grande.
- Investigacion sobre modelos de decision: al ser un derivado de Qwen3.5-4B con salida probabilistica, sirve como punto de partida para estudiar destilacion de juicios de un LLM mayor a un modelo pequeno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este repositorio. Las fuentes consultadas sobre el proyecto Zils mencionan la existencia de benchmarks publicos registrados y evidencia de checkpoints, pero esos datos corresponden al candidato experimental de 0,8 B y no se ha facilitado ninguna cifra concreta asociada a `zils-ai/d3-mini-4.5b-v1`.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16/BF16, aproximadamente 9 GB solo para pesos, mas overhead de activaciones y cache KV; el repositorio ocupa 9,1 GB, lo que es coherente con ese orden de magnitud. En cuantizacion INT8 el peso baja a unos 4,5-5 GB, y en INT4 a unos 2,5-3 GB. Estas cifras son estimaciones derivadas del recuento de parametros, no datos publicados.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, el modelo entra en GPUs de 16 GB o mas en FP16 con margen limitado, y en GPUs de 8-12 GB con cuantizacion.
- Cabe en GPU de consumo: si, previsiblemente, en tarjetas de 16 GB o superiores en precision completa y en tarjetas de 8-12 GB con cuantizacion. No se ha confirmado experimentalmente en la informacion disponible.
- Opciones de despliegue: no disponible. El repositorio incluye ficheros de runtime y requiere `custom_code`, por lo que las opciones estandar (vLLM, llama.cpp, Ollama, TGI) no estan confirmadas y dependen del runtime del proveedor.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo de salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zils-ai/d3-mini-4.5b-v1 | 4,54 B | No disponible | Probabilidades (decision) | Apache-2.0 | HuggingFace (0 descargas, 0 likes en el momento de la consulta) |
| vllm-sr/d3-mini | No disponible | No disponible | Probabilidades (decision) | Apache-2.0 | HuggingFace; repositorio de origen del que este es espejo |
| Qwen/Qwen3.5-4B | No disponible | No disponible | Texto | No disponible en la informacion consultada | HuggingFace; modelo base declarado |
| Zils 0,8 B (candidato experimental) | 0,8 B | No disponible | Probabilidades (decision) | No disponible | Documentado en zils.ai/model; usado en la competicion de entrenamiento |

No se dispone de resultados de benchmarks que permitan comparar el rendimiento relativo entre estas opciones.

## Limitaciones y advertencias

- El repositorio no aporta pesos nuevos ni entrenamiento adicional: es un espejo fijado de `vllm-sr/d3-mini`. Cualquier mejora o cambio debe buscarse en el repositorio de origen.
- No hay informacion publicada sobre sesgos del modelo en la documentacion consultada.
- Riesgo de alucinacion: no evaluable en los terminos habituales, ya que el modelo no esta disenado para generar texto, sino para emitir probabilidades. El riesgo equivalente es el de calibracion: una probabilidad mal calibrada puede inducir decisiones erroneas si se usa con un umbral fijo.
- No se declara ninguna lista de idiomas soportados, lo que impide garantizar cobertura multilingue.
- No se especifica la longitud de contexto, dato critico para decidir si el modelo sirve para conversaciones multi-turno largas o documentos extensos.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero la propia model card advierte de que la licencia cubre los pesos, el readout y el runtime del proveedor, y que el modelo base es `Qwen/Qwen3.5-4B`. Conviene revisar los ficheros `LICENSE` y `NOTICE` del repositorio y la licencia del modelo base antes de un despliegue comercial.
- Dependencia de codigo personalizado: el tag `custom_code` implica que la carga del modelo no se resuelve con un pipeline estandar; hay que auditar el runtime incluido y fijar versiones, algo especialmente relevante en un repositorio cuyo proposito es el pinning.
- Datos de adopcion minimos: 0 descargas y 0 likes en la fecha de consulta, lo que limita la evidencia de uso en produccion por terceros.
- Produccion: al no haber benchmarks ni metricas de latencia publicadas, cualquier integracion deberia acompanarse de una evaluacion propia sobre el dominio objetivo antes de sustituir llamadas a un LLM general.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zils-ai/d3-mini-4.5b-v1
- Repositorio de origen (base model): https://huggingface.co/vllm-sr/d3-mini
- Modelo base declarado: https://huggingface.co/Qwen/Qwen3.5-4B
- Mirror alternativo en HuggingFace: https://huggingface.co/ArthurZ/d3-mini
- Sitio del proyecto Zils: https://zils.ai/
- Pagina de investigacion del modelo de decision: https://zils.ai/model
- Repositorio GitHub del modelo y la subred: https://github.com/ooo-hq/zils
- Repositorio GitHub del sitio web y la investigacion publica: https://github.com/ooo-hq/zils-web
