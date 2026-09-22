# WijewardhanaNT/xnli_en_and_hi_5000_percentage_1_40_DoRA_Qwen3-8b

## Resumen

Este repositorio contiene un adaptador de ajuste fino publicado por el usuario WijewardhanaNT bajo el identificador `xnli_en_and_hi_5000_percentage_1_40_DoRA_Qwen3-8b`. Se trata de un adaptador PEFT entrenado con la técnica DoRA (Weight-Decomposed Low-Rank Adaptation) sobre el modelo base Qwen/Qwen3-8B-Base, un transformer decoder-only de aproximadamente 8.000 millones de parámetros. El nombre del repositorio indica que el entrenamiento se realizó sobre el corpus XNLI (inferencia de lenguaje natural, tres clases: implicación, neutralidad y contradicción) en inglés e hindi, con 5.000 ejemplos por idioma y alguna variante de configuración denotada como "percentage_1_40".

El problema que aborda es acotado: adaptar un modelo generativo grande a una tarea discriminativa multilingüe de inferencia textual sin reentrenar todos los pesos. No es un modelo de propósito general ni un chat model, sino un artefacto de investigación que debe cargarse junto al modelo base mediante la librería PEFT (versión 0.17.1 según la model card). Su relevancia práctica es limitada por el momento: acumula 0 descargas y 0 "likes", la model card es la plantilla vacía de HuggingFace sin ningún campo rellenado, y no se ha publicado ningún resultado de evaluación.

La información verificable es escasa: el repositorio ocupa 0,7 GB, usa formato safetensors, la licencia y los idiomas no están declarados, y la búsqueda web no ha devuelto ninguna fuente relacionada con el modelo (los resultados obtenidos son documentación de soporte de Microsoft Windows, completamente ajena). Cualquier ficha de evaluación debe tratar este repositorio como un adaptador no validado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador DoRA (variante de LoRA con descomposición de magnitud y dirección) sobre un transformer decoder-only; el modelo base es Qwen/Qwen3-8B-Base |
| Parametros totales | 8B en el modelo base; el repositorio del adaptador ocupa 0,7 GB y no se declara el número exacto de parámetros entrenables |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card del adaptador; heredada del modelo base Qwen3-8B-Base (32.768 tokens nativos según la documentación de dicho modelo base) |
| Tipos de cuantizacion | no disponible; al ser un adaptador PEFT, la cuantización se decide al fusionarlo con el modelo base (fp16, int8, int4/GGUF mediante herramientas externas) |
| Idiomas soportados | inglés e hindi, deducidos del identificador del repositorio (`xnli_en_and_hi`); no declarados en la model card |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, no pesos completos) |

## Arquitectura y entrenamiento

El adaptador se apoya en Qwen/Qwen3-8B-Base, un transformer decoder-only con atención completa y aproximadamente 8.000 millones de parámetros, sobre el que se aplica DoRA. DoRA descompone cada matriz de pesos preentrenada en un componente de magnitud y otro de dirección, y aplica la actualización de bajo rango únicamente sobre la dirección, lo que según la literatura mejora la estabilidad y la capacidad de aprendizaje respecto a LoRA clásico con un coste de parámetros similar. El repositorio es un artefacto PEFT (`library_name: peft`), por lo que no contiene pesos completos y no puede ejecutarse de forma autónoma.

Los datos de entrenamiento, según el nombre del repositorio, corresponden a XNLI (Cross-lingual Natural Language Inference), la extensión multilingüe de MultiNLI con 15 idiomas, restringida aquí a inglés e hindi y a 5.000 ejemplos. No se declara el número de tokens, la composición exacta del dataset, el número de épocas, la tasa de aprendizaje, el rango del adaptador, el valor de alpha ni si hubo etapas de RLHF o DPO. El sufijo `percentage_1_40` sugiere una barrido experimental sobre algún porcentaje de datos o de capas, pero no hay documentación que lo confirme. La model card no incluye hiperparámetros ni infraestructura de cómputo. La etiqueta `arxiv:1910.09700` que aparece en los tags corresponde al artículo de Lacoste et al. sobre estimación de emisiones de carbono, citado en la plantilla genérica de HuggingFace, y no a un paper de este modelo.

## Capacidades

- Clasificación de inferencia textual (NLI) con tres etiquetas: implicación, neutralidad y contradicción, en inglés e hindi, siempre que el adaptador se cargue sobre Qwen/Qwen3-8B-Base.
- Capacidades generativas heredadas del modelo base (generación de texto, razonamiento básico, código y matemáticas elementales), potencialmente degradadas o alteradas por el ajuste específico de tarea.
- Soporte de tool calling / function calling: no disponible en la información proporcionada; no se ha entrenado explícitamente para ello.
- Soporte de agentes y razonamiento multi-paso: no disponible; el ajuste está orientado a una tarea de clasificación de un solo paso.
- Capacidades multilingües: limitadas a los dos idiomas vistos durante el ajuste (inglés e hindi). No hay evidencia de transferencia a otros idiomas de XNLI.
- Capacidades especiales (modo thinking, visión, audio): no disponible. El modelo base Qwen3-8B-Base es una variante base, no instruct, sin modo de razonamiento explícito.

## Casos de uso

- Verificación de coherencia en pipelines RAG: dado un par (contexto recuperado, respuesta generada), el adaptador puede clasificar si la respuesta está implicada por el contexto o lo contradice, lo que sirve como filtro automático de alucinaciones antes de mostrar la respuesta al usuario.
- Detección de contradicciones en documentación técnica: comparar pares de fragmentos normativos o de manuales para señalar afirmaciones mutuamente excluyentes durante procesos de revisión o auditoría documental.
- Anotación y preetiquetado de datasets NLI: usar el adaptador para generar etiquetas preliminares sobre grandes volúmenes de pares de frases y reducir el coste de la anotación humana, que después se revisa y corrige.
- Moderación semántica de contenidos: comprobar si una afirmación de un usuario contradice una política o una base de conocimiento oficial, activando revisión humana solo en los casos dudosos.
- Investigación en adaptación eficiente de parámetros: el repositorio sirve como punto de partida para reproducir experimentos con DoRA frente a LoRA sobre un mismo modelo base y un mismo corpus, comparando consumo de memoria y calidad por número de parámetros entrenables.
- Sistemas de pregunta-respuesta multilingües inglés-hindi: verificar si la respuesta del sistema se deduce de la evidencia recuperada en cualquiera de los dos idiomas, útil en atención al cliente o soporte técnico en mercados indios.
- Filtrado de datos sintéticos: descartar pares de frases generados automáticamente que no presenten una relación de implicación plausible, mejorando la calidad de corpus de entrenamiento posteriores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no contiene sección de evaluación, no se declara exactitud en XNLI (ni en inglés ni en hindi), y la búsqueda web no ha devuelto ninguna referencia al modelo. La métrica natural para este adaptador sería la precisión de clasificación de tres clases sobre los conjuntos de test y test-desviado de XNLI, pero no hay ningún valor publicado.

## Requisitos de hardware

- El adaptador por sí solo ocupa 0,7 GB en disco; requiere cargar además el modelo base Qwen3-8B-Base (unos 16,4 GB en fp16).
- Inferencia en fp16: aproximadamente 16-17 GB de pesos más la caché KV, lo que en la práctica exige 20-24 GB de VRAM para contextos moderados.
- Cuantización de 8 bits: en torno a 9-10 GB de VRAM. Cuantización de 4 bits: en torno a 5-6 GB, con la consiguiente pérdida de precisión.
- GPU recomendadas: A100 40/80 GB o H100 para servicio en fp16 con lotes grandes; RTX 4090 o RTX 3090 (24 GB) para fp16 con contexto limitado; RTX 4080, 4070 Ti o 3060 de 12 GB para cuantización de 4 bits.
- Cabe en GPU de consumo: sí, con cuantización de 4 bits u 8 bits en tarjetas de 12 GB o más, y en fp16 en tarjetas de 24 GB.
- Opciones de despliegue: transformers + peft para cargar el adaptador sin fusionar; vLLM y TGI admiten adaptadores LoRA en caliente; llama.cpp y Ollama requieren fusionar previamente el adaptador con el modelo base y convertir a GGUF.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de tokens por segundo ni de tiempo de respuesta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| Este adaptador (DoRA sobre Qwen3-8B-Base) | 8B en el base, adaptador de 0,7 GB | no disponible (heredado del base) | no disponible | HuggingFace, 0 descargas | no disponible |
| Qwen/Qwen3-8B-Base | ~8B | 32.768 tokens nativos segun su documentacion | Apache 2.0 | HuggingFace, ampliamente utilizado | no comparable (modelo base, no ajustado a NLI) |
| XLM-RoBERTa-large ajustado en XNLI | 559M | 512 tokens | MIT (modelo base) | HuggingFace, checkpoints XNLI habituales | referente clásico en NLI multilingüe; valores concretos no disponibles en esta busqueda |
| mT5-base o mT5-large ajustado en XNLI | 580M / 1,2B | 512 tokens | Apache 2.0 | HuggingFace | referente generativo multilingüe; valores concretos no disponibles en esta busqueda |

No se dispone de datos de rendimiento del adaptador que permitan una comparación cuantitativa. Las alternativas de la tabla se incluyen por su categoria funcional (NLI multilingue), no porque existan mediciones comparables publicadas para este repositorio.

## Limitaciones y advertencias

- No es un modelo autónomo: es un adaptador PEFT que debe combinarse con Qwen/Qwen3-8B-Base. Sin el modelo base no se puede ejecutar.
- Model card vacía: todos los campos de la plantilla están sin rellenar, incluidos los de sesgos, riesgos, datos de entrenamiento e hiperparámetros. No hay información sobre sesgos conocidos.
- Riesgo de alucinación: en su uso generativo hereda el riesgo del modelo base. En la tarea de clasificación NLI el error se manifiesta como etiquetas incorrectas, no como texto inventado, pero el efecto en producción puede ser equivalente (falsos negativos en detección de contradicciones).
- Sin evaluación publicada: cualquier afirmación sobre su precisión en XNLI es especulativa. No se recomienda su uso en producción sin una evaluación propia sobre el conjunto de test correspondiente.
- Cobertura de idiomas muy reducida: solo inglés e hindi según el identificador, en un corpus de 5.000 ejemplos por idioma, un volumen pequeño para ajustar una tarea semántica fina.
- Licencia no declarada: al no especificarse licencia, no se puede asumir permiso para uso comercial. Debe consultarse al autor antes de cualquier despliegue comercial.
- Ausencia de validación por la comunidad: 0 descargas y 0 "likes" en la fecha de creación del registro, sin issues ni discusiones que permitan contrastar su calidad.
- Fecha de creación del repositorio inusualmente futura (2026-09-21) según los metadatos, lo que impide situarlo con fiabilidad en una cronología de publicaciones.
- Compatibilidad: requiere PEFT 0.17.1 o superior; adaptadores de este tipo pueden no cargarse en versiones antiguas de transformers o en servidores de inferencia que no soporten DoRA.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/WijewardhanaNT/xnli_en_and_hi_5000_percentage_1_40_DoRA_Qwen3-8b
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B-Base
- Paper de DoRA (Weight-Decomposed Low-Rank Adaptation): https://arxiv.org/abs/2402.09353
- Paper de LoRA (Low-Rank Adaptation of Large Language Models): https://arxiv.org/abs/2106.09685
- Paper de XNLI (XNLI: Evaluating Cross-lingual Sentence Representations): https://arxiv.org/abs/1809.05053
- Paper citado en la plantilla de la model card (Lacoste et al., 2019, cuantificación de emisiones): https://arxiv.org/abs/1910.09700
- Librería PEFT: https://github.com/huggingface/peft
- Calculadora de impacto medioambiental de HuggingFace: https://mlco2.github.io/impact
