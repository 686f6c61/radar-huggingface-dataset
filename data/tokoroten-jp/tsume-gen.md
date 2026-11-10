# tokoroten-jp/tsume-gen

## Resumen

tsume-gen es un conjunto de pesos para la generación automática de problemas de tsume shogi (詰将棋), el equivalente japonés al problema de mate en ajedrez. Lo desarrolla tokoroten-jp y se publica como material asociado al artículo «Prosym 68», que describe un sistema de generación de tsume shogi que combina un modelo generativo MaskGIT con un solver exacto dentro de un bucle de aprendizaje por refuerzo. El modelo no resuelve problemas ni juega al shogi: su tarea es rellenar de forma conjunta el tablero y las tres primeras jugadas de la solución partiendo de máscaras.

La relevancia es doble. Por un lado, aborda un dominio muy específico (composición de problemas de shogi) donde los generadores de texto genéricos fallan estrepitosamente porque la validez de la salida la determina un solver, no un juez humano. Por otro, el diseño es un ejemplo compacto de cómo integrar una recompensa verificable y exacta en el entrenamiento de un modelo generativo de estructura discreta. Los pesos son minúsculos (entre 7,5 M y 85,9 M de parámetros, en float32), lo que los hace ejecutables en CPU y útiles como banco de pruebas para técnicas de RL con verificación.

El repositorio incluye cinco variantes: tres modelos de ajuste supervisado (SFT) de tamaños crecientes, un modelo grande afinado con RL de tipo branch-rollout y su media móvil exponencial (EMA). La licencia es CC BY 4.0 y el único idioma declarado es el japonés, aunque la salida del modelo es una posición de tablero y una secuencia de jugadas, no texto libre.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MaskGIT (generación iterativa por enmascarado y predicción de tokens) |
| Parámetros totales | 7,5 M (`sft-small`), 25,9 M (`sft-medium`), 85,9 M (`sft-large`, `branch-rl-large`, `branch-rl-large-ema`) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (los pesos se publican en float32) |
| Idiomas soportados | ja (japonés; la salida es una posición y jugadas de shogi, no texto) |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors (`model.safetensors` por carpeta, state dict en float32) |

Variantes y configuración declarada:

| Carpeta | Descripción | Parámetros |
|---|---|---|
| `sft-small` | SFT, 100 000 pasos, 4 capas × 384 | 7,5 M |
| `sft-medium` | SFT, 100 000 pasos | 25,9 M |
| `sft-large` | SFT, 100 000 pasos, 12 capas × 768; baseline del artículo | 85,9 M |
| `branch-rl-large` | `sft-large` + RL de tipo sibling (branch-rollout) con término SFT, 2000 pasos; pesos usados en el artículo | 85,9 M |
| `branch-rl-large-ema` | EMA (0,99) del mismo entrenamiento | 85,9 M |

Cada carpeta contiene `model.safetensors` y `config.json`; este último incluye la configuración del modelo, los pasos de entrenamiento y el sha256 del checkpoint de origen y de los datos de entrenamiento.

## Arquitectura y entrenamiento

La arquitectura es MaskGIT aplicada a un tablero de shogi y a la secuencia de jugadas de la solución. El generador parte de una representación enmascarada y la rellena de forma iterativa: en cada paso predice los tokens que faltan y va desenmascarando, de modo que el tablero y las tres primeras jugadas de la solución se generan conjuntamente en lugar de en dos etapas separadas. Las variantes SFT se entrenaron durante 100 000 pasos; `sft-large` usa 12 capas y dimensión 768, y es el baseline del artículo.

Sobre ese baseline, `branch-rl-large` aplica un refinamiento por aprendizaje por refuerzo de tipo sibling o branch-rollout durante 2000 pasos, manteniendo un término de pérdida SFT. La señal de recompensa proviene de un solver exacto de tsume shogi que valida si el problema generado es correcto, lo que constituye la innovación central del trabajo: el generador se optimiza contra un verificador determinista en lugar de contra preferencias humanas. `branch-rl-large-ema` es la media móvil exponencial (factor 0,99) del mismo entrenamiento. No se detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo otras fases de ajuste.

## Capacidades

- Generación conjunta de un tablero de tsume shogi y de las tres primeras jugadas de su solución a partir de una entrada enmascarada.
- Generación iterativa por desenmascarado (esquema MaskGIT), no autorregresiva token a token.
- Producción de problemas candidatos que pueden validarse con un solver exacto externo.
- Variantes de distinto tamaño que permiten ajustar el coste computacional al presupuesto disponible.
- Capacidad de refinamiento por RL con recompensa verificable (variante `branch-rl-large`).
- No soporta tool calling, function calling, razonamiento multi-paso en lenguaje natural, visión ni audio.
- No es un modelo multilingüe: el dominio y la etiqueta de idioma son exclusivamente japoneses, y la salida es una estructura de juego.

## Casos de uso

- Generación de bancos de problemas de tsume shogi para entrenamiento: el modelo produce candidatos de tablero y solución que después se filtran con un solver exacto, lo que permite crear corpus a escala sin anotación manual. El dataset asociado (`generated-tsume-shogi`) sugiere exactamente este flujo.
- Investigación en RL con recompensa verificable: `branch-rl-large` sirve como caso de estudio reproducible de cómo un solver actúa como reward model determinista en un dominio discreto y de tamaño reducido.
- Aumento de datos para motores de shogi: los problemas generados y validados pueden alimentar entrenamientos de solvers o de evaluadores de posiciones de mate.
- Docencia y divulgación del shogi: generación de problemas de dificultad controlada para materiales didácticos, siempre que se validen antes de su publicación.
- Benchmark de técnicas de generación discreta: al ser modelos de 7,5 a 85,9 M de parámetros en float32, permiten comparar MaskGIT, SFT y RL en un entorno de un solo equipo sin infraestructura especial.
- Pruebas de pipelines de verificación: integración de un generador neuronal con un solver formal para medir tasas de validez, coste de búsqueda y diversidad de los problemas producidos.
- Experimentación académica sobre composición de problemas: estudio de qué sesgos estructurales introduce el generador (tipos de pieza, patrones de mate) comparando las distintas variantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 para la variante de 85,9 M de parámetros; el repositorio completo ocupa 1,2 GB porque incluye las cinco variantes.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria es suficiente; no se requiere A100 ni H100.
- Cabe holgadamente en GPU de consumo (RTX 3060, RTX 4090, etc.) y también en CPU.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; el autor indica que añadirá un ejemplo en Python para ejecutar el generador, y el código estará en el repositorio de GitHub (MIT, en preparación).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Dominio | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tsume-gen (`branch-rl-large`) | Generación de tsume shogi | 85,9 M | no disponible | CC BY 4.0 | Pesos en Hugging Face |
| tsume-gen (`sft-small`) | Generación de tsume shogi | 7,5 M | no disponible | CC BY 4.0 | Pesos en Hugging Face |
| Modelos de lenguaje de propósito general | Texto | Miles de millones | Decenas de miles de tokens | Variable | Amplia |

No se dispone de información sobre otros generadores de tsume shogi publicados con los que establecer una comparación cuantitativa; los modelos de lenguaje de propósito general no son comparables en la tarea porque no producen posiciones válidas de forma fiable sin un verificador externo.

## Limitaciones y advertencias

- El modelo no garantiza que los problemas generados sean válidos: la validación requiere un solver exacto externo, que es precisamente el componente con el que se entrena la variante RL.
- El dominio es exclusivamente el tsume shogi; no es reutilizable para ajedrez, shogi general ni generación de texto.
- La información publicada no detalla el dataset de entrenamiento (composición, número de posiciones, filtros aplicados), lo que limita la evaluación de sesgos estructurales.
- No hay benchmarks publicados, por lo que no es posible comparar su tasa de validez con la de otros sistemas.
- El código de inferencia aún no está disponible: el repositorio de GitHub figura como «en preparación», lo que dificulta la reproducibilidad inmediata.
- La licencia CC BY 4.0 permite uso comercial con atribución, pero obliga a citar la autoría y a indicar los cambios; conviene revisar los términos antes de integrarlo en un producto.
- El estado del arte en esta tarea cambia rápido y el modelo se publicó con fecha de 2026-11-10; verifique si existen versiones posteriores antes de adoptarlo.
- Al ser pesos en float32 y de pequeño tamaño, el riesgo de alucinación en el sentido habitual no aplica, pero sí el de generar problemas sin solución o con solución incompleta si no se valida la salida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tokoroten-jp/tsume-gen
- Dataset asociado: https://huggingface.co/datasets/tokoroten-jp/generated-tsume-shogi
- Código (MIT, en preparación): https://github.com/tokoroten/tsume-gen
