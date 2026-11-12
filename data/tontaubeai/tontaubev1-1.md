# TontaubeAI/TontaubeV1.1

## Resumen

TontaubeV1.1 es un modelo de síntesis de voz (text-to-speech) multilingüe desarrollado por TontaubeAI, orientado a clonación de voz expresiva, generación de audio de formato largo y streaming de baja latencia. Se construye como un fine-tuning sobre la familia Qwen3 (Qwen/Qwen3-1.7B y Qwen/Qwen3-0.6B) y se distribuye con pesos en precisión completa (bf16) más una variante int4 de 1,8 GB pensada para GPUs pequeñas y CPU. El modelo cubre siete idiomas, con inglés y alemán como lenguas principales, y añade controles de estilo explícitos que no estaban en la versión V1.

La arquitectura se apoya en cuatro predictores de codebook causales: CB0 genera audio semántico y duración a partir del texto, mientras que CB1–CB3, progresivamente más pequeños, añaden detalle acústico. El texto hablado se tokeniza a nivel de carácter, con codificaciones BPE compactas para los controles de idioma y estilo. La versión 1.1 incorpora cinco deslizadores de estilo (velocidad, pausas, entonación, tono y articulación), un adaptador VibeVoice que refina el audio decodificado y un build de 4 bits.

El modelo no es un checkpoint `AutoModelForCausalLM` de uso directo: requiere el servidor de inferencia propio del proyecto (backend vLLM o lite) y su formato de entrada específico. Esta ficha describe la versión de precisión completa alojada en el repositorio principal, que sirve además como fuente para los builds cuantizados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal multi-codebook (4 predictores: CB0 semántico + CB1–CB3 acústicos), fine-tune sobre Qwen3 |
| Parametros totales | no disponible (repo de 6,3 GB en bf16; modelos base Qwen3-1.7B y Qwen3-0.6B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (generación de formato largo con contexto acotado, sin cifra publicada) |
| Tipos de cuantizacion | bf16 (este repo), int4 (repo separado), int8 (construible con `tontaube quantize`) |
| Idiomas soportados | en, de, es, fr, it, nl, pt |
| Licencia | tontaube-community-model-license-1.0 (licencia propia, categoría "other") |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una pila de cuatro predictores de codebook causales que descomponen la generación de voz en etapas. CB0 produce audio semántico y duración a partir del texto de entrada; CB1, CB2 y CB3, de tamaño decreciente, refinan progresivamente el detalle acústico hasta la señal final. El texto se tokeniza a nivel de carácter, y los controles de idioma y estilo se codifican con BPE compacto. Sobre la decodificación se aplica un adaptador VibeVoice que refina el audio resultante, novedad introducida en la versión 1.1.

El modelo parte de Qwen/Qwen3-1.7B y Qwen/Qwen3-0.6B como modelos base, según los metadatos del repositorio, y se distribuye como fine-tune. No se especifican en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO. La generación semántica usa por defecto temperatura de muestreo 0,7 y penalización de frecuencia 0,1; temperaturas más bajas favorecen la corrección textual y más altas una entrega más variada y expresiva. La inferencia se sirve mediante el backend vLLM del servidor propio del proyecto.

## Capacidades

- Síntesis de voz multilingüe en inglés, alemán, español, francés, italiano, neerlandés y portugués.
- Clonación de voz zero-shot a partir de 5–60 segundos de audio de referencia limpio y de un solo hablante.
- Voces sintéticas incluidas de fábrica, además de la clonación.
- Tres estilos públicos de habla: `audiobook`, `conversational` y `agentic`.
- Cinco deslizadores de estilo: `rate` (0–4), `pause` (0–4), `pitch_range` (0–5), `pitch_level` (0–4) y `legato` (0–2).
- Generación de formato largo con contexto acotado.
- Salida en WAV y streaming de baja latencia en MP3 u Opus.
- Verbalizador opcional de texto en inglés, distribuido por separado (`TontaubeAI/TontaubeV1-Verbalizer`).
- Normalización automática de nivel en referencias de voz muy silenciosas o muy altas antes de la codificación.

## Casos de uso

- Audiolibros y narración de formato largo: el estilo `audiobook` junto con la generación de contexto acotado permite sintetizar capítulos completos manteniendo consistencia de voz, y los deslizadores `rate` y `pause` ajustan la cadencia de narración.
- Asistentes conversacionales por voz: el estilo `conversational` y el streaming en MP3/Opus de baja latencia encajan en pipelines de diálogo en tiempo real donde la primera respuesta debe empezar a sonar antes de completarse.
- Agentes de voz automatizados: el estilo `agentic` está pensado para respuestas de agentes; combinado con `legato` en pasos 0–1 se obtiene una articulación más nítida y pausas más cortas, útil en turnos breves.
- Clonación de voz para locución de marca: con 5–60 segundos de referencia se replica una voz concreta para generar variaciones de un mismo guion sin regrabar al locutor.
- Localización de contenido audiovisual: un mismo texto puede sintetizarse en los siete idiomas soportados para doblaje o subtitulado hablado, ajustando `pitch_level` y `rate` por idioma.
- Prototipado de interfaces de voz en GPU de consumo: la variante int4 de 1,8 GB permite ejecutar el modelo en GPUs pequeñas y en CPU para demos y pruebas de integración antes de desplegar la versión bf16.
- Generación de material accesible: conversión de documentos a audio con control fino de pausas y velocidad para distintos perfiles de oyentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El backend vLLM del servidor de inferencia exige una GPU NVIDIA con al menos 24 GiB de memoria para los pesos bf16 de este repositorio (6,3 GB de descarga).
- La variante `TontaubeV1.1-int4` (1,8 GB) está pensada para GPUs pequeñas y CPU; es la opción por defecto del servidor cuando no se activa `TTS_BACKEND=vllm`.
- GPU recomendadas: no se detallan modelos concretos (A100, H100, RTX 4090, etc.) en la información disponible; el requisito publicado es el mínimo de 24 GiB para vLLM.
- Despliegue: servidor de inferencia propio del repositorio `craitech/tontaube` (rama `v1.1.0`), con backend vLLM o backend lite; se mencionan instrucciones para interfaz de navegador y Docker, pero no integración directa con llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el modelo declara streaming de baja latencia en MP3/Opus pero sin cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TontaubeV1.1 | no disponible (base Qwen3-1.7B/0.6B) | no disponible | 7 | tontaube-community-model-license-1.0 | Hugging Face + servidor propio |
| TontaubeV1.1-int4 | misma arquitectura, cuantizado | no disponible | 7 | tontaube-community-model-license-1.0 | Hugging Face |
| TontaubeV1 | no disponible | no disponible | no disponible | no disponible | Hugging Face (versión previa) |

No se dispone en la información proporcionada de datos de otros modelos TTS comparables (parámetros, contexto, rendimiento o licencia) para establecer una comparación con alternativas de la misma categoría.

## Limitaciones y advertencias

- No es un checkpoint `AutoModelForCausalLM` de uso directo: requiere el servidor de inferencia Tontaube y su formato de entrada; no funciona como un modelo transformers estándar.
- Licencia propia (`tontaube-community-model-license-1.0`) de categoría "other": es imprescindible revisar el texto completo en el repositorio antes de cualquier uso comercial, ya que no se detallan aquí las restricciones.
- La clonación de voz plantea riesgos de suplantación y uso indebido; la model card no documenta salvaguardas, filtros de consentimiento ni marcas de agua en el audio generado.
- El modelo está orientado principalmente a inglés y alemán; el rendimiento en español, francés, italiano, neerlandés y portugués no está cuantificado en la información disponible.
- Riesgo de alucinación o errores de pronunciación en textos con nombres propios, siglas o dominios especializados; el verbalizador opcional en inglés puede mitigar parte de estos casos, pero solo cubre inglés.
- La clonación requiere referencias limpias y de un solo hablante de 5–60 segundos; referencias ruidosas o con varios hablantes degradan el resultado.
- La temperatura de muestreo afecta a la fidelidad textual: valores altos pueden producir una entrega más expresiva pero menos fiel al texto de entrada.
- El repositorio no registra descargas ni interacciones en el momento de la consulta, por lo que no hay evidencia pública de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TontaubeAI/TontaubeV1.1
- Variante int4: https://huggingface.co/TontaubeAI/TontaubeV1.1-int4
- Verbalizador inglés: https://huggingface.co/TontaubeAI/TontaubeV1-Verbalizer
- Licencia: https://huggingface.co/TontaubeAI/TontaubeV1.1/blob/main/LICENSE
- Informe técnico de TontaubeV1: https://tontaube.ai/papers/tontaube-v1-technical-report.pdf
- Playground: https://tontaube.ai/playground
- Repositorio de inferencia: https://github.com/craitech/tontaube
