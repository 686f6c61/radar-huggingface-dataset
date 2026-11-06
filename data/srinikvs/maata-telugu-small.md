# srinikvs/maata-telugu-small

## Resumen

maata-telugu-small es un ajuste fino (fine-tuning) del modelo de reconocimiento automatico del habla openai/whisper-small, especializado en telugu (te). Lo publica el usuario srinikvs en Hugging Face y su proposito es mejorar la transcripcion de audio en telugu respecto al modelo base multilingue, que dedica una fraccion pequena de su capacidad a este idioma. El modelo se distribuye en formato GGML/whisper.cpp, lo que indica que esta pensado para inferencia local eficiente, incluso en CPU.

Se trata de un modelo de la familia Whisper, con arquitectura transformer encoder-decoder orientada a ASR, derivada de whisper-small (aproximadamente 244 millones de parametros en el modelo base). El repositorio ocupa 0,3 GB, coherente con los pesos convertidos a GGML. El modelo esta entrenado sobre ai4bharat/IndicVoices, un corpus de habla indico de gran escala, y esta restringido (gated) en Hugging Face: requiere aceptar condiciones antes de descargarlo.

Es relevante para desarrolladores que necesiten transcripcion de telugu en entornos con recursos limitados, ya que combina un modelo base pequeno con un formato optimizado para CPU y una licencia MIT permisiva. No obstante, la informacion publicada es escasa: no hay tarjeta de modelo detallada, benchmarks ni datos de entrenamiento explicitos mas alla del dataset citado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | no disponible (modelo base whisper-small, ~244 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper procesa ventanas de audio de 30 s) |
| Tipos de cuantizacion | GGML (formato whisper.cpp); niveles concretos no disponibles |
| Idiomas soportados | telugu (te) |
| Licencia | MIT |
| Formato de pesos | GGML (whisper.cpp); pesos originales en safetensors no confirmados |

## Arquitectura y entrenamiento

El modelo parte de openai/whisper-small, un transformer encoder-decoder con atencion completa, disenado para ASR multilingue y traduccion de voz. Whisper trabaja sobre espectrogramas Mel de 30 segundos y genera tokens de texto de forma autorregresiva. El ajuste fino adapta el modelo base al telugu, presumiblemente especializando el decoder y el encoder en la fonetica y el vocabulario de ese idioma.

Segun los metadatos, el entrenamiento utiliza el dataset ai4bharat/IndicVoices, un corpus de habla indico con transcripciones, referenciado en el paper arXiv:2403.01926. No se dispone de informacion sobre el numero de horas o tokens empleados, la composicion exacta del dataset, ni si se aplicaron tecnicas de augmentacion, RLHF o decodificacion especulativa. Tampoco se detalla el procedimiento de conversion a GGML ni las hiperparametros del fine-tuning.

## Capacidades

- Reconocimiento automatico del habla (ASR) en telugu, con salida de transcripcion de texto.
- Segmentacion y transcripcion de audio de hasta 30 segundos por ventana, con concatenacion para audios mas largos segun el pipeline de whisper.cpp.
- Inferencia eficiente en CPU gracias al formato GGML y a la integracion con whisper.cpp.
- Capacidad multilingue residual del modelo base, aunque el ajuste esta orientado exclusivamente al telugu.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio adicional ni modo thinking.
- No se documenta capacidad de traduccion de voz a texto en otros idiomas.

## Casos de uso

- Transcripcion de reuniones y entrevistas en telugu: el modelo puede procesar grabaciones por ventanas de 30 segundos y generar transcripciones en texto, adecuado para equipos que trabajan en entornos con CPU y sin GPU dedicada.
- Subtitulado automatico de contenido audiovisual en telugu: integrado en un pipeline de whisper.cpp, permite generar subtitulos SRT para videos, podcast o material educativo.
- Digitalizacion de archivos de audio historicos o entrevistas de campo: al ser un modelo pequeno y ligero (0,3 GB), puede desplegarse en portatiles o dispositivos edge para transcribir grabaciones in situ.
- Accesibilidad para personas con discapacidad auditiva: transcripcion en tiempo casi real de conversaciones o charlas en telugu, con latencia baja en CPU moderna.
- Analisis de llamadas de atencion al cliente en telugu: transcripcion previa a un pipeline de NLP para extraer temas, sentimiento o cumplimiento, usando el modelo como primer eslabon.
- Investigacion linguistica y creacion de corpus: generacion de transcripciones masivas de audio telugu para construir datasets de texto o entrenar modelos de lenguaje en ese idioma.
- Prototipado rapido de aplicaciones ASR: la licencia MIT y el formato GGML permiten experimentar y desplegar sin restricciones comerciales, ideal para pruebas de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo esta en formato GGML para CPU, por lo que puede ejecutarse sin GPU.
- GPU recomendadas: no disponible; cualquier GPU con suficiente memoria para whisper-small (~1 GB en FP16) seria suficiente, pero no se documenta.
- Cabe en GPU consumer: si, previsiblemente en cualquier GPU consumer moderna (GTX 1060 en adelante) con al menos 2 GB de memoria, aunque no se confirma.
- Opciones de despliegue: whisper.cpp (formato nativo GGML), y potencialmente otros runners compatibles con GGML; vLLM, TGI y Ollama no estan confirmados para este formato.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| maata-telugu-small | ~244 M (base) | ventanas de 30 s | no disponible | MIT | gated en HF |
| openai/whisper-small | ~244 M | ventanas de 30 s | benchmarks publicados por OpenAI | MIT | abierto en HF |
| ai4bharat/indicwav2vec | no disponible | no disponible | no disponible | no disponible | abierto en HF |
| vasista22/whisper-telugu-small | ~244 M | ventanas de 30 s | no disponible | no disponible | abierto en HF |

La comparativa se limita a modelos de la misma familia o tarea; no se dispone de datos de rendimiento para maata-telugu-small que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face antes de la descarga, lo que puede anadir friccion en pipelines automatizados.
- Informacion muy escasa: no hay tarjeta de modelo detallada, benchmarks ni datos de entrenamiento, lo que dificulta evaluar su calidad real frente al modelo base.
- Riesgo de alucinacion: como todo modelo Whisper, puede generar texto plausible en segmentos de silencio o ruido, especialmente en audio de baja calidad.
- Sesgos: al entrenarse sobre IndicVoices, puede estar sesgado hacia determinados acentos, registros o dominios presentes en el corpus; no se documenta el balance del dataset.
- Limitacion de idioma: aunque el modelo base es multilingue, el ajuste esta orientado al telugu y puede degradar el rendimiento en otros idiomas.
- Limitacion de contexto: Whisper procesa ventanas de 30 segundos; audios largos requieren segmentacion y concatenacion, con posible perdida de coherencia en los cortes.
- Licencia MIT: permisiva para uso comercial, pero el modelo base whisper-small tambien es MIT, por lo que no deberia haber restricciones adicionales; aun asi, conviene verificar la procedencia de los datos de IndicVoices.
- Formato GGML: no es compatible directamente con frameworks como vLLM o TGI, lo que limita su uso en infraestructuras de inferencia GPU de alto rendimiento.

## Enlaces

- Hugging Face: https://huggingface.co/srinikvs/maata-telugu-small
- Modelo base: https://huggingface.co/openai/whisper-small
- Dataset: https://huggingface.co/datasets/ai4bharat/IndicVoices
- Paper IndicVoices: https://arxiv.org/abs/2403.01926
- Repositorio whisper.cpp: https://github.com/ggerganov/whisper.cpp
- Paper Whisper: https://arxiv.org/abs/2212.04356
