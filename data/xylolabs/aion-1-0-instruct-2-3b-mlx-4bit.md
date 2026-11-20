# Xylolabs/Aion-1.0-Instruct-2.3B-MLX-4bit

## Resumen

Aion 1.0 Instruct 2.3B es un modelo de lenguaje pequeno (SLM) desarrollado por el Applied Sciences Group de Microsoft Windows & Devices, disenado especificamente para inferencia en dispositivo (on-device) dentro del ecosistema Windows. Con 2.288.831.488 parametros, el modelo busca ofrecer comprension y generacion de texto de calidad empresarial sin depender de conectividad con la nube, priorizando privacidad y latencia baja en el borde. Microsoft ha anunciado que una version optimizada de este modelo, combinada con su modelo de moderacion de contenido, se convertira en el SLM del sistema operativo Windows a finales de enero de 2027.

El repositorio aqui descrito no es el modelo original, sino una cuantizacion a 4 bits en formato MLX realizada por Xylolabs para ejecucion en Apple Silicon mediante `mlx-lm`. La cuantizacion emplea un esquema mixto por tensor (4, 6 y 8 bits segun la proyeccion) y anade un fichero de modelado `aion_instruct.py`, ya que `mlx-lm` no incluye un tipo de modelo `aion_instruct` nativo. El resultado ocupa 1,64 GB en disco y mantiene un top-1 del 94,17 % respecto a la referencia en f32.

La relevancia actual del modelo radica en su ventana de contexto de 32K tokens, su soporte para ocho idiomas (ingles, aleman, espanol, portugues, italiano, frances, chino y japones) y su licencia MIT, que permite uso comercial sin restricciones adicionales. Es una pieza clave para desarrolladores que necesitan procesar documentos multipagina, hilos de correo extensos o especificaciones tecnicas complejas localmente, en portatiles o estaciones de trabajo con GPU de Apple.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base `aion_instruct`; port MLX adaptado de `qwen3.py` de mlx-lm) |
| Parametros totales | 2.288.831.488 (2,3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (32K) |
| Tipos de cuantizacion | MLX affine 4-bit (group size 64), 6-bit (group size 64) y 8-bit (group size 64); normas en bf16 |
| Idiomas soportados | en, de, es, pt, it, fr, zh, ja |
| Licencia | MIT (texto de Microsoft, "Copyright (c) Microsoft Corporation") |
| Formato de pesos | safetensors (MLX), repo de 1,7 GB; `model.safetensors` de 1,64 GB |
| Biblioteca | mlx-lm (requiere `--trust-remote-code`) |
| Tamano en disco | 1,64 GB (pesos cuantizados) |
| Modelo base | microsoft/Aion-1.0-Instruct-2.3B |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de 2,3B parametros. El port MLX incluido en este repositorio se adapto a partir de `qwen3.py` de `mlx-lm`, lo que sugiere una topologia de atencion y MLP compatible con la familia Qwen3 (proyecciones q, k, v, o y MLP gate/up/down), aunque la model card no detalla la configuracion exacta de capas, cabezas de atencion ni dimension oculta. La cuantizacion aplicada por Xylolabs es mixta por tipo de tensor: atencion q, k, o y MLP gate/down a 4 bits; MLP up a 6 bits; atencion v y el embedding de tokens (compartido con la cabeza LM, "tied") a 8 bits; y las normas en bf16. Esta asignacion busca preservar la calidad en las proyecciones mas sensibles (value, embeddings) mientras reduce el coste en las mas tolerantes.

Microsoft no publica en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO. La model card original indica que el modelo se entreno para escenarios de proposito general: comprension de documentos, analisis de contenido, respuesta a preguntas y comprension del lenguaje natural, con un enfoque explicito en casos de uso de texto y sistema operativo. La publicacion inicial es la version sin cuantizar, seguida de versiones cuantizadas; este repositorio es una de esas versiones, realizada por un tercero (Xylolabs) y no por Microsoft.

## Capacidades

- Generacion de texto y conversacion multi-turno en ocho idiomas (en, de, es, pt, it, fr, zh, ja).
- Comprension de documentos largos: ventana de 32K tokens para procesar documentos multipagina, hilos de correo y especificaciones tecnicas.
- Resumen y reescritura de texto (etiquetas declaradas por Microsoft: summarization, rewriting, chat).
- Respuesta a preguntas y comprension del lenguaje natural de proposito general.
- Analisis de contenido y extraccion de informacion de textos extensos.
- Inferencia local en dispositivo, sin necesidad de conectividad con la nube.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de vision, audio o modo "thinking": no disponibles en la informacion proporcionada.

## Casos de uso

- Procesamiento local de documentos multipagina: el modelo puede resumir contratos, informes o manuales tecnicos de hasta 32K tokens sin enviar datos a la nube, lo que resulta adecuado para entornos con requisitos de privacidad (legal, sanitario, administracion publica).
- Asistente de correo electronico: gestion de hilos de correo extensos, resumen de conversaciones y redaccion de respuestas, aprovechando la ventana de contexto y el soporte multilingue para equipos internacionales.
- Atencion al cliente en el borde: despliegue en portatiles o estaciones de trabajo para clasificar, resumir y responder consultas de soporte tecnico sin latencia de red, con la ventaja de que los datos del cliente no salen del dispositivo.
- Analisis de contenido y moderacion previa: dado que Microsoft integrara este modelo con su moderador de contenido en Windows, puede emplearse como primera capa de clasificacion y filtrado de texto en aplicaciones de gestion de comunidades o plataformas editoriales.
- Generacion de documentacion tecnica: redaccion y reescritura de especificaciones, guias de usuario y notas de version en varios idiomas, con la posibilidad de ejecutarse en un MacBook o Mac Studio mediante MLX.
- Prototipado rapido en Apple Silicon: investigadores y desarrolladores pueden experimentar con un SLM de 2,3B cuantizado a 4 bits (1,64 GB) en un portatil Apple sin GPU dedicada, usando `mlx_lm.generate` o `mlx_lm.chat`.
- Aplicaciones de escritorio con IA integrada: integracion en herramientas nativas de macOS mediante `mlx-lm` para funciones de autocompletado, resumen y reescritura dentro de editores de texto o suites ofimaticas.

## Benchmarks y rendimiento

La model card de Xylolabs publica metricas de fidelidad de la cuantizacion respecto a la referencia en f32, no benchmarks de tareas estandar (MMLU, HumanEval, GSM8K, etc.). Los datos disponibles son:

| Formato | Tamano | PPL | KL medio vs referencia f32 | Top-1 identico vs f32 |
|---|---|---|---|---|
| MLX 4-bit (este repositorio) | 1,64 GB | 6,3596 | 0,01738 | 94,17 % |
| MLX 8-bit (Xylolabs/Aion-1.0-Instruct-2.3B-MLX-8bit) | 2,43 GB | 6,3001 | 0,00047 | 98,96 % |
| Referencia f32 (transformers sobre pesos BF16) | no disponible | 6,2945 | 0,0 | 100 % |

Metodologia declarada: 16 fragmentos de 4.096 tokens, puntuando los ultimos 2.047 tokens de cada uno (32.752 tokens en total); 12 fragmentos retenidos con formato de chat (ingles, coreano, codigo y matematicas) y 4 de wikitext-2. Todas las filas se midieron con la misma referencia, texto y fichero de modelo.

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM/ memoria unificada estimada: 1,64 GB de pesos en 4 bits; con overhead de ejecucion y cache KV para 32K tokens, se recomienda al menos 4-6 GB de memoria disponible.
- Plataforma objetivo: Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) mediante MLX; no esta pensado para GPUs NVIDIA en este formato.
- Cabe en GPU de consumo: si, en cualquier Mac con memoria unificada de 8 GB o superior; en GPUs NVIDIA consumer requeriria conversion a otro formato (GGUF, transformers), no incluida en este repositorio.
- Opciones de despliegue: `mlx-lm` 0.32.2 o superior (`mlx_lm.generate`, `mlx_lm.chat`), con `--trust-remote-code` obligatorio para cargar `aion_instruct.py`. No se proporcionan pesos GGUF ni formato transformers en este repositorio; para vLLM, llama.cpp, Ollama o TGI habria que usar el modelo base de Microsoft o generar una conversion propia.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| Aion 1.0 Instruct 2.3B MLX 4-bit (este repo) | 2,3B | 32K | 8 | MIT | MLX safetensors, 1,64 GB |
| microsoft/Aion-1.0-Instruct-2.3B (base) | 2,3B | 32K | 8 | MIT | PyTorch, ONNX, GGUF |
| Xylolabs/Aion-1.0-Instruct-2.3B-MLX-8bit | 2,3B | 32K | 8 | MIT | MLX safetensors, 2,43 GB |
| Qwen3 (familia, referencia arquitectonica del port) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de tareas que permitan comparar el rendimiento cualitativo de este modelo con alternativas de la misma categoria (por ejemplo, Phi-3-mini, Gemma 2B o Qwen2.5-1.5B); la comparativa se limita a parametros, contexto, licencia y formato.

## Limitaciones y advertencias

- Modelo de 2,3B parametros: capacidad de razonamiento y conocimiento factual limitada en comparacion con modelos de 7B o superiores; no debe usarse como fuente de verdad sin verificacion.
- Riesgo de alucinacion inherente a los SLM; Microsoft no publica tasas de alucinacion ni evaluaciones de factualidad en la informacion disponible.
- Sesgos: no se documentan evaluaciones de sesgo, toxicidad o equidad en la model card; se desconoce la composicion del dataset de entrenamiento.
- Limitaciones de idioma: aunque se declaran ocho idiomas, no se especifica el nivel de competencia por idioma ni si el entrenamiento fue equilibrado entre ellos; el espanol podria tener un rendimiento inferior al ingles.
- La cuantizacion 4-bit introduce una degradacion medible: KL medio de 0,01738 y top-1 del 94,17 % respecto a f32; para tareas sensibles a la precision puede ser preferible la version 8-bit (KL 0,00047, top-1 98,96 %).
- Requiere `--trust-remote-code` en `mlx-lm`, lo que implica ejecutar codigo de modelado incluido en el repositorio; conviene auditar `aion_instruct.py` antes de desplegarlo en produccion.
- Licencia MIT permite uso comercial, pero el aviso de copyright pertenece a Microsoft Corporation; Xylolabs no esta afiliado ni respaldado por Microsoft.
- El modelo esta optimizado para casos de uso de texto y sistema operativo en Windows; su comportamiento en otros dominios (codigo, matematicas avanzadas, agentes) no esta evaluado en la informacion disponible.
- Microsoft advierte que el modelo no esta disenado ni evaluado para todos los propositos downstream posibles.
- No se proporcionan pesos en formato GGUF, ONNX ni transformers en este repositorio; la portabilidad a otras plataformas requiere conversion manual.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/Aion-1.0-Instruct-2.3B-MLX-4bit
- Modelo base: https://huggingface.co/microsoft/Aion-1.0-Instruct-2.3B
- Version MLX 8-bit: https://huggingface.co/Xylolabs/Aion-1.0-Instruct-2.3B-MLX-8bit
- Repositorio de codigo de Xylolabs (referenciado en la model card): https://github.com/XylolabsInc/tensix-bfp-gptq
- Repositorio de ejemplo de Microsoft: https://github.com/microsoft/Aion-Instruct-Preview-Sample/
- Libreria MLX: https://github.com/ml-explore/mlx
- Libreria mlx-lm: https://github.com/ml-explore/mlx-lm
- Licencia MIT del repositorio: https://huggingface.co/Xylolabs/Aion-1.0-Instruct-2.3B-MLX-4bit/blob/main/LICENSE
