# ViolentlyPurple/Detect-AI

## Resumen

Detect-AI es un modelo publicado en Hugging Face por el usuario ViolentlyPurple, presumiblemente orientado a la deteccion de contenido generado por inteligencia artificial. El repositorio contiene unicamente pesos en formato safetensors y una model card practicamente vacia (solo la declaracion de licencia MIT), por lo que la informacion funcional disponible es minima.

Tecnicamente se trata de un modelo basado en la arquitectura DistilBERT, segun las etiquetas del repositorio, con 66.955.010 parametros totales y un tamano de repositorio de 0,3 GB. DistilBERT es una variante destilada de BERT orientada a tareas de comprension del lenguaje (clasificacion, extraccion de caracteristicas), lo que es coherente con un uso previsto de clasificador binario o multiclase de texto generado por IA.

Su relevancia actual es limitada pero no nula: los detectores de contenido sintetico son un area activa de investigacion y de aplicacion practica (moderacion, verificacion editorial, integridad academica), y un modelo de 67 millones de parametros es desplegable en hardware muy modesto. No obstante, la ausencia de documentacion, de datos de entrenamiento declarados y de resultados de evaluacion impide validar su calidad o sus sesgos, por lo que debe tratarse como un artefacto experimental sin garantias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder basado en DistilBERT (segun tags del repositorio) |
| Parametros totales | 66.955.010 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (DistilBERT soporta habitualmente 512 tokens, no confirmado por el autor) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se ofrecen variantes GGUF, ONNX ni cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La unica informacion arquitectonica disponible proviene de las etiquetas del repositorio, que identifican el modelo como DistilBERT. Se trata de un transformer encoder con atencion bidireccional, disenado originalmente para tareas de comprension del lenguaje y obtenido mediante destilacion de conocimiento a partir de BERT-base. Con 66.955.010 parametros, el modelo encaja en el orden de magnitud esperado para una variante DistilBERT con una cabeza de clasificacion anadida, aunque el autor no detalla la configuracion exacta de dicha cabeza ni el numero de clases de salida.

No se ha publicado informacion sobre el corpus de entrenamiento: ni numero de tokens, ni composicion del dataset, ni si se aplicaron tecnicas de ajuste fino supervisado, RLHF o DPO. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa, atencion lineal o mecanismos híbridos. La model card se limita a la linea `license: mit`, sin seccion de uso previsto, limitaciones ni procedencia de los datos. El unico indicio contextual es la existencia de un dataset del mismo autor, `ViolentlyPurple/Basic-GPT-AI-Dataset`, que podria haber sido empleado en el ajuste, pero esta relacion no esta confirmada.

## Capacidades

- Clasificacion de texto: por su arquitectura encoder y su cabeza de clasificacion, el uso esperado es la discriminacion entre texto generado por IA y texto humano, aunque el autor no lo explicita.
- Generacion de texto: no soportada de forma nativa; un encoder bidireccional no es un modelo generativo autoregresivo.
- Razonamiento, codigo y matematicas: no disponible; no hay evidencia de capacidades de este tipo.
- Tool calling / function calling: no disponible; no se documenta soporte.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; el autor no declara idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Moderacion de contenido en plataformas: el modelo podria actuar como clasificador de primera linea para marcar textos sospechosos de ser generados por IA antes de una revision humana, gracias a su bajo coste computacional (67 millones de parametros).
- Verificacion editorial en medios: integrado en el flujo de publicacion, podria senalar articulos o colaboraciones con alta probabilidad de generacion automatica, como senal auxiliar y nunca como decision final.
- Integridad academica: uso como filtro preliminar en sistemas de evaluacion que detecten ensayos producidos por asistentes de lenguaje, combinado con revision humana dado el riesgo de falsos positivos.
- Enriquecimiento de datasets: clasificar grandes volumenes de texto web para separar contenido sintetico del organico antes de construir corpus de entrenamiento.
- Investigacion sobre deteccion: servir como linea base ligera frente a la que comparar detectores mas grandes en experimentos academicos.
- Despliegue en entornos con recursos limitados: su tamano permite ejecutarlo en CPU o en GPUs de gama baja dentro de pipelines de preprocesado, siempre que se valide previamente su calidad, hoy no documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,3 GB en precision completa (fp32) para los pesos; en fp16 alrededor de 0,15 GB. El consumo real dependera del tamano de lote y de la longitud de secuencia.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre es suficiente; una NVIDIA T4, RTX 3060 o incluso una GTX 1650 bastan para inferencia por lotes.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU de consumo moderna e incluso en iGPU con memoria compartida.
- Opciones de despliegue: Transformers (PyTorch) de forma nativa; exportacion a ONNX Runtime o TorchScript para reducir latencia; no se ofrecen pesos GGUF para llama.cpp ni Ollama, y vLLM o TGI no aportan ventajas claras para un encoder de este tamano.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Detect-AI (ViolentlyPurple) | 66.955.010 | no disponible | Deteccion de texto IA (presunto) | MIT | Hugging Face, sin descargas ni likes |
| DistilBERT base (Hugging Face) | 66.955.008 | 512 tokens | Comprension del lenguaje general | Apache 2.0 | Ampliamente usado y documentado |
| Detectores de texto IA comerciales (p. ej. GPTZero, Originality.ai) | no disponible | no disponible | Deteccion de texto IA | Propietaria | API de pago |

La comparacion con DistilBERT base es la mas informativa: el recuento de parametros coincide casi exactamente, lo que sugiere que Detect-AI es un ajuste fino de esa arquitectura. Frente a los detectores comerciales, la ventaja de Detect-AI seria la licencia MIT y la ejecucion local, pero carece de cualquier evidencia publica de rendimiento.

## Limitaciones y advertencias

- Model card practicamente vacia: no se documentan datos de entrenamiento, uso previsto, idiomas ni evaluacion, lo que impide auditar el modelo.
- Riesgo elevado de falsos positivos y falsos negativos: los detectores de texto generado por IA son inherentemente poco fiables, y sin benchmarks publicados no hay forma de conocer la tasa de error.
- Sesgos desconocidos: al no declararse el corpus de entrenamiento, no puede evaluarse el sesgo por idioma, dominio, registro o demografia.
- Riesgo de alucinacion no aplicable en sentido estricto (es un clasificador), pero si de sobreconfianza en las etiquetas emitidas.
- Limitaciones de contexto e idioma: no disponibles; si hereda la configuracion de DistilBERT, el limite seria de 512 tokens.
- Uso comercial: la licencia MIT lo permite sin restricciones, pero la ausencia de garantias y de documentacion traslada todo el riesgo al integrador.
- Estado del repositorio: cero descargas y cero likes en el momento de la consulta, creado y actualizado el mismo dia (6 de noviembre de 2026), lo que sugiere un artefacto recien publicado y sin validacion por la comunidad.
- No debe usarse como unico criterio en decisiones con consecuencias (sanciones academicas, moderacion, verificacion periodistica).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ViolentlyPurple/Detect-AI
- Dataset del mismo autor: https://huggingface.co/datasets/ViolentlyPurple/Basic-GPT-AI-Dataset
- Guia sobre deteccion de imagenes generadas por IA (contexto general): https://felloai.com/how-to-tell-if-a-photo-is-ai-generated/
