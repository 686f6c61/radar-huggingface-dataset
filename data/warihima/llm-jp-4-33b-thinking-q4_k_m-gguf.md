# WariHima/llm-jp-4-33b-thinking-Q4_K_M-GGUF

## Resumen

El modelo WariHima/llm-jp-4-33b-thinking-Q4_K_M-GGUF es una cuantizacion GGUF en formato Q4_K_M del modelo llm-jp-4-33b-thinking, desarrollado por el proyecto LLM-jp del Instituto Nacional de Informatica (NII) de Japon. Se trata de un modelo denso de 33.219 millones de parametros con capacidades de razonamiento explicito (modo "thinking"), entrenado para generar cadenas de pensamiento antes de emitir la respuesta final. La conversion a GGUF fue realizada por WariHima mediante el espacio GGUF-my-repo de ggml.ai, lo que permite ejecutar el modelo en local con llama.cpp tanto en CPU como en GPU.

El modelo soporta ingles y japones, asi como generacion de codigo en trece lenguajes de programacion. Su licencia Apache 2.0 permite uso comercial sin restricciones significativas. La cuantizacion Q4_K_M reduce el peso del modelo a aproximadamente 20,2 GB, haciendolo viable en GPUs de consumo de gama alta con 24 GB de VRAM. Es relevante ahora porque representa una de las pocas opciones de modelo de razonamiento con soporte nativo de japones disponible en formato GGUF para inferencia local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso |
| Parametros totales | 33.219.548.160 (33,2 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | Ingles, japones |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base llm-jp-4-33b-thinking es un transformer denso de 33.200 millones de parametros desarrollado por el proyecto LLM-jp del NII de Japon. La variante "thinking" esta entrenada para generar razonamiento explicito (cadenas de pensamiento internas) antes de producir la respuesta final, siguiendo el paradigma de los modelos de razonamiento modernos. No se dispone de detalles especificos sobre el numero de tokens de entrenamiento, la composicion del dataset ni el proceso de alineacion (RLHF/DPO) en la informacion proporcionada.

La cuantizacion Q4_K_M fue realizada con llama.cpp mediante el espacio GGUF-my-repo de ggml.ai, sin calibracion adicional sobre el corpus oficial de entrenamiento. Cabe destacar que existen versiones alternativas del mismo modelo base (como la publicada por Atsushi Fukuda) que aplican calibracion con el corpus llm-jp-corpus-v4 para mejorar la fidelidad de la cuantizacion, lo que sugiere que la calidad de esta conversion puede ser ligeramente inferior a las versiones calibradas.

## Capacidades

- Generacion de texto en ingles y japones con calidad nativa en ambos idiomas.
- Razonamiento explicito: genera una cadena de pensamiento interna antes de emitir la respuesta final, lo que mejora la precision en tareas de logica, matematicas y analisis complejo.
- Generacion de codigo en C, C++, C#, Go, Java, JavaScript, Lua, PHP, Python, Ruby, Rust, Scala y TypeScript.
- Comprension de instrucciones complejas y tareas multi-paso.
- Capacidad conversacional para dialogos multi-turno.
- No se ha confirmado soporte de tool calling o function calling en la informacion disponible.

## Casos de uso

- Desarrollo de software asistido en entornos japoneses: el modelo puede generar y revisar codigo en 13 lenguajes, con la ventaja de comprender comentarios, documentacion y requisitos escritos en japones, algo que muchos modelos occidentales manejan peor.
- Atencion al cliente bilingue (japones-ingles): puede gestionar conversaciones multi-turno en ambos idiomas, utilizando su razonamiento previo para resolver consultas de soporte tecnico que requieren analisis de sintomas y soluciones paso a paso.
- Analisis de documentos tecnicos japoneses: su capacidad de razonamiento permite resumir, extraer informacion y responder preguntas sobre especificaciones, manuales y papers cientificos redactados en japones.
- Educacion y tutoria de programacion: puede explicar conceptos de algoritmia y matematicas desglosando el razonamiento paso a paso, util para plataformas de aprendizaje automatico.
- Traduccion tecnica asistida: traduccion de documentacion tecnica entre ingles y japones con comprension del contexto, la terminologia especializada y las convenciones de cada idioma.
- Prototipado rapido de agentes conversacionales: su licencia Apache 2.0 y formato GGUF permiten integrarlo en pipelines locales sin coste de API, ideal para pruebas de concepto y entornos con requisitos de privacidad de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el archivo Q4_K_M ocupa aproximadamente 20,2 GB. Se necesitan al menos 22-24 GB de VRAM para inferencia con cache KV de tamano moderado.
- GPUs compatibles: RTX 4090 (24 GB), RTX 3090 (24 GB, con margen ajustado), A100 40/80 GB, H100. No cabe en GPUs de consumo con 16 GB o menos.
- Inferencia en CPU: posible con llama.cpp, aunque con latencia alta (del orden de varios segundos por token dependiendo del hardware).
- Opciones de despliegue: llama.cpp (CLI y servidor) mediante `llama-cli` y `llama-server`. Es necesario utilizar el fork de llama.cpp mantenido por el proyecto LLM-jp para el parseo correcto del chat template.
- Latencia estimada: en una RTX 4090, un modelo de 33B en Q4_K_M suele generar entre 20 y 40 tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| llm-jp-4-33b-thinking (Q4_K_M) | 33,2 B | Denso | No disponible | Apache 2.0 | GGUF |
| llm-jp-4-32b-a3b-thinking (GGUF) | 32 B total, 3 B activos | MoE | No disponible | Apache 2.0 | GGUF |
| Llama 3.1 8B Instruct (referencia) | 8 B | Denso | 128 K | Llama 3.1 | GGUF/safetensors |

La version MoE del mismo proyecto (llm-jp-4-32b-a3b-thinking) ofrece una alternativa mas eficiente en inferencia al activar solo 3.000 millones de parametros por token, con un coste computacional muy inferior. El modelo denso de 33B proporciona mayor capacidad por token a cambio de un mayor consumo de recursos. Ambos comparten licencia Apache 2.0 y soporte de ingles y japones.

## Limitaciones y advertencias

- Compatibilidad con llama.cpp: la version estandar de llama.cpp no parsea correctamente el chat template de LLM-jp-4 (a fecha de junio de 2026). Es necesario usar el fork mantenido por el proyecto LLM-jp, disponible en su cookbook oficial.
- Idiomas: el modelo esta optimizado para ingles y japones. Su rendimiento en otros idiomas no esta garantizado y probablemente sea significativamente inferior.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar informacion falsa o inventada, especialmente en tareas de hechos especificos o datos numericos.
- Sesgos: al estar entrenado principalmente con datos en japones e ingles, puede reflejar sesgos culturales y linguisticos de estas comunidades.
- Cuantizacion sin calibracion: la Q4_K_M generada mediante GGUF-my-repo no aplica calibracion con el corpus oficial, lo que puede degradar ligeramente la calidad de las respuestas frente a versiones calibradas o al modelo en precision completa.
- Datos de entrenamiento no verificados: no se dispone de informacion detallada sobre el dataset de entrenamiento del modelo base en la documentacion proporcionada.
- Soporte de tool calling no confirmado: no hay evidencia en la informacion disponible de que el modelo soporte function calling, lo que limita su uso en pipelines de agentes automatizados.

## Enlaces

- Repositorio HuggingFace del modelo GGUF: https://huggingface.co/WariHima/llm-jp-4-33b-thinking-Q4_K_M-GGUF
- Modelo base (WariHima/llm-jp-4-33b-thinking): https://huggingface.co/WariHima/llm-jp-4-33b-thinking
- Blog de LLM-jp sobre cuantizacion de modelos Thinking: https://llm-jp.nii.ac.jp/blog/llm-jp-4-thinking-quantization/
- Pagina de releases de LLM-jp: https://llm-jp.nii.ac.jp/en/release-en/
- Articulo de Zenn sobre calibracion de cuantizacion: https://zenn.dev/suzumura_lab/articles/0a1bdb04ec87ca
- Version MoE relacionada (ash2813): https://huggingface.co/ash2813/llm-jp-4-32b-a3b-thinking-gguf
- Version MoE relacionada (mmnga-o): https://huggingface.co/mmnga-o/llm-jp-4-32b-a3b-thinking-gguf
