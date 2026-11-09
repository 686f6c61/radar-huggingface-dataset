# sukhpalsingh/baniguru_fast_conformer_205m_v1

## Resumen

Baniguru Fast Conformer 205M v1 es un modelo de reconocimiento automático del habla (ASR) especializado en panyabí y, de forma muy concreta, en dominios religiosos sij: kirtan (canto devocional) y sehaj paath (recitación del Gurú Granth Sahib). Lo desarrolla el usuario sukhpalsingh y se publica bajo licencia MIT con el identificador `sukhpalsingh/baniguru_fast_conformer_205m_v1`. El modelo está empaquetado para la librería NeMo de NVIDIA, lo que condiciona tanto el formato de pesos como las herramientas de despliegue disponibles.

La arquitectura es Fast Conformer con unos 205 millones de parámetros, según indica el propio nombre del repositorio, y un tokenizador específico de Gurbani de 2048 tokens diseñado para cubrir tanto la escritura gurmukhi religiosa como el panyabí moderno. El modelo se ha entrenado o ajustado de forma intensiva sobre audio de kirtan y sehaj paath, y el autor advierte explícitamente que el panyabí convencional puede no estar bien cubierto y requerirá ajuste fino adicional con datos de habla estándar.

La relevancia es doble: por un lado cubre un nicho poco atendido por los ASR multilingües comerciales (transcripción de recitación y canto devocional en gurmukhi); por otro, publica métricas WER y CER separadas para dos modos de decodificación (RNNT y CNT) en cada uno de los dos dominios, lo que permite evaluar de antemano el compromiso entre precisión y velocidad. Su tamaño contenido (0,8 GB de repositorio) lo hace viable en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Fast Conformer (ASR, encoder Conformer con subsampling tipo Fast Conformer) |
| Parametros totales | 205 M (según el nombre del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | panyabí (`pa`), con tokenizador Gurbani de 2048 tokens |
| Licencia | MIT |
| Formato de pesos | NeMo (`.nemo`); pesos en safetensors no confirmados |

## Arquitectura y entrenamiento

El modelo sigue la familia Fast Conformer de NVIDIA, un encoder transformer con convoluciones depthwise y un esquema de subsampling agresivo que reduce la longitud de la secuencia antes de entrar en las capas de atención. Sobre ese encoder se monta una cabeza de decodificación híbrida RNNT/CTC, ya que la model card reporta resultados para ambos modos (RNNT y CNT). El tokenizador es un vocabulario Gurbani de 2048 unidades, elegido para representar con fidelidad la ortografía gurmukhi de las escrituras sij y, a la vez, el panyabí moderno.

El autor indica que el modelo fue "heavily transcribed on kirtan and sehaj paath", es decir, ajustado de forma intensiva sobre esos dos dominios, y adjunta el script de entrenamiento (`train_punjabi.py`) con soporte de reanudación (`--resume`). No se detallan en la información disponible el número de horas de audio, la composición exacta del dataset, ni si hubo etapas de RLHF/DPO (poco habituales en ASR). Tampoco se especifican innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Transcripción de audio en panyabí (gurmukhi) en dos dominios principales: kirtan y sehaj paath.
- Decodificación en dos modos: RNNT (mejor precisión) y CNT/CTC (más rápido, peor WER/CER).
- Manejo de vocabulario religioso sij gracias al tokenizador Gurbani de 2048 tokens.
- Reconocimiento de habla continua con encoder Fast Conformer, adecuado para audio de duración media-larga.
- No se documenta soporte de tool calling, agentes, visión, audio de entrada multilingüe ni modo "thinking".
- Capacidad multilingüe limitada al panyabí; no se reportan otros idiomas.

## Casos de uso

- Transcripción de kirtan en directo o grabado: el modelo está ajustado específicamente sobre canto devocional, por lo que puede generar subtítulos o archivos de texto de sesiones de kirtan en gurdwaras con una WER de referencia del 36,16 % en modo RNNT.
- Digitalización de sehaj paath: para recitaciones completas del Gurú Granth Sahib, el modo RNNT ofrece WER 4,35 % y CER 1,50 %, lo que lo hace apto para generar transcripciones revisables por un corrector humano.
- Archivado y búsqueda de grabaciones religiosas: al transcribir audio histórico de kirtan y paath se habilita indexación textual y búsqueda por fragmentos en archivos de audio.
- Herramientas de accesibilidad para comunidades sij: subtitulado automático de transmisiones de gurdwara para personas con dificultades auditivas, aceptando la tasa de error del dominio kirtan.
- Investigación lingüística y etnográfica: análisis de corpus orales de Gurbani con un tokenizador adaptado, útil para estudios de pronunciación y variación dialectal.
- Base para ajuste fino en panyabí estándar: el autor indica que el modelo requiere más entrenamiento con habla panyabí común; sirve como punto de partida para ASR general en panyabí con un script de entrenamiento ya provisto.
- Pipeline de transcripción por lotes en servidores modestos: con 205 M de parámetros y 0,8 GB de repositorio, es viable procesar horas de audio en GPU de gama media o incluso CPU con decodificación CNT.

## Benchmarks y rendimiento

Resultados publicados en la model card (WER y CER, en porcentaje):

| Dominio | Decodificador | WER | CER |
|---|---|---|---|
| Kirtan | RNNT | 36,16 | 17,26 |
| Kirtan | CNT | 42,07 | 19,24 |
| Sehaj paath | RNNT | 4,35 | 1,50 |
| Sehaj paath | CNT | 7,58 | 2,85 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño (205 M de parámetros) se estima un consumo bajo, del orden de 1-2 GB en FP16, aunque es una estimación y no un dato del autor.
- GPU recomendadas: no especificadas. Por tamaño, cabría en RTX 3060/4060, RTX 4090, A100 y H100 sin problema.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con 4 GB o más de VRAM; también es candidato a ejecución en CPU.
- Opciones de despliegue: NeMo (librería nativa, formato `.nemo`); no se documentan exportaciones a vLLM, llama.cpp, Ollama o TGI, que además no aplican a un modelo ASR.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Baniguru Fast Conformer 205M v1 | 205 M | no disponible | pa (Gurbani) | MIT | Hugging Face (NeMo) |
| Whisper (large-v3) | ~1.550 M | 30 s de audio | multilingüe (incluye pa) | MIT | Hugging Face, OpenAI |
| NVIDIA NeMo Fast Conformer multilingüe | variable | no disponible | multilingüe | según checkpoint | NGC / Hugging Face |
| Modelos ASR panyabí comunitarios | variable | no disponible | pa | variable | Hugging Face |

No se dispone de métricas comparativas directas entre estos modelos en la información proporcionada; la comparación es solo estructural.

## Limitaciones y advertencias

- El propio autor advierte que el panyabí convencional puede no estar bien cubierto y requerirá ajuste fino adicional con audio estándar.
- WER del 36,16 % en kirtan (RNNT), elevado para producción sin revisión humana; el canto y la música degradan la transcripción.
- El modo CNT empeora notablemente la precisión (WER 42,07 % en kirtan frente a 36,16 % en RNNT).
- Riesgo de alucinación y errores en nombres propios, términos sánscritos y variantes ortográficas del gurmukhi.
- Sesgos no documentados; al estar entrenado sobre un dominio religioso concreto, puede tener peor rendimiento en habla coloquial, acentos regionales o audio con ruido.
- Licencia MIT: permite uso comercial, pero conviene revisar las condiciones de los datos de entrenamiento, no detalladas.
- Sin descargas ni likes en el momento de la consulta; modelo muy reciente y sin validación comunitaria.
- Dependencia de NeMo para la carga del checkpoint; no hay formatos alternativos documentados.

## Enlaces

- Hugging Face: https://huggingface.co/sukhpalsingh/baniguru_fast_conformer_205m_v1
- Repositorio NeMo (NVIDIA): https://github.com/NVIDIA/NeMo
- Documentación de NeMo ASR: https://docs.nvidia.com/deeplearning/nemo/user-guide/docs/en/stable/asr/intro.html
