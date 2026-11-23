# yoitsmeyusuf/turkmorph-gpt-360m

## Resumen

turkmorph-gpt-360m es un modelo de lenguaje base de tipo GPT-2 entrenado especificamente para turco por el desarrollador independiente yoitsmeyusuf. Su particularidad no esta en la arquitectura, sino en la tokenizacion: en lugar de usar piezas BPE, emplea turkmorph, un tokenizador morfologico sin perdida que descompone el texto en raices, sufijos y marcas de mayusculas. El modelo aprende directamente sobre esa representacion, con un vocabulario de 58.667 tokens morfologicos mas un token BOS adicional.

Con 364,3 millones de parametros totales (304,2 millones sin contar los embeddings), una arquitectura decoder pre-LN de 24 capas, dimension 1.024 y 16 cabezas de atencion, el modelo se posiciona en la gama de modelos pequenos orientados a un solo idioma. Su contexto es de 2.048 tokens, equivalentes a unos 5.900 caracteres de texto turco. Los pesos se distribuyen en safetensors en bfloat16 y el repositorio ocupa 0,7 GB.

El interes actual del modelo es fundamentalmente de investigacion: explora si una tokenizacion morfologica explicita mejora la eficiencia de aprendizaje en un idioma aglutinante como el turco, donde los tokenizadores BPE fragmentan las palabras de forma poco consistente. Segun la model card, en una comparacion controlada a 130M de parametros la variante morfologica supera a BPE en bits por caracter (BPC) en torno a un 10-12%. No es un asistente: es un checkpoint base sin ajuste por instrucciones ni filtrado de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 style pre-LN decoder, 24 capas, d_model 1024, 16 cabezas, GELU exacta, embeddings atados, sin biases |
| Parametros totales | 364.484.608 (304,2M sin embeddings) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens (aproximadamente 5.900 caracteres) |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16 safetensors) |
| Idiomas soportados | turco (tr) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder de estilo GPT-2 con normalizacion previa a cada bloque (pre-LN), 24 capas, dimension de modelo 1.024 y 16 cabezas de atencion. Usa activacion GELU exacta, embeddings atados entre entrada y salida, y elimina los terminos de bias. El vocabulario consta de 58.667 tokens morfologicos generados por turkmorph mas un token BOS extra (id 58667), lo que da un total de 58.668 entradas. La tokenizacion es reversible de forma exacta: `decode(encode(text)) == text` para cualquier entrada, y cualquier secuencia de ids que emita el modelo puede decodificarse.

El entrenamiento uso 1.000 millones de caracteres: 300 millones procedentes de Wikipedia en turco (dump 20231101, CC BY-SA 4.0) y 700 millones de FineWeb-2 en la variante `tur_Latn` (ODC-By 1.0). Los datos se mezclaron, se deduplicaron contra los conjuntos de validacion y test, y se segmentaron en fragmentos de como maximo 2.048 tokens y 5.000 caracteres. Se realizo una sola pasada de 344 millones de tokens en 13.343 pasos, con batch de 16 × 2.048, optimizador AdamW (beta 0.9/0.95, weight decay 0.1), learning rate 8e-4, warmup de 300 pasos y decaimiento coseno hasta el 10%. El entrenamiento completo se ejecuto en una unica H100 en bfloat16 durante 54 minutos. No se menciona RLHF, DPO ni ningun tipo de ajuste posterior.

La innovacion tecnica destacable es la tokenizacion morfologica: el modelo no ve subpalabras BPE sino raices etiquetadas con su categoria gramatical, sufijos con su funcion y marcas de capitalizacion y apostrofo. La model card incluye una comparacion controlada contra BPE con el mismo tamano de vocabulario, mismos datos y mismos hiperparametros ajustados: a 130M de parametros, la variante morfologica obtiene valid 1,146 y test 1,505 en BPC, frente a 1,283 y 1,714 de BPE, una mejora del 10,7% y 12,2% respectivamente.

## Capacidades

- Generacion de texto en turco con morfologia fluida: el modelo produce flexiones, sufijos y concordancia correctas gracias a la representacion morfologica del vocabulario.
- Modelado de lenguaje base: prediccion del siguiente token sobre secuencias de tokens morfologicos, util para evaluacion de perplexity y BPC.
- Codificacion y decodificacion exactas mediante turkmorph: cualquier texto turco se puede tokenizar y reconstruir sin perdida.
- Generacion de longitud fija: al no haberse entrenado un token de fin de texto, la generacion se detiene por numero de tokens, no por criterio del modelo.
- Sin soporte de tool calling ni function calling: no es un modelo ajustado por instrucciones.
- Sin capacidades de agente ni razonamiento multi-paso entrenado de forma explicita.
- Sin vision, audio ni modo thinking.
- Multilingue: no, exclusivamente turco.

## Casos de uso

- Investigacion sobre tokenizacion morfologica: punto de partida para reproducir o extender el experimento de comparacion entre tokenizadores morfologicos y BPE en idiomas aglutinantes, usando el BPC como metrica independiente del tokenizador.
- Generacion de texto turco de dominio general: redaccion de parrafos coherentes en turco para prototipos, siempre con revision humana dado que el modelo inventa hechos.
- Completado de texto y autocompletado en editores: con 2.048 tokens de contexto y decodificacion exacta, puede integrarse en herramientas de escritura en turco para sugerir continuaciones morfologicamente correctas.
- Base para fine-tuning supervisado: al ser un checkpoint base con licencia Apache 2.0, sirve como inicializacion para tareas downstream en turco (clasificacion, extraccion, resumen) con datasets propios.
- Experimentos de eficiencia de entrenamiento: su coste de entrenamiento documentado (54 minutos en una H100) lo hace adecuado para estudios academicos con recursos limitados y para replicar resultados.
- Analisis linguistico asistido: la representacion intermedia en raices y sufijos permite inspeccionar como el modelo segmenta y predice estructuras morfologicas del turco.
- Evaluacion de modelos de lenguaje en turco: util como referencia de un modelo pequeno y monoidioma para comparar BPC frente a modelos multilingues de mayor tamano.

## Benchmarks y rendimiento

La model card no reporta resultados en benchmarks estandar (MMLU, HumanEval, GSM8K). Publica unicamente bits por caracter (BPC) sobre texto retenido de las mismas fuentes:

| Split | Caracteres | BPC |
|---|---:|---:|
| valid | 2,01M | 1,1850 (pesos bf16 exportados: 1,1854) |
| test | 2,00M | 1,1577 |

Comparacion controlada contra BPE (desde el repositorio turkmorph, sobre BellaTurca, 300M caracteres de entrenamiento, mismo vocabulario de 58.667, mismo texto e hiperparametros ajustados):

| Modelo | Parametros | BPC valid | BPC test |
|---|---:|---:|---:|
| turkmorph (morfologico) | 130M | 1,146 | 1,505 |
| BPE | 130M | 1,283 | 1,714 |

No se han publicado resultados de benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 0,7 GB para los pesos, mas overhead de activaciones y cache KV; en la practica cabe en cualquier GPU con 2 GB o mas.
- GPU recomendadas: H100 o A100 para entrenamiento o fine-tuning; RTX 4090, RTX 3090, RTX 4080 o superiores para inferencia comoda.
- Cabe en GPU de consumo: si, incluidas tarjetas de gama media con 4-6 GB de VRAM; tambien puede ejecutarse en CPU para pruebas.
- Opciones de despliegue: transformers con `GPT2LMHeadModel`; el pipeline de text-generation-inference esta etiquetado como compatible (`endpoints_compatible`). No se documenta soporte para llama.cpp, Ollama ni vLLM, y la dependencia del tokenizador turkmorph (extension Rust) complica el uso en servidores de inferencia genericos.
- Latencia y throughput: no disponibles. El entrenamiento completo tardo 54 minutos en una H100, lo que da una idea del orden de magnitud del coste computacional del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Tokenizador |
|---|---:|---:|---|---|---|
| turkmorph-gpt-360m | 364M | 2.048 | turco | Apache 2.0 | turkmorph (morfologico) |
| turkmorph-hourglass-360m | 360M (mismo tamano) | no disponible | turco | no disponible | turkmorph (word-level hourglass) |
| GPT-2 small (referencia) | 124M | 1.024 | ingles | MIT | BPE |
| Modelos BPE turcos de ~130M (comparacion de la model card) | 130M | no disponible | turco | no disponible | BPE |

La comparacion directa mas relevante es con turkmorph-hourglass-360m, variante de nivel de palabra del mismo autor, mismo tamano y mismos datos, que resulto un 2,9% peor en BPC y un 19% mas rapida de entrenar. Frente a modelos BPE de tamano similar, la evidencia disponible apunta a una ventaja de BPC del orden del 10-12% a 130M de parametros, aunque no se ofrecen comparaciones a 360M con modelos externos.

## Limitaciones y advertencias

- Checkpoint de investigacion: no es un asistente, no esta ajustado por instrucciones ni por seguridad, y no debe usarse como chatbot sin fine-tuning.
- Alucinacion: el modelo inventa hechos con facilidad; la model card lo advierte explicitamente. No es fiable para generacion factual sin verificacion.
- Sesgo de texto web: FineWeb-2 aporta los sesgos propios de la web, que el modelo reproduce; no hay filtrado adicional mas alla del de las fuentes.
- Generacion de longitud fija: no se entreno un token de fin de texto, por lo que la generacion no termina de forma natural y requiere un limite explicito de tokens.
- Cobertura limitada: un solo idioma (turco), un solo entrenamiento y una sola semilla; sin validacion multi-semilla de los resultados.
- Dependencia del tokenizador: requiere instalar turkmorph desde el repositorio (extension Rust, necesita toolchain de Rust hasta que haya wheels en PyPI) y la version del vocabulario debe coincidir exactamente con `turkmorph_vocab.json`; `generate.py` se niega a ejecutarse si no coincide.
- Contexto corto: 2.048 tokens limitan tareas que requieran documentos largos o conversaciones extensas.
- Licencia: Apache 2.0 permite uso comercial, pero la condicion de checkpoint base sin filtrado de seguridad traslada al desplegador la responsabilidad sobre el contenido generado.
- Adopcion practicamente nula: 0 descargas y 0 likes en el momento de la consulta, sin comunidad que haya validado el modelo de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yoitsmeyusuf/turkmorph-gpt-360m
- Repositorio del tokenizador turkmorph: https://github.com/yoitsmeyusuf/turkmorph
- Variante hourglass: https://huggingface.co/yoitsmeyusuf/turkmorph-hourglass-360m
- Dataset Wikipedia en turco: https://huggingface.co/datasets/wikimedia/wikipedia
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
