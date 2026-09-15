# TDAsistani/tda-qwen-3b-v2

## Resumen

TDA (Türk Dünyası Asistanı Anka) 3B v2 es un ajuste fino (fine-tuning) del modelo Qwen/Qwen2.5-3B-Instruct publicado por el usuario TDAsistani en HuggingFace. Se trata de un modelo de generación de texto en turco orientado a conversación general y a temáticas de historia y cultura del mundo túrquico, según declara el propio autor en la model card. No es un modelo entrenado desde cero: parte de la arquitectura y los pesos del Qwen2.5-3B-Instruct y los adapta mediante LoRA.

El ajuste se ha realizado con la librería Unsloth y cuantización de 4 bits durante el entrenamiento, con una configuración LoRA de rango 16 y alpha 16. El repositorio ocupa aproximadamente 0,1 GB, lo que es coherente con la publicación de adaptadores o pesos ya fusionados de un modelo de 3B parámetros. La licencia es Apache 2.0, heredada del modelo base.

Su relevancia es limitada y muy específica: se trata de un modelo de nicho, con 0 descargas y 0 «likes» en el momento de la consulta, pensado para un público turcohablante interesado en asistencia conversacional temática. No compite en capacidades generales con modelos frontera ni con las versiones mayores de Qwen2.5; su interés principal es como ejemplo de ajuste ligero con LoRA y Unsloth sobre una base pequeña y como asistente especializado en un dominio cultural concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base Qwen2.5-3B-Instruct) |
| Parametros totales | 3B (aproximadamente 3.000 millones; valor indicado en el nombre del modelo) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No especificada en la model card; el ejemplo de inferencia usa max_seq_length = 2048. El modelo base Qwen2.5-3B-Instruct soporta 32.768 tokens (ampliable a 131.072 con YaRN) |
| Tipos de cuantizacion | Entrenamiento con cuantizacion de 4 bits (Unsloth); no se enumeran formatos de cuantizacion publicados para inferencia |
| Idiomas soportados | Turco (tr) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (etiqueta del repositorio) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen2.5-3B-Instruct: un transformer decoder-only con atención causal estándar, diseñado para instrucciones y conversación. Sobre esa base, TDAsistani aplicó un ajuste fino mediante LoRA con rango r=16 y alpha=16, utilizando Unsloth para acelerar el entrenamiento y la cuantización de 4 bits. No se detalla en la model card el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases adicionales de RLHF o DPO sobre el ajuste.

La innovación técnica declarada se limita al uso del flujo de trabajo de Unsloth combinado con LoRA sobre una base ya instruida. No se mencionan técnicas como decodificación especulativa, atención lineal ni arquitecturas híbridas SSM. Tampoco se publican hiperparámetros completos, recetas de datos ni curvas de entrenamiento, por lo que la reproducibilidad del ajuste es baja con la información disponible.

## Capacidades

- Generación de texto conversacional en turco, orientada a diálogo multi-turno mediante plantilla de chat (apply_chat_template).
- Asistencia temática sobre historia y cultura del mundo túrquico, según la descripción del autor.
- Conversación general (el autor menciona «genel sohbet kabiliyetleri», es decir, habilidades de charla general).
- Capacidad de seguir instrucciones heredada del Qwen2.5-3B-Instruct (formato instruct).
- Soporte de tool calling / function calling: no disponible en la información proporcionada (el modelo base Qwen2.5-3B-Instruct sí lo soporta, pero no se confirma que el ajuste lo preserve).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: solo se declara turco; no se confirma soporte de otros idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Asistencia conversacional en turco para consultas generales: el modelo puede mantener diálogos multi-turno usando la plantilla de chat, adecuado para prototipos de chatbot en turco con presupuesto de cómputo reducido.
- Divulgación de historia y cultura túrquica: dado su enfoque declarado, sirve para generar respuestas o materiales introductorios sobre temáticas culturales del mundo túrquico, siempre con revisión humana por riesgo de imprecisión histórica.
- Chatbot educativo para estudiantes turcohablantes: con 3B parámetros puede desplegarse en hardware modesto y responder preguntas de carácter general como apoyo en entornos de aprendizaje.
- Generación de contenido en turco: redacción de borradores, resúmenes o textos breves en turco donde no se requiera máxima calidad, sino un modelo ligero y local.
- Integración como backend ligero en aplicaciones móviles o de escritorio con recursos limitados: su tamaño permite ejecutarlo en GPUs de gama media o incluso en CPU con cuantización, si se generan los pesos adecuados.
- Investigación sobre ajuste fino con LoRA y Unsloth: sirve como caso de estudio reproducible de cómo adaptar un modelo de 3B a un dominio e idioma concretos con recursos reducidos.
- Base para nuevos ajustes en turco: al ser un modelo Apache 2.0 sobre Qwen2.5, puede reutilizarse como punto de partida para fine-tunings posteriores en dominios específicos turcohablantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16, en torno a 6-7 GB para un modelo de 3B parámetros; en cuantización de 4 bits, aproximadamente 2-3 GB. Son estimaciones orientativas basadas en el tamaño del modelo, no cifras publicadas por el autor.
- GPU recomendadas: para FP16, una GPU con 8 GB o más (RTX 3060 12 GB, RTX 4070, RTX 4090, A10, L4). Para 4 bits, una GPU con 4-6 GB es suficiente.
- Compatibilidad con GPU de consumo: sí, cabe en tarjetas de consumo como RTX 3060, RTX 4060, RTX 4070 o RTX 4090, especialmente con cuantización.
- Opciones de despliegue: la model card muestra inferencia con transformers y Unsloth. También son viables llama.cpp, Ollama, vLLM o TGI, aunque el autor no los menciona ni publica pesos en formato GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TDAsistani/tda-qwen-3b-v2 | 3B | No especificado (base: 32.768 tokens) | Sin benchmarks publicados | Apache 2.0 | HuggingFace |
| Qwen/Qwen2.5-3B-Instruct (modelo base) | 3B | 32.768 tokens (ampliable con YaRN) | Benchmarks publicados por el equipo de Qwen | Apache 2.0 | HuggingFace |
| Otros modelos de 3B comparables (Llama-3.2-3B-Instruct, Phi-3.5-mini) | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks del ajuste que permitan una comparación de rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- No se han publicado benchmarks ni evaluaciones independientes, por lo que se desconoce su calidad real frente al modelo base.
- Riesgo de alucinación: al ser un ajuste de un modelo de 3B, especialmente en temáticas históricas y culturales, puede generar afirmaciones falsas con apariencia de verosimilitud.
- Sesgos conocidos: no disponibles; no se documenta ningún análisis de sesgo.
- Limitación de idioma: solo se declara turco, por lo que el rendimiento en castellano u otros idiomas no está garantizado y probablemente degradado.
- Contexto limitado: la model card no confirma la ventana de contexto efectiva tras el ajuste; el ejemplo usa 2048 tokens, lo que puede ser insuficiente para tareas de contexto largo.
- Soporte de tool calling y agentes no confirmado, a pesar de que el modelo base lo ofrece.
- Reproducibilidad baja: no se detallan dataset, número de tokens de entrenamiento ni hiperparámetros completos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se deben respetar las condiciones de la licencia del modelo base Qwen2.5 y citar adecuadamente.
- Para producción, se recomienda validación humana, especialmente en contenidos históricos o culturales, y pruebas específicas del dominio antes de desplegar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TDAsistani/tda-qwen-3b-v2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Repositorio de recursos citado en la model card (logo/recursos del autor): https://github.com/tdaresmi/tda-releases
- Paper, blog o demo adicionales: no disponible (la búsqueda web no devolvió resultados relevantes sobre este modelo).
