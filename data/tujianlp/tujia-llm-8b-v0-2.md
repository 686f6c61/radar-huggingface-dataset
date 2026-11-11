# TujiaNLP/tujia-llm-8b-v0.2

## Resumen

`tujia-llm-8b-v0.2` es la primera publicación pública de un modelo de generación de texto para la lengua tujia, desarrollado por el grupo TujiaNLP. Se distribuye como un adaptador LoRA sobre el modelo base `Qwen/Qwen3-8B` (versión base, no instruct), por lo que toda la capacidad de seguir instrucciones proviene del ajuste supervisado (SFT) aplicado en este adaptador. El objetivo declarado por los autores es establecer la disponibilidad de un recurso lingüístico para una lengua en peligro de desaparición, no alcanzar calidad de traducción.

El modelo cubre la consulta de palabras y la traducción de frases cortas entre chino y tujia (dialecto septentrional, estándar de Longshan), además de tujia a inglés. Se trata explícitamente de una *research preview*: los propios autores advierten de que la fidelidad de la traducción es baja y que el uso previsto se limita a la anotación asistida, la generación de candidatos en investigación lingüística y el contraste durante trabajos lexicográficos.

La relevancia de esta ficha no reside en su rendimiento, sino en su valor como caso de estudio de adaptación de un LLM de 8B a un dominio de muy bajos recursos mediante LoRA, con un conjunto de evaluación congelado y una documentación inusualmente honesta sobre las limitaciones del sistema.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-8B) con adaptador LoRA |
| Parametros totales | 8B (modelo base); el adaptador LoRA es de rango 16 sobre 16 capas |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el entrenamiento usó secuencias de 512 tokens) |
| Tipos de cuantizacion | no disponible; los pesos publicados usan bf16 (MLX) |
| Idiomas soportados | chino (zh), inglés (en), tujia (dialecto septentrional, estándar de Longshan) |
| Licencia | research-preview (uso exclusivamente de investigación; el modelo base conserva Apache-2.0) |
| Formato de pesos | adaptador LoRA en formato MLX (repositorio de 0,1 GB) |

## Arquitectura y entrenamiento

El modelo se construye sobre `Qwen/Qwen3-8B` en su versión base, convertida a MLX (`mlx-community/Qwen3-8B-bf16`) para entrenamiento e inferencia. El ajuste se realiza mediante LoRA con rango 16, aplicado a 16 capas, escala 32 y dropout 0,05. El entrenamiento consta de 35.000 pasos en la versión v0.1 más 12.000 pasos de continuación para la v0.2, con tamaño de lote 4, longitud de secuencia 512 y una tasa de aprendizaje de 2e-5 seguida de 1e-5. La pérdida de validación final es de 0,918 sobre 236.316 muestras de instrucciones.

La composición del corpus de entrenamiento es interna y no se distribuye con los pesos: aproximadamente 128.000 filas de tareas de diccionario y entradas, 25.000 de ejemplos y colocaciones, 64.000 pares paralelos chino-tujia en ambas direcciones, 3.769 muestras de segmentación de frases y 10.221 muestras ponderadas por colocación. El texto de entrenamiento utiliza pinyin Ye en ASCII, mientras que la IPA se emite como campo de salida para evitar que el tokenizador fragmente los símbolos fonéticos. No se documenta el uso de RLHF ni DPO.

## Capacidades

- Generación de texto en tujia a partir de instrucciones en chino o inglés.
- Consulta de vocabulario chino-tujia y tujia-chino con emisión de múltiples candidatos.
- Traducción de frases cortas en ambas direcciones y de tujia a inglés.
- Emisión de transcripción fonética en IPA como campo separado de la salida.
- Generación de letras de canciones (12 líneas evaluadas, similitud 0,583).
- Seguimiento de instrucciones básico adquirido exclusivamente mediante SFT sobre un modelo base no instruct.
- No dispone de soporte documentado de tool calling, function calling, razonamiento multi-paso, visión, audio ni modo de pensamiento.

## Casos de uso

- Anotación lingüística asistida: el modelo genera candidatos de traducción y entradas léxicas que un lingüista revisa y valida, acelerando el trabajo de campo sobre una lengua con escasos recursos digitales.
- Generación de borradores en prototipos de traducción: útil para obtener una primera aproximación de frases cortas chino-tujia antes de la revisión humana, dado que la similitud de frases es de 0,451.
- Contraste lexicográfico: durante la elaboración de un diccionario, el modelo sirve para verificar hipótesis sobre formas y colocaciones, siempre con confirmación humana.
- Investigación sobre adaptación de bajo rango: el adaptador y su conjunto de evaluación congelado (semilla 42) permiten reproducir y comparar estrategias de LoRA en lenguas de bajos recursos.
- Estudio de degradación generativa: la documentación de la degeneración por repetición (35 % antes de la decodificación dividida, 7 % después) lo convierte en un caso útil para investigar estrategias de decodificación en dominios pequeños.
- Evaluación de variedades dialectales: el desglose por dialecto (Longshan 0,481, Baojing 0,428, Luxi 0,284) permite medir la brecha entre variantes estándar y no estándar.
- No es adecuado para atención al cliente, producción comercial, documentación oficial, contextos médicos, legales o de seguridad pública, ni para registros de baja frecuencia como poesía o lenguaje ritual.

## Benchmarks y rendimiento

| Métrica | Base | v0.2 |
|---|---|---|
| Léxico 500, primer candidato exacto | 0 % | 5,8 % |
| Léxico 500, similitud de edición | 0,020* | 0,511 |
| Léxico 500, similitud ≥ 0,8 | — | 14,0 % |
| Entrada única 250, exacto | 0 % | 2,4 % |
| Entrada única 250, similitud | 0,024* | 0,449 |
| Frases 100, similitud (decodificación dividida) | 0,082 | 0,451 |
| Frases 100, degeneración por repetición | — | 7/100 |
| Letras de canciones, 12 líneas, similitud | — | 0,583 |

\* El modelo base se evaluó solo sobre los primeros 100 elementos.

Desglose dialectal en el conjunto de entrada única: Longshan (123 elementos) 0,481; Baojing (60) 0,428; Luxi (17) 0,284. El modelo emite siempre formas de Longshan, por lo que los elementos no Longshan miden una discrepancia de variedad, no un error de traducción. Si se cuenta cualquier candidato como acierto, la precisión del léxico asciende a aproximadamente el 16 %.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,1 GB; requiere cargar el modelo base Qwen3-8B en bf16, lo que supone aproximadamente 16 GB de VRAM para inferencia.
- GPU recomendadas: A100 40 GB, H100 80 GB o RTX 4090 24 GB para bf16; GPUs de 16 GB pueden resultar insuficientes para el modelo base completo en bf16.
- Cabe en GPUs de consumo como la RTX 4090 (24 GB) en bf16, y en GPUs de 12-16 GB si se cuantiza el modelo base (aunque no se documentan cuantizaciones oficiales del adaptador).
- El despliegue documentado es mediante MLX, lo que implica hardware Apple Silicon; no se documentan opciones para vLLM, llama.cpp, Ollama o TGI.
- No se publican datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tujia-llm-8b-v0.2 | 8B + LoRA r16 | no disponible | Traducción chino-tujia | research-preview | Hugging Face |
| Qwen/Qwen3-8B (base) | 8B | no disponible | Modelo generalista multilingüe | Apache-2.0 | Hugging Face |
| Adaptadores LoRA para lenguas de bajos recursos (genéricos) | variable | variable | Ajuste de dominio | variable | variable |

No se dispone de información sobre otros modelos específicos para la lengua tujia con los que establecer una comparación directa.

## Limitaciones y advertencias

- La búsqueda exacta de léxico es solo del 5,8 %; el modelo emite a menudo múltiples candidatos (por ejemplo, `zɤ⁵³；zɤ⁵⁵`) con valores tonales variables (53/55).
- La similitud de frases es de 0,451; las frases largas pierden la segunda mitad y el 7 % de las muestras presentan degeneración por repetición tras la decodificación dividida (35 % antes).
- Cobertura de vocabulario desigual: las palabras frecuentes y monosilábicas son fiables, pero los sustantivos concretos de baja frecuencia (斗笠, 蓑衣) se inventan.
- No existe mecanismo de rechazo: las palabras fuera de vocabulario producen sílabas que no pertenecen a ningún léxico.
- Sesgo hacia préstamos del chino en términos de parentesco (por ejemplo, `a²¹ko⁵⁵` para 阿哥 en lugar de la forma de canción popular `lo⁵⁵pa⁵⁵tiɛ⁵⁵` para 倮巴爹).
- Cubre únicamente el estándar de Longshan; no hay selección ni detección de dialecto, y el tujia meridional (Luxi) queda fuera del alcance.
- Los corpus de entrenamiento son de uso interno y no se distribuyen; el repositorio no contiene datos de diccionario, por lo que la recuperación debe aportarla el usuario.
- El consentimiento de los hablantes no está confirmado por fuente; cualquier uso comercial o redistribución requiere una revisión completa de derechos.
- La licencia es de solo investigación; el modelo base conserva Apache-2.0 y sus requisitos de atribución.
- Riesgo de alucinación y de transcripciones fonéticas incorrectas; el uso en materiales docentes o comunitarios exige revisión por hablantes nativos o lingüistas, y se recomienda consultar a las comunidades tujia antes de publicar derivados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TujiaNLP/tujia-llm-8b-v0.2
- Aviso de licencia: https://github.com/ibaibing/tujia-llm/blob/main/NOTICE
- Repositorio del proyecto: https://github.com/ibaibing/tujia-llm
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Conversión MLX del modelo base: https://huggingface.co/mlx-community/Qwen3-8B-bf16
