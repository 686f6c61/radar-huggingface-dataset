# WebUniverse-NSL/Qwen3.5-WebUniverse-Text-grounded

## Resumen

Qwen3.5-WebUniverse-Text-grounded es un ajuste fino (fine-tune) del modelo Qwen/Qwen3.5-35B-A3B, publicado por el usuario WebUniverse-NSL en HuggingFace. Se trata de un modelo multimodal de tipo image-text-to-text orientado a tareas de desarrollo web, generacion de codigo y flujos de agentes, segun las etiquetas declaradas en el repositorio (code, agents, web-development, multimodal, conversational). El modelo cuenta con 35.107.181.936 parametros totales segun los pesos en safetensors y un tamano de repositorio de 70,2 GB, lo que es coherente con pesos almacenados en precision de 16 bits.

El modelo emplea una arquitectura etiquetada como qwen3_5_moe, es decir, una mezcla de expertos (MoE) heredada de su modelo base, cuya nomenclatura "35B-A3B" sugiere 35.000 millones de parametros totales y aproximadamente 3.000 millones de parametros activos por token. Esta configuracion permite un coste computacional por token propio de un modelo mucho mas pequeno, manteniendo la capacidad de representacion de un modelo de 35.000 millones de parametros, aunque con una huella de memoria correspondiente al total de parametros.

La relevancia de esta ficha radica en que se trata de una publicacion reciente (creada y actualizada en octubre de 2026) con cero descargas y cero likes en el momento de la consulta, sin model card detallada, sin licencia declarada y con acceso restringido (gated). Es, por tanto, un ajuste fino de nicho especializado en contenido web, cuyo interes practico depende de la validacion por parte del propio desarrollador. No se dispone de datos publicos de benchmarks, contexto soportado ni proceso de entrenamiento detallado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos); etiqueta qwen3_5_moe, derivada de Qwen/Qwen3.5-35B-A3B |
| Parametros totales | 35.107.181.936 (35,1 B) |
| Parametros activos | Aproximadamente 3 B, inferido de la nomenclatura "A3B" del modelo base; no confirmado en la informacion disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo contiene pesos en safetensors |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible; acceso restringido (gated), requiere aceptar condiciones en HuggingFace |
| Formato de pesos | safetensors (libreria transformers) |
| Tamano del repositorio | 70,2 GB |
| Modalidad | image-text-to-text (entrada de imagen y texto) |
| Modelo base | Qwen/Qwen3.5-35B-A3B (fine-tune) |
| Dataset de ajuste | dataset:webcraft-NSL/WebUniverse-Mix (segun etiquetas del repositorio) |

## Arquitectura y entrenamiento

La arquitectura declarada en las etiquetas del repositorio es qwen3_5_moe, lo que indica una mezcla de expertos (Mixture of Experts) con enrutamiento disperso. El modelo base, Qwen/Qwen3.5-35B-A3B, sigue la convencion de nomenclatura de la familia Qwen, donde "35B" hace referencia a los parametros totales y "A3B" a los parametros activos por token. Esto implica que, aunque el modelo almacena 35.107 millones de parametros, solo una fraccion reducida (del orden de 3.000 millones) se activa en cada paso de inferencia, lo que reduce el coste computacional respecto a un modelo denso equivalente. El pipeline declarado es image-text-to-text, de modo que el modelo incorpora un componente de codificacion visual junto al decodificador de lenguaje, aunque no se especifica la arquitectura concreta de dicho componente.

En cuanto al entrenamiento, la unica informacion disponible es que se trata de un fine-tune del modelo base y que se ha utilizado el dataset webcraft-NSL/WebUniverse-Mix, segun las etiquetas del repositorio. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o ajuste supervisado con instrucciones. Tampoco se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, destilacion u otras). Todos estos datos deberian considerarse "no disponibles" a falta de una model card completa.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a dialogos multi-turno segun la etiqueta conversational.
- Generacion y comprension de codigo, con enfasis declarado en desarrollo web (etiquetas code y web-development).
- Procesamiento multimodal de entrada image-text-to-text: el modelo acepta imagenes junto a texto, lo que permite tareas como interpretacion de capturas de pantalla, maquetas o diagramas web.
- Orientacion a agentes: la etiqueta agents indica que el ajuste esta pensado para flujos de razonamiento multi-paso y ejecucion de tareas, aunque no se detalla soporte explicito de tool calling o function calling en la informacion disponible.
- Capacidad de "grounding" textual, sugerida por el sufijo Text-grounded del nombre del modelo, presumiblemente orientada a vincular las respuestas con contenido textual de referencia en el contexto web; no se especifica el mecanismo tecnico.
- Compatibilidad declarada con endpoints (etiqueta endpoints_compatible), lo que sugiere que puede desplegarse mediante infraestructura de inferencia compatible con la API de transformers/endpoints.
- Idiomas: unicamente ingles declarado; no se documenta soporte multilingue.

## Casos de uso

- Asistente de desarrollo front-end: el modelo puede recibir una captura de pantalla de un diseno o maqueta y generar el codigo HTML/CSS correspondiente, aprovechando su naturaleza image-text-to-text y su especializacion en web-development.
- Generacion de codigo en pipelines de integracion continua: dado que las etiquetas incluyen code y agents, puede integrarse en flujos automatizados de generacion de fragmentos de codigo, tests o revisiones, siempre que el desarrollador valide la salida antes de fusionarla.
- Migracion y refactorizacion de componentes web: el modelo puede analizar fragmentos de codigo junto con una descripcion textual del objetivo y proponer una version refactorizada, apoyandose en su contexto de instrucciones conversacionales.
- Explicacion de interfaces a partir de imagenes: en herramientas de documentacion o accesibilidad, puede describir los elementos de una captura de pantalla de una aplicacion web y vincularlos con el texto asociado (grounding textual).
- Generacion de documentacion tecnica: a partir de capturas de interfaz y notas breves, puede redactar descripciones de funcionalidades y guias de uso en ingles.
- Prototipado rapido de paginas: en un flujo de agente, el modelo puede iterar sobre bocetos visuales y producir variantes de estructura de pagina, reduciendo el tiempo de exploracion inicial de diseno.
- Automatizacion de tareas de scraping semantico: combinando entrada visual y textual, puede interpretar la estructura de una pagina renderizada y extraer informacion relevante en un formato estructurado.
- Soporte interno a equipos de producto: puede responder consultas sobre componentes web concretos a partir de imagenes y documentacion adjunta, en un contexto de chat multi-turno.

En todos los casos, conviene tener en cuenta que se trata de un modelo ajustado unicamente para ingles y sin datos publicos de rendimiento, por lo que su uso en produccion deberia ir precedido de una evaluacion propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El repositorio no incluye tabla de resultados para MMLU, HumanEval, GSM8K, MMMU, SWE-bench ni ninguna otra prueba estandar, y tampoco se aportan evaluaciones comparativas con el modelo base Qwen/Qwen3.5-35B-A3B. Cualquier cifra de rendimiento deberia obtenerse mediante evaluacion directa por parte del usuario.

## Requisitos de hardware

- Peso de los pesos en precision de 16 bits: aproximadamente 70,2 GB, coherente con el tamano del repositorio y con los 35,1 B de parametros. Se trata de una estimacion aritmetica derivada del numero de parametros.
- VRAM estimada para inferencia en BF16/FP16: en torno a 70 GB solo para pesos, mas el espacio de cache KV y activaciones, por lo que se necesitan GPU de clase A100 80 GB, H100 80 GB o configuraciones multi-GPU.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 35 GB de pesos, lo que encaja en una A100 40 GB o en dos GPU de 24 GB.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 18-20 GB de pesos, lo que permitiria ejecucion en una unica GPU de consumo como RTX 4090 o RTX 3090 de 24 GB, con margen limitado para el contexto.
- GPU de consumo: solo viable con cuantizacion agresiva (4 bits) y contextos cortos; no es viable en precision completa en GPU de consumo.
- Opciones de despliegue: la libreria declarada es transformers y el formato es safetensors. No se han publicado conversiones a GGUF en la informacion disponible, por lo que el uso con llama.cpp u Ollama no esta confirmado. El despliegue con vLLM o TGI depende de que dichas herramientas soporten la arquitectura qwen3_5_moe concreta, extremo no verificado.
- Latencia y throughput: no disponibles. Con parametros activos del orden de 3 B, el coste por token deberia ser comparativamente bajo en terminos de computo, pero el cuello de botella previsible es el ancho de banda de memoria para cargar los pesos del MoE.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|---|
| Qwen3.5-WebUniverse-Text-grounded | 35,1 B | ~3 B (inferido) | no disponible | no disponible | Gated en HuggingFace | Sin datos publicos |
| Qwen/Qwen3.5-35B-A3B (modelo base) | 35 B (aprox.) | ~3 B (inferido) | no disponible | no disponible en esta ficha | Publico en HuggingFace | Sin datos en la informacion disponible |
| Otros fine-tunes de Qwen3.5-35B-A3B | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificables de benchmarks ni de especificaciones completas de alternativas en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa rigurosa. Se recomienda consultar la model card del modelo base y de otras variantes de la familia Qwen para obtener cifras contrastadas.

## Limitaciones y advertencias

- Ausencia de model card detallada: no se documentan datos de entrenamiento, hiperparametros, composicion del dataset ni proceso de alineacion, lo que dificulta evaluar su comportamiento.
- Sin benchmarks publicos: no existen resultados verificables de MMLU, HumanEval, GSM8K ni pruebas multimodales, por lo que su rendimiento real es desconocido.
- Sesgos: al no documentarse el dataset de ajuste (webcraft-NSL/WebUniverse-Mix) ni su procedencia, no es posible evaluar sesgos potenciales de genero, raza, cultura o idioma.
- Riesgo de alucinacion: no cuantificado. Como todo modelo generativo ajustado, puede producir codigo, referencias o descripciones inexactas, especialmente en tareas de grounding visual.
- Limitacion idiomatica: el modelo solo declara soporte para ingles. Su uso en castellano u otros idiomas no esta garantizado y podria degradar la calidad de las respuestas.
- Licencia no disponible: al no especificarse licencia, no puede confirmarse el uso comercial. Ademas, el acceso esta restringido (gated), lo que exige aceptar condiciones en HuggingFace y puede imponer restricciones adicionales derivadas del modelo base.
- Riesgo de sobreajuste al dominio web: al ser un fine-tune especializado, su comportamiento fuera del ambito de desarrollo web, codigo y agente podria ser inferior al del modelo base.
- Estado del repositorio: cero descargas y cero likes en el momento de la consulta, sin evidencia de validacion por parte de la comunidad ni de mantenimiento posterior.
- Fecha de publicacion futura respecto al conocimiento habitual disponible: los metadatos indican creacion en octubre de 2026, lo que implica que no existen analisis independientes previos.
- Requisitos de memoria elevados: a pesar de tener pocos parametros activos, la huella de memoria corresponde a 35,1 B de parametros, lo que limita el despliegue en hardware de consumo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/WebUniverse-NSL/Qwen3.5-WebUniverse-Text-grounded
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Dataset de ajuste (segun etiquetas): https://huggingface.co/datasets/webcraft-NSL/WebUniverse-Mix
- Paper, blog o repositorio adicional: no disponibles en la informacion proporcionada.
