# speakleash/Bielik-11B-v2.6-Instruct-NVFP4

## Resumen

Bielik-11B-v2.6-Instruct-NVFP4 es una versión cuantizada en formato NVFP4 del modelo Bielik-11B-v2.6-Instruct, desarrollado por SpeakLeash, una comunidad polaca centrada en la creación de modelos de lenguaje de código abierto con especial énfasis en el idioma polaco. El modelo base es un transformer decoder-only de 11.168.796.672 parámetros (aproximadamente 11,17 mil millones) entrenado para instrucciones y conversación, con soporte para polaco e inglés.

Esta variante NVFP4 aplica cuantización de pesos y activaciones a 4 bits en coma flotante (FP4) mediante un proceso de calibración AWQ con escalado por canal, seguido de rangos de pesos FP4 expandidos por MSE y tamaño de grupo 16. El objetivo es reducir el espacio en disco y los requisitos de memoria para inferencia, manteniendo el tokenizador y la plantilla de chat originales. El repositorio ocupa 6,7 GB, lo que supone una reducción significativa frente a los pesos en precisión completa.

La relevancia de esta ficha radica en que permite desplegar un modelo de 11B en hardware con memoria limitada, especialmente en GPUs con soporte para FP4 (arquitecturas Blackwell de NVIDIA). La licencia Apache 2.0 facilita su uso comercial, y el soporte bilingüe polaco-inglés lo hace útil para aplicaciones dirigidas al mercado centroeuropeo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama, segun tag `llama`) |
| Parametros totales | 11.168.796.672 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (pesos y activaciones FP4); variante NVFP4A16 con activaciones de 16 bits; grupo de tamaño 16 |
| Idiomas soportados | polaco (pl), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, `compressed-tensors`, 8-bit (segun metadatos) |

## Arquitectura y entrenamiento

El modelo base Bielik-11B-v2.6-Instruct es un transformer decoder-only de aproximadamente 11,17 mil millones de parámetros, etiquetado en Hugging Face dentro de la familia `llama`. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo base.

La versión NVFP4 se ha generado mediante un proceso de cuantización post-entrenamiento: calibración con AWQ (escalado por canal) seguida de rangos de pesos FP4 expandidos por MSE, con tamaño de grupo 16. La calibración utilizó 384 ejemplos con longitud máxima de secuencia de 2048 tokens. Se ofrecen dos variantes: NVFP4A16, que mantiene las activaciones en 16 bits, y NVFP4, que cuantiza también las activaciones a FP4. El tokenizador y la plantilla de chat originales se preservan, lo que facilita la compatibilidad con el modelo base. La revisión de origen del modelo base es `c4104c6c5b3c2b386bcf4cee4e16820373d3e742`.

## Capacidades

- Generación de texto conversacional e instruccional en polaco e inglés.
- Razonamiento general y respuesta a instrucciones (modelo etiquetado como Instruct).
- Soporte de plantilla de chat preservada del modelo base, apto para diálogo multi-turno.
- Capacidades multilingües limitadas a los dos idiomas declarados (pl, en).
- No se dispone de información sobre tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido en la información proporcionada.

## Casos de uso

- Asistente conversacional en polaco para atención al cliente: el modelo puede gestionar diálogos multi-turno gracias a la plantilla de chat preservada y a su naturaleza Instruct, adecuado para empresas que operan en el mercado polaco.
- Generación y resumen de documentación técnica bilingüe polaco-inglés: útil en equipos de desarrollo con documentación en ambos idiomas, aprovechando el soporte declarado de los dos idiomas.
- Despliegue en GPUs de consumo o estaciones de trabajo con memoria limitada: el formato NVFP4 y los 6,7 GB del repositorio permiten ejecutar un modelo de 11B en hardware que no podría alojar los pesos en FP16.
- Prototipado rápido de aplicaciones de PLN en polaco: la licencia Apache 2.0 y el formato safetensors facilitan la integración en pipelines experimentales sin restricciones comerciales.
- Clasificación y extracción de información en textos polacos: el modelo puede emplearse para tareas de comprensión lectora y extracción estructurada mediante prompting.
- Evaluación comparativa de técnicas de cuantización: esta variante NVFP4 sirve como referencia para medir la degradación de calidad frente al modelo base en tareas de generación e instrucción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 6,7 GB, por lo que los pesos en NVFP4 requieren al menos ese espacio; con overhead de activaciones y caché KV, se recomienda un mínimo de 8-10 GB de VRAM para contexto corto.
- GPU recomendadas: GPUs con soporte nativo de FP4, como las de arquitectura NVIDIA Blackwell; el formato NVFP4 puede no ser compatible con GPUs anteriores sin emulación o conversión.
- Cabe en GPU de consumo: sí, en modelos con 8 GB o más de VRAM siempre que exista soporte para el formato NVFP4; en GPUs sin soporte FP4 sería necesaria conversión a otro formato.
- Opciones de despliegue: no se especifican en la información proporcionada; el formato `compressed-tensors` sugiere compatibilidad con frameworks que soporten dicha librería (por ejemplo, vLLM), aunque no se confirma.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Bielik-11B-v2.6-Instruct-NVFP4 | 11,17 B | no disponible | Apache 2.0 | NVFP4 safetensors | Cuantizado 4-bit, pl/en |
| Bielik-11B-v2.6-Instruct | 11,17 B | no disponible | Apache 2.0 | safetensors (precisión completa) | Modelo base sin cuantizar |
| Bielik-11B-v2.6-Instruct-NVFP4A16 | 11,17 B | no disponible | Apache 2.0 | NVFP4A16 | Variante con activaciones 16-bit |

No se dispone de información sobre modelos comparables de otros autores en la información proporcionada.

## Limitaciones y advertencias

- La cuantización a FP4 puede degradar la calidad de generación respecto al modelo base; no se han publicado evaluaciones que cuantifiquen esta pérdida.
- El soporte lingüístico se limita a polaco e inglés; el rendimiento en otros idiomas no está garantizado.
- No se dispone de información sobre sesgos conocidos, riesgo de alucinación ni limitaciones de contexto del modelo base.
- El formato NVFP4 requiere hardware compatible; en GPUs sin soporte FP4 puede ser necesario convertir los pesos, con posible pérdida adicional de precisión.
- Aunque la licencia es Apache 2.0, se recomienda verificar las condiciones del modelo base y de los datos de calibración antes de uso comercial.
- No se han publicado benchmarks ni datos de throughput/latencia, lo que dificulta estimar el rendimiento en producción.

## Enlaces

- Hugging Face: https://huggingface.co/speakleash/Bielik-11B-v2.6-Instruct-NVFP4
- Modelo base: https://huggingface.co/speakleash/Bielik-11B-v2.6-Instruct
