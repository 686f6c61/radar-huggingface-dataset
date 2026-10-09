# ztor2/jerboa-base

## Resumen

Jerboa es un modelo de lenguaje causal ultraligero desarrollado por el usuario ztor2, publicado en HuggingFace bajo el identificador `ztor2/jerboa-base`. Con 221.430.400 parámetros reales confirmados en los pesos safetensors, se posiciona en la franja de modelos de menos de 250 millones de parámetros, pensados para ejecución local en dispositivos con recursos limitados. El autor lo describe como un proyecto en desarrollo activo cuyo objetivo declarado es ofrecer un modelo de lenguaje y multimodal de bajo coste computacional optimizado específicamente para Apple Silicon (MPS/Metal) y despliegues en el borde (edge).

La arquitectura emplea un diseño "Deep & Thin" de 28 capas con una dimensión de modelo de 768 y una dimensión de feed-forward de 2048 con activación SwiGLU. Incorpora atención con consultas agrupadas (GQA) con 12 cabezas de consulta y 4 de clave/valor, normalización QK-Norm y atención de ventana deslizante intercalada (ventana local de 2048 tokens, con capas de atención global cada 4 capas). El vocabulario es de 49.152 tokens BPE y usa RoPE con theta de 500.000.

Su relevancia actual radica en el creciente interés por modelos pequeños que puedan ejecutarse en portátiles con chip Apple o en hardware de borde sin GPU dedicada, un nicho donde los pesos abiertos con licencia Apache 2.0 y soporte de `trust_remote_code` facilitan la experimentación. El modelo se entrenó con más de 1.230 millones de tokens (75% FineWeb-Edu, 25% código Python) y declara soporte para inglés y coreano, aunque no se han publicado resultados de benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only, 28 capas, d_model=768, d_ffn=2048 (SwiGLU), GQA (12 Q : 4 KV), QK-Norm, SWA intercalada |
| Parametros totales | 221.430.400 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible como valor maximo explicito; la ventana de atencion local declarada es de 2048 tokens con capas globales cada 4 capas |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos safetensors) |
| Idiomas soportados | ingles (en) y coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PyTorch), con codigo personalizado (`custom_code`, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo se define como un transformer causal decoder-only con una arquitectura a la que el autor denomina "Deep & Thin": 28 capas apiladas sobre una dimension oculta relativamente estrecha de 768. Cada bloque feed-forward usa SwiGLU con dimension intermedia de 2048. La atencion emplea consultas agrupadas con una relacion de 12 cabezas de consulta por 4 de clave/valor, lo que reduce el coste de memoria de la caché KV en inferencia, un detalle coherente con el objetivo de despliegue en dispositivos de borde. Se aplica QK-Norm para estabilizar el entrenamiento y una atencion de ventana deslizante intercalada: la mayoria de capas operan con una ventana local de 2048 tokens y cada cuatro capas se introduce atencion global, un patron habitual para reducir el coste cuadratico manteniendo cierta capacidad de mezcla a larga distancia.

El preentrenamiento declara un volumen superior a 1.230 millones de tokens, con una composicion del 75% procedente de FineWeb-Edu y un 25% de codigo Python. El vocabulario es de 49.152 tokens con tokenizacion BPE y las posiciones se codifican con RoPE de theta 500.000, valor elevado que en la practica suele asociarse a intentos de extender la longitud de contexto efectiva mas alla de la ventana de entrenamiento. La model card menciona tambien un componente multimodal (`JerboaVLForConditionalGeneration`) y una variante conversacional, pero no se detallan ni la arquitectura del proyector visual ni los datos de alineacion. No se documenta en la informacion disponible si hubo fases de RLHF, DPO u otra forma de ajuste por preferencias.

## Capacidades

- Generacion de texto autoregresiva en ingles y coreano mediante el pipeline `text-generation`.
- Modelado causal de lenguaje con licencia Apache 2.0, lo que permite uso comercial y modificacion.
- Soporte declarado de conversacion (etiqueta `conversational` en el repositorio).
- Componente multimodal anunciado (`JerboaVLForConditionalGeneration`) para generacion condicionada, sin detalles publicados sobre modalidades concretas.
- Exposicion de una arquitectura personalizada (`custom_code`) que exige `trust_remote_code=True` al cargar el modelo.
- Capacidad de tool calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo de razonamiento explicito (thinking): no disponible en la informacion proporcionada.
- Capacidades de audio o vision detalladas: no disponible en la informacion proporcionada.

## Casos de uso

- Asistentes locales en portatiles Apple Silicon: con 221 millones de parametros, el modelo puede ejecutarse en MPS/Metal ocupando una fraccion de la memoria unificada, lo que permite mantener un asistente de texto siempre disponible sin conexion.
- Autocompletado de codigo ligero en editores: dado que el 25% del preentrenamiento es codigo Python, es razonable usarlo como base para sugerencias de fragmentos cortos dentro de un IDE, asumiendo que no hay datos de evaluacion que garanticen calidad.
- Clasificacion y etiquetado de texto en lote: por su tamano reducido, permite procesar grandes volumenes de documentos en una sola maquina sin GPU, en tareas de extraccion de entidades o categorizacion.
- Prototipado e investigacion academica: sirve como banco de pruebas para estudiar el efecto de la atencion de ventana deslizante intercalada o de RoPE con theta 500.000 en modelos de menos de 250 millones de parametros.
- Aplicaciones de borde con restricciones de latencia y memoria: su tamano lo hace candidato para dispositivos embebidos con aceleradores modestos, siempre que se cuantice fuera del repositorio original.
- Generacion de texto en ingles y coreano: puede emplearse en tareas bilingues de resumen o reescritura para esos dos idiomas, que son los unicos declarados.
- Base para ajuste fino especifico de dominio (fine-tuning): al publicarse bajo Apache 2.0 y en safetensors, es adecuado como punto de partida para adaptaciones con LoRA u otras tecnicas de ajuste eficiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 221,4 millones de parametros, no confirmada por el autor): aproximadamente 0,9 GB en FP32, 0,45 GB en FP16/BF16, 0,22 GB en INT8 y 0,11 GB en INT4, sin contar la cache KV ni el overhead del runtime.
- GPU recomendadas: no disponible en la informacion proporcionada; el autor orienta explicitamente el modelo a Apple Silicon (MPS/Metal) y a dispositivos de borde.
- Compatibilidad con GPU de consumo: por tamano, cualquier GPU con mas de 2 GB de VRAM deberia poder alojarlo, incluidas integradas modernas, aunque no hay validacion publicada.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` y `trust_remote_code=True`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, y la ausencia de pesos GGUF en el repositorio limita el uso directo en runtimes orientados a CPU.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento en benchmarks |
|---|---|---|---|---|---|
| Jerboa base (ztor2) | 221,4 M | no especificado (SWA 2048 + globales cada 4 capas) | Apache 2.0 | safetensors en HuggingFace | no disponible |
| SmolLM2-360M | 362 M | 8.192 tokens | Apache 2.0 | safetensors y GGUF en HuggingFace | publicado por el autor |
| Qwen2.5-0.5B | 494 M | 32.768 tokens | Apache 2.0 | safetensors y GGUF en HuggingFace | publicado por el autor |
| TinyLlama-1.1B | 1,1 B | 2.048 tokens | Apache 2.0 | safetensors y GGUF en HuggingFace | publicado por el autor |

La comparacion se limita a parametros, contexto y licencia porque no hay resultados de benchmarks publicados para Jerboa. En terminos de ecosistema, Jerboa parte con desventaja frente a alternativas como SmolLM2 o Qwen2.5 en disponibilidad de cuantizaciones GGUF y en documentacion de rendimiento.

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks, por lo que no hay evidencia objetiva de calidad frente a alternativas de tamano similar.
- El modelo esta declarado como "en desarrollo activo", lo que implica posibles cambios incompatibles entre revisiones y ausencia de garantias de estabilidad en produccion.
- El repositorio tiene 122 descargas y 0 likes en el momento de la consulta, lo que indica validacion externa practicamente nula.
- Riesgo de alucinacion: previsiblemente alto en un modelo de 221 millones de parametros entrenado con poco mas de 1.200 millones de tokens, aunque no hay mediciones publicadas.
- Cobertura idiomatica limitada a ingles y coreano; el castellano no esta declarado como soportado.
- La longitud maxima de contexto efectiva no se especifica; la ventana local de 2048 tokens condiciona el rendimiento en tareas de contexto largo.
- El uso requiere `trust_remote_code=True`, lo que implica ejecutar codigo personalizado del autor; conviene auditar `modeling_*.py` antes de desplegarlo en entornos sensibles.
- Ausencia de pesos cuantizados oficiales (GGUF, AWQ, GPTQ), lo que obliga a cuantizar por cuenta propia si se busca despliegue en CPU o en hardware muy limitado.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero no exime de cumplir las obligaciones de atribucion y de conservar los avisos de licencia.
- No hay informacion sobre sesgos, composicion demografica del dataset ni procesos de alineacion, por lo que no es posible evaluar riesgos de contenido toxico o sesgado.
- No se documenta soporte de tool calling ni de razonamiento multi-paso, capacidades habitualmente requeridas en flujos de agentes.

## Enlaces

- HuggingFace: https://huggingface.co/ztor2/jerboa-base
- No se han encontrado papers, blogs, repositorios ni demos adicionales en los resultados de busqueda web proporcionados; las referencias devueltas corresponden a contenido no relacionado con el modelo.
