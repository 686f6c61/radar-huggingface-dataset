# vividh111/Indus-1.1B-GGUF

## Resumen

Indus 1.1B GGUF es una conversión comunitaria no oficial a formato GGUF del modelo Indus 1.1B, un modelo de generación de texto en hindi desarrollado por el equipo Makers Lab de Tech Mahindra (publicado originalmente en el repositorio `nickmalhotra/ProjectIndus`). Esta conversión, realizada por el usuario `vividh111`, empaqueta los pesos en cuatro niveles de cuantización (Q4_K_M, Q5_K_M, Q8_0 y F16) para su uso con llama.cpp, Ollama y otros motores compatibles con GGUF, con el objetivo de facilitar el despliegue en hardware modesto, incluidos dispositivos móviles.

El modelo subyacente es un transformer de tipo GPT-2 (`GPT2LMHeadModel`) con 1.176.133.632 parámetros y una longitud de contexto de 1024 tokens, derivada de posiciones aprendidas. Está especializado en hindi (Devanagari) y no incorpora ventana de contexto extendida ni arquitecturas MoE. La conversión destaca por resolver un problema técnico concreto: el conversor estándar de llama.cpp falla con este modelo porque su tokenizador es un BPE estilo SentencePiece (con prefijo `▁` y fallback de bytes), no el BPE byte-level de GPT-2.

La relevancia de esta ficha radica en que documenta una conversión con verificación rigurosa (coincidencia de IDs de token en 5.000 de 5.000 líneas, coincidencia de siguiente token en 200 de 200 prompts frente al original en fp32) y en que advierte de limitaciones prácticas importantes, como el fallo de llama.cpp si se supera el contexto de 1024 tokens. Es un caso útil para desarrolladores que necesiten desplegar modelos pequeños en hindi en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-2 (`GPT2LMHeadModel`) |
| Parametros totales | 1.176.133.632 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens (posiciones aprendidas) |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q8_0, F16 |
| Idiomas soportados | hindi (hi); el modelo base está orientado a hindi, con pruebas adicionales en bhojpuri, maithili, magahi, awadhi y chhattisgarhi |
| Licencia | project-indus-license-agreement (acuerdo de Tech Mahindra, 21 de mayo de 2024); el repo original está etiquetado como `osl-3.0`, pero prevalece el acuerdo |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only con arquitectura GPT-2, es decir, atención causal estándar con posiciones aprendidas y sin mecanismos de atención lineal, SSM ni mezcla de expertos. La longitud de contexto queda fijada en 1024 tokens por las posiciones aprendidas del modelo original. El tokenizador es un BPE estilo SentencePiece con prefijo `▁` para espacios y fallback de bytes, lo que lo diferencia del BPE byte-level de GPT-2 y provoca que el conversor estándar `convert_hf_to_gguf.py` de llama.cpp aborte con el error `BPE pre-tokenizer was not recognized`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. La innovación técnica destacable de esta conversión es el script `convert_indus.py`, que sustituye únicamente el paso de vocabulario del conversor de llama.cpp: asigna a cada token una puntuación basada en su rango de merge BPE, rellena el vocabulario hasta 32.300 tokens (el tamaño de la matriz de embeddings) y desactiva `clean_up_tokenization_spaces` para no eliminar espacios antes de puntuación al decodificar. Las verificaciones reportadas incluyen coincidencia de IDs de token con el tokenizador de HF en 5.000 de 5.000 líneas y en 49 de 49 casos límite, y coincidencia del siguiente token en 200 de 200 prompts frente al modelo original en fp32, con una divergencia KL media de 0,000004.

## Capacidades

- Generación de texto conversacional en hindi (Devanagari) con plantilla de chat incluida en el archivo GGUF.
- Respuesta a preguntas factuales sencillas en hindi (por ejemplo, capitales de países).
- Manejo de texto en escrituras derivadas del hindi (bhojpuri, maithili, magahi, awadhi, chhattisgarhi) según las pruebas del tokenizador.
- Soporte limitado de hindi en escritura romana e inglés, aunque estos se convierten mayoritariamente en tokens de byte y consumen la ventana de contexto aproximadamente 4,5 veces más rápido que el Devanagari.
- No se ha documentado soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.
- Capacidad multilingüe muy restringida: el modelo está etiquetado únicamente para hindi.

## Casos de uso

- Asistente conversacional en hindi para dispositivos móviles: la cuantización Q4_K_M ocupa 0,76 GB y está pensada para ejecutarse en teléfonos, lo que permite desplegar un chatbot en hindi sin conexión a la nube.
- Respuesta a preguntas frecuentes en hindi: con un contexto de 1024 tokens, el modelo puede gestionar intercambios breves de preguntas y respuestas sobre temáticas acotadas (horarios, trámites, información local) en aplicaciones de atención ciudadana.
- Prototipado rápido con Ollama: el Modelfile incluido permite crear un modelo local con `ollama create` y probar respuestas en hindi en minutos, adecuado para validar ideas antes de invertir en modelos mayores.
- Generación de texto en hindi para entornos con recursos limitados: en una CPU o GPU integrada, la variante Q4_K_M ofrece unas 238 tok/s de generación en un Apple M5 Pro (Metal), suficiente para tareas de redacción asistida por lotes.
- Experimentación lingüística con variedades del hindi: el tokenizador verificado sobre bhojpuri, maithili, magahi, awadhi y chhattisgarhi permite probar el modelo en textos de estas lenguas regionales, aunque el entrenamiento declarado es solo en hindi.
- Evaluación de técnicas de cuantización: la tabla de perplejidad en FLORES+ devtest hindi (54,50 en Q4_K_M frente a 52,90 en F16) y la coincidencia de siguiente token sirven como caso de estudio para medir el coste de cuantizar un modelo pequeño.
- Integración en pipelines de llama.cpp: el servidor `llama-server` con `--jinja` y contexto fijado a 1024 permite exponer una API compatible con endpoints para aplicaciones internas de bajo tráfico.

## Benchmarks y rendimiento

Datos de perplejidad y rendimiento reportados por el autor de la conversión:

| Archivo | Tamano | Perplejidad (FLORES+ devtest hindi, contexto 1024) | Mismo token top que F16 | Prompt tok/s | Generacion tok/s |
|---|---:|---:|---:|---:|---:|
| Q4_K_M | 0,76 GB | 54,50 | 86,1% | 6.559 | 238 |
| Q5_K_M | 0,87 GB | 53,27 | 92,5% | 6.383 | 214 |
| Q8_0 | 1,26 GB | 52,91 | 98,2% | 6.800 | 170 |
| F16 | 2,36 GB | 52,90 | - | 6.881 | 104 |

El modelo original en bf16 obtiene 52,83 de perplejidad en el mismo texto, por lo que Q4_K_M supone un coste aproximado del 3%. Las velocidades se midieron con `llama-bench` en un Apple M5 Pro (Metal), con llama.cpp b11836 y Ollama 0.40.5. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,76 GB para Q4_K_M, 0,87 GB para Q5_K_M, 1,26 GB para Q8_0 y 2,36 GB para F16, más el espacio de trabajo del contexto de 1024 tokens.
- GPU recomendadas: no se especifican modelos concretos; el autor probó en un Apple M5 Pro con Metal. Por tamaño, cualquier GPU con al menos 2-3 GB de memoria libre puede alojar las variantes cuantizadas.
- Cabe en GPU de consumo: sí, todas las variantes cuantizadas caben en GPUs de consumo con 4 GB o más de VRAM; Q4_K_M está pensada explícitamente para teléfonos.
- Opciones de despliegue: llama.cpp (`llama-server` con `--jinja`), Ollama (Modelfile incluido con `num_ctx 1024`), y cualquier motor compatible con GGUF. No se mencionan vLLM ni TGI.
- Latencia y throughput: en Apple M5 Pro (Metal), entre 104 tok/s (F16) y 238 tok/s (Q4_K_M) de generación, y entre 6.383 y 6.881 tok/s de prompt. No se han probado en teléfono.
- Advertencia de contexto: con contexto superior a 1024 tokens, llama.cpp aborta con `GGML_ASSERT ... failed`.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada para establecer una comparativa rigurosa. Como referencia cualitativa, el propio modelo base `nickmalhotra/ProjectIndus` (en safetensors, bf16) es la alternativa directa, con una perplejidad de 52,83 frente a 52,90 de la variante F16 GGUF. Para otros modelos pequeños orientados a hindi no hay datos disponibles en esta ficha.

| Modelo | Parametros | Contexto | Perplejidad (FLORES+ hindi) | Licencia | Formato |
|---|---:|---:|---:|---|---|
| Indus 1.1B GGUF (Q4_K_M) | 1,176 B | 1024 | 54,50 | project-indus-license-agreement | GGUF |
| Indus 1.1B GGUF (F16) | 1,176 B | 1024 | 52,90 | project-indus-license-agreement | GGUF |
| ProjectIndus (base, bf16) | 1,176 B | 1024 | 52,83 | project-indus-license-agreement | safetensors |
| Otros modelos para hindi | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Contexto fijado a 1024 tokens: superar este límite provoca un fallo de aserción en llama.cpp; el Modelfile ya configura `num_ctx 1024`, pero cualquier integración debe respetarlo.
- Sesgos conocidos: no se documentan sesgos específicos en la información disponible, pero al ser un modelo entrenado principalmente en hindi, su cobertura cultural y lingüística es limitada.
- Riesgo de alucinación: sin datos de evaluación factual; el autor reporta que la decodificación greedy entra en bucles sin penalización de repetición (70 de 100 respuestas en sus pruebas), lo que sugiere respuestas repetitivas o poco fiables en modo determinista.
- Decodificación: se recomienda temperatura 0,7, top_p 0,9 y penalización de repetición 1,2; la búsqueda por haz aumenta los rechazos de peticiones ordinarias (20 de 100 frente a 4 de 100).
- Idiomas: solo hindi declarado; el texto en escritura romana e inglés se convierte mayoritariamente en tokens de byte y consume el contexto unas 4,5 veces más rápido.
- Licencia: los pesos están cubiertos por el acuerdo de Tech Mahindra (21 de mayo de 2024), no por `osl-3.0` pese a la etiqueta del repo original; es necesario revisar el acuerdo antes de cualquier uso comercial. El script `convert_indus.py` es Apache-2.0.
- Conversión no oficial: no es un lanzamiento de Tech Mahindra; el autor ofrece mover o renombrar los archivos si el equipo de Makers Lab lo solicita.
- Sin pruebas en teléfono: el autor no ha verificado el rendimiento en dispositivos móviles pese a que Q4_K_M está pensada para ellos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/vividh111/Indus-1.1B-GGUF
- Modelo base: https://huggingface.co/nickmalhotra/ProjectIndus
- Acuerdo de licencia: https://huggingface.co/vividh111/Indus-1.1B-GGUF/blob/main/LICENSE_AGREEMENT_PROJECT_INDUS.docx
- Script de conversión: https://huggingface.co/vividh111/Indus-1.1B-GGUF/blob/main/convert_indus.py
- Modelfile para Ollama: https://huggingface.co/vividh111/Indus-1.1B-GGUF/blob/main/Modelfile
