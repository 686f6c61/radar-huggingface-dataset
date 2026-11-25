# wildfellhall/shakespeare-plays-5m

## Resumen

Shakespeare: Plays Only - 5M es un modelo de lenguaje extremadamente pequeño (5.273.088 parámetros, aproximadamente 5,3 millones) publicado por el usuario wildfellhall en Hugging Face. Está construido sobre la arquitectura GPT-2 y se ha entrenado específicamente para la continuación de texto en el corpus de obras teatrales de William Shakespeare, en inglés. Su propósito no es competir con modelos de propósito general, sino servir como modelo de dominio muy especializado y de huella mínima.

El interés de este modelo reside en su tamaño: con solo 5,3 millones de parámetros, es varios órdenes de magnitud menor que un GPT-2 small (124 millones) y puede ejecutarse en cualquier hardware, incluidos dispositivos con recursos muy limitados. Esto lo convierte en un caso de estudio útil para experimentación con modelos de lenguaje pequeños (SLM), ajuste fino en dominios concretos y despliegue en entornos donde el coste computacional es la restricción principal.

La información publicada por el autor es mínima: la model card se limita a una línea descriptiva y a metadatos de licencia MIT e idioma inglés. No se detallan datos de entrenamiento, hiperparámetros, tokenizador ni resultados de evaluación, por lo que buena parte de las especificaciones técnicas debe marcarse como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only, según el tag del repositorio) |
| Parametros totales | 5.273.088 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; al ser un modelo de 5M, la cuantizacion es poco relevante en la práctica) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El repositorio etiqueta el modelo como GPT-2, lo que implica una arquitectura transformer decoder-only con atención causal y generación autorregresiva token a token. Sin embargo, la model card no especifica el número de capas, la dimensión oculta, el número de cabezas de atención ni la configuración exacta del tokenizador, por lo que no es posible reconstruir la arquitectura completa a partir de la información disponible.

Tampoco se documentan el número de tokens de entrenamiento, la composición exacta del corpus (más allá de "obras de Shakespeare"), la existencia de fases de ajuste supervisado o RLHF/DPO, ni ninguna innovación técnica destacable. El nombre del modelo sugiere un entrenamiento desde cero sobre un subconjunto de obras teatrales, pero este extremo no está confirmado en la documentación publicada.

## Capacidades

- Generación de texto en inglés mediante continuación de secuencias (text-generation).
- Estilo y vocabulario orientados al corpus de obras teatrales de Shakespeare, incluyendo registro dramático y verso.
- No hay evidencia publicada de soporte de tool calling, function calling ni razonamiento multi-paso.
- No hay evidencia de capacidades de agente, visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe: limitada al inglés según los metadatos del repositorio.
- No se documentan capacidades de código ni matemáticas; por tamaño y dominio, no son esperables.

## Casos de uso

- Experimentación educativa con modelos de lenguaje pequeños: sirve para ilustrar el ciclo completo de entrenamiento e inferencia de un transformer decoder-only con solo 5,3 millones de parámetros, sin necesidad de GPU.
- Generación de texto con estilo isabelino: continuación de diálogos y monólogos con un registro próximo al teatro clásico inglés, útil para prototipos creativos o talleres de escritura.
- Pruebas de pipelines de despliegue: al ocupar apenas unos megabytes, es adecuado para validar integraciones con llama.cpp, bibliotecas de Hugging Face Transformers o servicios de inferencia antes de pasar a modelos mayores.
- Ajuste fino de dominio como ejercicio: punto de partida para estudiar cómo se comporta el fine-tuning en corpus muy pequeños y especializados.
- Docencia sobre tokenización y generación autorregresiva: permite inspeccionar paso a paso la distribución de probabilidad siguiente sin coste computacional apreciable.
- Demos de bajo consumo en dispositivos embebidos o navegador: su huella reducida facilita ejecuciones en CPU y entornos con memoria limitada, siempre que se acepte la baja calidad esperable del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en precisión completa (5,3 millones de parámetros en fp32 ocupan aproximadamente 21 MB, más overhead de activaciones y tokenizador).
- GPU recomendadas: ninguna en particular; el modelo cabe holgadamente en cualquier GPU, incluida una GTX 1050 o inferior.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer e incluso en CPU.
- Opciones de despliegue: Hugging Face Transformers, llama.cpp (previa conversión a GGUF), Ollama (previa conversión) y cualquier runtime compatible con safetensors y GPT-2.
- Latencia y throughput: no disponibles en la información publicada; por el tamaño, se espera una latencia muy baja en CPU, aunque la calidad de la salida será limitada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Shakespeare: Plays Only - 5M | 5.273.088 | no disponible | MIT | Hugging Face |
| GPT-2 small | 124.000.000 (aprox.) | 1.024 tokens | MIT | Hugging Face |
| DistilGPT-2 | 82.000.000 (aprox.) | 1.024 tokens | Apache 2.0 | Hugging Face |
| TinyStories (variantes ~1M-10M) | ~1M-10M | variable | variable | Hugging Face |

La comparación con GPT-2 small y DistilGPT-2 es solo orientativa en cuanto a orden de magnitud: ambos son modelos de propósito general y notablemente mayores. No se dispone de datos de rendimiento del modelo evaluado que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Tamaño muy reducido: con 5,3 millones de parámetros, la coherencia, el seguimiento de instrucciones y la factualidad serán muy limitados; no es adecuado para tareas de producción que requieran precisión.
- Sesgos: al entrenarse sobre un corpus literario histórico, puede reproducir sesgos, arcaísmos y estereotipos presentes en las obras de Shakespeare.
- Riesgo de alucinación: alto en cualquier tarea fuera del dominio; el modelo no tiene conocimiento factual verificable más allá de los patrones del corpus.
- Limitaciones de idioma: solo inglés, según los metadatos; no se documenta el comportamiento en otros idiomas.
- Licencia MIT: permite uso comercial y modificación, pero no se documentan garantías ni responsabilidades del autor; conviene revisar los términos del corpus de entrenamiento, que no se especifica.
- Falta de documentación: la ausencia de datos sobre contexto, tokenizador, entrenamiento y evaluación impide garantizar un comportamiento reproducible en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wildfellhall/shakespeare-plays-5m
- Paper: no disponible
- Blog: no disponible
- Repositorio de código: no disponible
- Demo: no disponible
