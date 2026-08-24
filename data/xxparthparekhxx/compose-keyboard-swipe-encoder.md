# xxparthparekhxx/compose-keyboard-swipe-encoder

## Resumen

El modelo `compose-keyboard-swipe-encoder` es un codificador convolucional temporal (TCN) de 634K parámetros diseñado para el reconocimiento de gestos de deslizamiento (swipe/glide typing) en teclados Android. Desarrollado por Parth Parekh, forma parte del teclado de código abierto Compose Keyboard, un IME para Android construido con Jetpack Compose. El modelo resuelve el problema de decodificar trayectorias de dedo sobre un teclado para predecir la palabra escrita, sustituyendo a los decodificadores geométricos tradicionales.

La innovación principal es su agnosticismo respecto a la disposición del teclado: en lugar de aprender un parámetro por tecla, emite un patrón espacial 2D como 64 coeficientes coseno (DCT 8×8), de modo que los mismos pesos funcionan para cualquier diseño de teclado, tamaño de pantalla u orientación. Entrenado sobre ~896.000 trazas de gestos humanos reales del dataset FUTO Swipe, alcanza una precisión Top-1 del 92,09% en el lexicón extendido de FUTO, con un peso de solo 2,5 MB que se ejecuta íntegramente en el dispositivo en Kotlin puro, sin dependencias de inferencia externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Temporal Convolutional Network (TCN) con bloques ConvNeXt-v2 |
| Parametros totales | 634K |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa trayectorias de 64 puntos temporales) |
| Tipos de cuantizacion | fp32 (2,5 MB, BatchNorm plegado en convoluciones) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | binario plano personalizado (`swipe_encoder.bin`, formato "SWEN") |

## Arquitectura y entrenamiento

El modelo es una red neuronal convolucional temporal (TCN) con una estructura de stem y 5 bloques ConvNeXt-B2 apilados. La entrada es una trayectoria de 64 puntos de gesto remuestreados uniformemente en el tiempo, de la que se extraen 8 canales de características mediante un filtro Savitzky-Golay de 7 taps: posicion suavizada (x, y), velocidad (vx, vy), aceleracion (ax, ay), velocidad absoluta (‖v‖) y curvatura (dθ/dt). Cada bloque TCN aplica convolucion depthwise, normalizacion por lotes, activacion GLU, normalizacion de respuesta global (GRN) y atencion por squeeze-and-excitation, con dilataciones progresivas de 1, 2, 3, 5 y 8 para capturar dependencias temporales multiescala.

La salida consta de dos ramas: una que produce 64 coeficientes de DCT 8×8 que definen un patron espacial continuo sobre el teclado, y una compuerta de intencion λ que pondera la contribucion del gesto. El teclado se lee muestreando este patron en las coordenadas (x, y) de cada tecla, lo que hace que el modelo sea independiente del layout. Se entrena con CTC (Connectionist Temporal Classification) sobre 32 frames de emision para 26 letras mas el token blank, lo que permite distinguir palabras con la misma trayectoria geometrica pero duracion temporal distinta (ej. "putt" vs "put"). El entrenamiento usa co-aumentacion de trayectoria y layout conjuntamente (rotacion, volteo, escala, cizalla, traslacion y inversion temporal) sobre ~896.000 deslizamientos reales del dataset FUTO, con una epoca de entrenamiento.

## Capacidades

- Decodificacion de gestos de deslizamiento para teclados táctiles, transformando trayectorias de 64 puntos en secuencias de palabras.
- Agnóstico al layout del teclado: funciona con cualquier disposicion (QWERTY, Dvorak, Colemak, layouts personalizados), tamano de pantalla y orientacion sin reentrenamiento.
- Distincion de palabras con la misma trayectoria geometrica mediante semantica CTC, resolviendo casos como "putt" vs "put" o "on" vs "ion".
- Inferencia completamente en el dispositivo: se ejecuta en Kotlin puro sin librerias de inferencia externas, con solo 430 lineas de codigo.
- Capacidad multilingue limitada al ingles (el lexico de 150.289 palabras esta en ingles y el modelo se entreno con datos de ese idioma).
- Funciona como componente del teclado Compose Keyboard, con fallback a un decodificador geometrico (SHARK²) si no se cargan los pesos.

## Casos de uso

- **Escritura por deslizamiento en teclados Android**: el caso principal. El modelo decodifica en tiempo real los gestos del usuario sobre el teclado Compose Keyboard, convirtiendo trayectorias en palabras con alta precision y latencia minima en el dispositivo.
- **Teclados de codigo abierto**: cualquier proyecto de IME puede integrar este modelo como motor de decodificacion de gestos, sustituyendo heuristicas geometricas por un enfoque neuronal. El formato binario documentado y la licencia MIT facilitan su integracion.
- **Sistemas de accesibilidad**: el reconocimiento de gestos puede adaptarse a usuarios con dificultades motoras que prefieren deslizar en lugar de pulsar teclas individuales, mejorando la velocidad de escritura.
- **Investigacion en interaccion persona-ordenador**: el modelo sirve como punto de partida para estudiar el reconocimiento de gestos de entrada, ya que su arquitectura es compacta y reproducible, y el dataset FUTO esta disponible abiertamente.
- **Prototipado de teclados con layouts experimentales**: gracias a su agnosticismo de layout, se puede probar rapidamente nuevas disposiciones de teclado sin necesidad de reentrenar el modelo, solo cambiando la matriz de base DCT.
- **Aplicaciones de entrada de texto para dispositivos de bajo coste**: el modelo pesa 2.5 MB y se ejecuta en CPU, lo que lo hace adecuado para telefonos de gama baja o dispositivos embebidos sin GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible mas alla de los declarados por el autor en la model card. Se presentan los datos oficiales del modelo sobre el dataset FUTO Swipe Gesture Dataset (split de test):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Swipe Word Decoding | FUTO Swipe Gesture Dataset (test) | Top-1 Accuracy (lexicon extendido) | 92.09% |
| Swipe Word Decoding | FUTO Swipe Gesture Dataset (test) | Top-3 Accuracy (lexicon extendido) | 97.69% |
| Swipe Word Decoding | FUTO Swipe Gesture Dataset (test) | Top-1 Accuracy (solo lexicon de la app) | 85.78% |

No se proporcionan resultados de comparacion con otros modelos de decodificacion de gestos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere VRAM; se ejecuta en CPU en el dispositivo movil.
- GPU recomendadas: ninguna, el modelo esta disenado para inferencia on-device en CPU de telefonos Android.
- Cabe en cualquier GPU consumer, pero no es necesario; el archivo de pesos pesa 2.5 MB y el forward pass es extremadamente ligero.
- Opciones de despliegue: integrado en el teclado Compose Keyboard via Kotlin puro; tambien se puede ejecutar en cualquier entorno que lea el formato binario personalizado (documentado en la model card). No se ha publicado soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se proporcionan datos oficiales, pero al ser una TCN de 634K parametros con 32 frames de salida, la inferencia en CPU movil se estima en el rango de unos pocos milisegundos por gesto.

## Comparativa con modelos similares

No se dispone de informacion comparativa con otros modelos de decodificacion de gestos en la informacion proporcionada. El propio autor menciona que el modelo sustituye a los decodificadores geometricos tradicionales (familia SHARK²), que usan remuestreo por longitud de arco y no pueden distinguir palabras con la misma trayectoria geometrica. Como alternativa, se podria considerar el decodificador geometrico incluido en Compose Keyboard como fallback, pero no se aportan datos de rendimiento de ese sistema.

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente con datos en ingles y su lexico de 150.289 palabras es solo en ese idioma. No se ha probado con otros idiomas, por lo que su rendimiento fuera del ingles es desconocido.
- El modelo solo procesa trayectorias de 64 puntos remuestreados uniformemente en tiempo; gestos muy rapidos o muy lentos pueden degradar la precision.
- Riesgo de alucinacion de palabras: como todo modelo neuronal, puede predecir palabras que no corresponden al gesto, especialmente con entradas ruidosas o fuera de distribucion.
- El formato binario es propietario (documentado pero no estandarizado), lo que limita su integracion con frameworks de inferencia convencionales.
- La licencia MIT permite uso comercial, pero el dataset FUTO Swipe tiene su propia licencia que debe verificarse por separado.
- El modelo es un componente del teclado Compose Keyboard: sin los pesos cargados, el teclado cae a un decodificador geometrico con peor rendimiento.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/xxparthparekhxx/compose-keyboard-swipe-encoder)
- [Repositorio del teclado Compose Keyboard](https://github.com/xxparthparekhxx/keyboard)
- [Dataset FUTO Swipe Gesture Dataset](https://huggingface.co/datasets/futo-org/swipe.futo.org)
- [Perfil de HuggingFace del autor](https://huggingface.co/xxparthparekhxx)
- [Perfil de GitHub del autor](https://github.com/xxparthparekhxx/)
