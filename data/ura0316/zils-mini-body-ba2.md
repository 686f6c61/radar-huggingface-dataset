# Ura0316/zils-mini-body-ba2

## Resumen

zils-mini-body-ba2 es un modelo de lenguaje de 4.539 millones de parametros (4,54 B) publicado por Ura0316 en el ecosistema Zils, un pool de modelos asociado a la subred 127 de Bittensor. El repositorio contiene exclusivamente el "cuerpo" del modelo (los pesos de lenguaje y vision en el formato de chasis del pool, 723 tensores en bfloat16); la capa de respuesta, el prompt y el runtime provienen del chasis fijado del pool, comun a todos los cuerpos de Zils.

Tecnicamente, el modelo se construye mediante un proceso de "soup" (promediado uniforme de pesos) sobre cuatro modelos base de la familia Qwen3.5-4B: torchcast-ai/torchcast-decision-4b, vllm-sr/d3-mini, perplexity-ai/pplx-decider-flash-v1.2 y Maincode/Matilda-Decision-v1-Mini. Sobre dos mezclas intermedias se entrena un adaptador LoRA de rango 64 en las proyecciones de atencion y MLP durante una epoca, que posteriormente se fusiona en los pesos, y finalmente se promedia el resultado de ambas ramas.

Su relevancia es acotada y muy especifica: no es un modelo de proposito general, sino un componente de decision dentro de un pool descentralizado. Resulta de interes para quienes investigan tecnicas de model merging, entrenamiento con perdidas de destilacion suave (soft cross-entropy mas termino de Brier) y despliegues en infraestructuras tipo Bittensor, mas que para aplicaciones directas de generacion de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen/Qwen3.5-4B), con torre de vision segun el chasis del pool |
| Parametros totales | 4.539.265.536 (4,54 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (723 tensores, bfloat16) |

## Arquitectura y entrenamiento

El modelo parte de la familia Qwen3.5-4B, un transformer decoder-only de aproximadamente 4,5 B de parametros. El repositorio no documenta la configuracion exacta de capas, cabezas ni dimension oculta, aunque el recuento de 723 tensores y la presencia de pesos de vision en el chasis del pool sugieren una arquitectura multimodal con proyecciones de atencion y MLP sobre las que se aplica el adaptador. El contexto maximo no se especifica en la informacion disponible.

El proceso de construccion tiene tres fases. Primero se calculan dos promedios uniformes de pesos: el primero combina torchcast-decision-4b y d3-mini; el segundo combina torchcast-decision-4b, pplx-decider-flash-v1.2, d3-mini y Matilda-Decision-v1-Mini. Sobre cada uno de esos puntos de partida se entrena un LoRA de rango 64 en las proyecciones de atencion y MLP durante una epoca, con una perdida compuesta por entropia cruzada suave hacia la distribucion objetivo de cada item mas un termino de Brier hacia la clave del item; el adaptador se fusiona despues en los pesos. Finalmente, el cuerpo publicado es el promedio uniforme de las dos ramas fusionadas, generado con el constructor de soup de Zils.

Los datos de entrenamiento son items de decision en formato de examen: items de entrenamiento previos, items nuevos generados por Qwen/Qwen3.8-27B usando filas publicas de PIQA (train), Crisscrossed Captions (validacion de captions) y glaive-function-calling-v2 como semillas de estilo, con cada clave verificada mediante una resolucion ciega, mas posts de 20 Newsgroups en formato de examen. Los objetivos mezclan la distribucion de respuestas de un modelo profesor con la clave del item. No se redistribuyen filas de datasets ni items escritos en el repositorio.

## Capacidades

- Clasificacion y decision en formato de examen: el modelo esta optimizado para emitir una respuesta entre opciones sobre items estructurados, no para generacion abierta.
- Razonamiento sobre items de opcion multiple derivados de PIQA (razonamiento fisico cotidiano) y 20 Newsgroups (clasificacion tematica de texto).
- Capacidades multimodales potenciales: el chasis del pool incluye pesos de vision, aunque la model card no detalla el alcance funcional de esa torre.
- Tool calling: los datos de entrenamiento incluyen glaive-function-calling-v2 como semilla de estilo, lo que sugiere exposicion a formatos de llamada a funciones, sin garantia documentada de soporte en produccion.
- Capacidades multilingues: no disponibles.
- Modo thinking, audio u otras capacidades especiales: no disponibles.

## Casos de uso

- Evaluacion de tecnicas de model merging: el modelo sirve como caso de estudio reproducible de promediado uniforme de pesos combinado con LoRA fusionado, util para investigadores que comparan estrategias de soup frente a fine-tuning convencional.
- Investigacion en destilacion suave: la perdida combinada de entropia cruzada suave y termino de Brier hacia una clave permite estudiar como se comporta un modelo pequeno al aprender distribuciones de un profesor en tareas de decision.
- Componente de decision en pipelines de subred Bittensor: el cuerpo puede integrarse en el chasis fijado del pool de Zils (subred 127) para tareas de seleccion entre opciones dentro de ese runtime concreto.
- Clasificacion tematica de textos: gracias a los items de 20 Newsgroups en entrenamiento, puede emplearse en experimentos de categorizacion de documentos cortos, siempre con validacion propia.
- Razonamiento fisico cotidiano: los items derivados de PIQA permiten usarlo en prototipos de respuesta a preguntas de sentido comun sobre situaciones fisicas.
- Base para experimentos de function calling: la inclusion de glaive-function-calling-v2 como semilla de estilo lo hace util para probar formatos de llamada a herramientas en modelos de 4 B, con la cautela de que no hay benchmarks publicados.
- Estudio de licencias y trazabilidad en modelos derivados: al ser Apache-2.0 y derivar de bases tambien Apache-2.0, sirve como ejemplo de cadena de derivacion documentada para auditorias de cumplimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 9,1 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 10 y 12 GB para contextos cortos.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 4,5 a 5 GB de pesos; en 4 bits, alrededor de 2,3 a 3 GB (estimaciones teoricas, no verificadas para este modelo).
- GPU recomendadas: A100, H100 o L40S para despliegue en bfloat16 con throughput alto; RTX 4090 o RTX 3090 para inferencia en bfloat16 de un solo usuario.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090, RTX 4080 y tarjetas con 12 GB o mas en bfloat16; en 8 GB o menos seria necesario cuantizar, aunque no se documentan pesos GGUF publicados.
- Opciones de despliegue: vLLM y TGI son compatibles con safetensors en bfloat16; llama.cpp u Ollama requeririan conversion a GGUF no publicada. El runtime especifico del pool de Zils no esta documentado en detalle.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| zils-mini-body-ba2 | 4,54 B | no disponible | Apache-2.0 | Cuerpo de decision para pool Zils (Bittensor) | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-4B | ~4 B (no confirmado) | no disponible | Apache-2.0 | Modelo base de proposito general | Hugging Face |
| torchcast-ai/torchcast-decision-4b | ~4 B | no disponible | Apache-2.0 | Modelo de decision, componente del merge | Hugging Face |
| vllm-sr/d3-mini | no disponible | no disponible | Apache-2.0 | Modelo de decision, componente del merge | Hugging Face |

La comparacion con alternativas de la misma categoria es limitada porque los modelos de referencia son componentes del propio merge y no se dispone de datos de rendimiento publicados para ninguno de ellos en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio contiene solo el cuerpo del modelo: sin la capa de respuesta, el prompt y el runtime del chasis del pool, los pesos no son directamente utilizables para inferencia estandar.
- No hay benchmarks publicados, por lo que no existe evidencia cuantitativa de calidad frente a alternativas.
- El modelo esta especializado en items de decision en formato de examen; su comportamiento en generacion abierta, dialogo multi-turno o tareas fuera de ese formato no esta documentado.
- Riesgo de alucinacion: no evaluado; en tareas de clasificacion, el riesgo se traslada a respuestas erroneas con alta confianza.
- Sesgos conocidos: no documentados; los datos de entrenamiento incluyen PIQA, Crisscrossed Captions, glaive-function-calling-v2 y 20 Newsgroups, con los sesgos propios de esas fuentes.
- Idiomas soportados: no disponibles, lo que impide garantizar un rendimiento multilingue.
- Longitud de contexto: no disponible; no debe asumirse la del modelo base sin verificacion.
- Licencia Apache-2.0: permite uso comercial, pero al ser un modelo derivado conviene revisar las condiciones de los cuatro modelos base y del chasis del pool.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- La fecha de creacion indicada (2026-11-09) es posterior a la de esta ficha; conviene verificar la vigencia de los metadatos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Ura0316/zils-mini-body-ba2
- Modelo base principal: https://huggingface.co/Qwen/Qwen3.5-4B
- Componente del merge: https://huggingface.co/torchcast-ai/torchcast-decision-4b
- Componente del merge: https://huggingface.co/vllm-sr/d3-mini
- Componente del merge: https://huggingface.co/perplexity-ai/pplx-decider-flash-v1.2
- Componente del merge: https://huggingface.co/Maincode/Matilda-Decision-v1-Mini
- Generador de items de entrenamiento: https://huggingface.co/Qwen/Qwen3.8-27B
