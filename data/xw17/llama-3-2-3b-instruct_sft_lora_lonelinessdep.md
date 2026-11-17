# xw17/Llama-3.2-3B-Instruct_SFT_lora_lonelinessdep

## Resumen

`xw17/Llama-3.2-3B-Instruct_SFT_lora_lonelinessdep` es un ajuste fino (fine-tuning) supervisado mediante LoRA sobre el modelo base Llama 3.2 3B Instruct de Meta, publicado en Hugging Face por el usuario xw17. El nombre del repositorio sugiere que el ajuste se ha orientado a conversaciones relacionadas con la soledad (`lonelinessdep`), aunque el autor no documenta el dataset, el objetivo ni el procedimiento en la model card, que es la plantilla autogenerada por Hugging Face sin completar.

El modelo se distribuye en formato safetensors bajo la librería `transformers`, con un tamaño de repositorio de 0,1 GB. Este tamaño es coherente con un adaptador LoRA o con un checkpoint parcial, no con los pesos completos de un modelo de 3B parámetros en precisión de 16 bits, que ocuparían aproximadamente 6 GB. No se dispone de información sobre licencia, idiomas, pipeline ni datos de entrenamiento.

Su relevancia es limitada en el estado actual: no tiene descargas ni interacciones, carece de evaluación publicada y la documentación es inexistente. Resulta útil únicamente como ejemplo de adaptación de bajo rango sobre Llama 3.2 3B o como punto de partida para quien quiera reproducir un ajuste similar, no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Llama 3.2 3B Instruct; detalles del ajuste no disponibles) |
| Parametros totales | No disponible (el modelo base Llama 3.2 3B tiene 3,21 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la model card (el modelo base Llama 3.2 3B Instruct soporta 131.072 tokens) |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene safetensors) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura ni el procedimiento de entrenamiento. Por el identificador del repositorio se deduce que se parte de Llama 3.2 3B Instruct, un transformer decoder-only con atención por grupos (GQA) y tokenizador BPE de 128.256 entradas, y que se aplica un ajuste fino supervisado (SFT) con adaptadores LoRA. No se especifican rango, alpha, módulos objetivo, número de pasos, tasa de aprendizaje, composición del dataset ni si hubo etapas de preferencia (DPO/RLHF).

El tamaño del repositorio (0,1 GB) sugiere que se publican únicamente los pesos del adaptador, no el modelo fusionado. No hay información sobre tokens de entrenamiento, filtrado de datos ni evaluación posterior. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Llama 3.2 3B Instruct.
- Razonamiento básico, código y matemáticas a nivel de un modelo de 3B parámetros (sin evaluación específica del ajuste).
- Soporte de tool calling y function calling: no confirmado para este ajuste; el modelo base Instruct lo soporta en su formato oficial.
- Capacidades de agente y razonamiento multi-paso: no documentadas para este ajuste.
- Multilingüismo: no documentado; el modelo base cubre ocho idiomas oficiales (inglés, alemán, francés, italiano, portugués, hindi, español y tailandés).
- Modo de pensamiento (thinking), visión o audio: no disponible.
- Especialización declarada por el nombre: conversaciones sobre soledad y estado de ánimo; sin evidencia documentada de su eficacia.

## Casos de uso

- Prototipado de asistentes conversacionales sobre soledad: el ajuste puede emplearse para experimentar con respuestas empáticas en entornos de investigación, siempre que se valide su calidad con evaluaciones propias, dado que no hay métricas publicadas.
- Reproducción de experimentos de SFT con LoRA: sirve como referencia para estudiar cómo se comporta un adaptador de bajo rango sobre Llama 3.2 3B y comparar hiperparámetros.
- Base para un ajuste posterior: al ser un adaptador pequeño (0,1 GB), puede fusionarse con el modelo base y continuar el entrenamiento con datos propios y mejor documentados.
- Generación de diálogos sintéticos: útil para crear corpus de conversaciones sobre bienestar emocional que luego se filtren y revisen manualmente.
- Evaluación de riesgos en modelos pequeños: permite analizar cómo un ajuste temático sin documentación puede degradar la calidad general o introducir respuestas inadecuadas en dominios sensibles.
- Despliegue en local para pruebas: con 3B parámetros, el modelo fusionado cabe en GPUs de consumo con cuantización de 4 bits, lo que facilita experimentos sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia del modelo fusionado: aproximadamente 6,5 GB en FP16, unos 2 GB en cuantización de 4 bits y unos 3,5 GB en 8 bits.
- GPU recomendadas: RTX 3090, RTX 4090, A10G, L4 o A100 para FP16; RTX 3060 de 12 GB o superior para cuantización de 4 bits.
- Cabe en GPU de consumo: sí, el modelo fusionado en 4 bits entra en tarjetas con 6-8 GB de VRAM; el adaptador LoRA por sí solo no es ejecutable sin el modelo base.
- Opciones de despliegue: transformers con PEFT para cargar el adaptador; vLLM, TGI o llama.cpp/Ollama tras fusionar y convertir los pesos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| xw17/Llama-3.2-3B-Instruct_SFT_lora_lonelinessdep | 3,21 B (base) | No disponible (base: 131.072) | No disponible | Hugging Face, sin descargas |
| meta-llama/Llama-3.2-3B-Instruct | 3,21 B | 131.072 | Llama 3.2 Community License | Hugging Face, ampliamente usado |
| Qwen2.5-3B-Instruct | 3,09 B | 32.768 | Apache 2.0 | Hugging Face |
| Gemma-2-2B-it | 2,61 B | 8.192 | Gemma Terms of Use | Hugging Face |

El ajuste de xw17 no aporta datos de rendimiento que permitan compararlo objetivamente con estas alternativas; la comparación se limita a tamaño, contexto del modelo base y licencia.

## Limitaciones y advertencias

- Model card autogenerada y sin completar: no hay información sobre datos, hiperparámetros, evaluación ni uso previsto.
- Licencia no declarada: no se puede confirmar el uso comercial; además, el modelo base Llama 3.2 está sujeto a la Llama 3.2 Community License, cuyos términos se heredan.
- Riesgo de alucinación y de respuestas inadecuadas en un dominio sensible como la soledad o la salud mental; no hay evaluación de seguridad publicada.
- Posible degradación de capacidades generales tras el ajuste temático, sin métricas que lo cuantifiquen.
- Sin descargas ni validación por la comunidad: no hay evidencia de que el adaptador funcione correctamente ni de que esté completo.
- El repositorio contiene solo 0,1 GB, por lo que requiere cargar el modelo base por separado; no es un artefacto autónomo.
- Idiomas y cobertura multilingüe no verificados para el ajuste.
- No debe usarse como herramienta de apoyo psicológico sin supervisión profesional y validación clínica.

## Enlaces

- Hugging Face: https://huggingface.co/xw17/Llama-3.2-3B-Instruct_SFT_lora_lonelinessdep
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Paper de estimación de emisiones citado en la model card: https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental: https://mlco2.github.io/impact
