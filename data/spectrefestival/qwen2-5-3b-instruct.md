# SpectreFestival/Qwen2.5-3B-Instruct

## Resumen

Qwen2.5-3B-Instruct es un modelo de lenguaje causal de tipo transformer, con 3,09 mil millones de parametros (2,77B excluyendo embeddings), desarrollado originalmente por el equipo Qwen de Alibaba Cloud. Esta ficha corresponde a la reproduccion publicada por el usuario SpectreFestival en HuggingFace, que redistribuye los pesos del modelo instructivo oficial Qwen2.5-3B-Instruct. El modelo base subyacente es Qwen/Qwen2.5-3B, afinado por instrucciones para tareas de conversacion y generacion de texto.

El modelo resuelve tareas de generacion de texto, seguimiento de instrucciones, razonamiento basico, codigo y matematicas en un tamano que cabe en hardware de consumo. Su ventana de contexto completa es de 32.768 tokens, con una capacidad de generacion de hasta 8.192 tokens, y emplea atencion con query-key-value bias, RoPE, SwiGLU, RMSNorm y embeddings ligados. La familia Qwen2.5 declara soporte para mas de 29 idiomas en su model card, aunque las etiquetas del repositorio re-subido solo registran ingles.

Es relevante ahora porque ofrece un punto de entrada ligero al ecosistema Qwen2.5: se puede ejecutar en una unica GPU de consumo, es compatible con transformers, text-generation-inference y endpoints compatibles, y sirve como base para fine-tuning o para prototipado de agentes. Conviene tener en cuenta que este repositorio concreto es una copia de terceros, sin descargas ni likes, y que la model card replica literalmente la del modelo oficial sin anadir informacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (decoder-only) con RoPE, SwiGLU, RMSNorm, atencion QKV bias y embeddings ligados |
| Parametros totales | 3.085.938.688 (3,09B); 2,77B sin contar embeddings |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 32.768 tokens completos (la familia Qwen2.5 anuncia hasta 128K; este repositorio declara 32.768) y generacion de hasta 8.192 tokens |
| Tipos de cuantizacion | no disponible en este repositorio; solo se publican pesos safetensors (tamano del repo: 6,2 GB) |
| Idiomas soportados | La model card declara mas de 29 idiomas (chino, ingles, frances, espanol, portugues, aleman, italiano, ruso, japones, coreano, vietnamita, tailandes, arabe, entre otros); las etiquetas del repositorio solo indican `en` |
| Licencia | `other` / `qwen-research` (licencia de investigacion Qwen) |
| Formato de pesos | safetensors |
| Capas | 36 |
| Cabezas de atencion | GQA con 16 cabezas de query y 2 cabezas de key/value |
| Modelo base | Qwen/Qwen2.5-3B (finetune instructivo) |
| Libreria | transformers |

## Arquitectura y entrenamiento

Se trata de un transformer causal decoder-only con normalizacion RMSNorm, activacion SwiGLU, embeddings de posicion rotatorios (RoPE) y bias en las proyecciones de query, key y value. El modelo usa atencion con consultas agrupadas (GQA) con una relacion 16:2 entre cabezas de query y de key/value, lo que reduce de forma notable el coste de memoria de la cache KV durante la inferencia. Cuenta con 36 capas y embeddings de la palabra ligados a la matriz de salida, de modo que el recuento de parametros sin embeddings es de 2,77B frente a los 3,09B totales.

Segun la model card, el desarrollo paso por una fase de preentrenamiento y otra de postentrenamiento (etapas de ajuste por instrucciones), con modelos expertos especializados en codigo y matematicas usados para mejorar esas capacidades. La familia Qwen2.5 incorpora mejoras en seguimiento de instrucciones, generacion de textos largos (mas de 8K tokens), comprension de datos estructurados (tablas) y generacion de salidas estructuradas, en particular JSON. No se detalla en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas concretas de RLHF o DPO, mas alla de la mencion generica a una etapa de postentrenamiento.

## Capacidades

- Generacion de texto conversacional multturno con plantilla de chat (`apply_chat_template`) y soporte de mensajes de sistema.
- Seguimiento de instrucciones, incluida la resistencia a variaciones en los prompts de sistema para role-play y definicion de condiciones.
- Generacion de texto largo: hasta 8.192 tokens de salida y contexto de entrada de 32.768 tokens.
- Generacion de salidas estructuradas, en especial JSON, y comprension de datos tabulares.
- Capacidades mejoradas en codigo y matematicas respecto a la generacion Qwen2, segun la model card.
- Capacidades multilingues declaradas para mas de 29 idiomas en la documentacion de la familia, aunque las etiquetas de este repositorio solo marcan ingles.
- Compatibilidad con text-generation-inference y con endpoints compatibles (etiqueta `endpoints_compatible`).
- No se declara soporte explicito de tool calling, function calling, vision, audio ni modo de razonamiento extendido en la informacion proporcionada.

## Casos de uso

- Asistente conversacional en local: con 3,09B de parametros y 32.768 tokens de contexto, puede gestionar conversaciones multi-turno en una unica GPU de consumo, sin enviar datos a servicios externos.
- Extraccion de datos estructurados: la model card destaca la generacion de JSON y la comprension de tablas, lo que permite convertir documentos o formularios en registros estructurados dentro de un pipeline de datos.
- Resumen de documentos largos: la ventana de 32.768 tokens admite informes, actas o articulos extensos en una sola pasada, con salidas de hasta 8.192 tokens.
- Asistencia a la programacion en equipos pequenos: generacion y explicacion de fragmentos de codigo, y redaccion de pruebas unitarias, con la ventaja de poder desplegarse en la maquina del desarrollador.
- Clasificacion y etiquetado de texto a escala: su tamano reducido permite procesar volumenes altos de documentos por lotes con un coste de inferencia bajo.
- Base para fine-tuning especifico de dominio: al ser un modelo denso de 3B con pesos safetensors y `transformers`, es un punto de partida habitual para ajustes con LoRA o QLoRA en datasets propios.
- Chatbot de soporte en entornos con requisitos de privacidad: desplegado en infraestructura propia, evita la salida de datos sensibles y permite controlar versiones y pesos.
- Traduccion y adaptacion de contenido: pese a que este repositorio solo etiqueta ingles, la familia declara soporte multilingue; conviene validar la calidad por idioma antes de usarlo en produccion.
- Preprocesado para agentes: puede actuar como generador de borradores o como componente de un grafo mayor, aunque el soporte de tool calling no esta documentado en esta ficha.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio remite a la entrada de blog de Qwen2.5 para los resultados detallados de evaluacion y a la documentacion de Qwen para los requisitos de memoria de GPU y throughput, pero no incluye cifras concretas (MMLU, HumanEval, GSM8K u otras) en el propio repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6,2 GB en precision de 16 bits (coincide con el tamano del repositorio y con 3,09B parametros a 2 bytes), unos 3,5 GB en cuantizacion de 8 bits y en torno a 2 GB en cuantizacion de 4 bits. Son estimaciones aritmeticas a partir del numero de parametros, no mediciones publicadas.
- Cache KV: con 36 capas, 2 cabezas de key/value y GQA, el coste por token es bajo, del orden de decenas de kilobytes por token en FP16; a 32.768 tokens de contexto la cache anade aproximadamente 1-1,5 GB, segun el tipo de dato. Estimacion orientativa.
- GPU recomendadas: cabe en GPUs de consumo como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090 en FP16 o BF16. Para mayor concurrencia o lotes grandes se recomienda A100, H100 o L40S.
- Cabe en GPU de consumo: si, con claridad; es uno de los puntos fuertes de un modelo denso de 3B. Tambien puede ejecutarse en CPU y en Apple Silicon (unified memory) con cuantizacion.
- Opciones de despliegue: transformers (version reciente, ya que con `transformers<4.37.0` se produce `KeyError: 'qwen2'`), text-generation-inference, endpoints compatibles y servidores compatibles con la API de OpenAI. Para llama.cpp u Ollama seria necesario disponer o generar pesos en formato GGUF, dado que este repositorio solo publica safetensors.
- Latencia y throughput: no disponible. La model card remite a la tabla de speed benchmark de la documentacion de Qwen, pero no reproduce cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen2.5-3B-Instruct (este repo, copia de SpectreFestival) | 3,09B | 32.768 tokens (familia: hasta 128K) | qwen-research | safetensors, transformers, TGI | Copia de terceros sin descargas ni likes; sin benchmarks en el repositorio |
| Qwen/Qwen2.5-3B-Instruct (original) | 3,09B | 32.768 tokens | qwen-research | Repositorio oficial con model card y soporte del equipo Qwen | Misma arquitectura y pesos; es la referencia recomendada |
| Llama-3.2-3B-Instruct | 3,21B | 128.000 tokens | Llama 3.2 Community License | Meta y ecosistema amplio (incluye GGUF) | Contexto mayor y mejor soporte de cuantizaciones publicadas |
| Phi-3.5-mini-instruct | 3,8B | 128.000 tokens | MIT | Microsoft, amplia disponibilidad | Licencia permisiva y contexto largo, a costa de mas parametros |
| Gemma-2-2B-it | 2,6B | 8.000 tokens | Gemma Terms of Use | Google, con restricciones de uso | Alternativa mas ligera pero con contexto muy inferior |

Los datos de los modelos alternativos provienen de sus model cards publicas y pueden variar; conviene verificarlos antes de tomar una decision de despliegue.

## Limitaciones y advertencias

- Este repositorio es una reproduccion de terceros (usuario SpectreFestival) con 0 descargas y 0 likes: no hay validacion de la comunidad ni garantia de que los pesos coincidan exactamente con los oficiales. Para produccion es preferible el repositorio oficial Qwen/Qwen2.5-3B-Instruct.
- La model card es una copia literal de la del modelo original y mantiene referencias al identificador oficial `Qwen/Qwen2.5-3B-Instruct`; no documenta el proceso de subida ni posibles modificaciones.
- Licencia `qwen-research`: es una licencia de investigacion, no una licencia permisiva generica. Es imprescindible revisar el texto completo antes de cualquier uso comercial.
- Riesgo de alucinacion propio de un modelo de 3B: la precision factica y el razonamiento complejo son inferiores a los de modelos mayores. No conviene usarlo sin verificacion en dominios de alta responsabilidad.
- Discrepancia de idiomas: las etiquetas del repositorio solo listan `en`, mientras que la model card declara mas de 29 idiomas. La calidad multilingue real debe validarse empiricamente.
- Discrepancia de contexto: la model card menciona soporte de hasta 128K en la familia, pero la ficha del repositorio concreta 32.768 tokens para este modelo. Se debe asumir 32.768 como limite operativo salvo verificacion.
- No se documentan en la informacion disponible el dataset de entrenamiento, los sesgos conocidos ni las evaluaciones de seguridad; se aplican los caveats habituales de los modelos entrenados con datos web a gran escala.
- No se declara soporte de tool calling, function calling ni modo de razonamiento extendido, por lo que no debe asumirse su disponibilidad en flujos de agentes.
- No se publican cuantizaciones en este repositorio: el despliegue en llama.cpp, Ollama u otros runners basados en GGUF requiere generar los pesos previamente.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/SpectreFestival/Qwen2.5-3B-Instruct
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B
- Modelo original instructivo: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Licencia Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE
- Blog de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Repositorio GitHub de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Documentacion de Qwen: https://qwen.readthedocs.io/en/latest/
- Benchmarks de velocidad y memoria: https://qwen.readthedocs.io/en/latest/benchmark/speed_benchmark.html
- Informe tecnico de Qwen2 (arXiv 2407.10671): https://arxiv.org/abs/2407.10671
