# tinyopsec/Qwen3.5-4B-Unredacted-MAX-GGUF

## Resumen

Qwen3.5-4B-Unredacted-MAX-GGUF es un conjunto de cuantizaciones en formato GGUF del modelo prithivMLmods/Qwen3.5-4B-Unredacted-MAX, un ajuste fino de la arquitectura Qwen3.5-4B de Qwen. El trabajo de cuantizacion lo publica el usuario tinyopsec en Hugging Face, con el objetivo declarado de mejorar la estabilidad de carga y la compatibilidad con los pipelines modernos de Transformers y con el ecosistema llama.cpp.

El modelo base cuenta con 4.205.751.296 parametros reales (el autor de la model card redondea a 4,5B) y una arquitectura de tipo transformer Qwen2 con 28 capas y 28 cabezas de atencion. La longitud de contexto es de 32.768 tokens y el vocabulario de 151.936 entradas. Es un modelo denso, no MoE, por lo que no hay parametros activos diferenciados.

Su relevancia practica esta en el empaquetado: el repositorio ofrece once niveles de cuantizacion desde F16 hasta Q2_K, con tamanos que van de 8,4 GB a 1,1 GB, lo que permite desplegar un modelo de 4,2B parametros con 32k de contexto en GPUs de consumo e incluso en CPU. La licencia Apache 2.0 y el soporte de Ollama y llama.cpp lo hacen directamente utilizable en entornos locales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen2 (28 capas, 28 cabezas de atencion) |
| Parametros totales | 4.205.751.296 (4,2B; la model card indica 4,5B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer denso de la familia Qwen2, con 28 capas y 28 cabezas de atencion, un vocabulario de 151.936 tokens y una ventana de contexto de 32.768 tokens. El ajuste fino lo realiza prithivMLmods sobre Qwen/Qwen3.5-4B, y la model card describe el resultado como optimizado para estabilidad de carga y compatibilidad con pipelines modernos de Transformers. El calificativo "Unredacted" sugiere un ajuste orientado a reducir el filtrado de respuestas, aunque la informacion disponible no detalla la composicion del dataset de ajuste.

No se dispone de datos sobre el numero de tokens de entrenamiento, la mezcla del corpus ni sobre si se aplicaron fases de RLHF, DPO o similares. Tampoco se documentan innovaciones tecnicas especificas (atencion lineal, decodificacion especulativa, modos de razonamiento extendido) mas alla de las propias de la arquitectura Qwen2. Las cuantizaciones GGUF se generan con las herramientas de llama.cpp y preservan la estructura de pesos original en precision reducida.

## Capacidades

- Generacion de texto conversacional y de contenido sobre temas diversos.
- Seguimiento de instrucciones directas y de instrucciones de varios pasos.
- Tareas de razonamiento y resolucion de problemas, segun la model card.
- Analisis del comportamiento de transformers y de la dinamica de instrucciones en entornos de investigacion.
- Despliegue ligero en local gracias al tamano de 4,2B parametros y a las cuantizaciones de 1,1 a 8,4 GB.
- Compatibilidad con llama.cpp, llama-cpp-python, LM Studio y Ollama.
- Soporte de contexto largo de hasta 32.768 tokens en las herramientas que lo configuren explicitamente.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Asistente conversacional local: con la cuantizacion Q5_K_M (2,8 GB) el modelo cabe en una GPU de gama media o en un portatil con GPU discreta, y mantiene conversaciones multi-turno dentro de la ventana de 32.768 tokens configurada en llama.cpp.
- Prototipado rapido de aplicaciones de texto: la disponibilidad de once cuantizaciones permite elegir el equilibrio entre calidad y VRAM (de 1,1 GB en Q2_K a 8,4 GB en F16) sin cambiar de modelo ni de API.
- Experimentacion en investigacion sobre alineacion y filtrado: el ajuste "Unredacted" y la posibilidad de ejecutarlo en local lo hacen util para estudiar como varian las respuestas segun la cuantizacion y el prompt, en un entorno controlado y sin dependencia de servicios externos.
- Procesamiento de documentos de longitud media: los 32k tokens de contexto permiten resumir o extraer informacion de articulos, informes o transcripciones que no caben en modelos de 4k u 8k, siempre que se use una herramienta que respete `n_ctx`.
- Despliegue en CPU o en equipos sin GPU: las variantes Q3_K_M (1,5 GB) y Q2_K (1,1 GB) estan pensadas para ejecucion en CPU con RAM suficiente, lo que habilita pruebas en portatiles sin acelerador.
- Generacion de contenido en ingles para blogs, documentacion o correos: el modelo esta entrenado y etiquetado solo para ingles, por lo que es adecuado para flujos de redaccion en ese idioma, no para castellano.
- Integracion en pipelines de CI/CD o scripts: mediante llama-cpp-python se puede invocar el modelo desde Python con `n_threads` configurable, lo que facilita tareas de generacion por lotes en servidores sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun la model card: F16 9 GB, Q8_0 5 GB, Q6_K 3,5 GB, Q5_K_M 3 GB, Q4_K_M 2,5 GB, Q3_K_M 2 GB, Q2_K 1,5 GB.
- GPU recomendadas por la model card: GPU de gama alta para F16, gama media para Q8_0 y Q6_K, GPU estandar o de portatil para Q5_K_M y Q4_K_M, GPU de portatil o CPU para Q3_K_M, y CPU con RAM suficiente para Q2_K.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM para Q4_K_M y superiores; las variantes Q3 y Q2 estan pensadas tambien para CPU.
- Opciones de despliegue documentadas: llama.cpp (`./main`), llama-cpp-python (`Llama`), LM Studio y Ollama (`ollama pull tinyopsec/qwen3.5-4b-unredacted-max-gguf:q5_k_m`).
- Latencia y throughput: no disponibles en la informacion proporcionada. Dependeran de la cuantizacion, del numero de hilos (`n_threads`) y del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-Unredacted-MAX-GGUF (este) | 4,2B | 32.768 | Apache 2.0 | GGUF | Cuantizaciones comunitarias de 1,1 a 8,4 GB |
| prithivMLmods/Qwen3.5-4B-Unredacted-MAX | 4,2B | 32.768 | Apache 2.0 | safetensors (modelo base) | Modelo original sin cuantizar; sirve de referencia de calidad |
| Qwen/Qwen3.5-4B | no disponible en la informacion | 32.768 (heredado) | no disponible en la informacion | no disponible en la informacion | Modelo base oficial sobre el que se hizo el ajuste fino |

No se dispone de datos de rendimiento comparado (benchmarks) entre estas variantes en la informacion proporcionada, por lo que la comparativa se limita a parametros, contexto, licencia y formato.

## Limitaciones y advertencias

- Idioma: el modelo esta etiquetado unicamente para ingles; el rendimiento en castellano u otros idiomas no esta garantizado ni documentado.
- Filtrado reducido: el nombre "Unredacted" indica un ajuste orientado a disminuir el rechazo de peticiones, lo que aumenta el riesgo de generar contenido inapropiado, sesgado o danino; requiere moderacion adicional en produccion.
- Alucinacion: no se han publicado evaluaciones de fidelidad factual; como modelo de 4,2B, es esperable una tasa de alucinacion superior a la de modelos mayores.
- Cuantizaciones agresivas: las variantes Q3 y Q2 (1,1 a 1,7 GB) degradan la calidad de forma notable; para uso en produccion se recomienda Q5_K_M o superior.
- Contexto efectivo: aunque la arquitectura soporta 32.768 tokens, el contexto util real puede ser menor y depende de la configuracion de `n_ctx` en la herramienta de inferencia.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base y el ajuste fino deben verificarse por separado; la model card remite a la licencia del modelo original.
- Soporte: son cuantizaciones comunitarias sin soporte oficial; para documentacion y garantias hay que acudir al repositorio original y a la documentacion de llama.cpp.
- Sin datos de entrenamiento: no se documenta la composicion del dataset de ajuste fino, lo que dificulta evaluar sesgos y cobertura.

## Enlaces

- Repositorio GGUF: https://huggingface.co/tinyopsec/Qwen3.5-4B-Unredacted-MAX-GGUF
- Modelo base del ajuste: https://huggingface.co/prithivMLmods/Qwen3.5-4B-Unredacted-MAX
- Documentacion de llama.cpp: https://github.com/ggerganov/llama.cpp
