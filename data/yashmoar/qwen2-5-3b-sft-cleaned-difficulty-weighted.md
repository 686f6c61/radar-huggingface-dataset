# yashmoar/Qwen2.5-3B-SFT-cleaned-difficulty-weighted

## Resumen

Qwen2.5-3B-SFT-cleaned-difficulty-weighted es un ajuste fino completo (full fine-tuning) del modelo Qwen2.5-3B-Instruct, publicado por el usuario yashmoar (yashmoar11) como parte de un trabajo sobre entrenamiento fiable en matemáticas y ciencias. El modelo no introduce arquitectura nueva: parte del transformer decoder denso de la familia Qwen2 y se entrena durante 3 épocas sobre un subconjunto de 15.000 problemas del dataset acereason-15k-cleaned-difficulty-weighted.

El problema que aborda es la selección de datos de entrenamiento. En lugar de usar el pool completo de 100.000 ejemplos matemáticos de origen, el autor filtra primero el pool (elimina código, soluciones truncadas a 16.384 tokens, soluciones que abandonan, respuestas incorrectas, soluciones muy repetitivas, solapamiento con los benchmarks de evaluación y preguntas duplicadas) y después muestrea con mayor peso los problemas que el modelo base fallaba en una prueba de 4 intentos. El resultado es un modelo de 3.085.938.688 parámetros (~3,09 B) con licencia qwen-research y pesos en safetensors.

Su relevancia es doble: por un lado, demuestra que el re-muestreo por dificultad sobre datos limpios aporta ganancias medibles y modestas (pass@8 medio de 0,582 frente a 0,535 del base, y pass@1 de 0,289 frente a 0,285); por otro, el modelo y su pipeline quedan como referencia metodológica para quien quiera reproducir ajustes finos orientados a razonamiento matemático con presupuesto reducido. El repositorio no registra descargas ni interacciones, por lo que debe tratarse como un artefacto de investigación más que como un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso de la familia Qwen2, heredada del modelo base Qwen2.5-3B-Instruct |
| Parámetros totales | 3.085.938.688 (~3,09 B) |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada; el modelo base Qwen2.5-3B-Instruct soporta 32.768 tokens |
| Tipos de cuantización | No disponible (no se publican versiones GGUF, AWQ ni GPTQ de este ajuste) |
| Idiomas soportados | No disponible (la model card no declara idiomas) |
| Licencia | qwen-research (`license: other`) |
| Formato de pesos | safetensors (repositorio de 6,8 GB) |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen2.5-3B-Instruct original: un transformer decoder denso con atención causal, sin mezcla de expertos ni capas recurrentes. El ajuste es un fine-tuning supervisado completo (no LoRA), con 3 épocas, tasa de aprendizaje 5e-6, planificador coseno, 8 secuencias por paso y un límite de 16.384 tokens por secuencia. No se documentan fases de RLHF, DPO o verificación con recompensas posteriores al SFT; la alineación proviene íntegramente del modelo base.

El dataset parte de acereason11_100k, del que se conservan 47.430 filas de matemáticas tras aplicar una cadena de filtros: eliminación de código, de soluciones que alcanzan el corte de 16.384 tokens, de soluciones que se rinden, de respuestas demostradamente incorrectas, de soluciones muy repetitivas, de solapamiento con los benchmarks de evaluación y de preguntas duplicadas. Sobre ese pool limpio se muestrean 15.000 filas con ponderación por dificultad, dando más probabilidad a los problemas que el modelo base falló en una prueba de 4 intentos. La innovación destacable no es arquitectónica sino de curación de datos: el filtrado por solapamiento con el conjunto de evaluación pretende reducir la contaminación de los resultados reportados, y la ponderación por dificultad concentra el cómputo en los ejemplos informativos.

## Capacidades

- Razonamiento matemático paso a paso, con salida final delimitada en `\boxed{}` cuando se usa el system prompt recomendado.
- Resolución de problemas de matemáticas y ciencias a nivel de competición y de currículo escolar, evaluada sobre 8 benchmarks del área.
- Generación de texto general y seguimiento de instrucciones conversacionales, heredados de Qwen2.5-3B-Instruct, aunque no se han publicado evaluaciones que cuantifiquen posibles regresiones fuera del dominio matemático.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso con herramientas: no disponible; el entrenamiento se limita a SFT sobre soluciones matemáticas.
- Capacidades multilingües: no disponible; la model card no declara idiomas ni composición lingüística del dataset.
- Capacidades de visión o audio: no disponibles; el modelo es exclusivamente de texto.
- Modo "thinking" explícito separado: no disponible; el razonamiento se emite en el propio texto de la respuesta.

## Casos de uso

- Tutoría automática de matemáticas: el modelo genera soluciones paso a paso con la respuesta final aislada en `\boxed{}`, lo que permite parsear y verificar el resultado de forma automática en una plataforma educativa. Es adecuado por el formato de respuesta impuesto durante el entrenamiento.
- Generación de problemas resueltos para bancos de ejercicios: dado un tema y un nivel de dificultad, el modelo produce enunciado y desarrollo, útil para crear material docente a escala con revisión humana posterior.
- Evaluación automática de razonamientos: al estar entrenado sobre soluciones filtradas por corrección, puede emplearse como generador de cadenas de referencia que un sistema de grading compare con las respuestas de alumnos.
- Prototipado rápido en local: con ~3 B de parámetros cabe en GPUs de consumo, por lo que sirve para iterar sobre prompts de razonamiento matemático sin coste de API.
- Investigación sobre curación de datos: el modelo es un punto de comparación directo frente a Qwen2.5-3B-Instruct para medir el efecto del filtrado y del muestreo por dificultad, ya que el autor publica el dataset y el código de evaluación.
- Base para posteriores ajustes de dominio: al ser un full fine-tune sobre un modelo de 3 B, puede servir como inicialización para especializaciones en física, química o estadística con presupuesto de cómputo reducido.
- Extracción de respuestas estructuradas en pipelines de cálculo simbólico: el delimitador `\boxed{}` facilita conectar la salida del modelo con un verificador o un CAS (computer algebra system) que valide la solución.

## Benchmarks y rendimiento

Evaluación del autor sobre 8 benchmarks de matemáticas y ciencias, con 8 respuestas por pregunta, temperatura 0,6, top-p 0,95 y hasta 32.768 tokens de generación. Los valores son medias agregadas; no se publican resultados por benchmark individual.

| Métrica | Qwen2.5-3B-SFT-cleaned-difficulty-weighted | Qwen2.5-3B-Instruct (base) |
|---|---|---|
| pass@1 (media de 8 benchmarks) | 0,289 | 0,285 |
| pass@8 (media de 8 benchmarks) | 0,582 | 0,535 |

La ganancia es de +0,004 en pass@1 y +0,047 en pass@8. No se han publicado resultados desglosados por benchmark, ni comparaciones con modelos de otros autores, en la información disponible.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: en torno a 6,2 GB solo para pesos, más caché KV; presupuesto práctico de 8-10 GB para contextos moderados.
- VRAM estimada en 8 bits: aproximadamente 3,5 GB de pesos.
- VRAM estimada en 4 bits: aproximadamente 2 GB de pesos, aunque requeriría cuantizar el modelo, ya que no se distribuyen versiones pre-cuantizadas.
- GPU profesionales: A100 (40/80 GB), H100, L40S y A10G sobran para el modelo en bf16; el límite real es el throughput, no la memoria.
- GPU de consumo: cabe en RTX 4090 (24 GB), RTX 4080/4070 Ti (16 GB), RTX 4060 Ti (16 GB) y RTX 3060 (12 GB) en bf16; en 4 bits cabría incluso en GPUs de 8 GB.
- Opciones de despliegue: vLLM y TGI funcionan con el formato safetensors estándar de Qwen2. Para llama.cpp u Ollama sería necesario convertir los pesos a GGUF, paso no documentado por el autor.
- Latencia y throughput: no disponibles; el autor no publica mediciones de velocidad.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yashmoar/Qwen2.5-3B-SFT-cleaned-difficulty-weighted | 3,09 B | No disponible (base: 32.768) | pass@1 0,289 / pass@8 0,582 en la eval del autor | qwen-research | safetensors en HuggingFace |
| Qwen/Qwen2.5-3B-Instruct | 3,09 B | 32.768 tokens | pass@1 0,285 / pass@8 0,535 en la misma eval | qwen-research | safetensors, GGUF, AWQ y GPTQ publicados por Qwen |
| Qwen2.5-Math (variantes 1,5 B y 7 B) | 1,5 B / 7 B | No disponible en esta información | No disponible en esta información | No disponible en esta información | No disponible en esta información |
| Llama-3.2-3B-Instruct | ~3,2 B | 128.000 tokens | No disponible en esta información | Llama 3.2 Community License | safetensors y GGUF |

La comparación directa más fiable es contra el modelo base, porque comparte evaluación. Frente a alternativas de otros fabricantes no hay cifras comparables publicadas en la información disponible, y las diferencias de tokenizador y de conjunto de evaluación invalidarían cualquier comparación numérica improvisada.

## Limitaciones y advertencias

- Licencia qwen-research: restringe el uso comercial. Cualquier despliegue en producto requiere revisar el texto de la licencia enlazado desde el repositorio del modelo base.
- Especialización estrecha: el entrenamiento se limita a SFT sobre problemas de matemáticas y ciencias; es esperable cierto deterioro en conversación general, creatividad o instrucciones largas, aunque no se han publicado mediciones de esa regresión.
- Riesgo de alucinación: al ser un modelo de 3 B sin verificación simbólica, puede producir cadenas de razonamiento plausibles con resultados incorrectos, especialmente en problemas de varios pasos.
- Dependencia del formato: el rendimiento reportado asume el system prompt "Please reason step by step, and put your final answer within \boxed{}."; sin él, la tasa de respuestas parseables puede caer.
- Sesgos: no se documenta ninguna evaluación de sesgo, toxicidad o equidad, ni la composición demográfica o lingüística del dataset de entrenamiento.
- Idiomas: no se declara cobertura multilingüe; el ajuste puede haber degradado el rendimiento en idiomas distintos del usado en los datos.
- Adopción nula: 0 descargas y 0 likes en el momento de la ficha, sin revisión independiente por parte de terceros.
- Contexto: aunque el modelo base soporta 32.768 tokens, el ajuste se entrenó con un límite de 16.384; el comportamiento más allá de esa longitud no está validado.
- Riesgo de contaminación residual: el autor filtra el solapamiento con los benchmarks de evaluación, pero el proceso es heurístico y no garantiza ausencia total de filtración.
- No hay versiones cuantizadas oficiales ni garantía de que la cuantización a 4 bits preserve el rendimiento reportado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yashmoar/Qwen2.5-3B-SFT-cleaned-difficulty-weighted
- Dataset de entrenamiento: https://huggingface.co/datasets/yashmoar/acereason-15k-cleaned-difficulty-weighted
- Repositorio con resultados y código de evaluación: https://github.com/yashmoar11/Trustworthy-Machine-Learning
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE
