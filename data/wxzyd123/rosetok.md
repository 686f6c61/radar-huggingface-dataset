# wxzyd123/ROSETok

## Resumen

ROSETok es un tokenizador de voz (speech tokenizer) desarrollado por wxzyd123 y presentado en NeurIPS 2026. Resuelve un problema concreto: los tokenizadores de voz convencionales degradan sus representaciones acústicas y semánticas cuando la señal de entrada contiene ruido o perturbaciones adversarias. ROSETok combina entrenamiento con ruido gaussiano y destilación semántica desde Whisper large-v3 para mantener tanto la calidad de reconstrucción como la información semántica bajo condiciones adversas.

El modelo emplea una arquitectura de códec neuronal basada en DAC (Descript Audio Codec) con un encoder y un decoder con strides 2, 4, 5 y 8, seguido de cuantización vectorial residual con 9 codebooks de 1024 entradas y dimensión 8. Trabaja con voz mono a 16 kHz, produce 50 frames por segundo (hop size de 320 muestras) y genera características de dimensión 1280 antes de la cuantización.

Se publican dos checkpoints: ROSETok-Base, entrenado sobre aproximadamente 96.700 horas de voz en inglés y chino del dataset Emilia, y ROSETok-AAF, un ajuste fino consciente de ataques (attack-aware fine-tuning) sobre 2.000 enunciados de LibriSpeech perturbados con T-SemAttack. Es relevante para investigadores que necesitan tokenizadores robustos en pipelines de modelos de lenguaje de audio, sistemas de compresión de voz o evaluación de seguridad de representaciones discretas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codec neuronal DAC (encoder/decoder convolucional) con cuantizacion vectorial residual |
| Parametros totales | no disponible (checkpoints de ~2,86 GB, incluyen el teacher semantico) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio, no de texto; procesa senal continua) |
| Tipos de cuantizacion | no disponible (checkpoints en PyTorch float) |
| Idiomas soportados | ingles y chino (entrenamiento) |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pth` (diccionario con `metadata` y `state_dict`) |

## Arquitectura y entrenamiento

ROSETok es un códec de audio neuronal inspirado en DAC. El encoder aplica strides de 2, 4, 5 y 8 sobre voz mono a 16 kHz, lo que da un hop size de 320 muestras (50 frames por segundo) y una dimensión de característica de 1280. La cuantización es residual vectorial con 9 codebooks de 1024 entradas cada uno y dimensión 8 por entrada. El decoder reconstruye la forma de onda a partir de los códigos discretos. El modelo expone tanto características pre-cuantización (`encoded`) como códigos discretos (`codes`).

El entrenamiento de ROSETok-Base usa aproximadamente 96.700 horas de voz en inglés y chino del dataset Emilia, con aumento de datos mediante ruido gaussiano y destilación semántica desde Whisper large-v3 como teacher. La destilación fuerza a las representaciones internas a preservar información semántica incluso bajo ruido. ROSETok-AAF se obtiene con un segundo estadio de ajuste fino sobre 2.000 enunciados de LibriSpeech perturbados con ejemplos generados por T-SemAttack (ataque semántico transferible). Los checkpoints publicados incluyen los pesos del teacher semántico, de ahí su tamaño de ~2,86 GB cada uno; en inferencia solo se cargan los parámetros `encoder.*`, `quantizer.*` y `decoder.*`.

## Capacidades

- Reconstrucción de voz: codifica y decodifica audio mono a 16 kHz con calidad de códec neuronal.
- Tokenización discreta de voz: genera códigos discretos (9 codebooks de 1024 entradas) aptos para modelos de lenguaje de audio.
- Extracción de características semánticas: devuelve features pre-cuantización (`encoded`) y latentes proyectados (`latents`) alineados semánticamente con Whisper large-v3.
- Robustez ante ruido: el checkpoint Base incorpora aumento con ruido gaussiano; el checkpoint AAF añade robustez frente a ataques semánticos transferibles.
- Soporte multilingüe: inglés y chino en entrenamiento.
- Salida completa de inferencia: audio reconstruido, códigos, features cuantizadas, latentes y pérdidas de commitment y codebook.
- No soporta tool calling, agentes ni razonamiento multi-paso: es un tokenizador de audio, no un modelo generativo de texto.

## Casos de uso

- Modelos de lenguaje de audio: ROSETok convierte voz en secuencias discretas que pueden alimentar un LLM de audio; su robustez al ruido reduce la degradación de los tokens en entornos reales con ruido de fondo.
- Compresión de voz para transmisión: el códec con 50 frames por segundo y 9 codebooks permite representaciones compactas de voz a 16 kHz para almacenamiento o streaming.
- Investigación en seguridad de tokenizadores: el checkpoint AAF y el código de T-SemAttack permiten reproducir ataques semánticos transferibles y evaluar la robustez de otros tokenizadores.
- Preprocesado para ASR y traducción de voz: las features semánticas destiladas de Whisper large-v3 sirven como entrada intermedia para sistemas posteriores, con menor sensibilidad al ruido.
- Generación y clonación de voz (TTS/voice conversion): el decoder reconstruye formas de onda a partir de códigos discretos, útil en pipelines de síntesis basados en tokens.
- Evaluación comparativa de códecs neuronales: los checkpoints Base y AAF permiten medir el coste de robustez frente a calidad de reconstrucción en condiciones controladas.
- Filtrado y aumento de datos: la tokenización robusta facilita la selección de datos de voz en corpus ruidosos como Emilia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; cada checkpoint pesa ~2,86 GB, pero en inferencia solo se cargan `encoder.*`, `quantizer.*` y `decoder.*`, por lo que el uso real de memoria es inferior al tamaño del fichero. Se recomienda al menos 4-6 GB de VRAM para el subconjunto de inferencia, aunque es una estimación, no un dato publicado.
- GPU recomendadas: no disponible. El ejemplo oficial usa CUDA si está disponible y cae a CPU en caso contrario.
- GPU de consumo: probablemente cabe en GPUs de consumo modernas (RTX 3060 en adelante) al cargar solo el códec, aunque no hay cifras oficiales.
- Opciones de despliegue: PyTorch nativo con el repositorio T-SemAttack; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplica a un tokenizador de audio).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / tasa | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ROSETok | Codec + tokenizador robusto | no disponible (~2,86 GB por checkpoint) | 16 kHz, 50 fps, 9 codebooks | en, zh | MIT | Hugging Face |
| DAC (Descript Audio Codec) | Codec neuronal | no disponible | 16-44,1 kHz, multiples configs | no especificado | MIT | GitHub / HF |
| EnCodec (Meta) | Codec neuronal | ~ no disponible | 24-48 kHz, 75 Hz | no especificado | MIT (pesos con terminos) | GitHub / HF |
| Whisper large-v3 (teacher) | ASR / encoder semantico | 1.550 M | 30 s por ventana | multilingue | MIT | HF / OpenAI |

La comparación con DAC y EnCodec es la más directa por compartir familia arquitectónica de códec; ROSETok añade entrenamiento con ruido y destilación semántica, pero no hay cifras públicas de calidad (PESQ, STOI, MUSHRA) en la información disponible para cuantificar la diferencia.

## Limitaciones y advertencias

- Solo se ha entrenado y evaluado en inglés y chino; el rendimiento en otros idiomas requiere evaluación independiente.
- La robustez reportada está acotada a los niveles de ruido, ataques, datasets y modelos downstream descritos en el paper; otras familias de ataques acústicos no están cubiertas.
- El decoder tiene un padding de stride 5 que puede hacer la reconstrucción hasta 8 muestras más corta que la entrada (0,5 ms a 16 kHz); para comparaciones alineadas hay que recortar la referencia.
- Los checkpoints incluyen el teacher semántico de entrenamiento, lo que infla el tamaño del fichero; hay que filtrar las claves al cargar con `strict=True`.
- No hay datos publicados de benchmarks objetivos (calidad de reconstrucción, WER downstream, robustez medida) en la información disponible.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero el decoder puede introducir artefactos en señales fuera de distribución.
- Sesgos: no documentados; dependen del corpus Emilia (inglés y chino) y de Whisper large-v3 como teacher.
- Licencia MIT permite uso comercial, pero el autor restringe explícitamente el uso a investigación y evaluación autorizadas en la model card.
- No es un modelo de texto: no soporta tool calling, agentes ni razonamiento; no debe evaluarse con benchmarks de LLM.

## Enlaces

- Hugging Face: https://huggingface.co/wxzyd123/ROSETok
- Paper (arXiv): https://arxiv.org/abs/2611.14929
- Código: https://github.com/wxzyd123/T-SemAttack
- Demo de audio: https://wxzyd123.github.io/t-semattack/
- Dataset Emilia: https://huggingface.co/datasets/amphion/Emilia-Dataset
- Dataset LibriSpeech: https://huggingface.co/datasets/openslr/librispeech_asr
