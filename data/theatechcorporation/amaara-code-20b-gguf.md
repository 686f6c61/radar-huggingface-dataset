# theatechcorporation/amaara-code-20b-GGUF

## Resumen

Amaara Code 20B es un ajuste fino por SFT con LoRA del modelo `openai/gpt-oss-20b` de OpenAI, una arquitectura de mezcla de expertos (MoE) con 20.914.757.184 parámetros totales y aproximadamente 3.600 millones activos por token. El autor, theatechcorporation, lo orienta a codificación agéntica: el corpus de entrenamiento son 98.391 trazas de agente armonizadas, con 176.689 mensajes y 96.204 llamadas a herramientas extraídas de 2.083 ejecuciones reales de agente, complementadas con datos de instrucción y razonamiento. El 82% de las llamadas del corpus son a la herramienta `bash`, lo que refleja el entorno del que provienen las trazas.

Este repositorio contiene únicamente una exportación GGUF de la ronda 1 del adaptador, publicada para inspección y ejecución. El propio autor advierte de que el modelo no ha sido evaluado en capacidades agénticas ni de código, y que no debe atribuírsele ningún resultado de benchmark. La única medición disponible es la pérdida final de entrenamiento (4,626), que es un objetivo de optimización y no una medida de capacidad.

Su relevancia actual es doble: por un lado, demuestra un flujo de trabajo reproducible de ajuste LoRA sobre un MoE de OpenAI con pesos nativos MXFP4 y su conversión a GGUF; por otro, documenta con detalle las peculiaridades de cuantizar gpt-oss con `llama-quantize`, donde 289 de 459 tensores quedan en F32 y el tamaño resultante supera al que sugiere el nombre de la cuantización.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), derivada de `openai/gpt-oss-20b`; pesos nativos MXFP4 |
| Parámetros totales | 20.914.757.184 (21B) |
| Parámetros activos | 3,6B (aproximado, según model card) |
| Longitud de contexto | 32.768 tokens en el ejemplo de despliegue con `llama-server -c 32768`; la longitud nativa del modelo base no se detalla en la información disponible |
| Tipos de cuantización | Q4_K_M (composición mixta: 121×Q5_0 + 25×Q8_0 + 24×Q4_K + 289×F32) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (compatible con llama.cpp); el adaptador LoRA original ocupa 740.115.376 bytes en 3.264 tensores |

## Arquitectura y entrenamiento

El modelo parte de `openai/gpt-oss-20b`, un transformer MoE con 21B parámetros totales y unos 3,6B activos, cuyos pesos nativos están en MXFP4. Sobre él se aplicó un SFT con LoRA de rango 16 y alpha 16 sobre 402 módulos objetivo, durante 1.200 pasos con longitud de secuencia 8.192 y tasa de aprendizaje 2e-4 con decaimiento coseno. El entrenamiento completo tardó 2 horas y 42 minutos en una RTX 4090, y la pérdida de entrenamiento evolucionó de 6,80 a 4,46, con un valor final de 4,626. El autor aclara explícitamente que una pérdida absoluta de ~4,6 es esperable para este tokenizador y no indica un defecto frente a modelos que reportan ~0,9.

El corpus son 98.391 trazas de agente armonizadas (176.689 mensajes, 96.204 llamadas a herramientas) procedentes de 2.083 ejecuciones reales, más datos de instrucción y razonamiento. Antes del entrenamiento, las trazas se generalizaron: se sustituyeron 6 marcas de cliente, 5 personas, 12 slugs de proyecto y rutas locales, y se verificó la ausencia de 25 patrones prohibidos. No se menciona RLHF ni DPO en la información disponible; el proceso descrito es exclusivamente SFT. La innovación técnica destacable no está en la arquitectura sino en el pipeline de conversión y cuantización: `convert_hf_to_gguf.py` no puede emitir MXFP4 (sus salidas son f32/f16/bf16/q8_0/tq1_0/tq2_0/auto), por lo que una build MXFP4 nativa (~11,2 GB) requiere cuantizar un GGUF F16 y queda planificada para la ronda 2.

## Capacidades

- Generación de texto conversacional en inglés, con canales diferenciados del formato harmony (`analysis`, `commentary`, `final`).
- Emisión de llamadas a herramientas armonizadas en el canal `commentary`, con la sintaxis `<|start|>assistant to=functions.NAME<|channel|>commentary json<|message|>{args}<|call|>`.
- Codificación agéntica orientada a terminal: el 82% del corpus de entrenamiento son llamadas a `bash`.
- Razonamiento e instrucción: el corpus incluye datos de instrucción y razonamiento además de las trazas.
- Restricción relevante: la plantilla permite una sola llamada a herramienta por mensaje.
- Capacidades multilingües: limitadas al inglés según la model card; no se declaran otros idiomas.
- No se declaran capacidades de visión, audio ni modo de pensamiento explícito más allá de los canales del formato harmony.

## Casos de uso

- Automatización de tareas de shell en pipelines internos: el modelo puede emitir llamadas a `bash` en formato harmony para ejecutar comandos de inspección, listado o transformación de ficheros, aprovechando que el 82% de su corpus son precisamente llamadas a esa herramienta. Requiere un orquestador que parsee los marcadores de canal y valide los comandos antes de ejecutarlos.
- Prototipado de agentes de codificación sobre llama.cpp: sirve como banco de pruebas para integrar el formato harmony y el parseo de llamadas a herramientas en un servidor `llama-server`, dado que el repositorio documenta la sintaxis exacta y el flag `--jinja` necesario.
- Evaluación de pipelines de cuantización de MoE: útil para equipos que necesiten reproducir el comportamiento de `llama-quantize` sobre gpt-oss y entender por qué 289 tensores permanecen en F32 y por qué Q6_K iguala en tamaño a Q8_0.
- Asistencia en tareas de edición de ficheros con verificación posterior: el modelo puede proponer ediciones y comandos de comprobación, aunque solo el 3,4% del corpus demuestra verificación tras una edición, por lo que conviene envolverlo en un harness que fuerce el paso de validación.
- Despliegue en hardware de gama alta de consumo con offload parcial: con 14,7 GB de pesos, cabe parcialmente en una GPU de 16 GB dejando ~1,6 GB de margen, lo que permite ejecuciones locales de contexto reducido para pruebas de integración.
- Servicio en CPU para entornos sin GPU: es viable pero lento, con 3,2 tok/s medidos en 48 hilos, adecuado solo para validación funcional por lotes pequeños.
- Generación de trazas sintéticas de agente para aumentar datasets: al estar entrenado sobre trazas armonizadas, puede producir secuencias con estructura de llamada a herramienta que sirvan como material de arranque, siempre con revisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que el modelo no ha sido evaluado en capacidad agéntica ni de código y que no debe describirse como si tuviera tales métricas. La única medición publicada es la pérdida final de entrenamiento de 4,626, que no constituye una medida de capacidad. Como dato de rendimiento de inferencia, la model card reporta 3,2 tok/s en CPU con 48 hilos.

## Requisitos de hardware

- VRAM estimada para inferencia: ~14,7 GB de pesos en Q4_K_M, con ~1,6 GB de margen en una tarjeta de 16 GB; se recomienda offload parcial o contexto reducido en ese caso.
- GPU recomendadas: el adaptador se entrenó en una RTX 4090; para inferencia cabe en GPUs de 16 GB o más (RTX 4090, RTX 4080, A100, H100) con offload parcial en las de menor VRAM.
- Cabe en GPU de consumo: sí, en modelos de 16 GB o superiores, con las salvedades de margen y contexto indicadas; se espera una build MXFP4 de ~11,2 GB en la ronda 2 que reduciría los requisitos.
- Opciones de despliegue: llama.cpp mediante `llama-server` con `-ngl 99 -c 32768 --jinja --host 0.0.0.0 -ub 512 -b 1024`; el repositorio está etiquetado como compatible con endpoints. No se mencionan vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: 3,2 tok/s en CPU con 48 hilos; no se publican cifras de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato | Estado de evaluación |
|---|---|---|---|---|---|---|
| Amaara Code 20B r1 (este) | 20,9B | ~3,6B | 32.768 en ejemplo de despliegue | Apache 2.0 | GGUF Q4_K_M | Sin evaluar; pérdida final 4,626 |
| openai/gpt-oss-20b (base) | 20,9B | ~3,6B | No disponible en la información proporcionada | Apache 2.0 | Safetensors MXFP4 nativo | No disponible en la información proporcionada |
| Alternativas de codificación agéntica de tamaño similar | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación con otras alternativas de la misma categoría no está disponible en la información proporcionada; únicamente puede contrastarse con su modelo base, del que se diferencia por el ajuste LoRA sobre trazas de agente y por la exportación a GGUF.

## Limitaciones y advertencias

- Modelo no evaluado: el autor declara que no existe ninguna medición de capacidad agéntica o de código, y que toda afirmación al respecto debe considerarse no verificada.
- Desajuste de herramientas observado en prueba de humo: ante una petición de listar un directorio, el modelo recurre a una herramienta `list_dir`, mientras que el harness de evaluación solo expone `bash`. La ronda 2 aborda este problema.
- Verificación insuficiente: solo el 3,4% del corpus demuestra verificación después de editar un fichero, lo que aumenta el riesgo de que el modelo dé por buena una modificación sin comprobarla.
- Una sola llamada a herramienta por mensaje: la plantilla harmony no permite múltiples llamadas en el mismo turno, lo que limita la eficiencia en tareas que requieren varias operaciones.
- Parseo delicado de la salida: decodificar con `skip_special_tokens=True` produce texto corrupto como `finalREADY`; es obligatorio parsear los marcadores de canal (`analysis`, `commentary`, `final`).
- Cobertura lingüística restringida al inglés; no se declaran capacidades en castellano ni en otros idiomas.
- Tamaño de fichero engañoso: 289 de 459 tensores quedan en F32, por lo que Q4_K_M ocupa 14,7 GB y Q6_K iguala en tamaño a Q8_0; conviene verificar el espacio en disco antes de descargar.
- Riesgo de alucinación: no se documentan evaluaciones de fidelidad; al ser un modelo de 21B con pérdida de entrenamiento alta, es esperable un riesgo considerable en producción, aunque no se cuantifica en la información disponible.
- Sesgos: no se documentan análisis de sesgo en la model card.
- Licencia Apache 2.0, que permite uso comercial, pero el autor publica el artefacto para inspección y recomienda tratar cualquier afirmación de capacidad como no verificada hasta que la tarjeta reporte mediciones.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/theatechcorporation/amaara-code-20b-GGUF
- Modelo base: https://huggingface.co/openai/gpt-oss-20b
- No se han encontrado en la información proporcionada otros enlaces a papers, blogs, repositorios o demos.
