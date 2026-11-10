# SpeechAntiSpoofingBenchmarks/Nes2Net-X-CtrSVDD

## Resumen

Nes2Net-X-CtrSVDD es un detector de deepfakes de voz cantada (singing-voice anti-spoofing) empaquetado por el proyecto Speech Anti-Spoofing Arena. No es un modelo generativo: es un clasificador binario que recibe una ventana de audio y emite un unico logit donde valores altos indican audio genuino (bona fide) y valores bajos indican audio sintetico o manipulado. El modelo combina un front-end WavLM-Large completamente ajustado (fine-tuned) con un back-end Nes2Net-X basado en TDNN con bloques Res2Net anidados, sumando 315,96 millones de parametros.

El checkpoint original fue entrenado por los autores del paper Nes2Net (arXiv:2504.05657) sobre el conjunto CtrSVDD (controlled singing voice deepfake detection, SVDD 2024), es decir, sobre voz cantada y no sobre habla. El paquete de Hugging Face es un wrapper de evaluacion que lo incorpora al banco de pruebas Speech Anti-Spoofing Arena como referencia fuera de dominio (out-of-domain): un modelo entrenado en canto evaluado sobre datasets de habla.

Su relevancia actual es doble. Por un lado, sirve como linea base para medir cuanto se degrada un detector especializado cuando cambia el dominio acustico. Por otro, documenta un caso practico de empaquetado reproducible con resultados EER por dataset, pesos no re-alojados por restricciones de licencia y una implementacion TensorRT que iguala a PyTorch en el conjunto completo J-SPAW_LA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | WavLM-Large (front-end, 25 estados ocultos fusionados por squeeze-excitation layer attention) + Nes2Net-X (back-end TDNN con Res2Net anidado, dilatacion 1), pooling temporal por media y una sola logit |
| Parametros totales | 315.964.534 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana fija de 64.600 muestras de audio (primeros 64.600 samples, repetidos con padding si el audio es mas corto) |
| Tipos de cuantizacion | FP32 (checkpoint original); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible (modelo acustico independiente del idioma; entrenado sobre canto) |
| Licencia | Apache 2.0 (wrapper); los pesos originales no se re-alojan y el autor no concede licencia explicita sobre ellos |
| Formato de pesos | checkpoint PyTorch `.pt` (FP32); el repositorio de Hugging Face no contiene los pesos |

## Arquitectura y entrenamiento

El modelo sigue un diseno en dos etapas. El front-end es un WavLM-Large completamente ajustado cuyos 25 estados ocultos se combinan mediante squeeze-excitation layer attention (SEA), lo que permite ponderar dinamicamente la contribucion de cada capa. La representacion fusionada pasa a un back-end Nes2Net-X, una red TDNN con bloques Res2Net anidados y dilatacion 1, seguida de un pooling temporal por media y una capa final que produce un unico logit. La etiqueta 1 corresponde a audio real.

El entrenamiento se realizo sobre el split de train de CtrSVDD, un corpus de deteccion de deepfakes en voz cantada controlada de SVDD 2024. El checkpoint publicado corresponde a la semilla 420, epoca 75, con un EER de validacion de 0,03192785031473534 (3,19 %). No se documentan en la informacion disponible el numero de tokens o horas de audio, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO (no aplicables en un clasificador de este tipo). La innovacion tecnica destacable es la fusion por atencion de capas del front-end y el uso de un back-end anidado de tipo Res2Net para capturar patrones de artefactos en multiples escalas temporales.

## Capacidades

- Deteccion binaria de audio real frente a audio sintetico o manipulado, con una unica puntuacion por ventana (mayor = bona fide).
- Procesamiento de audio en bruto a 16 kHz mediante front-end WavLM, sin necesidad de extraer caracteristicas manuales.
- Ventana determinista de 64.600 muestras con repeat-padding para audios mas cortos, lo que facilita la reproducibilidad.
- Evaluacion en multiples dominios acusticos: habla (ASVspoof 2019/2021, ASVspoof5, InTheWild), canto (CtrSVDD, J-SPAW_LA, LibriSeVoc), audio parcial (ADD22, ADD2023, CFAD, CD-ADD), voz clonada (CVoiceFake, DeepVoice, SONAR, DECRO) y otros (ArAD, ODSS, EmoSpoofTTS, LRLspoof).
- Implementacion TensorRT disponible como clase drop-in, con equivalencia verificada frente a PyTorch en el conjunto completo J-SPAW_LA.
- No soporta generacion de texto, razonamiento, codigo, vision, tool calling ni agentes; es exclusivamente un clasificador de audio.

## Casos de uso

- Referencia fuera de dominio en investigacion anti-spoofing: sirve para cuantificar la perdida de rendimiento cuando un detector entrenado en canto se aplica a habla, comparando su EER en datasets como ASVspoof2019_LA (12,09 %) frente a J-SPAW_LA (1,44 %).
- Auditoria de pipelines de sintesis de voz cantada: integrado como filtro previo a la publicacion de audio musical generado, detecta artefactos caracteristicos de voces cantadas sinteticas.
- Validacion de datasets de canto: permite puntuar corpus de voz cantada y separar muestras reales de generadas antes de usarlas en entrenamiento.
- Benchmarking de nuevos detectores: al estar empaquetado en Speech Anti-Spoofing Arena, cualquier modelo nuevo puede compararse contra esta linea base con los mismos conjuntos y umbrales.
- Despliegue de baja latencia con TensorRT: la clase drop-in permite ejecutar el detector en GPUs de consumo (RTX 4070 Ti SUPER y RTX 5060 Ti documentadas) manteniendo resultados identicos a PyTorch.
- Investigacion sobre generalizacion entre dominios acusticos: el contraste entre sus resultados en canto (LibriSeVoc 3,29 %, J-SPAW_LA 1,44 %) y en habla (SONAR 30,41 %, DECRO 35,93 %) es un caso de estudio util para disenar estrategias de adaptacion de dominio.
- Educacion y divulgacion: ejemplo reproducible de como empaquetar un checkpoint academico en un wrapper de evaluacion con metadatos y resultados por dataset.

## Benchmarks y rendimiento

EER % (menor es mejor). EmoSpoofTTS y LRLspoof son spoof-only y usan 1-SRR % en el umbral EER de DeepVoice. J-SPAW_LA se puntuo con el wrapper PyTorch; el resto con la clase TensorRT (FP32).

| Dataset | EER % |
|---|---|
| J-SPAW_LA | 1,44 |
| CD-ADD | 0,96 |
| LibriSeVoc | 3,29 |
| ASVspoof2021_DF | 6,35 |
| ASVspoof5 | 7,10 |
| ArAD | 9,71 |
| ASVspoof2019_LA | 12,09 |
| ASVspoof2021_LA | 12,74 |
| ADD22_eval_31 | 17,22 |
| InTheWild | 17,34 |
| CVoiceFake_small | 17,89 |
| CFAD | 19,04 |
| DeepVoice | 19,32 |
| ODSS | 21,22 |
| ADD2023_track12_test_r1 | 29,97 |
| SONAR | 30,41 |
| DECRO | 35,93 |

No se han publicado en la informacion disponible resultados comparativos directos con otros modelos en los mismos conjuntos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,3 GB solo para pesos en FP32 (315,96 M de parametros), mas activaciones y memoria del front-end WavLM; el repo de Hugging Face ocupa 0,1 GB porque no incluye los pesos.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para FP32; documentado funcionando en RTX 4070 Ti SUPER y RTX 5060 Ti.
- Cabe en GPU de consumo: si, incluidas RTX 3060, RTX 4060, RTX 4070 y superiores con VRAM suficiente.
- Opciones de despliegue: PyTorch nativo (wrapper incluido) y TensorRT (clase drop-in). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un clasificador de audio.
- Latencia y throughput: no disponibles en la informacion proporcionada; la ventana fija de 64.600 muestras (unos 4 segundos a 16 kHz) acota el coste por inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nes2Net-X-CtrSVDD | 315,96 M | ventana fija de 64.600 muestras | CtrSVDD (canto) | Apache 2.0 (wrapper); pesos sin licencia explicita | Wrapper en HF; pesos enlazados externamente |
| WavLM-Large base | ~317 M | variable (front-end) | Habla (preentrenamiento) | MIT (modelo original) | Disponible en HF |
| Otros detectores del Speech Anti-Spoofing Arena | no disponible | no disponible | Distintos dominios | no disponible | no disponible |

No se dispone en la informacion proporcionada de resultados de otros detectores del Arena para una comparacion numerica directa.

## Limitaciones y advertencias

- Modelo entrenado sobre voz cantada y evaluado sobre habla: su rendimiento en habla es notablemente peor (SONAR 30,41 %, DECRO 35,93 %) que en canto (J-SPAW_LA 1,44 %, LibriSeVoc 3,29 %).
- Los pesos originales no se re-alojan en Hugging Face y el autor no concede licencia explicita sobre ellos; la licencia Apache 2.0 se aplica al wrapper, no necesariamente al checkpoint. Verificar antes de uso comercial.
- Riesgo de falsos positivos y falsos negativos: al ser un clasificador binario con un unico logit, el umbral debe calibrarse por dominio; el umbral EER de DeepVoice se usa para los datasets spoof-only.
- Ventana fija de 64.600 muestras con repeat-padding: audios mas cortos se repiten, lo que puede introducir artefactos; audios mas largos requieren segmentacion manual.
- Sesgos conocidos no documentados en la informacion disponible; al entrenarse solo con canto controlado, puede no generalizar a otros estilos, idiomas o condiciones de grabacion.
- No es un modelo generativo: no debe usarse para sintesis, transcripcion ni tareas de lenguaje.
- Resultados dependientes de la implementacion: el wrapper PyTorch y la clase TensorRT se validaron como equivalentes en J-SPAW_LA, pero no se detalla la equivalencia en el resto de conjuntos.
- Repositorio con 0 descargas destacadas y 0 likes en el momento de la consulta; proyecto de investigacion sin soporte comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SpeechAntiSpoofingBenchmarks/Nes2Net-X-CtrSVDD
- Speech Anti-Spoofing Arena (Space): https://huggingface.co/spaces/SpeechAntiSpoofingBenchmarks/SpeechAntiSpoofingArena
- Ficha del sistema en el Arena: https://huggingface.co/spaces/SpeechAntiSpoofingBenchmarks/SpeechAntiSpoofingArena?system=nes2net-x-ctrsvdd
- Paper Nes2Net: https://arxiv.org/abs/2504.05657
- Codigo de los autores: https://github.com/Liu-Tianchi/Nes2Net/tree/3fed08a603991cf8b422978e0c942a976deb9399
- Checkpoint de los autores: https://huggingface.co/nielsr/nes2net-checkpoints/blob/06818cabb70c44d3008fdeb9285f141f198aa92a/WavLM_Nes2Net_X_e75_seed420_valid0.03192785031473534.pt
