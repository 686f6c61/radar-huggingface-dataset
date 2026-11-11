# VictorM-Coder/humanizer-12b

## Resumen

humanizer-12b es un ajuste fino (finetune) del modelo google/gemma-4-12B desarrollado por el usuario VictorM-Coder. Su proposito es reescribir borradores generados por IA (correos, ensayos, informes, respuestas de foros) para que se lean como escritos por una persona, manteniendo intactos numeros, unidades, fechas, nombres y citas. El modelo esta entrenado para no anadir informacion nueva y para ejecutarse de forma local.

Con 11.959.730.224 parametros (aproximadamente 12B), hereda la arquitectura y la ventana de contexto de Gemma 4, aunque la model card no detalla estos extremos. Se distribuye principalmente en formato GGUF para llama.cpp, con archivos cuantizados que van desde 2 bits hasta Q8_0, pensados para equipos de consumo con tan solo 8 GB de memoria. El repositorio pesa 87,6 GB e incluye pesos en safetensors y GGUF.

El modelo es relevante porque aborda un nicho concreto: la "humanizacion" de texto con preservacion estricta de hechos, un problema habitual en flujos de trabajo que usan LLM para redactar y necesitan un resultado con estilo natural. Su licencia Apache 2.0 y su soporte para ingles y chino lo hacen atractivo para despliegues locales y automatizados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 4, segun el modelo base google/gemma-4-12B; detalles no disponibles) |
| Parametros totales | 11.959.730.224 (~12B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 2-bit, Q3, Q4_K_M, Q6_K, Q8_0 (GGUF); bf16 en safetensors |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-12B, un transformer decoder-only de aproximadamente 12B parametros. La model card no especifica el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. El ajuste fino esta orientado a la tarea de reescritura estilistica ("humanizer"), con datos de reescritura en ingles y chino.

La innovacion tecnica destacable esta en el proceso de cuantizacion. Los archivos de 2 bits, Q3 y Q4_K_M no se generan con una unica pasada de `llama-quantize`, sino que se midio la sensibilidad de cada tensor para asignar mas bits a los tensores criticos y menos a los robustos. Despues, esos archivos se entrenaron capa por capa (quantization-aware training) y se destilaron desde el modelo bf16 usado como profesor, sobre datos de reescritura en ingles y chino. Segun la model card, en el archivo de 2 bits la coincidencia top-1 con bf16 pasa del 70% (build estandar del mismo tamano) al 87% tras estas etapas. Los archivos Q6_K y Q8_0 son builds estandar de llama.cpp.

## Capacidades

- Generacion de texto y reescritura estilistica: transforma borradores con estilo de IA en texto con apariencia humana.
- Preservacion de hechos: entrenado para conservar numeros, unidades, fechas, nombres y citas, y para no anadir informacion.
- Procesamiento de documentos largos: la CLI `hz` divide el texto en fragmentos, conserva encabezados, codigo, tablas y enlaces, y reescribe solo la prosa.
- Soporte bilingue: ingles y chino.
- Entrada de imagen y texto: el tag `image-text-to-text` sugiere capacidades multimodales heredadas del modelo base, aunque la model card no las detalla.
- Integracion con agentes: incluye un archivo AGENTS.md con instrucciones exactas (ficheros, comando de servidor, prompt y autotest) para agentes de codigo.
- Ejecucion local: compatible con llama.cpp y con una aplicacion de escritorio para macOS (Apple silicon) y Windows.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.

## Casos de uso

- Reescritura de correos profesionales: el modelo toma un borrador generado por IA y lo reformula con un tono natural, conservando cifras, fechas y nombres; la aplicacion de escritorio permite pegarlo y revisar el resultado antes de enviarlo.
- Edicion de ensayos e informes: la CLI `hz` procesa archivos `.md`, `.txt` y `.docx` por fragmentos, manteniendo encabezados, tablas y enlaces, lo que la hace adecuada para documentos largos.
- Publicacion en foros y redes: convierte respuestas generadas por IA en textos con estilo conversacional para foros como Reddit o Zhihu, segun los ejemplos de la model card.
- Flujos de trabajo con agentes: AGENTS.md permite que un agente de codigo configure el servidor, aplique el prompt exacto y ejecute un autotest, util para automatizar la reescritura dentro de pipelines.
- Despliegue en equipos de consumo: los archivos de 2 bits y Q3 permiten ejecutar el modelo en maquinas con 8 GB de memoria, lo que facilita su uso offline en portatiles.
- Procesamiento bilingue de documentacion: equipos que redactan en ingles y chino pueden usar el mismo modelo para homogeneizar el estilo de sus textos tecnicos o comerciales.
- Reescritura con preservacion de hechos en entornos regulados: la evaluacion con un juez estricto (376 de 420 reescrituras en ingles sin problemas factuales) lo hace apto para borradores donde los datos deben mantenerse exactos, siempre con revision humana.

## Benchmarks y rendimiento

| Metrica | Resultado | Contexto |
|---|---|---|
| Reescrituras en ingles juzgadas como humanas por Originality.ai (configuracion mas estricta) | 95% (11 de 210 marcadas como IA) | Pesos bf16, 2026-10-02; la version anterior tenia 26 marcadas |
| Reescrituras en ingles sin problema factual (juez LLM estricto) | 376 de 420 | Medido sobre humanizer-12b-Q8_0.gguf |
| Coincidencia top-1 con bf16, archivo de 2 bits | 87% | Frente al 70% de un build estandar del mismo tamano |
| Coincidencia top-1 con bf16, archivo de 2 bits (etapas intermedias) | 81%, 85%, 87% | Progresion tras las etapas de cuantizacion |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: los archivos GGUF van desde 2 bits hasta Q8_0; la aplicacion sugiere uno de cinco tamanos segun la memoria disponible, con soporte hasta equipos de 8 GB. El archivo de 2 bits ocupa 3,9 GB segun la grafica de la model card.
- GPU recomendadas: no disponible. La model card menciona ejecucion en Mac con Apple silicon y Windows, sin listar GPU concretas.
- GPU de consumo: si, cabe en equipos con 8 GB de memoria usando los archivos de 2 bits o Q3; los archivos mayores requieren mas memoria.
- Opciones de despliegue: llama.cpp (incluido llama-server), aplicacion de escritorio para macOS y Windows, CLI `hz` instalable con pipx.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| humanizer-12b | ~12B | no disponible | apache-2.0 | Reescritura estilistica con preservacion de hechos |
| google/gemma-4-12B (modelo base) | ~12B | no disponible | no disponible en la informacion | Generacion de texto general y multimodal |
| Alternativas de reescritura de proposito general | no disponible | no disponible | no disponible | Reescritura mediante prompt sin ajuste fino |

No se dispone de datos de rendimiento de modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Riesgo de errores factuales: aunque el modelo esta entrenado para preservar hechos, el juez estricto marco 44 de 420 reescrituras en ingles con algun problema (135 problemas en total, 125 de ellos una sola palabra o frase). La model card recomienda revisar numeros, fechas y nombres antes de enviar el resultado.
- Sesgos: no se documentan sesgos conocidos en la informacion disponible; al heredar el modelo base, podria arrastrar los sesgos de este.
- Idiomas: solo se declaran ingles y chino; no hay soporte documentado para castellano ni otros idiomas.
- Contexto: la longitud de contexto no se especifica; para documentos largos la CLI fragmenta el texto, lo que puede afectar a la coherencia entre fragmentos.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base google/gemma-4-12B, cuya licencia no se detalla en la informacion.
- Produccion: el modelo tiene 0 descargas y 0 likes en Hugging Face y fue creado en noviembre de 2026; no hay evidencia de uso en produccion ni de mantenimiento a largo plazo.
- Deteccion de IA: los resultados de Originality.ai son una evaluacion concreta y no garantizan que otros detectores no marquen el texto como generado por IA.

## Enlaces

- Hugging Face: https://huggingface.co/VictorM-Coder/humanizer-12b
- Repositorio GitHub: https://github.com/sgaofen/humanizer-local-model
- Archivos GGUF: https://huggingface.co/jialinyyzz/humanizer-GGUF
- Documentacion de cuantizacion: https://github.com/sgaofen/humanizer-local-model/blob/main/docs/QUANTIZATION.md
- Guia de uso sin aplicacion: https://github.com/sgaofen/humanizer-local-model/blob/main/USAGE.md
- Guia de uso en chino: https://github.com/sgaofen/humanizer-local-model/blob/main/USAGE.zh.md
- Instrucciones para agentes: https://github.com/sgaofen/humanizer-local-model/blob/main/AGENTS.md
- Guia de instalacion: https://github.com/sgaofen/humanizer-local-model/blob/main/docs/INSTALL.md
- README en chino: https://github.com/sgaofen/humanizer-local-model/blob/main/README.zh.md
- Ejemplos de evaluacion: https://github.com/sgaofen/humanizer-local-model/blob/main/eval/outputs/examples-12b-Q8_0_x8.json
- Releases de la aplicacion: https://github.com/sgaofen/humanizer-local-model/releases/latest
- Modelo base: https://huggingface.co/google/gemma-4-12B
