# winterthurquants/gemma-4-12B-agentic-fable5-composer2.5-v2-3.5x-tau2-GGUF

## Resumen

Gemma4-12B-agentic-fable5-composer2.5-v2 (nombre abreviado por el autor como Gemma4-12B v2) es un ajuste fino orientado a código y uso de herramientas (agentic) sobre el modelo base google/gemma-4-12B-it, desarrollado por el usuario winterthurquants. Se distribuye como repositorio de cuantizaciones GGUF para inferencia local con llama.cpp y derivados, con un total de 11.907.350.576 parámetros (unos 11,9 mil millones) y un tamaño de repositorio de 38,1 GB que agrupa las distintas cuantizaciones publicadas.

El problema que aborda es el de disponer de un agente de código y terminal ejecutable en hardware modesto: el autor afirma que con aproximadamente 4,5 GB de VRAM o memoria unificada libre es posible ejecutar el modelo de forma local, sin API ni cloud. La propuesta de valor se centra en el bucle de trabajo técnico (leer estado, diagnosticar, aplicar corrección, verificar), medido en la versión v2 sobre el dominio telecom de tau2-bench.

La relevancia del modelo radica en su especialización declarada: el autor reporta una puntuación de aproximadamente el 55 % en tau2-bench telecom (20 tareas, Q8_0, mismo harness) frente al 15 % del modelo base oficial, lo que supone un factor de mejora de en torno a 3,5 veces en tareas agénticas de diagnóstico y reparación. La licencia declarada es apache-2.0. El repositorio no registra descargas ni valoraciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la informacion proporcionada; hereda la del modelo base google/gemma-4-12B-it (familia Gemma 4) |
| Parametros totales | 11.907.350.576 (~11,9 mil millones) |
| Parametros activos | No aplica (no se declara arquitectura MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | GGUF: Q3_K_M (opcion minima fiable declarada por el autor), Q4_K_M (opcion recomendada), Q8_0 (usada en la evaluacion). El autor indica que no publica Q2_K por no superar sus pruebas de estres. Otras cuantizaciones: no disponibles |
| Idiomas soportados | No disponibles (la ficha de HuggingFace no declara idiomas) |
| Licencia | apache-2.0 (segun la model card y los metadatos del repositorio) |
| Formato de pesos | GGUF (library_name: gguf); el autor menciona haber publicado el maestro en safetensors por separado |
| Modelo base | google/gemma-4-12B-it |
| Autor | winterthurquants |
| Pipeline | text-generation |
| Tamano del repositorio | 38,1 GB |
| Fecha de creacion | 27 de septiembre de 2026 |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

No se detallan en la informacion disponible las caracteristicas internas de la arquitectura (tipo de atencion, uso de MoE, SSM u otras variantes), mas alla de que el modelo deriva de google/gemma-4-12B-it. El autor describe el proceso como un ajuste fino de posentrenamiento sobre ese base, con un enfoque explicito en codigo y flujo agentico, y menciona haber construido una pasada de "ventana de contexto dinamica" durante la segmentacion de los datos de entrenamiento para preservar intactos los pasos de lectura previa a la accion (read-before-act) propios del comportamiento de agente.

Respecto a los datos, el autor indica que el retiro de "Fable 5" impidio disponer de trazas de cadena de pensamiento genuinas de ese modelo, y que reconstruyo la razonamiento ausente de los conjuntos aportados por la comunidad usando Opus 4.8 (modo xhigh). Senala tambien que reviso y limpio los datos manualmente, y que el coste total de la v2 supero las 40 horas de trabajo, ademas de consumir un plan Claude Max 20x completo. No se especifica el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas concretas de RLHF o DPO; la informacion menciona exclusivamente generacion de datos sinteticos de razonamiento y ajuste supervisado.

## Capacidades

- Generacion de texto conversacional, con etiqueta "conversational" en los metadatos del repositorio.
- Generacion y edicion de codigo, con enfoque declarado en tareas de programacion.
- Uso de herramientas (tool calling) en el formato nativo de herramientas de Gemma 4; el autor advierte que es necesario que el front-end lo parsee correctamente (por ejemplo, con `--jinja` en llama.cpp).
- Comportamiento agentico multi-paso: el modelo esta entrenado para leer, razonar, usar herramientas y actuar sobre tareas tecnicas antes de ejecutar cambios.
- Operacion en terminal y depuracion: el dominio de evaluacion elegido (telecom en tau2-bench) replica el bucle comprobar estado, diagnosticar, corregir y verificar.
- Modo de razonamiento o "thinking", segun la etiqueta `thinking` del repositorio.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision o audio: no disponibles; no se declaran en la informacion proporcionada.

## Casos de uso

- Agente de codigo local en equipos sin GPU de gama alta: el autor afirma que basta con unos 4,5 GB de VRAM o memoria unificada, lo que permite ejecutar un asistente de programacion privado en portatiles con grafica integrada o Apple Silicon.
- Automatizacion de tareas de terminal y depuracion: el modelo esta entrenado para el ciclo diagnostico-correccion-verificacion, por lo que encaja en tareas de leer registros, inspeccionar estado del sistema, aplicar una correccion y comprobar el resultado.
- Integracion en pipelines de CI/CD como agente de triaje: con soporte de tool calling y el formato nativo de Gemma 4, puede invocarse desde scripts para inspeccionar fallos de build y proponer o aplicar parches.
- Desarrollo asistido en entornos con requisitos de privacidad: al ejecutarse en local con llama.cpp, el codigo y los datos no salen de la maquina, lo que resulta adecuado para sectores regulados.
- Prototipado de agentes con herramientas sobre tau2-bench u otros entornos similares: el autor publica la receta y el harness de evaluacion sobre el dominio telecom, lo que facilita reproducir y extender el banco de pruebas.
- Atencion tecnica automatizada de primer nivel: la mejora reportada en tau2-bench telecom (aproximadamente 55 % frente a 15 % del base) apunta a su uso en flujos de soporte guiado por herramientas donde el agente debe diagnosticar antes de responder.
- Evaluacion comparativa de ajustes finos: el repositorio incluye cuantizaciones Q3_K_M, Q4_K_M y Q8_0, lo que permite medir el impacto de la cuantizacion en el rendimiento agentico sobre un mismo modelo.

## Benchmarks y rendimiento

La unica evaluacion publicada en la informacion disponible corresponde a tau2-bench, dominio telecom, 20 tareas, ejecutadas en local con el mismo harness y con cuantizacion Q8_0 en ambos casos.

| tau2-bench telecom (20 tareas, Q8_0, mismo harness) | Puntuacion |
|---|---|
| google/gemma-4-12B-it (base oficial) | ~15 % |
| Gemma4-12B v2 (este modelo) | ~55 % |
| Mejora relativa | ~3,5x |

El autor indica explicitamente que no ejecuto la suite completa de tau2-bench por coste temporal y que se limito al dominio que mejor representa el caso de uso objetivo. No hay datos publicados de MMLU, HumanEval, GSM8K ni de otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el autor afirma que el modelo funciona con aproximadamente 4,5 GB de VRAM o memoria unificada libre.
- Estimaciones derivadas del recuento de parametros (11,9 mil millones), sin incluir cache KV ni sobrecarga del runtime y por tanto orientativas: Q3_K_M en torno a 5,5-6 GB, Q4_K_M en torno a 7 GB, Q8_0 en torno a 12-13 GB.
- Cuantizacion recomendada por el autor: Q4_K_M como punto optimo; Q3_K_M como opcion minima considerada fiable.
- GPU de consumo: cabe en tarjetas con 8 GB o mas de VRAM en Q3_K_M y Q4_K_M, como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070. En Q8_0 conviene disponer de 16 GB o mas.
- GPU profesionales: A100, H100 o L40S son suficientes con holgura y permiten contextos y lotes mayores, aunque estan sobredimensionadas para un modelo de este tamano.
- Memoria unificada: el autor menciona explicitamente el caso de memoria unificada, lo que incluye equipos Apple Silicon con 8 GB o mas.
- Opciones de despliegue: llama.cpp y sus derivados (llama-server, Ollama, LM Studio y otros front-ends compatibles con GGUF). El autor recomienda usar `--jinja` en llama.cpp para el parseo correcto del formato nativo de herramientas de Gemma 4. Soporte en vLLM o TGI: no disponible en la informacion proporcionada.
- Configuracion de muestreo: el autor indica que la salida repetitiva tipo `0000...` se corrige con penalizacion de repeticion (`rep_pen 1.1`, `temp 1.0`).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | tau2-bench telecom | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma4-12B-agentic-fable5-composer2.5-v2 (este modelo) | 11,9 B | No disponible | ~55 % (20 tareas, Q8_0) | apache-2.0 | GGUF en HuggingFace |
| google/gemma-4-12B-it (base) | 12 B (segun denominacion) | No disponible | ~15 % (20 tareas, Q8_0) | No disponible en la informacion proporcionada | Modelo base en HuggingFace |
| Otras alternativas de tamano similar | No disponible | No disponible | No disponible | No disponible | No disponible |

El autor anuncia ademas un ajuste fino en curso de Qwen3.6-27B con la misma receta de codigo y comportamiento agentico, pensado para quienes dispongan de mas memoria, pero no se aportan datos de rendimiento de ese modelo ni fecha de publicacion.

## Limitaciones y advertencias

- Riesgo de alucinacion: no se documenta una evaluacion especifica de veracidad; el modelo esta orientado a razonamiento y ejecucion de herramientas, tareas en las que un error de diagnostico puede propagarse a acciones concretas.
- Sensibilidad a la configuracion del cliente: el autor afirma que en torno al 99 % de los problemas reportados son de configuracion del sampler o del front-end, no de los pesos. Sin penalizacion de repeticion la salida puede degradarse en secuencias repetitivas, y sin parseo del formato nativo de herramientas aparecen tokens especiales filtrados (`<|tool_call>`, `<|channel>`).
- Idiomas: no se declaran idiomas soportados, por lo que no hay garantia de calidad fuera del ingles tecnico habitual en datos de codigo y terminal.
- Longitud de contexto: no disponible; conviene verificarla en el repositorio antes de disenar flujos con documentos largos.
- Rendimiento generalista: el autor reconoce explicitamente que existen compromisos (trade-offs) en conocimiento general derivados de la especializacion en codigo y tareas agenticas.
- Antecedentes de entrenamiento: el autor admite haber asumido publicamente problemas de entrenamiento en la version v1, lo que aconseja validar la v2 sobre el caso de uso concreto antes de llevarla a produccion.
- Trazas de razonamiento reconstruidas: al haberse retirado el modelo del que provenian las cadenas de pensamiento originales, parte del razonamiento se genero con Opus 4.8, por lo que puede divergir de las trazas originales.
- Datos de benchmarks limitados: la evaluacion se restringe a 20 tareas de un unico dominio de tau2-bench, sin suite completa ni otros benchmarks, lo que limita la generalizacion de los resultados.
- Adopcion temprana: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente conocida.
- Licencia: la model card declara apache-2.0, pero el modelo deriva de google/gemma-4-12B-it; conviene verificar los terminos aplicables al modelo base antes de un uso comercial.
- Fecha de creacion futura respecto a la referencia habitual de consulta (27 de septiembre de 2026), dato que procede de los metadatos del repositorio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/winterthurquants/gemma-4-12B-agentic-fable5-composer2.5-v2-3.5x-tau2-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Perfil del autor: https://huggingface.co/winterthurquants
- Paper o documentacion adicional de tau2-bench: no disponible en la informacion proporcionada
- Repositorio de codigo, demo o blog del autor: no disponible en la informacion proporcionada
- Los resultados de la busqueda web realizada no aportaron enlaces relevantes sobre este modelo.
