# tsubu-ai/modernbert-ja-130m-toxicity

## Resumen

modernbert-ja-130m-toxicity es un clasificador binario de toxicidad para japones, desarrollado por tsubu-ai mediante fine-tuning de sbintuitions/modernbert-ja-130m. Resuelve un problema concreto: la deteccion de contenido toxico en japones sin necesidad de instalar MeCab ni ningun otro analizador morfologico, algo habitual en los pipelines de procesamiento de texto japones. El modelo esta pensado tanto para filtrar documentos web largos (por ejemplo, limpieza de corpus de preentrenamiento) como para moderar publicaciones y comentarios cortos.

La arquitectura es ModernBERT, un transformer encoder con atencion eficiente y soporte nativo de secuencias largas, en su variante japonesa de 130M de parametros. El modelo devuelve una etiqueta binaria (`nontoxic` / `toxic`) y se distribuye en formato safetensors con licencia OpenRAIL++.

Su relevancia actual radica en que los clasificadores multilingues existentes rinden mal sobre documentos web japoneses: este modelo alcanza 0.924 de F1-macro en documentos del dataset LLM-jp, frente a 0.687 y 0.777 de los clasificadores multilingues de textdetox, con un tamano cuatro veces menor que xlmr-large.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (transformer encoder) |
| Parametros totales | 132.404.226 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens en entrenamiento (truncado); para textos mas largos se recomienda trocear y tomar la puntuacion maxima |
| Tipos de cuantizacion | no disponible (el autor no documenta cuantizaciones especificas) |
| Idiomas soportados | japones (ja) |
| Licencia | OpenRAIL++ |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de sbintuitions/modernbert-ja-130m, un encoder ModernBERT adaptado al japones con 132,4M de parametros. ModernBERT sustituye la atencion clasica por mecanismos de atencion eficiente y rotatoria, lo que permite procesar secuencias mas largas con menor coste y elimina la dependencia de tokenizadores morfologicos especificos del japones. El fine-tuning se realizo con la cabeza de clasificacion de `transformers` sobre la tarea de clasificacion de texto.

El conjunto de entrenamiento consta de 5.403 textos: 1.477 documentos del LLM-jp Toxicity Dataset y 3.926 publicaciones de textdetox/multilingual_toxicity_dataset, tras eliminar duplicados. Las etiquetas `toxic` y `has_toxic_expression` del dataset LLM-jp se mapearon a `toxic`. Se entrenaron 3 epocas con learning rate 5e-5, batch de 16, longitud maxima de 512 tokens y semilla 0, sobre una Apple M1 Max con backend MPS. El particionado es determinista (script `prep.py`) y el 20% reservado para evaluacion nunca se uso en entrenamiento. No se documenta RLHF, DPO ni ninguna fase de alineacion adicional, al tratarse de un clasificador supervisado.

## Capacidades

- Clasificacion binaria de toxicidad en japones: devuelve `toxic` o `nontoxic` con su puntuacion de confianza.
- Procesamiento de documentos web largos y de publicaciones o comentarios cortos con el mismo modelo.
- Funcionamiento sin analizador morfologico: no requiere MeCab ni dependencias de tokenizacion japonesa.
- Inferencia ligera en CPU: 314,6 ms por texto en batch de 1 sobre Apple M1 Max (referencia relativa del autor).
- Integracion directa con el pipeline `text-classification` de `transformers`.
- Compatibilidad declarada con text-embeddings-inference y endpoints compatibles.
- No soporta tool calling, agentes, vision, audio ni modo de razonamiento: es exclusivamente un clasificador.

## Casos de uso

- Limpieza de corpus de preentrenamiento: filtrar documentos web japoneses antes de incluirlos en un dataset de entrenamiento, aprovechando el buen rendimiento en documentos largos (F1-macro 0.924 en LLM-jp docs) y troceando textos de mas de 512 tokens.
- Moderacion de comentarios en plataformas: clasificar publicaciones cortas en tiempo real; el modelo procesa textos breves en unos 315 ms por elemento en CPU, lo que permite desplegarlo sin GPU.
- Prefiltrado en pipelines de moderacion con revision humana: usar la salida binaria como primera capa para reducir el volumen que llega a moderadores humanos, dado que el autor advierte que no sustituye un juicio legal.
- Moderacion de foros y comunidades japonesas: detectar lenguaje obsceno, discriminatorio o violento en hilos y respuestas sin infraestructura de NLP japonesa adicional.
- Filtrado de datasets de instrucciones: eliminar ejemplos toxicos de corpus japoneses destinados a fine-tuning de LLMs conversacionales.
- Analisis de toxicidad a escala en investigacion: procesar grandes volumenes de texto japones en CPU, con un coste computacional bajo gracias a los 132M de parametros.
- Clasificacion por lotes en entornos sin GPU: el modelo cabe holgadamente en memoria de sistema y se ejecuta con PyTorch en CPU, lo que simplifica el despliegue en servidores modestos.

## Benchmarks y rendimiento

Evaluacion sobre el 20% reservado de cada fuente (estratificado, semilla 0, nunca visto en entrenamiento). Los mismos ficheros de test para todos los modelos.

| Modelo | Parametros | LLM-jp docs acc / F1-macro | textdetox ja acc / F1-macro | CPU ms/texto |
|---|---|---|---|---|
| tsubu-ai/modernbert-ja-130m-toxicity (este) | 132,4M | 0,924 / 0,924 | 0,910 / 0,910 | 314,6 |
| tsubu-ai/modernbert-ja-70m-toxicity | 70,2M | 0,895 / 0,893 | 0,914 / 0,914 | 108,7 |
| textdetox/bert-multilingual-toxicity-classifier | 177,9M | 0,689 / 0,687 | 0,935 / 0,935 | 574,9 |
| textdetox/xlmr-large-toxicity-classifier-v2 | 559,9M | 0,778 / 0,777 | 0,965 / 0,965 | 805,8 |

Notas del autor sobre la comparacion: el conjunto LLM-jp docs contiene 370 documentos web del LLM-jp Toxicity Dataset; este modelo se entreno con el otro 80% de ese dataset, mientras que los modelos textdetox no, por lo que parte de la diferencia es dominio de entrenamiento. El conjunto textdetox ja contiene 982 publicaciones cortas de textdetox/multilingual_toxicity_dataset (ja); los modelos textdetox se entrenaron con ese dataset (probablemente incluyendo esas filas), por lo que sus puntuaciones ahi son optimistas. Los tiempos de CPU corresponden a batch de 1, 50 textos cortos, PyTorch sobre CPU de Apple M1 Max, y son solo relativos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 132,4M de parametros en fp32, el modelo ocupa aproximadamente 0,5 GB de pesos; en fp16 unos 0,26 GB. Cabe en cualquier GPU consumer con 4 GB o mas.
- GPU recomendadas: no requiere GPU. Funciona en CPU sin problema; cualquier GPU consumer (RTX 3060, RTX 4090, etc.) acelera la inferencia, aunque el autor solo documenta rendimiento en CPU (M1 Max).
- Cabe en consumer GPU: si, en cualquier GPU con al menos 2 GB de VRAM incluso en fp32.
- Opciones de despliegue: pipeline `text-classification` de `transformers`, text-embeddings-inference (declarado compatible), endpoints compatibles. No se documenta soporte explicito de vLLM, llama.cpp, Ollama ni TGI para este modelo concreto.
- Latencia y throughput estimados: 314,6 ms por texto en batch de 1 sobre CPU Apple M1 Max segun el autor; el modelo de 70M de la misma familia tarda 108,7 ms por texto, lo que da una referencia de la relacion coste-rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | F1-macro LLM-jp docs | F1-macro textdetox ja | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| tsubu-ai/modernbert-ja-130m-toxicity | 132,4M | 512 tokens (entrenamiento) | 0,924 | 0,910 | OpenRAIL++ | Hugging Face |
| tsubu-ai/modernbert-ja-70m-toxicity | 70,2M | no disponible | 0,893 | 0,914 | no disponible | Hugging Face |
| textdetox/bert-multilingual-toxicity-classifier | 177,9M | no disponible | 0,687 | 0,935 | no disponible | Hugging Face |
| textdetox/xlmr-large-toxicity-classifier-v2 | 559,9M | no disponible | 0,777 | 0,965 | no disponible | Hugging Face |

La comparativa muestra que este modelo es claramente superior en documentos web japoneses y competitivo en publicaciones cortas, con un tamano cuatro veces menor que xlmr-large. El modelo de 70M de la misma familia es mas rapido en CPU y ligeramente mejor en textdetox ja, pero peor en documentos largos.

## Limitaciones y advertencias

- Conjunto de entrenamiento pequeno (5.403 textos): se esperan errores en jerga, sarcasmo y dominios no representados (chat de videojuegos, codigo, etc.).
- La etiqueta `toxic` sigue las definiciones de los dos datasets de origen (obsceno, discriminatorio, violento, ilegal, difamacion de personas o empresas, etc.); no constituye un juicio legal. Para moderacion de alto riesgo se recomienda revision humana.
- Solo predice la etiqueta binaria; no clasifica categorias (obsceno, discriminatorio, etc.).
- Entrenado unicamente en japones; no se ha validado en otros idiomas.
- Los textos se truncan a los primeros 512 tokens en entrenamiento; para documentos mas largos hay que trocear y agregar la puntuacion maxima, lo que puede perder contexto.
- Licencia OpenRAIL++ heredada de textdetox/multilingual_toxicity_dataset: se aplican sus restricciones de uso, incluidas limitaciones para uso comercial en determinados supuestos.
- Los datos de entrenamiento proceden de LLM-jp Toxicity Dataset (CC BY 4.0) y textdetox/multilingual_toxicity_dataset (OpenRAIL++); el modelo base es MIT.
- Riesgo de alucinacion no aplica en sentido generativo (es un clasificador), pero si de falsos positivos y negativos, especialmente en dominios fuera de la distribucion de entrenamiento.
- Sin descargas ni likes registrados en Hugging Face en el momento de la consulta; ecosistema de validacion externa muy limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tsubu-ai/modernbert-ja-130m-toxicity
- Modelo base: https://huggingface.co/sbintuitions/modernbert-ja-130m
- Dataset LLM-jp Toxicity: https://huggingface.co/datasets/p1atdev/LLM-jp-Toxicity-Dataset
- Dataset textdetox multilingue: https://huggingface.co/datasets/textdetox/multilingual_toxicity_dataset
- Modelo comparable de 70M: https://huggingface.co/tsubu-ai/modernbert-ja-70m-toxicity
- Clasificador multilingue textdetox: https://huggingface.co/textdetox/bert-multilingual-toxicity-classifier
- Clasificador xlmr-large textdetox: https://huggingface.co/textdetox/xlmr-large-toxicity-classifier-v2
