# XXVICK/Myst_Ai-25M-Coder

## Resumen

Myst_Ai-25M-Coder es un transformer decoder-only de aproximadamente 25 millones de parametros entrenado desde cero por el usuario XXVICK sobre codigo Python con licencias permisivas. Se publica bajo licencia MIT y esta pensado como un modelo compacto de generacion de texto especializado en codigo, no como un asistente generalista. Su interes radica en lo experimental: es un ejemplo de entrenamiento from-scratch reproducible y de bajo coste, con una arquitectura moderna (RMSNorm, RoPE, SwiGLU) escalada a un tamano que cabe en cualquier GPU de consumo e incluso en CPU.

El modelo emplea 8 capas, 8 cabezas de atencion, una dimension de embedding de 512 y una longitud de contexto de 512 tokens. El entrenamiento se realizo sobre CodeSearchNet, un corpus de codigo Python derivado de repositorios con licencia Apache 2.0, lo que permite su integracion en proyectos abiertos o comerciales sin restricciones adicionales segun la model card.

Es relevante ahora como referencia de lo que se puede conseguir con recursos minimos: un modelo de 25M de parametros es tres ordenes de magnitud mas pequeno que los asistentes de codigo actuales, lo que lo situa en el terreno del autocompletado local, la experimentacion academica y el fine-tuning sobre dominios muy especificos, mas que en el de la generacion de codigo en produccion compleja.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (from-scratch), RMSNorm, RoPE, SwiGLU |
| Parametros totales | ~25M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (no se documentan versiones GGUF, AWQ, GPTQ ni similares) |
| Idiomas soportados | Codigo (Python) e ingles |
| Licencia | MIT |
| Formato de pesos | no disponible (el repo pesa 0,1 GB y se distribuye como proyecto PyTorch; no se especifica safetensors ni GGUF) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only clasico con 8 capas, 8 cabezas de atencion y dimension de embedding de 512. Usa RMSNorm para la normalizacion, embeddings posicionales rotatorios (RoPE) en lugar de posiciones aprendidas, y una capa feedforward con activacion SwiGLU. El contexto maximo es de 512 tokens, un valor bajo en comparacion con los 8K-128K habituales en modelos actuales, lo que condiciona todos los casos de uso posibles.

El entrenamiento se realizo desde cero sobre CodeSearchNet, un corpus publico de codigo Python publicado bajo terminos Apache 2.0. La model card no especifica el numero de tokens vistos, la composicion exacta del dataset, el numero de pasos, el hardware utilizado ni si hubo fases de ajuste fino con RLHF o DPO. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa, atencion lineal o mezcla de expertos: se trata de una implementacion minimalista y directa de un transformer pequeno. No se dispone de informacion sobre el tokenizador empleado ni sobre el tamano del vocabulario.

## Capacidades

- Generacion de texto especializada en codigo Python: autocompletado de funciones, continuacion de lineas y generacion de fragmentos cortos coherentes.
- Generacion de texto basica en ingles, dado que el modelo declara soporte para este idioma junto con el codigo.
- Aprendizaje desde cero sobre un corpus limpio de Python con licencias permisivas, lo que reduce el riesgo de contaminacion por codigo con licencias restrictivas.
- Fine-tuning factible en una sola GPU de consumo gracias a su tamano de 25M de parametros.
- Inferencia local y offline en CPU sin necesidad de acelerador dedicado.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte para agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingue mas alla del codigo y el ingles.
- No se documenta modo de razonamiento (thinking mode), vision, audio ni cualquier otra modalidad adicional.

## Casos de uso

- Autocompletado de codigo Python en editores locales: con 25M de parametros y 512 tokens de contexto, el modelo puede sugerir continuaciones de linea o de bloque corto en un plugin de VS Code o Neovim, ejecutandose en CPU con latencia baja y sin enviar codigo a la nube.
- Prototipado y aprendizaje de transformers desde cero: sirve como referencia didactica completa (configuracion, entrenamiento, pesos publicados) para quienes quieran reproducir el pipeline y entender cada componente (RMSNorm, RoPE, SwiGLU) en un modelo manejable.
- Fine-tuning sobre un dominio de codigo especifico: una empresa puede ajustar el modelo sobre su propio estilo de codigo interno o sobre un DSL concreto, ya que el coste computacional de un ajuste sobre 25M de parametros es muy bajo.
- Generacion de docstrings y comentarios: para funciones cortas de Python, el modelo puede producir descripciones breves que se integren en herramientas de documentacion automatica, siempre con revision humana.
- Despliegue en entornos con recursos extremadamente limitados: dispositivos embebidos, contenedores ligeros o funciones serverless con poca memoria pueden alojar el modelo en menos de 1 GB de VRAM o RAM, algo inviable con cualquier modelo de miles de millones de parametros.
- Educacion y talleres de IA: al ser MIT y entrenado sobre datos permisivos, es adecuado para cursos donde se necesite un modelo de generacion de codigo que los alumnos puedan inspeccionar, modificar y redistribuir libremente.
- Experimentacion con tecnicas de entrenamiento: por su tamano, permite ejecutar ablaciones (variar capas, cabezas, contexto) en una sola GPU en tiempos razonables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones tipo HumanEval, MBPP, MMLU, GSM8K ni ninguna otra metrica de calidad, y la busqueda web no aporta resultados especificos para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 50 MB de pesos en FP16 y unos 100 MB en FP32, mas el cache KV y las activaciones. En la practica, el modelo completo con contexto lleno deberia ocupar bastante menos de 1 GB.
- GPU recomendadas: cualquier GPU moderna es sobredimensionada. Funciona en una NVIDIA RTX 3060, RTX 4090, T4 o incluso en GPUs integradas. Tambien es viable en CPU.
- Compatibilidad con GPU de consumo: si, cabe sobradamente en cualquier GPU de consumo actual e incluso en moviles y dispositivos embebidos.
- Opciones de despliegue: al ser un modelo from-scratch con arquitectura propia, lo mas probable es que requiera cargar el codigo del repositorio con PyTorch (posible necesidad de `trust_remote_code`). No se documentan conversiones a formatos de llama.cpp, Ollama, vLLM, TGI ni similares, por lo que esas vias de despliegue no estan confirmadas y probablemente requieran conversion manual.
- Latencia y throughput estimados: no disponible. No se publican mediciones.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos verificados de otros modelos de codigo de tamano comparable, y las busquedas web realizadas devuelven rankings de asistentes de codigo de gran escala (Claude, MiMo V2.5 Pro, familia MAI de Microsoft) que no son comparables en parametros, contexto ni proposito con un transformer de 25M entrenado desde cero. No se dispone de cifras fiables para establecer una comparativa.

## Limitaciones y advertencias

- Contexto muy corto: 512 tokens limitan severamente cualquier tarea que requiera mantener un archivo completo o una conversacion multi-turno.
- Tamano muy reducido: 25M de parametros no permiten razonamiento complejo, generacion de codigo extenso ni comprension de instrucciones sofisticadas.
- Riesgo elevado de alucinacion: es esperable que genere API inexistentes, funciones mal formadas o codigo sintacticamente valido pero semanticamente incorrecto. Cualquier salida debe validarse.
- Sesgos de datos: entrenado sobre CodeSearchNet (Python, Apache 2.0), hereda los sesgos de estilo, dominios y practicas presentes en ese corpus.
- Idiomas: fuera del codigo y el ingles, no hay soporte documentado para castellano ni otros idiomas naturales.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad que respalde su uso en produccion.
- Licencia: MIT, sin restricciones para uso comercial segun la model card. El autor afirma que los datos de entrenamiento derivan de fuentes Apache 2.0, aunque no se adjunta una auditoria detallada del dataset.
- Adopcion practicamente nula: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de comunidad, soporte y validacion externa.
- Formato de pesos no documentado: puede requerir codigo personalizado para cargar el modelo, anadiendo friccion a la integracion.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/XXVICK/Myst_Ai-25M-Coder
- Corpus CodeSearchNet (fuente de entrenamiento declarada): no disponible en la informacion proporcionada
- Paper o blog tecnico del autor: no disponible
- Repositorio de codigo de entrenamiento: no disponible
- Demo o espacio interactivo: no disponible
- Enlaces de la busqueda web: los resultados obtenidos (llm-stats.com, buildmvpfast.com, Wikipedia sobre Claude, globalaiforce.com sobre MiMo V2.5 Pro y microsoft.ai sobre la familia MAI) no guardan relacion con este modelo y no se incluyen como referencias relevantes.
