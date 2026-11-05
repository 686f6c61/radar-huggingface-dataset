# Thox-ai/ThoxSpeech-ASR-BitNet

## Resumen

ThoxSpeech-ASR-BitNet es una redistribucion literal (verbatim) del modelo de reconocimiento automatico del habla multilingue `microsoft/VibeVoice-ASR-BitNet`, publicada por Thox-ai para su uso en inferencia sobre CPU dentro del stack THOX. No se ha reentrenado ni recuantizado: el autor original de los pesos es Microsoft y la licencia MIT se mantiene. El repositorio contiene unicamente los artefactos GGUF necesarios para ejecutar el modelo con el runtime ggml especifico de VibeVoice/BitNet.

El modelo emplea una arquitectura de dos etapas: un tokenizador acustico (encoder tipo VAE) cuantizado en I8_S de 0,65 GB y un decodificador de lenguaje cuantizado en I2_S con embeddings en Q6_K de 0,92 GB, sumando 1,58 GB en disco. El numero de parametros declarado en safetensors es de aproximadamente 1.777 millones (1,78 B), aunque la model card no detalla la distribucion entre encoder y decoder.

Su relevancia actual radica en que permite transcripcion multilingue en dispositivos sin GPU, con un consumo de almacenamiento reducido gracias a la cuantizacion ternaria (I2_S) del decoder. Esta orientado a escenarios local-first y a investigacion en ASR sobre CPU, no a entornos de alta exigencia o de produccion critica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos etapas: tokenizador acustico (encoder VAE) + decodificador de lenguaje, con cuantizacion BitNet ternaria |
| Parametros totales | ~1.777 millones (1,78 B) segun safetensors |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | I8_S (encoder), I2_S con embeddings Q6_K (decoder) |
| Idiomas soportados | en, zh, fr, it, ko, pt, vi |
| Licencia | MIT (© Microsoft Corporation) |
| Formato de pesos | GGUF (`thoxspeech-lm-i2_s-embed-q6_k.gguf`, `thoxspeech-vae-encoder-i8_s.gguf`) |

## Arquitectura y entrenamiento

La arquitectura combina un encoder acustico tipo VAE (tokenizador) y un decodificador de lenguaje, ambos derivados de `microsoft/VibeVoice-ASR-BitNet`. El decoder emplea cuantizacion ternaria (I2_S) con embeddings en Q6_K, lo que reduce el peso del modelo a menos de 1 GB para el componente de lenguaje. El encoder se cuantiza en I8_S. Esta estructura de dos etapas es habitual en pipelines de ASR neuronales, donde el encoder transforma la senal de audio en representaciones latentes y el decoder genera la transcripcion.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Thox-ai declara explicitamente que no ha realizado entrenamiento adicional: el repositorio es una redistribucion de los pesos publicados por Microsoft. Cualquier innovacion tecnica (por ejemplo, decodificacion especulativa o atencion lineal) no esta documentada en la informacion disponible.

## Capacidades

- Reconocimiento automatico del habla multilingue en siete idiomas: ingles, chino, frances, italiano, coreano, portugues y vietnamita.
- Transcripcion sobre CPU sin necesidad de GPU, gracias a la cuantizacion ternaria y a los ficheros GGUF optimizados para ggml.
- Ejecucion local-first, adecuada para entornos con requisitos de privacidad o sin conectividad.
- Inferencia con el runtime dedicado de VibeVoice/BitNet en ggml.
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio mas alla del propio ASR.
- No se documenta modo thinking ni capacidades de razonamiento general.

## Casos de uso

- Transcripcion de reuniones en portatiles sin GPU: el modelo cabe en 1,58 GB de disco y se ejecuta en CPU, lo que permite transcribir reuniones localmente sin enviar audio a servicios externos.
- Subtitulado de contenido audiovisual multilingue: al cubrir siete idiomas, puede generar subtitulos preliminares en ingles, chino, frances, italiano, coreano, portugues y vietnamita para revision humana posterior.
- Notas de voz en aplicaciones de productividad: integrable en herramientas de escritorio que convierten dictados en texto sin depender de la nube, manteniendo los datos en el dispositivo.
- Investigacion en ASR de bajo consumo: util como linea base para experimentos con cuantizacion ternaria y despliegue en CPU, comparando con variantes en punto flotante del modelo base.
- Prototipado de asistentes de voz offline: permite construir demos de captura y transcripcion en entornos embebidos o con recursos limitados.
- Analisis de grabaciones en entornos con restricciones de privacidad (por ejemplo, entrevistas o atencion al cliente interna): la inferencia local evita la salida de audio sensible, aunque la precision en audio ruidoso debe validarse.
- Preprocesado de corpus de audio para tareas posteriores de NLP: transcripcion masiva en CPU de archivos ya capturados, con revision humana en los segmentos criticos.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| LibriSpeech-clean (WER) | ~2,41 | Pruebas internas de THOX, segun la model card |

No se han publicado en la informacion disponible resultados de otros benchmarks (MMLU, HumanEval, GSM8K u otros) ni comparaciones directas con modelos alternativos. El autor indica que la precision se degrada en habla lejana (far-field) y con solapamiento de voces.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso objetivo (CPU); el modelo ocupa 1,58 GB en disco y requiere memoria RAM proporcional al cargar ambos ficheros GGUF.
- GPU recomendadas: no se documentan; el modelo esta pensado para CPU. No se especifica compatibilidad con CUDA, ROCm ni Metal.
- Cabe en GPU consumer: no confirmado; los tipos GGUF ternarios y no estandar requieren el runtime ggml especifico, por lo que la ejecucion en GPU no esta garantizada.
- Opciones de despliegue: runtime ggml de VibeVoice/BitNet (unico soportado segun el autor). Ollama y LM Studio no soportan estos ficheros.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| ThoxSpeech-ASR-BitNet | ~1,78 B | no disponible | 7 | MIT | GGUF (I8_S + I2_S/Q6_K), runtime ggml |
| microsoft/VibeVoice-ASR-BitNet (base) | ~1,78 B (mismo origen) | no disponible | no disponible | MIT | Pesos originales de Microsoft |
| Whisper (variantes pequenas) | no disponible en esta ficha | no disponible | no disponible | MIT | multiples formatos |

La comparacion con Whisper u otros modelos ASR no puede concretarse con datos de la informacion disponible; se indica como referencia cualitativa unicamente el modelo base del que deriva esta redistribucion.

## Limitaciones y advertencias

- Es una redistribucion verbatim: Thox-ai no ha reentrenado ni recuantizado el modelo, por lo que los sesgos y el comportamiento reflejan los datos de entrenamiento originales de Microsoft.
- Se esperan errores de transcripcion en audio ruidoso, de campo lejano o con voces solapadas; conviene revisar manualmente las transcripciones importantes.
- Solo se documentan siete idiomas; el rendimiento en otros idiomas no esta garantizado.
- Uso fuera de alcance declarado: decisiones medicas, legales, financieras o de seguridad critica sin revision humana, y control de dispositivos fisicos sin paso de confirmacion.
- La licencia MIT permite uso comercial, pero el aviso de copyright de Microsoft debe conservarse; Thox-ai no reclama autoria sobre los pesos.
- Compatibilidad limitada: Ollama y LM Studio no soportan estos ficheros; se requiere el runtime ggml especifico, lo que restringe la integracion en pipelines estandar.
- No se dispone de informacion sobre latencia, throughput ni consumo de memoria en produccion, lo que dificulta planificar despliegues a escala.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Thox-ai/ThoxSpeech-ASR-BitNet
- Modelo base: https://huggingface.co/microsoft/VibeVoice-ASR-BitNet
- Ficheros GGUF: `thoxspeech-lm-i2_s-embed-q6_k.gguf` (992.877.600 B, SHA-256 `fbe273d8dc2f2433bb25f849e19d77ea65aaa2188d12c20cee987ab6f321e002`) y `thoxspeech-vae-encoder-i8_s.gguf` (703.080.064 B, SHA-256 `4941c82608c253ec066b5cc74d3dd11a5c8fef96cccbc5b87359ef0fe4338df6`)
- Runtime ggml de VibeVoice/BitNet: no se proporciona URL especifica en la informacion disponible
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada
