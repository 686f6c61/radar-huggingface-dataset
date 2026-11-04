# yikuuun/proteus

## Resumen

ProTEUS es un checkpoint de pesos publicado por el usuario yikuuun (con repositorio de código en la cuenta de GitHub yikunpku) bajo el nombre de "mutation-resolved world model for closed-loop protein evolution". Se trata, por tanto, de un modelo orientado a la ingeniería de proteínas y a la predicción del efecto de mutaciones, no de un modelo de lenguaje natural al uso. El repositorio de HuggingFace contiene únicamente el fichero de pesos `proteus_release.pth` (8.654.985.537 bytes, aproximadamente 8,06 GiB) y una model card mínima que remite al repositorio de GitHub para código, documentación y demo.

La relevancia del modelo radica en su planteamiento como "world model" resuelto por mutaciones para evolución de proteínas en bucle cerrado (closed-loop), una formulación que sugiere el uso del modelo como simulador del paisaje de fitness para guiar campañas de evolución dirigida. Sin embargo, la información pública disponible es extremadamente escasa: no se detallan arquitectura, número de parámetros, contexto, datos de entrenamiento ni resultados de benchmarks. La ficha que sigue refleja exclusivamente lo que puede verificarse a partir de los metadatos y la model card, marcando como "no disponible" todo aquello que el autor no ha hecho público.

El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial y modificación, y el checkpoint se publica en formato PyTorch (`.pth`), no en safetensors ni GGUF. Con cero descargas y cero likes en el momento de la consulta, se trata de una publicación reciente (creada el 4 de noviembre de 2026) sin validación comunitaria todavía.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (descrita como "mutation-resolved world model"; no se detalla la familia arquitectónica) |
| Parametros totales | no disponible (el fichero de pesos ocupa 8,06 GiB, lo que sugiere un orden de magnitud de miles de millones de parámetros, pero no se confirma) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publica el checkpoint en precisión original `.pth`) |
| Idiomas soportados | no disponible (modelo de proteínas; no aplica el concepto de idioma natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`.pth`), fichero `proteus_release.pth` |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo. La única información técnica verificable es la denominación que el autor le da: "mutation-resolved world model for closed-loop protein evolution". El término "world model" en este contexto suele designar un modelo generativo o predictivo que aprende la dinámica de un entorno (aquí, el paisaje de fitness de una proteína) y que se utiliza para planificar experimentalmente. "Mutation-resolved" indica que el modelo opera a resolución de mutación individual, es decir, que predice o modela el efecto de sustituciones concretas en la secuencia. "Closed-loop" sugiere que está pensado para integrarse en ciclos diseño-predicción-ensayo experimental, donde las predicciones del modelo guían la selección de variantes a sintetizar y los resultados realimentan el siguiente ciclo.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset (por ejemplo, secuencias de UniProt, datos de Deep Mutational Scanning u otros), ni sobre si se emplearon técnicas de alineación como RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas (atención lineal, decodificación especulativa, etc.). El repositorio de GitHub enlazado (`https://github.com/yikunpku/ProTEUS`) es la fuente indicada por el autor para obtener estos detalles, pero su contenido no forma parte de la información proporcionada.

## Capacidades

- Modelado del efecto de mutaciones en proteínas, a resolución de mutación individual según la descripción del autor.
- Simulación de un "paisaje de fitness" o dinámica de evolución proteica, en tanto que "world model".
- Soporte para evolución dirigida en bucle cerrado: el modelo está concebido para integrarse en ciclos de diseño-predicción-ensayo.
- Ingeniería de proteínas: aplicación declarada en las etiquetas del repositorio (`protein-engineering`).
- Predicción del efecto de mutaciones (`mutation-effect-prediction`), según las etiquetas.
- No se documentan capacidades de generación de texto, código, matemáticas, visión, audio, tool calling ni razonamiento multi-paso en el sentido de los LLM de propósito general.

## Casos de uso

- Evolución dirigida de enzimas: el modelo se usaría para puntuar variantes candidatas generadas por mutagénesis y priorizar las que se sintetizan y ensayan en el laboratorio, reduciendo el número de experimentos necesarios en cada ronda del ciclo.
- Predicción de efectos de mutaciones puntuales: dado un conjunto de sustituciones candidatas en una proteína de interés, el modelo estimaría su impacto en fitness, permitiendo filtrar bibliotecas de variantes antes de su caracterización experimental.
- Optimización de estabilidad proteica: en el diseño de proteínas terapéuticas o industriales, el modelo podría guiar la selección de mutaciones que aumenten la estabilidad sin comprometer la función.
- Diseño de bibliotecas de mutagénesis dirigida: uso del modelo para construir bibliotecas sesgadas hacia regiones de la secuencia con mayor probabilidad de mejora, en lugar de bibliotecas aleatorias.
- Aprendizaje activo en laboratorio: integración del modelo en un bucle cerrado donde las mediciones experimentales actualizan las predicciones y guían la siguiente ronda de diseño, tal como sugiere la descripción "closed-loop".
- Investigación en paisajes de fitness: uso del modelo como aproximación computacional del paisaje de fitness para estudiar trayectorias evolutivas, epistasia y accesibilidad de mutaciones en estudios de biología evolutiva de laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El checkpoint ocupa 8,06 GiB en formato `.pth`, lo que implica que la inferencia en precisión original requiere al menos esa cantidad de memoria más el overhead del runtime; no se especifica el framework de inferencia.
- VRAM estimada para inferencia: no disponible con precisión; como referencia, un checkpoint de 8,06 GiB en FP32 requiere al menos ~8 GiB solo para los pesos, y en FP16/BF16 aproximadamente la mitad, aunque no se confirma el tipo de dato de los pesos.
- GPU recomendadas: no disponible. Por tamaño de fichero, cabría esperar que un checkpoint de este orden pudiera ejecutarse en GPUs de 16-24 GB (RTX 4090, A10, L4) si se convierte a precisión reducida, pero el autor no lo documenta.
- ¿Cabe en GPU de consumo? No confirmado; el tamaño del fichero (8,06 GiB) es compatible con GPUs de consumo de 12-24 GB en precisión reducida, pero no hay documentación al respecto.
- Opciones de despliegue: no disponible. No se mencionan vLLM, llama.cpp, Ollama ni TGI; el formato `.pth` sugiere carga directa con PyTorch.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de proteínas (por ejemplo, ESM, ProteinMPNN u otros), ni datos de rendimiento que permitan establecer una comparativa fundamentada.

## Limitaciones y advertencias

- Información pública mínima: la model card no documenta arquitectura, datos de entrenamiento, evaluación ni limitaciones, lo que impide una evaluación rigurosa del modelo.
- Sin validación comunitaria: cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso o replicación independiente.
- Riesgo de sobreajuste o sesgo en el paisaje de fitness: al no documentarse la composición del dataset de entrenamiento, no puede descartarse un sesgo hacia las familias de proteínas o los tipos de mutaciones presentes en los datos.
- Riesgo de extrapolación: los "world models" de fitness pueden fallar en regiones del espacio de secuencias poco representadas en el entrenamiento; no se documenta el dominio de validez.
- Formato de pesos no estándar para despliegue: `.pth` requiere PyTorch y no es directamente compatible con runtimes de inferencia optimizados como vLLM o llama.cpp sin conversión.
- Licencia Apache 2.0: permite uso comercial y modificación, pero no se especifican restricciones adicionales sobre los datos de entrenamiento ni sobre las predicciones.
- Ausencia de documentación sobre calibración: no se indica si las predicciones del modelo son probabilísticas o deterministas, ni cómo deben interpretarse.
- No aplicable a tareas de lenguaje natural: el modelo está especializado en proteínas y no debe esperarse de él comportamiento de LLM general.

## Enlaces

- HuggingFace: https://huggingface.co/yikuuun/proteus
- Repositorio de código y documentación (indicado por el autor): https://github.com/yikunpku/ProTEUS
