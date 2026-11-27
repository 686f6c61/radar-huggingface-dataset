# starwarrior/goban-katago-human

## Resumen

`starwarrior/goban-katago-human` es una conversión a formato ONNX de la red neuronal supervisada de KataGo denominada `b18c384nbt-humanv0`, entrenada para predecir movimientos humanos de Go (baduk/weiqi) en función del rango (rank) y la era del jugador. El modelo original lo desarrolla David J Wu ("lightvector") como parte del proyecto KataGo, y esta versión ha sido convertida por el usuario `starwarrior` utilizando el exportador oficial `katago dumponnx` de KataGo v1.18.1, sin modificaciones más allá del cambio de formato.

El interés de esta ficha es acotado pero específico: no se trata de un modelo de lenguaje, sino de una red neuronal de política y valor para Go, empaquetada como ONNX para poder ejecutarse en el navegador mediante ONNX Runtime Web. El repositorio ocupa aproximadamente 0,1 GB y el archivo ONNX resultante pesa 107.204.406 bytes (unos 102 MiB).

La relevancia actual radica en que permite desplegar el análisis de estilo humano de KataGo en entornos web sin depender de binarios nativos, lo que facilita la integración en aplicaciones de análisis de partidas, visores de SGF o herramientas docentes de Go. No hay información sobre idiomas, pipeline ni benchmarks en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal convolucional de KataGo (bloques residuales con normalización por lotes), variante b18c384nbt |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada de tablero 19×19) |
| Tipos de cuantizacion | no disponible (el repositorio solo incluye el ONNX en precisión original) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | katago-neural-network-license |
| Formato de pesos | ONNX (`b18c384nbt-humanv0.onnx`) |

## Arquitectura y entrenamiento

La red es la variante `b18c384nbt` de KataGo: 18 bloques residuales, 384 canales y uso de normalización por lotes (nbt). Se trata de una red de política y valor para el juego de Go que, en esta versión "human", ha sido entrenada mediante aprendizaje supervisado sobre partidas humanas, con el objetivo de predecir movimientos plausibles para distintos rangos y épocas históricas, en lugar de jugar de forma óptima como las redes de entrenamiento por refuerzo.

La condicionalidad por rango se implementa a través de un tensor `InputMeta` de 192 canales, que KataGo rellena a partir de los metadatos del perfil de estilo humano (`humanSLProfile`, en `cpp/neuralnet/sgfmetadata.cpp`). La conversión a ONNX se realizó con el exportador oficial de KataGo v1.18.1 (compilación con backend ONNX) usando ajustes por defecto: buffer de tablero de 19×19 con enmascaramiento y `scale8` aplicado. No se dispone de información sobre el volumen de tokens, composición del dataset ni fases de RLHF/DPO en la información proporcionada.

## Capacidades

- Predicción de movimientos humanos de Go condicionada por rango y era del jugador.
- Evaluación de posición (valor) propia de las redes KataGo, en el marco de la red human SL.
- Entrada de tablero de 19×19 con enmascaramiento, según los ajustes por defecto del exportador.
- Ejecución en navegador mediante ONNX Runtime Web.
- Metadatos `katago.*` embebidos (versión de modelo 15, escala de salida 8, multiplicadores de posprocesado).
- No soporta tool calling, agentes, razonamiento multi-paso genérico, visión ni audio; es una red específica de Go.
- Capacidades multilingües: no aplica.

## Casos de uso

- Análisis de estilo humano en visores web de SGF: el modelo puede integrarse con ONNX Runtime Web para sugerir movimientos plausibles para un rango concreto (por ejemplo, 5 kyu) y compararlos con los jugados, sin necesidad de backend nativo.
- Herramientas docentes de Go: permite mostrar a estudiantes qué movimientos son típicos de distintos niveles y épocas, aprovechando la condicionalidad por `InputMeta` de 192 canales.
- Revisión de partidas en aplicaciones de escritorio o web que ya usan KataGo: al estar en ONNX, se puede sustituir la red de juego óptimo por esta red human SL para un análisis más cercano al estilo del jugador.
- Detección de "movimientos fuera de rango": comparar la política predicha para el rango declarado con el movimiento real puede señalar errores o jugadas atípicas.
- Prototipado rápido en el navegador: al pesar ~102 MiB y ejecutarse con ONNX Runtime Web, es viable desplegarlo en demos sin instalar KataGo.
- Investigación sobre modelado de estilos de juego: la condicionalidad por era y rango permite estudiar la evolución histórica del estilo de juego en partidas humanas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el archivo ONNX ocupa 107.204.406 bytes (~102 MiB), lo que da una cota inferior del peso en memoria.
- GPU recomendadas: no disponible. Al ejecutarse con ONNX Runtime Web, el modelo está pensado para navegador (WebGPU/WASM) además de entornos nativos con ONNX Runtime.
- ¿Cabe en GPU de consumo? El tamaño del archivo (~102 MiB) sugiere que sí es viable en GPU de consumo, pero no se dispone de cifras oficiales de VRAM ni de requisitos mínimos.
- Opciones de despliegue: ONNX Runtime Web (navegador), ONNX Runtime nativo; también puede reconvertirse al formato nativo de KataGo (`.bin.gz`) si se dispone del pipeline adecuado, aunque esto no está documentado en la información proporcionada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Formato | Tamaño | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `starwarrior/goban-katago-human` (esta ficha) | ONNX | ~102 MiB | no aplica (tablero 19×19) | katago-neural-network-license | Hugging Face |
| `b18c384nbt-humanv0` (original KataGo) | `.bin.gz` nativo KataGo | no disponible | no aplica | katago-neural-network-license | katagotraining.org/extra_networks |
| Redes KataGo de entrenamiento por refuerzo (no human SL) | `.bin.gz` nativo KataGo | no disponible | no aplica | katago-neural-network-license | Repositorio oficial de KataGo |

No se dispone de datos de rendimiento (Elo, precisión de predicción de movimientos) en la información proporcionada para comparar cuantitativamente con alternativas.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni agentes; cualquier uso fuera del análisis de Go queda fuera de su ámbito.
- Sesgos conocidos: la red está entrenada sobre partidas humanas, por lo que reproduce estilos y sesgos de la población de jugadores representada; no se documenta la composición del dataset en la información disponible.
- Riesgo de alucinación: no aplica en el sentido habitual, pero la política puede predecir movimientos plausibles para un rango que no correspondan a la mejor jugada; es un modelo de estilo, no de juego óptimo.
- Limitaciones de contexto o idioma: no aplica idioma; el tablero está fijado a 19×19 con enmascaramiento según los ajustes por defecto del exportador.
- Restricciones de licencia: la KataGo Neural Network License es una licencia específica distinta de las licencias de código abierto habituales; debe revisarse el archivo `LICENSE` del repositorio antes de cualquier uso comercial o redistribución.
- Caveat para producción: el repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-11-27), por lo que no hay evidencia de uso en producción; conviene validar la integridad del archivo mediante el sha256 indicado (`571159a5cdad59eef673a77a6ffeea440d7472db2fa1cf51f471b3809bafc697`).

## Enlaces

- Hugging Face: https://huggingface.co/starwarrior/goban-katago-human
- Red original: https://katagotraining.org/extra_networks/
- Documentación de archivos ONNX de KataGo: https://github.com/lightvector/KataGo/blob/master/docs/ONNX_Model_Files.md
- Repositorio KataGo: https://github.com/lightvector/KataGo
- ONNX Runtime Web: https://onnxruntime.ai/docs/tutorials/web/
