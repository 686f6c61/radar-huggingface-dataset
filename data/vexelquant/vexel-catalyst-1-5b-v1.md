# VexelQuant/Vexel-Catalyst-1.5B-v1

## Resumen

Vexel-Catalyst-1.5B-v1 es un modelo de lenguaje especializado de 1.543.714.304 parámetros (aproximadamente 1,5 mil millones) desarrollado por VexelQuant Research. Está construido sobre la arquitectura Qwen2 y afinado mediante SFT y GRPO (Group Relative Policy Optimization) con la librería Unsloth, con el objetivo declarado de actuar como un parser determinista de eventos de mercado en el ámbito de criptomonedas y DeFi. El modelo se presenta como "zero-markdown", es decir, entrenado para emitir JSON estricto sin formato conversacional añadido.

El problema que aborda es la extracción estructurada de información a partir de titulares de noticias cripto, filings regulatorios, alertas de listado o mensajes de canales de alpha, transformándolos en JSON válido que pueda consumirse en pipelines de ejecución automatizada. La model card promete un 100 % de cumplimiento de JSON estricto y un 0 % de alucinaciones de Markdown, según sus propias métricas operativas.

Es relevante ahora por su enfoque en latencia baja y salida determinista, orientado a sistemas de trading de alta frecuencia. Sin embargo, conviene señalar que los datos de rendimiento publicados en la model card muestran una latencia p50 de 2715,5 ms, muy superior a la del modelo base genérico (115 ms) y a la de una API cloud (920 ms), lo que contradice la afirmación de "sub-20ms" del texto introductorio. Esta discrepancia debe tenerse en cuenta al evaluar el modelo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basada en Qwen2 |
| Parámetros totales | 1.543.714.304 (aprox. 1,5 B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF (se menciona Q4_K_M en la model card); safetensors en precisión completa |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2, un transformer decoder-only con atención causal estándar. No se dispone de información detallada sobre el número de capas, dimensiones ocultas, número de cabezas de atención ni sobre la longitud de contexto nativa, más allá de lo que implica la familia Qwen2. El tamaño del repositorio (4,2 GB) es coherente con un modelo de 1,5 B parámetros en safetensors en precisión de 16 bits.

El entrenamiento se realizó en dos fases: un ajuste supervisado (SFT) seguido de GRPO, una variante de optimización por política relativa a grupos que se ha popularizado para el entrenamiento de modelos de razonamiento. La librería empleada fue Unsloth, orientada a fine-tuning eficiente en memoria. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases adicionales de DPO o RLHF. La innovación técnica declarada es el alineamiento para producir JSON estricto sin Markdown ni texto conversacional, con temperatura de muestreo recomendada de 0,1 y un máximo de 128 tokens nuevos.

## Capacidades

- Generación de texto estructurado en formato JSON estricto, sin Markdown, sin backticks y sin relleno conversacional.
- Parsing de eventos de mercado: titulares de noticias cripto, filings regulatorios, alertas de listado y mensajes de canales de alpha.
- Clasificación y extracción de entidades en el dominio financiero-cripto (tokens, exchanges, eventos).
- Salida determinista con baja temperatura (0,1) orientada a pipelines automatizados.
- Soporte de plantilla de chat estilo ChatML (`<|im_start|>` / `<|im_end|>`), compatible con el formato de Qwen2.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito.
- Capacidades multilingües no documentadas; la model card está íntegramente en inglés y no se declaran idiomas soportados.

## Casos de uso

- Parsing de titulares cripto en tiempo real: el modelo recibe un titular de noticias y devuelve un JSON con el activo, el tipo de evento y la dirección esperada del mercado, integrándose en un pipeline de ejecución automatizada.
- Procesamiento de filings regulatorios: extracción estructurada de metadatos (entidad, tipo de filing, fechas, importes) para alimentar sistemas de cumplimiento o de señalización.
- Alertas de listado en exchanges: conversión de anuncios de listado en JSON con el par, el exchange y la hora, para disparar órdenes o notificaciones.
- Monitorización de canales de alpha en Telegram: normalización de mensajes no estructurados a un esquema JSON fijo antes de su consumo por un motor de trading.
- Enriquecimiento de datasets financieros: generación de etiquetas estructuradas a partir de texto no estructurado para entrenar o evaluar otros modelos del dominio.
- Despliegue en edge o entornos con recursos limitados: al ser un modelo de 1,5 B, puede ejecutarse en GPU de consumo mediante GGUF Q4_K_M con llama.cpp u Ollama, lo que facilita su integración en infraestructuras ligeras.

## Benchmarks y rendimiento

La model card incluye una tabla de benchmarks operativos propia, no estándar (latencia y cumplimiento de formato), que se reproduce a continuación. No se han publicado resultados en benchmarks académicos como MMLU, HumanEval o GSM8K.

| Métrica | VexelQuant Aligned | Modelo base genérico | API LLM cloud |
|---|---|---|---|
| Latencia p50 | 2715,5 ms | 115,0 ms | 920,0 ms |
| Latencia p95 | 2894,9 ms | 185,0 ms | 1450,0 ms |
| Cumplimiento JSON estricto | 100,0 % | 74,2 % | 91,5 % |
| Alucinaciones de Markdown | 0,0 % | 22,8 % | 8,5 % |

Nota: la latencia p50 de 2715,5 ms contrasta con la afirmación de "sub-20ms" del texto de la model card. Los datos deben interpretarse con cautela, ya que no se especifica el hardware, el lote ni las condiciones de medición.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 3,1 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, unos 4-5 GB.
- VRAM estimada en cuantización Q4_K_M (GGUF): aproximadamente 1,0-1,2 GB para pesos, más overhead; cabe holgadamente en GPUs de consumo.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 para mayor throughput; A100 o H100 para despliegues por lotes a gran escala.
- Cabe en GPU de consumo: sí, en cualquier GPU con 6 GB o más de VRAM en cuantización Q4, y en 8 GB en FP16 con margen ajustado.
- Opciones de despliegue: vLLM (documentado en la model card), llama.cpp (documentado con GGUF Q4_K_M), Ollama (por compatibilidad GGUF), TGI (por compatibilidad con safetensors y arquitectura Qwen2).
- Latencia y throughput: la model card reporta p50 de 2715,5 ms y p95 de 2894,9 ms, sin especificar hardware ni condiciones; el throughput no se documenta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Vexel-Catalyst-1.5B-v1 | 1,5 B | No disponible | Apache 2.0 | JSON estricto para cripto/DeFi | Hugging Face |
| Qwen2-1.5B-Instruct | 1,5 B | 32 768 tokens (según familia Qwen2) | Apache 2.0 | Propósito general, instrucciones | Hugging Face |
| Qwen2.5-1.5B-Instruct | 1,5 B | 32 768 tokens (según familia Qwen2.5) | Apache 2.0 | Propósito general, instrucciones | Hugging Face |
| SmolLM2-1.7B-Instruct | 1,7 B | 8192 tokens | Apache 2.0 | Propósito general, instrucciones | Hugging Face |

La comparativa se basa en el tamaño y la licencia; no se dispone de datos de benchmarks académicos del modelo Vexel-Catalyst que permitan una comparación de rendimiento rigurosa frente a estas alternativas.

## Limitaciones y advertencias

- La model card afirma "sub-20ms" pero sus propias métricas reportan p50 de 2715,5 ms; existe una contradicción interna que debe verificarse en el hardware objetivo antes de producción.
- El modelo está altamente especializado en el dominio cripto/DeFi; su rendimiento fuera de ese dominio no está documentado y probablemente sea limitado.
- No se documentan idiomas soportados; la model card está solo en inglés y no hay evidencia de capacidades multilingües.
- No se especifica la longitud de contexto, lo que impide planificar casos de uso con documentos largos.
- No se documentan sesgos conocidos, pero al ser un modelo entrenado sobre datos financieros-cripto, puede heredar sesgos de las fuentes utilizadas.
- Riesgo de alucinación: aunque la model card declara 0 % de alucinaciones de Markdown, no se aportan métricas de fidelidad factual; un parser JSON puede producir campos válidos con valores incorrectos.
- La licencia Apache 2.0 permite uso comercial, pero la model card ofrece licencias "custom foundry" y pesos a medida, lo que sugiere que el autor puede ofrecer términos adicionales; conviene revisar los términos exactos del repositorio.
- El modelo tiene 0 descargas y 1 like en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- No se documenta soporte de tool calling ni de agentes, por lo que no debe asumirse su disponibilidad en pipelines que lo requieran.

## Enlaces

- Hugging Face: https://huggingface.co/VexelQuant/Vexel-Catalyst-1.5B-v1
- Sitio web del autor: https://vexelquant.me
- GitHub del autor: https://github.com/VexelQuant
- Contacto comercial: founder@vexelquant.me
