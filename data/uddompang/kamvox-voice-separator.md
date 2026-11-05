# uddompang/kamvox-voice-separator

## Resumen

KamVox voice separator es un repositorio de modelos de separación de fuentes de audio (voz y fondo musical) empaquetados en formato ONNX para su ejecución en el navegador mediante `onnxruntime-web`. No se trata de un modelo de lenguaje, sino de dos redes de separación de espectrogramas derivadas de MDX-Net, originalmente distribuidas con Ultimate Vocal Remover (UVR). El autor, uddompang, no reentrena los pesos: los repaqueta y modifica únicamente las formas declaradas de entrada y salida para permitir un eje temporal libre.

El repositorio incluye dos modelos complementarios: `kim-vocal-2` (predice la voz) e `inst-hq-3` (predice el fondo instrumental). Ambos operan sobre espectrogramas STFT de 4 canales (parte real e imaginaria de cada canal estéreo) con 3072 bins de frecuencia, a 44,1 kHz estéreo, y se entrenaron originalmente con fragmentos de 256 frames. La innovación del empaquetado es permitir lotes de frames arbitrarios (múltiplos de 32) y ofrecer copias en fp16 para reducir la descarga a la mitad.

Es relevante para desarrolladores que necesiten separación vocal o eliminación de voz directamente en el cliente (navegador), sin backend, con WebAssembly o WebGPU, y con licencia MIT tanto del empaquetado como de los pesos originales. El tamaño del repositorio es de 0,2 GB y cada modelo pesa 66,8 MB en fp32 o 33,4 MB en fp16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MDX-Net (red convolucional sobre espectrograma STFT), exportada a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada `[batch, 4, 3072, frames]`, frames multiplo de 32 (entrenado a 256 frames) |
| Tipos de cuantizacion | fp32 y fp16 (ficheros `*.onnx` y `*.fp16.onnx`, entradas y salidas en float32) |
| Idiomas soportados | no disponible (modelo de audio, no linguistico) |
| Licencia | MIT |
| Formato de pesos | ONNX (onnxruntime-web) |
| Frecuencia de muestreo | 44,1 kHz estereo |
| n_fft | 7680 (`kim-vocal-2`), 6144 (`inst-hq-3`) |
| Hop | 1024 |
| dim_f | 3072 |
| Factor de compensacion | 1,009 (`kim-vocal-2`), 1,022 (`inst-hq-3`) |

## Arquitectura y entrenamiento

Los dos modelos son redes MDX-Net que operan en el dominio de la frecuencia: reciben un espectrograma STFT con ventana Hann periódica, `center=True`, padding reflectivo, bins 0..2 a cero y bins por encima de 3072 descartados, y predicen la máscara o espectrograma de la fuente objetivo. La entrada y la salida tienen forma `[batch, 4, 3072, frames]`, donde los 4 canales corresponden a (izquierda real, izquierda imaginaria, derecha real, derecha imaginaria). La otra fuente se obtiene por resta respecto a la mezcla original.

No hay reentrenamiento: los pesos son los originales de Kim Vocal 2 (Kimberley Jensen) y UVR-MDX-NET Inst HQ 3 (Anjok07 y aufr33), publicados con Ultimate Vocal Remover. Los cambios del empaquetado son dos: (1) eje temporal libre, sustituyendo la forma fija de 256 frames por `frames` variable múltiplo de 32, ya que el eje temporal solo atraviesa convoluciones y a 256 frames la salida coincide con la original; y (2) copias fp16 con entradas y salidas en float32 para reducir el tamaño de descarga. El repositorio incluye `config.json` con ajustes y hashes sha256, y un script `tools/separator-export/build.py` que reconstruye la carpeta y la verifica contra los ficheros originales.

## Capacidades

- Separación de voz: `kim-vocal-2` aísla la pista vocal a partir de una mezcla musical estéreo.
- Separación de fondo instrumental: `inst-hq-3` aísla la pista de acompañamiento.
- Obtención del stem complementario por resta (mezcla menos predicción).
- Ejecución en navegador mediante `onnxruntime-web` con WebAssembly o WebGPU.
- Procesamiento por fragmentos con solapamiento y overlap-add (implementado en Rust en `crates/kamsub/src/separate.rs` de KamVox, siguiendo la inferencia MDX de python-audio-separator).
- Entrada de frames variable (múltiplos de 32), lo que permite adaptar el tamaño de bloque a la memoria disponible.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente de audio.

## Casos de uso

- Eliminación de voz en el navegador para karaoke: cargar una canción estéreo, aplicar `kim-vocal-2` y reproducir la mezcla menos la predicción vocal, todo en cliente sin subir el audio a un servidor.
- Extracción de instrumentales para práctica musical: usar `inst-hq-3` para obtener la pista de acompañamiento y practicar sobre ella con latencia local y sin backend.
- Edición de audio en aplicaciones web: integrar el modelo en un editor que permita silenciar o atenuar la voz de una grabación antes de exportar, aprovechando WebGPU para acelerar la inferencia.
- Creación de remixes y mashups: separar voz y fondo de dos pistas y recombinarlas, con procesamiento por bloques de frames ajustado a la memoria del dispositivo.
- Limpieza de grabaciones de campo o entrevistas: atenuar música de fondo mediante `inst-hq-3` y quedarse con la voz predicha por `kim-vocal-2`, útil cuando no se dispone de infraestructura de servidor.
- Herramientas de accesibilidad y transcripción previa: reducir el acompañamiento musical antes de pasar el audio a un sistema de reconocimiento de voz, ejecutando la separación localmente en el navegador.
- Procesamiento por lotes offline en el cliente: descargar los ONNX fp16 (33,4 MB por modelo) y procesar varios ficheros en una aplicación de escritorio con `onnxruntime`, sin dependencia de servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas objetivas (SDR, SIR, SAR) ni comparaciones numéricas con otras implementaciones; solo indica que a 256 frames la salida coincide con la de los ficheros ONNX originales.

## Requisitos de hardware

- VRAM/RAM estimada: los ficheros pesan 66,8 MB (fp32) y 33,4 MB (fp16) por modelo; el consumo en ejecución depende del número de frames procesados por bloque y del backend, pero no se han publicado cifras concretas.
- GPU recomendadas: no disponible. El backend WebGPU puede aprovechar GPUs de navegador; el backend WebAssembly funciona en CPU.
- Cabe en GPU de consumo: sí, por el tamaño reducido de los pesos, aunque no se especifican requisitos mínimos de memoria ni GPUs concretas (RTX 4090, A100, etc.).
- Opciones de despliegue: `onnxruntime-web` (WebAssembly o WebGPU) en navegador; también puede ejecutarse con `onnxruntime` nativo fuera del navegador, ya que los ficheros son ONNX estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KamVox voice separator (este) | MDX-Net ONNX para navegador | no disponible | `[batch, 4, 3072, frames]`, frames múltiplo de 32 | MIT | HuggingFace, onnxruntime-web |
| UVR-MDX-NET Inst HQ 3 original | MDX-Net ONNX | no disponible | 256 frames fijos | MIT (UVR) | Repositorio de Ultimate Vocal Remover |
| Kim Vocal 2 original | MDX-Net ONNX | no disponible | 256 frames fijos | MIT (UVR) | Repositorio de Ultimate Vocal Remover |
| python-audio-separator (MDX) | Implementación de inferencia | no aplica | chunking configurable | MIT | PyPI / GitHub |

La comparativa se limita a las variantes originales de los mismos pesos, ya que no se dispone de datos de rendimiento de otros separadores (Demucs, Spleeter, etc.) en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes.
- Solo procesa audio estéreo a 44,1 kHz con el preprocesado STFT exacto descrito; usar otra frecuencia, ventana o número de bins produce resultados incorrectos.
- El eje temporal debe ser múltiplo de 32 frames; no se admiten bloques arbitrarios.
- La calidad de separación es la de los pesos originales de UVR; no se han publicado métricas que la cuantifiquen en este empaquetado.
- Riesgo de artefactos musicales (ruido residual, "musical noise") inherente a la separación en dominio espectral, especialmente en mezclas densas.
- Sesgos: no disponibles; al ser un modelo de audio, los sesgos dependerían de la distribución de los datos de entrenamiento originales, no documentada aquí.
- Licencia MIT, lo que permite uso comercial, pero se debe atribuir a Kimberley Jensen (Kim Vocal 2) y a Anjok07 y aufr33 (UVR-MDX-NET Inst HQ 3) según indica la model card.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria del empaquetado.
- La fecha de creación indicada (2026-11-05) es futura respecto a la información habitual; conviene verificar la vigencia del repositorio.

## Enlaces

- HuggingFace: https://huggingface.co/uddompang/kamvox-voice-separator
- Ultimate Vocal Remover (UVR): https://github.com/Anjok07/ultimatevocalremovergui
- KamVox Studio: https://kamvox.app
- python-audio-separator (referencia de inferencia MDX): no disponible en la información proporcionada
