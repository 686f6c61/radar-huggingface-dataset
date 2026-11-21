# Valen-Team/Valen-Decision-1.5-0.8B-GGUF

## Resumen

Valen-Decision-1.5-0.8B es un modelo multimodal de decisión desarrollado por Valen-Team, construido sobre el modelo base Qwen/Qwen3.5-0.8B. A diferencia de un modelo generativo convencional, está diseñado para devolver decisiones estructuradas: clasificaciones (choice), puntuaciones (score), etiquetas de predicado (noul) y cajas delimitadoras (bbox) a partir de mensajes de texto e imágenes. Esta versión concreta del repositorio se distribuye en formato GGUF para el runtime propietario de llama.cpp de Valen (versión 0.2.0).

El modelo resuelve tareas de enrutamiento y clasificación en producción: triaje de tickets de soporte, verificación de imágenes de producto contra requisitos y etiquetado de acciones en vídeo. Su interés actual radica en que ofrece salidas probabilísticas calibradas en una sola pasada forward, en lugar de generación autoregresiva de texto, lo que simplifica la integración en pipelines que necesitan umbrales de confianza y políticas de revisión humana.

Con 756.871.277 parámetros reales (aproximadamente 0,8B), licencia Apache 2.0 y un tamaño de repositorio de 6,0 GB que incluye pesos F32, Q8_0 y un fichero de visión separado, se posiciona como la variante más ligera de una familia que también publica versiones de 2B, 4B, 9B y 27B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal derivado de Qwen3.5, con atención bidireccional por bloques y cabeza de grounding bbox |
| Parametros totales | 756.871.277 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (configuración de servido documentada con `-c 4096`) |
| Tipos de cuantizacion | F32 y Q8_0 (texto); F32 para visión |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (runtime Valen llama.cpp 0.2.0); pesos nativos en Transformers disponibles en el repo base |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B y añade dos modificaciones técnicas destacadas: atención bidireccional por bloques (block-bidirectional attention) y una cabeza de grounding bbox. La primera permite que la representación de la consulta agregue información de todo el bloque de entrada en lugar de solo del pasado, algo coherente con una tarea de clasificación y no de generación. La segunda produce una caja delimitadora por cada pregunta de tipo bbox en la misma pasada forward que las probabilidades de choice, score y noul.

El entrenamiento se realizó sobre datos propios que el autor declara explícitamente no públicos. No se dispone de información sobre el número de tokens, la composición del dataset ni si hubo etapas de RLHF o DPO. La model card sí indica que el código de entrenamiento está publicado en GitHub, lo que permite afinar el modelo sobre datos propios, y que la familia se ofrece en cinco tamaños (0.8B, 2B, 4B, 9B y 27B) con pesos nativos, ONNX y GGUF.

Una innovación operativa relevante es el modo de evaluación: la petición completa se evalúa en una sola pasada y la respuesta contiene las probabilidades candidatas de cada pregunta, sin decodificación autoregresiva. El runtime 0.2.0 documenta una comparación frente a `model.predict` nativo en FP32 con recuentos de tokens idénticos y diferencias máximas absolutas de 0,00029 (probabilidad) y 0,0045 (caja) en F32, y de 0,02081 y 0,0335 en Q8_0, con un umbral de aceptación de 0,08.

## Capacidades

- Clasificación de texto mediante preguntas de tipo `choice` con criterios y etiquetas definidos por el usuario.
- Puntuación (`score`) de mensajes o contenidos según criterios configurables.
- Etiquetado de predicados (`noul`) para identificar acciones o atributos presentes en la entrada.
- Localización de objetos mediante `bbox` con cabeza de grounding dedicada.
- Procesamiento conjunto de texto e imagen (pipeline image-text-to-text) en una sola pasada.
- Salida estructurada y probabilística, apta para umbrales de confianza y políticas de revisión.
- Soporte de preguntas múltiples en una misma petición mediante el esquema de estado compartido (`shared-state`).
- Servido a través de endpoints `/v1/systemone` y `/v1/decisions` del runtime Valen.
- No se documenta tool calling, function calling, modo thinking, audio ni capacidades de agente multi-paso.

## Casos de uso

- Triaje de tickets de soporte: el modelo clasifica el mensaje del cliente en categorías definidas como criterios de una pregunta `choice`, y la probabilidad devuelta permite enrutar automáticamente los casos claros y derivar a revisión humana los que quedan por debajo del umbral. El cookbook oficial documenta este flujo en la página de ticket routing.
- Verificación de imágenes de producto: con el fichero de visión cargado, se formula una pregunta `choice` o `score` sobre si la imagen cumple los requisitos del catálogo (fondo, encuadre, presencia del producto), y la salida probabilística sirve como filtro previo a la revisión manual.
- Etiquetado de acciones en vídeo: procesando fotogramas clave con preguntas `noul` o `choice` se identifican acciones presentes, según el tutorial de video tagging del cookbook.
- Moderación de contenido con umbral configurable: la puntuación (`score`) sobre criterios de política permite fijar cortes operativos y auditar la distribución de probabilidades.
- Enrutamiento en atención al cliente multicanal: al evaluar la petición completa en una sola pasada, el coste por mensaje es bajo y adecuado para volúmenes altos en CPU, sin necesidad de GPU.
- Detección y localización de elementos en imágenes: las preguntas `bbox` devuelven cajas delimitadoras con confianza, útiles para recortes automáticos o verificación de regiones de interés.
- Despliegue en entornos sin GPU: el runtime documentado funciona en Linux x86-64 con CPU y conjuntos de instrucciones AVX2/FMA/F16C/BMI2, lo que habilita su uso en servidores modestos o en el borde.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card menciona una métrica propia, el Decision Index, que crece con el tamaño del modelo (0.8B, 2B, 4B, 9B, 27B), pero no se proporcionan valores numéricos en la información disponible. Sí se documenta la fidelidad del GGUF frente a los pesos nativos:

| Fichero | Diferencia máx. probabilidad | Diferencia máx. caja | Diferencia máx. confianza bbox |
|---|---:|---:|---:|
| F32 | 0,00029 | 0,0045 | 0,0031 |
| Q8_0 | 0,02081 | 0,0335 | 0,0438 |

## Requisitos de hardware

- VRAM estimada: no aplica para el runtime documentado, que se ejecuta en CPU. Los pesos ocupan 0,77 GiB (Q8_0), 2,83 GiB (F32) y 0,37 GiB adicionales para el fichero de visión F32.
- GPU recomendadas: no disponibles; la guía de servido del runtime 0.2.0 usa `-ngl 0` y `--device none`, es decir, CPU.
- Cabe en GPU consumer: no se documenta soporte GPU para este runtime; en CPU requiere AVX2, FMA, F16C y BMI2.
- Opciones de despliegue: runtime Valen llama.cpp 0.2.0 (binario Linux x86-64, Ubuntu 22.04+, glibc 2.35+), API HTTP gratuita y demo web del equipo, y Space de playground en Hugging Face. También existen pesos nativos para Transformers y formato ONNX en el repo base.
- Latencia y throughput: no disponibles. La configuración de referencia usa `-c 4096 -b 4096 -ub 4096 -t 4 --parallel 1`, lo que sugiere un perfil de un solo flujo con cuatro hilos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Valen-Decision-1.5-0.8B | 756.871.277 | 4096 | GGUF, safetensors, ONNX | Apache 2.0 | Decisiones estructuradas multimodal |
| Valen-Decision-1.5-2B | no disponible | no disponible | GGUF, safetensors, ONNX | Apache 2.0 | Misma familia, mayor tamaño |
| Valen-Decision-1.5-4B | no disponible | no disponible | GGUF, safetensors, ONNX | Apache 2.0 | Misma familia, mayor tamaño |
| Qwen/Qwen3.5-0.8B | no disponible | no disponible | safetensors | no disponible | Modelo base generativo |

No se dispone de datos de rendimiento comparativo entre estas variantes ni frente a modelos de clasificación de propósito general, por lo que la comparativa se limita a parámetros, formato y licencia.

## Limitaciones y advertencias

- Los datos de entrenamiento no son públicos, lo que impide auditar la composición del dataset y los posibles sesgos adquiridos.
- Al devolver probabilidades y no texto generado, el riesgo de alucinación se traslada a la calibración: una probabilidad alta no garantiza corrección, y conviene validar los umbrales con datos propios.
- El contexto documentado es de 4096 tokens; entradas más largas requieren aumentar `-c`, `-b` y `-ub` de forma conjunta y consumen más memoria.
- No se declaran idiomas soportados; el rendimiento fuera del inglés está sin verificar.
- El runtime GGUF es propietario de Valen y solo se publica para Linux x86-64; no hay build documentado para macOS, Windows ni ARM.
- La cuantización Q8_0 introduce diferencias de hasta 0,0438 en confianza de bbox frente a FP32, relevante si se usan umbrales estrictos.
- Licencia Apache 2.0 permite uso comercial, pero el ecosistema de servido (runtime) tiene su propio ciclo de versiones y debe verificarse su compatibilidad.
- El modelo no documenta tool calling ni razonamiento multi-paso; no debe emplearse como sustituto de un LLM generativo en tareas abiertas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Valen-Team/Valen-Decision-1.5-0.8B-GGUF
- Modelo base nativo: https://huggingface.co/Valen-Team/Valen-Decision-1.5-0.8B
- Variante 2B: https://huggingface.co/Valen-Team/Valen-Decision-1.5-2B
- Variante 4B: https://huggingface.co/Valen-Team/Valen-Decision-1.5-4B
- Variante 9B: https://huggingface.co/Valen-Team/Valen-Decision-1.5-9B
- Variante 27B: https://huggingface.co/Valen-Team/Valen-Decision-1.5-27B
- Repositorio de código y entrenamiento: https://github.com/Valen-Team/Valen
- Release del runtime GGUF 0.2.0: https://github.com/Valen-Team/Valen/releases/tag/gguf-runtime-v0.2.0
- Guía GGUF: https://valen-team.github.io/docs/valen/gguf/
- API y demo web: https://valen-team.github.io/
- Space de playground: https://huggingface.co/spaces/Valen-Team/Valen-API
- Cookbook (API basics): https://valen-team.github.io/cookbook/api-quickstart/
- Cookbook (inferencia local): https://valen-team.github.io/cookbook/local-inference/
- Cookbook (ticket routing): https://valen-team.github.io/cookbook/ticket-routing/
- Cookbook (product screening): https://valen-team.github.io/cookbook/product-screening/
- Cookbook (video tagging): https://valen-team.github.io/cookbook/video-tagging/
