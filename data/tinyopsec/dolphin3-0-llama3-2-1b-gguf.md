# tinyopsec/Dolphin3.0-Llama3.2-1B-GGUF

## Resumen
Dolphin3.0-Llama3.2-1B-GGUF es una coleccion de cuantizaciones GGUF del modelo dphn/Dolphin3.0-Llama3.2-1B, un ajuste fino instructivo (Dolphin 3.0) sobre Llama-3.2-1B de Meta. El repositorio lo publica el usuario tinyopsec y su funcion principal es ofrecer los pesos del modelo en formatos optimizados para inferencia local con llama.cpp y otros runtimes compatibles con GGUF (Ollama, LM Studio, koboldcpp). El modelo base es un transformer decoder-only denso de aproximadamente 1.236 millones de parametros, derivado de la arquitectura Llama-3.2-1B.

La relevancia de esta ficha reside en que el modelo original se distribuye en safetensors y este repositorio lo empaqueta en 13 variantes de cuantizacion (de F16 a Q2_K), lo que permite ejecutarlo en hardware muy modesto, incluidos equipos sin GPU dedicada. Al tratarse de un modelo "uncensored" y orientado a conversacion, esta pensado para prototipado rapido, experimentacion con system prompts y despliegues de bajo coste, no para cargas de produccion de alta exigencia.

La informacion disponible sobre el modelo base es limitada: no se detallan los datos de entrenamiento del ajuste Dolphin 3.0, ni la composicion del dataset, ni los resultados de benchmarks. Esta ficha refleja exclusivamente lo que consta en la model card del repositorio y en los metadatos de Hugging Face, marcando como "no disponible" todo aquello que no se ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Llama-3.2) |
| Parametros totales | 1.235.818.528 (aprox. 1,24 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el modelo base Llama-3.2-1B declara 128k tokens; la model card de este repositorio no lo confirma) |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M (recomendada), Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | No disponible |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | GGUF (generado con llama.cpp); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento
El modelo subyacente es un transformer decoder-only denso de la familia Llama-3.2-1B, con atencion multi-cabeza y normalizacion RMSNorm, en la configuracion estandar de Meta para esa talla. Sobre esa base, dphn aplico un ajuste instructivo en el marco del proyecto Dolphin 3.0, cuyo objetivo declarado es producir modelos "uncensored" y "steerable" mediante system prompt. La model card de este repositorio no documenta el volumen de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO o SFT supervisado; todos esos datos deben considerarse no disponibles.

La aportacion tecnica de este repositorio concreto no es el entrenamiento, sino la conversion y cuantizacion de los pesos a GGUF mediante llama.cpp, con 13 variantes que cubren desde F16 (3,0 GB) hasta Q2_K. No se documentan innovaciones adicionales como decodificacion especulativa, atencion lineal ni arquitecturas hibridas en la informacion proporcionada.

## Capacidades
- Generacion de texto conversacional en formato instruct, con soporte de turnos multi-turno.
- Razonamiento basico y respuesta a instrucciones generales, limitado por la talla de 1B parametros.
- Generacion de codigo y tareas sencillas de matematicas, sin garantias de fiabilidad en problemas complejos.
- Comportamiento "uncensored" y "steerable": el estilo y las restricciones de respuesta se modulan mediante system prompt.
- Compatibilidad con tool calling y function calling: no disponible (no se documenta en la model card).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se documenta).
- Capacidades multilingues: no disponible (no se especifican idiomas).
- Capacidades especiales (vision, audio, thinking mode): no disponibles; el pipeline declarado es unicamente text-generation.

## Casos de uso
- Prototipado de chatbots locales: con la cuantizacion Q4_K_M el modelo ocupa unos cientos de MB y puede ejecutarse en un portatil mediante llama.cpp u Ollama, lo que permite iterar rapidamente sobre prompts de sistema y flujos conversacionales sin coste de API.
- Asistentes personales offline: al ser GGUF y ejecutable en CPU, encaja en escenarios de privacidad estricta donde los datos no deben salir del dispositivo, como notas personales o gestion de correo local.
- Generacion de texto de bajo coste en edge: despliegue en dispositivos con recursos limitados (Raspberry Pi de gama alta, mini-PC) para tareas de resumen, reescritura o clasificacion textual simple.
- Experimentacion con alineacion y "steering": util para investigadores que quieran estudiar como responde un modelo uncensored a distintos system prompts, comparando variantes de cuantizacion para medir el impacto en calidad.
- Educacion y demos de IA: sirve como modelo didactico para ensenar el funcionamiento de LLM y cuantizacion en talleres, dado su tamano manejable y la disponibilidad de 13 niveles de precision.
- Integracion en pipelines de generacion de texto por lotes: mediante llama.cpp en modo servidor o a traves de runtimes compatibles, para tareas de etiquetado, extraccion o generacion masiva donde no se requiere maxima calidad.
- Pruebas de regresion de cuantizacion: comparar F16 frente a Q4_K_M o Q2_K permite evaluar la degradacion de calidad en un modelo pequeno antes de aplicar tecnicas similares a modelos mayores.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye metricas de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos, y los metadatos de Hugging Face no aportan datos de evaluacion.

## Requisitos de hardware
- VRAM estimada para inferencia: F16 requiere aproximadamente 3,0 GB; Q8_0 en torno a 1,3 GB; Q4_K_M en torno a 0,7-0,8 GB; Q2_K por debajo de 0,5 GB (estimaciones basadas en el tamano declarado de los ficheros y el numero de parametros).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) puede alojar el modelo completo incluso en F16; tambien funciona en GPUs de gama baja y en iGPU.
- Cabe en GPU consumer: si, en todas las cuantizaciones; incluso en CPU sin GPU dedicada con Q4_K_M.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama, LM Studio, koboldcpp, y cualquier runtime compatible con GGUF.
- Latencia y throughput estimados: no disponibles; dependen del hardware y del runtime, y no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Dolphin3.0-Llama3.2-1B (este repo, GGUF) | 1,24B | No disponible | Llama 3.2 Community | GGUF (13 cuantizaciones) | Uncensored, orientado a conversacion |
| meta-llama/Llama-3.2-1B-Instruct | 1,24B | 128k (segun model card de Meta) | Llama 3.2 Community | Safetensors | Modelo oficial instructivo de Meta |
| dphn/Dolphin3.0-Llama3.2-1B | 1,24B | No disponible | Llama 3.2 Community | Safetensors | Modelo base de este repositorio |
| TinyLlama-1.1B-Chat | 1,1B | 2k-4k (segun variante) | Apache 2.0 | Safetensors, GGUF | Alternativa de talla similar con licencia permisiva |

La comparativa de rendimiento entre estos modelos no esta disponible en la informacion proporcionada; no se han publicado metricas que permitan establecer diferencias cuantitativas.

## Limitaciones y advertencias
- Sesgos conocidos: no documentados en la model card; al derivar de Llama-3.2-1B y de un ajuste uncensored, es probable que herede sesgos del corpus original, pero no hay evidencia publicada en este repositorio.
- Riesgo de alucinacion: elevado en un modelo de 1B parametros, especialmente en tareas factuales, matematicas complejas y codigo de produccion.
- Limitaciones de contexto e idioma: la longitud de contexto no esta confirmada en este repositorio y los idiomas soportados no estan especificados; el rendimiento fuera del ingles es incierto.
- Restricciones de licencia: se aplica la Llama 3.2 Community License, que impone condiciones de uso comercial (incluida la obligacion de atribucion y restricciones para entidades con mas de 700 millones de usuarios mensuales). Conviene revisar el texto completo antes de un despliegue comercial.
- Caracter "uncensored": el modelo esta disenado para reducir rechazos, lo que aumenta el riesgo de generar contenido inapropiado; requiere moderacion adicional en produccion.
- Calidad de cuantizacion: las variantes Q2_K y Q3_K pueden degradar notablemente la coherencia en un modelo de esta talla; se recomienda Q4_K_M o superior para uso real.
- Trazabilidad: el repositorio lo publica un usuario individual (tinyopsec) y no se documenta el proceso de conversion; para entornos criticos conviene verificar los hashes frente al modelo base.
- Idoneidad para produccion: no recomendado como motor principal en cargas de alta exigencia; su uso natural es prototipado, experimentacion y despliegues de bajo coste.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/tinyopsec/Dolphin3.0-Llama3.2-1B-GGUF
- Modelo base (Dolphin 3.0 Llama 3.2 1B): https://huggingface.co/dphn/Dolphin3.0-Llama3.2-1B
- Modelo original de Meta (Llama 3.2 1B): https://huggingface.co/meta-llama/Llama-3.2-1B
- Llama 3.2 Community License: https://www.llama.com/llama3_2/license/
- llama.cpp (runtime GGUF): https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
- LM Studio: https://lmstudio.ai
- koboldcpp: https://github.com/LostRuins/koboldcpp
