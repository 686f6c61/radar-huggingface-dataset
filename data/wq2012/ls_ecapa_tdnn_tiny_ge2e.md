# wq2012/ls_ecapa_tdnn_tiny_ge2e

## Resumen

`ls_ecapa_tdnn_tiny_ge2e` es un extractor de embeddings de locutor desarrollado por el usuario wq2012 dentro del proyecto FlaxSpeaker, una reimplementación desde cero en JAX/Flax de algoritmos de reconocimiento de locutor publicados en la literatura (GE2E, Dr-Vectors, ATP y PFAS). El modelo implementa una arquitectura ECAPA-TDNN en su variante `tiny`, con pooling temporal atencional (`asp`), objetivo de entrenamiento GE2E softmax y puntuación por similitud coseno, produciendo embeddings de 128 dimensiones a partir de audio a 16 kHz.

Con 626.722 parámetros de inferencia (629.600 según safetensors), se trata de un checkpoint deliberadamente pequeño, entrenado sobre un corpus reducido de LibriSpeech (232 locutores, 5.788 enunciados) hasta convergencia en 2.400 pasos. No pretende competir con sistemas industriales entrenados sobre VoxCeleb2-dev (miles de locutores), sino servir como referencia reproducible y controlada dentro del benchmark de FlaxSpeaker, con métricas archivadas y trazabilidad del presupuesto de entrenamiento.

Su relevancia actual reside en su carácter didáctico y reproducible: código abierto en JAX, pesos en safetensors y msgpack, evaluación multi-dominio documentada con intervalos de confianza bootstrap, y una licencia Apache 2.0 que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ECAPA-TDNN (`tiny`) con pooling temporal atencional (`asp`) |
| Parametros totales | 629.600 (safetensors); 626.722 de inferencia (encoder + cabeza de scoring, excluye clasificador de entrenamiento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; ventana por recorte de 90-180 frames) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors y msgpack en precisión nativa) |
| Idiomas soportados | no disponible (independiente del idioma; entrenado sobre LibriSpeech, inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`) y Flax msgpack (`flax_model.msgpack`) |

## Arquitectura y entrenamiento

El modelo es una ECAPA-TDNN en variante `tiny` con pooling temporal atencional (`asp`) y una cabeza de scoring basada en similitud coseno. La representación de salida es un embedding de 128 dimensiones. El frontend de audio es propio de la librería `flaxspeaker` (no un `AutoFeatureExtractor` de Hugging Face): Mel logarítmico natural de 80 dimensiones a 16 kHz, VAD a nivel de frame y normalización CMVN. El objetivo de entrenamiento es GE2E softmax (Wan et al. 2018, Eq. 6) con centroides exactos leave-one-out, complementado por las cabezas Dr-Vector y PFAS incluidas en los pesos.

El entrenamiento se realizó sobre LibriSpeech exclusivamente (232 locutores, 5.788 enunciados), con 2.400 pasos de gradiente y batches de 32 enunciados (8 locutores x 4 enunciados), lo que equivale a ~13,27 épocas, semilla 42 y recortes variables de `U(90, 180)` frames con máscara de validez exacta. Se ejecutó en una estación de trabajo con CPU hasta convergencia, con margen de seguridad de 2 épocas. La EER in-domain en LibriSpeech evolucionó de 17,57% (1-utt) / 14,40% (3-utt) en el paso 400 a 11,63% (1-utt) / 6,60% (3-utt) en el paso 2.400; el pooling universal final quedó en 20,55% (1-utt) / 16,13% (3-utt). La desviación estándar entre semillas 0-2 del EER pooled 1-utt es de 0,08-0,41% absoluto, y el intervalo bootstrap al 95% con 8.000 ensayos tiene semiancho de ~0,8%. El fingerprint de pérdida en el paso 0 reproduce el valor archivado (2,1247) con recortes `U(90, 180)`.

## Capacidades

- Extracción de embeddings de locutor de 128 dimensiones a partir de audio a 16 kHz.
- Verificación de locutor (1:1) mediante similitud coseno entre embeddings.
- Identificación de locutor (1:N) mediante comparación contra un conjunto de referencia.
- Puntuación robusta a variaciones de duración gracias al pooling atencional y a la evaluación 1-utt y 3-utt documentada.
- Independencia del contenido lingüístico: el modelo aprende características de timbre y voz, no de idioma.
- Integración con la librería `flaxspeaker` (>= 0.5.0) para carga desde Hugging Face Hub o directorio local.
- No soporta tool calling, function calling, agentes, visión, audio generativo ni razonamiento multi-paso; es un extractor de características puro.

## Casos de uso

- Verificación biométrica de acceso: comparar el embedding de una frase de voz contra el template registrado del usuario y aceptar o rechazar según un umbral de similitud coseno calibrado con la EER reportada.
- Identificación de hablante en reuniones y transcripciones: segmentar el audio y asignar cada segmento al locutor más cercano en el espacio de embeddings, útil para diarización ligera en entornos con pocos locutores.
- Detección de suplantación en call centers: calcular la similitud entre la voz entrante y el perfil del cliente para marcar posibles fraudes o transferencias no autorizadas.
- Indexación y búsqueda de archivos de audio: generar embeddings por fragmento y construir un índice vectorial para recuperar grabaciones por locutor.
- Control de calidad de datasets de voz: detectar duplicados de locutor entre splits de entrenamiento y validación para evitar fugas de datos.
- Prototipado e investigación educativa: servir como referencia reproducible y ligera (626.722 parámetros de inferencia) para comparar variantes de arquitectura, pooling o funciones de pérdida dentro del benchmark FlaxSpeaker.
- Preprocesado en pipelines de ASR: enriquecer transcripciones con etiquetas de locutor antes de tareas posteriores de análisis.

## Benchmarks y rendimiento

Resultados reportados en la model card (EER, evaluación in-domain LibriSpeech):

| Metrica | Paso 400 | Paso 2000 (knee) | Paso 2400 (final) |
|---|---|---|---|
| EER 1-utt | 17,57% | 11,37% | 11,63% |
| EER 3-utt | 14,40% | 7,00% | 6,60% |
| EER pooled universal 1-utt | no disponible | no disponible | 20,55% |
| EER pooled universal 3-utt | no disponible | no disponible | 16,13% |

Referencias externas citadas en la model card (no son resultados de este checkpoint): sistemas ECAPA-TDNN publicados entrenados sobre VoxCeleb2-dev alcanzan ~0,9% EER en VoxCeleb1-O completo (Desplanques et al., 2020), y sistemas con menos de 1M de parámetros ~2% (Wang et al., EfficientTDNN, 2022). El repositorio incluye `eval_results.json` con EER 1-utt y 3-utt, minDCF, ROC-AUC, intervalos bootstrap al 95% y un subconjunto de 10 locutores de VoxCeleb1-O; los valores concretos de minDCF y ROC-AUC no se detallan en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el modelo tiene ~0,63M de parámetros y opera sobre recortes de 90-180 frames a 16 kHz.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria; no requiere A100 ni H100. Funciona en CPU (de hecho, el entrenamiento se realizó en CPU).
- Cabe en cualquier GPU de consumo (GTX 1050, RTX 3050, RTX 4090) e incluso en dispositivos embebidos con JAX.
- Opciones de despliegue: librería `flaxspeaker` >= 0.5.0 sobre JAX/Flax; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | EER reportada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ls_ecapa_tdnn_tiny_ge2e` (este) | 626.722 (inferencia) | Audio 16 kHz, recortes 90-180 frames | 11,63% 1-utt / 6,60% 3-utt (LibriSpeech in-domain) | Apache 2.0 | Hugging Face + PyPI |
| ECAPA-TDNN publicado (Desplanques et al. 2020) | no disponible | VoxCeleb2-dev | ~0,9% en VoxCeleb1-O | no disponible | paper |
| EfficientTDNN (Wang et al. 2022) | <1M | VoxCeleb2-dev | ~2% | no disponible | paper |

La comparación directa no es homogénea: los sistemas publicados se entrenan sobre VoxCeleb2-dev (5.994 locutores, ~1,1M enunciados), mientras que este checkpoint se entrena sobre 232 locutores de LibriSpeech. Las cifras no son directamente comparables.

## Limitaciones y advertencias

- Entrenado únicamente sobre LibriSpeech (232 locutores, inglés); la diversidad de locutores es muy inferior a la de sistemas industriales, lo que acota la calidad absoluta de los embeddings.
- EER in-domain de 11,63% (1-utt) y 6,60% (3-utt); el pooling universal sube a 20,55% y 16,13% respectivamente, lo que indica degradación fuera del dominio de entrenamiento.
- No es una reproducción a gran escala de los papers originales: el autor lo declara explícitamente como checkpoint de benchmark de corpus pequeño.
- El frontend de audio es propio de `flaxspeaker` y no es compatible con `AutoFeatureExtractor` de Hugging Face; requiere la librería para preprocesar correctamente.
- No dispone de información sobre sesgos demográficos, acentos o condiciones acústicas adversas; se recomienda validar en el dominio objetivo antes de producción.
- Riesgo de falsos positivos/negativos en verificación biométrica si se usa sin calibración de umbral específica del dominio.
- Licencia Apache 2.0: permite uso comercial, pero el autor advierte que no es un producto oficialmente soportado por Google.
- No apto para tareas generativas, razonamiento, código, visión ni agentes.

## Enlaces

- Hugging Face: https://huggingface.co/wq2012/ls_ecapa_tdnn_tiny_ge2e
- Colección FlaxSpeaker: https://huggingface.co/collections/wq2012/flaxspeaker
- Repositorio GitHub: https://github.com/wq2012/FlaxSpeaker
- Paquete PyPI: https://pypi.org/project/flaxspeaker/
- Paper GE2E: https://arxiv.org/abs/1710.10467
- Paper Dr-Vectors: https://arxiv.org/abs/2104.01989
- Paper ATP: https://arxiv.org/abs/2202.12163
- Paper PFAS: https://arxiv.org/abs/2203.05642
