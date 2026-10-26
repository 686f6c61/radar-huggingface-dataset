# uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft8400-grpo660-lora

## Resumen

Qwen2.5-0.5B-Instruct-xlam-mixed-sft8400-grpo660-lora es un adaptador LoRA publicado por el usuario uygarkurt sobre el modelo base Qwen/Qwen2.5-0.5B-Instruct. No es un modelo completo: el repositorio contiene únicamente los pesos del adaptador (formato safetensors, librería PEFT) y debe cargarse sobre el modelo base original de Qwen. Su propósito es muy concreto: especializar un modelo de 500 millones de parámetros en *tool calling* estructurado y, de forma destacable, en la abstención cuando las herramientas ofrecidas no son relevantes para la consulta del usuario.

El entrenamiento se realizó con el framework Post-Training Lab del mismo autor, en dos fases sobre el dataset uygarkurt/xlam-tool-calling-mixed: 8.400 actualizaciones de supervised fine-tuning (SFT) seguidas de 660 actualizaciones de Group Relative Policy Optimization (GRPO) partiendo del adaptador SFT. El objetivo del GRPO es doble: mejorar la precisión de la llamada a herramienta y aprender a rechazar herramientas irrelevantes, un comportamiento crítico en agentes reales expuestos a catálogos de funciones amplios.

La relevancia de esta ficha es práctica: demuestra que un modelo de 0,5B parámetros, desplegable en hardware muy modesto, puede alcanzar un 78,88 % de exactitud en tool-call completo (xLAM ETC) y un 97,11 % en acierto de nombre de función (xLAM FNA) tras el ajuste con RL. El coste es un intercambio claro: la tasa de relevancia sube del 55,56 % al 83,33 % mientras la de irrelevancia cae del 88,59 % al 64,79 %, y las capacidades generales (MMLU 37,96 %, IFEval 29,02 %) se mantienen en niveles propios de un modelo de este tamaño.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen2.5); adaptador LoRA sobre atención y proyecciones |
| Parámetros totales | ~0,49B en el modelo base; el adaptador LoRA añade un número de parámetros no disponible en la información proporcionada |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base Qwen2.5-0.5B-Instruct (no verificado específicamente para el adaptador) |
| Tipos de cuantización | No disponible para el adaptador; el modelo base cuenta con cuantizaciones GGUF, AWQ y GPTQ de la comunidad |
| Idiomas soportados | en (inglés), según la model card; el modelo base Qwen2.5 es multilingüe (29+ idiomas) pero el adaptador no declara entrenamiento multilingüe |
| Licencia | No disponible (la del modelo base Qwen2.5-0.5B-Instruct es Apache 2.0) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-0.5B-Instruct, un transformer decoder-only de aproximadamente 500 millones de parámetros con normalización RMSNorm, activación SwiGLU, embeddings RoPE y atención con query/key/value bias, preentrenado por Alibaba Qwen sobre del orden de 18 billones de tokens (dato de la documentación pública del modelo base, no del adaptador). El adaptador en sí es un LoRA de rango no especificado en la información disponible; la model card no detalla dimensión de rango, alpha, dropout ni módulos objetivo.

El pipeline de entrenamiento tiene dos etapas bien diferenciadas. Primero, 8.400 actualizaciones de SFT sobre el dataset mixto de tool calling (uygarkurt/xlam-tool-calling-mixed), con un coste de 1,3 horas de bucle de entrenamiento. Después, 660 actualizaciones de GRPO que continúan ese adaptador SFT, con 0,4 horas adicionales, sumando 1,7 horas totales (sin contar carga de modelo, preparación de datos ni evaluación externa). La innovación reseñable no es arquitectónica sino de objetivo: el GRPO se emplea aquí para modelar explícitamente la abstención, es decir, que el modelo aprenda a no emitir una llamada cuando ninguna de las funciones del catálogo resulta pertinente, en lugar de forzar una herramienta cualquiera como hacen muchos ajustes de function calling.

## Capacidades

- Generación de texto conversacional en inglés, heredada de la instrucción-tuning del modelo base Qwen2.5-0.5B-Instruct.
- Tool calling estructurado: emisión de llamadas con nombre de función y argumentos en formato serializado, con un 97,11 % de acierto en nombre de función en el holdout xLAM evaluado.
- Abstención ante herramientas irrelevantes: capacidad entrenada explícitamente mediante GRPO, con un 83,33 % en el subconjunto de relevancia y un 64,79 % en el de irrelevancia.
- Razonamiento de un solo turno en selección de función (BFCL single-turn function calling, 55,21 % en los subconjuntos agregados).
- Seguimiento de instrucciones con formato: 29,02 % de precisión estricta a nivel de prompt en IFEval.
- Razonamiento matemático básico: 18,40 % en MATH-500, suficiente para aritmética simple pero no para problemas multi-paso.
- No se declaran capacidades de visión, audio, agentes multi-paso autónomos ni modo *thinking*; el contexto multilingüe no está validado por el autor.

## Casos de uso

- **Enrutado de herramientas en asistentes locales**: el modelo decide, entre un catálogo pequeño de funciones, cuál invocar y con qué argumentos, con un coste de inferencia de fracciones de segundo en CPU. Es adecuado porque su punto fuerte medido es precisamente el nombre de función (97,11 %).
- **Capa de abstención en pipelines agénticos**: actuar como filtro previo que decide si la consulta del usuario requiere alguna herramienta o debe responderse en lenguaje natural, reduciendo llamadas espurias a APIs. La mejora de relevancia del 55,56 % al 83,33 % tras GRPO respalda este uso.
- **Prototipado rápido de function calling en entornos sin GPU**: al caber en menos de 2 GB de VRAM en bf16, permite iterar sobre esquemas de herramientas en un portátil o incluso en un dispositivo embebido antes de escalar a un modelo mayor.
- **Clasificación y extracción de argumentos en formularios**: dado un conjunto de funciones con parámetros tipados, el modelo rellena los campos a partir de texto libre en inglés; útil para *slot filling* ligero en backoffice.
- **Generación de datos sintéticos de tool calling**: por su bajo coste, puede emplearse para producir borradores de trazas de llamadas que luego se filtran y se usan para entrenar modelos mayores, un patrón habitual de destilación.
- **Evaluación comparativa de técnicas de post-entrenamiento**: sirve como referencia reproducible (SFT frente a SFT+GRPO) para estudiar el efecto del RL en modelos pequeños, ya que el autor publica puntos de control intermedios (sft5600, sft8400, sft14000).
- **Asistente de consultas sobre APIs internas con vocabulario controlado**: si el catálogo de herramientas es estable y en inglés, el adaptador puede integrarse en un servicio de Transformers o vLLM con el adaptador cargado dinámicamente.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card. Todas las cifras son porcentajes. La primera fila corresponde al adaptador SFT usado para inicializar el GRPO; la segunda, al adaptador final.

| Checkpoint | Paso | MMLU | MATH-500 | IFEval | xLAM ETC | xLAM FNA | BFCL single-turn FC | Relevance | Irrelevance | Tiempo (h) |
|---|---|---|---|---|---|---|---|---|---|---|
| Adaptador SFT inicial | SFT 8.400 | 37,91 | 18,00 | 29,21 | 71,49 | 86,88 | 46,24 | 55,56 | 88,59 | 1,3 |
| SFT + GRPO (este adaptador) | GRPO 660 | 37,96 | 18,40 | 29,02 | 78,88 | 97,11 | 55,21 | 83,33 | 64,79 | 1,7 |

Notas de metodología declaradas por el autor: xLAM ETC es exactitud exacta de la llamada completa y xLAM FNA es exactitud del nombre de función; ambas se calculan sobre un holdout de solo llamadas con 2.287 ejemplos evaluados y 700 omitidos, no sobre el split de test del dataset mixto. BFCL single-turn FC agrega subconjuntos seleccionados de BFCL-v3 de un solo turno; Relevance e Irrelevance corresponden a los subconjuntos de relevancia seleccionados. IFEval usa precisión estricta a nivel de prompt. Las evaluaciones xLAM emplean scripts propios de Post-Training Lab, por lo que no son directamente comparables con cifras publicadas con otros arneses. No se han publicado resultados de benchmarks de terceros independientes en la información disponible.

## Requisitos de hardware

- **VRAM en bf16**: el modelo base de 0,49B ocupa aproximadamente 1 GB de pesos; con caché KV y overhead de runtime, el conjunto razonable es de 2 a 3 GB para contextos moderados.
- **VRAM en cuantización de 4 bits**: en torno a 0,5-0,8 GB de pesos, por lo que cabe holgadamente en cualquier GPU con 4 GB o más. Requiere fusionar el adaptador con el modelo base y convertir a GGUF/AWQ/GPTQ, ya que el repositorio solo distribuye pesos LoRA.
- **GPU recomendadas**: cualquier GPU consumer sirve. RTX 3060, RTX 4060, RTX 4090, e incluso iGPU con suficiente memoria compartida. Para servir en lote a gran escala, A100/H100 están sobredimensionadas para el cómputo pero permiten un throughput muy alto por su ancho de banda.
- **CPU y edge**: viable en CPU con llama.cpp; el autor del ecosistema Qwen documenta despliegues en dispositivos tipo M5Stack, lo que da idea del perfil de recursos.
- **Opciones de despliegue**: Transformers + PEFT (ruta natural, cargando el adaptador sobre Qwen/Qwen2.5-0.5B-Instruct), vLLM con soporte de adaptadores LoRA, TGI, y llama.cpp/Ollama tras fusionar y convertir los pesos.
- **Latencia y throughput**: no se han publicado mediciones en la información disponible. Por el tamaño, es esperable una latencia de decenas de milisegundos por turno corto en GPU consumer y de cientos de milisegundos en CPU, pero son estimaciones, no datos del autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (Qwen2.5-0.5B + LoRA SFT+GRPO) | ~0,49B | 32.768 (base) | Tool calling + abstención | No disponible | Hugging Face, 0 descargas, adaptador PEFT |
| Qwen/Qwen2.5-0.5B-Instruct | ~0,49B | 32.768 | Instrucciones generales, multilingüe | Apache 2.0 | Hugging Face, ampliamente desplegado |
| Adaptadores hermanos del mismo autor (sft5600, sft8400, sft14000) | ~0,49B | 32.768 (base) | Tool calling, solo SFT o distintas duraciones | No disponible | Hugging Face y FriendliAI |
| Qwen/Qwen2.5-1.5B-Instruct | ~1,5B | 32.768 | Instrucciones generales | Apache 2.0 | Hugging Face |

No se dispone en la información proporcionada de resultados de benchmarks de los adaptadores hermanos ni de modelos competidores de tool calling del mismo tamaño (por ejemplo, variantes Hammer o xLAM de ~1B), por lo que la comparación numérica con alternativas queda como no disponible. La comparación más informativa es interna: frente al adaptador SFT inicial, el GRPO mejora xLAM ETC en 7,39 puntos, xLAM FNA en 10,23 puntos, BFCL single-turn en 8,97 puntos y relevancia en 27,77 puntos, a costa de 23,80 puntos de irrelevancia.

## Limitaciones y advertencias

- **Licencia no declarada**: la model card no incluye licencia. Aunque el modelo base Qwen2.5-0.5B-Instruct es Apache 2.0, la ausencia de licencia explícita en el adaptador impide asumir derechos de uso comercial; hay que contactar con el autor antes de producción.
- **Solo inglés**: el campo `language` declara únicamente `en`. No hay evidencia de que el ajuste de tool calling funcione en castellano.
- **Degradación de la abstención inversa**: el GRPO sube la relevancia pero hunde la irrelevancia del 88,59 % al 64,79 %. En producción, esto significa que el modelo rechazará herramientas válidas con más frecuencia de la deseada; conviene calibrar el umbral o mantener el adaptador SFT si el falso negativo es más caro que el falso positivo.
- **Rendimiento general bajo**: MMLU 37,96 % e IFEval 29,02 % son propios de un modelo de 0,5B. No debe usarse para razonamiento complejo ni para seguir instrucciones de formato elaboradas fuera del esquema de herramientas.
- **Riesgo de alucinación de argumentos**: no se han publicado evaluaciones de fidelidad de los valores de argumentos; el 97,11 % de acierto en nombre de función no garantiza argumentos correctos.
- **Benchmarks autoinformados y con arnés propio**: los scripts de evaluación son del autor, los subconjuntos de BFCL están seleccionados y el holdout xLAM omite 700 ejemplos. No hay validación independiente.
- **Repositorio sin adopción**: 0 descargas y 0 likes en el momento de la consulta, con tamaño de repo reportado de 0,0 GB; conviene verificar la integridad de los ficheros del adaptador antes de integrarlo.
- **Fecha de creación anómala**: el repositorio figura creado el 2026-10-25, lo que puede indicar un error de metadatos; no se debe inferir de ello ninguna garantía de mantenimiento.

## Enlaces

- Hugging Face (adaptador): https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft8400-grpo660-lora
- Adaptador SFT previo (punto de partida del GRPO): https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft8400-lora
- Variante con más SFT (14.000 actualizaciones): https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft14000-lora
- Variante con menos SFT (5.600 actualizaciones, desplegada en FriendliAI): https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft5600-lora
- Dataset de entrenamiento: https://huggingface.co/datasets/uygarkurt/xlam-tool-calling-mixed
- Repositorio del framework de entrenamiento (Post-Training Lab): https://github.com/uygarkurt/post-training-lab
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Documentación de despliegue del modelo base en dispositivos embebidos: https://docs.m5stack.com/en/stackflow/models/qwen2.5-0.5b-instruct
- Entrada del modelo base en Ollama: https://ollama.com/library/qwen2.5:0.5b-instruct
