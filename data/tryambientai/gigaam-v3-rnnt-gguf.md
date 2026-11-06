# tryambientai/gigaam-v3-rnnt-gguf

## Resumen

GigaAM-v3-rnnt-gguf es una conversion al formato GGUF del modelo de reconocimiento automatico del habla (ASR) ai-sage/GigaAM-v3, en su variante RNN-T, realizada por tryambientai para su uso con la libreria transcribe.cpp. Se trata de un modelo Conformer de 16 capas y aproximadamente 221,9 millones de parametros, disenado especificamente para transcripcion de voz en ruso en modo offline, con decodificacion greedy RNN-T y un vocabulario de 33 caracteres que produce texto en minusculas y sin puntuacion.

El modelo base, desarrollado por ai-sage (equipo vinculado a Salute Developers, Sber), es la tercera generacion de la familia GigaAM y se preentreno sobre 700.000 horas de audio en ruso mediante el objetivo HuBERT-CTC, con ajuste posterior especifico para ASR. Esta version cuantizada permite ejecutar un sistema ASR de alta calidad en hardware modesto, incluyendo CPU y GPU de consumo, con tamanos de archivo que van desde 175 MB (Q4_K_M) hasta 846 MB (F32), lo que la hace relevante para despliegues locales, embebidos y entornos sin conectividad.

La relevancia actual reside en que ofrece un WER de 8,08 % sobre el split completo de FLEURS ru (775 enunciados) con decodificacion greedy y sin modelo de lenguaje externo, superando la referencia del paquete original del autor (9,46 %) y manteniendo una calidad practicamente identica entre cuantizaciones, incluso en Q4_K_M (8,12 %). Todo ello con licencia MIT y compatibilidad con aceleracion Metal y Vulkan.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (encoder de 16 capas) con decodificador RNN-T |
| Parametros totales | 221.883.426 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR; entrada de audio, no contexto textual) |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | Ruso (ru) |
| Licencia | MIT |
| Formato de pesos | GGUF (para transcribe.cpp) |

## Arquitectura y entrenamiento

El modelo es un Conformer con encoder de 16 capas, la misma arquitectura que la variante e2e del modelo base, pero ajustado para emitir texto en ruso en minusculas y sin puntuacion mediante un decodificador RNN-T con decodificacion greedy. El preentrenamiento del modelo base GigaAM-v3 se realizo con el objetivo HuBERT-CTC sobre 700.000 horas de audio en ruso, e incorpora datasets internos nuevos: conversaciones de call center, habla con musica de fondo, habla natural y habla con caracteristicas atipicas. Segun el autor del modelo base, estas incorporaciones mejoran el rendimiento en esos dominios en un 30 % de media sin degradar los benchmarks publicos.

La conversion GGUF fue portada desde el commit upstream c7f128b (fijado el 2026-05-12) y validada contra el paquete de referencia del autor en el commit 42b96d9 de transcribe.cpp. La validacion numerica muestra que, en el subconjunto de 770 enunciados que ambos sistemas decodifican, transcribe.cpp coincide exactamente con el paquete upstream; la diferencia de 1,4 puntos porcentuales en el WER global se debe a que el paquete upstream rechaza 5 enunciados largos (mas de 25 s) con el mensaje `Too long wav file, use 'transcribe_longform' method.`, contabilizados como errores de deleccion del 100 %.

## Capacidades

- Transcripcion de voz a texto en ruso, offline, sobre audio de 16 kHz mono WAV.
- Decodificacion RNN-T greedy con vocabulario de 33 caracteres; salida en minusculas y sin puntuacion.
- Generacion de timestamps a nivel de token.
- Inferencia acelerada por Metal (Apple Silicon) y Vulkan (GPU integradas y discretas), con fallback a CPU.
- No soporta streaming (indicador `streaming: false`).
- No soporta traduccion (indicador `translate: false`).
- No soporta deteccion de idioma (indicador `lang_detect: false`).
- No dispone de tool calling, function calling, agentes ni razonamiento multi-paso: es exclusivamente un modelo ASR.
- Capacidad multilingue limitada al ruso; no cubre otras lenguas.

## Casos de uso

- Transcripcion de reuniones y llamadas en ruso: el modelo procesa audio de 16 kHz mono y genera texto con timestamps por token, adecuado para actas automaticas y busquedas sobre el contenido hablado en entornos sin conectividad.
- Subtitulado offline de contenido audiovisual en ruso: con la salida por token se pueden alinear subtitulos; la ausencia de puntuacion exige un postprocesado linguistico posterior, pero el WER de 8,08 % en FLEURS ru lo hace competitivo frente a Whisper en este idioma.
- Atencion al cliente y analitica de call centers: el modelo base fue entrenado especificamente con conversaciones de call center, donde la variante RNN-T alcanza un WER de 9,5 % segun la tabla upstream, muy por debajo de T-One + LM (13,5 %) y Whisper (23,9 %).
- Transcripcion en dispositivos de consumo y embebidos: con cuantizacion Q4_K_M (175 MB) o Q5_K_M (196 MB) cabe en memoria de sistemas con pocos recursos y se ejecuta en CPU; en un Ryzen 4750U se midio un factor de tiempo real (RTF) de 9 en CPU y 25 en Vulkan.
- Dictado y notas de voz en aplicaciones de escritorio: en un Apple M4 Max el RTF medido es de 27 en CPU y 110 en Metal, lo que permite transcripcion practicamente instantanea de audios cortos en local.
- Procesamiento por lotes de archivos de audio en pipelines internos: la CLI de transcribe.cpp acepta WAV de 16 kHz mono y permite automatizar la conversion previa con ffmpeg, integrable en scripts de servidor sin dependencia de APIs externas.
- Investigacion en ASR para ruso: al ser una conversion fiel del modelo base con licencia MIT, sirve como linea base reproducible para experimentos de decodificacion, cuantizacion y comparativas de WER.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| FLEURS ru (775 enunciados, greedy, sin LM externo) | WER F32 | 8,08 % |
| FLEURS ru | WER F16 | 8,08 % |
| FLEURS ru | WER Q8_0 | 8,08 % |
| FLEURS ru | WER Q6_K | 8,07 % |
| FLEURS ru | WER Q5_K_M | 8,12 % |
| FLEURS ru | WER Q4_K_M | 8,12 % |
| FLEURS ru (referencia paquete original `gigaam`) | WER | 9,46 % |
| Apple M4 Max | RTF Metal | 110 |
| Apple M4 Max | RTF CPU | 27 |
| Ryzen 4750U | RTF Vulkan | 25 |
| Ryzen 4750U | RTF CPU | 9 |

Resultados del modelo base GigaAM-v3 (variante RNN-T) por dominio, segun la tabla upstream:

| Conjunto | V3_RNNT | V3_CTC | T-One + LM | Whisper |
|---|---:|---:|---:|---:|
| Open Datasets | 2,6 | 3,0 | 5,7 | 12,0 |
| Golos Farfield | 3,9 | 4,5 | 12,2 | 16,7 |
| Natural Speech | 6,9 | 7,8 | 14,5 | 13,6 |
| Disordered Speech | 19,2 | 20,6 | 51,0 | 59,3 |
| Callcenter | 9,5 | 10,3 | 13,5 | 23,9 |
| Media | 8,4 | 9,2 | 19,4 | 25,1 |

Nota: ai-sage no publica un WER de FLEURS ru para el modelo base; el valor de 8,08 % fue medido por el autor de la conversion GGUF.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en todas las cuantizaciones; Q4_K_M (175 MB) y Q5_K_M (196 MB) son las opciones mas ligeras, F32 (846 MB) la mas pesada.
- Cabe en cualquier GPU de consumo moderna e incluso en GPU integradas, gracias al reducido tamano del modelo.
- GPU recomendadas: no se especifican modelos concretos; la validacion reporta aceleracion en Metal (Apple Silicon, M4 Max) y Vulkan (AMD Ryzen 4750U con GPU integrada). Para CUDA no se proporcionan datos de rendimiento.
- Despliegue: exclusivamente mediante transcribe.cpp (compilacion desde fuente con CMake y ejecucion de `transcribe-cli`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato y tarea.
- Latencia y throughput: RTF de 110 en Metal (M4 Max), 27 en CPU (M4 Max), 25 en Vulkan (Ryzen 4750U) y 9 en CPU (Ryzen 4750U); valores mas altos indican mayor velocidad relativa al tiempo real.
- Requisito de entrada: audio WAV mono a 16 kHz; conversion previa con ffmpeg si el origen es MP3 u otro formato.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER ruso (dominios) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GigaAM-v3-rnnt-gguf (esta ficha) | 221,9 M | no disponible (ASR) | 8,08 % FLEURS ru; 8,4 % media upstream | MIT | GGUF en Hugging Face |
| GigaAM-v3 CTC (ai-sage) | 220–240 M | no disponible (ASR) | 9,2 % media upstream | no disponible en la informacion | pesos originales |
| T-One + LM | no disponible | no disponible (ASR) | 19,4 % media upstream | no disponible | no disponible |
| Whisper (large-v3) | no disponible en la informacion | no disponible (ASR) | 25,1 % media upstream; 12,0 % open datasets | no disponible en la informacion | ampliamente disponible |

La comparativa se limita a los datos publicados en la model card: GigaAM-v3 RNN-T supera a T-One + LM y Whisper en todos los dominios reportados, y a la variante CTC del propio GigaAM-v3 en la media global (8,4 % frente a 9,2 %).

## Limitaciones y advertencias

- Solo soporta ruso; no hay capacidades multilingues ni deteccion de idioma.
- Salida sin puntuacion y en minusculas; requiere postprocesado para texto presentable.
- No soporta streaming; la transcripcion es offline sobre archivos completos.
- No soporta traduccion.
- El paquete upstream rechaza audios de mas de 25 s con `transcribe_longform`; en la validacion esto penalizo el WER de referencia, pero conviene trocear audios largos en produccion.
- Riesgo de alucinacion y errores en habla disordenada: el propio modelo base reporta un WER de 19,2 % en Disordered Speech, muy superior a la media.
- Sesgos no documentados en la informacion disponible; al entrenarse con datasets internos de call centers y habla natural, puede reflejar sesgos de esos corpus.
- Licencia MIT heredada del modelo base, que permite uso comercial; conviene revisar la model card upstream para terminos completos.
- Dependencia de una unica libreria (transcribe.cpp) y de audio WAV mono a 16 kHz; no hay integracion documentada con ecosistemas como transformers para esta conversion GGUF.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; ecosistema de validacion reducido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tryambientai/gigaam-v3-rnnt-gguf
- Modelo base: https://huggingface.co/ai-sage/GigaAM-v3
- Commit upstream de referencia: https://huggingface.co/ai-sage/GigaAM-v3/commit/c7f128b
- Libreria transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validacion: https://github.com/handy-computer/transcribe.cpp/tree/42b96d9
- Pagina del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/gigaam-v3-rnnt.md
- Repositorio GigaAM (metricas): https://github.com/salute-developers/GigaAM/blob/main/evaluation.md
- Paper referenciado: arxiv:2506.01192
