# SpeechAntiSpoofingBenchmarks/SpoofSUPERB-UniSpeechSAT

## Resumen

SpoofSUPERB-UniSpeechSAT es un detector de ataques de suplantación de voz (anti-spoofing) empaquetado por el colectivo SpeechAntiSpoofingBenchmarks para su uso dentro de la Speech Anti-Spoofing Arena. Se trata de una cabeza de clasificación lineal entrenada sobre un extractor UniSpeech-SAT Large congelado, siguiendo la receta del trabajo Spoof-SUPERB (Ali et al., 2026). El modelo no genera texto ni audio: recibe una señal de voz a 16 kHz y devuelve una puntuación que indica si la grabación es auténtica (bona fide) o sintética/clonada.

El interés práctico reside en que ofrece un detector de deepfakes de voz con licencia Apache 2.0, pesos re-alojados de forma estable y una integración sencilla en PyTorch, además de una variante TensorRT que acelera la inferencia en GPUs de consumo. Su rendimiento es especialmente sólido en el dominio de ASVspoof 2019 LA (1,35 % EER), aunque degrada de forma notable en conjuntos más recientes y diversos.

El repositorio ocupa 0,1 GB y contiene únicamente los pesos del extractor y de la cabeza entrenada; no incluye pipeline de Hugging Face ni tokenizador, por lo que su uso requiere cargar manualmente la arquitectura s3prl y el wrapper de puntuación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (UniSpeech-SAT Large congelado) + cabeza lineal con ponderación softmax de capas |
| Parametros totales | 315.698.075 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 64.600 muestras de audio a 16 kHz (aprox. 4,04 s); clips más cortos se replican (tiling) |
| Tipos de cuantizacion | no disponible (pesos en FP32; existe clase TensorRT FP32) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (.pth), pesos en FP32 |

## Arquitectura y entrenamiento

El modelo combina un extractor UniSpeech-SAT Large (24 capas transformer, dimensión oculta 1024) cargado desde s3prl (`unispeech_sat_large`) y mantenido congelado, con una cabeza ligera entrenable. La cabeza aplica un Featurizer de s3prl que pondera mediante softmax los 25 estados ocultos (las entradas de las 24 capas transformer más la salida del encoder, sin normalización por capa), seguido de una proyección Linear(1024, 256), un mean pooling sobre fotogramas y un clasificador Linear(256, 2). Solo se entrenan los pesos de ponderación de capas, el proyector y el clasificador.

El entrenamiento se realizó sobre el split de entrenamiento de ASVspoof 2019 LA durante 50 épocas con Stochastic Weight Averaging (SWA). El preprocesado sigue el código de scoring de los autores: audio a 16 kHz, primeros 64.600 muestras (con tiling si el clip es más corto), normalización layer-norm por utterance propia del modelo upstream y cómputo en FP32. La puntuación final es `logits[:,1]`, donde valores más altos indican mayor probabilidad de voz auténtica.

## Capacidades

- Detección binaria de voz sintética frente a voz auténtica (anti-spoofing / deepfake detection).
- Puntuación continua por utterance que permite umbralizar según el coste operativo deseado.
- Procesamiento de clips de hasta 64.600 muestras (aprox. 4 s) con manejo automático de clips más cortos mediante tiling.
- Inferencia en FP32 tanto en PyTorch como mediante una clase drop-in de TensorRT.
- No soporta generación de texto, tool calling, agentes, visión ni audio generativo.
- No se documentan capacidades multilingües específicas; el comportamiento depende del extractor UniSpeech-SAT subyacente.

## Casos de uso

- Verificación de autenticidad en llamadas entrantes: integrar el detector en una pasarela telefónica para puntuar cada segmento de 4 s y marcar posibles voces clonadas antes de transferir a un agente humano.
- Moderación de contenido en plataformas de audio: procesar subidas de podcasts o mensajes de voz y aplicar un umbral conservador para revisión manual cuando la puntuación caiga en zona gris.
- KYC y onboarding remoto: como señal adicional (no única) en procesos de verificación de identidad, complementando biometría y pruebas de vida.
- Investigación en detección de deepfakes: servir como baseline reproducible en ASVspoof 2019 LA y otros conjuntos de la arena para comparar nuevas arquitecturas.
- Auditoría forense de grabaciones: generar puntuaciones por segmento para localizar tramos sospechosos en material aportado como prueba.
- Filtrado previo en pipelines de datos de voz: descartar muestras sintéticas antes de entrenar modelos TTS o ASR, reduciendo contaminación del corpus.
- Evaluación comparativa de generadores TTS: usar la puntuación del detector como métrica automática de calidad/realismo de un sistema de síntesis.

## Benchmarks y rendimiento

Resultados publicados en la model card (EER %, menor es mejor; en EmoSpoofTTS y LRLspoof se reporta 1-SRR % al umbral EER de DeepVoice):

| Conjunto de evaluacion | EER % |
|---|---|
| ASVspoof2019_LA | 1,35 |
| ASVspoof2021_LA | 8,82 |
| ASVspoof2021_DF | 7,59 |
| ASVspoof5 | 14,99 |
| InTheWild | 10,88 |
| ADD22_eval_31 | 12,78 |
| ADD2023_track12_test_r1 | 29,48 |
| CFAD | 16,44 |
| CD-ADD | 19,53 |
| CVoiceFake_small | 26,37 |
| DeepVoice | 23,41 |
| LibriSeVoc | 7,64 |
| SONAR | 38,05 |
| ArAD | 29,81 |
| DECRO | 18,44 |
| J-SPAW_LA | 16,47 |

No se han publicado comparaciones numéricas con otros sistemas en la información disponible, salvo la clasificación por tier y rank que la arena muestra mediante badges dinámicos.

## Requisitos de hardware

- VRAM estimada: en torno a 1,3-1,5 GB en FP32 para los 315,7 M de parámetros, más el overhead de activaciones durante el forward (dependiente del tamaño de batch).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; los autores reportan ejecución en RTX 4070 Ti SUPER y RTX 5060 Ti con la clase TensorRT en FP32.
- Cabe en GPUs de consumo: sí, en RTX 3060/4060 y superiores; también es viable en CPU para volúmenes moderados.
- Opciones de despliegue: PyTorch nativo (wrapper de los autores), TensorRT (clase drop-in proporcionada), y exportación manual a otros runtimes; no se documenta soporte de vLLM, llama.cpp ni Ollama (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles de forma explícita; la model card solo indica que TensorRT en FP32 coincidió con PyTorch en el conjunto completo de J-SPAW_LA.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | EER ASVspoof2019 LA | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SpoofSUPERB-UniSpeechSAT | 315,7 M | 64.600 muestras (16 kHz) | 1,35 % | Apache 2.0 | Hugging Face + código upstream |
| AASIST (referencia clásica) | no disponible | no disponible | no disponible | no disponible | no disponible |
| RawNet2 (referencia clásica) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos comparativos verificables en la información proporcionada para completar la tabla con cifras de modelos alternativos; se indican como "no disponible".

## Limitaciones y advertencias

- Degradación fuerte fuera del dominio de entrenamiento: el EER sube a 29,48 % en ADD2023, 38,05 % en SONAR y 26,37 % en CVoiceFake_small, lo que desaconseja su uso directo en producción sin validación en el dominio objetivo.
- Entrenado exclusivamente con ASVspoof 2019 LA, un corpus con condiciones acústicas y ataques concretos; probablemente presente sesgos hacia esos tipos de spoofing y peor detección de ataques generativos recientes.
- Ventana fija de 64.600 muestras: los clips más largos requieren segmentación externa y agregación de puntuaciones, lo que puede introducir errores en los bordes.
- Riesgo de falsos positivos y negativos en voces con acentos, ruido o canales telefónicos no representados en el entrenamiento; no se documentan métricas por subgrupo.
- No debe usarse como único mecanismo de verificación de identidad ni como prueba pericial sin revisión humana.
- Licencia Apache 2.0 permite uso comercial, pero los pesos del extractor UniSpeech-SAT se re-alojan bajo la licencia upstream, que conviene revisar antes de redistribuir.
- Ausencia de pipeline de Hugging Face y de tokenizador: la integración requiere código propio y dependencia de s3prl.
- No se documentan idiomas soportados ni sesgos demográficos medidos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SpeechAntiSpoofingBenchmarks/SpoofSUPERB-UniSpeechSAT
- Speech Anti-Spoofing Arena: https://huggingface.co/spaces/SpeechAntiSpoofingBenchmarks/SpeechAntiSpoofingArena
- Paper Spoof-SUPERB (Ali et al., 2026): https://arxiv.org/abs/2603.01482
- Código upstream (spoof_SUPERB): https://github.com/issflab/spoof_SUPERB/tree/8b457584e4120ba525f720e714d0a4b2ed400d68
- Pesos UniSpeech-SAT Large re-alojados: https://huggingface.co/SpeechAntiSpoofingBenchmarks/SpoofSUPERB-UniSpeechSAT/blob/1fd59fc73ab40845d54878b7667633f0b43b7b37/unispeech_sat_large.pth
