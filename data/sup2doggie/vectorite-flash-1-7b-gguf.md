# Sup2Doggie/Vectorite-Flash-1.7B-GGUF

## Resumen

Vectorite Flash 1.7B es un ajuste fino (fine-tuning) del modelo Qwen/Qwen3-1.7B, publicado por el usuario Sup2Doggie bajo la etiqueta Vectorite AI. Se trata de un asistente conversacional bilingue en Bahasa Indonesia e ingles, orientado a dotar al modelo base de una identidad propia y de un estilo de respuesta concreto, no a mejorar sus capacidades cognitivas. El resultado se distribuye en formato GGUF, pensado para ejecucion local con llama.cpp y con el espacio de demostracion del propio autor.

El modelo base Qwen3-1.7B es un transformer denso, decoder-only, de 1.720.574.976 parametros, bajo licencia Apache 2.0. El ajuste se realizo con LoRA sobre Unsloth, una sola epoca, mezclando conversaciones de identidad de Vectorite con UltraChat (en ingles) y Aya (en indonesio). El repositorio pesa 1,1 GB, lo que apunta a un unico archivo GGUF cuantizado (probablemente en torno a Q4_K_M) mas que a una coleccion completa de niveles de cuantizacion.

Su relevancia es limitada y muy especifica: es un modelo pequeno de 1,7B pensado para despliegue en hardware modesto y para conversacion bilingue indonesio-ingles. No compite en razonamiento ni en conocimiento general con modelos mayores; el propio autor advierte que el fine-tuning cambio su identidad y su estilo, no su inteligencia. En el momento de redactar esta ficha no registra descargas ni likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (Qwen3) |
| Parametros totales | 1.720.574.976 (aproximadamente 1,72 B) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; el modelo base Qwen3-1.7B declara 32.768 tokens de contexto nativo |
| Tipos de cuantizacion | GGUF; los niveles concretos no se detallan en la model card. El repositorio ocupa 1,1 GB, lo que sugiere un unico archivo cuantizado |
| Idiomas soportados | Indonesio (id) e ingles (en), con caracter bilingue declarado |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base original se distribuye en safetensors) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-1.7B: un transformer denso, decoder-only, con normalizacion RMSNorm, activacion SwiGLU, atencion con RoPE y QK-norm, y embeddings atados. Sobre esa base, el autor aplico un ajuste fino con LoRA mediante la libreria Unsloth, durante una unica epoca. No se indica la tasa de aprendizaje, el rango de LoRA, el tamano del lote ni la composicion exacta del dataset en terminos de numero de ejemplos o tokens.

El corpus de entrenamiento combina tres fuentes declaradas: conversaciones de identidad de Vectorite (para fijar el personaje y el tono del asistente), UltraChat en ingles y Aya en indonesio. No se menciona el uso de RLHF, DPO u otra fase de alineacion adicional, ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. El autor es explicito al senalar que el ajuste afecto a la identidad y al estilo, no al conocimiento general del modelo base.

## Capacidades

- Generacion de texto conversacional en Bahasa Indonesia e ingles, con tono e identidad propios de Vectorite Flash.
- Conversacion multiturno, etiquetada como "conversational" y compatible con endpoints estandar de HuggingFace.
- Cambio de idioma dentro de la misma conversacion (capacidad bilingue declarada).
- Conocimiento general heredado de Qwen3-1.7B, sin ampliacion durante el fine-tuning.
- Razonamiento basico, redaccion y traduccion en la medida en que lo permite un modelo de 1,72 B de parametros.
- No se declara soporte explicito de tool calling o function calling. Dado que el modelo base Qwen3 si lo soporta, es plausible heredarlo, pero la model card no lo confirma.
- No se declara soporte de agentes, razonamiento multi-paso guiado, vision, audio ni modo de pensamiento explicito.

## Casos de uso

- Asistente conversacional local en indonesio: el modelo puede desplegarse con llama.cpp u Ollama en un portatil sin GPU dedicada y mantener conversaciones multiturno con usuarios indonesios, sin enviar datos a un servicio en la nube.
- Chatbot de atencion al cliente para mercado indonesio: su caracter bilingue permite atender consultas en id y escalar a en cuando el operador o el sistema lo requiera, siempre que el dominio de la consulta no exija conocimiento especializado.
- Prototipado rapido de productos conversacionales: al pesar 1,1 GB en GGUF, se puede integrar en una aplicacion de escritorio o en un entorno CI para pruebas de regresion de prompts con coste minimo de infraestructura.
- Generacion de texto creativo breve en indonesio: redaccion de descripciones, respuestas cortas o mensajes con un tono consistente, aprovechando el ajuste de estilo.
- Traduccion asistida id-ingles a nivel de frase u oracion: util como primera pasada dentro de un pipeline que despues revise un modelo mayor o un traductor dedicado.
- Educacion y practica de idiomas: sirve como companero de conversacion bilingue en entornos con recursos limitados o sin conexion a internet.
- Demostraciones y evaluaciones de tecnicas de fine-tuning LoRA: es un caso de estudio util para quienes quieren inspeccionar el impacto de un ajuste de identidad sobre un modelo base de 1,7 B.
- Base para ajustes posteriores: al ser pequeno y Apache 2.0, se puede reajustar o destilar sobre el para dominios muy concretos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye mediciones de MMLU, HumanEval, GSM8K ni de ninguna otra suite, y los resultados de busqueda web no aportan cifras especificas para este ajuste. El autor solo indica de forma cualitativa que el fine-tuning cambio la identidad y el estilo del modelo, no su inteligencia.

## Requisitos de hardware

Las cifras de VRAM son estimaciones derivadas del numero de parametros (1,72 B) y no proceden de la model card.

| Precision / cuantizacion | VRAM estimada para pesos |
|---|---|
| f16 / BF16 | 3,4-3,8 GB |
| Q8_0 | 1,8-2,0 GB |
| Q6_K | 1,5-1,7 GB |
| Q5_K_M | 1,3-1,5 GB |
| Q4_K_M | 1,0-1,2 GB |

- Cabe holgadamente en GPU de consumo: RTX 3060 12 GB, RTX 4060 8 GB, RTX 4090, e incluso en GPUs con 4-6 GB si se usa cuantizacion Q4 o inferior.
- Tambien es viable en CPU pura: el repositorio GGUF completo ocupa 1,1 GB y el modelo puede residir en RAM convencional.
- GPU profesionales como A100 o H100 no aportan ventaja para este tamano; el modelo esta muy por debajo de su capacidad y el cuello de botella seria el ancho de banda, no la computacion.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, servidores compatibles con la API de OpenAI que acepten GGUF, y vLLM con soporte GGUF (con rendimiento inferior al de pesos safetensors en FP16/BF16).
- Latencia y throughput: no disponibles. En un portatil moderno con Q4_K_M es razonable esperar decenas de tokens por segundo, pero no hay mediciones publicadas por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Vectorite-Flash-1.7B | 1,72 B | No disponible (base: 32.768) | id, en | Apache 2.0 | GGUF | Fine-tuning LoRA de identidad y estilo; sin benchmarks publicados |
| Qwen/Qwen3-1.7B | 1,72 B | 32.768 tokens | Multilingue (incluye en, id) | Apache 2.0 | safetensors | Modelo base; conocimiento general intacto; soporte de tool calling declarado |
| Spark-X2.5-1.7B | 1,7 B (serie 1.7B / 4B) | No disponible | No disponible | No disponible | No disponible | Serie compacta de proposito general citada en los resultados de busqueda; sin datos verificables en esta ficha |
| Gemma 3 1B / Llama 3.2 1B | ~1-1,2 B | No disponible en la informacion recogida | Multilingue | Licencias propias de cada proveedor | safetensors, GGUF | Alternativas de tamano similar; no comparadas con datos en esta busqueda |

La comparativa se limita a parametros y licencia porque no existen resultados de benchmarks publicados para Vectorite Flash que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Modelo pequeno (1,72 B): puede equivocarse con facilidad en razonamiento, matematicas y conocimiento factual detallado.
- El ajuste fino modifico identidad y estilo, no la inteligencia. La model card lo advierte de forma explicita.
- Sin acceso a internet y sin herramientas externas integradas; no puede consultar informacion actualizada.
- Conocimiento general identico al del modelo base Qwen3-1.7B, con la misma fecha de corte y los mismos sesgos potenciales.
- Riesgo de alucinacion propio de un modelo de este tamano; no debe usarse como fuente de verdad en dominios sensibles (medicina, derecho, finanzas) sin verificacion humana.
- Cobertura de idiomas declarada limitada a indonesio e ingles; el rendimiento en castellano no esta garantizado ni documentado.
- No se especifica la longitud de contexto efectiva tras el fine-tuning; conviene no asumir que conserva intactos los 32.768 tokens del modelo base.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion, incluida la incorporacion a productos propietarios, siempre que se conserven los avisos de licencia y atribucion correspondientes.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en produccion ni validacion por parte de la comunidad.
- No hay informacion sobre composicion detallada del dataset de ajuste; los datos de identidad de Vectorite podrian introducir sesgos de estilo o de marca no documentados.
- La fecha de creacion registrada (30 de septiembre de 2026) es posterior a la fecha habitual de publicacion de los modelos Qwen3, lo que conviene tener en cuenta al verificar la procedencia del repositorio.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/Sup2Doggie/Vectorite-Flash-1.7B-GGUF
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Perfil del autor en HuggingFace: https://huggingface.co/Sup2Doggie
- Unsloth (libreria de fine-tuning empleada): https://github.com/unslothai/unsloth
- llama.cpp (runtime GGUF): https://github.com/ggml-org/llama.cpp
- Spark-X2.5 (serie de modelos compactos comparable, citada en la busqueda): https://github.com/XHToken/Spark-X2.5
- Listado de modelos GGUF: https://local-ai-zone.github.io/
- Comparativa de modelos de referencia (Artificial Analysis): https://artificialanalysis.ai/leaderboards/models
