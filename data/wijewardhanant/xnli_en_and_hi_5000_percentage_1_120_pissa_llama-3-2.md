# WijewardhanaNT/xnli_en_and_hi_5000_percentage_1_120_PiSSA_llama-3.2

## Resumen

Se trata de un adaptador PEFT (LoRA) publicado por el usuario WijewardhanaNT sobre el modelo base meta-llama/Llama-3.2-3B. No es un modelo completo, sino un conjunto de pesos de adaptador en formato safetensors que debe cargarse junto al modelo base para poder realizar inferencia. El repositorio ocupa 0,3 GB y esta etiquetado con la libreria peft y el pipeline text-generation.

El identificador del repositorio (xnli_en_and_hi_5000_percentage_1_120_PiSSA_llama-3.2) sugiere que el adaptador se entreno sobre el corpus XNLI en ingles e hindi con 5.000 ejemplos, y que la inicializacion empleada fue PiSSA (Principal Singular values and Singular vectors Adaptation) en lugar de LoRA estandar. Esta lectura es una inferencia a partir del nombre del repositorio, no una confirmacion del autor: la model card esta practicamente vacia, con todos los campos marcados como "[More Information Needed]" o "no disponible".

Su relevancia es, por tanto, limitada y de caracter experimental: 0 descargas y 0 likes en el momento de la consulta, licencia no declarada y ausencia total de documentacion sobre datos, hiperparametros o evaluacion. Resulta util como referencia para quien investigue tecnicas de PEFT de bajo rango o comparativas de eficiencia de datos en tareas de inferencia de lenguaje natural (NLI) bilingue, pero no como componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only: meta-llama/Llama-3.2-3B |
| Parametros totales | No disponible (el adaptador pesa 0,3 GB; el modelo base Llama-3.2-3B declara 3.210 millones de parametros) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible para el adaptador; el modelo base Llama-3.2-3B declara una ventana de hasta 128.000 tokens en su model card oficial |
| Tipos de cuantizacion | No disponible. El adaptador se distribuye en safetensors sin cuantizar; la cuantizacion se aplicaria al modelo base (por ejemplo, 8 bits o 4 bits) |
| Idiomas soportados | No disponible de forma oficial. El nombre del repositorio indica ingles e hindi como idiomas de entrenamiento |
| Licencia | No disponible (el repositorio no declara licencia; el modelo base esta sujeto a la Llama 3.2 Community License de Meta) |
| Formato de pesos | safetensors, estructura de adaptador PEFT/LoRA |
| Libreria | peft 0.17.1, compatible con transformers |
| Tamano del repositorio | 0,3 GB |
| Fecha de creacion | 21 de septiembre de 2026 |
| Ultima actualizacion | 21 de septiembre de 2026 |

## Arquitectura y entrenamiento

El artefacto es un adaptador de bajo rango sobre Llama-3.2-3B, un transformer decoder-only de 3.210 millones de parametros con atencion causal y normalizacion RMSNorm, desarrollado por Meta. Al ser un adaptador, no se redistribuye el modelo base: el usuario debe descargar meta-llama/Llama-3.2-3B por separado y aplicar despues los pesos LoRA. La model card no especifica el rango, el modulo objetivo (q_proj, k_proj, v_proj, etc.), el valor de alpha ni la tasa de aprendizaje.

El nombre del repositorio apunta a dos elementos tecnicos concretos. Por un lado, PiSSA, una variante de inicializacion de adaptadores que descompone en valores singulares la matriz de pesos preentrenada y usa las componentes principales como punto de partida del adaptador, dejando el residuo congelado; esto suele acelerar la convergencia frente a LoRA estandar. Por otro, XNLI (Cross-lingual Natural Language Inference), un corpus de inferencia textual en 15 idiomas, del que se habrian usado los subconjuntos de ingles e hindi con 5.000 ejemplos. Los fragmentos "percentage_1" y "120" del identificador son compatibles con un experimento de ablacion de eficiencia de datos o con un numero de pasos de entrenamiento, pero no hay informacion que lo confirme. No se documentan fases de RLHF, DPO ni ajuste por preferencias.

## Capacidades

- Generacion de texto autoregresiva, heredada del modelo base Llama-3.2-3B.
- Clasificacion de inferencia de lenguaje natural (NLI) en ingles e hindi, segun el identificador del repositorio: relacion de implicacion, neutralidad o contradiccion entre un par premisa-hipotesis.
- Capacidad multilingue limitada a los dos idiomas de entrenamiento indicados por el nombre del repositorio; no hay confirmacion oficial.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo de razonamiento explicito (thinking mode), vision o audio: no disponible; el modelo base es exclusivamente de texto.
- Capacidades de codigo y matematicas: no evaluadas para este adaptador; el modelo base las soporta de forma basica a su escala.

## Casos de uso

- Clasificacion de pares premisa-hipotesis en hindi e ingles: el adaptador puede emplearse para etiquetar automaticamente relaciones de implicacion, neutralidad o contradiccion, que es la tarea para la que apunta su nombre. Es adecuado si el dominio coincide con XNLI.
- Verificacion de fundamentacion en pipelines RAG: dado un contexto recuperado y una respuesta generada, el modelo puede evaluar si la respuesta se infiere del contexto, lo que permite filtrar alucinaciones antes de devolverla al usuario.
- Moderacion de contenido asistida: clasificacion de si una afirmacion de un usuario se deduce de una politica publicada, como paso previo a una revision humana.
- Anotacion y preetiquetado de corpus para equipos de datos: generacion de etiquetas preliminares de NLI sobre grandes volumenes de texto en ingles e hindi, con revision humana posterior.
- Generacion de datos sinteticos para NLI: produccion de pares premisa-hipotesis plausibles para ampliar conjuntos de entrenamiento en hindi, idioma con menos recursos que el ingles.
- Evaluacion comparativa de tecnicas PEFT: servir de punto de referencia reproducible en estudios que comparen PiSSA, LoRA y otras inicializaciones bajo un mismo presupuesto de datos y pasos.
- Prototipado academico de bajo coste: al requerir 0,3 GB de adaptador mas un modelo de 3.000 millones de parametros, puede ejecutarse en una unica GPU de consumo para experimentos de investigacion.
- Analisis de consistencia en sistemas de pregunta-respuesta: comprobar si dos respuestas candidatas son mutuamente compatibles o contradictorias antes de seleccionar una.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye la seccion de evaluacion con el marcador "[More Information Needed]" y no aporta cifras de MMLU, XNLI, HumanEval, GSM8K ni de ninguna otra prueba. La busqueda web realizada no devolvio resultados relacionados con el modelo: los enlaces recuperados corresponden a comparadores de seguros de hogar austriacos y no guardan ninguna relacion con el artefacto.

## Requisitos de hardware

- VRAM del adaptador: aproximadamente 0,3 GB en safetensors, sin cuantizar.
- VRAM del modelo base en precision fp16/bf16: en torno a 6,4 GB solo para pesos, mas el coste de la cache KV.
- VRAM del modelo base en cuantizacion de 8 bits: aproximadamente 3,5 GB.
- VRAM del modelo base en cuantizacion de 4 bits: aproximadamente 2,0-2,5 GB.
- GPU de consumo compatibles: si, el conjunto adaptador mas base cabe en una RTX 3060 de 12 GB, una RTX 4070, una RTX 4080 o una RTX 4090. En configuraciones de 4 bits podria caber en GPU de 8 GB, con margen reducido para contextos largos.
- GPU de centro de datos: A100, H100 o L40S, muy por encima de lo necesario para 3.000 millones de parametros; utiles solo para servir muchas replicas en paralelo.
- Opciones de despliegue: transformers junto con peft para cargar el adaptador; vLLM admite adaptadores LoRA en tiempo de servicio; llama.cpp y Ollama requieren fusionar previamente el adaptador con los pesos base y convertir el resultado a GGUF.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del adaptador, por lo que la comparacion se limita a caracteristicas estructurales y de licencia. Las cifras del modelo base y de las alternativas proceden de sus respectivas model cards publicas y se incluyen como referencia, no de la informacion proporcionada sobre este repositorio.

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (sobre Llama-3.2-3B) | No disponible (adaptador de 0,3 GB) | No disponible | Adaptador LoRA/PEFT | No declarada | Repositorio publico con 0 descargas |
| meta-llama/Llama-3.2-3B (base) | 3.210 millones | Hasta 128.000 tokens | Modelo completo, texto | Llama 3.2 Community License | Ampliamente disponible |
| Otros adaptadores PEFT sobre Llama-3.2-3B | No disponible | No disponible | Adaptador LoRA | Variable segun autor | Multiples repositorios en HuggingFace |
| Modelos densos de ~3.000 millones de otras familias | No disponible | No disponible | Modelo completo, texto | Variable | No disponible |

No se han encontrado en la informacion disponible modelos comparables de la misma tarea (NLI bilingue ingles-hindi mediante PEFT) con los que establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Model card sin completar: todos los apartados de descripcion, datos de entrenamiento, hiperparametros y evaluacion contienen marcadores de plantilla sin rellenar. No hay informacion verificable sobre el procedimiento seguido.
- Licencia no declarada: el repositorio no especifica licencia, lo que impide determinar si el uso comercial esta permitido. Ademas, al derivar del modelo base de Meta, se heredan las restricciones de la Llama 3.2 Community License.
- Sin validacion de la comunidad: 0 descargas y 0 likes en la fecha de consulta, lo que implica ausencia de pruebas independientes de funcionamiento.
- Riesgo de alucinacion: heredado del modelo base de 3.000 millones de parametros, que puede generar texto plausible pero incorrecto, especialmente en hindi.
- Posible sobreajuste: el nombre del repositorio indica un entrenamiento con solo 5.000 ejemplos sobre una unica tarea, por lo que es probable que el adaptador degrade capacidades generales del modelo base fuera del dominio de NLI.
- Cobertura idiomatica restringida: no hay evidencia de soporte fuera del ingles y el hindi; el castellano no aparece en el identificador ni en la documentacion.
- Sesgos: no evaluados por el autor. El corpus XNLI procede de textos periodisticos y puede arrastrar sesgos culturales y de genero propios de esa fuente.
- Dependencia del adaptador: no puede usarse de forma autonoma; requiere descargar el modelo base, lo que anade unos 6 GB adicionales y una dependencia de licencia externa.
- Ambiguedad en la nomenclatura: campos como "5000", "percentage_1" o "120" no estan definidos, por lo que no puede reproducirse el experimento tal y como se describe.
- Resultados de busqueda no concluyentes: las consultas web realizadas no devolvieron ninguna fuente relacionada con el modelo, su autoria o su evaluacion.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/WijewardhanaNT/xnli_en_and_hi_5000_percentage_1_120_PiSSA_llama-3.2
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B
- Dataset XNLI en HuggingFace: https://huggingface.co/datasets/facebook/xnli
- Articulo de XNLI (Conneau et al., 2018): https://arxiv.org/abs/1809.05053
- Articulo de PiSSA (Meng et al., 2024): https://arxiv.org/abs/2402.09353
- Referencia citada en las etiquetas del repositorio (calculadora de impacto de carbono, Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Documentacion de PEFT: https://huggingface.co/docs/peft/index
- Nota: la busqueda web no aporto ningun enlace relevante sobre este modelo. Los unicos resultados recuperados fueron paginas de comparacion de seguros de hogar en Austria (check24.at, durchblicker.at, Arbeiterkammer Oberosterreich, checkeverything.at) y no guardan relacion con el artefacto descrito.
