# speleoalex/physisml-it-preview

## Resumen

PhysisML es un modelo de lenguaje experimental de 28,2 millones de parámetros, entrenado desde cero por el investigador independiente speleoalex con un enfoque pedagógico inspirado en el desarrollo cognitivo infantil: el modelo aprende primero fonemas, luego sílabas, palabras, gramática y finalmente diálogo, guiado por un tutor que adapta el material según los errores actuales del modelo. Esta preview publicada en Hugging Face corresponde al nivel 6 de un currículo que llega hasta el nivel 12, y se ofrece como artefacto de investigación para verificar los resultados documentados en el repositorio contra los pesos reales.

El modelo es un transformer decoder-only con pre-LayerNorm y `lm_head` no compartido, con una ventana de contexto de solo 128 tokens y un tokenizador BPE de nivel byte con 2590 tokens activos. Está entrenado exclusivamente en italiano y no debe usarse como asistente de propósito general: no tiene conocimiento del mundo, no sigue instrucciones fuera de los patrones del currículo y carece de cualquier tipo de alineación o filtrado de seguridad. Su interés radica en el método de entrenamiento curricular y en el fenómeno documentado de "consolidación" (dream), que recupera niveles anteriores tras una pasada de repaso sin nuevo aprendizaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, pre-LayerNorm, `lm_head` no compartido |
| Parametros totales | 28.197.376 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 128 tokens |
| Tipos de cuantizacion | no disponible (pesos en float32, sin cuantizaciones publicadas) |
| Idiomas soportados | Italiano (unico idioma entrenado y evaluado) |
| Licencia | MIT |
| Formato de pesos | safetensors (junto con codigo de carga personalizado) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only con normalizacion pre-LayerNorm y capa de salida no compartida con la capa de embedding. Los hiperparametros son `d_model=512`, `n_layers=6`, `n_heads=8` y `d_ff=2048`. El tokenizador es un BPE de nivel byte con 9000 slots reservados, de los cuales solo 2590 estan activos; los slots no utilizados se enmascaran con `-inf` durante la inferencia, lo que permite que el vocabulario crezca durante el entrenamiento.

El entrenamiento sigue un currículo de desarrollo en niveles (fonemas, silabas, palabras, gramatica, dialogo y, en niveles superiores, literatura) con un tutor que adapta el material a los fallos actuales del modelo. Los pesos publicados corresponden al nivel 6 de un currículo que llega al nivel 12, tomados de una compilacion aun en progreso. El dataset es un currículo sintetico de unos pocos megabytes, no un corpus web. El proceso incluye un ciclo de consolidacion denominado "dream": una pasada de repaso sobre todo el material de niveles anteriores sin nueva ensenanza, que recupera el rendimiento de niveles previos que habian sido olvidados al ensenar el nivel actual.

## Capacidades

- Generacion de texto en italiano limitada a preguntas cortas sobre un mundo cerrado de sustantivos y verbos familiares (ejemplos: "cosa mangia il cane?" → "il cane mangia il pane").
- Comprension basica de estructuras gramaticales simples: presente, pasado compuesto, negacion, causalidad basica ("perché il cane mangia? → il cane mangia perché ha fame").
- Respuesta exacta a prompts del currículo con una tasa de coincidencia media del 84,3% tras el ciclo de consolidacion.
- Capacidad de consolidacion de conocimiento previo mediante el ciclo "dream" (replay de niveles anteriores).
- No soporta tool calling, ni razonamiento multi-paso, ni capacidades de agente.
- No tiene conocimiento del mundo real: cualquier dato factual que produzca es inventado.
- No sigue instrucciones fuera de los patrones de prompt del currículo.
- Vocabulario cerrado: palabras fuera del currículo rompen el modelo.
- Contexto de 128 tokens: no admite documentos ni conversaciones largas.

## Casos de uso

- Investigacion en curriculos de aprendizaje: el modelo permite estudiar como el entrenamiento por niveles y el ciclo de consolidacion afectan a la retencion de conocimiento previo, con datos cuantitativos publicados en el repositorio.
- Estudio de fenomenos de olvido catastrofico: los pesos publicados muestran que ensenar el nivel 6 borro los niveles 1 a 5 (rendimiento del 0% en varios niveles) y que una pasada de repaso los recupero hasta el 84,3% medio, lo que lo convierte en un banco de pruebas para tecnicas de mitigacion del olvido.
- Verificacion de resultados de investigacion: al publicar los pesos reales junto con la documentacion, permite a otros investigadores reproducir y contrastar las metricas exact match y self-repetition del modelo card.
- Desarrollo de tokenizadores adaptativos: el sistema de slots de vocabulario enmascarados a `-inf` permite experimentar con vocabularios que crecen durante el entrenamiento sin reentrenar el tokenizador.
- Evaluacion de metodos de curriculum learning en modelos pequenos: con solo 28M de parametros y ejecucion en CPU, es accesible para experimentos rapidos de laboratorio.
- Docencia en arquitecturas transformer: su tamano reducido y su codigo de carga personalizado facilitan la inspeccion de pesos, activaciones y comportamiento de atencion en un entorno controlado.

## Benchmarks y rendimiento

El modelo card publica resultados de exact match (coincidencia exacta con las respuestas doradas del currículo) y self-repetition (tasa de repeticion de la misma respuesta) sobre 457 prompts evaluados en los siete niveles vistos por estos pesos, con decodificacion greedy. La tabla siguiente muestra los resultados tras el ciclo de consolidacion ("dream"):

| Metrica | L0 | L1 | L2 | L3 | L4 | L5 | L6 | Media |
|---|---|---|---|---|---|---|---|---|
| Exact match | 95% | 91% | 74% | 74% | 72% | 83% | 100% | 84,3% |
| Self-repetition | 0% | 0% | 14% | 6% | 1% | 3% | 0% | 3,4% |

La misma tabla antes del ciclo de consolidacion muestra una caida drastica en los niveles anteriores:

| Metrica | L0 | L1 | L2 | L3 | L4 | L5 | L6 | Media |
|---|---|---|---|---|---|---|---|---|
| Exact match (antes del dream) | 62% | 0% | 0% | 0% | 3% | 1% | 100% | 23,7% |
| Exact match (despues del dream) | 95% | 91% | 74% | 74% | 72% | 83% | 100% | 84,3% |

No se han publicado resultados en benchmarks estandar como MMLU, HumanEval o GSM8K, y no procede comparar con modelos de proposito general dado el ambito experimental del modelo.

## Requisitos de hardware

- Inferencia en CPU: el modelo esta en float32 y se ejecuta en CPU sin problemas; el propio autor indica que "runs on a CPU".
- VRAM estimada: inferior a 1 GB en cualquier GPU moderna; los pesos ocupan aproximadamente 113 MB en float32 (28,2M parametros × 4 bytes).
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM, incluidas GTX 1050, RTX 2060 o integradas con soporte CUDA; no se requiere GPU para inferencia.
- Opciones de despliegue: no hay soporte `AutoModel` de Hugging Face; el modelo se carga mediante el paquete incluido en el repositorio de GitHub (instalacion con `pip install torch safetensors numpy` y descarga via `hf download`).
- No es compatible con vLLM, llama.cpp, Ollama ni TGI por su arquitectura y tokenizador personalizados.
- Latencia y throughput: no se han publicado mediciones; dado el tamano, la generacion de 128 tokens en CPU deberia ser del orden de milisegundos por token, pero no hay datos oficiales.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables publicados con el mismo enfoque de currículo de desarrollo infantil, tamano similar y licencia MIT. Los modelos de tamano comparable (por ejemplo, GPT-2 pequeño con 124M de parametros o modelos TinyLlama de 1.1B) no comparten ni el metodo de entrenamiento ni el ambito experimental, por lo que una comparativa directa careceria de sentido.

## Limitaciones y advertencias

- Modelo exclusivamente en italiano: cualquier prompt en otro idioma produce salidas no fiables; no se ha entrenado ni evaluado en ingles a pesar de existir un esqueleto de currículo en ese idioma en el repositorio.
- Sin conocimiento del mundo: entrenado sobre un currículo sintetico de pocos megabytes, cualquier dato factual que genere es inventado.
- Sin alineacion ni seguridad: no hay comportamiento de rechazo, ni filtrado, ni RLHF; es un artefacto de investigacion, no un producto.
- Vocabulario cerrado de 2590 tokens: palabras fuera del currículo rompen el modelo.
- Contexto limitado a 128 tokens: no admite documentos, conversaciones largas ni razonamiento multi-paso.
- Repeticion y colapso de prefijo: prompts que comparten un inicio tienden a colapsar en la misma respuesta.
- Sin soporte de la libreria `transformers`: requiere el codigo de carga personalizado del repositorio, lo que limita su integracion en pipelines estandar.
- Pesos de nivel 6 de un currículo de 12 niveles: el modelo no ha visto los niveles de literatura, opinion, comparacion ni futuro, por lo que falla en esas tareas (ejemplos documentados: "chi sei tu?" → "la mucca perché ha fame").
- Licencia MIT permite uso comercial, pero el autor desaconseja explicitamente poner el modelo frente a usuarios finales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/speleoalex/physisml-it-preview
- Repositorio GitHub (codigo, currículo y documentacion): https://github.com/speleoalex/PhysisML
- Documentacion tecnica del modelo: https://github.com/speleoalex/PhysisML/blob/main/docs/en/physisml_model.md
