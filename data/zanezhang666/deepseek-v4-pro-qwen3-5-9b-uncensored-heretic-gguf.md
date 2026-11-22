# zanezhang666/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-GGUF

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic es un modelo de lenguaje de 9.197.093.888 parámetros (aproximadamente 9,2 mil millones) publicado por el usuario zanezhang666 en Hugging Face. Se trata de una cuantización estática en formato GGUF del modelo base xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic, un derivado de la familia Qwen 3.5 (tag `qwen3_5`) que ha sido destilado a partir de DeepSeek y sometido a un proceso de "abliteration" o "decensoring" (tags `heretic`, `uncensored`, `abliterated`). El autor de las cuantizaciones es mradermacher, según se indica en la model card.

El modelo está orientado a razonamiento (`reasoning`), matemáticas y STEM (`math`, `stem`), uso de herramientas (`tool-use`, `function-calling`) y soporte multilingüe en inglés, chino, coreano, japonés, español y ruso. Incorpora técnicas de entrenamiento como SFT, RL con GSPO y destilación, además de un mecanismo MTP (multi-token prediction) según los tags declarados.

La relevancia de esta ficha reside en que ofrece una vía de despliegue local en formato GGUF con licencia Apache 2.0, lo que facilita su uso comercial y su ejecución en hardware de consumo mediante llama.cpp u Ollama. No obstante, la información publicada es escasa: no se detallan la longitud de contexto, la composición del dataset ni resultados de benchmarks, y el repositorio ocupa 85,1 GB, lo que refleja la inclusión de múltiples cuantizaciones y del suplemento multimodal `mmproj`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen 3.5, tag `qwen3_5`); detalles de capas y atención no disponibles |
| Parametros totales | 9.197.093.888 (dato de safetensors) |
| Parametros activos | No aplica (no se declara arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; además mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

La información disponible no describe en detalle la arquitectura interna. Los tags indican que pertenece a la familia `qwen3_5`, lo que apunta a un transformer decoder-only con las convenciones de Qwen 3.5, pero no se especifican número de capas, dimensión oculta, mecanismo de atención ni si incorpora atención lineal o híbrida. El tag `mtp` sugiere la presencia de multi-token prediction, una técnica que permite predecir varios tokens por paso y que puede emplearse para decodificación especulativa, aunque no se confirma su implementación concreta.

En cuanto al entrenamiento, la model card solo declara los tags `distillation`, `sft`, `rl` y `gspo`. Esto indica que el modelo base se habría destilado a partir de un modelo mayor (presumiblemente de la familia DeepSeek, dado el nombre), seguido de ajuste supervisado (SFT) y aprendizaje por refuerzo con GSPO (Group Sequence Policy Optimization). No se publican el número de tokens de entrenamiento, la composición del dataset, ni detalles sobre el proceso de abliteration aplicado para eliminar los rechazos. El prefijo "DeepSeek-V4-Pro" en el nombre no debe interpretarse como un modelo oficial de DeepSeek: se trata de un nombre comercial del autor del modelo base y no hay confirmación de que corresponda a un modelo real de esa familia.

## Capacidades

- Generación de texto conversacional multi-turno, con soporte declarado para modo conversacional (`conversational`).
- Razonamiento explícito (`reasoning`) y resolución de problemas matemáticos y de STEM.
- Generación de código y uso en tareas de programación, aunque sin benchmarks publicados que lo confirmen.
- Tool calling y function calling (`tool-use`, `function-calling`), lo que permite integración con agentes y APIs.
- Capacidades multimodales: el repositorio incluye ficheros `mmproj` (Q8_0 y f16), lo que indica soporte de entrada de imágenes en el modelo base, aunque no se detalla el alcance.
- Multilingüe en inglés, chino, coreano, japonés, español y ruso.
- Modo "uncensored"/"abliterated": el modelo ha sido modificado para reducir los rechazos ante peticiones que un modelo alineado estándar rechazaría. No se especifica el método exacto ni el grado de modificación.
- Compatible con endpoints de text-generation-inference según los tags.

## Casos de uso

- Asistente de razonamiento matemático y STEM: el modelo puede resolver problemas paso a paso en entornos educativos o de investigación, aprovechando su entrenamiento declarado en `math` y `stem`. Adecuado para prototipos locales donde no se quiera depender de APIs externas.
- Generación de código en local: con soporte de tool calling y formato GGUF, puede integrarse en editores o pipelines de CI/CD mediante llama.cpp u Ollama para autocompletado y generación de tests, siempre que se validen los resultados por la ausencia de benchmarks.
- Agentes con function calling: su soporte de `tool-use` permite construir agentes que invoquen APIs, consulten bases de datos o ejecuten comandos, con la ventaja de desplegarse en hardware de consumo.
- Atención al cliente multilingüe: al cubrir español, inglés, chino, coreano, japonés y ruso, puede gestionar conversaciones multi-turno en varios idiomas, aunque se desconoce la longitud de contexto efectiva.
- Procesamiento de documentos con imágenes: la inclusión de `mmproj` sugiere capacidad de describir o extraer información de imágenes, útil para clasificación de capturas o extracción de texto en entornos con poca infraestructura.
- Investigación sobre alineación y seguridad: al ser un modelo "abliterated", es útil para estudiar el comportamiento de modelos sin rechazos, analizar sesgos y evaluar riesgos antes de desplegar sistemas en producción.
- Fine-tuning y experimentación: con licencia Apache 2.0 y pesos GGUF, sirve como base para experimentos de cuantización, destilación o ajuste fino en entornos académicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~4,0 GB
  - Q3_K_S: ~4,5 GB; Q3_K_M: ~4,8 GB; Q3_K_L: ~5,1 GB
  - IQ4_XS: ~5,5 GB; Q4_K_S: ~5,6 GB; Q4_K_M: ~5,9 GB
  - Q5_K_S: ~6,6 GB; Q5_K_M: ~6,7 GB
  - Q6_K: ~7,7 GB
  - Q8_0: ~9,9 GB
  - f16: ~18,5 GB
  - Suplemento multimodal: mmproj-Q8_0 ~0,7 GB; mmproj-f16 ~1,0 GB
- GPU recomendadas: para cuantizaciones Q4 y Q5, una RTX 3060 de 12 GB o RTX 4060 Ti de 16 GB es suficiente; para Q8_0 se recomienda RTX 4070 Ti Super, RTX 4080 o RTX 4090; para f16, una RTX 4090 de 24 GB o GPUs de datacenter como A100 o H100.
- Cabe en GPU de consumo: sí, en la mayoría de cuantizaciones Q2 a Q6 con GPUs de 8-12 GB; Q8_0 requiere al menos 12 GB y f16 al menos 20 GB.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF; el modelo base es compatible con transformers y text-generation-inference según los tags.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic (GGUF) | 9,2 B | No disponible | Apache 2.0 | GGUF | Modelo "abliterated" con soporte multimodal y tool calling |
| Qwen 2.5 7B Instruct | 7,6 B | 32.768 tokens (estándar) | Apache 2.0 | safetensors, GGUF | Alternativa oficial de Alibaba, sin modificación de alineación |
| Llama 3.1 8B Instruct | 8,0 B | 131.072 tokens | Llama 3.1 Community License | safetensors, GGUF | Licencia más restrictiva; sin soporte multimodal nativo |
| Mistral 7B Instruct v0.3 | 7,2 B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Sin tool calling nativo ni multimodal |

La comparativa es aproximada: no se dispone de datos de rendimiento del modelo analizado, por lo que no puede establecerse una comparación cuantitativa. La principal diferencia frente a las alternativas es su naturaleza "uncensored" y la inclusión de un suplemento multimodal `mmproj`, además de la licencia Apache 2.0.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de su rendimiento en MMLU, HumanEval, GSM8K ni otras pruebas, lo que impide validar las capacidades declaradas.
- Riesgo elevado de alucinación: al ser un modelo destilado y modificado mediante abliteration, puede generar contenido incorrecto con alta confianza, especialmente en dominios especializados.
- El proceso de "abliteration" elimina o reduce los rechazos de seguridad, lo que implica que puede producir contenido ofensivo, ilegal o peligroso. No es adecuado para aplicaciones orientadas al público sin filtros adicionales.
- Longitud de contexto desconocida: no se puede garantizar el manejo de conversaciones largas ni de documentos extensos.
- Idiomas: aunque se declaran seis idiomas, no se especifica la calidad relativa; el español podría tener un rendimiento inferior al inglés o al chino.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base podría arrastrar obligaciones adicionales no documentadas; se recomienda revisar la licencia del modelo base xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic.
- El nombre "DeepSeek-V4-Pro" no corresponde a un modelo oficial de DeepSeek; es una denominación del autor y no debe confundirse con los modelos oficiales de la compañía.
- El repositorio ocupa 85,1 GB, lo que puede dificultar la descarga y el almacenamiento en entornos con recursos limitados.
- No se detalla el método de cuantización más allá de los tipos estándar de llama.cpp; las cuantizaciones IQ ponderadas están en un repositorio separado (mradermacher/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-i1-GGUF).

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/zanezhang666/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-GGUF
- Modelo base: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-i1-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
