# youcoded/next-word-english

## Resumen

youcoded/next-word-english es un modelo neuronal pequeno para prediccion de la siguiente palabra en ingles, desarrollado por Destin Moss (youcoded.ai) y publicado bajo el paraguas del proyecto Swipe Keyboard, un complemento de escritura por deslizamiento y prediccion de palabras para el teclado en pantalla de KDE Plasma. No es un modelo generativo de proposito general: es un componente de inferencia en dispositivo que devuelve una probabilidad para cada una de sus 23.775 palabras conocidas dada la frase escrita hasta el momento (hasta las ultimas 20 palabras).

Tecnicamente es una LSTM de una sola capa con capa de proyeccion y vectores de palabra atados (tied embeddings), con vector de palabra de 128 dimensiones y estado oculto de 1024, lo que arroja aproximadamente 4,3 millones de parametros cuantizados a int8. El fichero distribuido (`en.nwp.bin`) ocupa 4.657.632 bytes (4,66 MB) y se lee con un runner propio en C++ de unas 250 lineas, sin ninguna libreria de machine learning. La misma clase de tamano que los modelos de siguiente palabra que Google describe en su paper sobre Gboard (arXiv 2305.18465), aunque entrenado desde cero sin pesos ni datos de Google ni de FUTO.

Su relevancia es acotada pero clara: demuestra que una red neuronal diminuta, ejecutada en CPU y combinada con un paquete de n-gramas, puede superar a un teclado comercial ampliamente desplegado en sugerencia de siguiente palabra. El autor declara entre 6,18 y 18,32 puntos de ventaja sobre Gboard 14.2 en las condiciones que midio. Es material de referencia para quien trabaje en teclados predictivos, modelos en dispositivo y sistemas con restricciones severas de memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LSTM de una capa con capa de proyeccion y vectores de palabra atados (embeddings compartidos con la capa de salida) |
| Parametros totales | ~4,3 millones (calculado a partir de las dimensiones declaradas: V=23.778, D=128, H=1024) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Ultimas 20 palabras de la frase en el campo actual (limite de uso en el teclado); sin contexto entre campos |
| Tipos de cuantizacion | int8 con una escala por fila (tipo 1); el formato de fichero tambien admite float32 (tipo 0) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | `other`: ODC-BY 1.0 y CC-BY 2.0 FR (ver NOTICE.md) |
| Formato de pesos | Binario propio `en.nwp.bin` (magic `SWKBNWP1`), little-endian; no safetensors, no GGUF, no PyTorch |
| Vocabulario | 23.778 tokens (23.775 palabras + desconocido, inicio y fin de frase) |
| Dimension del vector de palabra | 128 |
| Dimension del estado oculto | 1024 |
| Tamano del fichero | 4.657.632 bytes (4,66 MB) |
| Pesos de mezcla incluidos | lambda = 0,7; offset fuera de vocabulario = -0,5 |
| Integridad | Checksum FNV-1a de 64 bits sobre todo el contenido previo |

## Arquitectura y entrenamiento

El modelo es una LSTM de una capa con proyeccion: la entrada es el vector de palabra de 128 dimensiones, la capa recurrente tiene 1024 unidades y una proyeccion devuelve la representacion al espacio de 128 dimensiones, que se reutiliza como capa de salida gracias a los vectores atados. Las matrices son las habituales de una LSTM (pesos de entrada [4H x D], pesos recurrentes [4H x D], sesgos de puerta [4H], proyeccion [D x H]) con el orden de puertas de PyTorch (entrada, olvido, celda y salida). La salida es un vector de log-probabilidades sobre el vocabulario, con un sesgo de salida independiente por palabra.

El entrenamiento se realizo desde cero usando HuggingFaceFW/fineweb como fuente de datos; la model card no especifica el numero de tokens procesados, la composicion exacta del corpus ni el procedimiento de optimizacion. No se documenta RLHF, DPO ni ningun ajuste por preferencias, algo coherente con la tarea: es un modelo de lenguaje puro entrenado para predecir la palabra siguiente. Tampoco se documentan innovaciones de decodificacion (no hay decodificacion especulativa ni atencion lineal); la unica pieza no trivial del diseno es el esquema de mezcla con el paquete de n-gramas, que combina log-probabilidades con un peso lambda fijo y aplica un offset constante a las palabras que solo conoce el n-grama.

El modelo esta disenado para funcionar siempre en tandem con ese paquete de n-gramas: el modelo neuronal aporta cobertura de las palabras mas frecuentes (hasta 24.000) con lectura de toda la frase, mientras que el n-grama aporta un vocabulario mayor y pares y tripletas exactas. Si el fichero del modelo falta o esta corrupto, el teclado cae silenciosamente al n-grama; si menos de la mitad del vocabulario del modelo coincide con la lista de palabras del teclado, el modelo se ignora.

## Capacidades

- Prediccion de la siguiente palabra en ingles cuando aun no se ha tecleado nada: devuelve probabilidades para las 23.775 palabras de su vocabulario a partir de la frase previa (hasta 20 palabras).
- Autocompletado restringido por prefijo: la misma mezcla aplicada solo a las palabras que empiezan por las letras ya tecleadas.
- Puntuacion log-probabilistica por palabra, adecuada para ranking top-k combinado (el teclado muestra las tres mejores sugerencias tras la mezcla).
- Ejecucion en CPU sin dependencias: el runner en C++ lee el binario directamente y no requiere ninguna libreria de ML, Python ni aceleracion por hardware.
- Determinismo y ausencia de estado: no almacena ni aprende de lo que el usuario escribe; cada inferencia depende solo de las palabras del campo actual.
- Integracion con paquetes de n-gramas mediante pesos de mezcla embebidos en la cabecera del fichero (lambda y offset), lo que permite recalibrar sin recodificar el modelo.
- No soporta tool calling, function calling, agentes, vision, audio, modo thinking, generacion de texto libre ni conversacion multi-turno.

## Casos de uso

- Teclado en pantalla de escritorio Linux: integrado en el complemento Swipe Keyboard de KDE Plasma, el modelo alimenta las tres sugerencias de siguiente palabra y el autocompletado mientras el usuario escribe en cualquier aplicacion. Su tamano de 4,66 MB permite distribuirlo dentro del propio paquete del teclado sin coste de descarga apreciable.
- Dispositivos sin GPU y con RAM limitada: al ejecutarse en CPU con un fichero de menos de 5 MB y sin librerias de ML, encaja en quioscos, paneles industriales, Raspberry Pi y equipos antiguos donde un transformer pequeno seria inviable.
- Entornos con requisitos estrictos de privacidad: el teclado bloquea campos de contrasena y datos privados antes de que el texto llegue al modelo, y el modelo no almacena ni transmite nada. Apto para sanidad, despachos juridicos o administracion publica donde no se permite enviar pulsaciones a la nube.
- Sistemas air-gapped u operaciones offline: al no requerir red ni descarga de pesos en tiempo de ejecucion, sirve para terminales aisladas y despliegues con conectividad intermitente o inexistente.
- Accesibilidad y comunicacion asistida: la prediccion de siguiente palabra y el autocompletado por prefijo reducen el numero de pulsaciones necesarias para usuarios con movilidad reducida en dispositivos de comunicacion aumentativa, donde el coste por pulsacion es el factor limitante.
- Referencia para investigacion en modelos en dispositivo: sirve como linea base reproducible (arquitectura, pesos y metodo de evaluacion publicados) para comparar tecnicas de compresion, cuantizacion int8 y mezcla con n-gramas en tareas de prediccion de palabra.
- Ahorro de ancho de banda en aplicaciones de mensajeria: puede embeberse en el cliente para ofrecer sugerencias locales sin llamadas a un servicio de inferencia, eliminando coste por token y latencia de red.
- Ancla linguistica para correctores y sistemas de dictado: las log-probabilidades por palabra pueden reordenar candidatos de un reconocedor o de un corrector ortografico en ingles, siempre que se use como senal relativa y no como probabilidad calibrada.

## Benchmarks y rendimiento

Los resultados los declara el autor en la model-index de la model card y no estan verificados de forma independiente (`verified: false`). La metrica es la proporcion de veces que la palabra correcta aparece en el top 3, a nivel de palabra y con comparacion insensible a mayusculas, usando la mezcla del modelo con su paquete de n-gramas.

| Tarea | Dataset de evaluacion | Metrica | Valor |
|---|---|---|---|
| Sugerencia de siguiente palabra (modelo mezclado con el paquete de n-gramas) | Common Voice, frases cotidianas, primeras 300 (CC0) | Acierto en top 3 (nivel de palabra, insensible a mayusculas) | 29,36 |
| Sugerencia de siguiente palabra (modelo mezclado con el paquete de n-gramas) | Texto de test de FineWeb (shard 001, no usado en entrenamiento), primeras 300 frases | Acierto en top 3 (nivel de palabra, insensible a mayusculas) | 31,62 |
| Sugerencia de siguiente palabra (modelo mezclado con el paquete de n-gramas) | Tatoeba, decima parte reservada (id % 10 == 0), primeras 300 frases | Acierto en top 3 (nivel de palabra, insensible a mayusculas) | 43,83 |

Comparacion declarada por el autor frente a Gboard 14.2 (copia incluida en la imagen de emulador Android 35 x86_64 de Google, con aprendizaje desactivado, probada el 22 de octubre de 2026): la mezcla de este modelo y su paquete de n-gramas quedo entre 6,18 y 18,32 puntos por delante en todas las medidas registradas, desde antes de teclear hasta con tres letras tecleadas, sobre 100 frases por conjunto (cotidianas y web). No se midieron versiones mas recientes de Gboard ni Gboard despues de aprender del usuario. No hay datos publicados de perplejidad, latencia ni throughput.

## Requisitos de hardware

- VRAM: no requiere GPU; 0 MB de VRAM. La inferencia es puramente CPU.
- Memoria en RAM: el fichero pesa 4,66 MB y los tensores int8 en memoria ocupan del orden de 4-5 MB, mas la lista de palabras; el proceso completo cabe holgadamente en cualquier dispositivo con unas pocas decenas de MB libres.
- GPU recomendadas: ninguna. No hay backend CUDA, ROCm ni Metal; el runner es C++ puro.
- Compatibilidad con GPU de consumo: irrelevante, el modelo esta pensado para ejecutarse en CPU y concretamente dentro del proceso del teclado en KDE Plasma.
- Opciones de despliegue: unicamente el runner propio del proyecto Swipe Keyboard (`engine/src/nwp_model.cpp` para carga y `engine/src/nwp_predictor.cpp` para la logica de mezcla y fallback). No hay soporte para vLLM, llama.cpp, Ollama, TGI, transformers ni ONNX Runtime; la libreria en HuggingFace figura como `custom`.
- Latencia y throughput: no disponible. No se han publicado medidas de tiempo por inferencia. Por la naturaleza del modelo (LSTM de una capa, 4,3 M de parametros, ventana de 20 palabras) el coste por prediccion es de decenas de miles de operaciones, varios ordenes de magnitud por debajo de un transformer pequeno, pero se trata de una estimacion estructural y no de un dato medido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| youcoded/next-word-english | ~4,3 M (int8, 4,66 MB) | Ultimas 20 palabras | LSTM con proyeccion + mezcla con n-gramas | ODC-BY 1.0 + CC-BY 2.0 FR | HuggingFace, binario propio |
| youcoded/next-word-french | No disponible en la informacion proporcionada | No disponible | LSTM int8 + n-gramas (mismo diseno, otro idioma) | ODC-BY y CC-BY (variante francesa) | HuggingFace, binario propio |
| Gboard 14.2 (modelo interno de siguiente palabra) | No disponible | No disponible | Modelo neuronal descrito en arXiv 2305.18465, con aprendizaje en dispositivo | Propietaria | Solo en la app de Google; no distribuible |
| Paquete de n-gramas del propio teclado (sin modelo neuronal) | No disponible | Pares y tripletas exactas | Tabla estadistica de n-gramas | Ligada al proyecto Swipe Keyboard | Incluido como fallback del teclado |

Frente a Gboard, la comparacion solo es valida en el escenario medido por el autor (emulador Android 35 x86_64, aprendizaje desactivado, 100 frases por conjunto, 22 de octubre de 2026). No hay comparacion publicada con otros modelos neuronales de siguiente palabra ni con soluciones comerciales en dispositivo.

## Limitaciones y advertencias

- No es un modelo de chat ni de generacion de texto: solo emite probabilidades sobre su vocabulario cerrado de 23.775 palabras. No puede redactar, resumir, traducir ni responder preguntas.
- No debe usarse solo. El diseno presupone la mezcla con un paquete de n-gramas del mismo idioma; sin el, la cobertura de vocabulario y la calidad de las sugerencias caen de forma no documentada.
- Dependencia fuerte del vocabulario: si menos de la mitad de sus palabras coinciden con la lista de palabras del teclado, el modelo se descarta automaticamente. Cambiar de teclado o de lista lexica puede invalidarlo.
- Solo ingles. No hay soporte de otros idiomas en este fichero; los modelos para espanol, frances y aleman son artefactos separados.
- Ventana de contexto muy corta: 20 palabras del campo actual y cero memoria entre campos o aplicaciones. No hay estado conversacional.
- Calibracion no garantizada: la propia model card advierte que las probabilidades no estan calibradas entre contextos, por lo que no deben usarse como confianza absoluta en umbrales de decision.
- Riesgo de sesgo en los datos: entrenado sobre FineWeb, un corpus web, por lo que hereda los sesgos de dominio, registro y demografia de esa fuente. No se documenta ningun filtrado o mitigacion.
- Resultados de benchmarks no verificados de forma independiente (`verified: false`) y medidos sobre 300 frases por conjunto, un tamano muestral reducido que deja margen de error amplio.
- Sin cifras publicadas de tokens de entrenamiento, composicion del dataset, hiperparametros ni regimen de optimizacion, lo que dificulta la reproducibilidad completa.
- Licencia `other` compuesta por ODC-BY 1.0 y CC-BY 2.0 FR: requiere revision del NOTICE.md antes de uso comercial. Las condiciones de atribucion concretas no se detallan en la informacion disponible.
- Unicidad de despliegue: al no existir soporte en runtimes estandar (llama.cpp, ONNX, transformers), integrarlo fuera del proyecto Swipe Keyboard exige reimplementar el parser del formato binario y la logica de mezcla.
- Advertencia de alcance sobre la comparacion con Gboard: el autor midio una copia concreta en un emulador, con aprendizaje desactivado y version 14.2; versiones posteriores y Gboard tras aprender del usuario no fueron evaluadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/youcoded/next-word-english
- Aviso de licencia (NOTICE.md): https://huggingface.co/youcoded/next-word-english/blob/main/NOTICE.md
- Metodologia de evaluacion (METHODS.md): https://huggingface.co/youcoded/next-word-english/blob/main/METHODS.md
- Codigo, scripts y tests del teclado (rama de desarrollo): https://github.com/itsdestin/swipe-keyboard/tree/feature/179-engine-in-keyboard
- Paper de referencia sobre los modelos de siguiente palabra de Gboard: https://arxiv.org/abs/2305.18465
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb
- Modelo hermano en frances: https://huggingface.co/youcoded/next-word-french
- Perfil del autor en HuggingFace (modelos en espanol y aleman del mismo diseno): https://huggingface.co/youcoded
- Sitio del autor: https://youcoded.ai/
- Repositorio del asistente youcoded: https://github.com/itsdestin/youcoded
