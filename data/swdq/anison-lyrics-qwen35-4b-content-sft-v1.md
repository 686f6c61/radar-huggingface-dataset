# swdq/anison-lyrics-qwen35-4b-content-sft-v1

## Resumen

Anison lyrics Qwen3.5 4B content-sft-v1 es un ajuste fino experimental (SFT) del modelo base Qwen/Qwen3.5-4B, publicado por el usuario swdq en HuggingFace. Su objetivo es la generacion de letras de canciones en japones (letras de "anison", es decir, temas de anime y musica japonesa en general), entrenado tomando como salida de profesor unicamente letras reales. Se trata de un candidato de experimento, no de un modelo validado para produccion: el propio autor indica que la calidad comercial no esta certificada y que no se ha confirmado mejora alguna respecto a modelos existentes.

El modelo cuenta con aproximadamente 4.841 millones de parametros (4,84B) en pesos safetensors, con un tamano de repositorio de 9,7 GB, coherente con pesos en precision alta (probablemente bf16/fp16). Esta etiquetado con el pipeline text-generation, soporta el idioma japones y deriva del tag de arquitectura qwen3_5_text, si bien no se proporcionan detalles tecnicos sobre la arquitectura interna ni la longitud de contexto del modelo base en la informacion disponible.

Su relevancia es acotada y fundamentalmente metodologica: es un ejemplo de proceso de SFT sobre letras y de las problematicas de derechos de autor y plagio asociadas a este dominio. El autor condiciona la aceptacion del modelo a una posterior comparacion generativa y a una auditoria de copia, y fija los pesos de cada epoca con etiquetas `epoch-XX`. El punto de control publicado corresponde a epoch 1, step 135, con una NLL condicional de validacion de 2,7068.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el tag indica qwen3_5_text, arquitectura del modelo base Qwen3.5-4B) |
| Parametros totales | 4.841.450.496 (~4,84B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors, 9,7 GB) |
| Idiomas soportados | japones (ja) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se proporcionan detalles sobre la arquitectura interna del modelo mas alla del tag `qwen3_5_text` y de su condicion de ajuste fino del modelo base Qwen/Qwen3.5-4B. Al tratarse de un SFT sobre un modelo denso de ~4,84B parametros, se asume un transformer, pero la informacion disponible no confirma tipo de atencion, uso de MoE ni otras innovaciones tecnicas. No se detalla el numero de tokens de entrenamiento, la composicion completa del dataset ni si se emplearon tecnicas de RLHF o DPO (la unica tecnica declarada es SFT).

El proceso de ajuste se describe de forma muy escueta en la model card: se utilizaron exclusivamente letras reales como salida de profesor (teacher outputs). El punto de control publicado corresponde a epoch 1, step 135, con una NLL condicional sobre heldout de 2,7068. Los detalles de configuracion, el hash de los datos y la URL de Weights & Biases se remiten al fichero `results.json`. El autor declara que los datos de entrenamiento contienen letras de terceros y que no se publican. La aceptacion del modelo queda condicionada a una comparacion generativa posterior y a una auditoria de copia; los pesos de cada epoca se fijan con etiquetas `epoch-XX`.

## Capacidades

- Generacion de texto en japones, orientada especificamente a la produccion de letras de canciones.
- Generacion conversacional (el tag conversational esta presente), aunque la model card no describe ningun formato de prompt concreto.
- Ajuste fino supervisado (SFT) sobre letras reales como referencia de estilo.
- No se documentan capacidades de razonamiento, codigo, matematicas ni vision.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte para agentes ni razonamiento multi-paso.
- Capacidad multilingue: limitada al japones segun los metadatos; no se declaran otros idiomas.
- No se declaran capacidades especiales (modo thinking, audio, vision, etc.).

## Casos de uso

- Prototipado de letras de estilo anison: el modelo puede generar borradores de letras en japones con estilo de musica japonesa, util como punto de partida creativo para compositores o letristas que despues revisan y reescriben.
- Experimentacion academica sobre SFT en dominio musical: sirve como caso de estudio para investigar como se comporta un ajuste supervisado sobre un corpus restringido de letras y que tipo de memorizacion o copia produce.
- Estudio de prevencion de plagio: dado que el autor propone una auditoria de copia, el modelo puede emplearse como sujeto de pruebas para desarrollar metodologias de deteccion de reproduccion literal de material con derechos.
- Generacion de variaciones estilisticas: a partir de un tema o estructura dada, producir alternativas de estrofas o estribillos en japones para exploracion creativa.
- Investigacion sobre sesgos y derechos de autor en modelos generativos: analizar hasta que punto un modelo ajustado con letras reales tiende a reproducir fragmentos del material de entrenamiento.
- Educacion y divulgacion: ilustrar en talleres o cursos las limitaciones y riesgos legales del entrenamiento sobre contenido protegido por derechos de autor.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| NLL condicional en heldout (epoch 1, step 135) | 2,7068 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica metrica reportada es la NLL condicional de validacion, que no es comparable directamente con benchmarks de capacidad general. No se aportan cifras de rendimiento frente a otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un modelo denso de ~4,84B parametros, en bf16/fp16 serian necesarios aproximadamente 10 GB de VRAM solo para los pesos; en cuantizacion de 8 bits, en torno a 5-6 GB; y en 4 bits, alrededor de 3-4 GB. Estas cifras son estimaciones genericas, no confirmadas por el autor.
- GPU recomendadas: no especificadas por el autor. Para pesos completos en bf16, una GPU con 16 GB o mas (por ejemplo RTX 4080/4090, A100, H100) seria adecuada en funcion de la longitud de contexto. En cuantizacion de 4 bits podria caber en GPU de consumo de 8 GB.
- Compatibilidad con GPU de consumo: probablemente si en cuantizacion (por ejemplo RTX 3060 12 GB o superiores), aunque no esta confirmado por el autor.
- Opciones de despliegue: no documentadas. Al estar en formato safetensors, seria compatible potencialmente con frameworks como vLLM, TGI, transformers o llama.cpp tras conversion a GGUF, pero no hay confirmacion oficial.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo que permitan una comparativa cuantitativa fiable con alternativas. Se ofrece una comparacion cualitativa limitada:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| swdq/anison-lyrics-qwen35-4b-content-sft-v1 | ~4,84B | no disponible | no disponible | HuggingFace (0 descargas) |
| Qwen/Qwen3.5-4B (modelo base) | ~4B | no disponible | no disponible | HuggingFace |
| Alternativas de generacion de letras en japones | no disponible | no disponible | no disponible | no disponible |

No se conocen modelos comparables especificos de generacion de letras de anison con datos publicos en la informacion disponible.

## Limitaciones y advertencias

- Modelo experimental: el propio autor declara que la calidad comercial no esta certificada y que no se ha confirmado mejora respecto a modelos existentes.
- Datos de entrenamiento con letras de terceros: el corpus contiene material protegido por derechos de autor y no se publica; esto plantea riesgos legales para cualquier uso posterior.
- Sin garantia de uso comercial: el autor no garantiza la viabilidad de explotacion comercial de los pesos ni de las generaciones.
- Sin garantia de ausencia de plagio: no se asegura que las generaciones no reproduzcan fragmentos literales del material de entrenamiento; el autor preve una auditoria de copia antes de decidir la adopcion del modelo.
- Licencia no disponible: la ausencia de licencia explicita impide determinar las condiciones de uso, lo que desaconseja su empleo en produccion.
- Riesgo de alucinacion y de memorizacion: no evaluado ni documentado.
- Alcance linguistico limitado al japones.
- Longitud de contexto y arquitectura interna no documentadas.
- Cero descargas y cero likes en el momento de la consulta: sin validacion por parte de la comunidad.
- Estado de publicacion provisional: el modelo se mantiene como candidato a la espera de comparaciones generativas y auditorias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/swdq/anison-lyrics-qwen35-4b-content-sft-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Fichero de resultados (results.json): referenciado en la model card, disponible en el repositorio del modelo.
- URL de W&B: no disponible en la informacion proporcionada.
- Paper o blog asociado: no disponible.
