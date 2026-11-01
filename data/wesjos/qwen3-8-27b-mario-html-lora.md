# wesjos/Qwen3.8-27B-Mario-HTML-LoRA

## Resumen

Qwen3.8-27B-Mario-HTML-LoRA es un adaptador LoRA publicado por el usuario wesjos sobre el modelo base Qwen/Qwen3.8-27B. Su proposito es convertir al modelo base en un generador de paginas HTML autocontenidas: en lugar de responder con largos bloques de Markdown, el modelo emite fragmentos HTML estructurados con clases CSS concretas (`.ai-view`, `.card`, `.modern-table`, entre otras) que un frontend puede renderizar directamente. El adaptador se activa mediante un system prompt fijo ("You are Mario-html...") que ya viene inyectado en el `chat_template.jinja` del repositorio.

Tecnicamente se trata de un QLoRA con rango 16 y alpha 32, con solo 10,5 millones de parametros entrenables (el 0,04% del total del modelo base) y un peso final de 42 MB en safetensors (21 MB en la version GGUF). El adaptador no modifica el razonamiento del modelo: la cadena de pensamiento fue enmascarada en la funcion de perdida, de modo que el tune solo altera el formato de salida, no el proceso de razonamiento subyacente.

Es relevante para desarrolladores que construyen interfaces conversacionales donde la respuesta del modelo debe integrarse como componente visual (dashboards, explicadores interactivos, paneles de datos) sin postprocesado de Markdown. La licencia Apache-2.0 y el reducido tamano del adaptador facilitan su despliegue sobre cualquier instancia del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (QLoRA) sobre transformer decoder-only Qwen3.8-27B |
| Parametros totales | 27B (modelo base); 10,5M entrenables en el adaptador (0,04%) |
| Parametros activos | no disponible (el modelo base no se documenta como MoE en la informacion proporcionada) |
| Longitud de contexto | 131.072 tokens (recomendado por el autor) |
| Tipos de cuantizacion | 4-bit NF4 con doble cuantizacion (bitsandbytes) en el ejemplo oficial; el adaptador GGUF de 21 MB se monta sobre cualquier GGUF del modelo base |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT, 42 MB); GGUF (adaptador, 21 MB) |

## Arquitectura y entrenamiento

El adaptador es un QLoRA de rango 16 y alpha 32 aplicado sobre el modelo base Qwen3.8-27B, un transformer decoder-only. El entrenamiento congela los pesos del modelo base y solo actualiza 10,5 millones de parametros, lo que explica el reducido tamano del artefacto (42 MB en safetensors). El autor indica que la cadena de pensamiento del modelo fue enmascarada durante el calculo de la perdida, de forma que el adaptador aprende exclusivamente el estilo de escritura HTML y no altera el comportamiento de razonamiento del modelo base.

La innovacion principal no es arquitectonica sino de formato: el adaptador impone una convencion de marcado HTML basada en clases CSS (`.ai-view`, `.summary`, `.lead`, `.card`, `.modern-table`) que un WebUI incluido en el repositorio interpreta y renderiza en vivo. El disparador es un system prompt duro que ya esta integrado en el `chat_template.jinja` del repositorio; si el usuario deja el campo de sistema vacio, se aplica automaticamente, y si proporciona uno propio, este prevalece. No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generacion de paginas HTML completas y autocontenidas con estructura semantica (titulos, tarjetas, tablas, callouts, SVG inline).
- Renderizado de explicaciones visuales: el autor documenta ejemplos de una explicacion de la funcion sigmoide con formula, grafica SVG y tabla de referencia, y de una ilustracion de un perezoso con panel de pensamiento y tarjetas de datos.
- Conservacion de la cadena de razonamiento del modelo base con control de esfuerzo (`reasoning_effort`: low, medium, high, xhigh), aunque el autor advierte que `xhigh` no es adecuado para este adaptador.
- Generacion de codigo SVG inline dentro de las paginas HTML.
- Soporte de conversacion multiturno a traves del chat template modificado.
- Capacidades multilingues limitadas a en y zh segun la model card.
- No se documenta soporte de tool calling, function calling ni comportamiento agentico especifico en la informacion proporcionada.
- El WebUI del repositorio incluye un boton "Add Image" que requiere `--mmproj` en el backend, lo que sugiere soporte de entrada de imagen, aunque no se detalla en la model card.

## Casos de uso

- Explicadores visuales interactivos: el modelo genera una pagina HTML con tarjetas, formulas y graficas SVG a partir de una pregunta conceptual, lo que permite construir asistentes educativos que muestran contenido renderizado en lugar de texto plano.
- Dashboards y paneles de datos generados dinamicamente: con la convencion `.modern-table` y `.card`, el modelo puede producir tablas comparativas y bloques de metricas que un frontend integra sin postprocesado.
- Documentacion tecnica con formato enriquecido: la capacidad de generar estructuras con multiples secciones `h2`, tablas y callouts lo hace util para generar guias y referencias que se publican directamente como HTML.
- Prototipado rapido de interfaces: el adaptador permite pasar de una descripcion en lenguaje natural a un fragmento HTML renderizable, lo que acelera la creacion de maquetas y demos de UI.
- Integracion en un WebUI de chat con renderizado en vivo: el repositorio incluye un WebUI que interpreta las clases CSS y muestra la pagina en el panel derecho, adecuado para entornos de demostracion y evaluacion interna.
- Generacion de contenido visual para informes: las tarjetas y callouts permiten producir resumenes visuales con estructura consistente para su insercion en informes o intranets.
- Despliegue ligero sobre el modelo base existente: al ser un adaptador de 42 MB (o 21 MB en GGUF), se puede montar sobre una instancia ya desplegada de Qwen3.8-27B sin duplicar los pesos del modelo, lo que simplifica la experimentacion en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente documenta mediciones cualitativas de formato:

| Prompt (sin instrucciones de formato) | Resultado observado |
|---|---|
| "Explain how neural networks learn, with a visual summary and a comparison table." | `.ai-view` + 5 tarjetas + 3 tablas |
| "Build a page introducing black holes" | `.ai-view` + 13 tarjetas + 2 tablas + 7 encabezados `h2` |

El autor menciona ademas un rendimiento de aproximadamente 42 tokens por segundo sobre el modelo base de 27B durante la grabacion de la demo, con 2.448 tokens generados.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el ejemplo oficial carga el modelo base en 4-bit NF4 con bitsandbytes y `device_map="auto"`, lo que reduce los requisitos respecto a la carga en bfloat16.
- GPU recomendadas: no especificadas por el autor; el ejemplo de transformers con cuantizacion 4-bit esta pensado para ejecucion con `device_map="auto"`, lo que permite repartir el modelo entre varias GPU.
- Cabe en GPU de consumo: no confirmado en la informacion proporcionada; el modelo base tiene 27B parametros, por lo que en 4-bit requiere del orden de 14-16 GB solo para los pesos, sin contar cache KV para el contexto de 131.072 tokens recomendado.
- Opciones de despliegue: transformers + PEFT (ejemplo oficial), llama.cpp con el adaptador GGUF de 21 MB montado sobre cualquier GGUF del modelo base, y el WebUI incluido en el repositorio (puerto configurable via `WEBUI_PORT`, `API_URL` apuntando al backend).
- Latencia y throughput: el autor reporta aproximadamente 42 tok/s sobre el modelo base de 27B en la demo, con 2.448 tokens generados por turno.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. El adaptador es especifico del modelo base Qwen3.8-27B y no se han publicado comparaciones con otras LoRA de generacion HTML ni con modelos especializados en generacion de UI. Se indica "no disponible".

## Limitaciones y advertencias

- El disparador es duro: sin el system prompt "You are Mario-html..." el modelo revierte al comportamiento normal del base de 27B y responde con Markdown extenso en lugar de HTML renderizado.
- El nivel de razonamiento `xhigh` no es adecuado para este adaptador: el autor advierte que consume mas de 20.000 tokens y trunca la pagina generada. El valor por defecto del template es `medium`.
- Desactivar el razonamiento (`enable_thinking: false`) produce menos de 90 tokens de pensamiento pero el formato puede desviarse ocasionalmente.
- El contexto recomendado es de 131.072 tokens porque `xhigh` consume entre 8.000 y 10.000 tokens por turno; con contextos menores el adaptador puede truncar la salida.
- Idiomas limitados a ingles y chino segun la model card; no se documenta soporte de castellano.
- No se documentan sesgos conocidos ni tasas de alucinacion especificas en la informacion proporcionada.
- La licencia Apache-2.0 permite uso comercial, pero el adaptador depende del modelo base Qwen3.8-27B, cuyos terminos deben verificarse por separado.
- El adaptador modifica el `chat_template.jinja`, por lo que es necesario cargar el tokenizador desde el repositorio del adaptador (`AutoTokenizer.from_pretrained(ADAPTER)`) y no desde el modelo base, para obtener el template modificado.
- El adaptador tiene solo 37 descargas y 0 likes en el momento de la consulta, lo que indica una validacion comunitaria muy limitada.

## Enlaces

- Repositorio HuggingFace del adaptador: https://huggingface.co/wesjos/Qwen3.8-27B-Mario-HTML-LoRA
- Version GGUF del adaptador: https://huggingface.co/wesjos/Qwen3.8-27B-Mario-HTML-LoRA-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Demo en video (28 s): https://huggingface.co/wesjos/Qwen3.8-27B-Mario-HTML-LoRA/resolve/main/demos/demo.mp4
- Poster de la demo: https://huggingface.co/wesjos/Qwen3.8-27B-Mario-HTML-LoRA/resolve/main/demos/demo-poster.jpg
