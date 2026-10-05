# yuanxin112/babylm-deu-bpe16k-gpt2-10m

## Resumen

babylm-deu-bpe16k-gpt2-10m es un modelo de lenguaje autoregresivo en alemán entrenado desde cero por yuanxin112 (Yuanxin Li) siguiendo la receta del baseline `BabyLM-community/deu-baseline-small` de la comunidad BabyLM. La única desviación declarada respecto a esa receta es el vocabulario: 16 384 tokens en lugar de 8192, mediante un BPE a nivel de byte entrenado localmente. El modelo se enmarca en el contexto del reto BabyLM (actualmente en su cuarta edición, BabyLM 4 en EMNLP 2026), cuyo objetivo es estudiar el aprendizaje del lenguaje con presupuestos de datos comparables a los de un niño.

Arquitectónicamente es un transformer decoder-only de tipo GPT-2, con 4 capas, 8 cabezas de atención, dimensión de embedding 512 y 21,26 millones de parámetros totales (frente a los 17,1 M del baseline oficial, diferencia atribuible íntegramente a la tabla de embeddings más grande). La longitud de contexto es de 512 tokens y el entrenamiento se realizó sobre una reconstrucción local del corpus German BabyLM de 10 millones de palabras, durante 5 épocas, con una pérdida de evaluación final de 4,357.

Su relevancia es fundamentalmente de investigación: se trata de un modelo pequeño y reproducible, pensado para experimentos controlados de adquisición del lenguaje, comparativas de tokenizadores y estudios de eficiencia de datos, no para aplicaciones en producción. No tiene descargas ni likes en HuggingFace y no declara licencia, lo que limita su uso comercial sin aclaración previa del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT2LMHeadModel (transformer decoder-only) |
| Parametros totales | 21.261.312 (21,3 M; baseline oficial: 17,1 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (n_positions = n_ctx = 512) |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32; no se ofrecen variantes cuantizadas) |
| Idiomas soportados | aleman (de) |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers) |

Detalles adicionales de configuracion: n_layer 4, n_head 8, n_embd 512, n_inner 2048, activacion gelu, dropouts de atencion/embedding/residual 0,1, initializer_range 0,02, epsilon de layer norm 1e-5, vocab_size 16 384.

## Arquitectura y entrenamiento

El modelo es un GPT-2 estándar (transformer decoder-only con atención causal y pre-normalización mediante layer norm) configurado en su variante más pequeña. La innovación técnica no está en la arquitectura, que replica campo por campo la receta oficial, sino en el tokenizador: un BPE a nivel de byte de 16 384 entradas, con tokens especiales `[PAD]=0`, `[UNK]=1`, `[BOS]=2`, `[EOS]=3`. El autor señala que esto corrige un problema del baseline oficial, cuyo campo bos/eos conserva el valor por defecto de GPT-2 (50256) que ni siquiera existe en su vocabulario de 8192. El aumento de vocabulario reduce la fertilidad del tokenizador sobre alemán, de ahí que el número de pasos por época sea de aproximadamente 510 frente a los 4944 del baseline oficial.

El entrenamiento se realizó con learning rate 1e-4, decaimiento lineal sin warmup, 5 épocas, batch de entrenamiento 64, batch de evaluación 8, semilla 42, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-8, weight_decay 0 y precisión fp32 con bloques de 512 tokens. Los datos son una reconstrucción local (`babylm_deu_10m.txt`) del corpus German BabyLM de 10 millones de palabras, con cuotas de género ajustadas entre inglés y alemán; no se empleó la descarga oficial del hub. Se reservó el 1 % para evaluación, obteniendo una eval_loss final de 4,357. No se documenta ningún proceso de ajuste por instrucciones, RLHF o DPO, ni se mencionan técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto autoregresiva en alemán mediante next-token prediction; es la única capacidad entrenada explícitamente.
- Continuación de texto dado un prefijo, tal como se muestra en el ejemplo de uso de la model card.
- Modelado de lenguaje a nivel de token útil para calcular perplejidad y pérdida.
- No dispone de soporte de tool calling ni de function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso entrenadas.
- Capacidad multilingüe limitada al alemán, con posible contaminación procedente de las cuotas de género inglés/alemán del corpus.
- Sin modo de pensamiento (thinking mode), sin visión, sin audio y sin otras modalidades.
- Su vocabulario de 16 384 tokens favorece una segmentación más eficiente del alemán que el baseline de 8192.

## Casos de uso

- Investigación en adquisición del lenguaje: sirve como punto de comparación controlado frente a otros modelos BabyLM para estudiar qué estructuras lingüísticas se adquieren con 10 millones de palabras y qué efecto tiene el tamaño del vocabulario.
- Experimentos de tokenización: permite medir cómo afecta pasar de un vocabulario de 8192 a uno de 16 384 en la pérdida por token, la fertilidad y la calidad de la generación en alemán, siempre recordando que la pérdida por token no es comparable entre vocabularios distintos.
- Evaluación de sesgos lingüísticos en recursos de bajo presupuesto: al ser un modelo pequeño, se pueden ejecutar búsquedas exhaustivas de sesgos de género, registro o dominio a un coste computacional mínimo.
- Generación de texto de prueba en pipelines de evaluación: útil para generar corpus sintéticos pequeños o datos de relleno en pruebas unitarias de sistemas de PLN en alemán.
- Docencia y divulgación: su tamaño de 21 M de parámetros permite entrenarlo y analizarlo por completo en una CPU o una GPU doméstica, lo que lo hace idóneo para cursos de PLN sobre transformers.
- Baseline de referencia en competiciones tipo BabyLM: puede servir como punto de partida reproducible sobre el que medir mejoras de arquitectura, datos o tokenizador en la pista Strict-Small.
- Estudio de la influencia del corpus reconstruido: dado que el autor no usó la descarga oficial, permite comparar el efecto de distintas reconstrucciones del mismo corpus sobre la pérdida final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni similares) en la información disponible. El único dato numérico reportado es la pérdida de evaluación final sobre el 1 % reservado del corpus:

| Metrica | Valor | Notas |
|---|---|---|
| eval_loss (1 % held out, vocab 16 384, corpus 10M) | 4,357 | Punto de comparación del propio autor |
| eval_loss (repo pareja -100m, vocab 16 384) | 3,56 | Sobre corpus de 100M palabras |
| eval_loss (deu-baseline-small oficial, vocab 8192) | 3,0813 | No comparable directamente: distinto vocabulario, distinta reconstrucción de corpus y distinto split de evaluación |

El autor advierte explícitamente que la comparación entre estas cifras no es equivalente, porque un vocabulario menor produce menor entropía por token y, por tanto, una pérdida por token sistemáticamente más baja.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32 los 21,26 M de parámetros ocupan aproximadamente 85 MB, más el tokenizador y los estados de activación; en la práctica cabe en menos de 500 MB de memoria total.
- GPU recomendadas: cualquiera, incluidas GPU integradas. También es viable en CPU pura.
- Cabe en cualquier GPU de consumo: GTX 1050, RTX 3060, RTX 4090, etc., sin ninguna restricción de memoria.
- Opciones de despliegue: transformers (ruta documentada por el autor), y potencialmente llama.cpp, Ollama o vLLM si se convierte el modelo a los formatos correspondientes, aunque no se documenta ninguna conversión oficial.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Por el tamaño, se espera una latencia de milisegundos por token en CPU moderna y muy inferior en GPU, pero es una estimación no verificada.
- Almacenamiento: el repositorio ocupa 0,1 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vocab | Datos de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| yuanxin112/babylm-deu-bpe16k-gpt2-10m | 21,3 M | 512 | 16 384 | German BabyLM, 10M palabras (reconstruccion local) | no disponible | HuggingFace, 0 descargas |
| BabyLM-community/deu-baseline-small | 17,1 M | 512 (receta equivalente) | 8192 | German BabyLM, 100M palabras | no disponible | HuggingFace (comunidad BabyLM) |
| BabyLM-community/babylm-baseline-10m-gpt2 | 124 M | no disponible | no disponible | 10 epocas sobre ~100M palabras, ingles | no disponible | HuggingFace (comunidad BabyLM) |

El primero y el segundo comparten receta y arquitectura, diferenciándose en el tokenizador y en el volumen de datos; el tercero es un baseline en inglés de escala superior, útil como referencia de la pista Strict-Small del reto de 2025 pero no comparable en idioma.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados explícitamente, pero al entrenarse sobre el corpus German BabyLM con cuotas de género ajustadas, puede heredar sesgos de género, registro y dominio presentes en las fuentes originales.
- Riesgo de alucinación: alto para cualquier tarea de conocimiento factual. Con 21 M de parámetros y 10 M de palabras de entrenamiento, el modelo no almacena conocimiento del mundo y producirá texto plausible pero no veraz.
- Limitaciones de contexto: ventana de solo 512 tokens, insuficiente para documentos largos, diálogos extensos o resúmenes de múltiples fuentes.
- Limitaciones de idioma: entrenado únicamente en alemán; su uso en otros idiomas producirá resultados degradados, aunque el tokenizador a nivel de byte evite tokens desconocidos.
- Restricciones de licencia: la licencia no está disponible, por lo que no se puede asumir uso comercial libre sin consultar al autor.
- Caveat de producción: no hay resultados de benchmarks estándar, ni pipeline de evaluación, ni soporte de tool calling; no es adecuado como componente de un sistema en producción.
- Caveat de comparabilidad: la pérdida reportada no es comparable con la del baseline oficial de 8192 tokens por diferencias de vocabulario, reconstrucción de corpus y split de evaluación, tal como advierte el propio autor.
- Trazabilidad de datos: el corpus es una reconstrucción local, no la descarga oficial del hub, lo que dificulta reproducir exactamente la comparación con el baseline de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yuanxin112/babylm-deu-bpe16k-gpt2-10m
- Perfil del autor en HuggingFace: https://huggingface.co/yuanxin112/datasets
- Modelo de referencia de la receta: https://huggingface.co/BabyLM-community/deu-baseline-small
- Baseline en ingles de 10M de palabras: https://huggingface.co/BabyLM-community/babylm-baseline-10m-gpt2
- Sitio del reto BabyLM: https://babylm.github.io/
- Repositorio auxiliar de modelos gratuitos citado en la busqueda: https://github.com/ClawLabsAI/free-ai-models
- Modelos abiertos de OpenAI citados en la busqueda: https://openai.com/open-models/
