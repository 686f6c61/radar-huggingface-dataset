# vanshnawander/assignment2-moe-top1

## Resumen

`vanshnawander/assignment2-moe-top1` es un transformer decoder-only de tipo mezcla de expertos (MoE) con enrutamiento top-1, entrenado especificamente para traduccion de vietnamita y japones a ingles. Lo publica el usuario `vanshnawander` en HuggingFace y, por su tamano, se enmarca en la categoria de modelos experimentales muy pequenos: 35.402.752 parametros totales, de los cuales hasta 25.977.856 estan activos por token, seis capas, ocho cabezas de atencion, tamano oculto de 512 y una ventana de contexto de solo 256 tokens.

El modelo no sigue el formato estandar de `transformers`: se distribuye como codigo PyTorch propio (`load_model.py`, `decoding.py`) y pesos en un unico fichero `model_state.pt`, por lo que requiere `trust_remote_code` o la revision manual del codigo fuente antes de importarlo. El tokenizador es un BPE a nivel de byte con vocabulario de 32.000 entradas, con identificadores especiales reservados para PAD, BOS, EOS, SEP y para los idiomas de origen (VI=4, JA=5).

Su relevancia es acotada pero clara para quien trabaja en eficiencia de arquitecturas: sirve como caso de estudio reproducible de un MoE top-1 a escala de decenas de millones de parametros, con resultados de evaluacion declarados (perplejidad de test 68,8319 y BLEU 18,3875) y sin corpus de entrenamiento ni credenciales incluidos en el repositorio. No es un modelo apto para produccion en traduccion general, dado su tamano, su contexto de 256 tokens y la ausencia de licencia declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con mezcla de expertos (MoE) y enrutamiento top-1 |
| Parametros totales | 35.402.752 |
| Parametros activos | Hasta 25.977.856 por token |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible (no se distribuyen pesos cuantizados; solo `model_state.pt` en precision original) |
| Idiomas soportados | Vietnamita y japones como origen, ingles como destino (segun la model card); el campo de idiomas de HuggingFace figura como no disponible |
| Licencia | no disponible |
| Formato de pesos | `model_state.pt` (state dict de PyTorch con tensores unicamente); codigo de arquitectura en fuente Python propio; tokenizador en `tokenizer.json` |

Detalles adicionales de configuracion: 6 capas, 8 cabezas de atencion, tamano oculto 512 y vocabulario de 32.000 tokens de tipo byte-level BPE. Identificadores especiales: PAD=0, BOS=1, EOS=2, SEP=3, VI=4, JA=5.

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only con capas de mezcla de expertos y enrutamiento top-1, es decir, cada token se dirige a un unico experto. Con 35,4 M de parametros totales y 25,98 M activos por token, la proporcion de parametros activos ronda el 73 %, lo que indica un reparto de expertos relativamente poco agresivo en comparacion con MoE de gran escala. La configuracion es minima: 6 capas, 8 cabezas y dimension oculta 512, con una ventana de contexto de 256 tokens que limita estrictamente la longitud de las secuencias de entrada.

El modelo esta especializado en traduccion vietnamita-ingles y japones-ingles. El formato de prompt documentado es `[BOS, language_id, source_tokens..., SEP]` para traduccion y `[BOS, text_tokens...]` para continuacion de texto, donde `language_id` es VI=4 o JA=5. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO. El repositorio incluye ficheros JSON con la arquitectura, los ajustes de entrenamiento y los resultados de evaluacion, pero no el corpus de entrenamiento ni las credenciales asociadas, y los estados del optimizador y del generador aleatorio permanecen en los checkpoints locales originales del autor.

## Capacidades

- Generacion de texto autoregresiva con logits por token, mediante `model(...)` sobre secuencias de identificadores.
- Traduccion automatica de vietnamita a ingles y de japones a ingles, con seleccion explicita del idioma de origen mediante token especial.
- Continuacion de texto, usando el formato de prompt sin token de idioma.
- Decodificacion basada en forward, con utilidades incluidas en `decoding.py`.
- Tokenizacion byte-level BPE con vocabulario de 32.000 entradas y soporte de tokens especiales de idioma y separador.
- No hay evidencia de soporte de tool calling, function calling, uso de agentes, razonamiento multi-paso, vision, audio ni modo de razonamiento explicito (thinking mode) en la informacion disponible.
- Capacidad multilingue limitada a los tres idiomas declarados (vietnamita, japones, ingles); no se documentan otros.

## Casos de uso

- Estudio academico de arquitecturas MoE: el modelo sirve como implementacion minima y auditable de un MoE top-1, util para reproducir experimentos de enrutamiento y balanceo de expertos sin necesidad de clústeres de GPU.
- Referencia de comparacion en trabajos de eficiencia: permite medir el coste real de activar el 73 % de los parametros por token frente a un modelo denso del mismo tamano total.
- Traduccion de fragmentos muy cortos en prototipos: frases o titulares de menos de 256 tokens desde vietnamita o japones al ingles, integrados en scripts de prueba.
- Pruebas de tokenizacion multilingue: validacion de pipelines de tokenizacion byte-level BPE con vocabularios de 32.000 entradas y tokens de idioma explicitos.
- Docencia y formacion: ejemplo completo y ligero de carga de pesos personalizados, prompt con tokens especiales y decodificacion basada en forward para cursos de NLP.
- Evaluacion de riesgos en la carga de codigo remoto: caso practico para ilustrar por que es necesario revisar el codigo fuente de un repositorio con arquitectura personalizada antes de importarlo.
- Fine-tuning experimental en entornos con recursos minimos: al caber en CPU o en cualquier GPU de consumo, puede ajustarse para tareas de traduccion de dominio muy acotado (por ejemplo, terminologia tecnica) partiendo de los pesos publicados.

## Benchmarks y rendimiento

Los unicos resultados declarados por el autor en la model card son los siguientes, medidos sobre el conjunto de test del propio autor:

| Metrica | Resultado | Conjunto |
|---|---|---|
| Perplejidad | 68,8319 | Test |
| BLEU | 18,3875 | Test |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, FLORES-200, WMT, etc.) en la informacion disponible, ni comparaciones con otros modelos en esos conjuntos. Tampoco se detalla la composicion ni el tamano del conjunto de test, por lo que el BLEU de 18,3875 no es directamente comparable con cifras publicadas en benchmarks de traduccion reconocidos.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir del numero de parametros, no publicada por el autor): en FP32, unos 142 MB de pesos; en FP16/BF16, unos 71 MB; en int8, unos 35 MB; en int4, unos 18 MB.
- Cache KV muy reducida: con 6 capas, 8 cabezas, dimension de cabeza 64 y contexto de 256 tokens, el cache completo en FP16 ocupa aproximadamente 3 MB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; no se requiere A100, H100 ni similar. Tambien es viable en GPU integradas y en CPU.
- Cabe en GPU de consumo: si, en cualquier modelo (RTX 4090, RTX 3060, GTX 1650, e incluso en placas integradas y en dispositivos tipo Raspberry Pi para inferencia en FP32).
- Opciones de despliegue: al no seguir el formato estandar de `transformers`, no es compatible directamente con vLLM, TGI, Ollama o llama.cpp sin trabajo previo de conversion. El unico camino documentado es cargar `model_state.pt` y el codigo fuente propio con PyTorch, mas el tokenizador de la libreria `tokenizers`.
- Latencia y throughput estimados: no disponibles. No hay cifras publicadas; por el tamano del modelo, la latencia estara dominada por el overhead de Python y del enrutamiento MoE mas que por el coste de calculo de las matrices.

## Comparativa con modelos similares

No se dispone de datos verificados de los modelos comparables en la informacion proporcionada. La tabla siguiente identifica alternativas de la misma categoria (traduccion automatica de vietnamita/ingles y japones/ingles, y modelos multilingues de traduccion) unicamente como referencia de categoria; sus cifras no han podido confirmarse con las fuentes disponibles.

| Modelo | Enfoque | Parametros | Contexto | Licencia |
|---|---|---|---|---|
| vanshnawander/assignment2-moe-top1 | MoE decoder-only, vi/ja a en | 35,4 M totales / 25,9 M activos | 256 tokens | no disponible |
| Helsinki-NLP/opus-mt-vi-en | Transformer seq2seq dedicado a un par de idiomas | no disponible | no disponible | no disponible |
| facebook/mbart-large-50 | Transformer seq2seq multilingue | no disponible | no disponible | no disponible |
| facebook/nllb-200-distilled-600M | Transformer seq2seq multilingue | no disponible | no disponible | no disponible |

Diferencias cualitativas que si se pueden afirmar con la informacion disponible: el modelo aqui descrito es un decoder-only con enrutamiento top-1 (no un encoder-decoder como las alternativas seq2seq), esta especializado en dos pares de idiomas con origen en vietnamita y japones, y su contexto de 256 tokens es muy inferior al de las alternativas multilingues de gran escala. Su licencia no esta declarada, lo que impide comparar condiciones de uso comercial.

## Limitaciones y advertencias

- Contexto muy corto: 256 tokens. Los documentos largos deben fragmentarse, lo que degrada la coherencia de la traduccion en textos extensos.
- Calidad limitada: una perplejidad de test de 68,8319 es un valor alto y sugiere una modelizacion pobre del lenguaje; un BLEU de 18,3875 esta lejos de los sistemas de traduccion modernos, y no se especifica el conjunto de evaluacion.
- Sesgos conocidos: no disponibles. No hay informacion sobre la composicion del corpus, por lo que no se puede auditar el sesgo por dominio, genero o registro.
- Riesgo de alucinacion: no evaluado en la informacion disponible. En traduccion, el riesgo se traduce en omisiones, adiciones y falsas equivalencias, especialmente fuera del dominio de entrenamiento.
- Licencia no declarada: sin licencia explicita no hay autorizacion clara para uso comercial, redistribucion o modificacion. Tratar como uso restringido hasta que el autor lo aclare.
- Idiomas: solo se declaran vietnamita, japones e ingles. No se documenta comportamiento en castellano ni en otros idiomas, y el campo de idiomas de la ficha de HuggingFace figura como vacio.
- Codigo personalizado: la arquitectura se distribuye como fuente Python que debe importarse y ejecutarse. Esto implica riesgo de seguridad y de reproducibilidad; hay que revisar el codigo antes de cargarlo, tal como advierte el propio autor.
- Trazabilidad: el repositorio no incluye el corpus de entrenamiento ni los estados del optimizador o del generador aleatorio, por lo que la reproducibilidad completa del entrenamiento no es posible con lo publicado.
- Confusión potencial de nombres: el sufijo "assignment2" sugiere un trabajo de asignatura o practica academica, no un modelo mantenido con garantias de soporte.
- Adopcion nula: cero descargas y cero "likes" en HuggingFace en el momento de la consulta, lo que implica ausencia de validacion externa por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vanshnawander/assignment2-moe-top1
- Ficheros citados en la model card (dentro del repositorio): `load_model.py`, `decoding.py`, `model_state.pt`, `tokenizer.json`, `requirements.txt` y ficheros JSON con arquitectura, ajustes de entrenamiento y resultados de evaluacion.
- No se han encontrado en la busqueda web enlaces relevantes al modelo (paper, blog, repositorio de codigo o demo). El resto de resultados devueltos por la busqueda no guardan relacion con este modelo y se han descartado.
