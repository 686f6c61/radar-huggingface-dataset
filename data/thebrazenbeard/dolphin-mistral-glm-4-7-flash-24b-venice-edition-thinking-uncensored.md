# thebrazenbeard/Dolphin-Mistral-GLM-4.7-Flash-24B-Venice-Edition-Thinking-Uncensored

## Resumen

Dolphin-Mistral-GLM-4.7-Flash-24B-Venice-Edition-Thinking-Uncensored es un ajuste fino de tipo "reasoning/thinking" construido por el usuario thebrazenbeard sobre dphn/Dolphin-Mistral-24B-Venice-Edition, que a su vez es la version sin censura de Mistral 24B desarrollada por dphn.ai en colaboracion con Venice.ai. El modelo parte de la variante instruct de Dolphin Mistral 24B Venice Edition y se ha reconvertido a un modelo con modo de razonamiento explicito, destilando el comportamiento de pensamiento de GLM 4.7 Flash a traves del dataset TeichAI/glm-4.7-2000x. No es un modelo nuevo desde cero, sino un finetune de especializacion.

El objetivo declarado por el autor es doble: por un lado, incorporar razonamiento estilo GLM 4.7 Flash (minimo, compacto y preciso) preservando las funciones y metricas originales de Venice; por otro, mantener el caracter completamente sin censura e incorrupto de la familia Dolphin, con enfasis en generacion creativa, ficcion, roleplay y casos de uso para adultos. El entrenamiento se realizo con Unsloth sobre hardware local, ejecutando Linux para Windows.

Tecnicamente se trata de un transformer denso de 23.572.403.200 parametros (unos 23,5B), con ventana de contexto declarada de 32k tokens ampliable mediante RoPE, pesos en bfloat16/safetensors y disponibilidad en GGUF a traves de quantizaciones de terceros. La licencia es Apache 2.0. En el momento de la consulta el repositorio registra 0 descargas y 0 "likes", por lo que se trata de una publicacion muy reciente y practicamente sin validacion externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Mistral, plantilla Mistral V7-Tekken) |
| Parametros totales | 23.572.403.200 (23,5B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32k tokens declarados por el autor, ampliable via RoPE; proveedores de inferencia reportan entre 33k y 74k segun memoria disponible |
| Tipos de cuantizacion | bfloat16 (safetensors); GGUF (quantizaciones i1 de mradermacher, incluida Q4_K_M y Q8_0) |
| Idiomas soportados | ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16) y GGUF |

## Arquitectura y entrenamiento

La base es un transformer denso de la familia Mistral 24B (la misma arquitectura empleada por Dolphin-Mistral-24B-Venice-Edition), con la plantilla de chat Mistral por defecto en su revision V7-Tekken (`<s>[SYSTEM_PROMPT]...[/SYSTEM_PROMPT][INST]...[/INST]`). El modelo original de dphn es un ajuste de Mistral 24B orientado a eliminar el alineamiento y devolver el control del system prompt al operador. Sobre esa base, thebrazenbeard realizo un "convert" de instruct a thinking: es decir, un finetune adicional para implantar un modo de razonamiento autogenerado que no requiere que el usuario suministre un system prompt para activarse.

El entrenamiento se ejecuto con Unsloth y utilizo el dataset TeichAI/glm-4.7-2000x, una destilacion de comportamiento de razonamiento de GLM 4.7 Flash. Segun el autor, se aplico una intensidad de entrenamiento minima deliberadamente, con el objetivo de implantar el patron de pensamiento sin degradar las funciones y caracteristicas nucleares del modelo Venice original. El system prompt esta embebido en la plantilla Jinja, de modo que el comportamiento sin censura se activa por defecto. No se proporcionan detalles sobre numero de tokens de entrenamiento, composicion exacta del dataset ni si hubo fases de RLHF o DPO mas alla del finetune supervisado.

## Capacidades

- Generacion de texto general y conversacion multi-turno.
- Razonamiento explicito (modo "thinking"): genera una cadena de pensamiento propia antes de responder, sin requerir system prompt que la active.
- Escritura creativa y de ficcion: relatos, generacion de trama y subtramas, continuacion de escenas y narracion de todos los generos (ciencia ficcion, romance, terror, etc.).
- Roleplay y juegos de rol conversacionales.
- Salida sin censura: el autor declara que el modelo genera cualquier tipo de contenido, incluido material con lenguaje soez, tematica R y X, y contenido para adultos (etiqueta not-for-all-audiences).
- Capacidades multilingues en ingles y chino.
- Control mediante system prompt: al conservar el diseno Dolphin/Venice, el operador define tono, personaje y reglas de comportamiento.
- Compatibilidad de plantilla con el ecosistema Mistral (vLLM, TGI, transformers, sglang).

## Casos de uso

- Generacion de ficcion larga y novelas por entregas: el modelo combina el modo de razonamiento (para planificar arcos y coherencia argumental) con una ventana de 32k tokens que permite mantener el contexto de capitulos completos sin perder hilos narrativos.
- Motores de roleplay y compania conversacional: pensado explicitamente para juegos de rol de larga duracion, con capacidad de mantener personajes coherentes y contenido sin restricciones tematicas.
- Plataformas de escritura asistida sin filtros editoriales: util para autores que necesitan generar o continuar escenas con violencia, contenido adulto o temas que los modelos alineados rechazan.
- Generacion de guiones y dialogos para videojuegos: con pensamiento previo que ayuda a estructurar subtramas y motiva las decisiones de los personajes.
- Investigacion sobre alineamiento y red teaming: al ser un modelo deliberadamente sin censura, sirve como sujeto de estudio para medir hasta donde llega un modelo no alineado y para calibrar sistemas de moderacion.
- Prototipado de chatbots de personaje dentro de productos propios: al no depender de un proveedor con system prompt controlado, el integrador conserva el control de la personalidad y de la politica de contenido.
- Traduccion y generacion bilingue ingles-chino en contextos creativos o conversacionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor menciona que se anadieron "datos, benchmarks e informacion" del modelo base Dolphin-Mistral-24B-Venice-Edition, pero el contenido correspondiente no aparece en la informacion proporcionada, y no hay cifras verificables de MMLU, HumanEval, GSM8K ni de evaluaciones de razonamiento para este finetune concreto.

## Requisitos de hardware

- VRAM en bfloat16 (pesos completos): aproximadamente 47 GB, por lo que requiere GPU de 48 GB o mas (A6000, A100 80 GB, H100).
- VRAM en GGUF Q4_K_M: aproximadamente 14,6 GB, alrededor de un 43% menos que Q8_0, con una perdida de calidad pequena.
- VRAM en GGUF Q8_0: del orden de 25 GB.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB como RTX 3090 o RTX 4090 usando quantizaciones Q4_K_M o similares; tambien en RTX 5090 de 32 GB.
- En una RTX 5090 de 32 GB con quantizacion i1, las mediciones de terceros indican que puede usar de forma segura hasta unos 74k tokens de contexto, muy por encima de los 32k declarados por el autor, gracias a la extension por RoPE.
- Opciones de despliegue: vLLM, transformers, TGI, sglang, Ollama, LM Studio y llama.cpp mediante los GGUF publicados por mradermacher.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Razonamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Dolphin-Mistral-GLM-4.7-Flash-24B-Venice-Thinking (este) | 23,5B | 32k (ampliable por RoPE) | Si, modo thinking destilado de GLM 4.7 Flash | Apache 2.0 | HF, safetensors y GGUF |
| dphn/Dolphin-Mistral-24B-Venice-Edition | ~24B | no disponible | No (instruct, sin modo thinking) | Apache 2.0 | HF, Venice.ai |
| DavidAU/Dolphin-Mistral-GLM-4.7-Flash-24B-Venice-Thinking-Uncensored | ~24B | no disponible | Si | no disponible | HF |
| Mistral Small 24B (base de la familia) | ~24B | ~32k | No | Apache 2.0 (segun version) | HF, multiples proveedores |

Los datos de la comparativa proceden de la informacion disponible; para las variantes de terceros no se han publicado cifras de contexto ni de rendimiento verificables.

## Limitaciones y advertencias

- Ausencia total de alineamiento y de filtros de seguridad: el autor lo declara explicitamente ("no nanny... anywhere"). Puede producir contenido ilegal, danino, sexual explicito, violento o con lenguaje soez sin restriccion, algo especialmente critico si se expone a usuarios finales.
- Riesgo elevado de alucinacion: no hay benchmarks publicados ni validacion externa del finetune, por lo que su fiabilidad factual no esta contrastada.
- La model card es esencialmente promocional y autoafirmativa, con afirmaciones no verificadas ("this model is a beast"), por lo que conviene tratarla con cautela tecnica.
- Cobertura de idiomas limitada a ingles y chino; el rendimiento en castellano no esta documentado.
- La ventana de contexto nominal es de 32k tokens; las cifras superiores (hasta 74k) dependen de la memoria de la GPU y de configuraciones concretas de RoPE, no de un ajuste oficial.
- Aunque la licencia Apache 2.0 permite uso comercial, el contenido generado puede vulnerar normativas de moderacion, proteccion de menores o difamacion; la responsabilidad legal recae integramente en el operador.
- Repositorio con 0 descargas y 0 "likes": sin comunidad, sin issues resueltas y sin historial de mantenimiento, lo que aumenta el riesgo de bugs en la plantilla o en los pesos.
- Los GGUF disponibles son quantizaciones de terceros (mradermacher, "i1"), no publicadas por el autor, por lo que pueden no reflejar exactamente el comportamiento del modelo original.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thebrazenbeard/Dolphin-Mistral-GLM-4.7-Flash-24B-Venice-Edition-Thinking-Uncensored
- Modelo base: https://huggingface.co/dphn/Dolphin-Mistral-24B-Venice-Edition
- Dataset de destilacion: https://huggingface.co/datasets/TeichAI/glm-4.7-2000x
- Variante de terceros (DavidAU): https://huggingface.co/DavidAU/Dolphin-Mistral-GLM-4.7-Flash-24B-Venice-Edition-Thinking-Uncensored
- Ficha en ANT (proveedor de inferencia): https://antbase.ai/models/dolphin-mistral-glm-4-7-flash-24b-venice-edition-thinking-uncensored
- Analisis de requisitos de VRAM y contexto (willitrunai): https://willitrunai.com/models/hf-mradermacher--dolphin-mistral-glm-4-7-flash-24b-venice-edition-thinking-uncensored-i1-gguf
- Sitio de dphn.ai: https://dphn.ai
- Chat web de Dolphin: https://chat.dphn.ai
- Bot de Telegram: https://t.me/DolphinAI_bot
- Ensayo de Eric Hartford sobre modelos sin censura: https://erichartford.com/uncensored-models
