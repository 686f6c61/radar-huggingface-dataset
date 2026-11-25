# Srihari2020/TariffMind-Granite-3.3-2B-HS-GGUF

## Resumen

TariffMind es un modelo de clasificación arancelaria derivado de IBM Granite 3.3 2B Instruct mediante un ajuste fino QLoRA, publicado por el usuario Srihari2020 en Hugging Face. Su propósito es mapear descripciones desordenadas de facturas comerciales a códigos del Sistema Armonizado (HS 2022) de seis dígitos, un dominio cerrado donde los modelos generalistas tienden a inventar códigos plausibles pero incorrectos. El modelo combina el ajuste fino con una capa de recuperación aumentada (RAG) sobre ChromaDB y un validador determinista del árbol HS que bloquea cualquier código no presente en el catálogo oficial.

Con 2.533.539.840 parámetros (aproximadamente 2,5 mil millones), el modelo se posiciona en el rango de modelos pequeños aptos para inferencia en CPU o GPU de consumo. Se distribuye tanto en safetensors como en GGUF, lo que facilita su despliegue en entornos locales y privados. La licencia Apache 2.0 del modelo base se mantiene, lo que permite uso comercial sin restricciones adicionales.

El interés actual del modelo reside en su enfoque de "dominio cerrado": en lugar de confiar en el conocimiento paramétrico del LLM para recordar los más de 5.600 subpartidas del HS, combina el razonamiento del modelo con recuperación externa y validación determinista. Este patrón es relevante para cualquier aplicación de cumplimiento normativo donde la exactitud y la abstención controlada sean más importantes que la fluidez.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de IBM Granite 3.3 2B Instruct) |
| Parametros totales | 2.533.539.840 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (incluye Q4_K_M, aproximadamente 1,5 GB); safetensors en precisión original |
| Idiomas soportados | no disponible (el dominio de uso descrito es inglés comercial) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/granite-3.3-2b-instruct`, una versión del IBM Granite 3.3 2B Instruct distribuida por Unsloth. Sobre esa base se aplicó un ajuste fino con QLoRA en 4 bits, orientado a tres objetivos concretos: razonamiento según las Reglas Generales de Interpretación (GRI) del Sistema Armonizado, salida estricta en JSON y abstención deliberada (campo `needs_human_review: true`) cuando la descripción del producto carece de especificaciones técnicas suficientes.

La arquitectura efectiva en producción no es solo el modelo: el autor describe una arquitectura de tres capas. La primera es el LLM ajustado; la segunda es un índice RAG en ChromaDB con expansión de sinónimos comerciales y el modelo de embeddings `BAAI/bge-small-en-v1.5`, que recupera entre 10 y 15 candidatos oficiales del catálogo HS 2022; la tercera es un validador determinista (`src/validator.py`) que contrasta cada código predicho contra `data/hs_2022.csv` y bloquea la categoría residual del Capítulo 99. No se han publicado detalles sobre el número de tokens de entrenamiento, la composición del dataset de ajuste fino ni si se emplearon técnicas de RLHF o DPO.

## Capacidades

- Clasificación de descripciones de facturas comerciales en códigos HS 2022 de 6 dígitos (capítulo, partida y subpartida).
- Generación de salida JSON estructurada y validable, con campos como el código predicho y la marca de revisión humana.
- Abstención controlada: cuando faltan especificaciones técnicas, el modelo emite `needs_human_review: true` en lugar de adivinar.
- Razonamiento guiado por las Reglas Generales de Interpretación (GRI) del Sistema Armonizado.
- Integración con recuperación aumentada (RAG) mediante ChromaDB y embeddings `bge-small-en-v1.5`.
- Validación determinista de códigos contra el catálogo oficial HS 2022, con bloqueo del Capítulo 99.
- Conversación multi-turno (el modelo base es instruct y el tag `conversational` está presente).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles.
- Capacidades multilingües: no documentadas; el caso de uso descrito es en inglés comercial.

## Casos de uso

- Triaje previo al despacho aduanero en logística de comercio electrónico: el modelo convierte descripciones de proveedores en códigos HS de 6 dígitos listos para ERP, y deriva a revisión humana los ítems con especificaciones insuficientes gracias a la abstención controlada.
- Clasificación automatizada en transitarios y agentes de aduanas: procesamiento por lotes de líneas de factura comercial contra las más de 5.600 subpartidas del HS 2022, con validación determinista que descarta códigos inventados.
- Integración en pipelines ERP y de corretaje aduanero: la salida JSON estricta permite consumir las predicciones directamente en sistemas de gestión sin post-procesado frágil.
- Auditoría y control de calidad de clasificaciones existentes: el validador del árbol HS y la tasa de abstención permiten detectar códigos inválidos o mal fundamentados en bases de datos históricas.
- Despliegue en local o en CPU para datos sensibles: con aproximadamente 1,5 GB en GGUF Q4_K_M, el modelo puede ejecutarse en infraestructura propia sin enviar descripciones comerciales a servicios externos.
- Asistente interno para equipos de cumplimiento: dado su carácter conversacional y su ajuste en GRI, puede emplearse para explicar por qué una descripción concreta encaja en una partida determinada, siempre con la validación determinista como red de seguridad.
- Prototipado rápido de motores de clasificación normativa: la combinación de RAG externo y modelo pequeño sirve como plantilla para otros dominios cerrados con catálogos legales (por ejemplo, códigos de producto regulados).

## Benchmarks y rendimiento

El autor publica una evaluación sobre 138 muestras retenidas de los capítulos 84 y 85 del HS. No se ofrecen resultados del modelo base Granite 3.3 2B en la información disponible, solo la comparación gráfica referenciada en la model card.

| Metrica | TariffMind |
|---|---|
| Validez de JSON | 100,0 % |
| Tasa de alucinacion de codigos | 0,0 % |
| Precision a 2 digitos | 100,0 % |
| Precision a 4 digitos | 100,0 % |
| Coincidencia exacta a 6 digitos | 97,44 % |
| Precision de abstencion | 100,0 % |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la información disponible. Las cifras anteriores corresponden exclusivamente al conjunto de evaluación del dominio y no deben extrapolarse a otros capítulos del HS ni a tareas generales.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5 GB en GGUF Q4_K_M; en torno a 5-6 GB en FP16 (2,5 mil millones de parámetros).
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM para FP16 (RTX 3060, RTX 4060, RTX 4090); para cuantización Q4_K_M basta con GPU de gama de entrada o incluso CPU.
- Cabe en GPU de consumo: sí, en todas las RTX modernas con 6 GB o más en FP16 y en prácticamente cualquier GPU con la versión Q4_K_M.
- Opciones de despliegue: llama.cpp y Ollama para GGUF; vLLM o TGI para safetensors; endpoints compatibles según el tag `endpoints_compatible`; el autor proporciona además una interfaz Streamlit (`app.py`) y scripts de construcción del índice RAG (`src/build_rag.py`).
- Latencia y throughput: no disponibles en la información proporcionada. El autor menciona "inferencia rápida" en CPU o local con Q4_K_M, pero sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TariffMind (Granite 3.3 2B HS) | 2,53 B | no disponible | Clasificacion HS 2022 con RAG y validador | Apache 2.0 | Hugging Face (safetensors y GGUF) |
| IBM Granite 3.3 2B Instruct | no disponible | no disponible | Modelo generalista instruct | Apache 2.0 | Hugging Face |
| unsloth/granite-3.3-2b-instruct | no disponible | no disponible | Version distribuida por Unsloth del anterior | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks comparativos entre TariffMind y el modelo base en la información proporcionada, más allá de las gráficas referenciadas en la model card que no incluyen cifras textuales del base. Tampoco se conocen otros modelos especializados en clasificación HS comparables dentro de la información disponible.

## Limitaciones y advertencias

- El ajuste fino y la evaluación se centran en los capítulos 84 y 85 del HS (maquinaria y material eléctrico); el rendimiento en otros capítulos no está documentado y podría degradarse notablemente.
- La tasa de coincidencia exacta a 6 dígitos es del 97,44 %, no del 100 %: existe un margen de error residual que exige revisión humana en producción.
- El modelo depende de un índice RAG y de un validador externos; sin esas capas, la garantía de 0,0 % de alucinación no se sostiene.
- Los datos de evaluación son limitados (138 muestras) y provienen del propio autor; no se han publicado evaluaciones independientes.
- El dominio de uso descrito es el inglés comercial; no hay información sobre rendimiento en castellano u otros idiomas.
- Riesgo de alucinación en códigos mitigado por el validador, pero no eliminado en otros campos de la salida (por ejemplo, justificaciones textuales).
- No se documentan sesgos específicos del modelo ni del corpus de ajuste fino.
- La licencia Apache 2.0 permite uso comercial, pero la responsabilidad legal de una clasificación arancelaria errónea recae siempre en el operador; el modelo no sustituye el criterio de un agente de aduanas.
- El repositorio tiene un volumen de descargas bajo (179) y pocos likes (2), lo que sugiere escasa validación por parte de la comunidad.
- No se especifica la longitud de contexto soportada, lo que dificulta planificar el procesamiento de facturas con muchas líneas en una sola llamada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Srihari2020/TariffMind-Granite-3.3-2B-HS-GGUF
- Modelo base: https://huggingface.co/unsloth/granite-3.3-2b-instruct
- Modelo de embeddings RAG: https://huggingface.co/BAAI/bge-small-en-v1.5
- Organización IBM Granite: https://huggingface.co/ibm-granite
- Unsloth: https://huggingface.co/unsloth
- ChromaDB: https://www.trychroma.com/
- Sistema Armonizado (WCO): https://www.wcoomd.org/en/topics/nomenclature/overview/what-is-the-harmonized-system.aspx
