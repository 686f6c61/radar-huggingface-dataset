# Super3dMax/htdemucs-whine-hiss-click-bump_v1

## Resumen

HTDemucs Engine es un modelo de separación de fuentes de audio entrenado desde cero por el desarrollador independiente Super3dMax para aislar cuatro componentes de sonidos sintéticos de motor y maquinaria: `whine` (tonos agudos de motor con rampas de frecuencia), `hiss` (ruido de banda ancha), `click` (transitorios cortos de 5-30 ms) y `bump` (golpes graves amortiguados de 25-90 Hz). No es un modelo de lenguaje: es un modelo de procesamiento de señal de audio basado en la arquitectura HTDemucs (híbrido espectrograma + forma de onda con transformer), implementada en `models/demucs4ht.py` del framework Music-Source-Separation-Training.

El modelo resuelve un problema muy específico de separación de stems en el dominio del sonido sintético de máquinas, un nicho distinto al de la separación musical convencional (voces, batería, bajo). Con 41.984.456 parámetros totales y un repositorio de 0,1 GB, está diseñado para ejecutarse en CPU o GPU modesta, y se distribuye en formato GGUF autocontenido para audio.cpp, además de permitir inferencia con PyTorch.

Su relevancia actual es limitada pero concreta: cubre un caso de uso de ingeniería de audio (análisis y descomposición de grabaciones de motores, maquinaria o entornos industriales) donde los modelos Demucs estándar no ofrecen stems especializados. La licencia MIT y el entrenamiento con datos sintéticos generados proceduralmente facilitan su uso comercial sin restricciones de derechos de autor.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HTDemucs (híbrido espectrograma + waveform transformer Demucs), `models/demucs4ht.py` |
| Parametros totales | 41.984.456 (~42 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de audio); STFT con `nfft=4096`, hop 1024 (~23 ms por frame) |
| Tipos de cuantizacion | f16 (~84 MB), q8_0 (~60 MB) en GGUF |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | GGUF autocontenido (audio.cpp) y state dict PyTorch (`.pt`) para mss-training |
| Canales internos | `channels=48`, `bottom_channels=512`, `t_layers=5` |
| Frecuencia de muestreo | 44,1 kHz estéreo (L=R duplicado) |
| Stems de salida | `whine`, `hiss`, `click`, `bump` |

## Arquitectura y entrenamiento

La arquitectura es HTDemucs, un modelo híbrido que combina un codificador/decodificador sobre el espectrograma STFT con un procesamiento en el dominio de la forma de onda, unidos mediante un transformer temporal. La configuración concreta usa `channels=48`, `bottom_channels=512`, `t_layers=5`, `nfft=4096`, representación CaC (complex-as-channels), sin iteraciones de Wiener y con embeddings temporales sinusoidales. El modelo se entrenó desde cero, sin inicialización a partir de pesos preentrenados de Demucs.

El entrenamiento consistió en 300 épocas × 200 pasos = 60.000 pasos de optimizador, con batch size 2, precisión mixta (AMP), optimizador Adam con learning rate 9e-5, función de pérdida `masked_loss` y EMA con momentum 0,999 (se distribuyen los pesos EMA). Se aplicó augmentación de sonoridad por stem en el rango ×[0,5, 1,5]. El conjunto de datos son 1.024 pistas sintéticas de entrenamiento y 128 de validación, WAV estéreo a 44,1 kHz con contenido mono duplicado en L/R, generadas proceduralmente. La separación entre stems sitúa whine/hiss unos 6 dB por debajo de los transitorios. Todo el entrenamiento se ejecutó en una única NVIDIA RTX 5070 Ti de 16 GB en unas 15 horas de tiempo de reloj, incluyendo la validación por época sobre las 128 pistas.

## Capacidades

- Separación de audio en cuatro stems especializados: `whine`, `hiss`, `click` y `bump`.
- Procesamiento de audio estéreo a 44,1 kHz con salidas de la misma longitud que la entrada.
- Manejo de tonos con rampas de frecuencia (aceleración/deceleración de RPM), hum de red (50/60 Hz), hum de bus (~400 Hz), pares con batido y pilas armónicas con inarmonicidad y modulación de amplitud por armónico.
- Separación de ruido de banda ancha (blanco, rosa, marrón) y hiss con deriva progresiva de frecuencia y nivel ligada al fundamental del whine.
- Detección y aislamiento de transitorios cortos (5-30 ms) con trenes de eco sutiles en aproximadamente el 45 % de los eventos.
- Aislamiento de golpes graves amortiguados (25-90 Hz) con ataques suavizados.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo generativo de texto.
- Inferencia en CPU mediante audio.cpp y en GPU/CPU mediante PyTorch (mss-training).
- Integración con el plugin de DAW SpectroCraft a través de su nodo HTDemucs, usando el mismo GGUF.

## Casos de uso

- Análisis de grabaciones de motores en banco de pruebas: el modelo permite descomponer una captura de motor en sus componentes tonal (whine), de ruido (hiss), transitoria (click) y grave (bump), lo que facilita el diagnóstico de vibraciones, ruidos parásitos y golpes mecánicos por separado.
- Mantenimiento predictivo industrial: al aislar el stem `bump` (25-90 Hz) se pueden detectar golpes anómalos en maquinaria rotativa sin que el resto del ruido de fondo enmascare el evento; el stem `click` ayuda a localizar impactos de corta duración.
- Monitorización acústica de entornos con maquinaria: separar el `hiss` de banda ancha permite medir el nivel de ruido de fondo independientemente de los tonos de motor, útil para informes de contaminación acústica o conformidad.
- Generación de datasets de audio sintético etiquetado: dado que el modelo fue entrenado con datos procedurales, puede usarse como referencia o baseline para validar generadores de sonido sintético y pipelines de separación en el dominio de máquinas.
- Prototipado de plugins de DAW: la integración con SpectroCraft y el formato GGUF permiten incorporar la separación de cuatro stems en una cadena de producción de audio sin depender de un servicio en la nube.
- Investigación en separación de fuentes no musical: sirve como punto de partida para experimentos de separación en dominios industriales o de robótica, donde los stems musicales estándar (voz, batería, bajo, otros) no son aplicables.
- Procesado en CPU de bajo coste: con ~84 MB en f16 y ~60 MB en q8_0, el modelo puede ejecutarse en un portátil o en un servidor sin GPU para tareas de análisis por lotes de grabaciones cortas.

## Benchmarks y rendimiento

Resultados de validación sobre las 128 pistas sintéticas de validación, con el código de validación del repositorio de entrenamiento (`demix` con overlap-add, sin TTA):

| Stem | SDR (dB) | SI-SDR (dB) |
|---|---:|---:|
| whine | +22,4 | +22,4 |
| hiss | +15,3 | +15,1 |
| click | +5,1 | +3,0 |
| bump | +18,5 | +18,6 |
| **ALL** | **+15,3** | **+14,8** |

El SDR indicado es el SDR plano (no scale-invariant) usado por el bucle de entrenamiento; el SI-SDR proyecta la estimación sobre la referencia antes de calcular la métrica. El stem `click` es el más débil porque los transitorios de 5-30 ms son más cortos que un frame STFT (`nfft=4096` con hop 1024 ≈ 23 ms), de modo que el enmascaramiento en frecuencia no puede reconstruirlos por completo: el modelo localiza bien los ataques, pero la energía del click se atenúa y se difumina respecto a la referencia. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene ~42 M de parámetros; en f16 ocupa ~84 MB de pesos y en q8_0 ~60 MB, por lo que la VRAM necesaria es mínima (por debajo de 1 GB incluyendo buffers de activación para audio de duración moderada).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; el autor entrenó con una RTX 5070 Ti de 16 GB, pero la inferencia no requiere esa capacidad. Funciona también en CPU.
- Cabe en cualquier GPU de consumo actual (RTX 3060, RTX 4060, RTX 4090, etc.) y en iGPU con suficiente memoria compartida.
- Opciones de despliegue: audio.cpp (CLI `audiocpp_cli.exe` con `--task sep --family htdemucs`, backend CPU), PyTorch mediante `inference.py` de mss-training, y el plugin de DAW SpectroCraft a través de su nodo HTDemucs.
- Latencia y throughput: no disponibles en la información proporcionada; dependen del backend y de la duración del audio de entrada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / dominio | Stems | Licencia | Formato |
|---|---|---|---|---|---|
| HTDemucs Engine (este) | ~42 M | Audio 44,1 kHz estéreo, sonidos de motor sintéticos | whine, hiss, click, bump | MIT | GGUF, PyTorch |
| Demucs v4 (HTDemucs original, Meta) | ~80 M (v4) | Audio musical 44,1 kHz | vocals, drums, bass, other | MIT | PyTorch |
| Demucs v3 | ~80 M | Audio musical 44,1 kHz | vocals, drums, bass, other | MIT | PyTorch |
| Spleeter (Deezer) | ~variables | Audio musical 44,1 kHz | 2, 4 o 5 stems musicales | MIT | TensorFlow |

La comparación es aproximada: los modelos Demucs y Spleeter están orientados a separación musical y no ofrecen stems de motor. No se dispone de datos de benchmarks cruzados entre este modelo y las alternativas en la información proporcionada.

## Limitaciones y advertencias

- Brecha de dominio: entrenado exclusivamente con sonidos sintéticos de motor; grabaciones reales con timbres distintos, reverberación o fuentes solapadas se separarán con menor calidad.
- Clicks: los transitorios de duración inferior a un frame STFT solo se recuperan parcialmente; se esperan clicks atenuados y difuminados en lugar de reconstrucciones exactas (SDR +5,1 dB, SI-SDR +3,0 dB).
- Estéreo L=R: los datos de entrenamiento son mono duplicado; el modelo no aprende información espacial estéreo real. Conviene alimentar estéreo con canales idénticos.
- Frecuencia de muestreo fija a 44,1 kHz: los parámetros STFT y de forma están fijados a esa tasa; otras tasas requieren remuestreo previo.
- Riesgo de alucinación en sentido figurado: el modelo puede generar componentes espectrales espurios en stems donde no hay contenido real, especialmente en `click` y `hiss`, dado el enmascaramiento imperfecto.
- Sesgos: el dataset sintético está sesgado hacia los patrones procedurales concretos descritos en la model card (rampas de RPM, hum de 50/60 Hz, ruido de banda ancha); sonidos fuera de esa distribución pueden separarse mal.
- Licencia MIT: permite uso comercial sin restricciones, pero sin garantía alguna; los datos de entrenamiento son procedurales y no contienen material con derechos de autor.
- Advertencia de producción: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no hay pipeline declarado en Hugging Face; conviene validar el modelo con datos propios antes de integrarlo en un flujo crítico.

## Enlaces

- Hugging Face: https://huggingface.co/Super3dMax/htdemucs-whine-hiss-click-bump_v1
- Framework de entrenamiento (ZFTurbo/Music-Source-Separation-Training): https://github.com/ZFTurbo/Music-Source-Separation-Training
- Implementación GGUF para audio.cpp (0xShug0/audio.cpp): https://github.com/0xShug0/audio.cpp
- Paper de Demucs (A. Defossez, ICASSP 2021): no disponible como enlace en la información proporcionada
