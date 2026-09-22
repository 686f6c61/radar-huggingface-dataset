# VantoraLabs/Vocetta2-147k

## Resumen

Vocetta2-147k es un sistema completo de sintesis de voz (text-to-speech) en ingles desarrollado por VantoraLabs que cabe en 147.532 parametros. Se compone de tres redes neuronales diminutas (estudiante de duracion, estudiante acustico y decodificador) mas un front-end de grafema a fonema (G2P) basado en diccionario con un pequeno modelo neuronal de respaldo, todo ejecutable en CPU en tiempo real. La relevancia del modelo no esta en su calidad absoluta, sino en explorar el limite inferior de capacidad: la propia model card plantea explicitamente la pregunta de cuanto calidad sobrevive por debajo de 150.000 parametros.

Tecnicamente no es un transformer ni un modelo generativo de gran escala, sino una cascada de convoluciones 1D entrenada por destilacion a partir de un profesor TTS mayor: el texto se convierte en fonemas IPA, estos se mapean a duraciones en frames de mel, el mel de 100 bandas se genera con convoluciones sobre fonemas y frames, y un decodificador ConvNeXt1D produce un espectro complejo de 513 bins que una iSTFT transforma en audio a 24 kHz mono. Alcanza un RTF de 0,0125 (unas 80 veces tiempo real en CPU), con un WER de 0,105 sobre un conjunto de 24 frases diversas no vistas.

El modelo es de interes para quien trabaja en compresion extrema, destilacion y TTS embebido sin GPU ni conectividad, aunque su naturalidad es baja (SCOREQ 1,48, DNSMOS-OVRL 2,95) y su cobertura se limita al ingles. La ficha se basa exclusivamente en la model card oficial, que esta truncada al final de la etapa 3 de entrenamiento; el repositorio registra 0 descargas y 0 likes, por lo que carece de validacion externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cascada de TTS en cuatro etapas: front-end G2P por diccionario con fallback neuronal, estudiante de duracion (3 capas convolucionales 1D), estudiante acustico (convoluciones de contexto de token y de frame, proyeccion a 100 bandas mel) y decodificador ConvNeXt1D + iSTFT |
| Parametros totales | 147.532 (duracion 5.344 + acustico 40.162 + decodificador 102.026) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; procesa por enunciado, delimitado por los simbolos `<bos>` y `<eos>` de un vocabulario congelado de 62 simbolos |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones; el modelo es tan pequeno que no resulta necesario) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT para pesos y runtime; los datos G2P incluidos son Apache-2.0 |
| Formato de pesos | safetensors y PyTorch (`duration.pt`, `acoustic.pt`, `decoder.pt`); front-end G2P solo NumPy |

Datos adicionales de la model card: audio de salida a 24 kHz mono, velocidad de aproximadamente 80x tiempo real en CPU (RTF 0,0125), fecha de creacion 2026-09-21, 0 descargas, 0 likes, tamano de repositorio reportado 0,0 GB.

## Arquitectura y entrenamiento

El sistema es una cascada de cuatro etapas sin transformer ni mecanismo de atencion. El front-end G2P (`microtts/g2p/`) consulta primero diccionarios de pronunciacion incluidos (gold y silver) y recurre a un pequeno modelo neuronal de respaldo para las palabras no encontradas; funciona solo con NumPy, sin espeak, sin torch y sin acceso a red, y produce una cadena de fonemas IPA mapeada al vocabulario congelado de 62 simbolos. El estudiante de duracion (5.344 parametros) es una red convolucional 1D de 3 capas con bloques residuales que predice cuantos frames de mel ocupa cada fonema usando caracteristicas aprendidas de posicion, longitud de secuencia y duracion; la salida es log-duracion exponenciada, redondeada y limitada a un minimo de un frame por fonema. El estudiante acustico (40.162 parametros) embebe los ids de fonema, los refina con convoluciones de contexto, los expande a la rejilla de frames repitiendo cada fonema sus frames previstos y aplica una segunda pila de convoluciones sobre frames hasta proyectar a 100 bandas mel. El decodificador (102.026 parametros) es una pila ConvNeXt1D (convolucion depthwise, LayerNorm, dos capas pointwise con GELU entre ellas y residual) que mapea el mel a un espectro complejo de 513 bins, convertido a audio por iSTFT; la cabeza de magnitud es exponencial con el bin 0 y el bin de Nyquist anulados, y un filtro de bloqueo de continua elimina el offset restante. El decodificador recibe ruido: una entrada de ruido de 4 canales se proyecta y se suma al embedding de mel, y en inferencia la mejor opcion es ruido cero.

El entrenamiento es integramente por destilacion desde un profesor TTS mayor. En la etapa 0 se construye un paquete de datos donde cada frase almacena ids de fonemas, audio del profesor, duraciones por fonema y mel del profesor (100 bandas, n_fft 1024, hop 256), un `.npz` por linea. La etapa 1 entrena el estudiante de duracion con perdida smooth-L1 sobre log-duracion mas un termino de longitud total (peso 0,35), AdamW con tasa de aprendizaje 2e-3, unas 4.000 iteraciones con batch 32, usando hidden 12 como punto optimo. La etapa 2 entrena el estudiante acustico con perdida L1 mas L1 normalizada, L1 de delta temporal (peso 0,10, descrita como critica contra el suavizado), L1 de estadisticas de canal y un critico PatchGAN con hinge sobre el mel desde la iteracion 1.500 con peso 0,1; tasa de aprendizaje constante de 2e-3, unas 30.000 iteraciones con batch 8. Un detalle relevante: el acustico se destilo contra la salida mel de un acustico mayor de la misma familia, no contra el mel del profesor directamente, porque destilar contra un objetivo alcanzable resulto mas util que cualquier cambio de capacidad. La etapa 3 inicializa el decodificador recortando los primeros N canales del decodificador de un vocoder neuronal preentrenado (dim 40, pw 120, 3 bloques para este modelo) en lugar de entrenarlo desde cero, y despues lo ajusta con L1 de forma de onda, perdida espectral multirresolucion, un discriminador PatchGAN con hinge y una perdida de estructura temporal cosine-gram. La model card esta truncada en este punto.

La decision de diseno central fue el reparto de presupuesto: con dos asignaciones de tamano casi identico (147.532 frente a 147.861 parametros), la version publicada concentra la capacidad en el decodificador (102.026 frente a 77.218) y reduce la del acustico (40.162 frente a 65.299), lo que otorga +0,16 SCOREQ de naturalidad a cambio de un WER ligeramente peor (0,105 frente a 0,100). Un modelo hermano de aproximadamente 276K parametros entrenado igual alcanza SCOREQ 2,04, y ese margen extra es casi todo decodificador.

## Capacidades

- Generacion de voz a partir de texto en ingles, con salida de audio a 24 kHz mono.
- Conversion de grafema a fonema mediante diccionario con respaldo neuronal, sin dependencias de espeak ni acceso a red.
- Prediccion explicita de duraciones por fonema, lo que permite control de la temporizacion a nivel de fonema en la etapa intermedia.
- Sintesis en tiempo real en CPU con un factor de aproximadamente 80x (RTF 0,0125).
- Capacidad de operar en entornos desconectados y de bajos recursos (etiquetas `cpu`, `low-resource`, `tiny`).
- Destilacion reproducible: la model card documenta scripts para construir el paquete de datos (`train/build_pack.py`) e inicializar el decodificador (`train/init_decoder.py`).
- Soporte de tool calling / function calling: no disponible (no es una capacidad aplicable a este modelo).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no; solo ingles.
- Capacidad especial de modo pensamiento, vision o audio de entrada: no disponible; es un modelo estrictamente texto a voz.

## Casos de uso

- Sintesis de voz embebida en dispositivos sin GPU: con 147.532 parametros y ejecucion en CPU, el modelo puede integrarse en asistentes locales, kioscos o equipos industriales con Linux donde no hay acelerador grafico ni presupuesto de memoria.
- Lectura por voz de notificaciones y alertas: en paneles de monitorizacion o sistemas de aviso, el RTF de 0,0125 permite sintetizar mensajes cortos en milisegundos sin bloquear el hilo principal.
- Accesibilidad de bajo consumo: lectores de pantalla o interfaces habladas para hardware antiguo, donde el coste de un TTS neuronal convencional seria prohibitivo en CPU.
- Funcionamiento en entornos aislados o sin conectividad: el front-end G2P es solo NumPy, sin espeak y sin red, lo que habilita despliegues en instalacionesair-gapped o en campo.
- Generacion de datos sinteticos para pipelines de ASR en ingles: el WER de 0,105 sobre 24 frases diversas permite aumentar corpus de forma masiva, aunque conviene filtrar o validar las muestras por el riesgo de pronunciaciones erroneas.
- Prototipado rapido de interfaces de voz en investigacion: permite validar arquitecturas de dialogo o flujos de interaccion antes de invertir en un TTS de mayor calidad.
- Investigacion en destilacion y compresion extrema de modelos: la receta en cuatro etapas y la comparativa de reparto de presupuesto entre acustico y decodificador son directamente reproducibles con los scripts descritos.
- Avisos telefonicos o IVR de bajo coste: el audio a 24 kHz mono es suficiente para locuciones cortas en sistemas de telefonia, siempre que se acepte la naturalidad limitada (SCOREQ 1,48).

## Benchmarks y rendimiento

Los unicos datos publicados son los de la propia model card, medidos sobre un conjunto retenido de 24 frases diversas.

| Metrica | Valor |
|---|---|
| WER (inteligibilidad) | 0,105 (7 de 24 frases exactas) |
| SCOREQ (naturalidad) | 1,48 |
| DNSMOS-OVRL | 2,95 |
| DNSMOS-SIG | 3,19 |
| RTF en CPU | 0,0125 (aproximadamente 80x tiempo real) |
| Audio | 24 kHz mono |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no son aplicables a un modelo de sintesis de voz. Tampoco hay comparaciones con modelos externos medidas por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula. Los pesos en fp32 ocupan aproximadamente 590 KB (147.532 parametros x 4 bytes); en int8 serian unos 148 KB. No se documentan cuantizaciones oficiales.
- GPU recomendadas: no se requiere GPU. El modelo esta disenado para CPU (etiqueta `cpu` en la model card) y no se menciona soporte de aceleracion en la documentacion.
- Cabe en GPU consumer: si, en cualquier GPU consumer y en la mayoria de CPU modernas; el cuello de botella es mas la iSTFT y el front-end G2P que los pesos.
- Opciones de despliegue: ejecucion directa con PyTorch cargando `duration.pt`, `acoustic.pt` y `decoder.pt`, mas el modulo G2P en NumPy. No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia, que ademas no aplican a esta categoria de modelo.
- Latencia y throughput estimados: RTF 0,0125 en CPU, es decir, unos 12,5 ms de computo por segundo de audio generado, aproximadamente 80 veces tiempo real.
- Memoria auxiliar: el mel usa 100 bandas con n_fft 1024 y hop 256; el decodificador produce un espectro complejo de 513 bins.

## Comparativa con modelos similares

La model card proporciona una comparacion interna entre dos repartos de presupuesto con el mismo tamano total, y menciona un hermano de mayor capacidad entrenado con la misma receta.

| Modelo | Duracion (params) | Acustico (params) | Decodificador (params) | Total | SCOREQ | WER |
|---|---|---|---|---|---|---|
| Vocetta2-147k (publicado) | 5.344 | 40.162 | 102.026 | 147.532 | 1,48 | 0,105 |
| Variante alternativa | 5.344 | 65.299 | 77.218 | 147.861 | 1,32 | 0,100 |
| Hermano de aproximadamente 276K | no disponible | no disponible | no disponible | aproximadamente 276.000 | 2,04 | no disponible |

No hay datos disponibles de modelos externos comparables (parametros, contexto, rendimiento, licencia o disponibilidad) en la informacion proporcionada, por lo que no se puede trazar una comparativa con alternativas de terceros.

## Limitaciones y advertencias

- Inteligibilidad limitada: WER de 0,105 sobre el conjunto retenido de 24 frases, con solo 7 de 24 frases correctas en su totalidad. Los errores se concentran previsiblemente en palabras ausentes de los diccionarios G2P, que dependen del modelo de respaldo neuronal.
- Naturalidad baja: SCOREQ 1,48 y DNSMOS-OVRL 2,95, claramente por debajo de modelos TTS de mayor tamano. No es adecuado para locucion comercial o audiolibros sin revision.
- Solo ingles: no hay soporte multilingue ni se documenta ningun otro idioma.
- Sin control de locutor, estilo, emocion ni prosodia: no se documenta ninguna capacidad de voces multiples, clonacion, SSML ni marcado de prosodia.
- Riesgo de pronunciacion erronea (equivalente acustico de alucinacion): el fallback neuronal del G2P puede generar fonemas incorrectos para palabras desconocidas, sin mecanismo de confianza documentado.
- Dependencia del ruido en el decodificador: el decodificador es alimentado por ruido y la model card indica que en inferencia el ruido cero es la mejor opcion; desviarse de esa configuracion puede introducir artefactos.
- Hereda los sesgos del profesor: al ser un modelo destilado, cualquier sesgo de acento, genero o dominio del profesor TTS se transfiere al estudiante, y no se documenta cual era ese profesor.
- Validacion externa nula: 0 descargas y 0 likes en el momento de la ficha, sin evaluaciones independientes.
- Repositorio reportado como 0,0 GB: posible artefacto de la API; los pesos reales deberian ocupar menos de 1 MB en fp32.
- Licencia: MIT para pesos y runtime, lo que permite uso comercial, pero los datos G2P incluidos son Apache-2.0 y deben conservar su atribucion. Conviene verificar la licencia del vocoder preentrenado del que se recorta la inicializacion del decodificador, que no se identifica en la model card.
- Documentacion incompleta: la model card esta truncada al final de la etapa 3 de entrenamiento, por lo que los detalles finales de ajuste y evaluacion no estan disponibles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/VantoraLabs/Vocetta2-147k
- Resultados de busqueda web: la busqueda no devolvio ningun enlace relevante al modelo; los resultados obtenidos correspondian a fabricantes de maquinaria forestal y no guardan relacion con Vocetta2-147k.
- Paper, blog, repositorio o demo adicionales: no disponible en la informacion proporcionada.
