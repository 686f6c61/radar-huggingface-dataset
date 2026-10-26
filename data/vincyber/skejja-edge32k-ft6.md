# vincyber/skejja-edge32k-ft6

## Resumen

Skejja edge32k-ft6 es un modelo de decisión («System One») multilingüe y de pequeño tamaño publicado por el desarrollador vincyber. No genera texto: recibe un estado (texto libre o JSON) y un conjunto de preguntas tipadas, y devuelve en un único forward pass probabilidades calibradas para tres tipos de decisión: Choice (distribución sobre opciones cerradas), Noul (probabilidad de una respuesta sí/no) y Score (posición en una escala ordinal, implementada como un Choice sobre los niveles). Con 57,3 millones de parámetros (44,7 M sin la lookup de embeddings), está pensado para ejecutarse en CPU modestas, incluida una Raspberry Pi, con un consumo de RAM en torno a 200 MB.

El modelo deriva de knowledgator/gliclass-multilang-edge (Apache-2.0, 143 M), al que se le ha recortado el vocabulario a 32.768 tokens para cubrir inglés, italiano, español, alemán y francés, y se ha ajustado sobre el dataset mteb/amazon_massive_intent. Se distribuye exclusivamente en formato ONNX (fp32, int8 weight-only e int8 dinámica) y expone una API compatible con `POST /v1/systemone`, de modo que un cliente existente puede migrar cambiando solo la URL.

Su relevancia está en el nicho: sustituir llamadas a LLM generativos en decisiones de enrutado, filtrado o sí/no dentro de pipelines de agentes y asistentes de voz, con latencias de 182–380 ms en una Raspberry Pi 4 y sin salida de datos del dispositivo. Es un modelo muy reciente (creado el 26 de octubre de 2026) y sin tracción pública todavía (0 descargas, 0 likes en HuggingFace), por lo que debe evaluarse con cautela antes de llevarlo a producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder de clasificación zero-shot (derivado de GLiClass), sin cabecera generativa; la familia exacta del encoder no se detalla en la información disponible |
| Parametros totales | 57,3 M (44,7 M sin la lookup de embeddings) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible; el servidor trunca por defecto entradas de más de 512 tokens y se han medido entradas de hasta 1.023 tokens |
| Tipos de cuantizacion | fp32, int8 weight-only e int8 dinámica (esta última para CPU ARM sin dot-product) |
| Idiomas soportados | inglés, italiano, español, alemán y francés (entrenados y medidos) |
| Licencia | Apache-2.0 (atribuciones en el fichero `NOTICE`) |
| Formato de pesos | ONNX (`.onnx` + `.onnx.data`), más `tokenizer.json` y `calibration.json`; se distribuye en archivos `.tar.gz` con `SHA256SUMS` |
| Vocabulario | 32.768 tokens (recortado desde el modelo base para los cinco idiomas) |
| Version | v0.1.0 (paquete Skejja 0.1.0) |
| Tamano del repositorio | 0,4 GB |
| Libreria / runtime | onnxruntime |
| Pipeline declarado | zero-shot-classification |
| Modelo base | knowledgator/gliclass-multilang-edge (Apache-2.0, 143 M) |
| Dataset de ajuste | mteb/amazon_massive_intent (MASSIVE, CC BY 4.0) |

## Arquitectura y entrenamiento

La arquitectura es la de un encoder transformer de clasificación zero-shot heredado de GLiClass, adaptado a un paradigma de decisión tipada en lugar de generación. La innovación principal no está en el encoder, sino en la interfaz: el modelo puntúa opciones cerradas y preguntas sí/no contra un estado textual, y devuelve probabilidades calibradas por temperatura (`calibration.json` incluido en el paquete). El vocabulario se redujo a 32.768 tokens para los cinco idiomas soportados, lo que explica que un modelo base de 143 M quede en 57,3 M de parámetros totales.

El ajuste se realizó sobre el benchmark propio del autor, construido a partir de MASSIVE: 2.000 preguntas Choice con 8 opciones y 2.000 preguntas sí/no en cinco idiomas, con cuatro escenarios de intención («unseen») reservados fuera del entrenamiento. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (poco probables en un modelo de clasificación de este tamaño). Sí se documenta una calibración por pregunta con 64 ejemplos (few-shot) que mejora sustancialmente el comportamiento sobre intenciones no vistas. La verificación de exportación cuantizada reporta una concordancia con fp32 del 99,3 % (int8) y 96,7 % (int8 dinámica) en la opción Choice top-1, y del 98,3 % y 97,3 % en la decisión sí/no.

## Capacidades

- Decisión tipo Choice: distribución de probabilidad sobre un conjunto cerrado de opciones descritas en lenguaje natural (por ejemplo, destinos de enrutado o acciones posibles).
- Decisión tipo Noul (sí/no): probabilidad calibrada de que se cumpla una condición formulada como «Does the user want to <concrete action>?».
- Decisión tipo Score: posición en una escala ordinal, implementada como un Choice sobre los niveles de la escala.
- Entrada de estado en texto libre o JSON, en cualquiera de los cinco idiomas; las descripciones de opciones funcionan mejor en inglés.
- Multilingüe: inglés, italiano, español, alemán y francés, con calidad medida por idioma.
- Calibración few-shot: ajuste por pregunta con 64 ejemplos, que rebaja el ECE de 0,150 a 0,041 en intenciones no vistas.
- Inferencia en un único forward pass, sin decodificación autoregresiva ni muestreo.
- API HTTP compatible con `POST /v1/systemone`, además de API Python (`skejja.SystemOne`), servidor MCP para agentes, Dockerfile y un script autónomo (`skejja_infer.py`) que solo requiere `onnxruntime`, `tokenizers` y `numpy`.
- Ejecución en navegador con onnxruntime-web (demo pública, sin envío de datos a servidor).
- No soporta generación de texto, tool calling generativo, visión, audio ni razonamiento multi-paso.

## Casos de uso

- Enrutado de intenciones en asistentes de voz: el modelo recibe la transcripción como estado y una lista de destinos como opciones Choice, y devuelve la distribución en un único paso. El autor reporta 0,589 de acierto sobre 124 peticiones reales con etiqueta inequívoca y descripciones en inglés, lo que lo hace viable como primera etapa de un pipeline, no como clasificador final de alta precisión.
- Guardarraíl o «handoff» antes de llamar a un LLM grande: decidir si el turno debe derivarse a un modelo mayor evita coste y latencia en el caso común. El propio autor reporta AUROC 0,79 en esta tarea con entradas de más de 512 tokens y lo califica de insuficiente, por lo que solo es recomendable con umbrales conservadores y revisión humana.
- Clasificación zero-shot de tickets de soporte: con opciones del tipo «facturación», «incidencia técnica» o «baja», el modelo clasifica tickets en español, italiano, alemán, francés e inglés sin reentrenamiento, con 0,873 de accuracy global en el benchmark del autor.
- Automatización de acciones concretas (correo y calendario): preguntas sí/no del estilo «Does the user want to send this email?» o «Does the user want to create a calendar event?», con AUROC 0,86–0,87 en peticiones reales, adecuadas para confirmar acciones antes de ejecutarlas.
- Domótica e IoT local: ejecución en Raspberry Pi 4 con 216–227 MB de RAM pico y 182 ms por decisión Choice de 8 opciones en 4 hilos, sin enviar audio ni texto a la nube.
- Enrutado de herramientas en agentes vía servidor MCP (`skejja mcp`): seleccionar qué herramienta de un conjunto cerrado invocar antes de que un LLM planifique, reduciendo el número de llamadas al modelo grande.
- Etiquetado ordinal: usar la decisión Score para graduar severidad (por ejemplo, prioridad de incidencias en tres o cinco niveles) con probabilidades calibradas en lugar de una etiqueta dura.
- Filtrado previo en pipelines de moderación o triaje: decidir sí/no si un contenido requiere revisión, con la ventaja de que el ECE de 0,038 permite fijar umbrales con significado probabilístico.

## Benchmarks y rendimiento

Todos los datos de calidad proceden del benchmark Skejja construido sobre MASSIVE (2.000 preguntas Choice de 8 opciones y 2.000 preguntas sí/no en cinco idiomas), medidos en PyTorch fp32.

| Metrica (MASSIVE, 5 idiomas) | edge32k-ft6 |
|---|---|
| Accuracy Choice, global / vistas / no vistas | 0,873 / 0,895 / 0,741 |
| Accuracy Choice por idioma (en / it / es / de / fr) | 0,893 / 0,875 / 0,878 / 0,850 / 0,868 |
| ECE de Choice (calibrado por temperatura) | 0,048 |
| AUROC / ECE sí-no en test | 0,961 / 0,038 |
| AUROC / ECE sí-no en intenciones no vistas, sin ejemplos | 0,840 / 0,150 |
| AUROC / ECE sí-no tras calibración por pregunta (64 ejemplos) | 0,902 / 0,041 |
| Accuracy Choice con opciones traducidas al idioma de la frase | 0,849 |

Comparación con otros modelos abiertos ejecutados por el autor sobre el mismo benchmark (zero-shot tal como se publican, calibración ajustada solo con los ficheros de calibración):

| Modelo | Parametros | Accuracy Choice | AUROC sí/no |
|---|---|---|---|
| Skejja edge32k-ft6 | 57,3 M | 0,873 | 0,961 |
| Laya multilingual | 322 M | 0,600 | 0,744 |
| GLiClass multilang edge (base) | 143 M | 0,547 | 0,697 |
| Julia 1 | 144 M | 0,514 | 0,503 |

El propio autor advierte que el benchmark está próximo a los datos de entrenamiento del modelo, de modo que la diferencia refleja para qué se construyó Skejja y no su habilidad general.

Rendimiento en hardware real (Raspberry Pi 4 de 4 GB, int8 dinámica, Choice de 8 opciones, 14 de octubre de 2026; la placa no tenía disipador y sufrió throttling térmico, por lo que las latencias son cotas superiores):

| Escenario | 1 hilo | 4 hilos |
|---|---|---|
| Choice (8 opciones) | 380 ms | 182 ms |
| Sí/no | 126 ms | 81 ms |

Coste por longitud de entrada en un hilo: 2,2 s y 203 MB a 255 tokens; 5,1 s y 246 MB a 511 tokens; 13,3 s y 398 MB a 1.023 tokens. RAM pico en las pruebas cortas: 216–227 MB.

El modelo card menciona además una evaluación zero-shot independiente («Jev», arXiv 2609.37…) cuyos resultados no aparecen completos en la información disponible.

## Requisitos de hardware

- RAM estimada para inferencia: 216–227 MB pico con int8 dinámica y Choice de 8 opciones; 203 MB a 255 tokens, 246 MB a 511 tokens y 398 MB a 1.023 tokens.
- Tamaño de artefactos: 208 MB el paquete int8 por defecto y 212 MB el fp32 (ambos en `.tar.gz`, incluyendo datos del grafo); repositorio completo de 0,4 GB.
- CPU: funciona en Raspberry Pi 4 de 4 GB; se recomienda la variante int8 dinámica en ARM sin dot-product y la int8 weight-only cuando exista soporte.
- GPU: no es necesaria. No hay latencias publicadas en A100, H100 ni RTX 4090 en la información disponible.
- Cabe en cualquier GPU de consumo, e incluso en placas SBC y navegadores (onnxruntime-web), al ser un modelo de 57,3 M de parámetros.
- Opciones de despliegue: `onnxruntime` en Python (vía `skejja`), servidor HTTP `skejja serve` con verificación de SHA-256, servidor MCP (`skejja mcp`), Dockerfile incluido y ejecución en navegador. No aplican vLLM, TGI, llama.cpp ni Ollama al no ser un modelo generativo.
- Throughput: no disponible de forma agregada; por decisión individual, 182–380 ms (Choice de 8 opciones) y 81–126 ms (sí/no) en Raspberry Pi 4.
- Advertencia térmica: en placas sin disipador se observó throttling, con lo que las cifras anteriores deben tratarse como límite superior.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy Choice (benchmark del autor) | AUROC sí/no | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Skejja edge32k-ft6 | 57,3 M | no disponible (truncado a 512 tokens por defecto) | 0,873 | 0,961 | Apache-2.0 | ONNX en HuggingFace, código en GitHub, demo en Spaces |
| GLiClass multilang edge (base) | 143 M | no disponible | 0,547 | 0,697 | Apache-2.0 | HuggingFace |
| Laya multilingual | 322 M | no disponible | 0,600 | 0,744 | no disponible | HuggingFace |
| Julia 1 | 144 M | no disponible | 0,514 | 0,503 | no disponible | HuggingFace |

La comparación debe leerse con la cautela que marca el propio autor: el benchmark está próximo a los datos de entrenamiento de Skejja, favoreciéndolo frente a los modelos genéricos ejecutados en zero-shot. En la tarea de enrutado sobre peticiones reales, su ventaja se reduce a 0,589 de acierto, muy por debajo del 0,873 del benchmark.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, explicaciones ni justificaciones; solo probabilidades sobre opciones o preguntas predefinidas.
- Sesgo de benchmark: el conjunto de evaluación está próximo a los datos de entrenamiento, según reconoce el autor; las cifras de 0,873 no son extrapolables a dominios arbitrarios.
- Rendimiento débil en datos reales de enrutado: 0,589 de acierto sobre 124 peticiones con etiqueta inequívoca y 0,62 en peticiones de sesión de software.
- Decisión de handoff a modelos mayores: AUROC 0,79 con entradas de más de 512 tokens, calificada por el autor como insuficiente para producción.
- Calibración frágil fuera de distribución: el ECE en intenciones no vistas sube a 0,150 sin ejemplos y solo baja a 0,041 aplicando calibración por pregunta con 64 ejemplos, lo que exige datos etiquetados por caso de uso.
- Sensibilidad al idioma de las opciones: las descripciones funcionan mejor en inglés; traducirlas al idioma de la frase baja la accuracy de 0,873 a 0,849.
- Sensibilidad a la formulación: las preguntas sí/no deben seguir el patrón de entrenamiento («Does the user want to <concrete action>?»); formulaciones distintas degradan el resultado.
- Longitud: el servidor trunca por defecto entradas de más de 512 tokens; a 1.023 tokens la latencia en Raspberry Pi sube a 13,3 s y la RAM a 398 MB.
- Cobertura lingüística limitada a cinco idiomas; no se ha entrenado ni medido en otros.
- Riesgo de alucinación bajo en el sentido generativo (no inventa texto), pero sí riesgo de sobreconfianza: las probabilidades están calibradas sobre la distribución de entrenamiento, no sobre el dominio del usuario.
- Licencia Apache-2.0, permisiva para uso comercial, con obligación de conservar las atribuciones del fichero `NOTICE` (incluye el modelo base y MASSIVE, CC BY 4.0).
- Madurez: versión v0.1.0, paquete no publicado aún en PyPI (instalación desde Git), 0 descargas y 0 likes; Traction nula y sin validación independiente completa.
- La información disponible está truncada al final del model card, por lo que faltan datos sobre la evaluación zero-shot independiente y sobre el número de tokens de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vincyber/skejja-edge32k-ft6
- Modelo base: https://huggingface.co/knowledgator/gliclass-multilang-edge
- Repositorio de código, benchmark y ficheros de resultados: https://github.com/vincyberx/skejja
- Demo en navegador (onnxruntime-web): https://huggingface.co/spaces/vincyber/skejja
- Dataset de evaluación y ajuste: https://huggingface.co/datasets/mteb/amazon_massive_intent
- Referencia de la evaluación independiente citada (identificador arXiv truncado en la información disponible: 2609.37…): no disponible
- Búsquedas web realizadas: los resultados obtenidos tratan sobre modelos de generación de vídeo y directorios genéricos de modelos, sin relación con este modelo; no aportan enlaces adicionales relevantes.
