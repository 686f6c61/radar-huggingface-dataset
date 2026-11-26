# stefan-it/zeitunks-lm-v1-ner-onb

## Resumen

Zeitunks-LM Fine-Tuned On ONB es un modelo de reconocimiento de entidades nombradas (NER) para aleman historico, desarrollado por Stefan Schweter (stefan-it). Se trata de un ajuste fino del encoder BiXL-Kron (`stefan-it/zeitunks-lm-v1`), una arquitectura bidireccional basada en KronLSTM preentrenada sobre periodicos alemanes historicos. El modelo resuelve la tarea de extraccion de entidades (LOC, ORG, PER) en textos de prensa historica, un dominio con ortografia variable, tipografia ruidosa y vocabulario arcaico donde los transformers clasicos con embeddings posicionales rinden peor.

El modelo es relevante por su caracter attention-free: no usa mecanismo de atencion ni embeddings posicionales, lo que reduce el coste cuadratico en secuencias largas y lo hace atractivo para digitalizacion de archivos historicos a gran escala. Con 96,9 millones de parametros y un peso de repositorio de 0,8 GB, es lo bastante pequeno para ejecutarse en hardware modesto. Se distribuye bajo licencia Apache 2.0 y requiere codigo remoto (`trust_remote_code=True`) por sus kernels KronLSTM personalizados.

El checkpoint corresponde a un unico seed (el de mejor F1 en dev) dentro de una busqueda de learning rate con 10 seeds por tasa. Alcanza 90,05 F1 en dev y 88,22 F1 en test a nivel de span, con una media de 88,90 ± 0,78 en dev sobre los 10 seeds a esa tasa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BiXL-Kron: encoder bidireccional KronLSTM, sin atencion y sin embeddings posicionales |
| Parametros totales | 96.940.103 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 piezas por chunk (las frases mas largas se dividen y se reensamblan) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | aleman (de), orientado a aleman historico |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tarea | token-classification (NER, etiquetado IOB2) |
| Etiquetas | 7 (O, B/I de LOC, ORG, PER) |
| Modelo base | stefan-it/zeitunks-lm-v1 |
| Tamano del repositorio | 0,8 GB |

## Arquitectura y entrenamiento

El encoder base es BiXL-Kron, una variante bidireccional de KronLSTM (familia de modelos recurrentes lineales derivada de xLSTM). Prescinde por completo del mecanismo de atencion y de los embeddings posicionales, lo que elimina el coste cuadratico y permite procesar secuencias largas con memoria lineal. La cabeza de clasificacion es LayerNorm, dropout 0,1 y una capa lineal aplicada sobre la primera pieza de cada palabra (`pooling: first`), de modo que cada palabra recibe una unica etiqueta.

El ajuste fino se realizo sobre el corpus NER aleman de Europeana de la Biblioteca Nacional de Austria (ONB), introducido en "A Named Entity Recognition Shootout for German" (Riedl & Pado, ACL 2018). Los splits empleados son 1.145 frases (27.511 tokens) en train, 143 frases (3.430 tokens) en dev y 143 frases (3.781 tokens) en test. Se uso AdamW (beta 0,9/0,999, epsilon 1e-8, weight decay 0), learning rate 3e-5 con warmup lineal del 10 % de los pasos y decaimiento lineal posterior, batch de 16 frases, 10 epocas con seleccion por mejor F1 en dev (epoca 8), clipping de gradiente 1,0, dropout de encoder 0,1, precision bf16 y seed 10. El learning rate se eligio de una rejilla de 8 valores, cada uno ejecutado con 10 seeds (1 a 10), tomando la tasa con mejor F1 medio en dev. El entrenamiento se ejecuto en modo determinista y reprodujo byte a byte las predicciones de la ejecucion equivalente de la rejilla.

## Capacidades

- Reconocimiento de entidades nombradas en aleman historico con tres tipos: LOC (ubicaciones), ORG (organizaciones) y PER (personas).
- Etiquetado a nivel de palabra mediante pooling sobre la primera pieza del tokenizador.
- Procesamiento de frases largas mediante division en chunks de 512 piezas y reensamblado posterior.
- Inferencia sin atencion, con kernels KronLSTM (Triton en CUDA, implementacion de referencia en CPU).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni uso como agente.
- No dispone de modo thinking, vision ni audio.
- Capacidad multilingue limitada al aleman; no se documenta soporte de otras lenguas.

## Casos de uso

- Digitalizacion de archivos de prensa historica: el modelo extrae personas, lugares y organizaciones de paginas OCRizadas de periodicos alemanes de los siglos XIX y XX, alimentando indices de busqueda y metadatos estructurados. Su entrenamiento especifico en el corpus ONB lo hace adecuado para este dominio concreto.
- Enriquecimiento de colecciones de bibliotecas digitales: integracion en pipelines de Europeana o repositorios similares para etiquetar automaticamente entidades y facilitar la navegacion por autor, lugar de publicacion u organizacion citada.
- Investigacion historica y humanidades digitales: extraccion masiva de menciones de personas y lugares para estudios de redes sociales, prosopografia o analisis de discurso en corpus de epoca.
- Construccion de grafo de conocimiento historico: las entidades LOC/ORG/PER detectadas pueden resolverse contra vocabularios controlados (GND, Wikidata) para generar grafos de relaciones entre actores historicos.
- Limpieza y normalizacion de transcripciones OCR: el modelo identifica nombres propios que el OCR ha deformado, permitiendo correccion asistida o marcado de tokens de interes para revision humana.
- Procesamiento por lotes en CPU: gracias a sus 96,9 M de parametros y a la implementacion de referencia en CPU de los kernels KronLSTM, puede ejecutarse en servidores sin GPU para tareas de digitalizacion masiva no urgentes.
- Prototipado de NER historico en investigacion: como linea base reproducible (receta determinista, 10 seeds documentados) para comparar encoders alternativos en aleman historico.

## Benchmarks y rendimiento

F1 micro a nivel de span (IOB2) sobre los splits oficiales del corpus ONB:

| Modelo / configuracion | dev F1 | test F1 |
|---|---|---|
| Este checkpoint (seed 10, lr 3e-5) | 90,05 | 88,22 (P 87,13 / R 89,34) |
| Media ± desv. sobre 10 seeds a lr 3e-5 | 88,90 ± 0,78 | 86,94 ± 1,14 |

Rejilla de learning rate (media ± desviacion poblacional sobre 10 seeds):

| Learning rate | dev F1 | test F1 |
|---|---|---|
| 5e-6 | 87,89 ± 0,41 | 85,38 ± 0,74 |
| 1e-5 | 88,70 ± 0,56 | 86,33 ± 0,83 |
| 2e-5 | 88,87 ± 0,64 | 86,82 ± 1,34 |
| 3e-5 | 88,90 ± 0,78 | 86,94 ± 1,14 |
| 5e-5 | 88,84 ± 0,57 | 85,53 ± 1,56 |
| 1e-4 | 86,70 ± 0,85 | 84,92 ± 0,73 |
| 2e-4 | 82,32 ± 1,07 | 80,12 ± 1,56 |
| 4e-4 | 72,56 ± 1,08 | 71,60 ± 1,13 |

No se han publicado en la informacion disponible resultados de benchmarks comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros), dado que la tarea es NER y no generacion.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,4 GB solo para pesos (96,9 M de parametros × 4 bytes); en bf16, unos 0,2 GB. El consumo real dependera del tamano de batch y de la longitud de secuencia.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, e incluso en GPUs integradas o CPU.
- GPU recomendadas para produccion a gran escala: A100, H100 o L4 para procesamiento por lotes de alta concurrencia; no obstante, el modelo es lo bastante pequeno para no requerir estas tarjetas.
- Despliegue: transformers con `trust_remote_code=True` y el fork fijado de `flash-linear-attention` (NX-AI/KronLSTM, commit 3d800c9a). Los kernels usan Triton en CUDA y una implementacion de referencia en CPU. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Requiere padding por la derecha exclusivamente; las entradas se rellenan internamente a multiplos de 64 piezas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| stefan-it/zeitunks-lm-v1-ner-onb | 96,9 M | 512 piezas | KronLSTM bidireccional, sin atencion | Apache 2.0 | Hugging Face |
| Modelos NER alemanes de Flair (p. ej. `flair/ner-german`) | no disponible | no disponible | BiLSTM + embeddings contextuales | no disponible | Hugging Face |
| Encoders transformer tipo German BERT ajustados a NER | ~110 M (BERT-base) | 512 tokens | Transformer con atencion y posiciones | no disponible | Hugging Face |

No se dispone de datos de benchmarks comparativos directos entre estos modelos en la informacion proporcionada; la comparacion se limita a caracteristicas arquitectonicas y de licencia.

## Limitaciones y advertencias

- Dominio restringido: el modelo esta entrenado sobre un corpus pequeno (27.511 tokens de entrenamiento) de prensa historica austriaca; su rendimiento fuera de ese dominio (texto contemporaneo, otras variedades del aleman) no esta documentado y probablemente sea inferior.
- Solo tres tipos de entidad (LOC, ORG, PER); no detecta MISC ni otras categorias.
- Riesgo de alucinacion de entidades en textos con OCR muy degradado o tipografia inusual.
- El checkpoint publicado es un unico seed seleccionado sobre dev; la varianza entre seeds es apreciable (desviacion tipica de 0,78 en dev y 1,14 en test), por lo que el rendimiento en produccion puede diferir del valor puntual reportado.
- Requiere `trust_remote_code=True` y una dependencia externa fijada a un commit concreto de un fork de `flash-linear-attention`; esto anade riesgo de mantenimiento y de reproducibilidad a largo plazo.
- Soporte unicamente de aleman; no se documentan capacidades multilingues.
- Licencia Apache 2.0 permite uso comercial, pero deben respetarse las condiciones del corpus ONB subyacente y de los pesos del modelo base.
- El modelo solo realiza etiquetado de tokens; no genera texto ni admite instrucciones, por lo que no debe emplearse en tareas generativas.
- La card indica que el script de empaquetado y la propia model card fueron generados por modelos Claude; la receta y los numeros son del autor, pero conviene verificar la reproducibilidad de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/stefan-it/zeitunks-lm-v1-ner-onb
- Modelo base: https://huggingface.co/stefan-it/zeitunks-lm-v1
- Paper del corpus ONB (Riedl & Pado, ACL 2018): https://aclanthology.org/P18-2020/
- Fork de flash-linear-attention con kernels KronLSTM: https://github.com/NX-AI/KronLSTM
- Repositorio BiXL (script de ajuste fino `finetuning/finetune_ner.py`): no disponible como URL directa en la informacion proporcionada
