# Synchopate/Qwen3.8-Flash-Next-MaxQ-64GB-GGUF

## Resumen
Qwen3.8-Flash-Next-MaxQ-64GB-GGUF es una cuantizacion GGUF de 64 GB de RAM del modelo base Qwen/Qwen3.8-Flash-Next, publicada por el usuario Synchopate dentro de su linea de cuantizaciones MaxQ v3.0. El checkpoint comprime el modelo original de 329,72 GiB en BF16 hasta 53,99 GiB, manteniendo la arquitectura completa y sin podar: 48 capas de tronco, 512 expertos enrutados por capa, una tabla de embeddings por capa (PLE) de 320 millones de filas y un modulo NextN de prediccion multi-token. El resultado es un modelo de aproximadamente 176.500 millones de parametros totales con unos 5.000 millones de parametros activos por token, disenado para inferencia en CPU sin GPU.

La relevancia de esta publicacion radica en su enfoque de compresion agresiva pero selectiva: en lugar de podar expertos (como hacen otras cuantizaciones de tamano similar), reinvierte el espacio ahorrado en la tabla PLE, que pasa de 26,82 GiB a 10,73 GiB mediante PCA-Wiener y RaBitQ, y en mantener intactos los 512 expertos y el modulo MTP. El autor reporta un rendimiento en perplejidad y divergencia KL claramente mejor que una cuantizacion comparable de ISTA-DASLab, con velocidades de 12,66 tok/s en generacion y 71,97 tok/s en prefill sobre una CPU Zen 5 de 16 nucleos. Es una opcion pensada para entornos con mucha RAM y sin acelerador grafico.

La licencia es qwen-community-1.0, heredada del modelo base, lo que condiciona el uso comercial. El pipeline declarado es image-text-to-text, e incluye un proyector visual opcional en BF16 de 0,85 GiB para capacidades multimodales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con MoE: 36 capas Gated DeltaNet y 12 capas QSA de atencion completa, mas 1 capa NextN MTP (topologia qwen4exp) |
| Parametros totales | ~176.500 millones (125.300 millones en transformer + MoE de 512 expertos + MTP + 51.200 millones en tabla PLE) |
| Parametros activos | ~5.000 millones por token (10 de 512 expertos enrutados + 1 experto compartido + tronco denso GDN/QSA) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mezcla de tipos ggml estandar: F32 (351 tensores), Q8_0 (339), Q6_K (198), IQ2_S (60), BF16 (49), Q2_0 (39), IQ3_XXS (36), MXFP4 (7), IQ4_NL (4), Q2_K (2), Q1_0 (1); max_type = 42, sin tipos personalizados |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (other) |
| Formato de pesos | GGUF (2 shards para el LLM + mmproj BF16 opcional para vision) |

## Arquitectura y entrenamiento
El modelo base Qwen3.8-Flash-Next emplea una topologia hibrida denominada qwen4exp en la model card: 48 capas de tronco, de las cuales 36 son Gated DeltaNet con dimensiones [48x128x128] y 12 son QSA de atencion completa con compress_ratio = 4. Sobre esta columna se anade una capa NextN de prediccion multi-token (blk.48) que acelera la decodificacion especulativa. La capa MoE tiene 512 expertos enrutados con top-10 activos (K = 640 de ancho completo) mas un experto compartido, sin sesgo en ffn_down_exps. La tabla de embeddings por capa (PLE) contiene 320.001.536 filas con D = 256.

La cuantizacion de Synchopate no modifica la topologia: mantiene los 512 expertos sin podar y comprime la tabla PLE de 26,82 GiB (IQ4_NL) a 10,73 GiB mediante subespacio PCA-Wiener con D = 256 y RaBitQ en Q1_0, reinvirtiendo los 16,09 GiB liberados en preservar el MoE completo, escalas firmadas Q2_0 con Woodbury DualGram en FP64 y el modulo MTP (0,81 GiB). Todos los tensores usan tipos ggml estandar, lo que garantiza compatibilidad con llama.cpp y derivados. No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens ni si hubo RLHF o DPO en la informacion proporcionada.

## Capacidades
- Generacion de texto conversacional multi-turno, segun el tag conversational y el pipeline declarado.
- Razonamiento y respuesta a instrucciones heredados del modelo base Qwen3.8-Flash-Next.
- Capacidades multimodales de imagen a texto mediante el proyector visual opcional mmproj-Qwen3.8-Flash-Next-BF16.gguf (0,85 GiB).
- Decodificacion especulativa integrada mediante la capa NextN MTP, con una tasa de aceptacion reportada del 93,0 %.
- Inferencia en CPU pura sin GPU, gracias a la cuantizacion mixta y a la integracion con llama-modchip.
- Compatibilidad con llama.cpp y con el binario llama-server-modchip (variantes AVX2 y AVX-512).
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Cobertura multilingue: no disponible en la informacion proporcionada.

## Casos de uso
- Despliegue en servidores sin GPU: el checkpoint ocupa 53,99 GiB y se ejecuta con un pico de memoria de 45,08 GiB en una CPU Zen 5 de 16 nucleos, lo que permite servir el modelo en maquinas con 64 GB de RAM y sin acelerador grafico.
- Estaciones de trabajo de desarrollo con RAM abundante: un equipo con 64 GB puede cargar los dos shards y el proyector visual para tareas de prototipado conversacional y multimodal sin depender de la nube.
- Procesamiento por lotes de documentos e imagenes: el pipeline image-text-to-text y el mmproj BF16 permiten extraer descripciones o responder preguntas sobre imagenes en pipelines offline donde la latencia no es critica.
- Entornos con requisitos de privacidad: al ejecutarse localmente en CPU, los datos no salen de la maquina, lo que encaja en escenarios con datos sensibles que no pueden enviarse a APIs externas.
- Evaluacion e investigacion de cuantizaciones: la model card documenta perplejidad, KLD, hashes SHA-256 y manifiesto de tensores, lo que facilita reproducir experimentos de compresion sobre arquitecturas MoE hibridas.
- Chat interactivo de baja concurrencia: con 12,66 tok/s de generacion en CPU, es adecuado para un usuario o pocos usuarios simultaneos en tareas de asistencia conversacional.
- Pruebas de decodificacion especulativa: la capa NextN MTP integrada y la tasa de aceptacion del 93,0 % permiten estudiar el impacto del MTP en entornos CPU-only.

## Benchmarks y rendimiento

| Metrica | MaxQ-64GB | ISTA-DASLab GSQ-RCO-Coder-IQ1_M |
|---|---|---|
| Tamano | 53,99 GiB | 54,40 GiB |
| Expertos | 512/512 sin podar | 256/512 podados |
| MTP | Si (blk.48) | No |
| Mean PPL (wiki-alt.txt) | 3,4325 ± 0,0708 | 5,0916 |
| Mean KLD | 0,4971 ± 0,0099 | 0,9302 |
| Median KLD | no disponible en detalle | -64,3 % respecto a MaxQ |
| tg128 (generacion) | 12,66 tok/s | no disponible |
| pp512 (prefill) | 71,97 tok/s | no disponible |
| Aceptacion MTP | 93,0 % | no aplica |
| VmHWM | 45,08 GiB | no disponible |

Las mediciones se realizaron sobre wiki-alt.txt con 40 x 512 fragmentos y 0,000000 % de solapamiento de 8-gramas y 13-gramas con el conjunto de calibracion, en una CPU Zen 5 de 16 nucleos sin GPU. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware
- RAM estimada: 53,99 GiB para los pesos del LLM; el autor reporta un pico de memoria (VmHWM) de 45,08 GiB durante la ejecucion con llama-modchip. Se recomienda un equipo con 64 GB de RAM para dejar margen al sistema y al contexto.
- VRAM: no aplica para el modo CPU; no se documenta despliegue en GPU en la informacion proporcionada.
- GPU recomendadas: no disponible; el checkpoint esta disenado para inferencia en CPU.
- CPU: el benchmark se ejecuto en un procesador Zen 5 de 16 nucleos. El binario llama-server-modchip incluye variantes AVX2 y AVX-512 (con AVX-512 VBMI y VNNI), seleccionables automaticamente.
- Cabe en GPU de consumo: no disponible; el foco es CPU.
- Opciones de despliegue: llama.cpp, llama-server-modchip v3.0 (binario portable con GLIBC <= 2.30) y el preset qwen38-64gb de llama-modchip. vLLM, TGI y Ollama no se mencionan en la informacion disponible.
- Latencia y throughput: 12,66 tok/s en generacion (tg128) y 71,97 tok/s en prefill (pp512) sobre Zen 5 de 16 nucleos; threading recomendado -t (N_CORES - 1) con --poll 0.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-MaxQ-64GB (este) | ~176,5 B totales / ~5 B activos | no disponible | GGUF, 53,99 GiB | qwen-community-1.0 | 512/512 expertos, MTP integrado, PPL 3,4325 |
| ISTA-DASLab GSQ-RCO-Coder-IQ1_M | no disponible | no disponible | GGUF, 54,40 GiB | no disponible | 256/512 expertos podados, sin MTP, PPL 5,0916 |
| Qwen/Qwen3.8-Flash-Next (BF16 original) | ~176,5 B totales / ~5 B activos | no disponible | safetensors BF16, 329,72 GiB | qwen-community-1.0 | Referencia sin cuantizar, requiere hardware de gama alta |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias
- La licencia qwen-community-1.0 impone condiciones especificas para uso comercial; es necesario revisar el texto completo en el repositorio del modelo base antes de desplegarlo en produccion.
- La cuantizacion Q2_0 y Q1_0 introduce perdida de calidad respecto al BF16 original; el autor reporta Mean PPL 3,4325 y Mean KLD 0,4971 frente a la referencia, lo que implica cierta degradacion medible.
- El modelo esta pensado para inferencia en CPU; no se documenta soporte para GPU ni para frameworks como vLLM o TGI, lo que limita su integracion en infraestructuras aceleradas.
- El rendimiento de 12,66 tok/s en generacion es bajo para aplicaciones interactivas de alta concurrencia; no es adecuado para servir a muchos usuarios simultaneos.
- El badge "5.0B" que Hugging Face detecta automaticamente es enganoso: corresponde a los parametros activos, no a los totales (~176,5 B); conviene tenerlo en cuenta al planificar recursos.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion, cobertura idiomatica ni limitaciones de contexto del modelo base en la documentacion proporcionada.
- La tabla PLE se almacena en Q1_0, el tipo mas agresivo del checkpoint; es plausible que afecte a la calidad en tareas que dependan fuertemente de los embeddings por capa, aunque no se documenta un analisis especifico.
- El binario llama-modchip es un fork especifico; la compatibilidad con versiones estandar de llama.cpp no esta garantizada en todos los casos.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/Synchopate/Qwen3.8-Flash-Next-MaxQ-64GB-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Repositorio llama-modchip: https://github.com/synchopate/llama-modchip
- Releases de llama-modchip v3.0: https://github.com/synchopate/llama-modchip/releases/download/v3.0
