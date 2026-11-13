# TokenAI-zer/Qwensploit-V2-27B-CyberSecurity-Qwen3.8-oQ8-mtp

## Resumen

Qwensploit-V2-27B-CyberSecurity-Qwen3.8-oQ8-mtp es una cuantización uniforme de 8 bits en formato MLX del modelo Qwensploit V2 27B, un ajuste fino QLoRA orientado a ciberseguridad desarrollado por xtools-at. Esta variante la publica TokenAI-zer para Apple Silicon y conserva la cabeza MTP (multi-token prediction) del modelo original, lo que permite decodificación especulativa en tiempo de inferencia. El modelo base deriva de Qwen3.8-27B y ha pasado por una cadena de merges y ajustes orientados a código y a eliminar restricciones de rechazo antes de especializarse en tareas de seguridad.

El modelo resuelve tareas de pentesting autorizado, red team, investigación de vulnerabilidades, codificación segura, CTF y seguridad defensiva, con capacidad multimodal (image-text-to-text) gracias a su torre de visión. La arquitectura es Qwen3_5ForConditionalGeneration con 64 capas de texto, tamaño oculto de 5120 y 27.781.427.952 parámetros totales, empaquetados en 30 GB de safetensors distribuidos en 6 shards.

Su relevancia actual radica en que ofrece un modelo especializado en seguridad con contexto declarado de 262.144 tokens ejecutable en hardware Apple Silicon mediante MLX, algo poco habitual en este nicho. No obstante, es una cuantización con pérdida, sin benchmarks publicados posteriores a la cuantización, con licencia personalizada y con un uso previsto estrictamente restringido a investigación y pruebas autorizadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer multimodal con torre de visión), 64 capas de texto, hidden size 5120 |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens en config (límite arquitectónico, no garantía de memoria) |
| Tipos de cuantizacion | 8 bits uniforme, affine, group size 64 (oMLX oQ8) |
| Idiomas soportados | en |
| Licencia | qwensploit-upstream-terms (other; ver LICENSE-NOTICE.md) |
| Formato de pesos | safetensors MLX (6 shards, 27,94 GiB); no es GGUF ni PyTorch |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal de la familia Qwen3.5 con 64 capas de texto, hidden size de 5120 y una torre de visión de 333 tensores en BF16. Incluye además una cabeza MTP de 1 capa oculta y 29 tensores en el índice de pesos, que habilita decodificación especulativa cuando el runtime la activa. La variante aquí descrita aplica una cuantización uniforme de 8 bits con group size 64 sobre todos los módulos, sin overrides por capa, según el `quantization_config` del `config.json`; la cuantización es con pérdida.

El entrenamiento original corresponde al autor upstream xtools-at y no está documentado en esta información más allá de que se trata de un ajuste fino QLoRA sobre una cadena de modelos: Qwen3.8-27B, seguido de CodeForge-3xMerge, después una variante UNCENSORED-heretic y finalmente Qwensploit V2 27B. No se dispone de datos sobre número de tokens de entrenamiento, composición del dataset ni uso de RLHF o DPO. La innovación técnica destacable de esta variante es la conservación de la cabeza MTP para decodificación especulativa en MLX, con una velocidad de decodificación medida de 42,7 tok/s en una prueba corta sobre Apple M5 Max de 128 GB.

## Capacidades

- Generación de texto y razonamiento especializado en ciberseguridad: pentesting, red team, investigación de vulnerabilidades y seguridad defensiva.
- Generación y análisis de código, con orientación a codificación segura y revisión de configuraciones.
- Capacidades multimodales de image-text-to-text gracias a la torre de visión incluida.
- Modo de razonamiento configurable mediante `reasoning_effort` con valores `xhigh` (por defecto), `medium` y `low`, y opción `enable_thinking: false`.
- Decodificación especulativa mediante cabeza MTP cuando el runtime la habilita.
- Soporte de contexto largo declarado de hasta 262.144 tokens, sujeto a memoria disponible.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente autónomo multi-paso: no disponible; el autor indica explícitamente que es un asistente de investigación y análisis, no un agente autónomo.
- Capacidades multilingües: limitadas al inglés según la model card.

## Casos de uso

- Investigación de vulnerabilidades: el modelo puede analizar fragmentos de código y descripciones de fallos para ayudar a identificar patrones de explotación conocidos, apoyándose en su especialización en seguridad y en su ventana de contexto amplia para revisar ficheros completos.
- Ejercicios de red team autorizados: sirve para generar hipótesis de ataque, planes de prueba y comandos de reconocimiento que el operador revisa y ejecuta únicamente en entornos controlados.
- Retos CTF: adecuado para razonar sobre binarios, scripts y pistas multimodales (capturas, diagramas) gracias a la torre de visión y al modo de razonamiento configurable.
- Revisión de código seguro en pipelines de desarrollo: puede integrarse como paso de análisis para señalar malas prácticas de seguridad en pull requests, con revisión humana obligatoria de las sugerencias.
- Formación y concienciación: útil para generar escenarios de phishing simulado, explicaciones de técnicas de ataque y material didáctico de seguridad defensiva en inglés.
- Análisis de configuraciones e infraestructura: permite revisar ficheros de configuración de servidores, políticas y despliegues para detectar exposiciones y desviaciones respecto a buenas prácticas.
- Asistencia en respuesta a incidentes: con contexto largo puede procesar logs y trazas extensas para resumir indicios y proponer hipótesis de compromiso, siempre con validación del analista.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica de rendimiento proporcionada es una prueba corta de decodificación: 42,7 tok/s en Apple M5 Max (128 GB) con oMLX, MTP activado, prompt de 63 tokens y unos 600 tokens generados con `reasoning_effort: low`. El autor advierte que es una única ejecución y no un benchmark, y que la velocidad varía con la longitud de contexto, el prompt y la tasa de aceptación del MTP.

## Requisitos de hardware

- VRAM o memoria unificada estimada: el directorio del modelo ocupa 27,96 GiB (30,02 GB); se necesita memoria suficiente para pesos más caché KV, que crece con el contexto.
- Hardware objetivo: Apple Silicon con MLX; la prueba de velocidad se realizó en un Apple M5 Max con 128 GB de memoria unificada.
- GPU NVIDIA: no disponible; esta variante está empaquetada para MLX y no para CUDA.
- Compatibilidad con GPU de consumo: no disponible para esta variante; para hardware no Apple existen los GGUF del autor y de mradermacher.
- Despliegue: oMLX (`omlx serve --model-dir ... --port 8000`), con el parser de razonamiento `qwen_3_5` y la cabeza MTP habilitada para aprovechar la decodificación especulativa. vLLM, llama.cpp, Ollama y TGI no aplican a este formato MLX.
- Latencia y throughput: 42,7 tok/s en la prueba corta citada; sin datos adicionales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwensploit-V2-27B-CyberSecurity-Qwen3.8-oQ8-mtp (esta variante) | 27,78 B | 262.144 | safetensors MLX 8-bit | qwensploit-upstream-terms | 42,7 tok/s en M5 Max; MTP incluido |
| Qwensploit-V2-27B-CyberSecurity-Qwen3.8-oQ4-mtp | no disponible | 262.144 (según base) | safetensors MLX mixto 4/5/6/8-bit | qwensploit-upstream-terms | 16,31 GiB; 56,2 tok/s en la misma prueba |
| Qwensploit-V2-27B-CyberSecurity-Qwen3.8 (BF16) | no disponible | 262.144 (según base) | safetensors transformers | qwensploit-upstream-terms | Fuente sin cuantizar |
| Qwensploit-V2-27B-CyberSecurity-Qwen3.8-GGUF | no disponible | 262.144 (según base) | GGUF | qwensploit-upstream-terms | Para llama.cpp y runtimes GGUF |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas variantes ni con modelos de otras familias.

## Limitaciones y advertencias

- La cuantización de 8 bits es con pérdida y no hay benchmarks publicados posteriores a la cuantización que midan la degradación.
- El modelo está especializado en seguridad ofensiva y deriva de una variante "UNCENSORED": puede generar contenido sensible; el uso previsto se limita a investigación, educación, seguridad defensiva y pruebas autorizadas.
- Riesgo de alucinación en comandos, rutas, CVEs y referencias técnicas; el autor recomienda revisar y probar toda salida en entornos controlados.
- Idiomas: solo inglés según la model card; no se garantiza calidad en castellano.
- El contexto de 262.144 tokens es un límite arquitectónico; el contexto usable depende de la memoria disponible y decae el rendimiento con contextos muy largos.
- Licencia personalizada `qwensploit-upstream-terms`: es necesario revisar LICENSE-NOTICE.md antes de usar o redistribuir los pesos, especialmente para uso comercial.
- Esta variante no está afiliada a xtools-at; los términos y la atribución del modelo fuente corresponden al autor upstream.
- No es un agente autónomo: no debe desplegarse para ejecutar acciones sin supervisión humana.
- Formato MLX exclusivamente: no es utilizable directamente en ecosistemas CUDA sin recurrir a los GGUF o al BF16.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TokenAI-zer/Qwensploit-V2-27B-CyberSecurity-Qwen3.8-oQ8-mtp
- Aviso de licencia: https://huggingface.co/TokenAI-zer/Qwensploit-V2-27B-CyberSecurity-Qwen3.8-oQ8-mtp/blob/main/LICENSE-NOTICE.md
- Variante oQ4-mtp: https://huggingface.co/TokenAI-zer/Qwensploit-V2-27B-CyberSecurity-Qwen3.8-oQ4-mtp
- Modelo fuente BF16: https://huggingface.co/xtools-at/Qwensploit-V2-27B-CyberSecurity-Qwen3.8
- GGUF del autor: https://huggingface.co/xtools-at/Qwensploit-V2-27B-CyberSecurity-Qwen3.8-GGUF
- GGUF de mradermacher: https://huggingface.co/mradermacher/Qwensploit-V2-27B-CyberSecurity-Qwen3.8-GGUF
- GGUF imatrix de mradermacher: https://huggingface.co/mradermacher/Qwensploit-V2-27B-CyberSecurity-Qwen3.8-i1-GGUF
- Colección Qwensploit: https://huggingface.co/collections/xtools-at/qwensploit-cybersec-6ad62fa5c989cb6b06b36423
- Modelo base de la familia: https://huggingface.co/Qwen/Qwen3.8-27B
- Merge intermedio CodeForge: https://huggingface.co/xtools-at/Qwen3.8-27B-CodeForge-3xMerge
- Variante heretic: https://huggingface.co/xtools-at/Qwen3.8-27B-CodeForge-3xMerge-UNCENSORED-heretic
