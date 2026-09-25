# ukisai/Swift-Qwen3.8-Flash-Next

## Resumen

Swift-Qwen3.8-Flash-Next es un ajuste fino derivado de Qwen/Qwen3.8-Flash-Next, publicado por UkisAI (ukisai). Se presenta como una variante "reasoning-efficient": no busca superar al modelo base en capacidad bruta, sino reducir el gasto de tokens de razonamiento manteniendo la precision. El autor reporta un 63,4 % menos de tokens de "thinking", una aceleracion de 1,8x y una perdida de precision inferior al 1 % frente al base en el nivel de esfuerzo xhigh.

El modelo es un transformer con arquitectura de mezcla de expertos (MoE), con 179.999.981.459 parametros totales segun los pesos en safetensors, un tamano de repositorio de 360 GB y una pipeline declarada image-text-to-text, por lo que conserva entrada de texto, imagen y video. La nomenclatura interna del autor (Qwen3.8-27B, dataset Qwen3.8-27B-multi-turn-agent-sft) sugiere del orden de 27B parametros activos, aunque ese dato no aparece confirmado en la informacion disponible.

Su relevancia ahora es doble: por un lado ataca el coste real de los modelos de razonamiento (los tokens de pensamiento encarecen y ralentizan cada peticion), y por otro esta orientado explicitamente a cargas agente de horizonte largo, uso de terminal y ingenieria de software. La licencia es propietaria (swift-open-license-1.0) y el repositorio esta en modo gated, con una via de licencia empresarial indicada por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) |
| Parametros totales | 179.999.981.459 (~180B) |
| Parametros activos | no disponible (la nomenclatura del autor sugiere ~27B, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 en el checkpoint publicado; versiones GGUF y GSQ-RCO GGUF en repositorios separados |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-1.0 (license: other), repositorio gated, con licencia empresarial ofrecida por el autor |
| Formato de pesos | safetensors (repo principal), GGUF (repos derivados) |

## Arquitectura y entrenamiento

La base es Qwen3.8-Flash-Next, un modelo multimodal de tipo Mixture of Experts que acepta texto, imagen y video y expone la interfaz estandar de Qwen3.8. El ajuste de UkisAI no modifica la interfaz ni la topologia: el trabajo se concentra en el comportamiento de razonamiento y en el post-entrenamiento para tareas de codigo y agentes de horizonte largo (agentes personales, uso de terminal, ingenieria de software).

El metodo descrito consiste en identificar que tokens concretos estaban asociados a "sobrepensamiento patologico" y penalizarlos, sin atacar directamente la longitud del razonamiento. Despues se recupera la precision con RL y OPD (destilacion on-policy), lo que produce trazas de pensamiento mas cortas y, segun el autor, menos errores de sobrepensamiento. El autor declara ademas un componente de transferencia procedente de ThinkingCap-Qwen3.6-27B de BottleCap AI. Los datos de partida son publicos (dataset ukisai/Qwen3.8-27B-multi-turn-agent-sft), pero no se usan tal cual: se remuestrean y se transforman en entornos de RL. No se especifica en la informacion disponible el numero total de tokens de entrenamiento ni la composicion exacta del dataset.

## Capacidades

- Generacion de texto y razonamiento en modo thinking, con trazas de razonamiento mas cortas que el base.
- Razonamiento multimodal: entrada de texto, imagen y video (pipeline image-text-to-text).
- Generacion de codigo en escenarios de proyecto completo; el propio autor demuestra la construccion de un juego 3D endless runner funcional a partir de un unico prompt.
- Uso de terminal y tareas agenticas (etiqueta terminal-bench, entrenamiento para uso de terminal).
- Flujos multi-turno y conversational, con datos de entrenamiento especificos de agente multi-turno.
- Post-entrenamiento orientado a function calling y tool use dentro de entornos de RL, segun la descripcion del autor (no se detalla el formato exacto de las herramientas).
- Capacidad de ahorro de tokens: menos tokens de pensamiento por respuesta, lo que reduce coste y latencia en cargas con muchas peticiones.
- Idiomas adicionales: no disponible.

## Casos de uso

- Agentes de codigo en produccion: el modelo esta post-entrenado para ingenieria de software y puede integrarse en pipelines de CI/CD o en asistentes que editan repositorios; el ahorro de tokens de razonamiento reduce el coste por tarea en ejecuciones repetidas.
- Automatizacion de terminal y operaciones: con soporte declarado para uso de terminal y Terminal-Bench 2.1, encaja en agentes que ejecutan comandos, diagnostican fallos y aplican correcciones de forma iterativa.
- Generacion de prototipos jugables y demos interactivas: la demo publica construye un juego 3D completo desde un solo prompt en 4 minutos 56 segundos, frente a 8 minutos 52 segundos del base, lo que lo hace util para iteracion rapida de prototipos.
- Atencion al cliente multi-turno: el entrenamiento incluye conversacion multi-turno y agentes personales, por lo que es adecuado para asistentes que mantienen estado a lo largo de sesiones largas, siempre que la ventana de contexto disponible lo permita (dato no publicado).
- Analisis de documentos con imagenes: al conservar entrada de imagen y video, puede extraer informacion de capturas, diagramas o fotogramas dentro de un flujo de razonamiento.
- Asistentes personales de horizonte largo: el post-entrenamiento apunta a agentes personales con planificacion multi-paso y llamadas a herramientas.
- Reduccion de coste en servicios de inferencia con razonamiento: para productos que ya usan el modelo base, sustituirlo por esta variante recorta el volumen de tokens generados por respuesta, lo que se traduce en menos GPU-segundo por peticion.
- Evaluacion comparativa de eficiencia: util como referencia para equipos que investigan compresion de trazas de razonamiento y penalizacion de tokens de sobrepensamiento.

## Benchmarks y rendimiento

El autor publica una tabla de evaluacion comparando el base Qwen3.8-Flash-Next en BF16 con el checkpoint BF16 de Swift; las columnas de tokens miden tokens de pensamiento, salvo Terminal-Bench 2.1, que mide tokens totales generados. En la informacion disponible solo se han conservado las metricas de cabecera y la demo; el desglose completo por benchmark (nombres y puntuaciones fila a fila) no esta disponible.

| Metrica | Qwen3.8-Flash-Next (base) | Swift 1.5 Qwen3.8-Flash-Next | Nota |
|---|---|---|---|
| Tokens de pensamiento | referencia | -63,4 % | Segun el autor |
| Velocidad | 1x | 1,8x | Segun el autor |
| Precision en xhigh | referencia | perdida <1 % | Segun el autor |
| Demo: juego 3D endless runner | 8 min 52 s | 4 min 56 s | Tiempo de construccion del mismo prompt |

No se han publicado en la informacion disponible puntuaciones numericas por benchmark individual (MMLU, HumanEval, GSM8K, Terminal-Bench 2.1 u otros).

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 360 GB solo para pesos, mas cache KV; requiere nodo multi-GPU.
- VRAM estimada en cuantizacion de 8 bits: en torno a 180 GB, tambien fuera del alcance de una GPU individual.
- VRAM estimada en cuantizacion de 4 bits: del orden de 90 a 110 GB, viable en dos aceleradores de 80 GB o en uno de 141 GB.
- GPU recomendadas: H100 80 GB, H200 141 GB, A100 80 GB en configuracion multiple; B200 para mayor margen.
- GPU de consumo: no cabe en ninguna GPU de consumo actual en BF16 ni en 8 bits. Con cuantizaciones agresivas y offloading parcial a RAM de sistema podria arrancar en equipos con 128 GB o mas de RAM, a costa de latencia muy alta.
- Opciones de despliegue: transformers (formato nativo safetensors), vLLM y SGLang para serving en GPU, llama.cpp y Ollama para las versiones GGUF, y TGI segun compatibilidad con la arquitectura Qwen3.8.
- Latencia y throughput: no disponibles como cifra absoluta. El unico dato relativo es la aceleracion de 1,8x frente al base reportada por el autor.
- Al ser MoE con un subconjunto activo mucho menor que el total, el cuello de botella principal es la memoria de pesos, no el computo por token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Swift-Qwen3.8-Flash-Next (ukisai) | ~180B totales, activos no disponibles | no disponible | Derivado eficiente en tokens de razonamiento, multimodal, agentico | swift-open-license-1.0, gated, licencia empresarial aparte | HuggingFace, safetensors + GGUF derivados |
| Qwen3.8-Flash-Next (Qwen) | no disponible en la informacion | no disponible | Modelo base multimodal MoE de razonamiento | no disponible | HuggingFace (modelo base del ajuste) |
| ThinkingCap-Qwen3.6-27B (BottleCap AI) | 27B (segun denominacion) | no disponible | Ajuste orientado a razonamiento; fuente del componente de transferencia | no disponible | no disponible |
| Swift-Qwen3.8-27B (ukisai) | 27B (segun denominacion) | no disponible | Version previa de la familia Swift, con menos sobrepensamiento | no disponible | HuggingFace, UkisAI |

No se dispone de puntuaciones comparativas directas entre estos modelos en la informacion proporcionada, por lo que la comparacion se limita a enfoque, licencia y disponibilidad.

## Limitaciones y advertencias

- Licencia propietaria: swift-open-license-1.0 no es una licencia open source estandar. El uso comercial requiere revisar el texto de la licencia y, segun el autor, contactar para licencia empresarial.
- Repositorio gated: el acceso a los pesos esta restringido y sujeto a aceptacion de condiciones.
- Riesgo de alucinacion: es un modelo de razonamiento de gran tamano; no se documentan tasas de alucinacion ni evaluaciones de veracidad en la informacion disponible.
- Trazas de razonamiento comprimidas: la reduccion del 63,4 % de tokens de pensamiento se obtiene penalizando tokens concretos durante el entrenamiento. El propio autor reconoce una perdida de precision inferior al 1 % frente al base, por lo que en tareas de razonamiento muy exigente el base puede seguir siendo preferible.
- Idiomas soportados no documentados: no se puede confirmar el comportamiento fuera del ingles o de los idiomas mayoritarios del dataset de entrenamiento.
- Longitud de contexto no publicada: no es posible planificar cargas que dependan de ventanas muy largas sin verificacion previa.
- Sesgos: no se publica ninguna evaluacion de sesgo, toxicidad o robustez.
- Coste de hardware elevado: ~360 GB en BF16 excluye el despliegue en infraestructura pequena sin cuantizacion.
- Ambiguedad de nomenclatura: el repositorio se llama Swift-Qwen3.8-Flash-Next mientras que la model card se titula Swift 1.5 Qwen3.8-Flash-Next, y aparece otra familia (Swift-Qwen3.8-27B) con nombre parecido. Conviene verificar la version exacta antes de desplegar.
- Nota del autor: existe un Swift 3.8 Flash Next en desarrollo con hasta un -53 % de uso de tokens de pensamiento, cifra inferior a la de esta version, lo que indica que la familia esta en evolucion activa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ukisai/Swift-Qwen3.8-Flash-Next
- Version GGUF: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-Flash-Next-GGUF
- Version GSQ-RCO GGUF: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Dataset de entrenamiento: https://huggingface.co/datasets/ukisai/Qwen3.8-27B-multi-turn-agent-sft
- Anuncio en el blog del autor: https://ukisai.com/news/introducing-swift
- Pagina de productos de UkisAI: https://ukisai.com/products/swift
- Catalogo de modelos: https://ukisai.com/models
- Demo jugable del ejemplo: https://ukisai.com/swift-games/flash-next
- Web del autor: https://ukisai.com
- Ficha previa de la familia Swift: https://www.comingup.io/p/ukisaiswift-qwen38-27b
