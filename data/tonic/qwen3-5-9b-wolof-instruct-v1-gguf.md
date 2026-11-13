# Tonic/Qwen3.5-9B-Wolof-Instruct-v1-GGUF

## Resumen

Qwen3.5-9B-Wolof-Instruct-v1-GGUF es la exportación en formato GGUF del modelo Tonic/Qwen3.5-9B-Wolof-Instruct-v1, un ajuste fino de la familia Qwen3.5 orientado a la instrucción en wolof. Lo publica el usuario Tonic en Hugging Face y está pensado para su uso con llama.cpp y entornos compatibles con GGUF, lo que facilita la inferencia local y el despliegue en hardware modesto. El modelo base cuenta con 8.984.596.992 parámetros (aproximadamente 9 mil millones), lo que lo sitúa en la gama media de modelos densos.

La relevancia de esta ficha radica en que cubre un idioma de bajos recursos como el wolof, hablado principalmente en Senegal, y lo hace sobre una arquitectura moderna de la familia Qwen3.5. Al ofrecerse en cuantizaciones GGUF (F16, Q8_0, Q5_K_M, Q4_K_M y Q4_0), permite ejecutar el modelo en GPUs de consumo y en CPU, algo poco habitual en modelos ajustados para lenguas africanas.

No obstante, la información pública disponible es muy limitada: la model card es mínima, no se detallan datos de entrenamiento, licencia ni benchmarks, y el repositorio tiene cero descargas y cero likes en el momento de la consulta. Esta ficha refleja únicamente lo que puede verificarse a partir de los metadatos y la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5; detalles no disponibles) |
| Parametros totales | 8.984.596.992 (~9B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | F16, Q8_0, Q5_K_M, Q4_K_M, Q4_0 |
| Idiomas soportados | Wolof (objetivo del ajuste); lista completa no disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF (librería llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de la familia Qwen3.5, una arquitectura transformer densa de aproximadamente 9 mil millones de parámetros. El repositorio GGUF es una cuantización del modelo base Tonic/Qwen3.5-9B-Wolof-Instruct-v1, que a su vez deriva de un Qwen3.5-9B ajustado para instrucciones en wolof. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o SFT.

La model card no documenta innovaciones técnicas específicas más allá del proceso estándar de cuantización GGUF para llama.cpp. Se desconoce si el ajuste incluyó datos multilingües, si se preservaron las capacidades originales del modelo Qwen3.5 o si se aplicó algún tipo de poda o destilación. Tampoco se indica la longitud de contexto soportada ni si se extendió respecto al modelo original.

## Capacidades

- Generación de texto conversacional en wolof, orientada a instrucciones.
- Hereda las capacidades del modelo base Qwen3.5-9B, aunque no se documenta en qué medida se preservan tras el ajuste.
- Soporte de tool calling y function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: el objetivo declarado es el wolof; el resto de idiomas no está especificado.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Compatible con endpoints (tag `endpoints_compatible`) y con llama.cpp.

## Casos de uso

- Asistentes conversacionales en wolof: el modelo puede gestionar diálogos multi-turno en este idioma, útil para servicios de atención ciudadana o información pública en Senegal.
- Traducción y adaptación de contenidos: puede emplearse para generar o adaptar textos del francés o inglés al wolof, aunque no se documenta la calidad de la traducción inversa.
- Educación y alfabetización digital: generación de material didáctico y respuestas a preguntas frecuentes en wolof para plataformas educativas.
- Despliegue local en hardware modesto: gracias a las cuantizaciones Q4_K_M y Q4_0, puede ejecutarse en GPUs de consumo o en CPU mediante llama.cpp, lo que facilita su uso en entornos con recursos limitados.
- Investigación en lenguas de bajos recursos: sirve como base para experimentos de evaluación y ajuste en wolof, así como para comparar con otros modelos multilingües.
- Prototipado rápido con llama-cli: la model card incluye un ejemplo de invocación directa (`llama-cli -hf ... -p "Salaam aleekum, naka nga def?"`), lo que permite probar el modelo en minutos.
- Integración en pipelines de generación de texto: al ser compatible con endpoints, puede conectarse a servicios de inferencia que acepten GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (9B parámetros):
  - F16: ~18 GB.
  - Q8_0: ~9,5 GB.
  - Q5_K_M: ~6,5 GB.
  - Q4_K_M: ~5,5 GB.
  - Q4_0: ~5 GB.
- GPU recomendadas: A100 o H100 para F16; RTX 4090 (24 GB) para F16 o Q8_0; RTX 3090/4080 (16-24 GB) para Q8_0; RTX 3060/4060 Ti (8-12 GB) para Q4_K_M y Q4_0.
- Cabe en GPU de consumo: sí, con cuantizaciones Q4_K_M y Q4_0 en GPUs de 8 GB o más; también puede ejecutarse en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama (previa conversión o importación), y servidores compatibles con GGUF. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que su uso requeriría los pesos originales en safetensors.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Tonic/Qwen3.5-9B-Wolof-Instruct-v1-GGUF | ~9B | No disponible | No disponible | GGUF | Ajuste en wolof, cuantizaciones múltiples |
| Qwen3.5-9B (base) | ~9B | No disponible | No disponible | Safetensors/GGUF | Modelo original multilingüe |
| Otros ajustes en wolof | No disponible | No disponible | No disponible | No disponible | No se dispone de comparativas publicadas |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- La model card es mínima: no se documentan datos de entrenamiento, licencia ni evaluación, lo que dificulta valorar su calidad y su uso comercial.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se ha evaluado en este ajuste.
- Sesgos conocidos: no documentados; el ajuste en un idioma específico puede introducir sesgos culturales o lingüísticos no medidos.
- Limitaciones de contexto e idioma: se desconoce la longitud de contexto y el grado de preservación de otros idiomas distintos del wolof.
- Restricciones de licencia: al no indicarse licencia, no puede asumirse su uso comercial sin consultar al autor.
- El repositorio tiene cero descargas y cero likes, lo que sugiere que no ha sido validado por la comunidad.
- La fecha de creación (2026-11-13) es futura respecto a la mayoría de referencias, lo que puede indicar metadatos inconsistentes.

## Enlaces

- Hugging Face: https://huggingface.co/Tonic/Qwen3.5-9B-Wolof-Instruct-v1-GGUF
- Modelo base: https://huggingface.co/Tonic/Qwen3.5-9B-Wolof-Instruct-v1
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Resultados de búsqueda web no relevantes (Tonic App, eau tonique, ToNIC): no aportan información sobre el modelo.
