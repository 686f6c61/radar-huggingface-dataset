# xv0y5ncu/gemma-4-E4B-it-GLQ-trellis-3inst-4bpw

## Resumen

GLQ 4bpw es una cuantización del modelo multimodal `google/gemma-4-E4B-it` de Google, publicada por el usuario `xv0y5ncu`. Emplea GLQ (una variante de cuantización con codebook de trellis, concretamente QTIP TCQ en su variante `3inst`, combinada con transformada de Hadamard aleatorizada y LDLQ) a 4,0 bits por peso, manteniendo los pesos comprimidos en memoria y decodificándolos al vuelo mediante un kernel CUDA fusionado. El objetivo es reducir drásticamente la huella de memoria del modelo base (de aproximadamente 16 GB en bf16 a 6,58 GiB cargados) sin renunciar a la calidad de forma significativa.

El modelo base es un transformer multimodal de tipo any-to-any (texto, imagen y audio) con 3.295.349.322 parámetros totales según los safetensors del repositorio. Esta versión cuantizada conserva las torres de visión y audio en su formato nativo y solo cuantiza el decodificador de texto, por lo que sigue siendo utilizable para tareas image-text-to-text.

Es relevante ahora porque permite ejecutar un modelo multimodal de ~3,3B parámetros en GPUs de consumo con VRAM limitada, con una velocidad de decodificación de 119,5 tok/s a batch 1 en una RTX PRO 6000 Blackwell bajo vLLM. La licencia declarada es Apache 2.0, aunque el modelo base remite a la licencia específica de Gemma 4 de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (any-to-any: texto, imagen, audio); decodificador de texto cuantizado con GLQ, torres de visión y audio en formato nativo |
| Parametros totales | 3.295.349.322 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el ejemplo de vLLM usa `max_model_len=4096`; el autor menciona que el KV cache E8 permite contexto más largo en la misma VRAM) |
| Tipos de cuantizacion | GLQ 4,0 bits/peso (trellis-coded QTIP TCQ variante `3inst` + RHT + LDLQ); KV cache E8 opcional (~4× más pequeño) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (con enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | safetensors (trellis en layout MMA-fragment para kernels 3INST) |

## Arquitectura y entrenamiento

El modelo base `google/gemma-4-E4B-it` es un transformer multimodal de tipo any-to-any que procesa texto, imágenes y audio. Esta publicación no reentrena el modelo: aplica cuantización post-entrenamiento sobre el decodificador de texto, dejando las torres de visión y audio en su precisión nativa. La técnica GLQ combina un codebook de trellis (QTIP TCQ, variante `3inst`) con una transformada de Hadamard aleatorizada (RHT) y LDLQ, a una tasa uniforme de 4,0 bits por peso en una sola pasada de decodificación, sin apilamiento de residuales.

La calibración se realizó con 128 muestras de 2048 tokens de WikiText-2. El SQNR medio de los pesos es de 22,12 dB sobre 343 capas cuantizadas. Los pesos permanecen comprimidos en memoria y se decodifican al vuelo mediante un kernel CUDA fusionado específico (3INST, sin tabla de búsqueda). No se dispone de información sobre los datos de entrenamiento originales del modelo base ni sobre si se aplicó RLHF o DPO en su desarrollo.

## Capacidades

- Generación de texto y razonamiento: el modelo base es instruction-tuned (`-it`) y el autor verifica un modo de razonamiento extendido (thinking) con una media de 6114 tokens generados en las pruebas de AIME-2026.
- Procesamiento multimodal de imagen y texto (pipeline `image-text-to-text`), así como audio según el pipeline `any-to-any` declarado.
- Razonamiento matemático: resultados medidos en AIME-2026 con modo thinking.
- Servido como endpoint compatible con la API de OpenAI mediante vLLM, lo que habilita su uso en herramientas de agentes de código (pi-code, opencode).
- Soporte de tool calling y function calling: no disponible en la información proporcionada (el uso como endpoint OpenAI-compatible sugiere compatibilidad, pero no se documenta explícitamente).
- Capacidades multilingües: no disponible.
- Modo thinking: confirmado por el autor en las pruebas de AIME-2026.

## Casos de uso

- Despliegue local de un modelo multimodal en GPUs de consumo: con 6,58 GiB de pesos cargados, cabe en tarjetas de 24 GB (RTX 4090, RTX 3090) dejando espacio para KV cache y contexto, lo que permite prototipar aplicaciones image-text-to-text sin infraestructura de datacenter.
- Asistente de código en local mediante agentes: el autor documenta la integración con pi-code y opencode apuntando a un endpoint OpenAI-compatible servido con `vllm serve`, adecuado para autocompletado y razonamiento sobre código en entornos con requisitos de privacidad.
- Razonamiento matemático con modo thinking: útil para resolución de problemas con presupuesto de tokens amplio (el autor usa 32k de presupuesto en AIME-2026), por ejemplo en herramientas educativas o de verificación de cálculos.
- Servicio de inferencia de bajo coste: la ventaja de velocidad de GLQ es mayor en tarjetas con poco ancho de banda (24–32 GB), donde mover 4× menos bytes de pesos se traduce en mayor throughput; adecuado para servir a varios usuarios en hardware modesto.
- Procesamiento de documentos con imagen y texto: al conservar las torres de visión nativas, puede emplearse para extracción de información de capturas, formularios o figuras combinadas con instrucciones textuales.
- Contexto largo en VRAM limitada: combinando GLQ con el KV cache E8 (~4× más pequeño), se puede ampliar la ventana de contexto efectiva en la misma GPU para conversaciones multi-turno o análisis de documentos extensos.
- Evaluación e investigación de técnicas de cuantización: el checkpoint sirve como referencia reproducible de GLQ a 4 bpw con métricas publicadas (SQNR, tok/s, AIME), útil para comparar métodos de cuantización en modelos multimodales.

## Benchmarks y rendimiento

Datos medidos por el autor sobre este checkpoint exacto, en una RTX PRO 6000 Blackwell (sm_120) con vLLM 0.25.1:

| Metrica | Valor |
|---|---|
| Pesos cargados (vLLM) | 6,58 GiB (referencia bf16 ≈ 16,0 GB) |
| Decodificacion, batch 1 | 119,5 tok/s |
| SQNR medio de pesos | 22,12 dB (343 capas) |
| AIME-2026 (avg@8, thinking) | 44,2% (pass@8 en 20/30 problemas, 0 truncamientos, 26/240 generaciones sin `\boxed{}` parseable, media 6114 tokens generados) |

El autor advierte que no hay una ejecución pareada en bf16 bajo el mismo arnés, por lo que estas cifras no deben interpretarse como un delta de cuantización. Tampoco se han medido perplejidad en WikiText-2 ni MMLU-Pro. No se han publicado resultados de benchmarks del modelo base en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 6,58 GiB solo de pesos; hay que añadir KV cache, activaciones y overhead del runtime (el ejemplo de vLLM usa 4096 tokens de contexto).
- GPU recomendadas: RTX PRO 6000 Blackwell (medición del autor); por huella de memoria, cabría en GPUs de 24 GB o más (RTX 4090, RTX 3090, L4, A10G) con contexto moderado.
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB en adelante; en 16 GB es ajustado y depende de la longitud de contexto y del KV cache.
- Opciones de despliegue: vLLM (recomendado, con `quantization="glq"` y `glq >= 0.8.0`), Transformers con `glq.hf_integration` (requiere `transformers>=5.13.1,<5.15`). No se documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: 119,5 tok/s de decodificación a batch 1 en RTX PRO 6000 Blackwell; el autor señala que la ventaja de velocidad es mayor en tarjetas con poco ancho de banda (24–32 GB) y aproximadamente paritaria en Blackwell de 96 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| gemma-4-E4B-it-GLQ-trellis-3inst-4bpw (este) | 3,295B | no disponible | GLQ 4,0 bpw | apache-2.0 | Pesos 6,58 GiB; 119,5 tok/s en RTX PRO 6000; AIME-2026 44,2% |
| google/gemma-4-E4B-it (bf16) | 3,295B | no disponible | bf16 | licencia Gemma 4 | Referencia ≈16,0 GB; sin ejecución pareada publicada por el autor |
| Otras cuantizaciones de gemma-4-E4B-it | 3,295B | no disponible | no disponible | según autor | No disponible en la información proporcionada |

No se dispone de datos de benchmarks del modelo base ni de alternativas comparables en la información proporcionada, por lo que no es posible establecer una comparación de rendimiento fiable.

## Limitaciones y advertencias

- No existe una ejecución pareada en bf16 bajo el mismo arnés, por lo que no se puede cuantificar la pérdida de calidad respecto al modelo original; el SQNR de 22,12 dB indica cierta degradación de pesos.
- El autor no ha medido perplejidad en WikiText-2 ni MMLU-Pro; las cifras de AIME-2026 son de un único checkpoint y configuración de muestreo.
- La velocidad de decodificación es específica de la GPU: citar 119,5 tok/s sin indicar la RTX PRO 6000 Blackwell es incorrecto según el propio autor.
- Requiere `transformers>=5.13.1,<5.15`: la versión 5.15.0 rompe la carga de gemma-4 en vLLM por un cambio en la configuración por capa (afecta también al modelo bf16 original).
- Requiere `glq >= 0.8.0` por el layout MMA-fragment del trellis; versiones anteriores no pueden consumir este checkpoint.
- Al ejecutar vLLM como script es obligatorio el guard `if __name__ == "__main__"`, o el proceso se reimporta recursivamente y falla antes de cargar el modelo.
- Solo se cuantiza el decodificador de texto; las torres de visión y audio permanecen en formato nativo y consumen VRAM adicional.
- Idiomas soportados no documentados; riesgo de alucinación y sesgos del modelo base no evaluados en esta publicación.
- La licencia declarada es Apache 2.0, pero el enlace remite a la licencia de Gemma 4 de Google; conviene verificar las condiciones de uso comercial del modelo base antes de producción.
- No se documenta soporte para llama.cpp, Ollama o TGI, lo que limita las opciones de despliegue fuera de vLLM y Transformers.

## Enlaces

- Hugging Face: https://huggingface.co/xv0y5ncu/gemma-4-E4B-it-GLQ-trellis-3inst-4bpw
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Paper QTIP (referencia en tags): https://arxiv.org/abs/2406.11235
- Paper referenciado en tags: https://arxiv.org/abs/2607.02770
