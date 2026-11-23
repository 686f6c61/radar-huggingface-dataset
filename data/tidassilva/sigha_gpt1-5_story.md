# TidasSilva/SIGHA_GPT1.5_STORY

## Resumen

SIGHA GPT1.5_STORY es un adaptador LoRA de generación de ficción creativa desarrollado por TidasSilva sobre el modelo base dphn/Dolphin3.0-Llama3.1-8B, que a su vez es un fine-tune de Llama 3.1 8B. No se trata de un modelo independiente, sino de un conjunto de pesos PEFT (41.943.040 parámetros entrenables) que deben cargarse junto al modelo base para funcionar. El adaptador está orientado específicamente a la escritura de narrativa larga, continuación de historias y generación de ficción con contexto extendido.

El modelo se entrenó con Unsloth QLoRA en dos etapas: una primera fase de 180 pasos de optimizador y una segunda de 56 pasos centrada en ejemplos de instrucción de ficción y continuidad narrativa. La ventana de entrenamiento fue de 8.192 tokens, lo que lo sitúa en el rango de contexto medio-largo para tareas de escritura. El autor reporta una pérdida de validación de 2,325803 en la segunda etapa, ligeramente mejor que la anterior (2,331790), y afirma que el adaptador previo superó una prueba específica de recuperación de información con contexto de 8K.

Su relevancia es acotada: se publica como experimento de fine-tuning de ficción sobre un modelo conversacional ya ajustado, con cero descargas y un único "me gusta" en el momento de la ficha. No hay licencia declarada, no se especifican idiomas soportados y no se han publicado benchmarks formales. Es, por tanto, un artefacto de investigación personal más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre Llama 3.1 8B (transformer decoder-only) |
| Parametros totales | No disponible (adaptador de 41.943.040 parámetros entrenables; el base tiene 8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens en entrenamiento; contexto del base Llama 3.1: 128K |
| Tipos de cuantizacion | No disponible (entrenado con QLoRA; el adaptador se distribuye en safetensors) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre dphn/Dolphin3.0-Llama3.1-8B, un transformer decoder-only de la familia Llama 3.1 con 8.000 millones de parámetros. El entrenamiento se realizó con Unsloth QLoRA, una técnica de fine-tuning con cuantización de 4 bits que reduce el consumo de memoria y permite ajustar modelos de 8B en GPUs de consumo. Se generaron 41.943.040 parámetros entrenables en las capas LoRA, un orden de magnitud coherente con un rango LoRA moderado sobre un modelo de 8B.

El proceso tuvo dos etapas. La primera constó de 180 pasos de optimizador; la segunda continuó el adaptador existente con 56 pasos adicionales sobre ejemplos de instrucción de ficción y continuidad narrativa. Los datos de entrenamiento incluyen VellumK2T-Fiction-SFT-01, novelist-cot-writing-raw-v1 y NSFW-Stories-JsonL, lo que explica la advertencia del autor sobre contenido para adultos. No se documenta el número total de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO; el ajuste parece ser SFT supervisado estándar. La única innovación técnica destacable es el uso de Unsloth para acelerar el QLoRA y la validación específica de recuperación a 8K de contexto, que no constituye una evaluación integral de escritura larga.

## Capacidades

- Generación de texto narrativo y ficción creativa: cuentos, relatos, escenas y diálogos.
- Continuación de historias y mantenimiento de continuidad narrativa, reforzado en la segunda etapa de entrenamiento.
- Escritura con contexto de hasta 8.192 tokens, adecuada para capítulos o tramas de extensión media.
- Generación de ficción para adultos (el dataset incluye NSFW-Stories-JsonL), con la advertencia explícita del autor.
- Hereda las capacidades conversacionales y de instrucciones del modelo base Dolphin3.0-Llama3.1-8B.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidades multilingües no documentadas; el autor no especifica idiomas.

## Casos de uso

- Escritura de relatos y capítulos: el adaptador genera prosa narrativa coherente con el tono y el estilo de ficción, aprovechando los 8K de contexto para mantener tramas y personajes a lo largo de escenas extensas.
- Continuación de manuscritos: dado un fragmento previo, el modelo prosigue la narración respetando la voz y la continuidad, gracias al entrenamiento específico en narrative-continuity.
- Generación de borradores para autores: sirve como herramienta de ideación y redacción rápida de escenas, que el escritor revisa y pule después.
- Prototipado de ficción interactiva: integrado en un motor de historias conversacionales, puede producir respuestas narrativas multi-turno dentro de la ventana de 8K.
- Experimentación académica en fine-tuning de ficción: útil como caso de estudio de QLoRA con Unsloth sobre un modelo conversacional, comparando pérdidas de validación entre etapas.
- Generación de contenido para adultos con revisión humana: el autor advierte que las salidas pueden contener temas maduros y deben revisarse antes de su uso; encaja en flujos donde hay moderación posterior.
- Evaluación de recuperación en contexto largo: la prueba de recall a 8K sugiere uso en tareas donde hay que mantener información de referencia a lo largo de una narración extensa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta métricas de validación del entrenamiento:

| Metrica | Valor |
|---|---|
| Pérdida de validación (etapa 2) | 2,325803 |
| Pérdida de validación (etapa previa) | 2,331790 |
| Prueba de recall a 8K de contexto | Superada por el adaptador previo (sin cifras) |

El propio autor indica que estos resultados no constituyen un benchmark integral de escritura de formato largo.

## Requisitos de hardware

- El adaptador LoRA en safetensors ocupa aproximadamente 0,2 GB (tamaño del repo), pero requiere cargar el modelo base Dolphin3.0-Llama3.1-8B, cuyos pesos completos suman unos 16 GB en FP16.
- VRAM estimada para inferencia del base en FP16: alrededor de 16-18 GB, incluyendo overhead de contexto.
- VRAM estimada con cuantización de 4 bits (GGUF o bitsandbytes): aproximadamente 5-6 GB, lo que permite ejecución en GPUs de consumo.
- GPUs recomendadas: A100 40GB u H100 para FP16 con contexto largo; RTX 4090 (24 GB) para FP16 ajustado o 8-bit; RTX 3090, 4080 y 4070 Ti para cuantización de 4-8 bits.
- Cabe en GPU de consumo (RTX 3060 12 GB en adelante) si se cuantiza el base a 4 bits.
- Opciones de despliegue: PEFT y Unsloth para cargar el adaptador; vLLM o TGI para servir el modelo fusionado; llama.cpp/Ollama si se convierte el modelo fusionado a GGUF.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantización.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SIGHA GPT1.5_STORY | Adaptador LoRA sobre 8B | 8K (entrenamiento) | Fine-tune de ficción | No disponible | Hugging Face, 0 descargas |
| dphn/Dolphin3.0-Llama3.1-8B | 8B | 128K (base Llama 3.1) | Modelo conversacional | No disponible en esta ficha | Hugging Face, modelo base |
| Llama 3.1 8B Instruct | 8B | 128K | Modelo generalista | Llama 3.1 Community License | Amplia disponibilidad |
| Mistral 7B Instruct | 7B | 32K | Modelo generalista | Apache 2.0 | Amplia disponibilidad |

La comparativa es limitada: SIGHA es un adaptador especializado y no un modelo generalista, por lo que su rendimiento en tareas ajenas a la ficción dependerá del base. No hay datos de benchmarks que permitan comparar calidad de escritura con alternativas.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere cargar el base dphn/Dolphin3.0-Llama3.1-8B con PEFT o Unsloth; no funciona solo con los pesos del repo.
- Licencia no declarada: no se puede asumir uso comercial sin consultar al autor y verificar la licencia del modelo base.
- Idiomas no especificados: no hay garantía de calidad fuera del inglés, idioma probable de los datasets de entrenamiento.
- Contenido para adultos: el dataset incluye NSFW-Stories-JsonL y el autor advierte de temas maduros en las salidas; requiere moderación y revisión humana.
- Riesgo de alucinación y de incoherencia narrativa en textos muy largos: la validación a 8K no equivale a un benchmark de escritura de formato largo.
- Sesgos heredados del base y de los datasets de ficción, no evaluados ni documentados.
- Contexto de entrenamiento de 8K, muy por debajo de los 128K del base: el rendimiento puede degradarse más allá de esa ventana.
- Cero descargas y un único "me gusta": sin validación comunitaria ni reportes de uso en producción.
- Pérdida de validación de 2,33 sin referencia de comparación: no permite afirmar calidad objetiva frente a otros adaptadores.

## Enlaces

- Hugging Face: https://huggingface.co/TidasSilva/SIGHA_GPT1.5_STORY
- Modelo base: https://huggingface.co/dphn/Dolphin3.0-Llama3.1-8B
- Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
- PEFT (librería de carga): https://github.com/huggingface/peft
