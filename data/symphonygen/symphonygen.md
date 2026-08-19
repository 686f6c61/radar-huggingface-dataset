# SymphonyGen/SymphonyGen

## Resumen

SymphonyGen es un marco jerárquico tridimensional para la generación de música orquestal simbólica (MIDI) orientada a la cinematografía contemporánea, desarrollado por un equipo de investigadores y aceptado en ISMIR 2026. El modelo descompone las partituras sinfónicas en tres ejes (compás, pista y evento) mediante una arquitectura de decodificadores en cascada, lo que permite generar orquestaciones completas a partir de un esqueleto armónico de múltiples voces cuantizado por pulsos (condicionamiento tipo "short-score"). Esta descomposición facilita el control explícito de la armonía, una capacidad poco común en los generadores de música simbólica existentes.

El sistema consta de dos etapas: un modelo ligero de 87 millones de parámetros que genera esqueletos armónicos, y un modelo sinfónico principal de 124 millones de parámetros que orquesta esos esqueletos en partituras completas. El modelo principal se preentrena con el SymphonyNet Dataset (más de 46.000 archivos MIDI) y se refina mediante GRPO (Group Relative Policy Optimization) con una recompensa basada en embeddings de audio de CLaMP 3, lo que alinea la salida simbólica con la percepción auditiva. Además, incorpora un muestreo adverso a la disonancia para reducir choques tonales en la inferencia. Todo el código y los pesos están disponibles bajo licencia MIT, lo que lo hace atractivo para integración en flujos de trabajo de composición asistida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con decodificadores en cascada, descomposicion 3D (Bar, Track, Event) |
| Parametros totales | 87M (etapa 1, esqueleto armonico) + 124M (etapa 2, modelo sinfonico) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (musica simbolica MIDI) |
| Licencia | MIT |
| Formato de pesos | .pt (PyTorch, config y pesos empaquetados) |

## Arquitectura y entrenamiento

SymphonyGen utiliza una arquitectura de transformador con decodificadores en cascada que procesa la partitura en tres dimensiones jerarquicas: compases (Bar), pistas (Track) y eventos (Event). La etapa 1 es un modelo de 12 capas con hidden size 768 (87M parametros) que genera el esqueleto armonico, una representacion condensada de multiples voces cuantizadas por pulsos. La etapa 2 es un modelo de 33 capas con hidden size 512 (124M parametros) que incorpora atencion cruzada de dos flujos (2-stream cross-attention) para orquestar el esqueleto en una partitura completa. Esta descomposicion permite condicionar la generacion sobre armonias definidas por el usuario, ya sean generadas automaticamente o escritas manualmente como acordes MIDI.

El entrenamiento se realiza en dos fases. Primero, un preentrenamiento supervisado sobre el SymphonyNet Dataset (728 piezas clasicas y 45.632 contemporaneas, dividido 90/10) durante un dia en cuatro GPU NVIDIA H800, con optimizador AdamW, tasa de aprendizaje 1e-4 y programacion coseno. Despues, un refinamiento con GRPO en una sola GPU con tasa 4e-5 y grupo de 32 muestras por esqueleto, donde la recompensa es la similitud coseno entre los embeddings de audio de CLaMP 3 (renderizados con MuseScore 3) y un conjunto de referencia cinematografica, opcionalmente combinada con un termino de densidad de pistas (factor 0.2). En la inferencia se aplica un muestreo adverso a la disonancia con parametros recomendados (λ_hn, λ_nn) = (1, 10), y se puede activar un decaimiento de registros para el checkpoint reforzado con densidad de pistas.

## Capacidades

- Generacion de musica orquestal simbolica completa en formato MIDI, con multiples pistas e instrumentacion.
- Control explicito de la armonia mediante un esqueleto armonico (short-score) que puede ser generado por el modelo, analizado desde un MIDI existente o escrito manualmente por el usuario.
- Re-orquestacion de piezas MIDI existentes: el modelo analiza el esqueleto armonico de una cancion y produce una nueva orquestacion.
- Composicion asistida para cine contemporaneo, orientada a estilos cinematicos modernos.
- Refinamiento con GRPO que mejora la percepcion auditiva de las salidas, reduciendo disonancias no deseadas.
- No incluye soporte para tool calling, agentes ni procesamiento de lenguaje natural; su entrada y salida son exclusivamente simbolicas (MIDI).

## Casos de uso

- Composicion de bandas sonoras para cine y videojuegos: el compositor define una progresion de acordes como esqueleto y SymphonyGen genera una orquestacion completa con texturas y densidades adecuadas, acelerando el prototipado de temas.
- Re-orquestacion de piezas existentes: dado un MIDI monofonico o simplificado, el modelo analiza su armonia y produce una version orquestal con nuevas voces e instrumentacion, util para adaptar canciones a formatos sinfonicos.
- Generacion de esqueletos armonicos para estudio: la etapa 1 puede producir multiples variaciones de progresiones armonicas que el compositor puede usar como punto de partida para desarrollo melódico.
- Educacion musical: estudiantes de orquestacion pueden experimentar con diferentes esqueletos armonicos y observar como el modelo los transforma en texturas orquestales, sirviendo como herramienta pedagogica interactiva.
- Produccion musical en estudio: integracion en DAWs mediante scripts que llaman al generador para crear pasajes orquestales de relleno o transiciones, reduciendo el tiempo de busqueda de samples.
- Investigacion en generacion musical: el marco 3D y el condicionamiento por esqueleto armonico ofrecen un punto de referencia para estudiar el control estructural en modelos generativos de musica simbolica.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. El paper reporta metricas objetivas (similitud CLaMP, disonancia, densidad de pistas, precision/recall armonico, movimiento melodico y ornamentacion) y dos rondas de pruebas subjetivas de escucha, pero los valores concretos no se incluyen en la model card. Ademas, los autores advierten que la reproducibilidad exacta de las metricas objetivas puede variar segun la implementacion del analisis armonico y los filtros del esqueleto, aunque las tendencias deberian mantenerse.

## Requisitos de hardware

- Los checkpoints tienen un tamano reducido: el modelo de esqueleto armonico (87M) y el modelo sinfonico (124M) ocupan menos de 1 GB cada uno en formato .pt.
- La inferencia es factible en GPUs de consumo con al menos 4-8 GB de VRAM, aunque no hay cifras oficiales de VRAM ni de latencia publicadas.
- El preentrenamiento se realizo con 4 GPU NVIDIA H800 durante un dia; el refinamiento GRPO con una sola GPU.
- Para despliegue, el codigo oficial proporciona scripts de generacion en Python (PyTorch) y no se mencionan integraciones con vLLM, llama.cpp u Ollama, dado que el modelo no es un LLM generico sino un generador de musica simbolica.
- No se dispone de datos de throughput o latencia medidos; el tiempo de generacion dependera del numero de compases, pistas y eventos de la salida.

## Comparativa con modelos similares

No se dispone de informacion comparativa publicada en la model card o en la informacion proporcionada. El paper menciona comparaciones con lineas base en las pruebas subjetivas, pero no se especifican los nombres de esos modelos en este extracto. Por tanto, no se puede ofrecer una tabla comparativa fiable sin datos adicionales.

## Limitaciones y advertencias

- El modelo esta orientado exclusivamente a la cinematografia contemporanea; su rendimiento en otros generos musicales puede ser suboptimo.
- Las salidas generadas pueden parecerse involuntariamente a obras existentes; el usuario debe verificar la originalidad antes de un uso comercial.
- No es un reemplazo autonomo del compositor: esta disenado como una herramienta de asistencia colaborativa.
- La reproducibilidad de las metricas objetivas puede variar segun la implementacion del analisis armonico (ver DIFF.md en el repositorio).
- No se proporcionan datos sobre sesgos especificos del dataset (por ejemplo, predominio de estilos occidentales o limitaciones en la diversidad instrumental).
- La longitud de contexto no esta documentada, por lo que no se conocen limites maximos de compases o pistas en una generacion unica.

## Enlaces

- HuggingFace: https://huggingface.co/SymphonyGen/SymphonyGen
- Paper (arXiv): https://arxiv.org/abs/2604.25498
- Codigo (GitHub): https://github.com/symphonygen/symphonygen
- Pagina de demos: https://symphonygen.github.io
- Dataset SymphonyNet: https://symphonynet.github.io/
