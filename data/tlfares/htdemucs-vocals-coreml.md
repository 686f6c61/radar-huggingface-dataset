# tlfares/htdemucs-vocals-coreml

## Resumen

`tlfares/htdemucs-vocals-coreml` es una conversión a Core ML de la rama de voces de HTDemucs (Hybrid Transformer Demucs), el modelo de separación de fuentes musicales desarrollado por Meta AI y publicado originalmente en `facebookresearch/demucs`. El objetivo de esta conversión es permitir la separación de voces de una mezcla musical directamente en iPhone y iPad, aprovechando el runtime de Core ML y el hardware Apple (GPU y CPU), sin depender de un servidor externo ni de frameworks de Python.

Frente al modelo original, esta versión recorta el alcance: de las cuatro fuentes que separa HTDemucs (batería, bajo, otros y voces) solo se emite la pista de voces. Además, se han extraído del grafo las operaciones que Core ML no soporta de forma nativa: la STFT y su inversa se calculan fuera del modelo porque Core ML no maneja números complejos, y la normalización de entradas y salidas también se externaliza porque sus estadísticas desbordan en precisión media. El resultado es un artefacto de 33,5 MB comprimido (51 MB compilado) con cuantización por paletas de 6 bits.

La relevancia de esta ficha es acotada pero concreta: no es un modelo nuevo ni un LLM, sino un artefacto de despliegue para una tarea de audio (separación de voces) en el ecosistema Apple. Es útil para desarrolladores de apps de iOS/iPadOS que necesiten karaoke, remezcla o aislamiento de voces en el dispositivo, y sirve como referencia de las concesiones técnicas (precisión, operaciones externalizadas, soporte limitado de Neural Engine) que implica portar un modelo de audio a Core ML.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | HTDemucs (Hybrid Transformer Demucs), rama de voces; grafo convertido a Core ML |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de audio de 7,8 s a 44,1 kHz estéreo (343.980 muestras) |
| Tipos de cuantización | paletización de 6 bits (k-means, agrupada por canal, tamaño de grupo 16); fp16 con `reduce_mean` y `square` en fp32 |
| Idiomas soportados | no disponible (modelo de audio, independiente del idioma) |
| Licencia | MIT |
| Formato de pesos | Core ML: `SingAlongModel.aar` (Apple Archive LZFSE) que contiene `Vocals.mlmodelc` compilado |

## Arquitectura y entrenamiento

El modelo subyacente es HTDemucs, presentado por Rouard, Massa y Défossez en *Hybrid Transformers for Music Source Separation* (ICASSP 2023). Se trata de una arquitectura híbrida que combina un encoder/decoder convolucional en el dominio de la forma de onda con un transformer que opera sobre representaciones espectrales, lo que permite modelar dependencias de largo alcance en la mezcla. El modelo original separa cuatro fuentes; esta conversión conserva únicamente la salida de voces.

La conversión a Core ML introduce varios cambios técnicos respecto al original. Primero, la STFT (n_fft 4096, hop 1024, ventana Hann, modo `normalized`) y su inversa se calculan fuera del modelo, ya que Core ML no soporta números complejos. Segundo, la normalización se aplica antes de la inferencia y la desnormalización después, porque las estadísticas internas desbordan en media precisión. Tercero, se usa precisión mixta (fp16, con `reduce_mean` y `square` en fp32) y paletización de 6 bits agrupada por canal. No se dispone de información sobre el dataset de entrenamiento, el número de tokens o las etapas de ajuste del modelo original en la información proporcionada.

## Capacidades

- Separación de la pista de voces a partir de una mezcla musical estéreo, en el dispositivo (iPhone/iPad) mediante Core ML.
- Procesamiento por segmentos de 7,8 s a 44,1 kHz estéreo, con solapamiento de un cuarto y mezcla mediante pesos triangulares para audio de mayor duración, siguiendo el esquema `apply_model` de Demucs.
- Entrada dual: forma de onda (`mix`) y espectrograma precalculado (`spec`), ambos normalizados externamente.
- Salida dual: espectrograma de voces (`freq`) y forma de onda de voces (`time`), que se combinan mediante STFT inversa externa.
- Inferencia en GPU y CPU de Apple con un SDR de aproximadamente 25 dB respecto al modelo fp32 original.
- No soporta Neural Engine: desborda en media precisión en ese backend.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües; es un modelo de audio puro.

## Casos de uso

- Karaoke en apps de iOS/iPadOS: la app captura o carga una canción, ejecuta el modelo por segmentos de 7,8 s con solapamiento y reproduce la mezcla sin voces, todo en el dispositivo y sin subir audio a un servidor.
- Aislamiento de voces para remezcla o edición: un editor de audio móvil puede extraer la pista vocal para aplicar efectos, afinar o samplear, aprovechando que el artefacto de 33,5 MB cabe en el bundle de la app.
- Creación de clips a capela: extracción de la voz para generar versiones instrumentales o vocales de una canción en un flujo de producción musical móvil.
- Análisis musical y musicología computacional: separar voces para estudiar melodía, letra o prosodia en grabaciones, ejecutando el modelo localmente en un iPad para preservar la privacidad del material.
- Filtrado de ruido vocal en grabaciones en directo: usar la pista de voces separada como señal de referencia para tareas de mejora o reducción de ruido en apps de grabación.
- Prototipado de pipelines de separación en Apple Silicon: validar la integración Core ML (pre/post-proceso de STFT y normalización) antes de portar otras ramas de Demucs o modelos mayores.
- Accesibilidad y subtitulado asistido: aislar voces para mejorar la transcripción automática de canciones o contenido audiovisual en dispositivos Apple.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| SDR frente al modelo fp32 original | ~25 dB (GPU y CPU) |
| Soporte de Neural Engine | no soportado (desbordamiento en media precisión) |
| Tamaño del artefacto | 33,5 MB (archivo), 51 MB (compilado) |

No se han publicado resultados de benchmarks estándar de separación de fuentes (SDR/SIR/SAR sobre MUSDB18 u otros conjuntos) en la información disponible.

## Requisitos de hardware

- Ejecución en iPhone y iPad con soporte de Core ML; el modelo no funciona en Neural Engine y debe ejecutarse en GPU o CPU.
- VRAM/RAM estimada: no disponible; el artefacto compilado ocupa 51 MB, por lo que la huella de memoria del modelo es reducida, pero no se especifica el consumo en inferencia.
- GPU recomendadas: GPU integrada de Apple en iPhone/iPad; no aplica a A100, H100 ni RTX 4090 porque el formato es Core ML.
- No cabe ni está pensado para GPUs de escritorio NVIDIA; el despliegue es exclusivamente en el ecosistema Apple.
- Opciones de despliegue: Core ML en apps iOS/iPadOS; el `.aar` se desempaqueta con `aa extract -d . -i SingAlongModel.aar` o el framework AppleArchive.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/ventana | Salidas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tlfares/htdemucs-vocals-coreml` | no disponible | 7,8 s a 44,1 kHz | solo voces | MIT | Core ML (Apple) |
| HTDemucs original (Meta AI) | no disponible | segmentos configurables | 4 fuentes (batería, bajo, otros, voces) | MIT | PyTorch (`facebookresearch/demucs`) |
| Demucs v3/v4 (Meta AI) | no disponible | segmentos configurables | 4 fuentes | MIT | PyTorch |
| Spleeter (Deezer) | no disponible | segmentos configurables | 2 o 4 fuentes | MIT | TensorFlow |

La comparación se limita a la familia Demucs y a Spleeter; no se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Solo genera la pista de voces; no separa batería, bajo ni otros instrumentos, a diferencia de HTDemucs original.
- Requiere implementar fuera del modelo la STFT, la STFT inversa y la normalización/desnormalización; un uso incorrecto de estas etapas degrada la calidad de salida.
- El Neural Engine no es compatible: si la app intenta ejecutar el modelo en ese backend, se producirán desbordamientos en media precisión.
- La cuantización de 6 bits y la precisión mixta introducen una pérdida de calidad respecto al fp32 original (SDR ~25 dB), aceptable para consumo pero no para masterización.
- El procesamiento por segmentos con solapamiento de un cuarto implica coste computacional adicional y posibles artefactos en las uniones si no se respetan los pesos triangulares.
- No se dispone de información sobre sesgos, alucinaciones (no aplica a un modelo de audio) ni limitaciones idiomáticas.
- La licencia MIT permite uso comercial, pero se debe conservar el aviso de copyright de Meta Platforms, Inc. y affiliates.
- No hay datos publicados de latencia, throughput ni consumo energético en dispositivos concretos.

## Enlaces

- Hugging Face: https://huggingface.co/tlfares/htdemucs-vocals-coreml
- Repositorio original de Demucs: https://github.com/facebookresearch/demucs
- Paper HTDemucs (ICASSP 2023): *Hybrid Transformers for Music Source Separation*, Rouard, Massa y Défossez (referenciado en la model card; no se proporciona URL directa en la información disponible)
