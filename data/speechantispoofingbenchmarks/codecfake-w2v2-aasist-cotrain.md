# SpeechAntiSpoofingBenchmarks/Codecfake-W2V2-AASIST-CoTrain

## Resumen

Codecfake-W2V2-AASIST-CoTrain es un contramedida de deteccion de audio falsificado (anti-spoofing) empaquetada por la organizacion SpeechAntiSpoofingBenchmarks para su evaluacion en la Speech Anti-Spoofing Arena. No es un modelo generativo, sino un clasificador binario que distingue voz autentica (bona fide) de voz sintetica o convertida. Combina un front-end congelado wav2vec 2.0 XLS-R de 300 M de parametros con una cabeza AASIST basada en atencion grafos espectro-temporales, sumando 76,55 M de parametros entrenables.

El modelo procede del paper Codecfake (Xie et al., arXiv:2405.04880) y corresponde a la variante co-entrenada con el muestreador CSAM, que segun los autores es la contramedida principal del trabajo. Se entreno sobre la particion de entrenamiento de ASVspoof 2019 LA mas el conjunto de entrenamiento de Codecfake, lo que le permite detectar artefactos tanto de TTS y voice conversion clasicos como de vocoders neuronales modernos.

Su relevancia actual radica en que los benchmarks publicados muestran un EER del 0,31 % en ASVspoof 2019 LA y del 2,59 % en ASVspoof 2021 DF, con caidas notables en conjuntos mas dificiles como ASVspoof5 (17,51 %). El paquete no re-aloja los pesos: el wrapper los descarga desde un commit fijado del repositorio GitHub de los autores y verifica su sha256, ya que el repositorio original no declara licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec 2.0 XLS-R 300M congelado (hidden_states[5]) + cabeza AASIST (linear 1024->128, residual encoder, graph attention espectro-temporal) |
| Parametros totales | 76.554634 M (entrenables en la cabeza y proyeccion; el front-end XLS-R va congelado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada fija de 64600 muestras, repetida en tile si la senal es mas corta) |
| Tipos de cuantizacion | FP32 (unico formato documentado en el wrapper) |
| Idiomas soportados | no disponible (el modelo opera sobre senal acustica, no sobre texto) |
| Licencia | other (el repositorio upstream no declara licencia; los pesos no se re-alojan) |
| Formato de pesos | checkpoint PyTorch (.pt) descargado desde el repositorio de los autores con verificacion sha256 |

## Arquitectura y entrenamiento

La arquitectura es un pipeline en dos etapas. La primera es un extractor de caracteristicas wav2vec 2.0 XLS-R de 300 M de parametros, mantenido congelado, que recibe la entrada normalizada por media y varianza a nivel de utterance y expone los estados ocultos tras su quinta capa transformer (hidden_states[5] en la nomenclatura de Hugging Face). La segunda es una cabeza AASIST que proyecta de 1024 a 128 dimensiones, aplica un codificador residual y culmina en una atencion de grafo espectro-temporal que modela relaciones entre subbandas de frecuencia y tramas temporales. La salida es un log-odds de que la muestra sea bona fide.

El entrenamiento usa la particion de entrenamiento de ASVspoof 2019 LA combinada con el conjunto de entrenamiento de Codecfake, aplicando el muestreador CSAM descrito en el paper. No se documentan en la informacion disponible detalles sobre numero total de tokens o horas de audio, composicion exacta del dataset ni si se empleo RLHF o DPO (no aplica en un clasificador). La innovacion tecnica destacable es precisamente el co-entrenamiento con datos especificos de vocoders neuronales (Codecfake), que busca generalizar mejor ante artefactos de sintesis moderna frente a contramedidas entrenadas solo con datos ASVspoof.

## Capacidades

- Deteccion binaria de audio falsificado: devuelve un score continuo donde valores mas altos indican mayor probabilidad de voz autentica (bona fide).
- Deteccion de artefactos de TTS y voice conversion clasicos, entrenado sobre ASVspoof 2019 LA.
- Deteccion de artefactos de vocoders neuronales modernos gracias al co-entrenamiento con Codecfake.
- Procesamiento de audio de hasta 64600 muestras por inferencia (aproximadamente 4 segundos a 16 kHz), con repeticion en tile si la senal es mas corta.
- Evaluacion en multiples dominios de benchmark: ASVspoof 2019/2021/5, InTheWild, ADD22, ADD2023, CFAD, CD-ADD, CVoiceFake, DeepVoice, LibriSeVoc, SONAR, ArAD, DECRO y J-SPAW.
- No soporta tool calling, agentes, razonamiento multi-paso ni generacion de texto: es exclusivamente un clasificador acustico.
- No tiene capacidades multilingues en el sentido textual; el front-end XLS-R es multilingue por preentrenamiento, pero el modelo no procesa idioma de forma explicita.

## Casos de uso

- Verificacion de autenticidad en sistemas de atencion al cliente: el modelo puede puntuar cada utterance entrante y marcar como sospechosas las llamadas generadas por TTS o voice conversion antes de derivar a un agente humano, apoyandose en su EER del 4,56 % en InTheWild.
- Deteccion de deepfakes en verificacion de identidad biometrica: integrado como segunda capa tras el reconocimiento de locutor, reduce el riesgo de suplantacion con voz sintetica, con EER del 2,59 % en ASVspoof 2021 DF.
- Moderacion de contenido en plataformas de audio: filtrado de clips generados por IA en podcasts, audiolibros o redes sociales, usando el score como senal de triaje para revision humana.
- Investigacion en anti-spoofing: el wrapper sirve como linea base reproducible en la Speech Anti-Spoofing Arena, con resultados por dataset almacenados en `.eval_results/`, lo que facilita comparaciones entre contramedidas.
- Monitorizacion de calidad en pipelines de sintesis de voz: detectar si un vocoder propio introduce artefactos detectables, comparando el score del modelo sobre las salidas generadas frente a grabaciones reales.
- Analisis forense de grabaciones: apoyo a peritos que necesitan un indicio cuantitativo de manipulacion por sintesis, siempre como evidencia complementaria y no concluyente.
- Evaluacion de robustez de sistemas ASV: probar contramedidas en conjuntos como ASVspoof5 o CFAD, donde el modelo obtiene EER del 17,51 % y 11,32 % respectivamente, para calibrar umbrales de operacion.

## Benchmarks y rendimiento

Resultados de EER % publicados en la model card (menor es mejor). EmoSpoofTTS y LRLspoof son spoof-only y usan 1-SRR % en el umbral EER de DeepVoice; no se incluyen cifras para esos dos conjuntos en la informacion disponible.

| Dataset | EER % |
|---|---|
| ASVspoof2019_LA | 0,31 |
| ASVspoof2021_LA | 6,05 |
| ASVspoof2021_DF | 2,59 |
| ASVspoof5 | 17,51 |
| InTheWild | 4,56 |
| ADD22_eval_31 | 3,87 |
| ADD2023_track12_test_r1 | 12,38 |
| CFAD | 11,32 |
| CD-ADD | 0,71 |
| CVoiceFake_small | 9,02 |
| DeepVoice | 6,37 |
| LibriSeVoc | 0,19 |
| SONAR | 6,27 |
| ArAD | 9,92 |
| DECRO | 4,47 |
| J-SPAW_LA | 0,06 |

No se han publicado en la informacion disponible resultados comparativos directos con otras contramedidas en la misma tabla, ni cifras de MMLU, HumanEval o GSM8K (no aplican a este tipo de modelo).

## Requisitos de hardware

- VRAM estimada: el modelo completo en FP32 ocupa aproximadamente 0,3 GB (76,55 M de parametros), por lo que cabe holgadamente en cualquier GPU consumer con 4 GB o mas.
- GPU recomendadas: cualquier GPU moderna es suficiente; la model card documenta inferencia con TensorRT en RTX 4070 Ti SUPER y RTX 5060 Ti en FP32.
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas de los ultimos anos, e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: wrapper PyTorch incluido en el repositorio y clase drop-in para TensorRT documentada por los autores; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplican a un clasificador de audio).
- Latencia y throughput: no disponibles de forma numerica; la model card solo indica que la version TensorRT en FP32 coincidio con PyTorch en el conjunto completo J-SPAW_LA.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de resultados de otros sistemas en la misma tabla de benchmarks, por lo que no es posible establecer una comparativa numerica fiable. Como referencia cualitativa, la familia AASIST original y las variantes W2V2-AASIST sin co-entrenamiento son los parientes arquitectonicos mas directos, pero sus cifras en estos conjuntos no se incluyen aqui. Se indica por tanto: no disponible.

## Limitaciones y advertencias

- Licencia ambigua: el repositorio upstream no declara licencia, por lo que el wrapper no re-aloja los pesos y los descarga desde un commit fijado; el uso comercial queda en una zona legal incierta y requiere contactar con los autores originales.
- Rendimiento desigual entre dominios: el EER sube al 17,51 % en ASVspoof5 y al 12,38 % en ADD2023, lo que indica poca robustez ante condiciones acusticas o ataques alejados de la distribucion de entrenamiento.
- Entrada truncada: solo procesa las primeras 64600 muestras (unos 4 segundos a 16 kHz), de modo que ataques localizados fuera de esa ventana pueden pasar desapercibidos.
- Riesgo de falsos negativos y positivos: como todo clasificador binario, el umbral debe calibrarse por dominio; los scores son log-odds y no probabilidades calibradas de forma universal.
- Sesgos desconocidos: no se documenta analisis de sesgo por idioma, genero, canal o acento; el front-end XLS-R es multilingue, pero el entrenamiento se limita a ASVspoof 2019 LA y Codecfake.
- No es una prueba forense concluyente: debe usarse como indicio complementario, nunca como unica evidencia en decisiones de seguridad o legales.
- Dependencia de descarga externa: la inferencia requiere acceso al repositorio GitHub de los autores y verificacion sha256; un cambio en el upstream rompe la reproducibilidad.
- Sin soporte de cuantizacion documentado mas alla de FP32: no hay pesos GGUF, ONNX ni INT8 publicados en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SpeechAntiSpoofingBenchmarks/Codecfake-W2V2-AASIST-CoTrain
- Organizacion en Hugging Face: https://huggingface.co/SpeechAntiSpoofingBenchmarks
- Speech Anti-Spoofing Arena: https://huggingface.co/spaces/SpeechAntiSpoofingBenchmarks/SpeechAntiSpoofingArena
- Paper Codecfake: https://arxiv.org/abs/2405.04880
- Repositorio de los autores: https://github.com/xieyuankun/Codecfake
- Checkpoint co-entrenado (commit fijado): https://github.com/xieyuankun/Codecfake/blob/72c32e2840eef95fbeade349425fa9c5391fa11e/pretrained_model/cotrain_w2v2aasist_CSAM/anti-spoofing_feat_model.pt
