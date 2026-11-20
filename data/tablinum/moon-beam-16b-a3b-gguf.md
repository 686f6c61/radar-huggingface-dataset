# tablinum/Moon-Beam-16B-A3B-GGUF

## Resumen
Moon-Beam-16B-A3B-GGUF es la distribucion en formato GGUF del modelo Moon-Beam-16B-A3B, desarrollado por el usuario tablinum y publicado en Hugging Face. Se trata de un ajuste fino (fine-tuning) del modelo Moonlight-16B-A3B-Instruct de Moonshot AI, una arquitectura Mixture-of-Experts (MoE) con 15.960.110.208 parametros totales y aproximadamente 3.000 millones de parametros activos por token. El objetivo del ajuste es que el modelo lea y aproveche correctamente los pasajes recuperados de una biblioteca de conocimiento externa denominada Tablinum-2 engram, respondiendo a partir de ellos cuando contienen la respuesta y admitiendo desconocimiento cuando no la contienen.

El modelo no incorpora conocimiento factual propio mas alla de su entrenamiento: su valor anadido es la calibracion. Segun la model card, con el engram recuperado el modelo acierta de forma similar a su base, pero deja de inventar cuando los pasajes no sostienen la respuesta. Esto lo convierte en una pieza para sistemas de retrieval-augmented generation (RAG) orientados a consulta factual offline, no en un asistente general con acceso a informacion en vivo. La licencia es MIT, lo que facilita su uso comercial y su redistribucion.

El repositorio GGUF ocupa 23,8 GB e incluye cuantizaciones, entre ellas una build IQ3 de aproximadamente 8 GB que el autor emplea como referencia en sus evaluaciones. El modelo esta pensado para ejecutarse con llama.cpp y ofrece compatibilidad con endpoints de tipo OpenAI a traves de herramientas del propio autor. Su idioma declarado es unicamente el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) basada en Moonlight-16B-A3B-Instruct (etiquetas deepseek_v3, moe) |
| Parametros totales | 15.960.110.208 (aprox. 16B) |
| Parametros activos | Aproximadamente 3B por token (denominacion A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF; se menciona explicitamente una build IQ3 de aprox. 8 GB; el resto de niveles no se detalla |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp); los pesos BF16 originales estan en el repo base tablinum/Moon-Beam-16B-A3B |

## Arquitectura y entrenamiento
El modelo parte de Moonlight-16B-A3B-Instruct, un transformer con capas Mixture-of-Experts (las etiquetas del repositorio lo asocian a la familia deepseek_v3). La cifra de parametros totales confirmada por safetensors es de 15.960.110.208, con unos 3.000 millones activos por token, lo que reduce el coste computacional de inferencia frente a un modelo denso del mismo tamano total. El ajuste fino se realizo sobre el modelo instruct base y su proposito declarado es ensenar al modelo a utilizar el engram Tablinum-2, una biblioteca de conocimiento compuesta por 26 tablas de texto de referencia (Wikipedia, legislacion y normativa, documentacion de software, preguntas y respuestas de reparacion y bricolaje, filosofia, psicologia, libros de texto abiertos y articulos de investigacion).

La model card indica que el entrenamiento anade calibracion, no conocimiento: con los pasajes en mano el modelo encuentra la respuesta con una frecuencia similar a la de su base, pero deja de adivinar cuando los pasajes no la contienen. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset de ajuste ni si se emplearon tecnicas de RLHF o DPO. Tampoco se documentan innovaciones de decodificacion especulativa ni mecanismos de atencion alternativos. El repositorio incluye la etiqueta imatrix, lo que sugiere el uso de una matriz de importancia para la cuantizacion GGUF.

## Capacidades
- Generacion de texto conversacional en ingles con soporte de plantilla de chat (etiqueta conversational).
- Lectura y explotacion de pasajes recuperados: responde a partir de ellos cuando contienen la respuesta y declara desconocimiento cuando no.
- Calibracion ante ausencia de evidencia: reduce las respuestas inventadas en consultas factuales cuando los pasajes no sostienen una respuesta.
- Consulta factual y procedimental: nombres, fechas, definiciones, contenido de leyes y normativas, funcionamiento de APIs y comandos.
- Razonamiento basico y matematicas de un solo paso; el propio autor advierte que el razonamiento matematico multi-paso es debil (GSM8K 71,8%).
- Integracion con endpoints compatibles con la API de OpenAI mediante llama-server o mlx_lm.server, con el paso de recuperacion anadido.
- No soporta tool calling ni function calling: la model card indica explicitamente que Moon-Beam 16B no llama a herramientas.
- No soporta agentes multi-paso ni acciones sobre paginas web; esas capacidades se anuncian para Moon-Beam 8B, en entrenamiento.
- No dispone de vision, audio ni modo thinking.
- Multilingue: limitado al ingles segun la metadata del repositorio.

## Casos de uso
- Consulta factual offline: desplegar el modelo junto a la biblioteca Tablinum-2 en una maquina local para responder preguntas sobre nombres, fechas y definiciones sin conexion a internet, aprovechando que el modelo fue ajustado para leer los pasajes recuperados y admitir cuando no los tiene.
- Asistencia sobre normativa y legislacion: consultar el contenido de leyes y regulaciones incluidas en las tablas del engram, con la ventaja de que el modelo tiende a citar lo que dicen los pasajes en lugar de improvisar, lo que reduce el riesgo en entornos donde la trazabilidad de la fuente es critica.
- Soporte a desarrolladores sobre documentacion de software: responder dudas sobre APIs y comandos a partir de la documentacion indexada, integrado en un endpoint compatible con OpenAI para usarse desde editores o herramientas internas.
- Reparaciones y bricolaje en el hogar: responder preguntas practicas de reparacion, cocina y jardineria a partir de preguntas y respuestas reales de comunidad incluidas en el engram, en un escenario de uso domestico sin dependencia de la nube.
- Estudio e investigacion asistida: acompanar la lectura de libros de texto abiertos y articulos de investigacion resumiendo lo que dicen las fuentes y senalando explicitamente los huecos de informacion, gracias a su calibracion.
- Base para aplicaciones RAG propias: servir como motor de generacion en un pipeline de recuperacion propio, usando la build IQ3 de 8 GB para entornos con VRAM limitada y la API local en http://127.0.0.1:8080/v1 que ofrece la herramienta terrabeam.
- Memoria persistente en asistentes personales: la opcion --memory long-term de terrabeam permite anadir memoria persistente sobre el modelo para conversaciones de referencia recurrente, manteniendo el modelo como capa de redaccion sobre los pasajes recuperados.

## Benchmarks y rendimiento
Los datos proceden de la model card del autor. El indice se calcula como 100 x (aciertos - fallos) / n, de modo que un fallo resta tanto como suma un acierto. Todas las variantes se evaluaron con la build IQ3 y fueron calificadas por Claude Haiku contra las respuestas gold, emparejadas sobre las mismas preguntas. Ninguna de las preguntas ni pasajes recuperados se uso en entrenamiento.

| Evaluacion (IQ3, emparejado) | Moonlight sin entrenar (sin engram → con engram) | Moon-Beam (sin engram → con engram) | Aciertos / fallos con engram |
|---|---:|---:|---:|
| EngramBench 502, 26 tablas | −58,6 → +65,1 | −46,8 → +73,3 | 406 / 38 (sin entrenar: 406 / 79) |
| SimpleQA-verified 1000 | −88,6 → +17,7 | −36,0 → +34,9 | 504 / 155 (sin entrenar: 548 / 371) |
| AA-Omniscience test 400 | −75,5 → −42,5 | −57,2 → −16,5 | 78 / 144 (sin entrenar: 96 / 266) |

Dato adicional de la model card: GSM8K 71,8% para Moon-Beam 16B. No se han publicado en la informacion disponible resultados de MMLU ni HumanEval.

## Requisitos de hardware
- VRAM estimada: la build IQ3 ocupa aproximadamente 8 GB, por lo que requiere del orden de 8-10 GB de VRAM o memoria unificada para inferencia comoda; el repositorio completo ocupa 23,8 GB e incluye otras cuantizaciones de mayor precision cuyos tamanos no se detallan.
- GPU recomendadas: no disponible de forma explicita en la informacion proporcionada. Por el tamano de la build IQ3, una GPU consumer de 8-12 GB (gama RTX xx70 o superior) deberia poder alojarla; una RTX 4090 (24 GB) permite ademas cargar cuantizaciones mayores.
- Cabe en GPU consumer: si, al menos con la build IQ3 de 8 GB; el caracter MoE con 3B activos reduce el coste de computo por token frente a un denso de 16B.
- Opciones de despliegue: llama.cpp (libreria declarada), llama-server con API compatible con OpenAI, mlx_lm.server, y la herramienta terrabeam del autor, que selecciona el archivo adecuado, descarga la build de llama.cpp correspondiente y sirve la API en http://127.0.0.1:8080/v1. terrabeam tambien admite proxy sobre Ollama, LM Studio o vLLM con --upstream y --format tablinum.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares
La informacion proporcionada solo permite comparar contra el modelo base del que deriva. No se dispone de datos de otros modelos comparables de la misma categoria.

| Modelo | Parametros totales / activos | Contexto | EngramBench (con engram, indice) | SimpleQA (con engram, indice) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Moon-Beam 16B-A3B | 16B / ~3B | no disponible | +73,3 | +34,9 | MIT | GGUF en HF y pesos BF16 |
| Moonlight-16B-A3B-Instruct (base sin entrenar) | 16B / ~3B | no disponible | +65,1 | +17,7 | MIT | HF |
| Otros modelos comparables | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias
- No accede a informacion en vivo: no navega por la web ni consulta noticias, precios o meteorologia. Solo conoce su entrenamiento y los pasajes que se le entregan.
- No soporta tool calling ni agentes: el modelo no llama a herramientas; las capacidades de acciones web y thinking se reservan a Moon-Beam 8B, aun en entrenamiento.
- Razonamiento matematico multi-paso debil: GSM8K 71,8%; el autor recomienda usar el modelo base o una calculadora para estos casos.
- Comportamiento autorreferencial erroneo: ante preguntas como "puedes buscar en la web?" o "puedes ejecutar este codigo?", el modelo a veces responde que si, aunque no puede. El autor probo prompts de sistema que lo corrigen y todos reducian la precision en hechos faciles (20 de 24 aciertos con el prompt original frente a 13-17 con los nuevos), por lo que la plantilla de chat se mantiene sin cambios.
- Dependencia de la biblioteca externa: sin el engram Tablinum-2 (descarga separada), el modelo es un chat general cuidadoso, no el escritorio de referencia descrito; la instalacion conjunta en un solo comando esta anunciada para la proxima version.
- Idioma: solo ingles declarado; no se garantiza calidad en castellano ni en otros idiomas.
- Uso profesional: no debe emplearse para decisiones medicas, legales o financieras; puede explicar lo que dice una fuente, pero no sustituye a un profesional.
- Riesgo de alucinacion: reducido pero no eliminado; en AA-Omniscience test 400 el indice con engram sigue siendo negativo (−16,5) y se registran 144 fallos frente a 78 aciertos.
- Sesgos: no se documentan sesgos especificos en la informacion disponible.
- Licencia MIT: permite uso comercial y modificacion, pero conviene verificar las obligaciones de atribucion y las condiciones del modelo base Moonlight-16B-A3B-Instruct (tambien MIT) antes de redistribuir.

## Enlaces
- Repositorio GGUF: https://huggingface.co/tablinum/Moon-Beam-16B-A3B-GGUF
- Pesos BF16: https://huggingface.co/tablinum/Moon-Beam-16B-A3B
- Dataset Tablinum-2 engram: https://huggingface.co/datasets/tablinum/tablinum-2
- Coleccion Moon-Beam: https://huggingface.co/collections/tablinum/moon-beam-6ae64ea51cef0d52d1461fc2
- Coleccion Lite-Beam: https://huggingface.co/collections/tablinum/lite-beam-6ad61ee3f54fc02b5d33af93
- Modelo base Moonlight-16B-A3B-Instruct: https://huggingface.co/moonshotai/Moonlight-16B-A3B-Instruct
- Repositorio terrabeam: https://github.com/chadstthomas-svg/terrabeam
- Documentacion de harnesses de terrabeam: https://github.com/chadstthomas-svg/terrabeam/blob/master/docs/harnesses.md
