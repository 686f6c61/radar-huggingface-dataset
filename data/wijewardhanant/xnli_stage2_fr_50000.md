# WijewardhanaNT/xnli_stage2_fr_50000

## Resumen

`WijewardhanaNT/xnli_stage2_fr_50000` es un adaptador LoRA (PEFT) publicado en Hugging Face por el usuario WijewardhanaNT, construido sobre el modelo base `meta-llama/Llama-2-7b-hf`. Por la nomenclatura del identificador (`xnli`, `stage2`, `fr`, `50000`) se infiere que se trata de un ajuste fino orientado a la tarea XNLI (inferencia de lenguaje natural multilingue, ver `arxiv:1910.09700`) en su segunda etapa, para el idioma frances y con 50.000 muestras o pasos de entrenamiento, aunque el autor no documenta ninguno de estos extremos en la model card.

El repositorio tiene un tamano de 0,5 GB, coherente con un adaptador LoRA sobre un modelo de 7.000 millones de parametros en lugar de un checkpoint completo. La model card es practicamente una plantilla vacia: todos los campos de descripcion, datos de entrenamiento, hiperparametros, evaluacion y licencia aparecen como `[More Information Needed]`. Esto limita severamente cualquier evaluacion rigurosa del modelo.

La relevancia de esta ficha es, por tanto, principalmente documental: describe que se puede saber con certeza (arquitectura base, formato, libreria) y que queda sin verificar, advirtiendo al lector de que se trata de un artefacto sin validacion publica, con cero descargas y cero likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Llama-2-7B) con adaptador LoRA |
| Parametros totales | 7.000 millones (modelo base); parametros del adaptador no disponibles |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens (valor estandar de Llama-2-7B; no confirmado para el adaptador) |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponible (el sufijo `fr` sugiere frances como idioma de ajuste) |
| Licencia | no disponible (sujeta ademas a la licencia Llama 2 del modelo base) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Libreria | PEFT 0.21.0, transformers |
| Modelo base | meta-llama/Llama-2-7b-hf |
| Tamano del repositorio | 0,5 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Llama-2-7B, un transformer decoder-only con atencion causal, normalizacion RMSNorm, activacion SwiGLU y RoPE para codificacion posicional, con 32 capas y 4.096 tokens de contexto. El adaptador es de tipo LoRA (Low-Rank Adaptation), una tecnica que congela los pesos del modelo base e inyecta matrices de bajo rango en determinadas proyecciones, reduciendo drasticamente el numero de parametros entrenables y el coste de almacenamiento (de ahi el tamano de 0,5 GB del repositorio).

No hay informacion sobre el dataset de entrenamiento, el numero de tokens procesados, la composicion de los datos, el rango y alpha del adaptador, la tasa de aprendizaje ni si se emplearon tecnicas de alineacion como RLHF o DPO. El identificador sugiere un ajuste sobre XNLI (Cross-lingual Natural Language Inference), un benchmark de inferencia textual en 15 idiomas, en una "etapa 2" y con 50.000 ejemplos o pasos para frances, pero esto es una inferencia a partir del nombre y no un dato confirmado por el autor. La referencia `arxiv:1910.09700` que aparece en las etiquetas corresponde al paper de XNLI (Conneau et al., 2018), no a un paper propio del modelo.

## Capacidades

- Generacion de texto autoregresiva heredada de Llama-2-7B.
- Ajuste especifico (presuntamente) para inferencia de lenguaje natural en frances, segun la nomenclatura del identificador.
- Capacidad multilingue base de Llama-2, limitada a los idiomas vistos durante el preentrenamiento; el alcance real del adaptador no esta documentado.
- Soporte de tool calling / function calling: no disponible de forma nativa en Llama-2-7B; no se documenta ningun ajuste en este sentido.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Modo thinking, vision o audio: no disponible.
- Cualquier capacidad especial adicional: no documentada.

## Casos de uso

- Clasificacion de pares de frases (entailment, neutral, contradiction) en frances: uso mas plausible dado el identificador `xnli`; el adaptador se cargaria sobre Llama-2-7B y se aplicaria a la cabeza de clasificacion o a la generacion de etiquetas, aunque el autor no documenta el formato exacto de inferencia.
- Experimentacion academica con LoRA sobre Llama-2: util como punto de partida reproducible para comparar estrategias de ajuste eficiente en tareas NLI multilingues, siempre que se valide su calidad de forma independiente.
- Evaluacion comparativa de adaptadores XNLI: puede servir como uno de los brazos de un estudio sobre el efecto del numero de muestras (`50000` frente a las variantes `10000` del mismo autor) en el rendimiento final.
- Prototipado de pipelines de PLN en frances: para pruebas de concepto internas donde la falta de licencia clara y de evaluacion publica no sea bloqueante.
- Investigacion sobre transferencia cross-lingue: comparar el comportamiento del adaptador frances con los adaptadores `ur` (urdu) del mismo autor para estudiar transferencia entre idiomas tipologicamente distintos.
- Docencia y formacion: ejemplo practico de publicacion de adaptadores PEFT y de los riesgos de documentacion insuficiente en model cards.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador en si ocupa unos 0,5 GB, pero requiere cargar Llama-2-7B completo. En fp16, aproximadamente 14 GB; en 8 bits, unos 7-8 GB; en 4 bits (GPTQ/AWQ/GGUF Q4), unos 4-5 GB.
- GPU recomendadas: A100 40/80 GB o H100 para inferencia en fp16 con lotes grandes; RTX 4090 (24 GB) o RTX 3090 (24 GB) para fp16 con lotes pequenos; RTX 4080/4070 Ti (16 GB) o superiores para cuantizacion 8 bits.
- Cabe en GPU de consumo: si, en 4 bits cabe en GPUs de 8 GB (RTX 3060 Ti, RTX 4060); en 8 bits, en GPUs de 12-16 GB.
- Opciones de despliegue: transformers + PEFT (carga del adaptador sobre el base), vLLM (con soporte de adaptadores LoRA), TGI, llama.cpp/Ollama (requiere fusionar el adaptador con el base y convertir a GGUF).
- Latencia y throughput: no disponibles; dependen enteramente del hardware y del backend, no del adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WijewardhanaNT/xnli_stage2_fr_50000 | 7B (base) + LoRA | 4.096 (base) | Adaptador LoRA para NLI en frances | no disponible | Hugging Face, 0 descargas |
| WijewardhanaNT/xnli_stage2_fr_10000 | 7B (base) + LoRA | 4.096 (base) | Adaptador LoRA, mismo autor, 10.000 muestras | no disponible | Hugging Face |
| WijewardhanaNT/xnli_stage2_ur_10000 | 7B (base) + LoRA | 4.096 (base) | Adaptador LoRA, mismo autor, urdu | no disponible | Hugging Face |
| meta-llama/Llama-2-7b-hf | 7B | 4.096 | Modelo base preentrenado | Llama 2 Community License | Hugging Face, ampliamente usado |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas como XLM-R o mBERT ajustados a XNLI.

## Limitaciones y advertencias

- Model card practicamente vacia: sin descripcion, sin datos de entrenamiento, sin hiperparametros y sin evaluacion. No es posible verificar que el adaptador haga lo que sugiere su nombre.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso ni validacion por parte de la comunidad.
- Licencia no declarada. El modelo base Llama-2 impone la Llama 2 Community License, con restricciones de uso comercial y requisitos de atribucion; el adaptador hereda esas restricciones en la practica, pero la ausencia de licencia explicita genera incertidumbre legal.
- Riesgo de alucinacion y sesgos heredados de Llama-2-7B, incluyendo sesgos de genero, raza y religion presentes en los datos de preentrenamiento web.
- El ajuste, si es de clasificacion NLI, puede degradar la capacidad generativa general del modelo base; no se documenta el grado de olvido catastrofico.
- Idioma: aunque el sufijo `fr` apunta al frances, no se confirma el alcance multilingue ni la calidad en otros idiomas.
- Contexto limitado a 4.096 tokens por el modelo base; no apto para tareas de contexto largo sin tecnicas adicionales.
- No recomendado para produccion sin una evaluacion independiente previa sobre el conjunto XNLI o el dominio objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/WijewardhanaNT/xnli_stage2_fr_50000
- Variante con 10.000 muestras: https://huggingface.co/WijewardhanaNT/xnli_stage2_fr_10000
- Variante en urdu: https://huggingface.co/WijewardhanaNT/xnli_stage2_ur_10000
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-hf
- Paper de XNLI (Conneau et al., 2018): https://arxiv.org/abs/1809.05053
- Referencia citada en las etiquetas (Lacoste et al., 2019, impacto ambiental): https://arxiv.org/abs/1910.09700
- Libreria PEFT: https://github.com/huggingface/peft
