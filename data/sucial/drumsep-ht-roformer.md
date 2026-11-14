# Sucial/drumsep-ht-roformer

## Resumen

drumsep-ht-roformer es un modelo de separación de fuentes de audio especializado en batería, desarrollado por el usuario Sucial y publicado en Hugging Face. Su función es descomponer una pista de batería en seis stems independientes: bombo (kick), caja (snare), charles (hihat), toms, platillos (cymbal) y un stem residual "other". Se trata, por tanto, de una herramienta de procesamiento de audio para producción musical, remezcla y análisis, no de un modelo de lenguaje.

La arquitectura, denominada HTRoFormer (Hybrid Transformer RoFormer), combina una rama espectral basada en BS-RoFormer (transformador con atención por bandas de frecuencia y RoPE) con una rama temporal de tipo U-Net convolucional, unidas mediante puentes de atención cruzada. El modelo tiene 186,6 millones de parámetros y un checkpoint de 747 MB en formato PyTorch (`.ckpt`), acompañado de un fichero YAML de configuración compatible con pymss/pymss-core.

Es relevante porque aplica el paradigma híbrido tiempo-frecuencia (popularizado por HTDemucs) a un backbone RoFormer, orientado específicamente a la separación multi-stem de batería con seis salidas, un caso de uso más granular que la separación convencional de cuatro stems (voz, batería, bajo, otros).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | HTRoFormer (Hybrid Transformer RoFormer): rama espectral BS-RoFormer + rama temporal Conv U-Net con puentes de atención cruzada |
| Parámetros totales | 186,6 M |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; ventana de audio de 266.240 muestras por chunk (múltiplo de 1024) |
| Tipos de cuantización | no disponible (checkpoint en precisión de almacenamiento fp16 según verificación) |
| Idiomas soportados | no disponible (modelo de audio, no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | `.ckpt` (PyTorch state dict, carga con `strict=True`); configuración en `.yaml` |
| Tamaño del repositorio | 0,7 GB |
| Stems de salida | 6: kick, snare, hihat, tom, cymbal, other |
| STFT | ventana 2048, hop 1024, 62 bandas, 1025 bins de frecuencia, 261 frames |
| Dependencias de inferencia | torch, soundfile (librosa solo para remuestreo) |

## Arquitectura y entrenamiento

El modelo sigue una topología híbrida inspirada en HTDemucs. La rama espectral es un BS-RoFormer completo: aplica STFT (ventana 2048, hop 1024) sobre la mezcla estéreo, divide el espectro en 62 bandas y procesa la representación con 12 capas de transformador sobre los ejes de tiempo y frecuencia, usando atención con `F.scaled_dot_product_attention` y RoPE. La rama temporal es una U-Net convolucional que opera sobre la señal estandarizada globalmente como `(x-mean)/(std+1e-5)`, con tres etapas de downsample (64→128→192→256 canales) mediante convoluciones de stride 8, 8 y 16, y bloques DConvBlock con convoluciones dilatadas y activación GLU.

Las dos ramas se comunican mediante CrossBridge insertados tras las capas 0, 3, 6 y 9 del transformador, que combinan autoatención temporal, proyección frecuencia→tiempo y atención cruzada en ambos sentidos (Q=tiempo, KV=media de bandas; y Q=por banda, KV=tiempo). La salida final suma la iSTFT de los espectros complejos enmascarados (`stft_real + j*stft_imag`) con la salida temporal, un residual de aproximadamente el 1 % de la señal que cancela el sangrado de máscaras en stems vacíos. La verificación tensor a tensor del port a PyTorch reporta un error relativo de 1,5e-4 en el residual temporal y 2e-3 en las máscaras STFT. No se dispone de información sobre el dataset de entrenamiento, el número de tokens/audios, ni si hubo ajuste fino con preferencias.

## Capacidades

- Separación de batería en seis stems: kick, snare, hihat, tom, cymbal y other.
- Procesamiento por chunks con solapamiento MSST-style (overlap 2, step = chunk/2, fundido lineal de chunk/10 muestras).
- Modos de salida configurables: `sum` (por defecto, suma espectral + temporal), `spectral` (solo rama espectral) y `time` (solo rama temporal).
- Inferencia autónoma con solo torch y soundfile, sin einops, beartype ni rotary_embedding_torch.
- Escritura de stems en FLAC, con nombres numerados (`1.flac`…`6.flac`) o descriptivos (`01_kick.flac`…).
- Remuestreo automático cuando es necesario (requiere librosa).
- No soporta tool calling, agentes, visión, audio-texto ni capacidades multilingües: es un modelo puramente de separación de audio.

## Casos de uso

- Producción musical y remezcla: separar una pista de batería en seis componentes permite sustituir o procesar individualmente el bombo, la caja o los platillos sin afectar al resto, algo útil en remezclas y edición multipista.
- Sustitución de samples (drum replacement): aislar el kick o el snare para reemplazarlos por samples de biblioteca manteniendo la interpretación original, con la ventaja de disponer de stems separados de tom y cymbal que evitan contaminación cruzada.
- Corrección y limpieza de grabaciones: atenuar o eliminar el sangrado de platillos en la pista de caja, o reducir el ruido del stem "other", gracias a la cancelación de sangrado que proporciona la suma espectral + temporal.
- Extracción de MIDI y transcripción rítmica: los stems aislados sirven como entrada a detectores de onsets y transcriptores de batería, mejorando la precisión al reducir la polifonía de la señal de entrada.
- Educación y análisis musical: estudiar la interpretación de cada componente de la batería por separado en grabaciones comerciales, útil en conservatorios y análisis musicológico.
- Investigación en separación de fuentes: servir como baseline o componente de pipelines de investigación en music information retrieval (MIR), dado que el código de inferencia es autónomo y el checkpoint carga con `strict=True`.
- Postproducción de vídeo y podcast: aislar la batería de una mezcla para reducir su nivel o aplicar procesado dinámico sin afectar a voces e instrumentos armónicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 186,6 M de parámetros y checkpoint de 747 MB, la inferencia en fp16 requiere del orden de 1-2 GB de VRAM para pesos y activaciones, aunque esta cifra no está confirmada por el autor.
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU con al menos 4 GB de VRAM debería poder ejecutar el modelo; se recomienda una RTX 3060 o superior para procesar audio de forma ágil.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del modelo, aunque no hay confirmación oficial.
- Opciones de despliegue: script de inferencia autónomo incluido (`infer/inference.py`) con torch y soundfile; configuración compatible con pymss/pymss-core. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de audio).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Stems | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| drumsep-ht-roformer | Híbrido BS-RoFormer + U-Net | 186,6 M | 6 (batería) | no disponible | Hugging Face (Sucial) |
| Demucs (htdemucs) | Híbrido tiempo-frecuencia | no disponible en la información | 4 (voz, batería, bajo, otros) | MIT (versión original de Meta) | Repositorio oficial de Meta |
| BS-RoFormer | Transformador espectral | no disponible en la información | variable (2-4 típicamente) | no disponible | Repositorios de la comunidad |

La comparación cuantitativa de rendimiento no está disponible en la información proporcionada. La diferencia principal frente a Demucs es la granularidad: drumsep-ht-roformer separa la batería en seis componentes, mientras que Demucs la trata como un único stem.

## Limitaciones y advertencias

- El chunk debe ser múltiplo de 1024; de lo contrario, los recuentos de frames STFT y de la rama temporal no coinciden. El script de inferencia redondea hacia arriba y avisa.
- La estandarización se aplica sobre el chunk completo, por lo que los límites entre bloques pueden diferir ligeramente; se recomienda el solapamiento MSST-style por defecto (overlap 2).
- `inference.normalize` debe permanecer en `false`, ya que el modelo estandariza internamente.
- Los tensores `stft_real/imag` son espectros complejos multiplicados por máscara, no máscaras puras; una iSTFT propia debe usar hop 1024, `center=True` y ventana Hann.
- El modelo está entrenado exclusivamente para batería; no debe esperarse un rendimiento correcto en mezclas completas ni en otros instrumentos.
- Licencia no especificada: no se puede confirmar el uso comercial sin consultar al autor.
- No se han publicado datos sobre sesgos, alucinaciones (no aplicable) ni evaluación objetiva de calidad de separación (SDR, SI-SNR).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria del rendimiento real.

## Enlaces

- Hugging Face: https://huggingface.co/Sucial/drumsep-ht-roformer
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información disponible.
