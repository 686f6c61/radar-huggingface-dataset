# youcoded/next-word-german

## Resumen

`youcoded/next-word-german` es un modelo neuronal pequeno para predecir la siguiente palabra en aleman, disenado para funcionar dentro de un teclado en pantalla. Lo desarrolla Destin Moss a traves de youcoded.ai y se distribuye como parte de un conjunto de cuatro modelos (ingles, espanol, frances y aleman) que alimentan Swipe Keyboard, un complemento de codigo abierto de escritura por deslizamiento y prediccion de palabras para el teclado en pantalla de KDE Plasma. El modelo no genera texto ni mantiene conversaciones: devuelve una probabilidad para cada una de las 23.987 palabras de su vocabulario dada la frase escrita hasta ese momento.

Tecnicamente es una LSTM de una sola capa con capa de proyeccion y vectores de palabra atados (compartidos entre entrada y salida), con vectores de 128 dimensiones y estado oculto de 1024. El archivo empaquetado ocupa 4.718.096 bytes (4,72 MB) en pesos int8 y contiene aproximadamente 4,3 millones de numeros, lo que lo situa en la misma clase de tamano que los modelos de prediccion de siguiente palabra que Google describe para Gboard en el paper arXiv 2305.18465. Lee hasta las ultimas 20 palabras de la frase y solo cubre aleman.

Su relevancia practica esta en el nicho: inferencia completamente local, sin GPU, sin telemetria y sin aprendizaje de lo que escribe el usuario, integrada en un motor C++ propio de unas 250 lineas sin dependencias de machine learning. El autor declara que, combinado con su paquete de n-gramas, supera a Gboard 14.2 entre 3,86 y 14,85 puntos en acierto de la palabra correcta en el top 3. El modelo es muy reciente y con adopcion practicamente nula (0 descargas, 1 like en HuggingFace en el momento de la consulta), y sus metricas estan declaradas por el autor, no verificadas por terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LSTM de una capa con capa de proyeccion y vectores de palabra atados (entrada y salida comparten la matriz de embeddings) |
| Parametros totales | ~4,3 millones (calculado por el autor a partir de las dimensiones: vectores 23.990 x 128, sesgo de salida 23.990, pesos de entrada 4.096 x 128, pesos recurrentes 4.096 x 128, sesgo de puertas 4.096, proyeccion 128 x 1.024) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Ultimas 20 palabras de la frase en curso (limite de lectura del predictor) |
| Tipos de cuantizacion | int8 con una escala por fila (tipo de dato 1, el archivo distribuido); el formato tambien admite float32 (tipo de dato 0) |
| Idiomas soportados | Aleman (`de`) unicamente |
| Licencia | `other`: ODC-BY 1.0 y CC-BY 2.0 FR (detalles en `NOTICE.md`) |
| Formato de pesos | Binario propio `de.nwp.bin` con cabecera magica `SWKBNWP1`, no safetensors ni GGUF |

Otros datos del archivo: version de formato 1, vocabulario de 23.990 tokens (23.987 palabras mas tres tokens especiales: 0 = desconocido, 1 = inicio de frase, 2 = fin de frase), peso de mezcla `lambda = 0,7` y offset fuera de vocabulario `0,0`, ambos embebidos en la cabecera. El archivo incluye un checksum FNV-1a de 64 bits de todo el contenido anterior.

## Arquitectura y entrenamiento

La arquitectura es una red recurrente clasica, no un transformer: una LSTM de una capa con 1.024 unidades ocultas, una capa de proyeccion de 1.024 a 128 y la matriz de vectores de palabra de 23.990 x 128 reutilizada como capa de salida (weight tying). El orden de puertas es el de PyTorch (entrada, olvido, celula, salida). El modelo se entreno desde cero; el autor afirma explicitamente que no se usaron pesos ni datos de Google ni de FUTO. El unico dataset declarado en la model card es `HuggingFaceFW/fineweb-2`, aunque no se especifica el numero de tokens de entrenamiento, la composicion exacta del corpus, ni si hubo fases de ajuste tipo RLHF o DPO: esos datos no estan disponibles.

El modelo no se usa de forma aislada. El teclado lo mezcla siempre con un paquete separado de n-gramas (pares y triples de palabras) para el mismo idioma: para las palabras que ambas fuentes conocen, la puntuacion es `lambda x log-probabilidad del modelo + (1 - lambda) x log-probabilidad del n-grama`, con `lambda = 0,7`; para las palabras que solo conoce el n-grama se aplica la puntuacion del n-grama mas un offset fijo de 0,0. Si el archivo del modelo falta o esta corrupto, el teclado recurre silenciosamente solo al paquete de n-gramas. Si la lista de palabras del modelo coincide en menos de la mitad con la del teclado, el modelo se ignora. El cargador rechaza archivos con magia incorrecta o version desconocida.

## Capacidades

- Prediccion de siguiente palabra en aleman: devuelve una distribucion de probabilidad sobre 23.987 palabras conocidas dada la frase escrita hasta el momento.
- Lectura de contexto intra-frase: considera hasta las ultimas 20 palabras del campo de texto actual, lo que le permite captar dependencias mas alla de un simple par de palabras.
- Completado de palabra: el mismo calculo restringido a las palabras que empiezan por las letras ya tecleadas.
- Mezcla con n-gramas mediante un peso `lambda` configurable en el archivo (0,7 en esta distribucion).
- Ejecucion en dispositivo: inferencia en CPU con un runner C++ propio de unas 250 lineas, sin bibliotecas de machine learning.
- Privacidad por diseno: no aprende ni almacena lo que se escribe; los campos de contrasena y otros campos privados se bloquean en el teclado antes de que el texto llegue al modelo.
- Integracion con escritura por deslizamiento (swipe) a traves del complemento Swipe Keyboard.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio, ni generacion libre de texto.

## Casos de uso

- Teclado en pantalla de KDE Plasma: su uso previsto. El motor integra el modelo en `engine/src/nwp_predictor.cpp` y muestra las tres mejores sugerencias tras la mezcla con el paquete de n-gramas, tanto antes de teclear como durante el completado.
- Accesibilidad para usuarios con dificultad motora: al sugerir la siguiente palabra y completar prefijos, reduce el numero de pulsaciones necesarias por frase, lo que ayuda en casos de temblor, fatiga o uso de sistemas de seguimiento ocular acoplados a un teclado virtual.
- Equipos con recursos muy limitados: con 4,72 MB de archivo y pesos int8, cabe en thin clients, Raspberry Pi, quioscos y terminales de punto de venta que no pueden ejecutar un modelo transformer.
- Entornos sin conexion o air-gapped: administraciones publicas alemanas, plantas industriales o portatiles de campo donde enviar pulsaciones a la nube es inaceptable; la inferencia es local y no hay telemetria.
- Formularios y toma de datos en aleman: en aplicaciones de historia clinica, partes de incidencias o CRM, el modelo puede ofrecer sugerencias dentro de los campos de texto para acelerar la entrada repetitiva de vocabulario frecuente.
- Correccion y completado en aplicaciones de escritorio sin motor de IA: cualquier aplicacion Qt o GTK que necesite sugerencias de palabra en aleman puede reutilizar el runner C++ y el formato binario sin incorporar PyTorch ni ONNX Runtime.
- Linea base de investigacion: sirve como referencia reproducible y de bajo coste para comparar estrategias de prediccion de siguiente palabra en aleman (modelo neuronal pequeno mezclado con n-gramas) frente a enfoques neuronales mayores.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (`model-index`), no verificados por terceros (`verified: false`). La tarea evaluada es "sugerencia de siguiente palabra (modelo mezclado con el paquete de n-gramas)" y la metrica es acierto de la palabra correcta en el top 3, a nivel de palabra e ignorando mayusculas.

| Dataset de evaluacion | Metrica | Valor |
|---|---|---|
| Common Voice, frases cotidianas, primeras 300 (CC0) | Palabra correcta en el top 3 | 25,04 % |
| FineWeb-2, primeras 300 frases de paginas de test | Palabra correcta en el top 3 | 24,22 % |
| Tatoeba, decima parte reservada (`id % 10 == 0`), primeras 300 frases | Palabra correcta en el top 3 | 31,57 % |

Comparacion declarada por el autor frente a Gboard 14.2 (copia incluida en la imagen de emulador Android 35 x86_64 de Google, con aprendizaje desactivado, medida el 22 de octubre de 2026): ventaja de 3,86 a 14,85 puntos a favor de este modelo, desde el estado "antes de teclear" hasta "tres letras tecleadas", sobre frases cotidianas y frases web, con 100 frases por conjunto. No se han publicado resultados de MMLU, HumanEval ni GSM8K, y no aplican a este modelo.

## Requisitos de hardware

- VRAM: no requiere GPU. El modelo esta pensado para ejecutarse en CPU.
- Memoria: el archivo pesa 4,72 MB y contiene ~4,3 millones de parametros en int8; el consumo de RAM del runner es del orden de decenas de MB como maximo (cifra exacta no disponible).
- GPU recomendadas: ninguna. Cualquier CPU x86_64 o ARM moderna es suficiente; el autor no publica requisitos minimos de CPU.
- Compatibilidad con GPU de consumo: irrelevante, ya que no necesita aceleracion grafica; cabe en cualquier dispositivo capaz de ejecutar KDE Plasma.
- Opciones de despliegue: runner C++ propio del proyecto Swipe Keyboard (`engine/src/nwp_model.cpp` y `engine/src/nwp_predictor.cpp`). No es compatible con vLLM, llama.cpp, Ollama ni TGI, porque el formato de pesos es binario propio y el modelo no genera texto.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano (4,3 M de parametros, una sola capa LSTM con estado oculto de 1024) la inferencia es del orden de una pasada recurrente por palabra de contexto, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `youcoded/next-word-german` | ~4,3 M (int8, 4,72 MB) | Ultimas 20 palabras de la frase | 24,22-31,57 % en top 3 segun conjunto | ODC-BY 1.0 + CC-BY 2.0 FR | HuggingFace, repo de 0,0 GB, 0 descargas |
| Gboard 14.2 (referencia del autor, no es un modelo abierto) | No disponible | No disponible | 3,86-14,85 puntos por debajo en los conjuntos medidos por el autor | Propietaria | Solo como APK en imagen de emulador Android |
| `youcoded/next-word-english`, `-spanish`, `-french` (modelos hermanos citados) | No disponible | No disponible | No disponible | No disponible | No disponible en la informacion proporcionada |
| Paquete de n-gramas del mismo teclado | No es neuronal (pares y triples de palabras) | Longitud de n-grama | No disponible de forma aislada | No disponible | Se distribuye junto al teclado |

No se dispone de datos publicos de modelos abiertos comparables de prediccion de siguiente palabra en aleman con este perfil (pocos MB, int8, ejecucion en CPU) en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de chat ni de generacion de texto: no puede redactar, resumir ni responder preguntas; solo puntua palabras de su vocabulario.
- No debe usarse solo: el autor indica que el teclado siempre lo mezcla con un paquete de n-gramas, y que el modelo por si mismo no cubre el vocabulario completo del idioma.
- Dependencia estricta de vocabulario: si menos de la mitad de sus 23.987 palabras coinciden con la lista del teclado, el modelo se descarta silenciosamente.
- Contexto limitado a las ultimas 20 palabras y a la frase en curso; no hay memoria entre campos de texto ni entre sesiones.
- Solo aleman. No hay soporte multilingue ni cambio de idioma dentro del modelo.
- El autor advierte explicitamente de que las probabilidades no estan calibradas entre contextos, por lo que no deben usarse como senal de confianza en otras aplicaciones.
- Riesgo de sugerencia incorrecta: con un 24-32 % de acierto en top 3 en los conjuntos medidos, entre dos y tres de cada cuatro predicciones no contienen la palabra correcta. No aplica el concepto habitual de alucinacion, pero si el de sugerencia erronea sistematica en vocabulario poco frecuente o dominio especializado.
- Sesgos: no se documenta ninguna evaluacion de sesgo; el vocabulario se limita a 23.987 palabras, lo que puede infrarrepresentar variantes regionales, neologismos, nombres propios y terminologia tecnica. No disponible mas detalle.
- Metricas no verificadas: los tres resultados estan marcados como `verified: false`, se calculan sobre 300 frases por conjunto y con metodologia del propio autor. La comparacion con Gboard usa una sola version (14.2), con aprendizaje desactivado, sobre una imagen de emulador x86_64, y no cubre versiones mas recientes ni Gboard tras aprender del usuario.
- Fechas de referencia inusuales: la model card cita pruebas del 22 de octubre de 2026 y el repositorio figura creado el 23 de octubre de 2026; conviene verificar la vigencia de los datos antes de citarlos.
- Licencia: doble licencia ODC-BY 1.0 y CC-BY 2.0 FR, que exigen atribucion. El texto integro de las condiciones esta en `NOTICE.md`, no incluido en la informacion disponible; conviene revisarlo antes de un uso comercial o de redistribucion.
- Madurez: 0 descargas y 1 like, desarrollo en una rama de trabajo (`feature/179-engine-in-keyboard`) pendiente de fusionar en `main`; no hay garantia de estabilidad de API ni de formato.
- El contenido de la model card consultada aparece truncado al final (seccion de formato de archivo), por lo que pueden faltar detalles del cargador y del checksum.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/youcoded/next-word-german
- Aviso de licencia (NOTICE.md): https://huggingface.co/youcoded/next-word-german/blob/main/NOTICE.md
- Metodologia de medida (METHODS.md): https://huggingface.co/youcoded/next-word-german/blob/main/METHODS.md
- Codigo, scripts y pruebas (rama de desarrollo): https://github.com/itsdestin/swipe-keyboard/tree/feature/179-engine-in-keyboard
- Paper de referencia sobre los modelos de siguiente palabra de Gboard: https://arxiv.org/abs/2305.18465
- Dataset declarado FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Sitio del autor: https://youcoded.ai
