# vanshnawander/assignment2-moe-dense

## Resumen

`vanshnawander/assignment2-moe-dense` es un transformer decoder-only de 35.402.752 parámetros publicado por el usuario vanshnawander en Hugging Face, entrenado para traducción de vietnamita y japonés a inglés. Arquitectura definida con código PyTorch propio (no es un modelo `transformers` estándar): seis capas, ocho cabezas de atención, tamaño oculto 512, ventana de contexto de 256 tokens y vocabulario BPE byte-level de 32.000 tokens. El repositorio ocupa 0,1 GB y contiene pesos en un `model_state.pt`, el tokenizador y los ficheros JSON de arquitectura y evaluación.

El nombre y la etiqueta `moe` del repositorio sugieren un diseño de mezcla de expertos, pero la propia model card declara "hasta 35.402.752 parámetros activos por token", es decir, el total de parámetros del modelo. Esto implica un comportamiento denso en la práctica, con independencia de la nomenclatura del repositorio.

Se trata con toda probabilidad de un trabajo académico (el identificador incluye `assignment2`), con métricas modestas en su conjunto de test: perplejidad 65,2811 y BLEU 15,3747. No se ha publicado corpus de entrenamiento, composición de datos, licencia ni evaluación de sesgos, y el repositorio acumula 0 descargas y 0 likes. Su interés es fundamentalmente didáctico y como referencia de arquitecturas personalizadas de traducción de muy bajo coste computacional, no como modelo de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con código PyTorch propio; repositorio etiquetado como `moe`, pero la model card declara activos todos los parámetros (comportamiento denso) |
| Parámetros totales | 35.402.752 |
| Parámetros activos | Hasta 35.402.752 por token (según model card; equivale al total) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantización | No disponible (solo se publican pesos en `model_state.pt`; no hay variantes GGUF, AWQ, GPTQ ni FP8) |
| Idiomas soportados | Vietnamita y japonés a inglés según la model card; el campo de idiomas del repositorio figura como no disponible |
| Licencia | No disponible |
| Formato de pesos | PyTorch state dict (`model_state.pt`) con código fuente propio (`load_model.py`, `decoding.py`) y tokenizador `tokenizer.json` |

## Arquitectura y entrenamiento

El modelo es un decoder-only autorregresivo con seis capas, ocho cabezas de atención y tamaño oculto 512, lo que da una dimensión por cabeza de 64. El vocabulario es un BPE byte-level de 32.000 tokens y la ventana de contexto está limitada a 256 tokens. El repositorio se anuncia como MoE (`moe-dense`, etiqueta `moe`), pero los 35.402.752 parámetros figuran como activos por token, por lo que el enrutado de expertos, si existe, no reduce el cómputo efectivo o no está documentado con detalle. La model card indica que la arquitectura, la configuración de entrenamiento y los resultados de evaluación se entregan como ficheros JSON, pero su contenido no se detalla en la información disponible.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del corpus, el uso de SFT, RLHF o DPO, ni sobre técnicas de optimización como decodificación especulativa o atención lineal. Las únicas métricas publicadas son de test: perplejidad 65,2811 y BLEU 15,3747. El tokenizador define tokens especiales PAD=0, BOS=1, EOS=2, SEP=3, VI=4 y JA=5. El formato de prompt para traducción es `[BOS, language_id, source_tokens..., SEP]` y para continuación `[BOS, text_tokens...]`, con un límite estricto de 256 tokens de entrada. El fichero `decoding.py` incluye ayudas de decodificación basadas en `forward`, sin que se documente el uso de caché KV.

## Capacidades

- Traducción de vietnamita a inglés y de japonés a inglés, según la model card.
- Generación de texto por continuación de secuencia mediante el formato `[BOS, text_tokens...]`.
- Control explícito del idioma de origen a través de los tokens especiales VI=4 y JA=5.
- Tokenización byte-level BPE de 32.000 entradas, lo que permite representar texto no visto sin tokens desconocidos.
- Ejecución de inferencia en CPU o GPU de gama muy baja gracias a su tamaño de 35,4 millones de parámetros.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de visión, audio o modo de razonamiento explícito (thinking): no disponibles.
- Cobertura multilingüe más allá del par vi/ja hacia inglés: no disponible.

## Casos de uso

- Prácticas académicas de NLP: es un caso de estudio útil para reproducir el ciclo completo de entrenamiento, evaluación con BLEU y perplejidad, y publicación de pesos en Hugging Face con código propio.
- Traducción de segmentos cortos en entornos con recursos mínimos: con 35,4 millones de parámetros y 256 tokens de contexto, puede ejecutarse en CPU o en una Raspberry Pi para traducir frases o títulos de vietnamita y japonés a inglés en escenarios sin conectividad.
- Preprocesado de corpus multilingües: traducción automática de titulares, metadatos o descripciones breves a inglés para homogeneizar un dataset antes de indexarlo o analizarlo.
- Generación de datos sintéticos a pequeña escala: creación de pares vi-en o ja-en para aumentar un corpus de entrenamiento de un modelo mayor, asumiendo la baja calidad reflejada por el BLEU de 15,3747.
- Estudio comparativo de arquitecturas: al estar etiquetado como MoE pero comportarse como denso, sirve para analizar el impacto real del enrutado de expertos en modelos de este tamaño y para comparar perplejidad entre variantes.
- Docencia sobre tokenización byte-level: permite ilustrar cómo un vocabulario BPE de 32.000 tokens y una secuencia de prompt con tokens de control (`BOS`, `SEP`, `VI`, `JA`) condicionan la generación.
- Base para experimentos de destilación o cuantización: al ser un modelo diminuto, es adecuado para probar pipelines de conversión a int8 o de destilación hacia arquitecturas aún más pequeñas sin coste relevante.
- Demo interactiva educativa: integrable en un notebook o una interfaz Streamlit que cargue `load_model.py` y el tokenizador para mostrar traducción en vivo con un modelo completamente autocontenido.

## Benchmarks y rendimiento

| Métrica | Resultado | Conjunto |
|---|---|---|
| Perplejidad | 65,2811 | Test |
| BLEU | 15,3747 | Test |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar en la información disponible, ni comparativas directas frente a otros sistemas de traducción.

## Requisitos de hardware

- VRAM estimada (cálculo derivado de los 35.402.752 parámetros publicados, no facilitado por el autor): en FP32 unos 142 MB; en FP16 unos 71 MB; en int8 unos 35 MB, más el coste del tokenizador y de las activaciones, despreciable con 256 tokens de contexto.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria, incluidas GTX 1050, GTX 1650, RTX 3050, RTX 3060, RTX 4090, A100 o H100. No requiere hardware de gama alta.
- Cabe en GPU de consumo: sí, en todas las GPU de consumo actuales e incluso en iGPU con memoria compartida suficiente.
- Inferencia en CPU: viable sin GPU dedicada; un único núcleo moderno puede ejecutar el modelo, aunque no hay cifras de latencia publicadas.
- Opciones de despliegue: vLLM, llama.cpp, Ollama y TGI no son compatibles directamente, porque la arquitectura es código PyTorch personalizado y no se distribuye en formato GGUF ni con soporte `transformers`. El despliegue requiere cargar el modelo con `load_model.py` desde el snapshot del repositorio y usar `decoding.py`.
- Latencia y throughput: no disponibles; el autor no publica mediciones de tokens por segundo ni de tiempo de respuesta.
- Almacenamiento: el repositorio completo ocupa 0,1 GB.

## Comparativa con modelos similares

No se han publicado comparativas directas con otros modelos en la información disponible. La tabla siguiente recoge únicamente datos de referencia externa ampliamente conocidos de alternativas de la misma categoría (traducción de tamaño pequeño), marcados como no verificados contra este repositorio:

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Rendimiento |
|---|---|---|---|---|---|
| assignment2-moe-dense | 35.402.752 | 256 | vi/ja → en | No disponible | BLEU 15,3747; perplejidad 65,2811 |
| T5-small (referencia externa) | 60 millones | 512 | Multilingüe (orientado a inglés) | Apache 2.0 | No disponible en esta información |
| NLLB-200-distilled-600M (referencia externa) | 600 millones | 512 | 200 idiomas | CC-BY-NC-4.0 | No disponible en esta información |
| Modelos opus-mt de Helsinki-NLP (referencia externa) | No disponible | No disponible | Pares concretos de idiomas | No disponible | No disponible en esta información |

Ninguna de las cifras de las filas de referencia ha sido contrastada con los resultados reales de este modelo, y no existe ninguna evaluación head-to-head publicada.

## Limitaciones y advertencias

- Rendimiento limitado: un BLEU de 15,3747 en test y una perplejidad de 65,2811 indican una calidad de traducción baja, muy alejada de la de sistemas de traducción neuronales consolidados.
- Ventana de contexto de 256 tokens: no permite traducir documentos largos ni mantener conversaciones multi-turno; cualquier entrada superior al límite debe truncarse o dividirse.
- Cobertura de idiomas restringida a vietnamita, japonés e inglés; no hay evidencia de capacidades en otras lenguas ni evaluación multilingüe publicada.
- Licencia no disponible: no puede asumirse el uso comercial. Cualquier explotación en producción requiere contactar con el autor para aclarar los términos.
- Sin información sobre el corpus de entrenamiento: no se puede evaluar la procedencia de los datos, el posible contenido con derechos de autor ni la representatividad lingüística.
- Sesgos: no documentados. No hay evaluaciones de sesgo, toxicidad ni alineación, y el modelo carece de cualquier etapa de ajuste con preferencias humanas.
- Riesgo de alucinación elevado: con 35,4 millones de parámetros y sin RLHF ni DPO, es probable que genere contenido inventado, especialmente fuera del dominio de traducción vi/ja→en.
- Discrepancia de nomenclatura: el repositorio se presenta como MoE, pero los parámetros activos por token equivalen al total, por lo que el beneficio computacional esperado de una arquitectura de mezcla de expertos no está documentado ni confirmado.
- Ejecución de código remoto: la model card pide descargar el snapshot e importar `load_model.py`, lo que implica ejecutar código Python de un tercero. Debe revisarse el código fuente antes de su importación y aislarse en un entorno controlado.
- Falta de integración con herramientas estándar: al no ser compatible con `transformers`, vLLM, TGI, llama.cpp u Ollama, el despliegue en producción exige desarrollar y mantener infraestructura de inferencia propia.
- Reproducibilidad limitada: solo se distribuyen los pesos; los estados del optimizador y del generador aleatorio permanecen en los checkpoints locales del autor, y no se incluye el corpus de entrenamiento.
- Madurez del proyecto: repositorio con 0 descargas y 0 likes, creado y actualizado el mismo día (4 de octubre de 2026), sin historial de mantenimiento ni validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vanshnawander/assignment2-moe-dense
- Paper, blog técnico, repositorio de código independiente o demo: no disponibles en la información proporcionada.
- Ficheros referenciados en la model card dentro del repositorio: `load_model.py`, `decoding.py`, `model_state.pt`, `tokenizer.json` y los ficheros JSON de arquitectura y evaluación.
