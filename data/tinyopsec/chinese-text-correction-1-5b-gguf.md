# tinyopsec/chinese-text-correction-1.5b-GGUF

## Resumen

chinese-text-correction-1.5b-GGUF es un repositorio de cuantizaciones GGUF del modelo `shibing624/chinese-text-correction-1.5b`, un ajuste fino de Qwen2.5-1.5B-Instruct especializado en la correccion ortografica y gramatical de texto en chino. Las cuantizaciones han sido producidas con llama.cpp por el usuario tinyopsec, y el objetivo es facilitar la ejecucion del modelo en hardware modesto, desde CPUs hasta GPUs de consumo, mediante runtimes compatibles con el formato GGUF como llama.cpp, Ollama, LM Studio o koboldcpp.

El problema que resuelve es doble: por un lado, ofrece una tarea muy concreta y de alto valor practico (correccion de texto en chino, un idioma donde la correccion ortografica tradicional basada en diccionarios tiene dificultades con homofonos y errores contextuales); por otro, lo hace en un formato ligero que permite despliegues locales y en el borde. Con unos 1.540 millones de parametros y cuantizaciones desde F16 hasta Q2_K, la version recomendada Q4_K_M ocupa menos de 1 GB, lo que lo hace viable incluso en portatiles sin GPU dedicada. Su relevancia radica en la combinacion de una base instructa moderna (Qwen2.5) con un ajuste fino de dominio especifico, bajo licencia Apache 2.0 que permite uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Qwen2), ajuste fino de Qwen2.5-1.5B-Instruct |
| Parametros totales | 1.543.714.304 (~1,54 B) |
| Parametros activos | no disponible (no es MoE; modelo denso) |
| Longitud de contexto | no disponible (la base Qwen2.5-1.5B-Instruct soporta 32.768 tokens, segun el repo no se indica) |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M, Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | Chino (correccion de texto); el resto de idiomas de la base no se indican en el repo |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones generadas con llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B-Instruct, un transformer decoder denso de la familia Qwen2.5 de Alibaba con arquitectura estandar: atencion multi-cabeza con sesgos, codificaciones RoPE y normalizacion RMSNorm (los detalles exactos de configuracion no se detallan en el repositorio). Sobre esa base, `shibing624/chinese-text-correction-1.5b` aplico un ajuste fino supervisado orientado a la tarea de correccion de texto en chino (spelling y grammar correction), donde el modelo recibe texto con errores y devuelve la version corregida. Los detalles del dataset de entrenamiento, el numero de tokens y el metodo (SFT puro o con DPO/RLHF posterior) no estan disponibles en la informacion proporcionada.

La innovacion principal de este repositorio no es arquitecturica sino de distribucion: se trata de cuantizaciones GGUF producidas con llama.cpp que cubren un rango muy amplio de puntos de calidad-tamano, desde F16 (3,0 GB) hasta Q2_K, permitiendo elegir entre maxima fidelidad y minima huella de memoria. La cuantizacion recomendada por el autor es Q4_K_M, que ofrece habitualmente el mejor equilibrio entre perdida de calidad y reduccion de tamano en la familia de metodos k-quant de llama.cpp.

## Capacidades

- Correccion ortografica de texto en chino: deteccion y correccion de caracteres erroneos, incluidos errores de homofonos tipicos del chino escrito.
- Correccion gramatical en chino: ajuste de estructuras sintacticas incorrectas en frases.
- Generacion de texto conversacional: al derivar de una base instructa (Qwen2.5-1.5B-Instruct), mantiene capacidad de dialogo, aunque afinada para la tarea de correccion.
- Compatibilidad con runtimes GGUF: funciona con llama.cpp, Ollama, LM Studio, koboldcpp y cualquier runtime compatible con el formato.
- No hay informacion en el repositorio sobre soporte de tool calling, capacidades de vision o audio, ni modos de razonamiento extendido.

## Casos de uso

- Correccion previa a publicacion de contenido en chino: integracion en un CMS o pipeline editorial para revisar automaticamente articulos, entradas de blog o notas antes de publicarlas, reduciendo errores de mecanografia y homofonos.
- Limpieza de texto generado por OCR: los sistemas OCR sobre documentos chinos introducen sustituciones de caracteres similares; este modelo puede actuar como paso de post-procesado para corregir el texto reconocido.
- Revision de entradas de usuario en aplicaciones: validacion y normalizacion de texto escrito por usuarios en formularios, chats o comentarios dentro de apps dirigidas al mercado chino, ejecutandose localmente para evitar enviar datos a terceros.
- Asistente de escritura en dispositivos de borde: gracias a la cuantizacion Q4_K_M (por debajo de 1 GB), puede ejecutarse en portatiles o mini-PCs sin GPU como corrector offline en editores de texto.
- Preprocesado de datos para NLP: normalizacion de corpus chinos con errores antes de entrenar otros modelos o de realizar analisis de texto, mejorando la calidad de los datos de entrada.
- Aprendizaje del chino como lengua extranjera: herramienta que señala y corrige errores en textos escritos por estudiantes, devolviendo la version corregida de la frase.
- Mensajeria y comunicacion empresarial: correccion rapida de correos y mensajes en chino dentro de flujos de trabajo corporativos donde la privacidad exige procesamiento local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo original `shibing624/chinese-text-correction-1.5b` podria incluir metricas en su propia model card, pero este repositorio de cuantizaciones no aporta datos de evaluacion (ni de la precision del modelo base ni del impacto de cada cuantizacion en la calidad).

## Requisitos de hardware

- VRAM / memoria estimada para inferencia:
  - F16: ~3,0 GB
  - Q8_0: ~1,6 GB
  - Q6_K: ~1,2 GB
  - Q5_K_M: ~1,0 GB
  - Q4_K_M (recomendada): ~0,9 GB
  - Q2_K: ~0,6 GB
  (valores aproximados a partir del tamano del repo de 15,3 GB para 13 ficheros; se necesita memoria adicional para el KV cache segun la longitud del prompt)
- GPU recomendadas: cualquier GPU moderna con 4 GB de VRAM o mas ejecuta comodamente incluso F16; para las cuantizaciones de 4 bits basta con GPUs de 2 GB. No se requieren A100 ni H100.
- Consumer GPUs: cabe sin problemas en RTX 3060, RTX 4060, RTX 4090 y similares en cualquier cuantizacion; incluso puede ejecutarse solo con CPU y RAM dada su reducida huella.
- Opciones de despliegue: llama.cpp (llama-cli), Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF. No se menciona soporte para vLLM o TGI en este repo (GGUF no es el formato nativo de vLLM, aunque vLLM ha añadido soporte experimental para GGUF).
- Latencia y throughput: no disponibles; dado el tamano (1,5 B parametros), se espera inferencia rapida incluso en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| tinyopsec/chinese-text-correction-1.5b-GGUF | 1,54 B | Correccion de texto en chino | GGUF (F16–Q2_K) | Apache 2.0 | Cuantizaciones del modelo de shibing624; despliegue local facil |
| shibing624/chinese-text-correction-1.5b | 1,54 B | Correccion de texto en chino | safetensors | Apache 2.0 | Modelo original; formato completo sin cuantizar |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54 B | Uso general instructo | safetensors, GGUF (oficiales) | Apache 2.0 | Base del modelo; mas versatil pero sin especializacion en correccion |
| shibing624/pycorrector (modelos MacBERT/etc.) | ~100–300 M | Correccion de texto en chino | PyTorch | Variada (Apache 2.0 en su mayoria) | Alternativa clasica basada en BERT, mas ligera pero con menos capacidad contextual |

## Limitaciones y advertencias

- Especializacion estrecha: el ajuste fino esta orientado a correccion de texto en chino; su rendimiento en otros idiomas o en tareas generativas generales puede haberse degradado respecto a la base Qwen2.5-1.5B-Instruct. No hay datos de evaluacion que lo confirmen o desmienta.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede "corregir" frases correctas alterando su significado, o introducir nuevos errores. El propio autor incluye un disclaimer: "Evaluate before use" (evaluar antes de usar).
- Tamano reducido: con 1,5 B de parametros, la capacidad de razonamiento contextual es limitada frente a modelos de 7 B o mas; en textos con ambigüedad fuerte puede tomar correcciones incorrectas.
- Cuantizaciones agresivas: Q3 y Q2_K reducen notablemente la calidad; para uso en produccion se recomienda validar la cuantizacion elegida contra el modelo F16 o Q4_K_M.
- Contexto: la longitud de contexto no se indica en el repo; hay que verificarla en la configuracion del modelo base antes de procesar documentos largos.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar los terminos de la base Qwen2.5 (tambien Apache 2.0) para casos concretos.
- Cobertura de idiomas: la tarea esta disenada para chino; no hay informacion sobre soporte de otros idiomas en el repositorio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/tinyopsec/chinese-text-correction-1.5b-GGUF
- Modelo original (autor shibing624): https://huggingface.co/shibing624/chinese-text-correction-1.5b
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- llama.cpp: https://github.com/ggml-org/llama.cpp
