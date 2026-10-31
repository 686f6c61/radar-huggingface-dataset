# Vortecks/LFM3-1.7B-Heretic-Abliterated-i1-GGUF

## Resumen

LFM3-1.7B-Heretic-Abliterated-i1-GGUF es una cuantización GGUF, producida por el usuario Vortecks con soporte de matriz de importancia (imatrix), del modelo LFM3-1.7B de Liquid AI en su variante "abliterated". El modelo base pertenece a la familia LFM3 de Liquid AI, orientada a agentes locales y aplicaciones especializadas que se ejecutan en dispositivos de borde (edge), y destaca por su arquitectura tri-híbrida y una ventana de contexto de 256K tokens, excepcional para un modelo de este tamaño.

La variante "heretic abliterated" ha sido modificada para eliminar las direcciones de rechazo en el espacio de activaciones del modelo, suprimiendo así el comportamiento de negación incorporado durante el alineamiento de seguridad. El resultado es una versión sin censura que atiende un abanico más amplio de peticiones que la versión instruida original, a costa de perder los mecanismos de salvaguarda habituales. Esto la hace interesante para investigación sobre alineamiento y para casos de uso donde los rechazos del modelo son un obstáculo, pero exige responsabilidad en su despliegue.

Es relevante ahora porque combina tres atributos poco frecuentes en un mismo paquete: un tamaño mínimo (1,73 mil millones de parámetros, ~1 GB en cuantización de 4 bits), un contexto de 256K tokens y soporte de tool calling y salidas estructuradas, todo ejecutable en llama.cpp en hardware de consumo o incluso en móviles y placas SBC.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Tri-híbrida (LFM3, Liquid AI); detalle exacto de capas no disponible |
| Parámetros totales | 1.728.801.600 (~1,73 B) |
| Parámetros activos | No es MoE; todos los parámetros están activos |
| Longitud de contexto | 256K tokens |
| Tipos de cuantización | Q8_0, Q6_K, Q5_1, Q5_K_M, Q5_K_S, Q5_0, Q4_1, Q4_K_M, IQ4_NL, Q4_K_S, Q4_0, IQ4_XS, Q3_K_L, Q3_K_M, IQ3_M, IQ3_S, Q3_K_S (todas con imatrix sobre WikiText-2) |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | LFM 1.0 (licencia "other", no estándar de código abierto) |
| Formato de pesos | GGUF (compatible con llama.cpp); el modelo base original está en safetensors |

## Arquitectura y entrenamiento

El modelo base, LFM3-1.7B de Liquid AI, emplea la arquitectura tri-híbrida de la compañía, que combina distintos tipos de capas (la composición exacta no está detallada en la información disponible, aunque la familia LFM es conocida por mezclar mecanismos tipo convolucional gating lineal, atención y memoria). Esta familia está diseñada específicamente para inferencia eficiente en edge, con buen rendimiento por token en CPU y aceleradores móviles. Los detalles del corpus de entrenamiento, número de tokens y procesos de post-entrenamiento (RLHF/DPO) del modelo original no están disponibles en la información proporcionada.

Sobre el modelo base se aplicaron dos transformaciones: primero, la abliteración "heretic", que identifica y elimina las direcciones de rechazo en el espacio de activaciones para suprimir la conducta de negación; segundo, la cuantización GGUF por parte de Vortecks, donde cada archivo se generó con una matriz de importancia calculada sobre el corpus WikiText-2, lo que mejora la fidelidad de las cuantizaciones bajas respecto a cuantizaciones sin imatrix.

## Capacidades

- Generación de texto conversacional para asistentes de uso cotidiano.
- Tool calling / function calling (capacidad heredada del modelo base, orientado a agentes).
- Salidas estructuradas (structured outputs).
- Trabajo con contextos largos: ventana de 256K tokens.
- Soporte multilingüe en 16 idiomas, incluido castellano.
- Despliegue en edge: funciona en llama.cpp, con cuantizaciones IQ4_NL y Q4_0 con repacking online para CPU ARM y AVX.
- Sin filtros de seguridad: responde a peticiones que el modelo original rechazaría (sin garantía de calidad o veracidad en esas respuestas).

## Casos de uso

- Agentes locales en dispositivos de borde: con 1 GB en IQ4_XS y soporte de tool calling, puede alimentar agentes que ejecutan funciones en móvil, Raspberry Pi o portátiles sin conexión a la nube.
- Asistentes conversacionales offline: el tamaño reducido y el enfoque conversacional lo hacen adecuado para chat privado donde no se quiere enviar datos a APIs externas.
- Procesamiento de documentos largos en local: la ventana de 256K tokens permite resumir o consultar documentos extensos (informes, contratos, código) sin dividirlos, algo raro en modelos de menos de 2B.
- Investigación sobre alineamiento y seguridad: la variante abliterated permite estudiar cómo la abliteración de direcciones de rechazo afecta a la coherencia, la tasa de alucinación y las capacidades generales.
- Prototipado de aplicaciones con salidas estructuradas: generación de JSON y extracción de campos sobre texto de entrada, integrable en pipelines de datos locales.
- Asistentes multilingües ligeros: soporte oficial de 16 idiomas para chatbots de bajo coste en mercados europeos y asiáticos.
- Generación aumentada con recuperación (RAG) en local: combina contexto largo y tamaño mínimo para sistemas RAG en un solo equipo de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Para datos de rendimiento del modelo base, consultar la ficha de LiquidAI/LFM3-1.7B.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: desde ~1,0 GB (IQ4_XS) hasta ~1,85 GB (Q8_0) solo de pesos; añadir 0,5-2 GB adicionales según el contexto de KV cache usado (el contexto de 256K tokens completo exigiría memoria de KV considerable, no cuantificada en la información disponible).
- GPU recomendadas: cualquier GPU moderna con 4 GB de VRAM ejecuta la mayoría de cuantizaciones con holgura (por ejemplo, RTX 3060, RTX 4060 o superiores).
- Consumer GPU: cabe sobradamente en prácticamente cualquier GPU de consumo; incluso puede ejecutarse solo con CPU, dado el enfoque edge del modelo base (las cuantizaciones Q4_0 e IQ4_NL incluyen repacking online para CPU ARM y AVX).
- Despliegue: llama.cpp (formato nativo), Ollama, LM Studio, y cualquier runtime compatible con GGUF. No está pensado para vLLM o TGI en esta versión GGUF (usar los pesos originales de LiquidAI para eso).
- Latencia y throughput: no disponibles; por tamaño y arquitectura orientada a edge, se espera inferencia fluida en CPU de escritorio y Apple Silicon (la cuantización Q4_1 destaca por mejorar tokens/watt en Apple silicon).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B-Heretic-Abliterated (esta ficha) | 1,73 B | 256K | GGUF | LFM 1.0 | Abliterated, imatrix, edge, tool calling |
| LiquidAI/LFM3-1.7B (base) | 1,73 B | 256K | safetensors | LFM 1.0 | Versión original con alineamiento de seguridad |
| Qwen2.5-1.5B-Instruct | 1,5 B | 32K (128K con YaRN) | safetensors/GGUF | Apache 2.0 / Qwen | Sin abliterar, ecosistema muy amplio |
| Llama-3.2-1B-Instruct | 1,24 B | 128K | safetensors/GGUF | Llama 3.2 Community | Sin abliterar, soporte de tool calling |

La ventaja diferencial de esta variante frente a alternativas de tamaño similar es la combinación de contexto de 256K, abliteración y cuantizaciones imatrix listas para edge; su inconveniente es la licencia LFM 1.0, menos permisiva que Apache 2.0.

## Limitaciones y advertencias

- Sin salvaguardas de seguridad: al estar abliterated, el modelo no rechaza peticiones dañinas. Su uso para generar contenido ilegal, peligroso o dañino es responsabilidad exclusiva del usuario; no desplegar en producción expuesto a usuarios finales sin filtros externos.
- Riesgo de alucinación elevado en cuantizaciones bajas: por debajo de Q4 (IQ3_S, IQ3_M, Q3_K_M, Q3_K_S) la calidad se degrada notablemente, y la abliteración puede agravar la pérdida de coherencia.
- Posible degradación de capacidades: la abliteración es una intervención destructiva sobre el espacio de activaciones; el razonamiento y la fiabilidad pueden ser inferiores a los del modelo base instruido.
- Licencia LFM 1.0: no es una licencia open source estándar; revisar las condiciones en el enlace de la licencia antes de cualquier uso comercial.
- Contexto de 256K tokens: ejecutar contextos cercanos al máximo requiere memoria de KV cache significativa, poco práctica en dispositivos edge; en la práctica se usarán contextos mucho menores.
- Sesgos: heredados del modelo base; no hay auditoría de sesgos publicada para esta variante.
- Tamaño de repo (27,9 GB): descargar solo los archivos GGUF concretos que se necesiten, no la rama completa.

## Enlaces

- Ficha del modelo cuantizado: https://huggingface.co/Vortecks/LFM3-1.7B-Heretic-Abliterated-i1-GGUF
- Modelo abliterated original (pre-cuantización): https://huggingface.co/Vortecks/LFM3-1.7B-Heretic-Abliterated
- Modelo base de Liquid AI: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia LFM 1.0: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/LICENSE
- Web de Liquid AI: https://www.liquid.ai
