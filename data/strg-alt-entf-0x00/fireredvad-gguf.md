# Strg-Alt-Entf-0x00/FireRedVAD-GGUF

## Resumen

FireRedVAD-GGUF es un conjunto de modelos de detección de actividad de voz (VAD) y detección de eventos de audio (AED) convertidos al formato GGUF, basados en el modelo FireRedVAD desarrollado por FireRedTeam. Estos modelos permiten detectar presencia de voz, así como clasificar eventos de audio como habla, música o canto, en más de 100 idiomas. La conversión a GGUF facilita la inferencia multiplataforma y la cuantización, ofreciendo opciones desde FP32 hasta INT8 per-channel, lo que permite desplegar el modelo en entornos con recursos limitados sin sacrificar precisión.

El modelo original utiliza una arquitectura DFSMN (Deep Feed-forward Sequential Memory Network), con solo 588 931 parámetros, lo que lo hace extremadamente ligero y adecuado para aplicaciones en tiempo real. La versión GGUF incluye tres variantes: VAD en streaming (causal, baja latencia), VAD estándar (bidireccional, mayor precisión) y AED multiclase. La cuantización INT8 per-channel (INT8-CH) es la recomendada por el autor, ya que mantiene un error medio absoluto inferior a 0,001 y una relación señal-ruido de cuantización superior a 59 dB, muy cercana a la precisión FP32.

Este repositorio es especialmente relevante para desarrolladores que necesitan integrar detección de voz y eventos de audio en aplicaciones de producción, ya que ofrece modelos listos para usar con un tamaño mínimo (entre 574 KB y 2,36 MB) y una licencia permisiva Apache-2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFSMN (Deep Feed-forward Sequential Memory Network) |
| Parametros totales | 588 931 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (procesamiento de audio, tramas de 10 ms) |
| Tipos de cuantizacion | FP32, INT16, INT8, INT8 per-channel (INT8-CH) |
| Idiomas soportados | Multilingue (mas de 100 idiomas para AED) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (los pesos originales estan en safetensors) |

## Arquitectura y entrenamiento

FireRedVAD se basa en una red DFSMN, una arquitectura de memoria secuencial feed-forward profunda diseñada específicamente para tareas de procesamiento de audio en tiempo real. El modelo procesa señales de audio en tramas de 10 ms, lo que permite una detección de baja latencia. La variante de streaming es completamente causal, es decir, no requiere contexto futuro, mientras que la variante estándar utiliza contexto bidireccional (lookback y lookahead) para lograr mayor precisión en procesamiento por lotes.

El entrenamiento original del modelo FireRedVAD fue realizado por FireRedTeam, aunque en la información disponible no se detallan los datos de entrenamiento específicos (número de horas de audio, composición del dataset, técnicas de entrenamiento como RLHF o DPO, etc.). La conversión a GGUF realizada por Strg-Alt-Entf-0x00 incluye metadatos completos en cada archivo, como estadísticas CMVN (normalización de características), configuración de la arquitectura (capas, tamaño oculto, filtros) y las escalas de cuantización por tensor. La cuantización INT8 per-channel asigna un factor de escala por canal de salida, lo que corrige la alta varianza en la distribución de pesos típica de las arquitecturas DFSMN y mantiene una precisión cercana a FP32.

## Capacidades

- Detección de actividad de voz (VAD) en streaming y no streaming, con procesamiento de tramas de 10 ms.
- Detección de eventos de audio (AED) multiclase: clasificación simultánea de habla, música y canto en más de 100 idiomas.
- Compatibilidad con audio multilingüe, útil para aplicaciones globales de transcripción y análisis de audio.
- Baja latencia en modo streaming gracias a su diseño causal, adecuado para aplicaciones en tiempo real.
- Cuantización flexible con cuatro niveles de precisión (FP32, INT16, INT8, INT8-CH) para adaptarse a distintos requisitos de memoria y velocidad.
- Formato GGUF autocontenido con metadatos de arquitectura y normalización, lo que facilita la integración en motores de inferencia personalizados.
- Capacidad de ejecución en CPU sin necesidad de GPU, gracias al reducido tamaño del modelo.

## Casos de uso

- Preprocesamiento para sistemas de reconocimiento de voz (ASR): el VAD puede filtrar segmentos de silencio antes de enviar el audio al modelo ASR, reduciendo costes computacionales y mejorando la precisión. Su baja latencia permite integrarlo en pipelines de transcripción en tiempo real.
- Moderación de contenido en plataformas de streaming: el AED puede detectar si un segmento de audio contiene música, habla o canto, lo que permite aplicar políticas de derechos de autor o clasificar contenido automáticamente.
- Asistentes de voz en dispositivos embebidos: al ocupar menos de 1 MB en cuantización INT8, puede ejecutarse en microcontroladores o Raspberry Pi para activar asistentes por voz sin depender de la nube.
- Análisis de llamadas en centros de atención al cliente: el VAD estándar, con su mayor precisión (97,57 % F1 en FLEURS-VAD-102), permite segmentar conversaciones telefónicas para su posterior análisis de sentimiento o extracción de información.
- Videovigilancia inteligente: el AED detecta eventos sonoros relevantes (habla, música) en grabaciones de cámaras, ayudando a priorizar alertas o a indexar material audiovisual.
- Aplicaciones de accesibilidad: el VAD en streaming puede activar subtítulos automáticos en tiempo real, detectando cuándo una persona comienza a hablar y ajustando la transcripción sin retrasos perceptibles.
- Sistemas de conferencia y videollamadas: la detección de actividad de voz permite activar o desactivar micrófonos automáticamente, mejorando la calidad del audio y reduciendo el ruido de fondo.

## Benchmarks y rendimiento

El autor del repositorio GGUF no ha publicado benchmarks comparativos con otros modelos, pero sí proporciona el rendimiento del VAD estándar sobre el conjunto de datos FLEURS-VAD-102:

| Modelo | Dataset | Metrica | Valor |
|---|---|---|---|
| VAD estandar (bidireccional) | FLEURS-VAD-102 | F1 | 97,57 % |

Además, se incluyen métricas de calidad de cuantización para cada variante y nivel de precisión:

| Cuantizacion | MAE vs FP32 | SQNR (dB) |
|---|---|---|
| INT8 | 0,001918 (stream) / 0,001957 (vad/aed) | 50,4-50,5 |
| INT8-CH | 0,000985 | 59,4 |
| INT16 | 0,000077-0,000079 | 94,2 |
| FP32 | 0,0 | Infinito |

No se han publicado resultados de benchmarks comparativos con modelos VAD alternativos en la información disponible.

## Requisitos de hardware

- El modelo es extremadamente ligero: los archivos GGUF pesan entre 574 KB (INT8) y 2,36 MB (FP32). La memoria necesaria para la inferencia es inferior a 3 MB en cualquier configuración.
- Puede ejecutarse en CPU sin necesidad de GPU. Incluso en procesadores de bajo consumo como los de Raspberry Pi o dispositivos móviles.
- Para GPU, cualquier tarjeta moderna (incluso integradas) es suficiente; la VRAM requerida es despreciable (menos de 10 MB).
- El repositorio de conversión (https://github.com/Strg-Alt-Entf-0x00/firered-vad) incluye un motor de inferencia en PyTorch y una biblioteca en C++, además de soporte para integración como submódulo de git o paquete Python.
- No se requieren herramientas específicas de LLM como vLLM u Ollama; el modelo se ejecuta con el motor de inferencia propio del repositorio o mediante cargas directas de los archivos GGUF.
- La latencia estimada es de 10 ms por trama en modo streaming, lo que permite procesamiento en tiempo real incluso en hardware modesto.

## Comparativa con modelos similares

No se dispone de información sobre modelos VAD comparables en la documentación proporcionada. FireRedVAD se presenta como una solución de grado industrial, pero no se han incluido comparativas con alternativas como Silero VAD, WebRTC VAD u otros modelos de detección de eventos de audio.

## Limitaciones y advertencias

- No se han documentado sesgos específicos del modelo en la información disponible. Sin embargo, al tratarse de un modelo entrenado con datos multilingües, es posible que el rendimiento varíe según el idioma o el acento.
- El modelo puede presentar errores de detección en condiciones de ruido extremo o con solapamiento de voces, aunque no se han cuantificado estos escenarios en la documentación.
- La variante de streaming (causal) tiene una precisión ligeramente inferior a la estándar (bidireccional) debido a la falta de contexto futuro.
- La cuantización INT8 per-tensor (no per-channel) muestra un MAE mayor (0,0019 frente a 0,0009) y puede degradar la precisión en aplicaciones sensibles; se recomienda usar INT8-CH.
- La licencia Apache-2.0 permite uso comercial sin restricciones, pero se debe atribuir el crédito correspondiente al modelo original (FireRedTeam) y a la conversión (Strg-Alt-Entf-0x00).
- El formato GGUF está pensado para inferencia; para reentrenamiento o fine-tuning es necesario usar los pesos originales en safetensors (disponibles en el repositorio base).

## Enlaces

- Repositorio HuggingFace de la conversión GGUF: https://huggingface.co/Strg-Alt-Entf-0x00/FireRedVAD-GGUF
- Repositorio de herramientas de conversión e inferencia: https://github.com/Strg-Alt-Entf-0x00/firered-vad
- Repositorio original de FireRedVAD: https://github.com/FireRedTeam/FireRedVAD
- Modelo original en HuggingFace: https://huggingface.co/FireRedTeam/FireRedVAD
- Modelo en ModelScope: https://www.modelscope.cn/models/xukaituo/FireRedVAD/
- Paper (referenciado en el repositorio original): no se ha proporcionado un enlace directo, pero se menciona en el README del proyecto original.
