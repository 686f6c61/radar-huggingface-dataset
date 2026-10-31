# SpeechAntiSpoofingBenchmarks/XLSR-MamBo

## Resumen

XLSR-MamBo es un modelo de detección de deepfakes de audio (speech anti-spoofing) desarrollado por el equipo de SpeechAntiSpoofingBenchmarks, basado en el trabajo "XLSR-MamBo: Scaling the Hybrid Mamba-Attention Backbone for Audio Deepfake Detection" (Ng et al., ACL 2026 Findings). El modelo combina un backbone híbrido Mamba-Atención (arquitectura MamBo-3 con mixer Hydra-N3) sobre representaciones de XLSR (XLS-R wav2vec 2.0), y está diseñado para clasificar clips de voz como genuinos (bonafide) o sintetizados (spoof).

El checkpoint publicado corresponde a la variante MamBo-3 con 319,37 millones de parámetros, entrenado sobre ASVspoof2019 LA (configuración DA0, sin RawBoost), y seleccionado por la menor pérdida de validación en dicho conjunto. Resuelve el problema de la detección robusta de voz sintetizada, cada vez más relevante ante la proliferación de clonación de voz y ataques de suplantación en sistemas de verificación biométrica.

Su relevancia actual radica en los resultados de la Speech Anti-Spoofing Arena: alcanza un EER de 0,16 % en ASVspoof2019 LA y mantiene un rendimiento competitivo en 18 conjuntos de evaluación adicionales, incluyendo datos reales "in the wild" (EER 5,47 % en InTheWild). El paquete incluye wrappers de PyTorch, una versión TensorRT FP32 y un subconjunto vendido de kernels mamba_ssm en Triton, lo que facilita el despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida Mamba-Atencion (MamBo-3, mixer Hydra-N3) sobre representaciones XLSR |
| Parametros totales | 319,37 M |
| Parametros activos | no disponible (no es MoE; todos los parametros se activan) |
| Longitud de contexto | 66 800 muestras (~4,17 s a 16 kHz); clips mas cortos se rellenan por repeticion |
| Tipos de cuantizacion | FP32 (wrapper TensorRT incluido); bf16 no disponible en este empaquetado |
| Idiomas soportados | no disponible (entrenado sobre ASVspoof2019 LA, en ingles) |
| Licencia | MIT |
| Formato de pesos | .pt (PyTorch checkpoint, `mambo3_da0_best0.pt`); tamano del repo 1,4 GB |

## Arquitectura y entrenamiento

XLSR-MamBo escala un backbone hibrido que combina bloques Mamba (SSD/selective state space) con capas de atencion, mediante el mixer Hydra-N3, sobre las representaciones de un modelo XLSR preentrenado (XLS-R). La ventaja de esta hibridacion es que Mamba proporciona complejidad lineal respecto a la longitud de la secuencia para capturar dependencias temporales largas en el audio, mientras que los bloques de atencion aportan modelado global que mejora la discriminacion de artefactos de sintesis. El wrapper incluye una normalizacion por capa de la forma de onda por utterance (en lugar de normalizar conjuntamente sobre el batch, como en el codigo fuente) y ejecuta el scan SSD y RMSNorm en PyTorch puro, con una desviacion maxima de puntuacion de 2e-4 respecto a los kernels Triton originales.

El checkpoint publicado fue entrenado sobre ASVspoof2019 LA (logical access, ataques de sintetizadores de voz) en configuracion DA0, es decir, sin aumento de datos RawBoost. La seleccion del modelo se realizo por la menor perdida de validacion en ASVspoof2019 LA (`best_0.pt`). No se dispone en la informacion proporcionada de detalles sobre el numero de tokens/muestras de entrenamiento ni sobre el uso de tecnicas como RLHF o DPO (no aplicables a este tipo de clasificador).

## Capacidades

- Clasificacion binaria de audio: distingue voz genuina (bonafide) de voz sintetizada o manipulada (spoof); la puntuacion es `logit[bonafide] - logit[spoof]`, donde valores mas altos indican voz genuina.
- Deteccion de deepfakes de voz generados por TTS y voice conversion, evaluada en 19 conjuntos de datos distintos (ASVspoof, InTheWild, ADD, CFAD, LibriSeVoc, entre otros).
- Procesamiento de clips de hasta 66 800 muestras a 16 kHz (~4,17 segundos); los clips mas cortos se rellenan por repeticion automaticamente.
- Inferencia optimizada: incluye un wrapper drop-in para TensorRT en FP32 (`XLSRMamBoTRT`) para despliegue de baja latencia.
- Kernels Mamba autocontenidos: el repositorio incluye un subconjunto vendido de mamba_ssm 2.2.6.post3 en Triton, evitando dependencias externas complejas.
- No es un modelo generativo ni multimodal: no soporta tool calling, agentes ni procesamiento de texto o imagen.

## Casos de uso

- Verificacion de autenticidad en llamadas de atencion al cliente: integracion en sistemas IVR o contact centers para marcar llamadas sospechosas de voz clonada antes de autorizar operaciones sensibles, aprovechando el bajo EER en datos tipo logical access.
- Autenticacion biométrica de voz en banca y telecos: como segundo factor en flujos de verificacion por voz, filtrando ataques de sintesis de voz que intentan suplantar a usuarios legitimos.
- Moderacion de contenido en plataformas de audio: analisis automatico de audios subidos por usuarios para detectar voz sintetizada en podcasts, redes sociales o mensajeria de voz, con EER de 5,47 % en el conjunto InTheWild de audios reales.
- Investigacion en anti-spoofing: como baseline o punto de partida reproducible (codigo MIT en GitHub) para nuevos trabajos de deteccion de deepfakes de audio, con resultados por dataset disponibles en `.eval_results/`.
- Comparacion sistematica de sistemas: uso dentro de la Speech Anti-Spoofing Arena para evaluar y posicionar nuevos modelos frente a XLSR-MamBo en condiciones homogeneas.
- Despliegue en produccion de baja latencia: la version TensorRT FP32 permite integrar el modelo en pipelines de inferencia optimizados para procesar grandes volumenes de audio en tiempo real.
- Analisis forense de audio: apoyo en investigaciones de fraude vocal (por ejemplo, estafas por telefono con voz clonada), generando una puntuacion interpretable de genuinidad por clip.

## Benchmarks y rendimiento

Resultados publicados en la Speech Anti-Spoofing Arena (EER %, menor es mejor; EmoSpoofTTS y LRLspoof usan 1-SRR % con el umbral EER de DeepVoice):

| Conjunto de datos | Metrica | Resultado |
|---|---|---|
| ASVspoof2019 LA | EER % | 0,16 |
| ASVspoof2021 LA | EER % | 7,8 |
| ASVspoof2021 DF | EER % | 4 |
| ASVspoof5 | EER % | 14,45 |
| InTheWild | EER % | 5,47 |
| ADD22_eval_31 | EER % | 4,23 |
| ADD2023_track12_test_r1 | EER % | 21,35 |
| CFAD | EER % | 8,52 |
| CD-ADD | EER % | 6,28 |
| CVoiceFake_small | EER % | 5,81 |
| DeepVoice | EER % | 21,83 |
| LibriSeVoc | EER % | 1,09 |
| SONAR | EER % | 13,68 |
| ArAD | EER % | 23,14 |
| DECRO | EER % | 10,09 |
| J-SPAW_LA | EER % | 2,57 |
| ODSS | EER % | 18,62 |
| HABLA | EER % | 3,83 |

No se han publicado en la informacion disponible comparaciones numericas directas con otros modelos concretos; el ranking y el tier actual del sistema pueden consultarse mediante las insignias de la Arena.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible explicitamente; con 319,37 M de parametros en FP32, el modelo ocupa en torno a 1,3 GB solo de pesos, por lo que una GPU con 4-8 GB de VRAM deberia ser suficiente para inferencia de clips individuales.
- GPU recomendadas: no disponible oficialmente; por el tamano del modelo, cualquier GPU moderna de consumo (RTX 3060, RTX 4090) o de datacenter (A100, T4 para TensorRT) es adecuada.
- Cabe en GPUs de consumo: si, el tamano del repo completo (1,4 GB) y de los pesos en FP32 permiten inferencia en GPUs de gama media y alta.
- Opciones de despliegue: PyTorch puro con los wrappers incluidos (`xlsr_mambo.py`, `_net.py`), kernels Mamba en Triton vendidos en el repo, y TensorRT FP32 mediante `trt_xlsr_mambo.py` (`XLSRMamBoTRT`). No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles; el uso de Mamba (complejidad lineal en la longitud de secuencia) y la version TensorRT sugieren inferencia eficiente, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se han proporcionado datos numericos de modelos alternativos en la informacion disponible. Como referencia contextual de la categoria (sin cifras inventadas):

| Modelo | Categoria | Datos comparativos |
|---|---|---|
| XLSR-MamBo (MamBo-3, Hydra-N3) | Hibrido Mamba-Atencion, 319,37 M | EER 0,16 % en ASVspoof2019 LA; licencia MIT |
| AASIST y variantes sobre XLSR | Baselines habituales en anti-spoofing | no disponible |
| Otros sistemas de la Speech Anti-Spoofing Arena | Variados | consultables en el leaderboard de la Arena |

## Limitaciones y advertencias

- Ventana de entrada fija: solo procesa los primeros 66 800 muestras (~4,17 s) de cada clip; audios mas largos requieren segmentacion manual, y los clips mas cortos se rellenan por repeticion, lo que puede afectar la puntuacion.
- Rendimiento degradado fuera de dominio: aunque el EER en ASVspoof2019 LA es de 0,16 %, sube a 21,35 % en ADD2023_track12_test_r1, 23,14 % en ArAD y 21,83 % en DeepVoice, lo que indica sensibilidad a la distribucion de ataques y dominios no vistos.
- Entrenamiento monolingüe: el modelo se entreno sobre ASVspoof2019 LA (ingles); su comportamiento en otros idiomas, incluido el castellano, no esta documentado y debe validarse antes de uso en produccion.
- Empaquetado en FP32: el wrapper usa FP32 en lugar de bf16, con lo que el consumo de memoria y la latencia son mayores que con precision mixta; no se ofrecen cuantizaciones oficiales.
- Desviaciones respecto al codigo fuente: normalizacion por utterance, scan SSD y RMSNorm reimplementados en PyTorch puro (desviacion maxima de puntuacion 2e-4); los resultados pueden diferir minimamente del modelo original.
- Riesgo de error en decisiones criticas: como todo detector de deepfakes, puede producir falsos positivos (rechazar voz genuina) y falsos negativos (aceptar voz sintetizada); no debe usarse como unico mecanismo de autenticacion en escenarios de alto riesgo.
- El subconjunto vendido de mamba_ssm es Apache-2.0 (distinto de la licencia MIT del resto del paquete), lo que conviene revisar en usos comerciales.
- No disponible: datos de sesgos conocidos, cifras de latencia/throughput ni guias de despliegue a escala.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SpeechAntiSpoofingBenchmarks/XLSR-MamBo
- Paper (ACL 2026 Findings): https://aclanthology.org/2026.findings-acl.1573/
- Paper (arXiv): https://arxiv.org/abs/2601.02944
- Codigo fuente (GitHub, MIT): https://github.com/saki-ciallo/XLSR-MamBo
- Speech Anti-Spoofing Arena: https://huggingface.co/spaces/SpeechAntiSpoofingBenchmarks/SpeechAntiSpoofingArena
