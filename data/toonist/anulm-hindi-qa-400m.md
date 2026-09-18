# toonist/AnuLM-Hindi-QA-400M

## Resumen

AnuLM-Hindi-QA-400M es un ajuste fino supervisado del modelo base AnuLM-Base-400M, publicado por el usuario toonist en HuggingFace. Se trata de un modelo generativo de texto especializado en responder preguntas de tipo enciclopedico en hindi, ingles y Python: dado un enunciado como `X क्या है?`, `What is X?` o una firma de funcion, devuelve una o dos frases con formato de definicion. No es un asistente conversacional ni un chatbot, sino un respondedor de preguntas de un unico turno entrenado sobre pares pregunta-respuesta extraidos de parrafos introductorios de Wikipedia y de docstrings de Python.

Tecnicamente es un transformer de tipo Mixture of Experts (MoE) con 20 capas, dimension oculta de 1.024 y atencion con Grouped Query Attention (16 cabezas de consulta y 4 de clave-valor). Cuenta con 24 expertos enrutados de 192 unidades con enrutamiento top-4 y equilibrio sin perdida auxiliar, mas ventana deslizante de 256 tokens en las capas 0 a 9. El total asciende a 397,7 millones de parametros, de los cuales solo 173,5 millones estan activos por token, lo que lo situa en la categoria de modelos pequenos y eficientes en computo.

Su relevancia actual es doble. Por un lado, es un ejemplo de modelo pequeno orientado a una lengua con poca representacion en la IA abierta como el hindi, con licencia CC BY-SA 4.0 y pesos en bfloat16. Por otro, ilustra una tendencia creciente: arquitecturas MoE de menos de 500 millones de parametros que buscan reducir el coste de inferencia manteniendo una capacidad de parametros total decente. Sus limitaciones son, sin embargo, notables: contexto de solo 512 tokens, sin soporte en `transformers` y ausencia total de resultados de benchmarks publicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con GQA (20 capas, hidden 1.024, 16 cabezas Q / 4 KV) |
| Parametros totales | 397.660.560 (397,7 M) |
| Parametros activos | 173,5 M por token |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16; no hay GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | hindi (hi), ingles (en) y Python como lenguaje de programacion |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors (`model.safetensors`, bfloat16); tokenizer propio en JSON (`tokenizer.multi32k.json`) |
| Vocabulario | 32.000 tokens (tokenizer `multi32k`, BPE a nivel de byte) |
| Enrutamiento MoE | 24 expertos de 192, top-4, equilibrio sin perdida auxiliar |
| Atencion | GQA + ventana deslizante de 256 en capas 0-9 |
| Modelo base | toonist/AnuLM-Base-400M (paso 36.000) |
| Tamano del repositorio | 0,8 GB |

## Arquitectura y entrenamiento

La red es un transformer de 20 capas con dimension oculta de 1.024 que incorpora Mixture of Experts en lugar de un FFN denso convencional. Cada capa dispone de 24 expertos enrutados de 192 unidades y activa los 4 mas relevantes por token (top-4), con una estrategia de equilibrio sin perdida auxiliar (aux-loss-free balancing) que evita el colapso de expertos sin introducir terminos adicionales en la funcion de perdida. La atencion usa Grouped Query Attention con 16 cabezas de consulta y 4 de clave-valor, y las diez primeras capas aplican una ventana deslizante de 256 tokens, lo que reduce el coste de atencion en secuencias largas relativas al contexto maximo. El resultado es un modelo de 397,7 M de parametros totales con solo 173,5 M activos por token. El vocabulario es de 32.000 entradas con un tokenizer BPE a nivel de byte propio.

El ajuste fino se realizo sobre pares pregunta-respuesta en tres dominios: preguntas en hindi generadas a partir de parrafos introductorios de Wikipedia en hindi (CC BY-SA), preguntas en ingles a partir de parrafos introductorios de Wikipedia en ingles (CC BY-SA) y preguntas sobre funciones de Python a partir de docstrings de `codeparrot-clean`. La perdida se calcula unicamente sobre los tokens de la respuesta, no sobre el enunciado. Las plantillas de prompt estan almacenadas en el checkpoint bajo el campo `qa_templates`: `प्रश्न: {q}` seguido de salto de linea y `उत्तर:` para hindi, y `Question: {q}` seguido de salto de linea y `Answer:` para ingles y Python. El modelo base ya habia visto C4 (ODC-BY) y codigo Python de GitHub a traves de codeparrot-clean.

No se documenta en la informacion disponible el uso de RLHF, DPO u otras tecnicas de alineacion posteriores al ajuste supervisado, ni el numero total de tokens de entrenamiento. La perdida de validacion en respuestas retenidas es de 3,3150 en el paso seleccionado, y la evaluacion manual descrita en `docs/RESULTS.md` (seccion 23) indica respuestas sensatas y sobre el tema para sujetos conocidos en los tres idiomas, con degradacion rapida en temas poco frecuentes.

## Capacidades

- Generacion de respuestas definicionales de uno o dos enunciados en hindi e ingles, con registro enciclopedico.
- Respuesta a preguntas factuales sobre entidades y conceptos bien conocidos extraidos de Wikipedia.
- Explicacion del proposito de funciones Python a partir de su firma o de su docstring.
- Soporte de tres idiomas registrados en la model card: hindi, ingles y Python.
- Generacion de texto autoregresiva estandar con muestreo por temperatura y penalizacion de repeticion (los ejemplos se generaron con temperatura 0,3 y penalizacion 1,3).
- No dispone de soporte de tool calling ni de function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de modo de razonamiento explicito (thinking mode), vision ni audio.
- No es un chatbot: no mantiene conversaciones multi-turno, no tiene identidad asignada y trata preguntas como "What is your name?" como un tema a definir.

## Casos de uso

- Consulta enciclopedica en hindi: dado un termino o entidad, el modelo devuelve una definicion breve en hindi. Es adecuado porque fue ajustado especificamente sobre parrafos introductorios de Wikipedia en hindi, que es exactamente el formato de salida que reproduce.
- Generacion de resumenes definicionales en ingles: util para poblar glosarios, fichas de concepto o campos de descripcion corta en bases de conocimiento, aprovechando el entrenamiento sobre parrafos introductorios de Wikipedia en ingles.
- Documentacion automatica de funciones Python: integrado en un pipeline de CI/CD, puede leer firmas y docstrings de un modulo y generar descripciones de una frase por funcion, utiles como borrador de documentacion de API.
- Prototipado de asistentes de FAQ: para preguntas frecuentes de un unico turno y respuesta corta, el modelo ofrece una primera version funcional sin necesidad de infraestructura de GPU de gama alta, dado su tamano reducido.
- Anotacion asistida de pares pregunta-respuesta: puede usarse para pregenerar respuestas candidatas que despues se revisan manualmente, acelerando la construccion de datasets de QA en hindi o ingles.
- Investigacion sobre modelos MoE de escala reducida: al publicar la arquitectura completa (24 expertos, top-4, GQA, ventana deslizante), sirve como banco de pruebas para estudiar enrutamiento y eficiencia en modelos por debajo de 500 M de parametros.
- Educacion y divulgacion en hindi: para explicaciones breves de conceptos basicos dirigidas a hablantes de hindi, siempre que se verifique la exactitud del contenido generado.
- Normalizacion de terminologia tecnica: dado que maneja hindi, ingles y codigo Python, puede emplearse para generar descripciones bilingues de funciones o conceptos, aunque requiere revision humana por el riesgo de invencion de detalles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El `model-index` de la model card declara una lista de resultados vacia, por lo que no hay cifras verificables de MMLU, HumanEval, GSM8K ni de ninguna otra prueba estandar, ni comparaciones con otros modelos.

El unico dato cuantitativo declarado por el autor es la perdida sobre respuestas retenidas: 3,3150 en el paso seleccionado. La model card describe ademas una evaluacion manual (seccion 23 de `docs/RESULTS.md`) con respuestas sensatas y sobre el tema para sujetos conocidos en hindi, ingles y Python, y degradacion rapida en sujetos poco frecuentes. No se proporcionan cifras de exactitud ni de solapamiento con referencias.

## Requisitos de hardware

- Peso de los parametros: 397,7 M en bfloat16 equivalen aproximadamente a 0,8 GB, lo que coincide con el tamano del repositorio.
- VRAM estimada para inferencia: del orden de 1 a 1,5 GB con activaciones y cache KV para el contexto maximo de 512 tokens. La cache KV es muy reducida gracias a GQA: 20 capas, 4 cabezas KV de dimension 64 y 512 tokens suponen aproximadamente 10 MB en bfloat16 (estimacion propia a partir de la configuracion declarada).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente. Modelos como RTX 3060 (12 GB), RTX 4060, RTX 4070 o RTX 4090 (24 GB) lo ejecutan sin dificultad y con amplio margen. Las GPU de datacenter (A100, H100) solo tendrian sentido para servir muchas replicas en paralelo.
- Ejecucion en CPU: probablemente viable dada la escala y los 173,5 M de parametros activos por token, aunque no se publican medidas de latencia.
- Opciones de despliegue: no integrado en `transformers`, vLLM, llama.cpp, Ollama ni TGI. El autor indica explicitamente que la arquitectura no esta en `transformers` y que hay que clonar el repositorio AnuLM y cargar el checkpoint con su propio codigo: `python serve.py --ckpt <carpeta>` para una interfaz web en `http://127.0.0.1:8000`, `python ask.py --ckpt <carpeta>` en linea de comandos y `python sample.py --ckpt <carpeta> --prompt "..."`. La carga programatica se hace con `load_checkpoint` y `AnuLM(ck["cfg"])`.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de tiempo de respuesta.
- Nota sobre el tokenizer: usa un formato JSON propio cargado con `bpe.BPE.load(path)`, no el formato de la libreria `tokenizers`, lo que complica la integracion con herramientas estandar.

## Comparativa con modelos similares

No hay datos verificables en la informacion proporcionada sobre modelos de terceros comparables, por lo que la comparacion externa queda como no disponible. La unica comparacion posible con datos declarados es con su propio modelo base, que comparte red y tokenizer.

| Modelo | Parametros totales | Activos por token | Contexto | Ajuste | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| AnuLM-Hindi-QA-400M | 397,7 M | 173,5 M | 512 | QA en hindi, ingles y Python sobre Wikipedia y docstrings | CC BY-SA 4.0 | HuggingFace, carga con codigo propio |
| AnuLM-Base-400M | 397,7 M | 173,5 M | 512 | Modelo base (paso 36.000), sin ajuste de QA | no disponible | HuggingFace, carga con codigo propio |
| Otros modelos comparables | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un chatbot: nunca ha visto una conversacion, carece de identidad y trata cualquier pregunta personal como un tema a definir. No debe desplegarse como asistente conversacional.
- Alucinacion elevada: el propio autor advierte que el modelo inventa detalles con libertad y que hay que verificar cualquier dato relevante. No es apto para uso sin supervision en contextos donde la exactitud sea critica.
- Contexto muy corto: 512 tokens limitan el material de entrada y hacen inviable el procesamiento de documentos largos o dialogos multi-turno.
- Degradacion en temas poco frecuentes: la evaluacion manual reporta respuestas razonables solo para sujetos bien conocidos y un deterioro rapido en el resto.
- Idioma: solo hindi, ingles y Python. No hay soporte declarado de castellano ni de otras lenguas, incluidos otros idiomas indios.
- Licencia CC BY-SA 4.0: es una licencia copyleft que impone obligaciones de atribucion y de compartir bajo la misma licencia las obras derivadas. Conviene revisar su compatibilidad antes de integrarlo en productos propietarios.
- Procedencia de los datos: los pares derivan de Wikipedia en hindi e ingles (CC BY-SA) y el modelo base vio C4 (ODC-BY) y codigo Python de GitHub via codeparrot-clean, con licencias mixtas. Esto anade incertidumbre sobre la reutilizacion comercial.
- Sin soporte en el ecosistema estandar: no funciona con `transformers`, vLLM, llama.cpp, Ollama ni TGI, y el tokenizer usa un formato propio. La integracion exige mantener codigo a medida del repositorio AnuLM.
- Ausencia de benchmarks: no hay ninguna cifra publica de MMLU, HumanEval, GSM8K ni de evaluaciones equivalentes, lo que impide comparar objetivamente su rendimiento con alternativas.
- Sin tecnicas de alineacion documentadas: no se menciona RLHF ni DPO, por lo que no hay garantias de comportamiento seguro ante entradas adversarias o maliciosas.
- Falta de afiliacion: el autor declara no estar afiliado a Sarvam AI, AI4Bharat, BharatGen ni al Gobierno de India, pese a que la etiqueta `sarvam-architecture` pueda sugerir lo contrario.
- Adopcion nula: cero descargas y cero "likes" en el momento de la consulta, sin comunidad que haya validado el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/toonist/AnuLM-Hindi-QA-400M
- Modelo base: https://huggingface.co/toonist/AnuLM-Base-400M
- Repositorio AnuLM: referenciado en la model card como "AnuLM repository", sin URL publica en la informacion disponible
- Documentacion de resultados: `docs/RESULTS.md`, secciones 22 (tokenizer `multi32k`) y 23 (ajuste de QA y evaluacion manual), dentro del repositorio del autor
- Scripts de uso: `serve.py`, `ask.py`, `sample.py` y `model.py`, incluidos en el repositorio del autor
- Paper, blog o demo adicionales: no disponible
- Nota sobre la busqueda web: los resultados recuperados no guardan relacion con el modelo (corresponden a foros de soporte de Microsoft sobre DNS, Windows y Word) y no se han incluido por no ser pertinentes.
