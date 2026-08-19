# YC-Chen/TASTE2-2B-ZH

## Resumen

TASTE2-2B-ZH es un modelo de lenguaje hablado (spoken language model) desarrollado por YC-Chen, orientado a la síntesis de voz en chino mandarín. Está diseñado para aplicaciones de agentes de voz con capacidades full-duplex, lo que permite conversaciones bidireccionales en tiempo real. El modelo se distribuye bajo una licencia de uso exclusivo para investigación (taste2-research-only) y requiere aceptar condiciones de acceso en HuggingFace.

El nombre sugiere una arquitectura basada en el enfoque TASTE (no se proporcionan detalles adicionales), con aproximadamente 2 mil millones de parámetros. El repositorio incluye pesos en formato safetensors y ONNX, con un tamaño total de 24,1 GB. Actualmente solo soporta el idioma chino (zh), lo que lo hace específico para el mercado hispanohablante solo como referencia técnica, no como herramienta directa.

Su relevancia radica en la creciente demanda de modelos de voz de código abierto para construir asistentes conversacionales en chino, aunque su licencia restrictiva limita su uso a entornos de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | ~2 mil millones (por nombre) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se incluyen safetensors y ONNX) |
| Idiomas soportados | chino (zh) |
| Licencia | taste2-research-only |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo (si es un transformer, un modelo de difusion, o una arquitectura hibrida), ni sobre los datos de entrenamiento (volumen de tokens, composicion del dataset, tecnicas de alineacion como RLHF o DPO). Los tags indican que se trata de un "spoken language model" con soporte full-duplex, lo que sugiere un diseño pensado para procesar y generar audio de forma continua y bidireccional, pero los detalles tecnicos no estan publicados en la informacion proporcionada.

## Capacidades

- Sintesis de voz en chino mandarin (text-to-speech).
- Soporte de comunicacion full-duplex, lo que permite conversaciones simultaneas en ambos sentidos (habla y escucha a la vez).
- Orientado a agentes de voz, con potencial para integracion en sistemas de dialogo en tiempo real.
- No se han documentado capacidades adicionales como tool calling, razonamiento multimodal o generacion de codigo, ya que es un modelo especializado en audio.

## Casos de uso

- Asistentes de voz en chino para centros de atencion al cliente: el modelo podria generar respuestas habladas naturales en tiempo real, aunque la licencia de investigacion limita su despliegue comercial.
- Prototipos de agentes conversacionales full-duplex: su capacidad bidireccional permite experimentar con interrupciones y turnos de habla solapados, algo clave en interacciones humanas.
- Investigacion en modelos de lenguaje hablado: util para estudiar la generacion de voz con contexto largo o la integracion de audio y texto en un mismo modelo.
- Sistemas de doblaje automatico para contenido en chino: podria generar locuciones para videos o audiolibros, sujeto a la licencia.
- Entornos educativos de aprendizaje de idiomas: generar ejemplos de pronunciacion o conversaciones simuladas en chino.
- Desarrollo de interfaces de voz para hardware embebido: su tamano de 2B podria ser viable en dispositivos con suficiente memoria, aunque no hay datos de latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Tamano del repositorio: 24,1 GB, lo que sugiere pesos en precision completa (fp32) o BF16. Con cuantizacion a 8 bits se estima una huella de memoria de unos 6-8 GB (estimacion no confirmada).
- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de 2B en fp16 se requieren aproximadamente 4-6 GB, pero el peso real del repo indica que podria ser mayor.
- GPU recomendadas: no disponible; se podria probar en GPUs consumer como RTX 3090 o RTX 4090 con cuantizacion, pero sin datos oficiales.
- Opciones de despliegue: no se mencionan integraciones con vLLM, llama.cpp u Ollama; al ser un modelo de audio, es probable que requiera un pipeline especifico.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (spoken language models full-duplex en chino). Alternativas generales de TTS como VITS o Bark no son directamente comparables por su enfoque distinto. Se indica "no disponible".

## Limitaciones y advertencias

- Licencia restringida a investigacion (taste2-research-only): prohibido su uso comercial sin autorizacion explicita.
- Acceso gated: requiere aceptar condiciones en HuggingFace, lo que limita la reproducibilidad.
- Solo soporta chino (zh): no apto para otros idiomas sin adaptacion.
- No hay informacion sobre sesgos, alucinaciones o calidad de la voz en diferentes acentos o registros.
- Sin datos de rendimiento ni benchmarks, no se puede evaluar su calidad frente a otros modelos TTS.
- El tamano del repositorio (24,1 GB) sugiere que podria requerir hardware significativo para inferencia en tiempo real, lo que dificulta su uso en entornos de produccion ligeros.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/YC-Chen/TASTE2-2B-ZH
- No se han encontrado papers, blogs o repositorios adicionales en la informacion proporcionada.
